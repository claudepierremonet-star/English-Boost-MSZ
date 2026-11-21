import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { CEFRLevel, SchoolGrade } from '../firebase/types';
import {
  ESCAPE_ROOM_SCENARIOS,
  type EscapeRoomScenario
} from '../data/ecosystemChallengesData';
import { recordAttempt } from '../firebase/client';
import { awardMszCoins } from '../utils/mszCoinsManager';
import { speakText, stopSpeech } from '../services/speechService';
import { playCorrectCue, playIncorrectCue, playVictoryCue } from '../utils/soundEffects';
import escapeRoomImg from '../assets/images/escape_room_library_1795303944906.jpg';

interface EnglishEscapeRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolGrade: SchoolGrade;
  cefrLevel: CEFRLevel;
  onXpEarned?: (xp: number) => void;
}

export const EnglishEscapeRoomModal: React.FC<EnglishEscapeRoomModalProps> = ({
  isOpen,
  onClose,
  schoolGrade,
  cefrLevel,
  onXpEarned
}) => {
  const defaultScenario = useMemo(() => {
    return (
      ESCAPE_ROOM_SCENARIOS.find((s) => s.recommendedGrades.includes(schoolGrade)) ||
      ESCAPE_ROOM_SCENARIOS[0]
    );
  }, [schoolGrade]);

  const [selectedRoom, setSelectedRoom] = useState<EscapeRoomScenario>(defaultScenario);
  const [stepIdx, setStepIdx] = useState(0);
  const [digitsUnlocked, setDigitsUnlocked] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stepFeedback, setStepFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEscaped, setIsEscaped] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setSelectedRoom(defaultScenario);
    resetRoom();
  }, [defaultScenario]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      return;
    }
    if (isEscaped) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isEscaped]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  function resetRoom() {
    stopSpeech();
    setStepIdx(0);
    setDigitsUnlocked([]);
    setSelectedOption(null);
    setStepFeedback('idle');
    setShowHint(false);
    setHintsUsed(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setIsEscaped(false);
  }

  if (!isOpen) return null;

  const currentPuzzle = selectedRoom.puzzles[stepIdx];
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleChooseOption = async (optIdx: number) => {
    if (stepFeedback === 'correct' || isEscaped) return;
    setSelectedOption(optIdx);

    if (optIdx === currentPuzzle.correctIndex) {
      playCorrectCue();
      setStepFeedback('correct');
      const nextDigits = [...digitsUnlocked, currentPuzzle.cipherDigit];
      setDigitsUnlocked(nextDigits);
    } else {
      playIncorrectCue();
      setMistakes((m) => m + 1);
      setStepFeedback('wrong');
    }
  };

  const handleAdvancePuzzle = async () => {
    stopSpeech();
    if (stepIdx + 1 < selectedRoom.puzzles.length) {
      setStepIdx((i) => i + 1);
      setSelectedOption(null);
      setStepFeedback('idle');
      setShowHint(false);
    } else {
      setIsEscaped(true);
      playVictoryCue();
      try {
        confetti({
          particleCount: 75,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f2ca50', '#ffe088', '#34d399', '#ffffff']
        });
      } catch {
        // ignore
      }

      const finalScore = Math.max(50, Math.min(100, 100 - mistakes * 10 - hintsUsed * 5));
      awardMszCoins(
        'game',
        `escape-room-${selectedRoom.id}`,
        selectedRoom.coinsReward,
        50,
        `Escape Room : ${selectedRoom.title}`
      );
      await recordAttempt({
        moduleId: selectedRoom.id,
        moduleType: 'escape_room',
        title: `Escape Room : ${selectedRoom.title}`,
        level: selectedRoom.cefrLevel || cefrLevel,
        score: finalScore,
        durationSeconds: Math.max(30, elapsedSeconds)
      });
      onXpEarned?.(selectedRoom.xpReward);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="English Escape Room"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Atmospheric Header Hero */}
        <div className="relative h-36 sm:h-44 bg-[#070e1d] border-b border-[#4d4635]/40 shrink-0 overflow-hidden">
          {!imgError && (
            <img
              src={escapeRoomImg}
              alt="Salle mystérieuse d'Oxford"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover opacity-55"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/65 to-transparent" />

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#070e1d]/90 border border-[#f2ca50]/45 text-xs font-mono font-bold text-[#f2ca50] tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer l'Escape Room"
              className="w-9 h-9 rounded-full bg-[#070e1d]/90 border border-[#2e3545] text-[#dce2f8] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                ENGLISH ESCAPE ROOM • {selectedRoom.gradeBand} • {selectedRoom.cefrLevel}
              </span>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#dce2f8]">
                {selectedRoom.title}
              </h2>
            </div>

            {/* 4-Digit Cipher Pad Progress */}
            <div className="flex items-center gap-1.5 bg-[#070e1d]/90 px-3 py-1.5 rounded-xl border border-[#f2ca50]/40">
              {selectedRoom.puzzles.map((p, idx) => {
                const digit = digitsUnlocked[idx];
                return (
                  <div
                    key={p.id}
                    className={`w-7 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-black border ${
                      digit
                        ? 'bg-[#f2ca50] text-[#3c2f00] border-[#ffe088]'
                        : idx === stepIdx
                        ? 'bg-[#232a3a] text-[#f2ca50] border-[#f2ca50]/60 animate-pulse'
                        : 'bg-[#151b2b] text-[#99907c] border-[#2e3545]'
                    }`}
                  >
                    {digit || '?'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Room Selector */}
        <div className="px-4 py-2.5 bg-[#151b2b] border-b border-[#232a3a] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {ESCAPE_ROOM_SCENARIOS.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => {
                setSelectedRoom(room);
                setStepIdx(0);
                setDigitsUnlocked([]);
                setSelectedOption(null);
                setStepFeedback('idle');
                setShowHint(false);
                setMistakes(0);
                setElapsedSeconds(0);
                setIsEscaped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                selectedRoom.id === room.id
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'bg-[#191f2f] text-[#d0c5af] border border-[#2e3545] hover:border-[#f2ca50]/40'
              }`}
            >
              {room.gradeBand} ({room.cefrLevel})
            </button>
          ))}
        </div>

        {/* Main Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isEscaped ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#070e1d] border border-[#f2ca50] text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-4xl">lock_open</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#f2ca50]">
                Porte Déverrouillée — Mission Accomplie !
              </h3>
              <p className="text-sm text-[#dce2f8] max-w-lg mx-auto">
                Code secret reconstitué :{' '}
                <strong className="font-mono text-[#f2ca50] tracking-widest">
                  {digitsUnlocked.join(' - ')}
                </strong>
                . Temps : <strong className="font-mono">{formatTime(elapsedSeconds)}</strong> • Erreurs :{' '}
                <strong className="font-mono">{mistakes}</strong>.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                  +{selectedRoom.xpReward} XP
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/50 text-[#f2ca50] font-mono text-xs font-bold">
                  +{selectedRoom.coinsReward} MSZ Coins
                </span>
              </div>
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetRoom}
                  className="px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] text-[#dce2f8] text-xs font-bold cursor-pointer"
                >
                  Rejouer cette Salle
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold cursor-pointer"
                >
                  Retour au Tableau de Bord
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#d0c5af] bg-[#151b2b] p-3 rounded-xl border border-[#232a3a]">
                {selectedRoom.introFr}
              </p>

              {/* Current Puzzle Box */}
              <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/40 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase text-[#f2ca50]">
                    {currentPuzzle.lockTitle} ({stepIdx + 1}/{selectedRoom.puzzles.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakText(currentPuzzle.narrativeEn, 'en-GB', currentPuzzle.id, { naturalProsody: true })}
                      className="px-3 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">volume_up</span>
                      <span>Écouter l’Indice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!showHint) setHintsUsed((h) => h + 1);
                        setShowHint(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#070e1d] border border-[#4d4635]/50 text-[#d4c78f] hover:text-[#f2ca50] text-xs font-mono cursor-pointer"
                    >
                      Indice
                    </button>
                  </div>
                </div>

                {/* Clue Parchment */}
                <div className="p-4 rounded-xl bg-[#070e1d] border border-[#4d4635]/40 space-y-2">
                  <p className="font-serif text-base text-[#dce2f8] leading-relaxed">
                    “{currentPuzzle.narrativeEn}”
                  </p>
                  <p className="text-xs text-[#99907c] italic">{currentPuzzle.narrativeFr}</p>
                </div>

                {showHint && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-[#f2ca50]/40 text-xs text-[#ffe088]">
                    <strong>Astuce :</strong> {currentPuzzle.hintFr}
                  </div>
                )}

                <h4 className="font-serif text-base font-bold text-[#dce2f8]">{currentPuzzle.question}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentPuzzle.options.map((opt, idx) => {
                    const chosen = selectedOption === idx;
                    const isCorrectOpt = stepFeedback === 'correct' && idx === currentPuzzle.correctIndex;
                    const isWrongOpt = stepFeedback === 'wrong' && chosen;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChooseOption(idx)}
                        className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                          isCorrectOpt
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                            : isWrongOpt
                            ? 'bg-rose-950/60 border-rose-400 text-rose-200'
                            : 'bg-[#0c1322] hover:bg-[#191f2f] border-[#2e3545] hover:border-[#f2ca50]/60 text-[#dce2f8]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {stepFeedback === 'wrong' && (
                  <p className="text-xs text-rose-300 font-medium">
                    Ce code ne déverrouille pas la serrure. Relisez attentivement l’indice ou écoutez l’extrait !
                  </p>
                )}

                {stepFeedback === 'correct' && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-emerald-200 space-y-1">
                      <div className="font-bold text-[#f2ca50]">
                        Chiffre débloqué : [{currentPuzzle.cipherDigit}]
                      </div>
                      <p>{currentPuzzle.explanationFr}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAdvancePuzzle}
                      className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      {stepIdx + 1 < selectedRoom.puzzles.length ? 'Cadenas Suivant →' : 'Ouvrir la Porte Finale'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
