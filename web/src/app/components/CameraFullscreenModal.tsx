import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import CameraFeed from './CameraFeed';
import type { ProcessedFace } from '@/plugins/FaceRecognitionPlugin';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CameraFullscreenModalProps {
  /** Whether the modal is currently open. */
  open: boolean;
  /** Called when the user closes the modal. */
  onClose: () => void;
  /** Forwarded to the internal CameraFeed. */
  onFacesDetected?: (faces: ProcessedFace[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Full-screen camera modal.
 *
 * Renders via `createPortal` at `document.body` so it sits above every other
 * layer (z-index 9999). Manages its own CameraFeed lifecycle — the feed starts
 * fresh on open and stops on close. Background scrolling is disabled while open.
 *
 * Transitions: 250 ms opacity fade on open **and** close.
 */
export default function CameraFullscreenModal({
  open,
  onClose,
  onFacesDetected,
}: Readonly<CameraFullscreenModalProps>) {
  // `mounted` controls DOM presence; `visible` drives the CSS opacity transition.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Allow the browser one paint at opacity-0 before transitioning in.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      // Keep DOM alive until the fade-out finishes, then unmount CameraFeed
      // so the native camera stream is released cleanly.
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll lock — prevent background content from scrolling while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <dialog
      open
      aria-label="Full-screen camera"
      className="fixed inset-0 bg-black p-0 m-0 border-0 w-screen h-screen max-w-none max-h-none"
      style={{
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 250ms ease',
      }}
    >
      {/* ── Camera — constrained to safe area ────────────────────────────── */}
      <div
        className="absolute"
        style={{
          top: 'env(safe-area-inset-top)',
          right: 'env(safe-area-inset-right)',
          bottom: 'env(safe-area-inset-bottom)',
          left: 'env(safe-area-inset-left)',
        }}
      >
        <CameraFeed onFacesDetected={onFacesDetected} />
      </div>

      {/* ── Close button — top-right, respects device safe area ──────────── */}
      <div
        className="absolute top-0 right-0 z-10"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 14px)',
          paddingRight: 'calc(env(safe-area-inset-right) + 14px)',
        }}
      >
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow:
              '0 4px 16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
          aria-label="Close full-screen camera"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── Bottom hint strip ─────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-center"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
          height: '80px',
        }}
      >
        <p className="text-white/50 text-xs tracking-widest uppercase select-none">
          Tap × to close
        </p>
      </div>
    </dialog>,
    document.body,
  );
}
