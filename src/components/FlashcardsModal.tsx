import React, { useState, useEffect, useCallback } from 'react';
import { FLASHCARD_ITEMS, type FlashcardItem } from '../data/curriculum';
import { saveFlashcardProgress } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import confetti from 'canvas-confetti';

interface FlashcardsModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onCardReviewed?: () => void;
  initialFocusMode?: boolean;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  currentLevel,
  onClose,
  onCardReviewed,
  initialFocusMode = false
}) => {
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(initialFocusMode);

  const card: FlashcardItem = FLASHCARD_ITEMS[cardIndex] || FLASHCARD_ITEMS[0];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev < FLASHCARD_ITEMS.length - 1 ? prev + 1 : 0));
  }, []);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev > 0 ? prev - 1 : FLASHCARD_ITEMS.length - 1));
  }, []);

  const playPronunciation = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.term);
      utterance.lang = 'en-GB';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 1400);
    }
  }, [card.term]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Mode Focus Lecture activé • Éléments superflus occultés'
          : 'Mode Standard restauré'
      );
      return next;
    });
  }, [showToast]);

  // Keyboard navigation & shortcuts for deep focus immersion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFocusMode();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (isFocusMode) {
          setIsFocusMode(false);
          showToast('Mode Standard restauré');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNextCard, handlePrevCard, toggleFocusMode, isFocusMode, onClose, showToast]);

  const handleSM2Rating = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    let days = 1;
    let score = 3;
    let feedback = '';

    if (quality === 'again') {
      days = 0;
      score = 1;
      feedback = 'Programmé pour révision immédiate (< 10m)';
    } else if (quality === 'hard') {
      days = 1;
      score = 2;
      feedback = 'Intervalle ajusté : 1 jour (SM-2)';
    } else if (quality === 'good') {
      days = 3;
      score = 3;
      feedback = 'Intervalle validé : 3 jours';
    } else if (quality === 'easy') {
      days = 7;
      score = 4;
      feedback = 'Carte consolidée : rappel dans 7 jours';
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f2ca50', '#d4af37']
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }

    showToast(feedback);

    // Save progress to Firestore / IndexedDB / Local
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (days || 1));

    await saveFlashcardProgress({
      cardId: card.id,
      term: card.term,
      repetitions: 1,
      intervalDays: days,
      easeFactor: 2.5,
      nextReviewDate: nextDate.toISOString(),
      lastQualityScore: score,
      state: quality === 'easy' ? 'mastered' : 'review'
    });

    onCardReviewed?.();

    // Advance to next card smoothly
    setTimeout(() => {
      setIsFlipped(false);
      if (cardIndex < FLASHCARD_ITEMS.length - 1) {
        setCardIndex((prev) => prev + 1);
      } else {
        setCardIndex(0);
      }
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col pt-safe pb-safe animate-fadeIn select-none transition-colors duration-700 ${
        isFocusMode ? 'bg-[#050913]' : 'bg-[#0c1322]'
      }`}
    >
      {/* Background Ambient Glow (Warmer and cleaner in Focus Mode) */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 ${
          isFocusMode
            ? 'w-[750px] h-[550px] bg-gradient-to-tr from-amber-400/10 via-[#f2ca50]/15 to-transparent blur-3xl'
            : 'w-96 h-96 bg-[#f2ca50]/10 blur-3xl'
        }`}
      />

      {/* 1. TOP HEADER: Standard vs Focus Mode */}
      {!isFocusMode ? (
        /* Standard Header */
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 bg-[#0c1322]/90 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] transition-colors"
              title="Retour au sanctuaire"
            >
              <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-serif text-lg font-bold text-[#dce2f8] leading-tight">
                Spaced Repetition
              </h1>
              <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
                Deck : Rhétorique & Diplomatie
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Focus Lecture Toggle Button */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className="px-3 py-1.5 rounded-xl border border-[#f2ca50]/40 bg-[#191f2f] hover:bg-[#f2ca50]/20 text-[#f2ca50] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Activer le Mode Focus Lecture (Raccourci: F)"
            >
              <span className="material-symbols-outlined text-sm">center_focus_strong</span>
              <span className="hidden sm:inline">Focus Lecture</span>
            </button>

            <span className="text-xs text-[#d0c5af] font-mono px-2 py-1 rounded bg-[#151b2b]">
              {cardIndex + 1} / {FLASHCARD_ITEMS.length}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </header>
      ) : (
        /* Focus Mode Minimal Floating HUD (Non-essential distractions occulted) */
        <header className="sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between pointer-events-auto">
          {/* Subtle discrete indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a101d]/80 border border-[#f2ca50]/30 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#f2ca50] shadow-[0_0_8px_#f2ca50] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#f2ca50] uppercase">
              FOCUS LECTURE
            </span>
            <span className="text-[#99907c] text-[10px]">&bull;</span>
            <span className="text-[11px] font-mono text-[#d0c5af]">
              {cardIndex + 1} / {FLASHCARD_ITEMS.length}
            </span>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#99907c] font-mono mr-2">
              <kbd className="px-1.5 py-0.5 rounded bg-[#151b2b] text-[#f2ca50] border border-[#2e3545]">Espace</kbd> Retourner
              <kbd className="px-1.5 py-0.5 rounded bg-[#151b2b] text-[#f2ca50] border border-[#2e3545] ml-2">← →</kbd> Naviguer
            </span>

            <button
              type="button"
              onClick={toggleFocusMode}
              className="px-3 py-1.5 rounded-full bg-[#151f33]/90 hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#2c2000] border border-[#f2ca50]/40 text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md shadow-md active:scale-95"
              title="Quitter le Mode Focus Lecture (Échap ou F)"
            >
              <span className="material-symbols-outlined text-sm">fullscreen_exit</span>
              <span>Quitter Focus</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#151f33]/80 hover:bg-[#232a3a] text-[#d0c5af] hover:text-white flex items-center justify-center transition-all border border-white/10"
              title="Fermer la session"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </header>
      )}

      {/* 2. MAIN CARD STAGE */}
      <main
        className={`w-full mx-auto px-4 sm:px-6 transition-all duration-500 flex flex-col justify-center flex-1 ${
          isFocusMode ? 'max-w-2xl py-2 my-auto' : 'max-w-xl py-4 gap-4'
        }`}
      >
        {/* Progress tracker ribbon (Occulted in Focus Mode to remove distraction) */}
        {!isFocusMode && (
          <div className="p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 flex flex-col gap-2 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f2ca50] font-bold font-serif text-sm">
                Carte {cardIndex + 1}{' '}
                <span className="text-[#99907c] text-xs font-sans">
                  / {FLASHCARD_ITEMS.length}
                </span>
              </span>
              <span className="text-[#d4c78f] font-mono">
                Reste {FLASHCARD_ITEMS.length - (cardIndex + 1)} cartes
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#070e1d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f2ca50] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(242,202,80,0.5)]"
                style={{ width: `${((cardIndex + 1) / FLASHCARD_ITEMS.length) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div>
                <p className="text-[10px] text-[#99907c] uppercase">Rétention</p>
                <p className="font-bold text-[#f2ca50] font-mono">92%</p>
              </div>
              <div>
                <p className="text-[10px] text-[#99907c] uppercase">Maîtrisées</p>
                <p className="font-bold text-[#d4c78f] font-mono">10</p>
              </div>
              <div>
                <p className="text-[10px] text-[#99907c] uppercase">À Revoir</p>
                <p className="font-bold text-[#ffb4ab] font-mono">2</p>
              </div>
            </div>
          </div>
        )}

        {/* 3D Flippable Flashcard */}
        <div style={{ perspective: '1400px' }} className="w-full">
          <div
            onClick={handleFlip}
            className={`w-full rounded-2xl cursor-pointer transition-transform duration-700 relative shadow-2xl ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            } ${isFocusMode ? 'min-h-[460px] sm:min-h-[500px]' : 'min-h-[420px]'}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* RECTO (FRONT) */}
            <div
              className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-8 flex flex-col justify-between border overflow-hidden shadow-2xl transition-all duration-500 ${
                isFocusMode
                  ? 'bg-gradient-to-br from-[#0c1426] via-[#101930] to-[#0a101f] border-[#f2ca50]/60 ring-1 ring-[#f2ca50]/40 shadow-[0_20px_60px_rgba(242,202,80,0.18)]'
                  : 'bg-[#191f2f] border-[#f2ca50]/40'
              }`}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {/* Luminous Top Jewel Filament in Focus Mode */}
              {isFocusMode && (
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#f2ca50] via-yellow-200 to-transparent shadow-[0_0_14px_#f2ca50]" />
              )}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#f2ca50]/15 via-transparent to-transparent pointer-events-none" />

              {/* Card Meta Tag */}
              <div className="flex items-center justify-between relative z-10">
                <span className="px-3.5 py-1 rounded-full bg-[#1b263e]/85 border border-[#f2ca50]/30 text-[10px] uppercase font-bold tracking-wider text-[#ffe082]">
                  {card.level} &bull; {card.category}
                </span>
                <span className="text-[10px] text-[#f2ca50] uppercase font-mono font-bold tracking-wider">
                  Lexème Clé
                </span>
              </div>

              {/* Central Monumental Vocab Term */}
              <div className="my-auto text-center py-4 relative z-10">
                <p className="text-xs text-amber-200/90 uppercase tracking-[0.25em] font-semibold mb-2">
                  Terme Diplomatique & Rhétorique
                </p>

                <h2
                  className={`font-serif font-black text-[#f2ca50] tracking-tight drop-shadow-[0_4px_18px_rgba(242,202,80,0.3)] transition-all ${
                    isFocusMode ? 'text-5xl sm:text-6xl my-2' : 'text-4xl sm:text-5xl'
                  }`}
                >
                  « {card.term} »
                </h2>

                <div className="flex items-center justify-center gap-3 my-4">
                  <span className="text-base text-[#dce2f8] font-mono italic tracking-wide">
                    {card.phonetic}
                  </span>
                  <button
                    type="button"
                    onClick={playPronunciation}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f2ca50] to-[#d4af37] text-[#2c2000] flex items-center justify-center transition-transform active:scale-90 shadow-md hover:brightness-110"
                    title="Écouter la prononciation académique (Oxford RP)"
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isPlayingAudio ? 'animate-pulse' : ''
                      }`}
                    >
                      {isPlayingAudio ? 'graphic_eq' : 'volume_up'}
                    </span>
                  </button>
                </div>

                <div
                  className={`mt-4 px-4 py-3 rounded-xl border max-w-sm mx-auto transition-colors ${
                    isFocusMode
                      ? 'bg-[#080e1c]/80 border-[#f2ca50]/40'
                      : 'bg-[#070e1d]/70 border-[#4d4635]/30'
                  }`}
                >
                  <p className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                    Sphère d’emploi & Registre
                  </p>
                  <p className="text-xs text-[#dce2f8] font-medium mt-1 leading-relaxed">
                    Négociation de Traités, Droit International & Haute Éloquence
                  </p>
                </div>
              </div>

              {/* Card Footer prompt */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#ffe082] pt-3 relative z-10 border-t border-[#232a3a]">
                <span className="material-symbols-outlined text-sm text-[#f2ca50]">flip</span>
                <span className="uppercase tracking-wider font-medium">
                  {isFocusMode
                    ? 'Toucher la carte ou appuyer sur [Espace] pour retourner ↻'
                    : 'Toucher pour révéler la déconstruction sémantique ↻'}
                </span>
              </div>
            </div>

            {/* VERSO (BACK) */}
            <div
              className={`w-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between border overflow-y-auto shadow-2xl [transform:rotateY(180deg)] transition-all duration-500 ${
                isFocusMode
                  ? 'min-h-[460px] sm:min-h-[500px] bg-gradient-to-br from-[#0c1426] via-[#101930] to-[#0a101f] border-[#f2ca50]/60 ring-1 ring-[#f2ca50]/40'
                  : 'min-h-[420px] bg-[#191f2f] border-[#f2ca50]/40'
              }`}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="space-y-3.5 flex-1 text-xs">
                {/* French & English Definition */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    isFocusMode
                      ? 'bg-[#070d1a]/95 border-[#f2ca50]/40'
                      : 'bg-[#070e1d]/90 border-[#4d4635]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                      Traduction & Finesse Sémantique
                    </span>
                    <span className="text-[10px] text-[#ffe082] font-mono font-bold">
                      {card.level}
                    </span>
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-[#ffffff] leading-snug">
                    « {card.frenchDef} »
                  </p>
                  <p className="text-xs text-[#dce2f8]/90 mt-1.5 leading-relaxed">
                    <strong className="text-[#f2ca50]">Def (EN):</strong> {card.englishDef}
                  </p>
                </div>

                {/* Etymology */}
                <div className="p-3.5 rounded-xl bg-[#152038]/70 border border-[#f2ca50]/30 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg mt-0.5 shrink-0">
                    history_edu
                  </span>
                  <div>
                    <p className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                      Étymologie Philologique
                    </p>
                    <p className="text-xs text-[#dce2f8] mt-0.5 leading-relaxed">
                      {card.etymology}
                    </p>
                  </div>
                </div>

                {/* Press Excerpt */}
                <div className="p-3.5 rounded-xl bg-[#070d1a]/85 border border-[#4d4635]/40">
                  <div className="flex items-center justify-between text-[10px] mb-1.5 text-[#d0c5af]">
                    <span className="uppercase font-bold text-[#f2ca50]">Extrait de Presse</span>
                    <span className="italic font-mono text-amber-200">{card.pressSource}</span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-[#fff8e7] leading-relaxed">
                    {card.pressExcerpt}
                  </p>
                </div>

                {/* Collocations */}
                <div className="p-3 rounded-xl bg-[#152038]/50 border border-[#4d4635]/30">
                  <p className="text-[10px] text-[#f2ca50] uppercase font-bold mb-1.5">
                    Collocations Diplomatiques
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.collocations.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#0a1120] text-xs text-[#dce2f8] border border-[#f2ca50]/25"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nuance comparisons */}
                <div className="p-3 rounded-xl bg-[#070d1a]/70 border border-[#4d4635]/30 space-y-1">
                  <p className="text-[10px] text-[#f2ca50] uppercase font-bold">
                    Distinction de Nuances
                  </p>
                  {card.nuanceComparisons.map((n, i) => (
                    <p key={i} className="text-[11px] text-[#d0c5af]">
                      <strong className="text-white">{n.word} :</strong> {n.distinction}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-1.5 text-xs text-[#ffe082] border-t border-[#232a3a]">
                <span className="material-symbols-outlined text-sm text-[#f2ca50]">replay</span>
                <span className="uppercase tracking-wider font-medium">
                  {isFocusMode
                    ? 'Toucher la carte ou appuyer sur [Espace] pour revenir au recto'
                    : 'Toucher pour revenir au recto'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CONTROLS BAR: Standard vs Focus Mode */}
        {!isFocusMode ? (
          /* Standard Bottom Controls & Full SM-2 Block */
          <div className="flex flex-col gap-3">
            {/* Flip button & bookmark */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handleFlip}
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-xs font-semibold text-[#dce2f8] border border-[#4d4635]/30 active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-base text-[#f2ca50]">flip</span>
                <span>Retourner la carte</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    showToast(isBookmarked ? 'Retiré des favoris' : 'Ajouté au recueil diplomatique');
                  }}
                  className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50]"
                  title="Ajouter aux favoris"
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    bookmark
                  </span>
                </button>
              </div>
            </div>

            {/* SM-2 Spaced Repetition 4 Buttons */}
            <div className="p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
                  Auto-évaluation &bull; Répétition Espacée SM-2
                </span>
                <span className="text-[#f2ca50] font-mono">Prochain palier</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Revoir */}
                <button
                  type="button"
                  onClick={() => handleSM2Rating('again')}
                  className="p-3 rounded-xl bg-[#93000a]/20 hover:bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] active:scale-95 transition-all flex flex-col items-center justify-center"
                >
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    <span>Revoir</span>
                  </div>
                  <span className="text-[10px] opacity-80">&lt; 10 minutes</span>
                </button>

                {/* Difficile */}
                <button
                  type="button"
                  onClick={() => handleSM2Rating('hard')}
                  className="p-3 rounded-xl bg-[#4f471b]/30 hover:bg-[#4f471b]/60 border border-[#d4c78f]/30 text-[#d4c78f] active:scale-95 transition-all flex flex-col items-center justify-center"
                >
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <span className="material-symbols-outlined text-base">sentiment_neutral</span>
                    <span>Difficile</span>
                  </div>
                  <span className="text-[10px] opacity-80">1 jour</span>
                </button>

                {/* Bon */}
                <button
                  type="button"
                  onClick={() => handleSM2Rating('good')}
                  className="p-3 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-[#4d4635]/40 text-[#dce2f8] active:scale-95 transition-all flex flex-col items-center justify-center"
                >
                  <div className="flex items-center gap-1 text-sm font-bold text-[#f2ca50]">
                    <span className="material-symbols-outlined text-base">sentiment_satisfied</span>
                    <span>Bon</span>
                  </div>
                  <span className="text-[10px] text-[#99907c]">3 jours</span>
                </button>

                {/* Parfait */}
                <button
                  type="button"
                  onClick={() => handleSM2Rating('easy')}
                  className="p-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg shadow-[#f2ca50]/20"
                >
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      stars
                    </span>
                    <span>Parfait</span>
                  </div>
                  <span className="text-[10px] opacity-90">7 jours</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Focus Mode: Streamlined, Quiet Bottom Bar (No intrusive boxes) */
          <div className="flex flex-col gap-2.5 pt-2">
            {/* Minimalist Navigation & Flip Pills */}
            <div className="flex items-center justify-between gap-3 px-2">
              <button
                type="button"
                onClick={handlePrevCard}
                className="px-3.5 py-1.5 rounded-full bg-[#121a2d]/80 hover:bg-[#1a2742] text-[#dce2f8] border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                title="Carte précédente (←)"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span className="hidden sm:inline">Précédente</span>
              </button>

              {/* Flip action button */}
              <button
                type="button"
                onClick={handleFlip}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,202,80,0.35)] hover:brightness-110 active:scale-95 transition-all"
                title="Retourner la carte (Espace)"
              >
                <span className="material-symbols-outlined text-base">flip</span>
                <span>{isFlipped ? 'Voir le Recto' : 'Déconstruire le Mot'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextCard}
                className="px-3.5 py-1.5 rounded-full bg-[#121a2d]/80 hover:bg-[#1a2742] text-[#dce2f8] border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                title="Carte suivante (→)"
              >
                <span className="hidden sm:inline">Suivante</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            {/* In Focus Mode: When looking at the back of card, show discrete evaluation chips */}
            {isFlipped && (
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap animate-fadeIn">
                <span className="text-[10px] text-[#99907c] font-mono mr-1">Rappel SM-2 :</span>
                <button
                  type="button"
                  onClick={() => handleSM2Rating('again')}
                  className="px-2.5 py-1 rounded-lg bg-[#93000a]/25 hover:bg-[#93000a]/50 text-[#ffb4ab] border border-[#ffb4ab]/30 text-[11px] font-semibold active:scale-95 transition-all"
                >
                  Revoir (&lt;10m)
                </button>
                <button
                  type="button"
                  onClick={() => handleSM2Rating('hard')}
                  className="px-2.5 py-1 rounded-lg bg-[#4f471b]/40 hover:bg-[#4f471b]/70 text-[#d4c78f] border border-[#d4c78f]/40 text-[11px] font-semibold active:scale-95 transition-all"
                >
                  Difficile (1j)
                </button>
                <button
                  type="button"
                  onClick={() => handleSM2Rating('good')}
                  className="px-2.5 py-1 rounded-lg bg-[#1a253d] hover:bg-[#253658] text-[#dce2f8] border border-white/15 text-[11px] font-semibold active:scale-95 transition-all"
                >
                  Bon (3j)
                </button>
                <button
                  type="button"
                  onClick={() => handleSM2Rating('easy')}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] font-bold text-[11px] active:scale-95 transition-all shadow-sm"
                >
                  Parfait (7j)
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#152342]/95 border border-[#f2ca50]/60 text-[#ffe082] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            <span
              className="material-symbols-outlined text-base text-[#f2ca50]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
