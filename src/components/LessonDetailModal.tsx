import React, { useState, useEffect } from 'react';
import type { SchoolLesson, SchoolVocabularyItem } from '../data/schoolCurriculum';
import confetti from 'canvas-confetti';

interface LessonDetailModalProps {
  lesson: SchoolLesson | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteLesson?: (lessonId: string, xpEarned: number) => void;
}

type LessonTab = 'overview' | 'vocab' | 'grammar' | 'dialogue' | 'quiz' | 'dictation';

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onCompleteLesson
}) => {
  const [activeTab, setActiveTab] = useState<LessonTab>('overview');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [voiceAccent, setVoiceAccent] = useState<'en-GB' | 'en-US'>('en-GB');

  // Flashcard mode inside vocab tab
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Dictation state
  const [userInputDictation, setUserInputDictation] = useState<string>('');
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [dictationScore, setDictationScore] = useState<number | null>(null);

  // Dialogue active playing line
  const [activeDialogueIndex, setActiveDialogueIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lesson) {
      setActiveTab('overview');
      setQuizAnswers({});
      setQuizSubmitted(false);
      setUserInputDictation('');
      setDictationChecked(false);
      setDictationScore(null);
      setFlashcardIndex(0);
      setIsFlipped(false);
      setActiveDialogueIndex(null);
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  // Speech synthesis helper
  const speakText = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    setIsPlayingAudio(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceAccent;
    utterance.rate = speechRate;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(voiceAccent) || v.lang.startsWith('en'));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsPlayingAudio(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectQuizOption = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleValidateQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    lesson.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_index) correct++;
    });

    if (correct >= 3) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (onCompleteLesson) {
        onCompleteLesson(lesson.id, 100);
      }
    }
  };

  const handleCheckDictation = () => {
    setDictationChecked(true);
    const canonical = lesson.dictation.canonical.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');
    const user = userInputDictation.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');

    const canonWords = canonical.split(/\s+/);
    const userWords = user.split(/\s+/);

    let matches = 0;
    userWords.forEach((w) => {
      if (canonWords.includes(w)) matches++;
    });

    const score = Math.min(100, Math.round((matches / Math.max(1, canonWords.length)) * 100));
    setDictationScore(score);

    if (score >= 80) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  // Play dialogue step by step
  const handlePlayFullDialogue = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let currentIndex = 0;
    const playNextLine = () => {
      if (currentIndex >= lesson.dialogue.lines.length) {
        setActiveDialogueIndex(null);
        return;
      }

      setActiveDialogueIndex(currentIndex);
      const line = lesson.dialogue.lines[currentIndex];
      const utterance = new SpeechSynthesisUtterance(line.en);
      utterance.lang = voiceAccent;
      utterance.rate = speechRate;

      utterance.onend = () => {
        currentIndex++;
        setTimeout(playNextLine, 600);
      };
      utterance.onerror = () => {
        setActiveDialogueIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNextLine();
  };

  const tabsList: Array<{ id: LessonTab; label: string; icon: string }> = [
    { id: 'overview', label: 'Aperçu & Phrases', icon: 'format_quote' },
    { id: 'vocab', label: 'Vocabulaire (8)', icon: 'style' },
    { id: 'grammar', label: 'Grammaire', icon: 'history_edu' },
    { id: 'dialogue', label: 'Dialogue Audio', icon: 'forum' },
    { id: 'quiz', label: 'Quiz (4)', icon: 'quiz' },
    { id: 'dictation', label: 'Dictée', icon: 'edit_note' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/40 text-[#dce2f8] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <header className="p-4 sm:p-5 border-b border-[#232a3a] bg-[#151b2b] flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-md shrink-0">
                <span className="material-symbols-outlined text-2xl">{lesson.theme_icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[10px] font-bold tracking-wider font-mono uppercase">
                    {lesson.class_label} • {lesson.cycle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#232a3a] text-[#d4c78f] text-[10px] font-bold tracking-wider font-mono">
                    NIVEAU CECRL {lesson.cefr_level}
                  </span>
                  <span className="text-[11px] text-[#99907c] font-mono">
                    ~{lesson.estimated_minutes} min
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#dce2f8] mt-1 truncate">
                  {lesson.title}
                </h2>
                <p className="text-xs text-[#d0c5af]/80 line-clamp-1">
                  Objectif : {lesson.learning_objective}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio Controls Dropdown & Accent */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs">
                <button
                  type="button"
                  onClick={() => setVoiceAccent(voiceAccent === 'en-GB' ? 'en-US' : 'en-GB')}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-[#f2ca50] bg-[#232a3a]"
                  title="Changer l'accent audio (British RP / American)"
                >
                  {voiceAccent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechRate(speechRate === 0.9 ? 0.75 : speechRate === 0.75 ? 1.0 : 0.9)}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50]"
                  title="Vitesse de diction"
                >
                  {speechRate}x
                </button>
              </div>

              {/* Translation Toggle */}
              <button
                type="button"
                onClick={() => setShowTranslations(!showTranslations)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                  showTranslations
                    ? 'bg-[#232a3a] border-[#f2ca50]/40 text-[#f2ca50]'
                    : 'bg-[#0c1322] border-[#232a3a] text-[#99907c]'
                }`}
                title={showTranslations ? 'Masquer les traductions FR' : 'Afficher les traductions FR'}
              >
                <span className="material-symbols-outlined text-base">translate</span>
                <span className="hidden sm:inline text-[10px] font-mono uppercase font-bold">FR</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {tabsList.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md font-bold'
                      : 'bg-[#0c1322] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: OVERVIEW & MODEL PHRASES */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#f2ca50] font-bold font-mono">
                    Synthèse Pédagogique
                  </span>
                  <span className="text-xs text-[#d4c78f] font-mono">
                    Progression {lesson.class_label}
                  </span>
                </div>
                <p className="text-sm text-[#dce2f8] leading-relaxed">
                  Cette leçon permet aux élèves de <strong className="text-[#f2ca50]">{lesson.class_label}</strong> de maîtriser le thème « {lesson.theme_label} » tout en consolidant le point de grammaire : <em className="text-[#d4c78f]">{lesson.grammar.title}</em>.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-[#f2ca50] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">format_quote</span>
                  Phrases Modèles d’Expression ({lesson.model_phrases.length})
                </h3>

                <div className="space-y-2.5">
                  {lesson.model_phrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/30 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#f2ca50] font-bold px-1.5 py-0.2 rounded bg-[#f2ca50]/15">
                            {phrase.focus}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-serif font-bold text-[#dce2f8] tracking-wide">
                          {phrase.en}
                        </p>
                        {showTranslations && (
                          <p className="text-xs text-[#d0c5af]/80 italic">
                            « {phrase.fr} »
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => speakText(phrase.en, `phrase-${idx}`)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isPlayingAudio === `phrase-${idx}`
                            ? 'bg-[#f2ca50] text-[#3c2f00] animate-pulse'
                            : 'bg-[#232a3a] text-[#f2ca50] hover:bg-[#2e3545]'
                        }`}
                        title="Écouter la phrase modèle"
                      >
                        <span className="material-symbols-outlined text-base">volume_up</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOCABULARY & FLASHCARDS */}
          {activeTab === 'vocab' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Flashcard interactive trainer widget */}
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#f2ca50]/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-base">style</span>
                    <span className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider font-mono">
                      Mode Flashcard Rapide • {flashcardIndex + 1} / {lesson.vocabulary.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="text-xs text-[#d4c78f] hover:text-[#f2ca50] font-bold font-mono underline"
                  >
                    {isFlipped ? 'Voir Recto (EN)' : 'Voir Verso (FR)'}
                  </button>
                </div>

                {/* Flip Card */}
                {lesson.vocabulary[flashcardIndex] && (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[140px] rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 flex flex-col items-center justify-center text-center shadow-inner relative group transition-all"
                  >
                    {!isFlipped ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#99907c] uppercase">
                          {lesson.vocabulary[flashcardIndex].part_of_speech}
                        </span>
                        <h4 className="font-serif text-2xl font-bold text-[#f2ca50]">
                          {lesson.vocabulary[flashcardIndex].term}
                        </h4>
                        <span className="text-xs text-[#d4c78f] font-mono">
                          {lesson.vocabulary[flashcardIndex].phonetic}
                        </span>
                        <span className="text-[10px] text-[#99907c] mt-2">
                          (Cliquez pour révéler la traduction française)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                          Traduction Française
                        </span>
                        <h4 className="font-serif text-xl font-bold text-[#dce2f8]">
                          {lesson.vocabulary[flashcardIndex].translation_fr}
                        </h4>
                        <p className="text-xs text-[#d0c5af]/80 italic mt-1 max-w-md">
                          « {lesson.vocabulary[flashcardIndex].example_en} »
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : lesson.vocabulary.length - 1));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#232a3a] text-xs font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50]"
                  >
                    ← Précédent
                  </button>

                  <button
                    type="button"
                    onClick={() => speakText(lesson.vocabulary[flashcardIndex].term, 'fc-audio')}
                    className="px-3 py-1.5 rounded-lg bg-[#232a3a] text-xs font-mono font-bold text-[#f2ca50] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">volume_up</span>
                    Prononcer
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIndex((prev) => (prev < lesson.vocabulary.length - 1 ? prev + 1 : 0));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#232a3a] text-xs font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50]"
                  >
                    Suivant →
                  </button>
                </div>
              </div>

              {/* Complete Vocabulary List */}
              <div>
                <h3 className="font-serif text-base font-bold text-[#dce2f8] mb-3">
                  Lexique Intégral ({lesson.vocabulary.length} Termes Enregistrés)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lesson.vocabulary.map((w: SchoolVocabularyItem, idx: number) => (
                    <div
                      key={w.id || idx}
                      className="p-3.5 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col justify-between gap-2 hover:border-[#f2ca50]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-bold text-[#f2ca50]">
                              {w.term}
                            </span>
                            <span className="text-[10px] font-mono text-[#99907c] px-1 rounded bg-[#232a3a]">
                              {w.part_of_speech}
                            </span>
                          </div>
                          <span className="text-xs text-[#d4c78f] font-mono">{w.phonetic}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakText(w.term, `vocab-${idx}`)}
                          className="p-1.5 rounded-lg bg-[#232a3a] text-[#f2ca50] hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">volume_up</span>
                        </button>
                      </div>

                      <div className="border-t border-[#232a3a] pt-2">
                        <p className="text-xs font-semibold text-[#dce2f8]">
                          {w.translation_fr}
                        </p>
                        <p className="text-[11px] text-[#d0c5af]/80 mt-1 italic">
                          Ex : {w.example_en}
                        </p>
                        {showTranslations && (
                          <p className="text-[10px] text-[#99907c] italic">
                            « {w.example_fr} »
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRAMMAR POINT */}
          {activeTab === 'grammar' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl bg-[#151b2b] border border-[#f2ca50]/40 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#232a3a] pb-2">
                  <span className="text-xs font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    Fiche Grammaticale de Niveau {lesson.class_label}
                  </span>
                  <span className="text-xs text-[#d4c78f] font-mono">{lesson.cefr_level}</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8]">
                  {lesson.grammar.title}
                </h3>

                <p className="text-sm text-[#dce2f8] leading-relaxed">
                  {lesson.grammar.rule}
                </p>

                {/* Tip box */}
                <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0 mt-0.5">
                    tips_and_updates
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-[#f2ca50] uppercase font-mono tracking-wider">
                      Astuce & Piège à éviter
                    </h5>
                    <p className="text-xs text-[#dce2f8] mt-0.5 leading-relaxed">
                      {lesson.grammar.tip}
                    </p>
                  </div>
                </div>

                {/* Example Breakdown */}
                <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#d4c78f]">
                    Exemple en Contexte Réel
                  </span>
                  <p className="text-sm font-serif font-bold text-[#dce2f8]">
                    {lesson.grammar.example_en}
                  </p>
                  <p className="text-xs text-[#d0c5af]/80 italic">
                    « {lesson.grammar.example_fr} »
                  </p>
                </div>

                <div className="text-[11px] text-[#99907c] font-mono border-t border-[#232a3a] pt-2">
                  Focus officiel du cycle : {lesson.grammar.level_focus}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BILINGUAL DIALOGUE */}
          {activeTab === 'dialogue' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#dce2f8]">
                    {lesson.dialogue.title}
                  </h4>
                  <p className="text-xs text-[#d0c5af]/80 mt-0.5">
                    {lesson.dialogue.setting_fr}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePlayFullDialogue}
                  className="px-3.5 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-[#ffe088] active:scale-95 transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  Lecture Intégrale
                </button>
              </div>

              {/* Dialogue lines */}
              <div className="space-y-3">
                {lesson.dialogue.lines.map((line, idx) => {
                  const isCurrent = activeDialogueIndex === idx;
                  const isSpeakerA = line.speaker.includes('A');
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isCurrent
                          ? 'bg-[#232a3a] border-[#f2ca50] shadow-lg shadow-[#f2ca50]/10 ring-1 ring-[#f2ca50]'
                          : isSpeakerA
                          ? 'bg-[#151b2b] border-[#232a3a]'
                          : 'bg-[#191f2f] border-[#232a3a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                          {line.speaker}
                        </span>

                        <button
                          type="button"
                          onClick={() => speakText(line.en, `line-${idx}`)}
                          className="p-1 rounded-md text-[#d0c5af] hover:text-[#f2ca50] transition-colors"
                          title="Écouter cette réplique"
                        >
                          <span className="material-symbols-outlined text-sm">volume_up</span>
                        </button>
                      </div>

                      <p className="text-sm sm:text-base font-serif font-semibold text-[#dce2f8]">
                        {line.en}
                      </p>

                      {showTranslations && (
                        <p className="text-xs text-[#d0c5af]/70 italic">
                          « {line.fr} »
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#f2ca50]">
                    Quiz d’Évaluation ({lesson.quiz.length} Questions)
                  </h4>
                  <p className="text-xs text-[#d0c5af]/80">
                    Testez votre compréhension du vocabulaire et de la grammaire de {lesson.class_label}.
                  </p>
                </div>

                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] font-mono text-xs font-bold">
                    Score :{' '}
                    {
                      lesson.quiz.filter((q) => quizAnswers[q.id] === q.correct_index).length
                    }{' '}
                    / {lesson.quiz.length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {lesson.quiz.map((q, qIdx) => {
                  const userAnswer = quizAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correct_index;

                  return (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#232a3a] text-[#f2ca50] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h5 className="font-sans font-semibold text-sm sm:text-base text-[#dce2f8]">
                          {q.question}
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-[#0c1322] border-[#232a3a] text-[#dce2f8] hover:bg-[#232a3a]';

                          if (quizSubmitted) {
                            if (optIdx === q.correct_index) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-red-950/80 border-red-500 text-red-300 line-through';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-[#232a3a] border-[#f2ca50] text-[#f2ca50] font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              className={`p-3 rounded-lg border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correct_index && (
                                <span className="material-symbols-outlined text-emerald-400 text-sm">
                                  check_circle
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                              : 'bg-[#0c1322] text-[#d0c5af] border border-[#232a3a]'
                          }`}
                        >
                          <strong>Explication :</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleValidateQuiz}
                  disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                  className="w-full py-3.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe088] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-98 transition-all"
                >
                  Valider mes réponses au Quiz (+100 XP)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#232a3a] text-[#f2ca50] font-bold text-xs uppercase tracking-wider hover:bg-[#2e3545]"
                >
                  Recommencer le Quiz
                </button>
              )}
            </div>
          )}

          {/* TAB 6: DICTATION */}
          {activeTab === 'dictation' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#232a3a] pb-2">
                  <span className="text-xs font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">hearing</span>
                    Exercice de Dictée Cadencée
                  </span>
                  <span className="text-xs text-[#99907c] font-mono">{lesson.class_label}</span>
                </div>

                <p className="text-xs text-[#d0c5af]/80">
                  Écoutez l'énoncé oral autant de fois que nécessaire, puis retranscrivez la phrase en anglais avec la ponctuation appropriée.
                </p>

                <div className="flex items-center justify-center p-6 rounded-xl bg-[#0c1322] border border-[#232a3a]">
                  <button
                    type="button"
                    onClick={() => speakText(lesson.dictation.canonical, 'dictation-audio')}
                    className="px-5 py-3 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe088] shadow-lg active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">volume_up</span>
                    <span>Écouter la Phrase de Dictée</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#dce2f8] font-semibold">
                    Votre transcription écrite :
                  </label>
                  <textarea
                    rows={3}
                    value={userInputDictation}
                    onChange={(e) => setUserInputDictation(e.target.value)}
                    placeholder="Tapez ici la phrase entendue en anglais..."
                    className="w-full p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] focus:border-[#f2ca50] text-[#dce2f8] text-sm focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
                  />
                </div>

                {!dictationChecked ? (
                  <button
                    type="button"
                    onClick={handleCheckDictation}
                    disabled={!userInputDictation.trim()}
                    className="w-full py-3 rounded-xl bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/40 font-bold text-xs uppercase tracking-wider hover:bg-[#2e3545] disabled:opacity-40 transition-all"
                  >
                    Vérifier ma Transcription
                  </button>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#0c1322] border border-emerald-500/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Exactitude : {dictationScore}%
                        </span>
                        <span className="text-[10px] text-[#99907c] font-mono">Corrigé officiel</span>
                      </div>
                      <div>
                        <p className="text-sm font-serif font-bold text-[#dce2f8]">
                          {lesson.dictation.canonical}
                        </p>
                        <p className="text-xs text-[#d0c5af]/80 italic mt-0.5">
                          « {lesson.dictation.translation_fr} »
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserInputDictation('');
                        setDictationChecked(false);
                        setDictationScore(null);
                      }}
                      className="text-xs text-[#f2ca50] underline font-mono"
                    >
                      Réessayer la dictée
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <footer className="p-3 sm:p-4 border-t border-[#232a3a] bg-[#151b2b] flex items-center justify-between text-xs text-[#99907c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Fiche certifiée English Boost MZ • Conforme aux programmes</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] text-[#dce2f8] font-semibold text-xs transition-colors"
          >
            Fermer la Leçon
          </button>
        </footer>
      </div>
    </div>
  );
};
