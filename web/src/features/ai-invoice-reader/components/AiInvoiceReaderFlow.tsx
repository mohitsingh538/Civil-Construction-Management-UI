import { useEffect, useRef } from 'react';
import { FileText, ImageIcon, X } from 'lucide-react';
import Modal from '@/app/components/Modal';
import AnimatedPressable from '@/app/components/ui/AnimatedPressable';
import { useAiInvoiceReader } from '../hooks/useAiInvoiceReader';
import { useInvoiceImageCapture } from '../hooks/useInvoiceImageCapture';
import { aiInvoiceStore, useAiInvoiceStoreSelector } from '../store/aiInvoiceStore';
import { ProcessingStages } from './ProcessingStages';
import type { ParsedInvoice } from '@core/ai-invoice';

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (invoice: ParsedInvoice, fileName: string | null) => void;
}

export function AiInvoiceReaderFlow({ open, onClose, onApply }: Readonly<Props>) {
  const reader = useAiInvoiceReader();
  const capture = useInvoiceImageCapture();
  const previewFileName = useAiInvoiceStoreSelector((s) => s.previewFileName);
  const stage = useAiInvoiceStoreSelector((s) => s.stage);
  const inferenceMs = useAiInvoiceStoreSelector((s) => s.inferenceMs);
  const provider = useAiInvoiceStoreSelector((s) => s.provider);
  const error = useAiInvoiceStoreSelector((s) => s.error);
  const parsedInvoice = useAiInvoiceStoreSelector((s) => s.parsedInvoice);
  const hasAutoApplied = useRef(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    reader.processFile(file);
  };

  const handleClose = () => {
    reader.cancelReader();
    aiInvoiceStore.resetReader();
    onClose();
  };

  useEffect(() => {
    if (!open) {
      hasAutoApplied.current = false;
      return;
    }
    if (stage === 'complete' && parsedInvoice && !hasAutoApplied.current) {
      hasAutoApplied.current = true;
      onApply(parsedInvoice, previewFileName);
      aiInvoiceStore.resetReader();
      onClose();
    }
  }, [open, stage, parsedInvoice, previewFileName, onApply, onClose]);

  const showPicker = !previewFileName && !reader.isProcessing;

  return (
    <Modal
      open={open}
      title="AI Invoice Reader"
      subtitle="Powered by pymupdf4llm + Gemini"
      onClose={handleClose}
    >
      <div className="space-y-4 pt-2">
        {/* File picker */}
        {showPicker && (
          <div className="grid grid-cols-2 gap-2">
            <AnimatedPressable
              type="button"
              onClick={() => void capture.captureFromCamera().then(handleFile)}
              className="flex flex-col items-center gap-2 p-4 bg-[#141420] rounded-xl"
            >
              <ImageIcon className="w-6 h-6 text-[#6366F1]" />
              <span className="text-xs text-[#9CA3AF] font-medium">Camera / Image</span>
            </AnimatedPressable>
            <AnimatedPressable
              type="button"
              onClick={() => void capture.pickFromGallery().then(handleFile)}
              className="flex flex-col items-center gap-2 p-4 bg-[#141420] rounded-xl"
            >
              <FileText className="w-6 h-6 text-[#6366F1]" />
              <span className="text-xs text-[#9CA3AF] font-medium">PDF / File</span>
            </AnimatedPressable>
          </div>
        )}

        {/* Processing stages */}
        <ProcessingStages
          stage={stage}
          inferenceMs={inferenceMs}
          provider={provider}
        />

        {/* Error banner */}
        {error && (
          <div className="rounded-xl px-3 py-2 bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => aiInvoiceStore.setError(null)}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File name badge */}
        {previewFileName && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141420] text-xs text-[#9CA3AF]">
            <FileText className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
            <span className="truncate">{previewFileName}</span>
          </div>
        )}

        {/* Cancel button while processing */}
        {reader.isProcessing && (
          <AnimatedPressable
            type="button"
            onClick={() => reader.cancelReader()}
            className="w-full py-2 text-sm text-[#F59E0B] font-medium"
          >
            Cancel
          </AnimatedPressable>
        )}
      </div>
    </Modal>
  );
}
