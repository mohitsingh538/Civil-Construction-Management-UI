import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, Calendar, Image, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import NeumorphicDatePicker from './ui/NeumorphicDatePicker';
import { useReports } from '@/hooks';

export default function DailyReportScreen() {
  const navigate = useNavigate();
  const { data: reports, isLoading, error } = useReports();
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-04-25');

  if (isLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-[#9CA3AF]">Loading...</span></div>;
  if (error) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center"><span className="text-red-400">Error loading reports</span></div>;

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
                <FileText className="w-6 h-6 text-[#F59E0B]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Daily Reports</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Metro Station - Phase 3</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-hidden">
            <div className="flex-1 min-w-0 flex items-center gap-1 bg-[#141420] rounded-xl px-3 py-2"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
              }}>
              <AnimatedPressable className="p-0.5 rounded">
                <ChevronLeft className="w-4 h-4 text-[#9CA3AF]" />
              </AnimatedPressable>
              <NeumorphicDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                transparent
                className="flex-1 min-w-0"
              />
              <AnimatedPressable className="p-0.5 rounded">
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </AnimatedPressable>
            </div>
            <AnimatedPressable
              onClick={() => setShowCreateReport(true)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 text-sm"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                boxShadow: '0 8px 24px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}>
              <Plus className="w-4 h-4" />
              Create
            </AnimatedPressable>
            <AnimatedPressable className="flex-shrink-0 px-3 py-2 bg-[#1E1E2E] rounded-xl flex items-center gap-1.5 text-[#9CA3AF] font-medium text-sm"
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Reports', value: reports.length, color: '#9CA3AF' },
            { label: 'This Week', value: '5', color: '#F59E0B' },
            { label: 'Avg Workers/Day', value: '43', color: '#9CA3AF' },
            { label: 'Photos Uploaded', value: '8', color: '#9CA3AF' },
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

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
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
                <div className="flex items-start gap-4 mb-4">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.3)',
                      }}>
                      <FileText className="w-8 h-8 text-[#F59E0B]" />
                    </div>

                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.3), transparent 70%)',
                        filter: 'blur(12px)',
                      }}
                    />
                  </div>

                  {/* Report Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-white tracking-tight text-base sm:text-lg">
                            {new Date(report.date).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <span className="px-3 py-1.5 bg-orange-500/10 text-[#F59E0B] rounded-xl text-xs font-bold"
                            style={{
                              boxShadow: 'inset 0 1px 3px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.2)',
                            }}>
                            {report.weather}
                          </span>
                        </div>
                        <div className="text-sm text-[#9CA3AF] font-medium">Reported by: {report.foreman}</div>
                      </div>

                      {/* Workers count */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <div className="text-xs sm:text-sm text-[#6B7280] font-bold uppercase tracking-wider">Workers Present</div>
                        <div className="text-xl sm:text-2xl font-bold text-[#F59E0B]">{report.workers}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#9CA3AF] mb-1">Work Completed</h4>
                    <p className="text-sm text-white">{report.workCompleted}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#9CA3AF] mb-1">Materials Used</h4>
                    <p className="text-sm text-white">{report.materials}</p>
                  </div>
                </div>

                {/* Photo Thumbnails */}
                {report.photos > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {Array.from({ length: report.photos }).map((_, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 bg-[#141420] rounded-xl flex items-center justify-center"
                        style={{
                          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.2)',
                        }}
                      >
                        <Image className="w-6 h-6 text-[#F59E0B]" />
                      </div>
                    ))}
                    <div className="text-xs text-[#6B7280] font-medium">{report.photos} photos</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <AnimatedPressable className="px-4 py-2 bg-[#141420] text-[#F59E0B] rounded-xl text-sm font-semibold"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                    View Full Report
                  </AnimatedPressable>
                  <AnimatedPressable className="px-4 py-2 bg-[#141420] text-[#3B82F6] rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </AnimatedPressable>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Report Modal */}
      <Modal open={showCreateReport} title="Daily Progress Report" maxWidth="max-w-3xl" onClose={() => setShowCreateReport(false)}>
        <form className="space-y-5 pt-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Report Date</label>
                    <NeumorphicDatePicker
                      value="2026-04-25"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Foreman/Supervisor</label>
                    <NeumorphicSelect
                      value="Rajesh Kumar"
                      onChange={() => {}}
                      options={[
                        { value: 'Rajesh Kumar', label: 'Rajesh Kumar' },
                        { value: 'Amit Sharma', label: 'Amit Sharma' },
                        { value: 'Suresh Yadav', label: 'Suresh Yadav' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Work Completed Today</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Describe the work completed, progress made, milestones achieved..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Materials Used</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="List materials consumed (e.g., Cement: 50 bags, Steel: 2 tons)"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Workers Present</label>
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
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Weather Conditions</label>
                    <NeumorphicSelect
                      value="Sunny"
                      onChange={() => {}}
                      options={[
                        { value: 'Sunny', label: 'Sunny' },
                        { value: 'Partly Cloudy', label: 'Partly Cloudy' },
                        { value: 'Cloudy', label: 'Cloudy' },
                        { value: 'Rainy', label: 'Rainy' },
                        { value: 'Stormy', label: 'Stormy' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Work Hours</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                      placeholder="8:00 AM - 6:00 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Site Photos</label>
                  <div className="bg-[#141420] rounded-xl p-8 text-center transition cursor-pointer"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.2)',
                    }}>
                    <Image className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
                    <p className="text-sm text-[#9CA3AF] mb-1">Click to upload site progress photos</p>
                    <p className="text-xs text-[#6B7280]">PNG, JPG up to 10MB each. Multiple files allowed.</p>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Issues/Delays/Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    placeholder="Any issues faced, delays, or important notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => setShowCreateReport(false)}
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
                    Save & Generate Report
                  </AnimatedPressable>
                </div>
              </form>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
