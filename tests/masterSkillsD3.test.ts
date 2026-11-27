import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  computeMasterSkillProgress,
  computeIndividualSkillAnalytics,
  computePearsonCorrelation,
  computeSkillMasteryCorrelationSnapshot,
  type SkillHistoryPointInput
} from '../src/utils/masterSkillProgress.ts';
import type { UserProfile } from '../src/firebase/types.ts';

const WORKSPACE_ROOT = process.cwd();

const mockUser = {
  uid: 'user-d3-test',
  email: 'claudepierremonet@gmail.com',
  displayName: 'Claude Monet',
  level: 'B2',
  heroImageURL: '',
  stats: {
    totalXp: 4200,
    weeklyXp: 1120,
    streakDays: 6,
    studyMinutesToday: 27,
    studyMinutesTarget: 30,
    completedModules: 16,
    totalModules: 20,
    masteryPercentage: 84,
    totalImmersionMinutes: 640,
    lastActiveDate: '2026-11-27'
  },
  adaptiveProfile: {
    schoolGrade: 'terminale',
    assessedCefrLevel: 'B2',
    overallReadiness: 84,
    weakestSkills: ['writing'],
    strongestSkills: ['reading', 'vocabulary'],
    recommendedLessonIds: [],
    dueVocabularyCount: 4,
    updatedAt: '2026-11-27T06:00:00Z',
    skills: {
      reading: { skill: 'reading', score: 88, attemptsCount: 12, trend: 'up' },
      vocabulary: { skill: 'vocabulary', score: 86, attemptsCount: 15, trend: 'up' },
      grammar: { skill: 'grammar', score: 80, attemptsCount: 10, trend: 'stable' },
      writing: { skill: 'writing', score: 78, attemptsCount: 7, trend: 'needs_focus' },
      listening: { skill: 'listening', score: 85, attemptsCount: 11, trend: 'up' },
      speaking: { skill: 'speaking', score: 82, attemptsCount: 9, trend: 'stable' },
      pronunciation: { skill: 'pronunciation', score: 81, attemptsCount: 8, trend: 'stable' }
    }
  }
} as UserProfile;

describe('Individual Master Skill D3 Analytics Engine', () => {
  it('anchors terminal 7-day point strictly to computeMasterSkillProgress and computes weighted factors summing to 100%', () => {
    const categories = [
      'ui-ux-design',
      'frontend-mobile',
      'backend-data',
      'ai-media',
      'quality-security',
      'product-devops'
    ];

    for (const category of categories) {
      const skill = {
        id: `test-${category}`,
        category,
        priority: 92,
        enabled: true
      };

      const progress = computeMasterSkillProgress(skill, mockUser, 89);
      const analytics = computeIndividualSkillAnalytics(skill, mockUser, 89);

      assert.equal(analytics.isActive, true);
      assert.equal(analytics.series.length, 7);
      assert.equal(analytics.currentPercentage, progress.percentage);
      assert.equal(analytics.series[6].percentage, progress.percentage);
      assert.equal(analytics.tierLabel, progress.tierLabel);
      assert.equal(analytics.dataProvenance, 'baseline');
      assert.ok(analytics.peakPercentage >= analytics.currentPercentage);
      assert.equal(
        analytics.delta7d,
        analytics.series[6].percentage - analytics.series[0].percentage
      );

      for (const pt of analytics.series) {
        assert.ok(pt.percentage >= 0 && pt.percentage <= 100);
      }

      assert.equal(analytics.factors.length, 3);
      const totalWeight = analytics.factors.reduce((sum, f) => sum + f.weightPct, 0);
      assert.equal(totalWeight, 100);
    }
  });

  it('produces zeroed inactive series and paused provenance note when a skill is disabled', () => {
    const disabledSkill = {
      id: 'data-analytics',
      category: 'backend-data',
      priority: 90,
      enabled: false
    };

    const analytics = computeIndividualSkillAnalytics(disabledSkill, mockUser, 89);

    assert.equal(analytics.isActive, false);
    assert.equal(analytics.currentPercentage, 0);
    assert.equal(analytics.delta7d, 0);
    assert.equal(analytics.peakPercentage, 0);
    assert.ok(analytics.provenanceNote.toLowerCase().includes('désactivée'));
    assert.equal(analytics.series.length, 7);
    assert.ok(analytics.series.every((p) => p.percentage === 0 && p.deltaFromPrev === 0));
  });

  it('tracks firestore and indexeddb provenance explicitly when external 7-day history points are passed', () => {
    const skill = {
      id: 'audio-music-intelligence',
      category: 'ai-media',
      priority: 95,
      enabled: true
    };

    const firestoreHistory: SkillHistoryPointInput[] = [
      { day: 'Lun', score: 74, source: 'firestore' },
      { day: 'Mar', score: 78, source: 'firestore' },
      { day: 'Mer', score: 80, source: 'firestore' },
      { day: 'Jeu', score: 83, source: 'firestore' },
      { day: 'Ven', score: 86, source: 'firestore' },
      { day: 'Sam', score: 88, source: 'firestore' },
      { day: 'Dim', score: 91, source: 'firestore' }
    ];

    const fsAnalytics = computeIndividualSkillAnalytics(skill, mockUser, 89, firestoreHistory);
    assert.equal(fsAnalytics.dataProvenance, 'firestore');
    assert.ok(fsAnalytics.provenanceNote.includes('Firestore'));
    assert.deepEqual(
      fsAnalytics.series.map((p) => p.dayLabel),
      ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    );

    const idbHistory: SkillHistoryPointInput[] = firestoreHistory.map((p) => ({
      ...p,
      source: 'indexeddb'
    }));
    const idbAnalytics = computeIndividualSkillAnalytics(skill, mockUser, 89, idbHistory);
    assert.equal(idbAnalytics.dataProvenance, 'indexeddb');
    assert.ok(idbAnalytics.provenanceNote.includes('IndexedDB'));
  });
});

describe('D3 Master Skills UI Wiring Verification', () => {
  it('uses genuine D3 scales, generators, and pointer APIs in MasterSkillD3Charts.tsx and wires them in MasterSkillsView.tsx', () => {
    const d3File = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'MasterSkillD3Charts.tsx'),
      'utf-8'
    );
    const viewFile = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'MasterSkillsView.tsx'),
      'utf-8'
    );
    const dashboardFile = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'DashboardView.tsx'),
      'utf-8'
    );

    assert.ok(d3File.includes("import * as d3 from 'd3';"));
    assert.ok(/d3\s*\.\s*scaleLinear/.test(d3File));
    assert.ok(/d3\s*\.\s*scalePoint/.test(d3File));
    assert.ok(/d3\s*\.\s*scaleBand/.test(d3File));
    assert.ok(d3File.includes('d3.curveMonotoneX'));
    assert.ok(d3File.includes('d3.pointer'));

    assert.ok(d3File.includes('export const SkillSparklineD3'));
    assert.ok(d3File.includes('export const SkillIndividualDetailD3Chart'));
    assert.ok(d3File.includes('export const MasterSkillsD3OverviewPanel'));

    assert.ok(viewFile.includes('MasterSkillsD3OverviewPanel'));
    assert.ok(viewFile.includes('SkillSparklineD3'));
    assert.ok(viewFile.includes('SkillIndividualDetailD3Chart'));
    assert.ok(viewFile.includes('computeIndividualSkillAnalytics'));

    assert.ok(dashboardFile.includes('<MasterSkillsView user={user} avgScore={avgScore} scoreData={scoreData} />'));
  });

  it('computes Pearson correlation and 20-skill radial snapshot accurately and mounts SkillAnalyticsRadialD3 in DashboardView', () => {
    assert.equal(computePearsonCorrelation([10, 20, 30, 40, 50], [20, 40, 60, 80, 100]), 1);
    assert.equal(computePearsonCorrelation([50, 40, 30, 20, 10], [10, 20, 30, 40, 50]), -1);
    assert.equal(computePearsonCorrelation([50, 50, 50, 50], [10, 20, 30, 40]), 0);

    const rawRegistry = JSON.parse(
      fs.readFileSync(path.join(WORKSPACE_ROOT, 'skills', 'index.json'), 'utf-8')
    );
    const all20 = rawRegistry.skills.map((s: any, idx: number) => ({
      id: s.id,
      title: s.title,
      name: s.name,
      category: s.category,
      priority: s.priority,
      enabled: idx < 18
    }));

    const summary = computeSkillMasteryCorrelationSnapshot(all20, mockUser, 89);
    assert.equal(summary.totalCount, 20);
    assert.equal(summary.activeCount, 18);
    assert.equal(summary.globalMasteryPct, 84);
    assert.equal(summary.nodes.length, 20);
    assert.equal(summary.globalTrajectory.length, 7);
    assert.equal(summary.globalTrajectory[6], 84);

    const activeWeights = summary.nodes
      .filter((n) => n.isActive)
      .reduce((acc, n) => acc + n.weightInfluencePct, 0);
    assert.ok(activeWeights >= 98 && activeWeights <= 102);

    for (const node of summary.nodes) {
      if (node.isActive) {
        assert.ok(node.pearsonR >= -1 && node.pearsonR <= 1);
      } else {
        assert.equal(node.correlationBand, 'inactive');
        assert.equal(node.skillPercentage, 0);
        assert.equal(node.weightInfluencePct, 0);
      }
    }

    const radialFile = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'SkillAnalyticsRadialD3.tsx'),
      'utf-8'
    );
    const dashboardFile = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'DashboardView.tsx'),
      'utf-8'
    );

    assert.ok(radialFile.includes("import * as d3 from 'd3';"));
    assert.ok(/d3\s*\.\s*scaleRadial/.test(radialFile));
    assert.ok(/d3\s*\.\s*arc/.test(radialFile));
    assert.ok(/d3\s*\.\s*lineRadial/.test(radialFile));
    assert.ok(radialFile.includes('computeSkillMasteryCorrelationSnapshot'));

    assert.ok(dashboardFile.includes('SkillAnalyticsRadialD3'));
    assert.ok(dashboardFile.includes("'skill-analytics'"));
    assert.ok(dashboardFile.includes("label: 'Skill Analytics'"));
  });
});

