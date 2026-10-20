import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, type TabKey } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { QuoteSection } from './components/QuoteSection';
import { StackedCards } from './components/StackedCards';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { CabinetCuriosities } from './components/CabinetCuriosities';
import { DashboardView } from './components/DashboardView';
import { PracticeView } from './components/PracticeView';
import { DictationModal } from './components/DictationModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { QuizModal } from './components/QuizModal';
import { SpeakingStudioModal } from './components/SpeakingStudioModal';
import { ProfileModal } from './components/ProfileModal';
import { FloralBorderFrame } from './components/FloralBorderFrame';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { SchoolCurriculumView } from './components/SchoolCurriculumView';
import { useSyncStatus } from './offline/useSyncStatus';
import {
  getLocalUserProfile,
  subscribeToAuthState,
  updateUserProfile,
  uploadHeroPhoto
} from './firebase/client';
import type { UserProfile, CEFRLevel } from './firebase/types';
import type { StudyFolio, CurioWord } from './data/curriculum';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('accueil');
  const [user, setUser] = useState<UserProfile>(getLocalUserProfile());
  const { isOnline, pendingCount, triggerSync } = useSyncStatus();
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>('C1');
  const [heroPhotoUrl, setHeroPhotoUrl] = useState<string>(user.heroImageURL);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [isDictationOpen, setIsDictationOpen] = useState<boolean>(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isSpeakingOpen, setIsSpeakingOpen] = useState<boolean>(false);
  const [activeFolioForStudy, setActiveFolioForStudy] = useState<StudyFolio | null>(null);

  // Subscribe to auth / local session
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((profile) => {
      if (profile) {
        setUser(profile);
        setCurrentLevel(profile.level);
        if (profile.heroImageURL) {
          setHeroPhotoUrl(profile.heroImageURL);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLevelChange = async (newLevel: CEFRLevel) => {
    setCurrentLevel(newLevel);
    const updated = await updateUserProfile({ level: newLevel });
    setUser(updated);
  };

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
    const updated = await updateUserProfile({
      stats: {
        ...user.stats,
        studyMinutesTarget: mins
      }
    });
    setUser(updated);
  };

  const handleChallengeComplete = async (xp: number) => {
    const updated = await updateUserProfile({
      stats: {
        ...user.stats,
        weeklyXp: user.stats.weeklyXp + xp,
        totalXp: user.stats.totalXp + xp
      }
    });
    setUser(updated);
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
        onOpenProfile={() => setIsProfileOpen(true)}
        onLevelChange={handleLevelChange}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        onNavigateCursus={() => setActiveTab('cursus')}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-amber-950/95 border-b border-amber-500/50 px-4 py-2 text-center text-xs text-amber-200 font-medium flex items-center justify-center gap-2 backdrop-blur-md shadow-lg animate-fadeIn">
          <span className="material-symbols-outlined text-sm text-amber-400">wifi_off</span>
          <span>
            Mode Hors-Ligne activé : vos leçons, quiz et scores sont enregistrés sur <strong>IndexedDB local</strong> et seront synchronisés automatiquement à la reconnexion.
          </span>
        </div>
      )}

      {/* Pending Sync Notification Banner (when online with pending queue items) */}
      {isOnline && pendingCount > 0 && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-[#191f2f]/95 border-b border-[#f2ca50]/50 px-4 py-2 text-center text-xs text-[#dce2f8] font-medium flex items-center justify-center gap-3 backdrop-blur-md shadow-lg animate-fadeIn">
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

      {/* Main Routed Content */}
      <main className={`flex-1 w-full pb-20 ${!isOnline || (isOnline && pendingCount > 0) ? 'pt-24' : 'pt-16'}`}>
        {activeTab === 'accueil' && (
          <div className="flex flex-col w-full max-w-4xl mx-auto animate-fadeIn">
            {/* Monumental Hero Section with background-clip text & scroll zoom */}
            <HeroSection
              currentPhotoUrl={heroPhotoUrl}
              onPhotoChange={handlePhotoChange}
              onCustomUpload={handleCustomUpload}
            />

            {/* Bilingual Quote of Distinction (Lord Chesterfield) */}
            <QuoteSection />

            {/* Editorial Banner for 6e-Terminale School Curriculum */}
            <div
              onClick={() => setActiveTab('cursus')}
              className="mx-4 sm:mx-6 my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#191f2f] via-[#151b2b] to-[#232a3a] border border-[#f2ca50]/40 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-widest">
                      CURSUS OFFICIEL 6E ➔ TERMINALE
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                      70 LEÇONS COMPLÈTES
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                    Programme Pédagogique par Classe & 10 Thèmes
                  </h3>
                  <p className="text-xs text-[#d0c5af]/80">
                    Vocabulaire traduit, grammaire explicite, dialogues bilingues sonorisés, dictées et quiz interactifs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md"
              >
                <span>Explorer</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Stacked Overlapping Study Cards (Manuscrits d'Étude) */}
            <StackedCards onOpenFolioStudy={handleOpenFolioStudy} />

            {/* Daily Challenge (The Nuance Matrix) */}
            <DailyChallengeCard onChallengeComplete={handleChallengeComplete} />

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
        )}

        {activeTab === 'cursus' && (
          <div className="max-w-4xl mx-auto animate-fadeIn pt-2">
            <SchoolCurriculumView
              onLessonCompleted={(_lessonId, xp) => handleChallengeComplete(xp)}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto animate-fadeIn pt-2">
            <DashboardView
              user={user}
              onResumePractice={() => setActiveTab('pratique')}
              onUpdateStudyTarget={handleUpdateStudyTarget}
            />
          </div>
        )}

        {activeTab === 'pratique' && (
          <div className="max-w-4xl mx-auto animate-fadeIn pt-2">
            <PracticeView
              currentLevel={currentLevel}
              onSelectLevel={handleLevelChange}
              onOpenDictation={() => setIsDictationOpen(true)}
              onOpenFlashcards={() => setIsFlashcardsOpen(true)}
              onOpenQuiz={() => setIsQuizOpen(true)}
              onOpenSpeaking={() => setIsSpeakingOpen(true)}
            />
          </div>
        )}

        {activeTab === 'profil' && (
          <div className="max-w-xl mx-auto animate-fadeIn pt-2">
            <ProfileModal
              user={user}
              onClose={() => setActiveTab('accueil')}
              onUpdateUser={async (partial) => {
                const updated = await updateUserProfile(partial);
                setUser(updated);
              }}
              onCustomPhotoUpload={handleCustomUpload}
            />
          </div>
        )}
      </main>

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
          onClose={() => setIsFlashcardsOpen(false)}
          onCardReviewed={() => {
            setUser(getLocalUserProfile());
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
        />
      )}

      {/* Theme and Floral Skin Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />
    </div>
  );
}
