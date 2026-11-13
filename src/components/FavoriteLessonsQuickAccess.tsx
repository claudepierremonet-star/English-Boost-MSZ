import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_200_LESSONS, type SchoolLesson } from '../data/curriculum';
import { speakText, stopSpeech } from '../services/speechService';

interface FavoriteLessonsQuickAccessProps {
  favoriteLessonIds: string[];
  activeSelectedLessonId?: string | null;
  onOpenLesson: (lesson: SchoolLesson) => void;
  onToggleFavorite: (lessonId: string) => void;
  onSelectActiveLesson: (lesson: SchoolLesson) => void;
  onNavigateToCursus: () => void;
}

export const FavoriteLessonsQuickAccess: React.FC<FavoriteLessonsQuickAccessProps> = ({
  favoriteLessonIds,
  activeSelectedLessonId,
  onOpenLesson,
  onToggleFavorite,
  onSelectActiveLesson,
  onNavigateToCursus
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const favoriteLessons = favoriteLessonIds
    .map((id) => ALL_200_LESSONS.find((l) => l.id === id))
    .filter((l): l is SchoolLesson => Boolean(l));

  const handleToggleAudio = (lesson: SchoolLesson, e: React.MouseEvent) => {
    e.stopPropagation();
    const audioKey = `fav-${lesson.id}`;
    if (playingId === audioKey) {
      stopSpeech();
      setPlayingId(null);
      return;
    }
    setPlayingId(audioKey);
    const phrase =
      lesson.model_phrases && lesson.model_phrases.length > 0
        ? `${lesson.title_en}. ${lesson.model_phrases[0].en}`
        : lesson.title_en;
    speakText(phrase, 'en-GB', audioKey, {
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null)
    });
  };

  return (
    <section
      aria-label="Accès rapide aux leçons favorites"
      className="mx-4 sm:mx-6 my-3 rounded-2xl bg-gradient-to-br from-[#191f2f] via-[#151b2b] to-[#1e2538] border border-rose-500/30 shadow-xl p-4 sm:p-5 flex flex-col gap-3.5"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-sm">
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-rose-300 font-bold uppercase tracking-widest">
                ACCÈS RAPIDE • FAVORIS
              </span>
              <span className="px-2 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-200 text-[10px] font-mono font-bold">
                {favoriteLessons.length} {favoriteLessons.length > 1 ? 'leçons' : 'leçon'}
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-[#dce2f8] truncate">
              Mes Leçons Préférées
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToCursus}
          className="px-3 py-1.5 rounded-xl bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] border border-[#f2ca50]/30 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <span>Tout le Cursus</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      {/* Empty State or Favorite Lesson Cards */}
      {favoriteLessons.length === 0 ? (
        <div className="p-3.5 rounded-xl bg-[#0c1322]/70 border border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#d0c5af]/85">
            <span className="material-symbols-outlined text-rose-400/80 text-lg shrink-0">
              favorite_border
            </span>
            <span>
              Touchez le cœur <strong>♡</strong> sur n&apos;importe quelle fiche de leçon (dans le Cursus ou la Recherche) pour la retrouver ici en un clic.
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToCursus}
            className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 text-[11px] font-mono font-bold shrink-0 self-end sm:self-auto cursor-pointer transition-all"
          >
            Choisir mes favoris
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <AnimatePresence mode="popLayout">
            {favoriteLessons.map((lesson) => {
              const isActive = activeSelectedLessonId === lesson.id;
              const isPlaying = playingId === `fav-${lesson.id}`;
              return (
                <motion.div
                  key={lesson.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onOpenLesson(lesson)}
                  className={`p-3 rounded-xl bg-[#0c1322]/90 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                    isActive
                      ? 'border-[#f2ca50] ring-1 ring-[#f2ca50]/50 shadow-md shadow-[#f2ca50]/10'
                      : 'border-[#232a3a] hover:border-rose-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#191f2f] border border-[#f2ca50]/30 text-[#f2ca50] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-base">
                          {lesson.theme_icon}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-[#f2ca50] bg-[#f2ca50]/10 px-1.5 py-0.2 rounded">
                            {lesson.class_level}
                          </span>
                          <span className="text-[9px] font-mono text-[#d4c78f] uppercase truncate">
                            {lesson.cefr_level} • {lesson.theme_label}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors truncate mt-0.5">
                          {lesson.title}
                        </h4>
                      </div>
                    </div>

                    {/* Remove Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(lesson.id);
                      }}
                      className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90"
                      title="Retirer des favoris"
                      aria-label={`Retirer ${lesson.title} des favoris`}
                    >
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#232a3a]/70">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleToggleAudio(lesson, e)}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50]'
                            : 'bg-[#151b2b] text-[#d4c78f] hover:text-[#f2ca50] border-[#232a3a]'
                        }`}
                        title="Écouter un extrait audio"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {isPlaying ? 'graphic_eq' : 'volume_up'}
                        </span>
                        <span>{isPlaying ? 'Stop' : 'Audio'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectActiveLesson(lesson);
                        }}
                        className={`p-1 rounded-md border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50]'
                            : 'bg-[#151b2b] text-[#99907c] hover:text-[#f2ca50] border-[#232a3a]'
                        }`}
                        title="Activer pour le Studio d'Élocution"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {isActive ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                      </button>
                    </div>

                    <span className="text-[11px] font-bold text-[#f2ca50] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Ouvrir</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
