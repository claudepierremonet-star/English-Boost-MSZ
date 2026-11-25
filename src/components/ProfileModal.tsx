import React, { useState, useEffect, useRef } from 'react';
import type {
  UserProfile,
  CEFRLevel,
  AcademicBadge,
  SchoolGrade,
  AgeRangeKey,
  LearningObjectiveId
} from '../firebase/types';
import { signInWithGoogle, signOutUser, isFirebaseConfigured, auth, isUserSignedInWithGoogle } from '../firebase/client';
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
import { ErrorJournalModal } from './ErrorJournalModal';
import { VoiceStudioModal } from './VoiceStudioModal';
import { MszShopModal } from './MszShopModal';
import { UserInventorySection } from './UserInventorySection';
import {
  getMszCoinsBalance,
  getEquippedCharacterId,
  getOwnedCardInstances,
  formatEditionNumber,
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

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onCustomPhotoUpload: (file: File) => Promise<string>;
  onOpenInstallModal?: () => void;
  onOpenPlacement?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onUpdateUser,
  onCustomPhotoUpload,
  onOpenInstallModal,
  onOpenPlacement
}) => {
  const { assessment } = useAdaptiveProfile(user);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(user.level);
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>(
    user.schoolGrade || inferGradeFromCefr(user.level)
  );
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRangeKey>(
    user.ageRange || inferAgeRangeFromGrade(user.schoolGrade || inferGradeFromCefr(user.level))
  );
  const [selectedObjectives, setSelectedObjectives] = useState<LearningObjectiveId[]>(
    user.learningObjectives && user.learningObjectives.length > 0
      ? user.learningObjectives
      : ['school_excellence', 'oral_fluency']
  );
  const [selectedPace, setSelectedPace] = useState<number>(
    user.preferredDurationMinutes || user.stats.studyMinutesTarget || 30
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(getAutoPlayOnDisplay());
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
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'inventory'>('profile');
  const [ownedInstances, setOwnedInstances] = useState<OwnedCardInstance[]>(() => getOwnedCardInstances());
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

  const allBadges = computeUserBadges(user);
  const distinctionBadges = allBadges.filter((b) => b.category === 'distinction');
  const unlockedDistinctions = distinctionBadges.filter((b) => b.isUnlocked);
  const polyglotteBadge = distinctionBadges.find((b) => b.id === 'polyglotte_matin') || distinctionBadges[0];
  const serieBadge = distinctionBadges.find((b) => b.id === 'serie_ininterrompue') || distinctionBadges[1];

  // Auto-detect newly unlocked distinctions for celebration notification
  useEffect(() => {
    try {
      const acknowledged = JSON.parse(localStorage.getItem('eb_msz_acknowledged_distinctions') || '[]');
      const newlyUnlocked = unlockedDistinctions.find((b) => !acknowledged.includes(b.id));
      if (newlyUnlocked) {
        setCelebrationBadge(newlyUnlocked);
        localStorage.setItem(
          'eb_msz_acknowledged_distinctions',
          JSON.stringify([...acknowledged, newlyUnlocked.id])
        );
      }
    } catch {
      // ignore
    }
  }, [unlockedDistinctions]);

  // Support touche Échap (clavier physique iPad / Mac / PC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClaimReward = (badge: AcademicBadge) => {
    if (!badge.isUnlocked || claimedBadgeIds.includes(badge.id)) {
      setCelebrationBadge(null);
      return;
    }
    const nextClaimed = [...claimedBadgeIds, badge.id];
    setClaimedBadgeIds(nextClaimed);
    try {
      localStorage.setItem('eb_msz_claimed_badges', JSON.stringify(nextClaimed));
    } catch {}
    onUpdateUser({
      stats: {
        ...user.stats,
        totalXp: (user.stats.totalXp || 0) + badge.xpReward
      }
    });
    setCelebrationBadge(null);
  };

  const handleLevelSelect = (lvl: CEFRLevel) => {
    setSelectedLevel(lvl);
    onUpdateUser({ level: lvl });
  };

  const handleGradeSelect = (grade: SchoolGrade, targetCefr: CEFRLevel) => {
    setSelectedGrade(grade);
    setSelectedLevel(targetCefr);
    const nextAge = inferAgeRangeFromGrade(grade);
    setSelectedAgeRange(nextAge);
    onUpdateUser({ schoolGrade: grade, level: targetCefr, ageRange: nextAge });
  };

  const handleAgeSelect = (age: AgeRangeKey) => {
    setSelectedAgeRange(age);
    onUpdateUser({ ageRange: age });
  };

  const handleToggleObjective = (objId: LearningObjectiveId) => {
    const exists = selectedObjectives.includes(objId);
    const next = exists
      ? selectedObjectives.filter((id) => id !== objId)
      : [...selectedObjectives, objId];
    const finalObjectives: LearningObjectiveId[] = next.length > 0 ? next : [objId];
    setSelectedObjectives(finalObjectives);
    onUpdateUser({ learningObjectives: finalObjectives });
  };

  const handlePaceSelect = (mins: number) => {
    setSelectedPace(mins);
    onUpdateUser({
      preferredDurationMinutes: mins,
      stats: {
        ...user.stats,
        studyMinutesTarget: mins
      }
    });
  };

  const handleGoogleAuth = async () => {
    setIsSigningIn(true);
    try {
      const signedInUser = await signInWithGoogle();
      onUpdateUser(signedInUser);
    } catch (err) {
      console.warn('Auth error', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onClose();
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
    try {
      const newUrl = await onCustomPhotoUpload(file);
      onUpdateUser({ heroImageURL: newUrl });
    } catch (err) {
      console.error('Photo upload error', err);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const { theme, floralWidth, setTheme, setFloralWidth, isDark } = useAppTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col animate-fadeIn select-none">
      {/* Header avec espacement sécurisé pour Dynamic Island / Notch iPhone */}
      <header
        className="sticky top-0 z-30 w-full bg-[#0c1322]/95 backdrop-blur-2xl border-b border-[#232a3a] shadow-lg flex flex-col justify-end"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 28px)'
        }}
      >
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 max-w-xl mx-auto w-full">
          {/* Bouton Retour tactile & stylisé d'Oxford */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#151c2c] hover:bg-[#1f293e] border border-[#f2ca50]/70 text-[#f2ca50] hover:text-[#ffe088] shadow-md transition-all active:scale-95 cursor-pointer font-sans"
            aria-label="Revenir en arrière"
            title="Revenir aux cours et leçons"
          >
            <span className="material-symbols-outlined text-lg font-bold">arrow_back</span>
            <span className="text-xs font-serif font-bold uppercase tracking-wider">Retour</span>
          </button>

          {/* Titre centralisé */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#f3f4f6] leading-tight">
              Profil & Paramètres
            </h1>
            <span className="text-[10px] font-mono text-[#d4c78f] uppercase tracking-widest hidden sm:block">
              Académie d'Oxford MSZ
            </span>
          </div>

          {/* Bouton Fermer */}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1 cursor-pointer font-sans"
            aria-label="Fermer le profil"
            title="Fermer le profil"
          >
            <span>Fermer</span>
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>
      </header>

      {/* Ruban Artistique d'Oxford & Bouton de Sortie Immédiate (Visible sous la bordure iPhone) */}
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 pt-3 pb-1">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#172338] via-[#101828] to-[#1c2840] border border-[#f2ca50]/50 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f2ca50] to-[#b4830c] text-[#2c1d00] flex items-center justify-center font-bold shadow-md shrink-0">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold truncate">
                ESPACE ÉTUDIANT & PARAMÈTRES
              </span>
              <span className="text-xs text-[#d0c5af] truncate">
                Préférences enregistrées automatiquement
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#3c2f00] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer font-sans"
            title="Sortir du profil et retourner à l'application"
          >
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            <span>Sortir</span>
          </button>
        </div>
      </div>

      {/* Profile & Inventory Tab Switcher */}
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 pt-2 pb-0">
        <div className="p-1 rounded-2xl bg-[#121929] border border-[#232a3a] flex items-center gap-1.5 shadow-md">
          <button
            type="button"
            onClick={() => setActiveProfileTab('profile')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeProfileTab === 'profile'
                ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                : 'text-[#8391ac] hover:text-white hover:bg-[#151f33]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            <span>Profil & Distinctions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab('inventory')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeProfileTab === 'inventory'
                ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                : 'text-[#8391ac] hover:text-white hover:bg-[#151f33]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">style</span>
            <span>Mon Inventaire ({ownedInstances.length})</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#070e1d] text-[#ffd700] text-[10px] font-mono font-black border border-[#ffd700]/30 hidden sm:inline">
              1/100
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-5">
        {activeProfileTab === 'inventory' ? (
          <UserInventorySection
            onOpenShop={() => setIsShopOpen(true)}
            onProfileUpdated={() => {
              setMszBalance(getMszCoinsBalance());
              setEquippedCharId(getEquippedCharacterId());
              setOwnedInstances(getOwnedCardInstances());
              onUpdateUser({});
            }}
          />
        ) : (
          <>
            {/* User Card with Distinction Badges Ribbon */}
            <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-j7VL5y1DulQO0ZUCmnVFKLzFgtqJ6ouE2w9tmtLT3GVTZ_f2HPrOXW27YcfNEv8XdaJBOR-xtCBTw965W8fuNDTngB1zPJOHyM4UEWMFLgliMGJq6IIA71cgZEZSfEarfPuCe6iC30vMqY3q7oyRonk89ZQ92-zclRrEwZWtP5qiv_HZvOnkMcB32962jQBrwbJAe0qa8CYPLZB8qH35jyDTntTaFWJh6C8_OVoDa8wDvwlgBHr'}
                alt={user.displayName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#f2ca50]"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#191f2f]" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-serif text-lg font-bold text-[#dce2f8] truncate">
                {user.displayName}
              </span>
              <span className="text-xs text-[#d0c5af] truncate font-mono">{user.email}</span>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[10px] text-[#f2ca50] font-bold font-mono">
                  {user.level} ADVANCED
                </span>
                <span className="text-xs text-[#d4c78f] font-mono">
                  {user.stats.totalXp.toLocaleString()} XP
                </span>
                <span className="text-xs text-amber-300 font-mono flex items-center gap-1 bg-[#232a3a] px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[13px] text-amber-400">local_fire_department</span>
                  <span>{user.stats.streakDays}j</span>
                </span>
              </div>
            </div>
          </div>

          {/* MSZ Collectible Character & Wallet Showcase */}
          <div className="p-3.5 rounded-xl bg-[#121929] border border-[#f2ca50]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => setActiveProfileTab('inventory')}
                className="w-13 h-13 rounded-xl overflow-hidden border border-[#f2ca50]/60 shrink-0 bg-[#070e1d] cursor-pointer hover:scale-105 transition-transform"
                title="Cliquer pour afficher dans Mon Inventaire"
              >
                <img
                  src={equippedChar.image}
                  alt={equippedChar.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase">
                    Icône Équipée
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    Niv. {equippedChar.level}
                  </span>
                  {equippedInstance && (
                    <span className="text-[9px] font-mono font-black text-[#ffd700] px-1.5 py-0.2 rounded bg-amber-500/25 border border-amber-400/50">
                      N° {equippedInstance.editionNumber}/{equippedInstance.maxSupply || 100}
                    </span>
                  )}
                </div>
                <span className="font-serif text-sm font-bold text-white truncate">
                  « {equippedChar.name} » &bull; {equippedChar.element}
                </span>
                <span className="text-[10px] text-[#ffe082] font-mono flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs text-[#f2ca50]">monetization_on</span>
                  <strong>{mszBalance} MSZ Coins</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveProfileTab('inventory')}
                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#25355a] text-[#ffe082] text-xs font-mono font-bold flex items-center gap-1 border border-[#f2ca50]/30 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Accéder à Mon Inventaire de cartes"
              >
                <span className="material-symbols-outlined text-xs">style</span>
                <span>Mon Inventaire</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] text-xs font-mono font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">storefront</span>
                <span>Boutique</span>
              </button>
            </div>
          </div>

          {/* Distinction Badges Featured Showcase */}
          <div className="pt-3 border-t border-[#232a3a] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#f2ca50] text-sm">stars</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                  Distinctions d'Honneur Arborées
                </span>
              </div>
              <span className="text-[10px] text-[#d4c78f] font-mono">
                {unlockedDistinctions.length} / {distinctionBadges.length} Débloquées
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Polyglotte du matin */}
              <div
                onClick={() => setCelebrationBadge(polyglotteBadge)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  polyglotteBadge?.isUnlocked
                    ? 'bg-gradient-to-r from-[#23251c] to-[#1e2333] border-[#f2ca50]/50 hover:border-[#f2ca50] shadow-sm'
                    : 'bg-[#151b2b]/60 border-[#2b3345] opacity-60'
                }`}
                title="Cliquer pour afficher l'animation de déblocage avec fanfare et confettis"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-inner ${
                    polyglotteBadge?.isUnlocked
                      ? 'bg-gradient-to-br from-[#f2ca50] to-[#b38916] text-[#2a1e00] font-bold'
                      : 'bg-[#232a3a] text-[#717b94]'
                  }`}>
                    <span className="material-symbols-outlined text-base">wb_sunny</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-serif font-bold text-[#dce2f8] truncate">
                      Polyglotte du matin
                    </span>
                    <span className="text-[10px] font-serif italic text-[#f2ca50]/80 truncate">
                      Poluglottos Matutinus
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {polyglotteBadge?.isUnlocked ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">verified</span>
                      Actif
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#717b94] font-mono">Verrouillé</span>
                  )}
                </div>
              </div>

              {/* Série ininterrompue */}
              <div
                onClick={() => setCelebrationBadge(serieBadge)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  serieBadge?.isUnlocked
                    ? 'bg-gradient-to-r from-[#241d24] to-[#1e2333] border-[#d4af37]/60 hover:border-[#f2ca50] shadow-sm'
                    : 'bg-[#151b2b]/60 border-[#2b3345] opacity-60'
                }`}
                title="Cliquer pour afficher l'animation de déblocage avec fanfare et confettis"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-inner ${
                    serieBadge?.isUnlocked
                      ? 'bg-gradient-to-br from-[#e0bb39] via-[#c4981a] to-[#916b08] text-[#2a1e00] font-bold'
                      : 'bg-[#232a3a] text-[#717b94]'
                  }`}>
                    <span className="material-symbols-outlined text-base">workspace_premium</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-serif font-bold text-[#dce2f8] truncate">
                      Série ininterrompue
                    </span>
                    <span className="text-[10px] font-serif italic text-[#f2ca50]/80 truncate">
                      Series Inviolata ({user.stats.streakDays}j)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {serieBadge?.isUnlocked ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">bolt</span>
                      {user.stats.streakDays}j
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#717b94] font-mono">14j requis</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notification alert banner for newly unlocked distinctions */}
            {unlockedDistinctions.length > 0 && (
              <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-r from-[#2a2212] to-[#191f2f] border border-[#f2ca50]/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-base animate-bounce">🎖️</span>
                  <span className="text-[#dce2f8] text-[11px]">
                    <strong className="text-[#f2ca50]">{unlockedDistinctions.length} distinctions d'honneur</strong> débloquées sur votre profil.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCelebrationBadge(unlockedDistinctions[0])}
                  className="px-2.5 py-1 rounded-lg bg-[#f2ca50] text-[#3c2f00] text-[10px] font-mono font-bold hover:bg-[#ffe088] transition-all shrink-0 flex items-center gap-1 shadow cursor-pointer"
                >
                  <span>✨</span>
                  <span>Fanfare & Médaille</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 'Statistiques Avancées' (Radar des compétences linguistiques) */}
        <LinguisticRadarSection user={user} />

        {/* Section 'Journal d'Erreurs & Révision Ciblée' */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1a2336] via-[#131b2c] to-[#0d1424] border border-[#f2ca50]/50 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/20 border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-inner shrink-0">
                <span className="material-symbols-outlined text-xl">history_edu</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#f2ca50] font-bold uppercase tracking-wider font-mono">
                    ANALYSE DES DIFFICULTÉS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-ping" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#f3f4f6]">
                  Journal d'Erreurs & Révision Ciblée
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold shrink-0">
              {errorCount} point{errorCount > 1 ? 's' : ''} à consolider
            </span>
          </div>

          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            Consultez le récapitulatif détaillé des mots manqués en <strong>cartes de répétition espacée</strong> et des erreurs d'orthographe en <strong>dictée</strong>. Lancez une session d'entraînement ciblée pour surmonter vos hésitations et gagner de l'XP.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => setIsErrorJournalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#3c2f00] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/20 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-base">target</span>
              <span>Ouvrir le Journal & Réviser ({errorCount})</span>
            </button>
          </div>
        </div>

        {/* Section 'Mes Citations Favorites de Lord Chesterfield' */}
        <FavoriteQuotesSection />

        {/* Academic Badges & Distinctions */}
        <BadgesSection user={user} />

        {/* Theme & Skin Selection */}
        <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-base">palette</span>
              <span className="text-xs text-[#f2ca50] font-bold uppercase tracking-wider">
                Peau & Thème Visuel
              </span>
            </div>
            <span className="text-xs text-[#d4c78f] font-mono">
              {theme === 'dark'
                ? 'Sombre'
                : theme === 'light'
                ? 'Claire'
                : theme === 'dark-floral'
                ? 'Sombre Florale'
                : theme === 'light-floral'
                ? 'Claire Florale'
                : ADVENTURE_THEMES.find((t) => t.id === theme)?.name || theme}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'dark', label: 'Sombre Classique', icon: 'dark_mode', locked: false },
              { id: 'light', label: 'Claire Albâtre', icon: 'light_mode', locked: false },
              { id: 'dark-floral', label: 'Sombre Florale', icon: 'local_florist', locked: false },
              { id: 'light-floral', label: 'Claire Florale', icon: 'local_florist', locked: false },
              ...ADVENTURE_THEMES.map((th) => ({
                id: th.id,
                label: th.name,
                icon: 'auto_awesome',
                locked: !getEnglishAdventureState(user).unlockedThemeIds.includes(th.id)
              }))
            ].map((skin) => (
              <button
                key={skin.id}
                type="button"
                disabled={skin.locked}
                onClick={() => !skin.locked && setTheme(skin.id as AppTheme)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  skin.locked
                    ? 'bg-[#121929] text-[#717b94] border-[#232a3a] opacity-55 cursor-not-allowed'
                    : theme === skin.id
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md font-bold cursor-pointer'
                    : 'bg-[#232a3a] text-[#dce2f8] border-[#4d4635]/30 hover:bg-[#2e3545] cursor-pointer'
                }`}
                title={
                  skin.locked
                    ? ADVENTURE_THEMES.find((t) => t.id === skin.id)?.unlockRequirementFr
                    : skin.label
                }
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-sm">
                    {skin.locked ? 'lock' : skin.icon}
                  </span>
                  <span className="truncate">{skin.label}</span>
                </div>
                {theme === skin.id && !skin.locked && (
                  <span className="material-symbols-outlined text-sm">check</span>
                )}
              </button>
            ))}
          </div>

          {/* English Adventure Equipped Avatar Crest */}
          {(() => {
            const adv = getEnglishAdventureState(user);
            const advAv =
              ADVENTURE_AVATARS.find((a) => a.id === adv.equippedAvatarId) || ADVENTURE_AVATARS[0];
            return (
              <div className="pt-2 border-t border-[#232a3a] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="material-symbols-outlined text-base shrink-0"
                    style={{ color: advAv.accentHex }}
                  >
                    {advAv.icon}
                  </span>
                  <span className="text-[#d0c5af] truncate">
                    Emblème Aventure : <strong className="text-[#dce2f8]">{advAv.name}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#f2ca50] shrink-0">
                  {adv.bossDefeatedIslandIds.length}/7 Îles · {adv.unlockedTrophyIds.length} Trophées
                </span>
              </div>
            );
          })()}

          {/* Floral border thickness selector (0.5cm à 1cm) */}
          {(theme === 'dark-floral' || theme === 'light-floral') && (
            <div className="pt-2 border-t border-[#232a3a] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#d4c78f] text-[11px] font-semibold">
                  Largeur de la bordure florale périphérique :
                </span>
                <span className="text-[#f2ca50] font-mono font-bold">{floralWidth}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['0.5cm', '0.75cm', '1cm'] as FloralBorderWidth[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setFloralWidth(w)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                      floralWidth === w
                        ? 'bg-[#4f471b] text-[#f2ca50] border-[#f2ca50]'
                        : 'bg-[#070e1d] text-[#d0c5af] border-[#4d4635]/30'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Authentication & Firestore Persistence Control Zone */}
        <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/30 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                Firebase Firestore & Google Auth
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  isOnline
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                }`}
              >
                {isOnline ? 'En ligne' : 'Hors-ligne'}
              </span>
              <span className="text-[11px] text-[#d4c78f] font-mono font-semibold hidden sm:inline">
                Projet feisty-cipher-2tn3v
              </span>
            </div>
          </div>

          {auth?.currentUser && !auth.currentUser.isAnonymous ? (
            <div className="p-3.5 rounded-xl bg-[#0c1322] border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">verified_user</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#dce2f8] truncate">
                    {auth.currentUser.displayName || 'Érudit Authentifié'}
                  </span>
                  <span className="text-[11px] font-mono text-[#d0c5af] truncate">
                    {auth.currentUser.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-[#232a3a] hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#d0c5af] leading-relaxed">
                Connectez votre compte Google pour sauvegarder et synchroniser automatiquement tous vos scores de dictée, quiz, révisions SM-2 et votre progression académique dans la base de données Cloud <strong>Firebase Firestore</strong>.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSigningIn}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-md shadow-[#f2ca50]/20 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isSigningIn ? 'Connexion en cours...' : 'S\'inscrire / Se connecter avec Google'}</span>
                </button>
              </div>
            </>
          )}

          {/* User-Controlled Immediate Firestore Sync & Persistence Agency */}
          <div className="mt-1 pt-3.5 border-t border-[#232a3a] flex flex-col gap-3">
            {/* 1. Manual Immediate Firestore Sync Toggle */}
            <div
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isOnline
                  ? 'bg-[#0c1322] border-[#f2ca50]/35'
                  : 'bg-[#0c1322]/60 border-[#2e3b55] opacity-75'
              }`}
            >
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
                  <span className="text-xs font-bold text-[#dce2f8]">
                    Synchronisation Firestore immédiate
                  </span>
                  <span className="text-[11px] text-[#d0c5af] leading-snug">
                    {!isOnline
                      ? 'Connexion Internet requise pour déclencher la synchronisation.'
                      : isSyncing
                      ? 'Synchronisation bidirectionnelle avec Cloud Firestore en cours...'
                      : 'Activez pour pousser et réconcilier immédiatement vos données locales avec Cloud Firestore.'}
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
                title={
                  !isOnline
                    ? 'Disponible uniquement lorsque vous êtes en ligne'
                    : 'Déclencher immédiatement la synchronisation Cloud Firestore'
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors border ${
                  !isOnline
                    ? 'bg-[#191f2f] border-[#2e3b55] cursor-not-allowed opacity-50'
                    : isSyncing || syncSwitchEngaged
                    ? 'bg-[#f2ca50] border-[#f2ca50] cursor-wait shadow-[0_0_12px_rgba(242,202,80,0.45)]'
                    : 'bg-[#232a3a] hover:border-[#f2ca50]/70 border-[#4d4635] cursor-pointer'
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

            {/* 2. Auto-Sync Background Preference Toggle */}
            <div className="p-3 rounded-xl bg-[#0c1322]/75 border border-[#232a3a] flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-base text-[#d4c78f] mt-0.5 shrink-0">
                  autorenew
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#dce2f8]">
                    Synchronisation automatique en arrière-plan
                  </span>
                  <span className="text-[11px] text-[#99907c] leading-snug">
                    {autoSyncEnabled
                      ? 'Active : synchronisation automatique à la reconnexion et toutes les 45 s.'
                      : 'Manuelle uniquement : vous gardez le contrôle exclusif des envois vers Firestore.'}
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
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer border ${
                  autoSyncEnabled ? 'bg-[#f2ca50] border-[#f2ca50]' : 'bg-[#232a3a] border-[#4d4635]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0c1322] transition-transform ${
                    autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Live Sync Telemetry & Feedback */}
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#99907c] px-1 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#f2ca50]">schedule</span>
                <span>Dernière synchro : <strong className="text-[#dce2f8]">{formatSyncTimestamp(lastSyncTime)}</strong></span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md border ${
                  pendingCount > 0
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/30 font-bold'
                    : 'bg-[#121929] text-[#d4c78f] border-[#232a3a]'
                }`}
              >
                {pendingCount > 0
                  ? `${pendingCount} élément(s) en file locale`
                  : 'File locale synchronisée'}
              </span>
            </div>

            {manualSyncFeedback && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  manualSyncFeedback.status === 'success'
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                    : manualSyncFeedback.status === 'unauthenticated'
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                    : 'bg-rose-500/15 border-rose-400/40 text-rose-200'
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
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm shrink-0">warning</span>
                <span>{syncError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Signal Adaptive Placement Diagnostic & Calibration Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#192238] via-[#151b2b] to-[#0f1628] border border-[#f2ca50]/45 shadow-xl flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                MOTEUR ADAPTATIF MULTI-SIGNAUX
              </span>
              <h3 className="font-serif font-bold text-base text-[#dce2f8]">
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
              className="px-3.5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">psychology_alt</span>
              <span>{user.placementTest ? 'Refaire le Diagnostic' : 'Passer le Test (6 axes)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0c1322] border border-[#232a3a]">
              <span className="text-[10px] font-mono text-[#99907c] block">CECRL Multi-Signal</span>
              <span className="font-mono font-bold text-[#f2ca50]">{assessment.multiSignal.compositeCefr}</span>
              <span className="text-[10px] text-sky-300 block">{assessment.multiSignal.confidenceScore}% conf.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1322] border border-[#232a3a]">
              <span className="text-[10px] font-mono text-[#99907c] block">Vitesse / Rétention</span>
              <span className="font-mono font-bold text-emerald-300">{assessment.vocabularyRetentionRate}%</span>
              <span className="text-[10px] text-[#d0c5af] block">
                {assessment.learningSpeed === 'fast'
                  ? 'Rapide'
                  : assessment.learningSpeed === 'methodical'
                  ? 'Méthodique'
                  : 'Régulière'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1322] border border-[#232a3a]">
              <span className="text-[10px] font-mono text-[#99907c] block">Équilibre 4 Axes</span>
              <span className="font-mono font-bold text-[#f2ca50]">{assessment.skillBalanceScore}%</span>
              <span className="text-[10px] text-rose-300 block">Erreurs {assessment.errorFrequency}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1322] border border-[#232a3a]">
              <span className="text-[10px] font-mono text-[#99907c] block">Test de Placement</span>
              <span className="font-mono font-bold text-[#dce2f8]">
                {user.placementTest ? `${user.placementTest.overallScore}% (${user.placementTest.compositeCefr})` : 'Non passé'}
              </span>
              <span className="text-[10px] text-[#99907c] block">{assessment.multiSignal.signalsCount} signaux actifs</span>
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-mono font-bold uppercase text-[#d4c78f]">Tranche d&apos;âge :</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AGE_RANGES_META.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleAgeSelect(a.id)}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAgeRange === a.id
                      ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] font-bold shadow'
                      : 'bg-[#0c1322] text-[#dce2f8] border-[#232a3a] hover:border-[#f2ca50]/40'
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
            <span className="text-[11px] font-mono font-bold uppercase text-[#d4c78f]">
              Objectifs d&apos;apprentissage ({selectedObjectives.length} sélectionnés) :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {LEARNING_OBJECTIVES_META.map((obj) => {
                const active = selectedObjectives.includes(obj.id);
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => handleToggleObjective(obj.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#f2ca50]'
                        : 'bg-[#0c1322] border-[#232a3a] text-[#d0c5af] hover:border-[#f2ca50]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base shrink-0">{obj.icon}</span>
                    <span className="text-xs font-semibold truncate">{obj.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* School Grade Selector (Collège 6e-3e & Lycée 2nde-Tle) */}
        <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f2ca50] font-bold uppercase tracking-wider">
              Classe Scolaire (Collège &amp; Lycée)
            </span>
            <span className="text-xs text-[#d4c78f] font-mono">
              {selectedGrade === 'terminale' ? 'Terminale' : selectedGrade}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {SCHOOL_GRADES_META.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGradeSelect(g.id, g.targetCefr)}
                className={`py-2.5 rounded-xl flex flex-col items-center justify-center border font-mono transition-all cursor-pointer ${
                  selectedGrade === g.id
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] font-bold shadow-md'
                    : 'bg-[#232a3a] text-[#dce2f8] border-[#4d4635]/30 hover:bg-[#2e3545]'
                }`}
              >
                <span className="text-xs font-bold">{g.shortLabel}</span>
                <span className="text-[9px] opacity-80">{g.targetCefr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CEFR Level Selector */}
        <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f2ca50] font-bold uppercase tracking-wider">
              Niveau CECRL Cible
            </span>
            <span className="text-xs text-[#d4c78f] font-mono">{selectedLevel} Sélectionné</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelSelect(lvl)}
                className={`py-3 rounded-xl flex flex-col items-center justify-center border font-mono transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] font-bold shadow-md'
                    : 'bg-[#232a3a] text-[#dce2f8] border-[#4d4635]/30 hover:bg-[#2e3545]'
                }`}
              >
                <span className="text-base font-bold">{lvl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Study Cadence Target */}
        <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#f2ca50] font-bold uppercase tracking-wider">
              Durée Préférée &amp; Cadence Quotidienne
            </span>
            <span className="text-[#d4c78f] font-mono">{selectedPace} minutes / jour</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {PREFERRED_DURATIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handlePaceSelect(mins)}
                className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                  selectedPace === mins
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md'
                    : 'bg-[#232a3a] text-[#dce2f8] border-[#4d4635]/30 hover:bg-[#2e3545]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
        {/* Lecture Audio Automatique Bilingue Alternée */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#131c2d] border border-[#f2ca50]/40 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">
                autoplay
              </span>
              <span className="text-xs text-[#f2ca50] font-bold uppercase tracking-wider font-sans">
                Lecture Audio Automatique Alternée
              </span>
            </div>
            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !autoPlayAudio;
                setAutoPlayAudio(next);
                setAutoPlayOnDisplay(next);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border ${
                autoPlayAudio ? 'bg-[#f2ca50] border-[#f2ca50]' : 'bg-[#232a3a] border-[#4d4635]'
              }`}
              title="Activer ou désactiver la lecture automatique des citations et phrases"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#0c1322] transition-transform ${
                  autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-[#d0c5af] leading-relaxed">
            Dès qu'une nouvelle citation ou phrase est affichée à l'écran, l'application la lit automatiquement à voix haute en alternant systématiquement entre l'<strong>anglais britannique (🇬🇧 UK)</strong> et l'<strong>anglais américain (🇺🇸 US)</strong> pour habituer votre oreille aux deux phonétiques.
          </p>

          <div className="pt-2 border-t border-[#232a3a] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#dce2f8]">
              <span className="text-[10px] text-[#99907c]">Prochain accent :</span>
              <span className="font-bold text-[#f2ca50]">
                {peekNextAlternatingAccent() === 'en-GB' ? '🇬🇧 British (UK)' : '🇺🇸 American (US)'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextAccent = peekNextAlternatingAccent();
                speakText(
                  "Elegance is an art of disciplined expression.",
                  nextAccent,
                  "test-autoplay-sample"
                );
              }}
              className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#2e374d] text-xs font-semibold text-[#f2ca50] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">volume_up</span>
              <span>Tester</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#232a3a]">
            <button
              type="button"
              onClick={() => setIsVoiceStudioOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#20293d] via-[#1a2336] to-[#121927] hover:border-[#f2ca50]/60 border border-[#3b455b] text-[#dce2f8] hover:text-[#f2ca50] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
            >
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">tune</span>
              <span>Studio des Voix : 30 Voix Réelles (5F / 5M • Normal & Grave)</span>
            </button>
          </div>
        </div>

        {/* Custom Hero Photo Upload */}
        <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3">
          <span className="text-xs text-[#f2ca50] font-bold uppercase tracking-wider">
            Photographie Personnelle d'Arrière-Plan
          </span>
          <p className="text-xs text-[#d0c5af] leading-relaxed">
            Téléversez une photographie d'art, d'architecture ou de bibliothèque pour personnaliser le titre monumental découpé de votre page d'accueil.
          </p>

          <label className="w-full py-3 px-4 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-dashed border-[#f2ca50]/50 text-[#f2ca50] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploadingPhoto}
              className="hidden"
            />
            <span className="material-symbols-outlined text-base">
              {isUploadingPhoto ? 'sync' : 'upload_file'}
            </span>
            <span>
              {isUploadingPhoto ? 'Téléversement en cours...' : 'Sélectionner une image personnelle'}
            </span>
          </label>
        </div>

        {/* Mobile App Icon & Home Screen Installation */}
        {onOpenInstallModal && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#121824] border border-[#f2ca50]/40 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-[#f2ca50] via-[#c69214] to-[#f2ca50] shadow-md shadow-[#f2ca50]/20 shrink-0">
                <img
                  src={appIconImg}
                  alt="Icône English Boost MSZ"
                  className="w-full h-full object-cover rounded-[10px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-wider">
                  APPLICATION MOBILE & TABLETTE
                </span>
                <h4 className="font-serif font-bold text-sm text-[#dce2f8]">
                  Icône d'Écran d'Accueil iOS & Android
                </h4>
                <p className="text-[11px] text-[#d0c5af]/80">
                  Ajoutez l'icône or & bleu nuit sur votre smartphone pour un accès plein écran direct.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] text-xs font-bold uppercase tracking-wider hover:bg-[#ffe088] transition-all shrink-0 shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">install_mobile</span>
              <span>Installer</span>
            </button>
          </div>
        )}

        {/* Carte de Sauvegarde et Sortie d'Oxford */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#172338] via-[#101828] to-[#1c2840] border border-[#f2ca50]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] flex items-center justify-center shrink-0 border border-[#f2ca50]/40">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm text-[#f3f4f6]">
                Préférences et progression sauvegardées
              </span>
              <span className="text-xs text-[#99907c]">
                {!isOnline
                  ? `Mode hors-ligne actif • ${pendingCount} modification(s) sur IndexedDB`
                  : isUserSignedInWithGoogle()
                  ? `Connecté à Cloud Firestore & IndexedDB • ${formatSyncTimestamp(lastSyncTime)}`
                  : 'Enregistré localement (IndexedDB) • Connectez Google pour la synchro Cloud'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-sans shrink-0"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Sortir & Reprendre</span>
          </button>
        </div>
        </>
        )}
      </main>

      {/* Barre de retour inférieure flottante (Sticky Bottom, garantie anti-blocage iOS / iPhone) */}
      <div
        className="sticky bottom-0 z-30 w-full bg-[#0c1322]/95 backdrop-blur-2xl border-t border-[#232a3a] px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] flex items-center justify-center"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#f2ca50]/20 active:scale-98 transition-all cursor-pointer font-sans"
        >
          <span className="material-symbols-outlined text-lg font-bold">arrow_back</span>
          <span>Quitter le Profil & Continuer mes Leçons</span>
        </button>
      </div>

      {/* Badge Celebration Unlock Modal with sound fanfare & confetti */}
      <BadgeUnlockModal
        badge={celebrationBadge}
        isOpen={!!celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
        alreadyClaimed={celebrationBadge ? claimedBadgeIds.includes(celebrationBadge.id) : false}
        onClaimReward={handleClaimReward}
      />

      {/* Error Journal & Targeted Revision Session Modal */}
      <ErrorJournalModal
        isOpen={isErrorJournalOpen}
        onClose={() => {
          setIsErrorJournalOpen(false);
          setErrorCount(getErrorJournal().filter((i) => !i.resolved).length);
        }}
        onXpEarned={(xp) => {
          onUpdateUser({
            stats: {
              ...user.stats,
              totalXp: (user.stats.totalXp || 0) + xp,
              weeklyXp: (user.stats.weeklyXp || 0) + xp
            }
          });
        }}
      />

      {/* Studio des Voix Modal (30 Voix Réelles) */}
      <VoiceStudioModal
        isOpen={isVoiceStudioOpen}
        onClose={() => setIsVoiceStudioOpen(false)}
      />

      {/* Boutique des Personnages & Collection MSZ */}
      <MszShopModal
        isOpen={isShopOpen}
        onClose={() => {
          setIsShopOpen(false);
          setMszBalance(getMszCoinsBalance());
          setEquippedCharId(getEquippedCharacterId());
        }}
        userLevel={calculateLevel(user.stats?.totalXp ?? 0)}
        onProfileUpdated={() => {
          setMszBalance(getMszCoinsBalance());
          setEquippedCharId(getEquippedCharacterId());
        }}
      />
    </div>
  );
};
