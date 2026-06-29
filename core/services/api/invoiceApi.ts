import type { Invoice, CreateInvoiceInput, UpdateInvoiceInput } from '../../types';
import { invoices as mockInvoices } from '../../models/invoices';
import { apiClient } from './client';

export async function getInvoices(): Promise<Invoice[]> {
  return Promise.resolve([...mockInvoices]);
  // return apiClient<Invoice[]>('/invoices');
}

export async function getInvoice(id: number): Promise<Invoice | undefined> {
  return Promise.resolve(mockInvoices.find(inv => inv.id === id));
  // return apiClient<Invoice>(`/invoices/${id}`);
}

export async function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  const newInvoice: Invoice = { id: Date.now(), ...data };
  return Promise.resolve(newInvoice);
  // return apiClient<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateInvoice(id: number, data: UpdateInvoiceInput): Promise<Invoice | undefined> {
  const invoice = mockInvoices.find(inv => inv.id === id);
  if (!invoice) return Promise.resolve(undefined);
  return Promise.resolve({ ...invoice, ...data });
  // return apiClient<Invoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteInvoice(_id: number): Promise<void> {
  return Promise.resolve();
  // return apiClient<void>(`/invoices/${_id}`, { method: 'DELETE' });
}
