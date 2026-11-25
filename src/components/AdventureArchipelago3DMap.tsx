import React, { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AdventureIslandId, EnglishAdventureState } from '../firebase/types';
import { ADVENTURE_ISLANDS, type AdventureIsland } from '../data/englishAdventureData';
import { isIslandUnlocked } from '../utils/englishAdventureManager';
import { LuxuryCompassDial3D, LuxuryCornerBrackets } from './CityMapLuxury3DKit';
import archipelagoChartImg from '../assets/images/archipelago_ocean_chart_1795529656162.jpg';

interface IslandMonumentSvgProps {
  motif: AdventureIsland['motif'];
  accentHex: string;
  secondaryHex?: string;
  unlocked: boolean;
  bossDefeated?: boolean;
  isSelected: boolean;
}

export const IslandMonumentSvg: React.FC<IslandMonumentSvgProps> = memo(
  ({
    motif,
    accentHex,
    secondaryHex = '#b4830c',
    unlocked,
    bossDefeated = false,
    isSelected
  }) => {
    const uid = useId().replace(/:/g, '');
    const strokeColor = bossDefeated ? '#fde68a' : unlocked ? accentHex : '#7c8ba1';
    const trimColor = unlocked ? accentHex : '#64748b';
    const fillLight = unlocked ? `${accentHex}44` : '#1e293b';
    const fillMid = unlocked ? '#182644' : '#111827';
    const fillDark = unlocked ? '#0b1324' : '#080d18';
    const stoneTop = unlocked ? '#223254' : '#151e30';

    return (
      <svg
        viewBox="0 0 84 84"
        className="w-12 h-12 sm:w-15 sm:h-15 drop-shadow-[0_10px_14px_rgba(0,0,0,0.82)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`mon-face-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentHex} stopOpacity={unlocked ? '0.62' : '0.18'} />
            <stop offset="100%" stopColor={secondaryHex} stopOpacity={unlocked ? '0.28' : '0.08'} />
          </linearGradient>
          <linearGradient id={`mon-plinth-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={stoneTop} />
            <stop offset="100%" stopColor={fillDark} />
          </linearGradient>
          <linearGradient id={`mon-beam-${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={accentHex} stopOpacity="0.45" />
            <stop offset="55%" stopColor="#f2ca50" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f2ca50" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`mon-aura-${uid}`} cx="50%" cy="62%" r="50%">
            <stop offset="0%" stopColor={bossDefeated ? '#f2ca50' : accentHex} stopOpacity="0.42" />
            <stop offset="100%" stopColor={accentHex} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle Conquered Vertical Beacon Pillar */}
        {bossDefeated && (
          <polygon
            points="27,54 34,4 50,4 57,54"
            fill={`url(#mon-beam-${uid})`}
          />
        )}

        {/* Ambient Sea Glow */}
        {unlocked && (
          <ellipse
            cx="42"
            cy="61"
            rx={bossDefeated ? '35' : isSelected ? '32' : '27'}
            ry={bossDefeated ? '13' : isSelected ? '11' : '9'}
            fill={`url(#mon-aura-${uid})`}
          />
        )}

        {/* Outer Maritime Halo / Conquered Sovereign Ring */}
        <ellipse
          cx="42"
          cy="62"
          rx={isSelected || bossDefeated ? '34' : '28'}
          ry={isSelected || bossDefeated ? '11.5' : '9.5'}
          fill="none"
          stroke={bossDefeated ? '#f2ca50' : strokeColor}
          strokeOpacity={bossDefeated ? 0.78 : unlocked ? (isSelected ? 0.6 : 0.28) : 0.16}
          strokeWidth={bossDefeated ? '1.35' : '1.1'}
          strokeDasharray={unlocked ? (bossDefeated ? 'none' : '5 3') : '3 4'}
        />

        {/* Deep Ambient Contact Shadow */}
        <ellipse cx="42" cy="63" rx="24" ry="8" fill="#02050d" fillOpacity="0.78" />

        {/* Faceted 3D Basalt Island Cliff Pedestal */}
        <polygon
          points="13,51 42,65 71,51 42,37"
          fill={`url(#mon-plinth-${uid})`}
          stroke={trimColor}
          strokeOpacity={unlocked ? 0.85 : 0.45}
          strokeWidth="1.35"
        />
        {/* Inner Terrace Contour Rim */}
        <polygon
          points="19,51 42,61 65,51 42,41"
          fill="none"
          stroke={strokeColor}
          strokeOpacity={unlocked ? 0.35 : 0.15}
          strokeWidth="0.9"
        />
        {/* Left & Right Extruded Cliff Strata */}
        <polygon
          points="13,51 42,65 42,74 18,59"
          fill={fillDark}
          stroke={trimColor}
          strokeOpacity="0.48"
          strokeWidth="1"
        />
        <polygon
          points="71,51 42,65 42,74 66,59"
          fill="#050912"
          stroke={trimColor}
          strokeOpacity="0.32"
          strokeWidth="1"
        />

        {/* Territory-Specific Architectural Monument */}
        {motif === 'citadel' && (
          <>
            {/* Flanking Royal Wing Towers */}
            <rect
              x="21"
              y="29"
              width="8"
              height="20"
              fill={fillDark}
              stroke={trimColor}
              strokeWidth="1.15"
            />
            <rect
              x="55"
              y="29"
              width="8"
              height="20"
              fill={fillDark}
              stroke={trimColor}
              strokeWidth="1.15"
            />
            {/* Central Chamfered Lexicon Keep */}
            <polygon
              points="28,48 42,55 42,23 28,17"
              fill={`url(#mon-face-${uid})`}
              stroke={strokeColor}
              strokeWidth="1.3"
            />
            <polygon
              points="42,55 56,48 56,17 42,23"
              fill={fillMid}
              stroke={strokeColor}
              strokeWidth="1.3"
            />
            {/* Gilded Pyramid Crown Roof */}
            <polygon
              points="26,18 42,8 58,18 42,24"
              fill={trimColor}
              fillOpacity={unlocked ? 0.55 : 0.22}
              stroke={strokeColor}
              strokeWidth="1.3"
            />
            {/* Lancet Windows & Spire Finial */}
            <line x1="34" y1="28" x2="34" y2="36" stroke="#fde68a" strokeOpacity={unlocked ? 0.85 : 0.25} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="50" y1="28" x2="50" y2="36" stroke="#fde68a" strokeOpacity={unlocked ? 0.7 : 0.2} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="42" y1="8" x2="42" y2="3" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="42" cy="3" r="1.6" fill={bossDefeated ? '#fde68a' : trimColor} />
          </>
        )}

        {motif === 'castle' && (
          <>
            {/* Flanking Cylindrical Watchtowers */}
            <rect x="19" y="21" width="9" height="27" rx="1.5" fill={fillMid} stroke={trimColor} strokeWidth="1.2" />
            <rect x="56" y="21" width="9" height="27" rx="1.5" fill={fillDark} stroke={trimColor} strokeWidth="1.2" />
            <polygon points="18,21 23.5,12 29,21" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.1" />
            <polygon points="55,21 60.5,12 66,21" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.1" />
            {/* Main Curtain Wall */}
            <rect x="27" y="24" width="30" height="24" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.35" />
            {/* Crenellations */}
            <path
              d="M27 24 V18 H32 V21 H38 V18 H46 V21 H52 V18 H57 V24"
              fill={fillMid}
              stroke={strokeColor}
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            {/* Arched Portcullis Gate */}
            <path
              d="M36 48 V36 A6 6 0 0 1 48 36 V48 Z"
              fill="#060b16"
              stroke={strokeColor}
              strokeWidth="1.25"
            />
            <circle cx="42" cy="36" r="2" fill={unlocked ? '#f2ca50' : '#475569'} />
            {/* Arrow Slits */}
            <line x1="23.5" y1="28" x2="23.5" y2="35" stroke="#bae6fd" strokeOpacity={unlocked ? 0.85 : 0.25} strokeWidth="1.3" strokeLinecap="round" />
            <line x1="60.5" y1="28" x2="60.5" y2="35" stroke="#bae6fd" strokeOpacity={unlocked ? 0.7 : 0.25} strokeWidth="1.3" strokeLinecap="round" />
          </>
        )}

        {motif === 'lighthouse' && (
          <>
            {/* Lighthouse Volumetric Twin Beams */}
            {unlocked && (
              <>
                <polygon points="10,9 36,15 36,19 10,24" fill={trimColor} fillOpacity={bossDefeated ? '0.32' : '0.2'} />
                <polygon points="74,9 48,15 48,19 74,24" fill={trimColor} fillOpacity={bossDefeated ? '0.32' : '0.2'} />
              </>
            )}
            {/* Stone Foundation Pier */}
            <rect x="30" y="43" width="24" height="7" rx="1.5" fill={fillDark} stroke={trimColor} strokeWidth="1.2" />
            {/* Tapered Tower Body */}
            <polygon points="34,44 37,19 47,19 50,44" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.35" />
            {/* Diagonal Maritime Band */}
            <polygon points="35.6,34 48.4,31 49,36 35,39" fill={trimColor} fillOpacity="0.45" />
            {/* Observation Gallery & Lantern Room */}
            <rect x="35" y="13" width="14" height="6" rx="1.2" fill={fillDark} stroke={strokeColor} strokeWidth="1.2" />
            <polygon points="34,13 42,6 50,13" fill={trimColor} fillOpacity="0.5" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="42" cy="16" r="3" fill={unlocked ? '#fef08a' : '#64748b'} />
            {/* Concentric Sonar Wave Arcs */}
            <path d="M22 39 A24 10 0 0 0 62 39" fill="none" stroke={trimColor} strokeOpacity={unlocked ? 0.45 : 0.15} strokeWidth="1" strokeDasharray="3 3" />
          </>
        )}

        {motif === 'amphitheater' && (
          <>
            {/* Stepped Marble Agora Base */}
            <ellipse cx="42" cy="43" rx="21" ry="9.5" fill={fillMid} stroke={trimColor} strokeWidth="1.2" />
            <ellipse cx="42" cy="39" rx="18" ry="8" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.35" />
            <ellipse cx="42" cy="36" rx="12" ry="5" fill={fillDark} stroke={strokeColor} strokeOpacity="0.7" strokeWidth="1" />
            {/* Colonnaded Semi-Circle Pillars */}
            <path
              d="M24 37 V26 M30 33 V21 M36 31 V18 M42 30 V17 M48 31 V18 M54 33 V21 M60 37 V26"
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Architrave Crown */}
            <path
              d="M23 26 Q42 12 61 26"
              fill="none"
              stroke={trimColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Warm Orator Dais Flame */}
            <circle cx="42" cy="35" r="2.8" fill={unlocked ? '#fdba74' : '#64748b'} />
          </>
        )}

        {motif === 'forest' && (
          <>
            {/* Twin Terraced Canopy Pines */}
            <polygon points="18,48 28,23 38,48" fill={fillDark} stroke={trimColor} strokeWidth="1.2" />
            <polygon points="46,48 56,23 66,48" fill={fillDark} stroke={trimColor} strokeWidth="1.2" />
            {/* Sacred Central Archive Cedar */}
            <polygon points="29,48 42,10 55,48" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.4" />
            <polygon points="33,34 42,16 51,34" fill={trimColor} fillOpacity="0.28" stroke={strokeColor} strokeWidth="1" />
            {/* Sanctuary Lantern Arch */}
            <path d="M38 48 V40 A4 4 0 0 1 46 40 V48 Z" fill="#06120e" stroke={strokeColor} strokeWidth="1.15" />
            <circle cx="42" cy="29" r="2.6" fill={unlocked ? '#a7f3d0' : '#64748b'} />
            <circle cx="42" cy="42" r="1.8" fill={unlocked ? '#fde68a' : '#475569'} />
          </>
        )}

        {motif === 'academy' && (
          <>
            {/* Oxford Scriptorium Portico */}
            <rect x="24" y="28" width="36" height="20" fill={`url(#mon-face-${uid})`} stroke={strokeColor} strokeWidth="1.35" />
            {/* Stepped Foundation */}
            <rect x="21" y="47" width="42" height="3.5" rx="1" fill={fillDark} stroke={trimColor} strokeWidth="1.1" />
            {/* Classical Pediment & Rose Window */}
            <polygon
              points="19,28 42,12 65,28"
              fill={trimColor}
              fillOpacity={unlocked ? 0.42 : 0.2}
              stroke={strokeColor}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="42" cy="22" r="2.6" fill={unlocked ? '#fbcfe8' : '#64748b'} stroke={strokeColor} strokeWidth="0.9" />
            {/* 4 Fluted Portico Columns */}
            <line x1="29" y1="28" x2="29" y2="47" stroke={strokeColor} strokeWidth="1.6" />
            <line x1="37" y1="28" x2="37" y2="47" stroke={strokeColor} strokeWidth="1.6" />
            <line x1="47" y1="28" x2="47" y2="47" stroke={strokeColor} strokeWidth="1.6" />
            <line x1="55" y1="28" x2="55" y2="47" stroke={strokeColor} strokeWidth="1.6" />
            {/* Quill Nib Crest */}
            <polygon points="42,5 44.5,11 42,12.5 39.5,11" fill="#fde68a" fillOpacity={unlocked ? 0.92 : 0.3} />
          </>
        )}

        {motif === 'observatory' && (
          <>
            {/* Observatory Base Drum */}
            <rect x="25" y="38" width="34" height="11" rx="2" fill={fillMid} stroke={trimColor} strokeWidth="1.2" />
            {/* Celestial Dome */}
            <path
              d="M26 39 A16 17 0 0 1 58 39 Z"
              fill={`url(#mon-face-${uid})`}
              stroke={strokeColor}
              strokeWidth="1.4"
            />
            {/* Brass Meridian Arch */}
            <path d="M42 22 A10 16 0 0 1 48 39" fill="none" stroke="#fde68a" strokeOpacity={unlocked ? 0.75 : 0.25} strokeWidth="1.1" />
            {/* Dual Tilted Astrolabe Planetary Rings */}
            <ellipse
              cx="42"
              cy="28"
              rx="25"
              ry="7.5"
              fill="none"
              stroke={strokeColor}
              strokeOpacity="0.75"
              strokeWidth="1.2"
              transform="rotate(-18 42 28)"
            />
            <ellipse
              cx="42"
              cy="28"
              rx="21"
              ry="6"
              fill="none"
              stroke="#fde68a"
              strokeOpacity={unlocked ? 0.5 : 0.15}
              strokeWidth="0.9"
              strokeDasharray="3 3"
              transform="rotate(14 42 28)"
            />
            {/* Zenith Star Core & Telescope */}
            <circle cx="42" cy="28" r="3.6" fill={unlocked ? '#fde68a' : '#64748b'} />
            <line x1="42" y1="28" x2="57" y2="12" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="57" cy="12" r="1.8" fill="#fde68a" fillOpacity={unlocked ? 0.95 : 0.3} />
          </>
        )}

        {/* Conquered Laurel / Crown Finial Accent on Pedestal */}
        {bossDefeated && (
          <g aria-hidden="true">
            <circle cx="15" cy="51" r="1.8" fill="#f2ca50" />
            <circle cx="69" cy="51" r="1.8" fill="#f2ca50" />
          </g>
        )}
      </svg>
    );
  }
);
IslandMonumentSvg.displayName = 'IslandMonumentSvg';

/**
 * Curated Bezier control points (in 1000x500 viewBox space) so every maritime route
 * sweeps harmoniously through open ocean without intersecting neighboring territories.
 */
const SEA_LANE_CURVE_CONTROLS: Array<{ cx: number; cy: number }> = [
  { cx: 265, cy: 312 }, // 1 Vocabulary Kingdom -> 2 Grammar Castle
  { cx: 565, cy: 394 }, // 2 Grammar Castle -> 3 Listening Ocean
  { cx: 838, cy: 325 }, // 3 Listening Ocean -> 4 Speaking City
  { cx: 705, cy: 176 }, // 4 Speaking City -> 5 Reading Forest
  { cx: 395, cy: 244 }, // 5 Reading Forest -> 6 Writing Academy
  { cx: 318, cy: 90 }   // 6 Writing Academy -> 7 Advanced English Universe
];

interface AdventureArchipelago3DMapProps {
  advState: EnglishAdventureState;
  selectedIsland: AdventureIsland;
  is3DPerspective: boolean;
  bossVictoryShakeKey?: number;
  onSelectIsland: (id: AdventureIslandId) => void;
}

export const AdventureArchipelago3DMap: React.FC<AdventureArchipelago3DMapProps> = memo(
  ({ advState, selectedIsland, is3DPerspective, bossVictoryShakeKey = 0, onSelectIsland }) => {
    const shouldReduceMotion = useReducedMotion();
    const stageRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const pendingCoordsRef = useRef<{ rx: number; ry: number; gx: number; gy: number } | null>(null);
    const [chartImgFailed, setChartImgFailed] = useState(false);

    const conqueredCount = advState.bossDefeatedIslandIds.length;

    // Apply pointer-driven 3D tilt & specular sheen via CSS custom properties + rAF (0 React re-renders)
    const flushTransforms = useCallback(() => {
      rafRef.current = null;
      const el = stageRef.current;
      const coords = pendingCoordsRef.current;
      if (!el || !coords) return;
      el.style.setProperty('--adv-rx', `${coords.rx.toFixed(2)}deg`);
      el.style.setProperty('--adv-ry', `${coords.ry.toFixed(2)}deg`);
      el.style.setProperty('--adv-gx', `${coords.gx.toFixed(1)}%`);
      el.style.setProperty('--adv-gy', `${coords.gy.toFixed(1)}%`);
    }, []);

    useEffect(() => {
      const el = stageRef.current;
      if (el) {
        const basePitch = is3DPerspective && !shouldReduceMotion ? 14 : 0;
        el.style.setProperty('--adv-rx', `${basePitch}deg`);
        el.style.setProperty('--adv-ry', `0deg`);
        el.style.setProperty('--adv-gx', `50%`);
        el.style.setProperty('--adv-gy', `35%`);
      }
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [is3DPerspective, shouldReduceMotion]);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!is3DPerspective || shouldReduceMotion || e.pointerType === 'touch') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
        pendingCoordsRef.current = {
          rx: 14 + (0.5 - ny) * 6.0,
          ry: (nx - 0.5) * 7.5,
          gx: nx * 100,
          gy: ny * 100
        };
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(flushTransforms);
        }
      },
      [is3DPerspective, shouldReduceMotion, flushTransforms]
    );

    const handlePointerLeave = useCallback(() => {
      pendingCoordsRef.current = {
        rx: is3DPerspective && !shouldReduceMotion ? 14 : 0,
        ry: 0,
        gx: 50,
        gy: 35
      };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushTransforms);
      }
    }, [is3DPerspective, shouldReduceMotion, flushTransforms]);

    const handleMapKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const idx = ADVENTURE_ISLANDS.findIndex((i) => i.id === selectedIsland.id);
        if (idx < 0) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = ADVENTURE_ISLANDS[(idx + 1) % ADVENTURE_ISLANDS.length];
          onSelectIsland(next.id);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = ADVENTURE_ISLANDS[(idx - 1 + ADVENTURE_ISLANDS.length) % ADVENTURE_ISLANDS.length];
          onSelectIsland(prev.id);
        }
      },
      [selectedIsland.id, onSelectIsland]
    );

    const effectiveTransform =
      is3DPerspective && !shouldReduceMotion
        ? 'rotateX(var(--adv-rx, 14deg)) rotateY(var(--adv-ry, 0deg)) scale(0.985)'
        : 'none';

    return (
      <motion.section
        key={`map-shake-${bossVictoryShakeKey}`}
        initial={
          bossVictoryShakeKey > 0 && !shouldReduceMotion
            ? { x: 0, y: 0, scale: 1 }
            : false
        }
        animate={
          bossVictoryShakeKey > 0 && !shouldReduceMotion
            ? {
                x: [0, -8, 7, -5, 4, -2, 0],
                y: [0, 5, -5, 4, -3, 1, 0],
                scale: [1, 1.012, 1]
              }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={{ duration: 0.6, ease: 'easeOut' }}
        aria-label="Carte 3D interactive de l'archipel English Adventure"
        onKeyDown={handleMapKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="ea-theme-root preserve-dark-surface relative rounded-2xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border)] overflow-hidden shadow-2xl p-3 sm:p-5 will-change-transform"
        style={{ perspective: is3DPerspective && !shouldReduceMotion ? '1420px' : 'none' }}
      >
        {/* Clean Unboxed Top Coordinate Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ea-text-cream-muted)] mb-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[var(--ea-text-gold-soft)]">
              Archipel des 7 Territoires
            </span>
            <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
              ·
            </span>
            <span className="tabular-nums text-[var(--ea-text-cream)]">
              {conqueredCount}/7 conquis
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-[var(--ea-text-gold-soft)]">
              ·
            </span>
            <span className="hidden sm:inline">Navigation flèches ← / → ou sélection directe</span>
          </div>
          <div className="text-[var(--ea-text-cream)] tabular-nums">
            Cap actif :{' '}
            <strong className="text-[var(--ea-text-gold)]">
              {selectedIsland.number}. {selectedIsland.name}
            </strong>
          </div>
        </div>

        {/* 3D Plinth Board */}
        <div
          ref={stageRef}
          className="relative w-full h-[430px] sm:h-[500px] rounded-2xl border border-[#2b3652]/90 overflow-hidden bg-[#070e1d] will-change-transform"
          style={{
            transform: effectiveTransform,
            transformStyle: is3DPerspective && !shouldReduceMotion ? 'preserve-3d' : 'flat',
            transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow:
              is3DPerspective && !shouldReduceMotion
                ? `0 28px 50px -16px rgba(0,0,0,0.92), 0 8px 0 #131c31, 0 9px 0 ${selectedIsland.accentHex}44`
                : '0 14px 30px -12px rgba(0,0,0,0.75)'
          }}
        >
          {/* Layer 0: Bathymetric Chart Asset + Graceful CSS Mesh Fallback */}
          {!chartImgFailed ? (
            <img
              src={archipelagoChartImg}
              alt="Carte bathymétrique marine de l'archipel English Adventure"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              onError={() => setChartImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover opacity-52 pointer-events-none select-none"
            />
          ) : (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 42%, #132544 0%, #0a1428 55%, #060b16 100%)'
              }}
              aria-hidden="true"
            />
          )}

          {/* Subtle Cartographic Meridian Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, ${selectedIsland.accentHex}24 1px, transparent 1px), linear-gradient(to bottom, ${selectedIsland.accentHex}24 1px, transparent 1px)`,
              backgroundSize: '56px 56px'
            }}
            aria-hidden="true"
          />

          {/* Measured Atmospheric Depth Scrim for Guaranteed Contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(10, 20, 42, 0.22) 0%, rgba(5, 9, 18, 0.78) 100%)'
            }}
            aria-hidden="true"
          />

          {/* Interactive Specular Champagne Sheen (pure CSS var driven, 0 re-renders) */}
          {is3DPerspective && !shouldReduceMotion && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: `radial-gradient(circle 440px at var(--adv-gx, 50%) var(--adv-gy, 35%), ${selectedIsland.accentHex}24 0%, rgba(255,245,205,0.05) 40%, transparent 72%)`
              }}
              aria-hidden="true"
            />
          )}

          <LuxuryCornerBrackets accentHex={selectedIsland.accentHex} />

          {/* Cartographic Compass Rose Watermark (Upper-Right Open Sea Quadrant) */}
          <div className="hidden sm:block absolute top-4 right-4 z-10 pointer-events-none opacity-90">
            <LuxuryCompassDial3D accentHex={selectedIsland.accentHex} variant="dark" />
          </div>

          {/* Layer 1: Maritime Trade Routes & Conquered Sovereign Currents */}
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="advSeaLaneGold" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.92" />
                <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.95" />
              </linearGradient>
              <filter id="advRouteGlow" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Cartographic Horizon Latitude Rings */}
            <ellipse
              cx="500"
              cy="255"
              rx="390"
              ry="190"
              fill="none"
              stroke={selectedIsland.accentHex}
              strokeOpacity="0.09"
              strokeWidth="1"
              strokeDasharray="4 10"
              vectorEffect="non-scaling-stroke"
            />
            <ellipse
              cx="500"
              cy="255"
              rx="235"
              ry="115"
              fill="none"
              stroke="#f2ca50"
              strokeOpacity="0.08"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {ADVENTURE_ISLANDS.slice(0, -1).map((isl, idx) => {
              const next = ADVENTURE_ISLANDS[idx + 1];
              const x1 = isl.coords.xPct * 10;
              const y1 = isl.coords.yPct * 5;
              const x2 = next.coords.xPct * 10;
              const y2 = next.coords.yPct * 5;
              const curve = SEA_LANE_CURVE_CONTROLS[idx] ?? {
                cx: (x1 + x2) / 2,
                cy: Math.min(y1, y2) - 42
              };
              const pathD = `M ${x1} ${y1} Q ${curve.cx} ${curve.cy} ${x2} ${y2}`;
              const nextUnlocked = isIslandUnlocked(advState, next.id);
              const islDefeated = advState.bossDefeatedIslandIds.includes(isl.id);
              const bothDefeated =
                islDefeated && advState.bossDefeatedIslandIds.includes(next.id);

              return (
                <g key={isl.id}>
                  {/* Sea-floor dark track underglow */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#030711"
                    strokeOpacity="0.78"
                    strokeWidth={nextUnlocked ? '6.5' : '3'}
                    strokeLinecap="round"
                  />
                  {/* Main maritime route */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      islDefeated
                        ? 'url(#advSeaLaneGold)'
                        : nextUnlocked
                        ? isl.accentHex
                        : '#475569'
                    }
                    strokeOpacity={islDefeated ? 0.94 : nextUnlocked ? 0.58 : 0.36}
                    strokeWidth={islDefeated ? '2.8' : nextUnlocked ? '2.1' : '1.35'}
                    strokeDasharray={islDefeated ? 'none' : '6 6'}
                    filter={islDefeated ? 'url(#advRouteGlow)' : undefined}
                    strokeLinecap="round"
                  />

                  {/* Animated Sovereign Current & Beacon Vessel on Conquered Sea-Lanes */}
                  {islDefeated && !shouldReduceMotion && (
                    <>
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke={bothDefeated ? '#fef08a' : '#a7f3d0'}
                        strokeOpacity="0.65"
                        strokeWidth="1.6"
                        strokeDasharray="4 14"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -36 }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                      <circle r="3.2" fill="#fef08a" opacity="0.92">
                        <animateMotion
                          dur={`${4.2 + idx * 0.35}s`}
                          repeatCount="indefinite"
                          path={pathD}
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Layer 2: 7 Sculpted Interactive Island Citadels */}
          {ADVENTURE_ISLANDS.map((isl) => {
            const unlocked = isIslandUnlocked(advState, isl.id);
            const bossDefeated = advState.bossDefeatedIslandIds.includes(isl.id);
            const isSelected = selectedIsland.id === isl.id;
            const completedOnIsland = isl.missions.filter((m) =>
              advState.completedMissionIds.includes(m.id)
            ).length;

            return (
              <motion.button
                key={isl.id}
                type="button"
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => onSelectIsland(isl.id)}
                aria-pressed={isSelected}
                aria-label={`Île ${isl.number} : ${isl.name}, ${completedOnIsland} sur ${isl.missions.length} missions validées, ${
                  bossDefeated ? 'conquise' : unlocked ? 'accessible' : 'verrouillée'
                }`}
                style={{
                  left: `${isl.coords.xPct}%`,
                  top: `${isl.coords.yPct}%`,
                  transform:
                    is3DPerspective && !shouldReduceMotion
                      ? `translate(-50%, -50%) translateZ(${
                          isSelected ? 36 : bossDefeated ? 24 : 16
                        }px)`
                      : 'translate(-50%, -50%)'
                }}
                className="absolute z-10 hover:z-30 focus-visible:z-30 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] rounded-2xl"
              >
                {/* Fluid Hover Magnification & Lift Wrapper (preserves outer centering transform) */}
                <motion.div
                  variants={
                    shouldReduceMotion
                      ? undefined
                      : {
                          rest: { scale: 1, y: 0 },
                          hover: { scale: 1.11, y: -5 },
                          tap: { scale: 0.97, y: -1 }
                        }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 22,
                    mass: 0.8
                  }}
                  className="relative flex flex-col items-center will-change-transform"
                >
                  {/* Framer Motion Golden Hover Glow Aura */}
                  <motion.span
                    variants={{
                      rest: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.82 },
                      hover: { opacity: 1, scale: shouldReduceMotion ? 1 : 1.16 },
                      tap: { opacity: 0.85, scale: shouldReduceMotion ? 1 : 1.05 }
                    }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -inset-4 rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(242,202,80,0.46) 0%, rgba(254,240,138,0.2) 44%, transparent 72%)'
                    }}
                    aria-hidden="true"
                  />

                  {/* Conquered Territory Sovereign Breathing Aura */}
                  {bossDefeated && (
                    <motion.span
                      className="absolute -inset-4 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, rgba(242,202,80,0.34) 0%, ${isl.accentHex}26 42%, transparent 72%)`
                      }}
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              opacity: [0.42, 0.85, 0.42],
                              scale: [0.95, 1.08, 0.95]
                            }
                      }
                      transition={{
                        duration: 3.6,
                        delay: isl.number * 0.35,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Conquered Territory Rotating Celestial Astrolabe Ring */}
                  {bossDefeated && (
                    <motion.span
                      className="absolute -inset-2.5 rounded-full pointer-events-none"
                      style={{
                        border: '1px dashed rgba(242, 202, 80, 0.65)'
                      }}
                      animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                      transition={{
                        duration: 24,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Active Territory Selection Compass Ring */}
                  {isSelected && (
                    <span
                      className="absolute -inset-3 rounded-full border pointer-events-none"
                      style={{
                        borderColor: `${isl.accentHex}99`,
                        background: `radial-gradient(circle, ${isl.accentHex}24 0%, transparent 74%)`
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Monument Pedestal Plaque */}
                  <div
                    className={`relative rounded-2xl p-1.5 sm:p-2 border transition-colors duration-150 backdrop-blur-md ${
                      bossDefeated
                        ? 'bg-gradient-to-b from-[#1a2846]/95 to-[#0b1326]/95 shadow-2xl'
                        : isSelected
                        ? 'bg-[#16213b]/95 shadow-2xl'
                        : unlocked
                        ? 'bg-[#0c1428]/90 group-hover:bg-[#16213b]/95'
                        : 'bg-[#080d19]/85 opacity-80 group-hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected
                        ? isl.accentHex
                        : bossDefeated
                        ? '#f2ca50'
                        : unlocked
                        ? `${isl.accentHex}70`
                        : '#334155',
                      boxShadow: isSelected
                        ? `0 0 26px ${isl.accentHex}50`
                        : bossDefeated
                        ? `0 0 20px rgba(242, 202, 80, 0.28), 0 8px 18px rgba(0, 0, 0, 0.6)`
                        : undefined
                    }}
                  >
                    {/* GPU-Composited Golden Rim & Glow on Hover */}
                    <motion.span
                      variants={{
                        rest: { opacity: 0 },
                        hover: { opacity: 1 },
                        tap: { opacity: 0.7 }
                      }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute -inset-px rounded-2xl border border-[#f2ca50] pointer-events-none"
                      style={{
                        boxShadow:
                          '0 0 26px rgba(242, 202, 80, 0.55), inset 0 0 12px rgba(254, 240, 138, 0.22)'
                      }}
                      aria-hidden="true"
                    />

                    {/* Conquered Champagne Gold Sheen Sweep (Clamped cleanly inside inner wrapper) */}
                    {bossDefeated && !shouldReduceMotion && (
                      <span
                        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                        aria-hidden="true"
                      >
                        <motion.span
                          className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-[#fde68a]/25 to-transparent -skew-x-12"
                          animate={{ x: ['-120%', '360%'] }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            repeatDelay: 4.2,
                            delay: isl.number * 0.45,
                            ease: 'easeInOut'
                          }}
                        />
                      </span>
                    )}

                    {/* Serene Levitation Wrapper for Conquered Monuments */}
                    <motion.div
                      animate={
                        bossDefeated && !shouldReduceMotion
                          ? { y: [0, -3.5, 0] }
                          : { y: 0 }
                      }
                      transition={{
                        duration: 4.0,
                        delay: isl.number * 0.4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="relative z-10 will-change-transform"
                    >
                      <IslandMonumentSvg
                        motif={isl.motif}
                        accentHex={isl.accentHex}
                        secondaryHex={isl.secondaryHex}
                        unlocked={unlocked}
                        bossDefeated={bossDefeated}
                        isSelected={isSelected}
                      />
                    </motion.div>

                    {/* Dual-coded Index & Sovereign State Marker */}
                    <span
                      className={`absolute -top-2 -right-2 z-20 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-0.5 shadow tabular-nums ${
                        bossDefeated
                          ? 'bg-gradient-to-br from-[#f2ca50] to-[#34d399] text-[#070e1d] border-[#fef3c7]'
                          : unlocked
                          ? 'bg-[var(--ea-bg-surface)] text-[var(--ea-text-gold)] border-[var(--ea-border-gold)]'
                          : 'bg-[var(--ea-bg-elevated)] text-[var(--ea-text-cream)] border-[var(--ea-border-subtle)]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[11px]">
                        {bossDefeated ? 'verified' : unlocked ? 'explore' : 'lock'}
                      </span>
                      <span>{isl.number}</span>
                    </span>
                  </div>

                  {/* Crisp Caption Plate (Responsive mobile width, Single-line, tabular numbers) */}
                  <div
                    className={`mt-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg border text-[10px] sm:text-[11px] font-semibold whitespace-nowrap shadow-md flex items-center gap-1.5 tabular-nums max-w-[142px] sm:max-w-none transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] border-[var(--ea-text-gold-bright)]'
                        : bossDefeated
                        ? 'bg-[#101c34]/95 text-[#fef08a] border-[#f2ca50]/70 group-hover:border-[#fef08a]'
                        : unlocked
                        ? 'bg-[var(--ea-bg-surface)]/95 text-[var(--ea-text-cream)] border-[var(--ea-border-subtle)] group-hover:border-[#f2ca50]/80 group-hover:text-[#fef08a]'
                        : 'bg-[var(--ea-bg-deep)]/95 text-[var(--ea-text-cream-muted)] border-[var(--ea-border-subtle)] group-hover:border-[#f2ca50]/65'
                    }`}
                  >
                    {bossDefeated && !isSelected && (
                      <span
                        className="material-symbols-outlined text-[11px] text-emerald-300 shrink-0"
                        aria-hidden="true"
                      >
                        workspace_premium
                      </span>
                    )}
                    <span className="truncate">{isl.name}</span>
                    <span className="font-mono text-[9.5px] sm:text-[10px] opacity-90 shrink-0">
                      {completedOnIsland}/{isl.missions.length}
                    </span>
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Accessible 7-Territory Selector Rail (Single-line controls, clear mastery bars & golden hover glow) */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {ADVENTURE_ISLANDS.map((isl) => {
            const unlocked = isIslandUnlocked(advState, isl.id);
            const defeated = advState.bossDefeatedIslandIds.includes(isl.id);
            const active = selectedIsland.id === isl.id;
            const completedCount = isl.missions.filter((m) =>
              advState.completedMissionIds.includes(m.id)
            ).length;
            const progressPct = Math.round((completedCount / isl.missions.length) * 100);

            return (
              <motion.button
                key={isl.id}
                type="button"
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap="tap"
                variants={
                  shouldReduceMotion
                    ? undefined
                    : {
                        rest: { scale: 1, y: 0 },
                        hover: { scale: 1.035, y: -3 },
                        tap: { scale: 0.98, y: 0 }
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 340,
                  damping: 24,
                  mass: 0.75
                }}
                onClick={() => onSelectIsland(isl.id)}
                className={`relative overflow-hidden px-3 py-2.5 rounded-xl border text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] will-change-transform ${
                  active
                    ? 'bg-[var(--ea-bg-elevated)] border-[var(--ea-text-gold)] shadow-lg'
                    : defeated
                    ? 'bg-gradient-to-br from-[#16233e] via-[var(--ea-bg-surface)] to-[#0e1b29] border-[#f2ca50]/55 hover:border-[#f2ca50]'
                    : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)] hover:border-[#f2ca50]/80'
                }`}
              >
                {/* Framer Motion Golden Hover Glow Overlay */}
                <motion.span
                  variants={{
                    rest: { opacity: 0 },
                    hover: { opacity: 1 },
                    tap: { opacity: 0.7 }
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 0%, rgba(242, 202, 80, 0.24) 0%, rgba(242, 202, 80, 0.06) 55%, transparent 80%)',
                    boxShadow:
                      'inset 0 0 14px rgba(242, 202, 80, 0.22), 0 0 18px rgba(242, 202, 80, 0.26)'
                  }}
                  aria-hidden="true"
                />

                {/* Conquered Card Champagne Sheen */}
                {defeated && !shouldReduceMotion && (
                  <motion.span
                    className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-[#f2ca50]/12 to-transparent -skew-x-12 pointer-events-none"
                    animate={{ x: ['-120%', '360%'] }}
                    transition={{
                      duration: 2.0,
                      repeat: Infinity,
                      repeatDelay: 4.8,
                      delay: isl.number * 0.5,
                      ease: 'easeInOut'
                    }}
                    aria-hidden="true"
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-1.5 text-[11px] font-mono font-bold tabular-nums">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center border shrink-0"
                      style={{
                        backgroundColor: defeated
                          ? 'rgba(242, 202, 80, 0.18)'
                          : `${isl.accentHex}1c`,
                        borderColor: defeated
                          ? 'rgba(242, 202, 80, 0.65)'
                          : `${isl.accentHex}55`,
                        color: defeated ? '#f2ca50' : unlocked ? isl.accentHex : '#94a3b8'
                      }}
                    >
                      <span className="material-symbols-outlined text-[13px]">{isl.icon}</span>
                    </span>
                    <span
                      style={{
                        color: defeated
                          ? '#f2ca50'
                          : unlocked
                          ? isl.accentHex
                          : 'var(--ea-text-gold-soft)'
                      }}
                    >
                      Île {isl.number}
                    </span>
                  </span>

                  <span
                    className={`flex items-center gap-1 shrink-0 ${
                      defeated ? 'text-emerald-300' : 'text-[var(--ea-text-cream-muted)]'
                    }`}
                  >
                    <span>
                      {completedCount}/{isl.missions.length}
                    </span>
                    <span className="material-symbols-outlined text-xs">
                      {defeated ? 'verified' : unlocked ? 'lock_open' : 'lock'}
                    </span>
                  </span>
                </div>

                <div className="relative z-10 text-xs font-semibold text-[var(--ea-text-cream)] truncate mt-1.5">
                  {isl.name}
                </div>

                {/* Micro Mastery Progress Bar */}
                <div className="relative z-10 mt-2 h-1 rounded-full bg-[#090f1d] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPct}%`,
                      background: defeated
                        ? 'linear-gradient(90deg, #f2ca50, #34d399)'
                        : isl.accentHex
                    }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>
    );
  }
);
AdventureArchipelago3DMap.displayName = 'AdventureArchipelago3DMap';
