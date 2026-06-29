import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput, EquipmentStatus } from '../../types';
import { equipment as mockEquipment } from '../../models/equipment';
import { apiClient } from './client';

export async function getEquipment(): Promise<Equipment[]> {
  return Promise.resolve([...mockEquipment]);
  // return apiClient<Equipment[]>('/equipment');
}

export async function getEquipmentItem(id: number): Promise<Equipment | undefined> {
  return Promise.resolve(mockEquipment.find(e => e.id === id));
  // return apiClient<Equipment>(`/equipment/${id}`);
}

export async function createEquipmentItem(data: CreateEquipmentInput): Promise<Equipment> {
  const newItem: Equipment = { id: Date.now(), ...data };
  return Promise.resolve(newItem);
  // return apiClient<Equipment>('/equipment', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateEquipmentStatus(id: number, status: EquipmentStatus): Promise<Equipment | undefined> {
  const item = mockEquipment.find(e => e.id === id);
  if (!item) return Promise.resolve(undefined);
  return Promise.resolve({ ...item, status });
  // return apiClient<Equipment>(`/equipment/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function updateEquipmentItem(id: number, data: UpdateEquipmentInput): Promise<Equipment | undefined> {
  const item = mockEquipment.find(e => e.id === id);
  if (!item) return Promise.resolve(undefined);
  return Promise.resolve({ ...item, ...data });
  // return apiClient<Equipment>(`/equipment/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
