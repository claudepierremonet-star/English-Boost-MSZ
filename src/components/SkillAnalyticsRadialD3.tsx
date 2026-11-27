import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, useReducedMotion } from 'framer-motion';
import {
  fetchSkillsRegistry,
  type SkillsRegistrySnapshot,
  type SkillAdminItem
} from '../services/skillsService';
import type { UserProfile } from '../firebase/types';
import {
  computeSkillMasteryCorrelationSnapshot,
  type SkillCorrelationNode,
  type SkillHistoryPointInput
} from '../utils/masterSkillProgress';
import { ChartSectionSkeleton } from './SkeletonLoaders';

export interface SkillAnalyticsRadialD3Props {
  user: UserProfile;
  avgScore?: number;
  scoreData?: SkillHistoryPointInput[];
  onOpenMasterSkills?: () => void;
}

type RadialMode = 'mastery-correlation' | 'pearson-r';

const BAND_COLORS: Record<
  SkillCorrelationNode['correlationBand'],
  { stroke: string; fill: string; textClass: string; label: string }
> = {
  'strong-positive': {
    stroke: '#34d399',
    fill: 'rgba(52, 211, 153, 0.72)',
    textClass: 'text-emerald-300',
    label: 'Forte synergie (r ≥ 0,70)'
  },
  moderate: {
    stroke: '#f2ca50',
    fill: 'rgba(242, 202, 80, 0.74)',
    textClass: 'text-[#f2ca50]',
    label: 'Corrélation modérée (0,30 ≤ r < 0,70)'
  },
  divergent: {
    stroke: '#38bdf8',
    fill: 'rgba(56, 189, 248, 0.68)',
    textClass: 'text-sky-300',
    label: 'Trajectoire indépendante (r < 0,30)'
  },
  inactive: {
    stroke: '#4b5563',
    fill: 'rgba(75, 85, 99, 0.28)',
    textClass: 'text-[#99907c]',
    label: 'Compétence désactivée'
  }
};

export const SkillAnalyticsRadialD3: React.FC<SkillAnalyticsRadialD3Props> = ({
  user,
  avgScore,
  scoreData,
  onOpenMasterSkills
}) => {
  const uid = useId().replace(/:/g, '');
  const shouldReduceMotion = useReducedMotion();
  const radialWrapRef = useRef<HTMLDivElement | null>(null);

  const [snapshot, setSnapshot] = useState<SkillsRegistrySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [radialMode, setRadialMode] = useState<RadialMode>('mastery-correlation');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(480);

  const loadRegistry = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const reg = await fetchSkillsRegistry();
      setSnapshot(reg);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les 20 compétences depuis skills/index.json.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  useEffect(() => {
    const el = radialWrapRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 180) {
        setContainerWidth(Math.round(rect.width));
      }
    };
    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoading]);

  const masterSkills: SkillAdminItem[] = useMemo(() => {
    if (!snapshot) return [];
    const masters = snapshot.skills.filter((s) => s.tier === 'master');
    return masters.length > 0 ? masters : snapshot.skills;
  }, [snapshot]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    snapshot?.categories.forEach((cat) => map.set(cat.id, cat.label));
    return map;
  }, [snapshot]);

  const correlationSummary = useMemo(() => {
    return computeSkillMasteryCorrelationSnapshot(masterSkills, user, avgScore, scoreData);
  }, [masterSkills, user, avgScore, scoreData]);

  const visibleNodes = useMemo(() => {
    return correlationSummary.nodes.filter((node) => {
      if (activeOnly && !node.isActive) return false;
      if (selectedCategory !== 'all' && node.category !== selectedCategory) return false;
      return true;
    });
  }, [correlationSummary.nodes, activeOnly, selectedCategory]);

  useEffect(() => {
    if (visibleNodes.length === 0) return;
    if (!selectedSkillId || !visibleNodes.some((n) => n.skillId === selectedSkillId)) {
      const preferred = visibleNodes.find((n) => n.isActive) ?? visibleNodes[0];
      setSelectedSkillId(preferred.skillId);
    }
  }, [visibleNodes, selectedSkillId]);

  const focusedNode = useMemo(() => {
    const targetId = hoveredSkillId ?? selectedSkillId;
    return visibleNodes.find((n) => n.skillId === targetId) ?? visibleNodes[0] ?? null;
  }, [visibleNodes, hoveredSkillId, selectedSkillId]);

  // SVG Geometry & D3 Radial Scales
  const svgSize = Math.min(540, Math.max(320, containerWidth));
  const innerRadius = Math.round(svgSize * 0.165);
  const outerRadius = Math.round(svgSize * 0.36);
  const labelRadius = outerRadius + 16;

  const d3Radial = useMemo(() => {
    const count = visibleNodes.length;
    if (count === 0) return null;

    const angleScale = d3
      .scaleBand<string>()
      .domain(visibleNodes.map((n) => n.skillId))
      .range([0, 2 * Math.PI])
      .paddingInner(0.14)
      .paddingOuter(0.06);

    const domainMin = radialMode === 'mastery-correlation' ? 0 : -1;
    const domainMax = radialMode === 'mastery-correlation' ? 100 : 1;

    const radiusScale = d3
      .scaleRadial<number>()
      .domain([domainMin, domainMax])
      .range([innerRadius, outerRadius]);

    const getMetricValue = (n: SkillCorrelationNode) => {
      if (!n.isActive) return radialMode === 'mastery-correlation' ? 0 : -1;
      return radialMode === 'mastery-correlation' ? n.skillPercentage : n.pearsonR;
    };

    const barArcGen = d3.arc<SkillCorrelationNode>();

    // Radial bars for each skill
    const spokeItems = visibleNodes.map((node, index) => {
      const startAngle = angleScale(node.skillId) ?? 0;
      const bw = angleScale.bandwidth();
      const endAngle = startAngle + bw;
      const midAngle = startAngle + bw / 2;
      const val = getMetricValue(node);
      const rOuter = node.isActive ? Math.max(innerRadius + 4, radiusScale(val)) : innerRadius + 6;

      const arcPath =
        barArcGen({
          ...node,
          innerRadius: innerRadius + 2,
          outerRadius: rOuter,
          startAngle,
          endAngle,
          padAngle: 0.015
        } as unknown as SkillCorrelationNode & d3.DefaultArcObject) ?? '';

      // Track background arc
      const trackPath =
        barArcGen({
          ...node,
          innerRadius: innerRadius + 2,
          outerRadius,
          startAngle,
          endAngle,
          padAngle: 0.015
        } as unknown as SkillCorrelationNode & d3.DefaultArcObject) ?? '';

      // SVG coordinates (0 angle = 12 o'clock)
      const tipX = Math.sin(midAngle) * rOuter;
      const tipY = -Math.cos(midAngle) * rOuter;
      const labelX = Math.sin(midAngle) * labelRadius;
      const labelY = -Math.cos(midAngle) * labelRadius;
      const deg = (midAngle * 180) / Math.PI;
      const isLeftSide = midAngle > Math.PI;

      return {
        node,
        index,
        midAngle,
        rOuter,
        arcPath,
        trackPath,
        tipX,
        tipY,
        labelX,
        labelY,
        deg,
        isLeftSide
      };
    });

    // Closed correlation polygon connecting active nodes
    const activeNodesForPoly = spokeItems.filter((s) => s.node.isActive);
    const polyPath =
      activeNodesForPoly.length >= 3
        ? d3
            .lineRadial<(typeof spokeItems)[number]>()
            .angle((d) => d.midAngle)
            .radius((d) => d.rOuter)
            .curve(d3.curveCardinalClosed.tension(0.45))(activeNodesForPoly) ?? ''
        : '';

    // Concentric reference rings
    const ringValues =
      radialMode === 'mastery-correlation' ? [25, 50, 75, 100] : [-0.5, 0, 0.5, 1.0];
    const rings = ringValues.map((v) => ({
      value: v,
      label: radialMode === 'mastery-correlation' ? `${v}%` : `r=${v.toFixed(1)}`,
      radius: radiusScale(v)
    }));

    const globalMasteryRadius =
      radialMode === 'mastery-correlation'
        ? radiusScale(correlationSummary.globalMasteryPct)
        : radiusScale(0.7);

    // Outer category arcs grouping consecutive skills by category
    const categorySectors: Array<{
      category: string;
      label: string;
      path: string;
      midAngle: number;
    }> = [];
    let groupStart = 0;
    while (groupStart < spokeItems.length) {
      const cat = spokeItems[groupStart].node.category;
      let groupEnd = groupStart;
      while (groupEnd + 1 < spokeItems.length && spokeItems[groupEnd + 1].node.category === cat) {
        groupEnd++;
      }
      const sAngle = angleScale(spokeItems[groupStart].node.skillId) ?? 0;
      const eAngle =
        (angleScale(spokeItems[groupEnd].node.skillId) ?? 0) + angleScale.bandwidth();
      const sectorPath =
        d3.arc()({
          innerRadius: outerRadius + 4,
          outerRadius: outerRadius + 8,
          startAngle: sAngle,
          endAngle: eAngle
        }) ?? '';
      categorySectors.push({
        category: cat,
        label: categoryMap.get(cat) || cat,
        path: sectorPath,
        midAngle: (sAngle + eAngle) / 2
      });
      groupStart = groupEnd + 1;
    }

    return {
      spokeItems,
      polyPath,
      rings,
      globalMasteryRadius,
      categorySectors
    };
  }, [
    visibleNodes,
    radialMode,
    innerRadius,
    outerRadius,
    labelRadius,
    correlationSummary.globalMasteryPct,
    categoryMap
  ]);

  const topSynergies = useMemo(() => {
    return [...correlationSummary.nodes]
      .filter((n) => n.isActive)
      .sort((a, b) => b.pearsonR - a.pearsonR || b.skillPercentage - a.skillPercentage)
      .slice(0, 3);
  }, [correlationSummary.nodes]);

  const topGaps = useMemo(() => {
    return [...correlationSummary.nodes]
      .filter((n) => n.isActive)
      .sort((a, b) => a.alignmentGap - b.alignmentGap)
      .slice(0, 3);
  }, [correlationSummary.nodes]);

  if (isLoading) {
    return (
      <section aria-label="Chargement de Skill Analytics">
        <ChartSectionSkeleton heightClass="h-80" showKpis kpiCount={4} label="Calcul de la matrice radiale D3" />
      </section>
    );
  }

  if (loadError || !snapshot) {
    return (
      <section
        role="alert"
        className="w-full rounded-2xl luxury-card-surface border border-rose-500/40 p-6 text-center space-y-3"
      >
        <span className="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
        <h3 className="font-serif text-lg font-bold text-[#dce2f8]">
          Module Skill Analytics indisponible
        </h3>
        <p className="text-xs text-[#d0c5af]">{loadError}</p>
        <button
          type="button"
          onClick={loadRegistry}
          className="min-h-[40px] px-4 py-2 rounded-lg luxury-btn-gold text-xs font-bold cursor-pointer"
        >
          Réessayer
        </button>
      </section>
    );
  }

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Skill Analytics : Corrélation radiale D3 des 20 compétences actives"
      data-testid="skill-analytics-module"
      className="w-full rounded-2xl luxury-card-surface p-5 sm:p-6 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#d4c78f] font-medium">
            <span>Skill Analytics</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#f2ca50]">D3 Radial Correlation</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[#d0c5af]">
              {correlationSummary.activeCount} / {correlationSummary.totalCount} compétences actives
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] tracking-tight">
            Corrélation Radiale · Compétences Actives &amp; Maîtrise Globale
          </h3>
          <p className="text-xs sm:text-[13px] text-[#d0c5af]/85 max-w-3xl leading-relaxed">
            Visualisez l&apos;alignement statistique de vos {correlationSummary.totalCount} compétences avec votre maîtrise globale ({correlationSummary.globalMasteryPct}%). L&apos;anneau doré pointillé marque votre seuil global actuel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenMasterSkills && (
            <button
              type="button"
              onClick={onOpenMasterSkills}
              className="luxury-btn-amber-soft min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-base">checklist</span>
              <span>Gérer les Skills</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadRegistry}
            className="luxury-btn-surface min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
          >
            <span className="material-symbols-outlined text-base text-[#f2ca50]">refresh</span>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* 4-Metric Hairline Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#232a3a] rounded-xl luxury-hairline-panel font-mono tabular-nums">
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">Maîtrise globale ({user.level})</span>
          <span className="text-xl font-bold text-[#f2ca50]">{correlationSummary.globalMasteryPct}%</span>
          <span className="text-[11px] font-sans text-[#99907c]">Anneau de référence central</span>
        </div>
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">Moyenne cohortes actives</span>
          <span className="text-xl font-bold text-[#dce2f8]">{correlationSummary.meanActiveSkillPct}%</span>
          <span className="text-[11px] font-sans text-[#99907c]">
            {correlationSummary.activeCount} compétence(s) en contexte
          </span>
        </div>
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">Corrélation moyenne (Pearson)</span>
          <span className="text-xl font-bold text-emerald-400">
            r = {correlationSummary.meanPearsonR >= 0 ? `+${correlationSummary.meanPearsonR.toFixed(2)}` : correlationSummary.meanPearsonR.toFixed(2)}
          </span>
          <span className="text-[11px] font-sans text-[#99907c]">Synchronie sur 7 jours</span>
        </div>
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">Écart net (Cohortes − Global)</span>
          <span
            className={`text-xl font-bold ${
              correlationSummary.meanActiveSkillPct - correlationSummary.globalMasteryPct >= 0
                ? 'text-emerald-300'
                : 'text-sky-300'
            }`}
          >
            {correlationSummary.meanActiveSkillPct - correlationSummary.globalMasteryPct >= 0 ? '+' : ''}
            {correlationSummary.meanActiveSkillPct - correlationSummary.globalMasteryPct} pts
          </span>
          <span className="text-[11px] font-sans text-[#99907c]">
            Provenance : {correlationSummary.dataProvenance === 'firestore' ? 'Firestore' : correlationSummary.dataProvenance === 'indexeddb' ? 'IndexedDB' : 'Baseline'}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Mode du graphique radial">
          <button
            type="button"
            onClick={() => setRadialMode('mastery-correlation')}
            aria-pressed={radialMode === 'mastery-correlation'}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              radialMode === 'mastery-correlation' ? 'luxury-btn-gold font-bold' : 'luxury-btn-surface'
            }`}
          >
            Rayon = Maîtrise (%)
          </button>
          <button
            type="button"
            onClick={() => setRadialMode('pearson-r')}
            aria-pressed={radialMode === 'pearson-r'}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              radialMode === 'pearson-r' ? 'luxury-btn-gold font-bold' : 'luxury-btn-surface'
            }`}
          >
            Rayon = Corrélation (r)
          </button>
          <button
            type="button"
            onClick={() => setActiveOnly((prev) => !prev)}
            aria-pressed={activeOnly}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              activeOnly ? 'luxury-btn-emerald' : 'luxury-btn-surface'
            }`}
          >
            {activeOnly ? 'Actives uniquement' : 'Toutes les 20'}
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Filtrer la roue radiale par catégorie">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all' ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
            }`}
          >
            Toutes ({correlationSummary.totalCount})
          </button>
          {snapshot.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.id ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Interactive D3 Radial Graph + Correlation Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: D3 Radial SVG Canvas */}
        <div
          ref={radialWrapRef}
          className="xl:col-span-7 rounded-xl bg-[#090f1d] border border-[#232a3a] p-4 flex flex-col items-center justify-center relative"
        >
          {d3Radial ? (
            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
              role="img"
              aria-label="Graphique radial D3 montrant la corrélation des 20 compétences actives avec la maîtrise globale"
              className="w-full max-w-[540px] h-auto select-none overflow-visible"
            >
              <defs>
                <radialGradient id={`radial-hub-glow-${uid}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(242, 202, 80, 0.22)" />
                  <stop offset="100%" stopColor="rgba(7, 14, 29, 0)" />
                </radialGradient>
                <linearGradient id={`radial-poly-fill-${uid}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(52, 211, 153, 0.14)" />
                  <stop offset="100%" stopColor="rgba(242, 202, 80, 0.16)" />
                </linearGradient>
              </defs>

              <circle cx={0} cy={0} r={outerRadius + 10} fill={`url(#radial-hub-glow-${uid})`} />

              {/* Concentric Reference Rings */}
              {d3Radial.rings.map((ring) => (
                <g key={ring.value}>
                  <circle
                    cx={0}
                    cy={0}
                    r={ring.radius}
                    fill="none"
                    stroke="#1e2638"
                    strokeWidth={1}
                    strokeDasharray={ring.value === 0 ? undefined : '2 3'}
                  />
                  <text
                    x={4}
                    y={-ring.radius + 11}
                    className="fill-[#99907c] text-[9px] font-mono tabular-nums"
                  >
                    {ring.label}
                  </text>
                </g>
              ))}

              {/* Global Mastery Benchmark Ring */}
              <circle
                cx={0}
                cy={0}
                r={d3Radial.globalMasteryRadius}
                fill="none"
                stroke="#f2ca50"
                strokeWidth={1.6}
                strokeDasharray="5 4"
                opacity={0.78}
              />

              {/* Outer Category Sector Arcs */}
              {d3Radial.categorySectors.map((sector) => (
                <path
                  key={sector.category}
                  d={sector.path}
                  fill="#2e3852"
                  opacity={0.75}
                >
                  <title>{sector.label}</title>
                </path>
              ))}

              {/* Dynamic Correlation Polygon connecting active skills */}
              {d3Radial.polyPath && (
                <motion.path
                  d={d3Radial.polyPath}
                  fill={`url(#radial-poly-fill-${uid})`}
                  stroke="#d4c78f"
                  strokeWidth={1.35}
                  strokeOpacity={0.65}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45 }}
                />
              )}

              {/* 20 Radial Skill Spokes & Arc Bars */}
              {d3Radial.spokeItems.map((item) => {
                const { node, arcPath, trackPath, tipX, tipY, labelX, labelY, isLeftSide, midAngle } =
                  item;
                const band = BAND_COLORS[node.correlationBand];
                const isFocused = focusedNode?.skillId === node.skillId;
                const shortLabel = `${String(item.index + 1).padStart(2, '0')} ${
                  node.title.length > 14 ? `${node.title.slice(0, 13)}…` : node.title
                }`;
                const rotDeg = ((midAngle * 180) / Math.PI) - 90 + (isLeftSide ? 180 : 0);

                return (
                  <g
                    key={node.skillId}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.title} : ${
                      node.isActive
                        ? `${node.skillPercentage}% maîtrise, corrélation r=${node.pearsonR}`
                        : 'désactivée'
                    }`}
                    onMouseEnter={() => setHoveredSkillId(node.skillId)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                    onFocus={() => setHoveredSkillId(node.skillId)}
                    onBlur={() => setHoveredSkillId(null)}
                    onClick={() => setSelectedSkillId(node.skillId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSkillId(node.skillId);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <path d={trackPath} fill="#121828" opacity={0.6} />

                    <path
                      d={arcPath}
                      fill={band.fill}
                      stroke={isFocused ? '#ffe8a3' : band.stroke}
                      strokeWidth={isFocused ? 1.8 : 0.8}
                      opacity={node.isActive ? (isFocused ? 1 : 0.86) : 0.35}
                    />

                    {node.isActive && (
                      <circle
                        cx={tipX}
                        cy={tipY}
                        r={isFocused ? 4.5 : Math.max(2.3, Math.min(4, 1.8 + node.weightInfluencePct * 0.25))}
                        fill={isFocused ? '#ffe8a3' : band.stroke}
                        stroke="#090f1d"
                        strokeWidth={1.2}
                      />
                    )}

                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor={isLeftSide ? 'end' : 'start'}
                      dominantBaseline="central"
                      transform={`rotate(${rotDeg}, ${labelX}, ${labelY})`}
                      className={`text-[9.5px] font-mono ${
                        isFocused
                          ? 'fill-[#f2ca50] font-bold'
                          : node.isActive
                          ? 'fill-[#dce2f8]'
                          : 'fill-[#7c7464]'
                      }`}
                    >
                      {shortLabel}
                    </text>
                  </g>
                );
              })}

              {/* Central Hub Display */}
              <circle
                cx={0}
                cy={0}
                r={innerRadius - 3}
                fill="#0c1322"
                stroke="#2e3852"
                strokeWidth={1.5}
              />

              {focusedNode ? (
                <g textAnchor="middle">
                  <text y={-14} className="fill-[#d4c78f] text-[9px] font-sans uppercase tracking-wider">
                    {focusedNode.isActive ? 'Skill ciblée' : 'Inactive'}
                  </text>
                  <text y={8} className="fill-[#f2ca50] text-[22px] font-mono font-bold tabular-nums">
                    {focusedNode.isActive ? `${focusedNode.skillPercentage}%` : '—'}
                  </text>
                  <text y={25} className="fill-[#dce2f8] text-[10px] font-mono tabular-nums">
                    {focusedNode.isActive
                      ? `r = ${focusedNode.pearsonR >= 0 ? `+${focusedNode.pearsonR.toFixed(2)}` : focusedNode.pearsonR.toFixed(2)}`
                      : 'Hors contexte'}
                  </text>
                </g>
              ) : (
                <g textAnchor="middle">
                  <text y={-10} className="fill-[#d4c78f] text-[9px]">
                    Maîtrise globale
                  </text>
                  <text y={12} className="fill-[#f2ca50] text-[22px] font-mono font-bold">
                    {correlationSummary.globalMasteryPct}%
                  </text>
                </g>
              )}
            </svg>
          ) : (
            <p className="text-xs text-[#99907c] py-12">
              Aucune compétence ne correspond aux filtres sélectionnés.
            </p>
          )}

          {/* Color & Threshold Legend */}
          <div className="w-full pt-3 mt-2 border-t border-[#232a3a] flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-[#d0c5af]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Synergie forte (r ≥ 0,70)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50]" />
              <span>Modérée (0,30–0,69)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Indépendante (&lt; 0,30)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-[#f2ca50]" />
              <span>Cible globale ({correlationSummary.globalMasteryPct}%)</span>
            </span>
          </div>
        </div>

        {/* Right: Selected Skill Correlation Deep Inspector + Synergies */}
        <div className="xl:col-span-5 space-y-4">
          {focusedNode && (
            <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] text-[#d4c78f] font-medium">
                    {categoryMap.get(focusedNode.category) || focusedNode.category} ·{' '}
                    <span className="font-mono text-[#99907c]">{focusedNode.name}</span>
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#dce2f8] truncate">
                    {focusedNode.title}
                  </h4>
                </div>
                <span
                  className={`text-xs font-mono font-bold shrink-0 ${
                    BAND_COLORS[focusedNode.correlationBand].textClass
                  }`}
                >
                  {focusedNode.isActive ? `${focusedNode.skillPercentage}%` : 'Désactivée'}
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#232a3a] rounded-lg bg-[#070e1d] border border-[#232a3a] font-mono tabular-nums">
                <div className="p-2.5 flex flex-col">
                  <span className="text-[10px] font-sans text-[#99907c]">Pearson (r)</span>
                  <span className={`text-sm font-bold ${BAND_COLORS[focusedNode.correlationBand].textClass}`}>
                    {focusedNode.isActive
                      ? focusedNode.pearsonR >= 0
                        ? `+${focusedNode.pearsonR.toFixed(2)}`
                        : focusedNode.pearsonR.toFixed(2)
                      : '—'}
                  </span>
                </div>
                <div className="p-2.5 flex flex-col">
                  <span className="text-[10px] font-sans text-[#99907c]">Écart / Global</span>
                  <span
                    className={`text-sm font-bold ${
                      !focusedNode.isActive
                        ? 'text-[#99907c]'
                        : focusedNode.alignmentGap >= 0
                        ? 'text-emerald-300'
                        : 'text-sky-300'
                    }`}
                  >
                    {focusedNode.isActive
                      ? `${focusedNode.alignmentGap >= 0 ? '+' : ''}${focusedNode.alignmentGap} pts`
                      : '—'}
                  </span>
                </div>
                <div className="p-2.5 flex flex-col">
                  <span className="text-[10px] font-sans text-[#99907c]">Poids cohorte</span>
                  <span className="text-sm font-bold text-[#dce2f8]">
                    {focusedNode.isActive ? `${focusedNode.weightInfluencePct.toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#d0c5af] flex items-center justify-between">
                <span>{BAND_COLORS[focusedNode.correlationBand].label}</span>
                {focusedNode.isActive && (
                  <span className="font-mono tabular-nums text-[#99907c]">
                    7j : {focusedNode.delta7d >= 0 ? `+${focusedNode.delta7d}` : focusedNode.delta7d} pts
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Top Positive Synergies & Gaps */}
          <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#dce2f8] uppercase tracking-wider">
              Plus fortes corrélations avec votre maîtrise
            </h4>
            <div className="divide-y divide-[#232a3a]">
              {topSynergies.map((item) => (
                <button
                  key={item.skillId}
                  type="button"
                  onClick={() => setSelectedSkillId(item.skillId)}
                  className="w-full py-2 flex items-center justify-between gap-2 text-left hover:bg-[#151b2b]/60 px-1.5 rounded transition-colors cursor-pointer"
                >
                  <span className="text-xs text-[#dce2f8] truncate">{item.title}</span>
                  <span className="font-mono text-xs tabular-nums text-emerald-300 shrink-0">
                    r = +{item.pearsonR.toFixed(2)} · {item.skillPercentage}%
                  </span>
                </button>
              ))}
              {topSynergies.length === 0 && (
                <p className="text-xs text-[#99907c] py-2">
                  Activez au moins une compétence dans Master Skills pour observer la corrélation.
                </p>
              )}
            </div>
          </div>

          {topGaps.length > 0 && (
            <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#dce2f8] uppercase tracking-wider">
                Compétences prioritaires sous le seuil global ({correlationSummary.globalMasteryPct}%)
              </h4>
              <div className="divide-y divide-[#232a3a]">
                {topGaps.map((item) => (
                  <button
                    key={item.skillId}
                    type="button"
                    onClick={() => setSelectedSkillId(item.skillId)}
                    className="w-full py-2 flex items-center justify-between gap-2 text-left hover:bg-[#151b2b]/60 px-1.5 rounded transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-[#dce2f8] truncate">{item.title}</span>
                    <span className="font-mono text-xs tabular-nums text-sky-300 shrink-0">
                      {item.alignmentGap >= 0 ? `+${item.alignmentGap}` : item.alignmentGap} pts · {item.skillPercentage}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Data-Analytics Methodological Footnote */}
      <p className="text-[11px] text-[#99907c] leading-relaxed flex items-start gap-1.5 pt-1 border-t border-[#232a3a]">
        <span className="material-symbols-outlined text-sm text-[#d4c78f] shrink-0 mt-0.5">
          analytics
        </span>
        <span>{correlationSummary.methodologyNote}</span>
      </p>
    </motion.section>
  );
};
