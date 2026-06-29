import { useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import type { ProcessedFace } from '@/plugins/FaceRecognitionPlugin';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CameraFeedProps {
  /**
   * Called every time the recognised faces list changes.
   * Receives an empty array when no faces are visible.
   */
  onFacesDetected?: (faces: ProcessedFace[]) => void;
  /** Extra Tailwind / CSS classes applied to the outermost container. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Self-contained camera feed component.
 *
 * Behaviour:
 *  - Opens the REAR camera via `getUserMedia` (environment facingMode) on mount.
 *  - Captures frames at ~12 FPS via a hidden off-screen canvas.
 *  - Sends raw JPEG bytes (Uint8Array) to the native Capacitor plugin
 *    (`processFrame`) for ML Kit face detection + MobileFaceNet matching.
 *  - Draws bounding-box overlays on a `<canvas>` (green = known, red = unknown).
 *  - Emits all detected faces (including unknowns) to parent via `onFacesDetected`.
 *  - Stops the camera and cleans up on unmount.
 *
 * Uses CSS `object-cover` so the feed always fills its container without
 * black bars. Overlay math mirrors the same cover transform.
 */
export default function CameraFeed({ onFacesDetected, className = '' }: Readonly<CameraFeedProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const { faces, isRunning, error, startRecognition, stopRecognition } = useFaceRecognition({
    videoRef,
    overlayCanvasRef,
  });

  // ── Stable callback ref so onFacesDetected changes never restart the loop ──
  const onFacesDetectedRef = useRef(onFacesDetected);
  useEffect(() => {
    onFacesDetectedRef.current = onFacesDetected;
  }, [onFacesDetected]);

  useEffect(() => {
    onFacesDetectedRef.current?.(faces);
  }, [faces]);

  // ── Auto-start on mount, stop on unmount ────────────────────────────────
  useEffect(() => {
    startRecognition();
    return () => stopRecognition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl bg-[#0F1117] ${className}`}
    >
      {/* ── Live camera feed ─────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        muted
        aria-label="Camera feed"
      />

      {/* ── Face-detection overlay canvas ────────────────────────────────── */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        tabIndex={-1}
      />

      {/* ── Animated scan border (active state) ─────────────────────────── */}
      {isRunning && !error && (
        <div
          className="absolute inset-0 border-2 border-purple-400 animate-pulse rounded-xl pointer-events-none"
          style={{ boxShadow: '0 0 20px rgba(139,92,246,0.6)' }}
        />
      )}

      {/* ── Camera permission / error state ─────────────────────────────── */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1117]/95 p-4 rounded-xl">
          <Camera className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          <button
            onClick={() => startRecognition()}
            className="mt-4 px-4 py-2 rounded-xl text-sm text-white font-semibold"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Initialising state (stream not yet playing) ──────────────────── */}
      {!isRunning && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-16 h-16 text-[#4B5563] mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">Starting camera…</p>
          </div>
        </div>
      )}
    </div>
  );
}
