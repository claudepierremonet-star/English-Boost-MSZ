import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile, CEFRLevel, LeaderboardEntry, LeagueTier } from '../firebase/types';
import { fetchWeeklyLeaderboard, sendPeerCheer } from '../firebase/client';

interface LeaderboardViewProps {
  user: UserProfile;
  onNavigateToGames?: () => void;
  onNavigateToPractice?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  onNavigateToGames,
  onNavigateToPractice
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metricFilter, setMetricFilter] = useState<'weekly' | 'total'>('weekly');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');
  const [cheeredUids, setCheeredUids] = useState<Record<string, boolean>>({});
  const [recentCheerAnimation, setRecentCheerAnimation] = useState<string | null>(null);

  // Time remaining until Sunday 23:59:59 UTC
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate live countdown to Sunday midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate next Sunday 23:59:59 UTC
      const nextSunday = new Date(now);
      const dayOfWeek = now.getUTCDay(); // 0 is Sunday
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
      nextSunday.setUTCHours(23, 59, 59, 999);

      const diff = Math.max(0, nextSunday.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch leaderboard data
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await fetchWeeklyLeaderboard(user, metricFilter);
      setEntries(data);
    } catch (err) {
      console.error('Erreur chargement classement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [metricFilter, user.stats.weeklyXp, user.stats.totalXp]);

  // Handle cheer interaction
  const handleCheer = async (entry: LeaderboardEntry) => {
    if (cheeredUids[entry.uid]) return;
    setCheeredUids((prev) => ({ ...prev, [entry.uid]: true }));
    setRecentCheerAnimation(entry.uid);
    setTimeout(() => setRecentCheerAnimation(null), 1200);

    const newCount = await sendPeerCheer(entry.uid);
    setEntries((prev) =>
      prev.map((e) => (e.uid === entry.uid ? { ...e, cheerCount: newCount } : e))
    );
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (levelFilter === 'ALL') return entries;
    return entries.filter((e) => e.level === levelFilter);
  }, [entries, levelFilter]);

  // Find user's entry in current list
  const currentUserEntry = useMemo(() => {
    return entries.find((e) => e.isCurrentUser) || null;
  }, [entries]);

  // Find user's distance to next higher rank
  const gapToNextRank = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rank <= 1) return null;
    const higherPeer = entries.find((e) => e.rank === currentUserEntry.rank - 1);
    if (!higherPeer) return null;
    const diff = metricFilter === 'weekly'
      ? higherPeer.weeklyXp - currentUserEntry.weeklyXp
      : higherPeer.totalXp - currentUserEntry.totalXp;
    return {
      points: Math.max(10, diff + 10),
      peerName: higherPeer.displayName
    };
  }, [currentUserEntry, entries, metricFilter]);

  // Top 3 Podium
  const top1 = filteredEntries[0];
  const top2 = filteredEntries[1];
  const top3 = filteredEntries[2];
  const restList = filteredEntries.slice(3);

  return (
    <div className="space-y-6 pb-24 text-slate-100">
      {/* Editorial Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#141d33] to-[#0c1322] border border-[#f2ca50]/30 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <span className="material-symbols-outlined text-sm">emoji_events</span>
              Émulation & Excellence Académique
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#f3f4f6]">
              Classement <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#f2ca50] to-[#e6b834]">Hebdomadaire</span>
            </h1>
            <p className="text-sm text-[#cbd5e1] max-w-xl font-sans leading-relaxed">
              Défiez bienveillamment vos condisciples de l'Académie MSZ. Chaque succès en jeu ou en atelier rapporte des points d'expérience (+10 XP) pour gravir les échelons de la prestigieuse Ligue d'Oxford.
            </p>
          </div>

          {/* Weekly Countdown Box */}
          <div className="flex flex-col items-center sm:items-end shrink-0 bg-[#070b14]/80 backdrop-blur-md border border-[#232a3a] rounded-xl p-4 shadow-inner min-w-[240px]">
            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-mono uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[14px] text-[#f2ca50] animate-spin">timelapse</span>
              <span>Clôture hebdomadaire</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#111827] border border-[#f2ca50]/20 rounded-lg px-2.5 py-1.5">
                <span className="block font-mono font-black text-lg text-[#f2ca50] leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Jours</span>
              </div>
              <div className="bg-[#111827] border border-[#f2ca50]/20 rounded-lg px-2.5 py-1.5">
                <span className="block font-mono font-black text-lg text-[#f2ca50] leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Heures</span>
              </div>
              <div className="bg-[#111827] border border-[#f2ca50]/20 rounded-lg px-2.5 py-1.5">
                <span className="block font-mono font-black text-lg text-[#f2ca50] leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Min</span>
              </div>
              <div className="bg-[#111827] border border-[#f2ca50]/20 rounded-lg px-2.5 py-1.5">
                <span className="block font-mono font-black text-lg text-[#38bdf8] leading-none">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Sec</span>
              </div>
            </div>
            <span className="text-[10px] text-[#64748b] mt-2 italic">Remise à zéro équitable chaque dimanche à 23h59 UTC</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 pt-5 border-t border-[#232a3a]/80 flex flex-wrap items-center justify-between gap-4">
          {/* Metric Filter */}
          <div className="inline-flex rounded-xl bg-[#090e1a] p-1 border border-[#232a3a]">
            <button
              type="button"
              onClick={() => setMetricFilter('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                metricFilter === 'weekly'
                  ? 'bg-gradient-to-r from-[#f2ca50] to-[#e6b834] text-[#2c1d00] font-bold shadow-md'
                  : 'text-[#94a3b8] hover:text-[#f3f4f6]'
              }`}
            >
              Semaine en cours (Hebdo XP)
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter('total')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                metricFilter === 'total'
                  ? 'bg-gradient-to-r from-[#f2ca50] to-[#e6b834] text-[#2c1d00] font-bold shadow-md'
                  : 'text-[#94a3b8] hover:text-[#f3f4f6]'
              }`}
            >
              Général (Total XP)
            </button>
          </div>

          {/* Level Filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs text-[#64748b] mr-1 hidden sm:inline">Niveau :</span>
            {(['ALL', 'C2', 'C1', 'B2', 'B1'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  levelFilter === lvl
                    ? 'bg-[#38bdf8]/20 border border-[#38bdf8] text-[#7dd3fc]'
                    : 'bg-[#111827]/70 border border-[#1f293d] text-[#94a3b8] hover:text-white'
                }`}
              >
                {lvl === 'ALL' ? 'Tous' : lvl}
              </button>
            ))}
            <button
              type="button"
              onClick={loadLeaderboard}
              title="Rafraîchir les scores"
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1a2338] border border-[#232a3a] text-[#94a3b8] hover:text-[#f2ca50] ml-1 transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* User Current Standing Callout Banner */}
      {currentUserEntry && (
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#172554]/90 via-[#0f172a] to-[#1e1b4b]/80 border-2 border-[#f2ca50]/50 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#f2ca50] to-[#f59e0b] shadow-lg shadow-[#f2ca50]/20 flex items-center justify-center">
                  <img
                    src={currentUserEntry.photoURL || user.photoURL}
                    alt={currentUserEntry.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-[#f2ca50] text-[#1e1b4b] text-[10px] font-black font-mono shadow">
                  #{currentUserEntry.rank}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-[#f3f4f6]">
                    Votre Position Actuelle
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/40 text-[#f2ca50] text-[10px] font-mono font-bold uppercase">
                    {currentUserEntry.league}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Rang <strong className="text-[#f2ca50] font-mono font-bold">#{currentUserEntry.rank}</strong> •{' '}
                  <strong className="text-white font-mono">
                    {(metricFilter === 'weekly' ? currentUserEntry.weeklyXp : currentUserEntry.totalXp).toLocaleString()} XP
                  </strong>{' '}
                  • Série de <strong className="text-amber-400 font-mono">{currentUserEntry.streakDays} jours 🔥</strong>
                </p>
                {gapToNextRank && (
                  <p className="text-[11px] text-[#38bdf8] mt-1 flex items-center gap-1 font-sans">
                    <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                    Plus que <strong className="font-mono font-bold text-[#7dd3fc]">+{gapToNextRank.points} XP</strong> pour dépasser {gapToNextRank.peerName} !
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onNavigateToGames && (
                <button
                  type="button"
                  onClick={onNavigateToGames}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#e6b834] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#2c1d00] font-sans font-black text-xs uppercase tracking-wider shadow-lg shadow-[#f2ca50]/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">sports_esports</span>
                  <span>Jouer & Gagner (+10 XP)</span>
                </button>
              )}
              {onNavigateToPractice && (
                <button
                  type="button"
                  onClick={onNavigateToPractice}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-[#475569] text-white font-semibold text-xs transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                  <span className="hidden sm:inline">Atelier</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TOP 3 PODIUM */}
      {filteredEntries.length >= 3 && (
        <section className="bg-gradient-to-b from-[#0e1628] to-[#080d19] rounded-2xl border border-[#232a3a] p-6 shadow-xl">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-bold">
              ★ Podium d'Honneur ★
            </span>
            <h2 className="text-xl font-serif font-black text-white mt-1">
              Les Maîtres de la Semaine
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-6">
            {/* 2ND PLACE (SILVER) */}
            {top2 && (
              <div className="flex flex-col items-center order-1 group">
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 shadow-lg shadow-slate-400/20 flex items-center justify-center">
                    <img
                      src={top2.photoURL}
                      alt={top2.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-300 text-slate-900 font-mono font-black text-[10px] shadow">
                    🥈 #2
                  </span>
                  <span className="absolute -bottom-1 right-0 px-1 rounded bg-[#1e293b] border border-slate-400 text-slate-200 text-[9px] font-mono font-bold">
                    {top2.level}
                  </span>
                </div>

                <div className="text-center w-full">
                  <p className="text-xs sm:text-sm font-serif font-bold text-slate-200 truncate px-1">
                    {top2.displayName.replace(' (Vous)', '')}
                  </p>
                  <p className="text-xs font-mono font-black text-slate-300 mt-0.5">
                    {(metricFilter === 'weekly' ? top2.weeklyXp : top2.totalXp).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 hidden sm:block">
                    {top2.badgeLabel || 'Challenger'}
                  </p>
                </div>

                {/* Pedestal */}
                <div className="w-full h-24 sm:h-28 mt-3 rounded-t-xl bg-gradient-to-b from-slate-700/80 to-slate-900/90 border-t-2 border-slate-300 flex flex-col items-center justify-center p-2 shadow-inner">
                  <span className="text-xl sm:text-2xl font-serif font-black text-slate-200">2</span>
                  <button
                    type="button"
                    onClick={() => handleCheer(top2)}
                    className="mt-1 px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-500 text-[10px] text-slate-300 flex items-center gap-1 transition-all active:scale-95"
                    title="Envoyer des félicitations"
                  >
                    <span>👏</span>
                    <span className="font-mono">{top2.cheerCount || 0}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1ST PLACE (GOLD) */}
            {top1 && (
              <div className="flex flex-col items-center order-2 group -mt-6">
                <div className="relative mb-2">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <span className="text-2xl drop-shadow-[0_2px_8px_rgba(242,202,80,0.8)]">👑</span>
                  </div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-gradient-to-br from-[#ffe088] via-[#f2ca50] to-[#b8860b] shadow-xl shadow-[#f2ca50]/40 flex items-center justify-center ring-4 ring-[#f2ca50]/30">
                    <img
                      src={top1.photoURL}
                      alt={top1.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ffe088] to-[#f2ca50] text-[#2c1d00] font-mono font-black text-[11px] shadow-lg">
                    🥇 #1
                  </span>
                  <span className="absolute -bottom-1 right-0 px-1.5 rounded bg-[#111827] border border-[#f2ca50] text-[#f2ca50] text-[10px] font-mono font-bold shadow">
                    {top1.level}
                  </span>
                </div>

                <div className="text-center w-full">
                  <p className="text-xs sm:text-base font-serif font-black text-[#ffe088] truncate px-1">
                    {top1.displayName.replace(' (Vous)', '')}
                  </p>
                  <p className="text-sm font-mono font-black text-[#f2ca50] mt-0.5">
                    {(metricFilter === 'weekly' ? top1.weeklyXp : top1.totalXp).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-amber-200/80 font-sans mt-0.5 font-semibold">
                    {top1.badgeLabel || 'Oxford Fellow'}
                  </p>
                </div>

                {/* Pedestal */}
                <div className="w-full h-32 sm:h-36 mt-3 rounded-t-xl bg-gradient-to-b from-[#b45309]/80 via-[#78350f]/80 to-[#1e1b4b] border-t-2 border-[#f2ca50] flex flex-col items-center justify-center p-2 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#f2ca50]/5" />
                  <span className="text-2xl sm:text-3xl font-serif font-black text-[#f2ca50]">1</span>
                  <button
                    type="button"
                    onClick={() => handleCheer(top1)}
                    className="relative z-10 mt-1.5 px-2.5 py-1 rounded-full bg-[#3c2f00]/90 hover:bg-[#4d3c00] border border-[#f2ca50]/60 text-xs text-[#ffe088] flex items-center gap-1.5 transition-all active:scale-95 shadow"
                    title="Envoyer des félicitations"
                  >
                    <span>🎉</span>
                    <span className="font-mono font-bold">{top1.cheerCount || 0}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3RD PLACE (BRONZE) */}
            {top3 && (
              <div className="flex flex-col items-center order-3 group">
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 shadow-lg shadow-amber-700/20 flex items-center justify-center">
                    <img
                      src={top3.photoURL}
                      alt={top3.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 font-mono font-black text-[10px] shadow">
                    🥉 #3
                  </span>
                  <span className="absolute -bottom-1 right-0 px-1 rounded bg-[#1e293b] border border-amber-600 text-amber-300 text-[9px] font-mono font-bold">
                    {top3.level}
                  </span>
                </div>

                <div className="text-center w-full">
                  <p className="text-xs sm:text-sm font-serif font-bold text-amber-200 truncate px-1">
                    {top3.displayName.replace(' (Vous)', '')}
                  </p>
                  <p className="text-xs font-mono font-black text-amber-300 mt-0.5">
                    {(metricFilter === 'weekly' ? top3.weeklyXp : top3.totalXp).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-amber-400/80 font-sans mt-0.5 hidden sm:block">
                    {top3.badgeLabel || 'Challenger'}
                  </p>
                </div>

                {/* Pedestal */}
                <div className="w-full h-20 sm:h-24 mt-3 rounded-t-xl bg-gradient-to-b from-amber-900/70 to-slate-900/90 border-t-2 border-amber-600 flex flex-col items-center justify-center p-2 shadow-inner">
                  <span className="text-xl sm:text-2xl font-serif font-black text-amber-400">3</span>
                  <button
                    type="button"
                    onClick={() => handleCheer(top3)}
                    className="mt-1 px-2 py-0.5 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-[10px] text-amber-200 flex items-center gap-1 transition-all active:scale-95"
                    title="Envoyer des félicitations"
                  >
                    <span>👏</span>
                    <span className="font-mono">{top3.cheerCount || 0}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FULL RANKINGS TABLE */}
      <section className="bg-[#0b1120] rounded-2xl border border-[#232a3a] overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-[#232a3a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f2ca50]">format_list_numbered</span>
            <h3 className="font-serif font-bold text-base text-white">
              Classement Général des Apprenants
            </h3>
          </div>
          <span className="text-xs font-mono text-[#94a3b8]">
            {filteredEntries.length} érudit(s) classé(s)
          </span>
        </div>

        <div className="divide-y divide-[#1e293b]/60">
          {filteredEntries.map((entry) => {
            const isMe = entry.isCurrentUser;
            const pointsVal = metricFilter === 'weekly' ? entry.weeklyXp : entry.totalXp;

            return (
              <div
                key={entry.uid}
                className={`flex items-center justify-between p-3.5 sm:p-4 transition-all ${
                  isMe
                    ? 'bg-[#1e293b]/80 border-l-4 border-l-[#f2ca50] shadow-md'
                    : 'hover:bg-[#111c33]/50'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-8 text-center shrink-0">
                    {entry.rank === 1 ? (
                      <span className="text-lg">🥇</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className={`font-mono font-bold text-sm ${isMe ? 'text-[#f2ca50]' : 'text-[#64748b]'}`}>
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  <div className="relative shrink-0">
                    <img
                      src={entry.photoURL || user.photoURL}
                      alt={entry.displayName}
                      className={`w-10 h-10 rounded-full object-cover ring-2 ${
                        isMe ? 'ring-[#f2ca50]' : 'ring-[#334155]'
                      }`}
                    />
                    <span className="absolute -bottom-1 -right-1 px-1 rounded bg-[#0b1120] border border-[#334155] text-[9px] font-mono font-bold text-[#cbd5e1]">
                      {entry.level}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-serif text-sm font-bold truncate ${
                          isMe ? 'text-[#ffe088]' : 'text-slate-200'
                        }`}
                      >
                        {entry.displayName}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/20 text-[#f2ca50] text-[9px] font-mono font-bold uppercase">
                          Vous
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] mt-0.5">
                      <span className="hidden sm:inline font-sans">{entry.league}</span>
                      <span className="hidden sm:inline text-slate-600">•</span>
                      <span className="font-mono text-amber-400/90">{entry.streakDays}j 🔥</span>
                      {entry.badgeLabel && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] text-[#94a3b8] italic truncate">
                            {entry.badgeLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: XP & Cheers */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`block font-mono font-black text-sm sm:text-base ${
                        isMe ? 'text-[#f2ca50]' : 'text-white'
                      }`}
                    >
                      {pointsVal.toLocaleString()} <span className="text-xs font-normal text-[#94a3b8]">XP</span>
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono">
                      {metricFilter === 'weekly' ? 'cette semaine' : 'au total'}
                    </span>
                  </div>

                  {/* Encouraging Cheer Button */}
                  <button
                    type="button"
                    onClick={() => handleCheer(entry)}
                    disabled={cheeredUids[entry.uid]}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                      cheeredUids[entry.uid]
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-[#1e293b] hover:bg-[#2e3e57] border border-[#334155] text-[#cbd5e1]'
                    }`}
                    title="Encourager / Féliciter ce condisciple"
                  >
                    <span>{cheeredUids[entry.uid] ? '✨' : '👏'}</span>
                    <span className="font-mono text-[11px]">{entry.cheerCount || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HEALTHY COMPETITION CHARTER & RULES */}
      <section className="rounded-xl bg-[#0e1628]/80 border border-[#232a3a] p-5 text-xs text-[#94a3b8] space-y-3">
        <div className="flex items-center gap-2 text-[#f2ca50] font-serif font-bold text-sm">
          <span className="material-symbols-outlined text-base">verified</span>
          Charte de la Saine Compétition Académique
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#070b14] border border-[#1e293b]">
            <p className="font-semibold text-white mb-1">🎯 Barème Transparent</p>
            <p>
              Chaque défi de jeu ou exercice réussi vous octroie <strong className="text-emerald-400">+10 XP</strong>. Une réponse incorrecte déduit <strong className="text-rose-400">-5 XP</strong>, valorisant la rigueur et la réflexion.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#070b14] border border-[#1e293b]">
            <p className="font-semibold text-white mb-1">⏳ Égalité des Chances</p>
            <p>
              Les compteurs hebdomadaires sont remis à zéro chaque dimanche à 23h59 UTC, permettant à chaque apprenant, débutant comme érudit, de conquérir le podium.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#070b14] border border-[#1e293b]">
            <p className="font-semibold text-white mb-1">🤝 Noblesse & Bienveillance</p>
            <p>
              Les encouragements (kudos) stimulent l'assiduité collective. Le but ultime reste la maîtrise élégante et fluide de la langue de Shakespeare.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
