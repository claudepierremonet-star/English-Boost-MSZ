import React from 'react';
import { motion } from 'framer-motion';

export type TabKey = 'accueil' | 'cursus' | 'jeux' | 'classement' | 'pratique' | 'dashboard' | 'profil';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'accueil', label: 'Accueil', icon: 'auto_stories' },
    { key: 'cursus', label: 'Cursus', icon: 'school' },
    { key: 'jeux', label: 'Game', icon: 'sports_esports' },
    { key: 'classement', label: 'Top XP', icon: 'leaderboard' },
    { key: 'pratique', label: 'Atelier', icon: 'menu_book' },
    { key: 'dashboard', label: 'Stats', icon: 'insights' },
    { key: 'profil', label: 'Profil', icon: 'person' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#0c1322]/90 backdrop-blur-xl border-t border-[#232a3a]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-xl mx-auto h-16 px-1.5 sm:px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[42px] sm:min-w-[56px] min-h-[48px] py-1 px-1.5 sm:px-2 rounded-2xl transition-colors duration-200 cursor-pointer active:scale-95 ${
                isActive ? 'text-[#f2ca50]' : 'text-[#d0c5af]/70 hover:text-[#dce2f8]'
              }`}
            >
              {/* Bloc de mise en évidence aux coins arrondis glissant avec rebond ressort */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomNavHighlight"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 24,
                    mass: 0.8
                  }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#f2ca50]/25 via-[#f2ca50]/15 to-[#d4af37]/20 border border-[#f2ca50]/60 shadow-[0_0_18px_rgba(242,202,80,0.3)] pointer-events-none"
                  style={{ zIndex: 0 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <motion.span
                  animate={{ scale: isActive ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="material-symbols-outlined text-[23px] transition-transform duration-200"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </motion.span>
              </div>

              <span
                className={`relative z-10 text-[11px] tracking-wide font-sans transition-all duration-200 ${
                  isActive ? 'text-[#f2ca50] font-bold scale-105' : 'text-[#d0c5af]/80 font-medium'
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
