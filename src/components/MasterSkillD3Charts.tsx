import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, useReducedMotion } from 'framer-motion';
import type { SkillAdminItem } from '../services/skillsService';
import type { IndividualSkillAnalytics } from '../utils/masterSkillProgress';

const TONE_PALETTE: Record<
  IndividualSkillAnalytics['toneClass'],
  { stroke: string; fillStart: string; fillEnd: string; badgeText: string; bar: string }
> = {
  emerald: {
    stroke: '#34d399',
    fillStart: 'rgba(52, 211, 153, 0.32)',
    fillEnd: 'rgba(52, 211, 153, 0.02)',
    badgeText: 'text-emerald-300',
    bar: '#34d399'
  },
  gold: {
    stroke: '#f2ca50',
    fillStart: 'rgba(242, 202, 80, 0.34)',
    fillEnd: 'rgba(242, 202, 80, 0.02)',
    badgeText: 'text-[#f2ca50]',
    bar: '#f2ca50'
  },
  sky: {
    stroke: '#38bdf8',
    fillStart: 'rgba(56, 189, 248, 0.3)',
    fillEnd: 'rgba(56, 189, 248, 0.02)',
    badgeText: 'text-sky-300',
    bar: '#38bdf8'
  }
};

export interface SkillSparklineD3Props {
  skillTitle: string;
  analytics: IndividualSkillAnalytics;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * Compact D3 SVG sparkline rendered directly inside each individual Master Skill row.
 */
export const SkillSparklineD3: React.FC<SkillSparklineD3Props> = ({
  skillTitle,
  analytics,
  isSelected = false,
  onSelect
}) => {
  const uid = useId().replace(/:/g, '');
  const width = 136;
  const height = 38;
  const padX = 6;
  const padY = 5;

  const palette = TONE_PALETTE[analytics.toneClass];

  const model = useMemo(() => {
    const pts = analytics.series;
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, pts.length - 1)])
      .range([padX, width - padX]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - padY, padY]);

    const linePath =
      d3
        .line<(typeof pts)[number]>()
        .x((d) => xScale(d.dayIndex))
        .y((d) => yScale(d.percentage))
        .curve(d3.curveMonotoneX)(pts) ?? '';

    const areaPath =
      d3
        .area<(typeof pts)[number]>()
        .x((d) => xScale(d.dayIndex))
        .y0(height - padY)
        .y1((d) => yScale(d.percentage))
        .curve(d3.curveMonotoneX)(pts) ?? '';

    const lastPt = pts[pts.length - 1];
    const targetY = yScale(analytics.targetPercentage);

    return {
      linePath,
      areaPath,
      targetY,
      lastX: lastPt ? xScale(lastPt.dayIndex) : width - padX,
      lastY: lastPt ? yScale(lastPt.percentage) : height - padY
    };
  }, [analytics.series, analytics.targetPercentage]);

  const deltaLabel =
    !analytics.isActive
      ? 'Inactive'
      : analytics.delta7d > 0
      ? `+${analytics.delta7d} pts`
      : `${analytics.delta7d} pts`;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`skill-sparkline-${analytics.skillId}`}
      aria-label={`Visualiser la courbe D3 de ${skillTitle} (${
        analytics.isActive ? `${analytics.currentPercentage}%, ${deltaLabel} sur 7 jours` : 'désactivée'
      })`}
      className={`group flex items-center gap-2 rounded-lg px-2 py-1 border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
        isSelected
          ? 'bg-[#191f2f] border-[#f2ca50]/60'
          : 'bg-[#0c1322]/90 border-[#232a3a] hover:border-[#4d4635]'
      }`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0 overflow-visible"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`spark-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={analytics.isActive ? palette.fillStart : 'rgba(153,144,124,0.18)'} />
            <stop offset="100%" stopColor={analytics.isActive ? palette.fillEnd : 'rgba(153,144,124,0.01)'} />
          </linearGradient>
        </defs>

        {/* 85% excellence benchmark line */}
        <line
          x1={padX}
          x2={width - padX}
          y1={model.targetY}
          y2={model.targetY}
          stroke="#4d4635"
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.65}
        />

        {analytics.isActive ? (
          <>
            <path d={model.areaPath} fill={`url(#spark-grad-${uid})`} />
            <path
              d={model.linePath}
              fill="none"
              stroke={palette.stroke}
              strokeWidth={1.75}
              strokeLinecap="round"
            />
            <circle
              cx={model.lastX}
              cy={model.lastY}
              r={3}
              fill={palette.stroke}
              stroke="#0c1322"
              strokeWidth={1.25}
            />
          </>
        ) : (
          <line
            x1={padX}
            x2={width - padX}
            y1={height - padY}
            y2={height - padY}
            stroke="#5c5649"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      <div className="hidden xl:flex flex-col items-end font-mono tabular-nums leading-tight pr-0.5">
        <span
          className={`text-[10px] font-bold ${
            analytics.isActive ? palette.badgeText : 'text-[#99907c]'
          }`}
        >
          {deltaLabel}
        </span>
        <span className="text-[10px] text-[#99907c]">7j D3</span>
      </div>
    </button>
  );
};

export interface SkillIndividualDetailD3ChartProps {
  skill: SkillAdminItem;
  categoryLabel: string;
  analytics: IndividualSkillAnalytics;
  compact?: boolean;
  onPrevSkill?: () => void;
  onNextSkill?: () => void;
  currentRankLabel?: string;
}

/**
 * Full individual D3 mastery panel for a single Master Skill:
 * 1) 7-day mastery area/line trajectory chart (D3)
 * 2) Weighted factor contribution bar chart (D3)
 */
export const SkillIndividualDetailD3Chart: React.FC<SkillIndividualDetailD3ChartProps> = ({
  skill,
  categoryLabel,
  analytics,
  compact = false,
  onPrevSkill,
  onNextSkill,
  currentRankLabel
}) => {
  const uid = useId().replace(/:/g, '');
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [chartWidth, setChartWidth] = useState<number>(460);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null);

  useEffect(() => {
    setHoveredIdx(null);
    setPinnedIdx(null);
  }, [skill.id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 140) {
        setChartWidth(Math.round(rect.width));
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartHeight = compact ? 168 : 206;
  const margin = { top: 16, right: 16, bottom: 28, left: 38 };
  const innerWidth = Math.max(140, chartWidth - margin.left - margin.right);
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const palette = TONE_PALETTE[analytics.toneClass];

  const d3LineModel = useMemo(() => {
    const pts = analytics.series;
    const xScale = d3
      .scalePoint<string>()
      .domain(pts.map((p) => p.dayLabel))
      .range([0, innerWidth])
      .padding(0.15);

    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
    const yTicks = [0, 25, 50, 75, 100];

    const xPos = (p: (typeof pts)[number]) => xScale(p.dayLabel) ?? 0;

    const linePath =
      d3
        .line<(typeof pts)[number]>()
        .x(xPos)
        .y((d) => yScale(d.percentage))
        .curve(d3.curveMonotoneX)(pts) ?? '';

    const areaPath =
      d3
        .area<(typeof pts)[number]>()
        .x(xPos)
        .y0(innerHeight)
        .y1((d) => yScale(d.percentage))
        .curve(d3.curveMonotoneX)(pts) ?? '';

    return {
      xScale,
      yScale,
      yTicks,
      xPos,
      linePath,
      areaPath,
      targetY: yScale(analytics.targetPercentage)
    };
  }, [analytics.series, analytics.targetPercentage, innerWidth, innerHeight]);

  // Factor Horizontal Bar Chart D3 model
  const factorBarWidth = Math.min(360, Math.max(180, chartWidth));
  const factorHeight = 112;
  const factorMargin = { top: 6, right: 44, bottom: 6, left: 4 };
  const factorInnerW = Math.max(100, factorBarWidth - factorMargin.left - factorMargin.right);
  const factorInnerH = factorHeight - factorMargin.top - factorMargin.bottom;

  const d3FactorModel = useMemo(() => {
    const yBand = d3
      .scaleBand<string>()
      .domain(analytics.factors.map((f) => f.id))
      .range([0, factorInnerH])
      .padding(0.32);

    const xLinear = d3.scaleLinear().domain([0, 100]).range([0, factorInnerW]);

    return { yBand, xLinear };
  }, [analytics.factors, factorInnerH, factorInnerW]);

  const activeIdx =
    hoveredIdx !== null ? hoveredIdx : pinnedIdx !== null ? pinnedIdx : analytics.series.length - 1;
  const activePoint = analytics.series[Math.max(0, Math.min(analytics.series.length - 1, activeIdx))];

  const handleSvgPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || analytics.series.length === 0) return;
    const [px] = d3.pointer(event, svgRef.current);
    const localX = px - margin.left;
    let closestIdx = 0;
    let minDist = Infinity;
    analytics.series.forEach((pt, idx) => {
      const dist = Math.abs(d3LineModel.xPos(pt) - localX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoveredIdx(closestIdx);
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || analytics.series.length === 0) return;
    const [px] = d3.pointer(event, svgRef.current);
    const localX = px - margin.left;
    let closestIdx = 0;
    let minDist = Infinity;
    analytics.series.forEach((pt, idx) => {
      const dist = Math.abs(d3LineModel.xPos(pt) - localX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setPinnedIdx((prev) => (prev === closestIdx ? null : closestIdx));
  };

  const deltaSign = analytics.delta7d > 0 ? `+${analytics.delta7d}` : `${analytics.delta7d}`;

  return (
    <div
      data-testid={`skill-d3-detail-${skill.id}`}
      className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#d4c78f]">
            <span>Analyse individuelle D3</span>
            <span aria-hidden="true">·</span>
            <span>{categoryLabel}</span>
            {currentRankLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#99907c]">{currentRankLabel}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8] truncate">
              {skill.title}
            </h4>
            <span className="font-mono text-xs text-[#99907c]">{skill.name}</span>
          </div>
        </div>

        {(onPrevSkill || onNextSkill) && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onPrevSkill}
              aria-label="Skill précédente"
              className="min-h-[34px] px-2.5 py-1 rounded-lg luxury-btn-surface text-xs font-semibold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              <span>Préc.</span>
            </button>
            <button
              type="button"
              onClick={onNextSkill}
              aria-label="Skill suivante"
              className="min-h-[34px] px-2.5 py-1 rounded-lg luxury-btn-surface text-xs font-semibold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span>Suiv.</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#232a3a] rounded-lg bg-[#070e1d] border border-[#232a3a] font-mono tabular-nums">
        <div className="p-2.5 flex flex-col">
          <span className="text-[10px] font-sans text-[#99907c]">Maîtrise actuelle</span>
          <span className={`text-base font-bold ${analytics.isActive ? palette.badgeText : 'text-[#99907c]'}`}>
            {analytics.isActive ? `${analytics.currentPercentage}%` : 'Désactivée'}
          </span>
        </div>
        <div className="p-2.5 flex flex-col">
          <span className="text-[10px] font-sans text-[#99907c]">Tendance 7 jours</span>
          <span
            className={`text-base font-bold ${
              !analytics.isActive
                ? 'text-[#99907c]'
                : analytics.delta7d >= 0
                ? 'text-emerald-300'
                : 'text-rose-300'
            }`}
          >
            {analytics.isActive ? `${deltaSign} pts` : '—'}
          </span>
        </div>
        <div className="p-2.5 flex flex-col">
          <span className="text-[10px] font-sans text-[#99907c]">Pic sur 7 jours</span>
          <span className="text-base font-bold text-[#dce2f8]">
            {analytics.isActive ? `${analytics.peakPercentage}%` : '—'}
          </span>
        </div>
        <div className="p-2.5 flex flex-col">
          <span className="text-[10px] font-sans text-[#99907c]">Palier cible</span>
          <span className="text-base font-bold text-[#d4c78f]">{analytics.targetPercentage}%</span>
        </div>
      </div>

      {/* Main D3 7-day curve + Factor Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-7 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-[#d0c5af] font-medium">
              Courbe de progression (7 jours) ·{' '}
              <span className="text-[#99907c]">{analytics.basisLabel}</span>
            </span>
            {activePoint && (
              <span className="font-mono tabular-nums text-[#dce2f8]">
                {activePoint.dayLabel} :{' '}
                <strong className={analytics.isActive ? palette.badgeText : 'text-[#99907c]'}>
                  {analytics.isActive ? `${activePoint.percentage}%` : '0%'}
                </strong>
                {analytics.isActive && activePoint.dayIndex > 0 && (
                  <span className="text-[#99907c]">
                    {' '}
                    ({activePoint.deltaFromPrev >= 0 ? `+${activePoint.deltaFromPrev}` : activePoint.deltaFromPrev} pts)
                  </span>
                )}
              </span>
            )}
          </div>

          <div
            ref={containerRef}
            className="w-full rounded-lg bg-[#070e1d] border border-[#232a3a] p-2"
          >
            <svg
              ref={svgRef}
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              onPointerMove={handleSvgPointerMove}
              onPointerLeave={() => setHoveredIdx(null)}
              onClick={handleSvgClick}
              role="img"
              aria-label={`Graphique D3 d'évolution de la maîtrise pour ${skill.title} sur 7 jours`}
              className="w-full h-auto cursor-crosshair select-none overflow-visible"
            >
              <defs>
                <linearGradient id={`detail-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={analytics.isActive ? palette.fillStart : 'rgba(153,144,124,0.16)'} />
                  <stop offset="100%" stopColor={analytics.isActive ? palette.fillEnd : 'rgba(153,144,124,0.01)'} />
                </linearGradient>
              </defs>

              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Horizontal gridlines */}
                {d3LineModel.yTicks.map((tick) => {
                  const y = d3LineModel.yScale(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={y}
                        y2={y}
                        stroke="#1c2334"
                        strokeWidth={1}
                      />
                      <text
                        x={-8}
                        y={y + 3.5}
                        textAnchor="end"
                        className="fill-[#99907c] text-[10px] font-mono tabular-nums"
                      >
                        {tick}%
                      </text>
                    </g>
                  );
                })}

                {/* 85% excellence threshold */}
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={d3LineModel.targetY}
                  y2={d3LineModel.targetY}
                  stroke="#d4c78f"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={0.55}
                />
                <text
                  x={innerWidth - 2}
                  y={d3LineModel.targetY - 4}
                  textAnchor="end"
                  className="fill-[#d4c78f] text-[9px] font-mono"
                >
                  Cible 85%
                </text>

                {/* Area + Monotone Curve */}
                {analytics.isActive && (
                  <>
                    <path d={d3LineModel.areaPath} fill={`url(#detail-area-${uid})`} />
                    <motion.path
                      d={d3LineModel.linePath}
                      fill="none"
                      stroke={palette.stroke}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      initial={shouldReduceMotion ? false : { pathLength: 0.15, opacity: 0.5 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </>
                )}

                {/* Vertical hover guide */}
                {activePoint && (
                  <line
                    x1={d3LineModel.xPos(activePoint)}
                    x2={d3LineModel.xPos(activePoint)}
                    y1={0}
                    y2={innerHeight}
                    stroke="#3b455e"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                )}

                {/* Day points & X-axis labels */}
                {analytics.series.map((pt, idx) => {
                  const cx = d3LineModel.xPos(pt);
                  const cy = d3LineModel.yScale(pt.percentage);
                  const isActive = idx === activeIdx;
                  return (
                    <g key={pt.dayLabel}>
                      <text
                        x={cx}
                        y={innerHeight + 18}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          isActive ? 'fill-[#dce2f8] font-bold' : 'fill-[#99907c]'
                        }`}
                      >
                        {pt.dayLabel}
                      </text>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? 4.5 : 3}
                        fill={analytics.isActive ? palette.stroke : '#5c5649'}
                        stroke="#070e1d"
                        strokeWidth={1.5}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Weighted Factor Breakdown D3 Bar Chart */}
        <div className="xl:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#d0c5af] font-medium">Piliers pondérés de la skill</span>
            <span className="font-mono text-[#99907c]">Contribution (%)</span>
          </div>

          <div className="rounded-lg bg-[#070e1d] border border-[#232a3a] p-3 space-y-2.5">
            {analytics.factors.map((factor) => (
              <div key={factor.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#dce2f8] truncate">
                    {factor.label}{' '}
                    <span className="font-mono text-[#99907c]">({factor.weightPct}%)</span>
                  </span>
                  <span className="font-mono tabular-nums text-[#d4c78f] shrink-0">
                    {factor.valuePct}% · +{factor.contributionPts} pts
                  </span>
                </div>
              </div>
            ))}

            <svg
              width={factorBarWidth}
              height={factorHeight}
              viewBox={`0 0 ${factorBarWidth} ${factorHeight}`}
              className="w-full h-auto pt-1 overflow-visible"
              role="img"
              aria-label={`Répartition D3 des facteurs pondérés pour ${skill.title}`}
            >
              <g transform={`translate(${factorMargin.left}, ${factorMargin.top})`}>
                {analytics.factors.map((factor) => {
                  const y = d3FactorModel.yBand(factor.id) ?? 0;
                  const barH = Math.max(8, d3FactorModel.yBand.bandwidth());
                  const barW = Math.max(3, d3FactorModel.xLinear(factor.valuePct));
                  return (
                    <g key={factor.id}>
                      <rect
                        x={0}
                        y={y}
                        width={factorInnerW}
                        height={barH}
                        rx={4}
                        fill="#151b2b"
                      />
                      <rect
                        x={0}
                        y={y}
                        width={barW}
                        height={barH}
                        rx={4}
                        fill={analytics.isActive ? palette.bar : '#5c5649'}
                        opacity={analytics.isActive ? 0.9 : 0.45}
                      />
                      <text
                        x={factorInnerW + 6}
                        y={y + barH / 2 + 3.5}
                        className="fill-[#dce2f8] text-[10px] font-mono tabular-nums"
                      >
                        {factor.valuePct}%
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Explicit Provenance Footnote */}
      <p className="text-[11px] text-[#99907c] leading-relaxed flex items-start gap-1.5">
        <span className="material-symbols-outlined text-sm text-[#d4c78f] shrink-0 mt-0.5">
          info
        </span>
        <span>{analytics.provenanceNote}</span>
      </p>
    </div>
  );
};

export interface MasterSkillsD3OverviewPanelProps {
  skills: SkillAdminItem[];
  analyticsBySkillId: Map<string, IndividualSkillAnalytics>;
  categoryMap: Map<string, string>;
  selectedSkillId: string | null;
  onSelectSkill: (skillId: string) => void;
}

/**
 * Comparative 20-Skill D3 Mastery Bar Chart paired with the active SkillIndividualDetailD3Chart.
 */
export const MasterSkillsD3OverviewPanel: React.FC<MasterSkillsD3OverviewPanelProps> = ({
  skills,
  analyticsBySkillId,
  categoryMap,
  selectedSkillId,
  onSelectSkill
}) => {
  const barContainerRef = useRef<HTMLDivElement | null>(null);
  const [barAreaWidth, setBarAreaWidth] = useState<number>(420);
  const [sortByProgress, setSortByProgress] = useState<boolean>(true);

  useEffect(() => {
    const el = barContainerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 140) {
        setBarAreaWidth(Math.round(rect.width));
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const orderedSkills = useMemo(() => {
    const list = [...skills];
    if (!sortByProgress) return list;
    return list.sort((a, b) => {
      const pa = analyticsBySkillId.get(a.id)?.currentPercentage ?? 0;
      const pb = analyticsBySkillId.get(b.id)?.currentPercentage ?? 0;
      if (pb !== pa) return pb - pa;
      return a.title.localeCompare(b.title);
    });
  }, [skills, sortByProgress, analyticsBySkillId]);

  const resolvedSelectedSkill = useMemo(() => {
    if (orderedSkills.length === 0) return null;
    const found = orderedSkills.find((s) => s.id === selectedSkillId);
    return found ?? orderedSkills[0];
  }, [orderedSkills, selectedSkillId]);

  const selectedIndex = resolvedSelectedSkill
    ? orderedSkills.findIndex((s) => s.id === resolvedSelectedSkill.id)
    : -1;

  const handleCycle = (delta: number) => {
    if (orderedSkills.length === 0) return;
    const nextIdx = (selectedIndex + delta + orderedSkills.length) % orderedSkills.length;
    onSelectSkill(orderedSkills[nextIdx].id);
  };

  // D3 Comparative Bar Chart geometry
  const rowHeight = 25;
  const chartHeight = Math.max(160, orderedSkills.length * rowHeight + 28);
  const leftLabelW = barAreaWidth < 360 ? 112 : 156;
  const rightValueW = 42;
  const plotW = Math.max(80, barAreaWidth - leftLabelW - rightValueW - 16);

  const d3CompareModel = useMemo(() => {
    const yBand = d3
      .scaleBand<string>()
      .domain(orderedSkills.map((s) => s.id))
      .range([12, chartHeight - 16])
      .padding(0.28);

    const xLinear = d3.scaleLinear().domain([0, 100]).range([0, plotW]);
    return { yBand, xLinear };
  }, [orderedSkills, chartHeight, plotW]);

  if (skills.length === 0) {
    return null;
  }

  const selectedAnalytics = resolvedSelectedSkill
    ? analyticsBySkillId.get(resolvedSelectedSkill.id)
    : undefined;

  return (
    <section
      aria-label="Visualisation D3 de la progression individuelle des Master Skills"
      className="w-full rounded-2xl luxury-card-surface p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs text-[#d4c78f] font-medium">
            <span>Télémétrie D3.js</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#99907c] tabular-nums">
              {orderedSkills.length} compétence(s) affichée(s)
            </span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8]">
            Progression individuelle de maîtrise par Skill
          </h3>
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="Tri du graphique D3">
          <button
            type="button"
            onClick={() => setSortByProgress(true)}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              sortByProgress ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
            }`}
          >
            Par maîtrise
          </button>
          <button
            type="button"
            onClick={() => setSortByProgress(false)}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              !sortByProgress ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
            }`}
          >
            Ordre registre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive D3 Bar Chart across all visible skills */}
        <div className="lg:col-span-5 rounded-xl bg-[#0c1322] border border-[#232a3a] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span>Cliquez une barre pour inspecter sa courbe D3</span>
            <span className="font-mono">0–100%</span>
          </div>

          <div ref={barContainerRef} className="w-full max-h-[430px] overflow-y-auto pr-1">
            <svg
              width={barAreaWidth}
              height={chartHeight}
              viewBox={`0 0 ${barAreaWidth} ${chartHeight}`}
              className="w-full h-auto select-none overflow-visible"
              role="img"
              aria-label="Graphique comparatif D3 du pourcentage de maîtrise de chaque skill"
            >
              {/* 85% benchmark vertical line */}
              <line
                x1={leftLabelW + d3CompareModel.xLinear(85)}
                x2={leftLabelW + d3CompareModel.xLinear(85)}
                y1={6}
                y2={chartHeight - 10}
                stroke="#d4c78f"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <text
                x={leftLabelW + d3CompareModel.xLinear(85)}
                y={8}
                textAnchor="middle"
                className="fill-[#d4c78f] text-[9px] font-mono"
              >
                85%
              </text>

              {orderedSkills.map((skill) => {
                const y = d3CompareModel.yBand(skill.id) ?? 0;
                const h = Math.max(12, d3CompareModel.yBand.bandwidth());
                const analytics = analyticsBySkillId.get(skill.id);
                const pct = analytics?.isActive ? analytics.currentPercentage : 0;
                const barW = analytics?.isActive
                  ? Math.max(4, d3CompareModel.xLinear(pct))
                  : 0;
                const isSelected = resolvedSelectedSkill?.id === skill.id;
                const tone = analytics ? TONE_PALETTE[analytics.toneClass] : TONE_PALETTE.sky;
                const shortTitle =
                  skill.title.length > (barAreaWidth < 360 ? 15 : 22)
                    ? `${skill.title.slice(0, barAreaWidth < 360 ? 14 : 21)}…`
                    : skill.title;

                return (
                  <g
                    key={skill.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${skill.title} : ${analytics?.isActive ? `${pct}%` : 'désactivée'}`}
                    onClick={() => onSelectSkill(skill.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSkill(skill.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <rect
                      x={0}
                      y={y - 2}
                      width={barAreaWidth - 4}
                      height={h + 4}
                      rx={5}
                      fill={isSelected ? 'rgba(242, 202, 80, 0.12)' : 'transparent'}
                      stroke={isSelected ? '#f2ca50' : 'transparent'}
                      strokeWidth={1}
                    />
                    <text
                      x={6}
                      y={y + h / 2 + 3.5}
                      className={`text-[11px] ${
                        isSelected
                          ? 'fill-[#f2ca50] font-bold'
                          : analytics?.isActive
                          ? 'fill-[#dce2f8]'
                          : 'fill-[#99907c]'
                      }`}
                    >
                      {shortTitle}
                    </text>

                    {/* Background Track */}
                    <rect
                      x={leftLabelW}
                      y={y + 2}
                      width={plotW}
                      height={Math.max(8, h - 4)}
                      rx={4}
                      fill="#151b2b"
                    />

                    {/* Mastery Bar */}
                    {analytics?.isActive ? (
                      <rect
                        x={leftLabelW}
                        y={y + 2}
                        width={barW}
                        height={Math.max(8, h - 4)}
                        rx={4}
                        fill={tone.bar}
                        opacity={isSelected ? 1 : 0.82}
                      />
                    ) : (
                      <line
                        x1={leftLabelW + 2}
                        x2={leftLabelW + plotW - 2}
                        y1={y + h / 2}
                        y2={y + h / 2}
                        stroke="#3b455e"
                        strokeDasharray="2 3"
                        strokeWidth={1}
                      />
                    )}

                    <text
                      x={leftLabelW + plotW + 8}
                      y={y + h / 2 + 3.5}
                      className={`text-[10px] font-mono tabular-nums ${
                        isSelected
                          ? 'fill-[#f2ca50] font-bold'
                          : analytics?.isActive
                          ? 'fill-[#dce2f8]'
                          : 'fill-[#99907c]'
                      }`}
                    >
                      {analytics?.isActive ? `${pct}%` : '—'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Detailed D3 Trajectory & Factor Breakdown for Selected Skill */}
        <div className="lg:col-span-7">
          {resolvedSelectedSkill && selectedAnalytics && (
            <SkillIndividualDetailD3Chart
              skill={resolvedSelectedSkill}
              categoryLabel={categoryMap.get(resolvedSelectedSkill.category) || resolvedSelectedSkill.category}
              analytics={selectedAnalytics}
              onPrevSkill={() => handleCycle(-1)}
              onNextSkill={() => handleCycle(1)}
              currentRankLabel={`${selectedIndex + 1} / ${orderedSkills.length}`}
            />
          )}
        </div>
      </div>
    </section>
  );
};
