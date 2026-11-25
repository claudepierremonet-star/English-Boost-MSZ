import React, { useState, useEffect } from 'react';
import type { UserProfile, CEFRLevel, CityMapProgressionState } from '../firebase/types';
import type { SchoolLesson } from '../data/schoolCurriculum';
import { useSyncStatus } from '../offline/useSyncStatus';
import { calculateLevel } from '../utils/levelUtils';
import { getMszCoinsBalance } from '../utils/mszCoinsManager';
import { HeaderSessionTimer } from './HeaderSessionTimer';
import { HeaderLevelProgressBar } from './HeaderLevelProgressBar';
import { isSoundEffectsEnabled, toggleSoundEffects, SOUND_EFFECTS_EVENT } from '../utils/soundEffects';
import { inferGradeFromCefr } from '../services/adaptiveEngine';
import { useReadingMode } from '../context/ReadingModeContext';
import { ReadingModeToggleButton } from './ReadingModeToggleButton';
import { MotionTooltip } from './MotionTooltip';
import appIconImg from '../assets/images/app_icon_msz_1792789129742.jpg';

interface HeaderProps {
  user: UserProfile;
  currentLevel: CEFRLevel;
  isAuthenticated?: boolean;
  activeLesson?: SchoolLesson | null;
  onUpdateStudyTarget?: (minutes: number) => void;
  onAddStudyMinute?: () => void;
  onOpenProfile: () => void;
  onLevelChange: (level: CEFRLevel) => void;
  onOpenThemeSelector?: () => void;
  onNavigateCursus?: () => void;
  onNavigateLeaderboard?: () => void;
  onOpenInstallModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAccentStudio?: () => void;
  onOpenLevelCelebration?: () => void;
  onOpenShop?: () => void;
  cityMapProgression?: CityMapProgressionState;
  onNavigateCityMap?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentLevel,
  isAuthenticated = false,
  activeLesson = null,
  onUpdateStudyTarget,
  onAddStudyMinute,
  onOpenProfile,
  onLevelChange,
  onOpenThemeSelector,
  onNavigateCursus,
  onNavigateLeaderboard,
  onOpenInstallModal,
  onOpenAuthModal,
  onOpenAccentStudio,
  onOpenLevelCelebration,
  onOpenShop,
  cityMapProgression,
  onNavigateCityMap
}) => {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useSyncStatus();
  const { isReadingMode } = useReadingMode();
  const [imageError, setImageError] = useState(false);
  const [mszCoins, setMszCoins] = useState<number>(() => getMszCoinsBalance());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isSoundEffectsEnabled());
  const academicLevel = calculateLevel(user.stats?.totalXp || 0);
  const xpInLevel = (user.stats?.totalXp || 0) % 100;

  useEffect(() => {
    const handleCoinsUpdate = () => setMszCoins(getMszCoinsBalance());
    window.addEventListener('msz-coins-updated', handleCoinsUpdate);
    return () => window.removeEventListener('msz-coins-updated', handleCoinsUpdate);
  }, []);

  useEffect(() => {
    const handleSoundUpdate = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setSoundEnabled(typeof ce.detail === 'boolean' ? ce.detail : isSoundEffectsEnabled());
    };
    window.addEventListener(SOUND_EFFECTS_EVENT, handleSoundUpdate);
    return () => window.removeEventListener(SOUND_EFFECTS_EVENT, handleSoundUpdate);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isReadingMode
          ? 'bg-[#0c1322]/65 backdrop-blur-md border-b border-[#232a3a]/35 shadow-none'
          : 'bg-[#0c1322]/90 backdrop-blur-xl border-b border-[#232a3a]/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
      }`}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 10px)' }}
    >
      <div className="max-w-6xl mx-auto h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup with Luxury App Icon */}
        <div
          onClick={onOpenInstallModal}
          className={`flex items-center gap-2.5 cursor-pointer group shrink-0 transition-opacity duration-300 ${
            isReadingMode ? 'opacity-25 hover:opacity-100' : 'opacity-100'
          }`}
          title="Voir l'icône de l'application et l'ajouter sur votre écran d'accueil iOS/Android"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-[#d4af37] via-[#f2ca50] to-[#ccb14f] shadow-md shadow-[#f2ca50]/20 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
            {!imageError ? (
              <img
                src={appIconImg}
                onError={() => {
                  setImageError(true);
                }}
                alt="English Boost MSZ App Icon"
                className="w-full h-full object-cover rounded-[10px] block"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-[#0e1628] rounded-[10px] flex items-center justify-center text-[#f2ca50] font-black text-xs font-serif shadow-inner">
                MSZ
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-[17px] text-[#f2ca50] tracking-wide leading-none group-hover:text-[#ffe088] transition-colors">
              MSZ
            </span>
            <span className="font-sans text-[10px] text-[#d4c78f] uppercase tracking-[0.25em] leading-tight font-semibold mt-0.5">
              Editorial
            </span>
          </div>
        </div>

        {/* Mode Lecture + Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Always crisp Mode Lecture toggle */}
          <ReadingModeToggleButton variant="header" />

          {/* Secondary Header Elements (dimmed during Reading Mode) */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 transition-opacity duration-300 ${
              isReadingMode ? 'opacity-15 hover:opacity-95 focus-within:opacity-100' : 'opacity-100'
            }`}
          >
            {/* Visual Session Timer & Daily Target Configurator */}
          <HeaderSessionTimer
            activeLesson={activeLesson}
            studyMinutesToday={user.stats?.studyMinutesToday ?? 0}
            studyMinutesTarget={user.stats?.studyMinutesTarget ?? 30}
            onUpdateStudyTarget={(mins) => onUpdateStudyTarget?.(mins)}
            onAddStudyMinute={() => onAddStudyMinute?.()}
          />
          {/* Offline / Auto-Sync Pill */}
          {!isOnline ? (
            <button
              type="button"
              onClick={triggerSync}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-[11px] text-amber-300 font-mono font-bold shadow-sm"
              title="Mode Hors-Ligne : les exercices et le score sont enregistrés dans IndexedDB local"
            >
              <span className="material-symbols-outlined text-[13px]">wifi_off</span>
              <span className="hidden sm:inline">Hors-Ligne (IDB)</span>
            </button>
          ) : isSyncing ? (
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#232a3a] border border-[#f2ca50]/40 text-[11px] text-[#f2ca50] font-mono"
              title="Synchronisation automatique avec Cloud Firestore..."
            >
              <span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
              <span className="hidden sm:inline">Synchro...</span>
            </div>
          ) : pendingCount > 0 ? (
            <button
              type="button"
              onClick={triggerSync}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2ca50]/20 hover:bg-[#f2ca50]/30 border border-[#f2ca50]/50 text-[11px] text-[#f2ca50] font-mono font-bold transition-all active:scale-95"
              title={`${pendingCount} opération(s) en attente. Cliquer pour synchroniser avec Cloud Firestore.`}
            >
              <span className="material-symbols-outlined text-[13px]">cloud_upload</span>
              <span>{pendingCount} à synchroniser</span>
            </button>
          ) : null}
          {/* Cursus 6e-Tle quick badge */}
          {onNavigateCursus && (
            <MotionTooltip
              title="Cursus Scolaire"
              content="Accéder directement aux 200 leçons de la 6e à la Terminale."
              placement="bottom"
              wrapperClassName="hidden sm:inline-flex"
            >
              <button
                type="button"
                onClick={onNavigateCursus}
                aria-label="Accéder au cursus 6e à Terminale"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#232a3a]/80 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">school</span>
                <span className="font-mono text-[11px] uppercase tracking-wider">Cursus 6e-Tle</span>
              </button>
            </MotionTooltip>
          )}

          {/* Oxford Academic Level & Prestige Badge with Level-up celebration preview */}
          {onOpenLevelCelebration && (
            <MotionTooltip
              title={`Niveau ${academicLevel} (${xpInLevel}/100 XP)`}
              content={`Progression vers le Niveau ${academicLevel + 1}. Cliquez pour voir vos distinctions.`}
              placement="bottom"
            >
              <button
                type="button"
                onClick={onOpenLevelCelebration}
                aria-label={`Niveau Académique ${academicLevel}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-[#f2ca50]/20 to-amber-600/20 hover:from-amber-500/35 hover:to-[#f2ca50]/40 border border-[#f2ca50]/60 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-[#f2ca50]">military_tech</span>
                <span className="font-mono text-[11px] font-extrabold tracking-wide">Niv. {academicLevel}</span>
                <span className="hidden lg:inline text-[9px] font-mono text-[#d0c5af]/80">({xpInLevel}%)</span>
              </button>
            </MotionTooltip>
          )}

          {/* Weekly Leaderboard quick badge */}
          {onNavigateLeaderboard && (
            <MotionTooltip
              title="Ligue d'Oxford"
              content="Consulter le classement hebdomadaire et les défis de groupe."
              placement="bottom"
            >
              <button
                type="button"
                onClick={onNavigateLeaderboard}
                aria-label="Consulter le classement hebdomadaire"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#b45309]/30 to-[#f59e0b]/20 hover:from-[#b45309]/50 hover:to-[#f59e0b]/30 border border-[#f2ca50]/50 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-[#f2ca50]">emoji_events</span>
                <span className="hidden sm:inline font-mono text-[11px]">Top Hebdo</span>
              </button>
            </MotionTooltip>
          )}

          {/* MSZ Coins Balance & Shop Quick Button */}
          {onOpenShop && (
            <MotionTooltip
              title="Boutique MSZ"
              content="Gérer vos MSZ Coins et débloquer avatars ou cartes 3D."
              placement="bottom"
            >
              <button
                type="button"
                onClick={onOpenShop}
                aria-label="Ouvrir la boutique MSZ Coins"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#182338] hover:bg-[#202f4a] border border-[#f2ca50]/50 text-xs font-bold text-[#ffd700] hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[15px] text-[#f2ca50]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  monetization_on
                </span>
                <span className="font-mono text-[11px] font-black">{mszCoins.toLocaleString()}</span>
                <span className="hidden xl:inline text-[9px] text-[#f2ca50] font-mono">MSZ</span>
              </button>
            </MotionTooltip>
          )}

          {/* Subtle Sound Effects Toggle Button */}
          <MotionTooltip
            title="Effets Sonores"
            content={soundEnabled ? 'Couper les retours sonores interactifs.' : 'Activer les retours sonores interactifs.'}
            placement="bottom"
          >
            <button
              type="button"
              onClick={() => setSoundEnabled(toggleSoundEffects())}
              className={`p-1.5 rounded-full border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                soundEnabled
                  ? 'bg-[#232a3a]/80 hover:bg-[#2e3545] border-[#f2ca50]/30 text-[#f2ca50] hover:text-[#ffe088]'
                  : 'bg-[#151b2b]/80 hover:bg-[#232a3a] border-[#232a3a] text-[#99907c] hover:text-[#dce2f8]'
              }`}
              aria-label={soundEnabled ? 'Couper les indices sonores' : 'Activer les indices sonores'}
            >
              <span className="material-symbols-outlined text-[19px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          </MotionTooltip>

          {/* Quick Skin / Theme Switcher Button */}
          {onOpenThemeSelector && (
            <MotionTooltip
              title="Apparence"
              content="Personnaliser le thème visuel (Sombre, Clair ou Floral)."
              placement="bottom"
            >
              <button
                type="button"
                onClick={onOpenThemeSelector}
                aria-label="Changer le thème de l'application"
                className="p-1.5 rounded-full bg-[#232a3a]/80 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">palette</span>
              </button>
            </MotionTooltip>
          )}

          {/* Authentic American Accent Studio Button */}
          {onOpenAccentStudio && (
            <MotionTooltip
              title="Accent Américain"
              content="Studio d'entraînement à la prononciation General American."
              placement="bottom"
            >
              <button
                type="button"
                onClick={onOpenAccentStudio}
                aria-label="Ouvrir le studio d'accent américain"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101e33] hover:bg-[#192b47] border border-[#38bdf8]/40 hover:border-[#38bdf8] text-xs font-semibold text-[#7dd3fc] transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span className="text-[13px]">🇺🇸</span>
                <span className="hidden sm:inline font-mono text-[11px] font-bold text-[#38bdf8]">Accent US</span>
              </button>
            </MotionTooltip>
          )}

          {/* Mobile Icon & PWA Installation Modal Button */}
          {onOpenInstallModal && (
            <MotionTooltip
              title="Application Mobile"
              content="Installer le raccourci MSZ sur iPhone, iPad ou Android."
              placement="bottom"
            >
              <button
                type="button"
                onClick={onOpenInstallModal}
                aria-label="Installer l'application sur mobile"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b263e] hover:bg-[#243354] border border-[#f2ca50]/40 text-xs font-semibold text-[#ffe082] transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-[#f2ca50]">install_mobile</span>
                <span className="hidden md:inline font-mono text-[11px]">Icône Mobile</span>
              </button>
            </MotionTooltip>
          )}

          {/* School Grade Indicator + CEFR Level Quick Selector */}
          <div className="flex items-center gap-1.5">
            <span
              className="hidden md:inline-flex items-center px-2 py-1 rounded-full bg-[#151b2b] border border-[#f2ca50]/25 text-[10px] font-mono font-bold text-[#d4c78f] uppercase"
              title="Classe scolaire configurée"
            >
              {(user.schoolGrade || inferGradeFromCefr(currentLevel)) === 'terminale'
                ? 'Tle'
                : user.schoolGrade || inferGradeFromCefr(currentLevel)}
            </span>
            <div className="relative">
              <select
                aria-label="Sélectionner votre niveau CECRL"
                value={currentLevel}
                onChange={(e) => onLevelChange(e.target.value as CEFRLevel)}
                className="appearance-none cursor-pointer inline-flex items-center gap-1.5 pl-3 pr-7 py-1 rounded-full bg-[#232a3a]/90 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] tracking-wider uppercase transition-colors focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
              >
                <option value="A1" className="bg-[#151b2b] text-[#dce2f8]">A1 DÉCOUVERTE</option>
                <option value="A2" className="bg-[#151b2b] text-[#dce2f8]">A2 ÉLÉMENTAIRE</option>
                <option value="B1" className="bg-[#151b2b] text-[#dce2f8]">B1 SEUIL</option>
                <option value="B2" className="bg-[#151b2b] text-[#dce2f8]">B2 AVANCÉ</option>
                <option value="C1" className="bg-[#151b2b] text-[#f2ca50]">C1 ADVANCED</option>
                <option value="C2" className="bg-[#151b2b] text-[#f2ca50]">C2 MASTERY</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#f2ca50]">
                expand_more
              </span>
            </div>
          </div>

          {/* Google Sign-in CTA for unauthenticated scholars */}
          {!isAuthenticated && onOpenAuthModal ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#f2ca50] to-[#e0b73b] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#3c2f00] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              title="Connexion Google — Sauvegarder sur Firebase Cloud"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Connexion Google</span>
              <span className="sm:hidden">Connexion</span>
            </button>
          ) : null}

          {/* Profile Avatar Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="group relative flex items-center justify-center p-0.5 rounded-full ring-1 ring-[#f2ca50]/40 hover:ring-[#f2ca50] transition-all active:scale-95"
            title="Consulter le profil et les paramètres"
          >
            <img
              src={user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-j7VL5y1DulQO0ZUCmnVFKLzFgtqJ6ouE2w9tmtLT3GVTZ_f2HPrOXW27YcfNEv8XdaJBOR-xtCBTw965W8fuNDTngB1zPJOHyM4UEWMFLgliMGJq6IIA71cgZEZSfEarfPuCe6iC30vMqY3q7oyRonk89ZQ92-zclRrEwZWtP5qiv_HZvOnkMcB32962jQBrwbJAe0qa8CYPLZB8qH35jyDTntTaFWJh6C8_OVoDa8wDvwlgBHr'}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
            {user.englishAdventure?.equippedAvatarId &&
              user.englishAdventure.equippedAvatarId !== 'avatar_scholar_initiate' && (
                <span
                  className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#0c1322] border border-[#f2ca50] text-[#f2ca50] flex items-center justify-center shadow"
                  title="Avatar English Adventure équipé"
                >
                  <span className="material-symbols-outlined text-[10px]">crown</span>
                </span>
              )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'} ring-2 ring-[#0c1322]`}
              title={isAuthenticated ? 'Compte Google synchronisé sur Firebase' : 'Mode invité local'}
            />
          </button>
          </div>
        </div>
      </div>
      <div
        className={`transition-opacity duration-300 ${
          isReadingMode ? 'opacity-15 hover:opacity-95' : 'opacity-100'
        }`}
      >
        <HeaderLevelProgressBar
          progression={cityMapProgression}
          onNavigateCityMap={onNavigateCityMap}
        />
      </div>
    </header>
  );
};
