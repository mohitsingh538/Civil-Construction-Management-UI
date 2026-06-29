/**
 * NeumorphicTimePicker
 *
 * Custom time picker built on NeumorphicSelect.
 * Does NOT use <input type="time"> — avoids Android system time picker.
 *
 * Props:
 *   value    — "HH:MM" 24h format (e.g. "08:15")
 *   onChange — called with new "HH:MM" string
 *   interval — minute interval (default 15)
 *   placeholder, className, isDisabled
 *
 * Display: 12-hour with AM/PM (e.g. "08:15 AM")
 * Storage: 24-hour (e.g. "08:15")
 * Searchable: yes — type "8:15" or "8 am" and it will filter
 */

import { memo, useMemo } from 'react';
import NeumorphicSelect from './NeumorphicSelect';

interface NeumorphicTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  interval?: number;
  placeholder?: string;
  className?: string;
  isDisabled?: boolean;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function to12Hour(hh: number, mm: number): string {
  const period = hh < 12 ? 'AM' : 'PM';
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return `${pad(h)}:${pad(mm)} ${period}`;
}

function generateOptions(interval: number) {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const value = `${pad(h)}:${pad(m)}`;
      const label = to12Hour(h, m);
      opts.push({ value, label });
    }
  }
  return opts;
}

const NeumorphicTimePicker = memo(function NeumorphicTimePicker({
  value,
  onChange,
  interval = 15,
  placeholder = 'Select time',
  className,
  isDisabled = false,
}: NeumorphicTimePickerProps) {
  const options = useMemo(() => generateOptions(interval), [interval]);

  // If the current value is not on a grid interval, find the nearest option
  // or just pass it through (react-select will show it as the selected label
  // because we render the displayValue separately).
  const normalizedValue = useMemo(() => {
    if (!value) return '';
    // Check if it's an exact match first
    if (options.some((o) => o.value === value)) return value;
    // Snap to nearest interval
    const [hStr, mStr] = value.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const snapped = Math.round(m / interval) * interval;
    const mm = snapped >= 60 ? 0 : snapped;
    const hh = snapped >= 60 ? (h + 1) % 24 : h;
    return `${pad(hh)}:${pad(mm)}`;
  }, [value, interval, options]);

  return (
    <NeumorphicSelect
      value={normalizedValue}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isSearchable
      isDisabled={isDisabled}
      className={className}
    />
  );
});

export default NeumorphicTimePicker;
