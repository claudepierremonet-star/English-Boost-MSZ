#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates /src/data/spacedRepetition500.ts with 500 complete items.
"""

import json

THEMES = [
    {"id": "vie_quotidienne", "label": "Vie quotidienne", "icon": "routine"},
    {"id": "voyages", "label": "Les voyages", "icon": "flight"},
    {"id": "histoire_patrimoine", "label": "Histoire et patrimoine", "icon": "account_balance"},
    {"id": "loisirs_creativite", "label": "Loisirs, créativité", "icon": "palette"},
    {"id": "sport", "label": "Sport", "icon": "fitness_center"},
    {"id": "musique_culture", "label": "Musique, culture", "icon": "music_note"},
    {"id": "restaurant_convivial", "label": "Restaurant, convivial", "icon": "restaurant"},
    {"id": "alimentation_sante", "label": "Alimentation, santé", "icon": "nutrition"},
    {"id": "monde_travail_metiers", "label": "Monde du travail, métiers", "icon": "work"},
    {"id": "geographie_politique_art", "label": "Géographie, politique, amour, amitié, art", "icon": "public"},
]

GRADES = [
    {"grade": "6e", "label": "6e (Collège • Découverte)", "cefr": "A1", "target": 72},
    {"grade": "5e", "label": "5e (Collège • Consolidation)", "cefr": "A2", "target": 72},
    {"grade": "4e", "label": "4e (Collège • Élargissement)", "cefr": "A2+", "target": 72},
    {"grade": "3e", "label": "3e (Brevet • Autonomie)", "cefr": "B1", "target": 72},
    {"grade": "2nde", "label": "2nde (Lycée • Détermination)", "cefr": "B1+", "target": 71},
    {"grade": "1re", "label": "1re (Lycée • Spécialités)", "cefr": "B2", "target": 71},
    {"grade": "terminale", "label": "Terminale (Baccalauréat • Excellence)", "cefr": "C1", "target": 70},
]
