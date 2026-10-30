// 18 additional lessons for 1re (Première - Lycée / B1–B2)

export const SPECS_1RE = [
  {
    grade: '1re', theme_id: 'daily_life', num: 2,
    title: 'Consommation responsable & économie circulaire',
    title_en: 'Circular Economy & Zero Waste',
    objective: 'Analyser les modèles d\'économie circulaire et de sobriété avec les structures d\'inversion stylistique.',
    grammar: {
      title: "L'inversion stylistique après adverbes restrictifs (SELDOM, NEVER, NOT ONLY... BUT ALSO)",
      rule: "Dans un style académique ou rhétorique soutenu, lorsqu'un adverbe négatif ou restrictif commence la phrase, on inverse l'auxiliaire et le sujet : Not only DOES the circular economy reduce waste, BUT it ALSO saves energy.",
      example_en: "Seldom have consumers witnessed such rapid transformation towards repairable electronic devices.",
      example_fr: "Rarement les consommateurs ont été témoins d'une transformation aussi rapide vers des appareils réparables.",
      tip: "Structure : Adverbe négatif + Auxiliaire + Sujet + Base verbale.",
      level_focus: "Inversion après adverbes négatifs ou restrictifs en tête de phrase."
    },
    vocab: [
      ["circular economy", "/ˈsɜːrkjələr ɪˈkɒnəmi/", "Noun", "l'économie circulaire", "The circular economy replaces linear take-make-dispose models.", "L'économie circulaire remplace le modèle linéaire du tout-jetable."],
      ["zero-waste", "/ˈzɪəroʊ weɪst/", "Adjective", "zéro déchet", "Adopting a zero-waste lifestyle minimizes plastic packaging.", "Adopter un mode de vie zéro déchet minimise les emballages."],
      ["planned obsolescence", "/plænd ˌɒbsəˈlɛsns/", "Noun", "l'obsolescence programmée", "Legislation penalizes manufacturers practicing planned obsolescence.", "La loi sanctionne les fabricants pratiquant l'obsolescence programmée."],
      ["fast fashion", "/fɑːst ˈfæʃn/", "Noun", "la mode éphémère / fast fashion", "Fast fashion exploits cheap labor and depletes water resources.", "La fast fashion exploite une main-d'œuvre bon marché et épuise l'eau."],
      ["upcycling", "/ˈʌpsaɪklɪŋ/", "Noun", "le surcyclage créatif", "Upcycling textiles preserves cultural craftsmanship.", "Le surcyclage textile préserve l'artisanat."],
      ["repairability", "/rɪˌpɛərəˈbɪləti/", "Noun", "l'indice de réparabilité", "High repairability scores allow users to fix gadgets independently.", "Un bon indice de réparabilité permet d'auto-réparer ses appareils."],
      ["compostable", "/ˈkɒmpɒstəbl/", "Adjective", "compostable", "Mushroom packaging offers a fully compostable alternative.", "L'emballage en mycélium offre une alternative compostable."],
      ["thrift store", "/θrɪft stɔːr/", "Noun", "la friperie / boutique de seconde main", "Thrift stores promote sustainable second-hand vintage clothing.", "Les friperies promeuvent la seconde main vintage durable."],
      ["deplete", "/dɪˈpliːt/", "Verb", "épuiser les ressources naturelles", "Overconsumption depletes precious rare-earth minerals.", "La surconsommation épuise les minerais rares précieux."],
      ["mindful", "/ˈmaɪndfl/", "Adjective", "conscient / mesuré", "Mindful purchasing decisions reduce household footprints.", "Des achats conscients réduisent l'empreinte des ménages."]
    ],
    dialogue: {
      title: "Débat sur la fast fashion et le climat", setting: "Des élèves de première débattent de la surconsommation textile.",
      lines: [
        ["Student A", "Not only does the textile industry emit more carbon than maritime shipping, but it also pollutes freshwater basins.", "Non seulement l'industrie textile émet plus de carbone que le fret maritime, mais elle pollue aussi l'eau douce."],
        ["Student B", "Seldom do buyers realize that cheap synthetic garments shed plastic microfibers into oceans with every wash.", "Rarement les acheteurs réalisent que les vêtements synthétiques libèrent des microfibres."],
        ["Student A", "Should European governments ban advertisements for ultra-fast fashion platforms?", "Les gouvernements européens devraient-ils interdire la publicité pour l'ultra-fast-fashion ?"],
        ["Student B", "Repairability indices and extended guarantees are already nudging brands toward circular longevity.", "Les indices de réparabilité et les garanties poussent déjà les marques vers la durabilité."]
      ]
    },
    dictation: { prompt: "Not only does upcycling reduce waste, but it also preserves resources.", fr: "Non seulement le surcyclage réduit les déchets, mais il préserve aussi les ressources." },
    quiz: [
      { q: "Quelle phrase illustre l'inversion stylistique correcte après 'Seldom' ?", opts: ["Seldom consumers realize the impact.", "Seldom do consumers realize the impact.", "Seldom consumers do realize the impact.", "Consumers seldom realize do the impact."], a: 1, exp: "Après un adverbe restrictif en tête de phrase, on inverse l'auxiliaire et le sujet ('Seldom do consumers realize')." },
      { q: "Qu'est-ce que la 'planned obsolescence' ?", opts: ["La réparation gratuite", "La conception volontaire d'un produit pour limiter sa durée de vie", "Le recyclage", "La garantie légale"], a: 1, exp: "L'obsolescence programmée désigne la réduction délibérée de la durée de vie d'un produit." },
      { q: "Que signifie 'to deplete resources' ?", opts: ["Augmenter les stocks", "Épuiser les ressources", "Nettoyer l'eau", "Protéger la forêt"], a: 1, exp: "'To deplete' signifie tarir, vider ou épuiser des ressources." }
    ]
  },
  {
    grade: '1re', theme_id: 'daily_life', num: 3,
    title: 'Vie de campus & autonomie universitaire',
    title_en: 'Campus Life & Academic Freedom',
    objective: 'Comprendre le fonctionnement d\'un campus universitaire anglo-saxon avec les structures de regret (WISH / IF ONLY).',
    grammar: {
      title: "L'expression du regret avec WISH et IF ONLY (+ Past Perfect)",
      rule: "Pour exprimer un regret portant sur une situation passée : I wish / If only + HAD + participe passé. Pour un regret sur une situation présente : I wish + prétérit modal.",
      example_en: "I wish I had applied for the international student scholarship earlier, before the spring deadline expired.",
      example_fr: "Je regrette de ne pas avoir postulé plus tôt pour la bourse internationale, avant que la date limite de printemps n'expire.",
      tip: "If only est plus dramatique et intense que I wish.",
      level_focus: "Structures de regret au passé et au présent (wish / if only)."
    },
    vocab: [
      ["campus", "/ˈkæmpəs/", "Noun", "le campus universitaire", "Oxford's historic collegiate campus blends libraries, gardens and dormitories.", "Le campus d'Oxford allie bibliothèques, parcs et résidences."],
      ["tuition fees", "/tjuˈɪʃn fiːz/", "Noun", "les frais de scolarité universitaires", "High university tuition fees often require student loans.", "Les frais de scolarité élevés exigent souvent des prêts étudiants."],
      ["scholarship", "/ˈskɒlərʃɪp/", "Noun", "la bourse d'études au mérite", "She won a prestigious Rhodes scholarship to pursue postgraduate research.", "Elle a remporté une prestigieuse bourse Rhodes."],
      ["dormitory", "/ˈdɔːrmətɔːri/", "Noun", "la résidence universitaire / cité U", "Freshmen share twin rooms in the collegiate dormitory halls.", "Les étudiants de première année partagent une chambre en cité U."],
      ["lecture hall", "/ˈlɛktʃər hɔːl/", "Noun", "l'amphithéâtre de cours", "Three hundred students sat attentively in the science lecture hall.", "Trois cents étudiants étaient attentifs dans l'amphithéâtre."],
      ["student union", "/ˈstjuːdnt ˈjuːniən/", "Noun", "le syndicat / foyer des étudiants", "The student union organizes clubs, debates and wellbeing support.", "Le foyer étudiant organise clubs, débats et soutien."],
      ["syllabus", "/ˈsɪləbəs/", "Noun", "le programme d'études détaillé", "Review the term syllabus before seminars commence.", "Passe en revue le programme avant le début des séminaires."],
      ["academic freedom", "/ˌækəˈdɛmɪk ˈfriːdəm/", "Noun", "la liberté académique de recherche", "Academic freedom guarantees scholars can investigate without censorship.", "La liberté académique garantit une recherche sans censure."],
      ["undergraduate", "/ˌʌndərˈɡrædʒuət/", "Noun", "l'étudiant en licence (1er cycle)", "Undergraduate programs typically span three to four years in Britain.", "La licence dure généralement de trois à quatre ans en Grande-Bretagne."],
      ["autonomous", "/ɔːˈtɒnəməs/", "Adjective", "autonome / indépendant", "University life demands autonomous time management.", "La vie universitaire exige une gestion autonome du temps."]
    ],
    dialogue: {
      title: "Visite du campus de Trinity College à Cambridge", setting: "Des lycéens de première découvrent la vie étudiante britannique.",
      lines: [
        ["Student A", "I wish our secondary school had a library as magnificent as the Wren Library here!", "J'aimerais tant que notre lycée ait une bibliothèque aussi grandiose que celle-ci !"],
        ["Student B", "If only I had known how competitive scholarship applications were, I would have prepared sooner.", "Si seulement j'avais su combien les bourses étaient sélectives, je me serais préparé plus tôt."],
        ["Student A", "Life on campus offers extraordinary independence and vibrant intellectual debate.", "La vie de campus offre une formidable indépendance et un débat intellectuel vibrant."],
        ["Student B", "Every collegiate hall has its own traditions, rowing clubs and student union.", "Chaque collège a ses propres traditions, son club d'aviron et son foyer étudiant."]
      ]
    },
    dictation: { prompt: "I wish I had applied for the university scholarship sooner.", fr: "Je regrette de ne pas avoir postulé pour la bourse universitaire plus tôt." },
    quiz: [
      { q: "Quelle structure exprime un regret portant sur le passé ?", opts: ["I wish I had studied more.", "I wish I study more.", "I wish I will study more.", "I wish I am studying."], a: 0, exp: "'Wish + had + past participle' exprime un regret rétrospectif sur un fait passé." },
      { q: "Comment appelle-t-on un étudiant en premier cycle universitaire (licence) en anglais ?", opts: ["A postgraduate", "An undergraduate", "A master", "A dean"], a: 1, exp: "'Undergraduate' désigne un étudiant en 1er cycle de licence avant l'obtention du Bachelor." },
      { q: "Que signifie 'tuition fees' ?", opts: ["Les livres de cours", "Les frais de scolarité universitaires", "Le logement", "Les bourses d'études"], a: 1, exp: "'Tuition fees' désigne les droits et frais d'inscription universitaire." }
    ]
  },
  {
    grade: '1re', theme_id: 'travel', num: 2,
    title: 'Le Grand Tour & récits d\'écrivains voyageurs',
    title_en: 'The Grand Tour & Travel Literature',
    objective: 'Analyser la tradition historique du Grand Tour aristocratique des XVIIIe-XIXe siècles avec les adjectifs littéraires.',
    grammar: {
      title: "Les propositions participiales narratives (Having crossed the Alps, he wrote...)",
      rule: "Dans un style littéraire soutenu, on remplace une subordonnée de temps par un participe parfait composé : Having reached Rome, Byron composed stanzas of Childe Harold.",
      example_en: "Having crossed the misty Swiss passes, nineteenth-century poets recorded their romantic impressions in leather journals.",
      example_fr: "Après avoir franchi les cols brumeux de Suisse, les poètes du XIXe siècle consignèrent leurs impressions romantiques dans des carnets de cuir.",
      tip: "Structure : Having + participe passé + virgule + proposition principale.",
      level_focus: "Participiales narratives de temps et de cause (having + past participle)."
    },
    vocab: [
      ["Grand Tour", "/ɡrænd tʊər/", "Noun", "le Grand Tour (voyage éducatif aristocratique)", "The Grand Tour was an essential rite of passage for young European elites.", "Le Grand Tour était un rite de passage pour les jeunes élites européennes."],
      ["travelogue", "/ˈtrævəlɒɡ/", "Noun", "le récit de voyage littéraire", "Byron's poetic travelogues popularized romantic wanderlust.", "Les récits de voyage de Byron ont popularisé l'appel du voyage romantique."],
      ["wanderlust", "/ˈwɒndərlʌst/", "Noun", "la passion irrépressible du voyage", "Romantic wanderlust drew solitary artists towards antiquity ruins.", "L'appel du voyage a attiré des artistes solitaires vers les ruines antiques."],
      ["pilgrimage", "/ˈpɪlɡrɪmɪdʒ/", "Noun", "le pèlerinage culturel ou spirituel", "Visiting Florence was considered an aesthetic pilgrimage.", "Visiter Florence était considéré comme un pèlerinage esthétique."],
      ["sublime", "/səˈblaɪm/", "Adjective", "le sublime (mélange d'effroi et de beauté)", "Alpine chasms evoke the philosophical emotion of the sublime.", "Les gouffres alpins évoquent l'émotion philosophique du sublime."],
      ["antiquity", "/ænˈtɪkwəti/", "Noun", "l'Antiquité classique", "Scholars sketched marble statues and temples of classical antiquity.", "Des érudits ont esquissé les statues et temples de l'Antiquité."],
      ["journal", "/ˈdʒɜːrnl/", "Noun", "le carnet de voyage intime", "Keats recorded evocative observations in his leather travel journal.", "Keats a consigné des observations évocatrices dans son carnet."],
      ["solitary", "/ˈsɒlətəri/", "Adjective", "solitaire / contemplatif", "The solitary traveller gazed upon the misty sea of clouds.", "Le voyageur solitaire contemplait la mer de nuages brumeuse."],
      ["enlightenment", "/ɪnˈlaɪtnmənt/", "Noun", "les Lumières / l'érudition", "The Grand Tour expanded cosmopolitan Enlightenment philosophies.", "Le Grand Tour a diffusé la philosophie cosmopolite des Lumières."],
      ["monument", "/ˈmɒnjumənt/", "Noun", "le vestige / monument vénérable", "Ancient Roman monuments inspired neoclassical architects.", "Les monuments romains antiques ont inspiré les architectes néoclassiques."]
    ],
    dialogue: {
      title: "Sur les pas de Lord Byron en Italie", setting: "Des lycéens étudient les carnets de voyage de Lord Byron.",
      lines: [
        ["Teacher", "What was the primary educational purpose of the Grand Tour in the eighteenth century?", "Quel était le but éducatif premier du Grand Tour au XVIIIe siècle ?"],
        ["Student", "Having studied Latin and Greek at Oxford, young elites traveled to Italy to witness classical art firsthand.", "Après avoir étudié le latin et le grec, les jeunes élites partaient voir l'art antique sur place."],
        ["Teacher", "How did Romantic writers transform this aristocratic educational custom?", "Comment les écrivains romantiques ont-ils transformé cette coutume éducative ?"],
        ["Student", "They focused on the sublime emotion of wild nature and recorded poetic travelogues.", "Ils ont mis l'accent sur l'émotion sublime de la nature sauvage et écrit des récits poétiques."]
      ]
    },
    dictation: { prompt: "Having crossed the Alps, the poets admired the sublime landscape.", fr: "Après avoir franchi les Alpes, les poètes admirèrent le paysage sublime." },
    quiz: [
      { q: "Quelle structure participiale remplace 'After they had crossed the Alps' ?", opts: ["Having crossed the Alps", "Crossing the Alps", "Crossed the Alps", "To cross the Alps"], a: 0, exp: "'Having + past participle' exprime l'antériorité accomplie dans la proposition participiale." },
      { q: "Qu'est-ce que le 'Grand Tour' aux XVIIIe et XIXe siècles ?", opts: ["Une course cycliste", "Un grand voyage initiatique et culturel à travers l'Europe pour les jeunes élites", "Une mission militaire", "Un traité commercial"], a: 1, exp: "Le Grand Tour était le voyage continental formateur des jeunes gens aisés vers la France et l'Italie." },
      { q: "Quel concept esthétique et philosophique majeur lie beauté terrifiante et grandeur de la nature chez les Romantiques ?", opts: ["The Ordinary", "The Sublime", "The Modern", "The Synthetic"], a: 1, exp: "Le 'Sublime' (Burke, Kant) désigne le vertige mêlé de fascination face à la puissance démesurée de la nature." }
    ]
  },
  {
    grade: '1re', theme_id: 'travel', num: 3,
    title: 'Surtourisme & sauvegarde des sites UNESCO',
    title_en: 'Overtourism & UNESCO Heritage Sites',
    objective: 'Débattre de la surfréquentation touristique (Venise, Skye) avec les structures concessives et de restriction.',
    grammar: {
      title: "Les restrictions complexes avec NO MATTER HOW / NO MATTER WHAT",
      rule: "Pour exprimer qu'une limite s'impose quoi qu'il arrive : No matter how many tourists visit, carrying capacities must not be exceeded.",
      example_en: "No matter how lucrative tourism revenues are, historical monuments cannot endure unchecked overcrowding.",
      example_fr: "Aussi lucratives que soient les recettes touristiques, les monuments historiques ne peuvent supporter une surfréquentation sans limite.",
      tip: "Structure : No matter how + adjectif + sujet + verbe.",
      level_focus: "Structures de concession absolue (no matter how/what/where)."
    },
    vocab: [
      ["overtourism", "/ˌoʊvərˈtʊərɪzəm/", "Noun", "le surtourisme / la surfréquentation", "Overtourism erodes local identity and inflates residential rents.", "Le surtourisme érode l'identité locale et fait grimper les loyers."],
      ["UNESCO heritage", "/juːˈnɛskoʊ ˈhɛrɪtɪdʒ/", "Noun", "le patrimoine mondial de l'UNESCO", "Venice and Stonehenge are protected UNESCO world heritage sites.", "Venise et Stonehenge sont des sites protégés du patrimoine mondial."],
      ["carrying capacity", "/ˈkæriɪŋ kəˈpæsəti/", "Noun", "la capacité de charge écologique d'un lieu", "Exceeding carrying capacity destroys delicate alpine paths.", "Dépasser la capacité de charge détruit les sentiers alpins."],
      ["entry fee", "/ˈɛntri fiː/", "Noun", "le droit d'accès / taxe d'entrée", "The city introduced a day-tripper entry fee to curb crowds.", "La ville a instauré une taxe d'entrée pour freiner l'afflux."],
      ["quota", "/ˈkwoʊtə/", "Noun", "le quota de visiteurs journalier", "Machu Picchu enforces strict hourly tourist quotas.", "Le Machu Picchu impose de stricts quotas horaires de visiteurs."],
      ["erosion", "/ɪˈroʊʒn/", "Noun", "l'érosion des sols et falaises", "Foot traffic accelerates coastal cliff erosion dangerously.", "Le piétinement accélère dangereusement l'érosion côtière."],
      ["local resident", "/ˈloʊkl ˈrɛzɪdənt/", "Noun", "l'habitant local", "Local residents were priced out of historic downtown areas.", "Les habitants locaux ont été chassés du centre historique par les prix."],
      ["preserve", "/prɪˈzɜːrv/", "Verb", "sauvegarder / préserver", "Strict regulations preserve sacred archaeological ruins.", "Des réglementations strictes préservent les ruines sacrées."],
      ["unchecked", "/ʌnˈtʃɛkt/", "Adjective", "incontrôlé / effréné", "Unchecked tourism exhausts groundwater reserves on Mediterranean islands.", "Le tourisme effréné épuise l'eau sur les îles méditerranéennes."],
      ["sustainable balance", "/səˈsteɪnəbl ˈbæləns/", "Noun", "l'équilibre pérenne", "Finding a sustainable balance between revenue and conservation is urgent.", "Trouver un équilibre durable entre recettes et conservation est urgent."]
    ],
    dialogue: {
      title: "Réguler l'accès à l'île de Skye en Écosse", setting: "Des lycéens analysent l'impact des autocars sur les routes écossaises.",
      lines: [
        ["Student A", "No matter how beautiful the Fairy Pools on Skye are, single-track roads are totally clogged.", "Aussi magnifiques que soient les Fairy Pools à Skye, les routes à voie unique sont bouchées."],
        ["Student B", "Local residents can barely drive to work or hospital during the summer peak season.", "Les habitants peuvent à peine rouler pour aller travailler en plein été."],
        ["Student A", "Should authorities implement shuttle bus quotas and mandatory pre-booking?", "Les autorités devraient-elles imposer des navettes et des réservations obligatoires ?"],
        ["Student B", "Yes, because no matter how lucrative tourism is, preserving fragile ecosystems comes first.", "Oui, car aussi lucratif que soit le tourisme, la sauvegarde des écosystèmes passe avant tout."]
      ]
    },
    dictation: { prompt: "No matter how popular the site is, quotas must preserve nature.", fr: "Aussi populaire que soit le site, des quotas doivent préserver la nature." },
    quiz: [
      { q: "Quelle structure exprime 'Aussi lucratif que soit le tourisme...' ?", opts: ["No matter how lucrative tourism is...", "Although tourism is lucrative...", "Because tourism is lucrative...", "Unless tourism is lucrative..."], a: 0, exp: "'No matter how + adjectif + sujet + verbe' exprime la concession absolue ('aussi ... que soit')." },
      { q: "Que désigne la notion écologique de 'carrying capacity' pour un site naturel ?", opts: ["Le poids des bagages", "Le nombre maximal de visiteurs qu'un site peut accueillir sans dégradation", "Le prix du billet", "La taille des bus"], a: 1, exp: "La capacité de charge est le seuil de fréquentation au-delà duquel un écosystème se dégrade." },
      { q: "Quel phénomène urbain et écologique désigne 'overtourism' ?", opts: ["L'absence totale de voyageurs", "La surfréquentation touristique détériorant la vie locale et les écosystèmes", "Un vol retardé", "Une fête locale"], a: 1, exp: "'Overtourism' (surtourisme) désigne la saturation touristique préjudiciable aux résidents et monuments." }
    ]
  },
  {
    grade: '1re', theme_id: 'history', num: 2,
    title: 'Décolonisation & émergence du Commonwealth',
    title_en: 'Decolonization & The Modern Commonwealth',
    objective: 'Analyser la transition de l\'Empire britannique vers une communauté de nations égales avec les passifs d\'attribution.',
    grammar: {
      title: "La voix passive avec double objet (WERE GRANTED INDEPENDENCE)",
      rule: "Les verbes à double complément (give, grant, offer, award) privilégient le bénéficiaire comme sujet passif en anglais : Former colonies WERE GRANTED independence (plutôt que Independence was granted to...).",
      example_en: "Following decades of non-violent resistance led by Gandhi, India was granted full independence in 1947.",
      example_fr: "Après des décennies de résistance non-violente menée par Gandhi, l'Inde se vit accorder la pleine indépendance en 1947.",
      tip: "Structure très naturelle : Personne + was awarded / was granted.",
      level_focus: "Passif avec double complément d'objet (dit 'personnel')."
    },
    vocab: [
      ["decolonization", "/diːˌkɒlənaɪˈzeɪʃn/", "Noun", "la décolonisation", "Decolonization reshaped geopolitical borders across Asia and Africa.", "La décolonisation a redessiné les frontières en Asie et en Afrique."],
      ["Commonwealth", "/ˈkɒmənwɛlθ/", "Noun", "le Commonwealth des Nations (56 pays membres)", "The modern Commonwealth is a voluntary association of equal sovereign states.", "Le Commonwealth est une association volontaire d'États souverains égaux."],
      ["independence", "/ˌɪndɪˈpɛndəns/", "Noun", "l'indépendance", "Ghana was the first sub-Saharan nation to achieve independence in 1957.", "Le Ghana fut le premier pays d'Afrique subsaharienne indépendant en 1957."],
      ["non-violence", "/nɒn ˈvaɪələns/", "Noun", "la non-violence", "Mahatma Gandhi championed peaceful non-violent civil disobedience.", "Le Mahatma Gandhi a prôné la désobéissance civile non violente."],
      ["sovereignty", "/ˈsɒvrənti/", "Noun", "la souveraineté nationale", "Member states cherish autonomous diplomatic sovereignty.", "Les États membres chérissent leur souveraineté diplomatique."],
      ["legacy", "/ˈlɛɡəsi/", "Noun", "l'héritage / les séquelles historiques", "The linguistic and legal legacy of the empire remains visible worldwide.", "L'héritage linguistique et juridique de l'empire reste visible."],
      ["partition", "/pɑːrˈtɪʃn/", "Noun", "la partition territoriale (Inde/Pakistan 1947)", "The painful 1947 partition triggered mass displacement of millions.", "La partition douloureuse de 1947 a provoqué des déplacements massifs."],
      ["diaspora", "/daɪˈæspərə/", "Noun", "la diaspora multiculturelle", "The Commonwealth diaspora enriched British cultural and economic life.", "La diaspora du Commonwealth a enrichi la vie culturelle britannique."],
      ["charter", "/ˈtʃɑːrtər/", "Noun", "la charte des principes", "The Commonwealth Charter upholds human rights, rule of law and democracy.", "La Charte du Commonwealth défend les droits de l'homme et l'État de droit."],
      ["reconciliation", "/ˌrɛkənsɪliˈeɪʃn/", "Noun", "la réconciliation historique", "Confronting colonial atrocities is crucial for honest historical reconciliation.", "Affronter les crimes coloniaux est crucial pour la réconciliation."]
    ],
    dialogue: {
      title: "Du British Empire au Commonwealth moderne", setting: "Des élèves de première analysent l'évolution du Commonwealth.",
      lines: [
        ["Student A", "How did an empire that ruled over a quarter of the world become a voluntary association?", "Comment un empire régnant sur un quart du globe est-il devenu une association volontaire ?"],
        ["Teacher", "Through determined independence movements. In 1947, India and Pakistan were granted sovereignty.", "Par des mouvements d'indépendance déterminés. En 1947, l'Inde et le Pakistan ont acquis leur souveraineté."],
        ["Student B", "Does the British monarch automatically rule over all 56 Commonwealth countries?", "Le monarque britannique règne-t-il automatiquement sur les 56 pays membres ?"],
        ["Teacher", "No, the majority are independent republics with their own elected presidents, united by shared values.", "Non, la majorité sont des républiques avec leur propre président, unies par des valeurs partagées."]
      ]
    },
    dictation: { prompt: "In 1947, India was granted independence after long peaceful struggles.", fr: "En 1947, l'Inde s'est vu accorder l'indépendance après de longues luttes pacifiques." },
    quiz: [
      { q: "Quelle formulation passive privilégie l'anglais pour 'On a accordé l'indépendance à la nation' ?", opts: ["Independence was granted to the nation", "The nation was granted independence", "They granted to the nation independence", "It was independence granted"], a: 1, exp: "L'anglais préfère promouvoir le bénéficiaire en sujet du passif : 'The nation was granted independence'." },
      { q: "Quel pays d'Afrique subsaharienne fut le premier à obtenir son indépendance de l'Empire britannique en 1957 ?", opts: ["Le Kenya", "Le Ghana", "Le Nigeria", "L'Afrique du Sud"], a: 1, exp: "Le Ghana (sous Kwame Nkrumah) devint indépendant le 6 mars 1957." },
      { q: "Combien de pays souverains composent aujourd'hui le Commonwealth des Nations ?", opts: ["12", "27", "56", "100"], a: 2, exp: "Le Commonwealth moderne rassemble 56 nations souveraines réparties sur les 5 continents." }
    ]
  },
  {
    grade: '1re', theme_id: 'history', num: 3,
    title: 'La course à l\'espace & la mission Apollo 11',
    title_en: 'The Space Race & Apollo 11',
    objective: 'Raconter la rivalité technologique de la Guerre froide et le premier pas sur la Lune en juillet 1969.',
    grammar: {
      title: "Les propositions consécutives avec SO... THAT et la phrase historique de Kennedy",
      rule: "Pour souligner l'ampleur d'une ambition nationale : We choose to go to the moon in this decade, not because it is easy, but because it is hard.",
      example_en: "The geopolitical rivalry between the US and USSR was so intense that billions of dollars were mobilized in record time.",
      example_fr: "La rivalité géopolitique entre les USA et l'URSS était si intense que des milliards de dollars furent mobilisés en un temps record.",
      tip: "Structure : So + adjectif + THAT + conséquence.",
      level_focus: "Consécutives d'intensité et rhétorique présidentielle (J.F. Kennedy)."
    },
    vocab: [
      ["Space Race", "/speɪs reɪs/", "Noun", "la course à l'espace", "The Cold War Space Race pitted NASA against Soviet engineers.", "La course à l'espace a opposé la NASA aux ingénieurs soviétiques."],
      ["moon landing", "/muːn ˈlændɪŋ/", "Noun", "l'alunissage (20 juillet 1969)", "The Apollo 11 moon landing was watched by six hundred million viewers.", "L'alunissage d'Apollo 11 fut regardé par 600 millions de personnes."],
      ["giant leap", "/ˈdʒaɪənt liːp/", "Noun", "le pas de géant (Armstrong)", "That's one small step for man, one giant leap for mankind.", "Un petit pas pour l'homme, un bond de géant pour l'humanité."],
      ["lunar module", "/ˈluːnər ˈmɒdjuːl/", "Noun", "le module lunaire (Eagle)", "The lunar module touched down safely in the Sea of Tranquility.", "Le module lunaire s'est posé dans la mer de la Tranquillité."],
      ["astronaut", "/ˈæstrənɔːt/", "Noun", "l'astronaute", "Neil Armstrong and Buzz Aldrin spent twenty-one hours on the Moon.", "Armstrong et Aldrin ont passé vingt et une heures sur la Lune."],
      ["orbit", "/ˈɔːrbɪt/", "Noun", "l'orbite spatiale", "Sputnik was the first artificial satellite launched into Earth orbit.", "Spoutnik fut le premier satellite artificiel en orbite terrestre."],
      ["rocket", "/ˈrɒkɪt/", "Noun", "la fusée géante (Saturn V)", "The Saturn V rocket remains the most powerful launch vehicle ever built.", "La fusée Saturn V demeure le lanceur le plus puissant jamais construit."],
      ["mission control", "/ˈmɪʃn kənˈtroʊl/", "Noun", "le centre de contrôle spatial (Houston)", "Mission control in Houston erupted in joyful cheers.", "Le centre de contrôle à Houston a éclaté de joie."],
      ["cosmonaut", "/ˈkɒzmənɔːt/", "Noun", "le cosmonaute (russe)", "Yuri Gagarin became the first human cosmonaut in outer space.", "Youri Gagarine devint le premier cosmonaute dans l'espace."],
      ["exploration", "/ˌɛkspləˈreɪʃn/", "Noun", "l'exploration spatiale", "Space exploration unified divided humanity in awe and hope.", "L'exploration spatiale a uni l'humanité dans l'émerveillement."]
    ],
    dialogue: {
      title: "Le 20 juillet 1969 à Houston", setting: "Des élèves écoutent les enregistrements originaux d'Apollo 11.",
      lines: [
        ["Teacher", "Listen to Neil Armstrong's crackling voice over the radio as he steps onto lunar dust.", "Écoutez la voix grésillante d'Armstrong à la radio posant le pied sur la poussière lunaire."],
        ["Recording", "'That's one small step for man, one giant leap for mankind.'", "'C'est un petit pas pour l'homme, un bond de géant pour l'humanité.'"],
        ["Student", "Why was the Moon race so crucial in the 1960s Cold War rivalry?", "Pourquoi la course à la Lune était-elle si cruciale dans la Guerre froide des années 60 ?"],
        ["Teacher", "It served as a peaceful scientific arena to demonstrate ideological and technological supremacy.", "Elle servait d'arène pacifique pour démontrer la suprématie idéologique et technique."]
      ]
    },
    dictation: { prompt: "That is one small step for man, one giant leap for mankind.", fr: "C'est un petit pas pour l'homme, un bond de géant pour l'humanité." },
    quiz: [
      { q: "Qui fut le premier être humain à marcher sur le sol de la Lune le 20 juillet 1969 ?", opts: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"], a: 1, exp: "Neil Armstrong a posé le pied sur la Lune le premier, suivi de Buzz Aldrin." },
      { q: "Comment s'appelait le module lunaire d'Apollo 11 qui s'est posé dans la Mer de la Tranquillité ?", opts: ["Apollo", "Eagle", "Columbia", "Discovery"], a: 1, exp: "Le module lunaire s'appelait 'Eagle' (d'où la phrase : 'The Eagle has landed')." },
      { q: "Quelle célèbre formule a prononcé Neil Armstrong en foulant la surface lunaire ?", opts: ["We came in peace", "One small step for man, one giant leap for mankind", "Good morning Earth", "Mission accomplished"], a: 1, exp: "'That's one small step for man, one giant leap for mankind' est la phrase historique." }
    ]
  },
  {
    grade: '1re', theme_id: 'hobbies', num: 2,
    title: 'Critique littéraire & analyse narrative',
    title_en: 'Literary Criticism & Narrative Devices',
    objective: 'Analyser les figures de style, le point de vue narratif et l\'ironie dramatique en littérature.',
    grammar: {
      title: "Les propositions relatives explicatives entre virgules (Non-defining relative clauses)",
      rule: "Contrairement aux relatives déterminatives, les relatives explicatives apportent une information secondaire entre deux virgules. On emploie WHO pour les personnes et WHICH pour les choses (JAMAIS that) : Orwell's 1984, WHICH was published in 1949, remains prophetic.",
      example_en: "Mary Shelley, who wrote Frankenstein at nineteen, questioned the ethical limits of science.",
      example_fr: "Mary Shelley, qui écrivit Frankenstein à dix-neuf ans, questionna les limites éthiques de la science.",
      tip: "Règle absolue : 'THAT' ne s'utilise jamais entre deux virgules dans une relative !",
      level_focus: "Relatives non-déterminatives (non-defining relative clauses)."
    },
    vocab: [
      ["literary criticism", "/ˈlɪtərəri ˈkrɪtɪsɪzəm/", "Noun", "la critique littéraire", "Literary criticism interrogates underlying ideological assumptions.", "La critique littéraire interroge les présupposés idéologiques sous-jacents."],
      ["metaphor", "/ˈmɛtəfər/", "Noun", "la métaphore", "The green light in The Great Gatsby is a haunting metaphor for longing.", "La lumière verte dans Gatsby est une métaphore du désir inassouvi."],
      ["foreshadowing", "/fɔːrˈʃædoʊɪŋ/", "Noun", "l'annonce prémonitoire / l'anticipation", "Subtle weather cues create menacing foreshadowing of disaster.", "Des indices météo subtils créent une annonce prémonitoire menaçante."],
      ["unreliable narrator", "/ˌʌnrɪˈlaɪəbl nəˈreɪtər/", "Noun", "le narrateur peu fiable / subjectif", "An unreliable narrator forces readers to question the objective reality.", "Le narrateur non fiable oblige à douter de la réalité objective."],
      ["symbolism", "/ˈsɪmbəlɪzəm/", "Noun", "le symbolisme", "Gold and white symbolism exposes moral corruption behind glamour.", "Le symbolisme de l'or et du blanc démasque la corruption morale."],
      ["dramatic irony", "/drəˈmætɪk ˈaɪrəni/", "Noun", "l'ironie dramatique", "Dramatic irony occurs when the reader knows what characters ignore.", "L'ironie dramatique naît quand le lecteur sait ce que le héros ignore."],
      ["subtext", "/ˈsʌbtɛkst/", "Noun", "le sous-texte / sens implicite", "Look beyond dialogue to decipher the psychological subtext.", "Regardez au-delà du dialogue pour déchiffrer le sous-texte."],
      ["allusion", "/əˈluːʒn/", "Noun", "l'allusion mythologique ou biblique", "The poet weaves subtle mythological allusions throughout the ode.", "Le poète tisse de subtiles allusions mythologiques dans l'ode."],
      ["motif", "/moʊˈtiːf/", "Noun", "le motif récurrent", "Clocks and broken timepieces form a recurring motif in the novel.", "Les horloges brisées forment un motif récurrent dans le roman."],
      ["allegory", "/ˈæləɡəri/", "Noun", "l'allégorie", "Animal Farm is a transparent political allegory of totalitarianism.", "La Ferme des animaux est une allégorie politique du totalitarisme."]
    ],
    dialogue: {
      title: "Analyse de Gatsby le Magnifique de Fitzgerald", setting: "Des lycéens étudient le narrateur Nick Carraway.",
      lines: [
        ["Teacher", "How does F. Scott Fitzgerald use Nick Carraway as an ambivalent narrator?", "Comment Fitzgerald utilise-t-il Nick Carraway comme narrateur ambivalent ?"],
        ["Student", "Nick claims to be non-judgmental, which is ironic because his entire narrative passes moral judgment on the ultra-rich.", "Nick prétend ne pas juger, ce qui est ironique car tout son récit juge les super-riches."],
        ["Teacher", "What does the green light at the end of Daisy's dock symbolize?", "Que symbolise la lumière verte au bout du ponton de Daisy ?"],
        ["Student", "It symbolizes Gatsby's romantic dream and the unattainable illusions of the American Dream.", "Elle symbolise le rêve romantique de Gatsby et les illusions inaccessibles du rêve américain."]
      ]
    },
    dictation: { prompt: "George Orwell's novel 1984, which was written in 1948, warned against totalitarian surveillance.", fr: "Le roman 1984 d'Orwell, qui fut écrit en 1948, mettait en garde contre la surveillance totalitaire." },
    quiz: [
      { q: "Quel pronom relatif est STRICTEMENT INTERDIT dans une proposition explicative entre virgules ?", opts: ["Which", "Who", "That", "Whose"], a: 2, exp: "Le pronom 'THAT' ne peut jamais s'employer dans une proposition non-déterminative entre virgules." },
      { q: "Qu'est-ce qu'un 'unreliable narrator' en critique littéraire ?", opts: ["Un auteur anonyme", "Un narrateur dont la vision des faits est faussée, partiale ou mensongère", "Un poète disparu", "Un traducteur"], a: 1, exp: "Le narrateur non fiable (comme Nick Carraway ou Holden Caulfield) oblige le lecteur à lire entre les lignes." },
      { q: "Que désigne la technique du 'foreshadowing' ?", opts: ["Le portrait physique", "L'annonce prémonitoire d'événements tragiques futurs", "La conclusion du livre", "La dédicace"], a: 1, exp: "'Foreshadowing' désigne les indices textuels qui anticipent le dénouement ou drame à venir." }
    ]
  },
  {
    grade: '1re', theme_id: 'hobbies', num: 3,
    title: 'Cinéma d\'auteur & mouvements d\'avant-garde',
    title_en: 'Auteur Cinema & Avant-Garde Film',
    objective: 'Analyser la théorie de l\'auteur, la mise en scène et la grammaire cinématographique en anglais.',
    grammar: {
      title: "Les propositions participiales réduites après conjonctions (WHILE FILMING, ONCE RELEASED)",
      rule: "Pour alléger et styliser les phrases narratives : While + participe présent (While filming the climax, Hitchcock kept the camera static) / Once + participe passé (Once released, the movie shocked audiences).",
      example_en: "While directing Vertigo, Alfred Hitchcock engineered groundbreaking visual techniques to convey psychological dread.",
      example_fr: "En réalisant Vertigo, Alfred Hitchcock conçut des techniques visuelles inédites pour transmettre l'angoisse psychologique.",
      tip: "Le sujet sous-entendu du participe doit impérativement être le sujet de la phrase principale !",
      level_focus: "Participiales abrégées après conjonctions (while directing, once released)."
    },
    vocab: [
      ["auteur theory", "/oʊˈtɜːr ˈθɪəri/", "Noun", "la théorie de l'auteur (le réalisateur comme créateur total)", "The auteur theory posits that the director is the genuine author of a film.", "La théorie de l'auteur pose que le réalisateur est l'authentique auteur d'un film."],
      ["mise-en-scène", "/ˌmiːz ɒn ˈsɛn/", "Noun", "la mise en scène (décors, lumière, jeu)", "Mise-en-scène encompasses lighting, costumes and spatial composition.", "La mise en scène englobe éclairage, costumes et composition spatiale."],
      ["cinematography", "/ˌsɪnəməˈtɒɡrəfi/", "Noun", "la direction de la photographie / cadrage", "Exquisite black-and-white cinematography heightens film noir tension.", "Une superbe photographie noir et blanc intensifie la tension du film noir."],
      ["tracking shot", "/ˈtrækɪŋ ʃɒt/", "Noun", "le plan-séquence en travelling", "Kubrick deployed hypnotic fluid tracking shots through hotel corridors.", "Kubrick utilisa des travellings hypnotiques dans les couloirs de l'hôtel."],
      ["dolly zoom", "/ˈdɒli zuːm/", "Noun", "le travelling compensé (effet Vertigo)", "The famous dolly zoom creates visual dizziness and vertigo.", "Le travelling compensé crée un vertige visuel saisissant."],
      ["montage", "/mɒnˈtɑːʒ/", "Noun", "le montage intellectuel / dialectique", "Soviet montage theory juxtaposes contrasting shots to generate meaning.", "Le montage soviétique juxtapose des plans contrastés."],
      ["subtext", "/ˈsʌbtɛkst/", "Noun", "le sous-texte implicite", "Visual subtext reveals what characters are too terrified to articulate.", "Le sous-texte visuel révèle ce que les héros n'osent formuler."],
      ["avant-garde", "/ˌævɑːŋ ˈɡɑːrd/", "Adjective", "d'avant-garde / expérimental", "Avant-garde filmmakers reject conventional three-act Hollywood narratives.", "Les cinéastes d'avant-garde rejettent la structure hollywoodienne."],
      ["lighting", "/ˈlaɪtɪŋ/", "Noun", "l'éclairage / clair-obscur", "Chiaroscuro lighting sculpts deep shadows across the detective's face.", "L'éclairage en clair-obscur sculpte des ombres sur le visage."],
      ["masterpiece", "/ˈmɑːstərpiːs/", "Noun", "le chef-d'œuvre cinématographique", "Citizen Kane is hailed as a technical and narrative masterpiece.", "Citizen Kane est salué comme un chef-d'œuvre technique et narratif."]
    ],
    dialogue: {
      title: "Analyse d'une scène de Vertigo d'Alfred Hitchcock", setting: "En spécialité cinéma/anglais au lycée.",
      lines: [
        ["Teacher", "How did Hitchcock invent the 'vertigo effect' during the staircase sequence?", "Comment Hitchcock a-t-il inventé 'l'effet vertigo' dans la séquence de l'escalier ?"],
        ["Student", "While zooming in with the lens, the camera was physically pulled backward on a dolly track.", "Tout en zoomant avec l'objectif, la caméra reculait sur un chariot."],
        ["Teacher", "What psychological sensation does this simultaneous camera movement produce on viewers?", "Quelle sensation psychologique ce mouvement simultané produit-il sur le spectateur ?"],
        ["Student", "Perspective distorts violently while the character stays fixed, mimicking acute vertigo.", "La perspective se déforme violemment tandis que le personnage reste fixe, mimant le vertige aigu."]
      ]
    },
    dictation: { prompt: "While directing Vertigo, Hitchcock invented the famous dolly zoom.", fr: "En réalisant Vertigo, Hitchcock inventa le célèbre travelling compensé." },
    quiz: [
      { q: "Qu'est-ce que l'effet de 'dolly zoom' créé par Hitchcock dans Vertigo ?", opts: ["Un ralenti sur les acteurs", "Un zoom avant simultané avec un travelling arrière de caméra", "Un fondu au noir", "Une musique d'angoisse"], a: 1, exp: "Le dolly zoom combine un zoom optique et un travelling physique inverse pour déformer la perspective." },
      { q: "Quel réalisateur est célèbre pour ses travellings fluides légendaires au Steadycam dans 'Shining' ?", opts: ["Steven Spielberg", "Stanley Kubrick", "Woody Allen", "George Lucas"], a: 1, exp: "Stanley Kubrick a révolutionné l'utilisation du Steadycam dans les couloirs de l'hôtel de 'The Shining'." },
      { q: "Que postule la 'théorie de l'auteur' (Auteur theory) au cinéma ?", opts: ["Le producteur décide de tout", "Le réalisateur imprime sa vision artistique singulière comme un véritable auteur littéraire", "Les acteurs écrivent le film", "Le public choisit la fin"], a: 1, exp: "La théorie de l'auteur considère le metteur en scène comme l'auteur artistique premier du film." }
    ]
  },
  {
    grade: '1re', theme_id: 'sport', num: 2,
    title: 'Géopolitique du sport & diplomatie olympique',
    title_en: 'Geopolitics of Sports & Soft Power',
    objective: 'Analyser l\'utilisation des grands événements sportifs mondiaux comme instrument géopolitique et de soft power.',
    grammar: {
      title: "La voix passive impersonnelle de reportage (IT IS WIDELY ARGUED THAT / SPORTSWASHING IS SAID TO BE)",
      rule: "Dans l'analyse géopolitique, on recourt à deux constructions : 'It is widely argued that + proposition' ou 'Le sujet + is said/believed to + base verbale'.",
      example_en: "Mega-sporting events are increasingly considered to be instruments of national prestige and diplomatic soft power.",
      example_fr: "Les méga-événements sportifs sont de plus en plus considérés comme des instruments de prestige et de soft power diplomatique.",
      tip: "Structure : Subject + is said / is believed + to + infinitive.",
      level_focus: "Passif de seconde nomination (He is believed to be / It is thought that)."
    },
    vocab: [
      ["soft power", "/sɒft ˈpaʊər/", "Noun", "la puissance d'influence douce (soft power)", "Hosting the Olympics projects cultural attraction and soft power.", "Accueillir les JO projette un attrait culturel et du soft power."],
      ["sportswashing", "/ˈspɔːrtswɒʃɪŋ/", "Noun", "le sportswashing (blanchiment d'image par le sport)", "Critics denounce sportswashing when autocratic regimes fund major tournaments.", "Les critiques dénoncent le sportswashing des régimes autoritaires."],
      ["boycott", "/ˈbɔɪkɒt/", "Noun", "le boycott diplomatique ou sportif", "The US led a boycott of the 1980 Moscow Olympic Games.", "Les États-Unis menèrent un boycott des JO de Moscou en 1980."],
      ["geopolitics", "/ˌdʒiːoʊˈpɒlətɪks/", "Noun", "la géopolitique", "Global sports intersect inextricably with international geopolitics.", "Le sport mondial croise inextricablement la géopolitique."],
      ["propaganda", "/ˌprɒpəˈɡændə/", "Noun", "la propagande d'État", "The 1936 Berlin Olympics were exploited as Nazi propaganda.", "Les JO de Berlin de 1936 furent exploités par la propagande nazie."],
      ["diplomacy", "/dɪˈploʊməsi/", "Noun", "la diplomatie internationale", "Ping-pong diplomacy paved the way for Sino-American détente in 1971.", "La diplomatie du ping-pong ouvrit la voie à la détente sino-américaine en 1971."],
      ["nationalism", "/ˈnæʃnəlɪzəm/", "Noun", "le nationalisme exacerbé", "Stadium chants sometimes inflame toxic nationalist passions.", "Les chants de stade attisent parfois des passions nationalistes."],
      ["neutrality", "/njuːˈtræləti/", "Noun", "la neutralité olympique", "The Olympic charter professes strict political neutrality.", "La charte olympique proclame une stricte neutralité politique."],
      ["sanctions", "/ˈsæŋkʃnz/", "Noun", "les sanctions sportives internationales", "Global federations imposed sports sanctions following international aggression.", "Les fédérations ont imposé des sanctions après l'agression."],
      ["prestige", "/prɛˈstiːʒ/", "Noun", "le prestige international", "States spend billions on stadiums to purchase global prestige.", "Les États dépensent des milliards pour acheter du prestige."]
    ],
    dialogue: {
      title: "La diplomatie du ping-pong en 1971", setting: "Des élèves de première analysent les relations sino-américaines.",
      lines: [
        ["Teacher", "How did table tennis change the course of the Cold War in 1971?", "Comment le tennis de table a-t-il changé le cours de la Guerre froide en 1971 ?"],
        ["Student", "American table tennis players were invited to Beijing, which opened secret diplomatic channels.", "Les pongistes américains ont été invités à Pékin, ouvrant des canaux secrets."],
        ["Teacher", "It is considered to be one of the most brilliant examples of sports diplomacy in modern history.", "C'est considéré comme l'un des exemples de diplomatie sportive les plus brillants."],
        ["Student", "Sports provided a neutral ground where two rival superpowers could shake hands without losing face.", "Le sport a offert un terrain neutre où deux superpuissances ont pu dialoguer sans perdre la face."]
      ]
    },
    dictation: { prompt: "Mega-events are increasingly used as tools of diplomatic soft power.", fr: "Les méga-événements sont de plus en plus utilisés comme outils de soft power diplomatique." },
    quiz: [
      { q: "Qu'est-ce que le 'sportswashing' en relations internationales ?", opts: ["Le nettoyage des équipements sportifs", "L'utilisation d'événements sportifs prestigieux pour redorer l'image d'un régime contesté", "Une nouvelle discipline aquatique", "Le dopage financier"], a: 1, exp: "Le 'sportswashing' désigne la pratique consistant à utiliser le sport pour détourner l'attention des violations des droits humains." },
      { q: "Quel sport a servi en 1971 à amorcer le dégel diplomatique entre les USA et la Chine ?", opts: ["Le football", "Le tennis de table (ping-pong)", "Le basketball", "L'athlétisme"], a: 1, exp: "La 'ping-pong diplomacy' a permis la reprise historique des relations entre Washington et Pékin." },
      { q: "Quel concept théorisé par Joseph Nye désigne l'influence par la séduction culturelle plutôt que la force ?", opts: ["Hard power", "Soft power", "Smart power", "Zero power"], a: 1, exp: "Le 'soft power' repose sur le rayonnement culturel, sportif et diplomatique non coercitif." }
    ]
  },
  {
    grade: '1re', theme_id: 'sport', num: 3,
    title: 'Psychologie sportive & gestion de la pression',
    title_en: 'Sports Psychology & Peak Focus',
    objective: 'Analyser la préparation mentale des champions, le phénomène d\'étouffement sous pression (choking) et l\'état de flow.',
    grammar: {
      title: "Les propositions subordonnées concessives introduites par MUCH AS ou AS THOUGH",
      rule: "Pour introduire une concession émotionnelle vive : Much as athletes prepare physically, mental resilience determines victory. / He performed as though he felt no pressure at all.",
      example_en: "Much as she trained relentlessly for the Olympic final, mental visualization alone unlocked her calm peak focus.",
      example_fr: "Bien qu'elle se fût entraînée sans relâche pour la finale olympique, seule la visualisation mentale lui permit d'atteindre le calme optimal.",
      tip: "Much as = Even though (très soutenu et littéraire).",
      level_focus: "Concession littéraire soutenue (much as + proposition)."
    },
    vocab: [
      ["flow state", "/floʊ steɪt/", "Noun", "l'état de flow / la zone de performance absolue", "In the flow state, mind and body execute movements automatically.", "Dans l'état de flow, esprit et corps exécutent les mouvements automatiquement."],
      ["choking under pressure", "/ˈtʃoʊkɪŋ ˈʌndər ˈprɛʃər/", "Noun", "l'étouffement / la perte de moyens sous la pression", "Choking under pressure occurs when athletes overthink routine motor skills.", "Perdre ses moyens sous pression arrive quand on intellectualise les gestes."],
      ["mental toughness", "/ˈmɛntl ˈtʌfnəs/", "Noun", "la force mentale / la ténacité", "Mental toughness separates gold medalists from the rest of the field.", "La force mentale sépare les médaillés d'or du reste du peloton."],
      ["visualization", "/ˌvɪʒuəlaɪˈzeɪʃn/", "Noun", "la visualisation mentale de la course", "Guided visualization primes neural pathways before the starting gun.", "La visualisation prépare les circuits neuronaux avant le coup d'envoi."],
      ["self-talk", "/sɛlf tɔːk/", "Noun", "le dialogue intérieur / monologue constructif", "Positive self-talk suppresses paralyzing fear of failure.", "Un dialogue intérieur positif étouffe la peur paralysante de l'échec."],
      ["resilience", "/rɪˈzɪliəns/", "Noun", "la capacité de rebond après l'échec", "Champion gymnasts bounce back from falls with steely resilience.", "Les gymnastes de haut niveau rebondissent après une chute avec sang-froid."],
      ["pressure", "/ˈprɛʃər/", "Noun", "la pression psychologique", "Olympic finals generate immense psychological pressure.", "Les finales olympiques génèrent une pression psychologique immense."],
      ["concentration", "/ˌkɒnsnˈtreɪʃn/", "Noun", "la concentration absolue", "Archers cultivate laser-like concentration amidst noisy stadiums.", "Les archers cultivent une concentration laser au milieu du bruit."],
      ["vulnerability", "/ˌvʌlnərəˈbɪləti/", "Noun", "la vulnérabilité émotionnelle", "Acknowledging emotional vulnerability helps relieve burnout.", "Reconnaître sa vulnérabilité aide à désamorcer l'épuisement."],
      ["burnout", "/ˈbɜːrnaʊt/", "Noun", "le surmenage / l'épuisement sportif", "Over-training without adequate rest triggers severe mental burnout.", "Le surentraînement sans repos provoque un grave épuisement."]
    ],
    dialogue: {
      title: "L'état de grâce des champions", setting: "Des lycéens analysent le témoignage de Simone Biles sur la santé mentale.",
      lines: [
        ["Student A", "Why do world-class athletes sometimes freeze up during decisive Olympic routines?", "Pourquoi les grands champions perdent-ils parfois leurs moyens lors des épreuves décisives ?"],
        ["Teacher", "It is known as choking under pressure. The conscious brain interferes with automated muscle memory.", "C'est l'étouffement sous pression. Le cerveau conscient perturbe la mémoire musculaire."],
        ["Student B", "Simone Biles courageously prioritized her mental wellbeing over medals in Tokyo, didn't she?", "Simone Biles a courageusement fait passer son bien-être avant les médailles à Tokyo, non ?"],
        ["Teacher", "Indeed. Much as our culture glorifies winning at all costs, mental health is the true bedrock of human dignity.", "En effet. Bien que l'on glorifie la victoire à tout prix, la santé mentale est le socle de la dignité."]
      ]
    },
    dictation: { prompt: "Much as athletes prepare physically, mental resilience decides victory.", fr: "Bien que les athlètes se préparent physiquement, la résilience mentale décide de la victoire." },
    quiz: [
      { q: "Que signifie le concept psychologique de 'flow state' dans le sport ?", opts: ["Être fatigué", "L'état d'absorption totale où l'action se déroule sans effort ni doute", "Courir dans l'eau", "Perdre le match"], a: 1, exp: "Le 'flow' (Csikszentmihalyi) est l'état d'immersion totale où compétences et défi s'équilibrent parfaitement." },
      { q: "Que signifie l'expression 'choking under pressure' ?", opts: ["Avoir soif", "Perdre brutalement ses moyens et automatismes sous le coup de la tension", "Remporter le trophée", "Être blessé au genou"], a: 1, exp: "'Choking' désigne l'effondrement des performances d'un athlète paralysé par l'enjeu." },
      { q: "Quelle conjonction très soutenue commence la phrase : '... as she tried, she couldn't break the record' ?", opts: ["Much as", "Because as", "While as", "Since as"], a: 0, exp: "'Much as' introduit une concession soutenue équivalente à 'bien que' ou 'tout en ayant essayé'." }
    ]
  },
  {
    grade: '1re', theme_id: 'music', num: 2,
    title: 'Streaming musical & économie de la création',
    title_en: 'Streaming Economics & Indie Artists',
    objective: 'Analyser la révolution des plateformes de streaming, les royalties et l\'indépendance artistique avec le subjonctif.',
    grammar: {
      title: "Le subjonctif présent mandatif après verbes d'exigence (INSIST THAT HE BE, DEMAND THAT THEY RECEIVE)",
      rule: "Après les verbes exprimant une exigence, un souhait ou une recommandation formelle (demand, insist, propose, require) : on emploie la base verbale nue sans 's' à la 3e personne : Musicians demand that streaming platforms PAY fair royalties.",
      example_en: "Musicians insist that fair compensation be guaranteed for every stream.",
      example_fr: "Les musiciens exigent qu'une rémunération équitable soit garantie pour chaque écoute.",
      tip: "The union demands that the platform NOT monopolize artist revenues.",
      level_focus: "Subjonctif mandatif de requête formelle (insist that sth be done)."
    },
    vocab: [
      ["royalties", "/ˈrɔɪəltiz/", "Noun", "les droits d'auteur / redevances", "Streaming platforms pay fractions of a penny in royalties per stream.", "Les plateformes versent des fractions de centime de droits d'auteur."],
      ["stream", "/striːm/", "Noun", "l'écoute en streaming / flux", "An independent song reached one million organic streams.", "Une chanson indépendante a atteint un million d'écoutes."],
      ["algorithm", "/ˈælɡərɪðəm/", "Noun", "l'algorithme de recommandation", "Streaming algorithms prioritize short tracks engineered to hook listeners fast.", "Les algorithmes favorisent les morceaux courts."],
      ["indie", "/ˈɪndi/", "Adjective", "indépendant (hors des majors)", "Indie artists rely on live touring and vinyl merchandise to survive.", "Les artistes indépendants comptent sur les tournées et les vinyles."],
      ["record label", "/ˈrɛkɔːrd ˈleɪbl/", "Noun", "la maison de disques / le label", "Major record labels command catalog licensing rights.", "Les grandes maisons de disques contrôlent les catalogues."],
      ["merchandise", "/ˈmɜːrtʃəndaɪz/", "Noun", "les produits dérivés / le merchandising", "Selling T-shirts and vinyl merchandise funds independent studio recordings.", "Vendre des tee-shirts finance les enregistrements studio."],
      ["crowdfunding", "/ˈkraʊdfʌndɪŋ/", "Noun", "le financement participatif", "Direct fan crowdfunding liberates musicians from corporate interference.", "Le financement direct par les fans libère des majors."],
      ["monopoly", "/məˈnɒpəli/", "Noun", "le monopole de marché", "Regulatory bodies investigate streaming monopolies.", "Les autorités régulatrices enquêtent sur les monopoles du streaming."],
      ["licensing", "/ˈlaɪsnsɪŋ/", "Noun", "l'octroi de licences de diffusion", "Sync licensing for video games provides steady income.", "Les licences pour les jeux vidéo apportent un revenu régulier."],
      ["fair compensation", "/fɛər ˌkɒmpɛnˈseɪʃn/", "Noun", "la rémunération équitable", "Artists campaign for fair compensation in the digital era.", "Les artistes militent pour une juste rémunération numérique."]
    ],
    dialogue: {
      title: "Débat sur la rémunération du streaming musical", setting: "Des élèves de première analysent l'économie numérique de la musique.",
      lines: [
        ["Student A", "Did you know an artist needs hundreds of thousands of streams just to earn minimum wage?", "Savais-tu qu'un artiste a besoin de centaines de milliers d'écoutes pour gagner le SMIC ?"],
        ["Student B", "Yes, musicians demand that streaming platforms revise their revenue distribution models.", "Oui, les musiciens exigent que les plateformes revoient leur modèle de répartition."],
        ["Student A", "Independent artists insist that fans buy albums directly on community platforms or purchase vinyl.", "Les indépendants insistent pour que les fans achètent directement sur les plateformes communautaires."],
        ["Student B", "Live concert tickets and merchandise have become the true economic lifeline for bands.", "Les billets de concert et le merchandising sont devenus le vrai poumon économique des groupes."]
      ]
    },
    dictation: { prompt: "Artists demand that platforms pay fair royalties for every stream.", fr: "Les artistes exigent que les plateformes versent des droits équitables pour chaque écoute." },
    quiz: [
      { q: "Quelle phrase illustre le subjonctif mandatif formel ?", opts: ["They insist that he pays his royalties.", "They insist that he pay his royalties.", "They insist that he will pay his royalties.", "They insist him to pay."], a: 1, exp: "Le subjonctif mandatif exige la base verbale nue pour toutes les personnes : 'insist that he PAY'." },
      { q: "Comment les artistes indépendants compensent-ils la faiblesse des revenus du streaming ?", opts: ["En arrêtant la musique", "Par les concerts live, la vente de vinyles et les produits dérivés", "En travaillant dans les banques", "En payant la radio"], a: 1, exp: "Les tournées, le merchandising et les ventes directes de vinyles constituent désormais les principales rentrées." },
      { q: "Que signifie 'royalties' dans l'industrie musicale ?", opts: ["La famille royale", "Les droits d'auteur perçus sur l'exploitation d'une œuvre", "Le prix du ticket de concert", "L'instrument du batteur"], a: 1, exp: "'Royalties' désigne les redevances ou droits d'auteur versés aux créateurs." }
    ]
  },
  {
    grade: '1re', theme_id: 'music', num: 3,
    title: 'Minimalisme musical & textures ambiantes',
    title_en: 'Musical Minimalism & Ambient Sound',
    objective: 'Analyser la musique répétitive et minimaliste américaine (Philip Glass, Steve Reich) avec les adjectifs formels.',
    grammar: {
      title: "Les propositions subordonnées de comparaison hypothétique avec AS IF / AS THOUGH (+ prétérit modal)",
      rule: "Pour décrire une impression esthétique comme si elle était réelle : The repetitive phasing shifts as if time itself were suspended.",
      example_en: "Steve Reich's polyrhythms hypnotic waves pulse as though modern industrial machinery were singing.",
      example_fr: "Les vagues polyrythmiques hypnotiques de Steve Reich pulsent comme si la mécanique industrielle moderne chantait.",
      tip: "As if time WERE suspended (were s'emploie pour le singulier dans le style soutenu).",
      level_focus: "Comparaisons hypothétiques avec as if / as though."
    },
    vocab: [
      ["minimalism", "/ˈmɪnɪməlɪzəm/", "Noun", "le minimalisme musical", "American minimalism stripped music of romantic excess.", "Le minimalisme américain a épuré la musique du trop-plein romantique."],
      ["phasing", "/ˈfeɪzɪŋ/", "Noun", "le déphasage musical progressif (Reich)", "Phasing occurs when two identical loops gradually drift apart in time.", "Le déphasage survient quand deux boucles se décalent lentement."],
      ["repetition", "/ˌrɛpəˈtɪʃn/", "Noun", "la répétition en boucle", "Hypnotic repetition alters listeners' perception of time.", "La répétition hypnotique modifie la perception du temps."],
      ["polyphony", "/pəˈlɪfəni/", "Noun", "la polyphonie", "Intricate modal polyphony weaves serene sonic tapestries.", "Une polyphonie modale tisse de sereines tapisseries sonores."],
      ["soundscape", "/ˈsaʊndskeɪp/", "Noun", "le paysage sonore / soundscape", "Brian Eno pioneered ambient soundscapes for airports.", "Brian Eno a conçu des paysages sonores d'aéroports."],
      ["drone", "/droʊn/", "Noun", "le bourdon / note tenue continue", "A sustained electronic drone anchors the meditation track.", "Un bourdon continu ancre la piste de méditation."],
      ["contemplation", "/ˌkɒntəmˈpleɪʃn/", "Noun", "la contemplation méditative", "Repetitive acoustic motifs induce profound spiritual contemplation.", "Des motifs répétés induisent une profonde contemplation."],
      ["texture", "/ˈtɛkstʃər/", "Noun", "la texture sonore / le grain", "Layering marimbas and vibraphones produces warm percussive textures.", "Superposer marimbas et vibraphones offre des textures chaudes."],
      ["trance", "/trɑːns/", "Noun", "l'état de transe hypnotique", "Gradual polyrhythms lull the conscious mind into gentle trance.", "Les polyrythmes bercent l'esprit conscient dans une douce transe."],
      ["avant-garde", "/ˌævɑːŋ ˈɡɑːrd/", "Adjective", "d'avant-garde", "New York's 1960s avant-garde redefined the boundaries of music.", "L'avant-garde new-yorkaise des années 60 a redéfini les frontières musicales."]
    ],
    dialogue: {
      title: "Écoute de Music for 18 Musicians de Steve Reich", setting: "Des élèves de lycée découvrent la musique répétitive américaine.",
      lines: [
        ["Teacher", "Listen closely to the pulses of marimbas, clarinets and female voices.", "Écoutez attentivement les pulsations de marimbas, clarinettes et voix féminines."],
        ["Student", "It sounds as though time were suspended; the patterns change so gradually you hardly notice.", "On dirait que le temps est suspendu ; les motifs changent si lentement qu'on le remarque à peine."],
        ["Teacher", "That is Steve Reich's signature technique called phasing and additive rhythm.", "C'est la technique emblématique de Steve Reich appelée déphasage et rythme additif."],
        ["Student", "It feels almost like watching light shift slowly across the ocean at sunset.", "C'est presque comme regarder la lumière changer lentement sur l'océan au crépuscule."]
      ]
    },
    dictation: { prompt: "The repetitive music pulsed as though time itself were suspended.", fr: "La musique répétitive pulsait comme si le temps lui-même était suspendu." },
    quiz: [
      { q: "Quel compositeur américain est célèbre pour sa technique de déphasage (phasing) et 'Music for 18 Musicians' ?", opts: ["Steve Reich", "Ludwig van Beethoven", "Elvis Presley", "Miles Davis"], a: 0, exp: "Steve Reich est l'un des pères fondateurs du minimalisme et du déphasage musical." },
      { q: "Quelle forme de BE utilise-t-on traditionnellement dans le style soutenu après 'as if' pour un singulier ?", opts: ["was", "were", "is", "be"], a: 1, exp: "Dans le registre soutenu, le subjonctif prétérit 'were' s'utilise pour toutes les personnes (as if time were suspended)." },
      { q: "Quel musicien britannique a conceptualisé l'ambient music avec 'Music for Airports' en 1978 ?", opts: ["Brian Eno", "Paul McCartney", "David Bowie", "Mick Jagger"], a: 0, exp: "Brian Eno a inventé et théorisé l'ambient music pour créer des atmosphères sonores apaisantes." }
    ]
  },
  {
    grade: '1re', theme_id: 'restaurant', num: 2,
    title: 'Restaurants solidaires & gastronomie sociale',
    title_en: 'Social Dining & Community Kitchens',
    objective: 'Analyser les initiatives culinaires solidaires qui réinsèrent les personnes défavorisées avec les modaux d\'engagement.',
    grammar: {
      title: "Les propositions subordonnées de manière avec THE WAY IN WHICH / HOW",
      rule: "Pour décrire un procédé social ou une méthode novatrice : Community kitchens demonstrate the way in which culinary training transforms lives.",
      example_en: "Social dining enterprises exemplify how culinary passion can restore human dignity to the homeless.",
      example_fr: "Les entreprises de restauration solidaire illustrent comment la passion culinaire peut restaurer la dignité des personnes sans abri.",
      tip: "The way in which = How (forme plus académique).",
      level_focus: "Subordonnées de manière soutenues (the way in which, whereby)."
    },
    vocab: [
      ["social enterprise", "/ˈsoʊʃl ˈɛntərpraɪz/", "Noun", "l'entreprise sociale et solidaire (ESS)", "Social enterprises reinvest commercial profits to train marginalized youth.", "Les entreprises sociales réinvestissent les bénéfices pour former les jeunes."],
      ["community kitchen", "/kəˈmjuːnəti ˈkɪtʃɪn/", "Noun", "la cuisine solidaire / cantine de quartier", "Volunteers cook three hundred healthy meals in the community kitchen.", "Des bénévoles cuisinent trois cents repas sains dans la cuisine solidaire."],
      ["homelessness", "/ˈhoʊmləsnəs/", "Noun", "le sans-abrisme / la grande précarité", "Culinary apprenticeships help individuals escape chronic homelessness.", "Les formations culinaires aident à sortir de la grande précarité."],
      ["dignity", "/ˈdɪɡnəti/", "Noun", "la dignité humaine", "Eating a beautifully plated warm meal restores self-dignity.", "Manger un repas chaud bien présenté restaure la dignité."],
      ["reintegration", "/ˌriːɪntɪˈɡreɪʃn/", "Noun", "la réinsertion professionnelle", "Professional culinary training provides a pathway to social reintegration.", "La formation culinaire offre une voie vers la réinsertion."],
      ["apprenticeship", "/əˈprɛntɪsʃɪp/", "Noun", "le contrat d'apprentissage qualifiant", "Jamie Oliver's Fifteen restaurant offered apprenticeships to unemployed youths.", "Le restaurant Fifteen de Jamie Oliver offrait des apprentissages aux jeunes."],
      ["surplus food", "/ˈsɜːrpləs fuːd/", "Noun", "les surplus et invendus alimentaires", "Chefs collect surplus food from supermarkets to cook gourmet dishes.", "Les chefs collectent les surplus des supermarchés pour cuisiner."],
      ["pay-what-you-can", "/peɪ wɒt juː kæn/", "Adjective", "à prix libre et solidaire", "The pay-what-you-can café welcomes all citizens equally.", "Le café à prix libre accueille tous les citoyens sur un pied d'égalité."],
      ["empower", "/ɪmˈpaʊər/", "Verb", "émanciper / donner le pouvoir d'agir", "Cooking skills empower people to build independent futures.", "Les compétences culinaires permettent de bâtir un avenir indépendant."],
      ["inclusive", "/ɪnˈkluːsɪv/", "Adjective", "inclusif / solidaire", "An inclusive dining table breaks down social barriers.", "Une table solidaire brise les barrières sociales."]
    ],
    dialogue: {
      title: "Le modèle du restaurant Fifteen de Jamie Oliver", setting: "Des lycéens étudient les entreprises solidaires britanniques.",
      lines: [
        ["Student A", "How did Jamie Oliver's Fifteen project pioneer social enterprise in British gastronomy?", "Comment le projet Fifteen de Jamie Oliver a-t-il été pionnier dans la gastronomie solidaire ?"],
        ["Teacher", "He recruited fifteen disadvantaged young people and trained them into world-class professional chefs.", "Il a recruté quinze jeunes en difficulté et les a formés pour devenir des chefs de haut niveau."],
        ["Student B", "The way in which fine dining was combined with social reintegration proved truly revolutionary.", "La manière dont la gastronomie a été conjuguée à la réinsertion s'est révélée révolutionnaire."],
        ["Teacher", "Today, pay-what-you-can community kitchens salvage surplus food to feed the hungry with dignity.", "Aujourd'hui, des cantines solidaires récupèrent les invendus pour nourrir dans la dignité."]
      ]
    },
    dictation: { prompt: "Community kitchens show the way in which cooking restores human dignity.", fr: "Les cuisines solidaires montrent comment la cuisine restaure la dignité humaine." },
    quiz: [
      { q: "Quel grand chef britannique a créé en 2002 le restaurant solidaire 'Fifteen' pour former des jeunes sans emploi ?", opts: ["Gordon Ramsay", "Jamie Oliver", "Heston Blumenthal", "Rick Stein"], a: 1, exp: "Jamie Oliver a fondé 'Fifteen' à Londres pour former des jeunes défavorisés aux métiers de la gastronomie." },
      { q: "Que signifie le concept de restaurant 'pay-what-you-can' ?", opts: ["Un restaurant gratuit pour les touristes", "Un établissement à contribution libre où chacun paie selon ses moyens", "Un fast-food", "Un buffet payant d'avance"], a: 1, exp: "Le système 'pay-what-you-can' permet à chacun de contribuer selon ses ressources financières." },
      { q: "Que font les cuisines solidaires avec les 'surplus food' des supermarchés ?", opts: ["Elles les jettent", "Elles les transforment en repas chauds gastronomiques et nutritifs", "Elles les revendent cher", "Elles les exportent"], a: 1, exp: "Ces associations valorisent les invendus encore sains pour cuisiner des repas dignes." }
    ]
  },
  {
    grade: '1re', theme_id: 'restaurant', num: 3,
    title: 'Cuisine fusion & métissage culturel',
    title_en: 'Fusion Cuisine & Cultural Diaspora',
    objective: 'Analyser comment les diasporas ont réinventé les traditions culinaires anglo-saxonnes avec les connecteurs de nuance.',
    grammar: {
      title: "Les propositions de concession contrastée avec IN CONTRAST TO et UNLIKE",
      rule: "On utilise 'unlike + nom' ou 'in contrast to + nom' pour marquer une divergence culturelle saisissante en tête de phrase.",
      example_en: "Unlike traditional purists, modern fusion chefs embrace culinary hybridity as a celebration of global migration.",
      example_fr: "À la différence des traditionalistes stricts, les chefs de cuisine fusion adoptent l'hybridation comme une célébration des migrations mondiales.",
      tip: "Contrairement à whereas (qui relie deux phrases), unlike s'associe à un groupe nominal.",
      level_focus: "Prépositions de contraste (unlike, in contrast to, contrary to)."
    },
    vocab: [
      ["fusion cuisine", "/ˈfjuːʒn kwɪˈziːn/", "Noun", "la cuisine fusion / métissée", "Anglo-Indian fusion cuisine created the iconic coronation chicken in 1953.", "La cuisine anglo-indienne a créé le fameux coronation chicken en 1953."],
      ["diaspora", "/daɪˈæspərə/", "Noun", "la diaspora culturelle", "The Caribbean diaspora introduced jerk spices and plantains to London.", "La diaspora caribéenne a apporté les épices jerk et le plantain."],
      ["hybridity", "/haɪˈbrɪdəti/", "Noun", "l'hybridité culturelle", "Culinary hybridity reflects the cosmopolitan tapestry of modern cities.", "L'hybridité culinaire reflète la mixité cosmopolite des métropoles."],
      ["authenticity", "/ˌɔːθɛnˈtɪsəti/", "Noun", "l'authenticité vivante", "Chefs debate whether fusion dilutes or revitalizes culinary authenticity.", "Les chefs débattent de savoir si la fusion revigore l'authenticité."],
      ["heritage", "/ˈhɛrɪtɪdʒ/", "Noun", "le patrimoine culinaire", "Preserving family recipes keeps ancestral migrant heritage alive.", "Préserver les recettes familiales maintient vivant l'héritage ancestral."],
      ["reinvent", "/ˌriːɪnˈvɛnt/", "Verb", "réinventer / métisser", "Second-generation restaurateurs reinvent classic comfort dishes.", "Les restaurateurs de seconde génération réinventent les classiques."],
      ["spices", "/ˈspaɪsɪz/", "Noun", "les épices du monde", "Toasted cumin, star anise and lemongrass bridge cultural divides.", "Cumin grillé, badiane et citronnelle comblent les fossés culturels."],
      ["street stall", "/striːt stɔːl/", "Noun", "le stand de rue métissé", "London's Brick Lane is famous for Bangladeshi curry houses.", "Brick Lane à Londres est célèbre pour ses restaurants de curry bangladais."],
      ["palate", "/ˈpælət/", "Noun", "le palais / goût éclectique", "Global travel has trained Western palates to savor complex flavors.", "Les voyages ont habitué les palais occidentaux aux saveurs complexes."],
      ["cosmopolitan", "/ˌkɒzməˈpɒlɪtən/", "Adjective", "cosmopolite", "Cosmopolitan cities embrace migrant culinary creativity with gusto.", "Les villes cosmopolites accueillent la créativité culinaire migrante."]
    ],
    dialogue: {
      title: "L'histoire du 'Coronation Chicken' de 1953", setting: "Des élèves découvrent l'histoire d'un plat symbole de fusion.",
      lines: [
        ["Teacher", "Who invented Coronation Chicken for Queen Elizabeth II's banquet in 1953?", "Qui a inventé le poulet du couronnement pour le banquet d'Élisabeth II en 1953 ?"],
        ["Student", "Cordon Bleu chefs mixed cold poached chicken with curry spices, apricot puree and mayonnaise.", "Des chefs ont mêlé poulet poché froid, épices de curry, abricots et mayonnaise."],
        ["Teacher", "Unlike rigid traditional menus, it acknowledged Britain's changing post-war imperial relationship with India.", "À la différence des menus rigides, il reconnaissait les liens changeants d'après-guerre avec l'Inde."],
        ["Student", "It proved that culinary fusion can become a beloved national classic.", "Cela a prouvé que la fusion culinaire peut devenir un classique national adoré."]
      ]
    },
    dictation: { prompt: "Unlike rigid traditional cuisine, fusion chefs embrace cultural hybridity.", fr: "À la différence de la cuisine traditionnelle rigide, les chefs fusion adoptent l'hybridité culturelle." },
    quiz: [
      { q: "Quelle préposition s'emploie devant un nom pour signifier 'À la différence de...' ?", opts: ["Unlike", "Whereas", "Although", "Despite of"], a: 0, exp: "'Unlike + nom' signifie 'À la différence de / contrairement à'." },
      { q: "Quel plat emblématique froid mariant curry doux et poulet fut créé pour le couronnement d'Élisabeth II en 1953 ?", opts: ["Fish and chips", "Coronation Chicken", "Shepherd's pie", "Haggis"], a: 1, exp: "Le 'Coronation Chicken' est le plat emblématique anglo-indien créé pour le couronnement de 1953." },
      { q: "Quelle célèbre rue londonienne de l'East End est surnommée la capitale du curry bangladais ?", opts: ["Oxford Street", "Brick Lane", "Abbey Road", "Baker Street"], a: 1, exp: "Brick Lane dans l'East End de Londres est le cœur historique des curry houses bangladais." }
    ]
  },
  {
    grade: '1re', theme_id: 'food', num: 2,
    title: 'Biotechnologies agricoles & défis climatiques',
    title_en: 'Agricultural Biotech & Resilient Crops',
    objective: 'Débattre des semences résistantes à la sécheresse, des OGM et de l\'éthique agronomique.',
    grammar: {
      title: "L'expression de la cause complexe avec OWING TO et ON ACCOUNT OF",
      rule: "Dans un article scientifique ou de débat de société, on emploie 'owing to' ou 'on account of' suivis d'un groupe nominal pour exprimer la cause formelle.",
      example_en: "Owing to worsening global droughts, agronomists are developing genetically modified drought-resistant crops.",
      example_fr: "En raison de l'aggravation des sécheresses mondiales, les agronomes développent des cultures génétiquement modifiées résistantes au manque d'eau.",
      tip: "Synonyme soutenu de 'because of'.",
      level_focus: "Prépositions causales soutenues (owing to, on account of, due to)."
    },
    vocab: [
      ["biotechnology", "/ˌbaɪoʊtɛkˈnɒlədʒi/", "Noun", "la biotechnologie agricole", "Biotechnology promises crops capable of withstanding extreme salinization.", "La biotechnologie promet des plantes tolérant la salinisation."],
      ["drought-resistant", "/draʊt rɪˈzɪstənt/", "Adjective", "résistant à la sécheresse", "Gene-edited drought-resistant maize yields grain with 40% less water.", "Le maïs résistant à la sécheresse produit avec 40% d'eau en moins."],
      ["genetic modification", "/dʒəˈnɛtɪk ˌmɒdɪfɪˈkeɪʃn/", "Noun", "la modification génétique (OGM)", "Genetic modification remains an intense subject of ethical debate.", "La modification génétique demeure un sujet de vif débat éthique."],
      ["yield", "/jiːld/", "Noun", "le rendement agricole", "Climate volatility threatens to slash annual agricultural yields.", "L'instabilité climatique menace de faire chuter les rendements."],
      ["pesticide", "/ˈpɛstɪsaɪd/", "Noun", "le pesticide chimique", "Bioengineered resistance reduces the need for toxic chemical pesticides.", "La résistance biologique réduit le recours aux pesticides chimiques."],
      ["biodiversity", "/ˌbaɪoʊdaɪˈvɜːrsəti/", "Noun", "la biodiversité végétale", "Monocultures endanger wild heirloom seed biodiversity.", "Les monocultures mettent en péril la biodiversité des semences anciennes."],
      ["patent", "/ˈpætnt/", "Noun", "le brevet industriel sur le vivant", "Corporations holding seed patents spark fierce peasant protests.", "Les multinationales brevetant les semences suscitent des contestations paysannes."],
      ["soil depletion", "/sɔɪl dɪˈpliːʃn/", "Noun", "l'épuisement des sols", "Regenerative cover crops reverse severe chemical soil depletion.", "Les couverts végétaux inversent l'épuisement des sols."],
      ["ethics", "/ˈɛθɪks/", "Noun", "l'éthique scientifique", "Scientific ethics must balance humanitarian hunger relief with ecological safety.", "L'éthique doit concilier lutte contre la faim et sécurité écologique."],
      ["resilient", "/rɪˈzɪliənt/", "Adjective", "résilient / robuste", "Breeding resilient varieties is imperative for future food security.", "Sélectionner des variétés résilientes est impératif pour la sécurité future."]
    ],
    dialogue: {
      title: "Conférence scientifique sur le génie génétique végétal", setting: "Des élèves de première assistent à une visioconférence avec un agronome.",
      lines: [
        ["Student A", "Owing to unprecedented heatwaves, harvests dropped sharply across Southern Europe last summer.", "En raison de canicules inédites, les récoltes ont chuté en Europe du Sud l'été dernier."],
        ["Agronomist", "Yes, on account of climate urgency, researchers are accelerating trials of drought-resistant seeds.", "Oui, en raison de l'urgence climatique, la recherche accélère les essais de semences résistantes."],
        ["Student B", "Do seed patents threaten the independence of smallholder farmers in developing nations?", "Les brevets sur les semences menacent-ils l'autonomie des petits paysans dans les pays émergents ?"],
        ["Agronomist", "That is the core ethical dilemma: technological progress must not become an economic monopoly.", "C'est le dilemme éthique central : le progrès technique ne doit pas devenir un monopole."]
      ]
    },
    dictation: { prompt: "Owing to severe droughts, scientists engineered resilient crop varieties.", fr: "En raison de graves sécheresses, les scientifiques ont conçu des variétés résilientes." },
    quiz: [
      { q: "Quelle préposition causale formelle est suivie d'un groupe nominal pour signifier 'en raison de' ?", opts: ["Owing to", "Because", "Since that", "Unless"], a: 0, exp: "'Owing to' (+ groupe nominal) est une formulation causale soutenue signifiant 'en raison de'." },
      { q: "Que signifie l'adjectif 'drought-resistant' appliqué aux cultures agricoles ?", opts: ["Qui pousse dans le noir", "Capable de survivre et produire avec peu d'eau en période de sécheresse", "Qui craint le gel", "Qui attire les abeilles"], a: 1, exp: "'Drought-resistant' qualifie les variétés tolérant les pénuries d'eau et sécheresses." },
      { q: "Quel risque éthique majeur est soulevé par les brevets sur les semences OGM ?", opts: ["Le prix des engrais", "La dépendance économique accrue des agriculteurs envers les multinationales de semences", "La couleur des feuilles", "La taille des tracteurs"], a: 1, exp: "Le brevetage du vivant risque d'asservir les agriculteurs contraints de racheter leurs semences chaque année." }
    ]
  },
  {
    grade: '1re', theme_id: 'work', num: 2,
    title: 'L\'intelligence artificielle générative au travail',
    title_en: 'Generative AI & Office Productivity',
    objective: 'Analyser l\'impact de l\'IA générative sur les métiers intellectuels, l\'automatisation et l\'éthique du travail.',
    grammar: {
      title: "Les propositions subordonnées temporelles au futur avec AS SOON AS, ONCE et WHEN (+ présent)",
      rule: "Attention à la règle d'or de l'anglais : dans une proposition subordonnée de temps référant au futur, on utilise le PRÉSENT SIMPLE, jamais will : Once AI automates routine tasks, professionals will focus on creative strategy.",
      example_en: "As soon as generative algorithms draft the first report, analysts will synthesize strategic decisions.",
      example_fr: "Dès que les algorithmes génératifs rédigeront le premier rapport, les analystes synthétiseront les décisions stratégiques.",
      tip: "Rappelez-vous : pas de 'will' après when, as soon as, once, until !",
      level_focus: "Concordance des temps dans les subordonnées temporelles futures."
    },
    vocab: [
      ["generative AI", "/ˈdʒɛnərətɪv eɪ aɪ/", "Noun", "l'intelligence artificielle générative", "Generative AI creates text, code and imagery from natural prompts.", "L'IA générative crée texte, code et images à partir de requêtes."],
      ["automation", "/ˌɔːtəˈmeɪʃn/", "Noun", "l'automatisation des tâches répétitives", "Robotic process automation accelerates data entry and indexing.", "L'automatisation accélère la saisie et l'indexation de données."],
      ["productivity", "/ˌprɒdʌkˈtɪvəti/", "Noun", "la productivité globale", "AI tools deliver significant productivity gains for white-collar workers.", "Les outils d'IA apportent des gains de productivité aux employés."],
      ["job displacement", "/dʒɒb dɪsˈpleɪsmənt/", "Noun", "la suppression / mutation d'emplois", "Economists debate whether automation will trigger mass job displacement.", "Les économistes débattent du risque de destructions massives d'emplois."],
      ["prompt engineering", "/prɒmpt ˌɛndʒɪˈnɪərɪŋ/", "Noun", "l'ingénierie de prompt / formulation de requêtes", "Mastering prompt engineering optimizes high-quality model outputs.", "Maîtriser les requêtes optimise la qualité des réponses."],
      ["critical thinking", "/ˈkrɪtɪkl ˈθɪŋkɪŋ/", "Noun", "l'esprit critique / le discernement", "Critical thinking is indispensable to verify AI-generated hallucinations.", "L'esprit critique est indispensable pour vérifier les hallucinations d'IA."],
      ["ethical guidelines", "/ˈɛθɪkl ˈɡaɪdlaɪnz/", "Noun", "les chartes et cadres éthiques", "Enterprises establish ethical guidelines to prevent algorithmic bias.", "Les entreprises fixent des règles éthiques contre les biais."],
      ["upskilling", "/ˈʌpskɪlɪŋ/", "Noun", "la montée en compétences / formation continue", "Continuous upskilling shields professionals against obsolescence.", "La montée en compétences protège contre l'obsolescence."],
      ["hallucination", "/həˌluːsɪˈneɪʃn/", "Noun", "l'hallucination d'IA (réponse inventée fausse)", "Always fact-check AI outputs to detect plausible hallucinations.", "Vérifiez toujours les faits pour repérer les hallucinations plausibles."],
      ["collaborative", "/kəˈlæbərətɪv/", "Adjective", "collaboratif (humain-machine)", "The future workplace relies on collaborative human-AI partnerships.", "Le travail de demain reposera sur la collaboration humain-IA."]
    ],
    dialogue: {
      title: "L'intelligence artificielle au cabinet de conseil", setting: "Des stagiaires de première assistent à une démonstration d'outils d'IA.",
      lines: [
        ["Director", "Once generative AI automates routine research summaries, what will junior consultants do?", "Une fois que l'IA automatisera les synthèses de recherche, que feront les consultants juniors ?"],
        ["Student", "They will focus on critical analysis, ethical auditing and direct human client relationships.", "Ils se concentreront sur l'analyse critique, l'audit éthique et la relation client humaine."],
        ["Director", "As soon as our teams master advanced prompt engineering, our analytical speed will double.", "Dès que nos équipes maîtriseront les prompts avancés, notre vitesse d'analyse doublera."],
        ["Student", "Human judgment and empathy remain completely irreplaceable by algorithms.", "Le jugement humain et l'empathie demeurent totalement irremplaçables par les algorithmes."]
      ]
    },
    dictation: { prompt: "Once AI automates routine tasks, humans will focus on creative strategy.", fr: "Une fois que l'IA automatisera les tâches de routine, les humains se concentreront sur la stratégie créative." },
    quiz: [
      { q: "Quel temps s'utilise après 'once' ou 'as soon as' pour désigner une action future ?", opts: ["Le futur avec will", "Le présent simple", "Le conditionnel", "Le past perfect"], a: 1, exp: "Règle absolue : dans les subordonnées de temps futures, on emploie le présent simple ('Once AI automates...')." },
      { q: "Qu'appelle-t-on une 'hallucination' dans le domaine de l'IA générative ?", opts: ["Un virus informatique", "Une réponse inventée, fausse mais présentée de façon convaincante par le modèle", "Une panne d'écran", "Un mot de passe oublié"], a: 1, exp: "Une hallucination d'IA désigne une information factuellement fausse générée avec une fausse assurance." },
      { q: "Que signifie 'upskilling' en ressources humaines ?", opts: ["Réduire les salaires", "La formation continue pour monter en compétences et s'adapter aux nouveaux outils", "Partir à la retraite", "Démissionner"], a: 1, exp: "'Upskilling' désigne le perfectionnement professionnel continu pour maîtriser les nouvelles technologies." }
    ]
  },
  {
    grade: '1re', theme_id: 'work', num: 3,
    title: 'L\'économie des plateformes & travail indépendant',
    title_en: 'The Gig Economy & Freelance Labor',
    objective: 'Analyser l\'ubérisation, la flexibilité et les droits des travailleurs de plateformes avec les connecteurs de balance.',
    grammar: {
      title: "L'expression de la double facette avec ON THE ONE HAND... ON THE OTHER HAND",
      rule: "Pour peser le pour et le contre dans une dissertation argumentée : On the one hand, gig platforms offer schedule autonomy; on the other hand, workers lack social safety nets.",
      example_en: "On the one hand, freelancing empowers individuals to set their own hours; on the other hand, it often deprives them of paid sick leave.",
      example_fr: "D'un côté, le travail indépendant permet de fixer ses propres horaires ; d'un autre côté, il prive souvent des congés maladie payés.",
      tip: "Toujours utiliser les deux membres de la corrélation pour équilibrer la réflexion.",
      level_focus: "Balance d'arguments contradictoires (on the one hand / on the other hand)."
    },
    vocab: [
      ["gig economy", "/ɡɪɡ ɪˈkɒnəmi/", "Noun", "l'économie des petits boulots / l'ubérisation", "The gig economy expanded through on-demand smartphone delivery apps.", "L'économie des plateformes a explosé via les applications à la demande."],
      ["freelancer", "/ˈfriːlɑːnsər/", "Noun", "le travailleur indépendant / freelance", "Freelancers negotiate contracts directly with diverse clients.", "Les freelances négocient directement avec des clients divers."],
      ["autonomy", "/ɔːˈtɒnəmi/", "Noun", "l'autonomie d'organisation", "Schedule autonomy is the primary attraction of independent freelancing.", "L'autonomie horaire est la première attraction du travail indépendant."],
      ["precarity", "/prɪˈkærəti/", "Noun", "la précarité sociale et financière", "Irregular monthly income plunges gig workers into financial precarity.", "Des revenus irréguliers plongent les travailleurs dans la précarité."],
      ["algorithm", "/ˈælɡərɪðəm/", "Noun", "le management algorithmique", "Delivery couriers are monitored by algorithmic ratings and timers.", "Les livreurs sont surveillés par des notations algorithmiques."],
      ["safety net", "/ˈseɪfti nɛt/", "Noun", "le filet de sécurité sociale (chômage, retraite)", "Traditional employment contracts guarantee a vital social safety net.", "Les contrats traditionnels garantissent un filet social vital."],
      ["sick leave", "/sɪk liːv/", "Noun", "le congé maladie indemnisé", "Platform couriers battle for the right to paid sick leave.", "Les livreurs se battent pour des congés maladie payés."],
      ["misclassification", "/ˌmɪsˌklæsɪfɪˈkeɪʃn/", "Noun", "la fausse qualification / salariat déguisé", "Courts ruled that platform couriers suffered from bogus misclassification.", "Les tribunaux ont jugé qu'il s'agissait de salariat déguisé."],
      ["collective bargaining", "/kəˈlɛktɪv ˈbɑːrɡənɪŋ/", "Noun", "la négociation collective / syndicale", "Gig workers unionize to engage in collective bargaining for minimum rates.", "Les coursiers s'organisent pour négocier collectivement."],
      ["flexible", "/ˈflɛksəbl/", "Adjective", "flexible / adaptable", "Flexible working arrangements attract digital nomads worldwide.", "Des arrangements flexibles séduisent les nomades numériques."]
    ],
    dialogue: {
      title: "Débat sur le statut des livreurs de plateformes", setting: "Des lycéens examinent un arrêt récent de la Cour suprême britannique.",
      lines: [
        ["Student A", "On the one hand, gig platforms offer flexible work to students who need immediate pocket money.", "D'un côté, les plateformes offrent du travail flexible aux étudiants qui ont besoin d'argent."],
        ["Student B", "On the other hand, the Supreme Court ruled that drivers are workers entitled to holiday pay and the minimum wage.", "De l'autre, la Cour suprême a jugé que les chauffeurs ont droit aux congés et au salaire minimum."],
        ["Student A", "Algorithmic management often penalizes couriers who refuse difficult delivery routes.", "Le management par algorithme pénalise souvent les coursiers qui refusent des trajets difficiles."],
        ["Student B", "True independence requires both freedom of schedule and fair protection from exploitation.", "La vraie indépendance exige à la fois liberté d'horaires et protection contre l'exploitation."]
      ]
    },
    dictation: { prompt: "On the one hand gig work is flexible, on the other hand it lacks a safety net.", fr: "D'un côté le travail de plateforme est flexible, de l'autre il manque de filet de sécurité." },
    quiz: [
      { q: "Quelle paire de connecteurs permet d'opposer deux aspects complémentaires d'un problème ?", opts: ["On the one hand ... on the other hand", "First ... second", "Because ... therefore", "Unless ... provided"], a: 0, exp: "'On the one hand... on the other hand' permet de peser de façon équilibrée le pour et le contre." },
      { q: "Que désigne la 'gig economy' ?", opts: ["L'industrie du spectacle uniquement", "Le modèle économique basé sur des missions ponctuelles via des plateformes numériques", "Le commerce équitable", "Le secteur bancaire"], a: 1, exp: "La 'gig economy' désigne l'économie à la demande (coursiers, chauffeurs VTC, freelances sur plateformes)." },
      { q: "Qu'ont reconnu plusieurs hautes cours européennes concernant les travailleurs de plateformes ?", opts: ["Qu'ils doivent travailler gratuitement", "Qu'ils ont droit au statut de salarié ou travailleur protégé (congés, salaire minimum)", "Qu'ils n'ont aucun droit", "Qu'ils doivent payer la plateforme"], a: 1, exp: "Les tribunaux ont requalifié ces travailleurs pour leur garantir un salaire minimum et des congés." }
    ]
  },
  {
    grade: '1re', theme_id: 'school_social', num: 2,
    title: 'Journalisme d\'investigation & liberté de la presse',
    title_en: 'Investigative Journalism & Free Press',
    objective: 'Comprendre le rôle des lanceurs d\'alerte, de l\'enquête de terrain et du 4e pouvoir avec les passifs d\'opinion.',
    grammar: {
      title: "L'inversion du sujet après propositions comparatives (AS DID, AS WERE)",
      rule: "Dans un style journalistique soutenu : The investigative reporters risked imprisonment, as did their anonymous whistleblowers.",
      example_en: "The Washington Post journalists relentlessly uncovered political corruption, as did their courageous whistleblower sources.",
      example_fr: "Les journalistes du Washington Post ont mis au jour sans relâche la corruption politique, tout comme l'ont fait leurs courageux lanceurs d'alerte.",
      tip: "As + auxiliaire + sujet (effet stylistique d'élégance rhétorique).",
      level_focus: "Inversion comparative avec AS / SO (as did they)."
    },
    vocab: [
      ["investigative journalism", "/ɪnˈvɛstɪɡətɪv ˈdʒɜːrnəlɪzəm/", "Noun", "le journalisme d'investigation", "Investigative journalism acts as the watchdog of democratic governance.", "Le journalisme d'investigation est le chien de garde de la démocratie."],
      ["whistleblower", "/ˈwɪslbloʊər/", "Noun", "le lanceur d'alerte", "Whistleblowers leak classified documents to expose illegal corporate practices.", "Des lanceurs d'alerte transmettent des documents pour dénoncer des dérives."],
      ["freedom of the press", "/ˈfriːdəm əv ðə prɛs/", "Noun", "la liberté de la presse", "Freedom of the press is protected under the First Amendment.", "La liberté de la presse est protégée par le Premier Amendement."],
      ["fact-checking", "/fækt ˈtʃɛkɪŋ/", "Noun", "la vérification des faits / fact-checking", "Rigorous fact-checking disarms weaponized viral misinformation.", "La vérification rigoureuse des faits désarme la désinformation."],
      ["confidential source", "/ˌkɒnfɪˈdɛnʃl sɔːrs/", "Noun", "la source confidentielle", "Reporters protect the identity of confidential sources at all costs.", "Les reporters protègent leurs sources confidentielles à tout prix."],
      ["leak", "/liːk/", "Verb", "faire fuiter des informations", "Insiders leaked financial records detailing offshore tax havens.", "Des initiés ont fait fuiter des registres de paradis fiscaux."],
      ["watchdog", "/ˈwɒtʃdɒɡ/", "Noun", "le contre-pouvoir / le chien de garde démocratique", "The press serves as the Fourth Estate and democratic watchdog.", "La presse sert de quatrième pouvoir et de contre-pouvoir démocratique."],
      ["headline", "/ˈhɛdlaɪn/", "Noun", "la manchette / le gros titre de presse", "Explosive revelations made global front-page headlines.", "Des révélations explosives ont fait la une des journaux mondiaux."],
      ["accountability", "/əˌkaʊntəˈbɪləti/", "Noun", "la redevabilité / transparence des dirigeants", "Journalists demand full accountability from elected officials.", "Les journalistes exigent des comptes des responsables élus."],
      ["integrity", "/ɪnˈtɛɡrəti/", "Noun", "l'intégrité déontologique", "Journalistic integrity requires unbiased impartiality and courage.", "L'intégrité journalistique exige impartialité et courage."]
    ],
    dialogue: {
      title: "L'affaire du Watergate (1972-1974)", setting: "Des lycéens analysent l'enquête de Woodward et Bernstein.",
      lines: [
        ["Teacher", "How did two young Washington Post reporters force a sitting US president to resign in 1974?", "Comment deux jeunes reporters ont-ils poussé un président américain à démissionner en 1974 ?"],
        ["Student", "Bob Woodward and Carl Bernstein investigated the Watergate burglary, as did their anonymous source 'Deep Throat'.", "Woodward et Bernstein ont enquêté sur le Watergate, tout comme leur source secrète 'Gorge Profonde'."],
        ["Teacher", "What democratic principle did this historic investigation demonstrate?", "Quel principe démocratique cette enquête historique a-t-elle démontré ?"],
        ["Student", "That no political leader is above the law, and that an independent press is essential to preserve liberty.", "Que nul dirigeant n'est au-dessus des lois et qu'une presse libre est indispensable pour préserver la liberté."]
      ]
    },
    dictation: { prompt: "Investigative reporters protect their confidential sources at all costs.", fr: "Les journalistes d'investigation protègent leurs sources confidentielles à tout prix." },
    quiz: [
      { q: "Quels deux journalistes du Washington Post ont révélé le scandale du Watergate ayant mené à la démission de Nixon ?", opts: ["Woodward and Bernstein", "Hemingway and Fitzgerald", "Orwell and Huxley", "Twain and Poe"], a: 0, exp: "Bob Woodward et Carl Bernstein ont mené l'enquête historique du Watergate pour le Washington Post." },
      { q: "Que désigne un 'whistleblower' en démocratie ?", opts: ["Un arbitre de foot", "Un lanceur d'alerte qui dénonce des malversations d'intérêt public", "Un musicien", "Un policier municipal"], a: 1, exp: "Un 'whistleblower' est un lanceur d'alerte qui révèle des actes illégaux ou dangereux pour l'intérêt général." },
      { q: "Quel amendement de la Constitution américaine protège expressément la liberté de la presse ?", opts: ["The First Amendment", "The Second Amendment", "The Fifth Amendment", "The Tenth Amendment"], a: 0, exp: "Le Premier Amendement (First Amendment, 1791) garantit la liberté d'expression et de la presse." }
    ]
  }
];
