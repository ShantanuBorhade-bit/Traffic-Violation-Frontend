import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider, useDayNight } from '../components/auth/DayNightContext';
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2, ArrowLeft, Shield, Sun, Moon } from 'lucide-react';

const ROLES = [
  { value: 'CITIZEN', label: 'Citizen', icon: '👤' },
  { value: 'TRAFFIC_OFFICER', label: 'Traffic Officer', icon: '👮' },
  { value: 'GRIEVANCE_OFFICER', label: 'Grievance Officer', icon: '📋' },
  { value: 'ADMIN', label: 'Admin', icon: '🛡️' },
];

function RegisterContent() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isDay, toggleMode, bgImage } = useDayNight();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'CITIZEN' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      {/* BG */}
      <AnimatePresence mode="wait">
        <motion.div key={bgImage} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          <img src={bgImage} alt="" className="w-full h-full object-cover" draggable={false} />
        </motion.div>
      </AnimatePresence>

      {/* Human character slides in from right */}
      <AnimatePresence>
        {showForm && !success && (
          <motion.img src="/human.png" alt="Officer"
            className="absolute z-15 drop-shadow-2xl"
            style={{ right: '15%', bottom: '5%', height: '55%' }}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        )}
      </AnimatePresence>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-30">
        <Link to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white backdrop-blur-sm bg-black/20 rounded-xl px-3 py-2 transition-colors border border-white/10">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      {/* Main card area */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {success ? (
            /* Success state */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[320px] mx-4">
              <div className="flex justify-center -mb-2 relative z-10">
                <div className="w-24 h-5 rounded-t-lg border-2 border-amber-900 shadow-md"
                  style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)' }} />
              </div>
              <div className="relative rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #c7c1cb 0%, #d1cbd5 50%, #bfb9c3 100%)' }}>
                <div className="m-2 rounded-xl bg-white/90 backdrop-blur-sm p-8 text-center shadow-inner">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                    <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Registration Successful!</h3>
                  <p className="text-[11px] text-slate-500">Redirecting to login...</p>
                </div>
              </div>
            </motion.div>
          ) : !showForm ? (
            /* Pre-form: Register prompt card */
            <motion.div key="prompt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="w-full max-w-[320px] mx-4">
              {/* Clipboard clip */}
              <div className="flex justify-center -mb-2 relative z-10">
                <div className="w-24 h-5 rounded-t-lg border-2 border-amber-900 shadow-md"
                  style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)' }} />
              </div>
              {/* Paper */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #c7c1cb 0%, #d1cbd5 50%, #bfb9c3 100%)' }}>
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 22px, #64748b 22px, #64748b 23px)' }} />
                <div className="relative m-2 rounded-xl bg-white/90 backdrop-blur-sm p-5 shadow-inner">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 shadow-md shadow-primary-600/30 mb-2">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      Traffic Violation<br />Detection System
                    </h1>
                    <p className="text-[9px] text-slate-400 mt-1">Full Stack Project</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-3" />
                  </div>
                  <motion.button onClick={() => setShowForm(true)}
                    className="w-full py-2 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <UserPlus className="h-3.5 w-3.5" /> REGISTER
                  </motion.button>
                  <p className="text-center text-[10px] text-slate-500 pt-3">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 underline underline-offset-2">Sign in</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Registration form — same clipboard style, taller paper */
            <motion.div key="form"
              initial={{ opacity: 0, scale: 0.85, rotateY: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-[360px] mx-4 max-h-[90vh] overflow-y-auto">
              {/* Clipboard clip */}
              <div className="flex justify-center -mb-2 relative z-10">
                <div className="w-24 h-5 rounded-t-lg border-2 border-amber-900 shadow-md"
                  style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)' }} />
              </div>
              {/* Paper */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #c7c1cb 0%, #d1cbd5 50%, #bfb9c3 100%)' }}>
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 22px, #64748b 22px, #64748b 23px)' }} />
                <div className="relative m-2 rounded-xl bg-white/90 backdrop-blur-sm p-5 shadow-inner">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 shadow-md shadow-primary-600/30 mb-2">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      Registration Form
                    </h1>
                    <p className="text-[9px] text-slate-400 mt-1">Create your TrafficGuard account</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-3" />
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-[10px] rounded-lg text-center">
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Full Name</label>
                      <input type="text" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} required
                        className="w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Email Address</label>
                      <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required
                        className="w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6}
                          className="w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all pr-8" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Confirm Password</label>
                      <div className="relative">
                        <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required minLength={6}
                          className="w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all pr-8" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 mb-1 block">Account Type</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ROLES.map((role) => (
                          <button key={role.value} type="button" onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                            className={`px-2 py-1.5 rounded-lg border-2 text-left transition-all ${form.role === role.value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <span className="text-[11px] mr-0.5">{role.icon}</span>
                            <span className={`text-[9px] font-semibold ${form.role === role.value ? 'text-primary-700' : 'text-slate-600'}`}>{role.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <motion.button type="submit"
                      disabled={loading || !form.fullName || !form.email || !form.password || !form.confirmPassword}
                      className="w-full py-2 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                      {loading ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...</>) : (<><UserPlus className="h-3.5 w-3.5" /> CREATE ACCOUNT</>)}
                    </motion.button>

                    <p className="text-center text-[10px] text-slate-500 pt-1">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 underline underline-offset-2">Sign in</Link>
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
        className="absolute top-4 right-4 z-30 p-2 rounded-lg backdrop-blur-sm border transition-colors"
        style={{ background: isDay ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)', borderColor: isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }}
        onClick={toggleMode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        {isDay ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-300" />}
      </motion.button>
    </div>
  );
}

export default function Register() {
  return (<DayNightProvider><RegisterContent /></DayNightProvider>);
}
