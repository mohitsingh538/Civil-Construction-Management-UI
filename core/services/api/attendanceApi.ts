import type { ManualAttendanceRecord, RecognizedFace, MarkAttendanceInput } from '../../types';
import { manualAttendance as mockAttendance, recognizedFaces as mockFaces } from '../../models/attendance';
import { apiClient } from './client';

export async function getAttendanceRecords(): Promise<ManualAttendanceRecord[]> {
  return Promise.resolve([...mockAttendance]);
  // return apiClient<ManualAttendanceRecord[]>('/attendance');
}

// Returns live face-recognition data from the camera feed.
export async function getRecognizedFaces(): Promise<RecognizedFace[]> {
  return Promise.resolve([...mockFaces]);
  // return apiClient<RecognizedFace[]>('/attendance/faces');
}

export async function markAttendance(data: MarkAttendanceInput): Promise<ManualAttendanceRecord> {
  const newRecord: ManualAttendanceRecord = {
    id: Date.now(),
    name: `Employee ${data.employeeId}`,
    role: '',
    checkIn: data.checkIn,
    status: data.status,
  };
  return Promise.resolve(newRecord);
  // return apiClient<ManualAttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(data) });
}
