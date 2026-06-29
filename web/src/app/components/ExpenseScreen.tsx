import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Plus, ImageIcon, Calendar, IndianRupee, FileText, Filter, Download } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import NeumorphicDatePicker from './ui/NeumorphicDatePicker';
import { calculateTotalExpenses } from '@core/services/expenseService';
import { EXPENSE_CATEGORIES } from '@core/constants';
import { useExpenses } from '@/hooks';

const categories = [...EXPENSE_CATEGORIES];

export default function ExpenseScreen() {
  const navigate = useNavigate();
  const { data: expenses, isLoading, error } = useExpenses();
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading expenses</span></div>;

  const totalExpenses = calculateTotalExpenses(expenses ?? []);

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
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.2)',
                }}>
                <Receipt className="w-6 h-6 text-[#F59E0B]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Expense Tracking</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Metro Station - Phase 3</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
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
            <AnimatedPressable
              onClick={() => setShowAddExpense(true)}
              className="px-3 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 text-sm"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                boxShadow: '0 8px 24px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Plus className="w-4 h-4" />
              Add Expense
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(132px + env(safe-area-inset-bottom))' }}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total This Month', value: `₹${(totalExpenses / 1000).toFixed(1)}k`, color: '#F59E0B' },
            { label: 'This Week', value: '₹84.5k', color: '#FBBF24' },
            { label: 'Today', value: '₹76k', color: '#F59E0B' },
            { label: 'Total Entries', value: expenses.length, color: '#9CA3AF' },
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

        {/* Expense List */}
        <div className="space-y-5">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="group relative bg-[#1E1E2E] rounded-[20px] p-6 transition-all duration-300 hover:bg-[#252532]"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                }}
              />

              <div className="relative">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.3)',
                      }}>
                      <Receipt className="w-8 h-8 text-[#F59E0B]" />
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.3), transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  {/* Expense Details */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg tracking-tight">{expense.description}</h3>
                        <div className="text-2xl font-bold text-[#F59E0B] flex-shrink-0">₹{expense.amount.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#9CA3AF] font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(expense.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="hidden sm:inline text-[#4B5563]">|</span>
                        <span className="truncate">{expense.vendor}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="px-3 py-1.5 bg-orange-500/10 text-[#F59E0B] rounded-xl text-xs font-bold"
                        style={{
                          boxShadow: 'inset 0 1px 3px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.2)',
                        }}>
                        {expense.category}
                      </span>
                      {expense.hasReceipt && (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-[#10B981] rounded-xl text-xs font-bold"
                          style={{
                            boxShadow: 'inset 0 1px 3px rgba(16,185,129,0.2), 0 0 0 1px rgba(16,185,129,0.2)',
                          }}>
                          <ImageIcon className="w-3.5 h-3.5" />
                          Receipt attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal open={showAddExpense} title="Add New Expense" maxWidth="max-w-lg" onClose={() => setShowAddExpense(false)}>
        <form className="space-y-4 pt-5">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Description</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Enter expense description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Date</label>
                    <NeumorphicDatePicker
                      value="2026-04-25"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Category</label>
                  <NeumorphicSelect
                    value=""
                    onChange={() => {}}
                    placeholder="Select category"
                    options={[
                      { value: '', label: 'Select category' },
                      ...categories.map((cat) => ({ value: cat, label: cat })),
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Vendor/Payee</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Enter vendor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Receipt/Bill</label>
                  <div className="bg-[#141420] rounded-xl p-6 text-center transition cursor-pointer"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.2)',
                    }}>
                    <ImageIcon className="w-12 h-12 text-[#6B7280] mx-auto mb-2" />
                    <p className="text-sm text-[#9CA3AF] mb-1">Click to upload receipt image</p>
                    <p className="text-xs text-[#6B7280]">PNG, JPG up to 10MB</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-medium"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    Cancel
                  </AnimatedPressable>
                  <AnimatedPressable
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                      boxShadow: '0 8px 24px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Add Expense
                  </AnimatedPressable>
                </div>
              </form>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
