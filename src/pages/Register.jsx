import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DayNightProvider } from '../components/auth/DayNightContext';
import TrafficScene from '../components/auth/TrafficScene';
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';

const ROLES = [
  { value: 'CITIZEN', label: 'Citizen', icon: '👤' },
  { value: 'TRAFFIC_OFFICER', label: 'Traffic Officer', icon: '👮' },
  { value: 'GRIEVANCE_OFFICER', label: 'Grievance Officer', icon: '📋' },
  { value: 'ADMIN', label: 'Administrator', icon: '🛡️' },
];

function RegisterContent() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CITIZEN',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => {
        const route =
          form.role === 'CITIZEN'
            ? '/citizen'
            : form.role === 'ADMIN'
              ? '/admin'
              : '/officer';
        navigate(route);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrafficScene>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md mx-4"
      >
        {/* Clipboard-style registration form */}
        <div className="relative">
          {/* Clipboard top clip */}
          <div className="flex justify-center -mb-2 relative z-10">
            <div className="w-24 h-6 bg-amber-700 rounded-t-lg border-2 border-amber-800" />
          </div>

          {/* Paper form */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-200 p-6 pt-4 relative overflow-hidden">
            {/* Paper texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 24px, #94a3b8 24px, #94a3b8 25px)`,
              }}
            />

            {/* Header */}
            <div className="text-center mb-5 relative">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">TrafficGuard</h2>
              </div>
              <p className="text-xs text-slate-500">New Account Registration</p>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-3" />
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="h-12 w-12 text-success-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Registration Successful!</h3>
                <p className="text-sm text-slate-500">Your account has been created. Redirecting...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 relative">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-danger-50 border border-danger-200 text-danger-700 text-xs rounded-lg text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-8"
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

                {/* Role Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                        className={`p-2 rounded-lg border-2 text-left transition-all text-xs ${
                          form.role === role.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm mr-1">{role.icon}</span>
                        <span className={`font-medium ${form.role === role.value ? 'text-primary-700' : 'text-slate-700'}`}>
                          {role.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || !form.fullName || !form.email || !form.password}
                  className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {loading ? 'Registering...' : 'Create Account'}
                </motion.button>

                <p className="text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </TrafficScene>
  );
}

export default function Register() {
  return (
    <DayNightProvider>
      <RegisterContent />
    </DayNightProvider>
  );
}
