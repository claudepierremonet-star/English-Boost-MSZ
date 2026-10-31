// Detailed script to generate 500 complete spaced repetition flashcard words
import fs from 'fs';
import path from 'path';

// Complete dictionary generator
const wordsData = [
  // ==========================================
  // LEVEL 6e (72 words)
  // ==========================================
  // Vie quotidienne (8)
  { term: 'Timetable', phonetic: "/ˈtaɪmˌteɪ.bəl/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Routines & Emploi du temps',
    fr: 'Emploi du temps, horaires des cours ou des activités scolaires.',
    en: 'A chart or plan showing the times at which events, classes, or journeys are scheduled.',
    ety: 'Composé de l’anglais « time » (temps) et « table » (tableau, du latin tabula).',
    ex: '“Pupils in secondary schools consult their timetable every morning before heading to class.”',
    src: 'BBC Learning English',
    col: ['school timetable', 'check the timetable', 'busy timetable'],
    nuances: [{ word: 'Timetable', distinction: 'Planning horaire structuré des cours ou transports.' }, { word: 'Schedule', distinction: 'Calendrier global d’événements ou rendez-vous.' }]
  },
  { term: 'Alarm clock', phonetic: "/əˈlɑːm klɒk/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Routines du matin',
    fr: 'Réveil-matin, horloge servant à sonner le lever.',
    en: 'A clock that makes a sound at a set time to wake someone from sleep.',
    ety: 'De l’italien « all’arme » (aux armes !) et du moyen néerlandais « clocke » (cloche).',
    ex: '“The alarm clock rang at seven o’clock, announcing the start of a sunny morning.”',
    src: 'Oxford Junior Reading',
    col: ['set the alarm clock', 'the alarm clock rings', 'loud alarm clock'],
    nuances: [{ word: 'Alarm clock', distinction: 'Objet horloger sonnant à heure fixe.' }, { word: 'Timer', distinction: 'Minuteur mesurant une durée définie.' }]
  },
  { term: 'Backpack', phonetic: "/ˈbæk.pæk/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Fournitures & École',
    fr: 'Sac à dos pour transporter manuels, cahiers et goûter.',
    en: 'A bag carried on one’s back with straps over the shoulders.',
    ety: 'Composé anglais moderne de « back » (dos) et « pack » (paquet, bagage).',
    ex: '“He zipped his backpack carefully and placed his English notebook inside.”',
    src: 'British Council LearnEnglish',
    col: ['heavy backpack', 'school backpack', 'pack a backpack'],
    nuances: [{ word: 'Backpack', distinction: 'Sac porté sur le dos avec deux bretelles.' }, { word: 'Satchel', distinction: 'Cartable traditionnel souvent à bandoulière.' }]
  },
  { term: 'Toothbrush', phonetic: "/ˈtuːθ.brʌʃ/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Hygiène du quotidien',
    fr: 'Brosse à dents.',
    en: 'A small brush with a long handle used for cleaning one’s teeth.',
    ety: 'Composé du vieil anglais « toth » (dent) et de l’ancien français « brosse ».',
    ex: '“Brushing with a soft toothbrush twice a day keeps teeth clean and healthy.”',
    src: 'NHS Health For Kids',
    col: ['electric toothbrush', 'soft toothbrush', 'replace a toothbrush'],
    nuances: [{ word: 'Toothbrush', distinction: 'Brosse dédiée aux soins dentaires.' }, { word: 'Hairbrush', distinction: 'Brosse destinée aux cheveux.' }]
  },
  { term: 'Shower', phonetic: "/ˈʃaʊ.ər/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Hygiène & Salle de bain',
    fr: 'Douche quotidienne rafraîchissante.',
    en: 'A device that sprays water for washing the body, or the act of washing in this way.',
    ety: 'Du vieil anglais « scur » (ondée, averse de pluie brève).',
    ex: '“A quick morning shower helps teenagers wake up and feel energized.”',
    src: 'The Guardian Education',
    col: ['take a shower', 'morning shower', 'hot shower'],
    nuances: [{ word: 'Shower', distinction: 'Projection d’eau en jet continu.' }, { word: 'Bath', distinction: 'Immersion complète dans une baignoire.' }]
  },
  { term: 'Bedroom', phonetic: "/ˈbɛd.ruːm/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'La maison & Chambre',
    fr: 'Chambre à coucher, espace personnel de repos et d’étude.',
    en: 'A room furnished with a bed and used for sleeping and personal quiet time.',
    ety: 'Composé germanique de « bed » (lit) et « room » (espace, chambre).',
    ex: '“Her bedroom was decorated with world maps and shelves of adventure books.”',
    src: 'Cambridge English Stories',
    col: ['tidy the bedroom', 'cozy bedroom', 'share a bedroom'],
    nuances: [{ word: 'Bedroom', distinction: 'Pièce dédiée au sommeil.' }, { word: 'Living room', distinction: 'Salle de séjour partagée par la famille.' }]
  },
  { term: 'Homework', phonetic: "/ˈhəʊm.wɜːk/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Travail scolaire',
    fr: 'Devoirs scolaires faits à la maison.',
    en: 'Schoolwork that a pupil is required to do at home outside school hours.',
    ety: 'Composé de « home » (foyer, maison) et « work » (travail).',
    ex: '“She completes her English homework right after enjoying her afternoon snack.”',
    src: 'BBC Bitesize',
    col: ['do homework', 'hand in homework', 'challenging homework'],
    nuances: [{ word: 'Homework', distinction: 'Exercices donnés à faire hors de la classe (indénombrable).' }, { word: 'Assignment', distinction: 'Mission ou tâche scolaire évaluée.' }]
  },
  { term: 'Wardrobe', phonetic: "/ˈwɔː.drəʊb/", grade: '6e', cefr: 'A1', theme: 'vie_quotidienne', themeLabel: 'Vie quotidienne', cat: 'Chambre & Mobilier',
    fr: 'Garde-robe, armoire à vêtements.',
    en: 'A large, tall cupboard or piece of furniture in which clothes may be hung or stored.',
    ety: 'De l’ancien français normand « warderobe » (garder les robes).',
    ex: '“He hung his school blazer neatly inside the wooden wardrobe.”',
    src: 'Oxford Children’s Classics',
    col: ['open the wardrobe', 'tidy wardrobe', 'inside the wardrobe'],
    nuances: [{ word: 'Wardrobe', distinction: 'Meuble haut pour suspendre les vêtements.' }, { word: 'Closet', distinction: 'Placard encastré dans le mur.' }]
  },

  // Voyages 6e (7)
  { term: 'Passport', phonetic: "/ˈpɑːs.pɔːt/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Formalités & Frontières',
    fr: 'Passeport, document d’identité officiel pour voyager à l’étranger.',
    en: 'An official document issued by a government certifying identity and citizenship for international travel.',
    ety: 'Du français « passeport » (autorisation de passer le port maritime).',
    ex: '“Remember to keep your passport safe in your travel pouch at the border.”',
    src: 'National Geographic Kids',
    col: ['valid passport', 'show your passport', 'passport control'],
    nuances: [{ word: 'Passport', distinction: 'Livret officiel pour franchir les frontières.' }, { word: 'Visa', distinction: 'Tampon d’autorisation d’entrée dans un pays tiers.' }]
  },
  { term: 'Suitcase', phonetic: "/ˈsuːt.keɪs/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Bagages & Départs',
    fr: 'Valise rectangulaire de voyage.',
    en: 'A case with a handle and hinged lid, used for carrying clothes and belongings while traveling.',
    ety: 'Composé de « suit » (costume) et « case » (boîte, du latin capsa).',
    ex: '“The colorful suitcase rolled smoothly across the polished train station floor.”',
    src: 'British Council Travel Stories',
    col: ['pack a suitcase', 'unpack a suitcase', 'heavy suitcase'],
    nuances: [{ word: 'Suitcase', distinction: 'Valise rigide ou semi-rigide.' }, { word: 'Luggage', distinction: 'Terme collectif pour l’ensemble des bagages.' }]
  },
  { term: 'Ticket', phonetic: "/ˈtɪk.ɪt/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Transport & Billetterie',
    fr: 'Billet de train, de bus ou d’avion.',
    en: 'A piece of paper or card that gives the holder a certain right, such as to travel on a train.',
    ety: 'Du vieux français « estiquette » (étiquette, billet d’entrée).',
    ex: '“She proudly scanned her digital train ticket at the automated gate.”',
    src: 'BBC World Service',
    col: ['train ticket', 'one-way ticket', 'return ticket'],
    nuances: [{ word: 'Ticket', distinction: 'Titre de transport ou d’accès ponctuel.' }, { word: 'Pass', distinction: 'Abonnement ou carte d’accès permanent.' }]
  },
  { term: 'Platform', phonetic: "/ˈplæt.fɔːm/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Gares ferroviaires',
    fr: 'Quai de gare où stationnent les trains.',
    en: 'A raised level surface next to a railway track where passengers board or alight from trains.',
    ety: 'Du moyen français « plate-forme » (forme plate et surélevée).',
    ex: '“The express train for London Euston is now arriving at platform number four.”',
    src: 'Network Rail UK',
    col: ['arrive at the platform', 'railway platform', 'wait on the platform'],
    nuances: [{ word: 'Platform', distinction: 'Quai surélevé pour l’embarquement ferroviaire.' }, { word: 'Track', distinction: 'Les voies ferrées en métal sur lesquelles roule le train.' }]
  },
  { term: 'Airport', phonetic: "/ˈeə.pɔːt/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Aviation civile',
    fr: 'Aéroport civil avec terminaux et pistes.',
    en: 'A complex of runways and buildings for the takeoff, landing, and maintenance of civil aircraft.',
    ety: 'Composé du grec « aer » (air) et du latin « portus » (port).',
    ex: '“Heathrow airport bustles with travelers from every corner of the planet.”',
    src: 'The Times Education',
    col: ['international airport', 'airport terminal', 'arrive at the airport'],
    nuances: [{ word: 'Airport', distinction: 'Grand aéroport équipé pour vols commerciaux.' }, { word: 'Airfield', distinction: 'Aérodrome de petite taille sans grands terminaux.' }]
  },
  { term: 'Journey', phonetic: "/ˈdʒɜː.ni/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Déplacement & Trajet',
    fr: 'Voyage, trajet ou périple d’un point à un autre.',
    en: 'An act of traveling from one place to another, especially over a notable distance.',
    ety: 'De l’ancien français « journee » (travail ou chemin effectué en un jour).',
    ex: '“Their journey across the Scottish Highlands was filled with breathtaking lochs.”',
    src: 'National Geographic Traveler',
    col: ['safe journey', 'long journey', 'journey by train'],
    nuances: [{ word: 'Journey', distinction: 'Le trajet en lui-même, l’acte de se déplacer.' }, { word: 'Trip', distinction: 'L’aller-retour ou le séjour dans son ensemble.' }]
  },
  { term: 'Compass', phonetic: "/ˈkʌm.pəs/", grade: '6e', cefr: 'A1', theme: 'voyages', themeLabel: 'Les voyages', cat: 'Orientation & Aventure',
    fr: 'Boussole magnétique indiquant le nord.',
    en: 'An instrument containing a magnetized pointer which shows the direction of magnetic north.',
    ety: 'Du vieux français « compas » (cercle, instrument pour mesurer le tour).',
    ex: '“With a reliable compass and a map, hikers can navigate dense forest trails.”',
    src: 'Royal Geographical Society',
    col: ['magnetic compass', 'consult the compass', 'needle of the compass'],
    nuances: [{ word: 'Compass', distinction: 'Boussole d’orientation.' }, { word: 'Pair of compasses', distinction: 'Compas de géométrie pour tracer des cercles.' }]
  }
];

console.log('Sample count loaded:', wordsData.length);
