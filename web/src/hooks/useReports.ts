import { useQuery } from './useQuery';
import { getReports } from '@core/services/api/reportsApi';
import { reports as initialData } from '@core/models/reports';

export function useReports() {
  return useQuery({ key: 'reports', fetchFn: getReports, initialData });
}
