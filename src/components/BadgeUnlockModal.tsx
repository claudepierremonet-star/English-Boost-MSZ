import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AcademicBadge } from '../firebase/types';
import { BADGE_TIER_STYLES } from '../data/badges';
import confetti from 'canvas-confetti';

interface BadgeUnlockModalProps {
  badge: AcademicBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimReward?: (badge: AcademicBadge) => void;
}

// Triumph harmonic fanfare via Web Audio API
function playTriumphFanfare() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.18 }, // C5
      { freq: 659.25, time: 0.14, dur: 0.18 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.22 }, // G5
      { freq: 1046.5, time: 0.44, dur: 0.65 } // C6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0.18, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch (e) {
    // Autoplay restrictions
  }
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badge,
  isOpen,
  onClose,
  onClaimReward
}) => {
  useEffect(() => {
    if (isOpen && badge) {
      playTriumphFanfare();

      // Dual confetti bursts
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.55 }
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.65 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.65 }
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  const tierStyle = BADGE_TIER_STYLES[badge.tier];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 40, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#141d33] via-[#0c1322] to-[#070b14] border-2 border-[#f2ca50] p-6 sm:p-8 shadow-[0_0_60px_rgba(242,202,80,0.35)] flex flex-col items-center text-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Radiant Background Golden Aura & Starburst */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#f2ca50]/20 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#38bdf8]/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#151b2b] text-[#99907c] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          {/* Top Banner Tag */}
          <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/60 text-[#f2ca50] text-[11px] font-mono font-bold uppercase tracking-widest shadow-md mb-4"
          >
            <span className="material-symbols-outlined text-sm">celebration</span>
            <span>Distinction Débloquée</span>
          </motion.div>

          {/* Glowing Animated Badge Medallion */}
          <motion.div
            initial={{ scale: 0.3, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            className="relative my-2"
          >
            {/* Spinning background glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f2ca50] via-[#ffd875] to-[#cca639] blur-md opacity-70 animate-spin" style={{ animationDuration: '8s' }} />

            <div
              className={`relative w-24 h-24 rounded-3xl p-1 shadow-2xl flex items-center justify-center border-2 ${tierStyle.border} ${tierStyle.bg}`}
            >
              <div className="w-full h-full rounded-2xl bg-[#0c1322]/90 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-5xl text-[#f2ca50]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {badge.icon}
                </span>
              </div>
            </div>

            {/* Sparkle badge indicator */}
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center text-xs font-bold shadow-lg">
              ✨
            </span>
          </motion.div>

          {/* Badge Titles */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="space-y-1 mt-3"
          >
            <span className="text-xs font-serif italic text-[#d4c78f] block">
              {badge.latinTitle}
            </span>
            <h3 className="font-serif font-black text-2xl text-[#f3f4f6] tracking-tight">
              {badge.title}
            </h3>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${tierStyle.text} ${tierStyle.badgeBg} border ${tierStyle.border}`}
            >
              Palier {tierStyle.label}
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed max-w-sm mt-3"
          >
            {badge.description}
          </motion.p>

          {/* XP Reward & Requirement Box */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="w-full p-3 rounded-2xl bg-[#070b14]/90 border border-[#232a3a] mt-4 flex items-center justify-between font-mono text-xs"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-[#99907c] uppercase">Critère validé :</span>
              <strong className="text-[#dce2f8] text-[11px]">{badge.requirementLabel}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] font-bold">
              <span className="material-symbols-outlined text-sm">workspace_premium</span>
              <span>+{badge.xpReward} XP</span>
            </div>
          </motion.div>

          {/* Claim Action Button */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-5 flex flex-col gap-2"
          >
            <button
              type="button"
              onClick={() => {
                if (onClaimReward) onClaimReward(badge);
                onClose();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#f2ca50]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Revendiquer la Distinction (+{badge.xpReward} XP)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-[#99907c] hover:text-[#dce2f8] transition-colors pt-1 cursor-pointer"
            >
              Fermer et continuer
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
