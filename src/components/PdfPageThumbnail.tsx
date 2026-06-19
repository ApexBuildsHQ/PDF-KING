import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Trash2 } from 'lucide-react';

// Set worker path using unpkg for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Concurrency control: Render 3 pages at a time
const MAX_CONCURRENT_RENDERS = 3;
let activeRenders = 0;
const renderQueue: (() => void)[] = [];

const processQueue = () => {
  if (activeRenders < MAX_CONCURRENT_RENDERS && renderQueue.length > 0) {
    const nextTask = renderQueue.shift();
    if (nextTask) {
      activeRenders++;
      nextTask();
    }
  }
};

const enqueueRender = (task: () => Promise<void>) => {
  renderQueue.push(async () => {
    try {
      await task();
    } catch (error) {
      console.error('Render task failed:', error);
    } finally {
      activeRenders--;
      processQueue();
    }
  });
  processQueue();
};

// Caches
const thumbnailCache = new Map<string, string>();
const pdfDocumentCache = new Map<string, Promise<pdfjsLib.PDFDocumentProxy>>();

export const clearThumbnailCache = () => {
  thumbnailCache.clear();
  pdfDocumentCache.forEach(promise => {
    promise.then(pdf => pdf.destroy()).catch(() => {});
  });
  pdfDocumentCache.clear();
};

const getPdfDocument = (pdfUrl: string): Promise<pdfjsLib.PDFDocumentProxy> => {
  if (pdfDocumentCache.has(pdfUrl)) {
    return pdfDocumentCache.get(pdfUrl)!;
  }

  const promise = (async () => {
    // Fetch as ArrayBuffer to avoid CORS issues with canvas tainting
    const response = await fetch(pdfUrl);
    const arrayBuffer = await response.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      disableFontFace: true,
      verbosity: 0
    });
    return await loadingTask.promise;
  })();

  pdfDocumentCache.set(pdfUrl, promise);
  return promise;
};

interface PdfPageThumbnailProps {
  pdfUrl: string;
  pageNumber: number;
  rotation: number;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export default function PdfPageThumbnail({
  pdfUrl,
  pageNumber,
  rotation,
  selected,
  onClick,
  onDelete
}: PdfPageThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `${pdfUrl}-${pageNumber}`;

    if (thumbnailCache.has(cacheKey)) {
      setImgSrc(thumbnailCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    const renderPage = async () => {
      if (!isMounted) return;
      try {
        const pdf = await getPdfDocument(pdfUrl);
        const page = await pdf.getPage(pageNumber);

        if (!isMounted) return;

        // Scale 0.3 to 0.5 is usually good for thumbnails
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext as any).promise;
        
        if (isMounted) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          thumbnailCache.set(cacheKey, dataUrl);
          setImgSrc(dataUrl);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error rendering PDF page:', error);
          setLoading(false);
        }
      }
    };

    enqueueRender(renderPage);

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, pageNumber]);

  return (
    <div 
      className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${
        selected ? 'border-red-500 shadow-md shadow-red-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <div 
        className="bg-white shadow-sm flex items-center justify-center overflow-hidden"
        style={{ width: 150, height: 200 }}
      >
        {loading || !imgSrc ? (
          <div className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        ) : (
          <img 
            src={imgSrc} 
            alt={`Page ${pageNumber}`}
            className="max-w-full max-h-full object-contain transition-all duration-500 ease-in-out animate-in fade-in"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 flex justify-between items-center">
        <span>{pageNumber}</span>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
