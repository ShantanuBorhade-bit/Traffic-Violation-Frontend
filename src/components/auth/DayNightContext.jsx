import { useState, useEffect, createContext, useContext } from 'react';

const DayNightContext = createContext(null);

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

  const bgImage = mode === 'day' ? '/Day.png' : '/NightBAckgrount.png';

  return (
    <DayNightContext.Provider value={{ mode, isDay: mode === 'day', isNight: mode === 'night', toggleMode, bgImage }}>
      {children}
    </DayNightContext.Provider>
  );
}

export function useDayNight() {
  const ctx = useContext(DayNightContext);
  if (!ctx) throw new Error('useDayNight must be inside DayNightProvider');
  return ctx;
}
