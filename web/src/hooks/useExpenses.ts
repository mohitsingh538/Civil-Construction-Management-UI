import { useQuery } from './useQuery';
import { getExpenses } from '@core/services/api/expenseApi';
import { expenses as initialData } from '@core/models/expenses';

export function useExpenses() {
  return useQuery({ key: 'expenses', fetchFn: getExpenses, initialData });
}
