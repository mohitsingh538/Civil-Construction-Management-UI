import type { Site } from '../../types';
import { sites as mockSites } from '../../models/sites';
import { apiClient } from './client';

export async function getSites(): Promise<Site[]> {
  return Promise.resolve([...mockSites]);
  // return apiClient<Site[]>('/sites');
}

export async function getSite(id: number): Promise<Site | undefined> {
  return Promise.resolve(mockSites.find(s => s.id === id));
  // return apiClient<Site>(`/sites/${id}`);
}
