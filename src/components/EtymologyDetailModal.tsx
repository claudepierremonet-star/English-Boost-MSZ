import React from 'react';
import type { FlashcardItem } from '../data/curriculum';
import { analyzeEtymology } from '../utils/etymologyHelper';
import { DualSpeakerButton } from './DualSpeakerButton';
import { speakFrenchText } from '../services/speechService';

interface EtymologyDetailModalProps {
  card: FlashcardItem;
  isOpen: boolean;
  onClose: () => void;
}

export const EtymologyDetailModal: React.FC<EtymologyDetailModalProps> = ({
  card,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const analysis = analyzeEtymology(card.term, card.etymology, card.category);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080d18]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn select-none">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#141d30] via-[#0f1728] to-[#090e1b] border-2 border-[#f2ca50]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(242,202,80,0.2)] p-5 sm:p-7 flex flex-col gap-4 text-[#dce2f8] overflow-hidden"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 25px rgba(242, 202, 80, 0.25)'
        }}
      >
        {/* Decorative Ambient Aura */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#f2ca50] to-transparent shadow-[0_0_15px_#f2ca50]" />
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#f2ca50]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Top Bar: Badge & Close Button */}
        <div className="flex items-center justify-between gap-2 border-b border-[#232f48] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/20 border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-inner">
              <span className="material-symbols-outlined text-lg">history_edu</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                PHILOLOGIE & ANCRAGE MNÉSIQUE
              </span>
              <h3 className="font-serif font-bold text-base text-white">
                Origine Étymologique
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1b263b] hover:bg-[#2b3a56] text-[#8e9bb3] hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
            title="Fermer la fiche étymologique"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Term & Audio Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b1220] border border-[#212d46]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif font-black text-2xl text-[#f2ca50]">
                « {card.term} »
              </h2>
              <span className="text-xs font-mono italic text-[#8e9bb3]">
                {card.phonetic}
              </span>
            </div>
            <p className="text-xs text-[#cbd5e1] mt-0.5">
              Sens français : <strong className="text-white">« {card.frenchDef} »</strong>
            </p>
          </div>

          <DualSpeakerButton
            text={card.term}
            id={`etym-modal-audio-${card.id}`}
            variant="pill"
          />
        </div>

        {/* Origin Badge & Era */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 shadow-sm ${analysis.originBadge.bg} ${analysis.originBadge.color} ${analysis.originBadge.border}`}
          >
            <span className="material-symbols-outlined text-sm">
              {analysis.originBadge.icon}
            </span>
            <span>{analysis.originBadge.label}</span>
          </span>

          <span className="text-[10px] font-mono text-[#cbd5e1] flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#f2ca50]">schedule</span>
            <span>{analysis.historicalCentury}</span>
          </span>
        </div>

        {/* Main Philological Text Box */}
        <div className="p-4 rounded-2xl bg-[#090f1d] border border-[#253350] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#f2ca50] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">import_contacts</span>
              <span>Filiation & Racines Anciennes</span>
            </span>

            {/* Read aloud in French */}
            <button
              type="button"
              onClick={() => {
                speakFrenchText(card.etymology, `etym-read-${card.id}`);
              }}
              className="px-2 py-0.5 rounded-md bg-[#192338] hover:bg-[#253556] border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Écouter l'explication en voix française authentique"
            >
              <span>🇫🇷</span>
              <span>Écouter</span>
              <span className="material-symbols-outlined text-xs">volume_up</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#f1f5f9] leading-relaxed font-sans">
            {card.etymology}
          </p>

          {/* Morphological Breakdown (Prefix + Root + Suffix) */}
          {(analysis.morphologicalBreakdown.prefix || analysis.morphologicalBreakdown.suffix) && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs font-mono">
              {analysis.morphologicalBreakdown.prefix && (
                <div className="px-2 py-1 rounded-lg bg-[#141f35] border border-white/10 text-[#7dd3fc]">
                  <strong className="text-white">{analysis.morphologicalBreakdown.prefix}</strong>{' '}
                  <span className="text-[10px] text-[#94a3b8]">({analysis.morphologicalBreakdown.prefixMeaning})</span>
                </div>
              )}
              <div className="px-2 py-1 rounded-lg bg-[#272111] border border-[#f2ca50]/40 text-[#f2ca50]">
                <strong className="text-white">{analysis.morphologicalBreakdown.coreRoot}</strong>{' '}
                <span className="text-[10px] text-amber-200/80">(radical porteur de sens)</span>
              </div>
              {analysis.morphologicalBreakdown.suffix && (
                <div className="px-2 py-1 rounded-lg bg-[#141f35] border border-white/10 text-[#c084fc]">
                  <strong className="text-white">{analysis.morphologicalBreakdown.suffix}</strong>{' '}
                  <span className="text-[10px] text-[#94a3b8]">({analysis.morphologicalBreakdown.suffixMeaning})</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cognates & Words sharing the root */}
        {analysis.cognateWords && analysis.cognateWords.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#0c1424] border border-[#212f4c]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">hub</span>
                <span>Filiation Lexicale & Mots Apparentés (Cognats)</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {analysis.cognateWords.map((cog, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#17223b] border border-[#2e3f64] text-[11px] font-mono text-[#cbd5e1] hover:text-[#f2ca50] transition-colors"
                >
                  {cog}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cognitive Anchor Tip (Astuce Mnémotechnique) */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#f2ca50] text-lg mt-0.5 shrink-0">
            psychology
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#f2ca50] block">
              Levier Cognitif de Mémorisation
            </span>
            <p className="text-xs text-[#ffe082] leading-relaxed mt-0.5">
              {analysis.cognitiveAnchorTip}
            </p>
          </div>
        </div>

        {/* Close Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#2c1e00] font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Fermer & Reprendre l'Étude
          </button>
        </div>
      </div>
    </div>
  );
};
