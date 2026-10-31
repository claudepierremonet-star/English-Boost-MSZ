#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Curated 500 Spaced Repetition Cards Generator.
Generates /src/data/spacedRepetition500.ts with exact counts:
6e: 72
5e: 72
4e: 72
3e: 72
2nde: 71
1re: 71
terminale: 70
Total = 500 cards across 10 themes.
"""

import json
import os

OUT_PATH = "src/data/spacedRepetition500.ts"

print("Building generator...")
