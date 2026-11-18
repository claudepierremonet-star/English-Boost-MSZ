import {
  ALL_200_LESSONS,
  CURIOSITIES,
  QUIZ_QUESTIONS,
  type SchoolGrade
} from './curriculum';
import { GRAMMAR_6E_ITEMS } from './grammar6eData';
import { SPACED_REPETITION_500 } from './spacedRepetition500';
import {
  ANTONYM_SYNONYM_ITEMS,
  ASTRO_HANGMAN_DEBUTANT_BANK,
  ASTRO_HANGMAN_EXPERT_AVANCE_BANK,
  ASTRO_HANGMAN_EXPERT_BANK,
  ASTRO_HANGMAN_INTERMEDIAIRE_BANK,
  ASTRO_HANGMAN_MASTER_BANK,
  FILL_THE_BLANK_ITEMS,
  IDIOM_HUNTER_ITEMS,
  RIDDLE_ITEMS,
  SPELLING_BEE_ITEMS,
  SPEED_MATCH_AVANCE_BANK,
  SPEED_MATCH_DEBUTANT_BANK,
  SPEED_MATCH_INTERMEDIAIRE_BANK,
  UK_VS_US_ITEMS,
  VERB_MASTER_AVANCE_BANK,
  VERB_MASTER_DEBUTANT_BANK,
  VERB_MASTER_EXPERT_AVANCE_BANK,
  VERB_MASTER_EXPERT_BANK,
  VERB_MASTER_INTERMEDIAIRE_BANK,
  VERB_MASTER_MASTER_BANK,
  WORD_SCRAMBLE_DEBUTANT_BANK,
  WORD_SCRAMBLE_EXPERT_AVANCE_BANK,
  WORD_SCRAMBLE_EXPERT_BANK,
  WORD_SCRAMBLE_INTERMEDIAIRE_BANK,
  WORD_SCRAMBLE_MASTER_BANK
} from './twentyGamesData';
import type { CityBankEntry, CompactGrammarItem, CompactVocabGroup } from './cityBank5000_types';
import {
  CITY_BANK_5000_PART1_GRAMMAR,
  CITY_BANK_5000_PART1_GROUPS,
  CITY_BANK_5000_PART1_RAW
} from './cityBank5000_part1';
import { CITY_BANK_5000_PART2_GRAMMAR, CITY_BANK_5000_PART2_GROUPS } from './cityBank5000_part2';
import { CITY_BANK_5000_PART3_GRAMMAR, CITY_BANK_5000_PART3_GROUPS } from './cityBank5000_part3';
import { CITY_BANK_5000_PART4_GRAMMAR, CITY_BANK_5000_PART4_GROUPS } from './cityBank5000_part4';
import { CITY_BANK_5000_PART5_GRAMMAR, CITY_BANK_5000_PART5_GROUPS } from './cityBank5000_part5';
import { CITY_BANK_5000_PART6_GROUPS } from './cityBank5000_part6';
import { CITY_BANK_5000_PART7_GROUPS } from './cityBank5000_part7';
import { CITY_BANK_5000_PART8_GROUPS } from './cityBank5000_part8';
import { CITY_BANK_5000_PART9_GROUPS } from './cityBank5000_part9';
import { CITY_BANK_5000_PART10_GRAMMAR, CITY_BANK_5000_PART10_GROUPS } from './cityBank5000_part10';
import { CITY_BANK_5000_PART11_GRAMMAR, CITY_BANK_5000_PART11_GROUPS } from './cityBank5000_part11';
import { CITY_BANK_5000_PART12_GRAMMAR, CITY_BANK_5000_PART12_GROUPS } from './cityBank5000_part12';
import { CITY_BANK_5000_PART13_GROUPS } from './cityBank5000_part13';

const GRADE_LEVEL_RANGES: Record<SchoolGrade, [number, number]> = {
  '6e': [1, 90],
  '5e': [91, 180],
  '4e': [181, 270],
  '3e': [271, 360],
  '2nde': [361, 440],
  '1re': [441, 520],
  terminale: [521, 600]
};

export function normalizeBankKey(input: string): string {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[«»"“”()[\]{}.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashContentKey(key: string): string {
  // Compact deterministic FNV-1a 32-bit hash in base36 (6-7 chars)
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function computeQuestionKey(params: {
  type: 'mcq' | 'word_find';
  promptEn?: string;
  questionFr: string;
  targetWord?: string;
}): string {
  if (params.type === 'word_find') {
    return `wf:${normalizeBankKey(params.targetWord || params.questionFr)}`;
  }
  const core = params.promptEn ? `${params.promptEn} | ${params.questionFr}` : params.questionFr;
  return `q:${normalizeBankKey(core)}`;
}

export function computeAnswerKey(answer: string): string {
  return `a:${normalizeBankKey(answer)}`;
}

function cleanLettersOnly(raw?: string): string {
  return String(raw || '').toUpperCase().replace(/[^A-Z]/g, '');
}

const VALID_GRADES = new Set<SchoolGrade>(['6e', '5e', '4e', '3e', '2nde', '1re', 'terminale']);
function toValidGrade(raw: string): SchoolGrade {
  return VALID_GRADES.has(raw as SchoolGrade) ? (raw as SchoolGrade) : '4e';
}

const EXPLANATORY_PAREN_RE = /\s*\(([^)]+)\)/g;

function extractOptionNote(raw: string): { clean: string; note: string } {
  const notes: string[] = [];
  const stripped = String(raw || '')
    .replace(EXPLANATORY_PAREN_RE, (_m, inner: string) => {
      const t = inner.trim();
      if (t) notes.push(t);
      return '';
    })
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped.length >= 2) {
    return { clean: stripped, note: notes.join(' ; ') };
  }
  return { clean: String(raw || '').trim(), note: '' };
}

function getTextShape(text: string): {
  len: number;
  words: number;
  startsTo: boolean;
  startsFrArt: boolean;
  isUpperFirst: boolean;
  endsPunct: string;
  hasSlash: boolean;
} {
  const t = text.trim();
  const low = t.toLowerCase();
  const last = t.slice(-1);
  return {
    len: t.length,
    words: t.split(/\s+/).filter(Boolean).length,
    startsTo: /^to\s+/.test(low),
    startsFrArt: /^(le |la |l'|les |un |une |des |du |de l')/.test(low),
    isUpperFirst: /^[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]/.test(t),
    endsPunct: last === '?' || last === '!' || last === '.' ? last : '',
    hasSlash: t.includes(' / ')
  };
}

function pickShapeMatchedDistractors(
  answer: string,
  pool: string[],
  startIdx: number,
  count: number = 3
): string[] {
  const normAns = normalizeBankKey(answer);
  const ansShape = getTextShape(answer);
  const uniqueMap = new Map<string, string>();
  const maxScan = 48;

  if (pool.length <= maxScan) {
    for (let i = 0; i < pool.length; i++) {
      const clean = String(pool[i] || '').trim();
      if (!clean) continue;
      const nk = normalizeBankKey(clean);
      if (nk && nk !== normAns && !uniqueMap.has(nk)) {
        uniqueMap.set(nk, clean);
      }
    }
  } else {
    const offset = (startIdx * 7) % pool.length;
    for (let step = 0; step < pool.length && uniqueMap.size < maxScan; step++) {
      const clean = String(pool[(offset + step * 3) % pool.length] || '').trim();
      if (!clean) continue;
      const nk = normalizeBankKey(clean);
      if (nk && nk !== normAns && !uniqueMap.has(nk)) {
        uniqueMap.set(nk, clean);
      }
    }
  }

  const candidates = Array.from(uniqueMap.values());
  if (candidates.length === 0) return [];

  const scored = candidates.map((cand, i) => {
    const s = getTextShape(cand);
    let penalty = Math.abs(s.len - ansShape.len) * 2;
    penalty += Math.abs(s.words - ansShape.words) * 10;
    if (s.startsTo !== ansShape.startsTo) penalty += 14;
    if (s.startsFrArt !== ansShape.startsFrArt) penalty += 10;
    if (s.isUpperFirst !== ansShape.isUpperFirst) penalty += 5;
    if (s.endsPunct !== ansShape.endsPunct) penalty += 8;
    if (s.hasSlash !== ansShape.hasSlash) penalty += 12;
    return { cand, penalty, tieIdx: i };
  });

  scored.sort((a, b) => a.penalty - b.penalty || a.tieIdx - b.tieIdx);

  const windowSize = Math.min(scored.length, Math.max(count * 4, 12));
  const shortlist = scored.slice(0, windowSize);
  const chosen: string[] = [];
  const used = new Set<string>([normAns]);

  for (let step = 0; step < shortlist.length && chosen.length < count; step++) {
    const idx = (startIdx * 3 + step * 5) % shortlist.length;
    const item = shortlist[idx].cand;
    const nk = normalizeBankKey(item);
    if (!used.has(nk)) {
      used.add(nk);
      chosen.push(item);
    }
  }

  for (const entry of scored) {
    if (chosen.length >= count) break;
    const nk = normalizeBankKey(entry.cand);
    if (!used.has(nk)) {
      used.add(nk);
      chosen.push(entry.cand);
    }
  }

  return chosen;
}

const VALID_ALT_SPELLING_EQUIV = new Set<string>([
  'color|colour', 'colour|color', 'favor|favour', 'favour|favor',
  'honor|honour', 'honour|honor', 'labor|labour', 'labour|labor',
  'humor|humour', 'humour|humor', 'neighbor|neighbour', 'neighbour|neighbor',
  'flavor|flavour', 'flavour|flavor', 'behavior|behaviour', 'behaviour|behavior',
  'center|centre', 'centre|center', 'theater|theatre', 'theatre|theater',
  'meter|metre', 'metre|meter', 'liter|litre', 'litre|liter',
  'analyze|analyse', 'analyse|analyze', 'organize|organise', 'organise|organize',
  'realize|realise', 'realise|realize', 'apologize|apologise', 'apologise|apologize',
  'criticize|criticise', 'criticise|criticize', 'recognize|recognise', 'recognise|recognize',
  'memorize|memorise', 'memorise|memorize', 'civilize|civilise', 'civilise|civilize',
  'traveler|traveller', 'traveller|traveler', 'traveled|travelled', 'travelled|traveled',
  'counselor|counsellor', 'counsellor|counselor', 'modeling|modelling', 'modelling|modeling',
  'canceled|cancelled', 'cancelled|canceled', 'labeled|labelled', 'labelled|labeled',
  'defense|defence', 'defence|defense', 'offense|offence', 'offence|offense',
  'license|licence', 'licence|license', 'practice|practise', 'practise|practice',
  'program|programme', 'programme|program', 'catalog|catalogue', 'catalogue|catalog',
  'dialog|dialogue', 'dialogue|dialog', 'gray|grey', 'grey|gray',
  'check|cheque', 'cheque|check', 'tire|tyre', 'tyre|tire',
  'jewelry|jewellery', 'jewellery|jewelry', 'skeptic|sceptic', 'sceptic|skeptic',
  'aging|ageing', 'ageing|aging', 'judgment|judgement', 'judgement|judgment',
  'artifact|artefact', 'artefact|artifact', 'fulfill|fulfil', 'fulfil|fulfill',
  'enroll|enrol', 'enrol|enroll', 'skillful|skilful', 'skilful|skillful',
  'connection|connexion', 'connexion|connection', 'maneuver|manoeuvre', 'manoeuvre|maneuver'
]);

function isValidAltSpellingPair(w1: string, w2: string): boolean {
  const a = w1.toLowerCase();
  const b = w2.toLowerCase();
  if (a === b) return true;
  if (VALID_ALT_SPELLING_EQUIV.has(`${a}|${b}`)) return true;
  if (a.replace(/ize$/, 'ise') === b || a.replace(/ise$/, 'ize') === b) return true;
  if (a.replace(/ization$/, 'isation') === b || a.replace(/isation$/, 'ization') === b) return true;
  if (a.replace(/our$/, 'or') === b || a.replace(/or$/, 'our') === b) return true;
  if (a.replace(/tre$/, 'ter') === b || a.replace(/ter$/, 'tre') === b) return true;
  if (a.replace(/yse$/, 'yze') === b || a.replace(/yze$/, 'yse') === b) return true;
  return false;
}

function stripFrArticle(text: string): string {
  return text
    .trim()
    .replace(/^(?:le|la|l'|les|un|une|des|du|de l'|to)\s+/i, '')
    .trim();
}

function stripAccentLower(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’\-]/g, '')
    .trim();
}

function isTransparentSingleWordCognate(enRaw: string, frRaw: string): { enClean: string; frClean: string } | null {
  const enBase = enRaw.replace(/\s*\([^)]*\)$/, '').trim();
  const frBase = extractOptionNote(frRaw).clean;
  if (!/^[A-Za-z]{5,24}$/.test(enBase)) return null;

  const frWordOnly = stripFrArticle(frBase);
  if (!frWordOnly || /\s|\//.test(frWordOnly) || frWordOnly.length < 4) return null;

  const enNorm = stripAccentLower(enBase);
  const frNorm = stripAccentLower(frWordOnly);
  if (enNorm.length < 5 || frNorm.length < 4) return null;
  if (Math.abs(enNorm.length - frNorm.length) > 4) return null;

  if (enNorm === frNorm) {
    return { enClean: enBase, frClean: frBase };
  }

  let prefix = 0;
  const minLen = Math.min(enNorm.length, frNorm.length);
  while (prefix < minLen && enNorm[prefix] === frNorm[prefix]) prefix++;

  if (prefix >= 5 && prefix >= Math.floor(minLen * 0.68)) {
    return { enClean: enBase, frClean: frBase };
  }

  return null;
}

function generateSpellingTrapDistractors(word: string): string[] {
  const wasUpper = /^[A-Z]/.test(word);
  const lower = word.toLowerCase();
  const candidates: string[] = [];
  const seen = new Set<string>([lower]);

  const addCand = (raw: string) => {
    const c = raw.toLowerCase();
    if (
      c.length >= 4 &&
      c !== lower &&
      !seen.has(c) &&
      Math.abs(c.length - lower.length) <= 2 &&
      /^[a-z]+$/.test(c) &&
      !isValidAltSpellingPair(lower, c)
    ) {
      seen.add(c);
      candidates.push(wasUpper ? c.charAt(0).toUpperCase() + c.slice(1) : c);
    }
  };

  // 1. Reduce doubled consonants (aggressive -> agressive, millennium -> millenium)
  for (let i = 1; i < lower.length - 1; i++) {
    if (lower[i] === lower[i + 1] && /[bcdfglmnprstz]/.test(lower[i])) {
      addCand(lower.slice(0, i) + lower.slice(i + 1));
    }
  }

  // 2. French interference endings & prefixes
  const suffixRules: Array<[RegExp, string[]]> = [
    [/dictionary$/, ['dictionnary', 'dictionery', 'dictionaire']],
    [/ment$/, ['mant', 'ement']],
    [/nment$/, ['ment', 'nement']],
    [/ent$/, ['ant', 'ante', 'int']],
    [/ant$/, ['ent', 'ante', 'unt']],
    [/ence$/, ['ance', 'ense']],
    [/ance$/, ['ence', 'anse']],
    [/ible$/, ['able', 'ibel']],
    [/able$/, ['ible', 'abel']],
    [/ary$/, ['ery', 'ory', 'aire']],
    [/ery$/, ['ary', 'ory', 'erie']],
    [/ism$/, ['isme', 'izm']],
    [/ist$/, ['iste', 'yst']],
    [/tion$/, ['ssion', 'cion', 'sion']],
    [/sion$/, ['tion', 'ssion']],
    [/tial$/, ['cial', 'tiell']],
    [/cial$/, ['tial', 'sial']],
    [/ous$/, ['us', 'euse', 'ious']],
    [/ic$/, ['ique', 'ik']],
    [/al$/, ['el', 'alle']],
    [/ive$/, ['iv', 'ife']],
    [/re$/, ['er']],
    [/y$/, ['ie', 'i']]
  ];
  for (const [re, replacements] of suffixRules) {
    if (re.test(lower)) {
      for (const rep of replacements) {
        addCand(lower.replace(re, rep));
      }
    }
  }

  // 3. Double a single consonant inside the word (French-speaker hypercorrection)
  for (let i = 2; i < lower.length - 2; i++) {
    const ch = lower[i];
    if (/[lmnprstc]/.test(ch) && lower[i - 1] !== ch && lower[i + 1] !== ch && /[aeiouy]/.test(lower[i - 1])) {
      addCand(lower.slice(0, i + 1) + ch + lower.slice(i + 1));
    }
  }

  // 4. Vowel / digraph confusions
  const inlineRules: Array<[RegExp, string]> = [
    [/ph/, 'f'],
    [/qu/, 'k'],
    [/gu/, 'g'],
    [/ie/, 'ei'],
    [/ei/, 'ie'],
    [/ea/, 'ee'],
    [/ee/, 'ea'],
    [/ou/, 'o'],
    [/au/, 'o'],
    [/sc/, 's'],
    [/cc/, 'c'],
    [/c([eiy])/, 's$1'],
    [/im([pb])/, 'in$1'],
    [/in([pb])/, 'im$1']
  ];
  for (const [re, rep] of inlineRules) {
    if (re.test(lower)) {
      addCand(lower.replace(re, rep));
    }
  }

  // 5. Fallback subtle single vowel/consonant traps for short 5-letter cognates (e.g. Train, cruel)
  const shortInline: Array<[RegExp, string]> = [
    [/ai/, 'ei'],
    [/ai/, 'ae'],
    [/ue/, 'eu'],
    [/ue/, 'ui'],
    [/oo/, 'ou'],
    [/ou/, 'oo'],
    [/c/, 'k'],
    [/l$/, 'll'],
    [/n$/, 'nn'],
    [/r$/, 'rr']
  ];
  for (const [re, rep] of shortInline) {
    if (candidates.length >= 3) break;
    if (re.test(lower)) addCand(lower.replace(re, rep));
  }
  if (candidates.length < 3 && lower.endsWith('e')) {
    addCand(lower.slice(0, -1));
  } else if (candidates.length < 3) {
    addCand(`${lower}e`);
  }
  if (candidates.length < 3) {
    addCand(lower.replace(/a([bcdfghjklmnpqrstvwxyz])/, 'e$1'));
    addCand(lower.replace(/e([bcdfghjklmnpqrstvwxyz])/, 'a$1'));
    addCand(lower.replace(/i([bcdfghjklmnpqrstvwxyz])/, 'e$1'));
    addCand(lower.replace(/u([bcdfghjklmnpqrstvwxyz])/, 'o$1'));
  }

  return candidates.slice(0, 3);
}

function buildGrammar6eDistractors(tokens: string[], correctSentence: string): string[] {
  const normCorrect = normalizeBankKey(correctSentence);
  const traps: string[] = [];
  const seen = new Set<string>([normCorrect]);

  const formatTokens = (toks: string[]): string => {
    const joined = toks.join(' ').replace(/\s+([?.!,])/g, '$1').trim();
    if (!joined) return '';
    return joined.charAt(0).toUpperCase() + joined.slice(1);
  };

  const addTrap = (candidate: string) => {
    const clean = candidate.trim();
    const nk = normalizeBankKey(clean);
    if (clean && nk && !seen.has(nk)) {
      seen.add(nk);
      traps.push(clean);
    }
  };

  // Trap 1: Common English auxiliary / agreement / pronoun confusions
  const auxPairs: Array<[RegExp, string]> = [
    [/\bis\b/i, 'are'],
    [/\bare\b/i, 'is'],
    [/\bam\b/i, 'is'],
    [/\bisn't\b/i, "aren't"],
    [/\baren't\b/i, "isn't"],
    [/\bhas\b/i, 'have'],
    [/\bhave\b/i, 'has'],
    [/\bhasn't\b/i, "haven't"],
    [/\bhaven't\b/i, "hasn't"],
    [/\bdoesn't\b/i, "don't"],
    [/\bdon't\b/i, "doesn't"],
    [/\bdoes\b/i, 'do'],
    [/\bdo\b/i, 'does'],
    [/\bthere is\b/i, 'there are'],
    [/\bthere are\b/i, 'there is'],
    [/\bcan\b/i, 'can to'],
    [/\bIt's\b/, "They're"],
    [/\bShe's\b/, "She're"],
    [/\bHe's\b/, 'He are'],
    [/\ba\b/, 'an'],
    [/\ban\b/, 'a']
  ];
  for (const [re, rep] of auxPairs) {
    if (re.test(correctSentence) && traps.length < 3) {
      const mutated = correctSentence.replace(re, (m) =>
        m.charAt(0) === m.charAt(0).toUpperCase() && rep.charAt(0) !== rep.charAt(0).toUpperCase()
          ? rep.charAt(0).toUpperCase() + rep.slice(1)
          : rep
      );
      addTrap(mutated);
    }
  }

  // Trap 2: Word-order swap of meaningful interior tokens (preserving end punctuation)
  const lastTok = tokens[tokens.length - 1] || '';
  const hasEndPunct = /^[?.!,]$/.test(lastTok);
  const body = hasEndPunct ? tokens.slice(0, -1) : [...tokens];
  const endPunct = hasEndPunct ? lastTok : '';

  if (body.length >= 3) {
    const swapStart = [body[1], body[0], ...body.slice(2)];
    addTrap(formatTokens(endPunct ? [...swapStart, endPunct] : swapStart));
  }
  if (body.length >= 4) {
    const mid = Math.floor(body.length / 2);
    const swapMid = [...body.slice(0, mid - 1), body[mid], body[mid - 1], ...body.slice(mid + 1)];
    addTrap(formatTokens(endPunct ? [...swapMid, endPunct] : swapMid));
  }
  if (body.length >= 3) {
    const swapEnd = [...body.slice(0, -2), body[body.length - 1], body[body.length - 2]];
    addTrap(formatTokens(endPunct ? [...swapEnd, endPunct] : swapEnd));
  }

  // Trap 3: Question / negation syntax interference for French learners
  if (correctSentence.endsWith('?') && body.length >= 2) {
    addTrap(formatTokens(['Do', body[1].toLowerCase(), body[0].toLowerCase(), ...body.slice(2), '?']));
  }
  if (/\b(?:am|is|are)\b/i.test(correctSentence) && traps.length < 3) {
    addTrap(correctSentence.replace(/\b(am|is|are)\b/i, 'does $1').replace(/\s+/g, ' '));
  }
  if (/\b(?:likes|plays|goes|watches|has|lives)\b/i.test(correctSentence) && traps.length < 3) {
    addTrap(correctSentence.replace(/\b(likes|plays|goes|watches|lives)\b/i, (m) => m.slice(0, -1)));
  }

  // Safety fallback if a 2-token sentence still needs 3 distinct grammar traps
  if (traps.length < 3) {
    addTrap(correctSentence.replace(/^No,\s*/i, 'No, do '));
    addTrap(correctSentence.replace(/^Yes,\s*/i, 'Yes, are '));
    addTrap(`Do ${correctSentence.charAt(0).toLowerCase()}${correctSentence.slice(1)}`);
  }

  return traps.slice(0, 3);
}

const WORD_FIND_COGNATE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bvictoria\b/gi, 'la grande souveraine du XIXe siècle'],
  [/\bvolcans?\b/gi, 'cratères en éruption'],
  [/\bcontinent\b/gi, 'vaste masse terrestre'],
  [/\btouristes?\b/gi, 'visiteurs venus d’ailleurs'],
  [/\bpyjamas?\b/gi, 'vêtement de nuit'],
  [/\bsouvenirs?\b/gi, 'objet rapporté de voyage'],
  [/\bhôtels?\b/gi, 'hébergement touristique'],
  [/\bferry\b/gi, 'navire de traversée'],
  [/\btraditions?\b/gi, 'coutume ancienne transmise'],
  [/\bmusées?\b/gi, 'lieu d’exposition patrimoniale'],
  [/\bforêts?\b/gi, 'grande étendue boisée'],
  [/\bocéans?\b/gi, 'vaste étendue maritime'],
  [/\bhistoires?\b/gi, 'étude du passé'],
  [/\bapplaudissements?\b/gi, 'battements de mains du public'],
  [/\banciens?\b|\bantiques?\b/gi, 'très vieux, d’autrefois']
];

function sanitizeWordFindClue(targetWord: string, rawClue: string): string {
  let clue = String(rawClue || '').trim();
  const cleanTarget = cleanLettersOnly(targetWord).toLowerCase();
  if (!cleanTarget) return clue;

  for (const [re, rep] of WORD_FIND_COGNATE_REPLACEMENTS) {
    if (clue.toLowerCase().includes(cleanTarget.slice(0, 4)) || re.test(clue)) {
      clue = clue.replace(re, rep);
    }
  }

  if (cleanTarget === 'space') {
    clue = clue.replace(/\(\s*espace\s*\)/gi, '').replace(/\bespace\b/gi, 'étendue cosmique');
  }

  // Mask exact English target word or derived stems inside clue
  const stemLen = Math.min(cleanTarget.length, Math.max(4, Math.ceil(cleanTarget.length * 0.72)));
  const stem = cleanTarget.slice(0, stemLen);
  const root6 = cleanTarget.length >= 7 ? cleanTarget.slice(0, cleanTarget.length - 3) : stem;

  clue = clue.replace(/\b[A-Za-zÀ-ÖØ-öø-ÿ]{3,}\b/g, (token) => {
    const normTok = stripAccentLower(token);
    if (
      normTok === cleanTarget ||
      (stem.length >= 4 && normTok.startsWith(stem) && Math.abs(normTok.length - cleanTarget.length) <= 8) ||
      (root6.length >= 5 && normTok.startsWith(root6))
    ) {
      return '_____';
    }
    return token;
  });

  // Avoid ugly double-blanks if masking happened
  return clue.replace(/(\b_____)\s*\1/g, '_____').trim();
}

interface RawBuildCandidate {
  kind: 'vocab' | 'word_find' | 'grammar';
  grade: SchoolGrade;
  category: string;
  promptEn: string;
  questionFr: string;
  answer: string;
  distractors: string[];
  explanationFr: string;
  audioText: string;
  phonetic?: string;
  isNew5000Bank: boolean;
}

function buildCandidates(): RawBuildCandidate[] {
  const candidates: RawBuildCandidate[] = [];

  // 1. Parse Part 1 pipe-delimited raw rows
  const rawLines = CITY_BANK_5000_PART1_RAW.split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));

  for (const line of rawLines) {
    const parts = line.split('|');
    if (parts.length < 8) continue;
    const [rawKind, rawGrade, category, promptEn, questionFr, answer, distRaw, explanationFr, audioText] = parts;
    const kind = rawKind === 'word_find' ? 'word_find' : 'vocab';
    const cleanAns = (answer || '').trim();
    const distractors = (distRaw || '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && normalizeBankKey(s) !== normalizeBankKey(cleanAns));

    candidates.push({
      kind,
      grade: toValidGrade(rawGrade),
      category: category || 'Lexique Général',
      promptEn: (promptEn || '').trim(),
      questionFr: (questionFr || '').trim(),
      answer: cleanAns,
      distractors,
      explanationFr: (explanationFr || '').trim(),
      audioText: (audioText || promptEn || cleanAns).trim(),
      isNew5000Bank: true
    });
  }

  // 2. Parse all structured CompactVocabGroup modules (Parts 1..13)
  const allGroups: CompactVocabGroup[] = [
    ...CITY_BANK_5000_PART1_GROUPS,
    ...CITY_BANK_5000_PART2_GROUPS,
    ...CITY_BANK_5000_PART3_GROUPS,
    ...CITY_BANK_5000_PART4_GROUPS,
    ...CITY_BANK_5000_PART5_GROUPS,
    ...CITY_BANK_5000_PART6_GROUPS,
    ...CITY_BANK_5000_PART7_GROUPS,
    ...CITY_BANK_5000_PART8_GROUPS,
    ...CITY_BANK_5000_PART9_GROUPS,
    ...CITY_BANK_5000_PART10_GROUPS,
    ...CITY_BANK_5000_PART11_GROUPS,
    ...CITY_BANK_5000_PART12_GROUPS,
    ...CITY_BANK_5000_PART13_GROUPS
  ];

  // Build global sibling pools by (kind + grade) for shape- & length-matched distractors
  const groupBackupAnswers: Record<string, string[]> = {};
  for (const g of allGroups) {
    const bucketKey = `${g.kind}:${g.grade}`;
    if (!groupBackupAnswers[bucketKey]) groupBackupAnswers[bucketKey] = [];
    for (const row of g.items) {
      const targetAns = g.kind === 'word_find' ? cleanLettersOnly(row[0]) : extractOptionNote(row[1]).clean;
      if (targetAns) groupBackupAnswers[bucketKey].push(targetAns);
    }
  }

  for (const g of allGroups) {
    const items = g.items;
    const sameCategoryAnswers = items.map((r) =>
      g.kind === 'word_find' ? cleanLettersOnly(r[0]) : extractOptionNote(r[1]).clean
    );
    const fallbackAnswers = groupBackupAnswers[`${g.kind}:${g.grade}`] || [];

    items.forEach(([colA, colB, colC], idx) => {
      if (g.kind === 'word_find') {
        const cleanWord = cleanLettersOnly(colA);
        if (cleanWord.length < 3 || cleanWord.length > 14) return;
        const safeClue = sanitizeWordFindClue(cleanWord, colB);
        candidates.push({
          kind: 'word_find',
          grade: g.grade,
          category: g.category,
          promptEn: cleanWord,
          questionFr: safeClue,
          answer: cleanWord,
          distractors: [],
          explanationFr: `Le mot exact est « ${cleanWord} » — ${colB.trim()}`,
          audioText: cleanWord.toLowerCase(),
          phonetic: colC,
          isNew5000Bank: true
        });
        return;
      }

      const { clean: cleanAns, note: ansNote } = extractOptionNote(colB);
      const combinedPool = [...sameCategoryAnswers, ...fallbackAnswers];
      const distractors = pickShapeMatchedDistractors(cleanAns, combinedPool, idx, 3);
      const noteSuffix = ansNote && !/(faux ami|prétérit|attention|et non)/i.test(ansNote) ? ` (${ansNote})` : '';
      const extraExplain = ansNote ? ` Note : ${ansNote}.` : '';

      if (g.kind === 'en_fr') {
        const cleanTerm = colA.replace(/\s*\([^)]*\)$/, '').trim();
        candidates.push({
          kind: 'vocab',
          grade: g.grade,
          category: g.category,
          promptEn: colA.trim(),
          questionFr: `Quelle est la traduction exacte de « ${colA.trim()} » ?`,
          answer: cleanAns,
          distractors,
          explanationFr: colC
            ? `« ${colA.trim()} » signifie « ${cleanAns}${noteSuffix} ». ${colC}${extraExplain}`
            : `« ${colA.trim()} » correspond en français à « ${cleanAns}${noteSuffix} ».${extraExplain}`,
          audioText: cleanTerm,
          isNew5000Bank: true
        });
      } else {
        // fr_en
        candidates.push({
          kind: 'vocab',
          grade: g.grade,
          category: g.category,
          promptEn: colA.trim(),
          questionFr: `Comment exprime-t-on « ${colA.trim()} » en anglais ?`,
          answer: cleanAns,
          distractors,
          explanationFr: colC
            ? `En anglais, on dit « ${cleanAns}${noteSuffix} ». ${colC}${extraExplain}`
            : `La formulation anglaise exacte est « ${cleanAns}${noteSuffix} ».${extraExplain}`,
          audioText: cleanAns,
          isNew5000Bank: true
        });
      }
    });
  }

  // 3. Parse CompactGrammarItems across Parts 1..12
  const allGrammar: CompactGrammarItem[] = [
    ...CITY_BANK_5000_PART1_GRAMMAR,
    ...CITY_BANK_5000_PART2_GRAMMAR,
    ...CITY_BANK_5000_PART3_GRAMMAR,
    ...CITY_BANK_5000_PART4_GRAMMAR,
    ...CITY_BANK_5000_PART5_GRAMMAR,
    ...CITY_BANK_5000_PART10_GRAMMAR,
    ...CITY_BANK_5000_PART11_GRAMMAR,
    ...CITY_BANK_5000_PART12_GRAMMAR
  ];

  for (const gr of allGrammar) {
    candidates.push({
      kind: 'grammar',
      grade: gr.grade,
      category: gr.category,
      promptEn: gr.promptEn,
      questionFr: gr.questionFr,
      answer: gr.answer,
      distractors: [...gr.distractors],
      explanationFr: gr.explanationFr,
      audioText: gr.audioText || gr.promptEn.replace('___', gr.answer),
      isNew5000Bank: true
    });
  }

  // 4. Tap ALL existing curriculum & game banks (deduped below!)
  // 4a. SPACED_REPETITION_500 (500 detailed Oxford cards across 6e..terminale)
  const srByGrade: Record<string, string[]> = {};
  for (const card of SPACED_REPETITION_500) {
    if (!srByGrade[card.gradeLevel]) srByGrade[card.gradeLevel] = [];
    srByGrade[card.gradeLevel].push(extractOptionNote(card.frenchDef).clean);
  }
  SPACED_REPETITION_500.forEach((card, i) => {
    const pool = srByGrade[card.gradeLevel] || [];
    const { clean: cleanAns } = extractOptionNote(card.frenchDef);
    const dists = pickShapeMatchedDistractors(cleanAns, pool, i, 3);
    candidates.push({
      kind: 'vocab',
      grade: card.gradeLevel,
      category: `Répertoire · ${card.category}`,
      promptEn: `${card.term} (${card.phonetic})`,
      questionFr: `Quelle définition correspond au terme « ${card.term} » ?`,
      answer: cleanAns,
      distractors: dists,
      explanationFr: `${card.term} (${card.phonetic}) — ${card.frenchDef} Ex. (${card.pressSource}) : ${card.pressExcerpt}`,
      audioText: card.pressExcerpt || card.term,
      phonetic: card.phonetic,
      isNew5000Bank: false
    });
  });

  // 4b. ALL_200_LESSONS (2,280 vocab + 670 quiz)
  const lessonVocabPoolByGrade: Record<string, string[]> = {};
  for (const les of ALL_200_LESSONS) {
    if (!lessonVocabPoolByGrade[les.class_level]) lessonVocabPoolByGrade[les.class_level] = [];
    for (const v of les.vocabulary || []) {
      lessonVocabPoolByGrade[les.class_level].push(extractOptionNote(v.translation_fr).clean);
    }
  }

  for (const les of ALL_200_LESSONS) {
    const lesVocab = les.vocabulary || [];
    const sameLesAnswers = lesVocab.map((item) => extractOptionNote(item.translation_fr).clean);
    const gradePool = lessonVocabPoolByGrade[les.class_level] || [];

    lesVocab.forEach((v, idx) => {
      const { clean: cleanAns } = extractOptionNote(v.translation_fr);
      const dists = pickShapeMatchedDistractors(cleanAns, [...sameLesAnswers, ...gradePool], idx, 3);

      candidates.push({
        kind: 'vocab',
        grade: les.class_level,
        category: `Leçon · ${les.title}`,
        promptEn: `${v.term} (${v.part_of_speech || 'lexique'})`,
        questionFr: `Quelle est la traduction de « ${v.term} » ?`,
        answer: cleanAns,
        distractors: dists,
        explanationFr: `« ${v.term} » (${v.phonetic || ''}) signifie « ${v.translation_fr} ». Ex : ${v.example_en} (${v.example_fr})`,
        audioText: v.example_en || v.term,
        phonetic: v.phonetic,
        isNew5000Bank: false
      });

      const cleanAlpha = cleanLettersOnly(v.term);
      if (!v.term.includes(' ') && cleanAlpha.length >= 4 && cleanAlpha.length <= 12) {
        const escapedTerm = v.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const strippedRoot = cleanAlpha.length >= 7 ? cleanAlpha.replace(/(?:ING|TION|MENT|NESS|ABLE)$/i, '') : '';
        let maskedEn = v.example_en
          .replace(new RegExp(`${escapedTerm}[a-z]*`, 'gi'), '_____')
          .replace(new RegExp(cleanAlpha, 'gi'), '_____');
        if (strippedRoot.length >= 5) {
          maskedEn = maskedEn.replace(new RegExp(`\\b${strippedRoot}[a-z]*\\b`, 'gi'), '_____');
        }

        // Check if v.translation_fr leaks a French cognate stem of cleanAlpha
        const stem = cleanAlpha.toLowerCase().slice(0, Math.min(cleanAlpha.length, Math.max(4, Math.ceil(cleanAlpha.length * 0.7))));
        const normTrans = stripAccentLower(v.translation_fr);
        const leaksWord = normTrans.includes(cleanAlpha.toLowerCase()) || (stem.length >= 4 && normTrans.includes(stem));

        let wfClue: string;
        if (leaksWord && maskedEn.includes('_____')) {
          const maskedFr = sanitizeWordFindClue(cleanAlpha, v.translation_fr);
          wfClue = `${maskedFr.includes('_____') ? `Indice contextuel (${cleanAlpha.length} lettres)` : maskedFr} — Ex : ${maskedEn}`;
        } else {
          wfClue = `${sanitizeWordFindClue(cleanAlpha, v.translation_fr)} — Ex : ${maskedEn}`;
        }

        candidates.push({
          kind: 'word_find',
          grade: les.class_level,
          category: `Orthographe · ${les.class_level}`,
          promptEn: cleanAlpha,
          questionFr: wfClue,
          answer: cleanAlpha,
          distractors: [],
          explanationFr: `Le mot recherché est « ${cleanAlpha} » (${v.translation_fr}).`,
          audioText: v.term,
          phonetic: v.phonetic,
          isNew5000Bank: false
        });
      }
    });

    for (const q of les.quiz || []) {
      const correct = q.options[q.correct_index] || q.options[0];
      if (!correct) continue;
      const dists = q.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(correct)).slice(0, 3);
      candidates.push({
        kind: 'grammar',
        grade: les.class_level,
        category: les.grammar?.title ? `Grammaire · ${les.class_level}` : `Quiz · ${les.class_level}`,
        promptEn: les.title,
        questionFr: q.question,
        answer: correct,
        distractors: dists,
        explanationFr: q.explanation,
        audioText: correct,
        isNew5000Bank: false
      });
    }
  }

  // 4c. GRAMMAR_6E_ITEMS (50+ syntax items with realistic grammatical error traps)
  for (const g of GRAMMAR_6E_ITEMS) {
    const correctSentence = g.exercise.correct_tokens.join(' ').replace(/\s+([?.!,])/g, '$1');
    const distractors = buildGrammar6eDistractors(g.exercise.correct_tokens, correctSentence);
    candidates.push({
      kind: 'grammar',
      grade: '6e',
      category: `Syntaxe · ${g.category}`,
      promptEn: g.structure_formula,
      questionFr: `Comment formule-t-on correctement : « ${g.exercise.french_prompt} » ?`,
      answer: correctSentence,
      distractors,
      explanationFr: `${g.rule} — ${g.exercise.explanation}`,
      audioText: correctSentence,
      isNew5000Bank: false
    });
  }

  // 4d. SPEED_MATCH banks
  const speedBanks: Array<{ grade: SchoolGrade; list: typeof SPEED_MATCH_DEBUTANT_BANK }> = [
    { grade: '6e', list: SPEED_MATCH_DEBUTANT_BANK },
    { grade: '4e', list: SPEED_MATCH_INTERMEDIAIRE_BANK },
    { grade: '2nde', list: SPEED_MATCH_AVANCE_BANK }
  ];
  for (const sb of speedBanks) {
    const pool = sb.list.map((p) => p.fr);
    sb.list.forEach((pair, idx) => {
      const dists = pickShapeMatchedDistractors(pair.fr, pool, idx, 3);
      candidates.push({
        kind: 'vocab',
        grade: sb.grade,
        category: `Vocabulaire Rapide · ${sb.grade}`,
        promptEn: pair.en,
        questionFr: `Traduisez « ${pair.en} » en français :`,
        answer: pair.fr,
        distractors: dists,
        explanationFr: `${pair.en} = ${pair.fr} (${pair.hint})`,
        audioText: pair.en,
        isNew5000Bank: false
      });
    });
  }

  // 4e. VERB_MASTER banks
  const verbBanks: Array<{ grade: SchoolGrade; list: typeof VERB_MASTER_DEBUTANT_BANK }> = [
    { grade: '5e', list: VERB_MASTER_DEBUTANT_BANK },
    { grade: '4e', list: VERB_MASTER_INTERMEDIAIRE_BANK },
    { grade: '3e', list: VERB_MASTER_AVANCE_BANK },
    { grade: '2nde', list: VERB_MASTER_EXPERT_BANK },
    { grade: '1re', list: VERB_MASTER_EXPERT_AVANCE_BANK },
    { grade: 'terminale', list: VERB_MASTER_MASTER_BANK }
  ];
  for (const vb of verbBanks) {
    const pool = vb.list.map((other) => `${other.preterite} / ${other.pastParticiple}`);
    vb.list.forEach((v, idx) => {
      const ans = `${v.preterite} / ${v.pastParticiple}`;
      const dists = pickShapeMatchedDistractors(ans, pool, idx, 3);
      candidates.push({
        kind: 'grammar',
        grade: vb.grade,
        category: `Verbes Irréguliers · ${v.category}`,
        promptEn: `to ${v.infinitive.toLowerCase()} (${v.translation})`,
        questionFr: `Quels sont le prétérit et le participe passé de « ${v.infinitive} » ?`,
        answer: ans,
        distractors: dists,
        explanationFr: `Verbe « ${v.infinitive} » (${v.translation}) : prétérit « ${v.preterite} », participe passé « ${v.pastParticiple} ».`,
        audioText: `${v.infinitive}, ${v.preterite}, ${v.pastParticiple}`,
        isNew5000Bank: false
      });
    });
  }

  // 4f. ASTRO_HANGMAN + WORD_SCRAMBLE + SPELLING_BEE + CURIOSITIES (Word-find)
  const wordFindBanks: Array<{ grade: SchoolGrade; items: Array<{ word: string; clue: string; exp: string }> }> = [
    {
      grade: '6e',
      items: [
        ...WORD_SCRAMBLE_DEBUTANT_BANK.map((w) => ({ word: w.word, clue: `${w.clue} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` })),
        ...ASTRO_HANGMAN_DEBUTANT_BANK.map((w) => ({ word: w.word, clue: `${w.hint} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` }))
      ]
    },
    {
      grade: '5e',
      items: ASTRO_HANGMAN_INTERMEDIAIRE_BANK.map((w) => ({ word: w.word, clue: `${w.hint} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` }))
    },
    {
      grade: '4e',
      items: [
        ...WORD_SCRAMBLE_INTERMEDIAIRE_BANK.map((w) => ({ word: w.word, clue: `${w.clue} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` })),
        ...ASTRO_HANGMAN_EXPERT_BANK.map((w) => ({ word: w.word, clue: `${w.hint} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` }))
      ]
    },
    {
      grade: '3e',
      items: WORD_SCRAMBLE_EXPERT_BANK.map((w) => ({ word: w.word, clue: `${w.clue} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` }))
    },
    {
      grade: '2nde',
      items: [
        ...WORD_SCRAMBLE_EXPERT_AVANCE_BANK.map((w) => ({ word: w.word, clue: `${w.clue} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` })),
        ...ASTRO_HANGMAN_EXPERT_AVANCE_BANK.map((w) => ({ word: w.word, clue: `${w.hint} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` }))
      ]
    },
    {
      grade: '1re',
      items: [
        ...SPELLING_BEE_ITEMS.map((w) => ({ word: w.word, clue: `${w.clue} (${w.phonetic})`, exp: `« ${w.word} » (${w.phonetic}) : ${w.clue}.` })),
        ...CURIOSITIES.map((c) => ({ word: c.term, clue: `${c.frenchDef} (${c.etymology})`, exp: `« ${c.term} » : ${c.frenchDef}` }))
      ]
    },
    {
      grade: 'terminale',
      items: [
        ...WORD_SCRAMBLE_MASTER_BANK.map((w) => ({ word: w.word, clue: `${w.clue} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` })),
        ...ASTRO_HANGMAN_MASTER_BANK.map((w) => ({ word: w.word, clue: `${w.hint} (${w.translation})`, exp: `« ${w.word} » = ${w.translation}.` }))
      ]
    }
  ];
  for (const wf of wordFindBanks) {
    for (const item of wf.items) {
      const clean = cleanLettersOnly(item.word);
      if (clean.length < 3 || clean.length > 14) continue;
      candidates.push({
        kind: 'word_find',
        grade: wf.grade,
        category: `Forge des Lettres · ${wf.grade}`,
        promptEn: clean,
        questionFr: sanitizeWordFindClue(clean, item.clue),
        answer: clean,
        distractors: [],
        explanationFr: item.exp,
        audioText: clean.toLowerCase(),
        isNew5000Bank: false
      });
    }
  }

  // 4g. Specialty MCQ banks (Fill the blank, Antonym/Synonym, UK/US, Idioms, Riddles, Advanced Quiz)
  for (const fb of FILL_THE_BLANK_ITEMS) {
    candidates.push({
      kind: 'grammar',
      grade: '4e',
      category: 'Prépositions & Syntaxe',
      promptEn: fb.sentence,
      questionFr: 'Choisissez le mot manquant pour compléter cette phrase anglaise :',
      answer: fb.correct,
      distractors: fb.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(fb.correct)),
      explanationFr: fb.rule,
      audioText: fb.sentence.replace('___', fb.correct),
      isNew5000Bank: false
    });
  }
  for (const syn of ANTONYM_SYNONYM_ITEMS) {
    candidates.push({
      kind: 'vocab',
      grade: '2nde',
      category: syn.type === 'SYNONYME' ? 'Synonyme Précis' : 'Antonyme Exact',
      promptEn: syn.target,
      questionFr: `Sélectionnez le ${syn.type.toLowerCase()} de « ${syn.target} » :`,
      answer: syn.correct,
      distractors: syn.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(syn.correct)),
      explanationFr: syn.explanation,
      audioText: `${syn.target}. ${syn.correct}`,
      isNew5000Bank: false
    });
  }

  const extraUkDist: Record<string, string> = {
    'Apartment 🇺🇸': 'Condo 🇺🇸',
    'Cookies 🇺🇸': 'Crackers 🇺🇸',
    'Chips 🇺🇸': 'Pretzels 🇺🇸',
    'Fall 🇺🇸': 'Summer 🇺🇸'
  };
  for (const uk of UK_VS_US_ITEMS) {
    const dists = uk.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(uk.correct));
    if (dists.length < 3 && extraUkDist[uk.correct]) {
      dists.push(extraUkDist[uk.correct]);
    }
    candidates.push({
      kind: 'vocab',
      grade: '4e',
      category: 'Culture UK / US',
      promptEn: uk.uk,
      questionFr: `Quel est l’équivalent américain de « ${uk.uk} » ?`,
      answer: uk.correct,
      distractors: dists,
      explanationFr: uk.explanation,
      audioText: uk.uk.replace(/🇬🇧|🇺🇸/g, '').trim(),
      isNew5000Bank: false
    });
  }

  const extraIdiomDist: Record<string, string> = {
    'Quelque chose de très facile': 'Une surprise très agréable',
    'Très rarement': 'À chaque nouvelle saison',
    'Coûter les yeux de la tête': 'Demander un effort physique',
    'Bonne chance !': 'Fais très attention à toi !'
  };
  for (const idiom of IDIOM_HUNTER_ITEMS) {
    const { clean: cleanIdiomAns, note: idiomNote } = extractOptionNote(idiom.correct);
    const dists = idiom.options
      .map((o) => extractOptionNote(o).clean)
      .filter((o) => normalizeBankKey(o) !== normalizeBankKey(cleanIdiomAns));
    if (dists.length < 3 && extraIdiomDist[cleanIdiomAns]) {
      dists.push(extraIdiomDist[cleanIdiomAns]);
    }
    candidates.push({
      kind: 'vocab',
      grade: '3e',
      category: 'Expression Idiomatique',
      promptEn: idiom.idiom,
      questionFr: `Que signifie l’expression « ${idiom.idiom} » ?`,
      answer: cleanIdiomAns,
      distractors: dists,
      explanationFr: `${idiomNote ? `(${idiomNote}) ` : ''}Sens littéral : « ${idiom.literal} ». En contexte : ${idiom.example}`,
      audioText: idiom.idiom,
      isNew5000Bank: false
    });
  }

  for (const rid of RIDDLE_ITEMS) {
    candidates.push({
      kind: 'vocab',
      grade: '3e',
      category: 'Énigme Lexicale',
      promptEn: rid.riddle,
      questionFr: 'Résolvez cette énigme traditionnelle en anglais :',
      answer: rid.correct,
      distractors: rid.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(rid.correct)),
      explanationFr: rid.explanation,
      audioText: rid.riddle,
      isNew5000Bank: false
    });
  }
  for (const q of QUIZ_QUESTIONS) {
    const correct = q.options.find((o) => o.isCorrect) || q.options[0];
    if (!correct) continue;
    candidates.push({
      kind: 'grammar',
      grade: '1re',
      category: `Rhétorique · ${q.category}`,
      promptEn: q.promptSentence,
      questionFr: q.questionText,
      answer: correct.text,
      distractors: q.options.filter((o) => !o.isCorrect).map((o) => o.text),
      explanationFr: correct.explanation,
      audioText: q.promptSentence,
      isNew5000Bank: false
    });
  }

  return candidates;
}

// Strict zero-duplicate filter, cognate trap transformation, option sanitization & balanced assignment across 600 levels
const BUILD_RESULT = (() => {
  const raw = buildCandidates();
  const seenQuestions = new Set<string>();
  const seenAnswers = new Set<string>();
  const deduped: Array<RawBuildCandidate & { questionKey: string; answerKey: string }> = [];

  for (const orig of raw) {
    if (!orig.answer || !orig.questionFr) continue;

    let item = { ...orig, distractors: [...orig.distractors] };

    if (item.kind !== 'word_find') {
      // 1. Strip any parenthetical giveaway hints from answer & distractors
      const { clean: cleanAns, note: ansNote } = extractOptionNote(item.answer);
      const safeNote =
        ansNote && !/(faux ami|prétérit|attention|et non|draw|merde)/i.test(ansNote) ? ansNote : '';

      // Clean distractors too
      item.distractors = item.distractors
        .map((d) => extractOptionNote(d).clean)
        .filter((d) => d && normalizeBankKey(d) !== normalizeBankKey(cleanAns));

      if (cleanAns !== item.answer) {
        if (seenAnswers.has(computeAnswerKey(cleanAns)) && safeNote) {
          item.answer = `${cleanAns} — ${safeNote}`;
        } else {
          item.answer = cleanAns;
        }
        if (ansNote && !item.explanationFr.includes(ansNote)) {
          item.explanationFr = `${item.explanationFr} (${ansNote})`.trim();
        }
      }

      // 2. Transform transparent single-word cognates into English Orthography & Precision traps
      if (item.kind === 'vocab') {
        const promptNoPhon = item.promptEn
          .replace(/\s*\(\/[^)]+\/\)\s*$/, '')
          .replace(/\s*\((?:Noun|Verb|Adjective|Adverb|lexique)\)\s*$/i, '')
          .trim();

        // Case A: en -> fr cognate (English leaked in promptEn -> flip to spelling trap!)
        const enFrCog = isTransparentSingleWordCognate(promptNoPhon, item.answer);
        if (enFrCog) {
          const traps = generateSpellingTrapDistractors(enFrCog.enClean);
          if (traps.length >= 3) {
            const flippedAKey = computeAnswerKey(enFrCog.enClean);
            if (!seenAnswers.has(flippedAKey)) {
              item.category = `Orthographe & Précision · ${item.grade}`;
              item.promptEn = '';
              item.questionFr = `Comment s’écrit correctement en anglais le terme « ${enFrCog.frClean} » ?`;
              item.answer = enFrCog.enClean;
              item.distractors = traps;
              item.explanationFr = `Orthographe exacte : « ${enFrCog.enClean} » (${enFrCog.frClean}). Attention aux pièges de consonnes doubles ou de terminaisons franco-anglaises.`;
              item.audioText = enFrCog.enClean;
            } else {
              continue; // Avoid keeping a bare identical cognate when the target spelling is already tested
            }
          }
        } else {
          // Case B: fr -> en cognate (answer is English cognate of French promptEn -> give spelling trap distractors)
          const frEnCog = isTransparentSingleWordCognate(item.answer, promptNoPhon);
          if (frEnCog) {
            const traps = generateSpellingTrapDistractors(frEnCog.enClean);
            if (traps.length >= 3) {
              item.distractors = traps;
              item.explanationFr = `Orthographe exacte : « ${frEnCog.enClean} » (${frEnCog.frClean}). ${item.explanationFr}`;
            }
          }
        }

        if (item.promptEn && normalizeBankKey(promptNoPhon) === normalizeBankKey(item.answer)) {
          continue;
        }
      }
    }

    const qKey = computeQuestionKey({
      type: item.kind === 'word_find' ? 'word_find' : 'mcq',
      promptEn: item.promptEn,
      questionFr: item.questionFr,
      targetWord: item.kind === 'word_find' ? item.answer : undefined
    });
    const aKey = computeAnswerKey(item.answer);

    if (seenQuestions.has(qKey) || seenAnswers.has(aKey)) {
      continue;
    }
    seenQuestions.add(qKey);
    seenAnswers.add(aKey);
    deduped.push({ ...item, questionKey: qKey, answerKey: aKey });
  }

  // Assign each unique entry evenly across levels [startLevel..endLevel] within its grade tier
  const gradeCounters: Record<SchoolGrade, number> = {
    '6e': 0,
    '5e': 0,
    '4e': 0,
    '3e': 0,
    '2nde': 0,
    '1re': 0,
    terminale: 0
  };

  let newBankCount = 0;
  const entries: CityBankEntry[] = deduped.map((item, globalIdx) => {
    const [startLvl, endLvl] = GRADE_LEVEL_RANGES[item.grade];
    const span = endLvl - startLvl + 1;
    const cursor = gradeCounters[item.grade]++;
    const assignedLevel = startLvl + (cursor % span);
    if (item.isNew5000Bank) newBankCount++;

    return {
      id: `cb5k-${item.grade}-${globalIdx + 1}`,
      kind: item.kind,
      grade: item.grade,
      assignedLevel,
      category: item.category,
      promptEn: item.promptEn,
      questionFr: item.questionFr,
      answer: item.answer,
      distractors: item.distractors,
      explanationFr: item.explanationFr,
      audioText: item.audioText,
      phonetic: item.phonetic,
      questionKey: item.questionKey,
      answerKey: item.answerKey
    };
  });

  // Pre-index entries by levelNumber (1..600) and by grade
  const byLevel = new Map<number, CityBankEntry[]>();
  const byGrade = new Map<SchoolGrade, CityBankEntry[]>();

  for (let lvl = 1; lvl <= 600; lvl++) {
    byLevel.set(lvl, []);
  }
  for (const grade of Object.keys(GRADE_LEVEL_RANGES) as SchoolGrade[]) {
    byGrade.set(grade, []);
  }

  for (const entry of entries) {
    byLevel.get(entry.assignedLevel)?.push(entry);
    byGrade.get(entry.grade)?.push(entry);
  }

  return { entries, byLevel, byGrade, newBankCount };
})();

export const CITY_BANK_5000_ITEMS: CityBankEntry[] = BUILD_RESULT.entries;

export function getLevelDedicatedItems(levelNumber: number): CityBankEntry[] {
  return BUILD_RESULT.byLevel.get(levelNumber) || [];
}

export function getGradeBankItems(grade: SchoolGrade): CityBankEntry[] {
  return BUILD_RESULT.byGrade.get(grade) || [];
}

export function getBank5000Stats(): {
  totalUniqueItems: number;
  new5000BankCount: number;
  coveredLevelsCount: number;
  minPerLevel: number;
  maxPerLevel: number;
} {
  let coveredLevelsCount = 0;
  let minPerLevel = Infinity;
  let maxPerLevel = 0;
  for (let lvl = 1; lvl <= 600; lvl++) {
    const count = (BUILD_RESULT.byLevel.get(lvl) || []).length;
    if (count > 0) coveredLevelsCount++;
    if (count < minPerLevel) minPerLevel = count;
    if (count > maxPerLevel) maxPerLevel = count;
  }
  return {
    totalUniqueItems: BUILD_RESULT.entries.length,
    new5000BankCount: BUILD_RESULT.newBankCount,
    coveredLevelsCount,
    minPerLevel: minPerLevel === Infinity ? 0 : minPerLevel,
    maxPerLevel
  };
}
