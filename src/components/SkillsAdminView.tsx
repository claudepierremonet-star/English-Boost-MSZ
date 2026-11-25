import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  fetchSkillsRegistry,
  updateSkillEnabledState,
  selectSkillsForTask,
  fetchSkillInstructions,
  type SkillsRegistrySnapshot,
  type SkillAdminItem,
  type SkillSelectionApiResponse,
  type SkillInstructionsResponse
} from '../services/skillsService';
import { TelemetryListSkeleton } from './SkeletonLoaders';

type StatusFilter = 'all' | 'enabled' | 'disabled' | 'runtime_loaded';

const TASK_PRESETS: Array<{ label: string; task: string }> = [
  {
    label: 'Animations & UI/UX WCAG',
    task: "Spécifier des animations Framer Motion avec prefers-reduced-motion, design system React et accessibilité WCAG clavier"
  },
  {
    label: 'Backend, Sécurité & QA',
    task: 'Créer un endpoint API Express sécurisé avec audit des risques, validation serveur, base Firestore et tests de non-régression'
  },
  {
    label: 'Agent IA, Audio & APIs',
    task: "Concevoir un agent IA tuteur avec analyse audio, transcription, prononciation et intégration d'API résiliente"
  },
  {
    label: 'Dataviz D3 & Performance',
    task: 'Analyser les données de maîtrise avec visualisations D3 interactives et optimisation des performances de rendu'
  }
];

function getTierLabel(tier: SkillAdminItem['tier']): string {
  if (tier === 'project') return 'Projet';
  if (tier === 'companion') return 'Compagnon';
  return 'Master Skill';
}

export const SkillsAdminView: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const [snapshot, setSnapshot] = useState<SkillsRegistrySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  // Task selector & real context loader state
  const [taskInput, setTaskInput] = useState<string>(TASK_PRESETS[0].task);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectionResult, setSelectionResult] = useState<SkillSelectionApiResponse | null>(null);

  // Skill details & instructions inspector
  const [inspectedSkillId, setInspectedSkillId] = useState<string | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<SkillInstructionsResponse | null>(null);
  const [copiedContext, setCopiedContext] = useState<boolean>(false);

  const loadRegistry = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchSkillsRegistry();
      setSnapshot(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erreur de chargement du registre.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  useEffect(() => {
    if (!actionBanner) return;
    const timer = setTimeout(() => setActionBanner(null), 3500);
    return () => clearTimeout(timer);
  }, [actionBanner]);

  const handleToggleSkill = async (skill: SkillAdminItem) => {
    if (togglingIds[skill.id]) return;
    const nextEnabled = !skill.enabled;
    setTogglingIds((prev) => ({ ...prev, [skill.id]: true }));
    setActionBanner(null);

    try {
      const res = await updateSkillEnabledState(skill.id, nextEnabled);
      setSnapshot(res.snapshot);
      if (inspectData && inspectData.skill.id === skill.id) {
        setInspectData((prev) => (prev ? { ...prev, skill: res.skill } : prev));
      }
      setActionBanner({
        type: 'success',
        message: `${skill.name} ${nextEnabled ? 'activée' : 'désactivée'} dans skills/index.json.`
      });
      // Re-run task selection automatically if a result is already displayed so disabled state stays truthful
      if (selectionResult && taskInput.trim()) {
        try {
          const refreshed = await selectSkillsForTask(taskInput.trim());
          setSelectionResult(refreshed);
        } catch {
          // Keep current selection preview if refresh fails
        }
      }
    } catch (err) {
      setActionBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Échec de la mise à jour.'
      });
    } finally {
      setTogglingIds((prev) => {
        const copy = { ...prev };
        delete copy[skill.id];
        return copy;
      });
    }
  };

  const handleSelectForTask = async (overrideTask?: string) => {
    const query = (overrideTask ?? taskInput).trim();
    if (!query) {
      setSelectionError('Veuillez saisir une description de tâche.');
      return;
    }
    if (overrideTask !== undefined) {
      setTaskInput(overrideTask);
    }
    setIsSelecting(true);
    setSelectionError(null);
    setCopiedContext(false);
    try {
      const data = await selectSkillsForTask(query);
      setSelectionResult(data);
    } catch (err) {
      setSelectionError(err instanceof Error ? err.message : 'Erreur lors de la sélection.');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleCopyContext = async () => {
    const ctxText = selectionResult?.context.assembledSystemContext;
    if (!ctxText) return;
    try {
      await navigator.clipboard.writeText(ctxText);
      setCopiedContext(true);
      setTimeout(() => setCopiedContext(false), 2200);
    } catch {
      setActionBanner({
        type: 'error',
        message: 'Impossible de copier le contexte dans le presse-papiers.'
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
      setInspectError(err instanceof Error ? err.message : 'Impossible de lire cette compétence.');
    } finally {
      setIsInspectLoading(false);
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    snapshot?.categories.forEach((cat) => map.set(cat.id, cat.label));
    return map;
  }, [snapshot]);

  const filteredSkills = useMemo(() => {
    if (!snapshot) return [];
    const q = searchQuery.trim().toLowerCase();

    return snapshot.skills.filter((skill) => {
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) return false;
      if (statusFilter === 'enabled' && !skill.enabled) return false;
      if (statusFilter === 'disabled' && skill.enabled) return false;
      if (statusFilter === 'runtime_loaded' && !skill.loadedInRuntime) return false;

      if (!q) return true;
      const haystack = [
        skill.id,
        skill.name,
        skill.title,
        skill.description,
        categoryMap.get(skill.category) || '',
        ...skill.triggers
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [snapshot, searchQuery, selectedCategory, statusFilter, categoryMap]);

  if (isLoading) {
    return (
      <section aria-label="Chargement de l'administration des Skills" className="w-full space-y-4">
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
          Registre des Skills indisponible
        </h3>
        <p className="text-xs text-[#d0c5af] max-w-md mx-auto">
          {loadError || 'Impossible de contacter le serveur pour lire skills/index.json.'}
        </p>
        <button
          type="button"
          onClick={loadRegistry}
          className="min-h-[40px] px-4 py-2 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold transition-colors cursor-pointer"
        >
          Réessayer
        </button>
      </section>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 select-text">
      {/* Header & KPI Strip */}
      <section className="w-full rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-[#d4c78f] font-medium">
              Registre central · skills/index.json
            </p>
            <h3 className="font-serif text-xl text-[#dce2f8] font-bold">
              Administration des AI Studio Skills
            </h3>
            <p className="text-xs text-[#d0c5af]/85 max-w-2xl">
              Les Skills sont des instructions spécialisées chargées uniquement lorsqu&apos;elles sont réellement disponibles dans le contexte. Aucune activation n&apos;est simulée.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRegistry}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-[#151b2b] hover:bg-[#232a3a] border border-[#4d4635]/60 text-xs font-semibold text-[#dce2f8] whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#f2ca50]">refresh</span>
            <span>Actualiser</span>
          </button>
        </div>

        {/* Clean Tabular KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#232a3a]">
          <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] px-3.5 py-3">
            <span className="text-[11px] text-[#d0c5af] block">Master Skills indexées</span>
            <span className="text-xl font-bold font-mono tabular-nums text-[#f2ca50]">
              {snapshot.summary.total}
            </span>
            <span className="text-[11px] text-[#99907c] block mt-0.5 tabular-nums">
              {snapshot.summary.masterCount} fichiers SKILL_*.md analysés
            </span>
          </div>

          <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] px-3.5 py-3">
            <span className="text-[11px] text-[#d0c5af] block">Statut dans le registre</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
              {snapshot.summary.enabledCount} / {snapshot.summary.total}
            </span>
            <span className="text-[11px] text-[#99907c] block mt-0.5 tabular-nums">
              {snapshot.summary.disabledCount} désactivée(s)
            </span>
          </div>

          <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] px-3.5 py-3">
            <span className="text-[11px] text-[#d0c5af] block">Chargées en contexte réel</span>
            <span className="text-xl font-bold font-mono tabular-nums text-sky-300">
              {snapshot.summary.runtimeReadableCount} / {snapshot.summary.total}
            </span>
            <span className="text-[11px] text-[#99907c] block mt-0.5">
              Instructions lues sur disque
            </span>
          </div>

          <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] px-3.5 py-3">
            <span className="text-[11px] text-[#d0c5af] block">Catégories organisées</span>
            <span className="text-xl font-bold font-mono tabular-nums text-[#dce2f8]">
              {snapshot.summary.categoriesCount}
            </span>
            <span className="text-[11px] text-[#99907c] block mt-0.5">
              Sélection contextuelle active
            </span>
          </div>
        </div>

        <AnimatePresence>
          {actionBanner && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className={`rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-2 border ${
                actionBanner.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {actionBanner.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{actionBanner.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Task-Based Skill Selector & Real Context Loader */}
      <section className="w-full rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 p-5 space-y-4">
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-bold text-[#dce2f8]">
            Sélection & Chargement Contextuel par Tâche
          </h4>
          <p className="text-xs text-[#d0c5af]/85">
            Décrivez une tâche pour vérifier quelles Skills activées correspondent et inspecter uniquement les instructions réellement chargées depuis le workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TASK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectForTask(preset.task)}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#151b2b] hover:bg-[#232a3a] border border-[#2e3545] text-xs font-medium text-[#d4c78f] hover:text-[#f2ca50] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSelectForTask();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <label htmlFor="skills-task-input" className="sr-only">
            Description de la tâche
          </label>
          <input
            id="skills-task-input"
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            maxLength={500}
            placeholder="Ex : Ajouter un endpoint Express sécurisé avec validation et tests..."
            className="flex-1 min-h-[42px] px-3.5 py-2 rounded-lg bg-[#0c1322] border border-[#2e3545] focus:border-[#f2ca50] text-sm text-[#dce2f8] placeholder-[#99907c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
          />
          <button
            type="submit"
            disabled={isSelecting}
            className="min-h-[42px] px-5 py-2 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-60 text-[#3c2f00] text-xs font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088] cursor-pointer"
          >
            <span className={`material-symbols-outlined text-base ${isSelecting ? 'animate-spin' : ''}`}>
              {isSelecting ? 'sync' : 'playlist_add_check'}
            </span>
            <span>{isSelecting ? 'Analyse...' : 'Sélectionner & Charger'}</span>
          </button>
        </form>

        {selectionError && (
          <div role="alert" className="rounded-lg bg-rose-950/50 border border-rose-500/40 px-3 py-2 text-xs text-rose-200">
            {selectionError}
          </div>
        )}

        {selectionResult && (
          <div className="space-y-4 pt-3 border-t border-[#232a3a]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#d0c5af]">
              <span>
                <strong className="text-[#dce2f8] tabular-nums">{selectionResult.selection.selected.length}</strong> Skill(s) sélectionnée(s) ·{' '}
                <strong className="text-sky-300 tabular-nums">{selectionResult.context.loadedSkills.length}</strong> chargée(s) en runtime ·{' '}
                <strong className="text-[#99907c] tabular-nums">{selectionResult.context.unloadedSkills.length}</strong> hors runtime
              </span>
              <span className="font-mono text-[11px] text-[#99907c]">
                Simulation : Désactivée (vérité stricte)
              </span>
            </div>

            {selectionResult.selection.selected.length === 0 ? (
              <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] p-4 text-xs text-[#d0c5af]">
                Aucune Skill activée ne correspond à cette requête. Essayez des termes plus précis ou réactivez les compétences concernées ci-dessous.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectionResult.selection.selected.map((match) => {
                  const loaded = selectionResult.context.loadedSkills.find(
                    (l) => l.skillId === match.skill.id
                  );
                  return (
                    <div
                      key={match.skill.id}
                      className="rounded-xl bg-[#151b2b] border border-[#2e3545] p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-[#dce2f8]">{match.skill.title}</div>
                          <div className="text-[11px] text-[#99907c]">
                            {match.skill.name} · Score {match.score}
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-mono font-semibold shrink-0 flex items-center gap-1 ${
                            loaded ? 'text-emerald-300' : 'text-amber-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {loaded ? 'task_alt' : 'cloud_off'}
                          </span>
                          <span>{loaded ? 'Chargée' : 'Hors runtime'}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-[#d0c5af]">
                        Déclencheurs : <span className="font-mono text-[#f2ca50]">{match.matchedTriggers.join(', ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectionResult.selection.excluded.length > 0 && (
              <div className="rounded-xl bg-[#0c1322] border border-[#232a3a] p-3 text-xs text-[#d0c5af] space-y-1">
                <div className="font-semibold text-[#dce2f8]">Compétences écartées :</div>
                {selectionResult.selection.excluded.map((ex) => (
                  <div key={ex.id} className="text-[11px] text-[#99907c]">
                    {ex.name} · {ex.reason === 'disabled' ? 'Désactivée manuellement' : `Anti-déclencheur (${ex.matchedRule})`}
                  </div>
                ))}
              </div>
            )}

            {selectionResult.context.assembledSystemContext && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-[#d4c78f]">
                    Contexte d&apos;instructions réellement chargé ({selectionResult.context.loadedSkills.length} fichier(s) SKILL_*.md) :
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyContext}
                    className="min-h-[32px] px-3 py-1 rounded-lg bg-[#151b2b] hover:bg-[#232a3a] border border-[#2e3545] text-[11px] font-semibold text-[#dce2f8] flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">
                      {copiedContext ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedContext ? 'Contexte copié' : 'Copier le contexte'}</span>
                  </button>
                </div>
                <pre className="max-h-56 overflow-y-auto rounded-xl bg-[#070e1d] border border-[#232a3a] p-3 text-[11px] leading-relaxed font-mono text-[#dce2f8] whitespace-pre-wrap">
                  {selectionResult.context.assembledSystemContext}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Catalog Filters + Skills Table */}
      <section className="w-full rounded-2xl bg-[#191f2f] border border-[#4d4635]/40 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="skills-search-input" className="sr-only">
              Rechercher une compétence
            </label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c] text-lg pointer-events-none">
              search
            </span>
            <input
              id="skills-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par nom, description ou mot-clé..."
              className="w-full min-h-[40px] pl-10 pr-3 py-2 rounded-lg bg-[#0c1322] border border-[#2e3545] focus:border-[#f2ca50] text-xs text-[#dce2f8] placeholder-[#99907c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par statut">
            {(
              [
                { id: 'all', label: 'Tous' },
                { id: 'enabled', label: 'Activées' },
                { id: 'disabled', label: 'Désactivées' },
                { id: 'runtime_loaded', label: 'Chargées en contexte' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
                  statusFilter === opt.id
                    ? 'bg-[#f2ca50] text-[#3c2f00]'
                    : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#dce2f8] border border-[#232a3a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Catégories de compétences">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/50'
                : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#dce2f8] border border-[#232a3a]'
            }`}
          >
            Toutes ({snapshot.skills.length})
          </button>
          {snapshot.categories.map((cat) => {
            const count = snapshot.skills.filter((s) => s.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer ${
                  isSelected
                    ? 'bg-[#232a3a] text-[#f2ca50] border border-[#f2ca50]/50'
                    : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#dce2f8] border border-[#232a3a]'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSkills.length === 0 ? (
          <div className="rounded-xl bg-[#151b2b] border border-[#232a3a] p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-[#99907c]">filter_list_off</span>
            <p className="text-sm font-semibold text-[#dce2f8]">
              Aucune compétence ne correspond à ces filtres.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
              }}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#232a3a] hover:bg-[#2e3545] text-xs font-semibold text-[#f2ca50] cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#232a3a] rounded-xl border border-[#232a3a] bg-[#151b2b] overflow-hidden">
            {filteredSkills.map((skill) => {
              const isBusy = Boolean(togglingIds[skill.id]);
              const isInspected = inspectedSkillId === skill.id;
              return (
                <div key={skill.id} className="transition-colors hover:bg-[#191f2f]/80">
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h5 className="text-sm font-bold text-[#dce2f8]">{skill.title}</h5>
                        <span className="text-xs font-mono text-[#99907c]">{skill.name}</span>
                      </div>
                      <p className="text-xs text-[#d0c5af]/90 leading-relaxed">
                        {skill.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#99907c]">
                        <span className="text-[#d4c78f]">{categoryMap.get(skill.category) || skill.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getTierLabel(skill.tier)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{skill.skillFilePath}</span>
                        <span aria-hidden="true">·</span>
                        <span className={skill.loadedInRuntime ? 'text-sky-300 font-medium' : 'text-[#99907c]'}>
                          {skill.loadedInRuntime
                            ? `Chargée (${skill.instructionBytes} o)`
                            : 'Non chargée'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInspectSkill(skill.id)}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#0c1322] hover:bg-[#232a3a] border border-[#2e3545] text-xs font-semibold text-[#dce2f8] whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer"
                      >
                        {isInspected ? 'Fermer' : 'Instructions'}
                      </button>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={skill.enabled}
                        aria-label={`${skill.enabled ? 'Désactiver' : 'Activer'} la compétence ${skill.name}`}
                        disabled={isBusy}
                        onClick={() => handleToggleSkill(skill)}
                        className={`min-h-[40px] min-w-[118px] px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] cursor-pointer disabled:opacity-50 ${
                          skill.enabled
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/80'
                            : 'bg-[#0c1322] border-[#4d4635]/50 text-[#99907c] hover:text-[#dce2f8]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isBusy ? 'sync' : skill.enabled ? 'toggle_on' : 'toggle_off'}
                        </span>
                        <span>{skill.enabled ? 'Activée' : 'Désactivée'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Inspector Panel */}
                  <AnimatePresence>
                    {isInspected && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-[#232a3a] bg-[#0c1322] p-4 space-y-3"
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
                          <div className="space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[#d0c5af]">
                              <span>
                                Statut de chargement :{' '}
                                <strong className={inspectData.availableInRuntime ? 'text-emerald-300' : 'text-amber-300'}>
                                  {inspectData.availableInRuntime
                                    ? 'Instructions chargées depuis le workspace'
                                    : 'Non chargée en runtime serveur'}
                                </strong>
                              </span>
                              <span className="font-mono text-[11px] text-[#99907c]">
                                Priorité {skill.priority} · {inspectData.bytes} octets
                              </span>
                            </div>

                            <p className="text-[#d0c5af]/90">{inspectData.reason}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                              <div>
                                <span className="text-[#99907c] block mb-1">Déclencheurs :</span>
                                <span className="font-mono text-[#f2ca50]">
                                  {skill.triggers.length > 0 ? skill.triggers.join(', ') : 'Aucun'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#99907c] block mb-1">Exclusions (anti-triggers) :</span>
                                <span className="font-mono text-[#d0c5af]">
                                  {skill.antiTriggers.length > 0 ? skill.antiTriggers.join(', ') : 'Aucune'}
                                </span>
                              </div>
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
