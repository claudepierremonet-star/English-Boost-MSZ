import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ATELIER_DIALOGUES_500,
  DIALOGUE_THEMES,
  DIALOGUE_FORMATS,
  DIALOGUE_LEVELS,
  getAtelierDialoguesStats,
  type DialogueThemeId,
  type DialogueFormatId,
  type DialogueLevelId,
  type AtelierDialogue,
  type TurnIntent
} from '../data/atelierDialogues500';
import {
  speakText,
  speakFrenchText,
  playDialogueSequence,
  stopSpeech,
  type AccentType
} from '../services/speechService';
import { LessonDictionaryProvider } from './LessonDictionaryContext';
import { InteractiveHighlightText } from './InteractiveHighlightText';
import { VoiceStudioModal } from './VoiceStudioModal';

interface AtelierDialoguesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTheme?: DialogueThemeId | 'all';
  onOpenDialogueFlashcards?: (dialogueNumber?: number) => void;
  onDialogueCompleted?: (dialogueId: string, xpEarned: number) => void;
}

const COMPLETED_STORAGE_KEY = 'eb_msz_atelier_completed_dialogues_v1';
const SAVED_SM2_STORAGE_KEY = 'eb_msz_atelier_pinned_sm2_cards_v1';

const INTENT_STYLES: Record<TurnIntent, { label: string; icon: string; badgeClass: string }> = {
  demande: {
    label: 'DEMANDE / QUESTION',
    icon: 'help',
    badgeClass: 'bg-[#f2ca50]/15 text-[#f2ca50] border-[#f2ca50]/45'
  },
  reponse: {
    label: 'RÉPONSE',
    icon: 'chat_bubble',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/40'
  },
  precision: {
    label: 'PRÉCISION / REBOND',
    icon: 'manage_search',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-400/40'
  },
  conclusion: {
    label: 'ACCORD / CONCLUSION',
    icon: 'verified',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
  }
};

export const AtelierDialoguesModal: React.FC<AtelierDialoguesModalProps> = ({
  isOpen,
  onClose,
  initialTheme = 'all',
  onOpenDialogueFlashcards,
  onDialogueCompleted
}) => {
  const shouldReduceMotion = useReducedMotion();
  const stats = useMemo(() => getAtelierDialoguesStats(), []);

  const [selectedTheme, setSelectedTheme] = useState<DialogueThemeId | 'all'>(initialTheme);
  const [selectedFormat, setSelectedFormat] = useState<DialogueFormatId | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<DialogueLevelId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyCompleted, setOnlyCompleted] = useState<boolean>(false);

  const [activeDialogueId, setActiveDialogueId] = useState<string>(ATELIER_DIALOGUES_500[0]?.id || '');
  const [mobilePane, setMobilePane] = useState<'list' | 'stage'>('list');

  // Audio & Learning helpers
  const [accent, setAccent] = useState<AccentType>('en-GB');
  const [includeFrenchAudio, setIncludeFrenchAudio] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isPlayingFull, setIsPlayingFull] = useState<boolean>(false);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);
  const [showFrenchText, setShowFrenchText] = useState<boolean>(true);
  const [showKeyTips, setShowKeyTips] = useState<boolean>(true);
  const [hiddenSpeakerId, setHiddenSpeakerId] = useState<string | null>(null);
  const [revealedTurnIds, setRevealedTurnIds] = useState<Record<string, boolean>>({});
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const cancelPlaybackRef = useRef<(() => void) | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [pinnedSm2Ids, setPinnedSm2Ids] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(SAVED_SM2_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (initialTheme !== 'all') {
      setSelectedTheme(initialTheme);
    }
  }, [initialTheme]);

  useEffect(() => {
    return () => {
      cancelPlaybackRef.current?.();
      stopSpeech();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  };

  const stopAnyPlayback = () => {
    cancelPlaybackRef.current?.();
    cancelPlaybackRef.current = null;
    stopSpeech();
    setIsPlayingFull(false);
    setActiveTurnIdx(null);
  };

  const filteredDialogues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ATELIER_DIALOGUES_500.filter((d) => {
      if (selectedTheme !== 'all' && d.theme !== selectedTheme) return false;
      if (selectedFormat !== 'all' && d.format !== selectedFormat) return false;
      if (selectedLevel !== 'all' && d.level !== selectedLevel) return false;
      if (onlyCompleted && !completedIds.has(d.id)) return false;
      if (q) {
        const matchNum = String(d.number) === q || `#${d.number}` === q;
        const matchTitle = d.title.toLowerCase().includes(q) || d.titleFr.toLowerCase().includes(q);
        const matchSetting = d.setting.toLowerCase().includes(q);
        const matchTurns = d.turns.some(
          (t) =>
            t.en.toLowerCase().includes(q) ||
            t.fr.toLowerCase().includes(q) ||
            t.keyPhrase.toLowerCase().includes(q)
        );
        return matchNum || matchTitle || matchSetting || matchTurns;
      }
      return true;
    });
  }, [selectedTheme, selectedFormat, selectedLevel, onlyCompleted, searchQuery, completedIds]);

  const activeDialogue: AtelierDialogue = useMemo(() => {
    return (
      filteredDialogues.find((d) => d.id === activeDialogueId) ||
      filteredDialogues[0] ||
      ATELIER_DIALOGUES_500[0]
    );
  }, [filteredDialogues, activeDialogueId]);

  const activeIndexInFiltered = useMemo(() => {
    return Math.max(
      0,
      filteredDialogues.findIndex((d) => d.id === activeDialogue.id)
    );
  }, [filteredDialogues, activeDialogue.id]);

  if (!isOpen) return null;

  const selectDialogue = (dlg: AtelierDialogue) => {
    stopAnyPlayback();
    setActiveDialogueId(dlg.id);
    setHiddenSpeakerId(null);
    setRevealedTurnIds({});
    setMobilePane('stage');
  };

  const handlePlayFullConversation = () => {
    if (isPlayingFull) {
      stopAnyPlayback();
      return;
    }

    setIsPlayingFull(true);
    const turnsPayload = activeDialogue.turns.map((turn, idx) => {
      const spk = activeDialogue.speakers.find((s) => s.id === turn.speakerId);
      const personaId = accent === 'en-GB' ? spk?.ukPersonaId : spk?.usPersonaId;
      return {
        id: `${activeDialogue.id}-seq-${idx}`,
        en: turn.en,
        fr: turn.fr,
        personaId,
        pitchOffset: spk?.pitchOffset ?? 0
      };
    });

    cancelPlaybackRef.current = playDialogueSequence(turnsPayload, accent, {
      includeFrench: includeFrenchAudio,
      rateMultiplier: speechRate,
      onTurnStart: (turnIdx) => setActiveTurnIdx(turnIdx),
      onComplete: () => {
        setIsPlayingFull(false);
        setActiveTurnIdx(null);
        cancelPlaybackRef.current = null;
      },
      onError: () => {
        setIsPlayingFull(false);
        setActiveTurnIdx(null);
        cancelPlaybackRef.current = null;
      }
    });
  };

  const handlePlaySingleTurn = (turnIdx: number) => {
    stopAnyPlayback();
    const turn = activeDialogue.turns[turnIdx];
    if (!turn) return;
    const spk = activeDialogue.speakers.find((s) => s.id === turn.speakerId);
    const personaId = accent === 'en-GB' ? spk?.ukPersonaId : spk?.usPersonaId;

    setActiveTurnIdx(turnIdx);
    speakText(turn.en, accent, `turn-${turn.id}`, {
      personaId,
      pitchOffset: spk?.pitchOffset ?? 0,
      rateMultiplier: speechRate,
      naturalProsody: true,
      onEnd: () => setActiveTurnIdx(null),
      onError: () => setActiveTurnIdx(null)
    });
  };

  const handleMarkCompleted = () => {
    const already = completedIds.has(activeDialogue.id);
    const next = new Set(completedIds);
    if (already) {
      next.delete(activeDialogue.id);
      showToast(`Dialogue #${activeDialogue.number} retiré des acquis`);
    } else {
      next.add(activeDialogue.id);
      showToast(`Dialogue #${activeDialogue.number} validé ! (+15 XP)`);
      onDialogueCompleted?.(activeDialogue.id, 15);
    }
    setCompletedIds(next);
    try {
      localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore storage errors
    }
  };

  const handlePinSm2Card = (cardId: string, term: string) => {
    const next = new Set(pinnedSm2Ids);
    if (next.has(cardId)) {
      next.delete(cardId);
      showToast(`« ${term} » retiré de votre sélection SM-2`);
    } else {
      next.add(cardId);
      showToast(`« ${term} » ajouté aux Cartes Spaced Repetition`);
    }
    setPinnedSm2Ids(next);
    try {
      localStorage.setItem(SAVED_SM2_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

  const handleJumpRandom = () => {
    if (filteredDialogues.length === 0) return;
    const rand = filteredDialogues[Math.floor(Math.random() * filteredDialogues.length)];
    selectDialogue(rand);
    showToast(`Dialogue surprise #${rand.number} ouvert`);
  };

  const handleJumpNumber = (rawNum: string) => {
    const parsed = parseInt(rawNum, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(1, Math.min(500, parsed));
    const found = ATELIER_DIALOGUES_500.find((d) => d.number === clamped);
    if (found) {
      setSelectedTheme('all');
      setSelectedFormat('all');
      setSelectedLevel('all');
      setOnlyCompleted(false);
      setSearchQuery('');
      selectDialogue(found);
    }
  };

  const goPrevDialogue = () => {
    if (filteredDialogues.length === 0) return;
    const prevIdx =
      (activeIndexInFiltered - 1 + filteredDialogues.length) % filteredDialogues.length;
    selectDialogue(filteredDialogues[prevIdx]);
  };

  const goNextDialogue = () => {
    if (filteredDialogues.length === 0) return;
    const nextIdx = (activeIndexInFiltered + 1) % filteredDialogues.length;
    selectDialogue(filteredDialogues[nextIdx]);
  };

  const isCompleted = completedIds.has(activeDialogue.id);
  const completedCount = completedIds.size;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c1322] text-[#dce2f8] flex flex-col pt-safe pb-safe overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Atelier des 500 Dialogues"
    >
      {/* Top Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[75] px-4 py-2 rounded-full bg-[#151b2b]/95 border border-[#f2ca50]/70 text-[#f2ca50] text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="px-4 sm:px-6 py-3 bg-[#151b2b] border-b border-[#232a3a] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              stopAnyPlayback();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-[#191f2f] border border-[#232a3a] flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:border-[#f2ca50]/50 transition-colors cursor-pointer shrink-0"
            aria-label="Retour à l'atelier"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#f2ca50] font-bold">
                Atelier Conversationnel • 6 Thématiques
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/35 text-[10px] font-mono font-bold text-[#f2ca50]">
                {stats.total} DIALOGUES
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-[10px] font-mono font-bold text-emerald-300">
                {completedCount} MAÎTRISÉS
              </span>
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] truncate">
              Dialogues en Duo, Trio &amp; Groupe
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceStudioOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#191f2f] border border-[#f2ca50]/40 hover:border-[#f2ca50] text-xs font-semibold text-[#f2ca50] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            title="Régler les 30 voix naturelles et la prosodie"
          >
            <span className="material-symbols-outlined text-sm">record_voice_over</span>
            <span className="hidden sm:inline">30 Voix Naturelles</span>
          </button>

          {onOpenDialogueFlashcards && (
            <button
              type="button"
              onClick={() => {
                stopAnyPlayback();
                onOpenDialogueFlashcards(activeDialogue.number);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">style</span>
              <span className="hidden sm:inline">Cartes SM-2</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              stopAnyPlayback();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#191f2f] border border-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] flex items-center justify-center cursor-pointer"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="px-4 sm:px-6 py-2.5 bg-[#070e1d] border-b border-[#232a3a] flex flex-col gap-2 shrink-0">
        {/* Theme Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedTheme('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
              selectedTheme === 'all'
                ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold'
                : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8]'
            }`}
          >
            Tous ({stats.total})
          </button>

          {DIALOGUE_THEMES.map((theme) => {
            const active = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00] font-bold'
                    : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{theme.icon}</span>
                <span>{theme.shortLabel}</span>
                <span className="text-[10px] font-mono opacity-80">({stats.byTheme[theme.id]})</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Format (2p / 3p / Groupe), Level, Search & Direct N° Jump */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedFormat('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap border cursor-pointer ${
                selectedFormat === 'all'
                  ? 'bg-[#232a3a] border-[#f2ca50]/60 text-[#f2ca50]'
                  : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
              }`}
            >
              Tous formats
            </button>
            {DIALOGUE_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSelectedFormat(fmt.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap border flex items-center gap-1 cursor-pointer ${
                  selectedFormat === fmt.id
                    ? 'bg-[#232a3a] border-[#f2ca50]/60 text-[#f2ca50]'
                    : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{fmt.icon}</span>
                <span>{fmt.badge}</span>
              </button>
            ))}

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as DialogueLevelId | 'all')}
              aria-label="Filtrer par niveau"
              className="px-2.5 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] text-[11px] font-mono text-[#dce2f8] focus:outline-none focus:border-[#f2ca50] cursor-pointer"
            >
              <option value="all">Tous niveaux (6e–Term.)</option>
              {DIALOGUE_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOnlyCompleted((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap border cursor-pointer ${
                onlyCompleted
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 font-bold'
                  : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
              }`}
            >
              ✓ Validés ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
            <div className="relative flex-1 sm:w-48">
              <span className="material-symbols-outlined text-sm text-[#99907c] absolute left-2.5 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mot, thème ou N°..."
                className="w-full pl-8 pr-3 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] text-xs text-[#dce2f8] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>

            <input
              type="number"
              min={1}
              max={500}
              placeholder="N°"
              aria-label="Aller directement au numéro de dialogue"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJumpNumber((e.target as HTMLInputElement).value);
                }
              }}
              className="w-14 px-2 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] text-xs font-mono text-center text-[#f2ca50] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
              title="Entrez un numéro de 1 à 500 puis Entrée"
            />

            <button
              type="button"
              onClick={handleJumpRandom}
              className="px-2.5 py-1 rounded-lg bg-[#191f2f] border border-[#f2ca50]/35 hover:border-[#f2ca50] text-[11px] font-mono text-[#f2ca50] flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Ouvrir un dialogue au hasard"
            >
              <span className="material-symbols-outlined text-sm">shuffle</span>
              <span className="hidden md:inline">Aléatoire</span>
            </button>
          </div>
        </div>

        {/* Mobile List / Stage Toggle */}
        <div className="flex lg:hidden items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMobilePane('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
              mobilePane === 'list'
                ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00]'
                : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
            }`}
          >
            Liste ({filteredDialogues.length})
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('stage')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
              mobilePane === 'stage'
                ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00]'
                : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
            }`}
          >
            Dialogue #{activeDialogue.number}
          </button>
        </div>
      </section>

      {/* Main Split Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANE: Filterable Index of 500 Dialogues */}
        <aside
          className={`lg:col-span-4 border-r border-[#232a3a] bg-[#0c1322] overflow-y-auto p-3 space-y-2 ${
            mobilePane === 'list' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between px-1 pb-1 text-[11px] font-mono text-[#d4c78f]">
            <span>{filteredDialogues.length} dialogues affichés</span>
            <span>Cliquer pour étudier</span>
          </div>

          {filteredDialogues.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#151b2b] border border-[#232a3a] text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-[#f2ca50]">search_off</span>
              <p className="text-xs text-[#d0c5af]">Aucun dialogue ne correspond à ces filtres.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('all');
                  setSelectedFormat('all');
                  setSelectedLevel('all');
                  setOnlyCompleted(false);
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#f2ca50] text-[#3c2f00] text-xs font-bold cursor-pointer"
              >
                Tout afficher (500)
              </button>
            </div>
          ) : (
            filteredDialogues.map((dlg) => {
              const isSelected = dlg.id === activeDialogue.id;
              const done = completedIds.has(dlg.id);
              const themeMeta = DIALOGUE_THEMES.find((t) => t.id === dlg.theme);
              return (
                <button
                  key={dlg.id}
                  type="button"
                  onClick={() => selectDialogue(dlg)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#191f2f] border-[#f2ca50] shadow-md'
                      : 'bg-[#151b2b] border-[#232a3a] hover:border-[#f2ca50]/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#070e1d] text-[#f2ca50] font-mono text-[10px] font-bold">
                        #{String(dlg.number).padStart(3, '0')}
                      </span>
                      <span className="text-[10px] font-mono text-[#d4c78f]">
                        {themeMeta?.shortLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-[#232a3a] text-[10px] font-mono text-[#dce2f8]">
                        {dlg.formatLabel}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#070e1d] text-[10px] font-mono text-[#f2ca50]">
                        {dlg.cefr}
                      </span>
                      {done && (
                        <span
                          className="material-symbols-outlined text-sm text-emerald-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-serif text-sm font-bold text-[#dce2f8] leading-snug line-clamp-1">
                    {dlg.titleFr}
                  </h3>
                  <p className="text-[11px] text-[#d0c5af] line-clamp-1">
                    {dlg.speakers.map((s) => s.name).join(' · ')} — {dlg.setting}
                  </p>
                </button>
              );
            })
          )}
        </aside>

        {/* RIGHT STAGE: Well-Marked Interactive Dialogue Learner */}
        <section
          className={`lg:col-span-8 bg-[#0c1322] overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 ${
            mobilePane === 'stage' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Dialogue Info & Learning Goal Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#191f2f] border border-[#f2ca50]/35 shadow-xl flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] font-bold">
                    Dialogue #{activeDialogue.number} / 500
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#151b2b] border border-[#232a3a] text-[#d4c78f]">
                    {activeDialogue.themeLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#151b2b] border border-[#232a3a] text-[#dce2f8]">
                    {activeDialogue.formatLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#151b2b] border border-[#f2ca50]/30 text-[#f2ca50]">
                    {activeDialogue.levelLabel}
                  </span>
                </div>

                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8]">
                  {activeDialogue.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#d4c78f] font-medium">
                  {activeDialogue.titleFr}
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkCompleted}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                    : 'bg-[#151b2b] border-[#f2ca50]/45 text-[#f2ca50] hover:bg-[#f2ca50] hover:text-[#3c2f00]'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isCompleted ? 'verified' : 'check_circle'}
                </span>
                <span>{isCompleted ? 'Maîtrisé' : 'Valider (+15 XP)'}</span>
              </button>
            </div>

            {/* Situation + Learning Target + Participants Cast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-[#232a3a]">
              <div className="p-3 rounded-xl bg-[#070e1d] border border-[#232a3a] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Repère Pédagogique &amp; Lieu
                </span>
                <p className="text-xs text-[#dce2f8] font-semibold">{activeDialogue.setting}</p>
                <p className="text-[11px] text-[#d0c5af] leading-relaxed">
                  {activeDialogue.learningGoal}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#070e1d] border border-[#232a3a] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">groups</span>
                  Interlocuteurs ({activeDialogue.speakers.length}) &amp; Voix distinctes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDialogue.speakers.map((spk) => (
                    <div
                      key={spk.id}
                      className="px-2 py-1 rounded-lg bg-[#151b2b] border border-[#232a3a] flex items-center gap-1.5 text-[11px]"
                    >
                      <span
                        className="w-5 h-5 rounded-full text-[#0c1322] font-bold text-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: spk.colorHex }}
                      >
                        {spk.initials}
                      </span>
                      <span className="font-semibold text-[#dce2f8]">{spk.name}</span>
                      <span className="text-[#99907c] text-[10px]">({spk.roleFr})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Audio + Easy-Comprehension Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#232a3a]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayFullConversation}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
                    isPlayingFull
                      ? 'bg-rose-500/20 border border-rose-400/60 text-rose-200'
                      : 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isPlayingFull ? 'stop_circle' : 'play_circle'}
                  </span>
                  <span>
                    {isPlayingFull
                      ? 'Arrêter la conversation'
                      : 'Écouter tout le dialogue'}
                  </span>
                </button>

                {/* Accent Selector */}
                <div className="inline-flex rounded-xl bg-[#070e1d] border border-[#232a3a] p-0.5">
                  <button
                    type="button"
                    onClick={() => setAccent('en-GB')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer ${
                      accent === 'en-GB'
                        ? 'bg-[#f2ca50] text-[#3c2f00]'
                        : 'text-[#d0c5af] hover:text-[#dce2f8]'
                    }`}
                  >
                    🇬🇧 UK
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccent('en-US')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer ${
                      accent === 'en-US'
                        ? 'bg-[#f2ca50] text-[#3c2f00]'
                        : 'text-[#d0c5af] hover:text-[#dce2f8]'
                    }`}
                  >
                    🇺🇸 US
                  </button>
                </div>

                {/* Speed Control */}
                <div className="inline-flex rounded-xl bg-[#070e1d] border border-[#232a3a] p-0.5">
                  {[
                    { val: 0.82, label: '0.8x' },
                    { val: 1.0, label: '1.0x' },
                    { val: 1.15, label: '1.15x' }
                  ].map((spd) => (
                    <button
                      key={spd.val}
                      type="button"
                      onClick={() => setSpeechRate(spd.val)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                        speechRate === spd.val
                          ? 'bg-[#232a3a] text-[#f2ca50]'
                          : 'text-[#d0c5af]'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Aid Toggles */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIncludeFrenchAudio((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono border cursor-pointer ${
                    includeFrenchAudio
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 font-bold'
                      : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
                  }`}
                  title="Lire la traduction française après chaque réplique anglaise"
                >
                  🔊 Audio FR
                </button>
                <button
                  type="button"
                  onClick={() => setShowFrenchText((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono border cursor-pointer ${
                    showFrenchText
                      ? 'bg-[#232a3a] border-[#f2ca50]/50 text-[#f2ca50]'
                      : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
                  }`}
                >
                  Traductions
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeyTips((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono border cursor-pointer ${
                    showKeyTips
                      ? 'bg-[#232a3a] border-[#f2ca50]/50 text-[#f2ca50]'
                      : 'bg-[#151b2b] border-[#232a3a] text-[#d0c5af]'
                  }`}
                >
                  Repères IPA
                </button>

                <select
                  value={hiddenSpeakerId || ''}
                  onChange={(e) => {
                    setHiddenSpeakerId(e.target.value || null);
                    setRevealedTurnIds({});
                  }}
                  aria-label="Mode Jeu de Rôle : masquer un interlocuteur"
                  className="px-2.5 py-1.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-[11px] font-mono text-[#dce2f8] cursor-pointer focus:outline-none focus:border-[#f2ca50]"
                >
                  <option value="">Jeu de rôle : Tout visible</option>
                  {activeDialogue.speakers.map((spk) => (
                    <option key={spk.id} value={spk.id}>
                      Cacher {spk.name} ({spk.roleFr})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Double-click quick hint */}
          <div className="px-3 py-2 rounded-xl bg-[#151b2b] border border-[#232a3a] flex items-center justify-between gap-2 text-[11px] text-[#d4c78f]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">touch_app</span>
              <span>
                Astuce : <strong>double-cliquez sur n&apos;importe quel mot anglais</strong> pour voir sa traduction et son IPA immédiatement.
              </span>
            </span>
          </div>

          {/* Conversational Q&A Bubbles wrapped in LessonDictionaryProvider */}
          <LessonDictionaryProvider
            lessonId={activeDialogue.id}
            lessonContext={activeDialogue.title}
            gradeLevel={activeDialogue.cefr}
            voiceAccent={accent}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDialogue.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {activeDialogue.turns.map((turn, idx) => {
                  const speaker =
                    activeDialogue.speakers.find((s) => s.id === turn.speakerId) ||
                    activeDialogue.speakers[0];
                  const intentMeta = INTENT_STYLES[turn.intent];
                  const isCurrentlySpeaking = activeTurnIdx === idx;
                  const isRoleHidden =
                    hiddenSpeakerId === speaker.id && !revealedTurnIds[turn.id];
                  const isRightAligned = idx % 2 === 1;

                  return (
                    <div
                      key={turn.id}
                      className={`flex flex-col ${isRightAligned ? 'sm:pl-8' : 'sm:pr-8'}`}
                    >
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrentlySpeaking
                            ? 'bg-[#191f2f] border-[#f2ca50] shadow-[0_0_24px_rgba(242,202,80,0.2)]'
                            : 'bg-[#151b2b] border-[#232a3a] hover:border-[#f2ca50]/40'
                        }`}
                      >
                        {/* Turn Header: Speaker + Intent Tag + Direct Listen */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-full text-[#0c1322] font-bold text-xs flex items-center justify-center shrink-0"
                              style={{ backgroundColor: speaker.colorHex }}
                            >
                              {speaker.initials}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-sm text-[#dce2f8]">
                                {speaker.name}
                              </span>
                              <span className="text-[11px] text-[#99907c]">
                                ({speaker.roleFr})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${intentMeta.badgeClass}`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {intentMeta.icon}
                              </span>
                              <span>{intentMeta.label}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handlePlaySingleTurn(idx)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                isCurrentlySpeaking
                                  ? 'bg-[#f2ca50] border-[#f2ca50] text-[#3c2f00]'
                                  : 'bg-[#070e1d] border-[#232a3a] text-[#f2ca50] hover:border-[#f2ca50]/60'
                              }`}
                              title={`Écouter ${speaker.name}`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {isCurrentlySpeaking ? 'graphic_eq' : 'volume_up'}
                              </span>
                              <span className="hidden sm:inline">Écouter</span>
                            </button>
                          </div>
                        </div>

                        {/* English Dialogue Text OR Masked Roleplay State */}
                        {isRoleHidden ? (
                          <div className="p-4 rounded-xl bg-[#070e1d] border border-dashed border-[#f2ca50]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-[#f2ca50]">
                                À vous de parler ({speaker.name}) !
                              </p>
                              <p className="text-xs text-[#d0c5af]">
                                Indice FR : « {turn.fr} »
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedTurnIds((prev) => ({ ...prev, [turn.id]: true }))
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#f2ca50] text-[#3c2f00] text-xs font-bold cursor-pointer shrink-0"
                            >
                              Révéler la réponse
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="font-serif text-base sm:text-lg text-[#dce2f8] leading-relaxed">
                              <InteractiveHighlightText text={turn.en} />
                            </p>

                            {showFrenchText && (
                              <div className="mt-2 pt-2 border-t border-[#232a3a] flex items-start justify-between gap-2">
                                <p className="text-xs sm:text-sm text-[#d0c5af] italic leading-relaxed">
                                  → {turn.fr}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    speakFrenchText(turn.fr, `turn-fr-${turn.id}`, {
                                      rateMultiplier: speechRate
                                    })
                                  }
                                  className="text-[11px] font-mono text-emerald-300 hover:underline shrink-0 cursor-pointer"
                                  title="Écouter en français"
                                >
                                  🇫🇷 FR
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* Easy-to-Spot Key Expression + IPA + Cue */}
                        {showKeyTips && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-[#070e1d] border border-[#f2ca50]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold">
                                  Repère Clé :
                                </span>
                                <span className="font-bold text-[#ffe082]">
                                  « {turn.keyPhrase} »
                                </span>
                                <span className="font-mono text-[11px] text-sky-300">
                                  {turn.keyIpa}
                                </span>
                                <span className="text-[#d0c5af]">= {turn.keyMeaningFr}</span>
                              </div>
                              <p className="text-[11px] text-[#99907c] leading-snug">
                                💡 {turn.tipFr}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </LessonDictionaryProvider>

          {/* Bottom Key Expressions -> Direct Spaced Repetition SM-2 Bridge */}
          <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#f2ca50]/35 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#f2ca50] font-bold">
                  Mémorisation Espacée (SM-2)
                </span>
                <h3 className="font-serif text-base font-bold text-[#dce2f8]">
                  Expressions du Dialogue à ancrer en Spaced Repetition
                </h3>
              </div>

              {onOpenDialogueFlashcards && (
                <button
                  type="button"
                  onClick={() => {
                    stopAnyPlayback();
                    onOpenDialogueFlashcards(activeDialogue.number);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">style</span>
                  <span>Ouvrir en Cartes SM-2</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeDialogue.keyCards.map((kc) => {
                const pinned = pinnedSm2Ids.has(kc.id);
                return (
                  <div
                    key={kc.id}
                    className="p-3 rounded-xl bg-[#070e1d] border border-[#232a3a] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-serif font-bold text-sm text-[#f2ca50]">
                          {kc.term}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakText(kc.term, accent, `kc-${kc.id}`, {
                              rateMultiplier: speechRate
                            })
                          }
                          className="text-[#d4c78f] hover:text-[#f2ca50] cursor-pointer"
                          title="Écouter l'expression"
                        >
                          <span className="material-symbols-outlined text-sm">volume_up</span>
                        </button>
                      </div>
                      <span className="block text-[11px] font-mono text-sky-300 mt-0.5">
                        {kc.ipa}
                      </span>
                      <p className="text-xs text-[#dce2f8] mt-1">{kc.frenchDef}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePinSm2Card(kc.id, kc.term)}
                      className={`w-full py-1 rounded-lg text-[11px] font-mono font-semibold border cursor-pointer transition-colors ${
                        pinned
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                          : 'bg-[#151b2b] border-[#232a3a] text-[#d4c78f] hover:border-[#f2ca50]/50 hover:text-[#f2ca50]'
                      }`}
                    >
                      {pinned ? '✓ Épinglée pour SM-2' : '+ Épingler Carte SM-2'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prev / Next Footer */}
          <div className="flex items-center justify-between gap-3 pt-1 pb-4">
            <button
              type="button"
              onClick={goPrevDialogue}
              className="px-4 py-2 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-[#232a3a] text-xs font-semibold text-[#dce2f8] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Dialogue précédent</span>
            </button>

            <span className="text-xs font-mono text-[#d4c78f] tabular-nums">
              {activeIndexInFiltered + 1} / {filteredDialogues.length || 1}
            </span>

            <button
              type="button"
              onClick={goNextDialogue}
              className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Dialogue suivant</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>

      {/* 30 Natural Voices Studio */}
      <VoiceStudioModal
        isOpen={isVoiceStudioOpen}
        onClose={() => setIsVoiceStudioOpen(false)}
        initialTab={accent}
      />
    </div>
  );
};
