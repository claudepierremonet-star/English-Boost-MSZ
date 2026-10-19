import React, { useState } from 'react';
import { STUDY_FOLIOS, type StudyFolio } from '../data/curriculum';

interface StackedCardsProps {
  onOpenFolioStudy: (folio: StudyFolio) => void;
}

export const StackedCards: React.FC<StackedCardsProps> = ({ onOpenFolioStudy }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedFolioIdx, setSelectedFolioIdx] = useState<number>(0);

  const toggleStack = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCardClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      setSelectedFolioIdx(idx);
    } else {
      setSelectedFolioIdx(idx);
    }
  };

  // Card stack configuration
  // Folded: cards overlap by ~1/3 with progressive scale & Y offset
  // Unfolded: cards cascade down with full height visibility
  return (
    <section className="px-4 sm:px-6 py-4 flex flex-col gap-3 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-xl sm:text-2xl text-[#dce2f8] font-semibold tracking-wide">
            Manuscrits d'Étude
          </h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              isExpanded
                ? 'bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/40'
                : 'bg-[#d4af37] text-[#3c2f00] shadow-sm animate-pulse'
            }`}
          >
            {isExpanded ? '4 Folios Déployés' : `${STUDY_FOLIOS.length - 1} en attente`}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleStack}
          className="text-xs text-[#f2ca50] hover:text-[#d4c78f] flex items-center gap-1 font-semibold transition-colors"
        >
          <span>{isExpanded ? 'Replier liasse' : 'Déployer (4)'}</span>
          <span
            className="material-symbols-outlined text-base transition-transform duration-300"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            expand_more
          </span>
        </button>
      </div>

      <p className="text-xs text-[#d0c5af]/80 font-sans">
        Touchez la pile de reliures pour déployer vos parchemins de rhétorique et de vocabulaire avancé.
      </p>

      {/* Stack Container */}
      <div
        onClick={toggleStack}
        className="relative w-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ minHeight: isExpanded ? `${STUDY_FOLIOS.length * 175 + 40}px` : '240px' }}
      >
        {STUDY_FOLIOS.map((folio, idx) => {
          // Dynamic positioning
          const isTopCard = idx === 0;
          const isSelected = selectedFolioIdx === idx;

          // Folded offset: roughly 1/3 overlap
          const foldedTop = idx * 55;
          const foldedScale = 1 - idx * 0.035;
          const foldedZIndex = (STUDY_FOLIOS.length - idx) * 10;
          const foldedOpacity = 1 - idx * 0.06;

          // Unfolded offset: stacked vertically so full card details can be read
          const unfoldedTop = idx * 175;
          const unfoldedScale = 1;
          const unfoldedZIndex = isSelected ? 50 : 20;

          return (
            <div
              key={folio.id}
              onClick={(e) => handleCardClick(idx, e)}
              className={`absolute inset-x-0 rounded-2xl p-5 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between border backdrop-blur-xl ${
                isSelected && isExpanded
                  ? 'border-[#f2ca50] bg-[#232a3a] ring-1 ring-[#f2ca50]/50'
                  : idx === 0
                  ? 'border-[#f2ca50]/30 bg-[#232a3a]/95'
                  : 'border-[#4d4635]/40 bg-[#191f2f]/95'
              }`}
              style={{
                top: isExpanded ? `${unfoldedTop}px` : `${foldedTop}px`,
                transform: `scale(${isExpanded ? unfoldedScale : foldedScale})`,
                zIndex: isExpanded ? unfoldedZIndex : foldedZIndex,
                opacity: isExpanded ? 1 : foldedOpacity,
                transitionDelay: `${idx * 45}ms`
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      idx === 0
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50]'
                        : 'bg-[#151b2b] text-[#d4c78f]'
                    }`}
                  >
                    {folio.badge}
                  </span>
                  <span className="text-[11px] text-[#d0c5af]">{folio.duration}</span>
                </div>

                <div className="w-7 h-7 rounded-full bg-[#151b2b] border border-[#4d4635]/40 flex items-center justify-center text-[#f2ca50] font-serif font-bold text-xs">
                  {folio.folioRoman}
                </div>
              </div>

              {/* Title & Description */}
              <div className="my-2">
                <div className="flex items-center gap-1.5 text-xs text-[#d4c78f] font-semibold uppercase tracking-widest mb-1">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                    {folio.iconName}
                  </span>
                  {folio.accent}
                </div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-[#dce2f8] leading-tight">
                  {folio.title}
                </h3>
                <p className="text-xs text-[#d0c5af]/80 mt-1 line-clamp-2 leading-relaxed">
                  {folio.subtitle}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2e3545]/60">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] border border-[#4d4635]/40">
                    {folio.level}
                  </span>
                  <span className="text-xs text-[#d0c5af]">{folio.lexemes}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFolioStudy(folio);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md hover:bg-[#ffe088] transition-colors active:scale-95"
                >
                  <span>Étudier</span>
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
