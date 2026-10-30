import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { LESSON_DEFINITIONS as SPECS_6E, THEMES, GRADE_META } from './curriculumSpecs6e.js';
import { SPECS_5E } from './curriculumSpecs5e.js';
import { SPECS_4E } from './curriculumSpecs4e.js';
import { SPECS_3E } from './curriculumSpecs3e.js';
import { SPECS_2NDE } from './curriculumSpecs2nde.js';
import { SPECS_1RE } from './curriculumSpecs1re.js';
import { SPECS_TERMINALE } from './curriculumSpecsTerminale.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalDataPath = path.join(__dirname, '../src/data/schoolCurriculumData.json');
const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));

console.log(`Original lessons count: ${originalData.lessons.length}`);

// Combine all 130 new specs
const ALL_NEW_SPECS = [
  ...SPECS_6E,
  ...SPECS_5E,
  ...SPECS_4E,
  ...SPECS_3E,
  ...SPECS_2NDE,
  ...SPECS_1RE,
  ...SPECS_TERMINALE
];

console.log(`Total new specs collected: ${ALL_NEW_SPECS.length}`);

function formatSpecToLesson(spec, index) {
  const gradeMeta = GRADE_META[spec.grade];
  const theme = THEMES.find(t => t.id === spec.theme_id);
  const id = `lesson_${spec.grade}_${spec.theme_id}_${spec.num}`;

  // Build vocabulary
  const vocabulary = spec.vocab.map((v, i) => ({
    id: `${id}_w${i + 1}`,
    term: v[0],
    phonetic: v[1],
    part_of_speech: v[2],
    translation_fr: v[3],
    example_en: v[4],
    example_fr: v[5],
    level: spec.grade
  }));

  // Build model phrases from key examples & dialogue
  const model_phrases = [
    {
      en: spec.grammar.example_en,
      fr: spec.grammar.example_fr,
      focus: spec.grammar.title
    },
    {
      en: spec.vocab[0] ? spec.vocab[0][4] : spec.dictation.prompt,
      fr: spec.vocab[0] ? spec.vocab[0][5] : spec.dictation.fr,
      focus: "Vocabulaire en situation"
    },
    {
      en: spec.dialogue.lines[0] ? spec.dialogue.lines[0][1] : spec.dictation.prompt,
      fr: spec.dialogue.lines[0] ? spec.dialogue.lines[0][2] : spec.dictation.fr,
      focus: "Expression orale authentique"
    },
    {
      en: spec.dialogue.lines[1] ? spec.dialogue.lines[1][1] : spec.grammar.example_en,
      fr: spec.dialogue.lines[1] ? spec.dialogue.lines[1][2] : spec.grammar.example_fr,
      focus: "Interaction et fluidité"
    }
  ];

  // Build dialogue
  const dialogue = {
    title: spec.dialogue.title,
    setting_fr: spec.dialogue.setting,
    lines: spec.dialogue.lines.map(line => ({
      speaker: line[0],
      en: line[1],
      fr: line[2]
    }))
  };

  // Build dictation
  const dictation = {
    canonical: spec.dictation.prompt,
    translation_fr: spec.dictation.fr,
    audio_prompt: spec.dictation.prompt,
    difficulty_note: `Focalisation grammaticale (${gradeMeta.cefr}) : ${spec.grammar.title}`
  };

  // Build quiz
  const quiz = spec.quiz.map((q, i) => ({
    id: `q_${id}_${i + 1}`,
    question: q.q,
    options: q.opts,
    correct_index: q.a,
    explanation: q.exp
  }));

  return {
    id,
    class_level: spec.grade,
    class_label: gradeMeta.label,
    cycle: gradeMeta.cycle,
    cefr_level: gradeMeta.cefr,
    theme_id: spec.theme_id,
    theme_label: theme.label,
    theme_en: theme.en,
    theme_icon: theme.icon,
    title: spec.title,
    title_en: spec.title_en,
    learning_objective: spec.objective,
    estimated_minutes: gradeMeta.minutes || 25,
    vocabulary,
    model_phrases,
    grammar: spec.grammar,
    dialogue,
    dictation,
    quiz
  };
}

const formattedNewLessons = ALL_NEW_SPECS.map(formatSpecToLesson);
console.log(`Formatted new lessons count: ${formattedNewLessons.length}`);

// Group by grade to interleave or organize cleanly:
// We want all lessons for 6e, then 5e, then 4e, then 3e, then 2nde, then 1re, then terminale.
const GRADES_ORDER = ['6e', '5e', '4e', '3e', '2nde', '1re', 'terminale'];
const allMergedLessons = [];

GRADES_ORDER.forEach(grade => {
  const origGradeLessons = originalData.lessons.filter(l => l.class_level === grade);
  const newGradeLessons = formattedNewLessons.filter(l => l.class_level === grade);
  console.log(`Grade ${grade}: ${origGradeLessons.length} original + ${newGradeLessons.length} new = ${origGradeLessons.length + newGradeLessons.length}`);
  allMergedLessons.push(...origGradeLessons, ...newGradeLessons);
});

console.log(`Total merged lessons: ${allMergedLessons.length}`);

if (allMergedLessons.length !== 200) {
  console.error(`ERROR: Expected exactly 200 lessons, got ${allMergedLessons.length}`);
  process.exit(1);
}

// Update originalData container
const fullData = {
  ...originalData,
  total_lessons: 200,
  version: "3.0.0",
  description_fr: "Programme pédagogique intégral d'anglais de la 6e à la Terminale comprenant 200 leçons progressives réparties sur 7 classes et 10 thèmes fondamentaux. Chaque leçon comprend vocabulaire sonorisé, grammaire explicite avec règles et astuces, dialogue authentique sonorisé, dictée interactive et quiz d'évaluation.",
  lessons: allMergedLessons
};

// 1. Write src/data/schoolCurriculumData.json
fs.writeFileSync(originalDataPath, JSON.stringify(fullData, null, 2), 'utf8');
console.log(`Successfully wrote ${allMergedLessons.length} lessons to src/data/schoolCurriculumData.json`);

// 2. Write public/data/english_boost_mz_curriculum.json
const publicJsonPath = path.join(__dirname, '../public/data/english_boost_mz_curriculum.json');
fs.writeFileSync(publicJsonPath, JSON.stringify(fullData, null, 2), 'utf8');
console.log(`Successfully wrote to public/data/english_boost_mz_curriculum.json`);

// 3. Generate and write public/data/index_lecons.csv
const csvRows = [
  "numero,id,classe,cycle,cefr,theme_id,theme_label,titre_fr,titre_en,vocabulaire_count,point_grammaire"
];

allMergedLessons.forEach((l, idx) => {
  const cleanTitleFr = `"${l.title.replace(/"/g, '""')}"`;
  const cleanTitleEn = `"${l.title_en.replace(/"/g, '""')}"`;
  const cleanGrammar = `"${l.grammar.title.replace(/"/g, '""')}"`;
  const cleanTheme = `"${l.theme_label.replace(/"/g, '""')}"`;
  csvRows.push(`${idx + 1},${l.id},${l.class_level},${l.cycle},${l.cefr_level},${l.theme_id},${cleanTheme},${cleanTitleFr},${cleanTitleEn},${l.vocabulary.length},${cleanGrammar}`);
});

const csvContent = csvRows.join('\n');
const publicCsvPath = path.join(__dirname, '../public/data/index_lecons.csv');
fs.writeFileSync(publicCsvPath, csvContent, 'utf8');
console.log(`Successfully generated public/data/index_lecons.csv with ${allMergedLessons.length} rows.`);

console.log("All 200 lessons successfully generated and exported!");
