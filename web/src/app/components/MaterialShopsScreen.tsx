import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Store, MapPin, Phone, Star, Navigation, Search, Package, IndianRupee, TrendingUp, Clock } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import { filterShopsByPincode } from '@core/services/materialShopsService';
import { useMaterialShops } from '@/hooks';

export default function MaterialShopsScreen() {
  const navigate = useNavigate();
  const { data: materialShops, isLoading, error } = useMaterialShops();
  const [searchPincode, setSearchPincode] = useState('400001');
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [showInventory, setShowInventory] = useState(false);

  const filteredShops = filterShopsByPincode(materialShops ?? [], searchPincode);

  const handleUseGeolocation = () => {
    setSearchPincode('400001');
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading shops</span></div>;

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
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(236,72,153,0.2)',
                }}>
                <Store className="w-6 h-6 text-[#EC4899]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Material Shops</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Find suppliers near you</p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                value={searchPincode}
                onChange={(e) => setSearchPincode(e.target.value)}
                placeholder="Enter PIN Code"
                className="w-full pl-12 pr-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                style={{
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              />
            </div>
            <AnimatedPressable
              onClick={handleUseGeolocation}
              className="px-5 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                boxShadow: '0 8px 24px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Navigation className="w-5 h-5" />
              <span className="hidden sm:inline">Use My Location</span>
              <span className="sm:hidden">Location</span>
            </AnimatedPressable>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(132px + env(safe-area-inset-bottom))' }}>
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-[#9CA3AF] font-medium">
            Found <span className="text-white font-bold">{filteredShops.length}</span> shops near PIN Code <span className="text-[#EC4899] font-bold">{searchPincode || 'All Areas'}</span>
          </p>
        </div>

        {/* Shops List */}
        <div className="grid md:grid-cols-2 gap-5">
          {filteredShops.map((shop) => (
            <AnimatedPressable
              key={shop.id}
              as="div"
              className="group relative bg-[#1E1E2E] rounded-[20px] p-6"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              onClick={() => {
                setSelectedShop(shop);
                setShowInventory(true);
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                }}
              />

              <div className="relative">
                {/* Shop Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(236,72,153,0.3)',
                      }}>
                      <Store className="w-8 h-8 text-[#EC4899]" />
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg tracking-tight mb-2">{shop.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                        <span className="text-sm font-bold text-white">{shop.rating}</span>
                      </div>
                      <span className="text-[#6B7280]">•</span>
                      <div className="flex items-center gap-1 text-sm text-[#9CA3AF] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#EC4899]" />
                        <span>{shop.distance} km away</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shop Details */}
                <div className="space-y-3 mb-5 pb-5 border-b border-[#141420]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#EC4899] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#9CA3AF] font-medium">{shop.address}, {shop.pincode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#EC4899] flex-shrink-0" />
                    <span className="text-sm text-[#9CA3AF] font-medium">{shop.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <span className="text-sm text-[#10B981] font-medium">{shop.openTime}</span>
                  </div>
                </div>

                {/* Inventory Preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#EC4899]" />
                      <span className="text-sm font-bold text-white">Available Items</span>
                    </div>
                    <span className="text-xs text-[#6B7280] font-medium">{shop.inventory.length} products</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {shop.inventory.slice(0, 4).map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#141420] rounded-lg text-xs font-medium text-[#9CA3AF]"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
                        }}>
                        {item.name}
                      </span>
                    ))}
                    {shop.inventory.length > 4 && (
                      <span className="px-3 py-1.5 bg-[#EC4899]/10 rounded-lg text-xs font-bold text-[#EC4899]">
                        +{shop.inventory.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* View Inventory Button */}
                <AnimatedPressable className="w-full mt-5 px-4 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                    boxShadow: '0 4px 16px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>
                  <Package className="w-4 h-4" />
                  View Full Inventory
                </AnimatedPressable>
              </div>
            </AnimatedPressable>
          ))}
        </div>
      </div>

      {/* Inventory Modal */}
      <Modal
        open={!!(showInventory && selectedShop)}
        title={
          selectedShop ? (
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(236,72,153,0.2)' }}>
                <Store className="w-8 h-8 text-[#EC4899]" />
              </div>
              <span>{selectedShop.name}</span>
            </div>
          ) : ''
        }
        subtitle={
          selectedShop ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#9CA3AF]">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#EC4899]" />
                <span>{selectedShop.distance} km away</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="font-bold text-white">{selectedShop.rating}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#EC4899]" />
                <span>{selectedShop.phone}</span>
              </div>
            </div>
          ) : undefined
        }
        maxWidth="max-w-4xl"
        onClose={() => { setShowInventory(false); setSelectedShop(null); }}
      >
        {selectedShop && (
          <>
            {/* Inventory List */}
              <div className="mb-5 mt-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#EC4899]" />
                  Available Inventory ({selectedShop.inventory.length} items)
                </h3>

                <div className="space-y-3">
                  {selectedShop.inventory.map((item: any) => (
                    <div key={item.id} className="bg-[#141420] rounded-xl p-4"
                      style={{
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
                      }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white mb-1">{item.name}</h4>
                          <p className="text-sm text-[#6B7280]">Brand: <span className="text-[#9CA3AF] font-medium">{item.brand}</span></p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-center">
                            <div className="text-xs text-[#6B7280] mb-1">Stock</div>
                            <div className="font-bold text-white">
                              {item.stock} <span className="text-xs text-[#9CA3AF]">{item.unit}</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-xs text-[#6B7280] mb-1">Price</div>
                            <div className="font-bold text-[#10B981] flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>{item.price}</span>
                            </div>
                          </div>

                          <AnimatedPressable className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                            style={{
                              background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                              boxShadow: '0 2px 8px rgba(236,72,153,0.4)',
                            }}>
                            Add to Cart
                          </AnimatedPressable>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <AnimatedPressable
                  onClick={() => {
                    setShowInventory(false);
                    setSelectedShop(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-medium"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  Close
                </AnimatedPressable>
                <AnimatedPressable className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #34D399)',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>
                  <Phone className="w-4 h-4" />
                  Call Shop
                </AnimatedPressable>
              </div>
          </>
        )}
      </Modal>

      <BottomNavbar />
    </div>
  );
}
