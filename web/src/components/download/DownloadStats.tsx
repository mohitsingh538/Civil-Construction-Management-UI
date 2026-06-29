import type { DownloadStats } from './useDownloadStats';

interface Props {
  stats: DownloadStats;
  state: string;
  /** Show the current file name being downloaded, if any */
  fileName?: string;
}

/**
 * Displays download speed, downloaded/total size, remaining, and ETA.
 * Designed to sit below a DownloadProgressBar.
 */
export function DownloadStatsRow({ stats, state, fileName }: Props) {
  const isActive = state === 'downloading';
  const isPaused = state === 'paused';
  const isVerifying = state === 'verifying';

  return (
    <div className="space-y-1.5">
      {/* Main stats row */}
      <div className="flex items-center justify-between text-xs">
        {/* Left: downloaded / total */}
        <span className="text-[#9CA3AF] tabular-nums">
          {stats.downloadedText}
          {stats.totalText ? (
            <span className="text-[#6B7280]"> / {stats.totalText}</span>
          ) : null}
        </span>

        {/* Right: speed or status label */}
        <span className="font-medium tabular-nums" style={{ color: stateColor(state) }}>
          {isVerifying
            ? 'Verifying…'
            : isPaused
              ? 'Paused'
              : isActive && stats.speedText
                ? stats.speedText
                : null}
        </span>
      </div>

      {/* Second row: remaining + ETA */}
      {(stats.remainingText || stats.etaText) && isActive && (
        <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>{stats.remainingText}</span>
          {stats.etaText && <span>{stats.etaText}</span>}
        </div>
      )}

      {/* Current file name */}
      {fileName && isActive && (
        <p className="text-[11px] text-[#6B7280] truncate" title={fileName}>
          {fileName}
        </p>
      )}
    </div>
  );
}

function stateColor(state: string): string {
  switch (state) {
    case 'downloading': return '#818CF8';
    case 'verifying':   return '#A5B4FC';
    case 'paused':      return '#F59E0B';
    case 'completed':   return '#10B981';
    case 'failed':      return '#EF4444';
    default:            return '#6B7280';
  }
}
