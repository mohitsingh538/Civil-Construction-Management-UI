/**
 * Shared Framer Motion / motion animation variants.
 *
 * Physics:  stiffness 300 · damping 30 · mass 0.8  (card/list entrance)
 *           stiffness 500 · damping 25              (button press)
 *
 * Import these where needed instead of defining per-component.
 */

import type { Transition, Variants } from 'motion/react';

// ─── Shared spring transitions ───────────────────────────────────────────────

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/** Tight spring for button/card tap — fast, physical */
export const pressSpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
};

// ─── Card: fade + subtle upward movement ─────────────────────────────────────

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

/** Staggered list of cards */
export const cardListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

// ─── Clickable card (site cards, company cards, module tiles, tender cards) ──
//
// Usage:
//   <motion.div
//     {...clickableCardProps}
//     onClick={...}
//   >

export const clickableCardProps = {
  whileTap: { scale: 0.985 },
  whileHover: { y: -2 },
  transition: springTransition,
} as const;

// ─── Button tap scale ────────────────────────────────────────────────────────
//
// Use AnimatedButton component for full behavior (haptics + shadow).
// These props are for inline <motion.button> where AnimatedButton is overkill.

export const buttonTapProps = {
  whileTap: { scale: 0.97, y: 1 },
  transition: pressSpring,
} as const;

// ─── Modal / bottom-sheet appearance ─────────────────────────────────────────

export const modalVariants: Variants = {
  hidden: { y: '100%', opacity: 1 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    y: '100%',
    opacity: 1,
    transition: { ...springTransition, stiffness: 250 },
  },
};

// ─── Progress bar fill ───────────────────────────────────────────────────────

export const progressVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (pct: number) => ({
    scaleX: pct / 100,
    originX: 0,
    transition: { ...springTransition, delay: 0.1 },
  }),
};

// ─── Module tile / site card entrance ────────────────────────────────────────

export const tileVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};


/** Staggered list of cards */
export const cardListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

// ─── Button tap scale ────────────────────────────────────────────────────────

/** Apply as whileTap on <motion.button> */
export const buttonTapProps = {
  whileTap: { scale: 0.98 },
  transition: springTransition,
} as const;

// ─── Modal / bottom-sheet appearance ─────────────────────────────────────────

export const modalVariants: Variants = {
  hidden: { y: '100%', opacity: 1 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    y: '100%',
    opacity: 1,
    transition: { ...springTransition, stiffness: 250 },
  },
};

// ─── Progress bar fill ───────────────────────────────────────────────────────

export const progressVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (pct: number) => ({
    scaleX: pct / 100,
    originX: 0,
    transition: { ...springTransition, delay: 0.1 },
  }),
};

// ─── Module tile / site card ─────────────────────────────────────────────────

export const tileVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};
