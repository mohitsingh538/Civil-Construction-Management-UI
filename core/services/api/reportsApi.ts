import type { DailyReport, CreateDailyReportInput } from '../../types';
import { reports as mockReports } from '../../models/reports';
import { apiClient } from './client';

export async function getReports(): Promise<DailyReport[]> {
  return Promise.resolve([...mockReports]);
  // return apiClient<DailyReport[]>('/reports');
}

export async function getReport(id: number): Promise<DailyReport | undefined> {
  return Promise.resolve(mockReports.find(r => r.id === id));
  // return apiClient<DailyReport>(`/reports/${id}`);
}

export async function createReport(data: CreateDailyReportInput): Promise<DailyReport> {
  const newReport: DailyReport = { id: Date.now(), ...data };
  return Promise.resolve(newReport);
  // return apiClient<DailyReport>('/reports', { method: 'POST', body: JSON.stringify(data) });
}
