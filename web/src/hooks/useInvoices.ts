import { useQuery } from './useQuery';
import { getInvoices } from '@core/services/api/invoiceApi';
import { invoices as initialData } from '@core/models/invoices';

export function useInvoices() {
  return useQuery({ key: 'invoices', fetchFn: getInvoices, initialData });
}
