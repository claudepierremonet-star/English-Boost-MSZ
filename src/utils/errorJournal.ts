/**
 * Utilitaire de gestion du Journal d'Erreurs
 * Stocke et synchronise les points faibles (mots de flashcards manqués & erreurs de dictée)
 * Permet une session de révision ciblée sur ces points faibles.
 */

export type ErrorSource = 'flashcard' | 'dictation';

export interface ErrorJournalItem {
  id: string;
  source: ErrorSource;
  term: string;
  translationFr: string;
  definition: string;
  gradeLevel?: string;
  cefrLevel?: string;
  theme?: string;
  phoneticsUk?: string;
  phoneticsUs?: string;
  etymology?: string;
  // Dictée spécifique
  dictationSentence?: string;
  userAnswer?: string;
  expectedAnswer?: string;
  accuracyScore?: number;
  diffExplanation?: string;
  // Suivi
  errorCount: number;
  lastMissedAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

const STORAGE_KEY = 'eb_msz_error_journal_v1';

// Jeu d'erreurs initiales authentiques issues du cursus Oxford pour démonstration immédiate
const SEED_ERRORS: ErrorJournalItem[] = [
  {
    id: 'err_fc_equivocal',
    source: 'flashcard',
    term: 'Equivocal',
    translationFr: 'Équivoque / Ambigü avec intention diplomatique',
    definition: 'Open to double interpretation with intent to remain non-committal or avoid offense.',
    gradeLevel: 'terminale',
    cefrLevel: 'C1',
    theme: 'monde_du_travail_metiers',
    phoneticsUk: '/ɪˈkwɪv.ə.kəl/',
    phoneticsUs: '/ɪˈkwɪv.ə.kəl/',
    etymology: 'Du latin médiéval aequivocus, de aequus (« égal ») et vox (« voix, son »).',
    errorCount: 2,
    lastMissedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    resolved: false
  },
  {
    id: 'err_dict_characteristically',
    source: 'dictation',
    term: 'Characteristically',
    translationFr: 'De façon caractéristique / Typiquement',
    definition: 'In a manner that is typical or distinctive of a particular person, group, or thing.',
    gradeLevel: 'premiere',
    cefrLevel: 'C1',
    theme: 'histoire_patrimoine',
    phoneticsUk: '/ˌkær.ək.təˈrɪs.tɪ.kəl.i/',
    phoneticsUs: '/ˌker.ək.təˈrɪs.tɪ.kəl.i/',
    dictationSentence: 'The ambassador’s response was characteristically equivocal, giving offense to neither faction.',
    userAnswer: 'caracteristicaly',
    expectedAnswer: 'characteristically',
    accuracyScore: 68,
    diffExplanation: 'Omission du préfixe « ch » (au lieu de « c ») et simple « l » au lieu du double « ll » final.',
    errorCount: 3,
    lastMissedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    resolved: false
  },
  {
    id: 'err_fc_pernicious',
    source: 'flashcard',
    term: 'Pernicious',
    translationFr: 'Pernicieux / Nuisible de façon insidieuse',
    definition: 'Having a gradual, subtle and destructive effect that unfolds over time.',
    gradeLevel: 'terminale',
    cefrLevel: 'C2',
    theme: 'alimentation_sante',
    phoneticsUk: '/pəˈnɪʃ.əs/',
    phoneticsUs: '/pɚˈnɪʃ.əs/',
    etymology: 'Du latin perniciosus (« destructeur »), de per- (« à travers ») et necis (« meurtre violent »).',
    errorCount: 1,
    lastMissedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    resolved: false
  },
  {
    id: 'err_dict_deliberately',
    source: 'dictation',
    term: 'Deliberately',
    translationFr: 'Délibérément / Volontairement',
    definition: 'Consciously and intentionally; on purpose.',
    gradeLevel: 'seconde',
    cefrLevel: 'B2',
    theme: 'vie_quotidienne',
    phoneticsUk: '/dɪˈlɪb.ər.ət.li/',
    phoneticsUs: '/dɪˈlɪb.ɚ.ət.li/',
    dictationSentence: 'He deliberately paused before offering his final verdict.',
    userAnswer: 'deliberatly',
    expectedAnswer: 'deliberately',
    accuracyScore: 75,
    diffExplanation: 'Omission du « e » central muet avant le suffixe « -ly » : de-lib-er-ate-ly.',
    errorCount: 1,
    lastMissedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolved: false
  },
  {
    id: 'err_fc_meretricious',
    source: 'flashcard',
    term: 'Meretricious',
    translationFr: 'Artificiel / D’un éclat trompeur et sans valeur réelle',
    definition: 'Apparently attractive but having in reality no genuine substance or intrinsic value.',
    gradeLevel: 'terminale',
    cefrLevel: 'C2',
    theme: 'musique_culture',
    phoneticsUk: '/ˌmer.əˈtrɪʃ.əs/',
    phoneticsUs: '/ˌmer.əˈtrɪʃ.əs/',
    etymology: 'Du latin meretricius, dérivé de meretrix (« courtisane »), lié à merere (« gagner »).',
    errorCount: 2,
    lastMissedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    resolved: false
  },
  {
    id: 'err_dict_parliamentary',
    source: 'dictation',
    term: 'Parliamentary',
    translationFr: 'Parlementaire / Relatif au Parlement',
    definition: 'Relating to, enacted by, or characteristic of a parliament.',
    gradeLevel: '3e',
    cefrLevel: 'B2',
    theme: 'histoire_patrimoine',
    phoneticsUk: '/ˌpɑː.lɪˈmen.tər.i/',
    phoneticsUs: '/ˌpɑːr.ləˈmen.tər.i/',
    dictationSentence: 'The parliamentary debate concluded with an overwhelming majority.',
    userAnswer: 'parlamentary',
    expectedAnswer: 'parliamentary',
    accuracyScore: 80,
    diffExplanation: 'Omission du « i » dans la racine normande-anglaise : par-lia-ment.',
    errorCount: 1,
    lastMissedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 3600000 * 10).toISOString()
  }
];

/**
 * Récupère tous les éléments du journal d'erreurs
 */
export function getErrorJournal(): ErrorJournalItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ERRORS));
      return SEED_ERRORS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ERRORS));
      return SEED_ERRORS;
    }
    return parsed;
  } catch {
    return SEED_ERRORS;
  }
}

/**
 * Sauvegarde la liste complète
 */
export function saveErrorJournal(items: ErrorJournalItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('eb_error_journal_updated', { detail: items }));
  } catch (e) {
    console.warn('Erreur sauvegarde Journal Erreurs:', e);
  }
}

/**
 * Enregistre ou incrémente une erreur issue d'une session de Flashcard
 */
export function recordFlashcardError(card: {
  id?: string;
  term: string;
  definition?: string;
  translationFr?: string;
  gradeLevel?: string;
  level?: string;
  theme?: string;
  phoneticsUk?: string;
  phoneticsUs?: string;
  etymology?: string;
}): void {
  const list = getErrorJournal();
  const existingIdx = list.findIndex(
    (item) => item.source === 'flashcard' && item.term.toLowerCase() === card.term.toLowerCase()
  );

  if (existingIdx >= 0) {
    list[existingIdx].errorCount += 1;
    list[existingIdx].lastMissedAt = new Date().toISOString();
    list[existingIdx].resolved = false;
    list[existingIdx].resolvedAt = undefined;
    if (card.definition) list[existingIdx].definition = card.definition;
    if (card.translationFr) list[existingIdx].translationFr = card.translationFr;
  } else {
    const newItem: ErrorJournalItem = {
      id: `err_fc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: 'flashcard',
      term: card.term,
      translationFr: card.translationFr || 'Terme à mémoriser',
      definition: card.definition || 'Définition à consolider en répétition espacée.',
      gradeLevel: card.gradeLevel,
      cefrLevel: card.level,
      theme: card.theme,
      phoneticsUk: card.phoneticsUk,
      phoneticsUs: card.phoneticsUs,
      etymology: card.etymology,
      errorCount: 1,
      lastMissedAt: new Date().toISOString(),
      resolved: false
    };
    list.unshift(newItem);
  }

  saveErrorJournal(list);
}

/**
 * Enregistre ou incrémente une erreur issue d'une session de Dictée
 */
export function recordDictationError(info: {
  dictationId?: string;
  term: string;
  canonicalSentence: string;
  userText: string;
  score: number;
  gradeLevel?: string;
  level?: string;
  theme?: string;
  definition?: string;
  translationFr?: string;
  diffExplanation?: string;
}): void {
  const list = getErrorJournal();
  const existingIdx = list.findIndex(
    (item) => item.source === 'dictation' && item.term.toLowerCase() === info.term.toLowerCase()
  );

  if (existingIdx >= 0) {
    list[existingIdx].errorCount += 1;
    list[existingIdx].lastMissedAt = new Date().toISOString();
    list[existingIdx].resolved = false;
    list[existingIdx].resolvedAt = undefined;
    list[existingIdx].userAnswer = info.userText;
    list[existingIdx].accuracyScore = info.score;
    if (info.diffExplanation) list[existingIdx].diffExplanation = info.diffExplanation;
  } else {
    const newItem: ErrorJournalItem = {
      id: `err_dict_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: 'dictation',
      term: info.term,
      translationFr: info.translationFr || 'Transcription exacte',
      definition: info.definition || `Transcription de la phrase dans la dictée de niveau ${info.level || 'C1'}.`,
      gradeLevel: info.gradeLevel,
      cefrLevel: info.level,
      theme: info.theme,
      dictationSentence: info.canonicalSentence,
      userAnswer: info.userText,
      expectedAnswer: info.term,
      accuracyScore: info.score,
      diffExplanation: info.diffExplanation || 'Erreur orthographique ou mot manquant lors de l’écoute.',
      errorCount: 1,
      lastMissedAt: new Date().toISOString(),
      resolved: false
    };
    list.unshift(newItem);
  }

  saveErrorJournal(list);
}

/**
 * Marque un point faible comme résolu après une révision ciblée réussie
 */
export function markErrorAsResolved(id: string): void {
  const list = getErrorJournal();
  const updated = list.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        resolved: true,
        resolvedAt: new Date().toISOString()
      };
    }
    return item;
  });
  saveErrorJournal(updated);
}

/**
 * Remet un mot dans la liste active des points faibles
 */
export function reopenError(id: string): void {
  const list = getErrorJournal();
  const updated = list.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        resolved: false,
        resolvedAt: undefined,
        lastMissedAt: new Date().toISOString()
      };
    }
    return item;
  });
  saveErrorJournal(updated);
}

/**
 * Supprime définitivement une entrée du journal
 */
export function deleteErrorItem(id: string): void {
  const list = getErrorJournal();
  const filtered = list.filter((item) => item.id !== id);
  saveErrorJournal(filtered);
}

/**
 * Efface tous les points faibles résolus
 */
export function clearResolvedErrors(): void {
  const list = getErrorJournal();
  const filtered = list.filter((item) => !item.resolved);
  saveErrorJournal(filtered);
}
