import type { ModelManifest } from '../types';

/** Production manifest — point `VITE_AI_MODEL_CDN_BASE` at your CDN before release. */
export const PADDLEOCR_VL_MODEL_MANIFEST: ModelManifest = {
  version: '1.5.0-int8',
  minAppVersion: '1.0.0',
  approximateSizeBytes: 428_000_000,
  quantization: 'int8',
  files: [
    {
      name: 'paddleocr_vl_encoder_int8.onnx',
      url: 'paddleocr_vl_encoder_int8.onnx',
      sha256: 'REPLACE_WITH_SHA256',
      sizeBytes: 312_000_000,
    },
    {
      name: 'paddleocr_vl_decoder_int8.onnx',
      url: 'paddleocr_vl_decoder_int8.onnx',
      sha256: 'REPLACE_WITH_SHA256',
      sizeBytes: 98_000_000,
    },
    {
      name: 'tokenizer.json',
      url: 'tokenizer.json',
      sha256: 'REPLACE_WITH_SHA256',
      sizeBytes: 18_000_000,
    },
  ],
};

/**
 * Bundled demo install (no network). Used when CDN is not configured.
 * Native copies from `assets/paddleocr-demo/`; web stub simulates progress.
 */
export const DEMO_MODEL_MANIFEST: ModelManifest = {
  version: '1.5.0-int8-demo',
  minAppVersion: '1.0.0',
  approximateSizeBytes: 256,
  quantization: 'int8',
  files: [
    {
      name: 'paddleocr_vl_encoder_int8.onnx',
      url: 'demo://paddleocr-demo/paddleocr_vl_encoder_int8.onnx',
      sha256: 'SKIP',
      sizeBytes: 24,
    },
    {
      name: 'paddleocr_vl_decoder_int8.onnx',
      url: 'demo://paddleocr-demo/paddleocr_vl_decoder_int8.onnx',
      sha256: 'SKIP',
      sizeBytes: 24,
    },
    {
      name: 'tokenizer.json',
      url: 'demo://paddleocr-demo/tokenizer.json',
      sha256: 'SKIP',
      sizeBytes: 168,
    },
  ],
};

export const MODEL_STORAGE_DIR = 'ai-invoice-models';
export const MODEL_META_FILE = 'model-meta.json';

function withCdnBase(manifest: ModelManifest, cdnBase: string): ModelManifest {
  const base = cdnBase.replace(/\/$/, '');
  return {
    ...manifest,
    files: manifest.files.map((f) => ({
      ...f,
      url: f.url.startsWith('http') ? f.url : `${base}/${f.name}`,
    })),
  };
}

/** Hugging Face layout: lbm364dl/PaddleOCR-VL-1.5-ONNX */
function resolveHuggingFaceManifest(cdnBase: string): ModelManifest {
  const base = cdnBase.replace(/\/$/, '');
  return {
    version: '1.5.0-hf-onnx',
    minAppVersion: '1.0.0',
    approximateSizeBytes: 1_040_000_000,
    quantization: 'int8',
    files: [
      {
        name: 'vision_encoder.onnx',
        url: `${base}/onnx/vision_encoder.onnx`,
        sha256: 'SKIP',
        sizeBytes: 386_709_887,
      },
      {
        name: 'decoder_model_merged.onnx',
        url: `${base}/onnx/decoder_model_merged.onnx`,
        sha256: 'SKIP',
        sizeBytes: 226_684_704,
      },
      {
        name: 'embed_tokens.onnx',
        url: `${base}/onnx/embed_tokens.onnx`,
        sha256: 'SKIP',
        sizeBytes: 423_625_114,
      },
      {
        name: 'tokenizer.json',
        url: `${base}/tokenizer.json`,
        sha256: 'SKIP',
        sizeBytes: 11_189_060,
      },
    ],
  };
}

/** Picks production CDN manifest or offline demo bundle. */
export function resolveModelManifest(): ModelManifest {
  const cdnBase = import.meta.env.VITE_AI_MODEL_CDN_BASE as string | undefined;
  if (cdnBase && cdnBase.length > 0 && !cdnBase.includes('example.com')) {
    if (cdnBase.includes('huggingface.co')) {
      return resolveHuggingFaceManifest(cdnBase);
    }
    return withCdnBase(PADDLEOCR_VL_MODEL_MANIFEST, cdnBase);
  }
  return DEMO_MODEL_MANIFEST;
}

export function isDemoManifest(manifest: ModelManifest): boolean {
  return manifest.version.endsWith('-demo') || manifest.files.some((f) => f.url.startsWith('demo://'));
}
