// 50 Fiches Pédagogiques & Exercices de Structuration de Phrases — Niveau 6ème (Cycle 3, CECRL A1/A1+)
// Créé spécifiquement pour le curriculum d'anglais de 6ème.

export interface Grammar6eExercise {
  instruction: string;
  french_prompt: string;
  scrambled_words: string[];
  correct_tokens: string[];
  explanation: string;
}

export interface Grammar6eItem {
  id: string;
  number: number;
  title: string;
  category: string;
  cefr: 'A1' | 'A1+';
  structure_formula: string;
  rule: string;
  tip: string;
  example_en: string;
  example_fr: string;
  exercise: Grammar6eExercise;
}

export const GRAMMAR_6E_CATEGORIES = [
  'Toutes les catégories',
  'Le verbe BE (Être)',
  'Le verbe HAVE GOT (Avoir)',
  'Le Présent Simple',
  'Le Présent BE + -ING',
  'Les Modaux (CAN / CAN\'T)',
  'L\'Impératif & Consignes',
  'Les Déterminants & Articles',
  'Les Démonstratifs',
  'Les Pronoms',
  'Les Possessifs',
  'Le Génitif (La Possession)',
  'Les Mots Interrogatifs',
  'There is / There are',
  'Les Prépositions',
  'L\'Ordre des Mots'
] as const;

export const GRAMMAR_6E_ITEMS: Grammar6eItem[] = [
  {
    "id": "g6e_01",
    "number": 1,
    "title": "Le verbe BE au présent simple — Forme affirmative",
    "category": "Le verbe BE (Être)",
    "cefr": "A1",
    "structure_formula": "Sujet + am / is / are + Complément",
    "rule": "Le verbe BE (être) prend trois formes au présent simple : 'am' avec I, 'is' avec he/she/it, et 'are' avec you/we/they.",
    "tip": "Ne confondez pas 'is' (singulier) et 'are' (pluriel ou avec 'you'). Exemple : 'You are', jamais 'You is'.",
    "example_en": "She is a student at Oxford Middle School.",
    "example_fr": "Elle est élève au collège d'Oxford.",
    "exercise": {
      "instruction": "Remettez les mots dans l'ordre pour former la phrase affirmative :",
      "french_prompt": "Mon frère est très grand.",
      "scrambled_words": [
        "tall",
        "is",
        "brother",
        "My",
        "very"
      ],
      "correct_tokens": [
        "My",
        "brother",
        "is",
        "very",
        "tall"
      ],
      "explanation": "L'ordre en anglais est Sujet (My brother) + Verbe BE (is) + Adverbe (very) + Adjectif (tall)."
    }
  },
  {
    "id": "g6e_02",
    "number": 2,
    "title": "Le verbe BE au présent simple — Forme négative",
    "category": "Le verbe BE (Être)",
    "cefr": "A1",
    "structure_formula": "Sujet + am not / isn't / aren't + Complément",
    "rule": "Pour la forme négative, on ajoute simplement 'not' après BE : 'I am not' (I'm not), 'is not' (isn't), 'are not' (aren't).",
    "tip": "'I am not' se contracte en 'I'm not', il n'existe pas de forme *'amn't'.",
    "example_en": "They aren't tired after school.",
    "example_fr": "Ils ne sont pas fatigués après l'école.",
    "exercise": {
      "instruction": "Structurez la phrase négative avec le verbe BE :",
      "french_prompt": "Nous ne sommes pas en retard aujourd'hui.",
      "scrambled_words": [
        "today",
        "late",
        "aren't",
        "We"
      ],
      "correct_tokens": [
        "We",
        "aren't",
        "late",
        "today"
      ],
      "explanation": "Sujet (We) + BE négatif (aren't) + Adjectif (late) + Complément de temps (today)."
    }
  },
  {
    "id": "g6e_03",
    "number": 3,
    "title": "Le verbe BE — Forme interrogative (Questions fermées)",
    "category": "Le verbe BE (Être)",
    "cefr": "A1",
    "structure_formula": "Am / Is / Are + Sujet + Complément + ?",
    "rule": "Pour poser une question avec BE, on inverse le sujet et le verbe. Le verbe BE passe en tout premier dans la phrase.",
    "tip": "N'ajoutez JAMAIS 'do' ou 'does' avec le verbe BE ! On dit 'Is he happy?' et non *'Does he be happy?'.",
    "example_en": "Is your father a doctor?",
    "example_fr": "Ton père est-il médecin ?",
    "exercise": {
      "instruction": "Construisez la question en inversant le verbe et le sujet :",
      "french_prompt": "Es-tu prêt pour le cours d'anglais ?",
      "scrambled_words": [
        "English",
        "ready",
        "Are",
        "class",
        "you",
        "for"
      ],
      "correct_tokens": [
        "Are",
        "you",
        "ready",
        "for",
        "English",
        "class"
      ],
      "explanation": "Verbe BE en tête (Are) + Sujet (you) + Adjectif (ready) + Préposition et complément (for English class)."
    }
  },
  {
    "id": "g6e_04",
    "number": 4,
    "title": "Les réponses courtes (Short answers) avec BE",
    "category": "Le verbe BE (Être)",
    "cefr": "A1",
    "structure_formula": "Yes, + pronom + am/is/are. | No, + pronom + 'm not/isn't/aren't.",
    "rule": "En anglais, on ne répond pas juste par 'Yes' ou 'No' : on reprend le pronom personnel sujet et la forme appropriée de BE.",
    "tip": "À la forme affirmative, on n'utilise JAMAIS de contraction dans la réponse courte ! On dit 'Yes, I am' et JAMAIS *'Yes, I'm'.",
    "example_en": "Are you French? — Yes, I am. / No, I'm not.",
    "example_fr": "Es-tu français ? — Oui. / Non.",
    "exercise": {
      "instruction": "Ordonnez la réponse courte négative :",
      "french_prompt": "Non, elle n'est pas à la maison.",
      "scrambled_words": [
        "she",
        "No,",
        "isn't"
      ],
      "correct_tokens": [
        "No,",
        "she",
        "isn't"
      ],
      "explanation": "Particule 'No,' + pronom personnel sujet 'she' + BE contracté négatif 'isn't'."
    }
  },
  {
    "id": "g6e_05",
    "number": 5,
    "title": "Les formes contractées de BE à l'oral et à l'écrit",
    "category": "Le verbe BE (Être)",
    "cefr": "A1",
    "structure_formula": "I'm / You're / He's / She's / It's / We're / They're",
    "rule": "Dans la vie quotidienne et à l'oral, les anglophones contractent systématiquement le verbe BE avec une apostrophe remplaçant la voyelle élidée.",
    "tip": "Ne confondez pas 'It's' (c'est / contraction de it is) et 'Its' sans apostrophe (son/sa, adjectif possessif pour un animal ou objet).",
    "example_en": "He's twelve and she's eleven years old.",
    "example_fr": "Il a douze ans et elle a onze ans.",
    "exercise": {
      "instruction": "Assemblez la phrase avec la contraction de BE :",
      "french_prompt": "C'est un très beau jour d'été.",
      "scrambled_words": [
        "summer",
        "nice",
        "a",
        "It's",
        "day",
        "very"
      ],
      "correct_tokens": [
        "It's",
        "a",
        "very",
        "nice",
        "summer",
        "day"
      ],
      "explanation": "Sujet contracté (It's) + Déterminant (a) + Adverbe (very) + Adjectifs (nice summer) + Nom (day)."
    }
  },
  {
    "id": "g6e_06",
    "number": 6,
    "title": "HAVE GOT — La possession au présent (Affirmation)",
    "category": "Le verbe HAVE GOT (Avoir)",
    "cefr": "A1",
    "structure_formula": "Sujet + have got ('ve got) / has got ('s got) + Complément",
    "rule": "Pour exprimer la possession en anglais britannique scolaire, on utilise 'have got'. À la 3e personne du singulier (he, she, it), on emploie 'has got'.",
    "tip": "N'oubliez pas le 'got' ! 'He has got a bike' = 'He's got a bike'.",
    "example_en": "I have got a green pencil case.",
    "example_fr": "J'ai une trousse verte.",
    "exercise": {
      "instruction": "Remettez les éléments dans l'ordre avec HAS GOT :",
      "french_prompt": "Tom a un nouveau vélo rouge.",
      "scrambled_words": [
        "got",
        "has",
        "red",
        "Tom",
        "new",
        "bike",
        "a"
      ],
      "correct_tokens": [
        "Tom",
        "has",
        "got",
        "a",
        "new",
        "red",
        "bike"
      ],
      "explanation": "Sujet (Tom) + has got + déterminant (a) + adjectifs d'âge et couleur (new red) + nom (bike)."
    }
  },
  {
    "id": "g6e_07",
    "number": 7,
    "title": "HAVE GOT — La forme négative (Haven't got / Hasn't got)",
    "category": "Le verbe HAVE GOT (Avoir)",
    "cefr": "A1",
    "structure_formula": "Sujet + haven't got / hasn't got + Complément",
    "rule": "La négation se forme en ajoutant 'not' entre 'have/has' et 'got', généralement contracté en 'haven't got' ou 'hasn't got'.",
    "tip": "Attention : ne mettez pas d'auxiliaire 'do' avec 'have got'. On dit 'I haven't got', pas *'I don't have got'.",
    "example_en": "We haven't got our notebooks today.",
    "example_fr": "Nous n'avons pas nos cahiers aujourd'hui.",
    "exercise": {
      "instruction": "Formez la phrase négative avec HASN'T GOT :",
      "french_prompt": "Elle n'a pas de règle dans son sac.",
      "scrambled_words": [
        "ruler",
        "hasn't",
        "She",
        "her",
        "got",
        "a",
        "bag",
        "in"
      ],
      "correct_tokens": [
        "She",
        "hasn't",
        "got",
        "a",
        "ruler",
        "in",
        "her",
        "bag"
      ],
      "explanation": "Sujet (She) + hasn't got + COD (a ruler) + Complément de lieu (in her bag)."
    }
  },
  {
    "id": "g6e_08",
    "number": 8,
    "title": "HAVE GOT — Questions et réponses courtes",
    "category": "Le verbe HAVE GOT (Avoir)",
    "cefr": "A1",
    "structure_formula": "Have / Has + Sujet + got + ? | Yes, S + have/has. / No, S + haven't/hasn't.",
    "rule": "Pour poser une question, 'Have' ou 'Has' passe en tête, suivi du sujet puis de 'got'. Dans la réponse courte, on n'utilise PAS 'got'.",
    "tip": "Réponse courte : 'Yes, I have' (et JAMAIS *'Yes, I have got').",
    "example_en": "Have you got a pet? — Yes, I have.",
    "example_fr": "As-tu un animal de compagnie ? — Oui.",
    "exercise": {
      "instruction": "Construisez la question avec HAVE GOT :",
      "french_prompt": "As-tu des crayons de couleur ?",
      "scrambled_words": [
        "pencils",
        "you",
        "coloured",
        "Have",
        "got",
        "?"
      ],
      "correct_tokens": [
        "Have",
        "you",
        "got",
        "coloured",
        "pencils",
        "?"
      ],
      "explanation": "Auxiliaire (Have) + Sujet (you) + Participe (got) + Adjectif (coloured) + Nom (pencils) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_09",
    "number": 9,
    "title": "HAVE GOT pour la description physique",
    "category": "Le verbe HAVE GOT (Avoir)",
    "cefr": "A1",
    "structure_formula": "Sujet + has got + (long/short) + (couleur) + hair / eyes",
    "rule": "On utilise 'have got' pour décrire les yeux et les cheveux. Les cheveux (hair) sont indénombrables et singuliers en anglais !",
    "tip": "On dit 'Her hair IS brown' (singulier), jamais *'Her hairs are brown'.",
    "example_en": "She has got curly brown hair and green eyes.",
    "example_fr": "Elle a les cheveux bruns bouclés et les yeux verts.",
    "exercise": {
      "instruction": "Décrivez la personne en ordonnant les mots :",
      "french_prompt": "Il a les cheveux courts et les yeux bleus.",
      "scrambled_words": [
        "and",
        "has",
        "He",
        "short",
        "eyes",
        "hair",
        "blue",
        "got"
      ],
      "correct_tokens": [
        "He",
        "has",
        "got",
        "short",
        "hair",
        "and",
        "blue",
        "eyes"
      ],
      "explanation": "Sujet (He) + has got + 1er trait (short hair) + and + 2e trait (blue eyes)."
    }
  },
  {
    "id": "g6e_10",
    "number": 10,
    "title": "Le Présent Simple — Affirmation et le -S de la 3e personne",
    "category": "Le Présent Simple",
    "cefr": "A1",
    "structure_formula": "I / You / We / They + Base Verbale | He / She / It + Base Verbale + -S",
    "rule": "Le présent simple exprime une vérité générale ou une habitude. À la 3e personne du singulier (he, she, it), on ajoute impérativement un '-s' à la fin du verbe.",
    "tip": "C'est l'erreur numéro 1 en 6e ! Pensez toujours au '-s' avec 'he', 'she', 'it' ou un sujet singulier (my dog, John).",
    "example_en": "My sister plays badminton every Saturday.",
    "example_fr": "Ma sœur joue au badminton chaque samedi.",
    "exercise": {
      "instruction": "Formez la phrase avec le verbe conjugué à la 3e personne :",
      "french_prompt": "David habite dans une grande maison.",
      "scrambled_words": [
        "house",
        "David",
        "lives",
        "big",
        "a",
        "in"
      ],
      "correct_tokens": [
        "David",
        "lives",
        "in",
        "a",
        "big",
        "house"
      ],
      "explanation": "Sujet 3e personne (David) + verbe avec -s (lives) + préposition (in) + article et adjectif (a big) + nom (house)."
    }
  },
  {
    "id": "g6e_11",
    "number": 11,
    "title": "Le Présent Simple — Les verbes en -ES et -IES",
    "category": "Le Présent Simple",
    "cefr": "A1",
    "structure_formula": "Verbes en -o, -ch, -sh, -ss, -x -> +ES | Consonne + y -> -IES",
    "rule": "Quand un verbe se termine par un son sifflant ou 'o' (go, watch, wash, kiss), on ajoute '-es' (goes, watches). Si le verbe finit par consonne + y (study, fly), il devient '-ies' (studies, flies).",
    "tip": "Attention : 'play' finit par voyelle + y, donc on ajoute simplement 's' -> 'plays'. Mais 'study' -> 'studies'.",
    "example_en": "She watches cartoons before dinner.",
    "example_fr": "Elle regarde des dessins animés avant le dîner.",
    "exercise": {
      "instruction": "Remettez en ordre cette phrase sur les habitudes :",
      "french_prompt": "Mon ami étudie l'anglais tous les soirs.",
      "scrambled_words": [
        "every",
        "studies",
        "friend",
        "English",
        "evening",
        "My"
      ],
      "correct_tokens": [
        "My",
        "friend",
        "studies",
        "English",
        "every",
        "evening"
      ],
      "explanation": "Sujet (My friend) + verbe en -ies (studies) + COD (English) + complément de temps (every evening)."
    }
  },
  {
    "id": "g6e_12",
    "number": 12,
    "title": "Le Présent Simple — La forme négative avec DON'T et DOESN'T",
    "category": "Le Présent Simple",
    "cefr": "A1",
    "structure_formula": "I/You/We/They + don't + Base Verbale | He/She/It + doesn't + Base Verbale",
    "rule": "Pour mettre un verbe ordinaire à la forme négative, on utilise l'auxiliaire 'don't' ou 'doesn't'. Le verbe principal reste à la base verbale (l'infinitif sans to), SANS le '-s' !",
    "tip": "Le '-s' est déjà absorbé par 'doesn't', donc ne dites jamais *'He doesn't plays'*, mais 'He doesn't play' !",
    "example_en": "He doesn't like cold milk.",
    "example_fr": "Il n'aime pas le lait froid.",
    "exercise": {
      "instruction": "Construisez la phrase négative au présent simple :",
      "french_prompt": "Sarah ne mange pas de viande.",
      "scrambled_words": [
        "eat",
        "doesn't",
        "Sarah",
        "meat"
      ],
      "correct_tokens": [
        "Sarah",
        "doesn't",
        "eat",
        "meat"
      ],
      "explanation": "Sujet 3e personne (Sarah) + doesn't + Base Verbale (eat) + Complément (meat)."
    }
  },
  {
    "id": "g6e_13",
    "number": 13,
    "title": "Le Présent Simple — Poser des questions avec DO et DOES",
    "category": "Le Présent Simple",
    "cefr": "A1",
    "structure_formula": "Do + I/you/we/they + Base Verbale + ? | Does + he/she/it + Base Verbale + ?",
    "rule": "Pour poser une question fermée au présent simple avec un verbe ordinaire, on commence obligatoirement par l'auxiliaire 'Do' ou 'Does', suivi du sujet puis de la base verbale.",
    "tip": "Règle mnémotechnique : Auxiliaire + Sujet + Verbe (ASV) ! 'Does she live in London?'.",
    "example_en": "Do you play video games on Sunday?",
    "example_fr": "Joues-tu aux jeux vidéo le dimanche ?",
    "exercise": {
      "instruction": "Reconstituez la question selon le schéma Auxiliaire + Sujet + Verbe :",
      "french_prompt": "Ton frère joue-t-il au football ?",
      "scrambled_words": [
        "brother",
        "football",
        "Does",
        "play",
        "your",
        "?"
      ],
      "correct_tokens": [
        "Does",
        "your",
        "brother",
        "play",
        "football",
        "?"
      ],
      "explanation": "Auxiliaire (Does) + Sujet (your brother) + Base Verbale (play) + COD (football) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_14",
    "number": 14,
    "title": "Les réponses courtes au Présent Simple (Do / Don't / Does / Doesn't)",
    "category": "Le Présent Simple",
    "cefr": "A1",
    "structure_formula": "Yes, + pronom + do/does. | No, + pronom + don't/doesn't.",
    "rule": "Dans la réponse courte, on n'utilise jamais le verbe d'action ! On réutilise uniquement l'auxiliaire 'do/does' ou 'don't/doesn't'.",
    "tip": "À la question 'Do you speak English?', répondez 'Yes, I do' et non *'Yes, I speak'*. À la question 'Does he speak English?', répondez 'No, he doesn't'.",
    "example_en": "Does he like tea? — Yes, he does. / No, he doesn't.",
    "example_fr": "Aime-t-il le thé ? — Oui. / Non.",
    "exercise": {
      "instruction": "Formez la réponse courte affirmative avec DOES :",
      "french_prompt": "Oui, il aime.",
      "scrambled_words": [
        "does",
        "he",
        "Yes,"
      ],
      "correct_tokens": [
        "Yes,",
        "he",
        "does"
      ],
      "explanation": "Affirmation (Yes,) + Pronom sujet (he) + Auxiliaire 3e personne (does)."
    }
  },
  {
    "id": "g6e_15",
    "number": 15,
    "title": "Exprimer ses goûts : LIKE, LOVE, HATE + Nom ou Verbe en -ING",
    "category": "Le Présent Simple",
    "cefr": "A1",
    "structure_formula": "Sujet + like / love / don't like / hate + Nom OU Verbe-ING",
    "rule": "Pour parler de ce qu'on aime ou déteste, on utilise 'like', 'love', 'hate'. Si un verbe d'action suit, il prend la marque '-ing'.",
    "tip": "Exemple : 'I like swimming' (J'aime nager), 'She loves reading' (Elle adore lire).",
    "example_en": "I love listening to music in my bedroom.",
    "example_fr": "J'adore écouter de la musique dans ma chambre.",
    "exercise": {
      "instruction": "Ordonnez la phrase exprimant une préférence avec la forme -ING :",
      "french_prompt": "Ils aiment lire des livres d'aventure.",
      "scrambled_words": [
        "books",
        "reading",
        "adventure",
        "like",
        "They"
      ],
      "correct_tokens": [
        "They",
        "like",
        "reading",
        "adventure",
        "books"
      ],
      "explanation": "Sujet (They) + verbe de goût (like) + verbe en -ing (reading) + nom composé (adventure books)."
    }
  },
  {
    "id": "g6e_16",
    "number": 16,
    "title": "Le Présent BE + -ING (Présent Continu) — Forme affirmative",
    "category": "Le Présent BE + -ING",
    "cefr": "A1",
    "structure_formula": "Sujet + BE (am / is / are) + Verbe-ING + Complément",
    "rule": "Le présent BE + -ING sert à décrire une action qui se déroule au moment où l'on parle (en ce moment, right now). Il se compose de l'auxiliaire BE conjugué suivi du verbe d'action avec le suffixe '-ing'.",
    "tip": "N'oubliez ni l'un ni l'autre : il faut TOUJOURS l'auxiliaire BE ET la forme -ING ! On ne peut pas dire *'I watching'*, mais 'I am watching'.",
    "example_en": "Look! The cat is climbing the tree.",
    "example_fr": "Regarde ! Le chat est en train de grimper à l'arbre.",
    "exercise": {
      "instruction": "Structurez la phrase au présent continu pour une action en cours :",
      "french_prompt": "Elle est en train d'écrire une lettre maintenant.",
      "scrambled_words": [
        "a",
        "is",
        "now",
        "writing",
        "letter",
        "She"
      ],
      "correct_tokens": [
        "She",
        "is",
        "writing",
        "a",
        "letter",
        "now"
      ],
      "explanation": "Sujet (She) + BE (is) + Verbe-ing (writing) + COD (a letter) + adverbe temporel (now)."
    }
  },
  {
    "id": "g6e_17",
    "number": 17,
    "title": "Le Présent BE + -ING — Forme négative",
    "category": "Le Présent BE + -ING",
    "cefr": "A1",
    "structure_formula": "Sujet + am not / isn't / aren't + Verbe-ING + Complément",
    "rule": "Pour la négation, on place simplement 'not' sur l'auxiliaire BE. Le verbe conserve toujours son suffixe '-ing'.",
    "tip": "Ne mettez pas 'don't' ou 'doesn't' ! Le verbe BE est son propre auxiliaire : 'They aren't sleeping'.",
    "example_en": "We aren't watching TV at the moment.",
    "example_fr": "Nous ne sommes pas en train de regarder la télé en ce moment.",
    "exercise": {
      "instruction": "Assemblez la phrase négative au présent en -ING :",
      "french_prompt": "Il n'est pas en train de faire ses devoirs.",
      "scrambled_words": [
        "his",
        "isn't",
        "doing",
        "He",
        "homework"
      ],
      "correct_tokens": [
        "He",
        "isn't",
        "doing",
        "his",
        "homework"
      ],
      "explanation": "Sujet (He) + isn't + Verbe-ing (doing) + COD (his homework)."
    }
  },
  {
    "id": "g6e_18",
    "number": 18,
    "title": "Le Présent BE + -ING — Questions et réponses courtes",
    "category": "Le Présent BE + -ING",
    "cefr": "A1",
    "structure_formula": "Am / Is / Are + Sujet + Verbe-ING + ? | Yes, S + be. / No, S + be not.",
    "rule": "Dans la question, l'auxiliaire BE s'inverse avec le sujet, tandis que le verbe en '-ing' reste après le sujet. Dans la réponse courte, on n'utilise que BE.",
    "tip": "Question : 'Are you listening?' -> Réponse courte : 'Yes, I am.' (sans le verbe en -ing).",
    "example_en": "Are they playing football in the garden? — Yes, they are.",
    "example_fr": "Sont-ils en train de jouer au football dans le jardin ? — Oui.",
    "exercise": {
      "instruction": "Formez la question au présent BE + -ING :",
      "french_prompt": "Est-ce qu'il pleut dehors ?",
      "scrambled_words": [
        "outside",
        "raining",
        "Is",
        "it",
        "?"
      ],
      "correct_tokens": [
        "Is",
        "it",
        "raining",
        "outside",
        "?"
      ],
      "explanation": "Auxiliaire BE (Is) + Sujet impersonnel (it) + Verbe-ing (raining) + Complément de lieu (outside) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_19",
    "number": 19,
    "title": "Distinguer Présent Simple (habitude) et Présent BE + -ING (action en cours)",
    "category": "Le Présent BE + -ING",
    "cefr": "A1+",
    "structure_formula": "Mots clés d'habitude : every day, usually | Mots clés du moment : now, look, listen, at the moment",
    "rule": "Utilisez le présent simple pour ce qui est régulier, habituel ou toujours vrai. Utilisez BE + -ING pour ce qui se produit sous vos yeux, au moment présent.",
    "tip": "Repérez les indices temporels : 'always', 'everyday' annoncent le présent simple. 'Now', 'Listen!' annoncent BE + -ING.",
    "example_en": "I usually walk to school, but today I am riding my bike.",
    "example_fr": "D'habitude je vais à pied à l'école, mais aujourd'hui je fais du vélo.",
    "exercise": {
      "instruction": "Placez les mots pour exprimer une action se déroulant en ce moment :",
      "french_prompt": "Regarde, le professeur est en train d'arriver.",
      "scrambled_words": [
        "coming",
        "Look,",
        "the",
        "is",
        "teacher"
      ],
      "correct_tokens": [
        "Look,",
        "the",
        "teacher",
        "is",
        "coming"
      ],
      "explanation": "Marqueur d'attention (Look,) + Sujet (the teacher) + Auxiliaire (is) + Verbe-ing (coming)."
    }
  },
  {
    "id": "g6e_20",
    "number": 20,
    "title": "Le modal CAN — Exprimer la capacité et le savoir-faire",
    "category": "Les Modaux (CAN / CAN'T)",
    "cefr": "A1",
    "structure_formula": "Sujet + CAN + Base Verbale (SANS 'to', SANS '-s')",
    "rule": "CAN est un auxiliaire modal invariable : il ne prend JAMAIS de '-s' à la 3e personne et est toujours suivi directement de la base verbale sans 'to'.",
    "tip": "Ne dites jamais *'He cans swim'* ou *'He can to swim'* ! Dites toujours 'He can swim'.",
    "example_en": "She can play the piano very well.",
    "example_fr": "Elle sait très bien jouer du piano.",
    "exercise": {
      "instruction": "Construisez la phrase avec le modal CAN :",
      "french_prompt": "Mon petit frère sait nager comme un poisson.",
      "scrambled_words": [
        "swim",
        "can",
        "My",
        "brother",
        "little"
      ],
      "correct_tokens": [
        "My",
        "little",
        "brother",
        "can",
        "swim"
      ],
      "explanation": "Sujet complet (My little brother) + modal invariable (can) + base verbale (swim)."
    }
  },
  {
    "id": "g6e_21",
    "number": 21,
    "title": "Le modal CAN'T — Exprimer l'incapacité",
    "category": "Les Modaux (CAN / CAN'T)",
    "cefr": "A1",
    "structure_formula": "Sujet + CAN'T (cannot) + Base Verbale",
    "rule": "Pour exprimer qu'on ne sait pas ou qu'on ne peut pas faire quelque chose, on utilise la contraction 'can't'.",
    "tip": "À l'oral britannique, 'can't' se prononce /kɑːnt/ avec un son 'a' long, alors qu'en américain c'est /kænt/.",
    "example_en": "I can't find my English workbook.",
    "example_fr": "Je ne peux pas trouver mon cahier d'activités d'anglais.",
    "exercise": {
      "instruction": "Formez la phrase d'incapacité avec CAN'T :",
      "french_prompt": "Les manchots ne peuvent pas voler.",
      "scrambled_words": [
        "can't",
        "Penguins",
        "fly"
      ],
      "correct_tokens": [
        "Penguins",
        "can't",
        "fly"
      ],
      "explanation": "Sujet au pluriel (Penguins) + modal négatif (can't) + base verbale (fly)."
    }
  },
  {
    "id": "g6e_22",
    "number": 22,
    "title": "Questions et réponses courtes avec CAN",
    "category": "Les Modaux (CAN / CAN'T)",
    "cefr": "A1",
    "structure_formula": "Can + Sujet + Base Verbale + ? | Yes, S + can. / No, S + can't.",
    "rule": "Pour poser une question sur une capacité ou demander une permission polie, 'Can' passe en tête de phrase. La réponse courte reprend 'can' ou 'can't'.",
    "tip": "En classe : 'Can I open the window, please?' (Puis-je ouvrir la fenêtre, s'il vous plaît ?).",
    "example_en": "Can you speak Spanish? — Yes, I can. / No, I can't.",
    "example_fr": "Sais-tu parler espagnol ? — Oui. / Non.",
    "exercise": {
      "instruction": "Reconstituez la question demandant une capacité :",
      "french_prompt": "Peux-tu m'aider avec mes devoirs ?",
      "scrambled_words": [
        "Can",
        "homework",
        "help",
        "my",
        "me",
        "you",
        "with",
        "?"
      ],
      "correct_tokens": [
        "Can",
        "you",
        "help",
        "me",
        "with",
        "my",
        "homework",
        "?"
      ],
      "explanation": "Modal (Can) + Sujet (you) + Base Verbale (help) + Pronom complément (me) + Préposition et nom (with my homework) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_23",
    "number": 23,
    "title": "L'Impératif affirmatif — Donner des consignes et instructions",
    "category": "L'Impératif & Consignes",
    "cefr": "A1",
    "structure_formula": "Base Verbale directement (PAS de sujet exprimé)",
    "rule": "L'impératif s'emploie pour donner un ordre, un conseil ou une consigne en classe. On utilise la base verbale directement, sans aucun pronom sujet !",
    "tip": "C'est la forme que le professeur d'anglais utilise tous les jours : 'Listen!', 'Repeat!', 'Open your books!'.",
    "example_en": "Open your English books to page fifteen.",
    "example_fr": "Ouvrez vos livres d'anglais à la page quinze.",
    "exercise": {
      "instruction": "Donnez la consigne de classe à l'impératif :",
      "french_prompt": "Écoutez attentivement le dialogue audio.",
      "scrambled_words": [
        "carefully",
        "Listen",
        "dialogue",
        "the",
        "to"
      ],
      "correct_tokens": [
        "Listen",
        "carefully",
        "to",
        "the",
        "dialogue"
      ],
      "explanation": "Verbe impératif (Listen) + Adverbe (carefully) + Préposition (to) + Complément d'objet (the dialogue)."
    }
  },
  {
    "id": "g6e_24",
    "number": 24,
    "title": "L'Impératif négatif — Exprimer l'interdiction avec DON'T",
    "category": "L'Impératif & Consignes",
    "cefr": "A1",
    "structure_formula": "DON'T + Base Verbale + Complément",
    "rule": "Pour interdire une action ou dire de ne pas faire quelque chose, on place systématiquement 'Don't' devant le verbe.",
    "tip": "À l'impératif, on utilise TOUJOURS 'Don't', que l'on s'adresse à une seule personne ou à toute la classe.",
    "example_en": "Don't run in the school corridor!",
    "example_fr": "Ne courez pas dans le couloir de l'école !",
    "exercise": {
      "instruction": "Formulez l'interdiction avec DON'T :",
      "french_prompt": "Ne parlez pas pendant l'examen.",
      "scrambled_words": [
        "during",
        "Don't",
        "the",
        "talk",
        "test"
      ],
      "correct_tokens": [
        "Don't",
        "talk",
        "during",
        "the",
        "test"
      ],
      "explanation": "Interdiction (Don't) + Base Verbale (talk) + Préposition de temps (during) + Nom (the test)."
    }
  },
  {
    "id": "g6e_25",
    "number": 25,
    "title": "La politesse avec PLEASE et les demandes courtoises",
    "category": "L'Impératif & Consignes",
    "cefr": "A1",
    "structure_formula": "Please + Impératif OU Impératif + , please",
    "rule": "'Please' (s'il vous plaît) adoucit l'impératif pour en faire une requête polie. On peut le placer au tout début ou à la toute fin de la phrase.",
    "tip": "Quand 'please' est placé à la fin de la phrase, on met généralement une virgule juste avant : 'Stand up, please'.",
    "example_en": "Please close the door, it is cold outside.",
    "example_fr": "Ferme la porte s'il te plaît, il fait froid dehors.",
    "exercise": {
      "instruction": "Construisez la demande polie en classe :",
      "french_prompt": "Levez la main, s'il vous plaît.",
      "scrambled_words": [
        "hand,",
        "your",
        "please",
        "Raise"
      ],
      "correct_tokens": [
        "Raise",
        "your",
        "hand,",
        "please"
      ],
      "explanation": "Verbe impératif (Raise) + COD (your hand,) + formule de politesse (please)."
    }
  },
  {
    "id": "g6e_26",
    "number": 26,
    "title": "L'article indéfini : A devant un mot commençant par une consonne",
    "category": "Les Déterminants & Articles",
    "cefr": "A1",
    "structure_formula": "A + nom singulier commençant par un son consonne",
    "rule": "'A' correspond à 'un' ou 'une' devant un mot dénombrable au singulier débutant par un son consonne (b, c, d, p, t, s, etc.).",
    "tip": "Attention au 'u' : s'il se prononce /juː/ comme dans 'uniform' ou 'university', on emploie 'A' car c'est un son semi-consonne ('a uniform').",
    "example_en": "I have got a blue pen and a yellow notebook.",
    "example_fr": "J'ai un stylo bleu et un cahier jaune.",
    "exercise": {
      "instruction": "Placez l'article A devant le mot approprié :",
      "french_prompt": "Il y a un grand tableau noir dans la classe.",
      "scrambled_words": [
        "blackboard",
        "There",
        "is",
        "a",
        "big"
      ],
      "correct_tokens": [
        "There",
        "is",
        "a",
        "big",
        "blackboard"
      ],
      "explanation": "Locution (There is) + article indéfini (a) + adjectif (big) + nom dénombrable singulier (blackboard)."
    }
  },
  {
    "id": "g6e_27",
    "number": 27,
    "title": "L'article indéfini : AN devant un son voyelle",
    "category": "Les Déterminants & Articles",
    "cefr": "A1",
    "structure_formula": "AN + nom singulier commençant par un son voyelle (a, e, i, o, u)",
    "rule": "On utilise 'an' devant les noms singuliers qui débutent par un son voyelle pour faciliter la liaison et éviter le choc de deux voyelles.",
    "tip": "C'est le SON qui compte : 'an apple', 'an elephant', 'an umbrella', 'an hour' (car le 'h' est muet dans hour !).",
    "example_en": "Can I have an orange, please?",
    "example_fr": "Puis-je avoir une orange, s'il vous plaît ?",
    "exercise": {
      "instruction": "Formez la phrase avec l'article AN devant le son voyelle :",
      "french_prompt": "Elle mange une pomme rouge.",
      "scrambled_words": [
        "apple",
        "She",
        "eats",
        "an"
      ],
      "correct_tokens": [
        "She",
        "eats",
        "an",
        "apple"
      ],
      "explanation": "Sujet (She) + Verbe (eats) + Article élidé (an) + Nom commençant par voyelle (apple)."
    }
  },
  {
    "id": "g6e_28",
    "number": 28,
    "title": "L'article défini THE (Le, la, les)",
    "category": "Les Déterminants & Articles",
    "cefr": "A1",
    "structure_formula": "THE + nom (singulier ou pluriel)",
    "rule": "'The' est l'article défini unique en anglais (invariable au masculin, féminin, singulier et pluriel). Il désigne un élément précis ou déjà connu de la conversation.",
    "tip": "'The' se prononce /ðə/ devant consonne ('the dog') et /ðiː/ devant voyelle ('the apple').",
    "example_en": "The keys are on the kitchen table.",
    "example_fr": "Les clés sont sur la table de la cuisine.",
    "exercise": {
      "instruction": "Ordonnez la phrase avec l'article défini THE :",
      "french_prompt": "Le soleil brille dans le ciel.",
      "scrambled_words": [
        "The",
        "in",
        "shining",
        "sky",
        "the",
        "sun",
        "is"
      ],
      "correct_tokens": [
        "The",
        "sun",
        "is",
        "shining",
        "in",
        "the",
        "sky"
      ],
      "explanation": "Sujet défini (The sun) + verbe être (is) + participe (shining) + complément de lieu défini (in the sky)."
    }
  },
  {
    "id": "g6e_29",
    "number": 29,
    "title": "L'Article Zéro ∅ (Généralités et matières scolaires)",
    "category": "Les Déterminants & Articles",
    "cefr": "A1+",
    "structure_formula": "∅ + Nom pluriel (pour parler en général) OU ∅ + Matière scolaire",
    "rule": "En anglais, quand on parle d'une chose ou d'une catégorie en général, ou d'une matière scolaire, on ne met AUCUN article devant le nom !",
    "tip": "En français on dit 'J'aime LE chocolat' ou 'J'aime L'histoire', mais en anglais c'est 'I like chocolate' et 'I like history' (sans 'the').",
    "example_en": "I love animals and I study geography on Monday.",
    "example_fr": "J'adore les animaux et j'étudie la géographie le lundi.",
    "exercise": {
      "instruction": "Formez la phrase exprimant une vérité générale sans article :",
      "french_prompt": "Les chats dorment beaucoup.",
      "scrambled_words": [
        "lot",
        "sleep",
        "Cats",
        "a"
      ],
      "correct_tokens": [
        "Cats",
        "sleep",
        "a",
        "lot"
      ],
      "explanation": "Sujet sans article pour la généralité (Cats) + verbe (sleep) + locution adverbiale (a lot)."
    }
  },
  {
    "id": "g6e_30",
    "number": 30,
    "title": "Les démonstratifs au singulier : THIS (proche) et THAT (éloigné)",
    "category": "Les Démonstratifs",
    "cefr": "A1",
    "structure_formula": "THIS + nom singulier (près) | THAT + nom singulier (loin)",
    "rule": "'This' s'emploie pour désigner un objet ou une personne proche dans l'espace ou le temps (ici). 'That' s'emploie pour désigner ce qui est éloigné (là-bas).",
    "tip": "THIS = ici dans ma main / près de moi. THAT = là-bas / plus loin.",
    "example_en": "This book is mine, but that bag over there is Lucas's.",
    "example_fr": "Ce livre-ci est à moi, mais ce sac là-bas est à Lucas.",
    "exercise": {
      "instruction": "Reconstituez la phrase utilisant le démonstratif proche THIS :",
      "french_prompt": "Ce stylo bleu est très neuf.",
      "scrambled_words": [
        "new",
        "pen",
        "is",
        "blue",
        "This",
        "very"
      ],
      "correct_tokens": [
        "This",
        "blue",
        "pen",
        "is",
        "very",
        "new"
      ],
      "explanation": "Démonstratif (This) + Adjectif couleur (blue) + Nom (pen) + Verbe (is) + Adjectif attribut (very new)."
    }
  },
  {
    "id": "g6e_31",
    "number": 31,
    "title": "Les démonstratifs au pluriel : THESE (proches) et THOSE (éloignés)",
    "category": "Les Démonstratifs",
    "cefr": "A1",
    "structure_formula": "THESE + nom pluriel (près) | THOSE + nom pluriel (loin)",
    "rule": "'These' est le pluriel de 'this' (ces objets-ci, proches). 'Those' est le pluriel de 'that' (ces objets-là, éloignés).",
    "tip": "'These' se prononce /ðiːz/ avec un 'i' long et un 's' voisé /z/. 'This' se prononce /ðɪs/ avec un son court.",
    "example_en": "These shoes are comfortable, but those boots are heavy.",
    "example_fr": "Ces chaussures-ci sont confortables, mais ces bottes-là sont lourdes.",
    "exercise": {
      "instruction": "Structurez la phrase au pluriel avec THESE :",
      "french_prompt": "Ces gâteaux sont délicieux.",
      "scrambled_words": [
        "cakes",
        "delicious",
        "These",
        "are"
      ],
      "correct_tokens": [
        "These",
        "cakes",
        "are",
        "delicious"
      ],
      "explanation": "Démonstratif pluriel (These) + Nom pluriel (cakes) + Verbe BE pluriel (are) + Adjectif (delicious)."
    }
  },
  {
    "id": "g6e_32",
    "number": 32,
    "title": "Les questions d'identification : What is this? / What are these?",
    "category": "Les Démonstratifs",
    "cefr": "A1",
    "structure_formula": "What is this/that? -> It's a... | What are these/those? -> They're...",
    "rule": "Pour demander l'identité d'un objet inconnu, on pose la question avec 'What is this?'. Pour plusieurs objets, 'What are these?'.",
    "tip": "Dans la réponse, on ne répète pas 'this' ou 'these' : on utilise 'It is a...' pour le singulier et 'They are...' pour le pluriel.",
    "example_en": "What is that in the sky? — It's an eagle.",
    "example_fr": "Qu'est-ce que c'est là-bas dans le ciel ? — C'est un aigle.",
    "exercise": {
      "instruction": "Construisez la question pour identifier un objet singulier :",
      "french_prompt": "Qu'est-ce que c'est sur la table ?",
      "scrambled_words": [
        "table",
        "on",
        "What",
        "is",
        "this",
        "the",
        "?"
      ],
      "correct_tokens": [
        "What",
        "is",
        "this",
        "on",
        "the",
        "table",
        "?"
      ],
      "explanation": "Mot interrogatif (What) + verbe (is) + démonstratif (this) + complément de lieu (on the table) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_33",
    "number": 33,
    "title": "Les pronoms personnels sujets (I, you, he, she, it, we, they)",
    "category": "Les Pronoms",
    "cefr": "A1",
    "structure_formula": "Pronom Sujet + Verbe conjugué",
    "rule": "Le pronom personnel sujet indique qui fait l'action. 'I' s'écrit TOUJOURS avec une majuscule ! 'He' désigne un homme/garçon, 'she' une femme/fille, et 'it' un objet ou un animal.",
    "tip": "En anglais, le sujet n'est JAMAIS sous-entendu ! Contrairement à l'espagnol ou l'italien, on ne peut pas l'omettre.",
    "example_en": "He is my cousin and they are my best friends.",
    "example_fr": "Il est mon cousin et ils sont mes meilleurs amis.",
    "exercise": {
      "instruction": "Formez la phrase avec le bon pronom personnel sujet :",
      "french_prompt": "Ils jouent au tennis tous les dimanches.",
      "scrambled_words": [
        "tennis",
        "play",
        "Sundays",
        "They",
        "on"
      ],
      "correct_tokens": [
        "They",
        "play",
        "tennis",
        "on",
        "Sundays"
      ],
      "explanation": "Pronom sujet 3e personne pluriel (They) + verbe (play) + complément d'objet (tennis) + complément de temps (on Sundays)."
    }
  },
  {
    "id": "g6e_34",
    "number": 34,
    "title": "Les pronoms personnels compléments (me, you, him, her, it, us, them)",
    "category": "Les Pronoms",
    "cefr": "A1",
    "structure_formula": "Verbe / Préposition + me / you / him / her / it / us / them",
    "rule": "Quand la personne reçoit l'action (complément d'objet) ou vient après une préposition (with, for, to), on emploie les pronoms compléments : me, you, him, her, it, us, them.",
    "tip": "Après une préposition, utilisez toujours un pronom complément : 'Come with ME' (et jamais *'Come with I'*).",
    "example_en": "Listen to him, he is speaking to us.",
    "example_fr": "Écoute-le, il est en train de nous parler.",
    "exercise": {
      "instruction": "Placez le pronom complément après le verbe :",
      "french_prompt": "Le professeur les aide avec l'exercice.",
      "scrambled_words": [
        "exercise",
        "helps",
        "teacher",
        "them",
        "with",
        "The",
        "the"
      ],
      "correct_tokens": [
        "The",
        "teacher",
        "helps",
        "them",
        "with",
        "the",
        "exercise"
      ],
      "explanation": "Sujet (The teacher) + verbe (helps) + pronom complément d'objet (them) + prépositionnel (with the exercise)."
    }
  },
  {
    "id": "g6e_35",
    "number": 35,
    "title": "Les adjectifs possessifs singuliers (my, your, his, her, its)",
    "category": "Les Possessifs",
    "cefr": "A1",
    "structure_formula": "my / your / his / her / its + Nom",
    "rule": "Les adjectifs possessifs indiquent à qui appartient l'objet. En anglais, ils s'accordent avec le POSSÉSSEUR (celui qui possède), et non avec l'objet possédé !",
    "tip": "Si le possesseur est un garçon -> 'HIS' (his sister = sa sœur). Si le possesseur est une fille -> 'HER' (her brother = son frère).",
    "example_en": "Tom is with his sister and Emma is with her brother.",
    "example_fr": "Tom est avec sa sœur et Emma est avec son frère.",
    "exercise": {
      "instruction": "Assemblez la phrase en utilisant l'adjectif possessif accordé au possesseur féminin :",
      "french_prompt": "Emma adore sa nouvelle trousse.",
      "scrambled_words": [
        "pencil",
        "Emma",
        "her",
        "case",
        "new",
        "loves"
      ],
      "correct_tokens": [
        "Emma",
        "loves",
        "her",
        "new",
        "pencil",
        "case"
      ],
      "explanation": "Sujet féminin (Emma) + verbe (loves) + possessif féminin (her) + adjectif (new) + nom composé (pencil case)."
    }
  },
  {
    "id": "g6e_36",
    "number": 36,
    "title": "Les adjectifs possessifs pluriels (our, your, their)",
    "category": "Les Possessifs",
    "cefr": "A1",
    "structure_formula": "our / your / their + Nom",
    "rule": "'Our' = notre/nos (possédé par nous). 'Your' = votre/vos (possédé par vous). 'Their' = leur/leurs (possédé par eux/elles). Ils sont toujours invariables !",
    "tip": "En anglais, les adjectifs possessifs ne prennent JAMAIS de '-s' au pluriel ! On dit 'our books', pas *'ours books'*.",
    "example_en": "Our classroom is large and their school is modern.",
    "example_fr": "Notre salle de classe est grande et leur école est moderne.",
    "exercise": {
      "instruction": "Formez la phrase avec l'adjectif possessif pluriel OUR :",
      "french_prompt": "Notre professeur d'anglais est très gentil.",
      "scrambled_words": [
        "nice",
        "English",
        "is",
        "Our",
        "teacher",
        "very"
      ],
      "correct_tokens": [
        "Our",
        "English",
        "teacher",
        "is",
        "very",
        "nice"
      ],
      "explanation": "Adjectif possessif (Our) + adjectif de matière (English) + nom (teacher) + verbe être (is) + attribut (very nice)."
    }
  },
  {
    "id": "g6e_37",
    "number": 37,
    "title": "Le Génitif 'S au singulier — Marquer la possession et les liens",
    "category": "Le Génitif (La Possession)",
    "cefr": "A1",
    "structure_formula": "Possesseur + 's + Objet possédé (SANS 'the')",
    "rule": "Le génitif permet de désigner à qui appartient quelque chose ou un lien de famille. On nomme d'abord le possesseur, on ajoute l'apostrophe-s, puis l'objet possédé.",
    "tip": "En français on dit 'le chien de Paul', mais en anglais on inverse : 'Paul's dog' (et sans mettre 'the' devant Paul !).",
    "example_en": "This is my mother's car and that is Peter's skateboard.",
    "example_fr": "C'est la voiture de ma mère et ça c'est le skate de Peter.",
    "exercise": {
      "instruction": "Traduisez 'le chien de Sarah' avec le génitif 's :",
      "french_prompt": "Le chien de Sarah est très joueur.",
      "scrambled_words": [
        "playful",
        "is",
        "dog",
        "Sarah's",
        "very"
      ],
      "correct_tokens": [
        "Sarah's",
        "dog",
        "is",
        "very",
        "playful"
      ],
      "explanation": "Possesseur avec génitif (Sarah's) + nom possédé (dog) + verbe (is) + adjectif (very playful)."
    }
  },
  {
    "id": "g6e_38",
    "number": 38,
    "title": "Le Génitif avec un pluriel régulier en -S (Apostrophe seule)",
    "category": "Le Génitif (La Possession)",
    "cefr": "A1+",
    "structure_formula": "Nom pluriel en -s + ' (apostrophe seule sans second 's')",
    "rule": "Quand le possesseur est un nom pluriel qui se termine déjà par un '-s', on ajoute simplement l'apostrophe après le 's' sans rajouter de lettre.",
    "tip": "Exemple : 'the boys' room' (la chambre des garçons). Si le pluriel est irrégulier sans '-s', on remet ''s' : 'the children's toys'.",
    "example_en": "The students' bags are in the classroom.",
    "example_fr": "Les sacs des élèves sont dans la salle de classe.",
    "exercise": {
      "instruction": "Placez les éléments pour former la phrase au génitif pluriel :",
      "french_prompt": "La salle des professeurs est au premier étage.",
      "scrambled_words": [
        "room",
        "floor",
        "The",
        "first",
        "teachers'",
        "is",
        "the",
        "on"
      ],
      "correct_tokens": [
        "The",
        "teachers'",
        "room",
        "is",
        "on",
        "the",
        "first",
        "floor"
      ],
      "explanation": "Article (The) + possesseurs pluriels (teachers') + nom (room) + verbe (is) + prépositionnel (on the first floor)."
    }
  },
  {
    "id": "g6e_39",
    "number": 39,
    "title": "Mots interrogatifs : WHAT (Quoi / Quel) et WHO (Qui)",
    "category": "Les Mots Interrogatifs",
    "cefr": "A1",
    "structure_formula": "What / Who + auxiliaire + sujet + verbe + ?",
    "rule": "'What' interroge sur une chose, une action ou une identité ('What is your name?'). 'Who' interroge sur une personne ('Who is that girl?').",
    "tip": "Pour demander le métier de quelqu'un : 'What does he do?'. Pour demander qui c'est : 'Who is he?'.",
    "example_en": "What is your favourite subject? — Who is your teacher?",
    "example_fr": "Quelle est ta matière préférée ? — Qui est ton professeur ?",
    "exercise": {
      "instruction": "Construisez la question pour demander le nom :",
      "french_prompt": "Quel est ton nom de famille ?",
      "scrambled_words": [
        "name",
        "is",
        "your",
        "What",
        "last",
        "?"
      ],
      "correct_tokens": [
        "What",
        "is",
        "your",
        "last",
        "name",
        "?"
      ],
      "explanation": "Mot interrogatif (What) + verbe (is) + possessif (your) + nom composé (last name) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_40",
    "number": 40,
    "title": "Mots interrogatifs : WHERE (Où) et WHEN (Quand)",
    "category": "Les Mots Interrogatifs",
    "cefr": "A1",
    "structure_formula": "Where / When + auxiliaire (do/does/is/are) + sujet + base verbale + ?",
    "rule": "'Where' sert à poser une question sur le lieu ('Where do you live?'). 'When' sert à poser une question sur le moment ou la date ('When is your birthday?').",
    "tip": "N'oubliez pas l'auxiliaire ! On dit 'Where DO you live?' et non pas *'Where you live?'*.",
    "example_en": "Where do you play football on Wednesday?",
    "example_fr": "Où joues-tu au football le mercredi ?",
    "exercise": {
      "instruction": "Reconstituez la question de lieu avec WHERE et DO :",
      "french_prompt": "Où habites-tu ?",
      "scrambled_words": [
        "live",
        "do",
        "Where",
        "you",
        "?"
      ],
      "correct_tokens": [
        "Where",
        "do",
        "you",
        "live",
        "?"
      ],
      "explanation": "Mot interrogatif (Where) + auxiliaire (do) + sujet (you) + verbe (live) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_41",
    "number": 41,
    "title": "Mot interrogatif : WHY (Pourquoi) et la réponse avec BECAUSE (Parce que)",
    "category": "Les Mots Interrogatifs",
    "cefr": "A1",
    "structure_formula": "Why + aux + sujet + verbe + ? -> Because + sujet + verbe...",
    "rule": "'Why' permet de demander la cause ou la raison. Dans la réponse, on utilise TOUJOURS 'Because' (parce que).",
    "tip": "En anglais, on ne répond JAMAIS à 'Why' par *'For'* ! La réponse commence toujours par 'Because'.",
    "example_en": "Why are you happy? — Because it is my birthday!",
    "example_fr": "Pourquoi es-tu heureux ? — Parce que c'est mon anniversaire !",
    "exercise": {
      "instruction": "Formez la question demandant la raison avec WHY :",
      "french_prompt": "Pourquoi es-tu en retard ce matin ?",
      "scrambled_words": [
        "morning",
        "late",
        "are",
        "you",
        "this",
        "Why",
        "?"
      ],
      "correct_tokens": [
        "Why",
        "are",
        "you",
        "late",
        "this",
        "morning",
        "?"
      ],
      "explanation": "Question (Why) + verbe BE (are) + sujet (you) + adjectif (late) + marqueur de temps (this morning) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_42",
    "number": 42,
    "title": "Les questions quantitatives : HOW OLD (L'âge) et HOW MANY (Le nombre)",
    "category": "Les Mots Interrogatifs",
    "cefr": "A1",
    "structure_formula": "How old are you? | How many + nom pluriel + do you have/have you got?",
    "rule": "En anglais, on n'utilise pas le verbe avoir pour l'âge : on demande 'How old are you?' (avec le verbe être). 'How many' s'emploie pour dénombrer des objets et est toujours suivi d'un nom au pluriel.",
    "tip": "Pour dire son âge : 'I AM twelve years old' (verbe BE), et JAMAIS *'I have twelve years' !*",
    "example_en": "How many brothers and sisters have you got?",
    "example_fr": "Combien de frères et sœurs as-tu ?",
    "exercise": {
      "instruction": "Construisez la question demandant l'âge :",
      "french_prompt": "Quel âge a ta sœur ?",
      "scrambled_words": [
        "sister",
        "is",
        "old",
        "your",
        "How",
        "?"
      ],
      "correct_tokens": [
        "How",
        "old",
        "is",
        "your",
        "sister",
        "?"
      ],
      "explanation": "Locution interrogative (How old) + verbe BE (is) + sujet (your sister) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_43",
    "number": 43,
    "title": "THERE IS — Exprimer l'existence au singulier",
    "category": "There is / There are",
    "cefr": "A1",
    "structure_formula": "THERE IS (There's) + nom singulier / indénombrable",
    "rule": "'There is' signifie 'il y a' devant un élément au singulier. À l'oral, on le contracte fréquemment en 'There's'.",
    "tip": "En français, 'il y a' est invariable. Mais en anglais, on DOIT accorder : 'There is' pour 1 seul objet, 'There are' pour plusieurs !",
    "example_en": "There is a computer on the teacher's desk.",
    "example_fr": "Il y a un ordinateur sur le bureau du professeur.",
    "exercise": {
      "instruction": "Structurez la phrase descriptive avec THERE IS :",
      "french_prompt": "Il y a un grand parc derrière l'école.",
      "scrambled_words": [
        "park",
        "school",
        "There",
        "behind",
        "a",
        "the",
        "big",
        "is"
      ],
      "correct_tokens": [
        "There",
        "is",
        "a",
        "big",
        "park",
        "behind",
        "the",
        "school"
      ],
      "explanation": "Locution d'existence (There is) + groupe nominal (a big park) + préposition de lieu (behind the school)."
    }
  },
  {
    "id": "g6e_44",
    "number": 44,
    "title": "THERE ARE — Exprimer l'existence au pluriel",
    "category": "There is / There are",
    "cefr": "A1",
    "structure_formula": "THERE ARE + nom au pluriel",
    "rule": "'There are' signifie 'il y a' devant un nom au pluriel. Le nom qui suit prend donc sa marque de pluriel ('-s').",
    "tip": "Attention : on ne contracte généralement pas 'There are' à l'écrit.",
    "example_en": "There are twenty-five pupils in my class.",
    "example_fr": "Il y a vingt-cinq élèves dans ma classe.",
    "exercise": {
      "instruction": "Assemblez la phrase d'existence au pluriel :",
      "french_prompt": "Il y a quatre pommes sur la table.",
      "scrambled_words": [
        "four",
        "are",
        "table",
        "the",
        "apples",
        "There",
        "on"
      ],
      "correct_tokens": [
        "There",
        "are",
        "four",
        "apples",
        "on",
        "the",
        "table"
      ],
      "explanation": "Existence plurielle (There are) + quantité et nom pluriel (four apples) + lieu (on the table)."
    }
  },
  {
    "id": "g6e_45",
    "number": 45,
    "title": "THERE IS / THERE ARE — Questions et négations",
    "category": "There is / There are",
    "cefr": "A1",
    "structure_formula": "Is there a...? / Are there any...? | There isn't... / There aren't any...",
    "rule": "Pour poser une question, on inverse : 'Is there...?' ou 'Are there...?'. Pour la négation : 'There isn't a...' (singulier) ou 'There aren't any...' (pluriel).",
    "tip": "Dans les questions et négations au pluriel, on emploie souvent 'any' : 'Are there any pens?'.",
    "example_en": "Is there a swimming pool in your town? — Yes, there is.",
    "example_fr": "Y a-t-il une piscine dans ta ville ? — Oui.",
    "exercise": {
      "instruction": "Construisez la question demandant s'il y a un objet :",
      "french_prompt": "Y a-t-il une règle dans ta trousse ?",
      "scrambled_words": [
        "pencil",
        "in",
        "ruler",
        "Is",
        "your",
        "a",
        "there",
        "case",
        "?"
      ],
      "correct_tokens": [
        "Is",
        "there",
        "a",
        "ruler",
        "in",
        "your",
        "pencil",
        "case",
        "?"
      ],
      "explanation": "Inversion interrogative (Is there) + COD singulier (a ruler) + complément de lieu (in your pencil case) + Point d'interrogation."
    }
  },
  {
    "id": "g6e_46",
    "number": 46,
    "title": "Les prépositions de lieu fondamentales : IN, ON, UNDER",
    "category": "Les Prépositions",
    "cefr": "A1",
    "structure_formula": "Sujet + BE + in (dans) / on (sur) / under (sous) + the + Nom",
    "rule": "'In' s'utilise pour ce qui est à l'intérieur d'un espace fermé (dans). 'On' pour ce qui est en contact sur une surface (sur). 'Under' pour ce qui est en-dessous (sous).",
    "tip": "Sur le mur se dit 'ON the wall', dans la boîte 'IN the box', sous la chaise 'UNDER the chair'.",
    "example_en": "The cat is sleeping under the table.",
    "example_fr": "Le chat est en train de dormir sous la table.",
    "exercise": {
      "instruction": "Formez la phrase indiquant l'emplacement avec ON :",
      "french_prompt": "Le livre d'anglais est sur le bureau.",
      "scrambled_words": [
        "desk",
        "The",
        "book",
        "on",
        "the",
        "English",
        "is"
      ],
      "correct_tokens": [
        "The",
        "English",
        "book",
        "is",
        "on",
        "the",
        "desk"
      ],
      "explanation": "Sujet (The English book) + verbe (is) + préposition de surface (on) + lieu (the desk)."
    }
  },
  {
    "id": "g6e_47",
    "number": 47,
    "title": "Les prépositions de lieu spatiales : BEHIND, IN FRONT OF, NEXT TO, BETWEEN",
    "category": "Les Prépositions",
    "cefr": "A1",
    "structure_formula": "behind (derrière) | in front of (devant) | next to (à côté de) | between... and... (entre)",
    "rule": "Ces prépositions permettent de situer précisément des objets ou des camarades dans la classe. 'In front of' signifie 'devant' (attention : 'in front of' ne veut pas dire 'en face de' !).",
    "tip": "N'oubliez pas les petits mots : 'next TO' (avec to), 'in front OF' (avec of).",
    "example_en": "Leo sits next to me and in front of Sarah.",
    "example_fr": "Léo s'assoit à côté de moi et devant Sarah.",
    "exercise": {
      "instruction": "Reconstituez la phrase utilisant la préposition NEXT TO :",
      "french_prompt": "La bibliothèque est à côté du parc.",
      "scrambled_words": [
        "library",
        "The",
        "park",
        "is",
        "to",
        "the",
        "next"
      ],
      "correct_tokens": [
        "The",
        "library",
        "is",
        "next",
        "to",
        "the",
        "park"
      ],
      "explanation": "Sujet (The library) + verbe (is) + locution prépositionnelle (next to) + complément (the park)."
    }
  },
  {
    "id": "g6e_48",
    "number": 48,
    "title": "Les prépositions de temps : AT (heures), ON (jours), IN (mois et saisons)",
    "category": "Les Prépositions",
    "cefr": "A1",
    "structure_formula": "AT + heure précise | ON + jour de la semaine | IN + mois / saison / année",
    "rule": "Règle de précision temporelle : on utilise 'at' pour une heure précise (at 8 o'clock), 'on' pour un jour particulier (on Monday, on my birthday), et 'in' pour une longue période (in July, in winter).",
    "tip": "Règle facile : AT pour l'horloge, ON pour le calendrier (les jours), IN pour les mois et saisons !",
    "example_en": "School starts at half past eight on Monday morning.",
    "example_fr": "L'école commence à huit heures et demie le lundi matin.",
    "exercise": {
      "instruction": "Ordonnez la phrase avec les prépositions temporelles correctes :",
      "french_prompt": "Nous avons cours d'anglais le mardi à neuf heures.",
      "scrambled_words": [
        "have",
        "nine",
        "We",
        "at",
        "o'clock",
        "English",
        "Tuesdays",
        "on"
      ],
      "correct_tokens": [
        "We",
        "have",
        "English",
        "at",
        "nine",
        "o'clock",
        "on",
        "Tuesdays"
      ],
      "explanation": "Sujet (We) + verbe (have) + matière (English) + heure avec at (at nine o'clock) + jour avec on (on Tuesdays)."
    }
  },
  {
    "id": "g6e_49",
    "number": 49,
    "title": "Les adverbes de fréquence (always, usually, often, sometimes, never) et leur place",
    "category": "L'Ordre des Mots",
    "cefr": "A1+",
    "structure_formula": "AVANT un verbe ordinaire (S + Adv + V) | APRÈS le verbe BE (S + BE + Adv)",
    "rule": "Les adverbes de fréquence indiquent la régularité d'une action. Règle d'or : ils se placent AVANT les verbes ordinaires ('I ALWAYS eat breakfast'), mais APRÈS le verbe BE ('He is NEVER late').",
    "tip": "Attention : 'never' porte déjà la négation ! On ne met donc pas 'don't' ou 'not' avec 'never'. On dit 'I never eat meat', jamais *'I don't never eat' !*",
    "example_en": "She always brushes her teeth before going to bed.",
    "example_fr": "Elle se brosse toujours les dents avant d'aller au lit.",
    "exercise": {
      "instruction": "Placez l'adverbe de fréquence à la bonne position (avant le verbe ordinaire) :",
      "french_prompt": "Tom fait toujours ses devoirs après l'école.",
      "scrambled_words": [
        "homework",
        "does",
        "Tom",
        "always",
        "his",
        "school",
        "after"
      ],
      "correct_tokens": [
        "Tom",
        "always",
        "does",
        "his",
        "homework",
        "after",
        "school"
      ],
      "explanation": "Sujet (Tom) + Adverbe de fréquence (always) + Verbe ordinaire (does) + COD (his homework) + Complément de temps (after school)."
    }
  },
  {
    "id": "g6e_50",
    "number": 50,
    "title": "L'ordre des mots fondamental & la place de l'adjectif qualificatif",
    "category": "L'Ordre des Mots",
    "cefr": "A1",
    "structure_formula": "Sujet + Verbe + Complément d'Objet (SVO) | Adjectif TOUJOURS AVANT le Nom",
    "rule": "En anglais, la phrase suit l'ordre strict Sujet + Verbe + Complément. De plus, l'adjectif qualificatif se place TOUJOURS AVANT le nom qu'il qualifie et il est TOTALEMENT INVARIABLE (ne prend jamais de 's' ni de 'e') !",
    "tip": "En français on dit 'une voiture rouge', en anglais c'est 'a RED car'. Même au pluriel : 'two red cars' (l'adjectif 'red' ne prend jamais de 's').",
    "example_en": "The clever boy has got three black cats.",
    "example_fr": "Le garçon intelligent a trois chats noirs.",
    "exercise": {
      "instruction": "Remettez les mots dans l'ordre en appliquant la règle de l'adjectif épithète avant le nom :",
      "french_prompt": "Mon ami porte un joli pull bleu.",
      "scrambled_words": [
        "wears",
        "My",
        "sweater",
        "friend",
        "blue",
        "nice",
        "a"
      ],
      "correct_tokens": [
        "My",
        "friend",
        "wears",
        "a",
        "nice",
        "blue",
        "sweater"
      ],
      "explanation": "Sujet (My friend) + verbe (wears) + déterminant (a) + adjectif d'opinion et de couleur (nice blue) + nom (sweater)."
    }
  }
];

export function getGrammar6eByCategory(category: string): Grammar6eItem[] {
  if (!category || category === 'Toutes les catégories') {
    return GRAMMAR_6E_ITEMS;
  }
  return GRAMMAR_6E_ITEMS.filter((item) => item.category === category);
}

export function searchGrammar6e(query: string): Grammar6eItem[] {
  if (!query.trim()) return GRAMMAR_6E_ITEMS;
  const q = query.toLowerCase().trim();
  return GRAMMAR_6E_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(q) ||
    item.rule.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.example_en.toLowerCase().includes(q) ||
    item.example_fr.toLowerCase().includes(q) ||
    item.exercise.french_prompt.toLowerCase().includes(q)
  );
}
