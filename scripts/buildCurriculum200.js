import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalDataPath = path.join(__dirname, '../src/data/schoolCurriculumData.json');
const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));

const THEME_MAP = {
  daily_life: { label: "Vie quotidienne", en: "Daily Life & Routines", icon: "schedule" },
  travel: { label: "Voyages", en: "Travel & Exploration", icon: "flight_takeoff" },
  history: { label: "Histoire & Patrimoine", en: "History & Heritage", icon: "history_edu" },
  hobbies: { label: "Loisirs & Créativité", en: "Hobbies & Leisure", icon: "palette" },
  sport: { label: "Sport & Dépassement", en: "Sports & Athletics", icon: "fitness_center" },
  music: { label: "Musique & Culture", en: "Music & Performing Arts", icon: "music_note" },
  restaurant: { label: "Restaurant & Convivialité", en: "Dining Out & Gastronomy", icon: "restaurant" },
  food: { label: "Alimentation & Santé", en: "Food & Nutrition", icon: "nutrition" },
  work: { label: "Monde du Travail", en: "Workplace & Dynamics", icon: "work" },
  school_social: { label: "Métiers & Vocations", en: "Professions & Careers", icon: "school" }
};

const LEVEL_MAP = {
  '6e': { label: 'Sixième', cycle: 'Cycle 3', cefr: 'A1–A1+', minutes: 20 },
  '5e': { label: 'Cinquième', cycle: 'Cycle 4', cefr: 'A1+–A2', minutes: 22 },
  '4e': { label: 'Quatrième', cycle: 'Cycle 4', cefr: 'A2–A2+', minutes: 25 },
  '3e': { label: 'Troisième', cycle: 'Cycle 4', cefr: 'A2+–B1', minutes: 25 },
  '2nde': { label: 'Seconde', cycle: 'Lycée', cefr: 'B1', minutes: 30 },
  '1re': { label: 'Première', cycle: 'Lycée', cefr: 'B1–B2', minutes: 30 },
  'terminale': { label: 'Terminale', cycle: 'Lycée', cefr: 'B2, ouverture C1', minutes: 35 }
};

// Plan the new lessons to add (130 lessons):
// 6e: 19 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 2, work: 2, school_social: 1) -> 10 + 19 = 29
// 5e: 19 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 2, work: 2, school_social: 1) -> 10 + 19 = 29
// 4e: 19 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 2, work: 2, school_social: 1) -> 10 + 19 = 29
// 3e: 19 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 2, work: 2, school_social: 1) -> 10 + 19 = 29
// 2nde: 18 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 1, work: 2, school_social: 1) -> 10 + 18 = 28
// 1re: 18 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 1, work: 2, school_social: 1) -> 10 + 18 = 28
// terminale: 18 new lessons (daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 1, work: 2, school_social: 1) -> 10 + 18 = 28
// Total = 70 + 19 + 19 + 19 + 19 + 18 + 18 + 18 = 200 lessons.

console.log('Validating plans for 200 lessons across 7 classes.');
