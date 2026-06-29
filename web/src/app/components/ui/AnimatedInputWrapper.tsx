/**
 * AnimatedInputWrapper
 *
 * Shared dark neumorphic container for custom form controls
 * (NeumorphicSelect trigger, NeumorphicDatePicker trigger).
 *
 * Provides the same visual language as the existing plain inputs:
 *   bg: #141420   border: subtle rgba white   shadow: inset + outer
 *
 * On focus: scale(1.01) + accent glow via spring.
 * On blur:  scale(1.0)  + glow removed.
 *
 * Usage:
 *   <AnimatedInputWrapper isFocused={isOpen} onClick={...}>
 *     display content
 *   </AnimatedInputWrapper>
 */

import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface AnimatedInputWrapperProps {
  children: ReactNode;
  isFocused?: boolean;
  onClick?: () => void;
  className?: string;
}

const spring = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function AnimatedInputWrapper({
  children,
  isFocused = false,
  onClick,
  className = '',
}: AnimatedInputWrapperProps) {
  return (
    <motion.div
      onClick={onClick}
      animate={
        isFocused
          ? { scale: 1.01, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(99,102,241,0.5), 0 4px 16px rgba(99,102,241,0.12)' }
          : { scale: 1,    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }
      }
      transition={spring}
      className={`w-full flex items-center px-4 py-2.5 bg-[#141420] rounded-xl text-white font-medium cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}
