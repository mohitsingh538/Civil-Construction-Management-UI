/**
 * Layout
 *
 * Root layout wrapping all routes.
 *
 * Navigation blank-screen fix (Issue 1):
 *   - mode="popLayout" — old and new pages animate SIMULTANEOUSLY (no gap).
 *   - Translations are in pixels (±20 / ±10), never ±100%, so the background
 *     is never exposed at the viewport edge.
 *   - Exit keeps opacity:1 — the old screen never goes invisible before the
 *     new screen is fully on-screen.
 *   - A persistent #0F1117 shell sits behind AnimatePresence so even a
 *     sub-pixel gap shows the correct background, not white.
 *   - @capgo/capacitor-transitions removed from import — the native plugin
 *     should only be invoked explicitly, not via a side-effect import that
 *     can race with Framer Motion.
 */

import { useLocation, useOutlet } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { NavigationProvider, useNavDirection } from '../../contexts/NavigationContext';
import { useAppBootstrap } from '../../hooks/useAppBootstrap';

// ─── Transition timing ───────────────────────────────────────────────────────
// Fixed duration (not spring) for page transitions — springs can overshoot and
// extend past the visible range, creating perceived blank moments.
const PAGE_DURATION = 0.18; // seconds

const pageTrans = {
  duration: PAGE_DURATION,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // easeOutQuart — snappy Android-like
};

// ─── Variant definitions ─────────────────────────────────────────────────────

type Direction = 'forward' | 'back' | 'modal';

// IMPORTANT: opacity never goes below 0.98 so the old screen is always visible
// until the new screen fully covers it. Using small pixel offsets means we never
// see the shell background at the edges during the transition.
const pageVariants = {
  initial: (dir: Direction) => {
    if (dir === 'modal') return { y: 40, opacity: 0.98 };
    return { x: dir === 'back' ? -20 : 20, opacity: 0.98 };
  },
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: pageTrans,
  },
  exit: (dir: Direction) => ({
    x: dir === 'back' ? 10 : (dir === 'modal' ? 0 : -10),
    y: dir === 'modal' ? 40 : 0,
    opacity: 1,          // ← stays fully opaque; new page slides on top
    transition: pageTrans,
  }),
};

// ─── Inner animated outlet ────────────────────────────────────────────────────

function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const direction = useNavDirection();

  return (
    // mode="popLayout" renders old + new simultaneously — zero blank gap
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'transform, opacity',
          // Every page has the app background so the shell never shows through
          backgroundColor: '#0F1117',
        }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout() {
  useAppBootstrap();

  return (
    <NavigationProvider>
      {/*
        Persistent app shell — always rendered, never unmounts.
        The #0F1117 background ensures even a 1-pixel gap between outgoing and
        incoming pages shows the correct dark colour, not a white flash.
      */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#0F1117',
          minHeight: '100dvh',
        }}
      >
        <AnimatedOutlet />
      </div>
    </NavigationProvider>
  );
}
