import { useNavigate } from 'react-router';
import {
  Building2, Package, Receipt, Users, AlertCircle,
  TrendingUp, ArrowLeft
} from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import { useSites } from '@/hooks';
import AnimatedPressable from './ui/AnimatedPressable';

const stats = [
  { label: 'Total Employees', value: '142', icon: Users, color: '#3B82F6', bg: 'from-blue-500/10 to-blue-600/10' },
  { label: 'Inventory Value', value: '₹12.5L', icon: Package, color: '#10B981', bg: 'from-emerald-500/10 to-green-600/10' },
  { label: 'Monthly Expenses', value: '₹8.2L', icon: Receipt, color: '#F59E0B', bg: 'from-amber-500/10 to-orange-600/10' },
  { label: 'Active Sites', value: '5', icon: Building2, color: '#8B5CF6', bg: 'from-purple-500/10 to-violet-600/10' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: sites, isLoading, error } = useSites();

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading dashboard</span></div>;

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] flex flex-col">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[#16161F] border-b border-white/[0.07]"
        style={{
          paddingTop: 'var(--safe-top)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <AnimatedPressable
              onClick={() => navigate('/companies')}
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
                <Building2 className="w-6 h-6 text-[#3B82F6]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Metro Construction Ltd.</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(132px + env(safe-area-inset-bottom))' }}>
        {/* Stats Grid - Colorful */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`relative rounded-[20px] p-5 bg-gradient-to-br ${stat.bg}`}
                style={{
                  backgroundColor: '#1E1E2E',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>

                {/* Metallic gloss */}
                <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.06), transparent 50%)',
                  }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    {/* Colored icon */}
                    <div className="w-11 h-11 bg-[#141420] rounded-xl flex items-center justify-center"
                      style={{
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.4), 0 0 0 1px ${stat.color}30`,
                      }}>
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  </div>

                  <div className="text-3xl font-bold text-white mb-1.5 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#9CA3AF] font-semibold">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sites Section */}
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Sites & Warehouses</h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <AnimatedPressable
              key={site.id}
              as="div"
              onClick={() => navigate('/site')}
              className="group relative text-left bg-[#1E1E2E] rounded-[20px]"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>

              {/* Metallic gloss */}
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                }}
              />

              {/* Colored accent bar */}
              <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-300 group-hover:w-1.5"
                style={{
                  backgroundColor: site.color,
                  boxShadow: `0 0 16px ${site.color}60`,
                }}
              />

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 bg-[#141420] rounded-xl flex items-center justify-center"
                    style={{
                      boxShadow: `inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px ${site.color}30`,
                    }}>
                    <Building2 className="w-7 h-7" style={{ color: site.color }} />
                  </div>

                  {site.alerts > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 rounded-xl text-xs font-bold text-[#EF4444]"
                      style={{
                        boxShadow: 'inset 0 1px 3px rgba(239,68,68,0.2), 0 0 0 1px rgba(239,68,68,0.2)',
                      }}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {site.alerts}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-white mb-1.5 text-lg group-hover:text-white transition-colors tracking-tight">
                  {site.name}
                </h3>
                <p className="text-sm text-[#9CA3AF] mb-5 font-medium">{site.location}</p>

                {/* Colored Progress Bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-2.5 font-semibold">
                    <span>Project Progress</span>
                    <span className="text-white">{site.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-[#141420] rounded-full overflow-hidden"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                    }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${site.progress}%`,
                        backgroundColor: site.color,
                        boxShadow: `0 0 12px ${site.color}80`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3 py-2.5 bg-[#141420] rounded-xl"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                    }}>
                    <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-0.5">Attendance</div>
                    <div className="text-sm font-bold text-white">{site.attendance}/{site.totalWorkers}</div>
                  </div>

                  <div className="px-3 py-2.5 bg-[#141420] rounded-xl"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                    }}>
                    <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-0.5">Low Stock</div>
                    <div className="text-sm font-bold">
                      {site.lowStockItems > 0 ? (
                        <span className="text-[#F59E0B]">{site.lowStockItems} items</span>
                      ) : (
                        <span className="text-[#10B981]">All good</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedPressable>
          ))}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
