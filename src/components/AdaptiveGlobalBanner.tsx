import React, { useState } from 'react';
import { useAdaptiveProfile } from '../hooks/useAdaptiveProfile';
import {
  SKILL_META,
  toggleTenMinBlockCompleted,
  type TenMinuteSessionBlock
} from '../services/adaptiveEngine';
import { speakText } from '../services/speechService';
import type { CEFRLevel, SchoolGrade } from '../firebase/types';

export type AdaptiveBannerContext = 'cursus' | 'game' | 'atelier';

interface AdaptiveGlobalBannerProps {
  context: AdaptiveBannerContext;
  onOpenPlacement?: () => void;
  onPrimaryAction?: () => void;
  onLaunchTenMinAction?: (actionTarget: TenMinuteSessionBlock['actionTarget']) => void;
  primaryActionLabelOverride?: string;
  onSelectRecommendedGrade?: (grade: SchoolGrade, cefr?: CEFRLevel) => void;
}

export const AdaptiveGlobalBanner: React.FC<AdaptiveGlobalBannerProps> = ({
  context,
  onOpenPlacement,
  onPrimaryAction,
  onLaunchTenMinAction,
  primaryActionLabelOverride
}) => {
  const { user, assessment, completedTenMinIds } = useAdaptiveProfile();
  const [expanded, setExpanded] = useState<boolean>(false);

  const { dynamicDirective, majorSkillBalances, modulePlans, tenMinuteSession } = assessment;

  const modeBadgeStyle =
    dynamicDirective.mode === 'scaffolded'
      ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'
      : dynamicDirective.mode === 'accelerated'
      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
      : 'bg-sky-500/15 border-sky-400/50 text-sky-200';

  const speedLabel =
    assessment.learningSpeed === 'fast'
      ? 'Rapide'
      : assessment.learningSpeed === 'methodical'
      ? 'Méthodique'
      : 'Régulier';

  const contextHeadline =
    context === 'cursus'
      ? modulePlans.cursus.rationaleFr
      : context === 'game'
      ? modulePlans.game.rationaleFr
      : modulePlans.atelier.rationaleFr;

  const defaultPrimaryLabel =
    context === 'cursus'
      ? 'Ouvrir Leçon Adaptée'
      : context === 'game'
      ? `Défi Adapté : ${modulePlans.game.recommendedGameTitle}`
      : `Lancer : ${modulePlans.atelier.recommendedEngineTitle}`;

  const handleOpenPlacement = () => {
    if (onOpenPlacement) {
      onOpenPlacement();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eb_open_placement_modal'));
    }
  };

  const handleLaunchTenMin = (block: TenMinuteSessionBlock) => {
    toggleTenMinBlockCompleted(block.id, true);
    if (onLaunchTenMinAction) {
      onLaunchTenMinAction(block.actionTarget);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('eb_launch_ecosystem_target', { detail: block.actionTarget })
      );
    }
  };

  const doneCount = tenMinuteSession.filter((b) => completedTenMinIds.includes(b.id)).length;

  return (
    <section
      aria-label="Moteur d'apprentissage adaptatif contextuel"
      className="rounded-2xl bg-gradient-to-br from-[#151d30] via-[#12192b] to-[#0c1322] border border-[#f2ca50]/45 p-4 shadow-xl space-y-3"
    >
      {/* Top Row: Adaptive Status + Telemetry + Primary Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[10px] font-mono font-bold text-[#f2ca50] uppercase">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              Moteur Adaptatif Global
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${modeBadgeStyle}`}>
              {dynamicDirective.badgeLabel}
            </span>
            <span className="text-[11px] font-mono text-[#d4c78f] tabular-nums">
              {assessment.gradeMeta.shortLabel} · {assessment.profile.assessedCefrLevel} ({assessment.multiSignal.confidenceScore}% conf. · {assessment.multiSignal.signalsCount} signaux)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#dce2f8] font-medium leading-snug">
            {contextHeadline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="px-3.5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              <span>{primaryActionLabelOverride || defaultPrimaryLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#f2ca50]/35 text-[#f2ca50] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">timer</span>
            <span>Session 10m ({doneCount}/4) &amp; Règles</span>
            <span className="material-symbols-outlined text-sm">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenPlacement}
            className="px-3 py-2 rounded-xl bg-[#0c1322] hover:bg-[#191f2f] border border-[#2e3545] hover:border-[#f2ca50]/50 text-[#d0c5af] hover:text-[#f2ca50] font-semibold text-xs flex items-center gap-1 cursor-pointer"
            title="Configurer classe, âge, objectifs ou passer le test de placement"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>{user.placementTest ? 'Diagnostic' : 'Test Niveau'}</span>
          </button>
        </div>
      </div>

      {/* Compact Balanced 4-Skill + Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-2 border-t border-[#232a3a]/80">
        {majorSkillBalances.map((m) => {
          const isWeakest = assessment.profile.weakestSkills.includes(m.key);
          return (
            <div
              key={m.key}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-1 ${
                isWeakest
                  ? 'bg-amber-950/35 border-amber-500/45 text-amber-200'
                  : 'bg-[#0c1322]/90 border-[#232a3a] text-[#d0c5af]'
              }`}
              title={`${m.labelFr} : ${m.score}%`}
            >
              <span className="flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-xs text-[#f2ca50]">{m.icon}</span>
                <span className="truncate">{m.labelFr.replace('Compréhension ', '').replace('Expression ', '')}</span>
              </span>
              <span className="font-mono font-bold tabular-nums">{m.score}%</span>
            </div>
          );
        })}

        <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322]/90 border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
          <span className="truncate">Vitesse</span>
          <span className="font-mono font-bold text-sky-300">{speedLabel}</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322]/90 border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
          <span className="truncate">Erreurs</span>
          <span className="font-mono font-bold text-rose-300 tabular-nums">{assessment.errorFrequency}%</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322]/90 border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
          <span className="truncate">Rétention</span>
          <span className="font-mono font-bold text-emerald-300 tabular-nums">{assessment.vocabularyRetentionRate}%</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-[#0c1322]/90 border border-[#232a3a] text-[11px] flex items-center justify-between gap-1 text-[#d0c5af]">
          <span className="truncate">Équilibre</span>
          <span className="font-mono font-bold text-[#f2ca50] tabular-nums">{assessment.skillBalanceScore}%</span>
        </div>
      </div>

      {/* Expanded Drawer: Dynamic Rule/Examples OR Stretch Challenge + 10-Min Balanced Session */}
      {expanded && (
        <div className="pt-3 border-t border-[#232a3a] grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left: Dynamic Pedagogical Feedback (Scaffolded Rule+Examples OR Accelerated Vocab+Challenge) */}
          <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#f2ca50]">
                {dynamicDirective.mode === 'scaffolded'
                  ? 'Soutien Pédagogique : Règle & Exemples Guidés'
                  : dynamicDirective.mode === 'accelerated'
                  ? 'Défi Excellence : Vocabulaire C1/C2 & Autonomie'
                  : 'Conseil Ciblé du Moment'}
              </span>
              <span className="text-[10px] font-mono text-[#99907c]">
                Focus : {SKILL_META[assessment.profile.weakestSkills[0]].labelFr}
              </span>
            </div>

            <p className="text-xs text-[#dce2f8] leading-relaxed">
              {dynamicDirective.ruleExplanationFr}
            </p>

            <div className="space-y-1.5">
              {dynamicDirective.examplesEn.map((ex, i) => (
                <div
                  key={i}
                  onClick={() => speakText(ex, 'en-GB', `banner-ex-${i}`, { rate: dynamicDirective.recommendedAudioRate })}
                  className="p-2 rounded-lg bg-[#151b2b] border border-[#232a3a] hover:border-[#f2ca50]/45 flex items-center justify-between gap-2 text-xs text-[#ffe088] italic cursor-pointer"
                >
                  <span>« {ex} »</span>
                  <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0">volume_up</span>
                </div>
              ))}
            </div>

            {dynamicDirective.mode === 'accelerated' && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {dynamicDirective.advancedChallengeWords.map((w) => (
                  <button
                    key={w.term}
                    type="button"
                    onClick={() => speakText(w.term, 'en-GB', `stretch-${w.term}`)}
                    className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-200 cursor-pointer"
                    title={w.frenchDef}
                  >
                    <strong>{w.term}</strong> · {w.frenchDef}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Daily 10-Minute Balanced Session */}
          <div className="p-3.5 rounded-xl bg-[#0c1322] border border-[#232a3a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#f2ca50]">
                Session Équilibrée 10 Min · 4 Piliers ({doneCount}/4)
              </span>
              <span className="text-[10px] font-mono text-emerald-300">
                {assessment.gradeMeta.cycle} · {dynamicDirective.targetCefrForExercises}
              </span>
            </div>

            <div className="space-y-1.5">
              {tenMinuteSession.map((block) => {
                const isDone = completedTenMinIds.includes(block.id);
                return (
                  <div
                    key={block.id}
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-[#151b2b] border-[#2e3545]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTenMinBlockCompleted(block.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-[#f2ca50]/50 text-transparent hover:border-[#f2ca50]'
                        }`}
                        aria-label={`Marquer ${block.title} terminé`}
                      >
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#dce2f8] truncate">
                          {block.order}. {block.title}
                        </div>
                        <div className="text-[10px] text-[#99907c] truncate">
                          {block.minutes} min · {block.skillLabel} · {block.difficultyTag}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchTenMin(block)}
                      className="px-2.5 py-1 rounded-lg bg-[#232a3a] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#3c2f00] font-bold text-[10px] font-mono cursor-pointer shrink-0 transition-colors"
                    >
                      Go →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
