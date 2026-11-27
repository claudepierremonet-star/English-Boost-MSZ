import React, { useState, useEffect, useMemo } from 'react';
import type {
  UserProfile,
  LearningAttempt,
  FlashcardProgress,
  SkillKey
} from '../firebase/types';
import {
  getUserLearningAttempts,
  getStoredFlashcardProgressList
} from '../firebase/client';
import {
  ALL_SKILL_KEYS,
  SKILL_META,
  evaluateAdaptiveLearning
} from '../services/adaptiveEngine';
import { getCityMapProgression } from '../utils/cityMapManager';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';

interface LinguisticRadarSectionProps {
  user: UserProfile;
  onLaunchSkillModule?: (
    action:
      | 'flashcards'
      | 'grammar_battle'
      | 'listening_cinema'
      | 'escape_room'
      | 'tutor'
      | 'speaking'
      | 'dialogues'
  ) => void;
}

export const LinguisticRadarSection: React.FC<LinguisticRadarSectionProps> = ({
  user,
  onLaunchSkillModule
}) => {
  const [attempts, setAttempts] = useState<LearningAttempt[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardProgress[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillKey | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [{ attempts: atts }, cards] = await Promise.all([
          getUserLearningAttempts(user.uid, 120),
          getStoredFlashcardProgressList()
        ]);
        if (mounted) {
          setAttempts(atts);
          setFlashcards(cards);
        }
      } catch {
        // ignore
      }
    }
    load();
    const onRefresh = () => load();
    window.addEventListener('eb_attempts_updated', onRefresh);
    return () => {
      mounted = false;
      window.removeEventListener('eb_attempts_updated', onRefresh);
    };
  }, [user.uid, user.stats?.totalXp, user.stats?.completedModules]);

  const assessment = useMemo(() => {
    return evaluateAdaptiveLearning(user, attempts, flashcards, getCityMapProgression());
  }, [user, attempts, flashcards]);

  const radarData = useMemo(() => {
    return ALL_SKILL_KEYS.map((key) => {
      const evalObj = assessment.profile.skills[key];
      const meta = SKILL_META[key];
      return {
        skillKey: key,
        subject: meta.labelFr.replace('Compréhension ', 'Compr. ').replace('Expression ', 'Expr. '),
        fullName: meta.labelFr,
        score: evalObj.score,
        fullMark: 100
      };
    });
  }, [assessment]);

  const weakestKey = assessment.profile.weakestSkills[0];
  const activeKey = selectedSkill || weakestKey;
  const activeMeta = SKILL_META[activeKey];
  const activeEval = assessment.profile.skills[activeKey];

  return (
    <div className="p-5 rounded-2xl luxury-card-surface flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl luxury-btn-amber-soft flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">radar</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#f2ca50] font-bold uppercase tracking-wider font-mono">
                MOTEUR ADAPTATIF • 7 COMPÉTENCES
              </span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className="text-[10px] font-mono text-[#d4c78f] font-bold">
                {assessment.gradeMeta.shortLabel}
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-[#f3f4f6]">
              Radar Adaptatif Multi-Compétences
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl luxury-hairline-panel">
          <span className="text-[10px] uppercase font-mono text-[#cbd5e1]">Préparation</span>
          <span className="text-xs font-mono font-bold text-[#f2ca50] tabular-nums">
            {assessment.profile.overallReadiness}%
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded luxury-btn-amber-soft font-bold uppercase">
            {assessment.profile.assessedCefrLevel}
          </span>
        </div>
      </div>

      {/* 7-Axis Radar Chart + Breakdown Grid */}
      <div className="flex flex-col lg:flex-row items-center gap-5">
        <div className="w-full max-w-[340px] h-[270px] bg-[#0d1424]/70 rounded-2xl border border-[#2a364f]/60 p-2 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070e1d',
                  borderColor: 'rgba(242, 202, 80, 0.5)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#dce2f8'
                }}
              />
              <Radar
                name="Maîtrise"
                dataKey="score"
                stroke="#f2ca50"
                strokeWidth={2.2}
                fill="#f2ca50"
                fillOpacity={0.28}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 7 Skill Bars */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_SKILL_KEYS.map((key) => {
            const evalItem = assessment.profile.skills[key];
            const meta = SKILL_META[key];
            const isSelected = activeKey === key;
            const isPriority = assessment.profile.weakestSkills.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedSkill(key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-[#1e273a] border-[#f2ca50]'
                    : 'bg-[#121927]/90 border-[#2b354b]/60 hover:border-[#4d5b7a]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50] shrink-0">
                      {meta.icon}
                    </span>
                    <span className="text-xs font-bold text-[#e2e8f0] truncate">{meta.labelFr}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isPriority && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                        Priorité
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-[#f2ca50] tabular-nums">
                      {evalItem.score}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#070e1d] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      evalItem.score >= 78
                        ? 'bg-emerald-400'
                        : evalItem.score >= 60
                        ? 'bg-[#f2ca50]'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${evalItem.score}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personalized Path Prescription */}
      <div className="p-3.5 rounded-xl luxury-hairline-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-xs text-[#cbd5e1] leading-relaxed">
          <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0 mt-0.5">
            auto_awesome
          </span>
          <div>
            <strong className="text-[#f2ca50]">Parcours Recommandé ({activeMeta.labelFr} · {activeEval.score}%) : </strong>
            Renforcez cette compétence avec <strong>{activeMeta.recommendedModuleLabel}</strong> calibré pour votre classe de {assessment.gradeMeta.shortLabel} ({assessment.profile.assessedCefrLevel}).
          </div>
        </div>
        {onLaunchSkillModule && (
          <button
            type="button"
            onClick={() => onLaunchSkillModule(activeMeta.recommendedAction)}
            className="px-3.5 py-2 rounded-xl luxury-btn-gold font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
          >
            Lancer {activeMeta.recommendedModuleLabel}
          </button>
        )}
      </div>
    </div>
  );
};
