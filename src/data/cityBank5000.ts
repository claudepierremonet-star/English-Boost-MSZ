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
    const distractors = (distRaw || '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && normalizeBankKey(s) !== normalizeBankKey(answer));

    candidates.push({
      kind,
      grade: toValidGrade(rawGrade),
      category: category || 'Lexique Général',
      promptEn: (promptEn || '').trim(),
      questionFr: (questionFr || '').trim(),
      answer: (answer || '').trim(),
      distractors,
      explanationFr: (explanationFr || '').trim(),
      audioText: (audioText || promptEn || answer).trim(),
      isNew5000Bank: true
    });
  }

  // 2. Parse all structured CompactVocabGroup modules (Parts 1..12)
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

  // Build global sibling pools by (kind + grade) for rich, domain-accurate distractors
  const groupBackupAnswers: Record<string, string[]> = {};
  for (const g of allGroups) {
    const bucketKey = `${g.kind}:${g.grade}`;
    if (!groupBackupAnswers[bucketKey]) groupBackupAnswers[bucketKey] = [];
    for (const row of g.items) {
      const targetAns = g.kind === 'word_find' ? cleanLettersOnly(row[0]) : row[1].trim();
      if (targetAns) groupBackupAnswers[bucketKey].push(targetAns);
    }
  }

  for (const g of allGroups) {
    const items = g.items;
    const sameCategoryAnswers = items.map((r) => (g.kind === 'word_find' ? cleanLettersOnly(r[0]) : r[1].trim()));
    const fallbackAnswers = groupBackupAnswers[`${g.kind}:${g.grade}`] || [];

    items.forEach(([colA, colB, colC], idx) => {
      if (g.kind === 'word_find') {
        const cleanWord = cleanLettersOnly(colA);
        if (cleanWord.length < 3 || cleanWord.length > 14) return;
        candidates.push({
          kind: 'word_find',
          grade: g.grade,
          category: g.category,
          promptEn: cleanWord,
          questionFr: colB.trim(),
          answer: cleanWord,
          distractors: [],
          explanationFr: `Le mot exact est « ${cleanWord} » — ${colB.trim()}`,
          audioText: cleanWord.toLowerCase(),
          phonetic: colC,
          isNew5000Bank: true
        });
        return;
      }

      const answer = colB.trim();
      const normAns = normalizeBankKey(answer);
      const distractors: string[] = [];
      const seenDist = new Set<string>([normAns]);

      // Deterministic stride picking inside same semantic category first
      for (let step = 1; step < sameCategoryAnswers.length && distractors.length < 3; step++) {
        const pick = sameCategoryAnswers[(idx + step * 7) % sameCategoryAnswers.length];
        const np = normalizeBankKey(pick);
        if (pick && !seenDist.has(np)) {
          seenDist.add(np);
          distractors.push(pick);
        }
      }
      for (let step = 0; step < fallbackAnswers.length && distractors.length < 3; step++) {
        const pick = fallbackAnswers[(idx * 5 + step * 11) % fallbackAnswers.length];
        const np = normalizeBankKey(pick);
        if (pick && !seenDist.has(np)) {
          seenDist.add(np);
          distractors.push(pick);
        }
      }

      if (g.kind === 'en_fr') {
        const cleanTerm = colA.replace(/\s*\([^)]*\)$/, '').trim();
        candidates.push({
          kind: 'vocab',
          grade: g.grade,
          category: g.category,
          promptEn: colA.trim(),
          questionFr: `Quelle est la traduction exacte de « ${colA.trim()} » ?`,
          answer,
          distractors,
          explanationFr: colC
            ? `« ${colA.trim()} » signifie « ${answer} ». ${colC}`
            : `« ${colA.trim()} » correspond en français à « ${answer} ».`,
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
          answer,
          distractors,
          explanationFr: colC
            ? `En anglais, on dit « ${answer} ». ${colC}`
            : `La formulation anglaise exacte est « ${answer} ».`,
          audioText: answer,
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
    srByGrade[card.gradeLevel].push(card.frenchDef);
  }
  SPACED_REPETITION_500.forEach((card, i) => {
    const pool = srByGrade[card.gradeLevel] || [];
    const dists: string[] = [];
    const seen = new Set([normalizeBankKey(card.frenchDef)]);
    for (let s = 1; s < pool.length && dists.length < 3; s++) {
      const candidate = pool[(i + s * 3) % pool.length];
      const nk = normalizeBankKey(candidate);
      if (!seen.has(nk)) {
        seen.add(nk);
        dists.push(candidate);
      }
    }
    candidates.push({
      kind: 'vocab',
      grade: card.gradeLevel,
      category: `Répertoire · ${card.category}`,
      promptEn: `${card.term} (${card.phonetic})`,
      questionFr: `Quelle définition correspond au terme « ${card.term} » ?`,
      answer: card.frenchDef,
      distractors: dists,
      explanationFr: `${card.term} (${card.phonetic}) — ${card.frenchDef} Ex. (${card.pressSource}) : ${card.pressExcerpt}`,
      audioText: card.pressExcerpt || card.term,
      phonetic: card.phonetic,
      isNew5000Bank: false
    });
  });

  // 4b. ALL_200_LESSONS (2,280 vocab + 670 quiz)
  for (const les of ALL_200_LESSONS) {
    const lesVocab = les.vocabulary || [];
    lesVocab.forEach((v, idx) => {
      const dists: string[] = [];
      const seen = new Set([normalizeBankKey(v.translation_fr)]);
      for (let s = 1; s < lesVocab.length && dists.length < 3; s++) {
        const cand = lesVocab[(idx + s) % lesVocab.length].translation_fr;
        const nk = normalizeBankKey(cand);
        if (!seen.has(nk)) {
          seen.add(nk);
          dists.push(cand);
        }
      }
      candidates.push({
        kind: 'vocab',
        grade: les.class_level,
        category: `Leçon · ${les.title}`,
        promptEn: `${v.term} (${v.part_of_speech || 'lexique'})`,
        questionFr: `Quelle est la traduction de « ${v.term} » ?`,
        answer: v.translation_fr,
        distractors: dists,
        explanationFr: `« ${v.term} » (${v.phonetic || ''}) signifie « ${v.translation_fr} ». Ex : ${v.example_en} (${v.example_fr})`,
        audioText: v.example_en || v.term,
        phonetic: v.phonetic,
        isNew5000Bank: false
      });

      const cleanAlpha = cleanLettersOnly(v.term);
      if (!v.term.includes(' ') && cleanAlpha.length >= 4 && cleanAlpha.length <= 12) {
        candidates.push({
          kind: 'word_find',
          grade: les.class_level,
          category: `Orthographe · ${les.class_level}`,
          promptEn: cleanAlpha,
          questionFr: `${v.translation_fr} — Ex : ${v.example_en.replace(new RegExp(v.term, 'gi'), '_____')}`,
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

  // 4c. GRAMMAR_6E_ITEMS (50 syntax items)
  for (const g of GRAMMAR_6E_ITEMS) {
    const correctSentence = g.exercise.correct_tokens.join(' ').replace(/\s+([?.!,])/g, '$1');
    const tokens = [...g.exercise.correct_tokens];
    const swapped1 =
      tokens.length > 2
        ? [tokens[1], tokens[0], ...tokens.slice(2)].join(' ').replace(/\s+([?.!,])/g, '$1')
        : `${correctSentence} not`;
    const swapped2 =
      tokens.length > 3
        ? [...tokens.slice(0, -2), tokens[tokens.length - 1], tokens[tokens.length - 2]]
            .join(' ')
            .replace(/\s+([?.!,])/g, '$1')
        : `Is ${correctSentence.toLowerCase()}`;
    const swapped3 = `Always ${correctSentence.toLowerCase()}`;
    candidates.push({
      kind: 'grammar',
      grade: '6e',
      category: `Syntaxe · ${g.category}`,
      promptEn: g.structure_formula,
      questionFr: `Comment formule-t-on correctement : « ${g.exercise.french_prompt} » ?`,
      answer: correctSentence,
      distractors: [swapped1, swapped2, swapped3],
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
    sb.list.forEach((pair, idx) => {
      const dists: string[] = [];
      const seen = new Set([normalizeBankKey(pair.fr)]);
      for (let s = 1; s < sb.list.length && dists.length < 3; s++) {
        const cand = sb.list[(idx + s * 5) % sb.list.length].fr;
        const nk = normalizeBankKey(cand);
        if (!seen.has(nk)) {
          seen.add(nk);
          dists.push(cand);
        }
      }
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
    vb.list.forEach((v, idx) => {
      const ans = `${v.preterite} / ${v.pastParticiple}`;
      const dists: string[] = [];
      const seen = new Set([normalizeBankKey(ans)]);
      for (let s = 1; s < vb.list.length && dists.length < 3; s++) {
        const other = vb.list[(idx + s * 3) % vb.list.length];
        const cand = `${other.preterite} / ${other.pastParticiple}`;
        const nk = normalizeBankKey(cand);
        if (!seen.has(nk)) {
          seen.add(nk);
          dists.push(cand);
        }
      }
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
        questionFr: item.clue,
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
  for (const uk of UK_VS_US_ITEMS) {
    candidates.push({
      kind: 'vocab',
      grade: '4e',
      category: 'Culture UK / US',
      promptEn: uk.uk,
      questionFr: `Quel est l’équivalent américain de « ${uk.uk} » ?`,
      answer: uk.correct,
      distractors: uk.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(uk.correct)),
      explanationFr: uk.explanation,
      audioText: uk.uk.replace(/🇬🇧|🇺🇸/g, '').trim(),
      isNew5000Bank: false
    });
  }
  for (const idiom of IDIOM_HUNTER_ITEMS) {
    candidates.push({
      kind: 'vocab',
      grade: '3e',
      category: 'Expression Idiomatique',
      promptEn: idiom.idiom,
      questionFr: `Que signifie l’expression « ${idiom.idiom} » ?`,
      answer: idiom.correct,
      distractors: idiom.options.filter((o) => normalizeBankKey(o) !== normalizeBankKey(idiom.correct)),
      explanationFr: `Sens littéral : « ${idiom.literal} ». En contexte : ${idiom.example}`,
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

// Strict zero-duplicate filter & balanced round-robin assignment across all 600 levels
const BUILD_RESULT = (() => {
  const raw = buildCandidates();
  const seenQuestions = new Set<string>();
  const seenAnswers = new Set<string>();
  const deduped: Array<RawBuildCandidate & { questionKey: string; answerKey: string }> = [];

  for (const item of raw) {
    if (!item.answer || !item.questionFr) continue;
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
