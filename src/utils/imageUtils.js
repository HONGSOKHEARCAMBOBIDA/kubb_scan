/**
 * Utility functions for client-side image manipulation using HTML5 Canvas.
 */

/**
 * Loads an image from a data URL or object URL.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Reads a File object as a Data URL (base64).
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Rotates an image by degrees (e.g. 90, -90, 180) and returns a new data URL.
 * @param {string} dataUrl
 * @param {number} degrees (multiple of 90)
 * @param {number} quality (0.1 to 1.0)
 * @returns {Promise<string>}
 */
export async function rotateImageDataURL(dataUrl, degrees = 90, quality = 0.92) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const normalizedDegrees = ((degrees % 360) + 360) % 360;

  if (normalizedDegrees === 90 || normalizedDegrees === 270) {
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
  } else {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((normalizedDegrees * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Applies a document filter to an image data URL (e.g., CamScanner Magic Color, B&W, Grayscale).
 * @param {string} dataUrl
 * @param {'original' | 'magic' | 'bw' | 'grayscale'} filterType
 * @param {number} quality
 * @returns {Promise<string>}
 */
export async function applyImageFilter(dataUrl, filterType = 'original', quality = 0.92) {
  if (filterType === 'original') return dataUrl;

  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  if (filterType === 'grayscale') {
    for (let i = 0; i < len; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
  } else if (filterType === 'bw') {
    // High contrast black & white document thresholding
    for (let i = 0; i < len; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Adaptive threshold: text darkens, background bleaches white
      const val = gray < 135 ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  } else if (filterType === 'magic') {
    // CamScanner-like "Magic Color": boost lightness in bright areas, enhance contrast & sharpness for text
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // S-curve contrast boost
      const boost = (val) => {
        let normalized = val / 255;
        if (normalized > 0.6) {
          // Brighten paper background towards pure white
          normalized = Math.min(1, normalized + 0.18);
        } else if (normalized < 0.45) {
          // Deepen ink / text
          normalized = Math.max(0, normalized * 0.85);
        }
        return Math.min(255, Math.max(0, normalized * 255));
      };

      data[i] = boost(r);
      data[i + 1] = boost(g);
      data[i + 2] = boost(b);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Resize / compress image data URL
 * @param {string} dataUrl
 * @param {number} quality (0.1 - 1.0)
 * @param {number} maxDimension
 * @returns {Promise<string>}
 */
export async function compressImageDataURL(dataUrl, quality = 0.85, maxDimension = 2400) {
  const img = await loadImage(dataUrl);
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}
