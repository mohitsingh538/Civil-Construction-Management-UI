import { useQuery } from './useQuery';
import { getPayrollEntries } from '@core/services/api/payrollApi';
import { payrollData as initialData } from '@core/models/payroll';

export function usePayroll() {
  return useQuery({ key: 'payroll', fetchFn: getPayrollEntries, initialData });
}
