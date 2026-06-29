/**
 * AnimatedButton
 *
 * Drop-in replacement for <button> that adds native-feeling tactile press behavior:
 *   - Framer Motion spring scale + Y offset on tap (feels physical, not "browser")
 *   - Box-shadow shifts from elevated → flat on press (reinforces depth change)
 *   - Haptic light impact fires at tap start
 *   - brightness filter dims slightly on press for a "pushed in" look
 *
 * No ripple. No opacity fade. No flashy effects.
 * Keeps neumorphic shadow style intact.
 *
 * Usage:
 *   import AnimatedButton from './AnimatedButton';
 *
 *   // Primary action
 *   <AnimatedButton onClick={handleSave} className="...">Save</AnimatedButton>
 *
 *   // Variant with custom haptic (e.g. medium for destructive actions)
 *   <AnimatedButton haptic="medium" onClick={handleDelete} className="...">Delete</AnimatedButton>
 */

import { memo } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { lightImpact, mediumImpact } from '../../services/haptics';

type HapticLevel = 'light' | 'medium' | 'none';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'onTapStart'> {
  /** Which haptic pattern to fire on tap start. Default: 'light' */
  haptic?: HapticLevel;
}

// Spring that feels like a physical key press: fast in, fast out
const pressSpring = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
} as const;

const AnimatedButton = memo(function AnimatedButton({
  haptic = 'light',
  children,
  style,
  ...props
}: AnimatedButtonProps) {
  const fireHaptic = () => {
    if (haptic === 'light') lightImpact();
    else if (haptic === 'medium') mediumImpact();
  };

  return (
    <motion.button
      {...props}
      onTapStart={fireHaptic}
      whileTap={{
        scale: 0.97,
        y: 1,
        filter: 'brightness(0.96)',
      }}
      transition={pressSpring}
      style={{
        // Shift shadow from elevated to flat on press via CSS transition
        // (Framer Motion animates scale; the CSS transition handles shadow)
        transition: 'box-shadow 120ms ease',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
});

export default AnimatedButton;
