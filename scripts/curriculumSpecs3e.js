// 19 additional lessons for 3e (Troisième - Cycle 4 / A2+–B1)

export const SPECS_3E = [
  {
    grade: '3e', theme_id: 'daily_life', num: 2,
    title: 'Bien-être mental & gestion du stress',
    title_en: 'Mental Wellbeing & Stress Relief',
    objective: 'Parler de l\'équilibre de vie et de la gestion du stress avec le deuxième conditionnel (Second Conditional).',
    grammar: {
      title: "Le Deuxième Conditionnel (Second Conditional : IF + prétérit, WOULD + base verbale)",
      rule: "On utilise le second conditionnel pour formuler des hypothèses imaginaires ou donner un conseil bienveillant (If I were you, I would...).",
      example_en: "If I felt overwhelmed by exam stress, I would take deep breaths and go for a walk.",
      example_fr: "Si je me sentais submergé par le stress des examens, je prendrais de profondes inspirations et j'irais marcher.",
      tip: "Avec IF, on emploie traditionnellement WERE pour toutes les personnes : If I were you...",
      level_focus: "Second conditionnel d'hypothèse et de conseil (If I were you, I would...)."
    },
    vocab: [
      ["wellbeing", "/ˌwɛlˈbiːɪŋ/", "Noun", "le bien-être général", "Regular sleep is fundamental for mental wellbeing.", "Un sommeil régulier est fondamental pour le bien-être mental."],
      ["stress relief", "/strɛs rɪˈliːf/", "Noun", "le soulagement du stress", "Listening to classical piano provides instant stress relief.", "Écouter du piano classique apporte un soulagement immédiat du stress."],
      ["meditation", "/ˌmɛdɪˈteɪʃn/", "Noun", "la méditation", "Daily mindfulness meditation calms an anxious mind.", "La méditation de pleine conscience apaise un esprit anxieux."],
      ["breathe", "/briːð/", "Verb", "respirer", "Breathe slowly and deeply through your nose.", "Respire lentement et profondément par le nez."],
      ["overwhelmed", "/ˌoʊvərˈwɛlmd/", "Adjective", "submergé / dépassé", "Do not hesitate to ask for help when overwhelmed.", "N'hésite pas à demander de l'aide quand tu te sens submergé."],
      ["routine", "/ruːˈtiːn/", "Noun", "la routine équilibrée", "A peaceful bedtime routine improves deep sleep.", "Une routine paisible au coucher améliore le sommeil profond."],
      ["balance", "/ˈbæləns/", "Noun", "l'équilibre de vie", "Maintain a healthy balance between study and fun.", "Garde un équilibre sain entre études et divertissement."],
      ["anxious", "/ˈæŋkʃəs/", "Adjective", "anxieux / inquiet", "Talking with a close friend calms anxious thoughts.", "Parler avec un ami proche apaise les pensées anxieuses."],
      ["walk in nature", "/wɔːk ɪn ˈneɪtʃər/", "Phrase", "la marche dans la nature", "A thirty-minute walk in nature reduces cortisol levels.", "Trente minutes de marche dans la nature réduisent le cortisol."],
      ["resilience", "/rɪˈzɪliəns/", "Noun", "la résilience", "Facing challenges with optimism fosters resilience.", "Affronter les épreuves avec optimisme forge la résilience."]
    ],
    dialogue: {
      title: "Avant le brevet des collèges", setting: "Sarah et Hugo font une pause révision au parc.",
      lines: [
        ["Hugo", "I feel so anxious about the upcoming mock exams, Sarah.", "Je me sens tellement anxieux pour les examens blancs, Sarah."],
        ["Sarah", "If I were you, Hugo, I would close my books and breathe deeply for ten minutes.", "Si j'étais toi, Hugo, je fermerais mes livres et respirerais profondément dix minutes."],
        ["Hugo", "Do you think going for a brisk walk helps clear the head?", "Penses-tu qu'une marche rapide aide à s'aérer la tête ?"],
        ["Sarah", "Definitely! If we rested our minds, we would memorize our notes much better.", "Absolument ! Si nous reposions notre esprit, nous mémoriserions nos fiches bien mieux."]
      ]
    },
    dictation: { prompt: "If I were you, I would take a walk to reduce exam stress.", fr: "Si j'étais toi, je ferais une promenade pour réduire le stress des examens." },
    quiz: [
      { q: "Quelle forme verbale complète : 'If I ... you, I would sleep earlier' ?", opts: ["am", "was / were", "will be", "have been"], a: 1, exp: "Au second conditionnel hypothétique, on utilise le prétérit ('were' étant la forme soutenue pour toutes les personnes)." },
      { q: "Que signifie l'expression 'stress relief' ?", opts: ["L'augmentation du stress", "Le soulagement / l'apaisement du stress", "Un examen difficile", "Une dispute"], a: 1, exp: "'Stress relief' désigne le soulagement ou la réduction du stress." },
      { q: "Comment se prononce le verbe 'to breathe' (respirer) ?", opts: ["/brɛθ/", "/briːð/", "/briːθ/", "/breɪð/"], a: 1, exp: "Le verbe 'breathe' se prononce /briːð/ avec une voyelle longue et un th sonore, à ne pas confondre avec le nom 'breath' /brɛθ/." }
    ]
  },
  {
    grade: '3e', theme_id: 'daily_life', num: 3,
    title: 'Engagement bénévole & citoyenneté',
    title_en: 'Volunteering & Civic Engagement',
    objective: 'Parler de solidarité et d\'actions caritatives avec les propositions en IN SPITE OF / ALTHOUGH.',
    grammar: {
      title: "L'expression de l'opposition et de la concession (ALTHOUGH vs DESPITE / IN SPITE OF)",
      rule: "On utilise 'ALTHOUGH' suivi d'une proposition avec sujet et verbe conjugué (Although it was raining...), et 'DESPITE / IN SPITE OF' suivi d'un groupe nominal ou d'un verbe en -ING (Despite the bad weather...).",
      example_en: "Although students had busy exam schedules, they volunteered at the animal shelter every Saturday.",
      example_fr: "Bien que les élèves eussent des plannings d'examens chargés, ils faisaient du bénévolat au refuge pour animaux chaque samedi.",
      tip: "Attention : never say 'despite of' — c'est soit 'despite', soit 'in spite of' !",
      level_focus: "Connecteurs de concession (although, despite, in spite of, even though)."
    },
    vocab: [
      ["volunteering", "/ˌvɒlənˈtɪərɪŋ/", "Noun", "le bénévolat", "Volunteering helps vulnerable people and enriches the soul.", "Le bénévolat aide les personnes vulnérables et enrichit l'âme."],
      ["charity", "/ˈtʃærəti/", "Noun", "l'association caritative", "Our school raised funds for a homeless charity.", "Notre collège a collecté des fonds pour une association caritative."],
      ["donation", "/doʊˈneɪʃn/", "Noun", "le don financier ou matériel", "Generous neighbors brought canned food donations.", "Des voisins généreux ont apporté des dons de boîtes de conserve."],
      ["shelter", "/ˈʃɛltər/", "Noun", "le refuge / foyer d'accueil", "Volunteers walked rescue dogs at the animal shelter.", "Des bénévoles ont promené des chiens au refuge animalier."],
      ["solidarity", "/ˌsɒlɪˈdærəti/", "Noun", "la solidarité", "Disaster relief brings out international solidarity.", "Les secours après sinistre révèlent une solidarité mondiale."],
      ["fundraising", "/ˈfʌndˌreɪzɪŋ/", "Noun", "la collecte de fonds", "The charity bake sale was a successful fundraising event.", "La vente de gâteaux a été une collecte de fonds réussie."],
      ["community", "/kəˈmjuːnəti/", "Noun", "la communauté locale", "Local citizens cleaned up the neighborhood park.", "Les citoyens locaux ont nettoyé le parc du quartier."],
      ["support", "/səˈpɔːrt/", "Verb", "soutenir / aider", "Support elderly citizens during harsh winter months.", "Soutenez les personnes âgées pendant les rudes mois d'hiver."],
      ["civic", "/ˈsɪvɪk/", "Adjective", "civique / citoyen", "Voting and helping others are vital civic duties.", "Voter et aider son prochain sont des devoirs civiques vitaux."],
      ["generous", "/ˈdʒɛnərəs/", "Adjective", "généreux", "A generous spirit inspires everyone around.", "Un esprit généreux inspire tout le monde autour."]
    ],
    dialogue: {
      title: "Collecte de denrées au collège", setting: "Les délégués de classe organisent la banque alimentaire.",
      lines: [
        ["Delegate", "Although the collection started only yesterday, we have already received sixty boxes.", "Bien que la collecte n'ait débuté qu'hier, nous avons déjà reçu soixante cartons."],
        ["Principal", "Despite the rainy weather, families were exceptionally generous.", "Malgré le temps pluvieux, les familles ont été exceptionnellement généreuses."],
        ["Delegate", "We are sorting dry pasta, rice and warm coats today.", "Nous trions les pâtes, le riz et les manteaux chauds aujourd'hui."],
        ["Principal", "Your civic engagement makes our entire school proud.", "Votre engagement citoyen fait la fierté de tout notre établissement."]
      ]
    },
    dictation: { prompt: "Although students were busy, they volunteered at the shelter.", fr: "Bien que les élèves fussent occupés, ils ont fait du bénévolat au refuge." },
    quiz: [
      { q: "Quel connecteur est suivi d'une proposition complète (sujet + verbe conjugué) ?", opts: ["Despite", "Although", "In spite of", "Because of"], a: 1, exp: "'Although' est une conjonction de subordination suivie de sujet + verbe." },
      { q: "Quelle forme est grammaticalement fausse en anglais ?", opts: ["Despite the rain", "In spite of the rain", "Despite of the rain", "Although it rained"], a: 2, exp: "'Despite of' est une faute courante : on dit soit 'despite', soit 'in spite of'." },
      { q: "Que désigne un 'animal shelter' ?", opts: ["Une animalerie", "Un refuge pour animaux abandonnés", "Un zoo", "Une ferme d'élevage"], a: 1, exp: "'Animal shelter' désigne le refuge qui accueille et soigne les animaux sans maître." }
    ]
  },
  {
    grade: '3e', theme_id: 'travel', num: 2,
    title: 'Parcs nationaux & vie sauvage américaine',
    title_en: 'US National Parks & Wilderness',
    objective: 'Décrire la faune sauvage et les mesures de préservation de la nature avec les modaux de déduction.',
    grammar: {
      title: "Les modaux de certitude et de déduction logique (MUST BE vs CAN'T BE)",
      rule: "On utilise 'must be' quand on est presque certain d'une conclusion positive (ex: Those tracks MUST BE bear prints), et 'can't be' pour une impossibilité (It CAN'T BE a wolf, it's too small).",
      example_en: "Look at the deep claw marks on that pine tree; it must be a grizzly bear territory.",
      example_fr: "Regarde les marques de griffes profondes sur ce pin ; cela doit être le territoire d'un grizzly.",
      tip: "Attention : le contraire déductif de MUST BE n'est pas mustn't, mais CAN'T BE !",
      level_focus: "Modaux de déduction logique au présent (must, can't, might)."
    },
    vocab: [
      ["wilderness", "/ˈwɪldərnəs/", "Noun", "la nature sauvage et préservée", "Yellowstone protects pristine volcanic wilderness.", "Yellowstone protège une nature volcanique sauvage et intacte."],
      ["ranger", "/ˈreɪndʒər/", "Noun", "le garde forestier / ranger", "Park rangers enforce wildlife protection rules.", "Les rangers du parc font respecter les règles de protection."],
      ["geyser", "/ˈɡaɪzər/", "Noun", "le geyser", "Old Faithful shoots boiling water high into the sky.", "Old Faithful projette de l'eau bouillante haut dans le ciel."],
      ["bison", "/ˈbaɪsn/", "Noun", "le bison d'Amérique", "Massive herds of bison graze across the green valley.", "D'immenses troupeaux de bisons paissent dans la vallée."],
      ["grizzly bear", "/ˈɡrɪzli bɛər/", "Noun", "le grizzli", "Never approach a grizzly bear mother and her cubs.", "N'approchez jamais une maman grizzli et ses oursons."],
      ["trail", "/treɪl/", "Noun", "le sentier balisé de randonnée", "Stay on the marked trail to preserve alpine flowers.", "Restez sur le sentier balisé pour préserver la flore."],
      ["conservation", "/ˌkɒnsərˈveɪʃn/", "Noun", "la préservation de l'environnement", "National parks play a pivotal role in species conservation.", "Les parcs nationaux jouent un rôle pivot dans la conservation."],
      ["canyon", "/ˈkænjən/", "Noun", "le canyon spectaculaire", "Zion National Park features red sandstone canyons.", "Le parc de Zion offre des canyons de grès rouge."],
      ["campfire", "/ˈkæmpfaɪər/", "Noun", "le feu de camp", "Extinguish your campfire completely before nightfall.", "Éteignez complètement votre feu de camp avant la nuit."],
      ["breathtaking", "/ˈbrɛθteɪkɪŋ/", "Adjective", "à couper le souffle", "The panoramic view of the Rocky Mountains was breathtaking.", "La vue panoramique sur les Rocheuses était à couper le souffle."]
    ],
    dialogue: {
      title: "Rencontre avec un ranger à Yellowstone", setting: "Des randonneurs s'informent au centre d'accueil du parc.",
      lines: [
        ["Hiker", "Ranger, we saw huge animal tracks near the river bank this morning.", "Ranger, nous avons vu d'énormes empreintes près de la rive ce matin."],
        ["Ranger", "With wide rounded paws? That must be a brown grizzly bear.", "Avec de larges pattes arrondies ? Cela doit être un grizzli brun."],
        ["Hiker", "Can it be a stray domestic dog?", "Cela peut-il être un chien domestique errant ?"],
        ["Ranger", "No, it can't be a dog. The claws are three inches long! Always carry bear spray on the trails.", "Non, c'est impossible. Les griffes font 7 centimètres ! Ayez toujours un spray répulsif."]
      ]
    },
    dictation: { prompt: "Those huge paw tracks must be from a grizzly bear.", fr: "Ces immenses empreintes de pattes doivent provenir d'un grizzli." },
    quiz: [
      { q: "Quel modal exprime une quasi-certitude logique positive ('cela doit être...') ?", opts: ["Can", "Must", "Should", "Would"], a: 1, exp: "'Must' exprime la quasi-certitude déductive (That must be a bear)." },
      { q: "Quel est le contraire déductif de 'It must be true' ?", opts: ["It mustn't be true", "It can't be true", "It won't be true", "It isn't true"], a: 1, exp: "L'impossibilité déductive s'exprime par 'CAN'T BE' (It can't be true = C'est impossible)." },
      { q: "Quel est le premier parc national créé au monde en 1872 ?", opts: ["Yosemite", "Yellowstone", "Grand Canyon", "Everglades"], a: 1, exp: "Le parc de Yellowstone (1872) est le premier parc national au monde." }
    ]
  },
  {
    grade: '3e', theme_id: 'travel', num: 3,
    title: 'Écotourisme & voyager responsable',
    title_en: 'Eco-Tourism & Sustainable Travel',
    objective: 'Débattre de l\'impact environnemental du tourisme avec les questions tags (Question Tags).',
    grammar: {
      title: "Les questions tags (Confirmation et relance orale)",
      rule: "Pour demander confirmation à son interlocuteur, on reprend l'auxiliaire inversé : phrase affirmative -> tag négatif (You love eco-tourism, DON'T YOU?), phrase négative -> tag affirmatif (We shouldn't fly so often, SHOULD WE?).",
      example_en: "Sustainable tourism protects local communities, doesn't it?",
      example_fr: "Le tourisme durable protège les communautés locales, n'est-ce pas ?",
      tip: "Règle mnémotechnique : + avec -, et - avec +.",
      level_focus: "Question tags (n'est-ce pas ?), argumentation éco-responsable."
    },
    vocab: [
      ["eco-tourism", "/ˈiːkoʊ ˈtʊərɪzəm/", "Noun", "l'écotourisme", "Eco-tourism promotes low-impact travel in wild regions.", "L'écotourisme favorise des voyages à faible impact."],
      ["carbon footprint", "/ˈkɑːrbən ˈfʊtprɪnt/", "Noun", "l'empreinte carbone", "Taking electric trains reduces your carbon footprint significantly.", "Prendre le train électrique réduit nettement l'empreinte carbone."],
      ["sustainable", "/səˈsteɪnəbl/", "Adjective", "durable / soutenable", "Choose sustainable homestays instead of giant resort hotels.", "Choisis des séjours chez l'habitant durables."],
      ["leave no trace", "/liːv noʊ treɪs/", "Phrase", "ne laisser aucune trace (éthique verte)", "Hikers follow the 'leave no trace' principle in national parks.", "Les marcheurs appliquent la règle 'sans trace' dans les parcs."],
      ["local community", "/ˈloʊkl kəˈmjuːnəti/", "Noun", "la communauté locale", "Spend travel money directly inside the local community.", "Dépense ton budget de voyage directement dans l'économie locale."],
      ["biodiversity", "/ˌbaɪoʊdaɪˈvɜːrsəti/", "Noun", "la biodiversité", "Protecting fragile coral reefs preserves marine biodiversity.", "Protéger les récifs coralliens préserve la biodiversité marine."],
      ["off the beaten track", "/ɒf ðə ˈbiːtn træk/", "Idiom", "hors des sentiers battus", "Discover hidden valleys off the beaten track.", "Découvre des vallées secrètes hors des sentiers battus."],
      ["recycle", "/ˌriːˈsaɪkl/", "Verb", "recycler", "Always recycle plastic bottles during long voyages.", "Recycle toujours les bouteilles plastique en voyage."],
      ["preserve", "/prɪˈzɜːrv/", "Verb", "préserver / sauvegarder", "Preserve cultural heritage for future generations.", "Préserve le patrimoine culturel pour les générations futures."],
      ["responsible", "/rɪˈspɒnsəbl/", "Adjective", "responsable", "A responsible traveler respects local traditions.", "Un voyageur responsable respecte les traditions locales."]
    ],
    dialogue: {
      title: "Débat sur le voyage éco-responsable", setting: "Des collégiens préparent une charte pour leur voyage en Écosse.",
      lines: [
        ["Arthur", "Taking the sleeper train to Edinburgh is much greener than flying, isn't it?", "Prendre le train de nuit pour Édimbourg est bien plus vert que l'avion, n'est-ce pas ?"],
        ["Emma", "It definitely is! And we won't buy single-use plastic bottles, will we?", "Absolument ! Et nous n'achèterons pas de bouteilles en plastique jetables, n'est-ce pas ?"],
        ["Arthur", "No, everyone has their own reusable stainless steel flask.", "Non, chacun a sa propre gourde en inox réutilisable."],
        ["Emma", "Traveling off the beaten track helps local craftspeople thrive.", "Voyager hors des sentiers battus aide les artisans locaux à vivre."]
      ]
    },
    dictation: { prompt: "Sustainable tourism protects fragile biodiversity, doesn't it?", fr: "Le tourisme durable protège la biodiversité fragile, n'est-ce pas ?" },
    quiz: [
      { q: "Quel question tag complète : 'You recycle your waste, ... ?'", opts: ["aren't you?", "don't you?", "do you?", "won't you?"], a: 1, exp: "Au présent simple avec un verbe ordinaire affirmatif, le tag utilise 'don't you?'." },
      { q: "Que signifie l'expression idiomatique 'off the beaten track' ?", opts: ["Sur l'autoroute", "Hors des sentiers battus", "En retard", "Dans un hôtel cinq étoiles"], a: 1, exp: "'Off the beaten track' qualifie un lieu préservé, loin du tourisme de masse." },
      { q: "Quel tag complète : 'We won't pollute the lake, ... ?'", opts: ["will we?", "won't we?", "do we?", "shall we?"], a: 0, exp: "Après une phrase négative avec 'won't', le tag est affirmatif : 'will we?'." }
    ]
  },
  {
    grade: '3e', theme_id: 'history', num: 2,
    title: 'La Seconde Guerre mondiale & l\'effort de guerre',
    title_en: 'WWII, The Blitz & Everyday Courage',
    objective: 'Comprendre la vie civile pendant le Blitz à Londres au passé composé historique (Past Perfect).',
    grammar: {
      title: "Le Past Perfect (HAD + participe passé) pour l'antériorité dans le passé",
      rule: "On utilise le Past Perfect pour exprimer une action qui s'était produite AVANT une autre action passée au prétérit simple.",
      example_en: "When the air raid siren wailed, Londoners had already taken shelter inside underground stations.",
      example_fr: "Lorsque la sirène de raid aérien retentit, les Londoniens s'étaient déjà réfugiés dans les stations de métro.",
      tip: "Structure : HAD + participe passé pour l'action la plus ancienne.",
      level_focus: "Past Perfect d'antériorité par rapport au prétérit simple."
    },
    vocab: [
      ["Blitz", "/blɪts/", "Noun", "le Blitz (bombardements sur Londres 1940-41)", "Londoners demonstrated remarkable resilience during the Blitz.", "Les Londoniens firent preuve d'une résilience remarquable pendant le Blitz."],
      ["air raid", "/ɛər reɪd/", "Noun", "le raid aérien / bombardement", "Air raid sirens sounded across the darkened capital.", "Les sirènes de raid aérien retentirent dans la capitale assombrie."],
      ["shelter", "/ˈʃɛltər/", "Noun", "l'abri antiaérien", "Thousands slept safely in deep underground shelters.", "Des milliers de personnes dormirent dans de profonds abris souterrains."],
      ["evacuate", "/ɪˈvækjuːeɪt/", "Verb", "évacuer (vers la campagne)", "Schools evacuated young children to quiet rural villages.", "Les écoles évacuèrent les jeunes enfants vers de calmes villages."],
      ["blackout", "/ˈblækaʊt/", "Noun", "le couvre-feu / occultation totale des lumières", "Blackout curtains prevented enemy bombers from spotting cities.", "Les rideaux d'occultation empêchaient les bombardiers de repérer les villes."],
      ["rationing", "/ˈræʃənɪŋ/", "Noun", "le rationnement des denrées", "Rationing coupons limited purchases of sugar, butter and meat.", "Les tickets de rationnement limitaient le sucre, le beurre et la viande."],
      ["bravery", "/ˈbreɪvəri/", "Noun", "la bravoure / le courage", "Firefighters showed superhuman bravery amidst falling rubble.", "Les pompiers montrèrent une bravoure surhumaine au milieu des décombres."],
      ["underground", "/ˈʌndərɡraʊnd/", "Noun", "le métro londonien (The Tube)", "Platform tracks in the Underground served as night dormitories.", "Les quais du métro servirent de dortoirs de nuit."],
      ["allies", "/ˈælaɪz/", "Noun", "les puissances alliées", "Allied forces united to defeat totalitarian tyranny.", "Les forces alliées s'unirent pour vaincre la tyrannie."],
      ["resilience", "/rɪˈzɪliəns/", "Noun", "la résilience / la force morale", "The British spirit of resilience became a global symbol.", "L'esprit de résilience britannique devint un symbole mondial."]
    ],
    dialogue: {
      title: "Témoignage d'un enfant évacué en 1940", setting: "Des élèves de troisième étudient des lettres d'époque.",
      lines: [
        ["Pupil", "Had the government evacuated children before the heavy bombings began?", "Le gouvernement avait-il évacué les enfants avant le début des intenses bombardements ?"],
        ["Historian", "Yes, Operation Pied Piper had already relocated over a million pupils to rural foster homes.", "Oui, l'opération Pied Piper avait déjà relogé plus d'un million d'élèves dans des familles rurales."],
        ["Pupil", "How did Londoners endure the nightly air raids?", "Comment les Londoniens ont-ils enduré les raids aériens nocturnes ?"],
        ["Historian", "They slept in Underground stations and maintained everyday routines with courageous dignity.", "Ils dormaient dans les stations de métro et maintenaient leur quotidien avec une courageuse dignité."]
      ]
    },
    dictation: { prompt: "When sirens wailed, families had already reached the shelter.", fr: "Lorsque les sirènes retentirent, les familles avaient déjà gagné l'abri." },
    quiz: [
      { q: "Quelle action s'est produite EN PREMIER : 'When police arrived, the thieves had fled' ?", opts: ["The police arrived", "The thieves had fled", "Les deux en même temps", "On ne peut pas savoir"], a: 1, exp: "Le Past Perfect ('had fled') indique toujours l'action la plus ancienne dans le passé." },
      { q: "Que désignait le 'blackout' à Londres pendant la guerre ?", opts: ["Une panne d'essence", "L'extinction totale de toute lumière visible la nuit", "L'arrêt des trains", "La fermeture des banques"], a: 1, exp: "Le blackout obligeait à masquer fenêtres et phares pour ne pas guider les avions bombardiers." },
      { q: "Où se réfugiaient de nombreux Londoniens durant les raids nocturnes ?", opts: ["Dans les tours de bureaux", "Dans les stations profondes du métro (Underground)", "Dans les parcs découverts", "Sur les toits"], a: 1, exp: "Les stations souterraines profondes du Tube offraient un abri protecteur efficace." }
    ]
  },
  {
    grade: '3e', theme_id: 'history', num: 3,
    title: 'La Guerre froide & la chute du Mur de Berlin',
    title_en: 'The Cold War & The Fall of the Wall',
    objective: 'Comprendre la division de l\'Europe et la chute du mur de Berlin en 1989 avec les verbes d\'opinion.',
    grammar: {
      title: "Exprimer l'opinion argumentée avec IN MY VIEW, WHEREAS et WHILE",
      rule: "Pour comparer deux blocs idéologiques ou points de vue historiques : on utilise 'whereas' ou 'while' pour marquer un contraste net.",
      example_en: "Western democracies defended market freedom, whereas the Eastern bloc was ruled by communist regimes.",
      example_fr: "Les démocraties occidentales défendaient la liberté de marché, tandis que le bloc de l'Est était dirigé par des régimes communistes.",
      tip: "Whereas s'emploie pour souligner un contraste frappant entre deux réalités parallèles.",
      level_focus: "Connecteurs de contraste académique (whereas, while, on the other hand)."
    },
    vocab: [
      ["Cold War", "/koʊld wɔːr/", "Noun", "la Guerre froide", "The Cold War pitted two superpowers against each other.", "La Guerre froide opposa deux superpuissances."],
      ["fall of the Berlin Wall", "/fɔːl əv ðə bɜːrˈlɪn wɔːl/", "Noun", "la chute du Mur de Berlin (1989)", "The joyful fall of the Berlin Wall reunited families.", "La chute joyeuse du mur de Berlin réunit les familles."],
      ["iron curtain", "/ˈaɪərn ˈkɜːrtn/", "Noun", "le rideau de fer", "Winston Churchill coined the famous phrase 'Iron Curtain'.", "Winston Churchill a forgé la célèbre formule 'Rideau de fer'."],
      ["reunification", "/ˌriːˌjuːnɪfɪˈkeɪʃn/", "Noun", "la réunification", "German reunification opened a hopeful new European chapter.", "La réunification allemande ouvrit un nouveau chapitre européen porteur d'espoir."],
      ["superpower", "/ˈsuːpərpaʊər/", "Noun", "la superpuissance", "The USA and the Soviet Union competed as nuclear superpowers.", "Les États-Unis et l'Union soviétique rivalisèrent comme superpuissances."],
      ["checkpoint", "/ˈtʃɛkpɔɪnt/", "Noun", "le poste frontière / point de contrôle", "Checkpoint Charlie divided American and Soviet sectors.", "Le Checkpoint Charlie séparait les secteurs américain et soviétique."],
      ["freedom", "/ˈfriːdəm/", "Noun", "la liberté", "Peaceful protesters chanted demands for democratic freedom.", "Des manifestants pacifiques scandaient des revendications de liberté démocratique."],
      ["democracy", "/dɪˈmɒkrəsi/", "Noun", "la démocratie", "Democracy guarantees free elections and individual rights.", "La démocratie garantit des élections libres et des droits individuels."],
      ["concrete wall", "/ˈkɒŋkriːt wɔːl/", "Noun", "le mur de béton", "The grey concrete wall separated families for twenty-eight years.", "Le mur de béton gris sépara des familles pendant vingt-huit ans."],
      ["symbol", "/ˈsɪmbl/", "Noun", "le symbole historique", "Chipping away pieces of the wall became a symbol of liberty.", "Casser des morceaux du mur devint un symbole de liberté."]
    ],
    dialogue: {
      title: "Le 9 novembre 1989 à Berlin", setting: "Deux élèves analysent les photographies d'archives.",
      lines: [
        ["Pupil", "Why was the fall of the Berlin Wall such an emotional global event?", "Pourquoi la chute du mur de Berlin fut-elle un événement mondial si émouvant ?"],
        ["Teacher", "Because the wall had divided a single city and separated relatives since 1961.", "Parce que le mur divisait une même ville et séparait des proches depuis 1961."],
        ["Pupil", "People climbed on top of the concrete wall and danced together, didn't they?", "Les gens sont montés sur le mur de béton et ont dansé ensemble, n'est-ce pas ?"],
        ["Teacher", "Indeed! It symbolized the peaceful triumph of liberty over division.", "Tout à fait ! Cela symbolisait le triomphe pacifique de la liberté sur la division."]
      ]
    },
    dictation: { prompt: "The fall of the Berlin Wall reunited families in freedom.", fr: "La chute du mur de Berlin a réuni les familles dans la liberté." },
    quiz: [
      { q: "En quelle année le mur de Berlin est-il tombé pacifiquement ?", opts: ["1975", "1989", "1991", "2000"], a: 1, exp: "Le mur de Berlin s'est effondré le 9 novembre 1989." },
      { q: "Quel connecteur marque l'opposition : 'He loved science, ... his brother preferred arts' ?", opts: ["whereas", "because", "so", "since"], a: 0, exp: "'Whereas' (tandis que) marque le contraste entre deux réalités." },
      { q: "Qui a popularisé l'expression historique 'Iron Curtain' (Rideau de fer) en 1946 ?", opts: ["John F. Kennedy", "Winston Churchill", "Franklin Roosevelt", "Martin Luther King"], a: 1, exp: "Winston Churchill a prononcé son célèbre discours sur le Rideau de fer à Fulton en 1946." }
    ]
  },
  {
    grade: '3e', theme_id: 'hobbies', num: 2,
    title: 'L\'art du débat & argumentation publique',
    title_en: 'Public Debating & Rhetoric',
    objective: 'Défendre une position et réfuter des contre-arguments dans un débat structuré en anglais.',
    grammar: {
      title: "Les formules d'accord nuancé et de désaccord poli (I partly agree, Up to a point, On the contrary)",
      rule: "Dans un débat formel anglo-saxon, on ne dit pas 'You are wrong!', mais on nuance poliment : I see your point, however... / That may be true, but on the other hand...",
      example_en: "While I agree that social media facilitates communication, I would argue that it also reduces face-to-face empathy.",
      example_fr: "Tout en convenant que les réseaux facilitent la communication, je soutiendrais qu'ils réduisent aussi l'empathie en face-à-face.",
      tip: "Pour introduire une concession : Admittedly, ... However, ...",
      level_focus: "Formules rhétoriques de débat et d'argumentation modérée."
    },
    vocab: [
      ["debate", "/dɪˈbeɪt/", "Noun", "le débat contradictoire", "The parliamentary debate addressed renewable energy solutions.", "Le débat parlementaire a abordé les solutions d'énergie renouvelable."],
      ["argument", "/ˈɑːrɡjumənt/", "Noun", "l'argument / la thèse défendue", "Back up your main argument with verified statistical facts.", "Appuie ton argument principal avec des statistiques vérifiées."],
      ["counter-argument", "/ˈkaʊntər ˈɑːrɡjumənt/", "Noun", "le contre-argument / la réfutation", "A sharp speaker anticipates opponents' counter-arguments.", "Un orateur avisé anticipe les contre-arguments adverses."],
      ["motion", "/ˈmoʊʃn/", "Noun", "la motion / le sujet soumis au vote", "This house proposes the motion to ban single-use plastics.", "Cette assemblée soutient la motion d'interdire les plastiques jetables."],
      ["podium", "/ˈpoʊdiəm/", "Noun", "le pupitre / la tribune d'orateur", "Step up to the wooden podium and address the assembly.", "Avance-toi au pupitre et adresse-toi à l'assemblée."],
      ["rebuttal", "/rɪˈbʌtl/", "Noun", "la réplique / la réfutation", "Her rebuttal dismantled the opposing team's claim.", "Sa réfutation a démonté l'affirmation de l'équipe adverse."],
      ["persuasive", "/pərˈsweɪsɪv/", "Adjective", "persuasif / convaincant", "Use persuasive rhetoric and clear examples.", "Utilise une rhétorique persuasive et des exemples clairs."],
      ["evidence", "/ˈɛvɪdəns/", "Noun", "les preuves tangibles", "Provide scientific evidence to prove your statement.", "Fournis des preuves scientifiques pour étayer ton propos."],
      ["convince", "/kənˈvɪns/", "Verb", "convaincre", "Logical reasoning convinces open-minded listeners.", "Le raisonnement logique convainc les auditeurs ouverts d'esprit."],
      ["compromise", "/ˈkɒmprəmaɪz/", "Noun", "le compromis constructif", "A successful parliamentary debate leads to a fair compromise.", "Un débat réussi conduit à un compromis équitable."]
    ],
    dialogue: {
      title: "Joute oratoire au club de débat du collège", setting: "Deux collégiens débattent de l'interdiction des smartphones en classe.",
      lines: [
        ["First Speaker", "I argue that smartphones should be strictly banned in schools to ensure focus.", "Je soutiens que les smartphones devraient être bannis à l'école pour garantir l'attention."],
        ["Second Speaker", "I see your point; however, smartphones can serve as powerful interactive research tools.", "Je vois votre point ; cependant, les smartphones peuvent servir d'outils de recherche interactifs."],
        ["First Speaker", "That may be true, but the risk of digital distraction remains excessively high.", "C'est peut-être vrai, mais le risque de distraction numérique reste excessivement élevé."],
        ["Adjudicator", "Both teams presented balanced evidence and respectful arguments.", "Les deux équipes ont présenté des preuves équilibrées et des arguments respectueux."]
      ]
    },
    dictation: { prompt: "A persuasive speaker supports their argument with solid evidence.", fr: "Un orateur convaincant étaye son argument avec des preuves solides." },
    quiz: [
      { q: "Quelle formulation permet d'exprimer un désaccord poli et académique ?", opts: ["You are totally wrong!", "I see your point; however, ...", "Be quiet!", "I don't care."], a: 1, exp: "'I see your point; however, ...' est la formule type de débat poli à l'anglo-saxonne." },
      { q: "Comment appelle-t-on le sujet ou proposition soumis au vote dans un débat ?", opts: ["The motion", "The title", "The song", "The letter"], a: 0, exp: "'The motion' est la thèse formelle soumise à la délibération (This house believes that...)." },
      { q: "Que signifie 'evidence' en anglais ?", opts: ["Une évidence sans preuve", "Des preuves tangibles et vérifiables", "Un témoin", "Une question"], a: 1, exp: "Attention au faux-ami : 'evidence' signifie des faits prouvés ou des indices matériels." }
    ]
  },
  {
    grade: '3e', theme_id: 'hobbies', num: 3,
    title: 'Le street art & fresques urbaines',
    title_en: 'Urban Street Art & Murals',
    objective: 'Parler de l\'art urbain engagé (Banksy) et exprimer son opinion esthétique avec LIKEWISE et HOWEVER.',
    grammar: {
      title: "Les connecteurs d'addition et d'opposition (FURTHERMORE, HOWEVER, ON THE OTHER HAND)",
      rule: "Pour enrichir une dissertation ou une critique artistique : 'Furthermore' (de plus) renforce un argument, tandis que 'However' (cependant) introduit une nuance.",
      example_en: "Banksy's satirical murals provoke deep social thought; furthermore, they beautify abandoned brick walls.",
      example_fr: "Les fresques satiriques de Banksy suscitent une réflexion sociale profonde ; de plus, elles embellissent des murs de briques abandonnés.",
      tip: "Ces connecteurs sont généralement suivis d'une virgule en début de phrase.",
      level_focus: "Connecteurs argumentatifs de liaison écrite (furthermore, nevertheless, however)."
    },
    vocab: [
      ["street art", "/striːt ɑːrt/", "Noun", "l'art urbain / le street art", "Street art transforms dull concrete walls into public galleries.", "Le street art transforme les murs de béton ternes en galeries publiques."],
      ["mural", "/ˈmjʊərəl/", "Noun", "la fresque murale", "A giant colourful mural celebrates community diversity.", "Une fresque murale géante et colorée célèbre la mixité."],
      ["stencil", "/ˈstɛnsl/", "Noun", "le pochoir", "Banksy popularized political satire using cardboard stencils.", "Banksy a popularisé la satire politique par pochoir."],
      ["graffiti", "/ɡrəˈfiːti/", "Noun", "le graffiti", "Urban artists distinguish meaningful murals from vandalism.", "Les artistes urbains distinguent les fresques signifiantes des dégradations."],
      ["spray paint", "/spreɪ peɪnt/", "Noun", "la bombe de peinture aérosol", "Hold the spray paint can at a steady distance.", "Tiens la bombe aérosol à distance régulière."],
      ["satire", "/ˈsætaɪər/", "Noun", "la satire / la critique humoristique", "Social satire denounces materialism and warfare.", "La satire sociale dénonce le matérialisme et la guerre."],
      ["provocative", "/prəˈvɒkətɪv/", "Adjective", "provocateur / percutant", "His provocative artwork challenges political complacency.", "Son œuvre provocatrice interpelle l'inertie politique."],
      ["alleyway", "/ˈæliweɪ/", "Noun", "la ruelle urbaine", "Tourists visit Shoreditch alleyways to photograph new murals.", "Des touristes visitent les ruelles de Shoreditch pour photographier les fresques."],
      ["ephemeral", "/ɪˈfɛmərəl/", "Adjective", "éphémère", "Street art is an ephemeral art form that weathers away.", "L'art de rue est une forme d'art éphémère qui s'efface avec le temps."],
      ["statement", "/ˈsteɪtmənt/", "Noun", "une prise de position / déclaration artistique", "This powerful image makes a strong pacifist statement.", "Cette image forte est une déclaration pacifiste percutante."]
    ],
    dialogue: {
      title: "Visite guidée dans le quartier de Bristol", setting: "Des collégiens découvrent les origines de Banksy à Bristol.",
      lines: [
        ["Guide", "Bristol is the hometown of Banksy, where he painted his first stencils.", "Bristol est la ville natale de Banksy, où il a peint ses premiers pochoirs."],
        ["Student", "Is street art considered real fine art or vandalism?", "Le street art est-il considéré comme du véritable art ou du vandalisme ?"],
        ["Guide", "Opinions differ; however, celebrated museums now protect these provocative murals.", "Les avis divergent ; cependant, de célèbres musées protègent désormais ces fresques percutantes."],
        ["Student", "Furthermore, they address crucial topics like peace, climate and social justice.", "De plus, elles abordent des thèmes cruciaux comme la paix, le climat et la justice sociale."]
      ]
    },
    dictation: { prompt: "Banksy uses stencils to create provocative street art.", fr: "Banksy utilise des pochoirs pour créer de l'art urbain provocateur." },
    quiz: [
      { q: "De quelle ville anglaise est originaire le célèbre artiste urbain Banksy ?", opts: ["Manchester", "Bristol", "Liverpool", "Oxford"], a: 1, exp: "Banksy a commencé son parcours artistique clandestin à Bristol dans les années 1990." },
      { q: "Quel connecteur signifie 'de plus' / 'qui plus est' à l'écrit ?", opts: ["However", "Furthermore", "Whereas", "Unless"], a: 1, exp: "'Furthermore' est un connecteur d'addition formel signifiant 'de surcroît' ou 'de plus'." },
      { q: "Quelle technique utilise un carton découpé pour vaporiser de la peinture rapidement ?", opts: ["A canvas", "A stencil", "An easel", "A pottery wheel"], a: 1, exp: "'A stencil' est le pochoir permettant de reproduire un motif rapidement à la bombe." }
    ]
  },
  {
    grade: '3e', theme_id: 'sport', num: 2,
    title: 'Jeux Paralympiques & dépassement de soi',
    title_en: 'Paralympic Spirit & Inclusion',
    objective: 'Parler d\'inclusion sportive, d\'équipements adaptés et de détermination athlétique.',
    grammar: {
      title: "Les participes présents comme adjectifs et compléments (inspiring, challenging)",
      rule: "Les formes en -ING peuvent fonctionner comme de puissants adjectifs d'impact (an inspiring performance, a thrilling race) ou décrire une action simultanée (Running with a blade, she set a record).",
      example_en: "Paralympic athletes demonstrate inspiring resilience, proving that courage overcomes physical boundaries.",
      example_fr: "Les athlètes paralympiques font preuve d'une résilience inspirante, prouvant que le courage surmonte les limites physiques.",
      tip: "Ne confondez pas : inspiring (qui inspire les autres) et inspired (qui est inspiré).",
      level_focus: "Participe présent à valeur d'adjectif ou de circonstancielle."
    },
    vocab: [
      ["Paralympics", "/ˌpærəˈlɪmpɪks/", "Noun", "les Jeux Paralympiques", "The Paralympics celebrate elite sporting excellence and inclusion.", "Les Jeux Paralympiques célèbrent l'excellence sportive et l'inclusion."],
      ["resilience", "/rɪˈzɪliəns/", "Noun", "la résilience / combativité", "Paralympians display breathtaking resilience against adversity.", "Les athlètes paralympiques font preuve d'une résilience époustouflante."],
      ["wheelchair", "/ˈwiːltʃɛər/", "Noun", "le fauteuil roulant de compétition", "Titanium wheelchairs are engineered for rapid acceleration.", "Les fauteuils en titane sont conçus pour une accélération fulgurante."],
      ["prosthetic blade", "/prɒsˈθɛtɪk bleɪd/", "Noun", "la lame prothétique en carbone", "Carbon prosthetic blades enable amputee sprinters to fly.", "Les lames prothétiques en carbone permettent aux sprinteurs de voler."],
      ["inclusion", "/ɪnˈkluːʒn/", "Noun", "l'inclusion sociale", "Sport serves as a powerful catalyst for human inclusion.", "Le sport est un formidable catalyseur d'inclusion humaine."],
      ["determination", "/dɪˌtɜːrmɪˈneɪʃn/", "Noun", "la détermination", "Pure determination carried the swimmer to a gold medal.", "Une détermination absolue a porté le nageur vers la médaille d'or."],
      ["guide runner", "/ɡaɪd ˈrʌnər/", "Noun", "le guide pour athlète non-voyant", "Visually impaired sprinters run tethered to a trusted guide runner.", "Les sprinteurs malvoyants courent liés à un guide de confiance."],
      ["inspire", "/ɪnˈspaɪər/", "Verb", "inspirer", "Their stories inspire millions of schoolchildren globally.", "Leurs parcours inspirent des millions d'élèves à travers le monde."],
      ["record", "/ˈrɛkɔːrd/", "Noun", "le record du monde", "She shattered the previous Paralympic world record.", "Elle a pulvérisé le précédent record du monde paralympique."],
      ["overcome", "/ˌoʊvərˈkʌm/", "Verb", "surmonter / triompher d'une épreuve", "Champions overcome self-doubt through rigorous training.", "Les champions surmontent leurs doutes grâce à un entraînement rigoureux."]
    ],
    dialogue: {
      title: "Hommage aux athlètes paralympiques", setting: "Des élèves préparent un exposé sur les valeurs sportives universelles.",
      lines: [
        ["Pupil", "How do visually impaired athletes compete in sprint finals?", "Comment les athlètes malvoyants concourent-ils dans les finales de sprint ?"],
        ["Teacher", "They run tethered with a short band to an inspiring guide runner.", "Ils courent reliés par un court lien à un guide coureur inspirant."],
        ["Pupil", "Their coordination and mutual trust must be extraordinary.", "Leur coordination et confiance mutuelle doivent être extraordinaires."],
        ["Teacher", "Indeed, it embodies the highest values of teamwork and determination.", "En effet, cela incarne les plus hautes valeurs de solidarité et de détermination."]
      ]
    },
    dictation: { prompt: "Paralympic champions overcome obstacles with great determination.", fr: "Les champions paralympiques surmontent les obstacles avec une grande détermination." },
    quiz: [
      { q: "Quel mot désigne les lames en fibre de carbone utilisées par les sprinteurs amputés ?", opts: ["Prosthetic blades", "Wooden sticks", "Metal shoes", "Steel poles"], a: 0, exp: "'Prosthetic blades' (lames en carbone) restituent l'énergie à chaque foulée." },
      { q: "Que signifie 'to overcome' ?", opts: ["Abandonner", "Surmonter / vaincre une difficulté", "Tomber", "Mesurer"], a: 1, exp: "'To overcome' est un verbe fort signifiant surmonter ou triompher d'une épreuve." },
      { q: "Quel est le rôle du 'guide runner' pour un athlète malvoyant ?", opts: ["Prendre des photos", "Courir à ses côtés et le guider sur la piste", "Arrêter le chronomètre", "Porter ses sacs"], a: 1, exp: "Le guide coureur synchronise sa foulée avec l'athlète et lui indique la trajectoire." }
    ]
  },
  {
    grade: '3e', theme_id: 'sport', num: 3,
    title: 'L\'escalade & les sports de montagne',
    title_en: 'Rock Climbing & Alpine Sports',
    objective: 'Parler de prise de risque mesurée, de sécurité et d\'alpinisme avec les verbes d\'avertissement.',
    grammar: {
      title: "Les propositions subordonnées de condition négative avec UNLESS",
      rule: "On utilise 'UNLESS' pour signifier 'à moins que' ou 'sauf si'. Il est déjà négatif par nature : Unless you clip your harness, you will fall (= If you don't clip your harness...).",
      example_en: "You must never climb without a helmet unless you are on a low bouldering mat.",
      example_fr: "Vous ne devez jamais grimper sans casque, à moins d'être sur un tapis de bloc bas.",
      tip: "N'ajoutez jamais de négation après unless : Unless you study (et non Unless you don't study).",
      level_focus: "Conjonction conditionnelle UNLESS (sauf si / à moins que)."
    },
    vocab: [
      ["climbing", "/ˈklaɪmɪŋ/", "Noun", "l'escalade", "Rock climbing tests both grip strength and mental focus.", "L'escalade teste la force de préhension et la concentration."],
      ["bouldering", "/ˈboʊldərɪŋ/", "Noun", "l'escalade de bloc (sans corde)", "Bouldering requires solving complex acrobatic movement problems.", "Le bloc demande de résoudre des mouvements acrobatiques complexes."],
      ["harness", "/ˈhɑːrnɪs/", "Noun", "le baudrier d'escalade", "Double-check your safety harness before leaving the ground.", "Vérifie ton baudrier de sécurité avant de décoller du sol."],
      ["rope", "/roʊp/", "Noun", "la corde d'assurage dynamique", "The dynamic rope absorbs the shock of a sudden fall.", "La corde dynamique absorbe le choc d'une chute soudaine."],
      ["carabiner", "/ˌkærəˈbiːnər/", "Noun", "le mousqueton de sécurité", "Lock the screwgate carabiner onto the anchor ring.", "Verrouille le mousqueton à vis sur l'anneau d'ancrage."],
      ["chalk", "/tʃɔːk/", "Noun", "la magnésie pour les mains", "Dip sweaty palms into your chalk bag for a secure grip.", "Plonge tes paumes dans ton sac à magnésie pour une bonne prise."],
      ["belay", "/bɪˈleɪ/", "Verb", "assurer un grimpeur", "The partner belays attentively through the safety device.", "Le partenaire assure attentivement grâce au système de frein."],
      ["summit", "/ˈsʌmɪt/", "Noun", "le sommet de la falaise", "Climbers cheered when reaching the rocky granite summit.", "Les grimpeurs ont exulté en atteignant le sommet de granit."],
      ["grip", "/ɡrɪp/", "Noun", "la prise de main / l'adhérence", "Find a solid foothold to relieve hand grip pressure.", "Trouve un appui de pied solide pour soulager la prise de main."],
      ["adrenaline", "/əˈdrɛnəlɪn/", "Noun", "l'adrénaline", "Controlled adrenaline helps athletes push past their fears.", "L'adrénaline maîtrisée aide les athlètes à dépasser leurs peurs."]
    ],
    dialogue: {
      title: "Contrôle de sécurité avant la voie", setting: "Deux grimpeurs effectuent le contrôle partenaire (buddy check).",
      lines: [
        ["Climber", "Is my figure-eight knot tied correctly into my harness?", "Mon nœud de huit est-il correctement noué à mon baudrier ?"],
        ["Belayer", "Yes, the knot has five pairs and your carabiner is locked.", "Oui, le nœud a cinq doubles brins et ton mousqueton est verrouillé."],
        ["Climber", "Remember, do not let go of the brake rope unless I am anchored at the summit.", "Rappelle-toi, ne lâche pas la corde de frein sauf si je suis ancré au sommet."],
        ["Belayer", "Understood. Belay is on, climb when you are ready!", "Compris. L'assurage est enclenché, grimpe quand tu veux !"]
      ]
    },
    dictation: { prompt: "Do not climb the cliff unless your harness is secured.", fr: "Ne grimpe pas la falaise à moins que ton baudrier ne soit sécurisé." },
    quiz: [
      { q: "Que signifie la conjonction conditionnelle 'unless' ?", opts: ["Parce que", "À moins que / sauf si", "Pendant que", "Dès que"], a: 1, exp: "'Unless' équivaut à 'if ... not' (à moins que / sauf si)." },
      { q: "À quoi sert la poudre blanche de 'chalk' (magnésie) en escalade ?", opts: ["À nettoyer la roche", "À sécher la transpiration des mains pour améliorer la prise", "À marquer le sommet", "À faire un feu"], a: 1, exp: "La magnésie absorbe la transpiration pour assurer une meilleure adhérence." },
      { q: "Quel équipement relie le grimpeur à la corde de sécurité ?", opts: ["A helmet", "A harness", "A backpack", "A compass"], a: 1, exp: "Le 'harness' est le baudrier de sécurité." }
    ]
  },
  {
    grade: '3e', theme_id: 'music', num: 2,
    title: 'Le Hip-Hop & culture urbaine engagée',
    title_en: 'Hip-Hop Culture & Social Message',
    objective: 'Analyser les origines new-yorkaises du hip-hop et son message poétique et social.',
    grammar: {
      title: "Les propositions causatives avec MAKE / HAVE SOMEONE DO SOMETHING",
      rule: "On utilise 'make someone + base verbale' (sans to) pour exprimer le fait de faire faire ou pousser à une action/réaction émotionnelle.",
      example_en: "Their powerful poetic lyrics made people think about inequality and social injustice.",
      example_fr: "Leurs paroles poétiques puissantes ont fait réfléchir les gens sur les inégalités et l'injustice sociale.",
      tip: "Make someone THINK / Make someone SMILE (base verbale nue).",
      level_focus: "Structure causative (make someone do sth) et critique culturelle."
    },
    vocab: [
      ["spoken word", "/ˌspoʊkən ˈwɜːrd/", "Noun", "la poésie déclamée / spoken word", "Spoken word poetry delivers rhythmic social commentary.", "La poésie 'spoken word' délivre un commentaire social rythmé."],
      ["urban culture", "/ˈɜːrbən ˈkʌltʃər/", "Noun", "la culture urbaine", "The Bronx was the birthplace of global urban culture.", "Le Bronx a été le berceau de la culture urbaine mondiale."],
      ["storytelling", "/ˈstɔːritɛlɪŋ/", "Noun", "l'art du récit / la narration", "Hip-hop is rooted in authentic personal storytelling.", "Le hip-hop s'enracine dans un récit personnel authentique."],
      ["beatmaker", "/ˈbiːtmeɪkər/", "Noun", "le concepteur rythmique / beatmaker", "The beatmaker samples old soul records on an MPC.", "Le beatmaker échantillonne des disques de soul sur une MPC."],
      ["sampling", "/ˈsæmplɪŋ/", "Noun", "l'échantillonnage musical", "Sampling repurposes classic jazz chords into modern grooves.", "L'échantillonnage réutilise des accords de jazz en grooves modernes."],
      ["rhyme", "/raɪm/", "Noun", "la rime poétique", "Clever multi-syllable rhymes require linguistic virtuosity.", "Des rimes multisyllabiques astucieuses exigent de la virtuosité."],
      ["social injustice", "/ˈsoʊʃl ɪnˈdʒʌstɪs/", "Noun", "l'injustice sociale", "Rappers denounced poverty, racism and social injustice.", "Les rappeurs ont dénoncé la pauvreté, le racisme et l'injustice."],
      ["authenticity", "/ˌɔːθɛnˈtɪsəti/", "Noun", "l'authenticité", "Fans value raw authenticity above commercial success.", "Les fans privilégient l'authenticité brute au succès commercial."],
      ["breakdance", "/ˈbreɪkdɑːns/", "Noun", "le breakdance / break", "Breakdance became an official Olympic discipline in Paris.", "Le breakdance est devenu une discipline olympique officielle à Paris."],
      ["express", "/ɪkˈsprɛs/", "Verb", "exprimer", "Young people use urban music to express their dreams.", "Les jeunes utilisent la musique urbaine pour exprimer leurs rêves."]
    ],
    dialogue: {
      title: "Aux origines du hip-hop dans le Bronx en 1973", setting: "Des élèves analysent l'héritage de DJ Kool Herc.",
      lines: [
        ["Pupil", "How did hip-hop start at 1520 Sedgwick Avenue in New York?", "Comment le hip-hop a-t-il commencé au 1520 Sedgwick Avenue à New York ?"],
        ["Teacher", "DJ Kool Herc isolated the percussion break on two turntables to make people dance.", "DJ Kool Herc a isolé la pause de percussion sur deux platines pour faire danser les gens."],
        ["Pupil", "And MCs began reciting rhymes to deliver social messages, didn't they?", "Et les MCs ont commencé à rimer pour faire passer des messages sociaux, n'est-ce pas ?"],
        ["Teacher", "Yes, their poetic storytelling made the world listen to marginalized urban youth.", "Oui, leurs récits poétiques ont poussé le monde à écouter la jeunesse urbaine."]
      ]
    },
    dictation: { prompt: "Poetic hip-hop lyrics made people reflect on social justice.", fr: "Les paroles poétiques de hip-hop ont fait réfléchir les gens sur la justice sociale." },
    quiz: [
      { q: "Quelle structure suit le verbe causatif 'make' ?", opts: ["Make someone to do", "Make someone do (base verbale)", "Make someone doing", "Make someone done"], a: 1, exp: "'Make' suivi d'un COD prend une base verbale sans 'to' : make someone think." },
      { q: "Dans quel quartier de New York le hip-hop est-il officiellement né en 1973 ?", opts: ["Manhattan", "The Bronx", "Queens", "Staten Island"], a: 1, exp: "Le mouvement hip-hop est né dans le Bronx lors d'une fête de quartier en 1973." },
      { q: "Que signifie la technique musicale du 'sampling' ?", opts: ["Écrire une partition", "Emprunter et réutiliser un court extrait d'un morceau existant", "Chanter faux", "Vendre des CD"], a: 1, exp: "Le 'sampling' consiste à échantillonner un extrait sonore pour créer une nouvelle œuvre." }
    ]
  },
  {
    grade: '3e', theme_id: 'music', num: 3,
    title: 'Les festivals de musique en plein air',
    title_en: 'Open-Air Music Festivals',
    objective: 'Planifier un séjour en festival de musique (Glastonbury) et parler d\'ambiance collective.',
    grammar: {
      title: "L'expression de la simultanéité avec WHILE et AS",
      rule: "On utilise 'WHILE' ou 'AS' + temps continu pour décrire deux actions simultanées en cours d'accomplissement.",
      example_en: "While the headliner was performing on the Pyramid Stage, thousands of festival-goers were singing along under the stars.",
      example_fr: "Tandis que la tête d'affiche se produisait sur la Pyramid Stage, des milliers de festivaliers chantaient en chœur sous les étoiles.",
      tip: "While insiste sur la durée partagée de deux événements parallèles.",
      level_focus: "Concordance temporelle de simultanéité (while / as + continuous)."
    },
    vocab: [
      ["headliner", "/ˈhɛdlaɪnər/", "Noun", "la tête d'affiche", "The world-famous British band was the Saturday night headliner.", "Le groupe britannique mondialement connu était la tête d'affiche du samedi."],
      ["campsite", "/ˈkæmpsaɪt/", "Noun", "le camping du festival", "Pitch your waterproof tent in the designated campsite.", "Monte ta tente imperméable dans le camping prévu."],
      ["festival-goer", "/ˈfɛstɪvl ɡoʊər/", "Noun", "le festivalier", "Over two hundred thousand festival-goers attended Glastonbury.", "Plus de deux cent mille festivaliers ont assisté à Glastonbury."],
      ["wristband", "/ˈrɪstbænd/", "Noun", "le bracelet d'accès au festival", "Keep your fabric entry wristband on throughout the weekend.", "Garde ton bracelet d'entrée en tissu tout le week-end."],
      ["stage", "/steɪdʒ/", "Noun", "la scène de festival", "The Pyramid Stage is Glastonbury's most iconic outdoor arena.", "La Pyramid Stage est la scène extérieure la plus mythique."],
      ["muddy", "/ˈmʌdi/", "Adjective", "boueux / détrempé", "Wear wellington boots when the fields turn muddy.", "Porte des bottes en caoutchouc quand les champs deviennent boueux."],
      ["live performance", "/laɪv pərˈfɔːrməns/", "Noun", "la performance en concert direct", "Nothing matches the raw energy of an outdoor live performance.", "Rien n'égale l'énergie brute d'un concert en direct."],
      ["wellington boots", "/ˈwɛlɪŋtən buːts/", "Noun", "les bottes de pluie en caoutchouc (wellies)", "Green wellington boots are British festival essentials.", "Les bottes vertes en caoutchouc sont indispensables en festival anglais."],
      ["atmosphere", "/ˈætməsfɪər/", "Noun", "l'ambiance collective", "The festival atmosphere was friendly, peaceful and ecstatic.", "L'ambiance du festival était fraternelle, pacifique et joyeuse."],
      ["crowd", "/kraʊd/", "Noun", "la foule en liesse", "The massive crowd clapped in unison to the final encore.", "La foule immense a applaudi à l'unisson pour le rappel final."]
    ],
    dialogue: {
      title: "Premier festival à Glastonbury", setting: "Deux amis montent leur tente dans un champ du Somerset.",
      lines: [
        ["Sam", "Have you put on your wellington boots? The grass is already quite muddy.", "As-tu mis tes bottes en caoutchouc ? L'herbe est déjà bien boueuse."],
        ["Chloe", "Yes! While you were pitching the tent, I collected our entry wristbands.", "Oui ! Pendant que tu montais la tente, j'ai récupéré nos bracelets."],
        ["Sam", "Listen, the opening acts have just started playing on the Other Stage.", "Écoute, les premiers groupes viennent de commencer sur la Other Stage."],
        ["Chloe", "Let's join the crowd. The atmosphere feels absolutely magical!", "Rejoignons la foule. L'ambiance semble absolument magique !"]
      ]
    },
    dictation: { prompt: "Thousands of festival-goers cheered while the band was playing.", fr: "Des milliers de festivaliers ont acclamé pendant que le groupe jouait." },
    quiz: [
      { q: "Quel festival de musique en plein air dans le Somerset est le plus vaste du Royaume-Uni ?", opts: ["Coachella", "Glastonbury", "Woodstock", "Lollapalooza"], a: 1, exp: "Le festival de Glastonbury, créé en 1970, est le plus grand festival en plein air britannique." },
      { q: "Comment les Britanniques appellent-ils familièrement leurs bottes en caoutchouc ?", opts: ["Wellies", "Sneakers", "Loafers", "Slippers"], a: 0, exp: "'Wellies' est le diminutif usuel de Wellington boots." },
      { q: "Que désigne une 'headliner' sur l'affiche d'un festival ?", opts: ["Un technicien son", "L'artiste ou groupe principal vedette", "Un agent de sécurité", "Le cuisinier"], a: 1, exp: "'Headliner' est la tête d'affiche principale programmée au festival." }
    ]
  },
  {
    grade: '3e', theme_id: 'restaurant', num: 2,
    title: 'Critiques culinaires & guides gastronomiques',
    title_en: 'Restaurant Reviews & Food Critics',
    objective: 'Rédiger une critique de restaurant argumentée avec les nuances de style et les adjectifs sensoriels.',
    grammar: {
      title: "Les propositions subordonnées de résultat avec SO... THAT et SUCH... THAT",
      rule: "On utilise 'SO + adjectif + THAT' (The soup was so delicious that I asked for the recipe), et 'SUCH + nom + THAT' (It was such a memorable meal that we celebrated for three hours).",
      example_en: "The culinary presentation was so exquisite that the Michelin inspector awarded a second star.",
      example_fr: "La présentation culinaire était si exquise que l'inspecteur Michelin a décerné une deuxième étoile.",
      tip: "So + adjectif / Such a + adjectif + nom singulier.",
      level_focus: "Structures d'intensité consécutive (so... that / such... that)."
    },
    vocab: [
      ["food critic", "/fuːd ˈkrɪtɪk/", "Noun", "le critique gastronomique", "The feared food critic dined anonymously at the bistro.", "Le critique redouté a dîné incognito au bistrot."],
      ["Michelin star", "/ˈmɪʃəlɪn stɑːr/", "Noun", "l'étoile Michelin", "The chef earned his first Michelin star for innovative cuisine.", "Le chef a décroché sa première étoile pour sa cuisine novatrice."],
      ["presentation", "/ˌprɛznˈteɪʃn/", "Noun", "le dressage de l'assiette", "Artistic plate presentation elevates simple ingredients.", "Le dressage artistique élève de simples ingrédients."],
      ["exquisite", "/ɪkˈskwɪzɪt/", "Adjective", "exquis / raffiné à l'extrême", "The steamed sea bass had an exquisite delicate aroma.", "Le bar à la vapeur avait un arôme délicat et exquis."],
      ["texture", "/ˈtɛkstʃər/", "Noun", "la texture en bouche", "Crispy roasted seeds added delightful texture to the soup.", "Des graines croustillantes apportaient une texture agréable."],
      ["flavorful", "/ˈfleɪvərfʊl/", "Adjective", "riche en saveurs / savoureux", "Her herb-infused sauce was richly flavorful.", "Sa sauce infusée d'herbes était riche en saveurs."],
      ["ambience", "/ˈæmbiəns/", "Noun", "l'ambiance du restaurant", "Soft jazz lighting created an intimate ambience.", "Un éclairage doux et du jazz créaient une ambiance intime."],
      ["disappointing", "/ˌdɪsəˈpɔɪntɪŋ/", "Adjective", "décevant", "Lukewarm fries were rather disappointing.", "Des frites tièdes étaient assez décevantes."],
      ["recommend", "/ˌrɛkəˈmɛnd/", "Verb", "recommander chaudement", "I would strongly recommend booking three weeks ahead.", "Je recommanderais vivement de réserver trois semaines à l'avance."],
      ["culinary", "/ˈkʌlɪnəri/", "Adjective", "culinaire", "London has become a vibrant capital of culinary creativity.", "Londres est devenue une capitale vibrante de créativité culinaire."]
    ],
    dialogue: {
      title: "Débriefing d'une expérience culinaire", setting: "Deux blogueurs food commentent leur dîner dans un restaurant étoilé.",
      lines: [
        ["Blogger A", "How would you rate the signature dessert we tasted tonight?", "Comment noterais-tu le dessert signature goûté ce soir ?"],
        ["Blogger B", "It was such an exceptional chocolate creation that words fail me!", "C'était une création en chocolat si exceptionnelle que les mots me manquent !"],
        ["Blogger A", "And the balance of textures was so delicate that every bite felt harmonious.", "Et l'équilibre des textures était si délicat que chaque bouchée était harmonieuse."],
        ["Blogger B", "I will definitely publish a glowing review on our culinary magazine tomorrow.", "Je publierai sans faute une critique élogieuse dans notre magazine demain."]
      ]
    },
    dictation: { prompt: "The dish was so exquisite that the critic praised the chef.", fr: "Le plat était si exquis que le critique a fait l'éloge du chef." },
    quiz: [
      { q: "Quel mot complète : 'It was ... a delicious meal that we ordered dessert' ?", opts: ["so", "such", "too", "as"], a: 1, exp: "Devant 'a delicious meal' (groupe nominal), on utilise 'such a'." },
      { q: "Quel mot complète : 'The food was ... flavorful that I finished everything' ?", opts: ["so", "such", "very", "much"], a: 0, exp: "Devant un adjectif seul ('flavorful'), on utilise 'so... that'." },
      { q: "Que signifie 'food critic' ?", opts: ["Un serveur mécontent", "Un critique gastronomique professionnel", "Un livre de recettes", "Un chef de cuisine"], a: 1, exp: "'Food critic' est le journaliste ou inspecteur critique gastronomique." }
    ]
  },
  {
    grade: '3e', theme_id: 'restaurant', num: 3,
    title: 'Cuisine végétarienne & alimentation éthique',
    title_en: 'Plant-Based Dining & Ethics',
    objective: 'Débattre des régimes végétariens et de l\'éthique animale au restaurant avec les modaux d\'obligation.',
    grammar: {
      title: "Exprimer la nécessité sans contrainte personnelle avec NEEDN'T vs MUSTN'T",
      rule: "Attention à la distinction : MUSTN'T exprime une interdiction formelle (You mustn't bring meat into this vegan café), tandis que NEEDN'T exprime l'absence de nécessité (You needn't worry, all dishes are dairy-free).",
      example_en: "You needn't check every ingredient label here because the entire menu is 100% plant-based.",
      example_fr: "Vous n'avez pas besoin de vérifier chaque étiquette d'ingrédient ici car tout le menu est 100% végétal.",
      tip: "Needn't = You don't need to (il n'est pas nécessaire de).",
      level_focus: "Modaux de nécessité et d'absence d'obligation (needn't, don't have to)."
    },
    vocab: [
      ["plant-based", "/plɑːnt beɪst/", "Adjective", "à base de plantes / végétal", "Plant-based dining has grown rapidly across British cities.", "La cuisine végétale s'est développée rapidement dans les villes britanniques."],
      ["vegan", "/ˈviːɡən/", "Noun", "le végétalien / végan", "Vegans avoid all animal-derived foods and leather products.", "Les végans évitent tout produit d'origine animale."],
      ["ethical", "/ˈɛθɪkl/", "Adjective", "éthique / moral", "Ethical farming prioritizes animal welfare and ecosystems.", "L'agriculture éthique priorise le bien-être animal et les écosystèmes."],
      ["alternatives", "/ɔːlˈtɜːrnətɪvz/", "Noun", "les alternatives végétales", "Soy and almond milks offer nutritious dairy alternatives.", "Les laits de soja et d'amande sont des alternatives nutritives."],
      ["tofu", "/ˈtoʊfuː/", "Noun", "le tofu", "Marinated smoked tofu absorbs savory spices beautifully.", "Le tofu fumé mariné absorbe magnifiquement les épices."],
      ["pulses", "/ˈpʌlsɪz/", "Noun", "les légumineuses (lentilles, pois chiches)", "Lentils and chickpeas are fiber-packed pulses.", "Lentilles et pois chiches sont des légumineuses riches en fibres."],
      ["sustainable", "/səˈsteɪnəbl/", "Adjective", "durable pour l'environnement", "Eating seasonal greens is more sustainable for our climate.", "Manger des légumes de saison est plus durable pour le climat."],
      ["carbon footprint", "/ˈkɑːrbən ˈfʊtprɪnt/", "Noun", "l'empreinte carbone alimentaire", "A plant-centered diet lowers household carbon footprints.", "Un régime végétal abaisse l'empreinte carbone des ménages."],
      ["seasoning", "/ˈsiːznɪŋ/", "Noun", "l'assaisonnement épicé", "Nutritional yeast adds a cheesy savory seasoning.", "La levure maltée apporte un assaisonnement au goût fromager."],
      ["compassion", "/kəmˈpæʃn/", "Noun", "la compassion envers les animaux", "Many young people choose vegetarianism out of compassion.", "De nombreux jeunes choisissent le végétarisme par compassion."]
    ],
    dialogue: {
      title: "Découverte d'un café végan à Brighton", setting: "Léa et Sam déjeunent dans un restaurant éco-responsable.",
      lines: [
        ["Sam", "Do I need to check whether this chocolate brownie contains eggs or butter?", "Dois-je vérifier si ce brownie au chocolat contient des œufs ou du beurre ?"],
        ["Léa", "You needn't worry at all! Everything in this café is certified 100% plant-based.", "Tu n'as pas du tout besoin de t'inquiéter ! Tout dans ce café est certifié 100% végétal."],
        ["Sam", "And the texture is so rich and fudgy! You can't taste any difference.", "Et la texture est si riche et fondante ! On ne sent aucune différence."],
        ["Léa", "Plant-based cuisine is proving that delicious taste and animal ethics go hand in hand.", "La cuisine végétale prouve que gourmandise et éthique animale vont de pair."]
      ]
    },
    dictation: { prompt: "You needn't worry, all dishes on the menu are plant-based.", fr: "Tu n'as pas besoin de t'inquiéter, tous les plats du menu sont végétaux." },
    quiz: [
      { q: "Quelle structure exprime qu'il n'est PAS NÉCESSAIRE de faire quelque chose ?", opts: ["You mustn't", "You needn't", "You can't", "You shouldn't"], a: 1, exp: "'Needn't' exprime l'absence d'obligation (ce n'est pas nécessaire)." },
      { q: "Quelle différence distingue un régime 'vegetarian' d'un régime 'vegan' ?", opts: ["Les végans mangent du poisson", "Les végans excluent tous les sous-produits animaux (œufs, lait, miel)", "Il n'y a aucune différence", "Les végétariens ne mangent pas de légumes"], a: 1, exp: "Les végétaliens (vegans) n'absorbent aucun produit d'origine animale, y compris lait et œufs." },
      { q: "Que désigne le terme nutritionnel 'pulses' en anglais ?", opts: ["Les viandes", "Les légumineuses (lentilles, haricots, pois chiches)", "Les bonbons", "Les poissons"], a: 1, exp: "'Pulses' désigne la famille des légumineuses séchées riches en protéines." }
    ]
  },
  {
    grade: '3e', theme_id: 'food', num: 2,
    title: 'Aliments ultra-transformés & étiquetage',
    title_en: 'Ultra-Processed Food & Food Labels',
    objective: 'Analyser la composition industrielle des produits alimentaires et déchiffrer les étiquettes nutritionnelles.',
    grammar: {
      title: "La voix passive avec les verbes d'opinion et de déclaration (It is said that / It is claimed that)",
      rule: "Pour rapporter des vérités scientifiques admises sans citer de chercheur en particulier : It is estimated that / It is proven that.",
      example_en: "It is widely recognized that ultra-processed foods contain excessive sugar, salt and chemical additives.",
      example_fr: "Il est largement reconnu que les aliments ultra-transformés contiennent un excès de sucre, de sel et d'additifs chimiques.",
      tip: "Structure très élégante pour une argumentation scientifique ou un examen de 3e.",
      level_focus: "Passif impersonnel journalistique (It is widely believed/proven that...)."
    },
    vocab: [
      ["ultra-processed", "/ˈʌltrə ˈproʊsɛst/", "Adjective", "ultra-transformé", "Ultra-processed snacks lack natural fiber and vitamins.", "Les en-cas ultra-transformés manquent de fibres et de vitamines."],
      ["additives", "/ˈædətɪvz/", "Noun", "les additifs alimentaires", "Artificial colorings and chemical preservatives are common additives.", "Colorants et conservateurs sont des additifs courants."],
      ["preservatives", "/prɪˈzɜːrvətɪvz/", "Noun", "les conservateurs chimiques", "Preservatives prolong supermarket shelf life artificially.", "Les conservateurs prolongent la durée de vie en rayon artificiellement."],
      ["food label", "/fuːd ˈleɪbl/", "Noun", "l'étiquette nutritionnelle", "Read the ingredients list on the food label carefully.", "Lis la liste des ingrédients sur l'étiquette attentivement."],
      ["nutritional value", "/njuːˈtrɪʃənl ˈvæljuː/", "Noun", "la valeur nutritionnelle", "Fresh apples have far higher nutritional value than candy.", "Les pommes fraîches ont une valeur nutritive bien supérieure aux bonbons."],
      ["refined sugar", "/rɪˈfaɪnd ˈʃʊɡər/", "Noun", "le sucre raffiné", "Excess refined sugar in sodas leads to metabolic issues.", "L'excès de sucre raffiné dans les sodas cause des troubles métaboliques."],
      ["traffic light system", "/ˈtræfɪk laɪt ˈsɪstəm/", "Noun", "l'étiquetage feu tricolore (Nutri-Score britannique)", "Red labels indicate high saturated fats in the traffic light system.", "Les voyants rouges signalent les graisses saturées dans le système tricolore."],
      ["healthy", "/ˈhɛlθi/", "Adjective", "bon pour la santé / sain", "A balanced diet relies on minimally processed healthy foods.", "Une alimentation équilibrée repose sur des aliments sains peu transformés."],
      ["consumer", "/kənˈsjuːmər/", "Noun", "le consommateur", "Informed consumers demand transparent ingredient origins.", "Les consommateurs informés exigent des origines transparentes."],
      ["misleading", "/mɪsˈliːdɪŋ/", "Adjective", "trompeur / mensonger", "Catchy packaging claims are often misleading.", "Les allégations aguicheuses sur les emballages sont souvent trompeuses."]
    ],
    dialogue: {
      title: "Déchiffrer un paquet de céréales industrielles", setting: "Des collégiens examinent des étiquettes en cours de SVT.",
      lines: [
        ["Pupil A", "Look at this cereal box advertising 'natural vitamins' on the front.", "Regarde cette boîte de céréales affichant 'vitamines naturelles' sur le devant."],
        ["Pupil B", "Turn it over and read the food label. Refined sugar is the second ingredient listed!", "Retourne-la et lis l'étiquette. Le sucre raffiné est le deuxième ingrédient listé !"],
        ["Pupil A", "It is shown that six chemical additives are included just for crunchiness.", "Il est démontré que six additifs chimiques sont ajoutés juste pour le croustillant."],
        ["Pupil B", "We should favor whole rolled oats with fresh fruit instead.", "Nous devrions plutôt privilégier des flocons d'avoine complets avec des fruits."]
      ]
    },
    dictation: { prompt: "It is widely recognized that fresh food has higher nutritional value.", fr: "Il est largement reconnu que les aliments frais ont une valeur nutritionnelle supérieure." },
    quiz: [
      { q: "Quelle structure passive impersonnelle introduit un constat partagé ?", opts: ["It is believed that", "They saying that", "People to say", "It has saying"], a: 0, exp: "'It is believed/recognized that' est la formule passive impersonnelle classique." },
      { q: "Que signifie le faux-ami 'preservatives' en anglais ?", opts: ["Des préservatifs", "Des conservateurs alimentaires chimiques", "Des médicaments", "Des vitamines"], a: 1, exp: "Faux-ami majeur : 'preservatives' signifie conservateurs alimentaires chimiques." },
      { q: "À quoi sert le 'traffic light system' sur les produits alimentaires britanniques ?", opts: ["À régler les feux tricolores", "À indiquer visuellement les teneurs en gras, sucre et sel par des couleurs vert/orange/rouge", "À mesurer le poids", "À indiquer l'heure"], a: 1, exp: "Le système tricolore britannique classe en vert, orange ou rouge le sel, sucre et gras." }
    ]
  },
  {
    grade: '3e', theme_id: 'food', num: 3,
    title: 'Gastronomie du Commonwealth & traditions',
    title_en: 'Commonwealth Culinary Traditions',
    objective: 'Découvrir la richesse culinaire née des échanges culturels du Commonwealth (curry, meat pies, roasts).',
    grammar: {
      title: "Les participes passés employés comme adjectifs de préparation culinaire",
      rule: "Les participes passés des verbes réguliers ou irréguliers servent à qualifier la cuisson : roasted (rôti), seasoned (assaisonné), mashed (écrasé en purée), smoked (fumé).",
      example_en: "Chicken Tikka Masala, originally cooked in Glasgow, has become a cherished British national dish.",
      example_fr: "Le poulet Tikka Masala, cuisiné à l'origine à Glasgow, est devenu un plat national britannique très cher au cœur de tous.",
      tip: "Structure : Participe passé + nom (mashed potatoes, smoked salmon).",
      level_focus: "Adjectifs participiaux et histoire culturelle de la gastronomie."
    },
    vocab: [
      ["Sunday roast", "/ˈsʌndeɪ roʊst/", "Noun", "le rôti traditionnel du dimanche", "A traditional British Sunday roast features beef, Yorkshire pudding and gravy.", "Le rôti dominical comprend bœuf, Yorkshire pudding et sauce gravy."],
      ["Yorkshire pudding", "/ˈjɔːrkʃər ˈpʊdɪŋ/", "Noun", "le Yorkshire pudding (pâte soufflée au four)", "Puffy golden Yorkshire puddings absorb rich brown gravy.", "Les Yorkshire puddings dorés et soufflés absorbent le jus de viande."],
      ["curry", "/ˈkʌri/", "Noun", "le curry indien / anglo-indien", "Spicy aromatic curries reflect historical ties with South Asia.", "Les currys parfumés reflètent les liens historiques avec l'Asie du Sud."],
      ["gravy", "/ˈɡreɪvi/", "Noun", "le jus de viande / sauce brune", "Pour warm beef gravy over roasted potatoes.", "Verse du jus de bœuf chaud sur les pommes de terre rôties."],
      ["fish and chips", "/fɪʃ ənd tʃɪps/", "Noun", "le poisson pané avec frites", "Crispy battered cod served with thick hand-cut chips.", "Du cabillaud croustillant servi avec des frites épaisses."],
      ["shortbread", "/ˈʃɔːrtbrɛd/", "Noun", "le sablé pur beurre écossais", "Crumbly Scottish shortbread baked with pure butter.", "Du sablé écossais friable préparé avec du pur beurre."],
      ["chutney", "/ˈtʃʌtni/", "Noun", "le chutney (condiment aigre-doux)", "Mango chutney pairs delightfully with sharp cheddar cheese.", "Le chutney de mangue se marie délicieusement avec le cheddar affiné."],
      ["spices", "/ˈspaɪsɪz/", "Noun", "les épices aromatiques", "Cardamom, cumin and turmeric bring vibrant golden colors.", "Cardamome, cumin et curcuma apportent des couleurs dorées éclatantes."],
      ["heritage", "/ˈhɛrɪtɪdʒ/", "Noun", "l'héritage culturel", "Culinary heritage embodies centuries of cultural dialogue.", "L'héritage culinaire incarne des siècles de dialogue culturel."],
      ["comfort food", "/ˈkʌmfərt fuːd/", "Noun", "la cuisine réconfortante / plats doudous", "Shepherd's pie is the ultimate winter comfort food in Britain.", "Le hachis parmentier (Shepherd's pie) est le plat réconfortant suprême en hiver."]
    ],
    dialogue: {
      title: "Repas du dimanche à Manchester", setting: "Une famille prépare la table pour le Sunday Roast traditionnel.",
      lines: [
        ["Grandmother", "Take the roasted potatoes out of the oven, please, Oliver.", "Sors les pommes de terre rôties du four, s'il te plaît, Oliver."],
        ["Oliver", "Look how puffy the Yorkshire puddings look! Shall I pour the hot gravy?", "Regarde comme les Yorkshire puddings ont gonflé ! Dois-je verser la sauce gravy ?"],
        ["Grandmother", "Yes, and don't forget the mint sauce and steamed garden peas.", "Oui, et n'oublie pas la sauce à la menthe et les petits pois vapeur."],
        ["Oliver", "The Sunday roast is truly our favourite family tradition of the week.", "Le rôti du dimanche est vraiment notre tradition familiale préférée de la semaine."]
      ]
    },
    dictation: { prompt: "A traditional Sunday roast includes roasted beef and warm gravy.", fr: "Un rôti traditionnel du dimanche comprend du bœuf rôti et de la sauce chaude." },
    quiz: [
      { q: "Qu'est-ce que la sauce 'gravy' au Royaume-Uni ?", opts: ["Une vinaigrette", "Un jus de viande mijoté et épaissi servi sur le rôti", "Une mayonnaise", "Un coulis de fruits"], a: 1, exp: "Le 'gravy' est le jus de viande mijoté chaud emblématique des tables britanniques." },
      { q: "Quelle célèbre spécialité pâtissière friable pur beurre provient d'Écosse ?", opts: ["Pancakes", "Shortbread", "Croissants", "Waffles"], a: 1, exp: "Le 'shortbread' est le sablé traditionnel écossais préparé avec sucre, beurre et farine." },
      { q: "Dans quelle ville écossaise la recette du Chicken Tikka Masala a-t-elle été popularisée ?", opts: ["Glasgow", "Dublin", "Cardiff", "Belfast"], a: 0, exp: "Le Chicken Tikka Masala a été créé et popularisé dans les cuisines de Glasgow dans les années 1970." }
    ]
  },
  {
    grade: '3e', theme_id: 'work', num: 2,
    title: 'Droit du travail & jobs d\'été',
    title_en: 'Youth Labor Rights & Summer Jobs',
    objective: 'Comprendre un contrat de travail saisonnier et les droits des mineurs (horaires, salaire minimum).',
    grammar: {
      title: "L'obligation légale avec BE ENTITLED TO et HAVE TO",
      rule: "On utilise 'be entitled to + nom / infinitif' pour exprimer un droit légalement garanti : Young workers are entitled to regular rest breaks.",
      example_en: "Every seasonal employee is entitled to the national minimum wage and paid rest breaks.",
      example_fr: "Chaque employé saisonnier a droit au salaire minimum légal et à des pauses rémunérées.",
      tip: "Structure essentielle pour les droits civiques et le monde professionnel.",
      level_focus: "Structures de droits et devoirs légaux (be entitled to, be required to)."
    },
    vocab: [
      ["summer job", "/ˈsʌmər dʒɒb/", "Noun", "le job d'été / emploi saisonnier", "Working a summer job teaches financial independence.", "Occuper un job d'été enseigne l'indépendance financière."],
      ["minimum wage", "/ˈmɪnɪməm weɪdʒ/", "Noun", "le salaire minimum légal", "The national minimum wage protects workers from exploitation.", "Le salaire minimum protège les travailleurs de l'exploitation."],
      ["contract", "/ˈkɒntrækt/", "Noun", "le contrat de travail", "Read every clause of your written employment contract.", "Lis chaque clause de ton contrat de travail écrit."],
      ["payslip", "/ˈpeɪslɪp/", "Noun", "la fiche de paie / bulletin de salaire", "Your payslip details gross pay and national insurance deductions.", "Ta fiche de paie détaille le salaire brut et les cotisations."],
      ["rest break", "/rɛst breɪk/", "Noun", "la pause de repos réglementaire", "Minors are entitled to a thirty-minute rest break after four hours.", "Les mineurs ont droit à 30 minutes de pause après quatre heures."],
      ["overtime", "/ˈoʊvərtaɪm/", "Noun", "les heures supplémentaires", "Teenagers are not permitted to work night overtime.", "Les adolescents ne sont pas autorisés à faire des heures de nuit."],
      ["employer", "/ɪmˈplɔɪər/", "Noun", "l'employeur", "A responsible employer guarantees a safe working environment.", "Un employeur responsable garantit un environnement de travail sûr."],
      ["employee", "/ɪmˈplɔɪiː/", "Noun", "l'employé / le salarié", "Employees must follow workplace safety rules.", "Les salariés doivent respecter les règles de sécurité."],
      ["hourly rate", "/ˈaʊərli reɪt/", "Noun", "le taux horaire de rémunération", "The legal hourly rate increases as you turn eighteen.", "Le taux horaire légal augmente lorsque l'on atteint dix-huit ans."],
      ["rights", "/raɪts/", "Noun", "les droits professionnels", "Know your legal labor rights before signing an offer.", "Connais tes droits du travail avant de signer une offre."]
    ],
    dialogue: {
      title: "Signature d'un premier job d'été", setting: "Une collégienne de 16 ans signe son contrat dans une librairie de Brighton.",
      lines: [
        ["Manager", "Here is your summer job contract, Chloe. You will work twenty hours a week.", "Voici ton contrat de job d'été, Chloe. Tu travailleras vingt heures par semaine."],
        ["Chloe", "Am I entitled to regular rest breaks during full shifts?", "Ai-je droit à des pauses de repos régulières lors des longues journées ?"],
        ["Manager", "Yes, of course! You are entitled to thirty minutes of rest every four hours and paid holidays.", "Oui, bien sûr ! Tu as droit à trente minutes toutes les quatre heures et des congés payés."],
        ["Chloe", "Thank you, sir. I am looking forward to welcoming customers.", "Merci, monsieur. J'ai hâte d'accueillir les clients."]
      ]
    },
    dictation: { prompt: "Seasonal workers are entitled to the minimum wage and rest breaks.", fr: "Les travailleurs saisonniers ont droit au salaire minimum et à des pauses." },
    quiz: [
      { q: "Quelle structure exprime le fait d'avoir un droit légalement reconnu ?", opts: ["Be forced to", "Be entitled to", "Be opposed to", "Be willing to"], a: 1, exp: "'To be entitled to' signifie avoir droit légalement à quelque chose." },
      { q: "Que désigne un 'payslip' ?", opts: ["Une demande de congé", "Un bulletin de salaire / fiche de paie", "Un tablier de travail", "Un badge d'accès"], a: 1, exp: "'Payslip' est le bulletin de paie détaillant les heures et le salaire versé." },
      { q: "Que signifie 'overtime' ?", opts: ["L'heure du déjeuner", "Les heures supplémentaires", "La pause café", "Le temps libre"], a: 1, exp: "'Overtime' désigne les heures supplémentaires travaillées au-delà du contrat." }
    ]
  },
  {
    grade: '3e', theme_id: 'work', num: 3,
    title: 'Entrepreneuriat & monter sa micro-entreprise',
    title_en: 'Youth Entrepreneurship & Startups',
    objective: 'Pitcher une idée d\'entreprise innovante et durable en utilisant le conditionnel et les connecteurs logiques.',
    grammar: {
      title: "Les propositions subordonnées de conséquence avec THEREFORE et AS A RESULT",
      rule: "Dans une présentation d'affaires ou un pitch : 'therefore' (par conséquent) et 'as a result' (en conséquence) expriment la déduction logique.",
      example_en: "Our packaging is 100% compostable; therefore, our startup eliminates single-use plastics.",
      example_fr: "Notre emballage est 100% compostable ; par conséquent, notre startup élimine les plastiques jetables.",
      tip: "Therefore se place souvent après un point-virgule ou en début de phrase suivi d'une virgule.",
      level_focus: "Connecteurs de conséquence formelle (therefore, as a result, consequently)."
    },
    vocab: [
      ["entrepreneur", "/ˌɒntrəprəˈnɜːr/", "Noun", "l'entrepreneur / créateur d'entreprise", "Young entrepreneurs launch ventures solving ecological crises.", "De jeunes entrepreneurs lancent des projets résolvant des crises écologiques."],
      ["startup", "/ˈstɑːrtʌp/", "Noun", "la jeune pousse / startup", "The clean-tech startup raised funding from ethical investors.", "La startup verte a levé des fonds auprès d'investisseurs éthiques."],
      ["pitch", "/pɪtʃ/", "Noun", "le pitch / présentation synthétique", "Deliver a compelling three-minute pitch to potential partners.", "Présente un pitch convaincant de trois minutes aux partenaires."],
      ["business plan", "/ˈbɪznəs plæn/", "Noun", "le plan d'affaires / business plan", "A solid business plan outlines costs, revenue and growth.", "Un business plan solide détaille les coûts, recettes et la croissance."],
      ["prototype", "/ˈproʊtətaɪp/", "Noun", "le prototype initial", "Test the 3D-printed prototype with target customers.", "Teste le prototype imprimé en 3D auprès de clients cibles."],
      ["funding", "/ˈfʌndɪŋ/", "Noun", "le financement / la levée de fonds", "Crowdfunding allows citizens to finance projects directly.", "Le financement participatif permet aux citoyens de financer directement."],
      ["innovative", "/ˈɪnəveɪtɪv/", "Adjective", "innovant / avant-gardiste", "Their innovative solar charging backpack won first prize.", "Leur sac à dos innovant à recharge solaire a remporté le premier prix."],
      ["market", "/ˈmɑːrkɪt/", "Noun", "le marché économique", "Identify an unmet demand in the youth market.", "Identifie une demande non satisfaite sur le marché des jeunes."],
      ["revenue", "/ˈrɛvənjuː/", "Noun", "les revenus / le chiffre d'affaires", "Reinvest annual revenues into green research and development.", "Réinvestis les revenus annuels dans la recherche et développement verte."],
      ["launch", "/lɔːntʃ/", "Verb", "lancer / commercialiser", "Launch your sustainable clothing line online.", "Lance ta ligne de vêtements durables en ligne."]
    ],
    dialogue: {
      title: "Le concours de mini-entreprises du collège", setting: "Une équipe d'élèves pitche devant un jury d'entrepreneurs.",
      lines: [
        ["Pitcher", "Millions of plastic toothbrushes pollute oceans every month.", "Des millions de brosses à dents en plastique polluent les océans chaque mois."],
        ["Juror", "What solution does your youth enterprise propose?", "Quelle solution votre entreprise de jeunes propose-t-elle ?"],
        ["Pitcher", "We designed a modular bamboo handle with recyclable heads; therefore, waste is cut by 90%.", "Nous avons conçu un manche en bambou à têtes recyclables ; par conséquent, les déchets chutent de 90%."],
        ["Juror", "Impressive innovation! Your business plan demonstrates real viability.", "Innovation impressionnante ! Votre business plan montre une vraie viabilité."]
      ]
    },
    dictation: { prompt: "Our product is eco-friendly; therefore, it reduces plastic waste.", fr: "Notre produit est écologique ; par conséquent, il réduit les déchets plastiques." },
    quiz: [
      { q: "Quel connecteur formel exprime 'par conséquent' dans une présentation ?", opts: ["Although", "Therefore", "Because", "Unless"], a: 1, exp: "'Therefore' exprime la conséquence logique ('par conséquent' / 'donc')." },
      { q: "Qu'est-ce qu'un 'pitch' en entrepreneuriat ?", opts: ["Un terrain de foot", "Une présentation courte et percutante d'un projet", "Un contrat de vente", "Une facture"], a: 1, exp: "Un 'pitch' est une présentation orale synthétique destinée à convaincre en quelques minutes." },
      { q: "Que signifie 'crowdfunding' ?", opts: ["Le financement participatif par la foule de citoyens", "Un emprunt bancaire lourd", "Une taxe d'État", "Une faillite"], a: 0, exp: "Le 'crowdfunding' est le financement participatif où de nombreux particuliers investissent." }
    ]
  },
  {
    grade: '3e', theme_id: 'school_social', num: 2,
    title: 'Les métiers du droit & de la justice',
    title_en: 'Legal Careers & Courtroom Professions',
    objective: 'Comprendre le fonctionnement d\'un tribunal anglo-saxon et le rôle des avocats et magistrats.',
    grammar: {
      title: "L'expression de la présomption d'innocence avec BE CONSIDERED (passif d'état)",
      rule: "Dans le système judiciaire anglo-saxon de Common Law : Every accused person is considered innocent until proven guilty.",
      example_en: "The defendant is considered innocent until proven guilty beyond all reasonable doubt.",
      example_fr: "L'accusé est considéré comme innocent jusqu'à ce que sa culpabilité soit prouvée au-delà de tout doute raisonnable.",
      tip: "Structure : be considered + adjectif / nom (sans 'as').",
      level_focus: "Formules juridiques passives (be considered, be sentenced, be charged)."
    },
    vocab: [
      ["lawyer", "/ˈlɔːjər/", "Noun", "l'avocat / juriste", "A defense lawyer protects citizens' civil rights.", "Un avocat de la défense protège les droits civiques."],
      ["barrister", "/ˈbærɪstər/", "Noun", "l'avocat plaidant en cour (UK)", "British barristers wear traditional white wigs in high courts.", "Les barristers britanniques portent des perruques blanches dans les cours."],
      ["judge", "/dʒʌdʒ/", "Noun", "le juge / magistrat", "The impartial judge ensures courtroom procedures are respected.", "Le juge impartial s'assure du respect des procédures."],
      ["jury", "/ˈdʒʊəri/", "Noun", "le jury de citoyens (12 jurés)", "Twelve citizens form the jury to deliver a verdict.", "Douze citoyens composent le jury pour rendre un verdict."],
      ["courtroom", "/ˈkɔːrtruːm/", "Noun", "la salle d'audience du tribunal", "Silence fell as the judge entered the historic courtroom.", "Le silence s'est fait quand le juge est entré dans la salle d'audience."],
      ["verdict", "/ˈvɜːrdɪkt/", "Noun", "le verdict judiciaire", "The jury reached a unanimous verdict of not guilty.", "Le jury est parvenu à un verdict unanime de non-culpabilité."],
      ["witness", "/ˈwɪtnəs/", "Noun", "le témoin", "The key witness swore an oath to tell the whole truth.", "Le témoin clé a prêté serment de dire toute la vérité."],
      ["trial", "/ˈtraɪəl/", "Noun", "le procès judiciaire", "A fair public trial is guaranteed by international human rights.", "Un procès public équitable est garanti par les droits humains."],
      ["innocent", "/ˈɪnəsnt/", "Adjective", "innocent", "An accused person is presumed innocent until proven guilty.", "Une personne accusée est présumée innocente jusqu'à preuve du contraire."],
      ["justice", "/ˈdʒʌstɪs/", "Noun", "la justice / l'équité", "Justice must be blind to wealth and social background.", "La justice doit être aveugle à la richesse et à l'origine sociale."]
    ],
    dialogue: {
      title: "Visite de l'Old Bailey à Londres", setting: "Des élèves de troisième visitent la cour criminelle centrale de Londres.",
      lines: [
        ["Pupil", "Why do British barristers and judges wear horsehair wigs in court?", "Pourquoi les avocats et juges britanniques portent-ils des perruques en crin de cheval ?"],
        ["Guide", "The wig symbolizes impartiality and the solemn authority of the law, not individual vanity.", "La perruque symbolise l'impartialité et l'autorité solennelle de la loi."],
        ["Pupil", "How many people serve on a British criminal jury?", "Combien de personnes siègent dans un jury criminel britannique ?"],
        ["Guide", "Twelve ordinary citizens are sworn in to evaluate evidence and decide the verdict.", "Douze citoyens ordinaires prêtent serment pour évaluer les preuves et décider du verdict."]
      ]
    },
    dictation: { prompt: "Every person is considered innocent until proven guilty.", fr: "Toute personne est considérée innocente jusqu'à preuve du contraire." },
    quiz: [
      { q: "Comment s'appelle l'avocat qui plaide devant les cours de justice au Royaume-Uni ?", opts: ["A solicitor", "A barrister", "A police officer", "A mayor"], a: 1, exp: "Au Royaume-Uni, le 'barrister' est l'avocat spécialisé dans la plaidoirie en cour." },
      { q: "Combien de jurés composent un jury criminel en Angleterre et aux États-Unis ?", opts: ["6", "10", "12", "15"], a: 2, exp: "Le jury traditionnel en Common Law est composé de 12 citoyens jurés." },
      { q: "Que signifie 'courtroom' ?", opts: ["La cour de récréation", "La salle d'audience du tribunal", "Le commissariat", "La prison"], a: 1, exp: "'Courtroom' désigne la salle d'audience où se tient le procès." }
    ]
  }
];
