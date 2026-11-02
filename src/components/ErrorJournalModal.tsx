import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  getErrorJournal,
  markErrorAsResolved,
  reopenError,
  deleteErrorItem,
  clearResolvedErrors,
  type ErrorJournalItem,
  type ErrorSource
} from '../utils/errorJournal';
import { speakText, stopSpeech } from '../services/speechService';
import { DualSpeakerButton } from './DualSpeakerButton';

interface ErrorJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
}

type FilterTab = 'all' | 'flashcard' | 'dictation' | 'unresolved' | 'resolved';

export const ErrorJournalModal: React.FC<ErrorJournalModalProps> = ({
  isOpen,
  onClose,
  onXpEarned
}) => {
  const [items, setItems] = useState<ErrorJournalItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode Révision Ciblée Interactive
  const [isRevisionSessionActive, setIsRevisionSessionActive] = useState<boolean>(false);
  const [sessionQueue, setSessionQueue] = useState<ErrorJournalItem[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);
  const [sessionInputText, setSessionInputText] = useState<string>('');
  const [sessionAnswerRevealed, setSessionAnswerRevealed] = useState<boolean>(false);
  const [sessionFeedback, setSessionFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [resolvedInThisSession, setResolvedInThisSession] = useState<number>(0);

  // Charger le journal
  const refreshJournal = () => {
    const data = getErrorJournal();
    setItems(data);
  };

  useEffect(() => {
    if (isOpen) {
      refreshJournal();
      setIsRevisionSessionActive(false);
      setCurrentSessionIndex(0);
      setSessionAnswerRevealed(false);
      setSessionFeedback(null);
      setResolvedInThisSession(0);
    }
  }, [isOpen]);

  // Écouter les mises à jour personnalisées
  useEffect(() => {
    const handleUpdate = () => refreshJournal();
    window.addEventListener('eb_error_journal_updated', handleUpdate);
    return () => window.removeEventListener('eb_error_journal_updated', handleUpdate);
  }, []);

  // Nettoyer la synthèse vocale à la fermeture
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Support touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRevisionSessionActive) {
          setIsRevisionSessionActive(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevisionSessionActive, onClose]);

  // Statistiques
  const unresolvedItems = useMemo(() => items.filter((i) => !i.resolved), [items]);
  const resolvedItems = useMemo(() => items.filter((i) => i.resolved), [items]);
  const flashcardErrors = useMemo(() => items.filter((i) => i.source === 'flashcard' && !i.resolved), [items]);
  const dictationErrors = useMemo(() => items.filter((i) => i.source === 'dictation' && !i.resolved), [items]);

  // Filtrage
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeTab === 'flashcard') {
      result = result.filter((i) => i.source === 'flashcard');
    } else if (activeTab === 'dictation') {
      result = result.filter((i) => i.source === 'dictation');
    } else if (activeTab === 'unresolved') {
      result = result.filter((i) => !i.resolved);
    } else if (activeTab === 'resolved') {
      result = result.filter((i) => i.resolved);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.term.toLowerCase().includes(q) ||
          i.translationFr?.toLowerCase().includes(q) ||
          i.definition?.toLowerCase().includes(q) ||
          i.dictationSentence?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, activeTab, searchQuery]);

  // Démarrer la session de révision ciblée
  const startTargetedRevision = (specificItems?: ErrorJournalItem[]) => {
    const targets = specificItems || (unresolvedItems.length > 0 ? unresolvedItems : items);
    if (targets.length === 0) return;
    setSessionQueue(targets);
    setCurrentSessionIndex(0);
    setSessionInputText('');
    setSessionAnswerRevealed(false);
    setSessionFeedback(null);
    setResolvedInThisSession(0);
    setIsRevisionSessionActive(true);
  };

  // Traiter la réponse dans la session de révision
  const handleCheckSessionAnswer = () => {
    if (!currentItem) return;
    const cleanUser = sessionInputText.trim().toLowerCase();
    const cleanExpected = currentItem.term.trim().toLowerCase();

    const isMatch = cleanUser === cleanExpected;

    if (isMatch) {
      setSessionFeedback({
        isCorrect: true,
        message: 'Orthographe et remémoration parfaites ! Point faible maîtrisé.'
      });
      setSessionAnswerRevealed(true);
      markErrorAsResolved(currentItem.id);
      setResolvedInThisSession((prev) => prev + 1);
      onXpEarned?.(15);
      refreshJournal();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f2ca50', '#ffffff', '#38bdf8']
        });
      } catch {
        // ignore
      }
    } else {
      setSessionFeedback({
        isCorrect: false,
        message: `Erreur d'orthographe. Le terme attendu est : ${currentItem.term}`
      });
      setSessionAnswerRevealed(true);
    }
  };

  // Passer à l'élément suivant dans la session
  const handleNextSessionItem = () => {
    if (currentSessionIndex < sessionQueue.length - 1) {
      setCurrentSessionIndex((prev) => prev + 1);
      setSessionInputText('');
      setSessionAnswerRevealed(false);
      setSessionFeedback(null);
    } else {
      // Fin de la session
      setIsRevisionSessionActive(false);
      refreshJournal();
    }
  };

  const currentItem = sessionQueue[currentSessionIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col animate-fadeIn select-none">
      {/* HEADER AVEC GESTION SAFE-AREA iOS */}
      <header
        className="sticky top-0 z-30 w-full bg-[#0c1322]/95 backdrop-blur-2xl border-b border-[#232a3a] shadow-lg flex flex-col justify-end"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)'
        }}
      >
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
          <button
            type="button"
            onClick={isRevisionSessionActive ? () => setIsRevisionSessionActive(false) : onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#151c2c] hover:bg-[#1f293e] border border-[#f2ca50]/70 text-[#f2ca50] hover:text-[#ffe088] shadow-md transition-all active:scale-95 cursor-pointer font-sans"
            aria-label="Revenir en arrière"
          >
            <span className="material-symbols-outlined text-lg font-bold">arrow_back</span>
            <span className="text-xs font-serif font-bold uppercase tracking-wider">
              {isRevisionSessionActive ? 'Quitter Session' : 'Retour Profil'}
            </span>
          </button>

          <div className="flex flex-col items-center text-center">
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#f3f4f6] leading-tight flex items-center gap-2">
              <span>Journal d'Erreurs</span>
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse" />
            </h1>
            <span className="text-[10px] font-mono text-[#d4c78f] uppercase tracking-widest hidden sm:block">
              Points Faibles Flashcards & Dictées
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#3c2f00] text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1 cursor-pointer font-sans"
            aria-label="Fermer"
          >
            <span>Fermer</span>
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>
      </header>

      {/* CORPS PRINCIPAL : VUE JOURNAL OU VUE SESSION DE RÉVISION */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 flex-1 flex flex-col gap-5">
        {/* ==================================================================== */}
        {/* 1. VUE SESSION DE RÉVISION CIBLÉE INTERACTIVE                         */}
        {/* ==================================================================== */}
        {isRevisionSessionActive && currentItem ? (
          <div className="w-full flex flex-col gap-5 animate-fadeIn">
            {/* Barre de progression de la session */}
            <div className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#f2ca50] font-bold uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">target</span>
                  <span>Point Faible {currentSessionIndex + 1} / {sessionQueue.length}</span>
                </span>
                <span className="text-[#a1a1aa]">
                  {resolvedInThisSession} maîtrisé{resolvedInThisSession > 1 ? 's' : ''} dans cette session (+{resolvedInThisSession * 15} XP)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#070e1d] overflow-hidden p-0.5 border border-[#232a3a]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#f2ca50] to-[#ffe088] transition-all duration-300"
                  style={{ width: `${((currentSessionIndex + 1) / sessionQueue.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Carte d'Étude & Défi de Révision Ciblée */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#18233a] via-[#10192b] to-[#0c1424] border-2 border-[#f2ca50]/70 shadow-[0_0_50px_rgba(242,202,80,0.25)] flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    currentItem.source === 'flashcard'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {currentItem.source === 'flashcard' ? 'Flashcard Manquée' : 'Erreur de Dictée'}
                  </span>
                  {currentItem.gradeLevel && (
                    <span className="px-2 py-0.5 rounded-md bg-[#232a3a] text-[#f2ca50] text-[10px] font-mono font-bold">
                      {currentItem.gradeLevel.toUpperCase()}
                    </span>
                  )}
                  {currentItem.cefrLevel && (
                    <span className="px-2 py-0.5 rounded-md bg-[#232a3a] text-[#d4c78f] text-[10px] font-mono font-bold">
                      {currentItem.cefrLevel}
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-rose-400 font-bold bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  {currentItem.errorCount}x Manqué
                </span>
              </div>

              {/* Contexte & Phrase de dictée ou Définition */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-[#99907c] uppercase tracking-wider block">
                  Indice de Signification & Contexte :
                </span>
                <p className="font-serif text-lg sm:text-xl text-[#f3f4f6] italic leading-relaxed">
                  « {currentItem.translationFr} »
                </p>
                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed bg-[#070e1d]/70 p-3.5 rounded-xl border border-[#232a3a]">
                  <strong>Définition :</strong> {currentItem.definition}
                </p>

                {currentItem.dictationSentence && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 font-serif italic">
                    <span className="font-sans font-bold text-amber-400 not-italic block mb-0.5 text-[10px] uppercase tracking-wider">
                      Phrase de la Dictée originale :
                    </span>
                    {currentItem.dictationSentence}
                  </div>
                )}
              </div>

              {/* Écoute Audio Double Prononciation UK & US */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121927] border border-[#222c40] flex-wrap gap-2">
                <span className="text-xs text-[#d0c5af] font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50]">volume_up</span>
                  <span>Écoutez la prononciation authentique :</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakText(currentItem.term, 'en-GB', `ej-rev-${currentItem.id}-gb`)}
                    className="px-3 py-1.5 rounded-lg bg-[#1a2336] hover:bg-[#222d44] border border-[#303f5e] text-[#f2ca50] text-xs font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>🇬🇧 UK</span>
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText(currentItem.term, 'en-US', `ej-rev-${currentItem.id}-us`)}
                    className="px-3 py-1.5 rounded-lg bg-[#1a2336] hover:bg-[#222d44] border border-[#303f5e] text-[#7dd3fc] text-xs font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>🇺🇸 US</span>
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                </div>
              </div>

              {/* Champ de Saisie ou Révélation */}
              {!sessionAnswerRevealed ? (
                <div className="space-y-3 pt-2">
                  <label className="text-xs text-[#dce2f8] font-bold block">
                    Écrivez le mot exact en anglais pour valider sa maîtrise :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={sessionInputText}
                      onChange={(e) => setSessionInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && sessionInputText.trim()) {
                          handleCheckSessionAnswer();
                        }
                      }}
                      placeholder="Tapez le mot ici..."
                      className="flex-1 px-4 py-3 rounded-xl bg-[#0a101d] border-2 border-[#2f3d59] focus:border-[#f2ca50] text-[#f3f4f6] text-base font-serif focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleCheckSessionAnswer}
                      disabled={!sessionInputText.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#2c1d00] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer font-sans"
                    >
                      Vérifier
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#99907c] text-[11px]">Appuyez sur Entrée pour valider</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionAnswerRevealed(true);
                        setSessionFeedback({
                          isCorrect: false,
                          message: `Le terme exact est : ${currentItem.term}`
                        });
                      }}
                      className="text-[#d4c78f] hover:text-[#f2ca50] underline text-[11px] font-mono cursor-pointer"
                    >
                      Voir la réponse sans valider
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {/* Feedback Message */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    sessionFeedback?.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  }`}>
                    <span className="material-symbols-outlined text-2xl mt-0.5">
                      {sessionFeedback?.isCorrect ? 'check_circle' : 'error'}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-base">
                        {sessionFeedback?.isCorrect ? 'Succès de Consolidation (+15 XP) !' : 'À mémoriser soigneusement'}
                      </span>
                      <p className="text-xs sm:text-sm mt-0.5">
                        {sessionFeedback?.message}
                      </p>
                    </div>
                  </div>

                  {/* Fiche de récapitulation du terme */}
                  <div className="p-4 rounded-2xl bg-[#080d19] border border-[#232a3a] flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif font-black text-2xl text-[#f2ca50]">
                        {currentItem.term}
                      </span>
                      <span className="text-xs font-mono text-[#d4c78f]">
                        {currentItem.phoneticsUk || currentItem.phoneticsUs}
                      </span>
                    </div>
                    {currentItem.etymology && (
                      <p className="text-xs text-[#a1a1aa] italic pt-1 border-t border-[#1e273a]">
                        📜 <strong>Étymologie :</strong> {currentItem.etymology}
                      </p>
                    )}
                  </div>

                  {/* Bouton Suivant */}
                  <button
                    type="button"
                    onClick={handleNextSessionItem}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#2c1d00] font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans"
                  >
                    <span>
                      {currentSessionIndex < sessionQueue.length - 1 ? 'Point Faible Suivant' : 'Terminer la Révision'}
                    </span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* 2. VUE RECAPITULATIF DU JOURNAL D'ERREURS                            */
          /* ==================================================================== */
          <div className="w-full flex flex-col gap-5 animate-fadeIn">
            {/* Bannière Principale & Statistiques */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#18233a] via-[#10192a] to-[#0c1424] border border-[#f2ca50]/50 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] text-[11px] font-mono font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">history_edu</span>
                  <span>Carnet Philologique des Faiblesses</span>
                </div>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-white">
                  Journal d'Erreurs & Points à Consolider
                </h2>
                <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-xl leading-relaxed">
                  Chaque terme manqué lors des <strong>cartes de répétition espacée</strong> et chaque mot erroné en <strong>dictée</strong> est consigné ici pour transformer vos hésitations en maîtrise absolue.
                </p>
              </div>

              {/* Bouton de Révision Ciblée Immédiate */}
              <button
                type="button"
                onClick={() => startTargetedRevision()}
                disabled={unresolvedItems.length === 0}
                className="w-full md:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] hover:from-[#ffe088] hover:to-[#f2ca50] text-[#2c1d00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#f2ca50]/25 active:scale-95 transition-all cursor-pointer font-sans shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">play_circle</span>
                <span>Lancer Révision Ciblée ({unresolvedItems.length})</span>
              </button>
            </div>

            {/* Rangée de Statistiques Détaillées */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#141c2c] border border-[#232f46] flex flex-col">
                <span className="text-[10px] font-mono text-[#99907c] uppercase">Points actifs</span>
                <span className="font-serif font-black text-2xl text-[#f2ca50] mt-0.5">
                  {unresolvedItems.length}
                </span>
                <span className="text-[11px] text-[#d0c5af]">À consolider</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141c2c] border border-[#232f46] flex flex-col">
                <span className="text-[10px] font-mono text-amber-300 uppercase">Flashcards</span>
                <span className="font-serif font-black text-2xl text-amber-300 mt-0.5">
                  {flashcardErrors.length}
                </span>
                <span className="text-[11px] text-[#d0c5af]">Négligées ou à revoir</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141c2c] border border-[#232f46] flex flex-col">
                <span className="text-[10px] font-mono text-sky-300 uppercase">Dictées</span>
                <span className="font-serif font-black text-2xl text-sky-300 mt-0.5">
                  {dictationErrors.length}
                </span>
                <span className="text-[11px] text-[#d0c5af]">Fautes d'orthographe</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141c2c] border border-[#232f46] flex flex-col">
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Maîtrisés</span>
                <span className="font-serif font-black text-2xl text-emerald-400 mt-0.5">
                  {resolvedItems.length}
                </span>
                <span className="text-[11px] text-[#d0c5af]">Corrigés avec succès</span>
              </div>
            </div>

            {/* Barre de Recherche et Onglets de Filtrage */}
            <div className="p-3 rounded-2xl bg-[#121927] border border-[#232a3a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Onglets Filtres */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: `Tous (${items.length})` },
                  { id: 'unresolved', label: `À revoir (${unresolvedItems.length})` },
                  { id: 'flashcard', label: `Flashcards (${flashcardErrors.length})` },
                  { id: 'dictation', label: `Dictées (${dictationErrors.length})` },
                  { id: 'resolved', label: `Résolus (${resolvedItems.length})` }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as FilterTab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#f2ca50] text-[#0c1322] shadow-sm'
                          : 'bg-[#182236] text-[#99907c] hover:text-[#dce2f8]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Champ de recherche */}
              <div className="relative shrink-0 sm:w-64">
                <span className="material-symbols-outlined text-sm text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrer mot ou sens..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#0c1322] border border-[#2d3a54] text-xs text-[#dce2f8] placeholder-[#717b94] focus:outline-none focus:border-[#f2ca50]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#99907c] hover:text-white"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* LISTE DES POINTS FAIBLES */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#121927] border border-[#232a3a] text-center space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#f2ca50]">check_circle</span>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Aucun point faible correspondant
                  </h3>
                  <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
                    Tous vos termes sont actuellement maîtrisés ou le filtre ne correspond à aucun élément.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        item.resolved
                          ? 'bg-[#0e1624]/60 border-[#20293d] opacity-75'
                          : 'bg-[#141d2f] border-[#29364f] hover:border-[#f2ca50]/50 shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-black text-xl sm:text-2xl text-[#f3f4f6]">
                              {item.term}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              item.source === 'flashcard'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                              {item.source === 'flashcard' ? 'Flashcard' : 'Dictée'}
                            </span>
                            {item.gradeLevel && (
                              <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[10px] font-mono text-[#f2ca50]">
                                {item.gradeLevel.toUpperCase()}
                              </span>
                            )}
                            {item.cefrLevel && (
                              <span className="px-2 py-0.5 rounded bg-[#232a3a] text-[10px] font-mono text-[#d4c78f]">
                                {item.cefrLevel}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-rose-400 font-bold">
                              {item.errorCount}x manqué
                            </span>
                            {item.resolved && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">done_all</span>
                                Résolu
                              </span>
                            )}
                          </div>

                          {/* Traduction & Définition */}
                          <p className="font-serif text-sm sm:text-base text-[#f2ca50] font-semibold italic">
                            « {item.translationFr} »
                          </p>
                          <p className="text-xs text-[#cbd5e1] leading-relaxed">
                            {item.definition}
                          </p>

                          {/* Détails spécifiques Dictée */}
                          {item.source === 'dictation' && (
                            <div className="mt-2 p-3 rounded-xl bg-[#090e1a] border border-[#20293d] space-y-1.5 text-xs font-mono">
                              {item.userAnswer && (
                                <div className="flex items-center gap-2 text-rose-300">
                                  <span className="text-[10px] text-[#99907c] uppercase">Saisie erronée :</span>
                                  <span className="line-through">{item.userAnswer}</span>
                                </div>
                              )}
                              {item.expectedAnswer && (
                                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                                  <span className="text-[10px] text-[#99907c] uppercase">Orthographe exacte :</span>
                                  <span>{item.expectedAnswer}</span>
                                </div>
                              )}
                              {item.diffExplanation && (
                                <p className="text-[11px] text-[#d0c5af]/80 font-sans italic pt-0.5">
                                  💡 {item.diffExplanation}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Étymologie Flashcards */}
                          {item.source === 'flashcard' && item.etymology && (
                            <p className="text-[11px] text-[#99907c] italic pt-1">
                              📜 <strong>Étymologie :</strong> {item.etymology}
                            </p>
                          )}
                        </div>

                        {/* Actions sur l'item */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0">
                          {/* Audio Speakers */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => speakText(item.term, 'en-GB', `ej-item-${item.id}-gb`)}
                              className="w-8 h-8 rounded-lg bg-[#192235] hover:bg-[#232f48] text-[#f2ca50] border border-[#2d3a54] flex items-center justify-center transition-all cursor-pointer"
                              title="Prononciation britannique"
                            >
                              <span className="text-xs">🇬🇧</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => speakText(item.term, 'en-US', `ej-item-${item.id}-us`)}
                              className="w-8 h-8 rounded-lg bg-[#192235] hover:bg-[#232f48] text-[#7dd3fc] border border-[#2d3a54] flex items-center justify-center transition-all cursor-pointer"
                              title="Prononciation américaine"
                            >
                              <span className="text-xs">🇺🇸</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Réviser ce mot seul */}
                            <button
                              type="button"
                              onClick={() => startTargetedRevision([item])}
                              className="px-2.5 py-1 rounded-lg bg-[#f2ca50]/20 hover:bg-[#f2ca50]/30 border border-[#f2ca50]/50 text-[#f2ca50] text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                              title="Lancer une révision ciblée sur ce mot"
                            >
                              <span className="material-symbols-outlined text-xs">target</span>
                              <span>Réviser</span>
                            </button>

                            {/* Basculer Résolu / Rouvrir */}
                            <button
                              type="button"
                              onClick={() => {
                                if (item.resolved) {
                                  reopenError(item.id);
                                } else {
                                  markErrorAsResolved(item.id);
                                }
                                refreshJournal();
                              }}
                              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                                item.resolved
                                  ? 'bg-[#1b263b] border-[#2f3d59] text-[#99907c] hover:text-white'
                                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                              }`}
                              title={item.resolved ? 'Rouvrir ce point faible' : 'Marquer comme résolu'}
                            >
                              <span className="material-symbols-outlined text-base">
                                {item.resolved ? 'replay' : 'check'}
                              </span>
                            </button>

                            {/* Supprimer de l'historique */}
                            <button
                              type="button"
                              onClick={() => {
                                deleteErrorItem(item.id);
                                refreshJournal();
                              }}
                              className="p-1.5 rounded-lg bg-[#192235] hover:bg-rose-950/40 border border-[#2d3a54] hover:border-rose-500/50 text-[#99907c] hover:text-rose-400 text-xs flex items-center justify-center transition-colors cursor-pointer"
                              title="Supprimer cet élément du journal"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Nettoyer les éléments résolus */}
            {resolvedItems.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearResolvedErrors();
                    refreshJournal();
                  }}
                  className="text-xs font-mono text-[#99907c] hover:text-[#dce2f8] transition-colors underline cursor-pointer"
                >
                  Purger les {resolvedItems.length} points faibles résolus
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
