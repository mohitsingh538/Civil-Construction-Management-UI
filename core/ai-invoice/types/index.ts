export interface InvoiceLineItem {
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  taxable_value: number;
  tax_percent: number;
  tax_amount: number;
  discount: number;
  discount_percent: number;
  total_price: number;
}

/** Canonical structured invoice returned by the Gemini-powered backend. */
export interface ParsedInvoice {
  vendor_name: string;
  vendor_address: string;
  vendor_gstin: string;
  buyer_name: string;
  buyer_address: string;
  buyer_gstin: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  po_number: string;
  currency: string;
  gross_total: number;
  discount: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  tax: number;
  rounding: number;
  total: number;
  line_items: InvoiceLineItem[];
  notes: string;
  confidence: number;
}

export interface OcrTextBox {
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NativeInvoiceInferenceResult {
  invoice: ParsedInvoice;
  boxes: OcrTextBox[];
  inferenceMs: number;
  executionProvider?: string;
}

export type InferenceStage =
  | 'idle'
  | 'uploading'
  | 'reading_pdf'
  | 'extracting'
  | 'complete'
  | 'error'
  | 'cancelled';

export interface ModelFileDescriptor {
  name: string;
  url: string;
  sha256: string;
  sizeBytes: number;
}

export interface ModelManifest {
  version: string;
  minAppVersion: string;
  approximateSizeBytes: number;
  quantization: 'int4' | 'int8';
  files: ModelFileDescriptor[];
}

export interface ModelInstallState {
  version: string | null;
  installed: boolean;
  verified: boolean;
  totalBytes: number;
  downloadedBytes: number;
}

export interface DownloadProgressEvent {
  fileName: string;
  bytesDownloaded: number;
  totalBytes: number;
  percent: number;
  status: 'downloading' | 'verifying' | 'paused' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface AiInvoiceFeatureFlags {
  enabled: boolean;
  minSupportedModelVersion: string;
  remoteMessage?: string;
}
