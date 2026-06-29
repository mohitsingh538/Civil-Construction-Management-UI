import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../../types';
import { employees as mockEmployees } from '../../models/employees';
import { apiClient } from './client';

export async function getEmployees(): Promise<Employee[]> {
  return Promise.resolve([...mockEmployees]);
  // return apiClient<Employee[]>('/employees');
}

export async function getEmployee(id: number): Promise<Employee | undefined> {
  return Promise.resolve(mockEmployees.find(e => e.id === id));
  // return apiClient<Employee>(`/employees/${id}`);
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  const newEmployee: Employee = { id: Date.now(), ...data };
  return Promise.resolve(newEmployee);
  // return apiClient<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateEmployee(id: number, data: UpdateEmployeeInput): Promise<Employee | undefined> {
  const employee = mockEmployees.find(e => e.id === id);
  if (!employee) return Promise.resolve(undefined);
  return Promise.resolve({ ...employee, ...data });
  // return apiClient<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteEmployee(_id: number): Promise<void> {
  return Promise.resolve();
  // return apiClient<void>(`/employees/${_id}`, { method: 'DELETE' });
}
