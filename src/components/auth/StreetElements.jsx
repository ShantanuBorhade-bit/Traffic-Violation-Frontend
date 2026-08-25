import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';

function SpeedLimitSign({ x, y }) {
  return (
    <div className="absolute" style={{ left: x, bottom: y, zIndex: 15 }}>
      <svg width="45" height="70" viewBox="0 0 45 70">
        {/* Pole */}
        <rect x="18" y="25" width="6" height="45" fill="#94a3b8" rx="2" />
        {/* Sign */}
        <circle cx="22" cy="18" r="17" fill="white" stroke="#dc2626" strokeWidth="3" />
        <text x="22" y="24" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold" fontFamily="Arial">60</text>
      </svg>
    </div>
  );
}

function StreetLight({ x, isDay }) {
  return (
    <div className="absolute" style={{ left: x, bottom: '36%', zIndex: 15 }}>
      <svg width="30" height="160" viewBox="0 0 30 160">
        {/* Pole */}
        <rect x="12" y="30" width="6" height="130" fill="#64748b" rx="2" />
        {/* Arm */}
        <path d="M15,30 Q15,20 25,18" stroke="#64748b" strokeWidth="4" fill="none" />
        {/* Lamp */}
        <rect x="20" y="12" width="10" height="8" rx="2" fill={isDay ? '#94a3b8' : '#fbbf24'} />
        {/* Light glow at night */}
        {!isDay && (
          <motion.ellipse
            cx="25"
            cy="100"
            rx="30"
            ry="60"
            fill="url(#streetGlow)"
            animate={{ opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
        <defs>
          <radialGradient id="streetGlow">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Tree({ x, y, scale = 1 }) {
  return (
    <div className="absolute" style={{ left: x, bottom: y, zIndex: 12, transform: `scale(${scale})` }}>
      <svg width="50" height="80" viewBox="0 0 50 80">
        {/* Trunk */}
        <rect x="20" y="50" width="10" height="30" fill="#8B4513" rx="3" />
        {/* Foliage layers */}
        <ellipse cx="25" cy="40" rx="22" ry="20" fill="#228B22" opacity="0.9" />
        <ellipse cx="22" cy="35" rx="18" ry="18" fill="#2d9a2d" opacity="0.85" />
        <ellipse cx="28" cy="30" rx="15" ry="16" fill="#34c759" opacity="0.8" />
        <ellipse cx="25" cy="25" rx="10" ry="12" fill="#4ade80" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function StreetElements() {
  const { isDay } = useDayNight();

  return (
    <>
      <SpeedLimitSign x="15%" y="42%" />
      <StreetLight x="12%" isDay={isDay} />
      <StreetLight x="85%" isDay={isDay} />
      <Tree x="2%" y="38%" scale={0.8} />
      <Tree x="5%" y="40%" scale={1} />
      <Tree x="88%" y="39%" scale={0.9} />
      <Tree x="93%" y="41%" scale={0.7} />
    </>
  );
}
