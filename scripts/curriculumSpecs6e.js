import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalDataPath = path.join(__dirname, '../src/data/schoolCurriculumData.json');
const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));

const THEMES = [
  { id: "daily_life", label: "Vie quotidienne", icon: "schedule", en: "Daily Life & Routines" },
  { id: "travel", label: "Voyages", icon: "flight_takeoff", en: "Travel & Exploration" },
  { id: "history", label: "Histoire & Patrimoine", icon: "history_edu", en: "History & Heritage" },
  { id: "hobbies", label: "Loisirs & Créativité", icon: "palette", en: "Hobbies & Leisure" },
  { id: "sport", label: "Sport & Dépassement", icon: "fitness_center", en: "Sports & Athletics" },
  { id: "music", label: "Musique & Culture", icon: "music_note", en: "Music & Performing Arts" },
  { id: "restaurant", label: "Restaurant & Convivialité", icon: "restaurant", en: "Dining Out & Gastronomy" },
  { id: "food", label: "Alimentation & Santé", icon: "nutrition", en: "Food & Nutrition" },
  { id: "work", label: "Monde du Travail", icon: "work", en: "Workplace & Dynamics" },
  { id: "school_social", label: "Métiers & Vocations", icon: "school", en: "Professions & Careers" }
];

const GRADE_META = {
  '6e': { label: 'Sixième', cycle: 'Cycle 3', cefr: 'A1–A1+', minutes: 20 },
  '5e': { label: 'Cinquième', cycle: 'Cycle 4', cefr: 'A1+–A2', minutes: 22 },
  '4e': { label: 'Quatrième', cycle: 'Cycle 4', cefr: 'A2–A2+', minutes: 25 },
  '3e': { label: 'Troisième', cycle: 'Cycle 4', cefr: 'A2+–B1', minutes: 25 },
  '2nde': { label: 'Seconde', cycle: 'Lycée', cefr: 'B1', minutes: 30 },
  '1re': { label: 'Première', cycle: 'Lycée', cefr: 'B1–B2', minutes: 30 },
  'terminale': { label: 'Terminale', cycle: 'Lycée', cefr: 'B2, ouverture C1', minutes: 35 }
};

// Distribution of new lessons to reach 200 total:
// Current: 10 per grade = 70.
// Target: 29 in 6e (+19), 29 in 5e (+19), 29 in 4e (+19), 29 in 3e (+19), 28 in 2nde (+18), 28 in 1re (+18), 28 in terminale (+18).
// 70 + 76 + 54 = 200.

// The thematic curriculum roadmap with authentic linguistic data:
const LESSON_DEFINITIONS = [
  // ==========================================
  // 6e : 19 NOUVELLES LEÇONS (Total 6e: 29)
  // ==========================================
  {
    grade: '6e', theme_id: 'daily_life', num: 2,
    title: 'Les pièces de la maison & le mobilier',
    title_en: 'Rooms & Furniture at Home',
    objective: 'Identifier les pièces de la maison et le mobilier usuel avec there is / there are.',
    grammar: {
      title: "There is & There are (Description spatiale)",
      rule: "On emploie 'There is' devant un nom singulier et 'There are' devant un nom au pluriel.",
      example_en: "There is a blue sofa in the living room and there are three posters on the wall.",
      example_fr: "Il y a un canapé bleu dans le salon et il y a trois posters sur le mur.",
      tip: "À la forme interrogative, inversez : Is there a desk? Are there chairs?",
      level_focus: "There is / There are, prépositions de lieu (in, on, under, behind, next to)."
    },
    vocab: [
      ["bedroom", "/ˈbɛdruːm/", "Noun", "la chambre à coucher", "My bedroom has a big window.", "Ma chambre a une grande fenêtre."],
      ["living room", "/ˈlɪvɪŋ ruːm/", "Noun", "le salon", "We relax in the living room.", "Nous nous détendons dans le salon."],
      ["kitchen", "/ˈkɪtʃɪn/", "Noun", "la cuisine", "Dad prepares breakfast in the kitchen.", "Papa prépare le petit-déjeuner dans la cuisine."],
      ["bathroom", "/ˈbɑːθruːm/", "Noun", "la salle de bains", "The bathroom is next to the stairs.", "La salle de bains est à côté des escaliers."],
      ["desk", "/dɛsk/", "Noun", "le bureau (meuble)", "I do my homework at my desk.", "Je fais mes devoirs à mon bureau."],
      ["sofa", "/ˈsoʊfə/", "Noun", "le canapé", "The cat sleeps on the sofa.", "Le chat dort sur le canapé."],
      ["bookshelf", "/ˈbʊkʃɛlf/", "Noun", "l'étagère à livres", "There are twenty books on the bookshelf.", "Il y a vingt livres sur l'étagère."],
      ["wardrobe", "/ˈwɔːdroʊb/", "Noun", "l'armoire / la penderie", "Hang your coat in the wardrobe.", "Accroche ton manteau dans l'armoire."],
      ["carpet", "/ˈkɑːrpɪt/", "Noun", "le tapis / la moquette", "The carpet feels very warm.", "Le tapis est très chaud."],
      ["lamp", "/læmp/", "Noun", "la lampe", "Turn on the lamp on your desk.", "Allume la lampe sur ton bureau."]
    ],
    dialogue: {
      title: "Visite de la maison", setting: "Tom montre sa chambre à son ami Paul.",
      lines: [
        ["Tom", "Welcome to my home! Here is the living room.", "Bienvenue chez moi ! Voici le salon."],
        ["Paul", "Is your bedroom upstairs?", "Est-ce que ta chambre est à l'étage ?"],
        ["Tom", "Yes, there is a large desk and a new bookshelf in it.", "Oui, il y a un grand bureau et une nouvelle étagère."],
        ["Paul", "It looks very cozy and bright!", "C'est très chaleureux et lumineux !"]
      ]
    },
    dictation: { prompt: "There is a wooden desk in my bedroom.", fr: "Il y a un bureau en bois dans ma chambre." },
    quiz: [
      { q: "Quelle forme utilise-t-on pour deux chaises ?", opts: ["There is two chairs.", "There are two chairs.", "There have two chairs.", "They are two chairs."], a: 1, exp: "Au pluriel, on emploie 'There are'." },
      { q: "Que signifie 'kitchen' ?", opts: ["La chambre", "La cuisine", "Le jardin", "Le salon"], a: 1, exp: "'Kitchen' signifie cuisine." },
      { q: "Quel meuble sert à ranger ses livres ?", opts: ["A wardrobe", "A sofa", "A bookshelf", "A carpet"], a: 2, exp: "'Bookshelf' est l'étagère à livres." }
    ]
  },
  {
    grade: '6e', theme_id: 'daily_life', num: 3,
    title: 'La vie scolaire & le matériel de cours',
    title_en: 'School Life & Stationery',
    objective: 'Nommer le matériel scolaire et formuler des requêtes simples en classe.',
    grammar: {
      title: "Le modal CAN pour la permission & la demande",
      rule: "On utilise 'Can I + base verbale' pour demander poliment l'autorisation ou un objet en classe.",
      example_en: "Can I borrow your ruler, please?",
      example_fr: "Puis-je emprunter ta règle, s'il te plaît ?",
      tip: "Le verbe qui suit CAN reste toujours à la base verbale sans 'to'.",
      level_focus: "Modal CAN/CAN'T, impératif pour les consignes scolaires."
    },
    vocab: [
      ["ruler", "/ˈruːlər/", "Noun", "la règle", "Draw a straight line with a ruler.", "Trace une ligne droite avec une règle."],
      ["pencil sharpener", "/ˈpɛnsl ˈʃɑːrpənər/", "Noun", "le taille-crayon", "My pencil is broken, where is the sharpener?", "Mon crayon est cassé, où est le taille-crayon ?"],
      ["eraser", "/ɪˈreɪsər/", "Noun", "la gomme", "Erase the pencil marks gently.", "Efface les traits de crayon doucement."],
      ["scissors", "/ˈsɪzərz/", "Noun", "les ciseaux", "Be careful with these sharp scissors.", "Fais attention avec ces ciseaux pointus."],
      ["glue stick", "/ɡluː stɪk/", "Noun", "le bâton de colle", "Stick the picture with the glue stick.", "Colle l'image avec le bâton de colle."],
      ["notebook", "/ˈnoʊtbʊk/", "Noun", "le cahier", "Open your English notebook.", "Ouvre ton cahier d'anglais."],
      ["highlighter", "/ˈhaɪlaɪtər/", "Noun", "le surligneur", "Use a yellow highlighter for new words.", "Utilise un surligneur jaune pour les nouveaux mots."],
      ["binder", "/ˈbaɪndər/", "Noun", "le classeur", "Keep your worksheets in this binder.", "Garde tes fiches dans ce classeur."],
      ["pencil case", "/ˈpɛnsl keɪs/", "Noun", "la trousse", "Put your pens into the pencil case.", "Mets tes stylos dans la trousse."],
      ["timetable", "/ˈtaɪmteɪbl/", "Noun", "l'emploi du temps", "Check our timetable for tomorrow morning.", "Regarde notre emploi du temps pour demain matin."]
    ],
    dialogue: {
      title: "En classe d'anglais", setting: "Sarah a oublié sa règle et demande à Leo.",
      lines: [
        ["Sarah", "Excuse me Leo, can I borrow your ruler, please?", "Excuse-moi Leo, puis-je emprunter ta règle, s'il te plaît ?"],
        ["Leo", "Yes, of course! Here you are.", "Oui, bien sûr ! Tiens."],
        ["Sarah", "Thank you very much!", "Merci beaucoup !"],
        ["Leo", "You are welcome. Don't forget your eraser too.", "De rien. N'oublie pas ta gomme aussi."]
      ]
    },
    dictation: { prompt: "Open your notebook and write the lesson.", fr: "Ouvre ton cahier et écris la leçon." },
    quiz: [
      { q: "Comment demander poliment un stylo ?", opts: ["Give me pen!", "Can I borrow a pen, please?", "I want your pen.", "You give me a pen."], a: 1, exp: "'Can I borrow... please?' est la formule polie appropriée." },
      { q: "Que signifie 'timetable' ?", opts: ["Une montre", "Une table", "L'emploi du temps", "Une pause"], a: 2, exp: "'Timetable' signifie l'emploi du temps scolaire." },
      { q: "Pourquoi 'scissors' prend-il un 's' ?", opts: ["C'est toujours un nom pluriel en anglais.", "C'est une faute.", "On peut aussi dire 'a scissor'.", "C'est un verbe."], a: 0, exp: "'Scissors' est toujours pluriel (a pair of scissors)." }
    ]
  },
  {
    grade: '6e', theme_id: 'travel', num: 2,
    title: 'Demander son chemin & se repérer en ville',
    title_en: 'Asking Directions & Finding the Way',
    objective: 'Donner et comprendre des indications d\'orientation simples en ville.',
    grammar: {
      title: "L'Impératif de direction",
      rule: "Pour donner une direction, on utilise l'impératif direct : Turn left, Turn right, Go straight ahead.",
      example_en: "Turn right at the bakery and go straight on for two hundred meters.",
      example_fr: "Tournez à droite à la boulangerie et continuez tout droit sur deux cents mètres.",
      tip: "Utilisez 'Excuse me, where is...?' pour entamer poliment votre question.",
      level_focus: "Prépositions de repérage et verbes d'action directionnels."
    },
    vocab: [
      ["turn left", "/tɜːrn lɛft/", "Phrase", "tourner à gauche", "Turn left at the traffic lights.", "Tourne à gauche aux feux tricolores."],
      ["turn right", "/tɜːrn raɪt/", "Phrase", "tourner à droite", "Turn right after the post office.", "Tourne à droite après la poste."],
      ["go straight ahead", "/ɡoʊ streɪt əˈhɛd/", "Phrase", "aller tout droit", "Go straight ahead for two blocks.", "Va tout droit pendant deux pâtés de maisons."],
      ["cross the street", "/krɒs ðə striːt/", "Phrase", "traverser la rue", "Cross the street at the pedestrian crossing.", "Traverse la rue au passage piéton."],
      ["corner", "/ˈkɔːrnər/", "Noun", "le coin / l'angle de rue", "The bus stop is at the corner.", "L'arrêt de bus est au coin de la rue."],
      ["traffic lights", "/ˈtræfɪk laɪts/", "Noun", "les feux de signalisation", "Stop when the traffic lights are red.", "Arrête-toi quand les feux sont rouges."],
      ["pedestrian crossing", "/pəˈdɛstriən ˈkrɒsɪŋ/", "Noun", "le passage pour piétons", "Always cross at the pedestrian crossing.", "Traverse toujours au passage piéton."],
      ["near", "/nɪər/", "Preposition", "près de", "The school is near the park.", "L'école est près du parc."],
      ["opposite", "/ˈɒpəzɪt/", "Preposition", "en face de", "The museum is opposite the library.", "Le musée est en face de la bibliothèque."],
      ["between", "/bɪˈtwiːn/", "Preposition", "entre", "The café is between two shops.", "Le café est entre deux magasins."]
    ],
    dialogue: {
      title: "Où se trouve la bibliothèque ?", setting: "Un visiteur cherche la bibliothèque municipale.",
      lines: [
        ["Tourist", "Excuse me, where is the town library?", "Excusez-moi, où se trouve la bibliothèque ?"],
        ["Resident", "Go straight ahead, then turn right at the corner.", "Allez tout droit, puis tournez à droite au coin."],
        ["Tourist", "Is it far from here?", "Est-ce loin d'ici ?"],
        ["Resident", "No, it is opposite the green park, five minutes on foot.", "Non, c'est en face du parc, à cinq minutes à pied."]
      ]
    },
    dictation: { prompt: "Turn left and go straight ahead.", fr: "Tourne à gauche et va tout droit." },
    quiz: [
      { q: "Que signifie 'go straight ahead' ?", opts: ["Tournez à droite", "Allez tout droit", "Faites demi-tour", "Traversez le pont"], a: 1, exp: "'Go straight ahead' signifie continuer tout droit." },
      { q: "Quelle préposition signifie 'en face de' ?", opts: ["Under", "Opposite", "Between", "Behind"], a: 1, exp: "'Opposite' exprime la position en face de quelque chose." },
      { q: "Comment dit-on 'les feux de signalisation' ?", opts: ["The street lamps", "The traffic lights", "The bus stops", "The corner"], a: 1, exp: "'Traffic lights' désigne les feux tricolores." }
    ]
  },
  {
    grade: '6e', theme_id: 'travel', num: 3,
    title: 'Prendre le train & à la gare',
    title_en: 'Taking the Train & Railway Station',
    objective: 'Comprendre les annonces de quai et acheter un billet de train basique.',
    grammar: {
      title: "Les questions en WH- (What, Where, When)",
      rule: "Pour poser des questions sur un horaire ou un quai, on commence par When, Where ou What.",
      example_en: "When does the train to Oxford leave?",
      example_fr: "Quand part le train pour Oxford ?",
      tip: "Rappelez-vous : Where = Où, When = Quand, What time = À quelle heure.",
      level_focus: "Mots interrogatifs en Wh-, verbes de transport au présent."
    },
    vocab: [
      ["train station", "/treɪn ˈsteɪʃn/", "Noun", "la gare ferroviaire", "We meet at Paddington train station.", "Nous nous retrouvons à la gare de Paddington."],
      ["platform", "/ˈplætfɔːrm/", "Noun", "le quai de gare", "The train departs from platform three.", "Le train part du quai numéro trois."],
      ["ticket", "/ˈtɪkɪt/", "Noun", "le billet / titre de transport", "Show your ticket to the inspector.", "Montre ton billet au contrôleur."],
      ["passenger", "/ˈpæsɪndʒər/", "Noun", "le passager", "Many passengers are waiting quietly.", "De nombreux passagers attendent calmement."],
      ["luggage", "/ˈlʌɡɪdʒ/", "Noun", "les bagages", "Put your luggage on the overhead rack.", "Mets tes bagages sur le porte-bagages."],
      ["timetable", "/ˈtaɪmteɪbl/", "Noun", "le tableau des horaires", "Look at the timetable on the big screen.", "Regarde les horaires sur le grand écran."],
      ["depart", "/dɪˈpɑːrt/", "Verb", "partir / démarrer", "Our train departs at ten o'clock.", "Notre train part à dix heures."],
      ["arrive", "/əˈraɪv/", "Verb", "arriver", "We arrive in Cambridge at noon.", "Nous arrivons à Cambridge à midi."],
      ["single ticket", "/ˈsɪŋɡl ˈtɪkɪt/", "Noun", "un aller simple", "One single ticket to London, please.", "Un aller simple pour Londres, s'il vous plaît."],
      ["return ticket", "/rɪˈtɜːrn ˈtɪkɪt/", "Noun", "un aller-retour", "A return ticket is cheaper today.", "Un aller-retour est plus économique aujourd'hui."]
    ],
    dialogue: {
      title: "Au guichet de la gare", setting: "Lucas achète un billet pour Windsor.",
      lines: [
        ["Lucas", "Good morning, one return ticket to Windsor, please.", "Bonjour, un aller-retour pour Windsor, s'il vous plaît."],
        ["Clerk", "That is twelve pounds. The train leaves at ten past nine.", "Cela fait douze livres. Le train part à neuf heures dix."],
        ["Lucas", "Which platform does it leave from?", "De quel quai part-il ?"],
        ["Clerk", "Platform four. Have a nice trip!", "Du quai quatre. Bon voyage !"]
      ]
    },
    dictation: { prompt: "The train leaves from platform four.", fr: "Le train part du quai numéro quatre." },
    quiz: [
      { q: "Que signifie 'return ticket' ?", opts: ["Un aller simple", "Un aller-retour", "Un abonnement", "Un ticket annulé"], a: 1, exp: "'Return ticket' correspond à un billet aller-retour." },
      { q: "Comment demande-t-on le numéro du quai ?", opts: ["Which bus is it?", "Which platform does it leave from?", "Where is the door?", "What ticket is it?"], a: 1, exp: "'Platform' désigne le quai de train." },
      { q: "Que signifie 'luggage' ?", opts: ["Le billet", "Les bagages", "Le contrôleur", "L'horloge"], a: 1, exp: "'Luggage' est le mot générique pour les bagages." }
    ]
  },
  {
    grade: '6e', theme_id: 'history', num: 2,
    title: 'Londres & ses monuments historiques',
    title_en: 'London Landmarks & Heritage',
    objective: 'Découvrir les monuments célèbres de Londres et utiliser les prépositions de lieu.',
    grammar: {
      title: "L'article défini THE devant les monuments",
      rule: "On utilise 'the' devant la plupart des monuments et fleuves : the Tower of London, the Thames, the London Eye.",
      example_en: "The River Thames flows right beside the Tower of London.",
      example_fr: "La Tamise s'écoule juste à côté de la Tour de Londres.",
      tip: "Attention : Big Ben est le surnom de la cloche de l'horloge d'Elizabeth Tower !",
      level_focus: "L'article défini THE, noms propres géographiques, verbe BE au présent."
    },
    vocab: [
      ["bridge", "/brɪdʒ/", "Noun", "le pont", "Tower Bridge can open for tall ships.", "Le Tower Bridge s'ouvre pour les grands bateaux."],
      ["palace", "/ˈpæləs/", "Noun", "le palais", "The King lives in Buckingham Palace.", "Le Roi réside au palais de Buckingham."],
      ["tower", "/ˈtaʊər/", "Noun", "la tour", "Big Ben is a very famous clock tower.", "Big Ben est une tour de l'horloge très célèbre."],
      ["river", "/ˈrɪvər/", "Noun", "le fleuve / la rivière", "Boats travel on the River Thames.", "Des bateaux naviguent sur la Tamise."],
      ["museum", "/mjuˈziːəm/", "Noun", "le musée", "Entry to the British Museum is free.", "L'entrée au British Museum est gratuite."],
      ["castle", "/ˈkɑːsl/", "Noun", "le château fort", "Windsor Castle is very ancient.", "Le château de Windsor est très ancien."],
      ["guard", "/ɡɑːrd/", "Noun", "le garde royal", "The royal guard wears a red tunic.", "Le garde royal porte une tunique rouge."],
      ["statue", "/ˈstætʃuː/", "Noun", "la statue", "Nelson's statue stands in Trafalgar Square.", "La statue de Nelson se dresse à Trafalgar Square."],
      ["square", "/skwɛər/", "Noun", "la place publique", "Trafalgar Square is a famous meeting place.", "Trafalgar Square est un lieu de rendez-vous réputé."],
      ["monument", "/ˈmɒnjumənt/", "Noun", "le monument", "London has many historic monuments.", "Londres possède de nombreux monuments historiques."]
    ],
    dialogue: {
      title: "Excursion à Londres", setting: "Chloé et son correspondant Jack visitent Tower Bridge.",
      lines: [
        ["Chloé", "Look Jack, is that Tower Bridge across the river?", "Regarde Jack, est-ce Tower Bridge au-dessus du fleuve ?"],
        ["Jack", "Yes, it is! Next to it is the Tower of London.", "Oui ! À côté se trouve la Tour de Londres."],
        ["Chloé", "Can we see the guards with red coats?", "Pouvons-nous voir les gardes aux vestes rouges ?"],
        ["Jack", "Yes, at Buckingham Palace during the changing of the guard.", "Oui, au palais de Buckingham pendant la relève de la garde."]
      ]
    },
    dictation: { prompt: "Tower Bridge is a famous bridge in London.", fr: "Tower Bridge est un pont célèbre à Londres." },
    quiz: [
      { q: "Quel fleuve traverse Londres ?", opts: ["The Seine", "The River Thames", "The Danube", "The Hudson"], a: 1, exp: "The River Thames (la Tamise) traverse la capitale britannique." },
      { q: "Quel monument abrite la célèbre cloche géante ?", opts: ["The London Eye", "Big Ben", "Trafalgar Square", "Hyde Park"], a: 1, exp: "Big Ben est la cloche historique de la tour du Parlement." },
      { q: "Où réside la famille royale britannique à Londres ?", opts: ["Windsor Castle", "Buckingham Palace", "The British Museum", "St Paul's Cathedral"], a: 1, exp: "Buckingham Palace est la résidence royale londonienne officielle." }
    ]
  },
  {
    grade: '6e', theme_id: 'history', num: 3,
    title: 'Fêtes & traditions britanniques',
    title_en: 'British Celebrations & Traditions',
    objective: 'Parler des fêtes du calendrier britannique (Halloween, Bonfire Night, Noël).',
    grammar: {
      title: "Les prépositions de temps : AT, ON, IN",
      rule: "On utilise 'ON' pour les jours et dates (on Christmas Day, on October 31st), 'AT' pour les moments festifs (at Halloween, at Christmas), et 'IN' pour les mois/saisons (in autumn, in December).",
      example_en: "We carve pumpkins on Halloween and watch fireworks on Bonfire Night.",
      example_fr: "Nous sculptons des citrouilles pour Halloween et regardons des feux d'artifice lors de Bonfire Night.",
      tip: "Retenez la règle : ON a day, AT a festival/time, IN a month/season.",
      level_focus: "Prépositions de temps et dates calendaires."
    },
    vocab: [
      ["bonfire", "/ˈbɒnfaɪər/", "Noun", "le feu de joie", "We build a bonfire on the fifth of November.", "Nous allumons un feu de joie le cinq novembre."],
      ["fireworks", "/ˈfaɪərwɜːrks/", "Noun", "les feux d'artifice", "Bright fireworks light up the night sky.", "Des feux d'artifice illuminent le ciel nocturne."],
      ["pumpkin", "/ˈpʌmpkɪn/", "Noun", "la citrouille", "We carve a scary face in the orange pumpkin.", "Nous sculptons un visage effrayant dans la citrouille."],
      ["costume", "/ˈkɒstjuːm/", "Noun", "le déguisement", "Children wear ghost costumes for Halloween.", "Les enfants portent des déguisements de fantômes pour Halloween."],
      ["carol", "/ˈkærəl/", "Noun", "le chant de Noël", "The choir sings Christmas carols in church.", "La chorale chante des chants de Noël à l'église."],
      ["cracker", "/ˈkrækər/", "Noun", "la papillote surprise de Noël", "Pull the Christmas cracker with a pop!", "Tire la papillote de Noël pour entendre un pop !"],
      ["present", "/ˈprɛznt/", "Noun", "le cadeau", "We open our presents on Christmas morning.", "Nous ouvrons nos cadeaux le matin de Noël."],
      ["celebrate", "/ˈsɛlɪbreɪt/", "Verb", "célébrer / fêter", "British families celebrate Boxing Day.", "Les familles britanniques fêtent le Boxing Day."],
      ["tradition", "/trəˈdɪʃn/", "Noun", "la tradition", "Pancake Day is a sweet British tradition.", "Le Pancake Day est une douce tradition britannique."],
      ["feast", "/fiːst/", "Noun", "le festin / banquet", "A delicious feast with roast turkey.", "Un festin délicieux avec de la dinde rôtie."]
    ],
    dialogue: {
      title: "Bonfire Night le 5 novembre", setting: "Oliver explique la tradition du 5 novembre à son amie.",
      lines: [
        ["Oliver", "Tonight is the fifth of November, Bonfire Night!", "Ce soir, c'est le cinq novembre, la nuit des feux de joie !"],
        ["Maya", "What do people do in England?", "Que font les gens en Angleterre ?"],
        ["Oliver", "We watch huge fireworks and eat jacket potatoes.", "Nous regardons d'immenses feux d'artifice et mangeons des pommes de terre au four."],
        ["Maya", "That sounds exciting and very festive!", "Cela a l'air passionnant et très festif !"]
      ]
    },
    dictation: { prompt: "We celebrate with bright fireworks at night.", fr: "Nous célébrons avec de brillants feux d'artifice la nuit." },
    quiz: [
      { q: "Quelle préposition utilise-t-on devant un jour précis comme 'Halloween Day' ?", opts: ["In", "On", "At", "Under"], a: 1, exp: "On utilise 'ON' devant un jour précis (on Halloween Day)." },
      { q: "Quand a lieu Bonfire Night au Royaume-Uni ?", opts: ["Le 31 octobre", "Le 5 novembre", "Le 25 décembre", "Le 1er janvier"], a: 1, exp: "Bonfire Night a lieu le 5 novembre (Guy Fawkes Night)." },
      { q: "Que font traditionnellement les enfants avec des citrouilles ?", opts: ["They carve them.", "They sing them.", "They wear them.", "They drive them."], a: 0, exp: "'To carve' signifie sculpter ou creuser (une citrouille)." }
    ]
  },
  {
    grade: '6e', theme_id: 'hobbies', num: 2,
    title: 'Les animaux de compagnie & la nature',
    title_en: 'Pets & Nature at Home',
    objective: 'Parler de ses animaux familiers et décrire leurs caractéristiques avec les possessifs.',
    grammar: {
      title: "Les adjectifs possessifs (my, your, his, her, its, our, their)",
      rule: "L'adjectif possessif s'accorde avec le possesseur en anglais (his = le sien à lui, her = le sien à elle, its = pour un objet/animal).",
      example_en: "Emma loves her little rabbit and Tom plays with his dog.",
      example_fr: "Emma adore son petit lapin et Tom joue avec son chien.",
      tip: "Retenez : 'his' fait référence à un garçon, 'her' à une fille.",
      level_focus: "Adjectifs possessifs, verbe LIKE / LOVE + nom singulier ou pluriel."
    },
    vocab: [
      ["puppy", "/ˈpʌpi/", "Noun", "le chiot", "The golden puppy wags its tail.", "Le chiot doré remue la queue."],
      ["kitten", "/ˈkɪtn/", "Noun", "le chaton", "The black kitten plays with wool.", "Le chaton noir joue avec de la laine."],
      ["rabbit", "/ˈræbɪt/", "Noun", "le lapin", "The rabbit eats fresh green grass.", "Le lapin mange de l'herbe verte fraîche."],
      ["hamster", "/ˈhæmstər/", "Noun", "le hamster", "My hamster runs in its wheel all night.", "Mon hamster court dans sa roue toute la nuit."],
      ["parrot", "/ˈpærət/", "Noun", "le perroquet", "The colorful parrot can repeat hello.", "Le perroquet coloré sait répéter bonjour."],
      ["goldfish", "/ˈɡoʊldfɪʃ/", "Noun", "le poisson rouge", "A tiny goldfish swims in the bowl.", "Un minuscule poisson rouge nage dans le bocal."],
      ["fur", "/fɜːr/", "Noun", "la fourrure / le pelage", "The cat has very soft white fur.", "Le chat a un pelage blanc très doux."],
      ["paw", "/pɔː/", "Noun", "la patte (d'animal)", "The dog gives me its friendly paw.", "Le chien me donne sa patte amicale."],
      ["feed", "/fiːd/", "Verb", "nourrir / donner à manger", "I feed my guinea pig every morning.", "Je nourris mon cochon d'Inde chaque matin."],
      ["cage", "/keɪdʒ/", "Noun", "la cage", "Clean the bird cage on Saturday.", "Nettoie la cage de l'oiseau le samedi."]
    ],
    dialogue: {
      title: "Quel animal as-tu ?", setting: "Deux camarades parlent de leurs animaux de compagnie.",
      lines: [
        ["Zoe", "Have you got a pet at home, Ben?", "As-tu un animal de compagnie chez toi, Ben ?"],
        ["Ben", "Yes, I have got a playful puppy. His name is Barnaby.", "Oui, j'ai un chiot joueur. Son nom est Barnaby."],
        ["Zoe", "He is adorable! I have got two little goldfish.", "Il est adorable ! J'ai deux petits poissons rouges."],
        ["Ben", "Goldfish are very calm and easy to feed.", "Les poissons rouges sont très calmes et faciles à nourrir."]
      ]
    },
    dictation: { prompt: "My puppy has soft fur and four paws.", fr: "Mon chiot a un pelage doux et quatre pattes." },
    quiz: [
      { q: "Comment dit-on 'un chiot' en anglais ?", opts: ["A kitten", "A puppy", "A bunny", "A parrot"], a: 1, exp: "'Puppy' désigne un jeune chiot." },
      { q: "Quel adjectif possessif utilise-t-on pour parler du chien d'un garçon ?", opts: ["Her dog", "His dog", "Their dog", "Its dog"], a: 1, exp: "'His' s'utilise quand le possesseur est masculin." },
      { q: "Que signifie le verbe 'to feed' ?", opts: ["Promener", "Brosser", "Nourrir", "Laver"], a: 2, exp: "'To feed' signifie donner à manger, nourrir." }
    ]
  },
  {
    grade: '6e', theme_id: 'hobbies', num: 3,
    title: 'Le cinéma & les dessins animés',
    title_en: 'Cinema & Animated Films',
    objective: 'Exprimer ses préférences culturelles sur les films et personnages préférés.',
    grammar: {
      title: "Exprimer ses goûts avec LIKE, LOVE, HATE + base en -ING",
      rule: "Après les verbes d'appréciation (like, love, prefer, hate), le verbe suivant prend souvent la terminaison -ING.",
      example_en: "I love watching funny cartoons on Saturday morning.",
      example_fr: "J'adore regarder des dessins animés amusants le samedi matin.",
      tip: "I like watching / I love reading / I hate waiting.",
      level_focus: "Verbes de goût + V-ing, adjectifs de sentiment (funny, scary, exciting)."
    },
    vocab: [
      ["cartoon", "/kɑːrˈtuːn/", "Noun", "le dessin animé", "We laugh when we watch this cartoon.", "Nous rions en regardant ce dessin animé."],
      ["character", "/ˈkærəktər/", "Noun", "le personnage de fiction", "Who is your favorite movie character?", "Quel est ton personnage de film préféré ?"],
      ["superhero", "/ˈsuːpərhɪəroʊ/", "Noun", "le super-héros", "The superhero flies over the city.", "Le super-héros vole au-dessus de la ville."],
      ["popcorn", "/ˈpɒpkɔːrn/", "Noun", "le pop-corn", "We share a large bucket of sweet popcorn.", "Nous partageons un grand pot de pop-corn sucré."],
      ["screen", "/skriːn/", "Noun", "l'écran", "The movie screen is huge and bright.", "L'écran de cinéma est immense et lumineux."],
      ["ticket", "/ˈtɪkɪt/", "Noun", "le billet de cinéma", "Buy two cinema tickets online.", "Achète deux billets de cinéma en ligne."],
      ["funny", "/ˈfʌni/", "Adjective", "drôle / amusant", "This animated movie is very funny.", "Ce film d'animation est très drôle."],
      ["scary", "/ˈskɛəri/", "Adjective", "effrayant / qui fait peur", "I don't like scary monster films.", "Je n'aime pas les films de monstres effrayants."],
      ["watch", "/wɒtʃ/", "Verb", "regarder", "We watch a family adventure film.", "Nous regardons un film d'aventure familial."],
      ["villain", "/ˈvɪlən/", "Noun", "le méchant / l'antagoniste", "The villain has a secret plan.", "Le méchant a un plan secret."]
    ],
    dialogue: {
      title: "Séance de cinéma du samedi", setting: "Léa et Hugo choisissent un film au cinéma.",
      lines: [
        ["Hugo", "Do you want to watch the new superhero cartoon, Léa?", "Veux-tu voir le nouveau dessin animé de super-héros, Léa ?"],
        ["Léa", "Yes! I love animated films, they are so funny.", "Oui ! J'adore les films d'animation, ils sont si drôles."],
        ["Hugo", "Let's buy sweet popcorn and find our seats.", "Achetons du pop-corn sucré et trouvons nos places."],
        ["Léa", "Great idea! The lights are going down.", "Super idée ! Les lumières s'éteignent."]
      ]
    },
    dictation: { prompt: "I love watching cartoons with my friends.", fr: "J'adore regarder des dessins animés avec mes amis." },
    quiz: [
      { q: "Quelle forme verbale suit généralement 'I love' pour exprimer une activité ?", opts: ["I love watch", "I love watching", "I love watched", "I love watches"], a: 1, exp: "Après love/like, le verbe prend la marque -ing (I love watching)." },
      { q: "Comment qualifie-t-on un film drôle ?", opts: ["Scary", "Funny", "Sad", "Boring"], a: 1, exp: "'Funny' signifie drôle ou amusant." },
      { q: "Que signifie 'character' dans un film ?", opts: ["Le caractère", "Le personnage", "L'affiche", "La musique"], a: 1, exp: "'Character' désigne le personnage d'une histoire ou d'un film." }
    ]
  },
  {
    grade: '6e', theme_id: 'sport', num: 2,
    title: "Les jeux de cour & l'athlétisme",
    title_en: 'Playground Games & Athletics',
    objective: 'Décrire les jeux actifs de récréation et les mouvements sportifs avec CAN.',
    grammar: {
      title: "Exprimer la capacité physique avec CAN / CAN'T",
      rule: "Pour dire ce que l'on sait ou peut faire physiquement, on utilise 'can' suivi de la base verbale.",
      example_en: "I can jump high and she can run very fast.",
      example_fr: "Je peux sauter haut et elle sait courir très vite.",
      tip: "À la négation : cannot ou can't (She can't swim yet).",
      level_focus: "Modal CAN de capacité, adverbes de manière simples (fast, high, well)."
    },
    vocab: [
      ["running", "/ˈrʌnɪŋ/", "Noun", "la course à pied", "Running warms up your muscles.", "La course échauffe tes muscles."],
      ["jumping", "/ˈdʒʌmpɪŋ/", "Noun", "le saut", "Jumping over hurdles requires practice.", "Sauter des haies demande de l'entraînement."],
      ["skipping rope", "/ˈskɪpɪŋ roʊp/", "Noun", "la corde à sauter", "Girls and boys skip rope at break time.", "Filles et garçons sautent à la corde à la récré."],
      ["tag", "/tæɡ/", "Noun", "le jeu du chat / touche-touche", "Let's play tag in the playground!", "Jouons à chat dans la cour de récréation !"],
      ["catch", "/kætʃ/", "Verb", "attraper", "Can you catch the red ball?", "Peux-tu attraper la balle rouge ?"],
      ["throw", "/θroʊ/", "Verb", "lancer / jeter", "Throw the ball to your teammate.", "Lance la balle à ton coéquipier."],
      ["fast", "/fɑːst/", "Adverb", "vite / rapidement", "He can run faster than everyone.", "Il peut courir plus vite que tout le monde."],
      ["hopscotch", "/ˈhɒpskɒtʃ/", "Noun", "la marelle", "Draw a hopscotch grid with white chalk.", "Dessine une grille de marelle avec de la craie blanche."],
      ["whistle", "/ˈwɪsl/", "Noun", "le sifflet", "The sports teacher blows his whistle.", "Le professeur de sport donne un coup de sifflet."],
      ["sneakers", "/ˈsniːkərz/", "Noun", "les baskets / chaussures de sport", "Wear comfortable sneakers for PE.", "Porte des baskets confortables pour l'EPS."]
    ],
    dialogue: {
      title: "La récréation sportive", setting: "Max et Julie jouent dans la cour du collège.",
      lines: [
        ["Max", "Hey Julie, can you run as fast as that runner?", "Hé Julie, peux-tu courir aussi vite que ce coureur ?"],
        ["Julie", "Yes, I can! And I am also good at skipping rope.", "Oui, je peux ! Et je suis aussi douée pour sauter à la corde."],
        ["Max", "Let's play tag before the whistle blows.", "Jouons à chat avant que le sifflet ne retentisse."],
        ["Julie", "You're it! Catch me if you can!", "C'est toi le chat ! Attrape-moi si tu peux !"]
      ]
    },
    dictation: { prompt: "He can run fast and jump high.", fr: "Il peut courir vite et sauter haut." },
    quiz: [
      { q: "Comment exprime-t-on 'Je sais nager' en anglais ?", opts: ["I can swim.", "I know swim.", "I do swim.", "I am swim."], a: 0, exp: "'Can' exprime la capacité acquise ou physique." },
      { q: "Quel jeu consiste à courir après les autres en criant 'You're it' ?", opts: ["Hopscotch", "Tag", "Skipping", "Chess"], a: 1, exp: "'Tag' est le jeu du loup ou touche-touche." },
      { q: "Que signifie 'sneakers' ?", opts: ["Des chaussettes", "Des baskets", "Des casquettes", "Des ballons"], a: 1, exp: "'Sneakers' désigne les chaussures de sport ou baskets." }
    ]
  },
  {
    grade: '6e', theme_id: 'sport', num: 3,
    title: 'Le vélo & les balades de plein air',
    title_en: 'Cycling & Outdoor Rides',
    objective: 'Parler de sécurité routière et d\'activités de plein air à vélo.',
    grammar: {
      title: "L'obligation avec MUST et la sécurité",
      rule: "On utilise 'MUST' pour exprimer une règle absolue ou une obligation de sécurité.",
      example_en: "You must wear a helmet when cycling on the road.",
      example_fr: "Tu dois porter un casque quand tu fais du vélo sur la route.",
      tip: "À la négation : You mustn't (interdiction stricte).",
      level_focus: "Modal MUST d'obligation, vocabulaire de la sécurité routière."
    },
    vocab: [
      ["bicycle", "/ˈbaɪsɪkl/", "Noun", "la bicyclette / le vélo", "My bicycle has two shiny wheels.", "Ma bicyclette a deux roues brillantes."],
      ["helmet", "/ˈhɛlmɪt/", "Noun", "le casque de protection", "Fasten your helmet securely.", "Attache ton casque solidement."],
      ["pedal", "/ˈpɛdl/", "Noun", "la pédale", "Push hard on the pedals up the hill.", "Appuie fort sur les pédales en montant la côte."],
      ["chain", "/tʃeɪn/", "Noun", "la chaîne de vélo", "Oil the bike chain regularly.", "Huile la chaîne de vélo régulièrement."],
      ["bell", "/bɛl/", "Noun", "la sonnette de vélo", "Ring your bell to warn pedestrians.", "Sonne pour avertir les piétons."],
      ["brakes", "/breɪks/", "Noun", "les freins", "Check that your brakes work perfectly.", "Vérifie que tes freins fonctionnent parfaitement."],
      ["cycle lane", "/ˈsaɪkl leɪn/", "Noun", "la piste cyclable", "Stay safely inside the cycle lane.", "Reste en sécurité sur la piste cyclable."],
      ["pump", "/pʌmp/", "Noun", "la pompe à vélo", "Inflate the tires with a hand pump.", "Gonfle les pneus avec une pompe à main."],
      ["ride", "/raɪd/", "Verb", "rouler / faire du vélo", "We ride our bikes in the countryside.", "Nous faisons du vélo à la campagne."],
      ["tyre", "/ˈtaɪər/", "Noun", "le pneu", "My front tyre has enough air.", "Mon pneu avant a assez d'air."]
    ],
    dialogue: {
      title: "Balade à vélo le dimanche", setting: "Arthur et sa sœur préparent leurs vélos.",
      lines: [
        ["Arthur", "Put on your helmet, Lily. We are going to the forest.", "Mets ton casque, Lily. Nous allons dans la forêt."],
        ["Lily", "Is my bike ready? I pumped the tires yesterday.", "Mon vélo est-il prêt ? J'ai gonflé les pneus hier."],
        ["Arthur", "Test your brakes and ring your bell.", "Teste tes freins et fais sonner ta sonnette."],
        ["Lily", "All good! Let's ride along the cycle lane.", "Tout est bon ! Roulons sur la piste cyclable."]
      ]
    },
    dictation: { prompt: "You must wear a helmet when you ride a bike.", fr: "Tu dois porter un casque quand tu fais du vélo." },
    quiz: [
      { q: "Quel mot désigne le casque de sécurité ?", opts: ["A cap", "A helmet", "A scarf", "A bonnet"], a: 1, exp: "'Helmet' désigne le casque de protection." },
      { q: "Quel modal exprime une règle de sécurité impérative ?", opts: ["Must", "Might", "Could", "May"], a: 0, exp: "'Must' exprime l'obligation impérative." },
      { q: "Que signifie 'cycle lane' ?", opts: ["Un rond-point", "Une piste cyclable", "Un chemin de fer", "Une station-service"], a: 1, exp: "'Cycle lane' est la piste cyclable." }
    ]
  },
  {
    grade: '6e', theme_id: 'music', num: 2,
    title: 'Chanter en chorale & chansons anglaises',
    title_en: 'Choir Singing & Melodies',
    objective: 'Parler de musique vocale, de chant et des paroles de chansons.',
    grammar: {
      title: "Le présent continu (BE + V-ing) pour une action en cours",
      rule: "On utilise BE au présent + le verbe avec -ing pour décrire une action qui se déroule au moment où l'on parle.",
      example_en: "Listen! The school choir is singing a traditional Scottish song.",
      example_fr: "Écoute ! La chorale du collège est en train de chanter une chanson traditionnelle écossaise.",
      tip: "Pensez aux deux morceaux du verbe : l'auxiliaire BE (am/is/are) ET la terminaison -ing.",
      level_focus: "Présent be + -ing, verbes d'écoute et de performance vocale."
    },
    vocab: [
      ["choir", "/ˈkwaɪər/", "Noun", "la chorale", "Thirty students sing in the choir.", "Trente élèves chantent dans la chorale."],
      ["singer", "/ˈsɪŋər/", "Noun", "le chanteur / la chanteuse", "The lead singer has a clear voice.", "Le chanteur principal a une voix claire."],
      ["lyrics", "/ˈlɪrɪks/", "Noun", "les paroles d'une chanson", "I learn the English lyrics by heart.", "J'apprends les paroles anglaises par cœur."],
      ["voice", "/vɔɪs/", "Noun", "la voix", "Warm up your voice before the concert.", "Échauffe ta voix avant le concert."],
      ["stage", "/steɪdʒ/", "Noun", "la scène", "The choir stands proudly on the stage.", "La chorale se tient fièrement sur scène."],
      ["microphone", "/ˈmaɪkrəfoʊn/", "Noun", "le micro", "Speak directly into the microphone.", "Parle directement dans le micro."],
      ["melody", "/ˈmɛlədi/", "Noun", "la mélodie", "This gentle melody stays in my head.", "Cette douce mélodie me reste en tête."],
      ["rehearse", "/rɪˈhɜːrs/", "Verb", "répéter (un spectacle)", "We rehearse every Tuesday afternoon.", "Nous répétons tous les mardis après-midi."],
      ["audience", "/ˈɔːdiəns/", "Noun", "le public / les spectateurs", "The audience claps enthusiastically.", "Le public applaudit chaleureusement."],
      ["applause", "/əˈplɔːz/", "Noun", "les applaudissements", "Listen to the loud applause at the end.", "Écoute les vifs applaudissements à la fin."]
    ],
    dialogue: {
      title: "Répétition de la chorale", setting: "L'enseignant guide les élèves de chorale.",
      lines: [
        ["Teacher", "Stand up straight, please. Are you ready to sing?", "Tenez-vous droits, s'il vous plaît. Êtes-vous prêts à chanter ?"],
        ["Pupils", "Yes, we are rehearsing the chorus now.", "Oui, nous répétons le refrain maintenant."],
        ["Teacher", "Listen carefully to the melody and articulate your words.", "Écoutez attentivement la mélodie et articulez vos mots."],
        ["Pupils", "We are singing with all our hearts!", "Nous chantons de tout notre cœur !"]
      ]
    },
    dictation: { prompt: "The children are singing a cheerful song.", fr: "Les enfants sont en train de chanter une chanson joyeuse." },
    quiz: [
      { q: "Comment se prononce le mot 'choir' en anglais ?", opts: ["/tʃɔɪər/", "/kwaɪər/", "/ʃwaɪər/", "/kɔɪər/"], a: 1, exp: "'Choir' se prononce /kwaɪər/ avec un son 'k' initial." },
      { q: "Que désigne le mot 'lyrics' ?", opts: ["Les instruments", "Les paroles", "Les partitions", "Les billets"], a: 1, exp: "'Lyrics' désigne les paroles des chansons." },
      { q: "Quelle phrase est au présent continu ?", opts: ["She sings well.", "She is singing now.", "She sang yesterday.", "She will sing."], a: 1, exp: "'is singing' est la forme be + -ing au présent." }
    ]
  },
  {
    grade: '6e', theme_id: 'music', num: 3,
    title: 'Écouter de la musique & les rythmes',
    title_en: 'Listening to Music & Beats',
    objective: 'Parler de ses morceaux préférés, du tempo et du matériel audio.',
    grammar: {
      title: "Les adverbes de fréquence (always, usually, often, sometimes, never)",
      rule: "L'adverbe de fréquence se place généralement AVANT le verbe ordinaire, mais APRÈS l'auxiliaire BE.",
      example_en: "I often listen to pop songs and I am always happy when dancing.",
      example_fr: "J'écoute souvent des chansons pop et je suis toujours joyeux quand je danse.",
      tip: "He NEVER plays loud music. / He IS ALWAYS on time.",
      level_focus: "Adverbes de fréquence et position syntaxique."
    },
    vocab: [
      ["headphones", "/ˈhɛdfoʊnz/", "Noun", "le casque audio", "Put on your headphones to listen quietly.", "Mets ton casque pour écouter calmement."],
      ["earphones", "/ˈɪərfəʊnz/", "Noun", "les écouteurs", "Keep your earphones in their small pouch.", "Garde tes écouteurs dans leur petite pochette."],
      ["volume", "/ˈvɒljuːm/", "Noun", "le volume sonore", "Turn down the volume, it is too loud.", "Baisse le volume, c'est trop fort."],
      ["beat", "/biːt/", "Noun", "le rythme / le tempo", "Clap your hands to the lively beat.", "Tape dans tes mains au rythme entraînant."],
      ["dance", "/dɑːns/", "Verb", "danser", "Friends dance together to the song.", "Les amis dansent ensemble sur la chanson."],
      ["track", "/træk/", "Noun", "la piste / le morceau", "Track number four is my favorite.", "La piste numéro quatre est ma préférée."],
      ["playlist", "/ˈpleɪlɪst/", "Noun", "la liste de lecture", "Create a relaxing playlist for study.", "Crée une liste de lecture relaxante pour étudier."],
      ["loud", "/laʊd/", "Adjective", "fort / bruyant", "The drums make a loud sound.", "La batterie produit un son puissant."],
      ["quiet", "/ˈkwaɪət/", "Adjective", "calme / doux", "A quiet acoustic guitar plays softly.", "Une guitare acoustique douce joue calmement."],
      ["tune", "/tjuːn/", "Noun", "l'air / la mélodie entraînante", "Hum that catchy tune with me.", "Fredonne cet air entraînant avec moi."]
    ],
    dialogue: {
      title: "Partage de playlist", setting: "Deux adolescents découvrent un nouveau morceau.",
      lines: [
        ["Noah", "What are you listening to on your headphones, Mia?", "Qu'écoutes-tu dans ton casque, Mia ?"],
        ["Mia", "I am listening to a new acoustic track. The beat is wonderful.", "J'écoute un nouveau morceau acoustique. Le rythme est magnifique."],
        ["Noah", "Can I listen for a moment?", "Puis-je écouter un instant ?"],
        ["Mia", "Sure, take this earphone. It is very relaxing.", "Bien sûr, prends cet écouteur. C'est très relaxant."]
      ]
    },
    dictation: { prompt: "I usually listen to music with my headphones.", fr: "J'écoute d'habitude de la musique avec mon casque." },
    quiz: [
      { q: "Où se place l'adverbe 'often' dans la phrase ?", opts: ["I listen often to music.", "I often listen to music.", "Often I listen.", "I listen to often music."], a: 1, exp: "L'adverbe de fréquence se place avant le verbe principal (I often listen)." },
      { q: "Comment dit-on 'Baisse le volume' ?", opts: ["Turn up the volume", "Turn down the volume", "Open the volume", "Close the volume"], a: 1, exp: "'Turn down' signifie baisser l'intensité sonore." },
      { q: "Que signifie 'headphones' ?", opts: ["Le micro", "Le casque audio", "La batterie", "La radio"], a: 1, exp: "'Headphones' désigne un casque d'écoute." }
    ]
  },
  {
    grade: '6e', theme_id: 'restaurant', num: 2,
    title: 'Le goûter & le salon de thé anglais',
    title_en: 'Afternoon Tea & Bakeries',
    objective: 'Commander un en-cas sucré et une boisson chaude avec WOULD LIKE.',
    grammar: {
      title: "Exprimer un souhait poli avec 'I WOULD LIKE'",
      rule: "Pour commander poliment en anglais, on utilise 'I would like' (ou sa contraction 'I'd like') au lieu de 'I want'.",
      example_en: "I would like a cup of tea with milk and two biscuits, please.",
      example_fr: "J'aimerais une tasse de thé avec du lait et deux biscuits, s'il vous plaît.",
      tip: "Retenez la contraction : 'I'd like' est courante et très polie.",
      level_focus: "Formule de politesse 'would like', articles indéfinis a/an."
    },
    vocab: [
      ["cup of tea", "/kʌp əv tiː/", "Noun", "une tasse de thé", "Would you like a cup of tea?", "Aimeriez-vous une tasse de thé ?"],
      ["scone", "/skɒn/", "Noun", "le scone (petit gâteau britannique)", "A warm scone with clotted cream.", "Un scone chaud avec de la crème épaisse."],
      ["jam", "/dʒæm/", "Noun", "la confiture", "Strawberry jam is sweet and red.", "La confiture de fraises est douce et rouge."],
      ["cake", "/keɪk/", "Noun", "le gâteau", "A delicious slice of chocolate cake.", "Une délicieuse part de gâteau au chocolat."],
      ["biscuit", "/ˈbɪskɪt/", "Noun", "le biscuit", "Dip your biscuit into the hot tea.", "Trempe ton biscuit dans le thé chaud."],
      ["sugar", "/ˈʃʊɡər/", "Noun", "le sucre", "Do you take sugar in your tea?", "Prenez-vous du sucre dans votre thé ?"],
      ["teapot", "/ˈtiːpɒt/", "Noun", "la théière", "Pour fresh water from the porcelain teapot.", "Verse de l'eau fraîche depuis la théière en porcelaine."],
      ["napkin", "/ˈnæpkɪn/", "Noun", "la serviette de table", "Wipe your mouth with a paper napkin.", "Essuie ta bouche avec une serviette en papier."],
      ["waiter", "/ˈweɪtər/", "Noun", "le serveur", "The waiter brings the dessert tray.", "Le serveur apporte le plateau de desserts."],
      ["delicious", "/dɪˈlɪʃəs/", "Adjective", "délicieux / savoureux", "These fresh pastries are delicious.", "Ces pâtisseries fraîches sont délicieuses."]
    ],
    dialogue: {
      title: "Au salon de thé traditionnel", setting: "Lola commande son goûter dans un salon de thé à Bath.",
      lines: [
        ["Waitress", "Good afternoon! What would you like today?", "Bonjour ! Que désireriez-vous aujourd'hui ?"],
        ["Lola", "I'd like a scone with strawberry jam and a cup of tea, please.", "J'aimerais un scone avec de la confiture et une tasse de thé, s'il vous plaît."],
        ["Waitress", "Would you like cold milk with your tea?", "Aimeriez-vous du lait froid avec votre thé ?"],
        ["Lola", "Yes please, just a drop of milk. Thank you!", "Oui s'il vous plaît, juste une goutte. Merci !"]
      ]
    },
    dictation: { prompt: "I would like a warm scone and a cup of tea.", fr: "J'aimerais un scone chaud et une tasse de thé." },
    quiz: [
      { q: "Quelle tournure est la plus polie pour commander ?", opts: ["I want a scone.", "I would like a scone, please.", "Give me a scone.", "A scone for me now."], a: 1, exp: "'I would like..., please' est la tournure polie recommandée." },
      { q: "Qu'est-ce qu'un 'scone' ?", opts: ["Une boisson gazeuse", "Une pâtisserie britannique traditionnelle", "Un sandwich salé", "Un fruit rouge"], a: 1, exp: "Le scone est une spécialité pâtissière britannique servie avec le thé." },
      { q: "Que signifie 'napkin' ?", opts: ["La cuillère", "La serviette de table", "L'assiette", "La tasse"], a: 1, exp: "'Napkin' est la serviette de table." }
    ]
  },
  {
    grade: '6e', theme_id: 'restaurant', num: 3,
    title: 'Le pique-nique au parc le week-end',
    title_en: 'Picnic in the Park',
    objective: 'Planifier et décrire un repas champêtre avec SOME et ANY.',
    grammar: {
      title: "Les quantifieurs SOME & ANY",
      rule: "On utilise généralement 'SOME' dans les phrases affirmatives (We have some apples), et 'ANY' dans les phrases négatives ou interrogatives (Do we have any juice? We don't have any bread).",
      example_en: "There are some sandwiches in the basket, but there aren't any crisps left.",
      example_fr: "Il y a des sandwichs dans le panier, mais il ne reste plus de chips.",
      tip: "Attention : dans une offre polie, on utilise SOME : Would you like SOME juice?",
      level_focus: "Quantifieurs some / any, noms dénombrables et indénombrables."
    },
    vocab: [
      ["picnic basket", "/ˈpɪknɪk ˈbɑːskɪt/", "Noun", "le panier de pique-nique", "Pack the picnic basket with sandwiches.", "Remplis le panier de pique-nique avec des sandwichs."],
      ["blanket", "/ˈblæŋkɪt/", "Noun", "la couverture / la nappe", "Spread the red blanket on the green grass.", "Étale la couverture rouge sur l'herbe verte."],
      ["sandwich", "/ˈsænwɪtʃ/", "Noun", "le sandwich", "A cheese and cucumber sandwich.", "Un sandwich au fromage et au concombre."],
      ["crisps", "/krɪsps/", "Noun", "les chips", "Crunchy potato crisps in a blue bag.", "Des chips de pomme de terre croustillantes."],
      ["apple juice", "/ˈæpl dʒuːs/", "Noun", "le jus de pomme", "Pour some cold apple juice into cups.", "Verse du jus de pomme frais dans les verres."],
      ["grapes", "/ɡreɪps/", "Noun", "le raisin", "Wash these sweet green grapes.", "Lave ce raisin vert bien sucré."],
      ["plastic cup", "/ˈplæstɪk kʌp/", "Noun", "le gobelet", "Take reusable cups instead of plastic cups.", "Prends des gobelets réutilisables."],
      ["sunny", "/ˈsʌni/", "Adjective", "ensoleillé", "It is a warm and sunny afternoon.", "C'est un après-midi chaud et ensoleillé."],
      ["pack", "/pæk/", "Verb", "emballer / préparer", "Pack your bag before leaving.", "Prépare ton sac avant de partir."],
      ["tidy up", "/ˈtaɪdi ʌp/", "Phrasal verb", "ranger / nettoyer", "Tidy up all rubbish before going home.", "Nettoie tous les déchets avant de rentrer."]
    ],
    dialogue: {
      title: "Repas sur l'herbe à Hyde Park", setting: "Deux amis déballent leur pique-nique à Londres.",
      lines: [
        ["Sam", "The grass is dry. Let's put down the blanket here.", "L'herbe est sèche. Posons la couverture ici."],
        ["Chloe", "Do we have any drinks in the basket?", "Avons-nous des boissons dans le panier ?"],
        ["Sam", "Yes, there is some orange juice and cold water.", "Oui, il y a du jus d'orange et de l'eau fraîche."],
        ["Chloe", "Wonderful! Would you like a tomato sandwich?", "Merveilleux ! Aimeriez-vous un sandwich à la tomate ?"]
      ]
    },
    dictation: { prompt: "We have some sandwiches and fresh grapes.", fr: "Nous avons des sandwichs et du raisin frais." },
    quiz: [
      { q: "Quel mot complète la négation : 'We don't have ... crisps' ?", opts: ["some", "any", "a", "an"], a: 1, exp: "Dans une phrase négative, on emploie 'any'." },
      { q: "Comment dit-on 'chips' en anglais britannique ?", opts: ["Chips", "Crisps", "Fries", "Biscuits"], a: 1, exp: "Au Royaume-Uni, 'crisps' = chips, tandis que 'chips' = frites." },
      { q: "Que signifie 'tidy up' ?", opts: ["Manger vite", "Ranger / nettoyer", "Courir", "Dormir"], a: 1, exp: "'Tidy up' signifie ranger ou remettre en ordre." }
    ]
  },
  {
    grade: '6e', theme_id: 'food', num: 2,
    title: 'Les boissons & les goûts au quotidien',
    title_en: 'Daily Drinks & Simple Flavors',
    objective: 'Exprimer ses préférences de goûts (sucré, salé, acide) et commander des boissons.',
    grammar: {
      title: "Les questions fermées avec DO / DOES",
      rule: "Pour poser une question au présent simple avec un verbe ordinaire, on utilise 'Do you...?' ou 'Does he/she...?'.",
      example_en: "Do you like hot chocolate with marshmallows?",
      example_fr: "Aimes-tu le chocolat chaud avec des guimauves ?",
      tip: "Répondez par des réponses brèves : Yes, I do. / No, I don't.",
      level_focus: "Auxiliaire DO/DOES au présent simple, adjectifs gustatifs."
    },
    vocab: [
      ["water", "/ˈwɔːtər/", "Noun", "l'eau", "Drink a large glass of fresh water.", "Bois un grand verre d'eau fraîche."],
      ["milk", "/mɪlk/", "Noun", "le lait", "Cold milk is healthy for bones.", "Le lait froid est bon pour les os."],
      ["hot chocolate", "/hɒt ˈtʃɒklət/", "Noun", "le chocolat chaud", "Hot chocolate warms us up in winter.", "Le chocolat chaud nous réchauffe en hiver."],
      ["lemonade", "/ˌlɛməˈneɪd/", "Noun", "la limonade", "Fizzy lemonade with ice cubes.", "De la limonade pétillante avec des glaçons."],
      ["sweet", "/swiːt/", "Adjective", "sucré / doux", "Ripe strawberries are very sweet.", "Les fraises mûres sont très sucrées."],
      ["salty", "/ˈsɔːlti/", "Adjective", "salé", "These roasted nuts are slightly salty.", "Ces noix grillées sont légèrement salées."],
      ["sour", "/ˈsaʊər/", "Adjective", "acide / aigre", "Lemons have a sharp, sour taste.", "Les citrons ont un goût vif et acide."],
      ["bitter", "/ˈbɪtər/", "Adjective", "amer", "Dark coffee tastes very bitter.", "Le café noir a un goût très amer."],
      ["thirsty", "/ˈθɜːrsti/", "Adjective", "avoir soif / assoiffé", "After gym class, I am very thirsty.", "Après le cours de gym, j'ai très soif."],
      ["glass", "/ɡlɑːs/", "Noun", "le verre", "Fill the glass with water, please.", "Remplis le verre d'eau, s'il te plaît."]
    ],
    dialogue: {
      title: "Après le sport", setting: "Tom et Lily ont soif après leur entraînement de basket.",
      lines: [
        ["Tom", "I am so thirsty! Do you want some cold lemonade?", "J'ai tellement soif ! Veux-tu de la limonade fraîche ?"],
        ["Lily", "No thanks, lemonade is too sweet. I prefer water.", "Non merci, la limonade est trop sucrée. Je préfère de l'eau."],
        ["Tom", "Here is a clean glass of tap water for you.", "Voici un verre d'eau du robinet propre pour toi."],
        ["Lily", "Thank you, that is refreshing!", "Merci, c'est très rafraîchissant !"]
      ]
    },
    dictation: { prompt: "Do you like sweet lemonade or fresh water?", fr: "Aimes-tu la limonade sucrée ou l'eau fraîche ?" },
    quiz: [
      { q: "Comment demande-t-on 'Aimes-tu le chocolat chaud ?' ?", opts: ["Like you hot chocolate?", "Do you like hot chocolate?", "Are you like hot chocolate?", "Have you hot chocolate?"], a: 1, exp: "On utilise l'auxiliaire 'Do' pour interroger au présent : 'Do you like...?'" },
      { q: "Quel adjectif qualifie le goût du citron ?", opts: ["Sweet", "Sour", "Salty", "Hot"], a: 1, exp: "'Sour' signifie acide ou aigre." },
      { q: "Comment dit-on 'J'ai soif' ?", opts: ["I have hunger.", "I am thirsty.", "I am drink.", "I have thirsty."], a: 1, exp: "En anglais, on utilise l'auxiliaire BE : 'I am thirsty'." }
    ]
  },
  {
    grade: '6e', theme_id: 'food', num: 3,
    title: 'Préparer un en-cas simple & ingrédients',
    title_en: 'Making a Simple Snack & Ingredients',
    objective: 'Suivre une recette facile et utiliser les connecteurs temporels (first, then, next, finally).',
    grammar: {
      title: "Les connecteurs d'ordre chronologique (First, Then, Next, Finally)",
      rule: "Pour expliquer les étapes d'une recette ou d'une procédure, on débute chaque phrase par un connecteur suivi de l'impératif.",
      example_en: "First, toast the bread. Then, spread butter. Finally, cut into halves.",
      example_fr: "D'abord, faites griller le pain. Ensuite, étalez le beurre. Enfin, coupez en deux.",
      tip: "L'impératif donne l'ordre direct : Spread, cut, add, mix.",
      level_focus: "Connecteurs séquentiels et verbes d'action culinaires."
    },
    vocab: [
      ["bread", "/brɛd/", "Noun", "le pain", "Cut two slices of wholemeal bread.", "Coupe deux tranches de pain complet."],
      ["butter", "/ˈbʌtər/", "Noun", "le beurre", "Spread soft butter on the toast.", "Étale du beurre mou sur le toast."],
      ["cheese", "/tʃiːz/", "Noun", "le fromage", "Cheddar cheese melts very well.", "Le fromage cheddar fond très bien."],
      ["tomato", "/təˈmɑːtoʊ/", "Noun", "la tomate", "Slice one ripe red tomato.", "Tranche une tomate rouge bien mûre."],
      ["knife", "/naɪf/", "Noun", "le couteau", "Be careful with the sharp kitchen knife.", "Fais attention avec le couteau de cuisine tranchant."],
      ["plate", "/pleɪt/", "Noun", "l'assiette", "Put the warm sandwich on a plate.", "Mets le sandwich chaud sur une assiette."],
      ["spread", "/sprɛd/", "Verb", "tartiner / étaler", "Spread the jam evenly across the slice.", "Étale la confiture de façon homogène."],
      ["slice", "/slaɪs/", "Verb", "trancher / couper en tranches", "Slice the cucumber into thin rounds.", "Tranche le concombre en rondelles fines."],
      ["toast", "/toʊst/", "Noun", "le pain grillé / toast", "Crunchy golden toast for breakfast.", "Du toast doré et croustillant pour le matin."],
      ["delicious", "/dɪˈlɪʃəs/", "Adjective", "délicieux", "Your homemade snack is delicious!", "Ton en-cas maison est délicieux !"]
    ],
    dialogue: {
      title: "Préparation d'un toast au fromage", setting: "Léo montre à son petit frère comment faire un encas.",
      lines: [
        ["Léo", "First, put a slice of bread into the toaster.", "D'abord, mets une tranche de pain dans le grille-pain."],
        ["Brother", "And then? Do we add the cheddar cheese?", "Et ensuite ? Ajoute-t-on le fromage cheddar ?"],
        ["Léo", "Yes! Next, add two slices of tomato.", "Oui ! Ensuite, ajoute deux tranches de tomate."],
        ["Brother", "Finally, we enjoy our delicious warm snack!", "Enfin, nous savourons notre délicieux en-cas chaud !"]
      ]
    },
    dictation: { prompt: "First, slice the tomato with a small knife.", fr: "D'abord, tranche la tomate avec un petit couteau." },
    quiz: [
      { q: "Quel connecteur utilise-t-on pour la toute dernière étape d'une recette ?", opts: ["First", "Then", "Finally", "Next"], a: 2, exp: "'Finally' introduit la conclusion ou dernière étape." },
      { q: "Que signifie le verbe culinaire 'to spread' ?", opts: ["Couper", "Tartiner / étaler", "Mélanger", "Bouillir"], a: 1, exp: "'To spread' signifie étaler ou tartiner." },
      { q: "Comment s'écrit 'couteau' au singulier en anglais ?", opts: ["Knive", "Knife", "Knifes", "Knives"], a: 1, exp: "Au singulier, le mot s'écrit 'knife' (son pluriel est 'knives')." }
    ]
  },
  {
    grade: '6e', theme_id: 'work', num: 2,
    title: 'Ranger sa chambre & tâches familiales',
    title_en: 'Tidying Up & Family Chores',
    objective: 'Parler de ses responsabilités à la maison et des petites tâches ménagères.',
    grammar: {
      title: "HAVE TO pour exprimer la nécessité",
      rule: "On utilise 'have to' (au singulier 3e personne 'has to') pour exprimer une tâche obligatoire que l'on doit accomplir.",
      example_en: "I have to tidy my bedroom before I play video games.",
      example_fr: "Je dois ranger ma chambre avant de jouer aux jeux vidéo.",
      tip: "À la 3e personne : He HAS TO make his bed every morning.",
      level_focus: "Semi-modal HAVE TO, tâches ménagères du quotidien."
    },
    vocab: [
      ["tidy up", "/ˈtaɪdi ʌp/", "Phrasal verb", "ranger / mettre en ordre", "I tidy up my desk every evening.", "Je range mon bureau tous les soirs."],
      ["make the bed", "/meɪk ðə bɛd/", "Phrase", "faire son lit", "Make your bed before going to school.", "Fais ton lit avant d'aller au collège."],
      ["wash dishes", "/wɒʃ ˈdɪʃɪz/", "Phrase", "laver la vaisselle", "We wash dishes after dinner together.", "Nous lavons la vaisselle après le dîner ensemble."],
      ["rubbish", "/ˈrʌbɪʃ/", "Noun", "les déchets / la poubelle", "Take out the kitchen rubbish bag.", "Sors le sac poubelle de la cuisine."],
      ["dust", "/dʌst/", "Verb", "épousseter / faire la poussière", "Dust the shelves with a soft cloth.", "Fais la poussière sur les étagères."],
      ["sweep the floor", "/swiːp ðə flɔːr/", "Phrase", "balayer le sol", "Sweep the kitchen floor with the broom.", "Balaie le sol de la cuisine avec le balai."],
      ["clean", "/kliːn/", "Verb", "nettoyer", "Clean your shoes with a brush.", "Nettoie tes chaussures avec une brosse."],
      ["help", "/hɛlp/", "Verb", "aider", "Children help their parents at home.", "Les enfants aident leurs parents à la maison."],
      ["chore", "/tʃɔːr/", "Noun", "la corvée / tâche ménagère", "Doing chores teaches responsibility.", "Faire des corvées enseigne la responsabilité."],
      ["cooperative", "/koʊˈɒpərətɪv/", "Adjective", "coopératif / solidaire", "Be cooperative when family works.", "Sois coopératif quand la famille s'active."]
    ],
    dialogue: {
      title: "Avant le week-end", setting: "Une mère et son fils organisent les rangements du samedi matin.",
      lines: [
        ["Mother", "Sam, you have to tidy your room before going to the park.", "Sam, tu dois ranger ta chambre avant d'aller au parc."],
        ["Sam", "I already made my bed and dusted my bookshelf, Mum!", "J'ai déjà fait mon lit et fait la poussière, Maman !"],
        ["Mother", "Good job! Could you also take out the rubbish?", "Beau travail ! Pourrais-tu aussi sortir la poubelle ?"],
        ["Sam", "Sure, I'll do it right now.", "Bien sûr, je le fais tout de suite."]
      ]
    },
    dictation: { prompt: "I have to make my bed every morning.", fr: "Je dois faire mon lit chaque matin." },
    quiz: [
      { q: "Quelle structure exprime l'obligation d'une tâche ?", opts: ["I have to", "I might", "I could", "I wish"], a: 0, exp: "'Have to' exprime une nécessité ou obligation imposée." },
      { q: "Comment dit-on 'faire son lit' en anglais ?", opts: ["Do the bed", "Make the bed", "Create the bed", "Tidy the bed"], a: 1, exp: "La collocation exacte est 'make the bed'." },
      { q: "Que signifie 'rubbish' ?", opts: ["Les livres", "Les ordures / poubelles", "Les habits", "Les repas"], a: 1, exp: "'Rubbish' désigne les déchets ou ordures en anglais britannique." }
    ]
  },
  {
    grade: '6e', theme_id: 'work', num: 3,
    title: 'Le projet de groupe entre camarades',
    title_en: 'Group Work & School Projects',
    objective: 'Collaborer avec ses camarades sur un exposé scolaire en anglais.',
    grammar: {
      title: "Les propositions avec LET'S + base verbale",
      rule: "Pour faire une suggestion au groupe, on utilise 'Let's' (contraction de let us) suivi d'une base verbale.",
      example_en: "Let's work together and design a colorful poster about London.",
      example_fr: "Travaillons ensemble et concevons une affiche colorée sur Londres.",
      tip: "À la forme négative : 'Let's not argue' (Ne nous disputons pas).",
      level_focus: "Formules de suggestion (Let's, Shall we), travail collaboratif."
    },
    vocab: [
      ["teamwork", "/ˈtiːmwɜːrk/", "Noun", "le travail d'équipe", "Good teamwork makes big tasks easier.", "Un bon travail d'équipe facilite les tâches."],
      ["poster", "/ˈpoʊstər/", "Noun", "l'affiche / le poster", "Glue drawings onto the presentation poster.", "Colle les dessins sur l'affiche de présentation."],
      ["presentation", "/ˌprɛznˈteɪʃn/", "Noun", "l'exposé / la présentation", "Our oral presentation lasts ten minutes.", "Notre exposé oral dure dix minutes."],
      ["classmate", "/ˈklɑːsmeɪt/", "Noun", "le camarade de classe", "Share pencils with your classmate.", "Partage tes crayons avec ton camarade."],
      ["idea", "/aɪˈdɪə/", "Noun", "l'idée", "That is an excellent idea for our project!", "C'est une excellente idée pour notre projet !"],
      ["draw", "/drɔː/", "Verb", "dessiner", "Draw a map of the British Isles.", "Dessine une carte des îles britanniques."],
      ["write", "/raɪt/", "Verb", "écrire", "Write the title in bold capital letters.", "Écris le titre en lettres majuscules grasses."],
      ["explain", "/ɪkˈspleɪn/", "Verb", "expliquer", "Explain the historical facts clearly.", "Explique les faits historiques clairement."],
      ["topic", "/ˈtɒpɪk/", "Noun", "le sujet / thème", "Our science topic is space exploration.", "Notre sujet de sciences est l'exploration spatiale."],
      ["together", "/təˈɡɛðər/", "Adverb", "ensemble", "We work happily together in the library.", "Nous travaillons joyeusement ensemble à la bibliothèque."]
    ],
    dialogue: {
      title: "Préparation d'un poster d'anglais", setting: "Emma et Lucas préparent une affiche sur la faune britannique.",
      lines: [
        ["Emma", "Let's choose our topic. How about British wildlife?", "Choisissons notre sujet. Que dis-tu de la faune britannique ?"],
        ["Lucas", "Great idea! I can draw the red fox and the hedgehog.", "Super idée ! Je peux dessiner le renard roux et le hérisson."],
        ["Emma", "And I will write the English captions under each picture.", "Et j'écrirai les légendes en anglais sous chaque image."],
        ["Lucas", "Let's present our poster to the class tomorrow!", "Présentons notre poster à la classe demain !"]
      ]
    },
    dictation: { prompt: "Let's work together on our English project.", fr: "Travaillons ensemble sur notre projet d'anglais." },
    quiz: [
      { q: "Quelle structure permet de faire une proposition au groupe ?", opts: ["Let's", "Do we", "Must you", "Shall not"], a: 0, exp: "'Let's' suivi d'une base verbale exprime une proposition conviviale." },
      { q: "Que signifie 'classmate' ?", opts: ["Le professeur", "Le camarade de classe", "Le proviseur", "L'infirmière"], a: 1, exp: "'Classmate' est le camarade de classe." },
      { q: "Comment dit-on 'le travail d'équipe' ?", opts: ["Homework", "Teamwork", "Paperwork", "Network"], a: 1, exp: "'Teamwork' signifie le travail en équipe." }
    ]
  },
  {
    grade: '6e', theme_id: 'school_social', num: 2,
    title: "Le médecin, l'infirmière & les secours",
    title_en: 'Healthcare & Emergency Services',
    objective: 'Identifier le personnel de santé et décrire un petit bobo ou une urgence.',
    grammar: {
      title: "Exprimer une douleur avec HAVE GOT A PAIN / HURT",
      rule: "Pour exprimer un souci physique, on utilise 'I have got a headache/stomach ache' ou 'My leg hurts'.",
      example_en: "The doctor examines the patient whose knee hurts after sports.",
      example_fr: "Le médecin examine le patient dont le genou fait mal après le sport.",
      tip: "Pensez au suffixe -ache : headache (mal de tête), toothache (mal de dents).",
      level_focus: "Expressions de la santé, verbe hurt, noms de métiers médicaux."
    },
    vocab: [
      ["doctor", "/ˈdɒktər/", "Noun", "le médecin", "The doctor listens with a stethoscope.", "Le médecin écoute avec un stéthoscope."],
      ["nurse", "/nɜːrs/", "Noun", "l'infirmier / l'infirmière", "The school nurse cleans the scratch.", "L'infirmière scolaire nettoie l'égratignure."],
      ["hospital", "/ˈhɒspɪtl/", "Noun", "l'hôpital", "The ambulance drives quickly to the hospital.", "L'ambulance roule rapidement vers l'hôpital."],
      ["ambulance", "/ˈæmbjələns/", "Noun", "l'ambulance", "Call an ambulance in an emergency.", "Appelle une ambulance en cas d'urgence."],
      ["paramedic", "/ˌpærəˈmɛdɪk/", "Noun", "l'ambulancier / secouriste", "Paramedics give first aid on the spot.", "Les secouristes apportent les premiers soins sur place."],
      ["patient", "/ˈpeɪʃnt/", "Noun", "le patient / le malade", "The kind nurse reassures the young patient.", "La gentille infirmière rassure le jeune patient."],
      ["headache", "/ˈhɛdeɪk/", "Noun", "le mal de tête", "I have got a bad headache today.", "J'ai un fort mal de tête aujourd'hui."],
      ["bandage", "/ˈbændɪdʒ/", "Noun", "le pansement / bandage", "Put a clean bandage on the cut.", "Mets un bandage propre sur la coupure."],
      ["medicine", "/ˈmɛdsn/", "Noun", "le médicament", "Take this soothing medicine with water.", "Prends ce médicament apaisant avec de l'eau."],
      ["emergency", "/ɪˈmɜːrdʒənsi/", "Noun", "l'urgence", "Dial 999 for emergencies in Britain.", "Compose le 999 pour les urgences au Royaume-Uni."]
    ],
    dialogue: {
      title: "À l'infirmerie du collège", setting: "Un élève va voir l'infirmière après une chute en EPS.",
      lines: [
        ["Nurse", "Hello Alex, what is the matter today?", "Bonjour Alex, quel est le problème aujourd'hui ?"],
        ["Alex", "I fell during football practice and my ankle hurts.", "Je suis tombé pendant le football et ma cheville me fait mal."],
        ["Nurse", "Let me check. Sit on the examination bed, please.", "Laisse-moi regarder. Assieds-toi sur le lit d'examen, s'il te plaît."],
        ["Alex", "Thank you, nurse. A cold ice pack feels much better.", "Merci, madame l'infirmière. Une poche de glace fait déjà du bien."]
      ]
    },
    dictation: { prompt: "The nurse puts a bandage on my ankle.", fr: "L'infirmière met un bandage sur ma cheville." },
    quiz: [
      { q: "Quel numéro d'urgence compose-t-on au Royaume-Uni ?", opts: ["15", "112", "999", "911"], a: 2, exp: "Le numéro d'urgence historique au Royaume-Uni est le 999." },
      { q: "Que signifie 'headache' ?", opts: ["Mal de ventre", "Mal de dos", "Mal de tête", "Mal de gorge"], a: 2, exp: "'Headache' est composé de 'head' (tête) et 'ache' (douleur)." },
      { q: "Quel professionnel prodigue les premiers secours dans une ambulance ?", opts: ["A dentist", "A paramedic", "A teacher", "A librarian"], a: 1, exp: "Le 'paramedic' est le professionnel paramédical d'urgence." }
    ]
  }
];

export { LESSON_DEFINITIONS, THEMES, GRADE_META };
