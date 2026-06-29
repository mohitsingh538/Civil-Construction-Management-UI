import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, ChevronRight, MapPin, LogOut, Plus } from 'lucide-react';
import { createCompany } from '@core/services/api/companyApi';
import type { CreateCompanyInput } from '@core/types';
import { useCompanies } from '@/hooks';
import BottomNavbar from './BottomNavbar';
import AnimatedPressable from './ui/AnimatedPressable';
import AddCompanyModal from './AddCompanyModal';

export default function CompanySelector() {
  const navigate = useNavigate();
  const { data: companies, isLoading, error, refetch } = useCompanies();
  const [showAddCompany, setShowAddCompany] = useState(false);

  const handleAddCompany = async (input: CreateCompanyInput) => {
    await createCompany(input);
    refetch();
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading companies</span></div>;

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] overflow-y-auto overscroll-contain">
      <div
        className="relative z-10 max-w-6xl mx-auto px-6 pb-12"
        style={{ paddingBottom: 'calc(132px + env(safe-area-inset-bottom))', paddingTop: 'calc(var(--safe-top) + 24px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Select Company
            </h1>
            <p className="text-[#9CA3AF] text-lg font-medium">Choose a company to manage operations</p>
          </div>

          {/* Logout Button */}
          <AnimatedPressable className="group relative px-6 py-3.5 bg-[#1E1E2E] rounded-2xl"
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
            <div className="flex items-center gap-2.5 text-[#9CA3AF] font-semibold">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </AnimatedPressable>
        </div>

        {/* Company Cards - CLEARLY visible */}
        <div className="space-y-5">
          {companies.map((company) => (
            <AnimatedPressable
              key={company.id}
              as="div"
              onClick={() => navigate('/dashboard')}
              className="group relative w-full bg-[#1E1E2E] rounded-[20px]"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {/* Metallic gloss */}
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.04), transparent 50%)',
                }}
              />

              {/* Colored accent bar on left */}
              <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-300 group-hover:w-1.5"
                style={{
                  backgroundColor: company.color,
                  boxShadow: `0 0 20px ${company.color}40`,
                }}
              />

              <div className="relative p-5 md:p-7">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* Company Icon - with colored glow */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#141420] rounded-full flex items-center justify-center"
                      style={{
                        boxShadow: `inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px ${company.color}20`,
                      }}>
                      <Building2 className="w-8 sm:w-9 h-8 sm:h-9" style={{ color: company.color }} />
                    </div>

                    {/* Colored glow on hover */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${company.color}30, transparent 70%)`,
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight group-hover:text-white transition-colors">
                      {company.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[#9CA3AF]">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{company.location}</span>
                    </div>
                  </div>

                  {/* Stats - with colored numbers */}
                  <div className="flex gap-3 sm:gap-5 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none px-4 sm:px-7 py-3 sm:py-4 bg-[#141420] rounded-2xl sm:min-w-[110px]"
                      style={{
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
                      }}>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold mb-1"
                          style={{
                            color: company.color,
                            textShadow: `0 0 20px ${company.color}60`,
                          }}>
                          {company.sites}
                        </div>
                        <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Sites</div>
                      </div>
                    </div>

                    <div className="flex-1 sm:flex-none px-4 sm:px-7 py-3 sm:py-4 bg-[#141420] rounded-2xl sm:min-w-[110px]"
                      style={{
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
                      }}>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold mb-1"
                          style={{
                            color: company.color,
                            textShadow: `0 0 20px ${company.color}60`,
                          }}>
                          {company.employees}
                        </div>
                        <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Employees</div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow - Hidden on mobile */}
                  <ChevronRight className="hidden sm:block w-7 h-7 text-[#4B5563] flex-shrink-0" />
                </div>
              </div>
            </AnimatedPressable>
          ))}
        </div>

        {/* Add Company Button */}
        <AnimatedPressable
          as="div"
          onClick={() => setShowAddCompany(true)}
          className="group relative w-full mt-5 bg-[#1E1E2E] rounded-[20px] border-2 border-dashed border-white/[0.08]"
        >
          <div className="relative py-8 flex items-center justify-center gap-4">
            {/* Icon with gradient */}
            <div className="w-12 h-12 bg-[#141420] rounded-xl flex items-center justify-center"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}>
              <Plus className="w-6 h-6 text-[#3B82F6] group-hover:text-[#60A5FA] transition-colors" />
            </div>

            <span className="text-lg font-bold text-[#9CA3AF] group-hover:text-white transition-colors tracking-tight">
              Add New Company
            </span>
          </div>
        </AnimatedPressable>
      </div>

      <AddCompanyModal
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onSubmit={handleAddCompany}
      />

      <BottomNavbar />
    </div>
  );
}
