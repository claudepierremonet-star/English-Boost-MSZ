import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SPEAKING_ITEMS, type SpeakingItem } from '../data/curriculum';
import { recordAttempt } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import { DualSpeakerButton } from './DualSpeakerButton';
import { SpeechWaveformComparator } from './SpeechWaveformComparator';
import {
  generateNativeProsodyModel,
  extractWaveformFromAudioBlob,
  analyzeSpeechComparison,
  type NativeProsodyModel,
  type AcousticAnalysisResult
} from '../utils/speechAcousticAnalyzer';
import { stopSpeech } from '../services/speechService';

interface SpeakingStudioModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onSpeakingComplete?: () => void;
}

export const SpeakingStudioModal: React.FC<SpeakingStudioModalProps> = ({
  currentLevel,
  onClose,
  onSpeakingComplete
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

  // Studio workflow states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Live audio analysis states during recording
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [liveBars, setLiveBars] = useState<number[]>([15, 20, 15, 25, 18, 30, 22, 16, 28, 14]);

  // Comparative analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [userWaveform, setUserWaveform] = useState<number[] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AcousticAnalysisResult | null>(null);

  // Refs for audio hardware
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const liveAnimFrameRef = useRef<number | null>(null);

  // Generate reference native model whenever item or accent changes
  const nativeModel: NativeProsodyModel = useMemo(() => {
    return generateNativeProsodyModel(item.textToRead, selectedAccent, 100);
  }, [item.textToRead, selectedAccent]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Reset analysis when changing item or accent
  const handleSelectNextItem = () => {
    resetRecordingState();
    setCurrentIndex((prev) => (prev + 1) % levelItems.length);
  };

  const handleSelectPrevItem = () => {
    resetRecordingState();
    setCurrentIndex((prev) => (prev - 1 + levelItems.length) % levelItems.length);
  };

  const resetRecordingState = () => {
    stopSpeech();
    setIsRecording(false);
    setAudioUrl(null);
    setAudioBlob(null);
    setUserWaveform(null);
    setAnalysisResult(null);
    setRecordingSeconds(0);
    setLiveVolume(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  };

  // Start real recording with Web Audio API AnalyserNode
  const handleStartRecording = async () => {
    resetRecordingState();
    setMicError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

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
          setLiveVolume(avg / 255);

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

      // Setup MediaRecorder
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Run acoustic analysis automatically upon recording completion
        await performAcousticComparison(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone access denied or unavailable:', err);
      setMicError(
        'Accès au microphone non autorisé ou indisponible. Veuillez autoriser votre micro dans le navigateur pour la comparaison d’élocution.'
      );
    }
  };

  // Stop recording & finalize
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
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

  // Validate session score into Firebase
  const handleValidateSession = async () => {
    const finalScore = analysisResult ? analysisResult.overallScore : 90;
    await recordAttempt({
      moduleId: item.id,
      moduleType: 'speaking',
      title: item.title,
      level: item.level,
      score: finalScore,
      durationSeconds: Math.max(12, recordingSeconds)
    });
    onSpeakingComplete?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#191f2f] transition-all"
            aria-label="Fermer le studio"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-bold text-[#dce2f8] leading-tight flex items-center gap-2">
              Speaking Studio
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] font-mono border border-[#f2ca50]/30">
                Acoustic Waveform Pro
              </span>
            </h1>
            <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
              Comparaison d'Élocution & Accentuation
            </span>
          </div>
        </div>

        {/* Carousel pagination & close */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#191f2f] rounded-xl border border-[#232a3a] p-0.5">
            <button
              type="button"
              onClick={handleSelectPrevItem}
              disabled={isRecording}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] disabled:opacity-40"
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] disabled:opacity-40"
              title="Exercice suivant"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Accent Selector (RP British vs US General American) */}
        <div className="p-1.5 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between">
          <span className="text-xs font-bold text-[#99907c] uppercase tracking-wider px-3">
            Modèle Natif :
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedAccent('en-GB');
                resetRecordingState();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
                setSelectedAccent('en-US');
                resetRecordingState();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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

        {/* Text To Read Excerpt Card */}
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
              <span className="text-[#99907c] uppercase text-[10px] font-bold">Transcription :</span>
              <span className="text-[#d4c78f] font-mono bg-[#070e1d] px-2 py-0.5 rounded border border-[#232a3a]">
                {item.phoneticHints}
              </span>
            </div>
            <p className="text-[#d0c5af]/80 text-[11px] leading-relaxed mt-1">
              <strong className="text-[#f2ca50]">Conseil de prosodie :</strong> {item.rhythmTips}
            </p>
          </div>
        </div>

        {/* Dual Audio Reference buttons */}
        <DualSpeakerButton
          text={item.textToRead}
          id={`speaking-ref-${item.id}`}
          phonetic={item.phoneticHints}
          explanation="Écoutez le modèle britannique ou américain pour imprégner votre mémoire auditive"
          variant="prominent"
        />

        {/* ============================================================== */}
        {/* VOICE RECORDING STUDIO CONTROLS */}
        {/* ============================================================== */}
        <div className="p-6 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col items-center text-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase font-bold text-[#d4c78f] tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">record_voice_over</span>
              Enregistrement & Capture Vocale
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
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-xl shadow-[#f2ca50]/25 hover:bg-[#ffe088] active:scale-95 transition-all p-4 group"
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
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#ffb4ab] text-[#690005] flex items-center justify-center shadow-xl shadow-[#ffb4ab]/30 animate-pulse active:scale-95 transition-all p-4"
            >
              <span className="material-symbols-outlined text-3xl sm:text-4xl">stop</span>
            </button>
          )}

          <p className="text-xs text-[#d0c5af]/80">
            {!isRecording
              ? 'Touchez le micro pour enregistrer votre lecture à voix haute'
              : 'Enregistrement en cours... Touchez pour finaliser et lancer la comparaison d’élocution.'}
          </p>

          {micError && (
            <p className="text-xs text-[#ffb4ab] bg-[#93000a]/30 p-2.5 rounded-xl border border-[#ffb4ab]/40">
              {micError}
            </p>
          )}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-[#f2ca50] animate-pulse">
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
              <span>Extraction de l'onde sonore et comparaison prosodique en cours...</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* ACOUSTIC WAVEFORM COMPARISON TOOL COMPONENT */}
        {/* ============================================================== */}
        {userWaveform && analysisResult && (
          <div className="animate-fadeIn">
            <SpeechWaveformComparator
              nativeModel={nativeModel}
              userWaveform={userWaveform}
              analysisResult={analysisResult}
              textToRead={item.textToRead}
              targetAccent={selectedAccent}
              accentLabel={selectedAccent === 'en-GB' ? 'Oxford RP (UK)' : 'General American (US)'}
              userAudioUrl={audioUrl}
              onReRecord={handleStartRecording}
              onValidate={handleValidateSession}
            />
          </div>
        )}
      </main>
    </div>
  );
};
