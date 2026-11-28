import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type {
  CEFRLevel,
  SmartMemoryDuelMode,
  SmartMemoryDuelRoom,
  SmartMemoryLearningMode,
  SmartMemoryRecord
} from '../firebase/types';
import { recordAttempt, saveSmartMemoryRecord } from '../firebase/client';
import {
  SMART_MEMORY_CATALOG,
  type SmartMemoryCatalogItem
} from '../data/smartMemoryBank';
import { computeAdaptiveSmartMemorySchedule, getUserTimezone } from '../utils/smartMemoryEngine';
import {
  buildDuelCardExercise,
  DUEL_TOTAL_CARDS,
  evaluateDuelOptionSubmission,
  getDuelCardMode,
  normalizeDuelRoomCode,
  selectDuelSpacedRepetitionDeck
} from '../utils/smartMemoryDuelEngine';
import {
  buildDuelInviteUrl,
  resolveDuelParticipantIdentity,
  SmartMemoryDuelSessionClient,
  type DuelParticipantIdentity
} from '../utils/smartMemoryDuelClient';
import { speakText } from '../services/speechService';
import { playVictoryCue } from '../utils/soundEffects';

export interface SmartMemoryDuelPanelProps {
  currentLevel: CEFRLevel;
  userDisplayName: string;
  records: SmartMemoryRecord[];
  accent: 'en-GB' | 'en-US';
  initialDuelCode?: string | null;
  onRecordsUpdated?: (saved: SmartMemoryRecord) => void;
  onXpEarned?: (xp: number) => void;
}

const DUEL_MODE_OPTIONS: Array<{
  id: SmartMemoryDuelMode;
  label: string;
  description: string;
}> = [
  {
    id: 'mixed',
    label: 'Mixte (4 modes)',
    description: 'Alterne traduction EN→FR, FR→EN, QCM et phrases à trous.'
  },
  {
    id: 'en_to_fr',
    label: 'Anglais → Français',
    description: 'Rapidité de compréhension sémantique.'
  },
  {
    id: 'fr_to_en',
    label: 'Français → Anglais',
    description: 'Rappel lexical actif depuis le français.'
  },
  {
    id: 'complete_sentence',
    label: 'Phrases à trous',
    description: 'Utilisation en contexte grammatical authentique.'
  }
];

const CARD_MODE_LABEL: Record<
  Extract<
    SmartMemoryLearningMode,
    'en_to_fr' | 'fr_to_en' | 'multiple_choice' | 'complete_sentence'
  >,
  string
> = {
  en_to_fr: 'EN → FR',
  fr_to_en: 'FR → EN',
  multiple_choice: 'QCM',
  complete_sentence: 'Phrase à trous'
};

export const SmartMemoryDuelPanel: React.FC<SmartMemoryDuelPanelProps> = ({
  currentLevel,
  userDisplayName,
  records,
  accent,
  initialDuelCode = null,
  onRecordsUpdated,
  onXpEarned
}) => {
  const shouldReduceMotion = useReducedMotion();
  const timezone = useMemo(() => getUserTimezone(), []);

  const [playerName, setPlayerName] = useState<string>(() =>
    userDisplayName?.trim() ? userDisplayName.trim() : 'Joueur'
  );
  const identity: DuelParticipantIdentity = useMemo(
    () => resolveDuelParticipantIdentity(playerName),
    [playerName]
  );

  const [selectedMode, setSelectedMode] = useState<SmartMemoryDuelMode>('mixed');
  const [joinCodeInput, setJoinCodeInput] = useState<string>(() =>
    initialDuelCode ? normalizeDuelRoomCode(initialDuelCode) : ''
  );
  const [room, setRoom] = useState<SmartMemoryDuelRoom | null>(null);
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Active Duel Card UI State
  const [lastFeedback, setLastFeedback] = useState<{
    cardIndex: number;
    selectedOptionId: string;
    isCorrect: boolean;
    pointsAwarded: number;
    expectedText: string;
  } | null>(null);

  const clientRef = useRef<SmartMemoryDuelSessionClient | null>(null);
  const cardShownAtRef = useRef<number>(Date.now());
  const recordedAttemptDuelIdRef = useRef<string | null>(null);
  const autoJoinedCodeRef = useRef<string | null>(null);

  const catalogMap = useMemo(() => {
    const map = new Map<string, SmartMemoryCatalogItem>();
    for (const item of SMART_MEMORY_CATALOG) {
      map.set(item.itemId, item);
    }
    return map;
  }, []);

  const recordsMap = useMemo(() => {
    const map = new Map<string, SmartMemoryRecord>();
    for (const r of records) {
      map.set(r.itemId, r);
    }
    return map;
  }, [records]);

  const ensureClient = useCallback(() => {
    if (clientRef.current) return clientRef.current;
    const instance = new SmartMemoryDuelSessionClient({
      onRoomUpdate: (updatedRoom) => {
        setRoom(updatedRoom);
        setErrorMsg(null);
      },
      onConnectionChange: (state) => {
        setConnectionState(state);
      },
      onError: (msg) => {
        setErrorMsg(msg);
      }
    });
    clientRef.current = instance;
    return instance;
  }, []);

  useEffect(() => {
    return () => {
      clientRef.current?.dispose();
      clientRef.current = null;
    };
  }, []);

  const handleCreateDuel = async () => {
    setErrorMsg(null);
    setLastFeedback(null);
    const deck = selectDuelSpacedRepetitionDeck(
      SMART_MEMORY_CATALOG,
      records,
      currentLevel,
      DUEL_TOTAL_CARDS,
      new Date()
    );
    const cardIds = deck.map((c) => c.itemId);
    const client = ensureClient();
    await client.createRoom({
      hostIdentity: identity,
      cefrLevel: currentLevel,
      mode: selectedMode,
      cardIds
    });
  };

  const handleJoinDuel = useCallback(
    async (explicitCode?: string) => {
      setErrorMsg(null);
      setLastFeedback(null);
      const code = normalizeDuelRoomCode(explicitCode ?? joinCodeInput);
      if (!code || code.length < 4) {
        setErrorMsg('Saisissez le code de duel à 6 caractères partagé par votre ami.');
        return;
      }
      const client = ensureClient();
      await client.joinRoom({
        rawDuelCode: code,
        guestIdentity: identity
      });
    },
    [ensureClient, identity, joinCodeInput]
  );

  // Auto-join once when opened from an invite URL (?duel=CODE)
  useEffect(() => {
    if (!initialDuelCode) return;
    const norm = normalizeDuelRoomCode(initialDuelCode);
    if (!norm || autoJoinedCodeRef.current === norm || room) return;
    autoJoinedCodeRef.current = norm;
    setJoinCodeInput(norm);
    handleJoinDuel(norm);
  }, [initialDuelCode, handleJoinDuel, room]);

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotice(label);
      setTimeout(() => setCopiedNotice(null), 2600);
    } catch {
      setCopiedNotice('Copiez manuellement : ' + text);
      setTimeout(() => setCopiedNotice(null), 3600);
    }
  };

  const handleLeaveDuel = () => {
    clientRef.current?.dispose();
    clientRef.current = null;
    setRoom(null);
    setLastFeedback(null);
    setErrorMsg(null);
    setConnectionState('idle');
    recordedAttemptDuelIdRef.current = null;
  };

  const isHost = room ? room.hostUid === identity.uid : false;
  const myAnsweredCount = room
    ? isHost
      ? room.hostAnsweredCount
      : room.guestAnsweredCount
    : 0;

  // Reset card response timer whenever active card index advances
  useEffect(() => {
    if (room?.status === 'active') {
      cardShownAtRef.current = Date.now();
    }
  }, [room?.status, myAnsweredCount]);

  // Persist final XP + LearningAttempt once when duel reaches finished state
  useEffect(() => {
    if (!room || room.status !== 'finished') return;
    if (recordedAttemptDuelIdRef.current === room.duelId) return;
    recordedAttemptDuelIdRef.current = room.duelId;

    const myCorrect = isHost ? room.hostCorrectCount : room.guestCorrectCount;
    const accuracyPct = Math.round((myCorrect / DUEL_TOTAL_CARDS) * 100);
    const totalSec = Math.max(
      10,
      Math.round((isHost ? room.hostTotalTimeMs : room.guestTotalTimeMs) / 1000)
    );
    const won = room.winnerUid === identity.uid;
    const xpBonus = won ? 80 : room.winnerUid === 'draw' ? 60 : 40;

    if (won) {
      playVictoryCue();
    }

    recordAttempt({
      moduleId: `smart_memory_duel_${room.duelId}`,
      moduleType: 'smart_memory',
      title: `Mode Duel (${DUEL_TOTAL_CARDS} cartes) · ${room.duelId}`,
      level: room.cefrLevel,
      score: accuracyPct,
      durationSeconds: totalSec,
      details: {
        duelId: room.duelId,
        mode: room.mode,
        myScore: isHost ? room.hostScore : room.guestScore,
        opponentScore: isHost ? room.guestScore : room.hostScore,
        winnerUid: room.winnerUid
      }
    })
      .then(() => {
        onXpEarned?.(xpBonus);
      })
      .catch(console.warn);
  }, [room, isHost, identity.uid, onXpEarned]);

  const activeCardIndex = room
    ? Math.min(room.cardIds.length - 1, myAnsweredCount)
    : 0;

  const activeCardItem = useMemo(() => {
    if (!room) return null;
    const id = room.cardIds[activeCardIndex];
    return catalogMap.get(id) ?? null;
  }, [room, activeCardIndex, catalogMap]);

  const activeExercise = useMemo(() => {
    if (!room || !activeCardItem) return null;
    return buildDuelCardExercise(
      activeCardItem,
      room.mode,
      activeCardIndex,
      SMART_MEMORY_CATALOG
    );
  }, [room, activeCardItem, activeCardIndex]);

  const handleSelectDuelOption = async (optionId: string) => {
    if (!room || room.status !== 'active' || !activeCardItem || !activeExercise) return;
    if (myAnsweredCount >= room.cardIds.length) return;
    if (lastFeedback && lastFeedback.cardIndex === activeCardIndex) return;

    const responseTimeMs = Math.max(450, Date.now() - cardShownAtRef.current);
    const { isCorrect } = evaluateDuelOptionSubmission({
      item: activeCardItem,
      duelMode: room.mode,
      cardIndex: activeCardIndex,
      selectedOptionId: optionId,
      catalogPool: SMART_MEMORY_CATALOG
    });

    const currentStreak = isHost ? room.hostStreak : room.guestStreak;
    const speedBonus = isCorrect
      ? Math.max(0, Math.min(50, Math.round(50 - (responseTimeMs / 1000) * 3.5)))
      : 0;
    const streakBonus = isCorrect ? Math.min(5, currentStreak) * 15 : 0;
    const pointsAwarded = isCorrect ? 100 + speedBonus + streakBonus : 0;

    setLastFeedback({
      cardIndex: activeCardIndex,
      selectedOptionId: optionId,
      isCorrect,
      pointsAwarded,
      expectedText: activeExercise.expectedText
    });

    // Update this player's real spaced-repetition schedule for the duel item
    const existing = recordsMap.get(activeCardItem.itemId);
    const cardMode = getDuelCardMode(room.mode, activeCardIndex);
    const outcome = !isCorrect
      ? 'incorrect'
      : responseTimeMs < 3500
      ? 'easy'
      : 'correct';
    const nextRecord = computeAdaptiveSmartMemorySchedule(
      activeCardItem,
      existing,
      {
        outcome,
        responseTimeMs,
        confidence: isCorrect ? 3 : 1,
        mode: cardMode
      },
      new Date(),
      timezone
    );
    saveSmartMemoryRecord(nextRecord)
      .then((saved) => onRecordsUpdated?.(saved))
      .catch(console.warn);

    // Clear brief visual feedback after 950ms so card advance feels snappy
    setTimeout(() => {
      setLastFeedback((prev) =>
        prev && prev.cardIndex === activeCardIndex ? null : prev
      );
    }, 950);

    await ensureClient().submitAnswer({
      duelId: room.duelId,
      playerIdentity: identity,
      cardIndex: activeCardIndex,
      selectedOptionId: optionId,
      responseTimeMs
    });
  };

  // ==================== LOBBY VIEW ====================
  if (!room) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#dce2f8]">
              Mode Duel Temps Réel · Série de 10 Cartes
            </h3>
            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Affrontez un ami en direct sur 10 items issus de la révision espacée Smart Memory. Précision, rapidité et régularité alimentent votre score et mettent à jour votre mémoire adaptative.
            </p>
          </div>

          <div className="flex flex-col gap-1 min-w-[200px]">
            <label
              htmlFor="duel-player-name"
              className="text-[11px] font-mono text-[#99907c]"
            >
              Votre nom affiché
            </label>
            <input
              id="duel-player-name"
              type="text"
              maxLength={40}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070e1d] border border-[#232a3a] text-xs text-[#dce2f8] focus:outline-none focus:border-[#f2ca50]"
            />
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl bg-rose-950/40 border border-rose-500/40 px-4 py-3 text-xs text-rose-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Create Duel Salon */}
          <div className="rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#f2ca50]">
                  Créer un Duel
                </span>
                <span className="text-[11px] font-mono text-[#d0c5af] tabular-nums">
                  {DUEL_TOTAL_CARDS} cartes · Niveau {currentLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DUEL_MODE_OPTIONS.map((opt) => {
                  const selected = selectedMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedMode(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#191f2f] border-[#f2ca50] text-[#dce2f8]'
                          : 'bg-[#070e1d] border-[#232a3a] text-[#d0c5af] hover:border-[#f2ca50]/40'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[11px] text-[#99907c] mt-0.5 leading-snug">
                        {opt.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateDuel}
              className="luxury-btn-gold w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">swords</span>
              <span>Créer un salon 10 cartes</span>
            </button>
          </div>

          {/* Join Friend Salon */}
          <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#dce2f8]">
                  Rejoindre un Ami
                </span>
                <span className="text-[11px] text-[#99907c]">
                  Code à 6 caractères
                </span>
              </div>
              <p className="text-xs text-[#d0c5af] leading-relaxed">
                Entrez le code partagé par votre ami ou ouvrez directement son lien d’invitation pour lancer la série synchronisée en temps réel.
              </p>

              <div className="space-y-1.5">
                <label
                  htmlFor="duel-join-code-input"
                  className="text-[11px] font-mono text-[#99907c] block"
                >
                  Code du salon
                </label>
                <input
                  id="duel-join-code-input"
                  type="text"
                  maxLength={12}
                  value={joinCodeInput}
                  onChange={(e) =>
                    setJoinCodeInput(normalizeDuelRoomCode(e.target.value))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && joinCodeInput.trim()) {
                      handleJoinDuel();
                    }
                  }}
                  placeholder="Ex : SM4K9P"
                  className="w-full px-4 py-3 rounded-xl bg-[#070e1d] border border-[#2e3852] text-base font-mono font-bold tracking-widest uppercase text-[#f2ca50] placeholder:text-[#99907c]/50 focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!joinCodeInput.trim()}
              onClick={() => handleJoinDuel()}
              className="luxury-btn-surface w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Rejoindre le duel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== WAITING ROOM VIEW ====================
  if (room.status === 'waiting') {
    const inviteUrl = buildDuelInviteUrl(room.duelId);
    return (
      <div className="rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#f2ca50] font-semibold">
              Salon prêt · En attente d’un ami réel
            </span>
            <h3 className="font-serif text-xl font-bold text-[#dce2f8]">
              Partagez ce code pour démarrer le duel de {DUEL_TOTAL_CARDS} cartes
            </h3>
          </div>

          <button
            type="button"
            onClick={handleLeaveDuel}
            className="luxury-btn-surface px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Annuler
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <div className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-[#99907c]">Code du duel</span>
              <div className="font-mono text-3xl font-bold tracking-[0.22em] text-[#f2ca50] tabular-nums">
                {room.duelId}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(room.duelId, 'Code copié !')}
                className="luxury-btn-gold px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span>Copier le code</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopyText(inviteUrl, 'Lien d’invitation copié !')}
                className="luxury-btn-surface px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                <span>Copier le lien d’invitation</span>
              </button>
            </div>

            {copiedNotice && (
              <span className="text-xs font-mono text-emerald-400">
                {copiedNotice}
              </span>
            )}
          </div>

          <div className="rounded-xl bg-[#070e1d] border border-[#232a3a] p-5 space-y-3">
            <span className="text-xs text-[#99907c] block">
              Participants synchronisés ({connectionState === 'connected' ? 'Connecté en direct' : 'Connexion…'})
            </span>

            <div className="divide-y divide-[#232a3a]">
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-base">
                    check_circle
                  </span>
                  <span className="font-semibold text-[#dce2f8]">{room.hostName}</span>
                </div>
                <span className="font-mono text-emerald-400">Hôte prêt</span>
              </div>

              <div className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-base">
                    hourglass_top
                  </span>
                  <span className="text-[#d0c5af]">Ami invité</span>
                </div>
                <span className="font-mono text-[#99907c]">En attente de connexion…</span>
              </div>
            </div>

            <p className="text-[11px] text-[#99907c] leading-relaxed">
              Dès que votre ami rejoint le salon avec le code <strong className="text-[#dce2f8] font-mono">{room.duelId}</strong> ou le lien partagé, la série de 10 cartes démarre simultanément.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Common participant breakdown for Active & Finished views
  const myName = isHost ? room.hostName : room.guestName || 'Vous';
  const myScore = isHost ? room.hostScore : room.guestScore;
  const myCorrect = isHost ? room.hostCorrectCount : room.guestCorrectCount;
  const myStreak = isHost ? room.hostStreak : room.guestStreak;
  const myBestStreak = isHost ? room.hostBestStreak ?? room.hostStreak : room.guestBestStreak ?? room.guestStreak;
  const myTotalMs = isHost ? room.hostTotalTimeMs : room.guestTotalTimeMs;
  const myAnswers = isHost ? room.hostAnswers : room.guestAnswers;

  const oppName = isHost ? room.guestName || 'Ami' : room.hostName;
  const oppScore = isHost ? room.guestScore : room.hostScore;
  const oppCorrect = isHost ? room.guestCorrectCount : room.hostCorrectCount;
  const oppAnswered = isHost ? room.guestAnsweredCount : room.hostAnsweredCount;
  const oppStreak = isHost ? room.guestStreak : room.hostStreak;
  const oppBestStreak = isHost ? room.guestBestStreak ?? room.guestStreak : room.hostBestStreak ?? room.hostStreak;
  const oppTotalMs = isHost ? room.guestTotalTimeMs : room.hostTotalTimeMs;
  const oppAnswers = isHost ? room.guestAnswers : room.hostAnswers;

  // ==================== FINAL SCOREBOARD VIEW ====================
  if (room.status === 'finished') {
    const iWon = room.winnerUid === identity.uid;
    const isDraw = room.winnerUid === 'draw';
    const outcomeTitle = isDraw
      ? 'Égalité Parfaite !'
      : iWon
      ? 'Victoire au Mode Duel !'
      : `${oppName} remporte ce duel`;
    const xpReward = iWon ? 80 : isDraw ? 60 : 40;

    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-5"
      >
        {/* Winner Header */}
        <div className="rounded-xl bg-[#0c1322] border border-[#f2ca50]/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#f2ca50]">
              <span className="material-symbols-outlined text-base">emoji_events</span>
              <span>Duel {room.duelId} terminé · {DUEL_TOTAL_CARDS} cartes synchronisées</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#dce2f8]">
              {outcomeTitle}
            </h3>
            <p className="text-xs text-[#d0c5af]">
              Vos 10 rappels ont également mis à jour votre calendrier de révision espacée Smart Memory (+{xpReward} XP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLeaveDuel}
              className="luxury-btn-gold px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">replay</span>
              <span>Nouveau Duel</span>
            </button>
          </div>
        </div>

        {/* Head-to-Head Final Scoreboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: `${myName} (Vous)`,
              isWinner: iWon,
              score: myScore,
              correct: myCorrect,
              totalMs: myTotalMs,
              bestStreak: myBestStreak
            },
            {
              label: oppName,
              isWinner: !iWon && !isDraw,
              score: oppScore,
              correct: oppCorrect,
              totalMs: oppTotalMs,
              bestStreak: oppBestStreak
            }
          ].map((player, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-5 border space-y-3 ${
                player.isWinner
                  ? 'bg-[#0c1322] border-[#f2ca50]/60'
                  : 'bg-[#0c1322] border-[#232a3a]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      player.isWinner ? 'text-[#f2ca50]' : 'text-[#99907c]'
                    }`}
                  >
                    {player.isWinner ? 'military_tech' : 'person'}
                  </span>
                  <span className="font-serif text-lg font-bold text-[#dce2f8] truncate">
                    {player.label}
                  </span>
                </div>
                <span className="font-mono text-2xl font-bold text-[#f2ca50] tabular-nums">
                  {player.score} pts
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#232a3a] text-xs font-mono tabular-nums">
                <div>
                  <span className="text-[11px] font-sans text-[#99907c] block">Précision</span>
                  <strong className="text-[#dce2f8] text-sm">
                    {player.correct}/{DUEL_TOTAL_CARDS} ({Math.round((player.correct / DUEL_TOTAL_CARDS) * 100)}%)
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] font-sans text-[#99907c] block">Temps total</span>
                  <strong className="text-[#dce2f8] text-sm">
                    {(player.totalMs / 1000).toFixed(1)}s
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] font-sans text-[#99907c] block">Meilleure série</span>
                  <strong className="text-emerald-400 text-sm">×{player.bestStreak}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Card-by-Card Final Scoreboard Table */}
        <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#232a3a] flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-[#dce2f8]">
              Tableau de Score Détaillé (10 Cartes)
            </h4>
            <span className="text-xs font-mono text-[#99907c]">
              Précision + Bonus Vitesse + Série
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#232a3a] text-[#99907c] font-mono">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Carte</th>
                  <th className="py-2.5 px-4 text-right">{myName}</th>
                  <th className="py-2.5 px-4 text-right">{oppName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232a3a] tabular-nums">
                {room.cardIds.map((cardId, idx) => {
                  const item = catalogMap.get(cardId);
                  const myAns = myAnswers.find((a) => a.cardIndex === idx);
                  const oppAns = oppAnswers.find((a) => a.cardIndex === idx);
                  return (
                    <tr key={`${cardId}-${idx}`} className="hover:bg-[#191f2f]/40">
                      <td className="py-2.5 px-4 font-mono text-[#99907c]">{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#dce2f8]">
                          {item?.english || cardId}
                        </div>
                        <div className="text-[11px] text-[#99907c]">
                          {item?.french || ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {myAns ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              myAns.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {myAns.isCorrect ? 'check_circle' : 'cancel'}
                            </span>
                            <span>
                              +{myAns.pointsAwarded} pts ({(myAns.responseTimeMs / 1000).toFixed(1)}s)
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {oppAns ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              oppAns.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {oppAns.isCorrect ? 'check_circle' : 'cancel'}
                            </span>
                            <span>
                              +{oppAns.pointsAwarded} pts ({(oppAns.responseTimeMs / 1000).toFixed(1)}s)
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  // ==================== ACTIVE DUEL VIEW ====================
  const waitingForFriendToFinish = myAnsweredCount >= room.cardIds.length;
  const activeCardMode = getDuelCardMode(room.mode, activeCardIndex);

  return (
    <div className="space-y-4">
      {/* Real-Time Dual Live Scoreboard Strip */}
      <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Player 1 (Me) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#dce2f8] truncate">
              {myName} (Vous)
              {myStreak >= 2 && (
                <span className="ml-2 text-emerald-400 font-mono">Série ×{myStreak}</span>
              )}
            </span>
            <span className="font-mono font-bold text-[#f2ca50] tabular-nums">
              {myScore} pts · {myAnsweredCount}/{DUEL_TOTAL_CARDS}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#070e1d] overflow-hidden">
            <div
              className="h-full bg-[#f2ca50] rounded-full transition-all duration-300"
              style={{ width: `${(myAnsweredCount / DUEL_TOTAL_CARDS) * 100}%` }}
            />
          </div>
        </div>

        {/* Player 2 (Opponent Live) */}
        <div className="space-y-1.5 md:border-l md:border-[#232a3a] md:pl-4">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#dce2f8] truncate">
              {oppName}
              {oppStreak >= 2 && (
                <span className="ml-2 text-sky-400 font-mono">Série ×{oppStreak}</span>
              )}
            </span>
            <span className="font-mono font-bold text-sky-300 tabular-nums">
              {oppScore} pts · {oppAnswered}/{DUEL_TOTAL_CARDS}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#070e1d] overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${(oppAnswered / DUEL_TOTAL_CARDS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Card Question or Waiting for Opponent Completion */}
      {waitingForFriendToFinish ? (
        <div className="rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 p-8 text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#f2ca50]">
            hourglass_bottom
          </span>
          <h3 className="font-serif text-xl font-bold text-[#dce2f8]">
            Série de 10 cartes terminée ! ({myScore} pts · {myCorrect}/{DUEL_TOTAL_CARDS})
          </h3>
          <p className="text-xs text-[#d0c5af]">
            En attente que <strong className="text-[#dce2f8]">{oppName}</strong> termine sa carte {Math.min(DUEL_TOTAL_CARDS, oppAnswered + 1)}/{DUEL_TOTAL_CARDS} pour afficher le tableau de score final…
          </p>
        </div>
      ) : activeCardItem && activeExercise ? (
        <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#f2ca50] font-bold">
                Carte {activeCardIndex + 1} / {DUEL_TOTAL_CARDS}
              </span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className="text-[#d0c5af]">{CARD_MODE_LABEL[activeCardMode]}</span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className="text-[#99907c]">{activeCardItem.cefrLevel}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                speakText(
                  activeCardItem.english.split('·')[0].trim(),
                  accent,
                  `duel-audio-${activeCardItem.itemId}`
                )
              }
              className="luxury-btn-surface px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                volume_up
              </span>
              <span>Écouter</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {activeExercise.promptEn && (
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#f2ca50]">
                {activeExercise.promptEn}
              </div>
            )}
            <div className="text-sm sm:text-base font-semibold text-[#dce2f8]">
              {activeExercise.promptFr}
            </div>
            {activeExercise.hintText && (
              <div className="text-xs font-mono text-[#99907c]">
                {activeExercise.hintText}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeExercise.options?.map((opt) => {
              const isShowingFeedback = Boolean(
                lastFeedback && lastFeedback.cardIndex === activeCardIndex
              );
              const isSelected =
                isShowingFeedback && lastFeedback?.selectedOptionId === opt.id;
              let btnClass =
                'bg-[#070e1d] border-[#232a3a] text-[#dce2f8] hover:border-[#f2ca50]/60';
              if (isShowingFeedback) {
                if (opt.isCorrect) {
                  btnClass = 'bg-emerald-950/60 border-emerald-400 text-emerald-200';
                } else if (isSelected && !opt.isCorrect) {
                  btnClass = 'bg-rose-950/60 border-rose-400 text-rose-200';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isShowingFeedback}
                  onClick={() => handleSelectDuelOption(opt.id)}
                  className={`min-h-[52px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  <div className="text-xs sm:text-sm font-semibold">{opt.label}</div>
                  {opt.subLabel && (
                    <div className="text-[11px] font-mono text-[#99907c] mt-0.5">
                      {opt.subLabel}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {lastFeedback && lastFeedback.cardIndex === activeCardIndex && (
            <div
              className={`rounded-xl px-4 py-2.5 text-xs font-mono flex items-center justify-between ${
                lastFeedback.isCorrect
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
              }`}
            >
              <span>
                {lastFeedback.isCorrect
                  ? `Exact ! +${lastFeedback.pointsAwarded} pts`
                  : `Réponse : ${lastFeedback.expectedText}`}
              </span>
              <span>Carte suivante…</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
