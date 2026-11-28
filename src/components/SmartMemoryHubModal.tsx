import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type {
  CEFRLevel,
  SmartMemoryConfidence,
  SmartMemoryItemType,
  SmartMemoryLearningMode,
  SmartMemoryRecallOutcome,
  SmartMemoryRecord
} from '../firebase/types';
import {
  getSmartMemoryRecords,
  recordAttempt,
  saveSmartMemoryRecord
} from '../firebase/client';
import {
  SMART_MEMORY_CATALOG,
  type SmartMemoryCatalogItem
} from '../data/smartMemoryBank';
import {
  getErrorJournal,
  recordFlashcardError
} from '../utils/errorJournal';
import {
  buildSmartMemoryExercise,
  computeAdaptiveSmartMemorySchedule,
  computeSmartMemoryProgressStats,
  computeSmartMemoryRecommendations,
  computeSmartMemoryRetentionForecast,
  generateTodaysMemoryChallenge,
  getLocalDateKey,
  getUserTimezone,
  isItemDueForReview,
  LEARNING_MODE_METADATA,
  normalizeAnswerText,
  type SmartMemoryWeakTopicRecommendation
} from '../utils/smartMemoryEngine';
import {
  selectSkillsForTask,
  type LoadedContextSkillEntry
} from '../services/skillsService';
import { speakText, stopSpeech } from '../services/speechService';
import { playVictoryCue } from '../utils/soundEffects';
import { SmartMemoryWeeklyD3Chart } from './SmartMemoryWeeklyD3Chart';
import { SmartMemoryRetentionForecastChart } from './SmartMemoryRetentionForecastChart';
import {
  SmartMemoryCelebration,
  shouldCelebrateDailyReview,
  type SmartMemorySessionKind
} from './SmartMemoryCelebration';
import { SmartMemoryDuelPanel } from './SmartMemoryDuelPanel';

export type SmartMemoryHubTab = 'overview' | 'daily_challenge' | 'study' | 'duel' | 'catalog';

export interface SmartMemoryHubModalProps {
  isOpen: boolean;
  currentLevel: CEFRLevel;
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
  initialTab?: SmartMemoryHubTab;
  initialMode?: SmartMemoryLearningMode;
  userDisplayName?: string;
  initialDuelCode?: string | null;
}

const TYPE_META: Record<
  SmartMemoryItemType,
  { label: string; icon: string; badgeClass: string }
> = {
  vocabulary: {
    label: 'Vocabulaire',
    icon: 'book_2',
    badgeClass: 'text-[#f2ca50] border-[#f2ca50]/40 bg-[#f2ca50]/10'
  },
  expression: {
    label: 'Expression',
    icon: 'forum',
    badgeClass: 'text-sky-300 border-sky-400/40 bg-sky-500/10'
  },
  grammar: {
    label: 'Grammaire',
    icon: 'gavel',
    badgeClass: 'text-violet-300 border-violet-400/40 bg-violet-500/10'
  },
  irregular_verb: {
    label: 'Verbe Irrégulier',
    icon: 'bolt',
    badgeClass: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10'
  }
};

const STATE_LABEL: Record<SmartMemoryRecord['state'], string> = {
  new: 'Nouveau',
  learning: 'En acquisition',
  review: 'À consolider',
  mastered: 'Maîtrisé'
};

export const SmartMemoryHubModal: React.FC<SmartMemoryHubModalProps> = ({
  isOpen,
  currentLevel,
  onClose,
  onXpEarned,
  initialTab = 'overview',
  initialMode = 'flashcards',
  userDisplayName = 'Joueur',
  initialDuelCode = null
}) => {
  const shouldReduceMotion = useReducedMotion();
  const timezone = useMemo(() => getUserTimezone(), []);

  const [activeTab, setActiveTab] = useState<SmartMemoryHubTab>(initialTab);
  const [records, setRecords] = useState<SmartMemoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadedSkills, setLoadedSkills] = useState<LoadedContextSkillEntry[]>([]);
  const [skillsExpanded, setSkillsExpanded] = useState<boolean>(false);

  // Study Session State
  const [learningMode, setLearningMode] = useState<SmartMemoryLearningMode>(initialMode);
  const [sessionTitle, setSessionTitle] = useState<string>("Today's Memory Challenge");
  const [sessionKind, setSessionKind] = useState<SmartMemorySessionKind>('daily_review');
  const [sessionQueue, setSessionQueue] = useState<SmartMemoryCatalogItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [confidence, setConfidence] = useState<SmartMemoryConfidence>(2);
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [flashcardRevealed, setFlashcardRevealed] = useState<boolean>(false);

  // Interactive Mode State
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [spellSlots, setSpellSlots] = useState<string[]>([]);
  const [matchLeftSelected, setMatchLeftSelected] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchErrors, setMatchErrors] = useState<number>(0);
  const [answerEvaluated, setAnswerEvaluated] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<{
    completed: number;
    correct: number;
    xpEarned: number;
  }>({ completed: 0, correct: 0, xpEarned: 0 });
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);

  // Catalog Filters
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<'all' | SmartMemoryItemType>('all');
  const [catalogCefrFilter, setCatalogCefrFilter] = useState<'all' | CEFRLevel>('all');

  const questionStartRef = useRef<number>(Date.now());

  const loadWorkspaceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedRecords, skillSelection] = await Promise.all([
        getSmartMemoryRecords(),
        selectSkillsForTask(
          'Smart Memory repetition espacee memoire active analytics D3 base de donnees firestore audio prononciation accessibilite ui animation tests qa',
          10
        ).catch(() => null)
      ]);
      setRecords(loadedRecords);
      if (skillSelection?.context?.loadedSkills) {
        setLoadedSkills(skillSelection.context.loadedSkills);
      } else {
        setLoadedSkills([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      return;
    }
    loadWorkspaceData();
  }, [isOpen, loadWorkspaceData]);

  useEffect(() => {
    if (initialDuelCode && initialDuelCode.trim()) {
      setActiveTab('duel');
      return;
    }
    setActiveTab(initialTab);
  }, [initialTab, initialDuelCode]);

  useEffect(() => {
    setLearningMode(initialMode);
  }, [initialMode]);

  const errorJournal = useMemo(() => getErrorJournal(), [records, activeTab]);

  const recordsMap = useMemo(() => {
    const map = new Map<string, SmartMemoryRecord>();
    for (const r of records) {
      map.set(r.itemId, r);
    }
    return map;
  }, [records]);

  const dailyChallenge = useMemo(
    () =>
      generateTodaysMemoryChallenge(
        SMART_MEMORY_CATALOG,
        records,
        errorJournal,
        currentLevel,
        new Date(),
        timezone
      ),
    [records, errorJournal, currentLevel, timezone]
  );

  const recommendations = useMemo(
    () =>
      computeSmartMemoryRecommendations(
        SMART_MEMORY_CATALOG,
        records,
        currentLevel,
        new Date()
      ),
    [records, currentLevel]
  );

  const progressStats = useMemo(
    () =>
      computeSmartMemoryProgressStats(
        SMART_MEMORY_CATALOG,
        records,
        new Date(),
        timezone
      ),
    [records, timezone]
  );

  const retentionForecast = useMemo(
    () => computeSmartMemoryRetentionForecast(records, new Date(), timezone, 7),
    [records, timezone]
  );

  // Initialize default study queue from Today's Memory Challenge if empty
  useEffect(() => {
    if (sessionQueue.length === 0 && dailyChallenge.orderedQueue.length > 0) {
      setSessionQueue(dailyChallenge.orderedQueue.map((entry) => entry.item));
      setSessionTitle("Today's Memory Challenge");
    }
  }, [dailyChallenge, sessionQueue.length]);

  const resetQuestionInputs = useCallback(() => {
    questionStartRef.current = Date.now();
    setFlashcardRevealed(false);
    setSelectedOptionId(null);
    setTypedAnswer('');
    setSpellSlots([]);
    setMatchLeftSelected(null);
    setMatchedPairIds([]);
    setMatchErrors(0);
    setAnswerEvaluated(null);
  }, []);

  const launchStudySession = useCallback(
    (
      items: SmartMemoryCatalogItem[],
      title: string,
      preferredMode?: SmartMemoryLearningMode,
      kind: SmartMemorySessionKind = 'daily_review'
    ) => {
      if (items.length === 0) return;
      setSessionQueue(items);
      setSessionTitle(title);
      setSessionKind(kind);
      setQueueIndex(0);
      setSessionStats({ completed: 0, correct: 0, xpEarned: 0 });
      setSessionFinished(false);
      setLastSavedNotice(null);
      if (preferredMode) setLearningMode(preferredMode);
      resetQuestionInputs();
      setActiveTab('study');
    },
    [resetQuestionInputs]
  );

  const currentItem = sessionQueue[queueIndex] || null;
  const currentExercise = useMemo(() => {
    if (!currentItem) return null;
    return buildSmartMemoryExercise(currentItem, learningMode, SMART_MEMORY_CATALOG);
  }, [currentItem, learningMode]);

  const shuffledMatchRightOptions = useMemo(() => {
    if (!currentExercise?.pairs) return [];
    return [...currentExercise.pairs].sort((a, b) =>
      a.rightFr.localeCompare(b.rightFr, 'fr')
    );
  }, [currentExercise]);

  useEffect(() => {
    if (activeTab === 'study' && learningMode === 'listen_identify' && currentItem) {
      speakText(currentItem.english.split('·')[0].trim(), accent, `sm-listen-${currentItem.itemId}`);
    }
  }, [activeTab, learningMode, currentItem, accent]);

  const handlePlayAudio = (text: string) => {
    const clean = text.split('·')[0].trim();
    speakText(clean, accent, `sm-audio-${clean}`);
  };

  const handleVerifyInteractiveAnswer = () => {
    if (!currentExercise || answerEvaluated) return;

    let isCorrect = false;
    if (
      learningMode === 'en_to_fr' ||
      learningMode === 'fr_to_en' ||
      learningMode === 'listen_identify' ||
      learningMode === 'complete_sentence' ||
      learningMode === 'multiple_choice'
    ) {
      const chosen = currentExercise.options?.find((o) => o.id === selectedOptionId);
      isCorrect = Boolean(chosen?.isCorrect);
    } else if (learningMode === 'spell_word') {
      const candidate = normalizeAnswerText(
        typedAnswer.trim() ? typedAnswer : spellSlots.join('')
      );
      isCorrect = currentExercise.acceptedAnswers.some(
        (acc) => acc.replace(/\s+/g, '') === candidate.replace(/\s+/g, '')
      );
    } else if (learningMode === 'write_from_memory') {
      const candidate = normalizeAnswerText(typedAnswer);
      isCorrect = currentExercise.acceptedAnswers.includes(candidate);
    } else if (learningMode === 'match_pairs') {
      const totalPairs = currentExercise.pairs?.length || 4;
      isCorrect = matchedPairIds.length >= totalPairs && matchErrors <= 1;
    }

    setAnswerEvaluated({
      isCorrect,
      message: isCorrect
        ? `Exact ! Réponse attendue : « ${currentExercise.expectedText} ».`
        : `À consolider — Réponse attendue : « ${currentExercise.expectedText} ».`
    });
  };

  const handleMatchRightClick = (rightPairId: string) => {
    if (!matchLeftSelected || !currentExercise?.pairs || answerEvaluated) return;
    if (matchLeftSelected === rightPairId) {
      const nextMatched = Array.from(new Set([...matchedPairIds, rightPairId]));
      setMatchedPairIds(nextMatched);
      setMatchLeftSelected(null);
      if (nextMatched.length >= currentExercise.pairs.length) {
        setAnswerEvaluated({
          isCorrect: matchErrors <= 1,
          message:
            matchErrors === 0
              ? 'Toutes les paires associées sans erreur !'
              : `Paires associées (${matchErrors} erreur(s) relevée(s)).`
        });
      }
    } else {
      setMatchErrors((e) => e + 1);
      setMatchLeftSelected(null);
    }
  };

  const commitOutcomeAndAdvance = async (outcome: SmartMemoryRecallOutcome) => {
    if (!currentItem) return;
    const elapsedMs = Math.max(500, Date.now() - questionStartRef.current);
    const existing = recordsMap.get(currentItem.itemId);

    const updatedRecord = computeAdaptiveSmartMemorySchedule(
      currentItem,
      existing,
      {
        outcome,
        responseTimeMs: elapsedMs,
        confidence,
        mode: learningMode
      },
      new Date(),
      timezone
    );

    const saved = await saveSmartMemoryRecord(updatedRecord);
    setRecords((prev) => {
      const without = prev.filter((r) => r.itemId !== saved.itemId);
      return [...without, saved];
    });

    if (outcome === 'incorrect') {
      recordFlashcardError({
        id: currentItem.itemId,
        term: currentItem.english,
        definition: currentItem.exampleSentence,
        translationFr: currentItem.french,
        level: currentItem.cefrLevel,
        theme: currentItem.topic,
        phoneticsUk: currentItem.pronunciation,
        phoneticsUs: currentItem.pronunciation
      });
    }

    const xpDelta =
      outcome === 'easy' ? 20 : outcome === 'correct' ? 15 : outcome === 'hard' ? 10 : 5;
    const nextStats = {
      completed: sessionStats.completed + 1,
      correct: sessionStats.correct + (outcome === 'incorrect' ? 0 : 1),
      xpEarned: sessionStats.xpEarned + xpDelta
    };
    setSessionStats(nextStats);

    const intervalLabel =
      updatedRecord.intervalDays < 1
        ? `${Math.max(1, Math.round(updatedRecord.intervalDays * 24))} h`
        : `${updatedRecord.intervalDays} j`;

    setLastSavedNotice(
      `« ${currentItem.english} » planifié pour ${intervalLabel} (${updatedRecord.nextReviewLocalDay || getLocalDateKey(updatedRecord.nextReviewDate, timezone)} · ${timezone}).`
    );

    if (queueIndex + 1 < sessionQueue.length) {
      setQueueIndex((i) => i + 1);
      resetQuestionInputs();
    } else {
      setSessionFinished(true);
      if (
        shouldCelebrateDailyReview({
          sessionFinished: true,
          sessionKind,
          completedCardsCount: nextStats.completed
        })
      ) {
        playVictoryCue();
      }
      const accuracyPct = Math.round(
        (nextStats.correct / Math.max(1, nextStats.completed)) * 100
      );
      await recordAttempt(
        {
          moduleId: `smart_memory_${learningMode}`,
          moduleType: 'smart_memory',
          title: `${sessionTitle} (${learningMode})`,
          level: currentLevel,
          score: accuracyPct,
          durationSeconds: Math.max(15, nextStats.completed * 12),
          details: {
            itemsCompleted: nextStats.completed,
            correctCount: nextStats.correct,
            timezone
          }
        },
        { skipXpIncrement: false }
      );
      onXpEarned?.(nextStats.xpEarned);
    }
  };

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return SMART_MEMORY_CATALOG.filter((item) => {
      if (catalogTypeFilter !== 'all' && item.itemType !== catalogTypeFilter) return false;
      if (catalogCefrFilter !== 'all' && item.cefrLevel !== catalogCefrFilter) return false;
      if (!query) return true;
      return (
        item.english.toLowerCase().includes(query) ||
        item.french.toLowerCase().includes(query) ||
        item.topic.toLowerCase().includes(query)
      );
    }).slice(0, 80);
  }, [catalogSearch, catalogTypeFilter, catalogCefrFilter]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SMART MEMORY — Rétention adaptative"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl luxury-card-surface border border-[#f2ca50]/40 overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <header className="px-5 py-4 bg-[#070e1d] border-b border-[#232a3a] flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-[#f2ca50] font-bold uppercase tracking-widest">
                SMART MEMORY · ADAPTIVE SRS
              </span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className="text-emerald-400 font-semibold">
                {SMART_MEMORY_CATALOG.length} items unifiés (sans doublon)
              </span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className="text-[#d0c5af]">{timezone}</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] truncate">
              Système Intelligent de Rétention Vocabulaire &amp; Grammaire
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Accent switch */}
            <div className="inline-flex rounded-lg luxury-hairline-panel p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setAccent('en-GB')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                  accent === 'en-GB' ? 'luxury-btn-gold' : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                🇬🇧 UK
              </button>
              <button
                type="button"
                onClick={() => setAccent('en-US')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                  accent === 'en-US' ? 'luxury-btn-gold' : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                🇺🇸 US
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSkillsExpanded((v) => !v)}
              className="px-3 py-1.5 rounded-lg luxury-btn-amber-soft text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>
                {loadedSkills.length > 0
                  ? `${loadedSkills.length} Skills Actifs`
                  : 'Skills IA'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer Smart Memory"
              className="w-9 h-9 rounded-lg luxury-btn-surface flex items-center justify-center text-[#dce2f8] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </header>

        {/* Loaded Installed Master Skills Matrix (Zero Simulation) */}
        {skillsExpanded && (
          <div className="px-5 py-3 bg-[#0c1322] border-b border-[#232a3a] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#f2ca50] uppercase tracking-wider">
                Compétences AI Studio Master Skills injectées dans Smart Memory
              </span>
              <span className="text-[11px] text-[#99907c]">
                Chargées dynamiquement depuis skills/index.json (aucun skill désactivé simulé)
              </span>
            </div>
            {loadedSkills.length === 0 ? (
              <p className="text-xs text-[#d0c5af]">
                Aucun skill actif correspondant pour le moment — vous pouvez les activer dans Dashboard &gt; Master Skills.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {loadedSkills.map((sk) => (
                  <div
                    key={sk.skillId}
                    className="rounded-lg bg-[#070e1d] border border-[#232a3a] px-3 py-2 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#dce2f8] truncate">{sk.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">Actif</span>
                    </div>
                    <p className="text-[11px] text-[#99907c] truncate">{sk.skillId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Primary Sub-Navigation */}
        <nav
          aria-label="Sections Smart Memory"
          className="px-5 py-2.5 bg-[#0c1322] border-b border-[#232a3a] flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          {(
            [
              { id: 'overview', label: 'Progrès & Recommandations', icon: 'insights' },
              {
                id: 'daily_challenge',
                label: `Today's Memory Challenge (${dailyChallenge.totalItems})`,
                icon: 'local_fire_department'
              },
              { id: 'study', label: '9 Modes d’Entraînement', icon: 'school' },
              { id: 'duel', label: 'Mode Duel (10 cartes)', icon: 'swords' },
              { id: 'catalog', label: `Banque Unifiée (${SMART_MEMORY_CATALOG.length})`, icon: 'library_books' }
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
                  active ? 'luxury-btn-gold font-bold' : 'luxury-btn-surface text-[#d0c5af]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090f1d]">
          {isLoading ? (
            <div className="py-16 text-center text-xs font-mono text-[#d4c78f]">
              Synchronisation Smart Memory avec IndexedDB &amp; Cloud Firestore…
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW (PROGRESS + RECOMMENDATIONS + D3 WEEKLY CHART) */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* 5-Column Progress Strip */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#232a3a] rounded-xl luxury-hairline-panel font-mono tabular-nums">
                    <div className="p-4 space-y-1">
                      <span className="text-[11px] font-sans text-[#d0c5af] block">Mots Maîtrisés</span>
                      <strong className="text-2xl font-bold text-emerald-400">
                        {progressStats.wordsMastered}
                      </strong>
                      <span className="text-[11px] font-sans text-[#99907c] block">
                        Rétention long terme
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <span className="text-[11px] font-sans text-[#d0c5af] block">En Acquisition</span>
                      <strong className="text-2xl font-bold text-sky-400">
                        {progressStats.wordsLearning}
                      </strong>
                      <span className="text-[11px] font-sans text-[#99907c] block">
                        En cours de consolidation
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <span className="text-[11px] font-sans text-[#d0c5af] block">À Réviser</span>
                      <strong className="text-2xl font-bold text-[#f2ca50]">
                        {progressStats.wordsToReview}
                      </strong>
                      <span className="text-[11px] font-sans text-[#99907c] block">
                        Échus selon votre fuseau
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <span className="text-[11px] font-sans text-[#d0c5af] block">Taux de Rétention</span>
                      <strong className="text-2xl font-bold text-[#dce2f8]">
                        {progressStats.retentionRate}%
                      </strong>
                      <span className="text-[11px] font-sans text-[#99907c] block">
                        Sur {progressStats.totalReviews} rappels
                      </span>
                    </div>

                    <div className="p-4 space-y-1 col-span-2 lg:col-span-1">
                      <span className="text-[11px] font-sans text-[#d0c5af] block">Couverture Banque</span>
                      <strong className="text-2xl font-bold text-amber-300">
                        {progressStats.trackedTotal}/{progressStats.catalogTotal}
                      </strong>
                      <span className="text-[11px] font-sans text-[#99907c] block">
                        Cloud Firestore sync
                      </span>
                    </div>
                  </div>

                  {/* Hero Action Card: Today's Memory Challenge + Type Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-7 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 p-5 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-[#f2ca50] font-bold uppercase tracking-wider">
                            Today&apos;s Memory Challenge · {dailyChallenge.localDateKey}
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            {dailyChallenge.totalItems} items personnalisés
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#dce2f8]">
                          Session Quotidienne Adaptative (5 Piliers)
                        </h3>
                        <p className="text-xs text-[#d0c5af] leading-relaxed">
                          Combine automatiquement vos mots oubliés, expressions difficiles, erreurs passées, règles de grammaire et verbes irréguliers.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                        {dailyChallenge.pillars.map((p) => (
                          <div
                            key={p.key}
                            className="rounded-lg bg-[#070e1d] border border-[#232a3a] px-2 py-2"
                          >
                            <span className="text-sm font-bold text-[#f2ca50] block">{p.count}</span>
                            <span className="text-[10px] font-sans text-[#d0c5af] block truncate">
                              {p.labelFr}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            launchStudySession(
                              dailyChallenge.orderedQueue.map((q) => q.item),
                              "Today's Memory Challenge",
                              'flashcards'
                            )
                          }
                          className="luxury-btn-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">play_arrow</span>
                          <span>Démarrer Today&apos;s Memory Challenge</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('daily_challenge')}
                          className="luxury-btn-surface px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Inspecter les 5 piliers
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('duel')}
                          className="luxury-btn-amber-soft px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">swords</span>
                          <span>Défier un ami (Duel)</span>
                        </button>
                      </div>
                    </div>

                    {/* Knowledge Breakdown */}
                    <div className="lg:col-span-5 rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 space-y-3">
                      <h3 className="font-serif text-base font-bold text-[#dce2f8]">
                        Répartition par Famille Linguistique
                      </h3>
                      <div className="space-y-2.5">
                        {(Object.keys(TYPE_META) as SmartMemoryItemType[]).map((itemType) => {
                          const meta = TYPE_META[itemType];
                          const stats = progressStats.byType[itemType];
                          const pct =
                            stats.total > 0
                              ? Math.round((stats.tracked / stats.total) * 100)
                              : 0;
                          return (
                            <div key={itemType} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-[#dce2f8] font-medium">
                                  <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                                    {meta.icon}
                                  </span>
                                  <span>{meta.label}</span>
                                </span>
                                <span className="font-mono text-[11px] text-[#d0c5af] tabular-nums">
                                  {stats.mastered} maîtrisés · {stats.tracked}/{stats.total} suivis
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
                                <div
                                  className="h-full bg-[#f2ca50] rounded-full"
                                  style={{ width: `${Math.max(4, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* D3 Weekly Learning Activity & 7-Day Retention Forecast Timeline */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <SmartMemoryWeeklyD3Chart
                      weeklyActivity={progressStats.weeklyActivity}
                      timezone={timezone}
                    />
                    <SmartMemoryRetentionForecastChart
                      forecast={retentionForecast}
                      timezone={timezone}
                    />
                  </div>

                  {/* Smart Recommendations */}
                  <section className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50]">
                          RECOMMANDATIONS INTELLIGENTES
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#dce2f8]">
                          Catégories Prioritaires à Renforcer
                        </h3>
                      </div>
                      <span className="text-xs text-[#99907c]">
                        Générées selon vos erreurs, latences de rappel et échéances
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recommendations.map((rec: SmartMemoryWeakTopicRecommendation) => (
                        <div
                          key={rec.topic}
                          className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-4 flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2 text-xs font-mono">
                              <span className="text-rose-300 font-bold">
                                Fragilité {rec.weaknessScore}%
                              </span>
                              <span className="text-[#99907c]">{rec.accuracyPct}% précision</span>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-[#dce2f8]">
                              {rec.topic}
                            </h4>
                            <p className="text-[11px] text-[#d0c5af]/85">{rec.reasonFr}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              launchStudySession(
                                rec.targetedItems,
                                `Révision ciblée : ${rec.topic}`,
                                'multiple_choice',
                                'targeted'
                              )
                            }
                            className="w-full py-2 px-3 rounded-lg luxury-btn-amber-soft text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">target</span>
                            <span>Réviser ({rec.targetedItems.length} items)</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: TODAY'S MEMORY CHALLENGE */}
              {activeTab === 'daily_challenge' && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#f2ca50]">
                        {dailyChallenge.localDateKey} · Fuseau {dailyChallenge.timezone}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#dce2f8]">
                        Today&apos;s Memory Challenge — Programme Personnalisé
                      </h3>
                      <p className="text-xs text-[#d0c5af]">
                        {dailyChallenge.totalItems} cartes réparties sur les 5 catégories critiques pour solidifier votre mémoire à long terme.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        launchStudySession(
                          dailyChallenge.orderedQueue.map((q) => q.item),
                          "Today's Memory Challenge",
                          'flashcards'
                        )
                      }
                      className="luxury-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      <span>Tout lancer ({dailyChallenge.totalItems})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dailyChallenge.pillars.map((pillar) => (
                      <div
                        key={pillar.key}
                        className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-[#f2ca50]">
                              {pillar.icon}
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#dce2f8]">
                              {pillar.labelFr}
                            </h4>
                          </div>
                          <button
                            type="button"
                            disabled={pillar.items.length === 0}
                            onClick={() =>
                              launchStudySession(
                                pillar.items.map((x) => x.item),
                                `Challenge · ${pillar.labelFr}`,
                                pillar.key === 'grammar_rules'
                                  ? 'complete_sentence'
                                  : pillar.key === 'irregular_verbs'
                                  ? 'write_from_memory'
                                  : 'flashcards'
                              )
                            }
                            className="px-3 py-1 rounded-lg luxury-btn-amber-soft text-[11px] font-bold cursor-pointer disabled:opacity-40"
                          >
                            Réviser ({pillar.count})
                          </button>
                        </div>

                        <div className="divide-y divide-[#232a3a]">
                          {pillar.items.map((entry) => (
                            <div
                              key={entry.item.itemId}
                              className="py-2 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-[#dce2f8] truncate">
                                  {entry.item.english}
                                </div>
                                <div className="text-[11px] text-[#99907c] truncate">
                                  {entry.reasonFr} · {entry.item.french}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(entry.item.english)}
                                aria-label={`Écouter ${entry.item.english}`}
                                className="p-1.5 rounded-lg luxury-btn-surface text-[#f2ca50] shrink-0 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">volume_up</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: 9 INTERACTIVE LEARNING MODES */}
              {activeTab === 'study' && (
                <div className="space-y-4">
                  {/* 9-Mode Selector Strip */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
                    {LEARNING_MODE_METADATA.map((m) => {
                      const active = learningMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setLearningMode(m.id);
                            resetQuestionInputs();
                          }}
                          title={m.descriptionFr}
                          className={`px-2 py-2 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 cursor-pointer border transition-colors ${
                            active
                              ? 'luxury-btn-gold border-[#ffe088] font-bold'
                              : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af] hover:border-[#f2ca50]/45'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">{m.icon}</span>
                          <span className="truncate max-w-full">{m.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  {lastSavedNotice && (
                    <div
                      role="status"
                      className="rounded-xl px-4 py-2.5 bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">cloud_done</span>
                      <span>{lastSavedNotice}</span>
                    </div>
                  )}

                  {sessionFinished ? (
                    shouldCelebrateDailyReview({
                      sessionFinished,
                      sessionKind,
                      completedCardsCount: sessionStats.completed
                    }) ? (
                      <SmartMemoryCelebration
                        sessionTitle={sessionTitle}
                        completedCards={sessionStats.completed}
                        correctCards={sessionStats.correct}
                        xpEarned={sessionStats.xpEarned}
                        onStartNewSession={() =>
                          launchStudySession(
                            dailyChallenge.orderedQueue.map((q) => q.item),
                            "Today's Memory Challenge",
                            learningMode,
                            'daily_review'
                          )
                        }
                        onViewProgress={() => setActiveTab('overview')}
                      />
                    ) : (
                      <div className="rounded-2xl bg-[#0c1322] border border-[#f2ca50]/50 p-6 text-center space-y-4">
                        <span className="material-symbols-outlined text-4xl text-[#f2ca50]">
                          workspace_premium
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-[#dce2f8]">
                          Session « {sessionTitle} » terminée !
                        </h3>
                        <p className="text-sm text-[#d0c5af]">
                          {sessionStats.correct}/{sessionStats.completed} rappels validés · +
                          {sessionStats.xpEarned} XP enregistrés dans Firestore.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              launchStudySession(
                                dailyChallenge.orderedQueue.map((q) => q.item),
                                "Today's Memory Challenge",
                                learningMode,
                                'daily_review'
                              )
                            }
                            className="luxury-btn-gold px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Nouvelle session adaptative
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className="luxury-btn-surface px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Voir mes progrès
                          </button>
                        </div>
                      </div>
                    )
                  ) : currentItem && currentExercise ? (
                    <div className="rounded-2xl bg-[#0c1322] border border-[#2e3852] p-5 space-y-5">
                      {/* Progress Header + Confidence Selector */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2 font-mono">
                          <span className="text-[#f2ca50] font-bold">
                            {sessionTitle} · {queueIndex + 1}/{sessionQueue.length}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-sans font-semibold ${
                              TYPE_META[currentItem.itemType].badgeClass
                            }`}
                          >
                            {TYPE_META[currentItem.itemType].label}
                          </span>
                          <span className="text-[#d4c78f] font-bold">{currentItem.cefrLevel}</span>
                          <span className="text-[#99907c]">{currentItem.topic}</span>
                        </div>

                        {/* Confidence signal buttons */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#99907c]">Confiance :</span>
                          {(
                            [
                              { v: 1, label: 'Hésitant' },
                              { v: 2, label: 'Moyen' },
                              { v: 3, label: 'Sûr' }
                            ] as const
                          ).map((c) => (
                            <button
                              key={c.v}
                              type="button"
                              onClick={() => setConfidence(c.v)}
                              className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                                confidence === c.v
                                  ? 'luxury-btn-amber-soft font-bold'
                                  : 'bg-[#070e1d] text-[#99907c] border border-[#232a3a]'
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Exercise Stage */}
                      <div className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono uppercase text-[#d4c78f]">
                              {LEARNING_MODE_METADATA.find((m) => m.id === learningMode)?.labelFr}
                            </span>
                            <p className="text-xs text-[#d0c5af]">{currentExercise.promptFr}</p>
                            {learningMode !== 'listen_identify' &&
                              learningMode !== 'fr_to_en' &&
                              learningMode !== 'spell_word' &&
                              learningMode !== 'write_from_memory' &&
                              currentExercise.promptEn && (
                                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f2ca50] pt-1">
                                  {currentExercise.promptEn}
                                </h3>
                              )}
                            {learningMode === 'flashcards' && (
                              <p className="font-mono text-xs text-[#99907c]">
                                {currentItem.pronunciation}
                              </p>
                            )}
                            {currentExercise.hintText &&
                              learningMode !== 'flashcards' &&
                              learningMode !== 'listen_identify' && (
                                <p className="font-mono text-xs text-[#99907c]">
                                  {currentExercise.hintText}
                                </p>
                              )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlayAudio(currentItem.english)}
                            aria-label="Lire l'audio en anglais"
                            className="min-h-[42px] px-3 py-2 rounded-xl luxury-btn-amber-soft text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">volume_up</span>
                            <span>Audio</span>
                          </button>
                        </div>

                        {/* MODE 1: FLASHCARDS */}
                        {learningMode === 'flashcards' && (
                          <div className="space-y-3 pt-2">
                            {!flashcardRevealed ? (
                              <button
                                type="button"
                                onClick={() => setFlashcardRevealed(true)}
                                className="w-full py-3 rounded-xl luxury-btn-gold text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                                <span>Révéler traduction, règle &amp; exemple</span>
                              </button>
                            ) : (
                              <div className="pt-3 border-t border-[#232a3a] space-y-2.5 text-xs">
                                <p className="text-base font-semibold text-[#dce2f8]">
                                  {currentItem.french}
                                </p>
                                <div className="rounded-lg bg-[#0c1322] border border-[#232a3a] p-3 flex items-center justify-between gap-3">
                                  <p className="text-[#d0c5af] italic">
                                    « {currentItem.exampleSentence} »
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handlePlayAudio(currentItem.exampleSentence)}
                                    className="p-1.5 rounded luxury-btn-surface text-[#f2ca50] shrink-0 cursor-pointer"
                                    title="Écouter la phrase d'exemple"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      play_arrow
                                    </span>
                                  </button>
                                </div>
                                {currentItem.grammarRule && (
                                  <p className="text-[11px] text-[#d4c78f]">
                                    Règle / Astuce : {currentItem.grammarRule}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* MODES 2, 3, 4, 6, 7: OPTIONS / MCQ / CLOZE / LISTEN */}
                        {currentExercise.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                            {currentExercise.options.map((opt) => {
                              const isSelected = selectedOptionId === opt.id;
                              const showResult = Boolean(answerEvaluated);
                              let cls =
                                'bg-[#0c1322] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/50';
                              if (showResult && opt.isCorrect) {
                                cls = 'bg-emerald-950/50 border-emerald-400 text-emerald-200';
                              } else if (showResult && isSelected && !opt.isCorrect) {
                                cls = 'bg-rose-950/50 border-rose-400 text-rose-200';
                              } else if (isSelected) {
                                cls = 'bg-[#191f2f] border-[#f2ca50] text-[#f2ca50]';
                              }
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  disabled={Boolean(answerEvaluated)}
                                  onClick={() => setSelectedOptionId(opt.id)}
                                  className={`p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${cls}`}
                                >
                                  <div className="font-semibold">{opt.label}</div>
                                  {opt.subLabel && (
                                    <div className="text-[11px] text-[#99907c] font-mono mt-0.5 truncate">
                                      {opt.subLabel}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* MODE 5 & 9: SPELL WORD / WRITE FROM MEMORY */}
                        {(learningMode === 'spell_word' ||
                          learningMode === 'write_from_memory') && (
                          <div className="space-y-3 pt-2">
                            {learningMode === 'spell_word' && currentExercise.scrambledLetters && (
                              <div className="flex flex-wrap gap-1.5">
                                {currentExercise.scrambledLetters.map((ch, idx) => (
                                  <button
                                    key={`${ch}-${idx}`}
                                    type="button"
                                    disabled={Boolean(answerEvaluated)}
                                    onClick={() => {
                                      const next = [...spellSlots, ch];
                                      setSpellSlots(next);
                                      setTypedAnswer(next.join(''));
                                    }}
                                    className="w-9 h-9 rounded-lg luxury-btn-surface font-mono font-bold text-sm text-[#f2ca50] cursor-pointer"
                                  >
                                    {ch}
                                  </button>
                                ))}
                                {spellSlots.length > 0 && !answerEvaluated && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSpellSlots([]);
                                      setTypedAnswer('');
                                    }}
                                    className="px-2.5 h-9 rounded-lg bg-[#191f2f] border border-[#232a3a] text-xs text-[#d0c5af] cursor-pointer"
                                  >
                                    Effacer
                                  </button>
                                )}
                              </div>
                            )}
                            <input
                              type="text"
                              value={typedAnswer}
                              disabled={Boolean(answerEvaluated)}
                              onChange={(e) => setTypedAnswer(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && typedAnswer.trim()) {
                                  handleVerifyInteractiveAnswer();
                                }
                              }}
                              placeholder={
                                learningMode === 'spell_word'
                                  ? 'Tapez ou cliquez les lettres...'
                                  : 'Écrivez le mot, l’expression ou les 3 formes...'
                              }
                              className="w-full px-4 py-3 rounded-xl bg-[#0c1322] border border-[#2e3852] text-sm text-[#dce2f8] font-mono focus:outline-none focus:border-[#f2ca50]"
                            />
                          </div>
                        )}

                        {/* MODE 8: MATCH PAIRS */}
                        {learningMode === 'match_pairs' && currentExercise.pairs && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono uppercase text-[#99907c]">
                                Anglais
                              </span>
                              {currentExercise.pairs.map((p) => {
                                const matched = matchedPairIds.includes(p.pairId);
                                const selected = matchLeftSelected === p.pairId;
                                return (
                                  <button
                                    key={`L-${p.pairId}`}
                                    type="button"
                                    disabled={matched}
                                    onClick={() => setMatchLeftSelected(p.pairId)}
                                    className={`w-full p-2.5 rounded-lg border text-left text-xs font-semibold cursor-pointer ${
                                      matched
                                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                        : selected
                                        ? 'bg-[#191f2f] border-[#f2ca50] text-[#f2ca50]'
                                        : 'bg-[#0c1322] border-[#232a3a] text-[#dce2f8]'
                                    }`}
                                  >
                                    {p.leftEn}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono uppercase text-[#99907c]">
                                Français
                              </span>
                              {shuffledMatchRightOptions.map((p) => {
                                const matched = matchedPairIds.includes(p.pairId);
                                return (
                                  <button
                                    key={`R-${p.pairId}`}
                                    type="button"
                                    disabled={matched || !matchLeftSelected}
                                    onClick={() => handleMatchRightClick(p.pairId)}
                                    className={`w-full p-2.5 rounded-lg border text-left text-xs cursor-pointer ${
                                      matched
                                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                        : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af] hover:border-[#f2ca50]/50 disabled:opacity-60'
                                    }`}
                                  >
                                    {p.rightFr}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interactive Verification Button */}
                        {learningMode !== 'flashcards' &&
                          learningMode !== 'match_pairs' &&
                          !answerEvaluated && (
                            <button
                              type="button"
                              disabled={
                                (learningMode === 'spell_word' ||
                                  learningMode === 'write_from_memory')
                                  ? !typedAnswer.trim()
                                  : !selectedOptionId
                              }
                              onClick={handleVerifyInteractiveAnswer}
                              className="luxury-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40"
                            >
                              Vérifier ma réponse
                            </button>
                          )}

                        {/* Evaluation Feedback */}
                        {answerEvaluated && (
                          <div
                            className={`rounded-xl p-3.5 text-xs border space-y-1 ${
                              answerEvaluated.isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            <div className="font-bold">{answerEvaluated.message}</div>
                            <div className="text-[#d0c5af]">
                              Exemple : « {currentItem.exampleSentence} » ({currentItem.pronunciation})
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4 Adaptive Scheduling Buttons */}
                      <div className="space-y-2">
                        <span className="text-[11px] text-[#99907c] block">
                          Planification adaptative (précision + temps de réponse + confiance) :
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => commitOutcomeAndAdvance('incorrect')}
                            className="p-2.5 rounded-xl bg-rose-950/45 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-bold flex flex-col items-center cursor-pointer"
                          >
                            <span>Incorrect</span>
                            <span className="text-[10px] font-mono opacity-80">Revoir tôt (2–4 h)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => commitOutcomeAndAdvance('hard')}
                            className="p-2.5 rounded-xl bg-amber-950/45 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-bold flex flex-col items-center cursor-pointer"
                          >
                            <span>Avec difficulté</span>
                            <span className="text-[10px] font-mono opacity-80">Bientôt (12–18 h)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => commitOutcomeAndAdvance('correct')}
                            className="p-2.5 rounded-xl luxury-btn-amber-soft text-xs font-bold flex flex-col items-center cursor-pointer"
                          >
                            <span>Correctement</span>
                            <span className="text-[10px] font-mono opacity-85">+ Intervalle</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => commitOutcomeAndAdvance('easy')}
                            className="p-2.5 rounded-xl luxury-btn-emerald text-xs font-bold flex flex-col items-center cursor-pointer"
                          >
                            <span>Facilement</span>
                            <span className="text-[10px] font-mono opacity-85">Intervalle étendu</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* TAB 4: REAL-TIME 10-CARD SPACED REPETITION DUEL */}
              {activeTab === 'duel' && (
                <SmartMemoryDuelPanel
                  currentLevel={currentLevel}
                  userDisplayName={userDisplayName}
                  records={records}
                  accent={accent}
                  initialDuelCode={initialDuelCode}
                  onRecordsUpdated={(saved) =>
                    setRecords((prev) => {
                      const idx = prev.findIndex((r) => r.itemId === saved.itemId);
                      if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = saved;
                        return next;
                      }
                      return [...prev, saved];
                    })
                  }
                  onXpEarned={onXpEarned}
                />
              )}

              {/* TAB 5: UNIFIED DEDUPLICATED KNOWLEDGE BANK & SCHEDULE */}
              {activeTab === 'catalog' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Rechercher un mot, expression, règle grammaticale ou verbe irrégulier..."
                      className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs text-[#dce2f8] focus:outline-none focus:border-[#f2ca50]"
                    />

                    <select
                      aria-label="Filtrer par catégorie"
                      value={catalogTypeFilter}
                      onChange={(e) =>
                        setCatalogTypeFilter(e.target.value as 'all' | SmartMemoryItemType)
                      }
                      className="px-3 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs text-[#dce2f8]"
                    >
                      <option value="all">Toutes familles</option>
                      <option value="vocabulary">Vocabulaire</option>
                      <option value="expression">Expressions</option>
                      <option value="grammar">Grammaire</option>
                      <option value="irregular_verb">Verbes Irréguliers</option>
                    </select>

                    <select
                      aria-label="Filtrer par niveau CECRL"
                      value={catalogCefrFilter}
                      onChange={(e) => setCatalogCefrFilter(e.target.value as 'all' | CEFRLevel)}
                      className="px-3 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs text-[#dce2f8]"
                    >
                      <option value="all">Tous niveaux</option>
                      {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="divide-y divide-[#232a3a] rounded-xl bg-[#0c1322] border border-[#232a3a]">
                    {filteredCatalog.map((item) => {
                      const rec = recordsMap.get(item.itemId);
                      const due = rec ? isItemDueForReview(rec.nextReviewDate, new Date()) : true;
                      return (
                        <div
                          key={item.itemId}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-serif font-bold text-sm text-[#f2ca50]">
                                {item.english}
                              </span>
                              <span className="font-mono text-[11px] text-[#99907c]">
                                {item.pronunciation}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${
                                  TYPE_META[item.itemType].badgeClass
                                }`}
                              >
                                {TYPE_META[item.itemType].label}
                              </span>
                              <span className="font-mono text-[10px] text-[#d4c78f]">
                                {item.cefrLevel} · {item.topic}
                              </span>
                            </div>
                            <p className="text-[#dce2f8]">{item.french}</p>
                            <p className="text-[11px] text-[#99907c] italic">
                              « {item.exampleSentence} »
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {rec ? (
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-mono ${
                                  due
                                    ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {STATE_LABEL[rec.state]} · {rec.nextReviewLocalDay || getLocalDateKey(rec.nextReviewDate, timezone)}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-[10px] font-mono bg-[#070e1d] text-[#99907c] border border-[#232a3a]">
                                Nouveau
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(item.english)}
                              aria-label={`Écouter ${item.english}`}
                              className="p-1.5 rounded-lg luxury-btn-surface text-[#f2ca50] cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">volume_up</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                launchStudySession(
                                  [item],
                                  `Révision : ${item.english}`,
                                  'flashcards',
                                  'single'
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg luxury-btn-amber-soft text-[11px] font-bold cursor-pointer"
                            >
                              Réviser
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
