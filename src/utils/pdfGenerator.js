import { jsPDF } from 'jspdf';
import { loadImage } from './imageUtils.js';

/**
 * Standard page size dimensions in millimeters
 */
const PAGE_DIMENSIONS = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
};

/**
 * Generates a PDF from an array of image items.
 * 
 * @param {Array<{ id: string, dataUrl: string, name?: string }>} images
 * @param {Object} options
 * @param {'a4' | 'letter' | 'legal'} [options.pageSize='a4']
 * @param {'portrait' | 'landscape' | 'auto'} [options.orientation='portrait']
 * @param {number} [options.margin=10] - Margin in millimeters
 * @param {'low' | 'medium' | 'high'} [options.quality='high']
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{ blob: Blob, blobUrl: string, doc: jsPDF }>}
 */
export async function generatePdfFromImages(images, options = {}, onProgress = null) {
  if (!images || images.length === 0) {
    throw new Error('No images provided for PDF generation');
  }

  const {
    pageSize = 'a4',
    orientation = 'portrait',
    margin = 10,
    quality = 'high',
  } = options;

  // Determine compression quality parameter
  let imageCompression = 'MEDIUM';
  if (quality === 'low') {
    imageCompression = 'FAST';
  } else if (quality === 'high') {
    imageCompression = 'SLOW'; // High fidelity
  }

  // Pre-load all images to verify and get dimensions
  const loadedImages = [];
  for (let i = 0; i < images.length; i++) {
    const imgItem = images[i];
    const htmlImg = await loadImage(imgItem.dataUrl);
    loadedImages.push({
      img: htmlImg,
      dataUrl: imgItem.dataUrl,
      width: htmlImg.naturalWidth,
      height: htmlImg.naturalHeight,
    });
    if (onProgress) {
      onProgress(Math.round(((i + 1) / images.length) * 40));
    }
  }

  // Determine first page orientation
  const baseDim = PAGE_DIMENSIONS[pageSize] || PAGE_DIMENSIONS.a4;
  let firstOrientation = orientation;
  if (orientation === 'auto') {
    firstOrientation = loadedImages[0].width > loadedImages[0].height ? 'landscape' : 'portrait';
  }

  const doc = new jsPDF({
    orientation: firstOrientation,
    unit: 'mm',
    format: pageSize,
    compress: true,
  });

  for (let i = 0; i < loadedImages.length; i++) {
    if (i > 0) {
      // Determine orientation for subsequent pages
      let pageOrientation = orientation;
      if (orientation === 'auto') {
        pageOrientation = loadedImages[i].width > loadedImages[i].height ? 'landscape' : 'portrait';
      }
      doc.addPage(pageSize, pageOrientation);
    }

    // Get current page size in mm
    const currentPageWidth = doc.internal.pageSize.getWidth();
    const currentPageHeight = doc.internal.pageSize.getHeight();

    // Usable printable area with margins
    const usableWidth = Math.max(10, currentPageWidth - margin * 2);
    const usableHeight = Math.max(10, currentPageHeight - margin * 2);

    const img = loadedImages[i];
    const imgAspect = img.width / img.height;
    const pageAspect = usableWidth / usableHeight;

    let renderWidth, renderHeight, posX, posY;

    if (imgAspect > pageAspect) {
      // Image is wider relative to page -> fit to width
      renderWidth = usableWidth;
      renderHeight = usableWidth / imgAspect;
      posX = margin;
      posY = margin + (usableHeight - renderHeight) / 2;
    } else {
      // Image is taller relative to page -> fit to height
      renderHeight = usableHeight;
      renderWidth = usableHeight * imgAspect;
      posX = margin + (usableWidth - renderWidth) / 2;
      posY = margin;
    }

    // Determine format
    const format = img.dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

    doc.addImage(
      img.dataUrl,
      format,
      posX,
      posY,
      renderWidth,
      renderHeight,
      undefined,
      imageCompression
    );

    if (onProgress) {
      onProgress(40 + Math.round(((i + 1) / loadedImages.length) * 60));
    }
  }

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return { blob, blobUrl, doc };
}

/**
 * Downloads a blob as a file.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadPdfBlob(blob, filename = 'document.pdf') {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Prints a PDF Blob in an invisible iframe
 * @param {Blob|string} pdfBlobOrUrl
 */
export function printPdf(pdfBlobOrUrl) {
  const url = typeof pdfBlobOrUrl === 'string' ? pdfBlobOrUrl : URL.createObjectURL(pdfBlobOrUrl);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.src = url;

  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      // Fallback: open in new tab if iframe print is restricted
      window.open(url, '_blank');
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 60000);
  };
}
