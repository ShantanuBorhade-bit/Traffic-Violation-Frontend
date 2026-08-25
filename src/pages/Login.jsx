import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DayNightProvider } from '../components/auth/DayNightContext';
import TrafficScene from '../components/auth/TrafficScene';
import CarLogin from '../components/auth/CarLogin';
import { Shield } from 'lucide-react';

function LoginContent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginState, setLoginState] = useState('idle'); // idle, headlights, accelerating, done
  const [trafficLightState, setTrafficLightState] = useState(null);

  const handleLogin = async (email, password) => {
    setError('');
    setLoading(true);

    try {
      // Phase 1: Headlights turn on
      setLoginState('headlights');
      setTrafficLightState('yellow');

      await new Promise((r) => setTimeout(r, 500));

      // Phase 2: Traffic light turns green
      setTrafficLightState('green');
      await new Promise((r) => setTimeout(r, 300));

      // Phase 3: Attempt login
      const userData = await login(email, password);

      // Phase 4: Car accelerates
      setLoginState('accelerating');
      await new Promise((r) => setTimeout(r, 1200));

      // Phase 5: Navigate to dashboard
      setLoginState('done');
      const route =
        userData.role === 'CITIZEN'
          ? '/citizen'
          : userData.role === 'ADMIN'
            ? '/admin'
            : '/officer';
      navigate(route);
    } catch (err) {
      setLoginState('idle');
      setTrafficLightState(null);
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrafficScene
      trafficLightState={trafficLightState}
      dimmed={loginState === 'accelerating' || loginState === 'done'}
    >
      <AnimatePresence mode="wait">
        {loginState === 'idle' || loginState === 'headlights' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.5,
              filter: 'blur(10px)',
              transition: { duration: 0.6 },
            }}
          >
            <CarLogin
              onLogin={handleLogin}
              loading={loading}
              error={error}
            />
          </motion.div>
        ) : loginState === 'accelerating' ? (
          <motion.div
            key="accelerating"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [1, 1.1, 20],
              filter: ['blur(0px)', 'blur(0px)', 'blur(20px)'],
            }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary-400" />
                <div>
                  <p className="text-white font-bold text-lg">Access Granted</p>
                  <p className="text-white/60 text-sm">Entering TrafficGuard...</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TrafficScene>
  );
}

export default function Login() {
  return (
    <DayNightProvider>
      <LoginContent />
    </DayNightProvider>
  );
}
