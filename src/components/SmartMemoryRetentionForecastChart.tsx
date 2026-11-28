import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import type { SmartMemoryRetentionForecastDay } from '../utils/smartMemoryEngine';

interface SmartMemoryRetentionForecastChartProps {
  forecast: SmartMemoryRetentionForecastDay[];
  timezone: string;
}

export const SmartMemoryRetentionForecastChart: React.FC<
  SmartMemoryRetentionForecastChartProps
> = ({ forecast, timezone }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 560;
  const height = 185;
  const margin = { top: 20, right: 24, bottom: 28, left: 32 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const totalDue7Days = useMemo(
    () => forecast.reduce((sum, day) => sum + day.dueCount, 0),
    [forecast]
  );

  const peakDay = useMemo(() => {
    if (forecast.length === 0) return null;
    return forecast.reduce(
      (best, cur) => (cur.dueCount > best.dueCount ? cur : best),
      forecast[0]
    );
  }, [forecast]);

  const { bars, maxDue, cumulativeLinePath, cumulativeAreaPath } = useMemo(() => {
    const maxVal = Math.max(4, d3.max(forecast, (d) => d.dueCount) || 4);
    const maxCum = Math.max(4, d3.max(forecast, (d) => d.cumulativeCount) || 4);

    const xScale = d3
      .scaleBand()
      .domain(forecast.map((d) => d.localDateKey))
      .range([0, innerWidth])
      .padding(0.32);

    const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);
    const yCumScale = d3.scaleLinear().domain([0, maxCum]).range([innerHeight, 0]);

    const computedBars = forecast.map((d, idx) => {
      const x = xScale(d.localDateKey) ?? 0;
      const barWidth = xScale.bandwidth();
      const y = yScale(d.dueCount);
      const barHeight = Math.max(3, innerHeight - y);
      return {
        idx,
        day: d,
        x,
        y,
        barWidth,
        barHeight,
        cx: x + barWidth / 2,
        cumY: yCumScale(d.cumulativeCount)
      };
    });

    const lineGen = d3
      .line<(typeof computedBars)[number]>()
      .x((b) => b.cx)
      .y((b) => b.cumY)
      .curve(d3.curveMonotoneX);

    const areaGen = d3
      .area<(typeof computedBars)[number]>()
      .x((b) => b.cx)
      .y0(innerHeight)
      .y1((b) => b.cumY)
      .curve(d3.curveMonotoneX);

    return {
      bars: computedBars,
      maxDue: maxVal,
      cumulativeLinePath:
        totalDue7Days > 0 && computedBars.length >= 2 ? lineGen(computedBars) || '' : '',
      cumulativeAreaPath:
        totalDue7Days > 0 && computedBars.length >= 2 ? areaGen(computedBars) || '' : ''
    };
  }, [forecast, innerHeight, innerWidth, totalDue7Days]);

  const activeDay = hoveredIdx !== null ? bars[hoveredIdx]?.day : null;

  return (
    <div className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-sky-400">
            timeline
          </span>
          <span className="font-serif font-bold text-[#dce2f8]">
            Retention Forecast (7 prochains jours)
          </span>
        </div>

        <span className="font-mono text-[11px] text-[#d0c5af] tabular-nums">
          {activeDay
            ? `${activeDay.dayLabel} (${activeDay.shortDateLabel}) · ${activeDay.dueCount} carte(s) · Cumul ${activeDay.cumulativeCount}${
                activeDay.projectedIntervalAvgDays > 0
                  ? ` · Int. moy ${activeDay.projectedIntervalAvgDays}j`
                  : ''
              }`
            : totalDue7Days > 0 && peakDay
            ? `${totalDue7Days} carte(s) sur 7j · Pic : ${peakDay.dayLabel} (${peakDay.dueCount})`
            : `0 révision planifiée (${timezone})`}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Chronologie Retention Forecast des révisions à venir sur 7 jours"
        className="w-full h-44 select-none overflow-visible"
      >
        <defs>
          <linearGradient id="smForecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Horizontal gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const yPos = innerHeight * (1 - ratio);
            const tickVal = Math.round(maxDue * ratio);
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

          {/* Cumulative workload gradient area + curve */}
          {cumulativeAreaPath && (
            <path d={cumulativeAreaPath} fill="url(#smForecastAreaGrad)" />
          )}
          {cumulativeLinePath && (
            <path
              d={cumulativeLinePath}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={1.75}
              strokeDasharray="4 2"
            />
          )}

          {/* Forecast Bars per Day */}
          {bars.map((bar) => {
            const isHovered = hoveredIdx === bar.idx;
            const hasDue = bar.day.dueCount > 0;
            const isToday = bar.day.dayOffset === 0;
            const barFill = isHovered
              ? '#ffe088'
              : hasDue
              ? isToday
                ? '#f2ca50'
                : '#38bdf8'
              : '#1c2436';

            return (
              <g
                key={bar.day.localDateKey}
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
                  fill={barFill}
                  opacity={hasDue ? 0.92 : 0.6}
                />
                {hasDue && (
                  <text
                    x={bar.cx}
                    y={bar.y - 5}
                    textAnchor="middle"
                    fill={isToday ? '#f2ca50' : '#7dd3fc'}
                    fontSize="10"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {bar.day.dueCount}
                  </text>
                )}
                {totalDue7Days > 0 && (
                  <circle
                    cx={bar.cx}
                    cy={bar.cumY}
                    r={isHovered ? 4 : 3}
                    fill="#070e1d"
                    stroke="#a78bfa"
                    strokeWidth={1.75}
                  />
                )}
                <text
                  x={bar.cx}
                  y={innerHeight + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#f2ca50' : isToday ? '#f2ca50' : '#d0c5af'}
                  fontSize="10"
                  className="font-mono"
                >
                  {bar.day.dayLabel}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#99907c] font-mono pt-1 border-t border-[#1c2436]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f2ca50]" />
            Échues aujourd’hui
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-400" />
            À réviser (J+1 à J+6)
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-violet-400" />
          Charge cumulée
        </span>
      </div>
    </div>
  );
};
