import type { Invoice } from '../types';

export const invoices: Invoice[] = [
  {
    id: 1,
    invoiceNo: 'INV-2026-001',
    date: '2026-04-20',
    client: 'Mumbai Metro Corp',
    items: 3,
    subtotal: 850000,
    gst: 153000,
    total: 1003000,
    status: 'paid',
  },
  {
    id: 2,
    invoiceNo: 'INV-2026-002',
    date: '2026-04-15',
    client: 'Skyline Developers',
    items: 5,
    subtotal: 1250000,
    gst: 225000,
    total: 1475000,
    status: 'pending',
  },
];
