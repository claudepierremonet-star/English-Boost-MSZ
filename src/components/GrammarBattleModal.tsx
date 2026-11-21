import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { CEFRLevel, SchoolGrade } from '../firebase/types';
import {
  GRAMMAR_BATTLE_QUESTIONS,
  type GrammarBattleQuestion
} from '../data/ecosystemChallengesData';
import { recordAttempt } from '../firebase/client';
import { awardMszCoins } from '../utils/mszCoinsManager';
import { speakText, stopSpeech } from '../services/speechService';
import { playCorrectCue, playIncorrectCue, playVictoryCue } from '../utils/soundEffects';
import battleShieldImg from '../assets/images/grammar_battle_shield_1795303944784.jpg';

interface GrammarBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolGrade: SchoolGrade;
  cefrLevel: CEFRLevel;
  onXpEarned?: (xp: number) => void;
}

type TierKey = GrammarBattleQuestion['gradeTier'];

function mapGradeToTier(grade: SchoolGrade): TierKey {
  if (grade === '6e' || grade === '5e') return 'college_junior';
  if (grade === '4e' || grade === '3e') return 'college_senior';
  if (grade === '2nde' || grade === '1re') return 'lycee_seconde_premiere';
  return 'lycee_terminale';
}

const TIER_LABELS: Record<TierKey, string> = {
  college_junior: 'Collège 6e - 5e (A1)',
  college_senior: 'Collège 4e - 3e (A2/B1)',
  lycee_seconde_premiere: 'Lycée 2nde - 1re (B1/B2)',
  lycee_terminale: 'Terminale (C1/C2)'
};

export const GrammarBattleModal: React.FC<GrammarBattleModalProps> = ({
  isOpen,
  onClose,
  schoolGrade,
  cefrLevel,
  onXpEarned
}) => {
  const [tier, setTier] = useState<TierKey>(() => mapGradeToTier(schoolGrade));
  const [qIdx, setQIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [playerHearts, setPlayerHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [chosenOpt, setChosenOpt] = useState<number | null>(null);
  const [battleOver, setBattleOver] = useState<'none' | 'victory' | 'defeat'>('none');
  const [imgErr, setImgErr] = useState(false);

  const questions = useMemo(
    () => GRAMMAR_BATTLE_QUESTIONS.filter((q) => q.gradeTier === tier),
    [tier]
  );

  useEffect(() => {
    setTier(mapGradeToTier(schoolGrade));
  }, [schoolGrade]);

  useEffect(() => {
    resetBattle();
  }, [tier]);

  useEffect(() => {
    if (!isOpen) stopSpeech();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  function resetBattle() {
    setQIdx(0);
    setBossHp(100);
    setPlayerHearts(3);
    setCombo(0);
    setCorrectCount(0);
    setChosenOpt(null);
    setBattleOver('none');
  }

  if (!isOpen) return null;

  const currentQ = questions[qIdx];

  const handleAnswer = async (optIdx: number) => {
    if (chosenOpt !== null || battleOver !== 'none' || !currentQ) return;
    setChosenOpt(optIdx);

    const isRight = optIdx === currentQ.correctIndex;
    let nextBossHp = bossHp;
    let nextHearts = playerHearts;
    let nextCorrect = correctCount;

    if (isRight) {
      playCorrectCue();
      nextCorrect += 1;
      setCorrectCount(nextCorrect);
      setCombo((c) => c + 1);
      nextBossHp = Math.max(0, bossHp - Math.ceil(100 / questions.length));
      setBossHp(nextBossHp);
    } else {
      playIncorrectCue();
      setCombo(0);
      nextHearts = Math.max(0, playerHearts - 1);
      setPlayerHearts(nextHearts);
    }

    if (nextHearts === 0) {
      setBattleOver('defeat');
      const score = Math.round((nextCorrect / questions.length) * 100);
      await recordAttempt({
        moduleId: `grammar-battle-${tier}`,
        moduleType: 'grammar_battle',
        title: `Grammar Battle (${TIER_LABELS[tier]})`,
        level: currentQ.cefrLevel || cefrLevel,
        score,
        durationSeconds: 75
      });
    } else if (qIdx + 1 >= questions.length || nextBossHp === 0) {
      setBattleOver('victory');
      playVictoryCue();
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#f2ca50', '#ffe088', '#38bdf8']
        });
      } catch {
        // ignore
      }
      const score = Math.max(60, Math.round((nextCorrect / questions.length) * 100));
      awardMszCoins('quiz', `grammar-battle-${tier}`, 10, 50, `Grammar Battle : ${TIER_LABELS[tier]}`);
      await recordAttempt({
        moduleId: `grammar-battle-${tier}`,
        moduleType: 'grammar_battle',
        title: `Grammar Battle (${TIER_LABELS[tier]})`,
        level: currentQ.cefrLevel || cefrLevel,
        score,
        durationSeconds: 90
      });
      onXpEarned?.(score >= 85 ? 60 : 40);
    }
  };

  const handleNextRound = () => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setChosenOpt(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Grammar Battle"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#151b2b] via-[#191f2f] to-[#0c1322] border-b border-[#4d4635]/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#f2ca50]/55 bg-[#070e1d] shrink-0">
              {!imgErr ? (
                <img
                  src={battleShieldImg}
                  alt="Blason Grammar Battle"
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                ARÈNE SYNTAXIQUE • DUEL CHRONO
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8]">
                Grammar Battle Arena
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer Grammar Battle"
            className="w-9 h-9 rounded-full bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tier Selector */}
        <div className="px-4 py-2.5 bg-[#151b2b] border-b border-[#232a3a] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {(Object.keys(TIER_LABELS) as TierKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTier(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                tier === key
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'bg-[#191f2f] text-[#d0c5af] border border-[#2e3545] hover:border-[#f2ca50]/45'
              }`}
            >
              {TIER_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Arena Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Combat HUD */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#151b2b] border border-[#232a3a]">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#dce2f8] font-bold">Vos Vies</span>
                <span className="text-rose-400 font-bold">{'♥ '.repeat(playerHearts) || '0'}</span>
              </div>
              <div className="text-[11px] font-mono text-[#f2ca50]">Combo : x{Math.max(1, combo)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#d0c5af]">Bouclier du Gardien</span>
                <span className="text-[#f2ca50] font-bold tabular-nums">{bossHp}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#070e1d] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] transition-all duration-300"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          </div>

          {battleOver !== 'none' ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#070e1d] border border-[#f2ca50]/60 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-[#f2ca50]">
                {battleOver === 'victory' ? 'military_tech' : 'refresh'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#dce2f8]">
                {battleOver === 'victory'
                  ? 'Gardien Vaincu — Précision Exemplaire !'
                  : 'Bouclier Brisé — Nouvelle Tentative'}
              </h3>
              <p className="text-xs sm:text-sm text-[#d0c5af]">
                Bonnes réponses : <strong className="text-[#f2ca50] font-mono">{correctCount}/{questions.length}</strong>.
                {battleOver === 'victory' && ' (+40 à +60 XP et +30 MSZ Coins attribués !)'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetBattle}
                  className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold cursor-pointer"
                >
                  Rejouer l’Arène
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#232a3a] text-[#dce2f8] text-xs font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/35 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#070e1d] border border-[#f2ca50]/40 text-[10px] font-mono font-bold text-[#f2ca50]">
                  {currentQ.grammarTopic} • {currentQ.cefrLevel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(currentQ.promptEn.replace('___', currentQ.options[currentQ.correctIndex]), 'en-GB', currentQ.id)
                  }
                  className="text-xs font-mono text-[#f2ca50] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">volume_up</span>
                  <span>Écouter</span>
                </button>
              </div>

              <p className="font-serif text-lg text-[#dce2f8] leading-relaxed">
                {currentQ.promptEn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt, idx) => {
                  const answered = chosenOpt !== null;
                  const isCorrectOpt = answered && idx === currentQ.correctIndex;
                  const isWrongOpt = answered && chosenOpt === idx && idx !== currentQ.correctIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleAnswer(idx)}
                      className={`p-3.5 rounded-xl text-left text-sm font-semibold border transition-all cursor-pointer ${
                        isCorrectOpt
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                          : isWrongOpt
                          ? 'bg-rose-950/60 border-rose-400 text-rose-200'
                          : 'bg-[#0c1322] hover:bg-[#191f2f] border-[#2e3545] hover:border-[#f2ca50]/60 text-[#dce2f8]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {chosenOpt !== null && battleOver === 'none' && (
                <div className="p-3.5 rounded-xl bg-[#070e1d] border border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#d0c5af] leading-relaxed">
                    <strong className="text-[#f2ca50]">Règle :</strong> {currentQ.explanationFr}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Attaque Suivante →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
