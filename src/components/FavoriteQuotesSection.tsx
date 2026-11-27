import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getFavoriteQuotes,
  removeFavoriteQuote,
  subscribeToFavoriteQuotes,
  type FavoriteQuoteItem
} from '../utils/favoriteQuotesManager';
import {
  speakText,
  speakFrenchText,
  stopSpeech,
  subscribeToSpeechState,
  type AccentType
} from '../services/speechService';
import { playSelectCue } from '../utils/soundEffects';
import { useAppTheme } from '../theme/ThemeContext';

export const FavoriteQuotesSection: React.FC = () => {
  const { isDark } = useAppTheme();
  const [favorites, setFavorites] = useState<FavoriteQuoteItem[]>(() => getFavoriteQuotes());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);
  const [activeAccent, setActiveAccent] = useState<AccentType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFavorites(getFavoriteQuotes());
    const unsubscribeQuotes = subscribeToFavoriteQuotes((next) => {
      setFavorites(next);
    });
    const unsubscribeSpeech = subscribeToSpeechState((curId, curAccent) => {
      setActiveSpeechKey(curId);
      setActiveAccent(curAccent);
    });
    return () => {
      unsubscribeQuotes();
      unsubscribeSpeech();
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const filteredFavorites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (item) =>
        item.quoteEn.toLowerCase().includes(q) ||
        item.quoteFr.toLowerCase().includes(q) ||
        item.sourceWork.toLowerCase().includes(q) ||
        item.cefrFocus.toLowerCase().includes(q)
    );
  }, [favorites, searchQuery]);

  const handlePlayEnglish = (item: FavoriteQuoteItem, accent: AccentType) => {
    const speechKey = `fav-quote-en-${item.id}`;
    if (activeSpeechKey === speechKey && activeAccent === accent) {
      stopSpeech();
      return;
    }
    speakText(item.quoteEn, accent, speechKey);
  };

  const handlePlayFrench = (item: FavoriteQuoteItem) => {
    const speechKey = `fav-quote-fr-${item.id}`;
    if (activeSpeechKey === speechKey) {
      stopSpeech();
      return;
    }
    speakFrenchText(item.quoteFr, speechKey);
  };

  const handleRemove = (item: FavoriteQuoteItem) => {
    playSelectCue();
    if (
      activeSpeechKey === `fav-quote-en-${item.id}` ||
      activeSpeechKey === `fav-quote-fr-${item.id}`
    ) {
      stopSpeech();
    }
    setFavorites(removeFavoriteQuote(item.id));
  };

  const handleCopy = async (item: FavoriteQuoteItem) => {
    const formatted = `“${item.quoteEn}”\n« ${item.quoteFr} »\n— Lord Chesterfield (${item.sourceWork}, ${item.year})`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formatted);
        playSelectCue();
        setCopiedId(item.id);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // Clipboard unavailable
    }
  };

  const formatSavedDate = (iso: string): string => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date(iso));
    } catch {
      return '';
    }
  };

  return (
    <section
      aria-label="Citations Favorites de Lord Chesterfield"
      className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl luxury-btn-ruby flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bookmarks
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
              Florilège personnel persistant
            </span>
            <h3 className={`font-serif font-bold text-base truncate ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}>
              Mes Citations Favorites de Lord Chesterfield
            </h3>
          </div>
        </div>

        <span className={`text-xs font-mono font-bold tabular-nums shrink-0 ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
          {favorites.length} {favorites.length > 1 ? 'citations' : 'citation'}
        </span>
      </div>

      {/* Search bar when collection grows */}
      {favorites.length >= 3 && (
        <div className="relative luxury-hairline-panel rounded-xl">
          <span className="material-symbols-outlined text-base text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans vos citations favorites (anglais ou français)..."
            aria-label="Rechercher dans vos citations favorites"
            className={`w-full pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-[#f2ca50]/60 focus:outline-none text-xs ${
              isDark ? 'bg-transparent text-[#dce2f8] placeholder-[#78859e]' : 'bg-transparent text-[#1c1917] placeholder-[#78716c]'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#f2ca50] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] rounded"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State or Favorites List */}
      {favorites.length === 0 ? (
        <div className="p-4 rounded-xl luxury-hairline-panel flex items-start gap-3">
          <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${isDark ? 'text-rose-300/80' : 'text-rose-700'}`}>
            favorite_border
          </span>
          <div className={`flex flex-col gap-1 text-xs leading-relaxed ${isDark ? 'text-[#d0c5af]' : 'text-[#57534e]'}`}>
            <span className={`font-semibold ${isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}`}>
              Aucune citation enregistrée pour le moment.
            </span>
            <span>
              Touchez le bouton <strong>Favori</strong> sur l&apos;épître du jour (écran d&apos;accueil) pour constituer votre florilège personnel conservé localement sur cet appareil.
            </span>
          </div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="p-4 rounded-xl luxury-hairline-panel text-center text-xs text-[#99907c]">
          Aucune citation ne correspond à « {searchQuery} ».
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredFavorites.map((item) => {
            const enKey = `fav-quote-en-${item.id}`;
            const frKey = `fav-quote-fr-${item.id}`;
            const isPlayingUK = activeSpeechKey === enKey && activeAccent === 'en-GB';
            const isPlayingUS = activeSpeechKey === enKey && activeAccent === 'en-US';
            const isPlayingFR = activeSpeechKey === frKey;
            const isCopied = copiedId === item.id;

            return (
              <article
                key={item.id}
                className="p-3.5 rounded-xl luxury-hairline-panel hover:border-[#f2ca50]/45 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <blockquote className={`font-serif italic text-sm leading-snug select-text ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}>
                      “{item.quoteEn}”
                    </blockquote>
                    <p className={`font-sans italic text-xs leading-relaxed select-text ${isDark ? 'text-[#d4c78f]' : 'text-[#57534e]'}`}>
                      « {item.quoteFr} »
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    aria-label="Retirer cette citation des favoris"
                    title="Retirer cette citation des favoris"
                    className="p-1.5 rounded-lg luxury-btn-ruby cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>

                {/* Metadata & Audio Actions */}
                <div className={`pt-2 border-t flex items-center justify-between gap-2 flex-wrap ${isDark ? 'border-[#1e2638]' : 'border-[#e2d9cc]'}`}>
                  <div className={`flex items-center gap-1.5 flex-wrap text-[11px] font-mono ${isDark ? 'text-[#94a3b8]' : 'text-[#57534e]'}`}>
                    <span className={`font-sans font-medium ${isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}`}>
                      {item.sourceWork} ({item.year})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-bold ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>{item.cefrFocus}</span>
                    {item.savedAt && (
                      <>
                        <span aria-hidden="true" className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">
                          Ajoutée le {formatSavedDate(item.savedAt)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePlayEnglish(item, 'en-GB')}
                      title="Écouter en Anglais Britannique (UK)"
                      aria-label="Écouter en Anglais Britannique"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                        isPlayingUK ? 'luxury-btn-gold' : 'luxury-btn-amber-soft'
                      }`}
                    >
                      <span>UK</span>
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingUK ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayEnglish(item, 'en-US')}
                      title="Écouter en Anglais Américain (US)"
                      aria-label="Écouter en Anglais Américain"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                        isPlayingUS ? 'luxury-btn-gold' : 'luxury-btn-sapphire'
                      }`}
                    >
                      <span>US</span>
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingUS ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayFrench(item)}
                      title="Écouter la traduction française"
                      aria-label="Écouter la traduction française"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                        isPlayingFR ? 'luxury-btn-gold' : 'luxury-btn-emerald'
                      }`}
                    >
                      <span>FR</span>
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingFR ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      title="Copier la citation bilingue"
                      aria-label="Copier la citation bilingue"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                        isCopied ? 'luxury-btn-emerald' : 'luxury-btn-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isCopied ? 'check' : 'content_copy'}
                      </span>
                      <span className="hidden sm:inline">{isCopied ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
