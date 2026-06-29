import type { MaterialShop } from '../../types';
import { materialShops as mockShops } from '../../models/materialShops';
import { apiClient } from './client';

export async function getMaterialShops(): Promise<MaterialShop[]> {
  return Promise.resolve([...mockShops]);
  // return apiClient<MaterialShop[]>('/material-shops');
}

export async function getMaterialShop(id: number): Promise<MaterialShop | undefined> {
  return Promise.resolve(mockShops.find(s => s.id === id));
  // return apiClient<MaterialShop>(`/material-shops/${id}`);
}
