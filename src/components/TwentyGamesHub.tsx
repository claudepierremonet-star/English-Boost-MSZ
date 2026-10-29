import React, { useState, useEffect, useRef } from 'react';
import {
  TWENTY_GAMES_METADATA,
  MiniGameMeta,
  SpeedMatchLevelKey,
  SPEED_MATCH_LEVELS,
  generateSpeedMatchQuestions,
  SpeedMatchPair,
  SPEED_MATCH_ROUNDS,
  WORD_SCRAMBLE_ITEMS,
  WORD_SEARCH_PUZZLE,
  VERB_MASTER_ITEMS,
  HANGMAN_WORDS,
  SENTENCE_BUILDER_ITEMS,
  AUDIO_BLITZ_ITEMS,
  ANTONYM_SYNONYM_ITEMS,
  ODD_ONE_OUT_ITEMS,
  FILL_THE_BLANK_ITEMS,
  TRUE_OR_FALSE_ITEMS,
  MEMORY_PAIRS_DATA,
  BEAT_THE_CLOCK_WORDS,
  WORD_SNAKE_CHAINS,
  RIDDLE_ITEMS,
  TONE_DETECTOR_ITEMS,
  UK_VS_US_ITEMS,
  IDIOM_HUNTER_ITEMS,
  SPELLING_BEE_ITEMS,
  BOSS_BATTLE_ROUNDS,
  ArcadeProgressionState,
  getStoredArcadeProgression,
  saveStoredArcadeProgression,
  hydrateArcadeProgressionFromStorage,
  saveActiveGameSession,
  getStoredActiveGameSession,
  clearStoredActiveGameSession,
  calculatePlayerLevel,
  ARCADE_DIFFICULTY_TIERS,
  ArcadeDifficultyTierKey,
  WordScrambleLevelKey,
  WORD_SCRAMBLE_LEVELS,
  generateWordScrambleQuestions,
  WordScrambleQuestion,
  WordScrambleWord,
  scrambleLetters,
  SPEED_MATH_PROBLEMS,
  MentalMathProblem
} from '../data/twentyGamesData';

interface TwentyGamesHubProps {
  onXpEarned?: (xp: number) => void;
  onPointsDeducted?: (pts: number) => void;
  onClose?: () => void;
}

// Synthétiseur audio Web Audio API pour des effets sonores immersifs 100% hors-ligne
class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed before user gesture
    }
  }

  playCorrect() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.2);
      });
    } catch {}
  }

  playWrong() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  playWin() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.35);
      });
    } catch {}
  }
}

const sfx = new SoundEffects();

export const TwentyGamesHub: React.FC<TwentyGamesHubProps> = ({
  onXpEarned,
  onPointsDeducted,
  onClose
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<MiniGameMeta | null>(null);
  const [howToPlayModal, setHowToPlayModal] = useState<MiniGameMeta | null>(null);

  // Progression globale (Niveau 1 à 99, +10 pts victoire, -5 pts défaite, déblocage séquentiel)
  const [progression, setProgression] = useState<ArcadeProgressionState>(() => getStoredArcadeProgression());
  const [resumableSession, setResumableSession] = useState<any | null>(() => getStoredActiveGameSession());
  const [lockedGamePrompt, setLockedGamePrompt] = useState<MiniGameMeta | null>(null);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState<{ newLevel: number; oldLevel: number } | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [pointsToast, setPointsToast] = useState<{ text: string; isGain: boolean } | null>(null);

  // Hydratation asynchrone sécurisée depuis IndexedDB et Firestore au montage
  useEffect(() => {
    hydrateArcadeProgressionFromStorage().then((hydrated) => {
      setProgression((prev) => {
        if (hydrated.points > prev.points || hydrated.unlockedMaxGameNumber > prev.unlockedMaxGameNumber) {
          return hydrated;
        }
        return prev;
      });
      const storedSess = getStoredActiveGameSession();
      if (storedSess) {
        setResumableSession(storedSess);
      }
    });
  }, []);

  const levelInfo = calculatePlayerLevel(progression.points);

  // Stats session
  const [streak, setStreak] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(3);

  // TTS Speech helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const isGameUnlocked = (game: MiniGameMeta): boolean => {
    // Jeu #1 (Speed Match) est débloqué dès le départ
    if (game.number === 1) return true;
    // Déblocage séquentiel : le joueur doit avoir battu/débloqué le jeu précédent
    const isSequentialUnlocked = progression.unlockedMaxGameNumber >= game.number;
    // Condition de niveau requise
    const isLevelMet = levelInfo.level >= game.requiredLevel;
    return isSequentialUnlocked && isLevelMet;
  };

  const getLockDetails = (game: MiniGameMeta) => {
    const prevGame = TWENTY_GAMES_METADATA.find((g) => g.number === game.number - 1);
    const missingSeq = progression.unlockedMaxGameNumber < game.number;
    const missingLvl = levelInfo.level < game.requiredLevel;

    return {
      missingSeq,
      missingLvl,
      prevGameTitle: prevGame ? prevGame.title : `Jeu #${game.number - 1}`,
      pointsNeededForLevel: Math.max(0, (game.requiredLevel - 1) * 100 - progression.points)
    };
  };

  const handleLaunchGame = (game: MiniGameMeta) => {
    if (!isGameUnlocked(game)) {
      sfx.playWrong();
      setLockedGamePrompt(game);
      return;
    }
    sfx.playPop();
    setActiveGame(game);
    setHearts(3);
    setShowWinModal(false);
  };

  const handleVictory = (bonusXp: number = 10) => {
    sfx.playWin();
    setSessionScore((prev) => prev + bonusXp);
    setStreak((prev) => prev + 1);

    // Système de points : +10 points cumulés par victoire réussie
    const prevPoints = progression.points;
    const newPoints = prevPoints + 10;
    const prevLevel = calculatePlayerLevel(prevPoints).level;
    const newLevel = calculatePlayerLevel(newPoints).level;

    // Déblocage séquentiel du jeu suivant si le joueur a réussi son palier actuel
    let nextUnlockedMax = progression.unlockedMaxGameNumber;
    if (activeGame && activeGame.number === progression.unlockedMaxGameNumber && progression.unlockedMaxGameNumber < TWENTY_GAMES_METADATA.length) {
      nextUnlockedMax = progression.unlockedMaxGameNumber + 1;
    }

    const updatedCompleted = activeGame && !progression.completedGames.includes(activeGame.id)
      ? [...progression.completedGames, activeGame.id]
      : progression.completedGames;

    const nextState: ArcadeProgressionState = {
      points: newPoints,
      level: newLevel,
      unlockedMaxGameNumber: nextUnlockedMax,
      completedGames: updatedCompleted,
      activeSession: null
    };

    setProgression(nextState);
    saveStoredArcadeProgression(nextState);
    clearStoredActiveGameSession();
    setResumableSession(null);

    // Toast de gain
    setPointsToast({ text: '+10 Points de niveau gagnés ! (+10 pts)', isGain: true });
    setTimeout(() => setPointsToast(null), 3500);

    // Célébration niveau supérieur
    if (newLevel > prevLevel) {
      setShowLevelUpCelebration({ newLevel, oldLevel: prevLevel });
    }

    setShowWinModal(true);
    if (onXpEarned) {
      onXpEarned(10);
    }
  };

  const handleDefeatPenalty = () => {
    // -5 points par défaite, cumulés, minimum 0
    const prevPoints = progression.points;
    const newPoints = Math.max(0, prevPoints - 5);
    const newLevel = calculatePlayerLevel(newPoints).level;

    const nextState: ArcadeProgressionState = {
      ...progression,
      points: newPoints,
      level: newLevel,
      activeSession: null
    };

    setProgression(nextState);
    saveStoredArcadeProgression(nextState);
    clearStoredActiveGameSession();
    setResumableSession(null);

    setPointsToast({ text: '-5 Points déduits (Partie perdue)', isGain: false });
    setTimeout(() => setPointsToast(null), 3500);

    if (onPointsDeducted) {
      onPointsDeducted(-5);
    }
  };

  const handleHeartLost = () => {
    sfx.playWrong();
    setHearts((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        handleDefeatPenalty();
      }
      return next;
    });
  };

  // Filtrage des 20 jeux
  const filteredGames = TWENTY_GAMES_METADATA.filter((game) => {
    if (selectedFilter === 'all') return true;
    return game.category === selectedFilter;
  });

  return (
    <div className="w-full min-h-screen bg-[#0c1322] text-[#dce2f8] px-4 sm:px-6 py-6 pb-24 relative">
      {/* Toast Notification Points Change (+10 pts / -5 pts) */}
      {pointsToast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl border flex items-center gap-2.5 font-mono font-bold text-xs ${
              pointsToast.isGain
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-rose-950/95 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {pointsToast.isGain ? 'trending_up' : 'trending_down'}
            </span>
            <span>{pointsToast.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f2ca50] via-amber-500 to-amber-700 flex items-center justify-center text-[#3c2f00] shadow-[0_0_20px_rgba(242,202,80,0.4)]">
              <span className="material-symbols-outlined text-3xl font-bold">sports_esports</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] text-[11px] font-mono font-bold uppercase tracking-wider border border-[#f2ca50]/40">
                  ARCADE PÉDAGOGIQUE
                </span>
                <span className="text-xs text-[#99907c] font-medium">• Les Mini-Jeux</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#dce2f8]">
                La Salle d'Arcade Anglaise
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Règles & Niveaux */}
            <button
              type="button"
              onClick={() => {
                sfx.playPop();
                setShowRulesModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-semibold text-[#f2ca50] transition-colors"
              title="Comprendre le système de niveaux et points"
            >
              <span className="material-symbols-outlined text-base">help</span>
              <span className="hidden sm:inline">Règles & Niveaux</span>
            </button>

            {/* Streak & Score pills */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#191f2f] border border-[#232a3a]">
              <span className="text-amber-400 text-sm font-bold">🔥 {streak} Streak</span>
              <span className="text-emerald-400 text-sm font-bold font-mono">+{sessionScore} XP</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-[#d0c5af] transition-colors"
                title="Fermer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>
        </div>

        {/* BANNIÈRE DE REPRISE DE PARTIE INTERROMPUE */}
        {resumableSession && !activeGame && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#102035] to-[#0c1424] border-2 border-emerald-400/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-2xl">history</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Partie en cours sauvegardée • Aucune perte de données
                </span>
                <h5 className="font-serif font-bold text-white text-sm">
                  {resumableSession.gameTitle || 'Jeu'} &bull; Question {resumableSession.questionIndex + 1}/{resumableSession.totalQuestions}
                </h5>
                <p className="text-[11px] text-gray-300">
                  Score accumulé conservé : <strong className="text-amber-300">+{resumableSession.bonusScore || 0} pts</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  clearStoredActiveGameSession();
                  setResumableSession(null);
                }}
                className="px-3 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-gray-400 text-xs font-semibold transition-colors"
              >
                Ignorer
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetGame = TWENTY_GAMES_METADATA.find((g) => g.id === resumableSession.gameId) || TWENTY_GAMES_METADATA[0];
                  handleLaunchGame(targetGame);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#0c1a10] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Reprendre ma partie</span>
                <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
              </button>
            </div>
          </div>
        )}

        {/* INDICATEUR DE PERSISTANCE DU STOCKAGE DES DONNÉES */}
        <div className="mb-4 px-4 py-2 rounded-2xl bg-[#0c1424] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
              Stockage Sécurisé & Persistant
            </span>
            <span className="text-gray-500 hidden sm:inline">&bull;</span>
            <span className="text-gray-300 text-[11px]">
              Points et progression enregistrés en temps réel sur <strong>Cloud Firestore</strong> & <strong>IndexedDB local</strong> (0 perte au rechargement)
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300 font-bold">
            <span className="material-symbols-outlined text-sm text-amber-400">cloud_done</span>
            <span>{progression.points} pts synchronisés</span>
          </div>
        </div>

        {/* PANNEAU DE PROGRESSION DU JOUEUR (Niveau 1 à 99 • Points • Paliers) */}
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#11192a] via-[#152038] to-[#0d1424] border-2 border-[#f2ca50]/30 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Niveau & Rang Actuel */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f2ca50] via-amber-500 to-amber-700 flex flex-col items-center justify-center text-[#1a1200] font-black shadow-[0_0_25px_rgba(242,202,80,0.4)] border border-amber-300">
                  <span className="text-[10px] font-mono leading-none uppercase tracking-tighter">NIV.</span>
                  <span className="text-2xl leading-none">{levelInfo.level}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[#0c1322] flex items-center justify-center text-xs font-black shadow">
                  ★
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-lg text-white">
                    Niveau {levelInfo.level} <span className="text-xs text-gray-400 font-sans font-normal">/ 99</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${levelInfo.tier.badgeBg} ${levelInfo.tier.badgeColor} ${levelInfo.tier.badgeBorder}`}
                  >
                    {levelInfo.tier.label}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  {levelInfo.tier.description}
                </p>
              </div>
            </div>

            {/* Statistiques en badges clairs */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
              <div className="flex-1 md:flex-none px-3 py-2 rounded-xl bg-[#090f1d] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Points Cumulés</span>
                <span className="text-sm font-mono font-black text-amber-300">⭐ {progression.points} pts</span>
              </div>

              <div className="flex-1 md:flex-none px-3 py-2 rounded-xl bg-[#090f1d] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Jeux Débloqués</span>
                <span className="text-sm font-mono font-black text-emerald-400">
                  🔓 {progression.unlockedMaxGameNumber} / 20
                </span>
              </div>

              <div className="flex-1 md:flex-none px-3 py-2 rounded-xl bg-[#090f1d] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Jeux Réussis</span>
                <span className="text-sm font-mono font-black text-blue-400">
                  🏆 {progression.completedGames.length} / 20
                </span>
              </div>
            </div>
          </div>

          {/* Jauge vers le prochain niveau (100 points = +1 niveau) */}
          <div className="mt-4 pt-3.5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">Progression Niveau :</span>
                {levelInfo.level >= 99 ? (
                  <strong className="text-amber-300">Niveau Maximum 99 Atteint ! 👑</strong>
                ) : (
                  <span>
                    <strong>{levelInfo.pointsInCurrentLevel}</strong> / 100 points vers le{' '}
                    <strong className="text-amber-300">Niveau {levelInfo.level + 1}</strong>
                  </span>
                )}
              </span>
              <span className="text-gray-400 font-bold">
                {levelInfo.level >= 99 ? '100%' : `${levelInfo.pointsInCurrentLevel}%`}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#080d1a] border border-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-[#f2ca50] transition-all duration-500 shadow-[0_0_12px_rgba(242,202,80,0.5)]"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-emerald-400 font-bold">+10 pts</span> par victoire
                <span className="text-gray-500">•</span>
                <span className="text-rose-400 font-bold">-5 pts</span> par défaite
              </span>
              <span className="text-amber-300/90 font-medium">
                Débloque les 20 jeux séquentiellement en réussissant chaque jeu !
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-[#d0c5af]/80 max-w-2xl leading-relaxed">
          Découvre les mini-jeux interactifs conçus pour transformer ton apprentissage de l'anglais en pur plaisir !
        </p>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-5 no-scrollbar">
          {[
            { id: 'all', label: 'Tous (20)', icon: 'apps' },
            { id: 'vocabulaire', label: 'Vocabulaire', icon: 'extension' },
            { id: 'verbes', label: 'Verbes Irréguliers', icon: 'sports_martial_arts' },
            { id: 'traduction', label: 'Traduction Express', icon: 'bolt' },
            { id: 'duolingo', label: 'Style Duolingo', icon: 'reorder' },
            { id: 'audio', label: 'Écoute & Prononciation', icon: 'headphones' },
            { id: 'defi', label: 'Boss Battle', icon: 'military_tech' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sfx.playPop();
                setSelectedFilter(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-[0_0_12px_rgba(242,202,80,0.3)] font-bold'
                  : 'bg-[#191f2f]/80 text-[#d0c5af] hover:bg-[#232a3a] border border-[#232a3a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of the 20 Mini-Games */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => {
          const unlocked = isGameUnlocked(game);
          const lockDetails = !unlocked ? getLockDetails(game) : null;
          const isCompleted = progression.completedGames.includes(game.id);

          return (
            <div
              key={game.id}
              onClick={() => {
                if (!unlocked) {
                  sfx.playWrong();
                  setLockedGamePrompt(game);
                }
              }}
              className={`group relative rounded-2xl p-4.5 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                unlocked
                  ? `bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} hover:-translate-y-1 hover:shadow-xl cursor-default`
                  : 'bg-[#10141f] border border-stone-800 shadow-md cursor-pointer hover:border-amber-500/50'
              }`}
            >
              {/* COUCHE GRISE AVEC CADENAS SI VERROUILLÉ */}
              {!unlocked && (
                <div className="absolute inset-0 bg-[#070b14]/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-between p-4 text-center">
                  <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-gray-400">
                    <span>JEU #{game.number.toString().padStart(2, '0')}</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-300">
                      🔒 Verrouillé
                    </span>
                  </div>

                  {/* Icone Cadenas Central */}
                  <div className="my-auto flex flex-col items-center">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-black">lock</span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-white mb-1">
                      {game.title}
                    </h4>

                    {/* Explications Requises */}
                    <div className="space-y-1 my-1">
                      {lockDetails?.missingSeq && (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                          🔒 Requis : Terminer Jeu #{game.number - 1}
                        </div>
                      )}
                      {lockDetails?.missingLvl && (
                        <div className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                          🔒 Requis : Niveau {game.requiredLevel} (Actuel: {levelInfo.level})
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-gray-400 underline underline-offset-2">
                    Cliquer pour voir les conditions
                  </span>
                </div>
              )}

              {/* Contenu de la Carte (actif ou sous calque) */}
              <div className={unlocked ? '' : 'filter grayscale opacity-30 select-none'}>
                {/* Top row: Number, icon, difficulty */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-[#0c1322]/80 border border-white/10 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">{game.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-[#f2ca50] font-bold">
                          JEU #{game.number.toString().padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${game.badgeColor} w-fit`}>
                            {game.difficulty}
                          </span>
                          {isCompleted && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                              ✓ Réussi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sfx.playPop();
                        setHowToPlayModal(game);
                      }}
                      className="p-1.5 rounded-lg text-[#99907c] hover:text-[#f2ca50] hover:bg-white/5 transition-colors"
                      title="Comment jouer (Règles)"
                    >
                      <span className="material-symbols-outlined text-[20px]">help_outline</span>
                    </button>
                  </div>

                  {/* Title & subtitle */}
                  <h3
                    className={`font-serif font-bold text-base transition-colors leading-snug ${
                      game.id === 'speed-match'
                        ? 'text-orange-500 font-black text-lg'
                        : 'text-[#dce2f8] group-hover:text-[#f2ca50]'
                    }`}
                  >
                    {game.title}
                  </h3>
                  {game.id === 'speed-match' ? (
                    <div className="mt-1 mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-black text-[11px] font-black tracking-tight shadow-sm border border-amber-200">
                        Traduction Éclair • 3 Niveaux
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#f2ca50]/90 font-medium mt-0.5 mb-2">
                      {game.subtitle}
                    </p>
                  )}
                  <p className="text-[11px] text-[#d0c5af]/80 line-clamp-2 leading-relaxed">
                    {game.howToPlay.goal}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    +{game.xpReward} XP
                  </span>

                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => handleLaunchGame(game)}
                    className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span>Jouer</span>
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL COMMENT JOUER (How to play) */}
      {howToPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#131b2e] border border-[#f2ca50]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setHowToPlayModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#0c1322] text-[#d0c5af] hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0c1322] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
                <span className="material-symbols-outlined text-2xl">{howToPlayModal.icon}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#f2ca50] font-bold uppercase tracking-wider">
                  RÈGLES DU JEU #{howToPlayModal.number}
                </span>
                {howToPlayModal.id === 'speed-match' ? (
                  <div className="flex flex-col gap-1 mt-0.5">
                    <h3 className="font-serif font-black text-xl text-orange-500">
                      Speed Match
                    </h3>
                    <span className="w-fit px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-black text-xs font-black shadow-sm border border-amber-200">
                      Traduction Éclair • 3 Niveaux
                    </span>
                  </div>
                ) : (
                  <h3 className="font-serif font-bold text-lg text-white">
                    {howToPlayModal.title} - {howToPlayModal.subtitle}
                  </h3>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider mb-1">
                  🎯 Objectif
                </h4>
                <p className="text-xs text-[#dce2f8] leading-relaxed bg-[#0c1322]/60 p-3 rounded-xl border border-white/5">
                  {howToPlayModal.howToPlay.goal}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider mb-1">
                  📜 Comment Jouer
                </h4>
                <ul className="space-y-1.5 text-xs text-[#d0c5af]">
                  {howToPlayModal.howToPlay.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#f2ca50] font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>💡 Astuce Pro :</strong> {howToPlayModal.howToPlay.tip}
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = howToPlayModal;
                  setHowToPlayModal(null);
                  handleLaunchGame(target);
                }}
                className="w-full py-3 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>C'est parti, je joue !</span>
                <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME RUNNER MODAL (Interactive Canvas for the active game) */}
      {activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121927] border border-[#f2ca50]/50 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl relative">
            {/* Game Topbar */}
            <div className="p-4 border-b border-[#232a3a] flex items-center justify-between bg-[#0c1322]/80 sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#191f2f] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-xl">{activeGame.icon}</span>
                </div>
                <div>
                  <h3
                    className={`font-serif text-sm sm:text-base ${
                      activeGame.id === 'speed-match'
                        ? 'text-orange-500 font-black'
                        : 'text-white font-bold'
                    }`}
                  >
                    {activeGame.title}
                  </h3>
                  {activeGame.id === 'speed-match' ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-black text-[10px] font-black tracking-tight shadow-sm border border-amber-200">
                      Traduction Éclair • 3 Niveaux
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#f2ca50] font-mono">
                      {activeGame.subtitle}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Lives / Hearts */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((h) => (
                    <span
                      key={h}
                      className={`text-base transition-transform ${
                        h <= hearts ? 'text-rose-500 scale-100' : 'text-gray-600 scale-90'
                      }`}
                    >
                      ❤️
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="p-1.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-[#d0c5af] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Active Game Engine */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
              {hearts <= 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3 animate-bounce">💔</div>
                  <h4 className="font-serif font-bold text-xl text-white mb-2">
                    Partie terminée !
                  </h4>

                  {/* Pénalité de défaite */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs mb-3">
                    <span className="material-symbols-outlined text-sm">trending_down</span>
                    <span>-5 Points déduits • Total : {progression.points} pts</span>
                  </div>

                  <p className="text-xs text-[#d0c5af] mb-6 max-w-xs mx-auto leading-relaxed">
                    Ne te décourage pas, l'erreur fait partie de l'apprentissage ! Chaque victoire te redonne <strong>+10 points</strong>. Retente ta chance pour maîtriser ce défi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setHearts(3);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-black text-xs uppercase tracking-wider hover:bg-[#ffe088] shadow-lg active:scale-95 transition-all"
                  >
                    Recommencer
                  </button>
                </div>
              ) : (
                <ActiveGameRenderer
                  gameId={activeGame.id}
                  xpReward={activeGame.xpReward}
                  onSuccess={() => handleVictory(activeGame.xpReward)}
                  onError={handleHeartLost}
                  speak={speakText}
                  playerLevel={levelInfo.level}
                />
              )}
            </div>

            {/* In-Game Tip Footnote */}
            <div className="p-3 bg-[#0c1322] border-t border-[#232a3a] text-center text-[11px] text-[#99907c] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">tips_and_updates</span>
              <span>{activeGame.howToPlay.tip}</span>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY / WIN MODAL */}
      {showWinModal && activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121927] border-2 border-[#f2ca50] rounded-3xl p-6 max-w-sm w-full text-center shadow-[0_0_40px_rgba(242,202,80,0.3)] animate-scaleUp">
            <div className="text-6xl mb-3 animate-bounce">🏆</div>
            <h3 className="font-serif font-black text-2xl text-white mb-1">
              Mission Réussie !
            </h3>
            <p className="text-xs text-[#d0c5af] mb-4">
              Tu as brillamment réussi le mini-jeu <strong>{activeGame.title}</strong> !
            </p>

            {/* Récompense Points & Déblocage */}
            <div className="p-3.5 rounded-2xl bg-[#0c1322] border border-[#f2ca50]/30 mb-4 space-y-2.5">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block">POINTS NIVEAU</span>
                  <span className="font-mono font-black text-xl text-emerald-300">+10 pts</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#99907c] uppercase font-mono block">XP GAGNÉS</span>
                  <span className="font-mono font-black text-xl text-[#f2ca50]">+{activeGame.xpReward} XP</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-[#99907c] uppercase font-mono block">SÉRIE FEU</span>
                  <span className="font-mono font-black text-xl text-amber-400">🔥 {streak}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Niveau Actuel :</span>
                <span className="text-amber-300 font-bold">Niv. {levelInfo.level} ({levelInfo.pointsInCurrentLevel}/100 pts)</span>
              </div>
            </div>

            {/* Déblocage du prochain jeu */}
            {activeGame.number < 20 && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">lock_open</span>
                <span>Prochain Jeu #{activeGame.number + 1} Débloqué !</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowWinModal(false);
                  setActiveGame(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-[#d0c5af] font-bold text-xs uppercase"
              >
                Retour Arcade
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWinModal(false);
                  setHearts(3);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase shadow-md"
              >
                Rejouer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JEU VERROUILLÉ */}
      {lockedGamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121927] border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setLockedGamePrompt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#0c1322] text-[#d0c5af] hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
                <span className="material-symbols-outlined text-3xl font-black">lock</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  ACCÈS VERROUILLÉ • JEU #{lockedGamePrompt.number}
                </span>
                <h3 className="font-serif font-black text-xl text-white">
                  {lockedGamePrompt.title}
                </h3>
                <p className="text-xs text-gray-300 font-medium">
                  {lockedGamePrompt.subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                Conditions requises pour débloquer :
              </h4>

              {/* Condition 1 : Déblocage séquentiel */}
              {lockedGamePrompt.number > 1 && (
                <div
                  className={`p-3 rounded-2xl border flex items-start gap-3 ${
                    progression.unlockedMaxGameNumber >= lockedGamePrompt.number
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
                    {progression.unlockedMaxGameNumber >= lockedGamePrompt.number ? 'check_circle' : 'cancel'}
                  </span>
                  <div className="text-xs">
                    <strong className="block font-bold">1. Progression séquentielle</strong>
                    {progression.unlockedMaxGameNumber >= lockedGamePrompt.number ? (
                      <span>Jeu #{lockedGamePrompt.number - 1} validé avec succès !</span>
                    ) : (
                      <span>
                        Tu dois d'abord réussir le <strong>Jeu #{lockedGamePrompt.number - 1}</strong> (
                        {TWENTY_GAMES_METADATA.find((g) => g.number === lockedGamePrompt.number - 1)?.title}) !
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Condition 2 : Niveau requis */}
              <div
                className={`p-3 rounded-2xl border flex items-start gap-3 ${
                  levelInfo.level >= lockedGamePrompt.requiredLevel
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
                  {levelInfo.level >= lockedGamePrompt.requiredLevel ? 'check_circle' : 'cancel'}
                </span>
                <div className="text-xs">
                  <strong className="block font-bold">2. Niveau joueur requis : Niveau {lockedGamePrompt.requiredLevel}</strong>
                  {levelInfo.level >= lockedGamePrompt.requiredLevel ? (
                    <span>Niveau {lockedGamePrompt.requiredLevel} atteint (Actuel : Niv. {levelInfo.level})</span>
                  ) : (
                    <span>
                      Actuel : <strong>Niveau {levelInfo.level}</strong> ({levelInfo.pointsInCurrentLevel}/100 pts). Gagne encore{' '}
                      <strong>{Math.max(0, (lockedGamePrompt.requiredLevel - 1) * 100 - progression.points)} pts</strong> pour l'atteindre.
                    </span>
                  )}
                </div>
              </div>

              {/* Rappel du système */}
              <div className="p-3 rounded-2xl bg-[#0c1322] border border-white/5 text-xs text-gray-300">
                <p className="leading-relaxed">
                  💡 <strong>Comment progresser ?</strong> Chaque partie gagnée te rapporte <strong>+10 points</strong>. Tous les{' '}
                  <strong>100 points</strong>, tu montes d'un niveau (jusqu'au niveau 99 maximum).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLockedGamePrompt(null)}
                className="flex-1 py-3 rounded-2xl bg-[#191f2f] hover:bg-[#232a3a] text-[#d0c5af] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Compris
              </button>
              {progression.unlockedMaxGameNumber >= 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const currentGame = TWENTY_GAMES_METADATA.find((g) => g.number === progression.unlockedMaxGameNumber) || TWENTY_GAMES_METADATA[0];
                    setLockedGamePrompt(null);
                    handleLaunchGame(currentGame);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Jouer Jeu #{progression.unlockedMaxGameNumber}</span>
                  <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CÉLÉBRATION NIVEAU SUPÉRIEUR */}
      {showLevelUpCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-[#18233d] to-[#0c1322] border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center shadow-[0_0_50px_rgba(242,202,80,0.5)] animate-scaleUp">
            <div className="text-6xl mb-3 animate-bounce">⭐</div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold uppercase tracking-wider mb-2 inline-block">
              NIVEAU SUPÉRIEUR DÉBLOQUÉ !
            </span>
            <h3 className="font-serif font-black text-3xl text-white mb-1">
              NIVEAU {showLevelUpCelebration.newLevel} !
            </h3>
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              Félicitations ! Tu as accumulé 100 points supplémentaires et atteint le <strong>Niveau {showLevelUpCelebration.newLevel}</strong>. De nouveaux mini-jeux et paliers sont désormais accessibles !
            </p>

            <div className="p-3 rounded-2xl bg-[#090f1d] border border-amber-400/30 mb-5 text-left text-xs space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>Ancien Niveau :</span>
                <strong className="text-gray-400 font-mono">Niveau {showLevelUpCelebration.oldLevel}</strong>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Nouveau Niveau :</span>
                <strong className="text-amber-300 font-mono text-sm">Niveau {showLevelUpCelebration.newLevel} ★</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLevelUpCelebration(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-[#f2ca50] to-yellow-500 text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Continuer l'aventure
            </button>
          </div>
        </div>
      )}

      {/* MODAL GUIDE DES RÈGLES ET NIVEAUX */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121927] border border-[#f2ca50]/40 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#0c1322] text-[#d0c5af] hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-lg font-black">
                <span className="material-symbols-outlined text-3xl">military_tech</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-wider block">
                  SYSTÈME DE JEU • RÈGLES OFFICIELLES
                </span>
                <h3 className="font-serif font-black text-xl text-white">
                  Niveaux 1 à 99 & Déblocages
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="p-3.5 rounded-2xl bg-[#0c1322] border border-white/5 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">stars</span>
                  1. Gain & Perte de Points Cumulés
                </h4>
                <ul className="space-y-1.5 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>+10 Points</strong> pour chaque mini-jeu joué et réussi avec succès.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>-5 Points</strong> déduits en cas de défaite (perte des 3 cœurs).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Tous les <strong>100 points</strong>, tu montes d'un niveau (Niveau 1: 0-99 pts, Niveau 2: 100-199 pts... jusqu'au <strong>Niveau 99</strong>).</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0c1322] border border-white/5 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">lock</span>
                  2. Déblocage Séquentiel des 20 Jeux
                </h4>
                <p className="leading-relaxed">
                  Tu commences avec le <strong>Jeu #1 (Speed Match)</strong>. Une fois remporté, tu débloques le Jeu #2 (Word Scramble), puis le #3, le #4, et ainsi de suite jusqu'au boss final #20 ! Un jeu non débloqué affiche un cadenas 🔒 et un voile gris.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0c1322] border border-white/5 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">workspace_premium</span>
                  3. Les 5 Paliers de Difficulté
                </h4>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex justify-between items-center">
                    <div>
                      <strong className="text-emerald-400 block">🟢 Débutant</strong>
                      <span className="text-[11px] text-gray-400">Accessible dès le départ (Niveaux 1 à 10)</span>
                    </div>
                    <span className="font-mono text-emerald-300 font-bold">Niv. 1+</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 flex justify-between items-center">
                    <div>
                      <strong className="text-amber-400 block">🟡 Intermédiaire</strong>
                      <span className="text-[11px] text-gray-400">Débloqué au Niveau 11 (1 000 pts)</span>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">Niv. 11+</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/30 flex justify-between items-center">
                    <div>
                      <strong className="text-blue-400 block">🔵 Professionnel</strong>
                      <span className="text-[11px] text-gray-400">Débloqué au Niveau 21 (2 000 pts)</span>
                    </div>
                    <span className="font-mono text-blue-300 font-bold">Niv. 21+</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/30 flex justify-between items-center">
                    <div>
                      <strong className="text-purple-400 block">🟣 Pro</strong>
                      <span className="text-[11px] text-gray-400">Débloqué au Niveau 31 (3 000 pts)</span>
                    </div>
                    <span className="font-mono text-purple-300 font-bold">Niv. 31+</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 flex justify-between items-center">
                    <div>
                      <strong className="text-rose-400 block">🔴 Expert</strong>
                      <span className="text-[11px] text-gray-400">Débloqué au Niveau 51 (5 000 pts)</span>
                    </div>
                    <span className="font-mono text-rose-300 font-bold">Niv. 51+</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full mt-5 py-3 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              J'ai compris, retour au jeu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// RENDERER INTERACTIF DES 20 JEUX SPÉCIFIQUES
// =====================================================================
interface ActiveGameRendererProps {
  gameId: string;
  xpReward: number;
  onSuccess: () => void;
  onError: () => void;
  speak: (text: string) => void;
  playerLevel: number;
}

const ActiveGameRenderer: React.FC<ActiveGameRendererProps> = ({
  gameId,
  onSuccess,
  onError,
  speak,
  playerLevel
}) => {
  switch (gameId) {
    case 'speed-match':
      return <SpeedMatchGame onSuccess={onSuccess} onError={onError} speak={speak} playerLevel={playerLevel} />;
    case 'word-scramble':
      return <WordScrambleGame onSuccess={onSuccess} onError={onError} speak={speak} playerLevel={playerLevel} />;
    case 'speed-math':
      return <SpeedMentalMathGame onSuccess={onSuccess} onError={onError} speak={speak} playerLevel={playerLevel} />;
    case 'word-search':
      return <WordSearchGame onSuccess={onSuccess} onError={onError} />;
    case 'verb-master':
      return <VerbMasterGame onSuccess={onSuccess} onError={onError} />;
    case 'astro-hangman':
      return <AstroHangmanGame onSuccess={onSuccess} onError={onError} />;
    case 'sentence-builder':
      return <SentenceBuilderGame onSuccess={onSuccess} onError={onError} speak={speak} />;
    case 'audio-blitz':
      return <AudioBlitzGame onSuccess={onSuccess} onError={onError} speak={speak} />;
    case 'antonym-synonym':
      return <AntonymSynonymGame onSuccess={onSuccess} onError={onError} />;
    case 'odd-one-out':
      return <OddOneOutGame onSuccess={onSuccess} onError={onError} />;
    case 'fill-the-blank':
      return <FillTheBlankGame onSuccess={onSuccess} onError={onError} />;
    case 'true-or-false':
      return <TrueOrFalseGame onSuccess={onSuccess} onError={onError} />;
    case 'memory-pairs':
      return <MemoryPairsGame onSuccess={onSuccess} onError={onError} />;
    case 'beat-the-clock':
      return <BeatTheClockGame onSuccess={onSuccess} onError={onError} />;
    case 'word-snake':
      return <WordSnakeGame onSuccess={onSuccess} onError={onError} />;
    case 'riddle-solver':
      return <RiddleSolverGame onSuccess={onSuccess} onError={onError} />;
    case 'tone-detector':
      return <ToneDetectorGame onSuccess={onSuccess} onError={onError} />;
    case 'uk-vs-us':
      return <UkVsUsGame onSuccess={onSuccess} onError={onError} />;
    case 'idiom-hunter':
      return <IdiomHunterGame onSuccess={onSuccess} onError={onError} />;
    case 'spelling-bee':
      return <SpellingBeeGame onSuccess={onSuccess} onError={onError} speak={speak} />;
    case 'boss-battle':
      return <BossBattleGame onSuccess={onSuccess} onError={onError} />;
    default:
      return <div>Jeu en cours de chargement...</div>;
  }
};

// 1. SPEED MATCH (Mini-jeu Interactif n°1 - Niveaux Débutant 5q / Intermédiaire 25q / Avancé 50q • 12 Mots par question)
interface SpeedMatchGameProps {
  onSuccess: () => void;
  onError: () => void;
  speak?: (text: string) => void;
  playerLevel: number;
}

const SpeedMatchGame: React.FC<SpeedMatchGameProps> = ({ onSuccess, onError, speak, playerLevel }) => {
  // Mode : 'select-level' ou 'playing' ou 'level-completed'
  const [selectedLevelKey, setSelectedLevelKey] = useState<SpeedMatchLevelKey | null>(null);

  // Détection d'une partie précédente interrompue (refresh / fermeture navigateur)
  const [savedSession, setSavedSession] = useState<any | null>(() => {
    const s = getStoredActiveGameSession();
    return s && s.gameId === 'speed-match' ? s : null;
  });

  // Questions du niveau actif
  const [questions, setQuestions] = useState<
    Array<{ questionNumber: number; totalQuestions: number; pairs: SpeedMatchPair[] }>
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Colonnes mélangées (exactement 6 mots anglais + 6 traductions françaises = 12 MOTS)
  const [shuffledEn, setShuffledEn] = useState<SpeedMatchPair[]>([]);
  const [shuffledFr, setShuffledFr] = useState<SpeedMatchPair[]>([]);

  // Sélections et correspondances
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedFr, setSelectedFr] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ en: string; fr: string } | null>(null);

  // Stats & Progression
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [bonusScore, setBonusScore] = useState(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isLevelFinished, setIsLevelFinished] = useState(false);

  // Chronomètre de question
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Démarre un niveau avec une nouvelle sélection aléatoire non-répétitive
  const startLevel = (levelKey: SpeedMatchLevelKey) => {
    sfx.playPop();
    const config = SPEED_MATCH_LEVELS[levelKey];
    const newQuestions = generateSpeedMatchQuestions(levelKey);
    setSelectedLevelKey(levelKey);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setBonusScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsLevelFinished(false);
    setTimeLeft(config.timePerQuestion);

    // Sauvegarde immédiate du démarrage de session pour survie au refresh
    saveActiveGameSession({
      gameId: 'speed-match',
      gameTitle: 'Speed Match',
      levelKey,
      questionIndex: 0,
      totalQuestions: newQuestions.length,
      bonusScore: 0,
      timestamp: new Date().toISOString()
    });
  };

  // Reprendre la session sauvegardée exactement où le joueur s'était arrêté
  const resumeSavedSession = () => {
    if (!savedSession) return;
    sfx.playPop();
    const levelKey = (savedSession.levelKey || 'debutant') as SpeedMatchLevelKey;
    const config = SPEED_MATCH_LEVELS[levelKey] || SPEED_MATCH_LEVELS.debutant;
    const newQuestions = generateSpeedMatchQuestions(levelKey);
    setSelectedLevelKey(levelKey);
    setQuestions(newQuestions);
    const targetQ = Math.min(newQuestions.length - 1, Math.max(0, Number(savedSession.questionIndex) || 0));
    setCurrentQuestionIndex(targetQ);
    setBonusScore(Number(savedSession.bonusScore) || 0);
    setCombo(0);
    setMaxCombo(0);
    setIsLevelFinished(false);
    setTimeLeft(config.timePerQuestion);
    setSavedSession(null);
  };

  // Initialisation ou passage à la question suivante
  useEffect(() => {
    if (!selectedLevelKey || questions.length === 0 || isLevelFinished) return;

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    const config = SPEED_MATCH_LEVELS[selectedLevelKey];
    const pairs = [...currentQ.pairs];
    const enArr = [...pairs].sort(() => Math.random() - 0.5);
    const frArr = [...pairs].sort(() => Math.random() - 0.5);

    setShuffledEn(enArr);
    setShuffledFr(frArr);
    setMatched([]);
    setSelectedEn(null);
    setSelectedFr(null);
    setWrongPair(null);
    setActiveHint(null);
    setTimeLeft(config.timePerQuestion);
  }, [selectedLevelKey, questions, currentQuestionIndex, isLevelFinished]);

  // Décompte du chronomètre
  useEffect(() => {
    if (!selectedLevelKey || isLevelFinished) return;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    if (matched.length === currentQ.pairs.length) return; // Série terminée

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sfx.playWrong();
          onError();
          const config = SPEED_MATCH_LEVELS[selectedLevelKey];
          return config.timePerQuestion; // Recharge le chrono pour continuer
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedLevelKey, currentQuestionIndex, matched.length, questions, isLevelFinished, onError]);

  const handleEnClick = (word: string) => {
    sfx.playPop();
    if (speak) speak(word);
    setSelectedEn(word);
    if (selectedFr) {
      evaluateMatch(word, selectedFr);
    }
  };

  const handleFrClick = (frWord: string) => {
    sfx.playPop();
    setSelectedFr(frWord);
    if (selectedEn) {
      evaluateMatch(selectedEn, frWord);
    }
  };

  const evaluateMatch = (en: string, fr: string) => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    const pair = currentQ.pairs.find((p) => p.en === en);
    const isCorrect = pair && pair.fr === fr;

    if (isCorrect) {
      sfx.playCorrect();
      const newMatched = [...matched, en];
      setMatched(newMatched);
      setSelectedEn(null);
      setSelectedFr(null);
      setWrongPair(null);
      setActiveHint(null);

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      const points = 10 * (nextCombo > 1 ? nextCombo : 1);
      const updatedBonus = bonusScore + points;
      setBonusScore(updatedBonus);

      // Si les 6 paires de la question sont validées (12 mots au total)
      if (newMatched.length === currentQ.pairs.length) {
        if (currentQuestionIndex + 1 < questions.length) {
          // Question suivante : Sauvegarde immédiate en temps réel
          saveActiveGameSession({
            gameId: 'speed-match',
            gameTitle: 'Speed Match',
            levelKey: selectedLevelKey,
            questionIndex: currentQuestionIndex + 1,
            totalQuestions: questions.length,
            bonusScore: updatedBonus,
            timestamp: new Date().toISOString()
          });

          setTimeout(() => {
            sfx.playWin();
            setCurrentQuestionIndex((prev) => prev + 1);
          }, 500);
        } else {
          // Toutes les questions du niveau sont réussies !
          clearStoredActiveGameSession();
          setTimeout(() => {
            sfx.playWin();
            setIsLevelFinished(true);
            onSuccess();
          }, 500);
        }
      }
    } else {
      sfx.playWrong();
      onError();
      setWrongPair({ en, fr });
      setCombo(0);
      setTimeout(() => {
        setSelectedEn(null);
        setSelectedFr(null);
        setWrongPair(null);
      }, 700);
    }
  };

  // ÉCRAN 1 : SÉLECTION DU NIVEAU (Débutant 5q / Intermédiaire 25q / Avancé 50q)
  if (!selectedLevelKey) {
    return (
      <div className="flex flex-col gap-5 py-2 select-none">
        {/* BANNIÈRE DE REPRISE DE PARTIE EN COURS (SPEED MATCH) */}
        {savedSession && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-[#102035] to-[#0c1424] border-2 border-emerald-400/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-2xl">history</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Partie en cours retrouvée
                </span>
                <h5 className="font-serif font-bold text-white text-base">
                  Reprendre à la Question {(savedSession.questionIndex || 0) + 1} / {savedSession.totalQuestions || 5}
                </h5>
                <p className="text-xs text-gray-300">
                  Palier : <strong className="text-amber-300">{SPEED_MATCH_LEVELS[savedSession.levelKey as SpeedMatchLevelKey]?.label || 'Débutant'}</strong> &bull; Score conservé : <strong className="text-emerald-400">+{savedSession.bonusScore || 0} pts</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  clearStoredActiveGameSession();
                  setSavedSession(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-gray-400 text-xs font-semibold transition-colors"
              >
                Ignorer
              </button>
              <button
                type="button"
                onClick={resumeSavedSession}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#0c1a10] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Reprendre ma partie</span>
                <span className="material-symbols-outlined text-base font-bold">play_arrow</span>
              </button>
            </div>
          </div>
        )}

        {/* En-tête Icone Attrayante & Titre */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-3xl bg-gradient-to-r from-[#141d33] via-[#101728] to-[#0c1322] border-2 border-amber-400/40 shadow-xl">
          {/* Icône Attrayante Speed Match */}
          <div className="relative shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f2ca50] via-amber-500 to-amber-700 shadow-[0_0_30px_rgba(242,202,80,0.5)] border-2 border-amber-300">
            <span className="material-symbols-outlined text-4xl text-[#1a1200] font-black">
              bolt
            </span>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md flex items-center gap-0.5 ring-2 ring-[#0c1322]">
              <span>🇬🇧</span>
              <span>⚡</span>
              <span>🇫🇷</span>
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider border border-orange-500/30">
                JEU N°1
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-sm border border-amber-200">
                Traduction Éclair • 3 Niveaux
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-orange-500 tracking-tight">
              Speed Match
            </h3>
            <p className="text-xs sm:text-sm text-[#e2e8f0] font-medium leading-relaxed mt-1">
              Associe chaque mot anglais à sa traduction française le plus rapidement possible.
              Chaque manche propose <strong>12 MOTS</strong> (6 paires) à associer en un temps record !
            </p>
          </div>
        </div>

        {/* Sélection des 3 Niveaux */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#f2ca50] font-bold mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">tune</span>
            Choisis ton palier de défi :
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(['debutant', 'intermediaire', 'professionnel', 'pro', 'expert'] as SpeedMatchLevelKey[]).map((key) => {
              const lvl = SPEED_MATCH_LEVELS[key];
              const isTierUnlocked = playerLevel >= lvl.requiredPlayerLevel;

              const borderGlow =
                key === 'debutant'
                  ? 'border-emerald-500/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : key === 'intermediaire'
                  ? 'border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : key === 'professionnel'
                  ? 'border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : key === 'pro'
                  ? 'border-purple-500/50 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'border-rose-500/50 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]';

              const btnColor =
                key === 'debutant'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                  : key === 'intermediaire'
                  ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-stone-950'
                  : key === 'professionnel'
                  ? 'bg-blue-500 hover:bg-blue-400 text-white'
                  : key === 'pro'
                  ? 'bg-purple-500 hover:bg-purple-400 text-white'
                  : 'bg-rose-500 hover:bg-rose-400 text-white';

              return (
                <div
                  key={key}
                  className={`relative p-4 rounded-2xl flex flex-col justify-between border-2 transition-all duration-200 group overflow-hidden ${
                    isTierUnlocked
                      ? `bg-[#11192a] hover:bg-[#16233b] ${borderGlow}`
                      : 'bg-[#0b101c] border-stone-800 shadow-none'
                  }`}
                >
                  {/* COUCHE GRISE AVEC CADENAS SI PALIER VERROUILLÉ */}
                  {!isTierUnlocked && (
                    <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-between p-4 text-center">
                      <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-gray-400">
                        <span className="capitalize">{lvl.label}</span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-300 border border-stone-700">
                          🔒 Verrouillé
                        </span>
                      </div>

                      <div className="my-auto flex flex-col items-center py-2">
                        <div className="w-11 h-11 rounded-2xl bg-stone-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-md mb-2">
                          <span className="material-symbols-outlined text-2xl">lock</span>
                        </div>
                        <h5 className="font-serif font-bold text-sm text-white mb-1">
                          {lvl.label}
                        </h5>
                        <div className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                          🔒 Débloqué au Niveau {lvl.requiredPlayerLevel}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 max-w-[180px]">
                          Ton niveau : <strong className="text-white">Niveau {playerLevel}</strong>. Gagne encore{' '}
                          <strong className="text-amber-300">
                            {Math.max(0, (lvl.requiredPlayerLevel - 1) * 100 - (playerLevel - 1) * 100)} pts
                          </strong>{' '}
                          pour débloquer ce palier !
                        </p>
                      </div>

                      <div className="w-full py-2 px-3 rounded-xl bg-stone-800/80 border border-stone-700 text-gray-400 text-xs font-mono font-bold">
                        Niveau {lvl.requiredPlayerLevel} Requis
                      </div>
                    </div>
                  )}

                  {/* Contenu de la Carte du Palier */}
                  <div className={isTierUnlocked ? '' : 'filter grayscale opacity-25 select-none'}>
                    {/* Header carte */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${lvl.badgeBg} ${lvl.badgeText} border ${lvl.badgeBorder}`}
                      >
                        <span className="material-symbols-outlined text-xs">{lvl.icon}</span>
                        {lvl.label}
                      </span>
                      <span className="text-[11px] font-mono text-amber-300 font-bold">
                        +{lvl.xpReward} XP
                      </span>
                    </div>

                    <h5 className="font-serif font-black text-base text-white mb-1">
                      {lvl.label}
                    </h5>
                    <p className="text-[11px] text-[#cbd5e1] font-semibold mb-3">
                      {lvl.subtitle}
                    </p>

                    {/* Spécifications claires */}
                    <div className="space-y-1.5 mb-4 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#0a0f1d] border border-white/5 text-[#f1f5f9]">
                        <span className="text-gray-300 font-medium">Séries de questions :</span>
                        <strong className="text-white font-extrabold font-mono text-sm">
                          {lvl.questionsCount} Séries
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#0a0f1d] border border-white/5 text-[#f1f5f9]">
                        <span className="text-gray-300 font-medium">Mots par question :</span>
                        <strong className="text-amber-300 font-black font-mono text-sm">
                          12 MOTS (6 paires)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#0a0f1d] border border-white/5 text-[#f1f5f9]">
                        <span className="text-gray-300 font-medium">Total de mots :</span>
                        <strong className="text-emerald-400 font-bold font-mono">
                          {lvl.questionsCount * 12} Mots
                        </strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#94a3b8] leading-relaxed mb-4">
                      {lvl.description}
                    </p>
                  </div>

                  {isTierUnlocked && (
                    <button
                      type="button"
                      onClick={() => startLevel(key)}
                      className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md ${btnColor}`}
                    >
                      <span>Jouer ce palier</span>
                      <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentLevelConfig = SPEED_MATCH_LEVELS[selectedLevelKey];
  const currentQ = questions[currentQuestionIndex];

  // ÉCRAN 2 : VICTOIRE DU NIVEAU TERMINÉ
  if (isLevelFinished) {
    const totalWordsMatched = currentLevelConfig.questionsCount * 12;

    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-3 select-none">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 flex items-center justify-center text-4xl shadow-[0_0_35px_rgba(242,202,80,0.6)] mb-4 animate-bounce">
          🏆
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          NIVEAU COMPLÉTÉ AVEC SUCCÈS !
        </span>

        <h3 className="font-serif font-black text-2xl sm:text-3xl text-white mb-2">
          Bravo, Maître du Speed Match !
        </h3>

        <p className="text-sm text-[#cbd5e1] max-w-md mx-auto mb-6">
          Tu as brillamment réussi les <strong>{currentLevelConfig.questionsCount} questions</strong> du
          niveau <strong>{currentLevelConfig.label}</strong> en associant sans faiblir les{' '}
          <strong>{totalWordsMatched} mots</strong> !
        </p>

        {/* Tableau des Statistiques Récapitulatives */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6">
          <div className="p-3 rounded-2xl bg-[#0c1322] border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">
              Questions
            </span>
            <span className="text-lg font-black text-white font-mono">
              {currentLevelConfig.questionsCount} / {currentLevelConfig.questionsCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c1322] border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">
              Mots Associés
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {totalWordsMatched}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c1322] border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">
              Score Total
            </span>
            <span className="text-lg font-black text-amber-300 font-mono">
              +{bonusScore} pts
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            type="button"
            onClick={() => startLevel(selectedLevelKey)}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#1a1200] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base font-bold">replay</span>
            <span>Rejouer (Nouveaux mots)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelKey(null)}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#19233c] hover:bg-[#233152] text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Changer de niveau</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return <div>Chargement de la question...</div>;

  const currentLevelTime = currentLevelConfig.timePerQuestion;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 select-none">
      {/* Top Banner : Niveau, Numéro de Question, Chrono, Combo, Bouton Changer */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#0c1322] border border-[#2b3e64] shadow-md">
        {/* Game Title Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-orange-500 text-sm tracking-wide">
              Speed Match
            </span>
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-black text-[10px] font-black tracking-tight border border-amber-200 shadow-sm">
              Traduction Éclair • 3 Niveaux
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            Jeu #01
          </span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Badge Niveau & Compteur Question */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 border ${currentLevelConfig.badgeBg} ${currentLevelConfig.badgeText} ${currentLevelConfig.badgeBorder}`}
            >
              <span className="material-symbols-outlined text-xs">{currentLevelConfig.icon}</span>
              {currentLevelConfig.label}
            </span>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#18233a] border border-[#334668] text-white text-xs font-mono font-black">
              <span>Série</span>
              <span className="text-amber-300">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Bouton Changer de niveau */}
            <button
              type="button"
              onClick={() => setSelectedLevelKey(null)}
              className="text-[11px] text-gray-300 hover:text-white px-2 py-0.5 rounded-lg bg-[#18233a] hover:bg-[#233352] border border-[#334668] transition-colors flex items-center gap-1"
              title="Retour aux niveaux"
            >
              <span className="material-symbols-outlined text-xs">tune</span>
              <span className="hidden sm:inline">Niveaux</span>
            </button>
          </div>

          {/* Statistiques : Chronomètre, Combo, Points */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black shadow-sm ${
                timeLeft <= 10
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-[#18233a] text-amber-300 border border-[#334668]'
              }`}
            >
              <span className="material-symbols-outlined text-xs">timer</span>
              <span>{timeLeft}s</span>
            </div>

            {combo > 1 && (
              <span className="px-2 py-1 rounded-xl bg-orange-600 text-white font-mono text-xs font-black border border-orange-400 animate-bounce">
                🔥 x{combo}
              </span>
            )}

            <span className="px-2.5 py-1 rounded-xl bg-emerald-900/90 text-emerald-200 font-mono text-xs font-black border border-emerald-500/50">
              +{bonusScore} pts
            </span>
          </div>
        </div>

        {/* Barre de progression du temps de la manche */}
        <div className="w-full bg-[#18233a] h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft > currentLevelTime * 0.4
                ? 'bg-emerald-400'
                : timeLeft > currentLevelTime * 0.2
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${(timeLeft / currentLevelTime) * 100}%` }}
          />
        </div>

        {/* Indicateur des 12 mots / 6 paires */}
        <div className="flex items-center justify-between text-xs text-gray-300 font-mono font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
            <span>
              Paires validées : <strong className="text-white font-bold">{matched.length}</strong> / 6
            </span>
          </span>
          <span className="text-amber-300 font-bold">
            {matched.length * 2} / 12 Mots associés
          </span>
        </div>
      </div>

      {/* Bandeau d'instruction & Feedback Visuel Erreur */}
      <div>
        {wrongPair ? (
          <div className="p-2.5 rounded-xl bg-rose-900 border-2 border-rose-400 text-white text-xs font-bold text-center animate-shake flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>Pas la bonne association ! Retente ta chance.</span>
          </div>
        ) : (
          <div className="text-center py-0.5">
            <p className="text-xs text-gray-200 font-medium">
              Clique sur un mot anglais à gauche <span className="text-amber-300 font-bold">(🇬🇧)</span> puis sur sa traduction à droite <span className="text-amber-300 font-bold">(🇫🇷)</span>.
            </p>
          </div>
        )}
      </div>

      {/* GRILLE DE JEU : 12 MOTS AU TOTAL (6 ANGLAIS + 6 FRANÇAIS) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* COLONNE GAUCHE : ANGLAIS (6 MOTS) */}
        <div className="flex flex-col gap-2">
          <div className="py-1.5 px-2 rounded-xl bg-[#142340] border-2 border-blue-500/50 text-center font-mono text-xs font-black uppercase tracking-wider text-blue-200 shadow-sm flex items-center justify-center gap-1.5">
            <span>🇬🇧</span>
            <span>Anglais (6 mots)</span>
          </div>

          <div className="flex flex-col gap-2">
            {shuffledEn.map((item) => {
              const isMatched = matched.includes(item.en);
              const isSelected = selectedEn === item.en;
              const isWrong = wrongPair && wrongPair.en === item.en;

              return (
                <button
                  key={item.en}
                  disabled={isMatched}
                  type="button"
                  onClick={() => handleEnClick(item.en)}
                  className={`w-full py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all duration-150 text-left flex items-center justify-between gap-2 shadow-md cursor-pointer ${
                    isMatched
                      ? 'bg-[#064e3b] border-2 border-emerald-400 text-white font-extrabold cursor-default opacity-95'
                      : isWrong
                      ? 'bg-[#7f1d1d] border-2 border-rose-400 text-white font-black animate-shake'
                      : isSelected
                      ? 'bg-[#f2ca50] border-2 border-white text-[#0a1120] font-black ring-4 ring-[#ffe088]/50 shadow-[0_0_18px_rgba(242,202,80,0.6)] scale-[1.02]'
                      : 'bg-[#131f36] hover:bg-[#1a2b4b] border-2 border-[#2c3d5e] hover:border-[#f2ca50] text-[#ffffff] font-extrabold'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`material-symbols-outlined text-sm shrink-0 ${
                        isSelected ? 'text-[#0a1120] font-black' : 'text-amber-400'
                      }`}
                    >
                      volume_up
                    </span>
                    <span className="truncate tracking-wide">{item.en}</span>
                  </div>

                  {isMatched && (
                    <span className="material-symbols-outlined text-base text-emerald-300 shrink-0 font-black">
                      check_circle
                    </span>
                  )}
                  {isSelected && !isMatched && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0a1120] animate-ping shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* COLONNE DROITE : FRANÇAIS (6 MOTS) */}
        <div className="flex flex-col gap-2">
          <div className="py-1.5 px-2 rounded-xl bg-[#191e38] border-2 border-indigo-500/50 text-center font-mono text-xs font-black uppercase tracking-wider text-indigo-200 shadow-sm flex items-center justify-center gap-1.5">
            <span>🇫🇷</span>
            <span>Français (6 mots)</span>
          </div>

          <div className="flex flex-col gap-2">
            {shuffledFr.map((item) => {
              const isMatched = matched.includes(item.en);
              const isSelected = selectedFr === item.fr;
              const isWrong = wrongPair && wrongPair.fr === item.fr;

              return (
                <button
                  key={item.fr}
                  disabled={isMatched}
                  type="button"
                  onClick={() => handleFrClick(item.fr)}
                  className={`w-full py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all duration-150 text-left flex items-center justify-between gap-2 shadow-md cursor-pointer ${
                    isMatched
                      ? 'bg-[#064e3b] border-2 border-emerald-400 text-white font-extrabold cursor-default opacity-95'
                      : isWrong
                      ? 'bg-[#7f1d1d] border-2 border-rose-400 text-white font-black animate-shake'
                      : isSelected
                      ? 'bg-[#f2ca50] border-2 border-white text-[#0a1120] font-black ring-4 ring-[#ffe088]/50 shadow-[0_0_18px_rgba(242,202,80,0.6)] scale-[1.02]'
                      : 'bg-[#131f36] hover:bg-[#1a2b4b] border-2 border-[#2c3d5e] hover:border-[#f2ca50] text-[#ffffff] font-extrabold'
                  }`}
                >
                  <span className="truncate tracking-wide">{item.fr}</span>

                  {isMatched && (
                    <span className="material-symbols-outlined text-base text-emerald-300 shrink-0 font-black">
                      check_circle
                    </span>
                  )}
                  {isSelected && !isMatched && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0a1120] animate-ping shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bouton Indice & Affichage */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => {
            sfx.playPop();
            if (selectedEn) {
              const pair = currentQ.pairs.find((p) => p.en === selectedEn);
              if (pair?.hint) setActiveHint(`💡 Indice pour "${pair.en}" : ${pair.hint}`);
            } else {
              const remaining = currentQ.pairs.find((p) => !matched.includes(p.en));
              if (remaining?.hint) {
                setActiveHint(`💡 Indice pour "${remaining.en}" : ${remaining.hint}`);
              }
            }
          }}
          className="text-xs text-[#f2ca50] hover:text-[#ffe088] flex items-center gap-1 font-bold transition-colors cursor-pointer bg-[#18233a] hover:bg-[#233352] px-3 py-1.5 rounded-xl border border-[#334668]"
        >
          <span className="material-symbols-outlined text-sm">lightbulb</span>
          <span>Besoin d'un indice ?</span>
        </button>

        {activeHint && (
          <span className="text-xs text-amber-200 font-medium bg-[#141d33] px-3 py-1.5 rounded-xl border border-amber-400/30 animate-fadeIn">
            {activeHint}
          </span>
        )}
      </div>
    </div>
  );
};

// 2. WORD SCRAMBLE (Anagrammes • 5 Niveaux: Débutant 5q / Intermédiaire 25q / Expert 50q / Expert Avancé 70q / Master 90q • 12 Mots par question)
interface WordScrambleGameProps {
  onSuccess: () => void;
  onError: () => void;
  speak?: (text: string) => void;
  playerLevel: number;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onSuccess, onError, speak, playerLevel }) => {
  // Mode : 'select-level' | 'playing' | 'level-finished'
  const [selectedLevelKey, setSelectedLevelKey] = useState<WordScrambleLevelKey | null>(null);
  const [timerMode, setTimerMode] = useState<'limited' | 'elapsed'>('limited');

  // Questions du niveau actif (chacune contient 12 mots)
  const [questions, setQuestions] = useState<WordScrambleQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Lettres du mot en cours
  const [placedLetters, setPlacedLetters] = useState<Array<{ letter: string; originalIndex: number }>>([]);
  const [availableLetters, setAvailableLetters] = useState<Array<{ letter: string; id: number }>>([]);

  // Stats & Progression
  const [combo, setCombo] = useState(0);
  const [isLevelFinished, setIsLevelFinished] = useState(false);
  const [wordSuccessAnim, setWordSuccessAnim] = useState(false);

  // Chronomètre
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Démarrer un niveau
  const startLevel = (levelKey: WordScrambleLevelKey) => {
    sfx.playPop();
    const config = WORD_SCRAMBLE_LEVELS[levelKey];
    const generated = generateWordScrambleQuestions(levelKey);
    setSelectedLevelKey(levelKey);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setCurrentWordIndex(0);
    setCombo(0);
    setIsLevelFinished(false);
    setTimeLeft(config.timePerQuestionLimited);
    setElapsedTime(0);

    // Initialiser premier mot
    const firstWord = generated[0]?.words[0];
    if (firstWord) {
      setupWord(firstWord);
    }
  };

  // Préparer un mot (mélange garanti non-identique)
  const setupWord = (wordObj: WordScrambleWord) => {
    const scrambled = scrambleLetters(wordObj.word);
    setPlacedLetters([]);
    setAvailableLetters(scrambled.map((letter, idx) => ({ letter, id: idx })));
    setWordSuccessAnim(false);
  };

  // Changement de question ou de mot
  useEffect(() => {
    if (!selectedLevelKey || questions.length === 0 || isLevelFinished) return;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    const currentW = currentQ.words[currentWordIndex];
    if (!currentW) return;
    setupWord(currentW);
  }, [selectedLevelKey, questions, currentQuestionIndex, currentWordIndex, isLevelFinished]);

  // Gestion du chronomètre (temps limité ou temps écoulé)
  useEffect(() => {
    if (!selectedLevelKey || isLevelFinished) return;

    const interval = setInterval(() => {
      if (timerMode === 'limited') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sfx.playWrong();
            onError();
            return WORD_SCRAMBLE_LEVELS[selectedLevelKey].timePerQuestionLimited;
          }
          return prev - 1;
        });
      } else {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedLevelKey, timerMode, isLevelFinished, currentQuestionIndex, currentWordIndex]);

  // Choisir une lettre disponible
  const handlePickLetter = (item: { letter: string; id: number }) => {
    sfx.playPop();
    const currentQ = questions[currentQuestionIndex];
    const currentW = currentQ?.words[currentWordIndex];
    if (!currentW) return;

    const newPlaced = [...placedLetters, { letter: item.letter, originalIndex: item.id }];
    setPlacedLetters(newPlaced);
    setAvailableLetters((prev) => prev.filter((l) => l.id !== item.id));

    // Si toutes les lettres sont placées, vérification
    if (newPlaced.length === currentW.word.length) {
      const spelledWord = newPlaced.map((p) => p.letter).join('');
      if (spelledWord.toUpperCase() === currentW.word.toUpperCase()) {
        sfx.playCorrect();
        setCombo((c) => c + 1);
        setWordSuccessAnim(true);
        if (speak) speak(currentW.word);

        setTimeout(() => {
          // Si on est au dernier mot de la question (12 mots par question)
          if (currentWordIndex >= 11) {
            onSuccess(); // Gagne 10 XP
            // Si c'est la dernière question du niveau
            if (currentQuestionIndex >= questions.length - 1) {
              setIsLevelFinished(true);
            } else {
              setCurrentQuestionIndex((q) => q + 1);
              setCurrentWordIndex(0);
              const nextTime = selectedLevelKey ? WORD_SCRAMBLE_LEVELS[selectedLevelKey].timePerQuestionLimited : 120;
              setTimeLeft(nextTime);
            }
          } else {
            setCurrentWordIndex((w) => w + 1);
          }
        }, 650);
      } else {
        sfx.playWrong();
        onError();
      }
    }
  };

  // Retirer une lettre déjà placée pour la renvoyer aux lettres disponibles
  const handleRemovePlacedLetter = (indexToRemove: number) => {
    sfx.playPop();
    const target = placedLetters[indexToRemove];
    if (!target) return;

    setPlacedLetters((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setAvailableLetters((prev) => [...prev, { letter: target.letter, id: target.originalIndex }].sort((a, b) => a.id - b.id));
  };

  // Réinitialiser le mot en cours
  const handleResetCurrentWord = () => {
    sfx.playPop();
    const currentQ = questions[currentQuestionIndex];
    const currentW = currentQ?.words[currentWordIndex];
    if (currentW) {
      setupWord(currentW);
    }
  };

  // Indice gratuit : place automatiquement la première lettre manquante
  const handleGiveHint = () => {
    sfx.playPop();
    const currentQ = questions[currentQuestionIndex];
    const currentW = currentQ?.words[currentWordIndex];
    if (!currentW) return;

    const neededLetter = currentW.word[placedLetters.length];
    if (!neededLetter) return;

    const matchingAvail = availableLetters.find((a) => a.letter.toUpperCase() === neededLetter.toUpperCase());
    if (matchingAvail) {
      handlePickLetter(matchingAvail);
    }
  };

  // Formater le temps écoulé (ex: 02:45)
  const formatElapsedTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 1. ÉCRAN DE SÉLECTION DU NIVEAU
  if (!selectedLevelKey) {
    return (
      <div className="space-y-6 text-slate-100">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black border border-[#f2ca50] text-[#f2ca50] text-xs font-mono font-bold uppercase tracking-widest shadow-md shadow-black">
            <span className="material-symbols-outlined text-sm">extension</span>
            Système de Niveaux • 12 Mots par Question
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
            Word Scramble — Anagrammes en Folie
          </h3>
          <p className="text-xs text-zinc-300 max-w-lg mx-auto font-sans leading-relaxed">
            Reconstituez les mots anglais avec des lettres à fort contraste en <strong className="text-[#f2ca50] font-mono">orange (#f2ca50)</strong> sur fond sombre. Sélectionnez votre niveau avec nos boutons professionnels noirs.
          </p>
        </div>

        {/* Sélecteur de mode de temps — Boutons noirs professionnels */}
        <div className="flex items-center justify-center gap-2.5 p-1.5 rounded-2xl bg-black border-2 border-zinc-800 max-w-md mx-auto shadow-xl shadow-black/80">
          <button
            type="button"
            onClick={() => setTimerMode('limited')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              timerMode === 'limited'
                ? 'bg-black text-[#f2ca50] border-2 border-[#f2ca50] shadow-md shadow-[#f2ca50]/20'
                : 'bg-black text-zinc-400 hover:text-white border border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>Temps Limité (Chrono)</span>
          </button>
          <button
            type="button"
            onClick={() => setTimerMode('elapsed')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              timerMode === 'elapsed'
                ? 'bg-black text-[#f2ca50] border-2 border-[#f2ca50] shadow-md shadow-[#f2ca50]/20'
                : 'bg-black text-zinc-400 hover:text-white border border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Temps Écoulé (Sans stress)</span>
          </button>
        </div>

        {/* Grille des 5 Niveaux — Boutons en NOIR professionnel et lisible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {(Object.keys(WORD_SCRAMBLE_LEVELS) as WordScrambleLevelKey[]).map((key) => {
            const lvl = WORD_SCRAMBLE_LEVELS[key];
            const isLocked = playerLevel < lvl.requiredPlayerLevel;

            return (
              <button
                key={key}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) startLevel(key);
                }}
                className={`w-full text-left relative rounded-2xl p-5 transition-all border-2 flex flex-col justify-between overflow-hidden shadow-2xl ${
                  isLocked
                    ? 'bg-black/90 border-zinc-900 opacity-60 cursor-not-allowed filter grayscale'
                    : 'bg-black hover:bg-[#0a0a0c] border-zinc-800 hover:border-[#f2ca50] hover:scale-[1.01] cursor-pointer group shadow-black'
                }`}
              >
                {/* Overlay cadenas si verrouillé */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 mb-2 shadow">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Niveau {lvl.requiredPlayerLevel} requis
                    </span>
                    <span className="text-[10px] text-[#f2ca50] mt-1 font-semibold">
                      Atteindre niveau {lvl.requiredPlayerLevel} pour débloquer
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border border-[#f2ca50]/50 bg-black text-[#f2ca50] shadow-sm">
                      {lvl.label}
                    </span>
                    <span className="text-xs font-mono text-[#f2ca50] font-bold">
                      +{lvl.xpReward} XP
                    </span>
                  </div>

                  <h4 className="font-serif font-black text-lg text-white group-hover:text-[#f2ca50] transition-colors">
                    {lvl.questionsCount} Questions • 12 Mots
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1.5 font-sans leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Total : {lvl.questionsCount * 12} mots</span>
                  <div className="px-3 py-1 rounded-xl bg-black border border-[#f2ca50] text-[#f2ca50] group-hover:bg-[#f2ca50] group-hover:text-black font-bold flex items-center gap-1 transition-all shadow-sm">
                    <span>Jouer</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. ÉCRAN DE VICTOIRE DU NIVEAU
  if (isLevelFinished) {
    const config = WORD_SCRAMBLE_LEVELS[selectedLevelKey];
    return (
      <div className="text-center p-8 rounded-2xl bg-black border-2 border-[#f2ca50] shadow-2xl space-y-5 animate-fadeIn max-w-xl mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-black border-2 border-[#f2ca50] p-1 flex items-center justify-center shadow-xl shadow-[#f2ca50]/30 animate-bounce">
          <span className="text-4xl">👑</span>
        </div>
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
            Palier Réussi avec Brio !
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            Niveau {config.label} Terminé
          </h3>
          <p className="text-sm text-zinc-300 mt-2">
            Vous avez déchiffré l'intégralité des <strong>{config.questionsCount} questions</strong> (soit {config.questionsCount * 12} mots au total) !
          </p>
        </div>

        <div className="p-3 bg-black rounded-xl border border-zinc-800 inline-flex items-center gap-4 text-xs font-mono">
          <span className="text-[#f2ca50]">🔥 Combo Max : {combo}</span>
          <span className="text-white">⏱️ {timerMode === 'limited' ? 'Sous Chrono' : `Temps : ${formatElapsedTime(elapsedTime)}`}</span>
          <span className="text-emerald-400 font-bold">+{config.xpReward} XP</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSelectedLevelKey(null)}
            className="px-5 py-2.5 rounded-xl bg-black hover:bg-[#f2ca50] text-[#f2ca50] hover:text-black border-2 border-[#f2ca50] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#f2ca50]/20 transition-all active:scale-95 cursor-pointer"
          >
            Choisir un autre niveau
          </button>
          <button
            type="button"
            onClick={() => startLevel(selectedLevelKey)}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-900 text-white hover:text-[#f2ca50] border-2 border-zinc-700 hover:border-[#f2ca50] font-semibold text-xs transition-all active:scale-95 cursor-pointer"
          >
            Rejouer ce niveau
          </button>
        </div>
      </div>
    );
  }

  // 3. ÉCRAN DE JEU EN COURS
  const currentQ = questions[currentQuestionIndex];
  const currentW = currentQ?.words[currentWordIndex];
  const config = WORD_SCRAMBLE_LEVELS[selectedLevelKey];

  if (!currentQ || !currentW) {
    return <div className="text-center p-8 text-zinc-400">Chargement de la question...</div>;
  }

  const targetChars = currentW.word.split('');

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center select-none">
      {/* Barre d'en-tête de manche */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black border-2 border-zinc-800 text-xs font-mono shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLevelKey(null)}
            className="p-1.5 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 hover:border-[#f2ca50] text-[#f2ca50] transition-colors cursor-pointer"
            title="Revenir au choix des niveaux"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <span className="font-bold text-[#f2ca50]">
            Question {currentQuestionIndex + 1} / {config.questionsCount}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-semibold">
            Mot {currentWordIndex + 1} / 12
          </span>
        </div>

        {/* Chronomètre haute précision */}
        <div className="flex items-center gap-2">
          {timerMode === 'limited' ? (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-mono font-bold ${
              timeLeft <= 10
                ? 'bg-rose-950 text-rose-300 border-2 border-rose-500 animate-pulse'
                : 'bg-black text-[#f2ca50] border-2 border-[#f2ca50]'
            }`}>
              <span className="material-symbols-outlined text-xs">timer</span>
              <span>{timeLeft}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-[#f2ca50] border-2 border-[#f2ca50] font-mono font-bold">
              <span className="material-symbols-outlined text-xs">schedule</span>
              <span>{formatElapsedTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Barre de progression des 12 mots de la question */}
      <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-zinc-800">
        <div
          className="h-full bg-[#f2ca50] transition-all duration-300 shadow-[0_0_10px_#f2ca50]"
          style={{ width: `${((currentWordIndex) / 12) * 100}%` }}
        />
      </div>

      {/* Cartel Indice & Traduction avec Contraste Optimal Fond Sombre / Texte Net */}
      <div className="relative p-5 rounded-2xl bg-black border-2 border-[#f2ca50]/70 shadow-2xl text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black border border-[#f2ca50] text-[#f2ca50] text-[11px] font-mono font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[13px]">lightbulb</span>
            Indice • {currentW.category || 'Vocabulaire'}
          </span>
          {speak && (
            <button
              type="button"
              onClick={() => speak(currentW.word)}
              className="p-1.5 rounded-xl bg-black hover:bg-zinc-900 border border-[#f2ca50] text-[#f2ca50] transition-colors cursor-pointer"
              title="Écouter la prononciation anglaise"
            >
              <span className="material-symbols-outlined text-base">volume_up</span>
            </button>
          )}
        </div>

        <p className="font-serif font-bold text-base sm:text-lg text-white leading-snug">
          {currentW.clue}
        </p>

        <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-sans">
            Sens en français : <strong className="text-[#f2ca50] font-mono font-bold text-base ml-1">{currentW.translation}</strong>
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {targetChars.length} lettres
          </span>
        </div>
      </div>

      {/* CASES CIBLES (Slots) — LETTRES EN ORANGE (#f2ca50) SUR FOND SOMBRE */}
      <div className="space-y-2">
        <div className="text-[11px] text-zinc-400 font-sans">
          Cliquez sur les lettres disponibles • Cliquez sur une lettre pour la retirer :
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap min-h-[64px] p-3 bg-black rounded-2xl border-2 border-zinc-800 shadow-xl">
          {targetChars.map((_, idx) => {
            const placed = placedLetters[idx];

            return (
              <button
                key={idx}
                type="button"
                disabled={!placed}
                onClick={() => handleRemovePlacedLetter(idx)}
                className={`w-12 h-15 sm:w-14 sm:h-17 rounded-xl flex flex-col items-center justify-center transition-all ${
                  placed
                    ? 'bg-black border-2 border-[#f2ca50] text-[#f2ca50] font-mono font-black text-2xl sm:text-3xl shadow-lg shadow-[#f2ca50]/25 hover:border-amber-300 hover:scale-105 cursor-pointer active:scale-95'
                    : 'bg-[#050508] border-2 border-dashed border-[#f2ca50]/40 text-[#f2ca50]/40 font-mono text-xs'
                }`}
                title={placed ? 'Cliquer pour retirer cette lettre' : `Emplacement ${idx + 1}`}
              >
                {placed ? (
                  <span>{placed.letter}</span>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-mono">{idx + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LETTRES DISPONIBLES — LETTRES EN ORANGE (#f2ca50) SUR FOND SOMBRE */}
      <div className="space-y-2">
        <div className="text-xs text-[#f2ca50] font-mono uppercase tracking-wider font-bold">
          Lettres Disponibles :
        </div>

        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap p-4 rounded-2xl bg-black border-2 border-zinc-800 shadow-xl">
          {availableLetters.length > 0 ? (
            availableLetters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePickLetter(item)}
                className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-black hover:bg-zinc-900 border-2 border-[#f2ca50] text-[#f2ca50] hover:text-[#ffe088] font-mono font-black text-2xl sm:text-3xl shadow-lg shadow-[#f2ca50]/15 hover:shadow-[#f2ca50]/30 transition-all active:scale-90 cursor-pointer flex items-center justify-center"
              >
                {item.letter}
              </button>
            ))
          ) : (
            <span className="text-xs text-emerald-400 font-mono font-bold animate-pulse py-2">
              Toutes les lettres sont placées...
            </span>
          )}
        </div>
      </div>

      {/* Boutons d'aide et réinitialisation — Boutons noirs professionnels */}
      <div className="flex items-center justify-center gap-4 pt-1 text-xs">
        <button
          type="button"
          onClick={handleGiveHint}
          disabled={placedLetters.length >= targetChars.length}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 border-2 border-[#f2ca50] text-[#f2ca50] font-bold transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-md shadow-black"
        >
          <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
          <span>Indice (+1 lettre)</span>
        </button>

        <button
          type="button"
          onClick={handleResetCurrentWord}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-black"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Effacer et recommencer</span>
        </button>
      </div>

      {/* Animation flash de succès pour le mot validé */}
      {wordSuccessAnim && (
        <div className="p-3 rounded-xl bg-black border-2 border-emerald-500 text-emerald-400 font-bold text-xs font-mono animate-fadeIn flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40">
          <span>✨</span>
          <span>Mot validé avec succès ! Mot suivant...</span>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// SPEED MENTAL MATH (Calcul Mental Rapide & Nombres en Anglais)
// Mini-jeu simple, sophistiqué et ludique présentant les bases du calcul mental rapide
// =====================================================================

interface SpeedMentalMathGameProps {
  onSuccess: () => void;
  onError: () => void;
  speak?: (text: string) => void;
  playerLevel: number;
}

const SpeedMentalMathGame: React.FC<SpeedMentalMathGameProps> = ({ onSuccess, onError, speak }) => {
  const [problemIndex, setProblemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTrickDetail, setShowTrickDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'cheatsheet'>('play');

  // Timer
  const [timeLeft, setTimeLeft] = useState(25);

  const problem = SPEED_MATH_PROBLEMS[problemIndex % SPEED_MATH_PROBLEMS.length];

  // Décompte
  useEffect(() => {
    if (isAnswered || activeTab !== 'play') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sfx.playWrong();
          onError();
          setIsAnswered(true);
          setIsCorrect(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnswered, activeTab, problemIndex]);

  // Prononcer la question en anglais à l'apparition
  useEffect(() => {
    if (problem && speak && activeTab === 'play') {
      speak(problem.enAudioPhrase);
    }
  }, [problemIndex, activeTab]);

  const handleSelectOption = (opt: number) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === problem.correctAnswer) {
      sfx.playCorrect();
      setIsCorrect(true);
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setShowTrickDetail(true);
      onSuccess(); // +10 XP
    } else {
      sfx.playWrong();
      setIsCorrect(false);
      setStreak(0);
      setShowTrickDetail(true);
      onError(); // -5 XP
    }
  };

  const handleNextProblem = () => {
    sfx.playPop();
    setIsAnswered(false);
    setSelectedOption(null);
    setShowTrickDetail(false);
    setTimeLeft(25);
    setProblemIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-slate-100 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#172554]/40 to-[#0c1322] border-2 border-[#f2ca50]/50 p-5 shadow-2xl text-center">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
            <span className="material-symbols-outlined text-[15px]">calculate</span>
            Speed Mental Math • Calcul Mental Rapide
          </div>

          {/* Onglets Jouer / Fiche Astuces */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#070b14] border border-[#232a3a]">
            <button
              type="button"
              onClick={() => setActiveTab('play')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'play'
                  ? 'bg-[#f2ca50] text-[#1e1b4b] shadow'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Défi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cheatsheet'
                  ? 'bg-[#f2ca50] text-[#1e1b4b] shadow'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Les 6 Astuces Secrètes
            </button>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
          Les Secrets du Calcul Mental Rapide
        </h3>
        <p className="text-xs text-[#cbd5e1] max-w-lg mx-auto font-sans mt-1">
          Maîtrisez les astuces de génie des mathématiciens d'Oxford tout en perfectionnant vos nombres et opérations en anglais.
        </p>

        {/* Stats bar */}
        <div className="mt-4 pt-3 border-t border-[#232a3a] flex items-center justify-around text-xs font-mono">
          <span className="text-[#f2ca50] font-bold">Score : {score} pts</span>
          <span className="text-amber-400">🔥 Série : {streak} d'affilée</span>
          <span className="text-[#38bdf8] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>{timeLeft}s</span>
          </span>
        </div>
      </div>

      {activeTab === 'cheatsheet' ? (
        /* FICHE PÉDAGOGIQUE DES 6 ASTUCES SECRÈTES */
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-[#070b14] border border-[#f2ca50]/40 space-y-3">
            <h4 className="font-serif font-bold text-base text-[#f2ca50] flex items-center gap-2">
              <span className="material-symbols-outlined">menu_book</span>
              Guide Magistral du Calcul Mental Éclair
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#232a3a]">
                <strong className="text-[#ffe088] block font-mono">1. La Règle Magique du 11</strong>
                <p className="text-[#cbd5e1] mt-0.5">
                  Pour multiplier un nombre à 2 chiffres par 11 : additionnez les 2 chiffres et insérez la somme au milieu.
                  <br /><em className="text-[#38bdf8]">Exemple : 35 × 11 ➔ 3 + 5 = 8 ➔ 385 !</em>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#232a3a]">
                <strong className="text-[#ffe088] block font-mono">2. Le Carré des Nombres en 5</strong>
                <p className="text-[#cbd5e1] mt-0.5">
                  Multipliez le premier chiffre par (lui-même + 1) et collez 25 à la fin.
                  <br /><em className="text-[#38bdf8]">Exemple : 25² ➔ 2 × 3 = 6 ➔ 625 !</em>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#232a3a]">
                <strong className="text-[#ffe088] block font-mono">3. Complément Instantané à 100</strong>
                <p className="text-[#cbd5e1] mt-0.5">
                  Faites 9 moins le premier chiffre pour les dizaines, et 10 moins le second pour les unités.
                  <br /><em className="text-[#38bdf8]">Exemple : 100 - 37 ➔ 9-3=6 et 10-7=3 ➔ 63 !</em>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#232a3a]">
                <strong className="text-[#ffe088] block font-mono">4. Doubler et Diviser par Deux</strong>
                <p className="text-[#cbd5e1] mt-0.5">
                  Quand un facteur est difficile (ex: 25 ou 50), doublez-le et prenez la moitié de l'autre !
                  <br /><em className="text-[#38bdf8]">Exemple : 16 × 25 ➔ 8 × 50 = 400 !</em>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#232a3a]">
                <strong className="text-[#ffe088] block font-mono">5. Pourcentages Express (10% + Moitié)</strong>
                <p className="text-[#cbd5e1] mt-0.5">
                  Pour calculer 15% : calculez 10% (décalez la virgule), puis ajoutez sa moitié (5%).
                  <br /><em className="text-[#38bdf8]">Exemple : 15% de 80 ➔ 8 + 4 = 12 !</em>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#232a3a]">
                <strong className="text-[#ffe088] block font-mono">6. L'Arrondi Intelligent (19, 29, 99)</strong>
                <p className="text-[#cbd5e1] mt-0.5">
                  Multipliez par le nombre rond supérieur puis retirez la différence.
                  <br /><em className="text-[#38bdf8]">Exemple : 19 × 7 ➔ (20 × 7) - 7 = 140 - 7 = 133 !</em>
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('play')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#e6b834] text-[#1e1b4b] font-bold text-xs uppercase tracking-wider shadow"
              >
                Mettre en pratique dans le Défi
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* DÉFI MATHÉMATIQUE INTERACTIF */
        <div className="space-y-5 animate-fadeIn">
          {/* Question Box */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#080d19] border-2 border-[#f2ca50]/40 shadow-xl text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#7dd3fc] text-[11px] font-mono font-bold">
                {problem.frContext}
              </span>

              {speak && (
                <button
                  type="button"
                  onClick={() => speak(problem.enAudioPhrase)}
                  className="p-1.5 rounded-full bg-[#151f33] hover:bg-[#1e2d4a] text-[#f2ca50] transition-colors"
                  title="Réécouter la question en anglais"
                >
                  <span className="material-symbols-outlined text-base">volume_up</span>
                </button>
              )}
            </div>

            {/* Grande Formule Mathématique */}
            <div className="py-2">
              <span className="font-mono font-black text-4xl sm:text-5xl text-[#f2ca50] tracking-wider drop-shadow-[0_2px_12px_rgba(242,202,80,0.3)]">
                {problem.expression} = ?
              </span>
            </div>

            {/* Question formulée en anglais */}
            <p className="font-serif italic text-base sm:text-lg text-slate-200">
              "{problem.enQuestion}"
            </p>
          </div>

          {/* Choix Multiples (4 options) */}
          <div className="grid grid-cols-2 gap-3">
            {problem.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === problem.correctAnswer;

              let btnStyle = 'bg-[#0e172a] hover:bg-[#182337] border-2 border-[#232a3a] text-white hover:border-[#f2ca50]/60';
              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] font-black scale-[1.02]';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-rose-950/80 border-2 border-rose-500 text-rose-300 font-bold';
                } else {
                  btnStyle = 'bg-[#0a0f1d] border border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-xl font-mono text-xl sm:text-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Révélation Pédagogique de l'Astuce de Calcul Mental */}
          {showTrickDetail && (
            <div className={`p-4 rounded-2xl border-2 animate-fadeIn space-y-2 ${
              isCorrect ? 'bg-emerald-950/60 border-emerald-500/70' : 'bg-rose-950/60 border-rose-500/70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#f2ca50]">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  {problem.trickTitle}
                </span>
                <span className="text-xs font-mono font-black text-white">
                  Réponse exacte : {problem.correctAnswer}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                💡 <strong className="text-white">L'astuce magique :</strong> {problem.trickRule}
              </p>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={handleNextProblem}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#e6b834] text-[#1e1b4b] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Question Suivante ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// 3. WORD SEARCH (Mots Mêlés)
const WordSearchGame: React.FC<{ onSuccess: () => void; onError?: () => void }> = ({ onSuccess }) => {
  const puzzle = WORD_SEARCH_PUZZLE;
  const [foundWords, setFoundWords] = useState<string[]>([]);

  const handleWordFound = (word: string) => {
    sfx.playCorrect();
    const next = [...foundWords, word];
    setFoundWords(next);
    if (next.length >= 3) {
      setTimeout(onSuccess, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-xs text-[#f2ca50] font-mono">
        Clique sur un mot caché pour le valider ({foundWords.length}/3 trouvés)
      </div>

      <div className="grid grid-cols-7 gap-1 max-w-[280px] mx-auto bg-[#0c1322] p-2.5 rounded-2xl border border-[#232a3a]">
        {puzzle.grid.map((row, rIdx) =>
          row.map((char, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className="w-8 h-8 rounded-lg bg-[#191f2f] flex items-center justify-center font-mono font-bold text-xs text-white"
            >
              {char}
            </div>
          ))
        )}
      </div>

      {/* Word bank buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {puzzle.words.slice(0, 4).map((w) => {
          const isFound = foundWords.includes(w.word);
          return (
            <button
              key={w.word}
              type="button"
              disabled={isFound}
              onClick={() => handleWordFound(w.word)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                isFound
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 line-through'
                  : 'bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-amber-300'
              }`}
            >
              {w.word} ({w.fr})
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 4. VERB MASTER
const VerbMasterGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = VERB_MASTER_ITEMS[0]; // Go -> Went -> Gone
  const [step, setStep] = useState<'preterite' | 'participle'>('preterite');
  const [preteriteSelected, setPreteriteSelected] = useState<string | null>(null);

  const handlePreteriteChoice = (choice: string) => {
    sfx.playPop();
    if (choice === item.preteriteCorrect) {
      setPreteriteSelected(choice);
      setStep('participle');
    } else {
      onError();
    }
  };

  const handleParticipleChoice = (choice: string) => {
    sfx.playPop();
    if (choice === item.participleCorrect) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-rose-500/30">
        <span className="text-[10px] text-rose-400 font-mono uppercase block">INFINITIF DONNÉ</span>
        <h4 className="font-serif font-black text-2xl text-white mt-1">
          {item.infinitive}
        </h4>
        <span className="text-xs text-[#99907c]">({item.translation})</span>
      </div>

      {step === 'preterite' ? (
        <div className="space-y-2">
          <p className="text-xs text-[#f2ca50] font-bold">Étape 1 : Choisis le Prétérit</p>
          <div className="grid grid-cols-3 gap-2">
            {item.preteriteOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handlePreteriteChoice(opt)}
                className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] font-bold text-xs text-white"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-bold">
            ✓ Prétérit : {preteriteSelected} | Étape 2 : Choisis le Participe Passé
          </p>
          <div className="grid grid-cols-3 gap-2">
            {item.participleOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleParticipleChoice(opt)}
                className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] font-bold text-xs text-white"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 5. ASTRO HANGMAN
const AstroHangmanGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = HANGMAN_WORDS[0]; // PLANET
  const [guessed, setGuessed] = useState<string[]>([]);
  const keyboard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleGuess = (letter: string) => {
    sfx.playPop();
    const next = [...guessed, letter];
    setGuessed(next);
    if (!item.word.includes(letter)) {
      onError();
    } else {
      const allFound = item.word.split('').every((l) => next.includes(l));
      if (allFound) {
        sfx.playCorrect();
        setTimeout(onSuccess, 400);
      }
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-3 bg-[#0c1322] rounded-xl border border-indigo-500/20">
        <span className="text-[10px] text-indigo-400 font-mono block">INDICE DE MISSION</span>
        <p className="text-xs text-[#dce2f8]">{item.hint}</p>
      </div>

      <div className="flex items-center justify-center gap-2 py-3">
        {item.word.split('').map((char, idx) => (
          <div
            key={idx}
            className="w-9 h-11 border-b-2 border-[#f2ca50] flex items-center justify-center font-mono font-black text-xl text-white"
          >
            {guessed.includes(char) ? char : ''}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center max-w-sm mx-auto">
        {keyboard.map((l) => {
          const used = guessed.includes(l);
          return (
            <button
              key={l}
              disabled={used}
              type="button"
              onClick={() => handleGuess(l)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                used
                  ? 'opacity-20 bg-gray-800 text-gray-500'
                  : 'bg-[#191f2f] hover:bg-[#232a3a] text-white border border-[#232a3a]'
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 6. SENTENCE BUILDER (Duolingo Style)
const SentenceBuilderGame: React.FC<{ onSuccess: () => void; onError: () => void; speak: (text: string) => void }> = ({
  onSuccess,
  onError,
  speak
}) => {
  const item = SENTENCE_BUILDER_ITEMS[0];
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [poolTokens, setPoolTokens] = useState<string[]>([
    'music', 'She', 'every', 'day.', 'listens', 'to'
  ]);

  const handleAddToken = (token: string, idx: number) => {
    sfx.playPop();
    setSelectedTokens([...selectedTokens, token]);
    const nextPool = [...poolTokens];
    nextPool.splice(idx, 1);
    setPoolTokens(nextPool);
  };

  const handleRemoveToken = (token: string, idx: number) => {
    sfx.playPop();
    const nextSelected = [...selectedTokens];
    nextSelected.splice(idx, 1);
    setSelectedTokens(nextSelected);
    setPoolTokens([...poolTokens, token]);
  };

  const handleValidate = () => {
    const constructed = selectedTokens.join(' ');
    const target = item.targetTokens.join(' ');
    if (constructed === target) {
      sfx.playCorrect();
      speak(constructed);
      setTimeout(onSuccess, 500);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-[#0c1322] rounded-2xl border border-green-500/20 text-center">
        <span className="text-[10px] text-green-400 font-mono uppercase block">TRADUIS CETTE PHRASE</span>
        <p className="font-serif font-bold text-base text-white mt-1">{item.french}</p>
      </div>

      {/* Assembly Area */}
      <div className="min-h-[56px] p-3 rounded-2xl bg-[#191f2f]/80 border-2 border-dashed border-[#232a3a] flex flex-wrap gap-2 items-center">
        {selectedTokens.length === 0 ? (
          <span className="text-xs text-[#99907c] italic">Clique sur les blocs ci-dessous pour assembler la phrase...</span>
        ) : (
          selectedTokens.map((tok, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRemoveToken(tok, idx)}
              className="px-3 py-1.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {tok}
            </button>
          ))
        )}
      </div>

      {/* Word Pool */}
      <div className="flex flex-wrap gap-2 justify-center">
        {poolTokens.map((tok, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAddToken(tok, idx)}
            className="px-3.5 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-white font-bold text-xs transition-all active:scale-95 shadow cursor-pointer"
          >
            {tok}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={selectedTokens.length === 0}
        onClick={handleValidate}
        className="w-full py-3 rounded-2xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all disabled:opacity-50"
      >
        Valider la phrase
      </button>
    </div>
  );
};

// 7. AUDIO BLITZ
const AudioBlitzGame: React.FC<{ onSuccess: () => void; onError: () => void; speak: (text: string) => void }> = ({
  onSuccess,
  onError,
  speak
}) => {
  const item = AUDIO_BLITZ_ITEMS[0];

  useEffect(() => {
    speak(item.audioText);
  }, []);

  const handleChoice = (idx: number) => {
    sfx.playPop();
    if (idx === item.correctIndex) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-purple-500/20">
        <button
          type="button"
          onClick={() => speak(item.audioText)}
          className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined text-3xl">volume_up</span>
        </button>
        <span className="text-[11px] text-[#f2ca50] font-mono mt-2 block">
          Clique pour réécouter la phrase
        </span>
      </div>

      <div className="space-y-2">
        {item.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChoice(idx)}
            className="w-full p-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-semibold text-white text-left transition-all active:scale-98"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 8. SYNONYM & ANTONYM CLASH
const AntonymSynonymGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = ANTONYM_SYNONYM_ITEMS[0];

  const handlePick = (choice: string) => {
    sfx.playPop();
    if (choice === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-blue-500/30">
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase">
          TROUVE LE {item.type}
        </span>
        <h4 className="font-serif font-black text-3xl text-white mt-3">
          "{item.target}"
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handlePick(opt)}
            className="py-3.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-sm font-bold text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 9. ODD ONE OUT (Trouve l'Intrus)
const OddOneOutGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = ODD_ONE_OUT_ITEMS[0];

  const handleChoice = (word: string) => {
    sfx.playPop();
    if (word === item.odd) {
      sfx.playCorrect();
      setTimeout(onSuccess, 500);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-3 bg-[#0c1322] rounded-xl border border-teal-500/20">
        <p className="text-xs text-[#dce2f8]">
          Trouve le mot qui n'appartient pas à la même catégorie sémantique :
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {item.words.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => handleChoice(w)}
            className="py-4 rounded-2xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-sm font-bold text-white shadow transition-all active:scale-95"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
};

// 10. FILL THE BLANK
const FillTheBlankGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = FILL_THE_BLANK_ITEMS[0];

  const handleChoice = (opt: string) => {
    sfx.playPop();
    if (opt === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-orange-500/30">
        <span className="text-[10px] text-orange-400 font-mono block">COMPLÈTE LA PHRASE</span>
        <p className="font-serif font-bold text-lg text-white mt-2">
          {item.sentence}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] font-bold text-sm text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 11. TRUE OR FALSE
const TrueOrFalseGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = TRUE_OR_FALSE_ITEMS[0];

  const handleAnswer = (choice: boolean) => {
    sfx.playPop();
    if (choice === item.isTrue) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-5 text-center">
      <div className="p-5 bg-[#0c1322] rounded-2xl border border-emerald-500/30">
        <span className="text-[10px] text-emerald-400 font-mono block mb-2">VRAI OU FAUX ?</span>
        <p className="font-serif text-base text-white leading-relaxed">
          {item.statement}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-95"
        >
          ✓ Vrai
        </button>
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          className="py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-95"
        >
          ✗ Faux
        </button>
      </div>
    </div>
  );
};

// 12. MEMORY PAIRS
const MemoryPairsGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const cards = [
    { id: '1-en', text: 'Sun', matchId: '1' },
    { id: '2-en', text: 'Moon', matchId: '2' },
    { id: '1-fr', text: 'Soleil', matchId: '1' },
    { id: '2-fr', text: 'Lune', matchId: '2' },
    { id: '3-en', text: 'Star', matchId: '3' },
    { id: '3-fr', text: 'Étoile', matchId: '3' }
  ];

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  const handleCardClick = (idx: number) => {
    if (flipped.includes(idx) || flipped.length === 2) return;
    sfx.playPop();
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const card1 = cards[nextFlipped[0]];
      const card2 = cards[nextFlipped[1]];
      if (card1.matchId === card2.matchId) {
        sfx.playCorrect();
        const nextMatched = [...matchedPairs, card1.matchId];
        setMatchedPairs(nextMatched);
        setFlipped([]);
        if (nextMatched.length === 3) {
          setTimeout(onSuccess, 500);
        }
      } else {
        onError();
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="space-y-4 text-center">
      <span className="text-xs text-[#f2ca50] font-mono">
        Retrouve les 3 paires cachées
      </span>
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matchedPairs.includes(card.matchId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(idx)}
              className={`h-20 rounded-2xl font-bold text-xs flex items-center justify-center p-2 transition-all duration-300 ${
                isFlipped
                  ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md scale-102'
                  : 'bg-[#191f2f] border border-[#232a3a] text-amber-500/40 hover:bg-[#232a3a]'
              }`}
            >
              {isFlipped ? card.text : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 13. BEAT THE CLOCK (60s Chrono)
const BeatTheClockGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const current = BEAT_THE_CLOCK_WORDS[currentIndex % BEAT_THE_CLOCK_WORDS.length];

  const handleChoice = (opt: string) => {
    sfx.playPop();
    if (opt === current.correct) {
      sfx.playCorrect();
      setScore((s) => s + 1);
      setCurrentIndex((i) => i + 1);
      if (score >= 4) {
        setTimeout(onSuccess, 300);
      }
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-between px-2 text-xs font-mono font-bold">
        <span className="text-rose-400">⏱️ {timeLeft}s restantes</span>
        <span className="text-emerald-400">Score: {score}/5</span>
      </div>

      <div className="p-4 bg-[#0c1322] rounded-2xl border border-red-500/30">
        <span className="text-[10px] text-[#99907c] font-mono block">TRADUIS VITE</span>
        <h4 className="font-serif font-black text-3xl text-white mt-1">{current.en}</h4>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {current.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-bold text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 14. WORD SNAKE
const WordSnakeGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = WORD_SNAKE_CHAINS[0];

  const handleChoice = (word: string) => {
    sfx.playPop();
    if (word === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-lime-500/30">
        <span className="text-[10px] text-lime-400 font-mono block">MOT PRÉCÉDENT</span>
        <h4 className="font-serif font-black text-2xl text-white mt-1">
          {item.current.slice(0, -1)}
          <span className="text-[#f2ca50] underline font-extrabold">{item.lastLetter}</span>
        </h4>
        <p className="text-xs text-[#99907c] mt-1">
          Trouve le mot qui commence par <strong>"{item.lastLetter}"</strong> !
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="py-3.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-mono font-bold text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 15. RIDDLE SOLVER
const RiddleSolverGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = RIDDLE_ITEMS[0];

  const handleChoice = (opt: string) => {
    sfx.playPop();
    if (opt === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-yellow-500/30">
        <span className="text-[10px] text-yellow-400 font-mono block mb-1">ÉNIGME MYSTÈRE</span>
        <p className="font-serif text-sm sm:text-base text-white leading-relaxed italic">
          "{item.riddle}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-bold text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 16. TONE DETECTOR
const ToneDetectorGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = TONE_DETECTOR_ITEMS[0];

  const handleChoice = (choice: string) => {
    sfx.playPop();
    if (choice === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-pink-500/30">
        <span className="text-[10px] text-pink-400 font-mono block mb-1">ANALYSE DU TON</span>
        <p className="font-serif text-sm text-white italic leading-relaxed">
          {item.quote}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-bold text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 17. UK VS US MATCH
const UkVsUsGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = UK_VS_US_ITEMS[0];

  const handleChoice = (opt: string) => {
    sfx.playPop();
    if (opt === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-sky-500/30">
        <span className="text-[10px] text-sky-400 font-mono block">ROYAUME-UNI</span>
        <h4 className="font-serif font-black text-2xl text-white mt-1">{item.uk}</h4>
        <span className="text-xs text-[#99907c] mt-1 block">Quel est l'équivalent américain ?</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="py-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-bold text-white transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 18. IDIOM HUNTER
const IdiomHunterGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = IDIOM_HUNTER_ITEMS[0];

  const handleChoice = (opt: string) => {
    sfx.playPop();
    if (opt === item.correct) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-amber-600/30">
        <span className="text-[10px] text-amber-400 font-mono block">EXPRESSION IDIOMATIQUE</span>
        <h4 className="font-serif font-black text-2xl text-white mt-1">"{item.idiom}"</h4>
        <p className="text-xs text-[#99907c] mt-1 italic">Exemple : {item.example}</p>
      </div>

      <div className="space-y-2">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="w-full p-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-bold text-white text-left transition-all active:scale-98"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// 19. SPELLING BEE
const SpellingBeeGame: React.FC<{ onSuccess: () => void; onError: () => void; speak: (text: string) => void }> = ({
  onSuccess,
  onError,
  speak
}) => {
  const item = SPELLING_BEE_ITEMS[0]; // BEAUTIFUL
  const [typed, setTyped] = useState('');

  useEffect(() => {
    speak(item.word);
  }, []);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (typed.trim().toUpperCase() === item.word) {
      sfx.playCorrect();
      setTimeout(onSuccess, 400);
    } else {
      onError();
    }
  };

  return (
    <form onSubmit={handleValidate} className="space-y-4 text-center">
      <div className="p-4 bg-[#0c1322] rounded-2xl border border-emerald-600/30">
        <button
          type="button"
          onClick={() => speak(item.word)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/40 transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined text-2xl">volume_up</span>
        </button>
        <span className="text-xs text-emerald-400 font-mono mt-2 block">
          Écoute le mot ({item.phonetic})
        </span>
        <p className="text-xs text-[#99907c] mt-0.5">Indice : {item.clue}</p>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value.toUpperCase())}
          placeholder="Tape l'orthographe exacte..."
          className="w-full px-4 py-3 rounded-xl bg-[#191f2f] border border-[#232a3a] text-center font-mono font-bold text-base text-white tracking-widest focus:outline-none focus:border-[#f2ca50]"
          autoFocus
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-black text-xs uppercase tracking-wider shadow-md"
        >
          Vérifier l'orthographe
        </button>
      </div>
    </form>
  );
};

// 20. DUOLINGO BOSS BATTLE
const BossBattleGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [bossHp, setBossHp] = useState(100);

  const round = BOSS_BATTLE_ROUNDS[currentRound];

  const handleChoice = (opt: string) => {
    sfx.playPop();
    if (opt === round.correct) {
      sfx.playCorrect();
      const newHp = Math.max(0, bossHp - round.damage);
      setBossHp(newHp);

      if (currentRound + 1 >= BOSS_BATTLE_ROUNDS.length || newHp <= 0) {
        setTimeout(onSuccess, 500);
      } else {
        setCurrentRound((r) => r + 1);
      }
    } else {
      onError();
    }
  };

  return (
    <div className="space-y-4 text-center">
      {/* Boss Health Bar */}
      <div className="p-3 bg-[#0c1322] rounded-2xl border border-yellow-500/40">
        <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
          <span className="text-yellow-400">👑 GARDIEN SUPRÊME</span>
          <span className="text-rose-400 font-mono">{bossHp} / 100 HP</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-rose-500 transition-all duration-300"
            style={{ width: `${bossHp}%` }}
          />
        </div>
      </div>

      <div className="p-4 bg-[#191f2f] rounded-2xl border border-white/5">
        <span className="text-[10px] text-[#f2ca50] font-mono block">
          ROUND {currentRound + 1} / {BOSS_BATTLE_ROUNDS.length}
        </span>
        <h4 className="font-serif font-bold text-sm sm:text-base text-white mt-1">
          {round.prompt}
        </h4>
      </div>

      <div className="space-y-2">
        {round.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChoice(opt)}
            className="w-full p-3 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-bold text-white text-left transition-all active:scale-98"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
