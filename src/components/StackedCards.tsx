import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { StudyFolio } from '../data/curriculum';
import {
  STACKED_COLLECTIONS_DATA,
  type StackCategoryType,
  type StackCardItem
} from '../data/stackedCollections';
import { DualSpeakerButton } from './DualSpeakerButton';
import { triggerAutoPlayIfEnabled } from '../services/speechService';

interface StackedCardsProps {
  onOpenFolioStudy: (folio: StudyFolio) => void;
  onOpenVocabularyFocus?: () => void;
  onOpenProfile?: () => void;
  initialCategory?: StackCategoryType;
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Top Interactive Swipeable Card in the Deck
// ---------------------------------------------------------------------------
interface TopCardProps {
  card: StackCardItem;
  direction: 'left' | 'right' | null;
  onSwipe: (dir: 'left' | 'right') => void;
  onOpenAction: (card: StackCardItem, e: React.MouseEvent) => void;
  onFocus: (card: StackCardItem, e: React.MouseEvent) => void;
  onExpand: () => void;
}

const TopCard: React.FC<TopCardProps> = ({
  card,
  direction,
  onSwipe,
  onOpenAction,
  onFocus,
  onExpand
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-14, 0, 14]);
  const leftIndicatorOpacity = useTransform(x, [-120, -35, 0], [1, 0.4, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 35, 120], [0, 0.4, 1]);
  const isDraggingRef = useRef(false);

  const cardVariants = {
    enter: (dir: 'left' | 'right' | null) => ({
      scale: 0.94,
      y: 16,
      opacity: 0.85,
      x: dir === 'left' ? 60 : dir === 'right' ? -60 : 0
    }),
    center: {
      scale: 1,
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 380,
        damping: 26
      }
    },
    exit: (dir: 'left' | 'right' | null) => ({
      x: dir === 'left' ? -380 : dir === 'right' ? 380 : -300,
      opacity: 0,
      rotate: dir === 'left' ? -18 : dir === 'right' ? 18 : -15,
      transition: { duration: 0.28, ease: 'easeOut' as const }
    })
  };

  return (
    <motion.div
      key={card.id}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ x, rotate, zIndex: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={(_e, info) => {
        const threshold = 65;
        const velocityThreshold = 220;
        if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
          onSwipe('left');
        } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
          onSwipe('right');
        }
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      }}
      className="absolute inset-x-0 top-0 rounded-2xl p-5 flex flex-col justify-between border border-[#f2ca50]/60 bg-gradient-to-br from-[#232f48] via-[#1a253c] to-[#121c30] shadow-[0_22px_50px_-8px_rgba(242,202,80,0.25),0_16px_40px_-5px_rgba(0,0,0,0.85)] ring-1 ring-[#f2ca50]/50 backdrop-blur-xl cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Gold Filament Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f2ca50] to-transparent shadow-[0_0_12px_#f2ca50]" />

      {/* Swipe Feedback Badges */}
      <motion.div
        style={{ opacity: leftIndicatorOpacity }}
        className="pointer-events-none absolute top-4 right-4 px-3 py-1 rounded-full bg-[#f2ca50] text-[#2c2000] text-[11px] font-mono font-black shadow-lg flex items-center gap-1 z-40 border border-white/20"
      >
        <span>SUIVANT</span>
        <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
      </motion.div>

      <motion.div
        style={{ opacity: rightIndicatorOpacity }}
        className="pointer-events-none absolute top-4 left-4 px-3 py-1 rounded-full bg-[#38bdf8] text-[#041d33] text-[11px] font-mono font-black shadow-lg flex items-center gap-1 z-40 border border-white/20"
      >
        <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
        <span>PRÉCÉDENT</span>
      </motion.div>

      {/* Card Header: Roman ID, Badge & Expand indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.4)]">
            {card.badge}
          </span>
          <span className="text-[11px] text-[#f4deb3] font-mono">
            {card.accent}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#d0c5af]/80 bg-[#0a1120]/70 px-2 py-0.5 rounded border border-[#232a3a]">
            Glisser ↔
          </span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-xs bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.5)]">
            {card.romanId}
          </div>
        </div>
      </div>

      {/* Card Title & Description */}
      <div
        className="my-3"
        onClick={() => {
          if (!isDraggingRef.current) {
            onExpand();
          }
        }}
      >
        <div className="flex items-center gap-1.5 text-xs text-[#d4c78f] font-semibold uppercase tracking-widest mb-1">
          <span className="material-symbols-outlined text-sm text-[#f2ca50]">
            {card.iconName}
          </span>
          <span>{card.itemsCount}</span>
        </div>

        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#ffffff] leading-tight drop-shadow-sm">
          {card.title}
        </h3>

        <p className="text-xs text-[#dce2f8]/90 mt-1 line-clamp-2 leading-relaxed">
          {card.subtitle}
        </p>
      </div>

      {/* Card Footer: Level, Audio/Focus & Primary Action */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#f2ca50]/25">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#0a1120] text-[10px] font-bold text-[#f2ca50] border border-[#f2ca50]/40 font-mono">
            {card.level}
          </span>
          {card.duration && (
            <span className="text-xs text-[#d0c5af] hidden sm:inline">
              {card.duration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Focus Lecture Mode */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              if (!isDraggingRef.current) {
                onFocus(card, e);
              }
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-[#10192d] hover:bg-[#1a2744] text-[#ffe082] border border-[#f2ca50]/35 transition-all active:scale-95 shadow-sm"
            title="Lire en Mode Focus Lecture"
          >
            <span className="material-symbols-outlined text-sm">center_focus_strong</span>
            <span className="hidden sm:inline">Focus</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              if (!isDraggingRef.current) {
                onOpenAction(card, e);
              }
            }}
            className="px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md bg-gradient-to-r from-[#ffe088] via-[#f2ca50] to-[#e6b82e] text-[#2c2000] shadow-[0_0_16px_rgba(242,202,80,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <span>{card.actionLabel}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT: StackedCards with interactive Framer Motion swipe deck
// ---------------------------------------------------------------------------
export const StackedCards: React.FC<StackedCardsProps> = ({
  onOpenFolioStudy,
  onOpenVocabularyFocus,
  onOpenProfile,
  initialCategory = 'courses'
}) => {
  const [activeCategory, setActiveCategory] = useState<StackCategoryType>(initialCategory);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [focusItem, setFocusItem] = useState<StackCardItem | null>(null);

  const currentCategoryData = STACKED_COLLECTIONS_DATA[activeCategory];
  const items = currentCategoryData.items;

  // Reset indices when category changes
  const handleCategorySwitch = (cat: StackCategoryType, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCategory(cat);
    setCurrentIndex(0);
    setSelectedIdx(0);
    setSwipeDirection(null);
  };

  // Toggle stack expansion / retraction
  const toggleStack = () => {
    setIsExpanded((prev) => !prev);
  };

  // Handle swipe left/right
  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    if (direction === 'left') {
      // Next card
      setCurrentIndex((prev) => (prev + 1) % items.length);
    } else {
      // Previous card
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const handleCardAction = (item: StackCardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.actionType === 'flashcards' && onOpenVocabularyFocus) {
      onOpenVocabularyFocus();
    } else if (item.actionType === 'profile' && onOpenProfile) {
      onOpenProfile();
    } else {
      const folioCompatible: StudyFolio = {
        id: item.id,
        folioNumber: `FOLIO ${item.romanId}`,
        folioRoman: item.romanId,
        badge: item.badge,
        level: item.level as any,
        title: item.title,
        subtitle: item.subtitle,
        duration: item.duration || '3h',
        progressPercent: 60,
        exercisesCount: 4,
        accent: item.accent,
        lexemes: item.itemsCount,
        quote: item.quote,
        author: item.author,
        iconName: item.iconName
      };
      onOpenFolioStudy(folioCompatible);
    }
  };

  // Keyboard navigation for Focus Lecture mode
  useEffect(() => {
    if (!focusItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        setFocusItem(null);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const currentIdx = items.findIndex((f) => f.id === focusItem.id);
        const nextIdx = (currentIdx + 1) % items.length;
        setFocusItem(items[nextIdx]);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const currentIdx = items.findIndex((f) => f.id === focusItem.id);
        const prevIdx = (currentIdx - 1 + items.length) % items.length;
        setFocusItem(items[prevIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusItem, items]);

  // Audio trigger in Focus Lecture mode
  useEffect(() => {
    if (focusItem?.quote) {
      triggerAutoPlayIfEnabled(focusItem.quote, `stacked-focus-${focusItem.id}`, 400);
    }
  }, [focusItem?.id, focusItem?.quote]);

  // Top card & cards beneath in the stacked deck
  const topCard = items[currentIndex] || items[0];
  const secondCard = items[(currentIndex + 1) % items.length];
  const thirdCard = items[(currentIndex + 2) % items.length];

  return (
    <section className="px-4 sm:px-6 py-4 flex flex-col gap-3 select-none">
      {/* 1. SECTION HEADER: Title, Mode & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-sm">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              {currentCategoryData.icon}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl text-[#dce2f8] font-bold tracking-wide">
                Manuscrits & Collections
              </h2>
              {/* Active Card Pill */}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.4)]">
                {currentIndex + 1} / {items.length}
              </span>
            </div>
            <p className="text-xs text-[#d0c5af]/80">
              {currentCategoryData.description}
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Quick Focus Reading shortcut */}
          <button
            type="button"
            onClick={() => setFocusItem(topCard)}
            className="px-3 py-1.5 rounded-xl border border-[#f2ca50]/40 bg-[#191f2f] hover:bg-[#f2ca50]/20 text-[#f2ca50] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Activer le Mode Focus Lecture sur le manuscrit actif"
          >
            <span className="material-symbols-outlined text-sm">center_focus_strong</span>
            <span>Focus Lecture</span>
          </button>

          {/* Toggle Expand / Stacked Mode */}
          <button
            type="button"
            onClick={toggleStack}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border ${
              isExpanded
                ? 'bg-[#232a3a] text-[#ffe082] border-[#f2ca50]/40 hover:bg-[#2e374d]'
                : 'bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] border-[#f2ca50] shadow-[0_0_12px_rgba(242,202,80,0.35)]'
            }`}
            title={isExpanded ? 'Replier en pile interactive (Swipe Deck)' : 'Déployer toutes les cartes en grille'}
          >
            <span className="material-symbols-outlined text-sm">
              {isExpanded ? 'view_agenda' : 'layers'}
            </span>
            <span>{isExpanded ? 'Mode Pile (Swipe)' : `Déployer (${items.length})`}</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS: Courses / Saved / Lexicon / Profile */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1322] border border-[#232a3a] overflow-x-auto">
        {(Object.keys(STACKED_COLLECTIONS_DATA) as StackCategoryType[]).map((catKey) => {
          const cat = STACKED_COLLECTIONS_DATA[catKey];
          const isActive = activeCategory === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={(e) => handleCategorySwitch(catKey, e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] font-bold shadow-md'
                  : 'text-[#d0c5af] hover:text-[#dce2f8] hover:bg-[#191f2f]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[10px] font-mono opacity-80 ${isActive ? 'text-[#2c2000]' : 'text-[#f2ca50]'}`}>
                ({cat.items.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. INTERACTIVE STACK VIEW OR EXPANDED CASCADE */}
      {!isExpanded ? (
        /* INTERACTIVE SWIPEABLE PILE (FRAMER MOTION) */
        <div className="flex flex-col gap-3 pt-2">
          {/* Card Stack Container */}
          <div className="relative w-full h-[225px] sm:h-[215px] perspective-[1000px]">
            {/* 3rd Card in Stack (Deep Background) */}
            {items.length > 2 && thirdCard && (
              <motion.div
                key={`deck-3rd-${thirdCard.id}`}
                animate={{
                  scale: 0.88,
                  y: 32,
                  opacity: 0.55
                }}
                transition={{ duration: 0.3 }}
                style={{ zIndex: 10 }}
                className="absolute inset-x-0 top-0 rounded-2xl p-5 border border-[#30394c]/50 bg-[#0d1422]/90 shadow-md pointer-events-none"
              >
                <div className="flex items-center justify-between opacity-50">
                  <span className="text-[10px] font-mono font-bold text-[#d0c5af]">
                    {thirdCard.badge}
                  </span>
                  <span className="text-xs font-serif text-[#f2ca50]">
                    {thirdCard.romanId}
                  </span>
                </div>
                <div className="mt-2 text-sm font-serif font-bold text-white/50 truncate">
                  {thirdCard.title}
                </div>
              </motion.div>
            )}

            {/* 2nd Card in Stack (Mid Background) */}
            {items.length > 1 && secondCard && (
              <motion.div
                key={`deck-2nd-${secondCard.id}`}
                animate={{
                  scale: 0.94,
                  y: 16,
                  opacity: 0.85
                }}
                transition={{ duration: 0.3 }}
                style={{ zIndex: 20 }}
                className="absolute inset-x-0 top-0 rounded-2xl p-5 border border-[#4d4635]/60 bg-[#141c2c]/95 shadow-lg pointer-events-none"
              >
                <div className="flex items-center justify-between opacity-80">
                  <span className="text-[10px] font-mono font-bold text-[#f2ca50]/80">
                    {secondCard.badge}
                  </span>
                  <span className="text-xs font-serif text-[#f2ca50]">
                    {secondCard.romanId}
                  </span>
                </div>
                <div className="mt-2 text-sm sm:text-base font-serif font-bold text-white/80 truncate">
                  {secondCard.title}
                </div>
                <div className="text-xs text-[#d0c5af]/70 truncate mt-0.5">
                  {secondCard.subtitle}
                </div>
              </motion.div>
            )}

            {/* 1st Top Card (Swipeable with framer-motion) */}
            <AnimatePresence mode="popLayout" custom={swipeDirection}>
              <TopCard
                key={topCard.id}
                card={topCard}
                direction={swipeDirection}
                onSwipe={handleSwipe}
                onOpenAction={handleCardAction}
                onFocus={(c, e) => {
                  e.stopPropagation();
                  setFocusItem(c);
                }}
                onExpand={toggleStack}
              />
            </AnimatePresence>
          </div>

          {/* SWIPE CONTROLS & PAGINATION BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-1 pt-1 border-t border-[#232a3a]/60">
            {/* Gesture Hint */}
            <div className="flex items-center gap-1.5 text-xs text-[#d0c5af]/80">
              <span className="material-symbols-outlined text-base text-[#f2ca50] animate-pulse">
                swipe
              </span>
              <span>Glissez la carte à gauche ou à droite pour feuilleter</span>
            </div>

            {/* Navigation Buttons and Dots */}
            <div className="flex items-center gap-3">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => handleSwipe('right')}
                className="px-2.5 py-1 rounded-lg bg-[#141d2f] hover:bg-[#1f2b44] text-[#dce2f8] border border-[#2e374d] hover:border-[#f2ca50]/40 text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
                title="Carte précédente (Swipe droite)"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span className="hidden sm:inline">Précédent</span>
              </button>

              {/* Dots Pagination */}
              <div className="flex items-center gap-1.5">
                {items.map((it, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        setSwipeDirection(idx > currentIndex ? 'left' : 'right');
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-6 bg-[#f2ca50] shadow-[0_0_8px_rgba(242,202,80,0.6)]'
                          : 'w-2 bg-[#232a3a] hover:bg-[#3d4860]'
                      }`}
                      title={`Aller à ${it.title}`}
                    />
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handleSwipe('left')}
                className="px-2.5 py-1 rounded-lg bg-[#141d2f] hover:bg-[#1f2b44] text-[#dce2f8] border border-[#2e374d] hover:border-[#f2ca50]/40 text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
                title="Carte suivante (Swipe gauche)"
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* EXPANDED GRID VIEW (ALL CARDS DEPLOYED) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {items.map((card, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedIdx === idx;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => {
                  setSelectedIdx(idx);
                  setCurrentIndex(idx);
                }}
                className={`relative rounded-2xl p-5 flex flex-col justify-between border backdrop-blur-xl group cursor-pointer transition-all duration-300 ${
                  isHovered || isSelected
                    ? 'border-[#f2ca50] bg-gradient-to-br from-[#232f48] via-[#1a253c] to-[#121c30] shadow-[0_16px_40px_-8px_rgba(242,202,80,0.22),0_12px_30px_-5px_rgba(0,0,0,0.85)] ring-1 ring-[#f2ca50]/60'
                    : 'border-[#4d4635]/40 bg-[#151d2d]/95 hover:border-[#f2ca50]/50 shadow-md'
                }`}
              >
                {/* Luminous Top Gold Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f2ca50] to-transparent transition-opacity duration-300 pointer-events-none ${
                    isHovered || isSelected ? 'opacity-100 shadow-[0_0_10px_#f2ca50]' : 'opacity-0'
                  }`}
                />

                {/* Card Header: Roman ID & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isHovered || isSelected
                          ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.4)]'
                          : 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/30'
                      }`}
                    >
                      {card.badge}
                    </span>

                    <span className="text-[11px] text-[#d0c5af] group-hover:text-amber-200 transition-colors font-mono">
                      {card.accent}
                    </span>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-xs transition-all duration-300 ${
                      isHovered || isSelected
                        ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.5)] scale-105'
                        : 'bg-[#0c1424] border border-[#f2ca50]/40 text-[#f2ca50]'
                    }`}
                  >
                    {card.romanId}
                  </div>
                </div>

                {/* Card Title & Subtitle */}
                <div className="my-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#d4c78f] font-semibold uppercase tracking-widest mb-1 group-hover:text-[#ffe082] transition-colors">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                      {card.iconName}
                    </span>
                    <span>{card.itemsCount}</span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#ffffff] leading-tight group-hover:text-[#fff4cc] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#d0c5af]/85 mt-1 line-clamp-2 leading-relaxed group-hover:text-[#ffffff] transition-colors">
                    {card.subtitle}
                  </p>
                </div>

                {/* Card Footer: Level, Details & Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#2e374d]/70 group-hover:border-[#f2ca50]/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0a1120] text-[10px] font-bold text-[#f2ca50] border border-[#f2ca50]/40 font-mono">
                      {card.level}
                    </span>
                    {card.duration && (
                      <span className="text-xs text-[#d0c5af] group-hover:text-[#fff0cc] transition-colors hidden sm:inline">
                        {card.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Focus Lecture Mode */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusItem(card);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-[#10192d] hover:bg-[#1a2744] text-[#ffe082] border border-[#f2ca50]/35 transition-all active:scale-95 shadow-sm"
                      title="Lire en Mode Focus Lecture"
                    >
                      <span className="material-symbols-outlined text-sm">center_focus_strong</span>
                      <span className="hidden sm:inline">Focus</span>
                    </button>

                    {/* Primary Action Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCardAction(card, e)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088] active:scale-95 transition-all"
                    >
                      <span>{card.actionLabel}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. IMMERSIVE FULL-SCREEN "FOCUS LECTURE" MODAL */}
      {focusItem && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#050913]/98 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-fadeIn select-none"
          onClick={() => setFocusItem(null)}
        >
          {/* Ambient Warm Golden Flare */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-tr from-amber-400/15 via-[#f2ca50]/15 to-transparent blur-3xl pointer-events-none" />

          {/* Top Focus HUD Bar */}
          <div
            className="flex items-center justify-between relative z-20 pb-4 border-b border-[#f2ca50]/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] shadow-[0_0_10px_#f2ca50] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#f2ca50] uppercase">
                  MODE FOCUS LECTURE &bull; {currentCategoryData.label.toUpperCase()}
                </span>
                <span className="text-xs text-[#d0c5af]">
                  Immersion sans distraction &bull; {focusItem.romanId} ({focusItem.level})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-[#99907c] font-mono mr-2">
                [← / → pour naviguer &bull; Échap pour quitter]
              </span>
              <button
                type="button"
                onClick={() => setFocusItem(null)}
                className="px-3.5 py-1.5 rounded-full bg-[#121a2d] hover:bg-[#1a2742] text-[#dce2f8] border border-[#f2ca50]/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">fullscreen_exit</span>
                <span>Quitter Focus</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Monumental Manuscript Reading Sanctuary */}
          <div
            className="max-w-3xl mx-auto w-full my-auto py-8 relative z-10 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Folio Header Crest */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#232a3a]">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#152342] border border-[#f2ca50]/40 text-[#f2ca50] text-[10px] font-mono font-bold">
                  {focusItem.badge}
                </span>
                <span className="text-amber-200/90 font-mono text-[11px]">
                  {focusItem.accent} &bull; {focusItem.itemsCount}
                </span>
              </div>
              <span className="text-sm font-serif font-bold text-[#f2ca50]">
                {focusItem.romanId}
              </span>
            </div>

            {/* Title & Philosophy */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#ffffff] font-black leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                {focusItem.title}
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#dce2f8]/90 leading-relaxed font-light">
                {focusItem.subtitle}
              </p>
            </div>

            {/* Monumental Central Quote */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0c1426]/90 via-[#131d35]/90 to-[#0a101f]/90 border border-[#f2ca50]/50 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <div className="absolute top-3 left-4 text-4xl sm:text-5xl font-serif text-[#f2ca50]/20 select-none">
                “
              </div>
              <blockquote className="font-serif italic text-lg sm:text-2xl text-[#fff7d6] leading-relaxed relative z-10 font-normal">
                {focusItem.quote}
              </blockquote>
              <div className="mt-4 pt-3 border-t border-[#f2ca50]/25 flex items-center justify-between text-xs text-[#d4c78f] font-mono flex-wrap gap-2">
                <span>{focusItem.author} • {focusItem.level}</span>
                <DualSpeakerButton
                  text={focusItem.quote}
                  id={`stacked-focus-${focusItem.id}`}
                  variant="pill"
                />
              </div>
            </div>

            {/* Philological Context Note */}
            <div className="p-4 rounded-xl bg-[#0e1628]/80 border border-[#232a3a] text-xs text-[#d0c5af] leading-relaxed flex items-start gap-3">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg mt-0.5 shrink-0">
                menu_book
              </span>
              <div>
                <strong className="text-white">Note d'érudition :</strong> {focusItem.subtitle} Prenez le temps d'assimiler les nuances lexicales avant de lancer la session interactive.
              </div>
            </div>
          </div>

          {/* Bottom Navigation & Action Strip */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-20 pt-4 border-t border-[#f2ca50]/20 max-w-3xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Folio switchers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const currentIdx = items.findIndex((f) => f.id === focusItem.id);
                  const prevIdx = (currentIdx - 1 + items.length) % items.length;
                  setFocusItem(items[prevIdx]);
                }}
                className="px-3 py-1.5 rounded-full bg-[#121a2d] hover:bg-[#1a2742] text-[#dce2f8] border border-white/10 text-xs font-semibold flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Précédent</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const currentIdx = items.findIndex((f) => f.id === focusItem.id);
                  const nextIdx = (currentIdx + 1) % items.length;
                  setFocusItem(items[nextIdx]);
                }}
                className="px-3 py-1.5 rounded-full bg-[#121a2d] hover:bg-[#1a2742] text-[#dce2f8] border border-white/10 text-xs font-semibold flex items-center gap-1 active:scale-95"
              >
                <span>Suivant</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Launch Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  const target = focusItem;
                  setFocusItem(null);
                  handleCardAction(target, e);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,202,80,0.35)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span>{focusItem.actionLabel}</span>
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
