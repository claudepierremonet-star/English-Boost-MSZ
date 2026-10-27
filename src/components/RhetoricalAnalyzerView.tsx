import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  analyzeRhetoricalStyle,
  RHETORICAL_DEFINITIONS,
  CURATED_6E_RHETORICAL_TEXTS,
  RHETORICAL_QUIZ_QUESTIONS_6E,
  type RhetoricalFigureType,
  type FigureCategory,
  type DetectedFigure,
  type RhetoricalAnalysisReport
} from '../services/rhetoricalAnalyzer';
import { getLessonsByGrade, type SchoolLesson } from '../data/schoolCurriculum';
import { recordAttempt } from '../firebase/client';

interface RhetoricalAnalyzerViewProps {
  initialLessonId?: string;
  onClose?: () => void;
}

export const RhetoricalAnalyzerView: React.FC<RhetoricalAnalyzerViewProps> = ({
  initialLessonId
}) => {
  // Source text selection
  const lessons6e = useMemo(() => getLessonsByGrade('6e'), []);
  
  const [selectedSourceType, setSelectedSourceType] = useState<'curated' | 'lesson6e' | 'custom'>('curated');
  const [selectedCuratedId, setSelectedCuratedId] = useState<string>(CURATED_6E_RHETORICAL_TEXTS[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialLessonId || (lessons6e[0]?.id || '')
  );
  const [lessonPart, setLessonPart] = useState<'dialogue' | 'phrases' | 'dictation'>('dialogue');
  const [customText, setCustomText] = useState<string>('');

  // Active view tab: 'analyzer' | 'quiz' | 'glossary'
  const [viewMode, setViewMode] = useState<'analyzer' | 'quiz' | 'glossary'>('analyzer');

  // Filter for detected figures
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<FigureCategory | 'all'>('all');
  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null);

  // Audio speech synthesis
  const [voiceAccent, setVoiceAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<RhetoricalFigureType | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Compute text to analyze based on selections
  const textToAnalyze = useMemo(() => {
    if (selectedSourceType === 'custom') {
      return customText.trim() || CURATED_6E_RHETORICAL_TEXTS[0].sourceTextEn;
    }
    if (selectedSourceType === 'curated') {
      const found = CURATED_6E_RHETORICAL_TEXTS.find((t) => t.id === selectedCuratedId);
      return found ? found.sourceTextEn : CURATED_6E_RHETORICAL_TEXTS[0].sourceTextEn;
    }
    // lesson6e
    const lesson = lessons6e.find((l) => l.id === selectedLessonId);
    if (!lesson) return CURATED_6E_RHETORICAL_TEXTS[0].sourceTextEn;

    if (lessonPart === 'dialogue') {
      return lesson.dialogue.lines.map((l) => `${l.speaker}: ${l.en}`).join('\n');
    }
    if (lessonPart === 'phrases') {
      return lesson.model_phrases.map((p) => p.en).join('\n');
    }
    if (lessonPart === 'dictation') {
      return `${lesson.dictation.canonical}\n${lesson.dictation.difficulty_note || ''}`;
    }
    return lesson.dialogue.lines.map((l) => l.en).join(' ');
  }, [selectedSourceType, selectedCuratedId, selectedLessonId, lessonPart, customText, lessons6e]);

  // Run analysis
  const report: RhetoricalAnalysisReport = useMemo(() => {
    return analyzeRhetoricalStyle(textToAnalyze);
  }, [textToAnalyze]);

  // Filtered detected figures
  const filteredFigures = useMemo(() => {
    if (activeCategoryFilter === 'all') return report.detectedFigures;
    return report.detectedFigures.filter((f) => f.category === activeCategoryFilter);
  }, [report.detectedFigures, activeCategoryFilter]);

  // Audio speech synthesis helper
  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isPlayingAudio === id) {
      setIsPlayingAudio(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceAccent;
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang.startsWith(voiceAccent)) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;

    setIsPlayingAudio(id);
    utterance.onend = () => setIsPlayingAudio(null);
    utterance.onerror = () => setIsPlayingAudio(null);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Quiz flow
  const currentQ = RHETORICAL_QUIZ_QUESTIONS_6E[currentQuizIdx];

  const handleValidateQuizAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctFigureType;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < RHETORICAL_QUIZ_QUESTIONS_6E.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
    } else {
      setQuizFinished(true);
      recordAttempt({
        moduleId: 'quiz_rhetorical_6e',
        moduleType: 'quiz',
        title: 'Atelier Rhétorique 6e • Figures de Style',
        level: 'A1',
        score: Math.round(((quizScore + (selectedOption === currentQ.correctFigureType ? 1 : 0)) / RHETORICAL_QUIZ_QUESTIONS_6E.length) * 100),
        durationSeconds: 150
      }).catch(console.warn);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setShowHint(false);
    setQuizFinished(false);
  };

  return (
    <div className="flex flex-col w-full gap-5 animate-fadeIn select-none">
      {/* HEADER HERO */}
      <section className="relative rounded-2xl bg-gradient-to-br from-[#121927] via-[#1a2233] to-[#101622] p-5 sm:p-6 border border-[#f2ca50]/30 shadow-xl overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#232a3a] border border-[#f2ca50]/30 w-fit">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="text-[11px] text-[#f2ca50] font-mono font-bold tracking-wider uppercase">
                Analyse Rhétorique Automatique • Cycle 3 / 6e
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#dce2f8] font-bold">
              Détecteur Stylistique & Figures de Style
            </h2>
            <p className="text-xs sm:text-sm text-[#d0c5af]/85 leading-relaxed">
              Détecte instantanément allitérations, comparaisons, assonances, métaphores, répétitions et hyperboles dans les textes du cursus de 6e pour approfondir la compréhension littéraire et orale.
            </p>
          </div>

          {/* Quick Voice Accent Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#151b2b] p-2 rounded-xl border border-[#232a3a]">
            <span className="material-symbols-outlined text-xs text-[#d4c78f]">record_voice_over</span>
            <span className="text-[10px] text-[#99907c] font-mono uppercase">Audio :</span>
            <button
              type="button"
              onClick={() => setVoiceAccent('en-GB')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                voiceAccent === 'en-GB'
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              🇬🇧 UK
            </button>
            <button
              type="button"
              onClick={() => setVoiceAccent('en-US')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                voiceAccent === 'en-US'
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              🇺🇸 US
            </button>
          </div>
        </div>
      </section>

      {/* TOP NAVIGATION: 3 SUB-MODES */}
      <div className="flex p-1 rounded-xl bg-[#151b2b] border border-[#232a3a] gap-1 shadow-md">
        <button
          type="button"
          onClick={() => setViewMode('analyzer')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'analyzer'
              ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
              : 'text-[#d0c5af] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          <span>Analyseur Textuel & Cartographie</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#3c2f00]/20 text-[10px] font-mono">
            {report.detectedFigures.length} fig.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('quiz')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'quiz'
              ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
              : 'text-[#d0c5af] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">psychology</span>
          <span>Défi Quiz Rhétorique (15 Défis)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#3c2f00]/20 text-[10px] font-mono">
            {quizScore}/{RHETORICAL_QUIZ_QUESTIONS_6E.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('glossary')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'glossary'
              ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
              : 'text-[#d0c5af] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">menu_book</span>
          <span>Fiches Mémo 6e (12 Figures)</span>
        </button>
      </div>

      {/* MODE 1: ANALYZER VIEW */}
      {viewMode === 'analyzer' && (
        <div className="flex flex-col gap-5">
          {/* SOURCE TEXT PICKER CARD */}
          <div className="rounded-2xl bg-[#151b2b] p-4 sm:p-5 border border-[#232a3a] flex flex-col gap-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">source</span>
                1. Sélectionner le texte à analyser
              </span>

              {/* Source Type Switcher */}
              <div className="flex items-center gap-1 bg-[#0c1322] p-1 rounded-xl border border-[#232a3a] text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedSourceType('curated')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedSourceType === 'curated'
                      ? 'bg-[#f2ca50] text-[#3c2f00]'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                >
                  Textes Expressifs 6e
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSourceType('lesson6e')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedSourceType === 'lesson6e'
                      ? 'bg-[#f2ca50] text-[#3c2f00]'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                >
                  Les 10 Leçons Thématiques 6e
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSourceType('custom')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedSourceType === 'custom'
                      ? 'bg-[#f2ca50] text-[#3c2f00]'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                >
                  Texte Libre / Coller
                </button>
              </div>
            </div>

            {/* CURATED PRESETS */}
            {selectedSourceType === 'curated' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {CURATED_6E_RHETORICAL_TEXTS.map((t) => {
                  const isSelected = selectedCuratedId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedCuratedId(t.id);
                        setSelectedFigureId(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-[#232a3a] border-[#f2ca50] shadow-md shadow-[#f2ca50]/15'
                          : 'bg-[#191f2f]/60 border-[#232a3a] hover:border-[#f2ca50]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#dce2f8]">{t.titleFr}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-xs text-[#f2ca50]">check_circle</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#99907c] font-mono">{t.author}</span>
                      <p className="text-[11px] text-[#d0c5af]/80 line-clamp-2 leading-relaxed">
                        {t.descriptionFr}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 10 LESSONS 6E PRESETS */}
            {selectedSourceType === 'lesson6e' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {lessons6e.map((lesson) => {
                    const isSelected = selectedLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setSelectedFigureId(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-[#232a3a] border-[#f2ca50] shadow-md shadow-[#f2ca50]/15'
                            : 'bg-[#191f2f]/60 border-[#232a3a] hover:border-[#f2ca50]/40'
                        }`}
                      >
                        <span className="text-base">{lesson.theme_icon}</span>
                        <span className="text-xs font-bold text-[#dce2f8] line-clamp-1">
                          {lesson.title}
                        </span>
                        <span className="text-[10px] text-[#d4c78f] font-mono line-clamp-1">
                          {lesson.title_en}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-part selector within the lesson */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#232a3a]">
                  <span className="text-xs text-[#d0c5af] font-medium">Partie du cours :</span>
                  <div className="flex items-center gap-1 bg-[#0c1322] p-1 rounded-lg border border-[#232a3a] text-xs">
                    <button
                      type="button"
                      onClick={() => setLessonPart('dialogue')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        lessonPart === 'dialogue'
                          ? 'bg-[#f2ca50] text-[#3c2f00]'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      Dialogue Intégral
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonPart('phrases')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        lessonPart === 'phrases'
                          ? 'bg-[#f2ca50] text-[#3c2f00]'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      Phrases Modèles
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonPart('dictation')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        lessonPart === 'dictation'
                          ? 'bg-[#f2ca50] text-[#3c2f00]'
                          : 'text-[#d0c5af] hover:text-white'
                      }`}
                    >
                      Texte Dictée
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOM TEXT AREA */}
            {selectedSourceType === 'custom' && (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Collez ou écrivez un dialogue, une strophe de poème ou des phrases en anglais pour lancer l'analyse rhétorique automatique..."
                  className="w-full p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none focus:ring-1 focus:ring-[#f2ca50] font-sans leading-relaxed resize-y"
                />
                <span className="text-[10px] text-[#99907c] font-mono">
                  Conseil : Essayez d'inclure des allitérations ('six sweet strawberries'), des comparaisons ('as heavy as a rock'), ou des règles de trois ('apples, pears and oranges').
                </span>
              </div>
            )}
          </div>

          {/* METRICS & STYLISTIC SUMMARY DASHBOARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Richness Index */}
            <div className="rounded-2xl bg-[#151b2b] p-4 border border-[#232a3a] flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#99907c] uppercase font-mono tracking-wider">
                  Indice Stylistique
                </span>
                <span className="material-symbols-outlined text-base text-[#f2ca50]">stars</span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl font-bold font-serif text-[#f2ca50]">
                  {report.stylisticRichnessScore}
                </span>
                <span className="text-xs text-[#99907c]">/ 100</span>
              </div>
              <div className="w-full bg-[#232a3a] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#cca639] to-[#f2ca50] h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.stylisticRichnessScore}%` }}
                />
              </div>
            </div>

            {/* Sound Devices Score */}
            <div className="rounded-2xl bg-[#151b2b] p-4 border border-[#232a3a] flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#99907c] uppercase font-mono tracking-wider">
                  Effets Sonores
                </span>
                <span className="material-symbols-outlined text-base text-amber-400">volume_up</span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl font-bold font-serif text-amber-300">
                  {report.categoryDistribution.sound}
                </span>
                <span className="text-xs text-[#99907c]">procédés détectés</span>
              </div>
              <span className="text-[10px] text-[#d0c5af]/70">
                Allitérations, Assonances & Onomatopées
              </span>
            </div>

            {/* Imagery & Metaphors */}
            <div className="rounded-2xl bg-[#151b2b] p-4 border border-[#232a3a] flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#99907c] uppercase font-mono tracking-wider">
                  Images & Métaphores
                </span>
                <span className="material-symbols-outlined text-base text-emerald-400">palette</span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl font-bold font-serif text-emerald-300">
                  {report.categoryDistribution.imagery}
                </span>
                <span className="text-xs text-[#99907c]">images poétiques</span>
              </div>
              <span className="text-[10px] text-[#d0c5af]/70">
                Comparaisons (as...as / like) & Personnifications
              </span>
            </div>

            {/* Structure & Cadence */}
            <div className="rounded-2xl bg-[#151b2b] p-4 border border-[#232a3a] flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#99907c] uppercase font-mono tracking-wider">
                  Rythme & Cadence
                </span>
                <span className="material-symbols-outlined text-base text-indigo-400">graphic_eq</span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl font-bold font-serif text-indigo-300">
                  {report.categoryDistribution.structure + report.categoryDistribution.amplification}
                </span>
                <span className="text-xs text-[#99907c]">structures oratoires</span>
              </div>
              <span className="text-[10px] text-[#d0c5af]/70">
                Règle de Trois, Anaphores & Répétitions
              </span>
            </div>
          </div>

          {/* PEDAGOGICAL VERDICT BANNER */}
          <div className="rounded-xl bg-[#191f2f] p-3.5 border border-[#4d4635]/40 flex items-start sm:items-center gap-3">
            <span className="material-symbols-outlined text-[#f2ca50] text-xl shrink-0 mt-0.5 sm:mt-0">
              lightbulb
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-[#f2ca50] uppercase">
                  Verdict Rhétorique Cycle 3 (6e) :
                </span>
                <p className="text-xs text-[#dce2f8] leading-relaxed">
                  {report.pedagogicalVerdictFr}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#232a3a] border border-[#f2ca50]/30 shrink-0 self-start sm:self-auto">
                <span className="text-[10px] text-[#99907c] font-mono">Dominante :</span>
                <span className="text-[11px] text-[#f2ca50] font-bold">{report.dominantFigureFr}</span>
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN VIEW: HIGHLIGHTED TEXT VIEWER & DETECTED FIGURES LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* COLUMN 1: INTERACTIVE HIGHLIGHTED TEXT (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="rounded-2xl bg-[#151b2b] p-4 sm:p-5 border border-[#232a3a] shadow-lg flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#232a3a]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">article</span>
                    <h3 className="text-xs font-mono font-bold text-[#dce2f8] uppercase tracking-wider">
                      Texte Annoté ({report.totalWords} mots • {report.totalSentences} phrases)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeak(textToAnalyze, 'full_text')}
                    className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#2e374b] text-[#f2ca50] text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isPlayingAudio === 'full_text' ? 'pause' : 'volume_up'}
                    </span>
                    <span>{isPlayingAudio === 'full_text' ? 'Arrêter' : 'Écouter'}</span>
                  </button>
                </div>

                {/* TEXT LINES RENDERING WITH HIGHLIGHT BADGES */}
                <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {textToAnalyze.split('\n').filter((l) => l.trim().length > 0).map((line, lineIdx) => {
                    // Check figures present in this line
                    const lineFigures = report.detectedFigures.filter((f) =>
                      line.toLowerCase().includes(f.quote.toLowerCase()) ||
                      f.sentence.toLowerCase().includes(line.toLowerCase())
                    );

                    return (
                      <div
                        key={lineIdx}
                        className="p-3 rounded-xl bg-[#0c1322]/60 border border-[#232a3a]/80 flex flex-col gap-2 hover:border-[#f2ca50]/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs sm:text-sm text-[#dce2f8] font-sans leading-relaxed select-text">
                            {line}
                          </p>
                          <button
                            type="button"
                            title="Écouter cette phrase"
                            onClick={() => handleSpeak(line, `line_${lineIdx}`)}
                            className="p-1 rounded-md text-[#99907c] hover:text-[#f2ca50] transition-colors shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isPlayingAudio === `line_${lineIdx}` ? 'stop' : 'volume_up'}
                            </span>
                          </button>
                        </div>

                        {/* Interactive figure tags for this line */}
                        {lineFigures.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#232a3a]/40">
                            <span className="text-[9px] font-mono text-[#99907c] uppercase">
                              Détecté :
                            </span>
                            {lineFigures.map((fig) => {
                              const isSelected = selectedFigureId === fig.id;
                              return (
                                <button
                                  key={fig.id}
                                  type="button"
                                  onClick={() => setSelectedFigureId(fig.id)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                    isSelected
                                      ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] scale-105 shadow-sm'
                                      : `${fig.badgeColor.bg} ${fig.badgeColor.text} ${fig.badgeColor.border} hover:brightness-125`
                                  }`}
                                >
                                  <span>{fig.nameFr}</span>
                                  <span className="opacity-70 font-mono text-[9px]">« {fig.quote.slice(0, 18)}... »</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: DETECTED FIGURES BREAKDOWN (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* CATEGORY FILTER CHIPS */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                    activeCategoryFilter === 'all'
                      ? 'bg-[#f2ca50] text-[#3c2f00]'
                      : 'bg-[#151b2b] text-[#d0c5af] hover:text-white border border-[#232a3a]'
                  }`}
                >
                  Toutes ({report.detectedFigures.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('sound')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                    activeCategoryFilter === 'sound'
                      ? 'bg-amber-400 text-black'
                      : 'bg-[#151b2b] text-[#d0c5af] hover:text-white border border-[#232a3a]'
                  }`}
                >
                  Son ({report.categoryDistribution.sound})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('imagery')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                    activeCategoryFilter === 'imagery'
                      ? 'bg-emerald-400 text-black'
                      : 'bg-[#151b2b] text-[#d0c5af] hover:text-white border border-[#232a3a]'
                  }`}
                >
                  Images ({report.categoryDistribution.imagery})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('structure')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                    activeCategoryFilter === 'structure'
                      ? 'bg-indigo-400 text-black'
                      : 'bg-[#151b2b] text-[#d0c5af] hover:text-white border border-[#232a3a]'
                  }`}
                >
                  Structure ({report.categoryDistribution.structure})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('amplification')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                    activeCategoryFilter === 'amplification'
                      ? 'bg-rose-400 text-black'
                      : 'bg-[#151b2b] text-[#d0c5af] hover:text-white border border-[#232a3a]'
                  }`}
                >
                  Intensité ({report.categoryDistribution.amplification})
                </button>
              </div>

              {/* FIGURE CARDS LIST */}
              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredFigures.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#151b2b] border border-[#232a3a] text-center flex flex-col items-center gap-2 text-[#99907c]">
                    <span className="material-symbols-outlined text-2xl text-[#d4c78f]">info</span>
                    <span className="text-xs">Aucune figure trouvée dans cette catégorie.</span>
                  </div>
                ) : (
                  filteredFigures.map((fig) => {
                    const isSelected = selectedFigureId === fig.id;
                    const def = RHETORICAL_DEFINITIONS[fig.figureType];

                    return (
                      <div
                        key={fig.id}
                        className={`rounded-2xl p-4 border transition-all flex flex-col gap-2.5 ${
                          isSelected
                            ? 'bg-[#1d2537] border-[#f2ca50] shadow-lg shadow-[#f2ca50]/15 ring-1 ring-[#f2ca50]'
                            : 'bg-[#151b2b] border-[#232a3a] hover:border-[#f2ca50]/40'
                        }`}
                      >
                        {/* Title bar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${fig.badgeColor.bg} ${fig.badgeColor.text} ${fig.badgeColor.border}`}
                            >
                              {fig.nameFr}
                            </span>
                            <span className="text-[10px] text-[#99907c] font-mono">
                              ({fig.nameEn})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSpeak(fig.quote, fig.id)}
                            className="p-1 rounded-md text-[#99907c] hover:text-[#f2ca50] transition-colors"
                            title="Prononcer l'extrait"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isPlayingAudio === fig.id ? 'stop' : 'volume_up'}
                            </span>
                          </button>
                        </div>

                        {/* Quote excerpt */}
                        <div className="p-2.5 rounded-xl bg-[#0c1322] border border-[#232a3a] font-serif text-xs text-[#f2ca50] italic flex items-center justify-between">
                          <span>« {fig.quote} »</span>
                        </div>

                        {/* Explanation for 6e */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono text-[#99907c] uppercase">
                            Explication 6e :
                          </span>
                          <p className="text-xs text-[#dce2f8] leading-relaxed">
                            {fig.explanationFr}
                          </p>
                        </div>

                        {/* Stylistic Effect */}
                        <div className="p-2 rounded-lg bg-[#232a3a]/70 border border-[#232a3a] flex items-start gap-1.5 text-[11px] text-[#d0c5af]">
                          <span className="material-symbols-outlined text-xs text-[#f2ca50] shrink-0 mt-0.5">
                            auto_awesome
                          </span>
                          <div>
                            <strong>Effet sur le lecteur :</strong> {fig.stylisticEffectFr}
                          </div>
                        </div>

                        {/* Exam Tip */}
                        {def && (
                          <div className="text-[10px] text-[#99907c] font-mono flex items-center gap-1.5">
                            <span className="text-[#f2ca50]">💡 Astuce :</span>
                            <span>{def.tip6e}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: RHETORICAL QUIZ */}
      {viewMode === 'quiz' && (
        <div className="rounded-2xl bg-[#151b2b] p-5 sm:p-6 border border-[#232a3a] flex flex-col gap-5 shadow-xl max-w-3xl mx-auto w-full">
          {!quizFinished ? (
            <>
              {/* Quiz Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#232a3a]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-base">psychology</span>
                  <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider">
                    Question {currentQuizIdx + 1} sur {RHETORICAL_QUIZ_QUESTIONS_6E.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#d4c78f] font-mono">
                    Score : <strong className="text-[#f2ca50]">{quizScore}</strong> bonne(s) réponse(s)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#232a3a] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#cca639] to-[#f2ca50] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuizIdx + 1) / RHETORICAL_QUIZ_QUESTIONS_6E.length) * 100}%`
                  }}
                />
              </div>

              {/* Quote Card to analyze */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#99907c]">Extrait à observer :</span>
                  <button
                    type="button"
                    onClick={() => handleSpeak(currentQ.quoteEn, currentQ.id)}
                    className="p-1 rounded-md text-[#99907c] hover:text-[#f2ca50] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isPlayingAudio === currentQ.id ? 'stop' : 'volume_up'}
                    </span>
                  </button>
                </div>
                <p className="font-serif text-base sm:text-lg text-[#f2ca50] font-bold italic">
                  « {currentQ.quoteEn} »
                </p>
                <p className="text-xs text-[#99907c] font-sans">
                  Traduction : {currentQ.translationFr}
                </p>
              </div>

              {/* Question Label */}
              <h4 className="text-sm font-bold text-[#dce2f8]">
                {currentQ.questionFr}
              </h4>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOption === opt.figureType;
                  let btnStyle = 'bg-[#191f2f]/80 border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/50';

                  if (isAnswerSubmitted) {
                    if (opt.figureType === currentQ.correctFigureType) {
                      btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-300 ring-1 ring-rose-500';
                    } else {
                      btnStyle = 'bg-[#191f2f]/40 border-[#232a3a] text-[#99907c] opacity-60';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-[#232a3a] border-[#f2ca50] text-[#f2ca50] ring-1 ring-[#f2ca50]';
                  }

                  return (
                    <button
                      key={opt.figureType}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedOption(opt.figureType)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt.labelFr}</span>
                      {isAnswerSubmitted && opt.figureType === currentQ.correctFigureType && (
                        <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                      )}
                      {isAnswerSubmitted && isSelected && opt.figureType !== currentQ.correctFigureType && (
                        <span className="material-symbols-outlined text-rose-400 text-sm">cancel</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint toggler */}
              {!isAnswerSubmitted && (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-[11px] text-[#f2ca50] font-mono hover:underline flex items-center gap-1 self-start"
                  >
                    <span className="material-symbols-outlined text-xs">help</span>
                    <span>{showHint ? 'Masquer l’indice 6e' : 'Besoin d’un indice 6e ?'}</span>
                  </button>
                  {showHint && (
                    <div className="p-2.5 rounded-lg bg-[#232a3a]/80 border border-[#f2ca50]/20 text-xs text-[#d0c5af] animate-fadeIn">
                      💡 <strong>Indice :</strong> {currentQ.clue6e}
                    </div>
                  )}
                </div>
              )}

              {/* Post-Submit Feedback */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-xl border flex flex-col gap-2 animate-fadeIn ${
                  selectedOption === currentQ.correctFigureType
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="material-symbols-outlined text-sm">
                      {selectedOption === currentQ.correctFigureType ? 'celebration' : 'info'}
                    </span>
                    <span>
                      {selectedOption === currentQ.correctFigureType
                        ? 'Excellente analyse ! C’est exactement cela.'
                        : `Pas tout à fait ! C'était ${RHETORICAL_DEFINITIONS[currentQ.correctFigureType].nameFr}.`}
                    </span>
                  </div>
                  <p className="text-xs text-[#dce2f8] leading-relaxed">
                    {currentQ.explanationFr}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={handleValidateQuizAnswer}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#f2ca50]/20 flex items-center gap-2"
                  >
                    <span>Valider mon analyse</span>
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#f2ca50]/20 flex items-center gap-2"
                  >
                    <span>{currentQuizIdx < RHETORICAL_QUIZ_QUESTIONS_6E.length - 1 ? 'Question suivante' : 'Voir mon bilan'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Quiz Completed Final Screen */
            <div className="flex flex-col items-center text-center gap-4 py-6 animate-fadeIn">
              <span className="material-symbols-outlined text-5xl text-[#f2ca50]" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
              <h3 className="font-serif text-2xl text-[#dce2f8] font-bold">
                Bilan du Défi Rhétorique 6e
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-serif text-[#f2ca50]">
                  {quizScore}
                </span>
                <span className="text-sm text-[#99907c]">/ {RHETORICAL_QUIZ_QUESTIONS_6E.length}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#d0c5af] max-w-md leading-relaxed">
                {quizScore >= 12
                  ? "Félicitations ! Tu maîtrises parfaitement les figures de style majeures du niveau 6e (comparaisons, musicalité, exagérations et métaphores) !"
                  : "Bon travail ! Revois les fiches mémo pour bien faire la différence entre une comparaison ('like/as') et une métaphore."}
              </p>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e374b] text-[#f2ca50] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">replay</span>
                  <span>Recommencer le quiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('glossary')}
                  className="px-4 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>Consulter le mémo des 12 figures</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: GLOSSARY OF 12 FIGURES FOR 6E */}
      {viewMode === 'glossary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.values(RHETORICAL_DEFINITIONS)).map((def) => {
            return (
              <div
                key={def.type}
                className="rounded-2xl bg-[#151b2b] p-4 sm:p-5 border border-[#232a3a] flex flex-col justify-between gap-3 shadow-lg hover:border-[#f2ca50]/40 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${def.badgeColor.bg} ${def.badgeColor.text} ${def.badgeColor.border}`}
                    >
                      {def.nameFr}
                    </span>
                    <span className="text-[10px] font-mono text-[#99907c]">
                      {def.nameEn}
                    </span>
                  </div>

                  <p className="text-xs text-[#dce2f8] leading-relaxed">
                    {def.definitionFr}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1">
                    <span className="text-[9px] font-mono uppercase text-[#99907c]">
                      Exemple niveau 6e :
                    </span>
                    <span className="text-xs text-[#f2ca50] font-serif italic">
                      « {def.example6e} »
                    </span>
                  </div>

                  <div className="text-[11px] text-[#d0c5af]/85 leading-relaxed">
                    <strong>Effet littéraire :</strong> {def.effectFr}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#232a3a]/60 border border-[#232a3a] text-[10px] text-[#99907c] font-mono">
                  💡 <strong>Astuce 6e :</strong> {def.tip6e}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
