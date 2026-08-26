import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider, useDayNight } from '../components/auth/DayNightContext';
import api from '../api/client';
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2, ArrowLeft, Shield, Sun, Moon, Smartphone, Send, KeyRound, RefreshCw, MessageSquare } from 'lucide-react';

function RegisterContent() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isDay, toggleMode, bgImage } = useDayNight();

  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [provider, setProvider] = useState('sms');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  const otpRequestInFlightRef = useRef(false);

  const startCooldown = useCallback((seconds) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Step 1: Validate form, send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (otpRequestInFlightRef.current) return;
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    otpRequestInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone: form.phone });
      if (!res.data.success) {
        setError(res.data.message || 'Failed to send OTP');
        return;
      }
      setProvider(res.data.provider || 'sms');
      setOtpSent(true);
      setStep('otp');
      startCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      otpRequestInFlightRef.current = false;
      setLoading(false);
    }
  };

  // Step 2: Verify OTP + register
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const verifyRes = await api.post('/auth/verify-otp', { phone: form.phone, code: otp });
      if (!verifyRes.data.success) {
        setError(verifyRes.data.message || 'Invalid OTP');
        if (verifyRes.data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(verifyRes.data.attemptsRemaining);
        }
        setLoading(false);
        return;
      }
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      setStep('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpRequestInFlightRef.current) return;
    setError('');
    setOtp('');
    otpRequestInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone: form.phone });
      if (!res.data.success) {
        setError(res.data.message || 'Failed to resend OTP');
        return;
      }
      setProvider(res.data.provider || 'sms');
      startCooldown(30);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP';
      setError(msg);
      // If rate limited, parse the cooldown from the error
      const match = msg.match(/wait (\d+) seconds/);
      if (match) startCooldown(parseInt(match[1]));
    } finally {
      otpRequestInFlightRef.current = false;
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      <AnimatePresence mode="wait">
        <motion.div key={bgImage} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          <img src={bgImage} alt="" className="w-full h-full object-cover" draggable={false} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showForm && step !== 'success' && (
          <motion.img src="/human.png" alt="Officer"
            className="absolute z-15 drop-shadow-2xl"
            style={{ right: '15%', bottom: '5%', height: '55%' }}
            initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }} />
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 z-30">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white backdrop-blur-sm bg-black/20 rounded-xl px-3 py-2 transition-colors border border-white/10">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {step === 'success' ? (
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
          ) : (
            <motion.div key="form"
              initial={{ opacity: 0, scale: 0.85, rotateY: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-[360px] mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-center -mb-2 relative z-10">
                <div className="w-24 h-5 rounded-t-lg border-2 border-amber-900 shadow-md"
                  style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)' }} />
              </div>
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
                      {step === 'form' ? 'Registration Form' : 'Verify Phone Number'}
                    </h1>
                    <p className="text-[9px] text-slate-400 mt-1">
                      {step === 'form'
                        ? 'Create your TrafficGuard account'
                        : <>Enter the 6-digit code sent to<br /><span className="font-semibold text-slate-600">{form.phone}</span></>}
                    </p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mt-3" />
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className={`w-6 h-1.5 rounded-full ${step === 'form' ? 'bg-primary-500' : 'bg-success-500'}`} />
                      <div className={`w-6 h-1.5 rounded-full ${step === 'otp' ? 'bg-primary-500' : 'bg-slate-200'}`} />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-[10px] rounded-lg text-center">
                      {error}
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {step === 'form' ? (
                      <motion.form key="step1" onSubmit={handleSendOtp} className="space-y-2"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Full Name</label>
                          <input type="text" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} required className={inputClass} />
                        </div>

                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Email Address</label>
                          <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required className={inputClass} />
                        </div>

                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Phone Number</label>
                          <div className="relative">
                            <Smartphone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input type="tel" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required
                              className={`${inputClass} pl-8`} />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Password</label>
                          <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6}
                              className={`${inputClass} pr-8`} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">Confirm Password</label>
                          <div className="relative">
                            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required minLength={6}
                              className={`${inputClass} pr-8`} />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <motion.button type="submit"
                          disabled={loading || !form.fullName || !form.email || !form.password || !form.confirmPassword || !form.phone}
                          className="w-full py-2 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                          whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                          {loading ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>) : (<><Send className="h-3.5 w-3.5" /> SEND OTP</>)}
                        </motion.button>

                        <p className="text-center text-[10px] text-slate-500 pt-1">
                          Already have an account?{' '}
                          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 underline underline-offset-2">Sign in</Link>
                        </p>
                      </motion.form>
                    ) : (
                      <motion.form key="step2" onSubmit={handleVerifyOtp} className="space-y-3"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

                        <div className="text-center mb-2">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-2">
                            <KeyRound className="h-6 w-6 text-primary-600" />
                          </div>
                          <p className="text-[10px] text-slate-500">
                            We sent a verification code via{' '}
                            <span className="font-semibold text-primary-600 uppercase">{provider}</span>
                          </p>
                          {attemptsRemaining < 5 && (
                            <p className="text-[9px] text-orange-500 mt-1">
                              {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 mb-1 block text-center">Enter 6-Digit OTP</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                            autoFocus
                            className="w-full px-3 py-3 text-center text-lg font-mono font-bold tracking-[0.5em] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                        </div>

                        <motion.button type="submit"
                          disabled={loading || otp.length !== 6}
                          className="w-full py-2 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                          whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                          {loading ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...</>) : (<><CheckCircle2 className="h-3.5 w-3.5" /> VERIFY & REGISTER</>)}
                        </motion.button>

                        <div className="flex items-center justify-between text-[10px]">
                          <button type="button" onClick={() => { setStep('form'); setError(''); setOtp(''); setAttemptsRemaining(5); }}
                            className="text-slate-500 hover:text-slate-700 underline">
                            ← Change number
                          </button>
                          {cooldown > 0 ? (
                            <span className="text-slate-400 flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" /> Resend in {cooldown}s
                            </span>
                          ) : (
                            <button type="button" onClick={handleResendOtp} disabled={loading}
                              className="text-primary-600 font-semibold hover:text-primary-700 underline flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Resend OTP
                            </button>
                          )}
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
