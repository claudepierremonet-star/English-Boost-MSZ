import React from 'react';

export type TabKey = 'accueil' | 'cursus' | 'pratique' | 'dashboard' | 'profil';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'accueil', label: 'Accueil', icon: 'auto_stories' },
    { key: 'cursus', label: 'Cursus 6e-Tle', icon: 'school' },
    { key: 'pratique', label: 'Atelier', icon: 'menu_book' },
    { key: 'dashboard', label: 'Dashboard', icon: 'insights' },
    { key: 'profil', label: 'Profil', icon: 'person' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#0c1322]/90 backdrop-blur-xl border-t border-[#232a3a]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#f2ca50] font-semibold'
                  : 'text-[#d0c5af]/70 hover:text-[#dce2f8]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[23px] transition-transform duration-200"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#f2ca50] shadow-[0_0_6px_#f2ca50]" />
                )}
              </div>
              <span className="text-[11px] tracking-wide font-sans">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
