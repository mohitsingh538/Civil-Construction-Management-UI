import type { Expense } from '../types';

/**
 * Sum the amounts of all expenses.
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * Group expenses by category and return totals per category.
 */
export function groupExpensesByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] ?? 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
}
