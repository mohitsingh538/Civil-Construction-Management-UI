import type { DailyReport } from '../types';

export const reports: DailyReport[] = [
  {
    id: 1,
    date: '2026-04-24',
    foreman: 'Rajesh Kumar',
    workCompleted: 'Foundation work completed for Block A. Concrete pouring done.',
    materials: 'Cement: 50 bags, Steel: 2 tons',
    workers: 45,
    weather: 'Sunny',
    photos: 3,
  },
  {
    id: 2,
    date: '2026-04-23',
    foreman: 'Amit Sharma',
    workCompleted: 'Electrical conduit laying on 2nd floor. Plumbing rough-in started.',
    materials: 'PVC pipes: 200m, Electrical wire: 500m',
    workers: 42,
    weather: 'Partly Cloudy',
    photos: 5,
  },
];
