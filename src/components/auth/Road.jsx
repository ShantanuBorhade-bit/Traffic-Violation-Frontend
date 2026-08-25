import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';

export default function Road() {
  const { isDay } = useDayNight();

  return (
    <div className="absolute bottom-0 left-0 right-0" style={{ height: '40%' }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        {/* Road surface */}
        <defs>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDay ? '#4a5568' : '#1a2332'} />
            <stop offset="100%" stopColor={isDay ? '#2d3748' : '#0f1520'} />
          </linearGradient>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDay ? '#48bb78' : '#1a3a2a'} />
            <stop offset="100%" stopColor={isDay ? '#38a169' : '#0f2a1a'} />
          </linearGradient>
        </defs>

        {/* Grass on sides */}
        <polygon points="0,0 200,280 0,400" fill="url(#grassGrad)" />
        <polygon points="1200,0 1000,280 1200,400" fill="url(#grassGrad)" />

        {/* Road surface */}
        <polygon
          points="200,0 0,400 1200,400 1000,0"
          fill="url(#roadGrad)"
        />

        {/* Road edges - white lines */}
        <line x1="210" y1="0" x2="10" y2="400" stroke={isDay ? '#e2e8f0' : '#4a5568'} strokeWidth="3" />
        <line x1="990" y1="0" x2="1190" y2="400" stroke={isDay ? '#e2e8f0' : '#4a5568'} strokeWidth="3" />

        {/* Center dashed line */}
        {Array.from({ length: 12 }).map((_, i) => {
          const t = i / 12;
          const y = t * 380 + 10;
          const x = 580 + (t * 20 - 10) * 0;
          const width = 3 + t * 2;
          const height = 15 + t * 10;
          const opacity = 0.6 + t * 0.4;

          return (
            <rect
              key={i}
              x={590}
              y={y}
              width={width}
              height={height}
              fill={isDay ? '#f7fafc' : '#94a3b8'}
              opacity={opacity}
              rx="1"
            />
          );
        })}

        {/* Zebra crossing */}
        {Array.from({ length: 8 }).map((_, i) => {
          const t = i / 8;
          const y = 200 + t * 20;
          const xLeft = 380 - t * 40;
          const xRight = 820 + t * 40;
          const width = xRight - xLeft;
          const height = 8 + t * 2;

          return (
            <rect
              key={`zebra-${i}`}
              x={xLeft}
              y={y}
              width={width}
              height={height}
              fill={isDay ? 'white' : '#cbd5e1'}
              opacity={0.9}
              rx="1"
            />
          );
        })}

        {/* Road shoulder lines */}
        <line x1="220" y1="5" x2="30" y2="395" stroke={isDay ? '#f6e05e' : '#975a16'} strokeWidth="4" opacity="0.6" />
        <line x1="980" y1="5" x2="1170" y2="395" stroke={isDay ? '#f6e05e' : '#975a16'} strokeWidth="4" opacity="0.6" />
      </svg>
    </div>
  );
}
