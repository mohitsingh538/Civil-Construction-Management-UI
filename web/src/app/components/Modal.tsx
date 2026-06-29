/**
 * Modal — neumorphic bottom-sheet with drag-to-dismiss.
 *
 * Scroll architecture:
 *   react-spring-bottom-sheet renders:
 *     [data-rsbs-header]   ← `header` prop  (fixed, never scrolls)
 *     [data-rsbs-scroll]   ← `children`     (the library's own scrollable region)
 *       [data-rsbs-content]
 *
 *   Putting the title in `header` and body in `children` lets the library
 *   manage scrolling natively. Any attempt to use height:100%/flex:1 on a
 *   custom wrapper inside `children` is inert because the library does NOT
 *   give a fixed height to the children container.
 *
 * All original props preserved for backward compatibility.
 */

import { type ReactNode } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { mediumImpact } from '../../services/haptics';

interface ModalProps {
  open: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Kept for API compatibility */
  maxWidth?: string;
  onClose?: () => void;
  /** Renders above other bottom sheets (e.g. download over create-invoice). */
  priority?: boolean;
}

export default function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
  priority = false,
}: ModalProps) {
  const handleDismiss = () => {
    mediumImpact();
    onClose?.();
  };

  const handleOpen = () => {
    mediumImpact();
  };

  const getSnapPoints = ({ minHeight, maxHeight }: { minHeight: number; maxHeight: number }) => {
    const expandedSnap = maxHeight * 0.9;
    const contentSnap = Math.min(minHeight, expandedSnap);

    return contentSnap === expandedSnap ? [expandedSnap] : [contentSnap, expandedSnap];
  };

  // ── Fixed header rendered by the library above the scroll region ──────────
  const sheetHeader = (
    <div className="relative px-6 pt-2 pb-4 border-b border-white/5">
      {/* Metallic gloss — decorative only */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 35% 0%, rgba(255,255,255,0.05), transparent 55%)',
        }}
      />
      <h2 className="relative text-2xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && (
        <p className="relative text-sm text-[#9CA3AF] mt-1">{subtitle}</p>
      )}
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onDismiss={handleDismiss}
      onSpringStart={(event) => {
        if (event.type === 'OPEN') handleOpen();
      }}
      // First snap is content height, capped at 90% of the viewport.
      // This removes the scrollable blank area after short forms while still
      // allowing long forms to expand and scroll naturally.
      snapPoints={getSnapPoints}
      defaultSnap={({ snapPoints }) => snapPoints[0]}
      // header prop → rendered in [data-rsbs-header], always fixed above scroll
      header={sheetHeader}
      // scrollLocking:false lets the scroll container inside the sheet
      // handle vertical pan without competing with the drag-to-dismiss gesture
      scrollLocking={false}
      style={
        {
          '--rsbs-bg': '#1E1E2E',
          '--rsbs-handle-bg': 'rgba(255,255,255,0.15)',
          '--rsbs-backdrop-bg': 'rgba(0,0,0,0.70)',
          '--rsbs-max-w': '100%',
          '--rsbs-ml': 'auto',
          '--rsbs-mr': 'auto',
          '--rsbs-overlay-rounded': '24px',
          ...(priority ? { zIndex: 10050 } : {}),
        } as React.CSSProperties
      }
    >
      {/*
        Children go into [data-rsbs-scroll] → [data-rsbs-content].
        The library manages overflow-y:auto on [data-rsbs-scroll] itself —
        content here simply needs to be taller than the sheet to enable scrolling.
        Safe-area bottom padding applied here so last item clears the home bar.
      */}
      <div
        className="px-6 pt-4"
        style={{ paddingBottom: '64px' }}
      >
        {children}
      </div>
    </BottomSheet>
  );
}

