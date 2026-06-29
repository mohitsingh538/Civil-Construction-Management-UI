import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceRecognitionPlugin } from '../plugins/FaceRecognitionPlugin';
import type { ProcessedFace } from '../plugins/FaceRecognitionPlugin';

// ─── Constants ────────────────────────────────────────────────────────────────

const TARGET_FPS = 12;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const JPEG_QUALITY = 0.55; // slightly lower than before — compensates for binary overhead removal
const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseFaceRecognitionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export interface UseFaceRecognitionReturn {
  faces: ProcessedFace[];
  isRunning: boolean;
  error: string | null;
  startRecognition: () => Promise<void>;
  stopRecognition: () => void;
}
// ─── Back-camera helper ─────────────────────────────────────────────────────────

/**
 * Opens the rear / environment camera.
 *
 * Strategy:
 *  1. Request with `facingMode: { ideal: 'environment' }` — works on most
 *     devices and Android WebView.
 *  2. If that rejects (OverconstrainedError / NotFoundError), enumerate video
 *     devices and pick the first device whose label contains "back", "rear",
 *     or "environment"; fall back to the last listed device (typically rear
 *     on Android when multiple cameras exist).
 */
async function openBackCamera(idealW: number, idealH: number): Promise<MediaStream> {
  // Primary attempt
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: idealW },
        height: { ideal: idealH },
      },
      audio: false,
    });
  } catch (error_) {
    // Only retry for constraint / not-found errors — re-throw permission denials
    const name = error_ instanceof Error ? error_.name : '';
    if (name === 'NotAllowedError' || name === 'SecurityError') throw error_;
  }

  // Fallback: enumerate devices (labels are available after the first grant)
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoInputs = devices.filter((d) => d.kind === 'videoinput');

  const rear = videoInputs.find((d) => /back|rear|environment/i.test(d.label))
    ?? videoInputs[videoInputs.length - 1]; // last device is rear on most Android

  return navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: rear?.deviceId ? { exact: rear.deviceId } : undefined,
      width:  { ideal: idealW },
      height: { ideal: idealH },
    },
    audio: false,
  });
}
// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the WebView camera pipeline:
 *  getUserMedia (rear camera) → <video> → hidden canvas (frame capture) →
 *  JPEG Blob → Uint8Array → Capacitor processFrame → draw overlays on display canvas.
 *
 * Binary pipeline: frames are sent as Uint8Array; Capacitor 8 serialises
 * them natively — no explicit base64 encoding in application code.
 *
 * Throttled to TARGET_FPS. Only one frame is in-flight at a time.
 */
export function useFaceRecognition({
  videoRef,
  overlayCanvasRef,
}: UseFaceRecognitionOptions): UseFaceRecognitionReturn {
  const [faces, setFaces] = useState<ProcessedFace[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef(false);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // ── Frame loop ──────────────────────────────────────────────────────────

  const frameLoop = useCallback(
    async (timestamp: number) => {
      // Re-schedule first so the loop survives async gaps
      rafIdRef.current = requestAnimationFrame(frameLoop);

      // Throttle
      if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL_MS) return;

      // Skip if previous frame is still being processed
      if (processingRef.current) return;

      const video = videoRef.current;
      if (
        !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.paused ||
        video.ended
      ) {
        return;
      }

      lastFrameTimeRef.current = timestamp;
      processingRef.current = true;

      try {
        const cap = captureCanvasRef.current!;
        const ctx = captureCtxRef.current!;

        ctx.drawImage(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);

        // Encode the JPEG blob as base64 for the Capacitor bridge.
        // Capacitor's JSON bridge can't transfer Uint8Array directly;
        // android.util.Base64 decodes it on the native side.
        const blob = await new Promise<Blob | null>((res) => {
          cap.toBlob(res, 'image/jpeg', JPEG_QUALITY);
        });
        if (!blob) return;
        const bytes = new Uint8Array(await blob.arrayBuffer());
        // Chunked btoa to avoid stack overflow on large arrays
        let binary = '';
        const CHUNK = 8192;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
        }
        const data = btoa(binary);

        const result = await FaceRecognitionPlugin.processFrame({ data });
        setFaces(result.faces);

        const overlay = overlayCanvasRef.current;
        if (overlay) {
          drawFaceOverlays(
            overlay,
            result.faces,
            video.videoWidth || CAPTURE_WIDTH,
            video.videoHeight || CAPTURE_HEIGHT,
          );
        }
      } catch {
        // Silently ignore per-frame errors (plugin may be initialising)
      } finally {
        processingRef.current = false;
      }
    },
    [videoRef, overlayCanvasRef],
  );

  // ── Start ───────────────────────────────────────────────────────────────

  const startRecognition = useCallback(async () => {
    if (isRunning) return;
    setError(null);

    try {
      const stream = await openBackCamera(CAPTURE_WIDTH, CAPTURE_HEIGHT);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      video.srcObject = stream;
      await video.play();

      // Initialise hidden off-screen capture canvas once
      if (!captureCanvasRef.current) {
        const cap = document.createElement('canvas');
        cap.width = CAPTURE_WIDTH;
        cap.height = CAPTURE_HEIGHT;
        captureCanvasRef.current = cap;
        captureCtxRef.current = cap.getContext('2d', { willReadFrequently: true });
      }

      setIsRunning(true);
      rafIdRef.current = requestAnimationFrame(frameLoop);
    } catch (err: unknown) {
      let msg = 'Failed to access camera.';
      if (err instanceof Error) {
        msg = err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and retry.'
          : err.message;
      }
      setError(msg);
    }
  }, [isRunning, videoRef, frameLoop]);

  // ── Stop ────────────────────────────────────────────────────────────────

  const stopRecognition = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) video.srcObject = null;

    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext('2d');
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    }

    setIsRunning(false);
    setFaces([]);
  }, [videoRef, overlayCanvasRef]);

  // ── Background / foreground handling ────────────────────────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning) return;
      if (document.hidden) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      } else {
        rafIdRef.current ??= requestAnimationFrame(frameLoop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, frameLoop]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { faces, isRunning, error, startRecognition, stopRecognition };
}

// ─── Canvas overlay drawing ───────────────────────────────────────────────────

/**
 * Renders face bounding boxes + labels onto `canvas`.
 *
 * Face coordinates (0–1) are relative to the full captured frame.
 * Because the video uses CSS `object-cover`, the display crops/fills the
 * container rather than letterboxing.  We replicate that same transform so
 * the bounding boxes track the visible face pixels exactly.
 */
function drawFaceOverlays(
  canvas: HTMLCanvasElement,
  faces: ProcessedFace[],
  videoNaturalWidth: number,
  videoNaturalHeight: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Keep canvas pixel buffer in sync with its CSS display size (DPR-aware)
  const dpr = window.devicePixelRatio || 1;
  const displayW = canvas.offsetWidth;
  const displayH = canvas.offsetHeight;
  const targetW = Math.round(displayW * dpr);
  const targetH = Math.round(displayH * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  ctx.clearRect(0, 0, targetW, targetH);
  if (faces.length === 0) return;

  // ── object-cover transform ────────────────────────────────────────────────
  // The video fills the container; excess content is cropped from the edges.
  // offsetX / offsetY will be negative when a dimension is cropped.
  const videoAR = videoNaturalWidth / videoNaturalHeight;
  const canvasAR = displayW / displayH;

  let drawW: number, drawH: number, offsetX: number, offsetY: number;
  if (videoAR > canvasAR) {
    // Video wider than container — fill by container height, crop left/right
    drawH = targetH;
    drawW = targetH * videoAR;
    offsetX = (targetW - drawW) / 2; // negative → sides cropped
    offsetY = 0;
  } else {
    // Video taller than container — fill by container width, crop top/bottom
    drawW = targetW;
    drawH = targetW / videoAR;
    offsetX = 0;
    offsetY = (targetH - drawH) / 2; // negative → top/bottom cropped
  }

  for (const face of faces) {
    const x = offsetX + face.box.x * drawW;
    const y = offsetY + face.box.y * drawH;
    const bw = face.box.width * drawW;
    const bh = face.box.height * drawH;

    const isKnown = face.name != null; // != catches both null and undefined
    const color = isKnown ? '#00FF88' : '#FF4D4F';
    const label = face.name ?? 'Unknown';

    // ── Bounding box ──────────────────────────────────────────────────────
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(x, y, bw, bh);

    // ── Corner accents ────────────────────────────────────────────────────
    const cs = Math.min(14 * dpr, bw * 0.18, bh * 0.18);
    ctx.lineWidth = 3 * dpr;
    ctx.strokeStyle = color;
    ctx.beginPath();
    // TL
    ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
    // TR
    ctx.moveTo(x + bw - cs, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + cs);
    // BL
    ctx.moveTo(x, y + bh - cs); ctx.lineTo(x, y + bh); ctx.lineTo(x + cs, y + bh);
    // BR
    ctx.moveTo(x + bw - cs, y + bh); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw, y + bh - cs);
    ctx.stroke();

    // ── Name label ────────────────────────────────────────────────────────
    const fontSize = 11 * dpr;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    const textW = ctx.measureText(label).width;
    const pad = 6 * dpr;
    const labelH = 20 * dpr;
    const labelTop = Math.max(0, y - labelH - 2 * dpr);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, labelTop, textW + pad * 2, labelH, 3 * dpr);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.fillText(label, x + pad, labelTop + labelH - 5 * dpr);

    // ── Confidence badge (recognised faces only) ──────────────────────────
    if (isKnown) {
      const confText = `${Math.round(face.confidence * 100)}%`;
      const confFont = 10 * dpr;
      ctx.font = `${confFont}px system-ui, -apple-system, sans-serif`;
      const confW = ctx.measureText(confText).width;
      const badgeH = 16 * dpr;

      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.beginPath();
      ctx.roundRect(x, y + bh + 3 * dpr, confW + 8 * dpr, badgeH, 3 * dpr);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.fillText(confText, x + 4 * dpr, y + bh + 3 * dpr + badgeH - 5 * dpr);
    }
  }
}
