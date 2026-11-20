import type { ScenarioBlueprint } from './atelierDialoguesTypes';

/**
 * Thèmes 1, 2, 3 : La Vie Quotidienne, Les Loisirs, Le Métier
 * Chaque blueprint propose des répliques Q&A naturelles (Demande ↔ Réponse)
 * adaptables en Duo, Trio ou Groupe, multi-niveaux et enrichies en expressions IPA.
 */

export const SCENARIOS_VIE_QUOTIDIENNE: ScenarioBlueprint[] = [
  {
    code: 'vq-bakery-morning',
    title: 'Morning Errands at the Neighbourhood Shop',
    titleFr: 'Courses du matin chez le commerçant du quartier',
    setting: 'Épicerie & Boulangerie locale',
    learningGoal: 'Demander un article disponible, vérifier le prix et obtenir un conseil frais.',
    roles: [
      { roleFr: 'Client(e)', gender: 'female', name: 'Clara' },
      { roleFr: 'Commerçant(e)', gender: 'male', name: 'Oliver' },
      { roleFr: 'Habitué(e)', gender: 'female', name: 'Sophie' },
      { roleFr: 'Apprenti(e)', gender: 'male', name: 'Liam' }
    ],
    variants: [
      { focusTag: 'Pain & Viennoiserie', focusDetailEn: 'fresh sourdough loaves', focusDetailFr: 'pains au levain frais', keyTerm: 'out of stock', keyIpa: '/aʊt əv stɒk/', keyFr: 'en rupture de stock' },
      { focusTag: 'Produits Laitiers', focusDetailEn: 'organic oat milk cartons', focusDetailFr: 'briques de lait d’avoine bio', keyTerm: 'best before date', keyIpa: '/best bɪˈfɔː deɪt/', keyFr: 'date limite de consommation' },
      { focusTag: 'Fruits de Saison', focusDetailEn: 'local ripe strawberries', focusDetailFr: 'fraises mûres locales', keyTerm: 'in season', keyIpa: '/ɪn ˈsiːzən/', keyFr: 'de saison' },
      { focusTag: 'Colis & Dépôt', focusDetailEn: 'a parcel pickup voucher', focusDetailFr: 'un bon de retrait de colis', keyTerm: 'pick up', keyIpa: '/pɪk ʌp/', keyFr: 'récupérer / retirer' },
      { focusTag: 'Carte Fidélité', focusDetailEn: 'the loyalty discount card', focusDetailFr: 'la carte de fidélité', keyTerm: 'keep the change', keyIpa: '/kiːp ðə tʃeɪndʒ/', keyFr: 'garder la monnaie' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Excuse me, could you tell me if you still have {DETAIL_EN} left this morning?',
        frPattern: 'Excusez-moi, pourriez-vous me dire s’il vous reste des {DETAIL_FR} ce matin ?',
        keyPhrasePattern: 'could you tell me if',
        keyIpa: '/kʊd juː tel miː ɪf/',
        keyMeaningFr: 'pourriez-vous me dire si (demande polie)',
        tipFr: 'Formule idéale pour poser une question polie sans paraître brusque.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Of course! We just set out a fresh batch of {DETAIL_EN} right by the front counter.',
        frPattern: 'Bien sûr ! Nous venons tout juste de disposer un lot frais de {DETAIL_FR} juste au comptoir d’entrée.',
        keyPhrasePattern: 'just set out a fresh batch',
        keyIpa: '/dʒʌst set aʊt ə freʃ bætʃ/',
        keyMeaningFr: 'venir de disposer une nouvelle fournée',
        tipFr: '« Batch » désigne un lot préparé ensemble.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'That is great. By the way, is there a discount if I take two, and do you take contactless payment?',
        frPattern: 'C’est parfait. Au fait, y a-t-il une remise si j’en prends deux, et acceptez-vous le paiement sans contact ?',
        keyPhrasePattern: 'contactless payment',
        keyIpa: '/ˈkɒntæktləs ˈpeɪmənt/',
        keyMeaningFr: 'paiement sans contact',
        tipFr: '« By the way » permet d’enchaîner naturellement sur une seconde question.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Yes, you get ten percent off the second item, and you can simply tap your card whenever you are ready.',
        frPattern: 'Oui, vous avez dix pour cent sur le deuxième article, et il suffit de poser votre carte quand vous êtes prêt.',
        keyPhrasePattern: 'tap your card',
        keyIpa: '/tæp jɔː kɑːd/',
        keyMeaningFr: 'approcher sa carte (sans contact)',
        tipFr: 'Au quotidien au Royaume-Uni comme aux USA, on dit « tap your card ».'
      }
    ]
  },
  {
    code: 'vq-doctor-pharmacy',
    title: 'Asking Advice at the Clinic & Pharmacy',
    titleFr: 'Consulter et demander conseil à la pharmacie',
    setting: 'Pharmacie & Cabinet médical de quartier',
    learningGoal: 'Décrire un symptôme, comprendre la posologie et poser une question de suivi.',
    roles: [
      { roleFr: 'Patient(e)', gender: 'male', name: 'Hugo' },
      { roleFr: 'Pharmacien(ne)', gender: 'female', name: 'Dr. Evans' },
      { roleFr: 'Infirmière', gender: 'female', name: 'Nora' },
      { roleFr: 'Accompagnant(e)', gender: 'male', name: 'Marc' }
    ],
    variants: [
      { focusTag: 'Rhume & Gorge', focusDetailEn: 'a persistent sore throat since yesterday', focusDetailFr: 'un mal de gorge persistant depuis hier', keyTerm: 'over-the-counter', keyIpa: '/ˌəʊvə ðə ˈkaʊntə/', keyFr: 'sans ordonnance' },
      { focusTag: 'Allergie Saisonnière', focusDetailEn: 'mild seasonal pollen allergies', focusDetailFr: 'des allergies légères au pollen', keyTerm: 'side effects', keyIpa: '/saɪd ɪˈfekts/', keyFr: 'effets secondaires' },
      { focusTag: 'Rendez-vous Suivi', focusDetailEn: 'rescheduling a blood test appointment', focusDetailFr: 'le report d’une prise de sang', keyTerm: 'on an empty stomach', keyIpa: '/ɒn ən ˈempti ˈstʌmək/', keyFr: 'à jeun' },
      { focusTag: 'Premiers Secours', focusDetailEn: 'a minor ankle sprain after running', focusDetailFr: 'une légère entorse à la cheville après avoir couru', keyTerm: 'apply a cold pack', keyIpa: '/əˈplaɪ ə kəʊld pæk/', keyFr: 'appliquer une poche froide' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Hello, I have been dealing with {DETAIL_EN}. What would you recommend?',
        frPattern: 'Bonjour, j’ai {DETAIL_FR}. Que me recommanderiez-vous ?',
        keyPhrasePattern: 'dealing with',
        keyIpa: '/ˈdiːlɪŋ wɪð/',
        keyMeaningFr: 'être confronté à / souffrir de',
        tipFr: '« I have been dealing with… » exprime une situation qui dure depuis un moment.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Let me check. For {DETAIL_EN}, this gentle remedy works very well, provided you take it after meals.',
        frPattern: 'Laissez-moi vérifier. Pour {DETAIL_FR}, ce traitement doux agit très bien, à condition de le prendre après les repas.',
        keyPhrasePattern: 'provided you take it',
        keyIpa: '/prəˈvaɪdɪd juː teɪk ɪt/',
        keyMeaningFr: 'à condition que vous le preniez',
        tipFr: '« Provided (that) » est un connecteur élégant équivalent à « à condition que ».'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Got it, thank you. How many times a day should I take it, and could it cause drowsiness?',
        frPattern: 'Compris, merci. Combien de fois par jour dois-je le prendre, et cela peut-il provoquer de la somnolence ?',
        keyPhrasePattern: 'cause drowsiness',
        keyIpa: '/kɔːz ˈdraʊzinəs/',
        keyMeaningFr: 'provoquer de la somnolence',
        tipFr: 'Mot-clé indispensable sur les notices de médicaments en anglais.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Take one tablet twice daily with water; this formula is non-drowsy, and you should feel better within forty-eight hours.',
        frPattern: 'Prenez un comprimé deux fois par jour avec de l’eau ; cette formule ne cause pas de somnolence et vous devriez aller mieux sous 48 heures.',
        keyPhrasePattern: 'twice daily',
        keyIpa: '/twaɪs ˈdeɪli/',
        keyMeaningFr: 'deux fois par jour',
        tipFr: '« Once / twice daily » remplace avantageusement « two times every day ».'
      }
    ]
  },
  {
    code: 'vq-neighbors-home',
    title: 'Everyday Coordination with Neighbours & Landlord',
    titleFr: 'Organisation quotidienne entre voisins ou avec le propriétaire',
    setting: 'Hall d’immeuble & Appartement',
    learningGoal: 'Signaler un souci domestique poliment et fixer un créneau pratique.',
    roles: [
      { roleFr: 'Locataire', gender: 'female', name: 'Camille' },
      { roleFr: 'Propriétaire / Voisin', gender: 'male', name: 'Arthur' },
      { roleFr: 'Technicien(ne)', gender: 'female', name: 'Maya' },
      { roleFr: 'Gardien(ne)', gender: 'male', name: 'George' }
    ],
    variants: [
      { focusTag: 'Plomberie', focusDetailEn: 'a dripping tap in the kitchen sink', focusDetailFr: 'un robinet qui goutte dans l’évier de la cuisine', keyTerm: 'turn off the valve', keyIpa: '/tɜːn ɒf ðə vælv/', keyFr: 'fermer la vanne' },
      { focusTag: 'Livraison Colis', focusDetailEn: 'keeping a large parcel until tonight', focusDetailFr: 'garder un grand colis jusqu’à ce soir', keyTerm: 'drop off', keyIpa: '/drɒp ɒf/', keyFr: 'déposer' },
      { focusTag: 'Connexion Fibre', focusDetailEn: 'an intermittent internet router signal', focusDetailFr: 'un signal de box internet intermittent', keyTerm: 'reboot the router', keyIpa: '/ˌriːˈbuːt ðə ˈruːtə/', keyFr: 'redémarrer le routeur' },
      { focusTag: 'Chauffage', focusDetailEn: 'bleeding the living room radiator before winter', focusDetailFr: 'purger le radiateur du salon avant l’hiver', keyTerm: 'make an appointment', keyIpa: '/meɪk ən əˈpɔɪntmənt/', keyFr: 'prendre rendez-vous' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Hi there! Sorry to bother you, would you mind helping me out with {DETAIL_EN}?',
        frPattern: 'Bonjour ! Désolée de vous déranger, cela vous ennuierait-il de m’aider concernant {DETAIL_FR} ?',
        keyPhrasePattern: 'would you mind',
        keyIpa: '/wʊd juː maɪnd/',
        keyMeaningFr: 'cela vous dérangerait-il de (+ verbe en -ing)',
        tipFr: 'Toujours suivi d’un verbe en « -ing » : « Would you mind helping… ».'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Not at all! Glad you mentioned {DETAIL_EN} right away. Are you free tomorrow around ten?',
        frPattern: 'Pas du tout ! Heureux que vous ayez signalé {DETAIL_FR} tout de suite. Êtes-vous libre demain vers dix heures ?',
        keyPhrasePattern: 'Not at all',
        keyIpa: '/nɒt æt ɔːl/',
        keyMeaningFr: 'Pas du tout (réponse positive à « Would you mind »)',
        tipFr: 'Attention au piège : répondre « Yes » à « Would you mind » veut dire « oui, ça me dérange » ! Dites « Not at all ».'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Ten o’clock works well for me. Should I prepare anything before you come over?',
        frPattern: 'Dix heures me convient très bien. Dois-je préparer quelque chose avant que vous ne passiez ?',
        keyPhrasePattern: 'works well for me',
        keyIpa: '/wɜːks wel fɔː miː/',
        keyMeaningFr: 'cela me convient parfaitement',
        tipFr: 'Expression très naturelle pour valider un horaire.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Just keep the area clear; I will bring the tools and settle everything in twenty minutes.',
        frPattern: 'Dégagez simplement l’espace ; j’apporterai les outils et je réglerai tout en vingt minutes.',
        keyPhrasePattern: 'settle everything',
        keyIpa: '/ˈsetəl ˈevriθɪŋ/',
        keyMeaningFr: 'tout régler / résoudre',
        tipFr: '« Settle » signifie ici résoudre efficacement un problème pratique.'
      }
    ]
  },
  {
    code: 'vq-bank-post',
    title: 'Everyday Banking & Administrative Counter',
    titleFr: 'Démarche courante à la banque ou à la poste',
    setting: 'Agence bancaire & Guichet postal',
    learningGoal: 'Ouvrir ou vérifier un service, comprendre les frais et confirmer une pièce.',
    roles: [
      { roleFr: 'Usager', gender: 'male', name: 'Lucas' },
      { roleFr: 'Conseiller(ère)', gender: 'female', name: 'Helena' },
      { roleFr: 'Superviseur(e)', gender: 'male', name: 'David' },
      { roleFr: 'Client(e) en file', gender: 'female', name: 'Inès' }
    ],
    variants: [
      { focusTag: 'Carte Bloquée', focusDetailEn: 'activating a replacement debit card', focusDetailFr: 'l’activation d’une nouvelle carte bancaire', keyTerm: 'proof of identity', keyIpa: '/pruːf əv aɪˈdentɪti/', keyFr: 'justificatif d’identité' },
      { focusTag: 'Virement International', focusDetailEn: 'sending a wire transfer in pounds', focusDetailFr: 'l’envoi d’un virement en livres sterling', keyTerm: 'exchange rate', keyIpa: '/ɪksˈtʃeɪndʒ reɪt/', keyFr: 'taux de change' },
      { focusTag: 'Courrier Recommandé', focusDetailEn: 'posting a tracked registered letter', focusDetailFr: 'l’envoi d’un courrier recommandé suivi', keyTerm: 'tracking number', keyIpa: '/ˈtrækɪŋ ˈnʌmbə/', keyFr: 'numéro de suivi' },
      { focusTag: 'Justificatif Domicile', focusDetailEn: 'updating my current home address', focusDetailFr: 'la mise à jour de mon adresse postale', keyTerm: 'utility bill', keyIpa: '/juːˈtɪlɪti bɪl/', keyFr: 'facture d’eau ou d’électricité' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Good afternoon. I would like some help with {DETAIL_EN}. Which counter should I go to?',
        frPattern: 'Bonjour. J’aurais besoin d’aide pour {DETAIL_FR}. À quel guichet dois-je m’adresser ?',
        keyPhrasePattern: 'Which counter should I go to',
        keyIpa: '/wɪtʃ ˈkaʊntə ʃʊd aɪ ɡəʊ tuː/',
        keyMeaningFr: 'À quel guichet dois-je aller ?',
        tipFr: '« Counter » ou « desk » désigne le guichet d’accueil.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'You are at the right desk! To handle {DETAIL_EN}, I will simply need your passport or ID card.',
        frPattern: 'Vous êtes au bon guichet ! Pour traiter {DETAIL_FR}, j’aurai simplement besoin de votre passeport ou carte d’identité.',
        keyPhrasePattern: 'You are at the right desk',
        keyIpa: '/juː ɑːr æt ðə raɪt desk/',
        keyMeaningFr: 'Vous êtes au bon endroit / guichet',
        tipFr: 'Réponse rassurante très fréquente dans les services.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Here is my ID. Are there any extra fees, and how long will the processing take?',
        frPattern: 'Voici ma pièce d’identité. Y a-t-il des frais supplémentaires, et combien de temps prendra le traitement ?',
        keyPhrasePattern: 'extra fees',
        keyIpa: '/ˈekstrə fiːz/',
        keyMeaningFr: 'frais supplémentaires',
        tipFr: 'Demandez toujours « Are there any extra fees? » pour vérifier le coût total.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'There is no extra charge, and your confirmation receipt will be printed in two minutes.',
        frPattern: 'Il n’y a aucuns frais supplémentaires, et votre reçu de confirmation sera imprimé dans deux minutes.',
        keyPhrasePattern: 'confirmation receipt',
        keyIpa: '/ˌkɒnfəˈmeɪʃən rɪˈsiːt/',
        keyMeaningFr: 'reçu de confirmation',
        tipFr: 'Notez que le « p » de « receipt » est complètement muet (/rɪˈsiːt/).'
      }
    ]
  }
];

export const SCENARIOS_LOISIRS: ScenarioBlueprint[] = [
  {
    code: 'lo-cinema-concert',
    title: 'Choosing a Film, Concert or Theatre Show',
    titleFr: 'Choisir un film, un concert ou une pièce de théâtre',
    setting: 'Billetterie du cinéma & Salle de spectacle',
    learningGoal: 'Comparer des séances, réserver de bonnes places et débattre d’une œuvre.',
    roles: [
      { roleFr: 'Ami(e) 1', gender: 'female', name: 'Emma' },
      { roleFr: 'Ami(e) 2', gender: 'male', name: 'Theo' },
      { roleFr: 'Ami(e) 3', gender: 'female', name: 'Sarah' },
      { roleFr: 'Guichetier(ère)', gender: 'male', name: 'Nathan' }
    ],
    variants: [
      { focusTag: 'Cinéma VO', focusDetailEn: 'the original-version thriller screening', focusDetailFr: 'la séance du thriller en version originale', keyTerm: 'front row', keyIpa: '/frʌnt rəʊ/', keyFr: 'premier rang' },
      { focusTag: 'Concert Jazz', focusDetailEn: 'tonight’s acoustic jazz quartet', focusDetailFr: 'le quartet de jazz acoustique de ce soir', keyTerm: 'sold out', keyIpa: '/səʊld aʊt/', keyFr: 'complet (guichets fermés)' },
      { focusTag: 'Pièce Théâtre', focusDetailEn: 'the modern comedy play downtown', focusDetailFr: 'la pièce de comédie moderne au centre-ville', keyTerm: 'worth seeing', keyIpa: '/wɜːθ ˈsiːɪŋ/', keyFr: 'qui vaut le détour / à voir' },
      { focusTag: 'Exposition Musée', focusDetailEn: 'the evening photography exhibition', focusDetailFr: 'l’exposition nocturne de photographie', keyTerm: 'book in advance', keyIpa: '/bʊk ɪn ədˈvɑːns/', keyFr: 'réserver à l’avance' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'What do you feel like doing tonight? Shall we catch {DETAIL_EN}?',
        frPattern: 'Qu’as-tu envie de faire ce soir ? Et si nous allions voir {DETAIL_FR} ?',
        keyPhrasePattern: 'What do you feel like doing',
        keyIpa: '/wɒt duː juː fiːl laɪk ˈduːɪŋ/',
        keyMeaningFr: 'Qu’as-tu envie de faire ?',
        tipFr: '« Feel like + -ing » exprime l’envie du moment.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'I would love that! Do you know if there are still decent seats available for {DETAIL_EN}?',
        frPattern: 'J’adorerais ça ! Sais-tu s’il reste encore de bonnes places pour {DETAIL_FR} ?',
        keyPhrasePattern: 'decent seats available',
        keyIpa: '/ˈdiːsənt siːts əˈveɪləbəl/',
        keyMeaningFr: 'de bonnes places disponibles',
        tipFr: '« Decent » signifie ici satisfaisant, bien placé.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Yes, I checked online—middle-row seats are still open at eight sharp. Should we book right now?',
        frPattern: 'Oui, j’ai regardé en ligne : des places au rang du milieu sont libres à vingt heures pile. On réserve maintenant ?',
        keyPhrasePattern: 'at eight sharp',
        keyIpa: '/æt eɪt ʃɑːp/',
        keyMeaningFr: 'à huit heures pile',
        tipFr: '« Sharp » après une heure veut dire « pile / exactement ».'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Definitely! Book them now and let us grab a quick drink beforehand so we do not rush.',
        frPattern: 'Carrément ! Réserve-les tout de suite et prenons un verre rapide avant pour ne pas courir.',
        keyPhrasePattern: 'grab a quick drink',
        keyIpa: '/ɡræb ə kwɪk drɪŋk/',
        keyMeaningFr: 'prendre un verre rapidement',
        tipFr: '« Grab » est très courant entre amis pour proposer un café ou un repas rapide.'
      }
    ]
  },
  {
    code: 'lo-sports-hiking',
    title: 'Weekend Hiking, Tennis & Outdoor Club',
    titleFr: 'Randonnée, tennis et activités sportives du week-end',
    setting: 'Club sportif & Sentier panoramique',
    learningGoal: 'Planifier un équipement, évaluer le niveau d’effort et encourager les partenaires.',
    roles: [
      { roleFr: 'Organisateur(trice)', gender: 'male', name: 'Julien' },
      { roleFr: 'Participant(e)', gender: 'female', name: 'Alice' },
      { roleFr: 'Coach', gender: 'male', name: 'Ryan' },
      { roleFr: 'Membre du club', gender: 'female', name: 'Léa' }
    ],
    variants: [
      { focusTag: 'Randonnée Montagne', focusDetailEn: 'the twelve-kilometre ridge trail', focusDetailFr: 'le sentier de crête de douze kilomètres', keyTerm: 'pace yourself', keyIpa: '/peɪs jɔːˈself/', keyFr: 'gérer son rythme' },
      { focusTag: 'Match de Tennis', focusDetailEn: 'our doubles tennis session on clay', focusDetailFr: 'notre séance de tennis en double sur terre battue', keyTerm: 'warm up properly', keyIpa: '/wɔːm ʌp ˈprɒpəli/', keyFr: 'bien s’échauffer' },
      { focusTag: 'Sortie Vélo', focusDetailEn: 'cycling along the river greenway', focusDetailFr: 'la sortie vélo le long de la voie verte', keyTerm: 'spare inner tube', keyIpa: '/speə ˈɪnə tjuːb/', keyFr: 'chambre à air de rechange' },
      { focusTag: 'Natation & Fitness', focusDetailEn: 'the morning lap swimming class', focusDetailFr: 'le cours de natation matinale en longueurs', keyTerm: 'keep fit', keyIpa: '/kiːp fɪt/', keyFr: 'garder la forme' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Are you still up for {DETAIL_EN} this Saturday, or does the forecast worry you?',
        frPattern: 'Es-tu toujours partante pour {DETAIL_FR} ce samedi, ou la météo t’inquiète-t-elle ?',
        keyPhrasePattern: 'up for',
        keyIpa: '/ʌp fɔː/',
        keyMeaningFr: 'partant(e) pour',
        tipFr: '« To be up for something » est l’expression n° 1 entre amis pour dire « être partant ».'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'I am definitely in! The sky looks clear until five, so {DETAIL_EN} will feel refreshing.',
        frPattern: 'Je suis carrément partante ! Le ciel s’annonce dégagé jusqu’à 17h, donc {DETAIL_FR} va faire un bien fou.',
        keyPhrasePattern: 'I am definitely in',
        keyIpa: '/aɪ æm ˈdefɪnɪtli ɪn/',
        keyMeaningFr: 'J’en suis / je participe sans hésiter',
        tipFr: '« Count me in! » ou « I’m in! » marque un accord enthousiaste.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Awesome! What gear should everyone pack besides water and a light windbreaker?',
        frPattern: 'Génial ! Quel équipement chacun devrait-il emporter en plus de l’eau et d’un coupe-vent léger ?',
        keyPhrasePattern: 'light windbreaker',
        keyIpa: '/laɪt ˈwɪndbreɪkə/',
        keyMeaningFr: 'coupe-vent léger',
        tipFr: 'Pensez au mot composé « wind + breaker ».'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Bring comfortable footwear and a small snack; let us meet at the entrance gate at nine sharp.',
        frPattern: 'Apportez de bonnes chaussures et un petit encas ; retrouvons-nous à l’entrée à neuf heures précises.',
        keyPhrasePattern: 'comfortable footwear',
        keyIpa: '/ˈkʌmftəbəl ˈfʊtweə/',
        keyMeaningFr: 'chaussures confortables',
        tipFr: '« Comfortable » se prononce en 3 syllabes : /ˈkʌmftəbəl/.'
      }
    ]
  },
  {
    code: 'lo-reading-art-music',
    title: 'Creative Hobbies, Books & Photography Talks',
    titleFr: 'Échanges sur la lecture, la musique et les loisirs créatifs',
    setting: 'Atelier associatif & Café littéraire',
    learningGoal: 'Partager ses goûts culturels, poser des questions ouvertes et conseiller une œuvre.',
    roles: [
      { roleFr: 'Passionné(e) A', gender: 'female', name: 'Jade' },
      { roleFr: 'Passionné(e) B', gender: 'male', name: 'Ethan' },
      { roleFr: 'Animateur(trice)', gender: 'female', name: 'Sonia' },
      { roleFr: 'Nouvel inscrit', gender: 'male', name: 'Tom' }
    ],
    variants: [
      { focusTag: 'Club de Lecture', focusDetailEn: 'that historical novel everyone praised', focusDetailFr: 'ce roman historique dont tout le monde fait l’éloge', keyTerm: 'page-turner', keyIpa: '/ˈpeɪdʒ tɜːnə/', keyFr: 'livre captivant qu’on dévore' },
      { focusTag: 'Photographie', focusDetailEn: 'capturing golden-hour street portraits', focusDetailFr: 'capturer des portraits de rue à l’heure dorée', keyTerm: 'natural lighting', keyIpa: '/ˈnætʃrəl ˈlaɪtɪŋ/', keyFr: 'lumière naturelle' },
      { focusTag: 'Guitare & Piano', focusDetailEn: 'learning jazz chords by ear', focusDetailFr: 'apprendre les accords de jazz à l’oreille', keyTerm: 'get the hang of it', keyIpa: '/ɡet ðə hæŋ əv ɪt/', keyFr: 'prendre le coup de main' },
      { focusTag: 'Jardinage Urbain', focusDetailEn: 'growing aromatic herbs on a sunny balcony', focusDetailFr: 'cultiver des herbes aromatiques sur un balcon ensoleillé', keyTerm: 'green thumb', keyIpa: '/ɡriːn θʌm/', keyFr: 'avoir la main verte' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'How long have you been into {DETAIL_EN}? You seem completely hooked on it!',
        frPattern: 'Depuis combien de temps t’intéresses-tu à {DETAIL_FR} ? Tu as l’air totalement passionné !',
        keyPhrasePattern: 'hooked on',
        keyIpa: '/hʊkt ɒn/',
        keyMeaningFr: 'passionné / accro à',
        tipFr: '« To be into / hooked on » décrit une passion sincère.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'For nearly two years now! Honestly, {DETAIL_EN} helps me unwind completely after work.',
        frPattern: 'Depuis presque deux ans maintenant ! Franchement, {DETAIL_FR} m’aide à décompresser totalement après le travail.',
        keyPhrasePattern: 'unwind completely',
        keyIpa: '/ʌnˈwaɪnd kəmˈpliːtli/',
        keyMeaningFr: 'se détendre complètement',
        tipFr: '« Unwind » (se détendre / décompresser) est plus idiomatique que « relax ».'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'What would you suggest to someone starting from scratch this weekend?',
        frPattern: 'Que conseillerais-tu à quelqu’un qui démarre de zéro ce week-end ?',
        keyPhrasePattern: 'starting from scratch',
        keyIpa: '/ˈstɑːtɪŋ frɒm skrætʃ/',
        keyMeaningFr: 'partir de zéro',
        tipFr: 'Idiome incontournable dans les loisirs comme en entreprise.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Keep it playful, practice twenty minutes a day, and join our next group meetup on Thursday.',
        frPattern: 'Garde un côté ludique, pratique vingt minutes par jour et rejoins notre prochaine rencontre de groupe jeudi.',
        keyPhrasePattern: 'Keep it playful',
        keyIpa: '/kiːp ɪt ˈpleɪfəl/',
        keyMeaningFr: 'Garde l’aspect ludique',
        tipFr: 'Encourage à progresser sans pression.'
      }
    ]
  }
];

export const SCENARIOS_METIER: ScenarioBlueprint[] = [
  {
    code: 'me-job-interview',
    title: 'Job Interview & Career Strengths Exchange',
    titleFr: 'Entretien professionnel & présentation de compétences',
    setting: 'Salle d’entretien / Bureau RH',
    learningGoal: 'Répondre avec assurance aux questions de parcours, expliquer une réussite et poser une question pertinente.',
    roles: [
      { roleFr: 'Recruteur(se)', gender: 'female', name: 'Victoria' },
      { roleFr: 'Candidat(e)', gender: 'male', name: 'Alexandre' },
      { roleFr: 'Directeur Technique', gender: 'male', name: 'Daniel' },
      { roleFr: 'Coordinatrice RH', gender: 'female', name: 'Harper' }
    ],
    variants: [
      { focusTag: 'Gestion de Projet', focusDetailEn: 'coordinating cross-functional technical teams', focusDetailFr: 'la coordination d’équipes techniques pluridisciplinaires', keyTerm: 'track record', keyIpa: '/træk ˈrekɔːd/', keyFr: 'bilan / expérience avérée' },
      { focusTag: 'Service Client', focusDetailEn: 'resolving urgent client issues calmly', focusDetailFr: 'la résolution sereine de demandes clients urgentes', keyTerm: 'hands-on approach', keyIpa: '/hændz ɒn əˈprəʊtʃ/', keyFr: 'approche pratique de terrain' },
      { focusTag: 'Ingénierie & Qualité', focusDetailEn: 'improving workshop safety and testing cycles', focusDetailFr: 'l’amélioration de la sécurité et des tests en atelier', keyTerm: 'attention to detail', keyIpa: '/əˈtenʃən tuː ˈdiːteɪl/', keyFr: 'souci du détail' },
      { focusTag: 'Éducation & Formation', focusDetailEn: 'mentoring junior staff during onboarding', focusDetailFr: 'le mentorat des nouveaux arrivants lors de l’intégration', keyTerm: 'fast learner', keyIpa: '/fɑːst ˈlɜːnə/', keyFr: 'personne qui apprend vite' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Thank you for coming in. Could you walk us through your experience with {DETAIL_EN}?',
        frPattern: 'Merci d’être venu. Pourriez-vous nous présenter votre expérience dans {DETAIL_FR} ?',
        keyPhrasePattern: 'walk us through',
        keyIpa: '/wɔːk ʌs θruː/',
        keyMeaningFr: 'nous expliquer étape par étape',
        tipFr: 'Expression clé des entretiens anglophones pour « présenter en détail ».'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Gladly. Over the past three years, I specialized in {DETAIL_EN}, cutting delays by nearly a quarter.',
        frPattern: 'Avec plaisir. Ces trois dernières années, je me suis spécialisé dans {DETAIL_FR}, réduisant les délais de près d’un quart.',
        keyPhrasePattern: 'Over the past three years',
        keyIpa: '/ˈəʊvə ðə pɑːst θriː jɪəz/',
        keyMeaningFr: 'Au cours des trois dernières années',
        tipFr: 'Introduisez toujours vos chiffres d’impact pour convaincre.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Impressive results. What do you enjoy most about working in that field, and do you have any questions for us?',
        frPattern: 'Résultats impressionnants. Qu’aimez-vous le plus dans ce métier, et avez-vous des questions pour nous ?',
        keyPhrasePattern: 'enjoy most about',
        keyIpa: '/ɪnˈdʒɔɪ məʊst əˈbaʊt/',
        keyMeaningFr: 'ce que vous appréciez le plus dans',
        tipFr: 'Préparez toujours une question constructive pour la fin d’entretien.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'I love solving concrete problems alongside teammates. How does your team measure success during the first ninety days?',
        frPattern: 'J’aime résoudre des problèmes concrets avec mes collègues. Comment votre équipe évalue-t-elle la réussite durant les 90 premiers jours ?',
        keyPhrasePattern: 'alongside teammates',
        keyIpa: '/əˈlɒŋsaɪd ˈtiːmmeɪts/',
        keyMeaningFr: 'aux côtés des collègues',
        tipFr: 'Poser une question sur les 90 premiers jours montre une projection sérieuse dans le poste.'
      }
    ]
  },
  {
    code: 'me-workshop-hospital-field',
    title: 'On-the-Job Coordination Across Professions',
    titleFr: 'Coordination sur le terrain entre collègues de métier',
    setting: 'Atelier / Chantier / Studio / Établissement',
    learningGoal: 'Donner des consignes claires, vérifier une étape technique et répartir les tâches.',
    roles: [
      { roleFr: 'Chef d’équipe', gender: 'male', name: 'Christopher' },
      { roleFr: 'Spécialiste', gender: 'female', name: 'Claire' },
      { roleFr: 'Technicien(ne)', gender: 'male', name: 'Paul' },
      { roleFr: 'Assistant(e)', gender: 'female', name: 'Zoe' }
    ],
    variants: [
      { focusTag: 'Architecture & Plan', focusDetailEn: 'reviewing the updated structural blueprints', focusDetailFr: 'la vérification des plans de structure mis à jour', keyTerm: 'double-check', keyIpa: '/ˌdʌbəl ˈtʃek/', keyFr: 'vérifier deux fois' },
      { focusTag: 'Hôpital & Soins', focusDetailEn: 'handing over the morning patient shift', focusDetailFr: 'la relève d’équipe du matin auprès des patients', keyTerm: 'shift handover', keyIpa: '/ʃɪft ˈhændəʊvə/', keyFr: 'passation de service' },
      { focusTag: 'Artisanat & Bois', focusDetailEn: 'calibrating the custom oak joinery finish', focusDetailFr: 'le réglage des finitions de menuiserie sur chêne', keyTerm: 'custom-made', keyIpa: '/ˈkʌstəm meɪd/', keyFr: 'sur mesure' },
      { focusTag: 'Journalisme & Média', focusDetailEn: 'fact-checking the final broadcast script', focusDetailFr: 'la vérification des faits du script d’émission', keyTerm: 'meet the deadline', keyIpa: '/miːt ðə ˈdedlaɪn/', keyFr: 'respecter l’échéance' }
    ],
    turnsTemplate: [
      {
        speakerSlot: 0,
        intent: 'demande',
        enPattern: 'Before we get started, have you had a chance to finish {DETAIL_EN}?',
        frPattern: 'Avant de commencer, avez-vous eu l’occasion de terminer {DETAIL_FR} ?',
        keyPhrasePattern: 'have a chance to',
        keyIpa: '/hæv ə tʃɑːns tuː/',
        keyMeaningFr: 'avoir l’occasion / le temps de',
        tipFr: 'Formule bienveillante entre collègues pour vérifier l’avancement.'
      },
      {
        speakerSlot: 1,
        intent: 'reponse',
        enPattern: 'Yes, I wrapped up {DETAIL_EN} an hour ago. One measurement needs your final sign-off, though.',
        frPattern: 'Oui, j’ai terminé {DETAIL_FR} il y a une heure. Toutefois, une mesure nécessite votre validation finale.',
        keyPhrasePattern: 'wrapped up',
        keyIpa: '/ræpt ʌp/',
        keyMeaningFr: 'bouclé / terminé',
        tipFr: '« Wrap up » signifie clôturer proprement une tâche.'
      },
      {
        speakerSlot: 0,
        intent: 'precision',
        enPattern: 'Good catch! Let us inspect that point together so the afternoon crew runs smoothly.',
        frPattern: 'Bien vu ! Inspectons ce point ensemble afin que l’équipe de l’après-midi travaille sans accroc.',
        keyPhrasePattern: 'Good catch',
        keyIpa: '/ɡʊd kætʃ/',
        keyMeaningFr: 'Bien vu ! (merci d’avoir repéré cela)',
        tipFr: 'Féliciter un collègue qui repère un écart renforce l’esprit d’équipe.'
      },
      {
        speakerSlot: 1,
        intent: 'conclusion',
        enPattern: 'Agreed. I will log the adjustment right now and brief the rest of the team.',
        frPattern: 'Entendu. Je consigne l’ajustement tout de suite et j’en informe le reste de l’équipe.',
        keyPhrasePattern: 'brief the team',
        keyIpa: '/briːf ðə tiːm/',
        keyMeaningFr: 'informer / briefer l’équipe',
        tipFr: '« To brief someone » = résumer l’essentiel à retenir.'
      }
    ]
  }
];
