import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface XpToastInfo {
  id: string;
  delta: number;
  message?: string;
  currentLevel: number;
  progressPercent: number;
}

interface XpGainToastProps {
  toast: XpToastInfo | null;
  onDismiss: () => void;
}

export const XpGainToast: React.FC<XpGainToastProps> = ({ toast, onDismiss }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -25, scale: 0.9 }}
          transition={{ type: 'spring', damping: 18, stiffness: 350 }}
          className="fixed top-20 right-4 sm:right-8 z-50 pointer-events-auto"
          onClick={onDismiss}
        >
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl cursor-pointer ${
              toast.delta >= 0
                ? 'bg-[#101b2f]/95 border-[#f2ca50]/70 text-[#dce2f8] shadow-[0_4px_25px_rgba(242,202,80,0.3)]'
                : 'bg-[#261014]/95 border-rose-500/70 text-rose-200 shadow-[0_4px_25px_rgba(244,63,94,0.3)]'
            }`}
          >
            {/* Animated Icon Badge */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                toast.delta >= 0
                  ? 'bg-gradient-to-br from-[#ffe599] via-[#f2ca50] to-[#b4830c] text-[#2c1d00]'
                  : 'bg-gradient-to-br from-rose-400 to-rose-700 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {toast.delta >= 0 ? 'military_tech' : 'trending_down'}
              </span>
            </motion.div>

            {/* Content */}
            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-extrabold text-sm ${
                    toast.delta >= 0 ? 'text-[#f2ca50]' : 'text-rose-400'
                  }`}
                >
                  {toast.delta >= 0 ? `+${toast.delta} XP` : `${toast.delta} XP`}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                  Niveau {toast.currentLevel}
                </span>
              </div>
              <p className="text-xs text-[#dce2f8]/90 font-medium">
                {toast.message || (toast.delta >= 0 ? 'Défi accompli avec succès !' : 'Pénalité de points')}
              </p>
            </div>

            {/* Sparkle or close indicator */}
            <span className="text-xs text-[#99907c] hover:text-white transition-colors ml-1">✕</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
