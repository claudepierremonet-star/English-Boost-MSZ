import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { CityMapProgressionState } from '../firebase/types';
import {
  CITY_DISTRICTS,
  CITY_LEVELS,
  MAX_CITY_LEVEL,
  TOTAL_CITY_CHAPTERS,
  getBlock50ForLevel,
  getDistrictForLevel,
  getDistrictSectors,
  getLevelBlocksOf50,
  getSectorForLevel,
  type CityDistrict,
  type CityLevelBlock50,
  type CityLevelNode,
  type CityLevelSector
} from '../data/cityMapData';
import type { SchoolGrade } from '../data/curriculum';
import { CityLevelChaptersModal } from './CityLevelChaptersModal';
import type { CityChapterCompletionResult } from '../utils/cityMapManager';
import { LevelGroupNavigator } from './LevelGroupNavigator';
import {
  City3DMaquetteViewport,
  LuxuryArchitecturalTerrainSvg,
  LuxuryCompassDial3D,
  LuxuryCornerBrackets,
  LuxurySkyline3DSvg
} from './CityMapLuxury3DKit';

const CITY_NAV_PREFS_KEY = 'eb_msz_city_nav_prefs_v1';

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
  const activeBlock50Meta = useMemo(() => getBlock50ForLevel(unlockedLevel), [unlockedLevel]);
  const levelBlocks50 = useMemo(() => getLevelBlocksOf50(50), []);

  // Navigation mode on Plan Principal: 12 groups of 50 levels (1-50, 51-100...) OR 7 school classes
  const [navMode, setNavMode] = useState<'blocks_50' | 'classes'>(() => {
    try {
      const raw = localStorage.getItem(CITY_NAV_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { navMode?: string };
        if (parsed.navMode === 'classes' || parsed.navMode === 'blocks_50') return parsed.navMode;
      }
    } catch {}
    return 'blocks_50';
  });
  // Which 50-level range blocks are expanded (persisted so user layout stays clean)
  const [expandedBlocks50, setExpandedBlocks50] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(CITY_NAV_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { expandedBlocks50?: Record<string, boolean> };
        if (parsed.expandedBlocks50 && typeof parsed.expandedBlocks50 === 'object') {
          return parsed.expandedBlocks50;
        }
      }
    } catch {}
    return {};
  });

  // Persist navigation preferences locally
  useEffect(() => {
    try {
      localStorage.setItem(
        CITY_NAV_PREFS_KEY,
        JSON.stringify({ navMode, expandedBlocks50 })
      );
    } catch {}
  }, [navMode, expandedBlocks50]);

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
  // Optional Global Class & Sector Atlas Index Drawer
  const [showGlobalRangeIndex, setShowGlobalRangeIndex] = useState<boolean>(false);

  const [activeLevelModal, setActiveLevelModal] = useState<number | null>(null);
  const [lockedPromptLevel, setLockedPromptLevel] = useState<number | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [is3DView, setIs3DView] = useState<boolean>(true);
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

  // Toggle condense/expand for a 50-level range block (e.g. 1-50, 51-100)
  const toggleBlock50Expanded = useCallback((blockId: string) => {
    setExpandedBlocks50((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  }, []);

  const expandSingleBlock50 = useCallback((blockId: string) => {
    setExpandedBlocks50({ [blockId]: true });
  }, []);

  const handleToggleAllBlocks50 = useCallback(
    (expandAll: boolean) => {
      const next: Record<string, boolean> = {};
      for (const blk of levelBlocks50) {
        next[blk.id] = expandAll;
      }
      setExpandedBlocks50(next);
    },
    [levelBlocks50]
  );

  // Retract all classes except active one (or all when in retractable overview)
  const handleRetractAllDistricts = useCallback(() => {
    setSelectedDistrict('all_retractable');
    setExpandedDistricts({});
  }, []);

  // Smooth scroll helper that guarantees target sector, class, and 50-level group are expanded
  const scrollToLevelNode = useCallback(
    (targetLevel: number, options?: { isUnlock?: boolean; delayMs?: number }) => {
      const targetDistrict = getDistrictForLevel(targetLevel);
      const targetSector = getSectorForLevel(targetLevel);
      const targetBlock50 = getBlock50ForLevel(targetLevel);

      setSelectedDistrict(targetDistrict.id);
      setExpandedDistricts((prev) => ({ ...prev, [targetDistrict.id]: true }));
      setSelectedSectorByDistrict((prev) => ({
        ...prev,
        [targetDistrict.id]: targetSector.id
      }));
      setExpandedBlocks50((prev) => ({ ...prev, [targetBlock50.id]: true }));

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
        <section
          className="relative rounded-3xl bg-gradient-to-br from-[#191f2f] via-[#121828] to-[#080d1a] border border-[#f2ca50]/45 overflow-hidden p-5 sm:p-8"
          style={{
            boxShadow:
              '0 24px 55px -16px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 240, 185, 0.14)'
          }}
        >
          <LuxuryCornerBrackets accentHex="#f2ca50" />
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-52 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f2ca50 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 pointer-events-none">
            <LuxurySkyline3DSvg accentHex="#f2ca50" />
          </div>

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex flex-col gap-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono text-[#d4c78f] tabular-nums">
                  <span className="text-[#f2ca50] font-semibold">Atlas Architectural</span>
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

        {/* ATLAS PAR CLASSES & SECTEURS (6e À TERMINALE · 1..600) */}
        <AnimatePresence>
          {showGlobalRangeIndex && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 rounded-3xl bg-[#151b2b] border border-[#f2ca50]/45 shadow-2xl space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-[#232a3a] pb-3">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#f2ca50]">
                      Atlas des Quartiers &amp; Secteurs (1 – {MAX_CITY_LEVEL})
                    </h3>
                    <p className="text-xs text-[#d0c5af]">
                      Sélectionnez directement un secteur cartographique par classe (6e à Terminale).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGlobalRangeIndex(false)}
                    className="w-9 h-9 rounded-xl bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center shrink-0 cursor-pointer"
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
                        className="p-3.5 rounded-2xl bg-[#0c1322] border border-[#232a3a] flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-serif text-sm font-bold"
                              style={{ color: dist.accentHex }}
                            >
                              {dist.classLabel}
                            </span>
                            <span className="text-[#99907c]" aria-hidden="true">·</span>
                            <span className="text-[#dce2f8] font-medium">{dist.name}</span>
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

        {/* NAVIGATION PANEL: CONDENSABLE 50-LEVEL RANGE GROUPS & CLASS DISTRICTS */}
        <nav
          aria-label="Navigation par groupes de niveaux de 50 et par classes sur le Plan Principal"
          className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a]"
        >
          {/* Navigation Mode Switch Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#232a3a]/80">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0c1322] border border-[#232a3a]">
              <button
                type="button"
                onClick={() => setNavMode('blocks_50')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  navMode === 'blocks_50'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">layers</span>
                <span>Groupes de 50 (1–600)</span>
              </button>

              <button
                type="button"
                onClick={() => setNavMode('classes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  navMode === 'classes'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">account_balance</span>
                <span>Par Classes (6e–Term.)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0c1322] border border-[#232a3a]"
                role="group"
                aria-label="Perspective cartographique"
              >
                <button
                  type="button"
                  onClick={() => setIs3DView(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                    is3DView
                      ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                      : 'text-[#d0c5af] hover:text-[#dce2f8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">view_in_ar</span>
                  <span>Diorama 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIs3DView(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                    !is3DView
                      ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                      : 'text-[#d0c5af] hover:text-[#dce2f8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  <span>Plan Zénithal</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#d4c78f]">
                <span>Plage active :</span>
                <strong className="text-[#f2ca50]">{activeBlock50Meta.rangeLabel}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setNavMode('blocks_50');
                    expandSingleBlock50(activeBlock50Meta.id);
                  }}
                  className="ml-1 px-2.5 py-1 rounded-lg bg-[#0c1322] border border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/50 hover:text-[#f2ca50] font-sans font-semibold cursor-pointer transition-colors whitespace-nowrap"
                  title={`Ouvrir uniquement la plage active ${activeBlock50Meta.rangeLabel}`}
                >
                  Centrer
                </button>
              </div>
            </div>
          </div>

          {navMode === 'classes' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={handleRetractAllDistricts}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
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
            </div>
          ) : (
            <LevelGroupNavigator
              blocks={levelBlocks50}
              expandedBlocks={expandedBlocks50}
              onToggleBlock={toggleBlock50Expanded}
              onExpandSingleBlock={expandSingleBlock50}
              onSetAllBlocks={handleToggleAllBlocks50}
              unlockedLevel={unlockedLevel}
              conqueredSet={conqueredSet}
              completedChaptersByLevel={progression.completedChaptersByLevel || {}}
              activeViewingSectorId={
                selectedDistrict !== 'all_retractable'
                  ? selectedSectorByDistrict[selectedDistrict] ||
                    getSectorForLevel(unlockedLevel).id
                  : undefined
              }
              onSelectSector={(sec) => {
                const dist = getDistrictForLevel(sec.startLevel);
                selectDistrictAndSector(dist.id, sec.id, true);
              }}
              onSelectLevel={(lvl) => {
                if (lvl.levelNumber > unlockedLevel) {
                  setLockedPromptLevel(lvl.levelNumber);
                } else {
                  setLockedPromptLevel(null);
                }
                scrollToLevelNode(lvl.levelNumber, { delayMs: 80 });
              }}
              onPlayLevelDirect={(lvl) => handleOpenLevel(lvl)}
            />
          )}
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

                      {/* INTERACTIVE 3D LUXURY ARCHITECTURAL MAQUETTE (ONLY ACTIVE SECTOR'S 15-16 NODES) */}
                      <City3DMaquetteViewport
                        is3DView={is3DView}
                        isMobile={isMobile}
                        canvasHeight={canvasHeight}
                        accentHex={district.accentHex}
                      >
                        <LuxuryArchitecturalTerrainSvg
                          canvasHeight={canvasHeight}
                          accentHex={district.accentHex}
                          fullPathD={fullPathD}
                          activePathD={activePathD}
                          uid={`dist-${district.id}`}
                        />

                        {/* 3D Horological Compass Dial & Geographic Margin Label */}
                        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 flex flex-col items-end gap-1 pointer-events-none z-20">
                          <LuxuryCompassDial3D accentHex={district.accentHex} />
                          <span className="text-[10px] font-mono tabular-nums text-[#d4c78f]/85 tracking-wider">
                            {district.classLabel} · {activeSector.startLevel}–{activeSector.endLevel}
                          </span>
                        </div>

                        {/* Positioned 3D Sculpted Landmark Plinths */}
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

                          const coinShadow = isCurrentFrontier
                            ? '0 6px 0 #8a6a14, 0 14px 26px rgba(242, 202, 80, 0.36)'
                            : isConquered
                            ? '0 6px 0 #0a4232, 0 12px 22px rgba(16, 185, 129, 0.25)'
                            : isUnlocked
                            ? '0 6px 0 #161d30, 0 12px 20px rgba(0, 0, 0, 0.65)'
                            : '0 4px 0 #0c111d, 0 8px 14px rgba(0, 0, 0, 0.55)';

                          return (
                            <div
                              key={lvl.levelNumber}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                              style={{
                                left: `${pt.xPct}%`,
                                top: `${pt.yPx}px`,
                                transform: is3DView ? 'translateZ(18px)' : undefined,
                                transformStyle: is3DView ? 'preserve-3d' : undefined
                              }}
                            >
                              {isCurrentFrontier && (
                                <motion.div
                                  layoutId="city-active-explorer-beacon"
                                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                                  className="mb-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe699] text-[#3c2f00] text-[10px] font-mono font-bold whitespace-nowrap shadow-[0_6px_16px_rgba(242,202,80,0.45)] flex items-center gap-1 pointer-events-none"
                                  style={is3DView ? { transform: 'translateZ(14px)' } : undefined}
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
                                whileHover={isUnlocked ? { y: -4, scale: 1.06 } : { y: -2, scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                animate={
                                  isJustUnlockedNode
                                    ? { scale: [0.9, 1.12, 1] }
                                    : isRecentlyProgressed
                                    ? { scale: [1, 1.08, 1] }
                                    : { scale: 1 }
                                }
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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
                                  {/* Ground Ambient Occlusion Ring beneath Plinth */}
                                  <span
                                    className="absolute -bottom-1.5 inset-x-1.5 h-3.5 rounded-full bg-black/75 blur-[5px] pointer-events-none"
                                    aria-hidden="true"
                                  />

                                  {/* Vertical Luxury Beacon Beam for Active Frontier */}
                                  {isCurrentFrontier && (
                                    <span
                                      className="absolute -top-6 w-7 h-10 pointer-events-none opacity-65"
                                      style={{
                                        background:
                                          'linear-gradient(to top, rgba(242,202,80,0.42), rgba(242,202,80,0))'
                                      }}
                                      aria-hidden="true"
                                    />
                                  )}

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
                                      stroke={isUnlocked ? '#27314b' : '#171f32'}
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

                                  {/* 3D Extruded Medallion Plinth */}
                                  <div
                                    style={{ boxShadow: coinShadow }}
                                    className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono tabular-nums font-black border transition-transform duration-200 overflow-hidden ${
                                      isThreeDigits ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                                    } ${
                                      isConquered
                                        ? 'bg-gradient-to-br from-[#164a3e] to-[#0a261f] border-emerald-300/80 text-emerald-200'
                                        : isCurrentFrontier
                                        ? 'bg-gradient-to-br from-[#ffe89e] via-[#f2ca50] to-[#c7991e] border-[#fff6cf] text-[#3c2f00]'
                                        : isUnlocked
                                        ? 'bg-gradient-to-br from-[#25304a] to-[#12192b] border-[#f2ca50]/65 text-[#f2ca50]'
                                        : 'bg-gradient-to-br from-[#182032] to-[#0c111e] border-[#29334c] text-[#8d8572]'
                                    }`}
                                  >
                                    {/* Specular Rim Sheen */}
                                    <span
                                      className="absolute inset-0 pointer-events-none"
                                      style={{
                                        background:
                                          'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 52%)'
                                      }}
                                      aria-hidden="true"
                                    />
                                    <span className="relative z-10">
                                      {isUnlocked ? (
                                        lvl.levelNumber
                                      ) : (
                                        <span className="material-symbols-outlined text-base">lock</span>
                                      )}
                                    </span>
                                  </div>

                                  {isConquered ? (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 text-[#052117] flex items-center justify-center shadow ring-2 ring-[#0b1222]"
                                      title="Niveau conquis (10/10)"
                                    >
                                      <span className="material-symbols-outlined text-[13px] font-bold">
                                        check
                                      </span>
                                    </span>
                                  ) : lvl.isDistrictGate ? (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#192136] border border-[#f2ca50]/75 text-[#f2ca50] flex items-center justify-center shadow"
                                      title="Monument final du quartier"
                                    >
                                      <span className="material-symbols-outlined text-[12px]">
                                        emoji_events
                                      </span>
                                    </span>
                                  ) : null}
                                </div>

                                {/* Sculpted Brushed-Obsidian Nameplate Plaque */}
                                <div
                                  className="mt-2 px-2.5 py-1.5 rounded-lg bg-[#080d19]/92 border border-[#2a344e] max-w-[132px] sm:max-w-[162px] text-center shadow-[0_8px_18px_rgba(0,0,0,0.75)] group-hover:border-[#f2ca50]/70 transition-colors backdrop-blur-md"
                                  style={is3DView ? { transform: 'translateZ(8px)' } : undefined}
                                >
                                  <div className="font-serif text-[11px] sm:text-xs font-bold text-[#eef2ff] group-hover:text-[#f2ca50] leading-tight truncate">
                                    {lvl.landmarkTitle}
                                  </div>
                                  <div
                                    className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                                      isConquered
                                        ? 'text-emerald-300 font-semibold'
                                        : isCurrentFrontier
                                        ? 'text-[#f2ca50] font-semibold'
                                        : isUnlocked
                                        ? 'text-[#d4c78f]'
                                        : 'text-[#8c8574]'
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
                      </City3DMaquetteViewport>

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
