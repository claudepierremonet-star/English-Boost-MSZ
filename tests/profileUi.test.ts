import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { computeUserBadges } from '../src/data/badges.ts';
import { evaluateAdaptiveLearning } from '../src/services/adaptiveEngine.ts';
import { selectAndLoadSkillsForTask } from '../skills/skillsStore.ts';
import type { UserProfile } from '../src/firebase/types.ts';

const WORKSPACE_ROOT = process.cwd();

describe('Profile UI/UX, Defensive Resilience & Code-Splitting Regression Suite', () => {
  it('computes badges and adaptive learning safely when user.stats is missing or partial', () => {
    const partialUser = {
      uid: 'partial_scholar_test',
      displayName: 'Test Scholar',
      email: 'scholar@example.com',
      level: 'B2',
      heroImageURL: ''
    } as unknown as UserProfile;

    const badges = computeUserBadges(partialUser, []);
    assert.ok(Array.isArray(badges) && badges.length > 0);
    for (const badge of badges) {
      assert.equal(typeof badge.isUnlocked, 'boolean');
      assert.ok(Number.isFinite(badge.currentProgress));
    }

    const assessment = evaluateAdaptiveLearning(partialUser, [], []);
    assert.ok(assessment.profile.overallReadiness >= 0 && assessment.profile.overallReadiness <= 100);
    assert.ok(assessment.multiSignal.compositeCefr);
  });

  it('prevents the CSS transform containing-block zero-height trap on the Profil tab', () => {
    const appSource = fs.readFileSync(path.join(WORKSPACE_ROOT, 'src', 'App.tsx'), 'utf-8');
    const profileSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'ProfileModal.tsx'),
      'utf-8'
    );

    // App.tsx must pass mode="page" on tab-profil and omit will-change-transform on tab-profil
    const profilTabMatch = appSource.match(/activeTab === 'profil'[\s\S]*?<ProfileModal[\s\S]*?\/>/);
    assert.ok(profilTabMatch, 'Expected activeTab === "profil" block with <ProfileModal />');
    assert.match(profilTabMatch[0], /mode="page"/);
    assert.doesNotMatch(profilTabMatch[0], /will-change-transform/);

    // App.tsx must lazy-load heavy secondary views & modals via React.lazy + Suspense
    assert.match(appSource, /const ProfileModal = lazy\(/);
    assert.match(appSource, /const DashboardView = lazy\(/);
    assert.match(appSource, /const MszShopModal = lazy\(/);
    assert.match(appSource, /<Suspense\s+fallback=/);

    // ProfileModal.tsx must render an in-flow section when mode === 'page' and dialog when modal
    assert.match(profileSource, /if\s*\(mode\s*===\s*'page'\)/);
    assert.match(profileSource, /role="dialog"/);
    assert.match(profileSource, /aria-modal="true"/);

    // Dynamic Firebase config wiring rather than stale hardcoded project string
    assert.match(profileSource, /firebaseAppletConfig/);
    assert.match(profileSource, /firestoreDatabaseId/);

    // Pass onBadgeClaimed to BadgesSection and guard nested modals on Escape
    assert.match(profileSource, /<BadgesSection\s+user=\{user\}\s+onBadgeClaimed=\{handleClaimReward\}/);
    assert.match(profileSource, /if\s*\(isErrorJournalOpen\s*\|\|\s*isVoiceStudioOpen\s*\|\|\s*isShopOpen\)/);

    // Avoid decorative attention-grabbing pulse/ping/bounce loops inside ProfileModal
    assert.doesNotMatch(profileSource, /animate-ping/);
    assert.doesNotMatch(profileSource, /animate-pulse/);
    assert.doesNotMatch(profileSource, /animate-bounce/);
  });

  it('dynamically selects and loads genuine SKILL_*.md instructions for UI/UX, Profile, Animation & Performance tasks', () => {
    const taskDescription =
      'Améliorer UI/UX premium du profil, corriger le bug page vide, accessibilité WCAG, animations Framer Motion et performance React.lazy';
    const { context } = selectAndLoadSkillsForTask(WORKSPACE_ROOT, taskDescription);

    assert.equal(context.hasSimulatedSkills, false);
    assert.ok(context.loadedSkills.length >= 4);

    const loadedIds = context.loadedSkills.map((s) => s.skillId);
    assert.ok(loadedIds.includes('ui-ux-premium'), 'Expected ui-ux-premium skill loaded');
    assert.ok(loadedIds.includes('performance-optimization'), 'Expected performance-optimization skill loaded');

    for (const inst of context.loadedSkills) {
      assert.equal(inst.loadStatus, 'loaded');
      assert.ok((inst.instructionsMarkdown || '').length > 50);
    }
  });
});
