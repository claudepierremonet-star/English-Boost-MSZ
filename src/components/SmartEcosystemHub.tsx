import React, { useState, useEffect, useMemo } from 'react';
import type {
  UserProfile,
  CEFRLevel,
  SchoolGrade,
  LearningAttempt,
  FlashcardProgress,
  DailyMissionsState,
  SkillKey
} from '../firebase/types';
import type { SchoolLesson } from '../data/curriculum';
import {
  getUserLearningAttempts,
  getStoredFlashcardProgressList
} from '../firebase/client';
import {
  evaluateAdaptiveLearning,
  SCHOOL_GRADES_META,
  SKILL_META,
  inferGradeFromCefr,
  getCompletedTenMinBlockIds,
  toggleTenMinBlockCompleted,
  TEN_MIN_SESSION_UPDATED_EVENT
} from '../services/adaptiveEngine';
import {
  getDailyMissionsState,
  claimDailyMissionReward,
  DAILY_MISSIONS_UPDATED_EVENT
} from '../utils/dailyMissionsManager';
import { getCityMapProgression } from '../utils/cityMapManager';
import { computeUserBadges } from '../data/badges';
import { calculateLevel } from '../utils/levelUtils';
import { speakText } from '../services/speechService';
import { playVictoryCue } from '../utils/soundEffects';
import { motion, AnimatePresence } from 'framer-motion';
import { TelemetryListSkeleton } from './SkeletonLoaders';

export type EcosystemLaunchTarget =
  | 'tutor'
  | 'adventure_world'
  | 'flashcards'
  | 'speaking'
  | 'escape_room'
  | 'dialogues'
  | 'listening_cinema'
  | 'grammar_battle'
  | 'collectibles'
  | 'dashboard'
  | 'leaderboard';

interface SmartEcosystemHubProps {
  user: UserProfile;
  currentLevel: CEFRLevel;
  onSelectSchoolGrade: (grade: SchoolGrade, suggestedCefr?: CEFRLevel) => void;
  onLaunchModule: (target: EcosystemLaunchTarget) => void;
  onOpenLesson: (lesson: SchoolLesson) => void;
  onClaimMissionXp?: (xp: number) => void;
  compactMode?: boolean;
}

export const SmartEcosystemHub: React.FC<SmartEcosystemHubProps> = ({
  user,
  currentLevel,
  onSelectSchoolGrade,
  onLaunchModule,
  onOpenLesson,
  onClaimMissionXp,
  compactMode = false
}) => {
  const [attempts, setAttempts] = useState<LearningAttempt[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardProgress[]>([]);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(true);
  const [cityProg, setCityProg] = useState(() => getCityMapProgression());

  const activeGrade: SchoolGrade = user.schoolGrade || inferGradeFromCefr(currentLevel);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoadingTelemetry(true);
      try {
        const [{ attempts: atts }, cards] = await Promise.all([
          getUserLearningAttempts(user.uid, 120),
          getStoredFlashcardProgressList()
        ]);
        if (mounted) {
          setAttempts(atts);
          setFlashcards(cards);
          setCityProg(getCityMapProgression());
        }
      } catch {
        // graceful fallback
      } finally {
        if (mounted) setIsLoadingTelemetry(false);
      }
    }
    load();

    const refresh = () => load();
    window.addEventListener('eb_attempts_updated', refresh);
    window.addEventListener('eb_city_map_updated', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('eb_attempts_updated', refresh);
      window.removeEventListener('eb_city_map_updated', refresh);
    };
  }, [user.uid, user.stats?.totalXp, user.stats?.completedModules]);

  const assessment = useMemo(
    () => evaluateAdaptiveLearning({ ...user, schoolGrade: activeGrade, level: currentLevel }, attempts, flashcards, cityProg),
    [user, activeGrade, currentLevel, attempts, flashcards, cityProg]
  );

  const [completedTenMinIds, setCompletedTenMinIds] = useState<string[]>(() =>
    getCompletedTenMinBlockIds()
  );

  useEffect(() => {
    const onTenMinEvt = (e: Event) => {
      const ce = e as CustomEvent<string[]>;
      if (Array.isArray(ce.detail)) {
        setCompletedTenMinIds(ce.detail);
      } else {
        setCompletedTenMinIds(getCompletedTenMinBlockIds());
      }
    };
    window.addEventListener(TEN_MIN_SESSION_UPDATED_EVENT, onTenMinEvt);
    return () => window.removeEventListener(TEN_MIN_SESSION_UPDATED_EVENT, onTenMinEvt);
  }, []);

  const [missionsState, setMissionsState] = useState<DailyMissionsState>(() =>
    getDailyMissionsState(
      activeGrade,
      currentLevel,
      assessment.profile.weakestSkills[0] || 'grammar',
      user.dailyMissions
    )
  );

  useEffect(() => {
    setMissionsState(
      getDailyMissionsState(
        activeGrade,
        currentLevel,
        assessment.profile.weakestSkills[0] || 'grammar',
        user.dailyMissions
      )
    );
  }, [activeGrade, currentLevel, assessment.profile.weakestSkills, user.dailyMissions]);

  useEffect(() => {
    const onMissionsUpdate = (e: Event) => {
      const ce = e as CustomEvent<DailyMissionsState>;
      if (ce.detail) setMissionsState(ce.detail);
    };
    window.addEventListener(DAILY_MISSIONS_UPDATED_EVENT, onMissionsUpdate);
    return () => window.removeEventListener(DAILY_MISSIONS_UPDATED_EVENT, onMissionsUpdate);
  }, []);

  const academicLevel = calculateLevel(user.stats?.totalXp ?? 0);
  const dailyGoalTarget = Math.max(5, user.stats?.studyMinutesTarget ?? 30);
  const dailyGoalMinutes = user.stats?.studyMinutesToday ?? 0;
  const dailyGoalPct = Math.min(100, Math.round((dailyGoalMinutes / dailyGoalTarget) * 100));

  const badges = useMemo(() => computeUserBadges(user, attempts), [user, attempts]);
  const unlockedBadges = badges.filter((b) => b.isUnlocked);

  const weeklyXpVal = user.stats?.weeklyXp ?? 0;
  const weeklyStandingLabel =
    weeklyXpVal >= 2500
      ? 'Ligue Oxford · Fellow'
      : weeklyXpVal >= 1200
      ? 'Ligue Diamant'
      : weeklyXpVal >= 400
      ? 'Ligue Argent'
      : 'En progression';

  const handleClaimMission = (missionId: string) => {
    const res = claimDailyMissionReward(missionId);
    if (!res) return;
    playVictoryCue();
    setMissionsState(res.state);
    onClaimMissionXp?.(res.xpAwarded);
  };

  const handleMissionLaunch = (actionTarget: DailyMissionsState['missions'][number]['actionTarget']) => {
    const map: Record<string, EcosystemLaunchTarget> = {
      flashcards: 'flashcards',
      listening_cinema: 'listening_cinema',
      grammar_battle: 'grammar_battle',
      escape_room: 'escape_room',
      speaking: 'speaking',
      tutor: 'tutor',
      dialogues: 'dialogues'
    };
    onLaunchModule(map[actionTarget] || 'tutor');
  };

  const pillarTiles: Array<{
    id: EcosystemLaunchTarget;
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
    accentClass: string;
  }> = [
    {
      id: 'tutor',
      title: 'Tuteur Anglais IA',
      subtitle: 'Chat, correction écriture & exercices',
      icon: 'psychology',
      badge: 'IA Gemini',
      accentClass: 'text-[#f2ca50] border-[#f2ca50]/45'
    },
    {
      id: 'adventure_world',
      title: 'English Adventure World',
      subtitle: `7 Îles 3D (${user.englishAdventure?.bossDefeatedIslandIds?.length || 0}/7) • Cité Niv. ${cityProg.unlockedLevel}`,
      icon: 'public',
      badge: `${(user.englishAdventure?.totalStars || 0) + cityProg.totalStars} ★`,
      accentClass: 'text-emerald-300 border-emerald-500/35'
    },
    {
      id: 'flashcards',
      title: 'Smart Memory (SM-2)',
      subtitle: `${assessment.dueVocabularyCount} révision(s) due(s)`,
      icon: 'style',
      badge: 'SM-2',
      accentClass: 'text-sky-300 border-sky-500/35'
    },
    {
      id: 'speaking',
      title: 'Speaking & Phonetics Lab',
      subtitle: 'Ondes UK/US & duel d’accent',
      icon: 'mic',
      badge: 'UK / US',
      accentClass: 'text-amber-300 border-amber-500/35'
    },
    {
      id: 'escape_room',
      title: 'English Escape Room',
      subtitle: '4 salles d’énigmes & cadenas',
      icon: 'lock_open',
      badge: 'Nouveau',
      accentClass: 'text-[#f2ca50] border-[#f2ca50]/45'
    },
    {
      id: 'dialogues',
      title: 'Conversation Simulator',
      subtitle: '500 dialogues Duo, Trio & Groupe',
      icon: 'forum',
      badge: '500 scènes',
      accentClass: 'text-violet-300 border-violet-500/35'
    },
    {
      id: 'listening_cinema',
      title: 'Listening Cinema',
      subtitle: 'Épisodes audio multi-voix & quiz',
      icon: 'movie',
      badge: 'Nouveau',
      accentClass: 'text-rose-300 border-rose-500/35'
    },
    {
      id: 'grammar_battle',
      title: 'Grammar Battle',
      subtitle: 'Duels syntaxiques chronométrés',
      icon: 'gavel',
      badge: 'Nouveau',
      accentClass: 'text-cyan-300 border-cyan-500/35'
    },
    {
      id: 'collectibles',
      title: 'Cartes à Collectionner',
      subtitle: `${user.mszCoinsBalance ?? 150} MSZ Coins • Boutique 3D`,
      icon: 'diamond',
      accentClass: 'text-[#ffe088] border-[#f2ca50]/35'
    },
    {
      id: 'leaderboard',
      title: 'Ligues & Distinctions',
      subtitle: `${unlockedBadges.length}/${badges.length} badges • Top hebdo`,
      icon: 'emoji_events',
      accentClass: 'text-amber-300 border-amber-500/35'
    }
  ];

  const completedMissionsCount = missionsState.missions.filter((m) => m.completed).length;

  return (
    <section
      aria-label="Tableau de Bord Adaptatif English Boost MSZ"
      className="mx-4 sm:mx-6 my-3 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/35 p-4 sm:p-5 space-y-5 shadow-xl"
    >
      {/* 1. Student Calibration Bar: School Grade (6e-Tle) + CEFR + Core KPIs */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[#232a3a]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50]">
                MOTEUR ADAPTATIF GLOBAL • COLLÈGE &amp; LYCÉE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#0c1322] border border-[#f2ca50]/35 text-[10px] font-mono font-bold text-sky-300">
                {assessment.multiSignal.compositeCefr} ({assessment.multiSignal.signalsCount} signaux · {assessment.multiSignal.confidenceScore}%)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${
                  assessment.dynamicDirective.mode === 'scaffolded'
                    ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                    : assessment.dynamicDirective.mode === 'accelerated'
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                    : 'bg-sky-500/15 border-sky-400/50 text-sky-200'
                }`}
              >
                {assessment.dynamicDirective.badgeLabel}
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] mt-0.5">
              Parcours Personnalisé ({assessment.gradeMeta.label} · {currentLevel})
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('eb_open_placement_modal'))}
              className="px-3 py-2 rounded-xl bg-[#0c1322] hover:bg-[#191f2f] border border-[#f2ca50]/50 text-[#f2ca50] font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Configurer classe, âge, objectifs et passer le test diagnostic 6 axes"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>{user.placementTest ? 'Diagnostic & Profil' : 'Test de Niveau (6 axes)'}</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunchModule('tutor')}
              className="px-3.5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">psychology</span>
              <span>Parler au Tuteur IA</span>
            </button>
          </div>
        </div>

        {/* School Grade Selector Pills (6e -> Terminale) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[10px] font-mono uppercase text-[#99907c] shrink-0 mr-1">Ma Classe :</span>
          {SCHOOL_GRADES_META.map((g) => {
            const isSelected = activeGrade === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectSchoolGrade(g.id, g.targetCefr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#ffe088]'
                    : 'bg-[#0c1322] text-[#d0c5af] border-[#2e3545] hover:border-[#f2ca50]/45'
                }`}
                title={g.focusSummary}
              >
                {g.shortLabel} ({g.targetCefr})
              </button>
            );
          })}
        </div>

        {/* 5 Crisp Metric Cells */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Objectif Quotidien</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-base font-bold font-mono text-[#f2ca50] tabular-nums">
                {dailyGoalMinutes}/{dailyGoalTarget}m
              </span>
              <span className="text-[10px] font-mono text-emerald-400">{dailyGoalPct}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-[#191f2f] mt-1.5 overflow-hidden">
              <div className="h-full bg-[#f2ca50]" style={{ width: `${dailyGoalPct}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Série Actuelle</span>
            <div className="text-base font-bold font-mono text-[#dce2f8] mt-0.5 tabular-nums">
              {user.stats?.streakDays ?? 0} jours
            </div>
            <span className="text-[10px] text-amber-300 font-mono">Régularité active</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Points XP & Niv.</span>
            <div className="text-base font-bold font-mono text-[#f2ca50] mt-0.5 tabular-nums">
              {(user.stats?.totalXp ?? 0).toLocaleString()} XP
            </div>
            <span className="text-[10px] text-[#d4c78f] font-mono">Niveau {academicLevel}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Progrès Hebdo</span>
            <div className="text-base font-bold font-mono text-sky-300 mt-0.5 tabular-nums">
              +{(user.stats?.weeklyXp ?? 0).toLocaleString()} XP
            </div>
            <span className="text-[10px] text-[#99907c] font-mono truncate block">{weeklyStandingLabel}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1322] border border-[#232a3a] col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Distinctions</span>
            <div className="text-base font-bold font-mono text-emerald-300 mt-0.5 tabular-nums">
              {unlockedBadges.length}/{badges.length}
            </div>
            <span className="text-[10px] text-[#99907c] font-mono">Badges acquis</span>
          </div>
        </div>

        {/* Balanced 4 Major Skills + Personal Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-2">
          {assessment.majorSkillBalances.map((m) => {
            const isWeak = assessment.profile.weakestSkills.includes(m.key);
            return (
              <div
                key={m.key}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-1 ${
                  isWeak
                    ? 'bg-amber-950/35 border-amber-500/45 text-amber-200'
                    : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af]'
                }`}
                title={`${m.labelFr} : ${m.score}%`}
              >
                <span className="flex items-center gap-1 truncate">
                  <span className="material-symbols-outlined text-xs text-[#f2ca50]">{m.icon}</span>
                  <span className="truncate">{m.labelFr.replace('Compréhension ', '').replace('Expression ', '')}</span>
                </span>
                <span className="font-mono font-bold tabular-nums">{m.score}%</span>
              </div>
            );
          })}

          <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322] border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
            <span className="truncate">Vitesse</span>
            <span className="font-mono font-bold text-sky-300">
              {assessment.learningSpeed === 'fast'
                ? 'Rapide'
                : assessment.learningSpeed === 'methodical'
                ? 'Posée'
                : 'Régulière'}
            </span>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322] border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
            <span className="truncate">Erreurs</span>
            <span className="font-mono font-bold text-rose-300 tabular-nums">{assessment.errorFrequency}%</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322] border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
            <span className="truncate">Rétention</span>
            <span className="font-mono font-bold text-emerald-300 tabular-nums">{assessment.vocabularyRetentionRate}%</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322] border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
            <span className="truncate">Équilibre</span>
            <span className="font-mono font-bold text-[#f2ca50] tabular-nums">{assessment.skillBalanceScore}%</span>
          </div>
        </div>
      </div>

      {/* 1B. Personalized 10-Minute Session & Dynamic Adaptation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Session 10 Minutes Quotidienne (4 Compétences Équilibrées) */}
        <div className="p-4 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">timer</span>
              <h3 className="font-serif font-bold text-sm text-[#dce2f8]">
                Session Recommandée 10 Min (Équilibre 4 Axes)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#191f2f] text-[#f2ca50] tabular-nums">
              {assessment.tenMinuteSession.filter((b) => completedTenMinIds.includes(b.id)).length}/4
            </span>
          </div>

          <div className="space-y-1.5">
            {assessment.tenMinuteSession.map((blk) => {
              const isDone = completedTenMinIds.includes(blk.id);
              return (
                <div
                  key={blk.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                    isDone ? 'bg-emerald-950/25 border-emerald-500/40' : 'bg-[#151b2b] border-[#2e3545]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTenMinBlockCompleted(blk.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-[#f2ca50]/55 text-transparent hover:border-[#f2ca50]'
                      }`}
                      aria-label={`Valider ${blk.title}`}
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#dce2f8] truncate">
                        {blk.order}. {blk.title}
                      </div>
                      <div className="text-[10px] text-[#99907c] truncate">
                        {blk.minutes} min · {blk.skillLabel} · {blk.difficultyTag}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleTenMinBlockCompleted(blk.id, true);
                      onLaunchModule(blk.actionTarget);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] font-bold text-[10px] font-mono shrink-0 cursor-pointer transition-colors"
                  >
                    Lancer →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adaptation Dynamique: Soutien Règle+Exemples OU Défi Excellence */}
        <div className="p-4 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col justify-between gap-2.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase text-[#f2ca50]">
                {assessment.dynamicDirective.mode === 'scaffolded'
                  ? 'Adaptation : Soutien & Règle Expliquée'
                  : assessment.dynamicDirective.mode === 'accelerated'
                  ? 'Adaptation : Défi Avancé & Vocabulaire Riche'
                  : 'Adaptation : Consolidation Guidée'}
              </span>
              <span className="text-[10px] font-mono text-[#d4c78f]">
                Cible : {assessment.dynamicDirective.targetCefrForExercises} · Audio {assessment.dynamicDirective.recommendedAudioRate}x
              </span>
            </div>

            <p className="text-xs text-[#d0c5af] leading-relaxed">
              {assessment.dynamicDirective.summaryFr}
            </p>

            <div className="p-2.5 rounded-xl bg-[#151b2b] border border-[#2e3545] space-y-1.5">
              <div className="text-[11px] font-semibold text-[#dce2f8]">
                {assessment.dynamicDirective.ruleExplanationFr}
              </div>
              {assessment.dynamicDirective.examplesEn.slice(0, 2).map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    speakText(ex, 'en-GB', `hub-dyn-ex-${idx}`, {
                      rate: assessment.dynamicDirective.recommendedAudioRate
                    })
                  }
                  className="w-full p-1.5 rounded-lg bg-[#0c1322] hover:border-[#f2ca50]/50 border border-[#232a3a] flex items-center justify-between gap-2 text-left text-[11px] italic text-[#ffe088] cursor-pointer"
                >
                  <span className="truncate">« {ex} »</span>
                  <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0">volume_up</span>
                </button>
              ))}
            </div>
          </div>

          {assessment.dynamicDirective.mode === 'accelerated' && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {assessment.dynamicDirective.advancedChallengeWords.map((w) => (
                <button
                  key={w.term}
                  type="button"
                  onClick={() => speakText(w.term, 'en-GB', `hub-stretch-${w.term}`)}
                  className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[10px] text-emerald-200 cursor-pointer"
                  title={w.frenchDef}
                >
                  <strong>{w.term}</strong> · {w.frenchDef}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Split Row: Daily Missions + Recommended Adaptive Lessons + Upcoming Vocabulary Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Missions */}
        <div className="p-4 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">target</span>
              <h3 className="font-serif font-bold text-sm text-[#dce2f8]">Missions du Jour</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#191f2f] text-[#f2ca50]">
              {completedMissionsCount}/{missionsState.missions.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {missionsState.missions.map((m) => {
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
              return (
                <div key={m.id} className="p-2.5 rounded-xl bg-[#151b2b] border border-[#2e3545] space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#dce2f8] truncate">{m.title}</span>
                    <span className="text-[10px] font-mono text-[#f2ca50] shrink-0">
                      +{m.xpReward} XP · +{m.coinsReward} MSZ
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${m.completed ? 'bg-emerald-400' : 'bg-[#f2ca50]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[10px] font-mono text-[#99907c] tabular-nums">
                      {m.progress}/{m.target} accompli
                    </span>
                    {m.claimed ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">✓ Réclamé</span>
                    ) : m.completed ? (
                      <button
                        type="button"
                        onClick={() => handleClaimMission(m.id)}
                        className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono cursor-pointer"
                      >
                        Réclamer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMissionLaunch(m.actionTarget)}
                        className="text-[10px] font-mono font-bold text-[#f2ca50] hover:underline cursor-pointer"
                      >
                        Lancer →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adaptive Recommended Lessons */}
        <div className="p-4 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-300 text-lg">auto_stories</span>
              <h3 className="font-serif font-bold text-sm text-[#dce2f8]">Leçons Recommandées</h3>
            </div>
            <span className="text-[10px] font-mono text-[#d4c78f]">
              Focus : {assessment.primaryFocusSkill.labelFr}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isLoadingTelemetry ? (
              <TelemetryListSkeleton key="hub-telemetry-skeleton" count={3} />
            ) : (
              <motion.div
                key="hub-telemetry-ready"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                {assessment.recommendedLessons.slice(0, 3).map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onOpenLesson(lesson)}
                    className="w-full p-2.5 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-[#2e3545] hover:border-[#f2ca50]/50 text-left flex items-center justify-between gap-2 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#f2ca50]">
                          {lesson.class_label} · {lesson.cefr_level}
                        </span>
                        <span className="text-[10px] text-[#99907c] truncate">{lesson.theme_label}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#dce2f8] group-hover:text-[#f2ca50] truncate mt-0.5">
                        {lesson.title}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-base text-[#f2ca50] shrink-0">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-[11px] text-[#99907c] pt-1 border-t border-[#191f2f]">
            Sélection adaptative parmi les 200 leçons selon votre classe ({assessment.gradeMeta.shortLabel}) et vos résultats récents.
          </div>
        </div>

        {/* Upcoming SM-2 Vocabulary Reviews */}
        <div className="p-4 rounded-xl bg-[#0c1322] border border-[#232a3a] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300 text-lg">style</span>
              <h3 className="font-serif font-bold text-sm text-[#dce2f8]">Révisions Vocabulaire</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 tabular-nums">
              {assessment.dueVocabularyCount} dues
            </span>
          </div>

          <div className="space-y-1.5">
            {assessment.upcomingWords.slice(0, 4).map((w) => (
              <div
                key={w.id}
                onClick={() => speakText(w.term, 'en-GB', `hub-word-${w.id}`)}
                className="p-2 rounded-lg bg-[#151b2b] border border-[#2e3545] hover:border-[#f2ca50]/45 flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#f2ca50] truncate">{w.term}</span>
                    <span className="text-[10px] font-mono text-sky-300">{w.phonetic}</span>
                  </div>
                  <span className="text-[11px] text-[#d0c5af] truncate block">{w.frenchDef}</span>
                </div>
                <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0">volume_up</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onLaunchModule('flashcards')}
            className="w-full py-2 rounded-xl bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] font-bold text-xs transition-colors cursor-pointer"
          >
            Lancer la Session SM-2 ({assessment.dueVocabularyCount} cartes)
          </button>
        </div>
      </div>

      {/* 3. 12-Pillar Interactive Ecosystem Matrix */}
      {!compactMode && (
        <div className="space-y-2.5 pt-2 border-t border-[#232a3a]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d4c78f]">
              ÉCOSYSTÈME COMPLET ENGLISH BOOST MSZ
            </span>
            <span className="text-[11px] text-[#99907c] font-mono">
              {assessment.profile.weakestSkills
                .map((sk: SkillKey) => SKILL_META[sk]?.labelFr)
                .join(' & ')}{' '}
              à prioriser
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {pillarTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => onLaunchModule(tile.id)}
                className={`p-3 rounded-xl bg-[#0c1322] hover:bg-[#191f2f] border ${tile.accentClass} text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="material-symbols-outlined text-xl">{tile.icon}</span>
                  {tile.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-[#191f2f] text-[9px] font-mono font-bold">
                      {tile.badge}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#dce2f8] group-hover:text-[#f2ca50] leading-tight">
                    {tile.title}
                  </div>
                  <div className="text-[10px] text-[#99907c] leading-snug mt-0.5 line-clamp-2">
                    {tile.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
