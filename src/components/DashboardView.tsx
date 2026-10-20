import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, LearningAttempt } from '../firebase/types';
import {
  isFirebaseConfigured,
  getSevenDayScoreHistory,
  type SevenDayDataPoint
} from '../firebase/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncStatus } from '../offline/useSyncStatus';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SevenDayDataPoint }>;
}

const CustomScoreTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const sourceLabel =
      data.source === 'firestore'
        ? 'Cloud Firestore'
        : data.source === 'indexeddb'
        ? 'IndexedDB Persistant'
        : 'Cache Local';

    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/50 p-3 shadow-2xl backdrop-blur-md min-w-[200px]">
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#d4c78f] border-b border-[#232a3a] pb-1 mb-1.5 font-mono">
          <span className="font-bold text-[#f2ca50]">{data.label}</span>
          <span className="text-[10px] text-[#99907c]">{data.dateKey}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-[#dce2f8]">Score Moyen :</span>
          <span className="text-sm font-bold text-[#f2ca50] font-mono">{data.score}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[11px] text-[#d0c5af]/80 mt-1 font-mono">
          <span>Points Acquis :</span>
          <span className="text-[#d4c78f] font-semibold">+{data.xp} XP</span>
        </div>
        <div className="mt-2 pt-1 border-t border-[#232a3a] text-[10px] text-[#99907c] truncate flex items-center justify-between">
          <span className="truncate max-w-[120px]">{data.module}</span>
          <span className="px-1.5 py-0.2 rounded bg-[#232a3a] text-[#f2ca50] font-mono text-[9px]">
            {sourceLabel}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardViewProps {
  user: UserProfile;
  onResumePractice: () => void;
  onUpdateStudyTarget: (minutes: number) => void;
  onOpenProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onResumePractice,
  onUpdateStudyTarget,
  onOpenProfile
}) => {
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<number>(user.stats.studyMinutesTarget || 30);
  const [chartMetric, setChartMetric] = useState<'score' | 'cadence'>('score');

  const {
    isOnline,
    isSyncing,
    pendingCount,
    totalOfflineRecords,
    lastSyncTime,
    triggerSync,
    refreshStats
  } = useSyncStatus();

  // Live Firestore & IndexedDB score evolution state
  const [scoreData, setScoreData] = useState<SevenDayDataPoint[]>([]);
  const [dataSource, setDataSource] = useState<'firestore' | 'indexeddb' | 'cache'>('cache');
  const [avgScore, setAvgScore] = useState<number>(89);
  const [peakScore, setPeakScore] = useState<number>(96);
  const [peakDay, setPeakDay] = useState<string>('Dim');
  const [recentAttempts, setRecentAttempts] = useState<LearningAttempt[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadHistory = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getSevenDayScoreHistory(user.uid);
      setScoreData(res.history);
      setDataSource(res.source);
      setAvgScore(res.averageScore);
      setPeakScore(res.peakScore);
      setPeakDay(res.peakDay);
      setRecentAttempts(res.recentAttempts);
      await refreshStats();
    } catch (e) {
      console.warn('Error fetching Firestore history', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [user.uid, refreshStats]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, user.stats.totalXp, user.stats.completedModules]);

  const handleManualSync = async () => {
    await triggerSync();
    await loadHistory();
  };

  const handleSaveTarget = () => {
    onUpdateStudyTarget(selectedTarget);
    setShowAdjustModal(false);
  };

  // Circular gauge calculations for 78% mastery
  const circumference = 251.2; // 2 * PI * 40
  const progressRatio = user.stats.masteryPercentage / 100;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 pb-24 gap-4 select-none">
      {/* Top Welcome / Prestige Status Banner */}
      <section className="relative w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#f2ca50]/10 blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-[#232a3a] border border-[#f2ca50]/20">
              <span
                className="material-symbols-outlined text-[#f2ca50] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
              <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
                Échelon Supérieur • {user.level}
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl text-[#dce2f8] font-bold truncate">
              Niveau {user.level} — Maîtrise Opérationnelle
            </h2>
            <p className="text-xs text-[#d0c5af]/80">
              Cursus Rhétorique, Philologie & Style Diplomatique
            </p>
          </div>

          {/* Flame Streak Counter */}
          <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-[#070e1d]/90 border border-[#4d4635]/40 shadow-inner shrink-0">
            <div className="flex items-center gap-1 text-[#f2ca50]">
              <span
                className="material-symbols-outlined text-xl animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="text-lg font-bold font-mono tracking-tight">
                {user.stats.streakDays}
              </span>
            </div>
            <span className="text-[9px] text-[#d0c5af] uppercase tracking-wider font-semibold">
              Jours
            </span>
          </div>
        </div>

        {/* Quick Stats Metric Pills */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#232a3a]">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#4d4635]/20">
            <div className="w-8 h-8 rounded-full bg-[#f2ca50]/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">bolt</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#d0c5af] uppercase tracking-wider">XP Hebdo</span>
              <span className="text-sm font-bold text-[#f2ca50] font-mono truncate">
                {user.stats.weeklyXp.toLocaleString()} XP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#4d4635]/20">
            <div className="w-8 h-8 rounded-full bg-[#d4c78f]/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#d4c78f] text-lg">hotel_class</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#d0c5af] uppercase tracking-wider">Rang Global</span>
              <span className="text-sm font-bold text-[#d4c78f] font-mono truncate">
                Top 3% Oxford
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Mastery Card & Radial Gauge */}
      <section className="relative w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] text-[#f2ca50] uppercase tracking-widest font-bold">
            Avancement Annuel
          </span>
          <h3 className="font-serif text-lg sm:text-xl text-[#dce2f8] font-bold">
            Curriculum {user.level} Réussi
          </h3>
          <p className="text-xs text-[#d0c5af]/80">
            {user.stats.completedModules} modules sur {user.stats.totalModules} complétés avec mention d’excellence.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/30 text-[11px] font-semibold text-[#f2ca50]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]" />
              +4.2% cette semaine
            </span>
          </div>
        </div>

        {/* Champagne Radial Gauge SVG */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#232a3a"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f2ca50"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-serif text-lg font-bold text-[#f2ca50] leading-none">
              {user.stats.masteryPercentage}%
            </span>
            <span className="text-[9px] text-[#d0c5af] uppercase tracking-tighter mt-0.5 font-sans">
              Validé
            </span>
          </div>
        </div>
      </section>

      {/* Weekly Objectives Breakdown */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-semibold">
            Objectifs Hebdomadaires
          </h3>
          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="text-xs text-[#f2ca50] hover:text-[#ffe088] flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Ajuster</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {/* Goal 1: Dictée */}
          <div className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-base">edit_note</span>
                <span className="text-[#dce2f8] font-medium">Dictées Lexicales Avancées</span>
              </div>
              <span className="text-[#f2ca50] font-bold font-mono">3 / 4</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <div className="h-full bg-[#f2ca50] rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          {/* Goal 2: Flashcards */}
          <div className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4c78f] text-base">style</span>
                <span className="text-[#dce2f8] font-medium">Vocabulaire Spécialisé SM-2</span>
              </div>
              <span className="text-[#d4c78f] font-bold font-mono">150 / 150</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <div className="h-full bg-[#d4c78f] rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Goal 3: Speaking */}
          <div className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e9cd67] text-base">mic</span>
                <span className="text-[#dce2f8] font-medium">Enregistrements Rhétoriques</span>
              </div>
              <span className="text-[#e9cd67] font-bold font-mono">2 / 2</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <div className="h-full bg-[#e9cd67] rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Goal 4: Daily study pace */}
          <div className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-base">hourglass_bottom</span>
                <span className="text-[#dce2f8] font-medium">Cadence Quotidienne</span>
              </div>
              <span className="text-[#f2ca50] font-bold font-mono">
                {user.stats.studyMinutesToday} / {user.stats.studyMinutesTarget} min
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <div
                className="h-full bg-[#f2ca50] rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((user.stats.studyMinutesToday / user.stats.studyMinutesTarget) * 100)
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7-Day Performance & Score Evolution Section with Recharts */}
      <section className="w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-3">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">trending_up</span>
              <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-bold">
                Évolution du Score sur 7 Jours
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  dataSource === 'firestore'
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                    : dataSource === 'indexeddb'
                    ? 'bg-sky-950/60 text-sky-400 border-sky-500/40'
                    : 'bg-[#232a3a] text-[#d4c78f] border-[#f2ca50]/20'
                }`}
                title="Origine des métriques d'apprentissage"
              >
                {dataSource === 'firestore'
                  ? 'Cloud Firestore'
                  : dataSource === 'indexeddb'
                  ? 'IndexedDB (Hors-Ligne)'
                  : 'Cache & Démo'}
              </span>
            </div>
            <span className="text-xs text-[#d0c5af]/80">
              Historique des dictées, flashcards et quiz consolidé (synchronisation automatique)
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Refresh button */}
            <button
              type="button"
              onClick={() => loadHistory()}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/40 text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 disabled:opacity-50"
              title="Synchroniser avec Cloud Firestore"
            >
              <span className={`material-symbols-outlined text-base ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
            </button>

            {/* Toggle between Recharts Line Chart and Cadence */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/40">
              <button
                type="button"
                onClick={() => setChartMetric('score')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  chartMetric === 'score'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                Score (%)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('cadence')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  chartMetric === 'cadence'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                Volume (XP)
              </button>
            </div>
          </div>
        </div>

        {/* Recharts LineChart Container with Framer Motion Entrance Animation */}
        <AnimatePresence mode="wait">
          {chartMetric === 'score' ? (
            <motion.div
              key="chart-metric-score"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full pt-2"
            >
              {/* Quick KPI ribbon */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#232a3a] mb-2 font-mono">
                <div className="flex items-center gap-1.5 text-[#d4c78f]">
                  <span className="w-2 h-2 rounded-full bg-[#f2ca50]" />
                  <span>Moyenne 7J : <strong className="text-[#f2ca50]">{avgScore.toFixed(1)}%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#d0c5af]">Pic : <strong className="text-[#f2ca50]">{peakScore}%</strong> ({peakDay})</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/15 text-[#f2ca50] font-bold text-[10px]">
                    +{Math.max(0, peakScore - (scoreData[0]?.score || 80))}%
                  </span>
                </div>
              </div>

              {/* Recharts Interactive Line Chart with subtle framer-motion entrance float & scale */}
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08
                }}
                className="w-full h-48 select-none"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={scoreData.length > 0 ? scoreData : [
                      { day: 'Lun', score: 82, xp: 280, label: 'Lundi', module: 'Dictée C1', dateKey: '', attemptsCount: 1, source: 'cache' },
                      { day: 'Mar', score: 86, xp: 340, label: 'Mardi', module: 'Flashcards', dateKey: '', attemptsCount: 1, source: 'cache' },
                      { day: 'Mer', score: 85, xp: 310, label: 'Mercredi', module: 'Quiz Nuances', dateKey: '', attemptsCount: 1, source: 'cache' },
                      { day: 'Jeu', score: 94, xp: 420, label: 'Jeudi', module: 'Nuance Matrix', dateKey: '', attemptsCount: 1, source: 'cache' },
                      { day: 'Ven', score: 89, xp: 360, label: 'Vendredi', module: 'Speaking Studio', dateKey: '', attemptsCount: 1, source: 'cache' },
                      { day: 'Sam', score: 92, xp: 390, label: 'Samedi', module: 'Dictée C1', dateKey: '', attemptsCount: 1, source: 'cache' },
                      { day: 'Dim', score: 96, xp: 450, label: 'Dimanche', module: 'Bretton Woods', dateKey: '', attemptsCount: 1, source: 'cache' }
                    ]}
                    margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#99907c"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#2e3545' }}
                      tick={{ fill: '#d0c5af' }}
                    />
                    <YAxis
                      domain={[60, 100]}
                      ticks={[60, 70, 80, 90, 100]}
                      unit="%"
                      stroke="#99907c"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#99907c' }}
                    />
                    <Tooltip
                      content={<CustomScoreTooltip />}
                      cursor={{ stroke: '#f2ca50', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#f2ca50"
                      strokeWidth={3}
                      dot={{ fill: '#070e1d', stroke: '#f2ca50', strokeWidth: 2, r: 4.5 }}
                      activeDot={{ fill: '#f2ca50', stroke: '#ffe088', strokeWidth: 3, r: 7 }}
                      isAnimationActive={true}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <p className="text-[11px] text-[#99907c] text-center pt-2 italic">
                Données issues de l'historique Firestore • Survolez chaque point pour voir le détail de l'épreuve.
              </p>
            </motion.div>
          ) : (
            /* Volume / Effort Distribution View */
            <motion.div
              key="chart-metric-cadence"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2"
            >
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#232a3a] mb-2 font-mono">
                <span className="text-[#d4c78f]">
                  Total XP Hebdomadaire :{' '}
                  <strong className="text-[#f2ca50]">
                    {scoreData.reduce((acc, curr) => acc + curr.xp, 0).toLocaleString()} XP
                  </strong>
                </span>
                <span className="text-[#d0c5af]">Cadence : Assiduité 7/7</span>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 pb-1 px-1">
                {scoreData.map((bar, idx) => {
                  const maxXp = Math.max(1, ...scoreData.map((d) => d.xp));
                  const pct = Math.max(20, Math.round((bar.xp / maxXp) * 100));
                  const isToday = idx === scoreData.length - 1;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className={`w-full max-w-[24px] rounded-t-md transition-all group-hover:scale-105 ${
                          isToday
                            ? 'bg-[#f2ca50] shadow-[0_0_12px_rgba(242,202,80,0.5)]'
                            : bar.score >= 90
                            ? 'bg-[#f2ca50]/90 shadow-[0_0_8px_rgba(242,202,80,0.3)]'
                            : 'bg-[#f2ca50]/60'
                        }`}
                        title={`${bar.label} : ${bar.xp} XP (Score ${bar.score}%)`}
                      />
                      <span
                        className={`text-xs font-mono ${
                          isToday ? 'text-[#f2ca50] font-bold' : 'text-[#d0c5af]'
                        }`}
                      >
                        {bar.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Recent Validated Trials */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-semibold">
            Dernières Épreuves Validées
          </h3>
          <span className="text-xs text-[#f2ca50] font-mono uppercase tracking-wider">
            Contrôle Continu
          </span>
        </div>

        {/* Dynamic Recent Trials List */}
        {recentAttempts.length > 0 ? (
          recentAttempts.slice(0, 3).map((att) => (
            <div
              key={att.attemptId}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#232a3a] flex items-center justify-center shrink-0 text-[#f2ca50]">
                  <span className="material-symbols-outlined text-xl">
                    {att.moduleType === 'dictation'
                      ? 'edit_note'
                      : att.moduleType === 'quiz'
                      ? 'quiz'
                      : att.moduleType === 'speaking'
                      ? 'mic'
                      : 'style'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#dce2f8] truncate">
                      {att.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f2ca50]/15 text-[#f2ca50] font-bold font-mono">
                      {att.level}
                    </span>
                  </div>
                  <span className="text-xs text-[#d0c5af]/80">
                    {att.completedAt ? new Date(att.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Récemment'} • {att.moduleType.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-sm font-bold text-[#f2ca50] font-mono">{att.score}%</span>
                <span className="text-[10px] text-[#d4c78f] uppercase">
                  {att.score >= 95 ? 'Émérite' : att.score >= 85 ? 'Maîtrisé' : 'Acquis'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Fallback Benchmark Module 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#232a3a] flex items-center justify-center shrink-0 text-[#f2ca50]">
                  <span className="material-symbols-outlined text-xl">history_edu</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#dce2f8] truncate">
                      Dictée C1 — Édition Élysée
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f2ca50]/15 text-[#f2ca50] font-bold font-mono">
                      C1
                    </span>
                  </div>
                  <span className="text-xs text-[#d0c5af]/80">Durée: 14 min • Transcription audio</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-sm font-bold text-[#f2ca50] font-mono">96%</span>
                <span className="text-[10px] text-[#d4c78f] uppercase">Émérite</span>
              </div>
            </div>

            {/* Fallback Benchmark Module 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#232a3a] flex items-center justify-center shrink-0 text-[#d4c78f]">
                  <span className="material-symbols-outlined text-xl">auto_stories</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#dce2f8] truncate">
                      Flashcards Idiomes B2/C1
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4c78f]/15 text-[#d4c78f] font-bold font-mono">
                      B2+
                    </span>
                  </div>
                  <span className="text-xs text-[#d0c5af]/80">Durée: 08 min • Rétention espacée</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-sm font-bold text-[#d4c78f] font-mono">100%</span>
                <span className="text-[10px] text-[#d4c78f] uppercase">Parfait</span>
              </div>
            </div>

            {/* Fallback Benchmark Module 3 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#232a3a] flex items-center justify-center shrink-0 text-[#f2ca50]">
                  <span className="material-symbols-outlined text-xl">record_voice_over</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#dce2f8] truncate">
                      Speaking — Oxford Debates
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f2ca50]/15 text-[#f2ca50] font-bold font-mono">
                      C2
                    </span>
                  </div>
                  <span className="text-xs text-[#d0c5af]/80">Durée: 22 min • Analyse de fluidité</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-sm font-bold text-[#f2ca50] font-mono">92%</span>
                <span className="text-[10px] text-[#d4c78f] uppercase">Maîtrisé</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* IndexedDB Persistent Offline Storage & Cloud Firestore Sync Section */}
      <section className="w-full rounded-2xl bg-[#070e1d]/90 p-5 border border-[#4d4635]/40 flex flex-col gap-3.5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f2ca50]/50 to-transparent" />
        
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#232a3a] border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
              <span className="material-symbols-outlined text-lg">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm text-[#dce2f8]">
                  Stockage Local Persistant IndexedDB
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/15 text-[#f2ca50] text-[10px] font-mono font-bold">
                  v1.0 ACTIF
                </span>
              </div>
              <p className="text-[11px] text-[#99907c]">
                Fonctionnement autonome sans connexion internet • Synchronisation automatique en arrière-plan
              </p>
            </div>
          </div>

          {/* Network State Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-950/70 text-amber-300 border-amber-500/50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isOnline ? 'En Ligne • Synchronisé' : 'Mode Hors-Ligne Actif'}</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Mini Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-mono text-[#d0c5af]">Épreuves Enregistrées</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#f2ca50] font-mono">
                {totalOfflineRecords > 0 ? totalOfflineRecords : '14'}
              </span>
              <span className="text-[11px] text-[#99907c]">dans IndexedDB</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-mono text-[#d0c5af]">File d'Attente Sync</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-base font-bold font-mono ${
                  pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {pendingCount}
              </span>
              <span className="text-[11px] text-[#99907c]">
                {pendingCount === 0 ? 'À jour' : 'en attente'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-mono text-[#d0c5af]">Dernière Synchronisation</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-[#dce2f8] font-mono truncate">
                {lastSyncTime
                  ? new Date(lastSyncTime).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : 'Récemment'}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Action and Reassurance text */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#191f2f]">
          <p className="text-xs text-[#d0c5af]/80 leading-relaxed">
            Même sans réseau, vos dictées, quiz, cartes SM-2 et points XP sont conservés de façon persistante dans le navigateur.
          </p>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 shrink-0 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser Maintenant'}</span>
          </button>
        </div>
      </section>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onResumePractice}
        className="w-full py-3.5 px-6 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-base shadow-xl shadow-[#f2ca50]/20 hover:bg-[#ffe088] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          play_circle
        </span>
        <span>Reprendre la Session Quotidienne</span>
      </button>

      {/* Modal d'ajustement du rythme */}
      {showAdjustModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#191f2f] p-6 border border-[#f2ca50]/40 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#dce2f8]">Rythme & Contrat</h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-full bg-[#232a3a] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Ajustez l’intensité académique de vos sessions quotidiennes pour maintenir votre niveau d’excellence.
            </p>

            <div className="grid grid-cols-3 gap-2 py-2">
              {[20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedTarget(mins)}
                  className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
                    selectedTarget === mins
                      ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/30'
                      : 'bg-[#232a3a] text-[#dce2f8] hover:bg-[#2e3545]'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSaveTarget}
              className="w-full py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#ffe088] transition-colors"
            >
              Enregistrer l’Engagement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
