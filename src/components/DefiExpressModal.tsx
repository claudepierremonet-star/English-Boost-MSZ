import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { CEFRLevel } from '../firebase/types';
import { recordAttempt } from '../firebase/client';
import {
  generateGeneralQuizSession,
  type GeneralQuizOption,
  type GeneralQuizQuestionItem
} from '../data/cityMapData';
import {
  getSeenQuizHistory,
  recordSeenQuizQuestions
} from '../utils/cityMapManager';
import { awardMszCoins } from '../utils/mszCoinsManager';
import {
  playCorrectCue,
  playIncorrectCue,
  playSelectCue,
  playVictoryCue
} from '../utils/soundEffects';

const QUESTIONS_PER_EXPRESS = 5;
const SECONDS_PER_QUESTION = 12;

interface DefiExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: CEFRLevel;
  playerLevel?: number;
  onBonusXpEarned: (xp: number, arcadeBonusPts?: number) => void;
}

type QuestionOutcome = 'pending' | 'correct' | 'wrong' | 'timeout';

export const DefiExpressModal: React.FC<DefiExpressModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = 'B2',
  playerLevel = 1,
  onBonusXpEarned
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>(defaultLevel);
  const [questions, setQuestions] = useState<GeneralQuizQuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [outcomes, setOutcomes] = useState<QuestionOutcome[]>(
    Array(QUESTIONS_PER_EXPRESS).fill('pending')
  );
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(SECONDS_PER_QUESTION);
  const [isPhaseResolved, setIsPhaseResolved] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [totalElapsedSecs, setTotalElapsedSecs] = useState<number>(0);
  const [earnedXpSummary, setEarnedXpSummary] = useState<{
    baseXp: number;
    speedBonusXp: number;
    totalXp: number;
    arcadePts: number;
    coinsAwarded: number;
  } | null>(null);

  const sessionNonceRef = useRef<number>(Math.floor(Math.random() * 100000));
  const rewardDispatchedRef = useRef<boolean>(false);

  const startNewExpressRound = useCallback(
    (levelToUse: CEFRLevel) => {
      sessionNonceRef.current += 1;
      const { seenQuestionHashes, seenAnswerHashes } = getSeenQuizHistory();
      const batch = generateGeneralQuizSession(levelToUse, QUESTIONS_PER_EXPRESS, {
        excludeQuestionHashes: seenQuestionHashes,
        excludeAnswerHashes: seenAnswerHashes,
        sessionNonce: sessionNonceRef.current
      });
      recordSeenQuizQuestions(batch);

      setQuestions(batch);
      setCurrentIdx(0);
      setOutcomes(Array(batch.length).fill('pending'));
      setSelectedOptionIdx(null);
      setTimeLeft(SECONDS_PER_QUESTION);
      setIsPhaseResolved(false);
      setIsFinished(false);
      setTotalElapsedSecs(0);
      setEarnedXpSummary(null);
      rewardDispatchedRef.current = false;
    },
    []
  );

  // Initialize a fresh 5-question batch whenever modal opens
  useEffect(() => {
    if (isOpen) {
      startNewExpressRound(cefrLevel);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-question 1-second countdown timer
  useEffect(() => {
    if (!isOpen || isFinished || isPhaseResolved || questions.length === 0) return;

    const timer = setInterval(() => {
      setTotalElapsedSecs((prev) => prev + 1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isFinished, isPhaseResolved, questions.length, currentIdx]);

  // Handle timeout cleanly when timeLeft hits 0
  useEffect(() => {
    if (
      isOpen &&
      !isFinished &&
      !isPhaseResolved &&
      questions.length > 0 &&
      timeLeft === 0
    ) {
      playIncorrectCue();
      setIsPhaseResolved(true);
      setOutcomes((prev) => {
        const next = [...prev];
        next[currentIdx] = 'timeout';
        return next;
      });
    }
  }, [isOpen, isFinished, isPhaseResolved, questions.length, timeLeft, currentIdx]);

  const speakPrompt = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.94;
    window.speechSynthesis.speak(u);
  };

  const handleSelectOption = (opt: GeneralQuizOption, optIdx: number) => {
    if (isPhaseResolved || isFinished) return;
    playSelectCue();
    setSelectedOptionIdx(optIdx);
    setIsPhaseResolved(true);

    if (opt.isCorrect) {
      playCorrectCue();
      setOutcomes((prev) => {
        const next = [...prev];
        next[currentIdx] = 'correct';
        return next;
      });
    } else {
      playIncorrectCue();
      setOutcomes((prev) => {
        const next = [...prev];
        next[currentIdx] = 'wrong';
        return next;
      });
    }
  };

  const finalizeExpressRun = useCallback(
    (finalOutcomes: QuestionOutcome[]) => {
      if (rewardDispatchedRef.current) return;
      rewardDispatchedRef.current = true;

      const correctCount = finalOutcomes.filter((o) => o === 'correct').length;
      const baseXp = correctCount * 10;
      const speedBonusXp =
        correctCount === 5
          ? 25
          : correctCount === 4
          ? 15
          : correctCount === 3
          ? 10
          : 0;
      const totalXp = baseXp + speedBonusXp;
      const arcadePts = correctCount >= 3 ? 10 : 0;

      let coinsAwarded = 0;
      if (correctCount >= 4) {
        try {
          const res = awardMszCoins(
            'game',
            `defi-express-${Date.now()}`,
            1,
            playerLevel,
            `Défi Express (${correctCount}/5)`
          );
          coinsAwarded = res.awarded;
        } catch {}
      }

      setEarnedXpSummary({
        baseXp,
        speedBonusXp,
        totalXp,
        arcadePts,
        coinsAwarded
      });
      setIsFinished(true);

      if (correctCount >= 3) {
        playVictoryCue();
        if (correctCount >= 4) {
          confetti({
            particleCount: 55,
            spread: 65,
            origin: { y: 0.6 }
          });
        }
      }

      if (totalXp > 0) {
        onBonusXpEarned(totalXp, arcadePts);
      }

      const accuracyPct = Math.round(
        (correctCount / Math.max(1, finalOutcomes.length)) * 100
      );

      recordAttempt({
        moduleId: 'arcade_defi_express_5',
        moduleType: 'quiz',
        title: `Défi Express · 5 Questions Chrono (${cefrLevel})`,
        level: cefrLevel,
        score: accuracyPct,
        durationSeconds: Math.max(5, totalElapsedSecs)
      }).catch(console.warn);
    },
    [cefrLevel, onBonusXpEarned, playerLevel, totalElapsedSecs]
  );

  const handleNextStep = () => {
    if (currentIdx + 1 >= questions.length) {
      finalizeExpressRun(outcomes);
      return;
    }
    playSelectCue();
    setCurrentIdx((prev) => prev + 1);
    setSelectedOptionIdx(null);
    setTimeLeft(SECONDS_PER_QUESTION);
    setIsPhaseResolved(false);
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentIdx];
  const correctCount = outcomes.filter((o) => o === 'correct').length;
  const timerRatio = Math.max(0, Math.min(1, timeLeft / SECONDS_PER_QUESTION));
  const timerUrgent = timeLeft <= 4 && !isPhaseResolved;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Défi Express : 5 questions rapides chronométrées"
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-xl rounded-3xl bg-[#0e1526] border border-[#f2ca50]/45 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* TOP HEADER */}
        <div className="px-5 py-4 bg-[#151b2b] border-b border-[#232a3a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f2ca50] to-amber-600 text-[#3c2f00] flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-xl font-bold">bolt</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#f2ca50] font-bold">
                <span>DÉFI EXPRESS</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{QUESTIONS_PER_EXPRESS} QUESTIONS CHRONO</span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] truncate">
                Sprint Bonus XP ({cefrLevel})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick CEFR Switcher */}
            {!isFinished && (
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                {(['A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setCefrLevel(lvl);
                      startNewExpressRound(lvl);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      cefrLevel === lvl
                        ? 'bg-[#f2ca50] text-[#3c2f00]'
                        : 'text-[#99907c] hover:text-[#dce2f8]'
                    }`}
                    title={`Relancer un Défi Express niveau ${lvl}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#0c1322] hover:bg-[#232a3a] border border-[#232a3a] text-[#d0c5af] hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="Fermer le Défi Express"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isFinished && currentQuestion ? (
            <>
              {/* 5-Question Segmented Progress & Timer */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-[#d4c78f] font-semibold">
                    Question <strong className="text-[#f2ca50]">{currentIdx + 1}</strong> / {questions.length}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">
                      {correctCount} réussie{correctCount > 1 ? 's' : ''}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
                        timerUrgent
                          ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                          : 'bg-[#151b2b] border-[#232a3a] text-[#f2ca50]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span>{String(timeLeft).padStart(2, '0')}s</span>
                    </span>
                  </div>
                </div>

                {/* 5-Step Outcome Segments */}
                <div className="grid grid-cols-5 gap-1.5">
                  {outcomes.map((status, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-colors ${
                        status === 'correct'
                          ? 'bg-emerald-400'
                          : status === 'wrong' || status === 'timeout'
                          ? 'bg-rose-500'
                          : idx === currentIdx
                          ? 'bg-[#f2ca50]'
                          : 'bg-[#1b2336]'
                      }`}
                    />
                  ))}
                </div>

                {/* Live Per-Question Smooth Countdown Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#090f1d] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: timerRatio }}
                    transition={{ duration: 0.35, ease: 'linear' }}
                    style={{ transformOrigin: 'left center' }}
                    className={`w-full h-full ${
                      timerUrgent
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-[#d4af37] to-[#ffe088]'
                    }`}
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                        {currentQuestion.category} · {currentQuestion.level}
                      </span>

                      <button
                        type="button"
                        onClick={() => speakPrompt(currentQuestion.promptSentence)}
                        className="p-1.5 rounded-lg bg-[#0c1322] hover:bg-[#1f2940] border border-[#232a3a] text-[#f2ca50] flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                        title="Écouter la prononciation"
                      >
                        <span className="material-symbols-outlined text-base">volume_up</span>
                        <span className="hidden sm:inline">Écouter</span>
                      </button>
                    </div>

                    <p className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] leading-snug">
                      {currentQuestion.promptSentence}
                    </p>
                    <p className="text-xs text-[#d0c5af]/85">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options.map((opt, idx) => {
                      const isPicked = selectedOptionIdx === idx;
                      let stateStyle =
                        'bg-[#151b2b] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/60 hover:bg-[#1b2338]';

                      if (isPhaseResolved) {
                        if (opt.isCorrect) {
                          stateStyle =
                            'bg-emerald-950/75 border-emerald-400 text-emerald-200 font-bold';
                        } else if (isPicked) {
                          stateStyle =
                            'bg-rose-950/75 border-rose-500 text-rose-200';
                        } else {
                          stateStyle =
                            'bg-[#0c1322]/60 border-[#1c2334] text-[#99907c] opacity-65';
                        }
                      }

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          disabled={isPhaseResolved}
                          onClick={() => handleSelectOption(opt, idx)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${stateStyle}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-[#0c1322] border border-white/10 text-xs font-mono font-bold text-[#f2ca50] flex items-center justify-center shrink-0">
                              {opt.label}
                            </span>
                            <span className="text-sm font-medium break-words">{opt.text}</span>
                          </div>

                          {isPhaseResolved && opt.isCorrect && (
                            <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">
                              check_circle
                            </span>
                          )}
                          {isPhaseResolved && isPicked && !opt.isCorrect && (
                            <span className="material-symbols-outlined text-rose-400 text-lg shrink-0">
                              cancel
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Resolution Feedback & Next Button */}
                  {isPhaseResolved && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 pt-1"
                    >
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                          outcomes[currentIdx] === 'correct'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-[#151b2b] border-amber-500/35 text-[#d0c5af]'
                        }`}
                      >
                        <strong className="block mb-0.5 text-[#f2ca50]">
                          {outcomes[currentIdx] === 'timeout'
                            ? 'Temps écoulé !'
                            : outcomes[currentIdx] === 'correct'
                            ? 'Exact !'
                            : 'Explication :'}
                        </strong>
                        <span>
                          {currentQuestion.options.find((o) => o.isCorrect)?.explanation}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-3.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                      >
                        <span>
                          {currentIdx + 1 >= questions.length
                            ? 'Découvrir mes Bonus XP'
                            : 'Question Suivante'}
                        </span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : isFinished && earnedXpSummary ? (
            /* FINAL EXPRESS SUMMARY */
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-2 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f2ca50] to-amber-600 text-[#3c2f00] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(242,202,80,0.4)]">
                <span className="material-symbols-outlined text-3xl font-bold">
                  {correctCount >= 4 ? 'emoji_events' : correctCount >= 3 ? 'bolt' : 'refresh'}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                  Bilan Défi Express · {cefrLevel}
                </span>
                <h4 className="font-serif font-black text-2xl text-white mt-1 tabular-nums">
                  {correctCount} / {questions.length} bonnes réponses
                </h4>
                <p className="text-xs text-[#d0c5af] mt-1 tabular-nums">
                  Série bouclée en {totalElapsedSecs} secondes
                </p>
              </div>

              {/* XP Breakdown */}
              <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/35 space-y-2.5 text-xs font-mono tabular-nums">
                <div className="flex items-center justify-between text-[#d0c5af]">
                  <span>Réponses justes ({correctCount} × 10 XP)</span>
                  <span className="text-[#dce2f8] font-bold">+{earnedXpSummary.baseXp} XP</span>
                </div>
                <div className="flex items-center justify-between text-[#d0c5af]">
                  <span>Bonus Rapidité &amp; Précision</span>
                  <span className="text-emerald-400 font-bold">
                    +{earnedXpSummary.speedBonusXp} XP
                  </span>
                </div>
                {earnedXpSummary.arcadePts > 0 && (
                  <div className="flex items-center justify-between text-[#d0c5af]">
                    <span>Points d&apos;Arcade débloqués</span>
                    <span className="text-sky-400 font-bold">
                      +{earnedXpSummary.arcadePts} pts
                    </span>
                  </div>
                )}
                {earnedXpSummary.coinsAwarded > 0 && (
                  <div className="flex items-center justify-between text-[#d0c5af]">
                    <span>Bonus MSZ Coins</span>
                    <span className="text-[#f2ca50] font-bold">
                      +{earnedXpSummary.coinsAwarded} MSZ
                    </span>
                  </div>
                )}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Total XP remporté</span>
                  <span className="font-black text-[#f2ca50]">+{earnedXpSummary.totalXp} XP</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#151b2b] hover:bg-[#1f273d] border border-[#232a3a] text-[#dce2f8] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Retour aux Jeux
                </button>
                <button
                  type="button"
                  onClick={() => startNewExpressRound(cefrLevel)}
                  className="flex-1 py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  <span>Rejouer Express</span>
                </button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
