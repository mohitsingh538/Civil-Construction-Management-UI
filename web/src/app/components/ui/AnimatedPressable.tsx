/**
 * AnimatedPressable
 *
 * Drop-in replacement for button / div / card wrappers that need
 * physical press feedback. Supports two element modes so it can
 * render a <button> or a block <div>.
 *
 * Press physics:
 *   scale  0.985  — slight shrink (feels like pushing into surface)
 *   y      2px    — tiny downward shift (depth / shadow squash)
 *   filter brightness(0.97) — surface darkens very slightly
 *   via a tight spring — snappy in, smooth out, no bounce
 *
 * Scroll safety:
 *   Uses useTouchIntent to track finger movement during each gesture.
 *   If movement exceeds 10 px the gesture is classified as a scroll:
 *     • The press animation is cancelled immediately (card springs back)
 *     • The haptic is suppressed
 *     • The onClick is suppressed
 *   This means the user can freely scroll through card lists without
 *   triggering vibrations or press animations.
 *
 * Haptic: fires lightImpact() in onClick — AFTER gesture resolution
 * confirms an intentional tap.  Never fires on touch-start.
 *
 * Usage:
 *   <AnimatedPressable onClick={...} className="...">content</AnimatedPressable>
 *   <AnimatedPressable as="div" onClick={...}>card content</AnimatedPressable>
 *   <AnimatedPressable haptic={false} disabled>...</AnimatedPressable>
 */

import { memo, useState, useCallback, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { lightImpact } from '../../../services/haptics';
import { useTouchIntent } from '../../../hooks/useTouchIntent';

type As = 'button' | 'div';

interface AnimatedPressableProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  /** Fire light haptic on confirmed tap. Default true. */
  haptic?: boolean;
  /** Disabled — suppresses press animation and haptic */
  disabled?: boolean;
  /** Render as 'button' (default) or 'div' */
  as?: As;
  /** Pass-through type for buttons */
  type?: 'button' | 'submit' | 'reset';
  /** aria-label */
  'aria-label'?: string;
  /** onMouseDown pass-through (used by some dropdown triggers) */
  onMouseDown?: (e: React.MouseEvent) => void;
}

// Tight spring — snappy in, smooth out, no bounce
const pressSpring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
  mass: 0.5,
} as const;

const PRESSED_STYLE = { scale: 0.985, y: 2, filter: 'brightness(0.97)' } as const;
const IDLE_STYLE    = { scale: 1,     y: 0, filter: 'brightness(1)'    } as const;

const AnimatedPressable = memo(function AnimatedPressable({
  children,
  className,
  style,
  onClick,
  haptic = true,
  disabled = false,
  as = 'button',
  type = 'button',
  'aria-label': ariaLabel,
  onMouseDown,
}: AnimatedPressableProps) {
  const [pressed, setPressed] = useState(false);

  // Cancel visual press the moment scroll is detected
  const cancelPress = useCallback(() => setPressed(false), []);
  const { isScrolling, bindHandlers } = useTouchIntent(cancelPress);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      bindHandlers.onPointerDown(e);
      setPressed(true);
    },
    [disabled, bindHandlers],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      bindHandlers.onPointerMove(e);
    },
    [bindHandlers],
  );

  const handlePointerUp = useCallback(() => {
    bindHandlers.onPointerUp();
    setPressed(false);
  }, [bindHandlers]);

  const handlePointerCancel = useCallback(() => {
    bindHandlers.onPointerCancel();
    setPressed(false);
  }, [bindHandlers]);

  // Haptic fires here — AFTER gesture resolution. isScrolling.current is still
  // set from the gesture that just ended, so we suppress cleanly.
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isScrolling.current) return;
      if (haptic) lightImpact();
      onClick?.(e);
    },
    [disabled, haptic, isScrolling, onClick],
  );

  const MotionComponent = as === 'button' ? motion.button : motion.div;

  return (
    <MotionComponent
      // Only spread type onto button elements — div rejects this DOM attribute
      {...(as === 'button' ? { type } : {})}
      className={className}
      style={style}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      animate={pressed && !disabled ? PRESSED_STYLE : IDLE_STYLE}
      transition={pressSpring}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      onMouseDown={onMouseDown}
    >
      {children}
    </MotionComponent>
  );
});

export default AnimatedPressable;
