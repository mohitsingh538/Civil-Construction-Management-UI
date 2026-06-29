import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, HardHat, Plus, Search, Phone, Mail, IdCard, Upload, Filter } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import NeumorphicDatePicker from './ui/NeumorphicDatePicker';
import { useEmployees } from '@/hooks';

export default function EmployeeScreen() {
  const navigate = useNavigate();
  const { data: employees, isLoading, error } = useEmployees();
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading employees</span></div>;

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
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(20,184,166,0.2)',
                }}>
                <HardHat className="w-6 h-6 text-[#14B8A6]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Employee Management</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Metro Station - Phase 3</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] group-focus-within:text-[#14B8A6] transition" />
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                style={{
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              />
            </div>
            <AnimatedPressable className="p-2 bg-[#1E1E2E] rounded-xl flex items-center justify-center text-[#9CA3AF]"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <Filter className="w-5 h-5" />
            </AnimatedPressable>
            <AnimatedPressable
              onClick={() => setShowAddEmployee(true)}
              className="px-3 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 text-sm"
              style={{
                background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
                boxShadow: '0 8px 24px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Plus className="w-4 h-4" />
              Add Employee
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Employees', value: employees.length, color: '#9CA3AF' },
            { label: 'Active Today', value: '45', color: '#10B981' },
            { label: 'On Leave', value: '5', color: '#F59E0B' },
            { label: 'New This Month', value: '3', color: '#14B8A6' },
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

        {/* Employee Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="group relative bg-[#1E1E2E] rounded-[20px] p-5 transition-all duration-300 hover:bg-[#252532]"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                }}
              />

              <div className="relative">
                {/* Photo and Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
                      }}>
                      {employee.name.charAt(0)}
                    </div>

                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(20,184,166,0.3), transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 tracking-tight">{employee.name}</h3>
                    <p className="text-sm text-[#14B8A6] font-semibold">{employee.role}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-[#141420]">
                  <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-medium">
                    <Phone className="w-4 h-4 text-[#14B8A6]" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-medium">
                    <Mail className="w-4 h-4 text-[#14B8A6]" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                </div>

                {/* IDs */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <IdCard className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#6B7280]">PAN:</span>
                    <span className="font-semibold text-white">{employee.pan}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <IdCard className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#6B7280]">Aadhaar:</span>
                    <span className="font-semibold text-white">{employee.aadhaar}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <AnimatedPressable className="flex-1 px-3 py-2 bg-[#141420] rounded-xl text-sm font-semibold"
                    style={{
                      color: '#14B8A6',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                    View Details
                  </AnimatedPressable>
                  <AnimatedPressable className="flex-1 px-3 py-2 bg-[#141420] text-[#9CA3AF] rounded-xl text-sm font-semibold"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                    Edit
                  </AnimatedPressable>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal open={showAddEmployee} title="Add New Employee" maxWidth="max-w-2xl" onClose={() => setShowAddEmployee(false)}>
        <form className="space-y-5 pt-5">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Employee Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(45,212,191,0.1))',
                        borderColor: 'rgba(20,184,166,0.4)',
                      }}>
                      <Upload className="w-8 h-8 text-[#14B8A6]" />
                    </div>
                    <div>
                      <AnimatedPressable
                        type="button"
                        className="px-4 py-2 rounded-xl text-white font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
                          boxShadow: '0 4px 12px rgba(20,184,166,0.4)',
                        }}
                      >
                        Upload Photo
                      </AnimatedPressable>
                      <p className="text-xs text-[#6B7280] mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Full Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Role/Designation *</label>
                    <NeumorphicSelect
                      value=""
                      onChange={() => {}}
                      placeholder="Select role"
                      options={[
                        { value: '', label: 'Select role' },
                        { value: 'Site Supervisor', label: 'Site Supervisor' },
                        { value: 'Mason', label: 'Mason' },
                        { value: 'Helper', label: 'Helper' },
                        { value: 'Electrician', label: 'Electrician' },
                        { value: 'Plumber', label: 'Plumber' },
                        { value: 'Carpenter', label: 'Carpenter' },
                        { value: 'Painter', label: 'Painter' },
                      ]}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Identity Documents */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">PAN Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Aadhaar Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="1234-5678-9012"
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* Bank Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Bank Account Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">IFSC Code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="SBIN0001234"
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Date of Joining</label>
                    <NeumorphicDatePicker
                      value="2026-04-25"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Daily Wage (₹)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Address</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Enter full address"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => setShowAddEmployee(false)}
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
                      background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
                      boxShadow: '0 8px 24px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Add Employee
                  </AnimatedPressable>
                </div>
              </form>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
