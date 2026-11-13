import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchoolLesson } from '../data/schoolCurriculum';

interface HeaderSessionTimerProps {
  activeLesson: SchoolLesson | null;
  studyMinutesToday: number;
  studyMinutesTarget: number;
  onUpdateStudyTarget: (minutes: number) => void;
  onAddStudyMinute: () => void;
}

const PRESET_TARGETS = [10, 15, 20, 30, 45, 60];

export const HeaderSessionTimer: React.FC<HeaderSessionTimerProps> = ({
  activeLesson,
  studyMinutesToday,
  studyMinutesTarget,
  onUpdateStudyTarget,
  onAddStudyMinute
}) => {
  const todayKey = `eb_session_elapsed_${new Date().toISOString().split('T')[0]}`;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(todayKey);
      const parsed = saved ? parseInt(saved, 10) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [draftTarget, setDraftTarget] = useState<number>(studyMinutesTarget || 30);
  const [targetSavedFeedback, setTargetSavedFeedback] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const onAddStudyMinuteRef = useRef(onAddStudyMinute);
  onAddStudyMinuteRef.current = onAddStudyMinute;

  const isSessionActive = Boolean(activeLesson);
  const isRunning = isSessionActive && !isPaused;

  // Keep draftTarget synced with external profile updates
  useEffect(() => {
    if (studyMinutesTarget > 0) {
      setDraftTarget(studyMinutesTarget);
    }
  }, [studyMinutesTarget]);

  // Reset manual pause when a new lesson starts
  const prevLessonIdRef = useRef<string | null>(activeLesson?.id || null);
  useEffect(() => {
    const currentId = activeLesson?.id || null;
    if (currentId && currentId !== prevLessonIdRef.current) {
      setIsPaused(false);
    }
    prevLessonIdRef.current = currentId;
  }, [activeLesson]);

  // Persist session elapsed seconds
  useEffect(() => {
    try {
      sessionStorage.setItem(todayKey, String(elapsedSeconds));
    } catch {
      // Ignore storage error
    }
  }, [elapsedSeconds, todayKey]);

  // Active 1s interval timer when a lesson is in progress
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 60 === 0) {
          onAddStudyMinuteRef.current();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Close popover on click outside or Escape
  useEffect(() => {
    if (!isPopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPopoverOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPopoverOpen]);

  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  const safeTarget = Math.max(5, studyMinutesTarget || 30);
  const progressRatio = Math.min(1, studyMinutesToday / safeTarget);
  const progressPercent = Math.round(progressRatio * 100);
  const isGoalReached = studyMinutesToday >= safeTarget;

  // SVG Ring Geometry
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressRatio);

  const handleApplyTarget = (newTarget: number) => {
    const clamped = Math.max(5, Math.min(180, newTarget));
    setDraftTarget(clamped);
    onUpdateStudyTarget(clamped);
    setTargetSavedFeedback(true);
    setTimeout(() => setTargetSavedFeedback(false), 1800);
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* HEADER TIMER TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer active:scale-95 ${
          isSessionActive
            ? isRunning
              ? 'bg-gradient-to-r from-[#1a253b] to-[#131d2f] border-[#f2ca50]/75 text-[#f2ca50] shadow-[0_0_16px_rgba(242,202,80,0.25)]'
              : 'bg-[#1a2234] border-amber-400/50 text-amber-300'
            : 'bg-[#151b2b]/90 hover:bg-[#1e263b] border-[#2b354b] hover:border-[#f2ca50]/45 text-[#d4c78f]'
        }`}
        title={
          isSessionActive
            ? `Session en cours (${activeLesson?.title}) — ${studyMinutesToday}/${safeTarget} min aujourd'hui. Cliquer pour configurer votre objectif.`
            : `Objectif d'étude quotidien : ${studyMinutesToday}/${safeTarget} min. Activez une leçon pour lancer le minuteur.`
        }
        aria-label="Minuteur de session et objectif d'étude quotidien"
        aria-expanded={isPopoverOpen}
      >
        {/* SVG Circular Progress Ring */}
        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2.4"
            />
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="none"
              stroke={isGoalReached ? '#34d399' : '#f2ca50'}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
            />
          </svg>
          <span
            className={`material-symbols-outlined text-[12px] absolute ${
              isGoalReached
                ? 'text-emerald-400'
                : isSessionActive
                ? 'text-[#f2ca50]'
                : 'text-[#d4c78f]'
            }`}
          >
            {isGoalReached ? 'check' : isSessionActive ? 'timer' : 'schedule'}
          </span>
          {isRunning && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c1322] animate-pulse" />
          )}
        </div>

        {/* Time Readout */}
        <div className="flex items-center gap-1.5 font-mono leading-none">
          {isSessionActive ? (
            <>
              <span className="text-[11px] font-extrabold tracking-tight text-[#f2ca50] tabular-nums">
                {formatDuration(elapsedSeconds)}
              </span>
              <span className="hidden md:inline text-[9px] text-[#94a3b8]">•</span>
              <span className="hidden md:inline text-[10px] font-bold text-[#dce2f8]">
                {studyMinutesToday}/{safeTarget}m
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold tabular-nums">
              {studyMinutesToday}/{safeTarget}m
            </span>
          )}
        </div>
      </button>

      {/* POPOVER PANEL: SESSION CONTROLS & DAILY TARGET CONFIGURATOR */}
      <AnimatePresence>
        {isPopoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-2.5 w-[310px] sm:w-[340px] rounded-2xl bg-[#0d1424]/98 backdrop-blur-xl border border-[#f2ca50]/45 shadow-[0_16px_50px_rgba(0,0,0,0.75)] p-4 flex flex-col gap-3.5 z-50 text-[#dce2f8]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#232a3a] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#192236] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-lg">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50]">
                    Minuteur de Session
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#dce2f8]">
                    Temps d&apos;Étude Quotidien
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPopoverOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#192236] text-[#94a3b8] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
                aria-label="Fermer le minuteur"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Active Lesson Stopwatch Box */}
            <div
              className={`p-3 rounded-xl border flex flex-col gap-2 ${
                isSessionActive
                  ? 'bg-[#151f33] border-[#f2ca50]/40'
                  : 'bg-[#131a29] border-[#232a3a]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isRunning
                        ? 'bg-emerald-400 animate-pulse'
                        : isSessionActive
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-mono font-bold uppercase text-[#d4c78f] truncate">
                    {isRunning
                      ? 'Leçon en cours'
                      : isSessionActive
                      ? 'Session en pause'
                      : 'En attente de leçon'}
                  </span>
                </div>

                <span className="font-mono font-black text-lg text-[#f2ca50] tabular-nums">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>

              {activeLesson ? (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#232a3a]/80">
                  <span className="text-xs text-[#dce2f8] font-medium truncate">
                    {activeLesson.class_level} • {activeLesson.title}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPaused((p) => !p)}
                      className="px-2 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isRunning ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{isRunning ? 'Pause' : 'Reprendre'}</span>
                    </button>
                    {elapsedSeconds > 0 && (
                      <button
                        type="button"
                        onClick={() => setElapsedSeconds(0)}
                        className="p-1 rounded-lg bg-[#192236] text-[#94a3b8] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Réinitialiser le chronomètre de session"
                      >
                        <span className="material-symbols-outlined text-xs">restart_alt</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-[#94a3b8] leading-snug">
                  Sélectionnez ou ouvrez une leçon dans le Cursus ou la Recherche pour activer automatiquement le minuteur.
                </p>
              )}
            </div>

            {/* Daily Target Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#d0c5af] font-medium">Progression du jour</span>
                <span className="font-mono font-bold text-[#f2ca50]">
                  {studyMinutesToday} / {safeTarget} min ({Math.min(100, progressPercent)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#151b2b] border border-[#232a3a] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalReached
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-300'
                      : 'bg-gradient-to-r from-[#d4af37] to-[#f2ca50]'
                  }`}
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              {isGoalReached && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Objectif d&apos;étude quotidien atteint !
                </span>
              )}
            </div>

            {/* Daily Target Customizer */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#232a3a]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-[#d4c78f]">
                  Définir l&apos;objectif cible
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTarget(draftTarget - 5)}
                    className="w-6 h-6 rounded-md bg-[#192236] border border-[#2b354b] text-[#f2ca50] hover:bg-[#232f48] font-bold text-xs flex items-center justify-center cursor-pointer"
                    aria-label="Diminuer de 5 minutes"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-[#f2ca50] min-w-[46px] text-center">
                    {draftTarget} min
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyTarget(draftTarget + 5)}
                    className="w-6 h-6 rounded-md bg-[#192236] border border-[#2b354b] text-[#f2ca50] hover:bg-[#232f48] font-bold text-xs flex items-center justify-center cursor-pointer"
                    aria-label="Augmenter de 5 minutes"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Preset chips */}
              <div className="grid grid-cols-6 gap-1">
                {PRESET_TARGETS.map((mins) => {
                  const isSelected = safeTarget === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleApplyTarget(mins)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-sm'
                          : 'bg-[#151b2b] text-[#d0c5af] border-[#232a3a] hover:border-[#f2ca50]/50 hover:text-[#f2ca50]'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>

              {/* Smooth Range Slider */}
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={draftTarget}
                onChange={(e) => handleApplyTarget(parseInt(e.target.value, 10))}
                className="w-full accent-[#f2ca50] cursor-pointer mt-1"
                aria-label="Curseur d'objectif d'étude quotidien en minutes"
              />

              {targetSavedFeedback && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 justify-end">
                  <span className="material-symbols-outlined text-xs">cloud_done</span>
                  Objectif enregistré ({safeTarget} min/jour)
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
