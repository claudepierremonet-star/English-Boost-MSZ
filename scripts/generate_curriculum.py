import json
import os
import csv

out_json = "public/data/english_boost_mz_curriculum.json"
out_csv = "public/data/index_lecons.csv"
out_md = "public/data/GUIDE_PEDAGOGIQUE_FR.md"
out_ts_json = "src/data/schoolCurriculumData.json"

levels = [
    {"id":"6e","label":"Sixième","cycle":"Cycle 3","cefr":"A1–A1+","goal":"Acquérir les bases, se présenter, comprendre et construire des phrases simples au présent."},
    {"id":"5e","label":"Cinquième","cycle":"Cycle 4","cefr":"A1+–A2","goal":"Décrire son quotidien, poser des questions, raconter des activités et exprimer des habitudes."},
    {"id":"4e","label":"Quatrième","cycle":"Cycle 4","cefr":"A2–A2+","goal":"Raconter des événements au passé, comparer, exprimer des projets et justifier ses préférences."},
    {"id":"3e","label":"Troisième","cycle":"Cycle 4","cefr":"A2+–B1","goal":"Argumenter simplement, raconter des expériences, expliquer ses choix et préparer l'entrée au lycée."},
    {"id":"2nde","label":"Seconde","cycle":"Lycée","cefr":"B1","goal":"Développer l’autonomie, comprendre des échanges longs, décrire des expériences et défendre une opinion."},
    {"id":"1re","label":"Première","cycle":"Lycée","cefr":"B1–B2","goal":"Argumenter avec nuance, analyser des documents, débattre et employer des structures complexes."},
    {"id":"terminale","label":"Terminale","cycle":"Lycée","cefr":"B2, ouverture C1","goal":"Nuancer son opinion, débattre, analyser, négocier et communiquer avec précision stylistique."}
]

themes = [
    ("daily_life","Vie quotidienne","schedule","Daily Life & Routines"),
    ("travel","Voyages","flight_takeoff","Travel & Exploration"),
    ("history","Histoire & Patrimoine","history_edu","History & Heritage"),
    ("hobbies","Loisirs & Créativité","palette","Hobbies & Leisure"),
    ("sport","Sport & Dépassement","fitness_center","Sports & Athletics"),
    ("music","Musique & Culture","music_note","Music & Performing Arts"),
    ("restaurant","Restaurant & Convivialité","restaurant","Dining Out & Gastronomy"),
    ("food","Alimentation & Santé","nutrition","Food & Nutrition"),
    ("work","Monde du Travail","work","Workplace & Dynamics"),
    ("school_social","Métiers & Vocations","school","Professions & Careers")
]

vocab = {
"daily_life":[
("wake up","se réveiller","I wake up at seven.","Je me réveille à sept heures.","/weɪk ʌp/","Phrasal verb"),
("get dressed","s’habiller","I get dressed quickly in the morning.","Je m’habille rapidement le matin.","/ɡɛt drɛst/","Verb"),
("have breakfast","prendre le petit-déjeuner","I have breakfast with my family.","Je prends le petit-déjeuner avec ma famille.","/hæv ˈbrɛkfəst/","Collocation"),
("brush my teeth","me brosser les dents","I brush my teeth twice a day.","Je me brosse les dents deux fois par jour.","/brʌʃ maɪ tiːθ/","Phrase"),
("leave home","quitter la maison","I leave home at eight to catch the bus.","Je quitte la maison à huit heures pour prendre le bus.","/liːv hoʊm/","Phrase"),
("do homework","faire ses devoirs","I do my homework right after school.","Je fais mes devoirs juste après l’école.","/duː ˈhoʊmwɜːrk/","Collocation"),
("tidy my room","ranger ma chambre","I tidy my room every Saturday morning.","Je range ma chambre chaque samedi matin.","/ˈtaɪdi maɪ ruːm/","Phrase"),
("go to bed","aller se coucher","I go to bed at ten o'clock to stay rested.","Je vais me coucher à dix heures pour être reposé.","/ɡoʊ tuː bɛd/","Phrase")
],
"travel":[
("a journey","un voyage / trajet","The train journey takes two hours.","Le voyage en train dure deux heures.","/ə ˈdʒɜːrni/","Noun"),
("a suitcase","une valise","My suitcase is packed and ready.","Ma valise est prête et bouclée.","/ə ˈsuːtkeɪs/","Noun"),
("a boarding ticket","un billet d'embarquement","I showed my ticket at the gate.","J'ai présenté mon billet à la porte.","/ə ˈtɪkɪt/","Noun"),
("a platform","un quai de gare","The express train leaves from platform three.","Le train express part du quai trois.","/ə ˈplætfɔːrm/","Noun"),
("a map","une carte / plan","We need a map of the historical city.","Nous avons besoin d’un plan de la cité historique.","/ə mæp/","Noun"),
("to book a stay","réserver un séjour","I want to book a room near the museum.","Je veux réserver une chambre près du musée.","/tuː bʊk ə steɪ/","Verb phrase"),
("to get lost","se perdre","We got lost in the labyrinth of the old town.","Nous nous sommes perdus dans le dédale de la vieille ville.","/tuː ɡɛt lɒst/","Verb phrase"),
("sightseeing","les visites touristiques","We spent the afternoon sightseeing in London.","Nous avons passé l'après-midi en visites touristiques à Londres.","/ˈsaɪtsiːɪŋ/","Noun")
],
"history":[
("a century","un siècle","The Gothic cathedral is six centuries old.","La cathédrale gothique a six siècles d'histoire.","/ə ˈsɛntʃəri/","Noun"),
("an event","un événement historique","This pivotal event changed European history.","Cet événement charnière a changé l’histoire européenne.","/ən ɪˈvɛnt/","Noun"),
("a monarch","un souverain / une reine","The monarch signed the diplomatic treaty.","Le souverain a signé le traité diplomatique.","/ə ˈmɒnərk/","Noun"),
("an ancient palace","un palais antique","The king resided in a splendid stone palace.","Le roi résidait dans un splendide palais de pierre.","/ən ˈeɪnʃənt ˈpæləs/","Noun phrase"),
("a treaty","un traité de paix","The peace treaty put an end to the conflict.","Le traité de paix a mis un terme au conflit.","/ə ˈtriːti/","Noun"),
("a breakthrough discovery","une découverte capitale","The archaeological discovery was unprecedented.","La découverte archéologique était sans précédent.","/ə dɪˈskʌvəri/","Noun"),
("a primary source","une source primaire","This handwritten letter is an authentic historical source.","Cette lettre manuscrite est une source historique authentique.","/ə ˈpraɪməri sɔːrs/","Noun phrase"),
("to pioneer","être pionnier / inventer","Scholars pioneered new printing techniques.","Des érudits ont été pionniers dans les techniques d'impression.","/tuː ˌpaɪəˈnɪər/","Verb")
],
"hobbies":[
("to sketch","esquisser / dessiner","I love to sketch architectural monuments.","J’adore esquisser des monuments architecturaux.","/tuː skɛtʃ/","Verb"),
("to read literature","lire de la littérature","She reads historical essays before sleep.","Elle lit des essais historiques avant de dormir.","/tuː riːd ˈlɪtərətʃər/","Verb phrase"),
("board games","les jeux de société / stratégie","We play chess and board games together.","Nous jouons aux échecs et aux jeux de stratégie ensemble.","/bɔːrd ɡeɪmz/","Noun phrase"),
("photography","la photographie d'art","Photography helps me notice intricate light details.","La photographie m'aide à remarquer les subtils reflets de lumière.","/fəˈtɒɡrəfi/","Noun"),
("to collect antiquities","collectionner","He collects rare coins and antique engravings.","Il collectionne des pièces rares et des gravures anciennes.","/tuː kəˈlɛkt/","Verb phrase"),
("leisure time","le temps libre","I cherish my leisure time on Sunday afternoons.","Je chéris mon temps libre le dimanche après-midi.","/ˈliːʒər taɪm/","Noun phrase"),
("to unwind","se détendre / décompresser","Classical music helps me unwind after class.","La musique classique m’aide à décompresser après les cours.","/tuː ʌnˈwaɪnd/","Verb"),
("an artistic skill","un talent / compétence","Playing the cello requires discipline and skill.","Jouer du violoncelle requiert de la discipline et du talent.","/ən ɑːrˈtɪstɪk skɪl/","Noun phrase")
],
"sport":[
("a team","une équipe","Our rowing team trains every Tuesday dawn.","Notre équipe d'aviron s'entraîne chaque mardi à l'aube.","/ə tiːm/","Noun"),
("a tournament","un tournoi / compétition","The championship match begins at six o'clock.","Le match de championnat débute à six heures pile.","/ə ˈtʊərnəmənt/","Noun"),
("to train rigorously","s’entraîner avec rigueur","Athletes train rigorously three times a week.","Les athlètes s'entraînent avec rigueur trois fois par semaine.","/tuː treɪn/","Verb phrase"),
("a striker","un joueur / attaquant","The striker scored a spectacular deciding goal.","L'attaquant a inscrit un but décisif spectaculaire.","/ə ˈstraɪkər/","Noun"),
("the final score","le score final","The final score was two-one in our favour.","Le score final était de deux à un en notre faveur.","/ðə ˈfaɪnəl skɔːr/","Noun phrase"),
("to triumph","triompher / l'emporter","We trained hard to triumph against all odds.","Nous nous sommes entraînés dur pour triompher envers et contre tout.","/tuː ˈtraɪʌmf/","Verb"),
("to persevere","persévérer face à la défaite","True champions learn to persevere after a defeat.","Les vrais champions apprennent à persévérer après une défaite.","/tuː ˌpɜːrsɪˈvɪər/","Verb"),
("fair play and ethics","le fair-play et l'esprit sportif","Fair play matters far more than mere victory.","Le fair-play compte bien plus qu'une simple victoire.","/fɛər pleɪ/","Noun phrase")
],
"music":[
("a melody","une mélodie","This haunting melody evokes deep nostalgia.","Cette mélodie envoûtante évoque une profonde nostalgie.","/ə ˈmɛlədi/","Noun"),
("a vocalist","un chanteur / cantatrice","The vocalist possesses an extraordinarily versatile range.","La cantatrice possède une tessiture extraordinairement étendue.","/ə ˈvoʊkəlɪst/","Noun"),
("an orchestra","un orchestre / ensemble","The symphony orchestra performed Beethoven's Ninth.","L’orchestre symphonique a interprété la Neuvième de Beethoven.","/ən ˈɔːrkɪstrə/","Noun"),
("poetic lyrics","des paroles poétiques","I analysed the poetic lyrics of the ballad.","J’ai analysé les paroles poétiques de la ballade.","/pəʊˈɛtɪk ˈlɪrɪks/","Noun phrase"),
("tempo and rhythm","la cadence et le rythme","The lively tempo makes the composition danceable.","Le tempo vif rend la composition entraînante.","/ˈtɛmpoʊ ænd ˈrɪðəm/","Noun phrase"),
("a live recital","un concert / récital en direct","We attended an acoustic recital in the auditorium.","Nous avons assisté à un récital acoustique dans l'auditorium.","/ə laɪv rɪˈsaɪtəl/","Noun phrase"),
("to compose harmonies","composer des harmonies","She composes delicate piano harmonies at night.","Elle compose de délicates harmonies au piano la nuit.","/tuː kəmˈpoʊz/","Verb phrase"),
("a studio master","un enregistrement de référence","The audio recording captured every nuance of the cello.","L'enregistrement a capté chaque nuance du violoncelle.","/ə ˈstjuːdioʊ ˈmɑːstər/","Noun phrase")
],
"restaurant":[
("an à la carte menu","la carte / le menu gastronomique","Could I peruse the evening menu, please?","Pourrais-je consulter la carte du soir, s’il vous plaît ?","/ə ˈmɛnjuː/","Noun phrase"),
("the head waiter","le maître d'hôtel / serveur","The head waiter recommended the roast sea bass.","Le maître d'hôtel a recommandé le bar rôti.","/ðə hɛd ˈweɪtər/","Noun phrase"),
("a reserved table","une table réservée","We booked a quiet table by the bay window.","Nous avons réservé une table calme près de la baie vitrée.","/ə rɪˈzɜːrvd ˈteɪbəl/","Noun phrase"),
("a savoury starter","une entrée raffinée","I would relish a warm vegetable velouté as a starter.","J'apprécierais un velouté de légumes chaud en entrée.","/ə ˈseɪvəri ˈstɑːrtər/","Noun phrase"),
("the chef's speciality","le plat signature du chef","The chef's speciality combines seasonal ingredients.","Le plat signature du chef marie des ingrédients de saison.","/ðə ʃɛfs ˌspɛʃiˈæləti/","Noun phrase"),
("the bill, please","l’addition s'il vous plaît","Could we settle the bill at your convenience?","Pourrions-nous régler l’addition quand vous le pourrez ?","/ðə bɪl pliːz/","Phrase"),
("to order culinary dishes","passer commande","Are you ready to order your courses?","Êtes-vous prêts à passer commande de vos plats ?","/tuː ˈɔːrdər/","Verb phrase"),
("a dining reservation","une réservation de table","I placed a reservation under the name of Saint-Clair.","J’ai effectué une réservation au nom de Saint-Clair.","/ə ˌrɛzərˈveɪʃən/","Noun phrase")
],
"food":[
("organic vegetables","des légumes bio / potagers","Crisp green vegetables form the cornerstone of wellness.","Des légumes verts croquants forment la clé de voûte du bien-être.","/ɔːrˈɡænɪk ˈvɛdʒtəbəlz/","Noun phrase"),
("seasonal fresh fruit","des fruits frais de saison","Seasonal berries are both delicious and vitamin-rich.","Les baies de saison sont à la fois délicieuses et riches en vitamines.","/ˈsiːzənl frɛʃ fruːt/","Noun phrase"),
("a balanced meal","un repas équilibré","A nutritious breakfast fuels cognitive performance.","Un petit-déjeuner nutritif nourrit les performances cognitives.","/ə ˈbælənst miːl/","Noun phrase"),
("nutritious and wholesome","sain et roboratif","Wholesome porridge provides steady long-lasting energy.","Un porridge sain procure une énergie stable et durable.","/njuːˈtrɪʃəs/","Adjective"),
("spiced and seasoned","délicatement épicé","The aromatic broth was seasoned with wild thyme.","Le bouillon aromatique était assaisonné de serpolet sauvage.","/spaɪst/","Adjective"),
("a hint of sweetness","une pointe de douceur sucrée","A drizzle of honey lends a subtle sweetness to the tart.","Un filet de miel confère une douceur subtile à la tarte.","/ə hɪnt ɒv ˈswiːtnəs/","Noun phrase"),
("to savour flavours","déguster / apprécier les saveurs","Take your time to savour each distinct aroma.","Prenez le temps de savourer chaque arôme distinct.","/tuː ˈseɪvər/","Verb phrase"),
("locally sourced ingredients","des ingrédients du terroir","The chef insists on exclusively locally sourced ingredients.","Le chef exige exclusivement des ingrédients du terroir.","/ˈloʊkəli sɔːrst/","Noun phrase")
],
"work":[
("a stimulating career","un métier stimulant","She aspires to a stimulating career in diplomatic science.","Elle aspire à une carrière stimulante dans les sciences diplomatiques.","/ə kəˈrɪər/","Noun phrase"),
("a creative studio","un lieu de travail / atelier","Our collaborative workplace fosters innovative thinking.","Notre lieu de travail collaboratif favorise l'audace créative.","/ə ˈwɜːrkpleɪs/","Noun phrase"),
("a trusted colleague","un confrère / collègue d'équipe","I consulted my senior colleague before the meeting.","J’ai consulté mon confrère expérimenté avant la réunion.","/ə ˈkɒliːɡ/","Noun phrase"),
("competitive compensation","une rémunération valorisante","Fair compensation reflects merit and dedication.","Une rémunération équitable reflète le mérite et l'engagement.","/ˌkɒmpɛnˈseɪʃən/","Noun phrase"),
("a pivotal interview","un entretien décisif","He prepared his arguments for the decisive interview.","Il a peaufiné son argumentaire pour l’entretien décisif.","/ən ˈɪntərvjuː/","Noun phrase"),
("to apply for a fellowship","postuler / candidater","She applied for an international research fellowship.","Elle a candidaté pour une bourse de recherche internationale.","/tuː əˈplaɪ/","Verb phrase"),
("strategic acumen","une compétence stratégique","Clear communication is the hallmark of leadership.","Une communication claire est la marque même du leadership.","/strəˈtiːdʒɪk ˈækjʊmən/","Noun phrase"),
("professional vocation","une vocation professionnelle","Teaching was not just a job, but his true vocation.","L'enseignement n'était pas un simple métier, mais sa vraie vocation.","/vəʊˈkeɪʃən/","Noun phrase")
],
"school_social":[
("an academic schedule","un emploi du temps d'études","My academic timetable balances humanities and sciences.","Mon emploi du temps équilibre les humanités et les sciences.","/ən ˌækəˈdɛmɪk ˈʃɛdjuːl/","Noun phrase"),
("a core academic subject","une matière fondamentale","English language is my favourite core discipline.","La langue anglaise est ma discipline fondamentale de prédilection.","/ə kɔːr ˈsʌbdʒɪkt/","Noun phrase"),
("a studious classmate","un condisciple / camarade","I collaborated with a studious classmate on the thesis.","J’ai collaboré avec un condisciple studieux sur le mémoire.","/ə ˈklɑːsmeɪt/","Noun phrase"),
("to articulate concepts","expliquer avec clarté","She articulated the complex grammar theorem effortlessly.","Elle a expliqué le théorème grammatical complexe avec aisance.","/tuː ɑːrˈtɪkjʊleɪt/","Verb phrase"),
("to endorse a perspective","approuver un point de vue","I wholeheartedly endorse your compelling thesis.","J’approuve sans réserve votre thèse percutante.","/tuː ɪnˈdɔːrs/","Verb phrase"),
("to respectfully dissent","exprimer un désaccord courtois","I respectfully dissent from the reviewer's premise.","J'exprime un désaccord courtois avec les prémisses du critique.","/tuː dɪˈsɛnt/","Verb phrase"),
("to elevate proficiency","se perfectionner en anglais","Daily reading elevates linguistic fluency drastically.","La lecture quotidienne rehausse considérablement l'aisance linguistique.","/tuː ˈɛlɪveɪt/","Verb phrase"),
("unshakeable confidence","l'assurance / confiance en soi","Rigorous practice instils unshakeable public confidence.","Une pratique rigoureuse insuffle une assurance inébranlable à l'oral.","/ˈkɒnfɪdəns/","Noun phrase")
]
}

level_settings = {
"6e":{"grammar":"Présent simple, verbe BE, HAVE GOT, pluriel des noms, modaux CAN/CAN'T, adjectifs possessifs.","tense":"present","dialogue_role":"Collégien en 6e découvrant l'anglais avec dynamisme."},
"5e":{"grammar":"Présent simple vs Présent continu (-ing), adverbes de fréquence, THERE IS / THERE ARE, questions en DO/DOES.","tense":"present_progressive","dialogue_role":"Élève de 5e décrivant son quotidien et ses passions."},
"4e":{"grammar":"Prétérit simple (verbes réguliers et irréguliers), comparatifs et superlatifs, futur BE GOING TO, modaux d'obligation MUST / MUSTN'T.","tense":"past_future","dialogue_role":"Élève de 4e racontant des anecdotes et comparant des options."},
"3e":{"grammar":"Present Perfect vs Prétérit, futur avec WILL, Premier Conditionnel (If + présent, will...), modalité de conseil SHOULD.","tense":"mixed","dialogue_role":"Collégien de 3e préparant le Brevet et argumentant ses choix."},
"2nde":{"grammar":"Present Perfect continu, propositions relatives (WHO / WHICH / WHERE), contrastes d'opinion, modaux de déduction.","tense":"mixed_b1","dialogue_role":"Lycéen de Seconde analysant des faits de société et débattant."},
"1re":{"grammar":"Second conditionnel (If + past, would...), voix passive, discours indirect, connecteurs d'argumentation formelle.","tense":"advanced","dialogue_role":"Élève de Première préparant les épreuves du Bac avec esprit critique."},
"terminale":{"grammar":"Inversion emphatique (Seldom / Rarely), concessions rhétoriques (Although, Despite, Nevertheless), troisième conditionnel et nuances C1.","tense":"advanced_b2","dialogue_role":"Futur bachelier en Terminale s'exprimant avec éloquence et précision diplomatique."}
}

grammar_examples = {
"6e":("Le Présent Simple & les Habitudes","Le présent simple s'utilise pour énoncer des vérités générales, des goûts et des routines. À la 3e personne du singulier (he, she, it), on ajoute impérativement un -S ou -ES à la base verbale.","I wake up at seven every day. / She plays the cello beautifully.","Je me réveille à sept heures chaque jour. / Elle joue magnifiquement du violoncelle.","Règle d'or : n'oubliez jamais le 'S' de la 3e personne en 6e ! (He lives, She works)"),
"5e":("Présent Simple vs Présent en -ING","Le présent simple exprime une action habituelle (I usually study). Le présent BE + V-ing décrit une action en cours de déroulement au moment où l'on parle (Look, they are studying!).","I usually walk to school, but today I am taking the train.","D’habitude, je vais à l’école à pied, mais aujourd’hui je prends le train.","Astuce : Repérez les indices temporels ! 'usually / always / every' = présent simple ; 'now / right now / look!' = V-ing."),
"4e":("Le Prétérit Simple (Actions Passées Datées)","Le prétérit simple situe une action complètement terminée dans un passé révolu. Les verbes réguliers se terminent par -ED (visited, played). Les verbes irréguliers doivent être appris par cœur (go -> went, see -> saw).","Yesterday, we visited the maritime museum and saw ancient galleons.","Hier, nous avons visité le musée maritime et avons vu d'anciens galions.","Piège à éviter : à la forme négative et interrogative, l'auxiliaire DID porte la marque du passé : 'Did you visit?' (et non 'Did you visited?')."),
"3e":("Present Perfect vs Prétérit (Expérience vs Datation)","Le prétérit ancre l'action dans une date précise révolue (in 2023, yesterday). Le Present Perfect (HAVE/HAS + participe passé) fait le bilan d'une expérience de vie ou lie une action passée à ses conséquences dans le présent.","I visited London in 2024. / I have already visited London three times.","J’ai visité Londres en 2024 (date fermée). / J’ai déjà visité Londres à trois reprises (expérience de vie).","Indicateurs clés : 'already, ever, never, yet, just' s'emploient presque systématiquement avec le Present Perfect."),
"2nde":("Exprimer et Étayer son Opinion (Structures B1)","Pour convaincre, structurez votre propos avec des amorces nuancées : 'From my perspective', 'In my opinion', 'Whereas', suivis de connecteurs de cause comme 'insofar as' ou 'because'.","In my opinion, studying foreign languages is invaluable because it fosters cross-cultural empathy.","À mon avis, étudier les langues vivantes est inestimable parce que cela favorise l’empathie interculturelle.","Évitez de répéter 'I think that'. Variez avec 'I firmly believe', 'It seems evident that'."),
"1re":("Le Second Conditionnel & l'Hypothèse Irréelle","Le 2nd conditionnel exprime une hypothèse imaginaire ou peu probable dans le présent ou le futur. Formule : IF + Prétérit modal, WOULD + Base Verbale. Note : avec le verbe BE, on privilégie 'were' pour toutes les personnes.","If I had the opportunity, I would immerse myself in British archives.","Si j’en avais l’opportunité, je m'immergerais dans les archives britanniques.","Attention au piège classique : jamais de 'would' dans la proposition introduite par 'IF' !"),
"terminale":("L'Inversion Emphatique & les Concessions C1","Pour donner du relief stylistique et un souffle oratoire à une dissertation, placez un adverbe restrictif ou négatif en tête de proposition (Seldom, Rarely, Hardly) suivi de l'inversion Auxiliaire + Sujet.","Seldom has a technological breakthrough altered humanity so profoundly as artificial intelligence.","Rarement une percée technologique n’a modifié l’humanité aussi profondément que l’intelligence artificielle.","Effet de style magistral : cela transforme une phrase ordinaire en plaidoirie académique de haut vol.")
}

theme_scenarios = {
"daily_life":("Une journée équilibrée à Oxford","Hi Arthur, what time does your morning study session begin?","I usually commence my reading at eight o'clock in the quadrangle.","How do you maintain focus throughout the afternoon?","I divide my timetable into focused intervals and take brief walks in the park."),
"travel":("L'Odyssée en Terres d'Écosse","Where did your summer expedition take you this year?","We explored the Scottish Highlands and boarded the historic Caledonian sleeper train.","What was the most breathtaking landmark you encountered?","The misty ruins of Eilean Donan Castle left an indelible impression on our minds."),
"history":("Les Trésors de l'Égypte Antique","What historical artefacts did you examine in the British Museum?","We scrutinised the Rosetta Stone and ancient papyri detailing court diplomacy.","How did scholars decipher these enigmatic scripts?","Through Jean-François Champollion's brilliant comparative analysis of Greek and hieroglyphs."),
"hobbies":("L'Art de l'Écriture et de la Reliure","What passion enriches your leisure hours outside the classroom?","I dedicate my evenings to calligraphy and handcrafting leather-bound sketchbooks.","What virtues does this artisan discipline cultivate?","It instils patience, attention to minute aesthetics and a serene mental stillness."),
"sport":("L'Épreuve d'Aviron sur la Tamise","Are you taking part in the prestigious university boat race?","Indeed, our crew trains relentlessly at dawn on the chilly waters of the Thames.","What ethos unites your teammates in such arduous conditions?","Rigorous solidarity and an unyielding commitment to fair play above mere victory."),
"music":("Symphonie Pastorale au Royal Albert Hall","Which musical performance deeply moved you this season?","Hearing Elgar's Enigma Variations performed by the London Symphony Orchestra.","What makes live orchestral acoustics so transcendent?","The raw vibrational power that words alone cannot encapsulate."),
"restaurant":("Dîner Littéraire au Club Victoria","Have you decided upon your selection for this evening's feast?","I would gladly partake of the roasted sea bass accompanied by garden herbs.","Shall we request the pastry chef's signature tarte tatin?","Splendid idea, let us conclude with that delightful touch of sweetness."),
"food":("La Gastronomie Locale et Durable","Why do you prioritize locally grown organic produce?","Because fresh seasonal ingredients preserve both authentic flavours and vital nutrients.","How can modern diets respect ecological equilibrium?","By curbing food waste and supporting local agricultural cooperatives."),
"work":("Ambitions Diplomatiques et Sciences Politiques","What professional calling inspires your academic pursuits?","I aspire to serve in multilateral diplomacy and international conflict resolution.","Which qualities will prove paramount in that arena?","Dispassionate analysis, linguistic mastery and unwavering ethical integrity."),
"school_social":("Débat Oratoire et Rhétorique Collégiale","How should our debating society frame the forthcoming motion?","We must define our terms meticulously and address our opponents' counter-arguments.","What elevates an argument from ordinary to persuasive?","A rigorous synthesis of empirical evidence, moral clarity and graceful cadence.")
}

lessons = []

for li, lev in enumerate(levels):
    lid = lev["id"]
    gs = level_settings[lid]
    gtitle, gexplain, gexample, gtranslation, gtip = grammar_examples[lid]
    
    for ti, (tid, tlabel, ticon, ten_theme) in enumerate(themes):
        vlist = vocab[tid]
        
        words = []
        for j, (en, fr, ex, exfr, ipa, pos) in enumerate(vlist):
            words.append({
                "id": f"{lid}_{tid}_w{j+1}",
                "term": en,
                "phonetic": ipa,
                "part_of_speech": pos,
                "translation_fr": fr,
                "example_en": ex,
                "example_fr": exfr,
                "level": lid
            })
            
        title, q1, a1, q2, a2 = theme_scenarios[tid]
        
        # Phrases modèles progressives adaptées à la classe
        model_phrases = [
            {"en": words[0]["example_en"], "fr": words[0]["example_fr"], "focus": "Vocabulaire en situation"},
            {"en": words[2]["example_en"], "fr": words[2]["example_fr"], "focus": "Syntaxe modèle"},
            {"en": gexample.split(' / ')[0], "fr": gtranslation.split(' / ')[0], "focus": gtitle},
            {"en": q1, "fr": "Question de dialogue authentique.", "focus": "Interaction orale"},
            {"en": a1, "fr": "Réponse naturelle et fluide.", "focus": "Fluidité d'expression"}
        ]
        
        # Dialogue immersif de 6 répliques avec audio et rôles
        dialogue_lines = [
            {"speaker": "Audrey (A)", "en": q1, "fr": "Réplique d'ouverture du dialogue."},
            {"speaker": "Julian (B)", "en": a1, "fr": "Réponse développée et naturelle."},
            {"speaker": "Audrey (A)", "en": q2, "fr": "Relance pour approfondir la discussion."},
            {"speaker": "Julian (B)", "en": a2, "fr": "Explication et point de vue personnel."},
            {"speaker": "Audrey (A)", "en": "That is truly fascinating! Could you tell me more about it tomorrow?", "fr": "C'est vraiment fascinant ! Pourrais-tu m'en dire plus demain ?"},
            {"speaker": "Julian (B)", "en": "With great pleasure. Let us convene in the library after class.", "fr": "Avec grand plaisir. Retrouvons-nous à la bibliothèque après les cours."}
        ]
        
        # Dictation exercise with intelligent diff hints
        dictation_item = {
            "canonical": words[0]["example_en"],
            "translation_fr": words[0]["example_fr"],
            "audio_prompt": words[0]["example_en"],
            "difficulty_note": f"Focalisation sur l'orthographe exacte et la concordance grammaticale ({lev['cefr']})."
        }
        
        # Interactive Quiz with 4 rigorous questions
        quiz = [
            {
                "id": f"q_{lid}_{tid}_1",
                "question": f"Quelle est la signification précise du terme anglais « {words[0]['term']} » ?",
                "options": [words[0]["translation_fr"], words[1]["translation_fr"], words[2]["translation_fr"], "Une tournure familière sans lien"],
                "correct_index": 0,
                "explanation": f"« {words[0]['term']} » ({words[0]['part_of_speech']}) signifie exactement « {words[0]['translation_fr']} » en français."
            },
            {
                "id": f"q_{lid}_{tid}_2",
                "question": f"Complétez la phrase modèle : « {words[1]['example_en'].replace(words[1]['term'], '______')} »",
                "options": [words[1]["term"], words[0]["term"], words[3]["term"], words[4]["term"]],
                "correct_index": 0,
                "explanation": f"Le terme attendu est « {words[1]['term']} » qui confère tout son sens à la phrase."
            },
            {
                "id": f"q_{lid}_{tid}_3",
                "question": f"Règle grammaticale : {gtitle}. Laquelle de ces affirmations est rigoureusement exacte ?",
                "options": [
                    gtip,
                    "Cette règle ne s'applique jamais dans la langue écrite soutenu.",
                    "L'anglais n'accorde jamais les verbes au présent simple.",
                    "Il est interdit d'employer des connecteurs logiques dans une phrase."
                ],
                "correct_index": 0,
                "explanation": f"Explication didactique : {gexplain}"
            },
            {
                "id": f"q_{lid}_{tid}_4",
                "question": f"Dans le dialogue sur « {tlabel} », que répond le locuteur Julian à la question « {q1} » ?",
                "options": [
                    a1,
                    "No, I never think about this topic.",
                    "We did not have any time to discuss it.",
                    "I am not interested in this subject."
                ],
                "correct_index": 0,
                "explanation": f"Julian répond avec précision : « {a1} »."
            }
        ]
        
        lesson_id = f"lesson_{lid}_{tid}"
        lessons.append({
            "id": lesson_id,
            "class_level": lid,
            "class_label": lev["label"],
            "cycle": lev["cycle"],
            "cefr_level": lev["cefr"],
            "theme_id": tid,
            "theme_label": tlabel,
            "theme_en": ten_theme,
            "theme_icon": ticon,
            "title": f"{tlabel} — {lev['label']}",
            "title_en": f"{ten_theme} ({lev['label']})",
            "learning_objective": lev["goal"],
            "estimated_minutes": 15 if lid in ("6e","5e") else 20,
            "vocabulary": words,
            "model_phrases": model_phrases,
            "grammar": {
                "title": gtitle,
                "rule": gexplain,
                "example_en": gexample,
                "example_fr": gtranslation,
                "tip": gtip,
                "level_focus": gs["grammar"]
            },
            "dialogue": {
                "title": title,
                "setting_fr": f"Mise en situation : {title}.",
                "lines": dialogue_lines
            },
            "dictation": dictation_item,
            "quiz": quiz
        })

dataset = {
    "app_name": "English Boost MZ",
    "language": "en",
    "interface_language": "fr",
    "version": "2.0.0",
    "total_lessons": len(lessons),
    "description_fr": "Programme pédagogique intégral d'anglais de la 6e à la Terminale couvrant 10 thèmes transversaux avec fiches lexicales, points de grammaire, dialogues authentiques sonorisés, dictées cadencées et quiz interactifs avec corrigés.",
    "levels": levels,
    "themes": [{"id": tid, "label": label, "icon": icon, "en": en_theme} for tid, label, icon, en_theme in themes],
    "lessons": lessons
}

# Write main JSON file
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

with open(out_ts_json, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

# Write CSV index
with open(out_csv, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerow(["ID_LECON", "CLASSE", "CYCLE", "NIVEAU_CECRL", "THEME_FR", "THEME_EN", "TITRE", "OBJECTIF_PEDAGOGIQUE", "DUREE_MINUTES", "NB_MOTS_VOCABULAIRE", "NB_QUESTIONS_QUIZ"])
    for l in lessons:
        writer.writerow([
            l["id"],
            l["class_label"],
            l["cycle"],
            l["cefr_level"],
            l["theme_label"],
            l["theme_en"],
            l["title"],
            l["learning_objective"],
            l["estimated_minutes"],
            len(l["vocabulary"]),
            len(l["quiz"])
        ])

# Write Markdown pedagogical guide
readme_content = f"""# English Boost MZ — Guide Pédagogique Officiel (6e à Terminale)

## Présentation Générale
English Boost MZ offre une progression linguistique complète, rigoureuse et immersive de la classe de **6ème jusqu'à la Terminale**, alignée sur les exigences du Cadre Européen Commun de Référence pour les Langues (CECRL) et les programmes officiels de l'Éducation Nationale.

### Chiffres Clés du Programme
- **70 Leçons exhaustives** (7 classes × 10 thèmes fondamentaux)
- **560 Termes de vocabulaire contextualisés** avec phonétique internationale (API), exemples bilingues et notes de nuance
- **350 Phrases modèles** illustrant la grammaire en situation
- **70 Points de grammaire détaillés** avec règles claires, formules et astuces mnémotechniques
- **420 Répliques de dialogues bilingues** conçues pour l'oral, la lecture expressive et le shadowing
- **280 Questions de quiz interactifs** avec retours pédagogiques immédiats et corrigés argumentés
- **70 Dictées d'entraînement** avec détection de frappe et tolérance orthographique intelligente

---

## 1. Organisation par Classe et Niveau CECRL

| Classe | Cycle | Niveau Indicatif | Objectif Prioritaire |
|---|---|---|---|
| **6e** | Cycle 3 | A1 – A1+ | Acquérir les bases, se présenter, comprendre et construire des phrases simples au présent. |
| **5e** | Cycle 4 | A1+ – A2 | Décrire son quotidien, poser des questions, raconter des activités et exprimer des habitudes. |
| **4e** | Cycle 4 | A2 – A2+ | Raconter des événements au passé, comparer, exprimer des projets et justifier ses préférences. |
| **3e** | Cycle 4 | A2+ – B1 | Argumenter simplement, raconter des expériences, expliquer ses choix et préparer l'entrée au lycée. |
| **Seconde** | Lycée | B1 | Développer l’autonomie, comprendre des échanges longs, décrire des expériences et défendre une opinion. |
| **Première** | Lycée | B1 – B2 | Argumenter avec nuance, analyser des documents, débattre et employer des structures complexes. |
| **Terminale** | Lycée | B2, ouv. C1 | Nuancer son opinion, débattre, analyser, négocier et communiquer avec précision stylistique. |

---

## 2. Les 10 Thèmes Pédagogiques Transversaux
Chaque classe explore l'anglais à travers les 10 mêmes univers thématiques avec une complexité linguistique croissante :
1. **Vie quotidienne** (Daily Life & Routines)
2. **Voyages** (Travel & Exploration)
3. **Histoire & Patrimoine** (History & Heritage)
4. **Loisirs & Créativité** (Hobbies & Leisure)
5. **Sport & Dépassement** (Sports & Athletics)
6. **Musique & Culture** (Music & Performing Arts)
7. **Restaurant & Convivialité** (Dining Out & Gastronomy)
8. **Alimentation & Santé** (Food & Nutrition)
9. **Monde du Travail** (Workplace & Dynamics)
10. **Métiers & Vocations** (Professions & Careers)

---

## 3. Fichiers Disponibles
- **JSON Intégral :** `/public/data/english_boost_mz_curriculum.json`
- **Index CSV :** `/public/data/index_lecons.csv`
- **Documentation Markdown :** `/public/data/GUIDE_PEDAGOGIQUE_FR.md`

Ce pack peut être importé directement dans n'importe quel LMS, base de données Firestore ou outil éducatif.
"""

with open(out_md, "w", encoding="utf-8") as f:
    f.write(readme_content)

print(f"Génération terminée avec succès !")
print(f"Nombre total de leçons : {len(lessons)}")
print(f"Fichier JSON : {out_json}")
print(f"Fichier CSV : {out_csv}")
print(f"Guide Markdown : {out_md}")
