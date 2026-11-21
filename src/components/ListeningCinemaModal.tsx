import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { CEFRLevel, SchoolGrade } from '../firebase/types';
import {
  LISTENING_CINEMA_EPISODES,
  type ListeningCinemaEpisode
} from '../data/ecosystemChallengesData';
import { recordAttempt } from '../firebase/client';
import { awardMszCoins } from '../utils/mszCoinsManager';
import {
  playDialogueSequence,
  speakText,
  stopSpeech,
  type DialoguePlaybackTurn
} from '../services/speechService';
import { playCorrectCue, playIncorrectCue, playVictoryCue } from '../utils/soundEffects';
import cinemaHallImg from '../assets/images/listening_cinema_hall_1795303945136.jpg';

interface ListeningCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolGrade: SchoolGrade;
  cefrLevel: CEFRLevel;
  onXpEarned?: (xp: number) => void;
}

type SubtitleMode = 'bilingual' | 'english_only' | 'audio_blind';

export const ListeningCinemaModal: React.FC<ListeningCinemaModalProps> = ({
  isOpen,
  onClose,
  schoolGrade,
  cefrLevel,
  onXpEarned
}) => {
  const recommendedEpisode = useMemo(() => {
    const mapGradeToCefr: Record<SchoolGrade, CEFRLevel> = {
      '6e': 'A1',
      '5e': 'A1',
      '4e': 'A2',
      '3e': 'A2',
      '2nde': 'B1',
      '1re': 'B1',
      terminale: 'C1'
    };
    const target = mapGradeToCefr[schoolGrade] || cefrLevel;
    return (
      LISTENING_CINEMA_EPISODES.find((e) => e.cefrLevel === target) ||
      LISTENING_CINEMA_EPISODES[0]
    );
  }, [schoolGrade, cefrLevel]);

  const [episode, setEpisode] = useState<ListeningCinemaEpisode>(recommendedEpisode);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('bilingual');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [heroErr, setHeroErr] = useState<boolean>(false);

  const cancelPlaybackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setEpisode(recommendedEpisode);
    resetEpisodeState();
  }, [recommendedEpisode]);

  useEffect(() => {
    if (!isOpen) {
      cancelPlaybackRef.current?.();
      stopSpeech();
      setIsPlaying(false);
      setActiveLineIdx(null);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  function resetEpisodeState() {
    cancelPlaybackRef.current?.();
    stopSpeech();
    setIsPlaying(false);
    setActiveLineIdx(null);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }

  if (!isOpen) return null;

  const handleTogglePlayAll = () => {
    if (isPlaying) {
      cancelPlaybackRef.current?.();
      cancelPlaybackRef.current = null;
      stopSpeech();
      setIsPlaying(false);
      setActiveLineIdx(null);
      return;
    }

    const turns: DialoguePlaybackTurn[] = episode.script.map((line, idx) => ({
      id: `${episode.id}-line-${idx}`,
      en: line.en,
      fr: line.fr,
      personaId:
        line.accent === 'en-US'
          ? line.gender === 'female'
            ? 'us-fem-1'
            : 'us-mal-1'
          : line.gender === 'female'
          ? 'uk-fem-1'
          : 'uk-mal-1'
    }));

    setIsPlaying(true);
    cancelPlaybackRef.current = playDialogueSequence(turns, 'en-GB', {
      rateMultiplier: playbackRate,
      onTurnStart: (idx) => setActiveLineIdx(idx),
      onComplete: () => {
        setIsPlaying(false);
        setActiveLineIdx(null);
      },
      onError: () => {
        setIsPlaying(false);
        setActiveLineIdx(null);
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;
    let correct = 0;
    episode.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / episode.questions.length) * 100);
    setQuizScore(pct);
    setQuizSubmitted(true);

    if (pct >= 66) {
      playVictoryCue();
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f2ca50', '#ffe088', '#38bdf8']
        });
      } catch {
        // ignore
      }
      awardMszCoins('cursus', `listening-cinema-${episode.id}`, 10, 50, `Listening Cinema : ${episode.title}`);
    } else {
      playIncorrectCue();
    }

    await recordAttempt({
      moduleId: episode.id,
      moduleType: 'listening_cinema',
      title: `Listening Cinema : ${episode.title}`,
      level: episode.cefrLevel,
      score: pct,
      durationSeconds: 105
    });
    onXpEarned?.(pct >= 66 ? 50 : 20);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Listening Cinema"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Cinema Screening Screen Banner */}
        <div className="relative h-40 sm:h-48 bg-[#070e1d] border-b border-[#4d4635]/40 shrink-0 overflow-hidden">
          {!heroErr && (
            <img
              src={cinemaHallImg}
              alt="Salle privée Listening Cinema"
              onError={() => setHeroErr(true)}
              className="w-full h-full object-cover opacity-65"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/60 to-transparent" />

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#070e1d]/90 border border-[#f2ca50]/45 text-[11px] font-mono text-[#f2ca50] font-bold">
              {episode.cefrLevel} • {episode.durationLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer Listening Cinema"
              className="w-9 h-9 rounded-full bg-[#070e1d]/90 border border-[#2e3545] text-[#dce2f8] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                LISTENING CINEMA • {episode.genre}
              </span>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#dce2f8]">
                {episode.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleTogglePlayAll}
              className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {isPlaying ? 'stop_circle' : 'play_circle'}
              </span>
              <span>{isPlaying ? 'Arrêter la Séance' : 'Lancer l’Épisode Audio'}</span>
            </button>
          </div>
        </div>

        {/* Episode Selector + Subtitle/Speed Controls */}
        <div className="px-4 py-2.5 bg-[#151b2b] border-b border-[#232a3a] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {LISTENING_CINEMA_EPISODES.map((ep) => (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  setEpisode(ep);
                  resetEpisodeState();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 cursor-pointer ${
                  episode.id === ep.id
                    ? 'bg-[#f2ca50] text-[#3c2f00]'
                    : 'bg-[#191f2f] text-[#d0c5af] border border-[#2e3545]'
                }`}
              >
                {ep.cefrLevel} • {ep.gradeLabel.split(' ')[1] || ep.gradeLabel}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Subtitles mode */}
            <div className="inline-flex rounded-lg bg-[#070e1d] p-0.5 border border-[#2e3545]">
              {[
                { id: 'bilingual', label: 'EN+FR' },
                { id: 'english_only', label: 'EN seul' },
                { id: 'audio_blind', label: 'Audio pur' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSubtitleMode(m.id as SubtitleMode)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                    subtitleMode === m.id ? 'bg-[#f2ca50] text-[#3c2f00]' : 'text-[#d0c5af]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Playback rate */}
            <div className="inline-flex rounded-lg bg-[#070e1d] p-0.5 border border-[#2e3545]">
              {[0.85, 1.0, 1.15].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPlaybackRate(r)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                    playbackRate === r ? 'bg-sky-400 text-slate-950' : 'text-[#d0c5af]'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Synopsis + Vocabulary Chips */}
          <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] space-y-3">
            <p className="text-xs text-[#d0c5af] leading-relaxed">{episode.synopsisFr}</p>
            <div className="flex flex-wrap gap-2">
              {episode.keyVocab.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => speakText(v.term, 'en-GB', `cin-voc-${i}`)}
                  className="px-2.5 py-1 rounded-lg bg-[#070e1d] border border-[#f2ca50]/30 hover:border-[#f2ca50] text-left cursor-pointer flex items-center gap-2"
                >
                  <span className="text-xs font-bold text-[#f2ca50]">{v.term}</span>
                  <span className="text-[10px] font-mono text-sky-300">{v.ipa}</span>
                  <span className="text-[11px] text-[#99907c]">— {v.fr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Synchronized Cinema Transcript */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#dce2f8]">
                Script & Sous-Titres Synchronisés
              </h3>
              <span className="text-[11px] font-mono text-[#99907c]">
                {subtitleMode === 'audio_blind'
                  ? 'Mode écoute pure activé — entraînez votre oreille !'
                  : 'Cliquez sur une réplique pour l’écouter individuellement'}
              </span>
            </div>

            {subtitleMode === 'audio_blind' ? (
              <div className="p-6 rounded-2xl bg-[#151b2b] border border-[#2e3545] text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-[#f2ca50]">hearing</span>
                <p className="text-xs text-[#d0c5af]">
                  Sous-titres masqués pour une immersion auditive authentique. Lancez la lecture et répondez aux questions ci-dessous !
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {episode.script.map((line, idx) => {
                  const isCurrent = activeLineIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => speakText(line.en, line.accent, `${episode.id}-single-${idx}`, { naturalProsody: true, rateMultiplier: playbackRate })}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[#f2ca50]/15 border-[#f2ca50] shadow-md'
                          : 'bg-[#151b2b] border-[#232a3a] hover:border-[#f2ca50]/45'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#f2ca50]">
                            {line.speaker}
                          </span>
                          <span className="text-[10px] font-mono text-[#99907c]">
                            {line.accent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}
                          </span>
                        </div>
                        <p className="text-sm text-[#dce2f8] leading-relaxed">{line.en}</p>
                        {subtitleMode === 'bilingual' && (
                          <p className="text-xs text-[#d0c5af]/80 italic">{line.fr}</p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-base text-[#f2ca50] shrink-0">
                        volume_up
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comprehension Check */}
          <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/35 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#dce2f8]">
              Quiz de Compréhension Orale
            </h3>
            <div className="space-y-3">
              {episode.questions.map((q, qIdx) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-[#070e1d] border border-[#232a3a] space-y-2">
                  <p className="text-sm font-semibold text-[#dce2f8]">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const chosen = answers[q.id] === oIdx;
                      const isRight = quizSubmitted && oIdx === q.correctIndex;
                      const isWrong = quizSubmitted && chosen && oIdx !== q.correctIndex;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => {
                            playCorrectCue();
                            setAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                          }}
                          className={`p-2.5 rounded-xl text-left text-xs font-medium border cursor-pointer ${
                            isRight
                              ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 font-bold'
                              : isWrong
                              ? 'bg-rose-950/60 border-rose-400 text-rose-200'
                              : chosen
                              ? 'bg-[#f2ca50]/20 border-[#f2ca50] text-[#f2ca50] font-bold'
                              : 'bg-[#151b2b] border-[#2e3545] text-[#dce2f8] hover:border-[#f2ca50]/50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <p className="text-[11px] text-[#d4c78f] pt-1">{q.explanationFr}</p>
                  )}
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                type="button"
                disabled={Object.keys(answers).length < episode.questions.length}
                onClick={handleSubmitQuiz}
                className="w-full py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-45 text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Valider la Compréhension (+XP & MSZ Coins)
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-200">
                  Score de séance : {quizScore}% — Compréhension Orale mise à jour !
                </span>
                <button
                  type="button"
                  onClick={resetEpisodeState}
                  className="px-3 py-1.5 rounded-lg bg-[#232a3a] text-[#f2ca50] text-xs font-bold cursor-pointer"
                >
                  Recommencer
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
