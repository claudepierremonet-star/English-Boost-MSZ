import React from 'react';
import { motion } from 'framer-motion';
import type { SchoolLesson } from '../data/schoolCurriculum';
import { useReadingMode } from '../context/ReadingModeContext';

interface FloatingSpeakingStudioShortcutProps {
  activeLesson: SchoolLesson;
  onOpenSpeakingStudio: () => void;
  onDismiss: () => void;
}

export const FloatingSpeakingStudioShortcut: React.FC<FloatingSpeakingStudioShortcutProps> = ({
  activeLesson,
  onOpenSpeakingStudio,
  onDismiss
}) => {
  const { isReadingMode } = useReadingMode();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.55, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.7,
        y: 24,
        transition: { duration: 0.16, ease: 'easeIn' }
      }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 16,
        mass: 0.85
      }}
      className={`fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 select-none transition-opacity duration-300 ${
        isReadingMode ? 'opacity-15 hover:opacity-95 focus-within:opacity-100' : 'opacity-100'
      }`}
      role="region"
      aria-label="Raccourci Studio d'Élocution pour la leçon active"
    >
      <div className="relative flex items-center group">
        {/* Golden ambient ping halo (suppressed in Reading Mode) */}
        {!isReadingMode && (
          <span className="absolute -inset-1 rounded-full bg-[#f2ca50]/25 animate-ping pointer-events-none" />
        )}

        {/* Main Floating Action Pill */}
        <motion.button
          type="button"
          onClick={onOpenSpeakingStudio}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
          className="relative flex items-center gap-3 p-1.5 pr-4 rounded-full bg-gradient-to-r from-[#1a2336] via-[#121927] to-[#1e293b] border-2 border-[#f2ca50] shadow-[0_10px_35px_rgba(242,202,80,0.4)] hover:shadow-[0_12px_45px_rgba(242,202,80,0.6)] hover:border-[#ffe088] transition-colors cursor-pointer text-left"
          title={`Ouvrir le Studio d'Élocution pour la leçon : ${activeLesson.title}`}
        >
          {/* Animated Glowing Microphone Icon Circle */}
          <motion.div
            initial={{ scale: 0.4, rotate: -14 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 14, delay: 0.05 }}
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#ffe088] via-[#f2ca50] to-[#cca639] flex items-center justify-center text-[#3c2f00] shadow-md shrink-0"
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              record_voice_over
            </span>
            {/* Live acoustic dot indicator */}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121927]" />
          </motion.div>

          {/* Text Information Stack */}
          <div className="flex flex-col min-w-0 max-w-[170px] sm:max-w-[230px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                Studio d&apos;Élocution
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/20 text-[#f2ca50] text-[9px] font-mono font-bold uppercase">
                {activeLesson.class_level}
              </span>
            </div>

            <span className="font-serif font-bold text-xs sm:text-sm text-[#f3f4f6] truncate leading-tight">
              {activeLesson.title}
            </span>

            <span className="text-[10px] text-[#94a3b8] font-mono truncate flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-pulse" />
              <span>Pratiquer la prononciation</span>
            </span>
          </div>

          {/* Forward arrow CTA */}
          <div className="w-7 h-7 rounded-full bg-[#232a3a] border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] group-hover:bg-[#f2ca50] group-hover:text-[#3c2f00] transition-colors shrink-0 ml-1">
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </div>
        </motion.button>

        {/* Dismiss / Unselect button (small top-right badge) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#1e293b] border border-[#f2ca50]/60 hover:border-rose-400 text-[#cbd5e1] hover:text-white hover:bg-rose-900/80 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors"
          title="Désélectionner la leçon active"
          aria-label="Fermer le raccourci"
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  );
};
