import fs from 'fs';
import path from 'path';
import {
  validateSkillRegistry,
  selectRelevantSkills,
  loadSkillInstructionsIntoContext,
  readWorkspaceSkillMarkdown,
  stripFrontmatter,
  type SkillsRegistryFile,
  type SkillDefinition,
  type SkillSelectionResult,
  type AgentWorkingContext
} from './skillEngine.ts';

export interface SkillRuntimeStatusItem extends SkillDefinition {
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
  categories: SkillsRegistryFile['categories'];
  skills: SkillRuntimeStatusItem[];
}

let writeMutex: Promise<void> = Promise.resolve();

function getRegistryFilePath(workspaceRoot: string): string {
  const rootResolved = path.resolve(workspaceRoot);
  const target = path.resolve(rootResolved, 'skills', 'index.json');
  if (!target.startsWith(rootResolved + path.sep)) {
    throw new Error('Chemin skills/index.json invalide.');
  }
  return target;
}

export function readValidatedRegistry(workspaceRoot: string): SkillsRegistryFile {
  const filePath = getRegistryFilePath(workspaceRoot);
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(rawText);
  return validateSkillRegistry(parsed);
}

export function getRegistrySnapshot(workspaceRoot: string): SkillsRegistrySnapshot {
  const registry = readValidatedRegistry(workspaceRoot);

  const enrichedSkills: SkillRuntimeStatusItem[] = registry.skills.map((skill) => {
    if (skill.runtimeReadable && skill.source === 'workspace') {
      const probe = readWorkspaceSkillMarkdown(workspaceRoot, skill);
      if (probe.ok === true) {
        return {
          ...skill,
          loadedInRuntime: skill.enabled,
          instructionBytes: probe.bytes,
          runtimeStatusReason: skill.enabled
            ? `Chargée depuis ${skill.skillFilePath} (${probe.bytes} octets)`
            : `Désactivée manuellement (fichier présent : ${skill.skillFilePath})`
        };
      }
      return {
        ...skill,
        loadedInRuntime: false,
        instructionBytes: 0,
        runtimeStatusReason: probe.error
      };
    }

    return {
      ...skill,
      loadedInRuntime: false,
      instructionBytes: 0,
      runtimeStatusReason:
        'Non chargée en runtime serveur (SKILL.md géré dans le harnais agent AI Studio via view_file)'
    };
  });

  const enabledCount = enrichedSkills.filter((s) => s.enabled).length;
  const runtimeReadableCount = enrichedSkills.filter((s) => s.loadedInRuntime).length;

  return {
    schemaVersion: registry.schemaVersion,
    projectName: registry.projectName,
    updatedAt: registry.updatedAt,
    summary: {
      total: enrichedSkills.length,
      masterCount: enrichedSkills.filter((s) => s.tier === 'master').length,
      companionCount: enrichedSkills.filter((s) => s.tier === 'companion').length,
      projectCount: enrichedSkills.filter((s) => s.tier === 'project').length,
      enabledCount,
      disabledCount: enrichedSkills.length - enabledCount,
      runtimeReadableCount,
      categoriesCount: registry.categories.length
    },
    categories: registry.categories,
    skills: enrichedSkills
  };
}

export async function toggleSkillEnabled(
  workspaceRoot: string,
  skillId: string,
  enabled: boolean
): Promise<{ skill: SkillRuntimeStatusItem; snapshot: SkillsRegistrySnapshot }> {
  if (!/^[a-z0-9-]+$/.test(skillId)) {
    throw new Error('Identifiant de compétence invalide.');
  }

  let updatedSkillId = '';
  const task = writeMutex.then(async () => {
    const filePath = getRegistryFilePath(workspaceRoot);
    const registry = readValidatedRegistry(workspaceRoot);
    const targetIdx = registry.skills.findIndex((s) => s.id === skillId);
    if (targetIdx === -1) {
      const notFoundErr = new Error(`Compétence introuvable : ${skillId}`);
      (notFoundErr as Error & { statusCode?: number }).statusCode = 404;
      throw notFoundErr;
    }

    registry.skills[targetIdx] = {
      ...registry.skills[targetIdx],
      enabled: Boolean(enabled)
    };
    registry.updatedAt = new Date().toISOString();
    updatedSkillId = registry.skills[targetIdx].id;

    const tempPath = `${filePath}.tmp`;
    await fs.promises.writeFile(tempPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf-8');
    await fs.promises.rename(tempPath, filePath);
  });

  writeMutex = task.catch(() => undefined);
  await task;

  const snapshot = getRegistrySnapshot(workspaceRoot);
  const skill = snapshot.skills.find((s) => s.id === updatedSkillId);
  if (!skill) {
    throw new Error('Compétence mise à jour introuvable dans le registre.');
  }
  return { skill, snapshot };
}

export function selectAndLoadSkillsForTask(
  workspaceRoot: string,
  taskDescription: string,
  options: { maxResults?: number; agentContextMarkdownById?: Record<string, string> } = {}
): {
  selection: SkillSelectionResult;
  context: AgentWorkingContext;
} {
  const registry = readValidatedRegistry(workspaceRoot);
  const selection = selectRelevantSkills(taskDescription, registry.skills, {
    maxResults: options.maxResults
  });
  const context = loadSkillInstructionsIntoContext(taskDescription, selection.selected, {
    workspaceRoot,
    agentContextMarkdownById: options.agentContextMarkdownById
  });
  return { selection, context };
}

export function getSkillInstructionsDetails(
  workspaceRoot: string,
  skillId: string
):
  | {
      found: false;
    }
  | {
      found: true;
      skill: SkillRuntimeStatusItem;
      availableInRuntime: boolean;
      loadStatus: 'loaded' | 'not_loaded_in_runtime' | 'read_error';
      frontmatterName?: string;
      markdown?: string;
      body?: string;
      bytes: number;
      sha256?: string;
      reason: string;
    } {
  if (!/^[a-z0-9-]+$/.test(skillId)) {
    return { found: false };
  }
  const snapshot = getRegistrySnapshot(workspaceRoot);
  const skill = snapshot.skills.find((s) => s.id === skillId);
  if (!skill) {
    return { found: false };
  }

  if (skill.runtimeReadable && skill.source === 'workspace') {
    const readRes = readWorkspaceSkillMarkdown(workspaceRoot, skill);
    if (readRes.ok === true) {
      const parsed = stripFrontmatter(readRes.markdown);
      return {
        found: true,
        skill,
        availableInRuntime: true,
        loadStatus: 'loaded',
        frontmatterName: parsed.frontmatterName,
        markdown: readRes.markdown,
        body: parsed.body,
        bytes: readRes.bytes,
        sha256: readRes.sha256,
        reason: `Instructions lues directement depuis ${skill.skillFilePath}`
      };
    }
    return {
      found: true,
      skill,
      availableInRuntime: false,
      loadStatus: 'read_error',
      bytes: 0,
      reason: readRes.error
    };
  }

  return {
    found: true,
    skill,
    availableInRuntime: false,
    loadStatus: 'not_loaded_in_runtime',
    bytes: 0,
    reason: `Le fichier ${skill.skillFilePath} est géré par le harnais agent AI Studio. Le serveur ne simule pas son contenu.`
  };
}
