import React, { useState, useRef } from 'react';
import type { CEFRLevel } from '../firebase/types';
import { DIALOGUE_THEMES, type DialogueThemeId } from '../data/atelierDialoguesTypes';
import { speakText } from '../services/speechService';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';
import { useAdaptiveProfile } from '../hooks/useAdaptiveProfile';
import { AdaptiveGlobalBanner } from './AdaptiveGlobalBanner';
import { SKILL_META } from '../services/adaptiveEngine';

interface PracticeViewProps {
  currentLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
  onOpenDictation: () => void;
  onOpenFlashcards: () => void;
  onOpenFlashcardsFocus?: () => void;
  onOpenDialogueFlashcards?: () => void;
  onOpenDialogues?: (theme?: DialogueThemeId | 'all') => void;
  onOpenQuiz: () => void;
  onOpenSpeaking: () => void;
  onOpenGames?: () => void;
  onOpenCityMap?: () => void;
  onOpenAdventure?: () => void;
  onOpenAiTutor?: () => void;
  onOpenEscapeRoom?: () => void;
  onOpenListeningCinema?: () => void;
  onOpenGrammarBattle?: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  currentLevel,
  onSelectLevel,
  onOpenDictation,
  onOpenFlashcards,
  onOpenFlashcardsFocus,
  onOpenDialogueFlashcards,
  onOpenDialogues,
  onOpenQuiz,
  onOpenSpeaking,
  onOpenGames,
  onOpenCityMap,
  onOpenAdventure,
  onOpenAiTutor,
  onOpenEscapeRoom,
  onOpenListeningCinema,
  onOpenGrammarBattle
}) => {
  const [miniCardFlipped, setMiniCardFlipped] = useState<boolean>(false);
  const cefrTrackRef = useRef<HTMLDivElement | null>(null);
  const { assessment } = useAdaptiveProfile();
  const recommendedAtelierAction = assessment.modulePlans.atelier.recommendedAction;
  const weakestSkillLabel = SKILL_META[assessment.profile.weakestSkills[0]].labelFr;

  const handleAdaptiveAtelierLaunch = () => {
    switch (recommendedAtelierAction) {
      case 'dictation':
        onOpenDictation();
        break;
      case 'flashcards':
        onOpenFlashcards();
        break;
      case 'quiz':
        onOpenQuiz();
        break;
      case 'speaking':
        onOpenSpeaking();
        break;
      case 'dialogues':
        onOpenDialogues?.('all');
        break;
      case 'tutor':
        onOpenAiTutor?.();
        break;
      case 'escape_room':
        onOpenEscapeRoom?.();
        break;
      case 'listening_cinema':
        onOpenListeningCinema?.();
        break;
      case 'grammar_battle':
        onOpenGrammarBattle?.();
        break;
    }
  };

  const levelDescriptions: Record<CEFRLevel, string> = {
    A1: 'A1 : Découverte et acquisition des structures élémentaires (6e / Cycle 3).',
    A2: 'A2 : Consolidation et communication usuelle en contexte quotidien (5e / 4e).',
    B1: 'B1 : Perfectionnement des fondamentaux grammaticaux et du lexique académique.',
    B2: 'B2 : Expression fluide, maîtrise des nuances d’argumentation et idiomatique.',
    C1: 'C1 : Niveau Recommandé — Autonomie opérationnelle, discours feutré et précision.',
    C2: 'C2 : Bilinguisme de haute volée, rhétorique diplomatique, orfèvrerie stylistique.'
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 pb-24 gap-5 select-none">
      {/* Header Section */}
      <section className="flex flex-col gap-1 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
              Atelier de Perfectionnement
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#dce2f8] font-bold">
              Modules Pédagogiques
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#191f2f] border border-[#f2ca50]/20 text-xs">
            <span
              className="material-symbols-outlined text-[#f2ca50] text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
            <span className="text-[#f2ca50] font-mono font-bold">5 / 5 DISPONIBLES</span>
          </div>
        </div>
        <p className="text-xs text-[#d0c5af]/80 max-w-md leading-relaxed">
          Orfèvrerie linguistique, analyse rhétorique et répétition savante conçues pour l'autonomie absolue.
        </p>
      </section>

      {/* Global Adaptive Learning Banner (Atelier Context) */}
      <AdaptiveGlobalBanner
        context="atelier"
        onPrimaryAction={handleAdaptiveAtelierLaunch}
      />

      {/* Featured Synthesis Challenge Card */}
      <section className="relative p-5 rounded-2xl bg-gradient-to-br from-[#232a3a] via-[#191f2f] to-[#0c1322] border border-[#f2ca50]/30 shadow-xl overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#f2ca50]/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-ping" />
            <span className="text-[10px] uppercase tracking-widest text-[#f2ca50] font-bold">
              Défi Magistral du Jour
            </span>
          </div>
          <span className="text-xs text-[#d4c78f] font-mono">5 min chrono</span>
        </div>

        <div className="flex gap-4 items-center mt-2">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-md border border-[#4d4635]/40">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlH-sqSL7qrPlcH__keLRikgyPe8g_2AtcwPEXQXXvvNw_fOsRNBRnZ0YKeIF32p4JGfRQTAKTV-pmM-VIXhvfyhYPQtMrtYIYgbFLzA0nraXulfqikyl3p_99IsiE4WG4rQ4sAeLHIpfRkimusGs0O7v69_JUQyKYHZ0qbNq8a05liZWm02sgP-MUl9wXfHb-HCDzxuD8JKDyFtI4tQn9kSOFyVzXvqEoGXxrJ0UMaZr3Tb2nGHIZ"
              alt="Fountain pen on open editorial journal"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e1d]/80 via-transparent to-transparent" />
            <div className="absolute bottom-1 right-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#f2ca50] text-[#3c2f00]">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-[#d4c78f] uppercase tracking-wider font-mono">
              C1 • Rhetoric & Economics
            </span>
            <h2 className="font-serif text-base font-bold text-[#dce2f8] truncate">
              The Economist : Editorial Dictation
            </h2>
            <p className="text-xs text-[#d0c5af]/80 line-clamp-1 mt-0.5">
              Dictée de précision cadencée avec analyse de syntaxe néoclassique.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-[#f2ca50] font-bold flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-sm">stars</span> +150 XP Élite
              </span>
              <span className="text-[#99907c]">•</span>
              <span className="text-[#d0c5af]/80 text-[11px]">428 académiciens</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDictation}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-[#ffe088] active:scale-[0.98] transition-all"
        >
          <span>Initier le Défi de Synthèse</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </section>

      {/* 20 Mini-Jeux Arcade Banner */}
      {onOpenGames && (
        <section
          onClick={onOpenGames}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#172133] to-[#121927] border border-[#f2ca50]/50 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f2ca50] via-amber-500 to-amber-700 flex items-center justify-center text-[#3c2f00] shadow-md group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl font-bold">sports_esports</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-wider">
                  SALLE D'ARCADE LINGUISTIQUE
                </span>
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                  20 JEUX INTERACTIFS
                </span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                Apprends l'Anglais en Jouant (Style Duolingo)
              </h3>
              <p className="text-xs text-[#d0c5af]/80">
                Anagrammes, verbes irréguliers, pendu de l'espace, duel UK/US, expressions idiomatiques et boss battle !
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md"
          >
            <span>Jouer</span>
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        </section>
      )}

      {/* English Adventure 7-Island 3D World Banner */}
      {onOpenAdventure && (
        <section
          onClick={onOpenAdventure}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#17263f] via-[#121a2d] to-[#0c1322] border border-[#f2ca50]/55 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0c1322] border border-[#f2ca50]/55 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl">public</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-wider">
                <span>ENGLISH ADVENTURE · 7 ÎLES 3D</span>
                <span className="text-[#99907c]">·</span>
                <span className="text-emerald-300">BOSS &amp; TROPHÉES</span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                Archipel Gamifié : Vocabulaire, Grammaire, Écoute &amp; Expression
              </h3>
              <p className="text-xs text-[#d0c5af]/80">
                Missions adaptatives sans chrono, mini-jeux et défis de Boss pour débloquer cartes, avatars et thèmes.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md"
          >
            <span>Explorer l&apos;Archipel</span>
            <span className="material-symbols-outlined text-sm">explore</span>
          </button>
        </section>
      )}

      {/* Plan Principal 100 Niveaux City Map Banner */}
      {onOpenCityMap && (
        <section
          onClick={onOpenCityMap}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#191f2f] via-[#151b2b] to-[#0c1322] border border-[#f2ca50]/45 shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#f2ca50] transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0c1322] border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-md group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                map
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-wider">
                <span>PLAN PRINCIPAL · 600 NIVEAUX</span>
                <span className="text-[#99907c]">·</span>
                <span className="text-[#d4c78f]">10 CHAPITRES PAR NIVEAU</span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#dce2f8] group-hover:text-[#f2ca50] transition-colors mt-0.5">
                Cité Interactive de la 6e à la Terminale
              </h3>
              <p className="text-xs text-[#d0c5af]/80">
                Conquérez chaque quartier pas à pas : validez les 10 chapitres d&apos;un niveau pour débloquer le suivant !
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0 group-hover:bg-[#ffe088] shadow-md"
          >
            <span>Explorer le Plan</span>
            <span className="material-symbols-outlined text-sm">explore</span>
          </button>
        </section>
      )}

      {/* CEFR Level Filter */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#d4c78f] uppercase tracking-widest font-bold">
            Niveau Académique Requis
          </span>
          <span className="text-xs text-[#f2ca50] font-mono font-semibold">
            {currentLevel} : Recommandé
          </span>
        </div>

        <div ref={cefrTrackRef} className="relative grid grid-cols-3 sm:grid-cols-6 gap-2">
          <GlassSlidingCapsule containerRef={cefrTrackRef} activeKey={currentLevel} />
          {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
            const isActive = currentLevel === lvl;
            const subLabels: Record<CEFRLevel, string> = {
              A1: 'Initiation',
              A2: 'Élémentaire',
              B1: 'Seuil',
              B2: 'Avancé',
              C1: 'Autonome',
              C2: 'Maîtrise'
            };
            return (
              <button
                key={lvl}
                type="button"
                data-capsule-key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`relative z-10 flex flex-col items-center justify-center py-2.5 px-1 rounded-full transition-colors duration-200 border cursor-pointer ${
                  isActive
                    ? 'glass-capsule-active-text font-bold border-transparent'
                    : 'bg-[#191f2f] text-[#d0c5af] border-[#4d4635]/30 hover:bg-[#232a3a]'
                }`}
              >
                <span className="relative z-10 text-base font-bold font-mono">{lvl}</span>
                <span className="relative z-10 text-[10px] opacity-90 mt-0.5">{subLabels[lvl]}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#d0c5af]/80 italic pt-0.5">
          {levelDescriptions[currentLevel]}
        </p>
      </section>

      {/* Immersive Labs Grid: AI Tutor, Escape Room, Listening Cinema, Grammar Battle */}
      {(onOpenAiTutor || onOpenEscapeRoom || onOpenListeningCinema || onOpenGrammarBattle) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onOpenAiTutor && (
            <button
              type="button"
              onClick={onOpenAiTutor}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#1b2438] to-[#0e1526] border border-[#f2ca50]/45 hover:border-[#f2ca50] text-left flex items-center justify-between gap-3 shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shrink-0 shadow">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#f2ca50]">
                    Tuteur IA Gemini · 6e–Tle
                  </span>
                  <h3 className="font-serif font-bold text-sm text-[#dce2f8] group-hover:text-[#f2ca50] truncate">
                    AI English Tutor &amp; Correcteur
                  </h3>
                  <p className="text-[11px] text-[#d0c5af]/80 line-clamp-1">
                    Dialogue coaché, correction d&apos;écriture &amp; fiches adaptatives.
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#f2ca50] shrink-0">arrow_forward</span>
            </button>
          )}

          {onOpenEscapeRoom && (
            <button
              type="button"
              onClick={onOpenEscapeRoom}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#1f2236] to-[#0e1424] border border-amber-500/40 hover:border-[#f2ca50] text-left flex items-center justify-between gap-3 shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#232a3a] border border-[#f2ca50]/45 text-[#f2ca50] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">lock_open</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-300">
                    Compréhension Écrite &amp; Logique
                  </span>
                  <h3 className="font-serif font-bold text-sm text-[#dce2f8] group-hover:text-[#f2ca50] truncate">
                    English Escape Room
                  </h3>
                  <p className="text-[11px] text-[#d0c5af]/80 line-clamp-1">
                    4 salles d&apos;énigmes chronométrées et codes à déchiffrer.
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#f2ca50] shrink-0">arrow_forward</span>
            </button>
          )}

          {onOpenListeningCinema && (
            <button
              type="button"
              onClick={onOpenListeningCinema}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#23192b] to-[#0d1323] border border-rose-500/40 hover:border-[#f2ca50] text-left flex items-center justify-between gap-3 shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#232a3a] border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">movie</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-300">
                    Cinéma Audio Multi-Voix
                  </span>
                  <h3 className="font-serif font-bold text-sm text-[#dce2f8] group-hover:text-[#f2ca50] truncate">
                    Listening Cinema
                  </h3>
                  <p className="text-[11px] text-[#d0c5af]/80 line-clamp-1">
                    Scènes audio avec sous-titres VO/VF/Aveugle &amp; quiz.
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#f2ca50] shrink-0">arrow_forward</span>
            </button>
          )}

          {onOpenGrammarBattle && (
            <button
              type="button"
              onClick={onOpenGrammarBattle}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#142536] to-[#0c1322] border border-cyan-500/40 hover:border-[#f2ca50] text-left flex items-center justify-between gap-3 shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#232a3a] border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">gavel</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">
                    Arène Boss PvE
                  </span>
                  <h3 className="font-serif font-bold text-sm text-[#dce2f8] group-hover:text-[#f2ca50] truncate">
                    Grammar Battle (Collège &amp; Lycée)
                  </h3>
                  <p className="text-[11px] text-[#d0c5af]/80 line-clamp-1">
                    Brisez le bouclier syntaxique par combos de grammaire.
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#f2ca50] shrink-0">arrow_forward</span>
            </button>
          )}
        </section>
      )}

      {/* Featured Atelier 500 Dialogues Engine Card */}
      {onOpenDialogues && (
        <section className="relative rounded-2xl bg-gradient-to-br from-[#191f2f] via-[#151b2b] to-[#0c1322] p-5 border border-[#f2ca50]/50 shadow-xl overflow-hidden">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#f2ca50]/10 blur-2xl pointer-events-none" />
          <div className="flex flex-wrap items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-md shrink-0">
                <span className="material-symbols-outlined text-2xl">forum</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f2ca50]">
                    Moteur 00 • Conversations Réelles
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[10px] font-mono font-bold text-[#f2ca50]">
                    500 DIALOGUES
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] mt-0.5">
                  Atelier des 500 Dialogues (Duo, Trio &amp; Groupe)
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDialogues('all')}
              className="px-4 py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-colors"
            >
              <span>Ouvrir les 500 Dialogues</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed relative z-10">
            Apprenez à travers de vraies situations (l&apos;un demande, l&apos;autre répond) à 2 personnes, 3 personnes ou en groupe, de la 6e à la Terminale C1/C2, avec voix naturelles distinctes, repères IPA et jeu de rôle guidé.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 relative z-10">
            {DIALOGUE_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => onOpenDialogues(theme.id)}
                className="p-2.5 rounded-xl bg-[#070e1d]/85 hover:bg-[#191f2f] border border-[#232a3a] hover:border-[#f2ca50]/60 text-left flex items-center gap-2 transition-all cursor-pointer group"
              >
                <span className="material-symbols-outlined text-base text-[#f2ca50] shrink-0">
                  {theme.icon}
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#dce2f8] group-hover:text-[#f2ca50] truncate">
                    {theme.shortLabel}
                  </span>
                  <span className="block text-[10px] font-mono text-[#99907c]">
                    Duo · Trio · Groupe
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* The Core Engines List */}
      <section className="flex flex-col gap-4">
        {/* ENGINE 1: Dictation Engine */}
        <div className="group relative rounded-2xl bg-[#191f2f] p-5 border border-[#4d4635]/40 shadow-xl overflow-hidden transition-all hover:border-[#f2ca50]/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shadow-inner shrink-0">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  headphones
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#f2ca50] font-bold uppercase font-mono">
                    Moteur 01
                  </span>
                  <span className="text-[#99907c] text-xs">•</span>
                  <span className="text-[10px] text-[#d4c78f] uppercase font-sans">
                    Audio & Orthotypographie
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#dce2f8]">Dictation Engine</h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {recommendedAtelierAction === 'dictation' && (
                <span className="px-2 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[9px] font-mono font-black uppercase">
                  Focus · {weakestSkillLabel}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] font-mono border border-[#f2ca50]/30">
                500 SESSIONS
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-0.5">6e à Terminale • 10 Thèmes</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            500 sessions sur deck recto-verso interactif : écoute britannique & américaine (UK/US), saisie orthotypographique, étymologie, collocations et décryptage philologique.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#070e1d]/70 text-xs text-[#d0c5af]">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">flip</span>
              <span className="truncate">Deck Recto-Verso</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#070e1d]/70 text-xs text-[#d0c5af]">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">record_voice_over</span>
              <span className="truncate">Dual UK & US</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#070e1d]/70 text-xs text-[#d0c5af]">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">history_edu</span>
              <span className="truncate">Étymologie & Sens</span>
            </div>
          </div>

          <div className="w-full bg-[#070e1d] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#f2ca50] h-full rounded-full" style={{ width: '82%' }} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-1 border-t border-[#232a3a]">
            <span className="text-xs text-[#d4c78f] italic truncate">
              Prochaine dictée : « The Bretton Woods Paradigm »
            </span>
            <button
              type="button"
              onClick={onOpenDictation}
              className="px-4 py-2 rounded-xl bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#2e3545] font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all shrink-0 ml-2"
            >
              <span>Ouvrir l'Atelier</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ENGINE 2: Spaced Repetition Cards */}
        <div className="group relative rounded-2xl bg-[#191f2f] p-5 border border-[#4d4635]/40 shadow-xl overflow-hidden transition-all hover:border-[#f2ca50]/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#d4c78f]/30 flex items-center justify-center text-[#d4c78f] shadow-inner shrink-0">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  style
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#f2ca50] font-bold uppercase font-mono">
                    Moteur 02
                  </span>
                  <span className="text-[#99907c] text-xs">•</span>
                  <span className="text-[10px] text-[#d4c78f] uppercase font-sans">
                    Algorithme SM-2
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#dce2f8]">Spaced Repetition Cards</h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {recommendedAtelierAction === 'flashcards' && (
                <span className="px-2 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[9px] font-mono font-black uppercase">
                  Focus · {weakestSkillLabel}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#d4c78f] font-mono">
                {assessment.dueVocabularyCount} CARTES DUES
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-0.5">Rétention {assessment.vocabularyRetentionRate}%</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            Deck recto-verso dynamique : étymologie philologique, collocations C1/C2, phrases d’auteurs et auto-évaluation pondérée pour ancrer le lexique rare.
          </p>

          {/* Interactive Ultra-Elegant Miniature Spaced Repetition Preview Card */}
          <div className="relative mt-3 py-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-2 bottom-0 rounded-xl bg-[#070e1d]/70 border border-[#f2ca50]/20 -rotate-1"
            />
            <div
              onClick={() => setMiniCardFlipped((prev) => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMiniCardFlipped((prev) => !prev);
                }
              }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-[#0e1628] via-[#0a1120] to-[#070e1d] border border-[#f2ca50]/50 hover:border-[#f2ca50] shadow-lg cursor-pointer transition-all overflow-hidden"
            >
              <span aria-hidden="true" className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#f2ca50]/70" />
              <span aria-hidden="true" className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-[#f2ca50]/70" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-[#f2ca50]/70" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#f2ca50]/70" />

              {!miniCardFlipped ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center font-bold text-xs font-serif shrink-0 shadow">
                      IV
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-base font-bold text-[#f2ca50]">
                          Equivocal
                        </span>
                        <span className="text-[11px] font-mono text-sky-300">/ɪˈkwɪv.ə.kəl/</span>
                      </div>
                      <span className="text-xs text-[#d0c5af] italic truncate">
                        Toucher la carte pour révéler sens &amp; étymologie ↻
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText('Equivocal', 'en-GB', 'practice-mini-preview', {
                        naturalProsody: true
                      });
                    }}
                    className="w-8 h-8 rounded-full bg-[#191f2f] border border-[#f2ca50]/45 text-[#f2ca50] flex items-center justify-center shrink-0 hover:bg-[#f2ca50] hover:text-[#3c2f00] transition-colors cursor-pointer"
                    title="Écouter en voix naturelle"
                  >
                    <span className="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                      Verso · Sens &amp; Nuance
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-[#dce2f8]">
                      « Équivoque, ambigu — susceptible de plusieurs interprétations. »
                    </p>
                    <p className="text-[11px] text-[#99907c] truncate">
                      Racine latine : aequus (égal) + vox (voix) • Cliquer pour revenir
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl shrink-0">flip</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-[#070e1d] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#d4c78f] h-full rounded-full" style={{ width: '65%' }} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-2 border-t border-[#232a3a]">
            <span className="text-xs text-[#d4c78f] italic truncate">
              Intervalle optimal : Révision dans 3h
            </span>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenDialogueFlashcards && (
                <button
                  type="button"
                  onClick={onOpenDialogueFlashcards}
                  className="px-3 py-2 rounded-xl bg-[#151f33] hover:bg-[#1c2c4d] text-[#f2ca50] border border-[#f2ca50]/40 font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title="Réviser les expressions issues des 500 dialogues"
                >
                  <span className="material-symbols-outlined text-sm">forum</span>
                  <span>Cartes Dialogues</span>
                </button>
              )}
              {onOpenFlashcardsFocus && (
                <button
                  type="button"
                  onClick={onOpenFlashcardsFocus}
                  className="px-3 py-2 rounded-xl bg-[#151f33] hover:bg-[#1c2c4d] text-[#ffe082] border border-[#f2ca50]/40 font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title="Ouvrir directement en Mode Focus Lecture"
                >
                  <span className="material-symbols-outlined text-sm">center_focus_strong</span>
                  <span className="hidden sm:inline">Focus Lecture</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenFlashcards}
                className="px-4 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088] font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>Passer en Revue</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* ENGINE 3: Grammar & Nuance Quiz */}
        <div className="group relative rounded-2xl bg-[#191f2f] p-5 border border-[#4d4635]/40 shadow-xl overflow-hidden transition-all hover:border-[#f2ca50]/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shadow-inner shrink-0">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  quiz
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#f2ca50] font-bold uppercase font-mono">
                    Moteur 03
                  </span>
                  <span className="text-[#99907c] text-xs">•</span>
                  <span className="text-[10px] text-[#d4c78f] uppercase font-sans">
                    Syntaxe & Inversion
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#dce2f8]">Grammar & Nuance Quiz</h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {(recommendedAtelierAction === 'quiz' || recommendedAtelierAction === 'grammar_battle') && (
                <span className="px-2 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[9px] font-mono font-black uppercase">
                  Focus · {weakestSkillLabel}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] font-mono">
                NIVEAU {assessment.dynamicDirective.targetCefrForExercises}
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-0.5">Soutien adaptatif</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            Épreuves à choix multiples sélectives, pièges stylistiques, subjonctif anglais et structures inversées. Corrections disséquées par un tuteur virtuel instantané.
          </p>

          <div className="w-full bg-[#070e1d] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#f2ca50] h-full rounded-full" style={{ width: '94%' }} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-1 border-t border-[#232a3a]">
            <span className="text-xs text-[#d4c78f] italic truncate">
              Banque : 450 exercices certifiés
            </span>
            <button
              type="button"
              onClick={onOpenQuiz}
              className="px-4 py-2 rounded-xl bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#2e3545] font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all shrink-0 ml-2"
            >
              <span>Défier le Quiz</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ENGINE 4: Speaking Studio */}
        <div className="group relative rounded-2xl bg-[#191f2f] p-5 border border-[#4d4635]/40 shadow-xl overflow-hidden transition-all hover:border-[#f2ca50]/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#232a3a] border border-[#e9cd67]/30 flex items-center justify-center text-[#e9cd67] shadow-inner shrink-0">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mic
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#f2ca50] font-bold uppercase font-mono">
                    Moteur 04
                  </span>
                  <span className="text-[#99907c] text-xs">•</span>
                  <span className="text-[10px] text-[#d4c78f] uppercase font-sans">
                    Dictée & Élocution
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#dce2f8]">
                  Studio d'Élocution & Dictée Vocale
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {recommendedAtelierAction === 'speaking' && (
                <span className="px-2 py-0.5 rounded-full bg-[#f2ca50] text-[#3c2f00] text-[9px] font-mono font-black uppercase">
                  Focus · {weakestSkillLabel}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] font-mono border border-[#f2ca50]/30">
                RECONNAISSANCE IA
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-0.5">Dictée & Phonétique</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            Dictez votre pratique vocale en direct grâce à la reconnaissance vocale, recevez une correction orthographique et phonétique immédiate mot à mot (lettres muettes, /θ/, rhotisme UK/US), et comparez votre onde acoustique.
          </p>

          <div className="w-full bg-[#070e1d] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#e9cd67] h-full rounded-full" style={{ width: '65%' }} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-1 border-t border-[#232a3a]">
            <span className="text-xs text-[#d4c78f] italic truncate">
              Reconnaissance vocale active • UK 🇬🇧 & US 🇺🇸
            </span>
            <button
              type="button"
              onClick={onOpenSpeaking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] hover:from-[#ffe088] hover:to-[#ffe566] font-bold text-xs flex items-center gap-1 shadow-md shadow-[#f2ca50]/20 active:scale-95 transition-all shrink-0 ml-2 cursor-pointer"
            >
              <span>Ouvrir le Studio d'Élocution</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Cloud Security Guarantee */}
      <section className="p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/30 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#232a3a] text-[#f2ca50] shrink-0">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
        </div>
        <div className="flex flex-col text-xs">
          <span className="text-[10px] text-[#f2ca50] uppercase tracking-wider font-bold">
            Confidentialité & Cloud Archival
          </span>
          <h4 className="font-serif font-bold text-sm text-[#dce2f8] mt-0.5">
            Stockage Firestore & Storage Chiffré
          </h4>
          <p className="text-[#d0c5af]/80 mt-1 leading-relaxed">
            Vos enregistrements vocaux, dictées complétées et analyses de progression sont isolés par identifiant cryptographique (règles Firestore strictes).
          </p>
        </div>
      </section>
    </div>
  );
};
