import { useQuery } from './useQuery';
import { getSites } from '@core/services/api/siteApi';
import { sites as initialData } from '@core/models/sites';

export function useSites() {
  return useQuery({ key: 'sites', fetchFn: getSites, initialData });
}
