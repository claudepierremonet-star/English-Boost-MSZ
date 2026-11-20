import React, { useState, useEffect, useMemo } from 'react';
import type {
  UserProfile,
  ProgressChartAnnotation,
  ChartAnnotationCategory
} from '../firebase/types';
import {
  getThirtyDayWeeklyXpHistory,
  getChartAnnotations,
  saveChartAnnotation,
  deleteChartAnnotation,
  type ThirtyDayWeeklyXpPoint,
  type ThirtyDayDailyXpPoint,
  type ThirtyDayWeeklyXpResult
} from '../firebase/client';
import { exportProgressReportPdf } from '../utils/progressPdfExporter';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot
} from 'recharts';

interface ProgressHistorySectionProps {
  user: UserProfile;
  className?: string;
}

type ChartGranularity = 'weekly' | 'daily';

const ANNOTATION_CATEGORY_META: Record<
  ChartAnnotationCategory,
  { label: string; symbol: string; color: string; pillClass: string }
> = {
  milestone: {
    label: 'Étape / Cap',
    symbol: '★',
    color: '#f2ca50',
    pillClass: 'bg-[#f2ca50]/15 border-[#f2ca50]/45 text-[#f2ca50]'
  },
  exam: {
    label: 'Examen / Test',
    symbol: '◆',
    color: '#38bdf8',
    pillClass: 'bg-sky-950/60 border-sky-400/45 text-sky-300'
  },
  streak: {
    label: 'Série / Défi',
    symbol: '▲',
    color: '#34d399',
    pillClass: 'bg-emerald-950/60 border-emerald-400/45 text-emerald-300'
  },
  note: {
    label: 'Note perso',
    symbol: '✎',
    color: '#c084fc',
    pillClass: 'bg-purple-950/60 border-purple-400/45 text-purple-300'
  }
};

interface WeeklyTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ThirtyDayWeeklyXpPoint }>;
  annotationsByKey: Map<string, ProgressChartAnnotation[]>;
}

const WeeklyXpTooltip: React.FC<WeeklyTooltipProps> = ({ active, payload, annotationsByKey }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const pointAnnotations = annotationsByKey.get(data.weekKey) || [];
    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/70 p-3 shadow-2xl backdrop-blur-md min-w-[220px] max-w-[270px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#232a3a] pb-1.5 mb-1.5">
          <span className="font-serif font-bold text-[#f2ca50] text-xs">
            {data.weekLabel}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {data.rangeLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-300">Score XP hebdo :</span>
          <span className="font-mono font-bold text-[#f2ca50] text-sm">
            +{data.weeklyXp.toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
          <span>Sessions validées :</span>
          <span className="font-mono text-zinc-200">{data.sessionsCount}</span>
        </div>
        {data.averageScore > 0 && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
            <span>Précision moyenne :</span>
            <span className="font-mono text-emerald-400 font-semibold">{data.averageScore}%</span>
          </div>
        )}
        <div className="mt-1.5 pt-1.5 border-t border-[#232a3a] text-[10px] text-[#d4c78f] truncate">
          {data.topModule}
        </div>
        {pointAnnotations.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-[#232a3a] space-y-1">
            {pointAnnotations.map((ann) => {
              const meta = ANNOTATION_CATEGORY_META[ann.category];
              return (
                <div key={ann.id} className="flex items-start gap-1.5 text-[11px] leading-snug">
                  <span style={{ color: meta.color }} className="font-bold shrink-0">
                    {meta.symbol}
                  </span>
                  <span className="text-slate-100 break-words">{ann.text}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-1.5 text-[9px] text-zinc-500 font-mono">
          Cliquez sur ce point pour ajouter ou modifier une note
        </div>
      </div>
    );
  }
  return null;
};

interface DailyTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ThirtyDayDailyXpPoint }>;
  annotationsByKey: Map<string, ProgressChartAnnotation[]>;
}

const DailyXpTooltip: React.FC<DailyTooltipProps> = ({ active, payload, annotationsByKey }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const pointAnnotations = annotationsByKey.get(data.dateKey) || [];
    return (
      <div className="rounded-xl bg-[#070e1d]/95 border border-[#f2ca50]/70 p-3 shadow-2xl backdrop-blur-md min-w-[195px] max-w-[260px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#232a3a] pb-1.5 mb-1.5">
          <span className="font-serif font-bold text-[#f2ca50] text-xs">
            {data.fullLabel}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {data.shortDate}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-300">XP du jour :</span>
          <span className="font-mono font-bold text-[#f2ca50] text-sm">
            +{data.xp.toLocaleString()} XP
          </span>
        </div>
        {data.score > 0 && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mt-0.5">
            <span>Précision :</span>
            <span className="font-mono text-emerald-400">{data.score}%</span>
          </div>
        )}
        {pointAnnotations.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-[#232a3a] space-y-1">
            {pointAnnotations.map((ann) => {
              const meta = ANNOTATION_CATEGORY_META[ann.category];
              return (
                <div key={ann.id} className="flex items-start gap-1.5 text-[11px] leading-snug">
                  <span style={{ color: meta.color }} className="font-bold shrink-0">
                    {meta.symbol}
                  </span>
                  <span className="text-slate-100 break-words">{ann.text}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-1.5 text-[9px] text-zinc-500 font-mono">
          Cliquez sur ce jour pour annoter
        </div>
      </div>
    );
  }
  return null;
};

export const ProgressHistorySection: React.FC<ProgressHistorySectionProps> = ({
  user,
  className = ''
}) => {
  const [historyData, setHistoryData] = useState<ThirtyDayWeeklyXpResult | null>(null);
  const [granularity, setGranularity] = useState<ChartGranularity>('weekly');
  const [loading, setLoading] = useState<boolean>(true);

  // Personal chart annotations state
  const [annotations, setAnnotations] = useState<ProgressChartAnnotation[]>(() => {
    if (user?.chartAnnotations && user.chartAnnotations.length > 0) {
      return user.chartAnnotations;
    }
    return getChartAnnotations();
  });
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [selectedPointKey, setSelectedPointKey] = useState<string>('');
  const [annotationCategory, setAnnotationCategory] = useState<ChartAnnotationCategory>('milestone');
  const [annotationText, setAnnotationText] = useState<string>('');
  const [isSavingAnnotation, setIsSavingAnnotation] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(user?.chartAnnotations)) {
      setAnnotations((prev) =>
        user.chartAnnotations && user.chartAnnotations.length >= prev.length
          ? user.chartAnnotations
          : prev
      );
    }
  }, [user?.chartAnnotations]);

  useEffect(() => {
    const onAnnotationsUpdated = (e: Event) => {
      const custom = e as CustomEvent<ProgressChartAnnotation[]>;
      if (Array.isArray(custom.detail)) {
        setAnnotations(custom.detail);
      } else {
        setAnnotations(getChartAnnotations());
      }
    };
    window.addEventListener('eb_chart_annotations_updated', onAnnotationsUpdated);
    return () => window.removeEventListener('eb_chart_annotations_updated', onAnnotationsUpdated);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await getThirtyDayWeeklyXpHistory(user?.uid, user?.stats?.weeklyXp || 0);
        if (isMounted) {
          setHistoryData(result);
        }
      } catch (err) {
        console.warn("Erreur lors du chargement de l'historique XP sur 30 jours :", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.stats?.totalXp, user?.stats?.weeklyXp]);

  const weeklyPoints = historyData?.weeklyHistory || [];
  const dailyPoints = historyData?.dailyHistory || [];
  const total30DayXp = historyData?.total30DayXp || 0;
  const averageWeeklyXp = historyData?.averageWeeklyXp || 0;
  const peakWeeklyXp = historyData?.peakWeeklyXp || 0;
  const peakWeekLabel = historyData?.peakWeekLabel || 'Sem. 1';
  const weeklyTrendPercent = historyData?.weeklyTrendPercent || 0;

  // Map annotations for active granularity by pointKey
  const activeAnnotations = useMemo(
    () => annotations.filter((a) => a.granularity === granularity),
    [annotations, granularity]
  );

  const annotationsByPointKey = useMemo(() => {
    const map = new Map<string, ProgressChartAnnotation[]>();
    for (const ann of activeAnnotations) {
      const arr = map.get(ann.pointKey) || [];
      arr.push(ann);
      map.set(ann.pointKey, arr);
    }
    return map;
  }, [activeAnnotations]);

  // Available selectable points for the active chart granularity
  const pointChoices = useMemo(() => {
    if (granularity === 'weekly') {
      return weeklyPoints.map((w) => ({
        pointKey: w.weekKey,
        xValue: w.shortLabel,
        yValue: w.weeklyXp,
        pointLabel: `${w.shortLabel} (${w.rangeLabel})`
      }));
    }
    return dailyPoints.map((d) => ({
      pointKey: d.dateKey,
      xValue: d.shortDate,
      yValue: d.xp,
      pointLabel: `${d.fullLabel} (${d.shortDate})`
    }));
  }, [granularity, weeklyPoints, dailyPoints]);

  // Precomputed visual markers for Recharts ReferenceLine / ReferenceDot
  const annotatedChartMarkers = useMemo(() => {
    return pointChoices
      .map((choice) => {
        const pointAnns = annotationsByPointKey.get(choice.pointKey);
        if (!pointAnns || pointAnns.length === 0) return null;
        const primary = pointAnns[0];
        const meta = ANNOTATION_CATEGORY_META[primary.category];
        const shortNote =
          primary.text.length > 15 ? `${primary.text.slice(0, 14)}…` : primary.text;
        const badgeText =
          pointAnns.length > 1
            ? `${meta.symbol} ${shortNote} (+${pointAnns.length - 1})`
            : `${meta.symbol} ${shortNote}`;
        return {
          ...choice,
          annotations: pointAnns,
          color: meta.color,
          badgeText
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [pointChoices, annotationsByPointKey]);

  const openComposerForPoint = (pointKey?: string, existingAnnotation?: ProgressChartAnnotation) => {
    const fallbackKey =
      pointKey ||
      (pointChoices.length > 0 ? pointChoices[pointChoices.length - 1].pointKey : '');
    setSelectedPointKey(fallbackKey);

    if (existingAnnotation) {
      setEditingAnnotationId(existingAnnotation.id);
      setAnnotationCategory(existingAnnotation.category);
      setAnnotationText(existingAnnotation.text);
    } else {
      setEditingAnnotationId(null);
      setAnnotationCategory('milestone');
      setAnnotationText('');
    }
    setIsComposerOpen(true);
  };

  const handleSaveAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = annotationText.trim();
    if (!trimmed || !selectedPointKey || isSavingAnnotation) return;

    const matchedChoice = pointChoices.find((c) => c.pointKey === selectedPointKey);
    const pointLabel = matchedChoice?.pointLabel || selectedPointKey;

    setIsSavingAnnotation(true);
    try {
      const updated = await saveChartAnnotation({
        id: editingAnnotationId || undefined,
        granularity,
        pointKey: selectedPointKey,
        pointLabel,
        text: trimmed,
        category: annotationCategory
      });
      setAnnotations(updated);
      setIsComposerOpen(false);
      setEditingAnnotationId(null);
      setAnnotationText('');
    } finally {
      setIsSavingAnnotation(false);
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    const updated = await deleteChartAnnotation(id);
    setAnnotations(updated);
    if (editingAnnotationId === id) {
      setEditingAnnotationId(null);
      setAnnotationText('');
      setIsComposerOpen(false);
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfNotice(null);
    try {
      const res = await exportProgressReportPdf({
        user,
        thirtyDayHistory: historyData,
        annotations
      });
      setPdfNotice(`Rapport téléchargé (${res.pagesCount} p.)`);
      setTimeout(() => setPdfNotice(null), 3500);
    } catch (err) {
      console.error('Erreur lors de export PDF:', err);
      setPdfNotice('Échec de export PDF');
      setTimeout(() => setPdfNotice(null), 3500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const selectedPointExistingAnnotations = useMemo(
    () => (selectedPointKey ? annotationsByPointKey.get(selectedPointKey) || [] : []),
    [selectedPointKey, annotationsByPointKey]
  );

  return (
    <section
      aria-label="Évolution du score XP hebdomadaire sur 30 jours"
      className={`w-full rounded-2xl bg-[#191f2f] p-5 shadow-xl border border-[#4d4635]/40 flex flex-col gap-4 text-slate-100 ${className}`}
    >
      {/* En-tête de la section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-[#232a3a]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shadow-sm shrink-0">
            <span className="material-symbols-outlined text-xl">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8]">
                Évolution XP hebdomadaire (30 jours)
              </h3>
              {!loading && weeklyTrendPercent !== 0 && (
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                    weeklyTrendPercent > 0
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {weeklyTrendPercent > 0 ? `+${weeklyTrendPercent}%` : `${weeklyTrendPercent}%`} vs sem. préc.
                </span>
              )}
            </div>
            <p className="text-xs text-[#d0c5af]/80">
              Progression de votre score XP hebdomadaire sur les 30 derniers jours
            </p>
          </div>
        </div>

        {/* Contrôle de granularité + Bouton Annoter + Badges de synthèse */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-[#070e1d] border border-[#232a3a] p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                setGranularity('weekly');
                setIsComposerOpen(false);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                granularity === 'weekly'
                  ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                  : 'text-zinc-400 hover:text-[#dce2f8]'
              }`}
            >
              Hebdo (30j)
            </button>
            <button
              type="button"
              onClick={() => {
                setGranularity('daily');
                setIsComposerOpen(false);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                granularity === 'daily'
                  ? 'bg-[#f2ca50] text-[#3c2f00] font-bold'
                  : 'text-zinc-400 hover:text-[#dce2f8]'
              }`}
            >
              30 Jours
            </button>
          </div>

          <button
            type="button"
            disabled={loading || pointChoices.length === 0}
            onClick={() =>
              isComposerOpen && !editingAnnotationId
                ? setIsComposerOpen(false)
                : openComposerForPoint()
            }
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 ${
              isComposerOpen
                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md shadow-[#f2ca50]/20'
                : 'bg-[#070e1d] text-[#f2ca50] border-[#f2ca50]/40 hover:bg-[#f2ca50]/10'
            }`}
            title="Ajouter une annotation personnelle sur un point du graphique"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span>+ Annoter</span>
            {activeAnnotations.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isComposerOpen ? 'bg-[#3c2f00]/20 text-[#3c2f00]' : 'bg-[#f2ca50]/20 text-[#f2ca50]'
                }`}
              >
                {activeAnnotations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={loading || isExportingPdf}
            onClick={handleExportPdf}
            className="px-3 py-1.5 rounded-xl border border-sky-500/40 bg-[#070e1d] text-sky-300 hover:bg-sky-500/15 hover:border-sky-400/60 text-xs font-mono font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
            title="Exporter un rapport PDF récapitulatif de votre progression"
          >
            <span className="material-symbols-outlined text-sm">
              {isExportingPdf ? 'hourglass_top' : 'picture_as_pdf'}
            </span>
            <span>{isExportingPdf ? 'Export...' : 'Exporter PDF'}</span>
          </button>

          {pdfNotice && (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono">
              {pdfNotice}
            </span>
          )}

          <div className="px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
            <span className="text-zinc-400 mr-1.5">Cumul 30J :</span>
            <strong className="text-[#f2ca50]">+{total30DayXp.toLocaleString()} XP</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
            <span className="text-zinc-400 mr-1.5">Moy. Hebdo :</span>
            <strong className="text-[#38bdf8]">~{averageWeeklyXp.toLocaleString()} XP</strong>
          </div>
          {peakWeeklyXp > 0 && (
            <div className="hidden xl:flex px-3 py-1 rounded-xl bg-[#070e1d] border border-[#232a3a] text-xs font-mono">
              <span className="text-zinc-400 mr-1.5">Record :</span>
              <strong className="text-emerald-400">
                +{peakWeeklyXp.toLocaleString()} XP ({peakWeekLabel})
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Éditeur d'annotation personnelle inline */}
      {isComposerOpen && pointChoices.length > 0 && (
        <form
          onSubmit={handleSaveAnnotation}
          className="rounded-xl bg-[#0c1322] border border-[#f2ca50]/40 p-4 flex flex-col gap-3 shadow-lg animate-fadeIn"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-base">bookmark_add</span>
              <span className="font-serif font-bold text-sm text-[#dce2f8]">
                {editingAnnotationId
                  ? "Modifier l'annotation personnelle"
                  : 'Épingler un événement sur le graphique'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsComposerOpen(false);
                setEditingAnnotationId(null);
                setAnnotationText('');
              }}
              className="text-xs text-zinc-400 hover:text-white font-mono"
            >
              Fermer ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sélection du point cible */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="chart-annotation-point"
                className="text-[11px] font-mono uppercase text-[#99907c]"
              >
                {granularity === 'weekly' ? 'Semaine concernée' : 'Date concernée'}
              </label>
              <select
                id="chart-annotation-point"
                value={selectedPointKey}
                onChange={(e) => {
                  setSelectedPointKey(e.target.value);
                  setEditingAnnotationId(null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#151b2b] border border-[#232a3a] focus:border-[#f2ca50] text-xs text-[#dce2f8] font-mono focus:outline-none"
              >
                {pointChoices.map((c) => (
                  <option key={c.pointKey} value={c.pointKey}>
                    {c.pointLabel} — +{c.yValue.toLocaleString()} XP
                  </option>
                ))}
              </select>
            </div>

            {/* Type d'événement */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase text-[#99907c]">
                Catégorie d'événement
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(Object.keys(ANNOTATION_CATEGORY_META) as ChartAnnotationCategory[]).map((catKey) => {
                  const meta = ANNOTATION_CATEGORY_META[catKey];
                  const active = annotationCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setAnnotationCategory(catKey)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
                        active
                          ? meta.pillClass
                          : 'bg-[#151b2b] border-[#232a3a] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>{meta.symbol}</span>
                      <span className="truncate">{meta.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Texte personnel de l'annotation */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="chart-annotation-text"
                className="text-[11px] font-mono uppercase text-[#99907c]"
              >
                Votre annotation personnelle
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                {annotationText.length}/120
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="chart-annotation-text"
                type="text"
                maxLength={120}
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="Ex : Passage niveau C1 validé, Examen blanc TOEIC, Série 14 jours..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#151b2b] border border-[#232a3a] focus:border-[#f2ca50] text-xs sm:text-sm text-[#dce2f8] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
                autoFocus
              />
              <div className="flex items-center gap-2 shrink-0">
                {editingAnnotationId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnotation(editingAnnotationId)}
                    className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold hover:bg-rose-900/60 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!annotationText.trim() || isSavingAnnotation}
                  className="px-4 py-2 rounded-lg bg-[#f2ca50] text-[#3c2f00] text-xs font-bold uppercase tracking-wider hover:bg-[#ffe088] disabled:opacity-40 transition-all shadow-md"
                >
                  {isSavingAnnotation
                    ? 'Enregistrement...'
                    : editingAnnotationId
                    ? 'Mettre à jour'
                    : 'Épingler'}
                </button>
              </div>
            </div>
          </div>

          {/* Notes déjà présentes sur ce point */}
          {selectedPointExistingAnnotations.length > 0 && (
            <div className="pt-2 border-t border-[#232a3a] flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#99907c]">
                Annotations existantes sur ce point :
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedPointExistingAnnotations.map((ann) => {
                  const meta = ANNOTATION_CATEGORY_META[ann.category];
                  return (
                    <div
                      key={ann.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${meta.pillClass}`}
                    >
                      <span>{meta.symbol}</span>
                      <span>{ann.text}</span>
                      <button
                        type="button"
                        onClick={() => openComposerForPoint(ann.pointKey, ann)}
                        className="ml-1 opacity-75 hover:opacity-100 underline text-[10px] font-mono"
                        title="Modifier cette annotation"
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnotation(ann.id)}
                        className="opacity-75 hover:opacity-100 text-rose-300 text-[10px] font-mono"
                        title="Supprimer cette annotation"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Graphique Recharts sur 30 jours */}
      <div className="w-full h-64 sm:h-72 select-none pt-2">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono">
            <span className="material-symbols-outlined animate-spin mr-2 text-sm">sync</span>
            Chargement de l'évolution XP sur 30 jours...
          </div>
        ) : granularity === 'weekly' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyPoints}
              margin={{ top: 24, right: 20, left: -4, bottom: 4 }}
              onClick={(state) => {
                const idx =
                  typeof state?.activeTooltipIndex === 'number'
                    ? state.activeTooltipIndex
                    : typeof state?.activeTooltipIndex === 'string'
                    ? parseInt(state.activeTooltipIndex, 10)
                    : -1;
                const clicked =
                  idx >= 0 && idx < weeklyPoints.length
                    ? weeklyPoints[idx]
                    : weeklyPoints.find((w) => w.shortLabel === state?.activeLabel);
                if (clicked) {
                  openComposerForPoint(clicked.weekKey);
                }
              }}
            >
              <defs>
                <linearGradient id="weeklyXpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f2ca50" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#f2ca50" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#99907c"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2e3545' }}
                tick={{ fill: '#d0c5af', fontWeight: 600 }}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(500, Math.ceil(dataMax * 1.24))]}
                unit=" XP"
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#99907c' }}
              />
              {averageWeeklyXp > 0 && (
                <ReferenceLine
                  y={averageWeeklyXp}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
              )}
              {annotatedChartMarkers.map((marker) => (
                <ReferenceLine
                  key={`ref-line-${marker.pointKey}`}
                  x={marker.xValue}
                  stroke={marker.color}
                  strokeDasharray="3 3"
                  strokeOpacity={0.55}
                />
              ))}
              <Tooltip
                content={<WeeklyXpTooltip annotationsByKey={annotationsByPointKey} />}
                cursor={{ stroke: '#f2ca50', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="weeklyXp"
                name="Score XP Hebdomadaire"
                stroke="#f2ca50"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weeklyXpAreaGradient)"
                dot={(dotProps: { cx?: number; cy?: number; payload?: ThirtyDayWeeklyXpPoint }) => {
                  const { cx, cy, payload } = dotProps;
                  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
                    return <g key={`empty-${Math.random()}`} />;
                  }
                  const pointAnns = annotationsByPointKey.get(payload.weekKey);
                  const markerColor = pointAnns?.length
                    ? ANNOTATION_CATEGORY_META[pointAnns[0].category].color
                    : '#f2ca50';
                  return (
                    <circle
                      key={`dot-${payload.weekKey}`}
                      cx={cx}
                      cy={cy}
                      r={pointAnns?.length ? 6.5 : 5}
                      fill={pointAnns?.length ? markerColor : '#070e1d'}
                      stroke={pointAnns?.length ? '#070e1d' : '#f2ca50'}
                      strokeWidth={2.5}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openComposerForPoint(payload.weekKey);
                      }}
                    />
                  );
                }}
                activeDot={{
                  fill: '#f2ca50',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                  r: 7,
                  style: { cursor: 'pointer' }
                }}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              />
              {annotatedChartMarkers.map((marker) => (
                <ReferenceDot
                  key={`ref-dot-${marker.pointKey}`}
                  x={marker.xValue}
                  y={marker.yValue}
                  r={9}
                  fill="transparent"
                  stroke={marker.color}
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: marker.badgeText,
                    position: 'top',
                    fill: marker.color,
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyPoints}
              margin={{ top: 24, right: 14, left: -6, bottom: 4 }}
              onClick={(state) => {
                const idx =
                  typeof state?.activeTooltipIndex === 'number'
                    ? state.activeTooltipIndex
                    : typeof state?.activeTooltipIndex === 'string'
                    ? parseInt(state.activeTooltipIndex, 10)
                    : -1;
                const clicked =
                  idx >= 0 && idx < dailyPoints.length
                    ? dailyPoints[idx]
                    : dailyPoints.find((d) => d.shortDate === state?.activeLabel);
                if (clicked) {
                  openComposerForPoint(clicked.dateKey);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" vertical={false} />
              <XAxis
                dataKey="shortDate"
                interval={4}
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2e3545' }}
                tick={{ fill: '#d0c5af' }}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(200, Math.ceil(dataMax * 1.26))]}
                unit=" XP"
                stroke="#99907c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#99907c' }}
              />
              {annotatedChartMarkers.map((marker) => (
                <ReferenceLine
                  key={`daily-ref-line-${marker.pointKey}`}
                  x={marker.xValue}
                  stroke={marker.color}
                  strokeDasharray="3 3"
                  strokeOpacity={0.55}
                />
              ))}
              <Tooltip
                content={<DailyXpTooltip annotationsByKey={annotationsByPointKey} />}
                cursor={{ fill: 'rgba(242, 202, 80, 0.08)' }}
              />
              <Bar
                dataKey="xp"
                name="XP Quotidien"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={750}
                style={{ cursor: 'pointer' }}
              >
                {dailyPoints.map((entry) => {
                  const pointAnns = annotationsByPointKey.get(entry.dateKey);
                  const fill = pointAnns?.length
                    ? ANNOTATION_CATEGORY_META[pointAnns[0].category].color
                    : '#f2ca50';
                  return <Cell key={`bar-${entry.dateKey}`} fill={fill} />;
                })}
              </Bar>
              {annotatedChartMarkers.map((marker) => (
                <ReferenceDot
                  key={`daily-ref-dot-${marker.pointKey}`}
                  x={marker.xValue}
                  y={marker.yValue}
                  r={6}
                  fill={marker.color}
                  stroke="#070e1d"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: marker.badgeText,
                    position: 'top',
                    fill: marker.color,
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Liste des événements annotés pour l'affichage actif */}
      {activeAnnotations.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#232a3a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#d4c78f] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">bookmarks</span>
              Événements marqués ({activeAnnotations.length})
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Cliquez sur une note pour la modifier
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeAnnotations.map((ann) => {
              const meta = ANNOTATION_CATEGORY_META[ann.category];
              return (
                <div
                  key={ann.id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${meta.pillClass}`}
                >
                  <button
                    type="button"
                    onClick={() => openComposerForPoint(ann.pointKey, ann)}
                    className="flex items-center gap-1.5 text-left hover:underline"
                    title="Modifier cette annotation"
                  >
                    <span className="font-bold">{meta.symbol}</span>
                    <span className="font-mono text-[10px] opacity-80">{ann.pointLabel} :</span>
                    <span className="font-medium text-slate-100">{ann.text}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnotation(ann.id)}
                    className="ml-0.5 text-zinc-400 hover:text-rose-300 text-xs font-mono"
                    title="Supprimer cette annotation"
                    aria-label={`Supprimer l'annotation ${ann.text}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Légende et synthèse sous le graphique */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-[#99907c] pt-2 border-t border-[#232a3a] gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50]" />
            <span className="text-zinc-300 font-medium">
              {granularity === 'weekly'
                ? 'Courbe dorée : Score XP accumulé par semaine'
                : 'Barres dorées : XP gagnés par jour (30 derniers jours)'}
            </span>
          </div>
          {granularity === 'weekly' && averageWeeklyXp > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#38bdf8]" />
              <span className="text-[#38bdf8]">Moyenne hebdomadaire ({averageWeeklyXp.toLocaleString()} XP)</span>
            </div>
          )}
        </div>
        <span className="italic text-zinc-400">
          Cliquez sur un point du graphique pour y épingler un événement personnel.
        </span>
      </div>
    </section>
  );
};
