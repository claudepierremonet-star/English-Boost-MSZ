import React, { useState, useEffect } from 'react';
import {
  speakText,
  speakFrenchText,
  stopSpeech,
  subscribeToSpeechState,
  getAutoPlayOnDisplay,
  setAutoPlayOnDisplay,
  peekNextAlternatingAccent,
  triggerAutoPlayIfEnabled,
  type AccentType
} from '../services/speechService';

export const QuoteSection: React.FC = () => {
  const quoteEnglish = "Elegance is not solely an aesthetic, but an art of disciplined expression.";
  const quoteFrench = "L'élégance n'est pas un simple apparat, mais l'art suprême d'une pensée souveraine.";

  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);
  const [activeAccent, setActiveAccent] = useState<AccentType | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(getAutoPlayOnDisplay());

  useEffect(() => {
    const unsubscribe = subscribeToSpeechState((curId, curAccent) => {
      setActiveSpeechKey(curId);
      setActiveAccent(curAccent);
    });

    // Lecture audio automatique alternée dès l'affichage si activée dans les paramètres
    triggerAutoPlayIfEnabled(quoteEnglish, 'quote-en', 600);

    return () => unsubscribe();
  }, []);

  const handleToggleAutoPlay = () => {
    const next = !isAutoPlay;
    setIsAutoPlay(next);
    setAutoPlayOnDisplay(next);
    if (next) {
      // Immediately test-play with next alternating accent
      triggerAutoPlayIfEnabled(quoteEnglish, 'quote-en', 150);
    }
  };

  const isPlayingUK = activeSpeechKey === 'quote-en' && activeAccent === 'en-GB';
  const isPlayingUS = activeSpeechKey === 'quote-en' && activeAccent === 'en-US';
  const isPlayingFR = activeSpeechKey === 'quote-fr';
  const isAnyPlaying = isPlayingUK || isPlayingUS || isPlayingFR;

  const handlePlayEnglish = (accent: AccentType) => {
    if ((accent === 'en-GB' && isPlayingUK) || (accent === 'en-US' && isPlayingUS)) {
      stopSpeech();
      return;
    }
    speakText(quoteEnglish, accent, 'quote-en');
  };

  const handlePlayFrench = () => {
    if (isPlayingFR) {
      stopSpeech();
      return;
    }
    speakFrenchText(quoteFrench, 'quote-fr');
  };

  return (
    <section className="px-4 sm:px-6 py-3 select-none">
      <div className="relative p-5 sm:p-7 rounded-2xl bg-[#151b2b] shadow-2xl border border-[#4d4635]/40 overflow-hidden backdrop-blur-md">
        {/* Subtle Ambient Gold Backlight */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none" />

        {/* Large Decorative Serif Quotation Mark */}
        <span
          aria-hidden="true"
          className="font-serif text-7xl sm:text-8xl text-[#f2ca50]/10 select-none absolute -top-2 left-3 pointer-events-none"
        >
          “
        </span>

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Row: Title & Bilingual Speakers Suite */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#232a3a]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] shadow-[0_0_8px_#f2ca50]" />
              <span className="text-[11px] uppercase tracking-widest text-[#f2ca50] font-bold font-sans">
                Épître du Jour &bull; Lecture Audio Bilingue
              </span>
            </div>

            {/* Dedicated Haut-Parleurs Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Premier haut-parleur : English British (UK 🇬🇧) */}
              <button
                type="button"
                onClick={() => handlePlayEnglish('en-GB')}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-sm ${
                  isPlayingUK
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/30 scale-105 animate-pulse'
                    : 'bg-[#1e2538] hover:bg-[#28324a] text-[#f2ca50] border-[#f2ca50]/35 hover:border-[#f2ca50]'
                }`}
                title="1er haut-parleur : Écouter la citation en Anglais Britannique (Oxford RP)"
              >
                <span className="text-sm">🇬🇧</span>
                <span>British (UK)</span>
                <span className="material-symbols-outlined text-[15px]">
                  {isPlayingUK ? 'graphic_eq' : 'volume_up'}
                </span>
              </button>

              {/* Deuxième haut-parleur : English American (US 🇺🇸) */}
              <button
                type="button"
                onClick={() => handlePlayEnglish('en-US')}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-sm ${
                  isPlayingUS
                    ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] shadow-md shadow-[#38bdf8]/30 scale-105 animate-pulse'
                    : 'bg-[#1e2538] hover:bg-[#28324a] text-[#38bdf8] border-[#38bdf8]/35 hover:border-[#38bdf8]'
                }`}
                title="2e haut-parleur : Écouter la citation en Anglais Américain authentique (General American)"
              >
                <span className="text-sm">🇺🇸</span>
                <span>American (US)</span>
                <span className="material-symbols-outlined text-[15px]">
                  {isPlayingUS ? 'graphic_eq' : 'volume_up'}
                </span>
              </button>

              {/* Haut-parleur Traduction Française (FR 🇫🇷) */}
              <button
                type="button"
                onClick={handlePlayFrench}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-medium transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-sm ${
                  isPlayingFR
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 scale-105 animate-pulse'
                    : 'bg-[#192233] hover:bg-[#232f46] text-[#dce2f8] border-[#374461] hover:border-[#4d5e85]'
                }`}
                title="Écouter la traduction en français"
              >
                <span className="text-sm">🇫🇷</span>
                <span className="hidden sm:inline">Français</span>
                <span className="material-symbols-outlined text-[15px]">
                  {isPlayingFR ? 'graphic_eq' : 'volume_up'}
                </span>
              </button>

              {/* Séparateur discret */}
              <div className="h-5 w-[1px] bg-[#2e3b55] hidden sm:block mx-0.5" />

              {/* Bouton Toggle Lecture Auto Alternée (Paramètre Rapide) */}
              <button
                type="button"
                onClick={handleToggleAutoPlay}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-sm ${
                  isAutoPlay
                    ? 'bg-[#15233e] text-[#f2ca50] border-[#f2ca50]/50 shadow-[0_0_10px_rgba(242,202,80,0.2)]'
                    : 'bg-[#121824] hover:bg-[#1a2233] text-[#78859e] border-[#252f44]'
                }`}
                title={
                  isAutoPlay
                    ? `Lecture automatique active (Alternance 50/50 🇬🇧/🇺🇸 • Prochain: ${
                        peekNextAlternatingAccent() === 'en-GB' ? 'UK 🇬🇧' : 'US 🇺🇸'
                      }) - Cliquer pour désactiver`
                    : "Activer la lecture audio automatique à l'affichage (Alternance 🇬🇧/🇺🇸)"
                }
              >
                <span className="material-symbols-outlined text-sm">
                  {isAutoPlay ? 'autoplay' : 'motion_photos_off'}
                </span>
                <span className="hidden md:inline">
                  {isAutoPlay ? 'Auto: 🇬🇧⇄🇺🇸' : 'Auto: Off'}
                </span>
                {isAutoPlay && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-ping" />
                )}
              </button>

              {/* Stop Button if anything is playing */}
              {isAnyPlaying && (
                <button
                  type="button"
                  onClick={() => stopSpeech()}
                  className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                  title="Arrêter la lecture"
                >
                  <span className="material-symbols-outlined text-sm">stop</span>
                </button>
              )}
            </div>
          </div>

          {/* Bilingual Quote Display */}
          <div className="space-y-2">
            {/* English Sentence */}
            <div className="relative group">
              <blockquote className="font-serif text-lg sm:text-xl italic text-[#ffffff] leading-snug drop-shadow-sm font-normal">
                “{quoteEnglish}”
              </blockquote>
            </div>

            {/* French Translation */}
            <p className="font-sans text-sm text-[#d4c78f] italic leading-relaxed border-l-2 border-[#f2ca50]/40 pl-3">
              « {quoteFrench} »
            </p>
          </div>

          {/* Active Audio Waveform & Phonetic Breakdown Strip */}
          {isAnyPlaying && (
            <div className="p-3 rounded-xl bg-[#0d1424] border border-[#f2ca50]/30 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {isPlayingUK ? '🇬🇧' : isPlayingUS ? '🇺🇸' : '🇫🇷'}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-white font-mono">
                    {isPlayingUK
                      ? 'Lecture : Anglais Britannique (Received Pronunciation / Oxford)'
                      : isPlayingUS
                      ? 'Lecture : Anglais Américain (General American / Rhotisme /r/)'
                      : 'Lecture : Traduction Française'}
                  </span>
                  <span className="text-[10px] text-[#94a3b8] font-mono">
                    {isPlayingUK
                      ? 'Remarquez le /ɑːt/ non-rhôtique et l\'articulation haute'
                      : isPlayingUS
                      ? 'Remarquez le rhotisme dans /ˈɑːrt/ et le flap dans /ɛsˈθɛt̬ɪk/'
                      : 'Élocution littéraire française'}
                  </span>
                </div>
              </div>

              {/* Animated Waveform Bars */}
              <div className="flex items-center gap-1 self-end sm:self-center">
                {[12, 22, 16, 26, 18, 24, 14, 20, 28, 16].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full animate-pulse ${
                      isPlayingUK
                        ? 'bg-[#f2ca50]'
                        : isPlayingUS
                        ? 'bg-[#38bdf8]'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 90}ms`,
                      animationDuration: '600ms'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attribution & Philological Context */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232a3a]/80 text-xs text-[#99907c] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] font-serif font-bold text-xs">
                E
              </div>
              <span className="text-[#dce2f8] font-medium font-sans">
                Lord Chesterfield &bull; Letters to his Son
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>1774</span>
              <span>&bull;</span>
              <span className="text-[#f2ca50]">CEFR C2 Rhétorique</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
