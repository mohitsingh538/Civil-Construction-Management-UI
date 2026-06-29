import type { InferenceStage, ParsedInvoice } from '@core/ai-invoice';
import { apiPostForm } from '@/lib/apiClient';

export interface RunInvoiceReaderParams {
  file: File;
  onStage?: (stage: InferenceStage) => void;
}

export interface RunInvoiceReaderResult {
  invoice: ParsedInvoice;
  inferenceMs: number;
  provider: string;
}

interface BackendInvoiceReaderResponse {
  invoice: ParsedInvoice;
  markdown_length: number;
  inference_ms: number;
  provider: string;
}

export async function runInvoiceReader({
  file,
  onStage,
}: RunInvoiceReaderParams): Promise<RunInvoiceReaderResult> {
  onStage?.('uploading');

  const form = new FormData();
  form.append('file', file);

  onStage?.('reading_pdf');
  const response = await apiPostForm<BackendInvoiceReaderResponse>(
    '/api/v1/invoice-reader',
    form,
  );

  onStage?.('extracting');
  onStage?.('complete');

  return {
    invoice: response.invoice,
    inferenceMs: response.inference_ms,
    provider: response.provider,
  };
}
