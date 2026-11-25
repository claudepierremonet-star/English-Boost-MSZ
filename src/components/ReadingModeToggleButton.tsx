import React from 'react';
import { useReadingMode } from '../context/ReadingModeContext';
import { useAppTheme } from '../theme/ThemeContext';

interface ReadingModeToggleButtonProps {
  variant?: 'header' | 'toolbar' | 'modal';
  className?: string;
}

export const ReadingModeToggleButton: React.FC<ReadingModeToggleButtonProps> = ({
  variant = 'toolbar',
  className = ''
}) => {
  const { isReadingMode, toggleReadingMode } = useReadingMode();
  const { isDark } = useAppTheme();

  const label = isReadingMode ? 'Mode Lecture · Actif' : 'Mode Lecture';
  const compactLabel = 'Mode Lecture';

  const baseStyles =
    variant === 'header'
      ? 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]'
      : variant === 'modal'
      ? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]'
      : 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]';

  const stateStyles = isReadingMode
    ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] border-[#e0b73b] shadow-md shadow-[#f2ca50]/25 ring-2 ring-[#f2ca50]/35'
    : isDark
    ? 'bg-[#151b2b] hover:bg-[#232a3a] text-[#f2ca50] hover:text-[#ffe088] border-[#f2ca50]/40 hover:border-[#f2ca50]/75 shadow-sm'
    : 'bg-white hover:bg-[#f7f0e2] text-[#785b24] hover:text-[#4d3912] border-[#cbbd9f] hover:border-[#b48a28] shadow-sm';

  return (
    <button
      type="button"
      onClick={toggleReadingMode}
      aria-pressed={isReadingMode}
      aria-label={
        isReadingMode
          ? 'Désactiver le Mode Lecture pour restaurer la navigation et les cartes secondaires'
          : 'Activer le Mode Lecture pour réduire les distractions et vous concentrer sur la leçon active'
      }
      title={
        isReadingMode
          ? 'Mode Lecture activé — Cliquer pour réafficher la navigation et les cartes secondaires'
          : 'Activer le Mode Lecture (atténue la barre de navigation et les cartes secondaires)'
      }
      className={`${baseStyles} ${stateStyles} ${className}`}
    >
      <span
        className="material-symbols-outlined text-[16px] shrink-0"
        style={{ fontVariationSettings: isReadingMode ? "'FILL' 1" : "'FILL' 0" }}
      >
        {isReadingMode ? 'auto_stories' : 'menu_book'}
      </span>
      <span className={variant === 'header' ? 'hidden sm:inline' : ''}>
        {variant === 'header' ? compactLabel : label}
      </span>
    </button>
  );
};
