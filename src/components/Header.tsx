import React from 'react';
import type { UserProfile, CEFRLevel } from '../firebase/types';

interface HeaderProps {
  user: UserProfile;
  currentLevel: CEFRLevel;
  onOpenProfile: () => void;
  onLevelChange: (level: CEFRLevel) => void;
  onOpenThemeSelector?: () => void;
  onNavigateCursus?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentLevel,
  onOpenProfile,
  onLevelChange,
  onOpenThemeSelector,
  onNavigateCursus
}) => {
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#0c1322]/85 backdrop-blur-xl border-b border-[#232a3a]/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f2ca50] to-[#ccb14f] flex items-center justify-center p-0.5 shadow-md shadow-[#f2ca50]/15">
            <div className="w-full h-full bg-[#0c1322] rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-black text-sm text-[#f2ca50] tracking-tight">EB</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-[17px] text-[#f2ca50] tracking-wide leading-none">
              MSZ
            </span>
            <span className="font-sans text-[10px] text-[#d4c78f] uppercase tracking-[0.25em] leading-tight font-semibold mt-0.5">
              Editorial
            </span>
          </div>
        </div>

        {/* Level, Theme Palette & Profile Zone */}
        <div className="flex items-center gap-2.5">
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

          {/* Quick Skin / Theme Switcher Button */}
          {onOpenThemeSelector && (
            <button
              type="button"
              onClick={onOpenThemeSelector}
              className="p-1.5 rounded-full bg-[#232a3a]/80 hover:bg-[#2e3545] border border-[#f2ca50]/30 text-[#f2ca50] hover:text-[#ffe088] transition-all active:scale-95 flex items-center justify-center"
              title="Changer la peau de l'application (Sombre, Claire, Florale)"
            >
              <span className="material-symbols-outlined text-[19px]">palette</span>
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
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c1322]"
              title="Session synchronisée"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
