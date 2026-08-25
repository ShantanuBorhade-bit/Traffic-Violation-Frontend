import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogIn, Shield } from 'lucide-react';

export default function CarLogin({ onLogin, loading, error, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <motion.div
      className="relative z-30 w-full max-w-sm mx-4"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Glass login card */}
      <div className="relative">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 bg-primary-500/20 rounded-3xl blur-xl" />

        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 overflow-hidden">
          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
            }}
          />

          {/* Header */}
          <div className="text-center mb-6 relative">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-400/30 mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Shield className="h-8 w-8 text-primary-300" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">TrafficGuard</h1>
            <p className="text-sm text-white/60 mt-1">Violation Management Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-400/30 text-red-200 text-xs rounded-xl text-center backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting engine...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  LOGIN
                </>
              )}
            </motion.button>

            {/* Register link */}
            <div className="text-center pt-1">
              <p className="text-xs text-white/50">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={onRegister}
                  className="text-primary-300 font-semibold hover:text-primary-200 underline underline-offset-2 transition-colors"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
