import React, { useState } from 'react';
import {
  SCHOOL_LEVELS,
  SCHOOL_THEMES,
  ALL_SCHOOL_LESSONS,
  getLessonsByGrade,
  downloadCurriculumJson,
  downloadCurriculumCsv,
  downloadCurriculumMarkdown,
  type SchoolGrade,
  type SchoolLesson
} from '../data/schoolCurriculum';
import { LessonDetailModal } from './LessonDetailModal';
import { Grammar6eStudio } from './Grammar6eStudio';
import { RhetoricalAnalyzerView } from './RhetoricalAnalyzerView';

interface SchoolCurriculumViewProps {
  onLessonCompleted?: (lessonId: string, xpEarned: number) => void;
}

export const SchoolCurriculumView: React.FC<SchoolCurriculumViewProps> = ({
  onLessonCompleted
}) => {
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>('6e');
  const [subTab6e, setSubTab6e] = useState<'themes' | 'grammar' | 'rhetoric'>('themes');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLesson, setActiveLesson] = useState<SchoolLesson | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Filter lessons
  const gradeLessons = getLessonsByGrade(selectedGrade);
  const filteredLessons = gradeLessons.filter((lesson) => {
    const matchesTheme = selectedThemeId === 'all' || lesson.theme_id === selectedThemeId;
    const matchesQuery =
      searchQuery === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.grammar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.vocabulary.some((v) => v.term.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTheme && matchesQuery;
  });

  const currentLevelInfo = SCHOOL_LEVELS.find((l) => l.id === selectedGrade);

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
                Base Pédagogique Intégrale • 70 Leçons
              </span>
            </div>

            <h1 className="font-serif text-xl sm:text-3xl text-[#dce2f8] font-bold">
              Cursus Scolaire de la 6e à la Terminale
            </h1>

            <p className="text-xs sm:text-sm text-[#d0c5af]/85 leading-relaxed">
              Progression adaptée à chaque classe sur les 10 thèmes fondamentaux. Chaque leçon intègre vocabulaire sonorisé, grammaire ciblée, dialogue immersif, dictée et quiz interactif.
            </p>
          </div>

          {/* Export Pack Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/15 hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">folder_zip</span>
              <span>Pack Pédagogique 70 Leçons</span>
            </button>

            <span className="text-[10px] text-center text-[#99907c] font-mono">
              Format JSON & CSV pour AI Studio
            </span>
          </div>
        </div>
      </section>

      {/* 7-GRADE CLASS SELECTOR BAR */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">stairs</span>
            Sélectionner la Classe Scolaire
          </span>
          <span className="text-[11px] text-[#d4c78f] font-mono">
            {currentLevelInfo?.cycle} • CECRL {currentLevelInfo?.cefr}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {SCHOOL_LEVELS.map((lev) => {
            const isSelected = selectedGrade === lev.id;
            return (
              <button
                key={lev.id}
                type="button"
                onClick={() => setSelectedGrade(lev.id)}
                className={`py-2.5 px-2 rounded-xl text-center border transition-all relative flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                  isSelected
                    ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold shadow-md shadow-[#f2ca50]/20'
                    : 'bg-[#151b2b] border-[#4d4635]/30 text-[#dce2f8] hover:bg-[#232a3a]'
                }`}
              >
                <span className="font-serif text-sm sm:text-base font-bold leading-none">
                  {lev.label}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase tracking-tight ${
                    isSelected ? 'text-[#3c2f00]/80' : 'text-[#d4c78f]'
                  }`}
                >
                  {lev.cefr}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Grade Objective Note */}
        {currentLevelInfo && (
          <div className="p-3 rounded-xl bg-[#151b2b]/80 border border-[#232a3a] flex items-center gap-2.5 text-xs text-[#d0c5af]">
            <span className="material-symbols-outlined text-[#f2ca50] text-base shrink-0">
              flag
            </span>
            <span>
              <strong>Objectif prioritaire en {currentLevelInfo.label} :</strong>{' '}
              {currentLevelInfo.goal}
            </span>
          </div>
        )}

        {/* 6E SPECIFIC TRI-MODE TOGGLE (THEMES vs GRAMMAR 50 vs RHETORIC) */}
        {selectedGrade === '6e' && (
          <div className="flex flex-col sm:flex-row p-1 rounded-xl bg-[#151b2b] border border-[#f2ca50]/30 shadow-md gap-1 mt-1">
            <button
              type="button"
              onClick={() => setSubTab6e('themes')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                subTab6e === 'themes'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              <span>10 Leçons Thématiques</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab6e('grammar')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                subTab6e === 'rhetoric'
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
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
        <Grammar6eStudio />
      ) : selectedGrade === '6e' && subTab6e === 'rhetoric' ? (
        <RhetoricalAnalyzerView />
      ) : (
        <>
          {/* SEARCH AND 10 THEMES QUICK FILTER */}
          <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#99907c]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une leçon, un mot de vocabulaire, un point grammatical..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#99907c] hover:text-[#dce2f8]"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 10 Themes horizontal pill scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedThemeId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedThemeId === 'all'
                ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
            }`}
          >
            Tous les thèmes (10)
          </button>

          {SCHOOL_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedThemeId(theme.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                    : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{theme.icon}</span>
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 10 LESSONS GRID */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#99907c]">
          <span>
            Affichage de <strong className="text-[#f2ca50]">{filteredLessons.length}</strong> leçon(s) pour la classe de <strong>{currentLevelInfo?.label}</strong>
          </span>
          <span className="font-mono">70 leçons disponibles au total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 rounded-xl bg-[#191f2f] border border-[#4d4635]/30 hover:border-[#f2ca50]/50 transition-all flex flex-col justify-between gap-3 shadow-lg group relative overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                {/* Lesson Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#232a3a] border border-[#f2ca50]/30 text-[#f2ca50] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {lesson.theme_icon}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-mono text-[#d4c78f] uppercase font-bold tracking-wider">
                        {lesson.theme_label}
                      </span>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors truncate">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#f2ca50] bg-[#f2ca50]/15 px-2 py-0.5 rounded-full font-bold shrink-0">
                    {lesson.cefr_level}
                  </span>
                </div>

                {/* Pedagogical Objective */}
                <p className="text-xs text-[#d0c5af]/80 line-clamp-2 leading-relaxed">
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

                {/* Sample Lexicon Tag Strip */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  {lesson.vocabulary.slice(0, 3).map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#232a3a] text-[#d0c5af] text-[10px] font-mono"
                    >
                      {w.term}
                    </span>
                  ))}
                  <span className="text-[10px] text-[#99907c] font-mono">
                    +{lesson.vocabulary.length - 3} termes
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-[#232a3a] pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-[#99907c] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">timer</span>
                    ~{lesson.estimated_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">quiz</span>
                    {lesson.quiz.length} Qs
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveLesson(lesson)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <span>Étudier la Leçon</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
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
      />

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
                    Pack Pédagogique 70 Leçons
                  </h3>
                  <p className="text-xs text-[#d0c5af]/80">
                    Fichiers structurés téléchargeables directement
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center"
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
                className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/40 flex items-center justify-between text-left transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl">data_object</span>
                  <div>
                    <h5 className="font-bold text-xs text-[#dce2f8]">
                      Fichier JSON Intégral (english_boost_mz_curriculum.json)
                    </h5>
                    <p className="text-[11px] text-[#99907c]">
                      70 leçons, 560 mots de vocabulaire, grammaire, dialogues & quiz (~712 Ko)
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#f2ca50] text-base">download</span>
              </button>

              {/* Option 2: CSV */}
              <button
                type="button"
                onClick={() => downloadCurriculumCsv()}
                className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/40 flex items-center justify-between text-left transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#d4c78f] text-xl">table_chart</span>
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
                className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/40 flex items-center justify-between text-left transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl">description</span>
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
              className="w-full py-3 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe088] transition-colors"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
