import type { ScenarioBlueprint } from './atelierDialoguesTypes';

/**
 * Thèmes 4, 5, 6 : Le Business, Rencontres en Voyage, La Gastronomie
 */

export const SCENARIOS_BUSINESS: ScenarioBlueprint[] = [
  {
    code: 'bu-client-negotiation',
    title: 'Client Proposal & Contract Negotiation',
    titleFr: 'Proposition commerciale et négociation de contrat',
    setting: 'Salle de conférence / Visioconférence internationale',
    learningGoal: 'Présenter une offre, négocier les délais et conclure un accord gagnant-gagnant.',
    roles: [
      { roleFr: 'Directeur(trice) Commercial(e)', gender: 'female', name: 'Eleanor' },
      { roleFr: 'Client(e) Partenaire', gender: 'male', name: 'Marcus' },
      { roleFr: 'Analyste Financier', gender: 'female', name: 'Aria' },
      { roleFr: 'Conseiller(ère) Juridique', gender: 'male', name: 'Arthur' }
    ],
    variants: [
      { focusTag: 'Remise Volume', focusDetailEn: 'tier-based pricing for annual licensing', focusDetailFr: 'la tarification par paliers pour la licence annuelle', keyTerm: 'win-win arrangement', keyIpa: '/wɪn wɪn əˈreɪndʒmənt/', keyFr: 'accord gagnant-gagnant' },
      { focusTag: 'Délais Livraison', focusDetailEn: 'our phased Q3 rollout schedule', focusDetailFr: 'notre calendrier de déploiement progressif au T3', keyTerm: 'phased rollout', keyIpa: '/feɪzd ˈrəʊlaʊt/', keyFr: 'déploiement par étapes' },
      { focusTag: 'Contrat Cadre', focusDetailEn: 'the service-level guarantees in the draft', focusDetailFr: 'les garanties de niveau de service dans le projet', keyTerm: 'bottom line', keyIpa: '/ˈbɒtəm laɪn/', keyFr: 'essentiel / résultat net' },
      { focusTag: 'Extension Partenariat', focusDetailEn: 'co-marketing across European markets', focusDetailFr: 'le co-marketing sur les marchés européens', keyTerm: 'on the same page', keyIpa: '/ɒn ðə seɪm peɪdʒ/', keyFr: 'sur la même longueur d’onde' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Thank you for reviewing our brief. Where do you stand on {DETAIL_EN}?',
        frPattern: 'Merci d’avoir examiné notre dossier. Quelle est votre position sur {DETAIL_FR} ?',
        keyPhrasePattern: 'Where do you stand on',
        keyIpa: '/weə duː juː stænd ɒn/',
        keyMeaningFr: 'Quelle est votre position concernant',
        tipFr: 'Formule diplomatique idéale pour sonder un partenaire en négociation.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'We see clear value in {DETAIL_EN}, provided we can lock in a flexible review clause after six months.',
        frPattern: 'Nous voyons un réel intérêt dans {DETAIL_FR}, à condition d’intégrer une clause de révision flexible après six mois.',
        keyPhrasePattern: 'lock in',
        keyIpa: '/lɒk ɪn/',
        keyMeaningFr: 'sécuriser / verrouiller un accord',
        tipFr: '« Lock in » est très usité en business pour « figer un tarif ou une clause ».'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'That is completely reasonable. Would a six-month checkpoint address your board’s concerns?',
        frPattern: 'C’est tout à fait raisonnable. Un point d’étape à six mois répondrait-il aux attentes de votre direction ?',
        keyPhrasePattern: 'address your concerns',
        keyIpa: '/əˈdres jɔː kənˈsɜːnz/',
        keyMeaningFr: 'répondre à vos préoccupations',
        tipFr: 'En affaires, « address » signifie « traiter / répondre à ».'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Yes, that puts everyone on the same page. Send over the updated term sheet and we will sign this week.',
        frPattern: 'Oui, cela met tout le monde d’accord. Envoyez la fiche de conditions mise à jour et nous signerons cette semaine.',
        keyPhrasePattern: 'term sheet',
        keyIpa: '/tɜːm ʃiːt/',
        keyMeaningFr: 'fiche des conditions principales',
        tipFr: 'Document synthétique résumant les clauses avant contrat définitif.'
      }
    ]
  },
  {
    code: 'bu-strategy-pitch',
    title: 'Quarterly Strategy Meeting & Investor Pitch',
    titleFr: 'Réunion stratégique trimestrielle & pitch investisseur',
    setting: 'Siège social / Salon d’affaires',
    learningGoal: 'Justifier des priorités, analyser des indicateurs clés et répondre aux objections.',
    roles: [
      { roleFr: 'Fondateur(trice)', gender: 'male', name: 'Oliver' },
      { roleFr: 'Investisseur(se)', gender: 'female', name: 'Serena' },
      { roleFr: 'Directeur(trice) Marketing', gender: 'female', name: 'Kate' },
      { roleFr: 'Directeur(trice) Produit', gender: 'male', name: 'Eric' }
    ],
    variants: [
      { focusTag: 'Croissance Client', focusDetailEn: 'cutting customer acquisition costs by eighteen percent', focusDetailFr: 'la réduction de 18 % du coût d’acquisition client', keyTerm: 'return on investment', keyIpa: '/rɪˈtɜːn ɒn ɪnˈvestmənt/', keyFr: 'retour sur investissement (ROI)' },
      { focusTag: 'Innovation Produit', focusDetailEn: 'our subscription retention upgrade', focusDetailFr: 'notre amélioration de rétention d’abonnement', keyTerm: 'scalable model', keyIpa: '/ˈskeɪləbəl ˈmɒdəl/', keyFr: 'modèle extensible à grande échelle' },
      { focusTag: 'Exportation', focusDetailEn: 'entering the North American logistics hub', focusDetailFr: 'l’entrée sur le pôle logistique nord-américain', keyTerm: 'market share', keyIpa: '/ˈmɑːkɪt ʃeə/', keyFr: 'part de marché' },
      { focusTag: 'Budget Annuel', focusDetailEn: 'reallocating capital toward high-margin services', focusDetailFr: 'la réallocation du capital vers les services à forte marge', keyTerm: 'high-margin', keyIpa: '/haɪ ˈmɑːdʒɪn/', keyFr: 'à forte marge' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Our key milestone this quarter focuses on {DETAIL_EN}. Do you have questions on the forecast?',
        frPattern: 'Notre objectif phare ce trimestre porte sur {DETAIL_FR}. Avez-vous des questions sur les prévisions ?',
        keyPhrasePattern: 'key milestone',
        keyIpa: '/kiː ˈmaɪlstəʊn/',
        keyMeaningFr: 'étape clé / jalon majeur',
        tipFr: '« Milestone » vient des bornes milliaires le long des routes romaines.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'The numbers look solid. What safeguards are in place while you execute {DETAIL_EN}?',
        frPattern: 'Les chiffres semblent solides. Quels garde-fous avez-vous prévus pendant que vous menez {DETAIL_FR} ?',
        keyPhrasePattern: 'in place',
        keyIpa: '/ɪn pleɪs/',
        keyMeaningFr: 'mis en place / opérationnel',
        tipFr: 'Très utilisé pour demander si un plan de sécurité existe.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'We track weekly cohorts and pause spending automatically if margins dip below target.',
        frPattern: 'Nous suivons des cohortes hebdomadaires et suspendons automatiquement les dépenses si la marge baisse.',
        keyPhrasePattern: 'dip below target',
        keyIpa: '/dɪp bɪˈləʊ ˈtɑːɡɪt/',
        keyMeaningFr: 'passer sous l’objectif fixé',
        tipFr: '« Dip » désigne une légère baisse temporaire.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Disciplined execution like that inspires confidence. Let us move forward to the next funding milestone.',
        frPattern: 'Une exécution aussi rigoureuse inspire confiance. Passons au prochain palier de financement.',
        keyPhrasePattern: 'move forward',
        keyIpa: '/muːv ˈfɔːwəd/',
        keyMeaningFr: 'aller de l’avant / avancer',
        tipFr: 'Formule de conclusion positive en comité.'
      }
    ]
  }
];

export const SCENARIOS_VOYAGE: ScenarioBlueprint[] = [
  {
    code: 'vo-airport-customs',
    title: 'At the Airport, Check-in & Customs Counter',
    titleFr: 'Rencontres à l’aéroport : enregistrement, douane & embarquement',
    setting: 'Aéroport international (Comptoir & Contrôle)',
    learningGoal: 'Répondre clairement aux agents d’aéroport, vérifier bagages et portes d’embarquement.',
    roles: [
      { roleFr: 'Voyageur(se)', gender: 'female', name: 'Camille' },
      { roleFr: 'Agent(e) d’accueil / Douane', gender: 'male', name: 'Officer Grant' },
      { roleFr: 'Compagnon de vol', gender: 'male', name: 'Léo' },
      { roleFr: 'Hôtesse / Steward', gender: 'female', name: 'Jenny' }
    ],
    variants: [
      { focusTag: 'Enregistrement Bagages', focusDetailEn: 'checking in one suitcase and requesting a window seat', focusDetailFr: 'l’enregistrement d’une valise et la demande d’un siège hublot', keyTerm: 'boarding pass', keyIpa: '/ˈbɔːdɪŋ pɑːs/', keyFr: 'carte d’embarquement' },
      { focusTag: 'Passage Douane', focusDetailEn: 'declaring gifts and stating my length of stay', focusDetailFr: 'la déclaration de cadeaux et l’indication de durée de séjour', keyTerm: 'purpose of your visit', keyIpa: '/ˈpɜːpəs əv jɔː ˈvɪzɪt/', keyFr: 'motif de votre visite' },
      { focusTag: 'Correspondance Rapide', focusDetailEn: 'catching a tight connecting flight at Terminal 3', focusDetailFr: 'attraper une correspondance serrée au Terminal 3', keyTerm: 'connecting flight', keyIpa: '/kəˈnektɪŋ flaɪt/', keyFr: 'vol en correspondance' },
      { focusTag: 'Bagage Retardé', focusDetailEn: 'filing a delayed luggage claim at baggage claim', focusDetailFr: 'le signalement d’un bagage retardé au tapis', keyTerm: 'baggage claim', keyIpa: '/ˈbæɡɪdʒ kleɪm/', keyFr: 'retrait des bagages' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Good morning! Could you help me with {DETAIL_EN}?',
        frPattern: 'Bonjour ! Pourriez-vous m’aider pour {DETAIL_FR} ?',
        keyPhrasePattern: 'Could you help me with',
        keyIpa: '/kʊd juː help miː wɪð/',
        keyMeaningFr: 'Pourriez-vous m’aider avec',
        tipFr: 'Toujours efficace dès l’arrivée au guichet.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Certainly! May I see your passport and booking reference before we arrange {DETAIL_EN}?',
        frPattern: 'Certainement ! Puis-je voir votre passeport et votre référence de réservation avant de régler {DETAIL_FR} ?',
        keyPhrasePattern: 'booking reference',
        keyIpa: '/ˈbʊkɪŋ ˈrefərəns/',
        keyMeaningFr: 'numéro de dossier de réservation',
        tipFr: 'Ayez toujours votre « booking reference » prête sur papier ou téléphone.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Here they are. Which gate do we depart from, and how early does boarding open?',
        frPattern: 'Les voici. De quelle porte partons-nous, et combien de temps avant ouvre l’embarquement ?',
        keyPhrasePattern: 'depart from',
        keyIpa: '/dɪˈpɑːt frɒm/',
        keyMeaningFr: 'partir de (porte / quai)',
        tipFr: 'On demande « Which gate do we depart from? » ou « leave from? ».'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'You depart from Gate B14; boarding opens forty minutes prior to takeoff. Have a pleasant journey!',
        frPattern: 'Vous partez de la porte B14 ; l’embarquement ouvre quarante minutes avant le décollage. Bon voyage !',
        keyPhrasePattern: 'prior to takeoff',
        keyIpa: '/ˈpraɪə tuː ˈteɪkɒf/',
        keyMeaningFr: 'avant le décollage',
        tipFr: '« Prior to » = avant (style soigné de l’aviation).'
      }
    ]
  },
  {
    code: 'vo-hotel-concierge',
    title: 'Checking In at the Hotel & Talking to the Concierge',
    titleFr: 'Arrivée à l’hôtel, réceptionniste & concierge',
    setting: 'Réception d’hôtel',
    learningGoal: 'Confirmer sa réservation, demander des recommandations locales et solliciter un service.',
    roles: [
      { roleFr: 'Réceptionniste', gender: 'female', name: 'Clara' },
      { roleFr: 'Client(e) voyageur', gender: 'male', name: 'Marc' },
      { roleFr: 'Concierge', gender: 'male', name: 'George' },
      { roleFr: 'Accompagnant(e)', gender: 'female', name: 'Inès' }
    ],
    variants: [
      { focusTag: 'Arrivée Hôtel', focusDetailEn: 'a quiet room away from street noise', focusDetailFr: 'une chambre calme éloignée du bruit de la rue', keyTerm: 'check-in time', keyIpa: '/tʃek ɪn taɪm/', keyFr: 'heure d’arrivée / remise des clés' },
      { focusTag: 'Départ Tardif', focusDetailEn: 'storing our luggage after morning checkout', focusDetailFr: 'laisser nos valises en consigne après le départ du matin', keyTerm: 'late checkout', keyIpa: '/leɪt ˈtʃekaʊt/', keyFr: 'départ tardif' },
      { focusTag: 'Conseil Visite', focusDetailEn: 'scenic walking routes and safe evening spots', focusDetailFr: 'des balades pittoresques et quartiers agréables le soir', keyTerm: 'within walking distance', keyIpa: '/wɪˈðɪn ˈwɔːkɪŋ ˈdɪstəns/', keyFr: 'accessible à pied' },
      { focusTag: 'Transfert Taxi', focusDetailEn: 'booking an early airport cab at dawn', focusDetailFr: 'la réservation d’un taxi matinal pour l’aéroport', keyTerm: 'flat rate', keyIpa: '/flæt reɪt/', keyFr: 'tarif forfaitaire fixe' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Welcome! Do you have a reservation under your name, and may I ask if you need {DETAIL_EN}?',
        frPattern: 'Bienvenue ! Avez-vous une réservation à votre nom, et puis-je vous demander si vous souhaitez {DETAIL_FR} ?',
        keyPhrasePattern: 'under your name',
        keyIpa: '/ˈʌndə jɔː neɪm/',
        keyMeaningFr: 'à votre nom (réservation)',
        tipFr: 'On réserve toujours « under my name ».'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Yes, booked under Marc Laurent for three nights. Having {DETAIL_EN} would be wonderful if possible.',
        frPattern: 'Oui, réservé au nom de Marc Laurent pour trois nuits. Avoir {DETAIL_FR} serait formidable si possible.',
        keyPhrasePattern: 'if possible',
        keyIpa: '/ɪf ˈpɒsəbəl/',
        keyMeaningFr: 'si possible (touche courtoise)',
        tipFr: 'Ajouter « if possible » rend toute requête beaucoup plus chaleureuse.'
      },
      {
        speakerSlot: 1,
        intent: 'precision',
        enPattern: 'Also, what time is breakfast served, and what is the Wi-Fi password for guests?',
        frPattern: 'Également, à quelle heure le petit-déjeuner est-il servi, et quel est le mot de passe Wi-Fi des clients ?',
        keyPhrasePattern: 'breakfast served',
        keyIpa: '/ˈbrekfəst sɜːvd/',
        keyMeaningFr: 'petit-déjeuner servi',
        tipFr: 'Question incontournable dès l’arrivée à l’hôtel.'
      },
      {
        speakerSlot: 0,
        intent: 'conclusion',
        enPattern: 'Breakfast runs from seven to ten on the terrace, and everything you need is written inside your key-card sleeve.',
        frPattern: 'Le petit-déjeuner est servi de sept heures à dix heures sur la terrasse, et tout est noté dans l’étui de votre carte.',
        keyPhrasePattern: 'key-card sleeve',
        keyIpa: '/kiː kɑːd sliːv/',
        keyMeaningFr: 'étui de la carte magnétique',
        tipFr: 'Les hôtels indiquent presque toujours le Wi-Fi sur le « sleeve ».'
      }
    ]
  },
  {
    code: 'vo-local-guide-train-taxi',
    title: 'Meeting Drivers, Guides, Locals & Fellow Travelers',
    titleFr: 'Échanger avec un chauffeur, un guide, un habitant ou un voyageur',
    setting: 'Gare / Taxi / Place publique / Office de tourisme',
    learningGoal: 'Demander son chemin, négocier ou vérifier un trajet et lier conversation en voyage.',
    roles: [
      { roleFr: 'Voyageur(se)', gender: 'female', name: 'Léa' },
      { roleFr: 'Habitant / Guide / Chauffeur', gender: 'male', name: 'Daniel' },
      { roleFr: 'Compagnon de route', gender: 'female', name: 'Maya' },
      { roleFr: 'Contrôleur / Guichetier', gender: 'male', name: 'Ryan' }
    ],
    variants: [
      { focusTag: 'Habitant Serviable', focusDetailEn: 'finding the historic museum entrance on foot', focusDetailFr: 'trouver l’entrée du musée historique à pied', keyTerm: 'turn left at the traffic lights', keyIpa: '/tɜːn left æt ðə ˈtræfɪk laɪts/', keyFr: 'tourner à gauche aux feux' },
      { focusTag: 'Contrôleur Train', focusDetailEn: 'checking which carriage stops at Oxford Station', focusDetailFr: 'vérifier quelle voiture dessert la gare d’Oxford', keyTerm: 'next stop', keyIpa: '/nekst stɒp/', keyFr: 'prochain arrêt' },
      { focusTag: 'Chauffeur Taxi', focusDetailEn: 'avoiding heavy downtown traffic toward the pier', focusDetailFr: 'éviter les embouteillages du centre vers l’embarcadère', keyTerm: 'take a shortcut', keyIpa: '/teɪk ə ˈʃɔːtkʌt/', keyFr: 'prendre un raccourci' },
      { focusTag: 'Guide Touristique', focusDetailEn: 'hearing the hidden history behind the old bridge', focusDetailFr: 'découvrir l’histoire secrète du vieux pont', keyTerm: 'off the beaten track', keyIpa: '/ɒf ðə ˈbiːtən træk/', keyFr: 'hors des sentiers battus' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Excuse me, I am visiting for the first time. Could you help me with {DETAIL_EN}?',
        frPattern: 'Excusez-moi, je visite pour la première fois. Pourriez-vous m’aider pour {DETAIL_FR} ?',
        keyPhrasePattern: 'visiting for the first time',
        keyIpa: '/ˈvɪzɪtɪŋ fɔː ðə fɜːst taɪm/',
        keyMeaningFr: 'être en visite pour la première fois',
        tipFr: 'Dire que c’est votre première visite attire immédiatement la bienveillance des habitants.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Of course, welcome to town! For {DETAIL_EN}, you are actually just five minutes away from the main square.',
        frPattern: 'Bien sûr, bienvenue en ville ! Pour {DETAIL_FR}, vous êtes en fait à cinq minutes de la place principale.',
        keyPhrasePattern: 'just five minutes away',
        keyIpa: '/dʒʌst faɪv ˈmɪnɪts əˈweɪ/',
        keyMeaningFr: 'à seulement cinq minutes',
        tipFr: '« … minutes away » exprime parfaitement la distance en temps.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Is there a scenic street or local landmark I should look out for along the way?',
        frPattern: 'Y a-t-il une rue pittoresque ou un point de repère à repérer en chemin ?',
        keyPhrasePattern: 'look out for',
        keyIpa: '/lʊk aʊt fɔː/',
        keyMeaningFr: 'repérer / faire attention à',
        tipFr: '« Look out for » aide à suivre un repère visuel dans un itinéraire.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Watch for the stone clock tower—take the cobbled lane just behind it and you will arrive right on target.',
        frPattern: 'Repérez la tour de l’horloge en pierre : prenez la ruelle pavée juste derrière et vous arriverez pile dessus.',
        keyPhrasePattern: 'right on target',
        keyIpa: '/raɪt ɒn ˈtɑːɡɪt/',
        keyMeaningFr: 'directement au but / pile à destination',
        tipFr: '« Clock tower » et « cobbled lane » enrichissent votre vocabulaire urbain.'
      }
    ]
  }
];

export const SCENARIOS_GASTRONOMIE: ScenarioBlueprint[] = [
  {
    code: 'ga-restaurant-sommelier',
    title: 'Ordering at a Bistro & Consulting the Sommelier',
    titleFr: 'Commander au restaurant & dialoguer avec le sommelier',
    setting: 'Bistrot gastronomique & Table d’hôtes',
    learningGoal: 'Demander les plats du jour, préciser allergies/cuissons et accorder mets et boissons.',
    roles: [
      { roleFr: 'Client(e)', gender: 'female', name: 'Sophie' },
      { roleFr: 'Serveur / Sommelier', gender: 'male', name: 'Henri' },
      { roleFr: 'Convive', gender: 'male', name: 'Paul' },
      { roleFr: 'Chef de salle', gender: 'female', name: 'Amélie' }
    ],
    variants: [
      { focusTag: 'Plats du Jour', focusDetailEn: 'today’s seasonal chef specials', focusDetailFr: 'les suggestions de saison du chef aujourd’hui', keyTerm: 'chef’s special', keyIpa: '/ʃefs ˈspeʃəl/', keyFr: 'plat du jour / spécialité du chef' },
      { focusTag: 'Allergies & Régime', focusDetailEn: 'nut-free and gluten-free starter choices', focusDetailFr: 'les entrées garanties sans noix et sans gluten', keyTerm: 'food allergy', keyIpa: '/fuːd ˈælədʒi/', keyFr: 'allergie alimentaire' },
      { focusTag: 'Accord Boissons', focusDetailEn: 'a crisp sparkling pairing for grilled sea bass', focusDetailFr: 'un accord vif et pétillant pour le bar grillé', keyTerm: 'pair nicely with', keyIpa: '/peə ˈnaɪsli wɪð/', keyFr: 's’accorder harmonieusement avec' },
      { focusTag: 'Cuisson & Garniture', focusDetailEn: 'medium-rare roast duck with glazed shallots', focusDetailFr: 'le magret rosé aux échalotes confites', keyTerm: 'medium-rare', keyIpa: '/ˈmiːdiəm reə/', keyFr: 'saignant à point / rosé' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Good evening! Before we order, could you tell us more about {DETAIL_EN}?',
        frPattern: 'Bonsoir ! Avant de commander, pourriez-vous nous en dire plus sur {DETAIL_FR} ?',
        keyPhrasePattern: 'Before we order',
        keyIpa: '/bɪˈfɔː wiː ˈɔːdə/',
        keyMeaningFr: 'Avant que nous commandions',
        tipFr: 'Toujours utile avant d’arrêter son choix au restaurant.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'With pleasure. For {DETAIL_EN}, everything is prepared fresh this afternoon using local farm produce.',
        frPattern: 'Avec plaisir. Concernant {DETAIL_FR}, tout est préparé frais cet après-midi avec des produits de fermes locales.',
        keyPhrasePattern: 'local farm produce',
        keyIpa: '/ˈləʊkəl fɑːm ˈprɒdjuːs/',
        keyMeaningFr: 'produits agricoles locaux',
        tipFr: '« Produce » (nom indénombrable, accent sur « pro- » /ˈprɒdjuːs/) désigne les fruits/légumes frais.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'That sounds delicious! Would you recommend sparkling water or a house infusion alongside it, and can we share a dessert later?',
        frPattern: 'Cela semble délicieux ! Recommanderiez-vous une eau pétillante ou une infusion maison avec, et pourrons-nous partager un dessert ensuite ?',
        keyPhrasePattern: 'share a dessert',
        keyIpa: '/ʃeər ə dɪˈzɜːt/',
        keyMeaningFr: 'partager un dessert',
        tipFr: 'Attention à l’orthographe et à l’accentuation : « dessert » (/dɪˈzɜːt/) avec deux « s », différent de « desert » (/ˈdezət/).'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'The citrus botanical infusion pairs wonderfully, and I will gladly bring two spoons when you are ready for dessert.',
        frPattern: 'L’infusion botanique aux agrumes s’accorde à merveille, et j’apporterai volontiers deux cuillères pour le dessert.',
        keyPhrasePattern: 'pairs wonderfully',
        keyIpa: '/peəz ˈwʌndəfli/',
        keyMeaningFr: 'se marie à merveille',
        tipFr: '« To pair » est le verbe de référence en gastronomie pour les accords.'
      }
    ]
  },
  {
    code: 'ga-market-bakery-cooking',
    title: 'At the Farmers’ Market, Bakery & Cooking Class',
    titleFr: 'Au marché fermier, en pâtisserie & atelier culinaire',
    setting: 'Marché gourmand & Atelier de cuisine',
    learningGoal: 'Questionner sur la provenance, goûter, comparer les saveurs et suivre une technique.',
    roles: [
      { roleFr: 'Visiteur(se) gourmand(e)', gender: 'male', name: 'Tom' },
      { roleFr: 'Artisan / Chef formateur', gender: 'female', name: 'Denise' },
      { roleFr: 'Apprenti(e) cuisinier', gender: 'female', name: 'Jade' },
      { roleFr: 'Producteur local', gender: 'male', name: 'Victor' }
    ],
    variants: [
      { focusTag: 'Fromagerie & Affinage', focusDetailEn: 'aged goat cheese versus creamy camembert', focusDetailFr: 'le fromage de chèvre affiné par rapport au camembert crémeux', keyTerm: 'have a taste', keyIpa: '/hæv ə teɪst/', keyFr: 'goûter un morceau' },
      { focusTag: 'Pâtisserie Artisanale', focusDetailEn: 'achieving crisp flaky puff pastry layers', focusDetailFr: 'réussir un feuilletage croustillant et léger', keyTerm: 'flaky pastry', keyIpa: '/ˈfleɪki ˈpeɪstri/', keyFr: 'pâte feuilletée légère' },
      { focusTag: 'Cours de Sauce', focusDetailEn: 'balancing acidity and butter in a pan reduction', focusDetailFr: 'équilibrer acidité et beurre dans une réduction', keyTerm: 'simmer gently', keyIpa: '/ˈsɪmə ˈdʒentli/', keyFr: 'laisser mijoter doucement' },
      { focusTag: 'Épices & Huiles', focusDetailEn: 'choosing cold-pressed olive oil for salads', focusDetailFr: 'choisir une huile d’olive pressée à froid pour les salades', keyTerm: 'from scratch', keyIpa: '/frɒm skrætʃ/', keyFr: 'entièrement fait maison' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'This aroma is incredible! What is the secret behind {DETAIL_EN}?',
        frPattern: 'Cet arôme est incroyable ! Quel est le secret de {DETAIL_FR} ?',
        keyPhrasePattern: 'secret behind',
        keyIpa: '/ˈsiːkrət bɪˈhaɪnd/',
        keyMeaningFr: 'le secret derrière (une recette)',
        tipFr: 'Compliment idéal pour engager la conversation avec un artisan.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Patience and timing! For {DETAIL_EN}, temperature control makes all the difference.',
        frPattern: 'La patience et le timing ! Pour {DETAIL_FR}, la maîtrise de la température fait toute la différence.',
        keyPhrasePattern: 'makes all the difference',
        keyIpa: '/meɪks ɔːl ðə ˈdɪfrəns/',
        keyMeaningFr: 'fait toute la différence',
        tipFr: 'Expression idiomatique très naturelle et positive.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'May I sample a small piece, and how should I store it once I get home?',
        frPattern: 'Puis-je goûter un petit morceau, et comment dois-je le conserver une fois rentré ?',
        keyPhrasePattern: 'sample a small piece',
        keyIpa: '/ˈsɑːmpəl ə smɔːl piːs/',
        keyMeaningFr: 'goûter / déguster un petit échantillon',
        tipFr: '« Sample » utilisé comme verbe signifie déguster avec tact.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Please go ahead! Keep it wrapped in parchment paper in a cool pantry and enjoy within four days.',
        frPattern: 'Je vous en prie, goûtez ! Gardez-le enveloppé dans du papier sulfurisé au frais et dégustez-le sous quatre jours.',
        keyPhrasePattern: 'parchment paper',
        keyIpa: '/ˈpɑːtʃmənt ˈpeɪpə/',
        keyMeaningFr: 'papier sulfurisé / parchemin alimentaire',
        tipFr: 'Mot précis indispensable en cuisine et boulangerie.'
      }
    ]
  }
];
