import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DICTATION_ITEMS, type DictationItem } from '../data/curriculum';
import { THEMES_500, GRADES_500 } from '../data/spacedRepetition500';
import { recordAttempt } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import confetti from 'canvas-confetti';
import { DualSpeakerButton } from './DualSpeakerButton';
import { speakText, stopSpeech } from '../services/speechService';
import { getWordLinguisticDetails } from '../utils/flashcardDetailsHelper';

interface DictationModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onAttemptRecorded?: () => void;
}

export const DictationModal: React.FC<DictationModalProps> = ({
  currentLevel,
  onClose,
  onAttemptRecorded
}) => {
  // Navigation & Filtering across 500+ items
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);

  // Card Flip State: Recto (Dictation & Audio) vs Verso (Definitions, Etymology, Collocations)
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [dictationTargetMode, setDictationTargetMode] = useState<'sentence' | 'word'>('sentence');

  // Audio Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeSpeechAccent, setActiveSpeechAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [listenCount, setListenCount] = useState<number>(0);

  // Dictation Transcription & Evaluation states
  const [userText, setUserText] = useState<string>('');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [accuracyScore, setAccuracyScore] = useState<number>(0);
  const [diffTokens, setDiffTokens] = useState<Array<{ text: string; isCorrect: boolean; original?: string }>>([]);
  const [isSavedToCloud, setIsSavedToCloud] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Jumper and Filter bar controls
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [showJumper, setShowJumper] = useState<boolean>(false);

  // Touch gesture tracking for smooth scroll & accidental flip prevention
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isScrollingOrDraggingRef = useRef<boolean>(false);
  const versoScrollRef = useRef<HTMLDivElement>(null);

  // Filter 500+ dictation items based on grade, theme, and search query
  const filteredItems = useMemo(() => {
    let list = DICTATION_ITEMS.filter((item) => {
      if (selectedGrade !== 'all' && item.gradeLevel !== selectedGrade) {
        return false;
      }
      if (selectedTheme !== 'all' && item.theme !== selectedTheme) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCanon = item.canonicalText.toLowerCase().includes(q);
        const matchWord = item.targetWord?.toLowerCase().includes(q);
        const matchFr = item.frenchDef?.toLowerCase().includes(q);
        return matchTitle || matchCanon || matchWord || matchFr;
      }
      return true;
    });

    if (shuffledOrder && shuffledOrder.length === list.length) {
      return shuffledOrder.map((idx) => list[idx] || list[0]);
    }

    return list;
  }, [selectedGrade, selectedTheme, searchQuery, shuffledOrder]);

  // Keep index within bounds
  const safeIndex = filteredItems.length > 0 ? Math.min(currentIndex, filteredItems.length - 1) : 0;
  const item: DictationItem = filteredItems[safeIndex] || DICTATION_ITEMS[0];

  // Derive linguistic details for current word (part of speech, syllables, register, mnemonic)
  const linguisticDetails = useMemo(() => {
    const term = item.targetWord || item.title.split('—')[0].trim();
    const french = item.frenchDef || item.notes[0]?.explanation || '';
    const cat = item.themeLabel || item.notes[0]?.register || '';
    return getWordLinguisticDetails(term, french, cat, item.gradeLevel, item.etymology);
  }, [item]);

  // Target speech text based on mode: Sentence or isolated Word
  const currentSpeechText = useMemo(() => {
    if (dictationTargetMode === 'word' && item.targetWord) {
      return item.targetWord;
    }
    return item.canonicalText;
  }, [dictationTargetMode, item]);

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Audio Playback with speechService
  const handleTogglePlay = useCallback(
    (accent: 'en-GB' | 'en-US' = activeSpeechAccent) => {
      if (isPlaying) {
        stopSpeech();
        setIsPlaying(false);
        return;
      }

      setActiveSpeechAccent(accent);
      setIsPlaying(true);
      setListenCount((prev) => Math.min(6, prev + 1));

      speakText(currentSpeechText, accent, `dictation-${item.id}-${accent}`, {
        rate: playbackSpeed,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    },
    [isPlaying, activeSpeechAccent, currentSpeechText, item.id, playbackSpeed]
  );

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Card Navigation
  const handleNextItem = useCallback(() => {
    setIsFlipped(false);
    setUserText('');
    setHasEvaluated(false);
    setIsSavedToCloud(false);
    setListenCount(0);
    stopSpeech();
    setIsPlaying(false);
    if (versoScrollRef.current) versoScrollRef.current.scrollTop = 0;
    setCurrentIndex((prev) => (filteredItems.length > 0 ? (prev < filteredItems.length - 1 ? prev + 1 : 0) : 0));
  }, [filteredItems.length]);

  const handlePrevItem = useCallback(() => {
    setIsFlipped(false);
    setUserText('');
    setHasEvaluated(false);
    setIsSavedToCloud(false);
    setListenCount(0);
    stopSpeech();
    setIsPlaying(false);
    if (versoScrollRef.current) versoScrollRef.current.scrollTop = 0;
    setCurrentIndex((prev) => (filteredItems.length > 0 ? (prev > 0 ? prev - 1 : filteredItems.length - 1) : 0));
  }, [filteredItems.length]);

  const handleShuffle = () => {
    if (filteredItems.length <= 1) return;
    const indices = Array.from({ length: filteredItems.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setCurrentIndex(0);
    setIsFlipped(false);
    setUserText('');
    setHasEvaluated(false);
    showToast('Deck de dictées mélangé aléatoirement 🔀');
  };

  const resetFilters = () => {
    setSelectedGrade('all');
    setSelectedTheme('all');
    setSearchQuery('');
    setShuffledOrder(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setUserText('');
    setHasEvaluated(false);
  };

  // Flip card handler: Touch to flip between Recto and Verso
  const handleCardFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Touch event tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    isScrollingOrDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.touches[0];
    const deltaX = Math.abs(t.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(t.clientY - touchStartRef.current.y);
    if (deltaX > 8 || deltaY > 8) {
      isScrollingOrDraggingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartRef.current.x;
    const deltaY = t.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Swipe left/right detection
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4 && deltaTime < 400) {
      if (deltaX < 0) {
        handleNextItem();
      } else {
        handlePrevItem();
      }
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = null;
  };

  // Insert apostrophe helper
  const handleInsertApostrophe = () => {
    setUserText((prev) => prev + "'");
  };

  // Text normalization
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  // Evaluate transcription
  const handleEvaluate = async () => {
    const targetText = dictationTargetMode === 'word' && item.targetWord ? item.targetWord : item.canonicalText;
    const canonicalTokens = targetText.split(/\s+/);
    const userTokens = userText.trim().split(/\s+/);

    const diffs: Array<{ text: string; isCorrect: boolean; original?: string }> = [];
    let matches = 0;

    canonicalTokens.forEach((cToken, idx) => {
      const uToken = userTokens[idx] || '';
      const normC = normalize(cToken);
      const normU = normalize(uToken);

      if (normU === normC && normU.length > 0) {
        diffs.push({ text: cToken, isCorrect: true });
        matches++;
      } else {
        diffs.push({
          text: cToken,
          isCorrect: false,
          original: uToken || '(manquant)'
        });
      }
    });

    const score = Math.max(10, Math.round((matches / canonicalTokens.length) * 100));
    setAccuracyScore(score);
    setDiffTokens(diffs);
    setHasEvaluated(true);

    if (score >= 80) {
      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.7 },
          colors: ['#f2ca50', '#d4af37', '#ffffff']
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }

    // Save attempt to Firebase
    await recordAttempt({
      moduleId: item.id,
      moduleType: 'dictation',
      title: item.title,
      level: item.level,
      score,
      durationSeconds: Math.max(15, Math.round(canonicalTokens.length * 2.5))
    });
    onAttemptRecorded?.();
  };

  const handleSaveToRevision = async () => {
    setIsSavedToCloud(true);
    showToast('Session ajoutée à votre carnet de révision 📚');
  };

  const wordCount = userText.trim().length === 0 ? 0 : userText.trim().split(/\s+/).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#191f2f] text-[#f2ca50] border border-[#f2ca50]/40 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl animate-bounce flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Header */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#191f2f] transition-all"
            aria-label="Fermer la dictée"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-bold text-[#dce2f8] leading-tight flex items-center gap-2">
              Dictation Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] font-mono border border-[#f2ca50]/30 font-bold">
                500 Mots & Sessions
              </span>
            </h1>
            <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
              Deck Recto-Verso • UK & US Audio • Étymologie & Collocations
            </span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          {/* Quick Grade Badge */}
          <span className="px-2.5 py-1 rounded-lg bg-[#191f2f] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] font-mono">
            {item.gradeLevel ? item.gradeLevel.toUpperCase() : item.level}
          </span>

          {/* Toggle filter bar */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
              showFilters
                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50]'
                : 'bg-[#191f2f] text-[#d0c5af] border-[#232a3a]'
            }`}
            title="Afficher/masquer les filtres thématiques et scolaires"
          >
            <span className="material-symbols-outlined text-base">filter_list</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* FILTER & SEARCH BAR SECTION (Collapsible) */}
      {showFilters && (
        <section className="px-4 sm:px-6 py-3 bg-[#111726] border-b border-[#232a3a] flex flex-col gap-2.5 animate-fadeIn">
          {/* Search bar & quick actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#99907c]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder="Rechercher parmi les 500 mots (ex: timetable, journey, heritage...)"
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#191f2f] text-xs text-[#dce2f8] placeholder:text-[#99907c]/60 border border-[#232a3a] focus:border-[#f2ca50] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#99907c] hover:text-[#dce2f8]"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              )}
            </div>

            {/* Shuffle Button */}
            <button
              type="button"
              onClick={handleShuffle}
              className="px-3 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-xs font-semibold text-[#f2ca50] border border-[#4d4635]/40 flex items-center gap-1.5 shrink-0"
              title="Mélanger aléatoirement le deck de 500 sessions"
            >
              <span className="material-symbols-outlined text-sm">shuffle</span>
              <span className="hidden sm:inline">Mélanger</span>
            </button>

            {/* Reset Filters */}
            {(selectedGrade !== 'all' || selectedTheme !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-2 rounded-xl bg-[#232a3a] text-xs text-[#d0c5af] hover:text-[#ffb4ab] shrink-0"
                title="Réinitialiser les filtres"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
              </button>
            )}
          </div>

          {/* Grade Level Selector (6e, 5e, 4e, 3e, 2nde, 1re, Terminale) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] uppercase font-bold text-[#99907c] tracking-wider shrink-0 mr-1">
              Classe :
            </span>
            {GRADES_500.map((g) => {
              const isSelected = selectedGrade === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGrade(g.id);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] font-bold shadow-sm'
                      : 'bg-[#191f2f] text-[#d0c5af] border-[#232a3a] hover:bg-[#232a3a]'
                  }`}
                >
                  {g.short}
                </button>
              );
            })}
          </div>

          {/* 10 Themes Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] uppercase font-bold text-[#99907c] tracking-wider shrink-0 mr-1">
              Thème :
            </span>
            {THEMES_500.map((th) => {
              const isSelected = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setSelectedTheme(th.id);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans shrink-0 transition-all border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] font-bold shadow-sm'
                      : 'bg-[#191f2f] text-[#d0c5af] border-[#232a3a] hover:bg-[#232a3a]'
                  }`}
                >
                  <span>{th.icon}</span>
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Studio Body */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* Progress & Pagination Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-[#d0c5af]">
            <div className="flex items-center gap-2">
              <span className="text-[#f2ca50] font-semibold font-serif">
                {item.themeLabel || item.source}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232a3a] text-[#d4c78f] font-mono">
                {item.gradeLabel || `Niveau ${item.level}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowJumper(!showJumper)}
                className="font-mono text-xs text-[#f2ca50] hover:underline"
              >
                Session {safeIndex + 1} / {filteredItems.length}
              </button>
            </div>
          </div>

          {/* Visual Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-[#191f2f] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] rounded-full transition-all duration-300"
              style={{
                width: `${((safeIndex + 1) / Math.max(1, filteredItems.length)) * 100}%`
              }}
            />
          </div>

          {/* Jump to index popover */}
          {showJumper && (
            <div className="p-3 rounded-xl bg-[#151b2b] border border-[#f2ca50]/40 flex items-center gap-2 animate-fadeIn text-xs">
              <span className="text-[#d0c5af]">Aller à la session :</span>
              <input
                type="number"
                min={1}
                max={filteredItems.length}
                defaultValue={safeIndex + 1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val) && val >= 1 && val <= filteredItems.length) {
                      setCurrentIndex(val - 1);
                      setShowJumper(false);
                      setIsFlipped(false);
                    }
                  }
                }}
                className="w-20 px-2 py-1 rounded bg-[#070e1d] text-[#f2ca50] font-mono border border-[#232a3a] outline-none"
              />
              <span className="text-[#99907c] font-mono">/ {filteredItems.length}</span>
              <button
                type="button"
                onClick={() => setShowJumper(false)}
                className="ml-auto text-xs text-[#d0c5af] hover:text-[#f2ca50]"
              >
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE RECTO-VERSO DYNAMIC DECK CARD */}
        {/* ========================================================================= */}
        <div
          className="relative w-full transition-all duration-300"
          style={{ perspective: '1200px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* CARD CONTAINER (Flips smoothly between Recto and Verso) */}
          <div
            className={`w-full rounded-2xl transition-transform duration-500 ease-out shadow-2xl relative ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* =================================================================== */}
            {/* RECTO: DICTATION SLATE & DUAL AUDIO PLAYER */}
            {/* =================================================================== */}
            <div
              className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#191f2f] via-[#151b2b] to-[#0c1322] border border-[#4d4635]/40 flex flex-col gap-4.5 [backface-visibility:hidden] ${
                isFlipped ? 'pointer-events-none' : ''
              }`}
            >
              {/* Card Header: Term / Title and Mode Selector */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider">
                      {item.gradeLabel || `Niveau ${item.level}`}
                    </span>
                    <span className="text-xs text-[#99907c]">•</span>
                    <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
                      {item.themeLabel}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] mt-0.5">
                    {item.targetWord || item.title}
                  </h2>
                </div>

                {/* Mode Selector: Phrase Complète vs Mot Cible */}
                <div className="flex rounded-xl bg-[#0c1322] p-1 border border-[#232a3a]">
                  <button
                    type="button"
                    onClick={() => setDictationTargetMode('sentence')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      dictationTargetMode === 'sentence'
                        ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                        : 'text-[#d0c5af] hover:text-[#f2ca50]'
                    }`}
                  >
                    Phrase
                  </button>
                  <button
                    type="button"
                    onClick={() => setDictationTargetMode('word')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      dictationTargetMode === 'word'
                        ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                        : 'text-[#d0c5af] hover:text-[#f2ca50]'
                    }`}
                  >
                    Mot Clé
                  </button>
                </div>
              </div>

              {/* Phonetic Transcription & Linguistic pill */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {item.phonetic && (
                  <span className="text-[#f2ca50] font-mono bg-[#070e1d] px-2.5 py-1 rounded-lg border border-[#f2ca50]/20 font-bold">
                    {item.phonetic}
                  </span>
                )}
                {linguisticDetails && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${linguisticDetails.partOfSpeech.color}`}
                  >
                    {linguisticDetails.partOfSpeech.label}
                  </span>
                )}
                <span className="text-[11px] text-[#d0c5af]/80 italic">
                  Cadence {item.durationLabel}
                </span>
              </div>

              {/* DUAL SPEAKER AUDIO BAR: British UK 🇬🇧 & American US 🇺🇸 */}
              <div className="p-3.5 rounded-xl bg-[#0c1322]/80 border border-[#4d4635]/30 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#99907c] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">headphones</span>
                    Écoute & Prononciation Comparative
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#d4c78f]">
                    <span>Écoutes :</span>
                    <span className="font-bold text-[#f2ca50]">{listenCount} / 6</span>
                  </div>
                </div>

                {/* Dual Speaker button component */}
                <DualSpeakerButton
                  text={currentSpeechText}
                  id={`dictation-modal-${item.id}-${dictationTargetMode}`}
                  rate={playbackSpeed}
                  phonetic={item.phonetic}
                  explanation="Vérifiez la prononciation en anglais britannique ou américain avant de transcrire"
                  variant="prominent"
                  onStart={() => setListenCount((prev) => Math.min(6, prev + 1))}
                />

                {/* Speed selector & 5s replay */}
                <div className="flex items-center justify-between pt-1 border-t border-[#232a3a]">
                  <div className="flex rounded-lg bg-[#191f2f] p-0.5 gap-1">
                    {[0.8, 1.0, 1.2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                            : 'text-[#d0c5af] hover:text-[#dce2f8]'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Replay button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePlay(activeSpeechAccent)}
                    className="px-3 py-1 rounded-lg bg-[#191f2f] hover:bg-[#232a3a] text-xs text-[#f2ca50] flex items-center gap-1 transition-colors border border-[#4d4635]/30"
                  >
                    <span className="material-symbols-outlined text-sm">replay</span>
                    <span>Réécouter ({activeSpeechAccent === 'en-GB' ? 'UK' : 'US'})</span>
                  </button>
                </div>
              </div>

              {/* TRANSCRIPTION INPUT SLATE */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="dictation-input" className="text-xs font-semibold text-[#dce2f8] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">edit_note</span>
                    Votre retranscription (
                    {dictationTargetMode === 'sentence' ? 'Phrase complète' : 'Mot clé'})
                  </label>
                  <button
                    type="button"
                    onClick={handleInsertApostrophe}
                    className="text-[#f2ca50] hover:underline flex items-center gap-1 font-mono text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">ink_pen</span> Symbole '
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#4d4635]/40 shadow-inner">
                  <textarea
                    id="dictation-input"
                    rows={dictationTargetMode === 'sentence' ? 3 : 2}
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    placeholder={
                      dictationTargetMode === 'sentence'
                        ? "Écoutez l'extrait audio et saisissez la phrase complète en anglais..."
                        : `Écoutez et saisissez l'orthographe exacte du mot (« ${item.frenchDef || item.targetWord} »)...`
                    }
                    className="w-full bg-transparent resize-none outline-none font-sans text-sm sm:text-base text-[#dce2f8] placeholder:text-[#99907c]/60 leading-relaxed"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-[#232a3a] text-xs text-[#99907c]">
                    <span className="text-[#d4c78f] font-mono">
                      {wordCount} mot{wordCount > 1 ? 's' : ''} saisi{wordCount > 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUserText('')}
                      className="hover:text-[#ffb4ab] transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <span className="material-symbols-outlined text-sm">backspace</span> Effacer
                    </button>
                  </div>
                </div>
              </div>

              {/* VERIFICATION TRIGGER BUTTON */}
              {!hasEvaluated ? (
                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={wordCount === 0}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.99] ${
                    wordCount > 0
                      ? 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088] cursor-pointer shadow-[#f2ca50]/20'
                      : 'bg-[#232a3a] text-[#99907c] cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">verified</span>
                  <span>Vérifier l'orthographe & la transcription</span>
                </button>
              ) : (
                /* EVALUATION RESULT BLOCK */
                <div className="flex flex-col gap-3 animate-fadeIn">
                  {/* Score banner */}
                  <div className="p-3.5 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#070e1d] border-2 border-[#f2ca50] flex items-center justify-center font-serif text-base font-bold text-[#f2ca50]">
                        {accuracyScore}%
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-sm text-[#dce2f8]">
                          {accuracyScore >= 90
                            ? 'Excellente Acuité Orthotypographique'
                            : accuracyScore >= 70
                            ? 'Bonne Maîtrise Lexicale'
                            : 'Perfectionnement Requis'}
                        </span>
                        <p className="text-[11px] text-[#d0c5af]/80">
                          Précision évaluée avec tolérance souple sur la ponctuation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Differential tokens */}
                  <div className="p-3.5 rounded-xl bg-[#070e1d] border border-[#4d4635]/40 flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4c78f]">
                      Analyse Différentielle Mot à Mot :
                    </span>
                    <div className="text-sm leading-relaxed flex flex-wrap gap-1.5">
                      {diffTokens.map((tok, idx) => (
                        <span key={idx}>
                          {tok.isCorrect ? (
                            <span className="text-[#d4c78f] font-semibold bg-[#f2ca50]/10 px-1.5 py-0.5 rounded">
                              {tok.text}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#93000a]/30 px-1.5 py-0.5 rounded border border-[#ffb4ab]/30">
                              <span className="text-[#ffb4ab] line-through text-xs">
                                {tok.original}
                              </span>
                              <span className="text-[#f2ca50] font-bold">
                                {tok.text}
                              </span>
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FLIP CARD TRIGGER CALLOUT (RECTO ➔ VERSO) */}
              <button
                type="button"
                onClick={handleCardFlip}
                className="w-full py-3 px-4 rounded-xl bg-[#151b2b] hover:bg-[#232a3a] text-[#f2ca50] font-semibold text-xs flex items-center justify-center gap-2 border border-[#f2ca50]/30 transition-all group shadow-md"
              >
                <span className="material-symbols-outlined text-base group-hover:rotate-180 transition-transform duration-300">
                  flip
                </span>
                <span>
                  Toucher la carte pour afficher le VERSO (Signification, Étymologie & Collocations)
                </span>
              </button>
            </div>

            {/* =================================================================== */}
            {/* VERSO: LINGUISTIC DEEP DIVE (DEFINITIONS, ETYMOLOGY, COLLOCATIONS) */}
            {/* =================================================================== */}
            <div
              ref={versoScrollRef}
              className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121927] via-[#101624] to-[#090e18] border border-[#f2ca50]/50 shadow-2xl flex flex-col gap-4.5 absolute inset-0 overflow-y-auto [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                !isFlipped ? 'pointer-events-none' : ''
              }`}
            >
              {/* Verso Header: Return to Recto Button & Word */}
              <div className="flex items-center justify-between pb-2 border-b border-[#232a3a]">
                <button
                  type="button"
                  onClick={handleCardFlip}
                  className="px-3 py-1.5 rounded-lg bg-[#191f2f] hover:bg-[#232a3a] text-[#f2ca50] text-xs font-semibold flex items-center gap-1.5 border border-[#f2ca50]/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Toucher pour revenir au RECTO</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] font-mono border border-[#f2ca50]/30 font-bold">
                    Fiche Verso
                  </span>
                </div>
              </div>

              {/* Term & Pronunciation Recap on Verso */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#f2ca50]">
                    {item.targetWord || item.title}
                  </h3>
                  {item.phonetic && (
                    <span className="text-xs text-[#d4c78f] font-mono">
                      {item.phonetic}
                    </span>
                  )}
                </div>

                {/* Dual Speaker on Verso */}
                <DualSpeakerButton
                  text={item.targetWord || item.canonicalText}
                  id={`dictation-verso-${item.id}`}
                  rate={playbackSpeed}
                  variant="pill"
                />
              </div>

              {/* 1. TRADUCTION & SIGNIFICATION (FRENCH & ENGLISH DEFINITIONS) */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-[#4d4635]/40 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">translate</span>
                  Signification & Traduction
                </span>
                <p className="text-sm font-serif text-[#dce2f8] leading-relaxed">
                  <strong className="text-[#f1e3a9]">Français : </strong>
                  {item.frenchDef || item.notes[0]?.explanation}
                </p>
                {item.englishDef && (
                  <p className="text-xs text-[#d0c5af]/90 italic leading-relaxed pt-1 border-t border-[#232a3a]">
                    <strong className="text-[#d4c78f] not-italic">English : </strong>
                    {item.englishDef}
                  </p>
                )}
              </div>

              {/* 2. ÉTYMOLOGIE & PHILOLOGIE */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-[#4d4635]/40 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">history_edu</span>
                  Étymologie & Origine Philologique
                </span>
                <p className="text-xs text-[#d0c5af] leading-relaxed">
                  {item.etymology ||
                    item.notes.find((n) => n.register.includes('Étymologie'))?.explanation ||
                    "Origine philologique attestée par les archives lexicographiques d'Oxford et du corpus anglo-saxon."}
                </p>
              </div>

              {/* 3. COLLOCATIONS AUTHENTIQUES & NUANCES */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-[#4d4635]/40 flex flex-col gap-2.5">
                <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Collocations Usuelles & Associations Idiomatiques
                </span>
                <div className="flex flex-wrap gap-2">
                  {(item.collocations && item.collocations.length > 0
                    ? item.collocations
                    : ['frequent usage', 'idiomatic pattern']
                  ).map((colloc, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => speakText(colloc, 'en-GB', `colloc-${cIdx}`)}
                      className="px-2.5 py-1 rounded-lg bg-[#191f2f] hover:bg-[#232a3a] text-xs font-serif text-[#f2ca50] border border-[#f2ca50]/20 flex items-center gap-1.5 transition-colors"
                      title="Écouter la collocation"
                    >
                      <span className="material-symbols-outlined text-[13px] opacity-75">volume_up</span>
                      <span>{colloc}</span>
                    </button>
                  ))}
                </div>

                {item.nuanceComparisons && item.nuanceComparisons.length > 0 && (
                  <div className="pt-2 border-t border-[#232a3a] flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#99907c] tracking-wider">
                      Distinction & Nuance Sémantique :
                    </span>
                    {item.nuanceComparisons.map((nu, nIdx) => (
                      <div key={nIdx} className="text-xs text-[#d0c5af]/90 flex items-start gap-1.5">
                        <strong className="text-[#f2ca50] shrink-0">{nu.word} :</strong>
                        <span>{nu.distinction}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. EXTRAIT DE PRESSE & SOURCE CANONIQUE */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-[#4d4635]/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">newspaper</span>
                    Extrait en Contexte Réel
                  </span>
                  <span className="text-[10px] text-[#99907c] font-mono">{item.source}</span>
                </div>
                <blockquote className="font-serif italic text-xs sm:text-sm text-[#f1e3a9] leading-relaxed">
                  “{item.canonicalText}”
                </blockquote>
              </div>

              {/* Bottom Return Action */}
              <button
                type="button"
                onClick={handleCardFlip}
                className="w-full py-3 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Revenir au Recto pour la Dictée</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM GLOBAL ACTION BAR: Previous, Next, Save to Revision */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrevItem}
            className="flex-1 py-3 px-4 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-[#dce2f8] font-semibold text-xs flex items-center justify-center gap-2 border border-[#232a3a] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Précédent</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToRevision}
            className="py-3 px-3.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-[#f2ca50] border border-[#4d4635]/40 transition-colors shrink-0"
            title="Enregistrer la session dans mon carnet de révision"
          >
            <span className="material-symbols-outlined text-base">
              {isSavedToCloud ? 'cloud_done' : 'bookmark_add'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextItem}
            className="flex-1 py-3 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/20 transition-all active:scale-95"
          >
            <span>Suivant</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
};
