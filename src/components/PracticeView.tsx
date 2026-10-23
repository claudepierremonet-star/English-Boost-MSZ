import React from 'react';
import type { CEFRLevel } from '../firebase/types';

interface PracticeViewProps {
  currentLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
  onOpenDictation: () => void;
  onOpenFlashcards: () => void;
  onOpenFlashcardsFocus?: () => void;
  onOpenQuiz: () => void;
  onOpenSpeaking: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  currentLevel,
  onSelectLevel,
  onOpenDictation,
  onOpenFlashcards,
  onOpenFlashcardsFocus,
  onOpenQuiz,
  onOpenSpeaking
}) => {
  const levelDescriptions: Record<CEFRLevel, string> = {
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
            <span className="text-[#f2ca50] font-mono font-bold">4 / 4 DISPONIBLES</span>
          </div>
        </div>
        <p className="text-xs text-[#d0c5af]/80 max-w-md leading-relaxed">
          Orfèvrerie linguistique, analyse rhétorique et répétition savante conçues pour l'autonomie absolue.
        </p>
      </section>

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

        <div className="grid grid-cols-4 gap-2">
          {(['B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
            const isActive = currentLevel === lvl;
            const subLabels: Record<CEFRLevel, string> = {
              B1: 'Seuil',
              B2: 'Avancé',
              C1: 'Autonome',
              C2: 'Maîtrise'
            };
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLevel(lvl)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-lg shadow-[#f2ca50]/20 font-bold scale-[1.02]'
                    : 'bg-[#191f2f] text-[#d0c5af] border-[#4d4635]/30 hover:bg-[#232a3a]'
                }`}
              >
                <span className="text-base font-bold font-mono">{lvl}</span>
                <span className="text-[10px] opacity-90 mt-0.5">{subLabels[lvl]}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#d0c5af]/80 italic pt-0.5">
          {levelDescriptions[currentLevel]}
        </p>
      </section>

      {/* The 4 Core Engines List */}
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

            <div className="flex flex-col items-end">
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] font-mono">
                82% ACCOMPLI
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-1">14/18 Sessions</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            Écoute attentive de sources certifiées (BBC, Cambridge, The Economist), saisie en direct, correction contextuelle avec tolérance intelligente et cartographie des fautes.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#070e1d]/70 text-xs text-[#d0c5af]">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">graphic_eq</span>
              <span className="truncate">Voix Authentiques</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#070e1d]/70 text-xs text-[#d0c5af]">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">spellcheck</span>
              <span className="truncate">Tolérance Finesse</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#070e1d]/70 text-xs text-[#d0c5af]">
              <span className="material-symbols-outlined text-[#f2ca50] text-sm">analytics</span>
              <span className="truncate">Diagnostic Immédiat</span>
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

            <div className="flex flex-col items-end">
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#d4c78f] font-mono">
                34 CARTES DUES
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-1">260 Mémorisées</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            Deck recto-verso dynamique : étymologie philologique, collocations C1/C2, phrases d’auteurs et auto-évaluation pondérée pour ancrer le lexique rare.
          </p>

          {/* Miniature Flashcard Preview */}
          <div className="mt-3 p-3 rounded-xl bg-[#070e1d]/90 flex items-center justify-between border border-[#4d4635]/30">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded bg-[#4f471b] text-[#c2b57f] flex items-center justify-center font-bold text-xs font-serif">
                IV
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#dce2f8]">Equivocal (adj.)</span>
                <span className="text-xs text-[#d0c5af]/80 italic">
                  « Open to more than one interpretation; deliberately ambiguous. »
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#99907c] text-xl">flip</span>
          </div>

          <div className="w-full bg-[#070e1d] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#d4c78f] h-full rounded-full" style={{ width: '65%' }} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-1 border-t border-[#232a3a]">
            <span className="text-xs text-[#d4c78f] italic truncate">
              Intervalle optimal : Révision dans 3h
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {onOpenFlashcardsFocus && (
                <button
                  type="button"
                  onClick={onOpenFlashcardsFocus}
                  className="px-3 py-2 rounded-xl bg-[#151f33] hover:bg-[#1c2c4d] text-[#ffe082] border border-[#f2ca50]/40 font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  title="Ouvrir directement en Mode Focus Lecture"
                >
                  <span className="material-symbols-outlined text-sm">center_focus_strong</span>
                  <span className="hidden sm:inline">Focus Lecture</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenFlashcards}
                className="px-4 py-2 rounded-xl bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#2e3545] font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
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

            <div className="flex flex-col items-end">
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] font-mono">
                NIVEAU EXPERT
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-1">Score Moyen : 94%</span>
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
                    Prosodie & Accent
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#dce2f8]">Speaking Studio</h3>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="px-2 py-0.5 rounded-full bg-[#070e1d] text-[10px] font-bold text-[#f2ca50] font-mono">
                STUDIO HD
              </span>
              <span className="text-[11px] text-[#d0c5af]/80 mt-1">Enregistrement Voix</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] mt-3 leading-relaxed">
            Écoute du locuteur de référence britannique ou nord-américain, capture de votre flux vocal en direct, réécoute synchronisée et feedback visuel de l'intonation.
          </p>

          <div className="w-full bg-[#070e1d] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#e9cd67] h-full rounded-full" style={{ width: '48%' }} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-1 border-t border-[#232a3a]">
            <span className="text-xs text-[#d4c78f] italic truncate">
              Calibration : Micro actif HD
            </span>
            <button
              type="button"
              onClick={onOpenSpeaking}
              className="px-4 py-2 rounded-xl bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#2e3545] font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all shrink-0 ml-2"
            >
              <span>Lancer l'Enregistrement</span>
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
