import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';
import Sky from './Sky';
import Buildings from './Buildings';
import Road from './Road';
import TrafficLight from './TrafficLight';
import CCTV from './CCTV';
import StreetElements from './StreetElements';

export default function TrafficScene({ children, trafficLightState, dimmed }) {
  const { isDay, toggleMode } = useDayNight();

  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      {/* Sky */}
      <Sky />

      {/* Buildings */}
      <Buildings />

      {/* Street elements */}
      <StreetElements />

      {/* Road */}
      <Road />

      {/* Traffic Light */}
      <TrafficLight forceState={trafficLightState} />

      {/* CCTV Camera */}
      <CCTV />

      {/* Content overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-30"
        animate={{ opacity: dimmed ? 0.3 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>

      {/* Day/Night toggle */}
      <motion.button
        className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border transition-colors"
        style={{
          background: isDay ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
          borderColor: isDay ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
          color: isDay ? '#1e293b' : '#e2e8f0',
        }}
        onClick={toggleMode}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDay ? '☀️ Day' : '🌙 Night'}
      </motion.button>
    </div>
  );
}
