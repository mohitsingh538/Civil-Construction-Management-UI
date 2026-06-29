import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Truck, Plus, Calendar, MapPin, Filter } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import NeumorphicDatePicker from './ui/NeumorphicDatePicker';
import NeumorphicTimePicker from './ui/NeumorphicTimePicker';
import { getEquipmentStatusBadge, getEquipmentStats } from '@core/services/equipmentService';
import { useEquipment } from '@/hooks';

export default function EquipmentScreen() {
  const navigate = useNavigate();
  const { data: equipment, isLoading, error } = useEquipment();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const getStatusBadge = getEquipmentStatusBadge;
  const { available: availableCount, inUse: inUseCount, maintenance: maintenanceCount } = getEquipmentStats(equipment ?? []);

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading equipment</span></div>;

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
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(6,182,212,0.2)',
                }}>
                <Truck className="w-6 h-6 text-[#06B6D4]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Equipment & Assets</h1>
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
            <AnimatedPressable className="px-3 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 text-sm"
              style={{
                background: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
                boxShadow: '0 8px 24px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Plus className="w-4 h-4" />
              Add Equipment
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Assets', value: equipment.length, color: '#9CA3AF' },
            { label: 'Available', value: availableCount, color: '#10B981' },
            { label: 'In Use', value: inUseCount, color: '#3B82F6' },
            { label: 'Maintenance', value: maintenanceCount, color: '#F59E0B' },
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

        {/* Equipment List */}
        <div className="grid md:grid-cols-2 gap-4">
          {equipment.map((item) => {
            const statusBadge = getStatusBadge(item.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div
                key={item.id}
                className="group relative bg-[#1E1E2E] rounded-[20px] p-5 transition-all duration-300 hover:bg-[#252532]"
                style={{
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                  }}
                />

                <div className="relative flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.3)',
                      }}>
                      <Truck className="w-8 h-8 text-[#06B6D4]" />
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white mb-1 tracking-tight">{item.name}</h3>
                        <p className="text-sm text-[#6B7280]">Asset ID: {item.assetId}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 ${statusBadge.bgColor}`}
                        style={{
                          color: statusBadge.color,
                          boxShadow: `inset 0 1px 3px ${statusBadge.color}33, 0 0 0 1px ${statusBadge.color}33`,
                        }}>
                        <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-[#141420]">
                      <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-medium">
                        <MapPin className="w-4 h-4 text-[#06B6D4]" />
                        <span>{item.location}</span>
                      </div>
                      {item.checkedOutBy && (
                        <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-medium">
                          <Calendar className="w-4 h-4 text-[#06B6D4]" />
                          <span>Checked out by {item.checkedOutBy} on {new Date(item.checkedOutDate!).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-[#6B7280]">
                        Next maintenance: {new Date(item.nextMaintenance).toLocaleDateString('en-IN')}
                      </div>
                      {item.status === 'in-use' && (
                        <div className="text-xs text-[#3B82F6] font-semibold">
                          {Math.ceil((new Date().getTime() - new Date(item.checkedOutDate!).getTime()) / (1000 * 60 * 60 * 24))} days in use
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status === 'available' && (
                        <AnimatedPressable
                          onClick={() => {
                            setSelectedEquipment(item);
                            setShowCheckout(true);
                          }}
                          className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
                            boxShadow: '0 4px 12px rgba(6,182,212,0.4)',
                          }}
                        >
                          Check Out
                        </AnimatedPressable>
                      )}
                      {item.status === 'in-use' && (
                        <AnimatedPressable className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                          }}>
                          Check In
                        </AnimatedPressable>
                      )}
                      {item.status === 'maintenance' && (
                        <AnimatedPressable className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                            boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
                          }}>
                          Mark Available
                        </AnimatedPressable>
                      )}
                      <AnimatedPressable className="px-3 py-2.5 bg-[#141420] text-[#9CA3AF] rounded-xl text-sm font-semibold"
                        style={{
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}>
                        View History
                      </AnimatedPressable>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Check Out Modal */}
      <Modal open={!!(showCheckout && selectedEquipment)} title="Check Out Equipment" maxWidth="max-w-md" onClose={() => { setShowCheckout(false); setSelectedEquipment(null); }}>
        {selectedEquipment && (
          <>
            <div className="bg-[#141420] rounded-xl p-4 mt-5 mb-5"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(6,182,212,0.2)',
                }}>
                <div className="font-bold text-white mb-1">{selectedEquipment.name}</div>
                <div className="text-sm text-[#9CA3AF]">Asset ID: {selectedEquipment.assetId}</div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Assigned To</label>
                  <NeumorphicSelect
                    value="Rajesh Kumar - Site Supervisor"
                    onChange={() => {}}
                    isSearchable
                    options={[
                      { value: 'Rajesh Kumar - Site Supervisor', label: 'Rajesh Kumar - Site Supervisor' },
                      { value: 'Amit Sharma - Senior Mason', label: 'Amit Sharma - Senior Mason' },
                      { value: 'Suresh Yadav - Electrician', label: 'Suresh Yadav - Electrician' },
                      { value: 'Dinesh Patil - Plumber', label: 'Dinesh Patil - Plumber' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Checkout Date & Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <NeumorphicDatePicker
                      value={new Date().toISOString().slice(0, 10)}
                      onChange={() => {}}
                    />
                    <NeumorphicTimePicker
                      value={new Date().toTimeString().slice(0, 5)}
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Location/Site</label>
                  <NeumorphicSelect
                    value="Site A - Block 1"
                    onChange={() => {}}
                    options={[
                      { value: 'Site A - Block 1', label: 'Site A - Block 1' },
                      { value: 'Site A - Block 2', label: 'Site A - Block 2' },
                      { value: 'Site A - Block 3', label: 'Site A - Block 3' },
                      { value: 'Site B - Foundation', label: 'Site B - Foundation' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Expected Return Date</label>
                  <NeumorphicDatePicker
                    value=""
                    onChange={() => {}}
                    placeholder="Select return date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Any notes about usage, condition, etc."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => {
                      setShowCheckout(false);
                      setSelectedEquipment(null);
                    }}
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
                      background: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
                      boxShadow: '0 8px 24px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Confirm Check Out
                  </AnimatedPressable>
                </div>
              </form>
          </>
        )}
      </Modal>

      <BottomNavbar />
    </div>
  );
}
