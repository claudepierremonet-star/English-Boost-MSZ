import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  CEFRLevel,
  LearningAttempt,
  SchoolGrade,
  SkillKey,
  TutorConversationMode,
  TutorCorrectionItem,
  TutorSavedNote,
  TutorSessionSummary,
  TutorWeaknessRecord,
  UserProfile
} from '../firebase/types';
import {
  getTutorSessionsAndWeaknesses,
  getUserLearningAttempts,
  recordAttempt,
  recordTutorWeaknesses,
  saveTutorSessionAndWeaknesses,
  saveValidatedTutorNote
} from '../firebase/client';
import { getGradeMeta, SKILL_META } from '../services/adaptiveEngine';
import { speakText, stopSpeech } from '../services/speechService';
import { getErrorJournal, type ErrorJournalItem } from '../utils/errorJournal';
import {
  compareOrthographyAndPhonetics,
  isSpeechRecognitionAvailable,
  SpeechRecognitionController
} from '../utils/speechRecognitionHelper';
import {
  buildModeStarterText,
  getTutorModeConfig,
  TUTOR_CONVERSATION_MODES,
  TUTOR_MISTAKE_CATEGORY_META
} from '../data/tutorModes';
import { TutorWaveform } from './TutorWaveform';
import professorAvatarImg from '../assets/images/ai_tutor_teacher_avatar_1795304960803.jpg';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  schoolGrade: SchoolGrade;
  cefrLevel: CEFRLevel;
  weakestSkills?: SkillKey[];
  onXpEarned?: (xp: number) => void;
  onProfileUpdated?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  textEn: string;
  praiseNote?: string;
  frenchSupport?: string;
  usedFrenchHelp?: boolean;
  corrections?: TutorCorrectionItem[];
  vocabularyBoost?: Array<{ term: string; phonetic: string; translationFr: string }>;
  pronunciationCoach?: string;
  followUpQuestion?: string;
  suggestedReplies?: string[];
  fluencyScoreEstimate?: number;
  voiceUsed?: boolean;
  pronunciationAccuracy?: number;
}

interface WritingFeedbackResult {
  score: number;
  cefrEstimate: string;
  correctedText: string;
  strengthsFr: string[];
  improvementsFr: string[];
  keyGrammarPointFr: string;
  encouragementFr: string;
}

interface GeneratedDrillResult {
  title: string;
  focusSkill: string;
  cefrLevel: string;
  schoolGrade: string;
  targetedWeaknessesCount?: number;
  explanationFr: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanationFr: string;
    sampleSentenceEn: string;
  }>;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  user,
  schoolGrade,
  cefrLevel,
  weakestSkills = ['grammar', 'writing'],
  onXpEarned,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'writing' | 'drill' | 'history'>('chat');
  const [mobileChatPane, setMobileChatPane] = useState<'thread' | 'feedback'>('thread');
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [teachingLang, setTeachingLang] = useState<'english_default' | 'bilingual_fr'>('english_default');
  const [autoVoice, setAutoVoice] = useState<boolean>(true);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  // Conversation mode state (9 required modes)
  const [conversationMode, setConversationMode] = useState<TutorConversationMode>('free_conversation');

  const gradeMeta = getGradeMeta(schoolGrade);
  const weakLabels = useMemo(
    () => weakestSkills.map((s) => SKILL_META[s]?.labelEn || s),
    [weakestSkills]
  );

  // Personalized Student Diagnostic Context (Test results, vocab weaknesses, recurring mistakes)
  const [recentAttempts, setRecentAttempts] = useState<LearningAttempt[]>([]);
  const [vocabErrors, setVocabErrors] = useState<ErrorJournalItem[]>([]);
  const [persistedSessions, setPersistedSessions] = useState<TutorSessionSummary[]>([]);
  const [trackedWeaknesses, setTrackedWeaknesses] = useState<TutorWeaknessRecord[]>(
    () => (Array.isArray(user.tutorWeaknesses) ? user.tutorWeaknesses : [])
  );

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedFeedbackMsgId, setSelectedFeedbackMsgId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [struggleCount, setStruggleCount] = useState<number>(0);
  const [sessionStartMs, setSessionStartMs] = useState<number>(() => Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice Interaction & Live Waveform state
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveBars, setLiveBars] = useState<number[]>([16, 22, 18, 28, 24, 30, 20, 26, 18, 24]);
  const [liveInterim, setLiveInterim] = useState<string>('');
  const [voiceModeLastUsed, setVoiceModeLastUsed] = useState<boolean>(false);
  const [practiceTargetText, setPracticeTargetText] = useState<string | null>(null);
  const [pendingSpeechTelemetry, setPendingSpeechTelemetry] = useState<{
    accuracyScore: number;
    missedWords: string[];
    phoneticTips: string[];
  } | null>(null);

  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecRef = useRef<SpeechRecognitionController | null>(null);
  const recordedBaseTextRef = useRef<string>('');

  // Session Summary state
  const [sessionSummary, setSessionSummary] = useState<TutorSessionSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Writing Lab state
  const [writingTopic, setWritingTopic] = useState(
    cefrLevel === 'A1' || cefrLevel === 'A2'
      ? 'Describe your favourite weekend activity or hobby in 5-6 clear sentences.'
      : 'How can technology help students become confident global communicators? Give two clear reasons.'
  );
  const [writingText, setWritingText] = useState('');
  const [writingResult, setWritingResult] = useState<WritingFeedbackResult | null>(null);
  const [isWritingLoading, setIsWritingLoading] = useState(false);
  const [writingError, setWritingError] = useState<string | null>(null);

  // Adaptive Drill state
  const [drillSkill, setDrillSkill] = useState<'grammar' | 'vocabulary' | 'reading' | 'writing' | 'structure'>('grammar');
  const [drillTopic, setDrillTopic] = useState('');
  const [drillData, setDrillData] = useState<GeneratedDrillResult | null>(null);
  const [drillAnswers, setDrillAnswers] = useState<Record<number, number>>({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [isDrillLoading, setIsDrillLoading] = useState(false);
  const [drillError, setDrillError] = useState<string | null>(null);

  // Toast
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const savedNotes: TutorSavedNote[] = Array.isArray(user.tutorSavedNotes) ? user.tutorSavedNotes : [];

  const recentTestAvg = useMemo(() => {
    if (recentAttempts.length === 0) return undefined;
    const valid = recentAttempts.filter((a) => typeof a.score === 'number');
    if (valid.length === 0) return undefined;
    return Math.round(valid.reduce((sum, a) => sum + a.score, 0) / valid.length);
  }, [recentAttempts]);

  const studentDiagnosticContext = useMemo(() => {
    const activeVocab = vocabErrors.filter((e) => !e.resolved).slice(0, 6);
    const strongLabels = (user.adaptiveProfile?.strongestSkills || []).map((s) => SKILL_META[s]?.labelEn || s);
    return {
      recentTestAvg,
      recentModules: recentAttempts.slice(0, 4).map((a) => `${a.title} (${a.score}%)`),
      vocabWeaknesses: activeVocab.map((v) => `${v.term} (${v.translationFr})`),
      recurringMistakes: trackedWeaknesses
        .slice(0, 6)
        .map((w) => `[${w.category}] "${w.originalSample}" -> "${w.correctedForm}" (${w.occurrences}x)`),
      strongestSkills: strongLabels
    };
  }, [recentAttempts, recentTestAvg, vocabErrors, trackedWeaknesses, user.adaptiveProfile]);

  const cleanupVoiceHardware = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    if (speechRecRef.current) {
      speechRecRef.current.abort();
      speechRecRef.current = null;
    }
    setIsRecording(false);
    setLiveInterim('');
  };

  // Load student diagnostic history when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsTtsPlaying(false);
      cleanupVoiceHardware();
      return;
    }

    setSpeechSupported(isSpeechRecognitionAvailable());

    let cancelled = false;
    (async () => {
      try {
        const [{ attempts }, tutorHistory] = await Promise.all([
          getUserLearningAttempts(user.uid, 30),
          getTutorSessionsAndWeaknesses(user.uid)
        ]);
        if (cancelled) return;
        setRecentAttempts(attempts);
        setPersistedSessions(tutorHistory.sessions);
        if (tutorHistory.weaknesses.length > 0) {
          setTrackedWeaknesses(tutorHistory.weaknesses);
        } else if (Array.isArray(user.tutorWeaknesses)) {
          setTrackedWeaknesses(user.tutorWeaknesses);
        }
      } catch (e) {
        console.warn('Could not load student history for AI Tutor:', e);
      }
      try {
        setVocabErrors(getErrorJournal());
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user.uid, user.tutorWeaknesses]);

  // Initialize or reset starter greeting when mode changes cleanly (if no messages yet)
  useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) {
      const starter = buildModeStarterText(
        conversationMode,
        cefrLevel,
        gradeMeta.shortLabel,
        weakLabels,
        trackedWeaknesses.length
      );
      const welcomeMsg: ChatMessage = {
        id: `welcome-${conversationMode}`,
        role: 'tutor',
        textEn: starter.replyEn,
        praiseNote: starter.praiseNote,
        followUpQuestion: starter.followUpQuestion,
        suggestedReplies: starter.suggestedReplies,
        corrections: []
      };
      setMessages([welcomeMsg]);
      setSelectedFeedbackMsgId(welcomeMsg.id);
      setSessionStartMs(Date.now());
    }
  }, [isOpen, conversationMode, cefrLevel, gradeMeta.shortLabel, weakLabels, trackedWeaknesses.length, messages.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3200);
  };

  const playTutorVoice = (text: string, msgId: string, slow = false) => {
    if (!text.trim()) return;
    speakText(text, accent, msgId, {
      naturalProsody: true,
      rateMultiplier: slow ? 0.76 : 1.0,
      onStart: () => setIsTtsPlaying(true),
      onEnd: () => setIsTtsPlaying(false),
      onError: () => setIsTtsPlaying(false)
    });
  };

  const handleSwitchMode = (nextMode: TutorConversationMode) => {
    if (nextMode === conversationMode) return;
    stopSpeech();
    setIsTtsPlaying(false);
    cleanupVoiceHardware();
    setConversationMode(nextMode);
    setSessionSummary(null);
    setSummaryError(null);
    setChatError(null);
    setPracticeTargetText(null);
    setPendingSpeechTelemetry(null);
    setStruggleCount(0);

    const starter = buildModeStarterText(
      nextMode,
      cefrLevel,
      gradeMeta.shortLabel,
      weakLabels,
      trackedWeaknesses.length
    );
    const welcomeMsg: ChatMessage = {
      id: `welcome-${nextMode}-${Date.now()}`,
      role: 'tutor',
      textEn: starter.replyEn,
      praiseNote: starter.praiseNote,
      followUpQuestion: starter.followUpQuestion,
      suggestedReplies: starter.suggestedReplies,
      corrections: []
    };
    setMessages([welcomeMsg]);
    setSelectedFeedbackMsgId(welcomeMsg.id);
    setSessionStartMs(Date.now());
  };

  // Start real-time voice recording + live frequency waveform (Fluency-First: never interrupts!)
  const handleStartVoice = async (targetPhrase?: string) => {
    stopSpeech();
    setIsTtsPlaying(false);
    setMicError(null);

    if (targetPhrase) {
      setPracticeTargetText(targetPhrase);
      setChatInput('');
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone access is unavailable in this browser. You can type your response below anytime.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;
      recordedBaseTextRef.current = targetPhrase ? '' : chatInput.trim();
      setVoiceModeLastUsed(true);

      // Web Audio API AnalyserNode for live animated waveform
      try {
        const AudioCtx =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        const tickWave = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(freqData);
          const step = Math.max(1, Math.floor(freqData.length / 10));
          const bars: number[] = [];
          for (let i = 0; i < 10; i++) {
            const raw = freqData[i * step] || 12;
            bars.push(Math.max(10, Math.min(50, Math.round((raw / 255) * 48) + 8)));
          }
          setLiveBars(bars);
          animFrameRef.current = requestAnimationFrame(tickWave);
        };
        animFrameRef.current = requestAnimationFrame(tickWave);
      } catch (audioErr) {
        console.warn('AudioContext visualizer warning:', audioErr);
      }

      // SpeechRecognitionController for real-time English speech-to-text
      if (isSpeechRecognitionAvailable()) {
        const recognizer = new SpeechRecognitionController(accent);
        speechRecRef.current = recognizer;
        recognizer.onTranscriptChange = (finalTxt, interimTxt) => {
          const combined = [recordedBaseTextRef.current, finalTxt].filter(Boolean).join(' ').trim();
          setChatInput(combined);
          setLiveInterim(interimTxt);
        };
        recognizer.onStatusChange = (status, errMsg) => {
          if (status === 'error' && errMsg) {
            setMicError(`${errMsg} Type below as an instant fallback.`);
          }
        };
        recognizer.start();
      } else {
        setSpeechSupported(false);
        setMicError('Live speech transcription is unavailable in this browser. Use the text box below.');
      }

      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access denied:', err);
      setMicError('Microphone permission denied or no mic detected. Full text interaction remains active below.');
      cleanupVoiceHardware();
    }
  };

  const handleStopVoice = (autoSendIfReady = false) => {
    let spokenResult = chatInput.trim();
    if (speechRecRef.current) {
      const recText = speechRecRef.current.stop();
      const merged = [recordedBaseTextRef.current, recText].filter(Boolean).join(' ').trim();
      if (merged) {
        spokenResult = merged;
        setChatInput(merged);
      }
    }

    let computedTelemetry: { accuracyScore: number; missedWords: string[]; phoneticTips: string[] } | null = null;
    if (practiceTargetText && spokenResult) {
      const report = compareOrthographyAndPhonetics(spokenResult, practiceTargetText, accent);
      const missedWords = report.tokens
        .filter((t) => t.status === 'misspelled' || t.status === 'omitted')
        .map((t) => t.expected || t.word)
        .filter(Boolean);
      const phoneticTips = [
        ...report.pitfalls.slice(0, 2).map((p) => `${p.word} (${accent === 'en-GB' ? p.phoneticUk : p.phoneticUs}): ${p.remedy}`),
        ...report.tokens
          .filter((t) => t.status !== 'correct' && t.phoneticTip)
          .slice(0, 2)
          .map((t) => `${t.expected || t.word}: ${t.phoneticTip}`)
      ].slice(0, 4);
      computedTelemetry = {
        accuracyScore: report.overallScore,
        missedWords,
        phoneticTips
      };
      setPendingSpeechTelemetry(computedTelemetry);
    }

    cleanupVoiceHardware();

    if (autoSendIfReady && spokenResult.length >= 2) {
      handleSendChat(spokenResult, {
        voiceUsed: true,
        speechReport: computedTelemetry
      });
    }
  };

  const handleSendChat = async (
    customText?: string,
    opts?: {
      forceFrench?: boolean;
      voiceUsed?: boolean;
      speechReport?: { accuracyScore: number; missedWords: string[]; phoneticTips: string[] } | null;
    }
  ) => {
    const text = (customText ?? chatInput).trim();
    if (!text || text.length < 2 || isChatLoading) return;

    if (isRecording) {
      handleStopVoice(false);
    }

    setChatError(null);
    const usedSpeechReport = opts?.speechReport ?? pendingSpeechTelemetry;
    const isVoiceTurn = Boolean(opts?.voiceUsed || voiceModeLastUsed);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      textEn: text,
      voiceUsed: isVoiceTurn,
      pronunciationAccuracy: usedSpeechReport?.accuracyScore
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!customText) setChatInput('');
    setPendingSpeechTelemetry(null);
    setPracticeTargetText(null);
    setVoiceModeLastUsed(false);
    setIsChatLoading(true);

    try {
      const resp = await fetch('/api/gemini/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: conversationMode,
          schoolGrade,
          cefrLevel,
          weakestSkills,
          teachingLanguagePreference: opts?.forceFrench ? 'bilingual_fr' : teachingLang,
          struggleCount,
          studentProfileContext: studentDiagnosticContext,
          speechAnalysisReport: usedSpeechReport || null,
          history: nextHistory.slice(-8).map((m) => ({ role: m.role, text: m.textEn }))
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || 'AI Tutor service error.');
      }
      if (!data.replyEn) {
        throw new Error('Incomplete response received from AI Tutor.');
      }

      const corrections: TutorCorrectionItem[] = Array.isArray(data.corrections) ? data.corrections : [];
      const fluencyEst = typeof data.fluencyScoreEstimate === 'number' ? data.fluencyScoreEstimate : 84;

      if (corrections.length > 0 || fluencyEst < 72) {
        setStruggleCount((prev) => prev + 1);
      } else {
        setStruggleCount(0);
      }

      // Persist detected weaknesses to Firestore & update local list
      if (corrections.length > 0) {
        try {
          const updatedWeaknesses = await recordTutorWeaknesses(corrections);
          setTrackedWeaknesses(updatedWeaknesses);
          onProfileUpdated?.();
        } catch (wErr) {
          console.warn('Could not persist tutor weaknesses:', wErr);
        }
      }

      const tutorMsg: ChatMessage = {
        id: `tut-${Date.now()}`,
        role: 'tutor',
        textEn: data.replyEn,
        praiseNote: data.praiseNote,
        frenchSupport: data.frenchSupport || '',
        usedFrenchHelp: Boolean(data.usedFrenchHelp),
        corrections,
        vocabularyBoost: Array.isArray(data.vocabularyBoost) ? data.vocabularyBoost : [],
        pronunciationCoach: data.pronunciationCoach,
        followUpQuestion: data.followUpQuestion,
        suggestedReplies: Array.isArray(data.suggestedReplies) ? data.suggestedReplies : [],
        fluencyScoreEstimate: fluencyEst
      };

      setMessages((prev) => [...prev, tutorMsg]);
      setSelectedFeedbackMsgId(tutorMsg.id);

      if (autoVoice) {
        const spokenLine = [data.replyEn, data.followUpQuestion].filter(Boolean).join(' ');
        playTutorVoice(spokenLine, tutorMsg.id);
      }

      await recordAttempt({
        moduleId: `tutor-${conversationMode}-${cefrLevel}`,
        moduleType: 'tutor',
        title: `AI Tutor · ${getTutorModeConfig(conversationMode).labelEn} (${cefrLevel})`,
        level: cefrLevel,
        score: fluencyEst,
        durationSeconds: 45
      });
      onXpEarned?.(20);
      onProfileUpdated?.();
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Unable to reach AI Tutor right now.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // End conversation & generate personalized Session Summary persisted to Firestore
  const handleCompleteSessionSummary = async () => {
    const userTurns = messages.filter((m) => m.role === 'user');
    if (userTurns.length === 0 || isGeneratingSummary) return;

    setSummaryError(null);
    setIsGeneratingSummary(true);

    const allCorrections = messages.flatMap((m) => m.corrections || []);
    const modeCfg = getTutorModeConfig(conversationMode);
    const durationSec = Math.max(30, Math.round((Date.now() - sessionStartMs) / 1000));

    try {
      const resp = await fetch('/api/gemini/tutor-session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: conversationMode,
          modeLabel: modeCfg.labelEn,
          schoolGrade,
          cefrLevel,
          turnsCount: userTurns.length,
          transcriptTurns: messages.slice(-14).map((m) => ({ role: m.role, text: m.textEn })),
          recordedCorrections: allCorrections.slice(0, 12)
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || 'Could not generate session summary.');
      }

      const xpEarned = Math.min(80, 20 + userTurns.length * 10);
      const summaryObj: TutorSessionSummary = {
        sessionId: `tutorsess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        mode: conversationMode,
        modeLabel: modeCfg.labelEn,
        schoolGrade,
        cefrLevel,
        turnsCount: userTurns.length,
        mistakesCount: allCorrections.length,
        fluencyScore: data.fluencyScore,
        strengths: data.strengths || [],
        weaknessesIdentified: data.weaknessesIdentified || [],
        recommendedFocus: data.recommendedFocus || modeCfg.labelEn,
        encouragementEn: data.encouragementEn,
        summaryFr: data.summaryFr,
        nextPracticePrompt: data.nextPracticePrompt || modeCfg.starterPromptMid,
        xpEarned,
        durationSeconds: durationSec,
        completedAt: new Date().toISOString()
      };

      const saved = await saveTutorSessionAndWeaknesses(summaryObj, allCorrections);
      setSessionSummary(saved);
      setPersistedSessions((prev) => [saved, ...prev.filter((s) => s.sessionId !== saved.sessionId)].slice(0, 30));
      onXpEarned?.(xpEarned);
      onProfileUpdated?.();
      showToast('Session summary & weaknesses saved to Cloud Firestore.');
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Unable to create session summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Launch personalized remediation drill directly from recurring mistakes
  const handleGenerateDrill = async (customSkill?: typeof drillSkill, customTopic?: string) => {
    if (isDrillLoading) return;
    const effectiveSkill = customSkill || drillSkill;
    const effectiveTopic = customTopic ?? drillTopic;
    if (customSkill) setDrillSkill(customSkill);
    if (customTopic !== undefined) setDrillTopic(customTopic);

    setActiveTab('drill');
    setDrillError(null);
    setIsDrillLoading(true);
    setDrillData(null);
    setDrillAnswers({});
    setDrillSubmitted(false);

    try {
      const resp = await fetch('/api/gemini/generate-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusSkill: effectiveSkill,
          schoolGrade,
          cefrLevel,
          topic: effectiveTopic || gradeMeta.focusSummary,
          recurringWeaknesses: studentDiagnosticContext.recurringMistakes,
          vocabWeaknesses: studentDiagnosticContext.vocabWeaknesses
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Could not generate exercise.');
      if (!Array.isArray(data.questions) || data.questions.length < 3) {
        throw new Error('Generated exercise did not pass validation.');
      }
      setDrillData(data);
    } catch (err) {
      setDrillError(err instanceof Error ? err.message : 'Drill generation unavailable.');
    } finally {
      setIsDrillLoading(false);
    }
  };

  const handleEvaluateWriting = async () => {
    if (writingText.trim().length < 10 || isWritingLoading) return;
    setWritingError(null);
    setIsWritingLoading(true);
    setWritingResult(null);

    try {
      const resp = await fetch('/api/gemini/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: writingText.trim(),
          promptTopic: writingTopic,
          schoolGrade,
          cefrLevel
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Writing evaluation failed.');
      setWritingResult(data);

      await recordAttempt({
        moduleId: `tutor-writing-${cefrLevel}`,
        moduleType: 'writing',
        title: `AI Writing Lab (${gradeMeta.shortLabel} · ${data.cefrEstimate})`,
        level: cefrLevel,
        score: data.score,
        durationSeconds: 180
      });
      onXpEarned?.(data.score >= 80 ? 45 : 25);
      onProfileUpdated?.();
    } catch (err) {
      setWritingError(err instanceof Error ? err.message : 'Unable to evaluate writing.');
    } finally {
      setIsWritingLoading(false);
    }
  };

  const handleSubmitDrill = async () => {
    if (!drillData || drillSubmitted) return;
    let correct = 0;
    drillData.questions.forEach((q, idx) => {
      if (drillAnswers[idx] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / drillData.questions.length) * 100);
    setDrillSubmitted(true);

    await recordAttempt({
      moduleId: `tutor-drill-${drillSkill}`,
      moduleType: drillSkill === 'grammar' || drillSkill === 'structure' ? 'grammar' : drillSkill === 'reading' ? 'reading' : 'quiz',
      title: `AI Drill: ${drillData.title}`,
      level: cefrLevel,
      score: pct,
      durationSeconds: 90
    });
    onXpEarned?.(pct >= 66 ? 40 : 15);
    onProfileUpdated?.();
  };

  const handleSaveValidatedNote = async (
    title: string,
    category: TutorSavedNote['category'],
    contentEn: string,
    explanationFr: string
  ) => {
    try {
      await saveValidatedTutorNote({
        title,
        category,
        contentEn,
        explanationFr: explanationFr || contentEn,
        cefrLevel,
        schoolGrade
      });
      onProfileUpdated?.();
      showToast('Saved to your validated AI Notebook.');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Validation error.');
    }
  };

  // Resolve active feedback message for side coaching panel
  const tutorMessages = messages.filter((m) => m.role === 'tutor');
  const activeFeedbackMsg =
    tutorMessages.find((m) => m.id === selectedFeedbackMsgId) ||
    tutorMessages[tutorMessages.length - 1] ||
    null;

  const userTurnsCount = messages.filter((m) => m.role === 'user').length;
  const sessionMistakesCount = messages.reduce((sum, m) => sum + (m.corrections?.length || 0), 0);
  const currentModeConfig = getTutorModeConfig(conversationMode);
  const waveformState: 'listening' | 'speaking' | 'thinking' | 'idle' = isRecording
    ? 'listening'
    : isTtsPlaying
    ? 'speaking'
    : isChatLoading
    ? 'thinking'
    : 'idle';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="AI English Tutor"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[94vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Teacher Header & Student Telemetry */}
        <div className="px-4 py-3.5 sm:px-5 bg-gradient-to-r from-[#151b2b] via-[#191f2f] to-[#0c1322] border-b border-[#4d4635]/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-[#f2ca50]/65 bg-[#070e1d] shrink-0 shadow-lg flex items-center justify-center">
              {!avatarError ? (
                <img
                  src={professorAvatarImg}
                  alt="Professor Arthur Sterling — AI English Tutor"
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[#f2ca50] text-3xl">school</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50]">
                  PROFESSOR ARTHUR STERLING · OXFORD AI MENTOR
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-xl font-bold text-[#dce2f8] truncate">
                AI English Tutor — Personalised Studio
              </h2>
              <p className="text-[11px] font-mono text-[#d0c5af]/90 truncate tabular-nums">
                {gradeMeta.shortLabel} · CEFR {cefrLevel}
                {recentTestAvg !== undefined ? ` · Avg ${recentTestAvg}%` : ''}
                {` · Focus: ${weakLabels.slice(0, 2).join(', ')}`}
                {trackedWeaknesses.length > 0 ? ` · ${trackedWeaknesses.length} tracked mistakes` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Accent switcher */}
            <div className="inline-flex rounded-lg bg-[#070e1d] p-0.5 border border-[#2e3545]">
              {(['en-GB', 'en-US'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setAccent(code)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    accent === code ? 'bg-[#f2ca50] text-[#3c2f00]' : 'text-[#d0c5af] hover:text-white'
                  }`}
                >
                  {code === 'en-GB' ? 'UK' : 'US'}
                </button>
              ))}
            </div>

            {/* Teaching language toggle (English default / Bilingual French support) */}
            <button
              type="button"
              onClick={() =>
                setTeachingLang((prev) => (prev === 'english_default' ? 'bilingual_fr' : 'english_default'))
              }
              title="English is default; toggle bilingual French help anytime"
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border whitespace-nowrap transition-colors cursor-pointer ${
                teachingLang === 'bilingual_fr'
                  ? 'bg-sky-950/70 border-sky-400/60 text-sky-200'
                  : 'bg-[#070e1d] border-[#2e3545] text-[#d4c78f] hover:border-[#f2ca50]/50'
              }`}
            >
              {teachingLang === 'bilingual_fr' ? 'EN + FR Help' : 'English Default'}
            </button>

            {/* Auto-voice toggle */}
            <button
              type="button"
              onClick={() => {
                if (autoVoice) {
                  stopSpeech();
                  setIsTtsPlaying(false);
                }
                setAutoVoice((v) => !v);
              }}
              aria-label="Toggle automatic tutor voice"
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
                autoVoice
                  ? 'bg-[#f2ca50]/15 border-[#f2ca50]/50 text-[#f2ca50]'
                  : 'bg-[#070e1d] border-[#2e3545] text-[#99907c]'
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {autoVoice ? 'volume_up' : 'volume_off'}
              </span>
              <span>{autoVoice ? 'Voice ON' : 'Voice OFF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI English Tutor"
              className="w-9 h-9 rounded-full bg-[#232a3a] hover:bg-[#2e3545] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Main Studio Tabs + End Session Action */}
        <div className="px-4 py-2 bg-[#151b2b] border-b border-[#232a3a] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2">
            {[
              { id: 'chat', label: 'Interactive Tutor', icon: 'record_voice_over' },
              { id: 'writing', label: 'Writing Lab', icon: 'edit_note' },
              { id: 'drill', label: 'Targeted Drills', icon: 'quiz' },
              {
                id: 'history',
                label: `Progress & Notes (${persistedSessions.length + savedNotes.length})`,
                icon: 'analytics'
              }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md'
                    : 'bg-[#191f2f] text-[#d0c5af] hover:text-[#f2ca50] border border-[#2e3545]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'chat' && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline text-[11px] font-mono text-[#99907c] tabular-nums">
                {userTurnsCount} turn{userTurnsCount === 1 ? '' : 's'} · {sessionMistakesCount} note
                {sessionMistakesCount === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                disabled={userTurnsCount === 0 || isGeneratingSummary}
                onClick={handleCompleteSessionSummary}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 disabled:opacity-40 border border-emerald-500/45 text-emerald-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">summarize</span>
                <span>{isGeneratingSummary ? 'Saving...' : 'Session Summary'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 9 Conversation Modes Strip (Visible on Interactive Tutor tab) */}
        {activeTab === 'chat' && (
          <div className="px-4 py-2 bg-[#0c1322] border-b border-[#232a3a] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] mr-1 shrink-0">
              Mode:
            </span>
            {TUTOR_CONVERSATION_MODES.map((m) => {
              const active = m.id === conversationMode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSwitchMode(m.id)}
                  title={`${m.labelEn} (${m.labelFr}) — ${m.taglineEn}`}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#f2ca50]/20 border-[#f2ca50] text-[#f2ca50]'
                      : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af] hover:border-[#4d4635] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">{m.icon}</span>
                  <span>{m.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}

        {savedToast && (
          <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>{savedToast}</span>
          </div>
        )}

        {summaryError && (
          <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2 shrink-0">
            <span>{summaryError}</span>
            <button type="button" onClick={() => setSummaryError(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Session Summary Card Overlay inside body when completed */}
        <AnimatePresence>
          {sessionSummary && activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-4 mt-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#151b2b] to-[#0c1322] border border-[#f2ca50]/60 shadow-xl space-y-3 shrink-0 max-h-[60vh] overflow-y-auto"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#232a3a] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                    SESSION COMPLETE · SAVED TO CLOUD FIRESTORE
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#dce2f8] mt-0.5">
                    {sessionSummary.modeLabel} — Fluency Score:{' '}
                    <span className="text-[#f2ca50] font-mono tabular-nums">
                      {sessionSummary.fluencyScore}/100
                    </span>
                  </h3>
                  <p className="text-xs text-[#d0c5af] font-mono mt-0.5 tabular-nums">
                    {sessionSummary.turnsCount} spoken/written turns · {sessionSummary.mistakesCount} corrections · +
                    {sessionSummary.xpEarned} XP awarded
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateDrill('grammar', sessionSummary.recommendedFocus)}
                    className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">quiz</span>
                    <span>Practice Weaknesses Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionSummary(null)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#232a3a] text-[#d0c5af] text-xs hover:text-white cursor-pointer"
                  >
                    Continue Chat
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#070e1d] border border-emerald-500/30">
                <p className="text-sm text-[#dce2f8] leading-relaxed">{sessionSummary.encouragementEn}</p>
                {sessionSummary.summaryFr && (
                  <p className="text-xs text-[#d0c5af] mt-1.5 italic">{sessionSummary.summaryFr}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1.5">
                    Genuine Strengths
                  </span>
                  <ul className="space-y-1 text-xs text-[#dce2f8] list-disc pl-4">
                    {(sessionSummary.strengths.length > 0
                      ? sessionSummary.strengths
                      : ['Clear effort and steady engagement in English.']
                    ).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                  <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block mb-1.5">
                    Focus Areas Saved ({sessionSummary.weaknessesIdentified.length})
                  </span>
                  {sessionSummary.weaknessesIdentified.length === 0 ? (
                    <p className="text-xs text-[#d0c5af]">
                      No recurring weaknesses flagged in this session—next focus: {sessionSummary.recommendedFocus}.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-[#d0c5af]">
                      {sessionSummary.weaknessesIdentified.map((w, idx) => (
                        <li key={idx}>
                          <strong className="text-[#f2ca50]">{w.label}:</strong> {w.tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: INTERACTIVE CONVERSATION STUDIO (2-column desktop + responsive mobile switcher) */}
        {activeTab === 'chat' && (
          <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
            {/* Mobile pane toggle */}
            <div className="lg:hidden px-4 py-2 bg-[#070e1d] border-b border-[#232a3a] flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileChatPane('thread')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  mobileChatPane === 'thread'
                    ? 'bg-[#f2ca50] text-[#3c2f00]'
                    : 'bg-[#151b2b] text-[#d0c5af]'
                }`}
              >
                Conversation ({messages.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileChatPane('feedback')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  mobileChatPane === 'feedback'
                    ? 'bg-[#f2ca50] text-[#3c2f00]'
                    : 'bg-[#151b2b] text-[#d0c5af]'
                }`}
              >
                Feedback Panel ({activeFeedbackMsg?.corrections?.length || 0})
              </button>
            </div>

            {/* LEFT/CENTER: Conversation History, Suggested Questions, Waveform & Mic/Text Composer */}
            <div
              className={`lg:col-span-7 flex flex-col min-h-0 border-r border-[#232a3a] ${
                mobileChatPane === 'thread' ? 'flex-1' : 'hidden lg:flex'
              }`}
            >
              {/* Mode Subtitle Banner */}
              <div className="px-4 py-2 bg-[#0c1322]/90 border-b border-[#232a3a] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                    {currentModeConfig.icon}
                  </span>
                  <span className="text-xs font-semibold text-[#dce2f8] truncate">
                    {currentModeConfig.labelEn}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-[#99907c] truncate">
                    — {currentModeConfig.taglineEn}
                  </span>
                </div>
                {struggleCount >= 2 && (
                  <span className="text-[10px] font-mono text-sky-300 shrink-0">
                    Adaptive French Help Active
                  </span>
                )}
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isTutor = m.role === 'tutor';
                  const isSelected = isTutor && activeFeedbackMsg?.id === m.id;
                  const corrCount = m.corrections?.length || 0;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (isTutor) setSelectedFeedbackMsgId(m.id);
                      }}
                      className={`rounded-2xl p-3.5 sm:p-4 border transition-colors ${
                        !isTutor
                          ? 'ml-auto max-w-[88%] bg-[#232a3a] border-[#f2ca50]/35 text-[#dce2f8]'
                          : isSelected
                          ? 'mr-auto max-w-[96%] bg-[#151b2b] border-[#f2ca50]/65 text-[#dce2f8] shadow-lg'
                          : 'mr-auto max-w-[96%] bg-[#151b2b]/85 border-[#2e3545] text-[#dce2f8] hover:border-[#4d4635] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                          {isTutor ? 'Professor Sterling' : `You${m.voiceUsed ? ' (Voice)' : ''}`}
                        </span>

                        {!isTutor && typeof m.pronunciationAccuracy === 'number' && (
                          <span className="text-[10px] font-mono text-sky-300 tabular-nums">
                            Speech Match: {m.pronunciationAccuracy}%
                          </span>
                        )}

                        {isTutor && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playTutorVoice(
                                  [m.textEn, m.followUpQuestion].filter(Boolean).join(' '),
                                  m.id,
                                  false
                                );
                              }}
                              className="px-2 py-0.5 rounded bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] text-[10px] font-mono font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">volume_up</span>
                              <span>Listen</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playTutorVoice(
                                  [m.textEn, m.followUpQuestion].filter(Boolean).join(' '),
                                  `${m.id}-slow`,
                                  true
                                );
                              }}
                              title="Repeat slowly (0.76x speed)"
                              className="px-2 py-0.5 rounded bg-[#0c1322] hover:bg-[#232a3a] border border-[#2e3545] text-[#d0c5af] hover:text-[#f2ca50] text-[10px] font-mono whitespace-nowrap cursor-pointer"
                            >
                              Repeat Slowly
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartVoice(m.followUpQuestion || m.textEn);
                              }}
                              title="Read this sentence aloud to check pronunciation"
                              className="px-2 py-0.5 rounded bg-[#0c1322] hover:bg-[#232a3a] border border-sky-500/35 text-sky-300 text-[10px] font-mono whitespace-nowrap cursor-pointer"
                            >
                              Practice Speaking
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveValidatedNote(
                                  `Tutor Coaching (${currentModeConfig.labelEn})`,
                                  'tutor_tip',
                                  [m.textEn, ...(m.corrections || []).map((c) => `${c.corrected} (${c.additionalExample})`)].join(' | '),
                                  m.frenchSupport || m.praiseNote || m.textEn
                                );
                              }}
                              className="px-2 py-0.5 rounded bg-[#0c1322] hover:bg-[#232a3a] border border-[#4d4635]/40 text-[#d4c78f] hover:text-[#f2ca50] text-[10px] font-mono whitespace-nowrap cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm leading-relaxed text-[#dce2f8]">{m.textEn}</p>

                      {m.followUpQuestion && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm text-[#ffe088] font-medium italic">
                            {m.followUpQuestion}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playTutorVoice(m.followUpQuestion!, `${m.id}-fq`, false);
                            }}
                            aria-label="Listen to question"
                            className="text-[#f2ca50] hover:text-[#ffe088] shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">play_circle</span>
                          </button>
                        </div>
                      )}

                      {m.frenchSupport && (
                        <div className="mt-2 pt-2 border-t border-[#232a3a] text-xs text-sky-200/90 leading-relaxed">
                          <span className="font-mono text-[10px] uppercase text-sky-300 font-bold mr-1.5">
                            Explication FR :
                          </span>
                          {m.frenchSupport}
                        </div>
                      )}

                      {isTutor && (
                        <div className="mt-2 pt-2 border-t border-[#232a3a]/70 flex items-center justify-between gap-2 text-[11px] font-mono">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeedbackMsgId(m.id);
                              setMobileChatPane('feedback');
                            }}
                            className="text-[#d4c78f] hover:text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {corrCount > 0 ? 'spellcheck' : 'verified'}
                            </span>
                            <span>
                              {corrCount > 0
                                ? `Inspect ${corrCount} correction${corrCount > 1 ? 's' : ''} in Feedback Panel`
                                : 'Inspect Feedback & Vocabulary'}
                            </span>
                          </button>

                          {!m.frenchSupport && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendChat('Please explain that grammar/vocabulary point clearly in French.', {
                                  forceFrench: true
                                });
                              }}
                              disabled={isChatLoading}
                              className="text-sky-300 hover:text-sky-200 underline cursor-pointer"
                            >
                              Explain in French
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="p-3.5 rounded-2xl bg-[#151b2b] border border-[#2e3545] flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f2ca50] animate-spin">autorenew</span>
                    <span className="text-xs font-mono text-[#d0c5af]">
                      Professor Sterling is preparing personalised feedback ({cefrLevel})...
                    </span>
                  </div>
                )}

                {chatError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
                    <span>{chatError}</span>
                    <button
                      type="button"
                      onClick={() => setChatError(null)}
                      className="text-[11px] underline cursor-pointer shrink-0"
                    >
                      Close
                    </button>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Composer: Suggested Questions + Animated Waveform + Voice & Text Controls */}
              <div className="p-3 sm:p-4 bg-[#070e1d] border-t border-[#232a3a] space-y-2.5 shrink-0">
                {/* Suggested Questions & Quick Pedagogical Requests */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#99907c] shrink-0">
                    Try saying:
                  </span>
                  {(
                    activeFeedbackMsg?.suggestedReplies && activeFeedbackMsg.suggestedReplies.length > 0
                      ? activeFeedbackMsg.suggestedReplies
                      : currentModeConfig.suggestedPrompts[
                          cefrLevel === 'A1' || cefrLevel === 'A2'
                            ? 'low'
                            : cefrLevel === 'B1' || cefrLevel === 'B2'
                            ? 'mid'
                            : 'high'
                        ]
                  ).map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => handleSendChat(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-[#151b2b] hover:bg-[#232a3a] border border-[#4d4635]/40 text-[11px] text-[#d4c78f] hover:text-[#f2ca50] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() =>
                      handleSendChat('Could you give me two more practical examples of that expression?')
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#191f2f] hover:bg-[#232a3a] border border-[#2e3545] text-[11px] text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    + Ask for example
                  </button>
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() =>
                      handleSendChat('Please explain that in French so I am 100% sure.', { forceFrench: true })
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#191f2f] hover:bg-[#232a3a] border border-[#2e3545] text-[11px] text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Expliquer en français
                  </button>
                </div>

                {/* Live Sound Waveform */}
                <TutorWaveform
                  mode={waveformState}
                  liveBars={liveBars}
                  accentLabel={accent === 'en-GB' ? 'UK RP' : 'US'}
                />

                {/* Pronunciation practice banner when active */}
                {practiceTargetText && (
                  <div className="px-3 py-2 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center justify-between gap-2 text-xs text-sky-200">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase text-sky-300 font-bold block">
                        Pronunciation Target (Speak freely, then click Stop & Send):
                      </span>
                      <span className="italic truncate block">"{practiceTargetText}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPracticeTargetText(null);
                        setPendingSpeechTelemetry(null);
                      }}
                      className="text-[11px] underline shrink-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Graceful Microphone / Speech Recognition Notice (Text fallback always active) */}
                {micError && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/35 text-[11px] text-amber-200 flex items-center justify-between gap-2">
                    <span>{micError}</span>
                    <button
                      type="button"
                      onClick={() => setMicError(null)}
                      className="underline shrink-0 cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                )}

                {liveInterim && (
                  <p className="text-[11px] font-mono text-amber-200/90 italic px-1">
                    Hearing: "{liveInterim}..."
                  </p>
                )}

                {/* Voice + Text Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#151b2b] border border-[#4d4635]/50 focus-within:border-[#f2ca50]"
                >
                  <button
                    type="button"
                    onClick={() => (isRecording ? handleStopVoice(false) : handleStartVoice())}
                    aria-label={isRecording ? 'Stop microphone' : 'Speak in English'}
                    title={
                      speechSupported
                        ? isRecording
                          ? 'Stop recording (you can review before sending)'
                          : 'Speak naturally in English'
                        : 'Speech recognition unavailable — use text input'
                    }
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                        : 'bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isRecording ? 'stop_circle' : 'mic'}
                    </span>
                  </button>

                  {isRecording && (
                    <button
                      type="button"
                      onClick={() => handleStopVoice(true)}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Finish & Send
                    </button>
                  )}

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isRecording
                        ? 'Listening... finish speaking whenever you are ready.'
                        : 'Speak with the mic or type in English (ask a question anytime)...'
                    }
                    maxLength={900}
                    className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm text-[#dce2f8] placeholder-[#99907c] focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isChatLoading || chatInput.trim().length < 2}
                    className="px-3.5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-45 text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <span className="hidden sm:inline">Send</span>
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT PANEL: Intelligent 4-Part Correction, Vocabulary Boost, Pronunciation & Weakness Tracker */}
            <div
              className={`lg:col-span-5 bg-[#0a101d] overflow-y-auto p-4 space-y-4 ${
                mobileChatPane === 'feedback' ? 'flex-1' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#232a3a]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                    INTELLIGENT FEEDBACK PANEL
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#dce2f8]">
                    Coaching & Gentle Corrections
                  </h3>
                </div>
                {activeFeedbackMsg?.fluencyScoreEstimate && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#151b2b] border border-[#f2ca50]/40 text-xs font-mono font-bold text-[#f2ca50] tabular-nums">
                    Clarity {activeFeedbackMsg.fluencyScoreEstimate}%
                  </span>
                )}
              </div>

              {activeFeedbackMsg ? (
                <div className="space-y-3.5">
                  {/* Positive Reinforcement Note */}
                  {activeFeedbackMsg.praiseNote && (
                    <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/35 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-emerald-300">
                        <span className="material-symbols-outlined text-xs">thumb_up</span>
                        <span>What You Did Well</span>
                      </div>
                      <p className="text-xs text-[#dce2f8] leading-relaxed">
                        {activeFeedbackMsg.praiseNote}
                      </p>
                    </div>
                  )}

                  {/* 4-Part Structured Mistake Cards */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#d4c78f] font-bold">
                        Detailed Corrections ({activeFeedbackMsg.corrections?.length || 0})
                      </span>
                    </div>

                    {(!activeFeedbackMsg.corrections || activeFeedbackMsg.corrections.length === 0) ? (
                      <div className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#d0c5af] flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
                        <span>
                          Clean communication on this turn—no grammar, vocabulary, or structure errors flagged.
                        </span>
                      </div>
                    ) : (
                      activeFeedbackMsg.corrections.map((c, idx) => {
                        const catMeta = TUTOR_MISTAKE_CATEGORY_META[c.category] || TUTOR_MISTAKE_CATEGORY_META.grammar;
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-[#151b2b] border border-[#2e3545] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${catMeta.badgeClass}`}
                              >
                                <span className="material-symbols-outlined text-[11px]">{catMeta.icon}</span>
                                <span>{catMeta.labelEn}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => playTutorVoice(c.corrected, `corr-${idx}`, false)}
                                className="text-[11px] font-mono text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">volume_up</span>
                                <span>Hear Corrected</span>
                              </button>
                            </div>

                            <div className="text-xs space-y-1 bg-[#070e1d] p-2.5 rounded-lg border border-[#232a3a]">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-rose-300 mr-1.5">
                                  Original:
                                </span>
                                <span className="line-through text-rose-200/80">{c.original}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono uppercase text-emerald-300 mr-1.5">
                                  Corrected:
                                </span>
                                <span className="text-emerald-200 font-semibold">{c.corrected}</span>
                              </div>
                            </div>

                            <p className="text-xs text-[#dce2f8] leading-relaxed">
                              <strong className="text-[#d4c78f]">Why:</strong> {c.explanation}
                            </p>

                            {c.explanationFr && (
                              <p className="text-[11px] text-sky-200/90 italic">{c.explanationFr}</p>
                            )}

                            <div className="pt-1.5 border-t border-[#232a3a] flex items-start justify-between gap-2">
                              <p className="text-[11px] text-[#d0c5af]">
                                <strong className="text-[#f2ca50]">Extra Example:</strong>{' '}
                                <em>"{c.additionalExample}"</em>
                              </p>
                              <button
                                type="button"
                                onClick={() => playTutorVoice(c.additionalExample, `ex-${idx}`, false)}
                                aria-label="Listen to example sentence"
                                className="text-[#f2ca50] shrink-0 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">volume_up</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Vocabulary Boost */}
                  {activeFeedbackMsg.vocabularyBoost && activeFeedbackMsg.vocabularyBoost.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-[#d4c78f] font-bold block">
                        Useful Expressions (Click to Hear)
                      </span>
                      <div className="space-y-1.5">
                        {activeFeedbackMsg.vocabularyBoost.map((v, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => playTutorVoice(v.term, `vb-${idx}`, false)}
                            className="w-full text-left p-2.5 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-[#232a3a] hover:border-[#f2ca50]/50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#f2ca50]">
                                {v.term}{' '}
                                <span className="font-mono font-normal text-sky-300 ml-1">{v.phonetic}</span>
                              </div>
                              <div className="text-[11px] text-[#d0c5af] truncate">{v.translationFr}</div>
                            </div>
                            <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0">
                              volume_up
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pronunciation Tip */}
                  {activeFeedbackMsg.pronunciationCoach && (
                    <div className="p-3 rounded-xl bg-[#151b2b] border border-sky-500/30 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-sky-300 font-bold block">
                        Pronunciation & Stress Tip
                      </span>
                      <p className="text-xs text-[#dce2f8] leading-relaxed">
                        {activeFeedbackMsg.pronunciationCoach}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#99907c]">
                  Start speaking or typing to receive structured, encouraging feedback.
                </p>
              )}

              {/* Recurring Weaknesses Personalized Drill Trigger */}
              <div className="pt-3 border-t border-[#232a3a] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold">
                    Tracked Focus Patterns ({trackedWeaknesses.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleGenerateDrill(
                        trackedWeaknesses[0]?.category === 'vocabulary' ? 'vocabulary' : 'grammar',
                        trackedWeaknesses[0]?.ruleSummary || 'Recurring mistakes practice'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-[10px] font-bold whitespace-nowrap cursor-pointer"
                  >
                    Generate Targeted Exercise
                  </button>
                </div>

                {trackedWeaknesses.length === 0 ? (
                  <p className="text-[11px] text-[#99907c]">
                    Mistakes spotted across sessions are tracked here so you can drill them anytime.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {trackedWeaknesses.slice(0, 3).map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[#dce2f8] truncate">
                            {w.correctedForm}
                          </div>
                          <div className="text-[10px] text-[#99907c] truncate">
                            {w.category} · {w.occurrences}x seen
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateDrill(
                              w.category === 'vocabulary'
                                ? 'vocabulary'
                                : w.category === 'structure'
                                ? 'structure'
                                : 'grammar',
                              `${w.correctedForm}: ${w.ruleSummary}`
                            )
                          }
                          className="text-[10px] font-mono text-[#f2ca50] hover:underline shrink-0 cursor-pointer"
                        >
                          Drill
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WRITING LAB */}
        {activeTab === 'writing' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#151b2b] border border-[#2e3545] space-y-3">
              <div>
                <label className="text-[11px] font-mono uppercase text-[#f2ca50] font-bold block mb-1">
                  Writing Prompt ({gradeMeta.shortLabel} · {cefrLevel})
                </label>
                <input
                  type="text"
                  value={writingTopic}
                  onChange={(e) => setWritingTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070e1d] border border-[#2e3545] text-xs text-[#dce2f8] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase text-[#d4c78f] font-bold block mb-1">
                  Your English Draft ({writingText.length}/1800 characters)
                </label>
                <textarea
                  rows={5}
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  maxLength={1800}
                  placeholder="Write your English paragraph here for encouraging CEFR grading, a polished version, and key grammar guidance..."
                  className="w-full p-3 rounded-xl bg-[#070e1d] border border-[#2e3545] text-sm text-[#dce2f8] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-[#99907c]">
                  Updates your Writing proficiency skill and rewards +XP.
                </span>
                <button
                  type="button"
                  onClick={handleEvaluateWriting}
                  disabled={isWritingLoading || writingText.trim().length < 10}
                  className="px-4 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-45 text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">grading</span>
                  <span>{isWritingLoading ? 'Evaluating...' : 'Evaluate My Writing'}</span>
                </button>
              </div>
            </div>

            {writingError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                {writingError}
              </div>
            )}

            {writingResult && (
              <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/45 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#232a3a] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#f2ca50]">
                      Examiner Feedback
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#dce2f8]">
                      Score:{' '}
                      <span className="text-[#f2ca50] font-mono tabular-nums">
                        {writingResult.score}/100
                      </span>{' '}
                      · Estimated {writingResult.cefrEstimate}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveValidatedNote(
                        `Writing Correction (${writingResult.score}/100)`,
                        'writing_feedback',
                        writingResult.correctedText,
                        `${writingResult.keyGrammarPointFr} — ${writingResult.encouragementFr}`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] text-xs font-bold cursor-pointer transition-colors"
                  >
                    Save Correction
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070e1d] border border-emerald-500/35">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                      Polished Natural Version
                    </span>
                    <button
                      type="button"
                      onClick={() => playTutorVoice(writingResult.correctedText, 'writing-corr')}
                      className="text-[11px] font-mono text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">volume_up</span> Listen
                    </button>
                  </div>
                  <p className="text-sm text-[#dce2f8] leading-relaxed">{writingResult.correctedText}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1.5">
                      Strengths
                    </span>
                    <ul className="space-y-1 text-xs text-[#dce2f8] list-disc pl-4">
                      {writingResult.strengthsFr.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                    <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block mb-1.5">
                      Next Steps
                    </span>
                    <ul className="space-y-1 text-xs text-[#d0c5af] list-disc pl-4">
                      {writingResult.improvementsFr.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-xs text-[#d4c78f] bg-[#191f2f] p-3 rounded-xl border border-[#4d4635]/40">
                  <strong>Key Grammar Takeaway:</strong> {writingResult.keyGrammarPointFr}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERSONALIZED TARGETED DRILLS (From Recurring Weaknesses + Curriculum) */}
        {activeTab === 'drill' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#151b2b] border border-[#2e3545] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold">
                    PERSONALISED REMEDIATION ENGINE
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#dce2f8]">
                    Targeted 3-Question Micro-Drill ({gradeMeta.shortLabel} · {cefrLevel})
                  </h3>
                  {trackedWeaknesses.length > 0 && (
                    <p className="text-[11px] text-sky-300 mt-0.5">
                      Automatically targets your {trackedWeaknesses.length} tracked tutor mistake(s) & Error Journal words.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['grammar', 'vocabulary', 'structure', 'reading', 'writing'] as const).map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => setDrillSkill(sk)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        drillSkill === sk ? 'bg-[#f2ca50] text-[#3c2f00]' : 'bg-[#070e1d] text-[#d0c5af]'
                      }`}
                    >
                      {sk === 'structure' ? 'Structure' : SKILL_META[sk]?.labelEn || sk}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={drillTopic}
                  onChange={(e) => setDrillTopic(e.target.value)}
                  placeholder="Optional focus (e.g., Past Simple vs Present Perfect, Travel prepositions...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#070e1d] border border-[#2e3545] text-xs text-[#dce2f8] focus:outline-none focus:border-[#f2ca50]"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateDrill()}
                  disabled={isDrillLoading}
                  className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-45 text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
                >
                  {isDrillLoading ? 'Generating...' : 'Generate Personalised Drill'}
                </button>
              </div>
            </div>

            {drillError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                {drillError}
              </div>
            )}

            {drillData && (
              <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/45 space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-[#232a3a] pb-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#f2ca50]">{drillData.title}</h4>
                    <p className="text-xs text-[#d0c5af] mt-0.5">{drillData.explanationFr}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveValidatedNote(
                        drillData.title,
                        'drill',
                        drillData.questions.map((q) => q.sampleSentenceEn).join(' | '),
                        drillData.explanationFr
                      )
                    }
                    className="px-3 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] text-[11px] font-bold shrink-0 cursor-pointer"
                  >
                    Save Drill Sheet
                  </button>
                </div>

                <div className="space-y-3">
                  {drillData.questions.map((q, qIdx) => {
                    const chosen = drillAnswers[qIdx];
                    return (
                      <div key={qIdx} className="p-3.5 rounded-xl bg-[#070e1d] border border-[#232a3a] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[#dce2f8]">
                            {qIdx + 1}. {q.question}
                          </p>
                          <button
                            type="button"
                            onClick={() => playTutorVoice(q.sampleSentenceEn, `drill-q-${qIdx}`)}
                            className="text-[#f2ca50] shrink-0 cursor-pointer"
                            title="Listen to example"
                          >
                            <span className="material-symbols-outlined text-base">volume_up</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = chosen === oIdx;
                            const isRight = drillSubmitted && oIdx === q.correctIndex;
                            const isWrong = drillSubmitted && isSelected && oIdx !== q.correctIndex;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={drillSubmitted}
                                onClick={() => setDrillAnswers((p) => ({ ...p, [qIdx]: oIdx }))}
                                className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                                  isRight
                                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 font-bold'
                                    : isWrong
                                    ? 'bg-rose-950/60 border-rose-400 text-rose-200'
                                    : isSelected
                                    ? 'bg-[#f2ca50]/20 border-[#f2ca50] text-[#f2ca50] font-bold'
                                    : 'bg-[#151b2b] border-[#2e3545] text-[#dce2f8] hover:border-[#f2ca50]/45'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {drillSubmitted && (
                          <p className="text-[11px] text-[#d4c78f] pt-1">
                            <strong>Explanation:</strong> {q.explanationFr} — <em>"{q.sampleSentenceEn}"</em>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!drillSubmitted ? (
                  <button
                    type="button"
                    disabled={Object.keys(drillAnswers).length < drillData.questions.length}
                    onClick={handleSubmitDrill}
                    className="w-full py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-45 text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Submit Answers (+XP)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGenerateDrill()}
                    className="w-full py-2.5 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] text-[#f2ca50] font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Generate Another Targeted Exercise
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FIRESTORE SESSION HISTORY, RECURRING WEAKNESSES & SAVED NOTES */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Recurring Weaknesses Tracked in Firestore */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold">
                    PERSISTENT WEAKNESS TRACKER (FIRESTORE)
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#dce2f8]">
                    Recurring Mistakes & Custom Remediation ({trackedWeaknesses.length})
                  </h3>
                </div>
                {trackedWeaknesses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleGenerateDrill('grammar', 'My recurring AI Tutor weaknesses')}
                    className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold cursor-pointer"
                  >
                    Practice All Weaknesses
                  </button>
                )}
              </div>

              {trackedWeaknesses.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#99907c]">
                  No recurring mistakes recorded yet—chat with Professor Sterling and any grammar, vocabulary, or structure patterns will be tracked here automatically.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trackedWeaknesses.map((w) => {
                    const catMeta = TUTOR_MISTAKE_CATEGORY_META[w.category] || TUTOR_MISTAKE_CATEGORY_META.grammar;
                    return (
                      <div key={w.id} className="p-3.5 rounded-2xl bg-[#151b2b] border border-[#2e3545] space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${catMeta.badgeClass}`}
                          >
                            {catMeta.labelEn}
                          </span>
                          <span className="text-[10px] font-mono text-[#d4c78f] tabular-nums">
                            {w.occurrences}x noted
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="line-through text-rose-300/80 mr-1.5">{w.originalSample}</span>
                          <span className="text-emerald-300 font-semibold">→ {w.correctedForm}</span>
                        </div>
                        <p className="text-[11px] text-[#d0c5af]">{w.ruleSummary}</p>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] text-[#99907c] italic truncate">"{w.additionalExample}"</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleGenerateDrill(
                                w.category === 'vocabulary' ? 'vocabulary' : 'grammar',
                                `${w.correctedForm}: ${w.ruleSummary}`
                              )
                            }
                            className="text-[11px] font-mono font-bold text-[#f2ca50] hover:underline shrink-0 cursor-pointer"
                          >
                            Generate Drill
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Tutor Sessions */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold block">
                PAST AI TUTOR SESSIONS ({persistedSessions.length})
              </span>
              {persistedSessions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#99907c]">
                  Complete a conversation and click "Session Summary" to archive your fluency report in Firestore.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {persistedSessions.map((sess) => (
                    <div key={sess.sessionId} className="p-4 rounded-2xl bg-[#151b2b] border border-[#2e3545] space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-serif font-bold text-sm text-[#f2ca50]">
                          {sess.modeLabel} ({sess.cefrLevel})
                        </span>
                        <span className="text-[11px] font-mono text-[#d0c5af] tabular-nums">
                          Fluency {sess.fluencyScore}/100 · {sess.turnsCount} turns · {sess.mistakesCount} corrections
                        </span>
                      </div>
                      <p className="text-xs text-[#dce2f8]">{sess.encouragementEn}</p>
                      {sess.summaryFr && <p className="text-[11px] text-[#99907c] italic">{sess.summaryFr}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Coaching Notes */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold block">
                VALIDATED COACHING NOTES ({savedNotes.length})
              </span>
              {savedNotes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#99907c]">
                  Save any helpful explanation, writing correction, or custom drill from the Tutor tabs to review offline anytime.
                </div>
              ) : (
                savedNotes.map((note) => (
                  <div key={note.id} className="p-4 rounded-2xl bg-[#151b2b] border border-[#4d4635]/40 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif font-bold text-sm text-[#f2ca50]">{note.title}</span>
                      <span className="text-[10px] font-mono text-[#99907c]">
                        {note.schoolGrade} · {note.cefrLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#dce2f8]">{note.contentEn}</p>
                    <p className="text-xs text-[#d0c5af]/85 italic">{note.explanationFr}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
