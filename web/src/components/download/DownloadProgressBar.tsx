interface Props {
  /** 0–100 */
  percent: number;
  state: 'idle' | 'downloading' | 'verifying' | 'paused' | 'completed' | 'failed' | string;
  className?: string;
}

const STATE_COLOR: Record<string, string> = {
  downloading: 'from-[#6366F1] to-[#818CF8]',
  verifying:   'from-[#818CF8] to-[#A5B4FC]',
  paused:      'from-[#F59E0B] to-[#FCD34D]',
  completed:   'from-[#10B981] to-[#34D399]',
  failed:      'from-[#EF4444] to-[#FCA5A5]',
};

/**
 * Reusable animated download progress bar.
 *
 * Shows a shimmer animation while actively downloading,
 * and switches colour based on state (paused, error, done).
 */
export function DownloadProgressBar({ percent, state, className = '' }: Props) {
  const gradient = STATE_COLOR[state] ?? STATE_COLOR.downloading;
  const isMoving = state === 'downloading' || state === 'verifying';

  return (
    <div
      className={`relative h-2.5 rounded-full overflow-hidden bg-[#141420] ${className}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Filled track */}
      <div
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />

      {/* Shimmer overlay — only while actively downloading */}
      {isMoving && percent > 0 && percent < 100 && (
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
    </div>
  );
}
