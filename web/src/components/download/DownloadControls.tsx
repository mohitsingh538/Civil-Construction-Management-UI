import AnimatedPressable from '@/app/components/ui/AnimatedPressable';

interface Props {
  state: string;
  /** Label shown on the primary button before download starts. */
  startLabel?: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const PRIMARY_STYLE = {
  background: 'linear-gradient(135deg, #6366F1, #818CF8)',
  boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
} as const;

/**
 * Reusable pause / resume / retry / cancel button group for any download flow.
 */
export function DownloadControls({
  state,
  startLabel = 'Download',
  onStart,
  onPause,
  onResume,
  onCancel,
  disabled = false,
}: Props) {
  const isDownloading = state === 'downloading' || state === 'verifying';
  const isPaused = state === 'paused';
  const isFailed = state === 'failed';
  const isIdle = state === 'idle' || state === 'completed';

  return (
    <div className="flex gap-2">
      {/* Cancel / close — always visible when provided */}
      {onCancel && (
        <AnimatedPressable
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] text-sm font-medium disabled:opacity-50"
        >
          {isDownloading ? 'Cancel' : 'Not now'}
        </AnimatedPressable>
      )}

      {/* Primary action */}
      {(isIdle || isFailed) && (
        <AnimatedPressable
          type="button"
          onClick={onStart}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
          style={PRIMARY_STYLE}
        >
          {isFailed ? 'Retry' : startLabel}
        </AnimatedPressable>
      )}

      {isDownloading && (
        <AnimatedPressable
          type="button"
          onClick={onPause}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 bg-[#1E1E2E] rounded-xl text-[#F59E0B] text-sm font-semibold"
        >
          Pause
        </AnimatedPressable>
      )}

      {isPaused && (
        <AnimatedPressable
          type="button"
          onClick={onResume}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={PRIMARY_STYLE}
        >
          Resume
        </AnimatedPressable>
      )}
    </div>
  );
}
