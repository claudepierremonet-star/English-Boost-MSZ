import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Header } from './components/Header';
import { BottomNav, type TabKey } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { QuoteSection } from './components/QuoteSection';
import { StackedCards } from './components/StackedCards';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { SevenDayStreakSection } from './components/SevenDayStreakSection';
import { GlobalRankCard } from './components/GlobalRankCard';
import { CabinetCuriosities } from './components/CabinetCuriosities';
import { DashboardView } from './components/DashboardView';
import { ProgressHistorySection } from './components/ProgressHistorySection';
import { PracticeView } from './components/PracticeView';
import { DictationModal } from './components/DictationModal';
import { FlashcardsModal, type FlashcardDeckMode } from './components/FlashcardsModal';
import { AtelierDialoguesModal } from './components/AtelierDialoguesModal';
import type { DialogueThemeId } from './data/atelierDialoguesTypes';
import { QuizModal } from './components/QuizModal';
import { SpeakingStudioModal } from './components/SpeakingStudioModal';
import { ProfileModal } from './components/ProfileModal';
import { FloralBorderFrame } from './components/FloralBorderFrame';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AuthModal } from './components/AuthModal';
import { SchoolCurriculumView } from './components/SchoolCurriculumView';
import { TwentyGamesHub } from './components/TwentyGamesHub';
import { LeaderboardView } from './components/LeaderboardView';
import { DiscreteWeatherBar } from './components/DiscreteWeatherBar';
import { AmericanAccentStudioModal } from './components/AmericanAccentStudioModal';
import { useSyncStatus } from './offline/useSyncStatus';
import {
  getLocalUserProfile,
  subscribeToAuthState,
  updateUserProfile,
  uploadHeroPhoto,
  getFavoriteLessonIds,
  toggleFavoriteLesson
} from './firebase/client';
import type { UserProfile, CEFRLevel, SchoolGrade } from './firebase/types';
import { ALL_200_LESSONS, type StudyFolio, type CurioWord, type SchoolLesson } from './data/curriculum';
import { calculateLevel } from './utils/levelUtils';
import { LevelUpCelebrationModal, type LevelUpData } from './components/LevelUpCelebrationModal';
import { XpGainToast, type XpToastInfo } from './components/XpGainToast';
import { MszShopModal } from './components/MszShopModal';
import { GlobalSearchBar } from './components/GlobalSearchBar';
import { FloatingSpeakingStudioShortcut } from './components/FloatingSpeakingStudioShortcut';
import { LessonDetailModal } from './components/LessonDetailModal';
import { FavoriteLessonsQuickAccess } from './components/FavoriteLessonsQuickAccess';
import { CityQuizMapView } from './components/CityQuizMapView';
import { EnglishAdventureView } from './components/EnglishAdventureView';
import { GlassSlidingCapsule } from './components/GlassSlidingCapsule';
import { getCityMapProgression } from './utils/cityMapManager';
import { SmartEcosystemHub, type EcosystemLaunchTarget } from './components/SmartEcosystemHub';
import { AITutorModal } from './components/AITutorModal';
import { EnglishEscapeRoomModal } from './components/EnglishEscapeRoomModal';
import { ListeningCinemaModal } from './components/ListeningCinemaModal';
import { GrammarBattleModal } from './components/GrammarBattleModal';
import { AdaptivePlacementModal } from './components/AdaptivePlacementModal';
import { inferGradeFromCefr, markLessonCompletedLocally } from './services/adaptiveEngine';
import { useAppTheme } from './theme/ThemeContext';
import { useReadingMode } from './context/ReadingModeContext';
import { ReadingModeToggleButton } from './components/ReadingModeToggleButton';

const TAB_ORDER: Record<TabKey, number> = {
  accueil: 0,
  carte: 1,
  cursus: 2,
  jeux: 3,
  classement: 4,
  pratique: 5,
  dashboard: 6,
  profil: 7
};

const TAB_EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TAB_VIEW_VARIANTS = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction * 18,
    y: 8,
    scale: 0.992
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -14,
    y: -6,
    scale: 0.994
  })
};

const TAB_REDUCED_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function App() {
  const { isDark } = useAppTheme();
  const { isReadingMode } = useReadingMode();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTabState] = useState<TabKey>('accueil');
  const [tabDirection, setTabDirection] = useState<1 | -1>(1);
  const activeTabRef = useRef<TabKey>('accueil');

  const setActiveTab = useCallback((nextTab: TabKey) => {
    const prevTab = activeTabRef.current;
    if (prevTab !== nextTab) {
      setTabDirection(TAB_ORDER[nextTab] >= TAB_ORDER[prevTab] ? 1 : -1);
      activeTabRef.current = nextTab;
      setActiveTabState(nextTab);
    }
  }, []);

  const [user, setUser] = useState<UserProfile>(getLocalUserProfile());
  const { isOnline, pendingCount, triggerSync } = useSyncStatus();
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(user.level || 'C1');
  const [heroPhotoUrl, setHeroPhotoUrl] = useState<string>(user.heroImageURL);

  const isAuthenticated = Boolean(
    user && user.uid && user.uid !== 'lord_chesterfield_scholar' && !user.uid.startsWith('guest_')
  );

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [isDictationOpen, setIsDictationOpen] = useState<boolean>(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState<boolean>(false);
  const [flashcardsFocusMode, setFlashcardsFocusMode] = useState<boolean>(false);
  const [flashcardsDeckMode, setFlashcardsDeckMode] = useState<FlashcardDeckMode>('vocab');
  const [isDialoguesOpen, setIsDialoguesOpen] = useState<boolean>(false);
  const [dialoguesInitialTheme, setDialoguesInitialTheme] = useState<DialogueThemeId | 'all'>('all');
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isSpeakingOpen, setIsSpeakingOpen] = useState<boolean>(false);
  const [isAccentStudioOpen, setIsAccentStudioOpen] = useState<boolean>(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [isEscapeRoomOpen, setIsEscapeRoomOpen] = useState<boolean>(false);
  const [isCinemaOpen, setIsCinemaOpen] = useState<boolean>(false);
  const [isGrammarBattleOpen, setIsGrammarBattleOpen] = useState<boolean>(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState<boolean>(false);
  const [activeFolioForStudy, setActiveFolioForStudy] = useState<StudyFolio | null>(null);

  // Active Lesson selected across Curriculum / Search
  const [activeSelectedLesson, setActiveSelectedLesson] = useState<SchoolLesson | null>(() => {
    try {
      const saved = localStorage.getItem('eb_msz_selected_lesson');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [searchLessonForDetail, setSearchLessonForDetail] = useState<SchoolLesson | null>(null);
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<string[]>(() => getFavoriteLessonIds());
  const [cityMapProgression, setCityMapProgression] = useState(() => getCityMapProgression());
  const [carteViewMode, setCarteViewMode] = useState<'adventure' | 'city_map'>('adventure');
  const carteSwitchTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleCityEvt = () => {
      setCityMapProgression(getCityMapProgression());
    };
    window.addEventListener('eb_city_map_updated', handleCityEvt);
    return () => window.removeEventListener('eb_city_map_updated', handleCityEvt);
  }, []);

  useEffect(() => {
    const handleFavEvt = (e: Event) => {
      const customEvt = e as CustomEvent<string[]>;
      if (Array.isArray(customEvt.detail)) {
        setFavoriteLessonIds(customEvt.detail);
      } else {
        setFavoriteLessonIds(getFavoriteLessonIds());
      }
    };
    window.addEventListener('eb_favorites_updated', handleFavEvt);
    return () => window.removeEventListener('eb_favorites_updated', handleFavEvt);
  }, []);

  const handleToggleFavoriteLesson = async (lessonId: string) => {
    const nextIds = await toggleFavoriteLesson(lessonId);
    setFavoriteLessonIds(nextIds);
    setUser(getLocalUserProfile());
  };

  useEffect(() => {
    if (activeSelectedLesson) {
      localStorage.setItem('eb_msz_selected_lesson', JSON.stringify(activeSelectedLesson));
    } else {
      localStorage.removeItem('eb_msz_selected_lesson');
    }
  }, [activeSelectedLesson]);

  useEffect(() => {
    const handleSelectEvent = (e: Event) => {
      const customEvt = e as CustomEvent<SchoolLesson | null>;
      if (customEvt.detail !== undefined) {
        setActiveSelectedLesson(customEvt.detail);
      }
    };
    window.addEventListener('eb_select_lesson', handleSelectEvent);
    return () => window.removeEventListener('eb_select_lesson', handleSelectEvent);
  }, []);

  const [curriculumModalLesson, setCurriculumModalLesson] = useState<SchoolLesson | null>(null);
  useEffect(() => {
    const handleSessionEvt = (e: Event) => {
      const customEvt = e as CustomEvent<SchoolLesson | null>;
      setCurriculumModalLesson(customEvt.detail ?? null);
    };
    window.addEventListener('eb_lesson_session_state', handleSessionEvt);
    return () => window.removeEventListener('eb_lesson_session_state', handleSessionEvt);
  }, []);

  const activeSessionLesson = activeSelectedLesson || searchLessonForDetail || curriculumModalLesson;

  // Level-Up celebration modal & fluid XP Toast states (Framer Motion)
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);
  const [xpToast, setXpToast] = useState<XpToastInfo | null>(null);

  // Auto-dismiss XP Toast after 3.2s
  useEffect(() => {
    if (xpToast) {
      const timer = setTimeout(() => {
        setXpToast(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [xpToast]);

  // Subscribe to auth / local session
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((profile) => {
      if (profile) {
        setUser(profile);
        setCurrentLevel(profile.level);
        if (profile.heroImageURL) {
          setHeroPhotoUrl(profile.heroImageURL);
        }
        if (Array.isArray(profile.favoriteLessonIds)) {
          setFavoriteLessonIds(profile.favoriteLessonIds);
        }
        if (profile.cityMapProgression) {
          setCityMapProgression(getCityMapProgression());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const activeSchoolGrade: SchoolGrade = user.schoolGrade || inferGradeFromCefr(currentLevel);

  const handleLevelChange = async (newLevel: CEFRLevel) => {
    setCurrentLevel(newLevel);
    const updated = await updateUserProfile({ level: newLevel });
    setUser(updated);
  };

  const handleSelectSchoolGrade = async (grade: SchoolGrade, suggestedCefr?: CEFRLevel) => {
    if (suggestedCefr) {
      setCurrentLevel(suggestedCefr);
    }
    const updated = await updateUserProfile({
      schoolGrade: grade,
      ...(suggestedCefr ? { level: suggestedCefr } : {})
    });
    setUser(updated);
  };

  const handleLaunchEcosystemModule = (target: EcosystemLaunchTarget) => {
    switch (target) {
      case 'tutor':
        setIsTutorOpen(true);
        break;
      case 'adventure_world':
        setCarteViewMode('adventure');
        setActiveTab('carte');
        break;
      case 'flashcards':
        setFlashcardsDeckMode('vocab');
        setFlashcardsFocusMode(false);
        setIsFlashcardsOpen(true);
        break;
      case 'speaking':
        setIsSpeakingOpen(true);
        break;
      case 'escape_room':
        setIsEscapeRoomOpen(true);
        break;
      case 'dialogues':
        setDialoguesInitialTheme('all');
        setIsDialoguesOpen(true);
        break;
      case 'listening_cinema':
        setIsCinemaOpen(true);
        break;
      case 'grammar_battle':
        setIsGrammarBattleOpen(true);
        break;
      case 'collectibles':
        setIsShopModalOpen(true);
        break;
      case 'dashboard':
        setActiveTab('dashboard');
        break;
      case 'leaderboard':
        setActiveTab('classement');
        break;
    }
  };

  useEffect(() => {
    const openPlacement = () => setIsPlacementModalOpen(true);
    const launchEcosystem = (e: Event) => {
      const ce = e as CustomEvent<EcosystemLaunchTarget | 'dictation' | 'quiz'>;
      const target = ce.detail;
      if (!target) return;
      if (target === 'dictation') {
        setIsDictationOpen(true);
      } else if (target === 'quiz') {
        setIsQuizOpen(true);
      } else {
        handleLaunchEcosystemModule(target);
      }
    };
    window.addEventListener('eb_open_placement_modal', openPlacement);
    window.addEventListener('eb_launch_ecosystem_target', launchEcosystem);
    return () => {
      window.removeEventListener('eb_open_placement_modal', openPlacement);
      window.removeEventListener('eb_launch_ecosystem_target', launchEcosystem);
    };
  }, []);

  const handlePhotoChange = async (newUrl: string) => {
    setHeroPhotoUrl(newUrl);
    const updated = await updateUserProfile({ heroImageURL: newUrl });
    setUser(updated);
  };

  const handleCustomUpload = async (file: File) => {
    const url = await uploadHeroPhoto(file);
    setHeroPhotoUrl(url);
    const updated = await updateUserProfile({ heroImageURL: url });
    setUser(updated);
    return url;
  };

  const handleUpdateStudyTarget = async (mins: number) => {
    const latest = getLocalUserProfile();
    const updated = await updateUserProfile({
      stats: {
        ...latest.stats,
        studyMinutesTarget: mins
      }
    });
    setUser(updated);
  };

  const handleAddStudyMinute = async () => {
    const latest = getLocalUserProfile();
    const todayStr = new Date().toISOString().split('T')[0];
    const isSameDay = latest.stats?.lastActiveDate === todayStr;
    const baseTodayMinutes = isSameDay ? (latest.stats?.studyMinutesToday || 0) : 0;
    const updated = await updateUserProfile({
      stats: {
        ...latest.stats,
        studyMinutesToday: baseTodayMinutes + 1,
        totalImmersionMinutes: (latest.stats?.totalImmersionMinutes || 0) + 1,
        lastActiveDate: todayStr
      }
    });
    setUser(updated);
  };

  /**
   * Gestionnaire d'achèvement de défi :
   * Implémente la logique de gain (+10 pts) en cas de succès et de perte (-5 pts) en cas d'erreur/défaite.
   * Utilise calculateLevel(totalXp) définissant les seuils de 100 pts par niveau.
   */
  const handleChallengeComplete = async (isSuccessOrXp: boolean | number = true, customXp?: number) => {
    // Calcul du delta de points (+10 pts ou -5 pts)
    let delta = 10;
    if (typeof isSuccessOrXp === 'boolean') {
      delta = isSuccessOrXp ? (customXp ?? 10) : -5;
    } else if (typeof isSuccessOrXp === 'number') {
      if (isSuccessOrXp <= 0) {
        delta = -5; // Défaite / échec
      } else if (isSuccessOrXp === 10 || isSuccessOrXp === -5) {
        delta = isSuccessOrXp;
      } else if (isSuccessOrXp === 240) {
        delta = 10; // Défi quotidien réussi
      } else {
        delta = customXp !== undefined ? customXp : (isSuccessOrXp > 0 ? isSuccessOrXp : 10);
      }
    }

    const latestUser = getLocalUserProfile();
    const currentTotalXp = latestUser.stats?.totalXp ?? 0;
    const newTotalXp = Math.max(0, currentTotalXp + delta);
    const currentWeeklyXp = latestUser.stats?.weeklyXp ?? 0;
    const newWeeklyXp = Math.max(0, currentWeeklyXp + (delta > 0 ? delta : 0));

    // Calcul du niveau via la fonction utilitaire (100 pts par niveau)
    const oldLevel = calculateLevel(currentTotalXp);
    const newLevel = calculateLevel(newTotalXp);

    const updated = await updateUserProfile({
      stats: {
        ...latestUser.stats,
        weeklyXp: newWeeklyXp,
        totalXp: newTotalXp
      }
    });
    setUser(updated);

    const isLevelUp = newLevel > oldLevel;

    // Déclenchement de la célébration de montée de niveau animée par Framer Motion
    if (isLevelUp) {
      setLevelUpData({
        oldLevel,
        newLevel,
        totalXp: newTotalXp,
        deltaXp: delta
      });
      setIsLevelUpModalOpen(true);
    }

    // Toast de gain / déduction d'XP animé avec Framer Motion
    setXpToast({
      id: `${Date.now()}-${Math.random()}`,
      delta,
      currentLevel: newLevel,
      progressPercent: newTotalXp % 100,
      message: isLevelUp
        ? `🎉 Ascension académique vers le Niveau ${newLevel} !`
        : delta > 0
        ? 'Défi accompli avec succès !'
        : 'Pénalité de 5 points'
    });

    return {
      delta,
      newTotalXp,
      oldLevel,
      newLevel,
      isLevelUp
    };
  };

  const handleOpenFolioStudy = (folio: StudyFolio) => {
    // Route to appropriate engine based on folio Roman index
    if (folio.folioRoman === 'I') {
      setIsDictationOpen(true);
    } else if (folio.folioRoman === 'II') {
      setIsSpeakingOpen(true);
    } else if (folio.folioRoman === 'III') {
      setIsFlashcardsOpen(true);
    } else {
      setIsQuizOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1322] text-[#dce2f8] flex flex-col font-sans selection:bg-[#f2ca50] selection:text-[#3c2f00] relative">
      {/* Discrete 0.5cm - 1cm Floral Border Frame (Active when floral skin selected) */}
      <FloralBorderFrame />

      {/* Top Header */}
      <Header
        user={user}
        currentLevel={currentLevel}
        isAuthenticated={isAuthenticated}
        activeLesson={activeSessionLesson}
        onUpdateStudyTarget={handleUpdateStudyTarget}
        onAddStudyMinute={handleAddStudyMinute}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLevelChange={handleLevelChange}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        onNavigateCursus={() => setActiveTab('cursus')}
        onNavigateLeaderboard={() => setActiveTab('classement')}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAccentStudio={() => setIsAccentStudioOpen(true)}
        onOpenShop={() => setIsShopModalOpen(true)}
        cityMapProgression={cityMapProgression}
        onNavigateCityMap={() => {
          setCarteViewMode('city_map');
          setActiveTab('carte');
        }}
        onOpenLevelCelebration={() => {
          const currentLvl = calculateLevel(user.stats?.totalXp || 0);
          setLevelUpData({
            oldLevel: Math.max(1, currentLvl - 1),
            newLevel: currentLvl,
            totalXp: user.stats?.totalXp || 0,
            deltaXp: 10
          });
          setIsLevelUpModalOpen(true);
        }}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div
          className="fixed left-0 right-0 z-30 bg-amber-950/95 border-b border-amber-500/50 px-4 py-2 text-center text-xs text-amber-200 font-medium flex items-center justify-center gap-2 backdrop-blur-md shadow-lg animate-fadeIn"
          style={{ top: 'calc(max(env(safe-area-inset-top, 0px), 10px) + 90px)' }}
        >
          <span className="material-symbols-outlined text-sm text-amber-400">wifi_off</span>
          <span>
            Mode Hors-Ligne activé : vos leçons, quiz et scores sont enregistrés sur <strong>IndexedDB local</strong> et seront synchronisés automatiquement à la reconnexion.
          </span>
        </div>
      )}

      {/* Pending Sync Notification Banner (when online with pending queue items) */}
      {isOnline && pendingCount > 0 && (
        <div
          className="fixed left-0 right-0 z-30 bg-[#191f2f]/95 border-b border-[#f2ca50]/50 px-4 py-2 text-center text-xs text-[#dce2f8] font-medium flex items-center justify-center gap-3 backdrop-blur-md shadow-lg animate-fadeIn"
          style={{ top: 'calc(max(env(safe-area-inset-top, 0px), 10px) + 90px)' }}
        >
          <span className="material-symbols-outlined text-sm text-[#f2ca50] animate-pulse">cloud_upload</span>
          <span>
            <strong>{pendingCount}</strong> modification(s) enregistrée(s) hors-ligne en attente de synchronisation Cloud Firestore.
          </span>
          <button
            type="button"
            onClick={() => triggerSync()}
            className="px-2.5 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[10px] font-bold uppercase tracking-wider hover:bg-[#ffe088] transition-colors shadow-sm"
          >
            Synchroniser maintenant
          </button>
        </div>
      )}

      {/* Discreet 1 cm Real-Time Weather Bar (Discreet hairline bar, reveals on click, auto-dismisses in 5s) */}
      <div
        className={`w-full z-30 transition-all duration-300 ${
          isReadingMode ? 'opacity-15 hover:opacity-95' : 'opacity-100'
        }`}
        style={{
          paddingTop: `calc(max(env(safe-area-inset-top, 0px), 10px) + ${!isOnline || (isOnline && pendingCount > 0) ? '130px' : '92px'})`
        }}
      >
        <DiscreteWeatherBar />
      </div>

      {/* Main Routed Content */}
      <LayoutGroup id="main-tab-views">
        <motion.main
          layout={!shouldReduceMotion}
          transition={{ layout: { duration: 0.28, ease: TAB_EASE_OUT } }}
          className="flex-1 w-full pb-20"
        >
          <AnimatePresence mode="wait" custom={tabDirection} initial={false}>
            {activeTab === 'accueil' && (
              <motion.div
                key="tab-accueil"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="flex flex-col w-full max-w-4xl mx-auto will-change-transform"
              >
            {/* Active Lesson Spotlight Card (Always focused at 100% visibility when Reading Mode is enabled) */}
            {isReadingMode && (() => {
              const focusLesson = activeSelectedLesson || ALL_200_LESSONS[0];
              if (!focusLesson) return null;
              return (
                <section
                  aria-label="Concentration sur la leçon active en Mode Lecture"
                  className="mx-4 sm:mx-6 mt-3 mb-4 p-5 sm:p-7 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/55 shadow-2xl space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#232a3a]/60 pb-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className={`flex items-center gap-2 text-xs font-mono font-semibold ${isDark ? 'text-[#f2ca50]' : 'text-[#785b24]'}`}>
                        <span>Mode Lecture Actif</span>
                        <span aria-hidden="true">·</span>
                        <span>{focusLesson.class_label || focusLesson.class_level}</span>
                        <span aria-hidden="true">·</span>
                        <span>CECRL {focusLesson.cefr_level}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#d4c78f]">{focusLesson.theme_label}</span>
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] leading-snug">
                        {focusLesson.title}
                      </h2>
                      <p className="text-sm text-[#d0c5af] leading-relaxed">
                        {focusLesson.learning_objective}
                      </p>
                    </div>
                    <ReadingModeToggleButton variant="toolbar" />
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#0c1322] border border-[#232a3a]/60 space-y-1.5">
                      <p className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-[#f2ca50]' : 'text-[#785b24]'}`}>
                        Grammaire · {focusLesson.grammar.title}
                      </p>
                      <p className="text-sm text-[#dce2f8] leading-relaxed">
                        {focusLesson.grammar.rule}
                      </p>
                      <p className={`text-sm font-serif font-semibold pt-1 ${isDark ? 'text-[#ffe088]' : 'text-[#785b24]'}`}>
                        « {focusLesson.grammar.example_en} »
                      </p>
                      <p className="text-xs text-[#d0c5af]/85 italic">
                        {focusLesson.grammar.example_fr}
                      </p>
                    </div>

                    {focusLesson.model_phrases?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-mono font-bold text-[#d4c78f] uppercase tracking-wider">
                          Phrases clés à retenir
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {focusLesson.model_phrases.slice(0, 2).map((phrase, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-1"
                            >
                              <p className="text-sm font-serif font-semibold text-[#dce2f8]">
                                {phrase.en}
                              </p>
                              <p className="text-xs text-[#d0c5af]/85 italic">
                                {phrase.fr}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#232a3a]">
                    <span className="text-xs text-[#d0c5af]">
                      Les cartes secondaires et la barre de navigation sont atténuées pour préserver votre attention.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('cursus')}
                        className="px-3.5 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-semibold text-[#dce2f8] transition-colors cursor-pointer"
                      >
                        Changer de leçon
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSelectedLesson(focusLesson);
                          setSearchLessonForDetail(focusLesson);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">auto_stories</span>
                        <span>Ouvrir la leçon complète</span>
                      </button>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Barre de Recherche Globale (200 Leçons & Cartes Mémoire) */}
            <div
              className={`transition-opacity duration-300 ${
                isReadingMode ? 'opacity-25 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
              }`}
            >
              <GlobalSearchBar
                onSelectLesson={(lesson) => {
                  setActiveSelectedLesson(lesson);
                  setSearchLessonForDetail(lesson);
                }}
                onSelectFlashcard={(_card) => {
                  setIsFlashcardsOpen(true);
                }}
                onOpenFlashcardsModal={() => setIsFlashcardsOpen(true)}
                activeLessonId={activeSelectedLesson?.id}
                favoriteLessonIds={favoriteLessonIds}
                onToggleFavorite={handleToggleFavoriteLesson}
              />
            </div>

            {/* Secondary cards & peripheral widgets (smoothly dimmed when Reading Mode is active) */}
            <div
              className={`transition-opacity duration-300 ${
                isReadingMode ? 'opacity-15 hover:opacity-85' : 'opacity-100'
              }`}
            >
              {/* Global Rank Card sous le Header */}
              <GlobalRankCard
                totalXp={user.stats?.totalXp ?? 0}
                weeklyXp={user.stats?.weeklyXp ?? 0}
                onNavigateLeaderboard={() => setActiveTab('classement')}
              />

              {/* Smart Adaptive Ecosystem Hub (6e-Terminale, Daily Missions, Adaptive Recommendations, SM-2 Queue, 12 Pillars) */}
              <SmartEcosystemHub
                user={user}
                currentLevel={currentLevel}
                onSelectSchoolGrade={handleSelectSchoolGrade}
                onLaunchModule={handleLaunchEcosystemModule}
                onOpenLesson={(lesson) => {
                  setActiveSelectedLesson(lesson);
                  setSearchLessonForDetail(lesson);
                }}
                onClaimMissionXp={(xp) => {
                  handleChallengeComplete(xp);
                  setUser(getLocalUserProfile());
                }}
              />

              {/* Monumental Hero Section with background-clip text & scroll zoom */}
              <HeroSection
                currentPhotoUrl={heroPhotoUrl}
                onPhotoChange={handlePhotoChange}
                onCustomUpload={handleCustomUpload}
              />

              {/* Bilingual Quote of Distinction (Lord Chesterfield) */}
              <QuoteSection />
            </div>

            {/* Google Authentication & Firebase Cloud Sync Banner */}
            {!isAuthenticated && (
              <div
                className={`mx-4 sm:mx-6 my-2 p-4 rounded-2xl bg-gradient-to-r from-[#172133] via-[#121927] to-[#1c273c] border border-[#f2ca50]/40 shadow-xl flex items-center justify-between gap-4 transition-opacity duration-300 ${
                  isReadingMode ? 'opacity-15 hover:opacity-85' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 flex items-center justify-center shadow-md shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-widest">
                        FIREBASE CLOUD FIRESTORE
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#dce2f8]">
                      Inscription & Sauvegarde en Ligne
                    </h4>
                    <p className="text-xs text-[#d0c5af]/80">
                      Connectez votre compte Google pour conserver et synchroniser vos dictées, quiz et cartes mémoires SM-2.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider shrink-0 shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>S'inscrire</span>
                </button>
              </div>
            )}

            {/* Editorial Banner for 6e-Terminale School Curriculum (kept clear in Reading Mode) */}
            <div
              className="mx-4 sm:mx-6 my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#191f2f] via-[#151b2b] to-[#232a3a] border border-[#f2ca50]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group"
            >
              <div
                onClick={() => setActiveTab('cursus')}
                className="flex items-center gap-3.5 cursor-pointer flex-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-widest">
                      CURSUS OFFICIEL 6E ➔ TERMINALE
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                      200 LEÇONS COMPLÈTES
                    </span>
                    {activeSelectedLesson && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-[#f2ca50] text-[10px] font-mono font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-amber-400">check_circle</span>
                        <span>Active : {activeSelectedLesson.class_label || activeSelectedLesson.class_level} · {activeSelectedLesson.title}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                    Programme Pédagogique par Classe & 10 Thèmes
                  </h3>
                  <p className="text-xs text-[#d0c5af]/80">
                    Vocabulaire traduit, grammaire explicite, dialogues bilingues sonorisés, dictées et quiz interactifs.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!activeSelectedLesson ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSelectedLesson(ALL_200_LESSONS[0]);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#f2ca50]/15 hover:bg-[#f2ca50]/25 border border-[#f2ca50]/50 text-[#f2ca50] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Sélectionner la leçon 1 pour activer le raccourci du Studio d'Élocution"
                  >
                    <span className="material-symbols-outlined text-sm">bookmark_add</span>
                    <span>Activer Leçon 1</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSelectedLesson(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Désélectionner la leçon active"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    <span>Désactiver</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('cursus')}
                  className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1 shrink-0 hover:bg-[#ffe088] shadow-md transition-all cursor-pointer"
                >
                  <span>Explorer</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Accès Rapide aux Leçons Favorites (Cœur) */}
            <FavoriteLessonsQuickAccess
              favoriteLessonIds={favoriteLessonIds}
              activeSelectedLessonId={activeSelectedLesson?.id}
              onOpenLesson={(lesson) => {
                setActiveSelectedLesson(lesson);
                setSearchLessonForDetail(lesson);
              }}
              onToggleFavorite={handleToggleFavoriteLesson}
              onSelectActiveLesson={(lesson) =>
                setActiveSelectedLesson(
                  activeSelectedLesson?.id === lesson.id ? null : lesson
                )
              }
              onNavigateToCursus={() => setActiveTab('cursus')}
            />

            {/* Secondary Promotional & Gamification Cards (dimmed during Reading Mode) */}
            <div
              className={`transition-opacity duration-300 ${
                isReadingMode ? 'opacity-15 hover:opacity-85' : 'opacity-100'
              }`}
            >
            {/* Editorial Banner for 20 Mini-Games Arcade */}
            <div
              onClick={() => setActiveTab('jeux')}
              className="mx-4 sm:mx-6 my-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#172133] to-[#121927] border border-[#f2ca50]/50 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f2ca50] via-amber-500 to-amber-700 flex items-center justify-center text-[#3c2f00] shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">sports_esports</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-widest">
                      SALLE D'ARCADE LINGUISTIQUE
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                      20 MINI-JEUX INTERACTIFS
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                    Apprends & Joue en Même Temps (Style Duolingo)
                  </h3>
                  <p className="text-xs text-[#d0c5af]/80">
                    Trouve des mots, maîtrise les verbes irréguliers, anagrammes, pendu spatial, memory, duel d'opposés et combat de boss !
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md"
              >
                <span>Jouer</span>
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>

            {/* Editorial Banner for English Adventure 7-Island 3D World */}
            <div
              onClick={() => {
                setCarteViewMode('adventure');
                setActiveTab('carte');
              }}
              className="mx-4 sm:mx-6 my-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#17263f] via-[#131d33] to-[#0c1322] border border-[#f2ca50]/55 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0c1322] border border-[#f2ca50]/55 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">public</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold uppercase tracking-widest">
                    <span className="text-[#f2ca50]">ENGLISH ADVENTURE · ARCHIPEL 3D</span>
                    <span className="text-[#99907c]">·</span>
                    <span className="text-emerald-400">
                      {user.englishAdventure?.bossDefeatedIslandIds?.length || 0}/7 ÎLES CONQUISES
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                    7 Territoires Gamifiés : Missions, Mini-Jeux, Boss &amp; Trophées
                  </h3>
                  <p className="text-xs text-[#d0c5af]/85">
                    {user.englishAdventure?.totalStars || 0} ★ · Progression adaptative sans chrono pour débloquer cartes, avatars et thèmes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md cursor-pointer"
              >
                <span>Explorer</span>
                <span className="material-symbols-outlined text-sm">explore</span>
              </button>
            </div>

            {/* Editorial City Design Banner for 100-Level Urban Quiz Map */}
            <div
              onClick={() => {
                setCarteViewMode('city_map');
                setActiveTab('carte');
              }}
              className="mx-4 sm:mx-6 my-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#191f2f] via-[#151b2b] to-[#0c1322] border border-[#f2ca50]/50 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0c1322] border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    map
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold uppercase tracking-widest">
                    <span className="text-[#f2ca50]">PLAN PRINCIPAL · 600 NIVEAUX URBAINS</span>
                    <span className="text-[#99907c]">·</span>
                    <span className="text-emerald-400">
                      NIVEAU {cityMapProgression.unlockedLevel}/600 DÉBLOQUÉ
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                    Parcours Cité de la 6e à la Terminale (10 Chapitres / Niveau)
                  </h3>
                  <p className="text-xs text-[#d0c5af]/85">
                    {cityMapProgression.conqueredLevels.length} niveau(x) conquis · {cityMapProgression.totalStars} ★ — Validez les 10 chapitres d&apos;une étape pour ouvrir la suivante.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md cursor-pointer"
              >
                <span>Ouvrir le Plan</span>
                <span className="material-symbols-outlined text-sm">explore</span>
              </button>
            </div>

            {/* Editorial Banner for Weekly Leaderboard & Healthy Competition */}
            <div
              onClick={() => setActiveTab('classement')}
              className="mx-4 sm:mx-6 my-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#172554]/70 via-[#101b33] to-[#1f1738]/80 border border-[#f2ca50]/50 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffe088] via-[#f2ca50] to-[#b45309] flex items-center justify-center text-[#2c1d00] shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">emoji_events</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-widest">
                      CLASSEMENT HEBDOMADAIRE • COMPÉTITION SAINE
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-[#f2ca50]/20 text-[#ffe088] text-[9px] font-mono font-bold">
                      {(user.stats?.weeklyXp || 0).toLocaleString()} XP CETTE SEMAINE
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                    Ligue d'Oxford & Émulation Académique
                  </h3>
                  <p className="text-xs text-[#d0c5af]/80">
                    Comparez vos progrès hebdomadaires, grimpez sur le podium et encouragez vos condisciples apprenants.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md"
              >
                <span>Voir le Top</span>
                <span className="material-symbols-outlined text-sm">leaderboard</span>
              </button>
            </div>

            {/* Stacked Overlapping Study Cards (Manuscrits d'Étude & Collections) */}
            <StackedCards
              onOpenFolioStudy={handleOpenFolioStudy}
              onOpenVocabularyFocus={() => {
                setFlashcardsFocusMode(true);
                setIsFlashcardsOpen(true);
              }}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Daily Challenge (The Nuance Matrix) */}
            <DailyChallengeCard onChallengeComplete={handleChallengeComplete} />

            {/* Streak 7 Jours (Icônes Calendrier Remplies & Gamification) */}
            <SevenDayStreakSection
              streakDays={user.stats?.streakDays ?? 0}
              studyMinutesToday={user.stats?.studyMinutesToday ?? 0}
              studyMinutesTarget={user.stats?.studyMinutesTarget ?? 30}
              onNavigateToCurriculum={() => setActiveTab('cursus')}
            />

            {/* Rare Lexicon Showcase */}
            <CabinetCuriosities
              onWordClick={() => {
                setIsFlashcardsOpen(true);
              }}
            />

            {/* Quiet Security Footer */}
            <footer className="px-6 py-4 mb-2 flex items-center justify-between text-xs text-[#99907c] border-t border-[#232a3a]/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Cloud Firestore & Auth Sync • Chiffrement AES-256</span>
              </div>
              <span className="font-mono text-[#d4c78f]">MSZ SECURE</span>
            </footer>
            </div>
              </motion.div>
            )}

            {activeTab === 'carte' && (
              <motion.div
                key="tab-carte"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="w-full pt-2 space-y-3 will-change-transform"
              >
            {/* Carte World Mode Switcher (English Adventure 7 Islands <-> Plan 600 Niveaux) */}
            <div
              className={`max-w-6xl mx-auto px-3 sm:px-6 flex justify-center sm:justify-start transition-opacity duration-300 ${
                isReadingMode ? 'opacity-25 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
              }`}
            >
              <div
                ref={carteSwitchTrackRef}
                className={`relative inline-flex items-center p-1 rounded-full border shadow-md ${
                  isDark
                    ? 'bg-[#12192c] border-[#e8c55b]/35'
                    : 'bg-white border-[#cbbd9f]'
                }`}
              >
                <GlassSlidingCapsule
                  containerRef={carteSwitchTrackRef}
                  activeKey={carteViewMode}
                  tone={isDark ? 'dark' : 'adaptive'}
                />
                <button
                  type="button"
                  data-capsule-key="adventure"
                  onClick={() => setCarteViewMode('adventure')}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    carteViewMode === 'adventure'
                      ? 'glass-capsule-active-text'
                      : isDark
                      ? 'text-[#cbd5e1] hover:text-[#f5cf5e]'
                      : 'text-[#475569] hover:text-[#8c5e08]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">public</span>
                  <span>English Adventure (7 Îles)</span>
                </button>
                <button
                  type="button"
                  data-capsule-key="city_map"
                  onClick={() => setCarteViewMode('city_map')}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    carteViewMode === 'city_map'
                      ? 'glass-capsule-active-text'
                      : isDark
                      ? 'text-[#cbd5e1] hover:text-[#f5cf5e]'
                      : 'text-[#475569] hover:text-[#8c5e08]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  <span>Plan Cité (600 Niveaux)</span>
                </button>
              </div>
            </div>

            {carteViewMode === 'adventure' ? (
              <EnglishAdventureView
                user={user}
                currentLevel={currentLevel}
                onXpEarned={(xp) => {
                  if (xp > 0) {
                    handleChallengeComplete(true, xp);
                  }
                  setUser(getLocalUserProfile());
                }}
                onProfileRefresh={() => setUser(getLocalUserProfile())}
              />
            ) : (
              <CityQuizMapView
                progression={cityMapProgression}
                playerLevel={calculateLevel(user.stats?.totalXp ?? 0)}
                onXpEarned={(xp) => {
                  handleChallengeComplete(xp);
                  setUser(getLocalUserProfile());
                }}
                onProgressionUpdated={(nextState) => {
                  setCityMapProgression(nextState);
                  setUser(getLocalUserProfile());
                }}
              />
            )}
              </motion.div>
            )}

            {activeTab === 'cursus' && (
              <motion.div
                key="tab-cursus"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="max-w-4xl mx-auto pt-2 will-change-transform"
              >
                <SchoolCurriculumView
                  onLessonCompleted={(lessonId, xp) => {
                    markLessonCompletedLocally(lessonId);
                    handleChallengeComplete(xp);
                  }}
                  activeSelectedLessonId={activeSelectedLesson?.id}
                  onSelectLesson={(lesson) => setActiveSelectedLesson(lesson)}
                  favoriteLessonIds={favoriteLessonIds}
                  onToggleFavorite={handleToggleFavoriteLesson}
                  cityProgression={cityMapProgression}
                  playerLevel={calculateLevel(user.stats?.totalXp ?? 0)}
                  onCityXpEarned={(xp) => {
                    handleChallengeComplete(xp);
                    setUser(getLocalUserProfile());
                  }}
                  onCityProgressionUpdated={(nextState) => {
                    setCityMapProgression(nextState);
                    setUser(getLocalUserProfile());
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'jeux' && (
              <motion.div
                key="tab-jeux"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="max-w-5xl mx-auto pt-2 will-change-transform"
              >
                <TwentyGamesHub
                  onXpEarned={(xp) => handleChallengeComplete(xp)}
                  onPointsDeducted={(pts) => handleChallengeComplete(pts)}
                  onClose={() => setActiveTab('accueil')}
                />
              </motion.div>
            )}

            {activeTab === 'classement' && (
              <motion.div
                key="tab-classement"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="max-w-4xl mx-auto pt-2 px-4 sm:px-6 will-change-transform"
              >
                <LeaderboardView
                  user={user}
                  onNavigateToGames={() => setActiveTab('jeux')}
                  onNavigateToPractice={() => setActiveTab('pratique')}
                />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="tab-dashboard"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="max-w-4xl mx-auto pt-2 space-y-6 will-change-transform"
              >
                <DashboardView
                  user={user}
                  onResumePractice={() => setActiveTab('pratique')}
                  onUpdateStudyTarget={handleUpdateStudyTarget}
                  onOpenFlashcards={() => setIsFlashcardsOpen(true)}
                  onNavigateLeaderboard={() => setActiveTab('classement')}
                  onLaunchEcosystemModule={handleLaunchEcosystemModule}
                />
                {/* Section 'Mon historique de progression' sous le composant DashboardView */}
                <ProgressHistorySection user={user} />
              </motion.div>
            )}

            {activeTab === 'pratique' && (
              <motion.div
                key="tab-pratique"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="max-w-4xl mx-auto pt-2 will-change-transform"
              >
                <PracticeView
                  currentLevel={currentLevel}
                  onSelectLevel={handleLevelChange}
                  onOpenDictation={() => setIsDictationOpen(true)}
                  onOpenFlashcards={() => {
                    setFlashcardsDeckMode('vocab');
                    setIsFlashcardsOpen(true);
                  }}
                  onOpenFlashcardsFocus={() => {
                    setFlashcardsDeckMode('vocab');
                    setFlashcardsFocusMode(true);
                    setIsFlashcardsOpen(true);
                  }}
                  onOpenDialogueFlashcards={() => {
                    setFlashcardsDeckMode('dialogues');
                    setFlashcardsFocusMode(false);
                    setIsFlashcardsOpen(true);
                  }}
                  onOpenDialogues={(themeId = 'all') => {
                    setDialoguesInitialTheme(themeId);
                    setIsDialoguesOpen(true);
                  }}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                  onOpenSpeaking={() => setIsSpeakingOpen(true)}
                  onOpenGames={() => setActiveTab('jeux')}
                  onOpenCityMap={() => {
                    setCarteViewMode('city_map');
                    setActiveTab('carte');
                  }}
                  onOpenAdventure={() => {
                    setCarteViewMode('adventure');
                    setActiveTab('carte');
                  }}
                  onOpenAiTutor={() => setIsTutorOpen(true)}
                  onOpenEscapeRoom={() => setIsEscapeRoomOpen(true)}
                  onOpenListeningCinema={() => setIsCinemaOpen(true)}
                  onOpenGrammarBattle={() => setIsGrammarBattleOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'profil' && (
              <motion.div
                key="tab-profil"
                layout={!shouldReduceMotion ? 'position' : false}
                custom={tabDirection}
                variants={shouldReduceMotion ? TAB_REDUCED_VARIANTS : TAB_VIEW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  opacity: { duration: 0.22, ease: TAB_EASE_OUT },
                  x: { duration: 0.28, ease: TAB_EASE_OUT },
                  y: { duration: 0.28, ease: TAB_EASE_OUT },
                  scale: { duration: 0.26, ease: TAB_EASE_OUT },
                  layout: { duration: 0.28, ease: TAB_EASE_OUT }
                }}
                className="max-w-xl mx-auto pt-2 will-change-transform"
              >
                <ProfileModal
                  user={user}
                  onClose={() => setActiveTab('accueil')}
                  onUpdateUser={async (partial) => {
                    const updated = await updateUserProfile(partial);
                    setUser(updated);
                  }}
                  onCustomPhotoUpload={handleCustomUpload}
                  onOpenInstallModal={() => setIsInstallModalOpen(true)}
                  onOpenPlacement={() => setIsPlacementModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </LayoutGroup>

      {/* Bottom Luxury Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* MODALS */}
      {isProfileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onUpdateUser={async (partial) => {
            const updated = await updateUserProfile(partial);
            setUser(updated);
          }}
          onCustomPhotoUpload={handleCustomUpload}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenPlacement={() => {
            setIsProfileOpen(false);
            setIsPlacementModalOpen(true);
          }}
        />
      )}

      {isDictationOpen && (
        <DictationModal
          currentLevel={currentLevel}
          onClose={() => setIsDictationOpen(false)}
          onAttemptRecorded={() => {
            setUser(getLocalUserProfile());
          }}
        />
      )}

      {isFlashcardsOpen && (
        <FlashcardsModal
          currentLevel={currentLevel}
          initialFocusMode={flashcardsFocusMode}
          initialDeckMode={flashcardsDeckMode}
          onClose={() => {
            setIsFlashcardsOpen(false);
            setFlashcardsFocusMode(false);
          }}
          onCardReviewed={() => {
            setUser(getLocalUserProfile());
          }}
        />
      )}

      {isDialoguesOpen && (
        <AtelierDialoguesModal
          isOpen={isDialoguesOpen}
          initialTheme={dialoguesInitialTheme}
          onClose={() => setIsDialoguesOpen(false)}
          onDialogueCompleted={(_dlgId, xp) => {
            handleChallengeComplete(xp);
            setUser(getLocalUserProfile());
          }}
          onOpenDialogueFlashcards={() => {
            setIsDialoguesOpen(false);
            setFlashcardsDeckMode('dialogues');
            setFlashcardsFocusMode(false);
            setIsFlashcardsOpen(true);
          }}
        />
      )}

      {isQuizOpen && (
        <QuizModal
          currentLevel={currentLevel}
          onClose={() => setIsQuizOpen(false)}
          onQuizFinished={() => {
            setUser(getLocalUserProfile());
          }}
        />
      )}

      {isSpeakingOpen && (
        <SpeakingStudioModal
          currentLevel={currentLevel}
          onClose={() => setIsSpeakingOpen(false)}
          onSpeakingComplete={() => {
            setUser(getLocalUserProfile());
          }}
          activeLesson={activeSelectedLesson}
        />
      )}

      {/* Theme and Floral Skin Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />

      {/* Mobile Icon & PWA Installation Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Google Authentication & Firebase Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => setUser(profile)}
      />

      {/* Authentic American Accent Studio Modal */}
      <AmericanAccentStudioModal
        isOpen={isAccentStudioOpen}
        onClose={() => setIsAccentStudioOpen(false)}
      />

      {/* Collectible Cards & MSZ Coins Shop Modal */}
      <MszShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        userLevel={calculateLevel(user.stats?.totalXp ?? 0)}
        completedLessons={user.stats?.completedModules ?? 0}
        onProfileUpdated={() => setUser(getLocalUserProfile())}
      />

      {/* Level-Up Celebration Modal (Framer Motion) */}
      <LevelUpCelebrationModal
        isOpen={isLevelUpModalOpen}
        data={levelUpData}
        onClose={() => setIsLevelUpModalOpen(false)}
        onClaimReward={() => {
          // Bonus honorifique de complétion
          setIsLevelUpModalOpen(false);
        }}
      />

      {/* Floating XP Gain / Penalty Toast (Framer Motion) */}
      <XpGainToast
        toast={xpToast}
        onDismiss={() => setXpToast(null)}
      />

      {/* AI English Tutor Modal */}
      <AITutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        user={user}
        schoolGrade={activeSchoolGrade}
        cefrLevel={currentLevel}
        weakestSkills={user.adaptiveProfile?.weakestSkills}
        onXpEarned={(xp) => {
          handleChallengeComplete(xp);
          setUser(getLocalUserProfile());
        }}
        onProfileUpdated={() => setUser(getLocalUserProfile())}
      />

      {/* English Escape Room Modal */}
      <EnglishEscapeRoomModal
        isOpen={isEscapeRoomOpen}
        onClose={() => setIsEscapeRoomOpen(false)}
        schoolGrade={activeSchoolGrade}
        cefrLevel={currentLevel}
        onXpEarned={(xp) => {
          handleChallengeComplete(xp);
          setUser(getLocalUserProfile());
        }}
      />

      {/* Listening Cinema Modal */}
      <ListeningCinemaModal
        isOpen={isCinemaOpen}
        onClose={() => setIsCinemaOpen(false)}
        schoolGrade={activeSchoolGrade}
        cefrLevel={currentLevel}
        onXpEarned={(xp) => {
          handleChallengeComplete(xp);
          setUser(getLocalUserProfile());
        }}
      />

      {/* Grammar Battle Arena Modal */}
      <GrammarBattleModal
        isOpen={isGrammarBattleOpen}
        onClose={() => setIsGrammarBattleOpen(false)}
        schoolGrade={activeSchoolGrade}
        cefrLevel={currentLevel}
        onXpEarned={(xp) => {
          handleChallengeComplete(xp);
          setUser(getLocalUserProfile());
        }}
      />

      {/* Adaptive Placement Test & Student Profile Modal */}
      <AdaptivePlacementModal
        isOpen={isPlacementModalOpen}
        user={user}
        onClose={() => setIsPlacementModalOpen(false)}
        onCompleted={(updated, xpAwarded) => {
          setUser(updated);
          setCurrentLevel(updated.level);
          if (xpAwarded > 0) {
            handleChallengeComplete(xpAwarded);
          }
        }}
      />

      {/* Interactive Lesson Detail Modal from Global Search */}
      <LessonDetailModal
        lesson={searchLessonForDetail}
        isOpen={searchLessonForDetail !== null}
        onClose={() => setSearchLessonForDetail(null)}
        onCompleteLesson={(id, xp) => {
          markLessonCompletedLocally(id);
          handleChallengeComplete(xp);
        }}
        isFavorite={searchLessonForDetail ? favoriteLessonIds.includes(searchLessonForDetail.id) : false}
        onToggleFavorite={
          searchLessonForDetail
            ? () => handleToggleFavoriteLesson(searchLessonForDetail.id)
            : undefined
        }
      />

      {/* Bouton de raccourci flottant vers le Studio d'Élocution (uniquement si une leçon est activement sélectionnée) */}
      <AnimatePresence mode="wait">
        {activeSelectedLesson && (
          <FloatingSpeakingStudioShortcut
            key={activeSelectedLesson.id}
            activeLesson={activeSelectedLesson}
            onOpenSpeakingStudio={() => setIsSpeakingOpen(true)}
            onDismiss={() => setActiveSelectedLesson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
