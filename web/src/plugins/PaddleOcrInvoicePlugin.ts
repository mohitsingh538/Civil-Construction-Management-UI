import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import type {
  DownloadProgressEvent,
  ModelInstallState,
  NativeInvoiceInferenceResult,
  ParsedInvoice,
} from '@core/ai-invoice';

export interface ProcessInvoiceImageOptions {
  /** Base64-encoded JPEG/PNG after web preprocessing */
  data: string;
  mimeType?: 'image/jpeg' | 'image/png';
  maxSide?: number;
  requestId?: string;
}

export interface DownloadModelOptions {
  version: string;
  files: Array<{ name: string; url: string; sha256: string; sizeBytes: number }>;
}

export interface PaddleOcrInvoicePluginDefinition {
  getInstalledModelVersion(): Promise<{ version: string | null }>;
  getModelSize(): Promise<{ bytes: number }>;
  verifyModel(options: {
    version: string;
    files?: Array<{ name: string; url: string; sha256: string; sizeBytes: number }>;
  }): Promise<{ valid: boolean; reason?: string }>;
  removeModel(): Promise<{ removed: boolean }>;
  downloadModel(options: DownloadModelOptions): Promise<{ started: boolean }>;
  pauseDownload(): Promise<{ paused: boolean }>;
  resumeDownload(): Promise<{ resumed: boolean }>;
  cancelInference(options?: { requestId?: string }): Promise<{ cancelled: boolean }>;
  isModelLoaded(): Promise<{ loaded: boolean; executionProvider?: string }>;
  loadModel(): Promise<{ loaded: boolean; executionProvider?: string }>;
  processInvoiceImage(
    options: ProcessInvoiceImageOptions,
  ): Promise<NativeInvoiceInferenceResult>;
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (event: DownloadProgressEvent) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'inferenceProgress',
    listenerFunc: (event: { stage: string; requestId?: string }) => void,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export type { ParsedInvoice, ModelInstallState, DownloadProgressEvent };

export const PaddleOcrInvoicePlugin = registerPlugin<PaddleOcrInvoicePluginDefinition>(
  'PaddleOcrInvoice',
  {
    // @ts-expect-error Vite dynamic import
    web: () =>
      import('./PaddleOcrInvoicePluginWeb.ts').then((m) => new m.PaddleOcrInvoicePluginWeb()),
  },
);
