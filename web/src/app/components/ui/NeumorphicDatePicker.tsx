/**
 * NeumorphicDatePicker
 *
 * Fully custom dark neumorphic calendar popup.
 *
 * Why not react-datepicker?
 *   react-spring-bottom-sheet applies CSS `transform` to the sheet element for
 *   its spring animation. CSS `transform` creates a new containing block in the
 *   browser, which means `position:fixed` elements *inside* the sheet are
 *   positioned relative to the sheet, not the viewport — causing a visual /
 *   hit-area misalignment.  Additionally, the bottom sheet fires `onDismiss`
 *   for any `mousedown` that reaches `document` from outside the sheet's DOM
 *   subtree, which includes portal-rendered popups.
 *
 * Fix (same pattern as NeumorphicSelect):
 *   1. Render the calendar into document.body via React portal so it escapes
 *      the transform containing block.
 *   2. Call `e.stopPropagation()` on the calendar's `onMouseDown` so the
 *      bottom sheet's document listener never sees the click.
 *   3. Calculate position from `getBoundingClientRect()` at open-time so the
 *      calendar aligns correctly with the trigger regardless of any ancestors.
 *
 * Props:
 *   value       — YYYY-MM-DD string
 *   onChange    — called with new YYYY-MM-DD string
 *   placeholder
 *   className
 *   minDate / maxDate — YYYY-MM-DD boundaries
 *   transparent — minimal text trigger for nav-bar embedding
 */

import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface NeumorphicDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
  transparent?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_ABBR = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const CAL_WIDTH = 288;
const CAL_HEIGHT = 320; // approx for position calculation

/** Parse YYYY-MM-DD as a LOCAL date (avoids UTC midnight/timezone offset) */
function parseLocal(s: string): Date | null {
  if (!s) return null;
  const parts = s.split('-').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/** Format a Date to YYYY-MM-DD in local time */
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Format for the trigger label */
function formatDisplay(iso: string): string {
  const d = parseLocal(iso);
  if (!d) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Today at midnight local */
function todayISO(): string {
  return toISO(new Date());
}

/** Build the 7-column calendar grid for a given year/month.
 *  Pads with previous- and next-month days to fill complete 7-day rows. */
function buildGrid(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; current: boolean }[] = [];

  // Leading days from previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  // Trailing days from next month
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, next++), current: false });
  }
  return cells;
}

// ─── Component ───────────────────────────────────────────────────────────────

const NeumorphicDatePicker = memo(function NeumorphicDatePicker({
  value,
  onChange,
  placeholder,
  className,
  minDate,
  maxDate,
  transparent = false,
}: NeumorphicDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [calStyle, setCalStyle] = useState<React.CSSProperties>({});
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const triggerRef = useRef<HTMLElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => todayISO(), []);
  const minD = useMemo(() => parseLocal(minDate ?? ''), [minDate]);
  const maxD = useMemo(() => parseLocal(maxDate ?? ''), [maxDate]);

  const openCalendar = useCallback(() => {
    if (open) { setOpen(false); return; }

    // Initialise view to the selected date (or today)
    const base = parseLocal(value) ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());

    // Calculate portal position from the trigger's bounding rect
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const openUp = spaceBelow < CAL_HEIGHT && r.top > CAL_HEIGHT;
    const left = Math.min(r.left, window.innerWidth - CAL_WIDTH - 8);

    setCalStyle({
      position: 'fixed',
      top: openUp ? undefined : r.bottom + 4,
      bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
      left: Math.max(8, left),
      width: CAL_WIDTH,
      zIndex: 99999,
    });
    setOpen(true);
  }, [open, value]);

  // Close on outside click (capture phase, same as NeumorphicSelect)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        calRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open]);

  // Recalculate position on resize/scroll
  useEffect(() => {
    if (!open) return;
    const recalc = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCalStyle((s) => ({ ...s, top: r.bottom + 4, left: Math.max(8, Math.min(r.left, window.innerWidth - CAL_WIDTH - 8)) }));
    };
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', recalc, true);
    return () => { window.removeEventListener('resize', recalc); window.removeEventListener('scroll', recalc, true); };
  }, [open]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; });
  }, []);

  const selectDay = useCallback((date: Date) => {
    const iso = toISO(date);
    if (minD && date < minD) return;
    if (maxD && date > maxD) return;
    onChange(iso);
    setOpen(false);
  }, [onChange, minD, maxD]);

  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const displayText = formatDisplay(value) || placeholder || 'Select date';
  const hasValue = Boolean(value);

  // ── Calendar popup ─────────────────────────────────────────────────────────
  const calendarPortal = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={calRef}
          // Key: stop propagation so bottom sheet never classifies this as
          // an "outside click" and dismisses.
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            ...calStyle,
            background: '#1E1E2E',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
            overflow: 'hidden',
            fontFamily: 'inherit',
          }}
        >
          {/* ── Header: nav + month/year ── */}
          <div style={{ background: '#141420', padding: '12px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); prevMonth(); }}
                style={{
                  width: 32, height: 32, borderRadius: '8px', border: 'none',
                  background: 'transparent', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#252532')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>

              <span style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); nextMonth(); }}
                style={{
                  width: 32, height: 32, borderRadius: '8px', border: 'none',
                  background: 'transparent', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#252532')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* ── Day-of-week headers ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DAY_ABBR.map((d) => (
                <div key={d} style={{
                  textAlign: 'center', color: '#6B7280', fontSize: 11,
                  fontWeight: 700, lineHeight: '28px', textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* ── Day grid ── */}
          <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {grid.map(({ date, current }, idx) => {
              const iso = toISO(date);
              const isSelected = Boolean(value) && iso === value;
              const isToday = iso === todayStr;
              const isDisabled = Boolean(
                (minD && date < minD) || (maxD && date > maxD)
              );

              let color = current ? '#FFFFFF' : '#374151';
              if (isToday && !isSelected) color = '#6366F1';
              if (isDisabled) color = '#374151';

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); if (!isDisabled) selectDay(date); }}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: '8px',
                    border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500,
                    color,
                    background: isSelected
                      ? 'linear-gradient(135deg, #6366F1, #818CF8)'
                      : 'transparent',
                    boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                    transition: 'background 0.12s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isDisabled) {
                      (e.currentTarget as HTMLElement).style.background = '#252532';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )
    : null;

  // ── Trigger variants ────────────────────────────────────────────────────────
  if (transparent) {
    return (
      <span
        ref={triggerRef as React.Ref<HTMLSpanElement>}
        onClick={openCalendar}
        className={`flex-1 text-sm font-medium cursor-pointer select-none min-w-0 truncate ${hasValue ? 'text-white' : 'text-[#6B7280]'} ${className ?? ''}`}
      >
        {displayText}
        {calendarPortal}
      </span>
    );
  }

  return (
    <div ref={triggerRef as React.Ref<HTMLDivElement>} className={`relative ${className ?? ''}`}>
      <div
        onClick={openCalendar}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#141420] rounded-xl cursor-pointer select-none"
        style={{
          boxShadow: open
            ? 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(99,102,241,0.5), 0 4px 16px rgba(99,102,241,0.12)'
            : 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          transition: 'box-shadow 0.15s ease',
        }}
      >
        <CalendarDays className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
        <span className={`flex-1 text-sm font-medium ${hasValue ? 'text-white' : 'text-[#6B7280]'}`}>
          {displayText}
        </span>
        <ChevronLeft
          className={`w-3.5 h-3.5 text-[#6B7280] shrink-0 transition-transform duration-200 rotate-90 ${open ? '-rotate-90' : 'rotate-90'}`}
        />
      </div>
      {calendarPortal}
    </div>
  );
});

export default NeumorphicDatePicker;
