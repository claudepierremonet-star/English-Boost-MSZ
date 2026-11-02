/**
 * EnglishBoost Multi-Accent & Neural Voice Engine
 * Real, authentic speech synthesis for American English (en-US),
 * British English (en-GB), and French Translations (fr-FR).
 *
 * Catalogue of 30 Fine-Tuned Voice Personas:
 * - 10 US Voices (5 Female, 5 Male — Normal & Grave)
 * - 10 UK Voices (5 Female, 5 Male — Normal & Grave)
 * - 10 French Voices (5 Female, 5 Male — Normal & Grave)
 *
 * Features:
 * - Non-robotic cadence, acoustic pitch & formant calibration
 * - Auto-play on flip for Flashcards ('Auto-play Audio')
 * - Real-time state subscription & audio cancellation
 * - LocalStorage persistence for user preferences
 */

export type AccentType = 'en-GB' | 'en-US';
export type LanguageTarget = 'en-US' | 'en-GB' | 'fr-FR';
export type VoiceGender = 'female' | 'male' | 'auto';
export type PersonaTone = 'normal' | 'grave';
export type AutoPlayAccentMode = 'en-GB' | 'en-US' | 'alternating' | 'both';

export interface VoicePersona {
  id: string;
  language: LanguageTarget;
  name: string;
  gender: 'female' | 'male';
  tone: PersonaTone;
  toneLabel: string; // e.g. "Voix Grave & Feutrée" | "Voix Normale Cristalline"
  description: string;
  region: string;
  pitch: number;
  rate: number;
  preferredPhysicalPatterns: string[];
  sampleSentence: string;
  avatarIcon: string;
  accentBadge: string;
}

export interface AccentInfo {
  code: AccentType;
  label: string;
  flag: string;
  region: string;
  phoneticDescription: string;
  keyFeatures: string[];
  defaultRate: number;
  defaultPitch: number;
}

export const ACCENTS_INFO: Record<AccentType, AccentInfo> = {
  'en-GB': {
    code: 'en-GB',
    label: 'British English',
    flag: '🇬🇧',
    region: 'UK (Oxford / Received Pronunciation)',
    phoneticDescription: 'Prononciation académique britannique sans rhotisme (RP), voyelles pures et articulation soignée.',
    keyFeatures: [
      'Non-rhôtique : le /r/ ne se prononce pas devant consonne ou en fin de mot (ex: "car" -> [kɑː])',
      'Voyelle large /ɑː/ dans "dance", "fast", "path"',
      'Consonnes plosives nettes /t/ et /p/ sans affaiblissement',
      'Intonation mélodique montante-descendante typique d\'Oxford'
    ],
    defaultRate: 0.88,
    defaultPitch: 1.02
  },
  'en-US': {
    code: 'en-US',
    label: 'American English',
    flag: '🇺🇸',
    region: 'US (General American / Network Standard)',
    phoneticDescription: 'Prononciation américaine authentique avec rhotisme rétroflexe prononcé, flapping du /t/ intervocalique et voyelle /æ/ allongée.',
    keyFeatures: [
      'Fort rhotisme rétroflexe : le /r/ résonne avec intensité dans "hard", "bird", "water", "car"',
      'Flap T [ɾ] : le "t" entre deux voyelles devient doux comme un "d" léger ("water" -> [wɑːt̬ɚ], "butter", "city")',
      'Voyelle plate /æ/ dans "can\'t", "dance", "half", "afternoon"',
      'Cadence décontractée, résonance de poitrine chaleureuse et débit fluide'
    ],
    defaultRate: 0.93,
    defaultPitch: 0.98
  }
};

// ============================================================================
// 30 FINE-TUNED VOICE PERSONAS (5 Female & 5 Male for US, UK, FR)
// ============================================================================
export const VOICE_PERSONAS: VoicePersona[] = [
  // --------------------------------------------------------------------------
  // AMERICAN ENGLISH (en-US) : 5 FEMALE & 5 MALE
  // --------------------------------------------------------------------------
  {
    id: 'us-fem-1',
    language: 'en-US',
    name: 'Aria',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Cristalline & Moderne',
    description: 'Voix studio américaine fluide, naturelle et parfaitement intelligible, idéale pour un apprentissage dynamique.',
    region: 'New York (Broadcast Standard)',
    pitch: 1.0,
    rate: 0.94,
    preferredPhysicalPatterns: ['Aria', 'Jenny', 'Samantha', 'Google US English', 'en-us-x-sfg#female_1-local'],
    sampleSentence: 'Clear enunciation and relaxed American vowels create immediate natural fluency.',
    avatarIcon: 'record_voice_over',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-fem-2',
    language: 'en-US',
    name: 'Jenny',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Douce & Bienveillante',
    description: 'Timbre chaleureux et posé avec une intonation mélodieuse qui facilite la rétention cognitive des expressions idiomatiques.',
    region: 'California (West Coast Clear)',
    pitch: 0.97,
    rate: 0.91,
    preferredPhysicalPatterns: ['Jenny', 'Zira', 'Samantha', 'Ava'],
    sampleSentence: 'Listening to authentic conversational rhythms helps words settle effortlessly into long-term memory.',
    avatarIcon: 'spatial_audio_off',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-fem-3',
    language: 'en-US',
    name: 'Ava',
    gender: 'female',
    tone: 'grave',
    toneLabel: 'Voix Grave • Chaleureuse & Feutrée',
    description: 'Voix féminine grave avec une résonance de poitrine riche, feutrée et sans agressivité dans les aigus.',
    region: 'Boston (Academic Studio)',
    pitch: 0.84,
    rate: 0.89,
    preferredPhysicalPatterns: ['Ava', 'Nicky', 'Samantha (Enhanced)', 'Microsoft Jenny'],
    sampleSentence: 'In literature and formal negotiation, a deliberate lower register commands attention and trust.',
    avatarIcon: 'graphic_eq',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-fem-4',
    language: 'en-US',
    name: 'Zoe',
    gender: 'female',
    tone: 'grave',
    toneLabel: 'Voix Grave • Résonante & Veloutée',
    description: 'Timbre bas et profond, velouté et immersif, parfait pour les sessions prolongées sans fatigue auditive.',
    region: 'Chicago (Midwest Resonance)',
    pitch: 0.79,
    rate: 0.87,
    preferredPhysicalPatterns: ['Zoe', 'Ava (Premium)', 'Samantha', 'Google US'],
    sampleSentence: 'Notice how the retroflex American R echoes with steady warmth and quiet authority.',
    avatarIcon: 'mic',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-fem-5',
    language: 'en-US',
    name: 'Harper',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Pédagogique & Expressive',
    description: 'Diction soignée de type conférence et podcast éducatif, soulignant avec netteté les liaisons et le flapping du T.',
    region: 'Washington D.C. (Editorial)',
    pitch: 1.02,
    rate: 0.93,
    preferredPhysicalPatterns: ['Michelle', 'Jenny', 'Samantha', 'Zira'],
    sampleSentence: 'Every verb and nuance you practice today expands your expressive capability tomorrow.',
    avatarIcon: 'volume_up',
    accentBadge: '🇺🇸 US'
  },

  // US MALE (5 VOIX)
  {
    id: 'us-male-1',
    language: 'en-US',
    name: 'Guy',
    gender: 'male',
    tone: 'normal',
    toneLabel: 'Voix Normale • Naturelle & Équilibrée',
    description: 'Voix masculine américaine équilibrée, claire et non-robotisée, représentative du General American contemporain.',
    region: 'National Public Radio (NPR)',
    pitch: 1.0,
    rate: 0.92,
    preferredPhysicalPatterns: ['Guy', 'David', 'Alex', 'Google US English', 'en-us-x-sfg#male_1-local'],
    sampleSentence: 'Mastering natural stress and connected speech gives you effortless confidence in any setting.',
    avatarIcon: 'record_voice_over',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-male-2',
    language: 'en-US',
    name: 'Alex',
    gender: 'male',
    tone: 'normal',
    toneLabel: 'Voix Normale • Dynamique & Décontractée',
    description: 'Timbre vivant et moderne d’université américaine, avec un débit naturel et un accent tonique franc.',
    region: 'Seattle (Pacific Northwest)',
    pitch: 0.98,
    rate: 0.94,
    preferredPhysicalPatterns: ['Alex', 'Fred', 'Tom', 'David'],
    sampleSentence: 'Pay attention to how the vowels remain vibrant and relaxed in spontaneous conversation.',
    avatarIcon: 'headset_mic',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-male-3',
    language: 'en-US',
    name: 'Christopher',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Grave • Chaleureuse & Posée',
    description: 'Voix masculine grave, chaleureuse et posée avec une assise de basse naturelle sans résonance artificielle.',
    region: 'New York (Documentary Narrator)',
    pitch: 0.82,
    rate: 0.88,
    preferredPhysicalPatterns: ['Christopher', 'Guy', 'Tom (Enhanced)', 'David'],
    sampleSentence: 'Subtle distinctions in vocabulary reveal the difference between basic understanding and mastery.',
    avatarIcon: 'graphic_eq',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-male-4',
    language: 'en-US',
    name: 'Eric',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Très Grave • Basse Profonde & Enveloppante',
    description: 'Voix masculine très grave, timbre de basse radio immersif et enveloppant qui donne du poids à chaque syllabe.',
    region: 'Denver (Deep Resonance)',
    pitch: 0.75,
    rate: 0.85,
    preferredPhysicalPatterns: ['Eric', 'Guy', 'Evan (Enhanced)', 'Alex'],
    sampleSentence: 'A deep, deliberate cadence anchors complex collocations firmly in your active vocabulary.',
    avatarIcon: 'podcasts',
    accentBadge: '🇺🇸 US'
  },
  {
    id: 'us-male-5',
    language: 'en-US',
    name: 'Tom',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Grave • Oratoire & Studio',
    description: 'Timbre baryton soigné rappelant les grands orateurs américains, articulant avec rigueur les polysyllabes.',
    region: 'Philadelphia (Classical Baritone)',
    pitch: 0.85,
    rate: 0.89,
    preferredPhysicalPatterns: ['Tom', 'David', 'Guy', 'Alex'],
    sampleSentence: 'Precision in phrasing is the foundation of persuasive intellectual dialogue.',
    avatarIcon: 'mic',
    accentBadge: '🇺🇸 US'
  },

  // --------------------------------------------------------------------------
  // BRITISH ENGLISH (en-GB) : 5 FEMALE & 5 MALE
  // --------------------------------------------------------------------------
  {
    id: 'uk-fem-1',
    language: 'en-GB',
    name: 'Sonia',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Oxford RP & Académique',
    description: 'Prononciation britannique académique pure (Received Pronunciation) d’Oxford, cristalline et mélodieuse.',
    region: 'Oxford (High Table / Bodleian)',
    pitch: 1.02,
    rate: 0.89,
    preferredPhysicalPatterns: ['Sonia', 'Serena', 'Google UK English Female', 'Kate', 'Hazel'],
    sampleSentence: 'The beauty of Received Pronunciation lies in its unhurried articulation and pure vowel qualities.',
    avatarIcon: 'school',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-fem-2',
    language: 'en-GB',
    name: 'Serena',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Douce & Cambridge Classic',
    description: 'Voix féminine britannique douce et distinguée, respectant la non-rhoticité et les plosives délicates.',
    region: 'Cambridge (King’s College)',
    pitch: 0.98,
    rate: 0.88,
    preferredPhysicalPatterns: ['Serena', 'Sonia', 'Stephanie', 'Kate'],
    sampleSentence: 'Notice how the broad vowel in dance and bath lends timeless dignity to scholarly discourse.',
    avatarIcon: 'spatial_audio_off',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-fem-3',
    language: 'en-GB',
    name: 'Victoria',
    gender: 'female',
    tone: 'grave',
    toneLabel: 'Voix Grave • Aristocratique & Chaleureuse',
    description: 'Voix féminine grave avec un timbre royal, chaleureux et feutré, idéal pour savourer la philologie et l’étymologie.',
    region: 'London (Westminster Archives)',
    pitch: 0.83,
    rate: 0.86,
    preferredPhysicalPatterns: ['Victoria', 'Serena', 'Sonia', 'Hazel'],
    sampleSentence: 'Centuries of parliamentary debate and literary tradition echo in the gravity of each lexeme.',
    avatarIcon: 'workspace_premium',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-fem-4',
    language: 'en-GB',
    name: 'Eleanor',
    gender: 'female',
    tone: 'grave',
    toneLabel: 'Voix Grave • Théâtrale & Feutrée',
    description: 'Voix grave feutrée rappelant les scènes shakespeariennes, dotée d’une résonance calme et profonde.',
    region: 'Stratford / Oxford Fellows',
    pitch: 0.79,
    rate: 0.85,
    preferredPhysicalPatterns: ['Eleanor', 'Sonia', 'Serena', 'Google UK English Female'],
    sampleSentence: 'Silence and deliberate pacing allow the true weight of an argument to settle in the mind.',
    avatarIcon: 'theater_comedy',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-fem-5',
    language: 'en-GB',
    name: 'Kate',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Vive & BBC Contemporain',
    description: 'Voix britannique vive, dynamique et soignée, inspirée des grands reportages culturels de la BBC.',
    region: 'London (BBC Broadcasting House)',
    pitch: 1.04,
    rate: 0.91,
    preferredPhysicalPatterns: ['Kate', 'Stephanie', 'Sonia', 'Google UK'],
    sampleSentence: 'Clarity of mind is immediately reflected in the crispness of your consonants.',
    avatarIcon: 'podcasts',
    accentBadge: '🇬🇧 UK'
  },

  // UK MALE (5 VOIX)
  {
    id: 'uk-male-1',
    language: 'en-GB',
    name: 'Ryan',
    gender: 'male',
    tone: 'normal',
    toneLabel: 'Voix Normale • Bodleian Vaults & Distinction',
    description: 'Voix masculine d’Oxford équilibrée et naturelle, incarnant la clarté pédagogique britannique classique.',
    region: 'Oxford (Magdalen & Bodleian)',
    pitch: 1.0,
    rate: 0.89,
    preferredPhysicalPatterns: ['Ryan', 'Daniel', 'George', 'Google UK English Male', 'Oliver'],
    sampleSentence: 'Non-rhotic phrasing ensures that terminal consonants ring out with absolute precision.',
    avatarIcon: 'school',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-male-2',
    language: 'en-GB',
    name: 'Oliver',
    gender: 'male',
    tone: 'normal',
    toneLabel: 'Voix Normale • Professorale & Articulée',
    description: 'Diction professorale élégante et posée, idéale pour décortiquer les collocations et les citations d’époque.',
    region: 'Cambridge (Trinity Archives)',
    pitch: 0.96,
    rate: 0.88,
    preferredPhysicalPatterns: ['Oliver', 'Ryan', 'Daniel', 'Arthur'],
    sampleSentence: 'Each phrase in this curriculum has been selected to cultivate effortless stylistic refinement.',
    avatarIcon: 'auto_stories',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-male-3',
    language: 'en-GB',
    name: 'Daniel',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Grave • Résonance d’Oxford & Chaleur',
    description: 'Voix masculine grave avec une résonance de poitrine chaleureuse et solennelle, typique des grands orateurs britanniques.',
    region: 'Oxford (Christ Church)',
    pitch: 0.82,
    rate: 0.85,
    preferredPhysicalPatterns: ['Daniel', 'George', 'Ryan', 'Arthur'],
    sampleSentence: 'A profound baritone brings gravitas and historical depth to classical prose.',
    avatarIcon: 'graphic_eq',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-male-4',
    language: 'en-GB',
    name: 'George',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Très Grave • Basse Solennelle & Profonde',
    description: 'Voix masculine très grave, basse profonde et majestueuse qui donne un relief incomparable aux textes complexes.',
    region: 'High Court & Inns of Court',
    pitch: 0.75,
    rate: 0.83,
    preferredPhysicalPatterns: ['George', 'Daniel', 'Ryan', 'Arthur'],
    sampleSentence: 'Under the high vaulted ceilings of the library, knowledge is savoured with quiet devotion.',
    avatarIcon: 'balance',
    accentBadge: '🇬🇧 UK'
  },
  {
    id: 'uk-male-5',
    language: 'en-GB',
    name: 'Arthur',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Grave • Littéraire & Philologique',
    description: 'Timbre grave et méditatif de savant humaniste, soulignant les racines étymologiques latines et grecques.',
    region: 'Oxford (Ashmolean Fellow)',
    pitch: 0.85,
    rate: 0.87,
    preferredPhysicalPatterns: ['Arthur', 'Daniel', 'Oliver', 'Ryan'],
    sampleSentence: 'To master a language is to understand the philosophical journey of its words.',
    avatarIcon: 'history_edu',
    accentBadge: '🇬🇧 UK'
  },

  // --------------------------------------------------------------------------
  // FRENCH (fr-FR) : 5 FEMALE & 5 MALE (POUR TRADUCTIONS & DÉFINITIONS)
  // --------------------------------------------------------------------------
  {
    id: 'fr-fem-1',
    language: 'fr-FR',
    name: 'Denise',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Parisienne Élégane & Naturelle',
    description: 'Voix française féminine fluide, claire et parfaitement naturelle, sans aucune intonation métallique.',
    region: 'Paris (Studio National)',
    pitch: 1.0,
    rate: 0.92,
    preferredPhysicalPatterns: ['Denise', 'Amélie', 'Google français', 'Julie', 'Céline', 'fr-FR'],
    sampleSentence: 'Une traduction fidèle exige de saisir la nuance subtile avant les mots eux-mêmes.',
    avatarIcon: 'record_voice_over',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-fem-2',
    language: 'fr-FR',
    name: 'Amélie',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Douce & Sorbonne Littéraire',
    description: 'Voix douce, phrasé littéraire soigné et diction cristalline facilitant la compréhension des définitions.',
    region: 'Paris (Sorbonne)',
    pitch: 0.97,
    rate: 0.90,
    preferredPhysicalPatterns: ['Amelie', 'Denise', 'Audrey', 'Google français'],
    sampleSentence: 'La clarté de la langue française éclaire chaque concept avec mesure et délicatesse.',
    avatarIcon: 'menu_book',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-fem-3',
    language: 'fr-FR',
    name: 'Juliette',
    gender: 'female',
    tone: 'grave',
    toneLabel: 'Voix Grave • Suave, Chaleureuse & Feutrée',
    description: 'Voix féminine grave, enveloppante et chaleureuse avec une résonance de poitrine feutrée très agréable.',
    region: 'Lyon (Studio Théâtre)',
    pitch: 0.83,
    rate: 0.88,
    preferredPhysicalPatterns: ['Juliette', 'Denise', 'Amelie', 'Google français'],
    sampleSentence: 'La beauté d\'une explication réside dans sa résonance calme, profonde et sincère.',
    avatarIcon: 'graphic_eq',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-fem-4',
    language: 'fr-FR',
    name: 'Éléonore',
    gender: 'female',
    tone: 'grave',
    toneLabel: 'Voix Grave • Timbre Contemplatif & Profond',
    description: 'Voix féminine grave et posée, idéale pour les explications philologiques approfondies et les citations.',
    region: 'Bordeaux (Lettres Classiques)',
    pitch: 0.78,
    rate: 0.86,
    preferredPhysicalPatterns: ['Eleonore', 'Denise', 'Juliette', 'Amelie'],
    sampleSentence: 'Prenez le temps d\'écouter la justesse et la profondeur qui accompagnent chaque sens.',
    avatarIcon: 'history_edu',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-fem-5',
    language: 'fr-FR',
    name: 'Camille',
    gender: 'female',
    tone: 'normal',
    toneLabel: 'Voix Normale • Expressive & Diction Moderne',
    description: 'Diction dynamique et contemporaine, idéale pour les traductions rapides du quotidien et des voyages.',
    region: 'Paris (Radio & Édition)',
    pitch: 1.03,
    rate: 0.93,
    preferredPhysicalPatterns: ['Camille', 'Denise', 'Amelie', 'Audrey'],
    sampleSentence: 'Comprendre l\'origine d\'un verbe transforme immédiatement l\'apprentissage en plaisir durable.',
    avatarIcon: 'podcasts',
    accentBadge: '🇫🇷 FR'
  },

  // FR MALE (5 VOIX)
  {
    id: 'fr-male-1',
    language: 'fr-FR',
    name: 'Henri',
    gender: 'male',
    tone: 'normal',
    toneLabel: 'Voix Normale • Académie & Diction Irréprochable',
    description: 'Voix masculine classique, diction académique claire et noble sans aucun artifice.',
    region: 'Paris (Institut de France)',
    pitch: 1.0,
    rate: 0.90,
    preferredPhysicalPatterns: ['Henri', 'Thomas', 'Mathieu', 'Google français', 'Paul'],
    sampleSentence: 'Ce qui se conçoit bien s\'énonce clairement, et les mots pour le dire arrivent aisément.',
    avatarIcon: 'school',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-male-2',
    language: 'fr-FR',
    name: 'Alexandre',
    gender: 'male',
    tone: 'normal',
    toneLabel: 'Voix Normale • Dynamique & Naturelle',
    description: 'Voix d’étudiant brillant et moderne du Quartier Latin, naturelle, fluide et accessible.',
    region: 'Paris (Quartier Latin)',
    pitch: 0.97,
    rate: 0.94,
    preferredPhysicalPatterns: ['Alexandre', 'Thomas', 'Nicolas', 'Google français'],
    sampleSentence: 'Une prononciation limpide permet de mémoriser instantanément la structure des phrases.',
    avatarIcon: 'record_voice_over',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-male-3',
    language: 'fr-FR',
    name: 'Victor',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Grave • Conteur Chaleureux & Posé',
    description: 'Voix masculine grave, chaleureuse et captivante, rappelant les grands lecteurs de livres audio.',
    region: 'Normandie (Baryton Studio)',
    pitch: 0.82,
    rate: 0.86,
    preferredPhysicalPatterns: ['Victor', 'Henri', 'Thomas', 'Google français'],
    sampleSentence: 'Les grands mots résonnent toujours mieux lorsqu\'ils sont portés par une voix grave et bienveillante.',
    avatarIcon: 'graphic_eq',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-male-4',
    language: 'fr-FR',
    name: 'Gabriel',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Très Grave • Basse Solennelle & Enveloppante',
    description: 'Voix très grave, résonance de basse puissante et rassurante qui ancre solidement chaque règle de grammaire.',
    region: 'Provence (Basse Profonde)',
    pitch: 0.75,
    rate: 0.83,
    preferredPhysicalPatterns: ['Gabriel', 'Henri', 'Victor', 'Thomas'],
    sampleSentence: 'Une assise vocale profonde pour imprimer durablement les principes essentiels dans votre mémoire.',
    avatarIcon: 'mic',
    accentBadge: '🇫🇷 FR'
  },
  {
    id: 'fr-male-5',
    language: 'fr-FR',
    name: 'Louis',
    gender: 'male',
    tone: 'grave',
    toneLabel: 'Voix Grave • Philosophique & Posée',
    description: 'Timbre grave et posé, mesuré et philosophique, idéal pour décortiquer les finesses de vocabulaire.',
    region: 'Paris (Collège de France)',
    pitch: 0.85,
    rate: 0.88,
    preferredPhysicalPatterns: ['Louis', 'Henri', 'Victor', 'Mathieu'],
    sampleSentence: 'L\'élégance de la pensée commence toujours par l\'exactitude scrupuleuse des termes choisis.',
    avatarIcon: 'balance',
    accentBadge: '🇫🇷 FR'
  }
];

// ============================================================================
// LOCAL STORAGE KEYS & DEFAULT PREFERENCES
// ============================================================================
const PREF_VOICE_US_KEY = 'eb_msz_voice_persona_us';
const PREF_VOICE_UK_KEY = 'eb_msz_voice_persona_uk';
const PREF_VOICE_FR_KEY = 'eb_msz_voice_persona_fr';
const PREF_AUTOPLAY_FLIP_KEY = 'eb_msz_autoplay_on_flip';
const PREF_AUTOPLAY_DISPLAY_KEY = 'eb_msz_autoplay_on_display';
const PREF_AUTOPLAY_ACCENT_KEY = 'eb_msz_autoplay_accent';
const PREF_AUTOPLAY_INCLUDE_FR_KEY = 'eb_msz_autoplay_include_fr';
const PREF_AUDIO_SPEED_MULTIPLIER_KEY = 'eb_msz_audio_speed_multiplier';

// Legacy keys for backward compatibility
const LEGACY_PREF_US_GENDER_KEY = 'eb_msz_us_voice_gender';
const LEGACY_PREF_US_VOICE_URI_KEY = 'eb_msz_us_voice_uri';
const LEGACY_PREF_LAST_AUTOPLAY_ACCENT_KEY = 'eb_msz_last_autoplay_accent';

// Active Preferences in memory
let selectedVoiceUsId: string = 'us-fem-1';
let selectedVoiceUkId: string = 'uk-male-1';
let selectedVoiceFrId: string = 'fr-fem-1';

// Auto-play options
let autoPlayOnFlip: boolean = true; // Auto-play on card flip enabled by default!
let autoPlayOnDisplay: boolean = false; // Auto-play when moving to next card
let autoPlayAccentPreference: AutoPlayAccentMode = 'alternating';
let autoPlayIncludeFrench: boolean = false;
let audioSpeedMultiplier: number = 1.0;
let lastAutoPlayAccent: AccentType = 'en-US';

// Load stored values safely
try {
  if (typeof localStorage !== 'undefined') {
    const savedUs = localStorage.getItem(PREF_VOICE_US_KEY);
    if (savedUs && VOICE_PERSONAS.some((p) => p.id === savedUs)) selectedVoiceUsId = savedUs;

    const savedUk = localStorage.getItem(PREF_VOICE_UK_KEY);
    if (savedUk && VOICE_PERSONAS.some((p) => p.id === savedUk)) selectedVoiceUkId = savedUk;

    const savedFr = localStorage.getItem(PREF_VOICE_FR_KEY);
    if (savedFr && VOICE_PERSONAS.some((p) => p.id === savedFr)) selectedVoiceFrId = savedFr;

    const savedFlip = localStorage.getItem(PREF_AUTOPLAY_FLIP_KEY);
    if (savedFlip !== null) autoPlayOnFlip = savedFlip === 'true';

    const savedDisp = localStorage.getItem(PREF_AUTOPLAY_DISPLAY_KEY);
    if (savedDisp !== null) autoPlayOnDisplay = savedDisp === 'true';

    const savedAcc = localStorage.getItem(PREF_AUTOPLAY_ACCENT_KEY) as AutoPlayAccentMode;
    if (['en-GB', 'en-US', 'alternating', 'both'].includes(savedAcc)) {
      autoPlayAccentPreference = savedAcc;
    }

    const savedFrRead = localStorage.getItem(PREF_AUTOPLAY_INCLUDE_FR_KEY);
    if (savedFrRead !== null) autoPlayIncludeFrench = savedFrRead === 'true';

    const savedSpeed = localStorage.getItem(PREF_AUDIO_SPEED_MULTIPLIER_KEY);
    if (savedSpeed) audioSpeedMultiplier = parseFloat(savedSpeed) || 1.0;
  }
} catch (e) {
  // ignore local storage errors
}

// ============================================================================
// SYSTEM VOICES CACHE & EVENT HANDLING
// ============================================================================
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
    notifyListeners();
  };
}

// State Listeners for active audio playback indicator
type SpeechStateListener = (activeId: string | null, activeAccent: AccentType | null) => void;
const listeners = new Set<SpeechStateListener>();
let currentActiveId: string | null = null;
let currentActiveAccent: AccentType | null = null;

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(currentActiveId, currentActiveAccent);
    } catch (e) {
      console.warn('Speech listener error:', e);
    }
  });
}

export function subscribeToSpeechState(listener: SpeechStateListener): () => void {
  listeners.add(listener);
  listener(currentActiveId, currentActiveAccent);
  return () => {
    listeners.delete(listener);
  };
}

// ============================================================================
// VOICE PERSONAS GETTERS & SETTERS
// ============================================================================
export function getAllVoicePersonas(): VoicePersona[] {
  return VOICE_PERSONAS;
}

export function getVoicePersonasForLanguage(lang: LanguageTarget): VoicePersona[] {
  return VOICE_PERSONAS.filter((p) => p.language === lang);
}

export function getSelectedVoicePersona(lang: LanguageTarget): VoicePersona {
  const targetId =
    lang === 'en-US' ? selectedVoiceUsId : lang === 'en-GB' ? selectedVoiceUkId : selectedVoiceFrId;
  const match = VOICE_PERSONAS.find((p) => p.id === targetId);
  if (match) return match;
  return VOICE_PERSONAS.find((p) => p.language === lang) || VOICE_PERSONAS[0];
}

export function setSelectedVoicePersona(lang: LanguageTarget, personaId: string): void {
  const persona = VOICE_PERSONAS.find((p) => p.id === personaId && p.language === lang);
  if (!persona) return;

  if (lang === 'en-US') {
    selectedVoiceUsId = personaId;
    try {
      localStorage.setItem(PREF_VOICE_US_KEY, personaId);
    } catch {}
  } else if (lang === 'en-GB') {
    selectedVoiceUkId = personaId;
    try {
      localStorage.setItem(PREF_VOICE_UK_KEY, personaId);
    } catch {}
  } else if (lang === 'fr-FR') {
    selectedVoiceFrId = personaId;
    try {
      localStorage.setItem(PREF_VOICE_FR_KEY, personaId);
    } catch {}
  }

  notifyListeners();
}

// Auto-play on Flip ('Auto-play Audio')
export function getAutoPlayOnFlip(): boolean {
  return autoPlayOnFlip;
}

export function setAutoPlayOnFlip(enabled: boolean): void {
  autoPlayOnFlip = enabled;
  try {
    localStorage.setItem(PREF_AUTOPLAY_FLIP_KEY, String(enabled));
  } catch {}
  notifyListeners();
}

// Auto-play on Display / Card Navigation
export function getAutoPlayOnDisplay(): boolean {
  return autoPlayOnDisplay;
}

export function setAutoPlayOnDisplay(enabled: boolean): void {
  autoPlayOnDisplay = enabled;
  try {
    localStorage.setItem(PREF_AUTOPLAY_DISPLAY_KEY, String(enabled));
  } catch {}
  notifyListeners();
}

// Auto-play Accent Mode
export function getAutoPlayAccentPreference(): AutoPlayAccentMode {
  return autoPlayAccentPreference;
}

export function setAutoPlayAccentPreference(mode: AutoPlayAccentMode): void {
  autoPlayAccentPreference = mode;
  try {
    localStorage.setItem(PREF_AUTOPLAY_ACCENT_KEY, mode);
  } catch {}
  notifyListeners();
}

// Speed Multiplier
export function getAudioSpeedMultiplier(): number {
  return audioSpeedMultiplier;
}

export function setAudioSpeedMultiplier(speed: number): void {
  audioSpeedMultiplier = Math.max(0.7, Math.min(1.4, speed));
  try {
    localStorage.setItem(PREF_AUDIO_SPEED_MULTIPLIER_KEY, String(audioSpeedMultiplier));
  } catch {}
  notifyListeners();
}

// ============================================================================
// AUDIO INTELLIGENCE & ANTI-ROBOTIC TEXT NORMALIZATION
// ============================================================================

/**
 * Natural text cleaning: removes robotic code markers, bracketed syntax,
 * markdown artifacts, and expands conversational acronyms.
 */
export function sanitizeTextForSpeech(text: string, lang: LanguageTarget): string {
  let cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\*+/g, '')
    .replace(/[`_#~]/g, '')
    .replace(/\[([^\]]+)\]/g, '$1') // [term] -> term
    .replace(/\(([^)]+)\)/g, '$1')
    .replace(/«|»|“|”|"/g, '')
    .trim();

  if (lang === 'en-US' || lang === 'en-GB') {
    cleaned = cleaned
      .replace(/\be\.g\.\b/gi, 'for example')
      .replace(/\bi\.e\.\b/gi, 'that is')
      .replace(/\betc\.\b/gi, 'et cetera')
      .replace(/\bvs\.\b/gi, 'versus');
  }

  if (lang === 'en-US') {
    cleaned = normalizeForAmericanAccent(cleaned);
  }

  // Smooth out commas to encourage human pause
  cleaned = cleaned.replace(/\s*;\s*/g, ', ');

  return cleaned;
}

/**
 * Normalise text for authentic American English phonetic synthesis
 */
export function normalizeForAmericanAccent(text: string): string {
  let normalized = text;
  const ukToUsMap: Array<[RegExp, string]> = [
    [/\bcolour\b/gi, 'color'],
    [/\bcolours\b/gi, 'colors'],
    [/\bcoloured\b/gi, 'colored'],
    [/\bflavour\b/gi, 'flavor'],
    [/\bflavours\b/gi, 'flavors'],
    [/\bfavour\b/gi, 'favor'],
    [/\bfavours\b/gi, 'favors'],
    [/\bfavourite\b/gi, 'favorite'],
    [/\bfavourites\b/gi, 'favorites'],
    [/\bhonour\b/gi, 'honor'],
    [/\bhonours\b/gi, 'honors'],
    [/\bhumour\b/gi, 'humor'],
    [/\brumour\b/gi, 'rumor'],
    [/\brumours\b/gi, 'rumors'],
    [/\bneighbour\b/gi, 'neighbor'],
    [/\bneighbours\b/gi, 'neighbors'],
    [/\blabour\b/gi, 'labor'],
    [/\bbehaviour\b/gi, 'behavior'],
    [/\bcentre\b/gi, 'center'],
    [/\bcentres\b/gi, 'centers'],
    [/\btheatre\b/gi, 'theater'],
    [/\btheatres\b/gi, 'theaters'],
    [/\bmetre\b/gi, 'meter'],
    [/\bmetres\b/gi, 'meters'],
    [/\blitre\b/gi, 'liter'],
    [/\blitres\b/gi, 'liters'],
    [/\bfibre\b/gi, 'fiber'],
    [/\bprogramme\b/gi, 'program'],
    [/\bprogrammes\b/gi, 'programs'],
    [/\bdialogue\b/gi, 'dialog'],
    [/\bdialogues\b/gi, 'dialogs'],
    [/\borganise\b/gi, 'organize'],
    [/\borganised\b/gi, 'organized'],
    [/\borganising\b/gi, 'organizing'],
    [/\brealise\b/gi, 'realize'],
    [/\brealised\b/gi, 'realized'],
    [/\brealising\b/gi, 'realizing'],
    [/\brecognise\b/gi, 'recognize'],
    [/\brecognised\b/gi, 'recognized'],
    [/\banalyse\b/gi, 'analyze'],
    [/\banalysed\b/gi, 'analyzed'],
    [/\bwhilst\b/gi, 'while'],
    [/\bamongst\b/gi, 'among'],
    [/\blearnt\b/gi, 'learned'],
    [/\bleapt\b/gi, 'leaped'],
    [/\bdreamt\b/gi, 'dreamed'],
    [/\bgrey\b/gi, 'gray'],
    [/\bjudgement\b/gi, 'judgment']
  ];

  for (const [regex, replacement] of ukToUsMap) {
    normalized = normalized.replace(regex, replacement);
  }

  return normalized;
}

// ============================================================================
// PHYSICAL VOICE BINDING & RESOLUTION
// ============================================================================
function findPhysicalVoiceForPersona(persona: VoicePersona): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  // Filter voices that match the language prefix (en or fr)
  const langPrefix = persona.language === 'fr-FR' ? 'fr' : 'en';
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

  if (langVoices.length === 0) {
    return voices[0] || null;
  }

  // 1. Try exact or partial matches against prioritized physical patterns
  for (const pattern of persona.preferredPhysicalPatterns) {
    const patternLower = pattern.toLowerCase();
    const match = langVoices.find((v) => v.name.toLowerCase().includes(patternLower));
    if (match) return match;
  }

  // 2. Try gender matching within the language
  const isMale = persona.gender === 'male';
  const genderMatch = langVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    if (isMale) {
      return (
        nameLower.includes('male') ||
        nameLower.includes('guy') ||
        nameLower.includes('david') ||
        nameLower.includes('ryan') ||
        nameLower.includes('daniel') ||
        nameLower.includes('henri') ||
        nameLower.includes('thomas') ||
        nameLower.includes('paul')
      );
    } else {
      return (
        nameLower.includes('female') ||
        nameLower.includes('jenny') ||
        nameLower.includes('aria') ||
        nameLower.includes('samantha') ||
        nameLower.includes('sonia') ||
        nameLower.includes('serena') ||
        nameLower.includes('denise') ||
        nameLower.includes('amelie')
      );
    }
  });

  if (genderMatch) return genderMatch;

  // 3. Fallback to strict language match
  const strictMatch = langVoices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === persona.language.toLowerCase()
  );
  if (strictMatch) return strictMatch;

  return langVoices[0];
}

// ============================================================================
// CORE SPEECH FUNCTIONS
// ============================================================================

/**
 * Cancel currently playing audio
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentActiveId = null;
  currentActiveAccent = null;
  notifyListeners();
}

/**
 * Speak text in the specified accent (UK or US) using the user's chosen Voice Persona
 */
export function speakText(
  text: string,
  accent: AccentType,
  elementId: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    currentActiveId = elementId;
    currentActiveAccent = accent;
    notifyListeners();
    options?.onStart?.();
    setTimeout(() => {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
      options?.onEnd?.();
    }, 1500);
    return;
  }

  // Toggle stop if already playing this exact element with this accent
  if (currentActiveId === elementId && currentActiveAccent === accent) {
    stopSpeech();
    return;
  }

  window.speechSynthesis.cancel();

  const cleanText = sanitizeTextForSpeech(text, accent);
  if (!cleanText) return;

  const persona = getSelectedVoicePersona(accent);
  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.lang = accent;

  // Calibrate human pitch & rate according to persona and global speed multiplier
  const effectiveRate = (options?.rate ?? persona.rate) * audioSpeedMultiplier;
  const effectivePitch = options?.pitch ?? persona.pitch;

  utterance.rate = Math.max(0.7, Math.min(1.4, effectiveRate));
  utterance.pitch = Math.max(0.65, Math.min(1.4, effectivePitch));

  const physicalVoice = findPhysicalVoiceForPersona(persona);
  if (physicalVoice) {
    utterance.voice = physicalVoice;
  }

  utterance.onstart = () => {
    currentActiveId = elementId;
    currentActiveAccent = accent;
    notifyListeners();
    options?.onStart?.();
  };

  utterance.onend = () => {
    if (currentActiveId === elementId && currentActiveAccent === accent) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    if (currentActiveId === elementId && currentActiveAccent === accent) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text in French (for bilingual translations, explanations, and phonetics)
 * Uses the user's selected French Voice Persona (5 Female / 5 Male, Normal & Grave)
 */
export function speakFrenchText(
  text: string,
  elementId: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onStart?.();
    setTimeout(() => options?.onEnd?.(), 1500);
    return;
  }

  if (currentActiveId === elementId && currentActiveAccent === null) {
    stopSpeech();
    return;
  }

  window.speechSynthesis.cancel();

  const cleanText = sanitizeTextForSpeech(text, 'fr-FR');
  if (!cleanText) return;

  const persona = getSelectedVoicePersona('fr-FR');
  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.lang = 'fr-FR';

  const effectiveRate = (options?.rate ?? persona.rate) * audioSpeedMultiplier;
  const effectivePitch = options?.pitch ?? persona.pitch;

  utterance.rate = Math.max(0.7, Math.min(1.4, effectiveRate));
  utterance.pitch = Math.max(0.65, Math.min(1.4, effectivePitch));

  const physicalVoice = findPhysicalVoiceForPersona(persona);
  if (physicalVoice) {
    utterance.voice = physicalVoice;
  }

  utterance.onstart = () => {
    currentActiveId = elementId;
    currentActiveAccent = null;
    notifyListeners();
    options?.onStart?.();
  };

  utterance.onend = () => {
    if (currentActiveId === elementId) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onEnd?.();
  };

  utterance.onerror = () => {
    if (currentActiveId === elementId) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Preview any persona with its curated benchmark sample sentence
 */
export function previewVoicePersona(personaId: string, onEnd?: () => void): void {
  const persona = VOICE_PERSONAS.find((p) => p.id === personaId);
  if (!persona) return;

  if (persona.language === 'fr-FR') {
    speakFrenchText(persona.sampleSentence, `preview-${personaId}`, {
      pitch: persona.pitch,
      rate: persona.rate,
      onEnd
    });
  } else {
    speakText(persona.sampleSentence, persona.language as AccentType, `preview-${personaId}`, {
      pitch: persona.pitch,
      rate: persona.rate,
      onEnd
    });
  }
}

// ============================================================================
// FLASHCARDS AUTO-PLAY LOGIC ('AUTO-PLAY AUDIO')
// ============================================================================

/**
 * Returns the next alternating accent (toggles between en-GB and en-US)
 */
export function getNextAlternatingAccent(): AccentType {
  const next: AccentType = lastAutoPlayAccent === 'en-GB' ? 'en-US' : 'en-GB';
  lastAutoPlayAccent = next;
  try {
    localStorage.setItem(LEGACY_PREF_LAST_AUTOPLAY_ACCENT_KEY, next);
  } catch {}
  return next;
}

export function peekNextAlternatingAccent(): AccentType {
  return lastAutoPlayAccent === 'en-GB' ? 'en-US' : 'en-GB';
}

/**
 * Triggers automatic playback on card flip ('Auto-play Audio')
 * Plays immediately as soon as the card flips to verso, optimizing auditory immersion!
 */
export function triggerFlipAutoPlay(
  text: string,
  elementId: string,
  options?: {
    frenchTranslation?: string;
    delayMs?: number;
  }
): void {
  if (!autoPlayOnFlip) return;
  const delay = options?.delayMs ?? 100;

  setTimeout(() => {
    if (autoPlayAccentPreference === 'both') {
      // Play British English first, then smoothly transition to American English
      speakText(text, 'en-GB', `${elementId}-uk`, {
        onEnd: () => {
          setTimeout(() => {
            speakText(text, 'en-US', `${elementId}-us`, {
              onEnd: () => {
                if (autoPlayIncludeFrench && options?.frenchTranslation) {
                  setTimeout(() => {
                    speakFrenchText(options.frenchTranslation!, `${elementId}-fr`);
                  }, 250);
                }
              }
            });
          }, 320);
        }
      });
    } else if (autoPlayAccentPreference === 'alternating') {
      const nextAccent = getNextAlternatingAccent();
      speakText(text, nextAccent, elementId, {
        onEnd: () => {
          if (autoPlayIncludeFrench && options?.frenchTranslation) {
            setTimeout(() => {
              speakFrenchText(options.frenchTranslation!, `${elementId}-fr`);
            }, 250);
          }
        }
      });
    } else {
      const targetAccent = autoPlayAccentPreference === 'en-US' ? 'en-US' : 'en-GB';
      speakText(text, targetAccent, elementId, {
        onEnd: () => {
          if (autoPlayIncludeFrench && options?.frenchTranslation) {
            setTimeout(() => {
              speakFrenchText(options.frenchTranslation!, `${elementId}-fr`);
            }, 250);
          }
        }
      });
    }
  }, delay);
}

/**
 * Triggers automatic alternating playback when moving cards (if display autoplay is on)
 */
export function triggerAutoPlayIfEnabled(
  text: string,
  elementId: string,
  delayMs: number = 350
): AccentType | null {
  if (!autoPlayOnDisplay) return null;
  const nextAccent = getNextAlternatingAccent();
  setTimeout(() => {
    speakText(text, nextAccent, elementId);
  }, delayMs);
  return nextAccent;
}

// ============================================================================
// LEGACY COMPATIBILITY HELPERS
// ============================================================================
export function getAvailableUsVoices(): SpeechSynthesisVoice[] {
  const voices = loadVoices();
  return voices.filter(
    (v) =>
      v.lang.toLowerCase() === 'en-us' ||
      v.lang.toLowerCase() === 'en_us' ||
      (v.lang.toLowerCase().startsWith('en') &&
        (v.name.toLowerCase().includes('united states') ||
          v.name.toLowerCase().includes('us') ||
          v.name.toLowerCase().includes('american')))
  );
}

export function getBestUsVoice(): SpeechSynthesisVoice | null {
  const persona = getSelectedVoicePersona('en-US');
  return findPhysicalVoiceForPersona(persona);
}

export function getBestUkVoice(): SpeechSynthesisVoice | null {
  const persona = getSelectedVoicePersona('en-GB');
  return findPhysicalVoiceForPersona(persona);
}

export function getBestVoice(accent: AccentType): SpeechSynthesisVoice | null {
  return accent === 'en-US' ? getBestUsVoice() : getBestUkVoice();
}

export function getPreferredUsVoiceGender(): VoiceGender {
  const persona = getSelectedVoicePersona('en-US');
  return persona.gender;
}

export function setPreferredUsVoiceGender(gender: VoiceGender): void {
  const match = VOICE_PERSONAS.find(
    (p) => p.language === 'en-US' && (gender === 'auto' ? true : p.gender === gender)
  );
  if (match) {
    setSelectedVoicePersona('en-US', match.id);
  }
}

export function getCustomUsVoiceURI(): string | null {
  return null;
}

export function setCustomUsVoiceURI(_uri: string | null): void {
  // no-op legacy bridge
}
