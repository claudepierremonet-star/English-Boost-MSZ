import React, { useMemo, useState } from 'react';
import type { UserProfile, LearningAttempt, AcademicBadge } from '../firebase/types';
import { computeUserBadges, BADGE_TIER_STYLES } from '../data/badges';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BadgeUnlockModal } from './BadgeUnlockModal';
import { useAppTheme } from '../theme/ThemeContext';

interface BadgesSectionProps {
  user: UserProfile;
  attempts?: LearningAttempt[];
  onBadgeClaimed?: (badge: AcademicBadge) => void;
}

type FilterType = 'all' | 'distinction' | 'unlocked' | 'xp' | 'streak' | 'other';

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  user,
  attempts = [],
  onBadgeClaimed
}) => {
  const { isDark } = useAppTheme();
  const shouldReduceMotion = useReducedMotion();

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBadge, setSelectedBadge] = useState<AcademicBadge | null>(null);
  const [celebrationBadge, setCelebrationBadge] = useState<AcademicBadge | null>(null);
  const [claimedBadgeIds, setClaimedBadgeIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eb_msz_claimed_badges') || '[]');
    } catch {
      return [];
    }
  });

  const badges = useMemo(() => computeUserBadges(user, attempts), [user, attempts]);
  const unlockedCount = useMemo(() => badges.filter((b) => b.isUnlocked).length, [badges]);
  const totalBonusXp = useMemo(
    () => badges.filter((b) => b.isUnlocked).reduce((sum, b) => sum + b.xpReward, 0),
    [badges]
  );

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (filter === 'distinction') return b.category === 'distinction';
      if (filter === 'unlocked') return b.isUnlocked;
      if (filter === 'xp') return b.category === 'xp';
      if (filter === 'streak') return b.category === 'streak';
      if (filter === 'other') return b.category !== 'xp' && b.category !== 'streak' && b.category !== 'distinction';
      return true;
    });
  }, [badges, filter]);

  const progressRatio = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

  const handleBadgeClick = (badge: AcademicBadge) => {
    setSelectedBadge(badge);
    if (badge.isUnlocked && !shouldReduceMotion) {
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti error in headless/non-canvas environments
      }
    }
  };

  const handleTriggerCelebration = (badge: AcademicBadge) => {
    setSelectedBadge(null);
    setCelebrationBadge(badge);
  };

  return (
    <section
      aria-label="Distinctions et Badges d'Honneur"
      className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-4 select-none"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl luxury-btn-amber-soft flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">military_tech</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-serif text-base sm:text-lg font-bold ${isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}`}>
                Distinctions &amp; Badges d&apos;Honneur
              </h3>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className={`text-[11px] font-mono font-bold tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
                {unlockedCount} / {badges.length} débloqués
              </span>
            </div>
            <p className={`text-xs italic font-serif ${isDark ? 'text-[#d0c5af]/85' : 'text-[#57534e]'}`}>
              Insignia &amp; Merita Philologica · Médailles d&apos;érudition
            </p>
          </div>
        </div>

        {/* Top Action & Total Bonus XP */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          {badges.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const bestBadge =
                  badges.find((b) => b.id === 'polyglotte_matin') ||
                  badges.find((b) => b.id === 'serie_ininterrompue') ||
                  badges[0];
                if (bestBadge) setCelebrationBadge(bestBadge);
              }}
              className="px-3 py-1.5 rounded-xl luxury-btn-surface text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
              title="Tester l'animation sonore et visuelle de déblocage"
            >
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">celebration</span>
              <span>Célébrer</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl luxury-hairline-panel">
            <span className="material-symbols-outlined text-[#f2ca50] text-sm">workspace_premium</span>
            <span className={`text-xs font-mono font-bold tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
              +{totalBonusXp.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* OVERALL PROGRESS GAUGE */}
      <div className="w-full luxury-hairline-panel p-3.5 rounded-xl flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className={isDark ? 'text-[#d0c5af]' : 'text-[#57534e]'}>
            Progression dans l&apos;Ordre des Distinctions
          </span>
          <span className={`font-bold tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
            {progressRatio}%
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#0c1322]' : 'bg-[#e7dfd1]'}`}>
          <motion.div
            initial={shouldReduceMotion ? false : { width: 0 }}
            animate={{ width: `${progressRatio}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffd875] rounded-full"
          />
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1" role="tablist" aria-label="Filtrer les badges">
        {[
          { id: 'all', label: `Tous (${badges.length})` },
          { id: 'distinction', label: `Distinctions (${badges.filter((b) => b.category === 'distinction').length})` },
          { id: 'unlocked', label: `Débloqués (${unlockedCount})` },
          { id: 'xp', label: 'Paliers XP' },
          { id: 'streak', label: 'Séries' },
          { id: 'other', label: 'Épreuves' }
        ].map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id as FilterType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                active
                  ? 'luxury-btn-gold font-bold'
                  : 'luxury-btn-surface'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* BADGES GRID */}
      {filteredBadges.length === 0 ? (
        <div className="p-6 rounded-xl luxury-hairline-panel text-center text-xs text-[#99907c] font-mono">
          Aucune distinction ne correspond à ce filtre pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {filteredBadges.map((badge) => {
            const style = BADGE_TIER_STYLES[badge.tier];
            const pct = Math.min(100, Math.round((badge.currentProgress / Math.max(1, badge.requiredTarget)) * 100));

            return (
              <motion.div
                key={badge.id}
                role="button"
                tabIndex={0}
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                onClick={() => handleBadgeClick(badge)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBadgeClick(badge);
                  }
                }}
                aria-label={`${badge.title} — ${badge.isUnlocked ? 'Acquis' : `${pct}%`}`}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  badge.isUnlocked
                    ? isDark
                      ? `${style.bg} ${style.border} shadow-md`
                      : `luxury-hairline-panel ${style.border} shadow-sm`
                    : isDark
                    ? 'bg-[#121929]/80 border-[#232a3a] opacity-80 hover:opacity-100 hover:border-[#f2ca50]/35'
                    : 'luxury-hairline-panel opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
                        badge.isUnlocked
                          ? 'luxury-btn-amber-soft'
                          : 'luxury-hairline-panel text-[#99907c]'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: badge.isUnlocked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {badge.icon}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={`text-[10px] font-serif italic truncate ${isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'}`}>
                        {badge.latinTitle}
                      </span>
                      <h4 className={`font-serif font-bold text-sm truncate ${isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}`}>
                        {badge.title}
                      </h4>
                      <span className={`text-[10px] font-mono font-bold uppercase ${isDark ? style.text : 'text-[#785b24]'}`}>
                        Palier {style.label}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator (Dual-coded text + icon) */}
                  <div className="shrink-0">
                    {badge.isUnlocked ? (
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isDark
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-600/35 text-emerald-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        <span className="hidden sm:inline">Acquis</span>
                      </span>
                    ) : (
                      <span className={`text-[11px] font-mono font-bold tabular-nums ${isDark ? 'text-[#99907c]' : 'text-[#57534e]'}`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>

                <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-[#d0c5af]/85' : 'text-[#57534e]'}`}>
                  {badge.description}
                </p>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1">
                  <div className={`flex items-center justify-between text-[10px] font-mono ${isDark ? 'text-[#99907c]' : 'text-[#57534e]'}`}>
                    <span>{badge.requirementLabel}</span>
                    <span className="tabular-nums">
                      {badge.currentProgress.toLocaleString()} / {badge.requiredTarget.toLocaleString()}
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#0c1322]' : 'bg-[#e7dfd1]'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.isUnlocked ? 'bg-[#f2ca50]' : 'bg-[#99907c]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Reward Ribbon & Quick Celebrate */}
                <div className={`flex items-center justify-between text-[10px] font-mono border-t pt-2 mt-0.5 ${isDark ? 'text-[#d4c78f] border-[#232a3a]/70' : 'text-[#785b24] border-[#e2d9cc]'}`}>
                  <span>Récompense</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
                      +{badge.xpReward} XP
                    </span>
                    {badge.isUnlocked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerCelebration(badge);
                        }}
                        className="px-2 py-0.5 rounded-md luxury-btn-amber-soft text-[10px] font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                        title="Afficher l'animation de déblocage"
                      >
                        Célébrer
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BADGE DETAIL MODAL */}
      <AnimatePresence>
        {selectedBadge && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Détail du badge ${selectedBadge.title}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl p-6 luxury-card-surface shadow-2xl flex flex-col gap-4 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl luxury-btn-amber-soft flex items-center justify-center shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-3xl">
                      {selectedBadge.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs font-serif italic block truncate ${isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'}`}>
                      {selectedBadge.latinTitle}
                    </span>
                    <h3 className={`font-serif font-bold text-lg sm:text-xl ${isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}`}>
                      {selectedBadge.title}
                    </h3>
                    <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isDark ? BADGE_TIER_STYLES[selectedBadge.tier].text : 'text-[#785b24]'}`}>
                      Palier {BADGE_TIER_STYLES[selectedBadge.tier].label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  aria-label="Fermer la fenêtre du badge"
                  className="w-8 h-8 rounded-full luxury-btn-surface flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#dce2f8]' : 'text-[#44403c]'}`}>
                {selectedBadge.description}
              </p>

              {/* Progress Breakdown */}
              <div className="p-3.5 rounded-xl luxury-hairline-panel flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isDark ? 'text-[#d0c5af]' : 'text-[#57534e]'}>{selectedBadge.requirementLabel}</span>
                  <span className={`font-bold tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
                    {selectedBadge.currentProgress.toLocaleString()} / {selectedBadge.requiredTarget.toLocaleString()}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#151b2b]' : 'bg-[#e7dfd1]'}`}>
                  <div
                    className="h-full bg-[#f2ca50] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((selectedBadge.currentProgress / Math.max(1, selectedBadge.requiredTarget)) * 100)
                      )}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c] pt-1">
                  <span>
                    État :{' '}
                    <strong className={selectedBadge.isUnlocked ? 'text-emerald-400' : isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}>
                      {selectedBadge.isUnlocked ? 'Distinction Décernée' : 'Défi en cours'}
                    </strong>
                  </span>
                  <span className={`font-bold tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
                    +{selectedBadge.xpReward} XP
                  </span>
                </div>
              </div>

              {selectedBadge.isUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleTriggerCelebration(selectedBadge)}
                  className="w-full py-3 rounded-xl luxury-btn-gold font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
                >
                  <span className="material-symbols-outlined text-sm">celebration</span>
                  <span>Voir l&apos;Animation de Déblocage</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-2.5 rounded-xl luxury-btn-surface font-bold text-xs uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                >
                  Poursuivre l&apos;Apprentissage
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GRAND UNLOCK ANIMATION CELEBRATION MODAL */}
      <BadgeUnlockModal
        badge={celebrationBadge}
        isOpen={celebrationBadge !== null}
        onClose={() => setCelebrationBadge(null)}
        alreadyClaimed={celebrationBadge ? claimedBadgeIds.includes(celebrationBadge.id) : false}
        onClaimReward={(b) => {
          if (!b.isUnlocked || claimedBadgeIds.includes(b.id)) return;
          const next = [...claimedBadgeIds, b.id];
          setClaimedBadgeIds(next);
          try {
            localStorage.setItem('eb_msz_claimed_badges', JSON.stringify(next));
          } catch {}
          if (onBadgeClaimed) onBadgeClaimed(b);
        }}
      />
    </section>
  );
};
