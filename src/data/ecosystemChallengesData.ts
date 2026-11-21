import type { CEFRLevel, SchoolGrade } from '../firebase/types';

export interface EscapePuzzleStep {
  id: string;
  lockTitle: string;
  clueType: 'reading' | 'grammar' | 'audio_riddle' | 'vocabulary';
  narrativeEn: string;
  narrativeFr: string;
  question: string;
  options: string[];
  correctIndex: number;
  cipherDigit: string;
  hintFr: string;
  explanationFr: string;
}

export interface EscapeRoomScenario {
  id: string;
  title: string;
  location: string;
  gradeBand: string;
  recommendedGrades: SchoolGrade[];
  cefrLevel: CEFRLevel;
  timeLimitSeconds: number;
  xpReward: number;
  coinsReward: number;
  introFr: string;
  puzzles: EscapePuzzleStep[];
}

export interface CinemaLine {
  speaker: string;
  accent: 'en-GB' | 'en-US';
  gender: 'female' | 'male';
  en: string;
  fr: string;
}

export interface CinemaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationFr: string;
}

export interface ListeningCinemaEpisode {
  id: string;
  title: string;
  genre: string;
  durationLabel: string;
  cefrLevel: CEFRLevel;
  gradeLabel: string;
  synopsisFr: string;
  keyVocab: Array<{ term: string; ipa: string; fr: string }>;
  script: CinemaLine[];
  questions: CinemaQuestion[];
}

export interface GrammarBattleQuestion {
  id: string;
  gradeTier: 'college_junior' | 'college_senior' | 'lycee_seconde_premiere' | 'lycee_terminale';
  cefrLevel: CEFRLevel;
  grammarTopic: string;
  promptEn: string;
  options: string[];
  correctIndex: number;
  explanationFr: string;
  damage: number;
}

export const ESCAPE_ROOM_SCENARIOS: EscapeRoomScenario[] = [
  {
    id: 'esc-oxford-clocktower',
    title: 'The Secret of Christ Church Clocktower',
    location: 'Oxford • Tour de l’Horloge',
    gradeBand: 'Collège (6e - 5e)',
    recommendedGrades: ['6e', '5e'],
    cefrLevel: 'A1',
    timeLimitSeconds: 300,
    xpReward: 75,
    coinsReward: 35,
    introFr:
      'Vous êtes enfermé dans la bibliothèque ancienne d’Oxford avant la fermeture ! Résolvez les 4 cadenas linguistiques pour trouver le code à 4 chiffres de la porte.',
    puzzles: [
      {
        id: 'ox-1',
        lockTitle: 'Cadenas I : L’Indice du Carnet',
        clueType: 'reading',
        narrativeEn: 'Every morning at eight o’clock, the librarian drinks warm tea and reads two red books beside the north window.',
        narrativeFr: 'Chaque matin à huit heures, la bibliothécaire boit du thé chaud et lit deux livres rouges près de la fenêtre nord.',
        question: 'When does the librarian read two red books?',
        options: ['In the morning at 8:00', 'At midnight', 'Only on Sundays', 'In the afternoon at 4:00'],
        correctIndex: 0,
        cipherDigit: '8',
        hintFr: 'Repérez l’heure indiquée au début de la phrase anglaise.',
        explanationFr: '« Every morning at eight o’clock » signifie tous les matins à 8 heures.'
      },
      {
        id: 'ox-2',
        lockTitle: 'Cadenas II : La Serrure du Présent',
        clueType: 'grammar',
        narrativeEn: 'Complete the engraved brass inscription on the desk to release the drawer:',
        narrativeFr: 'Complétez l’inscription gravée sur le bureau pour ouvrir le tiroir :',
        question: 'The golden key ___ hidden behind the largest dictionary.',
        options: ['are', 'is', 'am', 'be'],
        correctIndex: 1,
        cipherDigit: '4',
        hintFr: 'Sujet singulier « The golden key » -> 3e personne du singulier.',
        explanationFr: 'Avec un sujet singulier (it), le verbe « be » au présent simple est « is ».'
      },
      {
        id: 'ox-3',
        lockTitle: 'Cadenas III : Le Message Murmuré',
        clueType: 'audio_riddle',
        narrativeEn: 'Look beneath the wooden armchair, not on the high shelf above the fireplace.',
        narrativeFr: 'Regardez sous le fauteuil en bois, pas sur la haute étagère au-dessus de la cheminée.',
        question: 'Where should you look for the silver compass?',
        options: ['Above the fireplace', 'On the high shelf', 'Under the wooden armchair', 'Outside the window'],
        correctIndex: 2,
        cipherDigit: '2',
        hintFr: 'Écoutez la préposition de lieu « beneath » (= under / sous).',
        explanationFr: '« Beneath » est synonyme de « under » (sous le fauteuil en bois).'
      },
      {
        id: 'ox-4',
        lockTitle: 'Cadenas IV : Le Sceau Final',
        clueType: 'vocabulary',
        narrativeEn: 'Match the opposite word written on the exit lock:',
        narrativeFr: 'Trouvez le contraire du mot gravé sur la serrure de sortie :',
        question: 'Which word is the exact opposite of "ANCIENT"?',
        options: ['Heavy', 'Modern', 'Quiet', 'Broken'],
        correctIndex: 1,
        cipherDigit: '7',
        hintFr: '« Ancient » désigne ce qui date d’une époque très ancienne.',
        explanationFr: '« Modern » (moderne) est l’antonyme direct de « Ancient » (ancien).'
      }
    ]
  },
  {
    id: 'esc-baker-street-vault',
    title: 'The Baker Street Cipher Case',
    location: 'Londres • 221B Bureau Détective',
    gradeBand: 'Collège (4e - 3e)',
    recommendedGrades: ['4e', '3e'],
    cefrLevel: 'A2',
    timeLimitSeconds: 300,
    xpReward: 90,
    coinsReward: 40,
    introFr:
      'Le détective a laissé quatre preuves codées sur son bureau avant de partir en mission. Déchiffrez ses indices en anglais pour ouvrir le coffre-fort !',
    puzzles: [
      {
        id: 'bs-1',
        lockTitle: 'Cadenas I : Le Témoin de la Gare',
        clueType: 'reading',
        narrativeEn: 'Although the train arrived twenty minutes late because of the heavy fog, the courier had already left the platform before the inspector got there.',
        narrativeFr: 'Bien que le train soit arrivé avec vingt minutes de retard à cause du brouillard épais, le messager avait déjà quitté le quai avant l’arrivée de l’inspecteur.',
        question: 'Did the inspector meet the courier on the platform?',
        options: ['Yes, they talked for 20 minutes', 'No, the courier left earlier', 'No, the train was cancelled', 'Yes, inside the fog'],
        correctIndex: 1,
        cipherDigit: '3',
        hintFr: 'Observez le Past Perfect : « had already left... before the inspector got there ».',
        explanationFr: 'Le messager était déjà parti (« had already left ») avant l’arrivée de l’inspecteur.'
      },
      {
        id: 'bs-2',
        lockTitle: 'Cadenas II : L’Enquête au Prétérit',
        clueType: 'grammar',
        narrativeEn: 'Select the accurate tense linking an ongoing action interrupted by a sudden clue:',
        narrativeFr: 'Choisissez le bon temps pour une action en cours interrompue :',
        question: 'While the inspector ___ the letter, the telephone suddenly rang.',
        options: ['was reading', 'reads', 'has read', 'is reading'],
        correctIndex: 0,
        cipherDigit: '9',
        hintFr: 'Action longue dans le passé (« while ») interrompue par un événement bref (« rang »).',
        explanationFr: 'On emploie le Past Continuous « was reading » pour l’arrière-plan interrompu par le prétérit simple.'
      },
      {
        id: 'bs-3',
        lockTitle: 'Cadenas III : L’Écoute Télégraphique',
        clueType: 'audio_riddle',
        narrativeEn: 'The suspect avoided answering the third question and dropped a folded ticket for Edinburgh at the doorway.',
        narrativeFr: 'Le suspect a évité de répondre à la troisième question et a laissé tomber un billet plié pour Édimbourg à l’entrée.',
        question: 'Which city is written on the suspect’s dropped ticket?',
        options: ['Manchester', 'Liverpool', 'Edinburgh', 'Oxford'],
        correctIndex: 2,
        cipherDigit: '5',
        hintFr: 'Écoutez attentivement le nom de la capitale écossaise.',
        explanationFr: 'Le billet mentionnait « Edinburgh ».'
      },
      {
        id: 'bs-4',
        lockTitle: 'Cadenas IV : Nuance Lexicale',
        clueType: 'vocabulary',
        narrativeEn: 'Decode the detective’s encrypted diary entry:',
        narrativeFr: 'Décodez l’entrée du journal codé du détective :',
        question: 'In "The witness looked genuinely relieved", what does "relieved" mean?',
        options: ['Very angry', 'Deeply worried', 'Soulagé / rassuré', 'Totally exhausted'],
        correctIndex: 2,
        cipherDigit: '1',
        hintFr: 'Comparez avec le nom « relief » (soulagement).',
        explanationFr: '« Relieved » signifie soulagé d’une inquiétude.'
      }
    ]
  },
  {
    id: 'esc-bodleian-archive',
    title: 'The Bodleian Forbidden Folio',
    location: 'Oxford • Réserve Souterraine',
    gradeBand: 'Lycée (2nde - 1re)',
    recommendedGrades: ['2nde', '1re'],
    cefrLevel: 'B1',
    timeLimitSeconds: 330,
    xpReward: 110,
    coinsReward: 50,
    introFr:
      'Vous devez restaurer l’ordre d’un manuscrit historique anglais pour désactiver l’alarme laser de la salle des archives.',
    puzzles: [
      {
        id: 'bod-1',
        lockTitle: 'Cadenas I : Argumentation & Connecteurs',
        clueType: 'reading',
        narrativeEn: 'Whereas early printing presses required painstaking manual typesetting, digital archives democratized rare manuscripts overnight; nevertheless, scholars still prize physical parchment.',
        narrativeFr: 'Alors que les premières presses exigeaient une composition manuelle laborieuse, les archives numériques ont démocratisé les manuscrits du jour au lendemain ; néanmoins, les chercheurs chérissent toujours le parchemin.',
        question: 'What contrast does the author highlight with "nevertheless"?',
        options: [
          'Digital archives replaced universities completely',
          'Scholars still value physical parchment despite digitalization',
          'Printing presses were faster than digital tools',
          'Manuscripts are no longer preserved'
        ],
        correctIndex: 1,
        cipherDigit: '6',
        hintFr: '« Nevertheless » introduit une concession par rapport à la démocratisation numérique.',
        explanationFr: 'Malgré le numérique, les chercheurs attachent toujours une grande valeur au parchemin réel.'
      },
      {
        id: 'bod-2',
        lockTitle: 'Cadenas II : Hypothèse Irréelle',
        clueType: 'grammar',
        narrativeEn: 'Complete the curator’s conditional safety rule:',
        narrativeFr: 'Complétez la règle conditionnelle du conservateur :',
        question: 'If the restoration team ___ faster last century, those pages would have survived.',
        options: ['acted', 'had acted', 'would act', 'has acted'],
        correctIndex: 1,
        cipherDigit: '2',
        hintFr: 'Conditionnel de type 3 (regret passé) : would have + PP exige Past Perfect dans la proposition en If.',
        explanationFr: 'If + Past Perfect (« had acted ») + would have + participe passé exprime un irréel du passé.'
      },
      {
        id: 'bod-3',
        lockTitle: 'Cadenas III : Voix de l’Archiviste',
        clueType: 'audio_riddle',
        narrativeEn: 'Do not open cabinet B; the copper seal belongs inside cabinet D, directly beside the emerald atlas.',
        narrativeFr: 'N’ouvrez pas l’armoire B ; le sceau de cuivre appartient à l’armoire D, juste à côté de l’atlas émeraude.',
        question: 'Where must the copper seal be placed?',
        options: ['In cabinet B', 'Behind the laser console', 'Inside cabinet D next to the atlas', 'On the marble floor'],
        correctIndex: 2,
        cipherDigit: '9',
        hintFr: 'Écoutez la négation initiale puis la localisation exacte.',
        explanationFr: 'Le sceau doit être placé dans l’armoire D, à côté de l’atlas émeraude.'
      },
      {
        id: 'bod-4',
        lockTitle: 'Cadenas IV : Précision Académique',
        clueType: 'vocabulary',
        narrativeEn: 'Choose the closest synonym for "PAINSTAKING" used in the first clue:',
        narrativeFr: 'Choisissez le synonyme exact de « painstaking » utilisé dans le premier indice :',
        question: 'What does "painstaking" imply?',
        options: ['Careless and rushed', 'Thorough and extremely careful', 'Expensive but useless', 'Dangerous'],
        correctIndex: 1,
        cipherDigit: '4',
        hintFr: 'Un travail « painstaking » demande beaucoup de soin et d’attention.',
        explanationFr: '« Painstaking » signifie méticuleux, assidu et extrêmement soigné.'
      }
    ]
  },
  {
    id: 'esc-downing-dossier',
    title: 'The Diplomatic Summit Protocol',
    location: 'Westminster • Salle du Conseil',
    gradeBand: 'Terminale (B2 / C1 / C2)',
    recommendedGrades: ['terminale'],
    cefrLevel: 'C1',
    timeLimitSeconds: 360,
    xpReward: 135,
    coinsReward: 65,
    introFr:
      'En tant que jeune diplomate, débloquez le traité confidentiel en validant 4 épreuves de rhétorique, d’inversion stylistique et de compréhension fine.',
    puzzles: [
      {
        id: 'dow-1',
        lockTitle: 'Cadenas I : Syntaxe d’Inversion',
        clueType: 'grammar',
        narrativeEn: 'Unlock the chancellor’s seal by mastering negative inversion:',
        narrativeFr: 'Débloquez le sceau du chancelier grâce à l’inversion formelle :',
        question: 'Seldom ___ such unanimous consensus been reached within twenty-four hours.',
        options: ['it has', 'has', 'did', 'was'],
        correctIndex: 1,
        cipherDigit: '7',
        hintFr: 'L’adverbe restrictif « Seldom » en tête de phrase inverse l’auxiliaire « has » et le sujet « such unanimous consensus ».',
        explanationFr: 'Inversion sujet-auxiliaire après un adverbe négatif initial : « Seldom has such unanimous consensus been reached ».'
      },
      {
        id: 'dow-2',
        lockTitle: 'Cadenas II : Analyse Rhétorique',
        clueType: 'reading',
        narrativeEn: 'Rather than issuing an unequivocal ultimatum, the envoy couched her proposal in measured ambiguity so every delegation could save face.',
        narrativeFr: 'Plutôt que de formuler un ultimatum catégorique, l’envoyée a enveloppé sa proposition d’une ambiguïté mesurée afin que chaque délégation puisse sauver la face.',
        question: 'Why did the envoy use measured ambiguity?',
        options: [
          'Because she lacked mastery of English',
          'To delay the summit indefinitely',
          'To allow all delegations to preserve diplomatic dignity',
          'To reject the treaty secretly'
        ],
        correctIndex: 2,
        cipherDigit: '5',
        hintFr: 'Repérez la locution « save face ».',
        explanationFr: '« Save face » signifie sauver la face / préserver sa dignité diplomatique.'
      },
      {
        id: 'dow-3',
        lockTitle: 'Cadenas III : Déclaration Confidentielle',
        clueType: 'audio_riddle',
        narrativeEn: 'The ratification clause will take effect next Tuesday unless the maritime committee requests an amendment beforehand.',
        narrativeFr: 'La clause de ratification prendra effet mardi prochain à moins que le comité maritime ne demande un amendement au préalable.',
        question: 'What could prevent ratification next Tuesday?',
        options: [
          'A prior amendment request from the maritime committee',
          'Heavy rain in Westminster',
          'A trade embargo from the north',
          'Nothing can stop it'
        ],
        correctIndex: 0,
        cipherDigit: '3',
        hintFr: 'Observez la conjonction « unless » (= sauf si / à moins que).',
        explanationFr: '« Unless the maritime committee requests an amendment beforehand » pose la seule condition suspensive.'
      },
      {
        id: 'dow-4',
        lockTitle: 'Cadenas IV : Le Sceau Lexical C1',
        clueType: 'vocabulary',
        narrativeEn: 'Identify the C1 verb meaning "to express an idea in specific words or style":',
        narrativeFr: 'Identifiez le verbe C1 signifiant « formuler avec précaution » :',
        question: 'In "She couched her proposal in measured ambiguity", what does "to couch" mean here?',
        options: ['To sit down quietly', 'To phrase or express in a particular way', 'To cancel an appointment', 'To translate literally'],
        correctIndex: 1,
        cipherDigit: '8',
        hintFr: 'Sens figuré littéraire/diplomatique du verbe « couch ».',
        explanationFr: '« To couch [sth] in... » signifie formuler quelque chose dans des termes choisis.'
      }
    ]
  }
];

export const LISTENING_CINEMA_EPISODES: ListeningCinemaEpisode[] = [
  {
    id: 'cin-camden-market',
    title: 'Morning Rush at Camden Market',
    genre: 'Documentaire Street Food • 6e / 5e',
    durationLabel: '01:20',
    cefrLevel: 'A1',
    gradeLabel: 'Collège 6e - 5e',
    synopsisFr:
      'Suivez Maya et Tom qui achètent leur déjeuner dans un marché londonien animé. Apprenez à commander poliment et comprendre les prix.',
    keyVocab: [
      { term: 'Can I have...', ipa: '/kæn aɪ hæv/', fr: 'Est-ce que je peux avoir...' },
      { term: 'Stall', ipa: '/stɔːl/', fr: 'Stand / étal de marché' },
      { term: 'How much is it?', ipa: '/haʊ mʌtʃ ɪz ɪt/', fr: 'Combien cela coûte-t-il ?' }
    ],
    script: [
      { speaker: 'Maya', accent: 'en-GB', gender: 'female', en: 'Look Tom, that wooden stall sells fresh apple pie and hot chocolate!', fr: 'Regarde Tom, ce stand en bois vend de la tarte aux pommes fraîche et du chocolat chaud !' },
      { speaker: 'Vendor', accent: 'en-GB', gender: 'male', en: 'Good morning! What can I get for you today?', fr: 'Bonjour ! Que puis-je vous servir aujourd’hui ?' },
      { speaker: 'Tom', accent: 'en-GB', gender: 'male', en: 'Hello! Can I have one warm apple pie, please? How much is it?', fr: 'Bonjour ! Puis-je avoir une tarte aux pommes chaude, s’il vous plaît ? Combien ça coûte ?' },
      { speaker: 'Vendor', accent: 'en-GB', gender: 'male', en: 'It is four pounds fifty. Would you like cinnamon on top?', fr: 'Cela fait quatre livres cinquante. Voulez-vous de la cannelle dessus ?' },
      { speaker: 'Maya', accent: 'en-GB', gender: 'female', en: 'Yes please! Thank you very much.', fr: 'Oui s’il vous plaît ! Merci beaucoup.' }
    ],
    questions: [
      {
        id: 'cam-q1',
        question: 'What does Tom order from the stall?',
        options: ['Fish and chips', 'One warm apple pie', 'Orange juice', 'A sandwich'],
        correctIndex: 1,
        explanationFr: 'Tom demande clairement : « Can I have one warm apple pie, please? »'
      },
      {
        id: 'cam-q2',
        question: 'How much does the apple pie cost?',
        options: ['£2.50', '£3.00', '£4.50', '£6.50'],
        correctIndex: 2,
        explanationFr: 'Le vendeur répond : « It is four pounds fifty » (4,50 £).'
      },
      {
        id: 'cam-q3',
        question: 'What extra ingredient does the vendor offer?',
        options: ['Sugar', 'Cinnamon', 'Honey', 'Vanilla'],
        correctIndex: 1,
        explanationFr: '« Would you like cinnamon on top? » = voulez-vous de la cannelle ?'
      }
    ]
  },
  {
    id: 'cin-natural-history',
    title: 'Night at the Natural History Museum',
    genre: 'Aventure Culturelle • 4e / 3e',
    durationLabel: '01:45',
    cefrLevel: 'A2',
    gradeLabel: 'Collège 4e - 3e',
    synopsisFr:
      'Une visite guidée nocturne au célèbre musée de Londres révèle l’histoire de la baleine bleue Hope et des fossiles jurassiques.',
    keyVocab: [
      { term: 'Skeleton', ipa: '/ˈskel.ɪ.tən/', fr: 'Squelette' },
      { term: 'Suspended', ipa: '/səˈspen.dɪd/', fr: 'Suspendu(e)' },
      { term: 'Fossil', ipa: '/ˈfɒs.əl/', fr: 'Fossile' }
    ],
    script: [
      { speaker: 'Curator Claire', accent: 'en-GB', gender: 'female', en: 'Welcome to Hintze Hall. Look up above your heads at Hope, our twenty-five-metre blue whale skeleton.', fr: 'Bienvenue dans Hintze Hall. Levez les yeux au-dessus de vos têtes vers Hope, notre squelette de baleine bleue de vingt-cinq mètres.' },
      { speaker: 'Leo', accent: 'en-US', gender: 'male', en: 'That is incredible! Has it always been suspended from the ceiling?', fr: 'C’est incroyable ! A-t-elle toujours été suspendue au plafond ?' },
      { speaker: 'Curator Claire', accent: 'en-GB', gender: 'female', en: 'Not always! Before twenty seventeen, a giant Diplodocus dinosaur stood here for nearly forty years.', fr: 'Pas toujours ! Avant 2017, un dinosaure Diplodocus géant se tenait ici pendant près de quarante ans.' },
      { speaker: 'Leo', accent: 'en-US', gender: 'male', en: 'Why did the museum decide to replace the dinosaur with Hope?', fr: 'Pourquoi le musée a-t-il décidé de remplacer le dinosaure par Hope ?' },
      { speaker: 'Curator Claire', accent: 'en-GB', gender: 'female', en: 'Because Hope reminds visitors that modern ocean life needs protection today.', fr: 'Parce que Hope rappelle aux visiteurs que la vie marine moderne a besoin d’être protégée aujourd’hui.' }
    ],
    questions: [
      {
        id: 'nhm-q1',
        question: 'How long is Hope, the blue whale skeleton?',
        options: ['12 metres', '25 metres', '40 metres', '100 metres'],
        correctIndex: 1,
        explanationFr: 'Claire indique : « twenty-five-metre blue whale skeleton ».'
      },
      {
        id: 'nhm-q2',
        question: 'Which exhibit stood in Hintze Hall before 2017?',
        options: ['A spaceship', 'A giant Diplodocus dinosaur', 'A submarine', 'An oak tree'],
        correctIndex: 1,
        explanationFr: 'Un squelette de Diplodocus se trouvait dans le hall avant 2017.'
      },
      {
        id: 'nhm-q3',
        question: 'What message does Hope symbolize?',
        options: [
          'The invention of trains',
          'Modern ocean life needs protection',
          'Winter in Scotland',
          'Royal history'
        ],
        correctIndex: 1,
        explanationFr: 'Elle symbolise l’urgence de protéger les océans modernes.'
      }
    ]
  },
  {
    id: 'cin-silicon-interview',
    title: 'Inside an Ecological Tech Pitch',
    genre: 'Chronique Innovation • 2nde / 1re',
    durationLabel: '02:05',
    cefrLevel: 'B1',
    gradeLabel: 'Lycée 2nde - 1re',
    synopsisFr:
      'Une fondatrice présente son prototype d’énergie solaire urbaine face à un journaliste scientifique de San Francisco.',
    keyVocab: [
      { term: 'Breakthrough', ipa: '/ˈbreɪk.θruː/', fr: 'Percée / avancée majeure' },
      { term: 'Grid', ipa: '/ɡrɪd/', fr: 'Réseau électrique' },
      { term: 'Recyclable', ipa: '/ˌriːˈsaɪ.klə.bəl/', fr: 'Recyclable' }
    ],
    script: [
      { speaker: 'Host Marcus', accent: 'en-US', gender: 'male', en: 'Your team claims your transparent solar windows can power entire school buildings. Is that realistic?', fr: 'Votre équipe affirme que vos vitres solaires transparentes peuvent alimenter des lycées entiers. Est-ce réaliste ?' },
      { speaker: 'Dr. Nina Patel', accent: 'en-US', gender: 'female', en: 'Yes, because we coat ordinary glass with organic cells that capture invisible ultraviolet light while staying crystal clear.', fr: 'Oui, car nous recouvrons le verre ordinaire de cellules organiques qui captent les UV invisibles tout en restant parfaitement transparentes.' },
      { speaker: 'Host Marcus', accent: 'en-US', gender: 'male', en: 'What happens during cloudy winter weeks when sunlight drops?', fr: 'Que se passe-t-il durant les semaines nuageuses d’hiver quand l’ensoleillement baisse ?' },
      { speaker: 'Dr. Nina Patel', accent: 'en-US', gender: 'female', en: 'Each classroom links to a local battery wall and draws backup energy from the municipal grid only when required.', fr: 'Chaque salle est reliée à une batterie locale et ne puise sur le réseau municipal qu’en cas de nécessité.' }
    ],
    questions: [
      {
        id: 'tech-q1',
        question: 'How do the solar windows stay transparent?',
        options: [
          'They mirror sunlight away',
          'They capture invisible ultraviolet light with organic cells',
          'They rotate automatically at night',
          'They only work outdoors'
        ],
        correctIndex: 1,
        explanationFr: 'Elles captent uniquement la lumière ultraviolette invisible tout en laissant passer la lumière visible.'
      },
      {
        id: 'tech-q2',
        question: 'How do schools handle cloudy weeks?',
        options: [
          'They close the windows',
          'They combine a local battery wall and municipal grid backup',
          'They use diesel engines',
          'They turn off computers'
        ],
        correctIndex: 1,
        explanationFr: 'Une batterie locale stocke l’énergie et le réseau municipal prend le relais si besoin.'
      }
    ]
  },
  {
    id: 'cin-oxford-debate-ai',
    title: 'Oxford Union Debate: Literature in the Digital Age',
    genre: 'Débat Académique • Terminale C1/C2',
    durationLabel: '02:20',
    cefrLevel: 'C1',
    gradeLabel: 'Terminale & Supérieur',
    synopsisFr:
      'Deux orateurs d’Oxford confrontent leurs arguments sur la lecture lente face à l’accélération de l’information.',
    keyVocab: [
      { term: 'Attentiveness', ipa: '/əˈten.tɪv.nəs/', fr: 'Attention soutenue' },
      { term: 'Fleeting', ipa: '/ˈfliː.tɪŋ/', fr: 'Éphémère / fugace' },
      { term: 'Nuance', ipa: '/ˈnjuː.ɑːns/', fr: 'Nuance subtile' }
    ],
    script: [
      { speaker: 'Lady Eleanor', accent: 'en-GB', gender: 'female', en: 'In an era dominated by fleeting headlines, sustained reading cultivates intellectual patience that no brief summary can replicate.', fr: 'À une époque dominée par des titres éphémères, la lecture soutenue cultive une patience intellectuelle qu’aucun résumé rapide ne peut reproduire.' },
      { speaker: 'Professor Julian', accent: 'en-GB', gender: 'male', en: 'Granted, deep reading sharpens nuance; yet curated audio archives open classical thought to commuters who previously lacked access.', fr: 'Certes, la lecture approfondie affine la nuance ; toutefois, les archives audio ouvrent la pensée classique à ceux qui en étaient privés.' },
      { speaker: 'Lady Eleanor', accent: 'en-GB', gender: 'female', en: 'Perhaps the true art lies not in rejecting digital speed, but in defending deliberate quiet time to ponder difficult prose.', fr: 'Peut-être que le véritable art consiste non à rejeter la vitesse numérique, mais à défendre un temps calme délibéré pour méditer les textes complexes.' }
    ],
    questions: [
      {
        id: 'oxd-q1',
        question: 'What quality does Lady Eleanor argue sustained reading builds?',
        options: ['Faster typing speed', 'Intellectual patience', 'Higher social media reach', 'Short-term recall only'],
        correctIndex: 1,
        explanationFr: 'Elle souligne la « patience intellectuelle » face aux gros titres éphémères.'
      },
      {
        id: 'oxd-q2',
        question: 'How does Professor Julian balance the argument?',
        options: [
          'He claims books are obsolete',
          'He notes audio archives expand access to classical thought',
          'He rejects digital media entirely',
          'He refuses to discuss reading'
        ],
        correctIndex: 1,
        explanationFr: 'Il rappelle que les archives audio démocratisent l’accès à la culture classique.'
      }
    ]
  }
];

export const GRAMMAR_BATTLE_QUESTIONS: GrammarBattleQuestion[] = [
  // Collège Junior (6e - 5e / A1)
  {
    id: 'gb-j1',
    gradeTier: 'college_junior',
    cefrLevel: 'A1',
    grammarTopic: 'Présent Simple (3e personne)',
    promptEn: 'My sister usually ___ English podcasts before sleeping.',
    options: ['listen to', 'listens to', 'listening to', 'is listen to'],
    correctIndex: 1,
    explanationFr: 'Avec un sujet à la 3e personne du singulier (« My sister » = she) et une habitude (« usually »), on ajoute -s au verbe : « listens to ».',
    damage: 25
  },
  {
    id: 'gb-j2',
    gradeTier: 'college_junior',
    cefrLevel: 'A1',
    grammarTopic: 'Question au Présent Simple',
    promptEn: '___ your classmates play rugby every Wednesday?',
    options: ['Does', 'Do', 'Are', 'Is'],
    correctIndex: 1,
    explanationFr: '« Your classmates » est pluriel (= they). Pour poser une question avec un verbe lexical (« play »), on utilise l’auxiliaire « Do ».',
    damage: 25
  },
  {
    id: 'gb-j3',
    gradeTier: 'college_junior',
    cefrLevel: 'A1',
    grammarTopic: 'Comparatif de Supériorité',
    promptEn: 'London is much ___ than our village.',
    options: ['bigger', 'more big', 'biggest', 'the bigger'],
    correctIndex: 0,
    explanationFr: 'L’adjectif court « big » double sa consonne finale et prend « -er » au comparatif : « bigger ».',
    damage: 25
  },
  {
    id: 'gb-j4',
    gradeTier: 'college_junior',
    cefrLevel: 'A1',
    grammarTopic: 'Prétérit Régulier',
    promptEn: 'Yesterday evening, we ___ a fascinating museum tour.',
    options: ['visit', 'visited', 'visiting', 'will visit'],
    correctIndex: 1,
    explanationFr: 'L’indicateur de temps passé révolu « Yesterday evening » impose le prétérit : « visited ».',
    damage: 25
  },
  // Collège Senior (4e - 3e / A2-B1)
  {
    id: 'gb-s1',
    gradeTier: 'college_senior',
    cefrLevel: 'A2',
    grammarTopic: 'Present Perfect (Expérience)',
    promptEn: 'Have you ever ___ a speech in front of your whole class?',
    options: ['give', 'gave', 'given', 'giving'],
    correctIndex: 2,
    explanationFr: 'Le Present Perfect se construit avec « Have/Has + participe passé » : « given ».',
    damage: 30
  },
  {
    id: 'gb-s2',
    gradeTier: 'college_senior',
    cefrLevel: 'A2',
    grammarTopic: 'Since vs For',
    promptEn: 'She has studied theatre at school ___ four years.',
    options: ['since', 'for', 'during', 'ago'],
    correctIndex: 1,
    explanationFr: 'Devant une durée chiffrée (« four years »), on emploie « for » (« since » sert pour un point de départ précis).',
    damage: 30
  },
  {
    id: 'gb-s3',
    gradeTier: 'college_senior',
    cefrLevel: 'B1',
    grammarTopic: 'Voix Passive au Passé',
    promptEn: 'Tower Bridge ___ built in the late nineteenth century.',
    options: ['is', 'was', 'were', 'has'],
    correctIndex: 1,
    explanationFr: 'Construction passive au passé singulier : « was + participe passé » (« was built »).',
    damage: 30
  },
  {
    id: 'gb-s4',
    gradeTier: 'college_senior',
    cefrLevel: 'A2',
    grammarTopic: 'Pronoms Relatifs',
    promptEn: 'The guide ___ showed us Westminster Palace spoke very clearly.',
    options: ['which', 'who', 'what', 'whose'],
    correctIndex: 1,
    explanationFr: 'Pour reprendre une personne sujet (« The guide »), on utilise « who ».',
    damage: 30
  },
  // Lycée 2nde / 1re (B1 - B2)
  {
    id: 'gb-l1',
    gradeTier: 'lycee_seconde_premiere',
    cefrLevel: 'B1',
    grammarTopic: 'Conditionnel Type 2',
    promptEn: 'If teenagers read more varied articles, their vocabulary ___ expand rapidly.',
    options: ['will', 'would', 'shall', 'has'],
    correctIndex: 1,
    explanationFr: 'Hypothèse irréelle/potentielle dans le présent : If + prétérit modal (« read » ici passé), principale en « would + BV ».',
    damage: 35
  },
  {
    id: 'gb-l2',
    gradeTier: 'lycee_seconde_premiere',
    cefrLevel: 'B2',
    grammarTopic: 'Used to vs Be used to',
    promptEn: 'After two months in Dublin, Thomas is finally ___ to waking up to soft rain.',
    options: ['used', 'use', 'using', 'accustom'],
    correctIndex: 0,
    explanationFr: '« Be used to + V-ing » signifie être habitué à quelque chose.',
    damage: 35
  },
  {
    id: 'gb-l3',
    gradeTier: 'lycee_seconde_premiere',
    cefrLevel: 'B2',
    grammarTopic: 'Modaux de Déduction Passée',
    promptEn: 'Look at the wet pavement: it ___ rained heavily during the night.',
    options: ['must have', 'should', 'can', 'need have'],
    correctIndex: 0,
    explanationFr: '« Must have + participe passé » exprime une quasi-certitude concernant le passé.',
    damage: 35
  },
  {
    id: 'gb-l4',
    gradeTier: 'lycee_seconde_premiere',
    cefrLevel: 'B2',
    grammarTopic: 'Despite vs Although',
    promptEn: '___ the tight deadline, the journalism club published an exceptional issue.',
    options: ['Although', 'Despite', 'Even though', 'Whereas'],
    correctIndex: 1,
    explanationFr: '« Despite » est suivi d’un groupe nominal (« the tight deadline »), contrairement à « although » qui exige une proposition complète.',
    damage: 35
  },
  // Terminale (B2 / C1 / C2)
  {
    id: 'gb-t1',
    gradeTier: 'lycee_terminale',
    cefrLevel: 'C1',
    grammarTopic: 'Inversion Négative',
    promptEn: 'Not only ___ deliver an eloquent speech, but she also answered every question calmly.',
    options: ['she did', 'did she', 'she has', 'was she'],
    correctIndex: 1,
    explanationFr: '« Not only » en position initiale déclenche obligatoirement l’inversion auxiliaire + sujet : « Not only did she deliver... ».',
    damage: 40
  },
  {
    id: 'gb-t2',
    gradeTier: 'lycee_terminale',
    cefrLevel: 'C1',
    grammarTopic: 'Conditionnel Mixte & Inversion sans If',
    promptEn: '___ the envoy been briefed earlier, the summit outcome might differ today.',
    options: ['Had', 'Should', 'Were', 'Did'],
    correctIndex: 0,
    explanationFr: 'Inversion littéraire du Past Perfect remplaçant « If the envoy had been... » : « Had the envoy been... ».',
    damage: 40
  },
  {
    id: 'gb-t3',
    gradeTier: 'lycee_terminale',
    cefrLevel: 'C1',
    grammarTopic: 'Subjonctif Mandatif',
    promptEn: 'The committee insisted that every candidate ___ fluent in formal correspondence.',
    options: ['is', 'be', 'was', 'being'],
    correctIndex: 1,
    explanationFr: 'Après « insist that », le registre soutenu privilégie le subjonctif mandatif sans flexion : « be ».',
    damage: 40
  },
  {
    id: 'gb-t4',
    gradeTier: 'lycee_terminale',
    cefrLevel: 'C2',
    grammarTopic: 'Cleft Sentence & Emphase',
    promptEn: 'It was her quiet persistence, rather than luck, ___ secured the scholarship.',
    options: ['who', 'whom', 'that', 'what'],
    correctIndex: 2,
    explanationFr: 'Dans une phrase clivée focalisant sur une qualité non humaine (« persistence »), on utilise « that ».',
    damage: 40
  }
];
