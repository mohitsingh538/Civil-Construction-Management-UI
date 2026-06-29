export interface PreprocessOptions {
  maxSide?: number;
  jpegQuality?: number;
  autoRotate?: boolean;
  normalizeBrightness?: boolean;
  perspectiveCorrect?: boolean;
}

export interface PreprocessResult {
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
  mimeType: 'image/jpeg';
}

const DEFAULT_MAX_SIDE = 1280;
const DEFAULT_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function estimateSkewAngle(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const { data } = ctx.getImageData(0, 0, w, h);
  let sum = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y += 4) {
    for (let x = 1; x < w - 1; x += 4) {
      const i = (y * w + x) * 4;
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      if (lum < 200) {
        sum += x;
        count++;
      }
    }
  }
  if (count < 50) return 0;
  const centroid = sum / count;
  return ((centroid / w) - 0.5) * 0.08;
}

function normalizeBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;
  let sum = 0;
  const pixels = w * h;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  const mean = sum / pixels;
  const target = 128;
  const gain = target / Math.max(mean, 1);
  const clampedGain = Math.min(1.35, Math.max(0.75, gain));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * clampedGain);
    data[i + 1] = Math.min(255, data[i + 1] * clampedGain);
    data[i + 2] = Math.min(255, data[i + 2] * clampedGain);
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Canvas-based preprocessing — runs off main inference path; yields compressed JPEG.
 */
export async function preprocessInvoiceImage(
  input: string | Blob | File,
  options: PreprocessOptions = {},
): Promise<PreprocessResult> {
  const maxSide = options.maxSide ?? DEFAULT_MAX_SIDE;
  const quality = options.jpegQuality ?? DEFAULT_QUALITY;

  let objectUrl: string | null = null;
  let src: string;
  if (typeof input === 'string') {
    src = input;
  } else {
    objectUrl = URL.createObjectURL(input);
    src = objectUrl;
  }

  try {
    const img = await loadImage(src);
    let { width, height } = img;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas not supported');

    if (options.autoRotate !== false && img.width > img.height * 1.2) {
      canvas.width = height;
      canvas.height = width;
      ctx.translate(height, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }

    if (options.normalizeBrightness !== false) {
      normalizeBrightness(ctx, canvas.width, canvas.height);
    }

    if (options.perspectiveCorrect) {
      const angle = estimateSkewAngle(ctx, canvas.width, canvas.height);
      if (Math.abs(angle) > 0.01) {
        const corrected = document.createElement('canvas');
        corrected.width = canvas.width;
        corrected.height = canvas.height;
        const cctx = corrected.getContext('2d')!;
        cctx.translate(canvas.width / 2, canvas.height / 2);
        cctx.rotate(angle);
        cctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(corrected, 0, 0);
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1] ?? '';
    return {
      dataUrl,
      base64,
      width: canvas.width,
      height: canvas.height,
      mimeType: 'image/jpeg',
    };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export function base64ToBlob(base64: string, mime = 'image/jpeg'): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
