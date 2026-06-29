import type { Tender, CreateTenderInput, UpdateTenderInput } from '../../types';
import { tenders as mockTenders } from '../../models/tenders';
import { apiClient } from './client';

export async function getTenders(): Promise<Tender[]> {
  return Promise.resolve([...mockTenders]);
  // return apiClient<Tender[]>('/tenders');
}

export async function getTender(id: number): Promise<Tender | undefined> {
  return Promise.resolve(mockTenders.find(t => t.id === id));
  // return apiClient<Tender>(`/tenders/${id}`);
}

export async function createTender(data: CreateTenderInput): Promise<Tender> {
  const newTender: Tender = { id: Date.now(), ...data };
  return Promise.resolve(newTender);
  // return apiClient<Tender>('/tenders', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTender(id: number, data: UpdateTenderInput): Promise<Tender | undefined> {
  const tender = mockTenders.find(t => t.id === id);
  if (!tender) return Promise.resolve(undefined);
  return Promise.resolve({ ...tender, ...data });
  // return apiClient<Tender>(`/tenders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
