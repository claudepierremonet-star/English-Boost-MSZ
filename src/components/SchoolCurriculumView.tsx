import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ALL_200_LESSONS,
  CURRICULUM_200_STRUCTURE,
  getCurriculumByGrade,
  getCurriculum200Stats,
  SCHOOL_LEVELS_DATA,
  SCHOOL_THEMES_DATA,
  type SchoolGrade,
  type SchoolLesson,
  type ThemeCurriculumGroup
} from '../data/curriculum';
import {
  downloadCurriculumJson,
  downloadCurriculumCsv,
  downloadCurriculumMarkdown
} from '../data/schoolCurriculum';
import {
  MAX_CITY_LEVEL,
  getBlock50ForLevel,
  getLevelBlocksOf50,
  type CityLevelNode
} from '../data/cityMapData';
import { LevelGroupNavigator } from './LevelGroupNavigator';
import type { CityMapProgressionState } from '../firebase/types';
import {
  getCityMapProgression,
  type CityChapterCompletionResult
} from '../utils/cityMapManager';
import { CityLevelChaptersModal } from './CityLevelChaptersModal';
import { LessonDetailModal } from './LessonDetailModal';
import { Grammar6eStudio } from './Grammar6eStudio';
import { RhetoricalAnalyzerView } from './RhetoricalAnalyzerView';
import { getBestVoice } from '../services/speechService';
import { getFavoriteLessonIds, toggleFavoriteLesson, getLocalUserProfile } from '../firebase/client';
import { LessonDictionaryProvider } from './LessonDictionaryContext';
import { useAdaptiveProfile } from '../hooks/useAdaptiveProfile';
import { AdaptiveGlobalBanner } from './AdaptiveGlobalBanner';

interface SchoolCurriculumViewProps {
  onLessonCompleted?: (lessonId: string, xpEarned: number) => void;
  activeSelectedLessonId?: string | null;
  onSelectLesson?: (lesson: SchoolLesson | null) => void;
  favoriteLessonIds?: string[];
  onToggleFavorite?: (lessonId: string) => void;
  cityProgression?: CityMapProgressionState;
  playerLevel?: number;
  onCityXpEarned?: (xp: number) => void;
  onCityProgressionUpdated?: (nextState: CityMapProgressionState) => void;
}

export const SchoolCurriculumView: React.FC<SchoolCurriculumViewProps> = ({
  onLessonCompleted,
  activeSelectedLessonId,
  onSelectLesson,
  favoriteLessonIds,
  onToggleFavorite,
  cityProgression,
  playerLevel = 1,
  onCityXpEarned,
  onCityProgressionUpdated
}) => {
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>(() => {
    try {
      return getLocalUserProfile().schoolGrade || '6e';
    } catch {
      return '6e';
    }
  });
  const { assessment: adaptiveAssessment } = useAdaptiveProfile();
  const recommendedLessonIdsSet = useMemo(
    () => new Set(adaptiveAssessment.modulePlans.cursus.recommendedLessonIds),
    [adaptiveAssessment.modulePlans.cursus.recommendedLessonIds]
  );
  const [subTab6e, setSubTab6e] = useState<'themes' | 'grammar' | 'rhetoric'>('themes');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'themes_sections' | 'compact_grid'>('themes_sections');
  const [activeLesson, setActiveLesson] = useState<SchoolLesson | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // 600-level progression & 50-level CollapsibleLevelGroup state
  const [internalCityProgression, setInternalCityProgression] = useState<CityMapProgressionState>(() =>
    getCityMapProgression()
  );
  useEffect(() => {
    const handleCityUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<CityMapProgressionState>;
      if (customEvt.detail && typeof customEvt.detail.unlockedLevel === 'number') {
        setInternalCityProgression(customEvt.detail);
      } else {
        setInternalCityProgression(getCityMapProgression());
      }
    };
    window.addEventListener('eb_city_map_updated', handleCityUpdate);
    return () => window.removeEventListener('eb_city_map_updated', handleCityUpdate);
  }, []);

  const effectiveCityProgression = cityProgression ?? internalCityProgression;
  const unlockedCityLevel = Math.max(
    1,
    Math.min(MAX_CITY_LEVEL, effectiveCityProgression.unlockedLevel || 1)
  );
  const conqueredLevelsSet = useMemo(
    () => new Set(effectiveCityProgression.conqueredLevels || []),
    [effectiveCityProgression.conqueredLevels]
  );
  const levelBlocks50 = useMemo(() => getLevelBlocksOf50(50), []);
  const activeBlock50 = useMemo(
    () => getBlock50ForLevel(unlockedCityLevel, 50),
    [unlockedCityLevel]
  );
  const [expandedLevelBlocks, setExpandedLevelBlocks] = useState<Record<string, boolean>>(() => ({
    [activeBlock50.id]: true
  }));
  const [activeCityLevelModal, setActiveCityLevelModal] = useState<number | null>(null);
  const [lockedLevelNotice, setLockedLevelNotice] = useState<number | null>(null);

  const handleToggleLevelBlock = useCallback((blockId: string) => {
    setExpandedLevelBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  }, []);

  const handleExpandSingleLevelBlock = useCallback((blockId: string) => {
    setExpandedLevelBlocks({ [blockId]: true });
  }, []);

  const handleSetAllLevelBlocks = useCallback(
    (expandAll: boolean) => {
      const next: Record<string, boolean> = {};
      for (const blk of levelBlocks50) {
        next[blk.id] = expandAll;
      }
      setExpandedLevelBlocks(next);
    },
    [levelBlocks50]
  );

  const handleSelectCityLevelNode = useCallback(
    (lvl: CityLevelNode) => {
      if (lvl.levelNumber > unlockedCityLevel) {
        setLockedLevelNotice(lvl.levelNumber);
        return;
      }
      setLockedLevelNotice(null);
      setActiveCityLevelModal(lvl.levelNumber);
    },
    [unlockedCityLevel]
  );

  const handleCityChapterComplete = useCallback(
    (res: CityChapterCompletionResult) => {
      setInternalCityProgression(res.state);
      onCityProgressionUpdated?.(res.state);
      if (res.xpAwarded > 0) {
        onCityXpEarned?.(res.xpAwarded);
      }
    },
    [onCityProgressionUpdated, onCityXpEarned]
  );

  const [internalFavorites, setInternalFavorites] = useState<string[]>(() => getFavoriteLessonIds());
  useEffect(() => {
    const handleFavUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<string[]>;
      if (Array.isArray(customEvt.detail)) {
        setInternalFavorites(customEvt.detail);
      } else {
        setInternalFavorites(getFavoriteLessonIds());
      }
    };
    window.addEventListener('eb_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('eb_favorites_updated', handleFavUpdate);
  }, []);

  const effectiveFavorites = favoriteLessonIds ?? internalFavorites;
  const handleToggleFav = (lessonId: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(lessonId);
    } else {
      toggleFavoriteLesson(lessonId).then((next) => setInternalFavorites(next));
    }
  };

  // Audio Summary TTS State
  const [audioSummaryLesson, setAudioSummaryLesson] = useState<SchoolLesson | null>(null);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [audioAccent, setAudioAccent] = useState<'en-GB' | 'en-US' | 'fr-FR'>('en-GB');
  const [audioRate, setAudioRate] = useState<number>(0.95);
  const [audioCurrentSentence, setAudioCurrentSentence] = useState<string>('');
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  const speechCancelRef = useRef<(() => void) | null>(null);

  // Dynamic Grade Curriculum data from src/data/curriculum.ts
  const gradeCurriculum = getCurriculumByGrade(selectedGrade);
  const currentLevelInfo =
    SCHOOL_LEVELS_DATA.find((l) => l.id === selectedGrade) || SCHOOL_LEVELS_DATA[0];
  const stats200 = getCurriculum200Stats();

  // All lessons for the selected grade
  const allGradeLessons = gradeCurriculum.themes.flatMap((tg) => tg.lessons);

  // Filter lessons dynamically based on theme, favorites mode, and search query
  const sourcePool = showFavoritesOnly
    ? ALL_200_LESSONS.filter((l) => effectiveFavorites.includes(l.id))
    : allGradeLessons;

  const filteredLessons = sourcePool.filter((lesson) => {
    const matchesTheme = showFavoritesOnly || selectedThemeId === 'all' || lesson.theme_id === selectedThemeId;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesTheme;

    const matchesQuery =
      lesson.title.toLowerCase().includes(query) ||
      lesson.title_en.toLowerCase().includes(query) ||
      lesson.learning_objective.toLowerCase().includes(query) ||
      lesson.grammar.title.toLowerCase().includes(query) ||
      lesson.grammar.rule.toLowerCase().includes(query) ||
      lesson.vocabulary.some(
        (v) =>
          v.term.toLowerCase().includes(query) ||
          v.translation_fr.toLowerCase().includes(query)
      );

    return matchesTheme && matchesQuery;
  });

  // Filtered themes with their matching lessons for the themes-grouped view
  const activeThemesGroups = gradeCurriculum.themes
    .filter((tg) => selectedThemeId === 'all' || tg.themeId === selectedThemeId)
    .map((tg) => ({
      ...tg,
      matchingLessons: tg.lessons.filter((l) =>
        filteredLessons.some((fl) => fl.id === l.id)
      )
    }))
    .filter((tg) => tg.matchingLessons.length > 0);

  // Broadcast active lesson modal state so HeaderSessionTimer activates seamlessly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eb_lesson_session_state', { detail: activeLesson }));
    }
  }, [activeLesson]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechCancelRef.current) {
        speechCancelRef.current();
      }
    };
  }, []);

  // Text-To-Speech Generation Function
  const generateSpeechScript = (
    lesson: SchoolLesson,
    accent: 'en-GB' | 'en-US' | 'fr-FR'
  ): string => {
    const topVocab = lesson.vocabulary.slice(0, 4);

    if (accent === 'fr-FR') {
      const vocabText = topVocab
        .map((v) => `${v.term}, traduit par ${v.translation_fr}`)
        .join('. ');
      const modelText = lesson.model_phrases && lesson.model_phrases.length > 0
        ? `Phrase modèle : ${lesson.model_phrases[0].en}. En français : ${lesson.model_phrases[0].fr}.`
        : '';

      return `Résumé audio pédagogique de la leçon : ${lesson.title}. Classe de ${lesson.class_label}, cycle ${lesson.cycle}, niveau ${lesson.cefr_level}. Thème officiel : ${lesson.theme_label}. Objectif d'apprentissage : ${lesson.learning_objective}. Point clé de grammaire : ${lesson.grammar.title}. Règle principale : ${lesson.grammar.rule}. Exemple pratique : ${lesson.grammar.example_en}. Vocabulaire essentiel : ${vocabText}. ${modelText} Fin du résumé audio.`;
    }

    // English script (en-GB or en-US)
    const vocabItems = topVocab
      .map((v) => `${v.term}. Meaning: ${v.translation_fr}`)
      .join('. ');
    const modelSentence = lesson.model_phrases && lesson.model_phrases.length > 0
      ? `Key model sentence: ${lesson.model_phrases[0].en}. Meaning: ${lesson.model_phrases[0].fr}.`
      : '';

    return `Audio summary for lesson: ${lesson.title_en}. Grade level: ${lesson.class_label}, CEFR level ${lesson.cefr_level}. Theme: ${lesson.theme_en}. Learning objective: ${lesson.learning_objective}. Grammar focus: ${lesson.grammar.title}. Grammar rule: ${lesson.grammar.rule}. Key sentence example: ${lesson.grammar.example_en}. Essential vocabulary: ${vocabItems}. ${modelSentence} That concludes the audio summary.`;
  };

  // Play audio summary with robust sentence-chunked SpeechSynthesis
  const startAudioPlayback = (
    lesson: SchoolLesson,
    accent: 'en-GB' | 'en-US' | 'fr-FR' = audioAccent,
    rate: number = audioRate
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioNotice("La synthèse vocale n'est pas supportée sur ce navigateur.");
      return;
    }
    setAudioNotice(null);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    if (speechCancelRef.current) {
      speechCancelRef.current();
    }

    const script = generateSpeechScript(lesson, accent);
    // Split into sentences for smooth playback without browser cutoff
    const sentences = script.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
    let currentIndex = 0;
    let isCancelled = false;

    setIsAudioPlaying(true);
    setIsAudioPaused(false);
    setAudioCurrentSentence(sentences[0] || '');

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    try {
      if (accent === 'en-US' || accent === 'en-GB') {
        selectedVoice = getBestVoice(accent);
      }
    } catch {
      // Fallback below
    }

    if (!selectedVoice) {
      if (accent === 'fr-FR') {
        selectedVoice =
          voices.find(
            (v) =>
              v.lang.toLowerCase() === 'fr-fr' ||
              v.lang.toLowerCase() === 'fr_fr' ||
              v.lang.startsWith('fr')
          ) || null;
      } else if (accent === 'en-US') {
        selectedVoice =
          voices.find(
            (v) =>
              v.lang.toLowerCase() === 'en-us' ||
              v.lang.toLowerCase() === 'en_us' ||
              v.name.toLowerCase().includes('united states') ||
              v.name.toLowerCase().includes('us') ||
              v.name.toLowerCase().includes('american')
          ) || null;
      } else {
        selectedVoice =
          voices.find(
            (v) =>
              v.lang.toLowerCase() === 'en-gb' ||
              v.lang.toLowerCase() === 'en_gb' ||
              v.name.toLowerCase().includes('united kingdom') ||
              v.name.toLowerCase().includes('uk') ||
              v.name.toLowerCase().includes('british')
          ) || null;
      }
    }

    function speakNext() {
      if (isCancelled) return;
      if (currentIndex >= sentences.length) {
        setIsAudioPlaying(false);
        setIsAudioPaused(false);
        setAudioCurrentSentence('');
        return;
      }

      const sentence = sentences[currentIndex].trim();
      setAudioCurrentSentence(sentence);

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = accent;
      utterance.rate = rate;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (isCancelled) return;
        currentIndex++;
        speakNext();
      };

      utterance.onerror = (e) => {
        if (isCancelled || e.error === 'interrupted' || e.error === 'canceled') return;
        console.warn('SpeechSynthesis error:', e);
        setIsAudioPlaying(false);
        setIsAudioPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    }

    speakNext();

    speechCancelRef.current = () => {
      isCancelled = true;
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
      setAudioCurrentSentence('');
    };
  };

  // Main action trigger: Start TTS with British or American native voice
  const handlePlayAudioLesson = (lesson: SchoolLesson, preferredAccent?: 'en-GB' | 'en-US') => {
    const chosenAccent = preferredAccent || (audioAccent === 'fr-FR' ? 'en-GB' : audioAccent);
    setAudioAccent(chosenAccent);
    setAudioSummaryLesson(lesson);
    setShowAudioModal(true);
    startAudioPlayback(lesson, chosenAccent, audioRate);
  };

  // Legacy alias for existing handlers
  const handleGenerateAudioSummary = (lesson: SchoolLesson) => {
    handlePlayAudioLesson(lesson, audioAccent === 'fr-FR' ? 'en-GB' : audioAccent);
  };

  // Pause / Resume TTS
  const handleToggleAudioPause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isAudioPaused) {
      window.speechSynthesis.resume();
      setIsAudioPaused(false);
      setIsAudioPlaying(true);
    } else if (isAudioPlaying) {
      window.speechSynthesis.pause();
      setIsAudioPaused(true);
    } else if (audioSummaryLesson) {
      startAudioPlayback(audioSummaryLesson, audioAccent, audioRate);
    }
  };

  // Stop TTS
  const handleStopAudio = () => {
    if (speechCancelRef.current) {
      speechCancelRef.current();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
      setAudioCurrentSentence('');
    }
  };

  // Change Accent and re-trigger
  const handleChangeAccent = (accent: 'en-GB' | 'en-US' | 'fr-FR') => {
    setAudioAccent(accent);
    if (audioSummaryLesson && isAudioPlaying) {
      startAudioPlayback(audioSummaryLesson, accent, audioRate);
    }
  };

  // Change Rate and re-trigger
  const handleChangeRate = (rate: number) => {
    setAudioRate(rate);
    if (audioSummaryLesson && isAudioPlaying) {
      startAudioPlayback(audioSummaryLesson, audioAccent, rate);
    }
  };

  // Copy transcript to clipboard
  const handleCopyTranscript = (lesson: SchoolLesson) => {
    const text = generateSpeechScript(lesson, audioAccent);
    navigator.clipboard?.writeText(text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleSelectLessonAndOpen = (lesson: SchoolLesson) => {
    setActiveLesson(lesson);
    if (onSelectLesson) {
      onSelectLesson(lesson);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('eb_msz_selected_lesson', JSON.stringify(lesson));
      window.dispatchEvent(new CustomEvent('eb_select_lesson', { detail: lesson }));
    }
  };

  const handleToggleSelectOnly = (lesson: SchoolLesson) => {
    const isAlreadySelected = activeSelectedLessonId === lesson.id;
    const target = isAlreadySelected ? null : lesson;
    if (onSelectLesson) {
      onSelectLesson(target);
    }
    if (typeof window !== 'undefined') {
      if (target) {
        localStorage.setItem('eb_msz_selected_lesson', JSON.stringify(target));
      } else {
        localStorage.removeItem('eb_msz_selected_lesson');
      }
      window.dispatchEvent(new CustomEvent('eb_select_lesson', { detail: target }));
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 pb-24 gap-5 select-none">
      {/* HERO BANNER & PACK DOWNLOAD CTA */}
      <section className="relative w-full rounded-2xl bg-[#191f2f] p-5 sm:p-6 shadow-xl border border-[#4d4635]/40 overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-[#232a3a] border border-[#f2ca50]/20">
              <span
                className="material-symbols-outlined text-[#f2ca50] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
                Base Pédagogique Intégrale • {stats200.totalLessons} Leçons Dynamiques
              </span>
            </div>

            <h1 className="font-serif text-xl sm:text-3xl text-[#dce2f8] font-bold">
              Cursus Scolaire de la 6e à la Terminale
            </h1>

            <p className="text-xs sm:text-sm text-[#d0c5af]/85 leading-relaxed">
              Progression didactique continue sur les 10 univers thématiques transversaux. Chaque leçon intègre vocabulaire sonorisé, grammaire ciblée, dialogue immersif, dictée et quiz interactif.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] text-[#f2ca50] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_stories</span>
                {stats200.totalLessons} Leçons Réparties
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] text-[#d4c78f] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">translate</span>
                +{stats200.totalVocabulary} Vocabulaires
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] text-[#d0c5af] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">category</span>
                10 Thèmes par Classe
              </span>
            </div>
          </div>

          {/* Export Pack Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/15 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">folder_zip</span>
              <span>Pack Pédagogique 200 Leçons</span>
            </button>

            <span className="text-[10px] text-center text-[#99907c] font-mono">
              Format JSON & CSV pour AI Studio
            </span>
          </div>
        </div>
      </section>

      {/* GLOBAL ADAPTIVE LEARNING ENGINE BANNER (CURSUS CONTEXT) */}
      <AdaptiveGlobalBanner
        context="cursus"
        onPrimaryAction={() => {
          const recGrade = adaptiveAssessment.modulePlans.cursus.recommendedGrade;
          if (recGrade !== selectedGrade) {
            setSelectedGrade(recGrade);
            setSelectedThemeId('all');
            setShowFavoritesOnly(false);
          }
          const topLesson = adaptiveAssessment.recommendedLessons[0] || allGradeLessons[0];
          if (topLesson) {
            handleSelectLessonAndOpen(topLesson);
          }
        }}
      />

      {/* 600 LEVELS GROUPED BY 50 USING LEVEL GROUP NAVIGATOR */}
      <section
        aria-label="Parcours des 600 niveaux regroupés par blocs de 50"
        className="p-4 sm:p-5 rounded-2xl bg-[#151b2b]/95 border border-[#232a3a] shadow-lg flex flex-col gap-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232a3a] pb-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#f2ca50]">
              <span className="material-symbols-outlined text-base">layers</span>
              <span className="font-bold uppercase tracking-wider">
                Index 600 Niveaux · Groupes de 50
              </span>
              <span className="text-[#99907c] tabular-nums">
                ({conqueredLevelsSet.size}/{MAX_CITY_LEVEL} conquis)
              </span>
            </div>
            <p className="text-xs text-[#d0c5af]/85">
              Condensez ou étendez chaque plage de 50 niveaux (1–50, 51–100…) et filtrez par tranche de 10 pour accéder directement aux chapitres.
            </p>
          </div>
        </div>

        {lockedLevelNotice !== null && (
          <div className="p-3 rounded-xl bg-[#0c1322] border border-[#f2ca50]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#dce2f8]">
              <span className="material-symbols-outlined text-base text-[#f2ca50]">lock</span>
              <span>
                Le <strong>Niveau {lockedLevelNotice}</strong> est verrouillé. Complétez d&apos;abord les 10 chapitres du{' '}
                <strong className="text-[#f2ca50]">Niveau {unlockedCityLevel}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setLockedLevelNotice(null)}
                className="px-2.5 py-1 rounded-lg bg-[#191f2f] text-[#99907c] hover:text-white cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  setLockedLevelNotice(null);
                  setActiveCityLevelModal(unlockedCityLevel);
                }}
                className="px-3 py-1 rounded-lg bg-[#f2ca50] text-[#3c2f00] font-bold cursor-pointer"
              >
                Ouvrir Niveau {unlockedCityLevel}
              </button>
            </div>
          </div>
        )}

        <LevelGroupNavigator
          blocks={levelBlocks50}
          expandedBlocks={expandedLevelBlocks}
          onToggleBlock={handleToggleLevelBlock}
          onExpandSingleBlock={handleExpandSingleLevelBlock}
          onSetAllBlocks={handleSetAllLevelBlocks}
          unlockedLevel={unlockedCityLevel}
          conqueredSet={conqueredLevelsSet}
          completedChaptersByLevel={effectiveCityProgression.completedChaptersByLevel || {}}
          onSelectLevel={handleSelectCityLevelNode}
        />
      </section>

      {/* 7-GRADE CLASS SELECTOR BAR */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">stairs</span>
            Sélectionner la Classe Scolaire
          </span>
          <span className="text-[11px] text-[#d4c78f] font-mono">
            {currentLevelInfo.cycle} • CECRL {currentLevelInfo.cefr} •{' '}
            <strong className="text-[#f2ca50]">{gradeCurriculum.totalLessons} Leçons</strong>
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {SCHOOL_LEVELS_DATA.map((lev) => {
            const isSelected = selectedGrade === lev.id;
            const levCurriculum = getCurriculumByGrade(lev.id);
            return (
              <button
                key={lev.id}
                type="button"
                onClick={() => {
                  setSelectedGrade(lev.id);
                  setSelectedThemeId('all');
                }}
                className={`py-2.5 px-2 rounded-xl text-center border transition-all relative flex flex-col items-center justify-center gap-0.5 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold shadow-md shadow-[#f2ca50]/20 ring-2 ring-[#f2ca50]/50'
                    : 'bg-[#151b2b] border-[#4d4635]/30 text-[#dce2f8] hover:bg-[#232a3a]'
                }`}
              >
                <span className="font-serif text-sm sm:text-base font-bold leading-none">
                  {lev.label}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase tracking-tight ${
                    isSelected ? 'text-[#3c2f00]/80 font-bold' : 'text-[#d4c78f]'
                  }`}
                >
                  {lev.cefr} ({levCurriculum.totalLessons})
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Grade Pedagogical Focus Note */}
        {currentLevelInfo && (
          <div className="p-3.5 rounded-xl bg-[#151b2b]/90 border border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#d0c5af]">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0">
                flag
              </span>
              <span>
                <strong>Objectif prioritaire en {currentLevelInfo.label} :</strong>{' '}
                {currentLevelInfo.goal}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#99907c] shrink-0 self-end sm:self-auto">
              <span>{gradeCurriculum.totalLessons} leçons</span>
              <span>•</span>
              <span>{gradeCurriculum.totalVocabulary} mots</span>
              <span>•</span>
              <span>10 thèmes</span>
            </div>
          </div>
        )}

        {/* 6E SPECIFIC TRI-MODE TOGGLE (THEMES vs GRAMMAR 50 vs RHETORIC) */}
        {selectedGrade === '6e' && (
          <div className="flex flex-col sm:flex-row p-1 rounded-xl bg-[#151b2b] border border-[#f2ca50]/30 shadow-md gap-1 mt-1">
            <button
              type="button"
              onClick={() => setSubTab6e('themes')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                subTab6e === 'themes'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              <span>Cursus Thématique ({gradeCurriculum.totalLessons} leçons)</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab6e('grammar')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                subTab6e === 'grammar'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              <span>Atelier Grammaire (50 Fiches)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#3c2f00]/20 text-[10px] font-mono">
                50
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab6e('rhetoric')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                subTab6e === 'rhetoric'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span>Analyse Rhétorique Automatique</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                Auto
              </span>
            </button>
          </div>
        )}
      </section>

      {/* RENDER EITHER GRAMMAR 6E STUDIO, RHETORICAL ANALYZER OR STANDARD THEMATIC LESSONS */}
      {selectedGrade === '6e' && subTab6e === 'grammar' ? (
        <LessonDictionaryProvider lessonId="curriculum-6e-grammar" gradeLevel="6e (A1)">
          <Grammar6eStudio />
        </LessonDictionaryProvider>
      ) : selectedGrade === '6e' && subTab6e === 'rhetoric' ? (
        <LessonDictionaryProvider lessonId="curriculum-6e-rhetoric" gradeLevel="6e (A1)">
          <RhetoricalAnalyzerView />
        </LessonDictionaryProvider>
      ) : (
        <>
          {/* SEARCH, QUICK AUDIO ACTION AND 10 THEMES FILTER */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              {/* Search box */}
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#99907c]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une leçon, un thème (voyage, travail...), du vocabulaire ou un point grammatical..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#99907c] hover:text-[#dce2f8] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#151b2b] border border-[#232a3a] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('themes_sections')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'themes_sections'
                      ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                  title="Affichage groupé par les 10 thèmes"
                >
                  <span className="material-symbols-outlined text-sm">view_agenda</span>
                  <span>Par Thèmes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact_grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'compact_grid'
                      ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                  title="Affichage en grille continue"
                >
                  <span className="material-symbols-outlined text-sm">grid_view</span>
                  <span>Grille Rapide</span>
                </button>
              </div>
            </div>

            {/* QUICK AUDIO BAR: SELECT ANY LESSON & GENERATE AUDIO SUMMARY */}
            <div className="p-3 rounded-xl bg-[#151b2b] border border-[#f2ca50]/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#232a3a] border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">headphones</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#dce2f8] flex items-center gap-1.5">
                    <span>Synthèse Vocale Audio des Leçons</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[9px] font-mono font-bold">
                      Text-to-Speech
                    </span>
                  </span>
                  <span className="text-[11px] text-[#99907c]">
                    Générez un résumé audio oral d'une leçon avec prononciation authentique.
                  </span>
                </div>
              </div>

              {/* Lesson Picker & Trigger Button */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const audioPickerLessons =
                    audioSummaryLesson && !allGradeLessons.some((l) => l.id === audioSummaryLesson.id)
                      ? [audioSummaryLesson, ...allGradeLessons]
                      : allGradeLessons;
                  const resolvedAudioId =
                    audioSummaryLesson?.id || filteredLessons[0]?.id || allGradeLessons[0]?.id || '';
                  return (
                    <select
                      aria-label="Sélectionner une leçon pour le résumé audio"
                      value={resolvedAudioId}
                      onChange={(e) => {
                        const found = ALL_200_LESSONS.find((l) => l.id === e.target.value);
                        if (found) setAudioSummaryLesson(found);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0c1322] border border-[#232a3a] text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none max-w-[220px] truncate"
                    >
                      {audioPickerLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.class_label} • {l.theme_label} : {l.title}
                        </option>
                      ))}
                    </select>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => {
                    const target = audioSummaryLesson || filteredLessons[0] || allGradeLessons[0];
                    if (target) handleGenerateAudioSummary(target);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#f2ca50]/15 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">volume_up</span>
                  <span>Générer résumé audio</span>
                </button>
              </div>
            </div>

            {audioNotice && (
              <div className="px-3 py-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">volume_off</span>
                  <span>{audioNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioNotice(null)}
                  className="text-amber-300 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 10 Themes + Favorites horizontal pill scroller with dynamic lesson counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  if (!showFavoritesOnly) {
                    setSelectedThemeId('all');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                  showFavoritesOnly
                    ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-md shadow-rose-500/25'
                    : 'bg-[#151b2b] text-rose-300 hover:text-rose-200 border-rose-500/40 hover:border-rose-400'
                }`}
                title="Afficher uniquement mes leçons favorites sauvegardées"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: showFavoritesOnly || effectiveFavorites.length > 0 ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                <span>Mes Favoris</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    showFavoritesOnly
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-500/20 text-rose-200'
                  }`}
                >
                  {effectiveFavorites.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setSelectedThemeId('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  !showFavoritesOnly && selectedThemeId === 'all'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                }`}
              >
                Tous les thèmes ({gradeCurriculum.totalLessons})
              </button>

              {gradeCurriculum.themes.map((themeGroup) => {
                const isSelected = !showFavoritesOnly && selectedThemeId === themeGroup.themeId;
                return (
                  <button
                    key={themeGroup.themeId}
                    type="button"
                    onClick={() => {
                      setShowFavoritesOnly(false);
                      setSelectedThemeId(themeGroup.themeId);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                        : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {themeGroup.themeIcon}
                    </span>
                    <span>{themeGroup.themeLabel}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-[#3c2f00]/20 text-[#3c2f00]'
                          : 'bg-[#232a3a] text-[#d4c78f]'
                      }`}
                    >
                      {themeGroup.lessonsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* DYNAMIC LESSONS LIST */}
          <section className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#99907c] flex-wrap gap-2">
              {showFavoritesOnly ? (
                <span className="flex items-center gap-1.5 text-rose-200">
                  <span
                    className="material-symbols-outlined text-sm text-rose-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  Affichage de <strong className="text-rose-300">{filteredLessons.length}</strong>{' '}
                  leçon(s) favorite(s) sur l&apos;ensemble du cursus (6e ➔ Terminale)
                </span>
              ) : (
                <span>
                  Affichage de <strong className="text-[#f2ca50]">{filteredLessons.length}</strong>{' '}
                  leçon(s) pour la classe de <strong>{currentLevelInfo.label}</strong>
                </span>
              )}
              <span className="font-mono">
                {stats200.totalLessons} leçons réparties de la 6e à la Terminale
              </span>
            </div>

            {/* Empty state */}
            {filteredLessons.length === 0 && (
              <div className="p-8 rounded-2xl bg-[#151b2b] border border-[#232a3a] text-center flex flex-col items-center justify-center gap-3">
                <span
                  className="material-symbols-outlined text-4xl text-rose-400/70"
                  style={{ fontVariationSettings: showFavoritesOnly ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {showFavoritesOnly ? 'favorite_border' : 'search_off'}
                </span>
                <p className="text-sm text-[#dce2f8] font-serif">
                  {showFavoritesOnly && !searchQuery
                    ? "Vous n'avez encore aucune leçon favorite sauvegardée."
                    : `Aucune leçon ne correspond à votre recherche « ${searchQuery} »`}
                </p>
                {showFavoritesOnly && !searchQuery && (
                  <p className="text-xs text-[#99907c] max-w-md">
                    Cliquez sur l&apos;icône cœur ♡ sur n&apos;importe quelle carte de leçon pour la sauvegarder ici et y accéder instantanément.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedThemeId('all');
                    setShowFavoritesOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#232a3a] text-[#f2ca50] text-xs font-bold hover:bg-[#f2ca50] hover:text-[#3c2f00] transition-colors cursor-pointer"
                >
                  {showFavoritesOnly ? 'Parcourir toutes les leçons' : 'Réinitialiser les filtres'}
                </button>
              </div>
            )}

            {/* FAVORITES FLAT GRID OR COMPACT GRID */}
            {(showFavoritesOnly || viewMode === 'compact_grid') && filteredLessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredLessons.map((lesson) => (
                  <LessonCardItem
                    key={lesson.id}
                    lesson={lesson}
                    isActiveSelected={activeSelectedLessonId === lesson.id}
                    isAdaptiveRecommended={recommendedLessonIdsSet.has(lesson.id)}
                    isFavorite={effectiveFavorites.includes(lesson.id)}
                    isCurrentAudioLesson={audioSummaryLesson?.id === lesson.id}
                    isAudioPlaying={isAudioPlaying && audioSummaryLesson?.id === lesson.id}
                    onSelect={() => handleSelectLessonAndOpen(lesson)}
                    onToggleActiveLesson={() => handleToggleSelectOnly(lesson)}
                    onToggleFavorite={() => handleToggleFav(lesson.id)}
                    onPlayAudioLesson={(accent) => handlePlayAudioLesson(lesson, accent)}
                    onGenerateAudioSummary={() => handleGenerateAudioSummary(lesson)}
                  />
                ))}
              </div>
            ) : null}

            {/* MODE 1: ORGANIZED BY THEMES (10 TRANSVERSAL UNIVERSES) */}
            {!showFavoritesOnly && viewMode === 'themes_sections' && filteredLessons.length > 0 ? (
              <div className="flex flex-col gap-6">
                {activeThemesGroups.map((themeGroup) => (
                  <div
                    key={themeGroup.themeId}
                    className="p-4 sm:p-5 rounded-2xl bg-[#151b2b]/90 border border-[#232a3a] flex flex-col gap-3.5 shadow-md"
                  >
                    {/* Theme Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#232a3a]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#232a3a] border border-[#f2ca50]/30 text-[#f2ca50] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">
                            {themeGroup.themeIcon}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#f2ca50]">
                              {themeGroup.themeLabel}
                            </h3>
                            <span className="text-[10px] font-mono text-[#99907c] italic hidden sm:inline">
                              ({themeGroup.themeEn})
                            </span>
                          </div>
                          <span className="text-[11px] text-[#d0c5af]/70">
                            Thème officiel • {themeGroup.matchingLessons.length} leçon(s) en {currentLevelInfo.label}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#3c2f00] bg-[#f2ca50] px-2.5 py-0.5 rounded-full">
                        {themeGroup.matchingLessons.length} leçons
                      </span>
                    </div>

                    {/* Lessons Grid within this Theme */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {themeGroup.matchingLessons.map((lesson) => (
                        <LessonCardItem
                          key={lesson.id}
                          lesson={lesson}
                          isActiveSelected={activeSelectedLessonId === lesson.id}
                          isAdaptiveRecommended={recommendedLessonIdsSet.has(lesson.id)}
                          isFavorite={effectiveFavorites.includes(lesson.id)}
                          isCurrentAudioLesson={audioSummaryLesson?.id === lesson.id}
                          isAudioPlaying={isAudioPlaying && audioSummaryLesson?.id === lesson.id}
                          onSelect={() => handleSelectLessonAndOpen(lesson)}
                          onToggleActiveLesson={() => handleToggleSelectOnly(lesson)}
                          onToggleFavorite={() => handleToggleFav(lesson.id)}
                          onPlayAudioLesson={(accent) => handlePlayAudioLesson(lesson, accent)}
                          onGenerateAudioSummary={() => handleGenerateAudioSummary(lesson)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </>
      )}

      {/* INTERACTIVE LESSON MODAL */}
      <LessonDetailModal
        lesson={activeLesson}
        isOpen={activeLesson !== null}
        onClose={() => setActiveLesson(null)}
        onCompleteLesson={(id, xp) => {
          if (onLessonCompleted) onLessonCompleted(id, xp);
        }}
        isFavorite={activeLesson ? effectiveFavorites.includes(activeLesson.id) : false}
        onToggleFavorite={activeLesson ? () => handleToggleFav(activeLesson.id) : undefined}
      />

      {/* 600-LEVEL CHAPTERS & QUIZ MODAL LAUNCHED FROM COLLAPSIBLE LEVEL GROUP */}
      {activeCityLevelModal !== null && (
        <CityLevelChaptersModal
          levelNumber={activeCityLevelModal}
          progression={effectiveCityProgression}
          playerLevel={playerLevel}
          onClose={() => setActiveCityLevelModal(null)}
          onChapterCompleted={handleCityChapterComplete}
          onNavigateToLevel={(nextLvl) => setActiveCityLevelModal(nextLvl)}
        />
      )}

      {/* TEXT-TO-SPEECH AUDIO SUMMARY MODAL */}
      {showAudioModal && audioSummaryLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => {
            handleStopAudio();
            setShowAudioModal(false);
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/50 text-[#dce2f8] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#232a3a] pb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-md shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    {isAudioPlaying && !isAudioPaused ? 'graphic_eq' : 'headphones'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[10px] font-bold font-mono uppercase">
                      {audioSummaryLesson.class_label} • {audioSummaryLesson.cefr_level}
                    </span>
                    <span className="text-[11px] font-mono text-[#d4c78f] uppercase">
                      {audioSummaryLesson.theme_label}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] truncate mt-0.5">
                    {audioSummaryLesson.title}
                  </h3>
                  <span className="text-xs text-[#99907c] font-mono italic">
                    {audioSummaryLesson.title_en}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleStopAudio();
                  setShowAudioModal(false);
                }}
                className="w-8 h-8 rounded-full bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* AUDIO CONTROL DOCK */}
            <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Visualizer & Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 h-6 px-2.5 py-1 rounded-lg bg-[#0c1322] border border-[#232a3a]">
                    {[45, 90, 65, 100, 75, 50, 85].map((height, i) => (
                      <span
                        key={i}
                        className={`w-1 bg-[#f2ca50] rounded-full transition-all duration-200 ${
                          isAudioPlaying && !isAudioPaused ? 'animate-pulse' : 'opacity-30'
                        }`}
                        style={{
                          height: isAudioPlaying && !isAudioPaused ? `${height}%` : '25%',
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-mono font-semibold text-[#f2ca50]">
                    {isAudioPlaying && !isAudioPaused
                      ? 'Lecture du résumé en cours...'
                      : isAudioPaused
                      ? 'Synthèse en pause'
                      : 'Prêt pour la lecture audio'}
                  </span>
                </div>

                {/* Main Playback Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleAudioPause}
                    className="px-3.5 py-1.5 rounded-lg bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffe088] active:scale-95 transition-all cursor-pointer shadow-md shadow-[#f2ca50]/15"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isAudioPlaying && !isAudioPaused ? 'pause' : 'play_arrow'}
                    </span>
                    <span>{isAudioPlaying && !isAudioPaused ? 'Pause' : 'Reprendre'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="p-1.5 rounded-lg bg-[#232a3a] text-[#d0c5af] hover:text-rose-400 border border-[#232a3a] transition-all cursor-pointer"
                    title="Arrêter la lecture"
                  >
                    <span className="material-symbols-outlined text-base">stop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startAudioPlayback(audioSummaryLesson, audioAccent, audioRate)
                    }
                    className="p-1.5 rounded-lg bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a] transition-all cursor-pointer"
                    title="Rejouer depuis le début"
                  >
                    <span className="material-symbols-outlined text-base">replay</span>
                  </button>
                </div>
              </div>

              {/* Accent & Speed Settings Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#232a3a]/80 text-xs">
                {/* Accent selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#99907c] text-[11px] font-mono">Accent :</span>
                  <div className="inline-flex rounded-lg bg-[#0c1322] p-0.5 border border-[#232a3a]">
                    <button
                      type="button"
                      onClick={() => handleChangeAccent('en-GB')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        audioAccent === 'en-GB'
                          ? 'bg-[#f2ca50] text-[#3c2f00]'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      🇬🇧 British (RP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeAccent('en-US')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        audioAccent === 'en-US'
                          ? 'bg-[#f2ca50] text-[#3c2f00]'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      🇺🇸 American (US)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeAccent('fr-FR')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        audioAccent === 'fr-FR'
                          ? 'bg-[#f2ca50] text-[#3c2f00]'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      🇫🇷 Bilingue FR
                    </button>
                  </div>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#99907c] text-[11px] font-mono">Débit :</span>
                  <div className="inline-flex rounded-lg bg-[#0c1322] p-0.5 border border-[#232a3a]">
                    {[0.8, 0.95, 1.15].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleChangeRate(rate)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          audioRate === rate
                            ? 'bg-[#f2ca50] text-[#3c2f00]'
                            : 'text-[#d0c5af] hover:text-white'
                        }`}
                      >
                        {rate === 0.8 ? '0.8x' : rate === 0.95 ? '1.0x' : '1.2x'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Spoken Sentence Highlight */}
              {audioCurrentSentence && (
                <div className="p-2.5 rounded-lg bg-[#0c1322] border border-[#f2ca50]/30 text-xs text-[#f2ca50] font-mono leading-relaxed">
                  <span className="text-[10px] text-[#99907c] block uppercase tracking-wider mb-0.5">
                    Phrase lue en direct :
                  </span>
                  « {audioCurrentSentence} »
                </div>
              )}
            </div>

            {/* PEDAGOGICAL SUMMARY STRUCTURED TRANSCRIPT */}
            <div className="flex flex-col gap-3 bg-[#151b2b]/60 p-4 rounded-xl border border-[#232a3a]">
              <span className="text-xs font-mono text-[#f2ca50] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">description</span>
                Transcription Complète du Résumé Pédagogique
              </span>

              {/* Objective */}
              <div className="p-3 rounded-lg bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#d4c78f] font-bold">
                  🎯 Objectif d'apprentissage
                </span>
                <p className="text-xs text-[#dce2f8] leading-relaxed">
                  {audioSummaryLesson.learning_objective}
                </p>
              </div>

              {/* Grammar */}
              <div className="p-3 rounded-lg bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#d4c78f] font-bold">
                  📐 Point de Grammaire Clé : {audioSummaryLesson.grammar.title}
                </span>
                <p className="text-xs text-[#dce2f8] leading-relaxed">
                  {audioSummaryLesson.grammar.rule}
                </p>
                <div className="text-[11px] font-mono text-[#f2ca50] mt-1 bg-[#151b2b] p-1.5 rounded">
                  Exemple : {audioSummaryLesson.grammar.example_en} ({audioSummaryLesson.grammar.example_fr})
                </div>
              </div>

              {/* Vocabulary */}
              <div className="p-3 rounded-lg bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase text-[#d4c78f] font-bold">
                  🔤 Vocabulaire Indispensable
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {audioSummaryLesson.vocabulary.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-1.5 rounded bg-[#151b2b] border border-[#232a3a] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#dce2f8]">{v.term}</span>
                        <span className="text-[10px] text-[#f2ca50] font-mono">[{v.phonetic}]</span>
                      </div>
                      <span className="text-[#99907c] text-[11px]">{v.translation_fr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Phrase */}
              {audioSummaryLesson.model_phrases && audioSummaryLesson.model_phrases.length > 0 && (
                <div className="p-3 rounded-lg bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-[#d4c78f] font-bold">
                    💬 Phrase Modèle
                  </span>
                  <p className="text-xs font-serif font-bold text-[#f2ca50]">
                    « {audioSummaryLesson.model_phrases[0].en} »
                  </p>
                  <p className="text-[11px] text-[#99907c]">
                    {audioSummaryLesson.model_phrases[0].fr}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#232a3a]">
              <button
                type="button"
                onClick={() => handleCopyTranscript(audioSummaryLesson)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#d0c5af] hover:text-[#f2ca50] hover:border-[#f2ca50]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedTranscript ? 'done' : 'content_copy'}
                </span>
                <span>{copiedTranscript ? 'Copié dans le presse-papier !' : 'Copier le script audio'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleStopAudio();
                    setShowAudioModal(false);
                    setActiveLesson(audioSummaryLesson);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Ouvrir la Leçon Complète</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleStopAudio();
                    setShowAudioModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#151b2b] text-[#99907c] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PACK MODAL */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#191f2f] border border-[#f2ca50]/40 text-[#dce2f8] p-6 shadow-2xl flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-xl">folder_zip</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#dce2f8]">
                    Pack Pédagogique 200 Leçons
                  </h3>
                  <p className="text-xs text-[#d0c5af]/80">
                    Fichiers structurés téléchargeables directement
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Le pack intégral couvre l'intégralité des 7 classes (6e à Terminale) et des 10 thèmes pédagogiques. Il est structuré pour une exploitation directe dans Google AI Studio, Firestore, ou tout LMS scolaire.
            </p>

            <div className="flex flex-col gap-2.5">
              {/* Option 1: JSON */}
              <button
                type="button"
                onClick={() => downloadCurriculumJson()}
                className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/40 flex items-center justify-between text-left transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl">
                    data_object
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-[#dce2f8]">
                      Fichier JSON Intégral (english_boost_mz_200_lecons.json)
                    </h5>
                    <p className="text-[11px] text-[#99907c]">
                      200 leçons structurées, plus de 1 600 termes sonorisés, grammaire, dialogues & quiz (~2,2 Mo)
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#f2ca50] text-base">download</span>
              </button>

              {/* Option 2: CSV */}
              <button
                type="button"
                onClick={() => downloadCurriculumCsv()}
                className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/40 flex items-center justify-between text-left transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#d4c78f] text-xl">
                    table_chart
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-[#dce2f8]">
                      Index CSV Tabulaire (index_lecons.csv)
                    </h5>
                    <p className="text-[11px] text-[#99907c]">
                      Tableau structuré pour Excel, Google Sheets ou suivi enseignant
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#d4c78f] text-base">download</span>
              </button>

              {/* Option 3: Markdown */}
              <button
                type="button"
                onClick={() => downloadCurriculumMarkdown()}
                className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/40 flex items-center justify-between text-left transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl">
                    description
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-[#dce2f8]">
                      Guide Pédagogique Officiel (GUIDE_PEDAGOGIQUE_FR.md)
                    </h5>
                    <p className="text-[11px] text-[#99907c]">
                      Documentation didactique, objectifs CECRL et conseils d'utilisation
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#f2ca50] text-base">download</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="w-full py-3 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe088] transition-colors cursor-pointer"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { CollapsibleLevelGroup, type CollapsibleLevelGroupProps } from './LevelGroupNavigator';

/**
 * Composant de carte individuelle affichant toutes les propriétés d'une leçon
 * avec le bouton 'Lecture Audio' et le sélecteur de voix native britannique / américaine
 */
interface LessonCardItemProps {
  lesson: SchoolLesson;
  isActiveSelected?: boolean;
  isAdaptiveRecommended?: boolean;
  isFavorite?: boolean;
  isCurrentAudioLesson?: boolean;
  isAudioPlaying?: boolean;
  onSelect: () => void;
  onToggleActiveLesson?: () => void;
  onToggleFavorite?: () => void;
  onPlayAudioLesson?: (accent: 'en-GB' | 'en-US') => void;
  onGenerateAudioSummary?: () => void;
}

const LessonCardItem: React.FC<LessonCardItemProps> = ({
  lesson,
  isActiveSelected = false,
  isAdaptiveRecommended = false,
  isFavorite = false,
  isCurrentAudioLesson = false,
  isAudioPlaying = false,
  onSelect,
  onToggleActiveLesson,
  onToggleFavorite,
  onPlayAudioLesson,
  onGenerateAudioSummary
}) => {
  const [selectedAccent, setSelectedAccent] = useState<'en-GB' | 'en-US'>('en-GB');

  const handlePlayAudio = (accentToUse: 'en-GB' | 'en-US') => {
    if (onPlayAudioLesson) {
      onPlayAudioLesson(accentToUse);
    } else if (onGenerateAudioSummary) {
      onGenerateAudioSummary();
    }
  };

  return (
    <div
      className={`p-4 rounded-xl bg-[#191f2f] border transition-all flex flex-col justify-between gap-3 shadow-lg group relative overflow-hidden ${
        isActiveSelected
          ? 'border-[#f2ca50] ring-2 ring-[#f2ca50]/70 shadow-[0_0_25px_rgba(242,202,80,0.22)]'
          : isCurrentAudioLesson && isAudioPlaying
          ? 'border-[#f2ca50] ring-1 ring-[#f2ca50]/50 shadow-[0_0_20px_rgba(242,202,80,0.18)]'
          : isFavorite
          ? 'border-rose-500/45 hover:border-rose-400/70'
          : 'border-[#4d4635]/30 hover:border-[#f2ca50]/50'
      }`}
    >
      <div className="flex flex-col gap-2.5">
        {/* Lesson Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#232a3a] border border-[#f2ca50]/30 text-[#f2ca50] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">{lesson.theme_icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-[#d4c78f] uppercase font-bold tracking-wider truncate">
                {lesson.theme_label}
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors line-clamp-1">
                {lesson.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isAdaptiveRecommended && !isActiveSelected && (
              <span className="text-[9px] font-mono text-emerald-200 bg-emerald-950/60 border border-emerald-400/50 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">auto_awesome</span>
                <span>Adapté</span>
              </span>
            )}
            {isActiveSelected && (
              <span className="text-[10px] font-mono text-[#3c2f00] bg-[#f2ca50] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 shadow-sm">
                <span>⭐</span>
                <span>Active</span>
              </span>
            )}
            <span className="text-[10px] font-mono text-[#f2ca50] bg-[#f2ca50]/15 px-2 py-0.5 rounded-full font-bold">
              {lesson.cefr_level}
            </span>
            <span className="text-[9px] font-mono text-[#99907c] bg-[#232a3a] px-1.5 py-0.5 rounded-md uppercase">
              {lesson.class_level}
            </span>
            {/* Heart Favorite Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-400/70 text-rose-400 shadow-sm shadow-rose-500/20 hover:bg-rose-500/30'
                  : 'bg-[#151b2b] border-[#232a3a] text-[#99907c] hover:text-rose-400 hover:border-rose-500/40'
              }`}
              title={isFavorite ? 'Retirer des leçons favorites' : 'Ajouter aux leçons favorites'}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={isFavorite}
            >
              <span
                className="material-symbols-outlined text-base transition-transform duration-200"
                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isFavorite ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>
        </div>

        {/* English title subtitle */}
        <p className="text-[11px] font-mono text-[#99907c] italic -mt-1 truncate">
          {lesson.title_en}
        </p>

        {/* Pedagogical Objective */}
        <p className="text-xs text-[#d0c5af]/85 line-clamp-2 leading-relaxed">
          {lesson.learning_objective}
        </p>

        {/* Grammar Pill */}
        <div className="p-2 rounded-lg bg-[#151b2b] border border-[#232a3a] flex items-center gap-2 text-[11px] text-[#dce2f8]">
          <span className="material-symbols-outlined text-[#f2ca50] text-sm shrink-0">
            history_edu
          </span>
          <span className="font-mono text-[#f2ca50] font-semibold truncate">
            {lesson.grammar.title}
          </span>
        </div>

        {/* Sample Lexicon Tag Strip with phonetics */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {lesson.vocabulary.slice(0, 3).map((w, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-[#232a3a] text-[#d0c5af] text-[10px] font-mono flex items-center gap-1"
              title={`${w.term} [${w.phonetic}] : ${w.translation_fr}`}
            >
              <span>{w.term}</span>
              <span className="text-[#f2ca50]/70 text-[9px]">[{w.phonetic}]</span>
            </span>
          ))}
          {lesson.vocabulary.length > 3 && (
            <span className="text-[10px] text-[#99907c] font-mono">
              +{lesson.vocabulary.length - 3} termes
            </span>
          )}
        </div>

        {/* Dialogue & Dictation mini tags */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#99907c]">
          <span className="flex items-center gap-1 bg-[#151b2b] px-2 py-0.5 rounded border border-[#232a3a]">
            <span className="material-symbols-outlined text-xs text-[#d4c78f]">record_voice_over</span>
            Dialogue {lesson.dialogue.lines.length} répliques
          </span>
          {lesson.dictation && (
            <span className="flex items-center gap-1 bg-[#151b2b] px-2 py-0.5 rounded border border-[#232a3a]">
              <span className="material-symbols-outlined text-xs text-[#f2ca50]">headphones</span>
              Dictée
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer with 'Lecture Audio' Button & Native Voice Options */}
      <div className="border-t border-[#232a3a] pt-3 flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between text-[11px] text-[#99907c] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">timer</span>
              ~{lesson.estimated_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">quiz</span>
              {lesson.quiz.length} Qs
            </span>
          </div>

          <span className="text-[10px] text-[#d4c78f] font-mono flex items-center gap-1">
            <span>Voix :</span>
            <strong className="text-[#f2ca50]">
              {selectedAccent === 'en-GB' ? 'Britannique (UK)' : 'Américaine (US)'}
            </strong>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          {/* Audio Action Cluster: Accent Switch + Lecture Audio Button */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Native Voice Toggle (🇬🇧 UK vs 🇺🇸 US) */}
            <div className="inline-flex rounded-lg bg-[#0c1322] p-0.5 border border-[#374151]/70 shadow-inner">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAccent('en-GB');
                  if (isCurrentAudioLesson && isAudioPlaying) {
                    handlePlayAudio('en-GB');
                  }
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedAccent === 'en-GB'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-extrabold'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
                title="Voix native britannique (UK - Received Pronunciation)"
              >
                <span>🇬🇧</span>
                <span>UK</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAccent('en-US');
                  if (isCurrentAudioLesson && isAudioPlaying) {
                    handlePlayAudio('en-US');
                  }
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedAccent === 'en-US'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm font-extrabold'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
                title="Voix native américaine (US - General American)"
              >
                <span>🇺🇸</span>
                <span>US</span>
              </button>
            </div>

            {/* Bouton 'Lecture Audio' */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAudio(selectedAccent);
              }}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md ${
                isCurrentAudioLesson && isAudioPlaying
                  ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/20 animate-pulse font-extrabold'
                  : 'bg-gradient-to-r from-[#172133] to-[#121927] hover:from-[#f2ca50]/20 hover:to-[#f2ca50]/10 text-[#f2ca50] border-[#f2ca50]/50 hover:border-[#f2ca50]'
              }`}
              title={`Lancer la lecture audio synthétique avec voix native ${
                selectedAccent === 'en-GB' ? 'britannique (UK)' : 'américaine (US)'
              } via Web Speech API`}
            >
              <span className="material-symbols-outlined text-sm">
                {isCurrentAudioLesson && isAudioPlaying ? 'graphic_eq' : 'volume_up'}
              </span>
              <span>
                {isCurrentAudioLesson && isAudioPlaying ? 'En cours...' : 'Lecture Audio'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Quick Toggle Active Lesson Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActiveLesson?.();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                isActiveSelected
                  ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-sm'
                  : 'bg-[#151b2b] hover:bg-[#f2ca50]/20 text-[#d4c78f] hover:text-[#f2ca50] border-[#4d4635]/40'
              }`}
              title={
                isActiveSelected
                  ? 'Leçon actuellement active (affichée dans le raccourci Studio)'
                  : 'Définir comme leçon active pour le Studio d\'Élocution'
              }
            >
              <span className="material-symbols-outlined text-sm">
                {isActiveSelected ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>

            {/* Button: Étudier */}
            <button
              type="button"
              onClick={onSelect}
              className="px-3 py-1.5 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span>Étudier</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
