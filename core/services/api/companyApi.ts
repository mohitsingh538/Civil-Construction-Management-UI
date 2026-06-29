import type { Company, CreateCompanyInput } from '../../types';
import { companies as mockCompanies } from '../../models/companies';
import { apiClient } from './client';

const COMPANY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

let nextCompanyId = mockCompanies.length + 1;

export async function getCompanies(): Promise<Company[]> {
  return Promise.resolve([...mockCompanies]);
  // return apiClient<Company[]>('/companies');
}

export async function getCompany(id: number): Promise<Company | undefined> {
  return Promise.resolve(mockCompanies.find(c => c.id === id));
  // return apiClient<Company>(`/companies/${id}`);
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const color = COMPANY_COLORS[(nextCompanyId - 1) % COMPANY_COLORS.length];
  const company: Company = {
    id: nextCompanyId++,
    name: input.name,
    sites: 0,
    employees: 0,
    location: `${input.city}, ${input.state}`,
    color,
  };
  mockCompanies.push(company);
  return Promise.resolve(company);
  // const body = new FormData();
  // ...append fields including input.logo
  // return apiClient<Company>('/companies', { method: 'POST', body });
}
