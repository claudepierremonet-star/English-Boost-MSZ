import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SPEAKING_ITEMS, type SpeakingItem } from '../data/curriculum';
import { recordAttempt } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import { DualSpeakerButton } from './DualSpeakerButton';
import { SpeechWaveformComparator } from './SpeechWaveformComparator';
import { SpeechRecognitionDiagnosticCard } from './SpeechRecognitionDiagnosticCard';
import { PronunciationDuelArena } from './PronunciationDuelArena';
import {
  generateNativeProsodyModel,
  extractWaveformFromAudioBlob,
  analyzeSpeechComparison,
  type NativeProsodyModel,
  type AcousticAnalysisResult
} from '../utils/speechAcousticAnalyzer';
import {
  SpeechRecognitionController,
  compareOrthographyAndPhonetics,
  isSpeechRecognitionAvailable,
  type PhoneticCorrectionReport
} from '../utils/speechRecognitionHelper';
import type { SchoolLesson } from '../data/schoolCurriculum';
import { stopSpeech } from '../services/speechService';
import {
  selectSkillsForTask,
  type LoadedContextSkillEntry
} from '../services/skillsService';
import {
  analyzeReferencePhonemes,
  playAutomatedVocalFeedback,
  type PhonemeEvaluationResult,
  type VocalFeedbackPhase,
  type VocalFeedbackPlaybackMode
} from '../utils/phonemeFeedbackEngine';
import { PhonemeVocalFeedbackPanel } from './PhonemeVocalFeedbackPanel';
import { saveSpeakingPhonemeTelemetry } from '../utils/phoneticMasteryEngine';
import {
  STUDIO_ACOUSTIC_PRESETS,
  getStudioAcousticPreset,
  setStudioAcousticPreset,
  playStudioNavCue3D,
  playStudioAccentCue3D,
  playStudioModeSwitchCue3D,
  playStudioRecordStartCue3D,
  playStudioRecordStopCue3D,
  playStudioValidationCue3D,
  startStudioAcousticAmbiance,
  updateStudioAmbianceReactiveVolume,
  stopStudioAcousticAmbiance,
  type StudioAcousticPreset
} from '../utils/studio3dAudio';

interface SpeakingStudioModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onSpeakingComplete?: () => void;
  activeLesson?: SchoolLesson | null;
}

export const SpeakingStudioModal: React.FC<SpeakingStudioModalProps> = ({
  currentLevel,
  onClose,
  onSpeakingComplete,
  activeLesson
}) => {
  // Filter items matching level or fallback to full list
  const levelItems = useMemo(() => {
    const matched = SPEAKING_ITEMS.filter((i) => i.level === currentLevel);
    return matched.length > 0 ? matched : SPEAKING_ITEMS;
  }, [currentLevel]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const item: SpeakingItem = levelItems[currentIndex] || SPEAKING_ITEMS[0];

  // Accent model selection: en-GB (Oxford RP) or en-US (General American)
  const [selectedAccent, setSelectedAccent] = useState<'en-GB' | 'en-US'>('en-GB');

  // Practice Mode: 'cursus' | 'dictation' | 'duel'
  const [practiceMode, setPracticeMode] = useState<'cursus' | 'dictation' | 'duel'>('cursus');
  const isFreeDictationMode = practiceMode === 'dictation';
  const isDuelMode = practiceMode === 'duel';

  // 3D Web Audio Acoustic Environment Preset
  const [acousticRoom, setAcousticRoom] = useState<StudioAcousticPreset>(() =>
    getStudioAcousticPreset()
  );

  const [customPracticeText, setCustomPracticeText] = useState<string>('');

  // Active view tab once recorded: 'diagnostic' (orthographic & phonetic) vs 'waveform' (acoustic wave) vs 'duel'
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'waveform' | 'duel'>('diagnostic');

  // Studio workflow states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Live audio analysis states during recording
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [liveBars, setLiveBars] = useState<number[]>([15, 20, 15, 25, 18, 30, 22, 16, 28, 14]);

  // Comparative acoustic analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [userWaveform, setUserWaveform] = useState<number[] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AcousticAnalysisResult | null>(null);

  // Speech Recognition states
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [phoneticReport, setPhoneticReport] = useState<PhoneticCorrectionReport | null>(null);

  // Studio d'Élocution Skill & Automated Reference-Phoneme Vocal Feedback states
  const [skillLoadState, setSkillLoadState] = useState<'loading' | 'loaded' | 'disabled' | 'unavailable'>('loading');
  const [skillLoadedEntry, setSkillLoadedEntry] = useState<LoadedContextSkillEntry | null>(null);
  const [skillLoadReason, setSkillLoadReason] = useState<string>('');
  const [autoVocalFeedbackEnabled, setAutoVocalFeedbackEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eb_msz_auto_vocal_feedback');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [vocalPlaybackMode, setVocalPlaybackMode] = useState<VocalFeedbackPlaybackMode>('full');
  const [vocalFeedbackPhase, setVocalFeedbackPhase] = useState<VocalFeedbackPhase>('idle');

  // Refs for audio hardware and speech recognizer
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const liveAnimFrameRef = useRef<number | null>(null);
  const speechRecognizerRef = useRef<SpeechRecognitionController | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const vocalFeedbackCancelRef = useRef<(() => void) | null>(null);
  const pendingAutoFeedbackRef = useRef<boolean>(false);
  const currentRecordingSessionIdRef = useRef<string | null>(null);
  const lastPersistedEvalSignatureRef = useRef<string>('');

  // Effective practice target text based on mode
  const effectiveTargetText = useMemo(() => {
    if (isFreeDictationMode && customPracticeText.trim()) {
      return customPracticeText.trim();
    }
    return item.textToRead;
  }, [isFreeDictationMode, customPracticeText, item.textToRead]);

  // Generate reference native model whenever target text or accent changes
  const nativeModel: NativeProsodyModel = useMemo(() => {
    return generateNativeProsodyModel(effectiveTargetText, selectedAccent, 100);
  }, [effectiveTargetText, selectedAccent]);

  // Reference-phoneme evaluation derived from real recognition & acoustic telemetry
  const phonemeEvaluation: PhonemeEvaluationResult | null = useMemo(() => {
    if (!phoneticReport) return null;
    return analyzeReferencePhonemes({
      expectedText: effectiveTargetText,
      phoneticHints: isFreeDictationMode ? '' : item.phoneticHints,
      report: phoneticReport,
      targetAccent: selectedAccent,
      acousticResult: analysisResult,
      audioFormat: audioBlob?.type || 'audio/webm'
    });
  }, [
    phoneticReport,
    effectiveTargetText,
    isFreeDictationMode,
    item.phoneticHints,
    selectedAccent,
    analysisResult,
    audioBlob
  ]);

  const stopAutomatedVocalFeedback = () => {
    pendingAutoFeedbackRef.current = false;
    if (vocalFeedbackCancelRef.current) {
      vocalFeedbackCancelRef.current();
      vocalFeedbackCancelRef.current = null;
    }
    setVocalFeedbackPhase('idle');
  };

  const triggerAutomatedVocalFeedback = (
    evalData: PhonemeEvaluationResult | null = phonemeEvaluation,
    modeOverride?: VocalFeedbackPlaybackMode
  ) => {
    if (!evalData) return;
    stopAutomatedVocalFeedback();
    const cancel = playAutomatedVocalFeedback(evalData.vocalFeedbackPlan, {
      mode: modeOverride ?? vocalPlaybackMode,
      onPhaseChange: setVocalFeedbackPhase,
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

  const handleToggleAutoVocalFeedback = (enabled: boolean) => {
    setAutoVocalFeedbackEnabled(enabled);
    try {
      localStorage.setItem('eb_msz_auto_vocal_feedback', String(enabled));
    } catch {
      // ignore storage failure
    }
  };

  // Check speech recognition capability & load real Studio d'Élocution Skill context on mount
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionAvailable());

    let cancelled = false;
    selectSkillsForTask(
      "Studio d'Élocution : analyse audio, transcription mot-à-mot, phonèmes de référence, rétroaction vocale automatisée TTS et synchronisation prosodique",
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
          setSkillLoadReason('La compétence audio-music-intelligence est actuellement désactivée dans skills/index.json.');
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

  // Automatically persist real Studio d'Élocution phoneme telemetry and play vocal feedback once settled
  useEffect(() => {
    if (isRecording || isAnalyzing || !phonemeEvaluation) {
      return;
    }

    if (phonemeEvaluation.vocalFeedbackPlan.hasSpeechDetected) {
      const sessionId =
        currentRecordingSessionIdRef.current ||
        `spk_sess_${Date.now()}_${item.id}`;
      currentRecordingSessionIdRef.current = sessionId;

      const evalSignature = `${sessionId}|${selectedAccent}|${phonemeEvaluation.phonemeAccuracyScore}|${phonemeEvaluation.phonemeStatuses
        .map((s) => `${s.symbol}:${s.status}`)
        .join(',')}`;

      if (lastPersistedEvalSignatureRef.current !== evalSignature) {
        lastPersistedEvalSignatureRef.current = evalSignature;
        saveSpeakingPhonemeTelemetry({
          sessionId,
          moduleId: isFreeDictationMode ? 'dictation-free' : item.id,
          title: isFreeDictationMode ? 'Dictée Vocale Libre' : item.title,
          level: item.level,
          targetAccent: selectedAccent,
          phonemeAccuracyScore: phonemeEvaluation.phonemeAccuracyScore,
          overallScore: phoneticReport?.overallScore ?? phonemeEvaluation.phonemeAccuracyScore,
          recordedAt: new Date().toISOString(),
          validated: false,
          source: 'studio_recording',
          phonemeStatuses: phonemeEvaluation.phonemeStatuses.map((s) => ({
            symbol: s.symbol,
            status: s.status,
            occurrences: s.occurrences,
            exampleWords: s.exampleWords
          }))
        });
      }
    }

    if (!pendingAutoFeedbackRef.current) {
      return;
    }
    pendingAutoFeedbackRef.current = false;
    if (!autoVocalFeedbackEnabled || skillLoadState === 'disabled') {
      return;
    }
    const timer = setTimeout(() => {
      triggerAutomatedVocalFeedback(phonemeEvaluation);
    }, 280);
    return () => clearTimeout(timer);
  }, [
    isRecording,
    isAnalyzing,
    phonemeEvaluation,
    phoneticReport,
    item.id,
    item.title,
    item.level,
    isFreeDictationMode,
    selectedAccent,
    autoVocalFeedbackEnabled,
    skillLoadState
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAutomatedVocalFeedback();
      stopSpeech();
      stopStudioAcousticAmbiance(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleSelectAcousticRoom = (room: StudioAcousticPreset) => {
    setAcousticRoom(room);
    setStudioAcousticPreset(room);
    playStudioModeSwitchCue3D('room', room);
    if (isRecording) {
      if (room === 'off') {
        stopStudioAcousticAmbiance();
      } else {
        startStudioAcousticAmbiance(room);
      }
    }
  };

  // Reset analysis when changing item or accent
  const handleSelectNextItem = () => {
    playStudioNavCue3D('next');
    resetRecordingState();
    setCurrentIndex((prev) => (prev + 1) % levelItems.length);
  };

  const handleSelectPrevItem = () => {
    playStudioNavCue3D('prev');
    resetRecordingState();
    setCurrentIndex((prev) => (prev - 1 + levelItems.length) % levelItems.length);
  };

  const resetRecordingState = () => {
    stopAutomatedVocalFeedback();
    stopSpeech();
    stopStudioAcousticAmbiance();
    setIsRecording(false);
    currentRecordingSessionIdRef.current = null;
    lastPersistedEvalSignatureRef.current = '';
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setUserWaveform(null);
    setAnalysisResult(null);
    setPhoneticReport(null);
    setLiveTranscript('');
    setFinalTranscript('');
    setRecordingSeconds(0);
    setLiveVolume(0);
    setActiveTab('diagnostic');

    if (timerRef.current) clearInterval(timerRef.current);
    if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.abort();
      speechRecognizerRef.current = null;
    }
  };

  // Start real recording + Speech Recognition
  const handleStartRecording = async () => {
    resetRecordingState();
    currentRecordingSessionIdRef.current = `spk_sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setMicError(null);
    audioChunksRef.current = [];

    // 1. Initialize Microphone Stream FIRST so permission failures do not leak SpeechRecognition
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      // 2. Initialize & Start Web Speech API Recognizer once microphone is granted
      if (isSpeechRecognitionAvailable()) {
        try {
          const recognizer = new SpeechRecognitionController(selectedAccent);
          speechRecognizerRef.current = recognizer;
          recognizer.onTranscriptChange = (finalText, interimText) => {
            setLiveTranscript(interimText);
            setFinalTranscript(finalText);
          };
          recognizer.onStatusChange = (status, errMsg) => {
            if (status === 'error' && errMsg) {
              console.warn('Speech recognition warning:', errMsg);
            }
          };
          recognizer.start();
        } catch (recErr) {
          console.warn('Speech recognition start failed:', recErr);
        }
      } else {
        setSpeechSupported(false);
      }

      // Setup Web Audio Analyser for live visualizer
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLiveVisualizer = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalizedVol = avg / 255;
          setLiveVolume(normalizedVol);
          updateStudioAmbianceReactiveVolume(normalizedVol);

          // Extract 10 frequency bars
          const step = Math.floor(dataArray.length / 10);
          const newBars: number[] = [];
          for (let b = 0; b < 10; b++) {
            const val = dataArray[b * step] || 20;
            const barHeight = Math.max(10, Math.min(50, Math.round((val / 255) * 48) + 8));
            newBars.push(barHeight);
          }
          setLiveBars(newBars);

          liveAnimFrameRef.current = requestAnimationFrame(updateLiveVisualizer);
        };

        liveAnimFrameRef.current = requestAnimationFrame(updateLiveVisualizer);
      } catch (audioErr) {
        console.warn('AudioContext visualization setup error:', audioErr);
      }

      // Setup MediaRecorder for acoustic waveform
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setAudioUrl(url);

        // Run acoustic analysis automatically upon recording completion
        await performAcousticComparison(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      playStudioRecordStartCue3D();
      startStudioAcousticAmbiance(acousticRoom);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone access denied or unavailable:', err);
      setMicError(
        'Accès au microphone non autorisé ou indisponible. Veuillez autoriser votre micro dans le navigateur pour la dictée vocale et la comparaison d’élocution.'
      );
    }
  };

  // Stop recording & finalize both speech recognition and acoustic analysis
  const handleStopRecording = () => {
    // 1. Stop Speech Recognition and retrieve spoken transcript
    let recognizedText = '';
    if (speechRecognizerRef.current) {
      recognizedText = speechRecognizerRef.current.stop();
    }

    const fullSpoken = (recognizedText || `${finalTranscript} ${liveTranscript}`).trim();

    // 2. Stop MediaRecorder & Web Audio & 3D Studio Ambiance
    stopStudioAcousticAmbiance();
    playStudioRecordStopCue3D();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // 3. Run Immediate Orthographic & Phonetic Correction without faking 100% on silence
    const targetText = effectiveTargetText;
    const report = compareOrthographyAndPhonetics(targetText, fullSpoken, selectedAccent);
    if (autoVocalFeedbackEnabled && skillLoadState !== 'disabled') {
      pendingAutoFeedbackRef.current = true;
    }
    setPhoneticReport(report);
  };

  // Run acoustic comparison and waveform extraction
  const performAcousticComparison = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const extracted = await extractWaveformFromAudioBlob(blob, 100);
      setUserWaveform(extracted.waveform);

      const effectiveDuration = Math.max(
        1.5,
        extracted.duration > 0.5 ? extracted.duration : recordingSeconds || 3.5
      );

      const result = analyzeSpeechComparison(
        extracted.waveform,
        nativeModel,
        effectiveDuration,
        selectedAccent
      );

      setAnalysisResult(result);
    } catch (analysisErr) {
      console.warn('Acoustic comparison error:', analysisErr);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Validate session score into Firebase + update per-phoneme Studio telemetry
  const handleValidateSession = async () => {
    const finalScore = phoneticReport
      ? phoneticReport.overallScore
      : analysisResult
      ? analysisResult.overallScore
      : 92;

    const sessionId =
      currentRecordingSessionIdRef.current ||
      `spk_sess_${Date.now()}_${item.id}`;

    if (phonemeEvaluation && phonemeEvaluation.vocalFeedbackPlan.hasSpeechDetected) {
      saveSpeakingPhonemeTelemetry({
        sessionId,
        moduleId: isFreeDictationMode ? 'dictation-free' : item.id,
        title: isFreeDictationMode ? 'Dictée Vocale Libre' : item.title,
        level: item.level,
        targetAccent: selectedAccent,
        phonemeAccuracyScore: phonemeEvaluation.phonemeAccuracyScore,
        overallScore: finalScore,
        recordedAt: new Date().toISOString(),
        validated: true,
        source: 'studio_recording',
        phonemeStatuses: phonemeEvaluation.phonemeStatuses.map((s) => ({
          symbol: s.symbol,
          status: s.status,
          occurrences: s.occurrences,
          exampleWords: s.exampleWords
        }))
      });
    }

    playStudioValidationCue3D(finalScore);
    await recordAttempt({
      moduleId: item.id,
      moduleType: 'speaking',
      title: `${item.title} (Dictée & Élocution)`,
      level: item.level,
      score: finalScore,
      durationSeconds: Math.max(12, recordingSeconds),
      details: phonemeEvaluation
        ? {
            phonemeSessionId: sessionId,
            targetAccent: selectedAccent,
            phonemeAccuracyScore: phonemeEvaluation.phonemeAccuracyScore,
            phonemeStatuses: phonemeEvaluation.phonemeStatuses.map((s) => ({
              symbol: s.symbol,
              status: s.status,
              occurrences: s.occurrences,
              exampleWords: s.exampleWords
            }))
          }
        : {
            phonemeSessionId: sessionId,
            targetAccent: selectedAccent
          }
    });
    onSpeakingComplete?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col animate-fadeIn select-none">
      {/* Studio Top Navigation Bar with iPhone safe area clearance */}
      <header
        className="sticky top-0 z-20 px-4 sm:px-6 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)',
          minHeight: 'calc(max(env(safe-area-inset-top, 0px), 20px) + 60px)'
        }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#191f2f] transition-all cursor-pointer"
            aria-label="Fermer le studio"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-bold text-[#dce2f8] leading-tight flex items-center gap-2">
              Studio d'Élocution & Dictée Vocale
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] font-mono border border-[#f2ca50]/30 hidden sm:inline">
                Reconnaissance Vocale & IA Phonétique
              </span>
            </h1>
            <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
              Correction Orthographique & Phonétique Immédiate • Modèles Natifs UK/US
            </span>
          </div>
        </div>

        {/* Carousel pagination & close */}
        <div className="flex items-center gap-2">
          {!isFreeDictationMode && (
            <div className="flex items-center bg-[#191f2f] rounded-xl border border-[#232a3a] p-0.5">
              <button
                type="button"
                onClick={handleSelectPrevItem}
                disabled={isRecording}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] disabled:opacity-40 cursor-pointer"
                title="Exercice précédent"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <span className="px-2 text-xs font-mono text-[#d4c78f]">
                {currentIndex + 1}/{levelItems.length}
              </span>
              <button
                type="button"
                onClick={handleSelectNextItem}
                disabled={isRecording}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] disabled:opacity-40 cursor-pointer"
                title="Exercice suivant"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] cursor-pointer"
            title="Quitter"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Active Lesson Contextual Banner */}
        {activeLesson && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1e293b] via-[#151b2b] to-[#232a3a] border border-[#f2ca50]/50 shadow-lg flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shrink-0 shadow-md">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#f2ca50] font-mono font-bold uppercase tracking-widest">
                    LEÇON ACTIVE • {activeLesson.class_level}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[9px] font-mono font-bold">
                    {activeLesson.cefr_level}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#dce2f8] truncate">
                  {activeLesson.title}
                </h4>
                <span className="text-[11px] text-[#94a3b8] truncate italic">
                  {activeLesson.title_en}
                </span>
              </div>
            </div>

            {activeLesson.model_phrases && activeLesson.model_phrases.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playStudioModeSwitchCue3D('dictation');
                  setPracticeMode('dictation');
                  setCustomPracticeText(activeLesson.model_phrases[0].en);
                  resetRecordingState();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-mono text-xs font-bold transition-all active:scale-95 shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
                title="S'entraîner sur la phrase modèle de la leçon"
              >
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                <span>Phrasé de la Leçon</span>
              </button>
            )}
          </div>
        )}

        {/* Top Control Bar: Accent Selector & Practice Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-[#151b2b] border border-[#232a3a]">
          {/* Accent Selection */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-bold text-[#99907c] uppercase tracking-wider px-2">
              Modèle Natif :
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playStudioAccentCue3D('en-GB');
                  setSelectedAccent('en-GB');
                  resetRecordingState();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedAccent === 'en-GB'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-md shadow-[#f2ca50]/20'
                    : 'text-[#d0c5af] hover:text-[#f2ca50]'
                }`}
              >
                <span>🇬🇧</span>
                <span>Oxford RP (UK)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playStudioAccentCue3D('en-US');
                  setSelectedAccent('en-US');
                  resetRecordingState();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedAccent === 'en-US'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-md shadow-[#f2ca50]/20'
                    : 'text-[#d0c5af] hover:text-[#f2ca50]'
                }`}
              >
                <span>🇺🇸</span>
                <span>GenAm (US)</span>
              </button>
            </div>
          </div>

          {/* Practice Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#0a101f] p-1 rounded-xl border border-white/5 w-full sm:w-auto justify-center flex-wrap">
            <button
              type="button"
              onClick={() => {
                playStudioModeSwitchCue3D('cursus');
                setPracticeMode('cursus');
                resetRecordingState();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                practiceMode === 'cursus'
                  ? 'bg-[#1e293b] text-[#f2ca50] font-bold border border-[#f2ca50]/30 shadow-sm'
                  : 'text-[#8391ac] hover:text-white'
              }`}
            >
              Cursus Officiel
            </button>
            <button
              type="button"
              onClick={() => {
                playStudioModeSwitchCue3D('dictation');
                setPracticeMode('dictation');
                resetRecordingState();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                practiceMode === 'dictation'
                  ? 'bg-[#1e293b] text-[#f2ca50] font-bold border border-[#f2ca50]/30 shadow-sm'
                  : 'text-[#8391ac] hover:text-white'
              }`}
            >
              Dictée Libre
            </button>
            <button
              type="button"
              onClick={() => {
                playStudioModeSwitchCue3D('duel');
                setPracticeMode('duel');
                resetRecordingState();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1 ${
                practiceMode === 'duel'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-[#ffd700] font-bold border border-[#f2ca50]/50 shadow-sm'
                  : 'text-[#8391ac] hover:text-[#ffd700]'
              }`}
            >
              <span className="material-symbols-outlined text-xs">swords</span>
              <span>Duel de Prononciation</span>
            </button>
          </div>
        </div>

        {/* 3D Spatial Acoustic Environment + Skill Vocal Feedback Toggle */}
        <div className="flex flex-col gap-2.5 px-3 py-2.5 rounded-2xl bg-[#111829] border border-[#232a3a]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-[#0a101f] border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shrink-0">
                <span className="material-symbols-outlined text-base">spatial_audio_off</span>
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-mono font-bold text-[#dce2f8] flex items-center gap-1.5">
                  Acoustique Spatiale 3D
                  {isRecording && acousticRoom !== 'off' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-400/30 text-[9px] text-emerald-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Actif
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#94a3b8] truncate">
                  {STUDIO_ACOUSTIC_PRESETS[acousticRoom].description}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#0a101f] p-1 rounded-xl border border-white/5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {(['library', 'booth', 'auditorium', 'off'] as StudioAcousticPreset[]).map((presetKey) => {
                const info = STUDIO_ACOUSTIC_PRESETS[presetKey];
                const isSelected = acousticRoom === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleSelectAcousticRoom(presetKey)}
                    title={info.description}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 shadow-sm'
                        : 'text-[#8391ac] hover:text-[#dce2f8]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">{info.icon}</span>
                    <span>{info.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 flex-wrap">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                  skillLoadState === 'loaded'
                    ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                    : skillLoadState === 'disabled'
                    ? 'bg-amber-500/10 border-amber-400/30 text-amber-300'
                    : 'bg-slate-500/10 border-slate-400/25 text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {skillLoadState === 'loaded' ? 'verified' : skillLoadState === 'disabled' ? 'pause_circle' : 'graphic_eq'}
                </span>
                <span>
                  {skillLoadState === 'loaded' && skillLoadedEntry
                    ? `Skill « ${skillLoadedEntry.title} » active`
                    : skillLoadState === 'disabled'
                    ? 'Skill Audio désactivée (mode manuel)'
                    : 'Analyse Phonémique de Référence'}
                </span>
              </span>
            </div>

            <label className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#d4c78f] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoVocalFeedbackEnabled}
                onChange={(e) => handleToggleAutoVocalFeedback(e.target.checked)}
                className="accent-[#f2ca50] w-3.5 h-3.5 cursor-pointer"
              />
              <span>Rétroaction vocale automatisée (phonèmes de référence)</span>
            </label>
          </div>
        </div>

        {/* PRONUNCIATION DUEL ARENA (When Duel mode is chosen) */}
        {isDuelMode ? (
          <PronunciationDuelArena
            targetText={effectiveTargetText}
            phoneticHint={item.phoneticHints}
            sourceTitle={item.title}
            targetAccent={selectedAccent}
            onAccentChange={(acc) => {
              setSelectedAccent(acc);
              resetRecordingState();
            }}
            onDuelCompleted={async (score) => {
              await recordAttempt({
                moduleId: `duel-${item.id}`,
                moduleType: 'speaking',
                title: `${item.title} (Pronunciation Duel)`,
                level: item.level,
                score,
                durationSeconds: 15
              });
              onSpeakingComplete?.();
            }}
            onExitDuel={() => {
              setPracticeMode('cursus');
              resetRecordingState();
            }}
          />
        ) : (
          <>
            {/* Free Custom Dictation Input Mode */}
            {isFreeDictationMode && (
              <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/40 shadow-lg flex flex-col gap-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#f2ca50] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    Phrase Cible Personnalisée pour votre Dictée
                  </span>
                  <span className="text-[10px] text-[#8391ac] font-mono">
                    Tapez votre phrase ou dictez-la directement
                  </span>
                </div>
                <textarea
                  value={customPracticeText}
                  onChange={(e) => setCustomPracticeText(e.target.value)}
                  placeholder="Entrez la phrase anglaise que vous souhaitez dicter (ex: 'The ambassador delivered a thoughtful address on international trade.')..."
                  rows={2}
                  className="w-full bg-[#0a101f] border border-[#2e3b55] focus:border-[#f2ca50] rounded-xl p-3 text-sm text-[#dce2f8] font-serif focus:outline-none placeholder-[#8391ac]/60 transition-colors"
                />
              </div>
            )}

            {/* Text To Read Excerpt Card (Curriculum Passage) */}
            {!isFreeDictationMode && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#151b2b] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider">
                      {item.source}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#232a3a] text-[#d4c78f] font-mono">
                      Niveau {item.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#99907c] font-mono">
                    Cible : {selectedAccent === 'en-GB' ? 'British RP' : 'American GenAm'}
                  </span>
                </div>

                <h2 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8]">
                  {item.title}
                </h2>

                <blockquote className="font-serif italic text-base sm:text-lg text-[#f1e3a9] leading-relaxed bg-[#070e1d]/80 p-4 sm:p-5 rounded-xl border border-[#4d4635]/30">
                  {item.textToRead}
                </blockquote>

                {/* Phonetic transcription & Rhythm tips */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#232a3a] text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#99907c] uppercase text-[10px] font-bold">Transcription Phonétique :</span>
                    <span className="text-[#d4c78f] font-mono bg-[#070e1d] px-2 py-0.5 rounded border border-[#232a3a]">
                      {item.phoneticHints}
                    </span>
                  </div>
                  <p className="text-[#d0c5af]/80 text-[11px] leading-relaxed mt-1">
                    <strong className="text-[#f2ca50]">Conseil de prosodie :</strong> {item.rhythmTips}
                  </p>
                </div>
              </div>
            )}

            {/* Dual Audio Reference buttons */}
            <DualSpeakerButton
              text={effectiveTargetText}
              id={`speaking-ref-${item.id}`}
              phonetic={item.phoneticHints}
              explanation="Écoutez le modèle britannique ou américain pour imprégner votre mémoire auditive avant de dicter"
              variant="prominent"
            />

            {/* Pronunciation Duel Quick Launch Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#f2ca50]/15 to-yellow-500/10 border border-[#f2ca50]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#070c17] border border-[#f2ca50]/50 flex items-center justify-center text-[#ffd700] shadow-inner shrink-0">
                  <span className="material-symbols-outlined text-xl">swords</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-black text-[#ffd700] uppercase tracking-wider flex items-center gap-1.5">
                    Pronunciation Duel • Défi Spectral Temps Réel
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-[#ffe082] text-[9px] font-mono">
                      TEMPS RÉEL
                    </span>
                  </span>
                  <span className="text-[11px] text-[#cbd5e1] leading-tight">
                    Comparez en direct votre spectre audio 60 FPS avec le modèle natif ({selectedAccent === 'en-GB' ? 'UK 🇬🇧' : 'US 🇺🇸'}).
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playStudioModeSwitchCue3D('duel');
                  resetRecordingState();
                  setPracticeMode('duel');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000] text-xs font-mono font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0 justify-center"
              >
                <span className="material-symbols-outlined text-sm">swords</span>
                <span>Lancer le Duel</span>
              </button>
            </div>

        {/* ============================================================== */}
        {/* VOICE RECORDING & LIVE SPEECH RECOGNITION STUDIO CONTROLS */}
        {/* ============================================================== */}
        <div className="p-6 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col items-center text-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase font-bold text-[#d4c78f] tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">record_voice_over</span>
              Capture Vocale & Reconnaissance de Dictée
            </span>
            <span className="font-mono text-3xl font-bold text-[#f2ca50]">
              00:{recordingSeconds < 10 ? '0' + recordingSeconds : recordingSeconds}
            </span>
          </div>

          {/* Real-time frequency bars animated via AnalyserNode */}
          <div className="flex items-center gap-1.5 h-14 px-4 justify-center w-full max-w-xs">
            {liveBars.map((height, i) => (
              <span
                key={i}
                className={`flex-1 rounded-full transition-all duration-100 ${
                  isRecording
                    ? 'bg-gradient-to-t from-[#ffb4ab] to-[#f2ca50]'
                    : 'bg-[#232a3a]'
                }`}
                style={{
                  height: isRecording ? `${height}px` : '14px',
                  opacity: isRecording ? Math.max(0.4, liveVolume * 1.5) : 0.3
                }}
              />
            ))}
          </div>

          {/* Master Record / Stop Button */}
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-xl shadow-[#f2ca50]/25 hover:bg-[#ffe088] active:scale-95 transition-all p-4 group cursor-pointer"
              title="Commencer la dictée vocale"
            >
              <span
                className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mic
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#ffb4ab] text-[#690005] flex items-center justify-center shadow-xl shadow-[#ffb4ab]/30 animate-pulse active:scale-95 transition-all p-4 cursor-pointer"
              title="Arrêter et analyser la dictée"
            >
              <span className="material-symbols-outlined text-3xl sm:text-4xl">stop</span>
            </button>
          )}

          <p className="text-xs text-[#d0c5af]/80">
            {!isRecording
              ? 'Touchez le micro pour dicter votre pratique à voix haute'
              : 'Dictée en cours... Touchez pour finaliser et recevoir la correction orthographique et phonétique immédiate.'}
          </p>

          {/* Live Speech Recognition Transcription Box while recording */}
          {isRecording && (
            <div className="w-full max-w-lg p-3.5 rounded-xl bg-[#0a101f] border border-[#f2ca50]/50 shadow-inner flex flex-col gap-2 text-left animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#f2ca50] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Reconnaissance Vocale ({selectedAccent === 'en-GB' ? 'UK 🇬🇧' : 'US 🇺🇸'}) :
                </span>
                <span className="text-[#8391ac]">Écoute active...</span>
              </div>
              <p className="font-serif text-sm text-white italic min-h-[36px] leading-relaxed">
                {finalTranscript}{' '}
                <span className="text-[#ffe082] underline decoration-dashed">
                  {liveTranscript || (finalTranscript ? '' : 'Parlez maintenant...')}
                </span>
              </p>
            </div>
          )}

          {micError && (
            <p className="text-xs text-[#ffb4ab] bg-[#93000a]/30 p-2.5 rounded-xl border border-[#ffb4ab]/40">
              {micError}
            </p>
          )}

          {!speechSupported && (
            <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>
                Note : Votre navigateur n'intègre pas l'API Web Speech native. L'évaluation orthographique et phonétique utilisera le moteur phonétique de secours.
              </span>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-[#f2ca50] animate-pulse">
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
              <span>Analyse acoustique, transcription et diagnostic phonétique immédiat en cours...</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* POST-RECORDING ANALYSIS: TAB SWITCHER & DIAGNOSTIC VIEWS */}
        {/* ============================================================== */}
        {(phoneticReport || (userWaveform && analysisResult)) && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* View Mode Selector Tabs */}
            <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  playStudioModeSwitchCue3D('tab');
                  setActiveTab('diagnostic');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'diagnostic'
                    ? 'bg-[#f2ca50] text-[#0c1322] shadow-md'
                    : 'text-[#8391ac] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                <span>Correction Orthographique & Phonétique</span>
                {phoneticReport && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#0c1322]/20 text-[10px]">
                    {phoneticReport.overallScore}%
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playStudioModeSwitchCue3D('tab');
                  setActiveTab('waveform');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'waveform'
                    ? 'bg-[#f2ca50] text-[#0c1322] shadow-md'
                    : 'text-[#8391ac] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">graphic_eq</span>
                <span>Onde Acoustique & Prosodie</span>
                {analysisResult && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#0c1322]/20 text-[10px]">
                    {analysisResult.overallScore}%
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playStudioModeSwitchCue3D('duel');
                  setActiveTab('duel');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'duel'
                    ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#0c1322] shadow-md'
                    : 'text-[#ffd700] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">swords</span>
                <span>Duel Spectral Temps Réel</span>
              </button>
            </div>

            {/* TAB 1: IMMEDIATE ORTHOGRAPHIC & PHONETIC DIAGNOSTIC + AUTOMATED VOCAL PHONEME FEEDBACK */}
            {activeTab === 'diagnostic' && phoneticReport && (
              <div className="flex flex-col gap-5">
                {phonemeEvaluation && (
                  <PhonemeVocalFeedbackPanel
                    evaluation={phonemeEvaluation}
                    targetAccent={selectedAccent}
                    skillLoadedEntry={skillLoadedEntry}
                    skillLoadState={skillLoadState}
                    skillLoadReason={skillLoadReason}
                    autoFeedbackEnabled={autoVocalFeedbackEnabled}
                    onToggleAutoFeedback={handleToggleAutoVocalFeedback}
                    playbackMode={vocalPlaybackMode}
                    onChangePlaybackMode={setVocalPlaybackMode}
                    activePhase={vocalFeedbackPhase}
                    onPlayFeedback={(modeOverride) =>
                      triggerAutomatedVocalFeedback(phonemeEvaluation, modeOverride)
                    }
                    onStopFeedback={stopAutomatedVocalFeedback}
                  />
                )}

                <SpeechRecognitionDiagnosticCard
                  report={phoneticReport}
                  targetText={effectiveTargetText}
                  spokenTranscript={`${finalTranscript} ${liveTranscript}`.trim()}
                  targetAccent={selectedAccent}
                  onReRecord={handleStartRecording}
                  onValidate={handleValidateSession}
                  onSwitchToWaveform={() => setActiveTab('waveform')}
                />
              </div>
            )}

            {/* TAB 2: ACOUSTIC WAVEFORM COMPARISON TOOL COMPONENT */}
            {activeTab === 'waveform' && userWaveform && analysisResult && (
              <SpeechWaveformComparator
                nativeModel={nativeModel}
                userWaveform={userWaveform}
                analysisResult={analysisResult}
                textToRead={effectiveTargetText}
                targetAccent={selectedAccent}
                accentLabel={selectedAccent === 'en-GB' ? 'Oxford RP (UK)' : 'General American (US)'}
                userAudioUrl={audioUrl}
                onReRecord={handleStartRecording}
                onValidate={handleValidateSession}
              />
            )}

            {/* TAB 3: REAL-TIME PRONUNCIATION DUEL ARENA */}
            {activeTab === 'duel' && (
              <PronunciationDuelArena
                targetText={effectiveTargetText}
                phoneticHint={item.phoneticHints}
                sourceTitle={item.title}
                targetAccent={selectedAccent}
                onAccentChange={(acc) => {
                  setSelectedAccent(acc);
                  resetRecordingState();
                }}
                onDuelCompleted={async (score) => {
                  await recordAttempt({
                    moduleId: `duel-${item.id}`,
                    moduleType: 'speaking',
                    title: `${item.title} (Pronunciation Duel)`,
                    level: item.level,
                    score,
                    durationSeconds: 15,
                    details: {
                      targetAccent: selectedAccent,
                      mode: 'duel'
                    }
                  });
                  onSpeakingComplete?.();
                }}
                onExitDuel={() => {
                  setActiveTab('diagnostic');
                }}
              />
            )}
          </div>
        )}
      </>
    )}
      </main>
    </div>
  );
};
