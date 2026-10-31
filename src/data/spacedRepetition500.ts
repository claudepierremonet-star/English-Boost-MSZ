// src/data/spacedRepetition500.ts
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

export const SPACED_REPETITION_500: SpacedRepetitionCard[] = [
  {
    "id": "card-6e-01-timetable",
    "term": "Timetable",
    "phonetic": "/ˈtaɪmˌteɪ.bəl/",
    "level": "A1",
    "category": "Routines scolaires",
    "frenchDef": "Emploi du temps fixant les heures de cours et matières.",
    "englishDef": "A schedule showing the times of planned lessons and activities.",
    "etymology": "Du vieil anglais 'tīma' (temps) et du latin 'tabula' (registre, tableau).",
    "pressExcerpt": "Pupils check their timetable before packing their schoolbag each morning.",
    "pressSource": "BBC Bitesize",
    "collocations": [
      "school timetable",
      "check the timetable",
      "weekly timetable"
    ],
    "nuanceComparisons": [
      {
        "word": "Timetable",
        "distinction": "Planning horaire des cours ou trains."
      },
      {
        "word": "Schedule",
        "distinction": "Calendrier d’activités plus général."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-02-alarm-clock",
    "term": "Alarm clock",
    "phonetic": "/əˈlɑːm klɒk/",
    "level": "A1",
    "category": "Matin & Réveil",
    "frenchDef": "Réveil-matin programmable.",
    "englishDef": "A clock designed to sound an alert at a set hour.",
    "etymology": "De l’italien 'all’arme' (aux armes !) et du moyen néerlandais 'clocke'.",
    "pressExcerpt": "His alarm clock rings at seven every morning.",
    "pressSource": "Oxford Junior",
    "collocations": [
      "set the alarm clock",
      "alarm clock rings",
      "digital alarm clock"
    ],
    "nuanceComparisons": [
      {
        "word": "Alarm clock",
        "distinction": "Horloge sonnante du matin."
      },
      {
        "word": "Timer",
        "distinction": "Minuteur de précision."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-03-backpack",
    "term": "Backpack",
    "phonetic": "/ˈbæk.pæk/",
    "level": "A1",
    "category": "Fournitures scolaires",
    "frenchDef": "Sac à dos scolaire pour livres et cahiers.",
    "englishDef": "A bag with straps carried on the back by students.",
    "etymology": "Anglais moderne combinant 'back' (dos) et 'pack' (paquet).",
    "pressExcerpt": "She placed her English workbook inside her sturdy backpack.",
    "pressSource": "British Council",
    "collocations": [
      "school backpack",
      "pack a backpack",
      "heavy backpack"
    ],
    "nuanceComparisons": [
      {
        "word": "Backpack",
        "distinction": "Sac à deux bretelles."
      },
      {
        "word": "Satchel",
        "distinction": "Cartable classique à rabat."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-04-toothbrush",
    "term": "Toothbrush",
    "phonetic": "/ˈtuːθ.brʌʃ/",
    "level": "A1",
    "category": "Hygiène",
    "frenchDef": "Brosse à dents manuelle ou électrique.",
    "englishDef": "A small brush used for cleaning teeth with toothpaste.",
    "etymology": "Du vieil anglais 'tōth' (dent) et du français 'brosse'.",
    "pressExcerpt": "Brushing with a soft toothbrush protects teeth against cavities.",
    "pressSource": "NHS Kids",
    "collocations": [
      "soft toothbrush",
      "electric toothbrush",
      "use a toothbrush"
    ],
    "nuanceComparisons": [
      {
        "word": "Toothbrush",
        "distinction": "Brosse réservée aux dents."
      },
      {
        "word": "Hairbrush",
        "distinction": "Brosse à cheveux."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-05-shower",
    "term": "Shower",
    "phonetic": "/ˈʃaʊ.ər/",
    "level": "A1",
    "category": "Toilette",
    "frenchDef": "Douche matinale revigorante.",
    "englishDef": "A bath in which water is sprayed from overhead.",
    "etymology": "Du vieil anglais 'scūr' (ondée brève de pluie).",
    "pressExcerpt": "A warm shower in the morning helps wake up the body.",
    "pressSource": "The Guardian",
    "collocations": [
      "take a shower",
      "morning shower",
      "hot shower"
    ],
    "nuanceComparisons": [
      {
        "word": "Shower",
        "distinction": "Jet d'eau continu."
      },
      {
        "word": "Bath",
        "distinction": "Bain d'eau stagnante en baignoire."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-06-bedroom",
    "term": "Bedroom",
    "phonetic": "/ˈbɛd.ruːm/",
    "level": "A1",
    "category": "Maison",
    "frenchDef": "Chambre à coucher personnelle.",
    "englishDef": "A room used primarily for sleeping and quiet rest.",
    "etymology": "Du vieil anglais 'bedd' (couche) et 'rūm' (espace).",
    "pressExcerpt": "Her bedroom is quiet and ideal for memorizing English words.",
    "pressSource": "Cambridge Stories",
    "collocations": [
      "tidy the bedroom",
      "cozy bedroom",
      "my own bedroom"
    ],
    "nuanceComparisons": [
      {
        "word": "Bedroom",
        "distinction": "Chambre individuelle."
      },
      {
        "word": "Living room",
        "distinction": "Salon partagé en famille."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-07-homework",
    "term": "Homework",
    "phonetic": "/ˈhəʊm.wɜːk/",
    "level": "A1",
    "category": "Étude personnelle",
    "frenchDef": "Devoirs scolaires à faire à domicile.",
    "englishDef": "Schoolwork assigned by a teacher to be completed at home.",
    "etymology": "Composé de 'home' (domicile) et 'work' (travail).",
    "pressExcerpt": "Pupils complete their homework before enjoying leisure time.",
    "pressSource": "BBC Education",
    "collocations": [
      "do homework",
      "finish homework",
      "hand in homework"
    ],
    "nuanceComparisons": [
      {
        "word": "Homework",
        "distinction": "Devoirs scolaires (indénombrable)."
      },
      {
        "word": "Assignment",
        "distinction": "Devoir noté individuel."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-08-wardrobe",
    "term": "Wardrobe",
    "phonetic": "/ˈwɔː.drəʊb/",
    "level": "A1",
    "category": "Mobilier",
    "frenchDef": "Armoire penderie pour suspendre ses vêtements.",
    "englishDef": "A tall cupboard or cabinet in which clothes are hung.",
    "etymology": "Du normand ancien 'warderobe' (garder les vêtements précieux).",
    "pressExcerpt": "He hung his school blazer neatly inside the wardrobe.",
    "pressSource": "Oxford Press",
    "collocations": [
      "wooden wardrobe",
      "open the wardrobe",
      "neat wardrobe"
    ],
    "nuanceComparisons": [
      {
        "word": "Wardrobe",
        "distinction": "Penderie à vêtements."
      },
      {
        "word": "Cupboard",
        "distinction": "Placard de rangement général."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-6e-09-passport",
    "term": "Passport",
    "phonetic": "/ˈpɑːs.pɔːt/",
    "level": "A1",
    "category": "Frontières",
    "frenchDef": "Passeport officiel d'identité.",
    "englishDef": "An official document certifying identity for international travel.",
    "etymology": "Du français 'passeport' (permission de franchir le port).",
    "pressExcerpt": "Ensure your passport is stamped at border control.",
    "pressSource": "National Geographic Kids",
    "collocations": [
      "valid passport",
      "show your passport",
      "passport control"
    ],
    "nuanceComparisons": [
      {
        "word": "Passport",
        "distinction": "Livret officiel d'identité."
      },
      {
        "word": "Visa",
        "distinction": "Autorisation de séjour."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-10-suitcase",
    "term": "Suitcase",
    "phonetic": "/ˈsuːt.keɪs/",
    "level": "A1",
    "category": "Bagages",
    "frenchDef": "Valise rectangulaire de voyage.",
    "englishDef": "A portable rectangular case for clothes.",
    "etymology": "De 'suit' (costume) et 'case' (boîte, du latin capsa).",
    "pressExcerpt": "She rolled her blue suitcase through the airport terminal.",
    "pressSource": "British Council Travel",
    "collocations": [
      "pack a suitcase",
      "heavy suitcase",
      "rolling suitcase"
    ],
    "nuanceComparisons": [
      {
        "word": "Suitcase",
        "distinction": "Valise individuelle."
      },
      {
        "word": "Luggage",
        "distinction": "Totalité des bagages."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-11-ticket",
    "term": "Ticket",
    "phonetic": "/ˈtɪk.ɪt/",
    "level": "A1",
    "category": "Transports",
    "frenchDef": "Billet d'accès au train ou bus.",
    "englishDef": "A slip of paper giving the right to travel.",
    "etymology": "Du vieux français 'estiquette' (écriteau collé).",
    "pressExcerpt": "The ticket inspector validated our train ticket.",
    "pressSource": "Network Rail",
    "collocations": [
      "train ticket",
      "return ticket",
      "buy a ticket"
    ],
    "nuanceComparisons": [
      {
        "word": "Ticket",
        "distinction": "Billet d'accès ponctuel."
      },
      {
        "word": "Pass",
        "distinction": "Carte d'abonnement."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-12-platform",
    "term": "Platform",
    "phonetic": "/ˈplæt.fɔːm/",
    "level": "A1",
    "category": "Gares",
    "frenchDef": "Quai d'embarquement ferroviaire.",
    "englishDef": "A raised walkway beside a railway track.",
    "etymology": "Du moyen français 'plate-forme' (surface surélevée).",
    "pressExcerpt": "The express train to London departs from platform four.",
    "pressSource": "The Times",
    "collocations": [
      "railway platform",
      "arrive at the platform",
      "wait on the platform"
    ],
    "nuanceComparisons": [
      {
        "word": "Platform",
        "distinction": "Quai pour voyageurs."
      },
      {
        "word": "Track",
        "distinction": "Voie ferrée métallique."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-13-airport",
    "term": "Airport",
    "phonetic": "/ˈeə.pɔːt/",
    "level": "A1",
    "category": "Aviation",
    "frenchDef": "Aéroport pour passagers et avions.",
    "englishDef": "A complex with runways and terminals for aircraft.",
    "etymology": "Du grec 'aer' (air) et du latin 'portus' (port).",
    "pressExcerpt": "Heathrow Airport operates flights to every continent.",
    "pressSource": "BBC Travel",
    "collocations": [
      "international airport",
      "airport terminal",
      "arrive at the airport"
    ],
    "nuanceComparisons": [
      {
        "word": "Airport",
        "distinction": "Grand aéroport commercial."
      },
      {
        "word": "Airfield",
        "distinction": "Piste d'aérodrome locale."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-14-journey",
    "term": "Journey",
    "phonetic": "/ˈdʒɜː.ni/",
    "level": "A1",
    "category": "Itinéraires",
    "frenchDef": "Voyage, périple d'un point à un autre.",
    "englishDef": "An act of traveling from one destination to another.",
    "etymology": "De l'ancien français 'journée' (trajet accompli en un jour).",
    "pressExcerpt": "Their journey through the Scottish Highlands was picturesque.",
    "pressSource": "National Geographic",
    "collocations": [
      "safe journey",
      "long journey",
      "pleasant journey"
    ],
    "nuanceComparisons": [
      {
        "word": "Journey",
        "distinction": "Le trajet lui-même."
      },
      {
        "word": "Trip",
        "distinction": "L'excursion globale."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-15-compass",
    "term": "Compass",
    "phonetic": "/ˈkʌm.pəs/",
    "level": "A1",
    "category": "Navigation",
    "frenchDef": "Boussole magnétique indiquant le nord.",
    "englishDef": "An instrument with a needle pointing north.",
    "etymology": "Du latin 'compassare' (mesurer avec régularité).",
    "pressExcerpt": "The hiker used a compass and map to navigate the forest trail.",
    "pressSource": "Royal Geographical Society",
    "collocations": [
      "magnetic compass",
      "follow the compass",
      "use a compass"
    ],
    "nuanceComparisons": [
      {
        "word": "Compass",
        "distinction": "Boussole de direction."
      },
      {
        "word": "Pair of compasses",
        "distinction": "Compas de géométrie."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-6e-16-castle",
    "term": "Castle",
    "phonetic": "/ˈkɑː.səl/",
    "level": "A1",
    "category": "Monuments médiévaux",
    "frenchDef": "Château fort fortifié en pierre.",
    "englishDef": "A large medieval fortress with walls and towers.",
    "etymology": "Du latin 'castellum' (petite forteresse).",
    "pressExcerpt": "Windsor Castle is an iconic royal residence in England.",
    "pressSource": "English Heritage",
    "collocations": [
      "medieval castle",
      "visit a castle",
      "stone castle"
    ],
    "nuanceComparisons": [
      {
        "word": "Castle",
        "distinction": "Château défensif fortifié."
      },
      {
        "word": "Palace",
        "distinction": "Palais royal d'apparat."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-17-knight",
    "term": "Knight",
    "phonetic": "/naɪt/",
    "level": "A1",
    "category": "Chevalerie",
    "frenchDef": "Chevalier en armure servant son seigneur.",
    "englishDef": "A nobleman serving as a warrior on horseback.",
    "etymology": "Du vieil anglais 'cniht' (jeune serviteur d'honneur).",
    "pressExcerpt": "The brave knight defended the village with his gleaming shield.",
    "pressSource": "British Museum",
    "collocations": [
      "brave knight",
      "knight in armor",
      "dubbed a knight"
    ],
    "nuanceComparisons": [
      {
        "word": "Knight",
        "distinction": "Chevalier noble en armure."
      },
      {
        "word": "Soldier",
        "distinction": "Soldat de troupe régulière."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-18-crown",
    "term": "Crown",
    "phonetic": "/kraʊn/",
    "level": "A1",
    "category": "Monarchie",
    "frenchDef": "Couronne royale ornée de pierres précieuses.",
    "englishDef": "An ornamental headdress worn by a sovereign.",
    "etymology": "Du latin 'corona' (couronne de laurier ou d'or).",
    "pressExcerpt": "The golden crown sparkled under the museum lights.",
    "pressSource": "Historic Royal Palaces",
    "collocations": [
      "royal crown",
      "golden crown",
      "wear a crown"
    ],
    "nuanceComparisons": [
      {
        "word": "Crown",
        "distinction": "Couronne royale d'apparat."
      },
      {
        "word": "Diadem",
        "distinction": "Diadème princier plus fin."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-19-museum",
    "term": "Museum",
    "phonetic": "/mjuːˈziː.əm/",
    "level": "A1",
    "category": "Conservation",
    "frenchDef": "Musée abritant œuvres d'art et vestiges.",
    "englishDef": "A building displaying historical artifacts.",
    "etymology": "Du grec 'mouseion' (temple des Muses inspiratrices).",
    "pressExcerpt": "Admission to national museums is free across Great Britain.",
    "pressSource": "The Guardian",
    "collocations": [
      "visit a museum",
      "history museum",
      "museum guide"
    ],
    "nuanceComparisons": [
      {
        "word": "Museum",
        "distinction": "Lieu public d'exposition culturelle."
      },
      {
        "word": "Gallery",
        "distinction": "Galerie d'art pictural."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-20-sword",
    "term": "Sword",
    "phonetic": "/sɔːd/",
    "level": "A1",
    "category": "Armes d'époque",
    "frenchDef": "Épée à lame tranchante d'acier.",
    "englishDef": "A weapon with a long steel blade.",
    "etymology": "Du vieil anglais 'sweord' (arme coupante).",
    "pressExcerpt": "Legend says King Arthur pulled the sword from the stone.",
    "pressSource": "Folklore Society",
    "collocations": [
      "sharp sword",
      "draw a sword",
      "iron sword"
    ],
    "nuanceComparisons": [
      {
        "word": "Sword",
        "distinction": "Épée à lame longue."
      },
      {
        "word": "Dagger",
        "distinction": "Poignard court."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-21-ancient",
    "term": "Ancient",
    "phonetic": "/ˈeɪn.ʃənt/",
    "level": "A1",
    "category": "Époques lointaines",
    "frenchDef": "Antique, d'un temps très lointain de l'histoire.",
    "englishDef": "Belonging to the very distant historical past.",
    "etymology": "Du latin 'anteanus' (ce qui était avant).",
    "pressExcerpt": "Stonehenge is an ancient monument surrounded by green plains.",
    "pressSource": "BBC History",
    "collocations": [
      "ancient ruins",
      "ancient history",
      "ancient monument"
    ],
    "nuanceComparisons": [
      {
        "word": "Ancient",
        "distinction": "Antique, vieux de millénaires."
      },
      {
        "word": "Antique",
        "distinction": "Objet d'époque de collection."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-22-tapestry",
    "term": "Tapestry",
    "phonetic": "/ˈtæp.ɪ.stri/",
    "level": "A1",
    "category": "Artisanat d'art",
    "frenchDef": "Tapisserie brodée narrant de grands récits.",
    "englishDef": "A woven fabric with narrative pictures.",
    "etymology": "Du vieux français 'tapisserie' (tenture murale).",
    "pressExcerpt": "The Bayeux Tapestry narrates the Norman conquest of England.",
    "pressSource": "BBC Culture",
    "collocations": [
      "woven tapestry",
      "historic tapestry",
      "admire a tapestry"
    ],
    "nuanceComparisons": [
      {
        "word": "Tapestry",
        "distinction": "Tapisserie murale tissée."
      },
      {
        "word": "Carpet",
        "distinction": "Tapis recouvrant le sol."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-6e-23-drawing",
    "term": "Drawing",
    "phonetic": "/ˈdrɔː.ɪŋ/",
    "level": "A1",
    "category": "Arts graphiques",
    "frenchDef": "Dessin réalisé au crayon ou fusain.",
    "englishDef": "A picture made with a pencil or crayon.",
    "etymology": "Du verbe anglais 'draw' (tracer une ligne).",
    "pressExcerpt": "She filled her sketchbook with delicate pencil drawings.",
    "pressSource": "Tate Kids",
    "collocations": [
      "pencil drawing",
      "practice drawing",
      "color a drawing"
    ],
    "nuanceComparisons": [
      {
        "word": "Drawing",
        "distinction": "Dessin au trait."
      },
      {
        "word": "Painting",
        "distinction": "Peinture aux pinceaux."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-24-board-game",
    "term": "Board game",
    "phonetic": "/bɔːd ɡeɪm/",
    "level": "A1",
    "category": "Jeux de société",
    "frenchDef": "Jeu de société sur plateau cartonné.",
    "englishDef": "A game played with counters on a printed board.",
    "etymology": "De 'board' (planche de bois) et 'game' (jeu).",
    "pressExcerpt": "Playing a board game with friends develops strategic thinking.",
    "pressSource": "Good Housekeeping",
    "collocations": [
      "play a board game",
      "classic board game",
      "fun board game"
    ],
    "nuanceComparisons": [
      {
        "word": "Board game",
        "distinction": "Jeu de plateau."
      },
      {
        "word": "Card game",
        "distinction": "Jeu de cartes."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-25-puzzle",
    "term": "Puzzle",
    "phonetic": "/ˈpʌz.əl/",
    "level": "A1",
    "category": "Casse-tête",
    "frenchDef": "Puzzle de pièces à assembler.",
    "englishDef": "A problem or jigsaw designed to test ingenuity.",
    "etymology": "Origine anglaise du XVIe siècle exprimant la perplexité.",
    "pressExcerpt": "They pieced together a five-hundred piece jigsaw puzzle.",
    "pressSource": "Mind Games UK",
    "collocations": [
      "solve a puzzle",
      "jigsaw puzzle",
      "piece together a puzzle"
    ],
    "nuanceComparisons": [
      {
        "word": "Puzzle",
        "distinction": "Casse-tête de pièces à assembler."
      },
      {
        "word": "Riddle",
        "distinction": "Devinette orale."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-26-origami",
    "term": "Origami",
    "phonetic": "/ˌɒr.ɪˈɡɑː.mi/",
    "level": "A1",
    "category": "Pliages",
    "frenchDef": "Art japonais du pliage de papier.",
    "englishDef": "The Japanese craft of folding paper into shapes.",
    "etymology": "Du japonais 'ori' (plier) et 'kami' (papier).",
    "pressExcerpt": "She folded a vibrant square of paper into an origami swan.",
    "pressSource": "Art In Action",
    "collocations": [
      "origami paper",
      "fold origami",
      "origami crane"
    ],
    "nuanceComparisons": [
      {
        "word": "Origami",
        "distinction": "Art du pliage géométrique."
      },
      {
        "word": "Crafting",
        "distinction": "Bricolage manuel général."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-27-comic",
    "term": "Comic",
    "phonetic": "/ˈkɒm.ɪk/",
    "level": "A1",
    "category": "Bande dessinée",
    "frenchDef": "Bande dessinée illustrée avec bulles.",
    "englishDef": "A magazine or book containing comic strips.",
    "etymology": "Du grec 'kōmikos' (relatif à la comédie réjouissante).",
    "pressExcerpt": "Reading adventure comics expands pupils' imaginative vocabulary.",
    "pressSource": "Literacy Trust",
    "collocations": [
      "read a comic",
      "comic book",
      "superhero comic"
    ],
    "nuanceComparisons": [
      {
        "word": "Comic",
        "distinction": "Bande dessinée illustrée."
      },
      {
        "word": "Novel",
        "distinction": "Roman écrit sans images."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-28-crafting",
    "term": "Crafting",
    "phonetic": "/ˈkrɑːf.tɪŋ/",
    "level": "A1",
    "category": "Bricolage",
    "frenchDef": "Bricolage créatif fait main.",
    "englishDef": "The activity of making decorative items by hand.",
    "etymology": "Du vieil anglais 'cræft' (habileté technique, art).",
    "pressExcerpt": "Crafting workshops teach pupils how to mold clay and design cards.",
    "pressSource": "Crafts Magazine",
    "collocations": [
      "paper crafting",
      "enjoy crafting",
      "crafting supplies"
    ],
    "nuanceComparisons": [
      {
        "word": "Crafting",
        "distinction": "Création manuelle récréative."
      },
      {
        "word": "Manufacture",
        "distinction": "Production industrielle."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-29-painting",
    "term": "Painting",
    "phonetic": "/ˈpeɪn.tɪŋ/",
    "level": "A1",
    "category": "Arts picturaux",
    "frenchDef": "Tableau peint à l'aquarelle ou à l'huile.",
    "englishDef": "A picture produced using paints and pigments.",
    "etymology": "Du verbe anglais 'paint', du français 'peindre'.",
    "pressExcerpt": "He used bright watercolors for his landscape painting.",
    "pressSource": "Tate Modern",
    "collocations": [
      "watercolor painting",
      "oil painting",
      "frame a painting"
    ],
    "nuanceComparisons": [
      {
        "word": "Painting",
        "distinction": "Peinture aux couleurs."
      },
      {
        "word": "Sketch",
        "distinction": "Croquis préparatoire."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-6e-30-running",
    "term": "Running",
    "phonetic": "/ˈrʌn.ɪŋ/",
    "level": "A1",
    "category": "Athlétisme",
    "frenchDef": "Course à pied d'endurance ou sprint.",
    "englishDef": "The action of moving rapidly on foot as exercise.",
    "etymology": "Du vieil anglais 'rinnan' (courir vite).",
    "pressExcerpt": "Regular morning running boosts energy and stamina.",
    "pressSource": "Athletics Weekly",
    "collocations": [
      "go running",
      "running shoes",
      "track running"
    ],
    "nuanceComparisons": [
      {
        "word": "Running",
        "distinction": "Course à pied sportive."
      },
      {
        "word": "Walking",
        "distinction": "Marche ordinaire."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-31-whistle",
    "term": "Whistle",
    "phonetic": "/ˈwɪs.əl/",
    "level": "A1",
    "category": "Arbitrage",
    "frenchDef": "Sifflet d'arbitre sonore.",
    "englishDef": "A small device blown to produce a clear high signal.",
    "etymology": "Du vieil anglais 'hwistlian' (faire un sifflement).",
    "pressExcerpt": "The referee blew his whistle to kick off the football match.",
    "pressSource": "Sports Youth UK",
    "collocations": [
      "blow the whistle",
      "referee's whistle",
      "loud whistle"
    ],
    "nuanceComparisons": [
      {
        "word": "Whistle",
        "distinction": "Sifflet mécanique."
      },
      {
        "word": "Buzzer",
        "distinction": "Sonnerie électronique."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-32-playground",
    "term": "Playground",
    "phonetic": "/ˈpleɪ.ɡraʊnd/",
    "level": "A1",
    "category": "Cour & Plein air",
    "frenchDef": "Terrain de jeux récréatifs.",
    "englishDef": "An outdoor area dedicated to games and sports.",
    "etymology": "De 'play' (jeu) et 'ground' (terrain).",
    "pressExcerpt": "Pupils dashed to the playground to play tag during break.",
    "pressSource": "Education Hub",
    "collocations": [
      "school playground",
      "playground games",
      "run on the playground"
    ],
    "nuanceComparisons": [
      {
        "word": "Playground",
        "distinction": "Cour de récréation."
      },
      {
        "word": "Stadium",
        "distinction": "Grand stade avec tribunes."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-33-swimming",
    "term": "Swimming",
    "phonetic": "/ˈswɪm.ɪŋ/",
    "level": "A1",
    "category": "Natation",
    "frenchDef": "Natation sportive ou de détente.",
    "englishDef": "The activity of moving through water using limbs.",
    "etymology": "Du vieil anglais 'swimman' (se mouvoir dans l'eau).",
    "pressExcerpt": "Swimming is an enjoyable full-body cardiovascular workout.",
    "pressSource": "Swim England",
    "collocations": [
      "go swimming",
      "swimming pool",
      "swimming lesson"
    ],
    "nuanceComparisons": [
      {
        "word": "Swimming",
        "distinction": "Action de nager."
      },
      {
        "word": "Diving",
        "distinction": "Plongeon acrobatique."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-34-sneakers",
    "term": "Sneakers",
    "phonetic": "/ˈsniː.kəz/",
    "level": "A1",
    "category": "Chaussures de sport",
    "frenchDef": "Baskets souples de sport.",
    "englishDef": "Casual sports shoes designed for athletic training.",
    "etymology": "De l'anglais 'sneak' (marcher sans bruit grâce à la gomme).",
    "pressExcerpt": "Tie your sneakers firmly before stepping onto the gym court.",
    "pressSource": "Runners World",
    "collocations": [
      "wear sneakers",
      "pair of sneakers",
      "clean sneakers"
    ],
    "nuanceComparisons": [
      {
        "word": "Sneakers",
        "distinction": "Baskets de sport."
      },
      {
        "word": "Boots",
        "distinction": "Bottes montantes."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-35-helmet",
    "term": "Helmet",
    "phonetic": "/ˈhɛl.mɪt/",
    "level": "A1",
    "category": "Protection sportive",
    "frenchDef": "Casque protecteur de cyclisme.",
    "englishDef": "A hard protective hat worn when riding a bicycle.",
    "etymology": "De l'ancien français 'helmet' (petit heaume).",
    "pressExcerpt": "A sturdy bicycle helmet protects the head against falls.",
    "pressSource": "Safety First UK",
    "collocations": [
      "wear a helmet",
      "bicycle helmet",
      "safety helmet"
    ],
    "nuanceComparisons": [
      {
        "word": "Helmet",
        "distinction": "Casque rigide antichoc."
      },
      {
        "word": "Cap",
        "distinction": "Casquette en tissu."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-36-bicycle",
    "term": "Bicycle",
    "phonetic": "/ˈbaɪ.sɪ.kəl/",
    "level": "A1",
    "category": "Cyclisme",
    "frenchDef": "Bicyclette propulsée par deux roues.",
    "englishDef": "A vehicle with two wheels steered with handlebars.",
    "etymology": "Du latin 'bi-' (deux) et du grec 'kyklos' (cercle).",
    "pressExcerpt": "Riding a bicycle to school reduces traffic and carbon emissions.",
    "pressSource": "Sustrans",
    "collocations": [
      "ride a bicycle",
      "pedal a bicycle",
      "bicycle bell"
    ],
    "nuanceComparisons": [
      {
        "word": "Bicycle",
        "distinction": "Deux-roues sans moteur."
      },
      {
        "word": "Scooter",
        "distinction": "Trottinette ou scooter motorisé."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-6e-37-guitar",
    "term": "Guitar",
    "phonetic": "/ɡɪˈtɑːr/",
    "level": "A1",
    "category": "Instruments à cordes",
    "frenchDef": "Guitare acoustique à six cordes.",
    "englishDef": "A musical instrument with six strings strummed by hand.",
    "etymology": "De l'espagnol 'guitarra', du grec 'kithara'.",
    "pressExcerpt": "She practiced playing acoustic guitar chords every evening.",
    "pressSource": "Music Hub",
    "collocations": [
      "play the guitar",
      "acoustic guitar",
      "guitar chords"
    ],
    "nuanceComparisons": [
      {
        "word": "Guitar",
        "distinction": "Guitare à frettes."
      },
      {
        "word": "Lute",
        "distinction": "Luth ancien à dos bombé."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-38-melody",
    "term": "Melody",
    "phonetic": "/ˈmɛl.ə.di/",
    "level": "A1",
    "category": "Solfège",
    "frenchDef": "Mélodie harmonieuse et entraînante.",
    "englishDef": "A sequence of single notes creating a distinct musical tune.",
    "etymology": "Du grec 'melōidia' (chant cadencé).",
    "pressExcerpt": "The gentle melody echoed through the quiet concert hall.",
    "pressSource": "Classic FM",
    "collocations": [
      "catchy melody",
      "sweet melody",
      "hum a melody"
    ],
    "nuanceComparisons": [
      {
        "word": "Melody",
        "distinction": "Ligne mélodique chantée."
      },
      {
        "word": "Harmony",
        "distinction": "Superposition d'accords."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-39-choir",
    "term": "Choir",
    "phonetic": "/kwaɪər/",
    "level": "A1",
    "category": "Chant choral",
    "frenchDef": "Chorale unissant des voix d'élèves.",
    "englishDef": "An organized ensemble of singers.",
    "etymology": "Du latin 'chorus', du grec 'khoros' (chœur de chant).",
    "pressExcerpt": "The school choir rehearsed carols for the winter assembly.",
    "pressSource": "BBC Music",
    "collocations": [
      "join a choir",
      "choir rehearsal",
      "school choir"
    ],
    "nuanceComparisons": [
      {
        "word": "Choir",
        "distinction": "Chœur de chanteurs."
      },
      {
        "word": "Orchestra",
        "distinction": "Ensemble d'instrumentistes."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-40-drums",
    "term": "Drums",
    "phonetic": "/drʌmz/",
    "level": "A1",
    "category": "Percussions",
    "frenchDef": "Batterie marquant le tempo rythmique.",
    "englishDef": "Percussion instruments played with sticks or hands.",
    "etymology": "Du moyen néerlandais 'tromme' (tambour).",
    "pressExcerpt": "The steady beat of the drums kept everyone moving to the music.",
    "pressSource": "Rhythm UK",
    "collocations": [
      "play the drums",
      "beat the drums",
      "drum solo"
    ],
    "nuanceComparisons": [
      {
        "word": "Drums",
        "distinction": "Batterie complète."
      },
      {
        "word": "Cymbals",
        "distinction": "Cymbales métalliques."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-41-festival",
    "term": "Festival",
    "phonetic": "/ˈfɛs.tɪ.vəl/",
    "level": "A1",
    "category": "Fêtes",
    "frenchDef": "Festival culturel réunissant concerts et scènes.",
    "englishDef": "A celebratory period featuring performances and art.",
    "etymology": "Du latin 'festivus' (relatif aux fêtes réjouissantes).",
    "pressExcerpt": "The summer music festival welcomed artists from across the world.",
    "pressSource": "Arts Council",
    "collocations": [
      "music festival",
      "annual festival",
      "celebrate a festival"
    ],
    "nuanceComparisons": [
      {
        "word": "Festival",
        "distinction": "Rassemblement festif sur plusieurs jours."
      },
      {
        "word": "Concert",
        "distinction": "Représentation unique."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-42-dancer",
    "term": "Dancer",
    "phonetic": "/ˈdɑːn.sər/",
    "level": "A1",
    "category": "Chorégraphie",
    "frenchDef": "Danseur exprimant l'émotion par le mouvement.",
    "englishDef": "A person who performs dance movements.",
    "etymology": "De l'ancien français 'danser' (mouvoir le corps en cadence).",
    "pressExcerpt": "The graceful dancer spun lightly on the polished stage floor.",
    "pressSource": "Royal Ballet",
    "collocations": [
      "ballet dancer",
      "graceful dancer",
      "talented dancer"
    ],
    "nuanceComparisons": [
      {
        "word": "Dancer",
        "distinction": "Artiste de la danse."
      },
      {
        "word": "Singer",
        "distinction": "Interprète vocal."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-43-concert",
    "term": "Concert",
    "phonetic": "/ˈkɒn.sət/",
    "level": "A1",
    "category": "Scène musicale",
    "frenchDef": "Concert musical public.",
    "englishDef": "A musical performance given before an audience.",
    "etymology": "De l'italien 'concerto' (accord harmonieux).",
    "pressExcerpt": "The orchestra received a standing ovation at the end of the concert.",
    "pressSource": "The Times",
    "collocations": [
      "live concert",
      "attend a concert",
      "symphony concert"
    ],
    "nuanceComparisons": [
      {
        "word": "Concert",
        "distinction": "Spectacle musical en salle."
      },
      {
        "word": "Audition",
        "distinction": "Épreuve de sélection."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-6e-44-napkin",
    "term": "Napkin",
    "phonetic": "/ˈnæp.kɪn/",
    "level": "A1",
    "category": "Art de la table",
    "frenchDef": "Serviette de table en tissu.",
    "englishDef": "A piece of cloth used at meals to wipe lips and fingers.",
    "etymology": "De l'ancien français 'nappe' avec diminutif '-kin'.",
    "pressExcerpt": "Place your cloth napkin on your lap before starting lunch.",
    "pressSource": "Etiquette Guide",
    "collocations": [
      "cloth napkin",
      "fold a napkin",
      "paper napkin"
    ],
    "nuanceComparisons": [
      {
        "word": "Napkin",
        "distinction": "Serviette individuelle."
      },
      {
        "word": "Tablecloth",
        "distinction": "Nappe recouvrant la table."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-45-menu",
    "term": "Menu",
    "phonetic": "/ˈmɛn.juː/",
    "level": "A1",
    "category": "Restauration",
    "frenchDef": "Carte détaillée des mets et boissons.",
    "englishDef": "A printed list of foods and beverages available.",
    "etymology": "Du français 'menu' (détail ordonné des mets servis).",
    "pressExcerpt": "The waiter presented a menu featuring seasonal dishes.",
    "pressSource": "Good Food Guide",
    "collocations": [
      "read the menu",
      "dessert menu",
      "on the menu"
    ],
    "nuanceComparisons": [
      {
        "word": "Menu",
        "distinction": "Carte des mets."
      },
      {
        "word": "Bill",
        "distinction": "Note ou addition à régler."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-46-waiter",
    "term": "Waiter",
    "phonetic": "/ˈweɪ.tər/",
    "level": "A1",
    "category": "Service en salle",
    "frenchDef": "Serveur accueillant les convives.",
    "englishDef": "A person who serves meals to customers at tables.",
    "etymology": "Du verbe anglais 'wait' (attendre les souhaits des hôtes).",
    "pressExcerpt": "The attentive waiter recommended the roasted butternut squash soup.",
    "pressSource": "Hospitality UK",
    "collocations": [
      "polite waiter",
      "call the waiter",
      "tip the waiter"
    ],
    "nuanceComparisons": [
      {
        "word": "Waiter",
        "distinction": "Serveur en salle."
      },
      {
        "word": "Chef",
        "distinction": "Cuisinier aux fourneaux."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-47-dish",
    "term": "Dish",
    "phonetic": "/dɪʃ/",
    "level": "A1",
    "category": "Plats cuisinés",
    "frenchDef": "Plat cuisiné préparé avec soin.",
    "englishDef": "A specific food prepared and served as a meal course.",
    "etymology": "Du latin 'discus' (plat rond ou assiette).",
    "pressExcerpt": "She ordered a fragrant pasta dish garnished with fresh basil.",
    "pressSource": "BBC Food",
    "collocations": [
      "delicious dish",
      "main dish",
      "traditional dish"
    ],
    "nuanceComparisons": [
      {
        "word": "Dish",
        "distinction": "Préparation culinaire."
      },
      {
        "word": "Plate",
        "distinction": "Assiette physique."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-48-dessert",
    "term": "Dessert",
    "phonetic": "/dɪˈzɜːt/",
    "level": "A1",
    "category": "Gourmandises",
    "frenchDef": "Dessert sucré clôturant le repas.",
    "englishDef": "The sweet course served at the end of dining.",
    "etymology": "Du français 'desservir' (ce que l'on sert après avoir débarrassé la table).",
    "pressExcerpt": "Warm berry pie with vanilla ice cream is a favorite dessert.",
    "pressSource": "Country Living",
    "collocations": [
      "order dessert",
      "sweet dessert",
      "dessert menu"
    ],
    "nuanceComparisons": [
      {
        "word": "Dessert",
        "distinction": "Plat sucré final."
      },
      {
        "word": "Starter",
        "distinction": "Entrée salée."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-49-celebration",
    "term": "Celebration",
    "phonetic": "/ˌsɛl.ɪˈbreɪ.ʃən/",
    "level": "A1",
    "category": "Fêtes",
    "frenchDef": "Célébration festive en famille.",
    "englishDef": "A social gathering celebrating an achievement or birthday.",
    "etymology": "Du latin 'celebrare' (solenniser nombreux).",
    "pressExcerpt": "The dinner was a joyful celebration of their school achievements.",
    "pressSource": "The Telegraph",
    "collocations": [
      "family celebration",
      "birthday celebration",
      "in celebration of"
    ],
    "nuanceComparisons": [
      {
        "word": "Celebration",
        "distinction": "Fête en l'honneur d'un événement."
      },
      {
        "word": "Party",
        "distinction": "Soirée récréative."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-50-toast",
    "term": "Toast",
    "phonetic": "/təʊst/",
    "level": "A1",
    "category": "Trinquage",
    "frenchDef": "Porter un toast à la santé des convives.",
    "englishDef": "The act of raising a glass to salute someone.",
    "etymology": "De la coutume anglaise d'immerger un toast de pain grillé dans le vin.",
    "pressExcerpt": "They raised their sparkling glasses to propose a toast to friendship.",
    "pressSource": "British Etiquette",
    "collocations": [
      "propose a toast",
      "drink a toast",
      "raise a toast"
    ],
    "nuanceComparisons": [
      {
        "word": "Toast",
        "distinction": "Lever son verre en hommage."
      },
      {
        "word": "Salute",
        "distinction": "Salutation militaire formelle."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-6e-51-breakfast",
    "term": "Breakfast",
    "phonetic": "/ˈbrɛk.fəst/",
    "level": "A1",
    "category": "Nutrition du matin",
    "frenchDef": "Premier repas rompant le jeûne de la nuit.",
    "englishDef": "The morning meal that breaks overnight fasting.",
    "etymology": "De 'break' (rompre) et 'fast' (le jeûne nocturne).",
    "pressExcerpt": "Eating a balanced breakfast supplies sustained energy for classes.",
    "pressSource": "NHS Live Well",
    "collocations": [
      "healthy breakfast",
      "eat breakfast",
      "cooked breakfast"
    ],
    "nuanceComparisons": [
      {
        "word": "Breakfast",
        "distinction": "Repas matinal."
      },
      {
        "word": "Lunch",
        "distinction": "Déjeuner du midi."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-52-apple",
    "term": "Apple",
    "phonetic": "/ˈæp.əl/",
    "level": "A1",
    "category": "Fruits",
    "frenchDef": "Pomme croquante pleine de vitamines.",
    "englishDef": "A round fruit with crisp flesh and red or green skin.",
    "etymology": "Du vieil anglais 'æppel' (fruit nourricier).",
    "pressExcerpt": "Crisp red apples make a wholesome afternoon snack for pupils.",
    "pressSource": "Nutrition Facts",
    "collocations": [
      "crisp apple",
      "eat an apple",
      "red apple"
    ],
    "nuanceComparisons": [
      {
        "word": "Apple",
        "distinction": "Pomme croquante."
      },
      {
        "word": "Peach",
        "distinction": "Pêche à chair douce veloutée."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-53-salad",
    "term": "Salad",
    "phonetic": "/ˈsæl.əd/",
    "level": "A1",
    "category": "Légumes",
    "frenchDef": "Salade verte composée de crudités.",
    "englishDef": "A dish of raw mixed greens and crisp vegetables.",
    "etymology": "Du latin 'salata' (légumes assaisonnés de sel).",
    "pressExcerpt": "Fresh cucumbers and cherry tomatoes brightened the salad bowl.",
    "pressSource": "BBC Good Food",
    "collocations": [
      "fresh salad",
      "green salad",
      "salad dressing"
    ],
    "nuanceComparisons": [
      {
        "word": "Salad",
        "distinction": "Mélange de crudités fraîches."
      },
      {
        "word": "Soup",
        "distinction": "Bouillon ou potage chaud."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-54-water",
    "term": "Water",
    "phonetic": "/ˈwɔː.tər/",
    "level": "A1",
    "category": "Hydratation",
    "frenchDef": "Eau pure vitale à la santé.",
    "englishDef": "Clear transparent liquid essential for all life.",
    "etymology": "Du vieil anglais 'wæter' (onde vitale pure).",
    "pressExcerpt": "Carrying a refillable water bottle helps maintain hydration.",
    "pressSource": "WHO Health",
    "collocations": [
      "drink water",
      "sparkling water",
      "glass of water"
    ],
    "nuanceComparisons": [
      {
        "word": "Water",
        "distinction": "Eau naturelle."
      },
      {
        "word": "Juice",
        "distinction": "Jus de fruits pressés."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-55-vitamins",
    "term": "Vitamins",
    "phonetic": "/ˈvɪt.ə.mɪnz/",
    "level": "A1",
    "category": "Micronutriments",
    "frenchDef": "Vitamines nécessaires à la vitalité.",
    "englishDef": "Organic compounds essential for optimal growth.",
    "etymology": "Du latin 'vita' (la vie) et 'amine'.",
    "pressExcerpt": "Citrus fruits provide a generous dose of protective vitamin C.",
    "pressSource": "Medical News",
    "collocations": [
      "essential vitamins",
      "rich in vitamins",
      "take vitamins"
    ],
    "nuanceComparisons": [
      {
        "word": "Vitamins",
        "distinction": "Molécules organiques vitales."
      },
      {
        "word": "Proteins",
        "distinction": "Protéines pour les muscles."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-56-fruit",
    "term": "Fruit",
    "phonetic": "/fruːt/",
    "level": "A1",
    "category": "Verger",
    "frenchDef": "Fruit frais sucré cueilli sur l'arbre.",
    "englishDef": "The sweet seed-bearing produce of a plant.",
    "etymology": "Du latin 'fructus' (fruit, jouissance de la terre).",
    "pressExcerpt": "Pupils were offered seasonal fresh fruit during morning break.",
    "pressSource": "Nutrition Trust",
    "collocations": [
      "fresh fruit",
      "seasonal fruit",
      "bowl of fruit"
    ],
    "nuanceComparisons": [
      {
        "word": "Fruit",
        "distinction": "Fruit sucré d'arbre."
      },
      {
        "word": "Vegetable",
        "distinction": "Légume potager."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-57-honey",
    "term": "Honey",
    "phonetic": "/ˈhʌn.i/",
    "level": "A1",
    "category": "Douceurs de la ruche",
    "frenchDef": "Miel doré récolté par les abeilles.",
    "englishDef": "A sweet golden fluid created by bees from flower nectar.",
    "etymology": "Du vieil anglais 'hunig' (miel ambré).",
    "pressExcerpt": "A spoonful of natural honey soothes the throat during winter colds.",
    "pressSource": "Soil Association",
    "collocations": [
      "pure honey",
      "spoon of honey",
      "organic honey"
    ],
    "nuanceComparisons": [
      {
        "word": "Honey",
        "distinction": "Nectar d'abeille naturel."
      },
      {
        "word": "Syrup",
        "distinction": "Sirop concentré cuit."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-6e-58-teacher",
    "term": "Teacher",
    "phonetic": "/ˈtiː.tʃər/",
    "level": "A1",
    "category": "Enseignement",
    "frenchDef": "Professeur guidant l'apprentissage.",
    "englishDef": "An educator who instructs pupils in school.",
    "etymology": "Du vieil anglais 'tǣcan' (montrer le chemin, instruire).",
    "pressExcerpt": "The dedicated teacher explained the grammar rule clearly.",
    "pressSource": "TES Educational",
    "collocations": [
      "school teacher",
      "head teacher",
      "experienced teacher"
    ],
    "nuanceComparisons": [
      {
        "word": "Teacher",
        "distinction": "Enseignant scolaire."
      },
      {
        "word": "Professor",
        "distinction": "Enseignant titulaire d'université."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-59-nurse",
    "term": "Nurse",
    "phonetic": "/nɜːs/",
    "level": "A1",
    "category": "Santé & Hôpital",
    "frenchDef": "Infirmier prodiguant les soins aux malades.",
    "englishDef": "A medical professional caring for patients.",
    "etymology": "Du latin 'nutricia' (nourrice bienveillante).",
    "pressExcerpt": "The school nurse treated the pupil's sprained ankle gently.",
    "pressSource": "NHS Careers",
    "collocations": [
      "hospital nurse",
      "school nurse",
      "caring nurse"
    ],
    "nuanceComparisons": [
      {
        "word": "Nurse",
        "distinction": "Professionnel des soins infirmiers."
      },
      {
        "word": "Physician",
        "distinction": "Médecin spécialiste diagnostiqueur."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-60-baker",
    "term": "Baker",
    "phonetic": "/ˈbeɪ.kər/",
    "level": "A1",
    "category": "Artisanat de bouche",
    "frenchDef": "Boulanger façonnant pains et baguettes.",
    "englishDef": "A tradesperson who bakes and sells fresh bread.",
    "etymology": "Du vieil anglais 'bæcere' (celui qui cuit la pâte au four).",
    "pressExcerpt": "The neighborhood baker crafts golden loaves early every dawn.",
    "pressSource": "Bakers Guild",
    "collocations": [
      "local baker",
      "master baker",
      "visit the baker"
    ],
    "nuanceComparisons": [
      {
        "word": "Baker",
        "distinction": "Artisan boulanger."
      },
      {
        "word": "Confectioner",
        "distinction": "Confiseur fabriquant bonbons et douceurs."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-61-driver",
    "term": "Driver",
    "phonetic": "/ˈdraɪ.vər/",
    "level": "A1",
    "category": "Transports",
    "frenchDef": "Conducteur d'autobus ou de train.",
    "englishDef": "A person who operates a motor vehicle or train.",
    "etymology": "Du vieil anglais 'drīfan' (diriger en avant).",
    "pressExcerpt": "The friendly bus driver welcomed the students onboard.",
    "pressSource": "Transport London",
    "collocations": [
      "bus driver",
      "train driver",
      "careful driver"
    ],
    "nuanceComparisons": [
      {
        "word": "Driver",
        "distinction": "Conducteur de véhicule terrestre."
      },
      {
        "word": "Captain",
        "distinction": "Capitaine commandant un navire."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-62-office",
    "term": "Office",
    "phonetic": "/ˈɒf.ɪs/",
    "level": "A1",
    "category": "Espaces de travail",
    "frenchDef": "Bureau administratif d'entreprise.",
    "englishDef": "A room or building used for commercial or public work.",
    "etymology": "Du latin 'officium' (devoir civique, service public).",
    "pressExcerpt": "The graphic designers work together in a bright shared office.",
    "pressSource": "The Economist",
    "collocations": [
      "post office",
      "work in an office",
      "head office"
    ],
    "nuanceComparisons": [
      {
        "word": "Office",
        "distinction": "Lieu de travail administratif."
      },
      {
        "word": "Desk",
        "distinction": "Meuble de bureau sur lequel on écrit."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-63-workshop",
    "term": "Workshop",
    "phonetic": "/ˈwɜːk.ʃɒp/",
    "level": "A1",
    "category": "Artisanat",
    "frenchDef": "Atelier doté d'établis et d'outils.",
    "englishDef": "A room where manual craft or repairs take place.",
    "etymology": "De 'work' (travail) et 'shop' (échoppe).",
    "pressExcerpt": "Handmade chairs are shaped with care in the carpenter's workshop.",
    "pressSource": "Woodcraft UK",
    "collocations": [
      "carpentry workshop",
      "mechanic workshop",
      "attend a workshop"
    ],
    "nuanceComparisons": [
      {
        "word": "Workshop",
        "distinction": "Atelier manuel d'artisan."
      },
      {
        "word": "Factory",
        "distinction": "Usine automatisée à grande échelle."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-64-uniform",
    "term": "Uniform",
    "phonetic": "/ˈjuː.nɪ.fɔːm/",
    "level": "A1",
    "category": "Tenues de fonction",
    "frenchDef": "Uniforme réglementaire partagé par une corporation.",
    "englishDef": "Distinctive clothing worn by members of an organization.",
    "etymology": "Du latin 'uniformis' (d'une seule et même forme).",
    "pressExcerpt": "Students wear a neat dark blazer as part of their school uniform.",
    "pressSource": "The Independent",
    "collocations": [
      "school uniform",
      "wear a uniform",
      "military uniform"
    ],
    "nuanceComparisons": [
      {
        "word": "Uniform",
        "distinction": "Tenue standardisée officielle."
      },
      {
        "word": "Costume",
        "distinction": "Costume théâtral ou de carnaval."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-6e-65-friend",
    "term": "Friend",
    "phonetic": "/frɛnd/",
    "level": "A1",
    "category": "Amitié",
    "frenchDef": "Ami sincère et loyal.",
    "englishDef": "A person with whom one enjoys a bond of mutual affection.",
    "etymology": "Du vieil anglais 'frēond' (celui qu'on aime de cœur).",
    "pressExcerpt": "A trustworthy friend supports you through both triumphs and trials.",
    "pressSource": "Psychology Today",
    "collocations": [
      "best friend",
      "close friend",
      "loyal friend"
    ],
    "nuanceComparisons": [
      {
        "word": "Friend",
        "distinction": "Ami intime choisi."
      },
      {
        "word": "Acquaintance",
        "distinction": "Simple relation de voisinage."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-66-kindness",
    "term": "Kindness",
    "phonetic": "/ˈkaɪnd.nəs/",
    "level": "A1",
    "category": "Valeurs humaines",
    "frenchDef": "Bonté de cœur et sollicitude.",
    "englishDef": "The quality of being warmhearted, considerate, and generous.",
    "etymology": "Du vieil anglais 'cynd' (nature bienveillante).",
    "pressExcerpt": "Small gestures of everyday kindness brighten school classrooms.",
    "pressSource": "UNESCO",
    "collocations": [
      "act of kindness",
      "treat with kindness",
      "show kindness"
    ],
    "nuanceComparisons": [
      {
        "word": "Kindness",
        "distinction": "Bonté spontanée et chaleureuse."
      },
      {
        "word": "Politeness",
        "distinction": "Politesse formelle et respect des règles."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-67-village",
    "term": "Village",
    "phonetic": "/ˈvɪl.ɪdʒ/",
    "level": "A1",
    "category": "Territoires",
    "frenchDef": "Village rural pittoresque.",
    "englishDef": "A small community situated in a rural landscape.",
    "etymology": "Du latin 'villa' (ferme de campagne, domaine rural).",
    "pressExcerpt": "A peaceful English village often centers around a church and green.",
    "pressSource": "Country Life",
    "collocations": [
      "peaceful village",
      "historic village",
      "village green"
    ],
    "nuanceComparisons": [
      {
        "word": "Village",
        "distinction": "Village rural."
      },
      {
        "word": "City",
        "distinction": "Grande ville métropolitaine."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-68-mountain",
    "term": "Mountain",
    "phonetic": "/ˈmaʊn.tɪn/",
    "level": "A1",
    "category": "Reliefs",
    "frenchDef": "Montagne rocheuse imposante.",
    "englishDef": "A steep natural elevation of the earth's surface.",
    "etymology": "Du latin 'mons' (mont, relief élevé).",
    "pressExcerpt": "Snow capped the distant mountain peaks against a clear azure sky.",
    "pressSource": "National Geographic",
    "collocations": [
      "climb a mountain",
      "mountain range",
      "snowy mountain"
    ],
    "nuanceComparisons": [
      {
        "word": "Mountain",
        "distinction": "Montagne élevée."
      },
      {
        "word": "Hill",
        "distinction": "Colline d'altitude modérée."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-69-laughter",
    "term": "Laughter",
    "phonetic": "/ˈlɑːf.tər/",
    "level": "A1",
    "category": "Joie & Émotions",
    "frenchDef": "Rire partagé qui réchauffe le cœur.",
    "englishDef": "The sound of amusement and genuine happiness.",
    "etymology": "Du vieil anglais 'hleahtor' (manifestation sonore de gaité).",
    "pressExcerpt": "Bursting into hearty laughter lifted their spirits after the exam.",
    "pressSource": "Child Health",
    "collocations": [
      "burst into laughter",
      "sound of laughter",
      "hearty laughter"
    ],
    "nuanceComparisons": [
      {
        "word": "Laughter",
        "distinction": "Rire franc et sonore."
      },
      {
        "word": "Giggle",
        "distinction": "Petit rire étouffé d'enfant."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-70-sharing",
    "term": "Sharing",
    "phonetic": "/ˈʃeə.rɪŋ/",
    "level": "A1",
    "category": "Solidarité",
    "frenchDef": "Partage bienveillant avec autrui.",
    "englishDef": "The act of dividing and distributing resources kindly.",
    "etymology": "Du vieil anglais 'scieran' (découper pour répartir équitablement).",
    "pressExcerpt": "Sharing books and snacks fosters a supportive atmosphere.",
    "pressSource": "Education Today",
    "collocations": [
      "practice sharing",
      "sharing is caring",
      "sharing thoughts"
    ],
    "nuanceComparisons": [
      {
        "word": "Sharing",
        "distinction": "Partage solidaire."
      },
      {
        "word": "Giving",
        "distinction": "Don unilatéral à autrui."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-71-canvas",
    "term": "Canvas",
    "phonetic": "/ˈkæn.vəs/",
    "level": "A1",
    "category": "Arts plastiques",
    "frenchDef": "Toile de peintre prête pour la création.",
    "englishDef": "Heavy woven fabric used as a painting surface.",
    "etymology": "Du latin 'cannabis' (toile résistante en chanvre).",
    "pressExcerpt": "The painter brushed glowing golden paint onto the blank canvas.",
    "pressSource": "Tate Modern",
    "collocations": [
      "blank canvas",
      "paint on canvas",
      "stretch a canvas"
    ],
    "nuanceComparisons": [
      {
        "word": "Canvas",
        "distinction": "Toile montée sur châssis."
      },
      {
        "word": "Easel",
        "distinction": "Chevalet supportant la toile."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-6e-72-hug",
    "term": "Hug",
    "phonetic": "/hʌɡ/",
    "level": "A1",
    "category": "Tendresse",
    "frenchDef": "Étreinte chaleureuse et réconfortante.",
    "englishDef": "A warm squeeze with the arms showing love or comfort.",
    "etymology": "Du vieux norrois 'hugga' (consoler, réconforter l'esprit).",
    "pressExcerpt": "A gentle hug comforts a classmate feeling sad or overwhelmed.",
    "pressSource": "Family Life",
    "collocations": [
      "warm hug",
      "give a hug",
      "comforting hug"
    ],
    "nuanceComparisons": [
      {
        "word": "Hug",
        "distinction": "Étreinte affective bienveillante."
      },
      {
        "word": "Handshake",
        "distinction": "Poignée de main polie."
      }
    ],
    "gradeLevel": "6e",
    "gradeLabel": "6e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-01-routine",
    "term": "Routine",
    "phonetic": "/ruːˈtiːn/",
    "level": "A2",
    "category": "Habitudes",
    "frenchDef": "Routine quotidienne bien rythmée.",
    "englishDef": "A sequence of actions regularly followed.",
    "etymology": "Du français 'route' (chemin tracé et répété).",
    "pressExcerpt": "Establishing a morning routine creates peace and focus.",
    "pressSource": "BBC Lifestyle",
    "collocations": [
      "daily routine",
      "follow a routine",
      "morning routine"
    ],
    "nuanceComparisons": [
      {
        "word": "Routine",
        "distinction": "Enchaînement régulier d'actions."
      },
      {
        "word": "Habit",
        "distinction": "Comportement individuel automatique."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-02-household",
    "term": "Household",
    "phonetic": "/ˈhaʊs.həʊld/",
    "level": "A2",
    "category": "Foyer",
    "frenchDef": "Ménage, foyer familial vivant sous le même toit.",
    "englishDef": "A house and its occupants regarded as a unit.",
    "etymology": "De 'house' (maison) et 'hold' (tenir ensemble).",
    "pressExcerpt": "Every household shares chores on Saturday mornings.",
    "pressSource": "The Times",
    "collocations": [
      "household chores",
      "household budget",
      "busy household"
    ],
    "nuanceComparisons": [
      {
        "word": "Household",
        "distinction": "Ensemble des résidents d'un foyer."
      },
      {
        "word": "Family",
        "distinction": "Lien de parenté biologique."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-03-appointment",
    "term": "Appointment",
    "phonetic": "/əˈpɔɪnt.mənt/",
    "level": "A2",
    "category": "Rendez-vous",
    "frenchDef": "Rendez-vous fixé à une heure convenue.",
    "englishDef": "An arrangement to meet someone at a particular time.",
    "etymology": "De l’ancien français 'apointier' (convenir par accord).",
    "pressExcerpt": "She booked a dental appointment after school.",
    "pressSource": "NHS England",
    "collocations": [
      "make an appointment",
      "dentist appointment",
      "keep an appointment"
    ],
    "nuanceComparisons": [
      {
        "word": "Appointment",
        "distinction": "Rendez-vous professionnel ou médical."
      },
      {
        "word": "Date",
        "distinction": "Rendez-vous galant ou amical."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-04-chores",
    "term": "Chores",
    "phonetic": "/tʃɔːz/",
    "level": "A2",
    "category": "Tâches domestiques",
    "frenchDef": "Tâches ménagères régulières.",
    "englishDef": "Routine tasks, especially household ones.",
    "etymology": "Du vieil anglais 'chare' (tour de travail, petite besogne).",
    "pressExcerpt": "Children earn pocket money by doing daily chores.",
    "pressSource": "Family Circle",
    "collocations": [
      "do chores",
      "daily chores",
      "household chores"
    ],
    "nuanceComparisons": [
      {
        "word": "Chores",
        "distinction": "Petites corvées ménagères."
      },
      {
        "word": "Job",
        "distinction": "Emploi salarié régulier."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-05-neighborhood",
    "term": "Neighborhood",
    "phonetic": "/ˈneɪ.bə.hʊd/",
    "level": "A2",
    "category": "Quartier",
    "frenchDef": "Quartier résidentiel convivial.",
    "englishDef": "A district or community within a town or city.",
    "etymology": "Du vieil anglais 'nēahgebūr' (voisin vivant à proximité).",
    "pressExcerpt": "Our neighborhood has a community library and leafy park.",
    "pressSource": "Country Life",
    "collocations": [
      "quiet neighborhood",
      "safe neighborhood",
      "explore the neighborhood"
    ],
    "nuanceComparisons": [
      {
        "word": "Neighborhood",
        "distinction": "Quartier et son ambiance humaine."
      },
      {
        "word": "District",
        "distinction": "Circonscription administrative."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-06-habit",
    "term": "Habit",
    "phonetic": "/ˈhæb.ɪt/",
    "level": "A2",
    "category": "Régularité",
    "frenchDef": "Habitude ancrée dans le quotidien.",
    "englishDef": "A settled tendency or regular practice.",
    "etymology": "Du latin 'habitus' (manière d’être, tenue).",
    "pressExcerpt": "Reading before sleeping is a peaceful habit.",
    "pressSource": "Psychology Today",
    "collocations": [
      "good habit",
      "form a habit",
      "break a habit"
    ],
    "nuanceComparisons": [
      {
        "word": "Habit",
        "distinction": "Pratique spontanée acquise."
      },
      {
        "word": "Custom",
        "distinction": "Coutume culturelle collective."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-07-tidy",
    "term": "Tidy",
    "phonetic": "/ˈtaɪ.di/",
    "level": "A2",
    "category": "Ordre",
    "frenchDef": "Ranger avec soin et méthode.",
    "englishDef": "To bring order and neatness to a room.",
    "etymology": "Du moyen anglais 'tidy' (fait à la bonne saison, opportun).",
    "pressExcerpt": "Please tidy your study desk before dinner.",
    "pressSource": "Home Organization",
    "collocations": [
      "tidy a room",
      "keep tidy",
      "tidy and neat"
    ],
    "nuanceComparisons": [
      {
        "word": "Tidy",
        "distinction": "Mettre en ordre des objets."
      },
      {
        "word": "Clean",
        "distinction": "Laver et désinfecter."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-08-clockwork",
    "term": "Clockwork",
    "phonetic": "/ˈklɒk.wɜːk/",
    "level": "A2",
    "category": "Précision",
    "frenchDef": "Régularité d'horloge parfaite.",
    "englishDef": "A mechanism with gears that runs like clockwork.",
    "etymology": "De 'clock' (horloge) et 'work' (mécanisme).",
    "pressExcerpt": "The school day ran like clockwork from start to finish.",
    "pressSource": "The Guardian",
    "collocations": [
      "like clockwork",
      "clockwork precision",
      "smooth clockwork"
    ],
    "nuanceComparisons": [
      {
        "word": "Clockwork",
        "distinction": "Mécanisme horloger régulier."
      },
      {
        "word": "Schedule",
        "distinction": "Calendrier prévisionnel."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-5e-09-passenger",
    "term": "Passenger",
    "phonetic": "/ˈpæs.ɪn.dʒər/",
    "level": "A2",
    "category": "Voyageurs",
    "frenchDef": "Passager à bord d'un navire ou train.",
    "englishDef": "A traveler on a vehicle other than the driver.",
    "etymology": "De l’ancien français 'passage' (celui qui passe).",
    "pressExcerpt": "Passengers boarded the ferry under a clear morning sky.",
    "pressSource": "Ferry Guide UK",
    "collocations": [
      "rail passenger",
      "seat a passenger",
      "fellow passenger"
    ],
    "nuanceComparisons": [
      {
        "word": "Passenger",
        "distinction": "Voyageur transporté."
      },
      {
        "word": "Pedestrian",
        "distinction": "Piéton marchant à pied."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-10-guidebook",
    "term": "Guidebook",
    "phonetic": "/ˈɡaɪd.bʊk/",
    "level": "A2",
    "category": "Guides touristiques",
    "frenchDef": "Guide de voyage illustré.",
    "englishDef": "A handbook containing travel information for visitors.",
    "etymology": "De 'guide' (orienter) et 'book' (livre).",
    "pressExcerpt": "She opened her London guidebook to find historic monuments.",
    "pressSource": "Lonely Planet",
    "collocations": [
      "consult a guidebook",
      "pocket guidebook",
      "read a guidebook"
    ],
    "nuanceComparisons": [
      {
        "word": "Guidebook",
        "distinction": "Livre explicatif de voyage."
      },
      {
        "word": "Brochure",
        "distinction": "Dépliant publicitaire succinct."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-11-luggage",
    "term": "Luggage",
    "phonetic": "/ˈlʌɡ.ɪdʒ/",
    "level": "A2",
    "category": "Bagages collectifs",
    "frenchDef": "Ensemble des bagages d'un voyageur.",
    "englishDef": "Suitcases or other bags in which to pack personal belongings.",
    "etymology": "De l’ancien scandinave 'lugga' (tirer, traîner lourdement).",
    "pressExcerpt": "Luggage was stowed securely in the train compartment.",
    "pressSource": "National Rail",
    "collocations": [
      "carry luggage",
      "heavy luggage",
      "claim luggage"
    ],
    "nuanceComparisons": [
      {
        "word": "Luggage",
        "distinction": "Ensemble des bagages (indénombrable)."
      },
      {
        "word": "Bag",
        "distinction": "Sac dénombrable individuel."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-12-departure",
    "term": "Departure",
    "phonetic": "/dɪˈpɑː.tʃər/",
    "level": "A2",
    "category": "Horaires de départ",
    "frenchDef": "Départ d'un train ou avion.",
    "englishDef": "The action of leaving, especially to start a journey.",
    "etymology": "Du français 'départ' (mise en route vers l'extérieur).",
    "pressExcerpt": "The departure lounge was filled with eager holidaymakers.",
    "pressSource": "Airport World",
    "collocations": [
      "departure time",
      "departure lounge",
      "scheduled departure"
    ],
    "nuanceComparisons": [
      {
        "word": "Departure",
        "distinction": "Départ."
      },
      {
        "word": "Arrival",
        "distinction": "Arrivée à destination."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-13-harbor",
    "term": "Harbor",
    "phonetic": "/ˈhɑː.bər/",
    "level": "A2",
    "category": "Ports maritimes",
    "frenchDef": "Port maritime abritant bateaux et voiliers.",
    "englishDef": "A place on the coast where ships seek shelter.",
    "etymology": "Du vieil anglais 'herebeorg' (abri pour l'armée ou la flotte).",
    "pressExcerpt": "Fishing boats returned to the calm harbor at dusk.",
    "pressSource": "Maritime UK",
    "collocations": [
      "sheltered harbor",
      "natural harbor",
      "busy harbor"
    ],
    "nuanceComparisons": [
      {
        "word": "Harbor",
        "distinction": "Port maritime naturel ou abrité."
      },
      {
        "word": "Dock",
        "distinction": "Bassin de chargement portuaire."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-14-currency",
    "term": "Currency",
    "phonetic": "/ˈkʌr.ən.si/",
    "level": "A2",
    "category": "Monnaies du monde",
    "frenchDef": "Monnaie officielle d'un pays.",
    "englishDef": "A system of money in general use in a country.",
    "etymology": "Du latin 'currens' (ce qui circule avec fluidité).",
    "pressExcerpt": "He exchanged euros for British pounds at the bank.",
    "pressSource": "Financial Times",
    "collocations": [
      "foreign currency",
      "exchange currency",
      "local currency"
    ],
    "nuanceComparisons": [
      {
        "word": "Currency",
        "distinction": "Monnaie officielle d'un État."
      },
      {
        "word": "Coin",
        "distinction": "Pièce de monnaie métallique."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-15-souvenir",
    "term": "Souvenir",
    "phonetic": "/ˌsuː.vəˈnɪər/",
    "level": "A2",
    "category": "Souvenirs de voyage",
    "frenchDef": "Objet souvenir gardé d'un séjour.",
    "englishDef": "A thing that is kept as a reminder of a place visited.",
    "etymology": "Du verbe français 'se souvenir' (garder en mémoire).",
    "pressExcerpt": "She purchased a miniature Big Ben as a travel souvenir.",
    "pressSource": "BBC London",
    "collocations": [
      "travel souvenir",
      "buy a souvenir",
      "keep as a souvenir"
    ],
    "nuanceComparisons": [
      {
        "word": "Souvenir",
        "distinction": "Objet acheté en mémoire d'un voyage."
      },
      {
        "word": "Memory",
        "distinction": "Souvenir immatériel dans l'esprit."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-5e-16-cathedral",
    "term": "Cathedral",
    "phonetic": "/kəˈθiː.drəl/",
    "level": "A2",
    "category": "Monuments religieux",
    "frenchDef": "Cathédrale gothique imposante.",
    "englishDef": "The principal church of a diocese, with which the bishop is associated.",
    "etymology": "Du grec 'kathedra' (siège, trône de l'évêque).",
    "pressExcerpt": "Canterbury Cathedral boasts magnificent medieval stained glass.",
    "pressSource": "English Heritage",
    "collocations": [
      "gothic cathedral",
      "visit a cathedral",
      "historic cathedral"
    ],
    "nuanceComparisons": [
      {
        "word": "Cathedral",
        "distinction": "Grande église siège d'évêché."
      },
      {
        "word": "Chapel",
        "distinction": "Petite chapelle d'école ou village."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-17-century",
    "term": "Century",
    "phonetic": "/ˈsɛn.tʃər.i/",
    "level": "A2",
    "category": "Chronologie",
    "frenchDef": "Siècle de cent années d'histoire.",
    "englishDef": "A period of one hundred years.",
    "etymology": "Du latin 'centuria' (division de cent hommes).",
    "pressExcerpt": "The castle dates back to the twelfth century.",
    "pressSource": "BBC History",
    "collocations": [
      "twelfth century",
      "turn of the century",
      "over a century"
    ],
    "nuanceComparisons": [
      {
        "word": "Century",
        "distinction": "Période de cent ans."
      },
      {
        "word": "Decade",
        "distinction": "Période de dix ans."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-18-ruins",
    "term": "Ruins",
    "phonetic": "/ˈruː.ɪnz/",
    "level": "A2",
    "category": "Vestiges",
    "frenchDef": "Ruines anciennes témoignant du passé.",
    "englishDef": "The physical remains of a building that has suffered decay.",
    "etymology": "Du latin 'ruina' (chute, écroulement solennel).",
    "pressExcerpt": "Roman ruins still stand proudly across northern England.",
    "pressSource": "National Trust",
    "collocations": [
      "ancient ruins",
      "explore the ruins",
      "crumbling ruins"
    ],
    "nuanceComparisons": [
      {
        "word": "Ruins",
        "distinction": "Vestiges architecturaux anciens."
      },
      {
        "word": "Debris",
        "distinction": "Décombres après un sinistre récent."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-19-artifact",
    "term": "Artifact",
    "phonetic": "/ˈɑː.tɪ.fækt/",
    "level": "A2",
    "category": "Archéologie",
    "frenchDef": "Artefact archéologique ouvragé de main d'homme.",
    "englishDef": "An object made by a human being, of cultural interest.",
    "etymology": "Du latin 'arte factum' (fabriqué avec art et habileté).",
    "pressExcerpt": "The bronze helmet is a rare Anglo-Saxon artifact.",
    "pressSource": "British Museum",
    "collocations": [
      "ancient artifact",
      "preserve an artifact",
      "discover an artifact"
    ],
    "nuanceComparisons": [
      {
        "word": "Artifact",
        "distinction": "Objet culturel fabriqué par l'homme."
      },
      {
        "word": "Fossil",
        "distinction": "Reste organique fossilisé par la nature."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-20-medieval",
    "term": "Medieval",
    "phonetic": "/ˌmɛd.iˈiː.vəl/",
    "level": "A2",
    "category": "Moyen Âge",
    "frenchDef": "Médiéval, relatif au Moyen Âge.",
    "englishDef": "Relating to the Middle Ages, roughly 500 to 1500 AD.",
    "etymology": "Du latin 'medium aevum' (l'âge moyen entre Antiquité et Renaissance).",
    "pressExcerpt": "Medieval fairs celebrate traditional archery and jousting.",
    "pressSource": "History Today",
    "collocations": [
      "medieval period",
      "medieval history",
      "medieval village"
    ],
    "nuanceComparisons": [
      {
        "word": "Medieval",
        "distinction": "Propre au Moyen Âge."
      },
      {
        "word": "Modern",
        "distinction": "Appartenant à l'époque moderne."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-21-kingdom",
    "term": "Kingdom",
    "phonetic": "/ˈkɪŋ.dəm/",
    "level": "A2",
    "category": "Royaumes",
    "frenchDef": "Royaume gouverné par un souverain.",
    "englishDef": "A country ruled by a king or queen.",
    "etymology": "Du vieil anglais 'cyningdōm' (domaine du roi).",
    "pressExcerpt": "The United Kingdom includes England, Scotland, Wales, and Northern Ireland.",
    "pressSource": "BBC UK",
    "collocations": [
      "ancient kingdom",
      "rule a kingdom",
      "sovereign kingdom"
    ],
    "nuanceComparisons": [
      {
        "word": "Kingdom",
        "distinction": "Royaume souverain."
      },
      {
        "word": "Empire",
        "distinction": "Empire regroupant plusieurs nations."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-22-explorer",
    "term": "Explorer",
    "phonetic": "/ɪkˈsplɔː.rər/",
    "level": "A2",
    "category": "Découvertes",
    "frenchDef": "Explorateur bravant des terres inconnues.",
    "englishDef": "A person who explores unfamiliar areas.",
    "etymology": "Du latin 'explorare' (partir en reconnaissance).",
    "pressExcerpt": "Early maritime explorers charted distant oceans.",
    "pressSource": "National Geographic",
    "collocations": [
      "polar explorer",
      "famous explorer",
      "brave explorer"
    ],
    "nuanceComparisons": [
      {
        "word": "Explorer",
        "distinction": "Pionnier des cartes inconnues."
      },
      {
        "word": "Tourist",
        "distinction": "Voyageur visitant des lieux balisés."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-5e-23-sketching",
    "term": "Sketching",
    "phonetic": "/ˈskɛtʃ.ɪŋ/",
    "level": "A2",
    "category": "Croquis",
    "frenchDef": "Croquis rapide captant une silhouette.",
    "englishDef": "Making a rough or unfinished drawing or outline.",
    "etymology": "De l’italien 'schizzo' (jet rapide, esquisse sur le vif).",
    "pressExcerpt": "He spends afternoons sketching ducks at the lake.",
    "pressSource": "Artists Magazine",
    "collocations": [
      "pencil sketching",
      "outdoor sketching",
      "practice sketching"
    ],
    "nuanceComparisons": [
      {
        "word": "Sketching",
        "distinction": "Esquisse rapide non finalisée."
      },
      {
        "word": "Illustration",
        "distinction": "Dessin achevé pour un texte."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-24-sculpture",
    "term": "Sculpture",
    "phonetic": "/ˈskʌlp.tʃər/",
    "level": "A2",
    "category": "Volume",
    "frenchDef": "Sculpture en pierre, bronze ou argile.",
    "englishDef": "The art of making three-dimensional figures.",
    "etymology": "Du latin 'sculpere' (tailler, ciseler dans la pierre).",
    "pressExcerpt": "The museum displays a marble sculpture of a mythical winged horse.",
    "pressSource": "Tate Britain",
    "collocations": [
      "stone sculpture",
      "admire a sculpture",
      "modern sculpture"
    ],
    "nuanceComparisons": [
      {
        "word": "Sculpture",
        "distinction": "Œuvre en trois dimensions."
      },
      {
        "word": "Painting",
        "distinction": "Œuvre picturale en deux dimensions."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-25-storytelling",
    "term": "Storytelling",
    "phonetic": "/ˈstɔː.riˌtɛl.ɪŋ/",
    "level": "A2",
    "category": "Narration",
    "frenchDef": "Art de conter des histoires captivantes.",
    "englishDef": "The activity of telling or writing stories.",
    "etymology": "De 'story' (récit) et 'tell' (raconter oralement).",
    "pressExcerpt": "Traditional storytelling brings folk legends to life.",
    "pressSource": "Literacy Trust",
    "collocations": [
      "art of storytelling",
      "master of storytelling",
      "listen to storytelling"
    ],
    "nuanceComparisons": [
      {
        "word": "Storytelling",
        "distinction": "Narration orale expressive."
      },
      {
        "word": "Recitation",
        "distinction": "Récitation par cœur d'un poème."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-26-ceramics",
    "term": "Ceramics",
    "phonetic": "/səˈræm.ɪks/",
    "level": "A2",
    "category": "Poterie",
    "frenchDef": "Céramique et poterie artisanale.",
    "englishDef": "Pots and other articles made from clay hardened by heat.",
    "etymology": "Du grec 'keramos' (argile cuite au four).",
    "pressExcerpt": "Pupils decorated colorful ceramic bowls in art class.",
    "pressSource": "Crafts UK",
    "collocations": [
      "handmade ceramics",
      "ceramic glaze",
      "clay ceramics"
    ],
    "nuanceComparisons": [
      {
        "word": "Ceramics",
        "distinction": "Objets en terre cuite."
      },
      {
        "word": "Glassware",
        "distinction": "Verrerie soufflée."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-27-photography",
    "term": "Photography",
    "phonetic": "/fəˈtɒɡ.rə.fi/",
    "level": "A2",
    "category": "Image",
    "frenchDef": "Photographie artistique saisissant la lumière.",
    "englishDef": "The art of taking and processing photographs.",
    "etymology": "Du grec 'phōs' (lumière) et 'graphein' (écrire, dessiner).",
    "pressExcerpt": "Nature photography requires great patience and observation.",
    "pressSource": "BBC Wildlife",
    "collocations": [
      "digital photography",
      "nature photography",
      "practice photography"
    ],
    "nuanceComparisons": [
      {
        "word": "Photography",
        "distinction": "Captation optique de la lumière."
      },
      {
        "word": "Cinema",
        "distinction": "Art des images en mouvement."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-28-novel",
    "term": "Novel",
    "phonetic": "/ˈnɒv.əl/",
    "level": "A2",
    "category": "Littérature",
    "frenchDef": "Roman de fiction captivant.",
    "englishDef": "A fictitious prose narrative of book length.",
    "etymology": "De l’italien 'novella' (histoire nouvelle et plaisante).",
    "pressExcerpt": "She read an adventurous historical novel during vacation.",
    "pressSource": "The Guardian Books",
    "collocations": [
      "read a novel",
      "historical novel",
      "bestselling novel"
    ],
    "nuanceComparisons": [
      {
        "word": "Novel",
        "distinction": "Roman de fiction volumineux."
      },
      {
        "word": "Short story",
        "distinction": "Nouvelle brève."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-29-woodcraft",
    "term": "Woodcraft",
    "phonetic": "/ˈwʊd.krɑːft/",
    "level": "A2",
    "category": "Travail du bois",
    "frenchDef": "Sculpture et travail du bois.",
    "englishDef": "Skill and practice in anything relating to the woods, or carving wood.",
    "etymology": "De 'wood' (bois) et 'craft' (habileté).",
    "pressExcerpt": "Pupils learned traditional woodcraft carving small boats.",
    "pressSource": "Crafts Guild",
    "collocations": [
      "fine woodcraft",
      "learn woodcraft",
      "traditional woodcraft"
    ],
    "nuanceComparisons": [
      {
        "word": "Woodcraft",
        "distinction": "Artisanat du bois sculpté."
      },
      {
        "word": "Carpentry",
        "distinction": "Menuiserie et charpente structurelle."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-5e-30-referee",
    "term": "Referee",
    "phonetic": "/ˌrɛf.əˈriː/",
    "level": "A2",
    "category": "Arbitrage",
    "frenchDef": "Arbitre officiel garant des règles.",
    "englishDef": "An official who watches a game to enforce rules.",
    "etymology": "Du latin 'referre' (renvoyer la décision à un juge neutre).",
    "pressExcerpt": "The referee awarded a penalty kick for a foul.",
    "pressSource": "FA Sports",
    "collocations": [
      "match referee",
      "respect the referee",
      "referee decision"
    ],
    "nuanceComparisons": [
      {
        "word": "Referee",
        "distinction": "Arbitre de terrain mobile (football)."
      },
      {
        "word": "Umpire",
        "distinction": "Arbitre assis ou statique (tennis, cricket)."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-31-tournament",
    "term": "Tournament",
    "phonetic": "/ˈtʊə.nə.mənt/",
    "level": "A2",
    "category": "Compétition",
    "frenchDef": "Tournoi réunissant plusieurs équipes.",
    "englishDef": "A sporting competition involving a number of matches.",
    "etymology": "De l'ancien français 'tornei' (joute médiévale tournoyante).",
    "pressExcerpt": "Our school team qualified for the regional tennis tournament.",
    "pressSource": "Tennis Weekly",
    "collocations": [
      "win a tournament",
      "enter a tournament",
      "annual tournament"
    ],
    "nuanceComparisons": [
      {
        "word": "Tournament",
        "distinction": "Compétition par élimination."
      },
      {
        "word": "League",
        "distinction": "Championnat régulier avec classement."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-32-endurance",
    "term": "Endurance",
    "phonetic": "/ɪnˈdjʊə.rəns/",
    "level": "A2",
    "category": "Effort",
    "frenchDef": "Endurance physique face à la durée.",
    "englishDef": "The ability to withstand an unpleasant or difficult process.",
    "etymology": "Du latin 'indurare' (rendre dur, résister fermement).",
    "pressExcerpt": "Cross-country running builds cardiovascular endurance.",
    "pressSource": "Athletics UK",
    "collocations": [
      "build endurance",
      "stamina and endurance",
      "physical endurance"
    ],
    "nuanceComparisons": [
      {
        "word": "Endurance",
        "distinction": "Capacité à tenir dans la durée."
      },
      {
        "word": "Sprint",
        "distinction": "Effort intense très bref."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-33-medal",
    "term": "Medal",
    "phonetic": "/ˈmɛd.əl/",
    "level": "A2",
    "category": "Récompenses",
    "frenchDef": "Médaille d'or, d'argent ou de bronze.",
    "englishDef": "A metal disc awarded as a prize in a competition.",
    "etymology": "De l’italien 'medaglia' (petite pièce commémorative).",
    "pressExcerpt": "She wore her shiny swimming medal around her neck.",
    "pressSource": "Olympic Review",
    "collocations": [
      "gold medal",
      "win a medal",
      "medal ceremony"
    ],
    "nuanceComparisons": [
      {
        "word": "Medal",
        "distinction": "Médaille de métal."
      },
      {
        "word": "Trophy",
        "distinction": "Coupe en forme d'urne."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-34-athlete",
    "term": "Athlete",
    "phonetic": "/ˈæθ.liːt/",
    "level": "A2",
    "category": "Performeurs",
    "frenchDef": "Athlète discipliné s'entraînant avec rigueur.",
    "englishDef": "A person proficient in sports and physical exercise.",
    "etymology": "Du grec 'athlētēs' (combattant pour un prix).",
    "pressExcerpt": "The determined athlete trained daily at the local stadium.",
    "pressSource": "Sports Illustrated",
    "collocations": [
      "talented athlete",
      "train as an athlete",
      "Olympic athlete"
    ],
    "nuanceComparisons": [
      {
        "word": "Athlete",
        "distinction": "Sportif accompli."
      },
      {
        "word": "Spectator",
        "distinction": "Spectateur regardant l'épreuve."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-35-championship",
    "term": "Championship",
    "phonetic": "/ˈtʃæm.pi.ən.ʃɪp/",
    "level": "A2",
    "category": "Finales",
    "frenchDef": "Championnat déterminant le vainqueur suprême.",
    "englishDef": "A competition to find the best player or team.",
    "etymology": "De 'champion' (du latin campus, champion de lice).",
    "pressExcerpt": "The basketball championship was broadcast live across the nation.",
    "pressSource": "BBC Sport",
    "collocations": [
      "world championship",
      "win the championship",
      "championship title"
    ],
    "nuanceComparisons": [
      {
        "word": "Championship",
        "distinction": "Titre suprême de champion."
      },
      {
        "word": "Match",
        "distinction": "Rencontre unitaire isolée."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-36-warm-up",
    "term": "Warm-up",
    "phonetic": "/ˈwɔːm.ʌp/",
    "level": "A2",
    "category": "Préparation",
    "frenchDef": "Échauffement musculaire prévenant les blessures.",
    "englishDef": "A period of preparatory exercise before sport.",
    "etymology": "De 'warm' (chauffer) et 'up' (élever la température du corps).",
    "pressExcerpt": "A ten-minute warm-up prepares muscles for exertion.",
    "pressSource": "Sports Medicine",
    "collocations": [
      "proper warm-up",
      "do a warm-up",
      "ten-minute warm-up"
    ],
    "nuanceComparisons": [
      {
        "word": "Warm-up",
        "distinction": "Échauffement musculaire préliminaire."
      },
      {
        "word": "Cool-down",
        "distinction": "Retour au calme et étirements."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-5e-37-orchestra",
    "term": "Orchestra",
    "phonetic": "/ˈɔː.kɪ.strə/",
    "level": "A2",
    "category": "Symphonie",
    "frenchDef": "Orchestre symphonique de cordes, cuivres et bois.",
    "englishDef": "A large group of musicians playing diverse instruments.",
    "etymology": "Du grec 'orkhēstra' (espace circulaire où évoluait le chœur).",
    "pressExcerpt": "The youth orchestra played a vibrant Beethoven symphony.",
    "pressSource": "Classic FM",
    "collocations": [
      "symphony orchestra",
      "conduct an orchestra",
      "play in an orchestra"
    ],
    "nuanceComparisons": [
      {
        "word": "Orchestra",
        "distinction": "Grand orchestre complet."
      },
      {
        "word": "Chamber group",
        "distinction": "Petit ensemble de musique de chambre."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-38-lyrics",
    "term": "Lyrics",
    "phonetic": "/ˈlɪr.ɪks/",
    "level": "A2",
    "category": "Paroles",
    "frenchDef": "Paroles poétiques d'une chanson.",
    "englishDef": "The words of a song.",
    "etymology": "Du grec 'lyrikos' (chanté au son de la lyre).",
    "pressExcerpt": "The meaningful lyrics spoke of hope and perseverance.",
    "pressSource": "BBC Music",
    "collocations": [
      "song lyrics",
      "write lyrics",
      "poetic lyrics"
    ],
    "nuanceComparisons": [
      {
        "word": "Lyrics",
        "distinction": "Paroles d'une chanson."
      },
      {
        "word": "Libretto",
        "distinction": "Texte complet d'un opéra."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-39-composer",
    "term": "Composer",
    "phonetic": "/kəmˈpəʊ.zər/",
    "level": "A2",
    "category": "Création musicale",
    "frenchDef": "Compositeur inventant des mélodies.",
    "englishDef": "A person who writes music, especially classical works.",
    "etymology": "Du latin 'componere' (assembler harmonieusement les sons).",
    "pressExcerpt": "Handel was a renowned composer who lived in London.",
    "pressSource": "Royal Academy of Music",
    "collocations": [
      "classical composer",
      "talented composer",
      "music by the composer"
    ],
    "nuanceComparisons": [
      {
        "word": "Composer",
        "distinction": "Créateur de la musique."
      },
      {
        "word": "Performer",
        "distinction": "Musicien interprétant l'œuvre."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-40-stage",
    "term": "Stage",
    "phonetic": "/steɪdʒ/",
    "level": "A2",
    "category": "Scénographie",
    "frenchDef": "Scène de théâtre où jouent les acteurs.",
    "englishDef": "A raised floor or platform on which actors perform.",
    "etymology": "Du vieux français 'estage' (degré surélevé).",
    "pressExcerpt": "Actors stepped onto the stage amidst thunderous applause.",
    "pressSource": "The Stage UK",
    "collocations": [
      "on stage",
      "step onto the stage",
      "stage lighting"
    ],
    "nuanceComparisons": [
      {
        "word": "Stage",
        "distinction": "Plateau de jeu des comédiens."
      },
      {
        "word": "Auditorium",
        "distinction": "Salle où sont assis les spectateurs."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-41-spotlight",
    "term": "Spotlight",
    "phonetic": "/ˈspɒt.laɪt/",
    "level": "A2",
    "category": "Éclairage de scène",
    "frenchDef": "Projecteur mettant en valeur l'artiste.",
    "englishDef": "A lamp projecting a narrow beam of intense light on stage.",
    "etymology": "De 'spot' (point focal) et 'light' (lumière).",
    "pressExcerpt": "The singer stood alone beneath the warm spotlight.",
    "pressSource": "Theatre Crafts",
    "collocations": [
      "in the spotlight",
      "bright spotlight",
      "shine a spotlight"
    ],
    "nuanceComparisons": [
      {
        "word": "Spotlight",
        "distinction": "Faisceau lumineux focalisé."
      },
      {
        "word": "Floodlight",
        "distinction": "Éclairage diffus large."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-42-harmony",
    "term": "Harmony",
    "phonetic": "/ˈhɑː.mə.ni/",
    "level": "A2",
    "category": "Accords",
    "frenchDef": "Harmonie sonore où plusieurs notes s'accordent.",
    "englishDef": "The combination of simultaneously sounded musical notes.",
    "etymology": "Du grec 'harmonia' (ajustement parfait des proportions).",
    "pressExcerpt": "The three singers blended their voices in sublime harmony.",
    "pressSource": "Choral Review",
    "collocations": [
      "vocal harmony",
      "sing in harmony",
      "musical harmony"
    ],
    "nuanceComparisons": [
      {
        "word": "Harmony",
        "distinction": "Accord de plusieurs sons simultanés."
      },
      {
        "word": "Melody",
        "distinction": "Succession linéaire de notes."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-43-performance",
    "term": "Performance",
    "phonetic": "/pəˈfɔː.məns/",
    "level": "A2",
    "category": "Représentation",
    "frenchDef": "Prestation scénique devant le public.",
    "englishDef": "An act of presenting a play, concert, or piece of entertainment.",
    "etymology": "De l’ancien français 'parfournir' (accomplir pleinement).",
    "pressExcerpt": "Their energetic dance performance delighted the whole school.",
    "pressSource": "Arts Express",
    "collocations": [
      "live performance",
      "give a performance",
      "brilliant performance"
    ],
    "nuanceComparisons": [
      {
        "word": "Performance",
        "distinction": "Exécution scénique devant public."
      },
      {
        "word": "Rehearsal",
        "distinction": "Répétition préparatoire privée."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-5e-44-reservation",
    "term": "Reservation",
    "phonetic": "/ˌrɛz.əˈveɪ.ʃən/",
    "level": "A2",
    "category": "Accueil",
    "frenchDef": "Réservation de table assurée à l'avance.",
    "englishDef": "An arrangement to secure a table in advance.",
    "etymology": "Du latin 'reservare' (garder de côté avec soin).",
    "pressExcerpt": "It is wise to make a reservation for dinner on weekends.",
    "pressSource": "Good Food Guide",
    "collocations": [
      "make a reservation",
      "dinner reservation",
      "confirm a reservation"
    ],
    "nuanceComparisons": [
      {
        "word": "Reservation",
        "distinction": "Réservation d'une table."
      },
      {
        "word": "Cancellation",
        "distinction": "Annulation de la réservation."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-45-appetizer",
    "term": "Appetizer",
    "phonetic": "/ˈæp.ɪ.taɪ.zər/",
    "level": "A2",
    "category": "Entrées",
    "frenchDef": "Mise en bouche ou entrée salée.",
    "englishDef": "A small dish of food taken before a meal to stimulate appetite.",
    "etymology": "Du latin 'appetere' (tendre vers, désirer vivement).",
    "pressExcerpt": "Bruschetta served with fresh tomatoes was our appetizer.",
    "pressSource": "Culinary Art",
    "collocations": [
      "order an appetizer",
      "tasty appetizer",
      "serve as an appetizer"
    ],
    "nuanceComparisons": [
      {
        "word": "Appetizer",
        "distinction": "Amuse-bouche ou entrée salée."
      },
      {
        "word": "Dessert",
        "distinction": "Plat sucré de clôture."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-46-chef",
    "term": "Chef",
    "phonetic": "/ʃɛf/",
    "level": "A2",
    "category": "Cuisine",
    "frenchDef": "Chef cuisinier maître des fourneaux.",
    "englishDef": "A professional cook, typically the chief cook in a restaurant.",
    "etymology": "Du français 'chef' (chef de cuisine, tête pensante).",
    "pressExcerpt": "The head chef carefully tasted every sauce before service.",
    "pressSource": "Michelin Guide",
    "collocations": [
      "head chef",
      "talented chef",
      "pastry chef"
    ],
    "nuanceComparisons": [
      {
        "word": "Chef",
        "distinction": "Chef cuisinier qualifié."
      },
      {
        "word": "Cook",
        "distinction": "Cuisinier général sans grade de chef."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-47-cutlery",
    "term": "Cutlery",
    "phonetic": "/ˈkʌt.lər.i/",
    "level": "A2",
    "category": "Art de la table",
    "frenchDef": "Couverts de table : fourchettes, couteaux et cuillères.",
    "englishDef": "Knives, forks, and spoons used for eating or serving food.",
    "etymology": "De l’ancien français 'coutelier' (artisan façonnant des couteaux).",
    "pressExcerpt": "Polished silver cutlery was placed symmetrically around the plates.",
    "pressSource": "Etiquette Today",
    "collocations": [
      "silver cutlery",
      "set the cutlery",
      "stainless steel cutlery"
    ],
    "nuanceComparisons": [
      {
        "word": "Cutlery",
        "distinction": "Ensemble des couverts de table."
      },
      {
        "word": "Crockery",
        "distinction": "Vaisselle : assiettes et plats."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-48-banquet",
    "term": "Banquet",
    "phonetic": "/ˈbæŋ.kwɪt/",
    "level": "A2",
    "category": "Festins",
    "frenchDef": "Banquet somptueux célébrant de grands moments.",
    "englishDef": "An elaborate and formal evening meal for many people.",
    "etymology": "De l’italien 'banchetto' (petit banc où l'on s'asseyait pour festoyer).",
    "pressExcerpt": "The mayor hosted a welcoming banquet for the visiting exchange students.",
    "pressSource": "The Telegraph",
    "collocations": [
      "attend a banquet",
      "formal banquet",
      "royal banquet"
    ],
    "nuanceComparisons": [
      {
        "word": "Banquet",
        "distinction": "Festin officiel pour de nombreux convives."
      },
      {
        "word": "Snack",
        "distinction": "En-cas rapide sur le pouce."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-49-hospitality",
    "term": "Hospitality",
    "phonetic": "/ˌhɒs.pɪˈtæl.ə.ti/",
    "level": "A2",
    "category": "Bienvenue",
    "frenchDef": "Hospitalité chaleureuse accordée aux visiteurs.",
    "englishDef": "The friendly reception and entertainment of guests.",
    "etymology": "Du latin 'hospitalitas' (accueil réservé à l'hôte étranger).",
    "pressExcerpt": "We were touched by the warm hospitality of our host family.",
    "pressSource": "Country Life",
    "collocations": [
      "warm hospitality",
      "show hospitality",
      "generous hospitality"
    ],
    "nuanceComparisons": [
      {
        "word": "Hospitality",
        "distinction": "Générosité d'accueil d'un hôte."
      },
      {
        "word": "Hostility",
        "distinction": "Hostilité et rejet."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-50-course",
    "term": "Course",
    "phonetic": "/kɔːs/",
    "level": "A2",
    "category": "Service des plats",
    "frenchDef": "Plat d'un menu servi à un moment du repas.",
    "englishDef": "A specific part of a meal served at one time.",
    "etymology": "Du latin 'cursus' (course, déroulement chronologique du repas).",
    "pressExcerpt": "The main course featured roasted salmon with steamed asparagus.",
    "pressSource": "BBC Food",
    "collocations": [
      "main course",
      "three-course meal",
      "first course"
    ],
    "nuanceComparisons": [
      {
        "word": "Course",
        "distinction": "Service d'un plat dans un menu."
      },
      {
        "word": "Dish",
        "distinction": "La préparation cuisinée elle-même."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-5e-51-balanced",
    "term": "Balanced",
    "phonetic": "/ˈbæl.ənst/",
    "level": "A2",
    "category": "Équilibre",
    "frenchDef": "Équilibré sur le plan diététique.",
    "englishDef": "Consisting of parts in proper proportion for good health.",
    "etymology": "Du latin 'bilanx' (balance à deux plateaux égaux).",
    "pressExcerpt": "A balanced diet includes proteins, fiber, and plenty of vegetables.",
    "pressSource": "NHS Choices",
    "collocations": [
      "balanced diet",
      "balanced meal",
      "healthy and balanced"
    ],
    "nuanceComparisons": [
      {
        "word": "Balanced",
        "distinction": "Équilibré en nutriments."
      },
      {
        "word": "Excessive",
        "distinction": "Excessif dans un aliment donné."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-52-nutrition",
    "term": "Nutrition",
    "phonetic": "/njuːˈtrɪʃ.ən/",
    "level": "A2",
    "category": "Diététique",
    "frenchDef": "Nutrition apportant les éléments indispensables.",
    "englishDef": "The process of providing or obtaining the food necessary for health.",
    "etymology": "Du latin 'nutrire' (nourrir, sustenter le corps).",
    "pressExcerpt": "Schools teach the fundamentals of proper nutrition and exercise.",
    "pressSource": "British Nutrition Foundation",
    "collocations": [
      "good nutrition",
      "proper nutrition",
      "human nutrition"
    ],
    "nuanceComparisons": [
      {
        "word": "Nutrition",
        "distinction": "Science des apports nutritifs."
      },
      {
        "word": "Diet",
        "distinction": "Régime alimentaire suivi au jour le jour."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-53-dairy",
    "term": "Dairy",
    "phonetic": "/ˈdeə.ri/",
    "level": "A2",
    "category": "Produits laitiers",
    "frenchDef": "Produits laitiers riches en calcium.",
    "englishDef": "Food made from or containing milk, such as cheese and yogurt.",
    "etymology": "Du moyen anglais 'deyrie' (laiterie tenue par la vachère).",
    "pressExcerpt": "Yogurt and milk are common dairy foods that support bone growth.",
    "pressSource": "Nutrition Journal",
    "collocations": [
      "dairy products",
      "dairy farm",
      "dairy-free"
    ],
    "nuanceComparisons": [
      {
        "word": "Dairy",
        "distinction": "Aliments issus du lait."
      },
      {
        "word": "Bakery",
        "distinction": "Produits issus de la farine cuite."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-54-beverage",
    "term": "Beverage",
    "phonetic": "/ˈbɛv.ər.ɪdʒ/",
    "level": "A2",
    "category": "Boissons",
    "frenchDef": "Boisson rafraîchissante ou chaude.",
    "englishDef": "A drink, especially one other than water.",
    "etymology": "De l’ancien français 'bevrage' (boisson propre à la consommation).",
    "pressExcerpt": "Unsweetened herbal tea is a comforting winter beverage.",
    "pressSource": "Healthline",
    "collocations": [
      "hot beverage",
      "cold beverage",
      "healthy beverage"
    ],
    "nuanceComparisons": [
      {
        "word": "Beverage",
        "distinction": "Terme élégant pour boisson."
      },
      {
        "word": "Drink",
        "distinction": "Terme courant et familier."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-55-energy",
    "term": "Energy",
    "phonetic": "/ˈɛn.ə.dʒi/",
    "level": "A2",
    "category": "Vitalité",
    "frenchDef": "Énergie vivifiante soutenant l'activité.",
    "englishDef": "The strength and vitality required for sustained activity.",
    "etymology": "Du grec 'energeia' (force agissante en action).",
    "pressExcerpt": "Whole grain cereals provide slow-release energy for learning.",
    "pressSource": "Medical News Today",
    "collocations": [
      "boost energy",
      "full of energy",
      "physical energy"
    ],
    "nuanceComparisons": [
      {
        "word": "Energy",
        "distinction": "Capacité physique et mentale d'action."
      },
      {
        "word": "Fatigue",
        "distinction": "Épuisement et manque de force."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-56-wellness",
    "term": "Wellness",
    "phonetic": "/ˈwɛl.nəs/",
    "level": "A2",
    "category": "Bien-être",
    "frenchDef": "Bien-être physique, mental et équilibre général.",
    "englishDef": "The state of being in good health, especially as an actively pursued goal.",
    "etymology": "De l'adverbe anglais 'well' (en bonne santé) et du suffixe '-ness'.",
    "pressExcerpt": "Outdoor walks and adequate sleep foster lifelong wellness.",
    "pressSource": "Mind UK",
    "collocations": [
      "physical wellness",
      "promote wellness",
      "overall wellness"
    ],
    "nuanceComparisons": [
      {
        "word": "Wellness",
        "distinction": "Recherche active de plénitude de santé."
      },
      {
        "word": "Illness",
        "distinction": "État pathologique de maladie."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-57-snack",
    "term": "Snack",
    "phonetic": "/snæk/",
    "level": "A2",
    "category": "Petite collation",
    "frenchDef": "Collation légère entre les repas.",
    "englishDef": "A small amount of food eaten between meals.",
    "etymology": "Du moyen néerlandais 'snacken' (mordre d'un coup rapide).",
    "pressExcerpt": "A handful of raw almonds is a wholesome afternoon snack.",
    "pressSource": "Nutrition Advice",
    "collocations": [
      "healthy snack",
      "have a snack",
      "afternoon snack"
    ],
    "nuanceComparisons": [
      {
        "word": "Snack",
        "distinction": "En-cas léger ponctuel."
      },
      {
        "word": "Feast",
        "distinction": "Grand festin copieux."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-5e-58-architect",
    "term": "Architect",
    "phonetic": "/ˈɑː.kɪ.tɛkt/",
    "level": "A2",
    "category": "Bâtiment & Conception",
    "frenchDef": "Architecte concevant bâtiments et édifices.",
    "englishDef": "A person who designs buildings and oversees their construction.",
    "etymology": "Du grec 'arkhitekton' (maître bâtisseur en chef).",
    "pressExcerpt": "The architect drew detailed blueprints for the new public library.",
    "pressSource": "Architectural Review",
    "collocations": [
      "talented architect",
      "landscape architect",
      "famous architect"
    ],
    "nuanceComparisons": [
      {
        "word": "Architect",
        "distinction": "Concepteur des plans d'édifices."
      },
      {
        "word": "Builder",
        "distinction": "Artisan maçon exécutant la construction."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-59-firefighter",
    "term": "Firefighter",
    "phonetic": "/ˈfaɪəˌfaɪ.tər/",
    "level": "A2",
    "category": "Secours",
    "frenchDef": "Sapeur-pompier sauvant des vies.",
    "englishDef": "A person whose job is to extinguish fires and rescue victims.",
    "etymology": "Composé de 'fire' (feu) et 'fighter' (combattant).",
    "pressExcerpt": "Brave firefighters rescued the trapped family from the blaze.",
    "pressSource": "BBC News",
    "collocations": [
      "brave firefighter",
      "call the firefighter",
      "volunteer firefighter"
    ],
    "nuanceComparisons": [
      {
        "word": "Firefighter",
        "distinction": "Pompier secouriste."
      },
      {
        "word": "Police officer",
        "distinction": "Policier veillant à l'ordre public."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-60-scientist",
    "term": "Scientist",
    "phonetic": "/ˈsaɪ.ən.tɪst/",
    "level": "A2",
    "category": "Recherche",
    "frenchDef": "Scientifique menant des expériences rigoureuses.",
    "englishDef": "A person studying or having expert knowledge of natural sciences.",
    "etymology": "Du latin 'scientia' (connaissance démontrée).",
    "pressExcerpt": "Marine scientists observed coral reef ecosystems under water.",
    "pressSource": "Nature",
    "collocations": [
      "research scientist",
      "leading scientist",
      "lab scientist"
    ],
    "nuanceComparisons": [
      {
        "word": "Scientist",
        "distinction": "Chercheur menant des expériences."
      },
      {
        "word": "Inventor",
        "distinction": "Créateur brevetant une invention technique."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-61-salary",
    "term": "Salary",
    "phonetic": "/ˈsæl.ər.i/",
    "level": "A2",
    "category": "Rémunération",
    "frenchDef": "Salaire mensuel rétribuant le travail.",
    "englishDef": "A fixed regular payment made by an employer to an employee.",
    "etymology": "Du latin 'salarium' (ration de sel allouée aux soldats romains).",
    "pressExcerpt": "She negotiates a fair salary corresponding to her qualifications.",
    "pressSource": "The Economist",
    "collocations": [
      "earn a salary",
      "monthly salary",
      "competitive salary"
    ],
    "nuanceComparisons": [
      {
        "word": "Salary",
        "distinction": "Rémunération fixe mensuelle."
      },
      {
        "word": "Wage",
        "distinction": "Salaire horaire ou hebdomadaire."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-62-interview",
    "term": "Interview",
    "phonetic": "/ˈɪn.tə.vjuː/",
    "level": "A2",
    "category": "Recrutement",
    "frenchDef": "Entretien d'embauche ou interview.",
    "englishDef": "A formal meeting in which an applicant is questioned for a job.",
    "etymology": "Du français 'entrevoir' (vue mutuelle face à face).",
    "pressExcerpt": "He prepared carefully for his first job interview.",
    "pressSource": "Careers UK",
    "collocations": [
      "job interview",
      "attend an interview",
      "interview questions"
    ],
    "nuanceComparisons": [
      {
        "word": "Interview",
        "distinction": "Entretien d'embauche ou médiatique."
      },
      {
        "word": "Meeting",
        "distinction": "Réunion collective de travail."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-63-task",
    "term": "Task",
    "phonetic": "/tɑːsk/",
    "level": "A2",
    "category": "Missions",
    "frenchDef": "Tâche ou mission assignée avec clarté.",
    "englishDef": "A piece of work to be done or undertaken.",
    "etymology": "Du latin médiéval 'tasca' (taxe, impôt de travail prescrit).",
    "pressExcerpt": "Organizing the files was her primary morning task.",
    "pressSource": "Workplace Hub",
    "collocations": [
      "complete a task",
      "daily task",
      "assign a task"
    ],
    "nuanceComparisons": [
      {
        "word": "Task",
        "distinction": "Tâche précise à réaliser."
      },
      {
        "word": "Career",
        "distinction": "Trajectoire professionnelle globale."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-64-apprentice",
    "term": "Apprentice",
    "phonetic": "/əˈprɛn.tɪs/",
    "level": "A2",
    "category": "Formation professionnelle",
    "frenchDef": "Apprenti apprenant un métier auprès d'un maître.",
    "englishDef": "A person learning a trade from a skilled employer.",
    "etymology": "De l’ancien français 'aprentis' (celui qui apprend).",
    "pressExcerpt": "The young apprentice learned how to forge iron gates.",
    "pressSource": "Crafts UK",
    "collocations": [
      "carpenter apprentice",
      "work as an apprentice",
      "skilled apprentice"
    ],
    "nuanceComparisons": [
      {
        "word": "Apprentice",
        "distinction": "Apprenti en formation pratique."
      },
      {
        "word": "Master",
        "distinction": "Maître d'artisanat accompli."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-5e-65-loyalty",
    "term": "Loyalty",
    "phonetic": "/ˈlɔɪ.əl.ti/",
    "level": "A2",
    "category": "Fidélité",
    "frenchDef": "Loyauté indéfectible envers ses amis.",
    "englishDef": "The quality of staying faithful to commitments and friends.",
    "etymology": "De l’ancien français 'loyal' (conforme à la loi du cœur).",
    "pressExcerpt": "True friendship is anchored in mutual trust and unshakable loyalty.",
    "pressSource": "Philosophical Studies",
    "collocations": [
      "unwavering loyalty",
      "pledge loyalty",
      "prove loyalty"
    ],
    "nuanceComparisons": [
      {
        "word": "Loyalty",
        "distinction": "Fidélité dévouée à autrui."
      },
      {
        "word": "Treachery",
        "distinction": "Trahison lâche et déloyale."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-66-empathy",
    "term": "Empathy",
    "phonetic": "/ˈɛm.pə.θi/",
    "level": "A2",
    "category": "Écoute du cœur",
    "frenchDef": "Empathie, faculté de comprendre les ressentis d'autrui.",
    "englishDef": "The ability to understand and share the feelings of another.",
    "etymology": "Du grec 'empatheia' (ressentir la passion de l'intérieur).",
    "pressExcerpt": "Showing empathy toward a newcomer helps them feel welcomed.",
    "pressSource": "Psychology Today",
    "collocations": [
      "show empathy",
      "deep empathy",
      "feel empathy"
    ],
    "nuanceComparisons": [
      {
        "word": "Empathy",
        "distinction": "Capacité à ressentir ce que vit autrui."
      },
      {
        "word": "Apathy",
        "distinction": "Indifférence froide insensible."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-67-peninsula",
    "term": "Peninsula",
    "phonetic": "/pəˈnɪn.sjʊ.lə/",
    "level": "A2",
    "category": "Géographie côtière",
    "frenchDef": "Péninsule entourée d'eau sur trois côtés.",
    "englishDef": "A piece of land almost surrounded by water or projecting into a sea.",
    "etymology": "Du latin 'paene' (presque) et 'insula' (île).",
    "pressExcerpt": "Cornwall is a dramatic peninsula jutting into the Atlantic Ocean.",
    "pressSource": "National Geographic",
    "collocations": [
      "rocky peninsula",
      "narrow peninsula",
      "inhabited peninsula"
    ],
    "nuanceComparisons": [
      {
        "word": "Peninsula",
        "distinction": "Presqu'île rattachée au continent."
      },
      {
        "word": "Island",
        "distinction": "Île entièrement entourée d'eau."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-68-border",
    "term": "Border",
    "phonetic": "/ˈbɔː.dər/",
    "level": "A2",
    "category": "Frontières",
    "frenchDef": "Frontière séparant deux territoires.",
    "englishDef": "A line separating two countries or administrative areas.",
    "etymology": "De l'ancien français 'bordure' (lisière extrême).",
    "pressExcerpt": "Peaceful borders encourage international cultural exchange.",
    "pressSource": "Geographical Magazine",
    "collocations": [
      "cross the border",
      "international border",
      "border post"
    ],
    "nuanceComparisons": [
      {
        "word": "Border",
        "distinction": "Ligne de démarcation géographique."
      },
      {
        "word": "Frontier",
        "distinction": "Zone frontière pionnière d'exploration."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-69-friendship",
    "term": "Friendship",
    "phonetic": "/ˈfrɛnd.ʃɪp/",
    "level": "A2",
    "category": "Liens précieux",
    "frenchDef": "Amitié sincère grandissant au fil des ans.",
    "englishDef": "The emotions or conduct of friends; the state of being friends.",
    "etymology": "De 'friend' (ami) et du suffixe '-ship' (état durable).",
    "pressExcerpt": "Their friendship flourished through shared study sessions and laughter.",
    "pressSource": "Teen Health",
    "collocations": [
      "close friendship",
      "lifelong friendship",
      "cherish friendship"
    ],
    "nuanceComparisons": [
      {
        "word": "Friendship",
        "distinction": "Lien d'amitié réciproque."
      },
      {
        "word": "Rivalry",
        "distinction": "Rivalité compétitive."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-70-landscape",
    "term": "Landscape",
    "phonetic": "/ˈlænd.skeɪp/",
    "level": "A2",
    "category": "Nature & Panoramas",
    "frenchDef": "Paysage champêtre ou côtier à couper le souffle.",
    "englishDef": "All the visible features of an area of land.",
    "etymology": "Du néerlandais 'landschap' (forme visible du terroir paysan).",
    "pressExcerpt": "The painter depicted the rolling green landscape of the Lake District.",
    "pressSource": "Tate Britain",
    "collocations": [
      "picturesque landscape",
      "paint a landscape",
      "rugged landscape"
    ],
    "nuanceComparisons": [
      {
        "word": "Landscape",
        "distinction": "Paysage terrestre naturel."
      },
      {
        "word": "Seascape",
        "distinction": "Marine ou paysage marin."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-71-horizon",
    "term": "Horizon",
    "phonetic": "/həˈraɪ.zən/",
    "level": "A2",
    "category": "Perspectives",
    "frenchDef": "Ligne d'horizon où le ciel semble toucher la terre.",
    "englishDef": "The line at which the earth's surface and the sky appear to meet.",
    "etymology": "Du grec 'horizōn' (cercle qui borne la vue).",
    "pressExcerpt": "A crimson sunset glowed on the distant western horizon.",
    "pressSource": "Astronomy Today",
    "collocations": [
      "on the horizon",
      "distant horizon",
      "broaden your horizons"
    ],
    "nuanceComparisons": [
      {
        "word": "Horizon",
        "distinction": "Ligne séparant ciel et terre."
      },
      {
        "word": "Zenith",
        "distinction": "Point culminant au zénith du ciel."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-5e-72-kindred",
    "term": "Kindred",
    "phonetic": "/ˈkɪn.drɪd/",
    "level": "A2",
    "category": "Affinités",
    "frenchDef": "Âme sœur partageant la même sensibilité.",
    "englishDef": "Similar in kind or temperament; related by spirit.",
    "etymology": "Du vieil anglais 'cynn' (parenté de cœur et d'esprit).",
    "pressExcerpt": "They felt like kindred spirits from the moment they met.",
    "pressSource": "Literature Classic",
    "collocations": [
      "kindred spirits",
      "kindred soul",
      "feel kindred"
    ],
    "nuanceComparisons": [
      {
        "word": "Kindred",
        "distinction": "Proximité d'esprit et d'affinités."
      },
      {
        "word": "Stranger",
        "distinction": "Personne totalement étrangère."
      }
    ],
    "gradeLevel": "5e",
    "gradeLabel": "5e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-01-commute",
    "term": "Commute",
    "phonetic": "/kəˈmjuːt/",
    "level": "A2",
    "category": "Transports urbains",
    "frenchDef": "Trajet quotidien domicile-travail ou école.",
    "englishDef": "A regular journey of some distance to and from one's place of work or study.",
    "etymology": "Du latin 'commutare' (échanger, convertir des billets d'abonnement).",
    "pressExcerpt": "Her morning commute by bicycle takes twenty brisk minutes.",
    "pressSource": "The Guardian Transport",
    "collocations": [
      "daily commute",
      "morning commute",
      "easy commute"
    ],
    "nuanceComparisons": [
      {
        "word": "Commute",
        "distinction": "Trajet régulier quotidien."
      },
      {
        "word": "Travel",
        "distinction": "Voyage ou déplacement général."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-02-responsibility",
    "term": "Responsibility",
    "phonetic": "/rɪˌspɒn.sɪˈbɪl.ə.ti/",
    "level": "A2",
    "category": "Autonomie",
    "frenchDef": "Responsabilité personnelle et engagement.",
    "englishDef": "The state or fact of having a duty to deal with something.",
    "etymology": "Du latin 'respondere' (s'engager en retour, répondre de ses actes).",
    "pressExcerpt": "Taking responsibility for homework builds mature study habits.",
    "pressSource": "Education Review",
    "collocations": [
      "accept responsibility",
      "sense of responsibility",
      "heavy responsibility"
    ],
    "nuanceComparisons": [
      {
        "word": "Responsibility",
        "distinction": "Devoir moral d'assumer ses actes."
      },
      {
        "word": "Obligation",
        "distinction": "Contrainte légale ou imposée."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-03-curfew",
    "term": "Curfew",
    "phonetic": "/ˈkɜː.fjuː/",
    "level": "A2",
    "category": "Règles familiales",
    "frenchDef": "Heure limite fixée pour rentrer le soir.",
    "englishDef": "A regulation requiring people to remain indoors between specified hours.",
    "etymology": "De l’ancien français 'couvre-feu' (éteindre le foyer la nuit).",
    "pressExcerpt": "Teenagers negotiate a weekend curfew with their parents.",
    "pressSource": "Family Life",
    "collocations": [
      "strict curfew",
      "set a curfew",
      "curfew hours"
    ],
    "nuanceComparisons": [
      {
        "word": "Curfew",
        "distinction": "Heure prescrite de rentrée au foyer."
      },
      {
        "word": "Deadline",
        "distinction": "Date d'échéance d'un projet."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-04-allowance",
    "term": "Allowance",
    "phonetic": "/əˈlaʊ.əns/",
    "level": "A2",
    "category": "Argent de poche",
    "frenchDef": "Argent de poche périodique.",
    "englishDef": "An amount of money given regularly to someone, typically a child.",
    "etymology": "De l’ancien français 'alouer' (attribuer une part légitime).",
    "pressExcerpt": "He saves part of his weekly allowance to purchase books.",
    "pressSource": "Young Economist",
    "collocations": [
      "pocket allowance",
      "monthly allowance",
      "spend an allowance"
    ],
    "nuanceComparisons": [
      {
        "word": "Allowance",
        "distinction": "Somme accordée régulièrement."
      },
      {
        "word": "Wage",
        "distinction": "Rémunération d'un travail effectif."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-05-errand",
    "term": "Errand",
    "phonetic": "/ˈɛr.ənd/",
    "level": "A2",
    "category": "Courses & Démarches",
    "frenchDef": "Course ou petite commission à faire.",
    "englishDef": "A short journey undertaken in order to deliver or collect something.",
    "etymology": "Du vieil anglais 'ǣrende' (message confié, mission confiée).",
    "pressExcerpt": "She ran an errand to the post office for her grandmother.",
    "pressSource": "BBC Life",
    "collocations": [
      "run an errand",
      "morning errand",
      "errand boy"
    ],
    "nuanceComparisons": [
      {
        "word": "Errand",
        "distinction": "Petite sortie pour une démarche utile."
      },
      {
        "word": "Trip",
        "distinction": "Voyage ou expédition d'agrément."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-06-lifestyle",
    "term": "Lifestyle",
    "phonetic": "/ˈlaɪf.staɪl/",
    "level": "A2",
    "category": "Mode de vie",
    "frenchDef": "Mode de vie sain et équilibré.",
    "englishDef": "The way in which a person or group lives.",
    "etymology": "Composé de 'life' (vie) et 'style' (manière propre).",
    "pressExcerpt": "An active outdoor lifestyle promotes lasting mental vitality.",
    "pressSource": "NHS Living",
    "collocations": [
      "healthy lifestyle",
      "active lifestyle",
      "modern lifestyle"
    ],
    "nuanceComparisons": [
      {
        "word": "Lifestyle",
        "distinction": "Manière globale de mener sa vie."
      },
      {
        "word": "Habit",
        "distinction": "Action unitaire répétée."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-07-device",
    "term": "Device",
    "phonetic": "/dɪˈvaɪs/",
    "level": "A2",
    "category": "Technologie",
    "frenchDef": "Appareil électronique ou numérique.",
    "englishDef": "A thing made or adapted for a particular purpose, especially a mechanical or electronic gadget.",
    "etymology": "De l’ancien français 'devis' (conception ingénieuse).",
    "pressExcerpt": "Pupils switch off digital devices an hour before bedtime.",
    "pressSource": "Digital Wellbeing",
    "collocations": [
      "electronic device",
      "mobile device",
      "smart device"
    ],
    "nuanceComparisons": [
      {
        "word": "Device",
        "distinction": "Appareil fonctionnel autonome."
      },
      {
        "word": "Appliance",
        "distinction": "Gros appareil électroménager."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-08-housework",
    "term": "Housework",
    "phonetic": "/ˈhaʊs.wɜːk/",
    "level": "A2",
    "category": "Ménage",
    "frenchDef": "Travaux ménagers et entretien du logis.",
    "englishDef": "Routine work in a house, such as cleaning, cooking, and washing.",
    "etymology": "Composé de 'house' (demeure) et 'work' (ouvrage).",
    "pressExcerpt": "Sharing housework equally ensures a harmonious family life.",
    "pressSource": "Home Journal",
    "collocations": [
      "do housework",
      "share housework",
      "daily housework"
    ],
    "nuanceComparisons": [
      {
        "word": "Housework",
        "distinction": "Entretien du logis (indénombrable)."
      },
      {
        "word": "Homework",
        "distinction": "Devoirs scolaires de l'élève."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-4e-09-destination",
    "term": "Destination",
    "phonetic": "/ˌdɛs.tɪˈneɪ.ʃən/",
    "level": "A2",
    "category": "Terminus",
    "frenchDef": "Destination finale d'un périple.",
    "englishDef": "The place to which someone or something is going or being sent.",
    "etymology": "Du latin 'destinare' (fixer fermement le terme d'un chemin).",
    "pressExcerpt": "Edinburgh was the final destination of our rail adventure.",
    "pressSource": "National Geographic",
    "collocations": [
      "holiday destination",
      "popular destination",
      "reach your destination"
    ],
    "nuanceComparisons": [
      {
        "word": "Destination",
        "distinction": "Lieu ultime fixé d'arrivée."
      },
      {
        "word": "Direction",
        "distinction": "Orientation cardinale suivie."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-10-cruise",
    "term": "Cruise",
    "phonetic": "/kruːz/",
    "level": "A2",
    "category": "Navigation maritime",
    "frenchDef": "Croisière maritime d'escale en escale.",
    "englishDef": "A voyage on a ship or boat taken for pleasure.",
    "etymology": "Du néerlandais 'kruisen' (croiser, sillonner les flots).",
    "pressExcerpt": "A summer cruise through the Norwegian fjords reveals magnificent waterfalls.",
    "pressSource": "Maritime Review",
    "collocations": [
      "go on a cruise",
      "ocean cruise",
      "luxury cruise"
    ],
    "nuanceComparisons": [
      {
        "word": "Cruise",
        "distinction": "Périple marin de détente."
      },
      {
        "word": "Crossing",
        "distinction": "Traversée directe d'une rive à l'autre."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-11-itinerary",
    "term": "Itinerary",
    "phonetic": "/aɪˈtɪn.ər.ər.i/",
    "level": "A2",
    "category": "Feuille de route",
    "frenchDef": "Itinéraire détaillé étape par étape.",
    "englishDef": "A planned route or journey with recorded stops.",
    "etymology": "Du latin 'iter' (chemin, marche en avant).",
    "pressExcerpt": "The travel agency provided a day-by-day itinerary of Rome.",
    "pressSource": "Lonely Planet",
    "collocations": [
      "travel itinerary",
      "plan an itinerary",
      "detailed itinerary"
    ],
    "nuanceComparisons": [
      {
        "word": "Itinerary",
        "distinction": "Programme complet des étapes."
      },
      {
        "word": "Route",
        "distinction": "Chemin ou tracé physique emprunté."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-12-customs",
    "term": "Customs",
    "phonetic": "/ˈkʌs.təmz/",
    "level": "A2",
    "category": "Contrôles",
    "frenchDef": "Douane contrôlant les entrées de marchandises.",
    "englishDef": "The official department that administers taxes on imported goods.",
    "etymology": "De l’ancien français 'costume' (taxe coutumière établie).",
    "pressExcerpt": "Travelers declared their purchases at customs before boarding.",
    "pressSource": "Border Agency UK",
    "collocations": [
      "clear customs",
      "customs officer",
      "through customs"
    ],
    "nuanceComparisons": [
      {
        "word": "Customs",
        "distinction": "Contrôle des marchandises et taxes."
      },
      {
        "word": "Immigration",
        "distinction": "Contrôle des personnes et passeports."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-13-railway",
    "term": "Railway",
    "phonetic": "/ˈreɪl.weɪ/",
    "level": "A2",
    "category": "Réseau ferré",
    "frenchDef": "Chemin de fer et réseau ferré national.",
    "englishDef": "A track made of steel rails along which trains run.",
    "etymology": "Composé de 'rail' (barre de métal) et 'way' (voie).",
    "pressExcerpt": "Britain's historic railway connects bustling cities to remote villages.",
    "pressSource": "Railway Magazine",
    "collocations": [
      "scenic railway",
      "railway network",
      "travel by railway"
    ],
    "nuanceComparisons": [
      {
        "word": "Railway",
        "distinction": "Réseau et voies ferrées."
      },
      {
        "word": "Train",
        "distinction": "Le convoi roulant lui-même."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-14-accommodation",
    "term": "Accommodation",
    "phonetic": "/əˌkɒm.əˈdeɪ.ʃən/",
    "level": "A2",
    "category": "Hébergement",
    "frenchDef": "Hébergement hôtelier ou gîte.",
    "englishDef": "A room, group of rooms, or building in which someone may live or stay.",
    "etymology": "Du latin 'accommodare' (adapter pour rendre commode).",
    "pressExcerpt": "The student hostel offered clean and comfortable accommodation.",
    "pressSource": "Travel World",
    "collocations": [
      "book accommodation",
      "overnight accommodation",
      "student accommodation"
    ],
    "nuanceComparisons": [
      {
        "word": "Accommodation",
        "distinction": "Hébergement touristique (indénombrable)."
      },
      {
        "word": "Hotel",
        "distinction": "Établissement hôtelier spécifique."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-15-voyage",
    "term": "Voyage",
    "phonetic": "/ˈvɔɪ.ɪdʒ/",
    "level": "A2",
    "category": "Grandes traversées",
    "frenchDef": "Voyage maritime au long cours.",
    "englishDef": "A long journey involving travel by sea or in space.",
    "etymology": "Du latin 'viaticum' (provisions de route pour le chemin).",
    "pressExcerpt": "The historic voyage of the Mayflower crossed the stormy Atlantic.",
    "pressSource": "Historic England",
    "collocations": [
      "ocean voyage",
      "maiden voyage",
      "perilous voyage"
    ],
    "nuanceComparisons": [
      {
        "word": "Voyage",
        "distinction": "Longue expédition maritime."
      },
      {
        "word": "Flight",
        "distinction": "Vol aérien."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-4e-16-revolution",
    "term": "Revolution",
    "phonetic": "/ˌrɛv.əˈluː.ʃən/",
    "level": "A2",
    "category": "Grandes mutations",
    "frenchDef": "Révolution politique ou industrielle majeure.",
    "englishDef": "A forcible overthrow of a government or social order in favor of a new system.",
    "etymology": "Du latin 'revolvere' (accomplir un cycle complet, tourner).",
    "pressExcerpt": "The Industrial Revolution transformed British cities and manufacturing.",
    "pressSource": "BBC History",
    "collocations": [
      "industrial revolution",
      "spark a revolution",
      "glorious revolution"
    ],
    "nuanceComparisons": [
      {
        "word": "Revolution",
        "distinction": "Bouleversement structurel profond."
      },
      {
        "word": "Rebellion",
        "distinction": "Insurrection armée ponctuelle."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-17-monarch",
    "term": "Monarch",
    "phonetic": "/ˈmɒn.ək/",
    "level": "A2",
    "category": "Souveraineté",
    "frenchDef": "Monarque régnant sur la nation.",
    "englishDef": "A sovereign head of state, especially a king, queen, or emperor.",
    "etymology": "Du grec 'monarkhēs' (celui qui gouverne seul pour le bien commun).",
    "pressExcerpt": "Queen Elizabeth I was a powerful Tudor monarch of Great Britain.",
    "pressSource": "Royal Archives",
    "collocations": [
      "reigning monarch",
      "British monarch",
      "crown a monarch"
    ],
    "nuanceComparisons": [
      {
        "word": "Monarch",
        "distinction": "Chef d'État héréditaire."
      },
      {
        "word": "President",
        "distinction": "Chef d'État républicain élu."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-18-heritage",
    "term": "Heritage",
    "phonetic": "/ˈhɛr.ɪ.tɪdʒ/",
    "level": "A2",
    "category": "Transmission",
    "frenchDef": "Patrimoine culturel hérité des générations passées.",
    "englishDef": "Valued objects and qualities passed down from previous generations.",
    "etymology": "Du latin 'heres' (héritier légitime des ancêtres).",
    "pressExcerpt": "Ancient castles and folklore constitute our living national heritage.",
    "pressSource": "English Heritage",
    "collocations": [
      "cultural heritage",
      "world heritage",
      "protect our heritage"
    ],
    "nuanceComparisons": [
      {
        "word": "Heritage",
        "distinction": "Héritage immatériel et historique."
      },
      {
        "word": "Inheritance",
        "distinction": "Succession financière privée."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-19-fortress",
    "term": "Fortress",
    "phonetic": "/ˈfɔː.trəs/",
    "level": "A2",
    "category": "Défense",
    "frenchDef": "Forteresse imprenable aux remparts épais.",
    "englishDef": "A military stronghold, especially a strongly fortified town.",
    "etymology": "Du latin 'fortis' (fort, vaillant, puissant).",
    "pressExcerpt": "The stone fortress withstood multiple sieges during the civil war.",
    "pressSource": "Military History",
    "collocations": [
      "ancient fortress",
      "impenetrable fortress",
      "defend a fortress"
    ],
    "nuanceComparisons": [
      {
        "word": "Fortress",
        "distinction": "Place forte militaire stratégique."
      },
      {
        "word": "Manor",
        "distinction": "Manoir résidentiel de campagne."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-20-civilization",
    "term": "Civilization",
    "phonetic": "/ˌsɪv.ɪ.laɪˈzeɪ.ʃən/",
    "level": "A2",
    "category": "Cultures antiques",
    "frenchDef": "Civilisation humaine développée.",
    "englishDef": "The stage of human social and cultural development and organization that is considered most advanced.",
    "etymology": "Du latin 'civilis' (propre au citoyen de la cité).",
    "pressExcerpt": "The Indus Valley civilization flourished thousands of years ago.",
    "pressSource": "Smithsonian Magazine",
    "collocations": [
      "ancient civilization",
      "modern civilization",
      "cradle of civilization"
    ],
    "nuanceComparisons": [
      {
        "word": "Civilization",
        "distinction": "Culture et société organisée complexe."
      },
      {
        "word": "Barbarism",
        "distinction": "État sauvage sans institutions."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-21-treaty",
    "term": "Treaty",
    "phonetic": "/ˈtriː.ti/",
    "level": "A2",
    "category": "Diplomatie",
    "frenchDef": "Traité de paix ratifié entre puissances.",
    "englishDef": "A formally concluded and ratified agreement between states.",
    "etymology": "Du latin 'tractatus' (négociation discutée pas à pas).",
    "pressExcerpt": "Diplomats signed a peace treaty concluding decades of conflict.",
    "pressSource": "Foreign Affairs",
    "collocations": [
      "sign a treaty",
      "peace treaty",
      "bilateral treaty"
    ],
    "nuanceComparisons": [
      {
        "word": "Treaty",
        "distinction": "Accord officiel international signé."
      },
      {
        "word": "Pact",
        "distinction": "Pacte d'assistance mutuelle."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-22-dynasty",
    "term": "Dynasty",
    "phonetic": "/ˈdɪn.ə.sti/",
    "level": "A2",
    "category": "Lignées royales",
    "frenchDef": "Dynastie régnante de souverains successifs.",
    "englishDef": "A line of hereditary rulers of a country.",
    "etymology": "Du grec 'dynasteia' (seigneurie, pouvoir souverain).",
    "pressExcerpt": "The Tudor dynasty left an enduring mark on English literature and law.",
    "pressSource": "British History Review",
    "collocations": [
      "ruling dynasty",
      "ancient dynasty",
      "dynasty ended"
    ],
    "nuanceComparisons": [
      {
        "word": "Dynasty",
        "distinction": "Lignée héréditaire de souverains."
      },
      {
        "word": "Regime",
        "distinction": "Système d'administration politique."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-4e-23-exhibition",
    "term": "Exhibition",
    "phonetic": "/ˌɛk.sɪˈbɪʃ.ən/",
    "level": "A2",
    "category": "Expositions",
    "frenchDef": "Exposition artistique ouverte au public.",
    "englishDef": "A public display of works of art or items of interest held in an art gallery.",
    "etymology": "Du latin 'exhibere' (montrer, mettre sous les yeux de tous).",
    "pressExcerpt": "The gallery inaugurated a breathtaking exhibition of Impressionist landscapes.",
    "pressSource": "Tate Review",
    "collocations": [
      "art exhibition",
      "attend an exhibition",
      "temporary exhibition"
    ],
    "nuanceComparisons": [
      {
        "word": "Exhibition",
        "distinction": "Présentation publique d'œuvres."
      },
      {
        "word": "Fair",
        "distinction": "Foire commerciale ou foire attractive."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-24-craftsmanship",
    "term": "Craftsmanship",
    "phonetic": "/ˈkrɑːfts.mən.ʃɪp/",
    "level": "A2",
    "category": "Savoir-faire",
    "frenchDef": "Savoir-faire artisanal d'excellence.",
    "englishDef": "The quality of design and work shown in something made by hand.",
    "etymology": "De 'craft' (art) et 'man' (homme de métier).",
    "pressExcerpt": "The antique oak table reveals remarkable eighteenth-century craftsmanship.",
    "pressSource": "Crafts Council",
    "collocations": [
      "fine craftsmanship",
      "master craftsmanship",
      "admire craftsmanship"
    ],
    "nuanceComparisons": [
      {
        "word": "Craftsmanship",
        "distinction": "Maîtrise manuelle experte."
      },
      {
        "word": "Mass production",
        "distinction": "Fabrication à la chaîne."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-25-screenplay",
    "term": "Screenplay",
    "phonetic": "/ˈskriːn.pleɪ/",
    "level": "A2",
    "category": "Cinéma",
    "frenchDef": "Scénario écrit d'un long métrage.",
    "englishDef": "The script of a film, including acting instructions and scene directions.",
    "etymology": "De 'screen' (écran de cinéma) et 'play' (pièce écrite).",
    "pressExcerpt": "He submitted his original screenplay to the Edinburgh Film Festival.",
    "pressSource": "Screen Daily",
    "collocations": [
      "write a screenplay",
      "adapted screenplay",
      "award-winning screenplay"
    ],
    "nuanceComparisons": [
      {
        "word": "Screenplay",
        "distinction": "Scénario détaillé pour le cinéma."
      },
      {
        "word": "Play",
        "distinction": "Pièce conçue pour la scène théâtrale."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-26-pottery",
    "term": "Pottery",
    "phonetic": "/ˈpɒt.ər.i/",
    "level": "A2",
    "category": "Art du tour",
    "frenchDef": "Poterie façonnée au tour d'argile.",
    "englishDef": "Pots, dishes, and other articles made of fired clay.",
    "etymology": "De l’ancien français 'potier' (façonneur de pots).",
    "pressExcerpt": "She shaped a graceful vase on the spinning pottery wheel.",
    "pressSource": "Crafts Today",
    "collocations": [
      "traditional pottery",
      "pottery studio",
      "handcrafted pottery"
    ],
    "nuanceComparisons": [
      {
        "word": "Pottery",
        "distinction": "Vases et poteries en terre cuite."
      },
      {
        "word": "Glassblowing",
        "distinction": "Art du verre soufflé à la canne."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-27-design",
    "term": "Design",
    "phonetic": "/dɪˈzaɪn/",
    "level": "A2",
    "category": "Création graphique",
    "frenchDef": "Conception esthétique et fonctionnelle.",
    "englishDef": "A plan or drawing produced to show the look and function of an object.",
    "etymology": "Du latin 'designare' (marquer d'un signe distinctif).",
    "pressExcerpt": "Scandinavian furniture design combines elegance with everyday ergonomics.",
    "pressSource": "Architectural Digest",
    "collocations": [
      "graphic design",
      "modern design",
      "innovative design"
    ],
    "nuanceComparisons": [
      {
        "word": "Design",
        "distinction": "Conception alliant forme et fonction."
      },
      {
        "word": "Decoration",
        "distinction": "Simple embellissement ornemental."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-28-improvisation",
    "term": "Improvisation",
    "phonetic": "/ˌɪm.prə.vaɪˈzeɪ.ʃən/",
    "level": "A2",
    "category": "Créativité spontanée",
    "frenchDef": "Improvisation spontanée sur scène.",
    "englishDef": "The activity of making or doing something not planned beforehand.",
    "etymology": "Du latin 'improvisus' (imprévu, sans préparation préalable).",
    "pressExcerpt": "Jazz music thrives on thrilling instrumental improvisation.",
    "pressSource": "DownBeat Magazine",
    "collocations": [
      "master improvisation",
      "theatrical improvisation",
      "musical improvisation"
    ],
    "nuanceComparisons": [
      {
        "word": "Improvisation",
        "distinction": "Création spontanée en direct."
      },
      {
        "word": "Choreography",
        "distinction": "Enchaînement de pas minutieusement réglé."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-29-masterwork",
    "term": "Masterwork",
    "phonetic": "/ˈmɑː.stə.wɜːk/",
    "level": "A2",
    "category": "Chefs-d'œuvre",
    "frenchDef": "Chef-d'œuvre salué par la critique.",
    "englishDef": "A work of outstanding artistry or skill; a magnum opus.",
    "etymology": "De 'master' (maître) et 'work' (ouvrage).",
    "pressExcerpt": "Turner's seascape is celebrated as a romantic masterwork.",
    "pressSource": "Tate Britain",
    "collocations": [
      "artistic masterwork",
      "create a masterwork",
      "literary masterwork"
    ],
    "nuanceComparisons": [
      {
        "word": "Masterwork",
        "distinction": "Œuvre majeure d'un maître."
      },
      {
        "word": "Draft",
        "distinction": "Brouillon préparatoire."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-4e-30-competitor",
    "term": "Competitor",
    "phonetic": "/kəmˈpɛt.ɪ.tər/",
    "level": "A2",
    "category": "Adversaires de jeu",
    "frenchDef": "Concurrent dans une épreuve sportive.",
    "englishDef": "A person who takes part in an athletic contest or game.",
    "etymology": "Du latin 'competere' (chercher ensemble le même honneur).",
    "pressExcerpt": "Each competitor bowed politely to their opponent before the match.",
    "pressSource": "Olympic Review",
    "collocations": [
      "fierce competitor",
      "athletic competitor",
      "respect your competitor"
    ],
    "nuanceComparisons": [
      {
        "word": "Competitor",
        "distinction": "Participant actif à une compétition."
      },
      {
        "word": "Spectator",
        "distinction": "Personne assistant en tribune."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-31-agility",
    "term": "Agility",
    "phonetic": "/əˈdʒɪl.ə.ti/",
    "level": "A2",
    "category": "Souplesse & Vitesse",
    "frenchDef": "Agilité et vivacité corporelle.",
    "englishDef": "The ability to move quickly and easily with poise.",
    "etymology": "Du latin 'agilitas' (promptitude au mouvement souple).",
    "pressExcerpt": "Gymnasts develop exceptional agility through daily core balance training.",
    "pressSource": "Gymnastics World",
    "collocations": [
      "physical agility",
      "remarkable agility",
      "test your agility"
    ],
    "nuanceComparisons": [
      {
        "word": "Agility",
        "distinction": "Vivacité et souplesse corporelle."
      },
      {
        "word": "Brute force",
        "distinction": "Force brute musculaire lourde."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-32-stadium",
    "term": "Stadium",
    "phonetic": "/ˈsteɪ.di.əm/",
    "level": "A2",
    "category": "Arènes sportives",
    "frenchDef": "Grand stade doté de tribunes circulaires.",
    "englishDef": "An athletic ground with tiers of seats for spectators.",
    "etymology": "Du grec 'stadion' (mesure de longueur de course de 600 pieds).",
    "pressExcerpt": "Sixty thousand cheering fans packed the Wembley stadium.",
    "pressSource": "BBC Sport",
    "collocations": [
      "national stadium",
      "fill the stadium",
      "stadium seats"
    ],
    "nuanceComparisons": [
      {
        "word": "Stadium",
        "distinction": "Grand stade sportif pour foules."
      },
      {
        "word": "Arena",
        "distinction": "Salle omnisports couverte."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-33-coach",
    "term": "Coach",
    "phonetic": "/kəʊtʃ/",
    "level": "A2",
    "category": "Entraînement",
    "frenchDef": "Entraîneur guidant les performances de l'équipe.",
    "englishDef": "An athletic instructor or trainer in sport.",
    "etymology": "Du hongrois 'Kocs' (voiture de diligence menant les passagers à bon port).",
    "pressExcerpt": "The head coach devised a clever defensive tactical plan.",
    "pressSource": "The Athletic",
    "collocations": [
      "head coach",
      "team coach",
      "listen to the coach"
    ],
    "nuanceComparisons": [
      {
        "word": "Coach",
        "distinction": "Entraîneur technique et tactique."
      },
      {
        "word": "Manager",
        "distinction": "Directeur administratif du club."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-34-perseverance",
    "term": "Perseverance",
    "phonetic": "/ˌpɜː.sɪˈvɪə.rəns/",
    "level": "A2",
    "category": "Ténacité",
    "frenchDef": "Persévérance inébranlable dans l'effort.",
    "englishDef": "Persistence in doing something despite difficulty or delay in achieving success.",
    "etymology": "Du latin 'perseverantia' (rester ferme jusqu'au bout).",
    "pressExcerpt": "Through relentless perseverance, the runner finished her marathon.",
    "pressSource": "Runners World",
    "collocations": [
      "unwavering perseverance",
      "show perseverance",
      "triumph through perseverance"
    ],
    "nuanceComparisons": [
      {
        "word": "Perseverance",
        "distinction": "Effort soutenu face aux obstacles."
      },
      {
        "word": "Obstinacy",
        "distinction": "Entêtement stérile et aveugle."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-35-record",
    "term": "Record",
    "phonetic": "/ˈrɛk.ɔːd/",
    "level": "A2",
    "category": "Prouesses",
    "frenchDef": "Record battant les performances passées.",
    "englishDef": "The best achievement in an athletic contest or sport.",
    "etymology": "Du latin 'recordari' (garder en mémoire le meilleur exploit).",
    "pressExcerpt": "The sprinter broke the national record by two tenths of a second.",
    "pressSource": "Athletics Weekly",
    "collocations": [
      "break a record",
      "world record",
      "hold the record"
    ],
    "nuanceComparisons": [
      {
        "word": "Record",
        "distinction": "Meilleure performance enregistrée."
      },
      {
        "word": "Average",
        "distinction": "Moyenne statistique ordinaire."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-36-dedication",
    "term": "Dedication",
    "phonetic": "/ˌdɛd.ɪˈkeɪ.ʃən/",
    "level": "A2",
    "category": "Engagement",
    "frenchDef": "Dévouement total à sa discipline.",
    "englishDef": "The quality of being dedicated or committed to a task or purpose.",
    "etymology": "Du latin 'dedicare' (vouer entièrement par serment).",
    "pressExcerpt": "Reaching professional athletics requires years of silent dedication.",
    "pressSource": "Sports Monthly",
    "collocations": [
      "total dedication",
      "demonstrate dedication",
      "athlete's dedication"
    ],
    "nuanceComparisons": [
      {
        "word": "Dedication",
        "distinction": "Engagement sincère et continu."
      },
      {
        "word": "Dilettantism",
        "distinction": "Pratique superficielle sans passion réelle."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-4e-37-symphony",
    "term": "Symphony",
    "phonetic": "/ˈsɪm.fə.ni/",
    "level": "A2",
    "category": "Grands orchestres",
    "frenchDef": "Symphonie orchestrale en quatre mouvements.",
    "englishDef": "An elaborate musical composition for full orchestra.",
    "etymology": "Du grec 'symphōnia' (accord parfait des sonorités ensemble).",
    "pressExcerpt": "Beethoven composed his Ninth Symphony in complete physical deafness.",
    "pressSource": "Classic FM",
    "collocations": [
      "choral symphony",
      "conduct a symphony",
      "classical symphony"
    ],
    "nuanceComparisons": [
      {
        "word": "Symphony",
        "distinction": "Œuvre majeure pour orchestre complet."
      },
      {
        "word": "Sonata",
        "distinction": "Pièce pour soliste ou duo instrumental."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-38-acoustic",
    "term": "Acoustic",
    "phonetic": "/əˈkuː.stɪk/",
    "level": "A2",
    "category": "Sonorités pures",
    "frenchDef": "Acoustique naturelle sans amplification électrique.",
    "englishDef": "Relating to sound or the sense of hearing; not electric.",
    "etymology": "Du grec 'akoustikos' (relatif à l'écoute et à l'ouïe).",
    "pressExcerpt": "The concert hall features wood paneling delivering warm acoustic resonance.",
    "pressSource": "Sound & Stage",
    "collocations": [
      "acoustic guitar",
      "hall acoustics",
      "acoustic performance"
    ],
    "nuanceComparisons": [
      {
        "word": "Acoustic",
        "distinction": "Son naturel non amplifié."
      },
      {
        "word": "Electronic",
        "distinction": "Son généré par synthétiseur ou ampli."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-39-tempo",
    "term": "Tempo",
    "phonetic": "/ˈtɛm.pəʊ/",
    "level": "A2",
    "category": "Vitesse du rythme",
    "frenchDef": "Tempo mesurant la cadence métronomique.",
    "englishDef": "The speed at which a passage of music is played.",
    "etymology": "De l’italien 'tempo' (le temps musical battu).",
    "pressExcerpt": "The conductor accelerated the tempo toward a triumphant finale.",
    "pressSource": "Symphony Magazine",
    "collocations": [
      "fast tempo",
      "allegro tempo",
      "maintain the tempo"
    ],
    "nuanceComparisons": [
      {
        "word": "Tempo",
        "distinction": "Vitesse d'exécution des mesures."
      },
      {
        "word": "Pitch",
        "distinction": "Hauteur de la note : aiguë ou grave."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-40-opera",
    "term": "Opera",
    "phonetic": "/ˈɒp.ər.ə/",
    "level": "A2",
    "category": "Art lyrique",
    "frenchDef": "Opéra dramatique mêlant chant, orchestre et décor.",
    "englishDef": "A dramatic work in one or more acts, set to music for singers.",
    "etymology": "De l’italien 'opera' (grand ouvrage artistique d'art total).",
    "pressExcerpt": "The Royal Opera House hosted a thrilling production of Carmen.",
    "pressSource": "The Times Arts",
    "collocations": [
      "grand opera",
      "attend the opera",
      "opera house"
    ],
    "nuanceComparisons": [
      {
        "word": "Opera",
        "distinction": "Drame entièrement chanté sur scène."
      },
      {
        "word": "Musical",
        "distinction": "Comédie musicale mêlant répliques parlées et danses."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-41-ballad",
    "term": "Ballad",
    "phonetic": "/ˈbæl.əd/",
    "level": "A2",
    "category": "Poésie chantée",
    "frenchDef": "Ballade poétique narrant une histoire poignante.",
    "englishDef": "A poem or song narrating a story in short stanzas.",
    "etymology": "De l’ancien provençal 'ballada' (chanson pour danser).",
    "pressExcerpt": "The minstrel strummed a nostalgic folk ballad about mountain travelers.",
    "pressSource": "Folk Music UK",
    "collocations": [
      "folk ballad",
      "sing a ballad",
      "romantic ballad"
    ],
    "nuanceComparisons": [
      {
        "word": "Ballad",
        "distinction": "Chant poétique narratif."
      },
      {
        "word": "Anthem",
        "distinction": "Hymne patriotique solennel."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-42-audition",
    "term": "Audition",
    "phonetic": "/ɔːˈdɪʃ.ən/",
    "level": "A2",
    "category": "Sélections d'artistes",
    "frenchDef": "Audition d'essai devant un jury de sélection.",
    "englishDef": "An interview for a role on stage or in an orchestra.",
    "etymology": "Du latin 'audire' (écouter attentivement pour juger).",
    "pressExcerpt": "Dozens of hopeful violists attended the national youth audition.",
    "pressSource": "Musicians Union",
    "collocations": [
      "pass an audition",
      "audition for a role",
      "nervous audition"
    ],
    "nuanceComparisons": [
      {
        "word": "Audition",
        "distinction": "Épreuve de sélection artistique."
      },
      {
        "word": "Concert",
        "distinction": "Performance publique rémunérée."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-43-genre",
    "term": "Genre",
    "phonetic": "/ˈʒɒn.rə/",
    "level": "A2",
    "category": "Styles artistiques",
    "frenchDef": "Genre musical ou littéraire caractérisé.",
    "englishDef": "A category of artistic, musical, or literary composition.",
    "etymology": "Du latin 'genus' (famille, espèce, sorte ordonnée).",
    "pressExcerpt": "Jazz and baroque are distinct genres requiring different interpretive phrasing.",
    "pressSource": "Musicology Today",
    "collocations": [
      "musical genre",
      "explore a genre",
      "popular genre"
    ],
    "nuanceComparisons": [
      {
        "word": "Genre",
        "distinction": "Catégorie stylistique codifiée."
      },
      {
        "word": "Medium",
        "distinction": "Support matériel de l'art (huile, marbre)."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-4e-44-delicacy",
    "term": "Delicacy",
    "phonetic": "/ˈdɛl.ɪ.kə.si/",
    "level": "A2",
    "category": "Mets raffinés",
    "frenchDef": "Mets raffiné d'une grande rareté gastronomique.",
    "englishDef": "Something delightful or pleasing, especially a choice food.",
    "etymology": "Du latin 'deliciae' (délices, volupté du goût).",
    "pressExcerpt": "Smoked Scottish salmon is considered a holiday delicacy across Europe.",
    "pressSource": "Good Food Guide",
    "collocations": [
      "rare delicacy",
      "culinary delicacy",
      "sample a delicacy"
    ],
    "nuanceComparisons": [
      {
        "word": "Delicacy",
        "distinction": "Spécialité raffinée et prisée."
      },
      {
        "word": "Staple",
        "distinction": "Aliment de base quotidien ordinaire."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-45-gourmet",
    "term": "Gourmet",
    "phonetic": "/ˈɡʊə.meɪ/",
    "level": "A2",
    "category": "Haute cuisine",
    "frenchDef": "Gourmet appréciant la gastronomie fine.",
    "englishDef": "A connoisseur of good food; a person with a refined palate.",
    "etymology": "De l’ancien français 'gourmet' (valet de sommelier connaisseur de crus).",
    "pressExcerpt": "The boutique hotel operates an award-winning gourmet restaurant.",
    "pressSource": "Michelin Guide",
    "collocations": [
      "gourmet meal",
      "gourmet chef",
      "gourmet ingredients"
    ],
    "nuanceComparisons": [
      {
        "word": "Gourmet",
        "distinction": "Amateur éclairé de mets fins."
      },
      {
        "word": "Glutton",
        "distinction": "Glouton mangeant sans discernement."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-46-feast",
    "term": "Feast",
    "phonetic": "/fiːst/",
    "level": "A2",
    "category": "Festins",
    "frenchDef": "Festin généreux réunissant les proches.",
    "englishDef": "A large meal, typically in celebration of something.",
    "etymology": "Du latin 'festa' (jours de réjouissances sacrées).",
    "pressExcerpt": "Neighbors gathered around the long harvest feast table.",
    "pressSource": "Country Living",
    "collocations": [
      "bountiful feast",
      "harvest feast",
      "prepare a feast"
    ],
    "nuanceComparisons": [
      {
        "word": "Feast",
        "distinction": "Grand repas copieux de fête."
      },
      {
        "word": "Fasting",
        "distinction": "Période de jeûne volontaire."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-47-recipe",
    "term": "Recipe",
    "phonetic": "/ˈrɛs.ɪ.pi/",
    "level": "A2",
    "category": "Fiches cuisine",
    "frenchDef": "Recette culinaire avec ingrédients et dosages.",
    "englishDef": "A set of instructions for preparing a particular dish.",
    "etymology": "Du latin 'recipe' (prends ceci : formule d'ordonnance d'apothicaire).",
    "pressExcerpt": "Grandmother shared her secret recipe for traditional gingerbread.",
    "pressSource": "BBC Food",
    "collocations": [
      "follow a recipe",
      "secret recipe",
      "recipe book"
    ],
    "nuanceComparisons": [
      {
        "word": "Recipe",
        "distinction": "Instructions culinaires."
      },
      {
        "word": "Prescription",
        "distinction": "Ordonnance médicale délivrée par un médecin."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-48-caterer",
    "term": "Caterer",
    "phonetic": "/ˈkeɪ.tər.ər/",
    "level": "A2",
    "category": "Traiteurs",
    "frenchDef": "Traiteur organisant réceptions et buffets.",
    "englishDef": "A person or company providing food and drink at social events.",
    "etymology": "De l’ancien français 'acater' (acheter les vivres nécessaires).",
    "pressExcerpt": "The wedding caterer assembled an impressive tower of French macarons.",
    "pressSource": "Hospitality Review",
    "collocations": [
      "hire a caterer",
      "event caterer",
      "professional caterer"
    ],
    "nuanceComparisons": [
      {
        "word": "Caterer",
        "distinction": "Fournisseur de repas événementiels."
      },
      {
        "word": "Customer",
        "distinction": "Client consommateur."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-49-ambiance",
    "term": "Ambiance",
    "phonetic": "/ˌɒm.biˈɒns/",
    "level": "A2",
    "category": "Atmosphère",
    "frenchDef": "Ambiance feutrée et chaleureuse du lieu.",
    "englishDef": "The character and atmosphere of a place.",
    "etymology": "Du latin 'ambire' (ce qui entoure et enveloppe l'espace).",
    "pressExcerpt": "Soft candlelight and quiet jazz created an enchanting dining ambiance.",
    "pressSource": "Restaurant World",
    "collocations": [
      "warm ambiance",
      "restaurant ambiance",
      "cozy ambiance"
    ],
    "nuanceComparisons": [
      {
        "word": "Ambiance",
        "distinction": "Atmosphère émotionnelle d'un lieu."
      },
      {
        "word": "Decor",
        "distinction": "Décoration matérielle du mobilier."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-50-savor",
    "term": "Savor",
    "phonetic": "/ˈseɪ.vər/",
    "level": "A2",
    "category": "Dégustation",
    "frenchDef": "Savourer lentement avec délectation.",
    "englishDef": "Taste good food and enjoy it completely without haste.",
    "etymology": "Du latin 'sapere' (avoir du goût, être plein de discernement).",
    "pressExcerpt": "Take time to savor the delicate balance of herbs in the broth.",
    "pressSource": "Gastronomy Today",
    "collocations": [
      "savor every bite",
      "savor the moment",
      "savor the flavor"
    ],
    "nuanceComparisons": [
      {
        "word": "Savor",
        "distinction": "Déguster avec conscience et lenteur."
      },
      {
        "word": "Devour",
        "distinction": "Dévorer avec précipitation."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-4e-51-organic",
    "term": "Organic",
    "phonetic": "/ɔːˈɡæn.ɪk/",
    "level": "A2",
    "category": "Agriculture bio",
    "frenchDef": "Biologique, cultivé sans pesticides de synthèse.",
    "englishDef": "Produced without the use of chemical fertilizers or synthetic pesticides.",
    "etymology": "Du grec 'organikos' (relatif aux organes vivants naturels).",
    "pressExcerpt": "She prefers organic apples and carrots from the local farmer's market.",
    "pressSource": "Soil Association",
    "collocations": [
      "organic food",
      "organic farming",
      "certified organic"
    ],
    "nuanceComparisons": [
      {
        "word": "Organic",
        "distinction": "Issu de l'agriculture biologique certifiée."
      },
      {
        "word": "Processed",
        "distinction": "Aliment transformé industriellement."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-52-hydration",
    "term": "Hydration",
    "phonetic": "/haɪˈdreɪ.ʃən/",
    "level": "A2",
    "category": "Boire de l'eau",
    "frenchDef": "Hydratation régulière de l'organisme.",
    "englishDef": "The process of providing an adequate amount of water to body tissues.",
    "etymology": "Du grec 'hydōr' (eau vive).",
    "pressExcerpt": "Proper hydration prevents fatigue and supports cognitive performance.",
    "pressSource": "Sports Nutrition",
    "collocations": [
      "maintain hydration",
      "adequate hydration",
      "optimum hydration"
    ],
    "nuanceComparisons": [
      {
        "word": "Hydration",
        "distinction": "Ravitaillement régulier en eau."
      },
      {
        "word": "Dehydration",
        "distinction": "Déshydratation dangereuse."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-53-workout",
    "term": "Workout",
    "phonetic": "/ˈwɜːk.aʊt/",
    "level": "A2",
    "category": "Exercice physique",
    "frenchDef": "Séance d'entraînement physique complète.",
    "englishDef": "A session of vigorous physical exercise or training.",
    "etymology": "Composé de 'work' (travailler le corps) et 'out'.",
    "pressExcerpt": "A twenty-minute morning workout wakes up muscle groups and boosts metabolism.",
    "pressSource": "Fitness Journal",
    "collocations": [
      "daily workout",
      "cardio workout",
      "finish a workout"
    ],
    "nuanceComparisons": [
      {
        "word": "Workout",
        "distinction": "Séance d'exercices physiques ciblés."
      },
      {
        "word": "Rest",
        "distinction": "Période d'inactivité et de repos."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-54-wholesome",
    "term": "Wholesome",
    "phonetic": "/ˈhəʊl.səm/",
    "level": "A2",
    "category": "Sain & Bienfaisant",
    "frenchDef": "Sain, bénéfique pour la santé du corps.",
    "englishDef": "Conducive to or suggestive of good health and physical well-being.",
    "etymology": "Du moyen anglais 'hōl' (entier, sain) et suffixe '-some'.",
    "pressExcerpt": "Oatmeal topped with fresh blueberries provides a wholesome breakfast.",
    "pressSource": "Nutrition Review",
    "collocations": [
      "wholesome food",
      "wholesome meal",
      "healthy and wholesome"
    ],
    "nuanceComparisons": [
      {
        "word": "Wholesome",
        "distinction": "Naturellement sain et fortifiant."
      },
      {
        "word": "Harmful",
        "distinction": "Nocif pour l'organisme."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-55-calorie",
    "term": "Calorie",
    "phonetic": "/ˈkæl.ər.i/",
    "level": "A2",
    "category": "Énergie alimentaire",
    "frenchDef": "Calorie mesurant la valeur énergétique des mets.",
    "englishDef": "A unit of energy used to measure the energy value of foods.",
    "etymology": "Du latin 'calor' (chaleur).",
    "pressExcerpt": "Vegetables provide essential micronutrients with very few calories.",
    "pressSource": "Medical News Today",
    "collocations": [
      "burn calories",
      "calorie intake",
      "low in calories"
    ],
    "nuanceComparisons": [
      {
        "word": "Calorie",
        "distinction": "Unité de mesure de l'énergie des aliments."
      },
      {
        "word": "Joule",
        "distinction": "Unité physique d'énergie du système international."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-56-stamina",
    "term": "Stamina",
    "phonetic": "/ˈstæm.ɪ.nə/",
    "level": "A2",
    "category": "Résistance",
    "frenchDef": "Endurance et vigueur durable.",
    "englishDef": "The ability to sustain prolonged physical or mental effort.",
    "etymology": "Du latin 'stamina' (les fils de la vie filés par les Parques).",
    "pressExcerpt": "Long-distance cycling builds muscular stamina and heart health.",
    "pressSource": "Runners World",
    "collocations": [
      "build stamina",
      "physical stamina",
      "test your stamina"
    ],
    "nuanceComparisons": [
      {
        "word": "Stamina",
        "distinction": "Énergie de longue haleine soutenue."
      },
      {
        "word": "Sprint",
        "distinction": "Vitesse explosive sur quelques secondes."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-57-immune",
    "term": "Immune",
    "phonetic": "/ɪˈmjuːn/",
    "level": "A2",
    "category": "Défenses naturelles",
    "frenchDef": "Immunitaire, protégeant l'organisme des germes.",
    "englishDef": "Resistant to a particular infection or toxin owing to the presence of antibodies.",
    "etymology": "Du latin 'immunis' (exempt de charge, protégé).",
    "pressExcerpt": "Adequate sleep and vitamin D strengthen the body's immune system.",
    "pressSource": "WHO Health Report",
    "collocations": [
      "immune system",
      "boost immunity",
      "immune response"
    ],
    "nuanceComparisons": [
      {
        "word": "Immune",
        "distinction": "Protégé contre les infections."
      },
      {
        "word": "Vulnerable",
        "distinction": "Vulnérable aux agressions extérieures."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-4e-58-engineer",
    "term": "Engineer",
    "phonetic": "/ˌɛn.dʒɪˈnɪər/",
    "level": "A2",
    "category": "Ingénierie",
    "frenchDef": "Ingénieur concevant des systèmes techniques.",
    "englishDef": "A person who designs, builds, or maintains engines, machines, or structures.",
    "etymology": "Du latin 'ingenium' (génie inventif de l'esprit).",
    "pressExcerpt": "Civil engineers designed an earthquake-resistant suspension bridge.",
    "pressSource": "Engineering Weekly",
    "collocations": [
      "civil engineer",
      "software engineer",
      "work as an engineer"
    ],
    "nuanceComparisons": [
      {
        "word": "Engineer",
        "distinction": "Concepteur technique de haut niveau."
      },
      {
        "word": "Technician",
        "distinction": "Technicien de maintenance opérationnelle."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-59-lawyer",
    "term": "Lawyer",
    "phonetic": "/ˈlɔː.jər/",
    "level": "A2",
    "category": "Justice & Droit",
    "frenchDef": "Avocat plaidant et défendant les droits.",
    "englishDef": "A person who practices or studies law; an attorney.",
    "etymology": "Du moyen anglais 'lawe' (loi établie).",
    "pressExcerpt": "The defense lawyer presented compelling evidence before the jury.",
    "pressSource": "Legal Affairs UK",
    "collocations": [
      "defense lawyer",
      "consult a lawyer",
      "corporate lawyer"
    ],
    "nuanceComparisons": [
      {
        "word": "Lawyer",
        "distinction": "Praticien du droit plaidant au tribunal."
      },
      {
        "word": "Judge",
        "distinction": "Magistrat tranchant les litiges."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-60-promotion",
    "term": "Promotion",
    "phonetic": "/prəˈməʊ.ʃən/",
    "level": "A2",
    "category": "Évolution de carrière",
    "frenchDef": "Promotion professionnelle vers un poste supérieur.",
    "englishDef": "The advancement of an employee to a higher job rank.",
    "etymology": "Du latin 'promovere' (avancer en avant, élever).",
    "pressExcerpt": "Her dedication to customer service earned her a well-deserved promotion.",
    "pressSource": "The Economist",
    "collocations": [
      "earn a promotion",
      "career promotion",
      "deserve a promotion"
    ],
    "nuanceComparisons": [
      {
        "word": "Promotion",
        "distinction": "Élévation hiérarchique au mérite."
      },
      {
        "word": "Demotion",
        "distinction": "Rétrogradation à un rang inférieur."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-61-deadline",
    "term": "Deadline",
    "phonetic": "/ˈdɛd.laɪn/",
    "level": "A2",
    "category": "Échéances",
    "frenchDef": "Date limite impérative pour rendre un travail.",
    "englishDef": "The latest time or date by which something should be completed.",
    "etymology": "À l’origine, ligne dans les prisons au-delà de laquelle on ne pouvait passer.",
    "pressExcerpt": "The editorial team worked diligently to meet the Friday deadline.",
    "pressSource": "Publishers Weekly",
    "collocations": [
      "meet a deadline",
      "tight deadline",
      "miss a deadline"
    ],
    "nuanceComparisons": [
      {
        "word": "Deadline",
        "distinction": "Date ou heure butoir impérative."
      },
      {
        "word": "Delay",
        "distinction": "Retard pris sur le planning."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-62-r-sum",
    "term": "Résumé",
    "phonetic": "/ˈrɛz.juː.meɪ/",
    "level": "A2",
    "category": "Curriculum vitae",
    "frenchDef": "Curriculum vitae récapitulant diplômes et étapes.",
    "englishDef": "A brief account of education and previous experience for a job application.",
    "etymology": "Du français 'résumé' (sommaire synthétique fidèle).",
    "pressExcerpt": "She updated her résumé to highlight her bilingual language proficiencies.",
    "pressSource": "Careers Guide",
    "collocations": [
      "update a résumé",
      "send a résumé",
      "polished résumé"
    ],
    "nuanceComparisons": [
      {
        "word": "Résumé",
        "distinction": "CV professionnel d'une à deux pages."
      },
      {
        "word": "Portfolio",
        "distinction": "Dossier d'œuvres visuelles réalisées."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-63-employment",
    "term": "Employment",
    "phonetic": "/ɪmˈplɔɪ.mənt/",
    "level": "A2",
    "category": "Marché du travail",
    "frenchDef": "Emploi stable et activité rémunérée.",
    "englishDef": "The state of having paid work.",
    "etymology": "De l’ancien français 'employer' (engager à un usage utile).",
    "pressExcerpt": "The renewable energy sector creates thousands of green employment opportunities.",
    "pressSource": "Financial Times",
    "collocations": [
      "full-time employment",
      "seek employment",
      "gainful employment"
    ],
    "nuanceComparisons": [
      {
        "word": "Employment",
        "distinction": "État d'être salarié en activité."
      },
      {
        "word": "Unemployment",
        "distinction": "Chômage et absence de travail."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-64-teamwork",
    "term": "Teamwork",
    "phonetic": "/ˈtiːm.wɜːk/",
    "level": "A2",
    "category": "Collaboration",
    "frenchDef": "Travail d'équipe solidaire et coordonné.",
    "englishDef": "The combined action of a group, especially when effective and efficient.",
    "etymology": "Composé de 'team' (équipe) et 'work' (travail).",
    "pressExcerpt": "Successful project delivery relies on honest communication and teamwork.",
    "pressSource": "Harvard Business Review",
    "collocations": [
      "effective teamwork",
      "spirit of teamwork",
      "require teamwork"
    ],
    "nuanceComparisons": [
      {
        "word": "Teamwork",
        "distinction": "Effort coordonné de plusieurs personnes."
      },
      {
        "word": "Solitude",
        "distinction": "Travail solitaire isolé."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-4e-65-solidarity",
    "term": "Solidarity",
    "phonetic": "/ˌsɒl.ɪˈdær.ə.ti/",
    "level": "A2",
    "category": "Entraide mutuelle",
    "frenchDef": "Solidarité unissant les membres d'une communauté.",
    "englishDef": "Unity or agreement of feeling or action, especially among individuals with a common interest.",
    "etymology": "Du latin 'solidus' (solide, formant un tout compact).",
    "pressExcerpt": "Citizens showed heartfelt solidarity during the coastal flood recovery.",
    "pressSource": "UNESCO Courier",
    "collocations": [
      "express solidarity",
      "national solidarity",
      "act of solidarity"
    ],
    "nuanceComparisons": [
      {
        "word": "Solidarity",
        "distinction": "Cohésion morale et soutien mutuel."
      },
      {
        "word": "Egoism",
        "distinction": "Égoïsme individualiste replié."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-66-archipelago",
    "term": "Archipelago",
    "phonetic": "/ˌɑː.kɪˈpɛl.ə.ɡəʊ/",
    "level": "A2",
    "category": "Géographie insulaire",
    "frenchDef": "Archipel d'îles parsemées sur l'océan.",
    "englishDef": "A group or chain of islands clustered in a sea.",
    "etymology": "Du grec 'arkhi-' (principal) et 'pelagos' (mer Égée).",
    "pressExcerpt": "The Scottish Hebrides form an enchanting Atlantic archipelago.",
    "pressSource": "National Geographic",
    "collocations": [
      "island archipelago",
      "vast archipelago",
      "remote archipelago"
    ],
    "nuanceComparisons": [
      {
        "word": "Archipelago",
        "distinction": "Groupe d'îles voisines."
      },
      {
        "word": "Continent",
        "distinction": "Masse continentale immense."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-67-devotion",
    "term": "Devotion",
    "phonetic": "/dɪˈvəʊ.ʃən/",
    "level": "A2",
    "category": "Attachement sincère",
    "frenchDef": "Dévouement sincère et amour fidèle.",
    "englishDef": "Love, loyalty, or enthusiasm for a person, activity, or cause.",
    "etymology": "Du latin 'devotio' (vœu solennel du cœur).",
    "pressExcerpt": "His lifelong devotion to environmental protection inspired young activists.",
    "pressSource": "Nature Ethics",
    "collocations": [
      "lifelong devotion",
      "deep devotion",
      "show devotion"
    ],
    "nuanceComparisons": [
      {
        "word": "Devotion",
        "distinction": "Attachement fidèle et généreux."
      },
      {
        "word": "Indifference",
        "distinction": "Froideur et détachement."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-68-alliance",
    "term": "Alliance",
    "phonetic": "/əˈlaɪ.əns/",
    "level": "A2",
    "category": "Traités & Unions",
    "frenchDef": "Alliance politique ou amitié scellée.",
    "englishDef": "A union or association formed for mutual benefit, especially between countries.",
    "etymology": "De l’ancien français 'alier' (lier ensemble par traité).",
    "pressExcerpt": "The bilateral alliance ensured mutual defense and maritime trade security.",
    "pressSource": "Foreign Policy",
    "collocations": [
      "strategic alliance",
      "form an alliance",
      "ancient alliance"
    ],
    "nuanceComparisons": [
      {
        "word": "Alliance",
        "distinction": "Pacte formel d'union mutuelle."
      },
      {
        "word": "Discord",
        "distinction": "Désaccord et hostilité."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-69-affection",
    "term": "Affection",
    "phonetic": "/əˈfɛk.ʃən/",
    "level": "A2",
    "category": "Tendresse",
    "frenchDef": "Affection tendre et prévenante.",
    "englishDef": "A gentle feeling of fondness or liking.",
    "etymology": "Du latin 'affectio' (mouvement de l'âme vers autrui).",
    "pressExcerpt": "The sisters hugged with deep, spontaneous affection after months apart.",
    "pressSource": "Literature Classics",
    "collocations": [
      "warm affection",
      "show affection",
      "mutual affection"
    ],
    "nuanceComparisons": [
      {
        "word": "Affection",
        "distinction": "Tendresse chaleureuse et bienveillante."
      },
      {
        "word": "Coldness",
        "distinction": "Froideur distante insensible."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-70-perspective",
    "term": "Perspective",
    "phonetic": "/pəˈspɛk.tɪv/",
    "level": "A2",
    "category": "Arts & Visions",
    "frenchDef": "Perspective spatiale ou point de vue de l'esprit.",
    "englishDef": "The art of representing three-dimensional objects on a flat surface; a viewpoint.",
    "etymology": "Du latin 'perspicere' (voir distinctement à travers).",
    "pressExcerpt": "Renaissance painters perfected linear perspective to render realistic depth.",
    "pressSource": "Tate History",
    "collocations": [
      "linear perspective",
      "new perspective",
      "gain perspective"
    ],
    "nuanceComparisons": [
      {
        "word": "Perspective",
        "distinction": "Point de vue géométrique ou intellectuel."
      },
      {
        "word": "Flatness",
        "distinction": "Représentation plate sans profondeur."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-71-fellowship",
    "term": "Fellowship",
    "phonetic": "/ˈfɛl.əʊ.ʃɪp/",
    "level": "A2",
    "category": "Confraternité",
    "frenchDef": "Fraternité bienveillante et camaraderie d'étude.",
    "englishDef": "Friendly association, especially with people who share one's interests.",
    "etymology": "Du vieil anglais 'feolag' (compagnon partageant les biens de route).",
    "pressExcerpt": "The academic seminar fostered warm intellectual fellowship among scholars.",
    "pressSource": "Oxford University Gazette",
    "collocations": [
      "warm fellowship",
      "enjoy fellowship",
      "spirit of fellowship"
    ],
    "nuanceComparisons": [
      {
        "word": "Fellowship",
        "distinction": "Camaraderie d'idéal partagé."
      },
      {
        "word": "Animosity",
        "distinction": "Animosité et rancœur."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-4e-72-compassion",
    "term": "Compassion",
    "phonetic": "/kəmˈpæʃ.ən/",
    "level": "A2",
    "category": "Empathie bienveillante",
    "frenchDef": "Compassion envers la vulnérabilité d'autrui.",
    "englishDef": "Sympathetic pity and concern for the sufferings or misfortunes of others.",
    "etymology": "Du latin 'compati' (souffrir avec, ressentir la peine d'autrui).",
    "pressExcerpt": "Treating every living creature with active compassion ennobles humanity.",
    "pressSource": "Philosophical Review",
    "collocations": [
      "deep compassion",
      "show compassion",
      "act with compassion"
    ],
    "nuanceComparisons": [
      {
        "word": "Compassion",
        "distinction": "Bienveillance compatissante en action."
      },
      {
        "word": "Cruelty",
        "distinction": "Cruauté délibérée."
      }
    ],
    "gradeLevel": "4e",
    "gradeLabel": "4e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-01-independence",
    "term": "Independence",
    "phonetic": "/ˌɪn.dɪˈpɛn.dəns/",
    "level": "B1",
    "category": "Autonomie",
    "frenchDef": "Indépendance et capacité d'agir par soi-même.",
    "englishDef": "The fact or state of being independent; self-reliance.",
    "etymology": "Du latin 'dependere' précédé du préfixe négatif 'in-' (ne pas être suspendu à autrui).",
    "pressExcerpt": "Preparing their own lunch fosters pupils' growing independence.",
    "pressSource": "Teen Health",
    "collocations": [
      "gain independence",
      "growing independence",
      "financial independence"
    ],
    "nuanceComparisons": [
      {
        "word": "Independence",
        "distinction": "Autonomie de jugement et d'action."
      },
      {
        "word": "Dependence",
        "distinction": "Dépendance subie."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-02-mindfulness",
    "term": "Mindfulness",
    "phonetic": "/ˈmaɪnd.fəl.nəs/",
    "level": "B1",
    "category": "Attention au présent",
    "frenchDef": "Pleine conscience attentive et calme.",
    "englishDef": "The quality or state of being conscious or aware of something; mental focus.",
    "etymology": "Du vieil anglais 'gemynd' (mémoire attentive, esprit posé).",
    "pressExcerpt": "Practicing five minutes of breath mindfulness calms exam anxiety.",
    "pressSource": "Mindful UK",
    "collocations": [
      "practice mindfulness",
      "mindfulness meditation",
      "daily mindfulness"
    ],
    "nuanceComparisons": [
      {
        "word": "Mindfulness",
        "distinction": "Attention posée au moment présent."
      },
      {
        "word": "Distraction",
        "distinction": "Dispersion mentale agitée."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-03-priority",
    "term": "Priority",
    "phonetic": "/praɪˈɒr.ə.ti/",
    "level": "B1",
    "category": "Gestion du temps",
    "frenchDef": "Priorité absolue à traiter en premier.",
    "englishDef": "A thing that is regarded as more important than another.",
    "etymology": "Du latin 'prior' (ce qui vient devant, en premier).",
    "pressExcerpt": "Reviewing core vocabulary notes should be your academic priority tonight.",
    "pressSource": "Study Skills",
    "collocations": [
      "top priority",
      "set priorities",
      "give priority to"
    ],
    "nuanceComparisons": [
      {
        "word": "Priority",
        "distinction": "Tâche passant avant toutes les autres."
      },
      {
        "word": "Detail",
        "distinction": "Détail secondaire non urgent."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-04-balance",
    "term": "Balance",
    "phonetic": "/ˈbæl.əns/",
    "level": "B1",
    "category": "Harmonie de vie",
    "frenchDef": "Équilibre harmonieux entre études et repos.",
    "englishDef": "An even distribution of weight enabling someone or something to remain steady.",
    "etymology": "Du latin 'bilanx' (balance à deux plateaux égaux).",
    "pressExcerpt": "Striking a healthy balance between screen time and exercise is vital.",
    "pressSource": "NHS Wellness",
    "collocations": [
      "strike a balance",
      "maintain balance",
      "work-life balance"
    ],
    "nuanceComparisons": [
      {
        "word": "Balance",
        "distinction": "Harmonie équilibrée des temps de vie."
      },
      {
        "word": "Imbalance",
        "distinction": "Déséquilibre provoquant fatigue."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-05-expectation",
    "term": "Expectation",
    "phonetic": "/ˌɛk.spɛkˈteɪ.ʃən/",
    "level": "B1",
    "category": "Ambitions",
    "frenchDef": "Attente ou exigence formulée envers soi.",
    "englishDef": "A strong belief that something will happen or be the case in the future.",
    "etymology": "Du latin 'expectare' (regarder vers l'avant avec espoir attentif).",
    "pressExcerpt": "High academic expectations motivate students to reach their full potential.",
    "pressSource": "Educational Review",
    "collocations": [
      "meet expectations",
      "high expectations",
      "beyond expectation"
    ],
    "nuanceComparisons": [
      {
        "word": "Expectation",
        "distinction": "Attente raisonnée et ambitieuse."
      },
      {
        "word": "Resignation",
        "distinction": "Renoncement défaitiste."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-06-community",
    "term": "Community",
    "phonetic": "/kəˈmjuː.nə.ti/",
    "level": "B1",
    "category": "Vie locale",
    "frenchDef": "Communauté soudée par des valeurs communes.",
    "englishDef": "A group of people living in the same place or having a particular characteristic in common.",
    "etymology": "Du latin 'communitas' (partage solidaire d'un même bien public).",
    "pressExcerpt": "Our school community organized a charity book fair for the town library.",
    "pressSource": "Local Voice",
    "collocations": [
      "local community",
      "sense of community",
      "school community"
    ],
    "nuanceComparisons": [
      {
        "word": "Community",
        "distinction": "Groupe uni par des liens de vie."
      },
      {
        "word": "Crowd",
        "distinction": "Foule anonyme passagère."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-07-domesticity",
    "term": "Domesticity",
    "phonetic": "/ˌdəʊ.mɛˈstɪs.ə.ti/",
    "level": "B1",
    "category": "Vie de famille",
    "frenchDef": "Douceur de la vie de foyer domestique.",
    "englishDef": "Home or family life; the character of being focused on the home.",
    "etymology": "Du latin 'domus' (maison, foyer familial).",
    "pressExcerpt": "Quiet evenings spent reading by the fireplace celebrate simple domesticity.",
    "pressSource": "Country Living",
    "collocations": [
      "quiet domesticity",
      "charms of domesticity",
      "embrace domesticity"
    ],
    "nuanceComparisons": [
      {
        "word": "Domesticity",
        "distinction": "Confort paisible du chez-soi."
      },
      {
        "word": "Wanderlust",
        "distinction": "Désir irrépressible de voyager au loin."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-08-demeanor",
    "term": "Demeanor",
    "phonetic": "/dɪˈmiː.nər/",
    "level": "B1",
    "category": "Attitude & Tenue",
    "frenchDef": "Comportement posé et tenue courtoise.",
    "englishDef": "Outward behavior or bearing toward others.",
    "etymology": "De l’ancien français 'demener' (se conduire soi-même avec dignité).",
    "pressExcerpt": "Her calm, reassuring demeanor put the nervous new students at ease.",
    "pressSource": "Psychology Today",
    "collocations": [
      "calm demeanor",
      "professional demeanor",
      "cheerful demeanor"
    ],
    "nuanceComparisons": [
      {
        "word": "Demeanor",
        "distinction": "Attitude extérieure visible."
      },
      {
        "word": "Character",
        "distinction": "Caractère moral profond intérieur."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-3e-09-expedition",
    "term": "Expedition",
    "phonetic": "/ˌɛk.spəˈdɪʃ.ən/",
    "level": "B1",
    "category": "Explorations",
    "frenchDef": "Expédition scientifique en terre reculée.",
    "englishDef": "A journey undertaken by a group of people with a particular purpose, especially exploration.",
    "etymology": "Du latin 'expedire' (dégager les pieds des entraves pour marcher vite).",
    "pressExcerpt": "The botanical expedition documented uncatalogued alpine flora.",
    "pressSource": "Royal Geographical Society",
    "collocations": [
      "scientific expedition",
      "polar expedition",
      "mountaineering expedition"
    ],
    "nuanceComparisons": [
      {
        "word": "Expedition",
        "distinction": "Mission d'exploration préparée avec rigueur."
      },
      {
        "word": "Excursion",
        "distinction": "Petite sortie touristique d'une journée."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-10-landmark",
    "term": "Landmark",
    "phonetic": "/ˈlænd.mɑːk/",
    "level": "B1",
    "category": "Monuments repères",
    "frenchDef": "Monument historique emblématique servant de repère.",
    "englishDef": "An object or feature of a landscape easily seen and recognized from a distance.",
    "etymology": "Du vieil anglais 'landmearc' (borne marquant une frontière de terre).",
    "pressExcerpt": "Big Ben is a globally recognizable London landmark.",
    "pressSource": "Historic UK",
    "collocations": [
      "famous landmark",
      "historic landmark",
      "iconic landmark"
    ],
    "nuanceComparisons": [
      {
        "word": "Landmark",
        "distinction": "Monument ou édifice repère."
      },
      {
        "word": "Signpost",
        "distinction": "Panneau de signalisation routière."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-11-wilderness",
    "term": "Wilderness",
    "phonetic": "/ˈwɪl.də.nəs/",
    "level": "B1",
    "category": "Grands espaces",
    "frenchDef": "Étendue sauvage et préservée de l'homme.",
    "englishDef": "An uncultivated, uninhabited, and inhospitable region.",
    "etymology": "Du vieil anglais 'wildēor' (bêtes sauvages vivant en liberté).",
    "pressExcerpt": "They backpacked across the rugged Scottish wilderness for five days.",
    "pressSource": "National Geographic",
    "collocations": [
      "remote wilderness",
      "protect the wilderness",
      "vast wilderness"
    ],
    "nuanceComparisons": [
      {
        "word": "Wilderness",
        "distinction": "Nature sauvage totalement vierge."
      },
      {
        "word": "Park",
        "distinction": "Parc aménagé et tracé par l'homme."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-12-navigation",
    "term": "Navigation",
    "phonetic": "/ˌnæv.ɪˈɡeɪ.ʃən/",
    "level": "B1",
    "category": "Tenue de cap",
    "frenchDef": "Navigation maritime ou aérienne rigoureuse.",
    "englishDef": "The process or activity of accurately ascertaining one's position and planning a route.",
    "etymology": "Du latin 'navis' (navire) et 'agere' (mener, diriger).",
    "pressExcerpt": "Celestial navigation relies on observing the position of guiding stars.",
    "pressSource": "Maritime Heritage",
    "collocations": [
      "satellite navigation",
      "rules of navigation",
      "expert navigation"
    ],
    "nuanceComparisons": [
      {
        "word": "Navigation",
        "distinction": "Pilotage précis d'une trajectoire."
      },
      {
        "word": "Drift",
        "distinction": "Dérive passive au gré des courants."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-13-wanderlust",
    "term": "Wanderlust",
    "phonetic": "/ˈwɒn.də.lʌst/",
    "level": "B1",
    "category": "Désir de voyager",
    "frenchDef": "Désir irrépressible de découvrir le vaste monde.",
    "englishDef": "A strong desire to travel and explore the world.",
    "etymology": "De l’allemand 'wandern' (marcher, randonner) et 'Lust' (désir passionné).",
    "pressExcerpt": "Reading tales of polar journeys awakened an insatiable wanderlust in him.",
    "pressSource": "Travel Literary Review",
    "collocations": [
      "feel wanderlust",
      "stricken by wanderlust",
      "wanderlust spirit"
    ],
    "nuanceComparisons": [
      {
        "word": "Wanderlust",
        "distinction": "Soif ardente de découverte des horizons."
      },
      {
        "word": "Homesickness",
        "distinction": "Nostalgie douloureuse du chez-soi."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-14-excursion",
    "term": "Excursion",
    "phonetic": "/ɪkˈskɜː.ʃən/",
    "level": "B1",
    "category": "Sorties d'une journée",
    "frenchDef": "Excursion pédestre ou scolaire d'un jour.",
    "englishDef": "A short journey or trip, especially one taken as a leisure activity.",
    "etymology": "Du latin 'excurrere' (courir hors de chez soi, faire une escapade).",
    "pressExcerpt": "The science class embarked on an educational geology excursion to the cliffs.",
    "pressSource": "School Gazette",
    "collocations": [
      "day excursion",
      "go on an excursion",
      "boat excursion"
    ],
    "nuanceComparisons": [
      {
        "word": "Excursion",
        "distinction": "Sortie brève d'aller-retour."
      },
      {
        "word": "Pilgrimage",
        "distinction": "Pèlerinage spirituel solennel."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-15-crossing",
    "term": "Crossing",
    "phonetic": "/ˈkrɒs.ɪŋ/",
    "level": "B1",
    "category": "Traversées maritimes",
    "frenchDef": "Traversée maritime d'un détroit ou d'un canal.",
    "englishDef": "A journey across water, especially by ferry across the Channel.",
    "etymology": "Du verbe anglais 'cross' (franchir, traverser).",
    "pressExcerpt": "The ferry crossing from Dover to Calais took ninety smooth minutes.",
    "pressSource": "Ferry Review",
    "collocations": [
      "Channel crossing",
      "rough crossing",
      "smooth crossing"
    ],
    "nuanceComparisons": [
      {
        "word": "Crossing",
        "distinction": "Traversée directe d'un bras de mer."
      },
      {
        "word": "Cruise",
        "distinction": "Croisière touristique à escales multiples."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-3e-16-antiquity",
    "term": "Antiquity",
    "phonetic": "/ænˈtɪk.wə.ti/",
    "level": "B1",
    "category": "Antiquité classique",
    "frenchDef": "Antiquité gréco-romaine et monuments anciens.",
    "englishDef": "The ancient past, especially the period before the Middle Ages.",
    "etymology": "Du latin 'antiquitas' (temps reculé vénérable).",
    "pressExcerpt": "Philosophers of classical antiquity debated ethics in Athens and Rome.",
    "pressSource": "Classical Studies",
    "collocations": [
      "classical antiquity",
      "relic of antiquity",
      "ancient antiquity"
    ],
    "nuanceComparisons": [
      {
        "word": "Antiquity",
        "distinction": "Période de l'histoire antique."
      },
      {
        "word": "Modernity",
        "distinction": "Époque moderne contemporaine."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-17-sovereignty",
    "term": "Sovereignty",
    "phonetic": "/ˈsɒv.rɪn.ti/",
    "level": "B1",
    "category": "Pouvoir suprême",
    "frenchDef": "Souveraineté politique et indépendance de l'État.",
    "englishDef": "The authority of a state to govern itself or another state.",
    "etymology": "Du latin 'superanus' (qui règne au-dessus de tout).",
    "pressExcerpt": "Parliamentary sovereignty forms the bedrock of the British constitutional order.",
    "pressSource": "Law Quarterly",
    "collocations": [
      "national sovereignty",
      "claim sovereignty",
      "defend sovereignty"
    ],
    "nuanceComparisons": [
      {
        "word": "Sovereignty",
        "distinction": "Pouvoir suprême d'autodétermination."
      },
      {
        "word": "Submission",
        "distinction": "Soumission à une puissance tierce."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-18-renaissance",
    "term": "Renaissance",
    "phonetic": "/rəˈneɪ.səns/",
    "level": "B1",
    "category": "Renouveau des arts",
    "frenchDef": "Renaissance culturelle des XVe et XVIe siècles.",
    "englishDef": "The revival of European art and literature under the influence of classical models.",
    "etymology": "Du français 'renaître' (naître à nouveau dans la lumière).",
    "pressExcerpt": "The Italian Renaissance produced masters like Da Vinci and Michelangelo.",
    "pressSource": "Art History",
    "collocations": [
      "early Renaissance",
      "cultural Renaissance",
      "Renaissance humanism"
    ],
    "nuanceComparisons": [
      {
        "word": "Renaissance",
        "distinction": "Renouveau intellectuel et artistique majeur."
      },
      {
        "word": "Decadence",
        "distinction": "Période de déclin et d'affaissement."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-19-commemoration",
    "term": "Commemoration",
    "phonetic": "/kəˌmɛm.əˈreɪ.ʃən/",
    "level": "B1",
    "category": "Mémoire collective",
    "frenchDef": "Commémoration solennelle d'un grand événement.",
    "englishDef": "Remembrance, typically expressed in a ceremony.",
    "etymology": "Du latin 'commemorare' (rappeler en mémoire commune).",
    "pressExcerpt": "The national commemoration honored fallen soldiers with two minutes of silence.",
    "pressSource": "The Times",
    "collocations": [
      "solemn commemoration",
      "annual commemoration",
      "in commemoration of"
    ],
    "nuanceComparisons": [
      {
        "word": "Commemoration",
        "distinction": "Célébration solennelle du souvenir."
      },
      {
        "word": "Oblivion",
        "distinction": "Oubli total et effacement."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-20-legacy",
    "term": "Legacy",
    "phonetic": "/ˈlɛɡ.ə.si/",
    "level": "B1",
    "category": "Héritage spirituel",
    "frenchDef": "Héritage moral ou culturel laissé aux suivants.",
    "englishDef": "An amount of money or property left to someone in a will, or an enduring heritage.",
    "etymology": "Du latin médiéval 'legatia' (mission confiée à un légat).",
    "pressExcerpt": "Shakespeare left an incomparable theatrical legacy to the English language.",
    "pressSource": "Literary Review",
    "collocations": [
      "lasting legacy",
      "cultural legacy",
      "enduring legacy"
    ],
    "nuanceComparisons": [
      {
        "word": "Legacy",
        "distinction": "Héritage spirituel légué au monde."
      },
      {
        "word": "Debt",
        "distinction": "Dette financière due."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-21-empire",
    "term": "Empire",
    "phonetic": "/ˈɛm.paɪər/",
    "level": "B1",
    "category": "Grandes puissances",
    "frenchDef": "Empire réunissant des peuples sous une couronne.",
    "englishDef": "An extensive group of states or countries under a single supreme authority.",
    "etymology": "Du latin 'imperium' (commandement militaire suprême).",
    "pressExcerpt": "At its height, the Roman Empire bordered the Rhine, Danube, and Euphrates.",
    "pressSource": "BBC History",
    "collocations": [
      "ancient empire",
      "fall of an empire",
      "vast empire"
    ],
    "nuanceComparisons": [
      {
        "word": "Empire",
        "distinction": "Ensemble de nations unies sous un empereur."
      },
      {
        "word": "Republic",
        "distinction": "République dirigée par des élus."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-22-parchment",
    "term": "Parchment",
    "phonetic": "/ˈpɑːtʃ.mənt/",
    "level": "B1",
    "category": "Manuscrits anciens",
    "frenchDef": "Parchemin de peau animale pour chartes médiévales.",
    "englishDef": "A stiff, flat, thin material made from the prepared skin of an animal, used for writing.",
    "etymology": "Du grec 'Pergamon' (cité de Pergame réputée pour ses ateliers de parchemins).",
    "pressExcerpt": "The Magna Carta of 1215 was penned onto enduring calfskin parchment.",
    "pressSource": "British Library",
    "collocations": [
      "medieval parchment",
      "write on parchment",
      "ancient parchment"
    ],
    "nuanceComparisons": [
      {
        "word": "Parchment",
        "distinction": "Peau animale traitée pour l'écriture."
      },
      {
        "word": "Papyrus",
        "distinction": "Feuille végétale de roseaux du Nil."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-3e-23-masterpiece",
    "term": "Masterpiece",
    "phonetic": "/ˈmɑː.stə.piːs/",
    "level": "B1",
    "category": "Sommets artistiques",
    "frenchDef": "Chef-d'œuvre inégalé d'un maître d'art.",
    "englishDef": "A work of outstanding artistry, skill, or workmanship.",
    "etymology": "Du moyen néerlandais 'meesterstuk' (pièce certifiant la maîtrise).",
    "pressExcerpt": "The Mona Lisa is revered worldwide as a masterpiece of Renaissance portraiture.",
    "pressSource": "The Guardian Arts",
    "collocations": [
      "acclaimed masterpiece",
      "create a masterpiece",
      "artistic masterpiece"
    ],
    "nuanceComparisons": [
      {
        "word": "Masterpiece",
        "distinction": "Création suprême d'une vie."
      },
      {
        "word": "Copy",
        "distinction": "Reproduction fidèle sans génie propre."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-24-cinema",
    "term": "Cinema",
    "phonetic": "/ˈsɪn.ə.mɑː/",
    "level": "B1",
    "category": "Septième art",
    "frenchDef": "Septième art et salle de projection.",
    "englishDef": "The production of films, or a theater where films are shown for public entertainment.",
    "etymology": "Du grec 'kinēma' (mouvement projeté sur écran).",
    "pressExcerpt": "British cinema has produced internationally renowned dramas and documentaries.",
    "pressSource": "Sight & Sound",
    "collocations": [
      "classic cinema",
      "go to the cinema",
      "independent cinema"
    ],
    "nuanceComparisons": [
      {
        "word": "Cinema",
        "distinction": "Art cinématographique."
      },
      {
        "word": "Television",
        "distinction": "Diffusion audiovisuelle domestique."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-25-aesthetics",
    "term": "Aesthetics",
    "phonetic": "/iːsˈθɛt.ɪks/",
    "level": "B1",
    "category": "Philosophie de la beauté",
    "frenchDef": "Esthétique, harmonie visuelle et jugement de goût.",
    "englishDef": "A set of principles concerned with the nature and appreciation of beauty.",
    "etymology": "Du grec 'aisthētikos' (sensible aux perceptions du beau).",
    "pressExcerpt": "The museum curator examined the unique visual aesthetics of modern typography.",
    "pressSource": "Journal of Aesthetics",
    "collocations": [
      "visual aesthetics",
      "philosophical aesthetics",
      "appreciation of aesthetics"
    ],
    "nuanceComparisons": [
      {
        "word": "Aesthetics",
        "distinction": "Théorie philosophique de la beauté."
      },
      {
        "word": "Functionality",
        "distinction": "Efficacité pratique brute sans souci du beau."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-26-choreography",
    "term": "Choreography",
    "phonetic": "/ˌkɒr.iˈɒɡ.rə.fi/",
    "level": "B1",
    "category": "Art de la danse",
    "frenchDef": "Chorégraphie réglant l'enchaînement des pas.",
    "englishDef": "The sequence of steps and movements in dance or for a performance.",
    "etymology": "Du grec 'khoreia' (ronde dansée) et 'graphein' (écrire le tracé).",
    "pressExcerpt": "The ballet director devised an innovative contemporary choreography.",
    "pressSource": "Dance Magazine",
    "collocations": [
      "dance choreography",
      "intricate choreography",
      "create choreography"
    ],
    "nuanceComparisons": [
      {
        "word": "Choreography",
        "distinction": "Séquence chorégraphiée réglée d'avance."
      },
      {
        "word": "Freestyle",
        "distinction": "Danse libre sans pas imposés."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-27-passion",
    "term": "Passion",
    "phonetic": "/ˈpæʃ.ən/",
    "level": "B1",
    "category": "Élan créatif",
    "frenchDef": "Passion ardente guidant la vocation artistique.",
    "englishDef": "Strong and barely controllable emotion; intense enthusiasm for something.",
    "etymology": "Du latin 'passio' (sentiment puissant qui s'empare de l'être).",
    "pressExcerpt": "Her passion for oil painting prompted her to study fine arts in London.",
    "pressSource": "The Artist",
    "collocations": [
      "pursue a passion",
      "lifelong passion",
      "ignite a passion"
    ],
    "nuanceComparisons": [
      {
        "word": "Passion",
        "distinction": "Élan passionné durable."
      },
      {
        "word": "Whim",
        "distinction": "Caprice passager sans lendemain."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-28-illustration",
    "term": "Illustration",
    "phonetic": "/ˌɪl.əˈstreɪ.ʃən/",
    "level": "B1",
    "category": "Images de livres",
    "frenchDef": "Illustration picturale enrichissant un récit.",
    "englishDef": "A picture illustrating a book, newspaper, or other text.",
    "etymology": "Du latin 'illustrare' (éclairer, mettre en pleine lumière le sens).",
    "pressExcerpt": "Quentin Blake's whimsical pen-and-ink illustrations enchanted generations of readers.",
    "pressSource": "BookTrust",
    "collocations": [
      "book illustration",
      "draw an illustration",
      "original illustration"
    ],
    "nuanceComparisons": [
      {
        "word": "Illustration",
        "distinction": "Dessin complétant un texte écrit."
      },
      {
        "word": "Text",
        "distinction": "Le corps de texte littéraire."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-29-expressiveness",
    "term": "Expressiveness",
    "phonetic": "/ɪkˈsprɛs.ɪv.nəs/",
    "level": "B1",
    "category": "Intensité",
    "frenchDef": "Expressivité émotionnelle d'un geste d'artiste.",
    "englishDef": "The quality of effectively conveying a thought or feeling.",
    "etymology": "Du latin 'expressus' (rendu éclatant par l'empreinte).",
    "pressExcerpt": "The cellist played the adagio with remarkable emotional expressiveness.",
    "pressSource": "Musical Times",
    "collocations": [
      "vocal expressiveness",
      "artistic expressiveness",
      "depth of expressiveness"
    ],
    "nuanceComparisons": [
      {
        "word": "Expressiveness",
        "distinction": "Force expressive communicative."
      },
      {
        "word": "Monotony",
        "distinction": "Monotonie fade sans émotion."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-3e-30-resilience",
    "term": "Resilience",
    "phonetic": "/rɪˈzɪl.jəns/",
    "level": "B1",
    "category": "Force mentale",
    "frenchDef": "Résilience sportive face à l'adversité.",
    "englishDef": "The capacity to recover quickly from difficulties; toughness.",
    "etymology": "Du latin 'resilire' (rebondir vivement vers l'avant).",
    "pressExcerpt": "Trailing by two goals, the team demonstrated heroic resilience to win the cup.",
    "pressSource": "The Athletic",
    "collocations": [
      "mental resilience",
      "build resilience",
      "show resilience"
    ],
    "nuanceComparisons": [
      {
        "word": "Resilience",
        "distinction": "Capacité à rebondir après un coup dur."
      },
      {
        "word": "Fragility",
        "distinction": "Vulnérabilité cassante au moindre choc."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-31-tactics",
    "term": "Tactics",
    "phonetic": "/ˈtæk.tɪks/",
    "level": "B1",
    "category": "Stratégie de jeu",
    "frenchDef": "Tactique élaborée pour déjouer l'adversaire.",
    "englishDef": "An action or strategy carefully planned to achieve a specific end in competition.",
    "etymology": "Du grec 'taktika' (l'art d'ordonner les troupes en bataille).",
    "pressExcerpt": "The coach adjusted his pressing tactics during half-time.",
    "pressSource": "Sports Analysis",
    "collocations": [
      "clever tactics",
      "change tactics",
      "defensive tactics"
    ],
    "nuanceComparisons": [
      {
        "word": "Tactics",
        "distinction": "Dispositions concrètes pour un match donné."
      },
      {
        "word": "Strategy",
        "distinction": "Vision directrice sur une saison entière."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-32-trophy",
    "term": "Trophy",
    "phonetic": "/ˈtrəʊ.fi/",
    "level": "B1",
    "category": "Palmarès",
    "frenchDef": "Trophée d'argent remporté en finale.",
    "englishDef": "A cup or other decorative object awarded as a prize for a victory.",
    "etymology": "Du grec 'tropaion' (monument érigé sur le lieu de la déroute ennemie).",
    "pressExcerpt": "The school rugby captain hoisted the silver trophy in front of cheering supporters.",
    "pressSource": "Rugby World",
    "collocations": [
      "lift the trophy",
      "championship trophy",
      "win a trophy"
    ],
    "nuanceComparisons": [
      {
        "word": "Trophy",
        "distinction": "Coupe ou statuette de victoire."
      },
      {
        "word": "Certificate",
        "distinction": "Diplôme de participation sur papier."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-33-rival",
    "term": "Rival",
    "phonetic": "/ˈraɪ.vəl/",
    "level": "B1",
    "category": "Compétiteurs",
    "frenchDef": "Rival sportif poussant au dépassement de soi.",
    "englishDef": "A person or thing competing with another for the same objective or for superiority.",
    "etymology": "Du latin 'rivalis' (voisins partageant le même cours d'eau rivus).",
    "pressExcerpt": "Oxford and Cambridge are historic rowing rivals on the River Thames.",
    "pressSource": "BBC Sport",
    "collocations": [
      "historic rival",
      "beat a rival",
      "arch rival"
    ],
    "nuanceComparisons": [
      {
        "word": "Rival",
        "distinction": "Adversaire de valeur qui élève le niveau."
      },
      {
        "word": "Enemy",
        "distinction": "Ennemi cherchant la destruction d'autrui."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-34-sportsmanship",
    "term": "Sportsmanship",
    "phonetic": "/ˈspɔːts.mən.ʃɪp/",
    "level": "B1",
    "category": "Éthique du jeu",
    "frenchDef": "Esprit sportif empreint de fair-play.",
    "englishDef": "Fair and generous behavior or treatment of others, especially in a sports contest.",
    "etymology": "De 'sportsman' avec suffixe d'éthique '-ship'.",
    "pressExcerpt": "Applauding an opponent's fine shot is a mark of true sportsmanship.",
    "pressSource": "Olympic Review",
    "collocations": [
      "true sportsmanship",
      "display sportsmanship",
      "act of sportsmanship"
    ],
    "nuanceComparisons": [
      {
        "word": "Sportsmanship",
        "distinction": "Respect courtois des règles et de l'adversaire."
      },
      {
        "word": "Cheating",
        "distinction": "Tricherie méprisable."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-35-grit",
    "term": "Grit",
    "phonetic": "/ɡrɪt/",
    "level": "B1",
    "category": "Cran & Détermination",
    "frenchDef": "Cran tenace et courage silencieux.",
    "englishDef": "Courage and resolve; strength of character under pressure.",
    "etymology": "Du vieil anglais 'grēot' (sable dur et rugueux qui ne cède pas).",
    "pressExcerpt": "Climbing that muddy hill required sheer physical grit.",
    "pressSource": "Athletics UK",
    "collocations": [
      "sheer grit",
      "show grit",
      "grit and determination"
    ],
    "nuanceComparisons": [
      {
        "word": "Grit",
        "distinction": "Courage tenace dans l'adversité."
      },
      {
        "word": "Hesitation",
        "distinction": "Hésitation timide et recul."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-36-victory",
    "term": "Victory",
    "phonetic": "/ˈvɪk.tər.i/",
    "level": "B1",
    "category": "Triomphe",
    "frenchDef": "Victoire éclatante couronnant les efforts.",
    "englishDef": "An act of defeating an enemy or opponent in a battle, game, or other competition.",
    "etymology": "Du latin 'victoria' (triomphe remporté avec honneur).",
    "pressExcerpt": "Their hard-fought victory qualified the squad for the European cup.",
    "pressSource": "The Times Sport",
    "collocations": [
      "celebrate a victory",
      "hard-fought victory",
      "triumphant victory"
    ],
    "nuanceComparisons": [
      {
        "word": "Victory",
        "distinction": "Succès remporté dans la règle."
      },
      {
        "word": "Defeat",
        "distinction": "Échec ou défaite sportive."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-3e-37-conductor",
    "term": "Conductor",
    "phonetic": "/kənˈdʌk.tər/",
    "level": "B1",
    "category": "Direction d'orchestre",
    "frenchDef": "Chef d'orchestre guidant les musiciens à la baguette.",
    "englishDef": "A person who directs the performance of an orchestra or choir.",
    "etymology": "Du latin 'conducere' (conduire ensemble vers l'harmonie).",
    "pressExcerpt": "The conductor raised her slender baton to signal the quiet pianissimo.",
    "pressSource": "Orchestra World",
    "collocations": [
      "orchestra conductor",
      "talented conductor",
      "guest conductor"
    ],
    "nuanceComparisons": [
      {
        "word": "Conductor",
        "distinction": "Directeur musical guidant l'ensemble."
      },
      {
        "word": "Soloist",
        "distinction": "Soliste jouant en avant-scène."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-38-folklore",
    "term": "Folklore",
    "phonetic": "/ˈfəʊk.lɔːr/",
    "level": "B1",
    "category": "Traditions orales",
    "frenchDef": "Folklore et légendes transmis de siècle en siècle.",
    "englishDef": "The traditional beliefs, customs, and stories of a community, passed through generations.",
    "etymology": "De 'folk' (le peuple) et 'lore' (le savoir traditionnel).",
    "pressExcerpt": "British folklore is populated by forest sprites, knights, and selkies.",
    "pressSource": "Folklore Society",
    "collocations": [
      "traditional folklore",
      "ancient folklore",
      "study folklore"
    ],
    "nuanceComparisons": [
      {
        "word": "Folklore",
        "distinction": "Tradition populaire vivante."
      },
      {
        "word": "History",
        "distinction": "Histoire scientifique attestée par des écrits."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-39-resonance",
    "term": "Resonance",
    "phonetic": "/ˈrɛz.ən.əns/",
    "level": "B1",
    "category": "Acoustique",
    "frenchDef": "Résonance sonore d'une pureté cristalline.",
    "englishDef": "The quality in a sound of being deep, full, and reverberating.",
    "etymology": "Du latin 'resonare' (renvoyer l'écho sonore au loin).",
    "pressExcerpt": "The cathedral's stone vaulting gave the organ incredible acoustic resonance.",
    "pressSource": "Acoustics Journal",
    "collocations": [
      "deep resonance",
      "acoustic resonance",
      "emotional resonance"
    ],
    "nuanceComparisons": [
      {
        "word": "Resonance",
        "distinction": "Ampleur et prolongation naturelle du son."
      },
      {
        "word": "Dullness",
        "distinction": "Son étouffé et mat."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-40-recital",
    "term": "Recital",
    "phonetic": "/rɪˈsaɪ.təl/",
    "level": "B1",
    "category": "Concerts solistes",
    "frenchDef": "Récital de piano ou de chant en solo.",
    "englishDef": "A performance of music or dance given by just one person or a very small group.",
    "etymology": "Du latin 'recitare' (déclamer de mémoire à voix haute).",
    "pressExcerpt": "The young prodigy gave a solo piano recital featuring Chopin's nocturnes.",
    "pressSource": "Classic FM",
    "collocations": [
      "piano recital",
      "solo recital",
      "give a recital"
    ],
    "nuanceComparisons": [
      {
        "word": "Recital",
        "distinction": "Représentation solo ou intimiste."
      },
      {
        "word": "Festival",
        "distinction": "Grand festival rassemblant de multiples scènes."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-41-cadence",
    "term": "Cadence",
    "phonetic": "/ˈkeɪ.dəns/",
    "level": "B1",
    "category": "Rythmes & Chutes",
    "frenchDef": "Cadence harmonique ponctuant la fin d'une phrase musicale.",
    "englishDef": "A modulation or inflection of the voice, or a sequence of chords that brings a musical phrase to a resolution.",
    "etymology": "Du latin 'cadere' (tomber harmonieusement sur l'accord final).",
    "pressExcerpt": "The string quartet closed the movement on a serene and gentle cadence.",
    "pressSource": "Musical Analysis",
    "collocations": [
      "rhythmic cadence",
      "perfect cadence",
      "vocal cadence"
    ],
    "nuanceComparisons": [
      {
        "word": "Cadence",
        "distinction": "Résolution harmonique d'une phrase musicale."
      },
      {
        "word": "Dissonance",
        "distinction": "Tension harmonique non résolue."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-42-polyphony",
    "term": "Polyphony",
    "phonetic": "/pəˈlɪf.ə.ni/",
    "level": "B1",
    "category": "Contrepoint",
    "frenchDef": "Polyphonie mêlant plusieurs lignes vocales indépendantes.",
    "englishDef": "The style of simultaneously combining a number of parts, each forming an individual melody.",
    "etymology": "Du grec 'poluphōnia' (mélange de voix multiples et indépendantes).",
    "pressExcerpt": "Tudor church music reached extraordinary heights of sacred polyphony.",
    "pressSource": "Early Music Review",
    "collocations": [
      "sacred polyphony",
      "complex polyphony",
      "rich polyphony"
    ],
    "nuanceComparisons": [
      {
        "word": "Polyphony",
        "distinction": "Superposition de lignes mélodiques indépendantes."
      },
      {
        "word": "Monophony",
        "distinction": "Chant à une seule voix linéaire sans accompagnement."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-43-score",
    "term": "Score",
    "phonetic": "/skɔːr/",
    "level": "B1",
    "category": "Partitions",
    "frenchDef": "Partition d'orchestre réunissant toutes les portées.",
    "englishDef": "A written or printed representation of a musical work showing all parts.",
    "etymology": "Du vieil anglais 'scoru' (encoche gravée pour tenir le compte).",
    "pressExcerpt": "The composer examined the full orchestral score with minute scrutiny.",
    "pressSource": "BBC Proms",
    "collocations": [
      "orchestral score",
      "read a score",
      "film score"
    ],
    "nuanceComparisons": [
      {
        "word": "Score",
        "distinction": "Partition complète de toutes les voix d'un orchestre."
      },
      {
        "word": "Part",
        "distinction": "Feuille de musique dédiée à un seul pupitre."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-3e-44-culinary",
    "term": "Culinary",
    "phonetic": "/ˈkʌl.ɪ.nər.i/",
    "level": "B1",
    "category": "Art de la gastronomie",
    "frenchDef": "Culinaire, relatif à l'art et à la science de cuisiner.",
    "englishDef": "Of or for cooking or the kitchen; relating to gastronomy.",
    "etymology": "Du latin 'culina' (cuisine du foyer romain).",
    "pressExcerpt": "Her culinary repertoire draws inspiration from Mediterranean markets.",
    "pressSource": "Good Food Review",
    "collocations": [
      "culinary skills",
      "culinary art",
      "culinary tradition"
    ],
    "nuanceComparisons": [
      {
        "word": "Culinary",
        "distinction": "Relatif à la préparation des mets."
      },
      {
        "word": "Dietary",
        "distinction": "Relatif aux règles diététiques de nutrition."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-45-sommelier",
    "term": "Sommelier",
    "phonetic": "/səˈmɛl.i.eɪ/",
    "level": "B1",
    "category": "Cave & Crus",
    "frenchDef": "Sommelier guidant les accords mets et vins.",
    "englishDef": "A wine steward; a trained professional with wine knowledge in fine dining.",
    "etymology": "De l’ancien français 'sommier' (conducteur des bêtes de bât transportant les vivres et tonneaux).",
    "pressExcerpt": "The sommelier recommended an aromatic sparkling cider to complement the dessert.",
    "pressSource": "Michelin Guide",
    "collocations": [
      "expert sommelier",
      "consult the sommelier",
      "head sommelier"
    ],
    "nuanceComparisons": [
      {
        "word": "Sommelier",
        "distinction": "Expert diplômé des vins et accords."
      },
      {
        "word": "Bartender",
        "distinction": "Barman préparant des cocktails au comptoir."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-46-conviviality",
    "term": "Conviviality",
    "phonetic": "/kənˌvɪv.iˈæl.ə.ti/",
    "level": "B1",
    "category": "Chaleur humaine",
    "frenchDef": "Convivialité chaleureuse autour d'une bonne table.",
    "englishDef": "The quality of being friendly, lively, and enjoyable; warm fellowship.",
    "etymology": "Du latin 'convivium' (banquet où l'on vit ensemble joyeusement).",
    "pressExcerpt": "Sunday lunches at the village inn were marked by warmth and joyful conviviality.",
    "pressSource": "Country Life",
    "collocations": [
      "spirit of conviviality",
      "warm conviviality",
      "share conviviality"
    ],
    "nuanceComparisons": [
      {
        "word": "Conviviality",
        "distinction": "Plaisir partagé d'être ensemble à table."
      },
      {
        "word": "Formality",
        "distinction": "Étiquette rigide et protocole froid."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-47-hospitable",
    "term": "Hospitable",
    "phonetic": "/hɒsˈpɪt.ə.bəl/",
    "level": "B1",
    "category": "Accueil bienveillant",
    "frenchDef": "Hospitalier, accueillant les étrangers comme des amis.",
    "englishDef": "Friendly and welcoming to strangers or guests.",
    "etymology": "Du latin 'hospes' (hôte, voyageur accueilli sous son toit).",
    "pressExcerpt": "The villagers were wonderfully hospitable, offering hot tea and warm scones.",
    "pressSource": "Travelers Tales",
    "collocations": [
      "hospitable host",
      "warmly hospitable",
      "hospitable welcome"
    ],
    "nuanceComparisons": [
      {
        "word": "Hospitable",
        "distinction": "Accueillant et prévenant envers l'hôte."
      },
      {
        "word": "Inhospitable",
        "distinction": "Rebutant, froid et hostile."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-48-atmosphere",
    "term": "Atmosphere",
    "phonetic": "/ˈæt.məs.fɪər/",
    "level": "B1",
    "category": "Ambiance feutrée",
    "frenchDef": "Atmosphère chaleureuse régnant dans la salle.",
    "englishDef": "The pervading tone or mood of a place, situation, or creative work.",
    "etymology": "Du grec 'atmos' (vapeur) et 'sphaira' (sphère céleste).",
    "pressExcerpt": "The historic tea room boasts a tranquil, timeless atmosphere.",
    "pressSource": "Heritage Dining",
    "collocations": [
      "cozy atmosphere",
      "friendly atmosphere",
      "magical atmosphere"
    ],
    "nuanceComparisons": [
      {
        "word": "Atmosphere",
        "distinction": "Climat émotionnel et ambiance d'un lieu."
      },
      {
        "word": "Climate",
        "distinction": "Conditions météorologiques d'une région."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-49-tasting",
    "term": "Tasting",
    "phonetic": "/ˈteɪ.stɪŋ/",
    "level": "B1",
    "category": "Dégustation",
    "frenchDef": "Dégustation méthodique de fromages ou mets.",
    "englishDef": "An event at which small quantities of food or drink are tasted and evaluated.",
    "etymology": "Du verbe anglais 'taste', du français 'tâter' (goûter avec discernement).",
    "pressExcerpt": "The farm arranged a delightful cheese tasting session for visitors.",
    "pressSource": "Artisan Food UK",
    "collocations": [
      "cheese tasting",
      "wine tasting",
      "food tasting session"
    ],
    "nuanceComparisons": [
      {
        "word": "Tasting",
        "distinction": "Évaluation attentive de petites portions."
      },
      {
        "word": "Gluttony",
        "distinction": "Consommation excessive sans attention au goût."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-50-host",
    "term": "Host",
    "phonetic": "/həʊst/",
    "level": "B1",
    "category": "Maître de maison",
    "frenchDef": "Hôte recevant avec générosité.",
    "englishDef": "A person who receives or entertains other people as guests.",
    "etymology": "Du latin 'hospes' (celui qui accueille à sa table).",
    "pressExcerpt": "Our gracious host ensured everyone felt cherished and well fed.",
    "pressSource": "Etiquette Review",
    "collocations": [
      "gracious host",
      "perfect host",
      "thank the host"
    ],
    "nuanceComparisons": [
      {
        "word": "Host",
        "distinction": "Celui qui reçoit les invités."
      },
      {
        "word": "Guest",
        "distinction": "L'invité reçu à table."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-3e-51-metabolism",
    "term": "Metabolism",
    "phonetic": "/məˈtæb.əl.ɪ.zəm/",
    "level": "B1",
    "category": "Physiologie",
    "frenchDef": "Métabolisme transformant les aliments en énergie vitale.",
    "englishDef": "The chemical processes that occur within a living organism in order to maintain life.",
    "etymology": "Du grec 'metabolē' (changement, transformation dynamique).",
    "pressExcerpt": "Regular aerobic exercise stimulates an efficient and healthy metabolism.",
    "pressSource": "Medical Science Today",
    "collocations": [
      "boost metabolism",
      "active metabolism",
      "body metabolism"
    ],
    "nuanceComparisons": [
      {
        "word": "Metabolism",
        "distinction": "Ensemble des transformations chimiques de l'organisme."
      },
      {
        "word": "Digestion",
        "distinction": "Assimilation mécanique et enzymatique des aliments."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-52-nutrients",
    "term": "Nutrients",
    "phonetic": "/ˈnjuː.tri.ənts/",
    "level": "B1",
    "category": "Composés nutritifs",
    "frenchDef": "Nutriments indispensables à la vie cellulaire.",
    "englishDef": "Substances that provide nourishment essential for the maintenance of life.",
    "etymology": "Du latin 'nutrire' (sustenter, alimenter la vie).",
    "pressExcerpt": "Leafy spinach and lentils are rich in vital minerals and essential nutrients.",
    "pressSource": "British Nutrition Journal",
    "collocations": [
      "essential nutrients",
      "absorb nutrients",
      "rich in nutrients"
    ],
    "nuanceComparisons": [
      {
        "word": "Nutrients",
        "distinction": "Éléments nutritifs microscopiques utiles."
      },
      {
        "word": "Calories",
        "distinction": "Mesure énergétique brute des aliments."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-53-vitality",
    "term": "Vitality",
    "phonetic": "/vaɪˈtæl.ə.ti/",
    "level": "B1",
    "category": "Force de vie",
    "frenchDef": "Vitalité éclatante et dynamisme corporel.",
    "englishDef": "The state of being strong and active; energy for living.",
    "etymology": "Du latin 'vitalitas' (puissance d'énergie vitale).",
    "pressExcerpt": "Balanced nutrition and quality sleep restore morning vitality.",
    "pressSource": "Health & Fitness",
    "collocations": [
      "youthful vitality",
      "restore vitality",
      "full of vitality"
    ],
    "nuanceComparisons": [
      {
        "word": "Vitality",
        "distinction": "Dynamisme et rayonnement d'énergie."
      },
      {
        "word": "Lethargy",
        "distinction": "Lourdeur passive et somnolence."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-54-restorative",
    "term": "Restorative",
    "phonetic": "/rɪˈstɔː.rə.tɪv/",
    "level": "B1",
    "category": "Réconfort",
    "frenchDef": "Réparateur, qui redonne des forces au corps.",
    "englishDef": "Having the ability to restore health, strength, or well-being.",
    "etymology": "Du latin 'restaurare' (rétablir dans son état de plénitude originel).",
    "pressExcerpt": "A weekend walk in pine forests proved deeply restorative for the tired mind.",
    "pressSource": "Nature Wellness",
    "collocations": [
      "restorative sleep",
      "restorative power",
      "restorative broth"
    ],
    "nuanceComparisons": [
      {
        "word": "Restorative",
        "distinction": "Qui reconstitue les réserves de force."
      },
      {
        "word": "Exhausting",
        "distinction": "Qui épuise les énergies."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-55-wellbeing",
    "term": "Wellbeing",
    "phonetic": "/ˈwɛl.biː.ɪŋ/",
    "level": "B1",
    "category": "Harmonie globale",
    "frenchDef": "Bien-être physique et sérénité de l'esprit.",
    "englishDef": "The state of being comfortable, healthy, or happy.",
    "etymology": "De 'well' (bonheur, santé) et 'being' (l'être dans sa totalité).",
    "pressExcerpt": "Schools prioritize students' mental wellbeing alongside academic excellence.",
    "pressSource": "The Guardian Education",
    "collocations": [
      "emotional wellbeing",
      "promote wellbeing",
      "sense of wellbeing"
    ],
    "nuanceComparisons": [
      {
        "word": "Wellbeing",
        "distinction": "État de plénitude globale de l'être."
      },
      {
        "word": "Discomfort",
        "distinction": "Gêne et malaise passager."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-56-dietetics",
    "term": "Dietetics",
    "phonetic": "/ˌdaɪ.əˈtɛt.ɪks/",
    "level": "B1",
    "category": "Science de l'assiette",
    "frenchDef": "Diététique appliquant les lois de la nutrition.",
    "englishDef": "The branch of knowledge concerned with the diet and its effects on health.",
    "etymology": "Du grec 'diaita' (manière réglée et tempérante de vivre).",
    "pressExcerpt": "Courses in dietetics train future nutritionists for hospitals and sports academies.",
    "pressSource": "British Dietetic Journal",
    "collocations": [
      "study dietetics",
      "principles of dietetics",
      "modern dietetics"
    ],
    "nuanceComparisons": [
      {
        "word": "Dietetics",
        "distinction": "Science rigoureuse de l'alimentation équilibrée."
      },
      {
        "word": "Gastronomy",
        "distinction": "Art du plaisir raffiné de la bonne chère."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-57-longevity",
    "term": "Longevity",
    "phonetic": "/lɒnˈdʒɛv.ə.ti/",
    "level": "B1",
    "category": "Longue vie",
    "frenchDef": "Longévité en pleine possession de sa santé.",
    "englishDef": "Long life or long existence; enduring vitality across decades.",
    "etymology": "Du latin 'longaevus' (qui vit un long âge).",
    "pressExcerpt": "Mediterranean dietary habits are widely credited with supporting longevity.",
    "pressSource": "The Lancet",
    "collocations": [
      "promote longevity",
      "secret to longevity",
      "healthy longevity"
    ],
    "nuanceComparisons": [
      {
        "word": "Longevity",
        "distinction": "Vieillesse longue et saine."
      },
      {
        "word": "Brevity",
        "distinction": "Caractère éphémère et bref."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-3e-58-profession",
    "term": "Profession",
    "phonetic": "/prəˈfɛʃ.ən/",
    "level": "B1",
    "category": "Métiers diplômés",
    "frenchDef": "Profession qualifiée exigeant savoirs et déontologie.",
    "englishDef": "A paid occupation, especially one that involves prolonged training and a formal qualification.",
    "etymology": "Du latin 'profiteri' (déclarer ouvertement son serment de service).",
    "pressExcerpt": "Medicine and teaching are noble professions devoted to the public good.",
    "pressSource": "Careers UK",
    "collocations": [
      "medical profession",
      "enter a profession",
      "choose a profession"
    ],
    "nuanceComparisons": [
      {
        "word": "Profession",
        "distinction": "Métier qualifié régi par un ordre."
      },
      {
        "word": "Hobby",
        "distinction": "Passe-temps récréatif sans rémunération."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-59-manager",
    "term": "Manager",
    "phonetic": "/ˈmæn.ɪ.dʒər/",
    "level": "B1",
    "category": "Encadrement",
    "frenchDef": "Manager guidant et coordonnant l'équipe.",
    "englishDef": "A person responsible for controlling or administering an organization or group of staff.",
    "etymology": "De l’italien 'maneggiare' (manier avec doigté, conduire).",
    "pressExcerpt": "An effective manager listens to employee feedback and encourages autonomy.",
    "pressSource": "Management Today",
    "collocations": [
      "project manager",
      "general manager",
      "experienced manager"
    ],
    "nuanceComparisons": [
      {
        "word": "Manager",
        "distinction": "Responsable d'équipe opérationnel."
      },
      {
        "word": "Subordinate",
        "distinction": "Collaborateur placé sous la direction d'un responsable."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-60-applicant",
    "term": "Applicant",
    "phonetic": "/ˈæp.lɪ.kənt/",
    "level": "B1",
    "category": "Candidats",
    "frenchDef": "Candidat postulant à un concours ou poste.",
    "englishDef": "A person who makes a formal application for a job, place at college, etc.",
    "etymology": "Du latin 'applicare' (s'appliquer avec zèle à une tâche).",
    "pressExcerpt": "Over two hundred talented applicants applied for the scholarship.",
    "pressSource": "Oxford Admissions",
    "collocations": [
      "successful applicant",
      "job applicant",
      "screen applicants"
    ],
    "nuanceComparisons": [
      {
        "word": "Applicant",
        "distinction": "Personne qui pose sa candidature."
      },
      {
        "word": "Recruiter",
        "distinction": "Personne chargée de sélectionner les profils."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-61-expertise",
    "term": "Expertise",
    "phonetic": "/ˌɛk.spɜːˈtiːz/",
    "level": "B1",
    "category": "Compétences de pointe",
    "frenchDef": "Expertise pointue acquise par l'étude.",
    "englishDef": "Expert skill or knowledge in a particular field.",
    "etymology": "Du latin 'expertus' (qui a éprouvé par l'expérience et le travail).",
    "pressExcerpt": "The archaeological team sought international expertise to decipher the inscription.",
    "pressSource": "BBC Science",
    "collocations": [
      "technical expertise",
      "share expertise",
      "level of expertise"
    ],
    "nuanceComparisons": [
      {
        "word": "Expertise",
        "distinction": "Savoir pointu validé par l'expérience."
      },
      {
        "word": "Incompetence",
        "distinction": "Manque de qualification."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-62-entrepreneur",
    "term": "Entrepreneur",
    "phonetic": "/ˌɒn.trə.prəˈnɜːr/",
    "level": "B1",
    "category": "Initiative",
    "frenchDef": "Entrepreneur créant son entreprise innovante.",
    "englishDef": "A person who sets up a business or businesses, taking on financial risks in the hope of profit.",
    "etymology": "Du français 'entreprendre' (s'engager courageusement dans une œuvre).",
    "pressExcerpt": "Young green entrepreneurs design compostable packaging for supermarkets.",
    "pressSource": "Financial Times",
    "collocations": [
      "successful entrepreneur",
      "social entrepreneur",
      "tech entrepreneur"
    ],
    "nuanceComparisons": [
      {
        "word": "Entrepreneur",
        "distinction": "Créateur et bâtisseur d'entreprise."
      },
      {
        "word": "Employee",
        "distinction": "Salarié sous contrat."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-63-vacancy",
    "term": "Vacancy",
    "phonetic": "/ˈveɪ.kən.si/",
    "level": "B1",
    "category": "Postes à pourvoir",
    "frenchDef": "Poste vacant ouvert au recrutement.",
    "englishDef": "An unoccupied position or job available in a company.",
    "etymology": "Du latin 'vacare' (être vide, disponible pour accueillir un titulaire).",
    "pressExcerpt": "The science department announced an immediate vacancy for a lab assistant.",
    "pressSource": "Job Market UK",
    "collocations": [
      "job vacancy",
      "fill a vacancy",
      "immediate vacancy"
    ],
    "nuanceComparisons": [
      {
        "word": "Vacancy",
        "distinction": "Poste disponible à pourvoir."
      },
      {
        "word": "Tenure",
        "distinction": "Poste titularisé à titre permanent."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-64-leadership",
    "term": "Leadership",
    "phonetic": "/ˈliː.də.ʃɪp/",
    "level": "B1",
    "category": "Capacité d'entraînement",
    "frenchDef": "Leadership inspirant et fédérateur.",
    "englishDef": "The action of leading a group of people or an organization; inspiration.",
    "etymology": "De 'leader' avec le suffixe d'état d'autorité morale '-ship'.",
    "pressExcerpt": "Her principled leadership steered the community organization through crisis.",
    "pressSource": "Harvard Business Review",
    "collocations": [
      "strong leadership",
      "show leadership",
      "leadership qualities"
    ],
    "nuanceComparisons": [
      {
        "word": "Leadership",
        "distinction": "Capacité à guider et inspirer sans contraindre."
      },
      {
        "word": "Tyranny",
        "distinction": "Domination despotique par la force."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-3e-65-citizenship",
    "term": "Citizenship",
    "phonetic": "/ˈsɪt.ɪ.zən.ʃɪp/",
    "level": "B1",
    "category": "Civisme",
    "frenchDef": "Citoyenneté active et engagement dans la cité.",
    "englishDef": "The position or status of being a citizen of a particular country, with accompanying civic duties.",
    "etymology": "De 'citizen' (du vieux français citéen, habitant de la cité).",
    "pressExcerpt": "Secondary schools cultivate responsible citizenship and environmental awareness.",
    "pressSource": "UNESCO Education",
    "collocations": [
      "active citizenship",
      "grant citizenship",
      "duties of citizenship"
    ],
    "nuanceComparisons": [
      {
        "word": "Citizenship",
        "distinction": "Statut de citoyen porteur de droits et devoirs."
      },
      {
        "word": "Alienage",
        "distinction": "Statut de non-ressortissant étranger."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-66-democracy",
    "term": "Democracy",
    "phonetic": "/dɪˈmɒk.rə.si/",
    "level": "B1",
    "category": "Institutions",
    "frenchDef": "Démocratie où le pouvoir émane des citoyens.",
    "englishDef": "A system of government by the whole population, typically through elected representatives.",
    "etymology": "Du grec 'dēmokratia' (gouvernement exercé par le peuple).",
    "pressExcerpt": "Freedom of the press and free elections are fundamental pillars of modern democracy.",
    "pressSource": "The Economist",
    "collocations": [
      "parliamentary democracy",
      "defend democracy",
      "principles of democracy"
    ],
    "nuanceComparisons": [
      {
        "word": "Democracy",
        "distinction": "Régime où le peuple exerce sa souveraineté."
      },
      {
        "word": "Autocracy",
        "distinction": "Régime où un seul homme détient tous les pouvoirs."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-67-allegiance",
    "term": "Allegiance",
    "phonetic": "/əˈliː.dʒəns/",
    "level": "B1",
    "category": "Fidélité civique",
    "frenchDef": "Allégeance solennelle et fidélité à la nation.",
    "englishDef": "Loyalty or the commitment of a subordinate to a superior or of an individual to a group or cause.",
    "etymology": "De l’ancien français 'lige' (vassal pleinement dévoué à son suzerain).",
    "pressExcerpt": "New magistrates swear an oath of allegiance to uphold justice impartially.",
    "pressSource": "Legal Gazette",
    "collocations": [
      "swear allegiance",
      "pledge allegiance",
      "oath of allegiance"
    ],
    "nuanceComparisons": [
      {
        "word": "Allegiance",
        "distinction": "Devoir de fidélité juré à l'État."
      },
      {
        "word": "Treason",
        "distinction": "Trahison criminelle de la patrie."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-68-companionship",
    "term": "Companionship",
    "phonetic": "/kəmˈpæn.jən.ʃɪp/",
    "level": "B1",
    "category": "Partage amical",
    "frenchDef": "Compagnie chaleureuse rompant la solitude.",
    "englishDef": "A feeling of fellowship or friendship, especially when sharing life's daily moments.",
    "etymology": "De 'companion' (du latin com-panis : celui avec qui l'on partage le pain quotidien).",
    "pressExcerpt": "Her rescue dog provided comforting companionship during long winter evenings.",
    "pressSource": "Country Life",
    "collocations": [
      "warm companionship",
      "seek companionship",
      "loyal companionship"
    ],
    "nuanceComparisons": [
      {
        "word": "Companionship",
        "distinction": "Présence réconfortante partagée au quotidien."
      },
      {
        "word": "Isolation",
        "distinction": "Isolement solitaire subi."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-69-sentiment",
    "term": "Sentiment",
    "phonetic": "/ˈsɛn.tɪ.mənt/",
    "level": "B1",
    "category": "Émotions profondes",
    "frenchDef": "Sentiment délicat et ressenti moral.",
    "englishDef": "A view or opinion that is held or expressed, or an emotional attitude.",
    "etymology": "Du latin 'sentire' (ressentir avec finesse et profondeur d'âme).",
    "pressExcerpt": "The handwritten letter conveyed profound sentiment of heartfelt gratitude.",
    "pressSource": "Literary Quarterly",
    "collocations": [
      "express a sentiment",
      "noble sentiment",
      "popular sentiment"
    ],
    "nuanceComparisons": [
      {
        "word": "Sentiment",
        "distinction": "Émotion mûrie et réfléchie du cœur."
      },
      {
        "word": "Impulse",
        "distinction": "Pulsion soudaine et irréfléchie."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-70-territory",
    "term": "Territory",
    "phonetic": "/ˈtɛr.ɪ.tər.i/",
    "level": "B1",
    "category": "Géographie humaine",
    "frenchDef": "Territoire géographique souverain.",
    "englishDef": "An area of land under the jurisdiction of a ruler or state.",
    "etymology": "Du latin 'territorium' (terre soumise à la loi d'une juridiction).",
    "pressExcerpt": "The peaceful archipelago was recognized as an autonomous maritime territory.",
    "pressSource": "Geographical Review",
    "collocations": [
      "national territory",
      "explore territory",
      "sovereign territory"
    ],
    "nuanceComparisons": [
      {
        "word": "Territory",
        "distinction": "Espace géographique administré par une loi."
      },
      {
        "word": "Wilderness",
        "distinction": "Espace vierge sans administration humaine."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-71-affinity",
    "term": "Affinity",
    "phonetic": "/əˈfɪn.ə.ti/",
    "level": "B1",
    "category": "Harmonie d'âmes",
    "frenchDef": "Affinité naturelle et communion de pensées.",
    "englishDef": "A natural liking for and understanding of someone or something; a shared sympathy.",
    "etymology": "Du latin 'affinitas' (voisinage, parenté spirituelle ou d'alliance).",
    "pressExcerpt": "She felt an immediate cultural affinity with English choral music.",
    "pressSource": "Classical Voice",
    "collocations": [
      "natural affinity",
      "feel an affinity",
      "deep affinity"
    ],
    "nuanceComparisons": [
      {
        "word": "Affinity",
        "distinction": "Complicité spontanée et proximité d'esprit."
      },
      {
        "word": "Aversion",
        "distinction": "Répulsion instinctive et rejet."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-3e-72-devoted",
    "term": "Devoted",
    "phonetic": "/dɪˈvəʊ.tɪd/",
    "level": "B1",
    "category": "Dévouement",
    "frenchDef": "Dévoué corps et âme à ceux qu'on aime.",
    "englishDef": "Very loving or loyal; giving all one's efforts to a person or noble purpose.",
    "etymology": "Du latin 'devovere' (consacrer solennellement son existence à autrui).",
    "pressExcerpt": "The devoted teacher mentored generations of underprivileged students.",
    "pressSource": "TES Magazine",
    "collocations": [
      "devoted friend",
      "deeply devoted",
      "devoted to education"
    ],
    "nuanceComparisons": [
      {
        "word": "Devoted",
        "distinction": "Plein d'amour fidèle et attentif."
      },
      {
        "word": "Fickle",
        "distinction": "Inconstant et changeant à tout vent."
      }
    ],
    "gradeLevel": "3e",
    "gradeLabel": "3e (Collège)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-01-habitus",
    "term": "Habitus",
    "phonetic": "/ˈhæb.ɪ.təs/",
    "level": "B1",
    "category": "Sociologie du quotidien",
    "frenchDef": "Habitus, ensemble de manières d'être et d'agir intériorisées.",
    "englishDef": "Ingrained habits, skills, and dispositions reflecting one's cultural social background.",
    "etymology": "Du latin 'habitus' (manière d’être, maintien du corps et de l’esprit).",
    "pressExcerpt": "Her punctual academic habitus stemmed from years of disciplined boarding school life.",
    "pressSource": "Sociological Review",
    "collocations": [
      "cultural habitus",
      "ingrained habitus",
      "daily habitus"
    ],
    "nuanceComparisons": [
      {
        "word": "Habitus",
        "distinction": "Disposition intériorisée durable."
      },
      {
        "word": "Impulse",
        "distinction": "Réaction instinctive immédiate."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-02-punctuality",
    "term": "Punctuality",
    "phonetic": "/ˌpʌŋk.tʃuˈæl.ə.ti/",
    "level": "B1",
    "category": "Discipline de vie",
    "frenchDef": "Ponctualité rigoureuse respectant le temps d'autrui.",
    "englishDef": "The characteristic of being on time or prompt.",
    "etymology": "Du latin 'punctum' (le point précis marqué sur le cadran solaire).",
    "pressExcerpt": "British administrative etiquette regards punctuality as the highest form of courtesy.",
    "pressSource": "Oxford Protocol",
    "collocations": [
      "strict punctuality",
      "value punctuality",
      "habit of punctuality"
    ],
    "nuanceComparisons": [
      {
        "word": "Punctuality",
        "distinction": "Exactitude rigoureuse aux rendez-vous."
      },
      {
        "word": "Tardiness",
        "distinction": "Retard habituel négligent."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-03-conscientiousness",
    "term": "Conscientiousness",
    "phonetic": "/ˌkɒn.ʃiˈɛn.ʃəs.nəs/",
    "level": "B1",
    "category": "Rigueur morale",
    "frenchDef": "Conscience professionnelle et minutie morale.",
    "englishDef": "The quality of wishing to do one's work or duty thoroughly and well.",
    "etymology": "Du latin 'conscientia' (connaissance partagée du juste et du vrai).",
    "pressExcerpt": "Her academic conscientiousness earned her praise from every university tutor.",
    "pressSource": "Cambridge Academic",
    "collocations": [
      "academic conscientiousness",
      "moral conscientiousness",
      "show conscientiousness"
    ],
    "nuanceComparisons": [
      {
        "word": "Conscientiousness",
        "distinction": "Application méthodique et scrupuleuse."
      },
      {
        "word": "Carelessness",
        "distinction": "Négligence désinvolte."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-04-diurnal",
    "term": "Diurnal",
    "phonetic": "/daɪˈɜː.nəl/",
    "level": "B1",
    "category": "Rythmes circadiens",
    "frenchDef": "Diurne, s'accomplissant au cours de la journée solaire.",
    "englishDef": "Of or during the day; daily; recurring every day.",
    "etymology": "Du latin 'diurnus' (qui appartient au jour lumineux).",
    "pressExcerpt": "The diurnal rhythms of the boarding school alternated between study and quiet chapel time.",
    "pressSource": "Nature Human Behaviour",
    "collocations": [
      "diurnal rhythm",
      "diurnal routine",
      "diurnal cycle"
    ],
    "nuanceComparisons": [
      {
        "word": "Diurnal",
        "distinction": "Relatif à la clarté du jour."
      },
      {
        "word": "Nocturnal",
        "distinction": "Relatif à l'obscurité de la nuit."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-05-equanimity",
    "term": "Equanimity",
    "phonetic": "/ˌɛk.wəˈnɪm.ə.ti/",
    "level": "B1",
    "category": "Sérénité stoïcienne",
    "frenchDef": "Équanimité, sérénité constante de l'âme dans l'épreuve.",
    "englishDef": "Mental calmness, composure, and evenness of temper, especially in difficult situations.",
    "etymology": "Du latin 'aequanimitas' (esprit égal, âme toujours stable face aux vents).",
    "pressExcerpt": "Faced with conflicting exam schedules, she preserved an admirable equanimity.",
    "pressSource": "Philosophical Studies",
    "collocations": [
      "serene equanimity",
      "preserve equanimity",
      "unshakable equanimity"
    ],
    "nuanceComparisons": [
      {
        "word": "Equanimity",
        "distinction": "Calme d'esprit constant et souverain."
      },
      {
        "word": "Agitation",
        "distinction": "Trouble anxieux et fébrilité."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-06-demeanor",
    "term": "Demeanor",
    "phonetic": "/dɪˈmiː.nər/",
    "level": "B1",
    "category": "Port & Maintien",
    "frenchDef": "Tenue corporelle distinguée et port mesuré.",
    "englishDef": "Outward behavior or bearing.",
    "etymology": "De l’ancien français 'demener' (conduire sa propre démarche avec gravité).",
    "pressExcerpt": "His modest yet authoritative demeanor commanded immediate respect across the lecture hall.",
    "pressSource": "The Times",
    "collocations": [
      "modest demeanor",
      "graceful demeanor",
      "noble demeanor"
    ],
    "nuanceComparisons": [
      {
        "word": "Demeanor",
        "distinction": "Tenue extérieure digne."
      },
      {
        "word": "Affectation",
        "distinction": "Maniérisme hypocrite forcé."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-07-cadence",
    "term": "Cadence",
    "phonetic": "/ˈkeɪ.dəns/",
    "level": "B1",
    "category": "Rythme de vie",
    "frenchDef": "Cadence harmonieuse réglant l'emploi du temps.",
    "englishDef": "A regular rhythm or pace of everyday events.",
    "etymology": "Du latin 'cadere' (chute régulière de la mesure temporelle).",
    "pressExcerpt": "The autumn term found its brisk, productive cadence after the first fortnight.",
    "pressSource": "Oxford Life",
    "collocations": [
      "daily cadence",
      "brisk cadence",
      "life's cadence"
    ],
    "nuanceComparisons": [
      {
        "word": "Cadence",
        "distinction": "Pulsation rythmique ordonnée."
      },
      {
        "word": "Chaos",
        "distinction": "Désordre imprévisible sans repères."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-2nde-08-odyssey",
    "term": "Odyssey",
    "phonetic": "/ˈɒd.ə.si/",
    "level": "B1",
    "category": "Grandes épopées",
    "frenchDef": "Odyssée, long périple semé d'épreuves et de métamorphoses.",
    "englishDef": "A long and eventful or adventurous journey or experience.",
    "etymology": "Du grec 'Odusseia' (l'épopée d'Ulysse rentrant à Ithaque).",
    "pressExcerpt": "Their rail exploration from London to Istanbul turned into a cultural odyssey.",
    "pressSource": "The Guardian Travel",
    "collocations": [
      "cultural odyssey",
      "modern odyssey",
      "personal odyssey"
    ],
    "nuanceComparisons": [
      {
        "word": "Odyssey",
        "distinction": "Épopée formatrice transformant le voyageur."
      },
      {
        "word": "Tour",
        "distinction": "Circuit touristique balisé d'avance."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-09-pilgrimage",
    "term": "Pilgrimage",
    "phonetic": "/ˈpɪl.ɡrɪ.mɪdʒ/",
    "level": "B1",
    "category": "Quêtes sacrées",
    "frenchDef": "Pèlerinage en terre sainte ou vers un haut lieu de culture.",
    "englishDef": "A journey to a place associated with someone or something well known or respected.",
    "etymology": "Du latin 'peregrinus' (celui qui chemine à travers champs en terre étrangère).",
    "pressExcerpt": "Literary scholars make an annual pilgrimage to Shakespeare's birthplace at Stratford-upon-Avon.",
    "pressSource": "Literary Review",
    "collocations": [
      "literary pilgrimage",
      "annual pilgrimage",
      "spiritual pilgrimage"
    ],
    "nuanceComparisons": [
      {
        "word": "Pilgrimage",
        "distinction": "Voyage accompli dans une intention sacrée."
      },
      {
        "word": "Vacation",
        "distinction": "Séjour de simple villégiature."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-10-uncharted",
    "term": "Uncharted",
    "phonetic": "/ʌnˈtʃɑː.tɪd/",
    "level": "B1",
    "category": "Terres inconnues",
    "frenchDef": "Inexploré, qui ne figure sur aucune carte maritime.",
    "englishDef": "An area of land or sea not mapped or surveyed; unfamiliar.",
    "etymology": "Composé du préfixe privatif 'un-' et de 'chart' (carte marine, du latin charta).",
    "pressExcerpt": "The sailors ventured into uncharted Arctic waters where pack ice drifted silently.",
    "pressSource": "Royal Geographical Society",
    "collocations": [
      "uncharted waters",
      "uncharted territory",
      "uncharted wilderness"
    ],
    "nuanceComparisons": [
      {
        "word": "Uncharted",
        "distinction": "Zone vierge de tout relevé cartographique."
      },
      {
        "word": "Surveyed",
        "distinction": "Territoire arpenté et cartographié avec précision."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-11-transit",
    "term": "Transit",
    "phonetic": "/ˈtræn.zɪt/",
    "level": "B1",
    "category": "Passage international",
    "frenchDef": "Transit entre deux correspondances ou frontières.",
    "englishDef": "The carrying of people or goods from one place to another; passage.",
    "etymology": "Du latin 'transitus' (l'action de passer au-delà).",
    "pressExcerpt": "Passengers in international transit waited in the quiet departures lounge.",
    "pressSource": "Aviation World",
    "collocations": [
      "in transit",
      "transit lounge",
      "rapid transit"
    ],
    "nuanceComparisons": [
      {
        "word": "Transit",
        "distinction": "Traversée de passage sans séjour."
      },
      {
        "word": "Settlement",
        "distinction": "Établissement sédentaire durable."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-12-sojourn",
    "term": "Sojourn",
    "phonetic": "/ˈsɒdʒ.ɜːn/",
    "level": "B1",
    "category": "Séjours temporaires",
    "frenchDef": "Séjour temporaire dans un pays d'adoption.",
    "englishDef": "A temporary stay at a foreign place.",
    "etymology": "Du latin 'subdiurnare' (demeurer quelques jours durant).",
    "pressExcerpt": "His summer sojourn in Edinburgh inspired a cycle of landscape sonnets.",
    "pressSource": "Poetry Review",
    "collocations": [
      "brief sojourn",
      "delightful sojourn",
      "foreign sojourn"
    ],
    "nuanceComparisons": [
      {
        "word": "Sojourn",
        "distinction": "Séjour temporaire d'agrément ou d'étude."
      },
      {
        "word": "Emigration",
        "distinction": "Expatriation définitive sans retour."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-13-waypoint",
    "term": "Waypoint",
    "phonetic": "/ˈweɪ.pɔɪnt/",
    "level": "B1",
    "category": "Points de route",
    "frenchDef": "Point de repère ou jalon intermédiaire d'un plan de vol.",
    "englishDef": "A stopping place on a journey; coordinates marking a route.",
    "etymology": "De 'way' (chemin) et 'point' (coordonnée précise).",
    "pressExcerpt": "The navigator entered each GPS waypoint before setting sail across the North Sea.",
    "pressSource": "Yachting Monthly",
    "collocations": [
      "navigational waypoint",
      "reach a waypoint",
      "intermediate waypoint"
    ],
    "nuanceComparisons": [
      {
        "word": "Waypoint",
        "distinction": "Jalon intermédiaire calculé sur une carte."
      },
      {
        "word": "Destination",
        "distinction": "Point d'arrivée terminal."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-14-seafaring",
    "term": "Seafaring",
    "phonetic": "/ˈsiːˌfeə.rɪŋ/",
    "level": "B1",
    "category": "Traditions de mer",
    "frenchDef": "Navigation maritime au long cours et vie de marin.",
    "englishDef": "Traveling by sea, especially regularly; maritime tradition.",
    "etymology": "Du vieil anglais 'sǣ' (mer) et 'faran' (voyager au large).",
    "pressExcerpt": "Britain's seafaring heritage is preserved in historic dockyards along the Solent.",
    "pressSource": "National Maritime Museum",
    "collocations": [
      "seafaring nation",
      "seafaring tradition",
      "ancient seafaring"
    ],
    "nuanceComparisons": [
      {
        "word": "Seafaring",
        "distinction": "Navigation hauturière régulière."
      },
      {
        "word": "Landlocked",
        "distinction": "Enclavé sans accès à l'océan."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-2nde-15-hegemony",
    "term": "Hegemony",
    "phonetic": "/hɪˈɡɛm.ə.ni/",
    "level": "B1",
    "category": "Domination politique",
    "frenchDef": "Hégémonie politique ou militaire sur des puissances voisines.",
    "englishDef": "Leadership or dominance, especially by one state or social group over others.",
    "etymology": "Du grec 'hēgemonia' (commandement en chef du chef d'alliance).",
    "pressExcerpt": "Spartan hegemony in ancient Greece faced challenge from Athens and Thebes.",
    "pressSource": "Historical Journal",
    "collocations": [
      "cultural hegemony",
      "military hegemony",
      "global hegemony"
    ],
    "nuanceComparisons": [
      {
        "word": "Hegemony",
        "distinction": "Suprématie d'influence et de commandement."
      },
      {
        "word": "Subjugation",
        "distinction": "Asservissement servile par les fers."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-16-chronicle",
    "term": "Chronicle",
    "phonetic": "/ˈkrɒn.ɪ.kəl/",
    "level": "B1",
    "category": "Annales historiques",
    "frenchDef": "Chronique consignant les événements année par année.",
    "englishDef": "A factual written account of important or historical events in the order of their occurrence.",
    "etymology": "Du grec 'khronikos' (relatif au cours irréversible du temps).",
    "pressExcerpt": "The Anglo-Saxon Chronicle preserves invaluable records of early English kings.",
    "pressSource": "British Library",
    "collocations": [
      "medieval chronicle",
      "historic chronicle",
      "write a chronicle"
    ],
    "nuanceComparisons": [
      {
        "word": "Chronicle",
        "distinction": "Récit chronologique factuel ordonné."
      },
      {
        "word": "Legend",
        "distinction": "Récit mythique brodé par l'imagination."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-17-feudalism",
    "term": "Feudalism",
    "phonetic": "/ˈfjuː.dəl.ɪ.zəm/",
    "level": "B1",
    "category": "Féodalité",
    "frenchDef": "Système féodal liant suzerain et vassal par l'hommage.",
    "englishDef": "The dominant social system in medieval Europe based on landholding in exchange for service.",
    "etymology": "Du latin médiéval 'feudum' (fief concédé contre serment de fidélité).",
    "pressExcerpt": "Norman feudalism centralized royal power through the Domesday survey of 1086.",
    "pressSource": "Oxford History",
    "collocations": [
      "medieval feudalism",
      "collapse of feudalism",
      "feudalism society"
    ],
    "nuanceComparisons": [
      {
        "word": "Feudalism",
        "distinction": "Ordre féodal fondé sur le fief et l'hommage."
      },
      {
        "word": "Capitalism",
        "distinction": "Système économique fondé sur le marché et le capital."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-18-relics",
    "term": "Relics",
    "phonetic": "/ˈrɛl.ɪks/",
    "level": "B1",
    "category": "Trésors anciens",
    "frenchDef": "Reliques sacrées ou vestiges précieux du passé.",
    "englishDef": "Objects surviving from an earlier time, especially of historical or religious interest.",
    "etymology": "Du latin 'reliquiae' (ce qui reste après le passage des siècles).",
    "pressExcerpt": "Medieval pilgrims traveled barefoot to venerate the relics of Thomas Becket.",
    "pressSource": "Canterbury Archives",
    "collocations": [
      "sacred relics",
      "historic relics",
      "precious relics"
    ],
    "nuanceComparisons": [
      {
        "word": "Relics",
        "distinction": "Restes vénérés conservés des ancêtres."
      },
      {
        "word": "Novelties",
        "distinction": "Objets récents sans valeur historique."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-19-ancestry",
    "term": "Ancestry",
    "phonetic": "/ˈæn.səs.tri/",
    "level": "B1",
    "category": "Généalogie",
    "frenchDef": "Ascendance familiale et lignée des aïeux.",
    "englishDef": "One's family or ethnic descent across generations.",
    "etymology": "Du latin 'antecessor' (celui qui a marché avant nous).",
    "pressExcerpt": "DNA archives enable historians to trace royal ancestry back a thousand years.",
    "pressSource": "Genealogy Quarterly",
    "collocations": [
      "ancient ancestry",
      "trace one's ancestry",
      "noble ancestry"
    ],
    "nuanceComparisons": [
      {
        "word": "Ancestry",
        "distinction": "Lignée ascendante des générations antérieures."
      },
      {
        "word": "Posterity",
        "distinction": "Descendance future des générations à venir."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-20-preservation",
    "term": "Preservation",
    "phonetic": "/ˌprɛz.əˈveɪ.ʃən/",
    "level": "B1",
    "category": "Sauvegarde des monuments",
    "frenchDef": "Préservation rigoureuse du patrimoine architectural.",
    "englishDef": "The act or process of maintaining something in its original or existing state.",
    "etymology": "Du latin 'praeservare' (garder intact d'avance contre l'outrage du temps).",
    "pressExcerpt": "The National Trust dedicates millions to the preservation of coastal heritage cliffs.",
    "pressSource": "National Trust",
    "collocations": [
      "historic preservation",
      "architectural preservation",
      "cultural preservation"
    ],
    "nuanceComparisons": [
      {
        "word": "Preservation",
        "distinction": "Maintien dans l'état originel."
      },
      {
        "word": "Demolition",
        "distinction": "Destruction volontaire d'un édifice."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-21-lineage",
    "term": "Lineage",
    "phonetic": "/ˈlɪn.i.ɪdʒ/",
    "level": "B1",
    "category": "Filiations nobles",
    "frenchDef": "Lignée ininterrompue d'une dynastie.",
    "englishDef": "Lineal descent from an ancestor; ancestry or pedigree.",
    "etymology": "Du latin 'linea' (fil, ligne droite tracée dans l'arbre généalogique).",
    "pressExcerpt": "The royal family traced its lineage directly to medieval monarchs.",
    "pressSource": "Peerage Review",
    "collocations": [
      "ancient lineage",
      "noble lineage",
      "direct lineage"
    ],
    "nuanceComparisons": [
      {
        "word": "Lineage",
        "distinction": "Filiation directe de sang sur l'arbre généalogique."
      },
      {
        "word": "Dynasty",
        "distinction": "L'ensemble des règnes d'une même maison royale."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-2nde-22-virtuosity",
    "term": "Virtuosity",
    "phonetic": "/ˌvɜː.tʃuˈɒs.ə.ti/",
    "level": "B1",
    "category": "Maîtrise suprême",
    "frenchDef": "Virtuosité technique éblouissante.",
    "englishDef": "Great skill in music or another artistic pursuit.",
    "etymology": "Du latin 'virtus' (excellence morale et habileté admirable).",
    "pressExcerpt": "The violinist played Paganini's caprices with breathtaking virtuosity.",
    "pressSource": "The Strad",
    "collocations": [
      "technical virtuosity",
      "display virtuosity",
      "musical virtuosity"
    ],
    "nuanceComparisons": [
      {
        "word": "Virtuosity",
        "distinction": "Perfection technique étincelante."
      },
      {
        "word": "Clumsiness",
        "distinction": "Maladresse technique heurtée."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-23-engraving",
    "term": "Engraving",
    "phonetic": "/ɪnˈɡreɪ.vɪŋ/",
    "level": "B1",
    "category": "Gravure d'art",
    "frenchDef": "Gravure sur cuivre ou bois d'imprimerie.",
    "englishDef": "A print made from an engraved plate, block, or other surface.",
    "etymology": "Du vieil anglais 'grafan' (creuser au burin dans le métal).",
    "pressExcerpt": "William Blake produced visionary poetry illustrated with hand-colored engravings.",
    "pressSource": "British Museum",
    "collocations": [
      "copper engraving",
      "wood engraving",
      "antique engraving"
    ],
    "nuanceComparisons": [
      {
        "word": "Engraving",
        "distinction": "Taille au burin pour impression d'estampes."
      },
      {
        "word": "Etching",
        "distinction": "Eau-forte mordue chimiquement par l'acide."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-24-artisanal",
    "term": "Artisanal",
    "phonetic": "/ˌɑː.tɪˈzæn.əl/",
    "level": "B1",
    "category": "Fait main",
    "frenchDef": "Artisanal, confectionné dans le respect du geste traditionnel.",
    "englishDef": "Made in a traditional or non-mechanized way by a skilled craftsperson.",
    "etymology": "De l’italien 'artigiano' (homme de métier exerçant son art).",
    "pressExcerpt": "Artisanal paper-makers in Somerset still dry cotton rag paper on wool felts.",
    "pressSource": "Crafts Council",
    "collocations": [
      "artisanal craft",
      "artisanal methods",
      "artisanal bakery"
    ],
    "nuanceComparisons": [
      {
        "word": "Artisanal",
        "distinction": "Ouvré à la main avec authenticité."
      },
      {
        "word": "Industrial",
        "distinction": "Fabriqué à la chaîne de façon automatisée."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-25-cinematography",
    "term": "Cinematography",
    "phonetic": "/ˌsɪn.ə.məkˈtɒɡ.rə.fi/",
    "level": "B1",
    "category": "Lumière & Cadre",
    "frenchDef": "Direction de la photographie cinématographique.",
    "englishDef": "The art of photography and camerawork in filmmaking.",
    "etymology": "Du grec 'kinēma' (mouvement) et 'graphein' (inscrire sur pellicule).",
    "pressExcerpt": "The film won international acclaim for its poetic, natural-light cinematography.",
    "pressSource": "Sight & Sound",
    "collocations": [
      "brilliant cinematography",
      "director of cinematography",
      "masterful cinematography"
    ],
    "nuanceComparisons": [
      {
        "word": "Cinematography",
        "distinction": "Art du cadrage et de l'éclairage de film."
      },
      {
        "word": "Screenplay",
        "distinction": "Le texte et dialogue rédigé sur papier."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-26-imagination",
    "term": "Imagination",
    "phonetic": "/ɪˌmædʒ.ɪˈneɪ.ʃən/",
    "level": "B1",
    "category": "Faculté créatrice",
    "frenchDef": "Imagination féconde enfantant des mondes.",
    "englishDef": "The faculty of forming new ideas, images, or concepts not present to the senses.",
    "etymology": "Du latin 'imaginari' (concevoir des images vives dans l'esprit).",
    "pressExcerpt": "Poetry gives flight to human imagination, transcending mundane constraints.",
    "pressSource": "Times Literary Supplement",
    "collocations": [
      "fertile imagination",
      "spark the imagination",
      "vivid imagination"
    ],
    "nuanceComparisons": [
      {
        "word": "Imagination",
        "distinction": "Faculté poétique créatrice de mondes."
      },
      {
        "word": "Realism",
        "distinction": "Attachement scrupuleux à la factualité brute."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-27-sculptor",
    "term": "Sculptor",
    "phonetic": "/ˈskʌlp.tər/",
    "level": "B1",
    "category": "Maîtres de la matière",
    "frenchDef": "Sculpteur façonnant marbre ou argile.",
    "englishDef": "An artist who makes sculptures.",
    "etymology": "Du latin 'sculpere' (tailler, ciseler le bloc de marbre brut).",
    "pressExcerpt": "The contemporary sculptor unveiled a colossal bronze monument in the public park.",
    "pressSource": "Tate News",
    "collocations": [
      "famous sculptor",
      "bronze sculptor",
      "master sculptor"
    ],
    "nuanceComparisons": [
      {
        "word": "Sculptor",
        "distinction": "Artiste travaillant les volumes tridimensionnels."
      },
      {
        "word": "Painter",
        "distinction": "Artiste travaillant les pigments sur toile."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-28-craft",
    "term": "Craft",
    "phonetic": "/krɑːft/",
    "level": "B1",
    "category": "Art & Métier",
    "frenchDef": "Artisanat exigeant dévouement et patience.",
    "englishDef": "An activity involving skill in making things by hand; trade.",
    "etymology": "Du vieil anglais 'cræft' (pouvoir créateur, science du geste).",
    "pressExcerpt": "Generations of bookbinders passed down the honored craft of leather gilding.",
    "pressSource": "Crafts Magazine",
    "collocations": [
      "master a craft",
      "traditional craft",
      "learned craft"
    ],
    "nuanceComparisons": [
      {
        "word": "Craft",
        "distinction": "Savoir-faire manuel hérité et perfectionné."
      },
      {
        "word": "Theory",
        "distinction": "Spéculation intellectuelle pure sans pratique."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-2nde-29-tenacity",
    "term": "Tenacity",
    "phonetic": "/tɪˈnæs.ə.ti/",
    "level": "B1",
    "category": "Volonté farouche",
    "frenchDef": "Ténacité farouche qui ne renonce jamais.",
    "englishDef": "The quality or fact of being able to grip something firmly; determination.",
    "etymology": "Du latin 'tenax' (qui tient ferme, qui ne lâche pas prise).",
    "pressExcerpt": "Her tactical tenacity on the clay court wore down her formidable opponent.",
    "pressSource": "Tennis World",
    "collocations": [
      "fierce tenacity",
      "demonstrate tenacity",
      "admirable tenacity"
    ],
    "nuanceComparisons": [
      {
        "word": "Tenacity",
        "distinction": "Accrochage acharné face à l'obstacle."
      },
      {
        "word": "Capitulation",
        "distinction": "Reddition docile sans combat."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-30-marathon",
    "term": "Marathon",
    "phonetic": "/ˈmær.ə.θən/",
    "level": "B1",
    "category": "Épreuve d'endurance",
    "frenchDef": "Marathon légendaire de 42,195 kilomètres.",
    "englishDef": "A long-distance running race with an official distance of 42.195 km.",
    "etymology": "De la plaine grecque de Marathon d'où le messager courut annoncer la victoire.",
    "pressExcerpt": "Over forty thousand runners crossed Tower Bridge during the London Marathon.",
    "pressSource": "Athletics Weekly",
    "collocations": [
      "run a marathon",
      "marathon runner",
      "finish the marathon"
    ],
    "nuanceComparisons": [
      {
        "word": "Marathon",
        "distinction": "Course de 42 km d'endurance extrême."
      },
      {
        "word": "Sprint",
        "distinction": "Course de vitesse pure sur 100 ou 200 mètres."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-31-prowess",
    "term": "Prowess",
    "phonetic": "/ˈpraʊ.ɪs/",
    "level": "B1",
    "category": "Vaillance sportive",
    "frenchDef": "Prouesse physique et excellence technique.",
    "englishDef": "Skill or expertise in a particular activity or field; bravery in sport.",
    "etymology": "De l’ancien français 'prouesse' (bravoure et vaillance chevaleresque).",
    "pressExcerpt": "The gymnast displayed astonishing prowess on the balance beam.",
    "pressSource": "Olympic Gazette",
    "collocations": [
      "athletic prowess",
      "demonstrate prowess",
      "physical prowess"
    ],
    "nuanceComparisons": [
      {
        "word": "Prowess",
        "distinction": "Bravoure et habileté exceptionnelle."
      },
      {
        "word": "Ineptitude",
        "distinction": "Maladresse incapable."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-32-regimen",
    "term": "Regimen",
    "phonetic": "/ˈrɛdʒ.ɪ.mən/",
    "level": "B1",
    "category": "Discipline d'entraînement",
    "frenchDef": "Régime d'entraînement rigoureusement cadencé.",
    "englishDef": "A prescribed course of medical treatment, diet, or exercise for the promotion of health.",
    "etymology": "Du latin 'regere' (gouverner, conduire selon une règle stricte).",
    "pressExcerpt": "Olympic rowers follow an uncompromising training regimen beginning at sunrise.",
    "pressSource": "Sports Medicine",
    "collocations": [
      "strict regimen",
      "training regimen",
      "daily regimen"
    ],
    "nuanceComparisons": [
      {
        "word": "Regimen",
        "distinction": "Plan de discipline athlétique ordonné."
      },
      {
        "word": "Disorder",
        "distinction": "Anarchie d'habitudes sans rigueur."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-33-triumph",
    "term": "Triumph",
    "phonetic": "/ˈtraɪ.əmf/",
    "level": "B1",
    "category": "Gloire des vainqueurs",
    "frenchDef": "Triomphe éclatant couronné d'honneurs.",
    "englishDef": "A great victory or achievement, celebrated with pride.",
    "etymology": "Du latin 'triumphus' (cortège triomphal du général victorieux à Rome).",
    "pressExcerpt": "Their cup final triumph ended a twenty-year drought for the community club.",
    "pressSource": "The Guardian Sport",
    "collocations": [
      "celebrate a triumph",
      "resounding triumph",
      "personal triumph"
    ],
    "nuanceComparisons": [
      {
        "word": "Triumph",
        "distinction": "Victoire célébrée avec majesté."
      },
      {
        "word": "Fiasco",
        "distinction": "Échec cuisant et humiliant."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-34-fortitude",
    "term": "Fortitude",
    "phonetic": "/ˈfɔː.tɪ.tjuːd/",
    "level": "B1",
    "category": "Courage de l'âme",
    "frenchDef": "Force morale dans l'épreuve sportive.",
    "englishDef": "Courage in pain or adversity.",
    "etymology": "Du latin 'fortitudo' (vaillance d'âme inébranlable).",
    "pressExcerpt": "Cycling through freezing mountain rain required extraordinary moral fortitude.",
    "pressSource": "Cycling Weekly",
    "collocations": [
      "mental fortitude",
      "display fortitude",
      "moral fortitude"
    ],
    "nuanceComparisons": [
      {
        "word": "Fortitude",
        "distinction": "Courage silencieux dans la douleur prolongée."
      },
      {
        "word": "Panic",
        "distinction": "Affolement incontrôlé."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-35-discipline",
    "term": "Discipline",
    "phonetic": "/ˈdɪs.ə.plɪn/",
    "level": "B1",
    "category": "Rigueur d'entraînement",
    "frenchDef": "Discipline consentie pour atteindre les sommets.",
    "englishDef": "The practice of training people to obey rules, using punishment or dedication to correct disobedience.",
    "etymology": "Du latin 'disciplina' (enseignement reçu du maître, règle de vie).",
    "pressExcerpt": "Champion athletes credit self-discipline above innate talent for their victories.",
    "pressSource": "Sports Illustrated",
    "collocations": [
      "strict discipline",
      "self-discipline",
      "maintain discipline"
    ],
    "nuanceComparisons": [
      {
        "word": "Discipline",
        "distinction": "Rigueur d'apprentissage ordonnée."
      },
      {
        "word": "Laxity",
        "distinction": "Laisser-aller sans exigences."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-2nde-36-philharmonic",
    "term": "Philharmonic",
    "phonetic": "/ˌfɪl.hɑːˈmɒn.ɪk/",
    "level": "B1",
    "category": "Sociétés de concerts",
    "frenchDef": "Philharmonique, amoureux de l'harmonie des concerts.",
    "englishDef": "Devoted to music; an orchestra or musical society.",
    "etymology": "Du grec 'philos' (qui aime d'amour) et 'harmonia' (la concorde des sons).",
    "pressExcerpt": "The London Philharmonic Orchestra performed in the royal festival hall.",
    "pressSource": "Gramophone",
    "collocations": [
      "philharmonic orchestra",
      "philharmonic society",
      "attend the philharmonic"
    ],
    "nuanceComparisons": [
      {
        "word": "Philharmonic",
        "distinction": "Dévoué à la grande musique symphonique."
      },
      {
        "word": "Popular",
        "distinction": "Musique de divertissement commercial."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-37-overture",
    "term": "Overture",
    "phonetic": "/ˈəʊ.və.tʃʊər/",
    "level": "B1",
    "category": "Ouvertures d'opéra",
    "frenchDef": "Ouverture orchestrale introduisant un opéra.",
    "englishDef": "An orchestral piece at the beginning of an opera, suite, or other extended composition.",
    "etymology": "Du français 'ouverture' (action d'ouvrir le spectacle lyrique).",
    "pressExcerpt": "The sparkling overture to The Marriage of Figaro sets an exhilarating mood.",
    "pressSource": "Opera Magazine",
    "collocations": [
      "dramatic overture",
      "concert overture",
      "play the overture"
    ],
    "nuanceComparisons": [
      {
        "word": "Overture",
        "distinction": "Pièce orchestrale inaugurale."
      },
      {
        "word": "Finale",
        "distinction": "Mouvement conclusif final."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-38-counterpoint",
    "term": "Counterpoint",
    "phonetic": "/ˈkaʊn.tə.pɔɪnt/",
    "level": "B1",
    "category": "Art de Bach",
    "frenchDef": "Contrepoint mêlant plusieurs voix autonomes.",
    "englishDef": "The technique of setting, writing, or playing a melody or melodies in conjunction with another.",
    "etymology": "Du latin 'punctus contra punctum' (note placée contre note).",
    "pressExcerpt": "Bach's fugues represent the supreme pinnacle of baroque counterpoint.",
    "pressSource": "Early Music Quarterly",
    "collocations": [
      "strict counterpoint",
      "master of counterpoint",
      "imitative counterpoint"
    ],
    "nuanceComparisons": [
      {
        "word": "Counterpoint",
        "distinction": "Superposition de mélodies complémentaires."
      },
      {
        "word": "Homophony",
        "distinction": "Accords verticaux en blocs soutenant une mélodie."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-39-timbre",
    "term": "Timbre",
    "phonetic": "/ˈtæm.bər/",
    "level": "B1",
    "category": "Couleur sonore",
    "frenchDef": "Timbre distinctif caractérisant chaque instrument.",
    "englishDef": "The character or quality of a musical sound or voice as distinct from its pitch and intensity.",
    "etymology": "Du grec 'tympanon' (tambour, sonorité de timbre métallique).",
    "pressExcerpt": "The oboe possesses a plaintive, reedy timbre that pierces orchestral textures.",
    "pressSource": "Music Acoustics",
    "collocations": [
      "unique timbre",
      "vocal timbre",
      "rich timbre"
    ],
    "nuanceComparisons": [
      {
        "word": "Timbre",
        "distinction": "Couleur spectrale unique d'un instrument."
      },
      {
        "word": "Volume",
        "distinction": "Intensité sonore mesurée en décibels."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-40-lyrical",
    "term": "Lyrical",
    "phonetic": "/ˈlɪr.ɪ.kəl/",
    "level": "B1",
    "category": "Élégance poétique",
    "frenchDef": "Lyrique, empreint d'émotion poétique chantante.",
    "englishDef": "Expressing the writer's emotions in an imaginative and beautiful way; melodious.",
    "etymology": "Du grec 'lyrikos' (qui s'élève au son de la lyre d'Apollon).",
    "pressExcerpt": "The cellist drew out a deeply lyrical cantabile passage that brought silence to the hall.",
    "pressSource": "Classic FM",
    "collocations": [
      "lyrical melody",
      "lyrical phrasing",
      "poetic and lyrical"
    ],
    "nuanceComparisons": [
      {
        "word": "Lyrical",
        "distinction": "Empreint de chant et de poésie intime."
      },
      {
        "word": "Prosaic",
        "distinction": "Terre-à-terre, sans envol poétique."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-41-libretto",
    "term": "Libretto",
    "phonetic": "/lɪˈbrɛt.əʊ/",
    "level": "B1",
    "category": "Textes d'opéra",
    "frenchDef": "Livret poétique contenant les paroles d'un opéra.",
    "englishDef": "The text of an opera or other long vocal work.",
    "etymology": "De l’italien 'libretto' (petit livre relié remis aux spectateurs).",
    "pressExcerpt": "Da Ponte wrote the brilliant Italian libretto for Mozart's Don Giovanni.",
    "pressSource": "Opera Review",
    "collocations": [
      "opera libretto",
      "write a libretto",
      "translate a libretto"
    ],
    "nuanceComparisons": [
      {
        "word": "Libretto",
        "distinction": "Texte dramatique d'une œuvre lyrique."
      },
      {
        "word": "Score",
        "distinction": "Partition musicale complète avec portées."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-42-crescendo",
    "term": "Crescendo",
    "phonetic": "/krɪˈʃɛn.dəʊ/",
    "level": "B1",
    "category": "Montée en puissance",
    "frenchDef": "Crescendo où le volume sonore s'amplifie graduellement.",
    "englishDef": "A gradual increase in loudness in a piece of music.",
    "etymology": "De l’italien 'crescere' (croître, grandir en ampleur).",
    "pressExcerpt": "A wave of percussion culminated in a thunderous orchestral crescendo.",
    "pressSource": "The Musical Times",
    "collocations": [
      "dramatic crescendo",
      "building to a crescendo",
      "orchestral crescendo"
    ],
    "nuanceComparisons": [
      {
        "word": "Crescendo",
        "distinction": "Hausse progressive du volume sonore."
      },
      {
        "word": "Decrescendo",
        "distinction": "Diminution graduelle du son vers le silence."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-2nde-43-gastronomy",
    "term": "Gastronomy",
    "phonetic": "/ɡæˈstrɒn.ə.mi/",
    "level": "B1",
    "category": "Art de la table",
    "frenchDef": "Gastronomie, science raffinée des mets et saveurs.",
    "englishDef": "The practice or art of choosing, cooking, and eating good food.",
    "etymology": "Du grec 'gastēr' (ventre, estomac) et 'nomos' (loi, science des accords).",
    "pressExcerpt": "French gastronomy is inscribed on the UNESCO Representative List of Intangible Heritage.",
    "pressSource": "Le Monde Gastronomie",
    "collocations": [
      "fine gastronomy",
      "master of gastronomy",
      "traditional gastronomy"
    ],
    "nuanceComparisons": [
      {
        "word": "Gastronomy",
        "distinction": "Science philosophique et culturelle de la table."
      },
      {
        "word": "Fast food",
        "distinction": "Alimentation industrielle standardisée rapide."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-44-connoisseur",
    "term": "Connoisseur",
    "phonetic": "/ˌkɒn.əˈsɜːr/",
    "level": "B1",
    "category": "Experts du goût",
    "frenchDef": "Connaisseur doté d'un discernement d'expert.",
    "englishDef": "An expert judge in matters of taste, wine, or art.",
    "etymology": "De l’ancien français 'conoître' (celui qui sait apprécier la vérité d'un art).",
    "pressExcerpt": "The cheese connoisseur distinguished subtle notes of hazelnut and pasture flora.",
    "pressSource": "The Telegraph",
    "collocations": [
      "wine connoisseur",
      "expert connoisseur",
      "connoisseur of fine food"
    ],
    "nuanceComparisons": [
      {
        "word": "Connoisseur",
        "distinction": "Expert raffiné au jugement sûr."
      },
      {
        "word": "Novice",
        "distinction": "Débutant sans repères gustatifs."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-45-palate",
    "term": "Palate",
    "phonetic": "/ˈpæl.ət/",
    "level": "B1",
    "category": "Sens du goût",
    "frenchDef": "Palais décelant les nuances aromatiques.",
    "englishDef": "A person's ability to distinguish between and appreciate different flavors.",
    "etymology": "Du latin 'palatum' (voûte de la bouche siège du goût).",
    "pressExcerpt": "A refined palate perceives the subtle interplay of acidity and sweetness in a dessert.",
    "pressSource": "Sommelier Journal",
    "collocations": [
      "refined palate",
      "please the palate",
      "discerning palate"
    ],
    "nuanceComparisons": [
      {
        "word": "Palate",
        "distinction": "Finesse de perception gustative."
      },
      {
        "word": "Throat",
        "distinction": "Gorge avalant sans discerner les arômes."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-46-epicurean",
    "term": "Epicurean",
    "phonetic": "/ˌɛp.ɪ.kjʊˈriː.ən/",
    "level": "B1",
    "category": "Plaisir mesuré",
    "frenchDef": "Épicurien cultivant la volupté sobre du goût.",
    "englishDef": "Devoted to the pursuit of sensual pleasure, especially with good food and comfort.",
    "etymology": "Du philosophe grec Épicure qui enseignait la modération raffinée.",
    "pressExcerpt": "The country inn offered an epicurean weekend of truffle foraging and vintage ciders.",
    "pressSource": "Country Life",
    "collocations": [
      "epicurean delight",
      "epicurean taste",
      "epicurean philosophy"
    ],
    "nuanceComparisons": [
      {
        "word": "Epicurean",
        "distinction": "Recherche de plaisirs choisis et mesurés."
      },
      {
        "word": "Ascetic",
        "distinction": "Ascète renonçant à tout plaisir sensoriel."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-47-vintage",
    "term": "Vintage",
    "phonetic": "/ˈvɪn.tɪdʒ/",
    "level": "B1",
    "category": "Grands millésimes",
    "frenchDef": "Millésime d'une année exceptionnelle.",
    "englishDef": "The year or place in which wine, especially of high quality, was produced.",
    "etymology": "Du latin 'vinum' (vin) et 'demere' (cueillir, vendanger la grappe).",
    "pressExcerpt": "A bottle of vintage cider from the orchards of Herefordshire was uncorked for the guests.",
    "pressSource": "Heritage Drinks",
    "collocations": [
      "exceptional vintage",
      "vintage year",
      "bottle of vintage"
    ],
    "nuanceComparisons": [
      {
        "word": "Vintage",
        "distinction": "Année de vendange d'exception."
      },
      {
        "word": "Blend",
        "distinction": "Assemblage générique sans millésime."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-48-fellowship",
    "term": "Fellowship",
    "phonetic": "/ˈfɛl.əʊ.ʃɪp/",
    "level": "B1",
    "category": "Partage fraternel",
    "frenchDef": "Fraternité cordiale partagée autour de la table.",
    "englishDef": "Friendly association, especially with people who share one's interests.",
    "etymology": "Du vieil anglais 'feolag' (compagnon partageant les biens d'un voyage).",
    "pressExcerpt": "The holiday feast renewed warm fellowship among distant cousins.",
    "pressSource": "Family Journal",
    "collocations": [
      "warm fellowship",
      "table fellowship",
      "enjoy fellowship"
    ],
    "nuanceComparisons": [
      {
        "word": "Fellowship",
        "distinction": "Lien d'amitié sincère partagé."
      },
      {
        "word": "Estrangement",
        "distinction": "Éloignement et discorde."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-49-epicure",
    "term": "Epicure",
    "phonetic": "/ˈɛp.ɪ.kjʊər/",
    "level": "B1",
    "category": "Amateurs fins",
    "frenchDef": "Amateur éclairé cultivant les délices de table.",
    "englishDef": "A person who takes particular pleasure in fine food and drink.",
    "etymology": "Du philosophe grec Épicure.",
    "pressExcerpt": "The visiting epicure praised the restaurant's delicate poached pear tart.",
    "pressSource": "Gastronome Review",
    "collocations": [
      "discerning epicure",
      "delight an epicure",
      "epicure's paradise"
    ],
    "nuanceComparisons": [
      {
        "word": "Epicure",
        "distinction": "Personne aux goûts fins et délicats."
      },
      {
        "word": "Glutton",
        "distinction": "Goinfre se gavant sans retenue."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-2nde-50-nourishment",
    "term": "Nourishment",
    "phonetic": "/ˈnʌr.ɪʃ.mənt/",
    "level": "B1",
    "category": "Substance de vie",
    "frenchDef": "Nourriture saine apportant vie et vigueur au corps.",
    "englishDef": "The substances necessary for growth, health, and good condition.",
    "etymology": "Du latin 'nutrire' (allaiter, sustenter avec douceur).",
    "pressExcerpt": "Fresh bone broth and winter root vegetables provide comforting nourishment.",
    "pressSource": "Lancet Nutrition",
    "collocations": [
      "vital nourishment",
      "spiritual nourishment",
      "source of nourishment"
    ],
    "nuanceComparisons": [
      {
        "word": "Nourishment",
        "distinction": "Aliment apportant tous les nutriments vitaux."
      },
      {
        "word": "Poison",
        "distinction": "Substance toxique altérant les tissus."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-51-holistic",
    "term": "Holistic",
    "phonetic": "/həʊˈlɪs.tɪk/",
    "level": "B1",
    "category": "Santé intégrale",
    "frenchDef": "Holistique, considérant l'être dans sa globalité physique et mentale.",
    "englishDef": "Characterized by the treatment of the whole person, taking into account mental and social factors.",
    "etymology": "Du grec 'holos' (le tout, la totalité indivisible).",
    "pressExcerpt": "A holistic approach to student health links wholesome meals with mindful sleep.",
    "pressSource": "British Medical Journal",
    "collocations": [
      "holistic health",
      "holistic approach",
      "holistic medicine"
    ],
    "nuanceComparisons": [
      {
        "word": "Holistic",
        "distinction": "Qui traite la globalité indivisible de l'être."
      },
      {
        "word": "Fragmented",
        "distinction": "Approche morcelée et réductrice."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-52-cardiovascular",
    "term": "Cardiovascular",
    "phonetic": "/ˌkɑː.di.əʊˈvæs.kjʊ.lər/",
    "level": "B1",
    "category": "Cœur & Vaisseaux",
    "frenchDef": "Cardiovasculaire, relatif au cœur et à la circulation.",
    "englishDef": "Relating to the heart and blood vessels.",
    "etymology": "Du grec 'kardia' (cœur) et du latin 'vasculum' (petit vaisseau).",
    "pressExcerpt": "Brisk walking and swimming offer outstanding cardiovascular protection.",
    "pressSource": "Heart Foundation UK",
    "collocations": [
      "cardiovascular fitness",
      "cardiovascular health",
      "cardiovascular exercise"
    ],
    "nuanceComparisons": [
      {
        "word": "Cardiovascular",
        "distinction": "Relatif à l'appareil circulatoire."
      },
      {
        "word": "Respiratory",
        "distinction": "Relatif aux poumons et à la respiration."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-53-wholesomeness",
    "term": "Wholesomeness",
    "phonetic": "/ˈhəʊl.səm.nəs/",
    "level": "B1",
    "category": "Pureté nutritionnelle",
    "frenchDef": "Caractère sain, naturel et fortifiant des aliments.",
    "englishDef": "The quality of being conducive to health and physical well-being.",
    "etymology": "De 'whole' (intact) avec double suffixe de qualité morale.",
    "pressExcerpt": "Farm-fresh produce is cherished for its unadulterated wholesomeness.",
    "pressSource": "Organic Standard",
    "collocations": [
      "natural wholesomeness",
      "moral wholesomeness",
      "wholesomeness of food"
    ],
    "nuanceComparisons": [
      {
        "word": "Wholesomeness",
        "distinction": "Bonté saine et naturelle."
      },
      {
        "word": "Toxicity",
        "distinction": "Toxicité nocive."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-54-vital",
    "term": "Vital",
    "phonetic": "/ˈvaɪ.təl/",
    "level": "B1",
    "category": "Essentiel",
    "frenchDef": "Vital, indispensable à la préservation de l'existence.",
    "englishDef": "Absolutely necessary or important; essential for life.",
    "etymology": "Du latin 'vita' (la vie dans sa splendeur).",
    "pressExcerpt": "Hydration is vital for maintaining cellular energy and cognitive alertness.",
    "pressSource": "WHO Bulletin",
    "collocations": [
      "vital organ",
      "vital importance",
      "vital sign"
    ],
    "nuanceComparisons": [
      {
        "word": "Vital",
        "distinction": "Sans quoi la vie ne peut subsister."
      },
      {
        "word": "Superfluous",
        "distinction": "Superflu et dispensable."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-55-recuperation",
    "term": "Recuperation",
    "phonetic": "/rɪˌkuː.pəˈreɪ.ʃən/",
    "level": "B1",
    "category": "Rétablissement",
    "frenchDef": "Récupération physique après l'effort ou la fièvre.",
    "englishDef": "Recovery from illness or exertion.",
    "etymology": "Du latin 'recuperare' (rentrer en possession de ses forces).",
    "pressExcerpt": "Quiet rest in clean country air accelerates complete physical recuperation.",
    "pressSource": "Health Gazette",
    "collocations": [
      "period of recuperation",
      "rapid recuperation",
      "aided recuperation"
    ],
    "nuanceComparisons": [
      {
        "word": "Recuperation",
        "distinction": "Reconquête progressive de ses forces."
      },
      {
        "word": "Relapse",
        "distinction": "Rechute dans l'épuisement ou la maladie."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-56-cleanse",
    "term": "Cleanse",
    "phonetic": "/klɛnz/",
    "level": "B1",
    "category": "Purification",
    "frenchDef": "Purifier l'organisme par une cure saine.",
    "englishDef": "To make clean or pure; free from toxins.",
    "etymology": "Du vieil anglais 'clǣnsian' (rendre pur et sans souillure).",
    "pressExcerpt": "Drinking fresh herbal infusions helps cleanse the digestive tract.",
    "pressSource": "Herbal Medicine",
    "collocations": [
      "cleanse the body",
      "gentle cleanse",
      "cleanse the skin"
    ],
    "nuanceComparisons": [
      {
        "word": "Cleanse",
        "distinction": "Purifier de l'intérieur."
      },
      {
        "word": "Contaminate",
        "distinction": "Polluer ou souiller."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-2nde-57-executive",
    "term": "Executive",
    "phonetic": "/ɪɡˈzɛk.jʊ.tɪv/",
    "level": "B1",
    "category": "Directions d'entreprise",
    "frenchDef": "Cadre dirigeant assumant les décisions stratégiques.",
    "englishDef": "A person with senior managerial responsibility in a business organization.",
    "etymology": "Du latin 'exsequi' (mener une action à son exécution parfaite).",
    "pressExcerpt": "Corporate executives met in the boardroom to review the quarterly balance sheet.",
    "pressSource": "The Economist",
    "collocations": [
      "chief executive",
      "senior executive",
      "executive decision"
    ],
    "nuanceComparisons": [
      {
        "word": "Executive",
        "distinction": "Cadre dirigeant responsable de la stratégie."
      },
      {
        "word": "Intern",
        "distinction": "Stagiaire en phase d'apprentissage."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-58-vocation",
    "term": "Vocation",
    "phonetic": "/vəʊˈkeɪ.ʃən/",
    "level": "B1",
    "category": "Appel du cœur",
    "frenchDef": "Vocation professionnelle ressentie comme un appel profond.",
    "englishDef": "A strong feeling of suitability for a particular career or occupation.",
    "etymology": "Du latin 'vocare' (entendre l'appel intérieur de sa mission).",
    "pressExcerpt": "Teaching literature was not merely a job for him, but a lifelong vocation.",
    "pressSource": "Times Higher Education",
    "collocations": [
      "true vocation",
      "follow a vocation",
      "religious vocation"
    ],
    "nuanceComparisons": [
      {
        "word": "Vocation",
        "distinction": "Mission de vie choisie avec le cœur."
      },
      {
        "word": "Drudgery",
        "distinction": "Corvée alimentaire subie sans passion."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-59-negotiation",
    "term": "Negotiation",
    "phonetic": "/nɪˌɡəʊ.ʃiˈeɪ.ʃən/",
    "level": "B1",
    "category": "Accords commerciaux",
    "frenchDef": "Négociation diplomatique ou contractuelle rigoureuse.",
    "englishDef": "Discussion aimed at reaching an agreement.",
    "etymology": "Du latin 'negotium' (le commerce des affaires, le contraire du loisir otium).",
    "pressExcerpt": "Skillful contract negotiation protected employee benefits across all departments.",
    "pressSource": "Financial Times",
    "collocations": [
      "successful negotiation",
      "enter negotiations",
      "diplomatic negotiation"
    ],
    "nuanceComparisons": [
      {
        "word": "Negotiation",
        "distinction": "Recherche d'un accord équitable discuté."
      },
      {
        "word": "Dictate",
        "distinction": "Diktat imposé unilatéralement."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-60-credentials",
    "term": "Credentials",
    "phonetic": "/krɪˈdɛn.ʃəlz/",
    "level": "B1",
    "category": "Titres & Diplômes",
    "frenchDef": "Titres, diplômes et références attestant des compétences.",
    "englishDef": "A qualification, achievement, or aspect of a person's background showing suitability.",
    "etymology": "Du latin 'credere' (ce qui mérite la confiance d'autrui).",
    "pressExcerpt": "She presented impressive academic credentials from Oxford and Edinburgh.",
    "pressSource": "Careers Gazette",
    "collocations": [
      "academic credentials",
      "verify credentials",
      "impressive credentials"
    ],
    "nuanceComparisons": [
      {
        "word": "Credentials",
        "distinction": "Titres officiels certifiés."
      },
      {
        "word": "Rumor",
        "distinction": "Bruit de couloir invérifié."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-61-internship",
    "term": "Internship",
    "phonetic": "/ˈɪn.tɜːn.ʃɪp/",
    "level": "B1",
    "category": "Premiers pas en entreprise",
    "frenchDef": "Stage professionnel en entreprise formatrice.",
    "englishDef": "The position of a student or trainee who works in an organization to gain work experience.",
    "etymology": "De 'intern' (qui entre à l'intérieur d'une corporation).",
    "pressExcerpt": "Her summer legal internship at a London chambers provided priceless casework experience.",
    "pressSource": "Law Society Gazette",
    "collocations": [
      "complete an internship",
      "paid internship",
      "summer internship"
    ],
    "nuanceComparisons": [
      {
        "word": "Internship",
        "distinction": "Stage formateur d'initiation."
      },
      {
        "word": "Tenure",
        "distinction": "Titularisation définitive à vie."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-62-sector",
    "term": "Sector",
    "phonetic": "/ˈsɛk.tər/",
    "level": "B1",
    "category": "Branches économiques",
    "frenchDef": "Secteur d'activité économique spécialisé.",
    "englishDef": "An area or portion that is distinct from others, especially of economic activity.",
    "etymology": "Du latin 'secare' (couper, diviser un ensemble en branches).",
    "pressExcerpt": "The renewable energy sector generates hundreds of skilled technician jobs.",
    "pressSource": "Economic Trends",
    "collocations": [
      "public sector",
      "private sector",
      "technology sector"
    ],
    "nuanceComparisons": [
      {
        "word": "Sector",
        "distinction": "Branche économique spécialisée."
      },
      {
        "word": "Marketplace",
        "distinction": "Le marché commercial dans sa globalité."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-63-acumen",
    "term": "Acumen",
    "phonetic": "/ˈæk.jʊ.mən/",
    "level": "B1",
    "category": "Clairvoyance d'affaires",
    "frenchDef": "Pénétration d'esprit et flair des affaires.",
    "englishDef": "The ability to make good judgments and quick decisions, typically in a particular domain.",
    "etymology": "Du latin 'acumen' (la pointe acérée qui perce les apparences).",
    "pressExcerpt": "Her sharp financial acumen enabled the cooperative to double its reserves.",
    "pressSource": "Harvard Business Review",
    "collocations": [
      "business acumen",
      "commercial acumen",
      "financial acumen"
    ],
    "nuanceComparisons": [
      {
        "word": "Acumen",
        "distinction": "Finesse d'esprit et sagacité perspicace."
      },
      {
        "word": "Naivety",
        "distinction": "Naïveté crédule facilement trompée."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-2nde-64-diplomacy",
    "term": "Diplomacy",
    "phonetic": "/dɪˈpləʊ.mə.si/",
    "level": "B1",
    "category": "Relations internationales",
    "frenchDef": "Diplomatie, art de négocier la paix entre nations.",
    "englishDef": "The profession, activity, or skill of managing international relations.",
    "etymology": "Du grec 'diplōma' (charte pliée en deux conférant des pouvoirs de légat).",
    "pressExcerpt": "Patient multilateral diplomacy resolved the maritime border dispute peacefully.",
    "pressSource": "Foreign Affairs",
    "collocations": [
      "international diplomacy",
      "shuttle diplomacy",
      "rules of diplomacy"
    ],
    "nuanceComparisons": [
      {
        "word": "Diplomacy",
        "distinction": "Négociation pacifique entre souverainetés."
      },
      {
        "word": "Belligerence",
        "distinction": "Agressivité belliqueuse prompte aux armes."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-65-empathy",
    "term": "Empathy",
    "phonetic": "/ˈɛm.pə.θi/",
    "level": "B1",
    "category": "Bonté d'écoute",
    "frenchDef": "Empathie profonde embrassant l'âme d'autrui.",
    "englishDef": "The ability to understand and share the feelings of another person.",
    "etymology": "Du grec 'en' (au dedans) et 'pathos' (passion éprouvée).",
    "pressExcerpt": "Empathy bridges generational divides and reconciles estranged neighbors.",
    "pressSource": "Psychology Review",
    "collocations": [
      "deep empathy",
      "demonstrate empathy",
      "empathy and compassion"
    ],
    "nuanceComparisons": [
      {
        "word": "Empathy",
        "distinction": "Capacité à ressentir avec l'autre de l'intérieur."
      },
      {
        "word": "Callousness",
        "distinction": "Dureté insensible et fermée."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-66-topography",
    "term": "Topography",
    "phonetic": "/təˈpɒɡ.rə.fi/",
    "level": "B1",
    "category": "Cartographie des reliefs",
    "frenchDef": "Topographie dessinant les reliefs d'une contrée.",
    "englishDef": "The arrangement of the natural and artificial physical features of an area.",
    "etymology": "Du grec 'topos' (le lieu) et 'graphein' (décrire par le trait).",
    "pressExcerpt": "The rugged topography of the Cambrian mountains made road building challenging.",
    "pressSource": "Geographical Journal",
    "collocations": [
      "rugged topography",
      "mountain topography",
      "map the topography"
    ],
    "nuanceComparisons": [
      {
        "word": "Topography",
        "distinction": "Relief concret des accidents de terrain."
      },
      {
        "word": "Topology",
        "distinction": "Étude mathématique abstraite des espaces."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-67-commonwealth",
    "term": "Commonwealth",
    "phonetic": "/ˈkɒm.ən.wɛlθ/",
    "level": "B1",
    "category": "Bien commun",
    "frenchDef": "Commonwealth unissant des nations libres pour le bien commun.",
    "englishDef": "An international association consisting of the UK together with states that were previously part of the British Empire.",
    "etymology": "De 'common' (commun) et 'wealth' (bien-être matériel et moral de tous).",
    "pressExcerpt": "The Commonwealth celebrates shared democratic values and educational student scholarships.",
    "pressSource": "BBC News",
    "collocations": [
      "Commonwealth nations",
      "member of the Commonwealth",
      "Commonwealth games"
    ],
    "nuanceComparisons": [
      {
        "word": "Commonwealth",
        "distinction": "Union fraternelle pour le bien-être commun."
      },
      {
        "word": "Protectorate",
        "distinction": "Territoire sous tutelle étrangère."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-68-affinity",
    "term": "Affinity",
    "phonetic": "/əˈfɪn.ə.ti/",
    "level": "B1",
    "category": "Liens d'esprit",
    "frenchDef": "Affinité élective scellant des amitiés durables.",
    "englishDef": "A spontaneous or natural liking or sympathy for someone or something.",
    "etymology": "Du latin 'affinis' (qui touche par ses frontières intimes).",
    "pressExcerpt": "The two young novelists discovered an extraordinary affinity in their artistic visions.",
    "pressSource": "Times Literary Supplement",
    "collocations": [
      "natural affinity",
      "cultural affinity",
      "artistic affinity"
    ],
    "nuanceComparisons": [
      {
        "word": "Affinity",
        "distinction": "Accord spontané des sensibilités."
      },
      {
        "word": "Repugnance",
        "distinction": "Dégoût profond et répulsion."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-69-kinship",
    "term": "Kinship",
    "phonetic": "/ˈkɪn.ʃɪp/",
    "level": "B1",
    "category": "Fraternité d'âme",
    "frenchDef": "Parenté de cœur et fidélité filiale.",
    "englishDef": "Blood relationship, or a sharing of characteristics or origins.",
    "etymology": "Du vieil anglais 'cynn' (famille, lignée d'honneur) et suffixe '-ship'.",
    "pressExcerpt": "Working together created an enduring sense of spiritual kinship among the volunteers.",
    "pressSource": "Sociology Today",
    "collocations": [
      "sense of kinship",
      "feel kinship",
      "close kinship"
    ],
    "nuanceComparisons": [
      {
        "word": "Kinship",
        "distinction": "Fraternité d'origine ou d'esprit partagé."
      },
      {
        "word": "Estrangement",
        "distinction": "Déchirement des liens d'affection."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-70-aestheticism",
    "term": "Aestheticism",
    "phonetic": "/iːsˈθɛt.ɪ.sɪ.zəm/",
    "level": "B1",
    "category": "Culte du beau",
    "frenchDef": "Esthétisme vouant l'art à la pure beauté sans visée morale.",
    "englishDef": "An intellectual and art movement supporting the emphasis of aesthetic values more than other themes for literature, fine art, music.",
    "etymology": "Du grec 'aisthēsis' (perception sensible de la beauté).",
    "pressExcerpt": "Oscar Wilde championed aestheticism, proclaiming art exists for art's sake alone.",
    "pressSource": "Victorian Literature",
    "collocations": [
      "artistic aestheticism",
      "philosophy of aestheticism",
      "embrace aestheticism"
    ],
    "nuanceComparisons": [
      {
        "word": "Aestheticism",
        "distinction": "Recherche de la beauté absolue en art."
      },
      {
        "word": "Utilitarianism",
        "distinction": "Recherche exclusive de l'utile et du pratique."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-2nde-71-alliances",
    "term": "Alliances",
    "phonetic": "/əˈlaɪ.əns.ɪz/",
    "level": "B1",
    "category": "Concerts des nations",
    "frenchDef": "Alliances géopolitiques garantissant la paix mondiale.",
    "englishDef": "Unions or associations formed for mutual benefit, especially between countries.",
    "etymology": "De l’ancien français 'alier' (sceller par la foi du serment).",
    "pressExcerpt": "Enduring international alliances deter territorial aggression and preserve commercial maritime routes.",
    "pressSource": "Foreign Policy Journal",
    "collocations": [
      "form alliances",
      "strategic alliances",
      "defensive alliances"
    ],
    "nuanceComparisons": [
      {
        "word": "Alliances",
        "distinction": "Pactes d'assistance solidaire mutuelle."
      },
      {
        "word": "Hostilities",
        "distinction": "Actes d'agression militaire ouverte."
      }
    ],
    "gradeLevel": "2nde",
    "gradeLabel": "Seconde (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-01-idiosyncrasy",
    "term": "Idiosyncrasy",
    "phonetic": "/ˌɪd.i.əˈsɪŋ.krə.si/",
    "level": "B2",
    "category": "Traits singuliers",
    "frenchDef": "Idiosyncrasie, trait de caractère ou manie singulière.",
    "englishDef": "A mode of behavior or way of thought peculiar to an individual.",
    "etymology": "Du grec 'idios' (propre à soi seul) et 'synkrasis' (tempérament intime).",
    "pressExcerpt": "Her charming habit of organizing tea tins by herbal aroma was a well-known idiosyncrasy.",
    "pressSource": "Literary Review",
    "collocations": [
      "personal idiosyncrasy",
      "charming idiosyncrasy",
      "cultural idiosyncrasy"
    ],
    "nuanceComparisons": [
      {
        "word": "Idiosyncrasy",
        "distinction": "Particularité singulière propre à une personne."
      },
      {
        "word": "Conformity",
        "distinction": "Alignement docile sur la norme générale."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-02-punctilious",
    "term": "Punctilious",
    "phonetic": "/pʌŋkˈtɪl.i.əs/",
    "level": "B2",
    "category": "Scrupule & Exactitude",
    "frenchDef": "Punctilieux, scrupuleusement attaché aux détails et égards.",
    "englishDef": "Showing great attention to detail or correct behavior.",
    "etymology": "De l’italien 'puntiglio' (point d'honneur chatouilleux).",
    "pressExcerpt": "The butler was punctilious in ensuring every silver utensil was aligned to the millimeter.",
    "pressSource": "The Country House",
    "collocations": [
      "punctilious attention",
      "punctilious manners",
      "punctilious in duty"
    ],
    "nuanceComparisons": [
      {
        "word": "Punctilious",
        "distinction": "Scrupuleux jusqu'à l'extrême élégance."
      },
      {
        "word": "Sloppy",
        "distinction": "Négligé et brouillon."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-03-temperament",
    "term": "Temperament",
    "phonetic": "/ˈtɛm.pər.ə.mənt/",
    "level": "B2",
    "category": "Nature profonde",
    "frenchDef": "Tempérament individuel et disposition d'humeur.",
    "englishDef": "A person's or animal's nature, especially as it permanently affects their behavior.",
    "etymology": "Du latin 'temperare' (mélanger avec mesure et tempérance).",
    "pressExcerpt": "Her artistic temperament combined fierce creative energy with deep reflective sensitivity.",
    "pressSource": "Psychology Today",
    "collocations": [
      "artistic temperament",
      "calm temperament",
      "fiery temperament"
    ],
    "nuanceComparisons": [
      {
        "word": "Temperament",
        "distinction": "Nature émotionnelle fondamentale."
      },
      {
        "word": "Mood",
        "distinction": "Humeur passagère d'un instant."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-04-poise",
    "term": "Poise",
    "phonetic": "/pɔɪz/",
    "level": "B2",
    "category": "Maintien & Assurance",
    "frenchDef": "Grâce sereine, équilibre et dignité corporelle.",
    "englishDef": "Graceful and elegant bearing in a person; composure and dignity of manner.",
    "etymology": "De l’ancien français 'pois' (poids bien équilibré au centre).",
    "pressExcerpt": "She answered the inquisitor's difficult questions with calm, aristocratic poise.",
    "pressSource": "The Times",
    "collocations": [
      "natural poise",
      "maintain poise",
      "grace and poise"
    ],
    "nuanceComparisons": [
      {
        "word": "Poise",
        "distinction": "Maintien assuré plein de grâce sereine."
      },
      {
        "word": "Awkwardness",
        "distinction": "Gêne empotée et maladroite."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-05-household",
    "term": "Household",
    "phonetic": "/ˈhaʊs.həʊld/",
    "level": "B2",
    "category": "Organisation domestique",
    "frenchDef": "Ménage domestique et gestion du domaine familial.",
    "englishDef": "A house and its occupants regarded as a cohesive socio-economic unit.",
    "etymology": "De 'house' et 'hold' (tenir réuni sous un même toit).",
    "pressExcerpt": "Managing an English country household required meticulous scheduling and accounting.",
    "pressSource": "Victorian Gazette",
    "collocations": [
      "run a household",
      "head of household",
      "household budget"
    ],
    "nuanceComparisons": [
      {
        "word": "Household",
        "distinction": "Unité socio-économique du foyer."
      },
      {
        "word": "Tribe",
        "distinction": "Tribu de parenté élargie."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-06-domestic",
    "term": "Domestic",
    "phonetic": "/dəˈmɛs.tɪk/",
    "level": "B2",
    "category": "Univers du foyer",
    "frenchDef": "Domestique, relatif à la vie paisible du logis.",
    "englishDef": "Relating to the running of a home or to family relations.",
    "etymology": "Du latin 'domesticus' (qui appartient à la maison familiale).",
    "pressExcerpt": "She cherished quiet domestic moments spent mending antique linens beside the hearth.",
    "pressSource": "Country Living",
    "collocations": [
      "domestic harmony",
      "domestic affairs",
      "domestic sphere"
    ],
    "nuanceComparisons": [
      {
        "word": "Domestic",
        "distinction": "Relatif à l'intérieur du foyer."
      },
      {
        "word": "Exotic",
        "distinction": "Étranger et lointain."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-07-ambiance",
    "term": "Ambiance",
    "phonetic": "/ˌɒm.biˈɒns/",
    "level": "B2",
    "category": "Climat émotionnel",
    "frenchDef": "Ambiance enveloppante et cachet d'une demeure.",
    "englishDef": "The character and atmosphere of a place.",
    "etymology": "Du latin 'ambire' (ce qui entoure de toutes parts).",
    "pressExcerpt": "The library's cedar bookshelves created an inviting, scholarly ambiance.",
    "pressSource": "Architectural Digest",
    "collocations": [
      "scholarly ambiance",
      "soothing ambiance",
      "distinctive ambiance"
    ],
    "nuanceComparisons": [
      {
        "word": "Ambiance",
        "distinction": "Atmosphère sensible d'un intérieur."
      },
      {
        "word": "Structure",
        "distinction": "Charpente matérielle nue."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-1re-08-circumnavigation",
    "term": "Circumnavigation",
    "phonetic": "/ˌsɜː.kəmˌnæv.ɪˈɡeɪ.ʃən/",
    "level": "B2",
    "category": "Tour du globe",
    "frenchDef": "Circumnavigation, tour complet de la terre par mer.",
    "englishDef": "The action of sailing or traveling all the way around something, especially the world.",
    "etymology": "Du latin 'circum' (autour) et 'navigare' (naviguer).",
    "pressExcerpt": "Sir Francis Drake completed his perilous circumnavigation aboard the Golden Hind in 1580.",
    "pressSource": "National Maritime Museum",
    "collocations": [
      "solo circumnavigation",
      "historic circumnavigation",
      "complete a circumnavigation"
    ],
    "nuanceComparisons": [
      {
        "word": "Circumnavigation",
        "distinction": "Tour maritime complet du globe."
      },
      {
        "word": "Coastline sailing",
        "distinction": "Cabotage côtier sans s'éloigner des rives."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-09-peripatetic",
    "term": "Peripatetic",
    "phonetic": "/ˌpɛr.ɪ.pəˈtɛt.ɪk/",
    "level": "B2",
    "category": "Voyageurs itinérants",
    "frenchDef": "Péripatétique, voyageant sans cesse de lieu en lieu.",
    "englishDef": "Traveling from place to place, in particular working or based in various places for relatively short periods.",
    "etymology": "Du grec 'peripatētikos' (qui se promène en enseignant la philosophie).",
    "pressExcerpt": "As an international documentary producer, she led a fascinatingly peripatetic life.",
    "pressSource": "The Economist",
    "collocations": [
      "peripatetic lifestyle",
      "peripatetic scholar",
      "peripatetic existence"
    ],
    "nuanceComparisons": [
      {
        "word": "Peripatetic",
        "distinction": "Itinérant cheminant d'étape en étape."
      },
      {
        "word": "Sedentary",
        "distinction": "Sédentaire enraciné en un seul lieu."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-10-terra-incognita",
    "term": "Terra incognita",
    "phonetic": "/ˈtɛr.ə ɪnˈkɒɡ.nɪ.tə/",
    "level": "B2",
    "category": "Cartes vierges",
    "frenchDef": "Terre inconnue n'ayant jamais été foulée.",
    "englishDef": "Unknown or unexplored territory.",
    "etymology": "Expression latine signifiant littéralement 'terre inconnue'.",
    "pressExcerpt": "Ancient mariners marked the uncharted ocean borders with the phrase Terra Incognita.",
    "pressSource": "Royal Geographical Society",
    "collocations": [
      "explore terra incognita",
      "map terra incognita",
      "step into terra incognita"
    ],
    "nuanceComparisons": [
      {
        "word": "Terra incognita",
        "distinction": "Territoire totalement vierge d'exploration."
      },
      {
        "word": "Known territory",
        "distinction": "Région explorée et documentée."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-11-crossroads",
    "term": "Crossroads",
    "phonetic": "/ˈkrɒs.rəʊdz/",
    "level": "B2",
    "category": "Carrefours du monde",
    "frenchDef": "Carrefour stratégique où se croisent les routes.",
    "englishDef": "An intersection of two or more roads; a crucial turning point.",
    "etymology": "Composé de 'cross' (croiser) et 'roads' (chemins).",
    "pressExcerpt": "The ancient city of Istanbul sits proudly at the historic crossroads of Europe and Asia.",
    "pressSource": "BBC Travel",
    "collocations": [
      "cultural crossroads",
      "stand at a crossroads",
      "historic crossroads"
    ],
    "nuanceComparisons": [
      {
        "word": "Crossroads",
        "distinction": "Carrefour où convergent plusieurs voies."
      },
      {
        "word": "Cul-de-sac",
        "distinction": "Impasse sans issue."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-12-migration",
    "term": "Migration",
    "phonetic": "/maɪˈɡreɪ.ʃən/",
    "level": "B2",
    "category": "Grands flux",
    "frenchDef": "Migration saisonnière des oiseaux ou des peuples.",
    "englishDef": "Seasonal movement of animals from one region to another, or movement of people.",
    "etymology": "Du latin 'migrare' (quitter son séjour pour aller ailleurs).",
    "pressExcerpt": "Millions of swallows undertake an epic annual migration across the Sahara.",
    "pressSource": "Nature Wildlife",
    "collocations": [
      "annual migration",
      "mass migration",
      "bird migration"
    ],
    "nuanceComparisons": [
      {
        "word": "Migration",
        "distinction": "Déplacement saisonnier périodique."
      },
      {
        "word": "Exile",
        "distinction": "Bannissement politique forcé."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-13-port-of-call",
    "term": "Port of call",
    "phonetic": "/pɔːt əv kɔːl/",
    "level": "B2",
    "category": "Escales maritimes",
    "frenchDef": "Escale maritime d'un paquebot ou voilier.",
    "englishDef": "An intermediate stop for a ship on its scheduled voyage.",
    "etymology": "Expression maritime anglaise consacrée depuis le XVIIIe siècle.",
    "pressExcerpt": "Gibraltar was the first Mediterranean port of call for the royal frigate.",
    "pressSource": "Lloyd's List",
    "collocations": [
      "first port of call",
      "scheduled port of call",
      "favorite port of call"
    ],
    "nuanceComparisons": [
      {
        "word": "Port of call",
        "distinction": "Escale portuaire temporaire."
      },
      {
        "word": "Home port",
        "distinction": "Port d'attache d'immatriculation."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-14-expeditionary",
    "term": "Expeditionary",
    "phonetic": "/ˌɛk.spəˈdɪʃ.ən.ər.i/",
    "level": "B2",
    "category": "Missions lointaines",
    "frenchDef": "Expéditionnaire, équipé pour franchir des terres hostiles.",
    "englishDef": "Relating to or designed for military or scientific exploration abroad.",
    "etymology": "Du latin 'expeditio' (marche en campagne allégée de tout bagage superflu).",
    "pressExcerpt": "The expeditionary corps charted unexplored mountain passes in the Himalayas.",
    "pressSource": "Geographical Journal",
    "collocations": [
      "expeditionary mission",
      "expeditionary team",
      "expeditionary voyage"
    ],
    "nuanceComparisons": [
      {
        "word": "Expeditionary",
        "distinction": "Organisé pour des contrées lointaines."
      },
      {
        "word": "Domestic trip",
        "distinction": "Voyage intérieur de proximité."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-1re-15-abdication",
    "term": "Abdication",
    "phonetic": "/ˌæb.dɪˈkeɪ.ʃən/",
    "level": "B2",
    "category": "Renonciation royale",
    "frenchDef": "Abdication solennelle d'un souverain renonçant au trône.",
    "englishDef": "An act of renouncing the throne by a reigning monarch.",
    "etymology": "Du latin 'abdicare' (déclarer publiquement renoncer à sa charge).",
    "pressExcerpt": "The abdication crisis of King Edward VIII in 1936 shook the British monarchy.",
    "pressSource": "BBC History",
    "collocations": [
      "royal abdication",
      "formal abdication",
      "sign an abdication"
    ],
    "nuanceComparisons": [
      {
        "word": "Abdication",
        "distinction": "Renonciation volontaire à la couronne."
      },
      {
        "word": "Coronation",
        "distinction": "Sacre et couronnement royal."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-16-vestige",
    "term": "Vestige",
    "phonetic": "/ˈvɛs.tɪdʒ/",
    "level": "B2",
    "category": "Traces du passé",
    "frenchDef": "Vestige émouvant d'une splendeur disparue.",
    "englishDef": "A trace of something that is disappearing or no longer exists.",
    "etymology": "Du latin 'vestigium' (empreinte de pas laissée sur le sol).",
    "pressExcerpt": "Roman mosaic floors remain as poignant vestiges of an imperial villa in Sussex.",
    "pressSource": "Archaeological Review",
    "collocations": [
      "last vestige",
      "ancient vestige",
      "visible vestige"
    ],
    "nuanceComparisons": [
      {
        "word": "Vestige",
        "distinction": "Trace discrète d'une gloire éteinte."
      },
      {
        "word": "Monument",
        "distinction": "Édifice encore debout dans son intégrité."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-17-epoch",
    "term": "Epoch",
    "phonetic": "/ˈiː.pɒk/",
    "level": "B2",
    "category": "Grandes ères",
    "frenchDef": "Époque historique marquée par de grands bouleversements.",
    "englishDef": "A period of time in history or a person's life, typically marked by notable events.",
    "etymology": "Du grec 'epokhē' (point d'arrêt du cours du temps marquant une nouvelle ère).",
    "pressExcerpt": "The Victorian epoch witnessed unprecedented advances in steam engineering and literature.",
    "pressSource": "Historical Studies",
    "collocations": [
      "historical epoch",
      "glorious epoch",
      "dawn of an epoch"
    ],
    "nuanceComparisons": [
      {
        "word": "Epoch",
        "distinction": "Grande ère marquée par un changement d'esprit."
      },
      {
        "word": "Season",
        "distinction": "Simple saison climatique de trois mois."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-18-historiography",
    "term": "Historiography",
    "phonetic": "/hɪˌstɒr.iˈɒɡ.rə.fi/",
    "level": "B2",
    "category": "Science de l'histoire",
    "frenchDef": "Historiographie, étude critique des sources et récits du passé.",
    "englishDef": "The study of historical writing and methodology.",
    "etymology": "Du grec 'historia' (enquête rationnelle) et 'graphein' (écrire).",
    "pressExcerpt": "Modern historiography interrogates the biases of court chroniclers.",
    "pressSource": "English Historical Review",
    "collocations": [
      "critical historiography",
      "study of historiography",
      "modern historiography"
    ],
    "nuanceComparisons": [
      {
        "word": "Historiography",
        "distinction": "Analyse critique des méthodes d'écriture de l'histoire."
      },
      {
        "word": "Chronicle",
        "distinction": "Simple recueil chronologique sans analyse critique."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-19-armistice",
    "term": "Armistice",
    "phonetic": "/ˈɑː.mɪ.stɪs/",
    "level": "B2",
    "category": "Cessez-le-feu",
    "frenchDef": "Armistice suspendant solennellement les combats.",
    "englishDef": "An agreement made by opposing sides in a war to stop fighting for a certain time; a truce.",
    "etymology": "Du latin 'arma' (les armes) et 'sistere' (arrêter net, faire halte).",
    "pressExcerpt": "The Armistice of November 1918 brought a merciful end to four years of trench warfare.",
    "pressSource": "Imperial War Museum",
    "collocations": [
      "sign an armistice",
      "armistice day",
      "declare an armistice"
    ],
    "nuanceComparisons": [
      {
        "word": "Armistice",
        "distinction": "Cessation officielle des hostilités militaires."
      },
      {
        "word": "Declaration of war",
        "distinction": "Entrée officielle en guerre ouverte."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-20-sovereignty",
    "term": "Sovereignty",
    "phonetic": "/ˈsɒv.rɪn.ti/",
    "level": "B2",
    "category": "Indépendance des peuples",
    "frenchDef": "Souveraineté territoriale inaliénable.",
    "englishDef": "Supreme power or authority; the authority of a state to govern itself.",
    "etymology": "Du latin 'superanus' (qui n'a aucun supérieur au-dessus de soi).",
    "pressExcerpt": "The treaty formally recognized the territorial sovereignty of the newborn republic.",
    "pressSource": "Law Review",
    "collocations": [
      "national sovereignty",
      "assert sovereignty",
      "violate sovereignty"
    ],
    "nuanceComparisons": [
      {
        "word": "Sovereignty",
        "distinction": "Autorité suprême d'un peuple libre."
      },
      {
        "word": "Vassalage",
        "distinction": "Dépendance féodale subordonnée."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-21-parchment",
    "term": "Parchment",
    "phonetic": "/ˈpɑːtʃ.mənt/",
    "level": "B2",
    "category": "Manuscrits enluminés",
    "frenchDef": "Parchemin de vélin portant d'anciens traités.",
    "englishDef": "A stiff, flat, thin material made from calfskin or sheepskin, used for historical treaties.",
    "etymology": "De la cité antique de Pergame.",
    "pressExcerpt": "The royal charter was inscribed onto gilded calfskin parchment with iron gall ink.",
    "pressSource": "British Library Archives",
    "collocations": [
      "vellum parchment",
      "illuminated parchment",
      "ancient parchment"
    ],
    "nuanceComparisons": [
      {
        "word": "Parchment",
        "distinction": "Support noble en peau animale séchée."
      },
      {
        "word": "Newsprint",
        "distinction": "Papier journal ordinaire et éphémère."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-1re-22-avant-garde",
    "term": "Avant-garde",
    "phonetic": "/ˌæv.ɑ̃ːˈɡɑːd/",
    "level": "B2",
    "category": "Pionniers de l'art",
    "frenchDef": "Avant-garde repoussant les frontières de l'art.",
    "englishDef": "New and unusual or experimental ideas, especially in the arts, or the people introducing them.",
    "etymology": "Du terme militaire français 'avant-garde' (troupe marchant en tête).",
    "pressExcerpt": "The avant-garde theatrical troupe staged Shakespeare in an abandoned railway station.",
    "pressSource": "Tate Modern Review",
    "collocations": [
      "avant-garde movement",
      "avant-garde artist",
      "avant-garde theater"
    ],
    "nuanceComparisons": [
      {
        "word": "Avant-garde",
        "distinction": "Pionnier audacieux défiant les conventions."
      },
      {
        "word": "Academic",
        "distinction": "Artiste docile respectant scrupuleusement les canons."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-23-aestheticism",
    "term": "Aestheticism",
    "phonetic": "/iːsˈθɛt.ɪ.sɪ.zəm/",
    "level": "B2",
    "category": "Culte du style",
    "frenchDef": "Esthétisme affirmant la primauté absolue de la beauté.",
    "englishDef": "The approach to art holding that art should exist solely for its own beauty.",
    "etymology": "Du grec 'aisthēsis' (sensation, émotion esthétique pure).",
    "pressExcerpt": "Late Victorian aestheticism favored peacock feathers, blue china, and lapidary prose.",
    "pressSource": "Victorian Studies",
    "collocations": [
      "pure aestheticism",
      "champion aestheticism",
      "literary aestheticism"
    ],
    "nuanceComparisons": [
      {
        "word": "Aestheticism",
        "distinction": "Culte de la beauté en soi."
      },
      {
        "word": "Didacticism",
        "distinction": "Art moralisateur visant à instruire lourdement."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-24-oeuvre",
    "term": "Oeuvre",
    "phonetic": "/ˈɜː.vrə/",
    "level": "B2",
    "category": "Corpus d'un artiste",
    "frenchDef": "Œuvre complète d'un peintre ou écrivain.",
    "englishDef": "The works of a painter, composer, or author regarded collectively.",
    "etymology": "Du latin 'opera' (le travail créateur accompli d'une vie).",
    "pressExcerpt": "The retrospective exhibition surveyed J.M.W. Turner's entire radiant oeuvre.",
    "pressSource": "The Burlington Magazine",
    "collocations": [
      "complete oeuvre",
      "major oeuvre",
      "survey an oeuvre"
    ],
    "nuanceComparisons": [
      {
        "word": "Oeuvre",
        "distinction": "Totalité des créations d'une existence."
      },
      {
        "word": "Masterpiece",
        "distinction": "L'œuvre unique la plus éclatante d'un corpus."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-25-palette",
    "term": "Palette",
    "phonetic": "/ˈpæl.ɪt/",
    "level": "B2",
    "category": "Harmonie des couleurs",
    "frenchDef": "Palette de peintre et harmonie chromatique.",
    "englishDef": "The range of colors used by a particular artist in a painting.",
    "etymology": "De l’ancien français 'palette' (petite pelle plate en bois).",
    "pressExcerpt": "Constable employed a muted palette of mossy greens and slate grays for his river scenes.",
    "pressSource": "Tate Britain",
    "collocations": [
      "color palette",
      "subdued palette",
      "rich palette"
    ],
    "nuanceComparisons": [
      {
        "word": "Palette",
        "distinction": "Éventail des tons choisis par l'artiste."
      },
      {
        "word": "Pigment",
        "distinction": "Poudre minérale colorée brute."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-26-surrealism",
    "term": "Surrealism",
    "phonetic": "/səˈrɪə.lɪ.zəm/",
    "level": "B2",
    "category": "Au-delà du réel",
    "frenchDef": "Surréalisme explorant le rêve et l'inconscient.",
    "englishDef": "A twentieth-century avant-garde movement in art and literature releasing the creative potential of the unconscious mind.",
    "etymology": "Du français 'sur-réalisme' forgé par Guillaume Apollinaire.",
    "pressExcerpt": "Magritte's paintings embody philosophical surrealism through poetic visual paradoxes.",
    "pressSource": "Modern Art Quarterly",
    "collocations": [
      "surrealism movement",
      "dreamlike surrealism",
      "pioneer of surrealism"
    ],
    "nuanceComparisons": [
      {
        "word": "Surrealism",
        "distinction": "Art inspiré des fulgurances du rêve."
      },
      {
        "word": "Naturalism",
        "distinction": "Copie scrupuleuse et photographique de la réalité."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-27-literary",
    "term": "Literary",
    "phonetic": "/ˈlɪt.ər.ər.i/",
    "level": "B2",
    "category": "Belles-lettres",
    "frenchDef": "Littéraire, digne de la haute langue et de l'orfèvrerie des mots.",
    "englishDef": "Concerning the writing, study, or content of literature, especially of the kind valued for artistic merit.",
    "etymology": "Du latin 'litterarius' (propre aux lettres et à l'éloquence).",
    "pressExcerpt": "Her prose boasts genuine literary distinction, blending classical cadence with wit.",
    "pressSource": "Times Literary Supplement",
    "collocations": [
      "literary distinction",
      "literary work",
      "literary tradition"
    ],
    "nuanceComparisons": [
      {
        "word": "Literary",
        "distinction": "De haute tenue poétique et esthétique."
      },
      {
        "word": "Journalistic",
        "distinction": "Écrit pour l'information factuelle rapide."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-28-composition",
    "term": "Composition",
    "phonetic": "/ˌkɒm.pəˈzɪʃ.ən/",
    "level": "B2",
    "category": "Agencement harmonieux",
    "frenchDef": "Composition ordonnant les volumes et lumières d'un tableau.",
    "englishDef": "The nature of something's ingredients or constituents; the way in which an artwork is arranged.",
    "etymology": "Du latin 'componere' (assembler dans de justes proportions).",
    "pressExcerpt": "The painter achieved dramatic tension through an off-center geometric composition.",
    "pressSource": "Art Monthly",
    "collocations": [
      "balanced composition",
      "dramatic composition",
      "painterly composition"
    ],
    "nuanceComparisons": [
      {
        "word": "Composition",
        "distinction": "Organisation calculée des masses et lignes."
      },
      {
        "word": "Chaos",
        "distinction": "Éparpillement désordonné des éléments."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-1re-29-pugnacity",
    "term": "Pugnacity",
    "phonetic": "/pʌɡˈnæs.ə.ti/",
    "level": "B2",
    "category": "Combativité",
    "frenchDef": "Combativité tenace sur le terrain.",
    "englishDef": "A natural disposition to be aggressive or combative; fierce competitive drive.",
    "etymology": "Du latin 'pugnare' (combattre à poings fermés).",
    "pressExcerpt": "The fly-half's fearless tactical pugnacity rallied his teammates against superior odds.",
    "pressSource": "Rugby Magazine",
    "collocations": [
      "fearless pugnacity",
      "tactical pugnacity",
      "show pugnacity"
    ],
    "nuanceComparisons": [
      {
        "word": "Pugnacity",
        "distinction": "Ardeur au combat sportif légal."
      },
      {
        "word": "Violence",
        "distinction": "Brutalité illégale et destructrice."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-30-supremacy",
    "term": "Supremacy",
    "phonetic": "/suːˈprɛm.ə.si/",
    "level": "B2",
    "category": "Hégémonie athlétique",
    "frenchDef": "Suprématie sportive écrasant la concurrence.",
    "englishDef": "The state or condition of being superior to all others in authority, power, or athletic status.",
    "etymology": "Du latin 'supremus' (le plus haut, le sommet souverain).",
    "pressExcerpt": "The Jamaican sprint relay team established absolute Olympic supremacy for a decade.",
    "pressSource": "Athletics International",
    "collocations": [
      "athletic supremacy",
      "claim supremacy",
      "uncontested supremacy"
    ],
    "nuanceComparisons": [
      {
        "word": "Supremacy",
        "distinction": "Domination sportive incontestée."
      },
      {
        "word": "Parity",
        "distinction": "Égalité stricte des forces en présence."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-31-fortitude",
    "term": "Fortitude",
    "phonetic": "/ˈfɔː.tɪ.tjuːd/",
    "level": "B2",
    "category": "Résistance morale",
    "frenchDef": "Force morale dans l'épreuve d'endurance.",
    "englishDef": "Courage in pain or adversity during athletic trials.",
    "etymology": "Du latin 'fortis' (vaillant et inébranlable).",
    "pressExcerpt": "Completing the Ironman triathalon demands uncompromising mental fortitude.",
    "pressSource": "Triathlete UK",
    "collocations": [
      "mental fortitude",
      "display fortitude",
      "unyielding fortitude"
    ],
    "nuanceComparisons": [
      {
        "word": "Fortitude",
        "distinction": "Constance courageuse dans la douleur."
      },
      {
        "word": "Pusillanimity",
        "distinction": "Lâcheté peureuse devant l'effort."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-32-stamina",
    "term": "Stamina",
    "phonetic": "/ˈstæm.ɪ.nə/",
    "level": "B2",
    "category": "Souffle & Endurance",
    "frenchDef": "Endurance physique soutenue dans l'intensité.",
    "englishDef": "The ability to sustain prolonged physical or mental effort.",
    "etymology": "Du latin 'stamina' (les fils tissés par les destins).",
    "pressExcerpt": "Rowing on the Thames builds immense lung capacity and aerobic stamina.",
    "pressSource": "Rowing World",
    "collocations": [
      "aerobic stamina",
      "boundless stamina",
      "build stamina"
    ],
    "nuanceComparisons": [
      {
        "word": "Stamina",
        "distinction": "Capacité à soutenir un effort intense prolongé."
      },
      {
        "word": "Sluggishness",
        "distinction": "Torpeur et lenteur apathique."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-33-ethos",
    "term": "Ethos",
    "phonetic": "/ˈiː.θɒs/",
    "level": "B2",
    "category": "Esprit de jeu",
    "frenchDef": "Esprit de corps et charte d'honneur sportif.",
    "englishDef": "The characteristic spirit of a culture or community as manifested in its beliefs and aspirations.",
    "etymology": "Du grec 'ēthos' (caractère moral et coutumes d'honneur).",
    "pressExcerpt": "The amateur rugby club preserved an ethos of mutual respect and camaraderie above victory.",
    "pressSource": "Sports Culture UK",
    "collocations": [
      "competitive ethos",
      "sporting ethos",
      "club ethos"
    ],
    "nuanceComparisons": [
      {
        "word": "Ethos",
        "distinction": "Idéal moral partagé d'un sport."
      },
      {
        "word": "Commercialism",
        "distinction": "Marchandisation financière exclusive."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-34-apex",
    "term": "Apex",
    "phonetic": "/ˈeɪ.pɛks/",
    "level": "B2",
    "category": "Sommet de la carrière",
    "frenchDef": "Apogée d'une carrière sportive.",
    "englishDef": "The top or highest part of something, especially one forming a point; the culmination.",
    "etymology": "Du latin 'apex' (la pointe terminale de la tiare).",
    "pressExcerpt": "At twenty-five, the tennis champion reached the supreme apex of her athletic prowess.",
    "pressSource": "Tennis Review",
    "collocations": [
      "reach the apex",
      "apex of a career",
      "climatic apex"
    ],
    "nuanceComparisons": [
      {
        "word": "Apex",
        "distinction": "Point culminant de la gloire."
      },
      {
        "word": "Nadir",
        "distinction": "Le point le plus bas d'un déclin."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-35-striving",
    "term": "Striving",
    "phonetic": "/ˈstraɪ.vɪŋ/",
    "level": "B2",
    "category": "Dépassement de soi",
    "frenchDef": "Effort constant vers le dépassement de soi.",
    "englishDef": "Making great efforts to achieve or obtain something; relentless endeavor.",
    "etymology": "Du vieux français 'estriver' (disputer avec ardeur pour la victoire).",
    "pressExcerpt": "The true Olympic spirit honors personal striving over mere medal counts.",
    "pressSource": "Olympic Review",
    "collocations": [
      "constant striving",
      "striving for excellence",
      "noble striving"
    ],
    "nuanceComparisons": [
      {
        "word": "Striving",
        "distinction": "Tension héroïque vers le meilleur."
      },
      {
        "word": "Complacency",
        "distinction": "Auto-satisfaction paresseuse."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-1re-36-orchestration",
    "term": "Orchestration",
    "phonetic": "/ˌɔː.kɪˈstreɪ.ʃən/",
    "level": "B2",
    "category": "Science des timbres",
    "frenchDef": "Orchestration équilibrant cordes, bois et cuivres.",
    "englishDef": "The arrangement of a musical composition for performance by an orchestra.",
    "etymology": "Du grec 'orkhēstra'.",
    "pressExcerpt": "Ravel was renowned for his iridescent and transparent orchestral orchestration.",
    "pressSource": "Gramophone",
    "collocations": [
      "masterly orchestration",
      "color in orchestration",
      "score orchestration"
    ],
    "nuanceComparisons": [
      {
        "word": "Orchestration",
        "distinction": "Distribution experte des pupitres de l'orchestre."
      },
      {
        "word": "Melody",
        "distinction": "Simple thème mélodique à une voix."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-37-syncopation",
    "term": "Syncopation",
    "phonetic": "/ˌsɪŋ.kəˈpeɪ.ʃən/",
    "level": "B2",
    "category": "Rythmes décalés",
    "frenchDef": "Syncope rythmique déplaçant l'accent sur le temps faible.",
    "englishDef": "A displacement of the regular accent associated with rhythmic beats.",
    "etymology": "Du grec 'synkopē' (coupure vive et inattendue du souffle).",
    "pressExcerpt": "The infectious syncopation of ragtime piano energized dance halls across Britain.",
    "pressSource": "Jazz Journal",
    "collocations": [
      "rhythmic syncopation",
      "subtle syncopation",
      "master syncopation"
    ],
    "nuanceComparisons": [
      {
        "word": "Syncopation",
        "distinction": "Accentuation inattendue du temps faible."
      },
      {
        "word": "Regularity",
        "distinction": "Battement régulier et uniforme sans surprise."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-38-dissonance",
    "term": "Dissonance",
    "phonetic": "/ˈdɪs.ən.əns/",
    "level": "B2",
    "category": "Tension harmonique",
    "frenchDef": "Dissonance créant une tension expressive avant la résolution.",
    "englishDef": "Lack of harmony among musical notes; tension awaiting release.",
    "etymology": "Du latin 'dissonare' (sonner de façon discordante et frappante).",
    "pressExcerpt": "Modern symphonists use sharp dissonance to evoke emotional turmoil.",
    "pressSource": "Musical Quarterly",
    "collocations": [
      "dramatic dissonance",
      "resolve a dissonance",
      "unresolved dissonance"
    ],
    "nuanceComparisons": [
      {
        "word": "Dissonance",
        "distinction": "Tension harmonique sollicitant une résolution."
      },
      {
        "word": "Consonance",
        "distinction": "Accord parfait et reposant pour l'oreille."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-39-repertoire",
    "term": "Repertoire",
    "phonetic": "/ˈrɛp.ə.twɑːr/",
    "level": "B2",
    "category": "Corpus d'œuvres",
    "frenchDef": "Répertoire des œuvres maîtrisées par un soliste.",
    "englishDef": "A stock of plays, dances, or pieces that a company or a performer is prepared to perform.",
    "etymology": "Du latin 'repertorium' (inventaire des partitions prêtes à l'exécution).",
    "pressExcerpt": "Her violin repertoire spans baroque sonatas to contemporary concertos.",
    "pressSource": "The Strad",
    "collocations": [
      "classical repertoire",
      "expand one's repertoire",
      "standard repertoire"
    ],
    "nuanceComparisons": [
      {
        "word": "Repertoire",
        "distinction": "Ensemble des œuvres prêtes à être jouées."
      },
      {
        "word": "Premiere",
        "distinction": "Création pour la toute première fois."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-40-virtuosic",
    "term": "Virtuosic",
    "phonetic": "/ˌvɜː.tʃuˈɒs.ɪk/",
    "level": "B2",
    "category": "Bravoure instrumentale",
    "frenchDef": "Virtuose, exécuté avec une prodigieuse agilité de doigts.",
    "englishDef": "Displaying exceptional technique and technical skill in artistic performance.",
    "etymology": "De 'virtuoso' (du latin virtus).",
    "pressExcerpt": "Liszt composed dazzling virtuosic passages that tested the mechanical limits of pianos.",
    "pressSource": "Piano Magazine",
    "collocations": [
      "virtuosic technique",
      "virtuosic performance",
      "dazzlingly virtuosic"
    ],
    "nuanceComparisons": [
      {
        "word": "Virtuosic",
        "distinction": "Exécuté avec une habileté stupéfiante."
      },
      {
        "word": "Rudimentary",
        "distinction": "Élémentaire et balbutiant."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-41-nuance",
    "term": "Nuance",
    "phonetic": "/ˈnjuː.ɑːns/",
    "level": "B2",
    "category": "Finesse d'inflexion",
    "frenchDef": "Nuance expressive d'interprétation.",
    "englishDef": "A subtle difference in or shade of meaning, expression, or sound.",
    "etymology": "Du français 'nue' (nuage aux teintes subtiles et dégradées).",
    "pressExcerpt": "The pianist played with exquisite nuance, never forcing the tone.",
    "pressSource": "Classic FM Review",
    "collocations": [
      "subtle nuance",
      "musical nuance",
      "expressive nuance"
    ],
    "nuanceComparisons": [
      {
        "word": "Nuance",
        "distinction": "Inflexion subtile et feutrée."
      },
      {
        "word": "Clamor",
        "distinction": "Vacarme brutal sans demi-teinte."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-42-cadenza",
    "term": "Cadenza",
    "phonetic": "/kəˈdɛn.zə/",
    "level": "B2",
    "category": "Solos d'apparat",
    "frenchDef": "Cadence soliste brillante au sein d'un concerto.",
    "englishDef": "A virtuoso solo passage inserted into a movement in a concerto near the end.",
    "etymology": "De l’italien 'cadenza' (chute virtuose avant l'accord final).",
    "pressExcerpt": "The violinist dazzled the audience during the concerto's fiery first-movement cadenza.",
    "pressSource": "The Strad",
    "collocations": [
      "violin cadenza",
      "brilliant cadenza",
      "improvised cadenza"
    ],
    "nuanceComparisons": [
      {
        "word": "Cadenza",
        "distinction": "Passage soliste solo de haute bravoure."
      },
      {
        "word": "Tutti",
        "distinction": "Intervention de l'orchestre au grand complet."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-1re-43-cordiality",
    "term": "Cordiality",
    "phonetic": "/ˌkɔː.diˈæl.ə.ti/",
    "level": "B2",
    "category": "Chaleur du cœur",
    "frenchDef": "Cordialité chaleureuse venant du fond du cœur.",
    "englishDef": "Sincere affection and warm hospitality.",
    "etymology": "Du latin 'cor' (le cœur généreux).",
    "pressExcerpt": "The host welcomed his foreign guests with unpretentious, genuine cordiality.",
    "pressSource": "Country Life",
    "collocations": [
      "warm cordiality",
      "receive with cordiality",
      "genuine cordiality"
    ],
    "nuanceComparisons": [
      {
        "word": "Cordiality",
        "distinction": "Chaleur sincère émanant du cœur."
      },
      {
        "word": "Hypocrisy",
        "distinction": "Façade mielleuse et trompeuse."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-44-gustatory",
    "term": "Gustatory",
    "phonetic": "/ˈɡʌs.tə.tər.i/",
    "level": "B2",
    "category": "Sens du goût",
    "frenchDef": "Gustatif, relatif aux délices et perceptions du palais.",
    "englishDef": "Concerned with tasting or the sense of taste.",
    "etymology": "Du latin 'gustus' (le sens du goût des mets).",
    "pressExcerpt": "The seven-course tasting menu offered an unforgettable gustatory journey.",
    "pressSource": "Fine Dining UK",
    "collocations": [
      "gustatory delight",
      "gustatory pleasure",
      "gustatory experience"
    ],
    "nuanceComparisons": [
      {
        "word": "Gustatory",
        "distinction": "Relatif aux sensations du goût."
      },
      {
        "word": "Olfactory",
        "distinction": "Relatif aux effluves de l'odorat."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-45-bon-vivant",
    "term": "Bon vivant",
    "phonetic": "/ˌbɒn viːˈvɒ̃ː/",
    "level": "B2",
    "category": "Amour de la vie",
    "frenchDef": "Bon vivant qui sait goûter les joies de la table.",
    "englishDef": "A person who devotes themselves to a sociable and luxurious lifestyle.",
    "etymology": "Du français 'bon vivant' (qui sait vivre noblement et joyeusement).",
    "pressExcerpt": "Known across London as a generous bon vivant, he hosted famous Sunday roasts.",
    "pressSource": "The Spectator",
    "collocations": [
      "celebrated bon vivant",
      "generous bon vivant",
      "true bon vivant"
    ],
    "nuanceComparisons": [
      {
        "word": "Bon vivant",
        "distinction": "Épicurien sociable aimant la fête et la bonne chère."
      },
      {
        "word": "Miser",
        "distinction": "Avare reclus se privant de tout."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-46-culinary-flair",
    "term": "Culinary flair",
    "phonetic": "/ˈkʌl.ɪ.nər.i fleər/",
    "level": "B2",
    "category": "Audace des saveurs",
    "frenchDef": "Brio et flair culinaire inventif.",
    "englishDef": "Natural talent and creative style in the preparation of gastronomy.",
    "etymology": "De 'culinary' et 'flair' (flair subtil, élégance instinctive).",
    "pressExcerpt": "The young chef demonstrated breathtaking culinary flair in pairing quince with game.",
    "pressSource": "Michelin Guide",
    "collocations": [
      "show culinary flair",
      "creative culinary flair",
      "acclaimed culinary flair"
    ],
    "nuanceComparisons": [
      {
        "word": "Culinary flair",
        "distinction": "Invention gustative étincelante."
      },
      {
        "word": "Routine cooking",
        "distinction": "Cuisine mécanique répétitive sans âme."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-47-vintage-reserve",
    "term": "Vintage reserve",
    "phonetic": "/ˈvɪn.tɪdʒ rɪˈzɜːv/",
    "level": "B2",
    "category": "Caves précieuses",
    "frenchDef": "Réserve millésimée vieillie en fûts de chêne.",
    "englishDef": "A choice wine or cider set aside from an exceptional harvest year.",
    "etymology": "Du latin 'vinum' et 'reservare'.",
    "pressExcerpt": "The head sommelier poured a rare vintage reserve aged for eighteen seasons.",
    "pressSource": "Sommelier Gazette",
    "collocations": [
      "bottle of vintage reserve",
      "cellar vintage reserve",
      "rare vintage reserve"
    ],
    "nuanceComparisons": [
      {
        "word": "Vintage reserve",
        "distinction": "Cuvée de réserve d'une récolte d'exception."
      },
      {
        "word": "Table wine",
        "distinction": "Vin ordinaire de consommation courante."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-48-banquet",
    "term": "Banquet",
    "phonetic": "/ˈbæŋ.kwɪt/",
    "level": "B2",
    "category": "Apparat festif",
    "frenchDef": "Banquet d'État célébrant les alliances.",
    "englishDef": "A formal and lavish dinner for many guests, typically in honor of an event.",
    "etymology": "De l’italien 'banchetto'.",
    "pressExcerpt": "A state banquet at Guildhall honored visiting European scientists and civic leaders.",
    "pressSource": "The Times",
    "collocations": [
      "state banquet",
      "formal banquet",
      "host a banquet"
    ],
    "nuanceComparisons": [
      {
        "word": "Banquet",
        "distinction": "Festin d'apparat hautement protocolaire."
      },
      {
        "word": "Picnic",
        "distinction": "Déjeuner informel sur l'herbe."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-49-gastronome",
    "term": "Gastronome",
    "phonetic": "/ˈɡæs.trə.nəʊm/",
    "level": "B2",
    "category": "Amateurs éclairés",
    "frenchDef": "Gastronome averti théorisant l'art culinaire.",
    "englishDef": "A person who is knowledgeable about good food and drink; a gourmet.",
    "etymology": "Du grec 'gastēr' et 'nomos'.",
    "pressExcerpt": "The nineteenth-century gastronome Brillat-Savarin penned immortal reflections on taste.",
    "pressSource": "Literary Gastronomy",
    "collocations": [
      "distinguished gastronome",
      "renowned gastronome",
      "learned gastronome"
    ],
    "nuanceComparisons": [
      {
        "word": "Gastronome",
        "distinction": "Penseur et dégustateur érudit de la table."
      },
      {
        "word": "Glutton",
        "distinction": "Mangeur insatiable sans raffinement."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-1re-50-homeostasis",
    "term": "Homeostasis",
    "phonetic": "/ˌhəʊ.mi.əʊˈsteɪ.sɪs/",
    "level": "B2",
    "category": "Équilibre biologique",
    "frenchDef": "Homéostasie, autorégulation physiologique de l'organisme.",
    "englishDef": "The tendency toward a relatively stable equilibrium between interdependent elements.",
    "etymology": "Du grec 'homoios' (semblable) et 'stasis' (état d'immobilité stable).",
    "pressExcerpt": "Adequate mineral intake and regular hydration maintain cellular homeostasis.",
    "pressSource": "Physiology Review",
    "collocations": [
      "cellular homeostasis",
      "maintain homeostasis",
      "physiological homeostasis"
    ],
    "nuanceComparisons": [
      {
        "word": "Homeostasis",
        "distinction": "Équilibre physiologique interne autorégulé."
      },
      {
        "word": "Dysfunction",
        "distinction": "Dérèglement pathologique de l'organisme."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-51-salutary",
    "term": "Salutary",
    "phonetic": "/ˈsæl.jʊ.tər.i/",
    "level": "B2",
    "category": "Effets bienfaisants",
    "frenchDef": "Salutaire, produisant un effet bienfaisant sur la santé.",
    "englishDef": "Producing good effects; beneficial to health and vigor.",
    "etymology": "Du latin 'salus' (salut, plénitude de vie).",
    "pressExcerpt": "A brisk daily walk in the morning crisp air had a salutary influence on his mood.",
    "pressSource": "Medical Times",
    "collocations": [
      "salutary effect",
      "salutary influence",
      "salutary lesson"
    ],
    "nuanceComparisons": [
      {
        "word": "Salutary",
        "distinction": "Bénéfique et vivifiant pour le corps."
      },
      {
        "word": "Deleterious",
        "distinction": "Nocif et délétère pour la santé."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-52-vigor",
    "term": "Vigor",
    "phonetic": "/ˈvɪɡ.ər/",
    "level": "B2",
    "category": "Force printanière",
    "frenchDef": "Vigueur physique et éclatante force vitale.",
    "englishDef": "Physical strength and good health; effortless energy.",
    "etymology": "Du latin 'vigor' (force jaillissante, sève de vie).",
    "pressExcerpt": "Regular open-air rowing restored physical vigor to the fatigued students.",
    "pressSource": "Athletics UK",
    "collocations": [
      "youthful vigor",
      "restore vigor",
      "full of vigor"
    ],
    "nuanceComparisons": [
      {
        "word": "Vigor",
        "distinction": "Force jaillissante pleine de sève."
      },
      {
        "word": "Lethargy",
        "distinction": "Apathie molle et engourdissement."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-53-therapeutic",
    "term": "Therapeutic",
    "phonetic": "/ˌθɛr.əˈpjuː.tɪk/",
    "level": "B2",
    "category": "Soins guérisseurs",
    "frenchDef": "Thérapeutique, doué de vertus curatives.",
    "englishDef": "Relating to the healing of disease; having a good effect on body or mind.",
    "etymology": "Du grec 'therapeutikos' (qui prend soin avec sollicitude).",
    "pressExcerpt": "Herbal chamomile tea has long been valued for its gentle therapeutic qualities.",
    "pressSource": "Phytotherapy Review",
    "collocations": [
      "therapeutic benefit",
      "therapeutic effect",
      "therapeutic diet"
    ],
    "nuanceComparisons": [
      {
        "word": "Therapeutic",
        "distinction": "Bénéfique pour la guérison et le soin."
      },
      {
        "word": "Pathogenic",
        "distinction": "Générateur de maladie ou d'infection."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-54-invigorating",
    "term": "Invigorating",
    "phonetic": "/ɪnˈvɪɡ.ər.eɪ.tɪŋ/",
    "level": "B2",
    "category": "Stimulant",
    "frenchDef": "Invigorant, qui fouette le sang et redonne de l'énergie.",
    "englishDef": "Making one feel strong, healthy, and full of energy.",
    "etymology": "Du latin 'in-' et 'vigor' (insuffler de la vigueur).",
    "pressExcerpt": "A dip in the Atlantic surf was breathtakingly cold yet thoroughly invigorating.",
    "pressSource": "Country Life",
    "collocations": [
      "invigorating walk",
      "invigorating bath",
      "thoroughly invigorating"
    ],
    "nuanceComparisons": [
      {
        "word": "Invigorating",
        "distinction": "Qui redonne instantanément du punch."
      },
      {
        "word": "Debilitating",
        "distinction": "Qui affaiblit et épuise les forces."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-55-dietary-regimen",
    "term": "Dietary regimen",
    "phonetic": "/ˈdaɪ.ə.tər.i ˈrɛdʒ.ɪ.mən/",
    "level": "B2",
    "category": "Diététique réglée",
    "frenchDef": "Régime diététique ordonné pour l'excellence physique.",
    "englishDef": "A systematic plan of nourishment prescribed to maintain optimum fitness.",
    "etymology": "Du grec 'diaita' et latin 'regimen'.",
    "pressExcerpt": "The varsity rowing squad adhered to a strict dietary regimen high in complex carbs.",
    "pressSource": "Sports Nutrition",
    "collocations": [
      "strict dietary regimen",
      "follow a dietary regimen",
      "healthy dietary regimen"
    ],
    "nuanceComparisons": [
      {
        "word": "Dietary regimen",
        "distinction": "Programme nutritionnel raisonné."
      },
      {
        "word": "Fad diet",
        "distinction": "Régime fantaisiste passager sans base scientifique."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-56-wholesome-diet",
    "term": "Wholesome diet",
    "phonetic": "/ˈhəʊl.səm ˈdaɪ.ət/",
    "level": "B2",
    "category": "Plats équilibrés",
    "frenchDef": "Alimentation saine et fortifiante exempte de produits ultra-transformés.",
    "englishDef": "Food conducive to physical well-being and health.",
    "etymology": "Du vieil anglais 'hōl' (entier, sain).",
    "pressExcerpt": "A wholesome diet composed of legumes, nuts, and fresh fish prevents chronic fatigue.",
    "pressSource": "Lancet Public Health",
    "collocations": [
      "maintain a wholesome diet",
      "nourishing wholesome diet",
      "principles of a wholesome diet"
    ],
    "nuanceComparisons": [
      {
        "word": "Wholesome diet",
        "distinction": "Nourriture saine et naturelle."
      },
      {
        "word": "Junk food",
        "distinction": "Nourriture industrielle grasse et vide de nutriments."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-1re-57-remunerative",
    "term": "Remunerative",
    "phonetic": "/rɪˈmjuː.nər.ə.tɪv/",
    "level": "B2",
    "category": "Revenus légitimes",
    "frenchDef": "Rémunérateur, procurant des gains légitimes.",
    "englishDef": "Financially rewarding; lucrative; providing fair compensation for labor.",
    "etymology": "Du latin 'remunerari' (récompenser un labeur d'un juste don).",
    "pressExcerpt": "Corporate law offered a remunerative career, yet she preferred pro bono human rights advocacy.",
    "pressSource": "Legal Gazette",
    "collocations": [
      "remunerative career",
      "remunerative post",
      "remunerative employment"
    ],
    "nuanceComparisons": [
      {
        "word": "Remunerative",
        "distinction": "Qui procure des revenus honorables."
      },
      {
        "word": "Unpaid",
        "distinction": "Travail non rémunéré bénévole."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-58-tenure",
    "term": "Tenure",
    "phonetic": "/ˈtɛn.jʊər/",
    "level": "B2",
    "category": "Stabilité académique",
    "frenchDef": "Titularisation académique garantissant la liberté d'enseignement.",
    "englishDef": "Guaranteed permanent employment, especially as a university professor or teacher.",
    "etymology": "Du latin 'tenere' (tenir fermement sa chaire).",
    "pressExcerpt": "After publishing her groundbreaking treatise on maritime law, the scholar was granted tenure.",
    "pressSource": "Higher Education Chronicle",
    "collocations": [
      "academic tenure",
      "granted tenure",
      "secure tenure"
    ],
    "nuanceComparisons": [
      {
        "word": "Tenure",
        "distinction": "Titularisation académique inamovible."
      },
      {
        "word": "Probation",
        "distinction": "Période d'essai probatoire révocable."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-59-corporate-ethics",
    "term": "Corporate ethics",
    "phonetic": "/ˈkɔː.pər.ət ˈɛθ.ɪks/",
    "level": "B2",
    "category": "Déontologie des affaires",
    "frenchDef": "Éthique d'entreprise guidant les pratiques managériales.",
    "englishDef": "The moral principles that govern a company's behavior and decisions.",
    "etymology": "Du latin 'corpus' et grec 'ēthos'.",
    "pressExcerpt": "Fair wages, transparent supply chains, and green energy are cornerstones of corporate ethics.",
    "pressSource": "Harvard Business Review",
    "collocations": [
      "uphold corporate ethics",
      "standards of corporate ethics",
      "code of corporate ethics"
    ],
    "nuanceComparisons": [
      {
        "word": "Corporate ethics",
        "distinction": "Devoir moral au sein de l'entreprise."
      },
      {
        "word": "Corruption",
        "distinction": "Malversations et pots-de-vin répréhensibles."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-60-diligence",
    "term": "Diligence",
    "phonetic": "/ˈdɪl.ɪ.dʒəns/",
    "level": "B2",
    "category": "Ardeur scrupuleuse",
    "frenchDef": "Diligence persévérante dans l'accomplissement des tâches.",
    "englishDef": "Persistent and careful work or effort.",
    "etymology": "Du latin 'diligere' (aimer ce que l'on fait avec zèle appliqué).",
    "pressExcerpt": "Due to her patient diligence, the historical archives were cataloged without a single error.",
    "pressSource": "Archival Studies",
    "collocations": [
      "due diligence",
      "show diligence",
      "rewarded for diligence"
    ],
    "nuanceComparisons": [
      {
        "word": "Diligence",
        "distinction": "Travail attentif mené avec amour du détail."
      },
      {
        "word": "Negligence",
        "distinction": "Faute commise par négligence coupable."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-61-entrepreneurship",
    "term": "Entrepreneurship",
    "phonetic": "/ˌɒn.trə.prəˈnɜː.ʃɪp/",
    "level": "B2",
    "category": "Esprit d'entreprise",
    "frenchDef": "Esprit d'entreprise osant l'innovation.",
    "englishDef": "The activity of setting up a business, taking on financial risks in the hope of profit.",
    "etymology": "Du français 'entreprendre'.",
    "pressExcerpt": "Cambridge University nurtures student entrepreneurship in clean biotechnology.",
    "pressSource": "Financial Times",
    "collocations": [
      "foster entrepreneurship",
      "spirit of entrepreneurship",
      "tech entrepreneurship"
    ],
    "nuanceComparisons": [
      {
        "word": "Entrepreneurship",
        "distinction": "Capacité à créer et développer une entreprise."
      },
      {
        "word": "Stagnation",
        "distinction": "Immobilité sans projet d'avenir."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-62-hierarchy",
    "term": "Hierarchy",
    "phonetic": "/ˈhaɪə.rɑː.ki/",
    "level": "B2",
    "category": "Organigrammes",
    "frenchDef": "Hiérarchie ordonnée des responsabilités en entreprise.",
    "englishDef": "A system in which members of an organization are ranked according to status or authority.",
    "etymology": "Du grec 'hierarkhia' (ordre sacré des dignités).",
    "pressExcerpt": "A modern horizontal hierarchy empowers frontline technicians to innovate directly.",
    "pressSource": "Management Review",
    "collocations": [
      "corporate hierarchy",
      "flat hierarchy",
      "climb the hierarchy"
    ],
    "nuanceComparisons": [
      {
        "word": "Hierarchy",
        "distinction": "Ordre hiérarchique structuré des fonctions."
      },
      {
        "word": "Anarchy",
        "distinction": "Absence totale de direction et d'ordre."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-63-merit",
    "term": "Merit",
    "phonetic": "/ˈmɛr.ɪt/",
    "level": "B2",
    "category": "Reconnaissance",
    "frenchDef": "Mérite professionnel reconnu par ses pairs.",
    "englishDef": "The quality of being particularly good or worthy, especially so as to deserve praise or reward.",
    "etymology": "Du latin 'meritum' (valeur intrinsèque qui mérite récompense).",
    "pressExcerpt": "Promotions within the research laboratory are decided strictly upon scientific merit.",
    "pressSource": "Nature Careers",
    "collocations": [
      "individual merit",
      "promote on merit",
      "recognized merit"
    ],
    "nuanceComparisons": [
      {
        "word": "Merit",
        "distinction": "Valeur éprouvée récompensée justement."
      },
      {
        "word": "Nepotism",
        "distinction": "Piston népotique favorisant les proches."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-1re-64-geopolitics",
    "term": "Geopolitics",
    "phonetic": "/ˌdʒiː.əʊˈpɒl.ə.tɪks/",
    "level": "B2",
    "category": "Relations mondiales",
    "frenchDef": "Géopolitique analysant l'influence des territoires sur le pouvoir.",
    "englishDef": "Politics, especially international relations, as influenced by geographical factors.",
    "etymology": "Du grec 'gē' (la Terre) et 'politika' (les affaires de la cité).",
    "pressExcerpt": "The opening of Arctic shipping lanes has reshaped maritime geopolitics.",
    "pressSource": "Foreign Affairs",
    "collocations": [
      "international geopolitics",
      "study geopolitics",
      "global geopolitics"
    ],
    "nuanceComparisons": [
      {
        "word": "Geopolitics",
        "distinction": "Étude des équilibres mondiaux liés à la géographie."
      },
      {
        "word": "Local politics",
        "distinction": "Politique municipale de quartier."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-65-civic-virtue",
    "term": "Civic virtue",
    "phonetic": "/ˈsɪv.ɪk ˈvɜː.tʃuː/",
    "level": "B2",
    "category": "Engagement citoyen",
    "frenchDef": "Vertu civique dévouée à l'intérêt général.",
    "englishDef": "The dedication of citizens to the common welfare of their community even at the cost of individual interests.",
    "etymology": "Du latin 'civis' (citoyen) et 'virtus' (vaillance morale).",
    "pressExcerpt": "Volunteering at coastal lifeboat stations exemplifies ancient civic virtue.",
    "pressSource": "Political Philosophy",
    "collocations": [
      "practice civic virtue",
      "ideals of civic virtue",
      "foster civic virtue"
    ],
    "nuanceComparisons": [
      {
        "word": "Civic virtue",
        "distinction": "Dévouement actif au bien public."
      },
      {
        "word": "Civic apathy",
        "distinction": "Désintérêt égoïste pour la communauté."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-66-iconography",
    "term": "Iconography",
    "phonetic": "/ˌaɪ.kəˈnɒɡ.rə.fi/",
    "level": "B2",
    "category": "Symboles d'art",
    "frenchDef": "Iconographie décryptant le sens caché des symboles.",
    "englishDef": "The visual images, symbols, or modes of representation collectively associated with a person or movement.",
    "etymology": "Du grec 'eikōn' (image sainte) et 'graphein' (décrire).",
    "pressExcerpt": "The art historian deciphered the floral iconography painted in the portrait background.",
    "pressSource": "Burlington Magazine",
    "collocations": [
      "artistic iconography",
      "religious iconography",
      "study iconography"
    ],
    "nuanceComparisons": [
      {
        "word": "Iconography",
        "distinction": "Langage symbolique des images."
      },
      {
        "word": "Abstract art",
        "distinction": "Art non figuratif sans symboles narratifs."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-67-camaraderie",
    "term": "Camaraderie",
    "phonetic": "/ˌkæm.əˈrɑː.dər.i/",
    "level": "B2",
    "category": "Fraternité de camp",
    "frenchDef": "Camaraderie chaleureuse unissant ceux qui traversent l'épreuve.",
    "englishDef": "Mutual trust and friendship among people who spend a lot of time together.",
    "etymology": "Du français 'camarade' (qui partageait la même chambrée de chambrée militaire).",
    "pressExcerpt": "Enduring camaraderie blossomed among the scholars during their field research in Wales.",
    "pressSource": "Oxford Review",
    "collocations": [
      "spirit of camaraderie",
      "warm camaraderie",
      "feel camaraderie"
    ],
    "nuanceComparisons": [
      {
        "word": "Camaraderie",
        "distinction": "Fraternité forgée dans l'action partagée."
      },
      {
        "word": "Hostility",
        "distinction": "Rivalité hostile et mesquine."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-68-altruistic",
    "term": "Altruistic",
    "phonetic": "/ˌæl.truˈɪs.tɪk/",
    "level": "B2",
    "category": "Don désintéressé",
    "frenchDef": "Altruiste, agissant uniquement pour le bien d'autrui.",
    "englishDef": "Showing a disinterested and selfless concern for the well-being of others.",
    "etymology": "De l’italien 'altrui' (d'autrui, du prochain).",
    "pressExcerpt": "Her altruistic dedication to teaching underprivileged children won the civic medal.",
    "pressSource": "Humanitarian Gazette",
    "collocations": [
      "altruistic motive",
      "purely altruistic",
      "altruistic deed"
    ],
    "nuanceComparisons": [
      {
        "word": "Altruistic",
        "distinction": "Généreux sans arrière-pensée d'intérêt."
      },
      {
        "word": "Selfish",
        "distinction": "Égoïste et calculateur."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-69-amity",
    "term": "Amity",
    "phonetic": "/ˈæm.ə.ti/",
    "level": "B2",
    "category": "Amitié entre peuples",
    "frenchDef": "Amitié pacifique et concorde diplomatique entre nations.",
    "englishDef": "A friendly relationship, especially between nations.",
    "etymology": "Du latin 'amicitia' (amitié sacrée liant les peuples).",
    "pressExcerpt": "The maritime treaty laid foundations for lasting amity and cultural exchange across the sea.",
    "pressSource": "International Law",
    "collocations": [
      "treaty of amity",
      "international amity",
      "bond of amity"
    ],
    "nuanceComparisons": [
      {
        "word": "Amity",
        "distinction": "Amitié et concorde officielle entre États."
      },
      {
        "word": "Belligerence",
        "distinction": "État de guerre armée."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-70-devoted",
    "term": "Devoted",
    "phonetic": "/dɪˈvəʊ.tɪd/",
    "level": "B2",
    "category": "Amour sans faille",
    "frenchDef": "Dévoué avec constance et pure tendresse.",
    "englishDef": "Very loving or loyal; giving oneself entirely to someone or something.",
    "etymology": "Du latin 'devovere' (consacrer par vœu solennel).",
    "pressExcerpt": "The lifelong companions remained devoted to each other through every chapter of life.",
    "pressSource": "Literature Review",
    "collocations": [
      "devoted partner",
      "devoted to art",
      "deeply devoted"
    ],
    "nuanceComparisons": [
      {
        "word": "Devoted",
        "distinction": "Fidèle et dévoué jusqu'au bout."
      },
      {
        "word": "Treacherous",
        "distinction": "Félon et prompt à trahir."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-1re-71-pluralism",
    "term": "Pluralism",
    "phonetic": "/ˈplʊə.rəl.ɪ.zəm/",
    "level": "B2",
    "category": "Diversité féconde",
    "frenchDef": "Pluralisme accueillant la diversité des idées.",
    "englishDef": "A condition or system in which two or more states, groups, or principles coexist.",
    "etymology": "Du latin 'pluralis' (relatif au multiple et au divers).",
    "pressExcerpt": "Democratic strength relies upon intellectual pluralism and peaceful public debate.",
    "pressSource": "Political Quarterly",
    "collocations": [
      "cultural pluralism",
      "democratic pluralism",
      "embrace pluralism"
    ],
    "nuanceComparisons": [
      {
        "word": "Pluralism",
        "distinction": "Harmonieuse coexistence des différences."
      },
      {
        "word": "Totalitarianism",
        "distinction": "Imposition autoritaire d'une pensée unique."
      }
    ],
    "gradeLevel": "1re",
    "gradeLabel": "Première (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-01-quotidian",
    "term": "Quotidian",
    "phonetic": "/kwɒˈtɪd.i.ən/",
    "level": "C1",
    "category": "Poésie des jours",
    "frenchDef": "Quotidien, ordinaire, mais recelant la grâce des jours.",
    "englishDef": "Of or occurring every day; daily; ordinary or everyday.",
    "etymology": "Du latin 'quotidianus' (qui revient chaque jour sans faillir).",
    "pressExcerpt": "The essayist celebrated the quiet poetry of quotidian rituals: brewing black tea, lighting hearth fires.",
    "pressSource": "Times Literary Supplement",
    "collocations": [
      "quotidian life",
      "quotidian reality",
      "quotidian rhythm"
    ],
    "nuanceComparisons": [
      {
        "word": "Quotidian",
        "distinction": "Le cours ordinaire des jours quotidiens."
      },
      {
        "word": "Extraordinary",
        "distinction": "L'événement exceptionnel hors norme."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-02-solipsism",
    "term": "Solipsism",
    "phonetic": "/ˈsɒl.ɪp.sɪ.zəm/",
    "level": "C1",
    "category": "Enfermement du moi",
    "frenchDef": "Solipsisme, illusion philosophique de l'esprit enfermé en soi-même.",
    "englishDef": "The philosophical theory that only oneself exists, or that only one's mental experiences can be known.",
    "etymology": "Du latin 'solus' (seul) et 'ipse' (soi-même).",
    "pressExcerpt": "True dialogue dismantles solipsism, opening the soul to the sovereign reality of the other.",
    "pressSource": "Philosophical Inquiries",
    "collocations": [
      "intellectual solipsism",
      "danger of solipsism",
      "escape solipsism"
    ],
    "nuanceComparisons": [
      {
        "word": "Solipsism",
        "distinction": "Enfermement dans la seule certitude de son moi."
      },
      {
        "word": "Intersubjectivity",
        "distinction": "Rencontre féconde de deux consciences libres."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-03-ephemeral",
    "term": "Ephemeral",
    "phonetic": "/ɪˈfɛm.ər.əl/",
    "level": "C1",
    "category": "Caractère passager",
    "frenchDef": "Éphémère, d'une fugacité poétique touchante.",
    "englishDef": "Lasting for a very short time; transient.",
    "etymology": "Du grec 'ephēmeros' (qui ne dure qu'un seul jour d'aurore à couchant).",
    "pressExcerpt": "Morning dew on spider silk is an ephemeral wonder that vanishes at the first sunbeam.",
    "pressSource": "Nature & Spirit",
    "collocations": [
      "ephemeral beauty",
      "ephemeral nature",
      "ephemeral moment"
    ],
    "nuanceComparisons": [
      {
        "word": "Ephemeral",
        "distinction": "Qui ne dure qu'un bref instant."
      },
      {
        "word": "Eternal",
        "distinction": "Éternel, immuable par-delà les siècles."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-04-punctilio",
    "term": "Punctilio",
    "phonetic": "/pʌŋkˈtɪl.i.əʊ/",
    "level": "C1",
    "category": "Honneur des égards",
    "frenchDef": "Point d'honneur minutieux dans les manières.",
    "englishDef": "A fine or petty point of conduct or procedure; meticulous etiquette.",
    "etymology": "De l’italien 'puntiglio' (petit point d'honneur délicat).",
    "pressExcerpt": "Lord Chesterfield instructed his son never to sacrifice courtesy to haste, observing every punctilio.",
    "pressSource": "Letters to His Son",
    "collocations": [
      "observe punctilio",
      "diplomatic punctilio",
      "social punctilio"
    ],
    "nuanceComparisons": [
      {
        "word": "Punctilio",
        "distinction": "Règle de courtoisie minutieusement observée."
      },
      {
        "word": "Insolence",
        "distinction": "Manque délibéré d'égards et de respect."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-05-fastidious",
    "term": "Fastidious",
    "phonetic": "/fæˈstɪd.i.əs/",
    "level": "C1",
    "category": "Rigueur extrême",
    "frenchDef": "Fastidieux par méticulosité, exigeant une précision irréprochable.",
    "englishDef": "Very attentive to and concerned about accuracy, elegance, and detail.",
    "etymology": "Du latin 'fastidiosus' (dédaigneux de l'à-peu-près, hautement exigeant).",
    "pressExcerpt": "The editor was fastidious about semicolon placement and cadence in neoclassical prose.",
    "pressSource": "Cambridge Editorial",
    "collocations": [
      "fastidious taste",
      "fastidious attention",
      "fastidious scholar"
    ],
    "nuanceComparisons": [
      {
        "word": "Fastidious",
        "distinction": "D'une exigence méticuleuse absolue."
      },
      {
        "word": "Careless",
        "distinction": "Désinvolte et brouillon sans rigueur."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-06-cadence",
    "term": "Cadence",
    "phonetic": "/ˈkeɪ.dəns/",
    "level": "C1",
    "category": "Rythme solennel",
    "frenchDef": "Cadence souveraine des heures et des saisons.",
    "englishDef": "A rhythmic sequence or flow of sounds in language or living.",
    "etymology": "Du latin 'cadere' (chute harmonique d'une phrase vers sa plénitude).",
    "pressExcerpt": "The cadence of collegiate life in Oxford moved in concert with chapel bells and river tides.",
    "pressSource": "Bodleian Gazette",
    "collocations": [
      "solemn cadence",
      "cadence of life",
      "poetic cadence"
    ],
    "nuanceComparisons": [
      {
        "word": "Cadence",
        "distinction": "Pulsation cadencée et sereine."
      },
      {
        "word": "Discord",
        "distinction": "Désordre sans harmonie ni mesure."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-07-equanimity",
    "term": "Equanimity",
    "phonetic": "/ˌɛk.wəˈnɪm.ə.ti/",
    "level": "C1",
    "category": "Paix de l'âme",
    "frenchDef": "Équanimité stoïcienne préservée face aux tempêtes du sort.",
    "englishDef": "Calmness and composure, especially in a difficult situation.",
    "etymology": "Du latin 'aequus animus' (âme égale, inébranlable).",
    "pressExcerpt": "Marcus Aurelius counseled that royal dignity resides in equanimity before unexpected adversity.",
    "pressSource": "Classical Philosophy",
    "collocations": [
      "stoic equanimity",
      "preserve equanimity",
      "unbroken equanimity"
    ],
    "nuanceComparisons": [
      {
        "word": "Equanimity",
        "distinction": "Paix souveraine de l'âme égale."
      },
      {
        "word": "Tumult",
        "distinction": "Tourmente intérieure affolée."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "vie_quotidienne",
    "themeLabel": "Vie quotidienne"
  },
  {
    "id": "card-terminale-08-peregrination",
    "term": "Peregrination",
    "phonetic": "/ˌpɛr.ɪ.ɡrɪˈneɪ.ʃən/",
    "level": "C1",
    "category": "Errances savantes",
    "frenchDef": "Pérégrination studieuse de contrée en contrée.",
    "englishDef": "A journey, especially a long or meandering one on foot.",
    "etymology": "Du latin 'peregrinatio' (voyage en terre étrangère à la recherche du savoir).",
    "pressExcerpt": "His scholarly peregrinations through European library archives bore fruit in a monumental history of books.",
    "pressSource": "Bibliographical Society",
    "collocations": [
      "scholarly peregrination",
      "extended peregrination",
      "ancient peregrination"
    ],
    "nuanceComparisons": [
      {
        "word": "Peregrination",
        "distinction": "Long périple studieux ou errant."
      },
      {
        "word": "Commute",
        "distinction": "Aller-retour routinier entre deux gares."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-09-wanderlust",
    "term": "Wanderlust",
    "phonetic": "/ˈwɒn.də.lʌst/",
    "level": "C1",
    "category": "Soif des horizons",
    "frenchDef": "Wanderlust, soif métaphysique des horizons lointains.",
    "englishDef": "An irresistible urge to travel and explore the unknown world.",
    "etymology": "De l’allemand 'wandern' et 'Lust'.",
    "pressExcerpt": "No domestic comfort could extinguish the deep wanderlust that drove him toward polar ice shelves.",
    "pressSource": "National Geographic Fellowship",
    "collocations": [
      "insatiable wanderlust",
      "succumb to wanderlust",
      "wanderlust in the soul"
    ],
    "nuanceComparisons": [
      {
        "word": "Wanderlust",
        "distinction": "Désir passionné de l'inconnu."
      },
      {
        "word": "Agoraphobia",
        "distinction": "Peur panique des grands espaces."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-10-odyssean",
    "term": "Odyssean",
    "phonetic": "/ˌɒd.əˈsiː.ən/",
    "level": "C1",
    "category": "Épopées mythiques",
    "frenchDef": "Odysséen, digne des voyages d'Ulysse bravant vents et destins.",
    "englishDef": "Resembling the long, adventurous wandering of Odysseus.",
    "etymology": "D'Ulysse (Odusseus en grec).",
    "pressExcerpt": "The botanist's ten-year trek across the Amazon was an Odyssean trial of patience and fortitude.",
    "pressSource": "Nature Expeditions",
    "collocations": [
      "Odyssean trial",
      "Odyssean journey",
      "Odyssean voyage"
    ],
    "nuanceComparisons": [
      {
        "word": "Odyssean",
        "distinction": "Épique, formateur et plein d'épreuves héroïques."
      },
      {
        "word": "Trivial",
        "distinction": "Anodin et sans enjeu d'âme."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-11-transatlantic",
    "term": "Transatlantic",
    "phonetic": "/ˌtrænz.ətˈlæn.tɪk/",
    "level": "C1",
    "category": "Océans immenses",
    "frenchDef": "Transatlantique, franchissant l'immensité de l'océan.",
    "englishDef": "Crossing or extending across the Atlantic Ocean.",
    "etymology": "Du latin 'trans' (au-delà) et 'Atlanticus'.",
    "pressExcerpt": "Cunard steamships pioneered scheduled transatlantic crossings under stormy northern skies.",
    "pressSource": "Maritime History",
    "collocations": [
      "transatlantic flight",
      "transatlantic liner",
      "transatlantic ties"
    ],
    "nuanceComparisons": [
      {
        "word": "Transatlantic",
        "distinction": "Qui relie les deux rives de l'Atlantique."
      },
      {
        "word": "Inland",
        "distinction": "À l'intérieur des terres sans contact avec l'océan."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-12-sojourn",
    "term": "Sojourn",
    "phonetic": "/ˈsɒdʒ.ɜːn/",
    "level": "C1",
    "category": "Halte méditative",
    "frenchDef": "Séjour d'étude et de méditation en terre étrangère.",
    "englishDef": "A temporary stay at a memorable place.",
    "etymology": "Du latin 'subdiurnare'.",
    "pressExcerpt": "Shelley's sojourn on the shores of Lake Geneva ignited gothic masterpieces in world literature.",
    "pressSource": "Romanticism Studies",
    "collocations": [
      "memorable sojourn",
      "poetic sojourn",
      "brief sojourn"
    ],
    "nuanceComparisons": [
      {
        "word": "Sojourn",
        "distinction": "Séjour temporaire fécond."
      },
      {
        "word": "Exile",
        "distinction": "Bannissement hors de sa patrie."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-13-perambulation",
    "term": "Perambulation",
    "phonetic": "/pəˌræm.bjʊˈleɪ.ʃən/",
    "level": "C1",
    "category": "Marche contemplative",
    "frenchDef": "Déambulation pédestre arpentant un territoire pour en saisir l'esprit.",
    "englishDef": "The act of walking around or through a territory to inspect its bounds.",
    "etymology": "Du latin 'perambulare' (marcher de long en large à travers champs).",
    "pressExcerpt": "Thomas Hardy loved solitary dusk perambulations across the chalk downs of Wessex.",
    "pressSource": "Wessex Gazette",
    "collocations": [
      "solitary perambulation",
      "rural perambulation",
      "enjoy a perambulation"
    ],
    "nuanceComparisons": [
      {
        "word": "Perambulation",
        "distinction": "Arpentage pédestre méditatif."
      },
      {
        "word": "Sprint",
        "distinction": "Course effrénée d'urgence."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-14-maritime",
    "term": "Maritime",
    "phonetic": "/ˈmær.ɪ.taɪm/",
    "level": "C1",
    "category": "Lois de l'océan",
    "frenchDef": "Maritime, façonné par les marées et le grand large.",
    "englishDef": "Connected with the sea, especially in relation to seafaring commercial navigation.",
    "etymology": "Du latin 'maritimus' (appartenant à la mer majestueuse).",
    "pressExcerpt": "Great Britain's historical prosperity was anchored upon maritime supremacy and naval charting.",
    "pressSource": "Admiralty Review",
    "collocations": [
      "maritime law",
      "maritime empire",
      "maritime expedition"
    ],
    "nuanceComparisons": [
      {
        "word": "Maritime",
        "distinction": "Relatif à la mer et aux marins."
      },
      {
        "word": "Terrestrial",
        "distinction": "Relatif à la terre ferme."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "voyages",
    "themeLabel": "Voyages & Déplacements"
  },
  {
    "id": "card-terminale-15-anachronism",
    "term": "Anachronism",
    "phonetic": "/əˈnæk.rə.nɪ.zəm/",
    "level": "C1",
    "category": "Erreurs de temps",
    "frenchDef": "Anachronisme plaçant un objet ou une idée hors de son siècle.",
    "englishDef": "A thing belonging or appropriate to a period other than that in which it exists.",
    "etymology": "Du grec 'ana' (en arrière, contre) et 'khronos' (le temps historique).",
    "pressExcerpt": "Depicting a clock striking in ancient Rome is a celebrated Shakespearean anachronism in Julius Caesar.",
    "pressSource": "Oxford Literary Journal",
    "collocations": [
      "historical anachronism",
      "glaring anachronism",
      "avoid anachronism"
    ],
    "nuanceComparisons": [
      {
        "word": "Anachronism",
        "distinction": "Confusion temporelle chronologique."
      },
      {
        "word": "Synchronicity",
        "distinction": "Simultanéité temporelle exacte."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-16-immemorial",
    "term": "Immemorial",
    "phonetic": "/ˌɪm.əˈmɔː.ri.əl/",
    "level": "C1",
    "category": "Au-delà des mémoires",
    "frenchDef": "Immémorial, remontant à une époque si lointaine que nulle mémoire n'en garde l'origine.",
    "englishDef": "Originating in the distant past; very old.",
    "etymology": "Du latin 'immemorialis' (qui dépasse la mémoire des hommes).",
    "pressExcerpt": "Common law customs have governed village commons from time immemorial.",
    "pressSource": "High Court Law Gazette",
    "collocations": [
      "from time immemorial",
      "immemorial custom",
      "immemorial past"
    ],
    "nuanceComparisons": [
      {
        "word": "Immemorial",
        "distinction": "Si antique que son origine se perd dans la nuit des temps."
      },
      {
        "word": "Recent",
        "distinction": "Datant de quelques jours ou années."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-17-palimpsest",
    "term": "Palimpsest",
    "phonetic": "/ˈpæl.ɪmp.sɛst/",
    "level": "C1",
    "category": "Manuscrits effacés",
    "frenchDef": "Palimpseste dont le texte initial a été gratté pour réécrire par-dessus.",
    "englishDef": "A manuscript or piece of writing material on which later writing has been superimposed on effaced earlier writing.",
    "etymology": "Du grec 'palin' (à nouveau) et 'psan' (gratter, effacer).",
    "pressExcerpt": "Ultra-violet spectral imaging revealed lost Archimedes treatises hidden beneath a medieval palimpsest prayer book.",
    "pressSource": "British Museum Archaeology",
    "collocations": [
      "ancient palimpsest",
      "decode a palimpsest",
      "city as palimpsest"
    ],
    "nuanceComparisons": [
      {
        "word": "Palimpsest",
        "distinction": "Parchemin portant les traces de textes effacés sous le neuf."
      },
      {
        "word": "Tabula rasa",
        "distinction": "Table rase sans nulle trace du passé."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-18-panegyric",
    "term": "Panegyric",
    "phonetic": "/ˌpæn.əˈdʒɪr.ɪk/",
    "level": "C1",
    "category": "Éloges solennels",
    "frenchDef": "Panégyrique, discours d'éloge public solennel célébrant un héros.",
    "englishDef": "A public speech or published text in praise of someone or something.",
    "etymology": "Du grec 'panēgyrikos' (discours prononcé devant l'assemblée du peuple en fête).",
    "pressExcerpt": "Cicero delivered a fiery oratorical panegyric celebrating the defender of the Roman constitution.",
    "pressSource": "Classical Rhetoric Quarterly",
    "collocations": [
      "deliver a panegyric",
      "poetic panegyric",
      "oratorical panegyric"
    ],
    "nuanceComparisons": [
      {
        "word": "Panegyric",
        "distinction": "Éloge oratoire éclatant."
      },
      {
        "word": "Philippic",
        "distinction": "Discours d'invective virulente contre un tyran."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-19-dynastic",
    "term": "Dynastic",
    "phonetic": "/dɪˈnæs.tɪk/",
    "level": "C1",
    "category": "Transmission royale",
    "frenchDef": "Dynastique, relatif aux successions de couronnes héréditaires.",
    "englishDef": "Relating to a line of hereditary rulers.",
    "etymology": "Du grec 'dynasteia' (seigneurie souveraine).",
    "pressExcerpt": "The dynastic marriage between Henry VII and Elizabeth of York reconciled Lancaster and York.",
    "pressSource": "Tudor Studies",
    "collocations": [
      "dynastic alliance",
      "dynastic succession",
      "dynastic power"
    ],
    "nuanceComparisons": [
      {
        "word": "Dynastic",
        "distinction": "Fondé sur la succession légitime du sang royal."
      },
      {
        "word": "Usurpation",
        "distinction": "Prise de pouvoir par coup de force illégal."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-20-genesis",
    "term": "Genesis",
    "phonetic": "/ˈdʒɛn.ə.sɪs/",
    "level": "C1",
    "category": "Origine des mondes",
    "frenchDef": "Genèse, naissance première et origines d'un ordre nouveau.",
    "englishDef": "The origin or mode of formation of something.",
    "etymology": "Du grec 'genesis' (naissance, création première).",
    "pressExcerpt": "The Magna Carta of 1215 marks the genesis of statutory constitutional liberty in the English-speaking world.",
    "pressSource": "History Today",
    "collocations": [
      "genesis of an empire",
      "mark the genesis",
      "historical genesis"
    ],
    "nuanceComparisons": [
      {
        "word": "Genesis",
        "distinction": "Acte premier de création fondatrice."
      },
      {
        "word": "Extinction",
        "distinction": "Disparition totale et anéantissement."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-21-archetype",
    "term": "Archetype",
    "phonetic": "/ˈɑː.kɪ.taɪp/",
    "level": "C1",
    "category": "Modèles premiers",
    "frenchDef": "Archétype, modèle originel gravé dans l'imaginaire des civilisations.",
    "englishDef": "A very typical example of a certain person or thing; an original model.",
    "etymology": "Du grec 'arkhetupon' (modèle premier gravé en matrice).",
    "pressExcerpt": "King Arthur stands as the enduring mythological archetype of the noble, self-sacrificing sovereign.",
    "pressSource": "Folklore & Myth",
    "collocations": [
      "literary archetype",
      "mythological archetype",
      "classic archetype"
    ],
    "nuanceComparisons": [
      {
        "word": "Archetype",
        "distinction": "Modèle fondamental matrice universelle."
      },
      {
        "word": "Derivative",
        "distinction": "Pâle imitation sans originalité."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "histoire_patrimoine",
    "themeLabel": "Histoire & Patrimoine"
  },
  {
    "id": "card-terminale-22-connoisseurship",
    "term": "Connoisseurship",
    "phonetic": "/ˌkɒn.əˈsɜː.ʃɪp/",
    "level": "C1",
    "category": "Science du regard",
    "frenchDef": "Connaisseurship, expertise critique infaillible dans l'authentification des œuvres.",
    "englishDef": "The expert knowledge or qualification of a connoisseur.",
    "etymology": "De l’ancien français 'conoître' et suffixe de haute maîtrise '-ship'.",
    "pressExcerpt": "Berenson's connoisseurship enabled him to identify unsigned Florentine masterpieces by brushstroke nuance alone.",
    "pressSource": "Burlington Magazine",
    "collocations": [
      "art connoisseurship",
      "exercise connoisseurship",
      "depth of connoisseurship"
    ],
    "nuanceComparisons": [
      {
        "word": "Connoisseurship",
        "distinction": "Capacité critique à discerner l'authentique."
      },
      {
        "word": "Ignorance",
        "distinction": "Incapacité à distinguer l'original de la copie."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-23-pastiche",
    "term": "Pastiche",
    "phonetic": "/pæsˈtiːʃ/",
    "level": "C1",
    "category": "Hommages artistiques",
    "frenchDef": "Pastiche littéraire ou pictural imitant avec génie la manière d'un maître.",
    "englishDef": "An artistic work in a style that imitates that of another work, artist, or period.",
    "etymology": "De l’italien 'pasticcio' (pâté de matières savamment mêlées).",
    "pressExcerpt": "The modern novelist crafted an exquisite pastiche of Sir Arthur Conan Doyle's Sherlock Holmes prose.",
    "pressSource": "Times Literary Supplement",
    "collocations": [
      "literary pastiche",
      "clever pastiche",
      "compose a pastiche"
    ],
    "nuanceComparisons": [
      {
        "word": "Pastiche",
        "distinction": "Imitation virtuose rendant hommage."
      },
      {
        "word": "Forgery",
        "distinction": "Faux criminel forgé pour escroquer."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-24-chiaroscuro",
    "term": "Chiaroscuro",
    "phonetic": "/kiˌɑː.rəˈskjʊə.rəʊ/",
    "level": "C1",
    "category": "Ombre et lumière",
    "frenchDef": "Clair-obscur dramatic contrastant l'ombre profonde et la vive clarté.",
    "englishDef": "The treatment of light and shade in drawing and painting.",
    "etymology": "De l’italien 'chiaro' (clair) et 'scuro' (obscur).",
    "pressExcerpt": "Caravaggio's chiaroscuro bathes the saint's calling in heavenly beams amidst tavern gloom.",
    "pressSource": "Tate Papers",
    "collocations": [
      "dramatic chiaroscuro",
      "master of chiaroscuro",
      "chiaroscuro lighting"
    ],
    "nuanceComparisons": [
      {
        "word": "Chiaroscuro",
        "distinction": "Contraste sculptural de lumière et d'ombre."
      },
      {
        "word": "Flat illumination",
        "distinction": "Lumière uniforme sans aucun relief d'ombre."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-25-subtlety",
    "term": "Subtlety",
    "phonetic": "/ˈsʌt.əl.ti/",
    "level": "C1",
    "category": "Finesse d'esprit",
    "frenchDef": "Subtilité délicate échappant aux regards vulgaires.",
    "englishDef": "The quality of being subtle; delicate or precise distinction.",
    "etymology": "Du latin 'subtilis' (tissé avec des fils d'une extrême finesse).",
    "pressExcerpt": "Henry James constructed novels of unmatched psychological subtlety and layered ambiguity.",
    "pressSource": "Literary Essays",
    "collocations": [
      "psychological subtlety",
      "nuanced subtlety",
      "admire subtlety"
    ],
    "nuanceComparisons": [
      {
        "word": "Subtlety",
        "distinction": "Finesse imperceptible aux esprits grossiers."
      },
      {
        "word": "Crassness",
        "distinction": "Grossièreté lourde et sans fard."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-26-nuance",
    "term": "Nuance",
    "phonetic": "/ˈnjuː.ɑːns/",
    "level": "C1",
    "category": "Nuances infinies",
    "frenchDef": "Nuance poétique donnant toute sa couleur au sentiment.",
    "englishDef": "A subtle distinction or shade of meaning, expression, or color.",
    "etymology": "Du français 'nue' (nuée de ciel aux teintes changeantes).",
    "pressExcerpt": "The Shakespearean actor delivered Hamlet's soliloquy with heartbreaking nuance of tone.",
    "pressSource": "The Stage",
    "collocations": [
      "poetic nuance",
      "expressive nuance",
      "infinite nuance"
    ],
    "nuanceComparisons": [
      {
        "word": "Nuance",
        "distinction": "Teinte fine et demi-ton."
      },
      {
        "word": "Platitude",
        "distinction": "Platitude uniforme sans relief."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-27-iconography",
    "term": "Iconography",
    "phonetic": "/ˌaɪ.kəˈnɒɡ.rə.fi/",
    "level": "C1",
    "category": "Déchiffrage des symboles",
    "frenchDef": "Iconographie dévoilant l'allégorie cachée sous le vernis de la toile.",
    "englishDef": "The visual images, symbols, or modes of representation in the arts.",
    "etymology": "Du grec 'eikōn' et 'graphein'.",
    "pressExcerpt": "Deciphering Dürer's Melencolia I requires understanding alchemical and planetary iconography.",
    "pressSource": "Art History",
    "collocations": [
      "renaissance iconography",
      "study iconography",
      "symbolic iconography"
    ],
    "nuanceComparisons": [
      {
        "word": "Iconography",
        "distinction": "Science des symboles sacrés et allégoriques."
      },
      {
        "word": "Doodle",
        "distinction": "Gribouillis distrait sans signification."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-28-oeuvre",
    "term": "Oeuvre",
    "phonetic": "/ˈɜː.vrə/",
    "level": "C1",
    "category": "Monument créateur",
    "frenchDef": "Œuvre magistrale couronnant cinquante ans de création.",
    "englishDef": "The complete works of an artist, author, or composer.",
    "etymology": "Du latin 'opus' (grand labeur créateur de beauté).",
    "pressExcerpt": "The Bodleian Library exhibited the illuminated manuscripts comprising William Blake's visionary oeuvre.",
    "pressSource": "Bodleian Treasures",
    "collocations": [
      "visionary oeuvre",
      "complete oeuvre",
      "immortal oeuvre"
    ],
    "nuanceComparisons": [
      {
        "word": "Oeuvre",
        "distinction": "Corpus complet d'un maître."
      },
      {
        "word": "Fragment",
        "distinction": "Morceau inachevé isolé."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "loisirs_creativite",
    "themeLabel": "Loisirs & Créativité"
  },
  {
    "id": "card-terminale-29-indomitable",
    "term": "Indomitable",
    "phonetic": "/ɪnˈdɒm.ɪ.tə.bəl/",
    "level": "C1",
    "category": "Courage invincible",
    "frenchDef": "Indomptable, impossible à vaincre ou abattre.",
    "englishDef": "Impossible to subdue or defeat.",
    "etymology": "Du latin 'indomitabilis' (qu'aucun joug ne peut soumettre).",
    "pressExcerpt": "Ernest Shackleton's indomitable resolve saved his Antarctic crew from frozen doom.",
    "pressSource": "Polar Record",
    "collocations": [
      "indomitable spirit",
      "indomitable will",
      "indomitable courage"
    ],
    "nuanceComparisons": [
      {
        "word": "Indomitable",
        "distinction": "Qu'aucune force ne saurait plier."
      },
      {
        "word": "Submissive",
        "distinction": "Soumis et prompt à capituler."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-30-relentless",
    "term": "Relentless",
    "phonetic": "/rɪˈlɛnt.ləs/",
    "level": "C1",
    "category": "Pression continue",
    "frenchDef": "Inlassable, refusant tout répit à l'adversaire.",
    "englishDef": "Oppressively constant; incessant; unyielding in pursuit of a goal.",
    "etymology": "Du moyen anglais 'relent' (adoucir sa vigueur) avec suffixe privatif '-less'.",
    "pressExcerpt": "The champion sustained a relentless rowing cadence through the final five hundred meters.",
    "pressSource": "Rowing Gazette",
    "collocations": [
      "relentless pace",
      "relentless effort",
      "relentless drive"
    ],
    "nuanceComparisons": [
      {
        "word": "Relentless",
        "distinction": "Qui ne faiblit jamais jusqu'à la ligne."
      },
      {
        "word": "Hesitant",
        "distinction": "Qui ralentit au premier essoufflement."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-31-athletic-pinnacle",
    "term": "Athletic pinnacle",
    "phonetic": "/æθˈlɛt.ɪk ˈpɪn.ə.kəl/",
    "level": "C1",
    "category": "Sommet olympique",
    "frenchDef": "Zénith de la gloire et sommet olympique de la forme.",
    "englishDef": "The highest, most successful point of physical prowess.",
    "etymology": "Du latin 'pinnaculum' (faîte le plus haut d'un temple).",
    "pressExcerpt": "Winning triple Olympic gold crowned her career at the absolute athletic pinnacle.",
    "pressSource": "Olympic Review",
    "collocations": [
      "reach the athletic pinnacle",
      "at the athletic pinnacle",
      "aspire to the pinnacle"
    ],
    "nuanceComparisons": [
      {
        "word": "Athletic pinnacle",
        "distinction": "Le plus haut zénith de la forme physique."
      },
      {
        "word": "Decline",
        "distinction": "Déclin progressif avec l'âge."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-32-fortitude",
    "term": "Fortitude",
    "phonetic": "/ˈfɔː.tɪ.tjuːd/",
    "level": "C1",
    "category": "Vaillance stoïque",
    "frenchDef": "Force d'âme stoïque dominant l'épuisement des muscles.",
    "englishDef": "Courage in bearing pain or adversity with noble endurance.",
    "etymology": "Du latin 'fortitudo' (courage stoïque du guerrier).",
    "pressExcerpt": "Sailing solo across stormy southern oceans tests physical resilience and moral fortitude.",
    "pressSource": "Yachting World",
    "collocations": [
      "moral fortitude",
      "unshakable fortitude",
      "show fortitude"
    ],
    "nuanceComparisons": [
      {
        "word": "Fortitude",
        "distinction": "Vaillance calme au cœur de la souffrance."
      },
      {
        "word": "Despair",
        "distinction": "Effondrement désespéré."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-33-transcendence",
    "term": "Transcendence",
    "phonetic": "/trænˈsɛn.dəns/",
    "level": "C1",
    "category": "Dépassement absolu",
    "frenchDef": "Transcendance franchissant les limites réputées infranchissables du corps humain.",
    "englishDef": "Existence or experience beyond the normal or physical level.",
    "etymology": "Du latin 'transcendere' (franchir en s'élevant au-dessus de tout).",
    "pressExcerpt": "Roger Bannister's four-minute mile was celebrated as a milestone of human athletic transcendence.",
    "pressSource": "Athletics Weekly",
    "collocations": [
      "athletic transcendence",
      "moment of transcendence",
      "spiritual transcendence"
    ],
    "nuanceComparisons": [
      {
        "word": "Transcendence",
        "distinction": "Dépassement des bornes ordinaires du possible."
      },
      {
        "word": "Mediocrity",
        "distinction": "Confinement médiocre dans l'ordinaire."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-34-supremacy",
    "term": "Supremacy",
    "phonetic": "/suːˈprɛm.ə.si/",
    "level": "C1",
    "category": "Gloire sans rivale",
    "frenchDef": "Suprématie absolue régnant sur la discipline.",
    "englishDef": "The state or condition of being superior to all others in power or status.",
    "etymology": "Du latin 'supremus'.",
    "pressExcerpt": "The Oxford eight asserted undeniable rowing supremacy on the championship course.",
    "pressSource": "BBC Sport",
    "collocations": [
      "rowing supremacy",
      "undeniable supremacy",
      "championship supremacy"
    ],
    "nuanceComparisons": [
      {
        "word": "Supremacy",
        "distinction": "Maîtrise souveraine incontestée."
      },
      {
        "word": "Subjection",
        "distinction": "Dépendance subordonnée."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-35-unyielding",
    "term": "Unyielding",
    "phonetic": "/ʌnˈjiːl.dɪŋ/",
    "level": "C1",
    "category": "Volonté de fer",
    "frenchDef": "Inflexible, qui ne cède pas d'un pouce face à la tempête.",
    "englishDef": "Not giving way to pressure; hard or solid; resolute.",
    "etymology": "Composé de 'un-' et 'yield' (céder du terrain).",
    "pressExcerpt": "Her unyielding defense held the world champions scoreless throughout the final quarter.",
    "pressSource": "Sports Analysis",
    "collocations": [
      "unyielding resolve",
      "unyielding defense",
      "unyielding spirit"
    ],
    "nuanceComparisons": [
      {
        "word": "Unyielding",
        "distinction": "Qui résiste sans fléchir."
      },
      {
        "word": "Pliant",
        "distinction": "Souple et cédant au premier choc."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "sport",
    "themeLabel": "Sport & Dépassement"
  },
  {
    "id": "card-terminale-36-polyphonic",
    "term": "Polyphonic",
    "phonetic": "/ˌpɒl.iˈfɒn.ɪk/",
    "level": "C1",
    "category": "Entrelacs des voix",
    "frenchDef": "Polyphonique, unissant des mélodies souverainement indépendantes en une splendeur commune.",
    "englishDef": "Producing many sounds simultaneously; having many voice parts, each with an independent melody.",
    "etymology": "Du grec 'polus' (nombreux) et 'phōnē' (voix chantée).",
    "pressExcerpt": "Thomas Tallis's Spem in Alium weaves forty distinct vocal parts into an awe-inspiring polyphonic tapestry.",
    "pressSource": "Choral Heritage",
    "collocations": [
      "polyphonic masterpiece",
      "polyphonic texture",
      "polyphonic motet"
    ],
    "nuanceComparisons": [
      {
        "word": "Polyphonic",
        "distinction": "Tissage harmonieux de multiples voix autonomes."
      },
      {
        "word": "Monophonic",
        "distinction": "Chant à une seule voix nue sans contrepoint."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-37-leitmotif",
    "term": "Leitmotif",
    "phonetic": "/ˈlaɪt.məʊˌtiːf/",
    "level": "C1",
    "category": "Thèmes conducteurs",
    "frenchDef": "Leitmotiv, motif musical récurrent incarnant un héros ou un destin.",
    "englishDef": "A recurrent theme throughout a musical or literary composition, associated with a particular person, idea, or situation.",
    "etymology": "De l’allemand 'leiten' (guider, mener) et 'Motiv' (motif musical).",
    "pressExcerpt": "Wagner assigned an evocative heroic horn leitmotif to Siegfried throughout the Ring cycle.",
    "pressSource": "Opera Quarterly",
    "collocations": [
      "heroic leitmotif",
      "recurring leitmotif",
      "musical leitmotif"
    ],
    "nuanceComparisons": [
      {
        "word": "Leitmotif",
        "distinction": "Phrase mélodique attachée à une figure symbolique."
      },
      {
        "word": "Ornament",
        "distinction": "Simple fioriture décorative passagère."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-38-incandescent",
    "term": "Incandescent",
    "phonetic": "/ˌɪn.kænˈdɛs.ənt/",
    "level": "C1",
    "category": "Éclat flamboyant",
    "frenchDef": "Incandescent, vibrant d'une ferveur poétique enflammée.",
    "englishDef": "Emitting light as a result of being heated; extremely brilliant and passionate.",
    "etymology": "Du latin 'incandescere' (s'enflammer d'un feu blanc éclatant).",
    "pressExcerpt": "The soprano's performance of Isolde's Liebestod was incandescent with passionate emotional truth.",
    "pressSource": "Gramophone",
    "collocations": [
      "incandescent beauty",
      "incandescent tone",
      "incandescent performance"
    ],
    "nuanceComparisons": [
      {
        "word": "Incandescent",
        "distinction": "Brillant d'une flamme blanche ardente."
      },
      {
        "word": "Lukewarm",
        "distinction": "Tiède et sans flamme intérieure."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-39-virtuosic",
    "term": "Virtuosic",
    "phonetic": "/ˌvɜː.tʃuˈɒs.ɪk/",
    "level": "C1",
    "category": "Doigté céleste",
    "frenchDef": "Virtuosique, mariant aisance surnaturelle et profondeur musicale.",
    "englishDef": "Displaying extraordinary technical skill and musicality.",
    "etymology": "Du latin 'virtus'.",
    "pressExcerpt": "Rachmaninoff executed the colossal chordal cascades of his Third Concerto with effortless virtuosic dignity.",
    "pressSource": "The Strad",
    "collocations": [
      "virtuosic brilliance",
      "virtuosic mastery",
      "virtuosic cadenza"
    ],
    "nuanceComparisons": [
      {
        "word": "Virtuosic",
        "distinction": "Maîtrise technique transcendée par l'âme."
      },
      {
        "word": "Clumsy",
        "distinction": "Maladroit et heurté."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-40-ethereal",
    "term": "Ethereal",
    "phonetic": "/iˈθɪə.ri.əl/",
    "level": "C1",
    "category": "Sublimité céleste",
    "frenchDef": "Éthéré, d'une pureté céleste semblant détachée de la terre.",
    "englishDef": "Extremely delicate and light in a way that seems not to be of this world.",
    "etymology": "Du grec 'aithēr' (l'éther pur des cieux supérieurs où respirent les dieux).",
    "pressExcerpt": "The boys' choir sang the Allegri Miserere with ethereal, silver-toned purity.",
    "pressSource": "Classic FM",
    "collocations": [
      "ethereal melody",
      "ethereal beauty",
      "ethereal voice"
    ],
    "nuanceComparisons": [
      {
        "word": "Ethereal",
        "distinction": "D'une légèreté céleste et pure."
      },
      {
        "word": "Earthbound",
        "distinction": "Lourdement ancré dans la glaise matérielle."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-41-resonance",
    "term": "Resonance",
    "phonetic": "/ˈrɛz.ən.əns/",
    "level": "C1",
    "category": "Écho de l'âme",
    "frenchDef": "Résonance poétique éveillant des échos intimes chez l'auditeur.",
    "englishDef": "The quality in a sound of being deep, full, and reverberating; emotional impact.",
    "etymology": "Du latin 'resonare'.",
    "pressExcerpt": "Her evocative cello sonatas carry deep historical and emotional resonance for exiled wanderers.",
    "pressSource": "Musical Times",
    "collocations": [
      "profound resonance",
      "emotional resonance",
      "lasting resonance"
    ],
    "nuanceComparisons": [
      {
        "word": "Resonance",
        "distinction": "Capacité à faire vibrer l'âme en profondeur."
      },
      {
        "word": "Futility",
        "distinction": "Bruit vain qui s'éteint sans laisser de trace."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-42-poetic",
    "term": "Poetic",
    "phonetic": "/pəʊˈɛt.ɪk/",
    "level": "C1",
    "category": "Orfèvrerie des vers",
    "frenchDef": "Poétique, ciselé avec la grâce des dieux et la vérité des vers.",
    "englishDef": "Relating to or used in poetry; having the imaginative and sensitive quality of poetry.",
    "etymology": "Du grec 'poiētikos' (capable de créer et d'enfanter des formes sublimes).",
    "pressExcerpt": "John Keats's Odes balance classical architectural restraint with radiant poetic sensuousness.",
    "pressSource": "Keats-Shelley Journal",
    "collocations": [
      "poetic genius",
      "poetic diction",
      "poetic cadence"
    ],
    "nuanceComparisons": [
      {
        "word": "Poetic",
        "distinction": "Touché par la grâce sacrée de la muse."
      },
      {
        "word": "Pedestrian",
        "distinction": "Plat, prosaïque et terre-à-terre."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "musique_culture",
    "themeLabel": "Musique & Culture"
  },
  {
    "id": "card-terminale-43-epicurean",
    "term": "Epicurean",
    "phonetic": "/ˌɛp.ɪ.kjʊˈriː.ən/",
    "level": "C1",
    "category": "Art de la mesure",
    "frenchDef": "Épicurien, savourant les délices choisis avec modération souveraine.",
    "englishDef": "Devoted to the pursuit of sensual pleasure, especially with discerning food and vintage nectar.",
    "etymology": "Du philosophe grec Épicure qui plaçait le plaisir dans la tempérance noble de l'esprit.",
    "pressExcerpt": "The tasting symposium was an epicurean triumph celebrating wild game, black truffles, and vintage wines.",
    "pressSource": "Gastronomy Quarterly",
    "collocations": [
      "epicurean banquet",
      "epicurean pleasure",
      "epicurean discernment"
    ],
    "nuanceComparisons": [
      {
        "word": "Epicurean",
        "distinction": "Recherche de délices choisis avec tempérance."
      },
      {
        "word": "Debauched",
        "distinction": "Débauché se vautrant dans l'excès grossier."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-44-ambrosial",
    "term": "Ambrosial",
    "phonetic": "/æmˈbrəʊ.zi.əl/",
    "level": "C1",
    "category": "Saveurs des dieux",
    "frenchDef": "Ambrosien, digne de l'ambroisie servie aux dieux de l'Olympe.",
    "englishDef": "Pertaining to ambrosia; exceptionally pleasing to taste or smell.",
    "etymology": "Du grec 'ambrosios' (qui confère l'immortalité aux dieux).",
    "pressExcerpt": "The lavender honey poured over fresh clotted cream was an ambrosial delight.",
    "pressSource": "Epicurean Review",
    "collocations": [
      "ambrosial delight",
      "ambrosial fragrance",
      "ambrosial feast"
    ],
    "nuanceComparisons": [
      {
        "word": "Ambrosial",
        "distinction": "D'une saveur digne des dieux immortels."
      },
      {
        "word": "Repulsive",
        "distinction": "Répugnant et dégoûtant."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-45-convivial",
    "term": "Convivial",
    "phonetic": "/kənˈvɪv.i.əl/",
    "level": "C1",
    "category": "Partage de fête",
    "frenchDef": "Convivial, baigné d'une chaleur fraternelle partagée.",
    "englishDef": "Friendly, lively, and enjoyable, especially of dining atmosphere.",
    "etymology": "Du latin 'convivium' (le festin où l'on communie ensemble).",
    "pressExcerpt": "Candlelight reflected on antique mahogany as convivial toasts flowed late into the winter night.",
    "pressSource": "The Country House",
    "collocations": [
      "convivial gathering",
      "convivial host",
      "convivial dinner"
    ],
    "nuanceComparisons": [
      {
        "word": "Convivial",
        "distinction": "Chaleureux, communicatif et joyeux."
      },
      {
        "word": "Morose",
        "distinction": "Morne, renfrogné et taciturne."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-46-nectar",
    "term": "Nectar",
    "phonetic": "/ˈnɛk.tər/",
    "level": "C1",
    "category": "Boisson des dieux",
    "frenchDef": "Nectar d'un raffinement suprême.",
    "englishDef": "A delicious drink, in mythology the beverage of the gods.",
    "etymology": "Du grec 'nektar' (boisson victorieuse de la mort réservée aux dieux).",
    "pressExcerpt": "A chilled glass of elderflower pressé proved to be sweet nectar on that scorching summer afternoon.",
    "pressSource": "Botanical Dining",
    "collocations": [
      "sweet nectar",
      "nectar of the gods",
      "pure nectar"
    ],
    "nuanceComparisons": [
      {
        "word": "Nectar",
        "distinction": "Boisson suprême et divine."
      },
      {
        "word": "Slill",
        "distinction": "Rinçure de vaisselle fade."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-47-hospitality",
    "term": "Hospitality",
    "phonetic": "/ˌhɒs.pɪˈtæl.ə.ti/",
    "level": "C1",
    "category": "Culte de l'hôte",
    "frenchDef": "Hospitalité sacrée honorant l'étranger comme un frère.",
    "englishDef": "The friendly and generous reception and entertainment of guests, visitors, or strangers.",
    "etymology": "Du latin 'hospitalitas' (loi sacrée de l'accueil d'Homère et Virgile).",
    "pressExcerpt": "Scottish highland hospitality welcomed stranded travelers with blazing fires, warm oatcakes, and pure single malt.",
    "pressSource": "Highland Lore",
    "collocations": [
      "traditional hospitality",
      "generous hospitality",
      "legendary hospitality"
    ],
    "nuanceComparisons": [
      {
        "word": "Hospitality",
        "distinction": "Générosité d'accueil sacrée envers l'étranger."
      },
      {
        "word": "Xenophobia",
        "distinction": "Hostilité craintive envers l'étranger."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-48-sumptuous",
    "term": "Sumptuous",
    "phonetic": "/ˈsʌmp.tʃu.əs/",
    "level": "C1",
    "category": "Fastes princiers",
    "frenchDef": "Somptueux, déployant un luxe de goûts et de décors sans pareil.",
    "englishDef": "Splendid and expensive-looking; luxurious.",
    "etymology": "Du latin 'sumptus' (dépense engagée pour la grandeur et le faste).",
    "pressExcerpt": "The ambassador hosted a sumptuous gala dinner with crystal candelabra and roasted pheasant.",
    "pressSource": "Diplomatic Courier",
    "collocations": [
      "sumptuous feast",
      "sumptuous banquet",
      "sumptuous dining"
    ],
    "nuanceComparisons": [
      {
        "word": "Sumptuous",
        "distinction": "Fastueux et splendide sans mesquinerie."
      },
      {
        "word": "Spartan",
        "distinction": "D'un dénuement austère et dépouillé."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-49-tasting",
    "term": "Tasting",
    "phonetic": "/ˈteɪ.stɪŋ/",
    "level": "C1",
    "category": "Sens critique",
    "frenchDef": "Dégustation comparée où chaque nuance est pesée.",
    "englishDef": "The sampling of food or drink to judge its quality.",
    "etymology": "Du moyen anglais 'tasten' (éprouver la substance par les sens).",
    "pressExcerpt": "The grand jury completed a blind tasting of twelve vintage English sparkling wines.",
    "pressSource": "Decanter",
    "collocations": [
      "blind tasting",
      "wine tasting",
      "comparative tasting"
    ],
    "nuanceComparisons": [
      {
        "word": "Tasting",
        "distinction": "Jugement méthodique et attentif des saveurs."
      },
      {
        "word": "Ingestion",
        "distinction": "Fait d'avaler mécaniquement pour se nourrir."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "restaurant_convivial",
    "themeLabel": "Restaurant & Convivialité"
  },
  {
    "id": "card-terminale-50-salutiferous",
    "term": "Salutiferous",
    "phonetic": "/ˌsæl.jʊˈtɪf.ər.əs/",
    "level": "C1",
    "category": "Salubrité suprême",
    "frenchDef": "Salutifère, qui engendre et fortifie la santé.",
    "englishDef": "Health-giving; wholesome; conducive to sound physical vigor.",
    "etymology": "Du latin 'salus' (salut) et 'ferre' (porter, engendrer les dons de la vie).",
    "pressExcerpt": "Mountain spring water and ozone-rich alpine pine breezes exert a salutiferous influence on the lungs.",
    "pressSource": "Alpine Sanatorium Gazette",
    "collocations": [
      "salutiferous climate",
      "salutiferous effects",
      "salutiferous waters"
    ],
    "nuanceComparisons": [
      {
        "word": "Salutiferous",
        "distinction": "Qui apporte et préserve la santé."
      },
      {
        "word": "Pestilential",
        "distinction": "Porteur de miasmes mortifères."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-51-vitality",
    "term": "Vitality",
    "phonetic": "/vaɪˈtæl.ə.ti/",
    "level": "C1",
    "category": "Sève de vie",
    "frenchDef": "Vitalité indestructible rayonnant de force intérieure.",
    "englishDef": "The power giving continuance of life, present in all living things.",
    "etymology": "Du latin 'vita'.",
    "pressExcerpt": "Her youthful vitality remained undimmed by decades of rigorous scholarly labor.",
    "pressSource": "Biographical Studies",
    "collocations": [
      "boundless vitality",
      "radiate vitality",
      "renewed vitality"
    ],
    "nuanceComparisons": [
      {
        "word": "Vitality",
        "distinction": "Sève vivifiante et rayonnante."
      },
      {
        "word": "Decay",
        "distinction": "Décrépitude et flétrissure progressive."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-52-panacea",
    "term": "Panacea",
    "phonetic": "/ˌpæn.əˈsiː.ə/",
    "level": "C1",
    "category": "Remède universel",
    "frenchDef": "Panacée, remède réputé guérir tous les maux de l'âme et du corps.",
    "englishDef": "A solution or remedy for all difficulties or diseases.",
    "etymology": "Du grec 'Panakeia' (fille d'Asclépios qui guérit tout par les plantes).",
    "pressExcerpt": "Pure sleep and daily movement in nature are perhaps the closest thing to a natural panacea.",
    "pressSource": "Medical Philosophy",
    "collocations": [
      "universal panacea",
      "no panacea",
      "seek a panacea"
    ],
    "nuanceComparisons": [
      {
        "word": "Panacea",
        "distinction": "Remède universel providentiel."
      },
      {
        "word": "Placebo",
        "distinction": "Substance inactive agissant par la seule suggestion."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-53-restorative",
    "term": "Restorative",
    "phonetic": "/rɪˈstɔː.rə.tɪv/",
    "level": "C1",
    "category": "Reconstruction",
    "frenchDef": "Restaurateur des forces vitales épuisées.",
    "englishDef": "Having the ability to restore health, strength, or well-being.",
    "etymology": "Du latin 'restaurare'.",
    "pressExcerpt": "A weekend of silence and forest walking proved deeply restorative for the overtaxed brain.",
    "pressSource": "Mind & Body Journal",
    "collocations": [
      "restorative power",
      "restorative bath",
      "restorative retreat"
    ],
    "nuanceComparisons": [
      {
        "word": "Restorative",
        "distinction": "Qui rend les forces et répare les outrages du temps."
      },
      {
        "word": "Corrosive",
        "distinction": "Qui ronge et détruit les tissus."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-54-longevity",
    "term": "Longevity",
    "phonetic": "/lɒnˈdʒɛv.ə.ti/",
    "level": "C1",
    "category": "Siècles de vie",
    "frenchDef": "Longévité lucide jusqu'à un grand âge.",
    "englishDef": "Long existence or service; durable vitality across a long life.",
    "etymology": "Du latin 'longaevus'.",
    "pressExcerpt": "Centenarians attribute their exceptional longevity to fresh olive oil, walking, and enduring friendships.",
    "pressSource": "World Health Bulletin",
    "collocations": [
      "exceptional longevity",
      "secret of longevity",
      "promote longevity"
    ],
    "nuanceComparisons": [
      {
        "word": "Longevity",
        "distinction": "Longue existence saine et accomplie."
      },
      {
        "word": "Premature death",
        "distinction": "Disparition fauchée avant terme."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-55-convalescence",
    "term": "Convalescence",
    "phonetic": "/ˌkɒn.vəˈlɛs.əns/",
    "level": "C1",
    "category": "Renaissance du corps",
    "frenchDef": "Convalescence où le corps retrouve sa vigueur pas à pas.",
    "englishDef": "Time spent recovering from an illness or medical treatment; recuperation.",
    "etymology": "Du latin 'convalescere' (reprendre force et vigueur pleine).",
    "pressExcerpt": "Sea air in Devon provided the perfect peaceful setting for her gentle convalescence.",
    "pressSource": "Medical Gazette",
    "collocations": [
      "period of convalescence",
      "speedy convalescence",
      "peaceful convalescence"
    ],
    "nuanceComparisons": [
      {
        "word": "Convalescence",
        "distinction": "Période de retour progressif vers la pleine santé."
      },
      {
        "word": "Affliction",
        "distinction": "État de souffrance et de maladie active."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-56-wholesome",
    "term": "Wholesome",
    "phonetic": "/ˈhəʊl.səm/",
    "level": "C1",
    "category": "Pureté nourricière",
    "frenchDef": "Parfaitement sain, nourrissant et moralement fortifiant.",
    "englishDef": "Conducive to or suggestive of good health and physical well-being.",
    "etymology": "Du vieil anglais 'hāl' (sain, saint, intact).",
    "pressExcerpt": "Traditional stone-ground wholemeal bread offers wholesome nourishment superior to refined flours.",
    "pressSource": "Artisan Milling",
    "collocations": [
      "wholesome nutrition",
      "wholesome habits",
      "wholesome living"
    ],
    "nuanceComparisons": [
      {
        "word": "Wholesome",
        "distinction": "Sain, intact et porteur de vie."
      },
      {
        "word": "Corrupted",
        "distinction": "Altéré et avarié."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "alimentation_sante",
    "themeLabel": "Alimentation & Santé"
  },
  {
    "id": "card-terminale-57-stewardship",
    "term": "Stewardship",
    "phonetic": "/ˈstjuː.əd.ʃɪp/",
    "level": "C1",
    "category": "Gérance responsable",
    "frenchDef": "Intendance sage veillant sur les biens communs pour la postérité.",
    "englishDef": "The job of supervising or taking care of something, such as an organization or natural resources.",
    "etymology": "Du vieil anglais 'stīweard' (gardien fidèle du domaine seigneurial).",
    "pressExcerpt": "University chancellors exercise faithful stewardship over centuries-old endowments and libraries.",
    "pressSource": "Higher Education Quarterly",
    "collocations": [
      "faithful stewardship",
      "environmental stewardship",
      "wise stewardship"
    ],
    "nuanceComparisons": [
      {
        "word": "Stewardship",
        "distinction": "Gérance vigilante et désintéressée pour l'avenir."
      },
      {
        "word": "Plunder",
        "distinction": "Pillage prédateur dilapidant les réserves."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-58-acuity",
    "term": "Acuity",
    "phonetic": "/əˈkjuː.ə.ti/",
    "level": "C1",
    "category": "Finesse d'analyse",
    "frenchDef": "Acuité intellectuelle perçant les subtilités d'un dossier.",
    "englishDef": "Sharpness or keenness of thought, vision, or hearing.",
    "etymology": "Du latin 'acutus' (aiguisé, tranchant comme un scalpel).",
    "pressExcerpt": "The barrister's formidable forensic acuity disproved the forged contracts within minutes.",
    "pressSource": "Law Society Review",
    "collocations": [
      "intellectual acuity",
      "forensic acuity",
      "mental acuity"
    ],
    "nuanceComparisons": [
      {
        "word": "Acuity",
        "distinction": "Finesse aiguë de pénétration d'esprit."
      },
      {
        "word": "Dullness",
        "distinction": "Esprit obtus et incapable d'analyse."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-59-jurisprudence",
    "term": "Jurisprudence",
    "phonetic": "/ˌdʒʊə.rɪsˈpruː.dəns/",
    "level": "C1",
    "category": "Science du droit",
    "frenchDef": "Jurisprudence, philosophie et science suprême du droit.",
    "englishDef": "The theory or philosophy of law; a legal system.",
    "etymology": "Du latin 'juris prudentia' (la sagesse prudente appliquée à la justice des hommes).",
    "pressExcerpt": "High Court decisions contribute to the living jurisprudence of English common law.",
    "pressSource": "Oxford Journal of Legal Studies",
    "collocations": [
      "constitutional jurisprudence",
      "treatise on jurisprudence",
      "classical jurisprudence"
    ],
    "nuanceComparisons": [
      {
        "word": "Jurisprudence",
        "distinction": "Science philosophique et pratique du droit."
      },
      {
        "word": "Lawlessness",
        "distinction": "Non-droit et anarchie sans règles."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-60-meritocracy",
    "term": "Meritocracy",
    "phonetic": "/ˌmɛr.ɪˈtɒk.rə.si/",
    "level": "C1",
    "category": "Règne du talent",
    "frenchDef": "Méritocratie récompensant le talent et le travail sans privilège de naissance.",
    "englishDef": "Government or the holding of power by people selected on the basis of their ability.",
    "etymology": "Du latin 'meritum' (valeur intrinsèque prouvée) et grec 'kratos' (pouvoir).",
    "pressExcerpt": "Admission to fellowship exams was designed as a pure meritocracy regardless of aristocratic rank.",
    "pressSource": "History of Education",
    "collocations": [
      "true meritocracy",
      "academic meritocracy",
      "ideal of meritocracy"
    ],
    "nuanceComparisons": [
      {
        "word": "Meritocracy",
        "distinction": "Élévation fondée sur le seul talent personnel."
      },
      {
        "word": "Plutocracy",
        "distinction": "Gouvernement par l'argent et les fortunes."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-61-perquisite",
    "term": "Perquisite",
    "phonetic": "/ˈpɜː.kwɪ.zɪt/",
    "level": "C1",
    "category": "Avantages de fonction",
    "frenchDef": "Privilège d'honneur ou émolument lié à une haute charge.",
    "englishDef": "A benefit which one enjoys or is entitled to on account of one's job or position; perk.",
    "etymology": "Du latin 'perquirere' (ce qui est acquis en surplus de son dû).",
    "pressExcerpt": "Living in the historic college lodgings overlooking the quadrangle was an esteemed perquisite of the professorship.",
    "pressSource": "Academic Life",
    "collocations": [
      "esteemed perquisite",
      "customary perquisite",
      "official perquisite"
    ],
    "nuanceComparisons": [
      {
        "word": "Perquisite",
        "distinction": "Privilège légitime attaché à une haute fonction."
      },
      {
        "word": "Embezzlement",
        "distinction": "Détournement frauduleux de deniers."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-62-prerogative",
    "term": "Prerogative",
    "phonetic": "/prɪˈrɒɡ.ə.tɪv/",
    "level": "C1",
    "category": "Privilège régalien",
    "frenchDef": "Prérogative souveraine attachée à une charge.",
    "englishDef": "A right or privilege exclusive to a particular individual or class.",
    "etymology": "Du latin 'praerogativa' (la tribu appelée à voter en premier à Rome).",
    "pressExcerpt": "The prime minister exercised royal prerogative in dissolving parliament before the election.",
    "pressSource": "Constitutional Review",
    "collocations": [
      "royal prerogative",
      "exclusive prerogative",
      "exercise a prerogative"
    ],
    "nuanceComparisons": [
      {
        "word": "Prerogative",
        "distinction": "Droit régalien d'exception."
      },
      {
        "word": "Duty",
        "distinction": "Devoir ordinaire imposé à tous."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-63-acumen",
    "term": "Acumen",
    "phonetic": "/ˈæk.jʊ.mən/",
    "level": "C1",
    "category": "Flair stratégique",
    "frenchDef": "Flair magistral et pénétration stratégique.",
    "englishDef": "The ability to make good judgments and quick decisions.",
    "etymology": "Du latin 'acumen' (la pointe fine de la flèche).",
    "pressExcerpt": "Her geopolitical acumen foresaw sovereign debt fluctuations well before financial markets reacted.",
    "pressSource": "Financial Times",
    "collocations": [
      "geopolitical acumen",
      "commercial acumen",
      "strategic acumen"
    ],
    "nuanceComparisons": [
      {
        "word": "Acumen",
        "distinction": "Pénétration d'esprit prévoyante."
      },
      {
        "word": "Blindness",
        "distinction": "Cécité aveugle devant les périls."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "monde_travail_metiers",
    "themeLabel": "Monde du travail & Métiers"
  },
  {
    "id": "card-terminale-64-magnanimity",
    "term": "Magnanimity",
    "phonetic": "/ˌmæɡ.nəˈnɪm.ə.ti/",
    "level": "C1",
    "category": "Grandeur d'âme",
    "frenchDef": "Magnanimité, grandeur d'âme souveraine pardonnant aux vaincus.",
    "englishDef": "The fact or condition of being magnanimous; generosity and greatness of heart.",
    "etymology": "Du latin 'magnus' (grand) et 'animus' (l'âme : la grandeur d'âme d'Aristote).",
    "pressExcerpt": "The treaty was drafted with rare magnanimity, healing decades of bitter border enmity.",
    "pressSource": "Diplomatic Studies",
    "collocations": [
      "act of magnanimity",
      "royal magnanimity",
      "show magnanimity"
    ],
    "nuanceComparisons": [
      {
        "word": "Magnanimity",
        "distinction": "Noblesse de cœur pardonnant avec hauteur."
      },
      {
        "word": "Vindictiveness",
        "distinction": "Rancune haineuse et vindicative."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-65-altruism",
    "term": "Altruism",
    "phonetic": "/ˈæl.tru.ɪ.zəm/",
    "level": "C1",
    "category": "Don désintéressé",
    "frenchDef": "Altruisme dévoué au bien de la communauté humaine.",
    "englishDef": "The belief in or practice of disinterested and selfless concern for the well-being of others.",
    "etymology": "De l’italien 'altrui' (d'autrui, forgé par Auguste Comte).",
    "pressExcerpt": "The philosopher argued that genuine altruism constitutes the apex of civilized moral evolution.",
    "pressSource": "Ethics Journal",
    "collocations": [
      "pure altruism",
      "heroic altruism",
      "act of altruism"
    ],
    "nuanceComparisons": [
      {
        "word": "Altruism",
        "distinction": "Dévouement total au bonheur d'autrui."
      },
      {
        "word": "Solipsism",
        "distinction": "Repli égoïste sur sa seule individualité."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-66-geopolitical",
    "term": "Geopolitical",
    "phonetic": "/ˌdʒiː.əʊ.pəˈlɪt.ɪ.kəl/",
    "level": "C1",
    "category": "Équilibres du monde",
    "frenchDef": "Géopolitique, tenant aux frontières et destins des puissances.",
    "englishDef": "Relating to politics, especially international relations, as influenced by geographical factors.",
    "etymology": "Du grec 'gē' et 'politika'.",
    "pressExcerpt": "Maritime straits remain sensitive geopolitical chokepoints in global energy commerce.",
    "pressSource": "Foreign Policy",
    "collocations": [
      "geopolitical balance",
      "geopolitical tension",
      "geopolitical strategy"
    ],
    "nuanceComparisons": [
      {
        "word": "Geopolitical",
        "distinction": "Relatif à l'échiquier politique mondial."
      },
      {
        "word": "Provincial",
        "distinction": "Étroitement borné aux affaires de son canton."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-67-philhellenic",
    "term": "Philhellenic",
    "phonetic": "/ˌfɪl.hɛˈlɛn.ɪk/",
    "level": "C1",
    "category": "Amour des Muses",
    "frenchDef": "Philhellène, passionné par la Grèce antique, ses lois et sa poésie.",
    "englishDef": "Having a love of Greece and Grecian culture.",
    "etymology": "Du grec 'philos' (qui aime) et 'Hellēn' (le peuple grec).",
    "pressExcerpt": "Lord Byron's philhellenic devotion led him to champion Greek freedom in the 1820s.",
    "pressSource": "Romantic Review",
    "collocations": [
      "philhellenic passion",
      "philhellenic movement",
      "philhellenic poetry"
    ],
    "nuanceComparisons": [
      {
        "word": "Philhellenic",
        "distinction": "Amoureux de la civilisation et de la poésie grecques."
      },
      {
        "word": "Philistine",
        "distinction": "Béotien insensible à la haute culture."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-68-amity",
    "term": "Amity",
    "phonetic": "/ˈæm.ə.ti/",
    "level": "C1",
    "category": "Concorde des peuples",
    "frenchDef": "Amity, concorde loyale et paix perpétuelle entre nations.",
    "englishDef": "A friendly relationship, especially between nations.",
    "etymology": "Du latin 'amicitia' (l'amitié de vertu consacrée par Cicéron).",
    "pressExcerpt": "The treaty established perpetual amity, commercial free transit, and intellectual scholarly exchange.",
    "pressSource": "International Treaties",
    "collocations": [
      "bonds of amity",
      "perpetual amity",
      "peace and amity"
    ],
    "nuanceComparisons": [
      {
        "word": "Amity",
        "distinction": "Concorde pacifique d'honneur entre nations."
      },
      {
        "word": "Hostility",
        "distinction": "Haine et hostilité déclarée."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-69-aestheticism",
    "term": "Aestheticism",
    "phonetic": "/iːsˈθɛt.ɪ.sɪ.zəm/",
    "level": "C1",
    "category": "Temple du Beau",
    "frenchDef": "Esthétisme élevant la beauté stylistique au rang de suprême souveraine.",
    "englishDef": "The devotion to aesthetic principles and pursuit of beauty above utilitarian utility.",
    "etymology": "Du grec 'aisthēsis'.",
    "pressExcerpt": "Walter Pater wrote that the high purpose of aestheticism is to burn always with a hard, gem-like flame.",
    "pressSource": "Studies in the History of the Renaissance",
    "collocations": [
      "gem-like aestheticism",
      "renaissance aestheticism",
      "worship of aestheticism"
    ],
    "nuanceComparisons": [
      {
        "word": "Aestheticism",
        "distinction": "Culte sacré de la beauté pure."
      },
      {
        "word": "Commercialism",
        "distinction": "Marchandisation vulgaire et marchande."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  },
  {
    "id": "card-terminale-70-fellowship",
    "term": "Fellowship",
    "phonetic": "/ˈfɛl.əʊ.ʃɪp/",
    "level": "C1",
    "category": "Communion des esprits",
    "frenchDef": "Fellowship, noble confrérie d'esprit consacrée à la vérité et aux arts.",
    "englishDef": "An association of people who share common beliefs, study, or activities; an academic body.",
    "etymology": "Du vieil anglais 'feolag' (partage solidaire de la route et du pain).",
    "pressExcerpt": "Election to a fellowship of the Royal Society is the highest scientific distinction in Britain.",
    "pressSource": "Royal Society Gazette",
    "collocations": [
      "academic fellowship",
      "lifelong fellowship",
      "honorary fellowship"
    ],
    "nuanceComparisons": [
      {
        "word": "Fellowship",
        "distinction": "Compagnonnage spirituel et académique."
      },
      {
        "word": "Isolation",
        "distinction": "Solitude et exclusion du savoir."
      }
    ],
    "gradeLevel": "terminale",
    "gradeLabel": "Terminale (Lycée)",
    "theme": "geographie_politique_art",
    "themeLabel": "Géographie, Société & Arts"
  }
];
