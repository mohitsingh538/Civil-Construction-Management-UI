/**
 * NeumorphicSelect
 *
 * Custom dropdown with full dark neumorphic theming.
 *
 * The menu is rendered into a React portal on document.body and uses
 * position:fixed so it escapes overflow:hidden/auto containers (including
 * react-spring-bottom-sheet). Crucially, mousedown on the menu calls
 * e.stopPropagation() so the bottom sheet never classifies it as an
 * "outside click" and won't dismiss.
 *
 * Props:
 *   value      — currently selected value string
 *   onChange   — receives the new value string
 *   options    — { value: string; label: string }[]
 *   placeholder, isDisabled, className, compact
 */

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface NeumorphicSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
  isSearchable?: boolean;  // kept for API compat — not implemented
  isDisabled?: boolean;
  className?: string;
  /** Compact mode: tighter padding and smaller font — for inline use */
  compact?: boolean;
}

interface MenuPos {
  top: number;
  left: number;
  minWidth: number;
  openUp: boolean;
}

const MENU_MAX_H = 240; // max menu height in px

const NeumorphicSelect = memo(function NeumorphicSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  isDisabled = false,
  className,
  compact = false,
}: NeumorphicSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = (options as SelectOption[]).find((o) => o.value === value);

  // Calculate menu position from the trigger's bounding rect
  const calcPos = useCallback((): MenuPos | null => {
    const el = triggerRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < MENU_MAX_H && r.top > MENU_MAX_H;
    return {
      top: openUp ? r.top - 4 : r.bottom + 4,
      left: r.left,
      minWidth: r.width,
      openUp,
    };
  }, []);

  const openMenu = useCallback(() => {
    if (isDisabled) return;
    if (!open) setPos(calcPos());
    setOpen((v) => !v);
  }, [isDisabled, open, calcPos]);

  const select = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setOpen(false);
    },
    [onChange],
  );

  // Close when clicking outside both the trigger and the menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inMenu = menuRef.current?.contains(e.target as Node);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open]);

  // Recalculate position on resize / scroll
  useEffect(() => {
    if (!open) return;
    const update = () => setPos(calcPos());
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, calcPos]);

  const pad = compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5';
  const fontSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* ── Trigger ── */}
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={openMenu}
        className={`w-full flex items-center gap-1 bg-[#141420] rounded-xl cursor-pointer select-none ${pad}`}
        style={{
          boxShadow: open
            ? 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(99,102,241,0.5), 0 4px 16px rgba(99,102,241,0.12)'
            : 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          opacity: isDisabled ? 0.4 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto',
          transition: 'box-shadow 0.15s ease',
        }}
      >
        <span className={`flex-1 font-medium truncate ${fontSize} ${selected ? 'text-white' : 'text-[#6B7280]'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`shrink-0 text-[#6B7280] transition-transform duration-200 ${compact ? 'w-3 h-3' : 'w-4 h-4'} ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* ── Portal menu ── */}
      {open &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            // stopPropagation prevents react-spring-bottom-sheet from
            // seeing this mousedown as an "outside click" and dismissing.
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
              left: pos.left,
              minWidth: pos.minWidth,
              maxHeight: MENU_MAX_H,
              overflowY: 'auto',
              zIndex: 99999,
              background: '#1E1E2E',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
              padding: '4px',
            }}
          >
            {(options as SelectOption[]).map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    // Prevent blur on trigger + prevent bottom sheet dismiss
                    e.preventDefault();
                    e.stopPropagation();
                    select(opt.value);
                  }}
                  style={{
                    background: isSelected ? '#2a2a40' : 'transparent',
                    borderRadius: '8px',
                    padding: compact ? '8px 10px' : '10px 14px',
                    fontSize: compact ? '13px' : '14px',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#818CF8' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#252532';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
});

export default NeumorphicSelect;
