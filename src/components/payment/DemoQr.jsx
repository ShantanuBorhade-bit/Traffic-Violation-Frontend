import { useMemo } from 'react';

/**
 * Decorative, deliberately non-functional QR-like pattern.
 *
 * It is NOT a valid QR code: the payload is a demo placeholder string from the API
 * (`DEMO-ECHALLAN|PAY|...|NOT-A-REAL-PAYMENT`) and the modules are pseudo-random, so no
 * scanner can decode it into a payment. The centre badge makes that obvious at a glance.
 */

const MODULES = 25;
const QUIET = 1;

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildModules(payload) {
  let seed = hashString(String(payload)) || 1;
  const next = () => {
    seed ^= (seed << 13) >>> 0;
    seed >>>= 0;
    seed ^= seed >>> 17;
    seed ^= (seed << 5) >>> 0;
    seed >>>= 0;
    return seed / 4294967296;
  };

  const finderZones = [
    [0, 0],
    [MODULES - 7, 0],
    [0, MODULES - 7]
  ];
  const inFinder = (x, y) =>
    finderZones.some(([ox, oy]) => x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7);

  const cells = [];
  for (let y = 0; y < MODULES; y += 1) {
    for (let x = 0; x < MODULES; x += 1) {
      if (inFinder(x, y)) continue;
      if (next() > 0.52) cells.push([x, y]);
    }
  }

  const finders = finderZones.map(([x, y]) => ({ x, y }));
  return { cells, finders };
}

function Finder({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} rx={1.4} fill="none" stroke="currentColor" strokeWidth={1.1} />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
    </g>
  );
}

export default function DemoQr({ payload = 'DEMO', size = 176, className = '' }) {
  const { cells, finders } = useMemo(() => buildModules(payload), [payload]);
  const span = MODULES + QUIET * 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-white/90 p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25)] dark:bg-slate-100 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${span} ${span}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Illustrative demo QR code — not scannable"
        className="text-slate-900"
      >
        <g transform={`translate(${QUIET} ${QUIET})`}>
          {cells.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.18} fill="currentColor" />
          ))}
          {finders.map((f) => (
            <Finder key={`${f.x}-${f.y}`} {...f} />
          ))}
        </g>
      </svg>

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm ring-1 ring-slate-900/10">
          Demo
        </span>
      </span>
    </div>
  );
}
