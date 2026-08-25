import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider, useDayNight } from '../components/auth/DayNightContext';
import { Eye, EyeOff, Loader2, LogIn, Shield, CheckCircle2, Sun, Moon } from 'lucide-react';

function LoginContent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDay, isNight, toggleMode, bgImage } = useDayNight();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | attempting | success | fail
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPhase('attempting');

    try {
      await new Promise((r) => setTimeout(r, 600));
      const userData = await login(email, password);
      setPhase('success');
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 1800));
      const route =
        userData.role === 'CITIZEN' ? '/citizen'
        : userData.role === 'ADMIN' ? '/admin'
        : '/officer';
      navigate(route);
    } catch (err) {
      setPhase('fail');
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
      setTimeout(() => setPhase('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      {/* LAYER 1: Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImage}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <img src={bgImage} alt="" className="w-full h-full object-cover" draggable={false} />
        </motion.div>
      </AnimatePresence>

      {/* LAYER 2: Red glow overlay on login failure (traffic light + CCTV effect) */}
      <AnimatePresence>
        {phase === 'fail' && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Red glow on left side (traffic light area) */}
            <div
              className="absolute"
              style={{
                left: '10%', top: '20%', width: '25%', height: '50%',
                background: 'radial-gradient(ellipse, rgba(239,68,68,0.4) 0%, transparent 70%)',
              }}
            />
            {/* Red glow on right side (CCTV area) */}
            <div
              className="absolute"
              style={{
                right: '5%', top: '10%', width: '25%', height: '50%',
                background: 'radial-gradient(ellipse, rgba(239,68,68,0.35) 0%, transparent 70%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 3: Car in the middle */}
      <motion.div
        className="absolute z-15"
        style={{ left: '50%', bottom: '8%', x: '-50%' }}
        animate={
          phase === 'success'
            ? { scale: 3, opacity: 0, y: -200, filter: 'blur(8px)' }
            : phase === 'attempting'
            ? { scale: 1.05, y: -5 }
            : { scale: 1, y: 0 }
        }
        transition={
          phase === 'success'
            ? { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }
            : { duration: 0.3 }
        }
      >
        <img
          src="/car.png"
          alt="Vehicle"
          className="w-48 md:w-64 lg:w-72 drop-shadow-2xl"
          draggable={false}
        />
      </motion.div>

      {/* LAYER 4: Login form card - positioned over the car */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pb-16">
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
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Access Granted</h3>
                <p className="text-xs text-slate-500">Entering TrafficGuard...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-xs mx-4"
            >
              <div className="relative">
                <div className="absolute -inset-1.5 bg-primary-500/15 rounded-3xl blur-xl" />
                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
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
                        <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                      ) : (
                        <><LogIn className="h-4 w-4" /> LOGIN</>
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
