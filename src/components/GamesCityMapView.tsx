import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ArcadeProgressionState, MiniGameMeta } from '../data/twentyGamesData';

interface GamesDistrict {
  id: 'all' | 'q1' | 'q2' | 'q3' | 'q4';
  roman: string;
  title: string;
  subtitle: string;
  rangeLabel: string;
  minNum: number;
  maxNum: number;
  accentHex: string;
  icon: string;
}

const GAMES_DISTRICTS: GamesDistrict[] = [
  {
    id: 'q1',
    roman: 'I',
    title: 'Esplanade des Fondations',
    subtitle: 'Réflexes lexicaux & premiers défis',
    rangeLabel: '#01 – #05',
    minNum: 1,
    maxNum: 5,
    accentHex: '#f2ca50',
    icon: 'bolt'
  },
  {
    id: 'q2',
    roman: 'II',
    title: 'Boulevard de la Syntaxe',
    subtitle: 'Construction, écoute & nuances',
    rangeLabel: '#06 – #10',
    minNum: 6,
    maxNum: 10,
    accentHex: '#38bdf8',
    icon: 'headphones'
  },
  {
    id: 'q3',
    roman: 'III',
    title: 'Galeries du Chrono',
    subtitle: 'Vitesse, mémoire & énigmes',
    rangeLabel: '#11 – #15',
    minNum: 11,
    maxNum: 15,
    accentHex: '#34d399',
    icon: 'timer'
  },
  {
    id: 'q4',
    roman: 'IV',
    title: "Citadelle d'Élite & Boss",
    subtitle: 'Registres avancés, duels & maître final',
    rangeLabel: '#16 – #21',
    minNum: 16,
    maxNum: 21,
    accentHex: '#a78bfa',
    icon: 'military_tech'
  }
];

function getDistrictForGameNumber(num: number): GamesDistrict {
  return (
    GAMES_DISTRICTS.find((d) => num >= d.minNum && num <= d.maxNum) || GAMES_DISTRICTS[0]
  );
}

interface MapPoint {
  xPct: number;
  yPx: number;
}

function computeGamesMapCoordinates(
  count: number,
  isMobile: boolean
): { points: MapPoint[]; canvasHeight: number } {
  const cols = isMobile ? 2 : 3;
  const topPad = isMobile ? 104 : 112;
  const bottomPad = isMobile ? 116 : 122;
  const rowHeight = isMobile ? 166 : 178;

  const points: MapPoint[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isReversed = row % 2 === 1;

    let xPct: number;
    let yWave: number;
    if (isMobile) {
      const baseCols = isReversed ? [73, 27] : [27, 73];
      xPct = baseCols[col];
      yWave = col === 0 ? -7 : 7;
    } else {
      const baseCols = isReversed ? [81, 50, 19] : [19, 50, 81];
      xPct = baseCols[col];
      yWave = col === 1 ? -12 : 8;
    }

    points.push({
      xPct,
      yPx: topPad + row * rowHeight + yWave
    });
  }

  const totalRows = Math.max(1, Math.ceil(count / cols));
  const canvasHeight = topPad + (totalRows - 1) * rowHeight + bottomPad;

  return { points, canvasHeight };
}

function buildBoulevardPath(points: MapPoint[], isMobile: boolean): string {
  if (points.length === 0) return '';
  const toX = (pct: number) => pct * 10;
  let d = `M ${toX(points[0].xPct)} ${points[0].yPx}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const x1 = toX(p1.xPct);
    const y1 = p1.yPx;
    const x2 = toX(p2.xPct);
    const y2 = p2.yPx;

    const isRowTurn = Math.abs(x1 - x2) < 40;
    if (isRowTurn) {
      const bulge = isMobile ? 118 : 104;
      const cx = x1 >= 500 ? Math.min(968, x1 + bulge) : Math.max(32, x1 - bulge);
      d += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    } else {
      const midX = (x1 + x2) / 2;
      d += ` C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }
  }
  return d;
}

const CompassRoseSvg: React.FC<{ accentHex: string }> = ({ accentHex }) => (
  <svg
    viewBox="0 0 64 64"
    className="w-11 h-11 sm:w-12 sm:h-12 opacity-45 pointer-events-none select-none"
    aria-hidden="true"
  >
    <circle
      cx="32"
      cy="32"
      r="25"
      fill="none"
      stroke={accentHex}
      strokeWidth="0.9"
      strokeOpacity="0.45"
      strokeDasharray="2 3"
    />
    <circle
      cx="32"
      cy="32"
      r="18"
      fill="none"
      stroke={accentHex}
      strokeWidth="0.7"
      strokeOpacity="0.35"
    />
    <polygon points="32,4 36,28 32,24 28,28" fill={accentHex} fillOpacity="0.85" />
    <polygon points="32,60 36,36 32,40 28,36" fill={accentHex} fillOpacity="0.35" />
    <polygon points="60,32 36,36 40,32 36,28" fill={accentHex} fillOpacity="0.45" />
    <polygon points="4,32 28,36 24,32 28,28" fill={accentHex} fillOpacity="0.45" />
    <circle cx="32" cy="32" r="3" fill="#0c1322" stroke={accentHex} strokeWidth="1.2" />
    <text
      x="32"
      y="12"
      textAnchor="middle"
      fontSize="6"
      fill={accentHex}
      fontFamily="monospace"
      fontWeight="700"
    >
      N
    </text>
  </svg>
);

interface GamesCityMapViewProps {
  games: MiniGameMeta[];
  progression: ArcadeProgressionState;
  playerLevel: number;
  isGameUnlocked: (game: MiniGameMeta) => boolean;
  onSelectGame: (game: MiniGameMeta) => void;
  onShowHowToPlay: (game: MiniGameMeta) => void;
  onLockedGameClick: (game: MiniGameMeta) => void;
}

export const GamesCityMapView: React.FC<GamesCityMapViewProps> = ({
  games,
  progression,
  playerLevel,
  isGameUnlocked,
  onSelectGame,
  onShowHowToPlay,
  onLockedGameClick
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [selectedDistrictId, setSelectedDistrictId] = useState<GamesDistrict['id']>('all');
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  // Pick the player's current unlocked frontier game as default inspected landmark
  const frontierGame = useMemo(() => {
    const exact = games.find((g) => g.number === progression.unlockedMaxGameNumber);
    if (exact && isGameUnlocked(exact)) return exact;
    const unlockedList = games.filter((g) => isGameUnlocked(g));
    return unlockedList[unlockedList.length - 1] || games[0];
  }, [games, progression.unlockedMaxGameNumber, isGameUnlocked]);

  const [inspectedGameId, setInspectedGameId] = useState<string>(
    () => frontierGame?.id || games[0]?.id || 'speed-match'
  );

  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const visibleGames = useMemo(() => {
    const sorted = [...games].sort((a, b) => a.number - b.number);
    if (selectedDistrictId === 'all') return sorted;
    const dist = GAMES_DISTRICTS.find((d) => d.id === selectedDistrictId);
    if (!dist) return sorted;
    return sorted.filter((g) => g.number >= dist.minNum && g.number <= dist.maxNum);
  }, [games, selectedDistrictId]);

  // Keep inspectedGame synced when filtering or initial mount
  const inspectedGame = useMemo(() => {
    return (
      visibleGames.find((g) => g.id === inspectedGameId) ||
      games.find((g) => g.id === inspectedGameId) ||
      visibleGames[0] ||
      games[0]
    );
  }, [visibleGames, games, inspectedGameId]);

  const activeDistrictMeta = useMemo(() => {
    if (selectedDistrictId !== 'all') {
      return GAMES_DISTRICTS.find((d) => d.id === selectedDistrictId) || GAMES_DISTRICTS[0];
    }
    return getDistrictForGameNumber(inspectedGame?.number || 1);
  }, [selectedDistrictId, inspectedGame]);

  const { points, canvasHeight } = useMemo(
    () => computeGamesMapCoordinates(visibleGames.length, isMobile),
    [visibleGames.length, isMobile]
  );

  const fullPathD = useMemo(() => buildBoulevardPath(points, isMobile), [points, isMobile]);

  // Build active unlocked golden boulevard path up to the furthest unlocked visible game
  const activePathD = useMemo(() => {
    let lastUnlockedIdx = -1;
    visibleGames.forEach((g, idx) => {
      if (isGameUnlocked(g)) lastUnlockedIdx = idx;
    });
    if (lastUnlockedIdx <= 0) return '';
    return buildBoulevardPath(points.slice(0, lastUnlockedIdx + 1), isMobile);
  }, [visibleGames, points, isMobile, isGameUnlocked]);

  const handleCenterOnFrontier = () => {
    if (!frontierGame) return;
    setSelectedDistrictId('all');
    setInspectedGameId(frontierGame.id);
    setTimeout(() => {
      const el = nodeRefs.current[frontierGame.id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const handleNodeInteraction = (game: MiniGameMeta) => {
    const unlocked = isGameUnlocked(game);
    setInspectedGameId(game.id);

    if (!unlocked) {
      onLockedGameClick(game);
      return;
    }

    // First tap inspects cleanly; tapping the already-selected monument launches directly
    if (inspectedGame?.id === game.id) {
      onSelectGame(game);
    }
  };

  const inspectedUnlocked = inspectedGame ? isGameUnlocked(inspectedGame) : false;
  const inspectedCompleted = inspectedGame
    ? progression.completedGames.includes(inspectedGame.id)
    : false;
  const inspectedDistrict = inspectedGame
    ? getDistrictForGameNumber(inspectedGame.number)
    : GAMES_DISTRICTS[0];

  return (
    <div className="space-y-4">
      {/* DISTRICT SELECTOR & QUICK FOCUS BAR */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-lg text-[#f2ca50]">explore</span>
            <span className="font-serif font-bold text-sm sm:text-base text-[#dce2f8] truncate">
              Atlas Urbain des Mini-Jeux ({visibleGames.length})
            </span>
          </div>

          {frontierGame && (
            <button
              type="button"
              onClick={handleCenterOnFrontier}
              className="px-3 py-1.5 rounded-xl bg-[#0c1322] hover:bg-[#191f2f] border border-[#f2ca50]/45 text-xs font-mono font-semibold text-[#f2ca50] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title={`Centrer sur votre étape actuelle : Jeu #${frontierGame.number}`}
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              <span>Étape #{String(frontierGame.number).padStart(2, '0')}</span>
            </button>
          )}
        </div>

        {/* Quartiers Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedDistrictId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
              selectedDistrictId === 'all'
                ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8] hover:border-[#f2ca50]/40'
            }`}
          >
            Plan Complet ({games.length})
          </button>

          {GAMES_DISTRICTS.map((dist) => {
            const distGames = games.filter(
              (g) => g.number >= dist.minNum && g.number <= dist.maxNum
            );
            const completedInDist = distGames.filter((g) =>
              progression.completedGames.includes(g.id)
            ).length;
            const isActive = selectedDistrictId === dist.id;

            return (
              <button
                key={dist.id}
                type="button"
                onClick={() => setSelectedDistrictId(dist.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8] hover:border-[#f2ca50]/40'
                }`}
              >
                <span className="font-mono font-bold">Q.{dist.roman}</span>
                <span>{dist.rangeLabel}</span>
                <span
                  className={`font-mono tabular-nums text-[10px] ${
                    isActive
                      ? 'text-[#3c2f00]/80'
                      : completedInDist === distGames.length && distGames.length > 0
                      ? 'text-emerald-400'
                      : 'text-[#99907c]'
                  }`}
                >
                  {completedInDist}/{distGames.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATION D'EMBARQUEMENT (ACTIVE INSPECTED GAME PANEL) */}
      {inspectedGame && (
        <AnimatePresence mode="wait">
          <motion.section
            key={inspectedGame.id}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            aria-label="Monument ludique sélectionné"
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#151b2b] via-[#12192b] to-[#0c1322] border border-[#f2ca50]/45 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                  inspectedUnlocked
                    ? 'bg-[#0c1322] border-[#f2ca50]/60 text-[#f2ca50]'
                    : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">
                  {inspectedUnlocked ? inspectedGame.icon : 'lock'}
                </span>
              </div>

              <div className="flex flex-col min-w-0 gap-1">
                <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-[#d4c78f] flex-wrap">
                  <span className="font-bold text-[#f2ca50]">
                    JEU #{String(inspectedGame.number).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Quartier {inspectedDistrict.roman} ({inspectedDistrict.title})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#dce2f8]">{inspectedGame.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#f2ca50] font-semibold">+{inspectedGame.xpReward} XP</span>
                  {inspectedCompleted && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-bold">Validé</span>
                    </>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#dce2f8] leading-snug">
                  {inspectedGame.title}{' '}
                  <span className="text-xs sm:text-sm font-sans font-normal text-[#99907c]">
                    — {inspectedGame.subtitle}
                  </span>
                </h3>

                <p className="text-xs text-[#d0c5af]/90 leading-relaxed line-clamp-2">
                  {inspectedGame.howToPlay.goal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => onShowHowToPlay(inspectedGame)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0c1322] hover:bg-[#191f2f] border border-[#232a3a] hover:border-[#f2ca50]/45 text-xs font-semibold text-[#dce2f8] flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base text-[#f2ca50]">help_outline</span>
                <span>Règles</span>
              </button>

              {inspectedUnlocked ? (
                <button
                  type="button"
                  onClick={() => onSelectGame(inspectedGame)}
                  className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  <span>Lancer le Jeu</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onLockedGameClick(inspectedGame)}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-amber-500/45 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Conditions (Niv. {inspectedGame.requiredLevel})</span>
                </button>
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      )}

      {/* CARTOGRAPHIC CITY MAP CANVAS FOR ALL GAMES */}
      <section className="rounded-3xl bg-[#0c1322] border border-[#232a3a] shadow-2xl overflow-hidden">
        {/* Map Cartographic Sub-Header */}
        <header className="px-4 py-3.5 sm:px-6 bg-[#151b2b]/95 border-b border-[#232a3a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: `${activeDistrictMeta.accentHex}18`,
                borderColor: `${activeDistrictMeta.accentHex}55`,
                color: activeDistrictMeta.accentHex
              }}
            >
              <span className="material-symbols-outlined text-xl">{activeDistrictMeta.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#d4c78f]">
                <span>
                  {selectedDistrictId === 'all'
                    ? 'PARCOURS COMPLET D’ARCADE'
                    : `QUARTIER ${activeDistrictMeta.roman}`}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {visibleGames.filter((g) => isGameUnlocked(g)).length}/{visibleGames.length} accessibles
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#dce2f8] truncate">
                {selectedDistrictId === 'all'
                  ? 'Grand Boulevard des 21 Jeux Anglais'
                  : activeDistrictMeta.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-[11px] font-mono text-[#99907c]">
              Cliquer pour inspecter · 2e clic pour jouer
            </span>
            <CompassRoseSvg accentHex={activeDistrictMeta.accentHex} />
          </div>
        </header>

        {/* Interactive Blueprint Winding Canvas */}
        <div
          className="relative w-full overflow-hidden bg-[#0c1322]"
          style={{ height: `${canvasHeight}px` }}
        >
          {/* Blueprint Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(212,199,143,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,199,143,0.12) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
            aria-hidden="true"
          />

          {/* SVG River, Parks & Boulevard Layer */}
          <svg
            viewBox={`0 0 1000 ${canvasHeight}`}
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            {/* Ornamental Urban Parks */}
            <rect
              x="54"
              y={canvasHeight * 0.14}
              width="120"
              height="68"
              rx="16"
              fill="#102824"
              fillOpacity="0.45"
              stroke="#34d399"
              strokeOpacity="0.16"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x="812"
              y={canvasHeight * 0.48}
              width="130"
              height="74"
              rx="18"
              fill="#102824"
              fillOpacity="0.42"
              stroke="#34d399"
              strokeOpacity="0.16"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x="76"
              y={canvasHeight * 0.78}
              width="136"
              height="62"
              rx="14"
              fill="#151b2b"
              fillOpacity="0.45"
              stroke="#d4c78f"
              strokeOpacity="0.14"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {/* Winding Thames-inspired Waterway */}
            <path
              d={`M -30 ${canvasHeight * 0.34} C 260 ${canvasHeight * 0.24}, 420 ${
                canvasHeight * 0.52
              }, 690 ${canvasHeight * 0.39} S 940 ${canvasHeight * 0.28}, 1030 ${
                canvasHeight * 0.44
              }`}
              fill="none"
              stroke="#183254"
              strokeOpacity="0.62"
              strokeWidth="26"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M -30 ${canvasHeight * 0.34} C 260 ${canvasHeight * 0.24}, 420 ${
                canvasHeight * 0.52
              }, 690 ${canvasHeight * 0.39} S 940 ${canvasHeight * 0.28}, 1030 ${
                canvasHeight * 0.44
              }`}
              fill="none"
              stroke="#38bdf8"
              strokeOpacity="0.22"
              strokeWidth="1.5"
              strokeDasharray="8 10"
              vectorEffect="non-scaling-stroke"
            />

            {/* Base Paved Boulevard */}
            {fullPathD && (
              <>
                <path
                  d={fullPathD}
                  fill="none"
                  stroke="#1a2236"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={fullPathD}
                  fill="none"
                  stroke="#2e374d"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={fullPathD}
                  fill="none"
                  stroke="#99907c"
                  strokeOpacity="0.32"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}

            {/* Golden Illuminated Unlocked Route */}
            {activePathD && (
              <motion.path
                d={activePathD}
                fill="none"
                stroke="#f2ca50"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            )}
          </svg>

          {/* Positioned Interactive Game Monument Nodes */}
          {visibleGames.map((game, idx) => {
            const pt = points[idx];
            if (!pt) return null;

            const unlocked = isGameUnlocked(game);
            const isCompleted = progression.completedGames.includes(game.id);
            const isFrontier = frontierGame?.id === game.id;
            const isSelected = inspectedGame?.id === game.id;
            const dist = getDistrictForGameNumber(game.number);

            return (
              <div
                key={game.id}
                style={{
                  left: `${pt.xPct}%`,
                  top: `${pt.yPx}px`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 w-[138px] sm:w-[172px]"
              >
                {/* Monument Medallion Button */}
                <motion.button
                  ref={(el) => {
                    nodeRefs.current[game.id] = el;
                  }}
                  type="button"
                  onClick={() => handleNodeInteraction(game)}
                  whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.05 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                    isSelected
                      ? 'bg-[#1b243b] border-[#f2ca50] text-[#f2ca50] shadow-[0_0_24px_rgba(242,202,80,0.45)] ring-2 ring-[#f2ca50]/35'
                      : isCompleted
                      ? 'bg-[#0f2922] border-emerald-400 text-emerald-300 shadow-[0_6px_18px_rgba(16,185,129,0.22)]'
                      : unlocked
                      ? 'bg-[#151b2b] border-[#f2ca50]/55 text-[#f2ca50] shadow-lg hover:border-[#f2ca50]'
                      : 'bg-[#0e131f] border-[#262e42] text-[#7a8296] opacity-85 hover:opacity-100'
                  }`}
                  title={
                    unlocked
                      ? `#${game.number} ${game.title} — ${game.subtitle}`
                      : `Verrouillé — Requis : Niv. ${game.requiredLevel} (Actuel : ${playerLevel})`
                  }
                >
                  {/* Number Pill Corner */}
                  <span
                    className={`absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums font-bold border ${
                      isSelected || isFrontier
                        ? 'bg-[#f2ca50] text-[#3c2f00] border-[#ffe088]'
                        : isCompleted
                        ? 'bg-emerald-500 text-[#052e1e] border-emerald-300'
                        : unlocked
                        ? 'bg-[#0c1322] text-[#f2ca50] border-[#f2ca50]/45'
                        : 'bg-[#151b2b] text-[#99907c] border-[#2c3448]'
                    }`}
                  >
                    #{String(game.number).padStart(2, '0')}
                  </span>

                  {/* Status Corner Icon */}
                  {isCompleted ? (
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-[#052e1e] flex items-center justify-center shadow"
                      title="Validé"
                    >
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </span>
                  ) : !unlocked ? (
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#191f2f] border border-amber-500/50 text-amber-400 flex items-center justify-center shadow"
                      title={`Niveau ${game.requiredLevel} requis`}
                    >
                      <span className="material-symbols-outlined text-[11px]">lock</span>
                    </span>
                  ) : isFrontier ? (
                    <span
                      className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[9px] font-mono font-black shadow"
                      title="Prochaine étape à relever"
                    >
                      ACTIF
                    </span>
                  ) : null}

                  <span
                    className="material-symbols-outlined text-2xl sm:text-[28px]"
                    style={unlocked ? { color: isCompleted ? '#34d399' : dist.accentHex } : undefined}
                  >
                    {unlocked ? game.icon : 'lock'}
                  </span>
                </motion.button>

                {/* Monument Label & Quick Play Action */}
                <div
                  className={`mt-2 px-2.5 py-1.5 rounded-xl border text-center w-full backdrop-blur-sm transition-colors ${
                    isSelected
                      ? 'bg-[#151b2b]/95 border-[#f2ca50]/70 shadow-md'
                      : unlocked
                      ? 'bg-[#0c1322]/90 border-[#232a3a]'
                      : 'bg-[#0c1322]/75 border-[#1c2232]'
                  }`}
                >
                  <p
                    className={`font-serif font-bold text-[11px] sm:text-xs leading-tight truncate ${
                      unlocked ? 'text-[#dce2f8]' : 'text-[#99907c]'
                    }`}
                  >
                    {game.title}
                  </p>

                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-mono tabular-nums">
                    {isSelected && unlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectGame(game)}
                        className="px-2.5 py-0.5 rounded-md bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Jouer</span>
                        <span className="material-symbols-outlined text-[12px]">play_arrow</span>
                      </button>
                    ) : (
                      <>
                        <span className={unlocked ? 'text-[#f2ca50]' : 'text-[#99907c]'}>
                          {unlocked ? `+${game.xpReward} XP` : `Niv. ${game.requiredLevel}`}
                        </span>
                        <span aria-hidden="true" className="text-[#99907c]">
                          ·
                        </span>
                        <span className="text-[#d0c5af]/80 truncate">{game.difficulty}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
