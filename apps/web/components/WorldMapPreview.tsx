"use client";

import React, { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Region {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  citizenCount: number;
}

interface WorldMapPreviewProps {
  regions: Region[];
}

/* ------------------------------------------------------------------ */
/* Simplified but REALISTIC continent SVG paths                        */
/* viewBox: 0 0 1000 500  (equirectangular)                           */
/* projection: x = (lng+180)/360*1000,  y = (90-lat)/180*500          */
/* ------------------------------------------------------------------ */

const CONTINENTS = {
  northAmerica:
    "M 42 82 L 48 68 L 58 60 L 68 54 L 82 52 L 96 55 L 108 58 " +
    "L 118 62 L 128 58 L 142 55 L 158 58 L 168 64 L 175 72 " +
    "L 180 80 L 178 88 L 172 96 L 164 104 L 156 110 L 148 118 " +
    "L 140 124 L 130 128 L 122 134 L 118 140 L 112 148 L 106 152 " +
    "L 98 148 L 90 142 L 82 138 L 74 132 L 64 128 L 56 122 " +
    "L 50 114 L 44 106 L 40 96 L 40 88 Z",

  southAmerica:
    "M 108 158 L 114 155 L 122 158 L 128 164 L 134 172 L 138 182 " +
    "L 140 192 L 140 202 L 138 212 L 134 222 L 128 232 L 122 242 " +
    "L 116 252 L 112 262 L 108 272 L 104 282 L 100 290 L 96 284 " +
    "L 94 274 L 92 264 L 90 254 L 88 244 L 86 234 L 84 224 " +
    "L 82 214 L 82 204 L 84 194 L 88 184 L 92 174 L 96 168 " +
    "L 100 162 Z",

  europe:
    "M 458 62 L 464 56 L 472 50 L 480 48 L 488 50 L 494 54 " +
    "L 498 60 L 502 68 L 504 76 L 500 84 L 496 92 L 490 98 " +
    "L 484 104 L 478 108 L 470 112 L 462 110 L 456 104 L 452 96 " +
    "L 450 88 L 452 80 L 454 72 Z",

  africa:
    "M 458 120 L 466 116 L 474 114 L 484 116 L 492 120 L 498 126 " +
    "L 504 134 L 508 144 L 512 154 L 514 164 L 516 174 L 514 184 " +
    "L 510 194 L 504 204 L 498 214 L 492 222 L 486 228 L 480 232 " +
    "L 474 234 L 468 232 L 462 228 L 458 222 L 454 214 L 450 204 " +
    "L 448 194 L 446 184 L 446 174 L 448 164 L 450 154 L 452 144 " +
    "L 454 134 L 456 126 Z",

  asia:
    "M 502 48 L 510 42 L 522 38 L 536 36 L 550 38 L 564 42 " +
    "L 578 48 L 592 52 L 608 56 L 624 58 L 640 60 L 656 60 " +
    "L 672 58 L 688 56 L 704 54 L 720 52 L 736 52 L 752 54 " +
    "L 764 58 L 772 64 L 776 72 L 774 80 L 770 88 L 762 96 " +
    "L 752 102 L 740 108 L 728 114 L 716 118 L 704 122 L 692 124 " +
    "L 680 126 L 668 126 L 656 124 L 644 122 L 632 118 L 620 114 " +
    "L 608 110 L 596 106 L 584 102 L 572 98 L 560 94 L 548 90 " +
    "L 536 86 L 524 82 L 514 78 L 508 72 L 504 64 L 502 56 Z",

  australia:
    "M 714 262 L 722 256 L 732 254 L 742 256 L 750 260 L 756 266 " +
    "L 760 274 L 762 282 L 760 290 L 756 298 L 750 304 L 744 308 " +
    "L 736 310 L 728 310 L 720 308 L 714 304 L 708 298 L 704 290 " +
    "L 702 282 L 702 274 L 706 266 Z",

  // Greenland (bonus for realism)
  greenland:
    "M 210 42 L 216 38 L 224 36 L 232 38 L 238 42 L 240 48 " +
    "L 238 54 L 234 58 L 228 60 L 222 60 L 216 58 L 212 54 " +
    "L 210 48 Z",
};

/* ------------------------------------------------------------------ */
/* Projection helpers                                                  */
/* ------------------------------------------------------------------ */

function lngLatToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

function getDotRadius(count: number): number {
  if (count <= 5) return 4;
  if (count <= 20) return 5.5;
  if (count <= 50) return 7;
  return 9;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function WorldMapPreview({ regions }: WorldMapPreviewProps) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const handleDotEnter = useCallback(
    (name: string, count: number, x: number, y: number) => {
      setTooltip({ name, count, x, y });
    },
    []
  );

  const handleDotLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="glass-card overflow-hidden relative">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-800/50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Global Citizen Network
        </span>
      </div>

      <div className="relative w-full" style={{ aspectRatio: "2 / 1" }}>
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ----- Background ----- */}
          <defs>
            <radialGradient id="bg-grad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#06060c" />
            </radialGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="1000" height="500" fill="url(#bg-grad)" />

          {/* ----- Grid lines (sci-fi) ----- */}
          {Array.from({ length: 19 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={(i + 1) * 50}
              y1={0}
              x2={(i + 1) * 50}
              y2={500}
              stroke="rgba(59,130,246,0.04)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i + 1) * 50}
              x2={1000}
              y2={(i + 1) * 50}
              stroke="rgba(59,130,246,0.04)"
              strokeWidth={0.5}
            />
          ))}

          {/* Equator (subtle) */}
          <line
            x1={0}
            y1={250}
            x2={1000}
            y2={250}
            stroke="rgba(59,130,246,0.08)"
            strokeWidth={0.5}
            strokeDasharray="6,4"
          />

          {/* ----- Continent shapes ----- */}
          {Object.values(CONTINENTS).map((path, i) => (
            <path
              key={i}
              d={path}
              fill="#1a1a2e"
              stroke="#333"
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          ))}

          {/* ----- Region dots ----- */}
          {regions.map((region, i) => {
            const { x, y } = lngLatToSvg(region.latitude, region.longitude);
            const r = getDotRadius(region.citizenCount);

            return (
              <g
                key={`${region.countryCode}-${i}`}
                className="cursor-pointer"
                onMouseEnter={() =>
                  handleDotEnter(region.name, region.citizenCount, x, y)
                }
                onMouseLeave={handleDotLeave}
              >
                {/* Outer glow ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={r + 6}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  opacity={0.25}
                  className="pulse-dot"
                />

                {/* Glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={r + 3}
                  fill="rgba(59,130,246,0.15)"
                  filter="url(#glow-filter)"
                />

                {/* Main dot */}
                <circle cx={x} cy={y} r={r} fill="#3b82f6" />

                {/* Bright center */}
                <circle
                  cx={x}
                  cy={y}
                  r={r * 0.4}
                  fill="#93c5fd"
                  opacity={0.9}
                />

                {/* Country code label */}
                <text
                  x={x}
                  y={y - r - 8}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="500"
                >
                  {region.countryCode}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ----- Tooltip ----- */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg
                       bg-gray-900/95 border border-gray-700/60 backdrop-blur-sm
                       shadow-xl shadow-black/40 text-xs"
            style={{
              left: `${(tooltip.x / 1000) * 100}%`,
              top: `${(tooltip.y / 500) * 100 - 10}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-semibold text-white">{tooltip.name}</div>
            <div className="text-blue-400 mt-0.5">
              {tooltip.count.toLocaleString()}{" "}
              <span className="text-gray-500">citizens</span>
            </div>
          </div>
        )}
      </div>

      {/* ----- Legend ----- */}
      <div className="px-5 py-3 border-t border-gray-800/50 flex items-center gap-5">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider mr-1">
          Citizens
        </span>
        {[
          { label: "1-5", size: 4 },
          { label: "6-20", size: 5.5 },
          { label: "21-50", size: 7 },
          { label: "50+", size: 9 },
        ].map(({ label, size }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width={size * 2 + 6} height={size * 2 + 6}>
              <circle
                cx={size + 3}
                cy={size + 3}
                r={size}
                fill="#3b82f6"
              />
            </svg>
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
