import React, { useState, useEffect } from 'react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APP_ICON_URL = '/src/assets/images/app_icon_msz_1792789129742.jpg';

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [platformTab, setPlatformTab] = useState<'ios' | 'android'>('ios');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    // Detect OS default
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor;
      if (/android/i.test(userAgent)) {
        setPlatformTab('android');
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        setPlatformTab('ios');
      }
    }

    // Capture PWA install prompt for Chromium browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#0e1628] border border-[#f2ca50]/50 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Flare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full bg-gradient-to-r from-amber-400/25 via-[#f2ca50]/20 to-yellow-300/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#f2ca50] via-yellow-200 to-transparent shadow-[0_0_12px_#f2ca50] z-20" />

        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#232a3a] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f2ca50] to-[#d4af37] text-[#2c2000] flex items-center justify-center shadow-[0_0_12px_rgba(242,202,80,0.4)]">
              <span className="material-symbols-outlined text-xl">install_mobile</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white leading-tight">
                Icône & Installation Mobile
              </h2>
              <p className="text-[11px] text-[#d4c78f] font-mono">
                English Boost MSZ • iOS & Android
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#192237] hover:bg-[#253350] text-[#dce2f8] flex items-center justify-center transition-colors border border-white/10"
            title="Fermer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-5 relative z-10">
          {/* 1. App Icon Showcase Card */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-[#141d33] to-[#0a101f] border border-[#f2ca50]/40 flex flex-col sm:flex-row items-center gap-5 shadow-inner">
            {/* 3D Curved Squircle Icon Display */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 rounded-[26px] bg-gradient-to-r from-amber-400 via-[#f2ca50] to-yellow-300 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[22px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.8)] border border-[#f2ca50]/60 ring-2 ring-black/40">
                <img
                  src={APP_ICON_URL}
                  alt="English Boost MSZ App Icon"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#0c1424] text-[#f2ca50] text-[9px] font-mono font-bold border border-[#f2ca50]/50 shadow-md">
                512px HD
              </span>
            </div>

            {/* Description & Label */}
            <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="text-[10px] text-[#f2ca50] font-mono font-bold uppercase tracking-widest">
                  Édition Maître &bull; Or Impérial
                </span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                Boost MSZ
              </h3>
              <p className="text-xs text-[#d0c5af]/85 leading-relaxed">
                Plume d'or victorienne & parchemin enluminé gravés du monogramme MSZ, sur fond velours bleu Oxford.
              </p>

              {/* Download link button */}
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <a
                  href={APP_ICON_URL}
                  download="english_boost_msz_app_icon.jpg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#233252] hover:bg-[#2d4069] text-[#ffe082] text-xs font-semibold border border-[#f2ca50]/30 transition-all shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Télécharger l'icône HD</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#151f33] hover:bg-[#1f2f4e] text-[#dce2f8] text-xs font-medium border border-white/10 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isCopied ? 'check' : 'link'}
                  </span>
                  <span>{isCopied ? 'Copié !' : 'Copier URL'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Platform Selector Tabs (iOS vs Android) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center p-1 rounded-xl bg-[#090e1a] border border-[#232a3a]">
              <button
                type="button"
                onClick={() => setPlatformTab('ios')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  platformTab === 'ios'
                    ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] shadow-md'
                    : 'text-[#d0c5af] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">phone_iphone</span>
                <span>Ajouter sur iPhone / iPad (iOS)</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatformTab('android')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  platformTab === 'android'
                    ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] shadow-md'
                    : 'text-[#d0c5af] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">android</span>
                <span>Ajouter sur Android (Pixel/Samsung)</span>
              </button>
            </div>

            {/* Instructions Cards */}
            {platformTab === 'ios' ? (
              <div className="p-4 rounded-2xl bg-[#121b2d] border border-[#232a3a] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f2ca50]">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Procédure Safari iOS (iPhone / iPad) :</span>
                </div>

                <ol className="flex flex-col gap-2.5 text-xs text-[#dce2f8] leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Ouvrez ce site dans le navigateur <strong>Safari</strong> sur votre iPhone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Touchez le bouton de partage
                      <span className="px-1.5 py-0.5 rounded bg-[#233252] text-[#f2ca50] inline-flex items-center gap-1 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-xs">ios_share</span> Partager
                      </span>
                      au bas de l'écran.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Faites défiler le menu vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong> (icône avec un carré et un plus).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Touchez <strong>« Ajouter »</strong> en haut à droite. L'icône dorée royale s'installe sur votre écran d'accueil avec démarrage instantané en plein écran !
                    </span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#121b2d] border border-[#232a3a] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Procédure Google Chrome / Samsung Internet :</span>
                </div>

                <ol className="flex flex-col gap-2.5 text-xs text-[#dce2f8] leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Ouvrez ce site dans <strong>Google Chrome</strong> ou votre navigateur Android habituel.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Touchez les 3 points
                      <span className="px-1.5 py-0.5 rounded bg-[#233252] text-white inline-flex items-center gap-1 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-xs">more_vert</span> Menu
                      </span>
                      en haut à droite.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#1b263e] border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                    </span>
                  </li>
                </ol>

                {/* Direct PWA Install prompt trigger if available */}
                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Installer Immédiatement sur Android</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#090e1a] border-t border-[#232a3a] flex items-center justify-between text-xs text-[#99907c]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            PWA Standalone &bull; Rendu Plein Écran
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#192237] hover:bg-[#233252] text-white font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
