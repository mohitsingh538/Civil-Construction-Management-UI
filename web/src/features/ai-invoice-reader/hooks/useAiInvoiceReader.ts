import { useCallback, useState } from 'react';
import { aiInvoiceStore } from '../store/aiInvoiceStore';
import { runInvoiceReader } from '../services/invoiceOcrService';
import type { ParsedInvoice } from '@core/ai-invoice';

export function useAiInvoiceReader() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback((file: File) => {
    setIsProcessing(true);
    aiInvoiceStore.setError(null);
    aiInvoiceStore.setStage('uploading');

    void runInvoiceReader({
      file,
      onStage: (stage) => aiInvoiceStore.setStage(stage),
    })
      .then((result) => {
        aiInvoiceStore.setReaderResult({
          previewFileName: file.name,
          invoice: result.invoice,
          inferenceMs: result.inferenceMs,
          provider: result.provider,
        });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Invoice reader failed';
        aiInvoiceStore.setError(message);
        aiInvoiceStore.setStage('error');
      })
      .finally(() => setIsProcessing(false));
  }, []);

  const cancelReader = useCallback(() => {
    aiInvoiceStore.setStage('cancelled');
    setIsProcessing(false);
  }, []);

  const applyToForm = useCallback((onApply: (invoice: ParsedInvoice) => void) => {
    const invoice = aiInvoiceStore.getState().parsedInvoice;
    if (invoice) onApply(invoice);
  }, []);

  return { isProcessing, processFile, cancelReader, applyToForm };
}
