import schoolData from './schoolCurriculumData.json';

export type SchoolGrade = '6e' | '5e' | '4e' | '3e' | '2nde' | '1re' | 'terminale';

export interface SchoolVocabularyItem {
  id: string;
  term: string;
  phonetic: string;
  part_of_speech: string;
  translation_fr: string;
  example_en: string;
  example_fr: string;
  level: string;
}

export interface ModelPhrase {
  en: string;
  fr: string;
  focus: string;
}

export interface GrammarLessonPoint {
  title: string;
  rule: string;
  example_en: string;
  example_fr: string;
  tip: string;
  level_focus: string;
}

export interface DialogueLine {
  speaker: string;
  en: string;
  fr: string;
}

export interface DictationLessonItem {
  canonical: string;
  translation_fr: string;
  audio_prompt: string;
  difficulty_note: string;
}

export interface SchoolQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface SchoolLesson {
  id: string;
  class_level: SchoolGrade;
  class_label: string;
  cycle: string;
  cefr_level: string;
  theme_id: string;
  theme_label: string;
  theme_en: string;
  theme_icon: string;
  title: string;
  title_en: string;
  learning_objective: string;
  estimated_minutes: number;
  vocabulary: SchoolVocabularyItem[];
  model_phrases: ModelPhrase[];
  grammar: GrammarLessonPoint;
  dialogue: {
    title: string;
    setting_fr: string;
    lines: DialogueLine[];
  };
  dictation: DictationLessonItem;
  quiz: SchoolQuizQuestion[];
}

export interface SchoolLevelInfo {
  id: SchoolGrade;
  label: string;
  cycle: string;
  cefr: string;
  goal: string;
}

export interface SchoolThemeInfo {
  id: string;
  label: string;
  icon: string;
  en: string;
}

export const SCHOOL_LEVELS: SchoolLevelInfo[] = schoolData.levels as SchoolLevelInfo[];
export const SCHOOL_THEMES: SchoolThemeInfo[] = schoolData.themes as SchoolThemeInfo[];
export const ALL_SCHOOL_LESSONS: SchoolLesson[] = schoolData.lessons as SchoolLesson[];

export function getLessonsByGrade(grade: SchoolGrade): SchoolLesson[] {
  return ALL_SCHOOL_LESSONS.filter((l) => l.class_level === grade);
}

export function getLessonById(id: string): SchoolLesson | undefined {
  return ALL_SCHOOL_LESSONS.find((l) => l.id === id);
}

export function downloadCurriculumJson() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schoolData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'english_boost_mz_70_lecons.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadCurriculumCsv() {
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', '/data/index_lecons.csv');
  downloadAnchor.setAttribute('download', 'index_pedagogique_70_lecons.csv');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadCurriculumMarkdown() {
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', '/data/GUIDE_PEDAGOGIQUE_FR.md');
  downloadAnchor.setAttribute('download', 'GUIDE_PEDAGOGIQUE_ENGLISH_BOOST_MZ.md');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export * from './grammar6eData';
