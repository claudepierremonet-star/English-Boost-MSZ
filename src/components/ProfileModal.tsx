import React, { useState } from 'react';
import type { UserProfile, CEFRLevel } from '../firebase/types';
import { signInWithGoogle, signOutUser, isFirebaseConfigured, auth, isUserSignedInWithGoogle } from '../firebase/client';
import { useAppTheme, type AppTheme, type FloralBorderWidth } from '../theme/ThemeContext';
import { BadgesSection } from './BadgesSection';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onCustomPhotoUpload: (file: File) => Promise<string>;
  onOpenInstallModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onUpdateUser,
  onCustomPhotoUpload,
  onOpenInstallModal
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
        <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/30 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-[#f2ca50] uppercase font-bold tracking-wider">
                Firebase Firestore & Google Auth
              </span>
            </div>
            <span className="text-xs text-emerald-300 font-mono font-semibold">
              Projet feisty-cipher-2tn3v
            </span>
          </div>

          {auth?.currentUser && !auth.currentUser.isAnonymous ? (
            <div className="p-3.5 rounded-xl bg-[#0c1322] border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-lg">verified_user</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#dce2f8]">
                    {auth.currentUser.displayName || 'Érudit Authentifié'}
                  </span>
                  <span className="text-[11px] font-mono text-[#d0c5af]">
                    {auth.currentUser.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-[#232a3a] hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
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

        {/* Mobile App Icon & Home Screen Installation */}
        {onOpenInstallModal && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#191f2f] to-[#121824] border border-[#f2ca50]/40 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-[#f2ca50] via-[#c69214] to-[#f2ca50] shadow-md shadow-[#f2ca50]/20 shrink-0">
                <img
                  src="/src/assets/images/app_icon_msz_1792789129742.jpg"
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
      </main>
    </div>
  );
};
