import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  validateSkillRegistry,
  selectRelevantSkills,
  loadSkillInstructionsIntoContext,
  resolveSafeWorkspaceSkillPath,
  readWorkspaceSkillMarkdown,
  stripFrontmatter
} from '../skills/skillEngine.ts';
import {
  getRegistrySnapshot,
  toggleSkillEnabled,
  bulkToggleSkillsEnabled,
  buildGlobalAgentContext,
  selectAndLoadSkillsForTask,
  getSkillInstructionsDetails
} from '../skills/skillsStore.ts';
import { computeMasterSkillProgress } from '../src/utils/masterSkillProgress.ts';
import type { UserProfile } from '../src/firebase/types.ts';

const WORKSPACE_ROOT = process.cwd();

describe('20 AI Studio Master Skills Registry (skills/index.json)', () => {
  it('indexes all 20 uploaded SKILL_*.md files across 6 categories and preserves exact frontmatter identity', () => {
    const raw = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'skills', 'index.json'), 'utf-8'));
    const registry = validateSkillRegistry(raw);

    assert.equal(registry.categories.length, 6);
    assert.equal(registry.generatedFrom.masterSkillsScanned, 20);
    assert.equal(registry.generatedFrom.totalSkillsScanned, 20);
    assert.equal(registry.skills.length, 20);

    // Every single SKILL_*.md file in public/assets/aistudio/ must be indexed
    const diskSkillFiles = fs
      .readdirSync(path.join(WORKSPACE_ROOT, 'public', 'assets', 'aistudio'))
      .filter((f) => f.startsWith('SKILL_') && f.endsWith('.md'))
      .sort();
    assert.equal(diskSkillFiles.length, 20);

    const indexedPaths = registry.skills.map((s) => s.skillFilePath).sort();
    const expectedPaths = diskSkillFiles.map((f) => `public/assets/aistudio/${f}`).sort();
    assert.deepEqual(indexedPaths, expectedPaths);

    for (const skill of registry.skills) {
      assert.equal(skill.tier, 'master');
      assert.equal(skill.source, 'workspace');
      assert.equal(skill.runtimeReadable, true);

      const readRes = readWorkspaceSkillMarkdown(WORKSPACE_ROOT, skill);
      assert.equal(readRes.ok, true, `Expected readable SKILL.md for ${skill.id}`);
      if (readRes.ok) {
        const parsed = stripFrontmatter(readRes.markdown);
        assert.equal(parsed.frontmatterName, skill.name);
        assert.ok(parsed.body.length > 40, `Expected non-empty instructions body for ${skill.id}`);
      }
    }
  });
});

describe('Task-Based Skill Selection Engine', () => {
  const snapshot = getRegistrySnapshot(WORKSPACE_ROOT);

  it('selects animation-motion, ui-ux-premium, accessibility-i18n, and frontend-development for Framer Motion + WCAG tasks', () => {
    const res = selectRelevantSkills(
      'Ajouter des animations Framer Motion avec prefers-reduced-motion, design system React et accessibilité WCAG clavier',
      snapshot.skills
    );
    const ids = res.selected.map((m) => m.skill.id);
    assert.ok(ids.includes('animation-motion'));
    assert.ok(ids.includes('accessibility-i18n'));
    assert.ok(ids.includes('ui-ux-premium'));
    assert.ok(ids.includes('frontend-development'));
  });

  it('selects backend-architecture, security-audit, database-engineering, and qa-testing for secure API + DB tasks', () => {
    const res = selectRelevantSkills(
      'Créer un endpoint API Express sécurisé avec validation serveur, base Firestore et tests de non-régression',
      snapshot.skills
    );
    const ids = res.selected.map((m) => m.skill.id);
    assert.ok(ids.includes('backend-architecture'));
    assert.ok(ids.includes('security-audit'));
    assert.ok(ids.includes('database-engineering'));
    assert.ok(ids.includes('qa-testing'));
  });

  it('selects ai-agent-development, audio-music-intelligence, and data-analytics for relevant domain tasks', () => {
    const tutorRes = selectRelevantSkills(
      'Concevoir un agent IA tuteur avec transcription audio et prononciation',
      snapshot.skills
    );
    const tutorIds = tutorRes.selected.map((m) => m.skill.id);
    assert.ok(tutorIds.includes('ai-agent-development'));
    assert.ok(tutorIds.includes('audio-music-intelligence'));

    const datavizRes = selectRelevantSkills(
      'Analyser les données de progression avec visualisations D3 interactives et métriques',
      snapshot.skills
    );
    assert.ok(datavizRes.selected.some((m) => m.skill.id === 'data-analytics'));
  });

  it('enforces anti-triggers and never selects disabled skills', () => {
    const noAnimRes = selectRelevantSkills('Composant React sans animation avec transition css', snapshot.skills);
    assert.ok(!noAnimRes.selected.some((m) => m.skill.id === 'animation-motion'));
    assert.ok(noAnimRes.excluded.some((e) => e.id === 'animation-motion' && e.reason === 'anti_trigger'));

    const modifiedSkills = snapshot.skills.map((s) =>
      s.id === 'ui-ux-premium' ? { ...s, enabled: false } : s
    );
    const disabledRes = selectRelevantSkills('Améliorer design system et interface responsive', modifiedSkills);
    assert.ok(!disabledRes.selected.some((m) => m.skill.id === 'ui-ux-premium'));
    assert.ok(disabledRes.excluded.some((e) => e.id === 'ui-ux-premium' && e.reason === 'disabled'));
  });
});

describe('Real Instruction Context Loader (Zero Simulation Guarantee)', () => {
  it('loads real markdown instructions from all matched workspace SKILL_*.md files', () => {
    const result = selectAndLoadSkillsForTask(
      WORKSPACE_ROOT,
      'Créer une interface React accessible avec sécurité serveur Express et tests QA'
    );

    assert.equal(result.context.hasSimulatedSkills, false);
    assert.ok(result.context.loadedSkills.length >= 3);

    for (const loaded of result.context.loadedSkills) {
      assert.equal(loaded.loadStatus, 'loaded');
      assert.ok((loaded.instructionsMarkdown || '').length > 40);
      assert.ok(loaded.sha256 && loaded.sha256.length === 64);
      assert.ok(result.context.assembledSystemContext.includes(`### [SKILL: ${loaded.name}]`));
    }
  });

  it('never loads or simulates disabled or missing skills even if forced into loadSkillInstructionsIntoContext', () => {
    const snapshot = getRegistrySnapshot(WORKSPACE_ROOT);
    const disabledUi = { ...snapshot.skills.find((s) => s.id === 'ui-ux-premium')!, enabled: false };
    const missingDiskSkill = {
      ...snapshot.skills.find((s) => s.id === 'flutter-mobile')!,
      skillFilePath: 'public/assets/aistudio/DOES_NOT_EXIST.md'
    };

    const ctx = loadSkillInstructionsIntoContext(
      'Test non-simulation',
      [
        { skill: disabledUi, score: 90, matchedTriggers: ['ui'], reason: 'test' },
        { skill: missingDiskSkill, score: 85, matchedTriggers: ['flutter'], reason: 'test' }
      ],
      { workspaceRoot: WORKSPACE_ROOT }
    );

    assert.equal(ctx.hasSimulatedSkills, false);
    assert.equal(ctx.loadedSkills.length, 0);
    assert.equal(ctx.unloadedSkills.length, 2);
    assert.equal(ctx.unloadedSkills[0].loadStatus, 'not_loaded_in_runtime');
    assert.equal(ctx.unloadedSkills[1].loadStatus, 'read_error');
    assert.equal(ctx.assembledSystemContext, '');
  });

  it('prevents path traversal outside workspace root', () => {
    assert.throws(() => resolveSafeWorkspaceSkillPath(WORKSPACE_ROOT, '../../etc/passwd'));
  });
});

describe('Persistent Skill Toggle & Instructions Store', () => {
  it('toggles enabled status atomically on disk across any of the 20 Master Skills without altering original SKILL_*.md files', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eb-skills-20-test-'));
    try {
      fs.mkdirSync(path.join(tempDir, 'skills'), { recursive: true });
      fs.mkdirSync(path.join(tempDir, 'public', 'assets', 'aistudio'), { recursive: true });

      fs.copyFileSync(
        path.join(WORKSPACE_ROOT, 'skills', 'index.json'),
        path.join(tempDir, 'skills', 'index.json')
      );
      for (const file of fs.readdirSync(path.join(WORKSPACE_ROOT, 'public', 'assets', 'aistudio'))) {
        if (file.startsWith('SKILL_') && file.endsWith('.md')) {
          fs.copyFileSync(
            path.join(WORKSPACE_ROOT, 'public', 'assets', 'aistudio', file),
            path.join(tempDir, 'public', 'assets', 'aistudio', file)
          );
        }
      }

      const initialSnap = getRegistrySnapshot(tempDir);
      assert.equal(initialSnap.summary.total, 20);
      assert.equal(initialSnap.summary.enabledCount, 20);
      assert.equal(initialSnap.summary.runtimeReadableCount, 20);

      const originalMd = fs.readFileSync(
        path.join(tempDir, 'public', 'assets', 'aistudio', 'SKILL_2b40c9f0.md'),
        'utf-8'
      );

      const disabledRes = await toggleSkillEnabled(tempDir, 'animation-motion', false);
      assert.equal(disabledRes.skill.enabled, false);
      assert.equal(disabledRes.skill.loadedInRuntime, false);
      assert.equal(disabledRes.snapshot.summary.enabledCount, 19);
      assert.equal(disabledRes.snapshot.summary.disabledCount, 1);
      assert.equal(disabledRes.snapshot.summary.runtimeReadableCount, 19);

      // Verify disabled skill is excluded from task selection and not loaded
      const selDisabled = selectAndLoadSkillsForTask(tempDir, 'Ajouter des animations Framer Motion');
      assert.ok(selDisabled.selection.excluded.some((e) => e.id === 'animation-motion' && e.reason === 'disabled'));
      assert.ok(!selDisabled.context.loadedSkills.some((s) => s.skillId === 'animation-motion'));

      const reEnabledRes = await toggleSkillEnabled(tempDir, 'animation-motion', true);
      assert.equal(reEnabledRes.skill.enabled, true);
      assert.equal(reEnabledRes.skill.loadedInRuntime, true);
      assert.equal(reEnabledRes.snapshot.summary.enabledCount, 20);
      assert.equal(reEnabledRes.snapshot.summary.runtimeReadableCount, 20);

      // Original SKILL_*.md must remain byte-for-byte untouched
      const afterMd = fs.readFileSync(
        path.join(tempDir, 'public', 'assets', 'aistudio', 'SKILL_2b40c9f0.md'),
        'utf-8'
      );
      assert.equal(afterMd, originalMd);

      const details = getSkillInstructionsDetails(tempDir, 'security-audit');
      assert.equal(details.found, true);
      if (details.found) {
        assert.equal(details.availableInRuntime, true);
        assert.equal(details.loadStatus, 'loaded');
        assert.ok((details.markdown || '').includes('security-audit'));
      }

      await assert.rejects(() => toggleSkillEnabled(tempDir, '../bad', false));
      await assert.rejects(() => toggleSkillEnabled(tempDir, 'non-existent-skill', false));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('builds and updates the global agent context strictly from enabled skills in skills/index.json', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eb-global-ctx-test-'));
    try {
      fs.mkdirSync(path.join(tempDir, 'skills'), { recursive: true });
      fs.mkdirSync(path.join(tempDir, 'public', 'assets', 'aistudio'), { recursive: true });

      fs.copyFileSync(
        path.join(WORKSPACE_ROOT, 'skills', 'index.json'),
        path.join(tempDir, 'skills', 'index.json')
      );
      for (const file of fs.readdirSync(path.join(WORKSPACE_ROOT, 'public', 'assets', 'aistudio'))) {
        if (file.startsWith('SKILL_') && file.endsWith('.md')) {
          fs.copyFileSync(
            path.join(WORKSPACE_ROOT, 'public', 'assets', 'aistudio', file),
            path.join(tempDir, 'public', 'assets', 'aistudio', file)
          );
        }
      }

      const initialGlobal = buildGlobalAgentContext(tempDir);
      assert.equal(initialGlobal.totalSkills, 20);
      assert.equal(initialGlobal.enabledCount, 20);
      assert.equal(initialGlobal.loadedCount, 20);
      assert.equal(initialGlobal.hasSimulatedSkills, false);
      assert.ok(initialGlobal.totalBytes > 0);
      assert.ok(initialGlobal.context.assembledSystemContext.includes('### [SKILL: ui-ux-premium]'));

      // Uncheck one skill -> must be excluded from global agent context
      await toggleSkillEnabled(tempDir, 'ui-ux-premium', false);
      const afterUncheck = buildGlobalAgentContext(tempDir);
      assert.equal(afterUncheck.enabledCount, 19);
      assert.equal(afterUncheck.loadedCount, 19);
      assert.ok(afterUncheck.disabledSkillIds.includes('ui-ux-premium'));
      assert.ok(!afterUncheck.activeSkillIds.includes('ui-ux-premium'));
      assert.ok(!afterUncheck.context.assembledSystemContext.includes('### [SKILL: ui-ux-premium]'));

      // Bulk disable 2 more skills, then bulk enable all
      const bulkOff = await bulkToggleSkillsEnabled(tempDir, false, ['security-audit', 'data-analytics']);
      assert.equal(bulkOff.globalContext.enabledCount, 17);
      assert.equal(bulkOff.globalContext.loadedCount, 17);

      const bulkOn = await bulkToggleSkillsEnabled(tempDir, true);
      assert.equal(bulkOn.globalContext.enabledCount, 20);
      assert.equal(bulkOn.globalContext.loadedCount, 20);
      assert.ok(bulkOn.globalContext.context.assembledSystemContext.includes('### [SKILL: ui-ux-premium]'));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('Master Skill Mastery & Activity Progress Calculation', () => {
  it('computes bounded progress percentages for active skills based on user mastery/activity and returns inactive for disabled skills', () => {
    const baseUser = {
      uid: 'test-user',
      displayName: 'Test',
      email: 'test@example.com',
      level: 'B2',
      heroImageURL: '',
      stats: {
        streakDays: 5,
        totalXp: 3200,
        weeklyXp: 1200,
        completedModules: 18,
        totalModules: 24,
        masteryPercentage: 84,
        studyMinutesToday: 27,
        studyMinutesTarget: 30,
        totalImmersionMinutes: 640,
        lastActiveDate: '2026-11-27'
      }
    } as UserProfile;

    const lowUser = {
      ...baseUser,
      stats: {
        ...baseUser.stats,
        streakDays: 1,
        weeklyXp: 150,
        completedModules: 3,
        totalModules: 24,
        masteryPercentage: 28,
        studyMinutesToday: 5,
        studyMinutesTarget: 30
      }
    } as UserProfile;

    const activeUi = computeMasterSkillProgress(
      { id: 'ui-ux-premium', category: 'ui-ux-design', priority: 96, enabled: true },
      baseUser,
      88
    );
    assert.equal(activeUi.isActive, true);
    assert.ok(activeUi.percentage >= 70 && activeUi.percentage <= 100);

    const lowFrontend = computeMasterSkillProgress(
      { id: 'frontend-development', category: 'frontend-mobile', priority: 97, enabled: true },
      lowUser,
      40
    );
    assert.equal(lowFrontend.isActive, true);
    assert.ok(lowFrontend.percentage < activeUi.percentage);
    assert.ok(lowFrontend.percentage >= 0 && lowFrontend.percentage <= 100);

    const disabledSkill = computeMasterSkillProgress(
      { id: 'ui-ux-premium', category: 'ui-ux-design', priority: 96, enabled: false },
      baseUser,
      88
    );
    assert.equal(disabledSkill.isActive, false);
    assert.equal(disabledSkill.percentage, 0);
  });
});
