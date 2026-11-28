import type {
  CEFRLevel,
  SmartMemoryDifficulty,
  SmartMemoryItemType
} from '../firebase/types';
import { SPACED_REPETITION_500 } from './spacedRepetition500';
import { DIALOGUE_SM2_CARDS } from './atelierDialogues500';
import { GRAMMAR_6E_ITEMS } from './grammar6eData';

export interface SmartMemoryCatalogItem {
  itemId: string;
  normalizedKey: string;
  itemType: SmartMemoryItemType;
  english: string;
  french: string;
  pronunciation: string;
  exampleSentence: string;
  clozeTarget: string;
  cefrLevel: CEFRLevel;
  topic: string;
  difficulty: SmartMemoryDifficulty;
  grammarRule?: string;
}

function sanitizeFirestoreId(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120);
}

function normalizeTermKey(english: string): string {
  return english.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCefr(lvl: string): CEFRLevel {
  if (lvl.startsWith('A1')) return 'A1';
  if (lvl.startsWith('A2')) return 'A2';
  if (lvl.startsWith('B1')) return 'B1';
  if (lvl.startsWith('B2')) return 'B2';
  if (lvl.startsWith('C1')) return 'C1';
  if (lvl.startsWith('C2')) return 'C2';
  return 'B1';
}

function inferDifficultyFromCefr(level: CEFRLevel): SmartMemoryDifficulty {
  if (level === 'A1' || level === 'A2') return 'easy';
  if (level === 'B1' || level === 'B2') return 'medium';
  return 'hard';
}

function extractClozeTarget(sentence: string, fallbackWord: string): string {
  const cleanFallback = fallbackWord.trim().split('/')[0].trim();
  const escaped = cleanFallback.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (escaped && new RegExp(`\\b${escaped}\\b`, 'i').test(sentence)) {
    const match = sentence.match(new RegExp(`\\b${escaped}\\b`, 'i'));
    if (match?.[0]) return match[0];
  }
  const words = sentence
    .replace(/[.,!?;:"'()«»—]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  if (words.length > 0) {
    return words.sort((a, b) => b.length - a.length)[0];
  }
  return cleanFallback || 'English';
}

interface CuratedGrammarSeed {
  id: string;
  english: string;
  french: string;
  pronunciation: string;
  exampleSentence: string;
  clozeTarget: string;
  cefrLevel: CEFRLevel;
  topic: string;
  difficulty: SmartMemoryDifficulty;
  grammarRule: string;
}

const CURATED_GRAMMAR_A2_C2: CuratedGrammarSeed[] = [
  {
    id: 'gram_a2_past_simple_vs_cont',
    english: 'Past Continuous + Past Simple (Interruption)',
    french: 'Action en cours interrompue : was/were + -ing ... when + prétérit',
    pronunciation: '/wɒz/ /wɜː/ + V-ɪŋ',
    exampleSentence: 'I was reading an editorial when the phone rang.',
    clozeTarget: 'was reading',
    cefrLevel: 'A2',
    topic: 'Temps du Passé',
    difficulty: 'easy',
    grammarRule: 'Le Past Continuous (was/were + -ing) décrit une action longue en cours ; le Past Simple exprime l’événement bref qui l’interrompt.'
  },
  {
    id: 'gram_a2_comparatives_superlatives',
    english: 'Irregular Comparatives (good -> better -> best)',
    french: 'Comparatifs et superlatifs irréguliers : good/better/the best, bad/worse/the worst',
    pronunciation: '/ˈbet.ər/ · /wɜːs/',
    exampleSentence: 'Her pronunciation is much better than last term.',
    clozeTarget: 'better',
    cefrLevel: 'A2',
    topic: 'Comparaison',
    difficulty: 'easy',
    grammarRule: 'N’utilisez jamais "more better" ou "more worse" : ces adjectifs changent complètement de radical.'
  },
  {
    id: 'gram_a2_much_many_quantifiers',
    english: 'Countable vs Uncountable (many / much / a lot of)',
    french: 'Quantificateurs : many (+ dénombrables pluriel) vs much (+ indénombrables)',
    pronunciation: '/ˈmen.i/ vs /mʌtʃ/',
    exampleSentence: 'We do not have much time before the train departs.',
    clozeTarget: 'much',
    cefrLevel: 'A2',
    topic: 'Quantificateurs',
    difficulty: 'easy',
    grammarRule: 'Information, advice, luggage, time et money sont indénombrables en anglais : utilisez much ou a little.'
  },
  {
    id: 'gram_b1_present_perfect_since_for',
    english: 'Present Perfect with Since & For',
    french: 'Action passée toujours vraie au présent : have/has + participe passé (since/for)',
    pronunciation: '/hæv/ + PP · /sɪns/ /fɔː/',
    exampleSentence: 'She has lived in Edinburgh for six years.',
    clozeTarget: 'has lived',
    cefrLevel: 'B1',
    topic: 'Present Perfect',
    difficulty: 'medium',
    grammarRule: '"For" mesure une durée (for six years) tandis que "since" indique le point de départ exact (since 2020).'
  },
  {
    id: 'gram_b1_first_conditional',
    english: 'First Conditional (If + Present, will + Verb)',
    french: 'Condition probable au futur : pas de "will" après "if"',
    pronunciation: '/ɪf/ + V · /wɪl/',
    exampleSentence: 'If you practise every morning, your fluency will improve rapidly.',
    clozeTarget: 'will improve',
    cefrLevel: 'B1',
    topic: 'Conditionnels',
    difficulty: 'medium',
    grammarRule: 'En anglais, la proposition introduite par if, when ou as soon as reste au présent même pour exprimer un futur.'
  },
  {
    id: 'gram_b1_second_conditional',
    english: 'Second Conditional (If + Past Simple, would + Verb)',
    french: 'Hypothèse irréelle au présent : If I were you, I would...',
    pronunciation: '/wʊd/ + base',
    exampleSentence: 'If I spoke Japanese fluently, I would work in Kyoto.',
    clozeTarget: 'would work',
    cefrLevel: 'B1',
    topic: 'Conditionnels',
    difficulty: 'medium',
    grammarRule: 'Avec le verbe be au second conditionnel soutenu, on privilégie "If I were" pour toutes les personnes.'
  },
  {
    id: 'gram_b1_passive_voice',
    english: 'Passive Voice (be + Past Participle + by)',
    french: 'Voix passive : focalisation sur l’objet avec be conjugué + participe passé',
    pronunciation: '/biː/ + V-ed/en',
    exampleSentence: 'This historical treaty was signed in 1944.',
    clozeTarget: 'was signed',
    cefrLevel: 'B1',
    topic: 'Voix Passive',
    difficulty: 'medium',
    grammarRule: 'Conjuguez uniquement l’auxiliaire BE au temps voulu, puis ajoutez le participe passé invariable.'
  },
  {
    id: 'gram_b2_third_conditional',
    english: 'Third Conditional (If + Past Perfect, would have + PP)',
    french: 'Regret ou hypothèse irréelle dans le passé',
    pronunciation: '/wʊd hæv/ + PP',
    exampleSentence: 'If they had prepared earlier, they would have won the debate.',
    clozeTarget: 'would have won',
    cefrLevel: 'B2',
    topic: 'Conditionnels Avancés',
    difficulty: 'medium',
    grammarRule: 'Exprime un scénario passé qui ne s’est pas produit : if + had + PP, would have + PP.'
  },
  {
    id: 'gram_b2_modals_past_deduction',
    english: 'Past Modals of Deduction (must have / might have / can’t have)',
    french: 'Déduction sur le passé : certitude (must have) ou impossibilité (can’t have)',
    pronunciation: '/mʌst hæv/ · /kɑːnt hæv/',
    exampleSentence: 'She speaks with a flawless Oxford accent; she must have studied there.',
    clozeTarget: 'must have',
    cefrLevel: 'B2',
    topic: 'Modalité',
    difficulty: 'medium',
    grammarRule: 'Pour une certitude logique passée on emploie must have + participe passé ; pour une impossibilité logique, can’t have + PP.'
  },
  {
    id: 'gram_b2_reported_speech',
    english: 'Reported Speech Backshift',
    french: 'Discours indirect : concordance des temps vers le passé',
    pronunciation: '/sed ðæt/',
    exampleSentence: 'The director explained that the report would be published on Friday.',
    clozeTarget: 'would be',
    cefrLevel: 'B2',
    topic: 'Discours Indirect',
    difficulty: 'medium',
    grammarRule: 'Après un verbe introducteur au passé (said, told, explained), present -> past, will -> would, can -> could.'
  },
  {
    id: 'gram_c1_negative_inversion',
    english: 'Negative Inversion (Seldom / Not only / Never have I)',
    french: 'Inversion stylistique après un adverbe restrictif en tête de phrase',
    pronunciation: '/ˈnev.ər hæv aɪ/',
    exampleSentence: 'Never have I witnessed such remarkable rhetorical precision.',
    clozeTarget: 'have I witnessed',
    cefrLevel: 'C1',
    topic: 'Rhétorique & Inversion',
    difficulty: 'hard',
    grammarRule: 'Lorsqu’un adverbe négatif ou restrictif (Never, Seldom, Rarely, Not only, Little) ouvre la phrase, on inverse auxiliaire + sujet.'
  },
  {
    id: 'gram_c1_subjunctive_mandative',
    english: 'Mandative Subjunctive (insist/suggest + that + Subject + Bare Infinitive)',
    french: 'Subjonctif anglais après verbes d’exigence ou de recommandation',
    pronunciation: '/ɪnˈsɪst ðæt/',
    exampleSentence: 'The committee recommended that the candidate submit a revised draft.',
    clozeTarget: 'submit',
    cefrLevel: 'C1',
    topic: 'Subjonctif & Style',
    difficulty: 'hard',
    grammarRule: 'En anglais formel après suggest, insist, demand, recommend ou it is essential that, le verbe reste à la base verbale sans -s à la 3e personne.'
  },
  {
    id: 'gram_c2_cleft_sentences',
    english: 'It-Cleft & Wh-Cleft Emphasis',
    french: 'Phrase clivée pour mettre un constituant en relief rhétorique',
    pronunciation: '/ɪt wɒz ... ðæt/',
    exampleSentence: 'What distinguishes a great orator is measured restraint under pressure.',
    clozeTarget: 'What distinguishes',
    cefrLevel: 'C2',
    topic: 'Orfèvrerie Syntaxique',
    difficulty: 'hard',
    grammarRule: 'Les structures en "It is X that..." ou "What + S + V + is..." focalisent l’attention du lecteur sur l’argument central.'
  },
  {
    id: 'gram_c2_participle_clauses',
    english: 'Perfect Participle Clauses (Having + Past Participle)',
    french: 'Proposition participiale exprimant l’antériorité causale ou temporelle',
    pronunciation: '/ˈhæv.ɪŋ/ + PP',
    exampleSentence: 'Having mastered the foundational idioms, she tackled classical essays.',
    clozeTarget: 'Having mastered',
    cefrLevel: 'C2',
    topic: 'Syntaxe Avancée',
    difficulty: 'hard',
    grammarRule: 'Having + participe passé indique une action achevée avant l’action principale ; les deux propositions doivent partager le même sujet.'
  }
];

interface IrregularVerbSeed {
  id: string;
  base: string;
  past: string;
  participle: string;
  french: string;
  pronunciation: string;
  exampleSentence: string;
  clozeTarget: string;
  cefrLevel: CEFRLevel;
  difficulty: SmartMemoryDifficulty;
  tip: string;
}

const IRREGULAR_VERBS_SEED: IrregularVerbSeed[] = [
  {
    id: 'verb_be',
    base: 'be',
    past: 'was / were',
    participle: 'been',
    french: 'être (be / was-were / been)',
    pronunciation: '/biː/ · /wɒz/ · /biːn/',
    exampleSentence: 'She has been at the library since nine o’clock.',
    clozeTarget: 'been',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Seul verbe anglais possédant deux formes au prétérit : was (I/he/she/it) et were (you/we/they).'
  },
  {
    id: 'verb_go',
    base: 'go',
    past: 'went',
    participle: 'gone',
    french: 'aller (go / went / gone)',
    pronunciation: '/ɡəʊ/ · /went/ · /ɡɒn/',
    exampleSentence: 'Last summer we went to Edinburgh by train.',
    clozeTarget: 'went',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Prétérit totalement irrégulier (went). Utilisez "has been to" si la personne est déjà revenue.'
  },
  {
    id: 'verb_have',
    base: 'have',
    past: 'had',
    participle: 'had',
    french: 'avoir (have / had / had)',
    pronunciation: '/hæv/ · /hæd/ · /hæd/',
    exampleSentence: 'They had a lively discussion about British cinema.',
    clozeTarget: 'had',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Formes identiques au prétérit et au participe passé : had.'
  },
  {
    id: 'verb_do',
    base: 'do',
    past: 'did',
    participle: 'done',
    french: 'faire (do / did / done)',
    pronunciation: '/duː/ · /dɪd/ · /dʌn/',
    exampleSentence: 'Have you done all your vocabulary exercises yet?',
    clozeTarget: 'done',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'À ne pas confondre avec "make" (fabriquer/créer) ; "do" sert aux tâches et activités.'
  },
  {
    id: 'verb_say',
    base: 'say',
    past: 'said',
    participle: 'said',
    french: 'dire (say / said / said)',
    pronunciation: '/seɪ/ · /sed/ · /sed/',
    exampleSentence: 'He said that clarity matters more than speed.',
    clozeTarget: 'said',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Attention à la prononciation de "said" : voyelle brève /sed/, jamais /seɪd/.'
  },
  {
    id: 'verb_see',
    base: 'see',
    past: 'saw',
    participle: 'seen',
    french: 'voir (see / saw / seen)',
    pronunciation: '/siː/ · /sɔː/ · /siːn/',
    exampleSentence: 'We saw a remarkable play at the Globe Theatre.',
    clozeTarget: 'saw',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Voyelle longue /sɔː/ au prétérit ; participe passé "seen".'
  },
  {
    id: 'verb_take',
    base: 'take',
    past: 'took',
    participle: 'taken',
    french: 'prendre (take / took / taken)',
    pronunciation: '/teɪk/ · /tʊk/ · /ˈteɪ.kən/',
    exampleSentence: 'She took careful notes during the lecture.',
    clozeTarget: 'took',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Voyelle courte /ʊ/ dans took (comme book).'
  },
  {
    id: 'verb_give',
    base: 'give',
    past: 'gave',
    participle: 'given',
    french: 'donner (give / gave / given)',
    pronunciation: '/ɡɪv/ · /ɡeɪv/ · /ˈɡɪv.ən/',
    exampleSentence: 'The tutor gave us three targeted recommendations.',
    clozeTarget: 'gave',
    cefrLevel: 'A1',
    difficulty: 'easy',
    tip: 'Modèle i -> a -> i+en.'
  },
  {
    id: 'verb_write',
    base: 'write',
    past: 'wrote',
    participle: 'written',
    french: 'écrire (write / wrote / written)',
    pronunciation: '/raɪt/ · /rəʊt/ · /ˈrɪt.ən/',
    exampleSentence: 'The essay was written with extraordinary elegance.',
    clozeTarget: 'written',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Double "t" au participe passé "written", et "w" initial toujours muet.'
  },
  {
    id: 'verb_speak',
    base: 'speak',
    past: 'spoke',
    participle: 'spoken',
    french: 'parler (speak / spoke / spoken)',
    pronunciation: '/spiːk/ · /spəʊk/ · /ˈspəʊ.kən/',
    exampleSentence: 'Have you ever spoken to a native speaker in London?',
    clozeTarget: 'spoken',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Même schéma que break/broke/broken et choose/chose/chosen.'
  },
  {
    id: 'verb_know',
    base: 'know',
    past: 'knew',
    participle: 'known',
    french: 'savoir, connaître (know / knew / known)',
    pronunciation: '/nəʊ/ · /njuː/ · /nəʊn/',
    exampleSentence: 'I have known him since my first year at university.',
    clozeTarget: 'known',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Le "k" initial est muet ; "knew" rime avec "new".'
  },
  {
    id: 'verb_think',
    base: 'think',
    past: 'thought',
    participle: 'thought',
    french: 'penser (think / thought / thought)',
    pronunciation: '/θɪŋk/ · /θɔːt/ · /θɔːt/',
    exampleSentence: 'We thought the dictation was surprisingly clear.',
    clozeTarget: 'thought',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Ne confondez pas thought (/θɔːt/, think) avec taught (/tɔːt/, teach).'
  },
  {
    id: 'verb_teach',
    base: 'teach',
    past: 'taught',
    participle: 'taught',
    french: 'enseigner (teach / taught / taught)',
    pronunciation: '/tiːtʃ/ · /tɔːt/ · /tɔːt/',
    exampleSentence: 'Professor Vance taught classical rhetoric for twenty years.',
    clozeTarget: 'taught',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Orthographe en -aught (comme catch -> caught).'
  },
  {
    id: 'verb_buy',
    base: 'buy',
    past: 'bought',
    participle: 'bought',
    french: 'acheter (buy / bought / bought)',
    pronunciation: '/baɪ/ · /bɔːt/ · /bɔːt/',
    exampleSentence: 'She bought a vintage fountain pen in Oxford.',
    clozeTarget: 'bought',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Attention : bought (acheter, avec b) vs brought (apporter, avec br).'
  },
  {
    id: 'verb_bring',
    base: 'bring',
    past: 'brought',
    participle: 'brought',
    french: 'apporter (bring / brought / brought)',
    pronunciation: '/brɪŋ/ · /brɔːt/ · /brɔːt/',
    exampleSentence: 'The reform brought greater transparency to the institution.',
    clozeTarget: 'brought',
    cefrLevel: 'A2',
    difficulty: 'easy',
    tip: 'Conserve le "r" de bring dans brought.'
  },
  {
    id: 'verb_choose',
    base: 'choose',
    past: 'chose',
    participle: 'chosen',
    french: 'choisir (choose / chose / chosen)',
    pronunciation: '/tʃuːz/ · /tʃəʊz/ · /ˈtʃəʊ.zən/',
    exampleSentence: 'They chose the most nuanced phrasing for the letter.',
    clozeTarget: 'chose',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Double "o" à l’infinitif (choose), un seul "o" au prétérit (chose).'
  },
  {
    id: 'verb_begin',
    base: 'begin',
    past: 'began',
    participle: 'begun',
    french: 'commencer (begin / began / begun)',
    pronunciation: '/bɪˈɡɪn/ · /bɪˈɡæn/ · /bɪˈɡʌn/',
    exampleSentence: 'The ceremony began promptly at eight o’clock.',
    clozeTarget: 'began',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Schéma vocalique classique i -> a -> u (drink/drank/drunk, sing/sang/sung).'
  },
  {
    id: 'verb_fall',
    base: 'fall',
    past: 'fell',
    participle: 'fallen',
    french: 'tomber (fall / fell / fallen)',
    pronunciation: '/fɔːl/ · /fel/ · /ˈfɔː.lən/',
    exampleSentence: 'Autumn leaves had fallen across the courtyard.',
    clozeTarget: 'fallen',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Ne pas confondre avec feel / felt / felt (ressentir).'
  },
  {
    id: 'verb_feel',
    base: 'feel',
    past: 'felt',
    participle: 'felt',
    french: 'ressentir, se sentir (feel / felt / felt)',
    pronunciation: '/fiːl/ · /felt/ · /felt/',
    exampleSentence: 'Students felt more confident after the oral rehearsal.',
    clozeTarget: 'felt',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Voyelle courte /e/ dans felt.'
  },
  {
    id: 'verb_forget',
    base: 'forget',
    past: 'forgot',
    participle: 'forgotten',
    french: 'oublier (forget / forgot / forgotten)',
    pronunciation: '/fəˈɡet/ · /fəˈɡɒt/ · /fəˈɡɒt.ən/',
    exampleSentence: 'I have never forgotten that piece of advice.',
    clozeTarget: 'forgotten',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Double "t" devant -en dans forgotten.'
  },
  {
    id: 'verb_grow',
    base: 'grow',
    past: 'grew',
    participle: 'grown',
    french: 'grandir, croître (grow / grew / grown)',
    pronunciation: '/ɡrəʊ/ · /ɡruː/ · /ɡrəʊn/',
    exampleSentence: 'Public interest in acoustic phonetics has grown steadily.',
    clozeTarget: 'grown',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Même famille que know/knew/known et throw/threw/thrown.'
  },
  {
    id: 'verb_keep',
    base: 'keep',
    past: 'kept',
    participle: 'kept',
    french: 'garder, continuer à (keep / kept / kept)',
    pronunciation: '/kiːp/ · /kept/ · /kept/',
    exampleSentence: 'She kept a daily journal of idiomatic expressions.',
    clozeTarget: 'kept',
    cefrLevel: 'B1',
    difficulty: 'medium',
    tip: 'Schéma sleep/slept, sweep/swept, weep/wept.'
  },
  {
    id: 'verb_rise',
    base: 'rise',
    past: 'rose',
    participle: 'risen',
    french: 's’élever, augmenter (rise / rose / risen)',
    pronunciation: '/raɪz/ · /rəʊz/ · /ˈrɪz.ən/',
    exampleSentence: 'Sea levels have risen measurably over the past century.',
    clozeTarget: 'risen',
    cefrLevel: 'B2',
    difficulty: 'medium',
    tip: 'Verbe intransitif (sans COD), à distinguer du régulier "raise" (lever quelque chose).'
  },
  {
    id: 'verb_seek',
    base: 'seek',
    past: 'sought',
    participle: 'sought',
    french: 'rechercher, solliciter (seek / sought / sought)',
    pronunciation: '/siːk/ · /sɔːt/ · /sɔːt/',
    exampleSentence: 'The envoy sought an immediate diplomatic compromise.',
    clozeTarget: 'sought',
    cefrLevel: 'B2',
    difficulty: 'medium',
    tip: 'Rime avec bought et brought ; très fréquent dans la presse économique.'
  },
  {
    id: 'verb_strike',
    base: 'strike',
    past: 'struck',
    participle: 'struck',
    french: 'frapper, faire grève (strike / struck / struck)',
    pronunciation: '/straɪk/ · /strʌk/ · /strʌk/',
    exampleSentence: 'Her calm authority struck everyone in the conference hall.',
    clozeTarget: 'struck',
    cefrLevel: 'B2',
    difficulty: 'medium',
    tip: 'Le participe passé adjectival "stricken" survit dans des expressions comme "poverty-stricken".'
  },
  {
    id: 'verb_swear',
    base: 'swear',
    past: 'swore',
    participle: 'sworn',
    french: 'jurer, prêter serment (swear / swore / sworn)',
    pronunciation: '/sweər/ · /swɔːr/ · /swɔːn/',
    exampleSentence: 'Witnesses swore to tell the whole truth before the court.',
    clozeTarget: 'sworn',
    cefrLevel: 'B2',
    difficulty: 'hard',
    tip: 'Même modèle que wear/wore/worn et tear/tore/torn.'
  },
  {
    id: 'verb_withdraw',
    base: 'withdraw',
    past: 'withdrew',
    participle: 'withdrawn',
    french: 'retirer, se retirer (withdraw / withdrew / withdrawn)',
    pronunciation: '/wɪðˈdrɔː/ · /wɪðˈdruː/ · /wɪðˈdrɔːn/',
    exampleSentence: 'The delegate withdrew his objection after reading the clause.',
    clozeTarget: 'withdrew',
    cefrLevel: 'B2',
    difficulty: 'hard',
    tip: 'Suit exactement le composé de draw / drew / drawn.'
  },
  {
    id: 'verb_arise',
    base: 'arise',
    past: 'arose',
    participle: 'arisen',
    french: 'survenir, se présenter (arise / arose / arisen)',
    pronunciation: '/əˈraɪz/ · /əˈrəʊz/ · /əˈrɪz.ən/',
    exampleSentence: 'An unexpected ambiguity arose during the treaty negotiations.',
    clozeTarget: 'arose',
    cefrLevel: 'C1',
    difficulty: 'hard',
    tip: 'Toujours intransitif (an issue arose) ; ne jamais l’utiliser avec un COD.'
  },
  {
    id: 'verb_bear',
    base: 'bear',
    past: 'bore',
    participle: 'borne',
    french: 'supporter, porter, assumer (bear / bore / borne)',
    pronunciation: '/beər/ · /bɔːr/ · /bɔːn/',
    exampleSentence: 'They bore the responsibility with remarkable dignity.',
    clozeTarget: 'bore',
    cefrLevel: 'C1',
    difficulty: 'hard',
    tip: 'Orthographe "borne" avec un "e" final pour "porter/supporter" (ex: airborne).'
  },
  {
    id: 'verb_forbid',
    base: 'forbid',
    past: 'forbade',
    participle: 'forbidden',
    french: 'interdire (forbid / forbade / forbidden)',
    pronunciation: '/fəˈbɪd/ · /fəˈbæd/ · /fəˈbɪd.ən/',
    exampleSentence: 'University regulations strictly forbade unauthorised recordings.',
    clozeTarget: 'forbade',
    cefrLevel: 'C1',
    difficulty: 'hard',
    tip: 'Le prétérit "forbade" se prononce /fəˈbæd/ ou /fəˈbeɪd/.'
  },
  {
    id: 'verb_shrink',
    base: 'shrink',
    past: 'shrank',
    participle: 'shrunk',
    french: 'rétrécir, diminuer (shrink / shrank / shrunk)',
    pronunciation: '/ʃrɪŋk/ · /ʃræŋk/ · /ʃrʌŋk/',
    exampleSentence: 'Profit margins shrank considerably during the third quarter.',
    clozeTarget: 'shrank',
    cefrLevel: 'C1',
    difficulty: 'hard',
    tip: 'Schéma i -> a -> u identique à sink/sank/sunk.'
  },
  {
    id: 'verb_strive',
    base: 'strive',
    past: 'strove',
    participle: 'striven',
    french: 's’efforcer, tendre vers (strive / strove / striven)',
    pronunciation: '/straɪv/ · /strəʊv/ · /ˈstrɪv.ən/',
    exampleSentence: 'Scholars have always striven for utmost clarity of expression.',
    clozeTarget: 'striven',
    cefrLevel: 'C2',
    difficulty: 'hard',
    tip: 'Registre soutenu suivi de "for + nom" ou "to + infinitif".'
  },
  {
    id: 'verb_beseech',
    base: 'beseech',
    past: 'besought',
    participle: 'besought',
    french: 'supplier, implorer (beseech / besought / besought)',
    pronunciation: '/bɪˈsiːtʃ/ · /bɪˈsɔːt/ · /bɪˈsɔːt/',
    exampleSentence: 'The petitioners besought the parliament to reconsider the decree.',
    clozeTarget: 'besought',
    cefrLevel: 'C2',
    difficulty: 'hard',
    tip: 'Verbe littéraire d’oratoire britannique partageant la terminaison -ought.'
  }
];

function buildCanonicalSmartMemoryCatalog(): SmartMemoryCatalogItem[] {
  const items: SmartMemoryCatalogItem[] = [];
  const seenItemIds = new Set<string>();
  const seenEnglishNormalized = new Set<string>();

  const pushUnique = (item: SmartMemoryCatalogItem) => {
    const cleanId = sanitizeFirestoreId(item.itemId);
    const normEng = normalizeTermKey(item.english);
    const dedupKey = `${item.itemType}::${normEng}`;
    if (!cleanId || !normEng) return;
    if (seenItemIds.has(cleanId) || seenEnglishNormalized.has(dedupKey)) {
      return;
    }
    // Also prevent duplicate exact English word across vocabulary & expression
    if (
      (item.itemType === 'vocabulary' || item.itemType === 'expression') &&
      (seenEnglishNormalized.has(`vocabulary::${normEng}`) ||
        seenEnglishNormalized.has(`expression::${normEng}`))
    ) {
      return;
    }

    seenItemIds.add(cleanId);
    seenEnglishNormalized.add(dedupKey);
    items.push({
      ...item,
      itemId: cleanId,
      normalizedKey: dedupKey
    });
  };

  // 1. Vocabulary from SPACED_REPETITION_500
  for (const card of SPACED_REPETITION_500) {
    const lvl = normalizeCefr(card.level);
    const sentence = card.pressExcerpt || card.englishDef || `Use "${card.term}" in a clear sentence.`;
    pushUnique({
      itemId: `vocab_${card.id}`,
      normalizedKey: `vocabulary::${normalizeTermKey(card.term)}`,
      itemType: 'vocabulary',
      english: card.term,
      french: card.frenchDef,
      pronunciation: card.phonetic || '/—/',
      exampleSentence: sentence,
      clozeTarget: extractClozeTarget(sentence, card.term),
      cefrLevel: lvl,
      topic: card.themeLabel || card.category || 'Vocabulaire',
      difficulty: inferDifficultyFromCefr(lvl)
    });
  }

  // 2. Expressions from DIALOGUE_SM2_CARDS (deduplicated against vocabulary)
  for (const expr of DIALOGUE_SM2_CARDS) {
    const lvl = normalizeCefr(expr.level);
    const sentence = expr.englishContext || expr.term;
    pushUnique({
      itemId: `expr_${expr.id}`,
      normalizedKey: `expression::${normalizeTermKey(expr.term)}`,
      itemType: 'expression',
      english: expr.term,
      french: expr.frenchDef,
      pronunciation: expr.ipa || '/—/',
      exampleSentence: sentence,
      clozeTarget: extractClozeTarget(sentence, expr.term),
      cefrLevel: lvl,
      topic: expr.themeLabel || 'Expressions Orales',
      difficulty: inferDifficultyFromCefr(lvl),
      grammarRule: expr.tipFr
    });
  }

  // 3. Grammar Rules from GRAMMAR_6E_ITEMS + A2-C2 curated grammar
  for (const g6 of GRAMMAR_6E_ITEMS) {
    const lvl = normalizeCefr(g6.cefr);
    const tokens = g6.exercise?.correct_tokens || [];
    const targetToken =
      tokens.find((t) => /^(am|is|are|isn't|aren't|have|has|can|can't|there|does|don't|doesn't|do)$/i.test(t)) ||
      tokens[1] ||
      extractClozeTarget(g6.example_en, g6.title);
    pushUnique({
      itemId: `gram_${g6.id}`,
      normalizedKey: `grammar::${normalizeTermKey(g6.title)}`,
      itemType: 'grammar',
      english: g6.title,
      french: `${g6.structure_formula} — ${g6.example_fr}`,
      pronunciation: g6.structure_formula,
      exampleSentence: g6.example_en,
      clozeTarget: targetToken,
      cefrLevel: lvl,
      topic: g6.category || 'Grammaire Fondamentale',
      difficulty: 'easy',
      grammarRule: `${g6.rule} Astuce : ${g6.tip}`
    });
  }

  for (const gr of CURATED_GRAMMAR_A2_C2) {
    pushUnique({
      itemId: gr.id,
      normalizedKey: `grammar::${normalizeTermKey(gr.english)}`,
      itemType: 'grammar',
      english: gr.english,
      french: gr.french,
      pronunciation: gr.pronunciation,
      exampleSentence: gr.exampleSentence,
      clozeTarget: gr.clozeTarget,
      cefrLevel: gr.cefrLevel,
      topic: gr.topic,
      difficulty: gr.difficulty,
      grammarRule: gr.grammarRule
    });
  }

  // 4. Irregular Verbs Bank (A1-C2)
  for (const verb of IRREGULAR_VERBS_SEED) {
    const englishDisplay = `${verb.base} · ${verb.past} · ${verb.participle}`;
    pushUnique({
      itemId: verb.id,
      normalizedKey: `irregular_verb::${normalizeTermKey(englishDisplay)}`,
      itemType: 'irregular_verb',
      english: englishDisplay,
      french: verb.french,
      pronunciation: verb.pronunciation,
      exampleSentence: verb.exampleSentence,
      clozeTarget: verb.clozeTarget,
      cefrLevel: verb.cefrLevel,
      topic: 'Verbes Irréguliers',
      difficulty: verb.difficulty,
      grammarRule: verb.tip
    });
  }

  return items;
}

export const SMART_MEMORY_CATALOG: SmartMemoryCatalogItem[] = buildCanonicalSmartMemoryCatalog();

export const SMART_MEMORY_CATALOG_BY_ID: Record<string, SmartMemoryCatalogItem> = Object.fromEntries(
  SMART_MEMORY_CATALOG.map((item) => [item.itemId, item])
);
