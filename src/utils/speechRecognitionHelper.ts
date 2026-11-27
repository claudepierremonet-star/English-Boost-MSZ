/**
 * Speech Recognition, Orthographic & Phonetic Correction Engine
 * 
 * Provides:
 * 1. Web Speech API browser integration (SpeechRecognition / webkitSpeechRecognition)
 *    supporting British English (en-GB) and American English (en-US).
 * 2. Token-level orthographic alignment (Levenshtein, Soundex & typo detection).
 * 3. Immediate phonetic diagnosis with IPA transcriptions (UK/US), silent letter detection,
 *    dental fricatives (/θ/, /ð/), vowel quantity, and tonic stress coaching.
 * 4. Error journal recording integration.
 */

// Web Speech API interface declarations for strict TypeScript environments
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: IWindowSpeechRecognition, ev: { error: string; message?: string }) => void) | null;
  onresult: ((this: IWindowSpeechRecognition, ev: {
    resultIndex: number;
    results: {
      length: number;
      item: (index: number) => {
        length: number;
        isFinal: boolean;
        item: (idx: number) => { transcript: string; confidence: number };
        [index: number]: { transcript: string; confidence: number };
      };
      [index: number]: {
        length: number;
        isFinal: boolean;
        [index: number]: { transcript: string; confidence: number };
      };
    };
  }) => void) | null;
}

export type TokenStatus = 'correct' | 'near_match' | 'misspelled' | 'omitted' | 'extra';

export interface OrthographicDiffToken {
  id: string;
  word: string;
  expected?: string;
  status: TokenStatus;
  similarityScore: number; // 0 to 1
  phoneticUk?: string;
  phoneticUs?: string;
  phoneticTip?: string;
  silentLetters?: string[];
  stressPattern?: string;
  frenchDef?: string;
}

export interface PhoneticPitfall {
  category: 'silent_letter' | 'dental_fricative' | 'vowel_length' | 'rhoticity' | 'tonic_stress' | 'consonant_cluster';
  categoryLabel: string;
  word: string;
  phoneticUk: string;
  phoneticUs: string;
  explanation: string;
  remedy: string;
}

export interface PhoneticCorrectionReport {
  overallScore: number; // Combines orthography + phonetic clarity
  orthographicScore: number;
  phoneticScore: number;
  targetAccent: 'en-GB' | 'en-US';
  totalExpectedWords: number;
  spokenWordsCount: number;
  exactMatchesCount: number;
  nearMatchesCount: number;
  misspelledCount: number;
  omittedCount: number;
  extraCount: number;
  tokens: OrthographicDiffToken[];
  pitfalls: PhoneticPitfall[];
  summaryMessage: string;
  strengths: string[];
  pedagogicalAdvice: string[];
}

/**
 * Check if the current browser environment supports the SpeechRecognition Web API
 */
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    SpeechRecognition?: new () => IWindowSpeechRecognition;
    webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Phonetic Dictionary and Rules for Curriculum & Common Speaking Words
 */
const KNOWN_PHONETICS: Record<string, { uk: string; us: string; stress: string; tip?: string; silent?: string[]; fr?: string }> = {
  // Common greetings & A1/A2
  good: { uk: '/ɡʊd/', us: '/ɡʊd/', stress: 'Monosyllabe', tip: 'Voyelle courte /ʊ/ relâchée (comme dans "book"), pas un long /uː/.', fr: 'Bon' },
  morning: { uk: '/ˈmɔː.nɪŋ/', us: '/ˈmɔːr.nɪŋ/', stress: 'MOR-ning', tip: 'En UK RP, ne prononcez pas le "r" central, allongez la voyelle /ɔː/. En US, rétroflexion douce.', fr: 'Matin / Matinée' },
  it: { uk: '/ɪt/', us: '/ɪt/', stress: 'Monosyllabe', tip: 'Voyelle brève et relâchée /ɪ/, plus ouverte que le "i" français.', fr: 'Il / Cela' },
  is: { uk: '/ɪz/', us: '/ɪz/', stress: 'Monosyllabe', tip: 'Consonne finale voisée /z/ (vibration des cordes vocales), jamais /s/.', fr: 'Est' },
  wonderful: { uk: '/ˈwʌn.də.fəl/', us: '/ˈwʌn.dɚ.fəl/', stress: 'WON-der-ful', tip: 'Accent primaire fort sur WON. Le "der" est un schwa /də/ très court.', fr: 'Merveilleux' },
  to: { uk: '/tuː/', us: '/tuː/', stress: 'Forme faible /tə/', tip: 'En discours fluide, se réduit souvent en schwa /tə/ devant une consonne.', fr: 'À / De' },
  meet: { uk: '/miːt/', us: '/miːt/', stress: 'Monosyllabe', tip: 'Voyelle longue tendue /iː/, bien plus tenue que le /ɪ/ bref.', fr: 'Rencontrer' },
  you: { uk: '/juː/', us: '/juː/', stress: 'Forme faible /jə/', tip: 'Semi-voyelle /j/ douce suivie de /uː/.', fr: 'Vous / Tu' },
  today: { uk: '/təˈdeɪ/', us: '/təˈdeɪ/', stress: 'to-DAY', tip: 'La première syllabe est réduite à un schwa /tə/ quasi inaudible, l’accent est sur DAY.', fr: 'Aujourd’hui' },
  in: { uk: '/ɪn/', us: '/ɪn/', stress: 'Monosyllabe', tip: 'Voyelle relâchée /ɪ/ brève sans nasalisation française.', fr: 'Dans / À' },
  london: { uk: '/ˈlʌn.dən/', us: '/ˈlʌn.dən/', stress: 'LON-don', tip: 'Voyelle ouverte /ʌ/ sur LON, puis schwa /dən/.', fr: 'Londres' },
  and: { uk: '/ænd/', us: '/ænd/', stress: 'Forme faible /ənd/', tip: 'Souvent réduit à /ən/ dans le flux de la phrase.', fr: 'Et' },
  i: { uk: '/aɪ/', us: '/aɪ/', stress: 'Monosyllabe', tip: 'Diphtongue nette /aɪ/ glissant de /a/ vers /ɪ/.', fr: 'Je' },
  hope: { uk: '/həʊp/', us: '/hoʊp/', stress: 'Monosyllabe', tip: 'Aspirez doucement le /h/ initial ; diphtongue /əʊ/ (UK) ou /oʊ/ (US).', fr: 'Espérer' },
  have: { uk: '/hæv/', us: '/hæv/', stress: 'Monosyllabe', tip: 'Aspiration initiale /h/ + voyelle ouverte /æ/.', fr: 'Avoir / Passer' },
  a: { uk: '/ə/', us: '/ə/', stress: 'Schwa non accentué', tip: 'Voyelle neutre très brève /ə/, jamais un "a" ouvert français.', fr: 'Un / Une' },
  pleasant: { uk: '/ˈplez.ənt/', us: '/ˈplez.ənt/', stress: 'PLEA-sant', tip: 'Le digramme "ea" se prononce /e/ bref (comme dans "bed"), pas /iː/.', fr: 'Agréable' },
  journey: { uk: '/ˈdʒɜː.ni/', us: '/ˈdʒɝː.ni/', stress: 'JOUR-ney', tip: 'Débutez par l’affriquée /dʒ/. En UK voyelle centrale longue /ɜː/.', fr: 'Voyage / Trajet' },
  excuse: { uk: '/ɪkˈskjuːz/', us: '/ɪkˈskjuːz/', stress: 'ex-CUSE', tip: 'Le verbe se termine par le son voisé /z/, tandis que le nom se termine par /s/.', fr: 'Excuser' },
  me: { uk: '/miː/', us: '/miː/', stress: 'Monosyllabe', tip: 'Voyelle tendue /iː/.', fr: 'Moi' },
  could: { uk: '/kʊd/', us: '/kʊd/', stress: 'Monosyllabe', tip: 'Le "l" est rigoureusement muet ! Voyelle courte /ʊ/.', silent: ['l'], fr: 'Pourriez-vous' },
  tell: { uk: '/tel/', us: '/tel/', stress: 'Monosyllabe', tip: 'Consonne /t/ légèrement aspirée en attaque.', fr: 'Dire' },
  which: { uk: '/wɪtʃ/', us: '/wɪtʃ/', stress: 'Monosyllabe', tip: 'Terminez par l’affriquée nette /tʃ/ (comme "tch"), pas /ʃ/.', fr: 'Lequel / Quel' },
  platform: { uk: '/ˈplæt.fɔːm/', us: '/ˈplæt.fɔːrm/', stress: 'PLAT-form', tip: 'Son /æ/ très ouvert sur PLAT. /fɔːm/ en UK sans "r".', fr: 'Quai de gare' },
  the: { uk: '/ðə/', us: '/ðə/', stress: 'Forme faible /ðə/ ou /ðiː/', tip: 'Fricative dentale voisée /ð/ : bout de la langue contre les incisives supérieures avec vibration.', fr: 'Le / La / Les' },
  train: { uk: '/treɪn/', us: '/treɪn/', stress: 'Monosyllabe', tip: 'Diphtongue claire /eɪ/, sans nasalisation du "n" final.', fr: 'Train' },
  oxford: { uk: '/ˈɒks.fəd/', us: '/ˈɑːks.fɚd/', stress: 'OX-ford', tip: 'Accent tonique net sur OX. La seconde syllabe "ford" s’affaiblit en /fəd/.', fr: 'Oxford' },
  departs: { uk: '/dɪˈpɑːts/', us: '/dɪˈpɑːrts/', stress: 'de-PARTS', tip: 'Attaque douce sur /dɪ/, explosion sonore sur PARTS.', fr: 'Part / Décolle' },
  from: { uk: '/frɒm/', us: '/frʌm/', stress: 'Forme faible /frəm/', tip: 'En phrase, s’affaiblit souvent en /frəm/.', fr: 'De / Depuis' },
  how: { uk: '/haʊ/', us: '/haʊ/', stress: 'Monosyllabe', tip: 'Souffle /h/ net suivi de la diphtongue /aʊ/.', fr: 'Comment / Combien' },
  long: { uk: '/lɒŋ/', us: '/lɔːŋ/', stress: 'Monosyllabe', tip: 'Nasalisation vélaire /ŋ/ en finale : n’articulez pas de /ɡ/ dur après /ŋ/.', fr: 'Longtemps' },
  takes: { uk: '/teɪks/', us: '/teɪks/', stress: 'Monosyllabe', tip: 'Diphtongue /eɪ/ suivie du groupe consonantique net /ks/.', fr: 'Prend (durée)' },
  // B1 / Academic
  university: { uk: '/ˌjuː.nɪˈvɜː.sə.ti/', us: '/ˌjuː.nəˈvɝː.sə.t̬i/', stress: 'u-ni-VER-si-ty', tip: 'Accent fort sur VER (/ɜː/ en UK, /ɝː/ rhotique en US) ; débute par /j/, pas /u/.', fr: 'Université' },
  archives: { uk: '/ˈɑː.kaɪvz/', us: '/ˈɑːr.kaɪvz/', stress: 'AR-chives', tip: 'Le groupe "ch" se prononce /k/ (d’origine grecque arkheion), jamais "ch" français !', fr: 'Archives historiques', silent: ['ch=/k/'] },
  contain: { uk: '/kənˈteɪn/', us: '/kənˈteɪn/', stress: 'con-TAIN', tip: 'La syllabe "con" se réduit en schwa /kən/.', fr: 'Contiennent' },
  thousands: { uk: '/ˈθaʊ.zəndz/', us: '/ˈθaʊ.zəndz/', stress: 'THOU-sands', tip: 'Fricative sourde /θ/ (langue délicatement entre les incisives), ne dites pas "s" ni "z" !', fr: 'Des milliers' },
  of: { uk: '/ɒv/', us: '/ʌv/', stress: 'Forme faible /əv/', tip: 'Consonne finale voisée /v/, jamais /f/.', fr: 'De' },
  rare: { uk: '/reə/', us: '/rer/', stress: 'Monosyllabe', tip: 'En UK diphtongue centrante /eə/ sans "r" final ; en US /r/ final coloré.', fr: 'Rares' },
  manuscripts: { uk: '/ˈmæn.jə.skrɪpts/', us: '/ˈmæn.jə.skrɪpts/', stress: 'MAN-u-scripts', tip: 'Accent tonique sur MAN. Articulez le cluster final consonant /pts/.', fr: 'Manuscrits' },
  historical: { uk: '/hɪˈstɒr.ɪ.kəl/', us: '/hɪˈstɔːr.ɪ.kəl/', stress: 'his-TOR-i-cal', tip: 'Aspiration douce sur /h/ puis accent fort sur TOR.', fr: 'Historiques' },
  documents: { uk: '/ˈdɒk.jə.mənts/', us: '/ˈdɑːk.jə.mənts/', stress: 'DOC-u-ments', tip: 'Accent sur DOC ; glide /jə/ dans "-cu-", schwa final /mənts/.', fr: 'Documents' },
  eighteenth: { uk: '/ˌeɪˈtiːnθ/', us: '/ˌeɪˈtiːnθ/', stress: 'eigh-TEENTH', tip: 'Terminaison en /θ/. Les lettres "gh" sont rigoureusement muettes !', silent: ['gh'], fr: 'Dix-huitième' },
  century: { uk: '/ˈsen.tʃər.i/', us: '/ˈsen.tʃɚ.i/', stress: 'CEN-tu-ry', tip: 'Le "tu" produit une affriquée /tʃ/ (comme dans "tchèque").', fr: 'Siècle' },
  // C1 / C2 / B2
  would: { uk: '/wʊd/', us: '/wʊd/', stress: 'Monosyllabe', tip: 'Le "l" est muet ! Voyelle brève /ʊ/.', silent: ['l'], fr: 'Serait' },
  be: { uk: '/biː/', us: '/biː/', stress: 'Forme faible /bi/', tip: 'Voyelle claire /iː/.', fr: 'Être' },
  premature: { uk: '/ˌprem.əˈtʃʊər/', us: '/ˌpriː.məˈtʊr/', stress: 'pre-ma-TURE', tip: 'En UK accent sur la dernière syllabe TURE avec /tʃʊə/, en US souvent /priː.məˈtʊr/.', fr: 'Prématuré' },
  if: { uk: '/ɪf/', us: '/ɪf/', stress: 'Monosyllabe', tip: 'Voyelle courte /ɪ/.', fr: 'Si' },
  not: { uk: '/nɒt/', us: '/nɑːt/', stress: 'Monosyllabe', tip: 'En UK voyelle arrondie brève /ɒ/, en US ouverte /ɑː/.', fr: 'Pas' },
  decidedly: { uk: '/dɪˈsaɪ.dɪd.li/', us: '/dɪˈsaɪ.dɪd.li/', stress: 'de-CI-ded-ly', tip: 'Accent net sur CI /saɪ/. La terminaison "-ed-" se prononce /ɪd/.', fr: 'Résolument' },
  imprudent: { uk: '/ɪmˈpruː.dənt/', us: '/ɪmˈpruː.dənt/', stress: 'im-PRU-dent', tip: 'Accent primaire sur PRU. Voyelle longue /uː/.', fr: 'Imprudent' },
  commit: { uk: '/kəˈmɪt/', us: '/kəˈmɪt/', stress: 'com-MIT', tip: 'Première syllabe réduite au schwa /kə/, accent sur MIT.', fr: 'Engager' },
  our: { uk: '/aʊə/', us: '/ˈaʊ.ɚ/', stress: 'Monosyllabe', tip: 'Triphtongue douce /aʊə/ en UK sans "r" final.', fr: 'Notre' },
  delegation: { uk: '/ˌdel.ɪˈɡeɪ.ʃən/', us: '/ˌdel.əˈɡeɪ.ʃən/', stress: 'del-e-GA-tion', tip: 'Accent primaire sur GA /ɡeɪ/ et terminaison /ʃən/.', fr: 'Délégation' },
  before: { uk: '/bɪˈfɔː/', us: '/bɪˈfɔːr/', stress: 'be-FORE', tip: 'Voyelle longue /ɔː/ sur FORE ; pas de /r/ final en UK.', fr: 'Avant que' },
  all: { uk: '/ɔːl/', us: '/ɔːl/', stress: 'Monosyllabe', tip: 'Voyelle longue /ɔː/ suivie du "dark L" vélarisé.', fr: 'Tous' },
  multilateral: { uk: '/ˌmʌl.tiˈlæt.ər.əl/', us: '/ˌmʌl.t̬iˈlæt̬.ɚ.əl/', stress: 'mul-ti-LAT-er-al', tip: 'Accent tonique fort sur LAT avec /æ/ ouvert.', fr: 'Multilatérales' },
  contingencies: { uk: '/kənˈtɪn.dʒən.siz/', us: '/kənˈtɪn.dʒən.siz/', stress: 'con-TIN-gen-cies', tip: 'Accent tonique sur TIN. Le "g" est doux /dʒ/.', fr: 'Éventualités / Imprévus' },
  been: { uk: '/biːn/', us: '/bɪn/', stress: 'Forme faible /bɪn/', tip: 'En UK /biːn/ ou /bɪn/, en US typiquement bref /bɪn/.', fr: 'Été' },
  thoroughly: { uk: '/ˈθʌr.ə.li/', us: '/ˈθɝː.oʊ.li/', stress: 'THOR-ough-ly', tip: 'Débutez par /θ/ ; "-ough-" se réduit en schwa /ə/ en UK — "gh" totalement muet !', silent: ['gh'], fr: 'Minutieusement' },
  evaluated: { uk: '/ɪˈvæl.ju.eɪ.tɪd/', us: '/ɪˈvæl.ju.eɪ.t̬ɪd/', stress: 'e-VAL-u-a-ted', tip: 'Accent sur VAL. En US, le "t" intérieur subit le flap américain [t̬].', fr: 'Évalué' },
  prudence: { uk: '/ˈpruː.dəns/', us: '/ˈpruː.dəns/', stress: 'PRU-dence', tip: 'Accent tonique ferme sur PRU. Le "c" final se prononce /s/.', fr: 'Prudence cardinale' },
  only: { uk: '/ˈəʊn.li/', us: '/ˈoʊn.li/', stress: 'ON-ly', tip: 'Diphtongue britannique /əʊ/ vs américaine /oʊ/.', fr: 'Seulement' },
  first: { uk: '/fɜːst/', us: '/fɝːst/', stress: 'Monosyllabe', tip: 'Voyelle centrale longue /ɜː/ en UK sans "r" ; /ɝː/ rhotique en US.', fr: 'Première' },
  rank: { uk: '/ræŋk/', us: '/ræŋk/', stress: 'Monosyllabe', tip: 'Voyelle ouverte /æ/ devant la nasale vélaire /ŋk/.', fr: 'Rang' },
  virtues: { uk: '/ˈvɜː.tʃuːz/', us: '/ˈvɝː.tʃuːz/', stress: 'VIR-tues', tip: 'En UK pas de "r", voyelle centrale /ɜː/. Fin en "s" voisé /z/.', fr: 'Vertus' },
  political: { uk: '/pəˈlɪt.ɪ.kəl/', us: '/pəˈlɪt̬.ə.kəl/', stress: 'po-LIT-i-cal', tip: 'Le "po-" initial est un schwa très discret /pə/. Accent fort sur LIT.', fr: 'Politique' },
  moral: { uk: '/ˈmɒr.əl/', us: '/ˈmɔːr.əl/', stress: 'MOR-al', tip: 'En UK voyelle courte ouverte /ɒ/, en US /ɔːr/.', fr: 'Morale' },
  but: { uk: '/bʌt/', us: '/bʌt/', stress: 'Forme faible /bət/', tip: 'Voyelle centrale brève /ʌ/ ou schwa /ə/.', fr: 'Mais' },
  she: { uk: '/ʃiː/', us: '/ʃiː/', stress: 'Monosyllabe', tip: 'Fricative palato-alvéolaire /ʃ/ suivie de /iː/.', fr: 'Elle' },
  director: { uk: '/daɪˈrek.tə/', us: '/dəˈrek.tɚ/', stress: 'di-REC-tor', tip: 'Accent sur REC ; terminaison faible /tə/ en UK sans "r".', fr: 'Directrice' },
  regulator: { uk: '/ˈreɡ.jə.leɪ.tə/', us: '/ˈreɡ.jə.leɪ.t̬ɚ/', stress: 'REG-u-la-tor', tip: 'Accent sur REG et diphtongue secondaire /eɪ/ sur "-la-".', fr: 'Régulatrice' },
  standard: { uk: '/ˈstæn.dəd/', us: '/ˈstæn.dɚd/', stress: 'STAN-dard', tip: 'Accent sur STAN (/æ/), seconde syllabe réduite /dəd/ (UK).', fr: 'Étalon / Référence' },
  them: { uk: '/ðem/', us: '/ðem/', stress: 'Forme faible /ðəm/', tip: 'Attaque dentale voisée /ð/ douce.', fr: 'Eux / Elles' },
  distinguished: { uk: '/dɪˈstɪŋ.ɡwɪʃt/', us: '/dɪˈstɪŋ.ɡwɪʃt/', stress: 'dis-TIN-guished', tip: 'Accent sur TIN. Terminaison "-ed" prononcée /t/ après /ʃ/.', fr: 'Distingué' },
  colleagues: { uk: '/ˈkɒl.iːɡz/', us: '/ˈkɑː.liːɡz/', stress: 'COL-leagues', tip: 'Les lettres "-ues" finales sont muettes, arrêt net sur /ɡz/.', silent: ['ues'], fr: 'Collègues' },
  guests: { uk: '/ɡests/', us: '/ɡests/', stress: 'Monosyllabe', tip: 'Le "u" après "g" est purement muet ! Cluster final /sts/.', silent: ['u'], fr: 'Invités' },
  tonight: { uk: '/təˈnaɪt/', us: '/təˈnaɪt/', stress: 'to-NIGHT', tip: 'Le "gh" est totalement muet ; diphtongue claire /aɪ/.', silent: ['gh'], fr: 'Ce soir' },
  we: { uk: '/wiː/', us: '/wiː/', stress: 'Monosyllabe', tip: 'Approximante bilabiale /w/ arrondie.', fr: 'Nous' },
  examine: { uk: '/ɪɡˈzæm.ɪn/', us: '/ɪɡˈzæm.ɪn/', stress: 'ex-AM-ine', tip: 'Le "x" se sonorise en /ɡz/ devant voyelle accentuée ; accent sur AM.', fr: 'Examinons' },
  whether: { uk: '/ˈweð.ə/', us: '/ˈweð.ɚ/', stress: 'WHE-ther', tip: 'Le "h" est muet en anglais moderne ; son /ð/ doux au milieu.', silent: ['h'], fr: 'Si' },
  economic: { uk: '/ˌek.əˈnɒm.ɪk/', us: '/ˌek.əˈnɑːm.ɪk/', stress: 'ec-o-NOM-ic', tip: 'Accent tonique principal sur NOM ; syllabe "-o-" réduite en /ə/.', fr: 'Économique' },
  interdependence: { uk: '/ˌɪn.tə.dɪˈpen.dəns/', us: '/ˌɪn.t̬ɚ.dɪˈpen.dəns/', stress: 'in-ter-de-PEN-dence', tip: 'Accent tonique primaire sur PEN. Multiples syllabes unstressed.', fr: 'Interdépendance' },
  can: { uk: '/kæn/', us: '/kæn/', stress: 'Forme faible /kən/', tip: 'En position inaccentuée, prononcez /kən/.', fr: 'Peut' },
  guarantee: { uk: '/ˌɡær.ənˈtiː/', us: '/ˌɡer.ənˈtiː/', stress: 'guar-an-TEE', tip: 'Le "u" initial est muet ; accent primaire sur la finale longue /tiː/.', silent: ['u'], fr: 'Garantir' },
  longterm: { uk: '/ˌlɒŋˈtɜːm/', us: '/ˌlɔːŋˈtɝːm/', stress: 'long-TERM', tip: 'Voyelle centrale /ɜː/ sur TERM, sans "r" en UK.', fr: 'Long terme' },
  peace: { uk: '/piːs/', us: '/piːs/', stress: 'Monosyllabe', tip: 'Voyelle longue tendue /iː/ et /s/ final net.', fr: 'Paix' },
  among: { uk: '/əˈmʌŋ/', us: '/əˈmʌŋ/', stress: 'a-MONG', tip: 'Débute par schwa /ə/, puis /ʌŋ/ sans /ɡ/ final prononcé.', fr: 'Parmi' },
  sovereign: { uk: '/ˈsɒv.rɪn/', us: '/ˈsɑːv.rən/', stress: 'SOV-ereign', tip: 'Le "g" est entièrement silencieux ! Se prononce en deux syllabes [SOV-rin].', silent: ['g'], fr: 'Souverain' },
  nations: { uk: '/ˈneɪ.ʃənz/', us: '/ˈneɪ.ʃənz/', stress: 'NA-tions', tip: 'Diphtongue /eɪ/ sur NA, terminaison /ʃənz/.', fr: 'Nations' },
  // Extra frequent studio & dictation words
  thematic: { uk: '/θɪˈmæt.ɪk/', us: '/θɪˈmæt̬.ɪk/', stress: 'the-MAT-ic', tip: 'Fricative sourde /θ/ initiale et accent sur MAT.', fr: 'Thématique' },
  ambassador: { uk: '/æmˈbæs.ə.də/', us: '/æmˈbæs.ə.dɚ/', stress: 'am-BAS-sa-dor', tip: 'Accent tonique sur BAS ; deux schwas légers en finale.', fr: 'Ambassadeur' },
  delivered: { uk: '/dɪˈlɪv.əd/', us: '/dɪˈlɪv.ɚd/', stress: 'de-LIV-ered', tip: 'Accent sur LIV ; "-ed" se prononce /d/ bref sans voyelle ajoutée.', fr: 'A prononcé / livré' },
  thoughtful: { uk: '/ˈθɔːt.fəl/', us: '/ˈθɑːt.fəl/', stress: 'THOUGHT-ful', tip: 'Fricative dentale /θ/ initiale ; "gh" est totalement muet.', silent: ['gh'], fr: 'Réfléchi / Attentif' },
  address: { uk: '/əˈdres/', us: '/əˈdres/', stress: 'ad-DRESS', tip: 'Débute par schwa /ə/ ; accent sur DRESS.', fr: 'Discours / Allocution' },
  international: { uk: '/ˌɪn.təˈnæʃ.ən.əl/', us: '/ˌɪn.t̬ɚˈnæʃ.ən.əl/', stress: 'in-ter-NA-tion-al', tip: 'Accent principal sur NA (/æ/) ; "-tion-" devient /ʃən/.', fr: 'International' },
  trade: { uk: '/treɪd/', us: '/treɪd/', stress: 'Monosyllabe', tip: 'Diphtongue /eɪ/ soutenue avant /d/ final.', fr: 'Commerce' },
  water: { uk: '/ˈwɔː.tə/', us: '/ˈwɑː.t̬ɚ/', stress: 'WA-ter', tip: 'En UK /t/ net et finale /ə/ ; en US flap [t̬] doux et /ɚ/ rhotique.', fr: 'Eau' },
  think: { uk: '/θɪŋk/', us: '/θɪŋk/', stress: 'Monosyllabe', tip: 'Langue entre les incisives pour /θ/, puis voyelle brève /ɪ/.', fr: 'Penser' },
  three: { uk: '/θriː/', us: '/θriː/', stress: 'Monosyllabe', tip: 'Enchaînez /θ/ (langue entre les dents) avec /r/ sans insérer de voyelle.', fr: 'Trois' },
  through: { uk: '/θruː/', us: '/θruː/', stress: 'Monosyllabe', tip: '"gh" muet ! Fricative /θ/ + /r/ + voyelle longue /uː/.', silent: ['gh'], fr: 'À travers' },
  though: { uk: '/ðəʊ/', us: '/ðoʊ/', stress: 'Monosyllabe', tip: 'Fricative voisée /ð/ ; "gh" entièrement muet.', silent: ['gh'], fr: 'Bien que' }
};

/**
 * Clean text for tokenization
 */
function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9']/g, '').trim();
}

/**
 * Rule-based English Grapheme-to-Phoneme estimator when word is outside KNOWN_PHONETICS
 */
function estimateWordPhonetics(
  rawClean: string,
  targetAccent: 'en-GB' | 'en-US'
): { uk: string; us: string; stress: string } {
  if (!rawClean) return { uk: '//', us: '//', stress: 'Monosyllabe' };

  const convert = (accent: 'en-GB' | 'en-US'): string => {
    let s = rawClean.toLowerCase();
    // Common suffix rules first
    s = s.replace(/tion\b/g, 'ʃən');
    s = s.replace(/sion\b/g, 'ʒən');
    s = s.replace(/ough\b/g, 'əʊ');
    s = s.replace(/igh/g, 'aɪ');
    s = s.replace(/^(kn|gn)/g, 'n');
    s = s.replace(/^wr/g, 'r');
    s = s.replace(/^ps/g, 's');
    s = s.replace(/mb\b/g, 'm');
    s = s.replace(/ph/g, 'f');
    s = s.replace(/sh/g, 'ʃ');
    s = s.replace(/ch/g, 'tʃ');
    s = s.replace(/th/g, /^(the|this|that|they|them|their|there|these|those|though)/.test(rawClean) ? 'ð' : 'θ');
    s = s.replace(/ng\b/g, 'ŋ');
    s = s.replace(/qu/g, 'kw');
    // Vowel digraphs & rhoticity
    if (accent === 'en-GB') {
      s = s.replace(/ar/g, 'ɑː').replace(/or/g, 'ɔː').replace(/(er|ir|ur)\b/g, 'ə').replace(/(er|ir|ur)/g, 'ɜː');
    } else {
      s = s.replace(/ar/g, 'ɑːr').replace(/or/g, 'ɔːr').replace(/(er|ir|ur)\b/g, 'ɚ').replace(/(er|ir|ur)/g, 'ɝː');
    }
    s = s.replace(/ee/g, 'iː').replace(/ea/g, 'iː').replace(/oo/g, 'uː').replace(/ai|ay/g, 'eɪ').replace(/ou|ow/g, 'aʊ');
    s = s.replace(/e\b/g, '');
    return `/${s || rawClean}/`;
  };

  return {
    uk: convert('en-GB'),
    us: convert('en-US'),
    stress: rawClean.length > 5 ? 'Syllabe initiale' : 'Monosyllabe'
  };
}

export interface WordPhoneticLookupResult {
  word: string;
  clean: string;
  phoneticUk: string;
  phoneticUs: string;
  activePhonetic: string;
  stressPattern: string;
  tip?: string;
  silentLetters: string[];
  frenchDef?: string;
  isFromLexicon: boolean;
}

/**
 * Look up UK/US IPA reference phonemes and articulation metadata for a single word
 */
export function getWordPhonetics(
  word: string,
  targetAccent: 'en-GB' | 'en-US' = 'en-GB'
): WordPhoneticLookupResult {
  const clean = cleanWord(word);
  const hyphenJoined = clean.replace(/-/g, '');
  const known = KNOWN_PHONETICS[clean] || KNOWN_PHONETICS[hyphenJoined];
  if (known) {
    return {
      word,
      clean,
      phoneticUk: known.uk,
      phoneticUs: known.us,
      activePhonetic: targetAccent === 'en-GB' ? known.uk : known.us,
      stressPattern: known.stress,
      tip: known.tip,
      silentLetters: known.silent || [],
      frenchDef: known.fr,
      isFromLexicon: true
    };
  }
  const estimated = estimateWordPhonetics(clean, targetAccent);
  return {
    word,
    clean,
    phoneticUk: estimated.uk,
    phoneticUs: estimated.us,
    activePhonetic: targetAccent === 'en-GB' ? estimated.uk : estimated.us,
    stressPattern: estimated.stress,
    silentLetters: [],
    isFromLexicon: false
  };
}

/**
 * Calculate Levenshtein Distance between two words
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Simple English Soundex Algorithm for phonetic similarity detection
 */
function soundex(str: string): string {
  if (!str) return '';
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';

  const firstLetter = s[0];
  const mappings: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  let code = firstLetter;
  let prev = mappings[firstLetter] || '0';

  for (let i = 1; i < s.length && code.length < 4; i++) {
    const char = s[i];
    const digit = mappings[char] || '0';
    if (digit !== '0' && digit !== prev) {
      code += digit;
      prev = digit;
    } else if (digit === '0') {
      prev = '0';
    }
  }

  return (code + '000').slice(0, 4);
}

/**
 * Detect phonetic difficulty patterns in an expected word
 */
function inspectPhoneticDifficulty(
  word: string,
  targetAccent: 'en-GB' | 'en-US'
): {
  phoneticUk: string;
  phoneticUs: string;
  pitfall?: PhoneticPitfall;
  tip?: string;
  silent?: string[];
  stress?: string;
  fr?: string;
} {
  const lookup = getWordPhonetics(word, targetAccent);
  const clean = lookup.clean;
  const ukPhonetic = lookup.phoneticUk;
  const usPhonetic = lookup.phoneticUs;
  const stress = lookup.stressPattern;
  const silent = lookup.silentLetters;
  const fr = lookup.frenchDef;

  let pitfall: PhoneticPitfall | undefined;

  // Rule 1: Silent letters detection
  if (/^(kn|wr|ps|gn)/i.test(clean) || /(mb|bt|sc|igh|alk|eigh)$/i.test(clean) || clean === 'doubt' || clean === 'subtle' || clean === 'island' || silent.length > 0) {
    let silentLetter = silent[0] || 'lettre';
    if (/^kn/i.test(clean)) silentLetter = 'k initial';
    else if (/^wr/i.test(clean)) silentLetter = 'w initial';
    else if (/mb$/i.test(clean)) silentLetter = 'b final';
    else if (/bt$/i.test(clean) || clean === 'doubt' || clean === 'subtle') silentLetter = 'b';
    else if (/igh/i.test(clean)) silentLetter = 'gh';

    pitfall = {
      category: 'silent_letter',
      categoryLabel: 'Lettre Muette (Silent Letter)',
      word,
      phoneticUk: ukPhonetic,
      phoneticUs: usPhonetic,
      explanation: `Dans « ${word} », le « ${silentLetter} » est rigoureusement muet en anglais natif.`,
      remedy: `N'articulez pas la lettre muette. Passez directement au son vocalique ou consonantique suivant.`
    };
  }
  // Rule 2: Dental Fricative (/θ/ ou /ð/)
  else if (/th/i.test(clean)) {
    pitfall = {
      category: 'dental_fricative',
      categoryLabel: 'Fricative Dentale (/θ/ ou /ð/)',
      word,
      phoneticUk: ukPhonetic,
      phoneticUs: usPhonetic,
      explanation: `Le digramme « th » dans « ${word} » exige un placement lingual précis (bout de langue effleurant les incisives supérieures).`,
      remedy: `Évitez de substituer un /s/ ou un /z/ francophone. Soufflez l'air doucement entre la langue et les dents.`
    };
  }
  // Rule 3: British Non-Rhoticity vs American Rhoticity
  else if (/r/i.test(clean) && !/^[r]/i.test(clean)) {
    if (targetAccent === 'en-GB') {
      pitfall = {
        category: 'rhoticity',
        categoryLabel: 'Rhotisme Britannique (Non-Rhotic RP)',
        word,
        phoneticUk: ukPhonetic,
        phoneticUs: usPhonetic,
        explanation: `En anglais britannique RP, le « r » devant consonne ou en fin de mot ne roule jamais. Il allonge la voyelle ou se dissout en schwa /ə/.`,
        remedy: `Arrondissez la voyelle sans relever la pointe de la langue.`
      };
    } else {
      pitfall = {
        category: 'rhoticity',
        categoryLabel: 'Rhotisme Américain (Rhotic GenAm)',
        word,
        phoneticUk: ukPhonetic,
        phoneticUs: usPhonetic,
        explanation: `En américain général, le « r » est prononcé de manière rétrofléxie avec la langue reculée vers le palais.`,
        remedy: `Rétractez le corps de la langue vers le palais mou pour faire sonner le /r/ américain chaud et plein.`
      };
    }
  }

  return {
    phoneticUk: ukPhonetic,
    phoneticUs: usPhonetic,
    pitfall,
    tip: lookup.tip,
    silent,
    stress,
    fr
  };
}

/**
 * Compare target text and speech recognized transcript
 * Produces word-by-word orthographic diff & phonetic analysis
 */
export function compareOrthographyAndPhonetics(
  expectedText: string,
  spokenTranscript: string,
  targetAccent: 'en-GB' | 'en-US' = 'en-GB'
): PhoneticCorrectionReport {
  // Tokenize expected words while keeping original punctuation
  const rawExpectedTokens = expectedText.trim().split(/\s+/).filter(Boolean);
  const rawSpokenTokens = spokenTranscript.trim().split(/\s+/).filter(Boolean);

  const cleanExpected = rawExpectedTokens.map(cleanWord);
  const cleanSpoken = rawSpokenTokens.map(cleanWord);

  const tokens: OrthographicDiffToken[] = [];
  const pitfalls: PhoneticPitfall[] = [];

  let exactMatches = 0;
  let nearMatches = 0;
  let misspelledCount = 0;
  let omittedCount = 0;

  // Track matched spoken indices
  const usedSpokenIndices = new Set<number>();

  // Pass 1: Align expected words with spoken tokens
  rawExpectedTokens.forEach((rawWord, expIdx) => {
    const expClean = cleanExpected[expIdx];
    const phonInfo = inspectPhoneticDifficulty(rawWord, targetAccent);

    if (phonInfo.pitfall) {
      pitfalls.push(phonInfo.pitfall);
    }

    // Try finding exact match in a local sliding window (+/- 3 words)
    let bestSpokenIdx = -1;
    let bestSim = 0;
    let bestStatus: TokenStatus = 'omitted';

    const windowStart = Math.max(0, expIdx - 3);
    const windowEnd = Math.min(rawSpokenTokens.length, expIdx + 4);

    for (let sIdx = windowStart; sIdx < windowEnd; sIdx++) {
      if (usedSpokenIndices.has(sIdx)) continue;
      const spkClean = cleanSpoken[sIdx];

      if (spkClean === expClean) {
        bestSpokenIdx = sIdx;
        bestSim = 1.0;
        bestStatus = 'correct';
        break;
      }

      // Check distance & Soundex
      const dist = levenshteinDistance(expClean, spkClean);
      const maxLen = Math.max(expClean.length, spkClean.length);
      const sim = 1 - dist / Math.max(1, maxLen);
      const isSoundexMatch = soundex(expClean) === soundex(spkClean);

      if (sim > bestSim && sim >= 0.6) {
        bestSim = sim;
        bestSpokenIdx = sIdx;
        bestStatus = isSoundexMatch || sim >= 0.75 ? 'near_match' : 'misspelled';
      }
    }

    if (bestSpokenIdx !== -1) {
      usedSpokenIndices.add(bestSpokenIdx);
      const spokenWord = rawSpokenTokens[bestSpokenIdx];

      if (bestStatus === 'correct') {
        exactMatches++;
      } else if (bestStatus === 'near_match') {
        nearMatches++;
      } else {
        misspelledCount++;
      }

      tokens.push({
        id: `tok-exp-${expIdx}`,
        word: spokenWord,
        expected: rawWord,
        status: bestStatus,
        similarityScore: bestSim,
        phoneticUk: phonInfo.phoneticUk,
        phoneticUs: phonInfo.phoneticUs,
        phoneticTip: phonInfo.tip,
        silentLetters: phonInfo.silent,
        stressPattern: phonInfo.stress,
        frenchDef: phonInfo.fr
      });
    } else {
      // Omitted word
      omittedCount++;
      tokens.push({
        id: `tok-exp-omitted-${expIdx}`,
        word: rawWord,
        expected: rawWord,
        status: 'omitted',
        similarityScore: 0,
        phoneticUk: phonInfo.phoneticUk,
        phoneticUs: phonInfo.phoneticUs,
        phoneticTip: phonInfo.tip,
        silentLetters: phonInfo.silent,
        stressPattern: phonInfo.stress,
        frenchDef: phonInfo.fr
      });
    }
  });

  // Pass 2: Identify any extra / superfluous spoken words
  let extraCount = 0;
  rawSpokenTokens.forEach((rawSpk, sIdx) => {
    if (!usedSpokenIndices.has(sIdx)) {
      extraCount++;
      tokens.push({
        id: `tok-extra-${sIdx}`,
        word: rawSpk,
        status: 'extra',
        similarityScore: 0,
        phoneticTip: 'Mot superflu inséré lors de votre dictée.'
      });
    }
  });

  // Calculate scores
  const totalExpected = Math.max(1, rawExpectedTokens.length);
  const hasSpoken = rawSpokenTokens.length > 0;
  const orthographicScore = hasSpoken
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((exactMatches * 1.0 + nearMatches * 0.75) / totalExpected) * 100 - extraCount * 4
          )
        )
      )
    : 0;

  const phoneticScore = hasSpoken
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            orthographicScore * 0.85 + (pitfalls.length > 0 ? 12 : 15)
          )
        )
      )
    : 0;

  const overallScore = hasSpoken ? Math.round((orthographicScore * 0.55 + phoneticScore * 0.45)) : 0;

  // Build feedback summary & pedagogical advice
  const strengths: string[] = [];
  const pedagogicalAdvice: string[] = [];

  if (!hasSpoken) {
    pedagogicalAdvice.push(
      'Aucune parole distincte n’a été captée par la reconnaissance vocale. Rapprochez-vous du microphone et réessayez.'
    );
  } else {
    if (exactMatches >= totalExpected * 0.8) {
      strengths.push('Excellente articulation globale et reconnaissance immédiate des termes cibles.');
    }
    if (nearMatches > 0) {
      pedagogicalAdvice.push(
        `${nearMatches} mot(s) ont une orthographe ou une sonorité proche : vérifiez les finales et les voyelles courtes.`
      );
    }
    if (omittedCount > 0) {
      pedagogicalAdvice.push(
        `${omittedCount} mot(s) attendu(s) n'ont pas été détectés : veillez à maintenir un débit régulier sans avaler les fins de phrases.`
      );
    }
    if (extraCount > 0) {
      pedagogicalAdvice.push(
        `${extraCount} mot(s) parasite(s) ou hésitation(s) repéré(s) : marquez des respirations nettes plutôt que des interjections vocales.`
      );
    }
  }

  let summaryMessage = 'Bonne session de dictée et prononciation.';
  if (!hasSpoken) {
    summaryMessage = 'Aucune parole détectée. Veuillez parler distinctement près du microphone puis relancer la dictée.';
  } else if (overallScore >= 90) {
    summaryMessage = 'Prestation remarquable ! Élocution claire, fidèle au modèle natif et sans faute orthographique notable.';
  } else if (overallScore >= 75) {
    summaryMessage = 'Bonne maîtrise de l’élocution. Quelques ajustements phonétiques et orthographiques recommandés ci-dessous.';
  } else {
    summaryMessage = 'Pratique stimulante. Portez votre attention sur le découpage syllabique et les mots surlignés ci-dessous.';
  }

  return {
    overallScore,
    orthographicScore,
    phoneticScore,
    targetAccent,
    totalExpectedWords: rawExpectedTokens.length,
    spokenWordsCount: rawSpokenTokens.length,
    exactMatchesCount: exactMatches,
    nearMatchesCount: nearMatches,
    misspelledCount,
    omittedCount,
    extraCount,
    tokens,
    pitfalls,
    summaryMessage,
    strengths,
    pedagogicalAdvice
  };
}

/**
 * Controller class managing Web Speech API recognition lifecycle
 */
export class SpeechRecognitionController {
  private recognition: IWindowSpeechRecognition | null = null;
  private isListening: boolean = false;
  private targetLang: string = 'en-GB';
  private accumulatedFinalTranscript: string = '';
  private currentInterimTranscript: string = '';

  public onTranscriptChange?: (finalText: string, interimText: string) => void;
  public onStatusChange?: (status: 'listening' | 'stopped' | 'error', errorMessage?: string) => void;

  constructor(targetAccent: 'en-GB' | 'en-US' = 'en-GB') {
    this.targetLang = targetAccent;
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      SpeechRecognition?: new () => IWindowSpeechRecognition;
      webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
    };

    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = this.targetLang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChange?.('listening');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStatusChange?.('stopped');
      };

      this.recognition.onerror = (ev) => {
        console.warn('Speech recognition event error:', ev.error);
        let msg = 'Erreur lors de la capture vocale.';
        if (ev.error === 'not-allowed') {
          msg = 'Autorisation du microphone refusée dans le navigateur.';
        } else if (ev.error === 'no-speech') {
          msg = 'Aucune parole détectée. Veuillez parler distinctement près du microphone.';
        } else if (ev.error === 'network') {
          msg = 'Problème réseau lié au service de reconnaissance vocale du navigateur.';
        }
        this.onStatusChange?.('error', msg);
      };

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptChunk = res[0]?.transcript || '';
          if (res.isFinal) {
            this.accumulatedFinalTranscript += ' ' + transcriptChunk.trim();
          } else {
            interim += ' ' + transcriptChunk;
          }
        }
        this.currentInterimTranscript = interim.trim();
        this.onTranscriptChange?.(
          this.accumulatedFinalTranscript.trim(),
          this.currentInterimTranscript
        );
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  public setAccent(accent: 'en-GB' | 'en-US') {
    this.targetLang = accent;
    if (this.recognition) {
      this.recognition.lang = accent;
    }
  }

  public start() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      this.onStatusChange?.('error', 'Reconnaissance vocale non disponible sur ce navigateur.');
      return;
    }

    this.accumulatedFinalTranscript = '';
    this.currentInterimTranscript = '';

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition start exception:', err);
    }
  }

  public stop(): string {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop exception:', err);
      }
    }
    this.isListening = false;
    return (this.accumulatedFinalTranscript + ' ' + this.currentInterimTranscript).trim();
  }

  public abort() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // no-op
      }
    }
    this.isListening = false;
    this.accumulatedFinalTranscript = '';
    this.currentInterimTranscript = '';
  }

  public getFullTranscript(): string {
    return (this.accumulatedFinalTranscript + ' ' + this.currentInterimTranscript).trim();
  }
}
