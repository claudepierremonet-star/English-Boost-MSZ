// 19 additional lessons for 4e (Quatrième - Cycle 4 / A2–A2+)

export const SPECS_4E = [
  {
    grade: '4e', theme_id: 'daily_life', num: 2,
    title: 'Les technologies du quotidien & smartphones',
    title_en: 'Everyday Tech & Mobile Life',
    objective: 'Parler de l\'usage raisonné des écrans et technologies avec le passé continu (Past Continuous).',
    grammar: {
      title: "Le Passé Continu (WAS / WERE + V-ing) et l'interruption avec WHEN",
      rule: "On utilise le passé continu pour décrire une action qui était en train de se dérouler dans le passé, souvent interrompue par une action brève au prétérit simple introduite par WHEN.",
      example_en: "I was sending a text message when my battery suddenly ran out.",
      example_fr: "J'étais en train d'envoyer un SMS lorsque ma batterie s'est subitement déchargée.",
      tip: "Action longue = was/were + -ing / Action brève coupante = prétérit simple.",
      level_focus: "Past Continuous, concordance temporelle past continuous + past simple avec while/when."
    },
    vocab: [
      ["smartphone", "/ˈsmɑːrtfoʊn/", "Noun", "le smartphone", "Charge your smartphone before leaving home.", "Recharge ton smartphone avant de quitter la maison."],
      ["notification", "/ˌnoʊtɪfɪˈkeɪʃn/", "Noun", "la notification", "Turn off noisy notifications during class.", "Désactive les notifications bruyantes pendant les cours."],
      ["charger", "/ˈtʃɑːrdʒər/", "Noun", "le chargeur", "Plug the fast charger into the wall socket.", "Branche le chargeur rapide dans la prise murale."],
      ["battery life", "/ˈbætəri laɪf/", "Noun", "l'autonomie de la batterie", "Low brightness saves valuable battery life.", "Une faible luminosité préserve l'autonomie de la batterie."],
      ["social media", "/ˈsoʊʃl ˈmiːdiə/", "Noun", "les réseaux sociaux", "Limit the hours you spend on social media.", "Limite les heures que tu passes sur les réseaux sociaux."],
      ["download", "/ˌdaʊnˈloʊd/", "Verb", "télécharger", "Download the educational language podcast.", "Télécharge le podcast éducatif de langues."],
      ["screen", "/skriːn/", "Noun", "l'écran", "Clean fingerprints off the touch screen.", "Nettoie les traces de doigts sur l'écran tactile."],
      ["distraction", "/dɪˈstrækʃn/", "Noun", "la source de distraction", "Mute phones to avoid digital distraction.", "Mets les téléphones en silencieux pour éviter les distractions."],
      ["app", "/æp/", "Noun", "l'application mobile", "This flashcard app boosts vocabulary retention.", "Cette application de cartes mémoire renforce la mémorisation."],
      ["text message", "/tɛkst ˈmɛsɪdʒ/", "Noun", "le SMS / texto", "Send a quick text message to confirm our meeting.", "Envoie un court SMS pour confirmer notre rendez-vous."]
    ],
    dialogue: {
      title: "Une panne de batterie inattendue", setting: "Lucas et Maya discutent de leur trajet en bus.",
      lines: [
        ["Maya", "Why didn't you answer my text message yesterday afternoon, Lucas?", "Pourquoi n'as-tu pas répondu à mon SMS hier après-midi, Lucas ?"],
        ["Lucas", "I was listening to a podcast when my phone suddenly switched off.", "J'étais en train d'écouter un podcast quand mon téléphone s'est éteint d'un coup."],
        ["Maya", "Did your battery run out?", "Ta batterie était-elle à plat ?"],
        ["Lucas", "Yes, and I had forgotten my portable charger at home!", "Oui, et j'avais oublié mon chargeur portable à la maison !"]
      ]
    },
    dictation: { prompt: "I was charging my phone when the alarm rang.", fr: "J'étais en train de charger mon téléphone quand l'alarme a sonné." },
    quiz: [
      { q: "Quelle structure correspond au passé continu ?", opts: ["I am charging", "I was charging", "I charged", "I will charge"], a: 1, exp: "Le passé continu se forme avec was/were + verbe en -ing." },
      { q: "Quel mot de liaison introduit généralement l'action brève au prétérit simple ?", opts: ["While", "When", "Because", "Although"], a: 1, exp: "'When' introduit typiquement l'action brève soudaine au prétérit." },
      { q: "Que signifie 'battery life' ?", opts: ["La marque de la batterie", "L'autonomie de la batterie", "Le câble", "La garantie"], a: 1, exp: "'Battery life' désigne la durée d'autonomie d'une batterie." }
    ]
  },
  {
    grade: '4e', theme_id: 'daily_life', num: 3,
    title: 'La vie en communauté & règles de vie',
    title_en: 'Living with Siblings & Compromise',
    objective: 'Exprimer des règles familiales et des compromis avec BE ALLOWED TO et BE SUPPOSED TO.',
    grammar: {
      title: "L'autorisation avec BE ALLOWED TO et l'attente avec BE SUPPOSED TO",
      rule: "On utilise 'be allowed to' pour parler de ce qui est permis ou interdit (permission extérieure), et 'be supposed to' pour ce qui est attendu selon les règles.",
      example_en: "We are allowed to watch television on Fridays, but we are supposed to finish homework first.",
      example_fr: "Nous avons le droit de regarder la télévision le vendredi, mais nous sommes censés terminer les devoirs d'abord.",
      tip: "Négation : We are NOT allowed to play loud music after 9 pm.",
      level_focus: "Structures passives modales : be allowed to, be supposed to."
    },
    vocab: [
      ["compromise", "/ˈkɒmprəmaɪz/", "Noun", "le compromis", "Siblings must find a fair compromise.", "Frères et sœurs doivent trouver un compromis équitable."],
      ["privacy", "/ˈprɪvəsi/", "Noun", "la vie privée / l'intimité", "Knock before entering to respect privacy.", "Frappe avant d'entrer pour respecter l'intimité."],
      ["share", "/ʃɛər/", "Verb", "partager", "They share a bedroom with twin beds.", "Ils partagent une chambre avec des lits jumeaux."],
      ["household rules", "/ˈhaʊshoʊld ruːlz/", "Noun", "les règles de la maison", "Clear household rules prevent bitter arguments.", "Des règles familiales claires évitent les disputes."],
      ["argue", "/ˈɑːrɡjuː/", "Verb", "se disputer / argumenter", "Do not argue over the television remote.", "Ne vous disputez pas pour la télécommande de la télévision."],
      ["turn", "/tɜːrn/", "Noun", "le tour de rôle", "It is your turn to wash the dinner plates.", "C'est ton tour de laver les assiettes du dîner."],
      ["agreement", "/əˈɡriːmənt/", "Noun", "l'accord / l'entente", "They reached a peaceful agreement yesterday.", "Ils sont parvenus à un accord pacifique hier."],
      ["chores", "/tʃɔːrz/", "Noun", "les corvées ménagères", "Distribute weekly chores fairly.", "Répartissez les corvées hebdomadaires équitablement."],
      ["fair", "/fɛər/", "Adjective", "juste / équitable", "A timetable makes family duties fair.", "Un planning rend les devoirs familiaux équitables."],
      ["patience", "/ˈpeɪʃns/", "Noun", "la patience", "Living together in harmony requires patience.", "Vivre ensemble en harmonie exige de la patience."]
    ],
    dialogue: {
      title: "Partage de la chambre", setting: "Deux sœurs trouvent un arrangement pour leur bureau commun.",
      lines: [
        ["Emma", "You are supposed to tidy your side of the desk before dinner, Zoe.", "Tu es censée ranger ton côté du bureau avant le dîner, Zoe."],
        ["Zoe", "I know, I was studying maths. Can we make a compromise?", "Je sais, j'étudiais les maths. Pouvons-nous trouver un compromis ?"],
        ["Emma", "If you put away your notebooks now, you are allowed to choose our evening film.", "Si tu ranges tes cahiers maintenant, tu auras le droit de choisir notre film ce soir."],
        ["Zoe", "Deal! Thank you for being so patient.", "Marché conclu ! Merci d'être si patiente."]
      ]
    },
    dictation: { prompt: "We are allowed to watch films after finishing our homework.", fr: "Nous avons le droit de regarder des films après avoir terminé nos devoirs." },
    quiz: [
      { q: "Quelle structure exprime l'autorisation officielle ou familiale ?", opts: ["Be allowed to", "Be wanted to", "Be liked to", "Be supposed by"], a: 0, exp: "'To be allowed to' signifie avoir la permission / l'autorisation de faire quelque chose." },
      { q: "Que signifie 'to be supposed to' ?", opts: ["Avoir peur de", "Être censé / devoir selon la règle", "Être puni", "Vouloir"], a: 1, exp: "'Be supposed to' signifie être censé ou attendu selon une norme ou règle." },
      { q: "Comment dit-on 'C'est ton tour' en anglais ?", opts: ["It is your line.", "It is your turn.", "It is your way.", "It is your hour."], a: 1, exp: "'It is your turn' est l'expression consacrée pour 'c'est ton tour'." }
    ]
  },
  {
    grade: '4e', theme_id: 'travel', num: 2,
    title: 'L\'Irlande & ses paysages côtiers',
    title_en: 'Ireland & Emerald Coastlines',
    objective: 'Décrire des paysages naturels sauvages et utiliser le futur avec WILL pour des prédictions.',
    grammar: {
      title: "Le futur de prédiction avec WILL / WON'T",
      rule: "On utilise 'will + base verbale' pour faire des prédictions ou exprimer ce qui arrivera selon nos certitudes.",
      example_en: "You will love the Cliffs of Moher and the Atlantic waves will amaze you.",
      example_fr: "Tu adoreras les falaises de Moher et les vagues de l'Atlantique t'émerveilleront.",
      tip: "À la forme négative, la contraction est WON'T (It won't rain all day).",
      level_focus: "Futur avec WILL/WON'T, expressions de certitude (I think, probably, definitely)."
    },
    vocab: [
      ["cliffs", "/klɪfs/", "Noun", "les falaises", "The Cliffs of Moher rise two hundred metres above the sea.", "Les falaises de Moher s'élèvent à deux cents mètres au-dessus de la mer."],
      ["coastline", "/ˈkoʊstlaɪn/", "Noun", "le littoral / la côte", "Ireland boasts an enchanting rugged coastline.", "L'Irlande s'enorgueillit d'un littoral sauvage enchanteur."],
      ["ferry", "/ˈfɛri/", "Noun", "le ferry / transbordeur", "Take a ferry to the remote Aran Islands.", "Prends un ferry vers les îles d'Aran isolées."],
      ["emerald", "/ˈɛmərəld/", "Noun", "l'émeraude / vert émeraude", "Ireland is nicknamed the Emerald Isle.", "L'Irlande est surnommée l'Île d'Émeraude."],
      ["green hills", "/ɡriːn hɪlz/", "Noun", "les collines verdoyantes", "Sheep graze peacefully on misty green hills.", "Des moutons paissent paisiblement sur les collines verdoyantes."],
      ["scenery", "/ˈsiːnəri/", "Noun", "le paysage / le décor naturel", "Wild Atlantic scenery inspires poetical souls.", "Les paysages sauvages de l'Atlantique inspirent les âmes poétiques."],
      ["breeze", "/briːz/", "Noun", "la brise marine", "A cool sea breeze rustles the heather.", "Une brise marine fraîche fait bruisser la bruyère."],
      ["fog", "/fɒɡ/", "Noun", "le brouillard / la brume", "Thick sea fog rolled over the rocky bay.", "Un épais brouillard marin a envahi la baie rocheuse."],
      ["lighthouse", "/ˈlaɪthaʊs/", "Noun", "le phare marin", "The white lighthouse warns ships in the dark.", "Le phare blanc avertit les navires dans l'obscurité."],
      ["hiking", "/ˈhaɪkɪŋ/", "Noun", "la randonnée pédestre", "Coastal hiking requires waterproof hiking boots.", "La randonnée côtière nécessite des chaussures de marche étanches."]
    ],
    dialogue: {
      title: "Sur le Wild Atlantic Way", setting: "Deux randonneurs contemplent l'océan Atlantique en Irlande.",
      lines: [
        ["Liam", "Look at those majestic cliffs dropping into the Atlantic Ocean!", "Regarde ces falaises majestueuses qui tombent dans l'océan Atlantique !"],
        ["Sarah", "Will the sea fog lift before this afternoon?", "Est-ce que le brouillard marin se dissipera avant cet après-midi ?"],
        ["Liam", "The weather forecast says the sun will break through around two o'clock.", "La météo dit que le soleil percera vers quatorze heures."],
        ["Sarah", "Then our hike towards the lighthouse will be magnificent.", "Alors notre randonnée vers le phare sera magnifique."]
      ]
    },
    dictation: { prompt: "The Atlantic breeze will blow across the green hills.", fr: "La brise atlantique soufflera à travers les collines verdoyantes." },
    quiz: [
      { q: "Quel est le surnom célèbre de l'Irlande en raison de sa verdure ?", opts: ["The Golden Island", "The Emerald Isle", "The Diamond Coast", "The Silver Realm"], a: 1, exp: "L'Irlande est traditionnellement surnommée 'The Emerald Isle' (l'Île d'Émeraude)." },
      { q: "Quelle est la forme contractée négative de 'will not' ?", opts: ["Willn't", "Won't", "Wont't", "Don't will"], a: 1, exp: "La contraction régulière de 'will not' est 'won't'." },
      { q: "Que signifie 'lighthouse' ?", opts: ["Un château fort", "Un phare maritime", "Une maison blanche", "Un voilier"], a: 1, exp: "'Lighthouse' est le phare côtier qui guide les navires." }
    ]
  },
  {
    grade: '4e', theme_id: 'travel', num: 3,
    title: 'Road trip américain & Route 66',
    title_en: 'American Road Trip & Route 66',
    objective: 'Parler d\'un voyage itinérant aux USA avec BE GOING TO pour des projets planifiés.',
    grammar: {
      title: "L'expression du projet planifié avec BE GOING TO",
      rule: "On utilise 'be going to + base verbale' pour annoncer une intention ou un projet déjà préparé dans le temps.",
      example_en: "Next summer, our family is going to rent an electric campervan and drive along Route 66.",
      example_fr: "L'été prochain, notre famille va louer un camping-car électrique et rouler le long de la Route 66.",
      tip: "We ARE GOING TO visit the Grand Canyon. (Projet fermement établi).",
      level_focus: "Futur d'intention be going to vs futur spontané will."
    },
    vocab: [
      ["highway", "/ˈhaɪweɪ/", "Noun", "l'autoroute américaine", "The highway stretches through endless red deserts.", "L'autoroute s'étend à travers des déserts rouges sans fin."],
      ["motel", "/moʊˈtɛl/", "Noun", "le motel en bord de route", "Neon signs advertise vacancies at the roadside motel.", "Des enseignes au néon annoncent des chambres au motel."],
      ["rental car", "/ˈrɛntl kɑːr/", "Noun", "la voiture de location", "Pick up your rental car at Chicago airport.", "Récupérez votre voiture de location à l'aéroport de Chicago."],
      ["desert", "/ˈdɛzərt/", "Noun", "le désert", "Cacti dot the dry Arizona desert.", "Des cactus parsèment le désert aride de l'Arizona."],
      ["landmark", "/ˈlændmɑːrk/", "Noun", "le monument / point de repère célèbre", "The Grand Canyon is an awe-inspiring natural landmark.", "Le Grand Canyon est un site naturel grandiose."],
      ["gas station", "/ɡæs ˈsteɪʃn/", "Noun", "la station-service", "Fill up the petrol tank at the next gas station.", "Fais le plein d'essence à la prochaine station-service."],
      ["diner", "/ˈdaɪnər/", "Noun", "le diner américain traditionnel", "Eat milkshakes and pancakes at a retro 1950s diner.", "Déguste des milk-shakes dans un diner rétro des années 50."],
      ["canyon", "/ˈkænjən/", "Noun", "le canyon", "The Colorado River carved this deep rocky canyon.", "Le fleuve Colorado a creusé ce profond canyon rocheux."],
      ["scenic", "/ˈsiːnɪk/", "Adjective", "pittoresque / panoramique", "Take the scenic route across the mountains.", "Prends la route panoramique à travers les montagnes."],
      ["interstate", "/ˈɪntərsteɪt/", "Noun", "le réseau autoroutier inter-États", "Interstate 40 replaced historic Route 66.", "L'Interstate 40 a remplacé l'historique Route 66."]
    ],
    dialogue: {
      title: "Planifier l'itinéraire de la Route 66", setting: "Deux amis tracent leur trajet sur une carte des États-Unis.",
      lines: [
        ["Ben", "Are we going to start our road trip in Chicago, Illinois?", "Allons-nous commencer notre voyage à Chicago dans l'Illinois ?"],
        ["Sam", "Yes! We are going to drive through eight states all the way to Santa Monica, California.", "Oui ! Nous allons traverser huit États jusqu'à Santa Monica en Californie."],
        ["Ben", "Are we going to stop at the Grand Canyon in Arizona?", "Allons-nous nous arrêter au Grand Canyon en Arizona ?"],
        ["Sam", "Definitely! We are going to spend two days hiking along the South Rim.", "Absolument ! Nous allons passer deux jours à marcher sur la rive Sud."]
      ]
    },
    dictation: { prompt: "We are going to drive along historic Route 66.", fr: "Nous allons rouler le long de l'historique Route 66." },
    quiz: [
      { q: "Quelle forme exprime une intention ou un projet déjà réfléchi ?", opts: ["Be going to + base verbale", "Past simple", "Present continuous without be", "Will have"], a: 0, exp: "'Be going to' exprime une intention ou un plan prémédité." },
      { q: "Où se termine la mythique Route 66 à l'ouest des États-Unis ?", opts: ["New York", "Miami", "Santa Monica (Californie)", "Seattle"], a: 2, exp: "La Route 66 reliait Chicago à la jetée de Santa Monica sur le Pacifique." },
      { q: "Comment appelle-t-on le restaurant traditionnel américain en bord de route ?", opts: ["A pub", "A diner", "A bistro", "A lounge"], a: 1, exp: "Un 'diner' est le restaurant typique américain avec banquettes et comptoir." }
    ]
  },
  {
    grade: '4e', theme_id: 'history', num: 2,
    title: 'L\'époque victorienne & Charles Dickens',
    title_en: 'The Victorian Age & Social Reform',
    objective: 'Décrire les contrastes de la société victorienne au prétérit avec USED TO.',
    grammar: {
      title: "L'habitude ou l'état révolu dans le passé avec USED TO",
      rule: "On utilise 'used to + base verbale' pour parler d'habitudes passées ou de vérités anciennes qui ne sont plus vraies aujourd'hui.",
      example_en: "Victorian children used to work in cotton mills and clean dark chimneys.",
      example_fr: "Les enfants victoriens avaient l'habitude de travailler dans les filatures de coton et de nettoyer de sombres cheminées.",
      tip: "À la négation : didn't use to (sans 'd' après use).",
      level_focus: "Structure used to + infinitif pour opposer passé et présent."
    },
    vocab: [
      ["Victorian era", "/vɪkˈtɔːriən ˈɪərə/", "Noun", "l'époque victorienne (1837–1901)", "Queen Victoria ruled Britain during the Victorian era.", "La reine Victoria régna sur la Grande-Bretagne pendant l'ère victorienne."],
      ["chimney sweep", "/ˈtʃɪmni swiːp/", "Noun", "le ramoneur de cheminée", "Young chimney sweeps climbed narrow brick flues.", "De jeunes ramoneurs grimpaient dans les étroits conduits de cheminée."],
      ["workhouse", "/ˈwɜːrkhaʊs/", "Noun", "l'hospice de travail / maison des pauvres", "Oliver Twist grew up in a harsh Victorian workhouse.", "Oliver Twist a grandi dans un dur hospice victorien."],
      ["orphan", "/ˈɔːrfn/", "Noun", "l'orphelin", "Charities built schools to educate homeless orphans.", "Des œuvres de charité bâtirent des écoles pour instruire les orphelins sans abri."],
      ["poverty", "/ˈpɒvərti/", "Noun", "la pauvreté", "Industrial cities suffered from crowded slums and poverty.", "Les cités industrielles souffraient de taudis surpeuplés et de pauvreté."],
      ["wealth", "/wɛlθ/", "Noun", "la richesse / l'opulence", "Rich merchants displayed their grand wealth in townhouses.", "De riches marchands étalaient leur fortune dans des hôtels particuliers."],
      ["reform", "/rɪˈfɔːrm/", "Noun", "la réforme sociale", "Reformers passed laws forbidding child labor.", "Des réformateurs votèrent des lois interdisant le travail des enfants."],
      ["novelist", "/ˈnɒvəlɪst/", "Noun", "le romancier", "Charles Dickens was a world-renowned social novelist.", "Charles Dickens était un romancier social de renommée mondiale."],
      ["slum", "/slʌm/", "Noun", "le taudis / quartier insalubre", "Narrow alleys ran through the Victorian slums.", "Des ruelles étroites traversaient les taudis victoriens."],
      ["factory", "/ˈfæktri/", "Noun", "l'usine", "Steam engines powered the noisy textile factories.", "Des machines à vapeur alimentaient les usines textiles bruyantes."]
    ],
    dialogue: {
      title: "Lecture d'un passage d'Oliver Twist", setting: "En cours d'histoire et littérature anglaise.",
      lines: [
        ["Teacher", "Did children use to go to school every day in Victorian times?", "Les enfants allaient-ils à l'école tous les jours à l'époque victorienne ?"],
        ["Pupil", "No, poor children used to work twelve hours a day in dark factories.", "Non, les enfants pauvres travaillaient douze heures par jour dans de sombres usines."],
        ["Teacher", "How did Charles Dickens help to change society?", "Comment Charles Dickens a-t-il contribué à changer la société ?"],
        ["Pupil", "His novels denounced social cruelty and inspired humanitarian reforms.", "Ses romans dénonçaient la cruauté sociale et inspiraient des réformes humanitaires."]
      ]
    },
    dictation: { prompt: "Poor children used to work in factories before school reforms.", fr: "Les enfants pauvres travaillaient autrefois dans les usines avant les réformes scolaires." },
    quiz: [
      { q: "Quelle structure exprime une habitude révolue qui n'existe plus aujourd'hui ?", opts: ["Used to + base verbale", "Be used to + V-ing", "Will used to", "Is using to"], a: 0, exp: "'Used to + BV' exprime une habitude ou situation révolue du passé." },
      { q: "Quel célèbre roman de Charles Dickens met en scène un jeune orphelin dans un hospice ?", opts: ["Pride and Prejudice", "Oliver Twist", "Alice in Wonderland", "Robinson Crusoe"], a: 1, exp: "'Oliver Twist' (1838) dénonce les conditions de vie dans les workhouses." },
      { q: "Que signifie 'slum' ?", opts: ["Un palais", "Un taudis / quartier insalubre", "Une cathédrale", "Un port"], a: 1, exp: "'Slum' désigne un taudis ou bidonville urbain insalubre." }
    ]
  },
  {
    grade: '4e', theme_id: 'history', num: 3,
    title: 'Les pionniers de l\'aviation & premiers vols',
    title_en: 'Aviation Pioneers & Early Flights',
    objective: 'Raconter la conquête de l\'air et les exploits techniques des frères Wright au prétérit.',
    grammar: {
      title: "La voix passive au prétérit (WAS / WERE + participe passé)",
      rule: "Pour mettre l'accent sur l'événement ou l'invention plutôt que sur son auteur : sujet + was/were + participe passé.",
      example_en: "The first motor-powered flight was achieved by Orville Wright in 1903.",
      example_fr: "Le premier vol à moteur fut accompli par Orville Wright en 1903.",
      tip: "Pour mentionner l'auteur, on ajoute le complément d'agent introduit par 'BY'.",
      level_focus: "Passif au prétérit simple (was/were + past participle)."
    },
    vocab: [
      ["biplane", "/ˈbaɪpleɪn/", "Noun", "le biplan", "The wooden biplane had two superimposed wings.", "Le biplan en bois avait deux ailes superposées."],
      ["propeller", "/prəˈpɛlər/", "Noun", "l'hélice", "Twin wooden propellers pushed the aircraft forward.", "Deux hélices en bois propulsaient l'aéronef vers l'avant."],
      ["pilot", "/ˈpaɪlət/", "Noun", "le pilote", "The fearless pilot checked wind currents carefully.", "Le pilote intrépide vérifiait attentivement les courants de vent."],
      ["transatlantic", "/ˌtrænzətˈlæntɪk/", "Adjective", "transatlantique", "Lindbergh completed the first solo transatlantic flight.", "Lindbergh accomplit le premier vol transatlantique en solitaire."],
      ["glider", "/ˈɡlaɪdər/", "Noun", "le planeur", "Before engines, pioneers tested fragile gliders.", "Avant les moteurs, les pionniers testaient de fragiles planeurs."],
      ["altitude", "/ˈæltɪtjuːd/", "Noun", "l'altitude", "The aircraft ascended to a safe cruising altitude.", "L'appareil monta à une altitude de croisière sûre."],
      ["runway", "/ˈrʌnweɪ/", "Noun", "la piste de décollage", "The sandy dunes at Kitty Hawk served as an early runway.", "Les dunes de sable de Kitty Hawk servirent de piste primitive."],
      ["aviation", "/ˌeɪviˈeɪʃn/", "Noun", "l'aviation", "Aviation transformed modern world communication.", "L'aviation a transformé les communications du monde moderne."],
      ["feat", "/fiːt/", "Noun", "l'exploit / la prouesse technique", "Flying across the English Channel was a remarkable feat.", "Traverser la Manche en vol fut un exploit remarquable."],
      ["inventor", "/ɪnˈvɛntər/", "Noun", "l'inventeur", "The two bicycle mechanics became world-famous inventors.", "Les deux mécaniciens de vélos devinrent des inventeurs mondialement connus."]
    ],
    dialogue: {
      title: "Au musée de l'air de Washington", setting: "Des élèves admirent le 'Wright Flyer' original.",
      lines: [
        ["Guide", "In December 1903, the first controlled powered flight was completed.", "En décembre 1903, le premier vol motorisé contrôlé fut accompli."],
        ["Student", "How long was the first historic flight?", "Combien de temps dura ce premier vol historique ?"],
        ["Guide", "It lasted just twelve seconds, but aviation history was changed forever.", "Il dura seulement douze secondes, mais l'histoire de l'aviation fut changée à jamais."],
        ["Student", "It is extraordinary how fast technology evolved from wood to jet engines.", "Il est extraordinaire de voir combien la technologie a évolué vite du bois aux réacteurs."]
      ]
    },
    dictation: { prompt: "The first powered flight was achieved by the Wright brothers.", fr: "Le premier vol motorisé fut accompli par les frères Wright." },
    quiz: [
      { q: "En quelle année eut lieu le premier vol motorisé des frères Wright à Kitty Hawk ?", opts: ["1889", "1903", "1918", "1927"], a: 1, exp: "Les frères Wright ont volé pour la première fois avec succès le 17 décembre 1903." },
      { q: "Quelle est la forme passive au prétérit de 'He wrote the letter' ?", opts: ["The letter was written by him.", "The letter is wrote.", "The letter was write.", "The letter had written."], a: 0, exp: "Au passif prétérit : was + participe passé (was written)." },
      { q: "Que signifie 'propeller' sur un aéronef ?", opts: ["Le gouvernail", "L'hélice", "Le train d'atterrissage", "Le cockpit"], a: 1, exp: "'Propeller' désigne l'hélice motrice." }
    ]
  },
  {
    grade: '4e', theme_id: 'hobbies', num: 2,
    title: 'Le dessin numérique & illustration graphique',
    title_en: 'Digital Art & Tablet Sketching',
    objective: 'Décrire le processus créatif numérique et utiliser le présent parfait (Present Perfect) d\'expérience.',
    grammar: {
      title: "Le Present Perfect avec EVER et NEVER (Expérience de vie)",
      rule: "On utilise le Present Perfect (have/has + participe passé) avec EVER dans les questions pour interroger sur une expérience vécue : Have you ever drawn on a graphic tablet?",
      example_en: "Have you ever tried digital sketching? - No, I have never used digital stylus pens before.",
      example_fr: "As-tu déjà essayé le croquis numérique ? - Non, je n'ai encore jamais utilisé de stylet numérique auparavant.",
      tip: "Ever = dans les questions / Never = dans les réponses négatives (sans autre négation).",
      level_focus: "Present Perfect d'expérience (Have you ever...?)."
    },
    vocab: [
      ["graphic tablet", "/ˈɡræfɪk ˈtæblət/", "Noun", "la tablette graphique", "Draw directly onto the sensitive graphic tablet.", "Dessine directement sur la tablette graphique sensible."],
      ["stylus", "/ˈstaɪləs/", "Noun", "le stylet numérique", "The pressure-sensitive stylus mimics natural pencil strokes.", "Le stylet sensible à la pression imite les coups de crayon."],
      ["sketch", "/skɛtʃ/", "Noun", "l'esquisse / le croquis", "Start your character design with a rough blue sketch.", "Commence ton personnage par une esquisse bleue rapide."],
      ["layer", "/ˈleɪər/", "Noun", "le calque numérique", "Create a separate transparent layer for line art and colors.", "Crée un calque transparent distinct pour le tracé et les couleurs."],
      ["shading", "/ˈʃeɪdɪŋ/", "Noun", "l'ombrage / les dégradés", "Add soft shading to bring depth to the portrait.", "Ajoute des ombrages doux pour donner du relief au portrait."],
      ["canvas", "/ˈkænvəs/", "Noun", "la toile de dessin (virtuelle ou réelle)", "Resize your digital canvas to high resolution.", "Redimensionne ta toile numérique en haute résolution."],
      ["rendering", "/ˈrɛndərɪŋ/", "Noun", "le rendu visuel final", "The final 3D rendering looks crisp and vivid.", "Le rendu final 3D est net et éclatant."],
      ["palette", "/ˈpælət/", "Noun", "la palette de couleurs", "Pick harmonious pastel tones from the digital palette.", "Choisis des teintes pastel harmonieuses dans la palette."],
      ["storyboard", "/ˈstɔːribɔːrd/", "Noun", "le story-board / scénarimage", "Draw six panels to complete the animation storyboard.", "Dessine six cases pour compléter le story-board d'animation."],
      ["undo", "/ʌnˈduː/", "Verb", "annuler la dernière action (Ctrl+Z)", "Click undo if you make a brush mistake.", "Clique sur annuler si tu fais une erreur de pinceau."]
    ],
    dialogue: {
      title: "Atelier de dessin numérique au collège", setting: "Léa montre ses créations sur tablette à son camarade.",
      lines: [
        ["Julien", "Have you ever created an animated comic strip, Léa?", "As-tu déjà créé une bande dessinée animée, Léa ?"],
        ["Léa", "Yes, I have already finished my storyboard layers on my tablet.", "Oui, j'ai déjà terminé les calques de mon story-board sur ma tablette."],
        ["Julien", "How do you achieve such realistic shading on the eyes?", "Comment obtiens-tu des ombrages aussi réalistes sur les yeux ?"],
        ["Léa", "I adjust brush opacity and blend colors on a top layer.", "J'ajuste l'opacité du pinceau et je fonds les couleurs sur un calque supérieur."]
      ]
    },
    dictation: { prompt: "Have you ever used a graphic tablet for sketching?", fr: "As-tu déjà utilisé une tablette graphique pour faire des croquis ?" },
    quiz: [
      { q: "Quel mot complète : 'Have you ... visited an animation studio?'", opts: ["never", "ever", "yet", "already"], a: 1, exp: "'Ever' s'emploie dans les questions d'expérience au Present Perfect." },
      { q: "À quoi sert un 'layer' (calque) en dessin numérique ?", opts: ["À effacer le fichier", "À superposer des éléments sans écraser le dessin", "À imprimer", "À éteindre l'écran"], a: 1, exp: "Les 'layers' (calques) permettent de travailler le trait et la couleur séparément." },
      { q: "Que permet la commande 'undo' sur un logiciel de graphisme ?", opts: ["Enregistrer", "Annuler la dernière action", "Exporter en PDF", "Colorier"], a: 1, exp: "'Undo' (annuler) permet de revenir sur la dernière modification." }
    ]
  },
  {
    grade: '4e', theme_id: 'hobbies', num: 3,
    title: 'Bricolage, DIY & objets recyclés',
    title_en: 'DIY Crafting & Upcycling',
    objective: 'Expliquer un projet de fabrication maison en utilisant les expressions de but (in order to, so that).',
    grammar: {
      title: "Exprimer le but avec TO + base verbale / IN ORDER TO / SO THAT",
      rule: "Pour exprimer l'objectif d'une action, on emploie 'to + base verbale' ou 'in order to + BV' (même sujet), ou 'so that + sujet + can/could' (changement de sujet).",
      example_en: "We collected wooden pallets in order to build an eco-friendly garden bench.",
      example_fr: "Nous avons collecté des palettes de bois afin de fabriquer un banc de jardin écologique.",
      tip: "À la forme négative : in order NOT to waste materials.",
      level_focus: "Subordonnées de but (in order to, so as to, so that)."
    },
    vocab: [
      ["screwdriver", "/ˈskruːdraɪvər/", "Noun", "le tournevis", "Tighten the metal screws with a Phillips screwdriver.", "Serre les vis métalliques avec un tournevis cruciforme."],
      ["hammer", "/ˈhæmər/", "Noun", "le marteau", "Hit the nail straight with the steel hammer.", "Frappe le clou droit avec le marteau en acier."],
      ["nails", "/neɪlz/", "Noun", "les clous", "Keep iron nails safely in a plastic compartment.", "Garde les clous en fer en sécurité dans un compartiment."],
      ["upcycling", "/ˈʌpsaɪklɪŋ/", "Noun", "le surcyclage / recyclage créatif vers le haut", "Upcycling transforms discarded jars into stylish lanterns.", "Le surcyclage transforme les vieux bocaux en lanternes stylées."],
      ["cardboard", "/ˈkɑːrdbɔːrd/", "Noun", "le carton", "Cut thick cardboard boxes to make birdhouses.", "Découpe des cartons épais pour fabriquer des nichoirs."],
      ["saw", "/sɔː/", "Noun", "la scie", "Saw the wooden plank precisely on the pencil line.", "Scie la planche de bois précisément sur le trait de crayon."],
      ["sandpaper", "/ˈsændpeɪpər/", "Noun", "le papier de verre / abrasif", "Smooth rough edges with fine sandpaper.", "Ponce les bords rugueux avec du papier de verre fin."],
      ["varnish", "/ˈvɑːrnɪʃ/", "Noun", "le vernis protecteur", "Apply two coats of waterproof varnish to the wood.", "Applique deux couches de vernis imperméable sur le bois."],
      ["measure", "/ˈmɛʒər/", "Verb", "mesurer", "Measure twice and cut once for accuracy.", "Mesure deux fois et coupe une seule fois pour être précis."],
      ["creative", "/kriˈeɪtɪv/", "Adjective", "créatif / inventif", "DIY projects make young people resourceful and creative.", "Les projets de bricolage rendent les jeunes inventifs et débrouillards."]
    ],
    dialogue: {
      title: "Créer un hôtel à insectes", setting: "L'atelier de technologie et développement durable.",
      lines: [
        ["Teacher", "Why did we gather bamboo canes and hollow bricks, pupils?", "Pourquoi avons-nous rassemblé des tiges de bambou et des briques creuses ?"],
        ["Student", "We collected them in order to build an insect hotel for the garden.", "Nous les avons rassemblées afin de construire un hôtel à insectes pour le jardin."],
        ["Teacher", "Make sure you sand the wooden frame so that insects don't hurt their wings.", "Veillez à poncer le cadre en bois afin que les insectes ne se blessent pas."],
        ["Student", "We will varnish the outer roof to protect it from heavy rain.", "Nous vernirons le toit extérieur pour le protéger des fortes pluies."]
      ]
    },
    dictation: { prompt: "We upcycle wooden boxes in order to protect nature.", fr: "Nous surcyclons des caisses en bois afin de protéger la nature." },
    quiz: [
      { q: "Quelle structure exprime le but avec un verbe à l'infinitif ?", opts: ["In order to + base verbale", "Because of + nom", "Although + sujet", "Unless + verbe"], a: 0, exp: "'In order to' suivi de la base verbale exprime l'intention et le but." },
      { q: "Qu'est-ce que l'upcycling ?", opts: ["Jeter des objets", "Transformer des objets usagés en créations de valeur supérieure", "Acheter neuf", "Brûler les déchets"], a: 1, exp: "L'upcycling (surcyclage) réutilise des matières pour créer des objets utiles et valorisés." },
      { q: "Quel outil utilise-t-on pour poncer et lisser le bois brut ?", opts: ["Sandpaper", "A screwdriver", "Nails", "A compass"], a: 0, exp: "'Sandpaper' est le papier de verre utilisé pour poncer." }
    ]
  },
  {
    grade: '4e', theme_id: 'sport', num: 2,
    title: 'Le basketball & les tournois NBA',
    title_en: 'Basketball Skills & NBA Tournaments',
    objective: 'Parler de tactique de jeu, de tournois et d\'actions rapides au basketball.',
    grammar: {
      title: "Le discours indirect simple (Reported Speech au présent)",
      rule: "Pour rapporter les consignes d'un entraîneur : The coach says (that) we must pass the ball quickly.",
      example_en: "The coach told us that defending the three-point line was our main priority.",
      example_fr: "L'entraîneur nous a dit que défendre la ligne des trois points était notre priorité principale.",
      tip: "En anglais familier, 'that' est souvent omis : He said we played well.",
      level_focus: "Discours indirect avec SAY et TELL, verbes de tactique."
    },
    vocab: [
      ["dribble", "/ˈdrɪbl/", "Verb", "dribbler", "Dribble low to protect the basketball from defenders.", "Dribble bas pour protéger le ballon des défenseurs."],
      ["three-pointer", "/θriː ˈpɔɪntər/", "Noun", "le panier à trois points", "He sank a dramatic three-pointer at the buzzer.", "Il a marqué un trois points spectaculaire au buzzer."],
      ["slam dunk", "/slæm dʌŋk/", "Noun", "le smash / slam dunk spectaculaire", "The power forward performed a high-flying slam dunk.", "L'ailier fort a réalisé un slam dunk aérien."],
      ["court", "/kɔːrt/", "Noun", "le terrain de basketball", "Rubber-soled shoes provide great grip on the hardwood court.", "Des semelles en caoutchouc offrent une bonne adhérence sur le parquet."],
      ["rebound", "/ˈriːbaʊnd/", "Noun", "le rebond", "Jump aggressively to secure defensive rebounds.", "Saute agressivement pour capter les rebonds défensifs."],
      ["foul", "/faʊl/", "Noun", "la faute personnelle", "He committed his fifth foul and had to leave the court.", "Il a commis sa cinquième faute et a dû quitter le terrain."],
      ["coach", "/koʊtʃ/", "Noun", "l'entraîneur", "The coach drew tactical plays on his magnetic board.", "L'entraîneur a dessiné des systèmes sur son tableau."],
      ["pass", "/pɑːs/", "Verb", "faire une passe", "Pass the ball quickly to the open teammate.", "Passe le ballon rapidement au coéquipier démarqué."],
      ["buzzer", "/ˈbʌzər/", "Noun", "la sirène de fin de quart-temps", "The shot went in just before the final buzzer sounded.", "Le tir est rentré juste avant que la sirène ne retentisse."],
      ["championship", "/ˈtʃæmpiənʃɪp/", "Noun", "le championnat / tournoi final", "Teams fight intensely to win the NBA championship ring.", "Les équipes luttent ardemment pour remporter la bague de champion NBA."]
    ],
    dialogue: {
      title: "Temps mort décisif", setting: "L'entraîneur rassemble ses joueurs pendant un time-out.",
      lines: [
        ["Coach", "Listen up! We are down by two points with twenty seconds left.", "Écoutez ! Nous avons deux points de retard avec vingt secondes à jouer."],
        ["Player", "Should we attempt a three-pointer or drive to the basket?", "Devrions-nous tenter un trois points ou attaquer le cercle ?"],
        ["Coach", "I want you to set a screen, pass to Leo, and he will shoot.", "Je veux que vous posiez un écran, passiez à Leo, et il tirera."],
        ["Team", "One, two, three, defence! Let's win this match!", "Un, deux, trois, défense ! Gagnons ce match !"]
      ]
    },
    dictation: { prompt: "The coach told us to pass the ball quickly.", fr: "L'entraîneur nous a dit de passer le ballon rapidement." },
    quiz: [
      { q: "Comment s'appelle le terrain de basketball en anglais ?", opts: ["The pitch", "The court", "The ring", "The track"], a: 1, exp: "Le terrain de basket s'appelle 'the basketball court'." },
      { q: "Quelle action consiste à écraser le ballon directement dans le panier d'en haut ?", opts: ["A slam dunk", "A free throw", "A dribble", "A screen"], a: 0, exp: "Le 'slam dunk' consiste à fracasser le ballon dans l'arceau." },
      { q: "Combien de points rapporte un panier tiré au-delà de la ligne extérieure ?", opts: ["1 point", "2 points", "3 points", "4 points"], a: 2, exp: "Un panier réussi au-delà de l'arc rapporte 3 points (three-pointer)." }
    ]
  },
  {
    grade: '4e', theme_id: 'sport', num: 3,
    title: 'Les sports d\'hiver & sécurité sur les pistes',
    title_en: 'Winter Sports & Skiing Safety',
    objective: 'Parler des conditions de glisse en montagne et des consignes de sécurité.',
    grammar: {
      title: "L'expression de la condition au présent (First Conditional : IF + présent, WILL + base verbale)",
      rule: "Pour exprimer une conséquence future probable soumise à une condition : IF + présent simple dans la proposition conditionnelle, WILL + base verbale dans la principale.",
      example_en: "If the mountain wind increases, ski patrols will close the highest chairlifts.",
      example_fr: "Si le vent de montagne se renforce, les pisteurs fermeront les télésièges les plus hauts.",
      tip: "Pas de 'will' après IF : If it rains (et non If it will rain).",
      level_focus: "Premier conditionnel (First Conditional) pour les alertes météo et la sécurité."
    },
    vocab: [
      ["skiing", "/ˈskiːɪŋ/", "Noun", "le ski", "Alpine skiing requires good leg balance.", "Le ski alpin demande un bon équilibre des jambes."],
      ["snowboard", "/ˈsnoʊbɔːrd/", "Noun", "le snowboard / planche à neige", "He learned to carve turns on his new snowboard.", "Il a appris à tailler ses virages sur son snowboard."],
      ["slope", "/sloʊp/", "Noun", "la piste de ski / la pente", "Black slopes are reserved for experienced skiers.", "Les pistes noires sont réservées aux skieurs confirmés."],
      ["avalanche", "/ˈævəlɑːnʃ/", "Noun", "l'avalanche", "Never go off-piste when the avalanche risk is high.", "Ne faites jamais de hors-piste quand le risque d'avalanche est fort."],
      ["ski patrol", "/skiː pəˈtroʊl/", "Noun", "les pisteurs-secouristes", "The ski patrol rescues injured skiers on the slopes.", "Les pisteurs-secouristes secourent les blessés sur les pistes."],
      ["chairlift", "/ˈtʃɛərlɪft/", "Noun", "le télésiège", "Lower the safety bar while riding the chairlift.", "Baisse la barre de sécurité en prenant le télésiège."],
      ["powder snow", "/ˈpaʊdər snoʊ/", "Noun", "la neige poudreuse", "Skiing through fresh powder snow feels like floating.", "Skier dans la poudreuse fraîche donne l'impression de flotter."],
      ["thermal underwear", "/ˈθɜːrml ˈʌndərwɛər/", "Noun", "les sous-vêtements thermiques", "Wear thermal underwear to prevent frostbite.", "Porte des sous-vêtements thermiques pour éviter les engelures."],
      ["helmet", "/ˈhɛlmɪt/", "Noun", "le casque de ski", "Wearing a certified ski helmet saves lives.", "Porter un casque de ski homologué sauve des vies."],
      ["off-piste", "/ˌɒfˈpiːst/", "Adverb", "hors-piste", "Off-piste skiing without a mountain beacon is strictly forbidden.", "Le hors-piste sans balise de montagne est strictement interdit."]
    ],
    dialogue: {
      title: "Matinée dans les Alpes", setting: "Un moniteur de ski fait le point météo avec son groupe.",
      lines: [
        ["Instructor", "Check your goggles and fasten your helmets securely.", "Vérifiez vos lunettes et attachez vos casques fermement."],
        ["Skier", "What will happen if the fog becomes too dense on the ridge?", "Que se passera-t-il si le brouillard devient trop dense sur la crête ?"],
        ["Instructor", "If the visibility drops, we will descend to the green slopes in the forest.", "Si la visibilité baisse, nous descendrons vers les pistes vertes en forêt."],
        ["Skier", "Safety always comes first in the high mountains.", "La sécurité passe toujours en premier en haute montagne."]
      ]
    },
    dictation: { prompt: "If the weather changes, ski patrols will close the slope.", fr: "Si le temps change, les pisteurs fermeront la piste." },
    quiz: [
      { q: "Complétez la condition : 'If it ... heavily, they will close the ski lifts.'", opts: ["snows", "will snow", "snowed", "snowing"], a: 0, exp: "Dans la subordonnée avec IF au premier conditionnel, on utilise le présent simple : 'If it snows'." },
      { q: "Que signifie 'chairlift' en station de ski ?", opts: ["Le télésiège", "La dameuse", "Le tire-fesses", "Le chalet"], a: 0, exp: "'Chairlift' désigne le télésiège qui hisse les skieurs en haut des pistes." },
      { q: "Pourquoi est-il dangereux de skier 'off-piste' sans équipement ?", opts: ["C'est payant", "À cause des risques imprévisibles d'avalanche", "Pour ne pas user ses skis", "Il n'y a pas de neige"], a: 1, exp: "Le hors-piste expose à des risques majeurs d'avalanche et de crevasses." }
    ]
  },
  {
    grade: '4e', theme_id: 'music', num: 2,
    title: 'L\'épopée du Rock\'n\'roll & guitares électriques',
    title_en: 'The Story of Rock \'n\' Roll',
    objective: 'Raconter l\'essor du rock anglo-américain des années 1950-70 au prétérit.',
    grammar: {
      title: "Les propositions relatives déterminatives sans pronom relatif (Zero Relative)",
      rule: "Lorsque le pronom relatif (whom/which/that) est COD dans la proposition, on peut l'omettre totalement en anglais : The vinyl record (that) I bought.",
      example_en: "The legendary guitar solos he played inspired millions of young musicians.",
      example_fr: "Les solos de guitare légendaires qu'il a joués ont inspiré des millions de jeunes musiciens.",
      tip: "Structure très naturelle en anglais : The song I love / The artist we heard.",
      level_focus: "Omission du pronom relatif COD (contact clause)."
    },
    vocab: [
      ["electric guitar", "/ɪˈlɛktrɪk ɡɪˈtɑːr/", "Noun", "la guitare électrique", "Distorted riffs from the electric guitar defined hard rock.", "Les riffs saturés de la guitare électrique ont défini le hard rock."],
      ["amplifier", "/ˈæmplɪfaɪər/", "Noun", "l'amplificateur", "Plug the lead cable into the vintage valve amplifier.", "Branche le câble jack dans l'amplificateur à lampes vintage."],
      ["vinyl record", "/ˈvaɪnl ˈrɛkɔːrd/", "Noun", "le disque vinyle", "Vinyl records deliver a warm acoustic sound.", "Les disques vinyles offrent un son acoustique chaleureux."],
      ["drum kit", "/drʌm kɪt/", "Noun", "la batterie", "The energetic drummer kept a steady 4/4 rhythm.", "Le batteur énergique a tenu un rythme régulier en 4/4."],
      ["legend", "/ˈlɛdʒənd/", "Noun", "la légende", "The Beatles are an everlasting rock legend.", "Les Beatles sont une légende éternelle du rock."],
      ["concert venue", "/ˈkɒnsərt ˈvɛnjuː/", "Noun", "la salle de concert", "Fans queued outside the iconic London concert venue.", "Les fans faisaient la queue devant la mythique salle de concert londonienne."],
      ["rebellion", "/rɪˈbɛljən/", "Noun", "la rébellion / contestation", "Early rock 'n' roll symbolised youth rebellion in the 1950s.", "Le rock'n'roll des débuts symbolisait la rébellion de la jeunesse dans les années 50."],
      ["lead singer", "/liːd ˈsɪŋər/", "Noun", "le chanteur principal / leader", "The charismatic lead singer commanded the stage.", "Le chanteur principal charismatique dominait la scène."],
      ["album", "/ˈælbəm/", "Noun", "l'album musical", "Abbey Road is one of the best-selling rock albums in history.", "Abbey Road est l'un des albums de rock les plus vendus de l'histoire."],
      ["enthusiastic", "/ɪnˌθjuːziˈæstɪk/", "Adjective", "enthousiaste", "The enthusiastic crowd sang every chorus by heart.", "La foule enthousiaste chantait chaque refrain par cœur."]
    ],
    dialogue: {
      title: "Visite des studios d'Abbey Road", setting: "Des passionnés de musique marchent sur le célèbre passage piéton à Londres.",
      lines: [
        ["Fan", "Is this the legendary studio where the Beatles recorded their master tracks?", "Est-ce le studio légendaire où les Beatles ont enregistré leurs chefs-d'œuvre ?"],
        ["Friend", "Yes! The albums they produced here changed world popular culture.", "Oui ! Les albums qu'ils ont produits ici ont transformé la culture populaire mondiale."],
        ["Fan", "Look at the graffiti fans from all continents have written on the white wall.", "Regarde les graffitis que des fans de tous les continents ont écrits sur le mur blanc."],
        ["Friend", "Rock music connects generations like no other art form.", "Le rock relie les générations comme aucune autre forme d'art."]
      ]
    },
    dictation: { prompt: "The electric guitar solos they played changed modern music.", fr: "Les solos de guitare électrique qu'ils ont joués ont changé la musique moderne." },
    quiz: [
      { q: "Quand peut-on omettre le pronom relatif (that/which) en anglais ?", opts: ["Quand il est sujet du verbe", "Quand il est complément d'objet direct (COD)", "Jamais", "Toujours"], a: 1, exp: "Le pronom relatif COD peut être omis (The song I heard = The song that I heard)." },
      { q: "Quel groupe britannique a enregistré son célèbre album sur le passage d'Abbey Road ?", opts: ["Queen", "The Beatles", "The Rolling Stones", "Pink Floyd"], a: 1, exp: "The Beatles ont immortalisé Abbey Road avec leur photo sur le passage piéton en 1969." },
      { q: "Que signifie 'amplifier' dans un groupe de rock ?", opts: ["Un micro", "L'amplificateur sonore", "Une baguette de batterie", "Une partition"], a: 1, exp: "'Amplifier' (ou 'amp') est l'appareil qui amplifie le signal de la guitare électrique." }
    ]
  },
  {
    grade: '4e', theme_id: 'music', num: 3,
    title: 'Les bandes originales & musiques de films',
    title_en: 'Film Soundtracks & Orchestral Scores',
    objective: 'Analyser l\'impact émotionnel de la musique au cinéma avec les adverbes de degré.',
    grammar: {
      title: "Les adverbes de degré (extremely, incredibly, totally, slightly)",
      rule: "On utilise des adverbes d'intensité pour nuancer la force d'un adjectif : extremely dramatic, incredibly moving, slightly melancholy.",
      example_en: "John Williams composed an incredibly powerful orchestral theme for Star Wars.",
      example_fr: "John Williams a composé un thème orchestral incroyablement puissant pour Star Wars.",
      tip: "Placez toujours l'adverbe juste devant l'adjectif qu'il modifie.",
      level_focus: "Adverbes d'intensité et vocabulaire de l'analyse musicale filmique."
    },
    vocab: [
      ["soundtrack", "/ˈsaʊndtræk/", "Noun", "la bande originale de film (OST)", "Listen to the instrumental soundtrack to enhance your focus.", "Écoute la bande originale instrumentale pour aiguiser ta concentration."],
      ["composer", "/kəmˈpoʊzər/", "Noun", "le compositeur", "Ennio Morricone was an iconic cinema composer.", "Ennio Morricone était un compositeur de cinéma emblématique."],
      ["orchestral score", "/ɔːrˈkɛstrəl skɔːr/", "Noun", "la partition orchestrale", "A hundred musicians recorded the majestic orchestral score.", "Cent musiciens ont enregistré la majestueuse partition orchestrale."],
      ["theme song", "/θiːm sɒŋ/", "Noun", "le morceau-thème / générique", "The memorable theme song instantly sets the adventurous tone.", "Le morceau-thème mémorable donne aussitôt le ton de l'aventure."],
      ["suspense", "/səˈspɛns/", "Noun", "le suspense / la tension", "Dissonant violins build unbearable suspense.", "Des violons dissonants créent un suspense insoutenable."],
      ["emotion", "/ɪˈmoʊʃn/", "Noun", "l'émotion", "Music conveys deep sorrow and triumphant joy.", "La musique transmet une profonde tristesse et une joie triomphale."],
      ["incredibly", "/ɪnˈkrɛdəbli/", "Adverb", "incroyablement", "The battle sequence was incredibly dramatic.", "La séquence de bataille était incroyablement spectaculaire."],
      ["strings", "/strɪŋz/", "Noun", "les instruments à cordes", "The orchestra strings soar with passionate energy.", "Les cordes de l'orchestre s'élèvent avec une énergie passionnée."],
      ["brass", "/brɑːs/", "Noun", "les cuivres (trompettes, trombones)", "Triumphant brass fanfares announce the king's arrival.", "Des fanfares de cuivres triomphantes annoncent l'arrivée du roi."],
      ["moving", "/ˈmuːvɪŋ/", "Adjective", "émouvant / touchant", "The piano melody was deeply moving.", "La mélodie au piano était profondément émouvante."]
    ],
    dialogue: {
      title: "Analyse d'un chef-d'œuvre de John Williams", setting: "Des élèves analysent le rôle de la musique dans Harry Potter.",
      lines: [
        ["Student", "Why is Hedwig's Theme so unforgettable from the very first notes?", "Pourquoi le thème d'Hedwige est-il si inoubliable dès les premières notes ?"],
        ["Teacher", "It uses the celesta, an instrument with an incredibly magical chime.", "Il utilise le célesta, un instrument au tintement incroyablement magique."],
        ["Student", "Then the full orchestral strings enter to create mystery and wonder.", "Ensuite toutes les cordes de l'orchestre entrent pour créer mystère et émerveillement."],
        ["Teacher", "Exactly! A great soundtrack tells as much story as dialogue does.", "Exactement ! Une grande musique de film raconte autant qu'un dialogue."]
      ]
    },
    dictation: { prompt: "The orchestral soundtrack was incredibly moving and dramatic.", fr: "La bande originale orchestrale était incroyablement émouvante et spectaculaire." },
    quiz: [
      { q: "Quel adverbe intensifie l'adjectif 'powerful' ?", opts: ["Incredibly", "Little", "Slight", "Hardly"], a: 0, exp: "'Incredibly' renforce le sens pour signifier 'incroyablement'." },
      { q: "Quel instrument féerique à clavier donne sa couleur au début du thème d'Harry Potter ?", opts: ["The trumpet", "The celesta", "The drum kit", "The bass guitar"], a: 1, exp: "Le célesta produit le timbre cristallin magique au début du thème d'Hedwige." },
      { q: "Que désigne un 'orchestral score' ?", opts: ["Le score du match", "La partition pour orchestre symphonique", "La bande-annonce", "La caméra"], a: 1, exp: "'Score' désigne la partition musicale intégrale d'un film." }
    ]
  },
  {
    grade: '4e', theme_id: 'restaurant', num: 2,
    title: 'La street food & les food trucks',
    title_en: 'Street Food & International Food Trucks',
    objective: 'Commander de la cuisine de rue multiculturelle et exprimer des restrictions.',
    grammar: {
      title: "Exprimer l'alternative avec EITHER... OR et NEITHER... NOR",
      rule: "On utilise 'EITHER... OR' pour choisir entre deux options (soit... soit), et 'NEITHER... NOR' pour rejeter les deux options (ni... ni).",
      example_en: "You can choose either spicy Mexican tacos or steamed Chinese dumplings.",
      example_fr: "Tu peux choisir soit des tacos mexicains épicés, soit des raviolis chinois à la vapeur.",
      tip: "Neither takes singular verb: Neither option IS expensive.",
      level_focus: "Conjonctions de coordination corrélatives (either... or / neither... nor)."
    },
    vocab: [
      ["food truck", "/fuːd trʌk/", "Noun", "le camion-restaurant / food truck", "Gourmet food trucks gather in the urban square.", "Des food trucks gastronomiques se rassemblent sur la place urbaine."],
      ["dumplings", "/ˈdʌmplɪŋz/", "Noun", "les raviolis vapeur asiatiques", "Steamed vegetable dumplings served with soy sauce.", "Des raviolis aux légumes à la vapeur servis avec de la sauce soja."],
      ["tacos", "/ˈtɑːkoʊz/", "Noun", "les tacos mexicains", "Corn tacos filled with beans and guacamole.", "Des tacos de maïs garnis de haricots et de guacamole."],
      ["spicy", "/ˈspaɪsi/", "Adjective", "épicé / pimenté", "Mild chili adds flavor without being overly spicy.", "Le piment doux apporte de la saveur sans être trop piquant."],
      ["wrap", "/ræp/", "Noun", "le wrap / sandwich roulé", "A fresh chicken wrap packed with crunchy salad.", "Un wrap au poulet garni de salade croquante."],
      ["vendor", "/ˈvɛndər/", "Noun", "le vendeur de rue", "The friendly street vendor serves hot noodles in paper boxes.", "Le sympathique marchand ambulant sert des nouilles chaudes en boîte carton."],
      ["takeaway box", "/ˈteɪkəweɪ bɒks/", "Noun", "la boîte repas à emporter", "Biodegradable takeaway boxes help protect urban parks.", "Les boîtes à emporter biodégradables préservent les parcs urbains."],
      ["queue", "/kjuː/", "Noun", "la file d'attente", "A long queue formed in front of the falafel stall.", "Une longue file d'attente s'est formée devant l'étal de falafels."],
      ["tasty", "/ˈteɪsti/", "Adjective", "savoureux / appétissant", "Authentic Indian samosas are crispy and tasty.", "Les samoussas indiens authentiques sont croustillants et savoureux."],
      ["order", "/ˈɔːrdər/", "Noun", "la commande", "Collect your order when your buzzer flashes.", "Récupère ta commande quand ton bipeur clignote."]
    ],
    dialogue: {
      title: "Au marché street food de Camden", setting: "Léa et Sam choisissent leur déjeuner parmi les stands du marché.",
      lines: [
        ["Sam", "There are so many culinary stalls! What would you prefer?", "Il y a tant d'étals culinaires ! Que préférerais-tu ?"],
        ["Léa", "We could have either spicy Mexican burritos or Korean barbecue.", "Nous pourrions prendre soit des burritos mexicains épicés, soit du barbecue coréen."],
        ["Sam", "I like neither beef nor pork. Are there vegetarian dumplings?", "Je n'aime ni le bœuf ni le porc. Y a-t-il des raviolis végétariens ?"],
        ["Léa", "Yes! That bamboo stall has steamed tofu dumplings with ginger.", "Oui ! Cet étal en bambou propose des raviolis au tofu et gingembre."]
      ]
    },
    dictation: { prompt: "You can choose either spicy tacos or fresh vegetable wraps.", fr: "Tu peux choisir soit des tacos épicés, soit des wraps de légumes frais." },
    quiz: [
      { q: "Quelle paire de mots exprime le choix alternatif 'soit ... soit' ?", opts: ["Neither ... nor", "Either ... or", "Both ... and", "Whether ... if"], a: 1, exp: "'Either ... or' correspond à 'soit ... soit' en français." },
      { q: "Comment dit-on 'faire la queue' en anglais britannique ?", opts: ["To wait the bus", "To stand in a queue", "To sit in line", "To take space"], a: 1, exp: "Au Royaume-Uni, faire la queue se dit 'to queue' ou 'to stand in a queue'." },
      { q: "Que signifie 'spicy' pour un plat ?", opts: ["Sucré", "Épicé / pimenté", "Froid", "Sans goût"], a: 1, exp: "'Spicy' signifie relevé d'épices ou pimenté." }
    ]
  },
  {
    grade: '4e', theme_id: 'restaurant', num: 3,
    title: 'Allergies alimentaires & menus adaptés',
    title_en: 'Food Allergies & Dietary Needs',
    objective: 'Informer le personnel d\'un restaurant d\'allergies alimentaires et vérifier la composition d\'un plat.',
    grammar: {
      title: "Exprimer l'interdiction et le danger vital avec MUST NOT (MUSTN'T)",
      rule: "Pour signaler une intolérance médicale ou une interdiction absolue : I must not eat peanuts / The dish must not contain gluten.",
      example_en: "I am strictly allergic to peanuts, so my meal must not contain any nut traces.",
      example_fr: "Je suis strictement allergique aux cacahuètes, mon repas ne doit donc contenir aucune trace de fruits à coque.",
      tip: "Formule clé : 'Does this dish contain...?' / 'I am allergic to...'",
      level_focus: "Modalité d'interdiction stricte (must not) et lexique allergologique."
    },
    vocab: [
      ["allergy", "/ˈælərdʒi/", "Noun", "l'allergie", "She has a severe allergy to cow milk.", "Elle a une allergie sévère au lait de vache."],
      ["allergic", "/əˈlɜːrdʒɪk/", "Adjective", "allergique", "Are you allergic to shellfish or sesame seeds?", "Êtes-vous allergique aux fruits de mer ou aux graines de sésame ?"],
      ["gluten-free", "/ˈɡluːtn friː/", "Adjective", "sans gluten", "The bakery prepares fresh gluten-free bread daily.", "La boulangerie prépare du pain sans gluten frais tous les jours."],
      ["peanuts", "/ˈpiːnʌts/", "Noun", "les cacahuètes / arachides", "This dessert contains roasted peanuts and hazelnut oil.", "Ce dessert contient des cacahuètes grillées et de l'huile de noisette."],
      ["dairy-free", "/ˈdɛəri friː/", "Adjective", "sans produits laitiers", "Oat milk is a popular dairy-free alternative.", "Le lait d'avoine est une alternative végétale sans lactose populaire."],
      ["ingredients", "/ɪnˈɡriːdiənts/", "Noun", "les ingrédients", "The waiter checked the ingredients list with the chef.", "Le serveur a vérifié la liste des ingrédients avec le chef."],
      ["safe", "/seɪf/", "Adjective", "sûr / sans danger", "Is this vegetable risotto safe for nut allergy sufferers?", "Ce risotto de légumes est-il sans danger pour les allergiques aux noix ?"],
      ["menu", "/ˈmɛnjuː/", "Noun", "la carte / le menu", "Icons on the menu indicate allergen symbols clearly.", "Des pictogrammes sur la carte signalent clairement les allergènes."],
      ["cross-contamination", "/krɒs kənˌtæmɪˈneɪʃn/", "Noun", "la contamination croisée en cuisine", "Kitchens use separate pans to prevent cross-contamination.", "Les cuisines utilisent des poêles distinctes pour éviter la contamination."],
      ["inform", "/ɪnˈfɔːrm/", "Verb", "informer / prévenir", "Always inform the restaurant staff before ordering.", "Informez toujours le personnel du restaurant avant de commander."]
    ],
    dialogue: {
      title: "Préciser une allergie au restaurant", setting: "Lucas prévient le serveur de son allergie au gluten.",
      lines: [
        ["Lucas", "Excuse me, could you please tell me if this soup contains gluten?", "Excusez-moi, pourriez-vous me dire si cette soupe contient du gluten ?"],
        ["Waiter", "I will ask the chef right now to confirm the ingredients.", "Je vais demander au chef dès maintenant pour confirmer les ingrédients."],
        ["Lucas", "Thank you, I must not eat flour or wheat bread.", "Merci, je ne dois consommer ni farine ni pain de blé."],
        ["Waiter", "Our chef confirms the soup is thickened with potatoes only, so it is 100% gluten-free.", "Notre chef confirme que la soupe est liée à la pomme de terre uniquement, 100% sans gluten."]
      ]
    },
    dictation: { prompt: "I am allergic to peanuts, so I must avoid all nuts.", fr: "Je suis allergique aux cacahuètes, je dois donc éviter toutes les noix." },
    quiz: [
      { q: "Quelle phrase permet de demander poliment si un plat contient un allergène ?", opts: ["Are you have nuts?", "Does this dish contain any peanuts?", "Give me no nuts!", "What nut you put?"], a: 1, exp: "'Does this dish contain...?' est la formulation polie et précise." },
      { q: "Que signifie la mention 'gluten-free' sur un menu ?", opts: ["Avec beaucoup de blé", "Sans gluten", "Sans sel", "Sans sucre"], a: 1, exp: "'Gluten-free' indique l'absence totale de gluten." },
      { q: "Quel modal exprime une interdiction vitale impérative ?", opts: ["Must not", "Could not", "May not", "Would not"], a: 0, exp: "'Must not' (ou mustn't) exprime une interdiction absolue, essentielle en santé." }
    ]
  },
  {
    grade: '4e', theme_id: 'food', num: 2,
    title: 'Cuisiner maison & recettes internationales',
    title_en: 'Home Cooking & World Recipes',
    objective: 'Expliquer les techniques culinaires de base et les unités de mesure anglophones.',
    grammar: {
      title: "Les propositions subordonnées de temps avec AS SOON AS et UNTIL",
      rule: "Dans les recettes ou instructions, on emploie 'as soon as' (dès que) et 'until' (jusqu'à ce que) suivis du présent simple (même pour une action future).",
      example_en: "Stir the sauce gently until it boils, and serve as soon as the pasta is tender.",
      example_fr: "Remuez la sauce doucement jusqu'à ce qu'elle bout, et servez dès que les pâtes sont tendres.",
      tip: "Attention : pas de 'will' après until ou as soon as !",
      level_focus: "Subordonnées temporelles (until, as soon as, when) au présent de vérité générale."
    },
    vocab: [
      ["recipe", "/ˈrɛsəpi/", "Noun", "la recette de cuisine", "Follow the traditional Italian carbonara recipe.", "Suis la recette traditionnelle italienne des carbonara."],
      ["simmer", "/ˈsɪmər/", "Verb", "mijoter à feu doux", "Let the tomato broth simmer for twenty minutes.", "Laisse mijoter le bouillon de tomate à feu doux pendant vingt minutes."],
      ["bake", "/beɪk/", "Verb", "cuire au four", "Bake the banana bread in a preheated oven.", "Fais cuire le pain à la banane dans un four préchauffé."],
      ["tablespoon", "/ˈteɪblspuːn/", "Noun", "la cuillère à soupe (tbsp)", "Add two tablespoons of extra virgin olive oil.", "Ajoute deux cuillères à soupe d'huile d'olive vierge."],
      ["teaspoon", "/ˈtiːspuːn/", "Noun", "la cuillère à café (tsp)", "Stir in half a teaspoon of sea salt.", "Incorpore une demi-cuillère à café de sel marin."],
      ["seasoning", "/ˈsiːznɪŋ/", "Noun", "l'assaisonnement / les aromates", "Black pepper and oregano provide warm seasoning.", "Poivre noir et origan apportent un assaisonnement chaleureux."],
      ["boil", "/bɔɪl/", "Verb", "faire bouillir", "Boil water in a large stainless steel pan.", "Fais bouillir de l'eau dans une grande casserole en inox."],
      ["whisk", "/wɪsk/", "Verb", "fouetter / battre", "Whisk eggs until they form a pale foam.", "Fouette les œufs jusqu'à ce qu'ils forment une mousse pâle."],
      ["drain", "/dreɪn/", "Verb", "égoutter", "Drain the hot pasta in a colander.", "Égoutte les pâtes chaudes dans une passoire."],
      ["chop", "/tʃɒp/", "Verb", "hacher / émincer", "Chop the yellow onions finely with a chef's knife.", "Émince finement les oignons jaunes avec un couteau de chef."]
    ],
    dialogue: {
      title: "Préparation d'un chili végétarien", setting: "Deux adolescents cuisinent ensemble pour le dîner familial.",
      lines: [
        ["Noah", "How long do we leave the black beans to simmer?", "Combien de temps laisse-t-on mijoter les haricots noirs ?"],
        ["Emma", "Leave them to simmer until the sauce thickens and smells fragrant.", "Laisse-les mijoter jusqu'à ce que la sauce épaississe et sente bon."],
        ["Noah", "Should I chop fresh coriander leaves now?", "Dois-je hacher des feuilles de coriandre fraîche maintenant ?"],
        ["Emma", "Yes, and sprinkle them on top as soon as we turn off the gas.", "Oui, et parsème-les sur le plat dès que nous coupons le feu."]
      ]
    },
    dictation: { prompt: "Let the sauce simmer gently until it thickens.", fr: "Laisse la sauce mijoter doucement jusqu'à ce qu'elle épaississe." },
    quiz: [
      { q: "Comment se prononce le mot 'recipe' (recette) ?", opts: ["/rɪˈsaɪp/", "/ˈrɛsəpi/", "/rəˈsiːp/", "/ˈreɪkɪp/"], a: 1, exp: "'Recipe' a trois syllabes et se prononce /ˈrɛsəpi/." },
      { q: "Quelle abréviation correspond à une cuillère à café dans les recettes en anglais ?", opts: ["tbsp", "tsp", "kg", "oz"], a: 1, exp: "'tsp' correspond à teaspoon (cuillère à café), tandis que 'tbsp' = tablespoon." },
      { q: "Que signifie le verbe 'to simmer' ?", opts: ["Congeler", "Mijoter à petit feu", "Brûler", "Mixer"], a: 1, exp: "'To simmer' signifie laisser mijoter à frémissement doux." }
    ]
  },
  {
    grade: '4e', theme_id: 'food', num: 3,
    title: 'Hydratation & nutrition sportive',
    title_en: 'Hydration & Athletic Nutrition',
    objective: 'Parler de l\'importance de l\'eau, des électrolytes et d\'une alimentation saine pour le corps.',
    grammar: {
      title: "Exprimer la cause avec BECAUSE, SINCE et AS",
      rule: "Pour justifier un comportement nutritionnel ou sportif, on emploie 'because' (cause directe), 'since' ou 'as' (cause connue et admise).",
      example_en: "Since your body loses water through sweat, you must drink regularly during football matches.",
      example_fr: "Puisque votre corps perd de l'eau par la transpiration, vous devez boire régulièrement pendant les matchs.",
      tip: "Since et As se placent souvent en tête de phrase pour introduire le contexte.",
      level_focus: "Conjonctions causales (because, since, as, due to)."
    },
    vocab: [
      ["hydration", "/haɪˈdreɪʃn/", "Noun", "l'hydratation corporelle", "Good hydration prevents muscular cramps and headaches.", "Une bonne hydratation évite les crampes et maux de tête."],
      ["electrolytes", "/ɪˈlɛktrəlaɪts/", "Noun", "les électrolytes (sels minéraux)", "Bananas and coconut water provide natural electrolytes.", "Bananes et eau de coco apportent des électrolytes naturels."],
      ["reusable flask", "/riːˈjuːzəbl flɑːsk/", "Noun", "la gourde réutilisable", "Always carry a stainless steel reusable flask in your gym bag.", "Emporte toujours une gourde inox réutilisable dans ton sac."],
      ["cramps", "/kræmps/", "Noun", "les crampes musculaires", "Dehydration during endurance running leads to painful cramps.", "La déshydratation en course d'endurance provoque des crampes."],
      ["energy", "/ˈɛnərdʒi/", "Noun", "l'énergie", "Whole grains provide long-lasting, steady energy.", "Les céréales complètes fournissent une énergie durable et régulière."],
      ["protein", "/ˈproʊtiːn/", "Noun", "les protéines", "Muscles need protein to repair fibers after workout.", "Les muscles ont besoin de protéines pour réparer les fibres."],
      ["tap water", "/tæp ˈwɔːtər/", "Noun", "l'eau du robinet", "Filtered tap water is both economical and green.", "L'eau du robinet filtrée est à la fois économique et écologique."],
      ["sweat", "/swɛt/", "Noun", "la transpiration / sueur", "Sweat cools down body temperature during exertion.", "La transpiration refroidit la température corporelle à l'effort."],
      ["workout", "/ˈwɜːrkaʊt/", "Noun", "la séance d'entraînement physique", "Eat a handful of almonds after your evening workout.", "Mange une poignée d'amandes après ton entraînement du soir."],
      ["vital", "/ˈvaɪtl/", "Adjective", "vital / essentiel", "Drinking two liters of water daily is vital for health.", "Boire deux litres d'eau par jour est vital pour la santé."]
    ],
    dialogue: {
      title: "Conseils du coach avant le cross", setting: "L'enseignant d'EPS briefe les coureurs de demi-fond.",
      lines: [
        ["Coach", "Since the sun is shining brightly today, drink sips of water before the race.", "Puisque le soleil brille fort aujourd'hui, buvez de petites gorgées avant la course."],
        ["Runner", "Should we drink sweet fizzy sodas to get fast energy?", "Devrions-nous boire des sodas sucrés pour avoir de l'énergie rapide ?"],
        ["Coach", "No! Avoid sugary drinks because they cause energy crashes.", "Non ! Évitez les boissons sucrées car elles provoquent des coups de fatigue."],
        ["Runner", "Tap water in our reusable flasks is the best option.", "L'eau du robinet dans nos gourdes est la meilleure option."]
      ]
    },
    dictation: { prompt: "Good hydration prevents painful muscle cramps during sports.", fr: "Une bonne hydratation évite les crampes musculaires douloureuses pendant le sport." },
    quiz: [
      { q: "Quelle conjonction causale s'utilise couramment en début de phrase pour signifier 'puisque' ?", opts: ["Although", "Since", "Unless", "While"], a: 1, exp: "'Since' (ou 'as') en début de phrase signifie 'puisque' ou 'étant donné que'." },
      { q: "Quel nutriment aide à reconstruire les fibres musculaires après l'effort ?", opts: ["Sugar", "Protein", "Fat", "Vitamins only"], a: 1, exp: "Les protéines ('protein') jouent un rôle clé dans la reconstruction musculaire." },
      { q: "Que signifie 'tap water' ?", opts: ["De l'eau minérale gazeuse", "De l'eau du robinet", "Du sirop", "De l'eau de mer"], a: 1, exp: "'Tap water' est l'eau potable du robinet." }
    ]
  },
  {
    grade: '4e', theme_id: 'work', num: 2,
    title: 'L\'entretien d\'embauche & lettre de motivation',
    title_en: 'Job Interview & Motivation Letter',
    objective: 'Se présenter lors d\'un entretien de stage en anglais et valoriser ses compétences.',
    grammar: {
      title: "Le Present Perfect avec FOR et SINCE pour la durée d'une compétence",
      rule: "On utilise le Present Perfect + SINCE (point de départ précis : since 2022) ou + FOR (durée : for three years) pour exprimer une expérience qui continue dans le présent.",
      example_en: "I have studied English for four years and I have played in the school orchestra since 2023.",
      example_fr: "J'étudie l'anglais depuis quatre ans et je joue dans l'orchestre du collège depuis 2023.",
      tip: "Retenez : SINCE = point de départ temporel / FOR = durée mesurée.",
      level_focus: "Present Perfect de bilan avec for et since."
    },
    vocab: [
      ["interview", "/ˈɪntərvjuː/", "Noun", "l'entretien d'embauche", "Prepare for your interview by practicing clear answers.", "Prépare ton entretien en t'entraînant à des réponses claires."],
      ["cover letter", "/ˈkʌvər ˈlɛtər/", "Noun", "la lettre de motivation", "State your genuine enthusiasm in your cover letter.", "Exprime ton enthousiasme sincère dans ta lettre de motivation."],
      ["strengths", "/strɛŋkθs/", "Noun", "les points forts / atouts", "My main strengths are active listening and patience.", "Mes principaux atouts sont l'écoute active et la patience."],
      ["handshake", "/ˈhændʃeɪk/", "Noun", "la poignée de main", "A firm, polite handshake demonstrates self-confidence.", "Une poignée de main ferme et polie témoigne d'assurance."],
      ["resume", "/ˈrɛzəmeɪ/", "Noun", "le curriculum vitae (CV)", "List your volunteer experience on your one-page resume.", "Mentionne tes expériences bénévoles sur ton CV d'une page."],
      ["candidate", "/ˈkændɪdət/", "Noun", "le candidat", "The hiring manager thanked the young candidate.", "Le responsable du recrutement a remercié le jeune candidat."],
      ["punctuality", "/ˌpʌŋktʃuˈæləti/", "Noun", "la ponctualité", "Punctuality is the very first impression you create.", "La ponctualité est la toute première impression que vous donnez."],
      ["enthusiastic", "/ɪnˌθjuːziˈæstɪk/", "Adjective", "enthousiaste", "Show that you are enthusiastic about learning on the job.", "Montre que tu es enthousiaste à l'idée d'apprendre sur le terrain."],
      ["experience", "/ɪkˈspɪəriəns/", "Noun", "l'expérience acquise", "Internships provide invaluable hands-on experience.", "Les stages apportent une expérience pratique inestimable."],
      ["suitable", "/ˈsuːtəbl/", "Adjective", "approprié / qui convient", "Dress in suitable professional clothes for the interview.", "Habille-toi avec des vêtements professionnels adaptés pour l'entretien."]
    ],
    dialogue: {
      title: "Simulation d'entretien pour un stage", setting: "Un collégien passe un entretien pour un stage dans une librairie bilingue.",
      lines: [
        ["Interviewer", "Welcome, Lucas. Why would you like to do your internship in our bookshop?", "Bienvenue, Lucas. Pourquoi aimerais-tu faire ton stage dans notre librairie ?"],
        ["Lucas", "I have read English literature for three years and I love advising readers.", "Je lis de la littérature anglaise depuis trois ans et j'adore conseiller les lecteurs."],
        ["Interviewer", "What are your two greatest strengths in a working team?", "Quels sont tes deux plus grands atouts au sein d'une équipe ?"],
        ["Lucas", "I am very organized and I have been a dependable team worker since primary school.", "Je suis très méthodique et je suis un coéquipier fiable depuis l'école primaire."]
      ]
    },
    dictation: { prompt: "I have studied English for four years and I am motivated.", fr: "J'étudie l'anglais depuis quatre ans et je suis motivé." },
    quiz: [
      { q: "Quel mot complète la durée : 'I have played the piano ... five years' ?", opts: ["since", "for", "during", "ago"], a: 1, exp: "Pour une durée mesurée (cinq ans), on emploie la préposition 'for'." },
      { q: "Quel mot complète le point de départ : 'She has worked here ... September' ?", opts: ["for", "since", "during", "ago"], a: 1, exp: "Pour un point de départ précis dans le temps (septembre), on emploie 'since'." },
      { q: "Que signifie 'cover letter' en recherche d'emploi ou de stage ?", opts: ["Le contrat de travail", "La lettre de motivation", "Le bulletin de notes", "Le diplôme"], a: 1, exp: "'Cover letter' est la lettre de motivation qui accompagne le CV." }
    ]
  },
  {
    grade: '4e', theme_id: 'work', num: 3,
    title: 'Télétravail & réunions en visioconférence',
    title_en: 'Remote Work & Virtual Collaboration',
    objective: 'Participer à une réunion en ligne et maîtriser le lexique du travail à distance.',
    grammar: {
      title: "Les verbes modaux de probabilité modérée (MAY / MIGHT)",
      rule: "On utilise 'may' ou 'might' + base verbale pour exprimer une hypothèse ou une possibilité incertaine (50% ou moins).",
      example_en: "Our connection might lag, so you may turn off your camera to save bandwidth.",
      example_fr: "Notre connexion pourrait avoir des ralentissements, vous pouvez donc couper votre caméra pour préserver la bande passante.",
      tip: "Might exprime une probabilité encore plus incertaine que May.",
      level_focus: "Modaux de possibilité hypothétique (may, might, could)."
    },
    vocab: [
      ["remote work", "/rɪˈmoʊt wɜːrk/", "Noun", "le télétravail", "Remote work requires discipline and clear daily routines.", "Le télétravail exige de la discipline et des routines claires."],
      ["video call", "/ˈvɪdioʊ kɔːl/", "Noun", "l'appel vidéo / la visioconférence", "Join the weekly project update on the video call.", "Rejoins le point hebdomadaire sur l'appel vidéo."],
      ["mute", "/mjuːt/", "Verb", "couper son micro / mettre en silencieux", "Please mute your microphone when you are not speaking.", "Veuillez couper votre micro lorsque vous ne parlez pas."],
      ["screen sharing", "/skriːn ˈʃɛərɪŋ/", "Noun", "le partage d'écran", "Screen sharing allows everyone to view the slide deck.", "Le partage d'écran permet à tous de voir le diaporama."],
      ["bandwidth", "/ˈbændwɪdθ/", "Noun", "la bande passante internet", "High bandwidth ensures smooth video transmission.", "Une bande passante élevée garantit une transmission vidéo fluide."],
      ["agenda", "/əˈdʒɛndə/", "Noun", "l'ordre du jour d'une réunion", "Review the four agenda items before the session starts.", "Passez en revue les quatre points à l'ordre du jour avant la réunion."],
      ["headset", "/ˈhɛdsɛt/", "Noun", "le micro-casque professionnel", "Use a noise-cancelling headset for clear audio.", "Utilise un micro-casque antibruit pour un son limpide."],
      ["collaborate", "/kəˈlæbəreɪt/", "Verb", "collaborer / travailler ensemble", "Teams collaborate effectively on shared cloud files.", "Les équipes collaborent efficacement sur des fichiers partagés."],
      ["deadline", "/ˈdɛdlaɪn/", "Noun", "la date limite de livraison", "The deadline for the graphic draft is Friday noon.", "La date limite pour la maquette graphique est vendredi midi."],
      ["unmute", "/ʌnˈmjuːt/", "Verb", "réactiver son micro", "Unmute yourself to answer the director's question.", "Réactive ton micro pour répondre à la question du directeur."]
    ],
    dialogue: {
      title: "Lancement de la visioconférence internationale", setting: "Des collègues connectés depuis Londres, Dublin et Toronto.",
      lines: [
        ["Host", "Good morning team! Can everyone hear me and see my screen sharing?", "Bonjour l'équipe ! Tout le monde m'entend-il et voit-il mon partage d'écran ?"],
        ["Participant", "Your audio is slightly quiet, you might want to bring your mic closer.", "Votre son est un peu faible, vous pourriez rapprocher votre micro."],
        ["Host", "Is that better? Please remember to mute when not speaking to avoid echo.", "Est-ce mieux ? Pensez à couper votre micro pour éviter l'écho."],
        ["Participant", "Perfect now! Let's proceed with the first agenda point.", "Parfait maintenant ! Passons au premier point de l'ordre du jour."]
      ]
    },
    dictation: { prompt: "Please mute your microphone during the video conference.", fr: "Veuillez couper votre micro pendant la visioconférence." },
    quiz: [
      { q: "Quel mot d'action permet de couper le son de son micro en visioconférence ?", opts: ["To mute", "To cut", "To stop", "To sleep"], a: 0, exp: "'To mute' signifie couper le microphone ou rendre silencieux." },
      { q: "Quel modal exprime une possibilité incertaine (peut-être) ?", opts: ["Must", "Might", "Will", "Shall"], a: 1, exp: "'Might' exprime une possibilité ou hypothèse incertaine." },
      { q: "Que signifie 'deadline' en milieu professionnel ?", opts: ["Le contrat de fin", "La date limite impérative", "L'horaire de pause", "Le salaire"], a: 1, exp: "'Deadline' désigne l'échéance ou date limite de remise d'un projet." }
    ]
  },
  {
    grade: '4e', theme_id: 'school_social', num: 2,
    title: 'Les métiers du web & du code informatique',
    title_en: 'Web Development & Coding Careers',
    objective: 'Parler de programmation informatique, de cybersécurité et de design numérique.',
    grammar: {
      title: "Les propositions infinitives de finalité avec ENABLE / ALLOW SOMEONE TO DO SOMETHING",
      rule: "On utilise 'allow / enable + quelqu'un + TO + base verbale' pour exprimer ce qu'une technologie ou un métier rend possible.",
      example_en: "Clean code enables websites to load fast and allows users to navigate safely.",
      example_fr: "Un code propre permet aux sites de se charger vite et permet aux utilisateurs de naviguer en sécurité.",
      tip: "Structure : verb + object + TO + infinitive.",
      level_focus: "Verbes de causalité et d'autorisation technique (allow, enable, empower)."
    },
    vocab: [
      ["software developer", "/ˈsɒftwɛər dɪˈvɛləpər/", "Noun", "le développeur de logiciels", "A software developer writes clean, efficient code.", "Un développeur de logiciels écrit un code propre et efficace."],
      ["web designer", "/wɛb dɪˈzaɪnər/", "Noun", "le concepteur de sites web", "The web designer crafts accessible visual interfaces.", "Le web designer conçoit des interfaces visuelles accessibles."],
      ["cybersecurity", "/ˈsaɪbərsɪˈkjʊərəti/", "Noun", "la cybersécurité", "Cybersecurity experts protect sensitive user data from hackers.", "Les experts en cybersécurité protègent les données sensibles des pirates."],
      ["programming language", "/ˈproʊɡræmɪŋ ˈlæŋɡwɪdʒ/", "Noun", "le langage de programmation", "Python and JavaScript are popular programming languages.", "Python et JavaScript sont des langages de programmation très prisés."],
      ["bug", "/bʌɡ/", "Noun", "le bogue / bug informatique", "A sharp programmer identifies and fixes subtle bugs.", "Un programmeur avisé repère et corrige les bugs subtils."],
      ["database", "/ˈdeɪtəbeɪs/", "Noun", "la base de données", "Customer accounts are securely stored in the cloud database.", "Les comptes clients sont stockés en sécurité dans la base de données cloud."],
      ["algorithm", "/ˈælɡərɪðəm/", "Noun", "l'algorithme", "The recommendation algorithm sorts videos according to user taste.", "L'algorithme de recommandation trie les vidéos selon les goûts."],
      ["debug", "/diːˈbʌɡ/", "Verb", "déboguer / corriger les erreurs", "Take time to debug your script line by line.", "Prends le temps de déboguer ton script ligne par ligne."],
      ["interface", "/ˈɪntərfeɪs/", "Noun", "l'interface utilisateur", "An intuitive interface improves user satisfaction.", "Une interface intuitive améliore la satisfaction de l'utilisateur."],
      ["coding", "/ˈkoʊdɪŋ/", "Noun", "le codage informatique", "Learning coding at school stimulates logic and creativity.", "Apprendre le code au collège stimule la logique et la créativité."]
    ],
    dialogue: {
      title: "Rencontre avec une développeuse web", setting: "Au forum des métiers du collège, une ingénieure témoigne.",
      lines: [
        ["Pupil", "What does a software engineer do on a daily basis?", "Que fait un ingénieur logiciel au quotidien ?"],
        ["Engineer", "We write code that enables applications to solve real-world problems.", "Nous écrivons du code qui permet aux applications de résoudre de vrais problèmes."],
        ["Pupil", "Is it essential to be a genius in maths to start coding?", "Est-il indispensable d'être un génie en maths pour commencer à coder ?"],
        ["Engineer", "Not at all! Curiosity, logic and perseverance are the true superpowers.", "Pas du tout ! La curiosité, la logique et la persévérance sont les vrais super-pouvoirs."]
      ]
    },
    dictation: { prompt: "Software developers write code to build useful applications.", fr: "Les développeurs logiciels écrivent du code pour bâtir des applications utiles." },
    quiz: [
      { q: "Quelle structure verbale suit 'enables users' ?", opts: ["navigate", "to navigate", "navigating", "navigated"], a: 1, exp: "La structure exacte est 'enable someone TO do something'." },
      { q: "Que signifie 'to debug' en programmation ?", opts: ["Acheter un ordinateur", "Détecter et corriger les erreurs d'un programme", "Éteindre l'écran", "Changer le mot de passe"], a: 1, exp: "'To debug' signifie identifier et supprimer les bugs (erreurs de code)." },
      { q: "Quel est le rôle d'un expert en 'cybersecurity' ?", opts: ["Vendre des écrans", "Protéger les données et systèmes contre les cyberattaques", "Écrire des e-mails", "Dessiner des logos"], a: 1, exp: "La cybersécurité vise à protéger les réseaux et données contre les attaques numériques." }
    ]
  }
];
