import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  fetchSkillsRegistry,
  fetchGlobalAgentContext,
  updateSkillEnabledState,
  bulkUpdateSkillsEnabled,
  fetchSkillInstructions,
  type SkillsRegistrySnapshot,
  type SkillAdminItem,
  type GlobalAgentContextSnapshot,
  type SkillInstructionsResponse
} from '../services/skillsService';
import type { UserProfile } from '../firebase/types';
import {
  computeMasterSkillProgress,
  computeUserTelemetryBaseline,
  computeIndividualSkillAnalytics,
  type IndividualSkillAnalytics,
  type SkillHistoryPointInput
} from '../utils/masterSkillProgress';
import {
  MasterSkillsD3OverviewPanel,
  SkillSparklineD3,
  SkillIndividualDetailD3Chart
} from './MasterSkillD3Charts';
import { TelemetryListSkeleton } from './SkeletonLoaders';

type ActiveFilter = 'all' | 'enabled' | 'disabled';

export interface MasterSkillsViewProps {
  user?: UserProfile;
  avgScore?: number;
  scoreData?: SkillHistoryPointInput[];
}

function formatBytesToKb(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 Ko';
  if (bytes < 1024) return `${bytes} o`;
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

export const MasterSkillsView: React.FC<MasterSkillsViewProps> = ({
  user,
  avgScore,
  scoreData
}) => {
  const shouldReduceMotion = useReducedMotion();

  const [snapshot, setSnapshot] = useState<SkillsRegistrySnapshot | null>(null);
  const [globalContext, setGlobalContext] = useState<GlobalAgentContextSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [showGlobalContextPreview, setShowGlobalContextPreview] = useState<boolean>(false);
  const [copiedGlobalContext, setCopiedGlobalContext] = useState<boolean>(false);
  const [showD3Overview, setShowD3Overview] = useState<boolean>(true);
  const [selectedD3SkillId, setSelectedD3SkillId] = useState<string | null>(null);
  const [expandedD3RowId, setExpandedD3RowId] = useState<string | null>(null);

  const [inspectedSkillId, setInspectedSkillId] = useState<string | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<SkillInstructionsResponse | null>(null);

  const loadMasterSkillsData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [registrySnap, globalCtx] = await Promise.all([
        fetchSkillsRegistry(),
        fetchGlobalAgentContext()
      ]);
      setSnapshot(registrySnap);
      setGlobalContext(globalCtx);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la lecture de skills/index.json.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMasterSkillsData();
  }, [loadMasterSkillsData]);

  useEffect(() => {
    if (!statusNotice) return;
    const timer = setTimeout(() => setStatusNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [statusNotice]);

  const masterSkills = useMemo(() => {
    if (!snapshot) return [];
    const masters = snapshot.skills.filter((s) => s.tier === 'master');
    return masters.length > 0 ? masters : snapshot.skills;
  }, [snapshot]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    snapshot?.categories.forEach((cat) => map.set(cat.id, cat.label));
    return map;
  }, [snapshot]);

  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return masterSkills.filter((skill) => {
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) return false;
      if (activeFilter === 'enabled' && !skill.enabled) return false;
      if (activeFilter === 'disabled' && skill.enabled) return false;

      if (!q) return true;
      const categoryLabel = categoryMap.get(skill.category) || '';
      return (
        skill.title.toLowerCase().includes(q) ||
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [masterSkills, searchQuery, selectedCategory, activeFilter, categoryMap]);

  const userBaseline = useMemo(
    () => computeUserTelemetryBaseline(user, avgScore),
    [user, avgScore]
  );

  const progressBySkillId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeMasterSkillProgress>>();
    for (const skill of masterSkills) {
      map.set(skill.id, computeMasterSkillProgress(skill, user, avgScore));
    }
    return map;
  }, [masterSkills, user, avgScore]);

  const analyticsBySkillId = useMemo(() => {
    const map = new Map<string, IndividualSkillAnalytics>();
    for (const skill of masterSkills) {
      map.set(skill.id, computeIndividualSkillAnalytics(skill, user, avgScore, scoreData));
    }
    return map;
  }, [masterSkills, user, avgScore, scoreData]);

  const activeAverageProgress = useMemo(() => {
    const active = masterSkills.filter((s) => s.enabled);
    if (active.length === 0) return 0;
    const total = active.reduce(
      (sum, skill) => sum + (progressBySkillId.get(skill.id)?.percentage ?? 0),
      0
    );
    return Math.round(total / active.length);
  }, [masterSkills, progressBySkillId]);

  useEffect(() => {
    if (filteredSkills.length === 0) return;
    if (!selectedD3SkillId || !filteredSkills.some((s) => s.id === selectedD3SkillId)) {
      const firstActive = filteredSkills.find((s) => s.enabled) ?? filteredSkills[0];
      setSelectedD3SkillId(firstActive.id);
    }
  }, [filteredSkills, selectedD3SkillId]);

  const handleCheckboxToggle = async (skill: SkillAdminItem, checked: boolean) => {
    if (togglingIds[skill.id] || isBulkUpdating) return;
    setTogglingIds((prev) => ({ ...prev, [skill.id]: true }));
    setStatusNotice(null);

    try {
      const res = await updateSkillEnabledState(skill.id, checked);
      setSnapshot(res.snapshot);
      if (res.globalContext) {
        setGlobalContext(res.globalContext);
      } else {
        const refreshedCtx = await fetchGlobalAgentContext();
        setGlobalContext(refreshedCtx);
      }

      if (inspectData && inspectData.skill.id === skill.id) {
        setInspectData((prev) => (prev ? { ...prev, skill: res.skill } : prev));
      }

      setStatusNotice({
        type: 'success',
        message: `${skill.title} (${skill.name}) ${
          checked
            ? 'activée dans le contexte global de l’agent.'
            : 'retirée du contexte global de l’agent.'
        }`
      });
    } catch (err) {
      setStatusNotice({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Impossible de mettre à jour cette compétence.'
      });
    } finally {
      setTogglingIds((prev) => {
        const next = { ...prev };
        delete next[skill.id];
        return next;
      });
    }
  };

  const handleBulkToggle = async (enabled: boolean) => {
    if (isBulkUpdating) return;
    const targetIds = filteredSkills.map((s) => s.id);
    if (targetIds.length === 0) return;

    setIsBulkUpdating(true);
    setStatusNotice(null);
    try {
      const res = await bulkUpdateSkillsEnabled(enabled, targetIds);
      setSnapshot(res.snapshot);
      setGlobalContext(res.globalContext);
      setStatusNotice({
        type: 'success',
        message: `${targetIds.length} compétence(s) ${
          enabled
            ? 'activée(s) dans le contexte global de l’agent.'
            : 'désactivée(s) du contexte global de l’agent.'
        }`
      });
    } catch (err) {
      setStatusNotice({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Erreur lors de la mise à jour groupée.'
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleCopyGlobalContext = async () => {
    const assembled = globalContext?.context.assembledSystemContext;
    if (!assembled) return;
    try {
      await navigator.clipboard.writeText(assembled);
      setCopiedGlobalContext(true);
      setTimeout(() => setCopiedGlobalContext(false), 2200);
    } catch {
      setStatusNotice({
        type: 'error',
        message: 'Impossible de copier le contexte global dans le presse-papiers.'
      });
    }
  };

  const handleInspectSkill = async (skillId: string) => {
    if (inspectedSkillId === skillId && inspectData) {
      setInspectedSkillId(null);
      setInspectData(null);
      setInspectError(null);
      return;
    }
    setInspectedSkillId(skillId);
    setIsInspectLoading(true);
    setInspectError(null);
    setInspectData(null);
    try {
      const data = await fetchSkillInstructions(skillId);
      setInspectData(data);
    } catch (err) {
      setInspectError(
        err instanceof Error ? err.message : 'Impossible de lire les instructions.'
      );
    } finally {
      setIsInspectLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section
        aria-label="Chargement des AI Studio Master Skills"
        className="w-full space-y-4"
      >
        <TelemetryListSkeleton count={6} />
      </section>
    );
  }

  if (loadError || !snapshot) {
    return (
      <section
        role="alert"
        className="w-full rounded-2xl bg-[#191f2f] border border-rose-500/40 p-6 text-center space-y-3"
      >
        <span className="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
        <h3 className="font-serif text-lg font-bold text-[#dce2f8]">
          Impossible de lire skills/index.json
        </h3>
        <p className="text-xs text-[#d0c5af] max-w-md mx-auto">
          {loadError || 'Le registre des AI Studio Master Skills est temporairement inaccessible.'}
        </p>
        <button
          type="button"
          onClick={loadMasterSkillsData}
          className="min-h-[40px] px-4 py-2 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          Réessayer
        </button>
      </section>
    );
  }

  const enabledCount = masterSkills.filter((s) => s.enabled).length;
  const totalBytes = globalContext?.totalBytes ?? 0;

  return (
    <div className="w-full flex flex-col gap-5 select-text">
      {/* Executive Header & Single-Elevation Hairline Metric Strip */}
      <section className="w-full rounded-2xl luxury-card-surface p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#d4c78f] font-medium">
              <span>Registre central</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#f2ca50]">skills/index.json</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#d0c5af]">Contexte global de l&apos;agent</span>
              {user && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#d4c78f] tabular-nums">
                    Niveau {user.level} ({userBaseline.masteryPercentage}% maîtrise)
                  </span>
                </>
              )}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#dce2f8] font-bold tracking-tight [text-wrap:balance]">
              Gestion des AI Studio Master Skills
            </h3>
            <p className="text-xs sm:text-[13px] text-[#d0c5af]/90 max-w-3xl leading-relaxed">
              Consultez les 20 compétences lues depuis <span className="font-mono text-[#dce2f8]">skills/index.json</span> et cochez celles à inclure dans le contexte global de l&apos;agent. Chaque compétence active affiche son pourcentage et sa barre de progression calculés selon votre maîtrise et votre activité récente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowD3Overview((prev) => !prev)}
              aria-expanded={showD3Overview}
              className="luxury-btn-surface min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#f2ca50]">
                monitoring
              </span>
              <span>{showD3Overview ? 'Masquer D3' : 'Graphiques D3'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGlobalContextPreview((prev) => !prev)}
              aria-expanded={showGlobalContextPreview}
              className="luxury-btn-amber-soft min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {showGlobalContextPreview ? 'visibility_off' : 'visibility'}
              </span>
              <span>{showGlobalContextPreview ? 'Masquer le contexte global' : 'Voir le contexte global'}</span>
            </button>

            <button
              type="button"
              onClick={loadMasterSkillsData}
              className="luxury-btn-surface min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#f2ca50]">refresh</span>
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Hairline-Divided 4-Column Metrics (Single Elevation) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#232a3a] rounded-xl luxury-hairline-panel font-mono tabular-nums">
          <div className="p-3.5 flex flex-col gap-0.5">
            <span className="text-[11px] font-sans text-[#d0c5af]">Master Skills indexées</span>
            <span className="text-xl font-bold text-[#f2ca50]">{masterSkills.length}</span>
            <span className="text-[11px] font-sans text-[#99907c]">Lues depuis skills/index.json</span>
          </div>

          <div className="p-3.5 flex flex-col gap-0.5">
            <span className="text-[11px] font-sans text-[#d0c5af]">Actives dans le contexte global</span>
            <span className="text-xl font-bold text-emerald-400">
              {enabledCount} / {masterSkills.length}
            </span>
            <span className="text-[11px] font-sans text-[#99907c]">
              {masterSkills.length - enabledCount} désactivée(s)
            </span>
          </div>

          <div className="p-3.5 flex flex-col gap-0.5">
            <span className="text-[11px] font-sans text-[#d0c5af]">Volume d&apos;instructions chargé</span>
            <span className="text-xl font-bold text-sky-300">{formatBytesToKb(totalBytes)}</span>
            <span className="text-[11px] font-sans text-[#99907c]">
              {globalContext?.loadedCount ?? 0} fichier(s) SKILL_*.md actifs
            </span>
          </div>

          <div className="p-3.5 flex flex-col gap-0.5">
            <span className="text-[11px] font-sans text-[#d0c5af]">Progression moyenne active</span>
            <span className="text-xl font-bold text-[#dce2f8]">{activeAverageProgress}%</span>
            <span className="text-[11px] font-sans text-[#99907c]">
              Activité du jour : {userBaseline.dailyActivityPct}% · {snapshot.categories.length} catégories
            </span>
          </div>
        </div>

        <AnimatePresence>
          {statusNotice && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className={`rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-2 border ${
                statusNotice.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}
            >
              <span className="material-symbols-outlined text-base shrink-0">
                {statusNotice.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{statusNotice.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable Global Agent Context Inspector */}
        <AnimatePresence>
          {showGlobalContextPreview && globalContext && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#dce2f8]">
                    Contexte global assemblé de l&apos;agent
                  </h4>
                  <p className="text-xs text-[#99907c] tabular-nums">
                    {globalContext.loadedCount} compétence(s) chargée(s) · {formatBytesToKb(globalContext.totalBytes)} · Mis à jour à{' '}
                    {new Date(globalContext.generatedAt).toLocaleTimeString('fr-FR')}
                  </p>
                </div>

                {globalContext.context.assembledSystemContext && (
                  <button
                    type="button"
                    onClick={handleCopyGlobalContext}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#151b2b] hover:bg-[#232a3a] border border-[#2e3545] text-xs font-semibold text-[#dce2f8] whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                      {copiedGlobalContext ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedGlobalContext ? 'Contexte copié' : 'Copier le contexte global'}</span>
                  </button>
                )}
              </div>

              {globalContext.context.assembledSystemContext ? (
                <pre className="max-h-64 overflow-y-auto rounded-lg bg-[#070e1d] border border-[#232a3a] p-3 text-[11px] leading-relaxed font-mono text-[#dce2f8] whitespace-pre-wrap">
                  {globalContext.context.assembledSystemContext}
                </pre>
              ) : (
                <div className="rounded-lg bg-[#151b2b] border border-[#232a3a] p-4 text-xs text-[#d0c5af]">
                  Aucune compétence n&apos;est cochée actuellement. Le contexte global de l&apos;agent est vide.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* D3 Individual Mastery Progression Charts Panel */}
      {showD3Overview && filteredSkills.length > 0 && (
        <MasterSkillsD3OverviewPanel
          skills={filteredSkills}
          analyticsBySkillId={analyticsBySkillId}
          categoryMap={categoryMap}
          selectedSkillId={selectedD3SkillId}
          onSelectSkill={(skillId) => setSelectedD3SkillId(skillId)}
        />
      )}

      {/* Filter Controls + Complete 20 Master Skills Checklist */}
      <section className="w-full rounded-2xl luxury-card-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="master-skills-search" className="sr-only">
              Rechercher parmi les 20 AI Studio Master Skills
            </label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a89e89] text-lg pointer-events-none">
              search
            </span>
            <input
              id="master-skills-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, identifiant ou description..."
              className="w-full min-h-[40px] pl-10 pr-3 py-2 rounded-lg bg-[#090f1d] border border-[#2e3852] focus:border-[#f2ca50] text-xs text-[#dce2f8] placeholder-[#99907c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1" role="group" aria-label="Filtrer par état d'activation">
              {(
                [
                  { id: 'all', label: 'Toutes' },
                  { id: 'enabled', label: 'Actives' },
                  { id: 'disabled', label: 'Désactivées' }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveFilter(opt.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
                    activeFilter === opt.id
                      ? 'luxury-btn-gold font-bold'
                      : 'luxury-btn-surface'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pl-1 border-l border-[#232a3a]">
              <button
                type="button"
                disabled={isBulkUpdating || filteredSkills.length === 0}
                onClick={() => handleBulkToggle(true)}
                className="luxury-btn-emerald min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] cursor-pointer"
              >
                Tout cocher
              </button>
              <button
                type="button"
                disabled={isBulkUpdating || filteredSkills.length === 0}
                onClick={() => handleBulkToggle(false)}
                className="luxury-btn-surface min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
              >
                Tout décocher
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
          role="tablist"
          aria-label="Filtrer les Master Skills par catégorie"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
              selectedCategory === 'all'
                ? 'luxury-btn-amber-soft'
                : 'luxury-btn-surface'
            }`}
          >
            Toutes ({masterSkills.length})
          </button>
          {snapshot.categories.map((cat) => {
            const count = masterSkills.filter((s) => s.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
                  isSelected
                    ? 'luxury-btn-amber-soft'
                    : 'luxury-btn-surface'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Checklist Table / Rows */}
        {filteredSkills.length === 0 ? (
          <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-[#99907c]">filter_list_off</span>
            <p className="text-sm font-semibold text-[#dce2f8]">
              Aucune Master Skill ne correspond aux filtres actifs.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#232a3a] hover:bg-[#2e3545] text-xs font-semibold text-[#f2ca50] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#232a3a] rounded-xl border border-[#232a3a] bg-[#151b2b] overflow-hidden">
            {filteredSkills.map((skill, idx) => {
              const isBusy = Boolean(togglingIds[skill.id]) || isBulkUpdating;
              const isInspected = inspectedSkillId === skill.id;
              const isD3RowExpanded = expandedD3RowId === skill.id;
              const checkboxId = `master-skill-checkbox-${skill.id}`;
              const progress =
                progressBySkillId.get(skill.id) ?? computeMasterSkillProgress(skill, user, avgScore);
              const skillAnalytics =
                analyticsBySkillId.get(skill.id) ??
                computeIndividualSkillAnalytics(skill, user, avgScore, scoreData);

              const barFillClass =
                progress.toneClass === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                  : progress.toneClass === 'gold'
                  ? 'bg-gradient-to-r from-[#d4c78f] to-[#f2ca50]'
                  : 'bg-gradient-to-r from-sky-500 to-sky-300';

              const pctColorClass =
                progress.toneClass === 'emerald'
                  ? 'text-emerald-300'
                  : progress.toneClass === 'gold'
                  ? 'text-[#f2ca50]'
                  : 'text-sky-300';

              return (
                <div
                  key={skill.id}
                  className={`transition-colors ${
                    skill.enabled ? 'hover:bg-[#191f2f]/80' : 'opacity-80 hover:bg-[#191f2f]/60'
                  }`}
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Accessible Checkbox + Progress Percentage Right Next to Checkbox */}
                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <label
                          htmlFor={checkboxId}
                          className="min-w-[40px] min-h-[40px] -m-1.5 p-1.5 flex items-center justify-center rounded-lg hover:bg-[#232a3a]/60 cursor-pointer shrink-0"
                          title={
                            skill.enabled
                              ? `Désactiver ${skill.name} du contexte global`
                              : `Activer ${skill.name} dans le contexte global`
                          }
                        >
                          <input
                            id={checkboxId}
                            type="checkbox"
                            checked={skill.enabled}
                            disabled={isBusy}
                            onChange={(e) => handleCheckboxToggle(skill, e.target.checked)}
                            aria-label={`Activer la compétence ${skill.title} (${skill.name}) dans le contexte global de l'agent`}
                            className="h-5 w-5 rounded border-[#4d4635] bg-[#0c1322] text-[#f2ca50] accent-[#f2ca50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151b2b] cursor-pointer disabled:opacity-50"
                          />
                        </label>

                        <span
                          data-testid={`skill-checkbox-progress-${skill.id}`}
                          className={`min-w-[3rem] font-mono text-xs font-bold tabular-nums ${
                            skill.enabled ? pctColorClass : 'text-[#99907c]'
                          }`}
                          aria-label={
                            skill.enabled
                              ? `Progression : ${progress.percentage}%`
                              : 'Compétence désactivée'
                          }
                        >
                          {skill.enabled ? `${progress.percentage}%` : '—'}
                        </span>
                      </div>

                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-xs font-mono tabular-nums text-[#99907c]">
                              {String(idx + 1).padStart(2, '0')}.
                            </span>
                            <label
                              htmlFor={checkboxId}
                              className="text-sm font-bold text-[#dce2f8] cursor-pointer hover:text-[#f2ca50] transition-colors"
                            >
                              {skill.title}
                            </label>
                            <span className="text-xs font-mono text-[#99907c]">{skill.name}</span>
                          </div>

                          <p className="text-xs sm:text-[13px] text-[#d0c5af] leading-relaxed">
                            {skill.description}
                          </p>
                        </div>

                        {/* Visual Progress Bar for Active Skills */}
                        {skill.enabled ? (
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="text-[#d0c5af]">
                                {progress.basisLabel} ·{' '}
                                <span className={pctColorClass}>{progress.tierLabel}</span>
                              </span>
                              <span className={`font-mono font-bold tabular-nums ${pctColorClass}`}>
                                {progress.percentage}%
                              </span>
                            </div>
                            <div
                              role="progressbar"
                              aria-valuenow={progress.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Progression pour ${skill.title} : ${progress.percentage}%`}
                              className="w-full h-2 rounded-full bg-[#070e1d] border border-[#232a3a] overflow-hidden"
                            >
                              <motion.div
                                initial={
                                  shouldReduceMotion
                                    ? false
                                    : { scaleX: 0 }
                                }
                                animate={{
                                  scaleX: Math.max(0, Math.min(1, progress.percentage / 100))
                                }}
                                transition={
                                  shouldReduceMotion
                                    ? { duration: 0 }
                                    : {
                                        duration: 0.45,
                                        delay: Math.min(0.3, idx * 0.015),
                                        ease: [0.16, 1, 0.3, 1]
                                      }
                                }
                                style={{ transformOrigin: 'left center' }}
                                className={`w-full h-full rounded-full ${barFillClass}`}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#99907c]">
                            Compétence désactivée — exclue du contexte global de l&apos;agent
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#99907c]">
                          <span className="text-[#d4c78f]">
                            {categoryMap.get(skill.category) || skill.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{skill.skillFilePath}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              skill.enabled && skill.loadedInRuntime
                                ? 'text-emerald-300 font-medium tabular-nums'
                                : 'text-[#99907c]'
                            }
                          >
                            {skill.enabled && skill.loadedInRuntime
                              ? `Active dans le contexte global (${formatBytesToKb(skill.instructionBytes)})`
                              : 'Exclue du contexte global'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 pl-10 md:pl-0 md:pt-0.5">
                      <SkillSparklineD3
                        skillTitle={skill.title}
                        analytics={skillAnalytics}
                        isSelected={selectedD3SkillId === skill.id || isD3RowExpanded}
                        onSelect={() => {
                          setSelectedD3SkillId(skill.id);
                          setExpandedD3RowId((prev) => (prev === skill.id ? null : skill.id));
                        }}
                      />

                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${
                          skill.enabled ? 'text-emerald-300' : 'text-[#99907c]'
                        }`}
                      >
                        {isBusy ? 'Mise à jour...' : skill.enabled ? 'Activée' : 'Désactivée'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedD3SkillId(skill.id);
                          setExpandedD3RowId((prev) => (prev === skill.id ? null : skill.id));
                        }}
                        aria-expanded={isD3RowExpanded}
                        className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
                          isD3RowExpanded ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                          show_chart
                        </span>
                        <span>{isD3RowExpanded ? 'Masquer D3' : 'Courbe D3'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInspectSkill(skill.id)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
                          isInspected ? 'luxury-btn-amber-soft' : 'luxury-btn-surface'
                        }`}
                      >
                        {isInspected ? 'Fermer' : 'Instructions'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Individual Skill D3 Progression Drawer */}
                  <AnimatePresence>
                    {isD3RowExpanded && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-[#232a3a] bg-[#090f1d] p-4"
                      >
                        <SkillIndividualDetailD3Chart
                          skill={skill}
                          categoryLabel={categoryMap.get(skill.category) || skill.category}
                          analytics={skillAnalytics}
                          compact
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inline Markdown Instructions Drawer */}
                  <AnimatePresence>
                    {isInspected && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-[#232a3a] bg-[#0c1322] p-4 space-y-2.5"
                      >
                        {isInspectLoading && (
                          <div className="text-xs text-[#d0c5af] flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                            <span>Lecture de {skill.skillFilePath}...</span>
                          </div>
                        )}
                        {inspectError && (
                          <div role="alert" className="text-xs text-rose-300">
                            {inspectError}
                          </div>
                        )}
                        {inspectData && (
                          <div className="space-y-2.5 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[#d0c5af]">
                              <span>{inspectData.reason}</span>
                              <span className="font-mono text-[11px] text-[#99907c] tabular-nums">
                                {formatBytesToKb(inspectData.bytes)}
                              </span>
                            </div>
                            {inspectData.availableInRuntime && inspectData.markdown && (
                              <pre className="max-h-64 overflow-y-auto rounded-lg bg-[#070e1d] border border-[#232a3a] p-3 text-[11px] leading-relaxed font-mono text-[#dce2f8] whitespace-pre-wrap">
                                {inspectData.markdown}
                              </pre>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
