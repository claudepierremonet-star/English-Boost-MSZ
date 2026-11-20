import { ALL_SCHOOL_LESSONS, type SchoolVocabularyItem } from './schoolCurriculum';
import { SPACED_REPETITION_500 } from './spacedRepetition500';
import { CURIOSITIES, CLASSIC_DICTATION_ITEMS } from './curriculum';
import type { CompactVocabGroup } from './cityBank5000_types';
import { CITY_BANK_5000_PART1_RAW, CITY_BANK_5000_PART1_GROUPS } from './cityBank5000_part1';
import { CITY_BANK_5000_PART2_GROUPS } from './cityBank5000_part2';
import { CITY_BANK_5000_PART3_GROUPS } from './cityBank5000_part3';
import { CITY_BANK_5000_PART4_GROUPS } from './cityBank5000_part4';
import { CITY_BANK_5000_PART5_GROUPS } from './cityBank5000_part5';
import { CITY_BANK_5000_PART6_GROUPS } from './cityBank5000_part6';
import { CITY_BANK_5000_PART7_GROUPS } from './cityBank5000_part7';
import { CITY_BANK_5000_PART8_GROUPS } from './cityBank5000_part8';
import { CITY_BANK_5000_PART9_GROUPS } from './cityBank5000_part9';
import { CITY_BANK_5000_PART10_GROUPS } from './cityBank5000_part10';
import { CITY_BANK_5000_PART11_GROUPS } from './cityBank5000_part11';
import { CITY_BANK_5000_PART12_GROUPS } from './cityBank5000_part12';
import { CITY_BANK_5000_PART13_GROUPS } from './cityBank5000_part13';
import { getWordLinguisticDetails } from '../utils/flashcardDetailsHelper';

export interface LocalVocabEntry {
  term: string;
  translationFr: string;
  phonetic: string;
  isEstimatedIpa?: boolean;
  partOfSpeech?: string;
  sourceLabel: string;
  matchedForm?: string;
}

interface InternalLexiconRecord {
  term: string;
  translationFr: string;
  phonetic?: string;
  partOfSpeech?: string;
  sourceLabel: string;
  priority: number;
}

/**
 * Lexique fondamental local (mots grammaticaux, verbes fréquents & irréguliers,
 * adverbes, noms et adjectifs courants) avec transcription IPA Oxford/RP vérifiée.
 * Permet un retour instantané 100 % local lors du double-clic sur n'importe quel mot d'une leçon.
 */
const CORE_ENGLISH_IPA_LEXICON: ReadonlyArray<
  readonly [word: string, phonetic: string, translationFr: string, pos?: string]
> = [
  // Articles, déterminants & pronoms
  ['the', '/ðə/', 'le, la, les (article défini)', 'art.'],
  ['a', '/ə/', 'un, une (article indéfini)', 'art.'],
  ['an', '/ən/', 'un, une (devant voyelle)', 'art.'],
  ['this', '/ðɪs/', 'ce, cette, ceci (proche)', 'dét.'],
  ['that', '/ðæt/', 'ce, cette, cela, que / qui', 'dét./conj.'],
  ['these', '/ðiːz/', 'ces (proches)', 'dét.'],
  ['those', '/ðəʊz/', 'ces, ceux-là (éloignés)', 'dét.'],
  ['my', '/maɪ/', 'mon, ma, mes', 'dét.'],
  ['your', '/jɔː/', 'ton, ta, tes / votre, vos', 'dét.'],
  ['his', '/hɪz/', 'son, sa, ses (à lui)', 'dét.'],
  ['her', '/hɜː/', 'son, sa, ses (à elle) / la, lui', 'dét./pron.'],
  ['its', '/ɪts/', 'son, sa, ses (neutre)', 'dét.'],
  ['our', '/ˈaʊə/', 'notre, nos', 'dét.'],
  ['their', '/ðeə/', 'leur, leurs', 'dét.'],
  ['i', '/aɪ/', 'je', 'pron.'],
  ['you', '/juː/', 'tu, vous, te, toi', 'pron.'],
  ['he', '/hiː/', 'il', 'pron.'],
  ['she', '/ʃiː/', 'elle', 'pron.'],
  ['it', '/ɪt/', 'il, elle, cela (neutre)', 'pron.'],
  ['we', '/wiː/', 'nous', 'pron.'],
  ['they', '/ðeɪ/', 'ils, elles', 'pron.'],
  ['me', '/miː/', 'me, moi', 'pron.'],
  ['him', '/hɪm/', 'le, lui', 'pron.'],
  ['us', '/ʌs/', 'nous', 'pron.'],
  ['them', '/ðɛm/', 'les, eux, elles, leur', 'pron.'],
  ['some', '/sʌm/', 'du, de la, des, quelques', 'dét.'],
  ['any', '/ˈɛni/', 'du, des, aucun, n’importe quel', 'dét.'],
  ['no', '/nəʊ/', 'non / aucun(e)', 'adv./dét.'],
  ['yes', '/jɛs/', 'oui', 'adv.'],
  ['every', '/ˈɛvri/', 'chaque, tous les', 'dét.'],
  ['each', '/iːtʃ/', 'chaque, chacun(e)', 'dét.'],
  ['all', '/ɔːl/', 'tout, toute, tous, toutes', 'dét.'],
  ['both', '/bəʊθ/', 'les deux, tous les deux', 'dét.'],
  ['many', '/ˈmɛni/', 'beaucoup de (dénombrable)', 'dét.'],
  ['much', '/mʌtʃ/', 'beaucoup (indénombrable)', 'dét.'],
  ['more', '/mɔː/', 'plus, davantage', 'adv.'],
  ['most', '/məʊst/', 'la plupart / le plus', 'dét./adv.'],
  ['few', '/fjuː/', 'peu de (dénombrable)', 'dét.'],
  ['little', '/ˈlɪtəl/', 'petit(e) / peu de', 'adj./dét.'],
  ['other', '/ˈʌðə/', 'autre', 'adj./pron.'],
  ['another', '/əˈnʌðə/', 'un(e) autre', 'dét./pron.'],
  ['several', '/ˈsɛvrəl/', 'plusieurs', 'dét.'],
  ['such', '/sʌtʃ/', 'tel, telle, si', 'dét.'],
  ['everyone', '/ˈɛvrɪwʌn/', 'tout le monde', 'pron.'],
  ['someone', '/ˈsʌmwʌn/', 'quelqu’un', 'pron.'],
  ['anyone', '/ˈɛnɪwʌn/', 'quelqu’un / n’importe qui', 'pron.'],
  ['nobody', '/ˈnəʊbədi/', 'personne', 'pron.'],
  ['everything', '/ˈɛvrɪθɪŋ/', 'tout', 'pron.'],
  ['something', '/ˈsʌmθɪŋ/', 'quelque chose', 'pron.'],
  ['anything', '/ˈɛnɪθɪŋ/', 'quelque chose / n’importe quoi', 'pron.'],
  ['nothing', '/ˈnʌθɪŋ/', 'rien', 'pron.'],

  // Auxiliaires, modaux & formes irrégulières de be / have / do
  ['be', '/biː/', 'être', 'v.'],
  ['am', '/æm/', 'suis (verbe être)', 'v.'],
  ['is', '/ɪz/', 'est (verbe être)', 'v.'],
  ['are', '/ɑː/', 'es, sommes, êtes, sont (verbe être)', 'v.'],
  ['was', '/wɒz/', 'étais, était (prétérit de be)', 'v.'],
  ['were', '/wɜː/', 'étiez, étaient (prétérit de be)', 'v.'],
  ['been', '/biːn/', 'été (participe passé de be)', 'v.'],
  ['being', '/ˈbiːɪŋ/', 'étant / être (nom)', 'v./n.'],
  ['have', '/hæv/', 'avoir, posséder', 'v.'],
  ['has', '/hæz/', 'a (3e pers. sing. de have)', 'v.'],
  ['had', '/hæd/', 'avait, eu (prétérit / p.p. de have)', 'v.'],
  ['having', '/ˈhævɪŋ/', 'ayant', 'v.'],
  ['do', '/duː/', 'faire / auxiliaire', 'v.'],
  ['does', '/dʌz/', 'fait (3e pers. sing. de do)', 'v.'],
  ['did', '/dɪd/', 'fit, a fait (prétérit de do)', 'v.'],
  ['done', '/dʌn/', 'fait, accompli (participe passé de do)', 'v.'],
  ['can', '/kæn/', 'pouvoir, savoir faire', 'modal'],
  ['could', '/kʊd/', 'pouvait, pourrait (passé/cond. de can)', 'modal'],
  ['will', '/wɪl/', 'auxiliaire du futur / volonté', 'modal'],
  ['would', '/wʊd/', 'auxiliaire du conditionnel', 'modal'],
  ['shall', '/ʃæl/', 'devoir / futur formel', 'modal'],
  ['should', '/ʃʊd/', 'devrait (conseil, obligation)', 'modal'],
  ['may', '/meɪ/', 'pouvoir (permission / probabilité)', 'modal'],
  ['might', '/maɪt/', 'pourrait (éventualité)', 'modal'],
  ['must', '/mʌst/', 'devoir (obligation forte)', 'modal'],
  ["don't", '/dəʊnt/', 'ne ... pas (présent)', 'aux.'],
  ["doesn't", '/ˈdʌzənt/', 'ne ... pas (3e pers. sing.)', 'aux.'],
  ["didn't", '/ˈdɪdənt/', 'n’a pas / ne ... pas (passé)', 'aux.'],
  ["can't", '/kɑːnt/', 'ne peut pas / ne sait pas', 'modal'],
  ["won't", '/wəʊnt/', 'ne ... pas (futur)', 'modal'],
  ["isn't", '/ˈɪzənt/', 'n’est pas', 'v.'],
  ["aren't", '/ɑːnt/', 'ne sont pas', 'v.'],
  ["haven't", '/ˈhævənt/', 'n’ai / n’ont pas', 'v.'],
  ["i'm", '/aɪm/', 'je suis', 'pron.+v.'],
  ["it's", '/ɪts/', 'c’est / il est', 'pron.+v.'],

  // Prépositions & conjonctions
  ['about', '/əˈbaʊt/', 'à propos de, environ', 'prép.'],
  ['above', '/əˈbʌv/', 'au-dessus de', 'prép.'],
  ['across', '/əˈkrɒs/', 'à travers, de l’autre côté de', 'prép.'],
  ['after', '/ˈɑːftə/', 'après', 'prép./conj.'],
  ['against', '/əˈɡɛnst/', 'contre', 'prép.'],
  ['along', '/əˈlɒŋ/', 'le long de', 'prép.'],
  ['although', '/ɔːlˈðəʊ/', 'bien que, quoique', 'conj.'],
  ['among', '/əˈmʌŋ/', 'parmi, entre', 'prép.'],
  ['and', '/ænd/', 'et', 'conj.'],
  ['around', '/əˈraʊnd/', 'autour de, environ', 'prép.'],
  ['as', '/æz/', 'comme, en tant que, tandis que', 'conj./prép.'],
  ['at', '/æt/', 'à, chez, en', 'prép.'],
  ['because', '/bɪˈkɒz/', 'parce que, car', 'conj.'],
  ['before', '/bɪˈfɔː/', 'avant, devant', 'prép./conj.'],
  ['behind', '/bɪˈhaɪnd/', 'derrière', 'prép.'],
  ['below', '/bɪˈləʊ/', 'en dessous de', 'prép.'],
  ['beneath', '/bɪˈniːθ/', 'sous, au-dessous de', 'prép.'],
  ['beside', '/bɪˈsaɪd/', 'à côté de', 'prép.'],
  ['between', '/bɪˈtwiːn/', 'entre', 'prép.'],
  ['beyond', '/bɪˈjɒnd/', 'au-delà de', 'prép.'],
  ['but', '/bʌt/', 'mais, sauf', 'conj.'],
  ['by', '/baɪ/', 'par, près de, d’ici', 'prép.'],
  ['despite', '/dɪˈspaɪt/', 'malgré, en dépit de', 'prép.'],
  ['down', '/daʊn/', 'en bas, vers le bas', 'prép./adv.'],
  ['during', '/ˈdjʊərɪŋ/', 'pendant, durant', 'prép.'],
  ['except', '/ɪkˈsɛpt/', 'excepté, sauf', 'prép.'],
  ['for', '/fɔː/', 'pour, pendant, depuis', 'prép.'],
  ['from', '/frɒm/', 'de, depuis, à partir de', 'prép.'],
  ['however', '/haʊˈɛvə/', 'cependant, toutefois', 'adv.'],
  ['if', '/ɪf/', 'si', 'conj.'],
  ['in', '/ɪn/', 'dans, en', 'prép.'],
  ['inside', '/ɪnˈsaɪd/', 'à l’intérieur de', 'prép.'],
  ['into', '/ˈɪntuː/', 'dans, vers l’intérieur de', 'prép.'],
  ['like', '/laɪk/', 'comme / aimer', 'prép./v.'],
  ['near', '/nɪə/', 'près de, proche', 'prép.'],
  ['of', '/ɒv/', 'de, du, des', 'prép.'],
  ['off', '/ɒf/', 'hors de, éteint', 'prép./adv.'],
  ['on', '/ɒn/', 'sur, le (jour), allumé', 'prép.'],
  ['onto', '/ˈɒntuː/', 'sur (avec mouvement)', 'prép.'],
  ['or', '/ɔː/', 'ou', 'conj.'],
  ['out', '/aʊt/', 'dehors, hors de', 'adv.'],
  ['outside', '/ˌaʊtˈsaɪd/', 'à l’extérieur', 'prép./adv.'],
  ['over', '/ˈəʊvə/', 'au-dessus de, terminé', 'prép.'],
  ['past', '/pɑːst/', 'passé, au-delà de', 'prép./n.'],
  ['since', '/sɪns/', 'depuis, puisque', 'prép./conj.'],
  ['so', '/səʊ/', 'donc, alors, tellement', 'conj./adv.'],
  ['than', '/ðæn/', 'que (comparaison)', 'conj.'],
  ['then', '/ðɛn/', 'puis, ensuite, alors', 'adv.'],
  ['there', '/ðeə/', 'là, là-bas / il y a', 'adv.'],
  ['here', '/hɪə/', 'ici', 'adv.'],
  ['therefore', '/ˈðeəfɔː/', 'par conséquent, donc', 'adv.'],
  ['though', '/ðəʊ/', 'bien que, pourtant', 'conj.'],
  ['through', '/θruː/', 'à travers, par', 'prép.'],
  ['to', '/tuː/', 'à, vers, pour', 'prép.'],
  ['toward', '/təˈwɔːd/', 'vers, envers', 'prép.'],
  ['towards', '/təˈwɔːdz/', 'vers, en direction de', 'prép.'],
  ['under', '/ˈʌndə/', 'sous', 'prép.'],
  ['until', '/ʌnˈtɪl/', 'jusqu’à (ce que)', 'prép./conj.'],
  ['up', '/ʌp/', 'en haut, vers le haut', 'prép./adv.'],
  ['while', '/waɪl/', 'pendant que, tandis que', 'conj.'],
  ['with', '/wɪð/', 'avec', 'prép.'],
  ['within', '/wɪˈðɪn/', 'à l’intérieur de, sous (délai)', 'prép.'],
  ['without', '/wɪˈðaʊt/', 'sans', 'prép.'],
  ['yet', '/jɛt/', 'encore, déjà, pourtant', 'adv./conj.'],

  // Mots interrogatifs & adverbes fréquents
  ['who', '/huː/', 'qui', 'pron.'],
  ['whom', '/huːm/', 'qui, que (complément)', 'pron.'],
  ['whose', '/huːz/', 'à qui, dont', 'pron.'],
  ['which', '/wɪtʃ/', 'quel(le), lequel, qui/que', 'pron.'],
  ['what', '/wɒt/', 'quoi, quel(le), ce que', 'pron.'],
  ['where', '/weə/', 'où', 'adv.'],
  ['when', '/wɛn/', 'quand, lorsque', 'adv./conj.'],
  ['why', '/waɪ/', 'pourquoi', 'adv.'],
  ['how', '/haʊ/', 'comment, combien', 'adv.'],
  ['always', '/ˈɔːlweɪz/', 'toujours', 'adv.'],
  ['usually', '/ˈjuːʒuəli/', 'habituellement, d’habitude', 'adv.'],
  ['often', '/ˈɒfən/', 'souvent', 'adv.'],
  ['sometimes', '/ˈsʌmtaɪmz/', 'parfois, quelquefois', 'adv.'],
  ['rarely', '/ˈreəli/', 'rarement', 'adv.'],
  ['seldom', '/ˈsɛldəm/', 'rarement, guère', 'adv.'],
  ['never', '/ˈnɛvə/', 'jamais', 'adv.'],
  ['already', '/ɔːlˈrɛdi/', 'déjà', 'adv.'],
  ['still', '/stɪl/', 'encore, toujours', 'adv.'],
  ['soon', '/suːn/', 'bientôt', 'adv.'],
  ['now', '/naʊ/', 'maintenant', 'adv.'],
  ['today', '/təˈdeɪ/', 'aujourd’hui', 'adv.'],
  ['tomorrow', '/təˈmɒrəʊ/', 'demain', 'adv.'],
  ['yesterday', '/ˈjɛstədeɪ/', 'hier', 'adv.'],
  ['tonight', '/təˈnaɪt/', 'ce soir', 'adv.'],
  ['again', '/əˈɡɛn/', 'encore, à nouveau', 'adv.'],
  ['almost', '/ˈɔːlməʊst/', 'presque', 'adv.'],
  ['also', '/ˈɔːlsəʊ/', 'aussi, également', 'adv.'],
  ['even', '/ˈiːvən/', 'même', 'adv.'],
  ['just', '/dʒʌst/', 'juste, seulement, venir de', 'adv.'],
  ['only', '/ˈəʊnli/', 'seulement, uniquement', 'adv.'],
  ['quite', '/kwaɪt/', 'assez, tout à fait', 'adv.'],
  ['rather', '/ˈrɑːðə/', 'plutôt, assez', 'adv.'],
  ['really', '/ˈrɪəli/', 'vraiment', 'adv.'],
  ['very', '/ˈvɛri/', 'très', 'adv.'],
  ['too', '/tuː/', 'aussi / trop', 'adv.'],
  ['well', '/wɛl/', 'bien', 'adv.'],
  ['together', '/təˈɡɛðə/', 'ensemble', 'adv.'],
  ['instead', '/ɪnˈstɛd/', 'à la place, au lieu de', 'adv.'],

  // Verbes usuels & formes irrégulières
  ['go', '/ɡəʊ/', 'aller', 'v.'],
  ['went', '/wɛnt/', 'est allé(e) / alla (prétérit de go)', 'v.'],
  ['gone', '/ɡɒn/', 'allé(e), parti(e) (participe passé de go)', 'v.'],
  ['come', '/kʌm/', 'venir', 'v.'],
  ['came', '/keɪm/', 'est venu(e) / vint (prétérit de come)', 'v.'],
  ['see', '/siː/', 'voir', 'v.'],
  ['saw', '/sɔː/', 'a vu / vit (prétérit de see)', 'v.'],
  ['seen', '/siːn/', 'vu(e) (participe passé de see)', 'v.'],
  ['make', '/meɪk/', 'faire, fabriquer', 'v.'],
  ['made', '/meɪd/', 'fait, fabriqué (prétérit/p.p. de make)', 'v.'],
  ['take', '/teɪk/', 'prendre, emmener', 'v.'],
  ['took', '/tʊk/', 'a pris / prit (prétérit de take)', 'v.'],
  ['taken', '/ˈteɪkən/', 'pris(e) (participe passé de take)', 'v.'],
  ['give', '/ɡɪv/', 'donner', 'v.'],
  ['gave', '/ɡeɪv/', 'a donné / donna (prétérit de give)', 'v.'],
  ['given', '/ˈɡɪvən/', 'donné(e) (participe passé de give)', 'v.'],
  ['get', '/ɡɛt/', 'obtenir, recevoir, devenir', 'v.'],
  ['got', '/ɡɒt/', 'obtenu, reçu (prétérit/p.p. de get)', 'v.'],
  ['know', '/nəʊ/', 'savoir, connaître', 'v.'],
  ['knew', '/njuː/', 'savait, a su (prétérit de know)', 'v.'],
  ['known', '/nəʊn/', 'connu(e), su(e) (participe passé de know)', 'v.'],
  ['think', '/θɪŋk/', 'penser, réfléchir', 'v.'],
  ['thought', '/θɔːt/', 'pensé / pensée (prétérit de think)', 'v./n.'],
  ['say', '/seɪ/', 'dire', 'v.'],
  ['said', '/sɛd/', 'a dit / dit (prétérit/p.p. de say)', 'v.'],
  ['tell', '/tɛl/', 'raconter, dire à quelqu’un', 'v.'],
  ['told', '/təʊld/', 'a dit / raconté (prétérit/p.p. de tell)', 'v.'],
  ['ask', '/ɑːsk/', 'demander, poser une question', 'v.'],
  ['answer', '/ˈɑːnsə/', 'répondre / la réponse', 'v./n.'],
  ['speak', '/spiːk/', 'parler', 'v.'],
  ['spoke', '/spəʊk/', 'a parlé / parla (prétérit de speak)', 'v.'],
  ['spoken', '/ˈspəʊkən/', 'parlé(e) (participe passé de speak)', 'v.'],
  ['talk', '/tɔːk/', 'parler, discuter', 'v.'],
  ['listen', '/ˈlɪsən/', 'écouter', 'v.'],
  ['hear', '/hɪə/', 'entendre', 'v.'],
  ['heard', '/hɜːd/', 'entendu (prétérit/p.p. de hear)', 'v.'],
  ['read', '/riːd/', 'lire (passé : /rɛd/)', 'v.'],
  ['write', '/raɪt/', 'écrire', 'v.'],
  ['wrote', '/rəʊt/', 'a écrit / écrivit (prétérit de write)', 'v.'],
  ['written', '/ˈrɪtən/', 'écrit(e) (participe passé de write)', 'v.'],
  ['learn', '/lɜːn/', 'apprendre', 'v.'],
  ['study', '/ˈstʌdi/', 'étudier / l’étude', 'v./n.'],
  ['teach', '/tiːtʃ/', 'enseigner', 'v.'],
  ['taught', '/tɔːt/', 'enseigné (prétérit/p.p. de teach)', 'v.'],
  ['understand', '/ˌʌndəˈstænd/', 'comprendre', 'v.'],
  ['understood', '/ˌʌndəˈstʊd/', 'compris (prétérit/p.p. de understand)', 'v.'],
  ['remember', '/rɪˈmɛmbə/', 'se souvenir de, retenir', 'v.'],
  ['forget', '/fəˈɡɛt/', 'oublier', 'v.'],
  ['forgot', '/fəˈɡɒt/', 'a oublié (prétérit de forget)', 'v.'],
  ['believe', '/bɪˈliːv/', 'croire', 'v.'],
  ['feel', '/fiːl/', 'sentir, ressentir', 'v.'],
  ['felt', '/fɛlt/', 'ressenti (prétérit/p.p. de feel)', 'v.'],
  ['want', '/wɒnt/', 'vouloir', 'v.'],
  ['need', '/niːd/', 'avoir besoin de / besoin', 'v./n.'],
  ['love', '/lʌv/', 'aimer, adorer / amour', 'v./n.'],
  ['prefer', '/prɪˈfɜː/', 'préférer', 'v.'],
  ['hope', '/həʊp/', 'espérer / espoir', 'v./n.'],
  ['try', '/traɪ/', 'essayer, tenter', 'v.'],
  ['start', '/stɑːt/', 'commencer, démarrer', 'v.'],
  ['begin', '/bɪˈɡɪn/', 'commencer, débuter', 'v.'],
  ['began', '/bɪˈɡæn/', 'a commencé (prétérit de begin)', 'v.'],
  ['stop', '/stɒp/', 'arrêter, s’arrêter', 'v.'],
  ['finish', '/ˈfɪnɪʃ/', 'finir, terminer', 'v.'],
  ['continue', '/kənˈtɪnjuː/', 'continuer', 'v.'],
  ['work', '/wɜːk/', 'travailler / le travail', 'v./n.'],
  ['play', '/pleɪ/', 'jouer / pièce de théâtre', 'v./n.'],
  ['live', '/lɪv/', 'vivre, habiter', 'v.'],
  ['stay', '/steɪ/', 'rester, séjourner', 'v.'],
  ['leave', '/liːv/', 'partir, quitter, laisser', 'v.'],
  ['left', '/lɛft/', 'parti / gauche (prétérit de leave)', 'v./adj.'],
  ['arrive', '/əˈraɪv/', 'arriver', 'v.'],
  ['travel', '/ˈtrævəl/', 'voyager / voyage', 'v./n.'],
  ['visit', '/ˈvɪzɪt/', 'visiter, rendre visite', 'v.'],
  ['walk', '/wɔːk/', 'marcher, se promener', 'v.'],
  ['run', '/rʌn/', 'courir', 'v.'],
  ['ran', '/ræn/', 'a couru (prétérit de run)', 'v.'],
  ['sleep', '/sliːp/', 'dormir / le sommeil', 'v./n.'],
  ['slept', '/slɛpt/', 'a dormi (prétérit/p.p. de sleep)', 'v.'],
  ['wake', '/weɪk/', 'réveiller, se réveiller', 'v.'],
  ['eat', '/iːt/', 'manger', 'v.'],
  ['ate', '/ɛt/', 'a mangé (prétérit de eat)', 'v.'],
  ['drink', '/drɪŋk/', 'boire / boisson', 'v./n.'],
  ['buy', '/baɪ/', 'acheter', 'v.'],
  ['bought', '/bɔːt/', 'acheté (prétérit/p.p. de buy)', 'v.'],
  ['pay', '/peɪ/', 'payer', 'v.'],
  ['paid', '/peɪd/', 'payé (prétérit/p.p. de pay)', 'v.'],
  ['spend', '/spɛnd/', 'dépenser, passer (du temps)', 'v.'],
  ['spent', '/spɛnt/', 'dépensé, passé (prétérit de spend)', 'v.'],
  ['find', '/faɪnd/', 'trouver', 'v.'],
  ['found', '/faʊnd/', 'trouvé (prétérit/p.p. de find)', 'v.'],
  ['lose', '/luːz/', 'perdre', 'v.'],
  ['lost', '/lɒst/', 'perdu (prétérit/p.p. de lose)', 'v.'],
  ['keep', '/kiːp/', 'garder, conserver', 'v.'],
  ['kept', '/kɛpt/', 'gardé (prétérit/p.p. de keep)', 'v.'],
  ['bring', '/brɪŋ/', 'apporter, amener', 'v.'],
  ['brought', '/brɔːt/', 'apporté (prétérit/p.p. de bring)', 'v.'],
  ['send', '/sɛnd/', 'envoyer', 'v.'],
  ['sent', '/sɛnt/', 'envoyé (prétérit/p.p. de send)', 'v.'],
  ['put', '/pʊt/', 'mettre, poser', 'v.'],
  ['show', '/ʃəʊ/', 'montrer / spectacle', 'v./n.'],
  ['open', '/ˈəʊpən/', 'ouvrir / ouvert(e)', 'v./adj.'],
  ['close', '/kləʊz/', 'fermer / proche (/kləʊs/)', 'v./adj.'],
  ['move', '/muːv/', 'bouger, déménager', 'v.'],
  ['change', '/tʃeɪndʒ/', 'changer / changement', 'v./n.'],
  ['build', '/bɪld/', 'construire', 'v.'],
  ['built', '/bɪlt/', 'construit (prétérit/p.p. de build)', 'v.'],
  ['create', '/kriˈeɪt/', 'créer', 'v.'],
  ['help', '/hɛlp/', 'aider / l’aide', 'v./n.'],
  ['use', '/juːz/', 'utiliser / usage (/juːs/)', 'v./n.'],
  ['watch', '/wɒtʃ/', 'regarder / montre', 'v./n.'],
  ['look', '/lʊk/', 'regarder / paraître', 'v.'],
  ['seem', '/siːm/', 'sembler, paraître', 'v.'],
  ['appear', '/əˈpɪə/', 'apparaître, sembler', 'v.'],
  ['become', '/bɪˈkʌm/', 'devenir', 'v.'],
  ['became', '/bɪˈkeɪm/', 'est devenu (prétérit de become)', 'v.'],
  ['happen', '/ˈhæpən/', 'arriver, se produire', 'v.'],
  ['mean', '/miːn/', 'signifier, vouloir dire', 'v.'],
  ['meant', '/mɛnt/', 'signifiait (prétérit/p.p. de mean)', 'v.'],
  ['allow', '/əˈlaʊ/', 'permettre, autoriser', 'v.'],
  ['win', '/wɪn/', 'gagner, remporter', 'v.'],
  ['won', '/wʌn/', 'a gagné (prétérit/p.p. de win)', 'v.'],

  // Noms, adjectifs et repères courants
  ['time', '/taɪm/', 'le temps, l’heure, la fois', 'n.'],
  ['day', '/deɪ/', 'le jour, la journée', 'n.'],
  ['week', '/wiːk/', 'la semaine', 'n.'],
  ['month', '/mʌnθ/', 'le mois', 'n.'],
  ['year', '/jɪə/', 'l’année, l’an', 'n.'],
  ['morning', '/ˈmɔːnɪŋ/', 'le matin, la matinée', 'n.'],
  ['afternoon', '/ˌɑːftəˈnuːn/', 'l’après-midi', 'n.'],
  ['evening', '/ˈiːvnɪŋ/', 'le soir, la soirée', 'n.'],
  ['night', '/naɪt/', 'la nuit', 'n.'],
  ['hour', '/ˈaʊə/', 'l’heure', 'n.'],
  ['minute', '/ˈmɪnɪt/', 'la minute', 'n.'],
  ['people', '/ˈpiːpəl/', 'les gens, le peuple', 'n.'],
  ['person', '/ˈpɜːsən/', 'la personne', 'n.'],
  ['man', '/mæn/', 'l’homme', 'n.'],
  ['men', '/mɛn/', 'les hommes', 'n.'],
  ['woman', '/ˈwʊmən/', 'la femme', 'n.'],
  ['women', '/ˈwɪmɪn/', 'les femmes', 'n.'],
  ['child', '/tʃaɪld/', 'l’enfant', 'n.'],
  ['children', '/ˈtʃɪldrən/', 'les enfants', 'n.'],
  ['friend', '/frɛnd/', 'l’ami(e)', 'n.'],
  ['family', '/ˈfæmɪli/', 'la famille', 'n.'],
  ['mother', '/ˈmʌðə/', 'la mère', 'n.'],
  ['father', '/ˈfɑːðə/', 'le père', 'n.'],
  ['brother', '/ˈbrʌðə/', 'le frère', 'n.'],
  ['sister', '/ˈsɪstə/', 'la sœur', 'n.'],
  ['teacher', '/ˈtiːtʃə/', 'le professeur, l’enseignant(e)', 'n.'],
  ['student', '/ˈstjuːdənt/', 'l’étudiant(e), l’élève', 'n.'],
  ['school', '/skuːl/', 'l’école, le collège/lycée', 'n.'],
  ['class', '/klɑːs/', 'la classe, le cours', 'n.'],
  ['lesson', '/ˈlɛsən/', 'la leçon, le cours', 'n.'],
  ['book', '/bʊk/', 'le livre', 'n.'],
  ['word', '/wɜːd/', 'le mot', 'n.'],
  ['sentence', '/ˈsɛntəns/', 'la phrase', 'n.'],
  ['question', '/ˈkwɛstʃən/', 'la question', 'n.'],
  ['story', '/ˈstɔːri/', 'l’histoire, le récit', 'n.'],
  ['language', '/ˈlæŋɡwɪdʒ/', 'la langue, le langage', 'n.'],
  ['english', '/ˈɪŋɡlɪʃ/', 'anglais(e) / la langue anglaise', 'adj./n.'],
  ['french', '/frɛntʃ/', 'français(e)', 'adj./n.'],
  ['home', '/həʊm/', 'la maison, le foyer, chez soi', 'n.'],
  ['house', '/haʊs/', 'la maison', 'n.'],
  ['room', '/ruːm/', 'la pièce, la chambre, la salle', 'n.'],
  ['city', '/ˈsɪti/', 'la ville, la cité', 'n.'],
  ['town', '/taʊn/', 'la ville (moyenne)', 'n.'],
  ['country', '/ˈkʌntri/', 'le pays / la campagne', 'n.'],
  ['world', '/wɜːld/', 'le monde', 'n.'],
  ['place', '/pleɪs/', 'le lieu, l’endroit, la place', 'n.'],
  ['way', '/weɪ/', 'le chemin, la façon, la manière', 'n.'],
  ['life', '/laɪf/', 'la vie', 'n.'],
  ['money', '/ˈmʌni/', 'l’argent', 'n.'],
  ['food', '/fuːd/', 'la nourriture', 'n.'],
  ['water', '/ˈwɔːtə/', 'l’eau', 'n.'],
  ['tea', '/tiː/', 'le thé', 'n.'],
  ['coffee', '/ˈkɒfi/', 'le café', 'n.'],
  ['music', '/ˈmjuːzɪk/', 'la musique', 'n.'],
  ['idea', '/aɪˈdɪə/', 'l’idée', 'n.'],
  ['problem', '/ˈprɒbləm/', 'le problème', 'n.'],
  ['fact', '/fækt/', 'le fait', 'n.'],
  ['reason', '/ˈriːzən/', 'la raison', 'n.'],
  ['example', '/ɪɡˈzɑːmpəl/', 'l’exemple', 'n.'],
  ['difference', '/ˈdɪfrəns/', 'la différence', 'n.'],
  ['result', '/rɪˈzʌlt/', 'le résultat', 'n.'],
  ['level', '/ˈlɛvəl/', 'le niveau', 'n.'],
  ['future', '/ˈfjuːtʃə/', 'le futur, l’avenir', 'n./adj.'],
  ['good', '/ɡʊd/', 'bon(ne), bien', 'adj.'],
  ['better', '/ˈbɛtə/', 'meilleur(e), mieux', 'adj./adv.'],
  ['best', '/bɛst/', 'le meilleur, le mieux', 'adj./adv.'],
  ['bad', '/bæd/', 'mauvais(e)', 'adj.'],
  ['worse', '/wɜːs/', 'pire, plus mauvais', 'adj.'],
  ['worst', '/wɜːst/', 'le pire', 'adj.'],
  ['big', '/bɪɡ/', 'grand(e), gros(se)', 'adj.'],
  ['small', '/smɔːl/', 'petit(e)', 'adj.'],
  ['large', '/lɑːdʒ/', 'grand(e), vaste', 'adj.'],
  ['long', '/lɒŋ/', 'long(ue)', 'adj.'],
  ['short', '/ʃɔːt/', 'court(e), petit(e) de taille', 'adj.'],
  ['high', '/haɪ/', 'haut(e), élevé(e)', 'adj.'],
  ['low', '/ləʊ/', 'bas(se), faible', 'adj.'],
  ['new', '/njuː/', 'nouveau, nouvelle, neuf', 'adj.'],
  ['old', '/əʊld/', 'vieux, vieille, âgé(e)', 'adj.'],
  ['young', '/jʌŋ/', 'jeune', 'adj.'],
  ['great', '/ɡreɪt/', 'génial(e), grand(e), formidable', 'adj.'],
  ['important', '/ɪmˈpɔːtənt/', 'important(e)', 'adj.'],
  ['different', '/ˈdɪfrənt/', 'différent(e)', 'adj.'],
  ['possible', '/ˈpɒsəbəl/', 'possible', 'adj.'],
  ['easy', '/ˈiːzi/', 'facile', 'adj.'],
  ['difficult', '/ˈdɪfɪkəlt/', 'difficile', 'adj.'],
  ['hard', '/hɑːd/', 'dur(e), difficile', 'adj.'],
  ['clear', '/klɪə/', 'clair(e), limpide', 'adj.'],
  ['true', '/truː/', 'vrai(e)', 'adj.'],
  ['false', '/fɔːls/', 'faux, fausse', 'adj.'],
  ['real', '/rɪəl/', 'réel(le), véritable', 'adj.'],
  ['sure', '/ʃʊə/', 'sûr(e), certain(e)', 'adj.'],
  ['ready', '/ˈrɛdi/', 'prêt(e)', 'adj.'],
  ['happy', '/ˈhæpi/', 'heureux, heureuse, content(e)', 'adj.'],
  ['sad', '/sæd/', 'triste', 'adj.'],
  ['tired', '/ˈtaɪəd/', 'fatigué(e)', 'adj.'],
  ['busy', '/ˈbɪzi/', 'occupé(e)', 'adj.'],
  ['free', '/friː/', 'libre, gratuit(e)', 'adj.'],
  ['right', '/raɪt/', 'juste, correct / droit(e)', 'adj./n.'],
  ['wrong', '/rɒŋ/', 'faux, erroné / tort', 'adj.'],
  ['same', '/seɪm/', 'même, identique', 'adj.'],
  ['nice', '/naɪs/', 'sympa, agréable, joli(e)', 'adj.'],
  ['kind', '/kaɪnd/', 'gentil(le), bienveillant(e) / sorte', 'adj./n.'],
  ['beautiful', '/ˈbjuːtɪfəl/', 'beau, belle, magnifique', 'adj.'],
  ['interesting', '/ˈɪntrəstɪŋ/', 'intéressant(e)', 'adj.'],
  ['famous', '/ˈfeɪməs/', 'célèbre, fameux(se)', 'adj.'],
  ['early', '/ˈɜːli/', 'tôt, matinal, en avance', 'adv./adj.'],
  ['late', '/leɪt/', 'tard, en retard', 'adv./adj.'],
  ['first', '/fɜːst/', 'premier(ère), d’abord', 'adj./adv.'],
  ['second', '/ˈsɛkənd/', 'deuxième / seconde', 'adj./n.'],
  ['next', '/nɛkst/', 'suivant(e), prochain(e)', 'adj.'],
  ['last', '/lɑːst/', 'dernier(ère) / durer', 'adj./v.'],
  ['one', '/wʌn/', 'un, une', 'num.'],
  ['two', '/tuː/', 'deux', 'num.'],
  ['three', '/θriː/', 'trois', 'num.'],
  ['four', '/fɔː/', 'quatre', 'num.'],
  ['five', '/faɪv/', 'cinq', 'num.'],
  ['six', '/sɪks/', 'six', 'num.'],
  ['seven', '/ˈsɛvən/', 'sept', 'num.'],
  ['eight', '/eɪt/', 'huit', 'num.'],
  ['nine', '/naɪn/', 'neuf', 'num.'],
  ['ten', '/tɛn/', 'dix', 'num.'],
  ['monday', '/ˈmʌndeɪ/', 'lundi', 'n.'],
  ['tuesday', '/ˈtjuːzdeɪ/', 'mardi', 'n.'],
  ['wednesday', '/ˈwɛnzdeɪ/', 'mercredi', 'n.'],
  ['thursday', '/ˈθɜːzdeɪ/', 'jeudi', 'n.'],
  ['friday', '/ˈfraɪdeɪ/', 'vendredi', 'n.'],
  ['saturday', '/ˈsætədeɪ/', 'samedi', 'n.'],
  ['sunday', '/ˈsʌndeɪ/', 'dimanche', 'n.'],
  ['london', '/ˈlʌndən/', 'Londres', 'n.'],
  ['oxford', '/ˈɒksfəd/', 'Oxford', 'n.'],
  ['cambridge', '/ˈkeɪmbrɪdʒ/', 'Cambridge', 'n.']
];

function cleanLookupKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/^[^a-z]+|[^a-z]+$/g, '');
}

function formatIpa(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') && trimmed.endsWith('/')) return trimmed;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

const IPA_DIGRAPHS: ReadonlyArray<readonly [string, string]> = [
  ['tion', 'ʃən'],
  ['sion', 'ʒən'],
  ['cious', 'ʃəs'],
  ['tious', 'ʃəs'],
  ['ough', 'ɔː'],
  ['aught', 'ɔːt'],
  ['ought', 'ɔːt'],
  ['igh', 'aɪ'],
  ['eigh', 'eɪ'],
  ['ph', 'f'],
  ['sh', 'ʃ'],
  ['ch', 'tʃ'],
  ['th', 'θ'],
  ['ng', 'ŋ'],
  ['qu', 'kw'],
  ['ck', 'k'],
  ['ee', 'iː'],
  ['ea', 'iː'],
  ['oo', 'uː'],
  ['ai', 'eɪ'],
  ['ay', 'eɪ'],
  ['oa', 'əʊ'],
  ['oi', 'ɔɪ'],
  ['oy', 'ɔɪ'],
  ['ou', 'aʊ'],
  ['au', 'ɔː'],
  ['aw', 'ɔː'],
  ['ar', 'ɑː'],
  ['or', 'ɔː'],
  ['er', 'ɜː'],
  ['ir', 'ɜː'],
  ['ur', 'ɜː'],
  ['ow', 'aʊ'],
  ['ew', 'juː']
];

/**
 * Estimateur graphème -> IPA anglais sans collision entre symboles IPA et lettres ASCII.
 */
export function estimateEnglishIpa(rawWord: string): string {
  const clean = rawWord.trim().toLowerCase().replace(/[^a-z']/g, '');
  if (!clean) return '';

  let s = clean.replace(/'s$/, 'z').replace(/'$/, '');
  if (s.startsWith('kn')) s = `n${s.slice(2)}`;
  if (s.startsWith('wr')) s = `r${s.slice(2)}`;

  // Retirer un -e muet final simple (sans casser "ee", "le", ou mots courts)
  if (s.length > 3 && s.endsWith('e') && !s.endsWith('ee') && !s.endsWith('le') && !/[aeiou]e$/.test(s)) {
    s = s.slice(0, -1);
  }

  let out = '';
  let i = 0;
  while (i < s.length) {
    // Fin de mot fréquentes
    if (s.slice(i) === 'er' && i > 1) {
      out += 'ə';
      i += 2;
      continue;
    }
    if (s.slice(i) === 'ow' && i > 1) {
      out += 'əʊ';
      i += 2;
      continue;
    }
    if (s.slice(i) === 'le' && i > 1) {
      out += 'əl';
      i += 2;
      continue;
    }
    if (s.slice(i) === 'ly' && i > 1) {
      out += 'li';
      i += 2;
      continue;
    }

    let matched = false;
    for (const [pat, ipa] of IPA_DIGRAPHS) {
      if (s.startsWith(pat, i)) {
        out += ipa;
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = s[i];
    const next = s[i + 1] || '';
    if (ch === next && /[bcdfghjklmnpqrstvwxyz]/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === 'c') out += /[eiy]/.test(next) ? 's' : 'k';
    else if (ch === 'g') out += /[ei]/.test(next) ? 'dʒ' : 'ɡ';
    else if (ch === 'j') out += 'dʒ';
    else if (ch === 'x') out += 'ks';
    else if (ch === 'y') out += i === 0 ? 'j' : 'i';
    else if (ch === 'a') out += 'æ';
    else if (ch === 'e') out += 'ɛ';
    else if (ch === 'i') out += 'ɪ';
    else if (ch === 'o') out += 'ɒ';
    else if (ch === 'u') out += 'ʌ';
    else if (ch !== "'") out += ch;

    i += 1;
  }

  return `/${out}/`;
}

function deriveInflectedIpa(basePhonetic: string | undefined, word: string, stem: string): {
  phonetic: string;
  isEstimated: boolean;
} {
  if (!basePhonetic) {
    return { phonetic: estimateEnglishIpa(word), isEstimated: true };
  }
  const cleanBase = formatIpa(basePhonetic).replace(/^\/|\/$/g, '');
  const suffix = word.slice(stem.length);
  if (!suffix || suffix === "'s" || suffix === 's') {
    return { phonetic: `/${cleanBase}z/`, isEstimated: true };
  }
  if (suffix === 'es' || word.endsWith('ies')) {
    return { phonetic: `/${cleanBase}z/`, isEstimated: true };
  }
  if (suffix === 'd' || suffix === 'ed' || word.endsWith('ied')) {
    return { phonetic: `/${cleanBase}d/`, isEstimated: true };
  }
  if (suffix === 'ing') {
    return { phonetic: `/${cleanBase}ɪŋ/`, isEstimated: true };
  }
  if (suffix === 'ly') {
    return { phonetic: `/${cleanBase}li/`, isEstimated: true };
  }
  return { phonetic: formatIpa(basePhonetic), isEstimated: true };
}

function generateStemCandidates(word: string): string[] {
  const candidates: string[] = [];
  if (word.endsWith("'s") && word.length > 3) candidates.push(word.slice(0, -2));
  if (word.endsWith('ies') && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith('ied') && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith('es') && word.length > 3) candidates.push(word.slice(0, -2));
  if (word.endsWith('s') && word.length > 3) candidates.push(word.slice(0, -1));
  if (word.endsWith('ing') && word.length > 5) {
    const base = word.slice(0, -3);
    candidates.push(base, `${base}e`);
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      candidates.push(base.slice(0, -1));
    }
  }
  if (word.endsWith('ed') && word.length > 4) {
    const base = word.slice(0, -2);
    candidates.push(base, `${base}e`);
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      candidates.push(base.slice(0, -1));
    }
  }
  if (word.endsWith('er') && word.length > 4) {
    const base = word.slice(0, -2);
    candidates.push(base, `${base}e`);
  }
  if (word.endsWith('est') && word.length > 5) {
    const base = word.slice(0, -3);
    candidates.push(base, `${base}e`);
  }
  if (word.endsWith('ly') && word.length > 4) {
    const base = word.slice(0, -2);
    candidates.push(base);
    if (base.endsWith('i')) candidates.push(`${base.slice(0, -1)}y`);
  }
  return Array.from(new Set(candidates.filter((c) => c.length >= 2)));
}

let cachedIndex: Map<string, InternalLexiconRecord> | null = null;

function upsertRecord(
  map: Map<string, InternalLexiconRecord>,
  rawTerm: string,
  record: InternalLexiconRecord
) {
  const key = cleanLookupKey(rawTerm.replace(/^to\s+/i, ''));
  if (!key || key.length < 1) return;
  const existing = map.get(key);
  if (!existing) {
    map.set(key, record);
    return;
  }
  // Conserver l'entrée la plus prioritaire, tout en complétant un IPA manquant si disponible
  const mergedPhonetic = existing.phonetic || record.phonetic;
  if (record.priority > existing.priority) {
    map.set(key, { ...record, phonetic: record.phonetic || existing.phonetic });
  } else if (!existing.phonetic && mergedPhonetic) {
    map.set(key, { ...existing, phonetic: mergedPhonetic });
  }
}

function getUnifiedLocalIndex(): Map<string, InternalLexiconRecord> {
  if (cachedIndex) return cachedIndex;

  const map = new Map<string, InternalLexiconRecord>();

  // 1. Lexique fondamental avec IPA vérifié
  for (const [word, ipa, fr, pos] of CORE_ENGLISH_IPA_LEXICON) {
    upsertRecord(map, word, {
      term: word,
      translationFr: fr,
      phonetic: ipa,
      partOfSpeech: pos,
      sourceLabel: 'Base lexicale locale',
      priority: 90
    });
  }

  // 2. 2 280 termes des 200 leçons du cursus (tous avec IPA vérifié)
  for (const lesson of ALL_SCHOOL_LESSONS) {
    for (const v of lesson.vocabulary || []) {
      const cleanTerm = v.term.replace(/\s*\([^)]*\)$/, '').trim();
      upsertRecord(map, cleanTerm, {
        term: cleanTerm,
        translationFr: v.translation_fr,
        phonetic: v.phonetic,
        partOfSpeech: v.part_of_speech,
        sourceLabel: 'Cursus scolaire local',
        priority: 85
      });

      // Indexer aussi sans le "to " ou les mots isolés d'une locution si absents
      const stripped = cleanTerm.replace(/^to\s+/i, '').trim();
      if (stripped !== cleanTerm) {
        upsertRecord(map, stripped, {
          term: cleanTerm,
          translationFr: v.translation_fr,
          phonetic: v.phonetic,
          partOfSpeech: v.part_of_speech,
          sourceLabel: 'Cursus scolaire local',
          priority: 84
        });
      }
    }
  }

  // 3. 500 cartes de répétition espacée (avec IPA vérifié)
  for (const card of SPACED_REPETITION_500) {
    upsertRecord(map, card.term, {
      term: card.term,
      translationFr: card.frenchDef,
      phonetic: card.phonetic,
      partOfSpeech: card.category,
      sourceLabel: 'Répertoire 500 local',
      priority: 80
    });
  }

  // 4. Curiosités & Dictées classiques (avec IPA vérifié)
  for (const curio of CURIOSITIES) {
    upsertRecord(map, curio.term, {
      term: curio.term,
      translationFr: curio.frenchDef,
      phonetic: curio.phonetic,
      partOfSpeech: curio.level,
      sourceLabel: 'Cabinet de curiosités',
      priority: 88
    });
  }
  for (const dict of CLASSIC_DICTATION_ITEMS) {
    if (dict.targetWord && dict.frenchDef) {
      upsertRecord(map, dict.targetWord, {
        term: dict.targetWord,
        translationFr: dict.frenchDef,
        phonetic: dict.phonetic,
        partOfSpeech: dict.level,
        sourceLabel: 'Lexique dictée local',
        priority: 82
      });
    }
  }

  // 5. Banque 5000+ (Parts 1..13)
  const rawLines = CITY_BANK_5000_PART1_RAW.split('\n');
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const parts = trimmed.split('|');
    if (parts.length < 6 || parts[0] !== 'vocab') continue;
    const enWord = parts[3].replace(/\s*\([^)]*\)$/, '').trim();
    const frAns = parts[5].trim();
    if (enWord && frAns && !enWord.includes('___')) {
      upsertRecord(map, enWord, {
        term: enWord,
        translationFr: frAns,
        sourceLabel: 'Banque lexicale locale',
        priority: 65
      });
    }
  }

  const allGroups: CompactVocabGroup[] = [
    ...CITY_BANK_5000_PART1_GROUPS,
    ...CITY_BANK_5000_PART2_GROUPS,
    ...CITY_BANK_5000_PART3_GROUPS,
    ...CITY_BANK_5000_PART4_GROUPS,
    ...CITY_BANK_5000_PART5_GROUPS,
    ...CITY_BANK_5000_PART6_GROUPS,
    ...CITY_BANK_5000_PART7_GROUPS,
    ...CITY_BANK_5000_PART8_GROUPS,
    ...CITY_BANK_5000_PART9_GROUPS,
    ...CITY_BANK_5000_PART10_GROUPS,
    ...CITY_BANK_5000_PART11_GROUPS,
    ...CITY_BANK_5000_PART12_GROUPS,
    ...CITY_BANK_5000_PART13_GROUPS
  ];

  for (const grp of allGroups) {
    for (const [colA, colB, colC] of grp.items) {
      if (grp.kind === 'en_fr') {
        const en = colA.replace(/\s*\([^)]*\)$/, '').trim();
        const fr = colB.replace(/\s*\([^)]*\)$/, '').trim();
        if (en && fr) {
          upsertRecord(map, en, {
            term: en,
            translationFr: fr,
            sourceLabel: 'Banque lexicale locale',
            priority: 65
          });
        }
      } else if (grp.kind === 'fr_en') {
        const fr = colA.replace(/\s*\([^)]*\)$/, '').trim();
        const en = colB.replace(/\s*\([^)]*\)$/, '').trim();
        if (en && fr && !en.includes(' ')) {
          upsertRecord(map, en, {
            term: en,
            translationFr: fr,
            sourceLabel: 'Banque lexicale locale',
            priority: 60
          });
        }
      } else if (grp.kind === 'word_find') {
        const en = colA.trim().toLowerCase();
        const fr = colB.trim();
        const ipa = colC && colC.includes('/') ? colC.trim() : undefined;
        if (en && fr) {
          upsertRecord(map, en, {
            term: en,
            translationFr: fr,
            phonetic: ipa,
            sourceLabel: 'Banque lexicale locale',
            priority: ipa ? 75 : 58
          });
        }
      }
    }
  }

  cachedIndex = map;
  return map;
}

function findInLessonVocabulary(
  key: string,
  lessonVocabulary?: SchoolVocabularyItem[]
): SchoolVocabularyItem | undefined {
  if (!lessonVocabulary || lessonVocabulary.length === 0) return undefined;
  return lessonVocabulary.find((v) => {
    const t = cleanLookupKey(v.term);
    const tNoTo = cleanLookupKey(v.term.replace(/^to\s+/i, ''));
    return t === key || tNoTo === key;
  });
}

/**
 * Recherche instantanée (0 ms, 100 % locale) de la traduction française et de la transcription IPA
 * pour tout mot double-cliqué dans une leçon.
 */
export function lookupLocalWord(
  rawWord: string,
  lessonVocabulary?: SchoolVocabularyItem[]
): LocalVocabEntry | null {
  const displayWord = rawWord.trim().replace(/^[^a-zA-Z'’-]+|[^a-zA-Z'’-]+$/g, '');
  const key = cleanLookupKey(displayWord);
  if (!key || key.length < 1) return null;

  const index = getUnifiedLocalIndex();

  // 1. Correspondance directe dans le vocabulaire de la leçon active
  const directLesson = findInLessonVocabulary(key, lessonVocabulary);
  if (directLesson) {
    return {
      term: displayWord,
      translationFr: directLesson.translation_fr,
      phonetic: formatIpa(directLesson.phonetic) || estimateEnglishIpa(displayWord),
      isEstimatedIpa: !directLesson.phonetic,
      partOfSpeech: directLesson.part_of_speech,
      sourceLabel: 'Vocabulaire de la leçon'
    };
  }

  // 2. Correspondance directe dans la base locale unifiée
  const directGlobal = index.get(key);
  if (directGlobal) {
    const hasVerifiedIpa = Boolean(directGlobal.phonetic);
    return {
      term: displayWord,
      translationFr: directGlobal.translationFr,
      phonetic: hasVerifiedIpa
        ? formatIpa(directGlobal.phonetic)
        : estimateEnglishIpa(displayWord),
      isEstimatedIpa: !hasVerifiedIpa,
      partOfSpeech: directGlobal.partOfSpeech,
      sourceLabel: directGlobal.sourceLabel
    };
  }

  // 3. Recherche morphologique (pluriels, passés -ed, -ing, -ly, comparatifs)
  const stems = generateStemCandidates(key);
  for (const stem of stems) {
    const stemLesson = findInLessonVocabulary(stem, lessonVocabulary);
    if (stemLesson) {
      const inflected = deriveInflectedIpa(stemLesson.phonetic, key, stem);
      return {
        term: displayWord,
        translationFr: stemLesson.translation_fr,
        phonetic: inflected.phonetic,
        isEstimatedIpa: inflected.isEstimated,
        partOfSpeech: stemLesson.part_of_speech,
        sourceLabel: 'Vocabulaire de la leçon',
        matchedForm: stemLesson.term
      };
    }

    const stemGlobal = index.get(stem);
    if (stemGlobal) {
      const inflected = deriveInflectedIpa(stemGlobal.phonetic, key, stem);
      return {
        term: displayWord,
        translationFr: stemGlobal.translationFr,
        phonetic: inflected.phonetic,
        isEstimatedIpa: inflected.isEstimated,
        partOfSpeech: stemGlobal.partOfSpeech,
        sourceLabel: stemGlobal.sourceLabel,
        matchedForm: stemGlobal.term
      };
    }
  }

  // 4. Fallback phonétique + catégorie grammaticale locale si absent du lexique
  const details = getWordLinguisticDetails(displayWord, '', '');
  return {
    term: displayWord,
    translationFr: `Terme anglais (${details.partOfSpeech.label.toLowerCase()})`,
    phonetic: estimateEnglishIpa(displayWord),
    isEstimatedIpa: true,
    partOfSpeech: details.partOfSpeech.code,
    sourceLabel: 'Analyse phonétique locale'
  };
}

export function getLocalVocabularyStats(): { totalIndexedEntries: number } {
  const index = getUnifiedLocalIndex();
  return { totalIndexedEntries: index.size };
}
