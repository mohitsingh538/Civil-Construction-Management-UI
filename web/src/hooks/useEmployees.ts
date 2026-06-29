import { useQuery } from './useQuery';
import { getEmployees } from '@core/services/api/employeeApi';
import { employees as initialData } from '@core/models/employees';

export function useEmployees() {
  return useQuery({ key: 'employees', fetchFn: getEmployees, initialData });
}
