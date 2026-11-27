import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { FlashcardProgress, UserProfile } from '../firebase/types';
import {
  getStoredFlashcardProgressList,
  saveFlashcardProgress
} from '../firebase/client';
import {
  getErrorJournal,
  markErrorAsResolved,
  recordFlashcardError
} from '../utils/errorJournal';
import {
  buildActiveMemoryConcepts,
  computeNextSm2State,
  type ActiveMemoryConcept,
  type FlashRecallRating
} from '../utils/activeMemoryEngine';
import {
  selectSkillsForTask,
  type LoadedContextSkillEntry
} from '../services/skillsService';
import { speakText } from '../services/speechService';
import { TelemetryListSkeleton } from './SkeletonLoaders';

export interface ActiveMemoryPanelProps {
  user: UserProfile;
  onOpenFlashcards?: () => void;
}

type QueueFilter = 'all' | 'priority' | 'new';

const URGENCY_META: Record<
  ActiveMemoryConcept['urgency'],
  { label: string; textClass: string; barClass: string }
> = {
  due: {
    label: 'Échéance SM-2',
    textClass: 'text-[#f2ca50]',
    barClass: 'bg-[#f2ca50]'
  },
  fragile: {
    label: 'Vigilance',
    textClass: 'text-rose-300',
    barClass: 'bg-rose-400'
  },
  new: {
    label: 'Consolidation',
    textClass: 'text-sky-300',
    barClass: 'bg-sky-400'
  }
};

export const ActiveMemoryPanel: React.FC<ActiveMemoryPanelProps> = ({
  user,
  onOpenFlashcards
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [flashcardProgressList, setFlashcardProgressList] = useState<FlashcardProgress[]>([]);
  const [loadedSkills, setLoadedSkills] = useState<LoadedContextSkillEntry[]>([]);
  const [skillsResolved, setSkillsResolved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isSavingRecall, setIsSavingRecall] = useState<boolean>(false);
  const [recallFeedback, setRecallFeedback] = useState<string | null>(null);
  const [sessionRecallsCount, setSessionRecallsCount] = useState<number>(0);
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const loadMemoryContext = useCallback(async () => {
    setIsLoading(true);
    try {
      const [storedCards, skillSelection] = await Promise.all([
        getStoredFlashcardProgressList(),
        selectSkillsForTask(
          'Répétition espacée SM-2, mémoire active et rappel flash des concepts clés',
          4
        ).catch(() => null)
      ]);

      setFlashcardProgressList(storedCards);
      if (skillSelection?.context?.loadedSkills) {
        setLoadedSkills(skillSelection.context.loadedSkills);
        setSkillsResolved(true);
      } else {
        setLoadedSkills([]);
        setSkillsResolved(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemoryContext();
  }, [loadMemoryContext, user.uid, user.stats.totalXp]);

  useEffect(() => {
    const handleJournalUpdate = () => {
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('eb_error_journal_updated', handleJournalUpdate);
    return () => window.removeEventListener('eb_error_journal_updated', handleJournalUpdate);
  }, []);

  useEffect(() => {
    if (!recallFeedback) return;
    const timer = setTimeout(() => setRecallFeedback(null), 3200);
    return () => clearTimeout(timer);
  }, [recallFeedback]);

  const memoryPlan = useMemo(() => {
    const errorItems = getErrorJournal();
    return buildActiveMemoryConcepts(flashcardProgressList, errorItems, user.level, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcardProgressList, user.level, refreshTick]);

  const filteredConcepts = useMemo(() => {
    if (queueFilter === 'priority') {
      return memoryPlan.concepts.filter((c) => c.urgency === 'due' || c.urgency === 'fragile');
    }
    if (queueFilter === 'new') {
      return memoryPlan.concepts.filter((c) => c.urgency === 'new');
    }
    return memoryPlan.concepts;
  }, [memoryPlan.concepts, queueFilter]);

  useEffect(() => {
    if (filteredConcepts.length === 0) {
      setSelectedCardId(null);
      return;
    }
    if (!selectedCardId || !filteredConcepts.some((c) => c.cardId === selectedCardId)) {
      setSelectedCardId(filteredConcepts[0].cardId);
      setIsRevealed(false);
    }
  }, [filteredConcepts, selectedCardId]);

  const activeConcept = useMemo(() => {
    return (
      filteredConcepts.find((c) => c.cardId === selectedCardId) ??
      filteredConcepts[0] ??
      null
    );
  }, [filteredConcepts, selectedCardId]);

  const handleSelectConcept = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsRevealed(false);
  };

  const handleSpeakConcept = (text: string) => {
    speakText(text, accent, `active-memory-${text}`, { rate: 0.92 });
  };

  const handleFlashRecall = async (rating: FlashRecallRating) => {
    if (!activeConcept || isSavingRecall) return;
    setIsSavingRecall(true);
    try {
      const existing = flashcardProgressList.find((p) => p.cardId === activeConcept.cardId);
      const nextState = computeNextSm2State(activeConcept, rating, existing);
      await saveFlashcardProgress(nextState);

      if (rating === 'again') {
        recordFlashcardError({
          id: activeConcept.cardId,
          term: activeConcept.term,
          definition: activeConcept.englishDef,
          translationFr: activeConcept.frenchDef,
          level: activeConcept.level,
          phoneticsUk: activeConcept.phonetic,
          phoneticsUs: activeConcept.phonetic,
          etymology: activeConcept.etymology
        });
      } else if (rating === 'easy' && activeConcept.errorItemId) {
        markErrorAsResolved(activeConcept.errorItemId);
      }

      const refreshedList = await getStoredFlashcardProgressList();
      setFlashcardProgressList(refreshedList);
      setSessionRecallsCount((c) => c + 1);
      setIsRevealed(false);
      setRefreshTick((t) => t + 1);

      const ratingSummary =
        rating === 'again'
          ? `« ${activeConcept.term} » replanifié à 24 h (SM-2).`
          : rating === 'good'
          ? `« ${activeConcept.term} » validé — prochain rappel dans ${nextState.intervalDays} j.`
          : `« ${activeConcept.term} » consolidé — rappel étendu à ${nextState.intervalDays} j.`;
      setRecallFeedback(ratingSummary);

      // Move smoothly to next concept in current filtered queue
      const currentIdx = filteredConcepts.findIndex((c) => c.cardId === activeConcept.cardId);
      if (filteredConcepts.length > 1 && currentIdx >= 0) {
        const nextConcept = filteredConcepts[(currentIdx + 1) % filteredConcepts.length];
        setSelectedCardId(nextConcept.cardId);
      }
    } catch (err) {
      setRecallFeedback(
        err instanceof Error ? err.message : 'Erreur lors de la mise à jour SM-2.'
      );
    } finally {
      setIsSavingRecall(false);
    }
  };

  if (isLoading) {
    return (
      <section aria-label="Chargement de Mémoire Active">
        <TelemetryListSkeleton count={4} />
      </section>
    );
  }

  return (
    <section
      aria-label="Mémoire Active : Répétition espacée et rappel flash"
      data-testid="active-memory-panel"
      className="w-full rounded-2xl luxury-card-surface p-5 sm:p-6 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#d4c78f] font-medium">
            <span>Mémoire Active</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#f2ca50]">Répétition Espacée SM-2</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#d0c5af]">
              {skillsResolved && loadedSkills.length > 0
                ? `Skill actif : ${loadedSkills.map((s) => s.title).slice(0, 2).join(', ')}`
                : 'Moteur SM-2 local'}
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] tracking-tight">
            Rappel Flash · Concepts Clés Prioritaires
          </h3>
          <p className="text-xs sm:text-[13px] text-[#d0c5af]/85 max-w-3xl leading-relaxed">
            Concepts sélectionnés selon vos échéances SM-2, vos points de vigilance récents et votre palier {user.level}. Testez votre mémorisation en un clic sans quitter le tableau de bord.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg luxury-hairline-panel p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setAccent('en-GB')}
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-mono font-bold cursor-pointer ${
                accent === 'en-GB' ? 'luxury-btn-gold' : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
              title="Prononciation britannique (UK)"
            >
              🇬🇧 UK
            </button>
            <button
              type="button"
              onClick={() => setAccent('en-US')}
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-mono font-bold cursor-pointer ${
                accent === 'en-US' ? 'luxury-btn-gold' : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
              title="Prononciation américaine (US)"
            >
              🇺🇸 US
            </button>
          </div>

          {onOpenFlashcards && (
            <button
              type="button"
              onClick={onOpenFlashcards}
              className="luxury-btn-amber-soft min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-base">style</span>
              <span>Atelier Flashcards</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Hairline Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#232a3a] rounded-xl luxury-hairline-panel font-mono tabular-nums">
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">File prioritaire identifiée</span>
          <span className="text-xl font-bold text-[#f2ca50]">
            {memoryPlan.concepts.length} concepts
          </span>
          <span className="text-[11px] font-sans text-[#99907c]">
            {memoryPlan.dueCount} échu(s) · {memoryPlan.fragileCount} vigilance(s)
          </span>
        </div>

        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">Rétention moyenne de la file</span>
          <span className="text-xl font-bold text-[#dce2f8]">{memoryPlan.averageRetentionPct}%</span>
          <span className="text-[11px] font-sans text-[#99907c]">
            Calculée via facteur d&apos;aisance SM-2
          </span>
        </div>

        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-sans text-[#d0c5af]">Rappels flash effectués</span>
          <span className="text-xl font-bold text-emerald-400">+{sessionRecallsCount}</span>
          <span className="text-[11px] font-sans text-[#99907c]">
            Synchronisés IndexedDB &amp; Firestore
          </span>
        </div>
      </div>

      <AnimatePresence>
        {recallFeedback && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="rounded-xl px-3.5 py-2.5 text-xs bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{recallFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split: Active Flash Recall Card + Prioritized Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Flash Recall Card */}
        <div className="lg:col-span-7">
          {activeConcept ? (
            <div
              data-testid="active-memory-card"
              className="rounded-xl bg-[#0c1322] border border-[#2e3852] p-5 space-y-4"
            >
              {/* Card Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className={`font-bold ${URGENCY_META[activeConcept.urgency].textClass}`}>
                    {URGENCY_META[activeConcept.urgency].label}
                  </span>
                  <span aria-hidden="true" className="text-[#99907c]">·</span>
                  <span className="text-[#d4c78f] font-bold">{activeConcept.level}</span>
                  <span aria-hidden="true" className="text-[#99907c]">·</span>
                  <span className="text-[#99907c]">{activeConcept.category}</span>
                </div>

                <span className="font-mono tabular-nums text-[11px] text-[#99907c]">
                  Rétention : <strong className="text-[#dce2f8]">{activeConcept.retentionScore}%</strong>
                </span>
              </div>

              {/* Prompt Face (Term + Phonetics + Speak) */}
              <div className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] text-[#99907c] uppercase tracking-wider font-medium">
                      {activeConcept.priorityReason}
                    </span>
                    <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#f2ca50] tracking-tight break-words">
                      {activeConcept.term}
                    </h4>
                    <p className="font-mono text-xs text-[#d0c5af]">{activeConcept.phonetic}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeakConcept(activeConcept.term)}
                    aria-label={`Écouter la prononciation de ${activeConcept.term}`}
                    className="min-h-[40px] min-w-[40px] p-2 rounded-lg luxury-btn-surface flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                  >
                    <span className="material-symbols-outlined text-lg text-[#f2ca50]">
                      volume_up
                    </span>
                  </button>
                </div>

                {/* Flash Reveal Toggle */}
                {!isRevealed ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      data-testid="active-memory-reveal-btn"
                      onClick={() => setIsRevealed(true)}
                      className="w-full min-h-[42px] px-4 py-2.5 rounded-lg luxury-btn-gold text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      <span>Révéler la définition &amp; le contexte</span>
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                    className="pt-3 border-t border-[#232a3a] space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#d4c78f] uppercase tracking-wider">
                        Sens &amp; Définition
                      </span>
                      <p className="text-sm font-semibold text-[#dce2f8] leading-snug">
                        {activeConcept.frenchDef}
                      </p>
                      <p className="text-xs text-[#d0c5af]/90 italic leading-relaxed">
                        {activeConcept.englishDef}
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#0c1322] border border-[#232a3a] p-3 space-y-1">
                      <span className="text-[10px] font-mono text-[#99907c] uppercase">
                        Mise en contexte
                      </span>
                      <p className="text-xs text-[#dce2f8] leading-relaxed">
                        « {activeConcept.pressExcerpt} »
                      </p>
                    </div>

                    {activeConcept.collocations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#d0c5af]">
                        <span className="text-[#99907c]">Collocations :</span>
                        {activeConcept.collocations.slice(0, 3).map((colloc, i) => (
                          <span key={colloc} className="font-mono text-[#d4c78f]">
                            {colloc}
                            {i < Math.min(2, activeConcept.collocations.length - 1) ? ' ·' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* SM-2 Flash Recall Rating Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#99907c]">
                  <span>Évaluez votre rappel instantané (mise à jour SM-2) :</span>
                  {isRevealed && (
                    <button
                      type="button"
                      onClick={() => setIsRevealed(false)}
                      className="text-[#d4c78f] hover:text-[#f2ca50] cursor-pointer"
                    >
                      Masquer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    data-testid="active-memory-rate-again"
                    disabled={isSavingRecall}
                    onClick={() => handleFlashRecall('again')}
                    className="min-h-[42px] px-2.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-200 text-xs font-semibold flex flex-col items-center justify-center transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <span>À revoir</span>
                    <span className="text-[10px] font-mono text-rose-300/80">24 h</span>
                  </button>

                  <button
                    type="button"
                    data-testid="active-memory-rate-good"
                    disabled={isSavingRecall}
                    onClick={() => handleFlashRecall('good')}
                    className="min-h-[42px] px-2.5 py-2 rounded-lg luxury-btn-amber-soft text-xs font-semibold flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                  >
                    <span>Acquis</span>
                    <span className="text-[10px] font-mono opacity-85">Intervalle SM-2</span>
                  </button>

                  <button
                    type="button"
                    data-testid="active-memory-rate-easy"
                    disabled={isSavingRecall}
                    onClick={() => handleFlashRecall('easy')}
                    className="min-h-[42px] px-2.5 py-2 rounded-lg luxury-btn-emerald text-xs font-semibold flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <span>Maîtrisé</span>
                    <span className="text-[10px] font-mono opacity-85">7 j+</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-6 text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-emerald-400">verified</span>
              <p className="text-sm font-semibold text-[#dce2f8]">
                Aucun concept en attente dans ce filtre.
              </p>
              <button
                type="button"
                onClick={() => setQueueFilter('all')}
                className="min-h-[36px] px-3 py-1.5 rounded-lg luxury-btn-surface text-xs font-semibold cursor-pointer"
              >
                Afficher toute la file
              </button>
            </div>
          )}
        </div>

        {/* Right: Prioritized Concepts List */}
        <div className="lg:col-span-5 rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-[#dce2f8] uppercase tracking-wider">
              File SM-2 ({filteredConcepts.length})
            </h4>
            <div className="flex items-center gap-1" role="group" aria-label="Filtrer la file de Mémoire Active">
              {(
                [
                  { id: 'all', label: 'Tous' },
                  { id: 'priority', label: 'Prioritaires' },
                  { id: 'new', label: 'Nouveaux' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueueFilter(tab.id)}
                  className={`min-h-[30px] px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    queueFilter === tab.id ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#232a3a] max-h-[340px] overflow-y-auto pr-1">
            {filteredConcepts.map((concept) => {
              const isSelected = activeConcept?.cardId === concept.cardId;
              const urgencyMeta = URGENCY_META[concept.urgency];
              return (
                <button
                  key={concept.cardId}
                  type="button"
                  onClick={() => handleSelectConcept(concept.cardId)}
                  className={`w-full py-2.5 px-2.5 text-left flex items-center justify-between gap-3 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                    isSelected ? 'bg-[#191f2f] border border-[#f2ca50]/40' : 'hover:bg-[#151b2b]/70'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold truncate ${
                          isSelected ? 'text-[#f2ca50]' : 'text-[#dce2f8]'
                        }`}
                      >
                        {concept.term}
                      </span>
                      <span className="font-mono text-[10px] text-[#99907c] shrink-0">
                        {concept.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#99907c] truncate">
                      {concept.priorityReason}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 font-mono tabular-nums gap-1">
                    <span className={`text-xs font-bold ${urgencyMeta.textClass}`}>
                      {concept.retentionScore}%
                    </span>
                    <div className="w-14 h-1 rounded-full bg-[#070e1d] overflow-hidden">
                      <div
                        style={{ width: `${concept.retentionScore}%` }}
                        className={`h-full rounded-full ${urgencyMeta.barClass}`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
