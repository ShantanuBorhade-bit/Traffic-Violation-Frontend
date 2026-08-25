import { motion } from 'framer-motion';
import { useDayNight } from './DayNightContext';

const BUILDINGS = [
  { x: 0, w: 60, h: 180, color: '#4a5568', windows: 4 },
  { x: 55, w: 45, h: 220, color: '#5a6a7e', windows: 5 },
  { x: 95, w: 70, h: 160, color: '#3d4f63', windows: 3 },
  { x: 160, w: 50, h: 200, color: '#4e6070', windows: 4 },
  { x: 205, w: 80, h: 240, color: '#3a4a5a', windows: 6 },
  { x: 280, w: 55, h: 170, color: '#556677', windows: 3 },
  { x: 330, w: 65, h: 210, color: '#4a5a6a', windows: 5 },
  { x: 390, w: 75, h: 190, color: '#3e5060', windows: 4 },
  { x: 460, w: 50, h: 230, color: '#4c5c6c', windows: 5 },
  { x: 505, w: 60, h: 155, color: '#586878', windows: 3 },
  { x: 560, w: 85, h: 250, color: '#384858', windows: 6 },
  { x: 640, w: 55, h: 175, color: '#4b5b6b', windows: 4 },
  { x: 690, w: 70, h: 205, color: '#405060', windows: 4 },
  { x: 755, w: 45, h: 185, color: '#556575', windows: 3 },
  { x: 795, w: 60, h: 225, color: '#3c4c5c', windows: 5 },
  { x: 850, w: 80, h: 165, color: '#4a5a6a', windows: 3 },
  { x: 925, w: 55, h: 195, color: '#4e5e6e', windows: 4 },
  { x: 975, w: 70, h: 215, color: '#3b4b5b', windows: 5 },
];

function Building({ x, w, h, color, windows, isDay }) {
  const windowRows = windows;
  const windowCols = Math.floor(w / 18);

  return (
    <g transform={`translate(${x}, ${280 - h})`}>
      {/* Building body */}
      <rect width={w} height={h} fill={color} rx="2" />
      {/* Roof accent */}
      <rect width={w} height={4} fill={isDay ? '#6b7b8b' : '#2a3a4a'} rx="2" />

      {/* Windows */}
      {Array.from({ length: windowRows }).map((_, row) =>
        Array.from({ length: windowCols }).map((_, col) => {
          const wx = 8 + col * 18;
          const wy = 15 + row * (h / (windowRows + 1));
          const isLit = !isDay && Math.random() > 0.3;

          return (
            <rect
              key={`${row}-${col}`}
              x={wx}
              y={wy}
              width={10}
              height={12}
              rx="1"
              fill={
                isDay
                  ? 'rgba(135, 206, 235, 0.3)'
                  : isLit
                    ? 'rgba(255, 220, 100, 0.8)'
                    : 'rgba(20, 30, 50, 0.6)'
              }
            />
          );
        })
      )}
    </g>
  );
}

export default function Buildings() {
  const { isDay } = useDayNight();

  return (
    <svg
      className="absolute bottom-[28%] left-0 w-full"
      viewBox="0 0 1050 280"
      preserveAspectRatio="xMidYMax slice"
      style={{ height: '35%' }}
    >
      {BUILDINGS.map((b, i) => (
        <Building key={i} {...b} isDay={isDay} />
      ))}
    </svg>
  );
}
