import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../../types';
import { expenses as mockExpenses } from '../../models/expenses';
import { apiClient } from './client';

export async function getExpenses(): Promise<Expense[]> {
  return Promise.resolve([...mockExpenses]);
  // return apiClient<Expense[]>('/expenses');
}

export async function getExpense(id: number): Promise<Expense | undefined> {
  return Promise.resolve(mockExpenses.find(e => e.id === id));
  // return apiClient<Expense>(`/expenses/${id}`);
}

export async function createExpense(data: CreateExpenseInput): Promise<Expense> {
  const newExpense: Expense = { id: Date.now(), ...data };
  return Promise.resolve(newExpense);
  // return apiClient<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateExpense(id: number, data: UpdateExpenseInput): Promise<Expense | undefined> {
  const expense = mockExpenses.find(e => e.id === id);
  if (!expense) return Promise.resolve(undefined);
  return Promise.resolve({ ...expense, ...data });
  // return apiClient<Expense>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteExpense(_id: number): Promise<void> {
  return Promise.resolve();
  // return apiClient<void>(`/expenses/${_id}`, { method: 'DELETE' });
}
