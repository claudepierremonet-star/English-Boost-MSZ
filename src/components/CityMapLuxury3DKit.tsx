import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Équerres architecturales de précision (cadran horloger / maquette de luxe)
 */
export const LuxuryCornerBrackets: React.FC<{ accentHex?: string }> = ({
  accentHex = '#f2ca50'
}) => (
  <div className="pointer-events-none absolute inset-2.5 z-20" aria-hidden="true">
    <span
      className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l opacity-65"
      style={{ borderColor: accentHex }}
    />
    <span
      className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r opacity-65"
      style={{ borderColor: accentHex }}
    />
    <span
      className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l opacity-65"
      style={{ borderColor: accentHex }}
    />
    <span
      className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r opacity-65"
      style={{ borderColor: accentHex }}
    />
  </div>
);

/**
 * Panorama architectural 3D isométrique pour la bannière maîtresse de la Cité
 */
export const LuxurySkyline3DSvg: React.FC<{ accentHex?: string }> = ({
  accentHex = '#f2ca50'
}) => (
  <svg
    viewBox="0 0 1200 160"
    className="w-full h-24 sm:h-32 opacity-45 pointer-events-none select-none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="lux-sky-glow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={accentHex} stopOpacity="0.06" />
        <stop offset="50%" stopColor={accentHex} stopOpacity="0.38" />
        <stop offset="100%" stopColor={accentHex} stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id="lux-face-left" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#26314c" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#0d1424" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="lux-face-right" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#141b2e" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#070c17" stopOpacity="0.95" />
      </linearGradient>
    </defs>

    {/* Horizon horizon hairline */}
    <line x1="0" y1="148" x2="1200" y2="148" stroke="url(#lux-sky-glow)" strokeWidth="1.2" />

    {/* Extruded 3D Architectural Towers & Cupolas */}
    {/* Left Wing Observatory */}
    <polygon points="90,148 90,88 122,74 122,148" fill="url(#lux-face-left)" />
    <polygon points="122,148 122,74 156,90 156,148" fill="url(#lux-face-right)" />
    <polyline points="90,88 122,74 156,90" fill="none" stroke={accentHex} strokeOpacity="0.45" strokeWidth="1" />

    {/* Westminster-Inspired Clock Spire */}
    <polygon points="274,148 274,48 294,38 294,148" fill="url(#lux-face-left)" />
    <polygon points="294,148 294,38 314,48 314,148" fill="url(#lux-face-right)" />
    <polygon points="276,48 294,12 312,48 294,38" fill={accentHex} fillOpacity="0.22" stroke={accentHex} strokeOpacity="0.55" strokeWidth="0.9" />
    <circle cx="284" cy="64" r="4.5" fill="none" stroke={accentHex} strokeOpacity="0.75" strokeWidth="1" />

    {/* Central Oxford Grand Dome */}
    <polygon points="535,148 535,76 595,58 595,148" fill="url(#lux-face-left)" />
    <polygon points="595,148 595,58 655,76 655,148" fill="url(#lux-face-right)" />
    <path d="M555 68 Q595 18 635 68" fill={accentHex} fillOpacity="0.14" stroke={accentHex} strokeOpacity="0.55" strokeWidth="1.1" />
    <line x1="595" y1="42" x2="595" y2="18" stroke={accentHex} strokeOpacity="0.75" strokeWidth="1.2" />

    {/* Modern Glass & Brass Citadel */}
    <polygon points="840,148 840,56 876,42 876,148" fill="url(#lux-face-left)" />
    <polygon points="876,148 876,42 912,58 912,148" fill="url(#lux-face-right)" />
    <polyline points="840,56 876,42 912,58" fill="none" stroke={accentHex} strokeOpacity="0.5" strokeWidth="1" />

    {/* Right Pavilion */}
    <polygon points="1030,148 1030,92 1068,78 1068,148" fill="url(#lux-face-left)" />
    <polygon points="1068,148 1068,78 1106,92 1106,148" fill="url(#lux-face-right)" />
    <polyline points="1030,92 1068,78 1106,92" fill="none" stroke={accentHex} strokeOpacity="0.4" strokeWidth="1" />
  </svg>
);

/**
 * Rose des vents horlogère 3D avec cadran gradué et aiguille dorée
 */
export const LuxuryCompassDial3D: React.FC<{
  accentHex?: string;
  tiltX?: number;
  tiltY?: number;
}> = ({ accentHex = '#f2ca50', tiltX = 0, tiltY = 0 }) => (
  <div
    className="relative w-12 h-12 sm:w-14 sm:h-14 pointer-events-none select-none shrink-0"
    style={{
      transform: `perspective(400px) rotateX(${tiltX * 1.4}deg) rotateY(${tiltY * 1.4}deg)`,
      transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
    }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
      <defs>
        <radialGradient id="compass-bezel-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#26314c" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#090e1a" stopOpacity="0.98" />
        </radialGradient>
      </defs>
      <circle cx="36" cy="36" r="32" fill="url(#compass-bezel-grad)" stroke={accentHex} strokeOpacity="0.45" strokeWidth="1.2" />
      <circle cx="36" cy="36" r="27" fill="none" stroke={accentHex} strokeOpacity="0.3" strokeWidth="0.8" strokeDasharray="2 3" />
      <circle cx="36" cy="36" r="20" fill="none" stroke={accentHex} strokeOpacity="0.2" strokeWidth="0.6" />
      {/* Cardinal Diamond Needles */}
      <polygon points="36,9 40,32 36,28 32,32" fill={accentHex} fillOpacity="0.95" />
      <polygon points="36,63 40,40 36,44 32,40" fill="#94a3b8" fillOpacity="0.4" />
      <polygon points="63,36 40,40 44,36 40,32" fill={accentHex} fillOpacity="0.55" />
      <polygon points="9,36 32,40 28,36 32,32" fill={accentHex} fillOpacity="0.55" />
      <circle cx="36" cy="36" r="3.5" fill="#0c1322" stroke={accentHex} strokeWidth="1.4" />
      <text x="36" y="7.5" textAnchor="middle" fontSize="6.5" fill={accentHex} fontFamily="monospace" fontWeight="800">
        N
      </text>
    </svg>
  </div>
);

/**
 * Calque SVG architectural 3D isométrique :
 * - Bâtiments extrudés avec éclairage 3 points (face claire, face d'ombre, toiture or)
 * - Terrasses botaniques et cours royales surélevées
 * - Canal de la Tamise encaissé avec reflets dorés et ponts en arc
 * - Viaduc du boulevard 3D avec ombre portée profonde et tracé doré lumineux
 */
interface LuxuryArchitecturalTerrainSvgProps {
  canvasHeight: number;
  accentHex: string;
  fullPathD: string;
  activePathD: string;
  shouldReduceMotion?: boolean;
  uid?: string;
}

export const LuxuryArchitecturalTerrainSvg: React.FC<LuxuryArchitecturalTerrainSvgProps> = ({
  canvasHeight,
  accentHex,
  fullPathD,
  activePathD,
  shouldReduceMotion = false,
  uid = 'city'
}) => {
  const riverPath = `M -30 ${canvasHeight * 0.31} C 240 ${canvasHeight * 0.2}, 430 ${
    canvasHeight * 0.51
  }, 690 ${canvasHeight * 0.37} S 940 ${canvasHeight * 0.25}, 1030 ${canvasHeight * 0.42}`;

  const buildings = [
    { x: 64, y: canvasHeight * 0.14, w: 38, d: 22, h: 34, spire: true },
    { x: 892, y: canvasHeight * 0.16, w: 44, d: 24, h: 42, spire: false },
    { x: 76, y: canvasHeight * 0.62, w: 42, d: 22, h: 36, spire: false },
    { x: 888, y: canvasHeight * 0.72, w: 40, d: 24, h: 46, spire: true },
    { x: 468, y: canvasHeight * 0.46, w: 48, d: 26, h: 30, spire: false }
  ];

  const gardens = [
    { x: 118, y: canvasHeight * 0.19, w: 86, h: 46 },
    { x: 794, y: canvasHeight * 0.54, w: 94, h: 52 }
  ];

  return (
    <svg
      viewBox={`0 0 1000 ${canvasHeight}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        {/* Warm 24K Gold Glow Filter for active routes */}
        <filter id={`gold-bloom-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gold Boulevard Gradient */}
        <linearGradient id={`gold-route-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor={accentHex} />
          <stop offset="100%" stopColor="#fff3b8" />
        </linearGradient>

        {/* Deep Sapphire Canal Water Gradient */}
        <linearGradient id={`river-water-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d233d" />
          <stop offset="50%" stopColor="#163b63" />
          <stop offset="100%" stopColor="#0d233d" />
        </linearGradient>

        {/* 3D Isometric Building Face Gradients */}
        <linearGradient id={`bldg-top-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#354363" />
          <stop offset="100%" stopColor="#232e48" />
        </linearGradient>
        <linearGradient id={`bldg-left-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27324d" />
          <stop offset="100%" stopColor="#151d30" />
        </linearGradient>
        <linearGradient id={`bldg-right-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161e31" />
          <stop offset="100%" stopColor="#0a0f1c" />
        </linearGradient>
      </defs>

      {/* Subtle Architectural Elevation Contour Rings */}
      <ellipse
        cx="500"
        cy={canvasHeight * 0.5}
        rx="410"
        ry={canvasHeight * 0.38}
        fill="none"
        stroke={accentHex}
        strokeOpacity="0.06"
        strokeWidth="1"
        strokeDasharray="6 10"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx="500"
        cy={canvasHeight * 0.5}
        rx="260"
        ry={canvasHeight * 0.24}
        fill="none"
        stroke={accentHex}
        strokeOpacity="0.08"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {/* Terraced 3D Botanical Parks */}
      {gardens.map((g, i) => (
        <g key={`garden-${i}`} opacity="0.85">
          {/* Terrace Drop Shadow */}
          <rect
            x={g.x + 5}
            y={g.y + 8}
            width={g.w}
            height={g.h}
            rx="12"
            fill="#03060d"
            fillOpacity="0.55"
          />
          {/* Stone Plinth Base */}
          <rect
            x={g.x}
            y={g.y + 3}
            width={g.w}
            height={g.h}
            rx="12"
            fill="#162925"
            stroke="#34d399"
            strokeOpacity="0.2"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Sculpted Top Lawn */}
          <rect
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h - 4}
            rx="12"
            fill="#10332b"
            stroke={accentHex}
            strokeOpacity="0.22"
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
          />
          {/* Cypress Tree Clusters with 3D shadows */}
          <ellipse cx={g.x + 22} cy={g.y + 24} rx="8" ry="5" fill="#06120f" fillOpacity="0.65" />
          <circle cx={g.x + 20} cy={g.y + 19} r="7" fill="#184d3f" stroke="#34d399" strokeOpacity="0.35" strokeWidth="0.8" />
          <ellipse cx={g.x + g.w - 22} cy={g.y + 27} rx="9" ry="5" fill="#06120f" fillOpacity="0.65" />
          <circle cx={g.x + g.w - 24} cy={g.y + 21} r="8" fill="#1b5848" stroke="#34d399" strokeOpacity="0.35" strokeWidth="0.8" />
        </g>
      ))}

      {/* Recessed 3D Thames Waterway */}
      <path
        d={riverPath}
        fill="none"
        stroke="#040812"
        strokeOpacity="0.85"
        strokeWidth="34"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={riverPath}
        fill="none"
        stroke={`url(#river-water-${uid})`}
        strokeOpacity="0.85"
        strokeWidth="26"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Illuminated Water Current Hairline */}
      <path
        d={riverPath}
        fill="none"
        stroke="#7dd3fc"
        strokeOpacity="0.22"
        strokeWidth="1.4"
        strokeDasharray="10 14"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* 3D Isometric Extruded Landmarks (Oxford / Westminster Architecture) */}
      {buildings.map((b, i) => {
        const hw = b.w / 2;
        const hd = b.d / 2;
        const topY = b.y - b.h;
        return (
          <g key={`bldg-${i}`}>
            {/* Ground Ambient Occlusion Shadow */}
            <polygon
              points={`${b.x + 8},${b.y + hd + 6} ${b.x + hw + 14},${b.y + 6} ${b.x + 8},${b.y - hd + 6} ${b.x - hw + 4},${b.y + 6}`}
              fill="#02050c"
              fillOpacity="0.6"
            />
            {/* Left Lit Architectural Facade */}
            <polygon
              points={`${b.x - hw},${b.y} ${b.x},${b.y + hd} ${b.x},${topY + hd} ${b.x - hw},${topY}`}
              fill={`url(#bldg-left-${uid})`}
              stroke={accentHex}
              strokeOpacity="0.22"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
            />
            {/* Right Shaded Architectural Facade */}
            <polygon
              points={`${b.x},${b.y + hd} ${b.x + hw},${b.y} ${b.x + hw},${topY} ${b.x},${topY + hd}`}
              fill={`url(#bldg-right-${uid})`}
              stroke="#0f172a"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
            />
            {/* Roof Slab */}
            <polygon
              points={`${b.x},${topY - hd} ${b.x + hw},${topY} ${b.x},${topY + hd} ${b.x - hw},${topY}`}
              fill={`url(#bldg-top-${uid})`}
              stroke={accentHex}
              strokeOpacity="0.45"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
            {/* Subtle Golden Roof Spire */}
            {b.spire && (
              <>
                <polygon
                  points={`${b.x - 7},${topY} ${b.x},${topY + 4} ${b.x},${topY - 18}`}
                  fill={accentHex}
                  fillOpacity="0.36"
                />
                <polygon
                  points={`${b.x},${topY + 4} ${b.x + 7},${topY} ${b.x},${topY - 18}`}
                  fill={accentHex}
                  fillOpacity="0.18"
                />
              </>
            )}
            {/* Warm Amber Illuminated Window Slits */}
            <line
              x1={b.x - hw * 0.55}
              y1={topY + b.h * 0.35}
              x2={b.x - hw * 0.25}
              y2={topY + b.h * 0.35 + hd * 0.3}
              stroke={accentHex}
              strokeOpacity="0.55"
              strokeWidth="1.5"
            />
            <line
              x1={b.x - hw * 0.55}
              y1={topY + b.h * 0.6}
              x2={b.x - hw * 0.25}
              y2={topY + b.h * 0.6 + hd * 0.3}
              stroke={accentHex}
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
          </g>
        );
      })}

      {/* 3D Elevated Marble Viaduct Boulevard */}
      {fullPathD && (
        <>
          {/* Deep Ground Viaduct Shadow */}
          <g transform="translate(0, 9)">
            <path
              d={fullPathD}
              fill="none"
              stroke="#03060d"
              strokeOpacity="0.78"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          {/* Sculpted Limestone Curb */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#1f2940"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Satin Slate Viaduct Deck */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#2c3754"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Recessed Brass Axis Inlay */}
          <path
            d={fullPathD}
            fill="none"
            stroke={accentHex}
            strokeOpacity="0.28"
            strokeWidth="1.6"
            strokeDasharray="6 9"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}

      {/* Illuminated 24K Gold Active Promenade */}
      {activePathD && (
        <>
          <motion.path
            d={activePathD}
            fill="none"
            stroke={accentHex}
            strokeOpacity="0.32"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#gold-bloom-${uid})`}
            vectorEffect="non-scaling-stroke"
            initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0.2 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
          <motion.path
            d={activePathD}
            fill="none"
            stroke={`url(#gold-route-${uid})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0.2 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          />
        </>
      )}
    </svg>
  );
};

/**
 * Plateau Diorama 3D interactif avec parallaxe douce au pointeur,
 * reflet champagne doré dynamique et bascule Vue 3D / Plan Zénithal.
 */
interface City3DMaquetteViewportProps {
  is3DView: boolean;
  isMobile: boolean;
  canvasHeight: number;
  accentHex?: string;
  children: React.ReactNode;
}

export const City3DMaquetteViewport: React.FC<City3DMaquetteViewportProps> = ({
  is3DView,
  isMobile,
  canvasHeight,
  accentHex = '#f2ca50',
  children
}) => {
  const shouldReduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; glareX: number; glareY: number }>({
    rx: 0,
    ry: 0,
    glareX: 50,
    glareY: 30
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!is3DView || isMobile || shouldReduceMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
    setTilt({
      rx: (0.5 - ny) * 5.2,
      ry: (nx - 0.5) * 6.4,
      glareX: Math.round(nx * 100),
      glareY: Math.round(ny * 100)
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 30 });
  };

  const basePitchDeg = !is3DView || shouldReduceMotion ? 0 : isMobile ? 8 : 15;
  const effectiveRx = basePitchDeg + (is3DView ? tilt.rx : 0);
  const effectiveRy = is3DView ? tilt.ry : 0;

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full overflow-hidden bg-[#060a14] px-2 py-4 sm:px-5 sm:py-6"
      style={{
        perspective: is3DView ? '1450px' : 'none',
        backgroundImage: `radial-gradient(ellipse at 50% 18%, ${accentHex}14 0%, rgba(12,19,34,0.9) 48%, #050811 100%)`
      }}
    >
      {/* Subtle 3D Maquette Plinth Board */}
      <div
        className="relative w-full rounded-2xl border border-[#2b3652]/80 bg-[#0b1222]"
        style={{
          height: `${canvasHeight}px`,
          transformStyle: is3DView ? 'preserve-3d' : 'flat',
          transform: is3DView
            ? `rotateX(${effectiveRx.toFixed(2)}deg) rotateY(${effectiveRy.toFixed(2)}deg)`
            : 'none',
          transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease',
          boxShadow: is3DView
            ? `0 26px 48px -14px rgba(0, 0, 0, 0.88), 0 8px 0 #161f34, 0 9px 0 ${accentHex}44, inset 0 1px 0 rgba(255,255,255,0.08)`
            : `0 10px 28px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)`
        }}
      >
        {/* Architectural Precision Grid */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
          style={{
            backgroundImage: `linear-gradient(to right, ${accentHex}1f 1px, transparent 1px), linear-gradient(to bottom, ${accentHex}1f 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
          aria-hidden="true"
        />

        {/* Dynamic Champagne Gold Specular Sheen */}
        {is3DView && !shouldReduceMotion && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-0 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 420px at ${tilt.glareX}% ${tilt.glareY}%, ${accentHex}18 0%, rgba(255,245,205,0.05) 35%, transparent 72%)`
            }}
            aria-hidden="true"
          />
        )}

        {/* Architectural Corner Framing Brackets */}
        <LuxuryCornerBrackets accentHex={accentHex} />

        {/* Map SVG & 3D Monument Nodes */}
        {children}
      </div>
    </div>
  );
};
