import { useQuery } from './useQuery';
import { getInventoryItems } from '@core/services/api/inventoryApi';
import { inventoryItems as initialData } from '@core/models/inventory';

export function useInventory() {
  return useQuery({ key: 'inventory', fetchFn: getInventoryItems, initialData });
}
