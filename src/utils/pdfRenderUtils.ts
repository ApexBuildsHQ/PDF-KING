import * as pdfjsLib from 'pdfjs-dist';

// Set worker path as requested
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

export async function renderPdfPageToDataUrl(file: File, pageNumber: number, scale: number = 1.0): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    disableFontFace: true,
    verbosity: 0
  }).promise;
  
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Could not get canvas context');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  } as any).promise;
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

export async function renderPdfPageToBlobUrl(file: File, pageNumber: number, scale: number = 1.0): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    disableFontFace: true,
    verbosity: 0
  }).promise;
  
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Could not get canvas context');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  } as any).promise;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        reject(new Error('Canvas to Blob failed'));
      }
    }, 'image/jpeg', 0.8);
  });
}

export async function extractTextFromPage(file: File, pageNumber: number): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    disableFontFace: true,
    verbosity: 0
  }).promise;
  
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
}
