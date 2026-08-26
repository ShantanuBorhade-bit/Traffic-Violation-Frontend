import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider, useDayNight } from '../components/auth/DayNightContext';
import { Eye, EyeOff, Loader2, LogIn, Shield, Sun, Moon } from 'lucide-react';

function LoginContent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDay, toggleMode, bgImage } = useDayNight();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPhase('attempting');
    try {
      await new Promise((r) => setTimeout(r, 600));
      const userData = await login(email, password);
      setPhase('success');
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
      {/* BG: Day or Night scene */}
      <AnimatePresence mode="wait">
        <motion.div key={bgImage} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          <img src={bgImage} alt="" className="w-full h-full object-cover" draggable={false} />
        </motion.div>
      </AnimatePresence>

      {/* Red glow on failure */}
      <AnimatePresence>
        {phase === 'fail' && (
          <motion.div className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="absolute" style={{ left: '10%', top: '20%', width: '25%', height: '50%', background: 'radial-gradient(ellipse, rgba(239,68,68,0.45) 0%, transparent 70%)' }} />
            <div className="absolute" style={{ right: '5%', top: '10%', width: '25%', height: '50%', background: 'radial-gradient(ellipse, rgba(239,68,68,0.4) 0%, transparent 70%)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Car in the middle of road */}
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
        transition={phase === 'success' ? { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] } : { duration: 0.3 }}
      >
        <img src="/car.png" alt="Vehicle" className="w-48 md:w-64 lg:w-72 drop-shadow-2xl" draggable={false} />
      </motion.div>

      {/* Login card — clipboard / paper style */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[320px] mx-4"
        >
          {/* Clipboard clip */}
          <div className="flex justify-center -mb-2 relative z-10">
            <div className="w-24 h-5 rounded-t-lg border-2 border-amber-900 shadow-md"
              style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)' }} />
          </div>

          {/* Paper card */}
          <div className="relative rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #c7c1cb 0%, #d1cbd5 50%, #bf b9c3 100%)' }}>
            {/* Subtle paper texture */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 22px, #64748b 22px, #64748b 23px)' }} />

            {/* Inner paper area with slight border */}
            <div className="relative m-2 rounded-xl bg-white/90 backdrop-blur-sm p-5 shadow-inner">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 shadow-md shadow-primary-600/30 mb-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xs font-bold text-slate-800 tracking-wider leading-tight uppercase">
                  Traffic Mama
                </h1>
                <p className="text-[9px] text-slate-400 mt-1">Dekhega bhi, pakdega bhi.</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-3" />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-[10px] rounded-lg text-center">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                </div>

                <div>
                  <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all pr-8" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <motion.button type="submit" disabled={loading || !email || !password}
                  className="w-full py-2 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...</>) : (<><LogIn className="h-3.5 w-3.5" /> LOGIN</>)}
                </motion.button>

                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[9px] text-slate-400">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <p className="text-center text-[10px] text-slate-500">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => navigate('/register')}
                    className="text-primary-600 font-semibold hover:text-primary-700 underline underline-offset-2 transition-colors">
                    Register
                  </button>
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Day/Night toggle */}
      <motion.button
        className="absolute top-4 right-4 z-30 p-2 rounded-lg backdrop-blur-sm border transition-colors"
        style={{ background: isDay ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)', borderColor: isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }}
        onClick={toggleMode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        {isDay ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-300" />}
      </motion.button>
    </div>
  );
}

export default function Login() {
  return (<DayNightProvider><LoginContent /></DayNightProvider>);
}
