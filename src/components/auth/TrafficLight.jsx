import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDayNight } from './DayNightContext';

export default function TrafficLight({ onGreen, forceState }) {
  const { isDay } = useDayNight();
  const [activeLight, setActiveLight] = useState('red');
  const [isCycleActive, setIsCycleActive] = useState(true);

  // Traffic light cycle: RED → GREEN → YELLOW → RED
  useEffect(() => {
    if (!isCycleActive || forceState) return;

    const cycle = {
      red: 4000,
      green: 3000,
      yellow: 1000,
    };

    const nextLight = {
      red: 'green',
      green: 'yellow',
      yellow: 'red',
    };

    const timer = setTimeout(() => {
      const next = nextLight[activeLight];
      setActiveLight(next);
      if (next === 'green' && onGreen) onGreen();
    }, cycle[activeLight]);

    return () => clearTimeout(timer);
  }, [activeLight, isCycleActive, forceState, onGreen]);

  // Force state for login animation
  useEffect(() => {
    if (forceState) {
      setIsCycleActive(false);
      setActiveLight(forceState);
    }
  }, [forceState]);

  const poleColor = isDay ? '#64748b' : '#334155';
  const housingColor = isDay ? '#1e293b' : '#0f172a';

  return (
    <div className="absolute" style={{ left: '8%', bottom: '38%', zIndex: 20 }}>
      <svg width="50" height="200" viewBox="0 0 50 200">
        {/* Pole */}
        <rect x="20" y="80" width="10" height="120" fill={poleColor} rx="3" />

        {/* Housing */}
        <rect x="5" y="0" width="40" height="85" rx="8" fill={housingColor} stroke={isDay ? '#475569' : '#1e293b'} strokeWidth="2" />

        {/* Red light */}
        <circle cx="25" cy="20" r="10"
          fill={activeLight === 'red' ? '#ef4444' : '#4a1a1a'}
        />
        {activeLight === 'red' && (
          <circle cx="25" cy="20" r="14" fill="#ef4444" opacity="0.3">
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Yellow light */}
        <circle cx="25" cy="42" r="10"
          fill={activeLight === 'yellow' ? '#f59e0b' : '#4a3a0a'}
        />
        {activeLight === 'yellow' && (
          <circle cx="25" cy="42" r="14" fill="#f59e0b" opacity="0.3">
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Green light */}
        <circle cx="25" cy="64" r="10"
          fill={activeLight === 'green' ? '#22c55e' : '#0a3a1a'}
        />
        {activeLight === 'green' && (
          <circle cx="25" cy="64" r="14" fill="#22c55e" opacity="0.3">
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}
