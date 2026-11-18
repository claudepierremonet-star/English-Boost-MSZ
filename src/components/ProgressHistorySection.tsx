import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../firebase/types';
import {
  getThirtyDayWeeklyXpHistory,
  type ThirtyDayWeeklyXpPoint,
  type ThirtyDayDailyXpPoint,
  type ThirtyDayWeeklyXpResult
} from '../firebase/client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface ProgressHistorySectionProps {
  user: UserProfile;
  className?: string;
}

type ChartGranularity = 'weekly' | 'daily';

interface WeeklyTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ThirtyDayWeeklyXpPoint }>;
}

const WeeklyXpTooltip: React.FC<WeeklyTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/70 p-3 shadow-2xl backdrop-blur-md min-w-[210px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#232a3a] pb-1.5 mb-1.5">
          <span className="font-serif font-bold text-[#f2ca50] text-xs">
            {data.weekLabel}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {data.rangeLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-300">Score XP hebdo :</span>
          <span className="font-mono font-bold text-[#f2ca50] text-sm">
            +{data.weeklyXp.toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
          <span>Sessions validées :</span>
          <span className="font-mono text-zinc-200">{data.sessionsCount}</span>
        </div>
        {data.averageScore > 0 && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
            <span>Précision moyenne :</span>
            <span className="font-mono text-emerald-400 font-semibold">{data.averageScore}%</span>
          </div>
        )}
        <div className="mt-1.5 pt-1.5 border-t border-[#232a3a] text-[10px] text-[#d4c78f] truncate max-w-[220px]">
          {data.topModule}
        </div>
      </div>
    );
  }
  return null;
};

interface DailyTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ThirtyDayDailyXpPoint }>;
}

const DailyXpTooltip: React.FC<DailyTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/70 p-3 shadow-2xl backdrop-blur-md min-w-[185px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#232a3a] pb-1.5 mb-1.5">
          <span className="font-serif font-bold text-[#f2ca50] text-xs">
            {data.fullLabel}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {data.shortDate}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-300">XP du jour :</span>
          <span className="font-mono font-bold text-[#f2ca50] text-sm">
            +{data.xp.toLocaleString()} XP
          </span>
        </div>
        {data.score > 0 && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
            <span>Précision :</span>
            <span className="font-mono text-emerald-400">{data.score}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ProgressHistorySection: React.FC<ProgressHistorySectionProps> = ({
  user,
  className = ''
}) => {
  const [historyData, setHistoryData] = useState<ThirtyDayWeeklyXpResult | null>(null);
  const [granularity, setGranularity] = useState<ChartGranularity>('weekly');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await getThirtyDayWeeklyXpHistory(user?.uid, user?.stats?.weeklyXp || 0);
        if (isMounted) {
          setHistoryData(result);
        }
      } catch (err) {
        console.warn("Erreur lors du chargement de l'historique XP sur 30 jours :", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.stats?.totalXp, user?.stats?.weeklyXp]);

  const weeklyPoints = historyData?.weeklyHistory || [];
  const dailyPoints = historyData?.dailyHistory || [];
  const total30DayXp = historyData?.total30DayXp || 0;
  const averageWeeklyXp = historyData?.averageWeeklyXp || 0;
  const peakWeeklyXp = historyData?.peakWeeklyXp || 0;
  const peakWeekLabel = historyData?.peakWeekLabel || 'Sem. 1';
  const weeklyTrendPercent = historyData?.weeklyTrendPercent || 0;

  return (
    <section
      aria-label="Évolution du score XP hebdomadaire sur 30 jours"
      className={`w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-4 text-slate-100 ${className}`}
    >
      {/* En-tête de la section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-[#232a3a]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shadow-sm shrink-0">
            <span className="material-symbols-outlined text-xl">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8]">
                Évolution XP hebdomadaire (30 jours)
              </h3>
              {!loading && weeklyTrendPercent !== 0 && (
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                    weeklyTrendPercent > 0
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {weeklyTrendPercent > 0 ? `+${weeklyTrendPercent}%` : `${weeklyTrendPercent}%`} vs sem. préc.
                </span>
              )}
            </div>
            <p className="text-xs text-[#d0c5af]/80">
              Progression de votre score XP hebdomadaire sur les 30 derniers jours
            </p>
          </div>
        </div>

        {/* Contrôle de granularité + Badges de synthèse */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-[#070e1d] border border-[#232a3a] p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setGranularity('weekly')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                granularity === 'weekly'
                  ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                  : 'text-zinc-400 hover:text-[#dce2f8]'
              }`}
            >
              Hebdo (30j)
            </button>
            <button
              type="button"
              onClick={() => setGranularity('daily')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                granularity === 'daily'
                  ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                  : 'text-zinc-400 hover:text-[#dce2f8]'
              }`}
            >
              30 Jours
            </button>
          </div>

          <div className="px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
            <span className="text-zinc-400 mr-1.5">Cumul 30J :</span>
            <strong className="text-[#f2ca50]">+{total30DayXp.toLocaleString()} XP</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
            <span className="text-zinc-400 mr-1.5">Moy. Hebdo :</span>
            <strong className="text-[#38bdf8]">~{averageWeeklyXp.toLocaleString()} XP</strong>
          </div>
          {peakWeeklyXp > 0 && (
            <div className="hidden xl:flex px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
              <span className="text-zinc-400 mr-1.5">Record :</span>
              <strong className="text-emerald-400">
                +{peakWeeklyXp.toLocaleString()} XP ({peakWeekLabel})
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Graphique Recharts sur 30 jours */}
      <div className="w-full h-64 sm:h-72 select-none pt-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono">
            <span className="material-symbols-outlined animate-spin mr-2 text-sm">sync</span>
            Chargement de l'évolution XP sur 30 jours...
          </div>
        ) : granularity === 'weekly' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyPoints}
              margin={{ top: 14, right: 18, left: -4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="weeklyXpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f2ca50" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#f2ca50" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#99907c"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2e3545' }}
                tick={{ fill: '#d0c5af', fontWeight: 600 }}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(500, Math.ceil(dataMax * 1.18))]}
                unit=" XP"
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#99907c' }}
              />
              {averageWeeklyXp > 0 && (
                <ReferenceLine
                  y={averageWeeklyXp}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
              )}
              <Tooltip
                content={<WeeklyXpTooltip />}
                cursor={{ stroke: '#f2ca50', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="weeklyXp"
                name="Score XP Hebdomadaire"
                stroke="#f2ca50"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weeklyXpAreaGradient)"
                dot={{
                  fill: '#070e1d',
                  stroke: '#f2ca50',
                  strokeWidth: 2.5,
                  r: 5
                }}
                activeDot={{
                  fill: '#f2ca50',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                  r: 7
                }}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyPoints}
              margin={{ top: 14, right: 14, left: -6, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />
              <XAxis
                dataKey="shortDate"
                interval={4}
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2e3545' }}
                tick={{ fill: '#d0c5af' }}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(200, Math.ceil(dataMax * 1.2))]}
                unit=" XP"
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#99907c' }}
              />
              <Tooltip
                content={<DailyXpTooltip />}
                cursor={{ fill: 'rgba(242, 202, 80, 0.08)' }}
              />
              <Bar
                dataKey="xp"
                name="XP Quotidien"
                fill="#f2ca50"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={750}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Légende et synthèse sous le graphique */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-[#99907c] pt-2 border-t border-[#232a3a] gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50]" />
            <span className="text-zinc-300 font-medium">
              {granularity === 'weekly'
                ? 'Courbe dorée : Score XP accumulé par semaine'
                : 'Barres dorées : XP gagnés par jour (30 derniers jours)'}
            </span>
          </div>
          {granularity === 'weekly' && averageWeeklyXp > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#38bdf8]" />
              <span className="text-[#38bdf8]">Moyenne hebdomadaire ({averageWeeklyXp.toLocaleString()} XP)</span>
            </div>
          )}
        </div>
        <span className="italic text-zinc-400">
          Données synchronisées sur vos 30 derniers jours d'entraînement.
        </span>
      </div>
    </section>
  );
};
