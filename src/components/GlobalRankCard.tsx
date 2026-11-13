import React, { useMemo } from 'react';

interface GlobalRankCardProps {
  totalXp: number;
  weeklyXp?: number;
  onNavigateLeaderboard?: () => void;
}

export const GlobalRankCard: React.FC<GlobalRankCardProps> = ({
  totalXp,
  weeklyXp = 2450,
  onNavigateLeaderboard
}) => {
  // 100 XP Milestone Calculations
  const {
    currentStep,
    nextMilestoneXp,
    remainingToMilestone,
    progressPercent,
    currentMilestoneFloor,
    milestoneLevel
  } = useMemo(() => {
    const step = totalXp % 100;
    const floor = Math.floor(totalXp / 100) * 100;
    const next = floor + 100;
    const remaining = 100 - step;
    const percent = Math.min(100, Math.max(0, step));
    const level = Math.floor(totalXp / 100) + 1;

    return {
      currentStep: step,
      nextMilestoneXp: next,
      remainingToMilestone: remaining,
      progressPercent: percent,
      currentMilestoneFloor: floor,
      milestoneLevel: level
    };
  }, [totalXp]);

  // Global rank estimation based on totalXp
  const rankInfo = useMemo(() => {
    if (totalXp >= 10000) return { rank: '#3', league: 'Ligue Souveraine Oxford', tier: 'Top 0.5%' };
    if (totalXp >= 5000) return { rank: '#7', league: 'Ligue Diamant Chesterfield', tier: 'Top 1%' };
    if (totalXp >= 4000) return { rank: '#12', league: 'Ligue d’Oxford Élite', tier: 'Top 2%' };
    if (totalXp >= 2500) return { rank: '#24', league: 'Ligue Platine Cambridge', tier: 'Top 5%' };
    if (totalXp >= 1000) return { rank: '#58', league: 'Ligue Or Académique', tier: 'Top 10%' };
    return { rank: '#142', league: 'Ligue Argent Initiation', tier: 'Top 25%' };
  }, [totalXp]);

  return (
    <section className="px-4 sm:px-6 pt-3 pb-2 animate-fadeIn" aria-label="Carte Global Rank">
      <div className="rounded-2xl bg-gradient-to-r from-[#141d2d] via-[#101726] to-[#0c121e] border border-[#d4af37]/45 p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle Ambient Gold Radial Lighting */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ffd700]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 relative z-10">
          <div className="flex items-center gap-3">
            {/* Global Rank Medallion */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffd700]/25 via-[#f59e0b]/15 to-[#d97706]/10 border border-[#ffd700]/50 flex items-center justify-center shadow-[0_0_18px_rgba(255,215,0,0.3)] shrink-0">
              <span
                className="material-symbols-outlined text-2xl text-[#ffd700]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                public
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#ffd700]">
                  GLOBAL RANK • RANG MONDIAL
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] text-[9px] font-mono font-bold">
                  {rankInfo.tier}
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2 leading-tight">
                <span>{rankInfo.rank} Mondial</span>
                <span className="text-xs font-mono font-normal text-[#94a3b8] hidden sm:inline">
                  • {rankInfo.league}
                </span>
              </h3>
            </div>
          </div>

          {/* Cumulative Total XP Counter Badge */}
          <div className="flex items-center gap-2.5 bg-[#080e1a]/90 border border-[#d4af37]/30 px-3.5 py-1.5 rounded-xl shadow-inner self-start sm:self-auto">
            <div className="w-7 h-7 rounded-lg bg-[#ffd700]/15 border border-[#ffd700]/30 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-base text-[#ffd700]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-mono text-[#d4c78f] uppercase tracking-wider font-semibold">
                Total XP Cumulé
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-lg sm:text-xl font-mono font-black text-white leading-none">
                  {totalXp.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#ffd700]">XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* 100 XP Milestone Progress Gauge */}
        <div className="space-y-1.5 relative z-10 pt-1">
          <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-1">
            <span className="text-[#cbd5e1] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-[#ffd700]">flag</span>
              <span>
                Palier {currentMilestoneFloor.toLocaleString()} XP ➔ <strong className="text-white">{nextMilestoneXp.toLocaleString()} XP</strong>
              </span>
            </span>

            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-[#ffd700] font-bold">+{currentStep} / 100 XP</span>
              <span className="text-[#64748b]">•</span>
              <span className="text-[#38bdf8] font-semibold">
                Plus que {remainingToMilestone} XP
              </span>
            </div>
          </div>

          {/* Progress Bar with Shimmer Effect */}
          <div className="w-full h-3 rounded-full bg-[#1b2537] p-0.5 border border-[#2b3a53] overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#38bdf8] via-[#eab308] to-[#ffd700] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(255,215,0,0.5)] relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer light reflection */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Quick Link to Leaderboard */}
        <div className="mt-3 pt-2.5 border-t border-[#222d42] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#8ca1be] relative z-10">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
            <span>
              Palier #{milestoneLevel} • Prochain bonus à <strong className="text-white">{nextMilestoneXp} XP</strong> (+15 MSZ Coins)
            </span>
          </div>

          {onNavigateLeaderboard && (
            <button
              type="button"
              onClick={onNavigateLeaderboard}
              className="inline-flex items-center gap-1 text-[#ffd700] hover:text-[#ffe088] font-semibold transition-colors cursor-pointer"
            >
              <span>Voir le classement complet</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
