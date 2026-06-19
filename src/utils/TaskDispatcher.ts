import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import qpdfWasm from '@neslinesli93/qpdf-wasm';
import { extractTextFromPage, rasterizePageToBlob, detectWhiteBorders } from './pdfUtils';
import * as pdfjsLib from 'pdfjs-dist';

export type TaskType = 'merge' | 'split' | 'organize' | 'rotate' | 'extract' | 'crop' | 'flatten' | 'ocr';

export interface TaskPayload {
  files: File[];
  options?: any;
  onProgress?: (progress: number) => void;
}

export class HybridTaskDispatcher {
  static async dispatch(taskType: TaskType, payload: TaskPayload): Promise<Blob | null> {
    const { files, options, onProgress } = payload;
    
    // Fast Tasks -> pdf-lib
    if (['merge', 'split', 'organize', 'rotate', 'extract'].includes(taskType)) {
      return this.executeFastTask(taskType, payload);
    }
    
    // Complex Tasks -> WASM Engine & pdfjs-dist
    if (['crop', 'flatten', 'ocr'].includes(taskType)) {
      return this.executeHeavyTask(taskType, payload);
    }
    
    throw new Error(`Unknown task type: ${taskType}`);
  }

  private static parseRange(rangeStr: string, maxPages: number): number[] {
    if (!rangeStr || rangeStr.toLowerCase() === 'all') {
      return Array.from({ length: maxPages }, (_, i) => i);
    }
    const pageIndices: number[] = [];
    const parts = rangeStr.split(',').map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start && start <= maxPages) {
          const actualEnd = Math.min(end, maxPages);
          for (let i = start; i <= actualEnd; i++) pageIndices.push(i - 1);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num > 0 && num <= maxPages) {
          pageIndices.push(num - 1);
        }
      }
    }
    return Array.from(new Set(pageIndices)).sort((a, b) => a - b);
  }

  private static async executeFastTask(taskType: TaskType, payload: TaskPayload): Promise<Blob | null> {
    const { files, options, onProgress } = payload;
    
    if (taskType === 'merge') {
      const mergedPdf = await PDFDocument.create();
      let totalBytesProcessed = 0;
      const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const rangeStr = options?.pageRanges?.[i] || 'all';
        const indices = this.parseRange(rangeStr, pdf.getPageCount());
        
        const copiedPages = await mergedPdf.copyPages(pdf, indices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        totalBytesProcessed += file.size;
        onProgress?.(Math.round((totalBytesProcessed / totalBytes) * 80));
      }
      
      onProgress?.(90);
      const pdfBytes = await mergedPdf.save();
      onProgress?.(100);
      return new Blob([pdfBytes], { type: 'application/pdf' });
    }
    
    // For single file operations
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(10);
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    onProgress?.(20);

    if (taskType === 'split') {
      const zip = new JSZip();
      const totalPages = pdfDoc.getPageCount();

      if (options.splitMode === 'extract_all') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const bytes = await newPdf.save();
          zip.file(`page_${i + 1}.pdf`, bytes);
          onProgress?.(20 + Math.round(((i + 1) / totalPages) * 60));
        }
        onProgress?.(85);
        return await zip.generateAsync({ type: 'blob' });
      } else if (options.splitMode === 'size') {
        // Estimate size per page
        const totalSize = file.size;
        const avgPageSize = totalSize / totalPages;
        const targetSize = (options.splitSizeMB || 2) * 1024 * 1024;
        const pagesPerSplit = Math.max(1, Math.floor(targetSize / avgPageSize));
        
        let part = 1;
        for (let i = 0; i < totalPages; i += pagesPerSplit) {
          const newPdf = await PDFDocument.create();
          const end = Math.min(i + pagesPerSplit, totalPages);
          const indices = Array.from({ length: end - i }, (_, idx) => i + idx);
          const copiedPages = await newPdf.copyPages(pdfDoc, indices);
          copiedPages.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          zip.file(`part_${part}.pdf`, bytes);
          part++;
          onProgress?.(20 + Math.round((end / totalPages) * 60));
        }
        onProgress?.(85);
        return await zip.generateAsync({ type: 'blob' });
      } else if (options.splitMode === 'text') {
        const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let currentSplitStart = 0;
        let part = 1;
        
        for (let i = 1; i <= totalPages; i++) {
          const text = await extractTextFromPage(pdfjsDoc, i);
          if (text.toLowerCase().includes(options.splitText.toLowerCase()) && i > 1) {
            // Split here
            const newPdf = await PDFDocument.create();
            const indices = Array.from({ length: (i - 1) - currentSplitStart }, (_, idx) => currentSplitStart + idx);
            if (indices.length > 0) {
              const copiedPages = await newPdf.copyPages(pdfDoc, indices);
              copiedPages.forEach(p => newPdf.addPage(p));
              const bytes = await newPdf.save();
              zip.file(`part_${part}.pdf`, bytes);
              part++;
            }
            currentSplitStart = i - 1;
          }
          onProgress?.(20 + Math.round((i / totalPages) * 60));
        }
        
        // Add remaining pages
        if (currentSplitStart < totalPages) {
          const newPdf = await PDFDocument.create();
          const indices = Array.from({ length: totalPages - currentSplitStart }, (_, idx) => currentSplitStart + idx);
          const copiedPages = await newPdf.copyPages(pdfDoc, indices);
          copiedPages.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          zip.file(`part_${part}.pdf`, bytes);
        }
        
        onProgress?.(85);
        return await zip.generateAsync({ type: 'blob' });
      } else {
        // Custom ranges
        const indices = this.parseRange(options.pageRange, totalPages);
        if (indices.length === 0) throw new Error('Invalid page range');
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach(p => newPdf.addPage(p));
        onProgress?.(70);
        const bytes = await newPdf.save();
        onProgress?.(100);
        return new Blob([bytes], { type: 'application/pdf' });
      }
    } else if (taskType === 'organize') {
      const newPdf = await PDFDocument.create();
      
      // options.pages contains { fileIndex, originalIndex, rotation }
      const loadedPdfs = [pdfDoc];
      
      // Load external files if any
      for (let i = 1; i < files.length; i++) {
        const buf = await files[i].arrayBuffer();
        loadedPdfs.push(await PDFDocument.load(buf));
      }
      
      for (let i = 0; i < options.pages.length; i++) {
        const p = options.pages[i];
        const sourcePdf = loadedPdfs[p.fileIndex || 0];
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [p.originalIndex]);
        
        if (p.rotation) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + p.rotation));
        }
        
        newPdf.addPage(copiedPage);
        onProgress?.(20 + Math.round(((i + 1) / options.pages.length) * 60));
      }
      onProgress?.(85);
      const bytes = await newPdf.save();
      onProgress?.(100);
      return new Blob([bytes], { type: 'application/pdf' });
    }

    return null;
  }

  private static async executeHeavyTask(taskType: TaskType, payload: TaskPayload): Promise<Blob | null> {
    const { files, options, onProgress } = payload;
    const file = files[0];
    
    onProgress?.(10);
    const arrayBuffer = await file.arrayBuffer();
    
    if (taskType === 'flatten') {
      // Rasterize all pages to images using pdfjs-dist, then create new PDF
      const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfjsDoc.numPages;
      const newPdf = await PDFDocument.create();
      
      for (let i = 1; i <= numPages; i++) {
        const blob = await rasterizePageToBlob(pdfjsDoc, i, 2); // Scale 2 for better quality
        const imageBytes = await blob.arrayBuffer();
        const image = await newPdf.embedJpg(imageBytes); // Assuming rasterizePageToBlob returns JPEG
        
        const page = newPdf.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
        
        onProgress?.(10 + Math.round((i / numPages) * 70));
      }
      
      onProgress?.(85);
      const bytes = await newPdf.save();
      onProgress?.(100);
      return new Blob([bytes], { type: 'application/pdf' });
      
    } else if (taskType === 'crop') {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();
      
      if (options.autoTrim) {
        const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 0; i < pdfPages.length; i++) {
          const page = pdfPages[i];
          const bbox = await detectWhiteBorders(pdfjsDoc, i + 1);
          
          if (bbox) {
            const { width, height } = page.getSize();
            // pdfjs canvas y is from top, pdf-lib y is from bottom
            page.setCropBox(bbox.x, height - bbox.y - bbox.height, bbox.width, bbox.height);
          }
          onProgress?.(10 + Math.round(((i + 1) / pdfPages.length) * 70));
        }
      } else {
        // Manual crop
        pdfPages.forEach(page => {
          const { width, height } = page.getSize();
          const marginX = width * (options.cropMargin / 100);
          const marginY = height * (options.cropMargin / 100);
          page.setCropBox(marginX, marginY, width - marginX * 2, height - marginY * 2);
        });
        onProgress?.(80);
      }
      
      const bytes = await pdfDoc.save();
      onProgress?.(100);
      return new Blob([bytes], { type: 'application/pdf' });
    }

    return null;
  }
}
