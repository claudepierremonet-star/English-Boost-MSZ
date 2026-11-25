import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export type SkillTier = 'master' | 'companion' | 'project';
export type SkillSource = 'system_harness' | 'workspace';

export interface SkillCategoryDefinition {
  id: string;
  label: string;
  description: string;
}

export interface SkillDefinition {
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
}

export interface SkillsRegistryFile {
  schemaVersion: string;
  projectName: string;
  generatedFrom: {
    masterSkillsScanned: number;
    companionSkillsScanned: number;
    projectSkillsScanned: number;
    totalSkillsScanned: number;
  };
  categories: SkillCategoryDefinition[];
  skills: SkillDefinition[];
  updatedAt?: string;
}

export interface SelectedSkillMatch {
  skill: SkillDefinition;
  score: number;
  matchedTriggers: string[];
  reason: string;
}

export interface ExcludedSkillMatch {
  id: string;
  name: string;
  title: string;
  reason: 'disabled' | 'anti_trigger';
  matchedRule: string;
}

export interface SkillSelectionResult {
  task: string;
  normalizedTask: string;
  selected: SelectedSkillMatch[];
  excluded: ExcludedSkillMatch[];
  totalEvaluated: number;
}

export type SkillInstructionLoadStatus =
  | 'loaded'
  | 'not_loaded_in_runtime'
  | 'read_error';

export interface LoadedSkillContextEntry {
  skillId: string;
  name: string;
  title: string;
  category: string;
  tier: SkillTier;
  source: SkillSource;
  skillFilePath: string;
  loadStatus: SkillInstructionLoadStatus;
  reason: string;
  frontmatterName?: string;
  instructionsMarkdown?: string;
  contentBytes: number;
  sha256?: string;
  loadedAt?: string;
}

export interface AgentWorkingContext {
  task: string;
  generatedAt: string;
  loadedSkills: LoadedSkillContextEntry[];
  unloadedSkills: LoadedSkillContextEntry[];
  assembledSystemContext: string;
  hasSimulatedSkills: false;
}

export function normalizeSkillQueryText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s._/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesNormalizedPhrase(normalizedText: string, phrase: string): boolean {
  const normPhrase = normalizeSkillQueryText(phrase);
  if (!normPhrase) return false;
  if (normPhrase.includes(' ') || normPhrase.includes('/') || normPhrase.includes('.') || normPhrase.includes('-')) {
    return normalizedText.includes(normPhrase);
  }
  const regex = new RegExp(`(^|\\s|/|\\.|-)${escapeRegExp(normPhrase)}($|\\s|/|\\.|-)`, 'i');
  return regex.test(normalizedText);
}

export function validateSkillRegistry(raw: unknown): SkillsRegistryFile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Registre skills/index.json invalide : objet attendu.');
  }
  const data = raw as Partial<SkillsRegistryFile>;
  if (!Array.isArray(data.categories) || !Array.isArray(data.skills)) {
    throw new Error('Registre skills/index.json invalide : categories et skills requis.');
  }

  const categoryIds = new Set<string>();
  const categories: SkillCategoryDefinition[] = data.categories.map((cat) => {
    if (!cat || typeof cat.id !== 'string' || typeof cat.label !== 'string') {
      throw new Error('Catégorie invalide dans skills/index.json.');
    }
    categoryIds.add(cat.id);
    return {
      id: cat.id,
      label: cat.label,
      description: typeof cat.description === 'string' ? cat.description : ''
    };
  });

  const seenIds = new Set<string>();
  const skills: SkillDefinition[] = data.skills.map((item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !/^[a-z0-9-]+$/.test(item.id) ||
      typeof item.name !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.category !== 'string' ||
      !categoryIds.has(item.category) ||
      typeof item.skillFilePath !== 'string' ||
      typeof item.description !== 'string'
    ) {
      throw new Error(`Compétence invalide dans skills/index.json : ${String(item?.id)}`);
    }
    if (seenIds.has(item.id)) {
      throw new Error(`Identifiant de compétence dupliqué : ${item.id}`);
    }
    seenIds.add(item.id);

    return {
      id: item.id,
      name: item.name,
      title: item.title,
      tier: item.tier === 'companion' || item.tier === 'project' ? item.tier : 'master',
      category: item.category,
      source: item.source === 'workspace' ? 'workspace' : 'system_harness',
      skillFilePath: item.skillFilePath,
      runtimeReadable: Boolean(item.runtimeReadable),
      priority: typeof item.priority === 'number' && Number.isFinite(item.priority) ? item.priority : 50,
      enabled: Boolean(item.enabled),
      description: item.description,
      triggers: Array.isArray(item.triggers) ? item.triggers.filter((t): t is string => typeof t === 'string') : [],
      antiTriggers: Array.isArray(item.antiTriggers)
        ? item.antiTriggers.filter((t): t is string => typeof t === 'string')
        : []
    };
  });

  return {
    schemaVersion: typeof data.schemaVersion === 'string' ? data.schemaVersion : '1.0.0',
    projectName: typeof data.projectName === 'string' ? data.projectName : 'English Boost MSZ',
    generatedFrom: {
      masterSkillsScanned: skills.filter((s) => s.tier === 'master').length,
      companionSkillsScanned: skills.filter((s) => s.tier === 'companion').length,
      projectSkillsScanned: skills.filter((s) => s.tier === 'project').length,
      totalSkillsScanned: skills.length
    },
    categories,
    skills,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined
  };
}

export function selectRelevantSkills(
  taskDescription: string,
  skills: SkillDefinition[],
  options: { maxResults?: number } = {}
): SkillSelectionResult {
  const maxResults = Math.max(1, Math.min(26, options.maxResults ?? 8));
  const normalizedTask = normalizeSkillQueryText(taskDescription);
  const selected: SelectedSkillMatch[] = [];
  const excluded: ExcludedSkillMatch[] = [];

  if (!normalizedTask) {
    return {
      task: taskDescription,
      normalizedTask,
      selected: [],
      excluded: [],
      totalEvaluated: skills.length
    };
  }

  for (const skill of skills) {
    const matchedAnti = skill.antiTriggers.find((anti) => matchesNormalizedPhrase(normalizedTask, anti));
    const matchedTriggers = skill.triggers.filter((trigger) => matchesNormalizedPhrase(normalizedTask, trigger));

    const nameHit =
      matchesNormalizedPhrase(normalizedTask, skill.id) ||
      matchesNormalizedPhrase(normalizedTask, skill.name) ||
      matchesNormalizedPhrase(normalizedTask, skill.title);

    if (matchedTriggers.length === 0 && !nameHit) {
      continue;
    }

    if (!skill.enabled) {
      excluded.push({
        id: skill.id,
        name: skill.name,
        title: skill.title,
        reason: 'disabled',
        matchedRule: matchedTriggers[0] || skill.id
      });
      continue;
    }

    if (matchedAnti) {
      excluded.push({
        id: skill.id,
        name: skill.name,
        title: skill.title,
        reason: 'anti_trigger',
        matchedRule: matchedAnti
      });
      continue;
    }

    const triggerScore = matchedTriggers.length * 18 + (nameHit ? 25 : 0);
    const score = triggerScore + Math.round(skill.priority * 0.35);

    selected.push({
      skill,
      score,
      matchedTriggers: nameHit ? Array.from(new Set([skill.name, ...matchedTriggers])) : matchedTriggers,
      reason: `Correspondance sur ${matchedTriggers.length || 1} mot(s)-clé(s) (${
        skill.tier === 'project' ? 'Skill Projet' : skill.tier === 'companion' ? 'Sous-skill' : 'Master Skill'
      })`
    });
  }

  selected.sort((a, b) => b.score - a.score || b.skill.priority - a.skill.priority);

  return {
    task: taskDescription,
    normalizedTask,
    selected: selected.slice(0, maxResults),
    excluded,
    totalEvaluated: skills.length
  };
}

export function stripFrontmatter(markdown: string): { frontmatterName?: string; body: string } {
  const normalized = markdown.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { body: normalized.trim() };
  }
  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    return { body: normalized.trim() };
  }
  const header = normalized.slice(4, endIdx);
  const nameMatch = header.match(/^name:\s*["']?([^"'\n]+)["']?\s*$/m);
  return {
    frontmatterName: nameMatch?.[1]?.trim(),
    body: normalized.slice(endIdx + 5).trim()
  };
}

export function resolveSafeWorkspaceSkillPath(workspaceRoot: string, relativeSkillPath: string): string {
  const rootResolved = path.resolve(workspaceRoot);
  const candidate = path.resolve(rootResolved, relativeSkillPath);
  if (candidate !== rootResolved && !candidate.startsWith(rootResolved + path.sep)) {
    throw new Error(`Chemin Skill hors périmètre workspace : ${relativeSkillPath}`);
  }
  return candidate;
}

export function readWorkspaceSkillMarkdown(
  workspaceRoot: string,
  skill: SkillDefinition
): { ok: true; markdown: string; bytes: number; sha256: string } | { ok: false; error: string } {
  if (!skill.runtimeReadable || skill.source !== 'workspace') {
    return {
      ok: false,
      error: `Le fichier ${skill.skillFilePath} appartient au harnais agent AI Studio et n'est pas lisible par le serveur Node.js.`
    };
  }
  try {
    const safePath = resolveSafeWorkspaceSkillPath(workspaceRoot, skill.skillFilePath);
    if (!fs.existsSync(safePath)) {
      return { ok: false, error: `Fichier introuvable dans le workspace : ${skill.skillFilePath}` };
    }
    const raw = fs.readFileSync(safePath, 'utf-8');
    if (!raw.trim()) {
      return { ok: false, error: `Fichier Skill vide : ${skill.skillFilePath}` };
    }
    const sha256 = crypto.createHash('sha256').update(raw, 'utf-8').digest('hex');
    return {
      ok: true,
      markdown: raw,
      bytes: Buffer.byteLength(raw, 'utf-8'),
      sha256
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erreur lecture fichier SKILL.md'
    };
  }
}

export function loadSkillInstructionsIntoContext(
  task: string,
  selectedMatches: SelectedSkillMatch[],
  options: {
    workspaceRoot: string;
    agentContextMarkdownById?: Record<string, string>;
  }
): AgentWorkingContext {
  const loadedSkills: LoadedSkillContextEntry[] = [];
  const unloadedSkills: LoadedSkillContextEntry[] = [];
  const nowIso = new Date().toISOString();

  for (const match of selectedMatches) {
    const skill = match.skill;
    if (!skill.enabled) {
      unloadedSkills.push({
        skillId: skill.id,
        name: skill.name,
        title: skill.title,
        category: skill.category,
        tier: skill.tier,
        source: skill.source,
        skillFilePath: skill.skillFilePath,
        loadStatus: 'not_loaded_in_runtime',
        reason: 'Compétence désactivée dans skills/index.json.',
        contentBytes: 0
      });
      continue;
    }

    const injectedFromAgent = options.agentContextMarkdownById?.[skill.id];
    if (typeof injectedFromAgent === 'string' && injectedFromAgent.trim().length > 0) {
      const parsed = stripFrontmatter(injectedFromAgent);
      loadedSkills.push({
        skillId: skill.id,
        name: skill.name,
        title: skill.title,
        category: skill.category,
        tier: skill.tier,
        source: skill.source,
        skillFilePath: skill.skillFilePath,
        loadStatus: 'loaded',
        reason: 'Instructions réelles injectées depuis le contexte agent actif.',
        frontmatterName: parsed.frontmatterName,
        instructionsMarkdown: parsed.body,
        contentBytes: Buffer.byteLength(injectedFromAgent, 'utf-8'),
        sha256: crypto.createHash('sha256').update(injectedFromAgent, 'utf-8').digest('hex'),
        loadedAt: nowIso
      });
      continue;
    }

    if (skill.runtimeReadable && skill.source === 'workspace') {
      const readRes = readWorkspaceSkillMarkdown(options.workspaceRoot, skill);
      if (readRes.ok === true) {
        const parsed = stripFrontmatter(readRes.markdown);
        loadedSkills.push({
          skillId: skill.id,
          name: skill.name,
          title: skill.title,
          category: skill.category,
          tier: skill.tier,
          source: skill.source,
          skillFilePath: skill.skillFilePath,
          loadStatus: 'loaded',
          reason: `Instructions chargées depuis ${skill.skillFilePath}.`,
          frontmatterName: parsed.frontmatterName,
          instructionsMarkdown: parsed.body,
          contentBytes: readRes.bytes,
          sha256: readRes.sha256,
          loadedAt: nowIso
        });
      } else {
        unloadedSkills.push({
          skillId: skill.id,
          name: skill.name,
          title: skill.title,
          category: skill.category,
          tier: skill.tier,
          source: skill.source,
          skillFilePath: skill.skillFilePath,
          loadStatus: 'read_error',
          reason: readRes.error,
          contentBytes: 0
        });
      }
      continue;
    }

    // Never simulate activation when the SKILL.md lives outside the runtime filesystem and wasn't loaded
    unloadedSkills.push({
      skillId: skill.id,
      name: skill.name,
      title: skill.title,
      category: skill.category,
      tier: skill.tier,
      source: skill.source,
      skillFilePath: skill.skillFilePath,
      loadStatus: 'not_loaded_in_runtime',
      reason: `Non simulée : ${skill.skillFilePath} réside dans le harnais agent AI Studio et doit être chargé via view_file dans le contexte de l'agent.`,
      contentBytes: 0
    });
  }

  const assembledSystemContext =
    loadedSkills.length > 0
      ? loadedSkills
          .map(
            (entry) =>
              `### [SKILL: ${entry.name}] (${entry.skillFilePath})\n${entry.instructionsMarkdown || ''}`
          )
          .join('\n\n---\n\n')
      : '';

  return {
    task,
    generatedAt: nowIso,
    loadedSkills,
    unloadedSkills,
    assembledSystemContext,
    hasSimulatedSkills: false
  };
}
