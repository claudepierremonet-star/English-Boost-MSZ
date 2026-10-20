import React, { useState } from 'react';
import type { UserProfile, CEFRLevel } from '../firebase/types';
import { signInWithGoogle, signOutUser, isFirebaseConfigured } from '../firebase/client';
import { useAppTheme, type AppTheme, type FloralBorderWidth } from '../theme/ThemeContext';
import { BadgesSection } from './BadgesSection';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onCustomPhotoUpload: (file: File) => Promise<string>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onUpdateUser,
  onCustomPhotoUpload
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(user.level);
  const [selectedPace, setSelectedPace] = useState<number>(user.stats.studyMinutesTarget || 30);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const handleLevelSelect = (lvl: CEFRLevel) => {
    setSelectedLevel(lvl);
    onUpdateUser({ level: lvl });
  };

  const handlePaceSelect = (mins: number) => {
    setSelectedPace(mins);
    onUpdateUser({
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
    }
  };

  const { theme, floralWidth, setTheme, setFloralWidth, isDark } = useAppTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 bg-[#0c1322]/90 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <h1 className="font-serif text-lg font-bold text-[#dce2f8]">
            Profil & Paramètres
          </h1>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </header>

      {/* Main Form */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-5">
        {/* User Card */}
        <div className="p-5 rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 shadow-xl flex items-center gap-4">
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
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[10px] text-[#f2ca50] font-bold font-mono">
                {user.level} ADVANCED
              </span>
              <span className="text-xs text-[#d4c78f] font-mono">
                {user.stats.totalXp.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>

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
                : 'Claire Florale'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'dark', label: 'Sombre Classique', icon: 'dark_mode' },
              { id: 'light', label: 'Claire Albâtre', icon: 'light_mode' },
              { id: 'dark-floral', label: 'Sombre Florale', icon: 'local_florist' },
              { id: 'light-floral', label: 'Claire Florale', icon: 'local_florist' }
            ].map((skin) => (
              <button
                key={skin.id}
                type="button"
                onClick={() => setTheme(skin.id as AppTheme)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  theme === skin.id
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md font-bold'
                    : 'bg-[#232a3a] text-[#dce2f8] border-[#4d4635]/30 hover:bg-[#2e3545]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-sm">{skin.icon}</span>
                  <span className="truncate">{skin.label}</span>
                </div>
                {theme === skin.id && (
                  <span className="material-symbols-outlined text-sm">check</span>
                )}
              </button>
            ))}
          </div>

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

        {/* Authentication Zone */}
        <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#4d4635]/40 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
              Firebase Authentication
            </span>
            <span className="text-xs text-[#d0c5af] font-mono">
              {isFirebaseConfigured ? 'Service Cloud Connecté' : 'Mode Session Locale'}
            </span>
          </div>

          <p className="text-xs text-[#d0c5af] leading-relaxed">
            Connectez votre compte Google pour synchroniser instantanément vos statistiques d'apprentissage, vos révisions SM-2 et vos photographies de couverture entre tous vos appareils.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSigningIn}
              className="flex-1 py-3 px-4 rounded-xl bg-[#232a3a] hover:bg-[#2e3545] border border-[#f2ca50]/40 text-[#dce2f8] font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base text-[#f2ca50]">account_circle</span>
              <span>{isSigningIn ? 'Connexion en cours...' : 'Connexion avec Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="py-3 px-4 rounded-xl bg-[#070e1d] hover:bg-[#93000a]/20 border border-[#4d4635]/30 text-[#d0c5af] hover:text-[#ffb4ab] text-xs font-semibold transition-colors"
            >
              Déconnexion
            </button>
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

          <div className="grid grid-cols-4 gap-2">
            {(['B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelSelect(lvl)}
                className={`py-3 rounded-xl flex flex-col items-center justify-center border font-mono transition-all ${
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
              Cadence Quotidienne
            </span>
            <span className="text-[#d4c78f] font-mono">{selectedPace} minutes / jour</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[20, 30, 45].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handlePaceSelect(mins)}
                className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  selectedPace === mins
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md'
                    : 'bg-[#232a3a] text-[#dce2f8] border-[#4d4635]/30 hover:bg-[#2e3545]'
                }`}
              >
                {mins} min
              </button>
            ))}
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
      </main>
    </div>
  );
};
