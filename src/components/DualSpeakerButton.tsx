import React, { useState, useEffect } from 'react';
import {
  speakText,
  subscribeToSpeechState,
  type AccentType,
  ACCENTS_INFO
} from '../services/speechService';

export interface DualSpeakerButtonProps {
  /** English text to pronounce */
  text: string;
  /** Unique element ID for tracking audio state */
  id: string;
  /** Optional French translation or linguistic explanation */
  explanation?: string;
  /** Optional phonetic transcription (e.g. /pəˈspɪkəs/) */
  phonetic?: string;
  /** Visual variant */
  variant?: 'compact' | 'pill' | 'minimal' | 'prominent';
  /** Optional playback rate override */
  rate?: number;
  /** Extra CSS classes */
  className?: string;
  /** Optional callback when speaking starts */
  onStart?: (accent: AccentType) => void;
  /** Optional callback when speaking finishes */
  onEnd?: () => void;
}

export const DualSpeakerButton: React.FC<DualSpeakerButtonProps> = ({
  text,
  id,
  explanation,
  phonetic,
  variant = 'compact',
  rate,
  className = '',
  onStart,
  onEnd
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAccent, setActiveAccent] = useState<AccentType | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToSpeechState((curId, curAccent) => {
      setActiveId(curId);
      setActiveAccent(curAccent);
    });
    return () => unsubscribe();
  }, []);

  const isPlayingUK = activeId === id && activeAccent === 'en-GB';
  const isPlayingUS = activeId === id && activeAccent === 'en-US';

  const handleSpeak = (accent: AccentType, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(true);
    speakText(text, accent, id, {
      rate,
      onStart: () => {
        onStart?.(accent);
      },
      onEnd: () => {
        setTimeout(() => setShowTooltip(false), 1200);
        onEnd?.();
      },
      onError: () => {
        setShowTooltip(false);
        onEnd?.();
      }
    });
  };

  // Explanation banner shown when speaking
  const renderActiveExplanationTooltip = () => {
    if (!showTooltip && !isPlayingUK && !isPlayingUS) return null;
    const accent = isPlayingUK ? 'en-GB' : 'en-US';
    const info = ACCENTS_INFO[accent];

    return (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none px-3 py-1.5 rounded-xl bg-[#0c1322]/98 border border-[#f2ca50]/70 text-[11px] shadow-2xl backdrop-blur-xl animate-fadeIn whitespace-nowrap flex flex-col gap-0.5 min-w-[200px] text-center">
        <div className="flex items-center justify-center gap-1.5 font-bold font-mono">
          <span className="text-sm">{info.flag}</span>
          <span className={accent === 'en-GB' ? 'text-[#f2ca50]' : 'text-[#38bdf8]'}>
            {info.label} ({info.region})
          </span>
        </div>
        {phonetic && (
          <div className="font-mono text-[10px] text-amber-200/90 italic">
            Phonétique : {phonetic}
          </div>
        )}
        {explanation && (
          <div className="text-[10px] text-[#dce2f8]/90 font-sans italic border-t border-white/10 pt-0.5 mt-0.5">
            « {explanation} »
          </div>
        )}
        <div className="text-[9px] text-[#94a3b8] font-mono">
          {accent === 'en-GB'
            ? '🇬🇧 Oxford RP pur • Voyelles allongées non-rhôtiques'
            : '🇺🇸 General American • Rhotisme rétroflexe /r/ & Flap T [ɾ]'}
        </div>
      </div>
    );
  };

  // Minimal variant: Just two small icon buttons [🇬🇧 🔊] [🇺🇸 🔊]
  if (variant === 'minimal') {
    return (
      <div className={`relative inline-flex items-center gap-1 ${className}`}>
        {renderActiveExplanationTooltip()}
        {/* Premier haut-parleur: British (UK 🇬🇧) */}
        <button
          type="button"
          onClick={(e) => handleSpeak('en-GB', e)}
          className={`p-1 rounded-md transition-all flex items-center justify-center cursor-pointer ${
            isPlayingUK
              ? 'bg-[#f2ca50] text-[#3c2f00] ring-1 ring-[#f2ca50] scale-105 animate-pulse'
              : 'hover:bg-[#f2ca50]/20 text-[#f2ca50] hover:text-[#ffe088]'
          }`}
          title="1er haut-parleur : Anglais Britannique (UK 🇬🇧)"
        >
          <span className="text-[11px] mr-0.5">🇬🇧</span>
          <span className="material-symbols-outlined text-[13px]">
            {isPlayingUK ? 'graphic_eq' : 'volume_up'}
          </span>
        </button>

        {/* Deuxième haut-parleur: American (US 🇺🇸) */}
        <button
          type="button"
          onClick={(e) => handleSpeak('en-US', e)}
          className={`p-1 rounded-md transition-all flex items-center justify-center cursor-pointer ${
            isPlayingUS
              ? 'bg-[#38bdf8] text-[#0c1322] ring-1 ring-[#38bdf8] scale-105 animate-pulse'
              : 'hover:bg-[#38bdf8]/20 text-[#38bdf8] hover:text-[#7dd3fc]'
          }`}
          title="2e haut-parleur : Anglais Américain (US 🇺🇸)"
        >
          <span className="text-[11px] mr-0.5">🇺🇸</span>
          <span className="material-symbols-outlined text-[13px]">
            {isPlayingUS ? 'graphic_eq' : 'volume_up'}
          </span>
        </button>
      </div>
    );
  }

  // Pill variant: Sleek paired buttons with text labels [🇬🇧 UK] [🇺🇸 US]
  if (variant === 'pill') {
    return (
      <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
        {renderActiveExplanationTooltip()}
        {/* Premier haut-parleur: British English */}
        <button
          type="button"
          onClick={(e) => handleSpeak('en-GB', e)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer border ${
            isPlayingUK
              ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/20 scale-105 animate-pulse'
              : 'bg-[#191f2f]/90 hover:bg-[#232a3a] text-[#f2ca50] border-[#f2ca50]/40 hover:border-[#f2ca50]'
          }`}
          title="1er haut-parleur : Écouter en Anglais Britannique (UK 🇬🇧 - Oxford RP)"
        >
          <span className="text-xs">🇬🇧</span>
          <span>UK</span>
          <span className="material-symbols-outlined text-[13px]">
            {isPlayingUK ? 'graphic_eq' : 'volume_up'}
          </span>
        </button>

        {/* Deuxième haut-parleur: American English */}
        <button
          type="button"
          onClick={(e) => handleSpeak('en-US', e)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer border ${
            isPlayingUS
              ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] shadow-md shadow-[#38bdf8]/20 scale-105 animate-pulse'
              : 'bg-[#191f2f]/90 hover:bg-[#232a3a] text-[#38bdf8] border-[#38bdf8]/40 hover:border-[#38bdf8]'
          }`}
          title="2e haut-parleur : Écouter en Anglais Américain (US 🇺🇸 - General American)"
        >
          <span className="text-xs">🇺🇸</span>
          <span>US</span>
          <span className="material-symbols-outlined text-[13px]">
            {isPlayingUS ? 'graphic_eq' : 'volume_up'}
          </span>
        </button>
      </div>
    );
  }

  // Prominent variant: Detailed dual audio panel with explanation
  if (variant === 'prominent') {
    return (
      <div className={`p-4 rounded-xl bg-[#121927]/95 border border-[#f2ca50]/40 shadow-xl ${className}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#f2ca50] font-bold">
              Double Haut-Parleur : Comparaison des 2 Accents
            </span>
            {phonetic && (
              <span className="text-xs font-mono italic text-[#d4af37]">
                {phonetic}
              </span>
            )}
          </div>

          {/* Two Distinct Speakers: Premier (UK) & Deuxième (US) */}
          <div className="flex items-center gap-2.5">
            {/* Premier haut-parleur : UK */}
            <button
              type="button"
              onClick={(e) => handleSpeak('en-GB', e)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isPlayingUK
                  ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/30 scale-105'
                  : 'bg-[#1a2337] hover:bg-[#232f48] text-[#f2ca50] border-[#f2ca50]/40'
              }`}
              title="Premier haut-parleur : Prononciation Britannique (Received Pronunciation / Oxford)"
            >
              <span className="text-base">🇬🇧</span>
              <span>English British</span>
              <span className="material-symbols-outlined text-sm">
                {isPlayingUK ? 'graphic_eq' : 'volume_up'}
              </span>
            </button>

            {/* Deuxième haut-parleur : US */}
            <button
              type="button"
              onClick={(e) => handleSpeak('en-US', e)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isPlayingUS
                  ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] shadow-md shadow-[#38bdf8]/30 scale-105'
                  : 'bg-[#1a2337] hover:bg-[#232f48] text-[#38bdf8] border-[#38bdf8]/40'
              }`}
              title="Deuxième haut-parleur : Prononciation Américaine (General American)"
            >
              <span className="text-base">🇺🇸</span>
              <span>English American</span>
              <span className="material-symbols-outlined text-sm">
                {isPlayingUS ? 'graphic_eq' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>

        {/* Explanation of the Phrase / Word & Phonetic comparison */}
        <div className="mt-3 pt-2.5 border-t border-[#232e44] flex items-center justify-between text-xs text-[#dce2f8]/85 flex-wrap gap-2">
          {explanation ? (
            <span className="italic">« {explanation} »</span>
          ) : (
            <span className="text-[11px] text-[#a4b1cd]">Appuyez sur chaque haut-parleur pour comparer les intonations et le rhotisme.</span>
          )}
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0c1322] border border-[#f2ca50]/20 text-[#f2ca50]">
            {isPlayingUK
              ? '🇬🇧 Accent britannique (RP) en cours'
              : isPlayingUS
              ? '🇺🇸 Accent américain (US) en cours'
              : '🇬🇧 1er HP : British • 🇺🇸 2e HP : American'}
          </span>
        </div>
      </div>
    );
  }

  // Default compact variant: Paired capsule buttons [🇬🇧 🔊] [🇺🇸 🔊]
  return (
    <div className={`relative inline-flex items-center gap-1 bg-[#0c1322]/80 p-0.5 rounded-lg border border-[#f2ca50]/25 hover:border-[#f2ca50]/60 transition-colors ${className}`}>
      {renderActiveExplanationTooltip()}
      {/* Premier haut-parleur : British English */}
      <button
        type="button"
        onClick={(e) => handleSpeak('en-GB', e)}
        className={`px-1.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
          isPlayingUK
            ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm animate-pulse'
            : 'text-[#f2ca50] hover:bg-[#f2ca50]/20'
        }`}
        title="1er haut-parleur : Anglais Britannique (UK 🇬🇧)"
        aria-label={`Écouter en anglais britannique: ${text}`}
      >
        <span className="text-xs">🇬🇧</span>
        <span className="material-symbols-outlined text-[13px]">
          {isPlayingUK ? 'graphic_eq' : 'volume_up'}
        </span>
      </button>

      {/* Deuxième haut-parleur : American English */}
      <button
        type="button"
        onClick={(e) => handleSpeak('en-US', e)}
        className={`px-1.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
          isPlayingUS
            ? 'bg-[#38bdf8] text-[#0c1322] shadow-sm animate-pulse'
            : 'text-[#38bdf8] hover:bg-[#38bdf8]/20'
        }`}
        title="2e haut-parleur : Anglais Américain (US 🇺🇸)"
        aria-label={`Écouter en anglais américain: ${text}`}
      >
        <span className="text-xs">🇺🇸</span>
        <span className="material-symbols-outlined text-[13px]">
          {isPlayingUS ? 'graphic_eq' : 'volume_up'}
        </span>
      </button>
    </div>
  );
};
