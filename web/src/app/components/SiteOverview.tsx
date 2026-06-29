import { useNavigate } from 'react-router';
import {
  Package, Receipt, Users, ClipboardList, FileText,
  HardHat, IndianRupee, FileSpreadsheet, Truck, ArrowLeft, Building2
} from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import AnimatedPressable from './ui/AnimatedPressable';

const modules = [
  { id: 'inventory', name: 'Inventory', icon: Package, path: '/inventory', color: '#3B82F6', description: 'Stock & materials' },
  { id: 'expenses', name: 'Expenses', icon: Receipt, path: '/expenses', color: '#F59E0B', description: 'Track expenditures' },
  { id: 'attendance', name: 'Attendance', icon: Users, path: '/attendance', color: '#8B5CF6', description: 'Daily attendance' },
  { id: 'employees', name: 'Employees', icon: HardHat, path: '/employees', color: '#14B8A6', description: 'Staff management' },
  { id: 'payroll', name: 'Payroll', icon: IndianRupee, path: '/payroll', color: '#10B981', description: 'Process salaries' },
  { id: 'material-shops', name: 'Material Shops', icon: Building2, path: '/material-shops', color: '#EC4899', description: 'Find suppliers' },
  { id: 'tasks', name: 'Tasks', icon: ClipboardList, path: '/tasks', color: '#EC4899', description: 'Assign & track' },
  { id: 'reports', name: 'Daily Reports', icon: FileText, path: '/daily-reports', color: '#F59E0B', description: 'Progress reports' },
  { id: 'invoices', name: 'Invoices', icon: FileSpreadsheet, path: '/invoices', color: '#6366F1', description: 'GST billing' },
  { id: 'equipment', name: 'Equipment', icon: Truck, path: '/equipment', color: '#06B6D4', description: 'Asset tracking' },
];

export default function SiteOverview() {
  const navigate = useNavigate();

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
              onClick={() => navigate('/dashboard')}
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
                <h1 className="text-lg font-bold text-white tracking-tight">Metro Station - Phase 3</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Andheri West, Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-12" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
        <h2 className="text-3xl font-bold text-white mb-10 tracking-tight">
          Control Modules
        </h2>

        {/* Module Grid - Colored icons */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <AnimatedPressable
                key={module.id}
                as="div"
                onClick={() => navigate(module.path)}
                className="group relative text-left bg-[#1E1E2E] rounded-[24px]"
                style={{
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>

                {/* Metallic gloss */}
                <div className="absolute inset-0 rounded-[24px] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04), transparent 55%)',
                  }}
                />

                {/* Colored border on hover */}
                <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${module.color}40`,
                  }}
                />

                <div className="relative p-4 md:p-7">
                  {/* Colored Icon */}
                  <div className="mb-6 relative inline-block">
                    <div className="w-16 h-16 bg-[#141420] rounded-[18px] flex items-center justify-center"
                      style={{
                        boxShadow: `inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px ${module.color}30`,
                      }}>
                      <Icon className="w-8 h-8 transition-all duration-300" style={{ color: module.color }} />
                    </div>

                    {/* Colored glow on hover */}
                    <div className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${module.color}25, transparent 70%)`,
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors tracking-tight">
                    {module.name}
                  </h3>
                  <p className="text-sm text-[#9CA3AF] font-medium">
                    {module.description}
                  </p>

                  {/* Colored accent line */}
                  <div className="mt-5 h-[3px] bg-[#141420] rounded-full overflow-hidden"
                    style={{
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                    }}>
                    <div className="h-full w-0 group-hover:w-full transition-all duration-700"
                      style={{
                        backgroundColor: module.color,
                        boxShadow: `0 0 12px ${module.color}80`,
                      }}
                    />
                  </div>
                </div>
              </AnimatedPressable>
            );
          })}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
