import type { RecognizedFace, ManualAttendanceRecord } from '../types';

export const recognizedFaces: RecognizedFace[] = [
  { id: 1, name: 'Rajesh Kumar', position: { x: 15, y: 20 }, status: 'present' },
  { id: 2, name: 'Amit Sharma', position: { x: 45, y: 25 }, status: 'present' },
  { id: 3, name: 'Suresh Yadav', position: { x: 70, y: 30 }, status: 'present' },
  { id: 4, name: 'Dinesh Patil', position: { x: 25, y: 55 }, status: 'present' },
  { id: 5, name: 'Prakash Singh', position: { x: 60, y: 60 }, status: 'present' },
];

export const manualAttendance: ManualAttendanceRecord[] = [
  { id: 6, name: 'Mohan Das', role: 'Mason', checkIn: '08:15 AM', status: 'present' },
  { id: 7, name: 'Ramesh Verma', role: 'Helper', checkIn: '08:20 AM', status: 'present' },
  { id: 8, name: 'Vijay Kumar', role: 'Electrician', checkIn: '09:00 AM', status: 'late' },
  { id: 9, name: 'Anil Joshi', role: 'Plumber', checkIn: '-', status: 'absent' },
];
