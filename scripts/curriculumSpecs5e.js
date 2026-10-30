// 19 additional lessons for 5e (Cinquième - Cycle 4 / A1+–A2)

export const SPECS_5E = [
  {
    grade: '5e', theme_id: 'daily_life', num: 2,
    title: 'La garde-robe & les vêtements selon la météo',
    title_en: 'Clothes & Seasonal Weather',
    objective: 'Décrire sa tenue vestimentaire en fonction des saisons avec le prétérit simple et les adjectifs.',
    grammar: {
      title: "Le Prétérit Simple régulier (-ED) des verbes d'action",
      rule: "Pour raconter ce que l'on a porté ou fait dans le passé, on ajoute la terminaison -ED à la base verbale.",
      example_en: "Yesterday it rained heavily, so I wore my waterproof raincoat and walked to school.",
      example_fr: "Hier il a plu abondamment, j'ai donc porté mon imperméable imperméable et suis allé au collège à pied.",
      tip: "Attention aux verbes irréguliers très fréquents : wear -> wore, put -> put.",
      level_focus: "Prétérit simple des verbes réguliers et irréguliers courants."
    },
    vocab: [
      ["raincoat", "/ˈreɪnkoʊt/", "Noun", "l'imperméable", "Put on your raincoat when it pours.", "Mets ton imperméable quand il pleut à verse."],
      ["jumper", "/ˈdʒʌmpər/", "Noun", "le pull-over", "A woollen jumper keeps you warm in autumn.", "Un pull en laine te garde au chaud en automne."],
      ["boots", "/buːts/", "Noun", "les bottes", "Leather boots protect your feet from mud.", "Des bottes en cuir protègent tes pieds de la boue."],
      ["scarf", "/skɑːrf/", "Noun", "l'écharpe / le foulard", "Wrap a thick scarf around your neck.", "Enroule une écharpe épaisse autour de ton cou."],
      ["gloves", "/ɡlʌvz/", "Noun", "les gants", "Wear warm gloves in freezing weather.", "Porte des gants chauds par temps glacial."],
      ["umbrella", "/ʌmˈbrɛlə/", "Noun", "le parapluie", "Open your umbrella against the shower.", "Ouvre ton parapluie contre l'averse."],
      ["wardrobe", "/ˈwɔːdroʊb/", "Noun", "la garde-robe", "Sort out your summer clothes in the wardrobe.", "Trie tes vêtements d'été dans l'armoire."],
      ["comfortable", "/ˈkʌmftəbl/", "Adjective", "confortable", "Cotton trousers are very comfortable.", "Les pantalons en coton sont très confortables."],
      ["change clothes", "/tʃeɪndʒ kloʊðz/", "Phrase", "se changer", "Change your wet clothes immediately.", "Change immédiatement tes vêtements mouillés."],
      ["weather forecast", "/ˈwɛðər ˈfɔːrkɑːst/", "Noun", "les prévisions météo", "Listen to the evening weather forecast.", "Écoute les prévisions météo du soir."]
    ],
    dialogue: {
      title: "Préparer sa valise pour l'Écosse", setting: "Léa prépare ses affaires pour un voyage scolaire à Édimbourg.",
      lines: [
        ["Teacher", "Check the weather forecast for Edinburgh, pupils.", "Vérifiez les prévisions météo pour Édimbourg, élèves."],
        ["Léa", "It says rain and chilly winds are expected.", "On annonce de la pluie et des vents frais."],
        ["Teacher", "Then pack a sturdy raincoat, warm jumpers and waterproof boots.", "Alors emportez un imperméable solide, des pulls chauds et des bottes imperméables."],
        ["Léa", "I will also take an umbrella and a cosy scarf.", "Je prendrai aussi un parapluie et une écharpe douillette."]
      ]
    },
    dictation: { prompt: "Yesterday I wore a warm jumper and thick boots.", fr: "Hier j'ai porté un pull chaud et des bottes épaisses." },
    quiz: [
      { q: "Quel est le prétérit du verbe irrégulier 'to wear' (porter un vêtement) ?", opts: ["Weared", "Wore", "Worn", "Wearing"], a: 1, exp: "Le prétérit de 'wear' est 'wore'." },
      { q: "Que signifie 'raincoat' ?", opts: ["Un maillot", "Un imperméable", "Un chapeau", "Une écharpe"], a: 1, exp: "'Raincoat' désigne un manteau de pluie ou imperméable." },
      { q: "Comment dit-on 'les prévisions météo' ?", opts: ["The climate news", "The weather forecast", "The cloud report", "The rain notice"], a: 1, exp: "'Weather forecast' est l'expression consacrée pour le bulletin météo." }
    ]
  },
  {
    grade: '5e', theme_id: 'daily_life', num: 3,
    title: 'Les loisirs du week-end & détente en famille',
    title_en: 'Weekend Activities & Family Rest',
    objective: 'Raconter ses activités passées du week-end avec AGO et LAST.',
    grammar: {
      title: "Les repères temporels du passé : AGO et LAST",
      rule: "On utilise 'LAST' suivi d'une période (last weekend, last Sunday) et 'AGO' placé après une durée (two days ago, three hours ago) avec le prétérit.",
      example_en: "Two days ago, our family visited grandparents and played board games.",
      example_fr: "Il y a deux jours, notre famille a rendu visite aux grands-parents et a joué à des jeux de société.",
      tip: "N'oubliez pas : durée + ago (ex: ten minutes ago = il y a dix minutes).",
      level_focus: "Expressions temporelles du passé, prétérit des verbes de loisir."
    },
    vocab: [
      ["sleep in", "/sliːp ɪn/", "Phrasal verb", "faire la grasse matinée", "On Sunday morning I like to sleep in.", "Le dimanche matin j'aime faire la grasse matinée."],
      ["board game", "/bɔːrd ɡeɪm/", "Noun", "le jeu de société", "We played a thrilling board game together.", "Nous avons joué à un jeu de société palpitant ensemble."],
      ["grandparents", "/ˈɡrænpeərənts/", "Noun", "les grands-parents", "We had lunch with our grandparents.", "Nous avons déjeuné avec nos grands-parents."],
      ["countryside", "/ˈkʌntrisaɪd/", "Noun", "la campagne", "A relaxing walk in the quiet countryside.", "Une promenade relaxante dans la campagne paisible."],
      ["relax", "/rɪˈlæks/", "Verb", "se détendre", "Listen to soft music to relax after school.", "Écoute de la musique douce pour te détendre après les cours."],
      ["scooter", "/ˈskuːtər/", "Noun", "la trottinette", "He rode his scooter around the park.", "Il a fait de la trottinette autour du parc."],
      ["baking", "/ˈbeɪkɪŋ/", "Noun", "la pâtisserie maison", "Baking apple pies fills the house with sweet aromas.", "Faire des tartes aux pommes embaume la maison."],
      ["visit", "/ˈvɪzɪt/", "Verb", "rendre visite à / visiter", "We visited our cousins last Saturday.", "Nous avons rendu visite à nos cousins samedi dernier."],
      ["yesterday", "/ˈjɛstərdeɪ/", "Adverb", "hier", "Yesterday was sunny and calm.", "Hier était une journée ensoleillée et calme."],
      ["weekend", "/ˌwiːkˈɛnd/", "Noun", "le week-end", "Have a wonderful relaxing weekend!", "Passe un formidable week-end de détente !"]
    ],
    dialogue: {
      title: "Raconter son week-end", setting: "Deux collégiens échangent le lundi matin à la récréation.",
      lines: [
        ["Hugo", "How was your weekend, Clara?", "Comment s'est passé ton week-end, Clara ?"],
        ["Clara", "It was great! Two days ago, we visited my grandparents in the countryside.", "C'était super ! Il y a deux jours, nous avons rendu visite à mes grands-parents à la campagne."],
        ["Hugo", "Did you play outside?", "Avez-vous joué dehors ?"],
        ["Clara", "Yes, we rode our scooters and baked a warm blackberry pie.", "Oui, nous avons fait de la trottinette et cuisiné une tarte aux mûres chaude."]
      ]
    },
    dictation: { prompt: "Two days ago, we played board games with our family.", fr: "Il y a deux jours, nous avons joué à des jeux de société en famille." },
    quiz: [
      { q: "Comment traduit-on 'Il y a trois jours' en anglais ?", opts: ["Three days ago", "There are three days", "Three days before", "Since three days"], a: 0, exp: "La durée suivie de 'ago' exprime le temps écoulé depuis le passé." },
      { q: "Que signifie 'to sleep in' ?", opts: ["S'endormir en classe", "Faire la grasse matinée", "Faire un cauchemar", "Aller se coucher tôt"], a: 1, exp: "'To sleep in' signifie dormir plus longtemps le matin (grasse matinée)." },
      { q: "Quel est l'auxiliaire de question au prétérit simple ?", opts: ["Do", "Did", "Have", "Will"], a: 1, exp: "'Did' est l'auxiliaire pour toutes les personnes au prétérit simple." }
    ]
  },
  {
    grade: '5e', theme_id: 'travel', num: 2,
    title: 'Séjour en auberge de jeunesse',
    title_en: 'Youth Hostel & Booking',
    objective: 'Comprendre les informations pratiques d\'une auberge de jeunesse et échanger à la réception.',
    grammar: {
      title: "Les questions polies avec COULD YOU...?",
      rule: "Pour demander un service ou un renseignement à un hôte ou réceptionniste, on utilise 'Could you please + base verbale?'.",
      example_en: "Could you please give me the Wi-Fi password and my room key?",
      example_fr: "Pourriez-vous s'il vous plaît me donner le mot de passe Wi-Fi et la clé de ma chambre ?",
      tip: "COULD est plus doux et formel que CAN.",
      level_focus: "Modal COULD de politesse, vocabulaire de l'hébergement de voyage."
    },
    vocab: [
      ["youth hostel", "/juːθ ˈhɒstl/", "Noun", "l'auberge de jeunesse", "Stay at an eco-friendly youth hostel.", "Séjourne dans une auberge de jeunesse éco-responsable."],
      ["dormitory", "/ˈdɔːrmətɔːri/", "Noun", "le dortoir", "Our dormitory has six bunk beds.", "Notre dortoir a six lits superposés."],
      ["bunk bed", "/bʌŋk bɛd/", "Noun", "le lit superposé", "I sleep on the top bunk bed.", "Je dors sur le lit superposé du haut."],
      ["reception", "/rɪˈsɛpʃn/", "Noun", "l'accueil / la réception", "Ask the receptionist at the front desk.", "Demande au réceptionniste à l'accueil."],
      ["key card", "/kiː kɑːrd/", "Noun", "la carte d'accès magnétique", "Tap your key card to unlock the door.", "Passe ta carte d'accès pour déverrouiller la porte."],
      ["locker", "/ˈlɒkər/", "Noun", "le casier sécurisé", "Put your valuables inside the locker.", "Mets tes objets précieux dans le casier."],
      ["check-in", "/ˈtʃɛkɪn/", "Noun", "l'enregistrement des arrivées", "Check-in begins at two in the afternoon.", "L'enregistrement commence à quatorze heures."],
      ["breakfast included", "/ˈbrɛkfəst ɪnˈkluːdɪd/", "Phrase", "petit-déjeuner inclus", "Is continental breakfast included?", "Le petit-déjeuner continental est-il inclus ?"],
      ["common room", "/ˈkɒmən ruːm/", "Noun", "la salle commune", "Travellers share travel tips in the common room.", "Les voyageurs échangent des conseils dans la salle commune."],
      ["padlock", "/ˈpædlɒk/", "Noun", "le cadenas", "Lock your bag with a four-digit padlock.", "Ferme ton sac avec un cadenas à quatre chiffres."]
    ],
    dialogue: {
      title: "Arrivée à l'auberge d'Édimbourg", setting: "Maxime s'enregistre à la réception de l'auberge.",
      lines: [
        ["Receptionist", "Welcome to Edinburgh Castle Hostel! May I have your name?", "Bienvenue à l'auberge du château d'Édimbourg ! Puis-je avoir votre nom ?"],
        ["Maxime", "Hello, my name is Maxime. I have a booking for two nights.", "Bonjour, je m'appelle Maxime. J'ai une réservation pour deux nuits."],
        ["Receptionist", "Here is your key card for room 204, top bunk. Breakfast is from 7 to 9.", "Voici votre carte pour la chambre 204, lit du haut. Le petit-déjeuner est de 7h à 9h."],
        ["Maxime", "Could you please tell me where the secure lockers are?", "Pourriez-vous s'il vous plaît me dire où sont les casiers sécurisés ?"]
      ]
    },
    dictation: { prompt: "Could you please give me the key card for my room?", fr: "Pourriez-vous s'il vous plaît me donner la carte d'accès de ma chambre ?" },
    quiz: [
      { q: "Comment appelle-t-on les lits superposés en anglais ?", opts: ["Double beds", "Bunk beds", "Sofas", "Folding chairs"], a: 1, exp: "'Bunk beds' désigne les lits superposés." },
      { q: "Que signifie 'common room' dans une auberge ?", opts: ["Le dortoir", "La salle commune / espace détente", "La cuisine privée", "Le bureau du directeur"], a: 1, exp: "La 'common room' est le salon partagé par les résidents." },
      { q: "Quel objet utilise-t-on pour verrouiller son casier ?", opts: ["A key card", "A padlock", "A pencil", "A towel"], a: 1, exp: "'Padlock' désigne le cadenas." }
    ]
  },
  {
    grade: '5e', theme_id: 'travel', num: 3,
    title: "Prendre l'avion & formalités d'aéroport",
    title_en: 'Air Travel & Airport Check-in',
    objective: "Comprendre les panneaux et instructions dans un aéroport international.",
    grammar: {
      title: "L'obligation modale avec MUST vs HAVE TO",
      rule: "Dans les règlements officiels des aéroports, on rencontre fréquemment 'must' (règle formelle) et 'have to' (contrainte pratique).",
      example_en: "All passengers must show their boarding pass and passport at the departure gate.",
      example_fr: "Tous les passagers doivent présenter leur carte d'embarquement et leur passeport à la porte d'embarquement.",
      tip: "À la sécurité : You must remove liquids and metal objects from your hand luggage.",
      level_focus: "Modaux d'obligation formelle et vocabulaire aéroportuaire international."
    },
    vocab: [
      ["airport", "/ˈɛərpɔːrt/", "Noun", "l'aéroport", "Heathrow is one of the busiest airports.", "Heathrow est l'un des aéroports les plus fréquentés."],
      ["boarding pass", "/ˈbɔːrdɪŋ pɑːs/", "Noun", "la carte d'embarquement", "Scan your boarding pass at the turnstile.", "Scannez votre carte d'embarquement au tourniquet."],
      ["departure gate", "/dɪˈpɑːrtʃər ɡeɪt/", "Noun", "la porte d'embarquement", "Flight BA302 is boarding at gate 14.", "Le vol BA302 embarque à la porte 14."],
      ["suitcase", "/ˈsuːtkeɪs/", "Noun", "la valise", "Weigh your suitcase before checking it in.", "Pesez votre valise avant de l'enregistrer."],
      ["security check", "/sɪˈkjʊərəti tʃɛk/", "Noun", "le contrôle de sécurité", "Empty your pockets at the security check.", "Videz vos poches au contrôle de sécurité."],
      ["flight attendant", "/flaɪt əˈtɛndənt/", "Noun", "le steward / l'hôtesse de l'air", "The flight attendant shows safety instructions.", "L'hôtesse de l'air montre les consignes de sécurité."],
      ["seatbelt", "/ˈsiːtbɛlt/", "Noun", "la ceinture de sécurité", "Fasten your seatbelt during takeoff.", "Attachez votre ceinture pendant le décollage."],
      ["takeoff", "/ˈteɪkɒf/", "Noun", "le décollage", "The airplane prepares for a smooth takeoff.", "L'avion se prépare pour un décollage en douceur."],
      ["landing", "/ˈlændɪŋ/", "Noun", "l'atterrissage", "We clapped after the gentle landing.", "Nous avons applaudi après l'atterrissage en douceur."],
      ["passport", "/ˈpɑːspɔːrt/", "Noun", "le passeport", "Keep your passport in a safe front pocket.", "Gardez votre passeport dans une poche sécurisée."]
    ],
    dialogue: {
      title: "À la porte d'embarquement", setting: "L'annonce d'embarquement résonne dans le terminal.",
      lines: [
        ["Announcement", "Attention passengers: Flight 405 to Dublin is now boarding at Gate 12.", "Attention passagers : le vol 405 pour Dublin embarque porte 12."],
        ["Father", "Have you got your boarding passes and passports ready?", "Avez-vous vos cartes d'embarquement et passeports prêts ?"],
        ["Emma", "Yes Dad, I have got them in my small travel bag.", "Oui Papa, je les ai dans mon petit sac de voyage."],
        ["Father", "Let's join the queue. Don't forget your carry-on luggage.", "Rejoignons la file. N'oublie pas ton bagage cabine."]
      ]
    },
    dictation: { prompt: "Passengers must show their boarding pass at gate twelve.", fr: "Les passagers doivent montrer leur carte d'embarquement à la porte douze." },
    quiz: [
      { q: "Comment dit-on 'carte d'embarquement' ?", opts: ["Train ticket", "Boarding pass", "Airport card", "Passport sheet"], a: 1, exp: "'Boarding pass' est la carte d'embarquement pour l'avion." },
      { q: "Que signifie 'takeoff' ?", opts: ["L'atterrissage", "Le décollage", "Le retard", "L'enregistrement"], a: 1, exp: "'Takeoff' désigne le décollage de l'avion." },
      { q: "Qui accueille et assiste les passagers à bord de l'avion ?", opts: ["The pilot only", "The flight attendant", "The mechanic", "The driver"], a: 1, exp: "'Flight attendant' est le terme moderne pour désigner le personnel navigant commercial." }
    ]
  },
  {
    grade: '5e', theme_id: 'history', num: 2,
    title: "L'époque Tudor & la vie au château",
    title_en: 'The Tudor Era & Castle Life',
    objective: 'Raconter des faits historiques au prétérit et comprendre l\'organisation d\'un château Tudor.',
    grammar: {
      title: "Le Prétérit des verbes d'état (WAS / WERE)",
      rule: "Le verbe BE au passé a deux formes : WAS (avec I, he, she, it) et WERE (avec you, we, they).",
      example_en: "Henry VIII was a powerful monarch and the castle banquets were extravagant.",
      example_fr: "Henri VIII était un monarque puissant et les banquets du château étaient extravagants.",
      tip: "Pour la négation : wasn't / weren't. Pour la question : Was he famous? Were they rich?",
      level_focus: "Prétérit du verbe BE (was/were), biographies historiques simples."
    },
    vocab: [
      ["reign", "/reɪn/", "Noun", "le règne", "The king's long reign brought many changes.", "Le long règne du roi apporta de nombreux changements."],
      ["crown", "/kraʊn/", "Noun", "la couronne royale", "The sparkling crown was made of solid gold.", "La couronne étincelante était faite d'or massif."],
      ["knight", "/naɪt/", "Noun", "le chevalier", "The brave knight defended the fortress.", "Le brave chevalier défendit la forteresse."],
      ["armor", "/ˈɑːrmər/", "Noun", "l'armure de fer", "Heavy iron armor protected the warrior.", "Une lourde armure de fer protégeait le guerrier."],
      ["banquet", "/ˈbæŋkwɪt/", "Noun", "le banquet royal", "Music and roasted meats filled the royal banquet.", "Musique et viandes rôties garnissaient le banquet royal."],
      ["fortress", "/ˈfɔːrtrəs/", "Noun", "la forteresse", "High stone walls surrounded the fortress.", "De hauts murs de pierre entouraient la forteresse."],
      ["archery", "/ˈɑːrtʃəri/", "Noun", "le tir à l'arc", "Yeomen practiced archery every weekend.", "Les archers s'exerçaient au tir à l'arc tous les week-ends."],
      ["courtier", "/ˈkɔːrtiər/", "Noun", "le courtisan", "Courtiers wore magnificent velvet clothes.", "Les courtisans portaient de magnifiques habits de velours."],
      ["joust", "/dʒaʊst/", "Noun", "la joute de chevalerie", "Spectators cheered during the equestrian joust.", "Les spectateurs acclamaient lors de la joute équestre."],
      ["monarch", "/ˈmɒnərk/", "Noun", "le monarque / souverain", "Queen Elizabeth I was a revered monarch.", "La reine Élisabeth Ière était un monarque vénéré."]
    ],
    dialogue: {
      title: "Visite du château de Hampton Court", setting: "Des élèves découvrent la grande salle d'Henri VIII.",
      lines: [
        ["Guide", "Welcome to Hampton Court Palace, built during the Tudor era.", "Bienvenue au palais de Hampton Court, bâti sous les Tudor."],
        ["Pupil", "Was King Henry VIII living in this grand hall?", "Le roi Henri VIII vivait-il dans cette grande salle ?"],
        ["Guide", "Yes, he was! Banquets were held here with hundreds of guests.", "Oui ! Des banquets s'y tenaient avec des centaines d'invités."],
        ["Pupil", "The tapestries on the stone walls are breathtaking.", "Les tapisseries sur les murs de pierre sont époustouflantes."]
      ]
    },
    dictation: { prompt: "King Henry VIII was a famous English monarch.", fr: "Le roi Henri VIII était un souverain anglais célèbre." },
    quiz: [
      { q: "Quelle forme de BE utilise-t-on avec 'they' au prétérit ?", opts: ["was", "were", "are", "been"], a: 1, exp: "Au prétérit, 'they' s'accorde avec 'were'." },
      { q: "Comment se prononce le 'k' dans le mot 'knight' (chevalier) ?", opts: ["Il se prononce nettement.", "Il est muet (silent k).", "Il se prononce 'ch'.", "Il se prononce 's'."], a: 1, exp: "Le 'k' est muet dans 'knight', qui se prononce /naɪt/ comme 'night'." },
      { q: "Que signifie 'crown' ?", opts: ["L'épée", "La couronne", "Le bouclier", "Le trône"], a: 1, exp: "'Crown' est la couronne royale." }
    ]
  },
  {
    grade: '5e', theme_id: 'history', num: 3,
    title: 'Les grands explorateurs & la navigation',
    title_en: 'Great Explorers & Ocean Voyages',
    objective: 'Décrire les grandes découvertes maritimes au prétérit avec les verbes d\'action.',
    grammar: {
      title: "La forme interrogative et négative du prétérit avec DID / DIDN'T",
      rule: "À l'interrogatif et au négatif du prétérit, le verbe principal revient à sa BASE VERBALE sans -ed : Did he discover...? He didn't know...",
      example_en: "Did Francis Drake sail across the Pacific Ocean? - Yes, he sailed around the world.",
      example_fr: "Francis Drake a-t-il navigué à travers l'océan Pacifique ? - Oui, il a fait le tour du monde.",
      tip: "Erreur courante à éviter : Ne dites JAMAIS 'Did he discovered', mais 'Did he discover'.",
      level_focus: "Auxiliaire DID au passé, base verbale invariable."
    },
    vocab: [
      ["explorer", "/ɪkˈsplɔːrər/", "Noun", "l'explorateur", "Famous explorers mapped uncharted waters.", "De célèbres explorateurs cartographièrent des eaux inconnues."],
      ["voyage", "/ˈvɔɪɪdʒ/", "Noun", "le grand voyage en mer", "Their ocean voyage lasted over three months.", "Leur voyage océanique dura plus de trois mois."],
      ["sail", "/seɪl/", "Verb", "naviguer à la voile", "They sailed across dangerous stormy seas.", "Ils naviguèrent à travers des mers orageuses."],
      ["compass", "/ˈkʌmpəs/", "Noun", "la boussole", "The magnetic compass guided the navigator.", "La boussole magnétique guida le navigateur."],
      ["shipwreck", "/ˈʃɪprɛk/", "Noun", "le naufrage / l'épave", "Divers discovered gold in the old shipwreck.", "Des plongeurs découvrirent de l'or dans l'ancienne épave."],
      ["harbour", "/ˈhɑːrbər/", "Noun", "le port maritime", "The fleet anchored safely in Plymouth harbour.", "La flotte mouilla en sécurité dans le port de Plymouth."],
      ["island", "/ˈaɪlənd/", "Noun", "l'île", "They sighted a tropical island at sunrise.", "Ils aperçurent une île tropicale au lever du soleil."],
      ["crew", "/kruː/", "Noun", "l'équipage de marins", "The brave crew survived bitter cold storms.", "Le courageux équipage survécut aux tempêtes glaciales."],
      ["discover", "/dɪˈskʌvər/", "Verb", "découvrir", "Navigators discovered unknown coastlines.", "Les navigateurs découvrirent des côtes inconnues."],
      ["map", "/mæp/", "Noun", "la carte géographique", "Draw a parchment map with sea monsters.", "Dessine une carte sur parchemin avec des monstres marins."]
    ],
    dialogue: {
      title: "En cours d'histoire navale", setting: "Des élèves examinent une maquette de caravelle anglaise.",
      lines: [
        ["Teacher", "Did you know that Drake's ship was named the Golden Hind?", "Saviez-vous que le navire de Drake s'appelait le Golden Hind ?"],
        ["Student", "Did they have GPS systems in the sixteenth century?", "Avaient-ils des systèmes GPS au seizième siècle ?"],
        ["Teacher", "No, they didn't! They used compasses and star positions.", "Non ! Ils utilisaient des boussoles et la position des étoiles."],
        ["Student", "Their long voyages required immense bravery.", "Leurs longs voyages demandaient un immense courage."]
      ]
    },
    dictation: { prompt: "The explorers sailed across the ocean with a compass.", fr: "Les explorateurs ont navigué à travers l'océan avec une boussole." },
    quiz: [
      { q: "Quelle question au prétérit est correcte ?", opts: ["Did he discovered the island?", "Did he discover the island?", "Did he discovers the island?", "Discovered he the island?"], a: 1, exp: "Après l'auxiliaire 'Did', le verbe se met à la base verbale 'discover'." },
      { q: "Comment se prononce la lettre 's' dans 'island' (l'île) ?", opts: ["Elle est prononcée comme 'z'.", "Elle est muette (silent s).", "Elle se prononce 'sh'.", "Elle s'articule comme 'ss'."], a: 1, exp: "Le 's' de 'island' est muet : on prononce /ˈaɪlənd/." },
      { q: "Que désigne le mot 'crew' sur un bateau ?", opts: ["Le gouvernail", "L'équipage", "Le mât", "L'ancre"], a: 1, exp: "'Crew' désigne l'équipage." }
    ]
  },
  {
    grade: '5e', theme_id: 'hobbies', num: 2,
    title: 'La photographie & album de souvenirs',
    title_en: 'Photography & Photo Memories',
    objective: 'Parler de ses photos, cadrages et souvenirs avec les pronoms relatifs WHO et WHICH.',
    grammar: {
      title: "Les pronoms relatifs WHO (personnes) et WHICH / THAT (objets)",
      rule: "On utilise 'WHO' pour faire référence à une personne, et 'WHICH' ou 'THAT' pour un animal, un objet ou une chose.",
      example_en: "This is the photographer who captured the sunset which was golden.",
      example_fr: "Voici le photographe qui a capturé le coucher de soleil qui était doré.",
      tip: "The girl WHO smiled / The camera WHICH took the photo.",
      level_focus: "Pronoms relatifs de base (who, which, that)."
    },
    vocab: [
      ["camera", "/ˈkæmərə/", "Noun", "l'appareil photo", "Adjust the focus on your camera lens.", "Ajuste la mise au point sur l'objectif de ton appareil."],
      ["lens", "/lɛnz/", "Noun", "l'objectif photographique", "A wide-angle lens captures panoramic views.", "Un objectif grand angle capture des vues panoramiques."],
      ["snapshot", "/ˈsnæpʃɒt/", "Noun", "l'instantané / le cliché rapide", "Take a candid snapshot of your friends.", "Prends un cliché spontané de tes amis."],
      ["portrait", "/ˈpɔːrtrət/", "Noun", "le portrait", "A black-and-white portrait has strong contrast.", "Un portrait en noir et blanc a un fort contraste."],
      ["landscape", "/ˈlændskeɪp/", "Noun", "le paysage", "She loves capturing mountain landscapes.", "Elle adore photographier des paysages montagneux."],
      ["album", "/ˈælbəm/", "Noun", "l'album photo", "We keep printed photos in a family album.", "Nous gardons des photos imprimées dans un album de famille."],
      ["flash", "/flæʃ/", "Noun", "le flash", "Turn off the flash inside the art gallery.", "Éteins le flash à l'intérieur de la galerie d'art."],
      ["zoom in", "/zuːm ɪn/", "Phrasal verb", "zoomer / agrandir", "Zoom in to see the details of the butterfly.", "Zoome pour voir les détails du papillon."],
      ["memory", "/ˈmɛməri/", "Noun", "le souvenir", "Photos bring back happy summer memories.", "Les photos rappellent de joyeux souvenirs d'été."],
      ["capture", "/ˈkæptʃər/", "Verb", "capturer / immortaliser", "Capture the authentic smile of children.", "Immortalise le sourire authentique des enfants."]
    ],
    dialogue: {
      title: "Regarder l'album de voyage", setting: "Léo et Nina regardent des photos de leurs vacances.",
      lines: [
        ["Nina", "Look at this snapshot! Who is the person holding the camera?", "Regarde ce cliché ! Qui est la personne qui tient l'appareil ?"],
        ["Léo", "That is my uncle who teaches digital photography.", "C'est mon oncle qui enseigne la photographie numérique."],
        ["Nina", "And what is that mountain which appears in the background?", "Et quelle est cette montagne qui apparaît en arrière-plan ?"],
        ["Léo", "It is Ben Nevis, which we climbed last August.", "C'est le Ben Nevis, que nous avons gravi en août dernier."]
      ]
    },
    dictation: { prompt: "This is the photograph which won first prize.", fr: "Voici la photographie qui a remporté le premier prix." },
    quiz: [
      { q: "Quel pronom relatif utilise-t-on pour une personne ?", opts: ["Which", "Who", "Where", "When"], a: 1, exp: "'Who' s'emploie exclusivement pour référer à des êtres humains." },
      { q: "Quel pronom relatif utilise-t-on pour un paysage ou un objet ?", opts: ["Who", "Which", "Whom", "Whose"], a: 1, exp: "'Which' (ou 'that') s'emploie pour les choses, objets et animaux." },
      { q: "Que signifie 'to zoom in' ?", opts: ["Éloigner la vue", "Agrandir / zoomer", "Prendre une vidéo", "Supprimer"], a: 1, exp: "'Zoom in' signifie agrandir le cadrage sur un sujet." }
    ]
  },
  {
    grade: '5e', theme_id: 'hobbies', num: 3,
    title: "Les jeux vidéo d'aventure & stratégie",
    title_en: 'Adventure & Strategy Video Games',
    objective: 'Parler de ses univers de jeux vidéo préférés et comparer les styles avec les comparatifs.',
    grammar: {
      title: "Le comparatif de supériorité des adjectifs courts et longs",
      rule: "Adjectifs courts (1 syllabe) : adjectif + -ER + THAN (faster than). Adjectifs longs (2+ syllabes) : MORE + adjectif + THAN (more exciting than).",
      example_en: "This strategy game is more difficult than action games, but the graphics are better.",
      example_fr: "Ce jeu de stratégie est plus difficile que les jeux d'action, mais les graphismes sont meilleurs.",
      tip: "Exceptions à retenir par cœur : good -> better, bad -> worse.",
      level_focus: "Comparatif de supériorité (short adj-er than / more long adj than)."
    },
    vocab: [
      ["controller", "/kənˈtroʊlər/", "Noun", "la manette de jeu", "Hold the wireless controller comfortably.", "Tiens la manette sans fil confortablement."],
      ["quest", "/kwɛst/", "Noun", "la quête / mission", "Complete the medieval quest to earn gems.", "Termine la quête médiévale pour gagner des gemmes."],
      ["avatar", "/ˈævətɑːr/", "Noun", "l'avatar / le personnage virtuel", "Customize your avatar with a blue cape.", "Personnalise ton avatar avec une cape bleue."],
      ["multiplayer", "/ˈmʌltipleɪər/", "Adjective", "multijoueur", "Team up with friends in multiplayer mode.", "Fais équipe avec tes amis en mode multijoueur."],
      ["strategy", "/ˈstrætədʒi/", "Noun", "la stratégie", "Plan your defense with clever strategy.", "Planifie ta défense avec une stratégie habile."],
      ["graphics", "/ˈɡræfɪks/", "Noun", "les graphismes", "The 3D graphics look realistic.", "Les graphismes 3D ont l'air réalistes."],
      ["level up", "/ˈlɛvl ʌp/", "Phrasal verb", "passer au niveau supérieur", "Defeat the boss to level up.", "Bats le boss pour passer au niveau supérieur."],
      ["screen time", "/skriːn taɪm/", "Noun", "le temps d'écran", "Balance video games with outdoor screen time limits.", "Équilibre les jeux vidéo avec des limites de temps d'écran."],
      ["challenge", "/ˈtʃælɪndʒ/", "Noun", "le défi / le challenge", "This puzzle level is a real brain challenge.", "Ce niveau d'énigme est un vrai défi intellectuel."],
      ["exciting", "/ɪkˈsaɪtɪŋ/", "Adjective", "palpitant / captivant", "The final space battle is exciting.", "La bataille spatiale finale est palpitante."]
    ],
    dialogue: {
      title: "Choisir un jeu en coopération", setting: "Lucas et Thomas choisissent une partie en ligne.",
      lines: [
        ["Lucas", "Do you prefer fantasy adventure or space strategy games?", "Préfères-tu les jeux d'aventure médiévale ou de stratégie spatiale ?"],
        ["Thomas", "I think strategy games are more exciting than simple racing games.", "Je trouve que les jeux de stratégie sont plus captivants que les jeux de course."],
        ["Lucas", "Me too! And playing in multiplayer is much faster when we cooperate.", "Moi aussi ! Et jouer en multijoueur est bien plus rapide quand on coopère."],
        ["Thomas", "Let's connect our controllers and start the quest!", "Connectons nos manettes et lançons la quête !"]
      ]
    },
    dictation: { prompt: "This adventure game is more exciting than racing.", fr: "Ce jeu d'aventure est plus palpitant que la course." },
    quiz: [
      { q: "Quel est le comparatif de l'adjectif long 'exciting' ?", opts: ["Excitinger than", "More exciting than", "Most exciting", "As exciting than"], a: 1, exp: "Pour les adjectifs de 2 syllabes ou plus, on utilise 'more + adj + than'." },
      { q: "Quel est le comparatif irrégulier de 'good' ?", opts: ["Gooder", "Better", "Best", "More good"], a: 1, exp: "Le comparatif de supériorité de 'good' est 'better'." },
      { q: "Que signifie 'to level up' ?", opts: ["Perdre la partie", "Monter de niveau", "Éteindre la console", "Changer de manette"], a: 1, exp: "'To level up' signifie progresser au niveau supérieur." }
    ]
  },
  {
    grade: '5e', theme_id: 'sport', num: 2,
    title: 'Le football & les règles de match',
    title_en: 'Football Tactics & Fair Play',
    objective: 'Expliquer les règles du football et décrire un match au prétérit.',
    grammar: {
      title: "La voix passive simple au présent (is/are + participe passé)",
      rule: "Pour décrire une règle sportive générale, on emploie souvent le passif : The yellow card is given by the referee.",
      example_en: "A penalty is awarded when a foul is committed inside the box.",
      example_fr: "Un penalty est accordé lorsqu'une faute est commise dans la surface.",
      tip: "Structure : sujet + BE (is/are) + participe passé en -ed ou irrégulier.",
      level_focus: "Initiation à la voix passive pour énoncer des règles sportives."
    },
    vocab: [
      ["referee", "/ˌrɛfəˈriː/", "Noun", "l'arbitre", "The referee blows the whistle to start the match.", "L'arbitre siffle pour lancer le match."],
      ["goalpost", "/ˈɡoʊlpoʊst/", "Noun", "le poteau de but", "The ball bounced off the left goalpost.", "Le ballon a rebondi sur le poteau de but gauche."],
      ["penalty", "/ˈpɛnəlti/", "Noun", "le penalty", "He scored the decisive penalty kick.", "Il a marqué le tir de penalty décisif."],
      ["offside", "/ˌɒfˈsaɪd/", "Noun", "le hors-jeu", "The goal was cancelled because of an offside.", "Le but a été annulé en raison d'un hors-jeu."],
      ["striker", "/ˈstraɪkər/", "Noun", "l'attaquant / le buteur", "The nimble striker sprinted towards the net.", "L'attaquant agile a sprinté vers les filets."],
      ["goalkeeper", "/ˈɡoʊlkiːpər/", "Noun", "le gardien de but", "The goalkeeper made an acrobatic save.", "Le gardien de but a réalisé un arrêt acrobatique."],
      ["pitch", "/pɪtʃ/", "Noun", "le terrain de football en herbe", "Players entered the green football pitch.", "Les joueurs sont entrés sur le terrain en herbe."],
      ["fair play", "/fɛər pleɪ/", "Noun", "le fair-play / respect mutuel", "Fair play is the heart of sporting spirit.", "Le fair-play est le cœur de l'esprit sportif."],
      ["foul", "/faʊl/", "Noun", "la faute de jeu", "The referee whistled a foul near the midfield.", "L'arbitre a sifflé une faute près du milieu de terrain."],
      ["trophy", "/ˈtroʊfi/", "Noun", "le trophée / la coupe", "The captain lifted the championship trophy.", "Le capitaine a soulevé le trophée du championnat."]
    ],
    dialogue: {
      title: "Analyse après le match de collège", setting: "Deux joueurs commentent la finale inter-classes.",
      lines: [
        ["Sam", "What an intense match! Did you see our goalkeeper's save?", "Quel match intense ! As-tu vu l'arrêt de notre gardien ?"],
        ["Liam", "Yes, he stopped the penalty kick in the final minute!", "Oui, il a arrêté le penalty à la dernière minute !"],
        ["Sam", "And the referee was very fair throughout the whole game.", "Et l'arbitre a été très juste tout au long de la rencontre."],
        ["Liam", "Our team deserved to lift that shiny trophy.", "Notre équipe méritait de soulever ce beau trophée."]
      ]
    },
    dictation: { prompt: "The goalkeeper stopped the ball with two hands.", fr: "Le gardien de but a arrêté le ballon des deux mains." },
    quiz: [
      { q: "Comment appelle-t-on le terrain de football en anglais britannique ?", opts: ["The court", "The pitch", "The ring", "The lane"], a: 1, exp: "Au Royaume-Uni, le terrain de football se dit 'the pitch'." },
      { q: "Qui fait respecter les règles pendant un match de football ?", opts: ["The referee", "The coach", "The manager", "The striker"], a: 0, exp: "'The referee' est l'arbitre de la rencontre." },
      { q: "Que signifie 'fair play' ?", opts: ["Jouer brutalement", "Le respect des règles et de l'adversaire", "Arrêter le jeu", "Marquer un but"], a: 1, exp: "Le 'fair play' est l'esprit de loyauté et de respect mutuel dans le sport." }
    ]
  },
  {
    grade: '5e', theme_id: 'sport', num: 3,
    title: 'La natation & les sports nautiques',
    title_en: 'Swimming & Water Sports',
    objective: 'Parler de styles de nage, de sécurité aquatique et de plongée.',
    grammar: {
      title: "Le superlatif de supériorité (the -est / the most)",
      rule: "Pour désigner le record ou le degré maximal : The + adjectif court + -EST (the fastest) ou The MOST + adjectif long (the most difficult).",
      example_en: "Freestyle is the fastest swimming stroke, but butterfly is the most demanding.",
      example_fr: "Le crawl est la nage la plus rapide, mais le papillon est la plus exigeante.",
      tip: "N'oubliez jamais 'THE' devant le superlatif (the best, the tallest, the most popular).",
      level_focus: "Superlatifs de supériorité réguliers et irréguliers."
    },
    vocab: [
      ["swimming pool", "/ˈswɪmɪŋ puːl/", "Noun", "la piscine", "The heated indoor swimming pool is open.", "La piscine intérieure chauffée est ouverte."],
      ["goggles", "/ˈɡɒɡlz/", "Noun", "les lunettes de natation", "Adjust your watertight swimming goggles.", "Ajuste tes lunettes de natation étanches."],
      ["swimsuit", "/ˈswɪmsuːt/", "Noun", "le maillot de bain", "Rinse your swimsuit in cold water.", "Rince ton maillot de bain à l'eau froide."],
      ["stroke", "/stroʊk/", "Noun", "la nage / le mouvement de bras", "Breaststroke is an easy stroke to master.", "La brasse est une nage facile à maîtriser."],
      ["freestyle", "/ˈfriːstaɪl/", "Noun", "le crawl / nage libre", "He swam one hundred metres freestyle.", "Il a nagé cent mètres en nage libre."],
      ["dive", "/daɪv/", "Verb", "plonger", "Do not dive in the shallow end of the pool.", "Ne plongez pas dans le petit bain."],
      ["lifeguard", "/ˈlaɪfɡɑːrd/", "Noun", "le maître-nageur / sauveteur", "The watchful lifeguard monitors every swimmer.", "Le maître-nageur vigilant surveille chaque nageur."],
      ["lane", "/leɪn/", "Noun", "la ligne d'eau / le couloir", "Stay on the right side of the swimming lane.", "Reste sur le côté droit du couloir de nage."],
      ["shallow", "/ˈʃæloʊ/", "Adjective", "peu profond (petit bain)", "Young children paddle in the shallow water.", "Les jeunes enfants barbotent dans l'eau peu profonde."],
      ["deep", "/diːp/", "Adjective", "profond (grand bain)", "The diving board is located in the deep pool.", "Le plongeoir est situé dans le grand bain."]
    ],
    dialogue: {
      title: "Séance à la piscine municipale", setting: "Le maître-nageur accueille un groupe d'élèves.",
      lines: [
        ["Lifeguard", "Put on your goggles and swim cap before entering the water.", "Mettez vos lunettes et bonnets de bain avant d'entrer dans l'eau."],
        ["Pupil", "Which lane is reserved for 50-metre freestyle practice?", "Quelle ligne est réservée pour l'entraînement au crawl sur 50 mètres ?"],
        ["Lifeguard", "Lane three is for fast swimmers; lane four is for breaststroke.", "La ligne trois est pour les nageurs rapides ; la ligne quatre pour la brasse."],
        ["Pupil", "Thank you! Remember to never dive in the shallow end.", "Merci ! Rappelons-nous de ne jamais plonger dans le petit bain."]
      ]
    },
    dictation: { prompt: "Freestyle is the fastest stroke in the swimming pool.", fr: "Le crawl est la nage la plus rapide dans la piscine." },
    quiz: [
      { q: "Quel est le superlatif de l'adjectif 'fast' ?", opts: ["Faster", "The fastest", "Most fast", "As fast"], a: 1, exp: "Le superlatif d'un adjectif court prend 'the' et la terminaison '-est' : the fastest." },
      { q: "Que signifie 'lifeguard' ?", opts: ["Un nageur", "Un maître-nageur sauveteur", "Un moniteur de ski", "Un arbitre"], a: 1, exp: "'Lifeguard' est le sauveteur ou maître-nageur." },
      { q: "Comment dit-on 'le petit bain' (eau peu profonde) ?", opts: ["The deep end", "The shallow end", "The cold bath", "The wave pool"], a: 1, exp: "'The shallow end' désigne le bassin peu profond." }
    ]
  },
  {
    grade: '5e', theme_id: 'music', num: 2,
    title: 'Les comédies musicales & spectacles vivants',
    title_en: 'Musicals & West End Shows',
    objective: 'Parler de comédies musicales célèbres (London West End, Broadway) et des métiers de scène.',
    grammar: {
      title: "L'adverbe de manière en -LY",
      rule: "Pour décrire comment une action est accomplie, on forme l'adverbe en ajoutant -LY à l'adjectif : beautiful -> beautifully, passionate -> passionately.",
      example_en: "The actors sang wonderfully and danced gracefully across the West End stage.",
      example_fr: "Les comédiens ont chanté merveilleusement et ont dansé avec grâce sur la scène du West End.",
      tip: "Exception courante : good devient WELL (She sings well).",
      level_focus: "Formation et emploi des adverbes de manière en -ly."
    },
    vocab: [
      ["musical", "/ˈmjuːzɪkl/", "Noun", "la comédie musicale", "The Lion King is an iconic West End musical.", "Le Roi Lion est une comédie musicale emblématique du West End."],
      ["stage", "/steɪdʒ/", "Noun", "la scène de spectacle", "Dancers moved gracefully onto the stage.", "Les danseurs sont montés sur scène avec grâce."],
      ["costume", "/ˈkɒstjuːm/", "Noun", "le costume de scène", "Handmade costumes glittered under spotlights.", "Des costumes faits main étincelaient sous les projecteurs."],
      ["spotlight", "/ˈspɒtlaɪt/", "Noun", "le projecteur de scène", "The bright spotlight followed the solo singer.", "Le projecteur lumineux a suivi la chanteuse solo."],
      ["curtain", "/ˈkɜːrtn/", "Noun", "le rideau de théâtre", "The heavy velvet curtain rose slowly.", "Le lourd rideau de velours s'est levé lentement."],
      ["applaud", "/əˈplɔːd/", "Verb", "applaudir", "The entire theatre applauded standing up.", "Le théâtre entier a applaudi debout."],
      ["orchestra", "/ˈɔːrkɪstrə/", "Noun", "l'orchestre", "The live orchestra plays in the pit.", "L'orchestre en direct joue dans la fosse."],
      ["ticket", "/ˈtɪkɪt/", "Noun", "le billet de théâtre", "Book your musical tickets weeks in advance.", "Réservez vos billets de comédie musicale des semaines à l'avance."],
      ["performer", "/pərˈfɔːrmər/", "Noun", "l'artiste / l'interprète de scène", "Talented performers rehearse five days a week.", "Des artistes talentueux répètent cinq jours par semaine."],
      ["applause", "/əˈplɔːz/", "Noun", "les ovations / applaudissements", "Thunderous applause echoed through the hall.", "Des applaudissements nourris ont résonné dans la salle."]
    ],
    dialogue: {
      title: "Sortie au West End londonien", setting: "Sarah et son père sortent d'un spectacle à Covent Garden.",
      lines: [
        ["Sarah", "That musical was absolutely magnificent, Dad!", "Cette comédie musicale était absolument magnifique, Papa !"],
        ["Father", "The actors performed brilliantly and the orchestra played so well.", "Les comédiens ont joué brillamment et l'orchestre a si bien joué."],
        ["Sarah", "Did you see how the costumes sparkled under the spotlight?", "As-tu vu comme les costumes scintillaient sous les projecteurs ?"],
        ["Father", "Yes! The entire audience stood up to applaud at the end.", "Oui ! Tout le public s'est levé pour applaudir à la fin."]
      ]
    },
    dictation: { prompt: "The performers danced gracefully on the theatre stage.", fr: "Les artistes ont dansé avec grâce sur la scène du théâtre." },
    quiz: [
      { q: "Quel est l'adverbe de manière correspondant à 'graceful' ?", opts: ["Grace", "Gracefully", "Gracious", "Graceous"], a: 1, exp: "On forme l'adverbe régulier en ajoutant -ly : graceful -> gracefully." },
      { q: "Quel célèbre quartier de Londres est réputé mondialement pour ses comédies musicales ?", opts: ["The West End", "Wall Street", "The Bronx", "Camden Lock"], a: 0, exp: "Le West End de Londres est la capitale européenne des comédies musicales." },
      { q: "Quel est l'adverbe correspondant à 'good' ?", opts: ["Goodly", "Well", "Better", "Best"], a: 1, exp: "'Well' est l'adverbe irrégulier de 'good' (He plays well)." }
    ]
  },
  {
    grade: '5e', theme_id: 'music', num: 3,
    title: 'Les styles musicaux autour du globe',
    title_en: 'World Music & Styles',
    objective: 'Découvrir la diversité des genres musicaux (reggae, folk, jazz, pop) et exprimer des comparaisons.',
    grammar: {
      title: "Les comparatifs d'égalité avec AS... AS",
      rule: "Pour dire que deux choses sont équivalentes ou ont le même degré, on utilise la structure : AS + adjectif + AS.",
      example_en: "Acoustic folk music is as calming as gentle rain.",
      example_fr: "La musique folk acoustique est aussi apaisante qu'une douce pluie.",
      tip: "À la forme négative : NOT AS... AS (Ce morceau n'est pas aussi rapide : not as fast as).",
      level_focus: "Comparatif d'égalité (as... as) et d'inégalité (not as... as)."
    },
    vocab: [
      ["genre", "/ˈʒɒnrə/", "Noun", "le genre musical", "What musical genre do you listen to most?", "Quel genre musical écoutes-tu le plus ?"],
      ["reggae", "/ˈrɛɡeɪ/", "Noun", "le reggae", "Bob Marley made Jamaican reggae world-famous.", "Bob Marley a rendu le reggae jamaïcain célèbre dans le monde entier."],
      ["folk", "/foʊk/", "Noun", "la musique folk / traditionnelle", "Folk songs tell stories of ordinary people.", "Les chansons folk racontent la vie des gens simples."],
      ["rhythm", "/ˈrɪðəm/", "Noun", "le rythme musical", "The syncopated rhythm makes everyone move.", "Le rythme syncopé fait bouger tout le monde."],
      ["bass", "/beɪs/", "Noun", "la basse", "Feel the deep bass vibrations through the floor.", "Ressens les profondes vibrations de basse à travers le sol."],
      ["percussion", "/pərˈkʌʃn/", "Noun", "les percussions", "African drums bring energetic percussion.", "Les tambours africains apportent des percussions énergiques."],
      ["traditional", "/trəˈdɪʃənl/", "Adjective", "traditionnel", "Bagpipes are traditional Scottish instruments.", "Les cornemuses sont des instruments traditionnels écossais."],
      ["energetic", "/ˌɛnərˈdʒɛtɪk/", "Adjective", "énergique / dynamique", "Latin samba music is wonderfully energetic.", "La samba latino est merveilleusement dynamique."],
      ["instrument", "/ˈɪnstrəmənt/", "Noun", "l'instrument de musique", "Learn to play an acoustic instrument.", "Apprends à jouer d'un instrument acoustique."],
      ["harmonious", "/hɑːrˈmoʊniəs/", "Adjective", "harmonieux", "The choir blended into a harmonious sound.", "La chorale s'est fondue en un son harmonieux."]
    ],
    dialogue: {
      title: "Découverte des musiques du monde", setting: "En cours d'éducation musicale, deux collégiens écoutent des extraits.",
      lines: [
        ["Teacher", "Listen to this track from Kingston, Jamaica. Which genre is it?", "Écoutez ce morceau de Kingston en Jamaïque. De quel genre s'agit-il ?"],
        ["Emma", "It is reggae! The guitar rhythm is very recognizable.", "C'est du reggae ! Le rythme de guitare est très reconnaissable."],
        ["Julien", "Is folk music as energetic as reggae?", "La musique folk est-elle aussi énergique que le reggae ?"],
        ["Teacher", "Folk is often softer, but both share deep roots in storytelling.", "Le folk est souvent plus doux, mais tous deux racontent de grandes histoires."]
      ]
    },
    dictation: { prompt: "This traditional song is as lively as modern pop music.", fr: "Cette chanson traditionnelle est aussi entraînante que la musique pop moderne." },
    quiz: [
      { q: "Quelle structure exprime l'égalité entre deux éléments ?", opts: ["More ... than", "As ... as", "The most ...", "Like ... as"], a: 1, exp: "'As + adjectif + as' exprime la stricte équivalence ou comparaison égale." },
      { q: "D'où est originaire le style musical reggae ?", opts: ["D'Australie", "De Jamaïque", "D'Écosse", "Du Canada"], a: 1, exp: "Le reggae est né en Jamaïque dans les Caraïbes." },
      { q: "Comment se prononce le mot 'bass' (guitare basse) ?", opts: ["/bæs/", "/beɪs/", "/bɑːs/", "/bʊs/"], a: 1, exp: "'Bass' en musique se prononce /beɪs/ (riment avec 'face')." }
    ]
  },
  {
    grade: '5e', theme_id: 'restaurant', num: 2,
    title: 'Le brunch du dimanche entre amis',
    title_en: 'Sunday Brunch & Pancakes',
    objective: 'Commander un repas de brunch anglo-saxon et exprimer des quantités avec MUCH et MANY.',
    grammar: {
      title: "Les quantifieurs d'indénombrables et dénombrables (MUCH vs MANY)",
      rule: "On emploie 'MANY' devant des noms dénombrables au pluriel (How many pancakes? Not many eggs). On emploie 'MUCH' devant des indénombrables (How much syrup? Not much milk).",
      example_en: "How many fluffy pancakes would you like, and how much maple syrup do you want?",
      example_fr: "Combien de pancakes moelleux aimerais-tu, et quelle quantité de sirop d'érable veux-tu ?",
      tip: "Dans les phrases affirmatives courantes, on emploie souvent 'a lot of' pour les deux !",
      level_focus: "Quantifieurs much / many / a lot of, dénombrable vs indénombrable."
    },
    vocab: [
      ["pancakes", "/ˈpænkeɪks/", "Noun", "les crêpes épaisses / pancakes", "Stack three warm pancakes on the plate.", "Empile trois pancakes chauds sur l'assiette."],
      ["maple syrup", "/ˈmeɪpl ˈsɪrəp/", "Noun", "le sirop d'érable", "Pour golden maple syrup over the pancakes.", "Verse du sirop d'érable doré sur les pancakes."],
      ["scrambled eggs", "/ˈskræmbld ɛɡz/", "Noun", "les œufs brouillés", "Creamy scrambled eggs with chives.", "Des œufs brouillés crémeux à la ciboulette."],
      ["bacon", "/ˈbeɪkən/", "Noun", "le bacon croustillant", "Crispy bacon strips sizzle in the pan.", "Des tranches de bacon croustillant crépitent dans la poêle."],
      ["brunch", "/brʌntʃ/", "Noun", "le brunch (repas combiné matin-midi)", "Sunday brunch is popular across the UK.", "Le brunch dominical est très populaire au Royaume-Uni."],
      ["toast", "/toʊst/", "Noun", "le toast grillé", "Wholemeal toast with butter and jam.", "Du toast complet avec du beurre et de la confiture."],
      ["freshly squeezed", "/ˈfrɛʃli skwiːzd/", "Adjective", "pressé frais", "A tall glass of freshly squeezed orange juice.", "Un grand verre de jus d'orange pressé frais."],
      ["delicious", "/dɪˈlɪʃəs/", "Adjective", "délicieux", "This homemade brunch is truly delicious.", "Ce brunch maison est vraiment délicieux."],
      ["berries", "/ˈbɛriz/", "Noun", "les baies / fruits rouges", "Fresh blueberries and raspberries on top.", "Des myrtilles et des framboises fraîches par-dessus."],
      ["order", "/ˈɔːrdər/", "Verb", "commander", "We are ready to order our breakfast.", "Nous sommes prêts à commander notre petit-déjeuner."]
    ],
    dialogue: {
      title: "Dans un café de Cambridge", setting: "Deux adolescents commandent leur brunch.",
      lines: [
        ["Waiter", "Good morning! How many pancakes would you like in your stack?", "Bonjour ! Combien de pancakes souhaiteriez-vous dans votre assiette ?"],
        ["Arthur", "I would like three pancakes with blueberries, please.", "J'aimerais trois pancakes avec des myrtilles, s'il vous plaît."],
        ["Waiter", "And would you like scrambled eggs with crispy bacon?", "Et souhaiteriez-vous des œufs brouillés avec du bacon croustillant ?"],
        ["Arthur", "Yes please, and not too much syrup on the side. Thank you!", "Oui s'il vous plaît, et pas trop de sirop à côté. Merci !"]
      ]
    },
    dictation: { prompt: "How many pancakes would you like with maple syrup?", fr: "Combien de pancakes aimerais-tu avec du sirop d'érable ?" },
    quiz: [
      { q: "Quel mot complète : 'How ... eggs are there in the basket?'", opts: ["much", "many", "little", "any"], a: 1, exp: "'Eggs' est dénombrable pluriel, donc on utilise 'many'." },
      { q: "Quel mot complète : 'How ... milk do you pour?'", opts: ["many", "much", "few", "any"], a: 1, exp: "'Milk' est indénombrable liquide, donc on utilise 'much'." },
      { q: "D'où vient le mot 'brunch' ?", opts: ["Du mot bread", "De la contraction de Breakfast + Lunch", "D'un village anglais", "Du mot branch"], a: 1, exp: "Le mot 'brunch' est un mot-valise combinant 'breakfast' et 'lunch'." }
    ]
  },
  {
    grade: '5e', theme_id: 'restaurant', num: 3,
    title: 'Commander à la pizzeria & saveurs italiennes',
    title_en: 'Pizzeria & Sharing Food',
    objective: 'Passer commande dans un restaurant italien et exprimer ses préférences d\'ingrédients.',
    grammar: {
      title: "Les propositions avec WOULD YOU PREFER... OR...?",
      rule: "Pour demander à quelqu'un de choisir entre deux options poliment, on emploie 'Would you prefer X or Y?'.",
      example_en: "Would you prefer a thin crispy crust or a thick stuffed crust for your pizza?",
      example_fr: "Préférerais-tu une pâte fine croustillante ou une pâte épaisse farcie pour ta pizza ?",
      tip: "Pour répondre : I would prefer / I'd prefer a thin crust.",
      level_focus: "Expression du choix et de la préférence (prefer, would rather)."
    },
    vocab: [
      ["crust", "/krʌst/", "Noun", "la croûte / pâte de pizza", "A crunchy golden crust baked in a wood-fired oven.", "Une croûte dorée croustillante cuite au feu de bois."],
      ["mozzarella", "/ˌmɒtsəˈrɛlə/", "Noun", "la mozzarella", "Melted mozzarella stretches over the slice.", "La mozzarella fondue s'étire sur la part."],
      ["toppings", "/ˈtɒpɪŋz/", "Noun", "les garnitures / ingrédients du dessus", "Choose three tasty vegetable toppings.", "Choisis trois savoureuses garnitures de légumes."],
      ["mushrooms", "/ˈmʌʃruːmz/", "Noun", "les champignons", "Fresh sliced button mushrooms on tomato sauce.", "Des champignons de Paris frais tranchés sur la sauce tomate."],
      ["basil", "/ˈbæzl/", "Noun", "le basilic frais", "Garnish the Margherita with green basil leaves.", "Garnis la pizza Margherita avec des feuilles de basilic."],
      ["slice", "/slaɪs/", "Noun", "la part / part de pizza", "Can I take another slice of pizza, please?", "Puis-je prendre une autre part de pizza, s'il te plaît ?"],
      ["bill", "/bɪl/", "Noun", "l'addition au restaurant", "Could we have the bill, please?", "Pourrions-nous avoir l'addition, s'il vous plaît ?"],
      ["tip", "/tɪp/", "Noun", "le pourboire", "Leave a generous tip for friendly service.", "Laisse un pourboire généreux pour le service sympathique."],
      ["takeaway", "/ˈteɪkəweɪ/", "Noun", "la vente à emporter", "Order two large pizzas for takeaway.", "Commande deux grandes pizzas à emporter."],
      ["share", "/ʃɛər/", "Verb", "partager", "We share a large four-cheese pizza between four friends.", "Nous partageons une grande pizza quatre fromages à quatre amis."]
    ],
    dialogue: {
      title: "À la pizzeria du quartier", setting: "Léa et Lucas commandent une pizza à partager.",
      lines: [
        ["Waiter", "Welcome! Would you prefer eating inside or on the terrace?", "Bienvenue ! Préféreriez-vous manger à l'intérieur ou en terrasse ?"],
        ["Léa", "We'd prefer a quiet table on the terrace, please.", "Nous préférerions une table calme en terrasse, s'il vous plaît."],
        ["Waiter", "Excellent. Which pizza toppings would you like to share?", "Excellent. Quelles garnitures aimeriez-vous partager ?"],
        ["Lucas", "A Margherita with extra mozzarella and fresh basil, please!", "Une Margherita avec un supplément mozzarella et du basilic frais, s'il vous plaît !"]
      ]
    },
    dictation: { prompt: "We shared a delicious pizza with melted mozzarella.", fr: "Nous avons partagé une délicieuse pizza à la mozzarella fondue." },
    quiz: [
      { q: "Comment demande-t-on poliment l'addition au Royaume-Uni ?", opts: ["Give me the money!", "Could we have the bill, please?", "Where is the ticket?", "Check the price!"], a: 1, exp: "'Could we have the bill, please?' est la formule polie britannique consacrée." },
      { q: "Que signifie 'toppings' sur une pizza ?", opts: ["La boîte en carton", "Les ingrédients de garniture", "Le couteau à roulette", "La boisson"], a: 1, exp: "'Toppings' désigne l'ensemble des ingrédients disposés sur la pizza." },
      { q: "Comment dit-on 'à emporter' en anglais britannique ?", opts: ["Eat-in", "Takeaway", "Drive-in", "Walking"], a: 1, exp: "'Takeaway' désigne les repas à emporter (aux USA, on dit 'to-go' ou 'takeout')." }
    ]
  },
  {
    grade: '5e', theme_id: 'food', num: 2,
    title: 'Le marché de producteurs & produits frais',
    title_en: "Farmers' Market & Fresh Produce",
    objective: 'Acheter des fruits et légumes au marché en utilisant les expressions de poids et prix.',
    grammar: {
      title: "Les questions de prix avec HOW MUCH IS / ARE...?",
      rule: "Pour demander le prix d'un produit : 'How much is + nom singulier?' et 'How much are + nom pluriel?'.",
      example_en: "How much is that basket of strawberries, and how much are these organic apples?",
      example_fr: "Combien coûte cette barquette de fraises, et combien coûtent ces pommes bio ?",
      tip: "Pour répondre : It is £2.50 / They are £3 a kilo.",
      level_focus: "Expressions monétaires en livres (£), unités de mesure (kilo, basket, bunch)."
    },
    vocab: [
      ["farmers' market", "/ˈfɑːrmərz ˈmɑːrkɪt/", "Noun", "le marché de producteurs locaux", "Local growers sell honey at the farmers' market.", "Des producteurs locaux vendent du miel au marché."],
      ["organic", "/ɔːrˈɡænɪk/", "Adjective", "biologique / bio", "Organic vegetables grow without harmful sprays.", "Les légumes bio poussent sans produits nocifs."],
      ["strawberries", "/ˈstrɔːbəriz/", "Noun", "les fraises", "Sweet red strawberries picked this morning.", "Des fraises rouges et sucrées cueillies ce matin."],
      ["carrots", "/ˈkærəts/", "Noun", "les carottes", "Crunchy orange carrots with green tops.", "Des carottes orange croquantes avec leurs fanes vertes."],
      ["bunch", "/bʌntʃ/", "Noun", "la botte / le bouquet / le régime", "Buy a bunch of fresh mint leaves.", "Achète une botte de feuilles de menthe fraîche."],
      ["kilo", "/ˈkiːloʊ/", "Noun", "le kilo", "Potatoes cost one pound fifty per kilo.", "Les pommes de terre coûtent 1,50 £ le kilo."],
      ["fresh produce", "/frɛʃ ˈprɒdjuːs/", "Noun", "les fruits et légumes frais", "The stall offers colourful fresh produce.", "L'étal propose des fruits et légumes frais colorés."],
      ["stall", "/stɔːl/", "Noun", "l'étal de marché", "Fresh fish and cheese are displayed on the stall.", "Du poisson frais et des fromages sont exposés sur l'étal."],
      ["price", "/praɪs/", "Noun", "le prix", "The price tag indicates three pounds.", "L'étiquette de prix indique trois livres."],
      ["weigh", "/weɪ/", "Verb", "peser", "The vendor weighs the tomatoes on the scale.", "Le marchand pèse les tomates sur la balance."]
    ],
    dialogue: {
      title: "Au marché du samedi matin", setting: "Lucas achète des fruits sur la place du marché.",
      lines: [
        ["Vendor", "Good morning young man! What can I get for you today?", "Bonjour jeune homme ! Que puis-je vous servir aujourd'hui ?"],
        ["Lucas", "How much are these organic strawberries, please?", "Combien coûtent ces fraises bio, s'il vous plaît ?"],
        ["Vendor", "They are two pounds a basket, freshly picked in Kent.", "Elles sont à deux livres la barquette, fraîchement cueillies dans le Kent."],
        ["Lucas", "I'll take two baskets and a kilo of green apples, please.", "J'en prendrai deux barquettes et un kilo de pommes vertes, s'il vous plaît."]
      ]
    },
    dictation: { prompt: "How much are these fresh organic carrots per kilo?", fr: "Combien coûtent ces carottes bio fraîches au kilo ?" },
    quiz: [
      { q: "Comment demande-t-on le prix d'un kilo de pommes au marché ?", opts: ["How many is the apples?", "How much are the apples?", "How cost the apples?", "Which price are the apples?"], a: 1, exp: "Comme 'apples' est pluriel, on demande 'How much are the apples?'." },
      { q: "Que signifie 'fresh produce' ?", opts: ["Des produits congelés", "Des fruits et légumes frais", "Des boîtes de conserve", "Des sacs en plastique"], a: 1, exp: "'Produce' (nom collectif) désigne les fruits et légumes de la terre." },
      { q: "Quel mot désigne l'étal d'un marchand sur un marché ?", opts: ["A chair", "A stall", "A ladder", "A window"], a: 1, exp: "'Stall' désigne l'étal ou le stand de marché." }
    ]
  },
  {
    grade: '5e', theme_id: 'food', num: 3,
    title: 'Lutter contre le gaspillage alimentaire',
    title_en: 'Reducing Food Waste at Home',
    objective: 'Parler de consommation responsable et de gestion des restes avec SHOULD / SHOULDN\'T.',
    grammar: {
      title: "Donner un conseil avec SHOULD et SHOULDN'T",
      rule: "On utilise 'should' pour donner un bon conseil ou une recommandation civique, et 'shouldn't' pour déconseiller une action.",
      example_en: "We should eat our leftovers and we shouldn't throw edible food away.",
      example_fr: "Nous devrions manger nos restes et nous ne devrions pas jeter de la nourriture comestible.",
      tip: "Le verbe après should/shouldn't reste toujours à la base verbale nue sans 'to'.",
      level_focus: "Modal SHOULD de conseil citoyen et écologique."
    },
    vocab: [
      ["food waste", "/fuːd weɪst/", "Noun", "le gaspillage alimentaire", "Food waste harms the planet and our wallet.", "Le gaspillage alimentaire nuit à la planète et à notre porte-monnaie."],
      ["leftovers", "/ˈlɛftˌoʊvərz/", "Noun", "les restes de repas", "Store dinner leftovers in a glass container.", "Garde les restes du dîner dans un récipient en verre."],
      ["compost", "/ˈkɒmpɒst/", "Noun", "le compost", "Fruit peelings turn into nutrient-rich compost.", "Les épluchures de fruits se transforment en compost riche."],
      ["expiration date", "/ˌɛkspəˈreɪʃn deɪt/", "Noun", "la date de péremption", "Always read the expiration date on dairy jars.", "Lis toujours la date de péremption sur les pots de produits laitiers."],
      ["throw away", "/θroʊ əˈweɪ/", "Phrasal verb", "jeter à la poubelle", "Do not throw away stale bread; make croutons.", "Ne jette pas le pain rassis ; fais des croûtons."],
      ["freeze", "/friːz/", "Verb", "congeler", "Freeze extra berries for winter smoothies.", "Congèle le surplus de baies pour des smoothies d'hiver."],
      ["portion", "/ˈpɔːrʃn/", "Noun", "la portion de nourriture", "Serve a reasonable portion on your plate.", "Sers-toi une portion raisonnable dans ton assiette."],
      ["responsible", "/rɪˈspɒnsəbl/", "Adjective", "responsable", "Be a responsible consumer at the supermarket.", "Sois un consommateur responsable au supermarché."],
      ["reuse", "/riːˈjuːz/", "Verb", "réutiliser", "Reuse glass jars to store spices.", "Réutilise les bocaux en verre pour stocker les épices."],
      ["shopping list", "/ˈʃɒpɪŋ lɪst/", "Noun", "la liste de courses", "Write a shopping list to avoid unnecessary buys.", "Rédige une liste de courses pour éviter les achats superflus."]
    ],
    dialogue: {
      title: "Planifier les repas sans gaspiller", setting: "Léa et son grand frère organisent le réfrigérateur familial.",
      lines: [
        ["Léa", "Look, there are leftover roasted vegetables from yesterday.", "Regarde, il y a des restes de légumes rôtis d'hier."],
        ["Brother", "We shouldn't throw them away. We can make a tasty soup!", "Nous ne devrions pas les jeter. Nous pouvons faire une bonne soupe !"],
        ["Léa", "Great idea! And we should also check the yogurt expiration dates.", "Super idée ! Et nous devrions aussi vérifier la date de péremption des yaourts."],
        ["Brother", "Writing a shopping list helps us buy only what we need.", "Rédiger une liste de courses nous aide à acheter seulement le nécessaire."]
      ]
    },
    dictation: { prompt: "We should eat our leftovers and reduce food waste.", fr: "Nous devrions manger nos restes et réduire le gaspillage alimentaire." },
    quiz: [
      { q: "Quel modal utilise-t-on pour donner un bon conseil éco-citoyen ?", opts: ["Must", "Should", "Will", "May"], a: 1, exp: "'Should' est le modal du conseil et de la recommandation bienveillante." },
      { q: "Que signifie 'leftovers' ?", opts: ["Les emballages", "Les restes de nourriture", "Les courses", "Les recettes"], a: 1, exp: "'Leftovers' désigne les restes d'un repas précédent." },
      { q: "Pourquoi conseille-t-on d'écrire une 'shopping list' ?", opts: ["Pour acheter plus", "Pour n'acheter que le nécessaire", "Pour perdre du temps", "Pour payer en espèces"], a: 1, exp: "Faire une liste permet d'éviter les achats impulsifs et le gaspillage." }
    ]
  },
  {
    grade: '5e', theme_id: 'work', num: 2,
    title: 'Le bureau, papeterie & organisation',
    title_en: 'Office Supplies & Getting Organized',
    objective: 'Nommer le matériel de bureau professionnel et donner des instructions claires.',
    grammar: {
      title: "Les propositions infinitives avec TELL / ASK SOMEONE TO DO SOMETHING",
      rule: "Pour rapporter une instruction de travail, on utilise 'tell/ask + personne + TO + base verbale'.",
      example_en: "The office manager asked the intern to file the documents into folders.",
      example_fr: "Le responsable de bureau a demandé au stagiaire de classer les documents dans des dossiers.",
      tip: "À la négation : asked him NOT TO do it.",
      level_focus: "Structures infinitives (ask/tell someone to do sth)."
    },
    vocab: [
      ["stapler", "/ˈsteɪplər/", "Noun", "l'agrafeuse", "Bind the report pages together with a stapler.", "Relie les pages du rapport ensemble avec une agrafeuse."],
      ["paper clip", "/ˈpeɪpər klɪp/", "Noun", "le trombone", "Attach the receipt with a metal paper clip.", "Attache le reçu avec un trombone en métal."],
      ["filing cabinet", "/ˈfaɪlɪŋ ˈkæbɪnət/", "Noun", "le classeur / meuble de classement", "Important contracts are filed in this cabinet.", "Les contrats importants sont classés dans ce meuble."],
      ["folder", "/ˈfoʊldər/", "Noun", "la chemise / le dossier", "Sort client files into colour-coded folders.", "Trie les dossiers clients dans des chemises de couleur."],
      ["sticky notes", "/ˈstɪki noʊts/", "Noun", "les notes repositionnables / post-it", "Leave a reminder on bright yellow sticky notes.", "Laisse un pense-bête sur des notes repositionnables."],
      ["desk lamp", "/dɛsk læmp/", "Noun", "la lampe de bureau", "A powerful desk lamp prevents eye strain.", "Une lampe de bureau puissante évite la fatigue oculaire."],
      ["printer", "/ˈprɪntər/", "Noun", "l'imprimante", "Refill paper into the laser printer tray.", "Recharge du papier dans le bac de l'imprimante laser."],
      ["calendar", "/ˈkælɪndər/", "Noun", "le calendrier / agenda", "Mark deadline dates on the wall calendar.", "Marque les dates limites sur le calendrier mural."],
      ["organize", "/ˈɔːrɡənaɪz/", "Verb", "organiser / classer", "Organize your workstation before heading home.", "Organise ton poste de travail avant de rentrer."],
      ["shredder", "/ˈʃrɛdər/", "Noun", "le destructeur de documents", "Destroy old confidential papers in the shredder.", "Détruis les vieux papiers confidentiels dans la déchiqueteuse."]
    ],
    dialogue: {
      title: "Premier jour au secrétariat", setting: "Une secrétaire montre l'organisation du bureau au nouveau stagiaire.",
      lines: [
        ["Manager", "Welcome, James. First, let me show you where our office supplies are.", "Bienvenue, James. D'abord, laisse-moi te montrer où sont nos fournitures."],
        ["James", "Thank you! Where can I find extra folders and paper clips?", "Merci ! Où puis-je trouver des dossiers et trombones supplémentaires ?"],
        ["Manager", "They are in the drawer next to the laser printer.", "Ils sont dans le tiroir à côté de l'imprimante laser."],
        ["James", "I will organize the invoices chronologically as requested.", "Je vais classer les factures par ordre chronologique comme demandé."]
      ]
    },
    dictation: { prompt: "The manager asked him to organize the paper folders.", fr: "Le responsable lui a demandé d'organiser les dossiers papier." },
    quiz: [
      { q: "Quelle structure est correcte pour demander une action à quelqu'un ?", opts: ["He asked me do it", "He asked me to do it", "He asked to me do it", "He asked me doing it"], a: 1, exp: "La structure anglaise exacte est 'ask someone TO do something'." },
      { q: "Que désigne un 'stapler' dans un bureau ?", opts: ["Une agrafeuse", "Une calculatrice", "Un stylo", "Une règle"], a: 0, exp: "'Stapler' est l'agrafeuse (staple = agrafe)." },
      { q: "Que signifie 'paper clip' ?", opts: ["Une feuille", "Un trombone", "Une enveloppe", "Un timbre"], a: 1, exp: "'Paper clip' est le trombone métallique." }
    ]
  },
  {
    grade: '5e', theme_id: 'work', num: 3,
    title: 'Les compétences & qualités relationnelles',
    title_en: 'Interpersonal Skills & Punctuality',
    objective: 'Décrire les qualités d\'un bon collègue ou stagiaire avec des adjectifs de personnalité.',
    grammar: {
      title: "La formation des adjectifs de caractère avec suffixes (-ful, -able, -ive)",
      rule: "De nombreux adjectifs professionnels sont dérivés de noms ou verbes : help -> helpful, rely -> reliable, cooperate -> cooperative.",
      example_en: "An apprentice must be reliable, punctual and attentive to team instructions.",
      example_fr: "Un apprenti doit être fiable, ponctuel et attentif aux consignes d'équipe.",
      tip: "Pour exprimer le contraire : unreliable, unpunctual, impolite.",
      level_focus: "Adjectifs de personnalité professionnelle et préfixes d'opposition."
    },
    vocab: [
      ["punctual", "/ˈpʌŋktʃuəl/", "Adjective", "ponctuel / à l'heure", "Always arrive five minutes early to be punctual.", "Arrive toujours cinq minutes en avance pour être ponctuel."],
      ["reliable", "/rɪˈlaɪəbl/", "Adjective", "fiable / sur qui on peut compter", "She is a reliable assistant who delivers on time.", "C'est une assistante fiable qui rend ses devoirs à l'heure."],
      ["polite", "/pəˈlaɪt/", "Adjective", "poli / courtois", "Greet customers with a polite friendly smile.", "Accueille les clients avec un sourire poli et aimable."],
      ["attentive", "/əˈtɛntɪv/", "Adjective", "attentif / à l'écoute", "Listen with an attentive mind during briefings.", "Écoute d'un esprit attentif pendant les réunions."],
      ["organized", "/ˈɔːrɡənaɪzd/", "Adjective", "organisé / méthodique", "An organized desk reflects a clear thinking mind.", "Un bureau ordonné reflète un esprit clair."],
      ["helpful", "/ˈhɛlpfl/", "Adjective", "serviable / d'une grande aide", "He is always helpful to colleagues facing trouble.", "Il est toujours serviable envers ses collègues en difficulté."],
      ["motivated", "/ˈmoʊtɪveɪtɪd/", "Adjective", "motivé / enthousiaste", "A motivated student learns new techniques faster.", "Un élève motivé apprend de nouvelles techniques plus vite."],
      ["cooperative", "/koʊˈɒpərətɪv/", "Adjective", "coopératif / facile à vivre en équipe", "Maintain a cooperative attitude during group work.", "Garde une attitude coopérative pendant le travail de groupe."],
      ["respectful", "/rɪˈspɛktfl/", "Adjective", "respectueux", "Treat every coworker with respectful fairness.", "Traite chaque collègue avec un respect équitable."],
      ["skill", "/skɪl/", "Noun", "la compétence / le savoir-faire", "Communication is an essential life skill.", "La communication est une compétence de vie essentielle."]
    ],
    dialogue: {
      title: "Bilan du stage d'observation", setting: "Un tuteur commente le stage de troisième d'une élève de collège.",
      lines: [
        ["Tutor", "Congratulations on your internship week, Chloé.", "Félicitations pour ta semaine de stage, Chloé."],
        ["Chloé", "Thank you, sir! Did I meet your expectations?", "Merci, monsieur ! Ai-je répondu à vos attentes ?"],
        ["Tutor", "You were remarkably punctual, polite with visitors and very helpful.", "Tu as été remarquablement ponctuelle, polie avec les visiteurs et très serviable."],
        ["Chloé", "I learned how important teamwork and communication skills are.", "J'ai appris combien le travail d'équipe et la communication comptent."]
      ]
    },
    dictation: { prompt: "He is a reliable and punctual worker in our team.", fr: "C'est un travailleur fiable et ponctuel dans notre équipe." },
    quiz: [
      { q: "Quel adjectif qualifie une personne sur laquelle on peut toujours compter ?", opts: ["Lazy", "Reliable", "Noisy", "Careless"], a: 1, exp: "'Reliable' signifie fiable, digne de confiance." },
      { q: "Que signifie 'punctual' ?", opts: ["Ponctuel / à l'heure", "Drôle", "Bavard", "Fier"], a: 0, exp: "'Punctual' signifie être à l'heure exacte." },
      { q: "Quel est le préfixe négatif de 'polite' ?", opts: ["Unpolite", "Impolite", "Dispolite", "Inpolite"], a: 1, exp: "Le contraire de 'polite' est 'impolite' avec le préfixe im-." }
    ]
  },
  {
    grade: '5e', theme_id: 'school_social', num: 2,
    title: "Les métiers de l'artisanat & de la création",
    title_en: 'Craftsmanship & Creative Trades',
    objective: 'Découvrir les métiers manuels et artistiques avec les suffixes d\'agents (-er, -or, -ian).',
    grammar: {
      title: "La formation des noms de métiers avec les suffixes -ER, -OR, -IST",
      rule: "En anglais, de nombreux métiers se forment à partir du verbe ou du domaine + suffixe : bake -> baker, design -> designer, art -> artist.",
      example_en: "The skilled carpenter carves wood while the potter shapes terracotta bowls.",
      example_fr: "Le menuisier qualifié sculpte le bois tandis que le potier façonne des bols en terre cuite.",
      tip: "Apprenez les verbes d'action associés : a baker bakes bread, a tailor sews clothes.",
      level_focus: "Suffixation lexicale des métiers, présent de description professionnelle."
    },
    vocab: [
      ["carpenter", "/ˈkɑːrpəntər/", "Noun", "le menuisier / charpentier", "The carpenter builds solid oak furniture.", "Le menuisier fabrique des meubles en chêne massif."],
      ["potter", "/ˈpɒtər/", "Noun", "le potier", "The potter turns clay on the rotating wheel.", "Le potier tourne l'argile sur le tour rotatif."],
      ["baker", "/ˈbeɪkər/", "Noun", "le boulanger", "The baker wakes at dawn to knead fresh sourdough.", "Le boulanger se lève à l'aube pour pétrir le levain."],
      ["tailor", "/ˈteɪlər/", "Noun", "le tailleur / couturier", "A tailor stitches custom-made suits.", "Un tailleur coud des costumes sur mesure."],
      ["blacksmith", "/ˈblæksmɪθ/", "Noun", "le forgeron", "The blacksmith shapes red-hot iron on an anvil.", "Le forgeron façonne le fer chauffé à blanc sur l'enclume."],
      ["jeweller", "/ˈdʒuːələr/", "Noun", "le bijoutier", "The jeweller sets sparkling gems into rings.", "Le bijoutier sertit des pierres précieuses dans des bagues."],
      ["apprentice", "/əˈprɛntɪs/", "Noun", "l'apprenti", "The young apprentice learns centuries-old techniques.", "Le jeune apprenti apprend des techniques séculaires."],
      ["workshop", "/ˈwɜːrkʃɒp/", "Noun", "l'atelier d'artisanat", "The carpentry workshop smells of pine wood.", "L'atelier de menuiserie sent le bois de pin."],
      ["handmade", "/ˌhændˈmeɪd/", "Adjective", "fait main / artisanal", "Handmade ceramic mugs are unique.", "Les tasses en céramique faites main sont uniques."],
      ["tool", "/tuːl/", "Noun", "l'outil", "Sharp carving tools must be handled with care.", "Les outils de sculpture tranchants doivent être maniés avec précaution."]
    ],
    dialogue: {
      title: "Visite d'un atelier de poterie", setting: "Des collégiens observent un artisan à l'œuvre.",
      lines: [
        ["Pupil", "How long does it take to shape one clay vase, sir?", "Combien de temps faut-il pour façonner un vase en argile, monsieur ?"],
        ["Potter", "On the wheel, it takes twenty minutes, but firing takes two days.", "Sur le tour, cela prend vingt minutes, mais la cuisson dure deux jours."],
        ["Pupil", "Did you learn this craft from your parents?", "Avez-vous appris cet artisanat de vos parents ?"],
        ["Potter", "Yes, I was an apprentice in this family workshop forty years ago.", "Oui, j'étais apprenti dans cet atelier familial il y a quarante ans."]
      ]
    },
    dictation: { prompt: "The carpenter builds handmade wooden chairs.", fr: "Le menuisier fabrique des chaises en bois faites main." },
    quiz: [
      { q: "Quel artisan façonne l'argile pour faire des vases ou bols ?", opts: ["A blacksmith", "A potter", "A baker", "A tailor"], a: 1, exp: "Le 'potter' (potier) travaille la poterie et l'argile (clay)." },
      { q: "Quel artisan travaille le fer chaud sur une enclume ?", opts: ["A blacksmith", "A carpenter", "A jeweller", "A painter"], a: 0, exp: "Le 'blacksmith' est le forgeron." },
      { q: "Comment qualifie-t-on un objet artisanal confectionné à la main ?", opts: ["Factory-made", "Handmade", "Machine-cut", "Digital"], a: 1, exp: "'Handmade' signifie fait à la main ou artisanal." }
    ]
  }
];
