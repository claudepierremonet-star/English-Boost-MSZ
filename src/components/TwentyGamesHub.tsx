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
  BOSS_BATTLE_ROUNDS
} from '../data/twentyGamesData';

interface TwentyGamesHubProps {
  onXpEarned?: (xp: number) => void;
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

export const TwentyGamesHub: React.FC<TwentyGamesHubProps> = ({ onXpEarned, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<MiniGameMeta | null>(null);
  const [howToPlayModal, setHowToPlayModal] = useState<MiniGameMeta | null>(null);

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

  const handleLaunchGame = (game: MiniGameMeta) => {
    sfx.playPop();
    setActiveGame(game);
    setHearts(3);
    setShowWinModal(false);
  };

  const handleVictory = (bonusXp: number) => {
    sfx.playWin();
    setSessionScore((prev) => prev + bonusXp);
    setStreak((prev) => prev + 1);
    setShowWinModal(true);
    if (onXpEarned) {
      onXpEarned(bonusXp);
    }
  };

  const handleHeartLost = () => {
    sfx.playWrong();
    setHearts((prev) => {
      const next = Math.max(0, prev - 1);
      return next;
    });
  };

  // Filtrage des 20 jeux
  const filteredGames = TWENTY_GAMES_METADATA.filter((game) => {
    if (selectedFilter === 'all') return true;
    return game.category === selectedFilter;
  });

  return (
    <div className="w-full min-h-screen bg-[#0c1322] text-[#dce2f8] px-4 sm:px-6 py-6 pb-24">
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
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`group relative rounded-2xl p-4.5 bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
          >
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${game.badgeColor} mt-0.5 w-fit`}>
                      {game.difficulty}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
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
                onClick={() => handleLaunchGame(game)}
                className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>Jouer</span>
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>
        ))}
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
                  <div className="text-5xl mb-3">💔</div>
                  <h4 className="font-serif font-bold text-xl text-white mb-2">
                    Partie terminée !
                  </h4>
                  <p className="text-xs text-[#d0c5af] mb-6 max-w-xs mx-auto">
                    Ne te décourage pas, l'erreur fait partie de l'apprentissage ! Retente ta chance pour maîtriser ce défi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setHearts(3);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe088]"
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

            <div className="p-4 rounded-2xl bg-[#0c1322] border border-[#f2ca50]/30 mb-5">
              <div className="flex items-center justify-around">
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
            </div>

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
}

const ActiveGameRenderer: React.FC<ActiveGameRendererProps> = ({
  gameId,
  onSuccess,
  onError,
  speak
}) => {
  switch (gameId) {
    case 'speed-match':
      return <SpeedMatchGame onSuccess={onSuccess} onError={onError} speak={speak} />;
    case 'word-scramble':
      return <WordScrambleGame onSuccess={onSuccess} onError={onError} />;
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
}

const SpeedMatchGame: React.FC<SpeedMatchGameProps> = ({ onSuccess, onError, speak }) => {
  // Mode : 'select-level' ou 'playing' ou 'level-completed'
  const [selectedLevelKey, setSelectedLevelKey] = useState<SpeedMatchLevelKey | null>(null);

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
      setBonusScore((prev) => prev + points);

      // Si les 6 paires de la question sont validées (12 mots au total)
      if (newMatched.length === currentQ.pairs.length) {
        if (currentQuestionIndex + 1 < questions.length) {
          // Question suivante
          setTimeout(() => {
            sfx.playWin();
            setCurrentQuestionIndex((prev) => prev + 1);
          }, 500);
        } else {
          // Toutes les questions du niveau sont réussies !
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
            Choisis ton niveau de défi :
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {(['debutant', 'intermediaire', 'avance'] as SpeedMatchLevelKey[]).map((key) => {
              const lvl = SPEED_MATCH_LEVELS[key];
              const isDebutant = key === 'debutant';
              const isInter = key === 'intermediaire';

              return (
                <div
                  key={key}
                  className={`relative p-4 rounded-2xl flex flex-col justify-between border-2 transition-all duration-200 group bg-[#11192a] hover:bg-[#16233b] ${
                    isDebutant
                      ? 'border-emerald-500/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : isInter
                      ? 'border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'border-rose-500/50 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  }`}
                >
                  <div>
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

                  <button
                    type="button"
                    onClick={() => startLevel(key)}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isDebutant
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 hover:shadow-emerald-500/40'
                        : isInter
                        ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-stone-950 hover:shadow-amber-500/40'
                        : 'bg-rose-500 hover:bg-rose-400 text-white hover:shadow-rose-500/40'
                    }`}
                  >
                    <span>Jouer ce niveau</span>
                    <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
                  </button>
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

// 2. WORD SCRAMBLE
const WordScrambleGame: React.FC<{ onSuccess: () => void; onError: () => void }> = ({ onSuccess, onError }) => {
  const item = WORD_SCRAMBLE_ITEMS[0]; // FRIEND
  const target = item.word.split('');
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(['I', 'F', 'D', 'R', 'N', 'E']);

  const handlePickLetter = (letter: string, index: number) => {
    sfx.playPop();
    const newPlaced = [...placed, letter];
    setPlaced(newPlaced);
    const newAvail = [...available];
    newAvail.splice(index, 1);
    setAvailable(newAvail);

    if (newPlaced.length === target.length) {
      if (newPlaced.join('') === item.word) {
        sfx.playCorrect();
        setTimeout(onSuccess, 400);
      } else {
        onError();
      }
    }
  };

  const handleReset = () => {
    setPlaced([]);
    setAvailable(['I', 'F', 'D', 'R', 'N', 'E']);
  };

  return (
    <div className="space-y-5 text-center">
      <div className="p-3 bg-[#0c1322] rounded-xl border border-white/5">
        <span className="text-[10px] text-[#f2ca50] font-mono block">INDICE</span>
        <p className="text-xs text-[#dce2f8] font-medium">{item.clue}</p>
        <span className="text-xs text-[#99907c]">Traduction : {item.translation}</span>
      </div>

      {/* Slots */}
      <div className="flex items-center justify-center gap-2">
        {target.map((_, idx) => (
          <div
            key={idx}
            className={`w-10 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg border-2 ${
              placed[idx]
                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md'
                : 'bg-[#191f2f] border-dashed border-[#232a3a] text-transparent'
            }`}
          >
            {placed[idx] || '_'}
          </div>
        ))}
      </div>

      {/* Available letters */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {available.map((letter, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePickLetter(letter, idx)}
            className="w-11 h-11 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-white font-mono font-bold text-base transition-all active:scale-95 cursor-pointer shadow"
          >
            {letter}
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[#99907c] hover:text-[#f2ca50] underline cursor-pointer"
        >
          Effacer et recommencer
        </button>
      </div>
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
