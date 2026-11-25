import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type {
  AdventureIslandId,
  CEFRLevel,
  EnglishAdventureState,
  UserProfile
} from '../firebase/types';
import {
  ADVENTURE_AVATARS,
  ADVENTURE_CARDS,
  ADVENTURE_ISLANDS,
  ADVENTURE_THEMES,
  ADVENTURE_TROPHIES,
  type AdventureIsland,
  type AdventureMission
} from '../data/englishAdventureData';
import {
  ENGLISH_ADVENTURE_UPDATED_EVENT,
  equipAdventureAvatar,
  getAdaptiveDifficultyForIsland,
  getAdaptiveTierMeta,
  getEnglishAdventureState,
  getIslandProgressStats,
  isIslandUnlocked,
  isMissionUnlocked,
  type AdventureMissionEvaluationResult
} from '../utils/englishAdventureManager';
import {
  dailyChallengeToMissionAndIsland,
  generateDailyAdventureChallenges,
  getActiveXpBoostStatus,
  getTodayAdventureDateKey,
  type AdventureDailyChallenge
} from '../utils/adventureDailyChallenges';
import { useAdaptiveProfile } from '../hooks/useAdaptiveProfile';
import { useAppTheme, type AppTheme } from '../theme/ThemeContext';
import { computeUserBadges } from '../data/badges';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';
import { LuxuryCompassDial3D, LuxuryCornerBrackets } from './CityMapLuxury3DKit';
import { AdventureArchipelago3DMap, IslandMonumentSvg } from './AdventureArchipelago3DMap';
import { AdventureMissionRunnerModal } from './AdventureMissionRunnerModal';
import { speakText } from '../services/speechService';
import { playSelectCue } from '../utils/soundEffects';
import adventureHeroImg from '../assets/images/adventure_hero_crest_1795529656293.jpg';

interface EnglishAdventureViewProps {
  user: UserProfile;
  currentLevel: CEFRLevel;
  onXpEarned: (xp: number) => void;
  onProfileRefresh: () => void;
}

type AdventureSectionTab = 'map' | 'treasures' | 'wardrobe';

const ADVENTURE_CONFETTI_COLORS = [
  '#f2ca50', // Gold
  '#ffe088', // Champagne Gold
  '#d4af37', // Antique Gold
  '#0c1322', // Midnight Blue
  '#1e3a8a', // Deep Sapphire Midnight Blue
  '#34d399', // Emerald
  '#10b981'  // Rich Emerald
];

const BOSS_CONFETTI_CREST_FLECKS = Array.from({ length: 18 }, (_, idx) => {
  const angle = (idx / 18) * Math.PI * 2;
  const radiusX = idx % 2 === 0 ? 210 : 145;
  const radiusY = idx % 3 === 0 ? 95 : 68;
  const colors = ['#f2ca50', '#1e3a8a', '#34d399', '#ffe088', '#0c1322', '#10b981'];
  return {
    id: idx,
    dx: Math.round(Math.cos(angle) * radiusX),
    dy: Math.round(Math.sin(angle) * radiusY),
    rotate: (idx * 47) % 360,
    color: colors[idx % colors.length],
    size: idx % 3 === 0 ? 9 : 7,
    delay: (idx % 5) * 0.045
  };
});

interface BossVictoryConfettiProps {
  active: boolean;
  triggerKey: number;
}

export const BossVictoryConfetti: React.FC<BossVictoryConfettiProps> = ({
  active,
  triggerKey
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [burstVisible, setBurstVisible] = useState(false);

  useEffect(() => {
    if (!active || triggerKey <= 0) {
      setBurstVisible(false);
      return;
    }

    const timers: number[] = [];
    if (!shouldReduceMotion) {
      setBurstVisible(true);
      timers.push(window.setTimeout(() => setBurstVisible(false), 1600));
    }

    try {
      // Salve centrale Or, Bleu nuit & Émeraude
      confetti({
        particleCount: 85,
        spread: 82,
        startVelocity: 40,
        origin: { y: 0.42 },
        colors: ADVENTURE_CONFETTI_COLORS,
        zIndex: 9999,
        disableForReducedMotion: true
      });

      // Salves latérales en éventail
      timers.push(
        window.setTimeout(() => {
          try {
            confetti({
              particleCount: 55,
              angle: 60,
              spread: 62,
              origin: { x: 0.16, y: 0.56 },
              colors: ADVENTURE_CONFETTI_COLORS,
              zIndex: 9999,
              disableForReducedMotion: true
            });
            confetti({
              particleCount: 55,
              angle: 120,
              spread: 62,
              origin: { x: 0.84, y: 0.56 },
              colors: ADVENTURE_CONFETTI_COLORS,
              zIndex: 9999,
              disableForReducedMotion: true
            });
          } catch {}
        }, 200)
      );
    } catch {
      // Ignore sandboxed canvas-confetti errors
    }

    return () => {
      for (const id of timers) {
        window.clearTimeout(id);
      }
    };
  }, [active, triggerKey, shouldReduceMotion]);

  if (!active || triggerKey <= 0 || shouldReduceMotion) return null;

  return (
    <AnimatePresence>
      {burstVisible && (
        <motion.div
          key={`boss-confetti-crest-${triggerKey}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          {BOSS_CONFETTI_CREST_FLECKS.map((fleck) => (
            <motion.span
              key={fleck.id}
              initial={{ x: 0, y: 0, scale: 0.9, rotate: 0, opacity: 1 }}
              animate={{
                x: fleck.dx,
                y: fleck.dy,
                scale: [0.9, 1.15, 0.25],
                rotate: fleck.rotate,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.25,
                delay: fleck.delay,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="absolute rounded-[2px] border border-white/25"
              style={{
                width: fleck.size,
                height: fleck.size,
                backgroundColor: fleck.color
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const EnglishAdventureView: React.FC<EnglishAdventureViewProps> = ({
  user,
  currentLevel,
  onXpEarned,
  onProfileRefresh
}) => {
  const { assessment } = useAdaptiveProfile(user);
  const { theme, setTheme } = useAppTheme();

  const [advState, setAdvState] = useState<EnglishAdventureState>(() =>
    getEnglishAdventureState(user)
  );
  const [sectionTab, setSectionTab] = useState<AdventureSectionTab>('map');
  const [is3DPerspective, setIs3DPerspective] = useState<boolean>(true);
  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);

  // Default selected island = highest unlocked frontier island not yet defeated
  const [selectedIslandId, setSelectedIslandId] = useState<AdventureIslandId>(() => {
    const initial = getEnglishAdventureState(user);
    const frontier = ADVENTURE_ISLANDS.find(
      (isl) => isIslandUnlocked(initial, isl.id) && !initial.bossDefeatedIslandIds.includes(isl.id)
    );
    return frontier ? frontier.id : 'vocabulary_kingdom';
  });

  const [activeMissionRun, setActiveMissionRun] = useState<{
    island: AdventureIsland;
    mission: AdventureMission;
    isScaffoldedPractice?: boolean;
    dailyChallenge?: AdventureDailyChallenge;
  } | null>(null);
  const [boostClockTick, setBoostClockTick] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const [bossVictoryShakeKey, setBossVictoryShakeKey] = useState<number>(0);
  const [bossVictoryBanner, setBossVictoryBanner] = useState<{
    shakeKey: number;
    island: AdventureIsland;
    result: AdventureMissionEvaluationResult;
  } | null>(null);
  const pendingBossVictoryRef = useRef<{
    unlockedNextIslandId?: AdventureIslandId;
    accentHex: string;
  } | null>(null);

  const tabTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAdvState(getEnglishAdventureState(user));
  }, [user]);

  useEffect(() => {
    const onAdvEvt = (e: Event) => {
      const ce = e as CustomEvent<EnglishAdventureState>;
      if (ce.detail) {
        setAdvState(ce.detail);
      } else {
        setAdvState(getEnglishAdventureState());
      }
    };
    window.addEventListener(ENGLISH_ADVENTURE_UPDATED_EVENT, onAdvEvt);
    return () => window.removeEventListener(ENGLISH_ADVENTURE_UPDATED_EVENT, onAdvEvt);
  }, []);

  const selectedIsland = useMemo(
    () => ADVENTURE_ISLANDS.find((isl) => isl.id === selectedIslandId) || ADVENTURE_ISLANDS[0],
    [selectedIslandId]
  );

  const equippedAvatar = useMemo(
    () =>
      ADVENTURE_AVATARS.find((a) => a.id === advState.equippedAvatarId) || ADVENTURE_AVATARS[0],
    [advState.equippedAvatarId]
  );

  const adventureBadges = useMemo(
    () =>
      computeUserBadges({ ...user, englishAdventure: advState }).filter(
        (b) => b.category === 'mastery'
      ),
    [user, advState]
  );

  const islandStats = useMemo(
    () => getIslandProgressStats(advState, selectedIsland),
    [advState, selectedIsland]
  );

  const selectedIslandTier = getAdaptiveDifficultyForIsland(
    advState,
    selectedIsland.id,
    assessment.dynamicDirective.mode
  );
  const tierMeta = useMemo(() => getAdaptiveTierMeta(selectedIslandTier), [selectedIslandTier]);

  const todayDateKey = getTodayAdventureDateKey();
  const dailyChallenges = useMemo(
    () =>
      generateDailyAdventureChallenges(
        currentLevel,
        todayDateKey,
        assessment.profile.weakestSkills
      ),
    [currentLevel, todayDateKey, assessment.profile.weakestSkills]
  );

  const activeBoostStatus = useMemo(
    () => getActiveXpBoostStatus(advState, Date.now() + boostClockTick * 0),
    [advState, boostClockTick]
  );

  useEffect(() => {
    if (!activeBoostStatus.active) return;
    const interval = window.setInterval(() => {
      setBoostClockTick((t) => t + 1);
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [activeBoostStatus.active]);

  const handleSelectIsland = useCallback((id: AdventureIslandId) => {
    playSelectCue();
    setSelectedIslandId(id);
  }, []);

  const handleMissionEvaluated = useCallback(
    (result: AdventureMissionEvaluationResult) => {
      setAdvState(result.state);
      if (
        activeMissionRun?.mission.kind === 'boss_challenge' &&
        !activeMissionRun?.isScaffoldedPractice &&
        result.passed
      ) {
        const shakeKey = Date.now();
        // Trigger Framer Motion Boss Victory camera shake component immediately at final defeat
        setBossVictoryBanner({
          shakeKey,
          island: activeMissionRun.island,
          result
        });
        setBossVictoryShakeKey((k) => k + 1);
        pendingBossVictoryRef.current = {
          unlockedNextIslandId: result.unlockedNextIsland?.id,
          accentHex: activeMissionRun.island.accentHex
        };
      }
      if (result.xpAwarded > 0) {
        onXpEarned(result.xpAwarded);
      }
      onProfileRefresh();
    },
    [activeMissionRun, onXpEarned, onProfileRefresh]
  );

  const handleCloseMissionModal = useCallback(() => {
    setActiveMissionRun(null);
    const pendingBoss = pendingBossVictoryRef.current;
    if (pendingBoss) {
      pendingBossVictoryRef.current = null;
      if (pendingBoss.unlockedNextIslandId) {
        setSelectedIslandId(pendingBoss.unlockedNextIslandId);
      }
      setBossVictoryShakeKey((k) => k + 1);
      setBossVictoryBanner((prev) => (prev ? { ...prev, shakeKey: Date.now() } : prev));
    }
  }, []);

  const handleEquipAvatar = useCallback(
    async (avatarId: string) => {
      playSelectCue();
      const next = await equipAdventureAvatar(avatarId);
      setAdvState(next);
      onProfileRefresh();
    },
    [onProfileRefresh]
  );

  const handleApplyTheme = useCallback(
    (themeId: string) => {
      playSelectCue();
      setTheme(themeId as AppTheme);
    },
    [setTheme]
  );

  return (
    <div className="ea-theme-root max-w-6xl mx-auto px-3 sm:px-6 pb-24 space-y-6 select-none">
      {/* Editorial Hero Archipelago Header */}
      <section className="relative rounded-2xl bg-[var(--ea-bg-deep)] border border-[var(--ea-border)] p-5 sm:p-7 shadow-2xl overflow-hidden transition-colors duration-300">
        {!heroImgFailed && (
          <img
            src={adventureHeroImg}
            alt="Panorama architectural des territoires English Adventure"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            onError={() => setHeroImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none select-none"
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#070d1b]/95 via-[#0c1322]/85 to-[#080f1f]/75"
          aria-hidden="true"
        />
        <LuxuryCornerBrackets accentHex={selectedIsland.accentHex} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4 max-w-2xl">
            <LuxuryCompassDial3D accentHex={selectedIsland.accentHex} variant="dark" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                <span className="font-bold tracking-wider text-[var(--ea-text-gold)]">
                  English Adventure
                </span>
                <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                  ·
                </span>
                <span className="font-semibold text-emerald-300">
                  {advState.bossDefeatedIslandIds.length}/7 Territoires Conquis
                </span>
                <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                  ·
                </span>
                <span className="text-[var(--ea-text-cream)]">
                  Niveau actif {currentLevel}
                </span>
              </div>

              <h1
                className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ea-text-cream)]"
                style={{ textWrap: 'balance' }}
              >
                L’Archipel des Sept Compétences
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed max-w-xl text-[var(--ea-text-cream-muted)]">
                Explorez sept territoires d’apprentissage sans pression de chronomètre : chaque mission évalue votre précision, la constance de vos acquis et débloque le territoire suivant via un Boss multi-compétences.
              </p>
            </div>
          </div>

          {/* Expedition Telemetry Strip (Clean surface contrast, tabular numerals) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-[var(--ea-bg-surface)]/95 border border-[var(--ea-border-subtle)] flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${equippedAvatar.bgGradient} border border-[var(--ea-border-gold)] flex items-center justify-center shrink-0`}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: equippedAvatar.accentHex }}
                >
                  {equippedAvatar.icon}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[var(--ea-text-gold-soft)]">Avatar</div>
                <div className="text-xs font-semibold whitespace-nowrap text-[var(--ea-text-cream)]">
                  {equippedAvatar.name}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-[var(--ea-bg-surface)]/95 border border-[var(--ea-border-subtle)] text-right">
              <div className="text-[11px] text-[var(--ea-text-gold-soft)]">Étoiles</div>
              <div className="text-sm font-mono font-bold tabular-nums whitespace-nowrap text-[var(--ea-text-gold)]">
                {advState.totalStars} / {ADVENTURE_ISLANDS.length * 12} ★
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-[var(--ea-bg-surface)]/95 border border-[var(--ea-border-subtle)] text-right">
              <div className="text-[11px] text-[var(--ea-text-gold-soft)]">XP Aventure</div>
              <div className="text-sm font-mono font-bold tabular-nums whitespace-nowrap text-sky-300">
                {advState.adventureXpEarned} XP
              </div>
            </div>

            {activeBoostStatus.active && activeBoostStatus.boost && (
              <div className="px-3.5 py-2.5 rounded-xl bg-gradient-to-br from-[#2a200d] to-[var(--ea-bg-surface)] border border-[var(--ea-border-gold)] text-right shadow-md">
                <div className="text-[11px] text-[var(--ea-text-gold)] flex items-center justify-end gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <span>Multiplicateur Actif</span>
                </div>
                <div className="text-sm font-mono font-bold tabular-nums whitespace-nowrap text-[var(--ea-text-gold-bright)]">
                  ×{activeBoostStatus.boost.multiplier} XP · {activeBoostStatus.remainingLabelFr}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Toolbar: GlassSlidingCapsule Navigation & Perspective Toggle */}
        <div className="mt-5 pt-4 border-t border-[var(--ea-border-subtle)] flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div
            ref={tabTrackRef}
            className="relative inline-flex items-center p-1 rounded-full bg-[var(--ea-bg-deep)] border border-[var(--ea-border-subtle)]"
          >
            <GlassSlidingCapsule
              containerRef={tabTrackRef}
              activeKey={sectionTab}
              tone="dark"
            />
            {(
              [
                { id: 'map', label: 'Archipel 3D & Missions', icon: 'public' },
                { id: 'treasures', label: 'Trophées & Cartes', icon: 'workspace_premium' },
                { id: 'wardrobe', label: 'Avatars & Thèmes', icon: 'palette' }
              ] as const
            ).map((tab) => {
              const active = sectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-capsule-key={tab.id}
                  onClick={() => {
                    playSelectCue();
                    setSectionTab(tab.id);
                  }}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                    active
                      ? 'glass-capsule-active-text'
                      : 'text-[var(--ea-text-cream)] hover:text-[var(--ea-text-gold)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {sectionTab === 'map' && (
            <button
              type="button"
              onClick={() => {
                playSelectCue();
                setIs3DPerspective((v) => !v);
              }}
              className="px-4 py-1.5 rounded-full bg-[var(--ea-bg-surface)] hover:bg-[var(--ea-bg-elevated)] border border-[var(--ea-border-gold)] text-xs font-semibold text-[var(--ea-text-gold)] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-sm">
                {is3DPerspective ? 'view_in_ar' : 'grid_view'}
              </span>
              <span>{is3DPerspective ? 'Vue Relief 3D' : 'Vue Zénithale 2D'}</span>
            </button>
          )}
        </div>
      </section>

      {sectionTab === 'map' && (
        <div className="space-y-6">
          {/* Boss Victory Celebration Component with Framer Motion Camera Shake */}
          <AnimatePresence>
            {bossVictoryBanner && (
              <motion.section
                key={`boss-victory-${bossVictoryBanner.shakeKey}`}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96, x: 0, y: 0, rotate: 0 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: [0.97, 1.015, 1],
                        x: [0, -12, 11, -9, 8, -5, 4, -2, 0],
                        y: [0, 7, -8, 6, -5, 3, -2, 0],
                        rotate: [0, -0.8, 0.75, -0.5, 0.35, -0.15, 0]
                      }
                }
                exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
                transition={{ duration: 0.68, ease: 'easeOut' }}
                aria-live="polite"
                className="relative rounded-2xl bg-gradient-to-r from-[#1f1930] via-[#122038] to-[var(--ea-bg-surface)] border border-[var(--ea-border-gold)] p-4 sm:p-5 shadow-2xl overflow-hidden will-change-transform"
              >
                <BossVictoryConfetti
                  active={Boolean(bossVictoryBanner)}
                  triggerKey={bossVictoryBanner.shakeKey}
                />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl border border-[var(--ea-border-gold)] flex items-center justify-center shrink-0 shadow-lg"
                      style={{
                        backgroundColor: `${bossVictoryBanner.island.accentHex}24`,
                        color: 'var(--ea-text-gold)'
                      }}
                    >
                      <span className="material-symbols-outlined text-2xl">trophy</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                        <span className="font-bold text-[var(--ea-text-gold)]">
                          Victoire Finale · Île {bossVictoryBanner.island.number}
                        </span>
                        <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                          ·
                        </span>
                        <span className="text-emerald-300 font-semibold">
                          {bossVictoryBanner.result.accuracy}% d’exactitude ·{' '}
                          {bossVictoryBanner.result.stars}/3 ★
                        </span>
                        {(bossVictoryBanner.result.xpAwarded > 0 ||
                          bossVictoryBanner.result.coinsAwarded > 0) && (
                          <>
                            <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                              ·
                            </span>
                            <span className="text-sky-300 font-semibold">
                              +{bossVictoryBanner.result.xpAwarded} XP · +
                              {bossVictoryBanner.result.coinsAwarded} MSZ
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--ea-text-cream)]">
                        {bossVictoryBanner.island.bossName} vaincu — {bossVictoryBanner.island.name}{' '}
                        conquis
                      </h2>
                      <p className="text-xs text-[var(--ea-text-cream-muted)]">
                        {bossVictoryBanner.result.unlockedNextIsland
                          ? `La voie maritime vers l’Île ${bossVictoryBanner.result.unlockedNextIsland.number} (${bossVictoryBanner.result.unlockedNextIsland.name}) est désormais ouverte.`
                          : 'Vous avez triomphé de cette épreuve multi-compétences avec rigueur.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {bossVictoryBanner.result.unlockedNextIsland && (
                      <button
                        type="button"
                        onClick={() => {
                          playSelectCue();
                          setSelectedIslandId(bossVictoryBanner.result.unlockedNextIsland!.id);
                          setBossVictoryBanner(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-[var(--ea-text-gold)] hover:bg-[var(--ea-text-gold-bright)] text-[var(--ea-text-on-gold)] font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                      >
                        Explorer {bossVictoryBanner.result.unlockedNextIsland.name}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playSelectCue();
                        setBossVictoryBanner(null);
                      }}
                      className="w-9 h-9 rounded-xl bg-[var(--ea-bg-surface)] hover:bg-[var(--ea-bg-elevated)] border border-[var(--ea-border-subtle)] text-[var(--ea-text-cream)] hover:text-[var(--ea-text-gold)] flex items-center justify-center shrink-0 cursor-pointer"
                      aria-label="Fermer la bannière de victoire du Boss"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* CEFR-Adaptive Dual-Skill Daily Challenges */}
          <section className="rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border)] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--ea-border-subtle)]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                  <span className="font-bold text-[var(--ea-text-gold)] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">today</span>
                    <span>Défis Quotidiens</span>
                  </span>
                  <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                    ·
                  </span>
                  <span className="text-[var(--ea-text-cream)]">Calibré CECRL {currentLevel}</span>
                  <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                    ·
                  </span>
                  <span className="text-sky-300">Duo de Compétences</span>
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--ea-text-cream)]">
                  Épreuves Croisées du Jour & Multiplicateur d’XP
                </h2>
                <p className="text-xs text-[var(--ea-text-cream-muted)]">
                  Complétez un défi bi-compétences avec précision pour activer un multiplicateur d’XP temporaire sur vos missions de l’Archipel.
                </p>
              </div>

              {activeBoostStatus.active && activeBoostStatus.boost ? (
                <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#281f0e] to-[var(--ea-bg-surface)] border border-[var(--ea-border-gold)] flex items-center gap-3 shrink-0">
                  <span className="material-symbols-outlined text-xl text-[var(--ea-text-gold)]">
                    bolt
                  </span>
                  <div className="text-xs tabular-nums">
                    <div className="font-mono font-bold text-[var(--ea-text-gold)]">
                      Boost ×{activeBoostStatus.boost.multiplier} XP Actif ({activeBoostStatus.remainingLabelFr})
                    </div>
                    <div className="text-[11px] text-[var(--ea-text-cream-muted)]">
                      Origine : {activeBoostStatus.boost.skillPairLabelFr}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-[var(--ea-bg-surface)] border border-[var(--ea-border-subtle)] text-xs text-[var(--ea-text-gold-soft)] font-mono shrink-0">
                  Récompense : Multiplicateur jusqu’à ×1.75 XP
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyChallenges.map((dc) => {
                const completedToday = Boolean(
                  advState.completedDailyChallengeIds?.includes(dc.id)
                );
                return (
                  <article
                    key={dc.id}
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-150 ${
                      completedToday
                        ? 'bg-[var(--ea-bg-surface)] border-emerald-500/45'
                        : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)] hover:border-[var(--ea-text-gold)] hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="font-bold"
                            style={{ color: dc.accentHex }}
                          >
                            {dc.skillPairLabelFr}
                          </span>
                          <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                            ·
                          </span>
                          <span className="text-[var(--ea-text-cream)]">CECRL {dc.cefrLevel}</span>
                          {dc.isAdaptiveFocus && (
                            <>
                              <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                                ·
                              </span>
                              <span className="text-[var(--ea-text-gold)] font-semibold">
                                Priorité adaptative
                              </span>
                            </>
                          )}
                        </div>
                        <span className="font-bold text-[var(--ea-text-gold)] shrink-0">
                          ×{dc.xpMultiplierReward} XP ({dc.boostDurationLabelFr})
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${dc.accentHex}1c`,
                            borderColor: `${dc.accentHex}55`,
                            color: dc.accentHex
                          }}
                        >
                          <span className="material-symbols-outlined text-xl">{dc.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif text-base font-bold text-[var(--ea-text-cream)]">
                            {dc.title}
                          </h3>
                          <p className="text-xs text-[var(--ea-text-cream-muted)] leading-relaxed mt-0.5">
                            {dc.objectiveFr}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-[var(--ea-text-gold-soft)] tabular-nums">
                        {dc.questions.length} étapes mixtes ({dc.skillLabelsFr[0]} + {dc.skillLabelsFr[1]}) · Seuil{' '}
                        <span className="text-sky-300 font-semibold">
                          {dc.passAccuracyRequired}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--ea-border-subtle)] flex items-center justify-between gap-3">
                      <div className="text-xs font-mono tabular-nums">
                        {completedToday ? (
                          <span className="text-emerald-300 font-semibold">
                            ✓ Défi validé aujourd’hui
                          </span>
                        ) : (
                          <span className="text-[var(--ea-text-gold)] font-semibold">
                            +{dc.baseXp} XP · +{dc.baseCoins} MSZ · ×{dc.xpMultiplierReward} XP
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playSelectCue();
                          const { island: virtualIsland, mission: virtualMission } =
                            dailyChallengeToMissionAndIsland(dc);
                          setActiveMissionRun({
                            island: virtualIsland,
                            mission: virtualMission,
                            dailyChallenge: dc
                          });
                        }}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                          completedToday
                            ? 'bg-[var(--ea-bg-elevated)] hover:bg-[var(--ea-bg-interactive)] text-[var(--ea-text-gold)] border border-[var(--ea-border)]'
                            : 'bg-[var(--ea-text-gold)] hover:bg-[var(--ea-text-gold-bright)] text-[var(--ea-text-on-gold)] shadow-sm'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {completedToday ? 'replay' : 'bolt'}
                        </span>
                        <span>{completedToday ? 'Rejouer' : 'Relever le Défi'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Interactive Zero-Rerender 3D Archipelago Diorama */}
          <AdventureArchipelago3DMap
            advState={advState}
            selectedIsland={selectedIsland}
            is3DPerspective={is3DPerspective}
            bossVictoryShakeKey={bossVictoryShakeKey}
            onSelectIsland={handleSelectIsland}
          />

          {/* Selected Territory Command Deck & 4-Step Mission Path */}
          <section
            className={`rounded-2xl bg-[var(--ea-bg-card)] border p-5 sm:p-6 shadow-xl space-y-6 transition-colors duration-200 ${
              islandStats.bossDefeated
                ? 'border-[#f2ca50]/75'
                : 'border-[var(--ea-border)]'
            }`}
          >
            {/* Territory Header & Adaptive Briefing */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-[var(--ea-border-subtle)]">
              <div className="flex items-start gap-4 max-w-2xl">
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg overflow-hidden"
                  style={{
                    backgroundColor: islandStats.bossDefeated
                      ? 'rgba(22, 35, 62, 0.95)'
                      : `${selectedIsland.accentHex}18`,
                    borderColor: islandStats.bossDefeated
                      ? '#f2ca50'
                      : `${selectedIsland.accentHex}65`
                  }}
                >
                  {islandStats.bossDefeated && !shouldReduceMotion && (
                    <motion.span
                      className="absolute inset-1 rounded-xl border border-dashed border-[#f2ca50]/65 pointer-events-none"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                      aria-hidden="true"
                    />
                  )}
                  <motion.div
                    animate={
                      islandStats.bossDefeated && !shouldReduceMotion
                        ? { y: [0, -2.5, 0] }
                        : { y: 0 }
                    }
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="scale-90"
                  >
                    <IslandMonumentSvg
                      motif={selectedIsland.motif}
                      accentHex={selectedIsland.accentHex}
                      secondaryHex={selectedIsland.secondaryHex}
                      unlocked={islandStats.unlocked}
                      bossDefeated={islandStats.bossDefeated}
                      isSelected
                    />
                  </motion.div>
                </div>
                <div className="space-y-1.5">
                  {/* Unboxed Clean Metadata Line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                    <span className="font-bold text-[var(--ea-text-gold)]">
                      Territoire {selectedIsland.number}/7
                    </span>
                    <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                      ·
                    </span>
                    <span className="text-[var(--ea-text-cream)]">{selectedIsland.skillLabelFr}</span>
                    <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                      ·
                    </span>
                    <span className="text-sky-300">CECRL {selectedIsland.cefrRange}</span>
                    <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                      ·
                    </span>
                    <span className={`font-semibold ${tierMeta.accentClass}`}>
                      Palier {tierMeta.labelFr}
                    </span>
                    {islandStats.bossDefeated && (
                      <>
                        <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                          ·
                        </span>
                        <span className="font-semibold text-emerald-300">
                          Territoire conquis
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--ea-text-cream)]">
                    {selectedIsland.name} — {selectedIsland.frenchSubtitle}
                  </h2>

                  <p className="text-xs sm:text-sm text-[var(--ea-text-cream-muted)] leading-relaxed">
                    {selectedIsland.territoryLore}
                  </p>

                  <p className="text-xs text-[var(--ea-text-gold-soft)] leading-relaxed">
                    Adaptation active : {tierMeta.rationaleFr}
                  </p>
                </div>
              </div>

              {/* Action Controls: Primary Expedition Action + Guided Practice */}
              {islandStats.unlocked && (
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playSelectCue();
                      setActiveMissionRun({
                        island: selectedIsland,
                        mission: selectedIsland.missions[0],
                        isScaffoldedPractice: true
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[var(--ea-bg-surface)] hover:bg-[var(--ea-bg-elevated)] border border-[var(--ea-border-subtle)] hover:border-[var(--ea-border-gold)] text-[var(--ea-text-gold-bright)] font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">psychology_alt</span>
                    <span>Consolidation Guidée</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSelectCue();
                      setActiveMissionRun({
                        island: selectedIsland,
                        mission: islandStats.nextRecommendedMission
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[var(--ea-text-gold)] hover:bg-[var(--ea-text-gold-bright)] text-[var(--ea-text-on-gold)] font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      {islandStats.nextRecommendedMission.kind === 'boss_challenge'
                        ? 'swords'
                        : 'play_arrow'}
                    </span>
                    <span>
                      {islandStats.nextRecommendedMission.kind === 'boss_challenge'
                        ? `Défier ${selectedIsland.bossName}`
                        : `Lancer Étape ${islandStats.nextRecommendedMission.order}`}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Territory Readiness & Mastery Strip (Full-width single elevation row) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--ea-bg-surface)] border border-[var(--ea-border-subtle)] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[var(--ea-text-gold-soft)]">Progression du territoire</div>
                  <div className="font-mono font-bold text-sm text-[var(--ea-text-cream)] tabular-nums mt-0.5">
                    {islandStats.completedCount} / {islandStats.totalMissions} étapes validées
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-[var(--ea-text-gold)] tabular-nums">
                  {islandStats.earnedStars}/{islandStats.maxStars} ★
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--ea-bg-surface)] border border-[var(--ea-border-subtle)] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[var(--ea-text-gold-soft)]">Précision moyenne retenue</div>
                  <div className="font-mono font-bold text-sm text-sky-300 tabular-nums mt-0.5">
                    {islandStats.masteryPct}% d’exactitude
                  </div>
                </div>
                <span className="material-symbols-outlined text-xl text-sky-300">analytics</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--ea-bg-surface)] border border-[var(--ea-border-subtle)] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[var(--ea-text-gold-soft)]">
                    Accès au Boss ({selectedIsland.bossName})
                  </div>
                  <div className="font-mono font-bold text-sm tabular-nums mt-0.5 text-emerald-300">
                    {islandStats.bossDefeated
                      ? 'Boss vaincu · Île conquise'
                      : islandStats.bossUnlocked
                      ? 'Prêt pour l’épreuve finale'
                      : `${islandStats.prereqCompletedCount}/${islandStats.prereqTotalCount} prérequis validés`}
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-xl ${
                    islandStats.bossDefeated
                      ? 'text-emerald-300'
                      : islandStats.bossUnlocked
                      ? 'text-[var(--ea-text-gold)]'
                      : 'text-[var(--ea-text-cream-muted)]'
                  }`}
                >
                  {islandStats.bossDefeated
                    ? 'verified'
                    : islandStats.bossUnlocked
                    ? 'swords'
                    : 'lock'}
                </span>
              </div>
            </div>

            {!islandStats.unlocked && (
              <div className="p-4 rounded-xl bg-amber-950/45 border border-[var(--ea-border-gold)] flex items-center gap-3 text-xs text-[var(--ea-text-cream)]">
                <span className="material-symbols-outlined text-xl text-[var(--ea-text-gold)] shrink-0">
                  lock
                </span>
                <div>
                  <strong className="text-[var(--ea-text-gold)]">Territoire verrouillé :</strong>{' '}
                  remportez le <strong className="text-[var(--ea-text-gold)]">Défi du Boss</strong>{' '}
                  de l’Île {selectedIsland.number - 1} (≥ 70 % de précision) pour ouvrir la route
                  maritime vers {selectedIsland.name}.
                </div>
              </div>
            )}

            {/* 4 Progression Missions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedIsland.missions.map((mission) => {
                const unlocked = isMissionUnlocked(advState, selectedIsland, mission);
                const completed = advState.completedMissionIds.includes(mission.id);
                const bestAcc = advState.missionBestAccuracy?.[mission.id] || 0;
                const stars = advState.missionStars?.[mission.id] || 0;
                const isBoss = mission.kind === 'boss_challenge';

                return (
                  <article
                    key={mission.id}
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-150 ${
                      isBoss
                        ? 'bg-gradient-to-br from-[#231829] via-[#13192b] to-[var(--ea-bg-surface)] border-[var(--ea-border-gold)]'
                        : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                    } ${!unlocked ? 'opacity-90' : 'hover:border-[var(--ea-text-gold)] hover:-translate-y-0.5'}`}
                  >
                    <div className="space-y-2.5">
                      {/* Clean Metadata Header Row (Zero pill stack) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums">
                          <span className={isBoss ? 'text-rose-200 font-bold' : 'text-[var(--ea-text-gold)] font-bold'}>
                            Étape {mission.order} · {mission.kindLabelFr}
                          </span>
                          <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                            ·
                          </span>
                          <span className="text-[var(--ea-text-cream)]">{mission.cefrLevel}</span>
                          <span aria-hidden="true" className="text-[var(--ea-text-gold-soft)]">
                            ·
                          </span>
                          <span className="text-[var(--ea-text-cream-muted)]">
                            Difficulté {mission.difficultyRating}/5
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0" aria-label={`${stars} sur 3 étoiles`}>
                          {[1, 2, 3].map((st) => (
                            <span
                              key={st}
                              className={`material-symbols-outlined text-base ${
                                st <= stars ? 'text-[var(--ea-text-gold)]' : 'text-[#4b566e]'
                              }`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--ea-text-cream)]">
                        {mission.title}
                      </h3>

                      <p className="text-xs text-[var(--ea-text-cream-muted)] leading-relaxed">
                        {mission.objectiveFr}
                      </p>

                      <div className="text-[11px] font-mono text-[var(--ea-text-gold-soft)] tabular-nums">
                        {mission.questions.length} étapes ciblées · Seuil de validation{' '}
                        <span className="text-sky-300 font-semibold">
                          {mission.passAccuracyRequired}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--ea-border-subtle)] flex items-center justify-between gap-3">
                      <div className="text-xs font-mono tabular-nums">
                        {completed ? (
                          <span className="text-emerald-300 font-semibold">
                            ✓ Validée · Record {bestAcc}%
                          </span>
                        ) : (
                          <span className="text-[var(--ea-text-gold)] font-semibold">
                            +{mission.baseXp} XP · +{mission.baseCoins} MSZ
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          playSelectCue();
                          setActiveMissionRun({
                            island: selectedIsland,
                            mission
                          });
                        }}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                          !unlocked
                            ? 'bg-[var(--ea-bg-elevated)] text-[var(--ea-text-cream-muted)] border border-[var(--ea-border-subtle)] cursor-not-allowed'
                            : isBoss
                            ? 'bg-gradient-to-r from-[#f2ca50] to-amber-500 text-[var(--ea-text-on-gold)] hover:brightness-110 shadow-md cursor-pointer'
                            : 'bg-[var(--ea-text-gold)] hover:bg-[var(--ea-text-gold-bright)] text-[var(--ea-text-on-gold)] shadow-sm cursor-pointer'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {!unlocked
                            ? 'lock'
                            : completed
                            ? 'replay'
                            : isBoss
                            ? 'swords'
                            : 'play_arrow'}
                        </span>
                        <span>
                          {!unlocked
                            ? 'Prérequis requis'
                            : completed
                            ? 'Améliorer'
                            : isBoss
                            ? 'Affronter le Boss'
                            : 'Démarrer'}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {sectionTab === 'treasures' && (
        <div className="space-y-6">
          {/* Adventure Mastery Badges */}
          <section className="rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] p-5 space-y-4">
            <h2 className="font-serif text-lg font-bold text-[var(--ea-text-cream)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--ea-text-gold)]">military_tech</span>
              <span>Badges d’Expédition English Adventure</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {adventureBadges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    b.isUnlocked
                      ? 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-gold)]'
                      : 'bg-[var(--ea-bg-surface)]/90 border-[var(--ea-border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="material-symbols-outlined text-xl text-[var(--ea-text-gold)]">
                      {b.icon}
                    </span>
                    <span
                      className={
                        b.isUnlocked
                          ? 'text-emerald-300 font-bold'
                          : 'text-[var(--ea-text-gold-soft)] font-semibold'
                      }
                    >
                      {b.isUnlocked ? '✓ Obtenu' : `${b.currentProgress}/${b.requiredTarget}`}
                    </span>
                  </div>
                  <div className="text-sm font-serif font-bold text-[var(--ea-text-cream)]">
                    {b.title}
                  </div>
                  <div className="text-xs text-[var(--ea-text-cream-muted)] leading-relaxed">
                    {b.description}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9 Trophies */}
          <section className="rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[var(--ea-text-cream)] flex items-center gap-2 tabular-nums">
                <span className="material-symbols-outlined text-[var(--ea-text-gold)]">emoji_events</span>
                <span>
                  Trophées de Maîtrise ({advState.unlockedTrophyIds.length}/{ADVENTURE_TROPHIES.length})
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ADVENTURE_TROPHIES.map((tr) => {
                const unlocked = advState.unlockedTrophyIds.includes(tr.id);
                return (
                  <div
                    key={tr.id}
                    className={`p-4 rounded-xl border space-y-2.5 ${
                      unlocked
                        ? 'bg-gradient-to-br from-[#1b243b] to-[var(--ea-bg-surface)] border-[var(--ea-border-gold)] shadow'
                        : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span
                        className={`material-symbols-outlined text-2xl ${
                          unlocked
                            ? 'text-[var(--ea-text-gold)]'
                            : 'text-[var(--ea-text-cream-muted)]'
                        }`}
                      >
                        {tr.icon}
                      </span>
                      <span
                        className={
                          unlocked
                            ? 'text-emerald-300 font-bold'
                            : 'text-[var(--ea-text-gold-soft)] font-semibold'
                        }
                      >
                        {unlocked ? '✓ Débloqué' : tr.tier.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-serif font-bold text-[var(--ea-text-cream)]">
                        {tr.title}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--ea-text-gold)]">
                        {tr.subtitle}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--ea-text-cream-muted)] leading-snug">
                      {tr.descriptionFr}
                    </p>
                    <div className="text-[11px] font-mono text-[var(--ea-text-gold-soft)] pt-2 border-t border-[var(--ea-border-subtle)]">
                      {tr.unlockConditionFr}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7 Collectible Cards */}
          <section className="rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] p-5 space-y-4">
            <h2 className="font-serif text-lg font-bold text-[var(--ea-text-cream)] flex items-center gap-2 tabular-nums">
              <span className="material-symbols-outlined text-sky-300">style</span>
              <span>
                Cartes à Collectionner des Territoires ({advState.unlockedCardIds.length}/
                {ADVENTURE_CARDS.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ADVENTURE_CARDS.map((card) => {
                const unlocked = advState.unlockedCardIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                      unlocked
                        ? 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-gold)] shadow-lg'
                        : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span
                          className="font-bold"
                          style={{
                            color: unlocked ? card.accentHex : 'var(--ea-text-gold-soft)'
                          }}
                        >
                          {card.rarity} · {card.serialPrefix}
                        </span>
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{
                            color: unlocked ? card.accentHex : 'var(--ea-text-cream-muted)'
                          }}
                        >
                          {unlocked ? card.icon : 'lock'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm text-[var(--ea-text-cream)]">
                        {card.name}
                      </h3>
                      <p className="text-xs text-[var(--ea-text-cream-muted)] leading-snug">
                        {card.loreFr}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => speakText(card.englishMotto, 'en-GB', `adv-card-${card.id}`)}
                      className={`p-2.5 rounded-lg border text-left text-xs italic flex items-center justify-between gap-2 ${
                        unlocked
                          ? 'bg-[var(--ea-bg-card)] border-[var(--ea-border-subtle)] hover:border-[var(--ea-border-gold)] text-[var(--ea-text-gold-bright)] cursor-pointer'
                          : 'bg-[var(--ea-bg-card)] border-[var(--ea-border-subtle)] text-[var(--ea-text-cream-muted)] cursor-not-allowed'
                      }`}
                    >
                      <span className="truncate">« {card.englishMotto} »</span>
                      <span className="material-symbols-outlined text-sm shrink-0">volume_up</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {sectionTab === 'wardrobe' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Unlockable Avatars */}
          <section className="rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] p-5 space-y-3.5">
            <h2 className="font-serif text-lg font-bold text-[var(--ea-text-cream)] flex items-center gap-2 tabular-nums">
              <span className="material-symbols-outlined text-[var(--ea-text-gold)]">badge</span>
              <span>
                Avatars d’Honneur ({advState.unlockedAvatarIds.length}/{ADVENTURE_AVATARS.length})
              </span>
            </h2>
            <div className="space-y-2.5">
              {ADVENTURE_AVATARS.map((av) => {
                const unlocked = advState.unlockedAvatarIds.includes(av.id);
                const equipped = advState.equippedAvatarId === av.id;
                return (
                  <div
                    key={av.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      equipped
                        ? 'bg-[#1c2740] border-[var(--ea-text-gold)]'
                        : unlocked
                        ? 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                        : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${av.bgGradient} border border-[var(--ea-border-gold)] flex items-center justify-center shrink-0`}
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ color: av.accentHex }}
                        >
                          {unlocked ? av.icon : 'lock'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-serif font-bold text-[var(--ea-text-cream)] truncate">
                          {av.name}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--ea-text-gold)]">
                          {av.titleFr}
                        </div>
                        <div className="text-[11px] text-[var(--ea-text-cream-muted)] truncate">
                          {av.unlockRequirementFr}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked || equipped}
                      onClick={() => handleEquipAvatar(av.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 ${
                        equipped
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                          : unlocked
                          ? 'bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] hover:bg-[var(--ea-text-gold-bright)] cursor-pointer'
                          : 'bg-[var(--ea-bg-elevated)] text-[var(--ea-text-cream-muted)] border border-[var(--ea-border-subtle)] cursor-not-allowed'
                      }`}
                    >
                      {equipped ? 'Équipé' : unlocked ? 'Équiper' : 'Verrouillé'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Unlockable Themes */}
          <section className="rounded-2xl bg-[var(--ea-bg-card)] border border-[var(--ea-border-subtle)] p-5 space-y-3.5">
            <h2 className="font-serif text-lg font-bold text-[var(--ea-text-cream)] flex items-center gap-2 tabular-nums">
              <span className="material-symbols-outlined text-violet-300">palette</span>
              <span>
                Thèmes d’Interface Déblocables ({advState.unlockedThemeIds.length}/
                {ADVENTURE_THEMES.length})
              </span>
            </h2>
            <div className="space-y-2.5">
              {ADVENTURE_THEMES.map((th) => {
                const unlocked = advState.unlockedThemeIds.includes(th.id);
                const active = theme === th.id;
                return (
                  <div
                    key={th.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      active
                        ? 'bg-[#1c2740] border-[var(--ea-text-gold)]'
                        : unlocked
                        ? 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                        : 'bg-[var(--ea-bg-surface)] border-[var(--ea-border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
                        style={{ backgroundColor: th.previewBg, borderColor: th.previewAccent }}
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{ color: th.previewAccent }}
                        >
                          {unlocked ? 'palette' : 'lock'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-serif font-bold text-[var(--ea-text-cream)] truncate">
                          {th.name}
                        </div>
                        <div className="text-[11px] text-[var(--ea-text-cream-muted)] truncate">
                          {th.subtitleFr}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--ea-text-gold-soft)] truncate">
                          {th.unlockRequirementFr}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => handleApplyTheme(th.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                          : unlocked
                          ? 'bg-[var(--ea-text-gold)] text-[var(--ea-text-on-gold)] hover:bg-[var(--ea-text-gold-bright)] cursor-pointer'
                          : 'bg-[var(--ea-bg-elevated)] text-[var(--ea-text-cream-muted)] border border-[var(--ea-border-subtle)] cursor-not-allowed'
                      }`}
                    >
                      {active ? 'Actif' : unlocked ? 'Appliquer' : 'Verrouillé'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Active Mission Runner Modal */}
      {activeMissionRun && (
        <AdventureMissionRunnerModal
          isOpen={Boolean(activeMissionRun)}
          island={activeMissionRun.island}
          mission={activeMissionRun.mission}
          initialTier={
            activeMissionRun.dailyChallenge
              ? assessment.dynamicDirective.mode === 'accelerated'
                ? 'mastery'
                : assessment.dynamicDirective.mode === 'scaffolded'
                ? 'scaffolded'
                : 'standard'
              : selectedIslandTier
          }
          cefrLevel={currentLevel}
          isScaffoldedPractice={activeMissionRun.isScaffoldedPractice}
          dailyChallenge={activeMissionRun.dailyChallenge}
          onClose={handleCloseMissionModal}
          onMissionEvaluated={handleMissionEvaluated}
          onEquipUnlockedAvatar={handleEquipAvatar}
          onApplyUnlockedTheme={handleApplyTheme}
        />
      )}
    </div>
  );
};
