import { useState, useEffect, createContext, useContext } from 'react';

const DayNightContext = createContext(null);

// Image mapping for each auth state
const DAY_IMAGES = [
  '/auth-scenes/day-1.png', // Login page
  '/auth-scenes/day-2.png', // Login with credentials
  '/auth-scenes/day-3.png', // Register entry (person appears)
  '/auth-scenes/day-4.png', // Registration form
  '/auth-scenes/day-5.png', // Registration success
];

const NIGHT_IMAGES = [
  '/auth-scenes/night-1.png',
  '/auth-scenes/night-2.png',
  '/auth-scenes/night-3.png',
  '/auth-scenes/night-4.png',
  '/auth-scenes/night-5.png',
];

export const AUTH_STATES = {
  LOGIN: 0,
  LOGIN_ACTIVE: 1,
  REGISTER_ENTRY: 2,
  REGISTER_FORM: 3,
  REGISTER_SUCCESS: 4,
};

export function DayNightProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const newMode = hour >= 6 && hour < 18 ? 'day' : 'night';
      setMode((prev) => (prev !== newMode ? newMode : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleMode = () => setMode((prev) => (prev === 'day' ? 'night' : 'day'));

  const getImage = (stateIndex) => {
    const images = mode === 'day' ? DAY_IMAGES : NIGHT_IMAGES;
    return images[stateIndex] || images[0];
  };

  return (
    <DayNightContext.Provider value={{ mode, isDay: mode === 'day', toggleMode, getImage }}>
      {children}
    </DayNightContext.Provider>
  );
}

export function useDayNight() {
  const ctx = useContext(DayNightContext);
  if (!ctx) throw new Error('useDayNight must be inside DayNightProvider');
  return ctx;
}
