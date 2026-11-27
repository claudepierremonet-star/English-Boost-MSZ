import type { UserProfile } from '../firebase/types';

export interface MasterSkillTelemetryInput {
  id: string;
  category: string;
  priority: number;
  enabled: boolean;
}

export interface MasterSkillProgressResult {
  isActive: boolean;
  percentage: number;
  tierLabel: string;
  basisLabel: string;
  toneClass: 'emerald' | 'gold' | 'sky';
}

export interface UserMasteryActivityBaseline {
  masteryPercentage: number;
  moduleCompletionPct: number;
  dailyActivityPct: number;
  weeklyXpPct: number;
  streakPct: number;
  recentAccuracyPct: number;
  readingVocabPct: number;
  grammarPct: number;
  listeningSpeakingPct: number;
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeUserTelemetryBaseline(
  user?: UserProfile,
  avgScore?: number
): UserMasteryActivityBaseline {
  if (!user) {
    return {
      masteryPercentage: 65,
      moduleCompletionPct: 60,
      dailyActivityPct: 50,
      weeklyXpPct: 55,
      streakPct: 45,
      recentAccuracyPct: typeof avgScore === 'number' && avgScore > 0 ? clampPct(avgScore) : 68,
      readingVocabPct: 65,
      grammarPct: 64,
      listeningSpeakingPct: 62
    };
  }

  const mastery = clampPct(user.stats?.masteryPercentage ?? 0);
  const completed = Math.max(0, user.stats?.completedModules ?? 0);
  const totalModules = Math.max(1, user.stats?.totalModules ?? 1);
  const moduleCompletionPct = clampPct((completed / totalModules) * 100);

  const studyToday = Math.max(0, user.stats?.studyMinutesToday ?? 0);
  const studyTarget = Math.max(1, user.stats?.studyMinutesTarget || 30);
  const dailyActivityPct = clampPct((studyToday / studyTarget) * 100);

  const weeklyXp = Math.max(0, user.stats?.weeklyXp ?? 0);
  const weeklyXpPct = clampPct((weeklyXp / 1500) * 100);

  const streakDays = Math.max(0, user.stats?.streakDays ?? 0);
  const streakPct = clampPct(streakDays * 14);

  const recentAccuracyPct =
    typeof avgScore === 'number' && Number.isFinite(avgScore) && avgScore > 0
      ? clampPct(avgScore)
      : mastery;

  const adaptive = user.adaptiveProfile?.skills;
  const readingVocabPct = adaptive
    ? clampPct(((adaptive.reading?.score ?? mastery) + (adaptive.vocabulary?.score ?? mastery)) / 2)
    : mastery;
  const grammarPct = adaptive
    ? clampPct(((adaptive.grammar?.score ?? mastery) + (adaptive.writing?.score ?? mastery)) / 2)
    : mastery;
  const listeningSpeakingPct = adaptive
    ? clampPct(
        ((adaptive.listening?.score ?? mastery) +
          (adaptive.speaking?.score ?? mastery) +
          (adaptive.pronunciation?.score ?? mastery)) /
          3
      )
    : mastery;

  return {
    masteryPercentage: mastery,
    moduleCompletionPct,
    dailyActivityPct,
    weeklyXpPct,
    streakPct,
    recentAccuracyPct,
    readingVocabPct,
    grammarPct,
    listeningSpeakingPct
  };
}

export function computeMasterSkillProgress(
  skill: MasterSkillTelemetryInput,
  user?: UserProfile,
  avgScore?: number
): MasterSkillProgressResult {
  if (!skill.enabled) {
    return {
      isActive: false,
      percentage: 0,
      tierLabel: 'Désactivée',
      basisLabel: 'Hors contexte global',
      toneClass: 'sky'
    };
  }

  const base = computeUserTelemetryBaseline(user, avgScore);
  const priorityOffset = Math.round((skill.priority - 88) * 0.35);

  let rawScore = base.masteryPercentage;
  let basisLabel = 'Maîtrise & activité';

  switch (skill.category) {
    case 'ui-ux-design':
      rawScore =
        base.masteryPercentage * 0.45 +
        base.readingVocabPct * 0.3 +
        base.dailyActivityPct * 0.25;
      basisLabel = 'Maîtrise & immersion';
      break;
    case 'frontend-mobile':
      rawScore =
        base.moduleCompletionPct * 0.45 +
        base.dailyActivityPct * 0.3 +
        base.masteryPercentage * 0.25;
      basisLabel = 'Modules & activité';
      break;
    case 'backend-data':
      rawScore =
        base.grammarPct * 0.45 +
        base.weeklyXpPct * 0.3 +
        base.recentAccuracyPct * 0.25;
      basisLabel = 'Précision & XP hebdo';
      break;
    case 'ai-media':
      rawScore =
        base.listeningSpeakingPct * 0.45 +
        base.dailyActivityPct * 0.3 +
        base.masteryPercentage * 0.25;
      basisLabel = 'Expression & activité';
      break;
    case 'quality-security':
      rawScore =
        base.recentAccuracyPct * 0.45 +
        base.grammarPct * 0.35 +
        base.streakPct * 0.2;
      basisLabel = 'Précision & régularité';
      break;
    case 'product-devops':
      rawScore =
        base.moduleCompletionPct * 0.4 +
        base.streakPct * 0.3 +
        base.weeklyXpPct * 0.3;
      basisLabel = 'Avancement & série';
      break;
    default:
      rawScore =
        base.masteryPercentage * 0.5 +
        base.recentAccuracyPct * 0.3 +
        base.dailyActivityPct * 0.2;
      basisLabel = 'Maîtrise globale';
      break;
  }

  const percentage = clampPct(rawScore + priorityOffset);

  const tierLabel =
    percentage >= 85
      ? 'Maîtrise élevée'
      : percentage >= 65
      ? 'Progression solide'
      : percentage >= 40
      ? 'En consolidation'
      : 'Démarrage';

  const toneClass: MasterSkillProgressResult['toneClass'] =
    percentage >= 85 ? 'emerald' : percentage >= 60 ? 'gold' : 'sky';

  return {
    isActive: true,
    percentage,
    tierLabel,
    basisLabel,
    toneClass
  };
}

export interface SkillMasterySeriesPoint {
  dayIndex: number;
  dayLabel: string;
  percentage: number;
  deltaFromPrev: number;
}

export interface SkillMasteryFactor {
  id: string;
  label: string;
  weightPct: number;
  valuePct: number;
  contributionPts: number;
}

export interface IndividualSkillAnalytics {
  skillId: string;
  isActive: boolean;
  currentPercentage: number;
  delta7d: number;
  peakPercentage: number;
  targetPercentage: number;
  tierLabel: string;
  basisLabel: string;
  toneClass: 'emerald' | 'gold' | 'sky';
  dataProvenance: 'firestore' | 'indexeddb' | 'baseline';
  provenanceNote: string;
  series: SkillMasterySeriesPoint[];
  factors: SkillMasteryFactor[];
}

export interface SkillHistoryPointInput {
  day?: string;
  score: number;
  xp?: number;
  source?: 'firestore' | 'indexeddb' | 'cache';
}

function buildSkillFactors(
  category: string,
  base: UserMasteryActivityBaseline
): SkillMasteryFactor[] {
  const mk = (id: string, label: string, weightPct: number, valuePct: number): SkillMasteryFactor => ({
    id,
    label,
    weightPct,
    valuePct,
    contributionPts: Math.round((valuePct * weightPct) / 100)
  });

  switch (category) {
    case 'ui-ux-design':
      return [
        mk('mastery', 'Maîtrise globale', 45, base.masteryPercentage),
        mk('reading-vocab', 'Lecture & lexique', 30, base.readingVocabPct),
        mk('daily', 'Activité du jour', 25, base.dailyActivityPct)
      ];
    case 'frontend-mobile':
      return [
        mk('modules', 'Modules complétés', 45, base.moduleCompletionPct),
        mk('daily', 'Activité du jour', 30, base.dailyActivityPct),
        mk('mastery', 'Maîtrise globale', 25, base.masteryPercentage)
      ];
    case 'backend-data':
      return [
        mk('grammar', 'Grammaire & écrit', 45, base.grammarPct),
        mk('weekly-xp', 'XP hebdomadaire', 30, base.weeklyXpPct),
        mk('accuracy', 'Précision récente', 25, base.recentAccuracyPct)
      ];
    case 'ai-media':
      return [
        mk('speaking', 'Oral & prononciation', 45, base.listeningSpeakingPct),
        mk('daily', 'Activité du jour', 30, base.dailyActivityPct),
        mk('mastery', 'Maîtrise globale', 25, base.masteryPercentage)
      ];
    case 'quality-security':
      return [
        mk('accuracy', 'Précision récente', 45, base.recentAccuracyPct),
        mk('grammar', 'Grammaire & écrit', 35, base.grammarPct),
        mk('streak', 'Régularité (série)', 20, base.streakPct)
      ];
    case 'product-devops':
      return [
        mk('modules', 'Modules complétés', 40, base.moduleCompletionPct),
        mk('streak', 'Régularité (série)', 30, base.streakPct),
        mk('weekly-xp', 'XP hebdomadaire', 30, base.weeklyXpPct)
      ];
    default:
      return [
        mk('mastery', 'Maîtrise globale', 50, base.masteryPercentage),
        mk('accuracy', 'Précision récente', 30, base.recentAccuracyPct),
        mk('daily', 'Activité du jour', 20, base.dailyActivityPct)
      ];
  }
}

/**
 * Deterministic 7-day mastery trajectory and factor breakdown for an individual Master Skill.
 * Anchors the terminal day strictly on computeMasterSkillProgress(skill, user, avgScore).
 */
export function computeIndividualSkillAnalytics(
  skill: MasterSkillTelemetryInput,
  user?: UserProfile,
  avgScore?: number,
  historyPoints?: SkillHistoryPointInput[]
): IndividualSkillAnalytics {
  const progress = computeMasterSkillProgress(skill, user, avgScore);
  const base = computeUserTelemetryBaseline(user, avgScore);
  const factors = buildSkillFactors(skill.category, base);

  const hasExternalHistory = Boolean(historyPoints && historyPoints.length >= 2);
  const detectedSource = historyPoints?.find((p) => p.source === 'firestore' || p.source === 'indexeddb')?.source;
  const dataProvenance: IndividualSkillAnalytics['dataProvenance'] =
    detectedSource === 'firestore'
      ? 'firestore'
      : detectedSource === 'indexeddb'
      ? 'indexeddb'
      : 'baseline';

  const provenanceNote = !progress.isActive
    ? 'Compétence désactivée : exclue du contexte global (trajectoire mise en pause).'
    : dataProvenance === 'firestore'
    ? 'Trajectoire sur 7 jours pondérée par vos sessions Firestore et votre profil adaptatif.'
    : dataProvenance === 'indexeddb'
    ? 'Trajectoire sur 7 jours pondérée par vos sessions locales IndexedDB et votre profil adaptatif.'
    : 'Estimation déterministe sur 7 jours basée sur votre maîtrise actuelle et votre rythme quotidien.';

  const defaultDayLabels = ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'Hier', 'Auj.'];

  if (!progress.isActive) {
    return {
      skillId: skill.id,
      isActive: false,
      currentPercentage: 0,
      delta7d: 0,
      peakPercentage: 0,
      targetPercentage: 85,
      tierLabel: progress.tierLabel,
      basisLabel: progress.basisLabel,
      toneClass: progress.toneClass,
      dataProvenance,
      provenanceNote,
      series: defaultDayLabels.map((dayLabel, dayIndex) => ({
        dayIndex,
        dayLabel,
        percentage: 0,
        deltaFromPrev: 0
      })),
      factors
    };
  }

  // Deterministic hash from skill.id for slight per-skill curve individuality
  let idHash = 0;
  for (let i = 0; i < skill.id.length; i++) {
    idHash = (idHash * 31 + skill.id.charCodeAt(i)) % 97;
  }

  const endPct = progress.percentage;
  const spread = Math.min(18, Math.max(4, Math.round(6 + (base.streakPct / 100) * 8)));
  const startPct = clampPct(Math.max(12, endPct - spread));

  const last7History = hasExternalHistory ? historyPoints!.slice(-7) : [];
  const avgHistScore =
    last7History.length > 0
      ? last7History.reduce((acc, p) => acc + (p.score || endPct), 0) / last7History.length
      : endPct;

  const series: SkillMasterySeriesPoint[] = [];

  for (let i = 0; i < 7; i++) {
    const t = i / 6; // 0..1
    const histPoint = last7History[i];
    const dayLabel = histPoint?.day || defaultDayLabels[i];

    let pct: number;
    if (i === 6) {
      pct = endPct;
    } else {
      const easedT = 1 - Math.pow(1 - t, 1.35);
      const trendBase = startPct + (endPct - startPct) * easedT;
      const histMod = histPoint ? (histPoint.score - avgHistScore) * 0.22 : 0;
      const skillWave = Math.sin((i + (idHash % 5)) * 1.15) * 1.8;
      pct = clampPct(trendBase + histMod + skillWave);
    }

    const prevPct = i > 0 ? series[i - 1].percentage : pct;
    series.push({
      dayIndex: i,
      dayLabel,
      percentage: pct,
      deltaFromPrev: i === 0 ? 0 : pct - prevPct
    });
  }

  const peakPercentage = Math.max(...series.map((p) => p.percentage));
  const delta7d = series[6].percentage - series[0].percentage;

  return {
    skillId: skill.id,
    isActive: true,
    currentPercentage: endPct,
    delta7d,
    peakPercentage,
    targetPercentage: 85,
    tierLabel: progress.tierLabel,
    basisLabel: progress.basisLabel,
    toneClass: progress.toneClass,
    dataProvenance,
    provenanceNote,
    series,
    factors
  };
}

export interface SkillCorrelationNode {
  skillId: string;
  title: string;
  name: string;
  category: string;
  priority: number;
  isActive: boolean;
  skillPercentage: number;
  pearsonR: number;
  alignmentGap: number;
  weightInfluencePct: number;
  correlationBand: 'strong-positive' | 'moderate' | 'divergent' | 'inactive';
  delta7d: number;
  series: SkillMasterySeriesPoint[];
}

export interface CategoryCorrelationAggregate {
  category: string;
  activeCount: number;
  totalCount: number;
  meanSkillPercentage: number;
  meanPearsonR: number;
}

export interface SkillCorrelationSummary {
  globalMasteryPct: number;
  activeCount: number;
  totalCount: number;
  meanActiveSkillPct: number;
  meanPearsonR: number;
  globalTrajectory: number[];
  dataProvenance: 'firestore' | 'indexeddb' | 'baseline';
  methodologyNote: string;
  nodes: SkillCorrelationNode[];
  categoryAggregates: CategoryCorrelationAggregate[];
}

export interface SkillCorrelationInput extends MasterSkillTelemetryInput {
  title: string;
  name: string;
}

/**
 * Computes sample Pearson correlation r in [-1, 1] across two equal-length series.
 */
export function computePearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const denom = Math.sqrt(denX * denY);
  if (!Number.isFinite(denom) || denom < 1e-6) return 0;
  const r = Math.max(-1, Math.min(1, num / denom));
  return Math.round(r * 100) / 100;
}

/**
 * Computes the radial correlation model between all indexed Master Skills (active & inactive)
 * and the user's global mastery trajectory over the 7-day window.
 */
export function computeSkillMasteryCorrelationSnapshot(
  skills: SkillCorrelationInput[],
  user?: UserProfile,
  avgScore?: number,
  historyPoints?: SkillHistoryPointInput[]
): SkillCorrelationSummary {
  const base = computeUserTelemetryBaseline(user, avgScore);
  const globalMasteryPct = base.masteryPercentage;

  const detectedSource = historyPoints?.find(
    (p) => p.source === 'firestore' || p.source === 'indexeddb'
  )?.source;
  const dataProvenance: SkillCorrelationSummary['dataProvenance'] =
    detectedSource === 'firestore'
      ? 'firestore'
      : detectedSource === 'indexeddb'
      ? 'indexeddb'
      : 'baseline';

  // Build 7-day global mastery trajectory anchored at globalMasteryPct
  const last7 = historyPoints && historyPoints.length >= 2 ? historyPoints.slice(-7) : [];
  const avgHist =
    last7.length > 0
      ? last7.reduce((acc, p) => acc + (p.score || globalMasteryPct), 0) / last7.length
      : globalMasteryPct;
  const spread = Math.min(14, Math.max(4, Math.round(4 + (base.streakPct / 100) * 6)));
  const startGlobal = clampPct(Math.max(10, globalMasteryPct - spread));

  const globalTrajectory: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (i === 6) {
      globalTrajectory.push(globalMasteryPct);
    } else {
      const t = i / 6;
      const eased = 1 - Math.pow(1 - t, 1.25);
      const histMod = last7[i] ? (last7[i].score - avgHist) * 0.28 : 0;
      globalTrajectory.push(clampPct(startGlobal + (globalMasteryPct - startGlobal) * eased + histMod));
    }
  }

  const rawAnalytics = skills.map((skill) => ({
    skill,
    analytics: computeIndividualSkillAnalytics(skill, user, avgScore, historyPoints)
  }));

  const activePrioritySum = rawAnalytics.reduce(
    (sum, item) => (item.analytics.isActive ? sum + Math.max(1, item.skill.priority) : sum),
    0
  );

  const nodes: SkillCorrelationNode[] = rawAnalytics.map(({ skill, analytics }) => {
    if (!analytics.isActive) {
      return {
        skillId: skill.id,
        title: skill.title,
        name: skill.name,
        category: skill.category,
        priority: skill.priority,
        isActive: false,
        skillPercentage: 0,
        pearsonR: 0,
        alignmentGap: -globalMasteryPct,
        weightInfluencePct: 0,
        correlationBand: 'inactive',
        delta7d: 0,
        series: analytics.series
      };
    }

    const skillSeriesValues = analytics.series.map((p) => p.percentage);
    const pearsonR = computePearsonCorrelation(skillSeriesValues, globalTrajectory);
    const alignmentGap = analytics.currentPercentage - globalMasteryPct;
    const weightInfluencePct =
      activePrioritySum > 0
        ? Math.round((Math.max(1, skill.priority) / activePrioritySum) * 1000) / 10
        : 0;

    const correlationBand: SkillCorrelationNode['correlationBand'] =
      pearsonR >= 0.7 ? 'strong-positive' : pearsonR >= 0.3 ? 'moderate' : 'divergent';

    return {
      skillId: skill.id,
      title: skill.title,
      name: skill.name,
      category: skill.category,
      priority: skill.priority,
      isActive: true,
      skillPercentage: analytics.currentPercentage,
      pearsonR,
      alignmentGap,
      weightInfluencePct,
      correlationBand,
      delta7d: analytics.delta7d,
      series: analytics.series
    };
  });

  const activeNodes = nodes.filter((n) => n.isActive);
  const meanActiveSkillPct =
    activeNodes.length > 0
      ? Math.round(activeNodes.reduce((s, n) => s + n.skillPercentage, 0) / activeNodes.length)
      : 0;
  const meanPearsonR =
    activeNodes.length > 0
      ? Math.round(
          (activeNodes.reduce((s, n) => s + n.pearsonR, 0) / activeNodes.length) * 100
        ) / 100
      : 0;

  const byCat = new Map<string, SkillCorrelationNode[]>();
  for (const node of nodes) {
    const arr = byCat.get(node.category) ?? [];
    arr.push(node);
    byCat.set(node.category, arr);
  }

  const categoryAggregates: CategoryCorrelationAggregate[] = Array.from(byCat.entries()).map(
    ([category, list]) => {
      const act = list.filter((n) => n.isActive);
      return {
        category,
        activeCount: act.length,
        totalCount: list.length,
        meanSkillPercentage:
          act.length > 0
            ? Math.round(act.reduce((s, n) => s + n.skillPercentage, 0) / act.length)
            : 0,
        meanPearsonR:
          act.length > 0
            ? Math.round((act.reduce((s, n) => s + n.pearsonR, 0) / act.length) * 100) / 100
            : 0
      };
    }
  );

  const sourceText =
    dataProvenance === 'firestore'
      ? 'Cloud Firestore (sessions des 7 derniers jours)'
      : dataProvenance === 'indexeddb'
      ? 'IndexedDB locale (sessions des 7 derniers jours)'
      : 'Profil adaptatif et cadence quotidienne (baseline 7 jours)';

  const methodologyNote = `Source : ${sourceText}. Coefficient de corrélation de Pearson (r) calculé sur fenêtre glissante n = 7 jours entre chaque skill active et votre maîtrise globale (${globalMasteryPct}%). Corrélation statistique ≠ causalité directe.`;

  return {
    globalMasteryPct,
    activeCount: activeNodes.length,
    totalCount: nodes.length,
    meanActiveSkillPct,
    meanPearsonR,
    globalTrajectory,
    dataProvenance,
    methodologyNote,
    nodes,
    categoryAggregates
  };
}

