import { useQuery } from './useQuery';
import { getCompanies } from '@core/services/api/companyApi';
import { companies as initialData } from '@core/models/companies';

export function useCompanies() {
  return useQuery({ key: 'companies', fetchFn: getCompanies, initialData });
}
