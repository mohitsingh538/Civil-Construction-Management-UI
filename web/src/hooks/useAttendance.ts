import { useState, useRef, useCallback } from 'react';
import { useQuery } from './useQuery';
import { getAttendanceRecords } from '@core/services/api/attendanceApi';
import { manualAttendance } from '@core/models/attendance';
import type { FaceBox, ProcessedFace } from '../plugins/FaceRecognitionPlugin';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A recognised face that has been marked present in this session.
 * `name` is always non-null here — unknown faces are filtered out.
 */
export interface LiveFace {
  box: FaceBox;
  name: string;
  confidence: number;
  /** Formatted time when this person was first marked, e.g. "09:32 AM". */
  markedAt: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Unified attendance hook.
 *
 * Merges manual attendance records (from the backend) with live
 * face-recognition results produced by `<CameraFeed onFacesDetected={…} />`.
 *
 * The hook no longer touches the native camera directly — all camera
 * management happens inside `CameraFeed` via `getUserMedia`.
 */
export function useAttendance() {
  const records = useQuery({
    key: 'attendance-records',
    fetchFn: getAttendanceRecords,
    initialData: manualAttendance,
  });

  // ── Face-recognition state ────────────────────────────────────────────

  /** Recognised faces visible in the latest processed frame. */
  const [liveFaces, setLiveFaces] = useState<LiveFace[]>([]);

  /** Names already marked this session — avoids duplicate entries. */
  const markedNamesRef = useRef<Set<string>>(new Set());

  /** Controls whether the <CameraFeed /> is mounted (and thus running). */
  const [isCameraActive, setIsCameraActive] = useState(true);

  // ── Callbacks ─────────────────────────────────────────────────────────

  /**
   * Called by `<CameraFeed>` on every processed frame.
   * Merges newly recognised faces into `liveFaces`, ignoring unknowns.
   */
  const handleFacesDetected = useCallback((faces: ProcessedFace[]) => {
    // Use loose != to exclude both null and undefined (the latter occurs when
    // the Android JSONObject drops the key instead of emitting JSON null).
    const recognised = faces.filter((f): f is ProcessedFace & { name: string } => f.name != null);
    if (recognised.length === 0) return;

    const now = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLiveFaces((prev) => {
      const updated = [...prev];

      for (const face of recognised) {
        const key = face.name;
        const existingIdx = updated.findIndex((f) => f.name === key);

        const liveFace: LiveFace = {
          box: face.box,
          name: face.name,
          confidence: face.confidence,
          markedAt: markedNamesRef.current.has(key)
            ? (updated[existingIdx]?.markedAt ?? now)
            : now,
        };

        if (existingIdx >= 0) {
          updated[existingIdx] = liveFace;
        } else {
          updated.push(liveFace);
          markedNamesRef.current.add(key);
        }
      }

      return updated;
    });
  }, []);

  const startCamera = useCallback(() => {
    setIsCameraActive(true);
  }, []);

  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
    setLiveFaces([]);
  }, []);

  // ── Return value ──────────────────────────────────────────────────────

  return {
    /** Manual attendance records from the backend. */
    records: records.data,
    /** Recognised faces from the current / most recent frame. */
    liveFaces,
    /** Number of unique individuals marked present this session. */
    markedCount: markedNamesRef.current.size,
    isLoading: records.isLoading,
    error: records.error,
    isCameraActive,
    handleFacesDetected,
    startCamera,
    stopCamera,
    refetch: records.refetch,
  };
}
