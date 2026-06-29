import type { PayrollEntry, PayrollCalculation, PayrollTotals } from '../types';

/**
 * Calculate payroll breakdown for a single employee.
 */
export function calculatePayroll(employee: PayrollEntry): PayrollCalculation {
  const basicSalary = employee.daysWorked * employee.dailyWage;
  const gross = basicSalary + employee.overtime + employee.bonus;
  const deductions = employee.pf + employee.esi + employee.advances;
  const net = gross - deductions;
  return { basicSalary, gross, deductions, net };
}

/**
 * Aggregate payroll totals across all employees.
 */
export function calculatePayrollTotals(employees: PayrollEntry[]): PayrollTotals {
  return employees.reduce(
    (acc, emp) => {
      const calc = calculatePayroll(emp);
      return {
        gross: acc.gross + calc.gross,
        deductions: acc.deductions + calc.deductions,
        net: acc.net + calc.net,
      };
    },
    { gross: 0, deductions: 0, net: 0 }
  );
}
