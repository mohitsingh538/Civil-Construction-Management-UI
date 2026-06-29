import { memo, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Home, Camera, FileText, Bell, Menu } from 'lucide-react';
import { lightImpact } from '../../services/haptics';
import AnimatedPressable from './ui/AnimatedPressable';

// Static nav items defined outside component — prevents re-creation on every render
const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: FileText, label: 'Reports', path: '/site/daily-report' },
  { icon: Camera, label: 'Attendance', path: '/site/attendance', highlighted: true },
  { icon: Bell, label: 'Alerts', path: '/tenders', badge: 1 },
  { icon: Menu, label: 'Menu', path: '/site' },
] as const;

// Spring transition for icon scale on press
const tapSpring = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as const;

const BottomNavbar = memo(function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Stable callback — avoids re-renders of children when parent re-renders
  const handleNavTap = useCallback(
    (path: string) => {
      lightImpact();
      navigate(path);
    },
    [navigate],
  );

  // Memoize active state map to avoid recomputing inside render
  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      map[item.path] = location.pathname === item.path;
    });
    return map;
  }, [location.pathname]);

  return (
    <>
      {/* Blur fade above navbar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          height: '140px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(15,17,23,0.5) 35%, rgba(15,17,23,0.88) 65%, rgba(15,17,23,0.97) 100%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
        }}
      />
      <div className="fixed bottom-0 left-0 right-0 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="relative mx-auto max-w-7xl px-4 pb-4">
        <div className="relative bg-[#1E1E2E] rounded-[24px] px-2 py-3"
          style={{
            boxShadow: '0 -4px 24px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>

          {/* Metallic gloss */}
          <div className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 60%)',
            }}
          />

          <div className="relative grid grid-cols-5 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeMap[item.path];

              return (
                <AnimatedPressable
                  key={item.label}
                  onClick={() => handleNavTap(item.path)}
                  haptic={false}
                  className={`group relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl ${
                    isActive ? 'bg-[#252532]' : 'hover:bg-[#252532]'
                  }`}
                >
                  {/* Highlight glow for camera */}
                  {'highlighted' in item && item.highlighted && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10B981] rounded-full"
                      style={{
                        boxShadow: '0 0 12px rgba(16,185,129,0.8)',
                      }}
                    />
                  )}

                  {/* Notification badge */}
                  {'badge' in item && item.badge && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] rounded-full flex items-center justify-center"
                      style={{
                        boxShadow: '0 0 10px rgba(239,68,68,0.7)',
                      }}
                    >
                      <span className="text-[10px] font-bold text-white leading-none">{item.badge}</span>
                    </div>
                  )}

                  {/* Icon container */}
                  <motion.div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${'highlighted' in item && item.highlighted
                        ? 'bg-[#10B981]'
                        : isActive
                        ? 'bg-[#141420]'
                        : 'bg-[#141420] group-hover:bg-[#1A1A28]'
                    }`}
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={tapSpring}
                    style={{
                      boxShadow: 'highlighted' in item && item.highlighted
                        ? '0 4px 16px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}>
                    <Icon className={`w-5 h-5 transition-colors ${'highlighted' in item && item.highlighted
                        ? 'text-white'
                        : isActive
                        ? 'text-white'
                        : 'text-[#9CA3AF] group-hover:text-white'
                    }`} />

                    {/* Glow effect */}
                    {'highlighted' in item && item.highlighted && (
                      <div className="absolute inset-0 rounded-xl opacity-50"
                        style={{
                          background: 'radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)',
                          filter: 'blur(8px)',
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <span className={`text-xs font-bold transition-colors ${'highlighted' in item && item.highlighted
                      ? 'text-[#10B981]'
                      : isActive
                      ? 'text-white'
                      : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
                  }`}>
                    {item.label}
                  </span>
                </AnimatedPressable>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
});

export default BottomNavbar;