import React, { useState } from 'react';
import { STUDY_FOLIOS, type StudyFolio } from '../data/curriculum';

interface StackedCardsProps {
  onOpenFolioStudy: (folio: StudyFolio) => void;
}

export const StackedCards: React.FC<StackedCardsProps> = ({ onOpenFolioStudy }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedFolioIdx, setSelectedFolioIdx] = useState<number>(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
          className="text-xs text-[#f2ca50] hover:text-[#d4c78f] flex items-center gap-1 font-semibold transition-colors group cursor-pointer"
        >
          <span>{isExpanded ? 'Replier liasse' : 'Déployer (4)'}</span>
          <span
            className="material-symbols-outlined text-base transition-transform duration-300 group-hover:scale-110"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            expand_more
          </span>
        </button>
      </div>

      <p className="text-xs text-[#d0c5af]/80 font-sans">
        Survolez ou touchez chaque parchemin pour l'élever et révéler ses détails d'érudition.
      </p>

      {/* Stack Container */}
      <div
        onClick={toggleStack}
        onMouseLeave={() => setHoveredIdx(null)}
        className="relative w-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ minHeight: isExpanded ? `${STUDY_FOLIOS.length * 175 + 40}px` : '240px' }}
      >
        {STUDY_FOLIOS.map((folio, idx) => {
          // Dynamic positioning
          const isSelected = selectedFolioIdx === idx;
          const isHovered = hoveredIdx === idx;

          // Folded offset: roughly 1/3 overlap
          const foldedTop = idx * 55;
          const foldedScale = 1 - idx * 0.035;
          const foldedZIndex = (STUDY_FOLIOS.length - idx) * 10;
          const foldedOpacity = 1 - idx * 0.06;

          // Unfolded offset: stacked vertically so full card details can be read
          const unfoldedTop = idx * 175;
          const unfoldedScale = 1;
          const unfoldedZIndex = isSelected ? 50 : 20;

          // Compute dynamic hover transforms and heights
          const currentTop = isExpanded ? `${unfoldedTop}px` : `${foldedTop}px`;
          const currentZIndex = isHovered
            ? 80
            : isExpanded
            ? unfoldedZIndex
            : foldedZIndex;

          const currentTransform = isHovered
            ? isExpanded
              ? 'scale(1.025) translateY(-6px)'
              : `scale(${foldedScale * 1.035}) translateY(-10px)`
            : isExpanded
            ? `scale(${unfoldedScale}) translateY(0px)`
            : `scale(${foldedScale}) translateY(0px)`;

          return (
            <div
              key={folio.id}
              onClick={(e) => handleCardClick(idx, e)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`absolute inset-x-0 rounded-2xl p-5 flex flex-col justify-between border backdrop-blur-xl group cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isHovered
                  ? 'border-[#f2ca50] bg-gradient-to-br from-[#293245] via-[#20293b] to-[#182032] shadow-[0_28px_60px_-10px_rgba(242,202,80,0.24),0_18px_45px_-5px_rgba(0,0,0,0.85)] ring-1 ring-[#f2ca50]/60'
                  : isSelected && isExpanded
                  ? 'border-[#f2ca50] bg-[#232a3a] ring-1 ring-[#f2ca50]/50 shadow-2xl'
                  : idx === 0
                  ? 'border-[#f2ca50]/30 bg-[#232a3a]/95 shadow-2xl'
                  : 'border-[#4d4635]/40 bg-[#191f2f]/95 shadow-xl'
              }`}
              style={{
                top: currentTop,
                transform: currentTransform,
                zIndex: currentZIndex,
                opacity: isExpanded ? 1 : foldedOpacity,
                transitionDelay: isHovered || hoveredIdx !== null ? '0ms' : `${idx * 45}ms`
              }}
            >
              {/* Luminous Top Gold Filament on Hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f2ca50] to-transparent transition-opacity duration-300 pointer-events-none ${
                  isHovered ? 'opacity-100 shadow-[0_0_12px_#f2ca50]' : 'opacity-0'
                }`}
              />

              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                      isHovered
                        ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.4)]'
                        : idx === 0
                        ? 'bg-[#f2ca50]/20 text-[#f2ca50]'
                        : 'bg-[#151b2b] text-[#d4c78f]'
                    }`}
                  >
                    {folio.badge}
                  </span>
                  <span className="text-[11px] text-[#d0c5af] group-hover:text-amber-200 transition-colors">
                    {folio.duration}
                  </span>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-xs transition-all duration-300 ${
                    isHovered
                      ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_10px_rgba(242,202,80,0.5)] scale-110'
                      : 'bg-[#151b2b] border border-[#4d4635]/40 text-[#f2ca50]'
                  }`}
                >
                  {folio.folioRoman}
                </div>
              </div>

              {/* Title & Description */}
              <div className="my-2">
                <div className="flex items-center gap-1.5 text-xs text-[#d4c78f] font-semibold uppercase tracking-widest mb-1 group-hover:text-[#ffe082] transition-colors">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                    {folio.iconName}
                  </span>
                  {folio.accent}
                </div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-[#dce2f8] leading-tight group-hover:text-white transition-colors">
                  {folio.title}
                </h3>
                <p className="text-xs text-[#d0c5af]/80 mt-1 line-clamp-2 leading-relaxed group-hover:text-[#e8e2d5] transition-colors">
                  {folio.subtitle}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2e3545]/60 group-hover:border-[#f2ca50]/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] border border-[#4d4635]/40 group-hover:border-[#f2ca50]/50 transition-colors">
                    {folio.level}
                  </span>
                  <span className="text-xs text-[#d0c5af] group-hover:text-[#e0d6c3] transition-colors">
                    {folio.lexemes}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFolioStudy(folio);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md transition-all duration-300 active:scale-95 ${
                    isHovered
                      ? 'bg-gradient-to-r from-[#ffe088] via-[#f2ca50] to-[#e6b82e] text-[#2c2000] shadow-[0_0_16px_rgba(242,202,80,0.5)] scale-105'
                      : 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088]'
                  }`}
                >
                  <span>Étudier</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-0.5">
                    menu_book
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
