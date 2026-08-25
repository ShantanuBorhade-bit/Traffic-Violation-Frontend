import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider } from '../components/auth/DayNightContext';
import { useDayNight } from '../components/auth/DayNightContext';
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2, ArrowLeft, Shield, Sun, Moon } from 'lucide-react';

const ROLES = [
  { value: 'CITIZEN', label: 'Citizen', icon: '👤', desc: 'File & track grievances' },
  { value: 'TRAFFIC_OFFICER', label: 'Traffic Officer', icon: '👮', desc: 'Monitor violations' },
  { value: 'GRIEVANCE_OFFICER', label: 'Grievance Officer', icon: '📋', desc: 'Review disputes' },
  { value: 'ADMIN', label: 'Administrator', icon: '🛡️', desc: 'Manage system' },
];

function RegisterContent() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isDay, toggleMode } = useDayNight();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      {/* Background scene image - register entry state (day-3/night-4 shows person with clipboard) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDay ? 'day' : 'night'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={isDay ? '/auth-scenes/day-4.png' : '/auth-scenes/night-2.png'}
            alt="Registration scene"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)'
      }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col z-20">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white backdrop-blur-sm bg-black/20 rounded-xl px-3 py-2 transition-colors border border-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </motion.div>

          <motion.button
            className="p-2.5 rounded-xl backdrop-blur-sm border transition-colors"
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

        {/* Registration form - centered, matching the clipboard/paper style from reference */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-sm"
          >
            {/* Clipboard top */}
            <div className="flex justify-center -mb-2 relative z-10">
              <div className="w-20 h-5 bg-amber-800 rounded-t-lg border-2 border-amber-900 shadow-md" />
            </div>

            {/* Paper form */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
              {/* Paper texture lines */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, #94a3b8 28px, #94a3b8 29px)',
                }}
              />

              <div className="p-6 pt-5 relative">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-600 shadow-lg shadow-primary-600/30 mb-2.5">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">REGISTRATION FORM</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Traffic Violation Detection System</p>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-3" />
                </div>

                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      >
                        <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-3" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Registration Successful!</h3>
                      <p className="text-xs text-slate-500">Redirecting to login...</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-lg text-center"
                        >
                          {error}
                        </motion.div>
                      )}

                      {/* Full Name */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="John Doe"
                          value={form.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Role Selection */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Account Type</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ROLES.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                              className={`p-2 rounded-lg border-2 text-left transition-all ${
                                form.role === role.value
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-sm mr-1">{role.icon}</span>
                              <span className={`text-[11px] font-semibold ${form.role === role.value ? 'text-primary-700' : 'text-slate-700'}`}>
                                {role.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={loading || !form.fullName || !form.email || !form.password || !form.confirmPassword}
                        className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            REGISTER
                          </>
                        )}
                      </motion.button>

                      <p className="text-center text-[11px] text-slate-500 pt-1">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 underline underline-offset-2 transition-colors">
                          Sign in
                        </Link>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <DayNightProvider>
      <RegisterContent />
    </DayNightProvider>
  );
}
