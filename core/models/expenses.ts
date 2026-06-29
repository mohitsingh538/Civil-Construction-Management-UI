import type { Expense } from '../types';

export const expenses: Expense[] = [
  {
    id: 1,
    date: '2026-04-24',
    description: 'Cement delivery - 200 bags',
    category: 'Materials',
    amount: 76000,
    vendor: 'Shree Cement Ltd.',
    hasReceipt: true,
  },
  {
    id: 2,
    date: '2026-04-23',
    description: 'Labour payment - Week 16',
    category: 'Labour',
    amount: 125000,
    vendor: 'Weekly Wages',
    hasReceipt: false,
  },
  {
    id: 3,
    date: '2026-04-22',
    description: 'Equipment rental - JCB',
    category: 'Equipment',
    amount: 8500,
    vendor: 'Metro Machinery',
    hasReceipt: true,
  },
  {
    id: 4,
    date: '2026-04-22',
    description: 'Electrical supplies',
    category: 'Materials',
    amount: 12300,
    vendor: 'Voltage Traders',
    hasReceipt: true,
  },
  {
    id: 5,
    date: '2026-04-21',
    description: 'Safety equipment - helmets, vests',
    category: 'Safety',
    amount: 4200,
    vendor: 'SafetyFirst Co.',
    hasReceipt: true,
  },
];
