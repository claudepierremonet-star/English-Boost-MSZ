import React, { useState, useEffect, useRef } from 'react';
import {
  speakText,
  speakFrenchText,
  stopSpeech,
  subscribeToSpeechState,
  getBestVoice,
  getSelectedVoicePersona,
  getAutoPlayOnDisplay,
  setAutoPlayOnDisplay,
  peekNextAlternatingAccent,
  triggerAutoPlayIfEnabled,
  type AccentType
} from '../services/speechService';
import {
  buildFavoriteQuoteId,
  getFavoriteQuotes,
  subscribeToFavoriteQuotes,
  toggleFavoriteQuote,
  type ChesterfieldQuote,
  type FavoriteQuoteItem
} from '../utils/favoriteQuotesManager';
import { playSelectCue } from '../utils/soundEffects';

interface RhetoricalFigure {
  name: string;
  excerpt: string;
  explanationFr: string;
}

interface QuoteRhetoricAnalysis {
  registerLabel: string;
  styleOverviewFr: string;
  figuresOfSpeech: RhetoricalFigure[];
  registerAnalysisFr: string;
  keyTakeawayFr: string;
}

const INITIAL_QUOTE: ChesterfieldQuote = {
  quoteEn: 'Elegance is not solely an aesthetic, but an art of disciplined expression.',
  quoteFr: "L'élégance n'est pas un simple apparat, mais l'art suprême d'une pensée souveraine.",
  sourceWork: 'Letters to his Son',
  year: '1774',
  cefrFocus: 'CEFR C2 Rhétorique',
  phoneticNoteUk: "Remarquez le /ɑːt/ non-rhôtique et l'articulation haute",
  phoneticNoteUs: 'Remarquez le rhotisme dans /ˈɑːrt/ et le flap dans /ɛsˈθɛt̬ɪk/'
};

export const QuoteSection: React.FC = () => {
  const [quoteHistory, setQuoteHistory] = useState<ChesterfieldQuote[]>([INITIAL_QUOTE]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);
  const [activeAccent, setActiveAccent] = useState<AccentType | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(getAutoPlayOnDisplay());
  const [favorites, setFavorites] = useState<FavoriteQuoteItem[]>(() => getFavoriteQuotes());
  const [favoriteNotice, setFavoriteNotice] = useState<string | null>(null);
  const favoriteNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rhetoricCache, setRhetoricCache] = useState<Record<string, QuoteRhetoricAnalysis>>({});
  const [isRhetoricOpen, setIsRhetoricOpen] = useState<boolean>(false);
  const [isAnalyzingRhetoric, setIsAnalyzingRhetoric] = useState<boolean>(false);
  const [rhetoricError, setRhetoricError] = useState<string | null>(null);
  const [selectedTtsAccent, setSelectedTtsAccent] = useState<AccentType>('en-GB');
  const [ttsRateMultiplier, setTtsRateMultiplier] = useState<number>(1);
  const [ttsVoiceLabel, setTtsVoiceLabel] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const isWebSpeechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const currentQuote = quoteHistory[currentIndex] || INITIAL_QUOTE;
  const quoteEnglish = currentQuote.quoteEn;
  const quoteFrench = currentQuote.quoteFr;
  const currentQuoteId = buildFavoriteQuoteId(quoteEnglish);
  const isCurrentFavorite = favorites.some((item) => item.id === currentQuoteId);
  const currentRhetoric = rhetoricCache[currentQuoteId] || null;

  useEffect(() => {
    const refreshVoiceLabel = () => {
      if (!isWebSpeechSupported) {
        setTtsVoiceLabel(null);
        return;
      }
      const physical = getBestVoice(selectedTtsAccent);
      const persona = getSelectedVoicePersona(selectedTtsAccent);
      setTtsVoiceLabel(
        physical ? `${physical.name} (${physical.lang})` : `${persona.name} • ${selectedTtsAccent}`
      );
    };

    refreshVoiceLabel();
    if (!isWebSpeechSupported) return;

    const synth = window.speechSynthesis;
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', refreshVoiceLabel);
      return () => synth.removeEventListener('voiceschanged', refreshVoiceLabel);
    }
    return undefined;
  }, [selectedTtsAccent, isWebSpeechSupported]);

  useEffect(() => {
    const unsubscribeSpeech = subscribeToSpeechState((curId, curAccent) => {
      setActiveSpeechKey(curId);
      setActiveAccent(curAccent);
      if (curId === 'quote-en' && curAccent) {
        setSelectedTtsAccent(curAccent);
      }
    });
    const unsubscribeFavs = subscribeToFavoriteQuotes((nextFavs) => {
      setFavorites(nextFavs);
    });

    // Lecture audio automatique alternée dès l'affichage si activée dans les paramètres
    if (isWebSpeechSupported) {
      triggerAutoPlayIfEnabled(INITIAL_QUOTE.quoteEn, 'quote-en', 600);
    }

    return () => {
      unsubscribeSpeech();
      unsubscribeFavs();
      if (favoriteNoticeTimerRef.current) clearTimeout(favoriteNoticeTimerRef.current);
    };
  }, [isWebSpeechSupported]);

  const handleToggleFavorite = () => {
    playSelectCue();
    const { isFavorited, favorites: nextFavs } = toggleFavoriteQuote(currentQuote);
    setFavorites(nextFavs);
    setFavoriteNotice(
      isFavorited
        ? 'Citation ajoutée à votre collection dans le Profil.'
        : 'Citation retirée de vos favoris.'
    );
    if (favoriteNoticeTimerRef.current) clearTimeout(favoriteNoticeTimerRef.current);
    favoriteNoticeTimerRef.current = setTimeout(() => setFavoriteNotice(null), 2600);
  };

  const handleToggleAutoPlay = () => {
    const next = !isAutoPlay;
    setIsAutoPlay(next);
    setAutoPlayOnDisplay(next);
    if (next && isWebSpeechSupported) {
      // Immediately test-play with next alternating accent
      triggerAutoPlayIfEnabled(quoteEnglish, 'quote-en', 150);
    }
  };

  const isPlayingUK = activeSpeechKey === 'quote-en' && activeAccent === 'en-GB';
  const isPlayingUS = activeSpeechKey === 'quote-en' && activeAccent === 'en-US';
  const isPlayingFR = activeSpeechKey === 'quote-fr';
  const isAnyPlaying = isPlayingUK || isPlayingUS || isPlayingFR;

  const handlePlayEnglish = (accent: AccentType, rateOverride?: number) => {
    setSelectedTtsAccent(accent);
    setTtsError(null);

    if (!isWebSpeechSupported) {
      setTtsError("La synthèse vocale (Web Speech API) n'est pas prise en charge par ce navigateur.");
      return;
    }

    if (
      rateOverride === undefined &&
      ((accent === 'en-GB' && isPlayingUK) || (accent === 'en-US' && isPlayingUS))
    ) {
      stopSpeech();
      return;
    }

    speakText(quoteEnglish, accent, 'quote-en', {
      rateMultiplier: rateOverride ?? ttsRateMultiplier,
      onError: () => {
        setTtsError(
          "Impossible de lire la citation via Web Speech API. Vérifiez que l'audio n'est pas bloqué."
        );
      }
    });
  };

  const handleSelectTtsSpeed = (speed: number) => {
    playSelectCue();
    setTtsRateMultiplier(speed);
    if (isPlayingUK || isPlayingUS) {
      const currentAccent: AccentType = isPlayingUS ? 'en-US' : 'en-GB';
      stopSpeech();
      window.setTimeout(() => {
        handlePlayEnglish(currentAccent, speed);
      }, 60);
    }
  };

  const handlePlayFrench = () => {
    setTtsError(null);
    if (!isWebSpeechSupported) {
      setTtsError("La synthèse vocale (Web Speech API) n'est pas prise en charge par ce navigateur.");
      return;
    }
    if (isPlayingFR) {
      stopSpeech();
      return;
    }
    speakFrenchText(quoteFrench, 'quote-fr', {
      rateMultiplier: ttsRateMultiplier,
      onError: () => {
        setTtsError('Impossible de lire la traduction française via Web Speech API.');
      }
    });
  };

  const handleAnalyzeRhetoric = async (forceRefresh = false) => {
    playSelectCue();
    if (!forceRefresh && isRhetoricOpen && currentRhetoric && !isAnalyzingRhetoric) {
      setIsRhetoricOpen(false);
      return;
    }

    setIsRhetoricOpen(true);
    setRhetoricError(null);

    if (!forceRefresh && currentRhetoric) {
      return;
    }

    if (isAnalyzingRhetoric) return;

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setRhetoricError('Mode hors-ligne : reconnectez-vous pour analyser la rhétorique via Gemini.');
      return;
    }

    const targetId = currentQuoteId;
    setIsAnalyzingRhetoric(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 16000);

    try {
      const response = await fetch('/api/gemini/chesterfield-rhetoric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteEn: currentQuote.quoteEn,
          quoteFr: currentQuote.quoteFr,
          sourceWork: currentQuote.sourceWork,
          year: currentQuote.year
        }),
        signal: controller.signal
      });

      const data = (await response.json().catch(() => ({}))) as Partial<QuoteRhetoricAnalysis> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || `Impossible d'analyser la rhétorique (${response.status}).`
        );
      }

      if (!data.styleOverviewFr || !data.registerAnalysisFr) {
        throw new Error('Analyse rhétorique incomplète reçue depuis le serveur.');
      }

      const analysis: QuoteRhetoricAnalysis = {
        registerLabel: data.registerLabel?.trim() || 'Soutenu • Prose épistolaire classique',
        styleOverviewFr: data.styleOverviewFr.trim(),
        figuresOfSpeech: Array.isArray(data.figuresOfSpeech) ? data.figuresOfSpeech : [],
        registerAnalysisFr: data.registerAnalysisFr.trim(),
        keyTakeawayFr: data.keyTakeawayFr?.trim() || ''
      };

      setRhetoricCache((prev) => ({
        ...prev,
        [targetId]: analysis
      }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setRhetoricError("Délai d'attente dépassé lors de l'analyse rhétorique.");
      } else {
        setRhetoricError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de l'analyse rhétorique."
        );
      }
    } finally {
      window.clearTimeout(timeout);
      setIsAnalyzingRhetoric(false);
    }
  };

  const handleRefreshQuote = async () => {
    if (isGenerating) return;
    stopSpeech();
    setGenerateError(null);
    setRhetoricError(null);
    setIsRhetoricOpen(false);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setGenerateError('Mode hors-ligne : reconnectez-vous pour générer une nouvelle citation.');
      return;
    }

    setIsGenerating(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/gemini/chesterfield-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excludeQuotes: quoteHistory.slice(-10).map((q) => q.quoteEn)
        }),
        signal: controller.signal
      });

      const data = (await response.json().catch(() => ({}))) as Partial<ChesterfieldQuote> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || `Impossible de générer une nouvelle citation (${response.status}).`
        );
      }

      if (!data.quoteEn || !data.quoteFr) {
        throw new Error('Réponse incomplète reçue lors de la génération de la citation.');
      }

      const nextQuote: ChesterfieldQuote = {
        quoteEn: data.quoteEn.trim(),
        quoteFr: data.quoteFr.trim(),
        sourceWork: data.sourceWork?.trim() || 'Letters to his Son',
        year: data.year?.trim() || '1774',
        cefrFocus: data.cefrFocus?.trim() || 'CEFR C2 Rhétorique',
        phoneticNoteUk:
          data.phoneticNoteUk?.trim() ||
          'Articulation britannique nette et voyelles longues non-rhôtiques.',
        phoneticNoteUs:
          data.phoneticNoteUs?.trim() ||
          'Rhotisme rétroflexe marqué sur les /r/ et cadence fluide américaine.',
        isGenerated: true
      };

      const existingIdx = quoteHistory.findIndex(
        (item) => item.quoteEn.toLowerCase() === nextQuote.quoteEn.toLowerCase()
      );

      if (existingIdx >= 0) {
        setCurrentIndex(existingIdx);
      } else {
        const nextHistory = [...quoteHistory, nextQuote].slice(-20);
        setQuoteHistory(nextHistory);
        setCurrentIndex(nextHistory.length - 1);
      }

      if (isAutoPlay) {
        triggerAutoPlayIfEnabled(nextQuote.quoteEn, 'quote-en', 200);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setGenerateError("Délai d'attente dépassé lors de la génération de la citation.");
      } else {
        setGenerateError(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue lors de la génération de la citation.'
        );
      }
    } finally {
      window.clearTimeout(timeout);
      setIsGenerating(false);
    }
  };

  const handleNavigateQuote = (delta: -1 | 1) => {
    const targetIdx = currentIndex + delta;
    if (targetIdx < 0 || targetIdx >= quoteHistory.length) return;
    stopSpeech();
    setGenerateError(null);
    setRhetoricError(null);
    setIsRhetoricOpen(false);
    setCurrentIndex(targetIdx);
    if (isAutoPlay) {
      triggerAutoPlayIfEnabled(quoteHistory[targetIdx].quoteEn, 'quote-en', 180);
    }
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

            {/* Dedicated Haut-Parleurs Bar + Refresh Quote */}
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

              {/* Bouton Favori : enregistrer la citation actuelle dans la collection locale */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-pressed={isCurrentFavorite}
                aria-label={
                  isCurrentFavorite
                    ? 'Retirer cette citation des favoris'
                    : 'Ajouter cette citation aux favoris'
                }
                title={
                  isCurrentFavorite
                    ? 'Enregistrée dans vos favoris du profil (cliquer pour retirer)'
                    : 'Ajouter cette citation à votre collection locale de favoris'
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer active:scale-95 ${
                  isCurrentFavorite
                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'bg-[#1e2538] hover:bg-[#2a344e] text-[#dce2f8] hover:text-rose-200 border-[#374461] hover:border-rose-400/50'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isCurrentFavorite ? 'text-rose-400' : ''
                  }`}
                  style={{ fontVariationSettings: isCurrentFavorite ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                <span>Favori</span>
              </button>

              {/* Bouton d'analyse rhétorique via Gemini */}
              <button
                type="button"
                onClick={() => handleAnalyzeRhetoric(false)}
                disabled={isAnalyzingRhetoric}
                aria-expanded={isRhetoricOpen}
                aria-label="Analyser la rhétorique de cette citation"
                title="Analyser le style, les figures de style et le registre de langue avec Gemini"
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all flex items-center gap-1.5 border shadow-sm ${
                  isAnalyzingRhetoric
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40 cursor-wait'
                    : isRhetoricOpen && currentRhetoric
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/25 cursor-pointer active:scale-95'
                    : 'bg-[#1e2538] hover:bg-[#2a344e] text-[#e0e7ff] hover:text-[#f2ca50] border-indigo-400/35 hover:border-[#f2ca50]/60 cursor-pointer active:scale-95'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isAnalyzingRhetoric ? 'animate-spin' : ''
                  }`}
                >
                  {isAnalyzingRhetoric ? 'progress_activity' : 'auto_awesome'}
                </span>
                <span>
                  {isAnalyzingRhetoric ? 'Analyse...' : 'Analyser la rhétorique'}
                </span>
              </button>

              {/* Bouton d'actualisation manuelle : Nouvelle citation de Lord Chesterfield */}
              <button
                type="button"
                onClick={handleRefreshQuote}
                disabled={isGenerating}
                aria-label="Générer une nouvelle citation de Lord Chesterfield"
                title="Générer une nouvelle citation inédite de Lord Chesterfield"
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all flex items-center gap-1.5 border shadow-sm ${
                  isGenerating
                    ? 'bg-[#1e2538]/70 text-[#f2ca50]/70 border-[#f2ca50]/30 cursor-wait'
                    : 'bg-[#1e2538] hover:bg-[#2a344e] text-[#f2ca50] border-[#f2ca50]/45 hover:border-[#f2ca50] cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(242,202,80,0.12)]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isGenerating ? 'animate-spin' : ''
                  }`}
                >
                  refresh
                </span>
                <span>{isGenerating ? 'Génération...' : 'Nouvelle citation'}</span>
              </button>

              {/* Stop Button if anything is playing */}
              {isAnyPlaying && (
                <button
                  type="button"
                  onClick={() => stopSpeech()}
                  className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                  title="Arrêter la lecture"
                  aria-label="Arrêter la lecture audio"
                >
                  <span className="material-symbols-outlined text-sm">stop</span>
                </button>
              )}
            </div>
          </div>

          {favoriteNotice && (
            <div
              role="status"
              className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-400/35 text-xs text-rose-200 animate-fadeIn"
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-sm text-rose-300"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <span>{favoriteNotice}</span>
              </div>
              <span className="text-[10px] font-mono text-[#f2ca50] shrink-0">
                {favorites.length} en collection
              </span>
            </div>
          )}

          {/* Inline Error Feedback if Quote Refresh Fails */}
          {generateError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-base text-rose-300 shrink-0">
                  error
                </span>
                <span className="leading-snug">{generateError}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRefreshQuote}
                  disabled={isGenerating}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-100 border border-rose-400/40 font-semibold transition-colors cursor-pointer"
                >
                  Réessayer
                </button>
                <button
                  type="button"
                  onClick={() => setGenerateError(null)}
                  aria-label="Fermer l'alerte"
                  className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Bilingual Quote Display */}
          <div
            className={`space-y-2 transition-opacity duration-300 ${
              isGenerating ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {/* English Sentence */}
            <div className="relative group">
              <blockquote className="font-serif text-lg sm:text-xl italic text-[#ffffff] leading-snug drop-shadow-sm font-normal select-text">
                “{quoteEnglish}”
              </blockquote>
            </div>

            {/* French Translation */}
            <p className="font-sans text-sm text-[#d4c78f] italic leading-relaxed border-l-2 border-[#f2ca50]/40 pl-3 select-text">
              « {quoteFrench} »
            </p>
          </div>

          {/* Dedicated Web Speech API Text-to-Speech Option Bar */}
          <div className="p-3 rounded-xl bg-[#0e1526]/90 border border-[#28334d] flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[#f2ca50] text-base shrink-0">
                  record_voice_over
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#dce2f8]">
                  Synthèse vocale &bull; Web Speech API
                </span>
                {ttsVoiceLabel && (
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-[#162038] border border-[#2a3859] text-[10px] font-mono text-[#94a3b8] truncate max-w-[230px]">
                    {ttsVoiceLabel}
                  </span>
                )}
              </div>

              {/* Speed / Cadence Selector */}
              <div className="flex items-center gap-1 bg-[#121a2e] border border-[#25304a] rounded-lg p-0.5">
                {[
                  { value: 0.85, label: '0.85×' },
                  { value: 1, label: '1×' },
                  { value: 1.15, label: '1.15×' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectTtsSpeed(opt.value)}
                    aria-pressed={ttsRateMultiplier === opt.value}
                    title={`Vitesse de lecture : ${opt.label}`}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      ttsRateMultiplier === opt.value
                        ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Accent Selector (British en-GB vs American en-US) */}
              <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Choix de l'accent de synthèse vocale">
                <button
                  type="button"
                  onClick={() => {
                    playSelectCue();
                    setSelectedTtsAccent('en-GB');
                  }}
                  aria-pressed={selectedTtsAccent === 'en-GB'}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTtsAccent === 'en-GB'
                      ? 'bg-[#f2ca50]/15 text-[#f2ca50] border-[#f2ca50]/60'
                      : 'bg-[#141c2f] text-[#94a3b8] border-[#25304a] hover:text-white'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>Accent britannique (en-GB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSelectCue();
                    setSelectedTtsAccent('en-US');
                  }}
                  aria-pressed={selectedTtsAccent === 'en-US'}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTtsAccent === 'en-US'
                      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/60'
                      : 'bg-[#141c2f] text-[#94a3b8] border-[#25304a] hover:text-white'
                  }`}
                >
                  <span>🇺🇸</span>
                  <span>Accent américain (en-US)</span>
                </button>
              </div>

              {/* Primary TTS Play/Stop Trigger */}
              <button
                type="button"
                onClick={() => handlePlayEnglish(selectedTtsAccent)}
                disabled={!isWebSpeechSupported}
                aria-label={
                  (selectedTtsAccent === 'en-GB' && isPlayingUK) ||
                  (selectedTtsAccent === 'en-US' && isPlayingUS)
                    ? 'Arrêter la synthèse vocale'
                    : `Écouter la citation avec l'accent ${
                        selectedTtsAccent === 'en-GB' ? 'britannique' : 'américain'
                      }`
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                  !isWebSpeechSupported
                    ? 'bg-[#1a2234] text-[#64748b] border-[#25304a] cursor-not-allowed'
                    : (selectedTtsAccent === 'en-GB' && isPlayingUK) ||
                      (selectedTtsAccent === 'en-US' && isPlayingUS)
                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/60 cursor-pointer active:scale-95'
                    : selectedTtsAccent === 'en-GB'
                    ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] border-[#f2ca50] cursor-pointer active:scale-95'
                    : 'bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0c1322] border-[#38bdf8] cursor-pointer active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {(selectedTtsAccent === 'en-GB' && isPlayingUK) ||
                  (selectedTtsAccent === 'en-US' && isPlayingUS)
                    ? 'stop_circle'
                    : 'campaign'}
                </span>
                <span>
                  {(selectedTtsAccent === 'en-GB' && isPlayingUK) ||
                  (selectedTtsAccent === 'en-US' && isPlayingUS)
                    ? 'Arrêter la lecture'
                    : selectedTtsAccent === 'en-GB'
                    ? 'Écouter (🇬🇧 UK)'
                    : 'Écouter (🇺🇸 US)'}
                </span>
              </button>
            </div>

            {(!isWebSpeechSupported || ttsError) && (
              <div
                role="alert"
                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-400/35 text-[11px] text-amber-200"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-amber-300 shrink-0">
                    volume_off
                  </span>
                  <span>
                    {ttsError ||
                      "La synthèse vocale Web Speech API n'est pas disponible sur ce navigateur."}
                  </span>
                </div>
                {ttsError && (
                  <button
                    type="button"
                    onClick={() => setTtsError(null)}
                    aria-label="Fermer l'avertissement audio"
                    className="p-0.5 rounded text-amber-300 hover:text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
            )}
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
                      ? currentQuote.phoneticNoteUk
                      : isPlayingUS
                      ? currentQuote.phoneticNoteUs
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

          {/* Expandable Gemini Rhetoric Analysis Panel */}
          {isRhetoricOpen && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e1526] via-[#121a2f] to-[#0c1220] border border-[#f2ca50]/35 shadow-inner flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#232a3a] flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0">
                    history_edu
                  </span>
                  <span className="text-xs font-serif font-bold text-[#f3f4f6]">
                    Analyse Rhétorique &amp; Stylistique
                  </span>
                  {currentRhetoric?.registerLabel && (
                    <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/35 text-[10px] font-mono font-semibold text-[#f2ca50]">
                      {currentRhetoric.registerLabel}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsRhetoricOpen(false)}
                  aria-label="Fermer l'analyse rhétorique"
                  className="p-1 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e2538] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {isAnalyzingRhetoric ? (
                <div className="py-4 flex items-center justify-center gap-2.5 text-xs text-[#d4c78f] font-mono">
                  <span className="material-symbols-outlined text-base text-[#f2ca50] animate-spin">
                    progress_activity
                  </span>
                  <span>Étude stylistique, figures de style et registre en cours...</span>
                </div>
              ) : rhetoricError ? (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-base text-rose-300 shrink-0">
                      error
                    </span>
                    <span className="leading-snug">{rhetoricError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAnalyzeRhetoric(true)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-100 border border-rose-400/40 font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    Réessayer
                  </button>
                </div>
              ) : currentRhetoric ? (
                <div className="flex flex-col gap-3 text-xs select-text">
                  {/* Style Overview */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#f2ca50] font-bold">
                      Style &amp; Intention
                    </span>
                    <p className="text-[#dce2f8] leading-relaxed">
                      {currentRhetoric.styleOverviewFr}
                    </p>
                  </div>

                  {/* Figures of Speech */}
                  {currentRhetoric.figuresOfSpeech.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#f2ca50] font-bold">
                        Figures de Style Identifiées
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentRhetoric.figuresOfSpeech.map((fig, idx) => (
                          <div
                            key={`${fig.name}-${idx}`}
                            className="p-2.5 rounded-xl bg-[#151c2e] border border-[#28334d] flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-serif font-bold text-[#f2ca50] text-xs">
                                {fig.name}
                              </span>
                              {fig.excerpt && (
                                <span className="text-[10px] font-mono italic text-sky-300 bg-sky-500/10 border border-sky-400/25 px-1.5 py-0.5 rounded">
                                  “{fig.excerpt}”
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#cbd5e1] leading-snug">
                              {fig.explanationFr}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Register Analysis */}
                  <div className="p-2.5 rounded-xl bg-[#111829] border border-[#232d45] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold">
                      Registre de Langue
                    </span>
                    <p className="text-[11px] text-[#dce2f8] leading-relaxed">
                      {currentRhetoric.registerAnalysisFr}
                    </p>
                  </div>

                  {/* Takeaway */}
                  {currentRhetoric.keyTakeawayFr && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[11px] text-[#f5e3a3]">
                      <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0 mt-0.5">
                        tips_and_updates
                      </span>
                      <span className="leading-snug">{currentRhetoric.keyTakeawayFr}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Attribution, Session History Pager & Philological Context */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232a3a]/80 text-xs text-[#99907c] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] font-serif font-bold text-xs">
                C
              </div>
              <span className="text-[#dce2f8] font-medium font-sans">
                Lord Chesterfield &bull; {currentQuote.sourceWork}
              </span>
              {currentQuote.isGenerated && (
                <span className="px-2 py-0.5 rounded-md bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[10px] font-mono text-[#f2ca50]">
                  Inédite
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              {quoteHistory.length > 1 && (
                <div className="flex items-center gap-1 bg-[#101625] border border-[#252f44] rounded-lg px-1.5 py-0.5">
                  <button
                    type="button"
                    onClick={() => handleNavigateQuote(-1)}
                    disabled={currentIndex === 0}
                    aria-label="Citation précédente"
                    title="Revoir la citation précédente"
                    className="p-0.5 rounded text-[#dce2f8] hover:text-[#f2ca50] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px] leading-none">
                      chevron_left
                    </span>
                  </button>
                  <span className="text-[10px] text-[#94a3b8] px-1">
                    {currentIndex + 1}/{quoteHistory.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigateQuote(1)}
                    disabled={currentIndex === quoteHistory.length - 1}
                    aria-label="Citation suivante"
                    title="Aller à la citation suivante"
                    className="p-0.5 rounded text-[#dce2f8] hover:text-[#f2ca50] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px] leading-none">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
              <span>{currentQuote.year}</span>
              <span>&bull;</span>
              <span className="text-[#f2ca50]">{currentQuote.cefrFocus}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
