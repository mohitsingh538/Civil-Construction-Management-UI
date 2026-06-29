import type { Site } from '../types';

export const sites: Site[] = [
  {
    id: 1,
    name: 'Metro Station - Phase 3',
    location: 'Andheri West',
    alerts: 2,
    attendance: 45,
    totalWorkers: 52,
    lowStockItems: 3,
    progress: 67,
    color: '#3B82F6',
  },
  {
    id: 2,
    name: 'Highway Bridge Construction',
    location: 'Thane',
    alerts: 0,
    attendance: 28,
    totalWorkers: 30,
    lowStockItems: 0,
    progress: 82,
    color: '#10B981',
  },
  {
    id: 3,
    name: 'Residential Complex - Tower A',
    location: 'Borivali',
    alerts: 1,
    attendance: 36,
    totalWorkers: 40,
    lowStockItems: 1,
    progress: 45,
    color: '#8B5CF6',
  },
];
