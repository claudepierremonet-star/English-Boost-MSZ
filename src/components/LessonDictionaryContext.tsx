import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchoolVocabularyItem } from '../data/schoolCurriculum';
import {
  lookupSelectionWithGoogleApis,
  normalizeSelectionQuery,
  type DictionaryLookupResult
} from '../services/dictionaryService';
import { speakText } from '../services/speechService';
import { playSelectCue } from '../utils/soundEffects';

interface AnchorRect {
  top: number;
  left: number;
  bottom: number;
  width: number;
}

interface LessonDictionaryContextValue {
  activeInspectWord: string | null;
  highlightedWords: string[];
  isWordHighlighted: (word: string) => boolean;
  toggleWordHighlight: (word: string) => void;
  triggerWordLookup: (selectionText: string, rect?: DOMRect | null) => void;
  closeDictionaryPopover: () => void;
}

const LessonDictionaryContext = createContext<LessonDictionaryContextValue | null>(null);

export function useLessonDictionary(): LessonDictionaryContextValue | null {
  return useContext(LessonDictionaryContext);
}

const HIGHLIGHTS_STORAGE_KEY = 'eb_msz_lesson_highlights_v1';

function normalizeHighlightKey(w: string): string {
  return w
    .trim()
    .replace(/^[^a-zA-Z'-]+|[^a-zA-Z'-]+$/g, '')
    .toLowerCase();
}

function loadLessonHighlights(lessonId: string): string[] {
  if (typeof window === 'undefined' || !lessonId) return [];
  try {
    const raw = window.localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, string[]>;
    return Array.isArray(map[lessonId]) ? map[lessonId] : [];
  } catch {
    return [];
  }
}

function saveLessonHighlights(lessonId: string, words: string[]): void {
  if (typeof window === 'undefined' || !lessonId) return;
  try {
    const raw = window.localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    map[lessonId] = words;
    window.localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota issues
  }
}

interface LessonDictionaryProviderProps {
  lessonId: string;
  lessonContext?: string;
  gradeLevel?: string;
  vocabulary?: SchoolVocabularyItem[];
  voiceAccent?: 'en-GB' | 'en-US';
  children: React.ReactNode;
}

export const LessonDictionaryProvider: React.FC<LessonDictionaryProviderProps> = ({
  lessonId,
  lessonContext,
  gradeLevel,
  vocabulary,
  voiceAccent = 'en-GB',
  children
}) => {
  const [highlightedWords, setHighlightedWords] = useState<string[]>(() =>
    loadLessonHighlights(lessonId)
  );
  const [activeInspectWord, setActiveInspectWord] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
  const [isLoadingBase, setIsLoadingBase] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<DictionaryLookupResult | null>(null);

  const activeRequestIdRef = useRef<number>(0);
  const lastTriggerRef = useRef<{ query: string; timestamp: number } | null>(null);

  useEffect(() => {
    setHighlightedWords(loadLessonHighlights(lessonId));
    setActiveInspectWord(null);
    setLookupResult(null);
    setAnchorRect(null);
    activeRequestIdRef.current += 1;
  }, [lessonId]);

  const isWordHighlighted = useCallback(
    (word: string) => {
      const key = normalizeHighlightKey(word);
      if (!key) return false;
      return highlightedWords.includes(key) || activeInspectWord?.toLowerCase() === key;
    },
    [highlightedWords, activeInspectWord]
  );

  const toggleWordHighlight = useCallback(
    (word: string) => {
      const key = normalizeHighlightKey(word);
      if (!key) return;
      playSelectCue();
      setHighlightedWords((prev) => {
        const exists = prev.includes(key);
        const next = exists ? prev.filter((w) => w !== key) : [...prev, key];
        saveLessonHighlights(lessonId, next);
        return next;
      });
    },
    [lessonId]
  );

  const closeDictionaryPopover = useCallback(() => {
    activeRequestIdRef.current += 1;
    setActiveInspectWord(null);
    setLookupResult(null);
    setIsLoadingBase(false);
  }, []);

  const triggerWordLookup = useCallback(
    async (rawSelection: string, rect?: DOMRect | null) => {
      const cleanQuery = normalizeSelectionQuery(rawSelection);
      if (!cleanQuery || cleanQuery.length < 2 || cleanQuery.length > 90) return;
      if (!/[a-zA-Z]{2,}/.test(cleanQuery)) return;

      const now = Date.now();
      const lowerQuery = cleanQuery.toLowerCase();
      if (
        lastTriggerRef.current &&
        lastTriggerRef.current.query === lowerQuery &&
        now - lastTriggerRef.current.timestamp < 360
      ) {
        return;
      }
      lastTriggerRef.current = { query: lowerQuery, timestamp: now };

      const reqId = ++activeRequestIdRef.current;

      playSelectCue();
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(14);
        } catch {
          // Ignore vibration permission errors
        }
      }

      if (rect && (rect.width > 0 || rect.height > 0)) {
        setAnchorRect({
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          width: rect.width
        });
      }

      setActiveInspectWord(cleanQuery);
      setLookupResult(null);
      setIsLoadingBase(true);

      try {
        const finalResult = await lookupSelectionWithGoogleApis(cleanQuery, {
          lessonVocabulary: vocabulary,
          lessonContext,
          gradeLevel,
          onPartial: (partial) => {
            if (activeRequestIdRef.current !== reqId) return;
            setLookupResult(partial);
            setIsLoadingBase(false);
          }
        });

        if (activeRequestIdRef.current !== reqId) return;
        setLookupResult(finalResult);
      } finally {
        if (activeRequestIdRef.current === reqId) {
          setIsLoadingBase(false);
        }
      }
    },
    [vocabulary, lessonContext, gradeLevel]
  );

  // Close on Escape key
  useEffect(() => {
    if (!activeInspectWord) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDictionaryPopover();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeInspectWord, closeDictionaryPopover]);

  // Compute safe popover positioning within viewport bounds
  const popoverPositionStyle = useMemo<React.CSSProperties>(() => {
    if (typeof window === 'undefined' || !anchorRect) {
      return {};
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw < 640) {
      return {};
    }
    const cardWidth = 440;
    const estHeight = 410;
    const centerLeft = anchorRect.left + anchorRect.width / 2 - cardWidth / 2;
    const clampedLeft = Math.max(16, Math.min(vw - cardWidth - 16, centerLeft));

    const spaceBelow = vh - anchorRect.bottom;
    const showAbove = spaceBelow < estHeight && anchorRect.top > estHeight;
    const topPos = showAbove
      ? Math.max(16, anchorRect.top - estHeight - 12)
      : Math.min(vh - estHeight - 16, anchorRect.bottom + 12);

    return {
      left: `${clampedLeft}px`,
      top: `${topPos}px`,
      width: `${cardWidth}px`
    };
  }, [anchorRect]);

  const handlePlayWordAudio = () => {
    const wordToSpeak = lookupResult?.word || activeInspectWord;
    if (!wordToSpeak) return;
    if (lookupResult?.audioUrl && !/\s/.test(wordToSpeak)) {
      const audio = new Audio(lookupResult.audioUrl);
      audio.play().catch(() => {
        speakText(wordToSpeak, voiceAccent, `dict-${wordToSpeak}`, { rate: 0.9 });
      });
    } else {
      speakText(wordToSpeak, voiceAccent, `dict-${wordToSpeak}`, { rate: 0.9 });
    }
  };

  const handlePlayExampleAudio = (sentence: string) => {
    if (!sentence) return;
    speakText(sentence, voiceAccent, `dict-ex-${activeInspectWord || 'phrase'}`, { rate: 0.88 });
  };

  const isSingleWord = Boolean(activeInspectWord && !/\s/.test(activeInspectWord));
  const isPinnedHighlight =
    isSingleWord && activeInspectWord
      ? highlightedWords.includes(normalizeHighlightKey(activeInspectWord))
      : false;

  const gemini = lookupResult?.geminiInsight;
  const fallbackDefEn = lookupResult?.meanings?.[0]?.definitions?.[0]?.definition;
  const fallbackExampleEn = lookupResult?.meanings?.[0]?.definitions?.[0]?.example;
  const displaySynonyms =
    gemini?.synonyms && gemini.synonyms.length > 0
      ? gemini.synonyms
      : lookupResult?.meanings?.[0]?.synonyms || [];

  return (
    <LessonDictionaryContext.Provider
      value={{
        activeInspectWord,
        highlightedWords,
        isWordHighlighted,
        toggleWordHighlight,
        triggerWordLookup,
        closeDictionaryPopover
      }}
    >
      {children}

      {/* FLOATING GOOGLE GEMINI + DICTIONARY MODAL */}
      <AnimatePresence>
        {activeInspectWord && (
          <div
            className="fixed inset-0 z-[70] bg-black/35 sm:bg-transparent"
            onClick={closeDictionaryPopover}
            role="presentation"
          >
            <motion.aside
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={popoverPositionStyle}
              role="dialog"
              aria-modal="true"
              aria-label={`Analyse Google pour ${activeInspectWord}`}
              className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-auto rounded-2xl bg-[#151b2b] border border-[#f2ca50]/70 text-[#dce2f8] shadow-[0_24px_70px_rgba(0,0,0,0.82)] overflow-hidden flex flex-col max-h-[76vh]"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 bg-[#191f2f] border-b border-[#232a3a] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#0c1322] border border-[#f2ca50]/45 text-[#f2ca50] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-[#f2ca50] leading-tight break-words">
                        {lookupResult?.word || activeInspectWord}
                      </h4>
                      {(lookupResult?.phonetic || gemini?.phonetic || lookupResult?.syllables) && (
                        <span className="text-xs font-mono text-[#d4c78f] tabular-nums">
                          {lookupResult?.phonetic || gemini?.phonetic || lookupResult?.syllables}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#99907c] flex items-center gap-1.5">
                      <span>
                        {gemini
                          ? 'API Google · Définition, Étymologie & Exemple'
                          : lookupResult?.geminiLoading
                          ? 'Consultation de l’API Google...'
                          : lookupResult?.source === 'google_dictionary'
                          ? 'Google Dictionary · En contexte'
                          : 'Lexique du cursus'}
                      </span>
                      {(gemini?.partOfSpeech || lookupResult?.meanings?.[0]?.partOfSpeech) && (
                        <>
                          <span>•</span>
                          <span className="text-[#d4c78f]">
                            {gemini?.partOfSpeech || lookupResult?.meanings?.[0]?.partOfSpeech}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handlePlayWordAudio}
                    className="w-8 h-8 rounded-lg bg-[#0c1322] border border-[#232a3a] hover:border-[#f2ca50]/60 text-[#f2ca50] flex items-center justify-center transition-colors cursor-pointer"
                    title="Écouter la prononciation"
                    aria-label="Écouter la prononciation"
                  >
                    <span className="material-symbols-outlined text-base">volume_up</span>
                  </button>

                  {isSingleWord && (
                    <button
                      type="button"
                      onClick={() => toggleWordHighlight(activeInspectWord)}
                      className={`px-2.5 h-8 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isPinnedHighlight
                          ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00]'
                          : 'bg-[#0c1322] border-[#232a3a] text-[#d4c78f] hover:border-[#f2ca50]/60 hover:text-[#f2ca50]'
                      }`}
                      title={
                        isPinnedHighlight
                          ? 'Retirer la surbrillance persistante'
                          : 'Conserver ce mot surligné dans la leçon'
                      }
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isPinnedHighlight ? 'ink_highlighter' : 'border_color'}
                      </span>
                      <span className="hidden sm:inline">
                        {isPinnedHighlight ? 'Surligné' : 'Surligner'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={closeDictionaryPopover}
                    className="w-8 h-8 rounded-lg bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
                    aria-label="Fermer la fenêtre"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-sm">
                {isLoadingBase && !lookupResult ? (
                  <div className="flex items-center gap-3 py-8 justify-center text-[#d4c78f] text-xs font-mono">
                    <span className="material-symbols-outlined text-lg animate-spin text-[#f2ca50]">
                      progress_activity
                    </span>
                    <span>Analyse instantanée via l&apos;API Google...</span>
                  </div>
                ) : (
                  <>
                    {/* 1. DEFINITION (FR & EN) */}
                    <section className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[#f2ca50] uppercase tracking-wider font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">dictionary</span>
                          Définition
                        </span>
                      </div>

                      {gemini?.definitionFr || lookupResult?.frenchTranslation ? (
                        <p className="text-sm sm:text-[15px] font-semibold text-[#dce2f8] leading-snug">
                          {gemini?.definitionFr || lookupResult?.frenchTranslation}
                        </p>
                      ) : null}

                      {(gemini?.definitionEn || fallbackDefEn) && (
                        <p className="text-xs text-[#d0c5af] leading-relaxed border-t border-[#232a3a]/80 pt-1.5">
                          <span className="font-mono text-[10px] text-[#99907c] mr-1.5 uppercase">
                            EN :
                          </span>
                          {gemini?.definitionEn || fallbackDefEn}
                        </p>
                      )}

                      {displaySynonyms.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                          <span className="text-[10px] font-mono text-[#99907c]">Synonymes :</span>
                          {displaySynonyms.map((syn) => (
                            <button
                              key={syn}
                              type="button"
                              onClick={() => triggerWordLookup(syn)}
                              className="text-xs text-[#d4c78f] hover:text-[#f2ca50] underline underline-offset-2 cursor-pointer"
                            >
                              {syn}
                            </button>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 2. ETYMOLOGY */}
                    {lookupResult?.geminiLoading ? (
                      <section className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#d4c78f]">
                          <span className="material-symbols-outlined text-sm animate-spin text-[#f2ca50]">
                            progress_activity
                          </span>
                          <span>Extraction de l&apos;étymologie et de l&apos;exemple bilingue...</span>
                        </div>
                        <div className="h-3 w-3/4 rounded bg-[#1d2538] animate-pulse" />
                        <div className="h-3 w-full rounded bg-[#1d2538] animate-pulse" />
                      </section>
                    ) : gemini ? (
                      <>
                        <section className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-[#f2ca50] uppercase tracking-wider font-bold flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">history_edu</span>
                              Étymologie
                            </span>
                            {gemini.etymologyOrigin && (
                              <span className="text-[11px] font-mono text-[#d4c78f]">
                                {gemini.etymologyOrigin}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-[13px] text-[#dce2f8]/90 leading-relaxed">
                            {gemini.etymologyDetail}
                          </p>
                        </section>

                        {/* 3. BILINGUAL EXAMPLE SENTENCE */}
                        <section className="p-3 rounded-xl bg-[#0c1322] border border-[#f2ca50]/35 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-[#f2ca50] uppercase tracking-wider font-bold flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">translate</span>
                              Phrase d&apos;exemple bilingue
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePlayExampleAudio(gemini.exampleEn)}
                              className="text-[11px] font-mono text-[#d4c78f] hover:text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                              title="Écouter la phrase d'exemple"
                            >
                              <span className="material-symbols-outlined text-sm">volume_up</span>
                              <span>Écouter</span>
                            </button>
                          </div>

                          <p className="font-serif text-sm sm:text-[15px] font-semibold text-[#dce2f8] leading-snug">
                            « {gemini.exampleEn} »
                          </p>
                          <p className="text-xs text-[#d0c5af] italic leading-relaxed">
                            → {gemini.exampleFr}
                          </p>
                        </section>
                      </>
                    ) : (
                      <>
                        {/* Fallback bilingual example from Google Dictionary / curriculum if Gemini failed */}
                        {(fallbackExampleEn || lookupResult?.contextExampleFr) && (
                          <section className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-[#f2ca50] uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">translate</span>
                                Exemple en contexte
                              </span>
                              {fallbackExampleEn && (
                                <button
                                  type="button"
                                  onClick={() => handlePlayExampleAudio(fallbackExampleEn)}
                                  className="text-[11px] font-mono text-[#d4c78f] hover:text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">volume_up</span>
                                  <span>Écouter</span>
                                </button>
                              )}
                            </div>
                            {fallbackExampleEn && (
                              <p className="font-serif text-sm font-semibold text-[#dce2f8]">
                                « {fallbackExampleEn} »
                              </p>
                            )}
                            {lookupResult?.contextExampleFr && (
                              <p className="text-xs text-[#d0c5af] italic">
                                → {lookupResult.contextExampleFr}
                              </p>
                            )}
                          </section>
                        )}

                        {lookupResult?.geminiError && (
                          <div className="p-2.5 rounded-xl bg-amber-950/35 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm text-amber-400 shrink-0 mt-0.5">
                              info
                            </span>
                            <span>{lookupResult.geminiError}</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </LessonDictionaryContext.Provider>
  );
};
