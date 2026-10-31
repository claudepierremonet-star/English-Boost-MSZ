import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile, CEFRLevel, LeaderboardEntry, LeagueTier } from '../firebase/types';
import { fetchWeeklyLeaderboard, sendPeerCheer } from '../firebase/client';
import {
  ALL_200_LESSONS,
  getCurriculumLessonById,
  SCHOOL_LEVELS_DATA,
  type SchoolLesson,
  type SchoolGrade
} from '../data/curriculum';
import { LessonDetailModal } from './LessonDetailModal';
import confetti from 'canvas-confetti';

interface LeaderboardViewProps {
  user: UserProfile;
  onNavigateToGames?: () => void;
  onNavigateToPractice?: () => void;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  level: string;
  score: number;
  xpEarned: number;
  completedAt?: string;
  status: 'completed' | 'in_progress' | 'invited';
  cheerCount: number;
  isCurrentUser?: boolean;
}

export interface GroupChallenge {
  id: string;
  name: string;
  privateCode: string;
  description: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  deadlineDate: string;
  targetLessonId: string;
  targetLessonTitle: string;
  targetLessonTitleEn: string;
  targetLessonGrade: string;
  targetLessonTheme: string;
  targetLessonCefr: string;
  targetLessonIcon: string;
  members: GroupMember[];
}

const STORAGE_GROUPS_KEY = 'eb_msz_group_challenges';

const DEFAULT_GROUPS: GroupChallenge[] = [
  {
    id: 'grp-oxford-debate',
    name: 'Oxford Debating Society',
    privateCode: 'OXF-9421',
    description:
      'Défi de rhétorique et négociation internationale sur la leçon de Terminale. Objectif : 100% au Quiz et dictée sans faute.',
    createdBy: 'lady_eleanor_vance',
    creatorName: 'Lady Eleanor Vance',
    createdAt: '2026-10-25',
    deadlineDate: '2026-11-05',
    targetLessonId: 'ter-work-1',
    targetLessonTitle: 'Négociations Internationales & Diplomatie',
    targetLessonTitleEn: 'International Negotiations & Corporate Diplomacy',
    targetLessonGrade: 'terminale',
    targetLessonTheme: 'Monde du Travail',
    targetLessonCefr: 'B2',
    targetLessonIcon: 'work',
    members: [
      {
        uid: 'lady_eleanor_vance',
        displayName: 'Lady Eleanor Vance',
        photoURL:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        level: 'C1',
        score: 96,
        xpEarned: 480,
        completedAt: 'Hier, 18:20',
        status: 'completed',
        cheerCount: 7
      },
      {
        uid: 'lord_chesterfield_scholar',
        displayName: 'Lord Chesterfield Scholar',
        photoURL:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-j7VL5y1DulQO0ZUCmnVFKLzFgtqJ6ouE2w9tmtLT3GVTZ_f2HPrOXW27YcfNEv8XdaJBOR-xtCBTw965W8fuNDTngB1zPJOHyM4UEWMFLgliMGJq6IIA71cgZEZSfEarfPuCe6iC30vMqY3q7oyRonk89ZQ92-zclRrEwZWtP5qiv_HZvOnkMcB32962jQBrwbJAe0qa8CYPLZB8qH35jyDTntTaFWJh6C8_OVoDa8wDvwlgBHr',
        level: 'C1',
        score: 92,
        xpEarned: 450,
        completedAt: "Aujourd'hui, 10:15",
        status: 'completed',
        cheerCount: 12,
        isCurrentUser: true
      },
      {
        uid: 'arthur_pendelton',
        displayName: 'Arthur Pendelton',
        photoURL:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        level: 'B2',
        score: 85,
        xpEarned: 380,
        completedAt: 'Il y a 2 jours',
        status: 'completed',
        cheerCount: 4
      },
      {
        uid: 'clara_dupont',
        displayName: 'Clara Dupont',
        photoURL:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        level: 'B2',
        score: 78,
        xpEarned: 310,
        completedAt: 'Il y a 3 jours',
        status: 'in_progress',
        cheerCount: 2
      }
    ]
  },
  {
    id: 'grp-cambridge-exploration',
    name: 'Club Première B1-B2 • Grandes Découvertes',
    privateCode: 'CAM-3814',
    description:
      'Sprint sur la leçon des voyages et expéditions. Visez le sans-faute sur le prétérit et les modaux passés.',
    createdBy: 'julien_moreau',
    creatorName: 'Julien Moreau',
    createdAt: '2026-10-27',
    deadlineDate: '2026-11-08',
    targetLessonId: '1re-travel-1',
    targetLessonTitle: 'Récits de Voyages & Grandes Découvertes',
    targetLessonTitleEn: 'Travel Chronicles & The Age of Discovery',
    targetLessonGrade: '1re',
    targetLessonTheme: 'Voyages',
    targetLessonCefr: 'B1',
    targetLessonIcon: 'flight_takeoff',
    members: [
      {
        uid: 'lord_chesterfield_scholar',
        displayName: 'Lord Chesterfield Scholar',
        photoURL:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-j7VL5y1DulQO0ZUCmnVFKLzFgtqJ6ouE2w9tmtLT3GVTZ_f2HPrOXW27YcfNEv8XdaJBOR-xtCBTw965W8fuNDTngB1zPJOHyM4UEWMFLgliMGJq6IIA71cgZEZSfEarfPuCe6iC30vMqY3q7oyRonk89ZQ92-zclRrEwZWtP5qiv_HZvOnkMcB32962jQBrwbJAe0qa8CYPLZB8qH35jyDTntTaFWJh6C8_OVoDa8wDvwlgBHr',
        level: 'C1',
        score: 95,
        xpEarned: 420,
        completedAt: 'Hier, 15:30',
        status: 'completed',
        cheerCount: 9,
        isCurrentUser: true
      },
      {
        uid: 'julien_moreau',
        displayName: 'Julien Moreau',
        photoURL:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        level: 'B1',
        score: 88,
        xpEarned: 360,
        completedAt: 'Il y a 1 jour',
        status: 'completed',
        cheerCount: 5
      },
      {
        uid: 'sarah_jenkins',
        displayName: 'Sarah Jenkins',
        photoURL:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        level: 'B2',
        score: 82,
        xpEarned: 330,
        completedAt: 'Il y a 2 jours',
        status: 'completed',
        cheerCount: 3
      }
    ]
  },
  {
    id: 'grp-daily-champions',
    name: 'Sprint 6e • Daily Life Champions',
    privateCode: 'BST-6012',
    description:
      'Challenge amical de rentrée sur la leçon de la routine quotidienne. Parfait pour réviser le présent simple et les heures.',
    createdBy: 'lord_chesterfield_scholar',
    creatorName: 'Lord Chesterfield Scholar (Vous)',
    createdAt: '2026-10-28',
    deadlineDate: '2026-11-10',
    targetLessonId: '6e-daily_life-1',
    targetLessonTitle: 'Ma journée typique et les heures',
    targetLessonTitleEn: 'My Daily Routine & Telling the Time',
    targetLessonGrade: '6e',
    targetLessonTheme: 'Vie quotidienne',
    targetLessonCefr: 'A1',
    targetLessonIcon: 'schedule',
    members: [
      {
        uid: 'lord_chesterfield_scholar',
        displayName: 'Lord Chesterfield Scholar',
        photoURL:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-j7VL5y1DulQO0ZUCmnVFKLzFgtqJ6ouE2w9tmtLT3GVTZ_f2HPrOXW27YcfNEv8XdaJBOR-xtCBTw965W8fuNDTngB1zPJOHyM4UEWMFLgliMGJq6IIA71cgZEZSfEarfPuCe6iC30vMqY3q7oyRonk89ZQ92-zclRrEwZWtP5qiv_HZvOnkMcB32962jQBrwbJAe0qa8CYPLZB8qH35jyDTntTaFWJh6C8_OVoDa8wDvwlgBHr',
        level: 'C1',
        score: 100,
        xpEarned: 500,
        completedAt: "Aujourd'hui, 09:00",
        status: 'completed',
        cheerCount: 15,
        isCurrentUser: true
      },
      {
        uid: 'maxime_blanc',
        displayName: 'Maxime Blanc',
        photoURL:
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        level: 'A1',
        score: 90,
        xpEarned: 400,
        completedAt: 'Hier, 17:00',
        status: 'completed',
        cheerCount: 6
      },
      {
        uid: 'leila_hadid',
        displayName: 'Leïla Hadid',
        photoURL:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        level: 'A1',
        score: 85,
        xpEarned: 350,
        completedAt: 'Hier, 19:20',
        status: 'in_progress',
        cheerCount: 4
      }
    ]
  }
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  onNavigateToGames,
  onNavigateToPractice
}) => {
  // Navigation: Main Tab (Global Weekly Leaderboard vs Private Group Challenges)
  const [viewSection, setViewSection] = useState<'global' | 'groups'>('global');

  // Global Leaderboard State
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metricFilter, setMetricFilter] = useState<'weekly' | 'total'>('weekly');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');
  const [cheeredUids, setCheeredUids] = useState<Record<string, boolean>>({});
  const [recentCheerAnimation, setRecentCheerAnimation] = useState<string | null>(null);

  // Group Challenges State with LocalStorage persistence
  const [groups, setGroups] = useState<GroupChallenge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GROUPS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_GROUPS;
  });

  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => DEFAULT_GROUPS[0].id);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Interactive Target Lesson Modal
  const [activeLessonForModal, setActiveLessonForModal] = useState<SchoolLesson | null>(null);

  // Form State for creating a new private group
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [newGroupGrade, setNewGroupGrade] = useState<SchoolGrade>('terminale');
  const [newGroupLessonId, setNewGroupLessonId] = useState<string>('');

  // Time remaining until Sunday 23:59:59 UTC
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Save groups to localStorage
  const saveGroups = (updated: GroupChallenge[]) => {
    setGroups(updated);
    try {
      localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Lessons available for the selected grade when creating a group
  const availableLessonsForCreation = useMemo(() => {
    return ALL_200_LESSONS.filter((l) => l.class_level === newGroupGrade);
  }, [newGroupGrade]);

  // Set default lesson when grade changes
  useEffect(() => {
    if (availableLessonsForCreation.length > 0) {
      setNewGroupLessonId(availableLessonsForCreation[0].id);
    }
  }, [availableLessonsForCreation]);

  // Calculate live countdown to Sunday midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      const dayOfWeek = now.getUTCDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
      nextSunday.setUTCHours(23, 59, 59, 999);

      const diff = Math.max(0, nextSunday.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch leaderboard data
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await fetchWeeklyLeaderboard(user, metricFilter);
      setEntries(data);
    } catch (err) {
      console.error('Erreur chargement classement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [metricFilter, user.stats.weeklyXp, user.stats.totalXp]);

  // Handle cheer interaction in Global
  const handleCheer = async (entry: LeaderboardEntry) => {
    if (cheeredUids[entry.uid]) return;
    setCheeredUids((prev) => ({ ...prev, [entry.uid]: true }));
    setRecentCheerAnimation(entry.uid);
    setTimeout(() => setRecentCheerAnimation(null), 1200);

    const newCount = await sendPeerCheer(entry.uid);
    setEntries((prev) =>
      prev.map((e) => (e.uid === entry.uid ? { ...e, cheerCount: newCount } : e))
    );
  };

  // Filter global entries
  const filteredEntries = useMemo(() => {
    if (levelFilter === 'ALL') return entries;
    return entries.filter((e) => e.level === levelFilter);
  }, [entries, levelFilter]);

  const top1 = filteredEntries[0];
  const top2 = filteredEntries[1];
  const top3 = filteredEntries[2];

  const currentUserEntry = useMemo(() => {
    return entries.find((e) => e.isCurrentUser) || null;
  }, [entries]);

  const gapToNextRank = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rank <= 1) return null;
    const higherPeer = entries.find((e) => e.rank === currentUserEntry.rank - 1);
    if (!higherPeer) return null;
    const diff =
      metricFilter === 'weekly'
        ? higherPeer.weeklyXp - currentUserEntry.weeklyXp
        : higherPeer.totalXp - currentUserEntry.totalXp;
    return {
      points: Math.max(10, diff + 10),
      peerName: higherPeer.displayName
    };
  }, [currentUserEntry, entries, metricFilter]);

  // Currently selected squad
  const currentGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || groups[0];
  }, [groups, selectedGroupId]);

  // Target lesson of current squad
  const currentGroupLesson = useMemo(() => {
    if (!currentGroup) return null;
    return getCurriculumLessonById(currentGroup.targetLessonId) || ALL_200_LESSONS[0];
  }, [currentGroup]);

  // Sorted members of the current squad
  const sortedGroupMembers = useMemo(() => {
    if (!currentGroup) return [];
    return [...currentGroup.members].sort((a, b) => b.score - a.score || b.xpEarned - a.xpEarned);
  }, [currentGroup]);

  // Cheer in private squad
  const handleGroupMemberCheer = (memberUid: string) => {
    if (!currentGroup) return;
    const updated = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return {
        ...g,
        members: g.members.map((m) =>
          m.uid === memberUid ? { ...m, cheerCount: m.cheerCount + 1 } : m
        )
      };
    });
    saveGroups(updated);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 }
    });
  };

  // Create a new private group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const selectedLesson =
      ALL_200_LESSONS.find((l) => l.id === newGroupLessonId) || availableLessonsForCreation[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const privateCode = `GRP-${randomSuffix}`;

    const newGroup: GroupChallenge = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      privateCode,
      description:
        newGroupDesc.trim() ||
        `Défi d'excellence sur la leçon : ${selectedLesson?.title || 'Leçon sélectionnée'}.`,
      createdBy: user.uid,
      creatorName: `${user.displayName} (Vous)`,
      createdAt: new Date().toISOString().slice(0, 10),
      deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      targetLessonId: selectedLesson.id,
      targetLessonTitle: selectedLesson.title,
      targetLessonTitleEn: selectedLesson.title_en,
      targetLessonGrade: selectedLesson.class_level,
      targetLessonTheme: selectedLesson.theme_label,
      targetLessonCefr: selectedLesson.cefr_level,
      targetLessonIcon: selectedLesson.theme_icon,
      members: [
        {
          uid: user.uid,
          displayName: `${user.displayName} (Vous)`,
          photoURL: user.photoURL,
          level: user.level,
          score: 85,
          xpEarned: 250,
          completedAt: "Aujourd'hui",
          status: 'in_progress',
          cheerCount: 0,
          isCurrentUser: true
        }
      ]
    };

    const updated = [newGroup, ...groups];
    saveGroups(updated);
    setSelectedGroupId(newGroup.id);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Join a private group via code
  const handleJoinGroupByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    const targetGroup = groups.find((g) => g.privateCode.toUpperCase() === cleanCode);

    if (!targetGroup) {
      setJoinError(
        `Aucun groupe privé ne correspond au code « ${cleanCode} ». Vérifiez auprès de votre camarade.`
      );
      return;
    }

    const alreadyIn = targetGroup.members.some((m) => m.uid === user.uid);
    if (alreadyIn) {
      setSelectedGroupId(targetGroup.id);
      setJoinSuccess(`Vous êtes déjà membre du groupe « ${targetGroup.name} » !`);
      setTimeout(() => setShowJoinGroupModal(false), 1200);
      return;
    }

    // Add user as member
    const updated = groups.map((g) => {
      if (g.id !== targetGroup.id) return g;
      return {
        ...g,
        members: [
          ...g.members,
          {
            uid: user.uid,
            displayName: `${user.displayName} (Vous)`,
            photoURL: user.photoURL,
            level: user.level,
            score: 0,
            xpEarned: 0,
            status: 'in_progress' as const,
            cheerCount: 0,
            isCurrentUser: true
          }
        ]
      };
    });

    saveGroups(updated);
    setSelectedGroupId(targetGroup.id);
    setJoinSuccess(`Félicitations ! Vous avez rejoint le groupe « ${targetGroup.name} ».`);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setShowJoinGroupModal(false);
      setJoinCodeInput('');
      setJoinSuccess(null);
    }, 1500);
  };

  // Copy private code to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Launch target challenge lesson
  const handleLaunchChallengeLesson = () => {
    if (!currentGroupLesson) return;
    setActiveLessonForModal(currentGroupLesson);
  };

  // When completing the challenge lesson
  const handleLessonCompleted = (lessonId: string, xp: number) => {
    if (!currentGroup) return;
    const updated = groups.map((g) => {
      if (g.id !== currentGroup.id) return g;
      return {
        ...g,
        members: g.members.map((m) => {
          if (m.uid === user.uid) {
            return {
              ...m,
              score: 100,
              xpEarned: m.xpEarned + xp,
              status: 'completed' as const,
              completedAt: 'À l’instant'
            };
          }
          return m;
        })
      };
    });
    saveGroups(updated);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 select-none">
      {/* EDITORIAL BANNER & PRIMARY VIEW SELECTOR */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#141d33] to-[#0c1322] border border-[#f2ca50]/30 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <span className="material-symbols-outlined text-sm">groups</span>
              Émulation & Compétition Bienveillante
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#f3f4f6]">
              Classement & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#f2ca50] to-[#e6b834]">Défis de Groupe</span>
            </h1>
            <p className="text-sm text-[#cbd5e1] max-w-xl font-sans leading-relaxed">
              Défiez bienveillamment vos condisciples de l'Académie MSZ dans le classement général, ou créez des sous-groupes privés pour vous challenger sur une leçon spécifique du cursus.
            </p>
          </div>

          {/* View Mode Toggle: Global Leaderboard vs Private Group Challenges */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="p-1 rounded-2xl bg-[#070b14]/90 border border-[#f2ca50]/40 flex items-center shadow-lg">
              <button
                type="button"
                onClick={() => setViewSection('global')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  viewSection === 'global'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                    : 'text-[#d0c5af] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">emoji_events</span>
                <span>Ligue d'Oxford</span>
              </button>

              <button
                type="button"
                onClick={() => setViewSection('groups')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer relative ${
                  viewSection === 'groups'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                    : 'text-[#d0c5af] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">forum</span>
                <span>Défis de Groupe Privés</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#3c2f00]/30 text-[10px] font-bold">
                  {groups.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Callout Strip based on active section */}
        {viewSection === 'global' ? (
          <div className="mt-5 pt-4 border-t border-[#232a3a]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#d4c78f]">
              <span className="material-symbols-outlined text-[#f2ca50] text-base">info</span>
              <span>
                Envie de vous mesurer entre amis sur une leçon précise ? Créez un sous-groupe privé avec code d'accès !
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewSection('groups')}
              className="text-[#f2ca50] hover:text-[#ffe088] font-bold font-mono flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Accéder aux Défis de Groupe</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="mt-5 pt-4 border-t border-[#232a3a]/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-[#d4c78f]">
              {groups.length} sous-groupes privés disponibles • Rejoignez ou créez un club d'étude privé
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowJoinGroupModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#151b2b] hover:bg-[#232a3a] border border-[#f2ca50]/30 text-xs text-[#f2ca50] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">vpn_key</span>
                <span>Rejoindre avec un code</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateGroupModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#f2ca50]/15 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Créer un Défi de Groupe</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: DÉFIS DE GROUPE PRIVÉS (CLUBS D'ÉTUDE & CHALLENGES SUR LEÇONS) */}
      {/* ========================================================================= */}
      {viewSection === 'groups' && (
        <section className="space-y-6 animate-fadeIn">
          {/* SQUADS SELECTOR TABS & ACTION BUTTONS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Squads Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {groups.map((grp) => {
                const isSelected = grp.id === selectedGroupId;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setSelectedGroupId(grp.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md shadow-[#f2ca50]/20'
                        : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{grp.targetLessonIcon}</span>
                    <span className="truncate max-w-[180px]">{grp.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-[#3c2f00]/20 text-[#3c2f00]' : 'bg-[#232a3a] text-[#d4c78f]'
                      }`}
                    >
                      {grp.members.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowJoinGroupModal(true)}
                className="px-3 py-2 rounded-xl bg-[#151b2b] hover:bg-[#232a3a] border border-[#232a3a] text-xs text-[#dce2f8] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#f2ca50]">key</span>
                <span>Code d'invitation</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] border border-[#f2ca50]/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Nouveau Groupe</span>
              </button>
            </div>
          </div>

          {/* ACTIVE SQUAD DETAIL BOARD */}
          {currentGroup && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* LEFT 2 COLS: SQUAD INFO & TARGET LESSON SPOTLIGHT */}
              <div className="lg:col-span-2 space-y-4">
                {/* Squad Banner Header */}
                <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/40 flex flex-col gap-3.5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-md shrink-0">
                        <span className="material-symbols-outlined text-2xl">
                          {currentGroup.targetLessonIcon}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[10px] font-mono font-bold uppercase">
                            Groupe Privé
                          </span>
                          <span className="text-[11px] text-[#99907c] font-mono">
                            Créé par {currentGroup.creatorName}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#f3f4f6] mt-0.5">
                          {currentGroup.name}
                        </h2>
                      </div>
                    </div>

                    {/* Shareable Private Access Code */}
                    <div className="flex items-center gap-2 bg-[#0c1322] px-3 py-2 rounded-xl border border-[#232a3a] shrink-0 self-start sm:self-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono uppercase text-[#99907c]">Code d'invitation privé</span>
                        <strong className="text-sm font-mono text-[#f2ca50] tracking-wider">
                          {currentGroup.privateCode}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(currentGroup.privateCode, currentGroup.id)}
                        className="p-1.5 rounded-lg bg-[#232a3a] hover:bg-[#38bdf8]/20 text-[#d4c78f] hover:text-white transition-colors cursor-pointer"
                        title="Copier le code d'accès"
                      >
                        <span className="material-symbols-outlined text-base">
                          {copiedCodeId === currentGroup.id ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#d0c5af] leading-relaxed">
                    {currentGroup.description}
                  </p>
                </div>

                {/* TARGET CHALLENGE LESSON SPOTLIGHT CARD */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#172554]/70 via-[#0f172a] to-[#1e1b4b]/70 border-2 border-[#f2ca50]/50 flex flex-col gap-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">target</span>
                      Leçon Spécifique du Défi ({currentGroup.targetLessonGrade.toUpperCase()})
                    </span>
                    <span className="text-[11px] font-mono text-[#d4c78f] bg-[#0c1322] px-2.5 py-0.5 rounded-full border border-[#232a3a]">
                      CECRL {currentGroup.targetLessonCefr} • {currentGroup.targetLessonTheme}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-lg text-[#dce2f8]">
                        {currentGroup.targetLessonTitle}
                      </h3>
                      <p className="text-xs font-mono text-[#99907c] italic">
                        {currentGroup.targetLessonTitleEn}
                      </p>
                      {currentGroupLesson && (
                        <p className="text-xs text-[#cbd5e1]/85 line-clamp-2 pt-1">
                          Objectif du défi : {currentGroupLesson.learning_objective}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunchChallengeLesson}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      <span>Lancer le Défi de la Leçon</span>
                    </button>
                  </div>
                </div>

                {/* SQUAD MEMBERS RANKING */}
                <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#232a3a]">
                    <span className="text-xs font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">leaderboard</span>
                      Classement Interne du Sous-Groupe ({sortedGroupMembers.length} membres)
                    </span>
                    <span className="text-[11px] text-[#99907c] font-mono">
                      Classé par score sur la leçon cible
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {sortedGroupMembers.map((member, index) => {
                      const rank = index + 1;
                      const isMe = member.uid === user.uid;

                      return (
                        <div
                          key={member.uid}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isMe
                              ? 'bg-[#1e283d] border-[#f2ca50]/60 ring-1 ring-[#f2ca50]/30 shadow-md'
                              : 'bg-[#0c1322] border-[#232a3a] hover:border-[#f2ca50]/30'
                          }`}
                        >
                          {/* Rank & Profile */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 text-center font-mono font-bold text-sm">
                              {rank === 1 ? (
                                <span className="text-xl">🥇</span>
                              ) : rank === 2 ? (
                                <span className="text-xl">🥈</span>
                              ) : rank === 3 ? (
                                <span className="text-xl">🥉</span>
                              ) : (
                                <span className="text-[#99907c]">#{rank}</span>
                              )}
                            </div>

                            <img
                              src={member.photoURL || user.photoURL}
                              alt={member.displayName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#232a3a]"
                            />

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-sm text-[#dce2f8] truncate">
                                  {member.displayName}
                                </span>
                                {isMe && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/20 text-[#f2ca50] text-[9px] font-mono font-bold uppercase">
                                    Vous
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#99907c] font-mono">
                                Niveau {member.level} • {member.completedAt || 'En cours'}
                              </span>
                            </div>
                          </div>

                          {/* Score & Kudos */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right font-mono">
                              <span className="text-sm font-bold text-[#f2ca50] block">
                                {member.score}%
                              </span>
                              <span className="text-[10px] text-[#99907c]">+{member.xpEarned} XP</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleGroupMemberCheer(member.uid)}
                              className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#38bdf8]/20 border border-[#232a3a] text-xs font-mono text-[#d4c78f] hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                              title="Encourager ce camarade"
                            >
                              <span>👏</span>
                              <span>{member.cheerCount}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT 1 COL: GROUP MANAGEMENT & STATS */}
              <div className="space-y-4">
                {/* Invite Friends Card */}
                <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3 shadow-md">
                  <h4 className="font-serif font-bold text-sm text-[#f2ca50] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Inviter des camarades au groupe
                  </h4>
                  <p className="text-xs text-[#d0c5af]/80 leading-relaxed">
                    Partagez ce code privé avec vos amis de classe pour qu'ils rejoignent ce sous-groupe et participent au défi.
                  </p>

                  <div className="p-3 rounded-xl bg-[#0c1322] border border-[#f2ca50]/30 flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-[#f2ca50]">
                      {currentGroup.privateCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentGroup.privateCode, currentGroup.id)}
                      className="px-3 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] hover:text-[#3c2f00] text-xs font-mono text-[#d4c78f] font-bold transition-all cursor-pointer"
                    >
                      {copiedCodeId === currentGroup.id ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>

                {/* Challenge Rules & Deadline */}
                <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-3 text-xs text-[#99907c]">
                  <h4 className="font-serif font-bold text-sm text-[#dce2f8] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#f2ca50]">verified</span>
                    Règles du Défi Privé
                  </h4>
                  <ul className="space-y-2 list-disc pl-4 text-[#cbd5e1]/80">
                    <li>Chaque membre réalise la leçon cible (vocabulaire, grammaire, dictée, quiz).</li>
                    <li>Le score au quiz et la précision orthographique déterminent le classement.</li>
                    <li>Un bonus de <strong className="text-[#f2ca50]">+100 XP</strong> est accordé à tous les membres dès que 100% du groupe a terminé l'épreuve.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CLASSEMENT GÉNÉRAL HEBDOMADAIRE (LIGUE D'OXFORD) */}
      {/* ========================================================================= */}
      {viewSection === 'global' && (
        <section className="space-y-6 animate-fadeIn">
          {/* User Current Standing Callout Banner */}
          {currentUserEntry && (
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#172554]/90 via-[#0f172a] to-[#1e1b4b]/80 border-2 border-[#f2ca50]/50 p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#f2ca50] to-[#f59e0b] shadow-lg shadow-[#f2ca50]/20 flex items-center justify-center">
                      <img
                        src={currentUserEntry.photoURL || user.photoURL}
                        alt={currentUserEntry.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-[#f2ca50] text-[#1e1b4b] text-[10px] font-black font-mono shadow">
                      #{currentUserEntry.rank}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#f3f4f6]">
                        Votre Position Actuelle
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/40 text-[#f2ca50] text-[10px] font-mono font-bold uppercase">
                        {currentUserEntry.league}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      {currentUserEntry.rank <= 3
                        ? '👑 Vous occupez une place d’honneur sur le podium cette semaine !'
                        : gapToNextRank
                        ? `Plus que ${gapToNextRank.points} XP pour dépasser ${gapToNextRank.peerName} et atteindre le rang #${currentUserEntry.rank - 1}.`
                        : 'Continuez vos efforts quotidiens pour monter dans la ligue.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="block font-mono font-black text-xl text-[#f2ca50]">
                      {(metricFilter === 'weekly' ? currentUserEntry.weeklyXp : currentUserEntry.totalXp).toLocaleString()}{' '}
                      <span className="text-xs font-normal text-[#94a3b8]">XP</span>
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono">
                      {metricFilter === 'weekly' ? 'cette semaine' : 'au total'}
                    </span>
                  </div>

                  {onNavigateToPractice && (
                    <button
                      type="button"
                      onClick={onNavigateToPractice}
                      className="px-3.5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#2c1d00] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Gagner des XP
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TOP 3 PODIUM */}
          <section className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Rank 2 */}
              {top2 && (
                <div className="order-2 md:order-1 p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-400/40 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                  <span className="text-3xl mb-1">🥈</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 font-mono text-[10px] font-bold uppercase mb-2">
                    2e Rang • Argent
                  </span>
                  <img
                    src={top2.photoURL || user.photoURL}
                    alt={top2.displayName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-400 mb-2"
                  />
                  <h4 className="font-serif font-bold text-sm text-[#f3f4f6] truncate max-w-[160px]">
                    {top2.displayName}
                  </h4>
                  <span className="font-mono font-black text-base text-slate-300 mt-1">
                    {(metricFilter === 'weekly' ? top2.weeklyXp : top2.totalXp).toLocaleString()} XP
                  </span>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {top1 && (
                <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-[#1e293b] to-[#0c1322] border-2 border-[#f2ca50] flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                  <span className="text-4xl mb-1">👑</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] font-mono text-xs font-bold uppercase mb-2">
                    1er Rang • Or d'Oxford
                  </span>
                  <img
                    src={top1.photoURL || user.photoURL}
                    alt={top1.displayName}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-[#f2ca50] mb-2 shadow-lg"
                  />
                  <h4 className="font-serif font-bold text-base text-[#f3f4f6] truncate max-w-[180px]">
                    {top1.displayName}
                  </h4>
                  <span className="font-mono font-black text-xl text-[#f2ca50] mt-1">
                    {(metricFilter === 'weekly' ? top1.weeklyXp : top1.totalXp).toLocaleString()} XP
                  </span>
                </div>
              )}

              {/* Rank 3 */}
              {top3 && (
                <div className="order-3 p-5 rounded-2xl bg-[#0f172a]/90 border border-amber-600/40 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                  <span className="text-3xl mb-1">🥉</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-400 font-mono text-[10px] font-bold uppercase mb-2">
                    3e Rang • Bronze
                  </span>
                  <img
                    src={top3.photoURL || user.photoURL}
                    alt={top3.displayName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-600 mb-2"
                  />
                  <h4 className="font-serif font-bold text-sm text-[#f3f4f6] truncate max-w-[160px]">
                    {top3.displayName}
                  </h4>
                  <span className="font-mono font-black text-base text-amber-400 mt-1">
                    {(metricFilter === 'weekly' ? top3.weeklyXp : top3.totalXp).toLocaleString()} XP
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* REST OF LEADERBOARD LIST */}
          <section className="rounded-2xl bg-[#0f172a]/80 border border-[#232a3a] p-4 sm:p-5 shadow-xl space-y-2">
            <h3 className="font-serif text-sm font-bold text-[#f2ca50] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">format_list_numbered</span>
              Tableau Général de la Ligue ({filteredEntries.length} condisciples)
            </h3>

            <div className="space-y-2">
              {filteredEntries.map((entry) => {
                const isMe = entry.isCurrentUser;
                const pointsVal = metricFilter === 'weekly' ? entry.weeklyXp : entry.totalXp;

                return (
                  <div
                    key={entry.uid}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isMe
                        ? 'bg-[#1e293b] border-[#f2ca50] shadow-md ring-1 ring-[#f2ca50]/30'
                        : 'bg-[#0b1120] border-[#1e293b] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 text-center font-mono font-bold text-sm text-[#94a3b8]">
                        #{entry.rank}
                      </div>
                      <img
                        src={entry.photoURL || user.photoURL}
                        alt={entry.displayName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#232a3a]"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#dce2f8] truncate">
                            {entry.displayName}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/20 text-[#f2ca50] text-[9px] font-mono font-bold uppercase">
                              Vous
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#94a3b8] font-mono">
                          {entry.league} • {entry.streakDays}j 🔥
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono">
                        <span className="text-sm sm:text-base font-bold text-[#f2ca50] block">
                          {pointsVal.toLocaleString()} XP
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCheer(entry)}
                        disabled={cheeredUids[entry.uid]}
                        className="px-2.5 py-1 rounded-lg bg-[#1e293b] hover:bg-[#2e3e57] border border-[#334155] text-xs font-mono text-[#cbd5e1] flex items-center gap-1 cursor-pointer"
                        title="Encourager ce condisciple"
                      >
                        <span>{cheeredUids[entry.uid] ? '✨' : '👏'}</span>
                        <span>{entry.cheerCount || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CRÉER UN DÉFI DE GROUPE PRIVÉ */}
      {/* ========================================================================= */}
      {showCreateGroupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowCreateGroupModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#0c1322] border border-[#f2ca50]/50 p-6 shadow-2xl flex flex-col gap-4 text-[#dce2f8] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#232a3a] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">groups</span>
                <h3 className="font-serif font-bold text-lg text-[#f3f4f6]">
                  Créer un Défi de Groupe Privé
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="w-8 h-8 rounded-full bg-[#232a3a] text-[#99907c] hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              {/* Group Name */}
              <div className="space-y-1.5">
                <label className="font-mono text-[#d4c78f] uppercase font-bold">
                  Nom du sous-groupe :
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex : Club Cambridge 6e, Sprint Terminale B2..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-white focus:border-[#f2ca50] focus:outline-none"
                />
              </div>

              {/* Group Description / Motto */}
              <div className="space-y-1.5">
                <label className="font-mono text-[#d4c78f] uppercase font-bold">
                  Description / Consigne du défi :
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Ex : Réussir le quiz et la dictée avec au moins 90% de réussite cette semaine..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-white focus:border-[#f2ca50] focus:outline-none resize-none"
                />
              </div>

              {/* Target School Grade */}
              <div className="space-y-1.5">
                <label className="font-mono text-[#d4c78f] uppercase font-bold">
                  Sélectionner la classe scolaire :
                </label>
                <select
                  value={newGroupGrade}
                  onChange={(e) => setNewGroupGrade(e.target.value as SchoolGrade)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-white focus:border-[#f2ca50] focus:outline-none"
                >
                  {SCHOOL_LEVELS_DATA.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label} ({lvl.cycle} • CECRL {lvl.cefr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Lesson Selector from 200 Lessons */}
              <div className="space-y-1.5">
                <label className="font-mono text-[#d4c78f] uppercase font-bold">
                  Leçon spécifique à challenger ({availableLessonsForCreation.length} disponibles) :
                </label>
                <select
                  value={newGroupLessonId}
                  onChange={(e) => setNewGroupLessonId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-white focus:border-[#f2ca50] focus:outline-none truncate"
                >
                  {availableLessonsForCreation.map((les) => (
                    <option key={les.id} value={les.id}>
                      [{les.theme_label}] {les.title} ({les.cefr_level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#151b2b] border border-[#232a3a] text-[11px] text-[#99907c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-sm">lock</span>
                <span>Un code d'invitation privé unique sera automatiquement généré pour ce groupe.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232a3a]">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#151b2b] text-[#99907c] hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Créer le Groupe Privé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJOINDRE UN DÉFI DE GROUPE AVEC UN CODE */}
      {/* ========================================================================= */}
      {showJoinGroupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowJoinGroupModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0c1322] border border-[#f2ca50]/50 p-6 shadow-2xl flex flex-col gap-4 text-[#dce2f8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#232a3a] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">vpn_key</span>
                <h3 className="font-serif font-bold text-lg text-[#f3f4f6]">
                  Rejoindre un Groupe Privé
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinGroupModal(false)}
                className="w-8 h-8 rounded-full bg-[#232a3a] text-[#99907c] hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinGroupByCode} className="space-y-4 text-xs">
              <p className="text-xs text-[#d0c5af] leading-relaxed">
                Entrez le code d'accès privé partagé par votre camarade ou professeur (ex : <span className="font-mono text-[#f2ca50]">OXF-9421</span>, <span className="font-mono text-[#f2ca50]">CAM-3814</span>).
              </p>

              <div className="space-y-1.5">
                <label className="font-mono text-[#d4c78f] uppercase font-bold">
                  Code d'accès privé :
                </label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Ex : OXF-9421"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-sm text-[#f2ca50] font-mono font-bold tracking-widest focus:border-[#f2ca50] focus:outline-none uppercase text-center"
                />
              </div>

              {joinError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  {joinError}
                </div>
              )}

              {joinSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                  {joinSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232a3a]">
                <button
                  type="button"
                  onClick={() => setShowJoinGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#151b2b] text-[#99907c] hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Valider & Rejoindre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TARGET LESSON MODAL */}
      <LessonDetailModal
        lesson={activeLessonForModal}
        isOpen={activeLessonForModal !== null}
        onClose={() => setActiveLessonForModal(null)}
        onCompleteLesson={handleLessonCompleted}
      />
    </div>
  );
};
