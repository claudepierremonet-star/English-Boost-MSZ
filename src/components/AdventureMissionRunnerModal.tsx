import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { AdventureDifficultyTier, CEFRLevel } from '../firebase/types';
import type {
  AdventureIsland,
  AdventureMission,
  AdventureQuestion
} from '../data/englishAdventureData';
import {
  buildAdaptiveQuestionsForMission,
  evaluateAndSubmitAdventureMission,
  type AdventureMissionEvaluationResult
} from '../utils/englishAdventureManager';
import type { AdventureDailyChallenge } from '../utils/adventureDailyChallenges';
import { speakText } from '../services/speechService';
import { playCorrectCue, playIncorrectCue, playVictoryCue, playSelectCue } from '../utils/soundEffects';

// Precomputed radial spark vectors for Boss victory GPU-composited particle burst
const BOSS_RADIAL_SPARKS = Array.from({ length: 14 }, (_, idx) => {
  const angleRad = (idx / 14) * Math.PI * 2;
  const dist = idx % 2 === 0 ? 115 : 82;
  return {
    id: idx,
    dx: Math.round(Math.cos(angleRad) * dist),
    dy: Math.round(Math.sin(angleRad) * (dist * 0.62)),
    size: idx % 3 === 0 ? 7 : 5,
    delay: (idx % 4) * 0.04
  };
});

interface SessionReviewItem {
  questionId: string;
  promptFr: string;
  promptEn: string;
  isCorrect: boolean;
  feedbackDetail: string;
  explanationFr: string;
  grammarRule?: string;
}

interface AdventureMissionRunnerModalProps {
  isOpen: boolean;
  island: AdventureIsland;
  mission: AdventureMission;
  initialTier: AdventureDifficultyTier;
  cefrLevel: CEFRLevel;
  isScaffoldedPractice?: boolean;
  dailyChallenge?: AdventureDailyChallenge;
  onClose: () => void;
  onMissionEvaluated: (result: AdventureMissionEvaluationResult) => void;
  onEquipUnlockedAvatar?: (avatarId: string) => void;
  onApplyUnlockedTheme?: (themeId: string) => void;
}

function shuffleDeterministic<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 1000003;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const j = seed % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function normalizeTextForCompare(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,!?;:'"«»()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const AdventureMissionRunnerModal: React.FC<AdventureMissionRunnerModalProps> = ({
  isOpen,
  island,
  mission,
  initialTier,
  cefrLevel,
  isScaffoldedPractice = false,
  dailyChallenge,
  onClose,
  onMissionEvaluated,
  onEquipUnlockedAvatar,
  onApplyUnlockedTheme
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTier, setActiveTier] = useState<AdventureDifficultyTier>(initialTier);
  const [runNonce, setRunNonce] = useState<number>(0);

  const initialQuestions = useMemo(() => {
    if (isScaffoldedPractice) {
      return island.scaffoldedPracticeQuestions.length > 0
        ? [...island.scaffoldedPracticeQuestions]
        : [...mission.questions.slice(0, 3)];
    }
    return buildAdaptiveQuestionsForMission(mission, island, activeTier);
  }, [island, mission, activeTier, isScaffoldedPractice, runNonce]);

  const [questions, setQuestions] = useState<AdventureQuestion[]>(initialQuestions);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(activeTier === 'scaffolded' || isScaffoldedPractice);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [hintSeenOnCurrent, setHintSeenOnCurrent] = useState<boolean>(false);

  // Per-question answer states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedLeftPairId, setSelectedLeftPairId] = useState<string | null>(null);
  const [matchedPairsMap, setMatchedPairsMap] = useState<Record<string, string>>({});
  const [builtTokenIndices, setBuiltTokenIndices] = useState<number[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [audioAccent, setAudioAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [micSupported, setMicSupported] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Validation & feedback
  const [submittedState, setSubmittedState] = useState<{
    checked: boolean;
    isCorrect: boolean;
    feedbackDetail: string;
  } | null>(null);

  // Scoring telemetry (Pedagogical: Accuracy, Consistency Streak, Retention — NOT Speed)
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [retentionCorrectCount, setRetentionCorrectCount] = useState<number>(0);
  const [retentionTotalCount, setRetentionTotalCount] = useState<number>(0);
  const [extraRemedialInjected, setExtraRemedialInjected] = useState<boolean>(false);
  const [sessionReviewItems, setSessionReviewItems] = useState<SessionReviewItem[]>([]);
  const [showReviewPanel, setShowReviewPanel] = useState<boolean>(false);

  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<AdventureMissionEvaluationResult | null>(null);
  const [bossShakeActive, setBossShakeActive] = useState<boolean>(false);
  const [showBossSparks, setShowBossSparks] = useState<boolean>(false);
  const startedAtRef = useRef<number>(Date.now());
  const recognitionRef = useRef<any>(null);
  const audioTimerRef = useRef<number | null>(null);
  const celebrationTimersRef = useRef<number[]>([]);

  const clearCelebrationTimers = useCallback(() => {
    for (const id of celebrationTimersRef.current) {
      window.clearTimeout(id);
    }
    celebrationTimersRef.current = [];
  }, []);

  const triggerBossVictoryCelebration = useCallback(() => {
    clearCelebrationTimers();
    if (!shouldReduceMotion) {
      setBossShakeActive(true);
      setShowBossSparks(true);
      celebrationTimersRef.current.push(
        window.setTimeout(() => setBossShakeActive(false), 720),
        window.setTimeout(() => setShowBossSparks(false), 1800)
      );
    }

    try {
      const palette = ['#f2ca50', '#ffe088', '#34d399', '#38bdf8', island.accentHex, '#ffffff'];
      confetti({
        particleCount: 95,
        spread: 85,
        startVelocity: 42,
        origin: { y: 0.54 },
        colors: palette,
        zIndex: 9999,
        disableForReducedMotion: true
      });
      celebrationTimersRef.current.push(
        window.setTimeout(() => {
          try {
            confetti({
              particleCount: 60,
              angle: 60,
              spread: 65,
              origin: { x: 0.14, y: 0.64 },
              colors: ['#f2ca50', '#34d399', island.accentHex, '#ffffff'],
              zIndex: 9999,
              disableForReducedMotion: true
            });
            confetti({
              particleCount: 60,
              angle: 120,
              spread: 65,
              origin: { x: 0.86, y: 0.64 },
              colors: ['#f2ca50', '#38bdf8', island.accentHex, '#ffffff'],
              zIndex: 9999,
              disableForReducedMotion: true
            });
          } catch {}
        }, 220),
        window.setTimeout(() => {
          try {
            confetti({
              particleCount: 45,
              spread: 105,
              startVelocity: 28,
              scalar: 0.9,
              origin: { y: 0.28 },
              colors: ['#f2ca50', '#ffe088', '#ffffff'],
              zIndex: 9999,
              disableForReducedMotion: true
            });
          } catch {}
        }, 480)
      );
    } catch {
      // Ignore canvas-confetti sandbox constraints
    }
  }, [clearCelebrationTimers, island.accentHex, shouldReduceMotion]);

  const stopActiveSpeech = useCallback(() => {
    if (audioTimerRef.current !== null) {
      window.clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    setIsPlayingAudio(false);
    try {
      window.speechSynthesis?.cancel();
    } catch {}
  }, []);

  useEffect(() => {
    setActiveTier(initialTier);
  }, [initialTier, mission.id]);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    setMicSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));
    return () => {
      stopActiveSpeech();
      clearCelebrationTimers();
      try {
        recognitionRef.current?.stop?.();
      } catch {}
    };
  }, [stopActiveSpeech, clearCelebrationTimers]);

  useEffect(() => {
    setQuestions(initialQuestions);
    setCurrentIdx(0);
    setShowHint(activeTier === 'scaffolded' || isScaffoldedPractice);
    setHintsUsedCount(0);
    setHintSeenOnCurrent(false);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setRetentionCorrectCount(0);
    setRetentionTotalCount(0);
    setExtraRemedialInjected(false);
    setSessionReviewItems([]);
    setShowReviewPanel(false);
    setFinalResult(null);
    setBossShakeActive(false);
    setShowBossSparks(false);
    clearCelebrationTimers();
    startedAtRef.current = Date.now();
  }, [initialQuestions, activeTier, isScaffoldedPractice, clearCelebrationTimers]);

  const currentQuestion = questions[currentIdx];

  // Reset per-question inputs & cancel lingering speech when question changes
  useEffect(() => {
    if (!currentQuestion) return;
    stopActiveSpeech();
    setSelectedOption(null);
    setSelectedLeftPairId(null);
    setMatchedPairsMap({});
    setBuiltTokenIndices([]);
    setTextInput('');
    setSubmittedState(null);
    setMicError(null);
    setAudioAccent(currentQuestion.audioAccent || 'en-GB');
    setShowHint(activeTier === 'scaffolded' || isScaffoldedPractice);
    setHintSeenOnCurrent(false);
  }, [currentIdx, currentQuestion?.id, activeTier, isScaffoldedPractice, stopActiveSpeech]);

  const shuffledRightPairs = useMemo(() => {
    if (!currentQuestion?.pairs) return [];
    return shuffleDeterministic(
      currentQuestion.pairs.map((p) => ({ id: p.id, right: p.right })),
      `${currentQuestion.id}_right`
    );
  }, [currentQuestion]);

  const shuffledSentenceTokens = useMemo(() => {
    if (!currentQuestion?.sentenceTokens) return [];
    return shuffleDeterministic(
      currentQuestion.sentenceTokens.map((tok, idx) => ({ tok, idx })),
      `${currentQuestion.id}_tok`
    );
  }, [currentQuestion]);

  if (!isOpen || !currentQuestion) return null;

  const totalQ = questions.length;
  const progressPct = Math.round(((currentIdx + (submittedState ? 1 : 0)) / totalQ) * 100);

  const handlePlayAudio = (text: string, slowOverride?: boolean) => {
    if (!text) return;
    stopActiveSpeech();
    const rate = slowOverride
      ? 0.78
      : activeTier === 'scaffolded'
      ? 0.85
      : activeTier === 'mastery'
      ? 1.05
      : 0.96;
    setIsPlayingAudio(true);
    speakText(text, audioAccent, `adv-${currentQuestion.id}`, {
      rate,
      naturalProsody: true
    });
    const estimatedMs = Math.min(9500, Math.max(1800, Math.round((text.length * 72) / rate)));
    audioTimerRef.current = window.setTimeout(() => {
      setIsPlayingAudio(false);
      audioTimerRef.current = null;
    }, estimatedMs);
  };

  const handleToggleHint = () => {
    playSelectCue();
    if (!showHint && !hintSeenOnCurrent) {
      setHintsUsedCount((c) => c + 1);
      setHintSeenOnCurrent(true);
    }
    setShowHint((prev) => !prev);
  };

  const handleStartSpeechRecognition = () => {
    if (isListeningMic) {
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      setIsListeningMic(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const RecCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecCtor) {
      setMicError('Reconnaissance vocale indisponible sur ce navigateur. Utilisez la saisie écrite ci-dessous.');
      return;
    }

    try {
      setMicError(null);
      const rec = new RecCtor();
      rec.lang = audioAccent;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;
      setIsListeningMic(true);

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setTextInput(transcript.trim());
      };

      rec.onerror = () => {
        setIsListeningMic(false);
        setMicError('Capture micro interrompue. Vous pouvez compléter ou corriger votre réponse à l’écrit.');
      };

      rec.onend = () => {
        setIsListeningMic(false);
      };

      rec.start();
    } catch {
      setIsListeningMic(false);
      setMicError('Impossible d’activer le microphone. Utilisez l’alternative écrite.');
    }
  };

  const canValidate = (() => {
    if (submittedState) return false;
    switch (currentQuestion.type) {
      case 'multiple_choice':
      case 'listening_audio':
      case 'reading_passage':
        return selectedOption !== null;
      case 'pair_match':
        return (
          Array.isArray(currentQuestion.pairs) &&
          Object.keys(matchedPairsMap).length === currentQuestion.pairs.length
        );
      case 'sentence_build':
        return (
          Array.isArray(currentQuestion.sentenceTokens) &&
          builtTokenIndices.length === currentQuestion.sentenceTokens.length
        );
      case 'speaking_prompt':
      case 'writing_prompt':
        return textInput.trim().length >= 4;
      default:
        return false;
    }
  })();

  const handleValidateCurrent = () => {
    if (!canValidate || submittedState) return;
    let isCorrect = false;
    let feedbackDetail = '';

    if (
      currentQuestion.type === 'multiple_choice' ||
      currentQuestion.type === 'listening_audio' ||
      currentQuestion.type === 'reading_passage'
    ) {
      isCorrect = selectedOption === currentQuestion.correctIndex;
      const correctLabel = currentQuestion.options?.[currentQuestion.correctIndex || 0] || '';
      feedbackDetail = isCorrect
        ? 'Réponse exacte et maîtrisée.'
        : `Réponse attendue : « ${correctLabel} ».`;
    } else if (currentQuestion.type === 'pair_match' && currentQuestion.pairs) {
      const totalPairs = currentQuestion.pairs.length;
      let matchedCorrect = 0;
      for (const p of currentQuestion.pairs) {
        if (matchedPairsMap[p.id] === p.id) matchedCorrect++;
      }
      isCorrect = matchedCorrect === totalPairs;
      feedbackDetail = isCorrect
        ? `Toutes les ${totalPairs} associations sont exactes !`
        : `${matchedCorrect}/${totalPairs} associations correctes. Corrigeons ensemble : ${currentQuestion.pairs
            .map((p) => `${p.left} ↔ ${p.right}`)
            .join(' · ')}.`;
    } else if (currentQuestion.type === 'sentence_build' && currentQuestion.expectedSentence) {
      const assembled = builtTokenIndices.map((idx) => shuffledSentenceTokens[idx]?.tok || '').join(' ');
      isCorrect =
        normalizeTextForCompare(assembled) === normalizeTextForCompare(currentQuestion.expectedSentence);
      feedbackDetail = isCorrect
        ? `Syntaxe impeccable : « ${currentQuestion.expectedSentence} »`
        : `Ordre exact attendu : « ${currentQuestion.expectedSentence} »`;
    } else if (currentQuestion.type === 'speaking_prompt') {
      const norm = normalizeTextForCompare(textInput);
      const wordsCount = norm ? norm.split(' ').length : 0;
      const keywords = (currentQuestion.acceptedSpeechKeywords || []).map((k) => k.toLowerCase());
      const matchedKw = keywords.filter((kw) => norm.includes(kw));
      const targetNorm = normalizeTextForCompare(currentQuestion.targetSpeechPhrase || '');
      isCorrect =
        (wordsCount >= 3 && (matchedKw.length >= 1 || keywords.length === 0)) ||
        (targetNorm.length > 0 && norm.includes(targetNorm.slice(0, Math.min(14, targetNorm.length))));
      feedbackDetail = isCorrect
        ? `Expression orale claire et pertinente (${matchedKw.length > 0 ? matchedKw.join(', ') : 'structure validée'}).`
        : `Pensez à inclure la formulation clé : « ${currentQuestion.targetSpeechPhrase} ».`;
    } else if (currentQuestion.type === 'writing_prompt') {
      const norm = normalizeTextForCompare(textInput);
      const words = norm ? norm.split(' ').filter(Boolean) : [];
      const minWords = currentQuestion.writingMinWords || 12;
      const requiredKws = (currentQuestion.writingRequiredKeywords || []).map((k) => k.toLowerCase());
      const matchedKws = requiredKws.filter((k) => norm.includes(k));
      const minKwNeeded = requiredKws.length > 0 ? Math.max(1, Math.ceil(requiredKws.length * 0.5)) : 0;
      isCorrect = words.length >= minWords && matchedKws.length >= minKwNeeded;
      feedbackDetail = isCorrect
        ? `Rédaction validée (${words.length} mots · ${matchedKws.length}/${requiredKws.length} mots-clés intégrés).`
        : `Vérifiez les critères : ${words.length}/${minWords} mots minimum et ${matchedKws.length}/${minKwNeeded} connecteurs/mots-clés attendus (${requiredKws.join(', ')}).`;
    }

    if (isCorrect) {
      playCorrectCue();
      setCorrectCount((c) => c + 1);
      setCurrentStreak((s) => {
        const nextS = s + 1;
        setMaxStreak((m) => Math.max(m, nextS));
        return nextS;
      });
    } else {
      playIncorrectCue();
      setWrongCount((w) => {
        const nextW = w + 1;
        // Dynamic adaptation mid-mission: inject 1 guided scaffolded question if struggling (>=2 mistakes)
        if (
          nextW >= 2 &&
          !extraRemedialInjected &&
          !isScaffoldedPractice &&
          island.scaffoldedPracticeQuestions.length > 0
        ) {
          const candidate = island.scaffoldedPracticeQuestions.find(
            (sq) => !questions.some((q) => q.id === sq.id)
          );
          if (candidate) {
            setQuestions((prev) => [...prev, candidate]);
            setExtraRemedialInjected(true);
          }
        }
        return nextW;
      });
      setCurrentStreak(0);
      setShowHint(true);
    }

    if (currentQuestion.isRetentionCheck) {
      setRetentionTotalCount((rt) => rt + 1);
      if (isCorrect) setRetentionCorrectCount((rc) => rc + 1);
    }

    setSessionReviewItems((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        promptFr: currentQuestion.promptFr,
        promptEn: currentQuestion.promptEn,
        isCorrect,
        feedbackDetail,
        explanationFr: currentQuestion.explanationFr,
        grammarRule: currentQuestion.grammarRule
      }
    ]);

    setSubmittedState({
      checked: true,
      isCorrect,
      feedbackDetail
    });
  };

  const handleNextOrFinish = async () => {
    if (currentIdx + 1 < questions.length) {
      playSelectCue();
      setCurrentIdx((idx) => idx + 1);
      return;
    }

    setIsSubmittingFinal(true);
    const durationSeconds = Math.max(15, Math.round((Date.now() - startedAtRef.current) / 1000));
    try {
      const result = await evaluateAndSubmitAdventureMission({
        island,
        mission,
        correctCount,
        totalCount: questions.length,
        maxAccuracyStreak: maxStreak,
        retentionCorrectCount,
        retentionTotalCount,
        hintsUsed: hintsUsedCount,
        durationSeconds,
        adaptiveTierUsed: activeTier,
        cefrLevel,
        isScaffoldedPractice,
        dailyChallenge
      });
      if (result.passed) {
        playVictoryCue();
        if (mission.kind === 'boss_challenge' && !isScaffoldedPractice) {
          triggerBossVictoryCelebration();
        }
      }
      setFinalResult(result);
      onMissionEvaluated(result);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleRetryWithNextTier = () => {
    playSelectCue();
    if (finalResult?.nextTier) {
      setActiveTier(finalResult.nextTier);
    }
    setRunNonce((n) => n + 1);
  };

  // Keyboard shortcuts: Escape closes modal, 1-4 picks options
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopActiveSpeech();
        onClose();
        return;
      }
      if (finalResult || submittedState) return;
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'TEXTAREA' || targetTag === 'INPUT') return;

      if (
        (currentQuestion.type === 'multiple_choice' ||
          currentQuestion.type === 'listening_audio' ||
          currentQuestion.type === 'reading_passage') &&
        currentQuestion.options
      ) {
        const num = Number(e.key);
        if (num >= 1 && num <= currentQuestion.options.length) {
          playSelectCue();
          setSelectedOption(num - 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, finalResult, submittedState, currentQuestion, onClose, stopActiveSpeech]);

  const handleLeftPairClick = (pairId: string) => {
    if (submittedState) return;
    playSelectCue();
    setSelectedLeftPairId((prev) => (prev === pairId ? null : pairId));
  };

  const handleRightPairClick = (rightId: string) => {
    if (submittedState || !selectedLeftPairId) return;
    playSelectCue();
    setMatchedPairsMap((prev) => {
      const next = { ...prev };
      // Clear any previous left key mapped to this rightId so links remain 1-to-1
      for (const [lId, rId] of Object.entries(next)) {
        if (rId === rightId) delete next[lId];
      }
      next[selectedLeftPairId] = rightId;
      return next;
    });
    setSelectedLeftPairId(null);
  };

  const tierLabelFr =
    activeTier === 'scaffolded'
      ? 'Mode Soutien Guidé'
      : activeTier === 'mastery'
      ? 'Défi Excellence'
      : 'Parcours Standard';

  return (
    <div
      className="ea-theme-root fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${island.name} - ${mission.title}`}
    >
      <motion.div
        animate={
          bossShakeActive && !shouldReduceMotion
            ? {
                x: [0, -11, 10, -8, 7, -4, 3, -1, 0],
                y: [0, 7, -8, 6, -5, 3, -2, 1, 0],
                rotate: [0, -0.75, 0.7, -0.5, 0.4, -0.2, 0.1, 0]
              }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="w-full max-w-2xl rounded-2xl bg-[var(--ea-bg-surface)] border border-[var(--ea-border-gold)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] will-change-transform"
      >
        {/* Top Modal Header */}
        <div
          className="px-4 sm:px-6 py-4 border-b border-[var(--ea-border-subtle)] flex items-center justify-between gap-3"
          style={{
            background: `linear-gradient(135deg, ${island.accentHex}18 0%, var(--ea-bg-surface) 65%)`
          }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border"
                style={{
                  color: island.accentHex,
                  borderColor: `${island.accentHex}66`,
                  backgroundColor: `${island.accentHex}18`
                }}
              >
                {dailyChallenge ? `Défi Quotidien · ${dailyChallenge.skillPairLabelFr}` : `Île ${island.number} · ${island.name}`}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[var(--ea-bg-elevated)] border border-[var(--ea-border-subtle)] text-[10px] font-mono text-[var(--ea-text-gold-soft)]">
                {mission.cefrLevel} · {tierLabelFr}
              </span>
              {dailyChallenge && (
                <span className="px-2 py-0.5 rounded-md bg-[#f2ca50]/15 border border-[var(--ea-border-gold)] text-[10px] font-mono font-bold text-[var(--ea-text-gold)] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  Multiplicateur ×{dailyChallenge.xpMultiplierReward} XP
                </span>
              )}
              {mission.kind === 'boss_challenge' && !dailyChallenge && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/50 text-[10px] font-mono font-bold text-rose-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">swords</span>
                  Boss : {island.bossName}
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--ea-text-cream)] truncate mt-1">
              {isScaffoldedPractice ? `Entraînement Guidé · ${island.name}` : mission.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--ea-bg-elevated)] hover:bg-[var(--ea-bg-interactive)] border border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)] hover:text-[var(--ea-text-gold)] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Fermer la mission"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {finalResult ? (
            /* ==================== MISSION EVALUATION & REWARDS SCREEN ==================== */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div
                className={`relative overflow-hidden p-5 rounded-2xl border text-center space-y-3 ${
                  finalResult.passed
                    ? 'bg-gradient-to-b from-emerald-950/45 to-[var(--ea-bg-surface)] border-emerald-500/50'
                    : 'bg-gradient-to-b from-amber-950/40 to-[var(--ea-bg-surface)] border-amber-500/50'
                }`}
              >
                {/* Boss Victory Radial Shockwave & GPU Spark Particles */}
                {mission.kind === 'boss_challenge' && finalResult.passed && showBossSparks && !shouldReduceMotion && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
                    aria-hidden="true"
                  >
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0.9 }}
                      animate={{ scale: 2.3, opacity: 0 }}
                      transition={{ duration: 0.85, ease: 'easeOut' }}
                      className="w-28 h-28 rounded-full border-2"
                      style={{ borderColor: '#f2ca50', boxShadow: `0 0 28px ${island.accentHex}88` }}
                    />
                    {BOSS_RADIAL_SPARKS.map((sp) => (
                      <motion.span
                        key={sp.id}
                        initial={{ x: 0, y: -18, scale: 1.15, opacity: 1 }}
                        animate={{ x: sp.dx, y: sp.dy - 18, scale: 0.15, opacity: 0 }}
                        transition={{ duration: 0.95, delay: sp.delay, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute rounded-full"
                        style={{
                          width: sp.size,
                          height: sp.size,
                          backgroundColor: sp.id % 2 === 0 ? '#f2ca50' : island.accentHex,
                          boxShadow: '0 0 8px rgba(242,202,80,0.8)'
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  {[1, 2, 3].map((starIdx) => (
                    <motion.span
                      key={starIdx}
                      initial={
                        finalResult.passed && !shouldReduceMotion
                          ? { scale: 0.5, opacity: 0 }
                          : false
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: finalResult.passed ? 0.08 * starIdx : 0,
                        type: 'spring',
                        stiffness: 380,
                        damping: 18
                      }}
                      className={`material-symbols-outlined text-3xl ${
                        starIdx <= finalResult.stars ? 'text-[var(--ea-text-gold)]' : 'text-[#4b566e]'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </motion.span>
                  ))}
                </div>

                <h3 className="relative z-10 font-serif text-2xl font-bold text-[var(--ea-text-cream)]">
                  {finalResult.passed
                    ? dailyChallenge
                      ? 'Défi Quotidien Relevé !'
                      : mission.kind === 'boss_challenge'
                      ? `Victoire sur ${island.bossName} !`
                      : 'Mission Accomplie avec Rigueur !'
                    : 'Consolidation Recommandée'}
                </h3>

                <p className="text-xs text-[var(--ea-text-cream-muted)] max-w-md mx-auto leading-relaxed">
                  {finalResult.passed
                    ? 'Votre précision, votre constance et la rétention de vos acquis ont été récompensées (sans prime de précipitation).'
                    : `Score obtenu : ${finalResult.accuracy}% (seuil requis : ${mission.passAccuracyRequired}%). Le mode Soutien Guidé a été activé pour vous accompagner au prochain essai.`}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 text-left">
                  <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--ea-text-gold-soft)] block">Précision</span>
                    <span className="text-lg font-mono font-bold text-[var(--ea-text-gold)] tabular-nums">
                      {finalResult.accuracy}%
                    </span>
                    <span className="text-[10px] text-[var(--ea-text-cream-muted)] block">
                      {correctCount}/{questions.length} exactes
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--ea-text-gold-soft)] block">Constance</span>
                    <span className="text-lg font-mono font-bold text-sky-300 tabular-nums">
                      {maxStreak} de suite
                    </span>
                    <span className="text-[10px] text-[var(--ea-text-cream-muted)] block">
                      {finalResult.consistencyBonusAwarded ? 'Prime validée' : 'Série d’exactitude'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--ea-text-gold-soft)] block">Adaptation</span>
                    <span className="text-sm font-mono font-bold text-emerald-300 mt-1 block">
                      {finalResult.nextTier === 'mastery'
                        ? 'Excellence'
                        : finalResult.nextTier === 'scaffolded'
                        ? 'Soutien Guidé'
                        : 'Standard'}
                    </span>
                    <span className="text-[10px] text-[var(--ea-text-cream-muted)] block">Palier suivant</span>
                  </div>
                </div>
              </div>

              {/* Claimed Rewards & Anti-Duplicate Ledger */}
              <div className="p-4 rounded-xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase text-[var(--ea-text-gold)] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">verified</span>
                    Récompenses Certifiées (Anti-Doublon Firestore)
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold tabular-nums">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--ea-bg-deep)] border border-[var(--ea-border)] text-[var(--ea-text-gold)]">
                      +{finalResult.xpAwarded} XP
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--ea-bg-deep)] border border-amber-400/45 text-amber-300">
                      +{finalResult.coinsAwarded} MSZ Coins
                    </span>
                  </div>
                </div>

                {finalResult.newlyClaimedLabels.length > 0 ? (
                  <ul className="space-y-1.5">
                    {finalResult.newlyClaimedLabels.map((lbl, i) => (
                      <li
                        key={i}
                        className="text-xs text-emerald-200 flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                        <span>{lbl}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--ea-text-cream-muted)] italic">
                    {finalResult.isDuplicateReplay
                      ? 'Vous avez déjà perçu les récompenses uniques de cette étape. Votre record de précision reste sauvegardé.'
                      : 'Atteignez le seuil de réussite requis pour débloquer les récompenses de cette étape.'}
                  </p>
                )}

                {/* Activated Temporary XP Boost Banner or Applied Multiplier */}
                {finalResult.activatedXpBoost && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#231d12] via-[#1b2236] to-[var(--ea-bg-deep)] border border-[var(--ea-border-gold)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-2xl text-[var(--ea-text-gold)] shrink-0">
                        bolt
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono uppercase font-bold text-[var(--ea-text-gold)]">
                          Multiplicateur d’XP Temporaire Activé
                        </div>
                        <div className="text-xs font-semibold text-[var(--ea-text-cream)]">
                          ×{finalResult.activatedXpBoost.multiplier} XP sur vos prochaines missions ({dailyChallenge?.boostDurationLabelFr || '2 heures'})
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] font-mono font-bold text-xs shrink-0 tabular-nums">
                      ×{finalResult.activatedXpBoost.multiplier}
                    </span>
                  </div>
                )}

                {finalResult.xpMultiplierApplied && finalResult.xpMultiplierBonus ? (
                  <div className="px-3 py-2 rounded-lg bg-[#f2ca50]/15 border border-[var(--ea-border-gold)] text-xs text-[var(--ea-text-gold-bright)] flex items-center gap-2 font-mono tabular-nums">
                    <span className="material-symbols-outlined text-base text-[var(--ea-text-gold)]">bolt</span>
                    <span>
                      Multiplicateur actif ×{finalResult.xpMultiplierApplied} appliqué : +{finalResult.xpMultiplierBonus} XP supplémentaires !
                    </span>
                  </div>
                ) : null}

                {/* Unlocked Territory / Trophy / Card / Avatar / Theme */}
                {(finalResult.unlockedNextIsland ||
                  finalResult.unlockedTrophy ||
                  finalResult.unlockedCard ||
                  finalResult.unlockedAvatar ||
                  finalResult.unlockedTheme) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[var(--ea-border-subtle)]">
                    {finalResult.unlockedNextIsland && (
                      <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-emerald-400/50 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-300 text-2xl">explore</span>
                        <div>
                          <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                            Nouveau Territoire Débloqué
                          </div>
                          <div className="text-xs font-bold text-[var(--ea-text-cream)]">
                            Île {finalResult.unlockedNextIsland.number} · {finalResult.unlockedNextIsland.name}
                          </div>
                        </div>
                      </div>
                    )}

                    {finalResult.unlockedTrophy && (
                      <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border-gold)] flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[var(--ea-text-gold)] text-2xl">
                          {finalResult.unlockedTrophy.icon}
                        </span>
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[var(--ea-text-gold)] font-bold">
                            Trophée Obtenu
                          </div>
                          <div className="text-xs font-bold text-[var(--ea-text-cream)]">
                            {finalResult.unlockedTrophy.title}
                          </div>
                        </div>
                      </div>
                    )}

                    {finalResult.unlockedCard && (
                      <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-sky-400/50 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-sky-300 text-2xl">
                          {finalResult.unlockedCard.icon}
                        </span>
                        <div>
                          <div className="text-[10px] font-mono uppercase text-sky-300 font-bold">
                            Carte Collector ({finalResult.unlockedCard.rarity})
                          </div>
                          <div className="text-xs font-bold text-[var(--ea-text-cream)]">
                            {finalResult.unlockedCard.name}
                          </div>
                        </div>
                      </div>
                    )}

                    {finalResult.unlockedAvatar && (
                      <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-amber-400/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-amber-300 text-2xl">
                            {finalResult.unlockedAvatar.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                              Avatar Débloqué
                            </div>
                            <div className="text-xs font-bold text-[var(--ea-text-cream)] truncate">
                              {finalResult.unlockedAvatar.name}
                            </div>
                          </div>
                        </div>
                        {onEquipUnlockedAvatar && (
                          <button
                            type="button"
                            onClick={() => onEquipUnlockedAvatar(finalResult.unlockedAvatar!.id)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] text-[10px] font-bold font-mono shrink-0 cursor-pointer"
                          >
                            Équiper
                          </button>
                        )}
                      </div>
                    )}

                    {finalResult.unlockedTheme && (
                      <div className="p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-violet-400/50 flex items-center justify-between gap-2 sm:col-span-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-violet-300 text-2xl">palette</span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase text-violet-300 font-bold">
                              Thème d’Interface Débloqué
                            </div>
                            <div className="text-xs font-bold text-[var(--ea-text-cream)] truncate">
                              {finalResult.unlockedTheme.name} — {finalResult.unlockedTheme.subtitleFr}
                            </div>
                          </div>
                        </div>
                        {onApplyUnlockedTheme && (
                          <button
                            type="button"
                            onClick={() => onApplyUnlockedTheme(finalResult.unlockedTheme!.id)}
                            className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-[10px] font-bold font-mono shrink-0 cursor-pointer"
                          >
                            Activer ce thème
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Session Pedagogical Error & Rule Review */}
              {sessionReviewItems.length > 0 && (
                <div className="rounded-xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      playSelectCue();
                      setShowReviewPanel((v) => !v);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-[var(--ea-text-cream)] hover:bg-[var(--ea-bg-elevated)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-sky-300">fact_check</span>
                      <span>
                        Bilan Pédagogique ({sessionReviewItems.filter((i) => !i.isCorrect).length} point(s) à revoir sur {sessionReviewItems.length})
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-base text-[var(--ea-text-gold-soft)]">
                      {showReviewPanel ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {showReviewPanel && (
                    <div className="p-4 pt-1 space-y-2.5 border-t border-[var(--ea-border-subtle)] max-h-64 overflow-y-auto">
                      {sessionReviewItems.map((item, idx) => (
                        <div
                          key={`${item.questionId}-${idx}`}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            item.isCorrect
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : 'bg-rose-950/25 border-rose-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 font-semibold">
                            <span className={item.isCorrect ? 'text-emerald-300' : 'text-rose-200'}>
                              {item.isCorrect ? '✓ Exact' : '✕ À consolider'} · {item.promptFr}
                            </span>
                          </div>
                          <p className="text-[var(--ea-text-cream)] italic">{item.promptEn}</p>
                          <p className="text-[var(--ea-text-cream-muted)]">{item.feedbackDetail}</p>
                          <p className="text-[var(--ea-text-gold-soft)] leading-relaxed">{item.explanationFr}</p>
                          {item.grammarRule && (
                            <p className="text-[11px] font-mono text-[var(--ea-text-gold)]">
                              Règle : {item.grammarRule}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleRetryWithNextTier}
                  className="sm:flex-1 py-3 rounded-xl bg-[var(--ea-bg-elevated)] hover:bg-[var(--ea-bg-interactive)] border border-[var(--ea-border)] text-[var(--ea-text-gold)] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Réessayer ({finalResult.nextTier === 'mastery' ? 'Excellence' : finalResult.nextTier === 'scaffolded' ? 'Soutien Guidé' : 'Standard'})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopActiveSpeech();
                    onClose();
                  }}
                  className="sm:flex-1 py-3 rounded-xl bg-[var(--ea-text-gold)] hover:bg-[var(--ea-text-gold-bright)] text-[var(--ea-text-on-gold)] font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Retourner sur la Carte de l’Archipel
                </button>
              </div>
            </motion.div>
          ) : (
            /* ==================== ACTIVE QUESTION VIEW ==================== */
            <>
              {/* Pedagogical Progress Header (No Timer Pressure) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-[var(--ea-text-gold-soft)]">
                    Étape <strong className="text-[var(--ea-text-gold)]">{currentIdx + 1}</strong> / {totalQ}
                    {currentQuestion.isRetentionCheck && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/40 text-[10px] text-sky-300">
                        Vérif. Rétention
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">Série juste : {currentStreak}</span>
                    <span className="text-[var(--ea-text-cream-muted)]">·</span>
                    <span className="text-[var(--ea-text-gold)] font-bold">
                      Seuil : {isScaffoldedPractice ? 50 : mission.passAccuracyRequired}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--ea-bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%`, backgroundColor: island.accentHex }}
                  />
                </div>
                {extraRemedialInjected && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-950/35 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-300">psychology_alt</span>
                    <span>
                      Adaptation dynamique activée : un exercice de consolidation guidé a été ajouté pour renforcer votre maîtrise.
                    </span>
                  </div>
                )}
              </div>

              {/* Prompt Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ea-text-gold)]">
                    {currentQuestion.promptFr}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleHint}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                      showHint
                        ? 'bg-[#f2ca50]/20 border-[var(--ea-text-gold)] text-[var(--ea-text-gold)]'
                        : 'bg-[var(--ea-bg-deep)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)] hover:border-[var(--ea-border-gold)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">lightbulb</span>
                    <span>{showHint ? 'Masquer l’indice' : 'Indice & Règle'}</span>
                  </button>
                </div>

                {/* Reading Passage Box */}
                {currentQuestion.type === 'reading_passage' && currentQuestion.passageText && (
                  <div className="p-4 rounded-xl bg-[var(--ea-bg-deep)] border border-emerald-500/35 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-serif font-bold text-emerald-300">
                        {currentQuestion.passageTitle || 'Extrait d’Archive'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(currentQuestion.passageText || '')}
                        className="px-2 py-1 rounded-lg bg-[var(--ea-bg-elevated)] border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">volume_up</span>
                        <span>Écouter</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--ea-text-cream)] leading-relaxed font-serif italic">
                      « {currentQuestion.passageText} »
                    </p>
                  </div>
                )}

                {/* Audio Player Box for Listening Questions */}
                {currentQuestion.type === 'listening_audio' && currentQuestion.audioScript && (
                  <div className="p-4 rounded-xl bg-[var(--ea-bg-deep)] border border-teal-400/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(currentQuestion.audioScript || '', false)}
                          className="px-3.5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isPlayingAudio ? 'graphic_eq' : 'play_arrow'}
                          </span>
                          <span>{isPlayingAudio ? 'Lecture en cours...' : 'Écouter l’audio'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(currentQuestion.audioScript || '', true)}
                          className="px-2.5 py-2 rounded-xl bg-[var(--ea-bg-elevated)] hover:bg-[var(--ea-bg-interactive)] border border-teal-400/35 text-teal-200 font-mono font-bold text-[11px] cursor-pointer"
                        >
                          0.78× Lent
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-[var(--ea-bg-elevated)] p-1 rounded-lg border border-[var(--ea-border-subtle)]">
                        {(['en-GB', 'en-US'] as const).map((acc) => (
                          <button
                            key={acc}
                            type="button"
                            onClick={() => setAudioAccent(acc)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                              audioAccent === acc
                                ? 'bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)]'
                                : 'text-[var(--ea-text-cream-muted)]'
                            }`}
                          >
                            {acc === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {submittedState && (
                      <div className="p-2.5 rounded-lg bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] text-xs text-[var(--ea-text-cream-muted)] italic">
                        Transcription : « {currentQuestion.audioScript} »
                      </div>
                    )}
                  </div>
                )}

                <p className="font-serif text-base sm:text-lg font-bold text-[var(--ea-text-cream)] leading-snug">
                  {currentQuestion.promptEn}
                </p>

                {/* Adaptive Pedagogical Hint Drawer */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-[var(--ea-border)] text-xs space-y-1">
                        <div className="font-bold text-[var(--ea-text-gold)] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">school</span>
                          <span>Indice Pédagogique</span>
                        </div>
                        <p className="text-[var(--ea-text-cream)]">{currentQuestion.hintFr}</p>
                        {currentQuestion.grammarRule && (
                          <p className="text-[11px] font-mono text-[var(--ea-text-gold-soft)] pt-0.5">
                            Règle : {currentQuestion.grammarRule}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interactive Input Area by Question Type */}
              {(currentQuestion.type === 'multiple_choice' ||
                currentQuestion.type === 'listening_audio' ||
                currentQuestion.type === 'reading_passage') &&
                currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const isPicked = selectedOption === idx;
                      const isCorrectOpt = currentQuestion.correctIndex === idx;
                      let styleCls =
                        'bg-[var(--ea-bg-card)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream)] hover:border-[var(--ea-border-gold)]';
                      if (submittedState) {
                        if (isCorrectOpt) {
                          styleCls = 'bg-emerald-950/45 border-emerald-400 text-emerald-200 font-bold';
                        } else if (isPicked && !isCorrectOpt) {
                          styleCls = 'bg-rose-950/45 border-rose-400 text-rose-200';
                        } else {
                          styleCls = 'bg-[var(--ea-bg-card)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)] opacity-90';
                        }
                      } else if (isPicked) {
                        styleCls = 'bg-[var(--ea-bg-interactive)] border-[var(--ea-text-gold)] text-[var(--ea-text-gold)] font-bold shadow-md';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={Boolean(submittedState)}
                          onClick={() => {
                            playSelectCue();
                            setSelectedOption(idx);
                          }}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${styleCls}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-[var(--ea-bg-deep)] border border-current/30 flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </div>
                          {submittedState && isCorrectOpt && (
                            <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">
                              check_circle
                            </span>
                          )}
                          {submittedState && isPicked && !isCorrectOpt && (
                            <span className="material-symbols-outlined text-rose-400 text-lg shrink-0">
                              cancel
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* Pair Match Mini-Game */}
              {currentQuestion.type === 'pair_match' && currentQuestion.pairs && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-mono text-[var(--ea-text-gold-soft)]">
                    Sélectionnez un élément à gauche, puis son correspondant à droite :
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      {currentQuestion.pairs.map((p, idx) => {
                        const isSelected = selectedLeftPairId === p.id;
                        const mappedRightId = matchedPairsMap[p.id];
                        const isCorrectPair = submittedState && mappedRightId === p.id;
                        const isWrongPair = submittedState && mappedRightId !== p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={Boolean(submittedState)}
                            onClick={() => handleLeftPairClick(p.id)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isCorrectPair
                                ? 'bg-emerald-950/45 border-emerald-400 text-emerald-200'
                                : isWrongPair
                                ? 'bg-rose-950/45 border-rose-400 text-rose-200'
                                : isSelected
                                ? 'bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] border-[var(--ea-text-gold-bright)]'
                                : mappedRightId
                                ? 'bg-[var(--ea-bg-interactive)] border-[var(--ea-border-gold)] text-[var(--ea-text-cream)]'
                                : 'bg-[var(--ea-bg-card)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream)] hover:border-[var(--ea-border-gold)]'
                            }`}
                          >
                            <span className="truncate">{p.left}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[var(--ea-bg-deep)] text-[var(--ea-text-gold)] font-mono text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      {shuffledRightPairs.map((rp) => {
                        const pairedLeftIdx = currentQuestion.pairs!.findIndex(
                          (lp) => matchedPairsMap[lp.id] === rp.id
                        );
                        const isPaired = pairedLeftIdx >= 0;
                        const pairedLeftId = isPaired ? currentQuestion.pairs![pairedLeftIdx].id : null;
                        const isCorrectPair = submittedState && pairedLeftId === rp.id;
                        const isWrongPair = submittedState && isPaired && pairedLeftId !== rp.id;
                        return (
                          <button
                            key={rp.id}
                            type="button"
                            disabled={Boolean(submittedState) || !selectedLeftPairId}
                            onClick={() => handleRightPairClick(rp.id)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isCorrectPair
                                ? 'bg-emerald-950/45 border-emerald-400 text-emerald-200'
                                : isWrongPair
                                ? 'bg-rose-950/45 border-rose-400 text-rose-200'
                                : isPaired
                                ? 'bg-[var(--ea-bg-interactive)] border-[var(--ea-border-gold)] text-[var(--ea-text-cream)]'
                                : selectedLeftPairId
                                ? 'bg-[var(--ea-bg-elevated)] border-[var(--ea-border)] text-[var(--ea-text-cream)] hover:bg-[var(--ea-bg-interactive)]'
                                : 'bg-[var(--ea-bg-card)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)]'
                            }`}
                          >
                            <span className="truncate">{rp.right}</span>
                            {isPaired && (
                              <span className="px-1.5 py-0.5 rounded bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] font-mono font-bold text-[10px] shrink-0">
                                {pairedLeftIdx + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Sentence Build Mini-Game */}
              {currentQuestion.type === 'sentence_build' && (
                <div className="space-y-3">
                  <div className="min-h-[56px] p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border)] flex flex-wrap gap-2 items-center">
                    {builtTokenIndices.length === 0 ? (
                      <span className="text-xs text-[var(--ea-text-cream-muted)] italic">
                        Cliquez sur les segments ci-dessous dans l’ordre exact…
                      </span>
                    ) : (
                      builtTokenIndices.map((sIdx, pos) => (
                        <button
                          key={`${sIdx}-${pos}`}
                          type="button"
                          disabled={Boolean(submittedState)}
                          onClick={() => {
                            playSelectCue();
                            setBuiltTokenIndices((prev) => prev.filter((_, i) => i !== pos));
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] font-bold text-xs shadow cursor-pointer"
                        >
                          {shuffledSentenceTokens[sIdx]?.tok}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {shuffledSentenceTokens.map((item, sIdx) => {
                      const alreadyPlaced = builtTokenIndices.includes(sIdx);
                      return (
                        <button
                          key={`${item.idx}-${sIdx}`}
                          type="button"
                          disabled={alreadyPlaced || Boolean(submittedState)}
                          onClick={() => {
                            playSelectCue();
                            setBuiltTokenIndices((prev) => [...prev, sIdx]);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            alreadyPlaced
                              ? 'bg-[var(--ea-bg-deep)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)] opacity-60'
                              : 'bg-[var(--ea-bg-elevated)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream)] hover:border-[var(--ea-text-gold)]'
                          }`}
                        >
                          {item.tok}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Speaking Prompt (Voice Recognition + Text Fallback) */}
              {currentQuestion.type === 'speaking_prompt' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[var(--ea-bg-deep)] border border-orange-400/40 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-orange-300 font-bold block">
                        Modèle de référence à écouter / répéter
                      </span>
                      <span className="text-xs sm:text-sm font-serif italic text-[var(--ea-text-cream)]">
                        « {currentQuestion.targetSpeechPhrase} »
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(currentQuestion.targetSpeechPhrase || '')}
                      className="px-3 py-1.5 rounded-lg bg-orange-400/20 border border-orange-400/45 text-orange-200 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">volume_up</span>
                      <span>Écouter</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={!micSupported || Boolean(submittedState)}
                      onClick={handleStartSpeechRecognition}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border cursor-pointer transition-all ${
                        !micSupported
                          ? 'bg-[var(--ea-bg-elevated)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)] opacity-75 cursor-not-allowed'
                          : isListeningMic
                          ? `bg-rose-500 text-white border-rose-400 ${shouldReduceMotion ? '' : 'animate-pulse'}`
                          : 'bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] border-[var(--ea-text-gold-bright)]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isListeningMic ? 'stop_circle' : 'mic'}
                      </span>
                      <span>
                        {isListeningMic
                          ? 'Arrêter l’écoute'
                          : micSupported
                          ? 'Parler en anglais (Micro)'
                          : 'Micro indisponible (mode texte)'}
                      </span>
                    </button>
                    {currentQuestion.acceptedSpeechKeywords && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {currentQuestion.acceptedSpeechKeywords.map((kw) => {
                          const hit = normalizeTextForCompare(textInput).includes(kw.toLowerCase());
                          return (
                            <span
                              key={kw}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                                hit
                                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 font-bold'
                                  : 'bg-[var(--ea-bg-deep)] border-[var(--ea-border-subtle)] text-[var(--ea-text-gold-soft)]'
                              }`}
                            >
                              {hit ? '✓ ' : ''}
                              {kw}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {micError && <p className="text-[11px] text-amber-300">{micError}</p>}

                  <textarea
                    rows={3}
                    value={textInput}
                    disabled={Boolean(submittedState)}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Parlez au microphone ou rédigez votre réponse orale en anglais ici…"
                    className="w-full p-3 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)] focus:border-[var(--ea-text-gold)] text-xs sm:text-sm text-[var(--ea-text-cream)] placeholder:text-[#d0c5af]/75 focus:outline-none"
                  />
                </div>
              )}

              {/* Writing Prompt */}
              {currentQuestion.type === 'writing_prompt' && (
                <div className="space-y-3">
                  {(() => {
                    const currentWords = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
                    const minWords = currentQuestion.writingMinWords || 12;
                    const pctWords = Math.min(100, Math.round((currentWords / minWords) * 100));
                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                          <span className="text-[var(--ea-text-gold-soft)]">
                            Longueur :{' '}
                            <strong className={currentWords >= minWords ? 'text-emerald-300' : 'text-[var(--ea-text-gold)]'}>
                              {currentWords}
                            </strong>{' '}
                            / {minWords} mots min.
                          </span>
                          {currentQuestion.writingRequiredKeywords && (
                            <div className="flex flex-wrap gap-1.5">
                              {currentQuestion.writingRequiredKeywords.map((kw) => {
                                const hit = textInput.toLowerCase().includes(kw.toLowerCase());
                                return (
                                  <span
                                    key={kw}
                                    className={`px-2 py-0.5 rounded text-[11px] border ${
                                      hit
                                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 font-bold'
                                        : 'bg-[var(--ea-bg-deep)] border-[var(--ea-border-subtle)] text-[var(--ea-text-gold-soft)]'
                                    }`}
                                  >
                                    {hit ? '✓ ' : ''}
                                    {kw}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="w-full h-1 rounded-full bg-[var(--ea-bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${pctWords}%`,
                              backgroundColor: currentWords >= minWords ? '#34d399' : '#f2ca50'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <textarea
                    rows={4}
                    value={textInput}
                    disabled={Boolean(submittedState)}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Rédigez votre paragraphe structuré en anglais ici…"
                    className="w-full p-3.5 rounded-xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)] focus:border-[var(--ea-text-gold)] text-xs sm:text-sm text-[var(--ea-text-cream)] placeholder:text-[#d0c5af]/75 focus:outline-none"
                  />
                </div>
              )}

              {/* Immediate Educational Feedback Panel */}
              {submittedState && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border space-y-2 ${
                    submittedState.isCorrect
                      ? 'bg-emerald-950/35 border-emerald-400/50'
                      : 'bg-rose-950/35 border-rose-400/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        submittedState.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {submittedState.isCorrect ? 'check_circle' : 'error_outline'}
                    </span>
                    <span className={submittedState.isCorrect ? 'text-emerald-200' : 'text-rose-200'}>
                      {submittedState.feedbackDetail}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ea-text-cream)] leading-relaxed">
                    {currentQuestion.explanationFr}
                  </p>
                  {currentQuestion.writingModelAnswer && (
                    <div className="p-2.5 rounded-lg bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)] text-xs text-[var(--ea-text-gold-bright)] italic">
                      <strong>Modèle académique :</strong> « {currentQuestion.writingModelAnswer} »
                    </div>
                  )}
                </motion.div>
              )}

              {/* Footer Action */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {!submittedState ? (
                  <button
                    type="button"
                    disabled={!canValidate}
                    onClick={handleValidateCurrent}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      canValidate
                        ? 'bg-[var(--ea-text-gold)] hover:bg-[var(--ea-text-gold-bright)] text-[var(--ea-text-on-gold)] shadow-lg cursor-pointer'
                        : 'bg-[var(--ea-bg-elevated)] text-[var(--ea-text-cream-muted)] border border-[var(--ea-border-subtle)] cursor-not-allowed'
                    }`}
                  >
                    Valider ma Réponse
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingFinal}
                    onClick={handleNextOrFinish}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>
                      {isSubmittingFinal
                        ? 'Validation Firestore...'
                        : currentIdx + 1 < questions.length
                        ? 'Question Suivante'
                        : 'Clôturer la Mission'}
                    </span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
