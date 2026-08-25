import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';

export default function CCTV() {
  const { isDay } = useDayNight();

  return (
    <div className="absolute" style={{ right: '6%', bottom: '42%', zIndex: 20 }}>
      <svg width="120" height="140" viewBox="0 0 120 140">
        {/* Pole */}
        <rect x="15" y="60" width="8" height="80" fill={isDay ? '#64748b' : '#475569'} rx="2" />

        {/* Arm */}
        <rect x="15" y="55" width="40" height="6" fill={isDay ? '#64748b' : '#475569'} rx="2" />

        {/* Camera body */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '55px', originY: '55px' }}
        >
          {/* Camera housing */}
          <rect x="45" y="35" width="55" height="30" rx="4" fill={isDay ? '#334155' : '#1e293b'} />

          {/* Lens */}
          <circle cx="95" cy="50" r="10" fill={isDay ? '#1e293b' : '#0f172a'} stroke="#475569" strokeWidth="1.5" />
          <circle cx="95" cy="50" r="6" fill={isDay ? '#0f172a' : '#020617'} />
          <circle cx="95" cy="50" r="3" fill={isDay ? '#334155' : '#1e293b'} />

          {/* Lens reflection */}
          <circle cx="93" cy="48" r="1.5" fill="rgba(255,255,255,0.3)" />
        </motion.g>

        {/* Indicator light */}
        <motion.circle
          cx="50"
          cy="40"
          r="3"
          fill="#ef4444"
          animate={{
            opacity: [1, 0.3, 1],
            boxShadow: isDay ? 'none' : '0 0 8px rgba(239,68,68,0.8)',
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Scanning cone (subtle) */}
        <motion.polygon
          points="100,50 140,30 140,70"
          fill="url(#scanGrad)"
          opacity="0"
          animate={{
            opacity: [0, 0.15, 0],
            points: ['100,50 130,35 130,65', '100,50 140,25 140,75', '100,50 130,35 130,65'],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }}
        />

        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
