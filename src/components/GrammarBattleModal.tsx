import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { CEFRLevel, SchoolGrade } from '../firebase/types';
import {
  GRAMMAR_BATTLE_QUESTIONS,
  type GrammarBattleQuestion
} from '../data/ecosystemChallengesData';
import { recordAttempt } from '../firebase/client';
import { awardMszCoins } from '../utils/mszCoinsManager';
import { speakText, stopSpeech } from '../services/speechService';
import { playCorrectCue, playIncorrectCue, playVictoryCue } from '../utils/soundEffects';
import {
  isSpeechRecognitionAvailable,
  SpeechRecognitionController
} from '../utils/speechRecognitionHelper';
import {
  evaluateGrammarBattleVoice,
  buildTargetGrammarSentence,
  type GrammarBattleVoiceEvaluation
} from '../utils/grammarBattleVoiceEngine';
import {
  playAutomatedVocalFeedback,
  type VocalFeedbackPhase,
  type VocalFeedbackPlaybackMode
} from '../utils/phonemeFeedbackEngine';
import { selectSkillsForTask, type LoadedContextSkillEntry } from '../services/skillsService';
import { PhonemeVocalFeedbackPanel } from './PhonemeVocalFeedbackPanel';
import battleShieldImg from '../assets/images/grammar_battle_shield_1795303944784.jpg';

interface GrammarBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolGrade: SchoolGrade;
  cefrLevel: CEFRLevel;
  onXpEarned?: (xp: number) => void;
}

type TierKey = GrammarBattleQuestion['gradeTier'];

function mapGradeToTier(grade: SchoolGrade): TierKey {
  if (grade === '6e' || grade === '5e') return 'college_junior';
  if (grade === '4e' || grade === '3e') return 'college_senior';
  if (grade === '2nde' || grade === '1re') return 'lycee_seconde_premiere';
  return 'lycee_terminale';
}

const TIER_LABELS: Record<TierKey, string> = {
  college_junior: 'Collège 6e - 5e (A1)',
  college_senior: 'Collège 4e - 3e (A2/B1)',
  lycee_seconde_premiere: 'Lycée 2nde - 1re (B1/B2)',
  lycee_terminale: 'Terminale (C1/C2)'
};

export const GrammarBattleModal: React.FC<GrammarBattleModalProps> = ({
  isOpen,
  onClose,
  schoolGrade,
  cefrLevel,
  onXpEarned
}) => {
  const [tier, setTier] = useState<TierKey>(() => mapGradeToTier(schoolGrade));
  const [qIdx, setQIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [playerHearts, setPlayerHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [chosenOpt, setChosenOpt] = useState<number | null>(null);
  const [battleOver, setBattleOver] = useState<'none' | 'victory' | 'defeat'>('none');
  const [imgErr, setImgErr] = useState(false);

  // Voice-to-Text, Grammar Correction & Phonetic Analysis State
  const [voiceAccent, setVoiceAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceInterimText, setVoiceInterimText] = useState<string>('');
  const [voiceFinalText, setVoiceFinalText] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showManualSpeechInput, setShowManualSpeechInput] = useState<boolean>(false);
  const [manualSpeechDraft, setManualSpeechDraft] = useState<string>('');
  const [voiceEvaluation, setVoiceEvaluation] = useState<GrammarBattleVoiceEvaluation | null>(null);
  const [usedVoiceInDuel, setUsedVoiceInDuel] = useState<boolean>(false);

  // Real Skill Loader + Phoneme Automated Vocal Feedback State
  const [skillLoadedEntry, setSkillLoadedEntry] = useState<LoadedContextSkillEntry | null>(null);
  const [skillLoadState, setSkillLoadState] = useState<
    'loading' | 'loaded' | 'disabled' | 'unavailable'
  >('loading');
  const [skillLoadReason, setSkillLoadReason] = useState<string | undefined>(undefined);
  const [autoFeedbackEnabled, setAutoFeedbackEnabled] = useState<boolean>(false);
  const [vocalPlaybackMode, setVocalPlaybackMode] = useState<VocalFeedbackPlaybackMode>('full');
  const [vocalFeedbackPhase, setVocalFeedbackPhase] = useState<VocalFeedbackPhase>('idle');

  const speechRecRef = useRef<SpeechRecognitionController | null>(null);
  const vocalFeedbackCancelRef = useRef<(() => void) | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const voiceTranscriptLatestRef = useRef<{ finalText: string; interimText: string }>({
    finalText: '',
    interimText: ''
  });
  const submitGuardRef = useRef<boolean>(false);

  const questions = useMemo(
    () => GRAMMAR_BATTLE_QUESTIONS.filter((q) => q.gradeTier === tier),
    [tier]
  );

  const stopAutomatedVocalFeedback = useCallback(() => {
    if (vocalFeedbackCancelRef.current) {
      vocalFeedbackCancelRef.current();
      vocalFeedbackCancelRef.current = null;
    }
    setVocalFeedbackPhase('idle');
  }, []);

  const abortVoiceCapture = useCallback(() => {
    isListeningRef.current = false;
    setIsListeningVoice(false);
    if (speechRecRef.current) {
      speechRecRef.current.abort();
      speechRecRef.current = null;
    }
    setVoiceInterimText('');
    setVoiceFinalText('');
    voiceTranscriptLatestRef.current = { finalText: '', interimText: '' };
  }, []);

  const resetVoiceRoundState = useCallback(() => {
    abortVoiceCapture();
    stopAutomatedVocalFeedback();
    stopSpeech();
    setVoiceError(null);
    setVoiceEvaluation(null);
    setManualSpeechDraft('');
    submitGuardRef.current = false;
  }, [abortVoiceCapture, stopAutomatedVocalFeedback]);

  const resetBattle = useCallback(() => {
    resetVoiceRoundState();
    setQIdx(0);
    setBossHp(100);
    setPlayerHearts(3);
    setCombo(0);
    setCorrectCount(0);
    setChosenOpt(null);
    setBattleOver('none');
    setUsedVoiceInDuel(false);
  }, [resetVoiceRoundState]);

  // Check Web Speech capability and load real audio-music-intelligence skill metadata on mount
  useEffect(() => {
    const supported = isSpeechRecognitionAvailable();
    setSpeechSupported(supported);
    if (!supported) {
      setShowManualSpeechInput(true);
    }

    let cancelled = false;
    selectSkillsForTask(
      "Grammar Battle Voice-to-Text : reconnaissance vocale, analyse phonémique par phonèmes de référence et correction grammaticale",
      4
    )
      .then((res) => {
        if (cancelled) return;
        const loadedAudioSkill = res.context.loadedSkills.find(
          (s) => s.skillId === 'audio-music-intelligence' && s.loadStatus === 'loaded'
        );
        if (loadedAudioSkill) {
          setSkillLoadedEntry(loadedAudioSkill);
          setSkillLoadState('loaded');
          setSkillLoadReason(loadedAudioSkill.reason);
          return;
        }
        const disabledMatch = res.selection.excluded.find(
          (e) => e.id === 'audio-music-intelligence' && e.reason === 'disabled'
        );
        if (disabledMatch) {
          setSkillLoadedEntry(null);
          setSkillLoadState('disabled');
          setSkillLoadReason(
            'La compétence audio-music-intelligence est actuellement désactivée dans skills/index.json.'
          );
          return;
        }
        setSkillLoadedEntry(null);
        setSkillLoadState('unavailable');
      })
      .catch(() => {
        if (!cancelled) {
          setSkillLoadedEntry(null);
          setSkillLoadState('unavailable');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setTier(mapGradeToTier(schoolGrade));
  }, [schoolGrade]);

  useEffect(() => {
    resetBattle();
  }, [tier, resetBattle]);

  useEffect(() => {
    if (!isOpen) {
      abortVoiceCapture();
      stopAutomatedVocalFeedback();
      stopSpeech();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, abortVoiceCapture, stopAutomatedVocalFeedback]);

  useEffect(() => {
    return () => {
      abortVoiceCapture();
      stopAutomatedVocalFeedback();
      stopSpeech();
    };
  }, [abortVoiceCapture, stopAutomatedVocalFeedback]);

  if (!isOpen) return null;

  const currentQ = questions[qIdx];

  const handlePlayVocalFeedback = (
    evalTarget: GrammarBattleVoiceEvaluation | null,
    modeOverride?: VocalFeedbackPlaybackMode
  ) => {
    if (!evalTarget?.phonemeEvaluation) return;
    stopAutomatedVocalFeedback();
    const cancel = playAutomatedVocalFeedback(evalTarget.phonemeEvaluation.vocalFeedbackPlan, {
      mode: modeOverride ?? vocalPlaybackMode,
      onPhaseChange: (phase) => setVocalFeedbackPhase(phase),
      onComplete: () => {
        vocalFeedbackCancelRef.current = null;
        setVocalFeedbackPhase('idle');
      },
      onError: () => {
        vocalFeedbackCancelRef.current = null;
        setVocalFeedbackPhase('idle');
      }
    });
    vocalFeedbackCancelRef.current = cancel;
  };

  const handleAnswer = async (optIdx: number, viaVoice = false) => {
    if (chosenOpt !== null || battleOver !== 'none' || !currentQ) return;
    setChosenOpt(optIdx);

    const usedVoiceTotal = usedVoiceInDuel || viaVoice;
    if (viaVoice) {
      setUsedVoiceInDuel(true);
    }

    const isRight = optIdx === currentQ.correctIndex;
    let nextBossHp = bossHp;
    let nextHearts = playerHearts;
    let nextCorrect = correctCount;

    if (isRight) {
      playCorrectCue();
      nextCorrect += 1;
      setCorrectCount(nextCorrect);
      setCombo((c) => c + 1);
      nextBossHp = Math.max(0, bossHp - Math.ceil(100 / questions.length));
      setBossHp(nextBossHp);
    } else {
      playIncorrectCue();
      setCombo(0);
      nextHearts = Math.max(0, playerHearts - 1);
      setPlayerHearts(nextHearts);
    }

    const titleSuffix = usedVoiceTotal ? ' • Voice-to-Text' : '';

    if (nextHearts === 0) {
      setBattleOver('defeat');
      const score = Math.round((nextCorrect / questions.length) * 100);
      await recordAttempt({
        moduleId: `grammar-battle-${tier}`,
        moduleType: 'grammar_battle',
        title: `Grammar Battle (${TIER_LABELS[tier]})${titleSuffix}`,
        level: currentQ.cefrLevel || cefrLevel,
        score,
        durationSeconds: 75
      });
    } else if (qIdx + 1 >= questions.length || nextBossHp === 0) {
      setBattleOver('victory');
      playVictoryCue();
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#f2ca50', '#ffe088', '#38bdf8']
        });
      } catch {
        // ignore
      }
      const score = Math.max(60, Math.round((nextCorrect / questions.length) * 100));
      awardMszCoins(
        'quiz',
        `grammar-battle-${tier}`,
        10,
        50,
        `Grammar Battle : ${TIER_LABELS[tier]}`
      );
      await recordAttempt({
        moduleId: `grammar-battle-${tier}`,
        moduleType: 'grammar_battle',
        title: `Grammar Battle (${TIER_LABELS[tier]})${titleSuffix}`,
        level: currentQ.cefrLevel || cefrLevel,
        score,
        durationSeconds: 90
      });
      onXpEarned?.(score >= 85 ? 60 : 40);
    }
  };

  const evaluateTranscriptForCurrentRound = (rawTranscript: string) => {
    if (!currentQ) return;
    const evaluation = evaluateGrammarBattleVoice(rawTranscript, currentQ, voiceAccent);
    setVoiceEvaluation(evaluation);

    if (evaluation.status === 'silent') {
      setVoiceError(evaluation.grammarFeedbackFr);
      return;
    }

    setVoiceError(null);
    if (evaluation.matchedOptionIndex !== null && chosenOpt === null) {
      void handleAnswer(evaluation.matchedOptionIndex, true);
    }

    if (
      autoFeedbackEnabled &&
      skillLoadState !== 'disabled' &&
      evaluation.phonemeEvaluation?.vocalFeedbackPlan
    ) {
      setTimeout(() => {
        handlePlayVocalFeedback(evaluation);
      }, 420);
    }
  };

  const handleStartVoiceCapture = () => {
    if (!currentQ || chosenOpt !== null || battleOver !== 'none') return;

    stopSpeech();
    stopAutomatedVocalFeedback();
    setVoiceError(null);
    setVoiceEvaluation(null);
    setVoiceInterimText('');
    setVoiceFinalText('');
    voiceTranscriptLatestRef.current = { finalText: '', interimText: '' };
    submitGuardRef.current = false;

    if (!isSpeechRecognitionAvailable()) {
      setSpeechSupported(false);
      setShowManualSpeechInput(true);
      setVoiceError(
        'La reconnaissance vocale native Web Speech n’est pas disponible sur ce navigateur. Utilisez la saisie vocale manuelle ci-dessous pour analyser votre phrase.'
      );
      return;
    }

    try {
      const recognizer = new SpeechRecognitionController(voiceAccent);
      speechRecRef.current = recognizer;

      recognizer.onTranscriptChange = (finalText, interimText) => {
        setVoiceFinalText(finalText);
        setVoiceInterimText(interimText);
        voiceTranscriptLatestRef.current = { finalText, interimText };
      };

      recognizer.onStatusChange = (status, errMsg) => {
        if (status === 'listening') {
          isListeningRef.current = true;
          setIsListeningVoice(true);
        } else if (status === 'error') {
          isListeningRef.current = false;
          setIsListeningVoice(false);
          if (errMsg) {
            setVoiceError(errMsg);
          }
          if (errMsg && errMsg.toLowerCase().includes('refusée')) {
            setShowManualSpeechInput(true);
          }
        } else if (status === 'stopped') {
          const wasListening = isListeningRef.current;
          isListeningRef.current = false;
          setIsListeningVoice(false);
          if (wasListening && !submitGuardRef.current) {
            submitGuardRef.current = true;
            const latest = voiceTranscriptLatestRef.current;
            const combined = (latest.finalText + ' ' + latest.interimText).trim();
            if (combined) {
              evaluateTranscriptForCurrentRound(combined);
            } else {
              evaluateTranscriptForCurrentRound('');
            }
          }
        }
      };

      recognizer.start();
    } catch {
      isListeningRef.current = false;
      setIsListeningVoice(false);
      setVoiceError('Impossible de démarrer la capture vocale. Vérifiez les permissions du microphone.');
      setShowManualSpeechInput(true);
    }
  };

  const handleStopAndAnalyzeVoice = () => {
    if (!isListeningRef.current && !isListeningVoice) return;
    submitGuardRef.current = true;
    isListeningRef.current = false;
    setIsListeningVoice(false);

    let captured = '';
    if (speechRecRef.current) {
      captured = speechRecRef.current.stop();
      speechRecRef.current = null;
    }
    const latest = voiceTranscriptLatestRef.current;
    const finalSpoken = (captured || `${latest.finalText} ${latest.interimText}`).trim();
    evaluateTranscriptForCurrentRound(finalSpoken);
  };

  const handleSubmitManualSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQ || chosenOpt !== null || battleOver !== 'none') return;
    evaluateTranscriptForCurrentRound(manualSpeechDraft);
  };

  const handleNextRound = () => {
    if (qIdx + 1 < questions.length) {
      resetVoiceRoundState();
      setQIdx((i) => i + 1);
      setChosenOpt(null);
    }
  };

  const liveTranscriptPreview = `${voiceFinalText} ${voiceInterimText}`.trim();

  const renderVoiceFeedbackSection = (
    evaluation: GrammarBattleVoiceEvaluation,
    question: GrammarBattleQuestion
  ) => {
    const statusBadge =
      evaluation.status === 'correct'
        ? {
            box: 'bg-emerald-950/45 border-emerald-400/50 text-emerald-100',
            badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
            icon: 'check_circle',
            label: 'Syntaxe & Choix Corrects'
          }
        : evaluation.status === 'wrong_option'
        ? {
            box: 'bg-rose-950/45 border-rose-400/50 text-rose-100',
            badge: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
            icon: 'cancel',
            label: 'Correction Grammaticale Requise'
          }
        : evaluation.status === 'incomplete_or_unrecognized'
        ? {
            box: 'bg-amber-950/40 border-amber-400/50 text-amber-100',
            badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
            icon: 'help',
            label: 'Énoncé Non Reconnu — Réessayez'
          }
        : {
            box: 'bg-slate-900/80 border-slate-500/50 text-slate-200',
            badge: 'bg-slate-700/60 text-slate-200 border-slate-400/40',
            icon: 'mic_off',
            label: 'Aucune Parole Captée'
          };

    return (
      <div className="space-y-4 animate-fadeIn">
        {/* 1. Immediate Grammar Correction Diagnostic */}
        <section
          aria-label="Correction grammaticale immédiate"
          className={`p-4 rounded-2xl border ${statusBadge.box} space-y-3`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${statusBadge.badge}`}
              >
                <span className="material-symbols-outlined text-sm">{statusBadge.icon}</span>
                <span>{statusBadge.label}</span>
              </span>
              {evaluation.utteranceScope !== 'silent' && (
                <span className="text-[11px] font-mono text-[#d0c5af]">
                  Mode :{' '}
                  {evaluation.utteranceScope === 'full_sentence'
                    ? 'Phrase complète'
                    : 'Élément ciblé'}{' '}
                  • Correspondance {Math.round(evaluation.confidence * 100)}%
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                speakText(
                  buildTargetGrammarSentence(question),
                  voiceAccent,
                  `gb-model-${question.id}-${voiceAccent}`
                )
              }
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#f2ca50]/15 hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#2c2000] border border-[#f2ca50]/40 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-sm">volume_up</span>
              <span>Écouter la phrase attendue</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            {evaluation.grammarFeedbackFr}
          </p>

          {evaluation.rawTranscript && (
            <div className="grid grid-cols-1 gap-2.5 bg-[#070e1d]/85 p-3.5 rounded-xl border border-white/10">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] block">
                  Transcription vocale captée &amp; alignement grammatical :
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {evaluation.grammarDiffTokens.map((tok) => {
                    const tokenStyle =
                      tok.kind === 'match'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                        : tok.kind === 'missing'
                        ? 'bg-amber-500/15 text-amber-200 border-amber-400/40 border-dashed'
                        : tok.kind === 'extra'
                        ? 'bg-purple-500/15 text-purple-200 border-purple-400/40'
                        : 'bg-rose-500/20 text-rose-200 border-rose-400/50';
                    const tokenIcon =
                      tok.kind === 'match'
                        ? 'check'
                        : tok.kind === 'missing'
                        ? 'warning'
                        : tok.kind === 'extra'
                        ? 'add'
                        : 'close';
                    return (
                      <span
                        key={tok.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-mono ${tokenStyle}`}
                        title={
                          tok.kind === 'missing'
                            ? `Attendu : ${tok.expected || tok.text}`
                            : tok.kind === 'grammar_error' && tok.expected
                            ? `Dit : ${tok.text} • Attendu : ${tok.expected}`
                            : undefined
                        }
                      >
                        <span className="material-symbols-outlined text-[12px]">{tokenIcon}</span>
                        <span>{tok.text}</span>
                        {tok.kind === 'grammar_error' && tok.expected && (
                          <span className="text-[10px] text-emerald-300">→ {tok.expected}</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#f2ca50] shrink-0">
                  Cible correcte :
                </span>
                <span className="font-serif text-sm text-white font-semibold">
                  « {evaluation.expectedSentence} »
                </span>
              </div>
            </div>
          )}

          {evaluation.status === 'incomplete_or_unrecognized' && (
            <p className="text-xs text-[#ffe082]">
              {evaluation.correctionHintFr} Vous pouvez relancer le microphone ou cliquer sur une option.
            </p>
          )}
        </section>

        {/* 2. Immediate Phoneme Analysis & Automated Vocal Feedback */}
        {evaluation.phonemeEvaluation && (
          <PhonemeVocalFeedbackPanel
            evaluation={evaluation.phonemeEvaluation}
            targetAccent={voiceAccent}
            skillLoadedEntry={skillLoadedEntry}
            skillLoadState={skillLoadState}
            skillLoadReason={skillLoadReason}
            autoFeedbackEnabled={autoFeedbackEnabled}
            onToggleAutoFeedback={setAutoFeedbackEnabled}
            playbackMode={vocalPlaybackMode}
            onChangePlaybackMode={setVocalPlaybackMode}
            activePhase={vocalFeedbackPhase}
            onPlayFeedback={(modeOverride) => handlePlayVocalFeedback(evaluation, modeOverride)}
            onStopFeedback={stopAutomatedVocalFeedback}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Grammar Battle"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#151b2b] via-[#191f2f] to-[#0c1322] border-b border-[#4d4635]/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#f2ca50]/55 bg-[#070e1d] shrink-0">
              {!imgErr ? (
                <img
                  src={battleShieldImg}
                  alt="Blason Grammar Battle"
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                ARÈNE SYNTAXIQUE • DUEL VOCAL &amp; ÉCRIT
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8]">
                Grammar Battle Arena
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer Grammar Battle"
            className="w-10 h-10 rounded-full bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#f2ca50]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tier Selector */}
        <div className="px-4 py-2.5 bg-[#151b2b] border-b border-[#232a3a] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {(Object.keys(TIER_LABELS) as TierKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTier(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                tier === key
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'bg-[#191f2f] text-[#d0c5af] border border-[#2e3545] hover:border-[#f2ca50]/45'
              }`}
            >
              {TIER_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Arena Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Combat HUD */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#151b2b] border border-[#232a3a]">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#dce2f8] font-bold">Vos Vies</span>
                <span className="text-rose-400 font-bold" aria-label={`${playerHearts} vies restantes`}>
                  {'♥ '.repeat(playerHearts) || '0'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#f2ca50]">
                Combo : x{Math.max(1, combo)} • Question {Math.min(qIdx + 1, questions.length)}/{questions.length}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#d0c5af]">Bouclier du Gardien</span>
                <span className="text-[#f2ca50] font-bold tabular-nums">{bossHp}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#070e1d] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] transition-all duration-300"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          </div>

          {battleOver !== 'none' ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#070e1d] border border-[#f2ca50]/60 text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-[#f2ca50]">
                  {battleOver === 'victory' ? 'military_tech' : 'refresh'}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#dce2f8]">
                  {battleOver === 'victory'
                    ? 'Gardien Vaincu — Précision Exemplaire !'
                    : 'Bouclier Brisé — Nouvelle Tentative'}
                </h3>
                <p className="text-xs sm:text-sm text-[#d0c5af]">
                  Bonnes réponses :{' '}
                  <strong className="text-[#f2ca50] font-mono">
                    {correctCount}/{questions.length}
                  </strong>
                  .
                  {battleOver === 'victory' && ' (+40 à +60 XP et +30 MSZ Coins attribués !)'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetBattle}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold cursor-pointer"
                  >
                    Rejouer l’Arène
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#232a3a] text-[#dce2f8] text-xs font-bold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {voiceEvaluation && currentQ && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#d4c78f]">
                    Bilan vocal &amp; phonétique du dernier tour
                  </div>
                  {renderVoiceFeedbackSection(voiceEvaluation, currentQ)}
                </div>
              )}
            </div>
          ) : currentQ ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/35 space-y-4">
              {/* Question Topic & Listen Button */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-[#070e1d] border border-[#f2ca50]/40 text-[11px] font-mono font-bold text-[#f2ca50]">
                  {currentQ.grammarTopic} • {currentQ.cefrLevel}
                </span>

                <div className="flex items-center gap-2">
                  <div
                    className="inline-flex items-center rounded-lg bg-[#070e1d] border border-[#2e3545] p-0.5 text-[11px] font-mono"
                    role="group"
                    aria-label="Choix de l'accent anglais"
                  >
                    <button
                      type="button"
                      disabled={isListeningVoice}
                      onClick={() => setVoiceAccent('en-GB')}
                      className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                        voiceAccent === 'en-GB'
                          ? 'bg-[#f2ca50] text-[#2c2000] font-bold'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      🇬🇧 UK
                    </button>
                    <button
                      type="button"
                      disabled={isListeningVoice}
                      onClick={() => setVoiceAccent('en-US')}
                      className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                        voiceAccent === 'en-US'
                          ? 'bg-[#38bdf8] text-[#081226] font-bold'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      🇺🇸 US
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        buildTargetGrammarSentence(currentQ),
                        voiceAccent,
                        `${currentQ.id}-${voiceAccent}`
                      )
                    }
                    className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#070e1d] border border-[#2e3545] hover:border-[#f2ca50]/50 text-xs font-mono text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                    title="Écouter le modèle grammatical en anglais"
                  >
                    <span className="material-symbols-outlined text-sm">volume_up</span>
                    <span>Modèle</span>
                  </button>
                </div>
              </div>

              {/* Prompt Sentence */}
              <p className="font-serif text-lg sm:text-xl text-[#dce2f8] leading-relaxed">
                {currentQ.promptEn}
              </p>

              {/* Voice-to-Text Interactive Studio Bar */}
              <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#2e3545] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#f2ca50]">
                        mic
                      </span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                        Réponse Vocale (Voice-to-Text)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94a3b8]">
                      Prononcez la phrase complète ou l’expression manquante pour obtenir une analyse phonétique et syntaxique immédiate.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {chosenOpt === null && (
                      <button
                        type="button"
                        onClick={isListeningVoice ? handleStopAndAnalyzeVoice : handleStartVoiceCapture}
                        className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                          isListeningVoice
                            ? 'bg-rose-500 hover:bg-rose-400 text-white'
                            : 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#2c2000]'
                        }`}
                        aria-label={
                          isListeningVoice
                            ? 'Arrêter la dictée et analyser ma réponse'
                            : 'Parler ma réponse au microphone'
                        }
                      >
                        <span className="material-symbols-outlined text-base">
                          {isListeningVoice ? 'stop_circle' : 'mic'}
                        </span>
                        <span>
                          {isListeningVoice ? 'Arrêter & Analyser' : 'Parler ma réponse'}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={chosenOpt !== null}
                      onClick={() => setShowManualSpeechInput((v) => !v)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[#151b2b] hover:bg-[#1e273d] border border-[#2e3545] text-[#d0c5af] text-[11px] font-mono inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
                      title="Saisir ou tester un énoncé sans microphone"
                    >
                      <span className="material-symbols-outlined text-sm">keyboard</span>
                      <span>{showManualSpeechInput ? 'Masquer saisie' : 'Mode texte'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Listening Stream */}
                {isListeningVoice && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3 rounded-lg bg-[#070e1d] border border-[#f2ca50]/45 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#f2ca50]">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Microphone actif ({voiceAccent === 'en-GB' ? 'British English' : 'American English'}) — parlez distinctement…</span>
                    </div>
                    <p className="text-sm font-mono text-[#dce2f8] min-h-[20px]">
                      {liveTranscriptPreview || 'En attente de votre voix…'}
                    </p>
                  </div>
                )}

                {/* Manual Speech Simulation / Fallback Input */}
                {showManualSpeechInput && chosenOpt === null && (
                  <form onSubmit={handleSubmitManualSpeech} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={manualSpeechDraft}
                      onChange={(e) => setManualSpeechDraft(e.target.value)}
                      placeholder={`Ex : ${buildTargetGrammarSentence(currentQ)}`}
                      aria-label="Saisir votre phrase ou réponse orale en anglais"
                      className="flex-1 min-h-[42px] px-3 py-2 rounded-lg bg-[#070e1d] border border-[#2e3545] focus:border-[#f2ca50] focus:outline-none text-xs sm:text-sm text-[#dce2f8] placeholder:text-[#64748b]"
                    />
                    <button
                      type="submit"
                      disabled={!manualSpeechDraft.trim()}
                      className="min-h-[42px] px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-45 text-[#081226] text-xs font-mono font-bold cursor-pointer shrink-0"
                    >
                      Analyser l’énoncé
                    </button>
                  </form>
                )}

                {!speechSupported && !voiceError && (
                  <p className="text-[11px] font-mono text-amber-300">
                    Reconnaissance vocale navigateur indisponible — saisie manuelle activée pour l’analyse grammaticale et phonémique.
                  </p>
                )}

                {voiceError && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-400/40 text-xs text-amber-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-300 shrink-0 mt-0.5">
                      warning
                    </span>
                    <span>{voiceError}</span>
                  </div>
                )}
              </div>

              {/* 4 Clickable Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt, idx) => {
                  const answered = chosenOpt !== null;
                  const isCorrectOpt = answered && idx === currentQ.correctIndex;
                  const isWrongOpt = answered && chosenOpt === idx && idx !== currentQ.correctIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered || isListeningVoice}
                      onClick={() => handleAnswer(idx, false)}
                      className={`min-h-[48px] p-3.5 rounded-xl text-left text-sm font-semibold border transition-all cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                        isCorrectOpt
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                          : isWrongOpt
                          ? 'bg-rose-950/60 border-rose-400 text-rose-200'
                          : 'bg-[#0c1322] hover:bg-[#191f2f] border-[#2e3545] hover:border-[#f2ca50]/60 text-[#dce2f8]'
                      }`}
                    >
                      <span>{opt}</span>
                      {isCorrectOpt && (
                        <span className="material-symbols-outlined text-base text-emerald-300">
                          check_circle
                        </span>
                      )}
                      {isWrongOpt && (
                        <span className="material-symbols-outlined text-base text-rose-300">
                          cancel
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Voice Grammar Correction & Phonetic Analysis */}
              {voiceEvaluation && renderVoiceFeedbackSection(voiceEvaluation, currentQ)}

              {/* Standard Rule Explanation & Next Round Button */}
              {chosenOpt !== null && battleOver === 'none' && (
                <div className="p-3.5 rounded-xl bg-[#070e1d] border border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#d0c5af] leading-relaxed">
                    <strong className="text-[#f2ca50]">Règle :</strong> {currentQ.explanationFr}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Attaque Suivante →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
