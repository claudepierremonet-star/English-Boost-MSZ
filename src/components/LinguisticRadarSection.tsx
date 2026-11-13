import React, { useState } from 'react';
import { UserProfile, CEFRLevel } from '../firebase/types';

interface LinguisticRadarSectionProps {
  user: UserProfile;
}

interface SkillDimension {
  id: 'grammaire' | 'vocabulaire' | 'elocution' | 'ecoute';
  label: string;
  icon: string;
  score: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
  recommendation: string;
}

export const LinguisticRadarSection: React.FC<LinguisticRadarSectionProps> = ({ user }) => {
  const [activeDimension, setActiveDimension] = useState<string | null>(null);

  // CEFR baseline proficiency
  const cefrBaseMap: Record<CEFRLevel, number> = {
    A1: 42,
    A2: 54,
    B1: 68,
    B2: 80,
    C1: 90,
    C2: 96
  };
  const baseScore = cefrBaseMap[user.level] || 68;

  // Calcul dynamique et réaliste des 4 compétences linguistiques
  const grammarScore = Math.min(
    99,
    Math.max(
      32,
      Math.round(
        baseScore * 0.35 +
          (user.stats.masteryPercentage || 75) * 0.45 +
          Math.min(100, ((user.stats.completedModules || 0) / Math.max(1, user.stats.totalModules || 20)) * 100) * 0.20
      )
    )
  );

  const vocabScore = Math.min(
    99,
    Math.max(
      30,
      Math.round(
        baseScore * 0.30 +
          Math.min(100, ((user.stats.totalXp || 0) / 1200) * 100) * 0.35 +
          Math.min(100, (user.stats.completedModules || 0) * 6) * 0.35
      )
    )
  );

  const elocutionScore = Math.min(
    99,
    Math.max(
      30,
      Math.round(
        baseScore * 0.40 +
          Math.min(100, ((user.stats.studyMinutesToday || 0) / Math.max(1, user.stats.studyMinutesTarget || 15)) * 100) * 0.30 +
          Math.min(100, (user.stats.streakDays || 1) * 10) * 0.30
      )
    )
  );

  const listeningScore = Math.min(
    99,
    Math.max(
      30,
      Math.round(
        baseScore * 0.35 +
          Math.min(100, ((user.stats.totalImmersionMinutes || 0) / 45) * 100) * 0.35 +
          (user.stats.masteryPercentage || 75) * 0.30
      )
    )
  );

  const dimensions: SkillDimension[] = [
    {
      id: 'grammaire',
      label: 'Grammaire',
      icon: 'menu_book',
      score: grammarScore,
      color: '#f2ca50',
      badgeBg: 'bg-[#f2ca50]/15',
      badgeBorder: 'border-[#f2ca50]/40',
      description: 'Précision syntaxique, temps des verbes & accords',
      recommendation:
        grammarScore >= 80
          ? 'Structure solide, maîtrise des tournures complexes'
          : 'Consolidez les modaux et le present perfect'
    },
    {
      id: 'vocabulaire',
      label: 'Vocabulaire',
      icon: 'translate',
      score: vocabScore,
      color: '#38bdf8',
      badgeBg: 'bg-sky-500/15',
      badgeBorder: 'border-sky-500/40',
      description: 'Lexique académique, expressions idiomatiques & phrasal verbs',
      recommendation:
        vocabScore >= 80
          ? 'Richesse lexicale excellente, vocabulaire nuancé'
          : 'Activez plus de cartes mémoires dans le dictionnaire'
    },
    {
      id: 'ecoute',
      label: 'Écoute',
      icon: 'headphones',
      score: listeningScore,
      color: '#34d399',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/40',
      description: 'Compréhension auditive des accents natifs & dictées',
      recommendation:
        listeningScore >= 80
          ? 'Discrimination auditive fine et immédiate'
          : 'Poursuivez les séances de dictée et écoute active'
    },
    {
      id: 'elocution',
      label: 'Élocution',
      icon: 'mic',
      score: elocutionScore,
      color: '#fb923c',
      badgeBg: 'bg-amber-500/15',
      badgeBorder: 'border-amber-500/40',
      description: 'Fluidité orale, accent tonique & débit naturel',
      recommendation:
        elocutionScore >= 80
          ? 'Clarté phonétique et prosodie naturelle'
          : 'Répétez les phrases à voix haute dans le Studio Vocal'
    }
  ];

  const overallAvg = Math.round((grammarScore + vocabScore + elocutionScore + listeningScore) / 4);

  // SVG Radar Geometry (Center at 140, 140, radius 90)
  const cx = 140;
  const cy = 140;
  const maxR = 90;

  // Geometry points for each axis:
  // Top: Grammaire (0, -r)
  // Right: Vocabulaire (r, 0)
  // Bottom: Écoute (0, r)
  // Left: Élocution (-r, 0)
  const pGrammar = {
    x: cx,
    y: cy - (maxR * grammarScore) / 100
  };
  const pVocab = {
    x: cx + (maxR * vocabScore) / 100,
    y: cy
  };
  const pListening = {
    x: cx,
    y: cy + (maxR * listeningScore) / 100
  };
  const pElocution = {
    x: cx - (maxR * elocutionScore) / 100,
    y: cy
  };

  const polygonPath = `M ${pGrammar.x} ${pGrammar.y} L ${pVocab.x} ${pVocab.y} L ${pListening.x} ${pListening.y} L ${pElocution.x} ${pElocution.y} Z`;

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161d2d] via-[#111723] to-[#0a0f19] border border-[#f2ca50]/40 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/20 border border-[#f2ca50]/50 flex items-center justify-center text-[#f2ca50] shadow-inner shrink-0">
            <span className="material-symbols-outlined text-xl">radar</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#f2ca50] font-bold uppercase tracking-wider font-mono">
                DIAGNOSTIC PÉDAGOGIQUE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-pulse" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#f3f4f6]">
              Statistiques Avancées
            </h3>
          </div>
        </div>

        {/* Global Linguistic Rating */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f283d] border border-[#f2ca50]/30 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-[#cbd5e1]">Indice Global</span>
          <span className="text-xs font-mono font-bold text-[#f2ca50]">{overallAvg}%</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f2ca50]/20 text-[#f2ca50] font-bold uppercase">
            {user.level}
          </span>
        </div>
      </div>

      <p className="text-xs text-[#cbd5e1] leading-relaxed">
        Cartographie en temps réel de vos aptitudes d'apprentissage. Le radar évalue l'équilibre entre la rigueur syntaxique, la richesse du vocabulaire, la netteté de l'élocution et la compréhension auditive.
      </p>

      {/* Main Chart + Radial Display */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-1">
        {/* Radar Graphic Container */}
        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center bg-[#0d1424]/60 rounded-2xl border border-[#2a364f]/60 p-2 shadow-inner">
          <svg
            viewBox="0 0 280 280"
            className="w-full h-full overflow-visible select-none"
            aria-label="Radar des compétences linguistiques"
          >
            <defs>
              {/* Radial gradient for the polygon area */}
              <linearGradient id="radarPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.25" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="radarGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Concentric diamond grid rings */}
            {gridLevels.map((lvl) => {
              const r = maxR * lvl;
              const path = `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
              const isOuter = lvl === 1.0;
              return (
                <g key={lvl}>
                  <path
                    d={path}
                    fill="none"
                    stroke={isOuter ? '#475569' : '#334155'}
                    strokeWidth={isOuter ? '1.5' : '1'}
                    strokeDasharray={isOuter ? undefined : '3 3'}
                    opacity={isOuter ? 0.7 : 0.4}
                  />
                  {/* Subtle level label on top axis */}
                  <text
                    x={cx + 4}
                    y={cy - r + 9}
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                    opacity="0.8"
                  >
                    {Math.round(lvl * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Outer subtle circular reference */}
            <circle
              cx={cx}
              cy={cy}
              r={maxR}
              fill="none"
              stroke="#334155"
              strokeWidth="0.75"
              strokeDasharray="4 4"
              opacity="0.3"
            />

            {/* Crosshair Axes Lines */}
            <line
              x1={cx}
              y1={cy - maxR}
              x2={cx}
              y2={cy + maxR}
              stroke="#475569"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <line
              x1={cx - maxR}
              y1={cy}
              x2={cx + maxR}
              y2={cy}
              stroke="#475569"
              strokeWidth="1.2"
              opacity="0.6"
            />

            {/* Center origin dot */}
            <circle cx={cx} cy={cy} r="2.5" fill="#64748b" opacity="0.6" />

            {/* User Polygon Filled Shape */}
            <polygon
              points={`${pGrammar.x},${pGrammar.y} ${pVocab.x},${pVocab.y} ${pListening.x},${pListening.y} ${pElocution.x},${pElocution.y}`}
              fill="url(#radarPolygonGrad)"
              stroke="#f2ca50"
              strokeWidth="2.2"
              filter="url(#radarGoldGlow)"
              className="transition-all duration-700 ease-out"
            />

            {/* Axis Labels (Interactive Buttons in SVG) */}
            {/* 1. Grammaire (Top) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveDimension(activeDimension === 'grammaire' ? null : 'grammaire')}
            >
              <rect
                x={cx - 50}
                y={cy - maxR - 28}
                width="100"
                height="22"
                rx="6"
                fill={activeDimension === 'grammaire' ? '#f2ca50' : '#141c2c'}
                stroke="#f2ca50"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={cx}
                y={cy - maxR - 14}
                textAnchor="middle"
                fill={activeDimension === 'grammaire' ? '#271f02' : '#f2ca50'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                📚 Grammaire {grammarScore}%
              </text>
            </g>

            {/* 2. Vocabulaire (Right) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveDimension(activeDimension === 'vocabulaire' ? null : 'vocabulaire')}
            >
              <rect
                x={cx + maxR + 8}
                y={cy - 11}
                width="100"
                height="22"
                rx="6"
                fill={activeDimension === 'vocabulaire' ? '#38bdf8' : '#141c2c'}
                stroke="#38bdf8"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={cx + maxR + 58}
                y={cy + 3}
                textAnchor="middle"
                fill={activeDimension === 'vocabulaire' ? '#082f49' : '#38bdf8'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                📖 Vocabulaire {vocabScore}%
              </text>
            </g>

            {/* 3. Écoute (Bottom) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveDimension(activeDimension === 'ecoute' ? null : 'ecoute')}
            >
              <rect
                x={cx - 45}
                y={cy + maxR + 8}
                width="90"
                height="22"
                rx="6"
                fill={activeDimension === 'ecoute' ? '#34d399' : '#141c2c'}
                stroke="#34d399"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={cx}
                y={cy + maxR + 22}
                textAnchor="middle"
                fill={activeDimension === 'ecoute' ? '#022c22' : '#34d399'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                🎧 Écoute {listeningScore}%
              </text>
            </g>

            {/* 4. Élocution (Left) */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveDimension(activeDimension === 'elocution' ? null : 'elocution')}
            >
              <rect
                x={cx - maxR - 108}
                y={cy - 11}
                width="100"
                height="22"
                rx="6"
                fill={activeDimension === 'elocution' ? '#fb923c' : '#141c2c'}
                stroke="#fb923c"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={cx - maxR - 58}
                y={cy + 3}
                textAnchor="middle"
                fill={activeDimension === 'elocution' ? '#431407' : '#fb923c'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                🎙️ Élocution {elocutionScore}%
              </text>
            </g>

            {/* Vertex Dots with glowing rings */}
            <circle cx={pGrammar.x} cy={pGrammar.y} r="4.5" fill="#f2ca50" stroke="#0a0f19" strokeWidth="2" />
            <circle cx={pVocab.x} cy={pVocab.y} r="4.5" fill="#38bdf8" stroke="#0a0f19" strokeWidth="2" />
            <circle cx={pListening.x} cy={pListening.y} r="4.5" fill="#34d399" stroke="#0a0f19" strokeWidth="2" />
            <circle cx={pElocution.x} cy={pElocution.y} r="4.5" fill="#fb923c" stroke="#0a0f19" strokeWidth="2" />
          </svg>
        </div>

        {/* Breakdown Dimensions Cards */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {dimensions.map((dim) => {
            const isSelected = activeDimension === dim.id;
            return (
              <div
                key={dim.id}
                onClick={() => setActiveDimension(isSelected ? null : dim.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#1e273a] border-[#f2ca50] shadow-md ring-1 ring-[#f2ca50]/50'
                    : 'bg-[#121927]/90 border-[#2b354b]/60 hover:border-[#4d5b7a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ color: dim.color }}
                    >
                      {dim.icon}
                    </span>
                    <span className="text-xs font-bold text-[#e2e8f0] font-sans">
                      {dim.label}
                    </span>
                  </div>

                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${dim.color}20`,
                      color: dim.color,
                      border: `1px solid ${dim.color}40`
                    }}
                  >
                    {dim.score}%
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-[#1b2333] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${dim.score}%`,
                      backgroundColor: dim.color
                    }}
                  />
                </div>

                {/* Subtext description */}
                <p className="text-[11px] text-[#94a3b8] leading-tight">
                  {dim.description}
                </p>

                {/* Diagnostic feedback tag */}
                <div className="pt-0.5 text-[10px] text-[#cbd5e1] font-mono flex items-center gap-1">
                  <span className="text-[#f2ca50]">▸</span>
                  <span className="truncate">{dim.recommendation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Diagnostic Advice Banner */}
      <div className="p-3 rounded-xl bg-[#0f1728] border border-[#2b354b]/70 flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[#f2ca50] text-lg shrink-0 mt-0.5">
          psychology
        </span>
        <div className="text-xs text-[#cbd5e1] leading-relaxed">
          <strong className="text-[#f2ca50]">Synthèse de l'apprentissage : </strong>
          Votre maîtrise linguistique actuelle correspond aux critères avancés de niveau{' '}
          <span className="font-mono font-bold text-white px-1.5 py-0.5 rounded bg-[#1e293b] border border-[#334155]">
            {user.level}
          </span>
          . Continuez la révision ciblée dans le <em>Journal d'Erreurs</em> et les sessions orales pour franchir le prochain palier d'excellence.
        </div>
      </div>
    </div>
  );
};
