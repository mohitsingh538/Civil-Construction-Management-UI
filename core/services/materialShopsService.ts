import type { MaterialShop } from '../types';

/**
 * Filter shops whose pincode contains the search string.
 * Passing an empty string returns all shops.
 */
export function filterShopsByPincode(shops: MaterialShop[], pincode: string): MaterialShop[] {
  if (!pincode) return shops;
  return shops.filter(shop => shop.pincode.includes(pincode));
}

/**
 * Sort shops by distance (ascending).
 */
export function sortShopsByDistance(shops: MaterialShop[]): MaterialShop[] {
  return [...shops].sort((a, b) => a.distance - b.distance);
}
