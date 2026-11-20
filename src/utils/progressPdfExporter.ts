import { jsPDF } from 'jspdf';
import type {
  UserProfile,
  LearningAttempt,
  ProgressChartAnnotation,
  ChartAnnotationCategory
} from '../firebase/types';
import {
  getThirtyDayWeeklyXpHistory,
  getUserLearningAttempts,
  getChartAnnotations,
  type ThirtyDayWeeklyXpResult
} from '../firebase/client';
import { computeUserBadges } from '../data/badges';
import { getVocabularyMasterySummary } from '../data/vocabularyStats';
import { getCityMapProgression } from './cityMapManager';
import { getLevelProgress } from './levelUtils';

export interface ExportProgressPdfOptions {
  user: UserProfile;
  thirtyDayHistory?: ThirtyDayWeeklyXpResult | null;
  annotations?: ProgressChartAnnotation[];
}

export interface ExportProgressPdfResult {
  filename: string;
  pagesCount: number;
  sizeBytes: number;
}

const CATEGORY_PDF_LABEL: Record<ChartAnnotationCategory, string> = {
  milestone: 'ETAPE',
  exam: 'EXAMEN',
  streak: 'SERIE',
  note: 'NOTE'
};

/**
 * Normalise le texte pour la police standard Helvetica (Latin-1 / WinAnsi)
 * en conservant les accents français tout en remplaçant les glyphes typographiques non supportés.
 */
function pdfSafe(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDateFr(isoOrDate?: string | Date): string {
  const d = isoOrDate instanceof Date ? isoOrDate : isoOrDate ? new Date(isoOrDate) : new Date();
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export async function exportProgressReportPdf(
  options: ExportProgressPdfOptions
): Promise<ExportProgressPdfResult> {
  const { user } = options;

  // Charger en parallèle les données complètes de progression
  const [thirtyDay, attemptsRes, vocabSummary] = await Promise.all([
    options.thirtyDayHistory
      ? Promise.resolve(options.thirtyDayHistory)
      : getThirtyDayWeeklyXpHistory(user.uid, user.stats?.weeklyXp || 0),
    getUserLearningAttempts(user.uid, 100),
    getVocabularyMasterySummary(user)
  ]);

  const attempts: LearningAttempt[] = attemptsRes.attempts || [];
  const annotations: ProgressChartAnnotation[] =
    options.annotations && options.annotations.length > 0
      ? options.annotations
      : user.chartAnnotations && user.chartAnnotations.length > 0
      ? user.chartAnnotations
      : getChartAnnotations();

  const cityProg = user.cityMapProgression || getCityMapProgression();
  const completedChaptersCount = Object.values(cityProg.completedChaptersByLevel || {}).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );

  const playerLevelInfo = getLevelProgress(user.stats?.totalXp || 0);
  const allBadges = computeUserBadges(user, attempts);
  const unlockedBadges = allBadges.filter((b) => b.isUnlocked);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 18;
  let cursorY = 14;

  const ensureSpace = (neededMm: number) => {
    if (cursorY + neededMm > bottomLimit) {
      doc.addPage();
      cursorY = 18;
    }
  };

  const drawSectionTitle = (title: string, subtitle?: string) => {
    ensureSpace(18);
    doc.setFillColor(242, 202, 80);
    doc.rect(marginX, cursorY, 2.2, subtitle ? 10 : 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(pdfSafe(title), marginX + 5, cursorY + 4.8);
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(pdfSafe(subtitle), marginX + 5, cursorY + 9.4);
      cursorY += 13.5;
    } else {
      cursorY += 10;
    }
  };

  // =========================================================================
  // 1. EN-TÊTE OXFORD NAVY & OR
  // =========================================================================
  doc.setFillColor(7, 14, 29);
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setFillColor(242, 202, 80);
  doc.rect(0, 38, pageWidth, 1.4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(242, 202, 80);
  doc.text('ENGLISH BOOST MZ', marginX, 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(220, 226, 248);
  doc.text('Rapport Récapitulatif de Progression', marginX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 190, 210);
  const identityLine = `${pdfSafe(user.displayName || 'Académicien')}  |  CEFR ${pdfSafe(
    user.level
  )}  |  Niveau Joueur ${playerLevelInfo.level}`;
  doc.text(identityLine, marginX, 29);

  if (user.email) {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(pdfSafe(user.email), marginX, 34);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(212, 199, 143);
  doc.text(
    pdfSafe(`Généré le ${formatDateFr(new Date())}`),
    pageWidth - marginX,
    14.5,
    { align: 'right' }
  );
  doc.text(
    pdfSafe(`Série active : ${user.stats?.streakDays || 0} jours`),
    pageWidth - marginX,
    22,
    { align: 'right' }
  );
  doc.text(
    pdfSafe(`Solde : ${(user.mszCoinsBalance ?? 0).toLocaleString('fr-FR')} MSZ Coins`),
    pageWidth - marginX,
    29,
    { align: 'right' }
  );

  cursorY = 47;

  // =========================================================================
  // 2. SYNTHÈSE GLOBALE (6 CARTES KPI)
  // =========================================================================
  drawSectionTitle(
    'Vue d’ensemble des accomplissements',
    'Indicateurs consolidés de maîtrise, d’assiduité et d’avancement dans le cursus'
  );

  const kpiCards = [
    {
      label: 'XP TOTAL CUMULE',
      value: `${(user.stats?.totalXp || 0).toLocaleString('fr-FR')} XP`,
      hint: `Niveau ${playerLevelInfo.level} (${playerLevelInfo.progressPercent}%)`
    },
    {
      label: 'XP HEBDO ACTUEL',
      value: `${(user.stats?.weeklyXp || 0).toLocaleString('fr-FR')} XP`,
      hint: `Moy. 30j : ${thirtyDay.averageWeeklyXp.toLocaleString('fr-FR')} XP/sem.`
    },
    {
      label: 'SERIE & ASSIDUITE',
      value: `${user.stats?.streakDays || 0} jours`,
      hint: `${user.stats?.totalImmersionMinutes || 0} min d'immersion totale`
    },
    {
      label: 'MODULES VALIDES',
      value: `${user.stats?.completedModules || 0} / ${user.stats?.totalModules || 200}`,
      hint: `Maîtrise globale : ${user.stats?.masteryPercentage || 0}%`
    },
    {
      label: 'CARTE 600 NIVEAUX',
      value: `${cityProg.conqueredLevels.length} / 600 niv.`,
      hint: `${completedChaptersCount} chapitres - ${cityProg.totalStars || 0} étoiles`
    },
    {
      label: 'MAITRISE LEXICALE',
      value: `${vocabSummary.stats.totalMastered} mots`,
      hint: `Rétention : ${vocabSummary.stats.overallRetentionRate}%`
    }
  ];

  const colGap = 4;
  const cardW = (contentWidth - colGap * 2) / 3;
  const cardH = 19;

  kpiCards.forEach((card, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = marginX + col * (cardW + colGap);
    const y = cursorY + row * (cardH + 3.5);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(pdfSafe(card.label), x + 3.5, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(pdfSafe(card.value), x + 3.5, y + 11.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(pdfSafe(card.hint), x + 3.5, y + 16.4);
  });

  cursorY += cardH * 2 + 12;

  // =========================================================================
  // 3. ÉVOLUTION DU SCORE XP HEBDOMADAIRE (30 DERNIERS JOURS) + GRAPHIQUE
  // =========================================================================
  drawSectionTitle(
    'Évolution du score XP hebdomadaire (30 derniers jours)',
    `Cumul 30j : +${thirtyDay.total30DayXp.toLocaleString('fr-FR')} XP  |  Record : +${thirtyDay.peakWeeklyXp.toLocaleString(
      'fr-FR'
    )} XP (${thirtyDay.peakWeekLabel})  |  Tendance : ${
      thirtyDay.weeklyTrendPercent >= 0 ? `+${thirtyDay.weeklyTrendPercent}` : thirtyDay.weeklyTrendPercent
    }%`
  );

  // Mini graphique vectoriel dans le PDF
  const weeks = thirtyDay.weeklyHistory || [];
  if (weeks.length > 0) {
    ensureSpace(48);
    const chartX = marginX;
    const chartY = cursorY;
    const chartW = contentWidth;
    const chartH = 42;

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(chartX, chartY, chartW, chartH, 2.5, 2.5, 'F');

    const padL = 14;
    const padR = 10;
    const padT = 9;
    const padB = 11;
    const plotW = chartW - padL - padR;
    const plotH = chartH - padT - padB;
    const maxVal = Math.max(500, ...weeks.map((w) => w.weeklyXp), thirtyDay.averageWeeklyXp) * 1.15;

    // Ligne horizontale de moyenne
    if (thirtyDay.averageWeeklyXp > 0) {
      const avgY = chartY + padT + plotH - (thirtyDay.averageWeeklyXp / maxVal) * plotH;
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.35);
      doc.line(chartX + padL, avgY, chartX + padL + plotW, avgY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(56, 189, 248);
      doc.text(
        pdfSafe(`Moy ${thirtyDay.averageWeeklyXp} XP`),
        chartX + padL + plotW,
        avgY - 1.2,
        { align: 'right' }
      );
    }

    const slotW = plotW / weeks.length;
    const barW = Math.min(18, slotW * 0.48);

    weeks.forEach((w, idx) => {
      const barH = Math.max(2, (w.weeklyXp / maxVal) * plotH);
      const bx = chartX + padL + idx * slotW + (slotW - barW) / 2;
      const by = chartY + padT + plotH - barH;

      doc.setFillColor(w.isCurrentWeek ? 242 : 212, w.isCurrentWeek ? 202 : 175, w.isCurrentWeek ? 80 : 55);
      doc.roundedRect(bx, by, barW, barH, 1, 1, 'F');

      // Valeur XP au-dessus
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(242, 202, 80);
      doc.text(pdfSafe(`${w.weeklyXp}`), bx + barW / 2, Math.max(chartY + 5, by - 1.5), {
        align: 'center'
      });

      // Libellé semaine
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(220, 226, 248);
      doc.text(pdfSafe(w.shortLabel), bx + barW / 2, chartY + chartH - 5.2, {
        align: 'center'
      });
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(pdfSafe(w.rangeLabel), bx + barW / 2, chartY + chartH - 1.8, {
        align: 'center'
      });
    });

    cursorY += chartH + 5;
  }

  // Tableau détaillé des semaines
  if (weeks.length > 0) {
    ensureSpace(14 + weeks.length * 6.5);
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, cursorY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    const cols = [
      marginX + 2,
      marginX + 34,
      marginX + 74,
      marginX + 100,
      marginX + 122,
      marginX + 144
    ];
    doc.text('Semaine', cols[0], cursorY + 4.4);
    doc.text('Période', cols[1], cursorY + 4.4);
    doc.text('XP Hebdo', cols[2], cursorY + 4.4);
    doc.text('Sessions', cols[3], cursorY + 4.4);
    doc.text('Précision', cols[4], cursorY + 4.4);
    doc.text('Thème principal', cols[5], cursorY + 4.4);
    cursorY += 6.5;

    weeks.forEach((w, idx) => {
      ensureSpace(7);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, cursorY, contentWidth, 6.2, 'F');
      }
      doc.setFont('helvetica', w.isCurrentWeek ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(pdfSafe(w.shortLabel), cols[0], cursorY + 4.3);
      doc.text(pdfSafe(w.rangeLabel), cols[1], cursorY + 4.3);
      doc.text(pdfSafe(`+${w.weeklyXp} XP`), cols[2], cursorY + 4.3);
      doc.text(pdfSafe(`${w.sessionsCount}`), cols[3], cursorY + 4.3);
      doc.text(pdfSafe(w.averageScore > 0 ? `${w.averageScore}%` : '-'), cols[4], cursorY + 4.3);
      const focusShort = w.topModule.length > 24 ? `${w.topModule.slice(0, 23)}...` : w.topModule;
      doc.text(pdfSafe(focusShort), cols[5], cursorY + 4.3);
      cursorY += 6.2;
    });
    cursorY += 6;
  }

  // =========================================================================
  // 4. ANNOTATIONS PERSONNELLES DU GRAPHIQUE
  // =========================================================================
  if (annotations.length > 0) {
    drawSectionTitle(
      `Événements et annotations personnelles (${annotations.length})`,
      'Repères marqués par l’utilisateur sur le graphique de progression'
    );

    annotations.slice(0, 15).forEach((ann) => {
      const catTag = `[${CATEGORY_PDF_LABEL[ann.category] || 'NOTE'}]`;
      const header = `${catTag} ${pdfSafe(ann.pointLabel)} :`;
      const wrapped = doc.splitTextToSize(pdfSafe(ann.text), contentWidth - 8);
      const blockHeight = 6 + wrapped.length * 4.2;
      ensureSpace(blockHeight + 2);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, cursorY, contentWidth, blockHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 130, 18);
      doc.text(header, marginX + 3.5, cursorY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(30, 41, 59);
      doc.text(wrapped, marginX + 3.5, cursorY + 8.8);

      cursorY += blockHeight + 2;
    });
    cursorY += 4;
  }

  // =========================================================================
  // 5. DISTINCTIONS & BADGES ACADÉMIQUES
  // =========================================================================
  drawSectionTitle(
    `Distinctions & Badges Académiques (${unlockedBadges.length}/${allBadges.length})`,
    'Trophées débloqués grâce à la régularité et aux résultats obtenus'
  );

  if (unlockedBadges.length === 0) {
    ensureSpace(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Aucun badge débloqué pour le moment. Poursuivez vos entraînements quotidiens.', marginX, cursorY + 4);
    cursorY += 9;
  } else {
    const shownBadges = unlockedBadges.slice(0, 12);
    const badgeColW = (contentWidth - 4) / 2;
    for (let i = 0; i < shownBadges.length; i += 2) {
      ensureSpace(13);
      [0, 1].forEach((offset) => {
        const b = shownBadges[i + offset];
        if (!b) return;
        const bx = marginX + offset * (badgeColW + 4);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(212, 175, 55);
        doc.roundedRect(bx, cursorY, badgeColW, 10.5, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(15, 23, 42);
        doc.text(pdfSafe(`${b.title} (${b.tier.toUpperCase()})`), bx + 3, cursorY + 4.4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(71, 85, 105);
        const sub = `${b.requirementLabel} - +${b.xpReward} XP`;
        doc.text(pdfSafe(sub.length > 52 ? `${sub.slice(0, 51)}...` : sub), bx + 3, cursorY + 8.5);
      });
      cursorY += 12;
    }
    cursorY += 3;
  }

  // =========================================================================
  // 6. HISTORIQUE DES SESSIONS RÉCENTES
  // =========================================================================
  if (attempts.length > 0) {
    const recentAttempts = attempts.slice(0, 12);
    drawSectionTitle(
      'Sessions d’entraînement récentes',
      `${attempts.length} tentatives enregistrées (affichage des ${recentAttempts.length} dernières)`
    );

    ensureSpace(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, cursorY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Date', marginX + 2, cursorY + 4.4);
    doc.text('Module / Exercice', marginX + 30, cursorY + 4.4);
    doc.text('Type', marginX + 124, cursorY + 4.4);
    doc.text('Niveau', marginX + 148, cursorY + 4.4);
    doc.text('Score', marginX + 167, cursorY + 4.4);
    cursorY += 6.5;

    recentAttempts.forEach((att, idx) => {
      ensureSpace(6.5);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, cursorY, contentWidth, 6, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(15, 23, 42);
      doc.text(pdfSafe(formatDateFr(att.completedAt)), marginX + 2, cursorY + 4.2);

      const cleanTitle = pdfSafe(att.title || att.moduleId);
      doc.text(
        cleanTitle.length > 52 ? `${cleanTitle.slice(0, 51)}...` : cleanTitle,
        marginX + 30,
        cursorY + 4.2
      );
      doc.text(pdfSafe(att.moduleType), marginX + 124, cursorY + 4.2);
      doc.text(pdfSafe(att.level || user.level), marginX + 148, cursorY + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.text(pdfSafe(`${att.score}%`), marginX + 167, cursorY + 4.2);
      cursorY += 6;
    });
  }

  // =========================================================================
  // PIED DE PAGE SUR TOUTES LES PAGES
  // =========================================================================
  const pagesCount = doc.getNumberOfPages();
  for (let p = 1; p <= pagesCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      pdfSafe(`English Boost MZ - Suivi long terme (${user.displayName || 'Académicien'})`),
      marginX,
      pageHeight - 7
    );
    doc.text(`Page ${p} / ${pagesCount}`, pageWidth - marginX, pageHeight - 7, {
      align: 'right'
    });
  }

  // Téléchargement propre via Blob URL (compatible iframe, sans window.open)
  const todaySlug = new Date().toISOString().split('T')[0];
  const filename = `English_Boost_MZ_Progression_${todaySlug}.pdf`;
  const pdfBlob = doc.output('blob');

  if (typeof document !== 'undefined') {
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
  }

  return {
    filename,
    pagesCount,
    sizeBytes: pdfBlob.size
  };
}
