import type { PayrollEntry, CreatePayrollEntryInput, UpdatePayrollEntryInput } from '../../types';
import { payrollData as mockPayroll } from '../../models/payroll';
import { apiClient } from './client';

export async function getPayrollEntries(): Promise<PayrollEntry[]> {
  return Promise.resolve([...mockPayroll]);
  // return apiClient<PayrollEntry[]>('/payroll');
}

export async function getPayrollEntry(id: number): Promise<PayrollEntry | undefined> {
  return Promise.resolve(mockPayroll.find(e => e.id === id));
  // return apiClient<PayrollEntry>(`/payroll/${id}`);
}

export async function createPayrollEntry(data: CreatePayrollEntryInput): Promise<PayrollEntry> {
  const newEntry: PayrollEntry = { id: Date.now(), ...data };
  return Promise.resolve(newEntry);
  // return apiClient<PayrollEntry>('/payroll', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePayrollEntry(id: number, data: UpdatePayrollEntryInput): Promise<PayrollEntry | undefined> {
  const entry = mockPayroll.find(e => e.id === id);
  if (!entry) return Promise.resolve(undefined);
  return Promise.resolve({ ...entry, ...data });
  // return apiClient<PayrollEntry>(`/payroll/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

// Triggers bulk payroll run for the given period on the backend.
export async function processPayroll(_period: string): Promise<PayrollEntry[]> {
  return Promise.resolve([...mockPayroll]);
  // return apiClient<PayrollEntry[]>('/payroll/process', { method: 'POST', body: JSON.stringify({ period: _period }) });
}
