import { useEffect, useMemo, useRef, useState } from 'react';

export interface DownloadStats {
  /** Smoothed bytes-per-second over a 10-second rolling window. 0 when inactive. */
  speedBytesPerSec: number;
  speedText: string;       // "1.2 MB/s"
  downloadedText: string;  // "245 MB"
  totalText: string;       // "1.04 GB"
  remainingText: string;   // "789 MB remaining"
  etaText: string;         // "~4m 32s" | ""
  percent: number;         // 0–100, integer
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
  return `${bytes} B`;
}

function fmtSpeed(bps: number): string {
  if (bps <= 0) return '';
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} MB/s`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} KB/s`;
  return `${bps.toFixed(0)} B/s`;
}

function fmtEta(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return '';
  if (seconds < 60) return `~${Math.ceil(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  if (m < 60) return `~${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `~${h}h ${m % 60}m`;
}

/**
 * Calculates live download statistics from raw byte counts.
 *
 * Usage:
 *   const stats = useDownloadStats(bytesDownloaded, totalBytes, isDownloading);
 *
 * @param bytesDownloaded - bytes received so far (updates from native progress events)
 * @param totalBytes      - expected total bytes (0 if unknown)
 * @param isActive        - true while the download is in progress; resets speed when false
 */
export function useDownloadStats(
  bytesDownloaded: number,
  totalBytes: number,
  isActive: boolean,
): DownloadStats {
  // Rolling window: array of { timestamp ms, bytes } samples, max 10-sec span.
  const samplesRef = useRef<Array<{ t: number; bytes: number }>>([]);
  const [speedBytesPerSec, setSpeedBytesPerSec] = useState(0);

  useEffect(() => {
    if (!isActive) {
      samplesRef.current = [];
      setSpeedBytesPerSec(0);
      return;
    }

    const now = Date.now();
    const WINDOW_MS = 10_000;

    samplesRef.current = [
      ...samplesRef.current.filter((s) => s.t >= now - WINDOW_MS),
      { t: now, bytes: bytesDownloaded },
    ];

    const samples = samplesRef.current;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = (last.t - first.t) / 1000; // seconds
      const db = last.bytes - first.bytes;
      if (dt >= 0.5 && db >= 0) {
        setSpeedBytesPerSec(Math.round(db / dt));
      }
    }
  }, [bytesDownloaded, isActive]);

  return useMemo<DownloadStats>(() => {
    const remaining = Math.max(0, totalBytes - bytesDownloaded);
    const percent =
      totalBytes > 0 ? Math.min(99, Math.round((bytesDownloaded / totalBytes) * 100)) : 0;
    const eta =
      speedBytesPerSec > 0 && remaining > 0
        ? fmtEta(remaining / speedBytesPerSec)
        : '';

    return {
      speedBytesPerSec,
      speedText: fmtSpeed(speedBytesPerSec),
      downloadedText: fmtBytes(bytesDownloaded),
      totalText: totalBytes > 0 ? fmtBytes(totalBytes) : '',
      remainingText: totalBytes > 0 && remaining > 0 ? `${fmtBytes(remaining)} remaining` : '',
      etaText: eta,
      percent,
    };
  }, [speedBytesPerSec, bytesDownloaded, totalBytes]);
}
