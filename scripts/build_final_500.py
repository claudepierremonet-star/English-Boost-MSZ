#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate src/data/spacedRepetition500.ts containing all 500 cards
organized by grade and theme, adhering to FlashcardItem schema.
"""

import sys
import os
import json
import re

sys.path.insert(0, os.path.abspath("."))

from scripts.data_6e_5e import WORDS_6E, WORDS_5E
from scripts.data_4e_3e import WORDS_4E, WORDS_3E
from scripts.data_lycee import WORDS_2NDE, WORDS_1RE, WORDS_TERMINALE

THEME_LABELS = {
    "vie_quotidienne": "Vie quotidienne",
    "voyages": "Voyages & Déplacements",
    "histoire_patrimoine": "Histoire & Patrimoine",
    "loisirs_creativite": "Loisirs & Créativité",
    "sport": "Sport & Dépassement",
    "musique_culture": "Musique & Culture",
    "restaurant_convivial": "Restaurant & Convivialité",
    "alimentation_sante": "Alimentation & Santé",
    "monde_travail_metiers": "Monde du travail & Métiers",
    "geographie_politique_art": "Géographie, Société & Arts",
}

GRADES = [
    ("6e", "6e (Collège)", "A1", WORDS_6E),
    ("5e", "5e (Collège)", "A2", WORDS_5E),
    ("4e", "4e (Collège)", "A2", WORDS_4E),
    ("3e", "3e (Collège)", "B1", WORDS_3E),
    ("2nde", "Seconde (Lycée)", "B1", WORDS_2NDE),
    ("1re", "Première (Lycée)", "B2", WORDS_1RE),
    ("terminale", "Terminale (Lycée)", "C1", WORDS_TERMINALE),
]

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'card'

all_items = []
seen_ids = set()

for grade_key, grade_label, cefr, words in GRADES:
    for idx, w in enumerate(words, start=1):
        term = w[0]
        phonetic = w[1]
        theme_key = w[2]
        category = w[3]
        french_def = w[4]
        english_def = w[5]
        etymology = w[6]
        press_excerpt = w[7]
        press_source = w[8]
        collocations = list(w[9])
        
        # Nuance comparisons
        nuances = []
        for n in w[10]:
            if isinstance(n, (tuple, list)) and len(n) >= 2:
                nuances.append({"word": n[0], "distinction": n[1]})
            elif isinstance(n, dict):
                nuances.append(n)
        
        base_id = f"card-{grade_key}-{idx:02d}-{slugify(term)}"
        card_id = base_id
        c = 1
        while card_id in seen_ids:
            c += 1
            card_id = f"{base_id}-{c}"
        seen_ids.add(card_id)

        item = {
            "id": card_id,
            "term": term,
            "phonetic": phonetic,
            "level": cefr,
            "category": category,
            "frenchDef": french_def,
            "englishDef": english_def,
            "etymology": etymology,
            "pressExcerpt": press_excerpt,
            "pressSource": press_source,
            "collocations": collocations,
            "nuanceComparisons": nuances,
            "gradeLevel": grade_key,
            "gradeLabel": grade_label,
            "theme": theme_key,
            "themeLabel": THEME_LABELS.get(theme_key, theme_key.replace('_', ' ').title()),
        }
        all_items.append(item)

print(f"Total processed cards: {len(all_items)}")

header = """// src/data/spacedRepetition500.ts
// 500 Vocabulaire d'Excellence Spaced Repetition Flashcards
// Répartition complète : 6e, 5e, 4e, 3e, 2nde, 1re, Terminale
// 10 Thématiques : Vie quotidienne, Voyages, Histoire & Patrimoine, Loisirs & Créativité,
// Sport & Dépassement, Musique & Culture, Restaurant & Convivialité, Alimentation & Santé,
// Monde du travail & Métiers, Géographie, Société & Arts.

import type { CEFRLevel } from '../firebase/types';

export interface SpacedRepetitionCard {
  id: string;
  term: string;
  phonetic: string;
  level: CEFRLevel;
  category: string;
  frenchDef: string;
  englishDef: string;
  etymology: string;
  pressExcerpt: string;
  pressSource: string;
  collocations: string[];
  nuanceComparisons: Array<{ word: string; distinction: string }>;
  gradeLevel: '6e' | '5e' | '4e' | '3e' | '2nde' | '1re' | 'terminale';
  gradeLabel: string;
  theme: string;
  themeLabel: string;
}

export const THEMES_500: Array<{ id: string; label: string; icon: string }> = [
  { id: 'all', label: 'Toutes les thématiques', icon: '✨' },
  { id: 'vie_quotidienne', label: 'Vie quotidienne', icon: '☀️' },
  { id: 'voyages', label: 'Voyages & Déplacements', icon: '✈️' },
  { id: 'histoire_patrimoine', label: 'Histoire & Patrimoine', icon: '🏛️' },
  { id: 'loisirs_creativite', label: 'Loisirs & Créativité', icon: '🎨' },
  { id: 'sport', label: 'Sport & Dépassement', icon: '⚡' },
  { id: 'musique_culture', label: 'Musique & Culture', icon: '🎵' },
  { id: 'restaurant_convivial', label: 'Restaurant & Convivialité', icon: '🍽️' },
  { id: 'alimentation_sante', label: 'Alimentation & Santé', icon: '🥗' },
  { id: 'monde_travail_metiers', label: 'Monde du travail & Métiers', icon: '💼' },
  { id: 'geographie_politique_art', label: 'Géographie, Société & Arts', icon: '🌍' },
];

export const GRADES_500: Array<{ id: string; label: string; short: string; cefr: CEFRLevel }> = [
  { id: 'all', label: 'Tous les niveaux scolaires', short: 'Tous', cefr: 'A1' },
  { id: '6e', label: '6e (Collège débutant)', short: '6e', cefr: 'A1' },
  { id: '5e', label: '5e (Collège consolidation)', short: '5e', cefr: 'A2' },
  { id: '4e', label: '4e (Collège intermédiaire)', short: '4e', cefr: 'A2' },
  { id: '3e', label: '3e (Collège palier B1)', short: '3e', cefr: 'B1' },
  { id: '2nde', label: 'Seconde (Lycée B1)', short: '2nde', cefr: 'B1' },
  { id: '1re', label: 'Première (Lycée B2)', short: '1re', cefr: 'B2' },
  { id: 'terminale', label: 'Terminale (Lycée C1)', short: 'Terminale', cefr: 'C1' },
];

export const SPACED_REPETITION_500: SpacedRepetitionCard[] = """

json_data = json.dumps(all_items, ensure_ascii=False, indent=2)

footer = ";\n"

with open("src/data/spacedRepetition500.ts", "w", encoding="utf-8") as f:
    f.write(header + json_data + footer)

print("Saved to src/data/spacedRepetition500.ts successfully!")
