import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';

export default function Sky() {
  const { isDay } = useDayNight();

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isDay
            ? 'linear-gradient(180deg, #87CEEB 0%, #B8E4F9 40%, #E8F4FD 100%)'
            : 'linear-gradient(180deg, #0a1628 0%, #1a2744 40%, #2a3a5c 100%)',
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Sun */}
      <motion.div
        className="absolute"
        style={{ right: '15%', top: '10%' }}
        animate={{
          opacity: isDay ? 1 : 0,
          scale: isDay ? 1 : 0.5,
          y: isDay ? 0 : 60,
        }}
        transition={{ duration: 2 }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.5)]" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 blur-xl opacity-40" />
        </div>
      </motion.div>

      {/* Moon */}
      <motion.div
        className="absolute"
        style={{ right: '20%', top: '8%' }}
        animate={{
          opacity: isDay ? 0 : 1,
          scale: isDay ? 0.5 : 1,
          y: isDay ? -30 : 0,
        }}
        transition={{ duration: 2 }}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-slate-200 shadow-[0_0_30px_rgba(226,232,240,0.3)]" />
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-300/30" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-300/20" />
        </div>
      </motion.div>

      {/* Stars */}
      {[
        { x: '10%', y: '5%', size: 2, delay: 0 },
        { x: '25%', y: '8%', size: 1.5, delay: 0.3 },
        { x: '40%', y: '3%', size: 2, delay: 0.6 },
        { x: '55%', y: '12%', size: 1, delay: 0.2 },
        { x: '70%', y: '6%', size: 1.5, delay: 0.8 },
        { x: '85%', y: '10%', size: 2, delay: 0.4 },
        { x: '15%', y: '15%', size: 1, delay: 1 },
        { x: '60%', y: '18%', size: 1.5, delay: 0.7 },
        { x: '35%', y: '20%', size: 1, delay: 0.1 },
        { x: '78%', y: '4%', size: 2, delay: 0.5 },
      ].map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: isDay ? 0 : [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Clouds */}
      {[
        { x: '5%', y: '15%', scale: 1, speed: 80 },
        { x: '30%', y: '8%', scale: 0.7, speed: 100 },
        { x: '60%', y: '12%', scale: 0.9, speed: 90 },
        { x: '80%', y: '6%', scale: 0.6, speed: 110 },
      ].map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: cloud.y }}
          animate={{
            x: [0, 20, 0],
            opacity: isDay ? 0.8 : 0.15,
          }}
          transition={{
            x: { duration: cloud.speed, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 2 },
          }}
        >
          <svg
            width={120 * cloud.scale}
            height={40 * cloud.scale}
            viewBox="0 0 120 40"
          >
            <ellipse cx="60" cy="25" rx="50" ry="15" fill="white" opacity="0.9" />
            <ellipse cx="40" cy="20" rx="30" ry="18" fill="white" opacity="0.85" />
            <ellipse cx="80" cy="20" rx="28" ry="14" fill="white" opacity="0.85" />
            <ellipse cx="55" cy="15" rx="22" ry="16" fill="white" opacity="0.95" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
