import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { UserProfile } from '../firebase/types';
import {
  getVocabularyMasterySummary,
  type VocabularyDataPoint,
  type VocabularyMasterySummary
} from '../data/vocabularyStats';
import { ChartSectionSkeleton, MotionShimmerBlock } from './SkeletonLoaders';

interface LexicalMasteryD3ChartProps {
  user: UserProfile;
  onOpenFlashcards?: () => void;
}

type D3ViewMode = 'mastery' | 'retention';
type DayWindow = 30 | 15 | 7;

interface ParsedLexicalPoint extends VocabularyDataPoint {
  dateObj: Date;
  index: number;
}

const CHART_HEIGHT = 256;
const MARGIN = { top: 20, right: 20, bottom: 32, left: 46 };
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const LexicalMasteryD3Chart: React.FC<LexicalMasteryD3ChartProps> = ({
  user,
  onOpenFlashcards
}) => {
  const uid = useId().replace(/:/g, '');
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [chartWidth, setChartWidth] = useState<number>(640);
  const [summaryData, setSummaryData] = useState<VocabularyMasterySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<D3ViewMode>('mastery');
  const [dayWindow, setDayWindow] = useState<DayWindow>(30);

  // Interactive series visibility toggles
  const [showMastered, setShowMastered] = useState<boolean>(true);
  const [showLearning, setShowLearning] = useState<boolean>(true);
  const [showTotalEnvelope, setShowTotalEnvelope] = useState<boolean>(true);

  // Interactive pointer / pinned day index
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const res = await getVocabularyMasterySummary(user);
        if (mounted) {
          setSummaryData(res);
        }
      } catch (err) {
        console.warn('Error loading D3 30-day lexical data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.uid, user.stats.totalXp, user.stats.masteryPercentage]);

  // Responsive container observer for pixel-accurate D3 axes & curves
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 120) {
        setChartWidth(Math.round(rect.width));
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const parsedSeries: ParsedLexicalPoint[] = useMemo(() => {
    const raw = summaryData?.thirtyDaysDaily ?? [];
    const sliced = raw.slice(-dayWindow);
    return sliced.map((pt, idx) => {
      const parsedDate = new Date(`${pt.dateKey}T12:00:00`);
      return {
        ...pt,
        dateObj: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        index: idx
      };
    });
  }, [summaryData, dayWindow]);

  // Reset hovered/pinned index if window size changes out of bounds
  useEffect(() => {
    setHoveredIndex(null);
    setPinnedIndex(null);
  }, [dayWindow, viewMode]);

  const innerWidth = Math.max(180, chartWidth - MARGIN.left - MARGIN.right);
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  // D3 Scales, Path Generators & Ticks
  const d3Model = useMemo(() => {
    if (parsedSeries.length === 0) return null;

    const dateExtent = d3.extent(parsedSeries, (d) => d.dateObj) as [Date, Date];
    const xScale = d3.scaleTime().domain(dateExtent).range([0, innerWidth]);

    // Primary Y domain depending on viewMode
    let yMinVal = 0;
    let yMaxVal = 100;

    if (viewMode === 'mastery') {
      const candidates: number[] = [];
      parsedSeries.forEach((d) => {
        if (showMastered) candidates.push(d.masteredWords);
        if (showLearning) candidates.push(d.learningWords);
        if (showTotalEnvelope) candidates.push(d.totalActiveWords);
      });
      if (candidates.length === 0) {
        parsedSeries.forEach((d) => candidates.push(d.totalActiveWords));
      }
      const rawMin = d3.min(candidates) ?? 0;
      const rawMax = d3.max(candidates) ?? 100;
      const pad = Math.max(12, Math.round((rawMax - rawMin) * 0.14));
      yMinVal = Math.max(0, rawMin - pad);
      yMaxVal = rawMax + pad;
    } else {
      const retMin = d3.min(parsedSeries, (d) => d.retentionRate) ?? 70;
      const retMax = d3.max(parsedSeries, (d) => d.retentionRate) ?? 100;
      yMinVal = Math.max(60, Math.floor((retMin - 4) / 2) * 2);
      yMaxVal = Math.min(100, Math.ceil((retMax + 2) / 2) * 2);
    }

    const yScale = d3.scaleLinear().domain([yMinVal, yMaxVal]).nice(5).range([innerHeight, 0]);

    // Secondary bar scale for daily newly acquired words in 'retention' mode
    const maxNewWords = Math.max(10, d3.max(parsedSeries, (d) => d.newWordsAcquired) ?? 12);
    const barHeightScale = d3
      .scaleLinear()
      .domain([0, maxNewWords])
      .range([0, innerHeight * 0.34]);

    // Smooth D3 MonotoneX curve & area generators
    const makeLine = (accessor: (d: ParsedLexicalPoint) => number) =>
      d3
        .line<ParsedLexicalPoint>()
        .x((d) => xScale(d.dateObj))
        .y((d) => yScale(accessor(d)))
        .curve(d3.curveMonotoneX)(parsedSeries) ?? '';

    const makeArea = (accessor: (d: ParsedLexicalPoint) => number) =>
      d3
        .area<ParsedLexicalPoint>()
        .x((d) => xScale(d.dateObj))
        .y0(innerHeight)
        .y1((d) => yScale(accessor(d)))
        .curve(d3.curveMonotoneX)(parsedSeries) ?? '';

    const masteredLinePath = makeLine((d) => d.masteredWords);
    const masteredAreaPath = makeArea((d) => d.masteredWords);
    const learningLinePath = makeLine((d) => d.learningWords);
    const learningAreaPath = makeArea((d) => d.learningWords);
    const totalEnvelopePath = makeLine((d) => d.totalActiveWords);
    const retentionLinePath = makeLine((d) => d.retentionRate);
    const retentionAreaPath = makeArea((d) => d.retentionRate);

    // Axis ticks using D3 tick utilities
    const yTicks = yScale.ticks(5);
    const desiredXTicks = chartWidth < 460 ? 5 : 7;
    const step = Math.max(1, Math.floor((parsedSeries.length - 1) / (desiredXTicks - 1)));
    const xTickIndices = new Set<number>();
    for (let i = 0; i < parsedSeries.length; i += step) {
      xTickIndices.add(i);
    }
    xTickIndices.add(parsedSeries.length - 1);
    const xTicks = Array.from(xTickIndices).map((idx) => parsedSeries[idx]);

    const bisectDate = d3.bisector<ParsedLexicalPoint, Date>((d) => d.dateObj).center;

    return {
      xScale,
      yScale,
      barHeightScale,
      masteredLinePath,
      masteredAreaPath,
      learningLinePath,
      learningAreaPath,
      totalEnvelopePath,
      retentionLinePath,
      retentionAreaPath,
      yTicks,
      xTicks,
      bisectDate
    };
  }, [
    parsedSeries,
    innerWidth,
    innerHeight,
    chartWidth,
    viewMode,
    showMastered,
    showLearning,
    showTotalEnvelope
  ]);

  const activeIndex =
    hoveredIndex !== null
      ? hoveredIndex
      : pinnedIndex !== null
      ? pinnedIndex
      : parsedSeries.length > 0
      ? parsedSeries.length - 1
      : null;

  const activePoint =
    activeIndex !== null && parsedSeries[activeIndex] ? parsedSeries[activeIndex] : null;

  const firstPoint = parsedSeries[0];
  const lastPoint = parsedSeries[parsedSeries.length - 1];
  const windowLexiconDelta =
    firstPoint && lastPoint ? lastPoint.totalActiveWords - firstPoint.totalActiveWords : 0;
  const windowMasteredDelta =
    firstPoint && lastPoint ? lastPoint.masteredWords - firstPoint.masteredWords : 0;
  const avgRetentionWindow =
    parsedSeries.length > 0
      ? parsedSeries.reduce((acc, p) => acc + p.retentionRate, 0) / parsedSeries.length
      : 0;
  const peakNewWordsPoint =
    parsedSeries.length > 0
      ? parsedSeries.reduce((best, p) => (p.newWordsAcquired > best.newWordsAcquired ? p : best), parsedSeries[0])
      : null;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!d3Model || !svgRef.current || parsedSeries.length === 0) return;
    const [svgX] = d3.pointer(e.nativeEvent, svgRef.current);
    const localX = Math.max(0, Math.min(innerWidth, svgX - MARGIN.left));
    const hoveredDate = d3Model.xScale.invert(localX);
    const idx = d3Model.bisectDate(parsedSeries, hoveredDate);
    setHoveredIndex(Math.max(0, Math.min(parsedSeries.length - 1, idx)));
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  const handleSvgClick = () => {
    if (hoveredIndex === null) return;
    setPinnedIndex((prev) => (prev === hoveredIndex ? null : hoveredIndex));
  };

  const activePointCoords = useMemo(() => {
    if (!d3Model || !activePoint) return null;
    const cx = d3Model.xScale(activePoint.dateObj);
    return {
      cx,
      masteredY: d3Model.yScale(activePoint.masteredWords),
      learningY: d3Model.yScale(activePoint.learningWords),
      totalY: d3Model.yScale(activePoint.totalActiveWords),
      retentionY: d3Model.yScale(activePoint.retentionRate)
    };
  }, [d3Model, activePoint]);

  const barWidth = Math.max(4, Math.min(14, Math.floor(innerWidth / Math.max(12, parsedSeries.length * 1.65))));

  return (
    <section
      aria-label="Visualisation D3 de l'évolution de la maîtrise lexicale sur 30 jours"
      className="w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
    >
      {/* Subtle Ambient Gold Accent */}
      <div
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#38bdf8]/8 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="font-bold text-[#f2ca50] uppercase tracking-wider">
              Analytique D3.js · 30 Jours
            </span>
            <span aria-hidden="true" className="text-[#d4c78f]">
              ·
            </span>
            <span className="text-sky-300 font-semibold">
              {summaryData?.dataSource === 'indexeddb'
                ? 'Cartes SM-2 Synchronisées'
                : summaryData?.dataSource === 'local'
                ? 'Progression Locale SM-2'
                : 'Modèle Adaptatif CECRL'}
            </span>
          </div>
          <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-bold">
            Évolution de la Maîtrise Lexicale sur les {dayWindow} Derniers Jours
          </h3>
          <p className="text-xs text-[#d0c5af]/85">
            Survolez ou touchez la courbe D3 pour inspecter chaque journée d’assimilation et de rétention.
          </p>
        </div>

        {/* Controls: Mode Switcher + Time Window + Flashcards CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-0.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/45">
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              Courbes Lexique
            </button>
            <button
              type="button"
              onClick={() => setViewMode('retention')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'retention'
                  ? 'bg-emerald-400 text-[#052e16] font-bold shadow-sm'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              Rétention SM-2
            </button>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/45">
            {([30, 15, 7] as DayWindow[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setDayWindow(w)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dayWindow === w
                    ? 'bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/40'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                {w}J
              </button>
            ))}
          </div>

          {onOpenFlashcards && (
            <button
              type="button"
              onClick={onOpenFlashcards}
              className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#2e3545] border border-[#f2ca50]/35 text-[#f2ca50] text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">style</span>
              <span>Réviser</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Metric D3 Window Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10 font-mono">
        {isLoading && !summaryData ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1.5"
            >
              <MotionShimmerBlock className="h-2.5 w-24" surface="base" delay={idx * 0.05} />
              <MotionShimmerBlock className="h-5 w-20" surface={idx === 0 ? 'gold' : 'elevated'} delay={idx * 0.07} />
              <MotionShimmerBlock className="h-2.5 w-28" surface="base" delay={idx * 0.09} />
            </div>
          ))
        ) : (
          <>
            <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-[#d0c5af] tracking-wider">
                Gain Consolidé ({dayWindow}J)
              </span>
              <span className="text-base font-bold text-[#f2ca50] tabular-nums">
                +{Math.max(0, windowMasteredDelta)} mots
              </span>
              <span className="text-[10px] text-[#99907c] tabular-nums">
                {lastPoint ? `${lastPoint.masteredWords} consolidés` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-[#d0c5af] tracking-wider">
                Progression Totale
              </span>
              <span className="text-base font-bold text-[#a78bfa] tabular-nums">
                +{Math.max(0, windowLexiconDelta)} lexèmes
              </span>
              <span className="text-[10px] text-[#99907c] tabular-nums">
                {lastPoint ? `${lastPoint.totalActiveWords} actifs` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-[#d0c5af] tracking-wider">
                Rétention Moyenne
              </span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                {avgRetentionWindow.toFixed(1)}%
              </span>
              <span className="text-[10px] text-[#99907c]">Courbe SM-2 amortie</span>
            </div>

            <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-[#d0c5af] tracking-wider">
                Pic d’Assimilation
              </span>
              <span className="text-base font-bold text-sky-300 tabular-nums">
                +{peakNewWordsPoint?.newWordsAcquired ?? 0} mots/j
              </span>
              <span className="text-[10px] text-[#99907c] truncate">
                {peakNewWordsPoint ? peakNewWordsPoint.period : '—'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Interactive Series Filter Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#232a3a] relative z-10 text-xs">
        {viewMode === 'mastery' ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMastered((v) => !v)}
              aria-pressed={showMastered}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition-opacity cursor-pointer whitespace-nowrap shrink-0 ${
                showMastered
                  ? 'bg-[#0c1322] border-[#f2ca50]/55 text-[#f2ca50]'
                  : 'bg-[#0c1322]/40 border-[#232a3a] text-[#94a3b8] opacity-60'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50]" />
              <span>Consolidés</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLearning((v) => !v)}
              aria-pressed={showLearning}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition-opacity cursor-pointer whitespace-nowrap shrink-0 ${
                showLearning
                  ? 'bg-[#0c1322] border-sky-400/55 text-sky-300'
                  : 'bg-[#0c1322]/40 border-[#232a3a] text-[#94a3b8] opacity-60'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span>En Apprentissage</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTotalEnvelope((v) => !v)}
              aria-pressed={showTotalEnvelope}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition-opacity cursor-pointer whitespace-nowrap shrink-0 ${
                showTotalEnvelope
                  ? 'bg-[#0c1322] border-violet-400/55 text-violet-300'
                  : 'bg-[#0c1322]/40 border-[#232a3a] text-[#94a3b8] opacity-60'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-[#a78bfa]" />
              <span>Total Mobilisable</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#d0c5af]">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
              <span>Taux de Rétention SM-2 (%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#f2ca50]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f2ca50]/70" />
              <span>Nouveaux Mots / Jour</span>
            </span>
          </div>
        )}

        {pinnedIndex !== null && (
          <button
            type="button"
            onClick={() => setPinnedIndex(null)}
            className="text-[11px] font-mono text-[#f2ca50] hover:text-[#ffe088] underline cursor-pointer"
          >
            Détacher repère ({parsedSeries[pinnedIndex]?.period})
          </button>
        )}
      </div>

      {/* D3 Interactive SVG Canvas */}
      <div ref={containerRef} className="relative w-full h-[256px] select-none z-10">
        {isLoading && !summaryData ? (
          <ChartSectionSkeleton
            heightClass="h-[256px]"
            variant="curve"
            label="Calcul des courbes D3 en cours"
          />
        ) : d3Model && parsedSeries.length > 0 ? (
          <>
            <svg
              ref={svgRef}
              width={chartWidth}
              height={CHART_HEIGHT}
              viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onClick={handleSvgClick}
              className="w-full h-full overflow-visible cursor-crosshair touch-pan-y"
              role="img"
              aria-label={`Graphique D3 montrant l'évolution de la maîtrise lexicale sur ${dayWindow} jours`}
            >
              <defs>
                <linearGradient id={`d3-gold-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f2ca50" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id={`d3-sky-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id={`d3-emerald-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                </linearGradient>
                <filter id={`d3-glow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                {/* Horizontal Grid & D3 Y-Axis Labels */}
                {d3Model.yTicks.map((tick) => {
                  const yPos = d3Model.yScale(tick);
                  return (
                    <g key={`y-${tick}`}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={yPos}
                        y2={yPos}
                        stroke="#232a3a"
                        strokeDasharray="3 4"
                      />
                      <text
                        x={-8}
                        y={yPos + 3.5}
                        textAnchor="end"
                        fill="#d0c5af"
                        fillOpacity={0.78}
                        fontSize={10}
                        fontFamily="ui-monospace, monospace"
                      >
                        {viewMode === 'retention' ? `${tick}%` : tick}
                      </text>
                    </g>
                  );
                })}

                {/* D3 X-Axis Baseline & Date Labels */}
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={innerHeight}
                  y2={innerHeight}
                  stroke="#334155"
                />
                {d3Model.xTicks.map((pt) => {
                  const xPos = d3Model.xScale(pt.dateObj);
                  return (
                    <g key={`x-${pt.dateKey}`} transform={`translate(${xPos},${innerHeight})`}>
                      <line y1={0} y2={4} stroke="#475569" />
                      <text
                        y={17}
                        textAnchor="middle"
                        fill="#d0c5af"
                        fillOpacity={0.85}
                        fontSize={10}
                        fontFamily="ui-monospace, monospace"
                      >
                        {pt.period}
                      </text>
                    </g>
                  );
                })}

                {/* Mode 1: Lexical Mastery & Volume Curves */}
                {viewMode === 'mastery' && (
                  <>
                    {showLearning && (
                      <>
                        <motion.path
                          key={`learn-area-${dayWindow}`}
                          d={d3Model.learningAreaPath}
                          fill={`url(#d3-sky-area-${uid})`}
                          initial={shouldReduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.45, ease: LUXURY_EASE }}
                        />
                        <motion.path
                          key={`learn-line-${dayWindow}`}
                          d={d3Model.learningLinePath}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.4 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.75, ease: LUXURY_EASE }}
                        />
                      </>
                    )}

                    {showMastered && (
                      <>
                        <motion.path
                          key={`mast-area-${dayWindow}`}
                          d={d3Model.masteredAreaPath}
                          fill={`url(#d3-gold-area-${uid})`}
                          initial={shouldReduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, ease: LUXURY_EASE }}
                        />
                        <motion.path
                          key={`mast-line-${dayWindow}`}
                          d={d3Model.masteredLinePath}
                          fill="none"
                          stroke="#f2ca50"
                          strokeWidth={3}
                          strokeLinecap="round"
                          filter={`url(#d3-glow-${uid})`}
                          initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.4 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.85, ease: LUXURY_EASE }}
                        />
                      </>
                    )}

                    {showTotalEnvelope && (
                      <motion.path
                        key={`total-line-${dayWindow}`}
                        d={d3Model.totalEnvelopePath}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        strokeLinecap="round"
                        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.9 }}
                        transition={{ duration: 0.85, delay: 0.1, ease: LUXURY_EASE }}
                      />
                    )}
                  </>
                )}

                {/* Mode 2: SM-2 Retention % Curve + Daily New Words D3 Histogram */}
                {viewMode === 'retention' && (
                  <>
                    {/* Daily New Words Bars */}
                    {parsedSeries.map((pt, i) => {
                      const cx = d3Model.xScale(pt.dateObj);
                      const barH = d3Model.barHeightScale(pt.newWordsAcquired);
                      const isActiveBar = activeIndex === i;
                      return (
                        <motion.rect
                          key={`bar-${pt.dateKey}`}
                          x={cx - barWidth / 2}
                          y={innerHeight - barH}
                          width={barWidth}
                          height={barH}
                          rx={2.5}
                          fill="#f2ca50"
                          fillOpacity={isActiveBar ? 0.65 : 0.24}
                          stroke={isActiveBar ? '#ffe088' : 'none'}
                          strokeWidth={isActiveBar ? 1 : 0}
                          initial={shouldReduceMotion ? false : { scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            duration: 0.45,
                            delay: Math.min(0.3, i * 0.012),
                            ease: LUXURY_EASE
                          }}
                          style={{ transformOrigin: `${cx}px ${innerHeight}px` }}
                        />
                      );
                    })}

                    <motion.path
                      key={`ret-area-${dayWindow}`}
                      d={d3Model.retentionAreaPath}
                      fill={`url(#d3-emerald-area-${uid})`}
                      initial={shouldReduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.45, ease: LUXURY_EASE }}
                    />
                    <motion.path
                      key={`ret-line-${dayWindow}`}
                      d={d3Model.retentionLinePath}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth={3}
                      strokeLinecap="round"
                      filter={`url(#d3-glow-${uid})`}
                      initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.4 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.85, ease: LUXURY_EASE }}
                    />
                  </>
                )}

                {/* Interactive Crosshair & Focal Dots */}
                {activePoint && activePointCoords && (
                  <g pointerEvents="none">
                    <line
                      x1={activePointCoords.cx}
                      x2={activePointCoords.cx}
                      y1={0}
                      y2={innerHeight}
                      stroke="#f2ca50"
                      strokeOpacity={0.48}
                      strokeDasharray="4 4"
                      strokeWidth={1.25}
                    />

                    {viewMode === 'mastery' ? (
                      <>
                        {showTotalEnvelope && (
                          <circle
                            cx={activePointCoords.cx}
                            cy={activePointCoords.totalY}
                            r={4.5}
                            fill="#070e1d"
                            stroke="#a78bfa"
                            strokeWidth={2.2}
                          />
                        )}
                        {showLearning && (
                          <circle
                            cx={activePointCoords.cx}
                            cy={activePointCoords.learningY}
                            r={4.5}
                            fill="#070e1d"
                            stroke="#38bdf8"
                            strokeWidth={2.2}
                          />
                        )}
                        {showMastered && (
                          <>
                            <circle
                              cx={activePointCoords.cx}
                              cy={activePointCoords.masteredY}
                              r={9}
                              fill="#f2ca50"
                              fillOpacity={0.22}
                            />
                            <circle
                              cx={activePointCoords.cx}
                              cy={activePointCoords.masteredY}
                              r={5}
                              fill="#f2ca50"
                              stroke="#070e1d"
                              strokeWidth={2}
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <circle
                          cx={activePointCoords.cx}
                          cy={activePointCoords.retentionY}
                          r={9}
                          fill="#34d399"
                          fillOpacity={0.22}
                        />
                        <circle
                          cx={activePointCoords.cx}
                          cy={activePointCoords.retentionY}
                          r={5}
                          fill="#34d399"
                          stroke="#070e1d"
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </g>
                )}
              </g>
            </svg>

            {/* Floating High-Contrast Interactive D3 Inspection Tooltip */}
            <AnimatePresence>
              {hoveredIndex !== null && activePoint && activePointCoords && (
                <motion.div
                  key="d3-floating-tooltip"
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  style={{
                    left:
                      activePointCoords.cx > innerWidth * 0.56
                        ? `${Math.max(8, MARGIN.left + activePointCoords.cx - 216)}px`
                        : `${Math.min(chartWidth - 216, MARGIN.left + activePointCoords.cx + 14)}px`,
                    top: '10px'
                  }}
                  className="absolute z-20 w-[204px] rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/60 p-3 shadow-2xl backdrop-blur-md pointer-events-none"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono border-b border-[#232a3a] pb-1.5 mb-1.5">
                    <span className="font-bold text-[#f2ca50] truncate">{activePoint.fullLabel}</span>
                    <span className="text-[10px] text-[#99907c] shrink-0">{activePoint.period}</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono tabular-nums">
                    <div className="flex items-center justify-between text-[#f2ca50]">
                      <span>Consolidés :</span>
                      <strong>{activePoint.masteredWords} mots</strong>
                    </div>
                    <div className="flex items-center justify-between text-sky-300">
                      <span>En cours :</span>
                      <strong>{activePoint.learningWords} mots</strong>
                    </div>
                    <div className="flex items-center justify-between text-violet-300">
                      <span>Total actif :</span>
                      <strong>{activePoint.totalActiveWords} mots</strong>
                    </div>
                    <div className="flex items-center justify-between text-emerald-300 pt-1 border-t border-[#232a3a]">
                      <span>Rétention SM-2 :</span>
                      <strong>{activePoint.retentionRate}%</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#d0c5af]">
                      <span>Acquis ce jour :</span>
                      <strong>+{activePoint.newWordsAcquired} mots</strong>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}
      </div>

      {/* Live Accessible Inspection Bar (Always legible even without hover on touch devices) */}
      {activePoint && (
        <div
          aria-live="polite"
          className="px-3.5 py-2.5 rounded-xl bg-[#0c1322]/90 border border-[#232a3a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums relative z-10"
        >
          <div className="flex flex-wrap items-center gap-2 text-[#dce2f8]">
            <span className="font-bold text-[#f2ca50]">{activePoint.fullLabel}</span>
            <span aria-hidden="true" className="text-[#99907c]">
              ·
            </span>
            <span className="text-[#f2ca50]">{activePoint.masteredWords} consolidés</span>
            <span aria-hidden="true" className="text-[#99907c]">
              ·
            </span>
            <span className="text-sky-300">{activePoint.learningWords} en cours</span>
            <span aria-hidden="true" className="text-[#99907c]">
              ·
            </span>
            <span className="text-emerald-300">{activePoint.retentionRate}% rétention</span>
          </div>
          <span className="text-[11px] text-[#d0c5af]/85">
            +{activePoint.newWordsAcquired} acquis ce jour
          </span>
        </div>
      )}
    </section>
  );
};
