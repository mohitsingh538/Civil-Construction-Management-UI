import type { InferenceStage } from '@core/ai-invoice';

const STAGE_LABELS: Record<InferenceStage, string> = {
  idle: 'Ready',
  uploading: 'Uploading file…',
  reading_pdf: 'Reading document…',
  extracting: 'Extracting invoice data…',
  complete: 'Done',
  error: 'Failed',
  cancelled: 'Cancelled',
};

interface Props {
  stage: InferenceStage;
  inferenceMs?: number | null;
  provider?: string | null;
}

export function ProcessingStages({ stage, inferenceMs, provider }: Props) {
  if (stage === 'idle') return null;

  return (
    <div
      className="rounded-xl px-4 py-3 bg-[#141420] text-sm"
      style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[#9CA3AF] font-medium">{STAGE_LABELS[stage]}</span>
        {stage !== 'complete' && stage !== 'error' && stage !== 'cancelled' && (
          <span className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      {stage === 'complete' && inferenceMs != null && (
        <p className="text-xs text-[#6B7280] mt-1">
          {inferenceMs}ms · {provider ?? 'Gemini'}
        </p>
      )}
    </div>
  );
}
