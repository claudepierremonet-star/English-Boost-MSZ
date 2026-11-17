import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { CityMapProgressionState } from '../firebase/types';
import {
  CHAPTER_TEMPLATES,
  generateChapterContent,
  getCityLevelByNumber,
  getDistrictForLevel,
  MAX_CITY_LEVEL,
  type CityChapterQuestion
} from '../data/cityMapData';
import {
  completeCityChapter,
  type CityChapterCompletionResult
} from '../utils/cityMapManager';
import { speakText, stopSpeech } from '../services/speechService';
import {
  playSelectCue,
  playDeselectCue,
  playCorrectCue,
  playIncorrectCue,
  playVictoryCue
} from '../utils/soundEffects';
import { ChapterMasteryProgressBar } from './ChapterMasteryProgressBar';

interface CityLevelChaptersModalProps {
  levelNumber: number;
  progression: CityMapProgressionState;
  playerLevel?: number;
  onClose: () => void;
  onChapterCompleted: (
    result: CityChapterCompletionResult,
    levelNumber: number,
    chapterNumber: number,
    scorePercent: number
  ) => void;
  onNavigateToLevel?: (nextLevel: number) => void;
}

interface LetterTile {
  id: string;
  char: string;
}

type ModalScreen = 'chapters' | 'playing' | 'victory';

export const CityLevelChaptersModal: React.FC<CityLevelChaptersModalProps> = ({
  levelNumber,
  progression,
  playerLevel = 1,
  onClose,
  onChapterCompleted,
  onNavigateToLevel
}) => {
  const levelMeta = useMemo(() => getCityLevelByNumber(levelNumber), [levelNumber]);
  const district = useMemo(() => getDistrictForLevel(levelNumber), [levelNumber]);

  const [screen, setScreen] = useState<ModalScreen>('chapters');
  const [activeChapterNum, setActiveChapterNum] = useState<number>(1);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  // MCQ states
  const [selectedMcqIdx, setSelectedMcqIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean>(false);

  // Word-Find letter states
  const [availableLetters, setAvailableLetters] = useState<LetterTile[]>([]);
  const [placedLetters, setPlacedLetters] = useState<LetterTile[]>([]);

  // Session score & completion stats
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [lockedNoticeChapter, setLockedNoticeChapter] = useState<number | null>(null);
  const [completionResult, setCompletionResult] = useState<CityChapterCompletionResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const completedChapters = progression.completedChaptersByLevel[String(levelNumber)] || [];
  const isLevelConquered = completedChapters.length >= 10 || progression.conqueredLevels.includes(levelNumber);

  const chapterData = useMemo(
    () => generateChapterContent(levelNumber, activeChapterNum),
    [levelNumber, activeChapterNum]
  );
  const questions = chapterData.questions;
  const currentQuestion: CityChapterQuestion | undefined = questions[questionIndex];

  // Reset question widgets whenever question changes
  useEffect(() => {
    setSelectedMcqIdx(null);
    setHasAnswered(false);
    setIsCurrentCorrect(false);

    if (currentQuestion && currentQuestion.type === 'word_find') {
      const tiles: LetterTile[] = currentQuestion.scrambledLetters.map((char, i) => ({
        id: `${currentQuestion.id}-tile-${i}-${char}`,
        char
      }));
      setAvailableLetters(tiles);
      setPlacedLetters([]);
    } else {
      setAvailableLetters([]);
      setPlacedLetters([]);
    }
  }, [currentQuestion?.id, screen, activeChapterNum]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Determine if a chapter (1..10) is unlocked inside this level
  const isChapterUnlocked = (chNum: number): boolean => {
    if (chNum === 1) return true;
    if (completedChapters.includes(chNum)) return true;
    return completedChapters.includes(chNum - 1);
  };

  const handleStartChapter = (chNum: number) => {
    if (!isChapterUnlocked(chNum)) {
      setLockedNoticeChapter(chNum);
      return;
    }
    setLockedNoticeChapter(null);
    setActiveChapterNum(chNum);
    setQuestionIndex(0);
    setCorrectCount(0);
    setCompletionResult(null);
    setScreen('playing');
  };

  const handleSelectMcq = (idx: number) => {
    if (hasAnswered || !currentQuestion || currentQuestion.type !== 'mcq') return;
    setSelectedMcqIdx(idx);
    setHasAnswered(true);
    const ok = idx === currentQuestion.correctIndex;
    setIsCurrentCorrect(ok);
    if (ok) {
      setCorrectCount((prev) => prev + 1);
      playCorrectCue();
    } else {
      playIncorrectCue();
    }
    speakText(currentQuestion.audioText, 'en-GB', `city-q-${currentQuestion.id}`, { rate: 0.94 });
  };

  const handlePlaceLetter = (tile: LetterTile) => {
    if (hasAnswered) return;
    playSelectCue();
    setAvailableLetters((prev) => prev.filter((t) => t.id !== tile.id));
    setPlacedLetters((prev) => [...prev, tile]);
  };

  const handleRemovePlacedLetter = (tile: LetterTile) => {
    if (hasAnswered) return;
    playDeselectCue();
    setPlacedLetters((prev) => prev.filter((t) => t.id !== tile.id));
    setAvailableLetters((prev) => [...prev, tile]);
  };

  const handleClearPlacedLetters = () => {
    if (hasAnswered || !currentQuestion || currentQuestion.type !== 'word_find') return;
    playDeselectCue();
    const tiles: LetterTile[] = currentQuestion.scrambledLetters.map((char, i) => ({
      id: `${currentQuestion.id}-tile-${i}-${char}`,
      char
    }));
    setAvailableLetters(tiles);
    setPlacedLetters([]);
  };

  const handleUseLetterHint = () => {
    if (hasAnswered || !currentQuestion || currentQuestion.type !== 'word_find') return;
    // Find first mismatch or next position
    const target = currentQuestion.targetWord;
    let matchPrefixLen = 0;
    for (let i = 0; i < placedLetters.length; i++) {
      if (placedLetters[i].char === target[i]) {
        matchPrefixLen++;
      } else {
        break;
      }
    }
    if (matchPrefixLen >= target.length) return;

    const neededChar = target[matchPrefixLen];
    const remainingPrefix = placedLetters.slice(0, matchPrefixLen);
    const returnedWrong = placedLetters.slice(matchPrefixLen);
    const poolWithReturned = [...availableLetters, ...returnedWrong];
    const matchIdx = poolWithReturned.findIndex((t) => t.char === neededChar);
    if (matchIdx === -1) return;

    playSelectCue();
    const picked = poolWithReturned[matchIdx];
    const nextPool = poolWithReturned.filter((_, i) => i !== matchIdx);
    setPlacedLetters([...remainingPrefix, picked]);
    setAvailableLetters(nextPool);
  };

  const handleVerifyWordFind = () => {
    if (hasAnswered || !currentQuestion || currentQuestion.type !== 'word_find') return;
    const formed = placedLetters.map((t) => t.char).join('');
    const ok = formed === currentQuestion.targetWord;
    setHasAnswered(true);
    setIsCurrentCorrect(ok);
    if (ok) {
      setCorrectCount((prev) => prev + 1);
      playCorrectCue();
    } else {
      playIncorrectCue();
    }
    speakText(currentQuestion.audioText, 'en-GB', `city-wf-${currentQuestion.id}`, { rate: 0.92 });
  };

  const handleNextQuestionOrFinish = async () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }

    // Chapter complete
    setIsSaving(true);
    const finalCorrect = correctCount;
    const scorePercent = Math.round((finalCorrect / Math.max(1, questions.length)) * 100);
    const starsEarned = scorePercent >= 95 ? 3 : scorePercent >= 65 ? 2 : 1;

    try {
      const res = await completeCityChapter(
        levelNumber,
        activeChapterNum,
        scorePercent,
        starsEarned,
        playerLevel
      );
      setCompletionResult(res);
      setScreen('victory');
      playVictoryCue();
      onChapterCompleted(res, levelNumber, activeChapterNum, scorePercent);

      try {
        confetti({
          particleCount: res.justConqueredLevel ? 95 : 45,
          spread: res.justConqueredLevel ? 85 : 60,
          origin: { y: 0.6 },
          colors: ['#f2ca50', '#d4af37', '#34d399', '#ffffff']
        });
      } catch {}
    } finally {
      setIsSaving(false);
    }
  };

  const nextAvailableChapter = useMemo(() => {
    for (let c = 1; c <= 10; c++) {
      if (!completedChapters.includes(c)) return c;
    }
    return 1;
  }, [completedChapters]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322]/98 backdrop-blur-xl flex flex-col animate-fadeIn">
      {/* Sticky Top Architectural Bar */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between gap-3"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          minHeight: 'calc(max(env(safe-area-inset-top, 0px), 16px) + 60px)'
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (screen === 'playing') {
                setScreen('chapters');
              } else {
                onClose();
              }
            }}
            className="w-10 h-10 rounded-full bg-[#191f2f] border border-[#232a3a] flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:border-[#f2ca50]/50 transition-all shrink-0 cursor-pointer"
            title={screen === 'playing' ? 'Retour aux 10 chapitres' : 'Fermer'}
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#f2ca50] font-bold truncate">
              <span>Niveau {String(levelNumber).padStart(2, '0')}/{MAX_CITY_LEVEL}</span>
              <span>·</span>
              <span>{levelMeta.classLabel} ({district.cefrLabel})</span>
            </div>
            <h2 className="font-serif text-base sm:text-xl font-bold text-[#dce2f8] truncate">
              {levelMeta.landmarkTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block">
            <ChapterMasteryProgressBar
              levelNumber={levelNumber}
              progression={progression}
              compact
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#191f2f] border border-[#232a3a] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] shrink-0 cursor-pointer"
            title="Retour au Plan Principal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-5 pb-16">
        {/* SCREEN 1: 10 CHAPTERS OVERVIEW */}
        {screen === 'chapters' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Architectural Landmark Summary Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#191f2f] via-[#151b2b] to-[#0c1322] border border-[#f2ca50]/40 shadow-xl flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0c1322] border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-inner shrink-0">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {levelMeta.icon}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#d4c78f] font-bold">
                      {district.name} · {levelMeta.classLabel}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8]">
                      {levelMeta.landmarkTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#d0c5af] mt-0.5">
                      Thème : {levelMeta.themeFocus}
                    </p>
                  </div>
                </div>

                {isLevelConquered ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span>Niveau Conquis</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] text-xs font-mono font-bold shrink-0">
                    {completedChapters.length} / 10 Chapitres
                  </div>
                )}
              </div>

              {/* 10-step Progress Meter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-[#d0c5af]">
                  <span>
                    {isLevelConquered
                      ? `Les 10 chapitres de ce niveau sont validés — le Niveau ${Math.min(MAX_CITY_LEVEL, levelNumber + 1)} est ouvert !`
                      : `Terminez les 10 chapitres ci-dessous pour conquérir le Niveau ${levelNumber} et débloquer le Niveau ${Math.min(MAX_CITY_LEVEL, levelNumber + 1)}.`}
                  </span>
                  <span className="font-mono font-bold text-[#f2ca50]">
                    {completedChapters.length * 10}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#070e1d] border border-[#232a3a] overflow-hidden p-0.5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, completedChapters.length * 10)}%` }}
                    transition={{ type: 'spring', stiffness: 110, damping: 18 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe088] relative overflow-hidden"
                  >
                    {completedChapters.length > 0 && (
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '220%' }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 1.5 }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                      />
                    )}
                  </motion.div>
                </div>
              </div>

              {!isLevelConquered && (
                <button
                  type="button"
                  onClick={() => handleStartChapter(nextAvailableChapter)}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  <span>Lancer le Chapitre {nextAvailableChapter} / 10</span>
                </button>
              )}
            </div>

            {/* Locked chapter notice banner */}
            <AnimatePresence>
              {lockedNoticeChapter !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-amber-400 text-xl">lock</span>
                    <span>
                      Terminez d&apos;abord le <strong>Chapitre {lockedNoticeChapter - 1}</strong> pour ouvrir le Chapitre {lockedNoticeChapter}.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLockedNoticeChapter(null)}
                    className="text-xs font-mono underline text-amber-300 shrink-0 cursor-pointer"
                  >
                    Fermer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 10 Chapters Urban Street Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CHAPTER_TEMPLATES.map((tpl) => {
                const isDone = completedChapters.includes(tpl.chapterNumber);
                const unlocked = isChapterUnlocked(tpl.chapterNumber);
                const isNextFrontier = !isDone && unlocked;
                const stars = progression.chapterStars?.[`${levelNumber}-${tpl.chapterNumber}`] || 0;
                const bestScore = progression.chapterBestScores?.[`${levelNumber}-${tpl.chapterNumber}`];

                return (
                  <button
                    key={tpl.chapterNumber}
                    type="button"
                    onClick={() => handleStartChapter(tpl.chapterNumber)}
                    className={`group text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] ${
                      isDone
                        ? 'bg-[#191f2f] border-emerald-500/45 hover:border-emerald-400 shadow-md'
                        : isNextFrontier
                        ? 'bg-gradient-to-r from-[#232a3a] to-[#191f2f] border-[#f2ca50] shadow-lg shadow-[#f2ca50]/10 ring-1 ring-[#f2ca50]/40'
                        : 'bg-[#151b2b]/60 border-[#232a3a] opacity-65 hover:opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-black shrink-0 border ${
                          isDone
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                            : isNextFrontier
                            ? 'bg-[#f2ca50] border-[#ffe088] text-[#3c2f00]'
                            : 'bg-[#0c1322] border-[#232a3a] text-[#99907c]'
                        }`}
                      >
                        {unlocked ? (
                          <span>{tpl.chapterNumber}</span>
                        ) : (
                          <span className="material-symbols-outlined text-lg">lock</span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                          <span className={isDone ? 'text-emerald-300 font-bold' : 'text-[#f2ca50] font-bold'}>
                            {tpl.categoryLabel}
                          </span>
                          {tpl.isBossChapter && (
                            <span className="text-amber-300 font-bold">· Final</span>
                          )}
                        </div>
                        <h4 className="font-serif text-base font-bold text-[#dce2f8] truncate group-hover:text-[#f2ca50] transition-colors">
                          {tpl.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {isDone ? (
                            <>
                              <span className="text-xs text-[#f2ca50] tracking-tighter">
                                {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}
                              </span>
                              {typeof bestScore === 'number' && (
                                <span className="text-[11px] font-mono text-[#d0c5af]">
                                  Record : {bestScore}%
                                </span>
                              )}
                            </>
                          ) : unlocked ? (
                            <span className="text-xs text-[#f2ca50] font-semibold">
                              Prêt à jouer · 4 questions
                            </span>
                          ) : (
                            <span className="text-xs text-[#99907c]">
                              Verrouillé · Terminez Chap. {tpl.chapterNumber - 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-xl shrink-0 text-[#f2ca50]">
                      {isDone ? 'replay' : unlocked ? 'play_circle' : 'lock'}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* SCREEN 2: INTERACTIVE CHAPTER QUIZ (LARGE TYPOGRAPHY) */}
        {screen === 'playing' && currentQuestion && (
          <motion.div
            key={`${activeChapterNum}-${questionIndex}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Chapter Progress Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-[#d0c5af]">
                <span className="font-mono font-bold text-[#f2ca50] uppercase tracking-wider">
                  Chapitre {activeChapterNum}/10 · {currentQuestion.categoryTag}
                </span>
                <span className="font-mono font-bold text-[#dce2f8]">
                  Question {questionIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-[#151b2b] border border-[#232a3a] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] transition-all duration-300"
                  style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#151b2b] border border-[#4d4635]/50 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#d4c78f] font-bold">
                  {currentQuestion.type === 'word_find' ? 'Trouver le Mot & Assembler les Lettres' : 'Questionnaire Interactif'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(currentQuestion.audioText, 'en-GB', `city-listen-${currentQuestion.id}`, {
                      rate: 0.9
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-[#f2ca50]/30 text-[#f2ca50] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Écouter la prononciation anglaise"
                >
                  <span className="material-symbols-outlined text-base">volume_up</span>
                  <span>Écouter</span>
                </button>
              </div>

              {currentQuestion.type === 'mcq' && currentQuestion.promptEn && (
                <blockquote className="p-3.5 rounded-xl bg-[#0c1322] border border-[#232a3a] font-serif text-lg sm:text-xl italic text-[#f2ca50] leading-relaxed">
                  « {currentQuestion.promptEn} »
                </blockquote>
              )}

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] leading-snug">
                {currentQuestion.questionFr}
              </h3>

              {currentQuestion.type === 'word_find' && (
                <div className="p-4 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 flex flex-col gap-1.5">
                  <p className="text-base sm:text-lg font-semibold text-[#dce2f8] leading-snug">
                    {currentQuestion.clueText}
                  </p>
                  {currentQuestion.phonetic && (
                    <span className="text-xs sm:text-sm font-mono text-[#d4c78f]">
                      Phonétique : {currentQuestion.phonetic}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* MCQ OPTIONS (ENLARGED HARMONIOUS TYPOGRAPHY) */}
            {currentQuestion.type === 'mcq' && (
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((optText, idx) => {
                  const isSelected = selectedMcqIdx === idx;
                  const isCorrectOpt = idx === currentQuestion.correctIndex;
                  const letterLabel = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);

                  let cardClasses =
                    'bg-[#191f2f] border-[#4d4635]/40 text-[#dce2f8] hover:bg-[#232a3a] hover:border-[#f2ca50]/60';
                  let textClasses = 'text-base sm:text-lg font-semibold';

                  if (hasAnswered) {
                    if (isCorrectOpt) {
                      cardClasses =
                        'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/50';
                      textClasses = 'text-lg sm:text-xl font-bold tracking-tight';
                    } else if (isSelected && !isCorrectOpt) {
                      cardClasses =
                        'bg-rose-950/60 border-rose-400 text-rose-200 shadow-md ring-1 ring-rose-400/40';
                      textClasses = 'text-lg sm:text-xl font-bold';
                    } else {
                      cardClasses = 'bg-[#151b2b]/50 border-[#232a3a] text-[#99907c] opacity-60';
                      textClasses = 'text-base font-medium';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectMcq(idx)}
                      className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer disabled:cursor-default ${cardClasses}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm sm:text-base font-bold shrink-0 border ${
                            hasAnswered && isCorrectOpt
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                              : hasAnswered && isSelected
                              ? 'bg-rose-500 text-white border-rose-300'
                              : 'bg-[#232a3a] text-[#f2ca50] border-[#4d4635]/50'
                          }`}
                        >
                          {letterLabel}
                        </span>
                        <span className={`font-serif break-words whitespace-normal leading-snug transition-all duration-200 ${textClasses}`}>
                          {optText}
                        </span>
                      </div>

                      <span className="material-symbols-outlined text-2xl shrink-0">
                        {hasAnswered && isCorrectOpt
                          ? 'check_circle'
                          : hasAnswered && isSelected && !isCorrectOpt
                          ? 'cancel'
                          : 'radio_button_unchecked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* WORD FIND LETTER BUILDER (BIG BOLD LETTERS) */}
            {currentQuestion.type === 'word_find' && (
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#d4c78f] font-bold">
                    Mot Assemblé ({placedLetters.length}/{currentQuestion.targetWord.length} lettres)
                  </span>
                  {!hasAnswered && (
                    <button
                      type="button"
                      onClick={handleUseLetterHint}
                      className="text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      <span>Révéler 1 lettre</span>
                    </button>
                  )}
                </div>

                {/* Target Slots */}
                <div
                  className={`min-h-[76px] p-3.5 rounded-2xl border-2 border-dashed flex flex-wrap items-center justify-center gap-2 transition-all ${
                    hasAnswered && isCurrentCorrect
                      ? 'border-emerald-400 bg-emerald-950/30'
                      : hasAnswered && !isCurrentCorrect
                      ? 'border-rose-400 bg-rose-950/30'
                      : 'border-[#f2ca50]/45 bg-[#0c1322]'
                  }`}
                >
                  {Array.from({ length: currentQuestion.targetWord.length }).map((_, slotIdx) => {
                    const placed = placedLetters[slotIdx];
                    if (placed) {
                      return (
                        <button
                          key={placed.id}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => handleRemovePlacedLetter(placed)}
                          className={`w-11 h-14 sm:w-14 sm:h-16 rounded-xl font-mono text-2xl sm:text-3xl font-black flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 ${
                            hasAnswered && isCurrentCorrect
                              ? 'bg-emerald-500 text-slate-950 border-2 border-emerald-200'
                              : hasAnswered && !isCurrentCorrect
                              ? 'bg-rose-500 text-white border-2 border-rose-200'
                              : 'bg-[#f2ca50] text-[#3c2f00] border-2 border-[#ffe088] hover:bg-[#ffe088]'
                          }`}
                          title="Cliquer pour retirer cette lettre"
                        >
                          {placed.char}
                        </button>
                      );
                    }
                    return (
                      <div
                        key={`empty-${slotIdx}`}
                        className="w-11 h-14 sm:w-14 sm:h-16 rounded-xl border-2 border-[#232a3a] bg-[#151b2b]/80 flex items-center justify-center text-xl font-mono font-bold text-[#99907c]/40"
                      >
                        _
                      </div>
                    );
                  })}
                </div>

                {/* Available Letter Bank */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase text-[#d0c5af]">
                    Lettres disponibles :
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] min-h-[72px]">
                    {availableLetters.length === 0 ? (
                      <span className="text-sm text-[#d4c78f] italic">
                        Toutes les lettres sont placées — validez votre réponse !
                      </span>
                    ) : (
                      availableLetters.map((tile) => (
                        <button
                          key={tile.id}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => handlePlaceLetter(tile)}
                          className="w-12 h-13 sm:w-14 sm:h-15 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border-2 border-[#4d4635]/60 hover:border-[#f2ca50] text-[#f2ca50] font-mono text-xl sm:text-2xl font-black flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          {tile.char}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {!hasAnswered && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleClearPlacedLetters}
                      disabled={placedLetters.length === 0}
                      className="px-4 py-2.5 rounded-xl bg-[#191f2f] border border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8] disabled:opacity-40 text-xs sm:text-sm font-semibold cursor-pointer"
                    >
                      Effacer les lettres
                    </button>
                    <button
                      type="button"
                      disabled={placedLetters.length !== currentQuestion.targetWord.length}
                      onClick={handleVerifyWordFind}
                      className="px-6 py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      Valider le Mot
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* POST-ANSWER EXPLANATION & NEXT BUTTON */}
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-xl ${
                  isCurrentCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-serif text-lg font-bold">
                    <span className="material-symbols-outlined text-2xl">
                      {isCurrentCorrect ? 'verified' : 'info'}
                    </span>
                    <span>
                      {isCurrentCorrect ? 'Excellente réponse !' : 'Réponse corrigée'}
                    </span>
                  </div>

                  {currentQuestion.type === 'word_find' && !isCurrentCorrect && (
                    <span className="px-3 py-1 rounded-lg bg-[#0c1322] border border-[#f2ca50]/50 font-mono text-base sm:text-lg font-black text-[#f2ca50]">
                      {currentQuestion.targetWord}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-[#dce2f8]">
                  {currentQuestion.explanationFr}
                </p>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleNextQuestionOrFinish}
                  className="mt-1 w-full py-3.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>
                    {isSaving
                      ? 'Enregistrement...'
                      : questionIndex < questions.length - 1
                      ? 'Question Suivante'
                      : `Valider le Chapitre ${activeChapterNum} / 10`}
                  </span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SCREEN 3: CHAPTER VICTORY & LEVEL CONQUEST */}
        {screen === 'victory' && completionResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#191f2f] to-[#0c1322] border border-[#f2ca50]/50 shadow-2xl flex flex-col items-center text-center gap-5"
          >
            <div className="w-20 h-20 rounded-full bg-[#f2ca50]/15 border-2 border-[#f2ca50] flex items-center justify-center text-[#f2ca50] shadow-xl">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {completionResult.justConqueredLevel ? 'military_tech' : 'workspace_premium'}
              </span>
            </div>

            {completionResult.justConqueredLevel ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  10 / 10 CHAPITRES VALIDÉS !
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#f2ca50]">
                  Niveau {levelNumber} Conquis !
                </h3>
                <p className="text-sm sm:text-base text-[#dce2f8] max-w-md">
                  Félicitations ! Vous avez achevé les 10 chapitres de <strong>{levelMeta.landmarkTitle}</strong>.
                  {completionResult.unlockedNextLevel && (
                    <>
                      {' '}Le <strong>Niveau {completionResult.unlockedNextLevel}</strong> est désormais débloqué sur le Plan Principal !
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                  Chapitre {activeChapterNum} / 10 Validé
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#dce2f8]">
                  Étape Accomplie ({completionResult.completedChaptersCount}/10)
                </h3>
                <p className="text-sm text-[#d0c5af] max-w-md">
                  Score de précision : <strong className="text-[#f2ca50]">{Math.round((correctCount / questions.length) * 100)}%</strong> ({correctCount}/{questions.length} bonnes réponses).
                </p>
              </div>
            )}

            {/* Rewards Summary */}
            <div className="w-full grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#070e1d] border border-[#232a3a] flex flex-col items-center">
                <span className="text-[11px] font-mono text-[#d0c5af]">XP Gagnés</span>
                <span className="text-lg font-bold text-[#f2ca50] font-mono">+{completionResult.xpAwarded}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070e1d] border border-[#232a3a] flex flex-col items-center">
                <span className="text-[11px] font-mono text-[#d0c5af]">Chapitres</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {completionResult.completedChaptersCount}/10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#070e1d] border border-[#232a3a] flex flex-col items-center">
                <span className="text-[11px] font-mono text-[#d0c5af]">MSZ Coins</span>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  +{completionResult.coinsAwarded}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              {completionResult.unlockedNextLevel && onNavigateToLevel ? (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToLevel(completionResult.unlockedNextLevel!);
                    setScreen('chapters');
                  }}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ouvrir le Niveau {completionResult.unlockedNextLevel}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              ) : activeChapterNum < 10 ? (
                <button
                  type="button"
                  onClick={() => handleStartChapter(activeChapterNum + 1)}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Chapitre Suivant ({activeChapterNum + 1}/10)</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setScreen('chapters')}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] text-[#dce2f8] font-semibold text-sm border border-[#4d4635]/40 cursor-pointer"
              >
                Voir les 10 Chapitres
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
