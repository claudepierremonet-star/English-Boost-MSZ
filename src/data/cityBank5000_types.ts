import type { SchoolGrade } from './curriculum';

export interface CompactVocabGroup {
  kind: 'en_fr' | 'fr_en' | 'word_find';
  grade: SchoolGrade;
  category: string;
  items: ReadonlyArray<readonly [string, string, string?]>;
}

export interface CompactGrammarItem {
  grade: SchoolGrade;
  category: string;
  promptEn: string;
  questionFr: string;
  answer: string;
  distractors: readonly [string, string, string];
  explanationFr: string;
  audioText?: string;
}

export interface CityBankEntry {
  id: string;
  kind: 'vocab' | 'word_find' | 'grammar';
  grade: SchoolGrade;
  assignedLevel: number; // 1..600
  category: string;
  promptEn: string;
  questionFr: string;
  answer: string;
  distractors: string[];
  explanationFr: string;
  audioText: string;
  phonetic?: string;
  questionKey: string;
  answerKey: string;
}
