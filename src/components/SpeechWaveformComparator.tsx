import React, { useState, useEffect, useRef } from 'react';
import {
  type AcousticAnalysisResult,
  type NativeProsodyModel,
  type WordAcousticSegment
} from '../utils/speechAcousticAnalyzer';
import { speakText, stopSpeech } from '../services/speechService';

interface SpeechWaveformComparatorProps {
  nativeModel: NativeProsodyModel;
  userWaveform: number[];
  analysisResult: AcousticAnalysisResult;
  textToRead: string;
  targetAccent: 'en-GB' | 'en-US';
  accentLabel: string;
  userAudioUrl: string | null;
  onReRecord?: () => void;
  onValidate?: () => void;
}

export const SpeechWaveformComparator: React.FC<SpeechWaveformComparatorProps> = ({
  nativeModel,
  userWaveform,
  analysisResult,
  textToRead,
  targetAccent,
  accentLabel,
  userAudioUrl,
  onReRecord,
  onValidate
}) => {
  const [isPlayingRef, setIsPlayingRef] = useState<boolean>(false);
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
  const [isComparingAB, setIsComparingAB] = useState<boolean>(false);
  const [activePlayheadProgress, setActivePlayheadProgress] = useState<number>(0); // 0 to 1
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [showPitchOverlay, setShowPitchOverlay] = useState<boolean>(true);

  const refPlayAnimationRef = useRef<number | null>(null);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const comparisonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or update user audio player
  useEffect(() => {
    if (!userAudioUrl) return;
    const player = new Audio(userAudioUrl);
    userAudioPlayerRef.current = player;

    player.ontimeupdate = () => {
      if (player.duration > 0) {
        const prog = player.currentTime / player.duration;
        setActivePlayheadProgress(Math.min(1, Math.max(0, prog)));
      }
    };

    player.onended = () => {
      setIsPlayingUser(false);
      setActivePlayheadProgress(0);
    };

    player.onerror = () => {
      setIsPlayingUser(false);
      setActivePlayheadProgress(0);
    };

    return () => {
      player.pause();
    };
  }, [userAudioUrl]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (refPlayAnimationRef.current) cancelAnimationFrame(refPlayAnimationRef.current);
      if (comparisonTimeoutRef.current) clearTimeout(comparisonTimeoutRef.current);
      if (userAudioPlayerRef.current) userAudioPlayerRef.current.pause();
    };
  }, []);

  // Play Native Reference model with synchronized playhead
  const handlePlayReference = () => {
    if (isPlayingRef) {
      stopSpeech();
      setIsPlayingRef(false);
      if (refPlayAnimationRef.current) cancelAnimationFrame(refPlayAnimationRef.current);
      setActivePlayheadProgress(0);
      return;
    }

    // Stop any active user audio
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
      setIsPlayingUser(false);
    }

    setIsPlayingRef(true);
    playbackStartTimeRef.current = performance.now();
    const durationMs = nativeModel.targetDuration * 1000;

    const animatePlayhead = () => {
      const elapsed = performance.now() - playbackStartTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      setActivePlayheadProgress(progress);

      if (progress < 1) {
        refPlayAnimationRef.current = requestAnimationFrame(animatePlayhead);
      } else {
        setIsPlayingRef(false);
        setActivePlayheadProgress(0);
      }
    };

    refPlayAnimationRef.current = requestAnimationFrame(animatePlayhead);

    speakText(textToRead, targetAccent, `speaking-ref-${targetAccent}`, {
      onEnd: () => {
        setIsPlayingRef(false);
        setActivePlayheadProgress(0);
        if (refPlayAnimationRef.current) cancelAnimationFrame(refPlayAnimationRef.current);
      },
      onError: () => {
        setIsPlayingRef(false);
        setActivePlayheadProgress(0);
        if (refPlayAnimationRef.current) cancelAnimationFrame(refPlayAnimationRef.current);
      }
    });
  };

  // Play User Recording
  const handlePlayUser = () => {
    if (!userAudioPlayerRef.current) return;

    if (isPlayingUser) {
      userAudioPlayerRef.current.pause();
      setIsPlayingUser(false);
      return;
    }

    // Stop reference speech if active
    stopSpeech();
    setIsPlayingRef(false);
    if (refPlayAnimationRef.current) cancelAnimationFrame(refPlayAnimationRef.current);

    userAudioPlayerRef.current.currentTime = 0;
    userAudioPlayerRef.current.play();
    setIsPlayingUser(true);
  };

  // Sequential A/B comparison: Model plays, then brief pause, then user plays
  const handlePlayComparativeAB = () => {
    if (isComparingAB) {
      stopSpeech();
      if (userAudioPlayerRef.current) userAudioPlayerRef.current.pause();
      if (comparisonTimeoutRef.current) clearTimeout(comparisonTimeoutRef.current);
      setIsComparingAB(false);
      setIsPlayingRef(false);
      setIsPlayingUser(false);
      setActivePlayheadProgress(0);
      return;
    }

    setIsComparingAB(true);
    // 1. Play reference
    handlePlayReference();

    // 2. Schedule user audio playback right after reference completes
    const refDurationMs = nativeModel.targetDuration * 1000;
    comparisonTimeoutRef.current = setTimeout(() => {
      handlePlayUser();
      const userDurationMs = (analysisResult.userDuration || 4) * 1000;
      comparisonTimeoutRef.current = setTimeout(() => {
        setIsComparingAB(false);
      }, userDurationMs + 400);
    }, refDurationMs + 600);
  };

  // Score status colors
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Haute Distinction', color: 'text-[#f2ca50] bg-[#f2ca50]/15 border-[#f2ca50]/40' };
    if (score >= 80) return { label: 'Très Satisfaisant', color: 'text-[#6ee7b7] bg-[#6ee7b7]/15 border-[#6ee7b7]/40' };
    if (score >= 70) return { label: 'En Bonne Voie', color: 'text-[#93c5fd] bg-[#93c5fd]/15 border-[#93c5fd]/40' };
    return { label: 'À Perfectionner', color: 'text-[#fca5a5] bg-[#fca5a5]/15 border-[#fca5a5]/40' };
  };

  const overallBadge = getScoreBadge(analysisResult.overallScore);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header: Overall Score & Comparison Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#151b2b] via-[#101624] to-[#0c1322] border border-[#f2ca50]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial score badge */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-[#070e1d] border border-[#f2ca50]/40 shadow-inner">
            <svg className="w-full h-full -rotate-90 p-1" viewBox="0 0 36 36">
              <path
                className="text-[#232a3a]"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#f2ca50] transition-all duration-1000 ease-out"
                strokeDasharray={`${analysisResult.overallScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-serif font-black text-[#f2ca50] leading-none">
                {analysisResult.overallScore}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#d4c78f] font-mono mt-0.5">
                Précision
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-[#f2ca50] tracking-wider">
                Analyse Acoustique Comparative
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${overallBadge.color}`}>
                {overallBadge.label}
              </span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8] mt-0.5">
              Élocution & Accentuation {targetAccent === 'en-GB' ? 'RP Britannique' : 'General American'}
            </h3>
            <p className="text-xs text-[#d0c5af]/80 mt-1 max-w-md">
              Comparaison d'amplitude, de cadence syllabique et d'accent tonique vis-à-vis du modèle natif.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-center">
          <button
            type="button"
            onClick={handlePlayComparativeAB}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
              isComparingAB
                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-lg shadow-[#f2ca50]/20 animate-pulse'
                : 'bg-[#191f2f] hover:bg-[#232a3a] text-[#f2ca50] border-[#4d4635]/50'
            }`}
          >
            <span className="material-symbols-outlined text-base">compare_arrows</span>
            <span>{isComparingAB ? 'Écoute A/B en cours...' : 'Écoute Comparative (A ➔ B)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPitchOverlay(!showPitchOverlay)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              showPitchOverlay
                ? 'bg-[#232a3a] text-[#6ee7b7] border-[#6ee7b7]/40'
                : 'bg-[#191f2f] text-[#99907c] border-[#232a3a]'
            }`}
            title="Afficher/masquer la courbe d'intonation"
          >
            <span className="material-symbols-outlined text-sm">show_chart</span>
            <span className="hidden sm:inline">Intonation F0</span>
          </button>
        </div>
      </div>

      {/* DUAL WAVEFORMS COMPARISON CONTAINER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131927] border border-[#232a3a] shadow-xl flex flex-col gap-4">
        {/* ============================================================== */}
        {/* TRACK 1: MODÈLE NATIF (REFERENCE WAVEFORM) */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0c1322] border border-[#f2ca50]/25 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{targetAccent === 'en-GB' ? '🇬🇧' : '🇺🇸'}</span>
              <span className="font-serif font-bold text-sm text-[#f2ca50]">
                Modèle Natif Référence ({accentLabel})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#f2ca50]/15 text-[#f2ca50] font-mono">
                {nativeModel.targetDuration.toFixed(1)}s • {analysisResult.nativeCadenceLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlayReference}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPlayingRef
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md'
                  : 'bg-[#191f2f] hover:bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/30'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isPlayingRef ? 'pause' : 'volume_up'}
              </span>
              <span>{isPlayingRef ? 'Pause' : 'Écouter'}</span>
            </button>
          </div>

          {/* Canvas Waveform Display: Reference */}
          <div className="relative w-full h-24 sm:h-28 bg-[#070e1d] rounded-lg border border-[#232a3a] overflow-hidden flex items-center px-1">
            {/* Timeline Ticks */}
            <div className="absolute top-1 left-2 text-[9px] font-mono text-[#d4c78f]/40 pointer-events-none">
              0.0s
            </div>
            <div className="absolute top-1 right-2 text-[9px] font-mono text-[#d4c78f]/40 pointer-events-none">
              {nativeModel.targetDuration.toFixed(1)}s
            </div>

            {/* Bars waveform */}
            <div className="w-full h-full flex items-center justify-between gap-[2px]">
              {nativeModel.waveform.map((val, idx) => {
                const isStressedBeat = nativeModel.stressIndices.includes(idx);
                const heightPct = Math.max(12, Math.round(val * 90));
                const isPassed = activePlayheadProgress > idx / nativeModel.waveform.length;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-center h-full group relative"
                  >
                    {/* Mirror bar top/bottom */}
                    <div
                      className={`w-full rounded-full transition-all duration-150 ${
                        isStressedBeat
                          ? isPassed
                            ? 'bg-[#ffe088]'
                            : 'bg-[#f2ca50]'
                          : isPassed
                          ? 'bg-[#d4c78f]'
                          : 'bg-[#8c7634]/60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />

                    {/* Stress beacon indicator */}
                    {isStressedBeat && (
                      <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#f2ca50] shadow-sm shadow-[#f2ca50]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pitch intonation contour overlay */}
            {showPitchOverlay && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d={nativeModel.pitchContour
                    .map((val, idx) => {
                      const x = (idx / (nativeModel.pitchContour.length - 1)) * 100;
                      const y = 90 - val * 75; // map to svg coordinate
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#6ee7b7"
                  strokeWidth="1.8"
                  strokeDasharray="2,2"
                  className="opacity-75"
                />
              </svg>
            )}

            {/* Dynamic Playhead Needle */}
            {(isPlayingRef || isPlayingUser || isComparingAB) && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#f2ca50] shadow-[0_0_10px_#f2ca50] pointer-events-none transition-all duration-75 z-10"
                style={{ left: `${activePlayheadProgress * 100}%` }}
              >
                <div className="w-2.5 h-2.5 -ml-[3.5px] -top-1 bg-[#f2ca50] rotate-45 rounded-sm" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span className="flex items-center gap-1 text-[#f2ca50]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]" />
              Syllabes toniques marquées (Stress-timed)
            </span>
            {showPitchOverlay && (
              <span className="flex items-center gap-1 text-[#6ee7b7]">
                <span className="w-2 h-0.5 bg-[#6ee7b7]" />
                Contour d'intonation F0
              </span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TRACK 2: VOTRE ENREGISTREMENT (USER RECORDED WAVEFORM) */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0c1322] border border-[#38bdf8]/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                <span className="material-symbols-outlined text-xs">mic</span>
              </span>
              <span className="font-serif font-bold text-sm text-[#38bdf8]">
                Votre Enregistrement
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-mono">
                {analysisResult.userDuration.toFixed(1)}s • {analysisResult.userCadenceLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayUser}
                disabled={!userAudioUrl}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPlayingUser
                    ? 'bg-[#38bdf8] text-[#041d33] shadow-md'
                    : 'bg-[#191f2f] hover:bg-[#232a3a] text-[#38bdf8] border border-[#38bdf8]/30'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isPlayingUser ? 'pause' : 'play_arrow'}
                </span>
                <span>{isPlayingUser ? 'Pause' : 'Réécouter'}</span>
              </button>

              {onReRecord && (
                <button
                  type="button"
                  onClick={onReRecord}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#232a3a] hover:bg-[#2d3748] text-[#d0c5af] flex items-center gap-1"
                  title="Réenregistrer une nouvelle prise"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span className="hidden sm:inline">Reprendre</span>
                </button>
              )}
            </div>
          </div>

          {/* Canvas Waveform Display: User Voice */}
          <div className="relative w-full h-24 sm:h-28 bg-[#070e1d] rounded-lg border border-[#232a3a] overflow-hidden flex items-center px-1">
            {/* Timeline Ticks */}
            <div className="absolute top-1 left-2 text-[9px] font-mono text-[#38bdf8]/40 pointer-events-none">
              0.0s
            </div>
            <div className="absolute top-1 right-2 text-[9px] font-mono text-[#38bdf8]/40 pointer-events-none">
              {analysisResult.userDuration.toFixed(1)}s
            </div>

            {/* Bars waveform */}
            <div className="w-full h-full flex items-center justify-between gap-[2px]">
              {userWaveform.map((val, idx) => {
                const heightPct = Math.max(10, Math.round(val * 88));
                const isPassed = activePlayheadProgress > idx / userWaveform.length;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-center h-full"
                  >
                    <div
                      className={`w-full rounded-full transition-all duration-150 ${
                        isPassed
                          ? 'bg-[#7dd3fc]'
                          : val > 0.65
                          ? 'bg-[#38bdf8]'
                          : 'bg-[#1e4e79]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Dynamic Playhead Needle */}
            {(isPlayingRef || isPlayingUser || isComparingAB) && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] pointer-events-none transition-all duration-75 z-10"
                style={{ left: `${activePlayheadProgress * 100}%` }}
              >
                <div className="w-2.5 h-2.5 -ml-[3.5px] -top-1 bg-[#38bdf8] rotate-45 rounded-sm" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span className="text-[#38bdf8]">
              Énergie acoustique réelle capturée par le microphone
            </span>
            <span className="font-mono text-[#d4c78f]">
              {userWaveform.length} points d'échantillonnage
            </span>
          </div>
        </div>
      </div>

      {/* 4 ACOUSTIC PILLARS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span>Rythme & Débit</span>
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">speed</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-[#dce2f8]">
              {analysisResult.rhythmScore}%
            </span>
          </div>
          <span className="text-[10px] text-[#d4c78f] truncate">
            {analysisResult.userDuration <= analysisResult.targetDuration * 1.15 ? 'Cadence équilibrée' : 'Légère retenue'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span>Accent Tonique</span>
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">equalizer</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-[#dce2f8]">
              {analysisResult.stressScore}%
            </span>
          </div>
          <span className="text-[10px] text-[#d4c78f] truncate">
            Relief syllabique
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span>Mélodie & Pitch</span>
            <span className="material-symbols-outlined text-sm text-[#6ee7b7]">graphic_eq</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-[#dce2f8]">
              {analysisResult.intonationScore}%
            </span>
          </div>
          <span className="text-[10px] text-[#d4c78f] truncate">
            Modulation de fin
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-[#99907c]">
            <span>Clarté Vocale</span>
            <span className="material-symbols-outlined text-sm text-[#38bdf8]">mic_external_on</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-[#dce2f8]">
              {analysisResult.clarityScore}%
            </span>
          </div>
          <span className="text-[10px] text-[#d4c78f] truncate">
            Timbre & Résonance
          </span>
        </div>
      </div>

      {/* WORD-BY-WORD PHRASAL ACOUSTIC FEEDBACK */}
      <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-serif font-bold text-sm text-[#dce2f8] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#f2ca50]">spellcheck</span>
            Décomposition Syllabique & Précision par Mot
          </span>
          <span className="text-[11px] text-[#99907c]">Touchez un mot pour voir le conseil</span>
        </div>

        {/* Word chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {analysisResult.wordSegments.map((seg, idx) => {
            const isSelected = activeWordIdx === idx;
            let chipStyle = 'bg-[#191f2f] text-[#dce2f8] border-[#232a3a]';
            if (seg.status === 'optimal') {
              chipStyle = isSelected
                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md'
                : 'bg-[#f2ca50]/15 text-[#f2ca50] border-[#f2ca50]/40 hover:bg-[#f2ca50]/25';
            } else if (seg.status === 'acceptable') {
              chipStyle = isSelected
                ? 'bg-[#38bdf8] text-[#041d33] border-[#38bdf8] shadow-md'
                : 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40 hover:bg-[#38bdf8]/25';
            } else {
              chipStyle = isSelected
                ? 'bg-[#f87171] text-[#450a0a] border-[#f87171] shadow-md'
                : 'bg-[#f87171]/15 text-[#fca5a5] border-[#f87171]/40 hover:bg-[#f87171]/25';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveWordIdx(isSelected ? null : idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-all border flex items-center gap-1 ${chipStyle}`}
              >
                <span>{seg.word}</span>
                {seg.isStressed && (
                  <span className="text-[10px] font-mono opacity-80" title="Syllabe avec accent tonique">
                    ˈ
                  </span>
                )}
                {seg.score && (
                  <span className="text-[9px] font-mono opacity-70">
                    {seg.score}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active selected word detail popover */}
        {activeWordIdx !== null && analysisResult.wordSegments[activeWordIdx] && (
          <div className="p-3 rounded-lg bg-[#0c1322] border border-[#f2ca50]/40 flex flex-col gap-1 text-xs animate-fadeIn">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[#f2ca50] font-serif text-sm">
                Mot sélectionné : « {analysisResult.wordSegments[activeWordIdx].word} »
              </span>
              <span className="text-[11px] font-mono text-[#d4c78f]">
                Précision : {analysisResult.wordSegments[activeWordIdx].score}%
              </span>
            </div>
            <p className="text-[#d0c5af] text-[11px] leading-relaxed">
              {analysisResult.wordSegments[activeWordIdx].feedback}
            </p>
          </div>
        )}
      </div>

      {/* LINGUISTIC & ACOUSTIC ACTIONABLE RECOMMENDATIONS */}
      <div className="p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 flex flex-col gap-2.5">
        <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#f2ca50] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">psychology</span>
          Recommandations Linguistiques Personnalisées
        </span>

        <ul className="flex flex-col gap-2 text-xs text-[#d0c5af]/90">
          {analysisResult.adviceList.map((adv, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-[#f2ca50] flex-shrink-0 mt-0.5">
                check_circle
              </span>
              <span className="leading-relaxed">{adv}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* VALIDATE SESSION BUTTON */}
      {onValidate && (
        <button
          type="button"
          onClick={onValidate}
          className="w-full py-3.5 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#f2ca50]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Valider l'Épreuve Vocale (+{analysisResult.overallScore}% Précision)</span>
        </button>
      )}
    </div>
  );
};
