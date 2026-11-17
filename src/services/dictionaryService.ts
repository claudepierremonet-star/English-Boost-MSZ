/**
 * Service de Dictionnaire & Analyse Linguistique Google (Google Gemini API + Google Dictionary API + Lexique local)
 * Permet d'obtenir instantanément définition bilingue, étymologie, phonétique, audio
 * et phrase d'exemple bilingue lors de toute sélection de texte ou pression longue dans une leçon.
 */

import { SPACED_REPETITION_500 } from '../data/spacedRepetition500';
import type { SchoolVocabularyItem } from '../data/schoolCurriculum';
import { getWordLinguisticDetails } from '../utils/flashcardDetailsHelper';

export interface DictionaryMeaningItem {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example?: string;
  }>;
  synonyms: string[];
}

export interface GeminiWordInsight {
  term: string;
  phonetic: string;
  partOfSpeech: string;
  definitionFr: string;
  definitionEn: string;
  etymologyOrigin: string;
  etymologyDetail: string;
  exampleEn: string;
  exampleFr: string;
  synonyms: string[];
}

export interface DictionaryLookupResult {
  word: string;
  isMultiWord: boolean;
  phonetic?: string;
  audioUrl?: string;
  frenchTranslation?: string;
  contextExampleFr?: string;
  meanings: DictionaryMeaningItem[];
  source: 'google_gemini' | 'google_dictionary' | 'curriculum_lexicon' | 'offline_linguistic';
  syllables?: string;
  geminiInsight?: GeminiWordInsight;
  geminiError?: string;
  geminiLoading?: boolean;
}

const DICT_CACHE_KEY = 'eb_msz_google_dict_cache_v1';
const GEMINI_CACHE_KEY = 'eb_msz_gemini_insight_cache_v1';
const dictMemoryCache = new Map<string, DictionaryLookupResult>();
const geminiMemoryCache = new Map<string, GeminiWordInsight>();

export function normalizeSelectionQuery(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[^a-zA-Z'-]+|[^a-zA-Z'-]+$/g, '');
}

function loadPersistentDictCache(): Record<string, DictionaryLookupResult> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DICT_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DictionaryLookupResult>) : {};
  } catch {
    return {};
  }
}

function saveToPersistentDictCache(key: string, entry: DictionaryLookupResult): void {
  dictMemoryCache.set(key, entry);
  if (typeof window === 'undefined') return;
  try {
    const current = loadPersistentDictCache();
    const keys = Object.keys(current);
    if (keys.length >= 120) {
      delete current[keys[0]];
    }
    current[key] = entry;
    window.localStorage.setItem(DICT_CACHE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota issues
  }
}

function loadPersistentGeminiCache(): Record<string, GeminiWordInsight> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(GEMINI_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, GeminiWordInsight>) : {};
  } catch {
    return {};
  }
}

function saveToPersistentGeminiCache(key: string, insight: GeminiWordInsight): void {
  geminiMemoryCache.set(key, insight);
  if (typeof window === 'undefined') return;
  try {
    const current = loadPersistentGeminiCache();
    const keys = Object.keys(current);
    if (keys.length >= 150) {
      delete current[keys[0]];
    }
    current[key] = insight;
    window.localStorage.setItem(GEMINI_CACHE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota issues
  }
}

function findLocalLexiconMatch(
  cleanTextLower: string,
  lessonVocabulary?: SchoolVocabularyItem[]
): {
  frenchTranslation?: string;
  phonetic?: string;
  contextExampleEn?: string;
  contextExampleFr?: string;
  partOfSpeech?: string;
} | null {
  if (lessonVocabulary && lessonVocabulary.length > 0) {
    const exactLesson = lessonVocabulary.find(
      (v) =>
        v.term.toLowerCase() === cleanTextLower ||
        v.term.toLowerCase().replace(/^to\s+/, '') === cleanTextLower
    );
    if (exactLesson) {
      return {
        frenchTranslation: exactLesson.translation_fr,
        phonetic: exactLesson.phonetic,
        contextExampleEn: exactLesson.example_en,
        contextExampleFr: exactLesson.example_fr,
        partOfSpeech: exactLesson.part_of_speech
      };
    }

    if (!cleanTextLower.includes(' ')) {
      const partialLesson = lessonVocabulary.find((v) =>
        v.term.toLowerCase().split(/[\s/-]+/).includes(cleanTextLower)
      );
      if (partialLesson) {
        return {
          frenchTranslation: `${partialLesson.translation_fr} (via « ${partialLesson.term} »)`,
          phonetic: partialLesson.phonetic,
          contextExampleEn: partialLesson.example_en,
          contextExampleFr: partialLesson.example_fr,
          partOfSpeech: partialLesson.part_of_speech
        };
      }
    }
  }

  const cardMatch = SPACED_REPETITION_500.find(
    (c) =>
      c.term.toLowerCase() === cleanTextLower ||
      c.term.toLowerCase().replace(/^to\s+/, '') === cleanTextLower
  );
  if (cardMatch) {
    return {
      frenchTranslation: cardMatch.frenchDef,
      phonetic: cardMatch.phonetic,
      contextExampleEn: cardMatch.pressExcerpt,
      partOfSpeech: cardMatch.themeLabel
    };
  }

  return null;
}

function generateStemCandidates(word: string): string[] {
  const candidates = [word];
  if (word.endsWith('ies') && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith('ied') && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith('es') && word.length > 3) candidates.push(word.slice(0, -2));
  if (word.endsWith('s') && word.length > 3) candidates.push(word.slice(0, -1));
  if (word.endsWith('ing') && word.length > 5) {
    const base = word.slice(0, -3);
    candidates.push(base, `${base}e`);
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      candidates.push(base.slice(0, -1));
    }
  }
  if (word.endsWith('ed') && word.length > 4) {
    const base = word.slice(0, -2);
    candidates.push(base, `${base}e`);
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      candidates.push(base.slice(0, -1));
    }
  }
  if (word.endsWith('ly') && word.length > 4) candidates.push(word.slice(0, -2));
  if (word.endsWith("'s")) candidates.push(word.slice(0, -2));
  return Array.from(new Set(candidates.filter((c) => c.length >= 2)));
}

interface RawGoogleDictEntry {
  word: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
      example?: string;
      synonyms?: string[];
    }>;
    synonyms?: string[];
  }>;
}

async function fetchGoogleDictionaryEntry(word: string): Promise<RawGoogleDictEntry | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (Array.isArray(json) && json.length > 0) {
      return json[0] as RawGoogleDictEntry;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGoogleGeminiWordInsight(
  rawText: string,
  lessonContext?: string,
  gradeLevel?: string
): Promise<{ insight?: GeminiWordInsight; error?: string }> {
  const cleanText = normalizeSelectionQuery(rawText);
  if (!cleanText) {
    return { error: 'Sélection vide.' };
  }

  const cacheKey = `${cleanText.toLowerCase()}::${(gradeLevel || '').toLowerCase()}`;
  const memHit = geminiMemoryCache.get(cacheKey);
  if (memHit) {
    return { insight: memHit };
  }

  const persistent = loadPersistentGeminiCache();
  if (persistent[cacheKey]) {
    geminiMemoryCache.set(cacheKey, persistent[cacheKey]);
    return { insight: persistent[cacheKey] };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { error: 'Mode hors-ligne : API Google Gemini indisponible.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch('/api/gemini/word-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        lessonContext,
        gradeLevel
      }),
      signal: controller.signal
    });

    const data = (await response.json().catch(() => ({}))) as Partial<GeminiWordInsight> & {
      error?: string;
    };

    if (!response.ok) {
      return {
        error:
          data.error ||
          `L'API Google a renvoyé une erreur (${response.status}).`
      };
    }

    if (!data.definitionFr && !data.definitionEn) {
      return { error: 'Réponse incomplète reçue depuis l’API Google.' };
    }

    const insight: GeminiWordInsight = {
      term: data.term || cleanText,
      phonetic: data.phonetic || '',
      partOfSpeech: data.partOfSpeech || 'Terme',
      definitionFr: data.definitionFr || '',
      definitionEn: data.definitionEn || '',
      etymologyOrigin: data.etymologyOrigin || '',
      etymologyDetail: data.etymologyDetail || '',
      exampleEn: data.exampleEn || '',
      exampleFr: data.exampleFr || '',
      synonyms: Array.isArray(data.synonyms) ? data.synonyms.slice(0, 4) : []
    };

    saveToPersistentGeminiCache(cacheKey, insight);
    return { insight };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { error: "Délai d'attente dépassé lors de la requête à l'API Google." };
    }
    return { error: "Impossible de joindre le service Google Gemini pour le moment." };
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupEnglishWord(
  rawWord: string,
  lessonVocabulary?: SchoolVocabularyItem[]
): Promise<DictionaryLookupResult> {
  const cleanNormalized = normalizeSelectionQuery(rawWord);
  const cleanLower = cleanNormalized.toLowerCase();
  const isMultiWord = /\s/.test(cleanLower);

  if (!cleanLower) {
    return {
      word: rawWord.trim(),
      isMultiWord: false,
      meanings: [],
      source: 'offline_linguistic'
    };
  }

  const localMatch = findLocalLexiconMatch(cleanLower, lessonVocabulary);
  const linguistic = !isMultiWord
    ? getWordLinguisticDetails(
        cleanLower,
        localMatch?.frenchTranslation || '',
        localMatch?.partOfSpeech || ''
      )
    : null;

  if (!isMultiWord) {
    const mem = dictMemoryCache.get(cleanLower);
    if (mem) {
      return {
        ...mem,
        frenchTranslation: mem.frenchTranslation || localMatch?.frenchTranslation,
        contextExampleFr: mem.contextExampleFr || localMatch?.contextExampleFr
      };
    }

    const persistent = loadPersistentDictCache();
    if (persistent[cleanLower]) {
      dictMemoryCache.set(cleanLower, persistent[cleanLower]);
      return {
        ...persistent[cleanLower],
        frenchTranslation:
          persistent[cleanLower].frenchTranslation || localMatch?.frenchTranslation,
        contextExampleFr:
          persistent[cleanLower].contextExampleFr || localMatch?.contextExampleFr
      };
    }

    const stems = generateStemCandidates(cleanLower);
    let apiEntry: RawGoogleDictEntry | null = null;
    for (const candidate of stems) {
      apiEntry = await fetchGoogleDictionaryEntry(candidate);
      if (apiEntry) break;
    }

    if (apiEntry && Array.isArray(apiEntry.meanings) && apiEntry.meanings.length > 0) {
      const phoneticFromArr = apiEntry.phonetics?.find((p) => p.text)?.text;
      const audioFromArr = apiEntry.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio;
      const meanings: DictionaryMeaningItem[] = apiEntry.meanings.slice(0, 3).map((m) => ({
        partOfSpeech: m.partOfSpeech || 'word',
        definitions: (m.definitions || [])
          .slice(0, 2)
          .filter((d) => Boolean(d.definition))
          .map((d) => ({
            definition: d.definition || '',
            example: d.example
          })),
        synonyms: Array.from(
          new Set([
            ...(m.synonyms || []),
            ...((m.definitions || []).flatMap((d) => d.synonyms || []))
          ])
        ).slice(0, 5)
      }));

      const result: DictionaryLookupResult = {
        word: apiEntry.word || cleanNormalized,
        isMultiWord: false,
        phonetic: apiEntry.phonetic || phoneticFromArr || localMatch?.phonetic,
        audioUrl: audioFromArr,
        frenchTranslation: localMatch?.frenchTranslation,
        contextExampleFr: localMatch?.contextExampleFr,
        meanings,
        source: 'google_dictionary',
        syllables: linguistic?.syllables
      };

      saveToPersistentDictCache(cleanLower, result);
      return result;
    }
  }

  if (localMatch) {
    return {
      word: cleanNormalized,
      isMultiWord,
      phonetic: localMatch.phonetic,
      frenchTranslation: localMatch.frenchTranslation,
      contextExampleFr: localMatch.contextExampleFr,
      meanings: [
        {
          partOfSpeech: localMatch.partOfSpeech || linguistic?.partOfSpeech.label || 'Expression',
          definitions: [
            {
              definition: localMatch.frenchTranslation || cleanNormalized,
              example: localMatch.contextExampleEn
            }
          ],
          synonyms: []
        }
      ],
      source: 'curriculum_lexicon',
      syllables: linguistic?.syllables
    };
  }

  return {
    word: cleanNormalized,
    isMultiWord,
    meanings: linguistic
      ? [
          {
            partOfSpeech: linguistic.partOfSpeech.label,
            definitions: [
              {
                definition: `${linguistic.partOfSpeech.description} (Syllabes : ${linguistic.syllables}).`
              }
            ],
            synonyms: []
          }
        ]
      : [],
    source: 'offline_linguistic',
    syllables: linguistic?.syllables
  };
}

export interface LookupSelectionOptions {
  lessonVocabulary?: SchoolVocabularyItem[];
  lessonContext?: string;
  gradeLevel?: string;
  onPartial?: (partial: DictionaryLookupResult) => void;
}

export async function lookupSelectionWithGoogleApis(
  rawSelection: string,
  options: LookupSelectionOptions = {}
): Promise<DictionaryLookupResult> {
  const { lessonVocabulary, lessonContext, gradeLevel, onPartial } = options;
  const cleanText = normalizeSelectionQuery(rawSelection);
  const isMultiWord = /\s/.test(cleanText);

  const geminiPromise = fetchGoogleGeminiWordInsight(cleanText, lessonContext, gradeLevel);

  const baseResult = await lookupEnglishWord(cleanText, lessonVocabulary);
  if (onPartial) {
    onPartial({
      ...baseResult,
      geminiLoading: true
    });
  }

  const geminiRes = await geminiPromise;

  if (geminiRes.insight) {
    const g = geminiRes.insight;
    return {
      ...baseResult,
      word: g.term || baseResult.word,
      isMultiWord,
      phonetic: baseResult.phonetic || g.phonetic,
      frenchTranslation: g.definitionFr || baseResult.frenchTranslation,
      source: 'google_gemini',
      geminiInsight: g,
      geminiLoading: false,
      geminiError: undefined
    };
  }

  return {
    ...baseResult,
    isMultiWord,
    geminiLoading: false,
    geminiError: geminiRes.error
  };
}
