import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';

export type TabKey = 'accueil' | 'carte' | 'cursus' | 'jeux' | 'classement' | 'pratique' | 'dashboard' | 'profil';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navTrackRef = useRef<HTMLDivElement | null>(null);

  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'accueil', label: 'Accueil', icon: 'auto_stories' },
    { key: 'carte', label: 'Plan 600', icon: 'map' },
    { key: 'cursus', label: 'Cursus', icon: 'school' },
    { key: 'jeux', label: 'Game', icon: 'sports_esports' },
    { key: 'classement', label: 'Top XP', icon: 'leaderboard' },
    { key: 'pratique', label: 'Atelier', icon: 'menu_book' },
    { key: 'dashboard', label: 'Stats', icon: 'insights' },
    { key: 'profil', label: 'Profil', icon: 'person' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#0c1322]/88 backdrop-blur-xl border-t border-[#232a3a]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div
        ref={navTrackRef}
        className="relative max-w-2xl mx-auto h-[68px] px-1.5 sm:px-3 flex items-center justify-between gap-0.5 sm:gap-1"
      >
        <GlassSlidingCapsule containerRef={navTrackRef} activeKey={activeTab} />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              data-capsule-key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative z-10 flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 h-[50px] py-1 px-0.5 sm:px-1.5 rounded-full transition-colors duration-200 cursor-pointer active:scale-95 ${
                isActive ? 'glass-capsule-active-text' : 'text-[#d0c5af]/75 hover:text-[#dce2f8]'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center">
                <motion.span
                  animate={{ scale: isActive ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="material-symbols-outlined text-[20px] sm:text-[22px] transition-transform duration-200"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </motion.span>
              </div>

              <span
                className={`relative z-10 text-[10px] sm:text-[11px] tracking-tight sm:tracking-wide font-sans truncate max-w-full transition-all duration-200 ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

