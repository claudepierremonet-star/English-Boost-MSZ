import React, { useState } from 'react';
import { signInWithGoogle, isFirebaseConfigured, auth } from '../firebase/client';
import type { UserProfile } from '../firebase/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await signInWithGoogle();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-in failed', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('La fenêtre de connexion a été fermée.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Requête annulée.');
      } else {
        setErrorMessage('Erreur lors de la connexion Google. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0c1322] border border-[#f2ca50]/50 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-[#dce2f8] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {/* Brand Crest & Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-[#d4af37] via-[#f2ca50] to-[#aa8322] shadow-xl shadow-[#f2ca50]/20">
            <img
              src="/app-icon.jpg"
              alt="English Boost MSZ"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[11px] font-mono text-[#f2ca50] font-bold uppercase tracking-[0.25em] mt-2">
            ACADÉMIE MSZ ÉDITORIALE
          </span>
          <h2 className="font-serif font-bold text-2xl text-[#dce2f8]">
            Connexion & Inscription
          </h2>
          <p className="text-xs text-[#d0c5af] leading-relaxed max-w-xs">
            Connectez votre compte Google pour sauvegarder et synchroniser automatiquement toutes vos données sur notre base de données Cloud <strong>Firebase Firestore</strong>.
          </p>
        </div>

        {/* Cloud Architecture Guarantees */}
        <div className="p-4 rounded-2xl bg-[#141b2a] border border-[#f2ca50]/20 flex flex-col gap-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#f2ca50] text-sm shrink-0 mt-0.5">cloud_done</span>
            <div>
              <strong className="text-[#dce2f8]">Cloud Firestore Haute Disponibilité :</strong>
              <p className="text-[#d0c5af]/80 text-[11px]">Tous vos scores de dictée, quiz, révisions SM-2 et séries de jours sont sauvegardés de manière pérenne.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#f2ca50] text-sm shrink-0 mt-0.5">devices</span>
            <div>
              <strong className="text-[#dce2f8]">Multi-Appareils Automatique :</strong>
              <p className="text-[#d0c5af]/80 text-[11px]">Passez instantanément de votre ordinateur à votre iPhone ou tablette Android sans perdre aucune progression.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">lock</span>
            <div>
              <strong className="text-emerald-300">Règles de Sécurité Cloisonnées :</strong>
              <p className="text-[#d0c5af]/80 text-[11px]">Accès privé garanti par jeton d'authentification Google OAuth 2.0.</p>
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm text-rose-400">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button: Google Sign-In */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm tracking-wide shadow-lg shadow-[#f2ca50]/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                <span>Connexion sécurisée en cours...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>S'inscrire / Se connecter avec Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[#d0c5af]/70">
            En un clic, sans mot de passe à mémoriser.
          </p>
        </div>

        {/* Cloud Status Footer */}
        <div className="pt-3 border-t border-[#232a3a] flex items-center justify-between text-[11px] text-[#d0c5af]">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firebase Firestore Connecté</span>
          </span>
          <span className="font-mono text-[#f2ca50]/80">Projet Cloud feisty-cipher-2tn3v</span>
        </div>
      </div>
    </div>
  );
};
