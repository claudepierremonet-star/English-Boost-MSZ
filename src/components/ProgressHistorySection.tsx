import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../firebase/types';
import { getSevenDayScoreHistory, type SevenDayDataPoint } from '../firebase/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface ProgressHistorySectionProps {
  user: UserProfile;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SevenDayDataPoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/70 p-3 shadow-2xl backdrop-blur-md min-w-[180px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#232a3a] pb-1.5 mb-1.5">
          <span className="font-serif font-bold text-[#f2ca50] text-xs">
            {data.label || data.day}
          </span>
          {data.dateKey && (
            <span className="text-[10px] text-zinc-400 font-mono">
              {data.dateKey}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-300">Points XP :</span>
          <span className="font-mono font-bold text-[#f2ca50] text-sm">
            +{data.xp} XP
          </span>
        </div>
        {data.score > 0 && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
            <span>Précision :</span>
            <span className="font-mono text-zinc-200">{data.score}%</span>
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
  const [dataPoints, setDataPoints] = useState<SevenDayDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await getSevenDayScoreHistory(user?.uid);
        if (isMounted) {
          setDataPoints(result.history);
        }
      } catch (err) {
        console.warn('Erreur lors du chargement de l\'historique des 7 jours:', err);
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

  const totalWeeklyXp = dataPoints.reduce((acc, curr) => acc + (curr.xp || 0), 0);
  const avgDailyXp = dataPoints.length > 0 ? Math.round(totalWeeklyXp / dataPoints.length) : 0;
  const bestDay = [...dataPoints].sort((a, b) => b.xp - a.xp)[0];

  return (
    <section
      aria-label="Mon historique de progression"
      className={`w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-4 text-slate-100 ${className}`}
    >
      {/* En-tête de la section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#232a3a]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shadow-sm">
            <span className="material-symbols-outlined text-xl">show_chart</span>
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8]">
              Mon historique de progression
            </h3>
            <p className="text-xs text-[#d0c5af]/80">
              Évolution des points XP accumulés au cours des 7 derniers jours
            </p>
          </div>
        </div>

        {/* Badges de synthèse rapide */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
            <span className="text-zinc-400 mr-1.5">Cumul 7J :</span>
            <strong className="text-[#f2ca50]">+{totalWeeklyXp.toLocaleString()} XP</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
            <span className="text-zinc-400 mr-1.5">Moyenne :</span>
            <strong className="text-[#38bdf8]">~{avgDailyXp} XP/j</strong>
          </div>
          {bestDay && bestDay.xp > 0 && (
            <div className="hidden md:flex px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
              <span className="text-zinc-400 mr-1.5">Pic :</span>
              <strong className="text-emerald-400">+{bestDay.xp} XP ({bestDay.day})</strong>
            </div>
          )}
        </div>
      </div>

      {/* Graphique linéaire Recharts */}
      <div className="w-full h-56 select-none pt-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono">
            <span className="material-symbols-outlined animate-spin mr-2 text-sm">sync</span>
            Chargement des points XP des 7 derniers jours...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataPoints}
              margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#99907c"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2e3545' }}
                tick={{ fill: '#d0c5af', fontWeight: 600 }}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(300, Math.ceil(dataMax * 1.15))]}
                unit=" XP"
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#99907c' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#f2ca50', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="xp"
                name="Points XP"
                stroke="#f2ca50"
                strokeWidth={3}
                dot={{
                  fill: '#070e1d',
                  stroke: '#f2ca50',
                  strokeWidth: 2.5,
                  r: 4.5
                }}
                activeDot={{
                  fill: '#f2ca50',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                  r: 6.5
                }}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Légende et conseil pédagogique sous le graphique */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-[#99907c] pt-2 border-t border-[#232a3a] gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50]" />
          <span className="text-zinc-300 font-medium">Ligne dorée : Points XP acquis par session d'entraînement</span>
        </div>
        <span className="italic text-zinc-400">
          Chaque point reflète vos dictées, flashcards, quiz et jeux complétés.
        </span>
      </div>
    </section>
  );
};
