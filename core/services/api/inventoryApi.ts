import type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from '../../types';
import { inventoryItems as mockInventory } from '../../models/inventory';
import { apiClient } from './client';

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return Promise.resolve([...mockInventory]);
  // return apiClient<InventoryItem[]>('/inventory');
}

export async function getInventoryItem(id: number): Promise<InventoryItem | undefined> {
  return Promise.resolve(mockInventory.find(item => item.id === id));
  // return apiClient<InventoryItem>(`/inventory/${id}`);
}

export async function createInventoryItem(data: CreateInventoryItemInput): Promise<InventoryItem> {
  const newItem: InventoryItem = { id: Date.now(), ...data };
  return Promise.resolve(newItem);
  // return apiClient<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateInventoryItem(id: number, data: UpdateInventoryItemInput): Promise<InventoryItem | undefined> {
  const item = mockInventory.find(i => i.id === id);
  if (!item) return Promise.resolve(undefined);
  return Promise.resolve({ ...item, ...data });
  // return apiClient<InventoryItem>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteInventoryItem(_id: number): Promise<void> {
  return Promise.resolve();
  // return apiClient<void>(`/inventory/${_id}`, { method: 'DELETE' });
}
