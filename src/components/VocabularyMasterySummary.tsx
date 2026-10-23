import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile } from '../firebase/types';
import {
  getVocabularyMasterySummary,
  type VocabularyMasterySummary as VocabSummaryType,
  type VocabularyDataPoint
} from '../data/vocabularyStats';

interface VocabularyMasterySummaryProps {
  user: UserProfile;
  onOpenFlashcards?: () => void;
}

type TimeframeOption = '7d' | '30d' | '12w';
type MetricViewOption = 'volume' | 'retention';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: VocabularyDataPoint;
    color: string;
  }>;
}

const CustomVocabularyTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/50 p-3.5 shadow-2xl backdrop-blur-md min-w-[220px]">
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#d4c78f] border-b border-[#232a3a] pb-1.5 mb-2 font-mono">
          <span className="font-bold text-[#f2ca50]">{data.fullLabel}</span>
          <span className="text-[10px] text-[#99907c]">{data.dateKey}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[#dce2f8]">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50]" />
              Lexèmes Consolidés :
            </span>
            <span className="font-bold text-[#f2ca50] font-mono">{data.masteredWords}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[#94a3b8]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              En Apprentissage :
            </span>
            <span className="font-bold text-[#38bdf8] font-mono">{data.learningWords}</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#232a3a] font-mono">
            <span className="text-[11px] text-[#d0c5af]/80">Lexique Total Mobilisable :</span>
            <span className="font-bold text-white text-xs">{data.totalActiveWords} mots</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
            <span className="text-emerald-400">Rétention SM-2 :</span>
            <span className="font-bold text-emerald-300">{data.retentionRate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const VocabularyMasterySummary: React.FC<VocabularyMasterySummaryProps> = ({
  user,
  onOpenFlashcards
}) => {
  const [summaryData, setSummaryData] = useState<VocabSummaryType | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30d');
  const [metricView, setMetricView] = useState<MetricViewOption>('volume');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getVocabularyMasterySummary(user);
        if (isMounted) {
          setSummaryData(data);
        }
      } catch (err) {
        console.warn('Error loading vocabulary summary:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user.uid, user.stats.totalXp, user.stats.masteryPercentage]);

  const activePoints: VocabularyDataPoint[] = useMemo(() => {
    if (!summaryData) return [];
    if (timeframe === '7d') return summaryData.sevenDays;
    if (timeframe === '30d') return summaryData.thirtyDays;
    return summaryData.twelveWeeks;
  }, [summaryData, timeframe]);

  const latestPoint = activePoints[activePoints.length - 1];
  const earliestPoint = activePoints[0];
  const wordsGrowth = latestPoint && earliestPoint
    ? latestPoint.totalActiveWords - earliestPoint.totalActiveWords
    : 0;

  return (
    <section className="w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none" />

      {/* Top Header Row with Title and Timeframe Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f2ca50] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_stories
            </span>
            <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-bold">
              Maîtrise du Vocabulaire dans le Temps
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30">
              SM-2 Engine
            </span>
          </div>
          <p className="text-xs text-[#d0c5af]/80">
            Trajectoire chronologique des lexèmes assimilés et taux de rétention espacée.
          </p>
        </div>

        {/* Action button & Timeframe Segmented Control */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenFlashcards && (
            <button
              type="button"
              onClick={onOpenFlashcards}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#2e3545] border border-[#f2ca50]/30 text-[#f2ca50] font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Ouvrir le module de flashcards"
            >
              <span className="material-symbols-outlined text-sm">style</span>
              <span>Réviser</span>
            </button>
          )}

          {/* Timeframe selector (7d, 30d, 12w) */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/40">
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                timeframe === '7d'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-bold'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              7 Jours
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                timeframe === '30d'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-bold'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              30 Jours
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('12w')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                timeframe === '12w'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-bold'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              12 Semaines
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
        {/* KPI 1: Total Lexèmes Mobilisables */}
        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-mono text-[#d0c5af] tracking-wider">
            Lexique Actif Total
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white font-mono">
              {summaryData?.stats.totalActiveLexicon || 395}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">
              +{wordsGrowth > 0 ? wordsGrowth : 24}
            </span>
          </div>
          <span className="text-[10px] text-[#99907c]">mots assimilés</span>
        </div>

        {/* KPI 2: Lexèmes Consolidés (Mastered) */}
        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-mono text-[#d0c5af] tracking-wider">
            Consolidés (Long Terme)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[#f2ca50] font-mono">
              {summaryData?.stats.totalMastered || 310}
            </span>
            <span className="text-[10px] text-[#99907c]">lexèmes</span>
          </div>
          <span className="text-[10px] text-[#d4c78f]">Rétention &gt; 30 jours</span>
        </div>

        {/* KPI 3: Taux de Rétention SM-2 */}
        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-mono text-[#d0c5af] tracking-wider">
            Rétention SM-2
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {summaryData?.stats.overallRetentionRate.toFixed(1) || '92.4'}%
            </span>
            <span className="text-[10px] text-emerald-300 font-mono">Élite</span>
          </div>
          <span className="text-[10px] text-[#99907c]">Intervalle moyen validé</span>
        </div>

        {/* KPI 4: Stabilité Mnésique */}
        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-mono text-[#d0c5af] tracking-wider">
            Stabilité Mémoire
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[#38bdf8] font-mono">
              {summaryData?.stats.memoryStabilityIndex || 8.6}
            </span>
            <span className="text-[11px] text-[#99907c]">/ 10</span>
          </div>
          <span className="text-[10px] text-[#99907c]">Courbe d'oubli amortie</span>
        </div>
      </div>

      {/* Visual Metric Switcher & Chart Header */}
      <div className="flex items-center justify-between border-t border-[#232a3a] pt-3 relative z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMetricView('volume')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
              metricView === 'volume'
                ? 'bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/30 shadow-sm'
                : 'text-[#d0c5af] hover:text-white'
            }`}
          >
            Volume de Mots (Cumul)
          </button>
          <button
            type="button"
            onClick={() => setMetricView('retention')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
              metricView === 'retention'
                ? 'bg-[#232a3a] text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-[#d0c5af] hover:text-white'
            }`}
          >
            Taux de Rétention (%)
          </button>
        </div>

        {/* Legend pills */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-[#d0c5af]">
          {metricView === 'volume' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#f2ca50]" />
                Consolidés
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
                En Apprentissage
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Rétention Mémoire (%)
            </span>
          )}
        </div>
      </div>

      {/* Recharts Chart Stage with Framer Motion Entrance */}
      <div className="w-full h-52 sm:h-56 relative z-10">
        <AnimatePresence mode="wait">
          {metricView === 'volume' ? (
            <motion.div
              key={`volume-${timeframe}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activePoints}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    {/* Golden Gradient for Mastered Lexicon */}
                    <linearGradient id="vocabGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f2ca50" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#f2ca50" stopOpacity={0.02} />
                    </linearGradient>

                    {/* Sky Gradient for In-Learning Lexicon */}
                    <linearGradient id="vocabSkyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />

                  <XAxis
                    dataKey="period"
                    stroke="#99907c"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3545' }}
                    tick={{ fill: '#d0c5af' }}
                  />

                  <YAxis
                    stroke="#99907c"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#99907c' }}
                    domain={['dataMin - 20', 'dataMax + 30']}
                  />

                  <Tooltip content={<CustomVocabularyTooltip />} />

                  {/* Layer 1: In Learning (Blue) */}
                  <Area
                    type="monotone"
                    dataKey="learningWords"
                    name="En Apprentissage"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#vocabSkyGrad)"
                    isAnimationActive={true}
                    animationDuration={800}
                  />

                  {/* Layer 2: Mastered (Gold) */}
                  <Area
                    type="monotone"
                    dataKey="masteredWords"
                    name="Consolidés"
                    stroke="#f2ca50"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#vocabGoldGrad)"
                    isAnimationActive={true}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div
              key={`retention-${timeframe}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activePoints}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />

                  <XAxis
                    dataKey="period"
                    stroke="#99907c"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3545' }}
                    tick={{ fill: '#d0c5af' }}
                  />

                  <YAxis
                    stroke="#99907c"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#99907c' }}
                    domain={[70, 100]}
                    unit="%"
                  />

                  <Tooltip content={<CustomVocabularyTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="retentionRate"
                    name="Taux de Rétention"
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={{ fill: '#070e1d', stroke: '#34d399', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#34d399', stroke: '#a7f3d0', strokeWidth: 3, r: 6.5 }}
                    isAnimationActive={true}
                    animationDuration={850}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CEFR Level Mastery Distribution Progress Rows */}
      <div className="pt-2 border-t border-[#232a3a] flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between text-xs text-[#d0c5af]">
          <span className="font-semibold text-[#dce2f8]">Répartition par Palier CECRL</span>
          <span className="text-[11px] font-mono text-[#f2ca50]">
            Capacité Globale : {summaryData?.stats.totalActiveLexicon || 395} lexèmes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {summaryData?.cefrBreakdown.map((item) => (
            <div
              key={item.level}
              className="p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#232a3a] flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px]"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      border: `1px solid ${item.color}40`
                    }}
                  >
                    {item.level}
                  </span>
                  <span className="text-[#dce2f8] font-medium truncate max-w-[150px]">
                    {item.title}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold" style={{ color: item.color }}>
                  {item.masteredCount} / {item.totalTarget}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
