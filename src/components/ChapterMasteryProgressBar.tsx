import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CityMapProgressionState } from '../firebase/types';
import { getCityMapProgression } from '../utils/cityMapManager';
import { getCityLevelByNumber, getDistrictForLevel, MAX_CITY_LEVEL } from '../data/cityMapData';

interface ChapterMasteryProgressBarProps {
  /** Optionnel : forcer l'affichage d'un niveau spécifique (sinon utilise le niveau actuel débloqué) */
  levelNumber?: number;
  /** Optionnel : passer l'état de progression déjà chargé */
  progression?: CityMapProgressionState;
  /** Variante compacte pour les en-têtes étroits */
  compact?: boolean;
}

export const ChapterMasteryProgressBar: React.FC<ChapterMasteryProgressBarProps> = ({
  levelNumber,
  progression: externalProgression,
  compact = false
}) => {
  const [localProgression, setLocalProgression] = useState<CityMapProgressionState>(() =>
    externalProgression ?? getCityMapProgression()
  );

  useEffect(() => {
    if (externalProgression) {
      setLocalProgression(externalProgression);
    }
  }, [externalProgression]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent<CityMapProgressionState>;
      if (ce.detail) {
        setLocalProgression(ce.detail);
      } else {
        setLocalProgression(getCityMapProgression());
      }
    };
    window.addEventListener('eb_city_map_updated', handleUpdate);
    return () => window.removeEventListener('eb_city_map_updated', handleUpdate);
  }, []);

  const targetLevel = Math.max(
    1,
    Math.min(MAX_CITY_LEVEL, levelNumber ?? localProgression.unlockedLevel ?? 1)
  );
  const completedChapters = localProgression.completedChaptersByLevel[String(targetLevel)] || [];
  const completedCount = Math.min(10, completedChapters.length);
  const masteryPercent = Math.round((completedCount / 10) * 100);
  const isConquered =
    completedCount >= 10 || localProgression.conqueredLevels.includes(targetLevel);

  const levelMeta = getCityLevelByNumber(targetLevel);
  const district = getDistrictForLevel(targetLevel);

  const masteryRankLabel =
    completedCount === 10
      ? 'Niveau Conquis'
      : completedCount >= 7
      ? 'Maîtrise Avancée'
      : completedCount >= 4
      ? 'En Progression'
      : completedCount >= 1
      ? 'Initiation Active'
      : 'Prêt à conquérir';

  if (compact) {
    return (
      <div
        className="flex flex-col gap-1 min-w-[140px] sm:min-w-[210px]"
        title={`Maîtrise du Niveau ${targetLevel} (${district.classLabel}) : ${completedCount}/10 chapitres validés`}
      >
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
          <span className="text-[#d4c78f] font-bold uppercase tracking-wider truncate">
            Chapitres · Niv.{String(targetLevel).padStart(2, '0')}
          </span>
          <span className="text-[#f2ca50] font-black shrink-0">
            {completedCount}/10 ({masteryPercent}%)
          </span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-[#070e1d] border border-[#4d4635]/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${masteryPercent}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className={`h-full rounded-full relative overflow-hidden ${
              isConquered
                ? 'bg-gradient-to-r from-emerald-500 via-[#34d399] to-[#f2ca50]'
                : 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe088]'
            }`}
          >
            {masteryPercent > 0 && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '220%' }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 1.4 }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              />
            )}
          </motion.div>

          {/* 10 Chapter Segment Ticks */}
          <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className={idx < 9 ? 'border-r border-[#0c1322]/60 h-full' : 'h-full'}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-3.5 py-2.5 rounded-xl bg-[#0c1322]/90 border border-[#f2ca50]/30 shadow-inner flex flex-col gap-2"
      title={`Progression sur les 10 chapitres du Niveau ${targetLevel} (${levelMeta.landmarkTitle})`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`material-symbols-outlined text-base shrink-0 ${
              isConquered ? 'text-emerald-400' : 'text-[#f2ca50]'
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isConquered ? 'verified' : 'location_city'}
          </span>
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
              Niveau Actuel {String(targetLevel).padStart(2, '0')}/{MAX_CITY_LEVEL} · {district.classLabel}
            </span>
            <span className="hidden md:inline text-[11px] text-[#99907c] truncate">
              — {levelMeta.landmarkTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              isConquered
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                : 'bg-[#232a3a] border-[#4d4635]/50 text-[#d4c78f]'
            }`}
          >
            {masteryRankLabel}
          </span>
          <span className="text-xs font-mono font-black text-[#f2ca50]">
            {completedCount}/10 chapitres ({masteryPercent}%)
          </span>
        </div>
      </div>

      {/* Animated Progress Bar Track with 10-Chapter Segments */}
      <div className="relative h-2.5 w-full rounded-full bg-[#070e1d] border border-[#232a3a] overflow-hidden p-0.5">
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${masteryPercent}%` }}
            transition={{ type: 'spring', stiffness: 110, damping: 18 }}
            className={`h-full rounded-full relative overflow-hidden shadow-[0_0_12px_rgba(242,202,80,0.45)] ${
              isConquered
                ? 'bg-gradient-to-r from-emerald-500 via-[#34d399] to-[#f2ca50]'
                : 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe088]'
            }`}
          >
            {masteryPercent > 0 && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '240%' }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 1.6 }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            )}
          </motion.div>

          {/* 10 Chapter Segment Dividers */}
          <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
            {Array.from({ length: 10 }).map((_, idx) => {
              const chNum = idx + 1;
              const isDone = completedChapters.includes(chNum);
              return (
                <div
                  key={chNum}
                  className={`h-full transition-colors ${
                    idx < 9 ? 'border-r border-[#0c1322]/75' : ''
                  } ${isDone ? 'bg-transparent' : 'bg-transparent'}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
