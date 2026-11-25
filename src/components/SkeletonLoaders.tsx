import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export interface MotionShimmerBlockProps {
  className?: string;
  /** Optional delay offset (in seconds) to create a subtle wave across cards */
  delay?: number;
  /** Visual surface contrast preset matching the dark-luxury palette */
  surface?: 'base' | 'elevated' | 'pill' | 'gold';
  rounded?: string;
  children?: React.ReactNode;
}

const SURFACE_CLASSES: Record<NonNullable<MotionShimmerBlockProps['surface']>, string> = {
  base: 'bg-[#151b2b] border border-[#232a3a]/80',
  elevated: 'bg-[#1c2438] border border-[#2e3545]/70',
  pill: 'bg-[#232a3a] border border-[#334155]/50',
  gold: 'bg-[#f2ca50]/12 border border-[#f2ca50]/25'
};

/**
 * GPU-composited Framer Motion shimmer block.
 * Animates only `transform: translateX(...)` (and static fallback when reduced motion is enabled).
 */
export const MotionShimmerBlock: React.FC<MotionShimmerBlockProps> = ({
  className = '',
  delay = 0,
  surface = 'elevated',
  rounded = 'rounded-lg',
  children
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${SURFACE_CLASSES[surface]} ${className}`}
      aria-hidden="true"
    >
      {!shouldReduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 w-2/3 will-change-transform"
          style={{
            background:
              surface === 'gold'
                ? 'linear-gradient(90deg, transparent 0%, rgba(242,202,80,0.08) 32%, rgba(255,224,136,0.24) 50%, rgba(242,202,80,0.08) 68%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.06) 28%, rgba(242,202,80,0.14) 50%, rgba(148,163,184,0.06) 72%, transparent 100%)'
          }}
          initial={{ x: '-120%' }}
          animate={{ x: '240%' }}
          transition={{
            duration: 1.65,
            repeat: Infinity,
            repeatDelay: 0.25,
            ease: 'easeInOut',
            delay
          }}
        />
      )}
      {children}
    </div>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16, ease: LUXURY_EASE }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: LUXURY_EASE }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.14, ease: LUXURY_EASE }
  }
};

const reducedContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

/* ============================================================================ */
/* 1. LEADERBOARD SKELETON (Top Banner + Top 3 Podium + Ranked Learner List)    */
/* ============================================================================ */
export const LeaderboardSkeleton: React.FC<{ rowCount?: number }> = ({ rowCount = 6 }) => {
  const shouldReduceMotion = useReducedMotion();
  const cVariants = shouldReduceMotion ? reducedContainerVariants : containerVariants;
  const iVariants = shouldReduceMotion ? reducedItemVariants : itemVariants;

  return (
    <motion.div
      variants={cVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-label="Chargement du classement académique"
      className="space-y-6"
    >
      {/* Current User Standing Banner Skeleton */}
      <motion.div
        variants={iVariants}
        className="rounded-xl bg-gradient-to-r from-[#172554]/55 via-[#0f172a] to-[#1e1b4b]/55 border border-[#f2ca50]/30 p-4 sm:p-5 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MotionShimmerBlock className="w-14 h-14 shrink-0" rounded="rounded-full" surface="gold" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MotionShimmerBlock className="h-5 w-44" delay={0.05} />
                <MotionShimmerBlock className="h-4 w-24" rounded="rounded-full" surface="gold" delay={0.1} />
              </div>
              <MotionShimmerBlock className="h-3.5 w-64 sm:w-80" surface="base" delay={0.15} />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
            <div className="space-y-1.5 text-right">
              <MotionShimmerBlock className="h-6 w-24 ml-auto" surface="gold" delay={0.12} />
              <MotionShimmerBlock className="h-3 w-16 ml-auto" surface="base" delay={0.18} />
            </div>
            <MotionShimmerBlock className="h-9 w-28" rounded="rounded-xl" surface="gold" delay={0.2} />
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium Skeleton */}
      <motion.div variants={iVariants} className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-400/25 flex flex-col items-center gap-2.5 shadow-lg">
            <MotionShimmerBlock className="w-8 h-8" rounded="rounded-full" delay={0.06} />
            <MotionShimmerBlock className="h-4 w-28" rounded="rounded-full" delay={0.1} />
            <MotionShimmerBlock className="w-16 h-16" rounded="rounded-full" surface="elevated" delay={0.14} />
            <MotionShimmerBlock className="h-4 w-32" delay={0.18} />
            <MotionShimmerBlock className="h-5 w-20" surface="pill" delay={0.22} />
          </div>

          {/* Rank 1 */}
          <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-[#1e293b]/80 to-[#0c1322] border-2 border-[#f2ca50]/40 flex flex-col items-center gap-3 shadow-2xl">
            <MotionShimmerBlock className="w-10 h-10" rounded="rounded-full" surface="gold" delay={0.04} />
            <MotionShimmerBlock className="h-5 w-36" rounded="rounded-full" surface="gold" delay={0.08} />
            <MotionShimmerBlock className="w-20 h-20" rounded="rounded-full" surface="gold" delay={0.12} />
            <MotionShimmerBlock className="h-5 w-36" delay={0.16} />
            <MotionShimmerBlock className="h-6 w-24" surface="gold" delay={0.2} />
          </div>

          {/* Rank 3 */}
          <div className="order-3 p-5 rounded-2xl bg-[#0f172a]/90 border border-amber-600/25 flex flex-col items-center gap-2.5 shadow-lg">
            <MotionShimmerBlock className="w-8 h-8" rounded="rounded-full" delay={0.1} />
            <MotionShimmerBlock className="h-4 w-28" rounded="rounded-full" delay={0.14} />
            <MotionShimmerBlock className="w-16 h-16" rounded="rounded-full" surface="elevated" delay={0.18} />
            <MotionShimmerBlock className="h-4 w-32" delay={0.22} />
            <MotionShimmerBlock className="h-5 w-20" surface="pill" delay={0.26} />
          </div>
        </div>
      </motion.div>

      {/* General League Table Skeleton */}
      <motion.div
        variants={iVariants}
        className="rounded-2xl bg-[#0f172a]/80 border border-[#232a3a] p-4 sm:p-5 shadow-xl space-y-3"
      >
        <div className="flex items-center gap-2.5 pb-1">
          <MotionShimmerBlock className="w-5 h-5" rounded="rounded-md" surface="gold" />
          <MotionShimmerBlock className="h-4 w-64" surface="elevated" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: rowCount }).map((_, idx) => (
            <motion.div
              key={idx}
              variants={iVariants}
              className="p-3.5 rounded-xl bg-[#0b1120] border border-[#1e293b] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <MotionShimmerBlock className="w-8 h-5 shrink-0" delay={idx * 0.04} />
                <MotionShimmerBlock className="w-10 h-10 shrink-0" rounded="rounded-full" delay={idx * 0.05} />
                <div className="space-y-1.5 min-w-0 flex-1 max-w-[240px]">
                  <MotionShimmerBlock className="h-4 w-36 sm:w-44" delay={idx * 0.06} />
                  <MotionShimmerBlock className="h-3 w-28" surface="base" delay={idx * 0.07} />
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <MotionShimmerBlock className="h-5 w-20" surface="gold" delay={idx * 0.05} />
                <MotionShimmerBlock className="h-7 w-14" rounded="rounded-lg" surface="pill" delay={idx * 0.06} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============================================================================ */
/* 2. LESSON LIST SKELETON (Matches LessonCardItem & Theme Group Sections)      */
/* ============================================================================ */
const LessonCardSkeleton: React.FC<{ delayOffset?: number }> = ({ delayOffset = 0 }) => (
  <div className="p-4 rounded-2xl bg-[#191f2f] border border-[#4d4635]/25 flex flex-col justify-between gap-3 shadow-md">
    <div className="flex flex-col gap-2.5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MotionShimmerBlock className="w-8 h-8 shrink-0" surface="gold" delay={delayOffset} />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <MotionShimmerBlock className="h-2.5 w-20" surface="gold" delay={delayOffset + 0.04} />
            <MotionShimmerBlock className="h-4 w-4/5" delay={delayOffset + 0.08} />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <MotionShimmerBlock className="h-5 w-9" rounded="rounded-full" surface="gold" delay={delayOffset + 0.06} />
          <MotionShimmerBlock className="h-5 w-8" rounded="rounded-md" surface="pill" delay={delayOffset + 0.09} />
          <MotionShimmerBlock className="w-7 h-7" rounded="rounded-lg" surface="base" delay={delayOffset + 0.12} />
        </div>
      </div>

      {/* English subtitle + objective */}
      <MotionShimmerBlock className="h-3 w-2/3" surface="base" delay={delayOffset + 0.08} />
      <div className="space-y-1.5">
        <MotionShimmerBlock className="h-3 w-full" surface="base" delay={delayOffset + 0.1} />
        <MotionShimmerBlock className="h-3 w-5/6" surface="base" delay={delayOffset + 0.13} />
      </div>

      {/* Grammar pill */}
      <MotionShimmerBlock className="h-8 w-full" rounded="rounded-lg" surface="base" delay={delayOffset + 0.14} />

      {/* Vocab strip */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <MotionShimmerBlock className="h-5 w-20" rounded="rounded-md" surface="pill" delay={delayOffset + 0.15} />
        <MotionShimmerBlock className="h-5 w-24" rounded="rounded-md" surface="pill" delay={delayOffset + 0.18} />
        <MotionShimmerBlock className="h-5 w-16" rounded="rounded-md" surface="pill" delay={delayOffset + 0.21} />
      </div>

      {/* Dialogue & Dictation tags */}
      <div className="flex items-center gap-2">
        <MotionShimmerBlock className="h-5 w-28" rounded="rounded" surface="base" delay={delayOffset + 0.16} />
        <MotionShimmerBlock className="h-5 w-16" rounded="rounded" surface="base" delay={delayOffset + 0.2} />
      </div>
    </div>

    {/* Action Footer */}
    <div className="border-t border-[#232a3a] pt-3 flex flex-col gap-2 mt-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MotionShimmerBlock className="h-3.5 w-14" surface="base" delay={delayOffset + 0.18} />
          <MotionShimmerBlock className="h-3.5 w-12" surface="base" delay={delayOffset + 0.2} />
        </div>
        <MotionShimmerBlock className="h-3.5 w-24" surface="base" delay={delayOffset + 0.22} />
      </div>
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5">
          <MotionShimmerBlock className="h-7 w-20" rounded="rounded-lg" surface="base" delay={delayOffset + 0.22} />
          <MotionShimmerBlock className="h-7 w-28" rounded="rounded-lg" surface="gold" delay={delayOffset + 0.25} />
        </div>
        <div className="flex items-center gap-1.5">
          <MotionShimmerBlock className="w-7 h-7" rounded="rounded-lg" surface="base" delay={delayOffset + 0.26} />
          <MotionShimmerBlock className="h-7 w-20" rounded="rounded-lg" surface="pill" delay={delayOffset + 0.28} />
        </div>
      </div>
    </div>
  </div>
);

export const LessonListSkeleton: React.FC<{
  mode?: 'themes_sections' | 'compact_grid';
  cardCount?: number;
}> = ({ mode = 'themes_sections', cardCount = 6 }) => {
  const shouldReduceMotion = useReducedMotion();
  const cVariants = shouldReduceMotion ? reducedContainerVariants : containerVariants;
  const iVariants = shouldReduceMotion ? reducedItemVariants : itemVariants;

  return (
    <motion.div
      variants={cVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-label="Chargement de la liste des leçons"
      className="space-y-4"
    >
      {/* Count summary bar */}
      <motion.div variants={iVariants} className="flex items-center justify-between gap-2">
        <MotionShimmerBlock className="h-4 w-56" surface="base" />
        <MotionShimmerBlock className="h-4 w-44 hidden sm:block" surface="base" delay={0.08} />
      </motion.div>

      {mode === 'compact_grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Array.from({ length: cardCount }).map((_, idx) => (
            <motion.div key={idx} variants={iVariants}>
              <LessonCardSkeleton delayOffset={idx * 0.04} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {[0, 1].map((groupIdx) => (
            <motion.div
              key={groupIdx}
              variants={iVariants}
              className="p-4 sm:p-5 rounded-2xl bg-[#151b2b]/90 border border-[#232a3a] flex flex-col gap-3.5 shadow-md"
            >
              {/* Theme Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#232a3a]">
                <div className="flex items-center gap-2.5">
                  <MotionShimmerBlock className="w-9 h-9 shrink-0" rounded="rounded-xl" surface="gold" delay={groupIdx * 0.1} />
                  <div className="space-y-1.5">
                    <MotionShimmerBlock className="h-4 w-44 sm:w-56" surface="gold" delay={groupIdx * 0.1 + 0.04} />
                    <MotionShimmerBlock className="h-3 w-48" surface="base" delay={groupIdx * 0.1 + 0.08} />
                  </div>
                </div>
                <MotionShimmerBlock className="h-5 w-16" rounded="rounded-full" surface="gold" delay={groupIdx * 0.1 + 0.08} />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {Array.from({ length: Math.max(2, Math.ceil(cardCount / 2)) }).map((_, idx) => (
                  <LessonCardSkeleton key={idx} delayOffset={groupIdx * 0.15 + idx * 0.05} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ============================================================================ */
/* 3. CHART & KPI SECTION SKELETON (D3 Curves, Recharts Mastery & History)      */
/* ============================================================================ */
export const ChartSectionSkeleton: React.FC<{
  heightClass?: string;
  showKpis?: boolean;
  kpiCount?: number;
  variant?: 'curve' | 'bars';
  label?: string;
}> = ({
  heightClass = 'h-[256px]',
  showKpis = false,
  kpiCount = 4,
  variant = 'curve',
  label = 'Chargement des visualisations analytiques'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const cVariants = shouldReduceMotion ? reducedContainerVariants : containerVariants;
  const iVariants = shouldReduceMotion ? reducedItemVariants : itemVariants;

  const barHeights = [38, 52, 46, 68, 58, 76, 64, 84, 72, 92, 82, 96];

  return (
    <motion.div
      variants={cVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-label={label}
      className="space-y-3 w-full"
    >
      {showKpis && (
        <motion.div
          variants={iVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        >
          {Array.from({ length: kpiCount }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1.5"
            >
              <MotionShimmerBlock className="h-2.5 w-24" surface="base" delay={idx * 0.05} />
              <MotionShimmerBlock className="h-5 w-16" surface={idx === 0 ? 'gold' : 'elevated'} delay={idx * 0.07} />
              <MotionShimmerBlock className="h-2.5 w-28" surface="base" delay={idx * 0.09} />
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        variants={iVariants}
        className={`relative w-full ${heightClass} rounded-xl bg-[#070e1d]/75 border border-[#232a3a] p-4 flex flex-col justify-between overflow-hidden`}
      >
        {/* Horizontal dashed reference lines */}
        <div className="flex-1 relative flex flex-col justify-between py-2">
          {[0, 1, 2, 3].map((lineIdx) => (
            <div key={lineIdx} className="flex items-center gap-3">
              <MotionShimmerBlock className="h-2.5 w-8 shrink-0" surface="base" delay={lineIdx * 0.06} />
              <div className="flex-1 border-b border-dashed border-[#232a3a]" />
            </div>
          ))}

          {/* Animated chart silhouette overlay */}
          {variant === 'curve' ? (
            <svg
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
              className="absolute inset-x-10 inset-y-2 w-[calc(100%-2.5rem)] h-[calc(100%-1rem)] opacity-70 pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="skeletonCurveAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#f2ca50" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M0 98 C55 92, 95 72, 145 68 C195 64, 240 42, 295 36 C340 31, 372 18, 400 12 L400 120 L0 120 Z"
                fill="url(#skeletonCurveAreaGrad)"
              />
              <motion.path
                d="M0 98 C55 92, 95 72, 145 68 C195 64, 240 42, 295 36 C340 31, 372 18, 400 12"
                fill="none"
                stroke="#f2ca50"
                strokeOpacity={0.45}
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0.25, opacity: 0.4 }}
                animate={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 1, opacity: [0.4, 0.85, 0.4] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                        pathLength: { duration: 1.2, ease: LUXURY_EASE },
                        opacity: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                      }
                }
              />
              <motion.path
                d="M0 106 C60 102, 110 88, 165 86 C220 84, 265 70, 325 60 C360 54, 382 48, 400 44"
                fill="none"
                stroke="#38bdf8"
                strokeOpacity={0.4}
                strokeWidth="2"
                strokeLinecap="round"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0.2 }}
                animate={{ pathLength: 1 }}
                transition={shouldReduceMotion ? undefined : { duration: 1.35, ease: LUXURY_EASE }}
              />
            </svg>
          ) : (
            <div className="absolute inset-x-10 bottom-2 top-4 flex items-end justify-between gap-2 pointer-events-none">
              {barHeights.map((pct, idx) => (
                <div key={idx} className="flex-1 h-full flex items-end">
                  <MotionShimmerBlock
                    className="w-full"
                    rounded="rounded-t-md"
                    surface={idx % 3 === 0 ? 'gold' : 'elevated'}
                    delay={idx * 0.04}
                  >
                    <div style={{ height: `${Math.round(pct * 1.4)}px` }} />
                  </MotionShimmerBlock>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom X-Axis ticks */}
        <div className="flex items-center justify-between pl-10 pt-2 border-t border-[#232a3a]/70">
          {[0, 1, 2, 3, 4, 5].map((tickIdx) => (
            <MotionShimmerBlock key={tickIdx} className="h-2.5 w-10" surface="base" delay={tickIdx * 0.05} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============================================================================ */
/* 4. TELEMETRY & DICTIONARY SKELETONS                                          */
/* ============================================================================ */
export const TelemetryListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const shouldReduceMotion = useReducedMotion();
  const cVariants = shouldReduceMotion ? reducedContainerVariants : containerVariants;
  const iVariants = shouldReduceMotion ? reducedItemVariants : itemVariants;

  return (
    <motion.div
      variants={cVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-label="Chargement des recommandations adaptatives"
      className="space-y-2"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          variants={iVariants}
          className="p-2.5 rounded-xl bg-[#151b2b] border border-[#2e3545] flex items-center justify-between gap-3"
        >
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MotionShimmerBlock className="h-3 w-16" surface="gold" delay={idx * 0.05} />
              <MotionShimmerBlock className="h-3 w-24" surface="base" delay={idx * 0.08} />
            </div>
            <MotionShimmerBlock className="h-3.5 w-3/4" delay={idx * 0.1} />
          </div>
          <MotionShimmerBlock className="w-5 h-5 shrink-0" rounded="rounded-md" surface="gold" delay={idx * 0.08} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export const DictionaryLookupSkeleton: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const cVariants = shouldReduceMotion ? reducedContainerVariants : containerVariants;
  const iVariants = shouldReduceMotion ? reducedItemVariants : itemVariants;

  return (
    <motion.div
      variants={cVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-label="Recherche lexicale en cours"
      className="space-y-3 py-1"
    >
      <motion.div
        variants={iVariants}
        className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-2.5"
      >
        <MotionShimmerBlock className="h-3 w-24" surface="gold" />
        <MotionShimmerBlock className="h-4 w-4/5" delay={0.05} />
        <MotionShimmerBlock className="h-3 w-full" surface="base" delay={0.1} />
        <div className="flex items-center gap-2 pt-1">
          <MotionShimmerBlock className="h-5 w-16" rounded="rounded-md" surface="pill" delay={0.12} />
          <MotionShimmerBlock className="h-5 w-20" rounded="rounded-md" surface="pill" delay={0.16} />
          <MotionShimmerBlock className="h-5 w-14" rounded="rounded-md" surface="pill" delay={0.2} />
        </div>
      </motion.div>

      <motion.div
        variants={iVariants}
        className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-2"
      >
        <MotionShimmerBlock className="h-3 w-32" surface="gold" delay={0.08} />
        <MotionShimmerBlock className="h-3.5 w-11/12" surface="base" delay={0.14} />
        <MotionShimmerBlock className="h-3 w-3/4" surface="base" delay={0.18} />
      </motion.div>
    </motion.div>
  );
};
