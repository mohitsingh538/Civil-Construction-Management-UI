import { DownloadProgressBar } from './DownloadProgressBar';
import { DownloadStatsRow } from './DownloadStats';
import { DownloadControls } from './DownloadControls';
import { useDownloadStats } from './useDownloadStats';

export type DownloadState = 'idle' | 'downloading' | 'verifying' | 'paused' | 'completed' | 'failed';

export interface DownloadPanelProps {
  state: DownloadState;
  /** 0–100, used when bytesDownloaded / totalBytes are unavailable */
  percent?: number;
  bytesDownloaded?: number;
  totalBytes?: number;
  /** Current file name being downloaded (optional detail row) */
  currentFileName?: string;
  errorMessage?: string | null;
  /** Label on the primary start button */
  startLabel?: string;
  /** Extra info shown above the bar (description, warnings, etc.) */
  description?: React.ReactNode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel?: () => void;
}

/**
 * Self-contained download widget — progress bar + live stats + controls.
 *
 * Drop this anywhere a download flow is needed. It handles speed calculation,
 * ETA, formatted sizes, and all button states internally.
 *
 * @example
 * <DownloadPanel
 *   state={downloadState}
 *   bytesDownloaded={bytesDownloaded}
 *   totalBytes={totalBytes}
 *   startLabel="Download AI Model"
 *   onStart={startDownload}
 *   onPause={pauseDownload}
 *   onResume={resumeDownload}
 *   onCancel={closeModal}
 * />
 */
export function DownloadPanel({
  state,
  percent: percentProp = 0,
  bytesDownloaded = 0,
  totalBytes = 0,
  currentFileName,
  errorMessage,
  startLabel = 'Download',
  description,
  onStart,
  onPause,
  onResume,
  onCancel,
}: DownloadPanelProps) {
  const isActive = state === 'downloading';
  const isVerifying = state === 'verifying';
  const isFailed = state === 'failed';
  const showProgress = isActive || isVerifying || state === 'paused';

  const stats = useDownloadStats(bytesDownloaded, totalBytes, isActive);
  const displayPercent = totalBytes > 0 ? stats.percent : percentProp;

  return (
    <div className="space-y-4">
      {/* Optional description slot */}
      {description && <div>{description}</div>}

      {/* Error message */}
      {errorMessage && isFailed && (
        <div className="rounded-xl px-3.5 py-3 bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-300 leading-relaxed whitespace-pre-line">{errorMessage}</p>
        </div>
      )}

      {/* Progress bar + stats */}
      {showProgress && (
        <div className="space-y-2">
          <DownloadProgressBar percent={displayPercent} state={state} />
          <DownloadStatsRow
            stats={{ ...stats, percent: displayPercent }}
            state={state}
            fileName={currentFileName}
          />
        </div>
      )}

      {/* Completed checkmark */}
      {state === 'completed' && (
        <div className="flex items-center gap-2 text-sm text-[#10B981]">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Download complete
        </div>
      )}

      {/* Buttons */}
      <DownloadControls
        state={state}
        startLabel={startLabel}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onCancel={onCancel}
      />
    </div>
  );
}
