import { useQuery } from './useQuery';
import { getEquipment } from '@core/services/api/equipmentApi';
import { equipment as initialData } from '@core/models/equipment';

export function useEquipment() {
  return useQuery({ key: 'equipment', fetchFn: getEquipment, initialData });
}
