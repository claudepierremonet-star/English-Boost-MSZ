import React, { useState, useEffect } from 'react';
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

export const StackedCards: React.FC<StackedCardsProps> = ({
  onOpenFolioStudy,
  onOpenVocabularyFocus,
  onOpenProfile,
  initialCategory = 'courses'
}) => {
  const [activeCategory, setActiveCategory] = useState<StackCategoryType>(initialCategory);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [focusItem, setFocusItem] = useState<StackCardItem | null>(null);

  const currentCategoryData = STACKED_COLLECTIONS_DATA[activeCategory];
  const items = currentCategoryData.items;
  const remainingCount = Math.max(0, items.length - 3);

  // Toggle stack expansion / retraction
  const toggleStack = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCategorySwitch = (cat: StackCategoryType, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCategory(cat);
    setSelectedIdx(0);
    // Keep stack collapsed when switching to see the new top 3 + N deck
    setIsExpanded(false);
  };

  const handleCardClick = (idx: number, item: StackCardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) {
      // First click: smoothly expands the stack
      setIsExpanded(true);
      setSelectedIdx(idx);
    } else {
      // Second click on the expanded card: sets selection or toggles collapse
      if (selectedIdx === idx) {
        setIsExpanded(false);
      } else {
        setSelectedIdx(idx);
      }
    }
  };

  const handleCardAction = (item: StackCardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.actionType === 'flashcards' && onOpenVocabularyFocus) {
      onOpenVocabularyFocus();
    } else if (item.actionType === 'profile' && onOpenProfile) {
      onOpenProfile();
    } else {
      // Convert to StudyFolio format for onOpenFolioStudy compatibility
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

  // Keyboard navigation for Focus Lecture mode on stacked cards
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

  // Lecture audio automatique alternée dès l'ouverture d'un folio en focus lecture
  useEffect(() => {
    if (focusItem?.quote) {
      triggerAutoPlayIfEnabled(focusItem.quote, `stacked-focus-${focusItem.id}`, 400);
    }
  }, [focusItem?.id, focusItem?.quote]);

  return (
    <section className="px-4 sm:px-6 py-4 flex flex-col gap-3 select-none">
      {/* 1. SECTION HEADER: Title, Counter & Expand/Retract Toggle */}
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
              {/* +N Remaining Indicator Pill */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all duration-300 ${
                  isExpanded
                    ? 'bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/40'
                    : 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.4)] animate-pulse'
                }`}
              >
                {isExpanded ? `${items.length} Déployés` : `+${remainingCount} restants`}
              </span>
            </div>
            <p className="text-xs text-[#d0c5af]/80">
              {currentCategoryData.description}
            </p>
          </div>
        </div>

        {/* Global Expand / Retract Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick Focus Reading shortcut */}
          <button
            type="button"
            onClick={() => setFocusItem(items[selectedIdx] || items[0])}
            className="px-3 py-1.5 rounded-xl border border-[#f2ca50]/40 bg-[#191f2f] hover:bg-[#f2ca50]/20 text-[#f2ca50] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Activer le Mode Focus Lecture sur le manuscrit actif"
          >
            <span className="material-symbols-outlined text-sm">center_focus_strong</span>
            <span>Focus Lecture</span>
          </button>

          {/* Smooth Toggle Expand / Collapse */}
          <button
            type="button"
            onClick={toggleStack}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border ${
              isExpanded
                ? 'bg-[#232a3a] text-[#ffe082] border-[#f2ca50]/40 hover:bg-[#2e374d]'
                : 'bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] border-[#f2ca50] shadow-[0_0_12px_rgba(242,202,80,0.35)]'
            }`}
            title={isExpanded ? 'Replier les cartes en superposition 1/3' : 'Déployer les cartes en cascade'}
          >
            <span>{isExpanded ? 'Replier liasse' : `Déployer (${items.length})`}</span>
            <span
              className="material-symbols-outlined text-base transition-transform duration-500"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS: 课程分类 · 学习收藏 · 词汇集 · 个人资料 */}
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

      {/* 3. OVERLAPPING CARDS STAGE (1/3 overlap when collapsed, staggered cascade when expanded) */}
      <div
        onClick={toggleStack}
        onMouseLeave={() => setHoveredIdx(null)}
        className="relative w-full cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          minHeight: isExpanded
            ? `${items.length * 180 + 30}px`
            : '235px'
        }}
      >
        {items.map((card, idx) => {
          const isSelected = selectedIdx === idx;
          const isHovered = hoveredIdx === idx;

          // COLLAPSED: Top 3 cards overlap by approximately 1/3 (52px step for ~160px card height)
          // Cards index >= 3 are hidden behind card 2 with opacity 0 and pointer-events none
          const foldedTop = idx < 3 ? idx * 52 : 104;
          const foldedScale = idx < 3 ? 1 - idx * 0.038 : 0.92;
          const foldedZIndex = (items.length - idx) * 10;
          const foldedOpacity = idx < 3 ? 1 - idx * 0.08 : 0;
          const foldedPointerEvents = idx < 3 ? 'auto' : 'none';

          // EXPANDED: Full cascading layout where each card reveals its full name and height
          const unfoldedTop = idx * 180;
          const unfoldedScale = 1;
          const unfoldedZIndex = isSelected ? 80 : 30 + idx;

          const currentTop = isExpanded ? `${unfoldedTop}px` : `${foldedTop}px`;
          const currentZIndex = isHovered ? 90 : isExpanded ? unfoldedZIndex : foldedZIndex;
          const currentOpacity = isExpanded ? 1 : foldedOpacity;
          const currentScale = isHovered
            ? isExpanded
              ? 1.025
              : foldedScale * 1.03
            : isExpanded
            ? unfoldedScale
            : foldedScale;

          // Stagger delay for fluid sequential expansion and retraction
          const staggerDelay = isHovered || hoveredIdx !== null ? 0 : idx * 55;

          return (
            <div
              key={card.id}
              onClick={(e) => handleCardClick(idx, card, e)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`absolute inset-x-0 rounded-2xl p-5 flex flex-col justify-between border backdrop-blur-xl group cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isHovered
                  ? 'border-[#f2ca50] bg-gradient-to-br from-[#232f48] via-[#1a253c] to-[#121c30] shadow-[0_24px_55px_-8px_rgba(242,202,80,0.28),0_16px_40px_-5px_rgba(0,0,0,0.85)] ring-1 ring-[#f2ca50]/70'
                  : isSelected && isExpanded
                  ? 'border-[#f2ca50] bg-[#212b3e] ring-1 ring-[#f2ca50]/50 shadow-2xl'
                  : idx === 0
                  ? 'border-[#f2ca50]/40 bg-[#1e2739]/95 shadow-xl'
                  : 'border-[#4d4635]/50 bg-[#151d2d]/95 shadow-lg'
              }`}
              style={{
                top: currentTop,
                transform: `scale(${currentScale}) translateY(${isHovered ? '-6px' : '0px'})`,
                zIndex: currentZIndex,
                opacity: currentOpacity,
                pointerEvents: isExpanded ? 'auto' : (foldedPointerEvents as any),
                transitionDelay: `${staggerDelay}ms`
              }}
            >
              {/* Luminous Top Gold Filament on Hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f2ca50] to-transparent transition-opacity duration-300 pointer-events-none ${
                  isHovered ? 'opacity-100 shadow-[0_0_12px_#f2ca50]' : 'opacity-0'
                }`}
              />

              {/* Card Header: Roman ID, Badge, +N Counter on 3rd card when folded */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                      isHovered
                        ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.4)]'
                        : idx === 0
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/30'
                        : 'bg-[#0f1726] text-[#d4c78f] border border-[#30394c]'
                    }`}
                  >
                    {card.badge}
                  </span>

                  <span className="text-[11px] text-[#d0c5af] group-hover:text-amber-200 transition-colors font-mono">
                    {card.accent}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* On 3rd card (idx === 2) when collapsed: Show prominent +N badge */}
                  {!isExpanded && idx === 2 && remainingCount > 0 && (
                    <span
                      onClick={toggleStack}
                      className="px-2.5 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[10px] font-mono font-black shadow-[0_0_10px_rgba(242,202,80,0.5)] animate-bounce"
                      title={`${remainingCount} autres cartes masquées dans cette liasse. Cliquez pour déployer.`}
                    >
                      +{remainingCount} SUIVANTES
                    </span>
                  )}

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-xs transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.5)] scale-110'
                        : 'bg-[#0c1424] border border-[#f2ca50]/40 text-[#f2ca50]'
                    }`}
                  >
                    {card.romanId}
                  </div>
                </div>
              </div>

              {/* CARD TITLE / NAME (Always visible and highlighted) */}
              <div className="my-2">
                <div className="flex items-center gap-1.5 text-xs text-[#d4c78f] font-semibold uppercase tracking-widest mb-1 group-hover:text-[#ffe082] transition-colors">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50] transition-transform duration-300 group-hover:scale-125">
                    {card.iconName}
                  </span>
                  <span>{card.itemsCount}</span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#ffffff] leading-tight group-hover:text-[#fff4cc] transition-colors drop-shadow-sm">
                  {card.title}
                </h3>

                <p className="text-xs text-[#d0c5af]/85 mt-1 line-clamp-2 leading-relaxed group-hover:text-[#ffffff] transition-colors">
                  {card.subtitle}
                </p>
              </div>

              {/* Card Footer: Level, Details & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2e374d]/70 group-hover:border-[#f2ca50]/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0a1120] text-[10px] font-bold text-[#f2ca50] border border-[#f2ca50]/40 group-hover:border-[#f2ca50]/60 transition-colors font-mono">
                    {card.level}
                  </span>
                  {card.duration && (
                    <span className="text-xs text-[#d0c5af] group-hover:text-[#fff0cc] transition-colors hidden sm:inline">
                      {card.duration}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Focus Lecture shortcut for this card */}
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

                  {/* Primary card action */}
                  <button
                    type="button"
                    onClick={(e) => handleCardAction(card, e)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md transition-all duration-300 active:scale-95 ${
                      isHovered
                        ? 'bg-gradient-to-r from-[#ffe088] via-[#f2ca50] to-[#e6b82e] text-[#2c2000] shadow-[0_0_16px_rgba(242,202,80,0.5)] scale-105'
                        : 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088]'
                    }`}
                  >
                    <span>{card.actionLabel}</span>
                    <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
