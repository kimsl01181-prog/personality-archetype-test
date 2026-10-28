/**
 * 24개 유형의 상징 아이콘 (직접 그린 단순 SVG, 64×64)
 * 선은 currentColor, 면은 currentColor를 옅게 채운다.
 */
import type { ReactNode } from "react";

const soft = { fill: "currentColor", fillOpacity: 0.18 } as const;
const solid = { fill: "currentColor", stroke: "none" } as const;

const ICONS: Record<string, ReactNode> = {
  compass: (
    <>
      <circle cx="32" cy="32" r="23" {...soft} />
      <path d="M32 5v4M32 55v4M5 32h4M55 32h4" />
      <path d="M32 15 38 32H26Z" {...solid} />
      <path d="M26 32 32 49 38 32" />
      <circle cx="32" cy="32" r="2.5" {...solid} />
    </>
  ),
  blueprint: (
    <>
      <rect x="8" y="20" width="48" height="36" rx="3" {...soft} />
      <path d="M14 46h16M14 40h10" strokeWidth="2" />
      <circle cx="40" cy="10" r="3" />
      <path d="M38.5 13 30 44M41.5 13 50 44" />
      <path d="M33 34q7 4 14 0" strokeWidth="2" />
    </>
  ),
  knot: (
    <>
      <circle cx="24" cy="32" r="12" {...soft} />
      <circle cx="40" cy="32" r="12" />
      <path d="M6 48l8-6M58 16l-8 6" />
    </>
  ),
  candle: (
    <>
      <path d="M6 46q13-6 26 0 13-6 26 0v9q-13-6-26 0-13-6-26 0Z" {...soft} />
      <path d="M32 46v9" />
      <rect x="27" y="22" width="10" height="20" rx="2" />
      <path d="M32 6c5 5 5 9 0 12-5-3-5-7 0-12Z" {...solid} />
    </>
  ),
  flag: (
    <>
      <path d="M18 8v48M11 56h14" />
      <path d="M18 11h32l-7 9.5 7 9.5H18" {...soft} />
    </>
  ),
  spotlight: (
    <>
      <path d="M27 15 12 50h40L37 15Z" {...soft} stroke="none" />
      <rect x="25" y="6" width="14" height="10" rx="3" />
      <path d="M27 16 13 49M37 16l14 33" strokeWidth="2" strokeDasharray="3 4" />
      <ellipse cx="32" cy="50" rx="20" ry="5" />
      <path d="m32 28 2 4 4 .6-3 2.8.8 4.2-3.8-2-3.8 2 .8-4.2-3-2.8 4-.6Z" {...solid} />
    </>
  ),
  mugs: (
    <>
      <rect x="10" y="28" width="18" height="22" rx="3" {...soft} />
      <path d="M10 33H7a4.5 4.5 0 0 0 0 9h3" />
      <rect x="36" y="28" width="18" height="22" rx="3" {...soft} />
      <path d="M54 33h3a4.5 4.5 0 0 1 0 9h-3" />
      <path d="M17 22q3-4 0-8M45 22q3-4 0-8" strokeWidth="2" />
      <path d="M32 26c-3-3-6 0-3 3l3 3 3-3c3-3 0-6-3-3Z" {...solid} />
    </>
  ),
  hammock: (
    <>
      <path d="M8 14v42M56 14v42M4 56h56" />
      <path d="M8 20l9 11M56 20l-9 11" strokeWidth="2" />
      <path d="M17 31q15 18 30 0-15 9-30 0Z" {...soft} />
      <path d="M8 14q-4-6 0-8M56 14q4-6 0-8" strokeWidth="2" />
      <path d="M40 10h6l-6 6h6" strokeWidth="2" />
    </>
  ),
  "watering-can": (
    <>
      <path d="M14 26h26v22a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z" {...soft} />
      <path d="M20 26c0-12 14-12 14 0" />
      <path d="M40 33 53 21M50 17l7 7" />
      <path d="M58 30v3M54 34v3M59 38v3" strokeWidth="2.5" />
    </>
  ),
  telescope: (
    <>
      <path d="M9 32 46 15l4 10-37 17Z" {...soft} />
      <path d="M46 15l2-1 5 11-2 1" />
      <path d="M30 34 21 56M30 34l9 22M30 34v22" />
    </>
  ),
  scale: (
    <>
      <circle cx="32" cy="9" r="2.5" {...solid} />
      <path d="M32 12v40M20 52h24M10 18h44" />
      <path d="M10 18 5 34M10 18l5 16M54 18l-5 16M54 18l5 16" strokeWidth="2" />
      <path d="M3 34h14a7 6 0 0 1-14 0ZM47 34h14a7 6 0 0 1-14 0Z" {...soft} />
    </>
  ),
  "chess-knight": (
    <>
      <path
        d="M20 50h26v-5h-3c0-8 2-13 4-19 2-9-4-17-14-17l-4-4-2 6c-7 4-12 11-12 17l6 2 6-4c2 3 1 7-5 12v7Z"
        {...soft}
      />
      <rect x="15" y="50" width="36" height="6" rx="2" />
      <circle cx="31" cy="19" r="1.8" {...solid} />
    </>
  ),
  microphone: (
    <>
      <rect x="23" y="6" width="18" height="28" rx="9" {...soft} />
      <path d="M23 18h18M23 24h18" strokeWidth="2" />
      <path d="M16 28a16 16 0 0 0 32 0M32 44v9M22 56h20" />
    </>
  ),
  lighthouse: (
    <>
      <path d="M8 13l14 4M8 25l14-4M56 13l-14 4M56 25l-14-4" strokeWidth="2" />
      <path d="M24 14 32 6l8 8Z" {...solid} />
      <rect x="25" y="14" width="14" height="9" rx="1" />
      <path d="M26 23 22 52h20l-4-29Z" {...soft} />
      <path d="M25 33h14M24 43h16" strokeWidth="2" />
      <path d="M4 57q5-4 10 0t10 0 10 0 10 0 10 0 10 0" strokeWidth="2.5" />
    </>
  ),
  fireplace: (
    <>
      <rect x="4" y="10" width="56" height="7" rx="2" {...soft} />
      <path d="M9 17v38h46V17" />
      <path d="M19 55V37a13 13 0 0 1 26 0v18" />
      <path d="M32 53c-9-5-5-12 0-18 2 6 9 10 0 18Z" {...solid} />
    </>
  ),
  magnifier: (
    <>
      <circle cx="26" cy="26" r="17" {...soft} />
      <path d="M39 39l16 16" strokeWidth="7" />
      <path d="M17 23a9 9 0 0 1 9-9" strokeWidth="2.5" />
    </>
  ),
  juggling: (
    <>
      <path d="M10 52Q32-22 54 52" strokeWidth="2" strokeDasharray="3 4" />
      <circle cx="32" cy="15" r="6.5" {...solid} />
      <circle cx="15" cy="40" r="6.5" {...solid} />
      <circle cx="49" cy="40" r="6.5" {...solid} />
      <path d="M22 56h20" />
    </>
  ),
  backpack: (
    <>
      <path d="M26 12V7h12v5" />
      <path d="M16 23a11 11 0 0 1 11-11h10a11 11 0 0 1 11 11v30a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4Z" {...soft} />
      <path d="M16 29h32" />
      <rect x="23" y="37" width="18" height="12" rx="3" />
    </>
  ),
  umbrella: (
    <>
      <path d="M32 5v3" />
      <path d="M6 32a26 26 0 0 1 52 0q-6.5-5-13 0-6.5-5-13 0-6.5-5-13 0-6.5-5-13 0Z" {...soft} />
      <path d="M32 32v18a5 5 0 0 1-10 0" />
    </>
  ),
  rocket: (
    <>
      <path d="M32 5c10 8 12 22 10 37H22C20 27 22 13 32 5Z" {...soft} />
      <circle cx="32" cy="23" r="5" />
      <path d="M22 33 13 46l9-3M42 33l9 13-9-3" />
      <path d="M27 46l5 12 5-12Z" {...solid} />
    </>
  ),
  bricks: (
    <>
      <rect x="6" y="42" width="24" height="12" rx="1.5" {...soft} />
      <rect x="34" y="42" width="24" height="12" rx="1.5" />
      <rect x="6" y="28" width="10" height="12" rx="1.5" />
      <rect x="20" y="28" width="24" height="12" rx="1.5" {...soft} />
      <rect x="48" y="28" width="10" height="12" rx="1.5" />
      <rect x="20" y="14" width="24" height="12" rx="1.5" />
    </>
  ),
  pen: (
    <>
      <path d="M10 54l6-19L32 19l13 13-16 16Z" {...soft} />
      <path d="M10 54l14-14" />
      <circle cx="25" cy="39" r="2.5" {...solid} />
      <path d="M43 9a6 6 0 1 1 7 7.5v4" />
      <circle cx="50" cy="27" r="2" {...solid} />
    </>
  ),
  "hot-air-balloon": (
    <>
      <path d="M32 5c14 0 21 12 16 25-3 8-10 12-12 16h-8c-2-4-9-8-12-16C11 17 18 5 32 5Z" {...soft} />
      <path d="M32 5c-8 9-8 30-4 41M32 5c8 9 8 30 4 41" strokeWidth="2" />
      <path d="M28 46v4M36 46v4" strokeWidth="2" />
      <rect x="26" y="50" width="12" height="8" rx="1.5" />
    </>
  ),
  key: (
    <>
      <circle cx="19" cy="32" r="12" {...soft} />
      <circle cx="19" cy="32" r="4" />
      <path d="M31 32h27M50 32v8M57 32v6" />
    </>
  ),
};

export default function SymbolIcon({ symbol, className, label }: { symbol: string; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {ICONS[symbol] ?? <circle cx="32" cy="32" r="20" />}
    </svg>
  );
}

export const SYMBOL_NAMES = Object.keys(ICONS);
