import * as pdfjsLib from 'pdfjs-dist';

// Use a reliable CDN for the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
  const page = await pdf.getPage(pageNum);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
};

export const findPagesWithText = async (file: File, searchText: string): Promise<number[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const matchingPages: number[] = [];

  for (let i = 1; i <= numPages; i++) {
    const text = await extractTextFromPage(pdf, i);
    if (text.toLowerCase().includes(searchText.toLowerCase())) {
      matchingPages.push(i);
    }
  }

  return matchingPages;
};

export const rasterizePageToBlob = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number = 2): Promise<Blob> => {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport } as any).promise;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to Blob failed'));
    }, 'image/jpeg', 0.9);
  });
};

export const detectWhiteBorders = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<{ x: number, y: number, width: number, height: number } | null> => {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 }); // Use scale 1 for actual PDF coordinates
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport } as any).promise;
  
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  let hasContent = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // If not white (assuming white is > 250 for RGB and alpha > 0)
      if (a > 0 && (r < 250 || g < 250 || b < 250)) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasContent) return null;

  // Add a small padding (e.g., 5 pixels)
  const padding = 5;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(canvas.width, maxX + padding);
  maxY = Math.min(canvas.height, maxY + padding);

  return {
    x: minX,
    y: minY, // In PDF, y is from bottom, but canvas y is from top. We'll handle this in pdf-lib.
    width: maxX - minX,
    height: maxY - minY
  };
};
