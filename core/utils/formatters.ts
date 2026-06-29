// ─── Currency Formatting ──────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees currency string.
 * e.g. 125000 → "₹1,25,000"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as a compact lakh/crore string.
 * e.g. 1250000 → "₹12.5L", 45000000 → "₹4.5Cr"
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(2)}Cr`;
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`;
  }
  return formatINR(amount);
}

// ─── Date & Time Formatting ───────────────────────────────────────────────────

/**
 * Format a date string to locale display format.
 * e.g. "2026-04-24" → "24 Apr 2026"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string to long weekday format.
 * e.g. "2026-04-24" → "Friday, 24 April 2026"
 */
export function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns the current time in HH:MM AM/PM format (India locale).
 */
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns the current date as a long weekday string (India locale).
 */
export function getCurrentDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate the number of days remaining until a given date string.
 */
export function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Percentage Formatting ────────────────────────────────────────────────────

/**
 * Format a ratio as a percentage string.
 * e.g. (45, 52) → "86.5%"
 */
export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
}
