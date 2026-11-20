import {
  DIALOGUE_THEMES,
  DIALOGUE_FORMATS,
  DIALOGUE_LEVELS,
  type DialogueThemeId,
  type DialogueFormatId,
  type DialogueLevelId,
  type DialogueSpeaker,
  type DialogueTurn,
  type DialogueKeyCard,
  type AtelierDialogue,
  type ScenarioBlueprint
} from './atelierDialoguesTypes';
import {
  SCENARIOS_VIE_QUOTIDIENNE,
  SCENARIOS_LOISIRS,
  SCENARIOS_METIER
} from './atelierDialoguesScenariosPart1';
import {
  SCENARIOS_BUSINESS,
  SCENARIOS_VOYAGE,
  SCENARIOS_GASTRONOMIE
} from './atelierDialoguesScenariosPart2';

export * from './atelierDialoguesTypes';

const THEME_BLUEPRINTS: Record<DialogueThemeId, ScenarioBlueprint[]> = {
  vie_quotidienne: SCENARIOS_VIE_QUOTIDIENNE,
  loisirs: SCENARIOS_LOISIRS,
  metier: SCENARIOS_METIER,
  business: SCENARIOS_BUSINESS,
  voyage: SCENARIOS_VOYAGE,
  gastronomie: SCENARIOS_GASTRONOMIE
};

// Exact distribution summing to 500 dialogues across all 6 user-requested themes
const THEME_QUOTAS: Array<{ id: DialogueThemeId; count: number }> = [
  { id: 'vie_quotidienne', count: 84 },
  { id: 'loisirs', count: 83 },
  { id: 'metier', count: 83 },
  { id: 'business', count: 83 },
  { id: 'voyage', count: 84 },
  { id: 'gastronomie', count: 83 }
];

const CONTEXT_CITIES = [
  { en: 'London', fr: 'Londres' },
  { en: 'Oxford', fr: 'Oxford' },
  { en: 'Edinburgh', fr: 'Édimbourg' },
  { en: 'New York', fr: 'New York' },
  { en: 'Boston', fr: 'Boston' },
  { en: 'Cambridge', fr: 'Cambridge' },
  { en: 'Bristol', fr: 'Bristol' },
  { en: 'Chicago', fr: 'Chicago' },
  { en: 'Bath', fr: 'Bath' },
  { en: 'Seattle', fr: 'Seattle' }
];

const TIME_CUES = [
  { en: 'this morning', fr: 'ce matin' },
  { en: 'right after lunch', fr: 'juste après le déjeuner' },
  { en: 'this afternoon', fr: 'cet après-midi' },
  { en: 'before the evening rush', fr: 'avant l’heure de pointe du soir' },
  { en: 'this weekend', fr: 'ce week-end' },
  { en: 'at the start of the week', fr: 'en début de semaine' },
  { en: 'ahead of tomorrow’s plan', fr: 'en vue du programme de demain' }
];

const SPEAKER_COLORS = ['#f2ca50', '#38bdf8', '#34d399', '#f472b6'];

const UK_FEMALE_PERSONAS = ['uk-fem-1', 'uk-fem-2', 'uk-fem-5', 'uk-fem-3'];
const UK_MALE_PERSONAS = ['uk-male-1', 'uk-male-2', 'uk-male-3', 'uk-male-5'];
const US_FEMALE_PERSONAS = ['us-fem-1', 'us-fem-2', 'us-fem-5', 'us-fem-3'];
const US_MALE_PERSONAS = ['us-male-1', 'us-male-2', 'us-male-3', 'us-male-5'];

function buildSpeakers(
  blueprint: ScenarioBlueprint,
  format: DialogueFormatId,
  variantIdx: number
): DialogueSpeaker[] {
  const count = format === 'duo' ? 2 : format === 'trio' ? 3 : 4;
  const speakers: DialogueSpeaker[] = [];

  for (let s = 0; s < count; s++) {
    const roleInfo = blueprint.roles[s % blueprint.roles.length];
    const isFemale = roleInfo.gender === 'female';
    const ukPool = isFemale ? UK_FEMALE_PERSONAS : UK_MALE_PERSONAS;
    const usPool = isFemale ? US_FEMALE_PERSONAS : US_MALE_PERSONAS;
    const poolIdx = (s + variantIdx) % ukPool.length;
    // Slight subtle pitch shift per slot so same-gender voices sound distinctly different
    const pitchOffset = s === 0 ? 0.02 : s === 1 ? -0.04 : s === 2 ? 0.05 : -0.07;

    speakers.push({
      id: `spk-${s}`,
      name: roleInfo.name,
      roleFr: roleInfo.roleFr,
      gender: roleInfo.gender,
      ukPersonaId: ukPool[poolIdx],
      usPersonaId: usPool[poolIdx],
      pitchOffset,
      colorHex: SPEAKER_COLORS[s % SPEAKER_COLORS.length],
      initials: roleInfo.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    });
  }

  return speakers;
}

const TRIO_GROUP_INTERJECTIONS: Record<
  DialogueThemeId,
  Array<{
    en: string;
    fr: string;
    keyPhrase: string;
    keyIpa: string;
    keyMeaningFr: string;
    tipFr: string;
  }>
> = {
  vie_quotidienne: [
    {
      en: 'Wait—before you decide, should we also verify the opening hours for tomorrow?',
      fr: 'Attendez, avant de décider, devrions-nous aussi vérifier les horaires d’ouverture pour demain ?',
      keyPhrase: 'verify the opening hours',
      keyIpa: '/ˈverɪfaɪ ði ˈəʊpənɪŋ ˈaʊəz/',
      keyMeaningFr: 'vérifier les horaires d’ouverture',
      tipFr: 'En trio, une troisième personne apporte une vérification pratique très utile.'
    },
    {
      en: 'Count me in too! If anyone needs a hand carrying things back, just let me know.',
      fr: 'Comptez sur moi aussi ! Si quelqu’un a besoin d’un coup de main pour tout rapporter, faites-le moi savoir.',
      keyPhrase: 'needs a hand',
      keyIpa: '/niːdz ə hænd/',
      keyMeaningFr: 'avoir besoin d’un coup de main',
      tipFr: '« Give someone a hand » = aider quelqu’un.'
    }
  ],
  loisirs: [
    {
      en: 'Speaking of timing, would everyone rather meet up early for coffee before starting?',
      fr: 'En parlant d’horaire, préféreriez-vous tous qu’on se retrouve plus tôt pour un café avant de commencer ?',
      keyPhrase: 'would everyone rather',
      keyIpa: '/wʊd ˈevriwʌn ˈrɑːðə/',
      keyMeaningFr: 'tout le monde préférerait-il',
      tipFr: '« Would rather » exprime une préférence claire en groupe.'
    },
    {
      en: 'Great call! I will bring extra gear for the group so nobody feels left out.',
      fr: 'Excellente initiative ! J’apporterai du matériel supplémentaire pour le groupe afin que personne ne soit lésé.',
      keyPhrase: 'Great call',
      keyIpa: '/ɡreɪt kɔːl/',
      keyMeaningFr: 'Excellente décision / bonne idée',
      tipFr: 'Très courant entre amis pour approuver une proposition.'
    }
  ],
  metier: [
    {
      en: 'Just to chime in—have we logged the updated checklist in our shared team folder yet?',
      fr: 'Je me permets d’intervenir : avons-nous déjà enregistré la liste à jour dans notre dossier d’équipe partagé ?',
      keyPhrase: 'chime in',
      keyIpa: '/tʃaɪm ɪn/',
      keyMeaningFr: 'intervenir brièvement dans la discussion',
      tipFr: '« Just to chime in » est très poli pour prendre la parole à plusieurs.'
    },
    {
      en: 'Good point—I can share the summary notes with every technician right after our briefing.',
      fr: 'Bonne remarque : je peux partager le compte rendu avec chaque technicien juste après notre point.',
      keyPhrase: 'summary notes',
      keyIpa: '/ˈsʌməri nəʊts/',
      keyMeaningFr: 'notes de synthèse',
      tipFr: 'Assure que tout le monde repart avec les mêmes informations.'
    }
  ],
  business: [
    {
      en: 'If I may add one question from finance—does this timeline impact our quarterly budget ceiling?',
      fr: 'Si je peux ajouter une question côté finance : ce calendrier affecte-t-il notre plafond budgétaire trimestriel ?',
      keyPhrase: 'If I may add',
      keyIpa: '/ɪf aɪ meɪ æd/',
      keyMeaningFr: 'Si je peux me permettre d’ajouter',
      tipFr: 'Formule de transition élégante en réunion de direction.'
    },
    {
      en: 'Let us confirm the action owners around the table so we stay aligned through Friday.',
      fr: 'Confirmons les responsables de chaque action autour de la table afin de rester alignés jusqu’à vendredi.',
      keyPhrase: 'stay aligned',
      keyIpa: '/steɪ əˈlaɪnd/',
      keyMeaningFr: 'rester alignés / coordonnés',
      tipFr: 'Vocabulaire clé des réunions stratégiques internationales.'
    }
  ],
  voyage: [
    {
      en: 'Excuse me for jumping in, I am heading the same direction—would it help to share a ride or map?',
      fr: 'Excusez-moi d’intervenir, je vais dans la même direction : voulez-vous partager le trajet ou le plan ?',
      keyPhrase: 'heading the same direction',
      keyIpa: '/ˈhedɪŋ ðə seɪm dɪˈrekʃən/',
      keyMeaningFr: 'aller dans la même direction',
      tipFr: '« To head toward / in a direction » = se diriger vers.'
    },
    {
      en: 'Thank you all so much! Having local advice like this makes traveling far less stressful.',
      fr: 'Merci infiniment à vous tous ! Avoir des conseils locaux comme ceux-ci rend le voyage bien moins stressant.',
      keyPhrase: 'makes traveling far less stressful',
      keyIpa: '/meɪks ˈtrævlɪŋ fɑː les ˈstresfəl/',
      keyMeaningFr: 'rend le voyage bien moins stressant',
      tipFr: '« Far less + adjectif » renforce la comparaison (« bien moins… »).'
    }
  ],
  gastronomie: [
    {
      en: 'For the whole table—would everyone like to share two tasting platters before the main dishes?',
      fr: 'Pour toute la table : aimeriez-vous tous partager deux planches dégustation avant les plats principaux ?',
      keyPhrase: 'tasting platters',
      keyIpa: '/ˈteɪstɪŋ ˈplætəz/',
      keyMeaningFr: 'planches / assiettes dégustation',
      tipFr: 'Très utile au restaurant lorsque l’on commande à plusieurs.'
    },
    {
      en: 'What a thoughtful pairing! Let us raise a glass to a memorable meal together.',
      fr: 'Quel accord attentionné ! Levons notre verre à ce repas mémorable ensemble.',
      keyPhrase: 'raise a glass',
      keyIpa: '/reɪz ə ɡlɑːs/',
      keyMeaningFr: 'lever son verre (porter un toast)',
      tipFr: 'Expression conviviale incontournable à table.'
    }
  ]
};

function interpolate(pattern: string, detailEn: string, detailFr: string): string {
  return pattern.replace(/\{DETAIL_EN\}/g, detailEn).replace(/\{DETAIL_FR\}/g, detailFr);
}

function build500Dialogues(): AtelierDialogue[] {
  const result: AtelierDialogue[] = [];
  let globalNumber = 1;

  const formatCycle: DialogueFormatId[] = ['duo', 'trio', 'groupe'];

  for (let themeIdx = 0; themeIdx < THEME_QUOTAS.length; themeIdx++) {
    const { id: themeId, count: themeCount } = THEME_QUOTAS[themeIdx];
    const themeMeta = DIALOGUE_THEMES.find((t) => t.id === themeId)!;
    const blueprints = THEME_BLUEPRINTS[themeId];
    const interjections = TRIO_GROUP_INTERJECTIONS[themeId];

    for (let i = 0; i < themeCount; i++) {
      const bp = blueprints[i % blueprints.length];
      const variant = bp.variants[Math.floor(i / blueprints.length) % bp.variants.length];
      const format = formatCycle[(i + themeIdx) % formatCycle.length];
      const formatMeta = DIALOGUE_FORMATS.find((f) => f.id === format)!;
      const levelMeta = DIALOGUE_LEVELS[(i * 3 + themeIdx) % DIALOGUE_LEVELS.length];
      const city = CONTEXT_CITIES[(i + themeIdx * 2) % CONTEXT_CITIES.length];
      const timeCue = TIME_CUES[(i + themeIdx) % TIME_CUES.length];

      const speakers = buildSpeakers(bp, format, i);

      // Build varied Q&A turns with level-adapted nuance when needed
      const baseTurns: DialogueTurn[] = bp.turnsTemplate.map((tpl, tIdx) => {
        const assignedSpeaker = speakers[tpl.speakerSlot % speakers.length];
        let enText = interpolate(tpl.enPattern, variant.focusDetailEn, variant.focusDetailFr);
        let frText = interpolate(tpl.frPattern, variant.focusDetailEn, variant.focusDetailFr);

        // Add subtle real-world contextual variation per dialogue index so #1..#500 read freshly
        if (tIdx === 0 && i >= blueprints.length * bp.variants.length) {
          enText = `${enText} (Context: ${city.en}, ${timeCue.en})`;
          frText = `${frText} (${city.fr}, ${timeCue.fr})`;
        } else if (tIdx === 0 && levelMeta.tier === 3) {
          enText = `Pardon me—${enText.charAt(0).toLowerCase()}${enText.slice(1)}`;
          frText = `Veuillez m’excuser — ${frText.charAt(0).toLowerCase()}${frText.slice(1)}`;
        }

        return {
          id: `d-${globalNumber}-t-${tIdx + 1}`,
          speakerId: assignedSpeaker.id,
          intent: tpl.intent,
          en: enText,
          fr: frText,
          keyPhrase: tpl.keyPhrasePattern,
          keyIpa: tpl.keyIpa,
          keyMeaningFr: tpl.keyMeaningFr,
          tipFr: tpl.tipFr
        };
      });

      // Add 3rd speaker question/precision turn for 'trio' & 'groupe'
      if (format === 'trio' || format === 'groupe') {
        const spkC = speakers[2];
        const interjC = interjections[0];
        baseTurns.splice(2, 0, {
          id: `d-${globalNumber}-t-c`,
          speakerId: spkC.id,
          intent: 'precision',
          en: interjC.en,
          fr: interjC.fr,
          keyPhrase: interjC.keyPhrase,
          keyIpa: interjC.keyIpa,
          keyMeaningFr: interjC.keyMeaningFr,
          tipFr: interjC.tipFr
        });
      }

      // Add 4th speaker collaborative wrap-up for 'groupe'
      if (format === 'groupe' && speakers[3]) {
        const spkD = speakers[3];
        const interjD = interjections[1];
        baseTurns.push({
          id: `d-${globalNumber}-t-d`,
          speakerId: spkD.id,
          intent: 'conclusion',
          en: interjD.en,
          fr: interjD.fr,
          keyPhrase: interjD.keyPhrase,
          keyIpa: interjD.keyIpa,
          keyMeaningFr: interjD.keyMeaningFr,
          tipFr: interjD.tipFr
        });
      }

      const keyCards: DialogueKeyCard[] = [
        {
          id: `dlg-card-${globalNumber}-a`,
          term: variant.keyTerm,
          ipa: variant.keyIpa,
          frenchDef: variant.keyFr,
          englishContext: baseTurns[0].en,
          tipFr: `${variant.focusTag} • ${bp.learningGoal}`,
          themeLabel: themeMeta.label,
          level: levelMeta.cefr,
          dialogueNumber: globalNumber
        },
        {
          id: `dlg-card-${globalNumber}-b`,
          term: baseTurns[0].keyPhrase,
          ipa: baseTurns[0].keyIpa,
          frenchDef: baseTurns[0].keyMeaningFr,
          englishContext: baseTurns[0].en,
          tipFr: baseTurns[0].tipFr,
          themeLabel: themeMeta.label,
          level: levelMeta.cefr,
          dialogueNumber: globalNumber
        },
        {
          id: `dlg-card-${globalNumber}-c`,
          term: baseTurns[1].keyPhrase,
          ipa: baseTurns[1].keyIpa,
          frenchDef: baseTurns[1].keyMeaningFr,
          englishContext: baseTurns[1].en,
          tipFr: baseTurns[1].tipFr,
          themeLabel: themeMeta.label,
          level: levelMeta.cefr,
          dialogueNumber: globalNumber
        }
      ];

      result.push({
        id: `atelier-dlg-${globalNumber}`,
        number: globalNumber,
        theme: themeId,
        themeLabel: themeMeta.label,
        format,
        formatLabel: formatMeta.badge,
        level: levelMeta.id,
        levelLabel: levelMeta.label,
        cefr: levelMeta.cefr,
        title: `${bp.title} — ${variant.focusTag}`,
        titleFr: `${bp.titleFr} • ${variant.focusTag}`,
        setting: `${bp.setting} (${city.fr})`,
        learningGoal: bp.learningGoal,
        speakers,
        turns: baseTurns,
        keyCards
      });

      globalNumber += 1;
    }
  }

  return result;
}

export const ATELIER_DIALOGUES_500: AtelierDialogue[] = build500Dialogues();

// Deduplicated curated SM-2 cards derived from all 500 dialogues for immediate review
export const DIALOGUE_SM2_CARDS: DialogueKeyCard[] = (() => {
  const seen = new Set<string>();
  const cards: DialogueKeyCard[] = [];
  for (const dlg of ATELIER_DIALOGUES_500) {
    for (const card of dlg.keyCards) {
      const key = card.term.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        cards.push(card);
      }
    }
  }
  return cards;
})();

export function getAtelierDialoguesStats() {
  const byTheme: Record<DialogueThemeId, number> = {
    vie_quotidienne: 0,
    loisirs: 0,
    metier: 0,
    business: 0,
    voyage: 0,
    gastronomie: 0
  };
  const byFormat: Record<DialogueFormatId, number> = {
    duo: 0,
    trio: 0,
    groupe: 0
  };
  for (const d of ATELIER_DIALOGUES_500) {
    byTheme[d.theme] += 1;
    byFormat[d.format] += 1;
  }
  return {
    total: ATELIER_DIALOGUES_500.length,
    byTheme,
    byFormat,
    sm2ExpressionsCount: DIALOGUE_SM2_CARDS.length
  };
}
