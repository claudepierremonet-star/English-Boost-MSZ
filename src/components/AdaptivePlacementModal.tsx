import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type {
  AgeRangeKey,
  CEFRLevel,
  LearningAttempt,
  LearningObjectiveId,
  PlacementSkillBreakdown,
  PlacementTestResult,
  SchoolGrade,
  UserProfile
} from '../firebase/types';
import {
  AGE_RANGES_META,
  LEARNING_OBJECTIVES_META,
  PREFERRED_DURATIONS,
  SCHOOL_GRADES_META,
  computeMultiSignalCefr,
  getGradeMeta,
  inferAgeRangeFromGrade,
  inferGradeFromCefr,
  evaluateAdaptiveLearning
} from '../services/adaptiveEngine';
import { speakText, stopSpeech } from '../services/speechService';
import { recordAttempt, updateUserProfile, getStoredFlashcardProgressList } from '../firebase/client';
import { getCityMapProgression } from '../utils/cityMapManager';
import { playCorrectCue, playIncorrectCue, playVictoryCue, playSelectCue } from '../utils/soundEffects';

interface AdaptivePlacementModalProps {
  isOpen: boolean;
  user: UserProfile;
  attempts?: LearningAttempt[];
  onClose: () => void;
  onCompleted?: (updatedUser: UserProfile, xpAwarded: number) => void;
}

interface McqItem {
  id: string;
  prompt: string;
  context?: string;
  options: string[];
  correctIdx: number;
  ruleFr: string;
  tier: 'core' | 'scaffold' | 'stretch';
}

const VOCAB_QUESTIONS = {
  core: {
    id: 'voc-core',
    prompt: 'Choose the most natural word to complete the sentence:',
    context: '“We need to ____ a clear decision before Friday’s presentation.”',
    options: ['do', 'make', 'create', 'invent'],
    correctIdx: 1,
    ruleFr: 'Collocation clé : en anglais on dit toujours « make a decision » (jamais *do a decision).',
    tier: 'core'
  } as McqItem,
  stretch: {
    id: 'voc-stretch',
    prompt: 'Which adjective best fits a diplomatic & nuanced register (C1)?',
    context: '“His explanation remained deliberately ____, leaving room for several interpretations.”',
    options: ['equivocal', 'loud', 'hungry', 'obvious'],
    correctIdx: 0,
    ruleFr: '« Equivocal » signifie équivoque / volontairement ambigu, précieux en argumentation C1/C2.',
    tier: 'stretch'
  } as McqItem,
  scaffold: {
    id: 'voc-scaffold',
    prompt: 'Which phrase correctly translates « J’ai hâte de visiter Londres »?',
    context: 'Choose the natural English expression:',
    options: [
      'I am looking forward to visiting London.',
      'I am hurry to visit London.',
      'I look after visiting London.',
      'I wait with pleasure London.'
    ],
    correctIdx: 0,
    ruleFr: '« Look forward to + V-ing » exprime l’impatience enthousiaste.',
    tier: 'scaffold'
  } as McqItem
};

const GRAMMAR_QUESTIONS = {
  core: {
    id: 'gram-core',
    prompt: 'Select the grammatically accurate tense:',
    context: '“She ____ in Manchester since 2021, and she loves her school.”',
    options: ['lives', 'lived', 'has lived', 'is living since'],
    correctIdx: 2,
    ruleFr: 'Avec « since + date » pour une action commencée dans le passé et toujours vraie, utilisez le Present Perfect (« has lived »).',
    tier: 'core'
  } as McqItem,
  stretch: {
    id: 'gram-stretch',
    prompt: 'Identify the accurate Third Conditional / Inversion structure:',
    context: '“Had the team checked the microphones earlier, the recording ____ flawless.”',
    options: ['would be', 'would have been', 'will have been', 'had been'],
    correctIdx: 1,
    ruleFr: 'Inversion conditionnelle passée (« Had + sujet + PP ») → proposition principale en « would have + PP ».',
    tier: 'stretch'
  } as McqItem,
  scaffold: {
    id: 'gram-scaffold',
    prompt: 'Complete the past-tense question accurately:',
    context: '“____ you finish your English homework yesterday evening?”',
    options: ['Was', 'Have', 'Did', 'Does'],
    correctIdx: 2,
    ruleFr: 'Avec un marqueur passé terminé (« yesterday »), on utilise l’auxiliaire « Did + base verbale ».',
    tier: 'scaffold'
  } as McqItem
};

const LISTENING_SCRIPTS = {
  college: {
    audioText:
      'Hello everyone! Please remember that tomorrow morning our English cinema workshop starts at nine fifteen in room twelve, not room eight. Bring your notebook and headphones.',
    q1: {
      prompt: 'At what time does the workshop start tomorrow?',
      options: ['At 8:15', 'At 9:15', 'At 9:50', 'At 12:00'],
      correctIdx: 1,
      ruleFr: 'Écoutez attentivement les chiffres clés : « nine fifteen » (9h15).'
    },
    q2: {
      prompt: 'Which room will the students meet in?',
      options: ['Room 8', 'Room 10', 'Room 12', 'Room 20'],
      correctIdx: 2,
      ruleFr: 'Repérez la correction négative : « in room twelve, not room eight ».'
    }
  },
  lycee: {
    audioText:
      'Although digital flashcards accelerate initial memorization, linguists agree that balanced fluency requires authentic listening and regular spoken interaction rather than passive screen time.',
    q1: {
      prompt: 'What nuance does the speaker introduce with “Although”?',
      options: [
        'Digital tools are completely useless.',
        'Flashcards help start, but balanced speaking and listening remain essential.',
        'Screens always replace human teachers.',
        'Listening matters less than memorizing lists.'
      ],
      correctIdx: 1,
      ruleFr: '« Although » introduit une concession : un point positif suivi d’une condition indispensable.'
    },
    q2: {
      prompt: 'According to linguists in the audio, what builds balanced fluency?',
      options: [
        'Passive screen time alone',
        'Authentic listening and regular spoken interaction',
        'Translating every word manually',
        'Skipping grammar rules'
      ],
      correctIdx: 1,
      ruleFr: 'Les deux compléments coordonnés après « requires » donnent la réponse exacte.'
    }
  }
};

const READING_PASSAGES = {
  college: {
    title: 'A Morning at Greenwich Observatory',
    text: 'Every Saturday, Maya volunteers at the Science Museum near Greenwich Park. Even though she wakes up at seven, she enjoys guiding young visitors from France and Spain. Last weekend, a group asked her how the Prime Meridian works, and she explained it clearly in English.',
    q1: {
      prompt: 'Why does Maya wake up early on Saturdays?',
      options: [
        'To catch a train to Spain',
        'To volunteer and guide visitors at the museum',
        'Because her school starts at seven',
        'To visit Greenwich Park alone'
      ],
      correctIdx: 1
    },
    q2: {
      prompt: 'What does “Even though she wakes up at seven, she enjoys…” show?',
      options: [
        'She dislikes volunteering.',
        'Waking up early stops her from going.',
        'Despite the early hour, she genuinely loves her role.',
        'She only guides visitors on Sundays.'
      ],
      correctIdx: 2
    }
  },
  lycee: {
    title: 'Urban Sustainability & Youth Initiatives',
    text: 'Across European cities, high school councils have increasingly shaped municipal climate plans. Rather than waiting for top-down regulations, students audit school energy consumption and pitch practical solar micro-projects. Critics initially dismissed these efforts as symbolic, yet measurable drops in electricity usage proved their strategic impact.',
    q1: {
      prompt: 'What contrast is highlighted in the last sentence?',
      options: [
        'Municipal budgets increased rapidly.',
        'Initial skepticism was disproven by concrete energy savings.',
        'Students refused to participate in audits.',
        'Top-down laws were the only factor.'
      ],
      correctIdx: 1
    },
    q2: {
      prompt: 'What does “Rather than waiting for top-down regulations” imply?',
      options: [
        'Students take proactive local initiative.',
        'Students ignore environmental issues.',
        'Regulations forbid solar panels.',
        'City councils banned student projects.'
      ],
      correctIdx: 0
    }
  }
};

const SPEAKING_PROMPTS = {
  college: 'Hello, my name is Alex and I enjoy learning English to travel and speak with new friends.',
  lycee: 'In my opinion, practicing speaking and listening every day is the best way to gain genuine confidence in English.'
};

type StageKey = 'profile' | 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking' | 'results';

export const AdaptivePlacementModal: React.FC<AdaptivePlacementModalProps> = ({
  isOpen,
  user,
  attempts = [],
  onClose,
  onCompleted
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [stage, setStage] = useState<StageKey>('profile');

  // Step 0: Student Profile & Objectives
  const [schoolGrade, setSchoolGrade] = useState<SchoolGrade>(
    user.schoolGrade || inferGradeFromCefr(user.level || 'B1')
  );
  const [ageRange, setAgeRange] = useState<AgeRangeKey>(
    user.ageRange || inferAgeRangeFromGrade(user.schoolGrade || inferGradeFromCefr(user.level || 'B1'))
  );
  const [objectives, setObjectives] = useState<LearningObjectiveId[]>(
    user.learningObjectives && user.learningObjectives.length > 0
      ? user.learningObjectives
      : ['school_excellence', 'oral_fluency']
  );
  const [preferredDuration, setPreferredDuration] = useState<number>(
    user.preferredDurationMinutes || user.stats?.studyMinutesTarget || 20
  );

  // Adaptive Branching Diagnostic States
  const [subStep, setSubStep] = useState<number>(0);
  const [vocabAnswers, setVocabAnswers] = useState<boolean[]>([]);
  const [grammarAnswers, setGrammarAnswers] = useState<boolean[]>([]);
  const [readingAnswers, setReadingAnswers] = useState<boolean[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<boolean[]>([]);
  const [writingText, setWritingText] = useState<string>('');
  const [speakingScoreVal, setSpeakingScoreVal] = useState<number>(72);
  const [speakingTranscript, setSpeakingTranscript] = useState<string>('');
  const [speakingViaMic, setSpeakingViaMic] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [showListeningTranscript, setShowListeningTranscript] = useState<boolean>(false);
  const [audioRate, setAudioRate] = useState<number>(1.0);
  const [feedbackBanner, setFeedbackBanner] = useState<{ correct: boolean; text: string } | null>(null);
  const [savedResult, setSavedResult] = useState<{
    result: PlacementTestResult;
    updatedUser: UserProfile;
    signals: ReturnType<typeof computeMultiSignalCefr>;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  const gradeMeta = useMemo(() => getGradeMeta(schoolGrade), [schoolGrade]);
  const isLycee = gradeMeta.cycle === 'Lycée';

  const speechApiSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  const toggleObjective = (objId: LearningObjectiveId) => {
    playSelectCue();
    setObjectives((prev) => {
      if (prev.includes(objId)) {
        return prev.length > 1 ? prev.filter((id) => id !== objId) : prev;
      }
      return [...prev, objId].slice(0, 6);
    });
  };

  const handleGradePick = (g: SchoolGrade) => {
    playSelectCue();
    setSchoolGrade(g);
    setAgeRange(inferAgeRangeFromGrade(g));
  };

  const activeVocabQuestion: McqItem =
    subStep === 0
      ? VOCAB_QUESTIONS.core
      : vocabAnswers[0]
      ? VOCAB_QUESTIONS.stretch
      : VOCAB_QUESTIONS.scaffold;

  const activeGrammarQuestion: McqItem =
    subStep === 0
      ? GRAMMAR_QUESTIONS.core
      : grammarAnswers[0]
      ? GRAMMAR_QUESTIONS.stretch
      : GRAMMAR_QUESTIONS.scaffold;

  const activeReading = isLycee ? READING_PASSAGES.lycee : READING_PASSAGES.college;
  const activeListening = isLycee ? LISTENING_SCRIPTS.lycee : LISTENING_SCRIPTS.college;
  const speakingTargetPrompt = isLycee ? SPEAKING_PROMPTS.lycee : SPEAKING_PROMPTS.college;

  const advanceAfterMcq = (
    item: McqItem,
    selectedIdx: number,
    stageSetter: React.Dispatch<React.SetStateAction<boolean[]>>,
    nextStage: StageKey
  ) => {
    if (feedbackBanner) return;
    const isCorrect = selectedIdx === item.correctIdx;
    if (isCorrect) playCorrectCue();
    else playIncorrectCue();

    stageSetter((prev) => [...prev, isCorrect]);
    setFeedbackBanner({ correct: isCorrect, text: item.ruleFr });

    setTimeout(() => {
      setFeedbackBanner(null);
      if (subStep === 0) {
        setSubStep(1);
      } else {
        setSubStep(0);
        setStage(nextStage);
      }
    }, 950);
  };

  const advanceReadingOrListening = (
    selectedIdx: number,
    correctIdx: number,
    ruleText: string,
    stageSetter: React.Dispatch<React.SetStateAction<boolean[]>>,
    nextStage: StageKey
  ) => {
    if (feedbackBanner) return;
    const isCorrect = selectedIdx === correctIdx;
    if (isCorrect) playCorrectCue();
    else playIncorrectCue();

    stageSetter((prev) => [...prev, isCorrect]);
    setFeedbackBanner({ correct: isCorrect, text: ruleText });

    setTimeout(() => {
      setFeedbackBanner(null);
      if (subStep === 0) {
        setSubStep(1);
      } else {
        setSubStep(0);
        setStage(nextStage);
      }
    }, 950);
  };

  const evaluateWritingScore = (text: string): number => {
    const clean = text.trim();
    if (!clean) return 35;
    const words = clean.split(/\s+/).filter(Boolean);
    let score = 42;
    if (words.length >= 6) score += 14;
    if (words.length >= 12) score += 14;
    if (words.length >= 18) score += 8;
    const lower = clean.toLowerCase();
    const connectors = ['because', 'although', 'however', 'therefore', 'since', 'moreover', 'while', 'and', 'for example', 'firstly', 'so'];
    const hits = connectors.filter((c) => lower.includes(c)).length;
    score += Math.min(14, hits * 5);
    if (/^[A-Z]/.test(clean) && /[.!?]$/.test(clean)) score += 8;
    return Math.max(30, Math.min(98, score));
  };

  const startVoiceAssessment = () => {
    if (!speechApiSupported || isListeningMic) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setIsListeningMic(true);

    recognition.onresult = (event: any) => {
      const transcript: string = event.results?.[0]?.[0]?.transcript || '';
      setSpeakingTranscript(transcript);
      setSpeakingViaMic(true);

      const targetWords = speakingTargetPrompt.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      const spokenWords = transcript.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      const matched = targetWords.filter((w) => spokenWords.includes(w)).length;
      const ratio = matched / Math.max(1, targetWords.length);
      const computed = Math.max(45, Math.min(98, Math.round(45 + ratio * 53)));
      setSpeakingScoreVal(computed);
      playCorrectCue();
      setIsListeningMic(false);
    };

    recognition.onerror = () => {
      setIsListeningMic(false);
    };

    recognition.onend = () => {
      setIsListeningMic(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  const finalizeDiagnostic = async (finalSpeakingScore: number, usedMic: boolean) => {
    if (isSaving) return;
    setIsSaving(true);
    stopSpeech();

    const calcBandScore = (arr: boolean[], baseWeight: number) => {
      if (arr.length === 0) return 55;
      const hits = arr.filter(Boolean).length;
      return Math.min(98, Math.round(35 + (hits / arr.length) * baseWeight));
    };

    const vocabPct = calcBandScore(vocabAnswers, vocabAnswers[0] ? 62 : 50);
    const grammarPct = calcBandScore(grammarAnswers, grammarAnswers[0] ? 62 : 50);
    const readingPct = calcBandScore(readingAnswers, 60);
    const listeningPct = calcBandScore(listeningAnswers, 60);
    const writingPct = evaluateWritingScore(writingText);
    const speakingPct = finalSpeakingScore;

    const skillScores: PlacementSkillBreakdown = {
      vocabulary: vocabPct,
      grammar: grammarPct,
      reading: readingPct,
      listening: listeningPct,
      writing: writingPct,
      speaking: speakingPct
    };

    const overallScore = Math.round(
      (vocabPct + grammarPct + readingPct + listeningPct + writingPct + speakingPct) / 6
    );

    const estimatedCefr: CEFRLevel =
      overallScore >= 90
        ? 'C2'
        : overallScore >= 80
        ? 'C1'
        : overallScore >= 68
        ? 'B2'
        : overallScore >= 54
        ? 'B1'
        : overallScore >= 40
        ? 'A2'
        : 'A1';

    const weaknessesList: string[] = [];
    if (grammarPct < 65) weaknessesList.push('Grammaire & concordance des temps');
    if (vocabPct < 65) weaknessesList.push('Vocabulaire & collocations');
    if (listeningPct < 65) weaknessesList.push('Compréhension orale rapide');
    if (readingPct < 65) weaknessesList.push('Inférence & lecture analytique');
    if (writingPct < 65) weaknessesList.push('Expression écrite & connecteurs');
    if (speakingPct < 65) weaknessesList.push('Fluidité orale & intonation');
    if (weaknessesList.length === 0) {
      weaknessesList.push('Nuances idiomatiques C1/C2');
    }

    const recommendedTrack =
      overallScore < 60 ? 'scaffolded' : overallScore >= 82 ? 'accelerated' : 'balanced';

    const draftPlacement: PlacementTestResult = {
      completedAt: new Date().toISOString(),
      estimatedCefr,
      compositeCefr: estimatedCefr,
      confidenceScore: 75,
      overallScore,
      signalsCount: 1,
      skillScores,
      identifiedWeaknesses: weaknessesList.slice(0, 4),
      recommendedTrack,
      speakingAssessedViaMic: usedMic
    };

    const flashcards = await getStoredFlashcardProgressList();
    const cityProg = getCityMapProgression();

    const tempUser: UserProfile = {
      ...user,
      schoolGrade,
      ageRange,
      learningObjectives: objectives,
      preferredDurationMinutes: preferredDuration,
      placementTest: draftPlacement
    };

    const multiSignal = computeMultiSignalCefr(tempUser, attempts, flashcards, cityProg);
    const finalPlacement: PlacementTestResult = {
      ...draftPlacement,
      compositeCefr: multiSignal.compositeCefr,
      confidenceScore: multiSignal.confidenceScore,
      signalsCount: multiSignal.signalsCount
    };

    tempUser.level = multiSignal.compositeCefr;
    tempUser.placementTest = finalPlacement;

    const fullEval = evaluateAdaptiveLearning(tempUser, attempts, flashcards, cityProg);

    const updated = await updateUserProfile({
      level: multiSignal.compositeCefr,
      schoolGrade,
      ageRange,
      learningObjectives: objectives,
      preferredDurationMinutes: preferredDuration,
      placementTest: finalPlacement,
      adaptiveProfile: fullEval.profile,
      stats: {
        ...user.stats,
        studyMinutesTarget: preferredDuration
      }
    });

    await recordAttempt({
      moduleId: `placement-${Date.now()}`,
      moduleType: 'quiz',
      title: `Test de Placement Multi-Signaux (${schoolGrade} · ${multiSignal.compositeCefr})`,
      level: multiSignal.compositeCefr,
      score: overallScore,
      durationSeconds: 180,
      details: {
        placement: true,
        signalsCount: multiSignal.signalsCount
      }
    });

    playVictoryCue();
    setSavedResult({ result: finalPlacement, updatedUser: updated, signals: multiSignal });
    setStage('results');
    setIsSaving(false);
    onCompleted?.(updated, 120);
  };

  const stagesOrder: StageKey[] = ['profile', 'vocab', 'grammar', 'reading', 'listening', 'writing', 'speaking', 'results'];
  const stageIdx = stagesOrder.indexOf(stage);
  const progressPct = Math.round((stageIdx / (stagesOrder.length - 1)) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="placement-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] rounded-3xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="px-5 py-4 bg-[#151b2b] border-b border-[#232a3a] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
              Moteur d&apos;Apprentissage Adaptatif • 6 Pôles
            </span>
            <h2 id="placement-modal-title" className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] truncate">
              Profil Élève &amp; Test de Placement Multi-Signaux
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#191f2f] border border-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        {/* Progress Bar */}
        <div className="px-5 py-2 bg-[#070e1d] border-b border-[#232a3a]/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1 h-1.5 rounded-full bg-[#191f2f] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] transition-all duration-300"
              style={{ width: `${Math.max(8, progressPct)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#f2ca50] font-bold tabular-nums shrink-0">
            Étape {stageIdx + 1}/{stagesOrder.length}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <AnimatePresence mode="wait">
            {stage === 'profile' && (
              <motion.div
                key="stage-profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* School Grade */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                    1. Votre Classe Actuelle (Collège &amp; Lycée)
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {SCHOOL_GRADES_META.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGradePick(g.id)}
                        className={`py-2 px-1 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          schoolGrade === g.id
                            ? 'bg-[#f2ca50] text-[#3c2f00] border-[#ffe088] shadow'
                            : 'bg-[#151b2b] text-[#d0c5af] border-[#232a3a] hover:border-[#f2ca50]/45'
                        }`}
                      >
                        {g.shortLabel}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#99907c]">{gradeMeta.focusSummary}</p>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                    2. Tranche d&apos;Âge
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AGE_RANGES_META.map((age) => (
                      <button
                        key={age.id}
                        type="button"
                        onClick={() => {
                          playSelectCue();
                          setAgeRange(age.id);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          ageRange === age.id
                            ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#ffe088]'
                            : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
                        }`}
                      >
                        <div className="text-xs font-bold">{age.label}</div>
                        <div className="text-[10px] text-[#99907c]">{age.bracket}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                    3. Objectifs d&apos;Apprentissage (Multi-choix)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LEARNING_OBJECTIVES_META.map((obj) => {
                      const active = objectives.includes(obj.id);
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => toggleObjective(obj.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                            active
                              ? 'bg-[#f2ca50]/12 border-[#f2ca50] text-[#dce2f8]'
                              : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-lg shrink-0 ${active ? 'text-[#f2ca50]' : 'text-[#99907c]'}`}>
                            {obj.icon}
                          </span>
                          <div>
                            <div className="text-xs font-bold">{obj.label}</div>
                            <div className="text-[11px] text-[#99907c] leading-snug">{obj.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Learning Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                    4. Durée Quotidienne Préférée
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERRED_DURATIONS.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          playSelectCue();
                          setPreferredDuration(mins);
                        }}
                        className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          preferredDuration === mins
                            ? 'bg-[#f2ca50] text-[#3c2f00] border-[#ffe088]'
                            : 'bg-[#151b2b] text-[#d0c5af] border-[#232a3a]'
                        }`}
                      >
                        {mins} min / jour
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSelectCue();
                      setSubStep(0);
                      setStage('vocab');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Démarrer le Diagnostic Multi-Signaux (3 min)</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            )}

            {(stage === 'vocab' || stage === 'grammar') && (
              <motion.div
                key={`stage-${stage}-${subStep}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {(() => {
                  const item = stage === 'vocab' ? activeVocabQuestion : activeGrammarQuestion;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#191f2f] border border-[#f2ca50]/40 text-[10px] font-mono font-bold text-[#f2ca50] uppercase">
                          {stage === 'vocab' ? 'Pôle 1 · Vocabulaire' : 'Pôle 2 · Grammaire'} · Question {subStep + 1}/2
                        </span>
                        <span className="text-[11px] font-mono text-[#99907c]">
                          {item.tier === 'stretch' ? '↑ Niveau Relevé' : item.tier === 'scaffold' ? '↓ Consolidation Guidée' : 'Calibrage Initial'}
                        </span>
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8]">{item.prompt}</h3>
                      {item.context && (
                        <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] font-serif text-base text-[#f2ca50] italic">
                          {item.context}
                        </div>
                      )}

                      <div className="space-y-2">
                        {item.options.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={Boolean(feedbackBanner)}
                            onClick={() =>
                              stage === 'vocab'
                                ? advanceAfterMcq(item, idx, setVocabAnswers, 'grammar')
                                : advanceAfterMcq(item, idx, setGrammarAnswers, 'reading')
                            }
                            className="w-full p-3.5 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-[#2e3545] hover:border-[#f2ca50]/60 text-left text-sm text-[#dce2f8] font-medium flex items-center gap-3 transition-all cursor-pointer"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#0c1322] border border-[#f2ca50]/40 text-[#f2ca50] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {stage === 'reading' && (
              <motion.div
                key={`stage-reading-${subStep}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#191f2f] border border-sky-400/40 text-[10px] font-mono font-bold text-sky-300 uppercase">
                    Pôle 3 · Compréhension Écrite (Reading) · {subStep + 1}/2
                  </span>
                  <span className="text-[11px] font-mono text-[#99907c]">{gradeMeta.cycle}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#f2ca50]">{activeReading.title}</h4>
                  <p className="text-xs sm:text-sm text-[#dce2f8] leading-relaxed">{activeReading.text}</p>
                </div>

                {(() => {
                  const q = subStep === 0 ? activeReading.q1 : activeReading.q2;
                  return (
                    <div className="space-y-2.5">
                      <h3 className="font-serif text-base font-bold text-[#dce2f8]">{q.prompt}</h3>
                      {q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={Boolean(feedbackBanner)}
                          onClick={() =>
                            advanceReadingOrListening(
                              idx,
                              q.correctIdx,
                              'Astuce lecture : repérez les connecteurs d’opposition et les verbes principaux.',
                              setReadingAnswers,
                              'listening'
                            )
                          }
                          className="w-full p-3.5 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-[#2e3545] hover:border-[#f2ca50]/60 text-left text-sm text-[#dce2f8] flex items-center gap-3 cursor-pointer"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#0c1322] border border-sky-400/40 text-sky-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {stage === 'listening' && (
              <motion.div
                key={`stage-listening-${subStep}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#191f2f] border border-rose-400/40 text-[10px] font-mono font-bold text-rose-300 uppercase">
                    Pôle 4 · Compréhension Orale (Listening) · {subStep + 1}/2
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#151b2b] border border-rose-500/35 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        speakText(activeListening.audioText, 'en-GB', 'placement-listening', {
                          rate: audioRate,
                          naturalProsody: true
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">volume_up</span>
                      <span>Écouter l&apos;Audio ({audioRate}x)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudioRate((r) => (r === 1.0 ? 0.85 : 1.0))}
                      className="px-3 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs font-mono text-[#d0c5af] hover:text-[#f2ca50] cursor-pointer"
                    >
                      Vitesse : {audioRate === 1.0 ? 'Normale (1.0x)' : 'Lente (0.85x)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowListeningTranscript((v) => !v)}
                      className="px-3 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs text-[#99907c] hover:text-[#dce2f8] cursor-pointer"
                    >
                      {showListeningTranscript ? 'Masquer script' : 'Audio indisponible ? Lire'}
                    </button>
                  </div>

                  {showListeningTranscript && (
                    <p className="text-xs text-[#d0c5af] italic bg-[#0c1322] p-3 rounded-xl border border-[#232a3a]">
                      {activeListening.audioText}
                    </p>
                  )}
                </div>

                {(() => {
                  const q = subStep === 0 ? activeListening.q1 : activeListening.q2;
                  return (
                    <div className="space-y-2.5">
                      <h3 className="font-serif text-base font-bold text-[#dce2f8]">{q.prompt}</h3>
                      {q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={Boolean(feedbackBanner)}
                          onClick={() =>
                            advanceReadingOrListening(idx, q.correctIdx, q.ruleFr, setListeningAnswers, 'writing')
                          }
                          className="w-full p-3.5 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-[#2e3545] hover:border-[#f2ca50]/60 text-left text-sm text-[#dce2f8] flex items-center gap-3 cursor-pointer"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#0c1322] border border-rose-400/40 text-rose-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {stage === 'writing' && (
              <motion.div
                key="stage-writing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <span className="px-2.5 py-1 rounded-full bg-[#191f2f] border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-300 uppercase">
                  Pôle 5 · Expression Écrite (Writing)
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8]">
                  {isLycee
                    ? 'Write 2–3 sentences explaining why learning English matters for your future, using at least one connector (because, although, however).'
                    : 'Write 1–2 sentences in English about a hobby or place you like, using “because” or “and”.'}
                </h3>
                <textarea
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  rows={4}
                  placeholder={
                    isLycee
                      ? 'Example: I practice English every week because I want to study abroad; however, speaking fast remains a fun challenge.'
                      : 'Example: I love reading adventure stories in English because I discover new words every day.'
                  }
                  className="w-full p-3.5 rounded-xl bg-[#151b2b] border border-[#2e3545] focus:border-[#f2ca50] outline-none text-sm text-[#dce2f8] placeholder-[#99907c]/70"
                />
                <div className="flex items-center justify-between text-xs text-[#99907c]">
                  <span>Mots saisis : {writingText.trim() ? writingText.trim().split(/\s+/).length : 0}</span>
                  <span>Évaluation : richesse lexicale, connecteurs logiques &amp; ponctuation</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSelectCue();
                    setStage('speaking');
                  }}
                  className="w-full py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Valider et Passer à l&apos;Oral (Speaking) →
                </button>
              </motion.div>
            )}

            {stage === 'speaking' && (
              <motion.div
                key="stage-speaking"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <span className="px-2.5 py-1 rounded-full bg-[#191f2f] border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300 uppercase">
                  Pôle 6 · Expression Orale (Speaking)
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8]">
                  Lisez cette phrase à voix haute (ou choisissez l&apos;auto-évaluation orale si micro indisponible) :
                </h3>
                <div className="p-4 rounded-xl bg-[#151b2b] border border-[#f2ca50]/40 space-y-3">
                  <p className="font-serif text-base text-[#f2ca50] italic">« {speakingTargetPrompt} »</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => speakText(speakingTargetPrompt, 'en-GB', 'placement-speak-model', { naturalProsody: true })}
                      className="px-3.5 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs font-semibold text-[#dce2f8] hover:border-[#f2ca50]/60 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-[#f2ca50]">volume_up</span>
                      <span>Écouter Modèle</span>
                    </button>

                    {speechApiSupported && (
                      <button
                        type="button"
                        onClick={startVoiceAssessment}
                        disabled={isListeningMic}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                          isListeningMic
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">mic</span>
                        <span>{isListeningMic ? 'Écoute en cours…' : 'Parler au Micro'}</span>
                      </button>
                    )}
                  </div>
                  {speakingTranscript && (
                    <div className="p-2.5 rounded-lg bg-[#0c1322] border border-emerald-500/40 text-xs text-emerald-300">
                      Transcription captée : « {speakingTranscript} » — Score oral estimé : <strong>{speakingScoreVal}%</strong>
                    </div>
                  )}
                </div>

                {!speakingViaMic && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-[#d4c78f]">
                      Auto-calibrage de votre aisance orale actuelle :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Débutant / Hésitant', score: 48 },
                        { label: 'Intermédiaire / Correct', score: 72 },
                        { label: 'Fluide / À l’aise', score: 90 }
                      ].map((opt) => (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => {
                            playSelectCue();
                            setSpeakingScoreVal(opt.score);
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                            speakingScoreVal === opt.score
                              ? 'bg-[#f2ca50] text-[#3c2f00] border-[#ffe088]'
                              : 'bg-[#151b2b] text-[#d0c5af] border-[#232a3a]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => finalizeDiagnostic(speakingScoreVal, speakingViaMic)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  {isSaving ? 'Calcul Multi-Signaux en cours…' : 'Calculer Mon Parcours Adaptatif Complet ✨'}
                </button>
              </motion.div>
            )}

            {stage === 'results' && savedResult && (
              <motion.div
                key="stage-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#0c1322] border border-[#f2ca50]/55 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#f2ca50]">
                      Synthèse Multi-Signaux ({savedResult.signals.signalsCount} sources croisées)
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#dce2f8] mt-0.5">
                      Niveau Composite : {savedResult.result.compositeCefr} · Confiance {savedResult.signals.confidenceScore}%
                    </h3>
                    <p className="text-xs text-[#d0c5af] mt-0.5">
                      Profil sauvegardé : {gradeMeta.label} · {preferredDuration} min/jour · Track{' '}
                      <strong className="text-[#f2ca50]">
                        {savedResult.result.recommendedTrack === 'scaffolded'
                          ? 'Soutien Progressif'
                          : savedResult.result.recommendedTrack === 'accelerated'
                          ? 'Défi Excellence'
                          : 'Équilibré'}
                      </strong>
                    </p>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-mono font-black text-lg">
                    {savedResult.result.overallScore}%
                  </div>
                </div>

                {/* Multi-signal provenance list */}
                <div className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] space-y-2">
                  <div className="text-[10px] font-mono uppercase font-bold text-[#d4c78f]">
                    Signaux Croisés (Jamais un seul quiz isolé)
                  </div>
                  <div className="space-y-1.5">
                    {savedResult.signals.signalSummaries.map((sig, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#dce2f8] font-medium truncate">{sig.source}</span>
                        <span className="font-mono text-[#f2ca50] shrink-0">
                          {sig.cefrEstimate} ({sig.weightPct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6 Skills Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      ['Vocabulaire', savedResult.result.skillScores.vocabulary],
                      ['Grammaire', savedResult.result.skillScores.grammar],
                      ['Reading', savedResult.result.skillScores.reading],
                      ['Listening', savedResult.result.skillScores.listening],
                      ['Writing', savedResult.result.skillScores.writing],
                      ['Speaking', savedResult.result.skillScores.speaking]
                    ] as Array<[string, number]>
                  ).map(([label, score]) => (
                    <div key={label} className="p-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#d0c5af] font-semibold">{label}</span>
                        <span className="font-mono font-bold text-[#f2ca50]">{score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
                        <div className="h-full bg-[#f2ca50]" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/35 text-xs text-emerald-200">
                  <strong>Axes détectés &amp; intégrés partout :</strong>{' '}
                  {savedResult.result.identifiedWeaknesses.join(' · ')}. Votre Cursus, vos Jeux et votre Atelier sont désormais calibrés automatiquement (+120 XP).
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Appliquer à Toute l&apos;Application ✓
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {feedbackBanner && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                feedbackBanner.correct
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
              }`}
            >
              <strong>{feedbackBanner.correct ? '✓ Exact ! ' : '💡 Règle & Repère : '}</strong>
              {feedbackBanner.text}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
