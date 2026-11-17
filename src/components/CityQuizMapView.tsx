import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { CityMapProgressionState } from '../firebase/types';
import {
  CITY_DISTRICTS,
  CITY_LEVELS,
  MAX_CITY_LEVEL,
  TOTAL_CITY_CHAPTERS,
  getDistrictForLevel,
  getDistrictSectors,
  getSectorForLevel,
  type CityDistrict,
  type CityLevelNode,
  type CityLevelSector
} from '../data/cityMapData';
import type { SchoolGrade } from '../data/curriculum';
import { CityLevelChaptersModal } from './CityLevelChaptersModal';
import type { CityChapterCompletionResult } from '../utils/cityMapManager';

interface CityQuizMapViewProps {
  progression: CityMapProgressionState;
  playerLevel?: number;
  onXpEarned?: (xp: number) => void;
  onProgressionUpdated: (nextState: CityMapProgressionState) => void;
}

interface MapPoint {
  xPct: number; // 0..100
  yPx: number;
}

/**
 * Fine architectural skyline silhouette for the top atlas masthead
 */
const AtlasSkylineSvg: React.FC<{ accentHex: string }> = ({ accentHex }) => (
  <svg
    viewBox="0 0 800 88"
    className="w-full h-16 sm:h-20 opacity-30 pointer-events-none select-none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="atlas-sky-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={accentHex} stopOpacity="0.1" />
        <stop offset="50%" stopColor={accentHex} stopOpacity="0.6" />
        <stop offset="100%" stopColor={accentHex} stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path
      d="M0 86 L34 86 L34 52 L60 52 L60 86 L78 86 L78 38 L94 22 L110 38 L110 86 L142 86 L142 54 L182 54 L182 86 L206 86 L206 28 L216 12 L226 28 L226 86 L264 86 L264 44 L310 44 L310 86 L340 86 L340 32 Q370 10 400 32 L400 86 L432 86 L432 48 L478 48 L478 86 L504 86 L504 20 L516 6 L528 20 L528 86 L572 86 L572 52 L620 52 L620 86 L648 86 L648 34 L674 18 L700 34 L700 86 L738 86 L738 56 L776 56 L776 86 L800 86 Z"
      fill="none"
      stroke="url(#atlas-sky-grad)"
      strokeWidth="1.5"
    />
    <line x1="0" y1="86" x2="800" y2="86" stroke={accentHex} strokeOpacity="0.45" strokeWidth="1.5" />
    <circle cx="216" cy="40" r="2.2" fill={accentHex} fillOpacity="0.7" />
    <circle cx="370" cy="40" r="2.6" fill={accentHex} fillOpacity="0.7" />
    <circle cx="516" cy="36" r="2.2" fill={accentHex} fillOpacity="0.7" />
    <circle cx="674" cy="42" r="2.2" fill={accentHex} fillOpacity="0.7" />
  </svg>
);

/**
 * Architectural Compass Rose for the cartographic corner
 */
const CompassRoseSvg: React.FC<{ accentHex: string }> = ({ accentHex }) => (
  <svg
    viewBox="0 0 64 64"
    className="w-12 h-12 sm:w-14 sm:h-14 opacity-45 pointer-events-none select-none"
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="26" fill="none" stroke={accentHex} strokeWidth="0.9" strokeOpacity="0.45" strokeDasharray="2 3" />
    <circle cx="32" cy="32" r="19" fill="none" stroke={accentHex} strokeWidth="0.7" strokeOpacity="0.35" />
    <polygon points="32,4 36,28 32,24 28,28" fill={accentHex} fillOpacity="0.85" />
    <polygon points="32,60 36,36 32,40 28,36" fill={accentHex} fillOpacity="0.35" />
    <polygon points="60,32 36,36 40,32 36,28" fill={accentHex} fillOpacity="0.45" />
    <polygon points="4,32 28,36 24,32 28,28" fill={accentHex} fillOpacity="0.45" />
    <circle cx="32" cy="32" r="3" fill="#0c1322" stroke={accentHex} strokeWidth="1.2" />
    <text x="32" y="12" textAnchor="middle" fontSize="6" fill={accentHex} fontFamily="monospace" fontWeight="700">
      N
    </text>
  </svg>
);

/**
 * Compute deterministic, airy winding coordinates for a sector's levels (15-16 max nodes = zero crowding)
 */
function computeSectorCoordinates(count: number, isMobile: boolean): {
  points: MapPoint[];
  canvasHeight: number;
} {
  const cols = isMobile ? 2 : 3;
  const topPad = isMobile ? 112 : 120;
  const bottomPad = isMobile ? 110 : 116;
  const rowHeight = isMobile ? 162 : 176;

  const points: MapPoint[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isReversed = row % 2 === 1;

    let xPct: number;
    let yWave: number;
    if (isMobile) {
      const baseCols = isReversed ? [73, 27] : [27, 73];
      xPct = baseCols[col];
      yWave = col === 0 ? -8 : 8;
    } else {
      const baseCols = isReversed ? [81, 50, 19] : [19, 50, 81];
      xPct = baseCols[col];
      yWave = col === 1 ? -13 : 9;
    }

    const yPx = topPad + row * rowHeight + yWave;
    points.push({ xPct, yPx });
  }

  const totalRows = Math.max(1, Math.ceil(count / cols));
  const canvasHeight = topPad + (totalRows - 1) * rowHeight + bottomPad;

  return { points, canvasHeight };
}

/**
 * Build smooth cubic-Bezier SVG path connecting consecutive coordinates in 1000px SVG X-space
 */
function buildBoulevardPath(points: MapPoint[], isMobile: boolean): string {
  if (points.length === 0) return '';
  const toX = (pct: number) => pct * 10;
  let d = `M ${toX(points[0].xPct)} ${points[0].yPx}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const x1 = toX(p1.xPct);
    const y1 = p1.yPx;
    const x2 = toX(p2.xPct);
    const y2 = p2.yPx;

    const isRowTurn = Math.abs(x1 - x2) < 40;
    if (isRowTurn) {
      const bulge = isMobile ? 122 : 108;
      const cx = x1 >= 500 ? Math.min(968, x1 + bulge) : Math.max(32, x1 - bulge);
      d += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    } else {
      const midX = (x1 + x2) / 2;
      d += ` C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }
  }
  return d;
}

export const CityQuizMapView: React.FC<CityQuizMapViewProps> = ({
  progression,
  playerLevel = 1,
  onXpEarned,
  onProgressionUpdated
}) => {
  const unlockedLevel = Math.max(1, Math.min(MAX_CITY_LEVEL, progression.unlockedLevel || 1));
  const activeDistrictMeta = useMemo(() => getDistrictForLevel(unlockedLevel), [unlockedLevel]);
  const activeSectorMeta = useMemo(() => getSectorForLevel(unlockedLevel), [unlockedLevel]);

  // Filter / Retractable Class View: default focuses ONLY the user's current active class & sector to keep canvas super clean
  const [selectedDistrict, setSelectedDistrict] = useState<'all_retractable' | SchoolGrade>(
    () => activeDistrictMeta.id
  );
  // Expanded districts in accordion/retractable mode (only active district expanded initially)
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>(() => ({
    [activeDistrictMeta.id]: true
  }));
  // Active 15-16 level sector range selected per district ("Indice de quel niveau à quel niveau")
  const [selectedSectorByDistrict, setSelectedSectorByDistrict] = useState<Record<string, string>>(
    () => ({
      [activeDistrictMeta.id]: activeSectorMeta.id
    })
  );
  // Optional Global 1–600 Index Drawer for instant level-range jumping
  const [showGlobalRangeIndex, setShowGlobalRangeIndex] = useState<boolean>(false);

  const [activeLevelModal, setActiveLevelModal] = useState<number | null>(null);
  const [lockedPromptLevel, setLockedPromptLevel] = useState<number | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  // Progression transition & auto-scroll choreography state
  const [justUnlockedLevel, setJustUnlockedLevel] = useState<number | null>(null);
  const [recentlyProgressedLevel, setRecentlyProgressedLevel] = useState<number | null>(null);
  const [unlockToast, setUnlockToast] = useState<{
    level: number;
    title: string;
    classLabel: string;
  } | null>(null);

  const levelNodeRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const prevUnlockedRef = useRef<number>(unlockedLevel);
  const pendingScrollTargetRef = useRef<{ level: number; isUnlock: boolean } | null>(null);
  const hasDoneInitialScrollRef = useRef<boolean>(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const conqueredSet = useMemo(
    () => new Set(progression.conqueredLevels || []),
    [progression.conqueredLevels]
  );

  const totalChaptersDone = useMemo(() => {
    return Object.values(progression.completedChaptersByLevel || {}).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
  }, [progression.completedChaptersByLevel]);

  const visibleDistricts = useMemo(() => {
    if (selectedDistrict === 'all_retractable') return CITY_DISTRICTS;
    return CITY_DISTRICTS.filter((d) => d.id === selectedDistrict);
  }, [selectedDistrict]);

  // Helper to get currently selected sector inside any district
  const getActiveSectorForDistrict = useCallback(
    (district: CityDistrict): CityLevelSector => {
      const sectors = getDistrictSectors(district);
      const chosenId = selectedSectorByDistrict[district.id];
      if (chosenId) {
        const match = sectors.find((s) => s.id === chosenId);
        if (match) return match;
      }
      // If this district holds the unlocked frontier level, default to its active sector
      if (unlockedLevel >= district.startLevel && unlockedLevel <= district.endLevel) {
        return getSectorForLevel(unlockedLevel);
      }
      return sectors[0];
    },
    [selectedSectorByDistrict, unlockedLevel]
  );

  // Switch cleanly to any district + sector range
  const selectDistrictAndSector = useCallback(
    (districtId: SchoolGrade, sectorId: string, focusSingleDistrict: boolean = true) => {
      if (focusSingleDistrict) {
        setSelectedDistrict(districtId);
      }
      setExpandedDistricts((prev) => ({ ...prev, [districtId]: true }));
      setSelectedSectorByDistrict((prev) => ({ ...prev, [districtId]: sectorId }));
      setShowGlobalRangeIndex(false);
    },
    []
  );

  // Toggle retract/expand for any class district
  const toggleDistrictExpanded = useCallback((districtId: SchoolGrade) => {
    setExpandedDistricts((prev) => ({ ...prev, [districtId]: !prev[districtId] }));
  }, []);

  // Retract all classes except active one (or all when in retractable overview)
  const handleRetractAllDistricts = useCallback(() => {
    setSelectedDistrict('all_retractable');
    setExpandedDistricts({});
  }, []);

  // Smooth scroll helper that guarantees target sector & class are expanded
  const scrollToLevelNode = useCallback(
    (targetLevel: number, options?: { isUnlock?: boolean; delayMs?: number }) => {
      const targetDistrict = getDistrictForLevel(targetLevel);
      const targetSector = getSectorForLevel(targetLevel);

      setSelectedDistrict(targetDistrict.id);
      setExpandedDistricts((prev) => ({ ...prev, [targetDistrict.id]: true }));
      setSelectedSectorByDistrict((prev) => ({
        ...prev,
        [targetDistrict.id]: targetSector.id
      }));

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

      scrollTimerRef.current = setTimeout(() => {
        const el = levelNodeRefs.current[targetLevel];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }

        if (options?.isUnlock) {
          setJustUnlockedLevel(targetLevel);
          const meta = CITY_LEVELS[targetLevel - 1];
          setUnlockToast({
            level: targetLevel,
            title: meta?.landmarkTitle || `Niveau ${targetLevel}`,
            classLabel: meta?.classLabel || targetDistrict.classLabel
          });
          highlightTimerRef.current = setTimeout(() => {
            setJustUnlockedLevel(null);
            setUnlockToast(null);
          }, 4200);
        } else {
          setRecentlyProgressedLevel(targetLevel);
          highlightTimerRef.current = setTimeout(() => {
            setRecentlyProgressedLevel(null);
          }, 2200);
        }
      }, options?.delayMs ?? 240);
    },
    []
  );

  // Auto-scroll smoothly on initial entry if player is already past level 1
  useEffect(() => {
    if (hasDoneInitialScrollRef.current) return;
    hasDoneInitialScrollRef.current = true;

    if (unlockedLevel > 1) {
      const t = setTimeout(() => {
        const el = levelNodeRefs.current[unlockedLevel];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
      }, 320);
      return () => clearTimeout(t);
    }
  }, [unlockedLevel]);

  // Detect newly unlocked level
  useEffect(() => {
    if (unlockedLevel > prevUnlockedRef.current) {
      prevUnlockedRef.current = unlockedLevel;
      if (activeLevelModal !== null) {
        pendingScrollTargetRef.current = { level: unlockedLevel, isUnlock: true };
      } else {
        scrollToLevelNode(unlockedLevel, { isUnlock: true, delayMs: 220 });
      }
    } else if (unlockedLevel < prevUnlockedRef.current) {
      prevUnlockedRef.current = unlockedLevel;
    }
  }, [unlockedLevel, activeLevelModal, scrollToLevelNode]);

  // Trigger deferred transition & auto-scroll right when the chapters modal closes
  useEffect(() => {
    if (activeLevelModal === null && pendingScrollTargetRef.current) {
      const pending = pendingScrollTargetRef.current;
      pendingScrollTargetRef.current = null;
      scrollToLevelNode(pending.level, { isUnlock: pending.isUnlock, delayMs: 240 });
    }
  }, [activeLevelModal, scrollToLevelNode]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const handleOpenLevel = (lvl: CityLevelNode) => {
    if (lvl.levelNumber > unlockedLevel) {
      setLockedPromptLevel(lvl.levelNumber);
      return;
    }
    setLockedPromptLevel(null);
    setActiveLevelModal(lvl.levelNumber);
  };

  const handleChapterComplete = (
    res: CityChapterCompletionResult,
    lvlNum: number,
    _chNum: number,
    _scorePercent: number
  ) => {
    onProgressionUpdated(res.state);
    if (onXpEarned && res.xpAwarded > 0) {
      onXpEarned(res.xpAwarded);
    }

    if (res.unlockedNextLevel) {
      pendingScrollTargetRef.current = { level: res.unlockedNextLevel, isUnlock: true };
    } else {
      pendingScrollTargetRef.current = { level: lvlNum, isUnlock: false };
    }
  };

  return (
    <LayoutGroup>
      <div className="flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24 gap-5 select-none">
        {/* ATLAS ARCHITECTURAL HERO BANNER (600 NIVEAUX) */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#191f2f] via-[#151b2b] to-[#0c1322] border border-[#f2ca50]/40 shadow-2xl overflow-hidden p-5 sm:p-7">
          <div className="absolute inset-x-0 bottom-0 pointer-events-none">
            <AtlasSkylineSvg accentHex="#f2ca50" />
          </div>

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex flex-col gap-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono text-[#d4c78f] tabular-nums">
                  <span className="text-[#f2ca50] font-semibold">Atlas Urbain</span>
                  <span aria-hidden="true">·</span>
                  <span>{MAX_CITY_LEVEL} Niveaux</span>
                  <span aria-hidden="true">·</span>
                  <span>6 000 Chapitres</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#dce2f8] leading-tight text-balance">
                  La Cité d&apos;English Boost MSZ
                </h1>
                <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed">
                  Parcours progressif de la <strong className="text-[#dce2f8]">6e</strong> à la{' '}
                  <strong className="text-[#dce2f8]">Terminale (C1/C2)</strong>. Sélectionnez une classe ou une tranche de niveaux ci-dessous pour afficher uniquement votre secteur sans encombrer la carte.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowGlobalRangeIndex((prev) => !prev)}
                  className={`px-3.5 py-3 rounded-xl border font-semibold text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showGlobalRangeIndex
                      ? 'bg-[#232a3a] border-[#f2ca50] text-[#f2ca50]'
                      : 'bg-[#0c1322]/90 hover:bg-[#232a3a] text-[#dce2f8] border-[#232a3a]'
                  }`}
                  title="Ouvrir l'index complet des plages de niveaux (1 à 600)"
                >
                  <span className="material-symbols-outlined text-base text-[#f2ca50]">toc</span>
                  <span>Index 1–{MAX_CITY_LEVEL}</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToLevelNode(unlockedLevel, { delayMs: 60 })}
                  className="px-3.5 py-3 rounded-xl bg-[#0c1322]/90 hover:bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/35 font-semibold text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={`Centrer la carte sur le Niveau ${unlockedLevel}`}
                >
                  <span className="material-symbols-outlined text-base">my_location</span>
                  <span>Niv. {unlockedLevel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLevelModal(unlockedLevel)}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    explore
                  </span>
                  <span>Jouer Niveau {unlockedLevel}</span>
                </button>
              </div>
            </div>

            {/* Clean Architectural Telemetry Strip */}
            <div className="pt-4 border-t border-[#232a3a] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="flex items-baseline justify-between sm:justify-start sm:gap-3">
                <span className="text-xs text-[#d0c5af]">Niveaux conquis</span>
                <div className="font-mono tabular-nums flex items-baseline gap-1">
                  <motion.span
                    key={conqueredSet.size}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="text-xl font-bold text-[#f2ca50]"
                  >
                    {conqueredSet.size}
                  </motion.span>
                  <span className="text-xs text-[#99907c]">/ {MAX_CITY_LEVEL}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between sm:justify-start sm:gap-3">
                <span className="text-xs text-[#d0c5af]">Chapitres validés</span>
                <div className="font-mono tabular-nums flex items-baseline gap-1">
                  <motion.span
                    key={totalChaptersDone}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="text-xl font-bold text-emerald-400"
                  >
                    {totalChaptersDone}
                  </motion.span>
                  <span className="text-xs text-[#99907c]">/ {TOTAL_CITY_CHAPTERS.toLocaleString('fr-FR')}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between sm:justify-end sm:gap-3">
                <span className="text-xs text-[#d0c5af]">Étoiles urbaines</span>
                <div className="font-mono tabular-nums flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#ffe088]">{progression.totalStars || 0}</span>
                  <span className="text-xs text-[#f2ca50]">★</span>
                </div>
              </div>
            </div>

            {/* Overall Route Progress */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[#d0c5af]">
                <span>
                  Quartier actif :{' '}
                  <strong className="text-[#f2ca50]">
                    {activeDistrictMeta.classLabel} · {activeSectorMeta.title}
                  </strong>
                </span>
                <span className="font-mono tabular-nums font-semibold text-[#f2ca50]">
                  Étape {unlockedLevel} / {MAX_CITY_LEVEL}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#070e1d] border border-[#232a3a] overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.5, (conqueredSet.size / MAX_CITY_LEVEL) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe088] relative overflow-hidden"
                >
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '220%' }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 1.6 }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* SOPHISTICATED GLOBAL INDEX DRAWER (DE QUEL NIVEAU À QUEL NIVEAU : 1..600) */}
        <AnimatePresence>
          {showGlobalRangeIndex && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 rounded-3xl bg-[#151b2b] border border-[#f2ca50]/45 shadow-2xl space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-[#232a3a] pb-3">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#f2ca50]">
                      Index des Niveaux par Classe &amp; Tranche (1 – {MAX_CITY_LEVEL})
                    </h3>
                    <p className="text-xs text-[#d0c5af]">
                      Appuyez sur une plage de niveaux pour afficher directement son boulevard sans encombrer la carte.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGlobalRangeIndex(false)}
                    className="w-8 h-8 rounded-lg bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center shrink-0 cursor-pointer"
                    aria-label="Fermer l'index"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {CITY_DISTRICTS.map((dist) => {
                    const sectors = getDistrictSectors(dist);
                    const isActiveDist = selectedDistrict === dist.id;
                    return (
                      <div
                        key={dist.id}
                        className="p-3 rounded-2xl bg-[#0c1322] border border-[#232a3a] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: dist.accentHex }}
                            />
                            <strong className="text-[#dce2f8] font-serif text-sm">
                              {dist.classLabel}
                            </strong>
                            <span className="text-[#99907c]">·</span>
                            <span className="text-[#d0c5af]">{dist.name}</span>
                          </div>
                          <span className="font-mono tabular-nums text-[11px] text-[#d4c78f]">
                            {dist.badgeText}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                          {sectors.map((sec) => {
                            const isUnlockedSec = unlockedLevel >= sec.startLevel;
                            const isCurrentSec =
                              unlockedLevel >= sec.startLevel && unlockedLevel <= sec.endLevel;
                            const isViewingSec =
                              isActiveDist && getActiveSectorForDistrict(dist).id === sec.id;

                            return (
                              <button
                                key={sec.id}
                                type="button"
                                onClick={() => selectDistrictAndSector(dist.id, sec.id, true)}
                                className={`px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-0.5 ${
                                  isViewingSec
                                    ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00]'
                                    : isCurrentSec
                                    ? 'bg-[#191f2f] border-[#f2ca50]/70 text-[#f2ca50] hover:bg-[#232a3a]'
                                    : isUnlockedSec
                                    ? 'bg-[#151b2b] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/45'
                                    : 'bg-[#151b2b]/50 border-[#232a3a]/70 text-[#99907c] hover:text-[#d0c5af]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-mono font-bold uppercase">
                                    Sec. {sec.romanLabel}
                                  </span>
                                  {!isUnlockedSec && (
                                    <span className="material-symbols-outlined text-[12px] opacity-75">
                                      lock
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-mono tabular-nums font-bold">
                                  {sec.startLevel} – {sec.endLevel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* UNLOCK CELEBRATION NOTIFICATION */}
        <AnimatePresence>
          {unlockToast && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="p-4 rounded-2xl bg-[#191f2f] border border-[#f2ca50] shadow-[0_0_30px_rgba(242,202,80,0.25)] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock_open_right
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-[#f2ca50] font-semibold">
                    Nouvelle étape débloquée · {unlockToast.classLabel}
                  </span>
                  <span className="font-serif text-sm sm:text-base font-bold text-[#dce2f8] truncate">
                    Niveau {unlockToast.level} — {unlockToast.title}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUnlockToast(null);
                  setActiveLevelModal(unlockToast.level);
                }}
                className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Ouvrir
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLASS DISTRICT SELECTOR & RETRACTABLE SYNTHESIS CONTROL */}
        <nav
          aria-label="Sélection de classe et rétraction des quartiers"
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#151b2b] border border-[#232a3a] overflow-x-auto no-scrollbar"
        >
          <button
            type="button"
            onClick={handleRetractAllDistricts}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedDistrict === 'all_retractable'
                ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                : 'text-[#d0c5af] hover:text-[#dce2f8] hover:bg-[#191f2f]'
            }`}
            title="Rétracter toutes les classes pour une vue épurée et choisir librement"
          >
            <span className="material-symbols-outlined text-sm">unfold_less</span>
            <span>Classes rétractées</span>
          </button>

          {CITY_DISTRICTS.map((dist) => {
            const isSelected = selectedDistrict === dist.id;
            const totalInDistrict = dist.endLevel - dist.startLevel + 1;
            let conqueredInDist = 0;
            for (let n = dist.startLevel; n <= dist.endLevel; n++) {
              if (conqueredSet.has(n)) conqueredInDist++;
            }
            const isDistrictUnlocked = unlockedLevel >= dist.startLevel;

            return (
              <button
                key={dist.id}
                type="button"
                onClick={() => {
                  setSelectedDistrict(dist.id);
                  setExpandedDistricts((prev) => ({ ...prev, [dist.id]: true }));
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'text-[#dce2f8] hover:bg-[#191f2f]'
                }`}
              >
                {!isDistrictUnlocked && (
                  <span className="material-symbols-outlined text-xs opacity-70">lock</span>
                )}
                <span>{dist.classLabel}</span>
                <span
                  className={`font-mono tabular-nums text-[10px] ${
                    isSelected ? 'text-[#3c2f00]/85' : 'text-[#99907c]'
                  }`}
                >
                  {dist.startLevel}–{dist.endLevel}
                </span>
                {conqueredInDist > 0 && (
                  <span
                    className={`font-mono tabular-nums text-[10px] font-bold ${
                      isSelected ? 'text-[#3c2f00]' : 'text-emerald-400'
                    }`}
                  >
                    ({conqueredInDist}/{totalInDistrict})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* LOCKED LEVEL EXPLANATION NOTICE */}
        <AnimatePresence>
          {lockedPromptLevel !== null && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 sm:p-5 rounded-2xl bg-[#191f2f] border border-[#f2ca50]/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-serif text-base font-bold text-[#dce2f8]">
                    Monument du Niveau {lockedPromptLevel} verrouillé
                  </h4>
                  <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed">
                    Validez les <strong>10 chapitres du Niveau {unlockedLevel}</strong> puis progressez jusqu&apos;au Niveau {lockedPromptLevel - 1} pour tracer la route jusqu&apos;à ce monument.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setLockedPromptLevel(null)}
                  className="px-3.5 py-2 rounded-xl bg-[#232a3a] text-[#d0c5af] text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLockedPromptLevel(null);
                    scrollToLevelNode(unlockedLevel, { delayMs: 80 });
                    setActiveLevelModal(unlockedLevel);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs whitespace-nowrap cursor-pointer shadow-md"
                >
                  Aller au Niveau {unlockedLevel}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RETRACTABLE CLASS DISTRICTS WITH SUB-RANGE INDEX & AIRY MAP CANVAS */}
        <div className="flex flex-col gap-5">
          {visibleDistricts.map((district: CityDistrict) => {
            const districtLevels = CITY_LEVELS.filter((l) => l.districtId === district.id);
            const conqueredInDist = districtLevels.filter((l) => conqueredSet.has(l.levelNumber)).length;
            const isDistStarted = unlockedLevel >= district.startLevel;
            const isExpanded = Boolean(expandedDistricts[district.id]);

            const districtSectors = getDistrictSectors(district);
            const activeSector = getActiveSectorForDistrict(district);
            const sectorLevels = districtLevels.filter(
              (l) => l.levelNumber >= activeSector.startLevel && l.levelNumber <= activeSector.endLevel
            );

            const { points, canvasHeight } = computeSectorCoordinates(
              sectorLevels.length,
              isMobile
            );
            const fullPathD = buildBoulevardPath(points, isMobile);

            let unlockedCountInSector = 0;
            for (const l of sectorLevels) {
              if (l.levelNumber <= unlockedLevel) unlockedCountInSector++;
            }
            const activePoints = points.slice(0, Math.max(0, unlockedCountInSector));
            const activePathD = activePoints.length >= 2 ? buildBoulevardPath(activePoints, isMobile) : '';

            const focusedLevelInSector =
              (hoveredLevel !== null &&
                sectorLevels.find((l) => l.levelNumber === hoveredLevel)) ||
              sectorLevels.find((l) => l.levelNumber === unlockedLevel) ||
              sectorLevels[0];
            const focusedChapters = focusedLevelInSector
              ? progression.completedChaptersByLevel[String(focusedLevelInSector.levelNumber)] || []
              : [];

            return (
              <motion.section
                key={district.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="rounded-3xl bg-[#151b2b] border border-[#232a3a] shadow-2xl overflow-hidden"
              >
                {/* Retractable District Accordion Header */}
                <header
                  onClick={() => toggleDistrictExpanded(district.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDistrictExpanded(district.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                  className="relative bg-gradient-to-r from-[#191f2f] via-[#151b2b] to-[#0c1322] border-b border-[#232a3a] px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#191f2f]/80 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl bg-[#0c1322] border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: isDistStarted ? district.accentHex : '#232a3a',
                        color: isDistStarted ? district.accentHex : '#99907c'
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {district.monumentIcon}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs font-mono tabular-nums text-[#d0c5af]">
                        <span style={{ color: district.accentHex }} className="font-bold">
                          Classe de {district.classLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{district.cefrLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#f2ca50] font-semibold">{district.badgeText}</span>
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] mt-0.5 truncate">
                        {district.name}
                      </h2>
                      <p className="text-xs text-[#d0c5af]/85 mt-0.5 max-w-xl line-clamp-2">
                        {district.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex flex-col sm:items-end text-xs font-mono tabular-nums">
                      <span className="font-bold text-[#f2ca50]">
                        {conqueredInDist} / {districtLevels.length} Monuments
                      </span>
                      <span className="text-[11px] text-[#d0c5af]/75 font-sans mt-0.5">
                        {isExpanded ? activeSector.title : 'Secteur rétracté · Appuyez pour déplier'}
                      </span>
                    </div>

                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                        isExpanded
                          ? 'bg-[#f2ca50]/15 border-[#f2ca50]/50 text-[#f2ca50]'
                          : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af]'
                      }`}
                      title={isExpanded ? 'Rétracter cette classe' : 'Déplier cette classe'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </span>
                  </div>
                </header>

                {/* RETRACTABLE SECTOR RANGE SELECTOR + WINDING CARTOGRAPHIC CANVAS */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      {/* Level-Range Sector Selector Bar ("De quel niveau à quel niveau") */}
                      <div className="px-4 py-3 sm:px-6 bg-[#101727] border-b border-[#232a3a] flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#d4c78f]">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                              signpost
                            </span>
                            <span>Choisir une tranche de niveaux ({district.classLabel}) :</span>
                          </span>
                          <span className="text-[#99907c] hidden sm:inline">
                            {sectorLevels.length} monuments affichés
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                          {districtSectors.map((sector) => {
                            const isSelectedSector = activeSector.id === sector.id;
                            const isSectorUnlocked = unlockedLevel >= sector.startLevel;
                            const isFrontierSector =
                              unlockedLevel >= sector.startLevel && unlockedLevel <= sector.endLevel;
                            let conqueredInSector = 0;
                            for (let n = sector.startLevel; n <= sector.endLevel; n++) {
                              if (conqueredSet.has(n)) conqueredInSector++;
                            }
                            const sectorTotal = sector.endLevel - sector.startLevel + 1;

                            return (
                              <button
                                key={sector.id}
                                type="button"
                                onClick={() =>
                                  setSelectedSectorByDistrict((prev) => ({
                                    ...prev,
                                    [district.id]: sector.id
                                  }))
                                }
                                className={`px-3 py-2 rounded-xl border text-xs font-mono tabular-nums whitespace-nowrap shrink-0 transition-colors flex items-center gap-2 cursor-pointer ${
                                  isSelectedSector
                                    ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                                    : isFrontierSector
                                    ? 'bg-[#191f2f] border-[#f2ca50]/60 text-[#f2ca50] hover:bg-[#232a3a]'
                                    : isSectorUnlocked
                                    ? 'bg-[#0c1322] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/40'
                                    : 'bg-[#0c1322]/60 border-[#232a3a]/70 text-[#99907c] hover:text-[#d0c5af]'
                                }`}
                              >
                                {!isSectorUnlocked && (
                                  <span className="material-symbols-outlined text-[13px] opacity-80">
                                    lock
                                  </span>
                                )}
                                <span>
                                  Niv. {sector.startLevel}–{sector.endLevel}
                                </span>
                                <span
                                  className={`text-[10px] ${
                                    isSelectedSector
                                      ? 'text-[#3c2f00]/80'
                                      : conqueredInSector === sectorTotal
                                      ? 'text-emerald-400'
                                      : 'text-[#99907c]'
                                  }`}
                                >
                                  {conqueredInSector}/{sectorTotal}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* INTERACTIVE CARTOGRAPHIC MAP CANVAS (ONLY ACTIVE SECTOR'S 15-16 NODES) */}
                      <div
                        className="relative w-full overflow-hidden bg-[#0c1322]"
                        style={{ height: `${canvasHeight}px` }}
                      >
                        {/* Architectural Blueprint Coordinate Grid */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-25"
                          style={{
                            backgroundImage:
                              'linear-gradient(to right, rgba(212,199,143,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,199,143,0.12) 1px, transparent 1px)',
                            backgroundSize: '48px 48px'
                          }}
                          aria-hidden="true"
                        />

                        {/* River, City Parks & Boulevard SVG Layer */}
                        <svg
                          viewBox={`0 0 1000 ${canvasHeight}`}
                          preserveAspectRatio="none"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          aria-hidden="true"
                        >
                          <rect
                            x="58"
                            y={canvasHeight * 0.16}
                            width="115"
                            height="64"
                            rx="14"
                            fill="#102824"
                            fillOpacity="0.45"
                            stroke="#34d399"
                            strokeOpacity="0.16"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <rect
                            x="810"
                            y={canvasHeight * 0.56}
                            width="126"
                            height="70"
                            rx="16"
                            fill="#102824"
                            fillOpacity="0.4"
                            stroke="#34d399"
                            strokeOpacity="0.15"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <rect
                            x="415"
                            y={canvasHeight * 0.42}
                            width="170"
                            height="52"
                            rx="8"
                            fill="#151b2b"
                            fillOpacity="0.42"
                            stroke="#d4c78f"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />

                          <path
                            d={`M -30 ${canvasHeight * 0.28} C 260 ${canvasHeight * 0.19}, 420 ${
                              canvasHeight * 0.48
                            }, 680 ${canvasHeight * 0.35} S 940 ${canvasHeight * 0.26}, 1030 ${
                              canvasHeight * 0.42
                            }`}
                            fill="none"
                            stroke="#183254"
                            strokeOpacity="0.65"
                            strokeWidth="26"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          <path
                            d={`M -30 ${canvasHeight * 0.28} C 260 ${canvasHeight * 0.19}, 420 ${
                              canvasHeight * 0.48
                            }, 680 ${canvasHeight * 0.35} S 940 ${canvasHeight * 0.26}, 1030 ${
                              canvasHeight * 0.42
                            }`}
                            fill="none"
                            stroke="#38bdf8"
                            strokeOpacity="0.22"
                            strokeWidth="1.5"
                            strokeDasharray="8 10"
                            vectorEffect="non-scaling-stroke"
                          />

                          {fullPathD && (
                            <>
                              <path
                                d={fullPathD}
                                fill="none"
                                stroke="#1a2236"
                                strokeWidth="22"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                              />
                              <path
                                d={fullPathD}
                                fill="none"
                                stroke="#2e374d"
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                              />
                              <path
                                d={fullPathD}
                                fill="none"
                                stroke="#99907c"
                                strokeOpacity="0.32"
                                strokeWidth="2"
                                strokeDasharray="6 8"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                              />
                            </>
                          )}

                          {activePathD && (
                            <motion.path
                              d={activePathD}
                              fill="none"
                              stroke={district.accentHex}
                              strokeOpacity="0.88"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                              initial={{ pathLength: 0.7 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.75, ease: 'easeOut' }}
                            />
                          )}
                        </svg>

                        {/* Compass Rose & Geographic Coordinate Margin Label */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-5 flex flex-col items-end gap-0.5 pointer-events-none">
                          <CompassRoseSvg accentHex={district.accentHex} />
                          <span className="text-[9px] font-mono tabular-nums text-[#99907c]/75">
                            {district.classLabel.toUpperCase()} · {activeSector.startLevel}–{activeSector.endLevel}
                          </span>
                        </div>

                        {/* Positioned Landmark Medallions */}
                        {sectorLevels.map((lvl, idx) => {
                          const pt = points[idx];
                          if (!pt) return null;

                          const completedChs =
                            progression.completedChaptersByLevel[String(lvl.levelNumber)] || [];
                          const isConquered =
                            conqueredSet.has(lvl.levelNumber) || completedChs.length >= 10;
                          const isUnlocked = lvl.levelNumber <= unlockedLevel;
                          const isCurrentFrontier = lvl.levelNumber === unlockedLevel && !isConquered;
                          const isJustUnlockedNode = justUnlockedLevel === lvl.levelNumber;
                          const isRecentlyProgressed = recentlyProgressedLevel === lvl.levelNumber;

                          const chapterRatio = isConquered
                            ? 1
                            : Math.min(1, Math.max(0, completedChs.length / 10));

                          const ringRadius = 25;
                          const ringCircumference = 2 * Math.PI * ringRadius;
                          const ringOffset = ringCircumference * (1 - chapterRatio);
                          const isThreeDigits = lvl.levelNumber >= 100;

                          return (
                            <div
                              key={lvl.levelNumber}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                              style={{ left: `${pt.xPct}%`, top: `${pt.yPx}px` }}
                            >
                              {isCurrentFrontier && (
                                <motion.div
                                  layoutId="city-active-explorer-beacon"
                                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                                  className="mb-1 px-2.5 py-0.5 rounded-md bg-[#f2ca50] text-[#3c2f00] text-[10px] font-mono font-bold whitespace-nowrap shadow-lg flex items-center gap-1 pointer-events-none"
                                >
                                  <span className="material-symbols-outlined text-xs">navigation</span>
                                  <span>{isJustUnlockedNode ? 'Nouveau palier' : 'Étape active'}</span>
                                </motion.div>
                              )}

                              <motion.button
                                ref={(el) => {
                                  levelNodeRefs.current[lvl.levelNumber] = el;
                                }}
                                type="button"
                                onClick={() => handleOpenLevel(lvl)}
                                onMouseEnter={() => setHoveredLevel(lvl.levelNumber)}
                                onFocus={() => setHoveredLevel(lvl.levelNumber)}
                                whileHover={isUnlocked ? { scale: 1.07 } : { scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                animate={
                                  isJustUnlockedNode
                                    ? { scale: [0.9, 1.12, 1] }
                                    : isRecentlyProgressed
                                    ? { scale: [1, 1.08, 1] }
                                    : { scale: 1 }
                                }
                                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                                aria-label={`Niveau ${lvl.levelNumber} : ${lvl.landmarkTitle} (${
                                  isConquered
                                    ? 'Conquis'
                                    : isUnlocked
                                    ? `${completedChs.length} sur 10 chapitres`
                                    : 'Verrouillé'
                                })`}
                                className="group relative flex flex-col items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] rounded-2xl p-1"
                              >
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                  <AnimatePresence>
                                    {isJustUnlockedNode && (
                                      <motion.span
                                        initial={{ opacity: 0.85, scale: 0.85 }}
                                        animate={{ opacity: 0, scale: 1.45 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.15, repeat: 2, ease: 'easeOut' }}
                                        className="absolute inset-0 rounded-full border-2 border-[#f2ca50] pointer-events-none"
                                      />
                                    )}
                                  </AnimatePresence>

                                  <svg
                                    viewBox="0 0 60 60"
                                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                                    aria-hidden="true"
                                  >
                                    <circle
                                      cx="30"
                                      cy="30"
                                      r={ringRadius}
                                      fill="none"
                                      stroke={isUnlocked ? '#232a3a' : '#182032'}
                                      strokeWidth="3.5"
                                    />
                                    {isUnlocked && (
                                      <motion.circle
                                        cx="30"
                                        cy="30"
                                        r={ringRadius}
                                        fill="none"
                                        stroke={isConquered ? '#34d399' : '#f2ca50'}
                                        strokeWidth="3.8"
                                        strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        initial={false}
                                        animate={{ strokeDashoffset: ringOffset }}
                                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                                      />
                                    )}
                                  </svg>

                                  <div
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono tabular-nums font-black border shadow-lg transition-colors ${
                                      isThreeDigits ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                                    } ${
                                      isConquered
                                        ? 'bg-[#102b27] border-emerald-400/75 text-emerald-300 group-hover:bg-emerald-950'
                                        : isCurrentFrontier
                                        ? 'bg-[#f2ca50] border-[#ffe088] text-[#3c2f00] shadow-[0_0_24px_rgba(242,202,80,0.45)]'
                                        : isUnlocked
                                        ? 'bg-[#191f2f] border-[#f2ca50]/55 text-[#f2ca50] group-hover:bg-[#232a3a]'
                                        : 'bg-[#151b2b] border-[#232a3a] text-[#99907c]'
                                    }`}
                                  >
                                    {isUnlocked ? (
                                      <span>{lvl.levelNumber}</span>
                                    ) : (
                                      <span className="material-symbols-outlined text-base">lock</span>
                                    )}
                                  </div>

                                  {isConquered ? (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 text-[#071510] flex items-center justify-center shadow ring-2 ring-[#0c1322]"
                                      title="Niveau conquis (10/10)"
                                    >
                                      <span className="material-symbols-outlined text-[13px] font-bold">
                                        check
                                      </span>
                                    </span>
                                  ) : lvl.isDistrictGate ? (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#232a3a] border border-[#f2ca50]/60 text-[#f2ca50] flex items-center justify-center shadow"
                                      title="Monument final du quartier"
                                    >
                                      <span className="material-symbols-outlined text-[12px]">
                                        emoji_events
                                      </span>
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-[#0c1322]/90 border border-[#232a3a] max-w-[128px] sm:max-w-[155px] text-center shadow-md group-hover:border-[#f2ca50]/50 transition-colors">
                                  <div className="font-serif text-[11px] sm:text-xs font-bold text-[#dce2f8] group-hover:text-[#f2ca50] leading-tight truncate">
                                    {lvl.landmarkTitle}
                                  </div>
                                  <div
                                    className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                                      isConquered
                                        ? 'text-emerald-400 font-semibold'
                                        : isCurrentFrontier
                                        ? 'text-[#f2ca50] font-semibold'
                                        : isUnlocked
                                        ? 'text-[#d4c78f]'
                                        : 'text-[#99907c]'
                                    }`}
                                  >
                                    {isConquered
                                      ? 'Conquis · 10/10'
                                      : isUnlocked
                                      ? `${completedChs.length}/10 chap.`
                                      : `Niv. ${lvl.levelNumber}`}
                                  </div>
                                </div>
                              </motion.button>
                            </div>
                          );
                        })}
                      </div>

                      {/* CARTOGRAPHIC WAYPOINT INSPECTOR FOOTER BAR */}
                      {focusedLevelInSector && (
                        <footer className="px-5 py-3.5 sm:px-6 bg-[#191f2f]/90 border-t border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="material-symbols-outlined text-xl shrink-0 text-[#f2ca50]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {focusedLevelInSector.icon}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-[#d4c78f]">
                                <span>Monument {focusedLevelInSector.levelNumber}</span>
                                <span aria-hidden="true">·</span>
                                <span>{focusedLevelInSector.classLabel}</span>
                                <span aria-hidden="true">·</span>
                                <span>{focusedChapters.length}/10 chapitres</span>
                              </div>
                              <div className="text-xs sm:text-sm text-[#dce2f8] font-medium truncate">
                                <strong className="font-serif text-[#f2ca50]">
                                  {focusedLevelInSector.landmarkTitle}
                                </strong>{' '}
                                <span className="text-[#d0c5af]">
                                  — {focusedLevelInSector.themeFocus}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleDistrictExpanded(district.id)}
                              className="px-3 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] text-xs font-semibold whitespace-nowrap cursor-pointer"
                            >
                              Rétracter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLevel(focusedLevelInSector)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                                focusedLevelInSector.levelNumber <= unlockedLevel
                                  ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00]'
                                  : 'bg-[#232a3a] text-[#99907c]'
                              }`}
                            >
                              {focusedLevelInSector.levelNumber <= unlockedLevel
                                ? `Explorer Niveau ${focusedLevelInSector.levelNumber}`
                                : `Verrouillé (Niv. ${unlockedLevel} requis)`}
                            </button>
                          </div>
                        </footer>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>

        {/* 10 CHAPTERS & QUIZ MODAL */}
        {activeLevelModal !== null && (
          <CityLevelChaptersModal
            levelNumber={activeLevelModal}
            progression={progression}
            playerLevel={playerLevel}
            onClose={() => setActiveLevelModal(null)}
            onChapterCompleted={handleChapterComplete}
            onNavigateToLevel={(nextLvl) => setActiveLevelModal(nextLvl)}
          />
        )}
      </div>
    </LayoutGroup>
  );
};
