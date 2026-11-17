import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MAX_CITY_LEVEL,
  getDistrictForLevel,
  getDistrictSectors,
  type CityLevelBlock50,
  type CityLevelNode,
  type CityLevelSector
} from '../data/cityMapData';

export type LevelGroupStatusFilter = 'all' | 'unlocked' | 'conquered';

export interface CollapsibleLevelGroupProps {
  block: CityLevelBlock50;
  isExpanded: boolean;
  onToggle: () => void;
  unlockedLevel: number;
  conqueredSet: Set<number>;
  completedChaptersByLevel: Record<string, number[]>;
  onSelectLevel: (level: CityLevelNode) => void;
  onPlayLevelDirect?: (level: CityLevelNode) => void;
  onSelectSector?: (sector: CityLevelSector) => void;
  activeViewingSectorId?: string;
}

/**
 * Groupe pliable/dépliable d'une plage de 50 niveaux (1–50, 51–100, ..., 551–600).
 * Intègre un sous-découpage optionnel par tranches de 10 niveaux et filtre d'état
 * pour éviter toute surcharge visuelle sur mobile comme sur ordinateur.
 */
export const CollapsibleLevelGroup: React.FC<CollapsibleLevelGroupProps> = ({
  block,
  isExpanded,
  onToggle,
  unlockedLevel,
  conqueredSet,
  completedChaptersByLevel,
  onSelectLevel,
  onPlayLevelDirect,
  onSelectSector,
  activeViewingSectorId
}) => {
  const [subDecadeIdx, setSubDecadeIdx] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LevelGroupStatusFilter>('all');

  const isCurrentRange = unlockedLevel >= block.startLevel && unlockedLevel <= block.endLevel;
  const isRangeUnlocked = unlockedLevel >= block.startLevel;

  const conqueredCount = useMemo(
    () =>
      block.levels.filter(
        (l) =>
          conqueredSet.has(l.levelNumber) ||
          (completedChaptersByLevel[String(l.levelNumber)] || []).length >= 10
      ).length,
    [block.levels, conqueredSet, completedChaptersByLevel]
  );

  const isFullyConquered = conqueredCount === block.levels.length;
  const progressPct = Math.round((conqueredCount / block.levels.length) * 100);

  // Overlapping cartographic sectors inside this 50-level block
  const subSectors = useMemo(() => {
    const seen = new Set<string>();
    const list: CityLevelSector[] = [];
    for (const lvl of block.levels) {
      const dist = getDistrictForLevel(lvl.levelNumber);
      for (const sec of getDistrictSectors(dist)) {
        if (
          sec.endLevel >= block.startLevel &&
          sec.startLevel <= block.endLevel &&
          !seen.has(sec.id)
        ) {
          seen.add(sec.id);
          list.push(sec);
        }
      }
    }
    return list;
  }, [block.levels, block.startLevel, block.endLevel]);

  // 5 sub-decades inside the 50 levels (e.g. 1-10, 11-20, 21-30, 31-40, 41-50)
  const subDecades = useMemo(() => {
    const slices: Array<{ index: number; label: string; start: number; end: number }> = [];
    for (let i = 0; i < 5; i++) {
      const start = block.startLevel + i * 10;
      const end = Math.min(block.endLevel, start + 9);
      if (start <= block.endLevel) {
        slices.push({ index: i, label: `${start}–${end}`, start, end });
      }
    }
    return slices;
  }, [block.startLevel, block.endLevel]);

  const filteredLevels = useMemo(() => {
    return block.levels.filter((lvl) => {
      if (subDecadeIdx !== 'all') {
        const dec = subDecades[subDecadeIdx];
        if (dec && (lvl.levelNumber < dec.start || lvl.levelNumber > dec.end)) {
          return false;
        }
      }
      const chCount = (completedChaptersByLevel[String(lvl.levelNumber)] || []).length;
      const isConq = conqueredSet.has(lvl.levelNumber) || chCount >= 10;
      const isUnl = lvl.levelNumber <= unlockedLevel;
      if (statusFilter === 'unlocked') return isUnl;
      if (statusFilter === 'conquered') return isConq;
      return true;
    });
  }, [block.levels, subDecadeIdx, subDecades, statusFilter, completedChaptersByLevel, conqueredSet, unlockedLevel]);

  return (
    <div
      className={`rounded-2xl bg-[#0c1322] border transition-colors ${
        isCurrentRange
          ? 'border-[#f2ca50]/70'
          : isFullyConquered
          ? 'border-emerald-500/45'
          : 'border-[#232a3a]'
      }`}
    >
      {/* Clean Header Bar */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className={`font-mono tabular-nums text-sm font-bold shrink-0 ${
              isCurrentRange
                ? 'text-[#f2ca50]'
                : isFullyConquered
                ? 'text-emerald-400'
                : isRangeUnlocked
                ? 'text-[#dce2f8]'
                : 'text-[#99907c]'
            }`}
          >
            {block.rangeLabel}
          </span>

          <span className="h-4 w-px bg-[#232a3a] shrink-0 hidden sm:inline-block" aria-hidden="true" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#dce2f8] flex-wrap">
              <span className="font-serif">{block.title}</span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className="text-xs font-normal text-[#d4c78f] truncate">
                {block.classLabels.join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#99907c]">
              <span>
                {conqueredCount}/{block.levels.length} conquis ({progressPct}%)
              </span>
              {isCurrentRange && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#f2ca50] font-semibold">
                    Étape active : Niv. {unlockedLevel}
                  </span>
                </>
              )}
              {!isRangeUnlocked && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Verrouillé</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className={`min-h-[40px] px-4 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
            isExpanded
              ? 'bg-[#f2ca50]/15 border-[#f2ca50]/55 text-[#f2ca50] hover:bg-[#f2ca50]/25'
              : 'bg-[#151b2b] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/50 hover:text-[#f2ca50]'
          }`}
        >
          <span>{isExpanded ? 'Condenser' : 'Étendre'}</span>
          <span className="material-symbols-outlined text-base">
            {isExpanded ? 'unfold_less' : 'unfold_more'}
          </span>
        </button>
      </div>

      {/* Hairline Progress Indicator */}
      <div className="px-4 pb-2.5">
        <div className="w-full h-1 rounded-full bg-[#151b2b] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFullyConquered ? 'bg-emerald-400' : 'bg-[#f2ca50]'
            }`}
            style={{ width: `${Math.max(isCurrentRange ? 4 : 0, progressPct)}%` }}
          />
        </div>
      </div>

      {/* Expandable 50-Level Drawer */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-[#232a3a]"
          >
            <div className="p-4 space-y-3.5">
              {/* Toolbar: Sub-decade slice selector (10 levels at a time) + Status filter */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-3 border-b border-[#232a3a]/80">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[#151b2b] border border-[#232a3a]">
                  <button
                    type="button"
                    onClick={() => setSubDecadeIdx('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono tabular-nums whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      subDecadeIdx === 'all'
                        ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                        : 'text-[#d0c5af] hover:text-[#dce2f8]'
                    }`}
                  >
                    Tous ({block.levels.length})
                  </button>
                  {subDecades.map((dec) => (
                    <button
                      key={dec.index}
                      type="button"
                      onClick={() => setSubDecadeIdx(dec.index)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono tabular-nums whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        subDecadeIdx === dec.index
                          ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                          : 'text-[#d0c5af] hover:text-[#dce2f8]'
                      }`}
                    >
                      {dec.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#151b2b] border border-[#232a3a] self-start lg:self-auto">
                  {(
                    [
                      { id: 'all', label: 'Tout' },
                      { id: 'unlocked', label: 'Débloqués' },
                      { id: 'conquered', label: 'Conquis' }
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        statusFilter === f.id
                          ? 'bg-[#232a3a] text-[#f2ca50] font-semibold'
                          : 'text-[#99907c] hover:text-[#dce2f8]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cartographic Sector Quick-Jumps (when handler provided) */}
              {onSelectSector && subSectors.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-[#99907c] shrink-0">
                    Afficher sur la carte :
                  </span>
                  {subSectors.map((sec) => {
                    const dist = getDistrictForLevel(sec.startLevel);
                    const isViewing = activeViewingSectorId === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => onSelectSector(sec)}
                        className={`px-3 py-1.5 rounded-lg border font-mono tabular-nums text-xs whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          isViewing
                            ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold'
                            : 'bg-[#151b2b] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/50'
                        }`}
                      >
                        {dist.classLabel} · {sec.startLevel}–{sec.endLevel}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Levels Grid */}
              {filteredLevels.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#99907c]">
                  Aucun niveau ne correspond à ce filtre dans la plage {block.rangeLabel}.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-2">
                  {filteredLevels.map((lvl) => {
                    const completedCh = completedChaptersByLevel[String(lvl.levelNumber)] || [];
                    const isConq = conqueredSet.has(lvl.levelNumber) || completedCh.length >= 10;
                    const isUnl = lvl.levelNumber <= unlockedLevel;
                    const isFrontier = lvl.levelNumber === unlockedLevel && !isConq;

                    return (
                      <div
                        key={lvl.levelNumber}
                        className={`rounded-xl border transition-colors flex items-stretch overflow-hidden ${
                          isFrontier
                            ? 'bg-[#f2ca50] border-[#ffe088] text-[#3c2f00]'
                            : isConq
                            ? 'bg-emerald-950/50 border-emerald-500/45 text-emerald-200'
                            : isUnl
                            ? 'bg-[#151b2b] border-[#f2ca50]/35 text-[#dce2f8]'
                            : 'bg-[#151b2b]/45 border-[#232a3a] text-[#99907c]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectLevel(lvl)}
                          title={`Niveau ${lvl.levelNumber} · ${lvl.landmarkTitle} (${lvl.classLabel})`}
                          className="flex-1 min-w-0 p-2.5 text-left flex flex-col justify-between gap-1 cursor-pointer hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f2ca50]"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-mono tabular-nums text-xs font-extrabold whitespace-nowrap">
                              Niv. {lvl.levelNumber}
                            </span>
                            {!isUnl ? (
                              <span className="material-symbols-outlined text-xs opacity-75">lock</span>
                            ) : isConq ? (
                              <span className="material-symbols-outlined text-xs text-emerald-400">
                                check_circle
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-mono whitespace-nowrap ${
                                  isFrontier ? 'text-[#3c2f00]/80 font-bold' : 'text-[#d4c78f]'
                                }`}
                              >
                                {lvl.classLabel}
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-xs leading-snug truncate ${
                              isFrontier ? 'font-bold text-[#3c2f00]' : 'font-medium'
                            }`}
                          >
                            {lvl.landmarkTitle}
                          </span>

                          <span
                            className={`text-[10px] font-mono tabular-nums ${
                              isFrontier
                                ? 'text-[#3c2f00]/80 font-semibold'
                                : isConq
                                ? 'text-emerald-300'
                                : 'text-[#99907c]'
                            }`}
                          >
                            {isConq ? '10/10 ch.' : isUnl ? `${completedCh.length}/10 ch.` : 'Verrouillé'}
                          </span>
                        </button>

                        {onPlayLevelDirect && isUnl && (
                          <button
                            type="button"
                            onClick={() => onPlayLevelDirect(lvl)}
                            title={`Lancer directement le Niveau ${lvl.levelNumber}`}
                            aria-label={`Jouer au Niveau ${lvl.levelNumber}`}
                            className={`px-2 flex items-center justify-center border-l cursor-pointer transition-colors ${
                              isFrontier
                                ? 'border-[#3c2f00]/20 hover:bg-[#3c2f00]/15 text-[#3c2f00]'
                                : 'border-[#232a3a] hover:bg-[#f2ca50]/15 text-[#f2ca50]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">play_arrow</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface LevelGroupNavigatorProps {
  blocks: CityLevelBlock50[];
  expandedBlocks: Record<string, boolean>;
  onToggleBlock: (blockId: string) => void;
  onExpandSingleBlock: (blockId: string) => void;
  onSetAllBlocks: (expandAll: boolean) => void;
  unlockedLevel: number;
  conqueredSet: Set<number>;
  completedChaptersByLevel: Record<string, number[]>;
  onSelectLevel: (level: CityLevelNode) => void;
  onPlayLevelDirect?: (level: CityLevelNode) => void;
  onSelectSector?: (sector: CityLevelSector) => void;
  activeViewingSectorId?: string;
}

/**
 * Navigateur hiérarchique complet pour les 600 niveaux en groupes de 50 :
 * 1. Barre de contrôle avec saut direct (1–600) + Tout étendre / Tout condenser
 * 2. Ruban condensé des 12 plages (1–50 … 551–600) sans trous de grille
 * 3. Panneaux étendus rendus en pleine largeur sous le ruban
 */
export const LevelGroupNavigator: React.FC<LevelGroupNavigatorProps> = ({
  blocks,
  expandedBlocks,
  onToggleBlock,
  onExpandSingleBlock,
  onSetAllBlocks,
  unlockedLevel,
  conqueredSet,
  completedChaptersByLevel,
  onSelectLevel,
  onPlayLevelDirect,
  onSelectSector,
  activeViewingSectorId
}) => {
  const [jumpInput, setJumpInput] = useState<string>('');
  const [jumpError, setJumpError] = useState<string | null>(null);

  const expandedList = useMemo(
    () => blocks.filter((b) => Boolean(expandedBlocks[b.id])),
    [blocks, expandedBlocks]
  );

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (isNaN(num) || num < 1 || num > MAX_CITY_LEVEL) {
      setJumpError(`Entrez un niveau entre 1 et ${MAX_CITY_LEVEL}.`);
      return;
    }
    setJumpError(null);
    const targetBlock = blocks.find((b) => num >= b.startLevel && num <= b.endLevel);
    const targetNode = targetBlock?.levels.find((l) => l.levelNumber === num);
    if (targetBlock) {
      onExpandSingleBlock(targetBlock.id);
    }
    if (targetNode) {
      onSelectLevel(targetNode);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Control Strip: Quick Level Jump + Expand/Condense Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
          <div className="relative flex items-center">
            <label htmlFor="city-level-jump-input" className="sr-only">
              Aller directement à un niveau (1 à {MAX_CITY_LEVEL})
            </label>
            <input
              id="city-level-jump-input"
              type="number"
              min={1}
              max={MAX_CITY_LEVEL}
              value={jumpInput}
              onChange={(e) => {
                setJumpInput(e.target.value);
                if (jumpError) setJumpError(null);
              }}
              placeholder={`Aller au niv. (1–${MAX_CITY_LEVEL})`}
              className="w-44 sm:w-48 min-h-[40px] px-3 rounded-xl bg-[#0c1322] border border-[#232a3a] text-xs font-mono tabular-nums text-[#dce2f8] placeholder-[#99907c] focus:border-[#f2ca50] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 text-[#f2ca50] hover:bg-[#f2ca50] hover:text-[#3c2f00] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            Rejoindre
          </button>
          {jumpError && <span className="text-xs text-rose-300">{jumpError}</span>}
        </form>

        <div className="flex items-center gap-2 text-xs self-end md:self-auto">
          <span className="font-mono tabular-nums text-[#99907c] hidden sm:inline">
            {expandedList.length === 0
              ? '12 plages condensées'
              : `${expandedList.length} plage${expandedList.length > 1 ? 's' : ''} ouverte${
                  expandedList.length > 1 ? 's' : ''
                }`}
          </span>
          <button
            type="button"
            onClick={() => onSetAllBlocks(true)}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0c1322] border border-[#232a3a] text-[#f2ca50] hover:border-[#f2ca50]/50 font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            Tout étendre
          </button>
          <button
            type="button"
            onClick={() => onSetAllBlocks(false)}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0c1322] border border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            Tout condenser
          </button>
        </div>
      </div>

      {/* Uniform 12-Block Summary Strip (Zero Grid Holes!) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {blocks.map((block) => {
          const isExpanded = Boolean(expandedBlocks[block.id]);
          const isCurrent = unlockedLevel >= block.startLevel && unlockedLevel <= block.endLevel;
          const isUnlocked = unlockedLevel >= block.startLevel;
          const conqueredCount = block.levels.filter(
            (l) =>
              conqueredSet.has(l.levelNumber) ||
              (completedChaptersByLevel[String(l.levelNumber)] || []).length >= 10
          ).length;
          const pct = Math.round((conqueredCount / block.levels.length) * 100);

          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onToggleBlock(block.id)}
              aria-expanded={isExpanded}
              className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                isExpanded
                  ? 'bg-[#191f2f] border-[#f2ca50] text-[#dce2f8]'
                  : isCurrent
                  ? 'bg-[#0c1322] border-[#f2ca50]/65 text-[#dce2f8] hover:bg-[#191f2f]'
                  : isUnlocked
                  ? 'bg-[#0c1322] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/45'
                  : 'bg-[#0c1322]/60 border-[#232a3a]/80 text-[#99907c] hover:text-[#d0c5af]'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`font-mono tabular-nums text-xs font-extrabold whitespace-nowrap ${
                    isCurrent || isExpanded ? 'text-[#f2ca50]' : ''
                  }`}
                >
                  {block.rangeLabel}
                </span>
                <span className="material-symbols-outlined text-base shrink-0 text-[#d4c78f]">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#d0c5af] truncate">
                  {block.classLabels.join(' · ')}
                </span>
                <div className="w-full h-1 rounded-full bg-[#151b2b] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      conqueredCount === block.levels.length ? 'bg-emerald-400' : 'bg-[#f2ca50]'
                    }`}
                    style={{ width: `${Math.max(isCurrent ? 6 : 0, pct)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono tabular-nums text-[#99907c]">
                  {conqueredCount}/{block.levels.length} conquis
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Panels Rendered Cleanly Full-Width Below Strip */}
      <AnimatePresence initial={false}>
        {expandedList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-3"
          >
            {expandedList.map((block) => (
              <CollapsibleLevelGroup
                key={block.id}
                block={block}
                isExpanded={true}
                onToggle={() => onToggleBlock(block.id)}
                unlockedLevel={unlockedLevel}
                conqueredSet={conqueredSet}
                completedChaptersByLevel={completedChaptersByLevel}
                onSelectLevel={onSelectLevel}
                onPlayLevelDirect={onPlayLevelDirect}
                onSelectSector={onSelectSector}
                activeViewingSectorId={activeViewingSectorId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
