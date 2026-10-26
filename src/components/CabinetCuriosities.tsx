import React from 'react';
import { CURIOSITIES, type CurioWord } from '../data/curriculum';
import { DualSpeakerButton } from './DualSpeakerButton';

interface CabinetCuriositiesProps {
  onWordClick?: (word: CurioWord) => void;
}

export const CabinetCuriosities: React.FC<CabinetCuriositiesProps> = ({ onWordClick }) => {

  return (
    <section className="px-4 sm:px-6 pb-6 select-none">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] text-[#f2ca50] uppercase tracking-widest font-bold">
            Haut Lexique C2
          </span>
          <h3 className="font-serif text-lg sm:text-xl text-[#dce2f8] font-bold tracking-tight">
            Cabinet de Curiosités Verbales
          </h3>
        </div>
        <span className="text-xs text-[#d4c78f] font-mono uppercase tracking-wider font-semibold">
          {CURIOSITIES.length} Trésors
        </span>
      </div>

      {/* Grid of Rare Words */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CURIOSITIES.slice(0, 4).map((word, idx) => (
            <div
              key={word.id}
              onClick={() => onWordClick?.(word)}
              className="p-4 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#4d4635]/40 transition-all flex flex-col justify-between shadow-md cursor-pointer group active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-mono">
                    Lemme {idx + 1} • {word.level}
                  </span>
                  <DualSpeakerButton
                    text={word.term}
                    id={`curio-${word.id}`}
                    phonetic={word.phonetic}
                    explanation={word.frenchDef}
                    variant="compact"
                  />
                </div>

                <h4 className="font-serif text-lg font-bold text-[#f2ca50] group-hover:text-[#ffe088] transition-colors">
                  {word.term}
                </h4>
                <p className="text-xs text-[#d0c5af]/80 font-mono italic mt-0.5">
                  {word.phonetic}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#232a3a]">
                <p className="text-xs text-[#dce2f8] line-clamp-2 leading-relaxed">
                  {word.frenchDef}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#d4c78f] mt-2 pt-1 font-sans">
                  <span className="italic truncate">{word.collocation}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#070e1d] text-[#f2ca50]">
                    CEFR {word.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};
