import React, { useState } from 'react';
import { FLASHCARD_ITEMS, type FlashcardItem } from '../data/curriculum';
import { saveFlashcardProgress } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import confetti from 'canvas-confetti';

interface FlashcardsModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onCardReviewed?: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  currentLevel,
  onClose,
  onCardReviewed
}) => {
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const card: FlashcardItem = FLASHCARD_ITEMS[cardIndex] || FLASHCARD_ITEMS[0];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const playPronunciation = (e?: React.MouseEvent) => {
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
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

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

    // Save progress to Firestore / Local
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 bg-[#0c1322]/90 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] transition-colors"
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#d0c5af] font-mono">
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

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-4">
        {/* Progress tracker ribbon */}
        <div className="p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#f2ca50] font-bold font-serif text-sm">
              Carte {cardIndex + 1} <span className="text-[#99907c] text-xs font-sans">/ {FLASHCARD_ITEMS.length}</span>
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

        {/* 3D Flippable Flashcard */}
        <div style={{ perspective: '1200px' }} className="w-full">
          <div
            onClick={handleFlip}
            className={`w-full min-h-[420px] rounded-2xl cursor-pointer transition-transform duration-700 relative shadow-2xl ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* RECTO (FRONT) */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl bg-[#191f2f] p-6 flex flex-col justify-between border border-[#f2ca50]/40 overflow-hidden shadow-2xl"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2ca50]/10 via-transparent to-transparent pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="px-3 py-1 rounded-full bg-[#232a3a] border border-[#f2ca50]/20 text-[10px] uppercase font-bold tracking-wider text-[#d4c78f]">
                  {card.level} • {card.category}
                </span>
                <span className="text-[10px] text-[#99907c] uppercase font-mono">
                  Vocabulaire Majeur
                </span>
              </div>

              <div className="my-auto text-center py-4 relative z-10">
                <p className="text-xs text-[#d4c78f] uppercase tracking-widest font-semibold mb-2">
                  Terme Diplomatique
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl font-black text-[#f2ca50] tracking-tight drop-shadow-[0_2px_12px_rgba(242,202,80,0.25)]">
                  « {card.term} »
                </h2>

                <div className="flex items-center justify-center gap-3 my-3">
                  <span className="text-sm text-[#d0c5af] font-mono italic">{card.phonetic}</span>
                  <button
                    type="button"
                    onClick={playPronunciation}
                    className="w-9 h-9 rounded-full bg-[#232a3a] hover:bg-[#f2ca50]/20 text-[#f2ca50] flex items-center justify-center transition-transform active:scale-90 border border-[#f2ca50]/30 shadow-md"
                  >
                    <span className={`material-symbols-outlined text-lg ${isPlayingAudio ? 'animate-pulse' : ''}`}>
                      {isPlayingAudio ? 'graphic_eq' : 'volume_up'}
                    </span>
                  </button>
                </div>

                <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#070e1d]/70 border border-[#4d4635]/30 max-w-xs mx-auto">
                  <p className="text-[10px] text-[#99907c] uppercase font-bold tracking-wider">
                    Sphère d’emploi
                  </p>
                  <p className="text-xs text-[#dce2f8] font-medium mt-0.5">
                    Registre Diplomatique, Négociation de Traités & Droit International
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[#d4c78f] pt-2 relative z-10 border-t border-[#232a3a]">
                <span className="material-symbols-outlined text-sm text-[#f2ca50]">flip</span>
                <span className="uppercase tracking-wider">Toucher pour révéler la déconstruction ↻</span>
              </div>
            </div>

            {/* VERSO (BACK) */}
            <div
              className="w-full min-h-[420px] rounded-2xl bg-[#191f2f] p-5 flex flex-col justify-between border border-[#f2ca50]/40 overflow-y-auto shadow-2xl [transform:rotateY(180deg)]"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="space-y-3 flex-1 text-xs">
                {/* French & English Definition */}
                <div className="p-3 rounded-xl bg-[#070e1d]/90 border border-[#4d4635]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                      Traduction & Finesse Sémantique
                    </span>
                    <span className="text-[10px] text-[#d4c78f] italic font-mono">{card.level}</span>
                  </div>
                  <p className="font-semibold text-sm text-[#dce2f8] leading-snug">
                    « {card.frenchDef} »
                  </p>
                  <p className="text-xs text-[#d0c5af]/80 mt-1 leading-relaxed">
                    <strong className="text-[#d4c78f]">Def (EN):</strong> {card.englishDef}
                  </p>
                </div>

                {/* Etymology */}
                <div className="p-3 rounded-xl bg-[#232a3a]/60 border border-[#4d4635]/30 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#d4c78f] text-base mt-0.5 shrink-0">
                    history_edu
                  </span>
                  <div>
                    <p className="text-[10px] text-[#d4c78f] uppercase font-bold">
                      Étymologie Philologique
                    </p>
                    <p className="text-xs text-[#d0c5af] mt-0.5 leading-relaxed">{card.etymology}</p>
                  </div>
                </div>

                {/* Press Excerpt */}
                <div className="p-3 rounded-xl bg-[#070e1d]/80 border border-[#4d4635]/30">
                  <div className="flex items-center justify-between text-[10px] mb-1 text-[#99907c]">
                    <span className="uppercase font-bold text-[#d4c78f]">Extrait de Presse</span>
                    <span className="italic">{card.pressSource}</span>
                  </div>
                  <p className="font-serif italic text-xs text-[#dce2f8] leading-relaxed">
                    {card.pressExcerpt}
                  </p>
                </div>

                {/* Collocations */}
                <div className="p-3 rounded-xl bg-[#232a3a]/40 border border-[#4d4635]/30">
                  <p className="text-[10px] text-[#d4c78f] uppercase font-bold mb-1.5">
                    Collocations Majeures
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.collocations.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#191f2f] text-xs text-[#dce2f8] border border-[#4d4635]/30">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nuance comparisons */}
                <div className="p-3 rounded-xl bg-[#070e1d]/70 border border-[#4d4635]/30 space-y-1">
                  <p className="text-[10px] text-[#f2ca50] uppercase font-bold">
                    Distinction de Nuances
                  </p>
                  {card.nuanceComparisons.map((n, i) => (
                    <p key={i} className="text-[11px] text-[#d0c5af]">
                      <strong className="text-[#dce2f8]">{n.word} :</strong> {n.distinction}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-1.5 text-xs text-[#d4c78f] border-t border-[#232a3a]">
                <span className="material-symbols-outlined text-sm text-[#f2ca50]">replay</span>
                <span className="uppercase tracking-wider">Toucher pour revenir au recto</span>
              </div>
            </div>
          </div>
        </div>

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
              Auto-évaluation • Répétition Espacée SM-2
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
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stars
                </span>
                <span>Parfait</span>
              </div>
              <span className="text-[10px] opacity-90">7 jours</span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#2e3545]/95 border border-[#f2ca50]/50 text-[#f2ca50] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
