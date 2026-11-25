import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';
import { useReadingMode } from '../context/ReadingModeContext';
import { MotionTooltip } from './MotionTooltip';

export type TabKey = 'accueil' | 'carte' | 'cursus' | 'jeux' | 'classement' | 'pratique' | 'dashboard' | 'profil';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const { isReadingMode } = useReadingMode();
  const shouldReduceMotion = useReducedMotion();

  const [tabTransitionSeq, setTabTransitionSeq] = useState(0);
  const prevTabRef = useRef<TabKey>(activeTab);

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      setTabTransitionSeq((seq) => seq + 1);
    }
  }, [activeTab]);

  const tabs: Array<{ key: TabKey; label: string; icon: string; tooltip: string }> = [
    {
      key: 'accueil',
      label: 'Accueil',
      icon: 'auto_stories',
      tooltip: "Vue d'ensemble, défi quotidien CECRL et accès rapide."
    },
    {
      key: 'carte',
      label: 'Plan 600',
      icon: 'map',
      tooltip: "Archipel 3D des 7 territoires & parcours cité 600 niveaux."
    },
    {
      key: 'cursus',
      label: 'Cursus',
      icon: 'school',
      tooltip: "200 leçons structurées de la 6e à la Terminale avec audio."
    },
    {
      key: 'jeux',
      label: 'Game',
      icon: 'sports_esports',
      tooltip: "20 mini-jeux lexicaux, duels et défis de grammaire."
    },
    {
      key: 'classement',
      label: 'Top XP',
      icon: 'leaderboard',
      tooltip: "Ligue d'Oxford hebdomadaire et groupes d'étude privés."
    },
    {
      key: 'pratique',
      label: 'Atelier',
      icon: 'menu_book',
      tooltip: "Studio d'élocution, dictées audio et flashcards SM-2."
    },
    {
      key: 'dashboard',
      label: 'Stats',
      icon: 'insights',
      tooltip: "Tableau de bord, courbes D3 et objectifs hebdomadaires."
    },
    {
      key: 'profil',
      label: 'Profil',
      icon: 'person',
      tooltip: "Compte, niveau CECRL, thèmes et paramètres d'étude."
    }
  ];

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeTab)
  );

  return (
    <motion.nav
      aria-label="Navigation principale"
      initial={shouldReduceMotion ? false : { y: 16 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
      className={`fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#0c1322]/88 backdrop-blur-xl border-t border-[#232a3a]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.6)] transition-opacity duration-300 ${
        isReadingMode
          ? 'opacity-15 hover:opacity-95 focus-within:opacity-100'
          : 'opacity-100'
      }`}
    >
      <div
        ref={navTrackRef}
        className="relative max-w-2xl mx-auto h-[68px] px-1.5 sm:px-3 flex items-center justify-between gap-0.5 sm:gap-1"
      >
        <GlassSlidingCapsule containerRef={navTrackRef} activeKey={activeTab} />

        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const isInitialMount = tabTransitionSeq === 0;
          const distanceFromActive = Math.abs(index - activeIndex);

          const itemInitial = shouldReduceMotion
            ? false
            : isInitialMount
            ? { opacity: 0, y: 10 }
            : isActive
            ? { opacity: 0, y: 10 }
            : { opacity: 0.55, y: 6 };

          const itemAnimate = {
            opacity: 1,
            y: isActive && !shouldReduceMotion ? -1 : 0,
          };

          const itemDelay = shouldReduceMotion
            ? 0
            : isInitialMount
            ? index * 0.022
            : isActive
            ? 0
            : Math.min(0.09, distanceFromActive * 0.016);

          return (
            <MotionTooltip
              key={tab.key}
              title={tab.label}
              content={tab.tooltip}
              placement="top"
              delayMs={240}
              wrapperClassName="relative z-10 flex-1 min-w-0 flex"
            >
              <button
                type="button"
                data-capsule-key={tab.key}
                onClick={() => onTabChange(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${tab.label} — ${tab.tooltip}`}
                className={`relative z-10 w-full flex flex-col items-center justify-center h-[50px] py-1 px-0.5 sm:px-1.5 rounded-full transition-colors duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                  isActive ? 'glass-capsule-active-text' : 'text-[#d0c5af]/75 hover:text-[#dce2f8]'
                }`}
              >
              <motion.div
                key={`${tab.key}-seq-${tabTransitionSeq}`}
                initial={itemInitial}
                animate={itemAnimate}
                transition={{
                  duration: shouldReduceMotion ? 0 : isActive ? 0.2 : 0.18,
                  delay: itemDelay,
                  ease: EASE_OUT_EXPO,
                }}
                className="relative z-10 flex flex-col items-center justify-center gap-0.5 w-full min-w-0"
              >
                <div className="relative z-10 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: isActive ? 1.12 : 1 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 400, damping: 20 }
                    }
                    className="material-symbols-outlined text-[20px] sm:text-[22px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {tab.icon}
                  </motion.span>
                </div>

                <motion.span
                  initial={
                    shouldReduceMotion || !isActive
                      ? false
                      : { opacity: 0, y: 4 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    delay: shouldReduceMotion || !isActive ? 0 : 0.035,
                    ease: EASE_OUT_EXPO,
                  }}
                  className={`relative z-10 text-[10px] sm:text-[11px] tracking-tight sm:tracking-wide font-sans truncate max-w-full ${
                    isActive ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {tab.label}
                </motion.span>
              </motion.div>
              </button>
            </MotionTooltip>
          );
        })}
      </div>
    </motion.nav>
  );
};

