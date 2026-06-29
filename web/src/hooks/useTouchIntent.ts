import { useRef, useCallback } from 'react';

/** Finger movement beyond this distance (px) is classified as a scroll, not a tap. */
const SCROLL_THRESHOLD = 10;

/**
 * useTouchIntent
 *
 * Distinguishes intentional taps from scroll gestures by tracking
 * pointer movement during a touch sequence.
 *
 * Design:
 *   - isScrolling.current resets at the START of the next pointer-down, not at
 *     pointer-up.  This lets the onClick handler (which fires after pointer-up)
 *     still read the correct intent for the gesture that just ended.
 *   - onScrollDetected is called synchronously the moment the threshold is
 *     crossed — callers can use it to cancel visual press states immediately.
 *
 * Usage:
 *   const { isScrolling, bindHandlers } = useTouchIntent(cancelPressed);
 *   <div {...bindHandlers} onClick={e => { if (isScrolling.current) return; ... }} />
 */
export function useTouchIntent(onScrollDetected?: () => void) {
  const startX = useRef(0);
  const startY = useRef(0);
  /** Sync-safe ref — always up-to-date in event handlers and onClick closures. */
  const isScrolling = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Reset at the beginning of each new gesture
    startX.current = e.clientX;
    startY.current = e.clientY;
    isScrolling.current = false;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isScrolling.current) return; // already classified
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.sqrt(dx * dx + dy * dy) > SCROLL_THRESHOLD) {
        isScrolling.current = true;
        onScrollDetected?.();
      }
    },
    [onScrollDetected],
  );

  // Intentionally a no-op — isScrolling resets on the NEXT pointerdown so that
  // the click event (fired after pointerup) can still read the correct value.
  const onPointerUp = useCallback(() => {}, []);
  const onPointerCancel = useCallback(() => {
    // On cancel (e.g. scroll container takes over), mark as scrolling
    isScrolling.current = true;
    onScrollDetected?.();
  }, [onScrollDetected]);

  return {
    /** Ref to scroll classification — safe to read inside onClick/handlers. */
    isScrolling,
    bindHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    } as const,
  };
}
