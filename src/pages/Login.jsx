import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider, useDayNight } from '../components/auth/DayNightContext';
import { Eye, EyeOff, Loader2, LogIn, Shield, CheckCircle2, Sun, Moon } from 'lucide-react';

function LoginContent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDay, toggleMode } = useDayNight();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginPhase, setLoginPhase] = useState('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const hasCredentials = email.length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setLoginPhase('headlights');
      await new Promise((r) => setTimeout(r, 400));
      const userData = await login(email, password);
      setLoginPhase('success');
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 1500));
      const route =
        userData.role === 'CITIZEN' ? '/citizen'
        : userData.role === 'ADMIN' ? '/admin'
        : '/officer';
      navigate(route);
    } catch (err) {
      setLoginPhase('idle');
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-slate-900">
      {/* === LAYER 1: Scene background image === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDay ? 'day-scene' : 'night-scene'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src={isDay ? '/auth-scenes/day-1.png' : '/auth-scenes/night-1.png'}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* === LAYER 2: Extracted assets positioned on the scene === */}
      {/* Traffic light - left side */}
      <motion.img
        src="/auth-scenes/assets-clean/traffic-light.png"
        alt="Traffic light"
        className="absolute z-10"
        style={{ left: '17%', top: '30%', width: '5.5%' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* CCTV camera - right side on pole */}
      <motion.img
        src="/auth-scenes/assets-clean/cctv-side.png"
        alt="CCTV camera"
        className="absolute z-10"
        style={{ right: '14%', top: '18%', width: '8%' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Speed limit sign - left */}
      <motion.img
        src="/auth-scenes/assets-clean/speed-sign-60.png"
        alt="Speed limit"
        className="absolute z-10"
        style={{ left: '11%', top: '48%', width: '4.5%' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />

      {/* Street light - right */}
      <motion.img
        src="/auth-scenes/assets-clean/street-light.png"
        alt="Street light"
        className="absolute z-10"
        style={{ right: '8%', top: '28%', width: '6%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* Car - center of road, changes based on login phase */}
      <motion.img
        src={
          loginPhase === 'headlights'
            ? '/auth-scenes/assets-clean/car-headlights-on.png'
            : '/auth-scenes/assets-clean/car-front.png'
        }
        alt="Vehicle"
        className="absolute z-10"
        style={{ left: '50%', top: '52%', width: '16%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: loginPhase === 'headlights' ? 1.05 : 1,
        }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />

      {/* === LAYER 3: Vignette overlay === */}
      <div className="absolute inset-0 pointer-events-none z-15" style={{
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%)'
      }} />

      {/* === LAYER 4: Login form card === */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xs mx-4"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/50">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                >
                  <img
                    src="/auth-scenes/assets-clean/checkmark-green.png"
                    alt="Success"
                    className="w-16 h-16 mx-auto mb-3 object-contain"
                  />
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Registration Successful</h3>
                <p className="text-xs text-slate-500">Your account has been created. You can now login.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-xs mx-4"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-primary-500/10 rounded-3xl blur-2xl" />

                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 overflow-hidden">
                  {/* Header */}
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 shadow-lg shadow-primary-600/30 mb-3">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-sm font-bold text-slate-900 tracking-wide leading-tight">
                      TRAFFIC VIOLATION<br />DETECTION SYSTEM
                    </h1>
                    <p className="text-[10px] text-slate-400 mt-1">Full Stack Project</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-lg text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      autoComplete="email"
                    />

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading || !email || !password}
                      className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {loginPhase === 'headlights' ? 'Starting engine...' : 'Verifying...'}
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          LOGIN
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-[11px] text-slate-500 pt-1">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-primary-600 font-semibold hover:text-primary-700 underline underline-offset-2 transition-colors"
                      >
                        Register
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Day/Night toggle */}
      <motion.button
        className="absolute top-4 right-4 z-30 p-2.5 rounded-xl backdrop-blur-sm border transition-colors"
        style={{
          background: isDay ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
          borderColor: isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
        }}
        onClick={toggleMode}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDay ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-300" />}
      </motion.button>
    </div>
  );
}

export default function Login() {
  return (
    <DayNightProvider>
      <LoginContent />
    </DayNightProvider>
  );
}
