import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  Users,
  UserPlus,
  Calendar,
  CheckCircle,
  XCircle,
  Maximize2,
} from 'lucide-react';
import BottomNavbar from './BottomNavbar';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import NeumorphicTimePicker from './ui/NeumorphicTimePicker';
import CameraFeed from './CameraFeed';
import CameraFullscreenModal from './CameraFullscreenModal';
import { getCurrentTime, getCurrentDate } from '@core/utils/formatters';
import { useAttendance } from '@/hooks';

export default function AttendanceScreen() {
  const navigate = useNavigate();
  const {
    records: manualAttendance,
    liveFaces,
    markedCount,
    isLoading,
    error,
    isCameraActive,
    handleFacesDetected,
    startCamera,
    stopCamera,
  } = useAttendance();

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  // Remember whether the inline camera was running so we can restore it on close.
  const inlineCameraWasActiveRef = useRef(false);

  const currentTime = getCurrentTime();
  const currentDate = getCurrentDate();

  const handleCameraToggle = () => {
    if (isCameraActive) stopCamera();
    else startCamera();
  };

  const openCameraModal = () => {
    inlineCameraWasActiveRef.current = isCameraActive;
    // Release the inline stream before the modal claims the camera.
    if (isCameraActive) stopCamera();
    setShowCameraModal(true);
  };

  const closeCameraModal = () => {
    setShowCameraModal(false);
    // Restore the inline camera if it was running before the modal opened.
    if (inlineCameraWasActiveRef.current) startCamera();
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <span className="text-[#9CA3AF]">Loading...</span>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <span className="text-red-400">Error loading attendance</span>
    </div>
  );

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] flex flex-col">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[#16161F] border-b border-white/[0.07]"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
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
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.2)',
                }}>
                <Users className="w-6 h-6 text-[#8B5CF6]" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Attendance Tracking</h1>
                <p className="text-sm text-[#9CA3AF] font-medium">Metro Station - Phase 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain w-full relative z-10 max-w-7xl mx-auto px-6 py-8" style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
          {[
            { label: 'Total Workers', value: '52',             color: '#9CA3AF' },
            { label: 'Present',       value: '45',             color: '#10B981' },
            { label: 'Late',          value: '2',              color: '#F59E0B' },
            { label: 'Absent',        value: '5',              color: '#EF4444' },
            { label: 'Face-Matched',  value: `${markedCount}`, color: '#8B5CF6' },
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Camera Interface */}
          <div className="space-y-4">
            <div className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.04), transparent 50%)',
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">Group Photo Check-in</h2>
                  <AnimatedPressable
                    onClick={handleCameraToggle}
                    className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-white"
                    style={{
                      background: isCameraActive ? 'linear-gradient(135deg, #EF4444, #F87171)' : 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                      boxShadow: isCameraActive ? '0 8px 24px rgba(239,68,68,0.4)' : '0 8px 24px rgba(139,92,246,0.4)',
                    }}
                  >
                    {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                  </AnimatedPressable>
                </div>

                {/* Camera View with Face Detection — tap to expand */}
                <button
                  type="button"
                  className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 cursor-pointer select-none block bg-[#0F1117]"
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                  }}
                  onClick={openCameraModal}
                  aria-label="Open full-screen camera"
                >
                  {isCameraActive ? (
                    <CameraFeed
                      onFacesDetected={handleFacesDetected}
                      className="absolute inset-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-[#4B5563] mx-auto mb-3" />
                        <p className="text-[#6B7280]">Camera stopped</p>
                      </div>
                    </div>
                  )}

                  {/* Expand hint — top-right corner */}
                  <div
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-lg flex items-center justify-center pointer-events-none"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-white/80" />
                  </div>
                </button>

                {/* Metadata */}
                <div className="space-y-2 bg-[#141420] p-4 rounded-xl mb-4"
                  style={{
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
                  }}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-white">{currentDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-white">{currentTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-white">19.1136° N, 72.8697° E</span>
                    <span className="text-xs text-[#6B7280]">(Andheri West)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-white">{liveFaces.length} face{liveFaces.length !== 1 ? 's' : ''} detected</span>
                  </div>
                </div>

                <AnimatedPressable className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                    boxShadow: '0 8px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>
                  <Camera className="w-5 h-5" />
                  Capture & Mark Attendance
                </AnimatedPressable>
              </div>
            </div>

            {/* Recognized Today */}
            <div className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.04), transparent 50%)',
                }}
              />

              <div className="relative">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 tracking-tight">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  Recognized in This Session
                  {markedCount > 0 && (
                    <span
                      className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}
                    >
                      {markedCount}
                    </span>
                  )}
                </h3>
                {liveFaces.length === 0 ? (
                  <p className="text-sm text-[#6B7280] text-center py-4">
                    {isCameraActive ? 'Scanning for faces…' : 'Start the camera to begin.'}
                  </p>
                ) : (
                <div className="space-y-2">
                  {liveFaces.map((face) => (
                    <div key={face.name} className="flex items-center gap-3 p-2 bg-[#141420] rounded-xl"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.2)',
                      }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                        }}>
                        {face.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{face.name}</div>
                        <div className="text-xs text-[#6B7280]">{face.markedAt}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                        <span className="text-[10px] text-[#6B7280]">{Math.round(face.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Manual Entry List */}
          <div className="space-y-4">
            <div className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.04), transparent 50%)',
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">Manual Attendance</h2>
                  <AnimatedPressable
                    onClick={() => setShowManualEntry(true)}
                    className="px-4 py-2 rounded-xl text-white font-semibold flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                      boxShadow: '0 8px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Manual
                  </AnimatedPressable>
                </div>

                <div className="space-y-2">
                  {(manualAttendance ?? []).map((worker) => (
                    <div key={worker.id} className="flex items-center gap-3 p-3 bg-[#141420] rounded-xl hover:bg-[#1A1A28] transition"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                      }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
                        }}>
                        {worker.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{worker.name}</div>
                        <div className="text-xs text-[#6B7280]">{worker.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#9CA3AF]">{worker.checkIn}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {worker.status === 'present' && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-[#10B981] rounded-full text-xs font-bold"
                              style={{
                                boxShadow: 'inset 0 1px 3px rgba(16,185,129,0.2), 0 0 0 1px rgba(16,185,129,0.2)',
                              }}>
                              Present
                            </span>
                          )}
                          {worker.status === 'late' && (
                            <span className="px-2 py-0.5 bg-orange-500/10 text-[#F59E0B] rounded-full text-xs font-bold"
                              style={{
                                boxShadow: 'inset 0 1px 3px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.2)',
                              }}>
                              Late
                            </span>
                          )}
                          {worker.status === 'absent' && (
                            <span className="px-2 py-0.5 bg-red-500/10 text-[#EF4444] rounded-full text-xs font-bold flex items-center gap-1"
                              style={{
                                boxShadow: 'inset 0 1px 3px rgba(239,68,68,0.2), 0 0 0 1px rgba(239,68,68,0.2)',
                              }}>
                              <XCircle className="w-3 h-3" />
                              Absent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendance Summary by Department */}
            <div className="relative bg-[#1E1E2E] rounded-[20px] p-5"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
              <div className="absolute inset-0 rounded-[20px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.04), transparent 50%)',
                }}
              />

              <div className="relative">
                <h3 className="font-bold text-white mb-4 tracking-tight">Department Wise Summary</h3>
                <div className="space-y-3">
                  {[
                    { dept: 'Masons', present: 12, total: 15 },
                    { dept: 'Helpers', present: 18, total: 20 },
                    { dept: 'Electricians', present: 5, total: 6 },
                    { dept: 'Plumbers', present: 4, total: 5 },
                    { dept: 'Carpenters', present: 6, total: 6 },
                  ].map((dept) => (
                    <div key={dept.dept} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">{dept.dept}</span>
                        <span className="text-[#9CA3AF]">{dept.present}/{dept.total}</span>
                      </div>
                      <div className="h-2.5 bg-[#141420] rounded-full overflow-hidden"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                        }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(dept.present / dept.total) * 100}%`,
                            backgroundColor: '#8B5CF6',
                            boxShadow: '0 0 12px rgba(139,92,246,0.8)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen camera modal */}
      <CameraFullscreenModal
        open={showCameraModal}
        onClose={closeCameraModal}
        onFacesDetected={handleFacesDetected}
      />

      {/* Manual Entry Modal */}
      <Modal open={showManualEntry} title="Manual Attendance Entry" maxWidth="max-w-md" onClose={() => setShowManualEntry(false)}>
        <form className="space-y-4 pt-5">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Select Employee</label>
                  <NeumorphicSelect
                    value=""
                    onChange={() => {}}
                    isSearchable
                    options={[
                      { value: '', label: 'Choose employee...' },
                      { value: 'rajesh', label: 'Rajesh Kumar - Mason' },
                      { value: 'amit', label: 'Amit Sharma - Helper' },
                      { value: 'suresh', label: 'Suresh Yadav - Electrician' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Status</label>
                    <NeumorphicSelect
                      value="Present"
                      onChange={() => {}}
                      options={[
                        { value: 'Present', label: 'Present' },
                        { value: 'Late', label: 'Late' },
                        { value: 'Absent', label: 'Absent' },
                        { value: 'Half Day', label: 'Half Day' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Check-in Time</label>
                    <NeumorphicTimePicker
                      value={currentTime}
                      onChange={() => {}}
                    />
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
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <AnimatedPressable
                    type="button"
                    onClick={() => setShowManualEntry(false)}
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
                      background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                      boxShadow: '0 8px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    Mark Attendance
                  </AnimatedPressable>
                </div>
              </form>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
