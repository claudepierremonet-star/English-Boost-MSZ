import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { LearningAttempt } from '../firebase/types';
import { playSinglePhonemeWordDrill } from '../utils/phonemeFeedbackEngine';
import {
  computeComplexPhonemeMastery,
  getSpeakingPhonemeTelemetry,
  SPEAKING_PHONEME_UPDATED_EVENT,
  type ComplexPhonemeMasteryItem,
  type ComplexPhonemeMasteryStatus,
  type SpeakingPhonemeSessionSnapshot
} from '../utils/phoneticMasteryEngine';

export interface PhoneticMasteryWidgetProps {
  recentAttempts?: LearningAttempt[];
  onOpenSpeaking?: () => void;
}

type GaugeRingEntry = {
  name: string;
  ipa: string;
  value: number;
  displayValue: string;
  statusLabel: string;
  fill: string;
};

interface GaugeTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: GaugeRingEntry }>;
}

const PhoneticGaugeTooltip: React.FC<GaugeTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/45 px-3 py-2.5 shadow-xl text-xs">
      <div className="flex items-center justify-between gap-4 font-mono text-[#f2ca50] font-semibold">
        <span>{entry.name}</span>
        <span>{entry.ipa}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-[#dce2f8] tabular-nums">
        <span>Progression</span>
        <span className="font-mono font-bold">{entry.displayValue}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-[#99907c]">{entry.statusLabel}</div>
    </div>
  );
};

type PhonemeFilter = 'all' | 'priority';

const STATUS_DISPLAY: Record<
  ComplexPhonemeMasteryStatus,
  {
    label: string;
    icon: string;
    textClass: string;
    barClass: string;
  }
> = {
  mastered: {
    label: 'Maîtrisé',
    icon: 'check_circle',
    textClass: 'text-emerald-400',
    barClass: 'bg-emerald-400'
  },
  to_refine: {
    label: 'À affiner',
    icon: 'tune',
    textClass: 'text-[#f2ca50]',
    barClass: 'bg-[#f2ca50]'
  },
  missed: {
    label: 'À travailler',
    icon: 'warning',
    textClass: 'text-rose-400',
    barClass: 'bg-rose-400'
  },
  unassessed: {
    label: 'Non évalué',
    icon: 'radio_button_unchecked',
    textClass: 'text-[#99907c]',
    barClass: 'bg-[#232a3a]'
  }
};

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export const PhoneticMasteryWidget: React.FC<PhoneticMasteryWidgetProps> = ({
  recentAttempts = [],
  onOpenSpeaking
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [snapshots, setSnapshots] = useState<SpeakingPhonemeSessionSnapshot[]>(() =>
    getSpeakingPhonemeTelemetry()
  );
  const [filter, setFilter] = useState<PhonemeFilter>('all');
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('θ');
  const [activeDrillWord, setActiveDrillWord] = useState<string | null>(null);

  const reloadTelemetry = useCallback(() => {
    setSnapshots(getSpeakingPhonemeTelemetry());
  }, []);

  useEffect(() => {
    reloadTelemetry();
    const handleUpdate = () => reloadTelemetry();
    window.addEventListener(SPEAKING_PHONEME_UPDATED_EVENT, handleUpdate);
    window.addEventListener('eb_attempts_updated', handleUpdate);
    return () => {
      window.removeEventListener(SPEAKING_PHONEME_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('eb_attempts_updated', handleUpdate);
    };
  }, [reloadTelemetry]);

  const summary = useMemo(
    () => computeComplexPhonemeMastery(snapshots, recentAttempts),
    [snapshots, recentAttempts]
  );

  // Default focus on weakest assessed phoneme once real telemetry appears
  useEffect(() => {
    if (
      summary.weakestPhoneme &&
      !summary.phonemes.some(
        (p) => p.symbol === selectedSymbol && p.status !== 'unassessed'
      )
    ) {
      setSelectedSymbol(summary.weakestPhoneme.symbol);
    }
  }, [summary.weakestPhoneme, summary.phonemes, selectedSymbol]);

  const visiblePhonemes = useMemo(() => {
    if (filter === 'priority') {
      const priority = summary.phonemes.filter(
        (p) => p.status === 'missed' || p.status === 'to_refine'
      );
      return priority.length > 0 ? priority : summary.phonemes;
    }
    return summary.phonemes;
  }, [summary.phonemes, filter]);

  const activePhoneme: ComplexPhonemeMasteryItem = useMemo(() => {
    return (
      summary.phonemes.find((p) => p.symbol === selectedSymbol) ||
      summary.weakestPhoneme ||
      summary.phonemes[0]
    );
  }, [summary.phonemes, summary.weakestPhoneme, selectedSymbol]);

  const handlePlayWordDrill = (word: string) => {
    setActiveDrillWord(word);
    playSinglePhonemeWordDrill(word, accent, 'slow');
    setTimeout(() => {
      setActiveDrillWord((current) => (current === word ? null : current));
    }, 1500);
  };

  const hasSessions = summary.totalSpeakingSessions > 0;
  const drillWordsForInspector =
    activePhoneme.exampleWords.length > 0
      ? activePhoneme.exampleWords
      : [activePhoneme.drillWord];

  const activeStatusMeta = STATUS_DISPLAY[activePhoneme.status];
  const activeHexColor =
    activePhoneme.status === 'mastered'
      ? '#34d399'
      : activePhoneme.status === 'to_refine'
      ? '#f2ca50'
      : activePhoneme.status === 'missed'
      ? '#fb7185'
      : '#475569';

  const circularGaugeData: GaugeRingEntry[] = useMemo(() => {
    const overallVal = summary.overallMasteryPercent ?? 0;
    const selectedVal = activePhoneme.masteryPercent ?? 0;
    // Ordered inner-to-outer so Recharts renders overall inner ring & selected phoneme outer ring
    return [
      {
        name: 'Moyenne globale IPA',
        ipa: `${summary.assessedPhonemesCount}/${summary.totalTrackedPhonemes} évalués`,
        value: overallVal,
        displayValue:
          summary.overallMasteryPercent !== null
            ? `${summary.overallMasteryPercent}%`
            : 'Non évalué',
        statusLabel: hasSessions
          ? `${summary.masteredCount} phonème${summary.masteredCount > 1 ? 's' : ''} maîtrisé${summary.masteredCount > 1 ? 's' : ''}`
          : 'En attente de dictée Studio',
        fill: summary.overallMasteryPercent !== null ? '#38bdf8' : '#334155'
      },
      {
        name: activePhoneme.labelFr,
        ipa: activePhoneme.displaySymbol,
        value: selectedVal,
        displayValue:
          activePhoneme.masteryPercent !== null
            ? `${activePhoneme.masteryPercent}%`
            : 'Non évalué',
        statusLabel: activeStatusMeta.label,
        fill: activeHexColor
      }
    ];
  }, [
    summary.overallMasteryPercent,
    summary.assessedPhonemesCount,
    summary.totalTrackedPhonemes,
    summary.masteredCount,
    hasSessions,
    activePhoneme,
    activeStatusMeta.label,
    activeHexColor
  ]);

  return (
    <section
      aria-label="Phonetic Mastery"
      className="w-full rounded-2xl luxury-card-surface p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* Header Zone: Clean Title + Unboxed Metadata + Primary CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] leading-snug">
            Phonetic Mastery — Phonèmes Complexes
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#d0c5af]/85 tabular-nums">
            <span>Studio d'Élocution IPA</span>
            <span aria-hidden="true" className="text-[#99907c]">
              ·
            </span>
            <span>
              {hasSessions
                ? `${summary.totalSpeakingSessions} session${
                    summary.totalSpeakingSessions > 1 ? 's' : ''
                  } analysée${summary.totalSpeakingSessions > 1 ? 's' : ''}`
                : 'Aucune session vocale enregistrée'}
            </span>
            <span aria-hidden="true" className="text-[#99907c]">
              ·
            </span>
            <span>
              {summary.assessedPhonemesCount}/{summary.totalTrackedPhonemes} phonèmes évalués
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Interactive Filter Tabs */}
          <div
            role="group"
            aria-label="Filtrer les phonèmes"
            className="flex items-center gap-1 p-1 rounded-lg bg-[#070e1d] border border-[#232a3a]"
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                filter === 'all'
                  ? 'bg-[#191f2f] text-[#f2ca50] font-semibold'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              Tous ({summary.totalTrackedPhonemes})
            </button>
            <button
              type="button"
              onClick={() => setFilter('priority')}
              disabled={!hasSessions}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                filter === 'priority'
                  ? 'bg-[#191f2f] text-[#f2ca50] font-semibold'
                  : 'text-[#d0c5af] hover:text-[#dce2f8]'
              }`}
            >
              Prioritaires ({summary.missedCount + summary.toRefineCount})
            </button>
          </div>

          {onOpenSpeaking && (
            <button
              type="button"
              onClick={onOpenSpeaking}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] text-[#0c1322] text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ca50]"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                mic
              </span>
              <span>Studio d'Élocution</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 3-Column KPI Strip separated by hairline divider (no nested boxes) */}
      <div className="pt-4 border-t border-[#232a3a] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-[#99907c]">Précision phonémique moyenne</span>
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="font-serif text-2xl font-bold text-[#f2ca50]">
              {summary.overallMasteryPercent !== null
                ? `${summary.overallMasteryPercent}%`
                : '—'}
            </span>
            <span className="text-xs text-[#d0c5af]">
              {summary.overallMasteryPercent !== null
                ? 'sur phonèmes évalués'
                : 'En attente de dictée'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 sm:border-l sm:border-[#232a3a] sm:pl-6">
          <span className="text-xs text-[#99907c]">Phonèmes complexes maîtrisés</span>
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="font-serif text-2xl font-bold text-[#dce2f8]">
              {summary.masteredCount} / {summary.totalTrackedPhonemes}
            </span>
            <span className="text-xs text-emerald-400">
              {summary.toRefineCount > 0
                ? `${summary.toRefineCount} à affiner`
                : summary.masteredCount > 0
                ? 'Seuil ≥ 80%'
                : 'Seuil 80%'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 sm:border-l sm:border-[#232a3a] sm:pl-6">
          <span className="text-xs text-[#99907c]">Priorité articulatoire</span>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-mono text-xl font-bold text-[#dce2f8] shrink-0">
              {summary.weakestPhoneme
                ? summary.weakestPhoneme.displaySymbol
                : '/θ/'}
            </span>
            <span className="text-xs text-[#d0c5af] truncate">
              {summary.weakestPhoneme
                ? `${summary.weakestPhoneme.labelFr} (${summary.weakestPhoneme.masteryPercent}%)`
                : 'Commencez par les fricatives'}
            </span>
          </div>
        </div>
      </div>

      {/* Complex Phonemes Progress Grid + Selected Articulation Inspector */}
      <div className="pt-4 border-t border-[#232a3a] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 8 Complex Phonemes List with Tabular Progress Bars */}
        <div className="lg:col-span-7 divide-y divide-[#232a3a]">
          {visiblePhonemes.map((phoneme) => {
            const meta = STATUS_DISPLAY[phoneme.status];
            const isSelected = activePhoneme.symbol === phoneme.symbol;
            const barWidth =
              phoneme.masteryPercent !== null ? phoneme.masteryPercent : 0;

            return (
              <button
                key={phoneme.symbol}
                type="button"
                onClick={() => setSelectedSymbol(phoneme.symbol)}
                aria-pressed={isSelected}
                className={`w-full py-3 px-2.5 -mx-2.5 rounded-lg text-left transition-colors cursor-pointer flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                  isSelected
                    ? 'bg-[#191f2f]/90'
                    : 'hover:bg-[#191f2f]/45'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 text-center font-mono text-base font-bold text-[#f2ca50] shrink-0">
                      {phoneme.displaySymbol}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[#dce2f8] truncate">
                        {phoneme.labelFr}
                      </span>
                      <span className="text-xs text-[#99907c] truncate">
                        {phoneme.frPitfallNote}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${meta.textClass}`}
                    >
                      <span
                        className="material-symbols-outlined text-[15px]"
                        aria-hidden="true"
                      >
                        {meta.icon}
                      </span>
                      <span>{meta.label}</span>
                    </span>

                    {phoneme.trend !== 'none' && (
                      <span
                        className={`hidden sm:inline-flex items-center gap-0.5 text-xs font-mono ${
                          phoneme.trend === 'up'
                            ? 'text-emerald-400'
                            : phoneme.trend === 'down'
                            ? 'text-rose-400'
                            : 'text-[#99907c]'
                        }`}
                        title="Évolution par rapport aux sessions précédentes"
                      >
                        <span
                          className="material-symbols-outlined text-[14px]"
                          aria-hidden="true"
                        >
                          {phoneme.trend === 'up'
                            ? 'trending_up'
                            : phoneme.trend === 'down'
                            ? 'trending_down'
                            : 'trending_flat'}
                        </span>
                        <span>
                          {phoneme.trendDelta > 0
                            ? `+${phoneme.trendDelta}%`
                            : `${phoneme.trendDelta}%`}
                        </span>
                      </span>
                    )}

                    <span className="w-11 text-right font-mono text-sm font-bold text-[#dce2f8]">
                      {phoneme.masteryPercent !== null
                        ? `${phoneme.masteryPercent}%`
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="flex items-center gap-3 pl-[52px]">
                  <div className="flex-1 h-2 rounded-full bg-[#070e1d] overflow-hidden">
                    <motion.div
                      initial={shouldReduceMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: barWidth / 100 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: 'left center' }}
                      className={`h-full w-full rounded-full ${meta.barClass}`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#99907c] tabular-nums shrink-0 w-16 text-right">
                    {phoneme.sessionsCount > 0
                      ? `${phoneme.sessionsCount} sess.`
                      : '0 sess.'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Recharts Circular Progress Gauge + Selected Phoneme Articulation Inspector */}
        <div className="lg:col-span-5 lg:border-l lg:border-[#232a3a] lg:pl-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#99907c]">
                Jauge circulaire &amp; guide articulatoire
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-2xl font-bold text-[#f2ca50]">
                  {activePhoneme.displaySymbol}
                </span>
                <span className="text-sm font-semibold text-[#dce2f8]">
                  {activePhoneme.labelFr}
                </span>
              </div>
            </div>

            {/* UK / US Reference Pronunciation Switch */}
            <div
              role="group"
              aria-label="Accent de référence"
              className="flex items-center gap-1 p-1 rounded-lg bg-[#070e1d] border border-[#232a3a] shrink-0"
            >
              <button
                type="button"
                onClick={() => setAccent('en-GB')}
                className={`min-h-[32px] px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                  accent === 'en-GB'
                    ? 'bg-[#191f2f] text-[#f2ca50] font-semibold'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                UK
              </button>
              <button
                type="button"
                onClick={() => setAccent('en-US')}
                className={`min-h-[32px] px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                  accent === 'en-US'
                    ? 'bg-[#191f2f] text-[#f2ca50] font-semibold'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                US
              </button>
            </div>
          </div>

          {/* Recharts Dual-Ring Circular Progress Gauge */}
          <div className="flex flex-col gap-3 pb-3 border-b border-[#232a3a]">
            <div
              className="relative w-full h-[210px]"
              role="img"
              aria-label={`Jauge circulaire Recharts de maîtrise phonétique pour ${activePhoneme.displaySymbol} (${
                activePhoneme.masteryPercent !== null
                  ? `${activePhoneme.masteryPercent}%`
                  : 'non évalué'
              }) et moyenne globale (${
                summary.overallMasteryPercent !== null
                  ? `${summary.overallMasteryPercent}%`
                  : 'non évaluée'
              })`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="54%"
                  outerRadius="96%"
                  barSize={12}
                  data={circularGaugeData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: '#070e1d' }}
                    dataKey="value"
                    angleAxisId={0}
                    cornerRadius={8}
                    isAnimationActive={!shouldReduceMotion}
                  />
                  <Tooltip content={<PhoneticGaugeTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>

              {/* Center Metric Readout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <span className="font-mono text-xs font-bold text-[#f2ca50]">
                  {activePhoneme.displaySymbol}
                </span>
                <span className="font-serif text-3xl font-bold text-[#dce2f8] tabular-nums leading-tight">
                  {activePhoneme.masteryPercent !== null
                    ? `${activePhoneme.masteryPercent}%`
                    : summary.overallMasteryPercent !== null
                    ? `${summary.overallMasteryPercent}%`
                    : '—'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium mt-0.5 ${activeStatusMeta.textClass}`}
                >
                  <span
                    className="material-symbols-outlined text-[13px]"
                    aria-hidden="true"
                  >
                    {activeStatusMeta.icon}
                  </span>
                  <span>{activeStatusMeta.label}</span>
                </span>
              </div>
            </div>

            {/* Clean Unboxed Gauge Key */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs tabular-nums">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className="w-3 h-1.5 rounded-xs shrink-0"
                  style={{ backgroundColor: activeHexColor }}
                />
                <span className="text-[#dce2f8] truncate">
                  Anneau externe · {activePhoneme.displaySymbol}
                </span>
                <span className="font-mono font-bold text-[#f2ca50]">
                  {activePhoneme.masteryPercent !== null
                    ? `${activePhoneme.masteryPercent}%`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className="w-3 h-1.5 rounded-xs shrink-0"
                  style={{
                    backgroundColor:
                      summary.overallMasteryPercent !== null ? '#38bdf8' : '#334155'
                  }}
                />
                <span className="text-[#d0c5af] truncate">
                  Anneau interne · Global
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {summary.overallMasteryPercent !== null
                    ? `${summary.overallMasteryPercent}%`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs leading-relaxed text-[#dce2f8]/90">
            <p>{activePhoneme.articulationFr}</p>
            <p className="text-[#d0c5af]/85">
              <span className="font-semibold text-amber-300">Piège fréquent : </span>
              {activePhoneme.commonMistakeFr}
            </p>
          </div>

          {/* Interactive Slow Reference Word Drills (0.76x) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#232a3a]">
            <span className="text-xs text-[#99907c]">
              Écouter un modèle lent (0,76×)
            </span>
            <div className="flex flex-wrap gap-2">
              {drillWordsForInspector.map((word) => {
                const isPlaying = activeDrillWord === word;
                return (
                  <button
                    key={word}
                    type="button"
                    onClick={() => handlePlayWordDrill(word)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#f2ca50] ${
                      isPlaying
                        ? 'bg-[#f2ca50] text-[#0c1322] border-[#f2ca50] font-semibold'
                        : 'bg-[#070e1d] text-[#dce2f8] border-[#232a3a] hover:border-[#f2ca50]/60'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      aria-hidden="true"
                    >
                      volume_up
                    </span>
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Studio d'Élocution Sessions or Honest Empty State */}
          <div className="pt-3 border-t border-[#232a3a] flex flex-col gap-2">
            {hasSessions ? (
              <>
                <span className="text-xs text-[#99907c]">
                  Dernières sessions Studio d'Élocution
                </span>
                <ul className="divide-y divide-[#232a3a]">
                  {summary.recentSessions.slice(0, 3).map((sess) => (
                    <li
                      key={sess.sessionId}
                      className="py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[#dce2f8] font-medium truncate">
                          {sess.title}
                        </span>
                        <span className="text-[11px] text-[#99907c] tabular-nums">
                          {sess.targetAccent === 'en-GB' ? 'UK RP' : 'US GenAm'} ·{' '}
                          {formatShortDate(sess.recordedAt)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#f2ca50] tabular-nums shrink-0">
                        {sess.phonemeAccuracyScore}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex flex-col gap-2.5 text-xs text-[#d0c5af]/85 leading-relaxed">
                <p>
                  Aucune performance vocale enregistrée pour l’instant. Réalisez une
                  session dans le Studio d'Élocution pour suivre votre progression réelle
                  sur ces 8 phonèmes complexes.
                </p>
                {onOpenSpeaking && (
                  <button
                    type="button"
                    onClick={onOpenSpeaking}
                    className="min-h-[40px] px-4 py-2 rounded-lg border border-[#f2ca50]/50 text-[#f2ca50] hover:bg-[#f2ca50]/10 text-xs font-semibold self-start inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      aria-hidden="true"
                    >
                      record_voice_over
                    </span>
                    <span>Lancer une première évaluation</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
