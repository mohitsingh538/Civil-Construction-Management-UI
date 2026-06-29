import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Equipment, EquipmentStatus, EquipmentStatusBadge, EquipmentStats } from '../types';

/**
 * Returns display metadata for an equipment status value.
 */
export function getEquipmentStatusBadge(status: EquipmentStatus): EquipmentStatusBadge {
  switch (status) {
    case 'available':
      return { color: '#10B981', bgColor: 'bg-green-500/10', label: 'Available', icon: CheckCircle };
    case 'in-use':
      return { color: '#3B82F6', bgColor: 'bg-blue-500/10', label: 'In Use', icon: Clock };
    case 'maintenance':
      return { color: '#F59E0B', bgColor: 'bg-orange-500/10', label: 'Maintenance', icon: XCircle };
    default:
      return { color: '#6B7280', bgColor: 'bg-gray-500/10', label: 'Unknown', icon: XCircle };
  }
}

/**
 * Aggregate equipment counts by status.
 */
export function getEquipmentStats(equipment: Equipment[]): EquipmentStats {
  return {
    available:   equipment.filter(e => e.status === 'available').length,
    inUse:       equipment.filter(e => e.status === 'in-use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
  };
}
