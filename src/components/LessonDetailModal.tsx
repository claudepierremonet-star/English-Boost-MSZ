import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { SchoolLesson, SchoolVocabularyItem } from '../data/schoolCurriculum';
import { shuffleArray, shuffleSchoolQuizQuestions } from '../data/curriculum';
import { GRAMMAR_6E_ITEMS } from '../data/grammar6eData';
import { SentenceStructuringExercise } from './SentenceStructuringExercise';
import confetti from 'canvas-confetti';
import { recordAttempt, getFavoriteLessonIds, toggleFavoriteLesson } from '../firebase/client';
import { DualSpeakerButton } from './DualSpeakerButton';
import { RhetoricalAnalyzerView } from './RhetoricalAnalyzerView';
import { awardMszCoins } from '../utils/mszCoinsManager';
import { playSelectCue, playCorrectCue, playIncorrectCue, playVictoryCue } from '../utils/soundEffects';
import { ChapterMasteryProgressBar } from './ChapterMasteryProgressBar';
import { completeSchoolLessonForCityProgress } from '../utils/cityMapManager';
import { LessonDictionaryProvider, useLessonDictionary } from './LessonDictionaryContext';
import { InteractiveHighlightText } from './InteractiveHighlightText';
import { normalizeSelectionQuery } from '../services/dictionaryService';
import {
  speakText as speakNaturalText,
  speakFrenchText,
  playDialogueSequence,
  stopSpeech,
  subscribeToSpeechState,
  type DialoguePlaybackTurn,
  type AccentType
} from '../services/speechService';

const LESSON_AUTO_AUDIO_STORAGE_KEY = 'eb_msz_lesson_auto_audio_v1';

function buildLessonDialogueTurns(
  lines: SchoolLesson['dialogue']['lines'],
  accent: AccentType,
  lessonId: string
): DialoguePlaybackTurn[] {
  const femPool =
    accent === 'en-GB'
      ? ['uk-fem-1', 'uk-fem-2', 'uk-fem-3']
      : ['us-fem-1', 'us-fem-2', 'us-fem-3'];
  const malePool =
    accent === 'en-GB'
      ? ['uk-male-1', 'uk-male-3', 'uk-male-2']
      : ['us-male-1', 'us-male-3', 'us-male-2'];
  const femHintRegex =
    /\b(audrey|emma|clara|sophie|chloe|sarah|alice|victoria|elena|marie|lucie|julia|olivia|hannah|grace|eva|a)\b/i;
  const maleHintRegex =
    /\b(arthur|julian|oliver|liam|lucas|noah|daniel|george|thomas|marc|antoine|leo|henri|gabriel|james|william|b)\b/i;

  const speakerPersonaMap = new Map<string, string>();
  let femCursor = 0;
  let maleCursor = 0;
  let altCursor = 0;

  return lines.map((line, idx) => {
    let personaId = speakerPersonaMap.get(line.speaker);
    if (!personaId) {
      const cleanSpeaker = line.speaker.replace(/[()]/g, ' ').trim();
      if (maleHintRegex.test(cleanSpeaker)) {
        personaId = malePool[maleCursor % malePool.length];
        maleCursor += 1;
      } else if (femHintRegex.test(cleanSpeaker)) {
        personaId = femPool[femCursor % femPool.length];
        femCursor += 1;
      } else {
        personaId =
          altCursor % 2 === 0
            ? femPool[femCursor++ % femPool.length]
            : malePool[maleCursor++ % malePool.length];
        altCursor += 1;
      }
      speakerPersonaMap.set(line.speaker, personaId);
    }

    return {
      id: `auto-dialogue-${lessonId}-${idx}`,
      en: line.en,
      fr: line.fr,
      personaId
    };
  });
}

interface LessonDetailModalProps {
  lesson: SchoolLesson | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteLesson?: (lessonId: string, xpEarned: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

type LessonTab = 'overview' | 'vocab' | 'grammar' | 'dialogue' | 'quiz' | 'dictation' | 'rhetoric';

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'OPTION']);

function isInsideInteractiveElement(node: Node | null): boolean {
  let curr: Node | null = node;
  while (curr) {
    if (curr instanceof HTMLElement) {
      if (INTERACTIVE_TAGS.has(curr.tagName) || curr.isContentEditable) {
        return true;
      }
    }
    curr = curr.parentNode;
  }
  return false;
}

const LessonSelectionBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dict = useLessonDictionary();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const inspectCurrentSelection = React.useCallback(() => {
    if (!dict || dict.shouldSuppressSelectionLookup() || !containerRef.current || typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const anchorNode = sel.anchorNode;
    const focusNode = sel.focusNode;
    if (
      !anchorNode ||
      !focusNode ||
      !containerRef.current.contains(anchorNode) ||
      !containerRef.current.contains(focusNode)
    ) {
      return;
    }

    if (isInsideInteractiveElement(anchorNode) || isInsideInteractiveElement(focusNode)) {
      return;
    }

    const cleaned = normalizeSelectionQuery(sel.toString());
    if (!cleaned || cleaned.length < 2 || cleaned.length > 90) return;
    if (!/[a-zA-Z]{2,}/.test(cleaned)) return;
    if (cleaned.split(/\s+/).length > 8) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return;

    dict.triggerWordLookup(cleaned, rect);
  }, [dict]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const onSelectionChange = () => {
      // Wait for touch selection handles to settle before opening floating modal
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!dict || dict.shouldSuppressSelectionLookup()) return;
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && containerRef.current && sel.anchorNode && containerRef.current.contains(sel.anchorNode)) {
          inspectCurrentSelection();
        }
      }, 520);
    };

    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [dict, inspectCurrentSelection]);

  return (
    <div
      ref={containerRef}
      onMouseUp={(e) => {
        if (e.detail >= 2 || dict?.shouldSuppressSelectionLookup()) return;
        setTimeout(inspectCurrentSelection, 20);
      }}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
    >
      {children}
    </div>
  );
};

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onCompleteLesson,
  isFavorite,
  onToggleFavorite
}) => {
  const [internalFavIds, setInternalFavIds] = useState<string[]>(() => getFavoriteLessonIds());
  useEffect(() => {
    const onFavUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<string[]>;
      if (Array.isArray(customEvt.detail)) {
        setInternalFavIds(customEvt.detail);
      } else {
        setInternalFavIds(getFavoriteLessonIds());
      }
    };
    window.addEventListener('eb_favorites_updated', onFavUpdate);
    return () => window.removeEventListener('eb_favorites_updated', onFavUpdate);
  }, []);

  const currentIsFavorite = lesson ? (isFavorite ?? internalFavIds.includes(lesson.id)) : false;
  const handleHeartClick = () => {
    if (!lesson) return;
    if (onToggleFavorite) {
      onToggleFavorite();
    } else {
      toggleFavoriteLesson(lesson.id).then((next) => setInternalFavIds(next));
    }
  };
  const [activeTab, setActiveTab] = useState<LessonTab>('overview');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [voiceAccent, setVoiceAccent] = useState<AccentType>('en-GB');
  const [isAutoAudioEnabled, setIsAutoAudioEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LESSON_AUTO_AUDIO_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [autoAudioStatusLabel, setAutoAudioStatusLabel] = useState<string | null>(null);
  const [activeOverviewPhraseIndex, setActiveOverviewPhraseIndex] = useState<number | null>(null);

  // Flashcard mode inside vocab tab
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Vocabulary search & filter state
  const [vocabSearchQuery, setVocabSearchQuery] = useState<string>('');
  const [vocabFilterType, setVocabFilterType] = useState<'all' | 'noun' | 'verb' | 'phrase'>('all');

  // Grammar 6e sentence structuring exercise index
  const [modalGrammarIndex, setModalGrammarIndex] = useState<number>(0);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizShuffleNonce, setQuizShuffleNonce] = useState<number>(1);

  // Dictation state
  const [userInputDictation, setUserInputDictation] = useState<string>('');
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [dictationScore, setDictationScore] = useState<number | null>(null);

  // Dialogue active playing line
  const [activeDialogueIndex, setActiveDialogueIndex] = useState<number | null>(null);

  // Audio session management refs
  const autoAudioCancelRef = useRef<(() => void) | null>(null);
  const autoAudioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioSessionTokenRef = useRef<number>(0);
  const speechRateRef = useRef<number>(speechRate);
  speechRateRef.current = speechRate;

  const cancelAllLessonAudio = useCallback(() => {
    audioSessionTokenRef.current += 1;
    if (autoAudioTimerRef.current) {
      clearTimeout(autoAudioTimerRef.current);
      autoAudioTimerRef.current = null;
    }
    if (autoAudioCancelRef.current) {
      const fn = autoAudioCancelRef.current;
      autoAudioCancelRef.current = null;
      try {
        fn();
      } catch {
        stopSpeech();
      }
    } else {
      stopSpeech();
    }
    setActiveDialogueIndex(null);
    setActiveOverviewPhraseIndex(null);
    setAutoAudioStatusLabel(null);
    setIsPlayingAudio(null);
  }, []);

  // Keep local active audio state synchronized with global natural TTS engine
  useEffect(() => {
    const unsubscribe = subscribeToSpeechState((curId) => {
      setIsPlayingAudio(curId);
      if (curId && !curId.startsWith('auto-') && curId !== 'summary-audio') {
        // User clicked a manual speaker button (DualSpeakerButton, etc.)
        setActiveDialogueIndex(null);
        setActiveOverviewPhraseIndex(null);
        setAutoAudioStatusLabel(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (lesson) {
      setActiveTab('overview');
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizShuffleNonce((n) => n + 1);
      setUserInputDictation('');
      setDictationChecked(false);
      setDictationScore(null);
      setFlashcardIndex(0);
      setVocabShuffleNonce(0);
      setIsFlipped(false);
      setActiveDialogueIndex(null);
      setActiveOverviewPhraseIndex(null);
      setAutoAudioStatusLabel(null);
      setVocabSearchQuery('');
      setVocabFilterType('all');

      if (lesson.class_level === '6e') {
        const themeMap: Record<string, number> = {
          daily_life: 0,
          travel: 19,
          history: 42,
          hobbies: 14,
          sport: 20,
          music: 15,
          restaurant: 22,
          food: 25,
          work: 9,
          school_social: 5
        };
        setModalGrammarIndex(themeMap[lesson.theme_id] ?? 0);
      }
    }
  }, [lesson]);

  // Hook called unconditionally before any early return
  const filteredVocab = useMemo(() => {
    if (!lesson?.vocabulary) return [];
    return lesson.vocabulary.filter((w) => {
      // Filter by type
      if (vocabFilterType === 'noun' && !w.part_of_speech.toLowerCase().includes('n')) return false;
      if (vocabFilterType === 'verb' && !w.part_of_speech.toLowerCase().includes('v')) return false;
      if (vocabFilterType === 'phrase' && !w.part_of_speech.toLowerCase().includes('phr') && !w.part_of_speech.toLowerCase().includes('exp')) return false;

      // Filter by search query
      if (vocabSearchQuery.trim()) {
        const q = vocabSearchQuery.toLowerCase();
        return (
          w.term.toLowerCase().includes(q) ||
          w.translation_fr.toLowerCase().includes(q) ||
          w.example_en.toLowerCase().includes(q) ||
          w.example_fr.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [lesson?.vocabulary, vocabFilterType, vocabSearchQuery]);

  // Randomize both quiz question order and each question's options per opening/retry via shared shuffleArray
  const randomizedQuiz = useMemo(() => {
    if (!lesson?.quiz?.length) return [];
    return shuffleSchoolQuizQuestions(lesson.quiz, lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, lesson?.quiz, quizShuffleNonce]);

  const [vocabShuffleNonce, setVocabShuffleNonce] = useState<number>(0);
  const flashcardDeck = useMemo(() => {
    if (!lesson?.vocabulary?.length) return [];
    if (vocabShuffleNonce === 0) return lesson.vocabulary;
    return shuffleArray(lesson.vocabulary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, lesson?.vocabulary, vocabShuffleNonce]);

  const playOverviewNarration = useCallback(
    (targetLesson: SchoolLesson, bilingualSummary: boolean) => {
      cancelAllLessonAudio();
      const mySession = audioSessionTokenRef.current;
      const rateMult = speechRateRef.current / 0.9;

      const startEnglishSequence = () => {
        if (audioSessionTokenRef.current !== mySession) return;
        const turns: DialoguePlaybackTurn[] = [
          {
            id: `auto-overview-title-${targetLesson.id}`,
            en: targetLesson.title_en
          },
          ...targetLesson.model_phrases.map((phrase, idx) => ({
            id: `auto-overview-phrase-${targetLesson.id}-${idx}`,
            en: phrase.en,
            fr: phrase.fr
          })),
          {
            id: `auto-overview-grammar-${targetLesson.id}`,
            en: targetLesson.grammar.example_en,
            fr: targetLesson.grammar.example_fr
          }
        ];

        const cancelSeq = playDialogueSequence(turns, voiceAccent, {
          includeFrench: bilingualSummary,
          rateMultiplier: rateMult,
          onTurnStart: (turnIdx) => {
            if (audioSessionTokenRef.current !== mySession) return;
            if (turnIdx === 0) {
              setActiveOverviewPhraseIndex(null);
              setAutoAudioStatusLabel(`Leçon : ${targetLesson.title_en}`);
            } else if (turnIdx <= targetLesson.model_phrases.length) {
              const phraseIdx = turnIdx - 1;
              setActiveOverviewPhraseIndex(phraseIdx);
              setAutoAudioStatusLabel(
                `Phrase modèle ${phraseIdx + 1}/${targetLesson.model_phrases.length}`
              );
            } else {
              setActiveOverviewPhraseIndex(null);
              setAutoAudioStatusLabel('Exemple grammatical en contexte');
            }
          },
          onComplete: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setActiveOverviewPhraseIndex(null);
            setAutoAudioStatusLabel(null);
          },
          onError: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setActiveOverviewPhraseIndex(null);
            setAutoAudioStatusLabel(null);
          }
        });
        autoAudioCancelRef.current = cancelSeq;
      };

      if (bilingualSummary) {
        setAutoAudioStatusLabel('Synthèse pédagogique bilingue (FR / EN)');
        const introFr = `${targetLesson.title}. ${targetLesson.learning_objective} Point de grammaire : ${targetLesson.grammar.title}. ${targetLesson.grammar.rule}`;
        speakFrenchText(introFr, 'summary-audio', {
          rateMultiplier: rateMult,
          onEnd: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            autoAudioTimerRef.current = setTimeout(startEnglishSequence, 250);
          },
          onError: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setAutoAudioStatusLabel(null);
          }
        });
      } else {
        startEnglishSequence();
      }
    },
    [cancelAllLessonAudio, voiceAccent]
  );

  const playGrammarNarration = useCallback(
    (targetLesson: SchoolLesson) => {
      cancelAllLessonAudio();
      const mySession = audioSessionTokenRef.current;
      const rateMult = speechRateRef.current / 0.9;

      setAutoAudioStatusLabel(`Grammaire : ${targetLesson.grammar.title}`);
      const frText = `${targetLesson.grammar.title}. ${targetLesson.grammar.rule}`;
      speakFrenchText(frText, `auto-grammar-fr-${targetLesson.id}`, {
        rateMultiplier: rateMult,
        onEnd: () => {
          if (audioSessionTokenRef.current !== mySession) return;
          setAutoAudioStatusLabel('Exemple grammatical (Anglais)');
          autoAudioTimerRef.current = setTimeout(() => {
            if (audioSessionTokenRef.current !== mySession) return;
            speakNaturalText(
              targetLesson.grammar.example_en,
              voiceAccent,
              `auto-grammar-en-${targetLesson.id}`,
              {
                rateMultiplier: rateMult,
                naturalProsody: true,
                onEnd: () => {
                  if (audioSessionTokenRef.current !== mySession) return;
                  setAutoAudioStatusLabel(null);
                },
                onError: () => {
                  if (audioSessionTokenRef.current !== mySession) return;
                  setAutoAudioStatusLabel(null);
                }
              }
            );
          }, 260);
        },
        onError: () => {
          if (audioSessionTokenRef.current !== mySession) return;
          setAutoAudioStatusLabel(null);
        }
      });
    },
    [cancelAllLessonAudio, voiceAccent]
  );

  const playDialogueNarration = useCallback(
    (targetLesson: SchoolLesson) => {
      cancelAllLessonAudio();
      const mySession = audioSessionTokenRef.current;
      const rateMult = speechRateRef.current / 0.9;
      const turns = buildLessonDialogueTurns(
        targetLesson.dialogue.lines,
        voiceAccent,
        targetLesson.id
      );

      const cancelSeq = playDialogueSequence(turns, voiceAccent, {
        rateMultiplier: rateMult,
        onTurnStart: (turnIdx) => {
          if (audioSessionTokenRef.current !== mySession) return;
          setActiveDialogueIndex(turnIdx);
          const speakerName = targetLesson.dialogue.lines[turnIdx]?.speaker || `Réplique ${turnIdx + 1}`;
          setAutoAudioStatusLabel(
            `Dialogue (${turnIdx + 1}/${turns.length}) • ${speakerName}`
          );
        },
        onComplete: () => {
          if (audioSessionTokenRef.current !== mySession) return;
          setActiveDialogueIndex(null);
          setAutoAudioStatusLabel(null);
        },
        onError: () => {
          if (audioSessionTokenRef.current !== mySession) return;
          setActiveDialogueIndex(null);
          setAutoAudioStatusLabel(null);
        }
      });
      autoAudioCancelRef.current = cancelSeq;
    },
    [cancelAllLessonAudio, voiceAccent]
  );

  // Stop any audio cleanly when modal closes, unmounts, or Auto Audio is toggled OFF
  useEffect(() => {
    if (!isOpen || !lesson) {
      cancelAllLessonAudio();
    }
  }, [isOpen, lesson, cancelAllLessonAudio]);

  useEffect(() => {
    return () => {
      cancelAllLessonAudio();
    };
  }, [cancelAllLessonAudio]);

  // Automatic section narration on modal open / tab switch / accent change
  useEffect(() => {
    if (!isOpen || !lesson) return;
    if (!isAutoAudioEnabled) {
      cancelAllLessonAudio();
      return;
    }
    // Vocab flashcards have their own dedicated card/flip auto-audio effect; quiz & rhetoric stay silent
    if (activeTab === 'vocab' || activeTab === 'quiz' || activeTab === 'rhetoric') {
      if (activeTab !== 'vocab') {
        cancelAllLessonAudio();
      }
      return;
    }

    cancelAllLessonAudio();
    const mySession = audioSessionTokenRef.current;

    autoAudioTimerRef.current = setTimeout(() => {
      if (audioSessionTokenRef.current !== mySession) return;

      if (activeTab === 'overview') {
        playOverviewNarration(lesson, false);
      } else if (activeTab === 'grammar') {
        playGrammarNarration(lesson);
      } else if (activeTab === 'dialogue') {
        playDialogueNarration(lesson);
      } else if (activeTab === 'dictation') {
        setAutoAudioStatusLabel('Dictée vocale automatique');
        speakNaturalText(
          lesson.dictation.canonical,
          voiceAccent,
          `auto-dictation-${lesson.id}`,
          {
            rateMultiplier: speechRateRef.current / 0.9,
            naturalProsody: true,
            onEnd: () => {
              if (audioSessionTokenRef.current !== mySession) return;
              setAutoAudioStatusLabel(null);
            },
            onError: () => {
              if (audioSessionTokenRef.current !== mySession) return;
              setAutoAudioStatusLabel(null);
            }
          }
        );
      }
    }, 260);

    return () => {
      if (autoAudioTimerRef.current) {
        clearTimeout(autoAudioTimerRef.current);
        autoAudioTimerRef.current = null;
      }
    };
  }, [
    isOpen,
    lesson,
    activeTab,
    isAutoAudioEnabled,
    voiceAccent,
    cancelAllLessonAudio,
    playOverviewNarration,
    playGrammarNarration,
    playDialogueNarration
  ]);

  // Automatic flashcard pronunciation in Vocab tab when changing or flipping cards
  useEffect(() => {
    if (!isOpen || !lesson || !isAutoAudioEnabled || activeTab !== 'vocab') return;
    const card = flashcardDeck[flashcardIndex];
    if (!card) return;

    cancelAllLessonAudio();
    const mySession = audioSessionTokenRef.current;

    autoAudioTimerRef.current = setTimeout(() => {
      if (audioSessionTokenRef.current !== mySession) return;
      const rateMult = speechRateRef.current / 0.9;

      if (!isFlipped) {
        setAutoAudioStatusLabel(`Vocabulaire : « ${card.term} »`);
        const turns: DialoguePlaybackTurn[] = [
          { id: `auto-fc-term-${lesson.id}-${flashcardIndex}`, en: card.term },
          ...(card.example_en
            ? [{ id: `auto-fc-ex-${lesson.id}-${flashcardIndex}`, en: card.example_en }]
            : [])
        ];
        const cancelSeq = playDialogueSequence(turns, voiceAccent, {
          rateMultiplier: rateMult,
          onTurnStart: (idx) => {
            if (audioSessionTokenRef.current !== mySession) return;
            setAutoAudioStatusLabel(
              idx === 0 ? `Mot : « ${card.term} »` : `Exemple : « ${card.example_en} »`
            );
          },
          onComplete: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setAutoAudioStatusLabel(null);
          },
          onError: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setAutoAudioStatusLabel(null);
          }
        });
        autoAudioCancelRef.current = cancelSeq;
      } else {
        setAutoAudioStatusLabel(`Traduction : « ${card.translation_fr} »`);
        speakFrenchText(card.translation_fr, `auto-fc-fr-${lesson.id}-${flashcardIndex}`, {
          rateMultiplier: rateMult,
          onEnd: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setAutoAudioStatusLabel(null);
          },
          onError: () => {
            if (audioSessionTokenRef.current !== mySession) return;
            setAutoAudioStatusLabel(null);
          }
        });
      }
    }, 220);

    return () => {
      if (autoAudioTimerRef.current) {
        clearTimeout(autoAudioTimerRef.current);
        autoAudioTimerRef.current = null;
      }
    };
  }, [
    isOpen,
    lesson,
    activeTab,
    flashcardIndex,
    isFlipped,
    flashcardDeck,
    isAutoAudioEnabled,
    voiceAccent,
    cancelAllLessonAudio
  ]);

  if (!isOpen || !lesson) return null;

  const handleToggleAutoAudio = () => {
    const next = !isAutoAudioEnabled;
    setIsAutoAudioEnabled(next);
    try {
      localStorage.setItem(LESSON_AUTO_AUDIO_STORAGE_KEY, String(next));
    } catch {
      // ignore storage failure
    }
    if (!next) {
      cancelAllLessonAudio();
    }
  };

  const handleGenerateLessonSummaryAudio = () => {
    if (!lesson) return;
    if (
      isPlayingAudio === 'summary-audio' ||
      (isPlayingAudio && isPlayingAudio.startsWith('auto-overview'))
    ) {
      cancelAllLessonAudio();
      return;
    }
    playOverviewNarration(lesson, true);
  };

  const handleSelectQuizOption = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    playSelectCue();
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleValidateQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    randomizedQuiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_index) correct++;
    });

    const quizScore = Math.round((correct / Math.max(1, randomizedQuiz.length)) * 100);

    // Persist attempt into IndexedDB (works offline) & Cloud Firestore
    recordAttempt({
      moduleId: `${lesson.id}_quiz`,
      moduleType: 'quiz',
      title: `${lesson.class_label} • Quiz : ${lesson.title}`,
      level: (lesson.cefr_level.includes('C1') ? 'C1' : lesson.cefr_level.includes('B2') ? 'B2' : 'B1') as any,
      score: quizScore,
      durationSeconds: 120
    }).catch(console.warn);

    if (correct >= 3) {
      playVictoryCue();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      // Récompense : 1 MSZ Coin sur la validation d'une leçon de cursus
      awardMszCoins('cursus', lesson.id, 1, 14, lesson.title);
      void completeSchoolLessonForCityProgress(lesson.id, lesson.title);
      if (onCompleteLesson) {
        onCompleteLesson(lesson.id, 100);
      }
    } else if (correct > 0) {
      playCorrectCue();
    } else {
      playIncorrectCue();
    }
  };

  const handleCheckDictation = () => {
    setDictationChecked(true);
    const canonical = lesson.dictation.canonical.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');
    const user = userInputDictation.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');

    const canonWords = canonical.split(/\s+/);
    const userWords = user.split(/\s+/);

    let matches = 0;
    userWords.forEach((w) => {
      if (canonWords.includes(w)) matches++;
    });

    const score = Math.min(100, Math.round((matches / Math.max(1, canonWords.length)) * 100));
    setDictationScore(score);

    // Persist attempt into IndexedDB (works offline) & Cloud Firestore
    recordAttempt({
      moduleId: `${lesson.id}_dictation`,
      moduleType: 'dictation',
      title: `${lesson.class_label} • Dictée : ${lesson.title}`,
      level: (lesson.cefr_level.includes('C1') ? 'C1' : lesson.cefr_level.includes('B2') ? 'B2' : 'B1') as any,
      score,
      durationSeconds: 90
    }).catch(console.warn);

    if (score >= 80) {
      void completeSchoolLessonForCityProgress(lesson.id, lesson.title);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  // Play dialogue step by step with distinct natural speaker voices
  const handlePlayFullDialogue = () => {
    if (!lesson) return;
    if (activeDialogueIndex !== null) {
      cancelAllLessonAudio();
      return;
    }
    playDialogueNarration(lesson);
  };

  const tabsList: Array<{ id: LessonTab; label: string; icon: string }> = [
    { id: 'overview', label: 'Aperçu & Phrases', icon: 'format_quote' },
    { id: 'vocab', label: `Vocabulaire (${lesson.vocabulary?.length || 0})`, icon: 'style' },
    { id: 'grammar', label: 'Grammaire', icon: 'history_edu' },
    { id: 'dialogue', label: 'Dialogue Audio', icon: 'forum' },
    { id: 'rhetoric', label: 'Analyse Rhétorique', icon: 'auto_awesome' },
    { id: 'quiz', label: `Quiz (${lesson.quiz?.length || 0})`, icon: 'quiz' },
    { id: 'dictation', label: 'Dictée', icon: 'edit_note' }
  ];

  return (
    <LessonDictionaryProvider
      lessonId={lesson.id}
      lessonContext={`${lesson.title} — ${lesson.theme_label} (${lesson.grammar.title})`}
      gradeLevel={`${lesson.class_label} (CECRL ${lesson.cefr_level})`}
      vocabulary={lesson.vocabulary}
      voiceAccent={voiceAccent}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/40 text-[#dce2f8] shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* MODAL HEADER */}
        <header className="p-4 sm:p-5 border-b border-[#232a3a] bg-[#151b2b] flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-md shrink-0">
                <span className="material-symbols-outlined text-2xl">{lesson.theme_icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[10px] font-bold tracking-wider font-mono uppercase">
                    {lesson.class_label} • {lesson.cycle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#232a3a] text-[#d4c78f] text-[10px] font-bold tracking-wider font-mono">
                    NIVEAU CECRL {lesson.cefr_level}
                  </span>
                  <span className="text-[11px] text-[#99907c] font-mono">
                    ~{lesson.estimated_minutes} min
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#dce2f8] mt-1 truncate">
                  {lesson.title}
                </h2>
                <p className="text-xs text-[#d0c5af]/80 line-clamp-1">
                  Objectif : {lesson.learning_objective}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Auto-Audio Natural TTS Toggle */}
              <button
                type="button"
                onClick={handleToggleAutoAudio}
                className={`px-2.5 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isAutoAudioEnabled
                    ? 'bg-[#f2ca50]/15 border-[#f2ca50]/60 text-[#f2ca50] shadow-sm shadow-[#f2ca50]/10'
                    : 'bg-[#0c1322] border-[#232a3a] text-[#99907c] hover:text-[#dce2f8]'
                }`}
                title={
                  isAutoAudioEnabled
                    ? 'Lecture Audio Automatique activée (cliquez pour désactiver)'
                    : 'Activer la Lecture Audio Automatique avec voix naturelle'
                }
                aria-pressed={isAutoAudioEnabled}
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    isAutoAudioEnabled && autoAudioStatusLabel ? 'animate-pulse' : ''
                  }`}
                >
                  {isAutoAudioEnabled ? 'record_voice_over' : 'voice_over_off'}
                </span>
                <span className="hidden md:inline text-[10px] font-mono uppercase font-bold">
                  Auto Audio : {isAutoAudioEnabled ? 'ON' : 'OFF'}
                </span>
                <span className="md:hidden text-[10px] font-mono uppercase font-bold">
                  {isAutoAudioEnabled ? 'Auto' : 'Muet'}
                </span>
              </button>

              {/* Audio Controls Dropdown & Accent */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs">
                <button
                  type="button"
                  onClick={() => setVoiceAccent(voiceAccent === 'en-GB' ? 'en-US' : 'en-GB')}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-[#f2ca50] bg-[#232a3a]"
                  title="Changer l'accent audio (British RP / American)"
                >
                  {voiceAccent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechRate(speechRate === 0.9 ? 0.75 : speechRate === 0.75 ? 1.0 : 0.9)}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50]"
                  title="Vitesse de diction"
                >
                  {speechRate}x
                </button>
              </div>

              {/* Translation Toggle */}
              <button
                type="button"
                onClick={() => setShowTranslations(!showTranslations)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                  showTranslations
                    ? 'bg-[#232a3a] border-[#f2ca50]/40 text-[#f2ca50]'
                    : 'bg-[#0c1322] border-[#232a3a] text-[#99907c]'
                }`}
                title={showTranslations ? 'Masquer les traductions FR' : 'Afficher les traductions FR'}
              >
                <span className="material-symbols-outlined text-base">translate</span>
                <span className="hidden sm:inline text-[10px] font-mono uppercase font-bold">FR</span>
              </button>

              {/* Heart Favorite Toggle */}
              <button
                type="button"
                onClick={handleHeartClick}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-90 ${
                  currentIsFavorite
                    ? 'bg-rose-500/20 border-rose-400/70 text-rose-400 shadow-sm shadow-rose-500/20'
                    : 'bg-[#0c1322] border-[#232a3a] text-[#99907c] hover:text-rose-400 hover:border-rose-500/40'
                }`}
                title={currentIsFavorite ? 'Retirer des favoris' : 'Ajouter aux leçons favorites'}
                aria-label={currentIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-pressed={currentIsFavorite}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: currentIsFavorite ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {currentIsFavorite ? 'favorite' : 'favorite_border'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cancelAllLessonAudio();
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* ANIMATED 10-CHAPTER MASTERY PROGRESS BAR FOR CURRENT LEVEL */}
          <ChapterMasteryProgressBar />

          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {tabsList.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md font-bold'
                      : 'bg-[#0c1322] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* LIVE NATURAL TTS PLAYER BAR (WHEN NARRATION IS ACTIVE) */}
          {(autoAudioStatusLabel || isPlayingAudio) && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#0c1322] border border-[#f2ca50]/45 text-xs shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-base text-[#f2ca50] animate-pulse shrink-0">
                  graphic_eq
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#f2ca50] truncate">
                  {autoAudioStatusLabel || 'Lecture audio naturelle en cours...'}
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-[#232a3a] text-[10px] font-mono text-[#d4c78f] shrink-0">
                  {voiceAccent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'} • {speechRate}x
                </span>
              </div>
              <button
                type="button"
                onClick={cancelAllLessonAudio}
                className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-rose-500/20 text-[#dce2f8] hover:text-rose-300 border border-[#f2ca50]/30 hover:border-rose-400/50 text-[10px] font-mono font-bold uppercase flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">stop_circle</span>
                <span>Arrêter</span>
              </button>
            </div>
          )}

          {/* SUBTLE IN-CONTEXT DICTIONARY HINT */}
          <div className="flex items-center gap-2 text-[11px] text-[#d4c78f]/90 pt-0.5">
            <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0">translate</span>
            <span>
              <strong>Double-cliquez</strong> sur n&apos;importe quel mot pour afficher son infobulle éphémère (traduction + phonétique IPA locale), ou <strong>pression longue / sélection</strong> pour le dictionnaire complet.
            </span>
          </div>
        </header>

        {/* MODAL BODY */}
        <LessonSelectionBody>
          {/* TAB 1: OVERVIEW & MODEL PHRASES */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#f2ca50] font-bold font-mono">
                    Synthèse Pédagogique
                  </span>
                  <span className="text-xs text-[#d4c78f] font-mono">
                    Progression {lesson.class_label}
                  </span>
                </div>
                <p className="text-sm text-[#dce2f8] leading-relaxed">
                  Cette leçon permet aux élèves de <strong className="text-[#f2ca50]">{lesson.class_label}</strong> de maîtriser le thème « {lesson.theme_label} » tout en consolidant le point de grammaire : <em className="text-[#d4c78f]">{lesson.grammar.title}</em>.
                </p>
                <div className="pt-2 border-t border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-[#99907c]">
                    Écouter la synthèse vocale naturelle complète de la leçon (FR + EN)
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingAudio && isPlayingAudio.startsWith('auto-overview')) {
                          cancelAllLessonAudio();
                        } else {
                          playOverviewNarration(lesson, false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#232a3a] hover:bg-[#2e374b] text-[#f2ca50] border border-[#f2ca50]/35 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isPlayingAudio?.startsWith('auto-overview') ? 'stop_circle' : 'play_circle'}
                      </span>
                      <span>
                        {isPlayingAudio?.startsWith('auto-overview')
                          ? 'Stop Immersion EN'
                          : 'Lire les phrases (EN)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateLessonSummaryAudio}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#f2ca50]/15 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isPlayingAudio === 'summary-audio' ? 'graphic_eq' : 'volume_up'}
                      </span>
                      <span>
                        {isPlayingAudio === 'summary-audio'
                          ? 'Arrêter la synthèse'
                          : 'Synthèse bilingue complète'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-[#f2ca50] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">format_quote</span>
                  Phrases Modèles d’Expression ({lesson.model_phrases.length})
                </h3>

                <div className="space-y-2.5">
                  {lesson.model_phrases.map((phrase, idx) => {
                    const isActivePhrase = activeOverviewPhraseIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isActivePhrase
                            ? 'bg-[#232a3a] border-[#f2ca50] ring-1 ring-[#f2ca50]/70 shadow-lg shadow-[#f2ca50]/10'
                            : 'bg-[#151b2b] border-[#232a3a] hover:border-[#f2ca50]/30'
                        }`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#f2ca50] font-bold px-1.5 py-0.2 rounded bg-[#f2ca50]/15">
                              {phrase.focus}
                            </span>
                            {isActivePhrase && (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                                <span className="material-symbols-outlined text-xs">graphic_eq</span>
                                En lecture
                              </span>
                            )}
                          </div>
                          <p className="text-sm sm:text-base font-serif font-bold text-[#dce2f8] tracking-wide">
                            <InteractiveHighlightText text={phrase.en} />
                          </p>
                          {showTranslations && (
                            <p className="text-xs text-[#d0c5af]/80 italic">
                              « {phrase.fr} »
                            </p>
                          )}
                        </div>

                        <DualSpeakerButton
                          text={phrase.en}
                          id={`phrase-${idx}`}
                          explanation={phrase.fr}
                          variant="pill"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOCABULARY & FLASHCARDS */}
          {activeTab === 'vocab' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Flashcard interactive trainer widget with 50-card scrubber */}
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#f2ca50]/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-base">style</span>
                    <span className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider font-mono">
                      Flashcard • {flashcardIndex + 1} / {flashcardDeck.length} ({Math.round(((flashcardIndex + 1) / Math.max(1, flashcardDeck.length)) * 100)}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="text-xs text-[#d4c78f] hover:text-[#f2ca50] font-bold font-mono underline"
                  >
                    {isFlipped ? 'Voir Recto (EN)' : 'Voir Verso (FR)'}
                  </button>
                </div>

                {/* Golden Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#0c1322] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4c78f] to-[#f2ca50] transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.round(((flashcardIndex + 1) / Math.max(1, flashcardDeck.length)) * 100)}%`
                    }}
                  />
                </div>

                {/* Flip Card */}
                {flashcardDeck[flashcardIndex] && (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[145px] rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 flex flex-col items-center justify-center text-center shadow-inner relative group transition-all hover:border-[#f2ca50]/40"
                  >
                    {!isFlipped ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#99907c] uppercase">
                          {flashcardDeck[flashcardIndex].part_of_speech}
                        </span>
                        <h4 className="font-serif text-2xl font-bold text-[#f2ca50]">
                          {flashcardDeck[flashcardIndex].term}
                        </h4>
                        <span className="text-xs text-[#d4c78f] font-mono">
                          {flashcardDeck[flashcardIndex].phonetic}
                        </span>
                        <span className="text-[10px] text-[#99907c] mt-2">
                          (Cliquez pour révéler la traduction française)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                          Traduction Française
                        </span>
                        <h4 className="font-serif text-xl font-bold text-[#dce2f8]">
                          {flashcardDeck[flashcardIndex].translation_fr}
                        </h4>
                        <p
                          className="text-xs text-[#d0c5af]/80 italic mt-1 max-w-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          « <InteractiveHighlightText text={flashcardDeck[flashcardIndex].example_en} /> »
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Steppers & Audio */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => Math.max(0, prev - 10));
                      }}
                      disabled={flashcardIndex === 0}
                      className="px-2 py-1 rounded bg-[#232a3a] text-[10px] font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50] disabled:opacity-40"
                      title="Reculer de 10 cartes"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : flashcardDeck.length - 1));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#232a3a] text-xs font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50] active:scale-95"
                    >
                      ← Précédent
                    </button>
                  </div>

                  {flashcardDeck[flashcardIndex] && (
                    <DualSpeakerButton
                      text={flashcardDeck[flashcardIndex].term}
                      id={`fc-audio-${flashcardIndex}`}
                      phonetic={flashcardDeck[flashcardIndex].phonetic}
                      explanation={flashcardDeck[flashcardIndex].translation_fr}
                      variant="pill"
                    />
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#232a3a] text-xs font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50] active:scale-95"
                    >
                      Suivant →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => Math.min(flashcardDeck.length - 1, prev + 10));
                      }}
                      disabled={flashcardIndex >= flashcardDeck.length - 1}
                      className="px-2 py-1 rounded bg-[#232a3a] text-[10px] font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50] disabled:opacity-40"
                      title="Avancer de 10 cartes"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Range Scrubber across 50 cards with randomizer */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#232a3a]/80">
                  <span className="text-[10px] text-[#99907c] font-mono shrink-0">Naviguer (1-{flashcardDeck.length}) :</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, flashcardDeck.length - 1)}
                    value={flashcardIndex}
                    onChange={(e) => {
                      setIsFlipped(false);
                      setFlashcardIndex(parseInt(e.target.value, 10));
                    }}
                    className="w-full h-1.5 bg-[#0a1120] rounded-lg appearance-none cursor-pointer accent-[#f2ca50]"
                    aria-label="Navigation parmi les cartes"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setVocabShuffleNonce((n) => n + 1);
                      setFlashcardIndex(0);
                    }}
                    className="px-2 py-1 rounded bg-[#101b33] border border-[#f2ca50]/30 text-[#f2ca50] text-[10px] font-mono font-bold hover:bg-[#f2ca50] hover:text-[#2c2000] transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                    title="Mélanger aléatoirement les cartes"
                  >
                    <span className="material-symbols-outlined text-xs">shuffle</span>
                    <span>Mélanger</span>
                  </button>
                </div>
              </div>

              {/* Complete Vocabulary List with Search & Type Filter */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8] flex items-center gap-2">
                      <span>Lexique Intégral</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] text-xs font-mono font-bold border border-[#f2ca50]/30">
                        {lesson.vocabulary.length} Termes
                      </span>
                    </h3>
                    <p className="text-xs text-[#d0c5af]/80">
                      Entraînement sonorisé avec phonétique internationale et phrases d'exemple en contexte.
                    </p>
                  </div>

                  {/* Filter Type Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {[
                      { id: 'all', label: `Tous (${lesson.vocabulary.length})` },
                      { id: 'noun', label: 'Noms' },
                      { id: 'verb', label: 'Verbes' },
                      { id: 'phrase', label: 'Phrases' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setVocabFilterType(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                          vocabFilterType === tab.id
                            ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                            : 'bg-[#232a3a] text-[#d0c5af] hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Search Bar */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#99907c]">
                    search
                  </span>
                  <input
                    type="text"
                    value={vocabSearchQuery}
                    onChange={(e) => setVocabSearchQuery(e.target.value)}
                    placeholder={`Rechercher parmi les ${lesson.vocabulary.length} termes (en anglais ou en français)...`}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs text-[#dce2f8] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]/50"
                  />
                  {vocabSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVocabSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#99907c] hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dynamic count notice */}
                {(vocabSearchQuery || vocabFilterType !== 'all') && (
                  <div className="text-xs text-[#d4c78f] font-mono">
                    Affichage de {filteredVocab.length} sur {lesson.vocabulary.length} termes
                  </div>
                )}

                {/* Complete Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
                  {filteredVocab.map((w: SchoolVocabularyItem, idx: number) => (
                    <div
                      key={w.id || idx}
                      className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col justify-between gap-2 hover:border-[#f2ca50]/30 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-bold text-[#f2ca50]">
                              <InteractiveHighlightText text={w.term} />
                            </span>
                            <span className="text-[10px] font-mono text-[#99907c] px-1 rounded bg-[#232a3a]">
                              {w.part_of_speech}
                            </span>
                          </div>
                          <span className="text-xs text-[#d4c78f] font-mono">{w.phonetic}</span>
                        </div>

                        <DualSpeakerButton
                          text={w.term}
                          id={`vocab-${idx}`}
                          phonetic={w.phonetic}
                          explanation={w.translation_fr}
                          variant="compact"
                        />
                      </div>

                      <div className="border-t border-[#232a3a] pt-2">
                        <p className="text-xs font-semibold text-[#dce2f8]">
                          {w.translation_fr}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#d0c5af]/80 mt-1 italic">
                          <span>Ex : <InteractiveHighlightText text={w.example_en} /></span>
                          <DualSpeakerButton
                            text={w.example_en}
                            id={`vocab-ex-${idx}`}
                            explanation={w.example_fr}
                            variant="minimal"
                          />
                        </div>
                        {showTranslations && (
                          <p className="text-[10px] text-[#99907c] italic">
                            « {w.example_fr} »
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRAMMAR POINT */}
          {activeTab === 'grammar' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl bg-[#151b2b] border border-[#f2ca50]/40 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#232a3a] pb-2 gap-2 flex-wrap">
                  <span className="text-xs font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    Fiche Grammaticale de Niveau {lesson.class_label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingAudio?.startsWith('auto-grammar')) {
                          cancelAllLessonAudio();
                        } else {
                          playGrammarNarration(lesson);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#2e374b] text-[#f2ca50] border border-[#f2ca50]/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingAudio?.startsWith('auto-grammar') ? 'stop_circle' : 'volume_up'}
                      </span>
                      <span>
                        {isPlayingAudio?.startsWith('auto-grammar') ? 'Arrêter' : 'Écouter la fiche'}
                      </span>
                    </button>
                    <span className="text-xs text-[#d4c78f] font-mono">{lesson.cefr_level}</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8]">
                  {lesson.grammar.title}
                </h3>

                <p className="text-sm text-[#dce2f8] leading-relaxed">
                  {lesson.grammar.rule}
                </p>

                {/* Tip box */}
                <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0 mt-0.5">
                    tips_and_updates
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-[#f2ca50] uppercase font-mono tracking-wider">
                      Astuce & Piège à éviter
                    </h5>
                    <p className="text-xs text-[#dce2f8] mt-0.5 leading-relaxed">
                      {lesson.grammar.tip}
                    </p>
                  </div>
                </div>

                {/* Example Breakdown */}
                <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#d4c78f]">
                    Exemple en Contexte Réel
                  </span>
                  <p className="text-sm font-serif font-bold text-[#dce2f8]">
                    <InteractiveHighlightText text={lesson.grammar.example_en} />
                  </p>
                  <p className="text-xs text-[#d0c5af]/80 italic">
                    « {lesson.grammar.example_fr} »
                  </p>
                </div>

                <div className="text-[11px] text-[#99907c] font-mono border-t border-[#232a3a] pt-2">
                  Focus officiel du cycle : {lesson.grammar.level_focus}
                </div>
              </div>

              {/* 6e Interactive Sentence Structuring Section */}
              {lesson.class_level === '6e' && (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">extension</span>
                      Exercice de Structuration de Phrase (6e)
                    </span>
                    <span className="text-[10px] font-mono text-[#d4c78f]">
                      Fiche #{modalGrammarIndex + 1}/50
                    </span>
                  </div>

                  <SentenceStructuringExercise
                    item={GRAMMAR_6E_ITEMS[modalGrammarIndex] || GRAMMAR_6E_ITEMS[0]}
                    onComplete={(id, score) => {
                      recordAttempt({
                        moduleId: `${id}_struct`,
                        moduleType: 'grammar',
                        title: `Structuration 6e : ${GRAMMAR_6E_ITEMS[modalGrammarIndex]?.title}`,
                        level: 'A1',
                        score,
                        durationSeconds: 60
                      }).catch(console.warn);
                    }}
                    onNext={() => {
                      if (modalGrammarIndex < GRAMMAR_6E_ITEMS.length - 1) {
                        setModalGrammarIndex((prev) => prev + 1);
                      }
                    }}
                    onPrev={() => {
                      if (modalGrammarIndex > 0) {
                        setModalGrammarIndex((prev) => prev - 1);
                      }
                    }}
                    hasPrev={modalGrammarIndex > 0}
                    hasNext={modalGrammarIndex < GRAMMAR_6E_ITEMS.length - 1}
                    currentIndex={modalGrammarIndex + 1}
                    totalCount={GRAMMAR_6E_ITEMS.length}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BILINGUAL DIALOGUE */}
          {activeTab === 'dialogue' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#dce2f8]">
                    {lesson.dialogue.title}
                  </h4>
                  <p className="text-xs text-[#d0c5af]/80 mt-0.5">
                    {lesson.dialogue.setting_fr}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rhetoric')}
                    className="px-3 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e374b] text-[#f2ca50] border border-[#f2ca50]/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <span>Analyse Rhétorique</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayFullDialogue}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer ${
                      activeDialogueIndex !== null
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/60 hover:bg-rose-500/30'
                        : 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {activeDialogueIndex !== null ? 'stop_circle' : 'play_arrow'}
                    </span>
                    {activeDialogueIndex !== null ? 'Arrêter la lecture' : 'Lecture Intégrale'}
                  </button>
                </div>
              </div>

              {/* Dialogue lines */}
              <div className="space-y-3">
                {lesson.dialogue.lines.map((line, idx) => {
                  const isCurrent = activeDialogueIndex === idx;
                  const isSpeakerA = line.speaker.includes('A');
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isCurrent
                          ? 'bg-[#232a3a] border-[#f2ca50] shadow-lg shadow-[#f2ca50]/10 ring-1 ring-[#f2ca50]'
                          : isSpeakerA
                          ? 'bg-[#151b2b] border-[#232a3a]'
                          : 'bg-[#191f2f] border-[#232a3a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                          {line.speaker}
                        </span>

                        <DualSpeakerButton
                          text={line.en}
                          id={`line-${idx}`}
                          explanation={line.fr}
                          variant="compact"
                        />
                      </div>

                      <p className="text-sm sm:text-base font-serif font-semibold text-[#dce2f8]">
                        <InteractiveHighlightText text={line.en} />
                      </p>

                      {showTranslations && (
                        <p className="text-xs text-[#d0c5af]/70 italic">
                          « {line.fr} »
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#f2ca50]">
                    Quiz d’Évaluation ({randomizedQuiz.length} Questions)
                  </h4>
                  <p className="text-xs text-[#d0c5af]/80">
                    Testez votre compréhension du vocabulaire et de la grammaire de {lesson.class_label}.
                  </p>
                </div>

                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] font-mono text-xs font-bold">
                    Score :{' '}
                    {
                      randomizedQuiz.filter((q) => quizAnswers[q.id] === q.correct_index).length
                    }{' '}
                    / {randomizedQuiz.length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {randomizedQuiz.map((q, qIdx) => {
                  const userAnswer = quizAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correct_index;

                  return (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#232a3a] text-[#f2ca50] text-sm font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h5 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] leading-snug">
                          {q.question}
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-[#0c1322] border-[#232a3a] text-[#dce2f8] hover:bg-[#232a3a]';
                          let optTextSize = 'text-sm sm:text-base font-medium';

                          if (quizSubmitted) {
                            if (optIdx === q.correct_index) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                              optTextSize = 'text-base sm:text-lg font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-red-950/80 border-red-500 text-red-300 line-through';
                              optTextSize = 'text-base sm:text-lg font-bold';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-[#232a3a] border-[#f2ca50] text-[#f2ca50] font-bold';
                            optTextSize = 'text-base sm:text-lg font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${optTextSize} ${btnStyle}`}
                            >
                              <span className="break-words whitespace-normal">{opt}</span>
                              {quizSubmitted && optIdx === q.correct_index && (
                                <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">
                                  check_circle
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                              : 'bg-[#0c1322] text-[#d0c5af] border border-[#232a3a]'
                          }`}
                        >
                          <strong>Explication :</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleValidateQuiz}
                  disabled={Object.keys(quizAnswers).length < randomizedQuiz.length}
                  className="w-full py-3.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe088] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-98 transition-all"
                >
                  Valider mes réponses au Quiz (+100 XP)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    setQuizShuffleNonce((n) => n + 1);
                  }}
                  className="w-full py-3 rounded-xl bg-[#232a3a] text-[#f2ca50] font-bold text-xs uppercase tracking-wider hover:bg-[#2e3545]"
                >
                  Recommencer le Quiz
                </button>
              )}
            </div>
          )}

          {/* TAB 6: DICTATION */}
          {activeTab === 'dictation' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#232a3a] pb-2">
                  <span className="text-xs font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">hearing</span>
                    Exercice de Dictée Cadencée
                  </span>
                  <span className="text-xs text-[#99907c] font-mono">{lesson.class_label}</span>
                </div>

                <p className="text-xs text-[#d0c5af]/80">
                  Écoutez l'énoncé oral autant de fois que nécessaire, puis retranscrivez la phrase en anglais avec la ponctuation appropriée.
                </p>

                <div className="flex items-center justify-center p-6 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                  <DualSpeakerButton
                    text={lesson.dictation.canonical}
                    id="dictation-audio"
                    variant="prominent"
                    explanation="Écoutez attentivement l'accent avant de retranscrire la phrase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#dce2f8] font-semibold">
                    Votre transcription écrite :
                  </label>
                  <textarea
                    rows={3}
                    value={userInputDictation}
                    onChange={(e) => setUserInputDictation(e.target.value)}
                    placeholder="Tapez ici la phrase entendue en anglais..."
                    className="w-full p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] focus:border-[#f2ca50] text-[#dce2f8] text-sm focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
                  />
                </div>

                {!dictationChecked ? (
                  <button
                    type="button"
                    onClick={handleCheckDictation}
                    disabled={!userInputDictation.trim()}
                    className="w-full py-3 rounded-xl bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/40 font-bold text-xs uppercase tracking-wider hover:bg-[#2e3545] disabled:opacity-40 transition-all"
                  >
                    Vérifier ma Transcription
                  </button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#0c1322] border border-emerald-500/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Exactitude : {dictationScore}%
                        </span>
                        <span className="text-[10px] text-[#99907c] font-mono">Corrigé officiel</span>
                      </div>
                      <div>
                        <p className="text-sm font-serif font-bold text-[#dce2f8]">
                          <InteractiveHighlightText text={lesson.dictation.canonical} />
                        </p>
                        <p className="text-xs text-[#d0c5af]/80 italic mt-0.5">
                          « {lesson.dictation.translation_fr} »
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserInputDictation('');
                        setDictationChecked(false);
                        setDictationScore(null);
                      }}
                      className="text-xs text-[#f2ca50] underline font-mono"
                    >
                      Réessayer la dictée
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: AUTOMATIC RHETORICAL ANALYSIS */}
          {activeTab === 'rhetoric' && (
            <div className="space-y-4 animate-fadeIn">
              <RhetoricalAnalyzerView initialLessonId={lesson.id} />
            </div>
          )}
        </LessonSelectionBody>

        {/* MODAL FOOTER */}
        <footer className="p-3 sm:p-4 border-t border-[#232a3a] bg-[#151b2b] flex items-center justify-between text-xs text-[#99907c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Fiche certifiée English Boost MZ • Conforme aux programmes</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] text-[#dce2f8] font-semibold text-xs transition-colors"
          >
            Fermer la Leçon
          </button>
        </footer>
        </div>
      </div>
    </LessonDictionaryProvider>
  );
};
