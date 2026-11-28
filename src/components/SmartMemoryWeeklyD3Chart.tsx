import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import type { SmartMemoryWeeklyDayStat } from '../utils/smartMemoryEngine';

interface SmartMemoryWeeklyD3ChartProps {
  weeklyActivity: SmartMemoryWeeklyDayStat[];
  timezone: string;
}

export const SmartMemoryWeeklyD3Chart: React.FC<SmartMemoryWeeklyD3ChartProps> = ({
  weeklyActivity,
  timezone
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 560;
  const height = 185;
  const margin = { top: 20, right: 24, bottom: 28, left: 32 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { bars, maxReviews, linePath } = useMemo(() => {
    const maxVal = Math.max(5, d3.max(weeklyActivity, (d) => d.reviewsCount) || 5);
    const xScale = d3
      .scaleBand()
      .domain(weeklyActivity.map((d) => d.localDateKey))
      .range([0, innerWidth])
      .padding(0.32);

    const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);
    const yAccScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    const computedBars = weeklyActivity.map((d, idx) => {
      const x = xScale(d.localDateKey) ?? 0;
      const barWidth = xScale.bandwidth();
      const y = yScale(d.reviewsCount);
      const barHeight = Math.max(3, innerHeight - y);
      return {
        idx,
        stat: d,
        x,
        y,
        barWidth,
        barHeight,
        cx: x + barWidth / 2,
        accY: yAccScale(d.accuracyPct)
      };
    });

    const accGenerator = d3
      .line<(typeof computedBars)[number]>()
      .x((b) => b.cx)
      .y((b) => b.accY)
      .curve(d3.curveMonotoneX);

    const activeAccBars = computedBars.filter((b) => b.stat.reviewsCount > 0);
    return {
      bars: computedBars,
      maxReviews: maxVal,
      linePath: activeAccBars.length >= 2 ? accGenerator(activeAccBars) || '' : ''
    };
  }, [weeklyActivity, innerHeight, innerWidth]);

  const activePoint = hoveredIdx !== null ? bars[hoveredIdx]?.stat : null;

  return (
    <div className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#f2ca50]">bar_chart</span>
          <span className="font-serif font-bold text-[#dce2f8]">
            Activité Hebdomadaire (D3 · Fuseau {timezone})
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#d0c5af] tabular-nums">
          {activePoint
            ? `${activePoint.dayLabel} (${activePoint.localDateKey}) · ${activePoint.reviewsCount} révisions · ${activePoint.accuracyPct}%`
            : 'Survolez ou focalisez un jour pour les métriques'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Graphique D3 de l'activité hebdomadaire Smart Memory sur 7 jours"
        className="w-full h-44 select-none overflow-visible"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Horizontal gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const yPos = innerHeight * (1 - ratio);
            const tickVal = Math.round(maxReviews * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={yPos}
                  y2={yPos}
                  stroke="#232a3a"
                  strokeDasharray="3 3"
                />
                <text
                  x={-8}
                  y={yPos + 3}
                  textAnchor="end"
                  fill="#99907c"
                  fontSize="10"
                  className="font-mono"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Review count bars */}
          {bars.map((bar) => {
            const isHovered = hoveredIdx === bar.idx;
            const hasActivity = bar.stat.reviewsCount > 0;
            return (
              <g
                key={bar.stat.localDateKey}
                tabIndex={0}
                onMouseEnter={() => setHoveredIdx(bar.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(bar.idx)}
                onBlur={() => setHoveredIdx(null)}
                className="cursor-pointer outline-none"
              >
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.barWidth}
                  height={bar.barHeight}
                  rx={5}
                  fill={
                    isHovered
                      ? '#ffe088'
                      : hasActivity
                      ? '#f2ca50'
                      : '#1c2436'
                  }
                  opacity={hasActivity ? 0.92 : 0.65}
                />
                {hasActivity && (
                  <text
                    x={bar.cx}
                    y={bar.y - 5}
                    textAnchor="middle"
                    fill="#f2ca50"
                    fontSize="10"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {bar.stat.reviewsCount}
                  </text>
                )}
                <text
                  x={bar.cx}
                  y={innerHeight + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#f2ca50' : '#d0c5af'}
                  fontSize="10"
                  className="font-mono"
                >
                  {bar.stat.dayLabel}
                </text>
              </g>
            );
          })}

          {/* Accuracy curve overlay */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
          {bars
            .filter((b) => b.stat.reviewsCount > 0)
            .map((b) => (
              <circle
                key={`dot-${b.stat.localDateKey}`}
                cx={b.cx}
                cy={b.accY}
                r={3.5}
                fill="#070e1d"
                stroke="#34d399"
                strokeWidth={2}
              />
            ))}
        </g>
      </svg>

      <div className="flex items-center justify-between text-[11px] text-[#99907c] font-mono pt-1 border-t border-[#1c2436]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f2ca50]" />
          Révisions effectuées / jour
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-emerald-400" />
          Taux de rétention (%)
        </span>
      </div>
    </div>
  );
};
