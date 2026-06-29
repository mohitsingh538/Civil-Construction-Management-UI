import { useQuery } from './useQuery';
import { getMaterialShops } from '@core/services/api/materialShopsApi';
import { materialShops as initialData } from '@core/models/materialShops';

export function useMaterialShops() {
  return useQuery({ key: 'material-shops', fetchFn: getMaterialShops, initialData });
}
