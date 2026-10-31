#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates 500 comprehensive Spaced Repetition flashcards across 7 school grades and 10 themes.
Output: /src/data/spacedRepetition500.ts
"""

import json

THEMES = [
    ("vie_quotidienne", "Vie quotidienne"),
    ("voyages", "Les voyages"),
    ("histoire_patrimoine", "Histoire et patrimoine"),
    ("loisirs_creativite", "Loisirs, créativité"),
    ("sport", "Sport"),
    ("musique_culture", "Musique, culture"),
    ("restaurant_convivial", "Restaurant, convivial"),
    ("alimentation_sante", "Alimentation, santé"),
    ("monde_travail_metiers", "Monde du travail, métiers"),
    ("geographie_politique_art", "Géographie, politique, amour, amitié, art"),
]

GRADES = [
    ("6e", "6e (Collège • Cycle 3)", "A1", 72),
    ("5e", "5e (Collège • Cycle 4)", "A2", 72),
    ("4e", "4e (Collège • Cycle 4)", "A2+", 72),
    ("3e", "3e (Brevet • Cycle 4)", "B1", 72),
    ("2nde", "2nde (Lycée • Détermination)", "B1+", 71),
    ("1re", "1re (Lycée • Spécialités)", "B2", 71),
    ("terminale", "Terminale (Baccalauréat)", "C1/C2", 70),
]

print("Script template ready.")
