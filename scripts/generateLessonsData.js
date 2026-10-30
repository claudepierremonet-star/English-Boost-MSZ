// Generator for 130 additional curriculum lessons to reach exactly 200 lessons across 7 grades & 10 themes.

export const COLLEGE_LESSON_SPECS = [
  // ================= 6e (19 lessons: daily_life: 2, travel: 2, history: 2, hobbies: 2, sport: 2, music: 2, restaurant: 2, food: 2, work: 2, school_social: 1) =================
  {
    grade: '6e',
    theme_id: 'daily_life',
    slug: 'rooms_furniture',
    title: 'Les pièces de la maison & le mobilier',
    title_en: 'Rooms & Furniture at Home',
    objective: 'Nommer les pièces de la maison et le mobilier usuel avec there is / there are.',
    minutes: 20,
    vocab: [
      { term: "bedroom", phonetic: "/ˈbɛdruːm/", part: "Noun", fr: "la chambre à coucher", en_ex: "My bedroom has a big window.", fr_ex: "Ma chambre a une grande fenêtre." },
      { term: "living room", phonetic: "/ˈlɪvɪŋ ruːm/", part: "Noun", fr: "le salon", en_ex: "We watch movies in the living room.", fr_ex: "Nous regardons des films dans le salon." },
      { term: "kitchen", phonetic: "/ˈkɪtʃɪn/", part: "Noun", fr: "la cuisine", en_ex: "Dad is cooking in the kitchen.", fr_ex: "Papa cuisine dans la cuisine." },
      { term: "bathroom", phonetic: "/ˈbɑːθruːm/", part: "Noun", fr: "la salle de bains", en_ex: "The bathroom is next to my bedroom.", fr_ex: "La salle de bains est à côté de ma chambre." },
      { term: "desk", phonetic: "/dɛsk/", part: "Noun", fr: "le bureau (meuble)", en_ex: "I do my homework at my desk.", fr_ex: "Je fais mes devoirs à mon bureau." },
      { term: "sofa", phonetic: "/ˈsoʊfə/", part: "Noun", fr: "le canapé", en_ex: "The cat is sleeping on the comfortable sofa.", fr_ex: "Le chat dort sur le canapé confortable." },
      { term: "bookshelf", phonetic: "/ˈbʊkʃɛlf/", part: "Noun", fr: "l'étagère à livres", en_ex: "There are fifteen books on the bookshelf.", fr_ex: "Il y a quinze livres sur l'étagère." },
      { term: "wardrobe", phonetic: "/ˈwɔːdroʊb/", part: "Noun", fr: "la garde-robe / l'armoire", en_ex: "Hang your coat in the wardrobe.", fr_ex: "Accroche ton manteau dans l'armoire." },
      { term: "armchair", phonetic: "/ˈɑːrmtʃɛər/", part: "Noun", fr: "le fauteuil", en_ex: "Grandma reads in the soft armchair.", fr_ex: "Grand-mère lit dans le fauteuil moelleux." },
      { term: "carpet", phonetic: "/ˈkɑːrpɪt/", part: "Noun", fr: "le tapis / la moquette", en_ex: "The blue carpet keeps our feet warm.", fr_ex: "Le tapis bleu garde nos pieds au chaud." }
    ],
    model_phrases: [
      { en: "There is a wooden desk in my room.", fr: "Il y a un bureau en bois dans ma chambre.", focus: "There is (singulier)" },
      { en: "There are two armchairs in the living room.", fr: "Il y a deux fauteuils dans le salon.", focus: "There are (pluriel)" },
      { en: "Is there a mirror in the hallway?", fr: "Y a-t-il un miroir dans le couloir ?", focus: "Forme interrogative" },
      { en: "There aren't any lamps on that table.", fr: "Il n'y a pas de lampes sur cette table.", focus: "Forme négative" }
    ],
    grammar: {
      title: "There is & There are (Description spatiale)",
      rule: "On utilise 'There is' suivi d'un nom singulier (ex: There is a cat), et 'There are' suivi d'un nom au pluriel (ex: There are two beds). À la forme interrogative, on inverse : 'Is there...?' ou 'Are there...?'",
      example_en: "There is a blue sofa in the lounge and there are three posters on the wall.",
      example_fr: "Il y a un canapé bleu dans le salon et il y a trois posters sur le mur.",
      tip: "Attention au pluriel : s'il y a plusieurs objets, dites toujours 'There ARE' !",
      level_focus: "There is / There are, prépositions de lieu (in, on, under, next to)."
    },
    dialogue: {
      title: "Visite de la nouvelle maison",
      setting_fr: "Liam fait visiter sa nouvelle maison à sa camarade Emma.",
      lines: [
        { speaker: "Emma", en: "Your new house is lovely, Liam! Where is your bedroom?", fr: "Ta nouvelle maison est charmante, Liam ! Où est ta chambre ?" },
        { speaker: "Liam", en: "It is upstairs on the left. There is a wide desk near the window.", fr: "C'est en haut à gauche. Il y a un grand bureau près de la fenêtre." },
        { speaker: "Emma", en: "Is there a garden behind the kitchen?", fr: "Y a-t-il un jardin derrière la cuisine ?" },
        { speaker: "Liam", en: "Yes, there is! There are apple trees and green grass.", fr: "Oui ! Il y a des pommiers et de l'herbe verte." }
      ]
    },
    dictation: {
      canonical: "There is a big bookshelf in my bedroom.",
      translation_fr: "Il y a une grande étagère à livres dans ma chambre.",
      audio_prompt: "There is a big bookshelf in my bedroom.",
      difficulty_note: "Bien orthographier 'bookshelf' et accorder 'is' avec le singulier."
    },
    quiz: [
      {
        question: "Comment dit-on « Il y a trois chaises » en anglais ?",
        options: ["There is three chairs.", "There are three chairs.", "It has three chairs.", "They are three chairs."],
        correct_index: 1,
        explanation: "'Chairs' est au pluriel, donc on utilise 'There are'."
      },
      {
        question: "Quel mot désigne « la salle de bains » ?",
        options: ["The kitchen", "The bedroom", "The bathroom", "The wardrobe"],
        correct_index: 2,
        explanation: "'Bathroom' signifie la salle de bains ('bath' = bain, 'room' = pièce)."
      },
      {
        question: "Quelle est la traduction de « desk » ?",
        options: ["L'armoire", "Le bureau (meuble)", "Le fauteuil", "Le canapé"],
        correct_index: 1,
        explanation: "'Desk' désigne le bureau de travail où l'on étudie ou écrit."
      }
    ]
  },
  {
    grade: '6e',
    theme_id: 'daily_life',
    slug: 'classroom_supplies',
    title: 'La vie scolaire & le matériel de cours',
    title_en: 'School Supplies & Classroom Rules',
    objective: 'Identifier toutes les fournitures scolaires et formuler des requêtes polies en classe.',
    minutes: 20,
    vocab: [
      { term: "ruler", phonetic: "/ˈruːlər/", part: "Noun", fr: "la règle graduée", en_ex: "Draw a straight line with your ruler.", fr_ex: "Trace une ligne droite avec ta règle." },
      { term: "pencil sharpener", phonetic: "/ˈpɛnsl ˈʃɑːrpənər/", part: "Noun", fr: "le taille-crayon", en_ex: "Can I borrow your pencil sharpener?", fr_ex: "Puis-je emprunter ton taille-crayon ?" },
      { term: "eraser", phonetic: "/ɪˈreɪsər/", part: "Noun", fr: "la gomme", en_ex: "I made a mistake, where is the eraser?", fr_ex: "J'ai fait une erreur, où est la gomme ?" },
      { term: "glue stick", phonetic: "/ɡluː stɪk/", part: "Noun", fr: "le bâton de colle", en_ex: "Use the glue stick for your collage.", fr_ex: "Utilise le bâton de colle pour ton collage." },
      { term: "scissors", phonetic: "/ˈsɪzərz/", part: "Noun", fr: "les ciseaux", en_ex: "These scissors cut paper easily.", fr_ex: "Ces ciseaux coupent le papier facilement." },
      { term: "notebook", phonetic: "/ˈnoʊtbʊk/", part: "Noun", fr: "le cahier", en_ex: "Write the date in your English notebook.", fr_ex: "Écris la date dans ton cahier d'anglais." },
      { term: "highlighter", phonetic: "/ˈhaɪlaɪtər/", part: "Noun", fr: "le surligneur", en_ex: "Highlight the keywords in yellow.", fr_ex: "Surligne les mots-clés en jaune." },
      { term: "binder", phonetic: "/ˈbaɪndər/", part: "Noun", fr: "le classeur", en_ex: "Keep your grammar sheets in this binder.", fr_ex: "Garde tes fiches de grammaire dans ce classeur." },
      { term: "chalkboard", phonetic: "/ˈtʃɔːkbɔːrd/", part: "Noun", fr: "le tableau noir", en_ex: "The teacher writes on the chalkboard.", fr_ex: "Le professeur écrit sur le tableau." },
      { term: "pencil case", phonetic: "/ˈpɛnsl keɪs/", part: "Noun", fr: "la trousse", en_ex: "Put your pens back into your pencil case.", fr_ex: "Remets tes stylos dans ta trousse." }
    ],
    model_phrases: [
      { en: "Can I borrow your ruler, please?", fr: "Puis-je emprunter ta règle, s'il te plaît ?", focus: "Modal CAN (demande polie)" },
      { en: "Open your English notebooks on page ten.", fr: "Ouvrez vos cahiers d'anglais à la page dix.", focus: "Impératif d'instruction" },
      { en: "I don't have a green highlighter.", fr: "Je n'ai pas de surligneur vert.", focus: "Don't have (possession négative)" },
      { en: "Whose scissors are these?", fr: "À qui sont ces ciseaux ?", focus: "Pronom interrogatif Whose" }
    ],
    grammar: {
      title: "L'Impératif & les demandes avec CAN",
      rule: "Pour donner une consigne en classe, on utilise l'impératif sans sujet (ex: Open your book!). Pour demander poliment la permission ou un objet, on utilise 'Can I + base verbale + please?'",
      example_en: "Can I borrow a pencil, please? - Of course, here you are!",
      example_fr: "Puis-je emprunter un crayon, s'il te plaît ? - Bien sûr, voilà !",
      tip: "N'oubliez pas 'please' à la fin pour une politesse parfaite à l'anglo-saxonne.",
      level_focus: "Modal CAN, impératif affirmatif et négatif (Don't talk!)."
    },
    dialogue: {
      title: "En cours d'anglais",
      setting_fr: "Tom a oublié sa règle et demande de l'aide à Sarah.",
      lines: [
        { speaker: "Tom", en: "Excuse me Sarah, can I borrow your ruler, please?", fr: "Excuse-moi Sarah, puis-je emprunter ta règle, s'il te plaît ?" },
        { speaker: "Sarah", en: "Sure, Tom! Here it is. Do you need an eraser too?", fr: "Bien sûr, Tom ! La voilà. As-tu aussi besoin d'une gomme ?" },
        { speaker: "Tom", en: "No thanks, I have got my eraser in my pencil case.", fr: "Non merci, j'ai ma gomme dans ma trousse." },
        { speaker: "Teacher", en: "Quiet please, everyone! Open your notebooks now.", fr: "Silence s'il vous plaît, tout le monde ! Ouvrez vos cahiers maintenant." }
      ]
    },
    dictation: {
      canonical: "Open your notebook and take a blue pen.",
      translation_fr: "Ouvre ton cahier et prends un stylo bleu.",
      audio_prompt: "Open your notebook and take a blue pen.",
      difficulty_note: "Attention à l'impératif direct 'Open' sans 's'."
    },
    quiz: [
      {
        question: "Quelle tournure permet de demander poliment d'emprunter un objet ?",
        options: ["Give me the ruler!", "Can I borrow your ruler, please?", "I take your ruler now.", "You must give your ruler."],
        correct_index: 1,
        explanation: "'Can I borrow...' est la formulation polie standard en classe."
      },
      {
        question: "Comment se dit « une gomme » en anglais ?",
        options: ["A ruler", "A sharpener", "An eraser", "A binder"],
        correct_index: 2,
        explanation: "'Eraser' (ou 'rubber' en anglais britannique) signifie la gomme."
      },
      {
        question: "Pourquoi dit-on 'these scissors' au pluriel ?",
        options: ["Parce que le mot scissors a deux lames et est toujours au pluriel.", "Parce qu'il y a toujours deux personnes.", "C'est une erreur de grammaire.", "On peut aussi dire 'a scissors'."],
        correct_index: 0,
        explanation: "En anglais, 'scissors' (ciseaux) est un nom invariable au pluriel (a pair of scissors)."
      }
    ]
  }
];

export {};
