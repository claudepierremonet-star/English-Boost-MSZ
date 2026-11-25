import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
  type Variants
} from 'framer-motion';
import { useSyncStatus } from '../offline/useSyncStatus';
import { VocabularyMasterySummary } from './VocabularyMasterySummary';
import { StudyCalendarWidget } from './StudyCalendarWidget';
import { MszShop } from './MszShop';
import { MszShopModal } from './MszShopModal';
import { STUDY_FOLIOS } from '../data/curriculum';
import { speakText, stopSpeech } from '../services/speechService';
import { calculateLevel } from '../utils/levelUtils';
import { exportProgressReportPdf } from '../utils/progressPdfExporter';
import { AppNoticeModal } from './AppNoticeModal';
import { LinguisticRadarSection } from './LinguisticRadarSection';
import type { EcosystemLaunchTarget } from './SmartEcosystemHub';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';
import { LexicalMasteryD3Chart } from './LexicalMasteryD3Chart';
import { MotionTooltip } from './MotionTooltip';

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

const CustomXpTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const sourceLabel =
      data.source === 'firestore'
        ? 'Cloud Firestore'
        : data.source === 'indexeddb'
        ? 'IndexedDB Persistant'
        : 'Cache Local';

    const isExcellence = data.xp >= 350;

    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/60 p-3.5 shadow-2xl backdrop-blur-md min-w-[220px]">
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#d4c78f] border-b border-[#232a3a] pb-1.5 mb-2 font-mono">
          <span className="font-bold text-[#f2ca50] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
            {data.label}
          </span>
          <span className="text-[10px] text-[#99907c]">{data.dateKey}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-[#dce2f8] font-medium">XP Enregistrés :</span>
          <span className="text-base font-bold text-[#f2ca50] font-mono tracking-tight">+{data.xp} XP</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[11px] text-[#d0c5af]/90 mt-1 font-mono">
          <span>Régularité :</span>
          <span className={`font-semibold flex items-center gap-1 ${isExcellence ? 'text-emerald-400' : 'text-[#f2ca50]'}`}>
            <span>{isExcellence ? '★' : '✓'}</span>
            <span>{isExcellence ? 'Objectif Dépassé' : 'Seuil Atteint'}</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[11px] text-[#99907c] mt-1 font-mono">
          <span>Précision d'épreuve :</span>
          <span className="text-[#cbd5e1] font-semibold">{data.score}%</span>
        </div>
        <div className="mt-2.5 pt-1.5 border-t border-[#232a3a] text-[10px] text-[#99907c] flex items-center justify-between">
          <span className="truncate max-w-[130px]">{data.module}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#232a3a] text-[#f2ca50] font-mono text-[9px] font-bold">
            {sourceLabel}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const luxuryEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ODOMETER_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface FramerRollingCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  formatLocale?: boolean;
  delayStep?: number;
  className?: string;
}

/**
 * Compteur numérique dynamique propulsé par Framer Motion :
 * - Chaque chiffre possède un tambour vertical (0..9) animé par ressort GPU
 * - Préserve le défilement fluide lors des incréments d'XP et de minutes d'étude en direct
 */
const FramerRollingCounter: React.FC<FramerRollingCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  formatLocale = false,
  delayStep = 0.04,
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion();
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  const formatted = formatLocale ? safeValue.toLocaleString('fr-FR') : String(safeValue);
  const chars = Array.from(formatted);

  const pulseScale = useMotionValue(1);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (shouldReduceMotion) return;
    const ctrl = animate(pulseScale, [1, 1.08, 1], {
      duration: 0.38,
      ease: luxuryEase
    });
    return () => ctrl.stop();
  }, [safeValue, shouldReduceMotion, pulseScale]);

  let digitOrdinal = 0;

  return (
    <motion.span
      style={shouldReduceMotion ? undefined : { scale: pulseScale }}
      aria-label={`${prefix}${formatted}${suffix}`}
      className={`inline-flex items-baseline tabular-nums will-change-transform ${className}`}
    >
      {prefix && (
        <span aria-hidden="true" className="whitespace-pre">
          {prefix}
        </span>
      )}

      {chars.map((char, idx) => {
        const posFromRight = chars.length - 1 - idx;
        if (/^[0-9]$/.test(char)) {
          const digit = Number(char);
          const staggerDelay = shouldReduceMotion ? 0 : Math.min(0.28, digitOrdinal * delayStep);
          digitOrdinal += 1;

          return (
            <span
              key={`digit-pos-${posFromRight}`}
              aria-hidden="true"
              className="relative inline-block overflow-hidden align-bottom h-[1.15em] leading-[1.15em] tabular-nums"
            >
              <span className="invisible select-none">{char}</span>
              <motion.span
                initial={shouldReduceMotion ? false : { y: '0%' }}
                animate={{ y: `-${digit * 10}%` }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 92,
                        damping: 16,
                        mass: 0.85,
                        delay: staggerDelay
                      }
                }
                className="absolute left-0 top-0 flex flex-col w-full text-center will-change-transform"
              >
                {ODOMETER_DIGITS.map((d) => (
                  <span key={d} className="h-[1.15em] leading-[1.15em] block">
                    {d}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        }

        return (
          <span key={`sep-pos-${posFromRight}-${char}`} aria-hidden="true" className="inline-block whitespace-pre">
            {char}
          </span>
        );
      })}

      {suffix && (
        <span aria-hidden="true" className="whitespace-pre">
          {suffix}
        </span>
      )}
    </motion.span>
  );
};

// Orchestrated luxury entrance variants with progressive staggered reveal
const dashboardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.03
    }
  }
};

const dashboardCardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: luxuryEase
    }
  }
};

const staggeredListContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06
    }
  }
};

const subItemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: luxuryEase
    }
  }
};

const lessonCardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: luxuryEase
    }
  }
};

interface DashboardViewProps {
  user: UserProfile;
  onResumePractice: () => void;
  onUpdateStudyTarget: (minutes: number) => void;
  onOpenProfile?: () => void;
  onOpenFlashcards?: () => void;
  onNavigateLeaderboard?: () => void;
  onLaunchEcosystemModule?: (target: EcosystemLaunchTarget) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onResumePractice,
  onUpdateStudyTarget,
  onOpenProfile,
  onOpenFlashcards,
  onNavigateLeaderboard,
  onLaunchEcosystemModule
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [dashboardTab, setDashboardTab] = useState<'all' | 'mastery' | 'analytics' | 'curriculum'>('all');
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<number>(user.stats.studyMinutesTarget || 30);
  const [chartMetric, setChartMetric] = useState<'xp' | 'score'>('xp');
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);

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
  const [playingFolioId, setPlayingFolioId] = useState<string | null>(null);
  const [folioAccents, setFolioAccents] = useState<Record<string, 'en-GB' | 'en-US'>>({});
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfExportedLabel, setPdfExportedLabel] = useState<string | null>(null);
  const dashboardNavRef = useRef<HTMLElement | null>(null);

  const handleExportProgressPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfExportedLabel(null);
    try {
      const res = await exportProgressReportPdf({ user });
      setPdfExportedLabel(`PDF prêt (${res.pagesCount} p.)`);
      setTimeout(() => setPdfExportedLabel(null), 3500);
    } catch (err) {
      console.error('Erreur export PDF Dashboard:', err);
      setPdfExportedLabel('Erreur export');
      setTimeout(() => setPdfExportedLabel(null), 3500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePlayFolioAudio = (folio: (typeof STUDY_FOLIOS)[0]) => {
    if (playingFolioId === folio.id) {
      stopSpeech();
      setPlayingFolioId(null);
      return;
    }
    const defaultAccent = folio.accent.toLowerCase().includes('american') ? 'en-US' : 'en-GB';
    const accent = folioAccents[folio.id] || defaultAccent;
    stopSpeech();
    setPlayingFolioId(folio.id);

    const textToRead = `${folio.title}. ${folio.subtitle}. Curriculum level ${folio.level}. Duration approximately ${folio.duration}.`;
    speakText(textToRead, accent, folio.id, {
      onEnd: () => setPlayingFolioId(null),
      onError: () => setPlayingFolioId(null)
    });
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

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

  // Circular gauge calculations for mastery
  const circumference = 251.2; // 2 * PI * 40
  const progressRatio = user.stats.masteryPercentage / 100;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <motion.div
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col w-full px-4 sm:px-6 pb-24 gap-4 select-none"
    >
      {/* Top Welcome / Prestige Status Banner & User Stats */}
      <motion.section
        variants={dashboardCardVariants}
        className="relative w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 overflow-hidden backdrop-blur-md"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#f2ca50]/10 blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-[#232a3a] border border-[#f2ca50]/20"
            >
              <span
                className="material-symbols-outlined text-[#f2ca50] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
              <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
                Échelon Supérieur • {user.level}
              </span>
            </motion.div>
            <h2 className="font-serif text-lg sm:text-2xl text-[#dce2f8] font-bold truncate">
              Niveau {user.level} — Maîtrise Opérationnelle
            </h2>
            <p className="text-xs text-[#d0c5af]/80">
              Cursus Rhétorique, Philologie & Style Diplomatique
            </p>
          </div>

          {/* Notice Guide + Quick PDF Report Export + Streak Counter */}
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            <MotionTooltip
              title="Notice Visuelle"
              content="Ouvre le guide interactif complet des modules et raccourcis."
              placement="bottom"
            >
              <button
                type="button"
                onClick={() => setIsNoticeOpen(true)}
                aria-label="Ouvrir la notice visuelle complète de l'application"
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#070e1d]/90 border border-[#f2ca50]/50 hover:border-[#f2ca50] hover:bg-[#f2ca50]/15 text-[#f2ca50] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-inner whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>Notice</span>
              </button>
            </MotionTooltip>

            <MotionTooltip
              title="Export PDF"
              content="Génère un relevé PDF de vos statistiques, séries et progrès."
              placement="bottom"
            >
              <button
                type="button"
                onClick={handleExportProgressPdf}
                disabled={isExportingPdf}
                aria-label="Exporter vos statistiques et progrès en rapport PDF"
                className="min-h-[40px] px-3 py-2 rounded-xl bg-[#070e1d]/90 border border-[#f2ca50]/35 hover:border-[#f2ca50] hover:bg-[#f2ca50]/15 text-[#f2ca50] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-inner disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-base ${isExportingPdf ? 'animate-spin' : ''}`}>
                  {isExportingPdf ? 'sync' : 'picture_as_pdf'}
                </span>
                <span className="hidden sm:inline">
                  {isExportingPdf ? 'Export...' : pdfExportedLabel || 'Rapport PDF'}
                </span>
              </button>
            </MotionTooltip>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 220, damping: 18 }}
              className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-[#070e1d]/90 border border-[#4d4635]/40 shadow-inner shrink-0"
            >
              <div className="flex items-center gap-1 text-[#f2ca50]">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
                <span className="text-lg font-bold font-mono tabular-nums tracking-tight">
                  <FramerRollingCounter value={user.stats.streakDays ?? 0} />
                </span>
              </div>
              <span className="text-[9px] text-[#d0c5af] uppercase tracking-wider font-semibold">
                Jours
              </span>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats Metric Cards with Hover and Staggered Sub-entry */}
        <motion.div
          variants={staggeredListContainerVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-[#232a3a]"
        >
          <MotionTooltip
            title="XP Hebdomadaire"
            content="Points gagnés cette semaine et cumul total • Cliquez pour ouvrir le classement."
            placement="top"
            wrapperClassName="flex w-full"
          >
            <motion.div
              variants={subItemVariants}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              onClick={onNavigateLeaderboard}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#4d4635]/20 hover:border-[#f2ca50]/50 transition-all shadow-sm ${
                onNavigateLeaderboard ? 'cursor-pointer hover:bg-[#1a233a]' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#f2ca50]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">bolt</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#d0c5af] uppercase tracking-wider flex items-center gap-1">
                  XP Hebdo
                  <span className="material-symbols-outlined text-[11px] text-[#f2ca50]">open_in_new</span>
                </span>
                <span className="text-sm font-bold text-[#f2ca50] font-mono truncate">
                  <FramerRollingCounter value={user.stats.weeklyXp ?? 0} formatLocale suffix=" XP" />
                </span>
                <span className="text-[10px] text-[#d0c5af]/85 font-mono truncate">
                  Cumul : <FramerRollingCounter value={user.stats.totalXp ?? 0} formatLocale suffix=" XP" />
                </span>
              </div>
            </motion.div>
          </MotionTooltip>

          <MotionTooltip
            title="Ligue d'Oxford"
            content="Votre division académique active • Cliquez pour consulter le podium."
            placement="top"
            wrapperClassName="flex w-full"
          >
            <motion.div
              variants={subItemVariants}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              onClick={onNavigateLeaderboard}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#4d4635]/20 hover:border-[#d4c78f]/50 transition-all shadow-sm ${
                onNavigateLeaderboard ? 'cursor-pointer hover:bg-[#1a233a]' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#d4c78f]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#d4c78f] text-lg">hotel_class</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#d0c5af] uppercase tracking-wider flex items-center gap-1">
                  Ligue Hebdo
                  <span className="material-symbols-outlined text-[11px] text-[#d4c78f]">leaderboard</span>
                </span>
                <span className="text-sm font-bold text-[#d4c78f] font-mono truncate">
                  Ligue Oxford
                </span>
              </div>
            </motion.div>
          </MotionTooltip>

          <MotionTooltip
            title="Temps d'Immersion"
            content="Minutes d'étude active enregistrées aujourd'hui et depuis vos débuts."
            placement="top"
            wrapperClassName="flex w-full"
          >
            <motion.div
              variants={subItemVariants}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#4d4635]/20 hover:border-[#f2ca50]/35 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#f2ca50]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">hourglass_top</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#d0c5af] uppercase tracking-wider">Temps / Jour</span>
                <span className="text-sm font-bold text-[#f2ca50] font-mono truncate">
                  <FramerRollingCounter value={user.stats.studyMinutesToday ?? 0} suffix=" min" />
                </span>
                <span className="text-[10px] text-[#d0c5af]/85 font-mono truncate">
                  Cumul : <FramerRollingCounter value={user.stats.totalImmersionMinutes ?? 0} formatLocale suffix=" min" />
                </span>
              </div>
            </motion.div>
          </MotionTooltip>

          <MotionTooltip
            title="Précision Moyenne"
            content="Score moyen obtenu sur vos quiz, dictées et exercices des 7 derniers jours."
            placement="top"
            wrapperClassName="flex w-full"
          >
            <motion.div
              variants={subItemVariants}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#151b2b]/70 border border-[#4d4635]/20 hover:border-[#d4c78f]/35 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#d4c78f]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#d4c78f] text-lg">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#d0c5af] uppercase tracking-wider">Précision Moy.</span>
                <span className="text-sm font-bold text-[#d4c78f] font-mono tabular-nums truncate">
                  <FramerRollingCounter value={Math.round(avgScore)} suffix="%" />
                </span>
              </div>
            </motion.div>
          </MotionTooltip>
        </motion.div>
      </motion.section>

      {/* FRAMER MOTION ANIMATED DASHBOARD SUB-TAB NAVIGATOR */}
      <nav
        ref={dashboardNavRef}
        aria-label="Onglets de progression du tableau de bord"
        className="relative flex items-center gap-1 p-1.5 rounded-full bg-[#151b2b] border border-[#232a3a] overflow-x-auto no-scrollbar"
      >
        <GlassSlidingCapsule containerRef={dashboardNavRef} activeKey={dashboardTab} />
        {[
          {
            id: 'all' as const,
            label: 'Vue Complète',
            icon: 'dashboard',
            tooltip: "Affiche tous vos indicateurs, graphiques D3, objectifs et folios."
          },
          {
            id: 'mastery' as const,
            label: 'Objectifs & Maîtrise',
            icon: 'verified',
            tooltip: "Jauge annuelle, objectifs hebdomadaires et radar linguistique."
          },
          {
            id: 'analytics' as const,
            label: 'Courbes 7J / 30J',
            icon: 'show_chart',
            tooltip: "Tendances XP/Score sur 7 jours, maîtrise lexicale D3 et épreuves."
          },
          {
            id: 'curriculum' as const,
            label: 'Cursus & Boutique',
            icon: 'auto_stories',
            tooltip: "Folios du cursus, calendrier d'étude, boutique 3D et synchro locale."
          }
        ].map((tab) => {
          const isActive = dashboardTab === tab.id;
          return (
            <MotionTooltip
              key={tab.id}
              title={tab.label}
              content={tab.tooltip}
              placement="top"
              delayMs={240}
              wrapperClassName="relative z-10 flex-1 min-w-fit flex"
            >
              <button
                type="button"
                data-capsule-key={tab.id}
                onClick={() => setDashboardTab(tab.id)}
                className={`relative z-10 w-full px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isActive ? 'glass-capsule-active-text font-bold' : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                <span className="relative z-10 material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            </MotionTooltip>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={`dashboard-panel-${dashboardTab}`}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: luxuryEase }}
          className="flex flex-col gap-4"
        >
          {(dashboardTab === 'all' || dashboardTab === 'mastery') && (
            <>
      {/* Curriculum Mastery Card & Radial Gauge (La Carte de Progression) */}
      <motion.section
        variants={dashboardCardVariants}
        initial="hidden"
        animate="show"
        whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.18 } }}
        className="relative w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex items-center justify-between gap-4 overflow-hidden"
      >
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
          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono tabular-nums font-semibold text-[#f2ca50]">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+4.2% cette semaine</span>
          </div>
        </div>

        {/* Champagne Radial Gauge SVG with Animated Stroke Sweep and Central Pop-in */}
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
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f2ca50"
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 1.25, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(242,202,80,0.4)]"
            />
          </svg>
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <span className="font-serif text-lg font-bold text-[#f2ca50] leading-none">
              <FramerRollingCounter value={user.stats.masteryPercentage ?? 0} suffix="%" />
            </span>
            <span className="text-[9px] text-[#d0c5af] uppercase tracking-tighter mt-0.5 font-sans">
              Validé
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* Weekly Objectives Breakdown with Smoothly Filling Progress Bars */}
      <motion.section
        variants={dashboardCardVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-semibold">
            Objectifs Hebdomadaires
          </h3>
          <MotionTooltip
            title="Objectif Quotidien"
            content="Ajuster votre rythme cible entre 20, 30 ou 45 minutes par jour."
            placement="top"
          >
            <button
              type="button"
              onClick={() => setShowAdjustModal(true)}
              className="text-xs text-[#f2ca50] hover:text-[#ffe088] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Ajuster</span>
            </button>
          </MotionTooltip>
        </div>

        <motion.div
          variants={staggeredListContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {/* Goal 1: Dictée */}
          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 hover:border-[#f2ca50]/30 transition-all flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-base">edit_note</span>
                <span className="text-[#dce2f8] font-medium">Dictées Lexicales Avancées</span>
              </div>
              <span className="text-[#f2ca50] font-bold font-mono tabular-nums">3 / 4</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 0.75 }}
                transition={{ duration: 0.75, delay: 0.15, ease: luxuryEase }}
                style={{ transformOrigin: 'left center' }}
                className="w-full h-full bg-[#f2ca50] rounded-full shadow-[0_0_8px_rgba(242,202,80,0.4)]"
              />
            </div>
          </motion.div>

          {/* Goal 2: Flashcards */}
          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 hover:border-[#d4c78f]/30 transition-all flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4c78f] text-base">style</span>
                <span className="text-[#dce2f8] font-medium">Vocabulaire Spécialisé SM-2</span>
              </div>
              <span className="text-[#d4c78f] font-bold font-mono tabular-nums">150 / 150</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.75, delay: 0.22, ease: luxuryEase }}
                style={{ transformOrigin: 'left center' }}
                className="w-full h-full bg-[#d4c78f] rounded-full shadow-[0_0_8px_rgba(212,199,143,0.4)]"
              />
            </div>
          </motion.div>

          {/* Goal 3: Speaking */}
          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 hover:border-[#e9cd67]/30 transition-all flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e9cd67] text-base">mic</span>
                <span className="text-[#dce2f8] font-medium">Enregistrements Rhétoriques</span>
              </div>
              <span className="text-[#e9cd67] font-bold font-mono tabular-nums">2 / 2</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.75, delay: 0.29, ease: luxuryEase }}
                style={{ transformOrigin: 'left center' }}
                className="w-full h-full bg-[#e9cd67] rounded-full shadow-[0_0_8px_rgba(233,205,103,0.4)]"
              />
            </div>
          </motion.div>

          {/* Goal 4: Daily study pace */}
          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className="w-full rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/30 hover:border-[#f2ca50]/30 transition-all flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-base">hourglass_bottom</span>
                <span className="text-[#dce2f8] font-medium">Cadence Quotidienne</span>
              </div>
              <span className="text-[#f2ca50] font-bold font-mono tabular-nums">
                <FramerRollingCounter value={user.stats.studyMinutesToday ?? 0} /> /{' '}
                <FramerRollingCounter value={user.stats.studyMinutesTarget || 30} suffix=" min" />
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: Math.min(
                    1,
                    (user.stats.studyMinutesToday ?? 0) / Math.max(1, user.stats.studyMinutesTarget || 30)
                  )
                }}
                transition={{ duration: 0.75, delay: 0.36, ease: luxuryEase }}
                style={{ transformOrigin: 'left center' }}
                className="w-full h-full bg-[#f2ca50] rounded-full shadow-[0_0_8px_rgba(242,202,80,0.4)]"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
            </>
          )}

          {/* 7-Day Performance & Weekly XP Evolution Section with Recharts */}
          {(dashboardTab === 'all' || dashboardTab === 'analytics') && (
            <>
            <motion.section
        variants={dashboardCardVariants}
        initial="hidden"
        animate="show"
        className="w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-3"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">
                {chartMetric === 'xp' ? 'show_chart' : 'trending_up'}
              </span>
              <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-bold">
                {chartMetric === 'xp' ? 'Mon historique de progression • 7 Jours' : 'Mon historique de progression (Score %)'}
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
              {chartMetric === 'xp'
                ? 'Graphique linéaire Recharts • Visualisation de la régularité et progression quotidienne des points'
                : 'Historique des dictées, flashcards et quiz consolidé (synchronisation automatique)'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Refresh button */}
            <MotionTooltip
              title="Actualiser"
              content="Recharger vos courbes de progression depuis Cloud Firestore."
              placement="top"
            >
              <button
                type="button"
                onClick={() => loadHistory()}
                disabled={isRefreshing}
                aria-label="Synchroniser avec Cloud Firestore"
                className="p-1.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/40 text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-base ${isRefreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
              </button>
            </MotionTooltip>

            {/* Toggle between Recharts Line Charts (XP Regularity vs Accuracy Score) */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/40">
              <MotionTooltip
                title="Courbe XP"
                content="Visualiser les XP gagnés quotidiennement sur les 7 derniers jours."
                placement="top"
              >
                <button
                  type="button"
                  onClick={() => setChartMetric('xp')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    chartMetric === 'xp'
                      ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-bold'
                      : 'text-[#d0c5af] hover:text-[#dce2f8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>XP Hebdo</span>
                </button>
              </MotionTooltip>
              <MotionTooltip
                title="Courbe Score"
                content="Visualiser votre précision moyenne (%) aux exercices et dictées."
                placement="top"
              >
                <button
                  type="button"
                  onClick={() => setChartMetric('score')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    chartMetric === 'score'
                      ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-bold'
                      : 'text-[#d0c5af] hover:text-[#dce2f8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">percent</span>
                  <span>Score (%)</span>
                </button>
              </MotionTooltip>
            </div>
          </div>
        </div>

        {/* Recharts LineChart Container with Framer Motion Entrance Animation */}
        <AnimatePresence mode="wait">
          {chartMetric === 'xp' ? (
            /* RECHARTS LINE CHART FOR WEEKLY XP & REGULARITY */
            <motion.div
              key="chart-metric-xp-recharts"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full pt-2"
            >
              {/* Quick Regularity & XP KPI ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2.5 border-b border-[#232a3a] mb-2 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-[#d4c78f] bg-[#070e1d]/80 px-2.5 py-1.5 rounded-lg border border-[#232a3a]">
                  <span className="material-symbols-outlined text-[15px] text-[#f2ca50]">bolt</span>
                  <div>
                    <span className="text-[10px] text-[#99907c] block">Total Semaine</span>
                    <strong className="text-[#f2ca50]">
                      <FramerRollingCounter
                        value={scoreData.reduce((acc, curr) => acc + curr.xp, 0)}
                        formatLocale
                        suffix=" XP"
                      />
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#d4c78f] bg-[#070e1d]/80 px-2.5 py-1.5 rounded-lg border border-[#232a3a]">
                  <span className="material-symbols-outlined text-[15px] text-[#38bdf8]">calendar_view_week</span>
                  <div>
                    <span className="text-[10px] text-[#99907c] block">Régularité</span>
                    <strong className="text-[#38bdf8]">
                      <FramerRollingCounter value={scoreData.filter((d) => d.xp > 0).length} />/7 jours (
                      <FramerRollingCounter
                        value={Math.round((scoreData.filter((d) => d.xp > 0).length / (scoreData.length || 7)) * 100)}
                        suffix="%"
                      />
                      )
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#d4c78f] bg-[#070e1d]/80 px-2.5 py-1.5 rounded-lg border border-[#232a3a]">
                  <span className="material-symbols-outlined text-[15px] text-amber-400">speed</span>
                  <div>
                    <span className="text-[10px] text-[#99907c] block">Moyenne / Jour</span>
                    <strong className="text-amber-300">
                      <FramerRollingCounter
                        prefix="~"
                        value={Math.round(scoreData.reduce((acc, curr) => acc + curr.xp, 0) / (scoreData.length || 7))}
                        suffix=" XP/j"
                      />
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#d4c78f] bg-[#070e1d]/80 px-2.5 py-1.5 rounded-lg border border-[#232a3a]">
                  <span className="material-symbols-outlined text-[15px] text-emerald-400">emoji_events</span>
                  <div>
                    <span className="text-[10px] text-[#99907c] block">Pic Hebdo</span>
                    <strong className="text-emerald-300">
                      <FramerRollingCounter
                        prefix="+"
                        value={Math.max(0, ...scoreData.map((d) => d.xp))}
                        formatLocale
                        suffix=" XP"
                      />{' '}
                      ({scoreData.find((d) => d.xp === Math.max(0, ...scoreData.map((x) => x.xp)))?.day || 'Dim'})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Recharts Interactive Line Chart for XP */}
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08
                }}
                className="w-full h-52 select-none"
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
                    margin={{ top: 16, right: 16, left: -10, bottom: 0 }}
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
                      domain={[0, (dataMax: number) => Math.max(500, Math.ceil(dataMax * 1.15))]}
                      unit=" XP"
                      stroke="#99907c"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#99907c' }}
                    />
                    <Tooltip
                      content={<CustomXpTooltip />}
                      cursor={{ stroke: '#f2ca50', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    />
                    {/* Reference threshold line illustrating daily target regularity (300 XP) */}
                    <ReferenceLine
                      y={300}
                      stroke="#38bdf8"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Seuil Régularité (300 XP)',
                        position: 'insideTopRight',
                        fill: '#7dd3fc',
                        fontSize: 10,
                        fontWeight: 700
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="xp"
                      name="XP Hebdo"
                      stroke="#f2ca50"
                      strokeWidth={3.5}
                      dot={{ fill: '#070e1d', stroke: '#f2ca50', strokeWidth: 2.5, r: 5 }}
                      activeDot={{ fill: '#f2ca50', stroke: '#ffe088', strokeWidth: 3, r: 8 }}
                      isAnimationActive={true}
                      animationDuration={950}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#99907c] pt-2 italic gap-1">
                <span>
                  Ligne bleue pointillée : Objectif régulier de 300 XP/j • Les points au-dessus attestent d'une assiduité remarquable.
                </span>
                <span className="not-italic text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Régularité active (7/7 jours)
                </span>
              </div>
            </motion.div>
          ) : (
            /* RECHARTS LINE CHART FOR SCORE ACCURACY */
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
          )}
        </AnimatePresence>
      </motion.section>

      <motion.div variants={dashboardCardVariants} initial="hidden" animate="show">
        <LinguisticRadarSection
          user={user}
          onLaunchSkillModule={(action) => onLaunchEcosystemModule?.(action)}
        />
      </motion.div>
            </>
          )}

      {(dashboardTab === 'all' || dashboardTab === 'analytics' || dashboardTab === 'mastery') && (
        <motion.div variants={dashboardCardVariants} initial="hidden" animate="show">
          <LexicalMasteryD3Chart
            user={user}
            onOpenFlashcards={onOpenFlashcards}
          />
        </motion.div>
      )}

      {(dashboardTab === 'all' || dashboardTab === 'mastery') && (
        <motion.div variants={dashboardCardVariants} initial="hidden" animate="show">
          <VocabularyMasterySummary
            user={user}
            onOpenFlashcards={onOpenFlashcards}
          />
        </motion.div>
      )}

      {(dashboardTab === 'all' || dashboardTab === 'curriculum') && (
        <>
      {/* Composant MSZ-Shop du Dashboard (10 Catégories, Rendu 3D Recto-Verso au Clic, Prix en MSZ Coins & Rareté) */}
      <motion.div variants={dashboardCardVariants} initial="hidden" animate="show">
        <MszShop
          userLevel={calculateLevel(user.stats?.totalXp ?? 0)}
          onOpenFullShop={() => setIsShopModalOpen(true)}
          onProfileUpdated={onOpenProfile}
        />
      </motion.div>

      {/* Visual Study Calendar, Weekly Goals & Study Reminders */}
      <motion.div variants={dashboardCardVariants} initial="hidden" animate="show">
        <StudyCalendarWidget
          user={user}
          onResumePractice={onResumePractice}
        />
      </motion.div>

      {/* Programme des Leçons & Folios Cursus (Staggered Lessons List) */}
      <motion.section
        variants={dashboardCardVariants}
        initial="hidden"
        animate="show"
        className="w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-3.5 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">auto_stories</span>
              <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-bold">
                Programme des Leçons & Folios Cursus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30">
                Cursus Actif
              </span>
            </div>
            <span className="text-xs text-[#d0c5af]/80">
              Parcours séquencé d'éloquence, rhétorique et stylistique Oxford & Cambridge
            </span>
          </div>

          <MotionTooltip
            title="Modules d'Entraînement"
            content="Ouvrir l'atelier complet (dictées, flashcards, dialogues et oral)."
            placement="top"
            wrapperClassName="hidden sm:inline-flex"
          >
            <button
              type="button"
              onClick={onResumePractice}
              className="inline-flex items-center gap-1.5 text-xs text-[#f2ca50] hover:text-[#ffe088] font-semibold transition-colors cursor-pointer"
            >
              <span>Ouvrir les modules</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </MotionTooltip>
        </div>

        {/* Staggered Lessons Grid */}
        <motion.div
          variants={staggeredListContainerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {STUDY_FOLIOS.map((folio, idx) => (
            <motion.div
              key={folio.id}
              variants={lessonCardVariants}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="group relative rounded-xl bg-[#151b2b]/85 hover:bg-[#151b2b] p-4 border border-[#4d4635]/30 hover:border-[#f2ca50]/50 transition-all shadow-sm flex flex-col justify-between gap-3 overflow-hidden"
            >
              {/* Subtle gold corner ambient glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f2ca50]/5 rounded-bl-full pointer-events-none group-hover:bg-[#f2ca50]/10 transition-colors" />

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#232a3a] border border-[#f2ca50]/30 text-[#f2ca50] text-[10px] font-mono font-bold">
                      {folio.folioNumber}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#f2ca50]/15 text-[#f2ca50] text-[10px] font-mono font-bold">
                      {folio.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#99907c] font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {folio.duration}
                  </span>
                </div>

                <div className="flex flex-col">
                  <h4 className="font-serif font-bold text-sm text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors leading-snug">
                    {folio.title}
                  </h4>
                  <p className="text-xs text-[#d0c5af]/80 line-clamp-2 mt-1 leading-relaxed">
                    {folio.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10 pt-2 border-t border-[#232a3a]/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#d0c5af] font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#f2ca50]">task_alt</span>
                    {folio.exercisesCount} épreuves • {folio.lexemes}
                  </span>
                  <span className="text-xs font-bold text-[#f2ca50] font-mono">
                    {folio.progressPercent}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: Math.max(0, Math.min(1, folio.progressPercent / 100)) }}
                    transition={{ duration: 0.75, delay: 0.12 + idx * 0.08, ease: luxuryEase }}
                    style={{ transformOrigin: 'left center' }}
                    className="w-full h-full bg-gradient-to-r from-[#d4c78f] to-[#f2ca50] rounded-full shadow-[0_0_8px_rgba(242,202,80,0.3)]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Native accent switch (🇬🇧 UK vs 🇺🇸 US) */}
                    <div className="inline-flex rounded-lg bg-[#0c1322] p-0.5 border border-[#374151]/60 shadow-inner">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolioAccents((prev) => ({ ...prev, [folio.id]: 'en-GB' }));
                          if (playingFolioId === folio.id) {
                            stopSpeech();
                            setPlayingFolioId(null);
                          }
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                          (folioAccents[folio.id] ||
                            (folio.accent.toLowerCase().includes('american')
                              ? 'en-US'
                              : 'en-GB')) === 'en-GB'
                            ? 'bg-[#f2ca50] text-[#3c2f00] font-extrabold'
                            : 'text-[#94a3b8] hover:text-white'
                        }`}
                        title="Voix native britannique (UK)"
                      >
                        <span>🇬🇧</span>
                        <span>UK</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolioAccents((prev) => ({ ...prev, [folio.id]: 'en-US' }));
                          if (playingFolioId === folio.id) {
                            stopSpeech();
                            setPlayingFolioId(null);
                          }
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                          (folioAccents[folio.id] ||
                            (folio.accent.toLowerCase().includes('american')
                              ? 'en-US'
                              : 'en-GB')) === 'en-US'
                            ? 'bg-[#f2ca50] text-[#3c2f00] font-extrabold'
                            : 'text-[#94a3b8] hover:text-white'
                        }`}
                        title="Voix native américaine (US)"
                      >
                        <span>🇺🇸</span>
                        <span>US</span>
                      </button>
                    </div>

                    {/* Bouton 'Lecture Audio' */}
                    <MotionTooltip
                      title="Synthèse Vocale"
                      content="Écouter une présentation orale de ce folio selon l'accent choisi."
                      placement="top"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayFolioAudio(folio);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer shadow-sm ${
                          playingFolioId === folio.id
                            ? 'bg-[#f2ca50] text-[#3c2f00] ring-1 ring-[#f2ca50] animate-pulse font-extrabold'
                            : 'bg-[#151b2b] hover:bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {playingFolioId === folio.id ? 'graphic_eq' : 'volume_up'}
                        </span>
                        <span>
                          {playingFolioId === folio.id ? 'En cours...' : 'Lecture Audio'}
                        </span>
                      </button>
                    </MotionTooltip>
                  </div>

                  <MotionTooltip
                    title={folio.folioNumber}
                    content="Lancer les exercices et modules associés à ce folio du cursus."
                    placement="top"
                    wrapperClassName="inline-flex ml-auto"
                  >
                    <button
                      type="button"
                      onClick={onResumePractice}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#d4c78f] hover:text-[#3c2f00] text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <span>{folio.progressPercent > 0 ? 'Continuer' : 'Débuter'}</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </MotionTooltip>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

        </>
      )}

      {(dashboardTab === 'all' || dashboardTab === 'analytics') && (
      /* Recent Validated Trials (Staggered items) */
      <motion.section
        variants={dashboardCardVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg text-[#dce2f8] font-semibold">
            Dernières Épreuves Validées
          </h3>
          <span className="text-xs text-[#f2ca50] font-mono uppercase tracking-wider">
            Contrôle Continu
          </span>
        </div>

        {/* Dynamic Recent Trials List with Staggered Fade-in */}
        <motion.div
          variants={staggeredListContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2.5"
        >
          {recentAttempts.length > 0 ? (
            recentAttempts.slice(0, 3).map((att) => (
              <motion.div
                key={att.attemptId}
                variants={subItemVariants}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30 hover:border-[#f2ca50]/30 transition-all shadow-sm"
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
              </motion.div>
            ))
          ) : (
            <>
              {/* Fallback Benchmark Module 1 */}
              <motion.div
                variants={subItemVariants}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30 hover:border-[#f2ca50]/30 transition-all shadow-sm"
              >
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
              </motion.div>

              {/* Fallback Benchmark Module 2 */}
              <motion.div
                variants={subItemVariants}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30 hover:border-[#d4c78f]/30 transition-all shadow-sm"
              >
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
              </motion.div>

              {/* Fallback Benchmark Module 3 */}
              <motion.div
                variants={subItemVariants}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/30 hover:border-[#f2ca50]/30 transition-all shadow-sm"
              >
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
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.section>
      )}

      {(dashboardTab === 'all' || dashboardTab === 'curriculum') && (
      /* IndexedDB Persistent Offline Storage & Cloud Firestore Sync Section */
      <motion.section
        variants={dashboardCardVariants}
        initial="hidden"
        animate="show"
        className="w-full rounded-2xl bg-[#070e1d]/90 p-5 border border-[#4d4635]/40 flex flex-col gap-3.5 relative overflow-hidden shadow-xl"
      >
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
                  isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{isOnline ? 'En Ligne • Synchronisé' : 'Mode Hors-Ligne Actif'}</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Mini Cards with Staggered Entrance */}
        <motion.div
          variants={staggeredListContainerVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1"
        >
          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/30 transition-all flex flex-col gap-0.5 shadow-sm"
          >
            <span className="text-[10px] uppercase font-mono text-[#d0c5af]">Épreuves Enregistrées</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#f2ca50] font-mono">
                {totalOfflineRecords}
              </span>
              <span className="text-[11px] text-[#99907c]">dans IndexedDB</span>
            </div>
          </motion.div>

          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/30 transition-all flex flex-col gap-0.5 shadow-sm"
          >
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
          </motion.div>

          <motion.div
            variants={subItemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/30 transition-all flex flex-col gap-0.5 shadow-sm"
          >
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
          </motion.div>
        </motion.div>

        {/* Sync Action and Reassurance text */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#191f2f]">
          <p className="text-xs text-[#d0c5af]/80 leading-relaxed">
            Même sans réseau, vos dictées, quiz, cartes SM-2 et points XP sont conservés de façon persistante dans le navigateur.
          </p>

          <MotionTooltip
            title="Synchronisation Cloud"
            content="Transférer immédiatement vos épreuves locales IndexedDB vers Firebase."
            placement="top"
            wrapperClassName="inline-flex shrink-0"
          >
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser Maintenant'}</span>
            </button>
          </MotionTooltip>
        </div>
      </motion.section>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Primary Action Button */}
      <MotionTooltip
        title="Atelier Quotidien"
        content="Reprendre directement votre entraînement adapté (vocabulaire, dictée et oral)."
        placement="top"
        wrapperClassName="flex w-full"
      >
        <motion.button
          variants={dashboardCardVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onResumePractice}
          className="w-full py-3.5 px-6 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-base shadow-xl shadow-[#f2ca50]/20 hover:bg-[#ffe088] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_circle
          </span>
          <span>Reprendre la Session Quotidienne</span>
        </motion.button>
      </MotionTooltip>

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

      {/* Fullscreen MSZ Shop & P2P Marketplace Modal */}
      <MszShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        userLevel={calculateLevel(user.stats?.totalXp ?? 0)}
        onProfileUpdated={onOpenProfile}
      />

      {/* Interactive Visual & Step-by-Step App Notice Modal */}
      <AppNoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />
    </motion.div>
  );
};
