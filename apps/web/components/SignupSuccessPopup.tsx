'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

/* ------------------------------------------------------------------ */
/* Continent SVG paths (simplified equirectangular)                    */
/* ------------------------------------------------------------------ */

const CONTINENTS = {
  northAmerica:
    'M 42 82 L 48 68 L 58 60 L 68 54 L 82 52 L 96 55 L 108 58 ' +
    'L 118 62 L 128 58 L 142 55 L 158 58 L 168 64 L 175 72 ' +
    'L 180 80 L 178 88 L 172 96 L 164 104 L 156 110 L 148 118 ' +
    'L 140 124 L 130 128 L 122 134 L 118 140 L 112 148 L 106 152 ' +
    'L 98 148 L 90 142 L 82 138 L 74 132 L 64 128 L 56 122 ' +
    'L 50 114 L 44 106 L 40 96 L 40 88 Z',
  southAmerica:
    'M 108 158 L 114 155 L 122 158 L 128 164 L 134 172 L 138 182 ' +
    'L 140 192 L 140 202 L 138 212 L 134 222 L 128 232 L 122 242 ' +
    'L 116 252 L 112 262 L 108 272 L 104 282 L 100 290 L 96 284 ' +
    'L 94 274 L 92 264 L 90 254 L 88 244 L 86 234 L 84 224 ' +
    'L 82 214 L 82 204 L 84 194 L 88 184 L 92 174 L 96 168 ' +
    'L 100 162 Z',
  europe:
    'M 458 62 L 464 56 L 472 50 L 480 48 L 488 50 L 494 54 ' +
    'L 498 60 L 502 68 L 504 76 L 500 84 L 496 92 L 490 98 ' +
    'L 484 104 L 478 108 L 470 112 L 462 110 L 456 104 L 452 96 ' +
    'L 450 88 L 452 80 L 454 72 Z',
  africa:
    'M 458 120 L 466 116 L 474 114 L 484 116 L 492 120 L 498 126 ' +
    'L 504 134 L 508 144 L 512 154 L 514 164 L 516 174 L 514 184 ' +
    'L 510 194 L 504 204 L 498 214 L 492 222 L 486 228 L 480 232 ' +
    'L 474 234 L 468 232 L 462 228 L 458 222 L 454 214 L 450 204 ' +
    'L 448 194 L 446 184 L 446 174 L 448 164 L 450 154 L 452 144 ' +
    'L 454 134 L 456 126 Z',
  asia:
    'M 502 48 L 510 42 L 522 38 L 536 36 L 550 38 L 564 42 ' +
    'L 578 48 L 592 52 L 608 56 L 624 58 L 640 60 L 656 60 ' +
    'L 672 58 L 688 56 L 704 54 L 720 52 L 736 52 L 752 54 ' +
    'L 764 58 L 772 64 L 776 72 L 774 80 L 770 88 L 762 96 ' +
    'L 752 102 L 740 108 L 728 114 L 716 118 L 704 122 L 692 124 ' +
    'L 680 126 L 668 126 L 656 124 L 644 122 L 632 118 L 620 114 ' +
    'L 608 110 L 596 106 L 584 102 L 572 98 L 560 94 L 548 90 ' +
    'L 536 86 L 524 82 L 514 78 L 508 72 L 504 64 L 502 56 Z',
  australia:
    'M 714 262 L 722 256 L 732 254 L 742 256 L 750 260 L 756 266 ' +
    'L 760 274 L 762 282 L 760 290 L 756 298 L 750 304 L 744 308 ' +
    'L 736 310 L 728 310 L 720 308 L 714 304 L 708 298 L 704 290 ' +
    'L 702 282 L 702 274 L 706 266 Z',
  greenland:
    'M 210 42 L 216 38 L 224 36 L 232 38 L 238 42 L 240 48 ' +
    'L 238 54 L 234 58 L 228 60 L 222 60 L 216 58 L 212 54 ' +
    'L 210 48 Z',
};

/* ------------------------------------------------------------------ */
/* Projection                                                          */
/* ------------------------------------------------------------------ */

function lngLatToSvg(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 500,
  };
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface Region {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  citizenCount: number;
}

interface SignupSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  citizenNumber?: string;
  regions: Region[];
  newCountryCode: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function SignupSuccessPopup({
  isOpen,
  onClose,
  username,
  citizenNumber,
  regions,
  newCountryCode,
}: SignupSuccessPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg glass-card overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    >
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Welcome, Citizen!</h3>
                      <p className="text-xs text-gray-400">{username} has joined the network</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {citizenNumber && (
                  <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg mb-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, ...spring }}
                  >
                    <span className="text-xs text-gray-400 font-mono">Citizen ID</span>
                    <span className="text-sm font-mono font-bold text-white tracking-wider">{citizenNumber}</span>
                  </motion.div>
                )}
              </div>

              {/* Mini World Map */}
              <div className="px-6 pb-6">
                <div className="relative rounded-xl overflow-hidden bg-[#06060c] border border-white/[0.04]">
                  <svg
                    viewBox="0 0 1000 500"
                    className="w-full"
                    style={{ aspectRatio: '2 / 1' }}
                  >
                    <defs>
                      <radialGradient id="popup-bg-grad" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="#111827" />
                        <stop offset="100%" stopColor="#06060c" />
                      </radialGradient>
                      <filter id="popup-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <rect width="1000" height="500" fill="url(#popup-bg-grad)" />

                    {/* Grid lines */}
                    {Array.from({ length: 19 }).map((_, i) => (
                      <line key={`v${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={500} stroke="rgba(59,130,246,0.03)" strokeWidth={0.5} />
                    ))}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <line key={`h${i}`} x1={0} y1={(i + 1) * 50} x2={1000} y2={(i + 1) * 50} stroke="rgba(59,130,246,0.03)" strokeWidth={0.5} />
                    ))}

                    {/* Continents */}
                    {Object.values(CONTINENTS).map((path, i) => (
                      <path key={i} d={path} fill="#1a1a2e" stroke="#333" strokeWidth={0.8} strokeLinejoin="round" />
                    ))}

                    {/* Region dots */}
                    {regions.map((region, i) => {
                      const { x, y } = lngLatToSvg(region.latitude, region.longitude);
                      const isNew = region.countryCode === newCountryCode;
                      const r = isNew ? 7 : Math.min(4 + region.citizenCount * 0.3, 8);

                      return (
                        <g key={`${region.countryCode}-${i}`}>
                          {/* Glow */}
                          {isNew && (
                            <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.4} className="pulse-dot" />
                          )}
                          <circle cx={x} cy={y} r={r + 3} fill={isNew ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.12)'} filter="url(#popup-glow)" />
                          <circle cx={x} cy={y} r={r} fill={isNew ? '#22c55e' : '#3b82f6'} />
                          <circle cx={x} cy={y} r={r * 0.4} fill={isNew ? '#86efac' : '#93c5fd'} opacity={0.9} />
                          {isNew && (
                            <text x={x} y={y - r - 10} textAnchor="middle" fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="bold">
                              YOU ARE HERE
                            </text>
                          )}
                          <text x={x} y={y - r - 3} textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace" fontWeight="500" opacity={isNew ? 0 : 0.7}>
                            {region.countryCode}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-blue-400">{regions.length}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Countries</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-purple-400">
                      {regions.reduce((sum, r) => sum + r.citizenCount, 0)}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Citizens</div>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-500/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  onClick={onClose}
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
