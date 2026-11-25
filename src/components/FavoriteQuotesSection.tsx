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

export const FavoriteQuotesSection: React.FC = () => {
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
      className="p-5 rounded-2xl bg-gradient-to-br from-[#191f2f] via-[#151b2b] to-[#0f1626] border border-[#f2ca50]/40 shadow-xl flex flex-col gap-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-inner shrink-0">
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bookmarks
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-[#f2ca50] font-bold uppercase tracking-wider font-mono">
              COLLECTION LOCALE PERSISTANTE
            </span>
            <h3 className="font-serif font-bold text-base text-[#f3f4f6] truncate">
              Mes Citations Favorites de Lord Chesterfield
            </h3>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-200 border border-rose-400/35 text-[11px] font-mono font-bold shrink-0">
          {favorites.length} {favorites.length > 1 ? 'citations' : 'citation'}
        </span>
      </div>

      {/* Search bar when collection grows */}
      {favorites.length >= 3 && (
        <div className="relative">
          <span className="material-symbols-outlined text-base text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans vos citations favorites (anglais ou français)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0c1322] border border-[#232a3a] focus:border-[#f2ca50]/60 focus:outline-none text-xs text-[#dce2f8] placeholder-[#78859e]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State or Favorites List */}
      {favorites.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#0c1322]/80 border border-[#232a3a] flex items-start gap-3">
          <span className="material-symbols-outlined text-rose-300/80 text-xl shrink-0 mt-0.5">
            favorite_border
          </span>
          <div className="flex flex-col gap-1 text-xs text-[#d0c5af] leading-relaxed">
            <span className="font-semibold text-[#dce2f8]">
              Aucune citation enregistrée pour le moment.
            </span>
            <span>
              Touchez le bouton <strong>Favori</strong> sur l&apos;épître du jour (écran d&apos;accueil) pour constituer votre florilège personnel conservé localement sur cet appareil.
            </span>
          </div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#0c1322]/80 border border-[#232a3a] text-center text-xs text-[#99907c]">
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
                className="p-3.5 rounded-xl bg-[#0c1322]/95 border border-[#232a3a] hover:border-[#f2ca50]/45 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <blockquote className="font-serif italic text-sm text-white leading-snug select-text">
                      “{item.quoteEn}”
                    </blockquote>
                    <p className="font-sans italic text-xs text-[#d4c78f] border-l-2 border-[#f2ca50]/35 pl-2.5 leading-relaxed select-text">
                      « {item.quoteFr} »
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    aria-label="Retirer cette citation des favoris"
                    title="Retirer cette citation des favoris"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors cursor-pointer shrink-0 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>

                {/* Metadata & Audio Actions */}
                <div className="pt-2 border-t border-[#1e2638] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-[#94a3b8]">
                    <span className="text-[#dce2f8] font-sans font-medium">
                      {item.sourceWork} ({item.year})
                    </span>
                    <span>&bull;</span>
                    <span className="text-[#f2ca50]">{item.cefrFocus}</span>
                    {item.savedAt && (
                      <>
                        <span className="hidden sm:inline">&bull;</span>
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
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                        isPlayingUK
                          ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50]'
                          : 'bg-[#151b2b] hover:bg-[#1e273d] text-[#f2ca50] border-[#f2ca50]/30'
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingUK ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayEnglish(item, 'en-US')}
                      title="Écouter en Anglais Américain (US)"
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                        isPlayingUS
                          ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8]'
                          : 'bg-[#151b2b] hover:bg-[#1e273d] text-[#38bdf8] border-[#38bdf8]/30'
                      }`}
                    >
                      <span>🇺🇸</span>
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingUS ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayFrench(item)}
                      title="Écouter la traduction française"
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                        isPlayingFR
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-[#151b2b] hover:bg-[#1e273d] text-[#dce2f8] border-[#374461]'
                      }`}
                    >
                      <span>🇫🇷</span>
                      <span className="material-symbols-outlined text-xs">
                        {isPlayingFR ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      title="Copier la citation bilingue"
                      aria-label="Copier la citation bilingue"
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono border flex items-center gap-1 cursor-pointer transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                          : 'bg-[#151b2b] hover:bg-[#1e273d] text-[#cbd5e1] border-[#2e3b55]'
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
