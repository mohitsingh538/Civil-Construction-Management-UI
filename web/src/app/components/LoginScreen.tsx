import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Mail, Lock, User, Phone } from 'lucide-react';
import AnimatedPressable from './ui/AnimatedPressable';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/companies');
  };

  return (
    <div className="h-[var(--app-height)] bg-[#0F1117] overflow-y-auto"
      style={{
        paddingTop: 'calc(var(--safe-top) + 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
      }}>
      <div className="min-h-full flex items-center justify-center px-6 py-4">
      <div className="w-full max-w-md relative z-10">
        {/* Main Card - CLEARLY visible */}
        <div className="relative bg-[#1E1E2E] rounded-[24px]"
          style={{
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

          {/* Metallic gloss */}
          <div className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 35% 20%, rgba(255,255,255,0.05), transparent 55%)',
            }}
          />

          <div className="relative p-6">
            {/* Logo with colored glow */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-[#141420] rounded-full flex items-center justify-center"
                  style={{
                    boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.2)',
                  }}>
                  <Building2 className="w-8 h-8 text-[#3B82F6]" />
                </div>

                {/* Blue glow */}
                <div className="absolute inset-0 rounded-full opacity-70"
                  style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)',
                    filter: 'blur(16px)',
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center mb-1.5 tracking-tight">
              ConstructPro
            </h1>
            <p className="text-center text-[#9CA3AF] mb-4 font-medium">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div className="relative group">
                  {/* Colored focus glow */}
                  <div className="absolute -inset-1 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                    }}
                  />

                  <div className="relative bg-[#141420] rounded-2xl"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}>
                    <div className="flex items-center">
                      <div className="pl-4 pr-2">
                        <User className="w-5 h-5 text-[#6B7280] group-focus-within:text-[#3B82F6] transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="flex-1 px-2 py-3 bg-transparent text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {isRegister && (
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                    }}
                  />

                  <div className="relative bg-[#141420] rounded-2xl"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}>
                    <div className="flex items-center">
                      <div className="pl-4 pr-2">
                        <Phone className="w-5 h-5 text-[#6B7280] group-focus-within:text-[#3B82F6] transition-colors" />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="flex-1 px-2 py-3 bg-transparent text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                  }}
                />

                <div className="relative bg-[#141420] rounded-2xl"
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                  }}>
                  <div className="flex items-center">
                    <div className="pl-4 pr-2">
                      <Mail className="w-5 h-5 text-[#6B7280] group-focus-within:text-[#3B82F6] transition-colors" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="flex-1 px-2 py-3 bg-transparent text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                  }}
                />

                <div className="relative bg-[#141420] rounded-2xl"
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                  }}>
                  <div className="flex items-center">
                    <div className="pl-4 pr-2">
                      <Lock className="w-5 h-5 text-[#6B7280] group-focus-within:text-[#3B82F6] transition-colors" />
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      className="flex-1 px-2 py-3 bg-transparent text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {isRegister && (
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                    }}
                  />

                  <div className="relative bg-[#141420] rounded-2xl"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}>
                    <div className="flex items-center">
                      <div className="pl-4 pr-2">
                        <Lock className="w-5 h-5 text-[#6B7280] group-focus-within:text-[#3B82F6] transition-colors" />
                      </div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="flex-1 px-2 py-3 bg-transparent text-white placeholder:text-[#6B7280] focus:outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {!isRegister && (
                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-5 h-5 bg-[#141420] rounded-md flex items-center justify-center"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                      }}>
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-3 h-3 bg-[#3B82F6] rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"
                        style={{
                          boxShadow: '0 0 10px rgba(59,130,246,0.6)',
                        }}
                      />
                    </div>
                    <span className="text-[#9CA3AF] group-hover:text-white transition-colors font-medium">Remember me</span>
                  </label>
                  <a href="#" className="text-[#3B82F6] hover:text-[#60A5FA] font-semibold transition-colors">
                    Forgot Password?
                  </a>
                </div>
              )}

              {/* Submit Button - Gradient */}
              <AnimatedPressable
                type="submit"
                as="button"
                className="relative w-full mt-4 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}>
                <div className="relative py-3">
                  <span className="text-white font-bold tracking-wide text-base">
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </span>
                </div>
              </AnimatedPressable>
            </form>

            {/* Toggle */}
            <div className="mt-5 text-center relative pt-5">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

              <AnimatedPressable
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#9CA3AF] font-medium"
              >
                {isRegister ? (
                  <>
                    Already have an account?{' '}
                    <span className="font-bold text-[#3B82F6]">Sign In</span>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <span className="font-bold text-[#3B82F6]">Register</span>
                  </>
                )}
              </AnimatedPressable>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
