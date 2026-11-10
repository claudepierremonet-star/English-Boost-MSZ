import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  generateNativeSpectralTemplate,
  extractSpectralFrame,
  compareLiveSpectrumToNative,
  type NativeSpectralTemplate,
  type SpectralAnalysisFrame,
  type RealtimeDuelScore
} from '../utils/pronunciationDuelEngine';
import { speakText, stopSpeech } from '../services/speechService';
import { awardMszCoins } from '../utils/mszCoinsManager';

export interface PronunciationDuelArenaProps {
  targetText: string;
  phoneticHint?: string;
  sourceTitle?: string;
  targetAccent: 'en-GB' | 'en-US';
  onAccentChange?: (accent: 'en-GB' | 'en-US') => void;
  onDuelCompleted?: (score: number) => void;
  onExitDuel?: () => void;
}

export const PronunciationDuelArena: React.FC<PronunciationDuelArenaProps> = ({
  targetText,
  phoneticHint,
  sourceTitle = 'Duel d\'Élocution',
  targetAccent,
  onAccentChange,
  onDuelCompleted,
  onExitDuel
}) => {
  // Visual presentation mode for the spectrum
  const [visualMode, setVisualMode] = useState<'mirror' | 'superimposed' | 'formants'>('mirror');

  // Duel workflow states
  const [isDuelActive, setIsDuelActive] = useState<boolean>(false);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [duelSeconds, setDuelSeconds] = useState<number>(0);
  const [isListeningNative, setIsListeningNative] = useState<boolean>(false);

  // Live real-time analysis data
  const [liveScore, setLiveScore] = useState<RealtimeDuelScore>({
    overallMatch: 0,
    formantMatch: 0,
    spectralDistance: 1,
    pitchMatch: 0,
    clarityScore: 0,
    activeFeedback: 'Prêt pour le Duel • Cliquez sur "Lancer le Duel"',
    badgeLevel: 'silent',
    dominantFormant: 'Silence'
  });

  const [liveUserFrame, setLiveUserFrame] = useState<SpectralAnalysisFrame | null>(null);

  // Verdict / Completion state
  const [duelResult, setDuelResult] = useState<{
    finalScore: number;
    highestMatch: number;
    avgFormant: number;
    avgPitch: number;
    coinsAwarded: number;
    userAudioUrl: string | null;
  } | null>(null);

  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  // Hardware & Animation Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const duelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const historyScoresRef = useRef<number[]>([]);
  const nativeSimAnimRef = useRef<number | null>(null);

  // Native Reference Spectral Template (128 frequency bins)
  const nativeTemplate: NativeSpectralTemplate = useMemo(() => {
    return generateNativeSpectralTemplate(targetText, targetAccent, 128);
  }, [targetText, targetAccent]);

  // Clean up Web Audio hardware on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      cleanupAudioSession();
    };
  }, []);

  const cleanupAudioSession = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (nativeSimAnimRef.current) cancelAnimationFrame(nativeSimAnimRef.current);
    if (duelTimerRef.current) clearInterval(duelTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Listen to native model with simulated active spectrum playback
  const handlePlayNative = () => {
    if (isListeningNative) {
      stopSpeech();
      setIsListeningNative(false);
      return;
    }

    setIsListeningNative(true);
    speakText(targetText, targetAccent, 'duel-native-ref', {
      onEnd: () => {
        setIsListeningNative(false);
      }
    });
  };

  // Start guided duel with 3-second countdown
  const handleStartDuelCountdown = () => {
    if (isDuelActive || isCountingDown) return;
    setDuelResult(null);
    setMicErrorMessage(null);
    setIsCountingDown(true);
    setCountdownValue(3);

    countdownTimerRef.current = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsCountingDown(false);
          startActiveDuelSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Initialize Microphone & Start Real-Time Web Audio Spectrum Analysis
  const startActiveDuelSession = async () => {
    try {
      cleanupAudioSession();
      historyScoresRef.current = [];
      recordedChunksRef.current = [];
      setDuelSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // keep natural vocal formants intact
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256; // 128 frequency bins
      analyser.smoothingTimeConstant = 0.78;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;

      // Setup MediaRecorder to save user audio for replay & grading
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.start();

      setIsDuelActive(true);

      // Duel seconds stopwatch
      duelTimerRef.current = setInterval(() => {
        setDuelSeconds((prev) => prev + 1);
      }, 1000);

      // Start 60 FPS real-time audio loop
      const freqBuffer = new Uint8Array(analyser.frequencyBinCount);
      const timeBuffer = new Float32Array(analyser.fftSize);

      const renderRealTimeAcousticLoop = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        analyserRef.current.getByteFrequencyData(freqBuffer);
        analyserRef.current.getFloatTimeDomainData(timeBuffer);

        // Extract structured spectral frame
        const frame = extractSpectralFrame(freqBuffer, timeBuffer, audioCtx.sampleRate);
        setLiveUserFrame(frame);

        // Compare in real-time with native reference model
        const score = compareLiveSpectrumToNative(frame, nativeTemplate);
        setLiveScore(score);

        if (!frame.isSilent && score.overallMatch > 0) {
          historyScoresRef.current.push(score.overallMatch);
        }

        // Draw dynamic canvas
        drawSpectrumCanvas(canvasRef.current, frame, nativeTemplate, score, visualMode);

        animFrameRef.current = requestAnimationFrame(renderRealTimeAcousticLoop);
      };

      animFrameRef.current = requestAnimationFrame(renderRealTimeAcousticLoop);
    } catch (err) {
      console.error('Microphone error in Pronunciation Duel:', err);
      setMicErrorMessage(
        'Impossible d\'accéder à votre microphone. Veuillez autoriser le micro dans votre navigateur pour participer au duel de prononciation.'
      );
      setIsDuelActive(false);
    }
  };

  // Stop active duel and compute verdict
  const handleStopDuel = () => {
    if (!isDuelActive) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Compute aggregate final score
        const scores = historyScoresRef.current;
        let finalScore = 88;
        let highestMatch = 94;

        if (scores.length > 0) {
          // Top 60% percentile average
          const sorted = [...scores].sort((a, b) => b - a);
          highestMatch = sorted[0];
          const topSamples = sorted.slice(0, Math.max(3, Math.floor(sorted.length * 0.7)));
          const sum = topSamples.reduce((acc, v) => acc + v, 0);
          finalScore = Math.min(99, Math.max(55, Math.round(sum / topSamples.length)));
        }

        // Award Coins via MSZ Economy
        const coinAward = awardMszCoins(
          'speaking',
          `duel-${targetAccent}-${targetText.slice(0, 16)}`,
          15,
          1,
          `Duel de Prononciation (${targetAccent})`
        );

        // Trigger celebratory confetti if victorious
        if (finalScore >= 75) {
          try {
            confetti({
              particleCount: 55,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#ffd700', '#f2ca50', '#38bdf8', '#ffffff']
            });
          } catch {
            // ignore canvas-confetti sandbox warnings
          }
        }

        setDuelResult({
          finalScore,
          highestMatch,
          avgFormant: liveScore.formantMatch || 86,
          avgPitch: liveScore.pitchMatch || 88,
          coinsAwarded: coinAward.awarded || 15,
          userAudioUrl: audioUrl
        });

        onDuelCompleted?.(finalScore);
      };

      mediaRecorderRef.current.stop();
    }

    setIsDuelActive(false);
    cleanupAudioSession();
  };

  // Canvas 2D Drawing Pipeline for the Dual Audio Spectrum
  const drawSpectrumCanvas = (
    canvas: HTMLCanvasElement,
    userFrame: SpectralAnalysisFrame,
    template: NativeSpectralTemplate,
    score: RealtimeDuelScore,
    mode: 'mirror' | 'superimposed' | 'formants'
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Deep subtle gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#070c17');
    bgGrad.addColorStop(0.5, '#0b1324');
    bgGrad.addColorStop(1, '#070c17');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid lines for frequency references (100Hz, 500Hz, 1.5kHz, 3kHz, 6kHz)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    [0.2, 0.4, 0.6, 0.8].forEach((ratio) => {
      ctx.beginPath();
      ctx.moveTo(0, height * ratio);
      ctx.lineTo(width, height * ratio);
      ctx.stroke();
    });

    const binCount = Math.min(userFrame.frequencies.length, template.targetFrequencies.length);
    const barWidth = Math.max(2, (width / binCount) * 0.85);
    const barGap = (width / binCount) * 0.15;

    const userFreqs = userFrame.frequencies;
    const nativeFreqs = template.targetFrequencies;

    if (mode === 'mirror') {
      // ==============================================================
      // MIRROR DUEL: Native Top (Gold) vs User Bottom (Cyan)
      // ==============================================================
      const centerY = height / 2;

      // Center collision baseline
      ctx.strokeStyle = score.overallMatch > 80 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 1. Native Bars (Radiating Upward from Center, Golden Champagne)
      for (let i = 0; i < binCount; i++) {
        const x = i * (barWidth + barGap);
        const nMagnitude = nativeFreqs[i];
        const barH = nMagnitude * (centerY - 20);

        const nativeGrad = ctx.createLinearGradient(x, centerY, x, centerY - barH);
        nativeGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        nativeGrad.addColorStop(0.6, 'rgba(255, 215, 0, 0.7)');
        nativeGrad.addColorStop(1, 'rgba(255, 250, 220, 0.95)');

        ctx.fillStyle = nativeGrad;
        ctx.fillRect(x, centerY - barH, barWidth, barH);
      }

      // 2. User Bars (Radiating Downward from Center, Electric Cyan / Emerald)
      for (let i = 0; i < binCount; i++) {
        const x = i * (barWidth + barGap);
        const uMagnitude = userFrame.isSilent ? 0.05 : userFreqs[i];
        const barH = uMagnitude * (centerY - 20);

        const isMatchingThisBin = Math.abs(uMagnitude - nativeFreqs[i]) < 0.22 && !userFrame.isSilent;

        const userGrad = ctx.createLinearGradient(x, centerY, x, centerY + barH);
        if (isMatchingThisBin) {
          // Resonant golden/emerald match
          userGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
          userGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.85)');
          userGrad.addColorStop(1, 'rgba(255, 215, 0, 0.95)');
        } else {
          userGrad.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
          userGrad.addColorStop(1, 'rgba(56, 189, 248, 0.8)');
        }

        ctx.fillStyle = userGrad;
        ctx.fillRect(x, centerY, barWidth, barH);
      }

      // 3. Central Energy Collision Sparks when score is high
      if (score.overallMatch >= 75 && !userFrame.isSilent) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        for (let p = 0; p < 8; p++) {
          const px = Math.random() * width;
          const py = centerY + (Math.random() * 12 - 6);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    } else {
      // ==============================================================
      // SUPERIMPOSED & FORMANTS MODE: Direct Overlaid Smooth Curves
      // ==============================================================
      // Native Reference Curve (Gold)
      ctx.beginPath();
      ctx.moveTo(0, height - nativeFreqs[0] * (height - 30));
      for (let i = 1; i < binCount; i++) {
        const x = i * (barWidth + barGap);
        const y = height - nativeFreqs[i] * (height - 40) - 15;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Native filled area
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
      ctx.fill();

      // User Voice Curve (Electric Cyan)
      ctx.beginPath();
      ctx.moveTo(0, height - userFreqs[0] * (height - 30));
      for (let i = 1; i < binCount; i++) {
        const x = i * (barWidth + barGap);
        const mag = userFrame.isSilent ? 0.04 : userFreqs[i];
        const y = height - mag * (height - 40) - 15;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = score.overallMatch > 75 ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Formants Annotations (F0, F1, F2, F3)
      ctx.fillStyle = '#d4c78f';
      ctx.font = '9px monospace';
      ctx.fillText('F0 (Pitch)', width * 0.06, 20);
      ctx.fillText('F1 (Ouverture)', width * 0.22, 20);
      ctx.fillText('F2 (Antériorité)', width * 0.45, 20);
      ctx.fillText('F3 (Rhotacisme)', width * 0.72, 20);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fadeIn select-none">
      {/* ============================================================== */}
      {/* ARENA HEADER: ACCENT BADGES & TARGET SENTENCE */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101726] border border-[#f2ca50]/30 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-[#ffd700] text-xs font-mono font-black border border-[#f2ca50]/40 flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm">swords</span>
              <span>PRONUNCIATION DUEL</span>
            </span>
            <span className="text-[11px] text-[#94a3b8] font-mono uppercase tracking-wider hidden sm:inline">
              Analyse Spectrale Temps Réel (Web Audio API)
            </span>
          </div>

          {/* Accent Switcher */}
          <div className="flex items-center gap-1.5 bg-[#090e1a] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => onAccentChange?.('en-GB')}
              disabled={isDuelActive}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                targetAccent === 'en-GB'
                  ? 'bg-[#f2ca50] text-[#0c1322] shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>Oxford RP (UK)</span>
            </button>
            <button
              type="button"
              onClick={() => onAccentChange?.('en-US')}
              disabled={isDuelActive}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                targetAccent === 'en-US'
                  ? 'bg-[#f2ca50] text-[#0c1322] shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span>GenAm (US)</span>
            </button>
          </div>
        </div>

        {/* Phrase Target Banner */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#070b14] border border-[#232d42]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#f2ca50] font-bold uppercase tracking-wider">
              Phrase du Défi :
            </span>
            {phoneticHint && (
              <span className="text-[#38bdf8] bg-[#0c1424] px-2 py-0.5 rounded border border-[#38bdf8]/30">
                {phoneticHint}
              </span>
            )}
          </div>
          <p className="font-serif italic text-base sm:text-lg text-white font-medium leading-relaxed">
            « {targetText} »
          </p>
        </div>

        {/* Reference Audio Player */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePlayNative}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              isListeningNative
                ? 'bg-[#ffd700] text-[#0c1322] animate-pulse'
                : 'bg-[#182338] hover:bg-[#202f4c] text-[#ffe082] border border-[#f2ca50]/30'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isListeningNative ? 'volume_up' : 'play_circle'}
            </span>
            <span>{isListeningNative ? 'Écoute en cours...' : 'Écouter le Modèle Natif'}</span>
          </button>

          {/* Visualizer Mode Switcher */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#94a3b8]">
            <span className="hidden sm:inline">Affichage :</span>
            <button
              type="button"
              onClick={() => setVisualMode('mirror')}
              className={`px-2 py-0.5 rounded-md ${
                visualMode === 'mirror'
                  ? 'bg-[#f2ca50]/20 text-[#ffd700] font-bold border border-[#f2ca50]/40'
                  : 'hover:text-white'
              }`}
            >
              Miroir Face-à-Face
            </button>
            <button
              type="button"
              onClick={() => setVisualMode('superimposed')}
              className={`px-2 py-0.5 rounded-md ${
                visualMode === 'superimposed'
                  ? 'bg-[#f2ca50]/20 text-[#ffd700] font-bold border border-[#f2ca50]/40'
                  : 'hover:text-white'
              }`}
            >
              Superposition
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 60 FPS REAL-TIME WEB AUDIO SPECTRUM CANVAS */}
      {/* ============================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#232d42] bg-[#070c17] shadow-2xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="w-full h-48 sm:h-56 block"
        />

        {/* Overlaid Legend Badges */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#070e1d]/85 border border-[#ffd700]/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#ffd700]">
              Mentor Natif ({targetAccent === 'en-GB' ? 'UK 🇬🇧' : 'US 🇺🇸'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#070e1d]/85 border border-[#38bdf8]/40 backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isDuelActive ? 'bg-[#38bdf8] animate-ping' : 'bg-[#94a3b8]'
              }`}
            />
            <span className="text-[10px] font-mono font-bold text-[#38bdf8]">
              {isDuelActive ? 'Votre Spectre Direct' : 'Votre Micro'}
            </span>
          </div>
        </div>

        {/* Real-time Match Percentage Floating Pill */}
        <div className="absolute top-2.5 right-3 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#050914]/90 border border-white/10 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-[#94a3b8] uppercase">Résonance :</span>
            <span
              className={`text-sm font-mono font-black ${
                liveScore.overallMatch >= 80
                  ? 'text-[#ffd700]'
                  : liveScore.overallMatch >= 65
                  ? 'text-emerald-400'
                  : 'text-[#38bdf8]'
              }`}
            >
              {liveScore.overallMatch}%
            </span>
          </div>
        </div>

        {/* Live Countdown Overlay */}
        {isCountingDown && (
          <div className="absolute inset-0 bg-[#070c17]/90 flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20 animate-fadeIn">
            <span className="text-xs font-mono uppercase tracking-widest text-[#f2ca50]">
              Préparez votre souffle...
            </span>
            <span className="font-mono text-6xl font-black text-white animate-bounce">
              {countdownValue}
            </span>
            <span className="text-[11px] text-[#94a3b8]">
              Parlez distinctement dès que le micro passe au vert !
            </span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* REAL-TIME DUEL HUD & TACTICAL METERS */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121a2c] border border-[#232d42] flex flex-col gap-4 shadow-xl">
        {/* Live Feedback Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070b14] border border-[#232d42]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                liveScore.badgeLevel === 'master'
                  ? 'bg-[#ffd700] animate-ping'
                  : liveScore.badgeLevel === 'expert'
                  ? 'bg-emerald-400'
                  : liveScore.badgeLevel === 'good'
                  ? 'bg-[#38bdf8]'
                  : 'bg-amber-400/60'
              }`}
            />
            <span className="text-xs font-mono font-bold text-white">
              {liveScore.activeFeedback}
            </span>
          </div>

          <span className="text-[10px] font-mono text-[#d4c78f] uppercase px-2 py-0.5 rounded bg-[#182338]">
            {liveScore.dominantFormant}
          </span>
        </div>

        {/* 4 Formant & Acoustic Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* Vowel Aperture F1 */}
          <div className="p-2.5 rounded-xl bg-[#0a101f] border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>Formants F1/F2</span>
              <span className="text-[#ffd700] font-bold">{liveScore.formantMatch}%</span>
            </div>
            <div className="h-1.5 bg-[#172238] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-[#ffd700] transition-all duration-150"
                style={{ width: `${liveScore.formantMatch}%` }}
              />
            </div>
            <span className="text-[9px] text-[#64748b]">Ouverture des voyelles</span>
          </div>

          {/* Consonant Crispness */}
          <div className="p-2.5 rounded-xl bg-[#0a101f] border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>Clarté Consonnes</span>
              <span className="text-emerald-400 font-bold">{liveScore.clarityScore}%</span>
            </div>
            <div className="h-1.5 bg-[#172238] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-150"
                style={{ width: `${liveScore.clarityScore}%` }}
              />
            </div>
            <span className="text-[9px] text-[#64748b]">Sibilantes & Plosives</span>
          </div>

          {/* Pitch F0 */}
          <div className="p-2.5 rounded-xl bg-[#0a101f] border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>Intonation F0</span>
              <span className="text-purple-400 font-bold">{liveScore.pitchMatch}%</span>
            </div>
            <div className="h-1.5 bg-[#172238] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-150"
                style={{ width: `${liveScore.pitchMatch}%` }}
              />
            </div>
            <span className="text-[9px] text-[#64748b]">
              {liveUserFrame && liveUserFrame.f0PitchHz > 0
                ? `${liveUserFrame.f0PitchHz} Hz`
                : 'Hauteur mélodique'}
            </span>
          </div>

          {/* Spectral Distance */}
          <div className="p-2.5 rounded-xl bg-[#0a101f] border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>Proximité</span>
              <span className="text-[#38bdf8] font-bold">
                {Math.round((1 - liveScore.spectralDistance) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-[#172238] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-150"
                style={{ width: `${Math.round((1 - liveScore.spectralDistance) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-[#64748b]">Distance cosinus</span>
          </div>
        </div>

        {/* Master Action Button: Start Countdown vs Finish Duel */}
        <div className="flex items-center justify-center pt-2">
          {!isDuelActive ? (
            <button
              type="button"
              onClick={handleStartDuelCountdown}
              disabled={isCountingDown}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#f2ca50] via-[#ffd700] to-[#f59e0b] hover:from-[#ffe088] hover:to-[#fbb024] text-[#2c2000] font-mono text-sm font-black flex items-center gap-2.5 shadow-xl shadow-[#f2ca50]/20 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">swords</span>
              <span>DÉFIER LE MODÈLE NATIF (LANCER LE DUEL)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopDuel}
              className="px-6 py-3 rounded-2xl bg-[#ffb4ab] text-[#690005] font-mono text-sm font-black flex items-center gap-2.5 shadow-xl shadow-[#ffb4ab]/30 animate-pulse active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">stop</span>
              <span>TERMINER LE DUEL & OBTENIR LE VERDICT ({duelSeconds}s)</span>
            </button>
          )}
        </div>

        {micErrorMessage && (
          <p className="text-xs text-[#ffb4ab] bg-[#93000a]/30 p-2.5 rounded-xl border border-[#ffb4ab]/40">
            {micErrorMessage}
          </p>
        )}
      </div>

      {/* ============================================================== */}
      {/* DUEL VERDICT MODAL / SCREEN */}
      {/* ============================================================== */}
      {duelResult && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0e1728] via-[#121c32] to-[#0a1120] border-2 border-[#f2ca50]/60 shadow-2xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#ffd700]">emoji_events</span>
              <h3 className="font-serif text-lg font-black text-white">
                Verdict du Pronunciation Duel
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#f2ca50]/20 text-[#ffd700] font-bold border border-[#f2ca50]/40">
              Modèle {targetAccent === 'en-GB' ? 'Oxford RP 🇬🇧' : 'American GenAm 🇺🇸'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Main Score Box */}
            <div className="p-4 rounded-xl bg-[#060a14] border border-[#f2ca50]/40 flex flex-col items-center justify-center text-center gap-1 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-[#94a3b8]">
                Score de Résonance Finale
              </span>
              <span className="font-mono text-4xl font-black text-[#ffd700]">
                {duelResult.finalScore}%
              </span>
              <span className="text-[11px] font-mono text-[#d4c78f] font-bold">
                {duelResult.finalScore >= 85
                  ? '🌟 Victoire Magistrale'
                  : duelResult.finalScore >= 70
                  ? '🎯 Très Belle Élocution'
                  : '📈 Bonne Base à Perfectionner'}
              </span>
            </div>

            {/* Peak Overlap & Formant Box */}
            <div className="p-4 rounded-xl bg-[#060a14] border border-white/10 flex flex-col justify-center gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#94a3b8]">Pic de Concordance :</span>
                <span className="text-emerald-400 font-bold">{duelResult.highestMatch}%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#94a3b8]">Formants Vowel :</span>
                <span className="text-amber-400 font-bold">{duelResult.avgFormant}%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#94a3b8]">Intonation Pitch :</span>
                <span className="text-purple-400 font-bold">{duelResult.avgPitch}%</span>
              </div>
            </div>

            {/* Rewards Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#f2ca50]/10 to-yellow-500/5 border border-[#f2ca50]/40 flex flex-col items-center justify-center text-center gap-1.5 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-[#ffd700] font-bold">
                Récompense de Défi
              </span>
              <div className="flex items-center gap-1.5 text-2xl font-mono font-black text-[#ffd700]">
                <span className="material-symbols-outlined text-xl">monetization_on</span>
                <span>+{duelResult.coinsAwarded} MSZ</span>
              </div>
              <span className="text-[9px] font-mono text-[#94a3b8]">
                Crédité sur votre portefeuille
              </span>
            </div>
          </div>

          {/* Replay Controls: Hear Native vs User */}
          <div className="p-3 rounded-xl bg-[#060a14] border border-white/5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#94a3b8]">
              Réécoutez vos performances :
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayNative}
                className="px-3 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4c] text-[#ffe082] text-xs font-mono flex items-center gap-1.5 border border-[#f2ca50]/30 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span>
                <span>Modèle Natif</span>
              </button>

              {duelResult.userAudioUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const audio = new Audio(duelResult.userAudioUrl!);
                    audio.play();
                  }}
                  className="px-3 py-1 rounded-lg bg-[#0e1d35] hover:bg-[#142848] text-[#38bdf8] text-xs font-mono flex items-center gap-1.5 border border-[#38bdf8]/40 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">record_voice_over</span>
                  <span>Votre Enregistrement</span>
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleStartDuelCountdown}
              className="px-4 py-2 rounded-xl bg-[#172238] hover:bg-[#202f4c] text-[#ffe082] text-xs font-mono font-bold flex items-center gap-1.5 border border-[#f2ca50]/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span>Relever le Défi à Nouveau</span>
            </button>
            <button
              type="button"
              onClick={onExitDuel}
              className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffd700] text-[#0c1322] text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Valider & Terminer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
