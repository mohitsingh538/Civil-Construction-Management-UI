import { WebPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import type {
  DownloadProgressEvent,
  NativeInvoiceInferenceResult,
  OcrTextBox,
} from '@core/ai-invoice';
import { heuristicParseInvoice, isDemoManifest } from '@core/ai-invoice';
import type {
  DownloadModelOptions,
  PaddleOcrInvoicePluginDefinition,
  ProcessInvoiceImageOptions,
} from './PaddleOcrInvoicePlugin';

const LS_VERSION = 'ai_invoice_model_version';
const LS_BYTES = 'ai_invoice_model_bytes';

export class PaddleOcrInvoicePluginWeb
  extends WebPlugin
  implements PaddleOcrInvoicePluginDefinition
{
  private downloadTimer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private abortInference = false;

  async getInstalledModelVersion(): Promise<{ version: string | null }> {
    return { version: localStorage.getItem(LS_VERSION) };
  }

  async getModelSize(): Promise<{ bytes: number }> {
    const raw = localStorage.getItem(LS_BYTES);
    return { bytes: raw ? Number(raw) : 0 };
  }

  async verifyModel(_options?: {
    version: string;
    files?: Array<{ name: string; url: string; sha256: string; sizeBytes: number }>;
  }): Promise<{ valid: boolean; reason?: string }> {
    const v = localStorage.getItem(LS_VERSION);
    return v ? { valid: true } : { valid: false, reason: 'Model not installed' };
  }

  async removeModel(): Promise<{ removed: boolean }> {
    localStorage.removeItem(LS_VERSION);
    localStorage.removeItem(LS_BYTES);
    return { removed: true };
  }

  async downloadModel(options: DownloadModelOptions): Promise<{ started: boolean }> {
    const manifestProbe = {
      version: options.version,
      minAppVersion: '1.0.0',
      approximateSizeBytes: options.files.reduce((s, f) => s + f.sizeBytes, 0),
      quantization: 'int8' as const,
      files: options.files,
    };

    const isDemo = isDemoManifest(manifestProbe);

    // Never fake a multi-GB Hugging Face download in the browser — only on device native code.
    if (!isDemo) {
      const event: DownloadProgressEvent = {
        fileName: '',
        bytesDownloaded: 0,
        totalBytes: 0,
        percent: 0,
        status: 'failed',
        errorMessage: Capacitor.isNativePlatform()
          ? 'Native download plugin unavailable. Rebuild the app (npx cap sync android).'
          : 'Run on Android/iOS to download the ONNX model from your CDN.',
      };
      void this.notifyListeners('downloadProgress', event);
      throw new Error(event.errorMessage);
    }

    const total = options.files.reduce((s, f) => s + f.sizeBytes, 0);
    let downloaded = 0;
    this.paused = false;
    this.abortInference = false;

    if (this.downloadTimer) clearInterval(this.downloadTimer);

    const tick = (percent: number, status: DownloadProgressEvent['status']) => {
      const event: DownloadProgressEvent = {
        fileName: options.files[0]?.name ?? 'bundle',
        bytesDownloaded: Math.floor((percent / 100) * total),
        totalBytes: total,
        percent,
        status,
      };
      void this.notifyListeners('downloadProgress', event);
    };

    tick(0, 'downloading');

    this.downloadTimer = setInterval(() => {
      if (this.paused) return;
      downloaded = Math.min(total, downloaded + total * 0.12);
      const percent = Math.round((downloaded / total) * 100);
      tick(percent, percent >= 100 ? 'completed' : 'downloading');
      if (percent >= 100) {
        if (this.downloadTimer) clearInterval(this.downloadTimer);
        localStorage.setItem(LS_VERSION, options.version);
        localStorage.setItem(LS_BYTES, String(total));
      }
    }, 120);

    return { started: true };
  }

  async pauseDownload(): Promise<{ paused: boolean }> {
    this.paused = true;
    void this.notifyListeners('downloadProgress', {
      fileName: '',
      bytesDownloaded: 0,
      totalBytes: 0,
      percent: 0,
      status: 'paused',
    });
    return { paused: true };
  }

  async resumeDownload(): Promise<{ resumed: boolean }> {
    this.paused = false;
    return { resumed: true };
  }

  async cancelInference(): Promise<{ cancelled: boolean }> {
    this.abortInference = true;
    return { cancelled: true };
  }

  async isModelLoaded(): Promise<{ loaded: boolean; executionProvider?: string }> {
    const v = localStorage.getItem(LS_VERSION);
    return { loaded: !!v, executionProvider: 'web-cpu-stub' };
  }

  async loadModel(): Promise<{ loaded: boolean; executionProvider?: string }> {
    // Web stub — no real ONNX session to warm up
    return this.isModelLoaded();
  }

  async processInvoiceImage(
    options: ProcessInvoiceImageOptions,
  ): Promise<NativeInvoiceInferenceResult> {
    this.abortInference = false;
    const stages = ['preprocessing', 'running_ocr', 'structuring'] as const;
    for (const stage of stages) {
      if (this.abortInference) throw new Error('Inference cancelled');
      void this.notifyListeners('inferenceProgress', {
        stage,
        requestId: options.requestId,
      });
      await new Promise((r) => setTimeout(r, 350));
    }

    const stubText =
      'ACME Construction Supplies\nInvoice No: INV-2026-0042\nDate: 28/05/2026\n' +
      'Portland Cement 50 bags x ₹420 = ₹21,000\nGST 18%\nTotal: ₹24,780';

    const boxes: OcrTextBox[] = [
      { text: 'ACME Construction Supplies', confidence: 0.92, x: 0.08, y: 0.05, width: 0.55, height: 0.04 },
      { text: 'INV-2026-0042', confidence: 0.88, x: 0.55, y: 0.12, width: 0.3, height: 0.03 },
      { text: '₹24,780', confidence: 0.9, x: 0.65, y: 0.82, width: 0.2, height: 0.04 },
    ];

    return {
      invoice: heuristicParseInvoice(stubText, boxes),
      boxes,
      inferenceMs: 1050,
      executionProvider: 'web-cpu-stub',
    };
  }
}
