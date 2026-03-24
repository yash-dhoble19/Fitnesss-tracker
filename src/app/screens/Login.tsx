import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, Dumbbell, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Animated gradient blobs */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #C8F53C 0%, transparent 60%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #3CF5D8 0%, transparent 60%)',
          animation: 'pulse-glow 5s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #A078F5 0%, transparent 50%)',
          animation: 'pulse-glow 6s ease-in-out infinite',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(200,245,60,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,245,60,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative px-6 py-8 min-h-screen flex flex-col">
        {/* Logo section */}
        <div className="flex flex-col items-center mb-10 mt-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(200,245,60,0.15) 0%, rgba(60,245,216,0.15) 100%)',
              border: '1px solid rgba(200,245,60,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Dumbbell size={36} color="#C8F53C" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '48px',
              color: '#FFFFFF',
              letterSpacing: '0.06em',
              lineHeight: '1',
            }}
          >
            FIT<span style={{ color: '#C8F53C' }}>PULSE</span>
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '11px',
              color: '#5A5A62',
              letterSpacing: '0.15em',
            }}
          >
            TRACK • COMPETE • TRANSFORM
          </p>
        </div>

        {/* Welcome text */}
        <div className="mb-8">
          <h2
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '32px',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: '1.1',
            }}
          >
            Welcome back
          </h2>
          <p
            className="mt-1"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              color: '#8A8A92',
            }}
          >
            Sign in to continue your fitness journey
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          {/* Email field */}
          <div
            className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300"
            style={{
              backgroundColor: '#18181D',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200,245,60,0.3)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(200,245,60,0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Mail size={18} color="#5A5A62" />
            <input
              id="login-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '15px',
                color: '#FFFFFF',
              }}
            />
          </div>

          {/* Password field */}
          <div
            className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300"
            style={{
              backgroundColor: '#18181D',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200,245,60,0.3)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(200,245,60,0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Lock size={18} color="#5A5A62" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '15px',
                color: '#FFFFFF',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <EyeOff size={18} color="#5A5A62" />
              ) : (
                <Eye size={18} color="#5A5A62" />
              )}
            </button>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '13px',
                color: '#C8F53C',
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Login button */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
            style={{
              background: isLoading
                ? 'rgba(200,245,60,0.6)'
                : 'linear-gradient(135deg, #C8F53C 0%, #B8E535 100%)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0A0A0C',
              boxShadow: '0 4px 30px rgba(200,245,60,0.2)',
            }}
          >
            {isLoading ? (
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: '#0A0A0C transparent #0A0A0C transparent' }}
              />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px" style={{ backgroundColor: '#2A2A2E' }} />
          <span
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              color: '#5A5A62',
              letterSpacing: '0.1em',
            }}
          >
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#2A2A2E' }} />
        </div>

        {/* Social login buttons */}
        <div className="flex gap-3 mb-8">
          {[
            { name: 'Google', icon: '🔵', bg: 'rgba(66,133,244,0.1)', border: 'rgba(66,133,244,0.2)' },
            { name: 'Apple', icon: '🍎', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
            { name: 'GitHub', icon: '⚡', bg: 'rgba(160,120,245,0.1)', border: 'rgba(160,120,245,0.2)' },
          ].map((social) => (
            <button
              key={social.name}
              id={`login-${social.name.toLowerCase()}`}
              className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: social.bg,
                border: `1px solid ${social.border}`,
              }}
            >
              <span className="text-base">{social.icon}</span>
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  fontWeight: 500,
                }}
              >
                {social.name}
              </span>
            </button>
          ))}
        </div>

        {/* Sign up link */}
        <div className="mt-auto flex items-center justify-center gap-1 py-6">
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              color: '#8A8A92',
            }}
          >
            Don't have an account?
          </span>
          <button
            id="login-signup-link"
            onClick={() => navigate('/signup')}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#C8F53C',
            }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
