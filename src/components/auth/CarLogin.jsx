import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

export default function CarLogin({ onLogin, loading, error }) {
  const { isDay } = useDayNight();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [headlightsOn, setHeadlightsOn] = useState(false);

  const hasCredentials = email.length > 0 && password.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <motion.div
      className="relative z-30"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Car SVG body with login form integrated */}
      <div className="relative mx-auto" style={{ width: '380px' }}>
        {/* Headlight glow when credentials entered */}
        <motion.div
          className="absolute -top-2 left-8 w-16 h-8 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,220,100,0.4), transparent)' }}
          animate={{ opacity: hasCredentials ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute -top-2 right-8 w-16 h-8 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,220,100,0.4), transparent)' }}
          animate={{ opacity: hasCredentials ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Car body SVG */}
        <svg viewBox="0 0 380 280" className="w-full">
          {/* Shadow */}
          <ellipse cx="190" cy="265" rx="160" ry="12" fill="rgba(0,0,0,0.15)" />

          {/* Car body - main shape */}
          <path
            d="M40,180 Q40,140 80,120 L120,80 Q140,60 190,55 Q240,60 260,80 L300,120 Q340,140 340,180 L340,200 Q340,210 330,210 L50,210 Q40,210 40,200 Z"
            fill={isDay ? '#2563eb' : '#1e40af'}
            stroke={isDay ? '#1d4ed8' : '#1e3a8a'}
            strokeWidth="2"
          />

          {/* Windshield */}
          <path
            d="M100,125 L130,75 Q150,58 190,55 Q230,58 250,75 L280,125 Z"
            fill={isDay ? 'rgba(147,197,253,0.6)' : 'rgba(30,58,138,0.6)'}
            stroke={isDay ? '#93c5fd' : '#1e40af'}
            strokeWidth="1.5"
          />

          {/* Windshield reflection */}
          <path
            d="M120,120 L140,80 Q155,65 185,60"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          {/* Roof line */}
          <path
            d="M120,80 Q140,62 190,58 Q240,62 260,80"
            fill="none"
            stroke={isDay ? '#1d4ed8' : '#1e3a8a'}
            strokeWidth="2.5"
          />

          {/* Hood */}
          <path
            d="M50,180 L100,130 L280,130 L330,180"
            fill={isDay ? '#3b82f6' : '#2563eb'}
            stroke={isDay ? '#2563eb' : '#1d4ed8'}
            strokeWidth="1"
          />

          {/* Headlights */}
          <motion.g
            animate={{ opacity: hasCredentials ? 1 : 0.6 }}
            transition={{ duration: 0.5 }}
          >
            <rect x="55" y="155" width="25" height="15" rx="4" fill={hasCredentials ? '#fbbf24' : '#d4d4d8'} />
            <rect x="300" y="155" width="25" height="15" rx="4" fill={hasCredentials ? '#fbbf24' : '#d4d4d8'} />
            {hasCredentials && (
              <>
                <rect x="55" y="155" width="25" height="15" rx="4" fill="#fef3c7" opacity="0.5">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
                </rect>
                <rect x="300" y="155" width="25" height="15" rx="4" fill="#fef3c7" opacity="0.5">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
                </rect>
              </>
            )}
          </motion.g>

          {/* Grille */}
          <rect x="140" y="175" width="100" height="12" rx="3" fill={isDay ? '#1e293b' : '#0f172a'} />
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={148 + i * 18} y="177" width="8" height="8" rx="1" fill={isDay ? '#334155' : '#1e293b'} />
          ))}

          {/* Bumper */}
          <rect x="45" y="195" width="290" height="10" rx="4" fill={isDay ? '#64748b' : '#475569'} />

          {/* Wheels */}
          <circle cx="100" cy="215" r="28" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <circle cx="100" cy="215" r="18" fill="#334155" />
          <circle cx="100" cy="215" r="8" fill="#64748b" />

          <circle cx="280" cy="215" r="28" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <circle cx="280" cy="215" r="18" fill="#334155" />
          <circle cx="280" cy="215" r="8" fill="#64748b" />
        </svg>

        {/* Login form - overlaid on the windshield area */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Title */}
            <div className="text-center mb-2">
              <h2 className="text-sm font-bold text-white drop-shadow-lg tracking-wide">
                TRAFFICGUARD
              </h2>
              <p className="text-[10px] text-white/70 drop-shadow">Violation Management Portal</p>
            </div>

            {/* Email field */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => { setIsFocused(true); setHeadlightsOn(true); }}
                onBlur={() => setIsFocused(false)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/90 backdrop-blur-sm border-0 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                autoComplete="email"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => { setIsFocused(true); setHeadlightsOn(true); }}
                onBlur={() => setIsFocused(false)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/90 backdrop-blur-sm border-0 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner pr-8"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-200 bg-red-500/30 px-2 py-1 rounded text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Login button */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogIn className="h-3.5 w-3.5" />
              )}
              {loading ? 'Starting engine...' : 'LOGIN'}
            </motion.button>

            {/* Register link */}
            <p className="text-center text-[10px] text-white/80 drop-shadow">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-white font-semibold underline underline-offset-2 hover:text-white/90"
              >
                REGISTER
              </button>
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
