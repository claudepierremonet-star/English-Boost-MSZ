import React, { useState, useEffect } from 'react';
import type { Grammar6eItem } from '../data/grammar6eData';
import confetti from 'canvas-confetti';
import { DualSpeakerButton } from './DualSpeakerButton';

interface SentenceStructuringExerciseProps {
  item: Grammar6eItem;
  onComplete?: (itemId: string, score: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

interface WordToken {
  id: string;
  text: string;
}

export const SentenceStructuringExercise: React.FC<SentenceStructuringExerciseProps> = ({
  item,
  onComplete,
  onNext,
  onPrev,
  hasPrev = false,
  hasNext = false,
  currentIndex = 1,
  totalCount = 50
}) => {
  const [availableWords, setAvailableWords] = useState<WordToken[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordToken[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  // Initialize or reset tokens on item change
  useEffect(() => {
    // Generate scrambled tokens with unique IDs
    const tokens: WordToken[] = item.exercise.scrambled_words.map((word, idx) => ({
      id: `${item.id}-word-${idx}-${word}`,
      text: word
    }));
    setAvailableWords(tokens);
    setSelectedWords([]);
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setAttempts(0);
  }, [item.id]);

  const handleSelectWord = (token: WordToken) => {
    if (isSubmitted && isCorrect) return;
    setAvailableWords((prev) => prev.filter((w) => w.id !== token.id));
    setSelectedWords((prev) => [...prev, token]);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  const handleRemoveWord = (token: WordToken) => {
    if (isSubmitted && isCorrect) return;
    setSelectedWords((prev) => prev.filter((w) => w.id !== token.id));
    setAvailableWords((prev) => [...prev, token]);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  const handleReset = () => {
    const tokens: WordToken[] = item.exercise.scrambled_words.map((word, idx) => ({
      id: `${item.id}-word-${idx}-${word}`,
      text: word
    }));
    setAvailableWords(tokens);
    setSelectedWords([]);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  const handleVerify = () => {
    if (selectedWords.length === 0) return;

    setAttempts((prev) => prev + 1);
    const constructedSentence = selectedWords.map((w) => w.text).join(' ').trim();
    const targetSentence = item.exercise.correct_tokens.join(' ').trim();

    // Flexible comparison ignoring strict spacing around punctuation
    const normalize = (str: string) =>
      str
        .replace(/\s+([?.!,'])/g, '$1')
        .toLowerCase()
        .trim();

    const passed = normalize(constructedSentence) === normalize(targetSentence);

    setIsSubmitted(true);
    setIsCorrect(passed);

    if (passed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Play audio of the correct sentence
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(targetSentence.replace(/\s+([?.!,])/g, '$1'));
        utterance.lang = 'en-GB';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }

      if (onComplete) {
        onComplete(item.id, 100);
      }
    }
  };

  const targetSentenceClean = item.exercise.correct_tokens.join(' ').replace(/\s+([?.!,])/g, '$1');

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#131927] border border-[#f2ca50]/30 shadow-xl text-[#dce2f8]">
      {/* HEADER WITH STEPPER */}
      <div className="flex items-center justify-between border-b border-[#232a3a] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/40 font-mono text-xs font-bold flex items-center justify-center">
            #{item.number}
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4c78f] font-bold">
              {item.category} • CECRL {item.cefr}
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#f2ca50]">
              {item.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={onPrev}
            className="w-8 h-8 rounded-lg bg-[#1c2436] border border-[#232a3a] text-[#dce2f8] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#232a3a] flex items-center justify-center transition-all"
            title="Fiche précédente"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <span className="text-xs font-mono text-[#d4c78f] px-1.5">
            {currentIndex}/{totalCount}
          </span>
          <button
            type="button"
            disabled={!hasNext}
            onClick={onNext}
            className="w-8 h-8 rounded-lg bg-[#1c2436] border border-[#232a3a] text-[#dce2f8] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#232a3a] flex items-center justify-center transition-all"
            title="Fiche suivante"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* GRAMMAR RULE ACCORDION / SUMMARY */}
      <div className="p-3.5 rounded-xl bg-[#0b101c] border border-[#232a3a] flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">school</span>
            Formule & Règle Pédagogique
          </span>
          <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[10px] font-mono text-[#99907c]">
            {item.structure_formula}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#dce2f8] leading-relaxed">
          {item.rule}
        </p>

        {/* Tip box */}
        <div className="p-2.5 rounded-lg bg-[#1c2436]/60 border border-[#f2ca50]/20 flex items-start gap-2 text-xs">
          <span className="material-symbols-outlined text-[#f2ca50] text-sm shrink-0 mt-0.5">
            lightbulb
          </span>
          <span className="text-[#d0c5af]">
            <strong className="text-[#f2ca50]">Astuce 6e :</strong> {item.tip}
          </span>
        </div>

        {/* Example in context */}
        <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[#151b2b] border border-[#232a3a]">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-serif font-bold text-[#dce2f8] truncate">
              « {item.example_en} »
            </span>
            <span className="text-[11px] text-[#99907c] italic truncate">
              {item.example_fr}
            </span>
          </div>
          <DualSpeakerButton
            text={item.example_en}
            id={`gramm-ex-${item.id}`}
            phonetic={item.structure_formula}
            explanation={item.example_fr}
            variant="compact"
          />
        </div>
      </div>

      {/* SENTENCE STRUCTURING EXERCISE WIDGET */}
      <div className="p-4 rounded-xl bg-[#0f1523] border border-[#4d4635]/50 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center font-bold text-xs">
              🧩
            </span>
            <span className="text-xs font-mono uppercase font-bold text-[#f2ca50] tracking-wide">
              Exercice de Structuration de Phrase
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="text-[11px] font-mono text-[#d4c78f] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">help</span>
            <span>{showHint ? 'Masquer l\'aide' : 'Besoin d\'aide ?'}</span>
          </button>
        </div>

        {/* Instruction and French prompt */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-[#99907c]">
            {item.exercise.instruction}
          </p>
          <div className="p-2.5 rounded-lg bg-[#182133] border border-[#2a364d] text-xs sm:text-sm font-semibold text-[#dce2f8] flex items-center gap-2">
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#232a3a] text-[#f2ca50] uppercase">
              FR
            </span>
            <span>« {item.exercise.french_prompt} »</span>
          </div>
        </div>

        {/* Hint banner if requested */}
        {showHint && (
          <div className="p-2.5 rounded-lg bg-[#2a2310] border border-[#f2ca50]/40 text-xs text-[#f2ca50] flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm shrink-0">tips_and_updates</span>
            <span>
              <strong>Indice d'ordre :</strong> La phrase commence par «{' '}
              <strong>{item.exercise.correct_tokens[0]}</strong> » et respecte la structure :{' '}
              <em>{item.structure_formula}</em>.
            </span>
          </div>
        )}

        {/* TARGET SENTENCE DROP ZONE (CONSTRUCTED SENTENCE) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">
            Votre phrase construite (cliquez pour retirer un mot) :
          </span>
          <div
            className={`min-h-[64px] p-3 rounded-xl border-2 border-dashed flex flex-wrap items-center gap-2 transition-all ${
              isSubmitted && isCorrect
                ? 'border-emerald-500/80 bg-emerald-950/20'
                : isSubmitted && isCorrect === false
                ? 'border-red-500/80 bg-red-950/20 animate-shake'
                : selectedWords.length > 0
                ? 'border-[#f2ca50]/60 bg-[#141b2c]'
                : 'border-[#232a3a] bg-[#0c111c]'
            }`}
          >
            {selectedWords.length === 0 ? (
              <span className="text-xs text-[#99907c] italic">
                Cliquez sur les mots ci-dessous dans l'ordre pour assembler la phrase...
              </span>
            ) : (
              selectedWords.map((token, idx) => (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => handleRemoveWord(token)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-serif font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
                    isSubmitted && isCorrect
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-[#f2ca50] text-[#3c2f00] hover:bg-amber-300'
                  }`}
                  title="Cliquer pour remettre ce mot dans la réserve"
                >
                  <span>{token.text}</span>
                  {!isCorrect && (
                    <span className="text-[10px] text-[#3c2f00]/70 font-mono">✕</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* AVAILABLE SCRAMBLED WORDS BANK */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">
            Mots disponibles à placer :
          </span>
          <div className="min-h-[48px] p-2.5 rounded-xl bg-[#0c111c] border border-[#232a3a] flex flex-wrap items-center gap-2">
            {availableWords.length === 0 ? (
              <span className="text-[11px] text-[#99907c] italic">
                Tous les mots ont été placés dans la phrase. Cliquez sur « Vérifier » ci-dessous !
              </span>
            ) : (
              availableWords.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => handleSelectWord(token)}
                  className="px-3 py-1.5 rounded-lg bg-[#1c2436] hover:bg-[#28344e] border border-[#3b4866] text-[#dce2f8] hover:text-[#f2ca50] text-xs sm:text-sm font-serif font-semibold transition-all active:scale-95 shadow-sm"
                  title="Cliquer pour ajouter ce mot"
                >
                  {token.text}
                </button>
              ))
            )}
          </div>
        </div>

        {/* FEEDBACK & EXPLANATION BANNER */}
        {isSubmitted && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-2 animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                : 'bg-red-950/40 border-red-500/60 text-red-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">
                  {isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <span className="font-bold text-sm">
                  {isCorrect
                    ? 'Bravo ! Phrase parfaitement structurée !'
                    : 'Pas tout à fait correct... Vérifiez l\'ordre des mots !'}
                </span>
              </div>

              {isCorrect && (
                <DualSpeakerButton
                  text={targetSentenceClean}
                  id={`struct-solved-${item.id}`}
                  explanation={item.exercise.french_prompt}
                  variant="compact"
                />
              )}
            </div>

            <p className="text-xs leading-relaxed text-[#dce2f8]">
              {item.exercise.explanation}
            </p>

            {!isCorrect && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#d4c78f]">
                  Solution attendue : <strong>« {targetSentenceClean} »</strong>
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-mono underline hover:text-white"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}

        {/* CONTROLS (RESET & VERIFY) */}
        <div className="flex items-center justify-between pt-2 border-t border-[#232a3a] gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#182133] hover:bg-[#232f48] border border-[#2a364d] text-xs text-[#d0c5af] flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Effacer tout</span>
          </button>

          <div className="flex items-center gap-2">
            {!isCorrect ? (
              <button
                type="button"
                disabled={selectedWords.length === 0}
                onClick={handleVerify}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#f2ca50]/20 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Vérifier la phrase</span>
              </button>
            ) : (
              hasNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Exercice suivant</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
