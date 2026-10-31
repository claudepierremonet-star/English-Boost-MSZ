#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full generator for 500 Spaced Repetition flashcards.
Outputs /src/data/spacedRepetition500.ts
"""

import json
import os

OUT_PATH = "/src/data/spacedRepetition500.ts"

THEME_META = {
    "vie_quotidienne": {"label": "Vie quotidienne", "icon": "routine"},
    "voyages": {"label": "Les voyages", "icon": "flight"},
    "histoire_patrimoine": {"label": "Histoire et patrimoine", "icon": "account_balance"},
    "loisirs_creativite": {"label": "Loisirs, créativité", "icon": "palette"},
    "sport": {"label": "Sport", "icon": "fitness_center"},
    "musique_culture": {"label": "Musique, culture", "icon": "music_note"},
    "restaurant_convivial": {"label": "Restaurant, convivial", "icon": "restaurant"},
    "alimentation_sante": {"label": "Alimentation, santé", "icon": "nutrition"},
    "monde_travail_metiers": {"label": "Monde du travail, métiers", "icon": "work"},
    "geographie_politique_art": {"label": "Géographie, politique, amour, amitié, art", "icon": "public"},
}

GRADE_META = {
    "6e": {"label": "6e (Collège • Cycle 3)", "cefr": "A1", "target": 72},
    "5e": {"label": "5e (Collège • Cycle 4)", "cefr": "A2", "target": 72},
    "4e": {"label": "4e (Collège • Cycle 4)", "cefr": "A2", "target": 72},
    "3e": {"label": "3e (Brevet • Cycle 4)", "cefr": "B1", "target": 72},
    "2nde": {"label": "2nde (Lycée • Détermination)", "cefr": "B1", "target": 71},
    "1re": {"label": "1re (Lycée • Spécialités)", "cefr": "B2", "target": 71},
    "terminale": {"label": "Terminale (Baccalauréat)", "cefr": "C1", "target": 70},
}

# Helper to build a clean card dictionary
def make_card(idx, grade, theme, term, phonetic, cat, fr_def, en_def, ety, ex, src, collocations, nuances):
    grade_info = GRADE_META[grade]
    theme_info = THEME_META[theme]
    return {
        "id": f"card-sr500-{grade}-{idx:03d}-{term.lower().replace(' ', '-')[:16]}",
        "term": term,
        "phonetic": phonetic,
        "level": grade_info["cefr"],
        "gradeLevel": grade,
        "gradeLabel": grade_info["label"],
        "theme": theme,
        "themeLabel": theme_info["label"],
        "category": cat,
        "frenchDef": fr_def,
        "englishDef": en_def,
        "etymology": ety,
        "pressExcerpt": ex,
        "pressSource": src,
        "collocations": collocations,
        "nuanceComparisons": [{"word": n[0], "distinction": n[1]} for n in nuances]
    }
