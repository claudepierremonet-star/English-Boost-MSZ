import React, { useState } from 'react';
import type { UserProfile, LearningAttempt, AcademicBadge } from '../firebase/types';
import { computeUserBadges, BADGE_TIER_STYLES } from '../data/badges';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeUnlockModal } from './BadgeUnlockModal';

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
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBadge, setSelectedBadge] = useState<AcademicBadge | null>(null);
  const [celebrationBadge, setCelebrationBadge] = useState<AcademicBadge | null>(null);

  const badges = computeUserBadges(user, attempts);
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalBonusXp = badges
    .filter((b) => b.isUnlocked)
    .reduce((sum, b) => sum + b.xpReward, 0);

  const filteredBadges = badges.filter((b) => {
    if (filter === 'distinction') return b.category === 'distinction';
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'xp') return b.category === 'xp';
    if (filter === 'streak') return b.category === 'streak';
    if (filter === 'other') return b.category !== 'xp' && b.category !== 'streak' && b.category !== 'distinction';
    return true;
  });

  const handleBadgeClick = (badge: AcademicBadge) => {
    setSelectedBadge(badge);
    if (badge.isUnlocked) {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.6 }
      });
    }
  };

  const handleTriggerCelebration = (badge: AcademicBadge) => {
    setSelectedBadge(null);
    setCelebrationBadge(badge);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-4 select-none">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/30 to-[#f2ca50]/10 border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-md shrink-0">
            <span className="material-symbols-outlined text-xl">military_tech</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#dce2f8]">
                Distinctions & Badges d'Honneur
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/30 text-[10px] font-mono font-bold text-[#f2ca50]">
                {unlockedCount} / {badges.length} DÉBLOQUÉS
              </span>
            </div>
            <p className="text-xs text-[#d0c5af]/80 italic font-serif">
              Insignia & Merita Philologica • Récompenses et Médailles d'Érudition
            </p>
          </div>
        </div>

        {/* Top Action & Total Bonus XP Pill */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          {/* Quick Demo Celebration Trigger Button */}
          <button
            type="button"
            onClick={() => {
              const bestBadge =
                badges.find((b) => b.id === 'polyglotte_matin') ||
                badges.find((b) => b.id === 'serie_ininterrompue') ||
                badges[0];
              setCelebrationBadge(bestBadge);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] border border-[#f2ca50]/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Tester l'animation sonore et visuelle de déblocage"
          >
            <span>✨</span>
            <span>Célébrer une Distinction</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30">
            <span className="material-symbols-outlined text-[#f2ca50] text-sm">workspace_premium</span>
            <span className="text-xs font-mono font-bold text-[#f2ca50]">
              +{totalBonusXp.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* OVERALL PROGRESS GAUGE */}
      <div className="w-full bg-[#0c1322] p-3 rounded-xl border border-[#232a3a] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#d0c5af]">Progression dans l'Ordre des Distinctions</span>
          <span className="text-[#f2ca50] font-bold">
            {Math.round((unlockedCount / badges.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#151b2b] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffd875] rounded-full"
          />
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
        {[
          { id: 'all', label: `Tous (${badges.length})` },
          { id: 'distinction', label: `Distinctions (${badges.filter((b) => b.category === 'distinction').length})` },
          { id: 'unlocked', label: `Débloqués (${unlockedCount})` },
          { id: 'xp', label: 'Paliers XP' },
          { id: 'streak', label: 'Séries' },
          { id: 'other', label: 'Épreuves' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as FilterType)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                : 'bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] border border-[#4d4635]/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {filteredBadges.map((badge) => {
          const style = BADGE_TIER_STYLES[badge.tier];
          const pct = Math.min(100, Math.round((badge.currentProgress / badge.requiredTarget) * 100));

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -2 }}
              onClick={() => handleBadgeClick(badge)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 shadow-md ${
                badge.isUnlocked
                  ? `${style.bg} ${style.border} ${style.glow}`
                  : 'bg-[#151b2b]/70 border-[#232a3a] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${
                      badge.isUnlocked
                        ? `${style.badgeBg} ${style.border} text-[#f2ca50]`
                        : 'bg-[#0c1322] border-[#232a3a] text-[#99907c]'
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
                    <span className="text-[10px] font-serif italic text-[#d4c78f] truncate">
                      {badge.latinTitle}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#dce2f8] truncate">
                      {badge.title}
                    </h4>
                    <span className={`text-[10px] font-mono font-bold uppercase ${style.text}`}>
                      Palier {style.label}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="shrink-0">
                  {badge.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span className="hidden sm:inline">Acquis</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#0c1322] border border-[#232a3a] text-[10px] font-mono text-[#99907c]">
                      {pct}%
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#d0c5af]/85 line-clamp-2 leading-relaxed">
                {badge.description}
              </p>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#99907c]">
                  <span>{badge.requirementLabel}</span>
                  <span>
                    {badge.currentProgress.toLocaleString()} / {badge.requiredTarget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#0c1322] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.isUnlocked ? 'bg-[#f2ca50]' : 'bg-[#99907c]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Reward Ribbon & Quick Celebrate */}
              <div className="flex items-center justify-between text-[10px] text-[#d4c78f] font-mono border-t border-[#232a3a]/70 pt-2 mt-0.5">
                <span>Distinction :</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#f2ca50]">+{badge.xpReward} XP</span>
                  {badge.isUnlocked && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerCelebration(badge);
                      }}
                      className="px-1.5 py-0.2 rounded bg-[#f2ca50]/20 hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] text-[9px] font-bold transition-colors cursor-pointer"
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

      {/* BADGE DETAIL MODAL */}
      <AnimatePresence>
        {selectedBadge && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl flex flex-col gap-4 relative overflow-hidden ${
                BADGE_TIER_STYLES[selectedBadge.tier].bg
              } ${BADGE_TIER_STYLES[selectedBadge.tier].border}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#0c1322] border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-xl">
                    <span className="material-symbols-outlined text-3xl">
                      {selectedBadge.icon}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-serif italic text-[#d4c78f]">
                      {selectedBadge.latinTitle}
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#dce2f8]">
                      {selectedBadge.title}
                    </h3>
                    <span
                      className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                        BADGE_TIER_STYLES[selectedBadge.tier].text
                      }`}
                    >
                      Palier {BADGE_TIER_STYLES[selectedBadge.tier].label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="w-8 h-8 rounded-full bg-[#0c1322] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#dce2f8] leading-relaxed">
                {selectedBadge.description}
              </p>

              {/* Progress Breakdown */}
              <div className="p-3.5 rounded-xl bg-[#0c1322]/90 border border-[#232a3a] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#d0c5af]">{selectedBadge.requirementLabel}</span>
                  <span className="text-[#f2ca50] font-bold">
                    {selectedBadge.currentProgress.toLocaleString()} /{' '}
                    {selectedBadge.requiredTarget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#151b2b] overflow-hidden">
                  <div
                    className="h-full bg-[#f2ca50] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((selectedBadge.currentProgress / selectedBadge.requiredTarget) * 100)
                      )}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c] pt-1">
                  <span>
                    État :{' '}
                    <strong
                      className={selectedBadge.isUnlocked ? 'text-emerald-400' : 'text-[#f2ca50]'}
                    >
                      {selectedBadge.isUnlocked ? 'Distinction Décernée' : 'Défi en cours'}
                    </strong>
                  </span>
                  <span className="text-[#f2ca50]">+{selectedBadge.xpReward} XP</span>
                </div>
              </div>

              {selectedBadge.isUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleTriggerCelebration(selectedBadge)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffd875] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">celebration</span>
                  Voir l'Animation de Déblocage
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-2.5 rounded-xl bg-[#232a3a] text-[#dce2f8] font-bold text-xs uppercase tracking-wider hover:bg-[#2e3545] cursor-pointer"
                >
                  Poursuivre l'Apprentissage
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
        onClaimReward={(b) => {
          if (onBadgeClaimed) onBadgeClaimed(b);
        }}
      />
    </div>
  );
};
