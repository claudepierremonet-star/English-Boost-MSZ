import React, { useMemo } from 'react';

interface SevenDayStreakSectionProps {
  streakDays?: number;
  studyMinutesToday?: number;
  studyMinutesTarget?: number;
  onNavigateToCurriculum?: () => void;
}

interface DayStreakInfo {
  dateKey: string;
  dayLabel: string;
  dayNumber: number;
  isCompleted: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  lessonsCount: number;
  xpEarned: number;
  minutes: number;
}

export const SevenDayStreakSection: React.FC<SevenDayStreakSectionProps> = ({
  streakDays = 24,
  studyMinutesToday = 25,
  studyMinutesTarget = 30,
  onNavigateToCurriculum
}) => {
  // Generate the 7 days of the current week (Monday to Sunday)
  const { weekDays, completedCountThisWeek } = useMemo(() => {
    const now = new Date();
    // Monday as start of week (0: Sun, 1: Mon, ... 6: Sat)
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMonday = (currentDayOfWeek + 6) % 7; // Monday = 0, Tuesday = 1, ... Sunday = 6

    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const days: DayStreakInfo[] = [];
    let completedInWeek = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isFuture = d > new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Check if day is completed:
      // If past and within current active streak, it was successfully completed
      // If today, check if studyMinutesToday meets or approaches target, or user has streak
      let isCompleted = false;
      let lessonsCount = 0;
      let xpEarned = 0;
      let minutes = 0;

      if (isPast) {
        // Calculate difference in days from today
        const diffDays = Math.floor(
          (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - d.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (diffDays <= streakDays) {
          isCompleted = true;
          completedInWeek++;
          lessonsCount = 2 + (d.getDate() % 2); // 2 or 3 lessons
          minutes = 25 + (d.getDate() % 3) * 5;
          xpEarned = lessonsCount * 120 + 50;
        }
      } else if (isToday) {
        // Considered completed if streak is active and user studied
        isCompleted = studyMinutesToday >= (studyMinutesTarget * 0.7);
        if (isCompleted) {
          completedInWeek++;
          lessonsCount = Math.max(1, Math.round(studyMinutesToday / 15));
          minutes = studyMinutesToday;
          xpEarned = lessonsCount * 120;
        } else {
          lessonsCount = 1;
          minutes = studyMinutesToday;
          xpEarned = 60;
        }
      }

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');

      days.push({
        dateKey: `${yyyy}-${mm}-${dd}`,
        dayLabel: dayNames[i],
        dayNumber: d.getDate(),
        isCompleted,
        isToday,
        isPast,
        isFuture,
        lessonsCount,
        xpEarned,
        minutes
      });
    }

    return { weekDays: days, completedCountThisWeek: completedInWeek };
  }, [streakDays, studyMinutesToday, studyMinutesTarget]);

  return (
    <section className="px-4 sm:px-6 py-2 animate-fadeIn" aria-label="Section Streak 7 jours">
      <div className="rounded-2xl bg-gradient-to-br from-[#161d2d] via-[#101726] to-[#0c121e] p-5 sm:p-6 shadow-2xl relative overflow-hidden border border-[#d4af37]/35 backdrop-blur-md">
        {/* Subtle Ambient Gold Radial Lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd700]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            {/* Master Flame Badge with Glow */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffd700]/25 via-[#f59e0b]/15 to-[#d97706]/10 border border-[#ffd700]/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)] shrink-0">
              <span
                className="material-symbols-outlined text-2xl text-[#ffd700] animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#ffd700]">
                  Série Active • Rythme Hebdomadaire
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] text-[9px] font-mono font-bold">
                  7 Jours
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Streak 7 Jours
                <span className="text-xs font-mono font-black text-[#ffd700] bg-[#ffd700]/15 px-2 py-0.5 rounded-full border border-[#ffd700]/30 shadow-sm">
                  {streakDays} Jours Consécutifs 🔥
                </span>
              </h3>
            </div>
          </div>

          {/* Weekly Goal Progress Pill */}
          <div className="flex items-center gap-2.5 bg-[#080e1a]/90 border border-[#2b3952] px-3.5 py-2 rounded-xl shadow-inner self-start sm:self-auto">
            <span
              className="material-symbols-outlined text-lg text-[#ffd700]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              military_tech
            </span>
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                <span className="text-[#94a3b8]">Objectif Semaine :</span>
                <span className="text-[#ffd700] font-bold">
                  {completedCountThisWeek}/7 jours complétés
                </span>
              </div>
              {/* Progress Micro-Bar */}
              <div className="w-28 sm:w-32 h-1.5 rounded-full bg-[#1e293b] overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-[#38bdf8] via-[#eab308] to-[#ffd700] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.round((completedCountThisWeek / 7) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Calendar Icons Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3.5 relative z-10 mb-4">
          {weekDays.map((day, idx) => {
            return (
              <div
                key={day.dateKey}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all duration-300 group ${
                  day.isCompleted
                    ? 'bg-gradient-to-b from-[#211a08]/90 via-[#181409]/90 to-[#0c121e]/90 border-[#d4af37]/60 shadow-[0_4px_16px_rgba(212,175,55,0.2),inset_0_1px_1px_rgba(255,255,255,0.12)] hover:border-[#ffd700] hover:scale-105'
                    : day.isToday
                    ? 'bg-gradient-to-b from-[#132238]/90 to-[#0c1424]/90 border-[#38bdf8]/70 shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:border-[#38bdf8] hover:scale-105'
                    : 'bg-[#0a101d]/70 border-[#222d42]/60 hover:border-[#3b4b66]'
                }`}
                title={`${day.dayLabel} ${day.dayNumber} : ${
                  day.isCompleted
                    ? `${day.lessonsCount} leçons validées • ${day.xpEarned} XP gagnés`
                    : day.isToday
                    ? "En cours aujourd'hui"
                    : 'Leçon à venir'
                }`}
              >
                {/* Day Header Label */}
                <span
                  className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold mb-1 ${
                    day.isCompleted
                      ? 'text-[#f6de8c]'
                      : day.isToday
                      ? 'text-[#38bdf8]'
                      : 'text-[#64748b]'
                  }`}
                >
                  {day.dayLabel}
                </span>

                {/* Day Number */}
                <span
                  className={`text-xs sm:text-sm font-mono font-black mb-2 ${
                    day.isCompleted
                      ? 'text-white'
                      : day.isToday
                      ? 'text-white'
                      : 'text-[#64748b]'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Calendar Icon (Filled with Checkmark when completed - with Fading-in & Scale-up Animation) */}
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 my-0.5">
                  {day.isCompleted ? (
                    <div
                      className="relative flex items-center justify-center w-full h-full animate-calendar-pop"
                      style={{ animationDelay: `${idx * 75}ms` }}
                    >
                      {/* Ambient Golden Glow Behind Filled Icon */}
                      <div className="absolute inset-0 rounded-full bg-[#ffd700]/25 blur-sm pointer-events-none" />
                      {/* Filled Calendar Icon */}
                      <span
                        className="material-symbols-outlined text-2xl sm:text-3xl text-[#ffd700] relative z-10 transition-transform group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(255,215,0,0.55)]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        event_available
                      </span>
                    </div>
                  ) : day.isToday ? (
                    <>
                      {/* Pulsating Ring for Today */}
                      <span className="absolute -inset-1 rounded-full border border-[#38bdf8]/50 animate-ping opacity-50 pointer-events-none" />
                      <span
                        className="material-symbols-outlined text-2xl sm:text-3xl text-[#38bdf8] relative z-10 transition-transform group-hover:scale-110"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        today
                      </span>
                    </>
                  ) : (
                    /* Future Muted Calendar Icon */
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl text-[#475569] transition-colors group-hover:text-[#64748b]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      calendar_today
                    </span>
                  )}
                </div>

                {/* Status Indicator Micro-Badge */}
                <div className="mt-2 text-center w-full">
                  {day.isCompleted ? (
                    <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-mono font-bold text-[#ffd700] bg-[#ffd700]/15 px-1 sm:px-1.5 py-0.5 rounded-full border border-[#ffd700]/30 leading-none">
                      <span
                        className="material-symbols-outlined text-[9px] text-[#ffd700]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                      <span className="hidden sm:inline">Validé</span>
                    </span>
                  ) : day.isToday ? (
                    <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/15 px-1 sm:px-1.5 py-0.5 rounded-full border border-[#38bdf8]/30 leading-none animate-pulse">
                      <span>En cours</span>
                    </span>
                  ) : (
                    <span className="text-[8px] sm:text-[9px] font-mono text-[#475569] block leading-none">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Gamification Banner */}
        <div className="pt-3 border-t border-[#232f45] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 text-[#94a3b8] text-center sm:text-left">
            <span
              className="material-symbols-outlined text-sm text-[#38bdf8]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              ac_unit
            </span>
            <span className="text-[11px] font-mono">
              Protection de Série : <strong className="text-white">1 Glaçon Actif</strong> • Multiplicateur de MSZ Coins <strong className="text-[#ffd700]">x1.5</strong>
            </span>
          </div>

          {onNavigateToCurriculum && (
            <button
              type="button"
              onClick={onNavigateToCurriculum}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#d97706] text-[#0c1322] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,215,0,0.3)] hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_circle
              </span>
              <span>Continuer mes leçons</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
