import { useQuery } from './useQuery';
import { getTenders } from '@core/services/api/tenderApi';
import { tenders as initialData } from '@core/models/tenders';

export function useTenders() {
  return useQuery({ key: 'tenders', fetchFn: getTenders, initialData });
}
