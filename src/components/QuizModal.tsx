import React, { useState } from 'react';
import { QUIZ_QUESTIONS, type QuizQuestion } from '../data/curriculum';
import { recordAttempt } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onQuizFinished?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  currentLevel,
  onClose,
  onQuizFinished
}) => {
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Filter questions or use entire pool
  const questions = QUIZ_QUESTIONS;
  const currentQ: QuizQuestion = questions[questionIndex] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOptionIdx(idx);
    setHasAnswered(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setHasAnswered(false);
    } else {
      setIsCompleted(true);
      const finalScore = Math.round(((score + (currentQ.options[selectedOptionIdx || 0]?.isCorrect ? 0 : 0)) / questions.length) * 100);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f2ca50', '#d4af37']
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }

      await recordAttempt({
        moduleId: 'quiz_general',
        moduleType: 'quiz',
        title: 'Grammar & Nuance Quiz',
        level: currentLevel,
        score: finalScore,
        durationSeconds: 120
      });
      onQuizFinished?.();
    }
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setSelectedOptionIdx(null);
    setHasAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 bg-[#0c1322]/90 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-bold text-[#dce2f8] leading-tight">
              Grammar & Nuance Quiz
            </h1>
            <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
              Question {questionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-4">
        {!isCompleted ? (
          <>
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-[#d0c5af]">
              <span className="text-[#f2ca50] font-semibold">{currentQ.category}</span>
              <span className="font-mono">Score : {score} / {questions.length}</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-[#191f2f] overflow-hidden">
              <div
                className="h-full bg-[#f2ca50] rounded-full transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Prompt sentence card */}
            <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#4d4635]/40 shadow-xl flex flex-col gap-2">
              <span className="text-[10px] text-[#d4c78f] uppercase font-bold tracking-wider">
                Proposition Académique :
              </span>
              <blockquote className="font-serif text-lg text-[#dce2f8] italic leading-relaxed">
                {currentQ.promptSentence}
              </blockquote>
              <p className="text-xs text-[#d0c5af] mt-1 pt-2 border-t border-[#232a3a]">
                {currentQ.questionText}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx;
                let btnStyle = 'bg-[#191f2f] border-[#4d4635]/30 text-[#dce2f8] hover:bg-[#232a3a]';

                if (hasAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#f2ca50] shadow-md';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'bg-[#93000a]/30 border-[#ffb4ab] text-[#ffb4ab]';
                  } else {
                    btnStyle = 'bg-[#151b2b]/50 border-[#232a3a] text-[#99907c] opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between active:scale-[0.99] ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#232a3a] flex items-center justify-center text-xs font-bold font-mono text-[#d4c78f]">
                        {opt.label}
                      </span>
                      <span className="font-serif text-base font-semibold">{opt.text}</span>
                    </div>

                    <span className="material-symbols-outlined text-lg">
                      {hasAnswered && opt.isCorrect
                        ? 'check_circle'
                        : isSelected && !opt.isCorrect
                        ? 'cancel'
                        : 'radio_button_unchecked'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Explanation Card */}
            {hasAnswered && (
              <div className="p-4 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex flex-col gap-2 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#dce2f8] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#f2ca50]">
                      school
                    </span>
                    Décryptage de la Règle
                  </span>
                  <span className="text-[10px] text-[#f2ca50] font-mono font-bold uppercase">
                    {currentQ.level}
                  </span>
                </div>
                <p className="text-xs text-[#d0c5af] leading-relaxed">
                  {currentQ.options[selectedOptionIdx || 0]?.explanation ||
                    currentQ.options.find((o) => o.isCorrect)?.explanation}
                </p>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="mt-2 w-full py-2.5 rounded-lg bg-[#f2ca50] text-[#3c2f00] font-bold uppercase tracking-wider text-xs shadow-md hover:bg-[#ffe088] transition-all"
                >
                  {questionIndex < questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Final Results Recap */
          <div className="p-6 rounded-2xl bg-[#191f2f] border border-[#f2ca50]/40 shadow-2xl flex flex-col items-center text-center gap-4 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#232a3a] border-2 border-[#f2ca50] flex items-center justify-center text-3xl font-serif font-black text-[#f2ca50] shadow-xl">
              {Math.round((score / questions.length) * 100)}%
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl font-bold text-[#dce2f8]">
                Épreuve de Syntaxe Achevée
              </h2>
              <p className="text-xs text-[#d0c5af]">
                Vous avez répondu correctement à {score} sur {questions.length} questions certifiées.
              </p>
            </div>

            <div className="w-full p-4 rounded-xl bg-[#070e1d]/80 border border-[#4d4635]/30 text-xs text-[#d4c78f] flex justify-between">
              <span>Points acquis</span>
              <span className="font-mono font-bold text-[#f2ca50]">+{score * 40} XP</span>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-3 rounded-xl bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] font-semibold text-xs border border-[#4d4635]/40"
              >
                Recommencer le Quiz
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider"
              >
                Clôturer la Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
