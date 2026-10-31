import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FLASHCARD_ITEMS, type FlashcardItem } from '../data/curriculum';
import { THEMES_500, GRADES_500 } from '../data/spacedRepetition500';
import { saveFlashcardProgress } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import confetti from 'canvas-confetti';
import { DualSpeakerButton } from './DualSpeakerButton';
import {
  triggerAutoPlayIfEnabled,
  getAutoPlayOnDisplay,
  setAutoPlayOnDisplay,
  peekNextAlternatingAccent,
  speakText
} from '../services/speechService';
import { getWordLinguisticDetails } from '../utils/flashcardDetailsHelper';

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
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('eb_bookmarked_cards');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [isFocusMode, setIsFocusMode] = useState<boolean>(initialFocusMode);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(getAutoPlayOnDisplay());
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);
  const [showJumper, setShowJumper] = useState<boolean>(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);

  // Touch gesture & scrolling tracking to prevent accidental flips when reading or scrolling
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isScrollingOrDraggingRef = useRef<boolean>(false);
  const versoScrollRef = useRef<HTMLDivElement>(null);

  // Filter 500 cards dynamically
  const filteredCards = useMemo(() => {
    let list = FLASHCARD_ITEMS.filter((item) => {
      if (selectedGrade !== 'all' && item.gradeLevel !== selectedGrade) {
        return false;
      }
      if (selectedTheme !== 'all' && item.theme !== selectedTheme) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTerm = item.term.toLowerCase().includes(q);
        const matchFr = item.frenchDef.toLowerCase().includes(q);
        const matchEn = item.englishDef.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchEtym = item.etymology.toLowerCase().includes(q);
        return matchTerm || matchFr || matchEn || matchCat || matchEtym;
      }
      return true;
    });

    if (shuffledOrder && shuffledOrder.length === list.length) {
      return shuffledOrder.map((idx) => list[idx] || list[0]);
    }

    return list;
  }, [selectedGrade, selectedTheme, searchQuery, shuffledOrder]);

  // Keep cardIndex valid
  const safeIndex = filteredCards.length > 0 ? Math.min(cardIndex, filteredCards.length - 1) : 0;
  const card: FlashcardItem | undefined = filteredCards[safeIndex] || FLASHCARD_ITEMS[0];

  // Derive detailed pedagogical linguistics for current card
  const linguisticDetails = useMemo(() => {
    if (!card) return null;
    return getWordLinguisticDetails(
      card.term,
      card.frenchDef,
      card.category,
      card.gradeLevel,
      card.etymology
    );
  }, [card]);

  const handleShuffle = () => {
    if (filteredCards.length <= 1) return;
    const indices = Array.from({ length: filteredCards.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setCardIndex(0);
    setIsFlipped(false);
    showToast('Deck mélangé aléatoirement 🔀');
  };

  const resetFilters = () => {
    setSelectedGrade('all');
    setSelectedTheme('all');
    setSearchQuery('');
    setShuffledOrder(null);
    setCardIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    if (versoScrollRef.current) {
      versoScrollRef.current.scrollTop = 0;
    }
    setCardIndex((prev) => (filteredCards.length > 0 ? (prev < filteredCards.length - 1 ? prev + 1 : 0) : 0));
  }, [filteredCards.length]);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    if (versoScrollRef.current) {
      versoScrollRef.current.scrollTop = 0;
    }
    setCardIndex((prev) => (filteredCards.length > 0 ? (prev > 0 ? prev - 1 : filteredCards.length - 1) : 0));
  }, [filteredCards.length]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const toggleBookmark = (cardId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
        showToast('Retiré des favoris');
      } else {
        next.add(cardId);
        showToast('Ajouté aux favoris du recueil');
      }
      try {
        localStorage.setItem('eb_bookmarked_cards', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Mode Focus activé • Éléments superflus occultés'
          : 'Mode Standard restauré'
      );
      return next;
    });
  }, [showToast]);

  // Handle touch events on the card container: smooth swipe left/right and non-conflicting scroll
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

    // Detect intentional horizontal swipe gesture (left or right)
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4 && deltaTime < 450) {
      if (deltaX < 0) {
        handleNextCard();
      } else {
        handlePrevCard();
      }
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = null;
  };

  // Safe flip click handler: Only flip if the user tapped without scrolling/dragging
  const handleCardClick = (e: React.MouseEvent) => {
    if (isScrollingOrDraggingRef.current) {
      isScrollingOrDraggingRef.current = false;
      return;
    }
    handleFlip();
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleShuffle();
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

  // Auto-play audio when card changes
  useEffect(() => {
    if (card?.term) {
      triggerAutoPlayIfEnabled(card.term, `fc-modal-${card.id}`, 350);
    }
  }, [cardIndex, card?.term, card?.id]);

  const handleSM2Rating = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (!card) return;
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

    // Advance smoothly
    setTimeout(() => {
      setIsFlipped(false);
      if (versoScrollRef.current) {
        versoScrollRef.current.scrollTop = 0;
      }
      if (filteredCards.length > 0 && safeIndex < filteredCards.length - 1) {
        setCardIndex((prev) => prev + 1);
      } else {
        setCardIndex(0);
      }
    }, 450);
  };

  const handleSpeakCollocation = (collocText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(collocText, 'en-GB', `colloc-${collocText}`, { rate: 0.95 });
    showToast(`Écoute 🇬🇧 : « ${collocText} »`);
  };

  const isCurrentBookmarked = card ? bookmarkedIds.has(card.id) : false;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col pt-safe pb-safe select-none transition-colors duration-500 ${
        isFocusMode ? 'bg-[#050913]' : 'bg-[#0c1322]'
      }`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 ${
          isFocusMode
            ? 'w-[750px] h-[550px] bg-gradient-to-tr from-amber-400/10 via-[#f2ca50]/15 to-transparent blur-3xl'
            : 'w-96 h-96 bg-[#f2ca50]/10 blur-3xl'
        }`}
      />

      {/* 1. TOP HEADER: Standard vs Focus Mode */}
      {!isFocusMode ? (
        <header className="sticky top-0 z-30 px-3 sm:px-6 py-2.5 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#232a3a] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#191f2f] transition-colors"
                title="Retour au sanctuaire"
              >
                <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8] leading-tight">
                    Spaced Repetition
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30 text-[10px] font-mono font-bold">
                    500 MOTS
                  </span>
                </div>
                <span className="text-[10px] text-[#d4c78f] font-mono hidden sm:inline">
                  6e &bull; 5e &bull; 4e &bull; 3e &bull; 2nde &bull; 1re &bull; Terminale &bull; 10 Thématiques
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Direct Card Jumper toggle */}
              <button
                type="button"
                onClick={() => setShowJumper(!showJumper)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1 transition-all ${
                  showJumper
                    ? 'border-[#f2ca50]/60 bg-[#1e2538] text-[#f2ca50]'
                    : 'border-[#2e3b55] bg-[#121824] text-[#8391ac] hover:text-[#dce2f8]'
                }`}
                title="Accès direct par numéro de carte (1 à 500)"
              >
                <span className="material-symbols-outlined text-sm">tag</span>
                <span className="hidden md:inline">Aller à</span>
              </button>

              {/* Toggle filters bar button */}
              <button
                type="button"
                onClick={() => setShowFilterBar(!showFilterBar)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1 transition-all ${
                  showFilterBar
                    ? 'border-[#f2ca50]/40 bg-[#1e2538] text-[#f2ca50]'
                    : 'border-[#2e3b55] bg-[#121824] text-[#8391ac] hover:text-[#dce2f8]'
                }`}
                title="Afficher/masquer les filtres"
              >
                <span className="material-symbols-outlined text-sm">filter_alt</span>
                <span className="hidden sm:inline">Filtres</span>
              </button>

              {/* Shuffle button */}
              <button
                type="button"
                onClick={handleShuffle}
                className="px-2.5 py-1.5 rounded-xl border border-[#2e3b55] bg-[#121824] hover:border-[#f2ca50]/40 text-[#8391ac] hover:text-[#f2ca50] text-xs font-mono font-medium flex items-center gap-1 transition-all active:scale-95"
                title="Mélanger aléatoirement le deck (M)"
              >
                <span className="material-symbols-outlined text-sm">shuffle</span>
                <span className="hidden md:inline">Mélanger</span>
              </button>

              {/* Auto Play Alternating Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAutoPlay;
                  setIsAutoPlay(next);
                  setAutoPlayOnDisplay(next);
                  showToast(
                    next
                      ? 'Lecture auto alternée activée (🇬🇧⇄🇺🇸)'
                      : 'Lecture auto désactivée'
                  );
                  if (next && card?.term) {
                    triggerAutoPlayIfEnabled(card.term, `fc-modal-${card.id}`, 100);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1 transition-all active:scale-95 shadow-sm ${
                  isAutoPlay
                    ? 'border-[#f2ca50]/60 bg-[#1e2538] text-[#f2ca50] shadow-[0_0_10px_rgba(242,202,80,0.2)]'
                    : 'border-[#2e3b55] bg-[#121824] text-[#8391ac] hover:text-[#dce2f8]'
                }`}
                title="Lecture auto alternée 50/50 🇬🇧 UK & 🇺🇸 US"
              >
                <span className="material-symbols-outlined text-sm">
                  {isAutoPlay ? 'autoplay' : 'motion_photos_off'}
                </span>
                <span className="hidden sm:inline">Auto 🇬🇧⇄🇺🇸</span>
              </button>

              {/* Focus mode button */}
              <button
                type="button"
                onClick={toggleFocusMode}
                className="px-2.5 py-1.5 rounded-xl border border-[#2e3b55] bg-[#121824] hover:border-[#f2ca50]/40 text-[#8391ac] hover:text-[#f2ca50] text-xs font-mono font-medium flex items-center gap-1 transition-all"
                title="Passer en mode Focus lecture (Touche F)"
              >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
                <span className="hidden md:inline">Focus</span>
              </button>

              {/* Close modal */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#8391ac] hover:text-white hover:bg-[#191f2f] transition-colors"
                title="Fermer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Quick Direct Card Jumper Slider */}
          {showJumper && filteredCards.length > 0 && (
            <div className="py-2 px-3 rounded-xl bg-[#121824] border border-[#f2ca50]/30 flex items-center gap-3 animate-fadeIn">
              <span className="text-[11px] font-mono text-[#f2ca50] whitespace-nowrap">
                Carte {safeIndex + 1} / {filteredCards.length}
              </span>
              <input
                type="range"
                min={0}
                max={filteredCards.length - 1}
                value={safeIndex}
                onChange={(e) => {
                  setCardIndex(Number(e.target.value));
                  setIsFlipped(false);
                }}
                className="w-full accent-[#f2ca50] cursor-pointer"
              />
              <span className="text-[10px] text-[#8391ac] font-mono whitespace-nowrap">
                Glisser pour naviguer
              </span>
            </div>
          )}

          {/* Collapsible Filter Bar: School Grades + Themes + Search */}
          {showFilterBar && (
            <div className="flex flex-col gap-2 pt-1 border-t border-[#1e2538] animate-fadeIn">
              {/* Row 1: School Grade Levels Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                <span className="text-[10px] font-mono uppercase text-[#99907c] shrink-0 mr-1 font-bold">
                  Niveau :
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGrade('all');
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    selectedGrade === 'all'
                      ? 'bg-[#f2ca50] text-[#0c1322] font-bold shadow-sm'
                      : 'bg-[#151b2b] text-[#8391ac] hover:text-[#dce2f8] border border-[#232a3a]'
                  }`}
                >
                  Tous (500)
                </button>
                {GRADES_500.filter((g) => g.id !== 'all').map((g) => {
                  const count = FLASHCARD_ITEMS.filter((i) => i.gradeLevel === g.id).length;
                  const isActive = selectedGrade === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setSelectedGrade(g.id);
                        setCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#f2ca50] text-[#0c1322] font-bold shadow-sm'
                          : 'bg-[#151b2b] text-[#8391ac] hover:text-[#dce2f8] border border-[#232a3a]'
                      }`}
                    >
                      <span>{g.short}</span>
                      <span className={`text-[10px] ${isActive ? 'text-[#0c1322]/80' : 'text-[#f2ca50]/70'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Themes & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                {/* Themes Horizontal Scroll */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar flex-1">
                  <span className="text-[10px] font-mono uppercase text-[#99907c] shrink-0 mr-1 font-bold">
                    Thème :
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheme('all');
                      setCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono whitespace-nowrap transition-all ${
                      selectedTheme === 'all'
                        ? 'bg-[#ffe082] text-[#0c1322] font-bold'
                        : 'bg-[#121824] text-[#8391ac] hover:text-[#dce2f8] border border-[#232a3a]'
                    }`}
                  >
                    Tous les thèmes
                  </button>
                  {THEMES_500.filter((t) => t.id !== 'all').map((t) => {
                    const isActive = selectedTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(t.id);
                          setCardIndex(0);
                          setIsFlipped(false);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1 ${
                          isActive
                            ? 'bg-[#ffe082] text-[#0c1322] font-bold'
                            : 'bg-[#121824] text-[#8391ac] hover:text-[#dce2f8] border border-[#232a3a]'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Real-Time Search */}
                <div className="relative shrink-0 sm:w-56">
                  <span className="material-symbols-outlined text-sm text-[#8391ac] absolute left-2.5 top-1/2 -translate-y-1/2">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCardIndex(0);
                    }}
                    placeholder="Chercher mot, sens, racine..."
                    className="w-full pl-8 pr-7 py-1 rounded-lg bg-[#121824] border border-[#2e3b55] text-xs text-[#dce2f8] placeholder-[#576482] focus:outline-none focus:border-[#f2ca50]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8391ac] hover:text-white"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>
      ) : (
        /* Focus Mode Minimal Top Bar */
        <header className="sticky top-0 z-30 px-4 py-2 bg-[#050913]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#f2ca50]">
              Mode Focus &bull; Carte {safeIndex + 1}/{filteredCards.length}
            </span>
            {card?.gradeLabel && (
              <span className="text-[10px] text-[#ffe082] font-mono hidden sm:inline">
                ({card.gradeLabel})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#99907c] font-mono mr-2">
              <kbd className="px-1.5 py-0.5 rounded bg-[#151b2b] text-[#f2ca50] border border-[#2e3545]">Espace</kbd> Retourner
              <kbd className="px-1.5 py-0.5 rounded bg-[#151b2b] text-[#f2ca50] border border-[#2e3545] ml-2">← →</kbd> Naviguer
            </span>

            <button
              type="button"
              onClick={toggleFocusMode}
              className="px-3 py-1.5 rounded-full bg-[#151f33]/90 hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#2c2000] border border-[#f2ca50]/40 text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md shadow-md active:scale-95"
              title="Quitter le Mode Focus (Échap ou F)"
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
        className={`w-full mx-auto px-3 sm:px-6 transition-all duration-300 flex flex-col justify-center flex-1 ${
          isFocusMode ? 'max-w-2xl py-2 my-auto' : 'max-w-2xl py-2 sm:py-3 gap-2.5 sm:gap-3'
        }`}
      >
        {filteredCards.length === 0 ? (
          /* Empty state when search/filter has no match */
          <div className="p-8 rounded-2xl bg-[#151b2b] border border-[#2e3b55] text-center flex flex-col items-center gap-4 my-auto">
            <span className="material-symbols-outlined text-5xl text-[#f2ca50]">search_off</span>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#dce2f8]">Aucune carte ne correspond au filtre</h3>
              <p className="text-xs text-[#8391ac] max-w-md">
                Essayez d’élargir vos filtres de niveau scolaire ou de réinitialiser la recherche textuelle.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#f2ca50] text-[#0c1322] font-bold text-xs hover:bg-[#ffe088] transition-all"
            >
              Réinitialiser tous les filtres (500 mots)
            </button>
          </div>
        ) : (
          <>
            {/* Progress tracker ribbon */}
            {!isFocusMode && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 flex flex-col gap-2 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#f2ca50] font-bold font-serif text-sm flex items-center gap-2">
                    <span>Carte {safeIndex + 1}</span>
                    <span className="text-[#99907c] text-xs font-sans">
                      / {filteredCards.length}
                    </span>
                    {card?.gradeLabel && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e2538] text-[#ffe082] font-mono border border-[#ffe082]/20">
                        {card.gradeLabel}
                      </span>
                    )}
                  </span>
                  <span className="text-[#d4c78f] font-mono text-[11px]">
                    Reste {filteredCards.length - (safeIndex + 1)} cartes
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#070e1d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e6b82e] to-[#f2ca50] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(242,202,80,0.5)]"
                    style={{ width: `${((safeIndex + 1) / filteredCards.length) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#99907c] flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#f2ca50] font-bold">{card?.themeLabel || 'Général'}</span>
                    <span>&bull;</span>
                    <span className="italic">{card?.category}</span>
                  </span>
                  <span className="font-mono text-[#ffe082] text-[10px] sm:text-[11px]">
                    Glisser ↔ ou toucher pour retourner
                  </span>
                </div>
              </div>
            )}

            {/* 3D Flippable Flashcard with hardware-accelerated fluid transforms */}
            {card && (
              <div
                style={{ perspective: '1600px' }}
                className="w-full touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className={`w-full rounded-2xl relative shadow-2xl transition-transform duration-500 ease-out ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  } ${isFocusMode ? 'min-h-[480px] sm:min-h-[530px]' : 'min-h-[450px] sm:min-h-[490px]'}`}
                  style={{ transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d' }}
                >
                  {/* ========================================================
                      RECTO (FRONT) FACE
                      ======================================================== */}
                  <div
                    onClick={handleCardClick}
                    className={`absolute inset-0 w-full h-full rounded-2xl p-5 sm:p-7 flex flex-col justify-between border overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer ${
                      isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100 z-10'
                    } ${
                      isFocusMode
                        ? 'bg-gradient-to-br from-[#0c1426] via-[#101930] to-[#0a101f] border-[#f2ca50]/60 ring-1 ring-[#f2ca50]/40 shadow-[0_20px_60px_rgba(242,202,80,0.18)]'
                        : 'bg-[#191f2f] border-[#f2ca50]/40 hover:border-[#f2ca50]/70'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translate3d(0,0,0)'
                    }}
                  >
                    {/* Glowing Filament & Ambient Aura */}
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#f2ca50] via-yellow-200 to-transparent shadow-[0_0_14px_#f2ca50]" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#f2ca50]/15 via-transparent to-transparent pointer-events-none" />

                    {/* Top Meta Badges: Grade + Part of Speech + Theme */}
                    <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-[#1b263e]/90 border border-[#f2ca50]/40 text-[10px] uppercase font-bold tracking-wider text-[#ffe082]">
                          {card.gradeLabel || card.gradeLevel || 'Niveau'} &bull; {card.level}
                        </span>
                        {linguisticDetails?.partOfSpeech && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${linguisticDetails.partOfSpeech.color}`}
                            title={linguisticDetails.partOfSpeech.description}
                          >
                            {linguisticDetails.partOfSpeech.label} [{linguisticDetails.partOfSpeech.code}]
                          </span>
                        )}
                        {card.themeLabel && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#121c2e] border border-[#2e3b55] text-[10px] font-medium text-[#dce2f8]">
                            {card.themeLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#f2ca50] uppercase font-mono font-bold tracking-wider">
                        Recto &bull; Prononciation
                      </span>
                    </div>

                    {/* Central Monumental Vocab Term & Syllables */}
                    <div className="my-auto text-center py-3 relative z-10">
                      <p className="text-xs text-amber-200/90 uppercase tracking-[0.2em] font-semibold mb-1">
                        {card.category}
                      </p>

                      <h2
                        className={`font-serif font-black text-[#f2ca50] tracking-tight drop-shadow-[0_4px_18px_rgba(242,202,80,0.3)] transition-all ${
                          isFocusMode ? 'text-4xl sm:text-6xl my-2' : 'text-3xl sm:text-5xl my-1'
                        }`}
                      >
                        « {card.term} »
                      </h2>

                      {/* Syllable Breakdown */}
                      {linguisticDetails?.syllables && (
                        <p className="text-[11px] font-mono text-amber-300/80 tracking-widest my-1">
                          Syllabes : <span className="font-bold underline decoration-amber-400/50">{linguisticDetails.syllables}</span>
                        </p>
                      )}

                      {/* Prononciations UK 🇬🇧 & US 🇺🇸 avec Audio direct */}
                      <div className="flex items-center justify-center gap-3 my-3 sm:my-4 flex-wrap">
                        <span className="text-sm sm:text-base text-[#dce2f8] font-mono italic tracking-wide">
                          {card.phonetic}
                        </span>
                        <DualSpeakerButton
                          text={card.term}
                          id={`fc-modal-${card.id}`}
                          phonetic={card.phonetic}
                          explanation={card.frenchDef}
                          variant="pill"
                        />
                      </div>

                      {/* Register & Pedagogical Scope */}
                      {linguisticDetails?.register && (
                        <div
                          className={`mt-3 px-4 py-2.5 rounded-xl border max-w-md mx-auto transition-colors ${
                            isFocusMode
                              ? 'bg-[#080e1c]/80 border-[#f2ca50]/40'
                              : 'bg-[#070e1d]/70 border-[#4d4635]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5">
                            <span className="text-[#f2ca50]">Sphère & Niveau d’Emploi</span>
                            <span className="font-mono text-[#ffe082]">{linguisticDetails.register.label}</span>
                          </div>
                          <p className="text-xs text-[#dce2f8] font-medium leading-relaxed">
                            {linguisticDetails.register.sublabel} &bull; {linguisticDetails.register.tone}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer prompt: Explicit Flip Trigger */}
                    <div className="flex items-center justify-center gap-2 text-xs text-[#ffe082] pt-3 relative z-10 border-t border-[#232a3a]">
                      <span className="material-symbols-outlined text-sm text-[#f2ca50] animate-spin-slow">
                        flip
                      </span>
                      <span className="uppercase tracking-wider font-semibold text-[11px]">
                        Toucher la carte ou appuyer sur [Espace] pour révéler le verso ↻
                      </span>
                    </div>
                  </div>

                  {/* ========================================================
                      VERSO (BACK) FACE
                      ======================================================== */}
                  <div
                    className={`w-full rounded-2xl p-5 sm:p-7 flex flex-col justify-between border shadow-2xl transition-all duration-300 [transform:rotateY(180deg)] ${
                      isFlipped ? 'pointer-events-auto opacity-100 z-10' : 'pointer-events-none opacity-0 z-0'
                    } ${
                      isFocusMode
                        ? 'min-h-[480px] sm:min-h-[530px] bg-gradient-to-br from-[#0c1426] via-[#101930] to-[#0a101f] border-[#f2ca50]/60 ring-1 ring-[#f2ca50]/40'
                        : 'min-h-[450px] sm:min-h-[490px] bg-[#191f2f] border-[#f2ca50]/40'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg) translate3d(0,0,0)'
                    }}
                  >
                    {/* Verso Scrollable Body: Scrolling here never triggers accidental flipping */}
                    <div
                      ref={versoScrollRef}
                      className="space-y-3.5 flex-1 text-xs overflow-y-auto max-h-[420px] sm:max-h-[460px] pr-1.5 custom-scrollbar"
                      onScroll={() => {
                        isScrollingOrDraggingRef.current = true;
                      }}
                    >
                      {/* Word Header on Verso with UK/US Speaker and Flip Back Quick Action */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#232a3a] gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-black text-xl text-[#f2ca50]">
                            {card.term}
                          </span>
                          <span className="text-xs text-[#dce2f8] font-mono italic">
                            {card.phonetic}
                          </span>
                          {linguisticDetails?.partOfSpeech && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#121c2e] text-[#ffe082] border border-[#ffe082]/30">
                              {linguisticDetails.partOfSpeech.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <DualSpeakerButton
                            text={card.term}
                            id={`fc-modal-back-${card.id}`}
                            variant="compact"
                          />
                          <button
                            type="button"
                            onClick={handleFlip}
                            className="px-2 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#dce2f8] hover:text-[#0c1322] text-[10px] font-mono font-bold border border-white/10 flex items-center gap-1 transition-all"
                            title="Revenir au Recto"
                          >
                            <span className="material-symbols-outlined text-xs">flip</span>
                            <span>Recto</span>
                          </button>
                        </div>
                      </div>

                      {/* 1. French & English Detailed Definitions */}
                      <div
                        className={`p-3.5 rounded-xl border ${
                          isFocusMode
                            ? 'bg-[#070d1a]/95 border-[#f2ca50]/40'
                            : 'bg-[#070e1d]/90 border-[#4d4635]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                          <span className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                            Traduction Française & Finesse Sémantique
                          </span>
                          <span className="text-[10px] text-[#ffe082] font-mono font-bold">
                            Niveau {card.level} &bull; {card.gradeLabel}
                          </span>
                        </div>
                        <p className="font-semibold text-sm sm:text-base text-[#ffffff] leading-snug">
                          « {card.frenchDef} »
                        </p>
                        <p className="text-xs text-[#dce2f8]/90 mt-2 leading-relaxed border-t border-[#1e2538] pt-2">
                          <strong className="text-[#f2ca50]">Définition Contextuelle (EN) :</strong> {card.englishDef}
                        </p>
                      </div>

                      {/* 2. Mnemonic Cognitive Memory Hook */}
                      {linguisticDetails?.mnemonic && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[#f2ca50] text-base mt-0.5 shrink-0">
                            psychology
                          </span>
                          <div>
                            <p className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                              Astuce de Mémorisation (Ancrage Cognitif)
                            </p>
                            <p className="text-xs text-[#ffe082] mt-0.5 leading-relaxed">
                              {linguisticDetails.mnemonic}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 3. Etymology Philologique */}
                      <div className="p-3.5 rounded-xl bg-[#152038]/70 border border-[#f2ca50]/30 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#f2ca50] text-lg mt-0.5 shrink-0">
                          history_edu
                        </span>
                        <div>
                          <p className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                            Étymologie Philologique (Racines & Évolution)
                          </p>
                          <p className="text-xs text-[#dce2f8] mt-0.5 leading-relaxed">
                            {card.etymology}
                          </p>
                        </div>
                      </div>

                      {/* 4. Phonetic & Accentuation Guide (UK vs US) */}
                      {linguisticDetails?.phoneticsDetailed && (
                        <div className="p-3 rounded-xl bg-[#0a1120] border border-[#2e3b55] flex flex-col gap-1.5">
                          <p className="text-[10px] text-[#f2ca50] uppercase font-bold">
                            Nuance Phonetique : Oxford RP 🇬🇧 vs General American 🇺🇸
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-[#141b2c] border border-white/5">
                              <span className="text-[#f2ca50] font-bold block mb-0.5">🇬🇧 Anglais Britannique :</span>
                              <span className="text-[#dce2f8]">{linguisticDetails.phoneticsDetailed.ukDescription}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#141b2c] border border-white/5">
                              <span className="text-[#38bdf8] font-bold block mb-0.5">🇺🇸 Anglais Américain :</span>
                              <span className="text-[#dce2f8]">{linguisticDetails.phoneticsDetailed.usDescription}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#99907c] font-mono italic">
                            Accent tonique : {linguisticDetails.phoneticsDetailed.stressRule}
                          </p>
                        </div>
                      )}

                      {/* 5. Press Excerpt with Direct Audio Speaker */}
                      <div className="p-3.5 rounded-xl bg-[#070d1a]/85 border border-[#4d4635]/40">
                        <div className="flex items-center justify-between text-[10px] mb-1.5 text-[#d0c5af] flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            <span className="uppercase font-bold text-[#f2ca50]">Extrait & Contexte Authentique</span>
                            <span className="italic font-mono text-amber-200">[{card.pressSource}]</span>
                          </div>
                          <DualSpeakerButton
                            text={card.pressExcerpt}
                            id={`fc-excerpt-${card.id}`}
                            variant="minimal"
                          />
                        </div>
                        <p className="font-serif italic text-xs sm:text-sm text-[#fff8e7] leading-relaxed">
                          « {card.pressExcerpt} »
                        </p>
                      </div>

                      {/* 6. Clickable Collocations */}
                      {card.collocations && card.collocations.length > 0 && (
                        <div className="p-3 rounded-xl bg-[#152038]/50 border border-[#4d4635]/30">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] text-[#f2ca50] uppercase font-bold">
                              Collocations Clés & Associations Fréquentes
                            </p>
                            <span className="text-[9px] text-[#8391ac] font-mono">
                              Cliquer sur une puce pour écouter 🔊
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {card.collocations.map((c, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={(e) => handleSpeakCollocation(c, e)}
                                className="px-2.5 py-1 rounded-md bg-[#0a1120] hover:bg-[#1a253c] text-xs text-[#dce2f8] hover:text-[#f2ca50] border border-[#f2ca50]/25 hover:border-[#f2ca50]/60 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title={`Écouter la collocation « ${c} »`}
                              >
                                <span className="material-symbols-outlined text-xs text-[#f2ca50]">volume_up</span>
                                <span>{c}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 7. Nuance comparisons */}
                      {card.nuanceComparisons && card.nuanceComparisons.length > 0 && (
                        <div className="p-3 rounded-xl bg-[#070d1a]/70 border border-[#4d4635]/30 space-y-1.5">
                          <p className="text-[10px] text-[#f2ca50] uppercase font-bold">
                            Distinction de Nuances & Quasi-Synonymes
                          </p>
                          {card.nuanceComparisons.map((n, i) => (
                            <p key={i} className="text-[11px] text-[#d0c5af]">
                              <strong className="text-white font-medium">{n.word} :</strong> {n.distinction}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Verso Bottom Flip Button */}
                    <div className="pt-3 flex items-center justify-center gap-1.5 text-xs text-[#ffe082] border-t border-[#232a3a] mt-2">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-xs font-semibold text-[#f2ca50] border border-[#f2ca50]/40 transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">replay</span>
                        <span className="uppercase tracking-wider font-semibold text-[11px]">
                          Revenir au recto (ou toucher ici) ↻
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONTROLS BAR: Standard vs Focus Mode */}
            {!isFocusMode ? (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {/* Flip button & Bookmark & Quick Navigation */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3.5 sm:px-4 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-xs font-semibold text-[#dce2f8] border border-[#4d4635]/30 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base text-[#f2ca50]">flip</span>
                      <span>{isFlipped ? 'Voir le Recto' : 'Retourner (Verso)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => card && toggleBookmark(card.id)}
                      className="w-9 h-9 rounded-full bg-[#191f2f] hover:bg-[#232a3a] flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] transition-colors border border-[#2e3b55]"
                      title={isCurrentBookmarked ? 'Retirer des favoris' : 'Enregistrer dans les favoris'}
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{
                          fontVariationSettings: isCurrentBookmarked ? "'FILL' 1" : "'FILL' 0",
                          color: isCurrentBookmarked ? '#f2ca50' : undefined
                        }}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={handlePrevCard}
                      className="p-2 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] border border-[#2e3b55] transition-colors active:scale-95"
                      title="Carte précédente (Flèche gauche ou glissement à droite)"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                    </button>
                    <span className="text-xs font-mono text-[#d4c78f] px-1 font-bold">
                      {safeIndex + 1} / {filteredCards.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextCard}
                      className="p-2 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] border border-[#2e3b55] transition-colors active:scale-95"
                      title="Carte suivante (Flèche droite ou glissement à gauche)"
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* SM-2 Spaced Repetition 4 Buttons */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 shadow-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
                      Auto-évaluation &bull; Algorithme SM-2
                    </span>
                    <span className="text-[#f2ca50] font-mono text-[11px]">Prochain rappel mémoriel</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Revoir */}
                    <button
                      type="button"
                      onClick={() => handleSM2Rating('again')}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#93000a]/20 hover:bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                        <span>Revoir</span>
                      </div>
                      <span className="text-[10px] opacity-80">&lt; 10 min</span>
                    </button>

                    {/* Difficile */}
                    <button
                      type="button"
                      onClick={() => handleSM2Rating('hard')}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#4f471b]/30 hover:bg-[#4f471b]/60 border border-[#d4c78f]/30 text-[#d4c78f] active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">sentiment_neutral</span>
                        <span>Difficile</span>
                      </div>
                      <span className="text-[10px] opacity-80">1 jour</span>
                    </button>

                    {/* Bon */}
                    <button
                      type="button"
                      onClick={() => handleSM2Rating('good')}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-[#4d4635]/40 text-[#dce2f8] active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold text-[#f2ca50]">
                        <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                        <span>Bon</span>
                      </div>
                      <span className="text-[10px] text-[#99907c]">3 jours</span>
                    </button>

                    {/* Parfait */}
                    <button
                      type="button"
                      onClick={() => handleSM2Rating('easy')}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg shadow-[#f2ca50]/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <span
                          className="material-symbols-outlined text-sm"
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
              /* Focus Mode: Streamlined Bottom Controls */
              <div className="flex flex-col gap-2.5 pt-2">
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
          </>
        )}
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#152342]/95 border border-[#f2ca50]/60 text-[#ffe082] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
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
