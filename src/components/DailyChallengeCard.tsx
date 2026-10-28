import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DualSpeakerButton } from './DualSpeakerButton';

interface DailyChallengeCardProps {
  onChallengeComplete?: (isSuccessOrXp: number | boolean) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ onChallengeComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const options = [
    {
      id: 'equivocal',
      label: 'I',
      term: 'Equivocal',
      definition: 'Open to double interpretation with intent to remain non-committal',
      isAnswer: true
    },
    {
      id: 'pernicious',
      label: 'II',
      term: 'Pernicious',
      definition: 'Having a gradual, subtle and destructive effect',
      isAnswer: false
    },
    {
      id: 'meretricious',
      label: 'III',
      term: 'Meretricious',
      definition: 'Apparently attractive but having in reality no genuine value',
      isAnswer: false
    }
  ];

  const handleSelect = (optionId: string, answer: boolean) => {
    if (hasSubmitted) return;
    setSelectedOption(optionId);
    setHasSubmitted(true);
    setIsCorrect(answer);

    if (answer) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f2ca50', '#d4af37', '#ffffff']
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
      onChallengeComplete?.(true); // +10 points de niveau
    } else {
      onChallengeComplete?.(false); // -5 points de niveau
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <section className="px-4 sm:px-6 py-4">
      <div className="rounded-2xl bg-[#191f2f] p-5 shadow-xl relative overflow-hidden border border-[#4d4635]/40 backdrop-blur-md">
        {/* Golden Ambient Aura */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#f2ca50]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Streak Flame */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-ping" />
              <span className="text-[10px] uppercase tracking-widest text-[#f2ca50] font-bold">
                DÉFI DU JOUR • C1 PRÉCISION
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#dce2f8] font-semibold mt-0.5">
              The Nuance Matrix
            </h3>
          </div>

          {/* Streak XP Counter Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2e3545]/80 shadow-inner border border-[#4d4635]/30">
            <span
              className="material-symbols-outlined text-[#f2ca50] text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <div className="flex flex-col text-right">
              <span className="text-xs text-[#f2ca50] font-bold leading-none font-mono">24 JOURS</span>
              <span className="text-[9px] text-[#d4c78f] tracking-widest font-semibold mt-0.5">+10 PTS / -5 PTS</span>
            </div>
          </div>
        </div>

        {/* Cloze Test Sentence */}
        <div className="p-4 rounded-xl bg-[#070e1d]/80 mb-4 border border-[#4d4635]/30">
          <p className="font-serif text-base sm:text-lg text-[#dce2f8] italic leading-relaxed">
            “The ambassador’s response was characteristically{' '}
            <span className="text-[#f2ca50] font-bold underline decoration-[#f2ca50] decoration-2 underline-offset-4 font-sans">
              {selectedOption === 'equivocal' ? 'equivocal' : 'deliberately evasive'}
            </span>
            , giving offense to neither faction.”
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#232a3a] text-xs text-[#d0c5af] flex-wrap gap-2">
            <span>Substituer le lemme souligné par son équivalent C2 exact :</span>
            <DualSpeakerButton
              text="The ambassador’s response was characteristically equivocal, giving offense to neither faction."
              id="daily-cloze-sentence"
              explanation="La réponse de l'ambassadeur était typiquement équivoque, n'offensant aucune des factions."
              variant="pill"
            />
          </div>
        </div>

        {/* Option Selectors */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {options.map((opt) => {
            const isChosen = selectedOption === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id, opt.isAnswer)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.99] ${
                  hasSubmitted && opt.isAnswer
                    ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#f2ca50]'
                    : isChosen && !opt.isAnswer
                    ? 'bg-[#93000a]/30 border-[#ffb4ab] text-[#ffb4ab]'
                    : 'bg-[#151b2b]/80 hover:bg-[#232a3a] border-[#4d4635]/30 text-[#dce2f8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#232a3a] flex items-center justify-center text-xs text-[#d4c78f] font-mono font-bold shrink-0">
                    {opt.label}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{opt.term}</span>
                      <DualSpeakerButton
                        text={opt.term}
                        id={`opt-speaker-${opt.id}`}
                        explanation={opt.definition}
                        variant="minimal"
                      />
                    </div>
                    <span className="text-xs text-[#d0c5af]/80">{opt.definition}</span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-lg">
                  {hasSubmitted && opt.isAnswer
                    ? 'check_circle'
                    : isChosen && !opt.isAnswer
                    ? 'cancel'
                    : 'radio_button_unchecked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Feedback message */}
        {hasSubmitted && (
          <div
            className={`p-3.5 rounded-xl mb-4 flex items-center justify-between animate-fadeIn border ${
              isCorrect
                ? 'bg-[#191f2f] border-[#f2ca50]/50 text-[#f2ca50]'
                : 'bg-[#151b2b] border-[#ffb4ab]/40 text-[#ffb4ab]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-lg">
                {isCorrect ? 'verified' : 'info'}
              </span>
              <span>
                {isCorrect
                  ? 'Excellente analyse philologique ! (+10 points de niveau gagnés)'
                  : 'Nuance inexacte. « Equivocal » correspond à une ambiguïté diplomatique voulue. (-5 points déduits)'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs underline text-[#d4c78f] hover:text-[#f2ca50] ml-2 shrink-0 font-mono"
            >
              Recommencer
            </button>
          </div>
        )}

        {/* Progress Gauge */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#d4c78f] flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">stars</span>
              Objectif Quotidien de Maîtrise
            </span>
            <span className="text-[#dce2f8] font-bold font-mono">60% Accompli (3/5)</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#070e1d] overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#f1e3a9] transition-all duration-1000 shadow-[0_0_12px_rgba(242,202,80,0.5)]"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
