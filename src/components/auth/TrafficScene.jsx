import { motion, AnimatePresence } from 'framer-motion';
import { useDayNight, AUTH_STATES } from './DayNightContext';

export default function TrafficScene({ children, authState = AUTH_STATES.LOGIN, dimmed }) {
  const { isDay, toggleMode, getImage } = useDayNight();

  const currentImage = getImage(authState);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      {/* Background image with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <img
            src={currentImage}
            alt="Traffic scene"
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Content overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-30"
        animate={{ opacity: dimmed ? 0.2 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>

      {/* Day/Night toggle */}
      <motion.button
        className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border transition-colors"
        style={{
          background: isDay ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)',
          borderColor: isDay ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
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
