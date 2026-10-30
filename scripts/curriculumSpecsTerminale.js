// 18 additional lessons for Terminale (Lycée / B2, ouverture C1)

export const SPECS_TERMINALE = [
  {
    grade: 'terminale', theme_id: 'daily_life', num: 2,
    title: 'Transhumanisme & frontières bioéthiques',
    title_en: 'Transhumanism & Bioethics',
    objective: 'Débattre de l\'augmentation cognitive, du génie génétique et de la condition humaine post-moderne avec les structures rhétoriques de haut niveau.',
    grammar: {
      title: "Les propositions infinitives clivées et d'insistance (WHAT TRANSHUMANISM PROPOSES IS TO...)",
      rule: "Dans une argumentation philosophique soutenue au niveau C1, on utilise les phrases clivées pseudo-relatives (Pseudo-cleft sentences) pour cibler la thèse : What bioethicists genuinely question is not technological innovation per se, but the loss of shared human vulnerability.",
      example_en: "What transhumanist thinkers envision is nothing short of overcoming biological mortality through neural synthesis.",
      example_fr: "Ce que les penseurs transhumanistes envisagent n'est rien de moins que surmonter la mortalité biologique par la synthèse neuronale.",
      tip: "Structure : What + proposition + IS + infinitif / proposition.",
      level_focus: "Phrases clivées d'emphase philosophique (cleft sentences)."
    },
    vocab: [
      ["transhumanism", "/trænzˈhjuːmənɪzəm/", "Noun", "le transhumanisme", "Transhumanism advocates deploying emerging biotechnologies to eliminate biological limitations.", "Le transhumanisme prône les biotechnologies pour abolir les limites biologiques."],
      ["biohacking", "/ˈbaɪoʊhækɪŋ/", "Noun", "le biohacking / l'optimisation biologique", "DIY biohacking experiments blur the distinction between medicine and elective enhancement.", "Le biohacking brouille la frontière entre soin et augmentation."],
      ["longevity", "/lɒnˈdʒɛvəti/", "Noun", "la longévité / l'espérance de vie accrue", "Cellular rejuvenation research targets radical human longevity.", "La recherche sur le rajeunissement vise une longévité radicale."],
      ["ethical boundary", "/ˈɛθɪkl ˈbaʊndəri/", "Noun", "la frontière bioéthique", "Genetic alteration of human embryos crosses an irreversible ethical boundary.", "Modifier des embryons franchit une frontière bioéthique irréversible."],
      ["neural interface", "/ˈnjʊərəl ˈɪntərfeɪs/", "Noun", "l'interface cerveau-machine", "Direct neural interfaces link cortical synapses with quantum computers.", "Les interfaces cerveau-machine relient les synapses à l'ordinateur."],
      ["human enhancement", "/ˈhjuːmən ɪnˈhɑːnsmənt/", "Noun", "l'augmentation humaine", "Cognitive enhancement drugs raise acute dilemmas of unfair meritocratic competition.", "Les drogues d'augmentation cognitive posent des dilemmes d'équité."],
      ["inequality", "/ˌɪnɪˈkwɒləti/", "Noun", "l'inégalité génétique et sociale", "Philosophers warn against a dystopian genetic divide between augmented and unaugmented humans.", "Les philosophes redoutent un fossé génétique entre augmentés et non-augmentés."],
      ["post-human", "/poʊst ˈhjuːmən/", "Adjective", "post-humain", "The post-human era envisions consciousness uploaded onto synthetic neural networks.", "L'ère post-humaine imagine la conscience transférée sur réseaux synthétiques."],
      ["vulnerability", "/ˌvʌlnərəˈbɪləti/", "Noun", "la vulnérabilité existentielle", "Shared mortal vulnerability constitutes the bedrock of human empathy.", "La vulnérabilité mortelle partagée fonde l'empathie humaine."],
      ["hubris", "/ˈhjuːbrɪs/", "Noun", "l'hybris / la démesure prométhéenne", "Manipulating our own evolutionary genome borders on technological hubris.", "Manipuler notre génome frôle l'hybris technologique."]
    ],
    dialogue: {
      title: "Colloque international de bioéthique à Oxford", setting: "Des élèves de terminale assistent à un débat contradictoire entre un généticien et une philosophe.",
      lines: [
        ["Bioethicist", "What transhumanists conveniently overlook is the risk of an unbridgeable caste divide between biologically enhanced elites and ordinary mortals.", "Ce que les transhumanistes oublient est le risque d'une scission de castes entre élites augmentées et simples mortels."],
        ["Geneticist", "Yet, what genetic medicine aims to eradicate is debilitating hereditary illnesses that have plagued families for millennia.", "Pourtant, ce que la génétique vise à éradiquer, ce sont les maladies héréditaires invalidantes."],
        ["Bioethicist", "Healing disease is noble; however, engineering artificial genetic superiority threatens the very foundation of democratic equality.", "Soigner est noble ; en revanche, fabriquer une supériorité génétique menace l'égalité démocratique."],
        ["Geneticist", "The challenge lies in establishing transparent multilateral governance before rogue laboratories act unchecked.", "L'enjeu réside dans une gouvernance multilatérale avant que des laboratoires clandestins n'agissent sans contrôle."]
      ]
    },
    dictation: { prompt: "What philosophers question is the ethical dilemma of genetic enhancement.", fr: "Ce que les philosophes interrogent est le dilemme éthique de l'augmentation génétique." },
    quiz: [
      { q: "Quelle structure d'insistance (cleft sentence) souligne l'idée principale au niveau C1 ?", opts: ["What bioethicists argue is that...", "The bioethicists saying that...", "It was because they argue...", "Bioethicists who argue that..."], a: 0, exp: "'What + sujet + verbe + IS + proposition' est la phrase clivée pseudo-relative d'emphase philosophique." },
      { q: "Quel terme grec ancien désigne l'orgueil démesuré et la tentation de se faire l'égal des dieux ?", opts: ["Catharsis", "Hubris", "Mimêsis", "Ethos"], a: 1, exp: "'Hubris' (démesure) désigne l'arrogance prométhéenne de l'être humain défiant les lois de la nature." },
      { q: "Quelle crainte éthique majeure suscite l'augmentation génétique humaine payante ?", opts: ["Le manque de batteries", "La création d'une fracture biologique irrémédiable entre riches augmentés et pauvres", "La couleur des yeux", "Le temps d'écran"], a: 1, exp: "Le risque d'une séparation de l'humanité en deux sous-espèces biologiques selon la richesse est au cœur des mises en garde." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'daily_life', num: 3,
    title: 'Post-vérité, infox & esprit critique',
    title_en: 'Post-Truth, Fake News & Critical Thinking',
    objective: 'Déconstruire les mécanismes de la désinformation de masse, des deepfakes et des biais cognitifs au XXIe siècle.',
    grammar: {
      title: "Les propositions subordonnées concessives antéposées avec BE THAT AS IT MAY et HOWEVER MUCH",
      rule: "Dans un essai de rhétorique ou de philosophie anglophone : However much algorithms tailor content to user biases, critical judgment remains an individual responsibility.",
      example_en: "Be that as it may, society cannot surrender objective empirical truth to emotional demagogy.",
      example_fr: "Quoi qu'il en soit, la société ne peut abandonner la vérité empirique objective à la démagogie émotionnelle.",
      tip: "Be that as it may = Quoi qu'il en soit (transition stylistique majeure).",
      level_focus: "Formules rhétoriques de transition dialectique (be that as it may, albeit)."
    },
    vocab: [
      ["post-truth era", "/poʊst truːθ ˈɪərə/", "Noun", "l'ère de la post-vérité", "In the post-truth era, emotional appeals often overpower verified factual evidence.", "À l'ère de la post-vérité, les appels à l'émotion surpassent les faits."],
      ["fake news", "/feɪk njuːz/", "Noun", "les infox / fausses nouvelles délibérées", "Viral fake news spreads six times faster than factual corrections across networks.", "Les infox virales se propagent six fois plus vite que les rectificatifs."],
      ["deepfake", "/ˈdiːpfeɪk/", "Noun", "l'hypertrucage vidéo / deepfake", "Generative deepfakes erode public trust in photographic and video archives.", "Les deepfakes érodent la confiance du public envers les archives vidéo."],
      ["disinformation", "/ˌdɪsˌɪnfərˈmeɪʃn/", "Noun", "la désinformation coordonnée", "Foreign troll farms weaponize disinformation to subvert democratic elections.", "Des fermes de trolls instrumentalisent la désinformation pour subvertir les élections."],
      ["confirmation bias", "/ˌkɒnfərˈmeɪʃn ˈbaɪəs/", "Noun", "le biais de confirmation", "Confirmation bias leads individuals to accept claims that validate preexisting dogmas.", "Le biais de confirmation pousse à accepter ce qui conforte nos dogmes."],
      ["critical thinking", "/ˈkrɪtɪkl ˈθɪŋkɪŋ/", "Noun", "l'esprit critique / le discernement rationnel", "Teaching rigorous critical thinking is the strongest defense against propaganda.", "Enseigner l'esprit critique est le meilleur rempart contre la propagande."],
      ["fact-checking", "/fækt ˈtʃɛkɪŋ/", "Noun", "le fact-checking / la vérification méthodique", "Collaborative fact-checking platforms cross-reference primary archival sources.", "Les plateformes de vérification croisent les sources primaires."],
      ["polarization", "/ˌpoʊləraɪˈzeɪʃn/", "Noun", "la polarisation politique de la société", "Algorithmic amplification exacerbates virulent civic polarization.", "L'amplification algorithmique attise une violente polarisation civique."],
      ["verifiable", "/ˈvɛrɪfaɪəbl/", "Adjective", "vérifiable / objectivable", "Scientific consensus rests upon publicly verifiable empirical datasets.", "Le consensus scientifique repose sur des données empiriques vérifiables."],
      ["discernment", "/dɪˈsɜːrnmənt/", "Noun", "le discernement intellectuel", "Intellectual discernment requires cultivating healthy skepticism without cynicism.", "Le discernement intellectuel exige un scepticisme sain sans cynisme."]
    ],
    dialogue: {
      title: "Analyse d'un deepfake électoral", setting: "En cours de philosophie politique et d'anglais contemporain.",
      lines: [
        ["Student A", "However sophisticated deepfakes become, can forensic digital watermarks help citizens spot manipulated video speeches?", "Aussi sophistiqués que soient les deepfakes, les filigranes peuvent-ils aider à repérer les vidéos manipulées ?"],
        ["Teacher", "Forensic tools help; be that as it may, technology alone will never replace human intellectual discernment.", "Les outils aident ; quoi qu'il en soit, la technologie ne remplacera jamais le discernement intellectuel."],
        ["Student B", "Confirmation bias is the true psychological vulnerability that malicious actors exploit across viral networks.", "Le biais de confirmation est la vraie faille psychologique exploitée sur les réseaux."],
        ["Teacher", "Precisely. The antidote to post-truth demagogy is a commitment to verifiable truth and intellectual humility.", "Précisément. L'antidote à la post-vérité réside dans l'attachement à la vérité vérifiable et l'humilité."]
      ]
    },
    dictation: { prompt: "Be that as it may, critical thinking is the best shield against disinformation.", fr: "Quoi qu'il en soit, l'esprit critique est le meilleur bouclier contre la désinformation." },
    quiz: [
      { q: "Que signifie l'expression rhétorique soutenue 'Be that as it may' ?", opts: ["Parce que c'est faux", "Quoi qu'il en soit / néanmoins", "En conclusion", "Au tout début"], a: 1, exp: "'Be that as it may' est une formule de transition magistrale signifiant 'quoi qu'il en soit' ou 'cela étant'." },
      { q: "Qu'est-ce qu'un 'deepfake' en informatique ?", opts: ["Un vieux film en noir et blanc", "Un contenu multimédia synthétisé par intelligence artificielle imitant à s'y méprendre une personne réelle", "Un virus qui efface le disque", "Un mot de passe chiffré"], a: 1, exp: "Un 'deepfake' est un trucage hyperréaliste généré par des réseaux neuronaux profonds." },
      { q: "En quoi consiste le 'confirmation bias' (biais de confirmation) ?", opts: ["À vérifier systématiquement chaque information", "À ne retenir que les informations qui confortent ses croyances préalables", "À voter deux fois", "À tout oublier"], a: 1, exp: "Le biais de confirmation privilégie les informations confortant nos préjugés en occultant les preuves contraires." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'travel', num: 2,
    title: 'Flux migratoires mondiaux & droit d\'asile',
    title_en: 'Global Migration & Asylum Rights',
    objective: 'Analyser les causes des migrations géopolitiques et climatiques, le droit international d\'asile et la convention de Genève.',
    grammar: {
      title: "Les propositions absolues au participe (CIRCUMSTANCES PERMITTING / ALL THINGS CONSIDERED)",
      rule: "Dans un mémoire géopolitique ou un discours diplomatique : All things considered, host nations possess an inescapable moral obligation codified in the 1951 Geneva Refugee Convention.",
      example_en: "Barriers having collapsed under geopolitical instability, international solidarity alone can guarantee humanitarian asylum rights.",
      example_fr: "Les frontières s'étant effondrées sous l'effet de l'instabilité géopolitique, seule la solidarité internationale peut garantir le droit d'asile.",
      tip: "Structure de proposition absolue : Nom + participe sans conjonction de subordination.",
      level_focus: "Propositions participiales absolues (absolute clauses)."
    },
    vocab: [
      ["asylum seeker", "/əˈsaɪləm ˈsiːkər/", "Noun", "le demandeur d'asile politique", "International law forbids refoulement of any verified asylum seeker.", "Le droit international interdit le refoulement de tout demandeur d'asile."],
      ["refugee", "/ˌrɛfjuˈdʒiː/", "Noun", "le réfugié statutaire", "The 1951 Geneva Convention defines refugee status and universal human rights.", "La Convention de Genève de 1951 définit le statut de réfugié."],
      ["climate migrant", "/ˈklaɪmət ˈmaɪɡrənt/", "Noun", "le migrant climatique", "Rising sea levels threaten to displace hundreds of millions as climate migrants.", "La montée des océans menace de déplacer des centaines de millions de migrants."],
      ["persecution", "/ˌpɜːrsɪˈkjuːʃn/", "Noun", "la persécution d'État", "Fleeing ethnic or political persecution is the legal threshold for granting asylum.", "Fuir la persécution ethnique est le critère juridique de l'asile."],
      ["integration", "/ˌɪntɪˈɡreɪʃn/", "Noun", "l'intégration sociale et civique", "Linguistic training and employment access accelerate civic integration.", "L'apprentissage linguistique et l'emploi accélèrent l'intégration."],
      ["border control", "/ˈbɔːrdər kənˈtroʊl/", "Noun", "le contrôle des frontières", "Border control policies must harmonize national sovereignty with human empathy.", "Le contrôle des frontières doit concilier souveraineté et humanité."],
      ["displacement", "/dɪsˈpleɪsmənt/", "Noun", "le déplacement forcé de populations", "War and desertification fuel unprecedented cross-border displacement.", "Guerre et désertification alimentent des déplacements massifs."],
      ["solidarity", "/ˌsɒlɪˈdærəti/", "Noun", "la solidarité internationale", "Fair burden-sharing embodies true continental solidarity.", "Le partage équitable du fardeau incarne la vraie solidarité."],
      ["statelessness", "/ˈsteɪtləsnəs/", "Noun", "l'apatridie", "UN agencies fight tirelessly to eliminate the legal nightmare of statelessness.", "Les agences de l'ONU luttent pour éradiquer l'apatridie."],
      ["humanitarian corridor", "/hjuːˌmænɪˈtɛəriən ˈkɒrɪdɔːr/", "Noun", "le couloir humanitaire sécurisé", "Negotiating safe humanitarian corridors saves civilian lives.", "Négocier des couloirs humanitaires sûrs sauve des civils."]
    ],
    dialogue: {
      title: "Analyse de la Convention de Genève de 1951", setting: "Des lycéens examinent le principe fondamental de non-refoulement.",
      lines: [
        ["Student A", "What is the inviolable legal principle underpinning the 1951 Geneva Convention on Refugees?", "Quel est le principe juridique inviolable de la Convention de Genève de 1951 ?"],
        ["Teacher", "The principle of non-refoulement, which forbids returning an individual to a country where they face persecution or death.", "Le principe de non-refoulement, qui interdit de renvoyer un individu là où il risque la mort."],
        ["Student B", "All things considered, how will emerging climate migration challenge existing legal frameworks?", "Tout bien considéré, comment les migrations climatiques bousculeront-elles le droit existant ?"],
        ["Teacher", "Current international law does not formally recognize ecological displacement, requiring an urgent global treaty update.", "Le droit actuel ne reconnaît pas le statut de réfugié climatique, d'où l'urgence d'un nouveau traité."]
      ]
    },
    dictation: { prompt: "All things considered, international solidarity must safeguard asylum rights.", fr: "Tout bien considéré, la solidarité internationale doit sauvegarder le droit d'asile." },
    quiz: [
      { q: "Quel principe de droit international interdit d'expulser un réfugié vers un pays où sa vie est menacée ?", opts: ["Le principe de réciprocité", "Le principe de non-refoulement", "Le principe de précaution", "Le droit de douane"], a: 1, exp: "Le principe de 'non-refoulement' est la pierre angulaire du droit des réfugiés de la Convention de 1951." },
      { q: "Quelle proposition absolue soutenu signifie 'Tout bien considéré' en anglais ?", opts: ["All things considered", "Considered all things", "Taking all things", "Being all considered"], a: 0, exp: "'All things considered' est la formule participiale absolue consacrée." },
      { q: "Quel nouveau défi migratoire majeur n'était pas expressément prévu par la Convention de 1951 ?", opts: ["Les guerres civiles", "Les migrations et réfugiés liés aux dérèglements climatiques", "Les famines", "Les réfugiés politiques"], a: 1, exp: "Les déplacements provoqués par la montée des eaux et la désertification ne sont pas encore formellement couverts." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'travel', num: 3,
    title: 'Exploration des abysses & préservation marine',
    title_en: 'Deep Ocean Exploration & Sanctuaries',
    objective: 'Analyser les enjeux écologiques des fosses océaniques, l\'exploitation minière des fonds marins et le traité de haute mer de l\'ONU.',
    grammar: {
      title: "L'inversion après expressions locatives et directionnelles (IN THE TRENCH LIES, DOWN WENT)",
      rule: "Dans une description géographique et scientifique de haut style : In the abyssal depths lies an extraordinary biodiversity yet undiscovered by human science.",
      example_en: "Beneath seven miles of crushing oceanic pressure thrive hydrothermal vent ecosystems completely independent of sunlight.",
      example_fr: "Sous onze kilomètres d'une pression océanique écrasante prospèrent des écosystèmes hydrothermaux indépendants de la lumière solaire.",
      tip: "Structure : Préposition de lieu + verbe d'état (lies/stands/thrives) + sujet.",
      level_focus: "Inversion locative stylistique (inversion after locative prepositions)."
    },
    vocab: [
      ["deep-sea trench", "/diːp siː trɛntʃ/", "Noun", "la fosse océanique abyssale (ex: Mariannes)", "The Mariana Trench plunges nearly eleven kilometers below sea level.", "La fosse des Mariannes plonge à près de 11 km sous le niveau de la mer."],
      ["submersible", "/səbˈmɜːrsəbl/", "Noun", "le submersible de grande profondeur", "Titanium-hulled submersibles withstand crushing oceanic pressure.", "Les submersibles en titane résistent à la pression écrasante."],
      ["seabed mining", "/ˈsiːbɛd ˈmaɪnɪŋ/", "Noun", "l'exploitation minière des fonds marins", "Deep seabed mining threatens to obliterate untouched ecosystems.", "L'exploitation minière sous-marine menace d'éradiquer des écosystèmes."],
      ["hydrothermal vent", "/ˌhaɪdroʊˈθɜːrml vɛnt/", "Noun", "la cheminée / source hydrothermale", "Chemosynthetic bacteria thrive around mineral-spewing hydrothermal vents.", "Des bactéries chimiosynthétiques prospèrent près des sources."],
      ["biodiversity", "/ˌbaɪoʊdaɪˈvɜːrsəti/", "Noun", "la biodiversité benthique", "Deep trenches harbour unique bioluminescent biodiversity.", "Les fosses profondes abritent une biodiversité bioluminescente unique."],
      ["marine sanctuary", "/məˈriːn ˈsæŋktʃuəri/", "Noun", "le sanctuaire marin protégé", "International waters require globally ratified marine sanctuaries.", "Les eaux internationales exigent des sanctuaires protégés ratifiés."],
      ["pressure", "/ˈprɛʃər/", "Noun", "la pression hydrostatique", "Hydrostatic pressure at the seafloor exceeds one thousand atmospheres.", "La pression au fond de l'eau dépasse mille atmosphères."],
      ["bioluminescence", "/ˌbaɪoʊˌluːmɪˈnɛsns/", "Noun", "la bioluminescence", "Ninety percent of abyssal creatures produce living bioluminescence.", "Quatre-vingt-dix pour cent des créatures abyssales sont bioluminescentes."],
      ["unexplored", "/ˌʌnɪkˈsplɔːrd/", "Adjective", "inexploré / vierge", "The deep ocean remains far less explored than the Moon's surface.", "L'océan profond demeure bien moins exploré que la surface de la Lune."],
      ["high seas treaty", "/haɪ siːz ˈtriːti/", "Noun", "le traité international sur la haute mer", "The UN High Seas Treaty establishes legal mechanisms to shield international waters.", "Le traité de l'ONU sur la haute mer protège les eaux internationales."]
    ],
    dialogue: {
      title: "Débat sur l'interdiction de l'exploitation minière sous-marine", setting: "Des lycéens simulent les négociations de l'Autorité Internationale des Fonds Marins.",
      lines: [
        ["Delegate A", "Beneath thousands of fathoms of water lie polymetallic nodules rich in cobalt and nickel needed for batteries.", "Sous des milliers de brasses gisent des nodules polymétalliques riches en cobalt."],
        ["Delegate B", "Yet, in those very benthic depths thrives a fragile, slow-growing biosphere that took millions of years to evolve.", "Pourtant, dans ces mêmes profondeurs prospère une biosphère fragile séculaire."],
        ["Delegate A", "Could scientific submersibles map ecosystems before any commercial extraction license is granted?", "Les submersibles pourraient-ils cartographier la vie avant toute licence d'extraction ?"],
        ["Delegate B", "Marine scientists insist on a precautionary moratorium: once destroyed, deep-sea trenches cannot regenerate.", "Les océanographes exigent un moratoire : détruites, les fosses ne régénèrent pas."]
      ]
    },
    dictation: { prompt: "In the abyssal depths lies an extraordinary biodiversity yet unexplored.", fr: "Dans les profondeurs abyssales réside une extraordinaire biodiversité encore inexplorée." },
    quiz: [
      { q: "Quelle structure illustre l'inversion locative stylistique en tête de phrase ?", opts: ["In the trench an ancient secret lies.", "In the trench lies an ancient secret.", "An ancient secret in the trench lies.", "There lies in the trench an ancient secret."], a: 1, exp: "Après une préposition de lieu en tête de phrase littéraire, le verbe précède le sujet : 'In the trench lies an ancient secret'." },
      { q: "Quelle est la fosse océanique la plus profonde de la planète Terre (près de 11 000 m) ?", opts: ["The Puerto Rico Trench", "The Java Trench", "The Mariana Trench (Fosse des Mariannes)", "The Tonga Trench"], a: 2, exp: "La fosse des Mariannes (Challenger Deep) descend à 10 994 mètres sous le Pacifique." },
      { q: "Quel traité historique de l'ONU conclu en 2023 protège la biodiversité dans les eaux internationales hors des juridictions nationales ?", opts: ["The Paris Agreement", "The High Seas Treaty (Traité de la haute mer)", "The Kyoto Protocol", "The Geneva Convention"], a: 1, exp: "Le traité de l'ONU sur la haute mer (BBNJ, 2023) permet de créer des aires marines protégées en haute mer." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'history', num: 2,
    title: 'Le Traité de Versailles & l\'entre-deux-guerres',
    title_en: 'The Treaty of Versailles & League of Nations',
    objective: 'Analyser la fragilité de la paix de 1919, les réparations de guerre et l\'échec de la Société des Nations avec les conditionnels mixtes.',
    grammar: {
      title: "Les conditionnels mixtes (Mixed Conditionals : cause passée, conséquence présente)",
      rule: "On utilise un conditionnel mixte pour lier un événement passé à son impact présent durable : IF + Past Perfect (fait passé) / WOULD + base verbale (conséquence présente) : If the 1919 peacemakers had built a more equitable economic order, the 20th century WOULD BE free from subsequent devastation.",
      example_en: "If the United States Senate had ratified the League of Nations charter, collective security would be stronger today.",
      example_fr: "Si le Sénat américain avait ratifié la charte de la Société des Nations, la sécurité collective serait plus forte aujourd'hui.",
      tip: "Structure : If + had + PP (passé) -> would + BV (présent).",
      level_focus: "Conditionnels mixtes (mixed conditionals)."
    },
    vocab: [
      ["Treaty of Versailles", "/ˈtriːti əv vɛərˈsaɪ/", "Noun", "le Traité de Versailles (1919)", "The Treaty of Versailles imposed staggering economic reparations on defeated Germany.", "Le traité de Versailles imposa d'écrasantes réparations à l'Allemagne."],
      ["reparations", "/ˌrɛpəˈreɪʃnz/", "Noun", "les réparations de guerre financières", "Economist John Maynard Keynes argued that punitive reparations would cripple European recovery.", "Keynes affirma que les réparations punitives ruineraient l'Europe."],
      ["League of Nations", "/liːɡ əv ˈneɪʃnz/", "Noun", "la Société des Nations (SDN)", "The League of Nations lacked military enforcement mechanisms to deter aggressive tyrants.", "La SDN manquait de force militaire pour dissuader les agresseurs."],
      ["interwar turmoil", "/ˌɪntərˈwɔːr ˈtɜːrmɔɪl/", "Noun", "les bouleversements de l'entre-deux-guerres", "Interwar turmoil fostered rampant hyperinflation, social despair and extremist demagogy.", "L'entre-deux-guerres favorisa l'hyperinflation et les extrémismes."],
      ["armistice", "/ˈɑːrmɪstɪs/", "Noun", "l'armistice du 11 novembre 1918", "Church bells rang across Europe as the 1918 armistice silenced the guns.", "Les cloches sonnèrent pour l'armistice du 11 novembre 1918."],
      ["collective security", "/kəˈlɛktɪv sɪˈkjʊərəti/", "Noun", "la sécurité collective", "President Woodrow Wilson championed collective security through his Fourteen Points.", "Wilson prôna la sécurité collective dans ses Quatorze Points."],
      ["demilitarized", "/diːˈmɪlɪtəraɪzd/", "Adjective", "démilitarisé", "The Rhineland was established as an unoccupied demilitarized buffer zone.", "La Rhénanie devint une zone tampon démilitarisée."],
      ["hyperinflation", "/ˌhaɪpərɪnˈfleɪʃn/", "Noun", "l'hyperinflation monétaire", "Hyperinflation rendered banknotes utterly worthless in the Weimar Republic.", "L'hyperinflation ruina la monnaie de la République de Weimar."],
      ["grievance", "/ˈɡriːvəns/", "Noun", "le ressentiment / la rancœur nationale", "Smouldering territorial grievances were weaponized by totalitarian dictators.", "Les ressentiments territoriaux furent instrumentalisés par les dictateurs."],
      ["appeasement", "/əˈpiːzmənt/", "Noun", "la politique d'apaisement (Munich 1938)", "The disastrous policy of appeasement failed to prevent catastrophic global conflict.", "L'apaisement échoua à éviter un conflit mondial catastrophique."]
    ],
    dialogue: {
      title: "Analyse critique de John Maynard Keynes en 1919", setting: "Des élèves de terminale étudient 'Les Conséquences économiques de la paix'.",
      lines: [
        ["Teacher", "What prophetic warning did British economist John Maynard Keynes publish in 1919?", "Quel avertissement prophétique Keynes publia-t-il en 1919 ?"],
        ["Student", "He resigned from the peace conference, arguing that punitive reparations would destroy the continental economy.", "Il démissionna, prédisant que les réparations détruiraient l'économie continentale."],
        ["Teacher", "If the victorious allies had listened to his economic insights, modern European history would be radically different today.", "Si les vainqueurs avaient écouté ses analyses, l'histoire européenne serait différente aujourd'hui."],
        ["Student", "His warnings were tragically vindicated by interwar hyperinflation and the collapse of the Weimar democracy.", "Ses mises en garde furent tragiquement confirmées par l'hyperinflation et la chute de Weimar."]
      ]
    },
    dictation: { prompt: "If the peacemakers had built a balanced peace, history would be different today.", fr: "Si les négociateurs avaient bâti une paix équilibrée, l'histoire serait différente aujourd'hui." },
    quiz: [
      { q: "Quelle proposition illustre un conditionnel mixte (action passée ayant un résultat actuel au présent) ?", opts: ["If I had worked, I passed.", "If he had listened to advice, he would be safe now.", "If it rains, we will stay.", "If I were you, I would leave."], a: 1, exp: "Le conditionnel mixte combine IF + had + PP (passé) et WOULD + base verbale (présent)." },
      { q: "Quel économiste britannique de renom a démissionné de la délégation de paix en 1919 pour dénoncer le Traité de Versailles ?", opts: ["Adam Smith", "John Maynard Keynes", "David Ricardo", "Milton Friedman"], a: 1, exp: "John Maynard Keynes a publié en 1919 son célèbre pamphlet 'The Economic Consequences of the Peace'." },
      { q: "Quelle grande puissance n'a jamais ratifié le traité de la Société des Nations bien que son président en soit l'initiateur ?", opts: ["La France", "Le Royaume-Uni", "Les États-Unis", "L'Italie"], a: 2, exp: "Le Sénat américain refusa de ratifier le traité de la SDN voulu par le président Woodrow Wilson." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'history', num: 3,
    title: 'Mémoires de l\'esclavage & réconciliation',
    title_en: 'Historical Memory & Abolition Legacies',
    objective: 'Analyser l\'histoire de la traite transatlantique, les luttes abolitionnistes et les débats mémoriels contemporains.',
    grammar: {
      title: "L'emploi des propositions causales introduites par INASMUCH AS et IN VIEW OF THE FACT THAT",
      rule: "Dans l'analyse historiographique universitaire au niveau C1 : Inasmuch as democratic institutions acknowledge historical crimes, genuine moral reconciliation becomes achievable.",
      example_en: "Inasmuch as modern societies confront their colonial legacies with transparency, historical healing can finally take root.",
      example_fr: "Dans la mesure où les sociétés modernes affrontent leurs héritages coloniaux avec transparence, la guérison historique peut enfin s'enraciner.",
      tip: "Inasmuch as = Dans la mesure où (registre académique de haute tenue).",
      level_focus: "Conjonctions causales universitaires (inasmuch as, insofar as)."
    },
    vocab: [
      ["transatlantic slave trade", "/ˌtrænzətˈlæntɪk sleɪv treɪd/", "Noun", "la traite négrière transatlantique", "The transatlantic slave trade displaced and dehumanized over twelve million Africans.", "La traite transatlantique a déporté plus de 12 millions d'Africains."],
      ["abolitionism", "/ˌæbəˈlɪʃənɪzəm/", "Noun", "l'abolitionnisme", "Olaudah Equiano and Frederick Douglass were towering figures of abolitionism.", "Olaudah Equiano et Frederick Douglass furent de géants abolitionnistes."],
      ["reparations", "/ˌrɛpəˈreɪʃnz/", "Noun", "les réparations mémorielles et financières", "The reparations debate interrogates how colonial wealth built modern western capitals.", "Le débat sur les réparations interroge la richesse issue de la colonisation."],
      ["historical memory", "/hɪˈstɒrɪkl ˈmɛməri/", "Noun", "la mémoire historique collective", "Historical memory demands acknowledging both suffering and heroic resistance.", "La mémoire historique exige de reconnaître souffrance et résistance."],
      ["dehumanization", "/diːˌhjuːmənaɪˈzeɪʃn/", "Noun", "la déshumanisation / chosification", "Slave codes codified the legal dehumanization of human beings as property.", "Les codes noirs ont codifié la déshumanisation des êtres en propriété."],
      ["resistance", "/rɪˈzɪstəns/", "Noun", "la résistance et révoltes d'esclaves", "The Haitian Revolution of 1791 established the first free Black republic.", "La Révolution haïtienne de 1791 créa la première république noire libre."],
      ["apology", "/əˈpɒlədʒi/", "Noun", "les excuses officielles d'État", "Institutions offer formal apologies for historical complicity in bondage.", "Les institutions présentent des excuses formelles pour leur complicité."],
      ["emancipation", "/ɪˌmænsɪˈpeɪʃn/", "Noun", "l'émancipation / libération légale", "The 1833 Slavery Abolition Act ended institutional slavery in the British Empire.", "La loi de 1833 a aboli l'esclavage dans l'Empire britannique."],
      ["reconciliation", "/ˌrɛkənsɪliˈeɪʃn/", "Noun", "la réconciliation mémorielle", "Honest historical reconciliation builds inclusive, equitable citizenship.", "Une réconciliation honnête bâtit une citoyenneté équitable."],
      ["monument", "/ˈmɒnjumənt/", "Noun", "les monuments mémoriels", "Public statues commemorating slave traders were toppled by protesters.", "Des statues de marchands d'esclaves ont été déboulonnées."]
    ],
    dialogue: {
      title: "L'héritage d'Olaudah Equiano à Londres", setting: "Des lycéens étudient l'autobiographie d'Olaudah Equiano publiée en 1789.",
      lines: [
        ["Teacher", "Who was Olaudah Equiano and how did his narrative shape the British abolitionist movement?", "Qui était Olaudah Equiano et comment son récit a-t-il façonné l'abolitionnisme britannique ?"],
        ["Student", "Having survived the Middle Passage, he bought his freedom and published a bestseller exposing the horrors of slavery.", "Après avoir survécu à la traversée, il racheta sa liberté et publia un livre dénonçant l'horreur."],
        ["Teacher", "Inasmuch as his eyewitness testimony touched millions of readers, it galvanized public parliamentary petitions.", "Dans la mesure où son témoignage toucha des millions de lecteurs, il suscita des pétitions massives."],
        ["Student", "His voice proved that enslaved Africans were courageous intellectual agents of their own liberation.", "Sa voix a prouvé que les esclaves furent les acteurs intellectuels de leur propre liberté."]
      ]
    },
    dictation: { prompt: "Inasmuch as societies confront the past, true reconciliation becomes possible.", fr: "Dans la mesure où les sociétés affrontent le passé, une vraie réconciliation devient possible." },
    quiz: [
      { q: "Quelle conjonction causale formelle signifie 'dans la mesure où' au niveau académique ?", opts: ["Inasmuch as", "Because of", "Due to that", "So as"], a: 0, exp: "'Inasmuch as' (ou 'insofar as') est la conjonction académique consacrée signifiant 'dans la mesure où'." },
      { q: "Quel ancien esclave d'origine nigériane a publié à Londres en 1789 un témoignage autobiographique décisif pour l'abolitionnisme ?", opts: ["Martin Luther King", "Olaudah Equiano", "Nelson Mandela", "Malcolm X"], a: 1, exp: "Olaudah Equiano publia en 1789 son autobiographie magistrale, moteur de la campagne abolitionniste en Grande-Bretagne." },
      { q: "En quelle année le Parlement britannique a-t-il voté le 'Slavery Abolition Act' abolissant l'esclavage dans la majorité de l'Empire ?", opts: ["1776", "1789", "1833", "1865"], a: 2, exp: "Le Slavery Abolition Act fut voté le 28 août 1833 par le Parlement de Westminster." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'hobbies', num: 2,
    title: 'Philosophie de l\'absurde en littérature',
    title_en: 'Existentialism & The Absurd in Literature',
    objective: 'Analyser le théâtre de l\'absurde (Samuel Beckett) et la philosophie existentielle avec le conditionnel irréel.',
    grammar: {
      title: "L'inversion du conditionnel sans IF (HAD HE KNOWN, WERE HE TO ARRIVE)",
      rule: "Dans la prose littéraire et philosophique la plus noble, on omet 'IF' en inversant directement l'auxiliaire et le sujet : Had Godot arrived, the metaphysical tension of the play would have dissolved.",
      example_en: "Were humanity to surrender its search for meaning, the absurdity of existence would become intolerable.",
      example_fr: "Si l'humanité devait renoncer à sa quête de sens, l'absurdité de l'existence deviendrait intolérable.",
      tip: "Were he to arrive = If he were to arrive / Had he arrived = If he had arrived.",
      level_focus: "Inversion conditionnelle littéraire d'excellence (inverted conditionals without if)."
    },
    vocab: [
      ["Theatre of the Absurd", "/ˈθɪətər əv ðə əbˈsɜːrd/", "Noun", "le Théâtre de l'Absurde", "The Theatre of the Absurd dismantles linear plot and rational dialogue.", "Le Théâtre de l'Absurde déconstruit l'intrigue et le dialogue rationnel."],
      ["existentialism", "/ˌɛɡzɪˈstɛnʃəlɪzəm/", "Noun", "l'existentialisme", "Existentialism asserts that existence precedes essence, conferring absolute freedom.", "L'existentialisme affirme que l'existence précède l'essence."],
      ["waiting", "/ˈweɪtɪŋ/", "Noun", "l'attente métaphysique", "Waiting for Godot dramatizes the endless, circular human condition.", "En attendant Godot met en scène la condition humaine circulaire."],
      ["futility", "/fjuːˈtɪləti/", "Noun", "la futilité / la vanité de l'effort", "Sisyphus rolling his stone symbolizes the tragic futility of human existence.", "Sisyphe roulant sa pierre symbolise la futilité tragique de l'existence."],
      ["silence", "/ˈsaɪləns/", "Noun", "le silence / la pause beckettienne", "Beckett's calibrated silences resonate louder than spoken words.", "Les silences millimétrés de Beckett résonnent plus que les mots."],
      ["human condition", "/ˈhjuːmən kənˈdɪʃn/", "Noun", "la condition humaine", "Writers interrogate whether the human condition has inherent purpose.", "Les auteurs interrogent le sens intrinsèque de la condition humaine."],
      ["meaninglessness", "/ˈmiːnɪŋləsnəs/", "Noun", "l'absence de sens / le non-sens", "Embracing meaninglessness allows humans to forge their own values.", "Accepter le non-sens permet de forger ses propres valeurs."],
      ["tramp", "/træmp/", "Noun", "le vagabond / le marginal (Vladimir et Estragon)", "Two tramp-like clowns wait beside a barren, leafless tree.", "Deux vagabonds attendent près d'un arbre stérile sans feuilles."],
      ["lucidity", "/luːˈsɪdəti/", "Noun", "la lucidité existentielle", "Camus argued that rebellious lucidity makes Sisyphus victorious.", "Camus affirmait que la lucidité révoltée rend Sisyphe victorieux."],
      ["paradox", "/ˈpærədɒks/", "Noun", "le paradoxe philosophique", "The comedy within tragedy constitutes Beckett's profoundest paradox.", "Le comique au cœur du tragique est le paradoxe le plus profond de Beckett."]
    ],
    dialogue: {
      title: "Autour d'En attendant Godot de Samuel Beckett", setting: "Des élèves de terminale analysent la célèbre pièce de 1953.",
      lines: [
        ["Teacher", "What happens in Waiting for Godot, arguably the most revolutionary play of the twentieth century?", "Que se passe-t-il dans En attendant Godot, sans doute la pièce la plus novatrice du 20e siècle ?"],
        ["Student", "Nothing happens, nobody comes, nobody goes, it's awful! And yet it is deeply comic and tragic at once.", "Rien ne se passe, personne ne vient, personne ne part ! Et pourtant c'est comique et tragique à la fois."],
        ["Teacher", "Had Beckett provided a clear identity for Godot, would the play retain its universal resonance?", "Si Beckett avait donné une identité claire à Godot, la pièce garderait-elle sa portée universelle ?"],
        ["Student", "No! Godot represents the elusive purpose, salvation or answer that humanity eternally waits for.", "Non ! Godot représente le salut ou la réponse insaisissable que l'humanité attend éternellement."]
      ]
    },
    dictation: { prompt: "Had Godot arrived, the universal metaphysical tension would have vanished.", fr: "Si Godot était arrivé, la tension métaphysique universelle se serait évanouie." },
    quiz: [
      { q: "Quelle formulation littéraire remplace élégamment 'If he had known' sans utiliser le mot 'if' ?", opts: ["Had he known", "Did he know", "He had known", "Should he know"], a: 0, exp: "'Had he known' est l'inversion conditionnelle littéraire noble équivalente à 'If he had known'." },
      { q: "Quel dramaturge irlandais a reçu le prix Nobel de littérature en 1969 pour 'Waiting for Godot' ?", opts: ["Oscar Wilde", "George Bernard Shaw", "Samuel Beckett", "James Joyce"], a: 2, exp: "Samuel Beckett a révolutionné le théâtre contemporain avec son chef-d'œuvre de l'absurde 'En attendant Godot'." },
      { q: "Quelle célèbre formule de Jean-Paul Sartre résume la pensée existentialiste ?", opts: ["Cogito ergo sum", "Existence precedes essence (L'existence précède l'essence)", "To be or not to be", "Carpe diem"], a: 1, exp: "'Existence precedes essence' signifie que l'humain se définit par ses choix libres et ses actes." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'hobbies', num: 3,
    title: 'Restitution du patrimoine artistique spolié',
    title_en: 'Restitution of Cultural Artifacts & Ethics',
    objective: 'Débattre de la restitution des trésors pillés (Frises du Parthénon, Bronzes du Bénin) dans les musées occidentaux.',
    grammar: {
      title: "L'emploi des propositions causales au gérondif prépositionnel (BY VIRTUE OF, IN CONSEQUENCE OF)",
      rule: "Dans l'argumentation de droit international au niveau C1 : By virtue of possessing looted artifacts, imperial museums face unavoidable moral obligations to return heritage to source nations.",
      example_en: "Source nations demand repatriation by virtue of their sovereign cultural heritage rights.",
      example_fr: "Les pays d'origine réclament la restitution en vertu de leurs droits souverains sur leur patrimoine culturel.",
      tip: "By virtue of = En vertu de / Par le fait de.",
      level_focus: "Prépositions juridiques complexes (by virtue of, on the grounds that)."
    },
    vocab: [
      ["restitution", "/ˌrɛstɪˈtjuːʃn/", "Noun", "la restitution d'œuvres spoliées", "Restitution of colonial treasures restores cultural sovereignty.", "La restitution des trésors coloniaux restaure la souveraineté culturelle."],
      ["looted art", "/ˈluːtɪd ɑːrt/", "Noun", "l'art pillé / le butin de guerre", "Thousands of looted artifacts remain displayed in western glass cabinets.", "Des milliers d'œuvres pillées restent exposées dans des vitrines occidentales."],
      ["Parthenon Marbles", "/ˈpɑːrθənən ˈmɑːrblz/", "Noun", "les marbres du Parthénon (Elgin Marbles)", "Greece officially demands the permanent return of the Parthenon Marbles.", "La Grèce réclame officiellement le retour des marbres du Parthénon."],
      ["Benin Bronzes", "/bəˈniːn ˈbrɒnzɪz/", "Noun", "les bronzes du royaume du Bénin (Nigeria)", "British punitive expeditions plundered thousands of royal Benin Bronzes in 1897.", "Des expéditions britanniques ont pillé les bronzes du Bénin en 1897."],
      ["repatriation", "/ˌriːpætriˈeɪʃn/", "Noun", "le rapatriement dans le pays d'origine", "Bilateral repatriation treaties allow ancestral relics to return home.", "Les traités de rapatriement permettent aux reliques de rentrer chez elles."],
      ["provenance", "/ˈprɒvənəns/", "Noun", "la provenance / l'historique d'acquisition", "Rigorous provenance research exposes fraudulent colonial acquisitions.", "La recherche de provenance met au jour les acquisitions frauduleuses."],
      ["universal museum", "/ˌjuːnɪˈvɜːrsl mjuˈziːəm/", "Noun", "le concept de musée universel", "The British Museum defended its collection under the 'universal museum' doctrine.", "Le British Museum s'est défendu au nom du 'musée universel'."],
      ["heritage", "/ˈhɛrɪtɪdʒ/", "Noun", "le patrimoine identitaire", "Ancestral artifacts embody living spiritual heritage, not mere museum curiosities.", "Les objets ancestraux incarnent un patrimoine spirituel vivant."],
      ["colonial plunder", "/kəˈloʊniəl ˈplʌndər/", "Noun", "le pillage colonial", "Western capitals must reckon with centuries of systematic colonial plunder.", "Les capitales occidentales doivent faire face aux siècles de pillage colonial."],
      ["custodian", "/kʌˈstoʊdiən/", "Noun", "le gardien / dépositaire temporaire", "Are metropolitan museums genuine universal custodians or stubborn possessors?", "Les musées sont-ils d'authentiques gardiens ou des possesseurs têtus ?"]
    ],
    dialogue: {
      title: "Débat au British Museum sur les marbres du Parthénon", setting: "Des lycéens assistent à une conférence de conservateurs de musées.",
      lines: [
        ["Curator A", "By virtue of preserving the Parthenon Marbles from pollution since 1816, the British Museum has allowed six million annual visitors to see them free of charge.", "En vertu de leur conservation depuis 1816, le musée a permis à six millions de visiteurs de les voir gratuitement."],
        ["Curator B", "Yet, on the grounds that Lord Elgin hacked them off the Acropolis during Ottoman occupation, their presence in London remains an ethical injustice.", "Pourtant, sur le fait qu'Elgin les a arrachés sous l'occupation ottomane, leur présence reste une injustice."],
        ["Curator A", "Could a reciprocal cultural partnership with the Acropolis Museum in Athens resolve the dispute?", "Un partenariat culturel réciproque avec le musée de l'Acropole pourrait-il résoudre le litige ?"],
        ["Curator B", "Repatriation of stolen heritage is not a loan; it is an act of historical justice and restorative ethics.", "La restitution n'est pas un prêt ; c'est un acte de justice historique réparatrice."]
      ]
    },
    dictation: { prompt: "Source nations demand the restitution of looted cultural heritage.", fr: "Les pays d'origine réclament la restitution du patrimoine culturel pillé." },
    quiz: [
      { q: "Quelles sculptures antiques du Ve siècle av. J.-C. font l'objet d'un conflit historique entre la Grèce et le British Museum ?", opts: ["The Venus de Milo", "The Parthenon Marbles (Elgin Marbles)", "The Rosetta Stone", "The Winged Victory"], a: 1, exp: "Les marbres du Parthénon (enlevés par Lord Elgin en 1801) sont réclamés sans relâche par la Grèce." },
      { q: "Quelle locution prépositionnelle formelle signifie 'En vertu de...' en droit ?", opts: ["By virtue of", "In contrast with", "Regardless to", "So much as"], a: 0, exp: "'By virtue of' signifie 'en vertu de' ou 'par le fait de'." },
      { q: "Que désigne la recherche de 'provenance' dans un grand musée ?", opts: ["Le prix de vente de l'œuvre", "L'historique détaillé des propriétaires successifs et des conditions d'acquisition d'un objet d'art", "La taille du cadre", "Le nom du restaurateur"], a: 1, exp: "La recherche de provenance retrace la chaîne de propriété légitime d'une œuvre pour vérifier qu'elle n'a pas été volée ou pillée." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'sport', num: 2,
    title: 'Athlètes réfugiés & idéal olympique universel',
    title_en: 'Refugee Olympic Athletes & Resilience',
    objective: 'Analyser la création de l\'Équipe Olympique des Réfugiés par le CIO et la diplomatie humanitaire du sport.',
    grammar: {
      title: "L'emploi des propositions participiales concessives (FOR ALL THEIR HARDSHIPS, NOTWITHSTANDING)",
      rule: "Dans un discours oratoire d'éloge : Notwithstanding unbearable persecution and dangerous border crossings, refugee athletes achieved Olympic finals through superhuman grit.",
      example_en: "For all the trauma of exile they suffered, these athletes march under the Olympic flag as beacons of universal human courage.",
      example_fr: "En dépit de tout le traumatisme de l'exil qu'ils ont enduré, ces athlètes défilent sous le drapeau olympique comme des symboles de courage.",
      tip: "Notwithstanding s'emploie couramment comme préposition soutenue signifiant 'en dépit de'.",
      level_focus: "Prépositions concessives soutenues (notwithstanding, for all)."
    },
    vocab: [
      ["Refugee Olympic Team", "/ˌrɛfjuˈdʒiː oʊˈlɪmpɪk tiːm/", "Noun", "l'Équipe Olympique des Réfugiés (CIO)", "The Refugee Olympic Team competed under the neutral five-ring Olympic flag.", "L'Équipe des réfugiés a concouru sous la bannière olympique neutre."],
      ["exile", "/ˈɛɡzaɪl/", "Noun", "l'exil forcé", "Enduring painful exile from their homelands, athletes found sanctuary in sport.", "Subissant l'exil de leur patrie, les athlètes ont trouvé refuge dans le sport."],
      ["perseverance", "/ˌpɜːrsəˈvɪərəns/", "Noun", "la persévérance inébranlable", "Her superhuman perseverance during open-water swimming inspired millions.", "Sa persévérance surhumaine en pleine mer a ému des millions de personnes."],
      ["beacon of hope", "/ˈbiːkən əv hoʊp/", "Phrase", "un phare d'espoir", "Refugee athletes act as a global beacon of hope for displaced persons.", "Les athlètes réfugiés sont un phare d'espoir pour les personnes déplacées."],
      ["trauma", "/ˈtrɔːmə/", "Noun", "le traumatisme de guerre", "Athletic training channels psychological trauma into focused resilience.", "L'entraînement canalise le traumatisme vers la résilience."],
      ["solidarity", "/ˌsɒlɪˈdærəti/", "Noun", "la solidarité olympique", "The International Olympic Committee finances training through solidarity grants.", "Le CIO finance leur entraînement par des bourses de solidarité."],
      ["humanitarian", "/hjuːˌmænɪˈtɛəriən/", "Adjective", "humanitaire", "Sport provides a powerful non-violent humanitarian platform.", "Le sport offre une puissante tribune humanitaire non violente."],
      ["refugee camp", "/ˌrɛfjuˈdʒiː kæmp/", "Noun", "le camp de réfugiés", "Marathon runners trained on dusty tracks inside Kakuma refugee camp.", "Des marathoniens se sont entraînés sur la terre battue du camp de Kakuma."],
      ["sanctuary", "/ˈsæŋktʃuəri/", "Noun", "le sanctuaire / terre d'accueil", "Sport became an emotional and physical sanctuary amidst chaos.", "Le sport est devenu un sanctuaire physique au milieu du chaos."],
      ["heroism", "/ˈhɛroʊɪzəm/", "Noun", "l'héroïsme ordinaire", "Their quiet heroism challenges stigmatizing narratives about refugees.", "Leur héroïsme discret défie les préjugés stigmatisants sur les réfugiés."]
    ],
    dialogue: {
      title: "Le parcours héroïque de Yusra Mardini", setting: "Des lycéens découvrent l'histoire de la nageuse syrienne aux JO de Rio et Tokyo.",
      lines: [
        ["Teacher", "Who was Yusra Mardini and what did she accomplish in the Aegean Sea in 2015?", "Qui était Yusra Mardini et qu'a-t-elle accompli en mer Égée en 2015 ?"],
        ["Student", "When the motor of their overcrowded dinghy died, she and her sister jumped into the cold sea and swam for three hours to pull eighteen refugees to safety.", "Quand le moteur de leur canot a lâché, elle et sa sœur ont nagé trois heures pour sauver dix-huit personnes."],
        ["Teacher", "Notwithstanding that terrifying ordeal, she competed in the butterfly race at the Rio Olympics.", "En dépit de cette terrifiante épreuve, elle a concouru au papillon aux JO de Rio."],
        ["Student", "Her story embodies the truest essence of the Olympic motto: courage, resilience and universal brotherhood.", "Son histoire incarne la vraie essence olympique : courage, résilience et fraternité."]
      ]
    },
    dictation: { prompt: "Notwithstanding great adversity, refugee athletes march as beacons of hope.", fr: "En dépit de grandes épreuves, les athlètes réfugiés défilent comme des phares d'espoir." },
    quiz: [
      { q: "Quelle préposition très soutenue est synonyme de 'despite' ou 'in spite of' au niveau C1 ?", opts: ["Notwithstanding", "Whereas", "Unless", "Whenever"], a: 0, exp: "'Notwithstanding' est une préposition soutenue signifiant 'nonobstant' ou 'en dépit de'." },
      { q: "En quelle année et à quels Jeux Olympiques la première Équipe Olympique des Réfugiés a-t-elle été créée par le CIO ?", opts: ["Athènes 2004", "Londres 2012", "Rio 2016", "Paris 2024"], a: 2, exp: "L'Équipe Olympique des Réfugiés a été créée par le CIO pour les Jeux de Rio 2016." },
      { q: "Comment la nageuse syrienne Yusra Mardini a-t-elle sauvé 18 compagnons d'infortune en 2015 ?", opts: ["En appelant un hélicoptère", "En nageant pendant plus de trois heures dans les vagues pour remorquer leur canot en panne jusqu'à l'île de Lesbos", "En construisant un radeau", "En réparant le moteur"], a: 1, exp: "Yusra et sa sœur ont nagé 3h30 dans l'eau glacée pour sauver les passagers de leur canot à la dérive." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'sport', num: 3,
    title: 'Génomique sportive & limites physiologiques',
    title_en: 'Sports Genomics & Physiological Frontiers',
    objective: 'Analyser la génétique appliquée au sport d\'élite, la thérapie génique et les frontières du dopage technologique.',
    grammar: {
      title: "Les propositions consécutives de style soutenu avec TO THE EXTENT THAT et IN SUCH A MANNER THAT",
      rule: "Dans l'argumentation médico-sportive au niveau C1 : Gene editing alters athletic physiology to the extent that natural human sporting fairness is fundamentally questioned.",
      example_en: "Scientists fear that cellular modifications might rewrite genetic limits to the extent that competitions become laboratory duels.",
      example_fr: "Les scientifiques craignent que les modifications cellulaires ne réécrivent les limites au point que les compétitions deviennent des duels de laboratoires.",
      tip: "To the extent that = Au point que / Dans la mesure où (conséquence proportionnelle).",
      level_focus: "Consécutives d'intensité scientifique (to the extent that)."
    },
    vocab: [
      ["sports genomics", "/spɔːrts dʒiːˈnoʊmɪks/", "Noun", "la génomique sportive", "Sports genomics studies how DNA polymorphisms influence athletic endurance.", "La génomique sportive étudie l'influence de l'ADN sur l'endurance."],
      ["gene doping", "/dʒiːn ˈdoʊpɪŋ/", "Noun", "le dopage génétique", "The World Anti-Doping Agency bans gene doping to protect fair play.", "L'Agence mondiale antidopage interdit le dopage génétique."],
      ["physiological frontier", "/ˌfɪziəˈlɒdʒɪkl ˈfrʌntɪər/", "Noun", "la frontière physiologique humaine", "Has humanity reached the absolute physiological frontier of marathon speed?", "L'humanité a-t-elle atteint la frontière physiologique du marathon ?"],
      ["EPO gene", "/ˌiː piː ˈoʊ dʒiːn/", "Noun", "le gène de l'érythropoïétine", "Viral vectors injecting synthetic EPO genes pose catastrophic thrombosis risks.", "Injecter des gènes d'EPO synthétique pose des risques de thrombose."],
      ["integrity", "/ɪnˈtɛɡrəti/", "Noun", "l'intégrité de la compétition sportive", "Gene editing threatens the democratic integrity of Olympic competition.", "L'édition génétique menace l'intégrité de la compétition."],
      ["oxygen uptake", "/ˈɒksɪdʒən ˈʌpteɪk/", "Noun", "la consommation maximale d'oxygène (VO2 max)", "A high VO2 max dictates elite endurance running capabilities.", "Une VO2 max élevée dicte les capacités d'endurance."],
      ["CRISPR", "/ˈkrɪspər/", "Noun", "la technologie d'édition génétique CRISPR-Cas9", "CRISPR molecular scissors could theoretically boost fast-twitch muscle fibers.", "CRISPR pourrait théoriquement doper les fibres musculaires rapides."],
      ["fair play", "/fɛər pleɪ/", "Noun", "l'équité sportive", "Biological parity is the non-negotiable premise of genuine fair play.", "La parité biologique est le postulat non négociable du fair-play."],
      ["detection", "/dɪˈtɛkʃn/", "Noun", "la détection biologique antidopage", "Detecting gene modifications requires cutting-edge epigenetic blood sequencing.", "Détecter les thérapies géniques exige le séquençage épigénétique."],
      ["transhumanism", "/trænzˈhjuːmənɪzəm/", "Noun", "la dérive transhumaniste du sport", "Sports purists warn that gene editing reduces human athletes to biomechanical commodities.", "Les puristes avertissent que le génie génétique réifie l'athlète."]
    ],
    dialogue: {
      title: "Audition à l'Agence Mondiale Antidopage (WADA)", setting: "Des lycéens étudient les défis de la lutte antidopage contemporaine.",
      lines: [
        ["Expert A", "Is the detection of gene doping more challenging than traditional chemical steroids?", "La détection du dopage génétique est-elle plus difficile que celle des stéroïdes chimiques ?"],
        ["Expert B", "Infinitely more complex, because the body produces the enhanced protein naturally once the genetic vector is incorporated.", "Infiniment plus complexe, car le corps produit la protéine naturellement une fois le vecteur intégré."],
        ["Expert A", "Gene editing alters cellular metabolism to the extent that distinguishing natural mutations from lab interventions is arduous.", "La modification génétique altère le métabolisme au point qu'il est ardu de distinguer mutation naturelle et laboratoire."],
        ["Expert B", "We must invest in advanced genomic passports to preserve the sacred soul of fair athletic competition.", "Nous devons investir dans le passeport génomique pour préserver l'âme de la compétition loyale."]
      ]
    },
    dictation: { prompt: "Gene doping threatens athletic integrity to the extent that sports lose meaning.", fr: "Le dopage génétique menace l'intégrité sportive au point que le sport perd son sens." },
    quiz: [
      { q: "Quelle locution conjonctive exprime 'au point que / dans une telle mesure que' au niveau C1 ?", opts: ["To the extent that", "Because that", "Whereas that", "Unless that"], a: 0, exp: "'To the extent that' exprime la conséquence proportionnelle ('au point que / dans la mesure où')." },
      { q: "Qu'est-ce que le 'gene doping' (dopage génétique) selon l'AMA ?", opts: ["Prendre des vitamines", "L'utilisation non thérapeutique de gènes ou de technologies génétiques pour accroître les performances", "Boire des boissons énergisantes", "Changer de chaussures"], a: 1, exp: "Le dopage génétique consiste à modifier le génome ou l'expression génétique pour doper artificiellement le corps." },
      { q: "Quel paramètre physiologique respiratoire majeur mesure le volume maximal d'oxygène qu'un sportif peut consommer ?", opts: ["Le rythme cardiaque au repos", "La VO2 max (Maximal oxygen uptake)", "La glycémie", "Le taux de calcium"], a: 1, exp: "La VO2 max est l'indicateur physiologique de référence de la puissance aérobie en endurance." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'music', num: 2,
    title: 'Acoustique architecturale & psychoacoustique',
    title_en: 'Concert Hall Acoustics & Sound Design',
    objective: 'Analyser comment l\'architecture et la physique du son sculptent l\'expérience musicale auditive.',
    grammar: {
      title: "Les propositions consécutives avec IT IS SO DESIGNED THAT / TO SUCH A DEGREE THAT",
      rule: "Dans la description de prouesses d'ingénierie acoustique de haut vol : The hall is engineered in such a manner that a whispered word on stage is heard clearly in the highest balcony.",
      example_en: "Concert hall acoustic reflections are calibrated to such a degree that every orchestral instrument resonates with crystalline warmth.",
      example_fr: "Les réflexions acoustiques de la salle sont calibrées à un tel degré que chaque instrument résonne avec une chaleur cristalline.",
      tip: "To such a degree that = À un tel point que (registre scientifique et architectural).",
      level_focus: "Consécutives de haut degré d'intensité (to such a degree that)."
    },
    vocab: [
      ["acoustics", "/əˈkuːstɪks/", "Noun", "l'acoustique architecturale", "Concert hall acoustics determine whether music sounds muddy or transcendent.", "L'acoustique détermine si la musique sonne brouillonne ou transcendante."],
      ["reverberation time", "/rɪˌvɜːrbəˈreɪʃn taɪm/", "Noun", "le temps de réverbération sonore (RT60)", "Symphony halls aim for a warm two-second reverberation time.", "Les salles symphoniques visent un temps de réverbération de deux secondes."],
      ["psychoacoustics", "/ˌsaɪkoʊəˈkuːstɪks/", "Noun", "la psychoacoustique (perception cognitive du son)", "Psychoacoustics explores how the human auditory cortex interprets spatial sound.", "La psychoacoustique explore la perception spatiale du son."],
      ["resonance", "/ˈrɛzənəns/", "Noun", "la résonance acoustique", "Wooden acoustic panels reflect mid-range frequencies with natural resonance.", "Des panneaux de bois reflètent les fréquences moyennes."],
      ["sound wave", "/saʊnd weɪv/", "Noun", "l'onde sonore", "Concave balconies disperse sound waves evenly across all seating tiers.", "Les balcons concaves dispersent les ondes de façon homogène."],
      ["auditorium", "/ˌɔːdɪˈtɔːriəm/", "Noun", "l'auditorium / la grande salle", "Hamburg's Elbphilharmonie auditorium features a revolutionary vineyard terraced design.", "L'Elbphilharmonie de Hambourg a une structure en vignoble."],
      ["diffuser", "/dɪˈfjuːzər/", "Noun", "le diffuseur acoustique", "Irregular surface diffusers eliminate harsh flutter echoes.", "Les diffuseurs de surface irréguliers éliminent les échos flottants."],
      ["absorption", "/əbˈzɔːrpʃn/", "Noun", "l'absorption phonique", "Velvet seating cushions calibrate precise sound absorption.", "Les fauteuils en velours calibrent une absorption acoustique précise."],
      ["clarity", "/ˈklærəti/", "Noun", "la clarté sonore / transparence acoustique", "Architects must balance acoustic warmth with crisp contrapuntal clarity.", "Les acousticiens doivent équilibrer chaleur et clarté."],
      ["spatial audio", "/ˈspeɪʃl ˈɔːdioʊ/", "Noun", "l'audio spatial 3D", "Spatial audio immerses listeners inside dynamic three-dimensional soundscapes.", "L'audio spatial plonge les auditeurs dans un espace en trois dimensions."]
    ],
    dialogue: {
      title: "Visite technique de l'Elbphilharmonie de Hambourg", setting: "Des lycéens découvrent la conception acoustique de Yasuhisa Toyota.",
      lines: [
        ["Architect", "Yasuhisa Toyota calculated ten thousand unique gypsum acoustic skin panels on supercomputers.", "Yasuhisa Toyota a calculé dix mille panneaux de plâtre acoustique uniques sur supercalculateurs."],
        ["Student", "Why are the surfaces carved with millions of millimeter-deep seashell grooves?", "Pourquoi les surfaces sont-elles sculptées de millions de rainures microscopiques ?"],
        ["Architect", "They diffuse acoustic reflections in such a manner that no sound frequency bounces harshly.", "Elles diffusent les réflexions de manière à ce qu'aucune fréquence ne rebondisse durement."],
        ["Student", "That explains why a solo flute sounds as intimate in the back row as it does next to the conductor.", "Cela explique pourquoi une flûte solo sonne aussi intimement au dernier rang que près du chef."]
      ]
    },
    dictation: { prompt: "The auditorium was engineered in such a manner that sound echoes naturally.", fr: "L'auditorium a été conçu de manière à ce que le son résonne naturellement." },
    quiz: [
      { q: "Quelle locution consécutive soutenue exprime 'à un tel point que' ?", opts: ["To such a degree that", "Because that", "Whereas that", "Unless that"], a: 0, exp: "'To such a degree that' (ou 'in such a manner that') est la formulation académique consacrée." },
      { q: "Qu'est-ce que le 'temps de réverbération' (RT60) en acoustique ?", opts: ["La durée du concert", "Le temps nécessaire pour que l'intensité sonore diminue de 60 décibels après l'arrêt de la source", "Le temps d'allumage des projecteurs", "La pause entre deux mouvements"], a: 1, exp: "Le temps de réverbération RT60 mesure le déclin de 60 dB de l'énergie acoustique dans une salle." },
      { q: "Quelle salle philharmonique contemporaine inaugurée à Hambourg en 2017 est mondialement célèbre pour ses panneaux en 'peau acoustique' ?", opts: ["La Scala de Milan", "L'Elbphilharmonie de Hambourg", "L'Opéra Garnier", "Le Carnegie Hall"], a: 1, exp: "L'Elbphilharmonie sur l'Elbe à Hambourg est un chef-d'œuvre contemporain d'acoustique computationnelle." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'music', num: 3,
    title: 'Musique dissidente & résistance politique',
    title_en: 'Dissident Music & Political Resistance',
    objective: 'Analyser la musique comme arme de contestation pacifique face aux régimes autoritaires (Chostakovitch, Bob Marley, Fela Kuti).',
    grammar: {
      title: "Les propositions subordonnées de proportionnalité avec IN PROPORTION AS et TO THE EXTENT THAT",
      rule: "Dans l'analyse géopolitique de la censure d'État : In proportion as totalitarian regimes suppress dissent, underground protest music acquires explosive political power.",
      example_en: "In proportion as state censorship intensified, dissident jazz recordings were circulated secretly on discarded X-ray films.",
      example_fr: "À mesure que la censure d'État s'intensifiait, les enregistrements de jazz dissident circulaient clandestinement sur de vieilles radiographies médicales.",
      tip: "In proportion as = À mesure que / Dans la mesure où (registre C1).",
      level_focus: "Proportionnalité historique soutenue (in proportion as)."
    },
    vocab: [
      ["dissident", "/ˈdɪsɪdənt/", "Adjective", "dissident / contestataire", "Dissident composers defied state dogma through subtle subtextual irony.", "Les compositeurs dissidents défiaient le dogme d'État par une ironie subtile."],
      ["censorship", "/ˈsɛnsərʃɪp/", "Noun", "la censure politique d'État", "Authoritarian censorship banned anti-war lyrics from official radio waves.", "La censure autoritaire bannissait les textes pacifistes de la radio."],
      ["protest anthem", "/ˈproʊtɛst ˈænθəm/", "Noun", "l'hymne de protestation / chanson engagée", "Bob Dylan's 'Blowin' in the Wind' became the universal anthem of civil rights.", "Blowin' in the Wind devint l'hymne universel des droits civiques."],
      ["subversion", "/səbˈvɜːrʒn/", "Noun", "la subversion politique pacifique", "Music functions as an untamable vehicle of democratic subversion.", "La musique agit comme un vecteur indomptable de subversion démocratique."],
      ["oppression", "/əˈprɛʃn/", "Noun", "l'oppression dictatoriale", "Under brutal oppression, protest songs preserve collective dignity.", "Sous une brutale oppression, le chant préserve la dignité collective."],
      ["clandestine", "/klænˈdɛstɪn/", "Adjective", "clandestin / secret", "Clandestine samizdat records were etched onto medical bone X-rays in Soviet Russia.", "Des disques clandestins 'sur os' étaient gravés sur radios en URSS."],
      ["defiance", "/dɪˈfaɪəns/", "Noun", "le défi ouvert / la bravade", "Singing the national anthem in defiance of tanks mobilized millions.", "Chanter l'hymne au défi des chars mobilisa des millions de personnes."],
      ["propaganda", "/ˌprɒpəˈɡændə/", "Noun", "la propagande d'État", "Regimes commissioned bombastic orchestral propaganda to glorify tyrants.", "Les régimes commandaient une propagande orchestrale grandiloquente."],
      ["emancipation", "/ɪˌmænsɪˈpeɪʃn/", "Noun", "l'émancipation humaine", "Reggae became a global manifesto of anti-colonial emancipation.", "Le reggae devint un manifeste mondial d'émancipation anticoloniale."],
      ["uncompromising", "/ʌnˈkɒmprəmaɪzɪŋ/", "Adjective", "intransigeant / sans concession", "Fela Kuti maintained an uncompromising musical crusade against military dictatorship.", "Fela Kuti mena une croisade musicale sans concession contre la junte."]
    ],
    dialogue: {
      title: "Les disques clandestins sur radiographies en URSS (Bone Music)", setting: "Des élèves découvrent l'histoire de la musique interdite pendant la Guerre froide.",
      lines: [
        ["Teacher", "In the 1950s Soviet Union, how did music lovers listen to banned American jazz and rock 'n' roll?", "Dans l'URSS des années 1950, comment écoutait-on le jazz et le rock américains interdits ?"],
        ["Student", "Bootleggers used medical X-ray sheets scavenged from hospital trash to press clandestine vinyl records called 'Ribs' or 'Bone Music'.", "Ils utilisaient des clichés de radiographies d'hôpitaux pour graver des disques pirates appelés 'musique sur les os'."],
        ["Teacher", "In proportion as state censorship intensified, the hunger for artistic freedom became unstoppable.", "À mesure que la censure d'État se durcissait, la soif de liberté artistique devenait irrépressible."],
        ["Student", "It shows that music possesses a spiritual force that no iron curtain or totalitarian wall can ever fully silence.", "Cela prouve que la musique a une force qu'aucun rideau de fer ne peut museler."]
      ]
    },
    dictation: { prompt: "In proportion as censorship tightened, dissident music circulated underground.", fr: "À mesure que la censure se durcissait, la musique dissidente circulait dans la clandestinité." },
    quiz: [
      { q: "Quelle locution conjonctive exprime la proportionnalité rigoureuse ('à mesure que') au niveau C1 ?", opts: ["In proportion as", "Because of", "Unless as", "So much"], a: 0, exp: "'In proportion as' est la conjonction littéraire soutenue marquant la stricte proportionnalité historique." },
      { q: "Qu'était la 'Bone Music' (musique sur les os) dans l'Union soviétique d'après-guerre ?", opts: ["Un instrument de musique fait d'os", "Des disques de jazz et de rock pirates gravés clandestinement sur de vieilles radiographies médicales", "Une chorale militaire", "Un opéra funèbre"], a: 1, exp: "Les 'Roentgenizdat' (Bone Music) étaient des disques pirates gravés sur de vieux clichés radio jetés par les hôpitaux soviétiques." },
      { q: "Quel musicien nigérian pionnier de l'Afrobeat a défié la junte militaire dans les années 1970 avec 'Zombie' ?", opts: ["Bob Marley", "Fela Kuti", "Miles Davis", "Miriam Makeba"], a: 1, exp: "Fela Kuti a utilisé son Afrobeat et son club 'The Shrine' pour dénoncer sans peur la corruption et la violence militaire." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'restaurant', num: 2,
    title: 'Haute gastronomie zéro déchet & durabilité',
    title_en: 'Zero-Waste Fine Dining & Eco-Luxury',
    objective: 'Analyser la révolution circulaire dans les restaurants étoilés (Silo London, Michelin Green Star).',
    grammar: {
      title: "L'emploi des gérondifs prépositionnels complexes (FAR FROM WASTING, INSTEAD OF DISCARDING)",
      rule: "Pour marquer un renversement radical de paradigme : Far from being a sacrifice of luxury, zero-waste fine dining elevates every root, peel and grain into extraordinary gastronomy.",
      example_en: "Far from generating food waste, restaurant Silo mills its own heritage grain and composts 100% of organic matter on-site.",
      example_fr: "Loin de générer des déchets alimentaires, le restaurant Silo moud son propre blé ancien et composte 100% de la matière organique sur place.",
      tip: "Far from + V-ing = Loin de faire quelque chose.",
      level_focus: "Gérondifs d'opposition radicale (far from + V-ing)."
    },
    vocab: [
      ["zero-waste", "/ˈzɪəroʊ weɪst/", "Adjective", "zéro déchet absolu", "Silo in London is recognized as the world's first zero-waste restaurant.", "Silo à Londres est reconnu comme le premier restaurant zéro déchet au monde."],
      ["Michelin Green Star", "/ˈmɪʃəlɪn ɡriːn stɑːr/", "Noun", "l'Étoile Verte Michelin (gastronomie durable)", "The Michelin Green Star rewards restaurants pioneering sustainable gastronomy.", "L'Étoile Verte Michelin récompense la gastronomie durable."],
      ["nose-to-tail", "/noʊz tuː teɪl/", "Adjective", "du museau à la queue (valorisation intégrale de l'animal)", "Nose-to-tail cooking honors animal life by preparing every single cut.", "La cuisine intégrale honore la vie animale en cuisinant chaque morceau."],
      ["composting", "/ˈkɒmpɒstɪŋ/", "Noun", "le compostage aérobie accéléré", "On-site aerobic composting turns scraps into fertilizer within twenty-four hours.", "Le composteur sur place transforme les épluchures en engrais en 24h."],
      ["circularity", "/ˌsɜːrkjəˈlærəti/", "Noun", "la circularité écologique des ressources", "Achieving culinary circularity requires eliminating single-use plastic supply chains.", "Atteindre la circularité exige de bannir le plastique jetable."],
      ["foraging", "/ˈfɒrɪdʒɪŋ/", "Noun", "la cueillette sauvage responsable", "Chefs practice respectful seasonal foraging in coastal salt marshes.", "Les chefs pratiquent la cueillette sauvage dans les marais salants."],
      ["heirloom grain", "/ˈɛərluːm ɡreɪn/", "Noun", "les céréales et variétés anciennes", "Stone-milling heritage heirloom grains preserves natural nutrient density.", "Moudre sur pierre des blés anciens préserve les nutriments."],
      ["upcycling", "/ˈʌpsaɪklɪŋ/", "Noun", "le surcyclage de sous-produits", "Crushed wine bottles are upcycled into restaurant glassware and dining tables.", "Les bouteilles écrasées sont surcyclées en vaisselle et tables."],
      ["biodynamic", "/ˌbaɪoʊdaɪˈnæmɪk/", "Adjective", "biodynamique", "Biodynamic vineyards align viticulture with lunar cycles and organic soils.", "Les vignobles biodynamiques s'alignent sur les cycles lunaires."],
      ["eco-luxury", "/ˈiːkoʊ ˈlʌkʃəri/", "Noun", "le luxe éco-responsable", "Eco-luxury demonstrates that environmental ethics amplify gastronomic excellence.", "L'éco-luxe prouve que l'éthique sublime l'excellence gastronomique."]
    ],
    dialogue: {
      title: "Visite du restaurant Silo à Hackney, Londres", setting: "Des lycéens rencontrent le chef Douglas McMaster.",
      lines: [
        ["Student A", "How can a fine dining restaurant operate with zero waste bins whatsoever?", "Comment un restaurant gastronomique peut-il fonctionner sans aucune poubelle ?"],
        ["Chef McMaster", "Far from discarding food, we receive whole carcasses, mill our own flour, and brew fermented drinks from fruit peels.", "Loin de jeter, nous recevons des bêtes entières, moulons notre farine et fermentons les peaux."],
        ["Student B", "What happens to the unavoidable scraps like eggshells and coffee grounds?", "Que deviennent les déchets inévitables comme les coquilles d'œufs et le marc de café ?"],
        ["Chef McMaster", "Our anaerobic digester turns them into rich organic compost in twenty-four hours, closing the ecological loop.", "Notre digesteur les transforme en compost riche en 24h, bouclant la boucle."]
      ]
    },
    dictation: { prompt: "Far from generating waste, the green restaurant composts all organic matter.", fr: "Loin de générer des déchets, le restaurant vert composte toute la matière organique." },
    quiz: [
      { q: "Quelle structure prépositionnelle exprime 'Loin de faire quelque chose...' ?", opts: ["Far from + V-ing", "Away from + BV", "Far to + BV", "Distance from + V-ing"], a: 0, exp: "'Far from + gérondif en -ing' exprime le contraste catégorique ('Loin de faire...')." },
      { q: "Quel restaurant londonien fondé par Douglas McMaster est mondialement célèbre pour n'avoir aucune poubelle de déchets ?", opts: ["The Fat Duck", "Silo London", "Rules", "The Ritz"], a: 1, exp: "'Silo' à Londres est le restaurant pionnier mondial du modèle culinaire zéro déchet absolu." },
      { q: "Quelle distinction officielle a été créée par le Guide Michelin pour récompenser les restaurants éco-responsables ?", opts: ["The Blue Diamond", "The Michelin Green Star (Étoile Verte)", "The Silver Spoon", "The Golden Leaf"], a: 1, exp: "L'Étoile Verte Michelin (Green Star) distingue les établissements exemplaires en matière de durabilité." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'restaurant', num: 3,
    title: 'Neurogastronomie & perception multisensorielle',
    title_en: 'Neurogastronomy & Multisensory Dining',
    objective: 'Analyser comment le cerveau construit le goût à travers la vue, l\'ouïe et la mémoire cognitive (synesthésie culinaire).',
    grammar: {
      title: "L'emploi des propositions clivées inverses avec IT IS BY... THAT",
      rule: "Dans une argumentation de neuropsychologie au niveau C1 : It is by manipulating acoustic frequencies and plate lighting that experimental chefs alter sweetness perception.",
      example_en: "It is through multisensory cross-modal integration that the human brain constructs the holistic illusion of flavor.",
      example_fr: "C'est par l'intégration croisée multisensorielle que le cerveau humain élabore l'illusion globale du goût.",
      tip: "Structure : It is + par tel moyen + THAT + proposition.",
      level_focus: "Phrases clivées de modalité instrumentale (It is by/through... that)."
    },
    vocab: [
      ["neurogastronomy", "/ˌnjʊəroʊɡæˈstrɒnəmi/", "Noun", "la neurogastronomie (neurosciences du goût)", "Neurogastronomy studies how the human brain creates the perception of flavor.", "La neurogastronomie étudie comment le cerveau crée la perception du goût."],
      ["multisensory", "/ˌmʌltiˈsɛnsəri/", "Adjective", "multisensoriel", "Multisensory dining combines taste, scent, tactile cutlery and sound design.", "La dégustation multisensorielle allie goût, odorat, couverts tactiles et son."],
      ["synesthesia", "/ˌsɪnəsˈθiːʒə/", "Noun", "la synesthésie cognitive", "Cross-modal synesthesia allows high-pitched music to enhance perceived sweetness.", "La synesthésie permet à une musique aiguë d'accentuer le sucré."],
      ["flavor", "/ˈfleɪvər/", "Noun", "la flaveur (synthèse goût + rétro-olfaction)", "Flavor is eighty percent retronasal olfaction rather than simple tongue taste.", "La flaveur est à 80% de l'olfaction rétro-nasale plutôt que du goût sur la langue."],
      ["umami", "/uːˈmɑːmi/", "Noun", "l'umami (la cinquième saveur savoureuse)", "Glutamate-rich aged parmesan activates deep umami taste receptors.", "Le parmesan affiné riche en glutamate active les récepteurs de l'umami."],
      ["retronasal olfaction", "/ˌrɛtroʊˈneɪzl ɒlˈfækʃn/", "Noun", "l'olfaction rétro-nasale", "Chewing releases volatile aromatic molecules into the retronasal passage.", "La mastication libère des molécules aromatiques dans les fosses rétronasales."],
      ["cognitive expectation", "/ˈkɒɡnətɪv ˌɛkspɛkˈteɪʃn/", "Noun", "l'attente cognitive du mangeur", "Heavy cutlery triggers subconscious cognitive expectations of high culinary luxury.", "Des couverts lourds déclenchent une attente inconsciente de grand luxe."],
      ["soundscape", "/ˈsaʊndskeɪp/", "Noun", "l'environnement sonore / soundscape", "Playing maritime soundscapes enhances the freshness of seafood.", "Diffuser des sons marins renforce la fraîcheur ressentie des fruits de mer."],
      ["cross-modal", "/krɒs ˈmoʊdl/", "Adjective", "cross-modal / intersensoriel", "Cross-modal psychology proves that round white plates make desserts taste sweeter.", "Les assiettes blanches rondes font paraître les desserts plus sucrés."],
      ["perception", "/pərˈsɛpʃn/", "Noun", "la perception cérébrale", "Taste perception is an active neural construction rather than passive intake.", "La perception gustative est une construction neuronale active."]
    ],
    dialogue: {
      title: "Expériences au laboratoire de recherche d'Oxford de Charles Spence", setting: "Des lycéens découvrent la psychologie expérimentale du goût.",
      lines: [
        ["Professor Spence", "When subjects listen to high-pitched brass chimes, they perceive chocolate as significantly sweeter.", "Quand les sujets écoutent des carillons aigus, ils perçoivent le chocolat comme bien plus sucré."],
        ["Student", "It is through cross-modal sensory integration that the brain blends hearing with taste, isn't it?", "C'est par l'intégration sensorielle croisée que le cerveau mêle l'ouïe au goût, n'est-ce pas ?"],
        ["Professor Spence", "Exactly. Flavor is not located on the tongue; it is an elaborate illusion sculpted by the cerebral cortex.", "Exactement. La flaveur n'est pas sur la langue ; c'est une illusion forgée par le cortex."],
        ["Student", "This reveals that our everyday dining experience is fundamentally psychological and artistic.", "Cela révèle que notre repas quotidien est fondamentalement psychologique et artistique."]
      ]
    },
    dictation: { prompt: "It is through cross-modal sensory integration that the brain constructs flavor.", fr: "C'est par l'intégration sensorielle croisée que le cerveau construit la saveur." },
    quiz: [
      { q: "Quelle structure d'insistance met l'accent sur le moyen employé au niveau C1 ?", opts: ["It is through X that...", "Because X does that...", "While X was doing...", "Since X is that..."], a: 0, exp: "'It is through X that...' est la phrase clivée consacrée pour mettre en valeur le vecteur ou moyen." },
      { q: "Quelle part de la perception d'un aliment provient de l'odorat rétro-nasal plutôt que des papilles de la langue ?", opts: ["Environ 10%", "Environ 50%", "Environ 80%", "0%"], a: 2, exp: "Les neurosciences ont démontré qu'environ 80% de ce que nous appelons 'goût' relève en réalité de l'olfaction rétro-nasale." },
      { q: "Quelle est la cinquième saveur fondamentale identifiée au Japon par le chimiste Kikunae Ikeda en 1908 ?", opts: ["Le piment", "L'acidité", "L'umami", "Le croquant"], a: 2, exp: "L'umami (relié au glutamate) est la cinquième saveur après le sucré, le salé, l'acide et l'amer." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'food', num: 2,
    title: 'Agriculture cellulaire & protéines de synthèse',
    title_en: 'Cellular Agriculture & Cultured Meat',
    objective: 'Analyser la viande cultivée en bioréacteur, l\'impact sur l\'élevage traditionnel et les défis éthiques et sanitaires.',
    grammar: {
      title: "Les propositions subordonnées concessives introduites par WHATEVER THE RESERVATIONS",
      rule: "Dans un débat bioéthique et technologique de haut vol : Whatever the reservations of traditional cattle farmers, cultured meat represents an unprecedented rupture in livestock carbon footprint.",
      example_en: "Whatever the initial consumer reluctance, cellular agriculture addresses urgent planetary planetary limits.",
      example_fr: "Quelles que soient les réticences initiales des consommateurs, l'agriculture cellulaire répond aux limites planétaires urgentes.",
      tip: "Structure : Whatever + groupe nominal + virgule + proposition principale.",
      level_focus: "Concession absolue avec WHATEVER (+ groupe nominal)."
    },
    vocab: [
      ["cellular agriculture", "/ˈsɛljələr ˈæɡrɪkʌltʃər/", "Noun", "l'agriculture cellulaire", "Cellular agriculture cultures animal proteins directly from stem cells without slaughter.", "L'agriculture cellulaire cultive des protéines sans abattage."],
      ["cultured meat", "/ˈkʌltʃərd miːt/", "Noun", "la viande de culture / viande cellulaire", "Singapore was the first nation to grant commercial approval to cultured meat.", "Singapour a été le premier pays à autoriser la viande de culture."],
      ["bioreactor", "/ˌbaɪoʊriˈæktər/", "Noun", "le bioréacteur stérile", "Stem cells multiply inside temperature-controlled nutrient bioreactors.", "Les cellules souches se multiplient en bioréacteurs."],
      ["slaughter", "/ˈslɔːtər/", "Noun", "l'abattage des animaux d'élevage", "Cultured meat offers animal protein devoid of industrial livestock slaughter.", "La viande cultivée offre des protéines sans abattage d'élevage."],
      ["stem cells", "/stɛm sɛlz/", "Noun", "les cellules souches", "Painless biopsies harvest harmless stem cells from living cattle.", "Une biopsie indolore prélève des cellules souches sur le bétail."],
      ["livestock farming", "/ˈlaɪvstɒk ˈfɑːrmɪŋ/", "Noun", "l'élevage intensif traditionnel", "Industrial livestock farming drives deforestation and methane emissions.", "L'élevage industriel génère déforestation et méthane."],
      ["nutrient broth", "/ˈnjuːtriənt brɒθ/", "Noun", "le bouillon de culture nutritif", "Cells feed upon amino acids, sugars and vitamins inside the broth.", "Les cellules se nourrissent d'acides aminés et de sucres dans le bouillon."],
      ["scalability", "/ˌskeɪləˈbɪləti/", "Noun", "la capacité de passage à l'échelle industrielle", "Cost scalability remains the primary engineering hurdle for cultivated beef.", "Le passage à l'échelle industrielle reste le défi d'ingénierie majeur."],
      ["deforestation", "/diːˌfɒrɪˈsteɪʃn/", "Noun", "la déforestation", "Phasing out cattle feed crops could reverse Amazonian deforestation.", "Réduire le fourrage pourrait inverser la déforestation amazonienne."],
      ["ethical dilemma", "/ˈɛθɪkl daɪˈlɛmə/", "Noun", "le dilemme éthique et culturel", "Synthesizing food challenges the ancient cultural symbolism of the hearth.", "Fabriquer la nourriture bouscule le symbolisme ancestral du repas."]
    ],
    dialogue: {
      title: "Audition à l'Agence Européenne de Sécurité des Aliments", setting: "Des élèves de terminale simulent un débat d'approbation réglementaire.",
      lines: [
        ["Biotech Expert", "Whatever the initial consumer hesitation, cultivated chicken uses ninety percent less land and ninety-five percent less water.", "Quelles que soient les hésitations initiales, le poulet cultivé utilise 90% de terres et 95% d'eau en moins."],
        ["Farmer Representative", "Yet, will detached laboratory bioreactors sever our civilizational connection to rural landscapes and pastoral traditions?", "Pourtant, des bioréacteurs vont-ils rompre notre lien civilisationnel aux paysages ruraux ?"],
        ["Biotech Expert", "We must not idealize industrial feedlots where millions of animals suffer cramped, unsanitary confinement.", "Ne soyons pas aveugles sur les élevages intensifs industriels où des millions d'animaux souffrent."],
        ["Consumer Advocate", "Transparent labeling and independent toxicology monitoring are vital to secure public trust.", "Un étiquetage transparent et des contrôles toxicologiques sont vitaux pour la confiance."]
      ]
    },
    dictation: { prompt: "Whatever the initial consumer reluctance, cellular meat reduces deforestation.", fr: "Quelles que soient les réticences initiales des consommateurs, la viande cellulaire réduit la déforestation." },
    quiz: [
      { q: "Quel pays est devenu en décembre 2020 le tout premier au monde à autoriser la commercialisation de viande cultivée ?", opts: ["Les États-Unis", "Singapour", "La France", "Le Japon"], a: 1, exp: "Singapour a été la première nation mondiale à autoriser la vente de poulet cultivé en laboratoire." },
      { q: "Quelle structure concessive formelle commence par 'Whatever' suivi d'un nom ?", opts: ["Whatever the doubts...", "Whatever is the doubt...", "Whatever that doubts...", "Whatever have doubts..."], a: 0, exp: "'Whatever + groupe nominal' exprime la concession absolue ('Quelles que soient les réserves...')." },
      { q: "Dans quel équipement les cellules animales souches sont-elles multipliées en laboratoire ?", opts: ["Un congélateur", "Un bioréacteur stérile thermo-régulé", "Un four à bois", "Un moulin"], a: 1, exp: "Le 'bioréacteur' fournit la chaleur, l'oxygène et les nutriments nécessaires à la prolifération cellulaire." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'work', num: 2,
    title: 'Leadership empathique & gouvernance moderne',
    title_en: 'Empathetic Leadership & Modern Governance',
    objective: 'Analyser la transformation du management moderne, l\'intelligence émotionnelle et le servant leadership.',
    grammar: {
      title: "L'emploi des structures elliptiques et des propositions au subjonctif après IT IS IMPERATIVE THAT",
      rule: "Dans la gouvernance d'entreprise au niveau C1 : It is imperative that modern corporate leaders cultivate emotional intelligence rather than relying solely on hierarchical coercion.",
      example_en: "It is crucial that directors listen with active vulnerability if they wish to inspire genuine psychological safety.",
      example_fr: "Il est crucial que les dirigeants écoutent avec une réelle vulnérabilité s'ils souhaitent instaurer une véritable sécurité psychologique.",
      tip: "It is imperative that he CULTIVATE (base verbale sans 's').",
      level_focus: "Subjonctif mandatif impersonnel (it is imperative/crucial that + base verbale)."
    },
    vocab: [
      ["emotional intelligence", "/ɪˈmoʊʃənl ɪnˈtɛlɪdʒəns/", "Noun", "l'intelligence émotionnelle (EQ)", "Emotional intelligence enables leaders to perceive subtle interpersonal dynamics.", "L'intelligence émotionnelle permet de déceler les dynamiques humaines subtiles."],
      ["servant leadership", "/ˈsɜːrvənt ˈliːdərʃɪp/", "Noun", "le servant leadership (leader au service de son équipe)", "Servant leadership prioritizes team growth and empowerment over authoritarian ego.", "Le servant leadership privilégie l'épanouissement de l'équipe sur l'ego."],
      ["psychological safety", "/ˌsaɪkəˈlɒdʒɪkl ˈseɪfti/", "Noun", "la sécurité psychologique au travail", "Teams with high psychological safety embrace constructive disagreement without fear.", "Les équipes en sécurité psychologique acceptent le désaccord sans peur."],
      ["governance", "/ˈɡʌvərnəns/", "Noun", "la gouvernance d'entreprise", "Modern corporate governance integrates environmental and social stakeholder duties.", "La gouvernance moderne intègre les devoirs environnementaux et sociaux."],
      ["empathy", "/ˈɛmpəθi/", "Noun", "l'empathie active", "Empathy fosters mutual trust across multicultural international teams.", "L'empathie tisse une confiance mutuelle dans les équipes multiculturelles."],
      ["coercion", "/koʊˈɜːrʒn/", "Noun", "la contrainte autoritaire / la coercition", "Outdated hierarchical coercion extinguishes employee initiative and creativity.", "La coercition hiérarchique étouffe l'initiative et la créativité."],
      ["vulnerability", "/ˌvʌlnərəˈbɪləti/", "Noun", "la vulnérabilité authentique", "Showing authentic vulnerability builds unbreakable leadership credibility.", "Montrer une vulnérabilité authentique bâtit une crédibilité durable."],
      ["burnout", "/ˈbɜːrnaʊt/", "Noun", "l'épuisement professionnel / burnout", "Toxic competitive work cultures inevitably accelerate executive burnout.", "Les cultures compétitives toxiques accélèrent le surmenage."],
      ["accountability", "/əˌkaʊntəˈbɪləti/", "Noun", "la responsabilité exemplaire", "Leaders demonstrate accountability by admitting organizational mistakes openly.", "Les dirigeants assument leurs responsabilités en reconnaissant leurs erreurs."],
      ["empowerment", "/ɪmˈpaʊərmənt/", "Noun", "l'autonomisation des collaborateurs", "True empowerment delegates decision-making authority to front-line teams.", "L'autonomisation délègue le pouvoir décisionnel aux équipes de terrain."]
    ],
    dialogue: {
      title: "Séminaire de management à la London Business School", setting: "Des étudiants analysent les études de Google sur le projet 'Aristote'.",
      lines: [
        ["Professor", "What was the single most vital factor identified by Google's Aristotle project for peak team performance?", "Quel a été le facteur clé identifié par le projet Aristote de Google pour la performance d'équipe ?"],
        ["Student", "It was psychological safety. It is imperative that every team member feel safe to take interpersonal risks without ridicule.", "C'était la sécurité psychologique. Il est impératif que chacun puisse s'exprimer sans crainte."],
        ["Professor", "Authoritarian leaders who rule by fear destroy innovation and trigger silent resignation.", "Les dirigeants autoritaires qui gouvernent par la peur détruisent l'innovation et provoquent la démission."],
        ["Student", "Modern leadership is no longer about having all the answers; it is about asking the right questions with humility.", "Le leadership moderne ne consiste plus à avoir réponse à tout, mais à poser les bonnes questions avec humilité."]
      ]
    },
    dictation: { prompt: "It is imperative that leaders cultivate psychological safety in their teams.", fr: "Il est impératif que les dirigeants cultivent la sécurité psychologique dans leurs équipes." },
    quiz: [
      { q: "Quelle forme verbale s'emploie après 'It is imperative that every manager...' au niveau soutenu ?", opts: ["listen", "listens", "listened", "listening"], a: 0, exp: "Le subjonctif mandatif exige la base verbale nue sans 's' : 'It is imperative that he listen'." },
      { q: "Qu'a révélé l'étude de référence de Google (Projet Aristote) sur la performance des équipes d'élite ?", opts: ["Le QI individuel est le seul facteur", "La sécurité psychologique (le droit à l'erreur et à la parole sans crainte) est le critère numéro 1", "Le montant des primes", "Le temps passé au bureau"], a: 1, exp: "Le projet Aristote a démontré que la sécurité psychologique est le socle absolu des équipes ultra-performantes." },
      { q: "Que prône le modèle de management du 'servant leadership' ?", opts: ["Le retour de l'autorité militaire", "Le rôle du leader comme serviteur et facilitateur dédié au succès de son équipe", "L'absence de règles", "L'automatisation totale"], a: 1, exp: "Le 'servant leadership' (Robert Greenleaf) place le soutien et l'écoute des collaborateurs au cœur de la mission du chef." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'work', num: 3,
    title: 'Altermondialisme & capitalisme des parties prenantes',
    title_en: 'Stakeholder Capitalism & Post-Growth',
    objective: 'Analyser la transition vers un capitalisme des parties prenantes, la sobriété et la théorie du donut de Kate Raworth.',
    grammar: {
      title: "Les propositions subordonnées de proportionnalité inverse avec AS OPPOSED TO et RATHER THAN (+ V-ing)",
      rule: "Dans l'analyse socio-économique contemporaine au niveau C1 : Modern thinkers advocate stakeholder capitalism, as opposed to short-term shareholder primacy.",
      example_en: "Rather than prioritizing quarterly shareholder dividends, regenerative businesses invest in ecological restoration and fair living wages.",
      example_fr: "Plutôt que de privilégier les dividendes trimestriels des actionnaires, les entreprises régénératrices investissent dans l'écologie et des salaires décents.",
      tip: "Rather than + V-ing est une structure élégante pour opposer deux modèles politiques ou économiques.",
      level_focus: "Gérondif d'alternative préférentielle (rather than + V-ing)."
    },
    vocab: [
      ["stakeholder capitalism", "/ˈsteɪkˌhoʊldər ˈkæpɪtəlɪzəm/", "Noun", "le capitalisme des parties prenantes", "Stakeholder capitalism balances employees, ecosystems, communities and investors.", "Le capitalisme des parties prenantes équilibre salariés, écosystèmes et investisseurs."],
      ["doughnut economics", "/ˈdoʊnʌt ˌiːkəˈnɒmɪks/", "Noun", "la théorie économique du donut (Kate Raworth)", "Doughnut economics envisions human thriving between social foundation and ecological ceiling.", "L'économie du donut vise l'épanouissement entre plancher social et plafond écologique."],
      ["degrowth", "/diːˈɡroʊθ/", "Noun", "la décroissance choisie / la sobriété heureuse", "Degrowth advocates reducing material throughput while enhancing communal quality of life.", "La décroissance prône la sobriété matérielle pour le bien commun."],
      ["shareholder primacy", "/ˈʃɛərˌhoʊldər ˈpraɪməsi/", "Noun", "le primat exclusif de l'actionnaire", "Milton Friedman's doctrine of shareholder primacy generated predatory short-termism.", "Le primat de l'actionnaire a engendré un court-termisme prédateur."],
      ["regenerative", "/rɪˈdʒɛnərətɪv/", "Adjective", "régénératif / réparateur", "Regenerative enterprises design industrial loops that replenish living systems.", "Les entreprises régénératrices conçoivent des boucles qui réparent les sols."],
      ["planetary boundaries", "/ˈplænətəri ˈbaʊndəriz/", "Noun", "les limites planétaires biophysiques", "Economic models must respect the nine scientifically quantified planetary boundaries.", "L'économie doit respecter les neuf limites planétaires."],
      ["commons", "/ˈkɒmənz/", "Noun", "les biens communs partagés", "Elinor Ostrom proved that communities can sustainably manage shared natural commons.", "Elinor Ostrom a prouvé que les communautés savent gérer les biens communs."],
      ["wellbeing economy", "/ˌwɛlˈbiːɪŋ ɪˈkɒnəmi/", "Noun", "l'économie du bien-être humain et écologique", "New Zealand measures national progress through a wellbeing budget rather than GDP.", "La Nouvelle-Zélande mesure le progrès par le bien-être plutôt que par le PIB."],
      ["GDP", "/ˌdʒiː diː ˈpiː/", "Noun", "le Produit Intérieur Brut (PIB)", "GDP blindly counts environmental disasters and pollution cleanups as positive growth.", "Le PIB comptabilise aveuglément les marées noires comme de la croissance."],
      ["sustainability", "/səˌsteɪnəˈbɪləti/", "Noun", "la durabilité sociétale", "True sustainability demands shifting from quantitative expansion to qualitative flourishing.", "La durabilité exige de passer de l'expansion au fleurissement qualitatif."]
    ],
    dialogue: {
      title: "L'économie du donut à l'université d'Oxford", setting: "Des lycéens de terminale analysent le modèle de Kate Raworth.",
      lines: [
        ["Student A", "Why does economist Kate Raworth argue that twentieth-century economic models are dangerously obsolete?", "Pourquoi l'économiste Kate Raworth affirme-t-elle que les modèles du 20e siècle sont obsolètes ?"],
        ["Teacher", "Because they assumed endless linear growth on a finite planet, ignoring ecological carrying capacities.", "Parce qu'ils supposaient une croissance infinie sur une planète finie."],
        ["Student B", "Rather than obsessing over GDP, the Doughnut model sets boundaries between human social needs and planetary limits.", "Plutôt que d'obséder sur le PIB, le modèle du Donut fixe les limites écologiques et sociales."],
        ["Teacher", "Cities like Amsterdam and Brussels have officially adopted this framework to transform urban governance.", "Des villes comme Amsterdam et Bruxelles ont adopté ce cadre pour leur gouvernance."]
      ]
    },
    dictation: { prompt: "Rather than pursuing endless growth, cities adopt regenerative economic models.", fr: "Plutôt que de poursuivre une croissance infinie, les villes adoptent des modèles économiques régénérateurs." },
    quiz: [
      { q: "Quelle formulation oppose élégamment deux comportements au niveau C1 ?", opts: ["Rather than + verbe en -ing", "Instead to + base verbale", "In opposition with + PP", "Far of + BV"], a: 0, exp: "'Rather than + V-ing' est la structure consacrée pour opposer une alternative vertueuse à un travers ('Rather than pursuing...')." },
      { q: "Quel modèle économique développé par Kate Raworth d'Oxford propose d'évoluer entre plancher social et plafond écologique ?", opts: ["Doughnut Economics (L'économie du Donut)", "The Wealth of Nations", "Trickle-down economics", "The Invisible Hand"], a: 0, exp: "L'économie du Donut (Kate Raworth) visualise l'espace sûr et juste pour l'humanité entre besoins vitaux et limites terrestres." },
      { q: "Quelle première femme économiste a reçu le prix Nobel en 2009 pour ses travaux sur la gestion durable des 'Biens communs' (Commons) ?", opts: ["Janet Yellen", "Elinor Ostrom", "Esther Duflo", "Christine Lagarde"], a: 1, exp: "Elinor Ostrom a démontré que les communautés locales savent gérer collectivement les ressources partagées sans privatisation." }
    ]
  },
  {
    grade: 'terminale', theme_id: 'school_social', num: 2,
    title: 'Justice pénale internationale & droits humains',
    title_en: 'International Criminal Justice & Human Rights',
    objective: 'Comprendre la mission de la Cour pénale internationale de La Haye, la lutte contre l\'impunité et le crime de génocide.',
    grammar: {
      title: "L'emploi des structures passives avec NÉGATION EN TÊTE DE PHRASE (UNDER NO CIRCUMSTANCES SHALL)",
      rule: "Dans la jurisprudence et les traités solennels de droits humains : Under no circumstances shall war crimes or crimes against humanity go unpunished.",
      example_en: "Under no circumstances may international tribunals recognize immunity for perpetrators of mass atrocities.",
      example_fr: "En aucune circonstance les tribunaux internationaux ne peuvent reconnaître d'immunité pour les auteurs d'atrocités de masse.",
      tip: "Structure d'interdiction solennelle absolue : Under no circumstances + auxiliaire + sujet + base verbale.",
      level_focus: "Inversion après locution négative absolue (under no circumstances shall/may)."
    },
    vocab: [
      ["International Criminal Court", "/ˌɪntərˈnæʃnəl ˈkrɪmɪnl kɔːrt/", "Noun", "la Cour pénale internationale (CPI à La Haye)", "The International Criminal Court prosecutes individuals accused of genocide and war crimes.", "La CPI poursuit les personnes accusées de génocide et crimes de guerre."],
      ["crimes against humanity", "/kraɪmz əˈɡɛnst hjuːˈmænəti/", "Noun", "les crimes contre l'humanité", "Crimes against humanity are legally imprescriptible under international law.", "Les crimes contre l'humanité sont imprescriptibles en droit international."],
      ["genocide", "/ˈdʒɛnəsaɪd/", "Noun", "le crime de génocide", "Raphael Lemkin coined the legal term 'genocide' in 1944.", "Raphaël Lemkin a forgé le terme juridique de 'génocide' en 1944."],
      ["impunity", "/ɪmˈpjuːnəti/", "Noun", "l'impunité judiciaire", "Universal jurisdiction battles relentlessly against sovereign impunity.", "La compétence universelle lutte sans relâche contre l'impunité."],
      ["prosecutor", "/ˈprɒsɪkjuːtər/", "Noun", "le procureur général près la CPI", "The chief prosecutor presents forensic evidence gathered in conflict zones.", "Le procureur en chef présente des preuves médico-légales."],
      ["Rome Statute", "/roʊm ˈstætʃuːt/", "Noun", "le Statut de Rome (traité fondateur de la CPI, 1998)", "Over one hundred and twenty states have ratified the Rome Statute.", "Plus de 120 États ont ratifié le Statut de Rome."],
      ["witness protection", "/ˈwɪtnəs prəˈtɛkʃn/", "Noun", "la protection internationale des témoins", "The court maintains rigorous witness protection programs.", "La cour assure des programmes rigoureux de protection des témoins."],
      ["sovereignty", "/ˈsɒvrənti/", "Noun", "la souveraineté des États", "Dictators cynically invoke state sovereignty to shield against international arrest warrants.", "Des dictateurs invoquent la souveraineté pour échapper aux mandats."],
      ["reparations", "/ˌrɛpəˈreɪʃnz/", "Noun", "les réparations et fonds pour les victimes", "The Trust Fund for Victims delivers psychological and financial reparations.", "Le fonds pour les victimes apporte réparations psychologiques et matérielles."],
      ["tribunal", "/traɪˈbjuːnl/", "Noun", "le tribunal pénal international", "From Nuremberg to The Hague, international tribunals advance global human rights.", "De Nuremberg à La Haye, les tribunaux font progresser les droits humains."]
    ],
    dialogue: {
      title: "Audience à la Cour Pénale Internationale de La Haye", setting: "Des étudiants en droit et lycéens assistent à une plaidoirie au Palais de la Paix.",
      lines: [
        ["Student", "Can sitting heads of state claim diplomatic immunity before the International Criminal Court?", "Des chefs d'État en exercice peuvent-ils revendiquer l'immunité diplomatique devant la CPI ?"],
        ["Legal Scholar", "Under no circumstances may official status shield an individual from prosecution for genocide or war crimes.", "En aucune circonstance un statut officiel ne peut protéger de poursuites pour génocide."],
        ["Student", "What historical breakthrough does the Rome Statute of 1998 represent?", "Quelle avancée historique le Statut de Rome de 1998 représente-t-il ?"],
        ["Legal Scholar", "It established the first permanent world court dedicated to ending impunity and vindicating the rights of victims.", "Il a créé la première cour permanente mondiale pour abolir l'impunité et réhabiliter les victimes."]
      ]
    },
    dictation: { prompt: "Under no circumstances may war criminals escape international justice.", fr: "En aucune circonstance les criminels de guerre ne peuvent échapper à la justice internationale." },
    quiz: [
      { q: "Quelle structure d'interdiction solennelle absolue inverse l'auxiliaire et le sujet au niveau C1 ?", opts: ["Under no circumstances may / shall...", "In all situations you will...", "Because no one can...", "Never the law should..."], a: 0, exp: "'Under no circumstances may/shall + sujet + base verbale' est l'inversion négative solennelle absolue du droit." },
      { q: "Dans quelle ville des Pays-Bas siège la Cour pénale internationale (CPI) ?", opts: ["Amsterdam", "Rotterdam", "La Haye (The Hague)", "Utrecht"], a: 2, exp: "La Cour pénale internationale a son siège permanent à La Haye aux Pays-Bas." },
      { q: "Quel juriste courageux a créé le mot 'génocide' en 1944 pour désigner la destruction délibérée d'un groupe humain ?", opts: ["Raphaël Lemkin", "Winston Churchill", "Jean Monnet", "Eleanor Roosevelt"], a: 0, exp: "Raphaël Lemkin, juriste polonais d'origine juive, a forgé le concept et mot de 'génocide' en 1944." }
    ]
  }
];
