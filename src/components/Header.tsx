import React, { useState } from 'react';
import type { UserProfile, CEFRLevel } from '../firebase/types';
import { useSyncStatus } from '../offline/useSyncStatus';
import appIconImg from '../assets/images/app_icon_msz_1792789129742.jpg';

interface HeaderProps {
  user: UserProfile;
  currentLevel: CEFRLevel;
  isAuthenticated?: boolean;
  onOpenProfile: () => void;
  onLevelChange: (level: CEFRLevel) => void;
  onOpenThemeSelector?: () => void;
  onNavigateCursus?: () => void;
  onNavigateLeaderboard?: () => void;
  onOpenInstallModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAccentStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentLevel,
  isAuthenticated = false,
  onOpenProfile,
  onLevelChange,
  onOpenThemeSelector,
  onNavigateCursus,
  onNavigateLeaderboard,
  onOpenInstallModal,
  onOpenAuthModal,
  onOpenAccentStudio
}) => {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useSyncStatus();
  const [imageError, setImageError] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#0c1322]/85 backdrop-blur-xl border-b border-[#232a3a]/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Lockup with Luxury App Icon */}
        <div
          onClick={onOpenInstallModal}
          className="flex items-center gap-2.5 cursor-pointer group"
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

        {/* Level, Theme Palette, Network State & Profile Zone */}
        <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={onNavigateCursus}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#232a3a]/80 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95"
              title="Accéder au cursus 6e à Terminale (70 leçons)"
            >
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span className="font-mono text-[11px] uppercase tracking-wider">Cursus 6e-Tle</span>
            </button>
          )}

          {/* Weekly Leaderboard quick badge */}
          {onNavigateLeaderboard && (
            <button
              type="button"
              onClick={onNavigateLeaderboard}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#b45309]/30 to-[#f59e0b]/20 hover:from-[#b45309]/50 hover:to-[#f59e0b]/30 border border-[#f2ca50]/50 text-xs font-bold text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 shadow-sm"
              title="Consulter le classement hebdomadaire des apprenants"
            >
              <span className="material-symbols-outlined text-[15px] text-[#f2ca50]">emoji_events</span>
              <span className="hidden sm:inline font-mono text-[11px]">Top Hebdo</span>
            </button>
          )}

          {/* Quick Skin / Theme Switcher Button */}
          {onOpenThemeSelector && (
            <button
              type="button"
              onClick={onOpenThemeSelector}
              className="p-1.5 rounded-full bg-[#232a3a]/80 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="Changer la peau de l'application (Sombre, Claire, Florale)"
            >
              <span className="material-symbols-outlined text-[19px]">palette</span>
            </button>
          )}

          {/* Authentic American Accent Studio Button */}
          {onOpenAccentStudio && (
            <button
              type="button"
              onClick={onOpenAccentStudio}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101e33] hover:bg-[#192b47] border border-[#38bdf8]/40 hover:border-[#38bdf8] text-xs font-semibold text-[#7dd3fc] transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Studio d'Authenticité Vocale Américaine (General American)"
            >
              <span className="text-[13px]">🇺🇸</span>
              <span className="hidden sm:inline font-mono text-[11px] font-bold text-[#38bdf8]">Accent US</span>
            </button>
          )}

          {/* Mobile Icon & PWA Installation Modal Button */}
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b263e] hover:bg-[#243354] border border-[#f2ca50]/40 text-xs font-semibold text-[#ffe082] transition-all active:scale-95 shadow-sm"
              title="Installer l'icône sur iPhone / iPad ou Android"
            >
              <span className="material-symbols-outlined text-[15px] text-[#f2ca50]">install_mobile</span>
              <span className="hidden md:inline font-mono text-[11px]">Icône Mobile</span>
            </button>
          )}

          {/* CEFR Level Quick Selector */}
          <div className="relative">
            <select
              aria-label="Sélectionner votre niveau CECRL"
              value={currentLevel}
              onChange={(e) => onLevelChange(e.target.value as CEFRLevel)}
              className="appearance-none cursor-pointer inline-flex items-center gap-1.5 pl-3 pr-7 py-1 rounded-full bg-[#232a3a]/90 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] tracking-wider uppercase transition-colors focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
            >
              <option value="B1" className="bg-[#151b2b] text-[#dce2f8]">B1 SEUIL</option>
              <option value="B2" className="bg-[#151b2b] text-[#dce2f8]">B2 AVANCÉ</option>
              <option value="C1" className="bg-[#151b2b] text-[#f2ca50]">C1 ADVANCED</option>
              <option value="C2" className="bg-[#151b2b] text-[#f2ca50]">C2 MASTERY</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#f2ca50]">
              expand_more
            </span>
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
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'} ring-2 ring-[#0c1322]`}
              title={isAuthenticated ? 'Compte Google synchronisé sur Firebase' : 'Mode invité local'}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
