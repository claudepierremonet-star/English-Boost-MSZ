/**
 * Gestionnaire local persistant des citations favorites de Lord Chesterfield
 * Stocke la collection dans localStorage et diffuse les mises à jour en temps réel
 * entre QuoteSection et la section dédiée du profil utilisateur.
 */

export interface ChesterfieldQuote {
  quoteEn: string;
  quoteFr: string;
  sourceWork: string;
  year: string;
  cefrFocus: string;
  phoneticNoteUk: string;
  phoneticNoteUs: string;
  isGenerated?: boolean;
}

export interface FavoriteQuoteItem extends ChesterfieldQuote {
  id: string;
  savedAt: string;
}

export const FAVORITE_QUOTES_STORAGE_KEY = 'eb_msz_favorite_quotes_v1';
export const FAVORITE_QUOTES_EVENT = 'eb_favorite_quotes_updated';
const MAX_FAVORITE_QUOTES = 100;

export function buildFavoriteQuoteId(quoteEn: string): string {
  const normalized = quoteEn.trim().toLowerCase().replace(/\s+/g, ' ');
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `cq_${(hash >>> 0).toString(36)}`;
}

function sanitizeFavoriteQuoteItem(raw: unknown): FavoriteQuoteItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<FavoriteQuoteItem>;
  const quoteEn = typeof obj.quoteEn === 'string' ? obj.quoteEn.trim() : '';
  const quoteFr = typeof obj.quoteFr === 'string' ? obj.quoteFr.trim() : '';
  if (!quoteEn || !quoteFr) return null;

  return {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : buildFavoriteQuoteId(quoteEn),
    quoteEn,
    quoteFr,
    sourceWork:
      typeof obj.sourceWork === 'string' && obj.sourceWork.trim()
        ? obj.sourceWork.trim()
        : 'Letters to his Son',
    year: typeof obj.year === 'string' && obj.year.trim() ? obj.year.trim() : '1774',
    cefrFocus:
      typeof obj.cefrFocus === 'string' && obj.cefrFocus.trim()
        ? obj.cefrFocus.trim()
        : 'CEFR C2 Rhétorique',
    phoneticNoteUk:
      typeof obj.phoneticNoteUk === 'string' && obj.phoneticNoteUk.trim()
        ? obj.phoneticNoteUk.trim()
        : 'Articulation britannique nette et voyelles longues non-rhôtiques.',
    phoneticNoteUs:
      typeof obj.phoneticNoteUs === 'string' && obj.phoneticNoteUs.trim()
        ? obj.phoneticNoteUs.trim()
        : 'Rhotisme rétroflexe marqué sur les /r/ et cadence fluide américaine.',
    isGenerated: Boolean(obj.isGenerated),
    savedAt: typeof obj.savedAt === 'string' && obj.savedAt ? obj.savedAt : new Date().toISOString()
  };
}

export function getFavoriteQuotes(): FavoriteQuoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITE_QUOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seenIds = new Set<string>();
    const valid: FavoriteQuoteItem[] = [];
    for (const item of parsed) {
      const clean = sanitizeFavoriteQuoteItem(item);
      if (clean && !seenIds.has(clean.id)) {
        seenIds.add(clean.id);
        valid.push(clean);
      }
      if (valid.length >= MAX_FAVORITE_QUOTES) break;
    }
    return valid;
  } catch {
    return [];
  }
}

function persistFavoriteQuotes(items: FavoriteQuoteItem[]): FavoriteQuoteItem[] {
  const capped = items.slice(0, MAX_FAVORITE_QUOTES);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(FAVORITE_QUOTES_STORAGE_KEY, JSON.stringify(capped));
      window.dispatchEvent(new CustomEvent<FavoriteQuoteItem[]>(FAVORITE_QUOTES_EVENT, { detail: capped }));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }
  return capped;
}

export function isQuoteFavorited(quoteEn: string): boolean {
  const targetId = buildFavoriteQuoteId(quoteEn);
  return getFavoriteQuotes().some((item) => item.id === targetId);
}

export function toggleFavoriteQuote(
  quote: ChesterfieldQuote
): { isFavorited: boolean; favorites: FavoriteQuoteItem[] } {
  const id = buildFavoriteQuoteId(quote.quoteEn);
  const current = getFavoriteQuotes();
  const exists = current.some((item) => item.id === id);

  if (exists) {
    const next = persistFavoriteQuotes(current.filter((item) => item.id !== id));
    return { isFavorited: false, favorites: next };
  }

  const created: FavoriteQuoteItem = {
    ...quote,
    id,
    savedAt: new Date().toISOString()
  };
  const next = persistFavoriteQuotes([created, ...current]);
  return { isFavorited: true, favorites: next };
}

export function removeFavoriteQuote(id: string): FavoriteQuoteItem[] {
  const current = getFavoriteQuotes();
  return persistFavoriteQuotes(current.filter((item) => item.id !== id));
}

export function subscribeToFavoriteQuotes(
  listener: (favorites: FavoriteQuoteItem[]) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<FavoriteQuoteItem[]>;
    if (Array.isArray(custom.detail)) {
      listener(custom.detail);
    } else {
      listener(getFavoriteQuotes());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === FAVORITE_QUOTES_STORAGE_KEY) {
      listener(getFavoriteQuotes());
    }
  };

  window.addEventListener(FAVORITE_QUOTES_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(FAVORITE_QUOTES_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
  };
}
