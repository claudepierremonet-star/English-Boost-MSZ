import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MiniGameMeta, ArcadeProgressionState } from '../data/twentyGamesData';

interface StackedGamesShowcaseProps {
  games: MiniGameMeta[];
  isGameUnlocked: (game: MiniGameMeta) => boolean;
  onSelectGame: (game: MiniGameMeta) => void;
  progression: ArcadeProgressionState;
}

export const StackedGamesShowcase: React.FC<StackedGamesShowcaseProps> = ({
  games,
  isGameUnlocked,
  onSelectGame,
  progression
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // When stacked/collapsed, we show 5 preview cards + 1 final card indicating the remaining items
  const STACK_PREVIEW_COUNT = 5;
  const previewGames = games.slice(0, STACK_PREVIEW_COUNT);
  const remainingCount = Math.max(0, games.length - STACK_PREVIEW_COUNT);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="w-full mb-8 select-none">
      {/* Header bar of the Stacked Component */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f2ca50]/20 border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
            <span className="material-symbols-outlined text-base">
              {isExpanded ? 'style' : 'layers'}
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#f3f4f6] flex items-center gap-2">
              <span>Deck Superposé des Jeux</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30 font-bold">
                {games.length} JEUX
              </span>
            </h3>
            <p className="text-[11px] text-[#94a3b8] font-mono hidden sm:block">
              {isExpanded
                ? 'Éventail déployé • Cliquez pour replier en superposition'
                : 'Chevauchement sur 1/3 de la largeur • Cliquez pour déployer en éventail'}
            </p>
          </div>
        </div>

        {/* Interactive toggle button */}
        <button
          type="button"
          onClick={toggleExpand}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border ${
            isExpanded
              ? 'bg-[#1e273a] text-[#f2ca50] border-[#f2ca50]/50 hover:bg-[#25324b]'
              : 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#2c1e00] border-[#f2ca50] hover:from-[#ffe082] hover:to-[#f2ca50]'
          }`}
          title={isExpanded ? 'Replier en superposition' : 'Déployer en éventail'}
        >
          <span className="material-symbols-outlined text-sm font-bold">
            {isExpanded ? 'compress' : 'unfold_more'}
          </span>
          <span>{isExpanded ? 'Empiler (Chevauchement 1/3)' : 'Déployer en Éventail'}</span>
        </button>
      </div>

      {/* Main Container: Clickable to toggle between Stacked and Fanned-out */}
      <div className="relative rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-[#131b2e]/90 via-[#0e1526]/95 to-[#090d18] border border-[#f2ca50]/30 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#f2ca50] to-transparent opacity-60 shadow-[0_0_15px_#f2ca50]" />

        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* ==============================================================
               1. MODE SUPERPOSÉ (STACKED) : CHEVAUCHEMENT SUR 1/3 DE LA LARGEUR
               Le dernier élément indique le nombre d'éléments restants (+16)
               ============================================================== */
            <motion.div
              key="stacked-mode"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={toggleExpand}
              className="cursor-pointer group py-2"
              title="Cliquez pour déployer en éventail les 21 jeux"
            >
              {/* Stack Prompt Pill */}
              <div className="flex items-center justify-between mb-4 text-xs font-mono">
                <span className="text-[#dce2f8] flex items-center gap-1.5 group-hover:text-[#f2ca50] transition-colors">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50] animate-pulse">
                    touch_app
                  </span>
                  <span>Cliquez sur le deck pour déployer en éventail</span>
                </span>
                <span className="text-[11px] text-[#94a3b8] group-hover:text-[#f2ca50] transition-colors flex items-center gap-1 font-bold">
                  <span>Voir tous les 21 jeux</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {/* Stacked Cards Strip (Horizontal Overlap of 1/3 width) */}
              <div className="relative flex items-center justify-start overflow-x-auto pb-4 pt-2 no-scrollbar px-2 sm:px-4">
                <div className="flex items-center">
                  {previewGames.map((game, index) => {
                    const unlocked = isGameUnlocked(game);
                    const isCompleted = progression.completedGames.includes(game.id);

                    return (
                      <motion.div
                        key={game.id}
                        initial={false}
                        whileHover={{
                          y: -14,
                          scale: 1.05,
                          zIndex: 40,
                          transition: { duration: 0.2 }
                        }}
                        style={{
                          zIndex: index + 1,
                          // Le chevauchement sur un tiers de la largeur :
                          // Première carte sans marge négative, cartes suivantes avec -ml-[33.33%] de la largeur de carte (~65px sur 195px)
                          marginLeft: index === 0 ? 0 : '-65px'
                        }}
                        className={`relative w-[190px] sm:w-[210px] h-[220px] rounded-2xl p-4 flex flex-col justify-between shrink-0 shadow-[-8px_4px_24px_rgba(0,0,0,0.65),0_0_12px_rgba(0,0,0,0.4)] border transition-all duration-300 ${
                          unlocked
                            ? `bg-gradient-to-b ${game.bgGradient} ${game.borderColor}`
                            : 'bg-[#10141f] border-stone-800'
                        } group-hover:border-[#f2ca50]/70`}
                      >
                        {/* 1/3 Overlap Guide Line Highlight on left border */}
                        {index > 0 && (
                          <div className="absolute top-2 bottom-2 left-0 w-[1.5px] bg-[#f2ca50]/30 pointer-events-none" />
                        )}

                        {/* Top Card Badge: Number & Status */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-[#0c1322]/80 border border-white/10 text-[10px] font-mono font-bold text-[#f2ca50]">
                            #{game.number.toString().padStart(2, '0')}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              unlocked
                                ? isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {unlocked ? (isCompleted ? 'Validé ✓' : 'Prêt') : '🔒 Verrouillé'}
                          </span>
                        </div>

                        {/* Center Icon & Name Preview */}
                        <div className="my-auto text-center flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner mb-2 ${
                              unlocked
                                ? 'bg-[#0c1322]/80 text-[#f2ca50] border border-[#f2ca50]/40'
                                : 'bg-stone-900 text-stone-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-2xl">
                              {unlocked ? game.icon : 'lock'}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#dce2f8] line-clamp-1">
                            {game.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#94a3b8] line-clamp-1 mt-0.5">
                            {game.category}
                          </span>
                        </div>

                        {/* Bottom Tag */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#cbd5e1]">
                          <span>{game.difficulty}</span>
                          <span className="text-[#f2ca50] font-bold">+{game.xpReward} XP</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* ==========================================================
                      DERNIER ÉLÉMENT : INDIQUE LE NOMBRE D'ÉLÉMENTS RESTANTS (+16)
                      ========================================================== */}
                  <motion.div
                    whileHover={{
                      y: -14,
                      scale: 1.06,
                      zIndex: 50,
                      transition: { duration: 0.2 }
                    }}
                    style={{
                      zIndex: STACK_PREVIEW_COUNT + 1,
                      marginLeft: '-65px' // Chevauchement sur 1/3 de la largeur
                    }}
                    className="relative w-[190px] sm:w-[210px] h-[220px] rounded-2xl p-4 flex flex-col justify-between shrink-0 shadow-[-10px_6px_30px_rgba(242,202,80,0.35),0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#f2ca50] bg-gradient-to-br from-[#2a2212] via-[#1c180e] to-[#0c1322] group-hover:shadow-[0_0_25px_rgba(242,202,80,0.5)] transition-all"
                  >
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#f2ca50] text-[#2c1d00] text-[10px] font-mono font-black">
                        SUITE DU DECK
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-ping" />
                    </div>

                    {/* Grand Compteur d'Éléments Restants (+16 RESTANTS) */}
                    <div className="my-auto text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#f2ca50]/20 border border-[#f2ca50]/60 flex items-center justify-center text-[#f2ca50] shadow-inner mb-2 group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-3xl font-black">
                          unfold_more
                        </span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-serif font-black text-[#f2ca50] tracking-tight drop-shadow-[0_2px_10px_rgba(242,202,80,0.4)]">
                        +{remainingCount}
                      </span>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ffe082]">
                        Jeux Restants
                      </span>
                      <span className="text-[9px] text-[#cbd5e1] font-mono mt-0.5">
                        (21 jeux au total)
                      </span>
                    </div>

                    {/* Action Prompt */}
                    <div className="pt-2 border-t border-[#f2ca50]/40 flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-[#f2ca50] uppercase tracking-wider">
                      <span>Déployer l'Éventail</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==============================================================
               2. MODE DÉPLOYÉ EN ÉVENTAIL : RÉVÉLATION COMPLÈTE DES 21 JEUX
               Déploiement en éventail révélant les noms, icônes et actions
               ============================================================== */
            <motion.div
              key="fanned-mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="py-2"
            >
              {/* Header prompt inside fanned view */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 p-3 rounded-2xl bg-[#151f33] border border-[#f2ca50]/40">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎴</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-serif font-bold text-white">
                      Éventail Complet Déployé • 21 Jeux d'Arcade
                    </span>
                    <span className="text-[11px] text-[#cbd5e1] font-mono">
                      Cliquez sur n'importe quel jeu pour le lancer immédiatement, ou repliez le deck.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleExpand}
                  className="px-3 py-1.5 rounded-xl bg-[#232f48] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm font-bold">compress</span>
                  <span>Replier en Superposition (1/3)</span>
                </button>
              </div>

              {/* Fanned-out Grid / Cards Array of all 21 games */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {games.map((game, idx) => {
                  const unlocked = isGameUnlocked(game);
                  const isCompleted = progression.completedGames.includes(game.id);

                  // Calculate a subtle fan rotation angle for visual beauty
                  const fanAngle = Math.max(-6, Math.min(6, (idx - 10) * 0.6));

                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 18, rotate: fanAngle }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.3 }}
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        boxShadow: '0 15px 30px -5px rgba(242, 202, 80, 0.25)'
                      }}
                      onMouseEnter={() => setHoveredCardId(game.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      onClick={() => onSelectGame(game)}
                      className={`relative rounded-2xl p-4 flex flex-col justify-between border transition-all cursor-pointer overflow-hidden ${
                        unlocked
                          ? `bg-gradient-to-b ${game.bgGradient} ${game.borderColor} hover:border-[#f2ca50]`
                          : 'bg-[#10141f] border-stone-800 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Top Bar: Number & Category Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#0c1322]/85 border border-white/10 text-[10px] font-mono font-bold text-[#f2ca50]">
                          JEU #{game.number.toString().padStart(2, '0')}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${game.badgeColor}`}
                        >
                          {game.category}
                        </span>
                      </div>

                      {/* Icon & Full Game Title */}
                      <div className="my-2 flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner ${
                            unlocked
                              ? 'bg-[#0c1322] text-[#f2ca50] border border-[#f2ca50]/40'
                              : 'bg-stone-900 text-stone-500 border border-stone-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {unlocked ? game.icon : 'lock'}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#f3f4f6] line-clamp-1">
                            {game.title}
                          </h4>
                          <span className="text-[10px] text-[#cbd5e1] line-clamp-1">
                            {game.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Difficulty, Level & Reward */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#94a3b8]">{game.difficulty}</span>
                        <div className="flex items-center gap-1.5">
                          {isCompleted && (
                            <span className="text-emerald-400 font-bold">✓ Fait</span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-[#f2ca50]/15 text-[#f2ca50] font-bold">
                            +{game.xpReward} XP
                          </span>
                        </div>
                      </div>

                      {/* Action Prompt */}
                      <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-[#f2ca50]">
                        <span>{unlocked ? 'Lancer la partie' : 'Niveau requis'}</span>
                        <span className="material-symbols-outlined text-xs">
                          {unlocked ? 'play_arrow' : 'lock'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Collapse Button */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={toggleExpand}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#192338] via-[#202c46] to-[#192338] hover:border-[#f2ca50] text-[#dce2f8] hover:text-[#f2ca50] border border-[#384869] text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">compress</span>
                  <span>Replier le deck (Chevauchement sur un tiers de largeur)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
