import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type {
  UserProfile,
  CEFRLevel,
  AcademicBadge,
  SchoolGrade,
  AgeRangeKey,
  LearningObjectiveId
} from '../firebase/types';
import {
  signInWithGoogle,
  signOutUser,
  auth,
  isUserSignedInWithGoogle,
  DEFAULT_USER_PROFILE
} from '../firebase/client';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import { useAppTheme, type AppTheme, type FloralBorderWidth } from '../theme/ThemeContext';
import {
  SCHOOL_GRADES_META,
  AGE_RANGES_META,
  LEARNING_OBJECTIVES_META,
  PREFERRED_DURATIONS,
  inferGradeFromCefr,
  inferAgeRangeFromGrade
} from '../services/adaptiveEngine';
import { useAdaptiveProfile } from '../hooks/useAdaptiveProfile';
import { BadgesSection } from './BadgesSection';
import { LinguisticRadarSection } from './LinguisticRadarSection';
import { FavoriteQuotesSection } from './FavoriteQuotesSection';
import { computeUserBadges } from '../data/badges';
import { BadgeUnlockModal } from './BadgeUnlockModal';
import { UserInventorySection } from './UserInventorySection';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';
import { MotionTooltip } from './MotionTooltip';
import {
  getMszCoinsBalance,
  getEquippedCharacterId,
  getOwnedCardInstances,
  type OwnedCardInstance
} from '../utils/mszCoinsManager';
import { MSZ_CHARACTERS } from '../data/mszShopData';
import { ADVENTURE_AVATARS, ADVENTURE_THEMES } from '../data/englishAdventureData';
import { getEnglishAdventureState } from '../utils/englishAdventureManager';
import { getErrorJournal } from '../utils/errorJournal';
import {
  getAutoPlayOnDisplay,
  setAutoPlayOnDisplay,
  peekNextAlternatingAccent,
  speakText
} from '../services/speechService';
import appIconImg from '../assets/images/app_icon_msz_1792789129742.jpg';
import { calculateLevel } from '../utils/levelUtils';
import { useSyncStatus } from '../offline/useSyncStatus';
import type { ManualSyncResult } from '../offline/syncManager';
import { playSelectCue } from '../utils/soundEffects';

const LazyErrorJournalModal = lazy(() =>
  import('./ErrorJournalModal').then((m) => ({ default: m.ErrorJournalModal }))
);
const LazyVoiceStudioModal = lazy(() =>
  import('./VoiceStudioModal').then((m) => ({ default: m.VoiceStudioModal }))
);
const LazyMszShopModal = lazy(() =>
  import('./MszShopModal').then((m) => ({ default: m.MszShopModal }))
);

export type ProfileSubTab = 'apercu' | 'analytics' | 'inventaire' | 'preferences';
export type SkillModuleAction =
  | 'flashcards'
  | 'grammar_battle'
  | 'listening_cinema'
  | 'escape_room'
  | 'tutor'
  | 'speaking'
  | 'dialogues';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void | Promise<void>;
  onCustomPhotoUpload: (file: File) => Promise<string>;
  onOpenInstallModal?: () => void;
  onOpenPlacement?: () => void;
  mode?: 'modal' | 'page';
  onResetHeroPhoto?: () => void;
  onLaunchSkillModule?: (action: SkillModuleAction) => void;
  onNavigateDashboard?: () => void;
}

const DEFAULT_FALLBACK_AVATAR =
  DEFAULT_USER_PROFILE.photoURL || '/assets/aistudio/VOLT.png';

const SECTION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onUpdateUser,
  onCustomPhotoUpload,
  onOpenInstallModal,
  onOpenPlacement,
  mode = 'modal',
  onResetHeroPhoto,
  onLaunchSkillModule,
  onNavigateDashboard
}) => {
  const { theme, floralWidth, setTheme, setFloralWidth, isDark } = useAppTheme();
  const shouldReduceMotion = useReducedMotion();
  const { assessment } = useAdaptiveProfile(user);

  const safeStats = user?.stats ?? DEFAULT_USER_PROFILE.stats;
  const totalXp = safeStats?.totalXp ?? 0;
  const streakDays = safeStats?.streakDays ?? 0;
  const studyMinutesTarget = safeStats?.studyMinutesTarget ?? 30;
  const weeklyXp = safeStats?.weeklyXp ?? 0;
  const scholarLevel = calculateLevel(totalXp);

  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(user?.level || 'C1');
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>(
    user?.schoolGrade || inferGradeFromCefr(user?.level || 'C1')
  );
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRangeKey>(
    user?.ageRange ||
      inferAgeRangeFromGrade(user?.schoolGrade || inferGradeFromCefr(user?.level || 'C1'))
  );
  const [selectedObjectives, setSelectedObjectives] = useState<LearningObjectiveId[]>(
    user?.learningObjectives && user.learningObjectives.length > 0
      ? user.learningObjectives
      : ['school_excellence', 'oral_fluency']
  );
  const [selectedPace, setSelectedPace] = useState<number>(
    user?.preferredDurationMinutes || studyMinutesTarget || 30
  );

  // Editable Scholar Display Name
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [draftDisplayName, setDraftDisplayName] = useState<string>(
    user?.displayName || DEFAULT_USER_PROFILE.displayName
  );
  const [nameFeedback, setNameFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoFeedback, setPhotoFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authFeedback, setAuthFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(() => getAutoPlayOnDisplay());
  const [celebrationBadge, setCelebrationBadge] = useState<AcademicBadge | null>(null);
  const [claimedBadgeIds, setClaimedBadgeIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eb_msz_claimed_badges') || '[]');
    } catch {
      return [];
    }
  });
  const [isErrorJournalOpen, setIsErrorJournalOpen] = useState<boolean>(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('apercu');
  const subTabTrackRef = useRef<HTMLDivElement | null>(null);

  const [ownedInstances, setOwnedInstances] = useState<OwnedCardInstance[]>(() =>
    getOwnedCardInstances()
  );
  const [mszBalance, setMszBalance] = useState<number>(() => getMszCoinsBalance());
  const [equippedCharId, setEquippedCharId] = useState<string>(() => getEquippedCharacterId());
  const equippedChar = MSZ_CHARACTERS.find((c) => c.id === equippedCharId) || MSZ_CHARACTERS[0];
  const equippedInstance = ownedInstances.find((inst) => inst.characterId === equippedCharId);

  const [errorCount, setErrorCount] = useState<number>(() => {
    return getErrorJournal().filter((i) => !i.resolved).length;
  });

  const {
    isOnline,
    isSyncing,
    autoSyncEnabled,
    pendingCount,
    lastSyncTime,
    syncError,
    syncNow,
    setAutoSyncEnabled
  } = useSyncStatus();
  const [manualSyncFeedback, setManualSyncFeedback] = useState<ManualSyncResult | null>(null);
  const [syncSwitchEngaged, setSyncSwitchEngaged] = useState<boolean>(false);
  const syncSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local controls when external user profile changes (e.g. Header switcher or Cloud Auth sync)
  useEffect(() => {
    const nextLevel = user?.level || 'C1';
    const nextGrade = user?.schoolGrade || inferGradeFromCefr(nextLevel);
    setSelectedLevel(nextLevel);
    setSelectedGrade(nextGrade);
    setSelectedAgeRange(user?.ageRange || inferAgeRangeFromGrade(nextGrade));
    if (user?.learningObjectives && user.learningObjectives.length > 0) {
      setSelectedObjectives(user.learningObjectives);
    }
    setSelectedPace(user?.preferredDurationMinutes || user?.stats?.studyMinutesTarget || 30);
    if (!isEditingName && user?.displayName) {
      setDraftDisplayName(user.displayName);
    }
  }, [
    user?.level,
    user?.schoolGrade,
    user?.ageRange,
    user?.learningObjectives,
    user?.preferredDurationMinutes,
    user?.stats?.studyMinutesTarget,
    user?.displayName,
    isEditingName
  ]);

  useEffect(() => {
    return () => {
      if (syncSwitchTimerRef.current) clearTimeout(syncSwitchTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const updateCounts = () => {
      setErrorCount(getErrorJournal().filter((i) => !i.resolved).length);
      setOwnedInstances(getOwnedCardInstances());
      setMszBalance(getMszCoinsBalance());
      setEquippedCharId(getEquippedCharacterId());
    };
    window.addEventListener('eb_error_journal_updated', updateCounts);
    window.addEventListener('msz-inventory-updated', updateCounts);
    window.addEventListener('msz-coins-updated', updateCounts);
    window.addEventListener('msz-equipped-updated', updateCounts);
    return () => {
      window.removeEventListener('eb_error_journal_updated', updateCounts);
      window.removeEventListener('msz-inventory-updated', updateCounts);
      window.removeEventListener('msz-coins-updated', updateCounts);
      window.removeEventListener('msz-equipped-updated', updateCounts);
    };
  }, []);

  const allBadges = useMemo(() => computeUserBadges(user), [user]);
  const distinctionBadges = useMemo(
    () => allBadges.filter((b) => b.category === 'distinction'),
    [allBadges]
  );
  const unlockedDistinctions = useMemo(
    () => distinctionBadges.filter((b) => b.isUnlocked),
    [distinctionBadges]
  );
  const unlockedDistinctionIdsKey = useMemo(
    () => unlockedDistinctions.map((b) => b.id).join(','),
    [unlockedDistinctions]
  );

  const polyglotteBadge = useMemo(
    () =>
      distinctionBadges.find((b) => b.id === 'polyglotte_matin') || distinctionBadges[0] || null,
    [distinctionBadges]
  );
  const serieBadge = useMemo(
    () =>
      distinctionBadges.find((b) => b.id === 'serie_ininterrompue') || distinctionBadges[1] || null,
    [distinctionBadges]
  );

  const adventureState = useMemo(() => getEnglishAdventureState(user), [user]);
  const equippedAdventureAvatar = useMemo(
    () =>
      ADVENTURE_AVATARS.find((a) => a.id === adventureState.equippedAvatarId) ||
      ADVENTURE_AVATARS[0],
    [adventureState.equippedAvatarId]
  );

  const skinOptions = useMemo(
    () => [
      {
        id: 'dark',
        label: 'Sombre Classique',
        icon: 'dark_mode',
        locked: false,
        hint: 'Thème nuit Oxford'
      },
      {
        id: 'light',
        label: 'Claire Albâtre',
        icon: 'light_mode',
        locked: false,
        hint: 'Thème papier clair haute lisibilité'
      },
      {
        id: 'dark-floral',
        label: 'Sombre Florale',
        icon: 'local_florist',
        locked: false,
        hint: 'Enluminures botaniques sombres'
      },
      {
        id: 'light-floral',
        label: 'Claire Florale',
        icon: 'local_florist',
        locked: false,
        hint: 'Enluminures botaniques claires'
      },
      ...ADVENTURE_THEMES.map((th) => ({
        id: th.id,
        label: th.name,
        icon: 'auto_awesome',
        locked: !adventureState.unlockedThemeIds.includes(th.id),
        hint: th.unlockRequirementFr
      }))
    ],
    [adventureState.unlockedThemeIds]
  );

  // Auto-detect newly unlocked distinctions for celebration notification
  useEffect(() => {
    if (!unlockedDistinctionIdsKey) return;
    try {
      const acknowledged: string[] = JSON.parse(
        localStorage.getItem('eb_msz_acknowledged_distinctions') || '[]'
      );
      const newlyUnlocked = unlockedDistinctions.find((b) => !acknowledged.includes(b.id));
      if (newlyUnlocked) {
        setCelebrationBadge(newlyUnlocked);
        localStorage.setItem(
          'eb_msz_acknowledged_distinctions',
          JSON.stringify([...acknowledged, newlyUnlocked.id])
        );
      }
    } catch {
      // ignore storage failure
    }
  }, [unlockedDistinctionIdsKey, unlockedDistinctions]);

  // Escape key behavior: respect nested modals and page mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (celebrationBadge) {
        setCelebrationBadge(null);
        return;
      }
      if (isErrorJournalOpen || isVoiceStudioOpen || isShopOpen) {
        return;
      }
      if (isEditingName) {
        setIsEditingName(false);
        setDraftDisplayName(user?.displayName || DEFAULT_USER_PROFILE.displayName);
        return;
      }
      if (mode === 'modal') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    mode,
    onClose,
    celebrationBadge,
    isErrorJournalOpen,
    isVoiceStudioOpen,
    isShopOpen,
    isEditingName,
    user?.displayName
  ]);

  const handleSaveDisplayName = async () => {
    const cleaned = draftDisplayName.trim().replace(/\s+/g, ' ');
    if (cleaned.length < 2 || cleaned.length > 120) {
      setNameFeedback({
        type: 'error',
        message: 'Le nom doit contenir entre 2 et 120 caractères.'
      });
      return;
    }
    setNameFeedback(null);
    await onUpdateUser({ displayName: cleaned });
    setIsEditingName(false);
    setNameFeedback({ type: 'success', message: 'Identité académique mise à jour.' });
    setTimeout(() => setNameFeedback(null), 2500);
  };

  const handleClaimReward = (badge: AcademicBadge) => {
    if (!badge.isUnlocked || claimedBadgeIds.includes(badge.id)) {
      setCelebrationBadge(null);
      return;
    }
    const nextClaimed = [...claimedBadgeIds, badge.id];
    setClaimedBadgeIds(nextClaimed);
    try {
      localStorage.setItem('eb_msz_claimed_badges', JSON.stringify(nextClaimed));
    } catch {
      // ignore
    }
    onUpdateUser({
      stats: {
        ...safeStats,
        totalXp: (safeStats?.totalXp ?? 0) + badge.xpReward
      }
    });
    setCelebrationBadge(null);
  };

  const handleLevelSelect = (lvl: CEFRLevel) => {
    playSelectCue();
    setSelectedLevel(lvl);
    onUpdateUser({ level: lvl });
  };

  const handleGradeSelect = (grade: SchoolGrade, targetCefr: CEFRLevel) => {
    playSelectCue();
    setSelectedGrade(grade);
    setSelectedLevel(targetCefr);
    const nextAge = inferAgeRangeFromGrade(grade);
    setSelectedAgeRange(nextAge);
    onUpdateUser({ schoolGrade: grade, level: targetCefr, ageRange: nextAge });
  };

  const handleAgeSelect = (age: AgeRangeKey) => {
    playSelectCue();
    setSelectedAgeRange(age);
    onUpdateUser({ ageRange: age });
  };

  const handleToggleObjective = (objId: LearningObjectiveId) => {
    playSelectCue();
    const exists = selectedObjectives.includes(objId);
    const next = exists
      ? selectedObjectives.filter((id) => id !== objId)
      : [...selectedObjectives, objId];
    const finalObjectives: LearningObjectiveId[] = next.length > 0 ? next : [objId];
    setSelectedObjectives(finalObjectives);
    onUpdateUser({ learningObjectives: finalObjectives });
  };

  const handlePaceSelect = (mins: number) => {
    playSelectCue();
    setSelectedPace(mins);
    onUpdateUser({
      preferredDurationMinutes: mins,
      stats: {
        ...safeStats,
        studyMinutesTarget: mins
      }
    });
  };

  const handleGoogleAuth = async () => {
    setIsSigningIn(true);
    setAuthFeedback(null);
    try {
      const signedInUser = await signInWithGoogle();
      await onUpdateUser(signedInUser);
      setAuthFeedback({
        type: 'success',
        message: 'Compte Google connecté et synchronisé avec Cloud Firestore.'
      });
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      const friendlyMsg = rawMsg.includes('popup-closed-by-user')
        ? 'Fenêtre de connexion fermée avant la validation.'
        : rawMsg.includes('popup-blocked')
        ? 'La fenêtre Google a été bloquée par le navigateur. Autorisez les fenêtres contextuelles.'
        : 'Impossible de finaliser la connexion Google pour le moment. Vos données restent sauvegardées localement.';
      setAuthFeedback({ type: 'error', message: friendlyMsg });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setAuthFeedback(null);
    try {
      await signOutUser();
      setAuthFeedback({
        type: 'success',
        message: 'Déconnexion effectuée. Session locale active sur cet appareil.'
      });
      if (mode === 'modal') {
        onClose();
      }
    } catch {
      setAuthFeedback({
        type: 'error',
        message: 'Erreur lors de la déconnexion. Réessayez.'
      });
    }
  };

  const handleManualFirestoreSync = async () => {
    if (!isOnline || isSyncing) return;
    playSelectCue();
    if (syncSwitchTimerRef.current) clearTimeout(syncSwitchTimerRef.current);
    setSyncSwitchEngaged(true);
    setManualSyncFeedback(null);
    const result = await syncNow();
    setManualSyncFeedback(result);
    if (result.status === 'success' && result.syncedProfile) {
      onUpdateUser({});
    }
    syncSwitchTimerRef.current = setTimeout(() => {
      setSyncSwitchEngaged(false);
    }, 1800);
  };

  const formatSyncTimestamp = (iso: string | null): string => {
    if (!iso) return 'Jamais synchronisé';
    try {
      const dt = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(dt);
    } catch {
      return iso;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    setPhotoFeedback(null);
    try {
      const newUrl = await onCustomPhotoUpload(file);
      await onUpdateUser({ heroImageURL: newUrl });
      setPhotoFeedback({
        type: 'success',
        message: 'Portrait d’arrière-plan mis à jour avec succès.'
      });
    } catch {
      setPhotoFeedback({
        type: 'error',
        message: 'Impossible de charger cette image. Choisissez un fichier JPG ou PNG.'
      });
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const firestoreDbId =
    (firebaseAppletConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || '(default)';
  const firebaseProjectId = firebaseAppletConfig.projectId || 'local';

  const subTabs: Array<{
    id: ProfileSubTab;
    label: string;
    shortLabel: string;
    icon: string;
    tooltip: string;
  }> = [
    {
      id: 'apercu',
      label: 'Aperçu & Distinctions',
      shortLabel: 'Aperçu',
      icon: 'person',
      tooltip: 'Identité, portefeuille MSZ, diagnostic adaptatif et médailles d’honneur'
    },
    {
      id: 'analytics',
      label: 'Radar & Journal',
      shortLabel: 'Radar',
      icon: 'radar',
      tooltip: 'Radar des 7 compétences, journal d’erreurs et citations favorites'
    },
    {
      id: 'inventaire',
      label: `Inventaire (${ownedInstances.length})`,
      shortLabel: `Cartes (${ownedInstances.length})`,
      icon: 'style',
      tooltip: 'Collection certifiée 1/100, équipement 3D et registre de transactions'
    },
    {
      id: 'preferences',
      label: 'Préférences & Cloud',
      shortLabel: 'Réglages',
      icon: 'tune',
      tooltip: 'Classe scolaire, CECRL, thèmes visuels, voix studio et synchronisation Firestore'
    }
  ];

  const renderPageHeader = () => (
    <div className="luxury-card-surface rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl luxury-btn-gold flex items-center justify-center shrink-0 shadow-md">
          <span className="material-symbols-outlined text-2xl font-bold">school</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Espace Étudiant &amp; Paramètres
            </span>
            <span aria-hidden="true" className="text-[#99907c]">
              ·
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              Sauvegarde active
            </span>
          </div>
          <h1
            className={`font-serif text-lg sm:text-xl font-bold truncate ${
              isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
            }`}
          >
            Profil Académique · {user?.displayName || 'Érudit MSZ'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onNavigateDashboard && (
          <MotionTooltip content="Ouvrir vos métriques détaillées et graphiques" placement="bottom">
            <button
              type="button"
              onClick={onNavigateDashboard}
              className="px-3 py-2 rounded-xl luxury-btn-surface text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">analytics</span>
              <span className="hidden sm:inline">Tableau de bord</span>
            </button>
          </MotionTooltip>
        )}

        <MotionTooltip content="Revenir à l’accueil et reprendre vos leçons" placement="bottom">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl luxury-btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
          >
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            <span>Accueil</span>
          </button>
        </MotionTooltip>
      </div>
    </div>
  );

  const renderModalHeader = () => (
    <>
      <header
        className={`sticky top-0 z-30 w-full backdrop-blur-2xl border-b shadow-lg flex flex-col justify-end ${
          isDark
            ? 'bg-[#0c1322]/95 border-[#232a3a]'
            : 'bg-[#f7f4ee]/95 border-[#d6cebe]'
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)'
        }}
      >
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full luxury-btn-surface text-xs font-bold uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            aria-label="Revenir en arrière"
          >
            <span className="material-symbols-outlined text-base font-bold text-[#f2ca50]">
              arrow_back
            </span>
            <span className="font-serif">Retour</span>
          </button>

          <div className="flex flex-col items-center text-center min-w-0">
            <h1
              className={`font-serif text-base sm:text-lg font-bold leading-tight truncate ${
                isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
              }`}
            >
              Profil &amp; Paramètres
            </h1>
            <span
              className={`text-[10px] font-mono uppercase tracking-widest hidden sm:block ${
                isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
              }`}
            >
              Académie d&apos;Oxford MSZ
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full luxury-btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
            aria-label="Fermer le profil"
          >
            <span>Fermer</span>
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>
      </header>
    </>
  );

  const renderSubNavigation = () => (
    <div className="w-full flex justify-center">
      <div
        ref={subTabTrackRef}
        role="tablist"
        aria-label="Navigation des sections du profil"
        className={`relative w-full p-1 rounded-2xl border shadow-md grid grid-cols-4 gap-1 ${
          isDark ? 'bg-[#101727] border-[#f2ca50]/25' : 'bg-[#f3ece0] border-[#cbbd9f]'
        }`}
      >
        <GlassSlidingCapsule
          containerRef={subTabTrackRef}
          activeKey={activeSubTab}
          tone={isDark ? 'dark' : 'adaptive'}
        />
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <MotionTooltip
              key={tab.id}
              content={tab.tooltip}
              placement="bottom"
              wrapperClassName="w-full"
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                data-capsule-key={tab.id}
                onClick={() => {
                  playSelectCue();
                  setActiveSubTab(tab.id);
                }}
                className={`relative z-10 w-full py-2.5 px-2 sm:px-3 rounded-full text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  isActive
                    ? 'glass-capsule-active-text'
                    : isDark
                    ? 'text-[#cbd5e1] hover:text-[#ffe088]'
                    : 'text-[#57534e] hover:text-[#6b4b06]'
                }`}
              >
                <span className="material-symbols-outlined text-sm shrink-0">{tab.icon}</span>
                <span className="hidden md:inline truncate">{tab.label}</span>
                <span className="md:hidden truncate">{tab.shortLabel}</span>
              </button>
            </MotionTooltip>
          );
        })}
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="flex flex-col gap-5">
      {/* Executive Scholar Hero Card */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="p-0.5 rounded-full bg-gradient-to-br from-[#fce599] via-[#d4af37] to-[#8a640b] shadow-lg">
                <img
                  src={user?.photoURL || DEFAULT_FALLBACK_AVATAR}
                  alt={user?.displayName || 'Portrait de l’érudit'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.fallbackApplied) return;
                    img.dataset.fallbackApplied = 'true';
                    img.src = '/assets/aistudio/VOLT.png';
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-[#0c1322]"
                />
              </div>
              <span
                aria-label={isOnline ? 'Statut en ligne' : 'Statut hors-ligne'}
                className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full ring-2 ${
                  isDark ? 'ring-[#151b2b]' : 'ring-white'
                } ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1 gap-1">
              {isEditingName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={draftDisplayName}
                    onChange={(e) => setDraftDisplayName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveDisplayName();
                      }
                    }}
                    maxLength={120}
                    aria-label="Modifier votre nom d’affichage académique"
                    className={`px-3 py-1.5 rounded-xl border text-sm font-serif font-bold min-w-[180px] flex-1 focus:outline-none focus:ring-2 focus:ring-[#f2ca50] ${
                      isDark
                        ? 'bg-[#0c1322] border-[#f2ca50]/50 text-[#f3f4f6]'
                        : 'bg-white border-[#cbbd9f] text-[#1c1917]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveDisplayName}
                    className="px-3 py-1.5 rounded-xl luxury-btn-gold text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setDraftDisplayName(user?.displayName || DEFAULT_USER_PROFILE.displayName);
                      setNameFeedback(null);
                    }}
                    className="px-3 py-1.5 rounded-xl luxury-btn-surface text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <h2
                    className={`font-serif text-lg sm:text-xl font-bold truncate ${
                      isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                    }`}
                  >
                    {user?.displayName || DEFAULT_USER_PROFILE.displayName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftDisplayName(user?.displayName || DEFAULT_USER_PROFILE.displayName);
                      setIsEditingName(true);
                      setNameFeedback(null);
                    }}
                    aria-label="Modifier le nom de profil"
                    title="Modifier le nom de profil"
                    className="w-7 h-7 rounded-lg luxury-btn-surface flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
              )}

              {nameFeedback && (
                <span
                  className={`text-[11px] font-medium ${
                    nameFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {nameFeedback.message}
                </span>
              )}

              <span
                className={`text-xs truncate font-mono ${
                  isDark ? 'text-[#d0c5af]' : 'text-[#57534e]'
                }`}
              >
                {user?.email || DEFAULT_USER_PROFILE.email}
              </span>

              <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded-md luxury-btn-amber-soft font-bold">
                  CECRL {selectedLevel}
                </span>
                <span className={isDark ? 'text-[#cbd5e1]' : 'text-[#44403c]'}>
                  {assessment.gradeMeta.shortLabel}
                </span>
                <span aria-hidden="true" className="text-[#99907c]">
                  ·
                </span>
                <span className={isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'}>
                  {isUserSignedInWithGoogle() ? 'Cloud Sync Vérifié' : 'Session Locale'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick 4-KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto shrink-0">
            <div className="px-3 py-2 rounded-xl luxury-hairline-panel flex flex-col">
              <span className="text-[9px] font-mono uppercase text-[#99907c]">Niveau</span>
              <span
                className={`text-sm font-mono font-black tabular-nums ${
                  isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
                }`}
              >
                Niv. {scholarLevel}
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl luxury-hairline-panel flex flex-col">
              <span className="text-[9px] font-mono uppercase text-[#99907c]">XP Total</span>
              <span
                className={`text-sm font-mono font-black tabular-nums ${
                  isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                }`}
              >
                {totalXp.toLocaleString()}
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl luxury-hairline-panel flex flex-col">
              <span className="text-[9px] font-mono uppercase text-[#99907c]">Série</span>
              <span
                className={`text-sm font-mono font-black tabular-nums flex items-center gap-1 ${
                  isDark ? 'text-amber-300' : 'text-amber-700'
                }`}
              >
                <span className="material-symbols-outlined text-xs">local_fire_department</span>
                <span>{streakDays}j</span>
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl luxury-hairline-panel flex flex-col">
              <span className="text-[9px] font-mono uppercase text-[#99907c]">MSZ Coins</span>
              <span
                className={`text-sm font-mono font-black tabular-nums ${
                  isDark ? 'text-[#ffe082]' : 'text-[#8a640b]'
                }`}
              >
                {mszBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* MSZ Collectible Character & Wallet Showcase */}
        <div className="p-3.5 sm:p-4 rounded-xl luxury-hairline-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('inventaire')}
              aria-label={`Ouvrir l’inventaire pour voir ${equippedChar.name}`}
              title="Cliquer pour afficher dans Mon Inventaire"
              className="w-14 h-14 rounded-xl overflow-hidden border border-[#f2ca50]/60 shrink-0 bg-[#070e1d] cursor-pointer hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <img
                src={equippedChar.image}
                alt={equippedChar.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fallbackApplied) return;
                  img.dataset.fallbackApplied = 'true';
                  img.src = '/assets/aistudio/VOLT.png';
                }}
                className="w-full h-full object-cover"
              />
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                <span className={`font-bold uppercase ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
                  Icône Équipée
                </span>
                <span aria-hidden="true" className="text-[#99907c]">
                  ·
                </span>
                <span className={isDark ? 'text-cyan-300 font-bold' : 'text-cyan-700 font-bold'}>
                  Niv. {equippedChar.level}
                </span>
                {equippedInstance && (
                  <>
                    <span aria-hidden="true" className="text-[#99907c]">
                      ·
                    </span>
                    <span
                      className={`font-black tabular-nums ${
                        isDark ? 'text-[#ffd700]' : 'text-[#8a640b]'
                      }`}
                    >
                      N° {equippedInstance.editionNumber}/{equippedInstance.maxSupply || 100}
                    </span>
                  </>
                )}
              </div>
              <span
                className={`font-serif text-sm font-bold truncate mt-0.5 ${
                  isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                }`}
              >
                « {equippedChar.name} » · {equippedChar.element}
              </span>
              <span
                className={`text-[11px] font-mono flex items-center gap-1 mt-0.5 tabular-nums ${
                  isDark ? 'text-[#ffe082]' : 'text-[#785b24]'
                }`}
              >
                <span className="material-symbols-outlined text-xs text-[#f2ca50]">
                  monetization_on
                </span>
                <strong>{mszBalance.toLocaleString()} MSZ Coins</strong>
                <span className="text-[#99907c]">({ownedInstances.length} cartes)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('inventaire')}
              className="px-3 py-1.5 rounded-xl luxury-btn-surface text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-xs text-[#f2ca50]">style</span>
              <span>Mon Inventaire</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShopOpen(true)}
              className="px-3 py-1.5 rounded-xl luxury-btn-gold text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
            >
              <span className="material-symbols-outlined text-xs">storefront</span>
              <span>Boutique</span>
            </button>
          </div>
        </div>

        {/* Distinction Badges Featured Showcase */}
        <div
          className={`pt-3 border-t flex flex-col gap-2.5 ${
            isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">stars</span>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
                }`}
              >
                Distinctions d&apos;Honneur Arborées
              </span>
            </div>
            <span
              className={`text-[11px] font-mono tabular-nums ${
                isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
              }`}
            >
              {unlockedDistinctions.length} / {distinctionBadges.length} Débloquées
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {polyglotteBadge && (
              <button
                type="button"
                onClick={() => setCelebrationBadge(polyglotteBadge)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  polyglotteBadge.isUnlocked
                    ? 'luxury-hairline-panel border-[#f2ca50]/50 hover:border-[#f2ca50]'
                    : 'luxury-hairline-panel opacity-65'
                }`}
                title="Afficher la médaille et l’animation de déblocage"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      polyglotteBadge.isUnlocked
                        ? 'luxury-btn-gold'
                        : 'luxury-hairline-panel text-[#99907c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">wb_sunny</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-serif font-bold truncate ${
                        isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                      }`}
                    >
                      Polyglotte du matin
                    </span>
                    <span
                      className={`text-[10px] font-serif italic truncate ${
                        isDark ? 'text-[#f2ca50]/85' : 'text-[#785b24]'
                      }`}
                    >
                      Poluglottos Matutinus
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                    polyglotteBadge.isUnlocked
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800'
                      : 'text-[#99907c]'
                  }`}
                >
                  {polyglotteBadge.isUnlocked ? 'Actif' : 'Verrouillé'}
                </span>
              </button>
            )}

            {serieBadge && (
              <button
                type="button"
                onClick={() => setCelebrationBadge(serieBadge)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  serieBadge.isUnlocked
                    ? 'luxury-hairline-panel border-[#f2ca50]/50 hover:border-[#f2ca50]'
                    : 'luxury-hairline-panel opacity-65'
                }`}
                title="Afficher la médaille et l’animation de déblocage"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      serieBadge.isUnlocked
                        ? 'luxury-btn-gold'
                        : 'luxury-hairline-panel text-[#99907c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">workspace_premium</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-serif font-bold truncate ${
                        isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                      }`}
                    >
                      Série ininterrompue
                    </span>
                    <span
                      className={`text-[10px] font-serif italic truncate ${
                        isDark ? 'text-[#f2ca50]/85' : 'text-[#785b24]'
                      }`}
                    >
                      Series Inviolata ({streakDays}j)
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums shrink-0 ${
                    serieBadge.isUnlocked
                      ? isDark
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-amber-100 text-amber-800'
                      : 'text-[#99907c]'
                  }`}
                >
                  {serieBadge.isUnlocked ? `${streakDays}j` : '14j requis'}
                </span>
              </button>
            )}
          </div>

          {unlockedDistinctions.length > 0 && (
            <div className="p-3 rounded-xl luxury-hairline-panel flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-base text-[#f2ca50]">
                  workspace_premium
                </span>
                <span className={isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}>
                  <strong className={isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}>
                    {unlockedDistinctions.length} distinction(s) d&apos;honneur
                  </strong>{' '}
                  décernées sur votre profil.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCelebrationBadge(unlockedDistinctions[0])}
                className="px-3 py-1.5 rounded-lg luxury-btn-gold text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
              >
                <span className="material-symbols-outlined text-xs">celebration</span>
                <span>Fanfare &amp; Médaille</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Signal Adaptive Placement Diagnostic & Calibration Card */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Moteur Adaptatif Multi-Signaux
            </span>
            <h3
              className={`font-serif font-bold text-base sm:text-lg ${
                isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
              }`}
            >
              Diagnostic de Placement &amp; Profil Étudiant
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOpenPlacement) {
                onOpenPlacement();
              } else {
                window.dispatchEvent(new CustomEvent('eb_open_placement_modal'));
              }
            }}
            className="px-3.5 py-2 rounded-xl luxury-btn-gold font-bold text-xs flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
          >
            <span className="material-symbols-outlined text-sm">psychology_alt</span>
            <span>{user?.placementTest ? 'Refaire le Diagnostic' : 'Passer le Test (6 axes)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl luxury-hairline-panel">
            <span className="text-[10px] font-mono text-[#99907c] block">CECRL Multi-Signal</span>
            <span
              className={`font-mono font-bold text-sm ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              {assessment.multiSignal.compositeCefr}
            </span>
            <span className={`text-[10px] block tabular-nums ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
              {assessment.multiSignal.confidenceScore}% conf.
            </span>
          </div>
          <div className="p-3 rounded-xl luxury-hairline-panel">
            <span className="text-[10px] font-mono text-[#99907c] block">Vitesse / Rétention</span>
            <span
              className={`font-mono font-bold text-sm tabular-nums ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}
            >
              {assessment.vocabularyRetentionRate}%
            </span>
            <span className={`text-[10px] block ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
              {assessment.learningSpeed === 'fast'
                ? 'Rapide'
                : assessment.learningSpeed === 'methodical'
                ? 'Méthodique'
                : 'Régulière'}
            </span>
          </div>
          <div className="p-3 rounded-xl luxury-hairline-panel">
            <span className="text-[10px] font-mono text-[#99907c] block">Équilibre 4 Axes</span>
            <span
              className={`font-mono font-bold text-sm tabular-nums ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              {assessment.skillBalanceScore}%
            </span>
            <span className={`text-[10px] block tabular-nums ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
              Erreurs {assessment.errorFrequency}%
            </span>
          </div>
          <div className="p-3 rounded-xl luxury-hairline-panel">
            <span className="text-[10px] font-mono text-[#99907c] block">Test de Placement</span>
            <span
              className={`font-mono font-bold text-sm tabular-nums ${
                isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
              }`}
            >
              {user?.placementTest
                ? `${user.placementTest.overallScore}% (${user.placementTest.compositeCefr})`
                : 'Non passé'}
            </span>
            <span className="text-[10px] text-[#99907c] block tabular-nums">
              {assessment.multiSignal.signalsCount} signaux actifs
            </span>
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-1.5 pt-1">
          <span
            className={`text-[11px] font-mono font-bold uppercase ${
              isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
            }`}
          >
            Tranche d&apos;âge :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AGE_RANGES_META.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleAgeSelect(a.id)}
                className={`py-2 px-3 rounded-xl text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  selectedAgeRange === a.id
                    ? 'luxury-btn-gold font-bold'
                    : 'luxury-btn-surface'
                }`}
              >
                <div className="text-xs font-mono font-bold">{a.label}</div>
                <div className="text-[10px] opacity-80">{a.bracket}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-1.5 pt-1">
          <span
            className={`text-[11px] font-mono font-bold uppercase ${
              isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
            }`}
          >
            Objectifs d&apos;apprentissage ({selectedObjectives.length} sélectionnés) :
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LEARNING_OBJECTIVES_META.map((obj) => {
              const active = selectedObjectives.includes(obj.id);
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => handleToggleObjective(obj.id)}
                  className={`p-2.5 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                    active ? 'luxury-btn-amber-soft font-semibold' : 'luxury-btn-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base shrink-0">{obj.icon}</span>
                  <span className="text-xs truncate">{obj.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Academic Badges & Distinctions */}
      <BadgesSection user={user} onBadgeClaimed={handleClaimReward} />
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="flex flex-col gap-5">
      <LinguisticRadarSection user={user} onLaunchSkillModule={onLaunchSkillModule} />

      {/* Journal d'Erreurs & Révision Ciblée */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl luxury-btn-amber-soft flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">history_edu</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
                }`}
              >
                Analyse des Difficultés
              </span>
              <h3
                className={`font-serif font-bold text-base sm:text-lg ${
                  isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                }`}
              >
                Journal d&apos;Erreurs &amp; Révision Ciblée
              </h3>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full border text-[11px] font-mono font-bold tabular-nums shrink-0 ${
              isDark
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {errorCount} point{errorCount > 1 ? 's' : ''} à consolider
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
          Consultez le récapitulatif détaillé des mots manqués en{' '}
          <strong>cartes de répétition espacée</strong> et des erreurs d&apos;orthographe en{' '}
          <strong>dictée</strong>. Lancez une session d&apos;entraînement ciblée pour surmonter vos
          hésitations et gagner de l&apos;XP.
        </p>

        <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => setIsErrorJournalOpen(true)}
            className="flex-1 py-3 px-4 rounded-xl luxury-btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
          >
            <span className="material-symbols-outlined text-base">target</span>
            <span>Ouvrir le Journal &amp; Réviser ({errorCount})</span>
          </button>
        </div>
      </div>

      {/* Citations Favorites de Lord Chesterfield */}
      <FavoriteQuotesSection />
    </div>
  );

  const renderInventoryTab = () => (
    <UserInventorySection
      onOpenShop={() => setIsShopOpen(true)}
      onProfileUpdated={() => {
        setMszBalance(getMszCoinsBalance());
        setEquippedCharId(getEquippedCharacterId());
        setOwnedInstances(getOwnedCardInstances());
        onUpdateUser({});
      }}
    />
  );

  const renderPreferencesTab = () => (
    <div className="flex flex-col gap-5">
      {/* School Grade + CEFR + Study Pace Grid */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-5">
        {/* School Grade Selector */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Classe Scolaire (Collège &amp; Lycée)
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
              }`}
            >
              {selectedGrade === 'terminale' ? 'Terminale' : selectedGrade}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {SCHOOL_GRADES_META.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGradeSelect(g.id, g.targetCefr)}
                className={`py-2.5 rounded-xl flex flex-col items-center justify-center font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  selectedGrade === g.id ? 'luxury-btn-gold font-bold' : 'luxury-btn-surface'
                }`}
              >
                <span className="text-xs font-bold">{g.shortLabel}</span>
                <span className="text-[9px] opacity-80">{g.targetCefr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CEFR Level Selector */}
        <div
          className={`pt-4 border-t flex flex-col gap-2.5 ${
            isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Niveau CECRL Cible
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
              }`}
            >
              {selectedLevel} Sélectionné
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelSelect(lvl)}
                className={`py-2.5 rounded-xl flex flex-col items-center justify-center font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  selectedLevel === lvl ? 'luxury-btn-gold font-bold' : 'luxury-btn-surface'
                }`}
              >
                <span className="text-sm font-bold">{lvl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Study Cadence Target */}
        <div
          className={`pt-4 border-t flex flex-col gap-2.5 ${
            isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-bold uppercase tracking-wider ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Durée Préférée &amp; Cadence Quotidienne
            </span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
              }`}
            >
              {selectedPace} minutes / jour
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {PREFERRED_DURATIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handlePaceSelect(mins)}
                className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  selectedPace === mins ? 'luxury-btn-gold' : 'luxury-btn-surface'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme & Skin Selection */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f2ca50] text-base">palette</span>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Peau &amp; Thème Visuel
            </span>
          </div>
          <span
            className={`text-xs font-mono font-semibold ${
              isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
            }`}
          >
            {skinOptions.find((s) => s.id === theme)?.label || theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {skinOptions.map((skin) => (
            <button
              key={skin.id}
              type="button"
              disabled={skin.locked}
              onClick={() => !skin.locked && setTheme(skin.id as AppTheme)}
              title={skin.hint}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                skin.locked
                  ? 'luxury-hairline-panel text-[#99907c] opacity-55 cursor-not-allowed'
                  : theme === skin.id
                  ? 'luxury-btn-gold font-bold cursor-pointer'
                  : 'luxury-btn-surface cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="material-symbols-outlined text-sm shrink-0">
                  {skin.locked ? 'lock' : skin.icon}
                </span>
                <span className="truncate">{skin.label}</span>
              </div>
              {theme === skin.id && !skin.locked && (
                <span className="material-symbols-outlined text-sm shrink-0">check</span>
              )}
            </button>
          ))}
        </div>

        {/* English Adventure Equipped Avatar Crest */}
        <div
          className={`pt-3 border-t flex items-center justify-between gap-2 text-xs ${
            isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="material-symbols-outlined text-base shrink-0"
              style={{ color: equippedAdventureAvatar.accentHex }}
            >
              {equippedAdventureAvatar.icon}
            </span>
            <span className={`truncate ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
              Emblème Aventure :{' '}
              <strong className={isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}>
                {equippedAdventureAvatar.name}
              </strong>
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold tabular-nums shrink-0 ${
              isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
            }`}
          >
            {adventureState.bossDefeatedIslandIds.length}/7 Îles ·{' '}
            {adventureState.unlockedTrophyIds.length} Trophées
          </span>
        </div>

        {/* Floral border thickness selector */}
        {(theme === 'dark-floral' || theme === 'light-floral') && (
          <div
            className={`pt-3 border-t flex flex-col gap-2 ${
              isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span
                className={`text-[11px] font-semibold ${
                  isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
                }`}
              >
                Largeur de la bordure florale périphérique :
              </span>
              <span
                className={`font-mono font-bold ${
                  isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
                }`}
              >
                {floralWidth}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['0.5cm', '0.75cm', '1cm'] as FloralBorderWidth[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setFloralWidth(w)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                    floralWidth === w ? 'luxury-btn-gold' : 'luxury-btn-surface'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio Alterné & Studio des Voix */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0">
              autoplay
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wider truncate ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Lecture Audio Automatique Alternée
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoPlayAudio}
            aria-label="Activer ou désactiver la lecture automatique des citations et phrases"
            onClick={() => {
              const next = !autoPlayAudio;
              setAutoPlayAudio(next);
              setAutoPlayOnDisplay(next);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              autoPlayAudio
                ? 'bg-[#f2ca50] border-[#f2ca50]'
                : isDark
                ? 'bg-[#232a3a] border-[#4d4635]'
                : 'bg-[#e7dfd1] border-[#cbbd9f]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                autoPlayAudio
                  ? 'translate-x-6 bg-[#0c1322]'
                  : isDark
                  ? 'translate-x-1 bg-[#dce2f8]'
                  : 'translate-x-1 bg-[#57534e]'
              }`}
            />
          </button>
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
          Dès qu&apos;une nouvelle citation ou phrase s&apos;affiche, l&apos;application la lit à
          voix haute en alternant entre l&apos;<strong>anglais britannique (UK)</strong> et
          l&apos;<strong>anglais américain (US)</strong>.
        </p>

        <div
          className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
            isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#99907c]">Prochain accent :</span>
            <span className={`font-bold ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
              {peekNextAlternatingAccent() === 'en-GB'
                ? 'British (en-GB)'
                : 'American (en-US)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextAccent = peekNextAlternatingAccent();
              speakText(
                'Elegance is an art of disciplined expression.',
                nextAccent,
                'test-autoplay-sample'
              );
            }}
            className="px-3 py-1.5 rounded-lg luxury-btn-surface text-xs font-semibold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
          >
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">volume_up</span>
            <span>Tester</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsVoiceStudioOpen(true)}
          className="w-full py-2.5 px-3.5 rounded-xl luxury-btn-surface text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
        >
          <span className="material-symbols-outlined text-sm text-[#f2ca50]">tune</span>
          <span>Studio des Voix : 30 Voix Réelles (5F / 5M · Normal &amp; Grave)</span>
        </button>
      </div>

      {/* Custom Hero Photo Upload & Reset */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
            }`}
          >
            Photographie Personnelle d&apos;Arrière-Plan
          </span>
          {onResetHeroPhoto && (
            <button
              type="button"
              onClick={() => {
                onResetHeroPhoto();
                setPhotoFeedback({
                  type: 'success',
                  message: 'Portrait d’origine restauré.'
                });
              }}
              className="px-2.5 py-1 rounded-lg luxury-btn-surface text-[11px] font-mono font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
          Téléversez une photographie d&apos;art, d&apos;architecture ou de bibliothèque pour
          personnaliser le titre monumental découpé de votre page d&apos;accueil.
        </p>

        <label className="w-full py-3 px-4 rounded-xl luxury-btn-surface border-dashed text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploadingPhoto}
            className="hidden"
          />
          <span className="material-symbols-outlined text-base text-[#f2ca50]">
            {isUploadingPhoto ? 'sync' : 'upload_file'}
          </span>
          <span>
            {isUploadingPhoto
              ? 'Téléversement en cours...'
              : 'Sélectionner une image personnelle'}
          </span>
        </label>

        {photoFeedback && (
          <p
            className={`text-xs font-medium ${
              photoFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {photoFeedback.message}
          </p>
        )}
      </div>

      {/* Mobile App Icon & Home Screen Installation */}
      {onOpenInstallModal && (
        <div className="p-5 rounded-2xl luxury-card-surface flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-[#f2ca50] via-[#c69214] to-[#f2ca50] shadow-md shrink-0">
              <img
                src={appIconImg}
                alt="Icône English Boost MSZ"
                className="w-full h-full object-cover rounded-[10px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
                }`}
              >
                Application Mobile &amp; Tablette
              </span>
              <h4
                className={`font-serif font-bold text-sm truncate ${
                  isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                }`}
              >
                Icône d&apos;Écran d&apos;Accueil iOS &amp; Android
              </h4>
              <p className={`text-[11px] truncate ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
                Accès plein écran direct avec prise en charge hors-ligne.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (mode === 'modal') onClose();
              onOpenInstallModal();
            }}
            className="px-3.5 py-2 rounded-xl luxury-btn-gold text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
          >
            <span className="material-symbols-outlined text-sm">install_mobile</span>
            <span>Installer</span>
          </button>
        </div>
      )}

      {/* Firebase Firestore & Google Auth Persistence Control Zone */}
      <div className="p-5 sm:p-6 rounded-2xl luxury-card-surface flex flex-col gap-3.5">
        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'
              }`}
            >
              Firebase Firestore &amp; Google Auth
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isOnline
                  ? isDark
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isDark
                  ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {isOnline ? 'En ligne' : 'Hors-ligne'}
            </span>
            <span
              className={`text-[11px] font-mono font-semibold hidden sm:inline ${
                isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'
              }`}
              title={`Base : ${firestoreDbId}`}
            >
              Projet {firebaseProjectId}
            </span>
          </div>
        </div>

        {auth?.currentUser && !auth.currentUser.isAnonymous ? (
          <div className="p-3.5 rounded-xl luxury-hairline-panel border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">
                verified_user
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-bold truncate ${
                    isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
                  }`}
                >
                  {auth.currentUser.displayName || 'Érudit Authentifié'}
                </span>
                <span
                  className={`text-[11px] font-mono truncate ${
                    isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'
                  }`}
                >
                  {auth.currentUser.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg luxury-btn-ruby text-xs font-semibold cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
              Connectez votre compte Google pour sauvegarder et synchroniser automatiquement tous
              vos scores de dictée, quiz, révisions SM-2 et votre progression académique dans Cloud{' '}
              <strong>Firebase Firestore</strong>.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSigningIn}
                className="flex-1 py-3 px-4 rounded-xl luxury-btn-gold font-bold text-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isSigningIn ? 'Connexion en cours...' : "S'inscrire / Se connecter avec Google"}
                </span>
              </button>
            </div>
          </>
        )}

        {authFeedback && (
          <div
            role="status"
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              authFeedback.type === 'success'
                ? isDark
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : isDark
                ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm shrink-0">
              {authFeedback.type === 'success' ? 'verified' : 'info'}
            </span>
            <span>{authFeedback.message}</span>
          </div>
        )}

        {/* Sync Controls */}
        <div
          className={`mt-1 pt-3.5 border-t flex flex-col gap-3 ${
            isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'
          }`}
        >
          <div className="p-3.5 rounded-xl luxury-hairline-panel flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <span
                className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${
                  isSyncing
                    ? 'text-[#f2ca50] animate-spin'
                    : isOnline
                    ? 'text-[#f2ca50]'
                    : 'text-[#8391ac]'
                }`}
              >
                {isSyncing ? 'sync' : isOnline ? 'cloud_sync' : 'cloud_off'}
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-bold ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}
                >
                  Synchronisation Firestore immédiate
                </span>
                <span className={`text-[11px] leading-snug ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
                  {!isOnline
                    ? 'Connexion Internet requise pour déclencher la synchronisation.'
                    : isSyncing
                    ? 'Synchronisation bidirectionnelle avec Cloud Firestore en cours...'
                    : 'Pousser et réconcilier immédiatement vos données locales avec Cloud Firestore.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isSyncing || syncSwitchEngaged}
              aria-label="Déclencher une synchronisation Firestore immédiate"
              disabled={!isOnline || isSyncing}
              onClick={handleManualFirestoreSync}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                !isOnline
                  ? 'opacity-50 cursor-not-allowed bg-[#191f2f] border-[#2e3b55]'
                  : isSyncing || syncSwitchEngaged
                  ? 'bg-[#f2ca50] border-[#f2ca50] cursor-wait'
                  : isDark
                  ? 'bg-[#232a3a] hover:border-[#f2ca50]/70 border-[#4d4635] cursor-pointer'
                  : 'bg-[#e7dfd1] hover:border-[#8a640b] border-[#cbbd9f] cursor-pointer'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                  isSyncing || syncSwitchEngaged
                    ? 'translate-x-6 bg-[#0c1322]'
                    : 'translate-x-1 bg-[#f2ca50]'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-xl luxury-hairline-panel flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-base text-[#f2ca50] mt-0.5 shrink-0">
                autorenew
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-semibold ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}
                >
                  Synchronisation automatique en arrière-plan
                </span>
                <span className="text-[11px] text-[#99907c] leading-snug">
                  {autoSyncEnabled
                    ? 'Active : synchronisation automatique à la reconnexion et toutes les 45 s.'
                    : 'Manuelle uniquement : vous gardez le contrôle exclusif des envois.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={autoSyncEnabled}
              aria-label="Activer ou désactiver la synchronisation automatique en arrière-plan"
              onClick={() => {
                playSelectCue();
                setAutoSyncEnabled(!autoSyncEnabled);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                autoSyncEnabled
                  ? 'bg-[#f2ca50] border-[#f2ca50]'
                  : isDark
                  ? 'bg-[#232a3a] border-[#4d4635]'
                  : 'bg-[#e7dfd1] border-[#cbbd9f]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                  autoSyncEnabled
                    ? 'translate-x-6 bg-[#0c1322]'
                    : isDark
                    ? 'translate-x-1 bg-[#dce2f8]'
                    : 'translate-x-1 bg-[#57534e]'
                }`}
              />
            </button>
          </div>

          {/* Live Sync Status Row */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#99907c] px-1 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#f2ca50]">schedule</span>
              <span>
                Dernière synchro :{' '}
                <strong className={isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}>
                  {formatSyncTimestamp(lastSyncTime)}
                </strong>
              </span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border tabular-nums ${
                pendingCount > 0
                  ? isDark
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/30 font-bold'
                    : 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                  : 'luxury-hairline-panel'
              }`}
            >
              {pendingCount > 0 ? `${pendingCount} élément(s) en file locale` : 'File locale synchronisée'}
            </span>
          </div>

          {manualSyncFeedback && (
            <div
              role="status"
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                manualSyncFeedback.status === 'success'
                  ? isDark
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : manualSyncFeedback.status === 'unauthenticated'
                  ? isDark
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                  : isDark
                  ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm shrink-0">
                {manualSyncFeedback.status === 'success'
                  ? 'cloud_done'
                  : manualSyncFeedback.status === 'unauthenticated'
                  ? 'account_circle'
                  : 'error'}
              </span>
              <span>{manualSyncFeedback.message}</span>
            </div>
          )}

          {syncError && !manualSyncFeedback && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm shrink-0">warning</span>
              <span>{syncError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMainBody = () => (
    <div
      className={
        mode === 'page'
          ? 'w-full flex flex-col gap-5'
          : 'max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-5'
      }
    >
      {mode === 'page' && renderPageHeader()}

      {renderSubNavigation()}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSubTab}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: shouldReduceMotion ? 0.08 : 0.18, ease: SECTION_EASE }}
        >
          {activeSubTab === 'apercu' && renderOverviewTab()}
          {activeSubTab === 'analytics' && renderAnalyticsTab()}
          {activeSubTab === 'inventaire' && renderInventoryTab()}
          {activeSubTab === 'preferences' && renderPreferencesTab()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Persistence Summary Card */}
      <div className="p-4 sm:p-5 rounded-2xl luxury-card-surface flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full luxury-btn-amber-soft flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className={`font-serif font-bold text-sm ${
                isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'
              }`}
            >
              Préférences et progression sauvegardées
            </span>
            <span className="text-xs text-[#99907c] truncate">
              {!isOnline
                ? `Mode hors-ligne actif · ${pendingCount} modification(s) sur IndexedDB`
                : isUserSignedInWithGoogle()
                ? `Connecté à Cloud Firestore (${firestoreDbId}) · ${formatSyncTimestamp(lastSyncTime)}`
                : 'Enregistré localement (IndexedDB) · Connectez Google pour la synchro Cloud'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl luxury-btn-gold font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{mode === 'page' ? 'Retour à l’Accueil' : 'Sortir & Reprendre'}</span>
        </button>
      </div>
    </div>
  );

  const nestedModals = (
    <>
      <BadgeUnlockModal
        badge={celebrationBadge}
        isOpen={!!celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
        alreadyClaimed={celebrationBadge ? claimedBadgeIds.includes(celebrationBadge.id) : false}
        onClaimReward={handleClaimReward}
      />

      {isErrorJournalOpen && (
        <Suspense fallback={null}>
          <LazyErrorJournalModal
            isOpen={isErrorJournalOpen}
            onClose={() => {
              setIsErrorJournalOpen(false);
              setErrorCount(getErrorJournal().filter((i) => !i.resolved).length);
            }}
            onXpEarned={(xp) => {
              onUpdateUser({
                stats: {
                  ...safeStats,
                  totalXp: (safeStats?.totalXp ?? 0) + xp,
                  weeklyXp: (safeStats?.weeklyXp ?? 0) + xp
                }
              });
            }}
          />
        </Suspense>
      )}

      {isVoiceStudioOpen && (
        <Suspense fallback={null}>
          <LazyVoiceStudioModal
            isOpen={isVoiceStudioOpen}
            onClose={() => setIsVoiceStudioOpen(false)}
          />
        </Suspense>
      )}

      {isShopOpen && (
        <Suspense fallback={null}>
          <LazyMszShopModal
            isOpen={isShopOpen}
            onClose={() => {
              setIsShopOpen(false);
              setMszBalance(getMszCoinsBalance());
              setEquippedCharId(getEquippedCharacterId());
            }}
            userLevel={scholarLevel}
            onProfileUpdated={() => {
              setMszBalance(getMszCoinsBalance());
              setEquippedCharId(getEquippedCharacterId());
            }}
          />
        </Suspense>
      )}
    </>
  );

  if (mode === 'page') {
    return (
      <section
        aria-label="Profil et paramètres de l’étudiant"
        className="w-full flex flex-col gap-5 select-none pb-6"
      >
        {renderMainBody()}
        {nestedModals}
      </section>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profil et paramètres"
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col animate-fadeIn select-none ${
        isDark ? 'bg-[#0c1322]' : 'bg-[#f7f4ee]'
      }`}
    >
      {renderModalHeader()}
      <main className="flex-1">{renderMainBody()}</main>

      {/* Sticky Bottom Exit Bar in modal mode */}
      <div
        className={`sticky bottom-0 z-30 w-full backdrop-blur-2xl border-t px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] flex items-center justify-center ${
          isDark ? 'bg-[#0c1322]/95 border-[#232a3a]' : 'bg-[#f7f4ee]/95 border-[#d6cebe]'
        }`}
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-full max-w-md py-3 px-6 rounded-2xl luxury-btn-gold font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
        >
          <span className="material-symbols-outlined text-base font-bold">arrow_back</span>
          <span>Quitter le Profil &amp; Continuer mes Leçons</span>
        </button>
      </div>

      {nestedModals}
    </div>
  );
};
