import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CityMapProgressionState } from '../firebase/types';
import {
  MAX_CITY_LEVEL,
  getDistrictForLevel,
  getLevelBlocksOf50
} from '../data/cityMapData';
import {
  LESSON_COMPLETED_EVENT,
  getCityMapProgression,
  type LessonCityProgressEventDetail
} from '../utils/cityMapManager';

interface HeaderLevelProgressBarProps {
  /** État de progression des 600 niveaux fourni par App.tsx (synchronisé temps réel) */
  progression?: CityMapProgressionState;
  /** Redirection directe vers le Plan Principal 600 niveaux */
  onNavigateCityMap?: () => void;
}

interface SegmentMetrics {
  blockIndex: number;
  startLevel: number;
  endLevel: number;
  rangeLabel: string;
  classLabel: string;
  conqueredCount: number;
  totalLevelsInBlock: number;
  fractionalUnits: number;
  fillRatio: number;
  visualFillRatio: number;
  isFullyConquered: boolean;
  containsFrontier: boolean;
}

export const HeaderLevelProgressBar: React.FC<HeaderLevelProgressBarProps> = ({
  progression: externalProgression,
  onNavigateCityMap
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [progression, setProgression] = useState<CityMapProgressionState>(
    () => externalProgression ?? getCityMapProgression()
  );
  const [hoveredSegmentIdx, setHoveredSegmentIdx] = useState<number | null>(null);
  const [boostedSegmentIdx, setBoostedSegmentIdx] = useState<number | null>(null);
  const [celebrationNotice, setCelebrationNotice] = useState<string | null>(null);
  const [pulseVersion, setPulseVersion] = useState<number>(0);

  const boostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTotalUnitsRef = useRef<number | null>(null);

  const levelBlocks50 = useMemo(() => getLevelBlocksOf50(50), []);

  // Keep local state synchronized with prop updates from App.tsx
  useEffect(() => {
    if (externalProgression) {
      setProgression(externalProgression);
    }
  }, [externalProgression]);

  const triggerBoostFeedback = (targetLevel: number, noticeText: string) => {
    const segIdx = levelBlocks50.findIndex(
      (b) => targetLevel >= b.startLevel && targetLevel <= b.endLevel
    );
    setBoostedSegmentIdx(segIdx >= 0 ? segIdx : 0);
    setCelebrationNotice(noticeText);
    setPulseVersion((v) => v + 1);

    if (boostTimeoutRef.current) {
      clearTimeout(boostTimeoutRef.current);
    }
    boostTimeoutRef.current = setTimeout(() => {
      setBoostedSegmentIdx(null);
      setCelebrationNotice(null);
    }, 2600);
  };

  // Listen to both City Map progression updates and Cursus Lesson completions
  useEffect(() => {
    const handleCityUpdate = (e: Event) => {
      const ce = e as CustomEvent<CityMapProgressionState>;
      const next = ce.detail ?? getCityMapProgression();
      setProgression(next);
    };

    const handleLessonCompleted = (e: Event) => {
      const ce = e as CustomEvent<LessonCityProgressEventDetail>;
      const latest = getCityMapProgression();
      setProgression(latest);

      const targetLvl = ce.detail?.advancedLevel ?? Math.max(1, latest.unlockedLevel || 1);
      const label = ce.detail?.advancedLevel
        ? `+1 Niv. (${ce.detail.advancedLevel})`
        : 'Leçon validée';
      triggerBoostFeedback(targetLvl, label);
    };

    window.addEventListener('eb_city_map_updated', handleCityUpdate);
    window.addEventListener(LESSON_COMPLETED_EVENT, handleLessonCompleted);

    return () => {
      window.removeEventListener('eb_city_map_updated', handleCityUpdate);
      window.removeEventListener(LESSON_COMPLETED_EVENT, handleLessonCompleted);
      if (boostTimeoutRef.current) {
        clearTimeout(boostTimeoutRef.current);
      }
    };
  }, [levelBlocks50]);

  const { segments, totalConquered, totalUnits, globalPercent, activeBlockIndex } = useMemo(() => {
    const conqueredSet = new Set<number>(progression.conqueredLevels || []);
    const chaptersMap = progression.completedChaptersByLevel || {};
    const unlocked = Math.max(1, Math.min(MAX_CITY_LEVEL, progression.unlockedLevel || 1));

    let conqueredSum = 0;
    let unitsSum = 0;
    let frontierBlockIdx = 0;

    const computedSegments: SegmentMetrics[] = levelBlocks50.map((block, idx) => {
      let blockConquered = 0;
      let blockUnits = 0;

      for (const lvl of block.levels) {
        const chCount = (chaptersMap[String(lvl.levelNumber)] || []).length;
        if (conqueredSet.has(lvl.levelNumber) || chCount >= 10) {
          blockConquered++;
          blockUnits += 1;
        } else if (chCount > 0) {
          blockUnits += Math.min(0.95, chCount / 10);
        }
      }

      const containsFrontier = unlocked >= block.startLevel && unlocked <= block.endLevel;
      if (containsFrontier) {
        frontierBlockIdx = idx;
      }

      conqueredSum += blockConquered;
      unitsSum += blockUnits;

      const ratio = Math.min(1, blockUnits / Math.max(1, block.levels.length));
      // Guarantee a crisp visible sliver (> 0) as soon as at least 1 chapter in the block is started
      const visualFillRatio = blockUnits > 0 ? Math.max(0.08, ratio) : 0;

      return {
        blockIndex: block.blockIndex,
        startLevel: block.startLevel,
        endLevel: block.endLevel,
        rangeLabel: block.rangeLabel,
        classLabel: block.classLabels.join('/'),
        conqueredCount: blockConquered,
        totalLevelsInBlock: block.levels.length,
        fractionalUnits: blockUnits,
        fillRatio: ratio,
        visualFillRatio,
        isFullyConquered: blockConquered >= block.levels.length,
        containsFrontier
      };
    });

    const pct = Math.min(100, (unitsSum / MAX_CITY_LEVEL) * 100);

    return {
      segments: computedSegments,
      totalConquered: conqueredSum,
      totalUnits: unitsSum,
      globalPercent: pct,
      activeBlockIndex: frontierBlockIdx
    };
  }, [progression, levelBlocks50]);

  // Detect any external progression increase (e.g. chapter completed inside City Map)
  useEffect(() => {
    if (prevTotalUnitsRef.current === null) {
      prevTotalUnitsRef.current = totalUnits;
      return;
    }

    if (totalUnits > prevTotalUnitsRef.current + 0.01 && !celebrationNotice) {
      const frontierLvl = Math.max(1, progression.unlockedLevel || 1);
      const pctText =
        globalPercent < 10 ? `${globalPercent.toFixed(1)}%` : `${Math.round(globalPercent)}%`;
      triggerBoostFeedback(frontierLvl, `Avancement · ${pctText}`);
    }
    prevTotalUnitsRef.current = totalUnits;
  }, [totalUnits, globalPercent, progression.unlockedLevel, celebrationNotice]);

  const unlockedLevel = Math.max(1, Math.min(MAX_CITY_LEVEL, progression.unlockedLevel || 1));
  const currentDistrict = useMemo(() => getDistrictForLevel(unlockedLevel), [unlockedLevel]);

  const formattedPercent =
    totalUnits <= 0
      ? '0%'
      : globalPercent < 10
      ? `${globalPercent.toFixed(1)}%`
      : `${Math.round(globalPercent)}%`;

  const hoveredSegment = hoveredSegmentIdx !== null ? segments[hoveredSegmentIdx] : null;
  const activeSegment = segments[activeBlockIndex] ?? segments[0];

  return (
    <div className="border-t border-[#232a3a]/70 bg-[#090f1d]/75">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-6 sm:h-[26px] flex items-center gap-2 sm:gap-3">
        {/* Left: Compact Level & Segment Context */}
        <button
          type="button"
          onClick={onNavigateCityMap}
          className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums whitespace-nowrap shrink-0 text-[#d4c78f] hover:text-[#f2ca50] transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#f2ca50] rounded"
          title={`Plan Principal 600 niveaux · Actuellement Niv. ${unlockedLevel}/600 (${currentDistrict.classLabel}) — Cliquer pour ouvrir le Plan`}
        >
          <span className="material-symbols-outlined text-[13px] text-[#f2ca50] shrink-0">
            stacked_bar_chart
          </span>
          {hoveredSegment ? (
            <span className="text-[#ffe088] font-semibold">
              Niv. {hoveredSegment.rangeLabel} · {hoveredSegment.conqueredCount}/{hoveredSegment.totalLevelsInBlock}
            </span>
          ) : (
            <>
              <span className="font-bold text-[#f2ca50]">
                {currentDistrict.classLabel}
              </span>
              <span aria-hidden="true" className="text-[#99907c]">
                ·
              </span>
              <span className="text-[#dce2f8]/90">
                Niv. {unlockedLevel}
              </span>
            </>
          )}
        </button>

        {/* Center: 12-Segment 600-Level Framer Motion Progress Track (50 levels per segment) */}
        <div
          role="progressbar"
          aria-label="Progression globale sur les 600 niveaux"
          aria-valuemin={0}
          aria-valuemax={MAX_CITY_LEVEL}
          aria-valuenow={Math.round(totalUnits)}
          aria-valuetext={`${totalConquered} niveaux conquis sur ${MAX_CITY_LEVEL}, soit ${formattedPercent}`}
          onClick={onNavigateCityMap}
          className="flex-1 min-w-0 grid grid-cols-12 gap-[3px] sm:gap-1 items-center cursor-pointer py-1"
        >
          {segments.map((seg, idx) => {
            const isBoosted = boostedSegmentIdx === idx;
            const isHovered = hoveredSegmentIdx === idx;
            const segPercent = Math.round(seg.fillRatio * 100);

            return (
              <div
                key={seg.blockIndex}
                onMouseEnter={() => setHoveredSegmentIdx(idx)}
                onMouseLeave={() => setHoveredSegmentIdx((curr) => (curr === idx ? null : curr))}
                title={`Tranche ${seg.rangeLabel} (${seg.classLabel}) : ${seg.conqueredCount}/${seg.totalLevelsInBlock} niveaux conquis (${segPercent}%)`}
                className={`relative h-[7px] sm:h-2 rounded-[2px] overflow-hidden border transition-colors ${
                  seg.isFullyConquered
                    ? 'bg-[#0b1f1a] border-emerald-500/55'
                    : isBoosted || seg.containsFrontier
                    ? 'bg-[#070e1d] border-[#f2ca50]/65'
                    : isHovered
                    ? 'bg-[#0d1629] border-[#f2ca50]/45'
                    : 'bg-[#070e1d] border-[#232a3a]'
                }`}
              >
                {/* Animated Framer Motion Segment Fill (compositor scaleX) */}
                <motion.div
                  initial={shouldReduceMotion ? { scaleX: seg.visualFillRatio } : { scaleX: 0 }}
                  animate={{ scaleX: seg.visualFillRatio }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 115, damping: 19, mass: 0.85 }
                  }
                  style={{ transformOrigin: 'left center' }}
                  className={`absolute inset-0 w-full h-full will-change-transform ${
                    seg.isFullyConquered
                      ? 'bg-gradient-to-r from-emerald-500 via-[#34d399] to-[#f2ca50]'
                      : 'bg-gradient-to-r from-[#b8860b] via-[#f2ca50] to-[#ffe088]'
                  }`}
                />

                {/* Brief Dynamic Shimmer Wave on Lesson / Level Completion */}
                <AnimatePresence>
                  {isBoosted && !shouldReduceMotion && (
                    <motion.div
                      key={`boost-${pulseVersion}-${idx}`}
                      initial={{ x: '-110%', opacity: 0.9 }}
                      animate={{ x: '220%', opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.05, ease: 'easeOut' }}
                      className="absolute inset-y-0 w-3/4 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right: Global 600-Level Counter & Animated Completion Feedback */}
        <button
          type="button"
          onClick={onNavigateCityMap}
          className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#f2ca50] rounded"
          title={`Progression globale : ${totalConquered}/${MAX_CITY_LEVEL} niveaux conquis (${formattedPercent}) — Tranche active ${activeSegment.rangeLabel}`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {celebrationNotice ? (
              <motion.span
                key={`notice-${pulseVersion}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-emerald-300 font-bold"
              >
                {celebrationNotice}
              </motion.span>
            ) : (
              <motion.span
                key={`ratio-${totalConquered}-${formattedPercent}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1"
              >
                <span className="font-bold text-[#f2ca50]">
                  {totalConquered}/{MAX_CITY_LEVEL}
                </span>
                <span aria-hidden="true" className="text-[#99907c] hidden sm:inline">
                  ·
                </span>
                <span className="text-[#d4c78f] hidden sm:inline">
                  {formattedPercent}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};
