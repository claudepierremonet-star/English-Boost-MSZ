export type SkillTier = 'master' | 'companion' | 'project';
export type SkillSource = 'system_harness' | 'workspace';

export interface SkillCategory {
  id: string;
  label: string;
  description: string;
}

export interface SkillAdminItem {
  id: string;
  name: string;
  title: string;
  tier: SkillTier;
  category: string;
  source: SkillSource;
  skillFilePath: string;
  runtimeReadable: boolean;
  priority: number;
  enabled: boolean;
  description: string;
  triggers: string[];
  antiTriggers: string[];
  loadedInRuntime: boolean;
  instructionBytes: number;
  runtimeStatusReason: string;
}

export interface SkillsRegistrySnapshot {
  schemaVersion: string;
  projectName: string;
  updatedAt?: string;
  summary: {
    total: number;
    masterCount: number;
    companionCount: number;
    projectCount: number;
    enabledCount: number;
    disabledCount: number;
    runtimeReadableCount: number;
    categoriesCount: number;
  };
  categories: SkillCategory[];
  skills: SkillAdminItem[];
}

export interface SelectedSkillEntry {
  skill: SkillAdminItem;
  score: number;
  matchedTriggers: string[];
  reason: string;
}

export interface ExcludedSkillEntry {
  id: string;
  name: string;
  title: string;
  reason: 'disabled' | 'anti_trigger';
  matchedRule: string;
}

export interface LoadedContextSkillEntry {
  skillId: string;
  name: string;
  title: string;
  category: string;
  tier: SkillTier;
  source: SkillSource;
  skillFilePath: string;
  loadStatus: 'loaded' | 'not_loaded_in_runtime' | 'read_error';
  reason: string;
  frontmatterName?: string;
  instructionsMarkdown?: string;
  contentBytes: number;
  sha256?: string;
  loadedAt?: string;
}

export interface SkillSelectionApiResponse {
  selection: {
    task: string;
    normalizedTask: string;
    selected: SelectedSkillEntry[];
    excluded: ExcludedSkillEntry[];
    totalEvaluated: number;
  };
  context: {
    task: string;
    generatedAt: string;
    loadedSkills: LoadedContextSkillEntry[];
    unloadedSkills: LoadedContextSkillEntry[];
    assembledSystemContext: string;
    hasSimulatedSkills: false;
  };
}

export interface SkillInstructionsResponse {
  found: true;
  skill: SkillAdminItem;
  availableInRuntime: boolean;
  loadStatus: 'loaded' | 'not_loaded_in_runtime' | 'read_error';
  frontmatterName?: string;
  markdown?: string;
  body?: string;
  bytes: number;
  sha256?: string;
  reason: string;
}

export interface GlobalAgentContextSnapshot {
  sourceRegistry: 'skills/index.json';
  generatedAt: string;
  totalSkills: number;
  enabledCount: number;
  disabledCount: number;
  loadedCount: number;
  totalBytes: number;
  activeSkillIds: string[];
  disabledSkillIds: string[];
  context: SkillSelectionApiResponse['context'];
  hasSimulatedSkills: false;
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload && typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // ignore non-json
  }
  return `${fallback} (HTTP ${response.status})`;
}

export async function fetchSkillsRegistry(): Promise<SkillsRegistrySnapshot> {
  const res = await fetch('/api/skills', {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Impossible de charger le registre des Skills'));
  }
  return (await res.json()) as SkillsRegistrySnapshot;
}

export async function fetchGlobalAgentContext(): Promise<GlobalAgentContextSnapshot> {
  const res = await fetch('/api/skills/global-context', {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) {
    throw new Error(
      await parseErrorMessage(res, 'Impossible de charger le contexte global de l’agent')
    );
  }
  return (await res.json()) as GlobalAgentContextSnapshot;
}

export async function updateSkillEnabledState(
  skillId: string,
  enabled: boolean
): Promise<{
  skill: SkillAdminItem;
  snapshot: SkillsRegistrySnapshot;
  globalContext?: GlobalAgentContextSnapshot;
}> {
  const res = await fetch(`/api/skills/${encodeURIComponent(skillId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ enabled })
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Impossible de modifier le statut de la Skill'));
  }
  return (await res.json()) as {
    skill: SkillAdminItem;
    snapshot: SkillsRegistrySnapshot;
    globalContext?: GlobalAgentContextSnapshot;
  };
}

export async function bulkUpdateSkillsEnabled(
  enabled: boolean,
  skillIds?: string[]
): Promise<{ snapshot: SkillsRegistrySnapshot; globalContext: GlobalAgentContextSnapshot }> {
  const res = await fetch('/api/skills/bulk', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ enabled, skillIds })
  });
  if (!res.ok) {
    throw new Error(
      await parseErrorMessage(res, 'Impossible de mettre à jour les compétences en lot')
    );
  }
  return (await res.json()) as {
    snapshot: SkillsRegistrySnapshot;
    globalContext: GlobalAgentContextSnapshot;
  };
}

export async function selectSkillsForTask(
  task: string,
  maxResults = 8
): Promise<SkillSelectionApiResponse> {
  const res = await fetch('/api/skills/select', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ task, maxResults })
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Impossible de sélectionner les Skills'));
  }
  return (await res.json()) as SkillSelectionApiResponse;
}

export async function fetchSkillInstructions(skillId: string): Promise<SkillInstructionsResponse> {
  const res = await fetch(`/api/skills/${encodeURIComponent(skillId)}/instructions`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Impossible de lire les instructions de la Skill'));
  }
  return (await res.json()) as SkillInstructionsResponse;
}
