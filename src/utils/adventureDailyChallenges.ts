import type {
  AdventureXpMultiplierBoost,
  CEFRLevel,
  EnglishAdventureState,
  SkillKey
} from '../firebase/types';
import {
  ADVENTURE_ISLANDS,
  type AdventureIsland,
  type AdventureMission,
  type AdventureQuestion
} from '../data/englishAdventureData';

export type DailySkillPairId =
  | 'listening_vocabulary'
  | 'grammar_writing'
  | 'reading_vocabulary'
  | 'listening_speaking'
  | 'reading_writing'
  | 'grammar_speaking';

export interface AdventureDailyChallenge {
  id: string; // e.g. daily_2026_11_25_B1_listening_vocabulary
  dateKey: string; // YYYY-MM-DD
  pairId: DailySkillPairId;
  skills: [SkillKey, SkillKey];
  skillLabelsFr: [string, string];
  skillPairLabelFr: string;
  title: string;
  objectiveFr: string;
  cefrLevel: CEFRLevel;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  passAccuracyRequired: number;
  baseXp: number;
  baseCoins: number;
  xpMultiplierReward: number; // e.g., 1.5 or 1.75
  boostDurationMinutes: number; // e.g., 120 or 150
  boostDurationLabelFr: string;
  accentHex: string;
  secondaryHex: string;
  icon: string;
  isAdaptiveFocus?: boolean;
  questions: AdventureQuestion[];
  masteryBonusQuestions: AdventureQuestion[];
}

interface DailyPairTemplate {
  pairId: DailySkillPairId;
  skills: [SkillKey, SkillKey];
  skillLabelsFr: [string, string];
  skillPairLabelFr: string;
  titleTemplate: (cefr: CEFRLevel) => string;
  objectiveFr: string;
  accentHex: string;
  secondaryHex: string;
  icon: string;
  xpMultiplierReward: number;
  boostDurationMinutes: number;
  boostDurationLabelFr: string;
}

const DAILY_PAIR_TEMPLATES: DailyPairTemplate[] = [
  {
    pairId: 'listening_vocabulary',
    skills: ['listening', 'vocabulary'],
    skillLabelsFr: ['Écoute', 'Vocabulaire'],
    skillPairLabelFr: 'Écoute + Vocabulaire',
    titleTemplate: (cefr) => `Relais Acoustique & Lexique (${cefr})`,
    objectiveFr:
      'Décrypter des énoncés UK/US puis mobiliser les collocations exactes entendues en contexte.',
    accentHex: '#2dd4bf',
    secondaryHex: '#f2ca50',
    icon: 'hearing',
    xpMultiplierReward: 1.5,
    boostDurationMinutes: 120,
    boostDurationLabelFr: '2 heures'
  },
  {
    pairId: 'grammar_writing',
    skills: ['grammar', 'writing'],
    skillLabelsFr: ['Grammaire', 'Écriture'],
    skillPairLabelFr: 'Grammaire + Écriture',
    titleTemplate: (cefr) => `Atelier Syntaxe & Plume (${cefr})`,
    objectiveFr:
      'Maîtriser la structure grammaticale ciblée avant de la réinvestir dans une rédaction précise.',
    accentHex: '#38bdf8',
    secondaryHex: '#f472b6',
    icon: 'history_edu',
    xpMultiplierReward: 1.5,
    boostDurationMinutes: 120,
    boostDurationLabelFr: '2 heures'
  },
  {
    pairId: 'reading_vocabulary',
    skills: ['reading', 'vocabulary'],
    skillLabelsFr: ['Lecture', 'Vocabulaire'],
    skillPairLabelFr: 'Lecture + Vocabulaire',
    titleTemplate: (cefr) => `Manuscrit & Précision Sémantique (${cefr})`,
    objectiveFr:
      'Analyser le sens implicite d’un texte authentique et associer son lexique clé.',
    accentHex: '#34d399',
    secondaryHex: '#f2ca50',
    icon: 'menu_book',
    xpMultiplierReward: 1.5,
    boostDurationMinutes: 120,
    boostDurationLabelFr: '2 heures'
  },
  {
    pairId: 'listening_speaking',
    skills: ['listening', 'speaking'],
    skillLabelsFr: ['Écoute', 'Expression Orale'],
    skillPairLabelFr: 'Écoute + Parole',
    titleTemplate: (cefr) => `Écho Atlantique & Élocution (${cefr})`,
    objectiveFr:
      'Comprendre l’intonation native puis reformuler avec aisance et justesse orale.',
    accentHex: '#fb923c',
    secondaryHex: '#2dd4bf',
    icon: 'record_voice_over',
    xpMultiplierReward: 1.75,
    boostDurationMinutes: 150,
    boostDurationLabelFr: '2h 30'
  },
  {
    pairId: 'reading_writing',
    skills: ['reading', 'writing'],
    skillLabelsFr: ['Lecture', 'Écriture'],
    skillPairLabelFr: 'Lecture + Écriture',
    titleTemplate: (cefr) => `Synthèse Critique & Rédaction (${cefr})`,
    objectiveFr:
      'Extraire l’idée maîtresse d’un passage puis rédiger une réponse structurée avec connecteurs.',
    accentHex: '#f472b6',
    secondaryHex: '#34d399',
    icon: 'edit_note',
    xpMultiplierReward: 1.75,
    boostDurationMinutes: 150,
    boostDurationLabelFr: '2h 30'
  },
  {
    pairId: 'grammar_speaking',
    skills: ['grammar', 'speaking'],
    skillLabelsFr: ['Grammaire', 'Expression Orale'],
    skillPairLabelFr: 'Grammaire + Parole',
    titleTemplate: (cefr) => `Architecture Orale Active (${cefr})`,
    objectiveFr:
      'Assembler des structures grammaticales solides et les formuler naturellement à voix haute.',
    accentHex: '#f2ca50',
    secondaryHex: '#fb923c',
    icon: 'forum',
    xpMultiplierReward: 1.5,
    boostDurationMinutes: 120,
    boostDurationLabelFr: '2 heures'
  }
];

const CEFR_RANK: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

// Curated CEFR-calibrated question bank guaranteeing complete A1-C2 coverage across all 6 skills
const DAILY_CURATED_BANK: Record<CEFRLevel, Partial<Record<SkillKey, AdventureQuestion[]>>> = {
  A1: {
    vocabulary: [
      {
        id: 'dc-a1-voc-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'A1',
        promptFr: 'Défi A1 · Choisissez le mot juste pour compléter la phrase du matin :',
        promptEn: 'Every morning, I ___ breakfast with my family at seven o’clock.',
        options: ['have', 'do', 'go', 'say'],
        correctIndex: 0,
        hintFr: 'En anglais, on utilise « have breakfast » (et non « take » ou « do »).',
        explanationFr: 'L’expression naturelle est « have breakfast / lunch / dinner ».',
        grammarRule: 'Collocation quotidienne : have breakfast / have a shower.'
      },
      {
        id: 'dc-a1-voc-2',
        type: 'pair_match',
        skillTested: 'vocabulary',
        cefrLevel: 'A1',
        promptFr: 'Associez chaque mot essentiel du quotidien à sa traduction :',
        promptEn: 'Match each everyday English word to its French meaning.',
        pairs: [
          { id: 'a1v1', left: 'Library', right: 'Bibliothèque' },
          { id: 'a1v2', left: 'Weather', right: 'Météo / temps' },
          { id: 'a1v3', left: 'Helpful', right: 'Utile / serviable' },
          { id: 'a1v4', left: 'Early', right: 'Tôt / en avance' }
        ],
        hintFr: 'Attention au faux-ami « Library » : ce n’est pas une librairie mais une bibliothèque !',
        explanationFr: 'Library (bibliothèque), Weather (météo), Helpful (serviable), Early (tôt).'
      }
    ],
    grammar: [
      {
        id: 'dc-a1-gram-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'A1',
        promptFr: 'Choisissez la forme correcte au présent simple (3e personne) :',
        promptEn: 'My sister ___ English books every evening.',
        options: ['read', 'reads', 'reading', 'to read'],
        correctIndex: 1,
        hintFr: 'Avec he / she / it au présent simple, le verbe prend un -s final.',
        explanationFr: '« My sister reads » : la 3e personne du singulier prend toujours -s au présent simple.'
      },
      {
        id: 'dc-a1-gram-2',
        type: 'sentence_build',
        skillTested: 'grammar',
        cefrLevel: 'A1',
        promptFr: 'Placez les mots dans l’ordre d’une question polie :',
        promptEn: 'Arrange the words into a polite question.',
        sentenceTokens: ['Where', 'is', 'the', 'nearest', 'train', 'station?'],
        expectedSentence: 'Where is the nearest train station?',
        hintFr: 'Mot interrogatif (Where) + verbe (is) + groupe nominal.',
        explanationFr: 'L’ordre interrogatif simple avec « be » place le verbe juste après le mot en Wh-.'
      }
    ],
    listening: [
      {
        id: 'dc-a1-list-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'A1',
        audioAccent: 'en-GB',
        audioScript: 'Hello! The bookshop opens at nine o’clock and closes at six.',
        promptFr: 'Écoutez le message : À quelle heure ouvre la librairie ?',
        promptEn: 'Listen and select the opening time.',
        options: ['8:00 AM', '9:00 AM', '6:00 PM', '10:00 AM'],
        correctIndex: 1,
        hintFr: 'Repérez le chiffre associé au verbe « opens ».',
        explanationFr: '« Opens at nine o’clock » = ouvre à 9 heures.'
      },
      {
        id: 'dc-a1-list-2',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'A1',
        audioAccent: 'en-US',
        audioScript: 'Today is sunny and warm, so let us walk in the park together.',
        promptFr: 'Écoutez la phrase : Quel temps fait-il aujourd’hui ?',
        promptEn: 'What is the weather like today?',
        options: [
          'Cold and rainy',
          'Sunny and warm',
          'Windy and snowy',
          'Foggy and dark'
        ],
        correctIndex: 1,
        hintFr: 'Écoutez les deux adjectifs juste après « Today is ».',
        explanationFr: '« Sunny and warm » signifie ensoleillé et doux/chaud.'
      }
    ],
    speaking: [
      {
        id: 'dc-a1-spk-1',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'A1',
        promptFr: 'Prononcez cette demande polie (au micro ou par saisie) :',
        promptEn: 'Speak or enter this polite everyday request:',
        targetSpeechPhrase: 'Excuse me, could I have a glass of water, please?',
        acceptedSpeechKeywords: ['excuse', 'glass', 'water', 'please'],
        hintFr: 'N’oubliez pas « Excuse me » au début et « please » à la fin.',
        explanationFr: 'Formule courante, polie et naturelle dans tous les pays anglophones.'
      },
      {
        id: 'dc-a1-spk-2',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'A1',
        promptFr: 'Présentez votre passe-temps simplement en anglais :',
        promptEn: 'Say or type this short personal introduction:',
        targetSpeechPhrase: 'In my free time, I like reading stories and listening to music.',
        acceptedSpeechKeywords: ['free', 'time', 'reading', 'music'],
        hintFr: 'Après « like », on utilise volontiers le verbe en -ing (« reading », « listening »).',
        explanationFr: '« I like + V-ing » exprime clairement vos goûts quotidiens.'
      }
    ],
    reading: [
      {
        id: 'dc-a1-read-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'A1',
        passageTitle: 'Saturday Market',
        passageText:
          'Every Saturday morning, Tom visits the green market near the river. He buys fresh apples, warm bread, and yellow flowers for his grandmother.',
        promptFr: 'Lisez ce court texte : Pour qui Tom achète-t-il des fleurs ?',
        promptEn: 'Who does Tom buy flowers for?',
        options: ['His teacher', 'His grandmother', 'His brother', 'His neighbour'],
        correctIndex: 1,
        hintFr: 'Regardez la fin de la deuxième phrase après « for ».',
        explanationFr: '« For his grandmother » = pour sa grand-mère.'
      },
      {
        id: 'dc-a1-read-2',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'A1',
        passageTitle: 'School Club Notice',
        passageText:
          'The English Cinema Club meets on Wednesday afternoon in Room 12. All students are welcome, and snacks are free.',
        promptFr: 'Quel jour se réunit le club de cinéma anglais ?',
        promptEn: 'On which day does the English Cinema Club meet?',
        options: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        correctIndex: 1,
        hintFr: 'Cherchez la préposition « on » suivie d’un jour de la semaine.',
        explanationFr: 'Le club se réunit « on Wednesday afternoon » (mercredi après-midi).'
      }
    ],
    writing: [
      {
        id: 'dc-a1-wrt-1',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'A1',
        promptFr: 'Écrivez 2 courtes phrases simples (≥ 8 mots) sur votre journée en utilisant « and » et « because » :',
        promptEn: 'Write 8+ words about your day using "and" and "because".',
        writingMinWords: 8,
        writingRequiredKeywords: ['and', 'because'],
        writingModelAnswer:
          'I study English every day and I enjoy it because it helps me travel.',
        hintFr: 'Reliez deux idées avec « and », puis donnez une raison avec « because ».',
        explanationFr: 'Même au niveau A1, relier vos phrases avec « and » et « because » donne de la fluidité.'
      },
      {
        id: 'dc-a1-wrt-2',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'A1',
        promptFr: 'Rédigez une courte invitation (≥ 8 mots) incluant « Saturday » et « please » :',
        promptEn: 'Write an 8+ word short invitation including "Saturday" and "please".',
        writingMinWords: 8,
        writingRequiredKeywords: ['saturday', 'please'],
        writingModelAnswer:
          'Please come to the park on Saturday afternoon with our friends.',
        hintFr: 'Placez « on » devant un jour de la semaine (« on Saturday »).',
        explanationFr: 'On emploie toujours la préposition « on » devant un jour précis.'
      }
    ]
  },
  A2: {
    vocabulary: [
      {
        id: 'dc-a2-voc-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'A2',
        promptFr: 'Choisissez le bon adjectif en -ed / -ing pour décrire une émotion :',
        promptEn: 'The museum tour was fascinating, so the students felt truly ___.',
        options: ['exciting', 'excited', 'bore', 'tiring'],
        correctIndex: 1,
        hintFr: 'On utilise -ed pour le ressenti d’une personne (« felt excited »).',
        explanationFr: 'Adjectif en -ing = caractéristique de la chose ; adjectif en -ed = sentiment ressenti.'
      },
      {
        id: 'dc-a2-voc-2',
        type: 'pair_match',
        skillTested: 'vocabulary',
        cefrLevel: 'A2',
        promptFr: 'Reliez chaque verbe à particule (phrasal verb) A2 à son sens :',
        promptEn: 'Match each useful phrasal verb to its clear meaning.',
        pairs: [
          { id: 'a2v1', left: 'Look for', right: 'Chercher quelque chose' },
          { id: 'a2v2', left: 'Find out', right: 'Découvrir / apprendre' },
          { id: 'a2v3', left: 'Give up', right: 'Abandonner / renoncer' },
          { id: 'a2v4', left: 'Turn on', right: 'Allumer un appareil' }
        ],
        hintFr: '« Look for » = chercher ; « Find out » = découvrir une information.',
        explanationFr: 'Ces 4 verbes à particule sont omniprésents dans les dialogues du quotidien.'
      }
    ],
    grammar: [
      {
        id: 'dc-a2-gram-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'A2',
        promptFr: 'Complétez ce récit au passé (Prétérit vs Be + -ing) :',
        promptEn: 'While we ___ to the station, it suddenly started to rain.',
        options: ['walk', 'were walking', 'have walked', 'walks'],
        correctIndex: 1,
        hintFr: '« While » introduit une action longue en train de se dérouler dans le passé.',
        explanationFr: 'Action de fond interrompue : « While + was/were + V-ing » + action brève au prétérit.'
      },
      {
        id: 'dc-a2-gram-2',
        type: 'sentence_build',
        skillTested: 'grammar',
        cefrLevel: 'A2',
        promptFr: 'Construisez une phrase correcte avec le comparatif de supériorité :',
        promptEn: 'Arrange the tokens into an accurate comparative sentence.',
        sentenceTokens: ['Practicing', 'daily', 'is', 'more', 'effective', 'than', 'cramming'],
        expectedSentence: 'Practicing daily is more effective than cramming',
        hintFr: 'Comparatif d’un adjectif long : « more + adjectif + than ».',
        explanationFr: '« More effective than » compare clairement deux méthodes d’apprentissage.'
      }
    ],
    listening: [
      {
        id: 'dc-a2-list-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'A2',
        audioAccent: 'en-GB',
        audioScript: 'Please leave your backpacks by the entrance, because no large bags are allowed inside the gallery.',
        promptFr: 'Écoutez l’annonce du musée : Que doivent faire les visiteurs avec leur sac à dos ?',
        promptEn: 'What are visitors asked to do with their backpacks?',
        options: [
          'Carry them inside every room',
          'Leave them near the entrance',
          'Put them under the chairs',
          'Bring them back tomorrow'
        ],
        correctIndex: 1,
        hintFr: 'Écoutez « leave your backpacks by the entrance ».',
        explanationFr: '« By the entrance » signifie près de l’entrée ; « allowed » signifie autorisé.'
      },
      {
        id: 'dc-a2-list-2',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'A2',
        audioAccent: 'en-US',
        audioScript: 'We wanted to take the bus downtown, yet the subway turned out to be much faster.',
        promptFr: 'Quel moyen de transport s’est révélé le plus rapide ?',
        promptEn: 'Which transport was actually faster?',
        options: ['The bus', 'The subway', 'Walking', 'A bicycle'],
        correctIndex: 1,
        hintFr: 'Repérez ce qui suit « yet » (« pourtant / mais »).',
        explanationFr: '« The subway » (le métro en anglais américain) s’est révélé « much faster ».'
      }
    ],
    speaking: [
      {
        id: 'dc-a2-spk-1',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'A2',
        promptFr: 'Exprimez un projet d’avenir clair avec « going to » :',
        promptEn: 'Speak or enter this future plan naturally:',
        targetSpeechPhrase: 'Next weekend, I am going to visit the science museum with my classmates.',
        acceptedSpeechKeywords: ['weekend', 'going', 'visit', 'museum'],
        hintFr: 'Enchaînez fluidement « I am going to visit ».',
        explanationFr: '« Be going to + verbe » exprime une intention ou un projet déjà décidé.'
      },
      {
        id: 'dc-a2-spk-2',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'A2',
        promptFr: 'Donnez un conseil bienveillant en anglais :',
        promptEn: 'Say or type this helpful suggestion:',
        targetSpeechPhrase: 'You should listen to short podcasts every morning to improve your accent.',
        acceptedSpeechKeywords: ['should', 'listen', 'morning', 'improve'],
        hintFr: '« Should » n’est jamais suivi de « to » : « You should listen ».',
        explanationFr: 'Le modal « should + base verbale » permet de conseiller avec justesse.'
      }
    ],
    reading: [
      {
        id: 'dc-a2-read-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'A2',
        passageTitle: 'Green Roofs in London',
        passageText:
          'Several schools in London now grow vegetables on their roofs. Students water the plants during science class and learn how urban gardens keep buildings cooler in summer.',
        promptFr: 'Quel avantage thermique offrent les jardins sur les toits en été ?',
        promptEn: 'How do rooftop gardens help buildings in summer?',
        options: [
          'They make classrooms darker.',
          'They keep buildings cooler.',
          'They block all rainwater.',
          'They replace science classes.'
        ],
        correctIndex: 1,
        hintFr: 'Repérez le comparatif « cooler » à la fin du texte.',
        explanationFr: 'Les toits végétalisés gardent les bâtiments plus frais (« cooler ») durant l’été.'
      }
    ],
    writing: [
      {
        id: 'dc-a2-wrt-1',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'A2',
        promptFr: 'Rédigez une phrase au passé (≥ 10 mots) racontant une activité réussie en incluant « yesterday » et « because » :',
        promptEn: 'Write a 10+ word past-tense sentence including "yesterday" and "because".',
        writingMinWords: 10,
        writingRequiredKeywords: ['yesterday', 'because'],
        writingModelAnswer:
          'Yesterday I listened to an English story twice because I wanted to understand every detail.',
        hintFr: 'Vérifiez la terminaison -ed ou la forme irrégulière de votre verbe au prétérit.',
        explanationFr: 'Structurer cause + fait passé renforce votre expression écrite A2.'
      }
    ]
  },
  B1: {
    vocabulary: [
      {
        id: 'dc-b1-voc-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'B1',
        promptFr: 'Choisissez le mot juste pour éviter le faux-ami « sensible » :',
        promptEn: 'Bringing warm clothes to Scotland in October is a very ___ decision.',
        options: ['sensitive', 'sensible', 'pathetic', 'actual'],
        correctIndex: 1,
        hintFr: '« Sensible » = raisonnable / plein de bon sens ; « sensitive » = sensible (émotif/fragile).',
        explanationFr: '« A sensible decision » signifie une décision avisée et raisonnable.'
      },
      {
        id: 'dc-b1-voc-2',
        type: 'pair_match',
        skillTested: 'vocabulary',
        cefrLevel: 'B1',
        promptFr: 'Associez chaque collocation B1 à sa définition précise :',
        promptEn: 'Pair each key expression with its meaning.',
        pairs: [
          { id: 'b1v1', left: 'Take advantage of', right: 'Tirer parti / profiter de' },
          { id: 'b1v2', left: 'Pay attention to', right: 'Prêter attention à' },
          { id: 'b1v3', left: 'Make progress', right: 'Accomplir des progrès' },
          { id: 'b1v4', left: 'Run out of', right: 'Tomber à court de' }
        ],
        hintFr: 'On « make progress » (jamais *do progress) et on « run out of time/battery ».',
        explanationFr: 'Ces collocations rendent immédiatement votre anglais idiomatique.'
      }
    ],
    grammar: [
      {
        id: 'dc-b1-gram-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'B1',
        promptFr: 'Choisissez la structure exacte pour exprimer une durée qui continue au présent :',
        promptEn: 'She ___ English for three years and still enjoys every session.',
        options: ['studies', 'is studying', 'has been studying', 'studied'],
        correctIndex: 2,
        hintFr: 'Action commencée dans le passé (« for three years ») et toujours en cours (« still »).',
        explanationFr: 'Le Present Perfect Continuous (« has been studying ») met l’accent sur la durée et la continuité.'
      },
      {
        id: 'dc-b1-gram-2',
        type: 'sentence_build',
        skillTested: 'grammar',
        cefrLevel: 'B1',
        promptFr: 'Reconstruisez cette phrase au Conditionnel 2 :',
        promptEn: 'Arrange the tokens into an accurate second conditional sentence.',
        sentenceTokens: ['If', 'we', 'practiced', 'together,', 'our', 'pronunciation', 'would', 'improve'],
        expectedSentence: 'If we practiced together, our pronunciation would improve',
        hintFr: 'If + Prétérit (« practiced »), Sujet + would + Base verbale (« would improve »).',
        explanationFr: 'Structure canonique du conditionnel d’hypothèse (Conditionnel 2).'
      }
    ],
    listening: [
      {
        id: 'dc-b1-list-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'B1',
        audioAccent: 'en-GB',
        audioScript: 'Before submitting your essay, take two minutes to double-check your linking words and verb tenses.',
        promptFr: 'Écoutez le conseil méthodologique : Que faut-il vérifier avant de rendre sa copie ?',
        promptEn: 'What does the instructor advise checking before submitting?',
        options: [
          'Only the page margins',
          'Linking words and verb tenses',
          'The dictionary price',
          'Nothing at all'
        ],
        correctIndex: 1,
        hintFr: 'Repérez « double-check » suivi des deux éléments clés.',
        explanationFr: '« Double-check » signifie relire attentivement : connecteurs (« linking words ») et temps verbaux.'
      }
    ],
    speaking: [
      {
        id: 'dc-b1-spk-1',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'B1',
        promptFr: 'Formulez cette opinion nuancée à voix haute (ou au clavier) :',
        promptEn: 'Speak or enter this balanced opinion:',
        targetSpeechPhrase: 'In my opinion, listening carefully matters just as much as speaking quickly.',
        acceptedSpeechKeywords: ['opinion', 'listening', 'matters', 'speaking'],
        hintFr: 'Appuyez légèrement sur « matters » (compte vraiment).',
        explanationFr: '« In my opinion … matters just as much as … » structure efficacement une comparaison orale.'
      }
    ],
    reading: [
      {
        id: 'dc-b1-read-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'B1',
        passageTitle: 'Bilingual Libraries',
        passageText:
          'Community libraries across Europe increasingly pair printed novels with audio recordings. When learners read while listening, they connect unfamiliar spelling directly to authentic rhythm and stress.',
        promptFr: 'Quel bénéfice concret procure l’association lecture + audio selon le texte ?',
        promptEn: 'What benefit comes from reading while listening?',
        options: [
          'Learners skip difficult words faster.',
          'Learners link spelling directly to authentic rhythm and stress.',
          'Printed novels become unnecessary.',
          'Audio recordings remove all grammar rules.'
        ],
        correctIndex: 1,
        hintFr: 'Relisez la deuxième phrase commençant par « When learners read while listening… ».',
        explanationFr: 'Combiner vue (orthographe) et audition (rythme/accentuation) ancre durablement le lexique.'
      }
    ],
    writing: [
      {
        id: 'dc-b1-wrt-1',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'B1',
        promptFr: 'Rédigez un bref avis (≥ 12 mots) incluant « although » et « therefore » :',
        promptEn: 'Write a 12+ word reflection using both "although" and "therefore".',
        writingMinWords: 12,
        writingRequiredKeywords: ['although', 'therefore'],
        writingModelAnswer:
          'Although English spelling sometimes surprises me, daily listening helps a lot; therefore, I keep practicing.',
        hintFr: 'Introduisez une difficulté avec « Although », puis une solution avec « therefore ».',
        explanationFr: 'Maîtriser concession + conséquence enrichit immédiatement vos rédactions B1.'
      }
    ]
  },
  B2: {
    vocabulary: [
      {
        id: 'dc-b2-voc-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'B2',
        promptFr: 'Sélectionnez le verbe académique exact signifiant « atténuer / réduire un impact » :',
        promptEn: 'Clear preparation can significantly ___ pre-exam anxiety.',
        options: ['mitigate', 'aggravate', 'postpone', 'neglect'],
        correctIndex: 0,
        hintFr: '« Mitigate » signifie adoucir, atténuer ou limiter la gravité.',
        explanationFr: '« Mitigate anxiety / risks » est une collocation de haut niveau (B2/C1).'
      },
      {
        id: 'dc-b2-voc-2',
        type: 'pair_match',
        skillTested: 'vocabulary',
        cefrLevel: 'B2',
        promptFr: 'Associez chaque connecteur formel à sa fonction exacte :',
        promptEn: 'Match each B2 discourse marker to its role.',
        pairs: [
          { id: 'b2v1', left: 'Notwithstanding', right: 'Malgré / nonobstant' },
          { id: 'b2v2', left: 'Forthcoming', right: 'À venir / prochain' },
          { id: 'b2v3', left: 'Scarcely', right: 'À peine / guère' },
          { id: 'b2v4', left: 'Compelling', right: 'Convaincant / captivant' }
        ],
        hintFr: '« Compelling evidence / argument » = preuve ou argument convaincant.',
        explanationFr: 'Ces quatre termes valorisent nettement vos essais et compréhensions B2.'
      }
    ],
    grammar: [
      {
        id: 'dc-b2-gram-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'B2',
        promptFr: 'Complétez ce regret portant sur le passé (Conditionnel 3) :',
        promptEn: 'Had I verified the source earlier, I ___ that misconception.',
        options: ['avoided', 'would avoid', 'would have avoided', 'will avoid'],
        correctIndex: 2,
        hintFr: '« Had I verified… » équivaut à « If I had verified… » → principale en « would have + participe passé ».',
        explanationFr: 'Conditionnel 3 inversé : « Had + sujet + V-en, sujet + would have + V-en ».'
      },
      {
        id: 'dc-b2-gram-2',
        type: 'sentence_build',
        skillTested: 'grammar',
        cefrLevel: 'B2',
        promptFr: 'Assemblez cette structure concessive sans faute :',
        promptEn: 'Build an error-free concessive sentence with "Despite".',
        sentenceTokens: ['Despite', 'facing', 'initial', 'hesitation,', 'she', 'articulated', 'her', 'thesis', 'clearly'],
        expectedSentence: 'Despite facing initial hesitation, she articulated her thesis clearly',
        hintFr: '« Despite » accepte un verbe en -ing (« facing ») ou un nom, jamais « of ».',
        explanationFr: '« Despite + V-ing » exprime avec élégance une concession en B2.'
      }
    ],
    listening: [
      {
        id: 'dc-b2-list-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'B2',
        audioAccent: 'en-GB',
        audioScript: 'Far from discouraging debate, respectful disagreement actually sharpens our collective reasoning.',
        promptFr: 'Écoutez la remarque : Quel est l’effet d’un désaccord respectueux ?',
        promptEn: 'What does respectful disagreement achieve according to the speaker?',
        options: [
          'It ends all productive debate.',
          'It sharpens collective reasoning.',
          'It wastes meeting time.',
          'It forces everyone to agree silently.'
        ],
        correctIndex: 1,
        hintFr: 'Écoutez le contraste « Far from discouraging… actually sharpens… ».',
        explanationFr: '« Far from + V-ing » (loin de…) introduit un renversement positif (« sharpens »).'
      }
    ],
    speaking: [
      {
        id: 'dc-b2-spk-1',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'B2',
        promptFr: 'Énoncez ce désaccord nuancé et constructif :',
        promptEn: 'Deliver this diplomatic counterpoint aloud or in text:',
        targetSpeechPhrase: 'I acknowledge your main point; however, long-term consistency remains the decisive factor.',
        acceptedSpeechKeywords: ['acknowledge', 'however', 'consistency', 'factor'],
        hintFr: 'Marquez une courte pause avant « however ».',
        explanationFr: '« I acknowledge your point; however… » démontre écoute active et précision argumentative.'
      }
    ],
    reading: [
      {
        id: 'dc-b2-read-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'B2',
        passageTitle: 'Deliberate Practice',
        passageText:
          'Psychologists distinguish passive exposure from deliberate practice. Merely skimming dozens of pages rarely alters writing habits, whereas dissecting three well-crafted sentences deepens syntactic intuition.',
        promptFr: 'Pourquoi l’analyse ciblée de trois phrases surpasse-t-elle le survol passif ?',
        promptEn: 'Why does dissecting a few well-crafted sentences outperform passive skimming?',
        options: [
          'It takes zero concentration.',
          'It actively deepens syntactic intuition rather than leaving habits unchanged.',
          'It eliminates vocabulary learning.',
          'Skimming is forbidden in libraries.'
        ],
        correctIndex: 1,
        hintFr: 'Repérez l’opposition introduite par « whereas ».',
        explanationFr: 'L’attention analytique transforme une lecture passive en intuition grammaticale active.'
      }
    ],
    writing: [
      {
        id: 'dc-b2-wrt-1',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'B2',
        promptFr: 'Rédigez une phrase synthétique (≥ 13 mots) employant « whereas » et « consequently » :',
        promptEn: 'Write a 13+ word analytical sentence containing "whereas" and "consequently".',
        writingMinWords: 13,
        writingRequiredKeywords: ['whereas', 'consequently'],
        writingModelAnswer:
          'Whereas passive reading feels effortless, active note-taking reveals subtle patterns; consequently, retention improves remarkably.',
        hintFr: 'Opposez deux attitudes avec « whereas », puis concluez avec « consequently ».',
        explanationFr: 'Cette double articulation logique caractérise une copie solide de niveau B2.'
      }
    ]
  },
  C1: {
    vocabulary: [
      {
        id: 'dc-c1-voc-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'C1',
        promptFr: 'Quel adjectif caractérise une prose « concise, incisive et dense en sens » ?',
        promptEn: 'Her closing rebuttal was remarkably ___, conveying complex nuance in forty seconds.',
        options: ['pithy', 'verbose', 'redundant', 'superficial'],
        correctIndex: 0,
        hintFr: '« Verbose » signifie verbeux ; cherchez son contraire élogieux.',
        explanationFr: '« Pithy » décrit un propos à la fois bref, percutant et riche de sens.'
      },
      {
        id: 'dc-c1-voc-2',
        type: 'pair_match',
        skillTested: 'vocabulary',
        cefrLevel: 'C1',
        promptFr: 'Associez chaque terme littéraire ou académique C1 à sa nuance exacte :',
        promptEn: 'Match each C1 term to its precise meaning.',
        pairs: [
          { id: 'c1v1', left: 'Corroborate', right: 'Confirmer par des preuves' },
          { id: 'c1v2', left: 'Unprecedented', right: 'Sans précédent historique' },
          { id: 'c1v3', left: 'Ambiguity', right: 'Double sens / imprécision' },
          { id: 'c1v4', left: 'Nuance', right: 'Subtile gradation de sens' }
        ],
        hintFr: '« Corroborate » vient du latin *corroborare* (fortifier par des faits).',
        explanationFr: 'Indispensables pour analyser articles de presse, essais et discours soutenus.'
      }
    ],
    grammar: [
      {
        id: 'dc-c1-gram-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'C1',
        promptFr: 'Appliquez l’inversion négative avec « Little » en tête de phrase :',
        promptEn: 'Little ___ how profoundly that single conversation would reshape her research.',
        options: ['she knew', 'did she know', 'knew she', 'had she knew'],
        correctIndex: 1,
        hintFr: '« Little » négatif en début de phrase entraîne : auxiliaire (« did ») + sujet + base verbale.',
        explanationFr: '« Little did she know… » signifie « Elle était bien loin de se douter… ».'
      },
      {
        id: 'dc-c1-gram-2',
        type: 'sentence_build',
        skillTested: 'grammar',
        cefrLevel: 'C1',
        promptFr: 'Construisez cette phrase avec inversion conditionnelle (« Should… ») :',
        promptEn: 'Arrange the tokens into a formal inverted conditional.',
        sentenceTokens: ['Should', 'any', 'uncertainty', 'arise,', 'consult', 'the', 'primary', 'archive'],
        expectedSentence: 'Should any uncertainty arise, consult the primary archive',
        hintFr: '« Should + sujet + BV » remplace élégamment « If any uncertainty should arise ».',
        explanationFr: 'L’inversion en « Should… » est une signature d’élégance formelle C1/C2.'
      }
    ],
    listening: [
      {
        id: 'dc-c1-list-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'C1',
        audioAccent: 'en-GB',
        audioScript: 'Scarcely had the symposium concluded when delegates began exchanging follow-up papers.',
        promptFr: 'Écoutez la phrase britannique : Que traduit l’inversion « Scarcely had… when… » ?',
        promptEn: 'What sequence of events does the recording express?',
        options: [
          'Delegates exchanged papers immediately after the symposium ended.',
          'The symposium never concluded.',
          'Follow-up papers were banned at the symposium.',
          'Delegates waited several months before speaking.'
        ],
        correctIndex: 0,
        hintFr: '« Scarcely had X when Y » = À peine X s’était-il produit que Y suivit aussitôt.',
        explanationFr: '« Scarcely/Hardly had + V-en … when … » marque une succession immédiate.'
      }
    ],
    speaking: [
      {
        id: 'dc-c1-spk-1',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'C1',
        promptFr: 'Prononcez cette phrase rhétorique d’ouverture avec maîtrise du rythme :',
        promptEn: 'Deliver this C1 rhetorical statement clearly:',
        targetSpeechPhrase: 'Not only does careful listening prevent misunderstandings, it also elevates the tone of dialogue.',
        acceptedSpeechKeywords: ['listening', 'prevent', 'elevates', 'dialogue'],
        hintFr: 'Accentuez « Not ONLY » puis « ALSO elevates ».',
        explanationFr: 'L’inversion « Not only does… » donne une autorité naturelle à votre expression orale.'
      }
    ],
    reading: [
      {
        id: 'dc-c1-read-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'C1',
        passageTitle: 'Rhetorical Restraint',
        passageText:
          'Lord Chesterfield repeatedly advised that wit ought to illuminate an argument rather than dazzle at the expense of clarity. Understatement, deployed judiciously, persuades seasoned readers far more reliably than hyperbole.',
        promptFr: 'Pourquoi l’auteur privilégie-t-il la litote (« understatement ») à l’hyperbole ?',
        promptEn: 'Why does the passage favor understatement over hyperbole?',
        options: [
          'Hyperbole is grammatically incorrect.',
          'Judicious understatement persuades seasoned readers more reliably.',
          'Wit should completely replace reasoning.',
          'Readers dislike clarity.'
        ],
        correctIndex: 1,
        hintFr: 'Relisez la seconde phrase centrée sur « Understatement ».',
        explanationFr: 'La retenue rhétorique convainc durablement un lectorat exigeant.'
      }
    ],
    writing: [
      {
        id: 'dc-c1-wrt-1',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'C1',
        promptFr: 'Rédigez une phrase analytique (≥ 14 mots) utilisant « albeit » et « nevertheless » :',
        promptEn: 'Write a 14+ word C1 sentence incorporating both "albeit" and "nevertheless".',
        writingMinWords: 14,
        writingRequiredKeywords: ['albeit', 'nevertheless'],
        writingModelAnswer:
          'Cross-disciplinary challenges demand sustained concentration, albeit briefly; nevertheless, they forge remarkably adaptable minds.',
        hintFr: '« Albeit » introduit une courte nuance concessive (« albeit slowly / briefly »).',
        explanationFr: 'L’alliance « albeit … ; nevertheless … » témoigne d’une maîtrise rhétorique C1.'
      }
    ]
  },
  C2: {
    vocabulary: [
      {
        id: 'dc-c2-voc-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'C2',
        promptFr: 'Sélectionnez le terme C2 signifiant « rendre clair ce qui était obscur / élucider » :',
        promptEn: 'The commentator’s footnotes brilliantly ___ the historical allusions in Chesterfield’s letters.',
        options: ['elucidate', 'obfuscate', 'preclude', 'disseminate'],
        correctIndex: 0,
        hintFr: 'Du latin *lucidus* (clair, lumineux) — à l’opposé d’« obfuscate » (obscurcir).',
        explanationFr: '« Elucidate » signifie éclairer et rendre intelligible un passage complexe.'
      },
      {
        id: 'dc-c2-voc-2',
        type: 'pair_match',
        skillTested: 'vocabulary',
        cefrLevel: 'C2',
        promptFr: 'Reliez chaque vocable d’excellence C2 à son sens exact :',
        promptEn: 'Match each C2 lexical item to its exact definition.',
        pairs: [
          { id: 'c2v1', left: 'Equanimity', right: 'Sérénité d’esprit / sang-froid' },
          { id: 'c2v2', left: 'Cogent', right: 'Rigoureux et convaincant' },
          { id: 'c2v3', left: 'Ephemeral', right: 'Éphémère / passager' },
          { id: 'c2v4', left: 'Perspicacious', right: 'Perspicace / lucide' }
        ],
        hintFr: '« A cogent argument » = un raisonnement sans faille logique.',
        explanationFr: 'Quatre mots précieux pour la critique littéraire et la rhétorique C2.'
      }
    ],
    grammar: [
      {
        id: 'dc-c2-gram-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'C2',
        promptFr: 'Identifiez l’inversion formelle correcte après « Only by… » :',
        promptEn: 'Only by examining counterarguments ___ a genuinely resilient thesis.',
        options: [
          'an author builds',
          'does an author build',
          'builds an author',
          'is building an author'
        ],
        correctIndex: 1,
        hintFr: 'Lorsque « Only by + V-ing » ouvre la phrase, l’inversion se fait dans la proposition principale !',
        explanationFr: '« Only by [condition] + auxiliaire (« does ») + sujet + base verbale ».'
      },
      {
        id: 'dc-c2-gram-2',
        type: 'sentence_build',
        skillTested: 'grammar',
        cefrLevel: 'C2',
        promptFr: 'Assemblez ce subjonctif formel précédé d’une inversion :',
        promptEn: 'Order the tokens into a crisp formal C2 clause.',
        sentenceTokens: ['Were', 'clarity', 'to', 'be', 'sacrificed,', 'persuasion', 'would', 'wither'],
        expectedSentence: 'Were clarity to be sacrificed, persuasion would wither',
        hintFr: '« Were [subject] to be [participle] » exprime une hypothèse formelle soutenue.',
        explanationFr: '« Were … to be …, … would … » unit élégance stylistique et précision modale.'
      }
    ],
    listening: [
      {
        id: 'dc-c2-list-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'C2',
        audioAccent: 'en-GB',
        audioScript: 'Seldom has brevity so effortlessly reconciled diplomatic tact with unsparing analytical candor.',
        promptFr: 'Écoutez la phrase C2 : Que salue l’intervenant dans ce discours ?',
        promptEn: 'What achievement does the speaker praise?',
        options: [
          'Conciseness uniting diplomatic tact and honest analytical clarity',
          'An excessively long speech lacking tact',
          'Avoiding analysis in favor of flattery',
          'Speaking rapidly without reflection'
        ],
        correctIndex: 0,
        hintFr: '« Brevity » = concision ; « candor » = franchise loyale.',
        explanationFr: 'La concision réussit ici à concilier tact diplomatique et franchise analytique.'
      }
    ],
    speaking: [
      {
        id: 'dc-c2-spk-1',
        type: 'speaking_prompt',
        skillTested: 'speaking',
        cefrLevel: 'C2',
        promptFr: 'Énoncez cette maxime rhétorique d’inspiration oxfordienne :',
        promptEn: 'Deliver this C2 statement with measured cadence:',
        targetSpeechPhrase: 'Precision of thought and courtesy of expression are twin pillars of enduring persuasion.',
        acceptedSpeechKeywords: ['precision', 'courtesy', 'pillars', 'persuasion'],
        hintFr: 'Équilibrez les deux groupes parallèles (« Precision of thought » / « courtesy of expression »).',
        explanationFr: 'Le parallélisme binaire renforce mémorisation et autorité oratoire.'
      }
    ],
    reading: [
      {
        id: 'dc-c2-read-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'C2',
        passageTitle: 'The Ethics of Idiom',
        passageText:
          'Mastery of idiom never implies ostentatious obscurity; rather, it signifies knowing precisely when an understated colloquial turn carries greater warmth than Latinate formality.',
        promptFr: 'Quelle conception de la maîtrise idiomatique défend cet extrait ?',
        promptEn: 'How does the author define true mastery of idiom?',
        options: [
          'Using the rarest Latinate words in every sentence',
          'Choosing appropriately between understated warmth and formality',
          'Rejecting all colloquial expressions',
          'Making sentences deliberately obscure'
        ],
        correctIndex: 1,
        hintFr: 'Notez « knowing precisely when an understated colloquial turn carries greater warmth… ».',
        explanationFr: 'L’excellence C2 réside dans l’adéquation du registre, jamais dans l’ostentation.'
      }
    ],
    writing: [
      {
        id: 'dc-c2-wrt-1',
        type: 'writing_prompt',
        skillTested: 'writing',
        cefrLevel: 'C2',
        promptFr: 'Rédigez une synthèse C2 (≥ 15 mots) intégrant « notwithstanding » et « precisely » :',
        promptEn: 'Write a 15+ word C2 synthesis incorporating "notwithstanding" and "precisely".',
        writingMinWords: 15,
        writingRequiredKeywords: ['notwithstanding', 'precisely'],
        writingModelAnswer:
          'Notwithstanding the lure of haste, genuine fluency matures precisely when accuracy and reflection guide every exchange.',
        hintFr: 'Placez « Notwithstanding + nom » en ouverture ou en incise.',
        explanationFr: 'Maîtrise de la concession nominale et de la focalisation adverbiale au niveau C2.'
      }
    ]
  }
};

export function getTodayAdventureDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

function hashStringDeterministic(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/**
 * Collect matching-level backup questions from the 7 Adventure islands
 * for a given target skill and CEFR tier.
 */
function gatherIslandQuestionsForSkill(
  skill: SkillKey,
  targetCefr: CEFRLevel,
  excludeIds: Set<string>
): AdventureQuestion[] {
  const targetRank = CEFR_RANK[targetCefr];
  const exact: AdventureQuestion[] = [];
  const near: AdventureQuestion[] = [];

  for (const island of ADVENTURE_ISLANDS) {
    for (const mission of island.missions) {
      const pool = [...mission.questions, ...(mission.masteryBonusQuestions || [])];
      for (const q of pool) {
        if (excludeIds.has(q.id)) continue;
        const qSkillMatches =
          q.skillTested === skill ||
          (skill === 'speaking' && q.skillTested === 'pronunciation');
        if (!qSkillMatches) continue;
        const diff = Math.abs(CEFR_RANK[q.cefrLevel] - targetRank);
        if (diff === 0) {
          exact.push(q);
        } else if (diff <= 1) {
          near.push(q);
        }
      }
    }
  }
  return [...exact, ...near];
}

function selectQuestionsForSkill(
  skill: SkillKey,
  cefrLevel: CEFRLevel,
  count: number,
  seedKey: string
): AdventureQuestion[] {
  const curatedPrimary = DAILY_CURATED_BANK[cefrLevel]?.[skill] || [];
  const adjacentCefr: CEFRLevel =
    cefrLevel === 'A1'
      ? 'A2'
      : cefrLevel === 'A2'
      ? 'B1'
      : cefrLevel === 'B1'
      ? 'B2'
      : cefrLevel === 'B2'
      ? 'B1'
      : cefrLevel === 'C1'
      ? 'B2'
      : 'C1';
  const curatedAdjacent = DAILY_CURATED_BANK[adjacentCefr]?.[skill] || [];

  const picked: AdventureQuestion[] = [];
  const usedIds = new Set<string>();

  if (curatedPrimary.length > 0) {
    const startIdx = hashStringDeterministic(`${seedKey}_${skill}`) % curatedPrimary.length;
    for (let i = 0; i < curatedPrimary.length && picked.length < count; i++) {
      const q = curatedPrimary[(startIdx + i) % curatedPrimary.length];
      if (!usedIds.has(q.id)) {
        usedIds.add(q.id);
        picked.push(q);
      }
    }
  }

  if (picked.length < count) {
    const islandMatches = gatherIslandQuestionsForSkill(skill, cefrLevel, usedIds);
    for (const q of islandMatches) {
      if (picked.length >= count) break;
      usedIds.add(q.id);
      picked.push(q);
    }
  }

  if (picked.length < count) {
    for (const q of curatedAdjacent) {
      if (picked.length >= count) break;
      if (!usedIds.has(q.id)) {
        usedIds.add(q.id);
        picked.push(q);
      }
    }
  }

  return picked.slice(0, count);
}

/**
 * Deterministically generate 2 CEFR-adapted Daily Challenges combining 2 distinct skills each.
 * Rewards accuracy + consistency with a temporary XP multiplier boost upon passing.
 */
export function generateDailyAdventureChallenges(
  cefrLevel: CEFRLevel,
  dateKey: string = getTodayAdventureDateKey(),
  weakestSkills?: SkillKey[]
): AdventureDailyChallenge[] {
  const daySeed = hashStringDeterministic(`${dateKey}_${cefrLevel}`);
  const primaryWeakSkill = weakestSkills?.[0];

  // Pick Challenge 1: rotate deterministically, giving adaptive weight if a pair covers user's weakest skill
  const weakMatchingTemplates = primaryWeakSkill
    ? DAILY_PAIR_TEMPLATES.filter((t) => t.skills.includes(primaryWeakSkill))
    : [];

  const firstTemplate =
    weakMatchingTemplates.length > 0
      ? weakMatchingTemplates[daySeed % weakMatchingTemplates.length]
      : DAILY_PAIR_TEMPLATES[daySeed % DAILY_PAIR_TEMPLATES.length];

  // Pick Challenge 2: ensure different pair and distinct skills where possible
  const remaining = DAILY_PAIR_TEMPLATES.filter(
    (t) =>
      t.pairId !== firstTemplate.pairId &&
      !t.skills.some((sk) => firstTemplate.skills.includes(sk))
  );
  const secondPool =
    remaining.length > 0
      ? remaining
      : DAILY_PAIR_TEMPLATES.filter((t) => t.pairId !== firstTemplate.pairId);
  const secondTemplate = secondPool[(daySeed + 3) % secondPool.length];

  const rank = CEFR_RANK[cefrLevel];
  const passAccuracyRequired = rank >= 5 ? 70 : rank >= 3 ? 65 : 60;
  const difficultyRating = (Math.min(5, Math.max(1, rank)) as 1 | 2 | 3 | 4 | 5);
  const baseXp = 85 + rank * 10; // A1: 95, B1: 115, C2: 145 (strictly inside rules cap)
  const baseCoins = 14 + rank * 2;

  return [firstTemplate, secondTemplate].map((tpl, idx) => {
    const [skillA, skillB] = tpl.skills;
    const questionsA = selectQuestionsForSkill(skillA, cefrLevel, 2, `${dateKey}_${tpl.pairId}_A`);
    const questionsB = selectQuestionsForSkill(skillB, cefrLevel, 2, `${dateKey}_${tpl.pairId}_B`);

    // Interleave Skill A & Skill B so the learner experiences true dual-skill synergy
    const combinedQuestions: AdventureQuestion[] = [];
    const maxLen = Math.max(questionsA.length, questionsB.length);
    for (let i = 0; i < maxLen; i++) {
      if (questionsA[i]) combinedQuestions.push(questionsA[i]);
      if (questionsB[i]) combinedQuestions.push(questionsB[i]);
    }

    const usedIds = new Set(combinedQuestions.map((q) => q.id));
    const bonusPool = gatherIslandQuestionsForSkill(
      idx === 0 ? skillA : skillB,
      cefrLevel === 'C2' ? 'C2' : cefrLevel,
      usedIds
    );
    const masteryBonusQuestions = bonusPool.slice(0, 1);

    const safeDate = dateKey.replace(/[^0-9]/g, '_');
    const isAdaptiveFocus = Boolean(primaryWeakSkill && tpl.skills.includes(primaryWeakSkill));

    return {
      id: `daily_${safeDate}_${cefrLevel}_${tpl.pairId}`,
      dateKey,
      pairId: tpl.pairId,
      skills: tpl.skills,
      skillLabelsFr: tpl.skillLabelsFr,
      skillPairLabelFr: tpl.skillPairLabelFr,
      title: tpl.titleTemplate(cefrLevel),
      objectiveFr: tpl.objectiveFr,
      cefrLevel,
      difficultyRating,
      passAccuracyRequired,
      baseXp: idx === 1 ? baseXp + 15 : baseXp,
      baseCoins: idx === 1 ? baseCoins + 4 : baseCoins,
      xpMultiplierReward: tpl.xpMultiplierReward,
      boostDurationMinutes: tpl.boostDurationMinutes,
      boostDurationLabelFr: tpl.boostDurationLabelFr,
      accentHex: tpl.accentHex,
      secondaryHex: tpl.secondaryHex,
      icon: tpl.icon,
      isAdaptiveFocus,
      questions: combinedQuestions,
      masteryBonusQuestions
    };
  });
}

export interface ActiveXpBoostStatus {
  active: boolean;
  boost: AdventureXpMultiplierBoost | null;
  remainingMinutes: number;
  remainingLabelFr: string;
}

export function getActiveXpBoostStatus(
  state?: Partial<EnglishAdventureState> | null,
  nowMs: number = Date.now()
): ActiveXpBoostStatus {
  const boost = state?.activeXpBoost;
  if (!boost || typeof boost.expiresAt !== 'string' || typeof boost.multiplier !== 'number') {
    return { active: false, boost: null, remainingMinutes: 0, remainingLabelFr: '' };
  }
  const expiresMs = Date.parse(boost.expiresAt);
  if (!Number.isFinite(expiresMs) || expiresMs <= nowMs || boost.multiplier <= 1.0) {
    return { active: false, boost: null, remainingMinutes: 0, remainingLabelFr: '' };
  }
  const safeMult = Math.min(2.0, Math.max(1.0, Math.round(boost.multiplier * 100) / 100));
  const remainingMinutes = Math.max(1, Math.ceil((expiresMs - nowMs) / 60_000));
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  const remainingLabelFr =
    hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins} min`;

  return {
    active: true,
    boost: { ...boost, multiplier: safeMult },
    remainingMinutes,
    remainingLabelFr
  };
}

/**
 * Wrap an AdventureDailyChallenge as a compatible Island + Mission pair
 * so AdventureMissionRunnerModal runs it seamlessly with full audio/mic/validation support.
 */
export function dailyChallengeToMissionAndIsland(
  challenge: AdventureDailyChallenge
): { island: AdventureIsland; mission: AdventureMission } {
  const virtualIsland: AdventureIsland = {
    number: 7,
    id: 'advanced_universe',
    name: `Défi Quotidien · ${challenge.skillPairLabelFr}`,
    frenchSubtitle: `Duo Adaptatif CECRL ${challenge.cefrLevel}`,
    territoryLore: challenge.objectiveFr,
    skillFocus: challenge.skills[0],
    skillLabelFr: challenge.skillPairLabelFr,
    cefrRange: challenge.cefrLevel,
    accentHex: challenge.accentHex,
    secondaryHex: challenge.secondaryHex,
    icon: challenge.icon,
    motif: 'observatory',
    coords: { xPct: 50, yPct: 50, elevation: 25 },
    bossName: 'Multiplicateur XP',
    bossTitle: `×${challenge.xpMultiplierReward} XP (${challenge.boostDurationLabelFr})`,
    rewardTrophyId: '',
    rewardCardId: '',
    missions: [],
    scaffoldedPracticeQuestions: []
  };

  const virtualMission: AdventureMission = {
    id: challenge.id,
    islandId: 'advanced_universe',
    order: 1,
    kind: 'unlockable_challenge',
    kindLabelFr: `Duo ${challenge.skillPairLabelFr}`,
    title: challenge.title,
    objectiveFr: `${challenge.objectiveFr} Récompense : Multiplicateur ×${challenge.xpMultiplierReward} XP temporaire (${challenge.boostDurationLabelFr}).`,
    cefrLevel: challenge.cefrLevel,
    difficultyRating: challenge.difficultyRating,
    passAccuracyRequired: challenge.passAccuracyRequired,
    baseXp: challenge.baseXp,
    baseCoins: challenge.baseCoins,
    prerequisiteMissionIds: [],
    questions: challenge.questions,
    masteryBonusQuestions: challenge.masteryBonusQuestions
  };

  virtualIsland.missions = [virtualMission];
  return { island: virtualIsland, mission: virtualMission };
}
