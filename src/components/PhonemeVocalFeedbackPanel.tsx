import React, { useState } from 'react';
import type { LoadedContextSkillEntry } from '../services/skillsService';
import {
  playSinglePhonemeWordDrill,
  type PhonemeEvaluationResult,
  type ReferencePhonemeStatus,
  type VocalFeedbackPhase,
  type VocalFeedbackPlaybackMode
} from '../utils/phonemeFeedbackEngine';

export interface PhonemeVocalFeedbackPanelProps {
  evaluation: PhonemeEvaluationResult;
  targetAccent: 'en-GB' | 'en-US';
  skillLoadedEntry: LoadedContextSkillEntry | null;
  skillLoadState: 'loading' | 'loaded' | 'disabled' | 'unavailable';
  skillLoadReason?: string;
  autoFeedbackEnabled: boolean;
  onToggleAutoFeedback: (enabled: boolean) => void;
  playbackMode: VocalFeedbackPlaybackMode;
  onChangePlaybackMode: (mode: VocalFeedbackPlaybackMode) => void;
  activePhase: VocalFeedbackPhase;
  onPlayFeedback: (modeOverride?: VocalFeedbackPlaybackMode) => void;
  onStopFeedback: () => void;
}

const PHASE_LABELS: Record<VocalFeedbackPhase, string> = {
  idle: 'Prêt pour écoute',
  coaching_fr: 'Coach articulatoire (FR)',
  modeling_words_slow: 'Modèle phonèmes lents (0.78×)',
  modeling_sentence: 'Phrase de référence (EN)'
};

export const PhonemeVocalFeedbackPanel: React.FC<PhonemeVocalFeedbackPanelProps> = ({
  evaluation,
  targetAccent,
  skillLoadedEntry,
  skillLoadState,
  skillLoadReason,
  autoFeedbackEnabled,
  onToggleAutoFeedback,
  playbackMode,
  onChangePlaybackMode,
  activePhase,
  onPlayFeedback,
  onStopFeedback
}) => {
  const [selectedPhoneme, setSelectedPhoneme] = useState<ReferencePhonemeStatus | null>(
    () => evaluation.phonemeStatuses.find((p) => p.status !== 'mastered') || evaluation.phonemeStatuses[0] || null
  );
  const [showSkillDirectives, setShowSkillDirectives] = useState<boolean>(false);

  const isPlaying = activePhase !== 'idle';
  const accentBadge = targetAccent === 'en-GB' ? '🇬🇧 Oxford RP' : '🇺🇸 GenAm';

  const statusTone = (status: ReferencePhonemeStatus['status']) => {
    switch (status) {
      case 'mastered':
        return {
          chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25',
          dot: 'bg-emerald-400',
          label: 'Maîtrisé'
        };
      case 'to_refine':
        return {
          chip: 'bg-amber-500/15 text-amber-300 border-amber-400/45 hover:bg-amber-500/25',
          dot: 'bg-amber-400',
          label: 'À affiner'
        };
      case 'missed':
        return {
          chip: 'bg-rose-500/15 text-rose-300 border-rose-500/45 hover:bg-rose-500/25',
          dot: 'bg-rose-400',
          label: 'Écart détecté'
        };
      default:
        return {
          chip: 'bg-slate-500/15 text-slate-300 border-slate-400/40 hover:bg-slate-500/25',
          dot: 'bg-slate-400',
          label: 'Incertain / Non capté'
        };
    }
  };

  return (
    <section
      aria-label="Rétroaction vocale automatisée sur les phonèmes de référence"
      className="preserve-dark-surface p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#121a2d] via-[#0e1526] to-[#0a101f] border border-[#f2ca50]/45 shadow-xl flex flex-col gap-4 animate-fadeIn"
    >
      {/* Header: Skill Integration Badge & Phoneme Accuracy Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232a3a] pb-3.5">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs">graphic_eq</span>
              <span>Rétroaction Vocale Phonémique</span>
            </span>

            {skillLoadState === 'loaded' && skillLoadedEntry ? (
              <button
                type="button"
                onClick={() => setShowSkillDirectives((v) => !v)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[10px] font-mono font-semibold hover:bg-emerald-500/25 transition-colors cursor-pointer"
                title="Afficher les instructions réelles chargées depuis SKILL_71298540.md"
              >
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>Skill active : {skillLoadedEntry.name}</span>
                <span className="opacity-75">({skillLoadedEntry.contentBytes} o)</span>
                <span className="material-symbols-outlined text-[12px]">
                  {showSkillDirectives ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            ) : skillLoadState === 'disabled' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 text-[10px] font-mono">
                <span className="material-symbols-outlined text-[12px]">pause_circle</span>
                <span>Skill désactivée dans l’administration</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/15 border border-slate-400/30 text-slate-300 text-[10px] font-mono">
                <span className="material-symbols-outlined text-[12px]">info</span>
                <span>{skillLoadState === 'loading' ? 'Chargement Skill...' : 'Mode phonémique local'}</span>
              </span>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Analyse par Phonèmes de Référence</span>
            <span className="text-xs font-mono font-normal text-[#d4c78f]">({accentBadge})</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex flex-col items-center px-3.5 py-2 rounded-xl bg-[#091122] border border-[#f2ca50]/45 min-w-[105px]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#d4c78f]">
              Phonèmes Justes
            </span>
            <span className="font-mono text-xl font-black text-[#f2ca50]">
              {evaluation.phonemeAccuracyScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Real Loaded Skill Instructions (Zero Simulation) */}
      {showSkillDirectives && skillLoadedEntry && (
        <div className="p-3.5 rounded-xl bg-[#091122] border border-emerald-500/30 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-emerald-300">
            <span>
              Source : <strong>{skillLoadedEntry.skillFilePath}</strong>
            </span>
            {skillLoadedEntry.sha256 && (
              <span className="opacity-75">SHA-256 : {skillLoadedEntry.sha256.slice(0, 12)}…</span>
            )}
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-[#cbd5e1] leading-relaxed">
            {skillLoadedEntry.instructionsMarkdown}
          </pre>
        </div>
      )}

      {skillLoadState === 'disabled' && skillLoadReason && (
        <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
          {skillLoadReason} — aucune activation simulée : réactivez « Intelligence Audio &amp; Voix » dans l’onglet Skills si nécessaire.
        </p>
      )}

      {/* Automated Vocal Feedback Controller & Coaching Transcript */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#091122] border border-[#232a3a] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => (isPlaying ? onStopFeedback() : onPlayFeedback())}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                isPlaying
                  ? 'bg-[#ffb4ab] text-[#690005] hover:bg-[#ff9c90]'
                  : 'bg-[#f2ca50] text-[#2c2000] hover:bg-[#ffe088]'
              }`}
              aria-label={isPlaying ? 'Arrêter la rétroaction vocale' : 'Écouter la rétroaction vocale automatisée'}
            >
              <span className="material-symbols-outlined text-base">
                {isPlaying ? 'stop_circle' : 'campaign'}
              </span>
              <span>{isPlaying ? 'Arrêter le Coach' : 'Écouter la Rétroaction Vocale'}</span>
            </button>

            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                isPlaying
                  ? 'bg-[#f2ca50]/15 text-[#f2ca50] border-[#f2ca50]/40 animate-pulse'
                  : 'bg-[#151b2b] text-[#94a3b8] border-white/10'
              }`}
            >
              {PHASE_LABELS[activePhase]}
            </span>
          </div>

          {/* Auto-feedback toggle + playback mode */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#151b2b] rounded-lg p-0.5 border border-white/5 text-[10px] font-mono">
              {(
                [
                  { id: 'full', label: 'Complet FR+EN' },
                  { id: 'coaching_only', label: 'Coach FR' },
                  { id: 'drill_only', label: 'Phonèmes 0.78×' }
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangePlaybackMode(m.id)}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    playbackMode === m.id
                      ? 'bg-[#f2ca50] text-[#2c2000] font-bold'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#d4c78f] cursor-pointer select-none px-2 py-1 rounded-lg bg-[#151b2b] border border-white/5">
              <input
                type="checkbox"
                checked={autoFeedbackEnabled}
                onChange={(e) => onToggleAutoFeedback(e.target.checked)}
                className="accent-[#f2ca50] w-3.5 h-3.5 cursor-pointer"
              />
              <span>Auto après dictée</span>
            </label>
          </div>
        </div>

        {/* Coaching script preview */}
        <div className="p-3 rounded-lg bg-[#111829] border border-white/5 text-xs text-[#dce2f8] leading-relaxed flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#f2ca50] text-base shrink-0 mt-0.5">
            record_voice_over
          </span>
          <div className="flex flex-col gap-1">
            <p>{evaluation.vocalFeedbackPlan.coachingScriptFr}</p>
            {evaluation.vocalFeedbackPlan.modelDrillWords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono text-[#94a3b8]">Mots modèles enchaînés :</span>
                {evaluation.vocalFeedbackPlan.modelDrillWords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => playSinglePhonemeWordDrill(word, targetAccent, 'slow')}
                    className="px-2 py-0.5 rounded bg-[#f2ca50]/10 hover:bg-[#f2ca50]/25 border border-[#f2ca50]/30 text-[#ffe082] text-[11px] font-mono cursor-pointer transition-colors"
                    title={`Écouter « ${word} » au ralenti (0.76×)`}
                  >
                    🔊 {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reference Phonemes Matrix */}
      {evaluation.phonemeStatuses.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d4c78f] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">translate</span>
              <span>Phonèmes de Référence du Passage ({evaluation.phonemeStatuses.length})</span>
            </h4>
            <span className="text-[10px] font-mono text-[#94a3b8]">
              Cliquez sur un phonème pour ouvrir son guide articulatoire
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {evaluation.phonemeStatuses.map((item) => {
              const tone = statusTone(item.status);
              const isSelected = selectedPhoneme?.symbol === item.symbol;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => setSelectedPhoneme(isSelected ? null : item)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${tone.chip} ${
                    isSelected ? 'ring-2 ring-[#f2ca50] scale-[1.03]' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                  <span className="font-bold text-sm">{item.symbol}</span>
                  <span className="text-[10px] opacity-80">×{item.occurrences}</span>
                </button>
              );
            })}
          </div>

          {selectedPhoneme && (
            <div className="p-3.5 rounded-xl bg-[#151b2b] border border-[#f2ca50]/45 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-[#091122] border border-[#f2ca50]/40 font-mono font-bold text-[#f2ca50]">
                    {selectedPhoneme.symbol}
                  </span>
                  <span className="text-xs font-bold text-white">{selectedPhoneme.labelFr}</span>
                  <span className="text-[10px] font-mono text-[#d4c78f]">
                    • {statusTone(selectedPhoneme.status).label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoneme(null)}
                  className="text-[#94a3b8] hover:text-white cursor-pointer"
                  aria-label="Fermer le détail du phonème"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {selectedPhoneme.guide && (
                <div className="text-xs text-[#dce2f8] flex flex-col gap-1">
                  <p>{selectedPhoneme.guide.articulationFr}</p>
                  <p className="text-[11px] text-[#fbbf24]">
                    Piège fréquent : {selectedPhoneme.guide.commonMistakeFr}
                  </p>
                </div>
              )}

              {selectedPhoneme.exampleWords.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-[#94a3b8]">Entraînement ciblé :</span>
                  {selectedPhoneme.exampleWords.map((exWord) => (
                    <span
                      key={exWord}
                      className="inline-flex items-center rounded-lg bg-[#091122] border border-white/10 overflow-hidden"
                    >
                      <span className="px-2 py-1 text-xs font-mono text-[#dce2f8]">{exWord}</span>
                      <button
                        type="button"
                        onClick={() => playSinglePhonemeWordDrill(exWord, targetAccent, 'slow')}
                        className="px-1.5 py-1 text-[10px] font-mono bg-[#f2ca50]/15 hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#2c2000] transition-colors cursor-pointer"
                        title={`Écouter ${exWord} à 0.76×`}
                      >
                        0.76×
                      </button>
                      <button
                        type="button"
                        onClick={() => playSinglePhonemeWordDrill(exWord, targetAccent, 'normal')}
                        className="px-1.5 py-1 text-[10px] font-mono bg-[#38bdf8]/15 hover:bg-[#38bdf8] text-[#38bdf8] hover:text-[#0c1322] transition-colors cursor-pointer"
                        title={`Écouter ${exWord} à 1.0×`}
                      >
                        1.0×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Priority Deviations List */}
      {evaluation.deviations.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f2ca50] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Ajustements Phonémiques Prioritaires ({evaluation.deviations.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {evaluation.deviations.slice(0, 4).map((dev) => (
              <div
                key={dev.id}
                className="p-3 rounded-xl bg-[#091122] border border-[#232a3a] hover:border-[#f2ca50]/45 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-sm text-white">« {dev.word} »</span>
                      <span className="font-mono text-xs text-[#f2ca50]">{dev.referencePhonemes}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#94a3b8] truncate">
                      Cible {dev.keyPhoneme} • Capté : {dev.spokenWord}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => playSinglePhonemeWordDrill(dev.drillPhraseEn, targetAccent, 'slow')}
                      className="px-2 py-1 rounded-lg bg-[#f2ca50]/15 hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#2c2000] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      title={`Modèle lent pour ${dev.word}`}
                    >
                      0.76×
                    </button>
                    <button
                      type="button"
                      onClick={() => playSinglePhonemeWordDrill(dev.drillPhraseEn, targetAccent, 'normal')}
                      className="px-2 py-1 rounded-lg bg-[#38bdf8]/15 hover:bg-[#38bdf8] text-[#38bdf8] hover:text-[#0c1322] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      title={`Modèle normal pour ${dev.word}`}
                    >
                      1.0×
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#dce2f8]/90 leading-relaxed">{dev.articulationTipFr}</p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8391ac] pt-1 border-t border-white/5">
                  <span>
                    Segment : {dev.startSec?.toFixed(1)}s – {dev.endSec?.toFixed(1)}s
                  </span>
                  <span>Confiance : {Math.round(dev.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Telemetry Footer (audio-music-intelligence compliance) */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#232a3a] text-[10px] font-mono text-[#8391ac]">
        <div className="flex items-center gap-3 flex-wrap">
          <span>Source : {evaluation.telemetry.format}</span>
          <span>Langue : {evaluation.telemetry.language}</span>
          <span>Durée : {evaluation.telemetry.durationSec.toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span>Confiance moyenne : {Math.round(evaluation.telemetry.avgConfidence * 100)}%</span>
          <span className={evaluation.uncertainSegmentsCount > 0 ? 'text-amber-300' : 'text-emerald-300'}>
            Segments incertains/omis : {evaluation.uncertainSegmentsCount}
          </span>
        </div>
      </div>
    </section>
  );
};
