import type { InventoryItem, InventoryStatus } from '../types';

/**
 * Returns Tailwind CSS class string for the inventory status badge.
 */
export function getInventoryStatusColor(status: InventoryStatus): string {
  switch (status) {
    case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'low':      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    default:         return 'bg-green-500/10 text-green-400 border-green-500/30';
  }
}

/**
 * Returns Tailwind gradient class string for the inventory stock progress bar.
 */
export function getInventoryProgressColor(status: InventoryStatus): string {
  switch (status) {
    case 'critical': return 'from-red-500 to-red-600';
    case 'low':      return 'from-orange-500 to-orange-600';
    default:         return 'from-green-500 to-green-600';
  }
}

/**
 * Calculate the total inventory value across all items.
 */
export function calculateInventoryValue(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.stock * item.unitCost, 0);
}

/**
 * Get all items that are below minimum stock level.
 */
export function getLowStockItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter(item => item.status === 'low' || item.status === 'critical');
}
