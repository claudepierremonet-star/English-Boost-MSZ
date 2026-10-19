import React, { useState } from 'react';

export const QuoteSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const quoteEnglish = "Elegance is not solely an aesthetic, but an art of disciplined expression.";

  const playSpeech = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(quoteEnglish);
      utterance.lang = 'en-GB';
      utterance.rate = 0.88;
      utterance.pitch = 0.95;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2500);
    }
  };

  return (
    <section className="px-4 sm:px-6 py-3">
      <div className="relative p-5 sm:p-6 rounded-2xl bg-[#151b2b] shadow-xl border border-[#4d4635]/30 overflow-hidden backdrop-blur-md">
        {/* Large Decorative Serif Quotation Mark */}
        <span
          aria-hidden="true"
          className="font-serif text-7xl sm:text-8xl text-[#f2ca50]/10 select-none absolute -top-2 left-3 pointer-events-none"
        >
          “
        </span>

        <div className="relative z-10 flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-[#f2ca50] font-bold flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]" />
              Épître du Jour
            </span>

            {/* Prononciation RP Audio Trigger */}
            <button
              type="button"
              onClick={playSpeech}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all active:scale-95 border ${
                isPlaying
                  ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/20'
                  : 'bg-[#232a3a] text-[#d4c78f] border-[#4d4635]/40 hover:text-[#f2ca50]'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${isPlaying ? 'animate-pulse' : ''}`}>
                {isPlaying ? 'graphic_eq' : 'volume_up'}
              </span>
              <span className="font-semibold">{isPlaying ? 'En écoute...' : 'Prononciation RP'}</span>
            </button>
          </div>

          {/* Bilingual Quote */}
          <blockquote className="font-serif text-lg sm:text-xl italic text-[#dce2f8] leading-snug">
            “{quoteEnglish}”
          </blockquote>

          <p className="font-sans text-sm text-[#d4c78f]/90 italic leading-relaxed">
            « L'élégance n'est pas un simple apparat, mais l'art suprême d'une pensée souveraine. »
          </p>

          {/* Attribution */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232a3a]/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] font-serif font-bold text-xs">
                E
              </div>
              <span className="text-xs text-[#dce2f8] font-medium font-sans">
                Lord Chesterfield • Letters to his Son
              </span>
            </div>
            <span className="text-xs text-[#99907c] font-mono">1774</span>
          </div>
        </div>
      </div>
    </section>
  );
};
