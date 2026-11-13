import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ALL_200_LESSONS, FLASHCARD_ITEMS, type SchoolLesson, type FlashcardItem } from '../data/curriculum';
import { speakText } from '../services/speechService';
import { getFavoriteLessonIds, toggleFavoriteLesson } from '../firebase/client';

interface GlobalSearchBarProps {
  onSelectLesson: (lesson: SchoolLesson) => void;
  onSelectFlashcard?: (card: FlashcardItem) => void;
  onOpenFlashcardsModal?: () => void;
  activeLessonId?: string | null;
  favoriteLessonIds?: string[];
  onToggleFavorite?: (lessonId: string) => void;
}

type FilterCategory = 'all' | 'lessons' | 'flashcards' | 'favorites';

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSelectLesson,
  onSelectFlashcard,
  onOpenFlashcardsModal,
  activeLessonId,
  favoriteLessonIds,
  onToggleFavorite
}) => {
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [internalFavorites, setInternalFavorites] = useState<string[]>(() => getFavoriteLessonIds());
  useEffect(() => {
    const onFavUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<string[]>;
      if (Array.isArray(customEvt.detail)) {
        setInternalFavorites(customEvt.detail);
      } else {
        setInternalFavorites(getFavoriteLessonIds());
      }
    };
    window.addEventListener('eb_favorites_updated', onFavUpdate);
    return () => window.removeEventListener('eb_favorites_updated', onFavUpdate);
  }, []);

  const effectiveFavorites = favoriteLessonIds ?? internalFavorites;
  const handleHeartClick = (lessonId: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(lessonId);
    } else {
      toggleFavoriteLesson(lessonId).then((next) => setInternalFavorites(next));
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsExpanded(true);
      }
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (!query.trim()) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  // Normalize string helper
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizedQuery = normalize(query.trim());

  // Filter lessons
  const filteredLessons = useMemo(() => {
    if (category === 'favorites') {
      return ALL_200_LESSONS.filter((lesson) => {
        if (!effectiveFavorites.includes(lesson.id)) return false;
        const matchesGrade =
          selectedGrade === 'all' || lesson.class_level.toLowerCase() === selectedGrade.toLowerCase();
        if (!matchesGrade) return false;
        if (!normalizedQuery) return true;
        return (
          normalize(lesson.title).includes(normalizedQuery) ||
          normalize(lesson.title_en).includes(normalizedQuery) ||
          normalize(lesson.learning_objective).includes(normalizedQuery) ||
          normalize(lesson.theme_label).includes(normalizedQuery) ||
          normalize(lesson.grammar?.title || '').includes(normalizedQuery)
        );
      });
    }

    if (!normalizedQuery && selectedGrade === 'all') return [];

    return ALL_200_LESSONS.filter((lesson) => {
      const matchesGrade =
        selectedGrade === 'all' || lesson.class_level.toLowerCase() === selectedGrade.toLowerCase();
      if (!matchesGrade) return false;
      if (!normalizedQuery) return true;

      const titleFr = normalize(lesson.title);
      const titleEn = normalize(lesson.title_en);
      const objective = normalize(lesson.learning_objective);
      const theme = normalize(lesson.theme_label);
      const grammarTitle = normalize(lesson.grammar?.title || '');
      const grammarRule = normalize(lesson.grammar?.rule || '');
      const vocabMatch = lesson.vocabulary.some(
        (v) => normalize(v.term).includes(normalizedQuery) || normalize(v.translation_fr).includes(normalizedQuery)
      );

      return (
        titleFr.includes(normalizedQuery) ||
        titleEn.includes(normalizedQuery) ||
        objective.includes(normalizedQuery) ||
        theme.includes(normalizedQuery) ||
        grammarTitle.includes(normalizedQuery) ||
        grammarRule.includes(normalizedQuery) ||
        vocabMatch
      );
    }).slice(0, 30);
  }, [normalizedQuery, selectedGrade, category, effectiveFavorites]);

  // Filter flashcards
  const filteredFlashcards = useMemo(() => {
    if (!normalizedQuery && selectedGrade === 'all') return [];

    return FLASHCARD_ITEMS.filter((card) => {
      const matchesGrade =
        selectedGrade === 'all' ||
        (card.gradeLevel && card.gradeLevel.toLowerCase() === selectedGrade.toLowerCase());
      if (!matchesGrade) return false;
      if (!normalizedQuery) return true;

      const term = normalize(card.term);
      const frDef = normalize(card.frenchDef);
      const enDef = normalize(card.englishDef);
      const theme = normalize(card.themeLabel || card.theme || '');
      const categoryStr = normalize(card.category || '');

      return (
        term.includes(normalizedQuery) ||
        frDef.includes(normalizedQuery) ||
        enDef.includes(normalizedQuery) ||
        theme.includes(normalizedQuery) ||
        categoryStr.includes(normalizedQuery)
      );
    }).slice(0, 30);
  }, [normalizedQuery, selectedGrade]);

  const totalResultsCount = filteredLessons.length + filteredFlashcards.length;

  const handlePlayVoice = (text: string, id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(id);
    speakText(text, 'en-GB', id, {
      onEnd: () => setPlayingAudioId(null),
      onError: () => setPlayingAudioId(null)
    });
  };

  const handleSelectAndActivateLesson = (lesson: SchoolLesson) => {
    onSelectLesson(lesson);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eb_msz_selected_lesson', JSON.stringify(lesson));
      window.dispatchEvent(new CustomEvent('eb_select_lesson', { detail: lesson }));
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedGrade('all');
    inputRef.current?.focus();
  };

  const searchSuggestions = [
    { label: 'Present Perfect', grade: 'all', q: 'present perfect' },
    { label: 'Voyage & Déplacements', grade: 'all', q: 'voyage' },
    { label: 'Cursus 6e', grade: '6e', q: '' },
    { label: 'Verbes Modaux', grade: 'all', q: 'modal' },
    { label: 'Terminale C1', grade: 'terminale', q: '' }
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto px-4 sm:px-6 my-3 z-30 transition-all"
    >
      {/* SEARCH BAR CONTAINER */}
      <div
        className={`relative w-full rounded-2xl bg-gradient-to-r from-[#172133] via-[#121927] to-[#1a2438] border transition-all duration-300 shadow-xl ${
          isExpanded || query
            ? 'border-[#f2ca50] shadow-[0_8px_30px_rgba(242,202,80,0.25)] ring-2 ring-[#f2ca50]/40'
            : 'border-[#4d4635]/40 hover:border-[#f2ca50]/60'
        }`}
      >
        <div className="flex items-center px-4 py-3 sm:py-3.5 gap-3">
          {/* Gold Search Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsExpanded(true);
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder="Rechercher parmi les 200 leçons et les cartes mémoire..."
            className="flex-1 bg-transparent text-[#dce2f8] placeholder-[#8a99b5] text-xs sm:text-sm font-sans focus:outline-none"
            aria-label="Recherche globale parmi les leçons et cartes mémoire"
          />

          {/* Clear button when input has text */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 rounded-full text-[#94a3b8] hover:text-[#f2ca50] hover:bg-[#1f293d] transition-all cursor-pointer"
              title="Effacer la recherche"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}

          {/* Quick Keyboard Shortcut Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[#0a101f] border border-[#2b354b] text-[10px] font-mono text-[#94a3b8]">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Quick Filter Category Row (when focused or query present) */}
        {(isExpanded || query) && (
          <div className="border-t border-[#232a3a] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-[#0c1322]/80 backdrop-blur-md rounded-b-2xl">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  category === 'all'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm'
                    : 'bg-[#151b2b] text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                Tout ({totalResultsCount})
              </button>
              <button
                type="button"
                onClick={() => setCategory('lessons')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  category === 'lessons'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm'
                    : 'bg-[#151b2b] text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                <span>📚</span>
                <span>200 Leçons ({filteredLessons.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('flashcards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  category === 'flashcards'
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm'
                    : 'bg-[#151b2b] text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                <span>🗂️</span>
                <span>Cartes Mémoire ({filteredFlashcards.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('favorites')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  category === 'favorites'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                    : 'bg-[#151b2b] text-rose-300 border-rose-500/30 hover:border-rose-400'
                }`}
              >
                <span>❤️</span>
                <span>Favoris ({effectiveFavorites.length})</span>
              </button>
            </div>

            {/* School Grade Filter Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#94a3b8] font-mono hidden md:inline">Classe :</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-[#151b2b] border border-[#2b354b] text-[#f2ca50] text-[11px] font-mono rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes classes</option>
                <option value="6e">6e</option>
                <option value="5e">5e</option>
                <option value="4e">4e</option>
                <option value="3e">3e</option>
                <option value="2nde">2nde</option>
                <option value="1re">1re</option>
                <option value="terminale">Terminale</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* EXPANDED RESULTS PANEL */}
      {isExpanded && (
        <div className="mt-2 w-full rounded-2xl bg-gradient-to-br from-[#121927] via-[#0d1424] to-[#151c2e] border border-[#f2ca50]/50 shadow-2xl p-4 sm:p-5 max-h-[75vh] overflow-y-auto flex flex-col gap-4 animate-fadeIn">
          {/* Empty search suggestions */}
          {!query && selectedGrade === 'all' && category !== 'favorites' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Suggestions de recherche rapides
              </span>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(s.q);
                      setSelectedGrade(s.grade);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1b2438] hover:bg-[#f2ca50] text-[#cbd5e1] hover:text-[#3c2f00] text-xs font-mono border border-[#2b354b] hover:border-[#f2ca50] transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <span>🔍</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#94a3b8] italic mt-1">
                Tapez le nom d&apos;une leçon, un point de grammaire, un thème ou un mot d&apos;anglais pour explorer instantanément les 200 leçons et le dictionnaire de cartes mémoire.
              </p>
            </div>
          )}

          {/* No results message */}
          {((query || selectedGrade !== 'all') && totalResultsCount === 0) || (category === 'favorites' && filteredLessons.length === 0) ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-rose-400/60">
                {category === 'favorites' ? 'favorite_border' : 'search_off'}
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#dce2f8]">
                {category === 'favorites' && !query
                  ? 'Aucune leçon favorite pour le moment'
                  : `Aucun résultat pour « ${query} »`}
              </h4>
              <p className="text-xs text-[#94a3b8] max-w-sm">
                {category === 'favorites'
                  ? 'Touchez le cœur ♡ sur une fiche de leçon pour la retrouver instantanément ici.'
                  : 'Essayez un autre mot-clé, sélectionnez « Toutes classes » ou explorez les thèmes transversaux du cursus.'}
              </p>
            </div>
          ) : null}

          {/* SECTION 1: LESSONS RESULTS */}
          {(category === 'all' || category === 'lessons' || category === 'favorites') && filteredLessons.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-[#232a3a] pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#f2ca50]">
                    {category === 'favorites' ? 'favorite' : 'school'}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#f3f4f6]">
                    {category === 'favorites'
                      ? `Mes Leçons Favorites (${filteredLessons.length})`
                      : `Leçons Scolaires (${filteredLessons.length})`}
                  </h4>
                </div>
                <span className="text-[10px] text-[#d4c78f] font-mono">200 Leçons Officielles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredLessons.map((lesson) => {
                  const isActive = activeLessonId === lesson.id;
                  const isFav = effectiveFavorites.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className={`p-3.5 rounded-xl bg-[#172133] border transition-all flex flex-col justify-between gap-2 ${
                        isActive
                          ? 'border-[#f2ca50] ring-1 ring-[#f2ca50]/50 shadow-md'
                          : 'border-[#2b354b]/60 hover:border-[#f2ca50]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0">
                            {lesson.theme_icon}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-[#f2ca50] font-mono uppercase font-bold truncate">
                              {lesson.theme_label}
                            </span>
                            <h5 className="font-serif font-bold text-xs sm:text-sm text-[#f3f4f6] truncate">
                              {lesson.title}
                            </h5>
                            <span className="text-[11px] text-[#94a3b8] italic truncate">
                              {lesson.title_en}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-[#f2ca50] text-[#3c2f00] text-[9px] font-mono font-bold">
                              Active
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-[#f2ca50]/15 text-[#f2ca50] text-[9px] font-mono font-bold">
                            {lesson.cefr_level}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#232a3a] text-[#94a3b8] text-[9px] font-mono uppercase">
                            {lesson.class_level}
                          </span>
                        </div>
                      </div>

                      {/* Grammar & Objective Snippet */}
                      <p className="text-[11px] text-[#cbd5e1] line-clamp-2 leading-relaxed">
                        <strong className="text-[#f2ca50]">{lesson.grammar.title} : </strong>
                        {lesson.learning_objective}
                      </p>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-[#232a3a]/70 flex items-center justify-between gap-2 flex-wrap">
                        {/* Audio Preview Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayVoice(lesson.title_en, `lesson-${lesson.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#0f1728] hover:bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {playingAudioId === `lesson-${lesson.id}` ? 'graphic_eq' : 'volume_up'}
                          </span>
                          <span>Audio</span>
                        </button>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {/* Favorite Heart Toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeartClick(lesson.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-90 ${
                              isFav
                                ? 'bg-rose-500/20 text-rose-400 border-rose-400/70'
                                : 'bg-[#151b2b] text-[#94a3b8] hover:text-rose-400 border-[#2b354b]'
                            }`}
                            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            aria-pressed={isFav}
                          >
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {isFav ? 'favorite' : 'favorite_border'}
                            </span>
                          </button>

                          {/* Set Active Lesson */}
                          <button
                            type="button"
                            onClick={() => handleSelectAndActivateLesson(lesson)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50]'
                                : 'bg-[#151b2b] text-[#94a3b8] hover:text-[#f2ca50] border-[#2b354b]'
                            }`}
                            title="Définir comme leçon active pour le Studio d'Élocution"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isActive ? 'bookmark_added' : 'bookmark_add'}
                            </span>
                          </button>

                          {/* Open Lesson Detail */}
                          <button
                            type="button"
                            onClick={() => handleSelectAndActivateLesson(lesson)}
                            className="px-3 py-1 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Étudier</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: FLASHCARDS RESULTS */}
          {(category === 'all' || category === 'flashcards') && filteredFlashcards.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-center justify-between border-b border-[#232a3a] pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#38bdf8]">
                    style
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#f3f4f6]">
                    Cartes Mémoire ({filteredFlashcards.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={onOpenFlashcardsModal}
                  className="text-[10px] text-[#38bdf8] hover:text-[#7dd3fc] font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Ouvrir l'Atelier Flashcards</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredFlashcards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => onSelectFlashcard?.(card)}
                    className="p-3.5 rounded-xl bg-[#172133] border border-[#2b354b]/60 hover:border-[#38bdf8]/60 transition-all flex flex-col justify-between gap-2 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#f3f4f6] group-hover:text-[#38bdf8] transition-colors">
                            {card.term}
                          </span>
                          <span className="text-[11px] font-mono text-[#f2ca50]/80">
                            [{card.phonetic}]
                          </span>
                        </div>
                        <span className="text-xs text-[#dce2f8] font-medium mt-0.5">
                          {card.frenchDef}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 text-[9px] font-mono font-bold">
                          {card.level}
                        </span>
                        {card.gradeLevel && (
                          <span className="px-1.5 py-0.5 rounded bg-[#232a3a] text-[#94a3b8] text-[9px] font-mono uppercase">
                            {card.gradeLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Definition & Context */}
                    <p className="text-[11px] text-[#94a3b8] line-clamp-2 leading-relaxed">
                      {card.englishDef}
                    </p>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-[#232a3a]/70 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVoice(card.term, `card-${card.id}`);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#0f1728] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {playingAudioId === `card-${card.id}` ? 'graphic_eq' : 'volume_up'}
                        </span>
                        <span>Écouter</span>
                      </button>

                      <span className="text-[10px] text-[#64748b] font-mono">
                        {card.themeLabel || card.theme || 'Vocabulaire'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
