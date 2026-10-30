// 18 additional lessons for 2nde (Seconde - Lycée / B1)

export const SPECS_2NDE = [
  {
    grade: '2nde', theme_id: 'daily_life', num: 2,
    title: 'Identité numérique & vie privée',
    title_en: 'Digital Identity & Online Privacy',
    objective: 'Débattre de la protection des données personnelles avec les modaux de déduction passés (MUST HAVE / COULD HAVE).',
    grammar: {
      title: "Les modaux de déduction passée (MUST HAVE / COULD HAVE + participe passé)",
      rule: "Pour formuler une hypothèse sur un événement passé : MUST HAVE + PP (quasi-certitude passée), COULD/MIGHT HAVE + PP (possibilité passée).",
      example_en: "A malicious program must have compromised her password because unauthorized messages were sent.",
      example_fr: "Un programme malveillant a dû pirater son mot de passe car des messages non autorisés ont été envoyés.",
      tip: "Structure : Modal + HAVE + participe passé invariable.",
      level_focus: "Modaux de déduction au passé (past modals of deduction)."
    },
    vocab: [
      ["digital footprint", "/ˈdɪdʒɪtl ˈfʊtprɪnt/", "Noun", "l'empreinte numérique", "Every search and click leaves a permanent digital footprint.", "Chaque recherche et clic laisse une empreinte numérique permanente."],
      ["privacy settings", "/ˈprɪvəsi ˈsɛtɪŋz/", "Noun", "les paramètres de confidentialité", "Tighten your privacy settings on all social networks.", "Resserre tes paramètres de confidentialité sur les réseaux."],
      ["cyberbullying", "/ˈsaɪbərbʊliɪŋ/", "Noun", "le cyberharcèlement", "Schools enforce strict zero-tolerance policies against cyberbullying.", "Les lycées appliquent une politique zéro tolérance contre le cyberharcèlement."],
      ["echo chamber", "/ˈɛkoʊ ˈtʃeɪmbər/", "Noun", "la chambre d'écho / bulle de filtres", "Algorithms trap users inside ideological echo chambers.", "Les algorithmes enferment les usagers dans des bulles d'écho."],
      ["two-factor authentication", "/tuː ˈfæktər ɔːˌθɛntɪˈkeɪʃn/", "Noun", "l'authentification à deux facteurs (2FA)", "Enable two-factor authentication to shield online banking.", "Active la double authentification pour protéger tes comptes."],
      ["surveillance", "/sərˈveɪləns/", "Noun", "la surveillance des données", "Mass data surveillance raises acute constitutional questions.", "La surveillance de masse soulève de vives questions constitutionnelles."],
      ["reputation", "/ˌrɛpjuˈteɪʃn/", "Noun", "la réputation en ligne", "A reckless post can tarnish your professional reputation.", "Une publication inconsidérée peut ternir votre réputation."],
      ["consent", "/kənˈsɛnt/", "Noun", "le consentement éclairé", "Websites must obtain explicit user consent before tracking cookies.", "Les sites doivent recueillir le consentement avant les cookies."],
      ["compromised", "/ˈkɒmprəmaɪzd/", "Adjective", "compromis / piraté", "Change your password immediately if your email was compromised.", "Change immédiatement ton mot de passe s'il a été piraté."],
      ["anonymous", "/əˈnɒnɪməs/", "Adjective", "anonyme", "True anonymity is rare across contemporary public networks.", "Le véritable anonymat est rare sur les réseaux contemporains."]
    ],
    dialogue: {
      title: "Sensibilisation à l'hygiène numérique", setting: "En cours d'EMC / anglais, des lycéens analysent une fuite de données.",
      lines: [
        ["Student A", "Someone must have stolen my login credentials, my account was hacked last night!", "Quelqu'un a dû voler mes identifiants, mon compte a été piraté hier soir !"],
        ["Student B", "You could have prevented this by activating two-factor authentication.", "Tu aurais pu éviter cela en activant la double authentification."],
        ["Student A", "I know, I shouldn't have used the same password across multiple platforms.", "Je sais, je n'aurais pas dû utiliser le même mot de passe sur plusieurs plateformes."],
        ["Teacher", "Digital footprints require constant vigilance and robust privacy habits.", "L'empreinte numérique exige une vigilance constante et de bonnes habitudes."]
      ]
    },
    dictation: { prompt: "A hacker must have compromised the database through unencrypted files.", fr: "Un pirate a dû compromettre la base de données via des fichiers non chiffrés." },
    quiz: [
      { q: "Quelle structure exprime une quasi-certitude portant sur le passé ('il a dû...') ?", opts: ["Must + BV", "Must have + participe passé", "Had to + BV", "Could be"], a: 1, exp: "'Must have + past participle' exprime la déduction quasi-certaine au passé." },
      { q: "Que signifie 'echo chamber' sur les réseaux sociaux ?", opts: ["Une salle de concert", "Un environnement fermé où les algorithmes ne montrent que des avis similaires", "Un micro", "Une messagerie privée"], a: 1, exp: "Une 'echo chamber' (bulle d'écho) enferme l'usager dans des contenus confirmant ses propres opinions." },
      { q: "Que permet l'authentification à deux facteurs (2FA) ?", opts: ["Naviguer plus vite", "Ajouter une deuxième couche de sécurité obligatoire (code temporaire)", "Télécharger des vidéos", "Supprimer son compte"], a: 1, exp: "Le 2FA valide la connexion par deux canaux distincts (mot de passe + code SMS/application)." }
    ]
  },
  {
    grade: '2nde', theme_id: 'daily_life', num: 3,
    title: 'Mobilité urbaine & transports écologiques',
    title_en: 'Urban Mobility & Green Transport',
    objective: 'Analyser la transition vers les mobilités douces en ville avec les propositions comparatives complexes.',
    grammar: {
      title: "Les doubles comparatifs proportionnels (THE MORE..., THE MORE...)",
      rule: "Pour exprimer une évolution parallèle : The + comparatif ..., the + comparatif ... (ex: The more bike lanes a city builds, the safer cyclists feel).",
      example_en: "The more people use electric trams and bicycles, the cleaner our urban air becomes.",
      example_fr: "Plus les gens utilisent les tramways électriques et le vélo, plus l'air urbain devient pur.",
      tip: "Structure : The + comparatif 1, the + comparatif 2.",
      level_focus: "Double comparatif proportionnel (the more/less... the more/less...)."
    },
    vocab: [
      ["urban mobility", "/ˈɜːrbən moʊˈbɪləti/", "Noun", "la mobilité urbaine", "Sustainable urban mobility reshapes congested metropolitan centers.", "La mobilité durable transforme les centres encombrés."],
      ["cycle lane", "/ˈsaɪkl leɪn/", "Noun", "la piste cyclable protégée", "Segregated cycle lanes encourage daily bike commuting.", "Les pistes cyclables séparées encouragent les trajets quotidiens."],
      ["carpooling", "/ˈkɑːrpuːlɪŋ/", "Noun", "le covoiturage", "Carpooling cuts fuel expenses and reduces morning gridlock.", "Le covoiturage réduit les frais de carburant et les bouchons."],
      ["electric scooter", "/ɪˈlɛktrɪk ˈskuːtər/", "Noun", "la trottinette électrique", "Shared electric scooters offer micro-mobility for short trips.", "Les trottinettes électriques partagées offrent une micro-mobilité."],
      ["pedestrianized zone", "/pəˈdɛstriənaɪzd zoʊn/", "Noun", "la zone piétonne", "Pedestrianized high streets revive neighborhood commerce.", "Les rues piétonnes revitalisent le commerce de proximité."],
      ["commuter", "/kəˈmjuːtər/", "Noun", "l'usager pendulaire (trajet domicile-travail)", "Commuters board light rail transit to bypass motorway traffic.", "Les usagers pendulaires prennent le tram pour éviter l'autoroute."],
      ["carbon emissions", "/ˈkɑːrbən ɪˈmɪʃnz/", "Noun", "les émissions de carbone", "Zero-emission buses drastically lower city pollution.", "Les bus zéro émission réduisent drastiquement la pollution urbaine."],
      ["congestion", "/kənˈdʒɛstʃən/", "Noun", "l'engorgement / les embouteillages", "London levies a congestion charge to discourage urban cars.", "Londres prélève une taxe d'embouteillage pour limiter la voiture."],
      ["efficient", "/ɪˈfɪʃnt/", "Adjective", "performant / efficace", "An efficient subway grid is the backbone of great cities.", "Un réseau de métro performant est la colonne vertébrale des métropoles."],
      ["infrastructure", "/ˈɪnfrəstrʌktʃər/", "Noun", "l'infrastructure urbaine", "Investing in green infrastructure fosters ecological resilience.", "Investir dans les infrastructures vertes renforce l'écologie."]
    ],
    dialogue: {
      title: "Plan d'urbanisme vert à Copenhague", setting: "Des lycéens étudient l'exemple cyclable de Copenhague.",
      lines: [
        ["Student A", "The more cycling infrastructure Copenhagen built, the more residents embraced cycling.", "Plus Copenhague a construit de pistes cyclables, plus les habitants ont adopté le vélo."],
        ["Student B", "Over sixty percent of citizens commute to work or high school by bicycle today.", "Plus de soixante pour cent des citoyens vont au travail ou au lycée à vélo aujourd'hui."],
        ["Student A", "Does the city also tax petrol cars entering historic districts?", "La ville taxe-t-elle aussi les voitures à essence entrant dans le centre historique ?"],
        ["Student B", "Yes, the higher the congestion fees, the lower the urban carbon emissions.", "Oui, plus la taxe de congestion est élevée, plus les émissions de carbone baissent."]
      ]
    },
    dictation: { prompt: "The more bike lanes we create, the cleaner our city air becomes.", fr: "Plus nous créons de pistes cyclables, plus l'air de notre ville devient pur." },
    quiz: [
      { q: "Quelle structure exprime 'Plus on s'entraîne, meilleur on devient' ?", opts: ["The more you practice, the better you become.", "More you practice, more you are good.", "As you practice, as you are better.", "The practice makes better."], a: 0, exp: "'The more..., the better...' est le double comparatif proportionnel régulier." },
      { q: "Que désigne un 'commuter' en milieu urbain ?", opts: ["Un touriste", "Une personne faisant la navette quotidienne domicile-travail", "Un conducteur de bus", "Un policier municipal"], a: 1, exp: "'Commuter' désigne l'usager qui fait la navette quotidienne domicile-travail/études." },
      { q: "À quoi sert la 'congestion charge' instaurée à Londres ?", opts: ["À payer le parking", "À dissuader les véhicules individuels d'encombrer le centre-ville", "À réparer les ponts", "À financer les taxis"], a: 1, exp: "La taxe d'embouteillage londonienne taxe l'entrée des voitures en centre-ville." }
    ]
  },
  {
    grade: '2nde', theme_id: 'travel', num: 2,
    title: 'Choc culturel & immersion linguistique',
    title_en: 'Culture Shock & Linguistic Immersion',
    objective: 'Analyser les étapes de l\'adaptation culturelle à l\'étranger avec BE USED TO vs GET USED TO.',
    grammar: {
      title: "La nuance entre BE USED TO + V-ing (être habitué) et GET USED TO + V-ing (s'habituer)",
      rule: "'Be used to + V-ing/nom' exprime un état d'accoutumance existant. 'Get used to + V-ing/nom' exprime le processus graduel d'adaptation.",
      example_en: "It took me two months to get used to driving on the left in England, but now I am completely used to it.",
      example_fr: "Il m'a fallu deux mois pour m'habituer à rouler à gauche en Angleterre, mais maintenant j'y suis totalement habitué.",
      tip: "Attention : le verbe qui suit used to dans ces deux structures prend impérativement la marque -ING.",
      level_focus: "Be used to vs Get used to + V-ing / nom."
    },
    vocab: [
      ["culture shock", "/ˈkʌltʃər ʃɒk/", "Noun", "le choc culturel", "Experiencing culture shock is a natural phase of living abroad.", "Vivre un choc culturel est une étape normale de l'expatriation."],
      ["immersion", "/ɪˈmɜːrʃn/", "Noun", "l'immersion linguistique totale", "Total linguistic immersion forces your brain to think in English.", "L'immersion totale force votre cerveau à penser en anglais."],
      ["host family", "/hoʊst ˈfæməli/", "Noun", "la famille d'accueil", "My British host family made me feel right at home.", "Ma famille d'accueil britannique m'a fait me sentir comme chez moi."],
      ["customs", "/ˈkʌstəmz/", "Noun", "les coutumes / usages locaux", "Respect local culinary and social customs when visiting.", "Respectez les coutumes locales culinaires et sociales."],
      ["adaptation", "/ˌædæpˈteɪʃn/", "Noun", "l'adaptation culturelle", "Patience and an open mind accelerate cultural adaptation.", "Patience et ouverture d'esprit accélèrent l'adaptation."],
      ["homesick", "/ˈhoʊmsɪk/", "Adjective", "qui a le mal du pays / nostalgique", "She felt homesick during her first week in Toronto.", "Elle a eu le mal du pays lors de sa première semaine à Toronto."],
      ["fluency", "/ˈfluːənsi/", "Noun", "l'aisance / la fluidité d'élocution", "Daily conversations build authentic conversational fluency.", "Les conversations quotidiennes forgent l'aisance orale."],
      ["misunderstanding", "/ˌmɪsʌndərˈstændɪŋ/", "Noun", "le malentendu / quiproquo", "Humour resolves minor cultural misunderstandings gently.", "L'humour désamorce les petits malentendus avec douceur."],
      ["cross-cultural", "/krɒs ˈkʌltʃərəl/", "Adjective", "interculturel", "Cross-cultural friendships broaden our global horizon.", "Les amitiés interculturelles élargissent notre horizon mondial."],
      ["embrace", "/ɪmˈbreɪs/", "Verb", "adopter / accueillir à bras ouverts", "Embrace unfamiliar traditions with curiosity and respect.", "Accueillez les traditions méconnues avec curiosité et respect."]
    ],
    dialogue: {
      title: "Bilan d'un trimestre d'échange au Canada", setting: "Une lycéenne raconte son séjour à Vancouver à son enseignante.",
      lines: [
        ["Teacher", "Was it difficult to adapt when you arrived in British Columbia?", "Était-il difficile de s'adapter à votre arrivée en Colombie-Britannique ?"],
        ["Student", "At first I felt homesick, but I quickly got used to speaking English with my host family.", "Au début j'avais le mal du pays, mais je me suis vite habituée à parler anglais en famille d'accueil."],
        ["Teacher", "Are you completely used to the cold winter climate now?", "Êtes-vous totalement habituée au climat hivernal froid désormais ?"],
        ["Student", "Yes! I am used to snowshoeing and my conversational fluency has leaped forward.", "Oui ! Je suis habituée aux raquettes et mon aisance orale a fait un bond en avant."]
      ]
    },
    dictation: { prompt: "She soon got used to speaking English with her host family.", fr: "Elle s'est vite habituée à parler anglais avec sa famille d'accueil." },
    quiz: [
      { q: "Quelle forme verbale suit 'be used to' pour exprimer une habitude acquise ?", opts: ["Base verbale nue", "Verbe en -ING", "Prétérit", "Past participle"], a: 1, exp: "'Be used to' et 'get used to' sont suivis d'un nom ou d'un verbe en -ING (I am used to living here)." },
      { q: "Que signifie 'homesick' ?", opts: ["Malade en voyage", "Avoir le mal du pays / regretter sa maison", "Avoir faim", "Être fatigué"], a: 1, exp: "'Homesick' qualifie la nostalgie douloureuse de son foyer et de son pays." },
      { q: "Quelle expression désigne le processus d'accoutumance graduelle ('s'habituer à') ?", opts: ["Used to", "Get used to", "Be used by", "Use to"], a: 1, exp: "'Get used to' exprime le processus d'adaptation en cours ou accompli." }
    ]
  },
  {
    grade: '2nde', theme_id: 'travel', num: 3,
    title: 'Missions humanitaires & volontariat international',
    title_en: 'Humanitarian Missions Abroad',
    objective: 'Parler d\'engagement solidaire à l\'international avec les subordonnées de condition (Third Conditional).',
    grammar: {
      title: "Initiation au Troisième Conditionnel (Third Conditional : IF + had + PP, WOULD HAVE + PP)",
      rule: "Pour exprimer un regret ou une hypothèse rétrospective sur un passé non modifiable : If they had not provided clean water, waterborne diseases would have spread.",
      example_en: "If volunteers had not restored the clinic, local families would not have received medical care.",
      example_fr: "Si les bénévoles n'avaient pas restauré le dispensaire, les familles locales n'auraient pas reçu de soins médicaux.",
      tip: "Structure : IF + had + participe passé / WOULD HAVE + participe passé.",
      level_focus: "Third Conditional d'irréel du passé."
    },
    vocab: [
      ["humanitarian", "/hjuːˌmænɪˈtɛəriən/", "Adjective", "humanitaire", "Humanitarian NGOs deploy emergency aid in crisis zones.", "Les ONG humanitaires déploient une aide d'urgence en zone de crise."],
      ["NGO", "/ˌɛn dʒiː ˈoʊ/", "Noun", "l'organisation non gouvernementale (ONG)", "Non-governmental organizations work alongside local communities.", "Les ONG travaillent aux côtés des communautés locales."],
      ["volunteer", "/ˌvɒlənˈtɪər/", "Noun", "le bénévole / volontaire", "Youth volunteers helped construct an earthquake-resistant school.", "De jeunes volontaires ont aidé à bâtir une école antisismique."],
      ["disaster relief", "/dɪˈzɑːstər rɪˈliːf/", "Noun", "les secours d'urgence après catastrophe", "Disaster relief teams delivered drinking water and tents.", "Les équipes de secours ont livré eau potable et tentes."],
      ["empowerment", "/ɪmˈpaʊərmənt/", "Noun", "l'autonomisation des populations", "Education fosters long-term economic empowerment.", "L'éducation favorise l'autonomisation économique durable."],
      ["sanitation", "/ˌsænɪˈteɪʃn/", "Noun", "l'assainissement de l'eau et hygiène", "Installing clean water sanitation prevents epidemic outbreaks.", "Installer l'assainissement prévient les flambées épidémiques."],
      ["altruism", "/ˈæltruːɪzəm/", "Noun", "l'altruisme / dévouement", "Genuine altruism motivates young humanitarians.", "L'altruisme authentique motive les jeunes humanitaires."],
      ["crisis", "/ˈkraɪsɪs/", "Noun", "la crise humanitaire", "The refugee crisis requires united international compassion.", "La crise des réfugiés exige une compassion internationale unie."],
      ["rebuild", "/ˌriːˈbɪld/", "Verb", "reconstruire", "Villagers united with international teams to rebuild homes.", "Les villageois se sont unis aux équipes pour reconstruire."],
      ["sustainable aid", "/səˈsteɪnəbl eɪd/", "Noun", "l'aide pérenne et durable", "Sustainable aid transfers technology to local engineers.", "L'aide durable transmet la technologie aux ingénieurs locaux."]
    ],
    dialogue: {
      title: "Récit d'un projet d'adduction d'eau au Népal", setting: "Un jeune volontaire témoigne devant des lycéens.",
      lines: [
        ["Student", "What was the most urgent challenge when your team arrived in the valley?", "Quel était le défi le plus urgent quand votre équipe est arrivée dans la vallée ?"],
        ["Volunteer", "Clean drinking water. If we had not built gravity-fed pipes, waterborne illness would have spread.", "L'eau potable. Si nous n'avions pas posé des tuyaux gravitaires, les maladies hydriques se seraient propagées."],
        ["Student", "Did you train local youths to maintain the pumps?", "Avez-vous formé des jeunes locaux pour entretenir les pompes ?"],
        ["Volunteer", "Yes, sustainable aid means empowering the community to manage their own infrastructure.", "Oui, l'aide durable signifie donner le pouvoir à la communauté de gérer ses infrastructures."]
      ]
    },
    dictation: { prompt: "If volunteers had not arrived, the clinic would have closed.", fr: "Si les volontaires n'étaient pas arrivés, le dispensaire aurait fermé." },
    quiz: [
      { q: "Quelle structure correspond au troisième conditionnel (irréel du passé) ?", opts: ["If I knew, I would tell.", "If I had known, I would have told.", "If I know, I will tell.", "If I had known, I tell."], a: 1, exp: "Le troisième conditionnel utilise IF + had + PP dans la subordonnée et would have + PP dans la principale." },
      { q: "Que signifie l'acronyme 'NGO' en anglais ?", opts: ["National Government Office", "Non-Governmental Organization (ONG)", "New Global Order", "Nature Guard Officers"], a: 1, exp: "'NGO' signifie Non-Governmental Organization (organisation non gouvernementale)."},
      { q: "Qu'est-ce que 'disaster relief' ?", opts: ["Une fête nationale", "L'aide et secours d'urgence après catastrophe", "Une agence de voyage", "Un emprunt bancaire"], a: 1, exp: "'Disaster relief' désigne l'organisation des secours d'urgence lors de catastrophes naturelles." }
    ]
  },
  {
    grade: '2nde', theme_id: 'history', num: 2,
    title: 'La Déclaration d\'Indépendance américaine',
    title_en: 'The American Declaration of Independence',
    objective: 'Analyser le texte fondateur du 4 juillet 1776 et les idéaux des Lumières en anglais.',
    grammar: {
      title: "Le style soutenu et le subjonctif présent figé (THAT HE BE / THAT ALL MEN BE CREATED EQUAL)",
      rule: "Dans les textes juridiques et déclarations solennelles anglaises, on emploie le subjonctif avec la base verbale nue pour toutes les personnes : We hold these truths to be self-evident, that all men are created equal.",
      example_en: "The Declaration asserted that governments derive their just powers from the consent of the governed.",
      example_fr: "La Déclaration affirmait que les gouvernements tirent leurs justes pouvoirs du consentement des gouvernés.",
      tip: "Mots-clés de Thomas Jefferson : unalienable Rights, Life, Liberty, pursuit of Happiness.",
      level_focus: "Registres de langue soutenu et analyse de textes fondateurs anglo-saxons."
    },
    vocab: [
      ["independence", "/ˌɪndɪˈpɛndəns/", "Noun", "l'indépendance nationale", "The thirteen colonies declared independence from the British crown.", "Les treize colonies déclarèrent leur indépendance de la couronne britannique."],
      ["founding fathers", "/ˈfaʊndɪŋ ˈfɑːðərz/", "Noun", "les Pères fondateurs des États-Unis", "Jefferson, Franklin and Adams were prominent Founding Fathers.", "Jefferson, Franklin et Adams comptaient parmi les pères fondateurs."],
      ["liberty", "/ˈlɪbərti/", "Noun", "la liberté politique et civile", "The Liberty Bell tolled to proclaim freedom in Philadelphia.", "La cloche de la liberté retentit pour proclamer la liberté à Philadelphie."],
      ["constitution", "/ˌkɒnstɪˈtjuːʃn/", "Noun", "la Constitution", "The American Constitution established a balance of three branches of power.", "La Constitution américaine établit la séparation des trois pouvoirs."],
      ["unalienable rights", "/ʌnˈeɪliənəbl raɪts/", "Noun", "les droits inaliénables", "Life, liberty and the pursuit of happiness are unalienable rights.", "La vie, la liberté et la recherche du bonheur sont des droits inaliénables."],
      ["tyranny", "/ˈtɪrəni/", "Noun", "la tyrannie / l'oppression", "The text denounced the arbitrary tyranny of King George III.", "Le texte dénonçait la tyrannie arbitraire du roi George III."],
      ["grievance", "/ˈɡriːvəns/", "Noun", "le grief / motif de plainte officiel", "Colonial delegates listed twenty-seven specific grievances.", "Les délégués coloniaux énumérèrent vingt-sept griefs précis."],
      ["signatory", "/ˈsɪɡnətɔːri/", "Noun", "le signataire d'un traité", "Fifty-six patriots put their names as signatories to the charter.", "Cinquante-six patriotes apposèrent leur nom comme signataires."],
      ["sovereignty", "/ˈsɒvrənti/", "Noun", "la souveraineté populaire", "Popular sovereignty asserts that power belongs to citizens.", "La souveraineté populaire affirme que le pouvoir appartient aux citoyens."],
      ["proclaim", "/prəˈkleɪm/", "Verb", "proclamer solennellement", "The Continental Congress proclaimed the birth of a new nation.", "Le Congrès continental proclama la naissance d'une nouvelle nation."]
    ],
    dialogue: {
      title: "À l'Independence Hall de Philadelphie", setting: "Des lycéens contemplent le manuscrit original de 1776.",
      lines: [
        ["Teacher", "Who was the principal author of the Declaration of Independence in 1776?", "Qui fut le principal rédacteur de la Déclaration d'Indépendance en 1776 ?"],
        ["Student", "Thomas Jefferson drafted the core text, inspired by Enlightenment philosophy.", "Thomas Jefferson a rédigé le texte fondamental, inspiré par les Lumières."],
        ["Teacher", "Which unalienable rights are famously asserted in the preamble?", "Quels droits inaliénables sont célèbres dans le préambule ?"],
        ["Student", "Life, Liberty and the Pursuit of Happiness for all citizens.", "La Vie, la Liberté et la Recherche du Bonheur pour tous les citoyens."]
      ]
    },
    dictation: { prompt: "All citizens are endowed with unalienable rights to liberty.", fr: "Tous les citoyens sont dotés de droits inaliénables à la liberté." },
    quiz: [
      { q: "Quelle date marque l'adoption de la Déclaration d'Indépendance américaine (Independence Day) ?", opts: ["14 juillet 1789", "4 juillet 1776", "11 novembre 1918", "1er janvier 1800"], a: 1, exp: "Le 4 juillet 1776 marque l'adoption de la Déclaration d'Indépendance à Philadelphie." },
      { q: "Quels sont les trois droits inaliénables cités dans le célèbre préambule de Jefferson ?", opts: ["Money, Power, Glory", "Life, Liberty and the pursuit of Happiness", "War, Victory, Honor", "Trade, Ships, Land"], a: 1, exp: "Jefferson proclame 'Life, Liberty and the pursuit of Happiness'." },
      { q: "Que signifie 'unalienable' ?", opts: ["Étranger", "Inaliénable (qui ne peut être retiré ou confisqué)", "Temporaire", "Payant"], a: 1, exp: "'Unalienable' qualifie un droit naturel imprescriptible et inviolable." }
    ]
  },
  {
    grade: '2nde', theme_id: 'history', num: 3,
    title: 'Le combat des Suffragettes pour le vote',
    title_en: 'The Suffragettes & Voting Rights',
    objective: 'Comprendre l\'histoire des droits civiques des femmes au Royaume-Uni avec le discours rapporté au passé.',
    grammar: {
      title: "La concordance des temps dans le discours indirect au passé (Backshift)",
      rule: "Quand le verbe introducteur est au passé (Emmeline Pankhurst declared that...), les temps reculent : présent -> prétérit, will -> would, can -> could.",
      example_en: "Emmeline Pankhurst declared that deeds, not words, would secure women's parliamentary vote.",
      example_fr: "Emmeline Pankhurst déclara que les actes, et non les mots, garantiraient le vote parlementaire des femmes.",
      tip: "Le mot d'ordre des suffragettes : 'Deeds, not words'.",
      level_focus: "Concordance des temps au discours indirect (backshift)."
    },
    vocab: [
      ["Suffragette", "/ˌsʌfrəˈdʒɛt/", "Noun", "la suffragette (militante pour le vote des femmes)", "Suffragettes chained themselves to railings to demand political equality.", "Les suffragettes s'enchaînèrent aux grilles pour réclamer l'égalité politique."],
      ["voting rights", "/ˈvoʊtɪŋ raɪts/", "Noun", "le droit de vote / suffrage", "Equal voting rights were finally achieved for British women in 1928.", "Le droit de vote égalitaire fut accordé aux Britanniques en 1928."],
      ["militant", "/ˈmɪlɪtənt/", "Adjective", "militant / combatif", "The WSPU adopted militant tactics to draw public attention.", "La WSPU adopta des méthodes militantes pour éveiller l'opinion."],
      ["protest", "/ˈproʊtɛst/", "Noun", "la manifestation / contestation", "Peaceful street protests gathered thousands of women in white dresses.", "Des défilés pacifiques réunirent des milliers de femmes en blanc."],
      ["imprisonment", "/ɪmˈprɪznmənt/", "Noun", "l'emprisonnement", "Suffragettes endured harsh imprisonment and force-feeding.", "Les suffragettes subirent de rudes incarcérations et le gavage forcé."],
      ["hunger strike", "/ˈhʌŋɡər straɪk/", "Noun", "la grève de la faim", "Inmates engaged in hunger strikes to protest political prisoner status.", "Les détenues firent la grève de la faim pour leur statut politique."],
      ["equality", "/iˈkwɒləti/", "Noun", "l'égalité en droits", "Gender equality remains a cornerstone of democratic justice.", "L'égalité des genres demeure une pierre angulaire de la justice."],
      ["ballot", "/ˈbælət/", "Noun", "le bulletin de vote / le scrutin", "Casting a secret ballot is the sovereign weapon of free citizens.", "Déposer un bulletin secret est l'arme souveraine des citoyens libres."],
      ["perseverance", "/ˌpɜːrsəˈvɪərəns/", "Noun", "la persévérance", "Their unwavering perseverance reshaped modern democracy.", "Leur persévérance inébranlable a refaçonné la démocratie moderne."],
      ["franchise", "/ˈfræntʃaɪz/", "Noun", "le droit de vote (sens électoral)", "The Representation of the People Act expanded the democratic franchise.", "La loi élargit le suffrage démocratique."]
    ],
    dialogue: {
      title: "Devant la statue d'Emmeline Pankhurst à Westminster", setting: "Des lycéens visitent les abords du Parlement britannique.",
      lines: [
        ["Teacher", "What was the motto of the Women's Social and Political Union founded in 1903?", "Quelle était la devise de l'union politique des femmes fondée en 1903 ?"],
        ["Student", "Their rallying slogan was 'Deeds, not words'.", "Leur mot d'ordre fédérateur était 'Des actes, pas des mots'."],
        ["Teacher", "Emmeline Pankhurst stated that women would no longer accept second-class citizenship.", "Emmeline Pankhurst affirma que les femmes n'accepteraient plus d'être des citoyennes de seconde zone."],
        ["Student", "Their immense sacrifice paved the way for universal suffrage.", "Leur immense sacrifice a ouvert la voie au suffrage universel."]
      ]
    },
    dictation: { prompt: "Suffragettes campaigned bravely to secure equal voting rights.", fr: "Les suffragettes ont milité avec courage pour obtenir l'égalité du droit de vote." },
    quiz: [
      { q: "Quelle était la célèbre devise des Suffragettes menées par Emmeline Pankhurst ?", opts: ["Talk and listen", "Deeds, not words", "Peace at all costs", "Wait and see"], a: 1, exp: "'Deeds, not words' (Des actes, pas des paroles) était la devise historique de la WSPU." },
      { q: "En quelle année toutes les femmes britanniques ont-elles obtenu le droit de vote au même âge que les hommes (21 ans) ?", opts: ["1914", "1918", "1928", "1945"], a: 2, exp: "L'égalité parfaite du droit de vote à 21 ans pour les femmes britanniques date de 1928." },
      { q: "Que signifie 'to cast a ballot' ?", opts: ["Déposer un bulletin de vote dans l'urne", "Acheter un journal", "Compter les voix", "Prononcer un discours"], a: 0, exp: "'To cast a ballot' signifie voter ou glisser un bulletin dans l'urne." }
    ]
  },
  {
    grade: '2nde', theme_id: 'hobbies', num: 2,
    title: 'L\'astronomie amateur & conquête du ciel',
    title_en: 'Amateur Astronomy & Stargazing',
    objective: 'Parler de l\'observation des étoiles, télescopes et de la mécanique céleste avec les comparatifs de distance.',
    grammar: {
      title: "L'expression de la distance et de l'immensité avec FAR MORE / FAR GREATER / LIGHT-YEARS AWAY",
      rule: "Pour intensifier un comparatif de supériorité, on emploie 'FAR' ou 'MUCH' devant le comparatif : far more distant, much larger than.",
      example_en: "The Andromeda galaxy is far more distant than any planet in our solar system, sitting millions of light-years away.",
      example_fr: "La galaxie d'Andromède est bien plus lointaine que n'importe quelle planète de notre système, située à des millions d'années-lumière.",
      tip: "Retenez : MUCH bigger / FAR more distant (et non 'very bigger').",
      level_focus: "Renforcement des comparatifs (far, much, a lot + comparative)."
    },
    vocab: [
      ["telescope", "/ˈtɛlɪskoʊp/", "Noun", "le télescope", "The reflector telescope magnifies distant lunar craters.", "Le télescope réflecteur grossit les cratères lunaires lointains."],
      ["constellation", "/ˌkɒnstəˈleɪʃn/", "Noun", "la constellation d'étoiles", "Orion's Belt is an easily recognizable winter constellation.", "La ceinture d'Orion est une constellation d'hiver très reconnaissable."],
      ["observatory", "/əbˈzɜːrvətɔːri/", "Noun", "l'observatoire astronomique", "The mountain observatory operates high above city clouds.", "L'observatoire de montagne fonctionne au-dessus des nuages."],
      ["stargazing", "/ˈstɑːrɡeɪzɪŋ/", "Noun", "l'observation des étoiles", "Stargazing requires dark skies devoid of light pollution.", "L'observation céleste exige un ciel noir sans pollution lumineuse."],
      ["light-year", "/ˈlaɪt jɪər/", "Noun", "l'année-lumière (mesure de distance)", "Proxima Centauri lies over four light-years from Earth.", "Proxima du Centaure se situe à plus de quatre années-lumière."],
      ["planet", "/ˈplænɪt/", "Noun", "la planète", "Gas giants like Jupiter have turbulent atmospheric bands.", "Les géantes gazeuses comme Jupiter ont des bandes atmosphériques."],
      ["meteor shower", "/ˈmiːtiər ˈʃaʊər/", "Noun", "la pluie d'étoiles filantes", "The Perseids produce a spectacular August meteor shower.", "Les Perséides offrent une spectaculaire pluie d'étoiles filantes en août."],
      ["celestial", "/səˈlɛstiəl/", "Adjective", "céleste", "Celestial mechanics explain orbits and lunar eclipses.", "La mécanique céleste explique les orbites et les éclipses."],
      ["cosmos", "/ˈkɒzmɒs/", "Noun", "le cosmos / l'univers", "Contemplating the silent cosmos inspires humility.", "Contempler le cosmos silencieux inspire l'humilité."],
      ["magnify", "/ˈmæɡnɪfaɪ/", "Verb", "grossir / amplifier l'image", "Eyepieces magnify the rings of Saturn clearly.", "Les oculaires grossissent nettement les anneaux de Saturne."]
    ],
    dialogue: {
      title: "Nuit des étoiles au club d'astronomie", setting: "Des élèves pointent un télescope Dobson vers Saturne.",
      lines: [
        ["Student A", "Look through the eyepiece! You can distinctly see the rings of Saturn.", "Regarde dans l'oculaire ! On voit distinctement les anneaux de Saturne."],
        ["Student B", "It looks far more breathtaking than in textbooks! How far away is it?", "C'est bien plus spectaculaire que dans les manuels ! À quelle distance se trouve-t-elle ?"],
        ["Student A", "Over a billion kilometers. Light takes more than an hour to travel from there.", "À plus d'un milliard de kilomètres. La lumière met plus d'une heure à nous parvenir."],
        ["Student B", "Stargazing truly makes one realize how small our planet is in the vast cosmos.", "Observer les étoiles fait mesurer la petitesse de notre planète dans le cosmos."]
      ]
    },
    dictation: { prompt: "The galaxy is far more distant than planets in our solar system.", fr: "La galaxie est bien plus lointaine que les planètes de notre système solaire." },
    quiz: [
      { q: "Quel mot permet d'intensifier un comparatif pour signifier 'bien plus' ?", opts: ["Very", "Far / Much", "Too", "So"], a: 1, exp: "On utilise 'far' ou 'much' devant un comparatif ('far more distant' / 'much bigger')." },
      { q: "Qu'est-ce qu'une année-lumière (light-year) en astronomie ?", opts: ["Une unité de temps", "La distance parcourue par la lumière en une année dans le vide", "Le poids d'une étoile", "La vitesse d'un télescope"], a: 1, exp: "Une année-lumière est une unité de distance (environ 9 460 milliards de km)." },
      { q: "Quel fléau moderne gêne l'observation astronomique près des métropoles ?", opts: ["La pluie", "La pollution lumineuse (light pollution)", "Le vent", "Le soleil"], a: 1, exp: "La pollution lumineuse urbaine noie la clarté des étoiles dans le ciel nocturne." }
    ]
  },
  {
    grade: '2nde', theme_id: 'hobbies', num: 3,
    title: 'Le roman graphique & bande dessinée moderne',
    title_en: 'Graphic Novels & Visual Storytelling',
    objective: 'Analyser la narration séquentielle, les vignettes et la métaphore visuelle en bande dessinée.',
    grammar: {
      title: "Les adjectifs composés (hyphenated compound adjectives : well-crafted, thought-provoking)",
      rule: "On forme des adjectifs riches par composition avec un trait d'union : thought-provoking (qui fait réfléchir), award-winning (primé), eye-catching (qui attire l'œil).",
      example_en: "Art Spiegelman's Maus is an award-winning, thought-provoking graphic novel depicting historical tragedy through animal metaphors.",
      example_fr: "Maus d'Art Spiegelman est un roman graphique primé et stimulant qui dépeint la tragédie historique par des métaphores animales.",
      tip: "Indispensable pour l'analyse littéraire et stylistique au lycée.",
      level_focus: "Adjectifs composés à trait d'union (compound adjectives)."
    },
    vocab: [
      ["graphic novel", "/ˈɡræfɪk ˈnɒvl/", "Noun", "le roman graphique", "Graphic novels tackle complex social issues with visual maturity.", "Les romans graphiques abordent des sujets avec maturité visuelle."],
      ["panel", "/ˈpænl/", "Noun", "la vignette / case de bande dessinée", "The illustrator altered the panel borders to convey claustrophobia.", "L'illustrateur a resserré les cases pour suggérer la claustrophobie."],
      ["gutter", "/ˈɡʌtər/", "Noun", "l'intercase / le blanc entre les cases", "The reader's imagination bridges narrative gaps across the gutter.", "L'imagination du lecteur franchit les ellipses dans l'intercase."],
      ["speech bubble", "/spiːtʃ ˈbʌbl/", "Noun", "la bulle de dialogue / le phylactère", "Jagged speech bubbles indicate shouting or panic.", "Des bulles déchiquetées indiquent le cri ou la panique."],
      ["thought-provoking", "/ˈθɔːt prəˈvoʊkɪŋ/", "Adjective", "qui fait réfléchir / stimulant", "Marjane Satrapi's Persepolis is a thought-provoking autobiography.", "Persepolis de Satrapi est une autobiographie stimulante."],
      ["metaphor", "/ˈmɛtəfər/", "Noun", "la métaphore", "Depicting humans as mice is a striking visual metaphor.", "Représenter les humains en souris est une métaphore visuelle saisissante."],
      ["caption", "/ˈkæpʃn/", "Noun", "le récitatif / cartouche narratif", "The narrator's voice unfolds in rectangular top captions.", "La voix du narrateur se déploie dans des cartouches rectangulaires."],
      ["illustrator", "/ˈɪləstreɪtər/", "Noun", "l'illustrateur / dessinateur", "The illustrator chose stark black-and-white ink drawings.", "L'illustrateur a opté pour un dessin à l'encre noir et blanc épuré."],
      ["perspective", "/pərˈspɛktɪv/", "Noun", "la perspective / l'angle de vue", "A bird's-eye perspective emphasizes the city's vast isolation.", "Une vue en plongée souligne l'isolement dans la ville."],
      ["narrative", "/ˈnærətɪv/", "Noun", "le récit / la trame narrative", "A multilayered narrative combines text and visual subtext.", "Un récit à plusieurs niveaux allie texte et sous-texte visuel."]
    ],
    dialogue: {
      title: "En cours de littérature anglophone", setting: "Des élèves analysent la structure de Maus de Spiegelman.",
      lines: [
        ["Teacher", "Notice how the artist uses the gutter between panels to create dramatic pauses.", "Remarquez comment l'artiste utilise l'intercase pour créer des pauses dramatiques."],
        ["Student", "It is an incredibly thought-provoking graphic novel because words and images complete each other.", "C'est un roman graphique stimulant car mots et images se complètent mutuellement."],
        ["Teacher", "Why did the author use animal metaphors rather than realistic portraits?", "Pourquoi l'auteur a-t-il utilisé des métaphores animales plutôt que des portraits réalistes ?"],
        ["Student", "To deconstruct racial prejudice and reveal the psychological reality of historical persecution.", "Pour déconstruire les préjugés et révéler la réalité psychologique de la persécution."]
      ]
    },
    dictation: { prompt: "Graphic novels use visual metaphors to tell thought-provoking stories.", fr: "Les romans graphiques utilisent des métaphores visuelles pour raconter des histoires stimulantes." },
    quiz: [
      { q: "Comment appelle-t-on l'espace blanc entre les cases d'une bande dessinée ?", opts: ["The panel", "The gutter", "The bubble", "The caption"], a: 1, exp: "En bande dessinée anglophone, l'espace entre deux cases s'appelle 'the gutter'." },
      { q: "Quel adjectif composé signifie 'qui pousse à la réflexion' ?", opts: ["Thought-provoking", "Eye-catching", "Fast-moving", "Hard-working"], a: 0, exp: "'Thought-provoking' qualifie une œuvre ou un argument qui stimule la réflexion." },
      { q: "Quel roman graphique d'Art Spiegelman a reçu le prix Pulitzer en 1992 ?", opts: ["Watchmen", "Maus", "Persepolis", "Sandman"], a: 1, exp: "'Maus' d'Art Spiegelman est le premier roman graphique récompensé par un prix Pulitzer spécial." }
    ]
  },
  {
    grade: '2nde', theme_id: 'sport', num: 2,
    title: 'Le rugby & l\'esprit du Tournoi des Six Nations',
    title_en: 'Rugby Values & Six Nations Spirit',
    objective: 'Parler d\'esprit d\'équipe, de respect de l\'adversaire et de tactique dans le rugby anglo-saxon.',
    grammar: {
      title: "Les propositions infinitives de but avec SO AS TO / SO AS NOT TO",
      rule: "On utilise 'so as to + base verbale' (forme plus soutenue que in order to) pour exprimer le but, et 'so as not to' pour éviter une conséquence négative.",
      example_en: "Players tackle strictly below the shoulders so as not to injure the opposing ball carrier.",
      example_fr: "Les joueurs plaquent strictement sous les épaules de manière à ne pas blesser le porteur de balle adverse.",
      tip: "So as NOT to + base verbale (ne séparez pas le 'not' de l'infinitif).",
      level_focus: "Connecteurs de finalité soutenue (so as to / so as not to)."
    },
    vocab: [
      ["Six Nations", "/sɪks ˈneɪʃnz/", "Noun", "le Tournoi des Six Nations", "The Six Nations championship pits historic European rugby rivals.", "Le Tournoi des Six Nations oppose les rivaux historiques européens."],
      ["scrum", "/skrʌm/", "Noun", "la mêlée ordonnée", "Forwards bind tightly together in the powerful scrum.", "Les avants se lient solidement dans la mêlée puissante."],
      ["try", "/traɪ/", "Noun", "l'essai (marquage de 5 points)", "The wing sprinted along the touchline to ground a spectacular try.", "L'ailier a sprinté le long de la ligne pour aplatir un bel essai."],
      ["sportsmanship", "/ˈspɔːrtsmənʃɪp/", "Noun", "l'esprit sportif et courtoisie", "Rugby is famed for mutual respect and exemplary sportsmanship.", "Le rugby est renommé pour son esprit sportif exemplaire."],
      ["referee respect", "/ˌrɛfəˈriː rɪˈspɛkt/", "Noun", "le respect scrupuleux de l'arbitre", "Only the captain speaks to the referee with absolute respect.", "Seul le capitaine s'adresse à l'arbitre avec un respect absolu."],
      ["tackle", "/ˈtækl/", "Verb", "plaquer un adversaire", "Tackle low around the hips to stop the opposing runner.", "Plaque bas aux hanches pour stopper le coureur adverse."],
      ["oval ball", "/ˈoʊvl bɔːl/", "Noun", "le ballon ovale", "Passing the oval ball backwards is an unbreakable rugby rule.", "Passer le ballon ovale en arrière est une règle inviolable."],
      ["conversion", "/kənˈvɜːrʒn/", "Noun", "la transformation d'essai", "The fly-half kicked the conversion between the upright posts.", "Le demi d'ouverture a botté la transformation entre les poteaux."],
      ["solidarity", "/ˌsɒlɪˈdærəti/", "Noun", "la solidarité sur le pré", "Forward pack solidarity withstands the strongest pressure.", "La solidarité du pack d'avants résiste aux plus fortes pressions."],
      ["anthem", "/ˈænθəm/", "Noun", "l'hymne national", "Singing Flower of Scotland at Murrayfield stirs deep emotions.", "Chanter Flower of Scotland à Murrayfield suscite une vive émotion."]
    ],
    dialogue: {
      title: "Après un match à Twickenham", setting: "Deux supporters analysent les traditions d'après-match.",
      lines: [
        ["Supporter A", "Did you see how players formed a guard of honour to clap their opponents off the pitch?", "As-tu vu comment les joueurs ont formé une haie d'honneur pour applaudir leurs adversaires ?"],
        ["Supporter B", "Yes, they battle fiercely for eighty minutes so as to win, but respect remains sacred.", "Oui, ils luttent âprement pendant quatre-vingts minutes, mais le respect reste sacré."],
        ["Supporter A", "And afterwards, both teams share dinner in the famous 'third half'.", "Et après, les deux équipes partagent le repas dans la fameuse 'troisième mi-temps'."],
        ["Supporter B", "That tradition of fellowship defines the very soul of international rugby.", "Cette tradition de fraternité définit l'âme même du rugby international."]
      ]
    },
    dictation: { prompt: "Players tackled low so as not to injure the opponent.", fr: "Les joueurs ont plaqué bas afin de ne pas blesser l'adversaire." },
    quiz: [
      { q: "Quelle formulation négative correcte exprime 'afin de ne pas' ?", opts: ["So as not to", "In order to not", "So that not to", "For not to"], a: 0, exp: "'So as not to + base verbale' est la formulation soutenue consacrée." },
      { q: "Dans quelle direction doit impérativement aller une passe à la main au rugby ?", opts: ["Vers l'avant", "Vers l'arrière ou sur la même ligne", "Au-dessus de la tête", "N'importe où"], a: 1, exp: "Au rugby, toute passe à la main doit impérativement être faite vers l'arrière." },
      { q: "Comment appelle-t-on le stade emblématique du rugby anglais à Londres ?", opts: ["Wembley", "Twickenham", "Old Trafford", "Anfield"], a: 1, exp: "Twickenham est le temple historique du rugby anglais." }
    ]
  },
  {
    grade: '2nde', theme_id: 'sport', num: 3,
    title: 'Sommeil, récupération & performance athlétique',
    title_en: 'Sleep Science & Athletic Recovery',
    objective: 'Analyser la physiologie du sommeil et la récupération sportive avec les subordonnées temporelles (WHENEVER, AS LONG AS).',
    grammar: {
      title: "Les conditions permissives avec AS LONG AS et PROVIDED THAT",
      rule: "On utilise 'as long as' ou 'provided that' pour exprimer une condition nécessaire : As long as athletes sleep eight hours, their muscular recovery proceeds optimally.",
      example_en: "Muscles will rebuild efficiently provided that athletes respect deep sleep circadian rhythms.",
      example_fr: "Les muscles se reconstruiront efficacement à condition que les athlètes respectent les rythmes profonds du sommeil.",
      tip: "Structure équivalente à IF mais avec une insistance sur la condition préalable obligatoire.",
      level_focus: "Conjonctions de condition préalable (as long as, provided that)."
    },
    vocab: [
      ["circadian rhythm", "/sɜːrˈkeɪdiən ˈrɪðəm/", "Noun", "le rythme circadien (cycle biologique jour/nuit)", "Disrupting circadian rhythms harms athletic peak performance.", "Perturber les rythmes circadiens nuit à la performance athlétique."],
      ["deep sleep", "/diːp sliːp/", "Noun", "le sommeil profond réparateur", "Growth hormone is released primarily during slow-wave deep sleep.", "L'hormone de croissance est sécrétée pendant le sommeil profond."],
      ["recovery", "/rɪˈkʌvəri/", "Noun", "la récupération physiologique", "Cold-water immersion and sleep accelerate muscular recovery.", "Bains froids et sommeil accélèrent la récupération musculaire."],
      ["peak performance", "/piːk pərˈfɔːrməns/", "Noun", "le pic de forme / niveau optimal", "Elite sprinters schedule workouts to align with peak performance hours.", "Les sprinteurs s'entraînent aux heures de pic de forme."],
      ["sleep deprivation", "/sliːp ˌdɛprɪˈveɪʃn/", "Noun", "le manque de sommeil chronique", "Sleep deprivation impairs reaction times and increases injury risks.", "Le manque de sommeil dégrade les réflexes et accroît les blessures."],
      ["muscular repair", "/ˈmʌskjələr rɪˈpɛər/", "Noun", "la réparation musculaire", "Cellular protein synthesis drives nocturnal muscular repair.", "La synthèse des protéines nocturne répare les muscles."],
      ["melatonin", "/ˌmɛləˈtoʊnɪn/", "Noun", "la mélatonine (hormone du sommeil)", "Blue screens suppress the natural secretion of melatonin.", "Les écrans bleus bloquent la sécrétion de mélatonine."],
      ["restful", "/ˈrɛstfl/", "Adjective", "réparateur / reposant", "A cool dark bedroom ensures a deeply restful night.", "Une chambre fraîche et obscure garantit une nuit réparatrice."],
      ["endurance", "/ɪnˈdʊərəns/", "Noun", "l'endurance aérobie", "Rest days are as vital for endurance as heavy training.", "Les jours de repos sont aussi vitaux que l'entraînement."],
      ["vitality", "/vaɪˈtæləti/", "Noun", "la vitalité physique", "Consistent sleep restores mental clarity and athletic vitality.", "Un sommeil régulier restaure la lucidité et la vitalité."]
    ],
    dialogue: {
      title: "Conseils du préparateur physique", setting: "Un entraîneur olympique échange avec une nageuse de haut niveau.",
      lines: [
        ["Coach", "You can train twice a day, as long as you log at least nine hours of quality sleep.", "Tu peux t'entraîner deux fois par jour, à condition de faire neuf heures de bon sommeil."],
        ["Athlete", "Should I avoid looking at my smartphone before turning off the lights?", "Dois-je éviter de regarder mon smartphone avant d'éteindre la lumière ?"],
        ["Coach", "Absolutely. Blue light tricks your brain into thinking it is still daytime, blocking melatonin.", "Absolument. La lumière bleue trompe ton cerveau et bloque la mélatonine."],
        ["Athlete", "Provided that I sleep deeply, my muscles will recover from yesterday's hard intervals.", "À condition que je dorme profondément, mes muscles récupéreront des séries d'hier."]
      ]
    },
    dictation: { prompt: "Athletes recover fast as long as they respect deep sleep.", fr: "Les athlètes récupèrent vite tant qu'ils respectent le sommeil profond." },
    quiz: [
      { q: "Quelle conjonction exprime 'à condition que' / 'tant que' ?", opts: ["As long as", "Although", "Whereas", "Unless"], a: 0, exp: "'As long as' (ou 'provided that') signifie 'à condition que' ou 'tant que'." },
      { q: "Quelle hormone régulatrice du sommeil est inhibée par la lumière bleue des écrans ?", opts: ["Adrenaline", "Melatonin", "Insulin", "Cortisol"], a: 1, exp: "La mélatonine, hormone du sommeil, est freinée par la lumière bleue des écrans le soir." },
      { q: "Que signifie 'sleep deprivation' ?", opts: ["Un sommeil profond", "La privation ou manque de sommeil", "Une sieste", "Un réveil matinal"], a: 1, exp: "'Sleep deprivation' désigne le déficit ou la privation de sommeil." }
    ]
  },
  {
    grade: '2nde', theme_id: 'music', num: 2,
    title: 'La révolution de la musique électronique',
    title_en: 'Electronic Music & Synthesizers',
    objective: 'Analyser l\'émergence des synthétiseurs et de la musique assistée par ordinateur avec les structures passives.',
    grammar: {
      title: "La voix passive avec les temps continus (IS BEING PRODUCED / WERE BEING RECORDED)",
      rule: "Pour décrire une transformation technologique ou un processus en plein cours de déroulement : BE + BEING + participe passé.",
      example_en: "New synthesized frequencies were being engineered by avant-garde musicians in Berlin and Detroit.",
      example_fr: "De nouvelles fréquences synthétisées étaient en train d'être conçues par des musiciens d'avant-garde à Berlin et Détroit.",
      tip: "Structure : was/were + being + PP.",
      level_focus: "Passif progressif au passé (past continuous passive)."
    },
    vocab: [
      ["synthesizer", "/ˈsɪnθəsaɪzər/", "Noun", "le synthétiseur analogique ou numérique", "Analog synthesizers generate rich square and sawtooth sound waves.", "Les synthétiseurs analogiques créent de riches ondes sonores."],
      ["techno", "/ˈtɛknoʊ/", "Noun", "la musique techno", "Detroit techno blended futuristic sci-fi themes with robotic funk.", "La techno de Détroit mêlait science-fiction et funk robotique."],
      ["drum machine", "/drʌm məˈʃiːn/", "Noun", "la boîte à rythmes (ex: Roland TR-808)", "The Roland 808 drum machine revolutionized global hip-hop and electronic beats.", "La boîte à rythmes Roland 808 a révolutionné les beats mondiaux."],
      ["loop", "/luːp/", "Noun", "la boucle sonore", "A hypnotic four-bar loop anchors the electronic dance track.", "Une boucle hypnotique de quatre mesures ancre le morceau."],
      ["acoustics", "/əˈkuːstɪks/", "Noun", "l'acoustique / le traitement sonore", "Club sound engineers calibrated the sub-bass acoustics.", "Les ingénieurs du son ont calibré l'acoustique des infrabasses."],
      ["filter", "/ˈfɪltər/", "Noun", "le filtre de fréquences", "Sweeping the low-pass filter creates dramatic build-ups.", "Balayer le filtre passe-bas crée des montées spectaculaires."],
      ["modular", "/ˈmɒdjələr/", "Adjective", "modulaire", "Musicians patch cables across large modular synth walls.", "Les musiciens relient des câbles sur des synthétiseurs modulaires."],
      ["futuristic", "/ˌfjuːtʃəˈrɪstɪk/", "Adjective", "futuriste", "Kraftwerk pioneered a clean, futuristic electronic aesthetic.", "Kraftwerk a initié une esthétique électronique futuriste."],
      ["resonance", "/ˈrɛzənəns/", "Noun", "la résonance acoustique", "Adjusting resonance sharpens the cutoff frequencies.", "Ajuster la résonance affine les fréquences de coupure."],
      ["ambient", "/ˈæmbiənt/", "Adjective", "ambiant / planant", "Ambient music creates immersive soundscapes for meditation.", "La musique ambiante crée des paysages sonores immersifs."]
    ],
    dialogue: {
      title: "Aux origines de la musique électronique", setting: "Des élèves écoutent Autobahn de Kraftwerk.",
      lines: [
        ["Student A", "Was electronic music being created before home computers existed?", "La musique électronique était-elle déjà créée avant les ordinateurs personnels ?"],
        ["Teacher", "Yes, entire albums were being recorded using tape loops and modular analog synthesizers.", "Oui, des albums entiers étaient enregistrés avec des bandes et synthés modulaires."],
        ["Student A", "How did German groups like Kraftwerk influence modern pop?", "Comment les groupes allemands comme Kraftwerk ont-ils influencé la pop moderne ?"],
        ["Teacher", "Their synthesized beats laid the foundations for hip-hop, techno and contemporary pop production.", "Leurs rythmes synthétisés ont posé les fondations du hip-hop, de la techno et de la pop."]
      ]
    },
    dictation: { prompt: "Futuristic tracks were being composed on modular synthesizers.", fr: "Des morceaux futuristes étaient en train d'être composés sur des synthétiseurs modulaires." },
    quiz: [
      { q: "Quelle structure passive au passé continu est correcte ?", opts: ["Tracks were composed", "Tracks were being composed", "Tracks had been composing", "Tracks are being compose"], a: 1, exp: "Le passif au passé continu s'écrit 'were being + participe passé'." },
      { q: "Quelle célèbre boîte à rythmes japonaise créée en 1980 a révolutionné les basses du hip-hop et de l'électro ?", opts: ["Roland TR-808", "Yamaha DX7", "Moog Voyager", "Fender Stratocaster"], a: 0, exp: "La Roland TR-808 est la boîte à rythmes légendaire de la musique urbaine et électro." },
      { q: "Quel groupe pionnier de Düsseldorf en Allemagne a popularisé l'électro en 1974 avec 'Autobahn' ?", opts: ["Daft Punk", "Kraftwerk", "The Prodigy", "Depeche Mode"], a: 1, exp: "Kraftwerk est considéré comme le groupe fondateur de la pop électronique moderne." }
    ]
  },
  {
    grade: '2nde', theme_id: 'music', num: 3,
    title: 'L\'art de l\'opéra & chant lyrique',
    title_en: 'Opera Masterpieces & Vocal Art',
    objective: 'Analyser la dramaturgie de l\'opéra, les livrets et les tessitures vocales avec le discours indirect complexe.',
    grammar: {
      title: "Les verbes de déclaration nuancés au discours rapporté (CLAIM, ADMIT, EXPLAIN, EMPHASIZE)",
      rule: "Au lycée, on remplace 'say' ou 'tell' par des verbes introducteurs précis : The musicologist claimed that opera was the ultimate synthesis of all arts.",
      example_en: "Critics emphasized that the soprano's emotional range had captivated the entire auditorium.",
      example_fr: "Les critiques ont souligné que l'étendue émotionnelle de la soprano avait captivé tout l'auditorium.",
      tip: "Utilisez ces verbes pour donner de l'autorité à vos rédactions d'anglais.",
      level_focus: "Verbes de rapport avancés (emphasize, assert, acknowledge, claim)."
    },
    vocab: [
      ["opera house", "/ˈɒprə haʊs/", "Noun", "la maison d'opéra (Covent Garden, La Scala)", "London's Royal Opera House stages world-class productions.", "Le Royal Opera House de Londres monte des productions de classe mondiale."],
      ["aria", "/ˈɑːriə/", "Noun", "l'air d'opéra (solo lyrique)", "The tragic aria conveyed profound sorrow and longing.", "L'air tragique transmettait une profonde tristesse."],
      ["soprano", "/səˈprɑːnoʊ/", "Noun", "la soprano (voix aiguë féminine)", "The soprano reached high C with breathtaking clarity.", "La soprano a atteint le contre-ut avec une clarté époustouflante."],
      ["libretto", "/lɪˈbrɛtoʊ/", "Noun", "le livret d'opéra (texte poétique)", "The poet crafted an Italian libretto based on Shakespeare.", "Le poète a composé un livret italien d'après Shakespeare."],
      ["tenor", "/ˈtɛnər/", "Noun", "le ténor (voix aiguë masculine)", "Pavarotti was arguably the most famous tenor of the 20th century.", "Pavarotti fut sans doute le ténor le plus célèbre du 20e siècle."],
      ["dramatic staging", "/drəˈmætɪk ˈsteɪdʒɪŋ/", "Noun", "la mise en scène dramatique", "Modern dramatic staging reimagines classic operatic plots.", "La mise en scène contemporaine réinvente les intrigues d'opéra."],
      ["overture", "/ˈoʊvərtʃʊər/", "Noun", "l'ouverture orchestrale", "The brass and strings overture introduces leitmotifs.", "L'ouverture aux cuivres et cordes introduit les leitmotive."],
      ["acoustics", "/əˈkuːstɪks/", "Noun", "l'acoustique de la salle", "Natural hall acoustics amplify human voices without microphones.", "L'acoustique naturelle amplifie les voix sans micro."],
      ["virtuosity", "/ˌvɜːrtʃuˈɒsəti/", "Noun", "la virtuosité vocale", "Singing bel canto requires extraordinary vocal virtuosity.", "Chanter le bel canto exige une virtuosité vocale extraordinaire."],
      ["emotion", "/ɪˈmoʊʃn/", "Noun", "l'émotion scénique", "Opera merges music, poetry and drama into pure human emotion.", "L'opéra fusionne musique, poésie et théâtre en pure émotion."]
    ],
    dialogue: {
      title: "Au Royal Opera House de Londres", setting: "Des lycéens assistent à une répétition générale.",
      lines: [
        ["Teacher", "Notice that opera singers perform without any electronic amplification.", "Remarquez que les chanteurs d'opéra chantent sans aucune amplification électronique."],
        ["Student", "How can the soprano's voice soar above ninety orchestra musicians?", "Comment la voix de la soprano peut-elle s'élever au-dessus de quatre-vingt-dix musiciens ?"],
        ["Teacher", "Vocal training focuses sound into acoustic frequencies that slice through orchestra resonance.", "L'entraînement concentre le son sur des fréquences qui percent la résonance orchestrale."],
        ["Student", "That explains why the libretto and music feel so physically overwhelming.", "Cela explique pourquoi le livret et la musique sont si prenants physiquement."]
      ]
    },
    dictation: { prompt: "The soprano's aria soared without any electronic amplification.", fr: "L'air de la soprano s'est élevé sans aucune amplification électronique." },
    quiz: [
      { q: "Quel mot désigne le texte poétique écrit d'un opéra ?", opts: ["The script", "The libretto", "The subtitle", "The lyric sheet"], a: 1, exp: "Le 'libretto' (livret) est le texte poétique dramatique mis en musique dans l'opéra." },
      { q: "Quelle voix lyrique féminine possède le registre le plus aigu ?", opts: ["Alto", "Mezzo-soprano", "Soprano", "Contralto"], a: 2, exp: "La voix de 'soprano' est la tessiture la plus aiguë chez les femmes." },
      { q: "Quelle salle d'opéra londonienne historique se trouve à Covent Garden ?", opts: ["The Globe", "The Royal Opera House", "The Palladium", "The Barbican"], a: 1, exp: "Le Royal Opera House (Covent Garden) est la grande scène lyrique de Londres." }
    ]
  },
  {
    grade: '2nde', theme_id: 'restaurant', num: 2,
    title: 'Gastronomie moléculaire & avant-garde',
    title_en: 'Molecular Gastronomy & Chemistry',
    objective: 'Découvrir la gastronomie moléculaire (Heston Blumenthal) avec les structures causatives (HAVE / GET SOMETHING DONE).',
    grammar: {
      title: "La structure causative passive (HAVE / GET SOMETHING DONE)",
      rule: "On utilise 'have + objet + participe passé' lorsqu'on fait exécuter une action par un professionnel ou par un procédé technique.",
      example_en: "Chef Heston Blumenthal had liquid nitrogen delivered to freeze ice cream instantly.",
      example_fr: "Le chef Heston Blumenthal s'est fait livrer de l'azote liquide pour glacer les crèmes instantanément.",
      tip: "Structure : HAVE + nom + participe passé (She had her menu redesigned).",
      level_focus: "Structures causatives passives (have/get sth done)."
    },
    vocab: [
      ["molecular gastronomy", "/məˈlɛkjələr ɡæˈstrɒnəmi/", "Noun", "la gastronomie moléculaire", "Molecular gastronomy applies physics and chemistry to culinary arts.", "La gastronomie moléculaire applique la physique et la chimie à la cuisine."],
      ["liquid nitrogen", "/ˈlɪkwɪd ˈnaɪtrədʒən/", "Noun", "l'azote liquide (-196°C)", "Liquid nitrogen freezes savory mousses in three seconds.", "L'azote liquide congèle les mousses salées en trois secondes."],
      ["spherification", "/ˌsfɪərɪfɪˈkeɪʃn/", "Noun", "la sphérification (billes de saveur)", "Alginate bath spherification creates pearls of balsamic vinegar.", "La sphérification crée des perles de vinaigre balsamique."],
      ["texture", "/ˈtɛkstʃər/", "Noun", "la texture contrastée", "The dish juxtaposes hot crunchy foam and icy smooth coulis.", "Le plat juxtapose écume chaude et coulis glacé."],
      ["culinary experiment", "/ˈkʌlɪnəri ɪkˈspɛrɪmənt/", "Noun", "l'expérimentation culinaire", "Chefs conduct rigorous culinary experiments in kitchen laboratories.", "Les chefs mènent des expérimentations rigoureuses en cuisine-laboratoire."],
      ["foam", "/foʊm/", "Noun", "l'émulsion / l'écume culinaire", "A citrus foam enhances the grilled scallops.", "Une écume d'agrumes sublime les noix de Saint-Jacques."],
      ["sensory", "/ˈsɛnsəri/", "Adjective", "sensoriel / multisensoriel", "Blumenthal designs multisensory dining with soundscapes.", "Blumenthal conçoit une gastronomie multisensorielle avec du son."],
      ["avant-garde", "/ˌævɑːŋ ˈɡɑːrd/", "Adjective", "d'avant-garde / pionnier", "The Fat Duck in Bray is famous for avant-garde British cuisine.", "The Fat Duck à Bray est réputé pour sa cuisine britannique d'avant-garde."],
      ["ingredient", "/ɪnˈɡriːdiənt/", "Noun", "l'ingrédient chimique ou naturel", "Natural agar-agar gels replace animal gelatin.", "Les gels d'agar-agar remplacent la gélatine animale."],
      ["deconstruct", "/ˌdiːkənˈstrʌkt/", "Verb", "déstructurer un plat traditionnel", "Chefs deconstruct the classic Black Forest cake into edible crystals.", "Les chefs déstructurent la Forêt-Noire en cristaux comestibles."]
    ],
    dialogue: {
      title: "Expérience culinaire au restaurant The Fat Duck", setting: "Des élèves de lycée commentent le travail d'Heston Blumenthal.",
      lines: [
        ["Student A", "Did you know the chef has sea sounds played through seashells while guests eat oysters?", "Savais-tu que le chef fait écouter des bruits de mer dans des coquillages pendant que les clients mangent des huîtres ?"],
        ["Student B", "Yes! He had scientific research conducted to prove that audio frequencies alter taste perception.", "Oui ! Il a fait mener des recherches scientifiques pour prouver que le son modifie le goût."],
        ["Student A", "His famous snail porridge was deconstructed using molecular chemistry.", "Son célèbre porridge d'escargots a été déstructuré grâce à la chimie moléculaire."],
        ["Student B", "It transforms fine dining into a thought-provoking artistic performance.", "Cela transforme la gastronomie en une performance artistique stimulante."]
      ]
    },
    dictation: { prompt: "The chef had innovative research conducted on sensory taste.", fr: "Le chef a fait mener des recherches innovantes sur le goût sensoriel." },
    quiz: [
      { q: "Quelle structure exprime le fait de faire faire quelque chose par autrui ?", opts: ["Have sth done", "Make sth to do", "Do sth have", "Get do sth"], a: 0, exp: "'Have something done' exprime le fait de faire réaliser une action par un tiers." },
      { q: "Quel grand chef britannique triplement étoilé a popularisé la cuisine multisensorielle au 'Fat Duck' ?", opts: ["Gordon Ramsay", "Jamie Oliver", "Heston Blumenthal", "Nigella Lawson"], a: 2, exp: "Heston Blumenthal est le pionnier britannique mondial de la cuisine moléculaire et sensorielle." },
      { q: "Que produit la technique de la 'spherification' ?", opts: ["De la mousse", "Des perles liquides enveloppées d'une fine pellicule gélifiée", "De la pâte feuilletée", "De la viande séchée"], a: 1, exp: "La sphérification encapsule des liquides sous forme de perles semblables au caviar." }
    ]
  },
  {
    grade: '2nde', theme_id: 'restaurant', num: 3,
    title: 'L\'art du sommelier & œnologie raffinée',
    title_en: 'Wine Tasting & Sommelier Etiquette',
    objective: 'Parler d\'œnologie, de terroir et d\'accords mets et vins avec le vocabulaire de la dégustation.',
    grammar: {
      title: "Les verbes de perception suivis d'adjectifs (SMELL, TASTE, LOOK, FEEL)",
      rule: "En anglais, les verbes de perception involontaire (taste, smell, look, sound, feel) sont suivis d'un ADJECTIF, et non d'un adverbe : This vintage smells aromatic / It tastes delicious.",
      example_en: "The vintage red wine tastes velvety and smells subtly of oak and blackberries.",
      example_fr: "Le vin rouge millésimé a un goût velouté et sent subtilement le chêne et les mûres.",
      tip: "Attention : It tastes good (et non 'it tastes well').",
      level_focus: "Verbes de perception sensorielle + adjectif qualificatif."
    },
    vocab: [
      ["sommelier", "/səˈmɛljeɪ/", "Noun", "le sommelier / maître d'œnologie", "The knowledgeable sommelier suggested an English sparkling wine.", "L'érudit sommelier a suggéré un vin pétillant anglais."],
      ["vintage", "/ˈvɪntɪdʒ/", "Noun", "le millésime / la cuvée d'exception", "A warm summer produced a legendary 2018 vintage.", "Un été chaud a produit un millésime 2018 légendaire."],
      ["pairing", "/ˈpɛərɪŋ/", "Noun", "l'accord mets et vins", "The sommelier mastered pairings between cheese and cider.", "Le sommelier maîtrisait les accords fromages et cidres."],
      ["terroir", "/tɛrˈwɑːr/", "Noun", "le terroir / climat viticole", "Chalky Sussex soil provides a unique cool-climate terroir.", "Le sol crayeux du Sussex offre un terroir unique."],
      ["aroma", "/əˈroʊmə/", "Noun", "l'arôme / le bouquet aromatique", "Swirl the glass gently to release fruity aromas.", "Faites tourner le verre pour libérer les arômes."],
      ["tasting", "/ˈteɪstɪŋ/", "Noun", "la séance de dégustation", "A blind tasting trains the palate to recognize grape varieties.", "Une dégustation à l'aveugle entraîne le palais aux cépages."],
      ["velvety", "/ˈvɛlvəti/", "Adjective", "velouté / soyeux", "Mature tannins make the red wine remarkably velvety.", "Des tanins mûrs rendent le vin rouge remarquablement soyeux."],
      ["sparkling wine", "/ˈspɑːrklɪŋ waɪn/", "Noun", "le vin pétillant / effervescent", "English sparkling wines have rivalled Champagne in blind competitions.", "Les vins effervescents anglais rivalisent avec le champagne."],
      ["cellar", "/ˈsɛlər/", "Noun", "la cave de vieillissement", "Oak barrels age silently inside the temperature-controlled cellar.", "Des fûts de chêne vieillissent en cave régulée."],
      ["palate", "/ˈpælət/", "Noun", "le palais / discernement gustatif", "Cleansing your palate with water preserves sensory accuracy.", "Rincer son palais avec de l'eau préserve la précision sensorielle."]
    ],
    dialogue: {
      title: "Visite d'un vignoble du Sussex", setting: "Des étudiants visitent un domaine viticole réputé au sud de l'Angleterre.",
      lines: [
        ["Sommelier", "Notice the pale golden bubbles in this English sparkling wine.", "Remarquez les bulles dorées pâles de ce vin effervescent anglais."],
        ["Student", "It smells fresh of green apples and brioche. How does the soil affect it?", "Il sent la pomme verte et la brioche fraîche. Comment le sol influe-t-il ?"],
        ["Sommelier", "The chalk hills are identical to the Champagne basin; therefore, the wine tastes crisp and mineral.", "Les collines de craie sont identiques au bassin champenois ; ainsi, le vin a un goût minéral."],
        ["Student", "British vineyards have benefited significantly from warmer summers.", "Les vignobles britanniques ont nettement bénéficié d'étés plus doux."]
      ]
    },
    dictation: { prompt: "The mature wine smells aromatic and tastes wonderfully velvety.", fr: "Le vin mûr a une odeur aromatique et un goût merveilleusement velouté." },
    quiz: [
      { q: "Quelle forme suit les verbes de perception comme 'taste', 'smell', 'look' ?", opts: ["Un adverbe en -ly", "Un adjectif qualificatif", "Un verbe en -ing", "Un nom pluriel"], a: 1, exp: "Les verbes de perception sont suivis d'un adjectif : It smells aromatic (et non aromatically)." },
      { q: "Quelle région du sud de l'Angleterre est réputée pour ses vins effervescents sur sol de craie ?", opts: ["Sussex & Kent", "The Scottish Highlands", "Cornwall", "Liverpool"], a: 0, exp: "Le Sussex et le Kent possèdent des sols crayeux similaires à la Champagne." },
      { q: "Que désigne un 'sommelier' dans la haute restauration ?", opts: ["Un plongeur", "Le professionnel expert en vins et accords mets-boissons", "Un fabricant de verres", "Le caissier"], a: 1, exp: "Le sommelier est le spécialiste responsable des caves et du conseil en accords mets-vins." }
    ]
  },
  {
    grade: '2nde', theme_id: 'food', num: 2,
    title: 'Sécurité alimentaire & chaînes mondiales',
    title_en: 'Global Food Security & Supply Chains',
    objective: 'Analyser la vulnérabilité des chaînes d\'approvisionnement alimentaire et les pénuries avec les subordonnées de concession.',
    grammar: {
      title: "L'expression de la concession contrastée avec EVEN IF et EVEN THOUGH",
      rule: "Attention à la nuance : 'EVEN THOUGH' constate un fait réel (Même s'il est vrai que...), alors que 'EVEN IF' pose une hypothèse incertaine (Même si cela arrivait...).",
      example_en: "Even though global agriculture produces enough grain, unequal distribution leaves millions vulnerable to food shortages.",
      example_fr: "Même si l'agriculture mondiale produit assez de céréales, une distribution inégale laisse des millions de personnes vulnérables.",
      tip: "Even though = fact / Even if = hypothetical supposition.",
      level_focus: "Concession avancée (even though vs even if)."
    },
    vocab: [
      ["food security", "/fuːd sɪˈkjʊərəti/", "Noun", "la sécurité alimentaire mondiale", "Climate volatility threatens long-term food security.", "L'instabilité climatique menace la sécurité alimentaire."],
      ["supply chain", "/səˈplaɪ tʃeɪn/", "Noun", "la chaîne d'approvisionnement", "Global supply chains broke down during maritime container bottlenecks.", "Les chaînes d'approvisionnement se sont rompues."],
      ["shortage", "/ˈʃɔːrtɪdʒ/", "Noun", "la pénurie / le manque de denrées", "Severe drought induced acute wheat and corn shortages.", "Une grave sécheresse a entraîné d'aiguës pénuries de blé."],
      ["famine", "/ˈfæmɪn/", "Noun", "la famine", "International aid corridors prevent widespread famine.", "Des couloirs d'aide internationale évitent la famine généralisée."],
      ["crops", "/krɒps/", "Noun", "les cultures agricoles / récoltes", "Extreme heatwaves devastated harvest yields for essential crops.", "Des canicules ont dévasté les rendements des récoltes."],
      ["vulnerable", "/ˈvʌlnərəbl/", "Adjective", "vulnérable / exposé", "Landlocked developing nations are vulnerable to price inflation.", "Les pays enclavés sont vulnérables à l'inflation des prix."],
      ["distribution", "/ˌdɪstrɪˈbjuːʃn/", "Noun", "la distribution et répartition", "Efficient distribution prevents edible grain from rotting in ports.", "Une distribution efficace évite que les grains pourrissent."],
      ["grain silo", "/ɡreɪn ˈsaɪloʊ/", "Noun", "le silo à grains", "Strategic grain silos buffer against unforeseen geopolitical shocks.", "Des silos à grains stratégiques protègent des chocs géopolitiques."],
      ["harvest", "/ˈhɑːrvɪst/", "Noun", "la moisson / récolte", "Late frost ruined the spring fruit harvest across Europe.", "Le gel tardif a ruiné la récolte fruitière en Europe."],
      ["resilience", "/rɪˈzɪliəns/", "Noun", "la résilience alimentaire", "Diversifying local crops strengthens national agricultural resilience.", "Diversifier les cultures renforce la résilience agricole."]
    ],
    dialogue: {
      title: "Conférence sur la sécurité alimentaire", setting: "Des lycéens assistent à un forum de l'ONU pour l'alimentation.",
      lines: [
        ["Speaker", "Even though the planet produces enough calories, one third of food is lost across fragile supply chains.", "Même si la planète produit assez de calories, un tiers de la nourriture est perdu."],
        ["Delegate", "How do geopolitical conflicts amplify regional grain shortages?", "Comment les conflits géopolitiques amplifient-ils les pénuries de céréales ?"],
        ["Speaker", "When shipping lanes close, grain silos cannot export wheat to drought-affected regions.", "Quand les routes maritimes ferment, les silos ne peuvent exporter le blé."],
        ["Delegate", "Building regional food reserves is vital to protect vulnerable populations.", "Constituer des réserves régionales est vital pour protéger les populations vulnérables."]
      ]
    },
    dictation: { prompt: "Even though grain is plentiful, supply chains face severe bottlenecks.", fr: "Même si les céréales sont abondantes, les chaînes d'approvisionnement font face à des goulots d'étranglement." },
    quiz: [
      { q: "Quelle nuance distingue 'even though' de 'even if' ?", opts: ["Aucune", "'Even though' porte sur un fait avéré, 'even if' sur une hypothèse", "'Even if' est toujours au passé", "'Even though' est familier"], a: 1, exp: "'Even though' constate un fait réel, tandis que 'even if' introduit une hypothèse ('même si c'était le cas')." },
      { q: "Que signifie 'food security' ?", opts: ["Le contrôle de police sanitaire", "La garantie pour tous d'un accès suffisant à une nourriture saine", "Le cadenas du frigo", "Les dates de péremption"], a: 1, exp: "'Food security' désigne l'accès matériel, économique et régulier à une alimentation suffisante." },
      { q: "Que désigne une 'supply chain' dans le commerce mondial ?", opts: ["Une chaîne en métal", "L'ensemble de la chaîne logistique de production et d'approvisionnement", "Un magasin", "Un silo"], a: 1, exp: "'Supply chain' désigne la chaîne logistique globale depuis le producteur jusqu'au consommateur." }
    ]
  },
  {
    grade: '2nde', theme_id: 'work', num: 2,
    title: 'Diversité & égalité en milieu professionnel',
    title_en: 'Workplace Diversity & Gender Equality',
    objective: 'Parler de mixité, d\'égalité salariale et de méritocratie en entreprise.',
    grammar: {
      title: "Les adjectifs composés avec des adverbes (well-paid, widely-respected, poorly-represented)",
      rule: "On forme des qualifications précises en combinant un adverbe et un participe passé : a well-paid career, widely-respected policies, poorly-represented communities.",
      example_en: "Progressive companies ensure that women and minorities are fairly represented in well-paid leadership positions.",
      example_fr: "Les entreprises progressistes s'assurent que femmes et minorités sont équitablement représentées dans des postes de direction bien rémunérés.",
      tip: "Le trait d'union s'utilise généralement lorsque le composé précède directement le nom.",
      level_focus: "Adjectifs composés (adverb + past participle)."
    },
    vocab: [
      ["diversity", "/daɪˈvɜːrsəti/", "Noun", "la diversité culturelle et humaine", "Workplace diversity stimulates richer creative problem-solving.", "La diversité au travail stimule la résolution créative de problèmes."],
      ["gender equality", "/ˈdʒɛndər iˈkwɒləti/", "Noun", "l'égalité femmes-hommes", "Gender equality requires closing the unjustified gender pay gap.", "L'égalité femmes-hommes exige de combler l'écart salarial."],
      ["pay gap", "/peɪ ɡæp/", "Noun", "l'écart salarial", "Publishing annual pay gap statistics forces transparency.", "Publier les statistiques d'écart salarial impose la transparence."],
      ["meritocracy", "/ˌmɛrɪˈtɒkrəsi/", "Noun", "la méritocratie", "A true meritocracy rewards individual effort regardless of background.", "Une vraie méritocratie récompense l'effort sans distinction d'origine."],
      ["inclusive", "/ɪnˈkluːsɪv/", "Adjective", "inclusif / bienveillant", "Inclusive policies make every team member feel valued.", "Des politiques inclusives permettent à chacun de se sentir valorisé."],
      ["glass ceiling", "/ɡlɑːs ˈsiːlɪŋ/", "Noun", "le plafond de verre (frein invisible)", "Ambitious women fought hard to shatter the invisible glass ceiling.", "Des femmes ambitieuses ont lutté pour briser le plafond de verre."],
      ["boardroom", "/ˈbɔːrdruːm/", "Noun", "la salle du conseil d'administration", "More female leaders sit in FTSE 100 corporate boardrooms.", "Plus de femmes siègent dans les conseils d'administration du FTSE."],
      ["bias", "/ˈbaɪəs/", "Noun", "le biais / préjugé inconscient", "Unconscious bias training opens recruiters' minds.", "La formation aux biais inconscients ouvre l'esprit des recruteurs."],
      ["mentorship", "/ˈmɛntɔːrʃɪp/", "Noun", "le mentorat / tutorat professionnel", "Senior executives offer mentorship to promising apprentices.", "Des cadres expérimentés offrent du mentorat aux apprentis prometteurs."],
      ["empower", "/ɪmˈpaʊər/", "Verb", "donner le pouvoir / valoriser", "Equal opportunities empower diverse talents to thrive.", "L'égalité des chances permet aux talents variés de s'épanouir."]
    ],
    dialogue: {
      title: "Table ronde sur la diversité en entreprise", setting: "Des lycéens interviewent une directrice des ressources humaines.",
      lines: [
        ["Student", "Why is workplace diversity considered an economic asset rather than just a moral duty?", "Pourquoi la diversité est-elle considérée comme un atout économique et non juste un devoir moral ?"],
        ["HR Director", "Because teams with varied backgrounds generate far more innovative ideas and reflect our global customer base.", "Parce que des équipes aux parcours variés génèrent des idées bien plus novatrices."],
        ["Student", "How does your firm tackle the historical gender pay gap?", "Comment votre entreprise s'attaque-t-elle à l'écart salarial femmes-hommes ?"],
        ["HR Director", "We enforce transparent salary grids and provide mentorship so that women shatter the glass ceiling.", "Nous appliquons des grilles salariales transparentes et du mentorat pour briser le plafond de verre."]
      ]
    },
    dictation: { prompt: "Inclusive companies ensure that diverse talents are fairly represented.", fr: "Les entreprises inclusives veillent à ce que les talents variés soient équitablement représentés." },
    quiz: [
      { q: "Que désigne la métaphore sociologique du 'glass ceiling' (plafond de verre) ?", opts: ["Le toit d'un gratte-ciel", "Les barrières invisibles qui freinent l'accès des femmes et minorités aux postes dirigeants", "Une fenêtre de bureau", "Un contrat à durée indéterminée"], a: 1, exp: "Le 'glass ceiling' désigne les obstacles informels empêchant l'ascension aux échelons supérieurs." },
      { q: "Comment qualifie-t-on un emploi bien rémunéré avec un adjectif composé ?", opts: ["A good-pay work", "A well-paid job", "A much-paying post", "A high-pay position"], a: 1, exp: "'Well-paid' (adverbe + participe passé) est la forme consacrée pour bien rémunéré." },
      { q: "Que signifie 'gender pay gap' ?", opts: ["Le temps de pause", "L'écart de salaire entre les femmes et les hommes pour un poste équivalent", "Le congé maternité", "Le remboursement des transports"], a: 1, exp: "'Gender pay gap' est l'écart salarial statistique constaté entre les genres." }
    ]
  },
  {
    grade: '2nde', theme_id: 'work', num: 3,
    title: 'Gestion de projet agile & méthodes modernes',
    title_en: 'Agile Project Management & Sprints',
    objective: "Comprendre l'organisation du travail par sprints et méthodologies agiles en équipe.",
    grammar: {
      title: "L'expression de l'obligation différée avec BE TO + base verbale",
      rule: "Dans un cadre professionnel et contractuel, la structure 'be to + base verbale' exprime un ordre planifié ou une obligation convenue : The team is to deliver the sprint backlog by Friday.",
      example_en: "The developers are to test the software daily so as to prevent regression bugs.",
      example_fr: "Les développeurs doivent tester le logiciel quotidiennement de manière à éviter les bugs de régression.",
      tip: "Structure formelle d'autorité : You ARE TO submit the deliverables before noon.",
      level_focus: "Structure formelle 'be to + infinitive' d'instruction officielle."
    },
    vocab: [
      ["Agile", "/ˈædʒaɪl/", "Adjective", "agile (méthode de gestion souple)", "Agile methodologies adapt to changing client requirements rapidly.", "Les méthodes agiles s'adaptent rapidement aux besoins clients."],
      ["sprint", "/sprɪnt/", "Noun", "le sprint (cycle de travail de 2 semaines)", "Our development team completes two-week intensive sprints.", "Notre équipe de développement accomplit des sprints de deux semaines."],
      ["backlog", "/ˈbækˌlɒɡ/", "Noun", "le carnet de produit / liste de tâches en attente", "Prioritize customer requests in the project backlog.", "Priorise les demandes clients dans le carnet de produit."],
      ["deliverable", "/dɪˈlɪvərəbl/", "Noun", "le livrable / résultat concret à remettre", "The graphic mock-up is the key deliverable for this milestone.", "La maquette graphique est le livrable clé de cette étape."],
      ["stakeholder", "/ˈsteɪkˌhoʊldər/", "Noun", "la partie prenante / personne concernée", "Present prototype findings to company stakeholders.", "Présente les résultats du prototype aux parties prenantes."],
      ["standup meeting", "/ˈstændʌp ˈmiːtɪŋ/", "Noun", "la réunion flash debout quotidienne", "Daily fifteen-minute standup meetings keep everyone aligned.", "Les réunions quotidiennes debout de quinze minutes maintiennent l'alignement."],
      ["milestone", "/ˈmaɪlstoʊn/", "Noun", "le jalon / l'étape clé du projet", "Reaching this technical milestone validates our architecture.", "Franchir ce jalon technique valide notre architecture."],
      ["scrum master", "/skrʌm ˈmɑːstər/", "Noun", "le scrum master / facilitateur d'équipe", "The scrum master clears roadblocks that impede team workflow.", "Le scrum master lève les obstacles entravant le travail."],
      ["workflow", "/ˈwɜːrkfloʊ/", "Noun", "le flux de travail / processus", "Digital Kanban boards optimize team workflow visual clarity.", "Les tableaux numériques Kanban optimisent la lisibilité du flux."],
      ["retrospective", "/ˌrɛtrəˈspɛktɪv/", "Noun", "la rétrospective d'équipe", "Hold a retrospective to evaluate what went well and what can improve.", "Organisez une rétrospective pour voir ce qui peut être amélioré."]
    ],
    dialogue: {
      title: "Réunion de sprint au sein d'une startup", setting: "L'équipe d'ingénieurs démarre son standup matinal.",
      lines: [
        ["Scrum Master", "Good morning team! We are to deliver the beta software version by next Thursday.", "Bonjour l'équipe ! Nous devons livrer la version bêta d'ici jeudi prochain."],
        ["Developer", "I resolved the login interface bug yesterday and I am tackling the database sync today.", "J'ai résolu le bug de connexion hier et je m'attaque à la synchro base aujourd'hui."],
        ["Scrum Master", "Are there any technical impediments blocking your workflow?", "Y a-t-il des obstacles techniques qui bloquent ton flux de travail ?"],
        ["Developer", "None! With our agile standup meetings, we stay focused and transparent.", "Aucun ! Grâce à nos points debout, nous restons concentrés et transparents."]
      ]
    },
    dictation: { prompt: "The engineering team is to complete the sprint deliverables.", fr: "L'équipe d'ingénieurs doit terminer les livrables du sprint." },
    quiz: [
      { q: "Qu'est-ce qu'un 'sprint' dans la méthode de travail Agile ?", opts: ["Une course sur 100 mètres", "Une période de travail courte et concentrée (souvent 1 à 3 semaines)", "Une pause café", "Une rupture de contrat"], a: 1, exp: "Dans le cadre Scrum/Agile, un 'sprint' est une itération de développement de 1 à 4 semaines." },
      { q: "Que signifie 'stakeholder' en gestion de projet ?", opts: ["Un investisseur extérieur uniquement", "Toute partie prenante ou personne impactée par le projet", "Le propriétaire des locaux", "Le chef comptable"], a: 1, exp: "'Stakeholder' désigne toute personne, client ou groupe ayant un intérêt dans le projet." },
      { q: "À quoi sert la 'retrospective' à la fin d'un sprint ?", opts: ["À fêter les vacances", "À analyser collectivement les succès et axes d'amélioration du travail d'équipe", "À licencier un membre", "À recommencer le projet"], a: 1, exp: "La rétrospective permet à l'équipe d'ajuster ses méthodes pour le cycle suivant." }
    ]
  },
  {
    grade: '2nde', theme_id: 'school_social', num: 2,
    title: 'Carrières diplomatiques & affaires internationales',
    title_en: 'Diplomatic Careers & International Affairs',
    objective: 'Comprendre les missions d\'un diplomate et l\'art de la négociation internationale.',
    grammar: {
      title: "L'expression de la diplomatie et du compromis avec les tournures d'atténuation (HEDGING : It would seem that, We might consider)",
      rule: "Dans le langage diplomatique anglo-saxon, on atténue les affirmations catégoriques pour maintenir le dialogue ouvert : It would appear that / We might suggest / It is arguably advisable.",
      example_en: "The ambassador diplomatically suggested that both nations might consider signing a bilateral peace treaty.",
      example_fr: "L'ambassadeur a diplomatiquement suggéré que les deux nations pourraient envisager de signer un traité de paix bilatéral.",
      tip: "Le 'hedging' évite d'imposer son point de vue brutalement.",
      level_focus: "Techniques d'atténuation diplomatique (hedging devices)."
    },
    vocab: [
      ["diplomat", "/ˈdɪpləmæt/", "Noun", "le diplomate", "A diplomat negotiates international agreements with tact and poise.", "Un diplomate négocie des accords internationaux avec tact."],
      ["embassy", "/ˈɛmbəsi/", "Noun", "l'ambassade", "The embassy protects national citizens travelling overseas.", "L'ambassade protège les ressortissants nationaux à l'étranger."],
      ["treaty", "/ˈtriːti/", "Noun", "le traité international", "Signatories ratified the multilateral environmental treaty.", "Les signataires ont ratifié le traité multilatéral sur le climat."],
      ["bilateral", "/ˌbaɪˈlætərəl/", "Adjective", "bilatéral (entre deux États)", "Bilateral trade talks reached an advantageous compromise.", "Des pourparlers commerciaux bilatéraux ont abouti à un compromis."],
      ["negotiation", "/nɪˌɡoʊʃiˈeɪʃn/", "Noun", "la négociation diplomatique", "Skilled negotiation averts armed conflicts and trade wars.", "Une négociation habile évite les conflits armés."],
      ["foreign affairs", "/ˈfɒrɪn əˈfɛərz/", "Noun", "les affaires étrangères / relations extérieures", "Careers in foreign affairs demand fluency in multiple languages.", "Les carrières aux affaires étrangères exigent plusieurs langues."],
      ["protocol", "/ˈproʊtəkɒl/", "Noun", "le protocole diplomatique officiel", "Diplomatic protocol strictly governs state banquets and seated dinners.", "Le protocole régit les banquets d'État."],
      ["ambassador", "/æmˈbæsədər/", "Noun", "l'ambassadeur", "The newly appointed ambassador presented his official credentials.", "L'ambassadeur nouvellement nommé a remis ses lettres de créance."],
      ["tact", "/tækt/", "Noun", "le tact / le sens de la mesure", "Handling delicate territorial disputes requires exceptional tact.", "Gérer de délicats litiges territoriaux exige un tact exceptionnel."],
      ["peacekeeping", "/ˈpiːskiːpɪŋ/", "Noun", "le maintien de la paix", "UN peacekeeping missions safeguard fragile ceasefires.", "Les missions de maintien de la paix de l'ONU veillent aux cessez-le-feu."]
    ],
    dialogue: {
      title: "Simulation d'une session aux Nations Unies (Model UN)", setting: "Des lycéens représentent différents pays lors d'un débat MUN.",
      lines: [
        ["Delegate of Canada", "It would seem advisable that all member states ratify the clean water treaty without delay.", "Il semblerait judicieux que tous les États membres ratifient le traité sur l'eau sans délai."],
        ["Delegate of Japan", "We share that constructive view; might we also propose funding assistance for developing regions?", "Nous partageons cette vue constructive ; pourrions-nous aussi proposer un fonds pour les pays en développement ?"],
        ["Delegate of Canada", "That would indeed bridge the gap between emerging and industrialized economies.", "Cela comblerait en effet le fossé entre pays émergents et industrialisés."],
        ["President", "The consensus reflects the highest traditions of multilateral diplomatic dialogue.", "Le consensus reflète la plus haute tradition du dialogue diplomatique multilatéral."]
      ]
    },
    dictation: { prompt: "The ambassador negotiated a bilateral peace treaty with great tact.", fr: "L'ambassadeur a négocié un traité de paix bilatéral avec un grand tact." },
    quiz: [
      { q: "Qu'est-ce que le 'hedging' dans le langage diplomatique anglo-saxon ?", opts: ["Un mur végétal", "L'art d'atténuer poliment ses affirmations pour faciliter le consensus", "Une dispute", "Une sanction financière"], a: 1, exp: "Le 'hedging' diplomatique utilise des formules douces (it would seem, might we) pour préserver le dialogue." },
      { q: "Que signifie 'bilateral treaty' ?", opts: ["Un traité entre trois pays", "Un traité officiel entre deux États souverains", "Un traité secret", "Un accord commercial annulé"], a: 1, exp: "'Bilateral' implique précisément deux parties ou deux États." },
      { q: "Quel document officiel remet un nouvel ambassadeur au chef d'État hôte ?", opts: ["A passport", "Credentials (lettres de créance)", "A visa", "A ticket"], a: 1, exp: "Les lettres de créance ('credentials') accréditent l'ambassadeur auprès du chef de l'État d'accueil." }
    ]
  }
];
