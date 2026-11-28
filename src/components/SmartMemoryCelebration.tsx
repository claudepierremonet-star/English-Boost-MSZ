import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export const DAILY_REVIEW_CELEBRATION_THRESHOLD = 10;

export type SmartMemorySessionKind = 'daily_review' | 'targeted' | 'single' | 'custom';

export interface DailyCelebrationCheckInput {
  sessionFinished: boolean;
  sessionKind: SmartMemorySessionKind;
  completedCardsCount: number;
}

/**
 * Determines whether the Framer Motion confetti celebration should trigger.
 * Requires a finished daily review session with strictly more than 10 cards completed.
 */
export function shouldCelebrateDailyReview(input: DailyCelebrationCheckInput): boolean {
  return (
    Boolean(input.sessionFinished) &&
    input.sessionKind === 'daily_review' &&
    Number.isFinite(input.completedCardsCount) &&
    input.completedCardsCount > DAILY_REVIEW_CELEBRATION_THRESHOLD
  );
}

export interface ConfettiParticleSpec {
  id: number;
  shape: 'ribbon' | 'diamond' | 'circle' | 'star';
  color: string;
  startX: number;
  driftX: number;
  peakY: number;
  fallY: number;
  rotateStart: number;
  rotateEnd: number;
  scalePeak: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
}

const CONFETTI_PALETTE = [
  '#f2ca50', // Oxford Gold
  '#ffe088', // Light Champagne Gold
  '#34d399', // Emerald
  '#38bdf8', // Azure Sky
  '#a78bfa', // Royal Violet
  '#fb7185'  // Coral Rose
] as const;

const SHAPES: ConfettiParticleSpec['shape'][] = ['ribbon', 'diamond', 'circle', 'star'];

/**
 * Deterministic confetti trajectory table so animations are crisp and SSR/test safe
 */
export function buildConfettiParticles(count = 36): ConfettiParticleSpec[] {
  const particles: ConfettiParticleSpec[] = [];
  for (let i = 0; i < count; i++) {
    const angleRatio = (i / count) * Math.PI * 2;
    const spread = ((i % 9) - 4) * 58 + Math.cos(angleRatio * 2) * 34;
    const peakLift = -85 - ((i * 19) % 85);
    const fallDrop = 230 + ((i * 23) % 120);
    const isRibbon = i % 4 === 0;
    const isCircle = i % 4 === 2;

    particles.push({
      id: i,
      shape: SHAPES[i % SHAPES.length],
      color: CONFETTI_PALETTE[i % CONFETTI_PALETTE.length],
      startX: ((i % 7) - 3) * 14,
      driftX: spread,
      peakY: peakLift,
      fallY: fallDrop,
      rotateStart: (i * 37) % 180,
      rotateEnd: (i % 2 === 0 ? 1 : -1) * (320 + ((i * 41) % 360)),
      scalePeak: 0.9 + ((i % 5) * 0.12),
      delay: (i % 10) * 0.035,
      duration: 1.9 + ((i % 6) * 0.22),
      width: isRibbon ? 11 : isCircle ? 8 : 10,
      height: isRibbon ? 5 : isCircle ? 8 : 10
    });
  }
  return particles;
}

export interface SmartMemoryCelebrationProps {
  sessionTitle: string;
  completedCards: number;
  correctCards: number;
  xpEarned: number;
  onStartNewSession: () => void;
  onViewProgress: () => void;
}

export const SmartMemoryCelebration: React.FC<SmartMemoryCelebrationProps> = ({
  sessionTitle,
  completedCards,
  correctCards,
  xpEarned,
  onStartNewSession,
  onViewProgress
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [burstKey, setBurstKey] = useState<number>(1);
  const particles = useMemo(() => buildConfettiParticles(36), []);

  const accuracyPct =
    completedCards > 0 ? Math.round((correctCards / completedCards) * 100) : 100;

  return (
    <motion.section
      aria-label="Célébration de session quotidienne Smart Memory"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121c33] via-[#0c1322] to-[#080e1c] border border-[#f2ca50]/65 p-6 sm:p-8 text-center shadow-2xl"
    >
      {/* Subtle Ambient Gold Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[380px] h-[240px] rounded-full bg-[#f2ca50]/15 blur-3xl"
      />

      {/* Framer Motion Confetti Shower Overlay */}
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          data-testid="smart-memory-confetti-layer"
          className="pointer-events-none absolute inset-0 overflow-hidden flex items-start justify-center pt-10"
        >
          <AnimatePresence mode="sync">
            <React.Fragment key={burstKey}>
              {particles.map((p) => (
                <motion.div
                  key={`${burstKey}-${p.id}`}
                  initial={{
                    opacity: 0,
                    x: p.startX,
                    y: 0,
                    scale: 0.25,
                    rotate: p.rotateStart
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0.85, 0],
                    x: [p.startX, p.driftX * 0.65, p.driftX],
                    y: [0, p.peakY, p.fallY],
                    scale: [0.3, p.scalePeak, p.scalePeak * 0.95, 0.65],
                    rotate: p.rotateEnd
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  style={{
                    position: 'absolute',
                    width: p.width,
                    height: p.height,
                    backgroundColor: p.shape === 'star' ? 'transparent' : p.color,
                    borderRadius:
                      p.shape === 'circle' ? '9999px' : p.shape === 'ribbon' ? '2px' : '2px',
                    transformOrigin: 'center'
                  }}
                >
                  {p.shape === 'diamond' && (
                    <span
                      className="block w-full h-full rotate-45 rounded-[2px]"
                      style={{ backgroundColor: p.color }}
                    />
                  )}
                  {p.shape === 'star' && (
                    <span
                      className="block text-[12px] leading-none font-bold select-none"
                      style={{ color: p.color }}
                    >
                      ✦
                    </span>
                  )}
                </motion.div>
              ))}
            </React.Fragment>
          </AnimatePresence>
        </div>
      )}

      {/* Content Foreground */}
      <div className="relative z-10 flex flex-col items-center gap-4 max-w-xl mx-auto">
        {/* Expanding Gold Aura & Spring Trophy Emblem */}
        <div className="relative flex items-center justify-center">
          {!shouldReduceMotion && (
            <motion.div
              key={`halo-${burstKey}`}
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: [0.7, 1.55, 1.9], opacity: [0.75, 0.25, 0] }}
              transition={{ duration: 1.25, ease: 'easeOut' }}
              className="absolute w-16 h-16 rounded-full border-2 border-[#f2ca50]"
            />
          )}
          <motion.div
            key={`emblem-${burstKey}`}
            initial={shouldReduceMotion ? false : { scale: 0.3, rotate: -14 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f2ca50]/25 to-[#d4af37]/10 border border-[#f2ca50]/70 flex items-center justify-center shadow-lg shadow-[#f2ca50]/20"
          >
            <span className="material-symbols-outlined text-4xl text-[#f2ca50]">
              workspace_premium
            </span>
          </motion.div>
        </div>

        {/* Milestone Badge */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.28 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/45 text-emerald-300 text-xs font-mono font-bold"
        >
          <span className="material-symbols-outlined text-sm">celebration</span>
          <span>OBJECTIF QUOTIDIEN DÉPASSÉ · {completedCards} CARTES RÉVISÉES</span>
        </motion.div>

        <div className="space-y-1.5">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#dce2f8]">
            Bravo ! Session « {sessionTitle} » accomplie
          </h3>
          <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed">
            Vous avez complété une révision quotidienne intensive de{' '}
            <strong className="text-[#f2ca50] font-mono">{completedCards} cartes</strong> avec{' '}
            <strong className="text-emerald-300 font-mono">{accuracyPct}%</strong> de réussite et
            remporté{' '}
            <strong className="text-[#f2ca50] font-mono">+{xpEarned} XP</strong> dans Firestore.
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-md pt-1 font-mono tabular-nums">
          <div className="p-3 rounded-xl bg-[#070e1d]/90 border border-[#232a3a]">
            <span className="text-[10px] font-sans text-[#99907c] block">Cartes</span>
            <strong className="text-lg font-bold text-[#f2ca50]">{completedCards}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#070e1d]/90 border border-[#232a3a]">
            <span className="text-[10px] font-sans text-[#99907c] block">Rappels justes</span>
            <strong className="text-lg font-bold text-emerald-400">
              {correctCards}/{completedCards}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-[#070e1d]/90 border border-[#232a3a]">
            <span className="text-[10px] font-sans text-[#99907c] block">Bonus XP</span>
            <strong className="text-lg font-bold text-sky-300">+{xpEarned}</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onStartNewSession}
            className="min-h-[42px] luxury-btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            <span>Nouvelle session adaptative</span>
          </button>

          <button
            type="button"
            onClick={onViewProgress}
            className="min-h-[42px] luxury-btn-surface px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Voir mes progrès
          </button>

          {!shouldReduceMotion && (
            <button
              type="button"
              onClick={() => setBurstKey((k) => k + 1)}
              className="min-h-[42px] px-3 py-2 rounded-xl bg-[#070e1d] border border-[#f2ca50]/35 hover:border-[#f2ca50] text-[#f2ca50] text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Relancer l’animation de confettis"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Relancer les confettis</span>
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
};
