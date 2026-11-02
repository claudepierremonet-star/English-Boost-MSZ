import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getLevelProgress } from '../utils/levelUtils';

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  totalXp: number;
  deltaXp: number;
}

interface LevelUpCelebrationModalProps {
  data: LevelUpData | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimReward?: () => void;
}

// Fanfare royale & carillon académique via Web Audio API
function playLevelUpSymphony() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Séquence royale d'ascension : Do4, Sol4, Do5, Mi5, Sol5, Do6
    const notes = [
      { freq: 261.63, time: 0.00, dur: 0.16, type: 'triangle' as OscillatorType, vol: 0.15 }, // C4
      { freq: 392.00, time: 0.12, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.16 }, // G4
      { freq: 523.25, time: 0.24, dur: 0.20, type: 'triangle' as OscillatorType, vol: 0.18 }, // C5
      { freq: 659.25, time: 0.38, dur: 0.22, type: 'triangle' as OscillatorType, vol: 0.20 }, // E5
      { freq: 783.99, time: 0.52, dur: 0.26, type: 'triangle' as OscillatorType, vol: 0.22 }, // G5
      { freq: 1046.50, time: 0.70, dur: 0.85, type: 'sine' as OscillatorType, vol: 0.28 },     // C6 (Ténor triomphal)
      { freq: 1318.51, time: 0.72, dur: 0.75, type: 'sine' as OscillatorType, vol: 0.12 }     // E6 (Harmonique céleste)
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(n.vol, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch {
    // Silently continue if audio context is blocked
  }
}

// Convertit un niveau en chiffres romains
function toRoman(num: number): string {
  const romanLookup: [number, string][] = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];
  let res = '';
  let n = num;
  for (const [val, sym] of romanLookup) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res || 'I';
}

// Titre et distinction académique selon le niveau
function getOxfordRankTitle(level: number): { title: string; subtitle: string; icon: string } {
  if (level >= 51) {
    return {
      title: 'Doctor of Letters • Grand Érudit',
      subtitle: 'Chaire d’Excellence de l’Académie d’Oxford',
      icon: 'military_tech'
    };
  }
  if (level >= 31) {
    return {
      title: 'Honorary Fellow • Maître Émérite',
      subtitle: 'Membre Titulaire de la Société Humaniste',
      icon: 'workspace_premium'
    };
  }
  if (level >= 21) {
    return {
      title: 'Magister Eloquentiae • Maître en Rhétorique',
      subtitle: 'Orateur Distingué & Styliste Littéraire',
      icon: 'school'
    };
  }
  if (level >= 11) {
    return {
      title: 'Fellow Commoner • Compagnon Humaniste',
      subtitle: 'Praticien Averti des Belles-Lettres',
      icon: 'auto_stories'
    };
  }
  return {
    title: 'Tironian Scholar • Apprenti Lexicographe',
    subtitle: 'Étudiant Assidu du Trivium Oxfordien',
    icon: 'history_edu'
  };
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  data,
  isOpen,
  onClose,
  onClaimReward
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [animatedLevel, setAnimatedLevel] = useState<number>(data?.oldLevel || 1);

  useEffect(() => {
    if (isOpen && data) {
      // Déclencher le son triomphal
      playLevelUpSymphony();

      // Feux d'artifice et pluie de confettis dorés
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f2ca50', '#ffd875', '#d4af37', '#ffffff', '#38bdf8']
      });

      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 60,
          spread: 65,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#f2ca50', '#ffffff', '#d4af37']
        });
        confetti({
          particleCount: 65,
          angle: 120,
          spread: 65,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#f2ca50', '#ffffff', '#d4af37']
        });
      }, 300);

      // Animation du compteur de niveau (de oldLevel à newLevel)
      const countUpTimer = setTimeout(() => {
        setAnimatedLevel(data.newLevel);
      }, 500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(countUpTimer);
      };
    } else if (data) {
      setAnimatedLevel(data.oldLevel);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const currentLevelProgress = getLevelProgress(data.totalXp);
  const rank = getOxfordRankTitle(data.newLevel);
  const levelsGained = Math.max(1, data.newLevel - data.oldLevel);

  const handleShare = async () => {
    const text = `🎓 Distinction Académique Oxford : Je viens d'atteindre le Niveau ${data.newLevel} (${rank.title}) avec ${data.totalXp.toLocaleString()} XP ! Relevez le défi linguistique avec moi.`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.65, opacity: 0, y: 50, rotate: -3 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.75, opacity: 0, y: 35 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#141e33] via-[#0d1424] to-[#070b14] border-2 border-[#f2ca50] p-6 sm:p-8 shadow-[0_0_80px_rgba(242,202,80,0.45)] flex flex-col items-center text-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rayons solaires rotatifs en arrière-plan (Aura d'Excellence) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[#f2ca50]/20 via-[#ffd875]/10 to-transparent blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-bl from-[#38bdf8]/15 via-[#f2ca50]/15 to-transparent blur-3xl pointer-events-none"
          />

          {/* Bouton fermeture discret */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#172136] text-[#99907c] hover:text-[#f2ca50] flex items-center justify-center transition-colors cursor-pointer z-10 border border-[#2c374d]"
            aria-label="Fermer"
          >
            ✕
          </motion.button>

          {/* Bannière supérieure dorée avec rebond doux */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f2ca50]/25 via-amber-500/20 to-[#f2ca50]/25 border border-[#f2ca50]/70 text-[#f2ca50] text-xs font-mono font-bold uppercase tracking-widest shadow-lg mb-2"
          >
            <span className="material-symbols-outlined text-sm animate-bounce">grade</span>
            <span>Élévation de Grade Académique</span>
            <span className="material-symbols-outlined text-sm animate-bounce">grade</span>
          </motion.div>

          {/* Médaillon monumental de Niveau animé avec Framer Motion */}
          <motion.div
            initial={{ scale: 0.2, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.25 }}
            className="relative my-4 flex items-center justify-center"
          >
            {/* Halo de pulsation d'or */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.5, 0.9, 0.5]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#f2ca50]/40 via-[#ffe494]/30 to-[#f2ca50]/40 blur-xl"
            />

            {/* Couronne de lauriers extérieure */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#cca639] via-[#ffe088] to-[#997722] shadow-[0_0_40px_rgba(242,202,80,0.6)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#18233c] to-[#0a0f1d] border-2 border-[#f2ca50]/80 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                {/* Icône de rang stylisée */}
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4af37]">
                  GRADE {toRoman(data.newLevel)}
                </span>

                {/* Chiffre de niveau avec transition fluide spring */}
                <motion.div
                  key={animatedLevel}
                  initial={{ y: 20, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                  className="font-serif font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#ffe088] to-[#f2ca50] drop-shadow-md leading-none my-0.5"
                >
                  {animatedLevel}
                </motion.div>

                <span className="text-[11px] font-serif italic text-[#c8d3ee]">
                  Niveau Obtenu
                </span>

                {/* Éclat lumineux diagonal */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 pointer-events-none" />
              </div>

              {/* Badge delta +1 ou +N niveau(x) */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55, type: 'spring', damping: 10 }}
                className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-full bg-[#f2ca50] text-[#2d2200] font-black text-[11px] font-mono shadow-md border-2 border-[#121927] flex items-center gap-1"
              >
                <span>+{levelsGained}</span>
                <span className="material-symbols-outlined text-xs">arrow_upward</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Titre d'honneur & citation académique */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-1 mb-4"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-[#f2ca50]">
              <span className="material-symbols-outlined text-base">{rank.icon}</span>
              <span>{rank.subtitle}</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#ffffff] tracking-tight">
              {rank.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-sm mx-auto">
              Félicitations pour votre persévérance. Votre vocabulaire et votre précision s'élèvent au rang supérieur d'Oxford.
            </p>
          </motion.div>

          {/* Carte d'avantages & progression vers le palier suivant */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="w-full rounded-2xl bg-[#090e1a]/90 border border-[#20293d] p-4 text-left space-y-3 shadow-inner"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#99907c] uppercase tracking-wider text-[11px]">
                Progression Niveau {data.newLevel + 1} :
              </span>
              <span className="font-mono font-bold text-[#f2ca50] text-[11px]">
                {currentLevelProgress.pointsInCurrentLevel} / 100 XP
              </span>
            </div>

            {/* Barre de progression fluide Framer Motion */}
            <div className="w-full h-3 rounded-full bg-[#141b2c] overflow-hidden p-0.5 border border-[#273248]">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${currentLevelProgress.progressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#f2ca50] to-[#ffe599] shadow-[0_0_12px_rgba(242,202,80,0.8)]"
              />
            </div>

            {/* Privilèges débloqués */}
            <div className="pt-2 border-t border-[#1b2336] grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-[#dce2f8]">
                <span className="w-5 h-5 rounded-md bg-[#f2ca50]/20 text-[#f2ca50] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xs">lock_open</span>
                </span>
                <span>Nouveaux défis débloqués</span>
              </div>
              <div className="flex items-center gap-2 text-[#dce2f8]">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                </span>
                <span>Prestige Ligue d'Oxford</span>
              </div>
            </div>
          </motion.div>

          {/* Boutons d'action : Poursuivre & Partager */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="w-full mt-5 flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                if (onClaimReward) onClaimReward();
                onClose();
              }}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#2c1d00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#f2ca50]/25 hover:shadow-[#f2ca50]/40 transition-all cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-base">military_tech</span>
              <span>Continuer l'Étude</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleShare}
              className="py-3 px-4 rounded-xl bg-[#172136] hover:bg-[#1e2a44] border border-[#2f3b54] text-[#dce2f8] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'done' : 'share'}
              </span>
              <span>{copied ? 'Copié !' : 'Partager'}</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
