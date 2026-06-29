import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Package, Plus, Minus, Barcode, Search, AlertTriangle, Filter, TrendingUp } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import { getInventoryStatusColor, getInventoryProgressColor } from '@core/services/inventoryService';
import { useInventory } from '@/hooks';

export default function InventoryScreen() {
  const navigate = useNavigate();
  const { data: inventoryItems, isLoading, error } = useInventory();
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getStatusColor = getInventoryStatusColor;
  const getProgressColor = getInventoryProgressColor;

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading inventory</span></div>;

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] flex flex-col">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[#16161F] border-b border-white/[0.07]"
        style={{
          paddingTop: 'var(--safe-top)',
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
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.2)',
                }}>
                <Package className="w-6 h-6 text-[#3B82F6]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Inventory Management</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Metro Station - Phase 3</p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] group-focus-within:text-[#3B82F6] transition" />
              <input
                type="text"
                placeholder="Search materials..."
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
              onClick={() => setShowAddStock(true)}
              className="px-3 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 text-sm"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                boxShadow: '0 8px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Plus className="w-4 h-4" />
              Add Item
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(132px + env(safe-area-inset-bottom))' }}>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Items', value: inventoryItems.length, color: '#3B82F6' },
            { label: 'Low Stock', value: inventoryItems.filter(i => i.status === 'low').length, color: '#F59E0B' },
            { label: 'Critical', value: inventoryItems.filter(i => i.status === 'critical').length, color: '#EF4444' },
            { label: 'Total Value', value: '₹12.5L', color: '#10B981' },
          ].map((stat, i) => (
            <div key={i} className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              {/* Metallic gloss */}
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

        {/* Inventory Items List */}
        <div className="space-y-5">
          {inventoryItems.map((item) => (
            <div
              key={item.id}
              className="group relative"
            >
              <div className="relative bg-[#1E1E2E] rounded-[20px] p-6 transition-all duration-300 hover:bg-[#252532]"
                style={{
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                {/* Metallic gloss */}
                <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                  }}
                />

                <div className="relative">
                  {/* Top Section: Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.3)',
                        }}>
                        <Package className="w-8 h-8 text-[#3B82F6]" />
                      </div>

                      {/* Colored glow on hover */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)',
                          filter: 'blur(12px)',
                        }}
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg tracking-tight mb-2">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                          item.status === 'critical' ? 'bg-red-500/10 text-[#EF4444]' :
                          item.status === 'low' ? 'bg-orange-500/10 text-[#F59E0B]' :
                          'bg-green-500/10 text-[#10B981]'
                        }`}
                          style={{
                            boxShadow: item.status === 'critical' ? 'inset 0 1px 3px rgba(239,68,68,0.2), 0 0 0 1px rgba(239,68,68,0.2)' :
                                       item.status === 'low' ? 'inset 0 1px 3px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.2)' :
                                       'inset 0 1px 3px rgba(16,185,129,0.2), 0 0 0 1px rgba(16,185,129,0.2)',
                          }}>
                          {(item.status === 'critical' || item.status === 'low') && <AlertTriangle className="w-3.5 h-3.5" />}
                          {item.status === 'critical' ? 'Critical' : item.status === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                        <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider md:hidden">
                          Total: <span className="text-[#3B82F6]">₹{((item.stock * item.unitCost) / 1000).toFixed(1)}k</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#9CA3AF] font-medium">
                        <span>Stock: <span className="font-bold text-white">{item.stock} {item.unit}</span></span>
                        <span className="hidden sm:inline text-[#4B5563]">|</span>
                        <span>Min: {item.minStock} {item.unit}</span>
                        <span className="hidden sm:inline text-[#4B5563]">|</span>
                        <span>₹{item.unitCost.toLocaleString()}/{item.unit}</span>
                      </div>
                    </div>

                    {/* Stock Value - Hidden on mobile */}
                    <div className="hidden md:block text-right flex-shrink-0">
                      <div className="text-xs text-[#6B7280] font-bold uppercase tracking-wider mb-1">Total Value</div>
                      <div className="text-xl font-bold text-[#3B82F6]">
                        ₹{((item.stock * item.unitCost) / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Actions */}
                  <div className="flex items-center gap-2">
                    <AnimatedPressable className="p-2.5 bg-[#1E1E2E] rounded-xl text-[#3B82F6]"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Barcode className="w-5 h-5" />
                    </AnimatedPressable>
                    <AnimatedPressable
                      onClick={() => {
                        setSelectedItem(item);
                        setShowAddStock(true);
                      }}
                      className="p-2.5 bg-[#1E1E2E] rounded-xl text-[#10B981]"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Plus className="w-5 h-5" />
                    </AnimatedPressable>
                    <AnimatedPressable className="p-2.5 bg-[#1E1E2E] rounded-xl text-[#EF4444]"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>
                      <Minus className="w-5 h-5" />
                    </AnimatedPressable>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mt-5">
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-2.5 font-semibold">
                    <span>Stock Level</span>
                    <span className="text-white">{((item.stock / item.minStock) * 100).toFixed(0)}% of minimum</span>
                  </div>
                  <div className="h-2.5 bg-[#141420] rounded-full overflow-hidden"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                    }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%`,
                        backgroundColor: item.status === 'critical' ? '#EF4444' : item.status === 'low' ? '#F59E0B' : '#10B981',
                        boxShadow: `0 0 12px ${item.status === 'critical' ? '#EF4444' : item.status === 'low' ? '#F59E0B' : '#10B981'}80`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Stock Modal */}
      <Modal open={showAddStock} title={selectedItem ? `Adjust Stock: ${selectedItem.name}` : 'Add New Item'} maxWidth="max-w-md" onClose={() => { setShowAddStock(false); setSelectedItem(null); }}>
        <form className="space-y-4 pt-5">
                {!selectedItem && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Item Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                        }}
                        placeholder="Enter item name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Unit</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                          style={{
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                          }}
                          placeholder="e.g., bags, tons"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Unit Cost (₹)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                          style={{
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                      {selectedItem ? 'Add Quantity' : 'Initial Stock'}
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Min Stock Level</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => {
                      setShowAddStock(false);
                      setSelectedItem(null);
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
                      background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                      boxShadow: '0 8px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    {selectedItem ? 'Update' : 'Add Item'}
                  </AnimatedPressable>
                </div>
              </form>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
