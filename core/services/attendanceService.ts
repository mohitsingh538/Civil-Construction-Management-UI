import type { ManualAttendanceRecord } from '../types';

/**
 * Calculate attendance percentage.
 * e.g. (45, 52) → 86.5
 */
export function getAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((present / total) * 100).toFixed(1));
}

/**
 * Count manual attendance records by status.
 */
export function getAttendanceCounts(records: ManualAttendanceRecord[]): {
  present: number;
  late: number;
  absent: number;
} {
  return {
    present: records.filter(r => r.status === 'present').length,
    late:    records.filter(r => r.status === 'late').length,
    absent:  records.filter(r => r.status === 'absent').length,
  };
}
