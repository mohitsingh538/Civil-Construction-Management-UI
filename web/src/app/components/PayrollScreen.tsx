import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, IndianRupee, Calendar, Download, Send, Filter, FileText } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import { calculatePayroll, calculatePayrollTotals } from '@core/services/payrollService';
import { usePayroll } from '@/hooks';

export default function PayrollScreen() {
  const navigate = useNavigate();
  const { data: payrollData, isLoading, error } = usePayroll();
  const [selectedPeriod, setSelectedPeriod] = useState('april-2026');

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading payroll</span></div>;

  const totals = calculatePayrollTotals(payrollData ?? []);

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] flex flex-col">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[#16161F] border-b border-white/[0.07]"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <AnimatedPressable
              onClick={() => navigate('/site')}
              className="p-2.5 bg-[#1E1E2E] rounded-xl"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <ArrowLeft className="w-5 h-5 text-[#9CA3AF]" />
            </AnimatedPressable>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#141420] rounded-xl flex items-center justify-center"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.2)',
                }}>
                <IndianRupee className="w-6 h-6 text-[#10B981]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Payroll Management</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Metro Station - Phase 3</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <NeumorphicSelect
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={[
                  { value: 'april-2026', label: 'April 2026' },
                  { value: 'march-2026', label: 'March 2026' },
                  { value: 'february-2026', label: 'February 2026' },
                ]}
              />
            </div>
            <AnimatedPressable className="p-2 bg-[#1E1E2E] rounded-xl flex items-center justify-center text-[#9CA3AF]"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <Filter className="w-5 h-5" />
            </AnimatedPressable>
            <AnimatedPressable className="px-3 py-2 bg-[#1E1E2E] rounded-xl flex items-center gap-1.5 text-[#9CA3AF] font-medium text-sm"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <Download className="w-4 h-4" />
              Export
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Employees', value: payrollData.length, color: '#9CA3AF' },
            { label: 'Gross Payroll', value: `₹${(totals.gross / 1000).toFixed(0)}k`, color: '#10B981' },
            { label: 'Deductions', value: `₹${(totals.deductions / 1000).toFixed(0)}k`, color: '#EF4444' },
            { label: 'Net Payable', value: `₹${(totals.net / 1000).toFixed(0)}k`, color: '#10B981' },
          ].map((stat, i) => (
            <div key={i} className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.06), transparent 50%)',
                }}
              />

              <div className="relative">
                <div className="text-sm text-[#9CA3AF] font-semibold mb-1">{stat.label}</div>
                <div className="text-3xl font-bold tracking-tight"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 20px ${stat.color}60`,
                  }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payroll Table */}
        <div className="relative bg-[#1E1E2E] rounded-[20px] overflow-hidden"
          style={{
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          <div className="absolute inset-0 rounded-[20px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.04), transparent 50%)',
            }}
          />

          <div className="relative overflow-x-auto">
            <table className="w-full">
              <thead className="text-white"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #34D399)',
                }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Days</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Basic</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">OT</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Bonus</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Gross</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">PF</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">ESI</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Advance</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">Net Pay</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141420]">
                {payrollData.map((employee) => {
                  const calc = calculatePayroll(employee);
                  return (
                    <tr key={employee.id} className="hover:bg-[#252532] transition">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-bold text-white">{employee.name}</div>
                          <div className="text-xs text-[#6B7280]">{employee.role}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white">{employee.daysWorked}</td>
                      <td className="px-4 py-4 text-sm text-right text-white">₹{calc.basicSalary.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-[#9CA3AF]">₹{employee.overtime.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-[#9CA3AF]">₹{employee.bonus.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-[#10B981]">₹{calc.gross.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-[#EF4444]">₹{employee.pf.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-[#EF4444]">₹{employee.esi.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-[#EF4444]">₹{employee.advances.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-[#10B981]">₹{calc.net.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <AnimatedPressable className="p-2 bg-[#141420] text-[#10B981] rounded-xl"
                          style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                          }}>
                          <FileText className="w-4 h-4" />
                        </AnimatedPressable>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#141420]"
                style={{
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
                }}>
                <tr className="font-bold">
                  <td className="px-4 py-4 text-white" colSpan={5}>Total</td>
                  <td className="px-4 py-4 text-right text-[#10B981]">₹{totals.gross.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-[#EF4444]" colSpan={3}>-₹{totals.deductions.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-[#10B981]">₹{totals.net.toLocaleString()}</td>
                  <td className="px-4 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <AnimatedPressable className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #10B981, #34D399)',
              boxShadow: '0 8px 24px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>
            <Send className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Process Payroll & Generate Slips</span>
            <span className="sm:hidden">Process Payroll</span>
          </AnimatedPressable>
          <AnimatedPressable className="px-6 py-3 bg-[#1E1E2E] rounded-xl text-[#9CA3AF] font-semibold flex items-center justify-center gap-2"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
            <Download className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Download All Payslips</span>
            <span className="sm:hidden">Download Payslips</span>
          </AnimatedPressable>
        </div>

        {/* Payment Info */}
        <div className="mt-6 relative bg-[#1E1E2E] rounded-[20px] p-5"
          style={{
            boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          <div className="absolute inset-0 rounded-[20px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.06), transparent 50%)',
            }}
          />

          <div className="relative">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2 tracking-tight">
              <IndianRupee className="w-5 h-5 text-[#10B981]" />
              Payment Summary for April 2026
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[#9CA3AF]">Total Gross Amount:</span>
                <span className="ml-2 font-bold text-white">₹{totals.gross.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF]">Total Deductions:</span>
                <span className="ml-2 font-bold text-[#EF4444]">₹{totals.deductions.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF]">Net Payable Amount:</span>
                <span className="ml-2 font-bold text-[#10B981]">₹{totals.net.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
