import type {
  CEFRLevel,
  DailyMissionCategory,
  DailyMissionItem,
  DailyMissionsState,
  SchoolGrade,
  SkillKey
} from '../firebase/types';
import { awardMszCoins } from './mszCoinsManager';

const DAILY_MISSIONS_STORAGE_KEY = 'eb_msz_daily_missions_v1';
export const DAILY_MISSIONS_UPDATED_EVENT = 'eb_daily_missions_updated';

function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

function buildMissionsForDay(
  dateKey: string,
  schoolGrade: SchoolGrade,
  cefrLevel: CEFRLevel,
  weakestSkill: SkillKey
): DailyMissionItem[] {
  const gradeLabel = schoolGrade === 'terminale' ? 'Tle' : schoolGrade;

  // Deterministic second mission matched to weakest skill
  const weakMissionBySkill: Record<SkillKey, DailyMissionItem> = {
    grammar: {
      id: `dm-${dateKey}-grammar`,
      category: 'grammar',
      title: `Duel Grammar Battle (${gradeLabel} • ${cefrLevel})`,
      description: 'Remportez 1 session de Grammar Battle pour renforcer votre précision syntaxique.',
      target: 1,
      progress: 0,
      xpReward: 40,
      coinsReward: 25,
      completed: false,
      claimed: false,
      actionTarget: 'grammar_battle'
    },
    listening: {
      id: `dm-${dateKey}-listening`,
      category: 'listening',
      title: `Séance Listening Cinema (${cefrLevel})`,
      description: 'Visionnez et validez 1 épisode audio interactif sans faute.',
      target: 1,
      progress: 0,
      xpReward: 45,
      coinsReward: 30,
      completed: false,
      claimed: false,
      actionTarget: 'listening_cinema'
    },
    reading: {
      id: `dm-${dateKey}-reading`,
      category: 'reading',
      title: `Énigme Escape Room (${gradeLabel})`,
      description: 'Résolvez une salle ou un cadenas narratif dans English Escape Room.',
      target: 1,
      progress: 0,
      xpReward: 50,
      coinsReward: 35,
      completed: false,
      claimed: false,
      actionTarget: 'escape_room'
    },
    writing: {
      id: `dm-${dateKey}-writing`,
      category: 'tutor',
      title: `Coach d'Écriture IA (${cefrLevel})`,
      description: 'Faites analyser un paragraphe ou posez une question au Tuteur IA.',
      target: 1,
      progress: 0,
      xpReward: 45,
      coinsReward: 30,
      completed: false,
      claimed: false,
      actionTarget: 'tutor'
    },
    speaking: {
      id: `dm-${dateKey}-speaking`,
      category: 'speaking',
      title: 'Simulateur de Conversation Réelle',
      description: 'Complétez 1 dialogue guidé ou session d’élocution active.',
      target: 1,
      progress: 0,
      xpReward: 45,
      coinsReward: 25,
      completed: false,
      claimed: false,
      actionTarget: 'dialogues'
    },
    pronunciation: {
      id: `dm-${dateKey}-pronunciation`,
      category: 'speaking',
      title: 'Studio d’Élocution UK / US',
      description: 'Enregistrez votre voix et comparez votre onde acoustique native.',
      target: 1,
      progress: 0,
      xpReward: 45,
      coinsReward: 30,
      completed: false,
      claimed: false,
      actionTarget: 'speaking'
    },
    vocabulary: {
      id: `dm-${dateKey}-vocab-boost`,
      category: 'reading',
      title: `Exploration & Énigme (${gradeLabel})`,
      description: 'Complétez un épisode Listening Cinema ou Escape Room.',
      target: 1,
      progress: 0,
      xpReward: 45,
      coinsReward: 30,
      completed: false,
      claimed: false,
      actionTarget: 'escape_room'
    }
  };

  return [
    {
      id: `dm-${dateKey}-vocab-sm2`,
      category: 'vocabulary',
      title: 'Mémoire Active SM-2 (5 cartes)',
      description: 'Révisez 5 cartes de vocabulaire ciblées pour consolider la rétention.',
      target: 5,
      progress: 0,
      xpReward: 30,
      coinsReward: 20,
      completed: false,
      claimed: false,
      actionTarget: 'flashcards'
    },
    weakMissionBySkill[weakestSkill] || weakMissionBySkill.grammar,
    {
      id: `dm-${dateKey}-immersion-cinema`,
      category: 'listening',
      title: 'Immersion Cinéma ou Tuteur IA',
      description: 'Explorez 1 épisode Listening Cinema ou échangez avec le Tuteur IA.',
      target: 1,
      progress: 0,
      xpReward: 35,
      coinsReward: 25,
      completed: false,
      claimed: false,
      actionTarget: weakestSkill === 'listening' ? 'tutor' : 'listening_cinema'
    }
  ];
}

export function getDailyMissionsState(
  schoolGrade: SchoolGrade = '2nde',
  cefrLevel: CEFRLevel = 'B1',
  weakestSkill: SkillKey = 'grammar',
  cloudState?: DailyMissionsState
): DailyMissionsState {
  const today = getTodayDateKey();

  try {
    const raw = localStorage.getItem(DAILY_MISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyMissionsState;
      if (parsed && parsed.dateKey === today && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage read error
  }

  if (cloudState && cloudState.dateKey === today && Array.isArray(cloudState.missions) && cloudState.missions.length > 0) {
    saveDailyMissionsLocally(cloudState);
    return cloudState;
  }

  const fresh: DailyMissionsState = {
    dateKey: today,
    missions: buildMissionsForDay(today, schoolGrade, cefrLevel, weakestSkill),
    streakProtected: false,
    updatedAt: new Date().toISOString()
  };
  saveDailyMissionsLocally(fresh);
  return fresh;
}

export function saveDailyMissionsLocally(state: DailyMissionsState): void {
  try {
    localStorage.setItem(DAILY_MISSIONS_STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DAILY_MISSIONS_UPDATED_EVENT, { detail: state }));
    }
  } catch {
    // ignore
  }
}

export function recordDailyMissionActivity(
  categories: DailyMissionCategory | DailyMissionCategory[],
  incrementBy: number = 1,
  schoolGrade: SchoolGrade = '2nde',
  cefrLevel: CEFRLevel = 'B1',
  weakestSkill: SkillKey = 'grammar'
): DailyMissionsState {
  const catList = Array.isArray(categories) ? categories : [categories];
  const current = getDailyMissionsState(schoolGrade, cefrLevel, weakestSkill);
  let changed = false;

  const updatedMissions = current.missions.map((m) => {
    if (!catList.includes(m.category) || m.completed) return m;
    const nextProgress = Math.min(m.target, m.progress + incrementBy);
    const nowCompleted = nextProgress >= m.target;
    if (nextProgress !== m.progress || nowCompleted !== m.completed) {
      changed = true;
    }
    return {
      ...m,
      progress: nextProgress,
      completed: nowCompleted
    };
  });

  if (!changed) return current;

  const nextState: DailyMissionsState = {
    ...current,
    missions: updatedMissions,
    streakProtected: updatedMissions.every((m) => m.completed),
    updatedAt: new Date().toISOString()
  };

  saveDailyMissionsLocally(nextState);
  return nextState;
}

export function claimDailyMissionReward(
  missionId: string
): { state: DailyMissionsState; xpAwarded: number; coinsAwarded: number } | null {
  const current = getDailyMissionsState();
  const targetMission = current.missions.find((m) => m.id === missionId);
  if (!targetMission || !targetMission.completed || targetMission.claimed) {
    return null;
  }

  awardMszCoins(
    'daily_challenge',
    targetMission.id,
    targetMission.coinsReward,
    50,
    `Mission : ${targetMission.title}`
  );

  const updatedMissions = current.missions.map((m) =>
    m.id === missionId ? { ...m, claimed: true } : m
  );

  const nextState: DailyMissionsState = {
    ...current,
    missions: updatedMissions,
    streakProtected: updatedMissions.every((m) => m.completed),
    updatedAt: new Date().toISOString()
  };

  saveDailyMissionsLocally(nextState);
  return {
    state: nextState,
    xpAwarded: targetMission.xpReward,
    coinsAwarded: targetMission.coinsReward
  };
}
