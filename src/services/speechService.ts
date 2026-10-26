/**
 * Dual Accent Speech Service: British English (UK 🇬🇧) & American English (US 🇺🇸)
 * Advanced General American & Received Pronunciation Neural Synthesis Engine.
 * Features:
 * - Asynchronous voice cache with onvoiceschanged listener
 * - Natural & Neural voice prioritization (Microsoft Natural, Google US, Apple Enhanced)
 * - American phonetic text normalization (orthography & rhotics adaptation)
 * - Gender preference (Female / Male / Natural)
 * - Calibrated prosody, pitch, and playback rate for high-authenticity American English
 */

export type AccentType = 'en-GB' | 'en-US';
export type VoiceGender = 'female' | 'male' | 'auto';

export interface AccentInfo {
  code: AccentType;
  label: string;
  flag: string;
  region: string;
  phoneticDescription: string;
  keyFeatures: string[];
  defaultRate: number;
  defaultPitch: number;
}

export const ACCENTS_INFO: Record<AccentType, AccentInfo> = {
  'en-GB': {
    code: 'en-GB',
    label: 'British English',
    flag: '🇬🇧',
    region: 'UK (Oxford / Received Pronunciation)',
    phoneticDescription: 'Prononciation académique britannique sans rhotisme (RP), voyelles pures et articulation soignée.',
    keyFeatures: [
      'Non-rhôtique : le /r/ ne se prononce pas devant consonne ou en fin de mot (ex: "car" -> [kɑː])',
      'Voyelle large /ɑː/ dans "dance", "fast", "path"',
      'Consonnes plosives nettes /t/ et /p/ sans affaiblissement',
      'Intonation mélodique montante-descendante typique d\'Oxford'
    ],
    defaultRate: 0.88,
    defaultPitch: 1.02
  },
  'en-US': {
    code: 'en-US',
    label: 'American English',
    flag: '🇺🇸',
    region: 'US (General American / Network Standard)',
    phoneticDescription: 'Prononciation américaine authentique avec rhotisme rétroflexe prononcé, flapping du /t/ intervocalique et voyelle /æ/ allongée.',
    keyFeatures: [
      'Fort rhotisme rétroflexe : le /r/ résonne avec intensité dans "hard", "bird", "water", "car"',
      'Flap T [ɾ] : le "t" entre deux voyelles devient doux comme un "d" léger ("water" -> [wɑːt̬ɚ], "butter", "city")',
      'Voyelle plate /æ/ dans "can\'t", "dance", "half", "afternoon"',
      'Cadence décontractée, résonance de poitrine chaleureuse et débit fluide'
    ],
    defaultRate: 0.93,
    defaultPitch: 0.98
  }
};

// User Preferences for Voice Engine
const PREF_US_GENDER_KEY = 'eb_msz_us_voice_gender';
const PREF_US_VOICE_URI_KEY = 'eb_msz_us_voice_uri';

let preferredUsGender: VoiceGender = 'auto';
let customUsVoiceURI: string | null = null;

try {
  if (typeof localStorage !== 'undefined') {
    const savedGender = localStorage.getItem(PREF_US_GENDER_KEY) as VoiceGender;
    if (savedGender && ['female', 'male', 'auto'].includes(savedGender)) {
      preferredUsGender = savedGender;
    }
    const savedURI = localStorage.getItem(PREF_US_VOICE_URI_KEY);
    if (savedURI) {
      customUsVoiceURI = savedURI;
    }
  }
} catch (e) {
  // ignore
}

export function setPreferredUsVoiceGender(gender: VoiceGender): void {
  preferredUsGender = gender;
  try {
    localStorage.setItem(PREF_US_GENDER_KEY, gender);
  } catch (e) {}
  notifyListeners();
}

export function getPreferredUsVoiceGender(): VoiceGender {
  return preferredUsGender;
}

export function setCustomUsVoiceURI(uri: string | null): void {
  customUsVoiceURI = uri;
  try {
    if (uri) {
      localStorage.setItem(PREF_US_VOICE_URI_KEY, uri);
    } else {
      localStorage.removeItem(PREF_US_VOICE_URI_KEY);
    }
  } catch (e) {}
  notifyListeners();
}

export function getCustomUsVoiceURI(): string | null {
  return customUsVoiceURI;
}

// Autoplay on Display & Alternating Accent Preferences
const PREF_AUTOPLAY_KEY = 'eb_msz_autoplay_on_display';
const PREF_LAST_AUTOPLAY_ACCENT_KEY = 'eb_msz_last_autoplay_accent';

let autoPlayOnDisplay: boolean = false;
let lastAutoPlayAccent: AccentType = 'en-US'; // so first alternation starts on en-GB

try {
  if (typeof localStorage !== 'undefined') {
    autoPlayOnDisplay = localStorage.getItem(PREF_AUTOPLAY_KEY) === 'true';
    const savedAccent = localStorage.getItem(PREF_LAST_AUTOPLAY_ACCENT_KEY) as AccentType;
    if (savedAccent === 'en-GB' || savedAccent === 'en-US') {
      lastAutoPlayAccent = savedAccent;
    }
  }
} catch (e) {}

export function getAutoPlayOnDisplay(): boolean {
  return autoPlayOnDisplay;
}

export function setAutoPlayOnDisplay(enabled: boolean): void {
  autoPlayOnDisplay = enabled;
  try {
    localStorage.setItem(PREF_AUTOPLAY_KEY, String(enabled));
  } catch (e) {}
  notifyListeners();
}

/**
 * Returns the next alternating accent (toggles between en-GB and en-US)
 */
export function getNextAlternatingAccent(): AccentType {
  const next: AccentType = lastAutoPlayAccent === 'en-GB' ? 'en-US' : 'en-GB';
  lastAutoPlayAccent = next;
  try {
    localStorage.setItem(PREF_LAST_AUTOPLAY_ACCENT_KEY, next);
  } catch (e) {}
  return next;
}

/**
 * Peek what the next alternating accent will be without advancing
 */
export function peekNextAlternatingAccent(): AccentType {
  return lastAutoPlayAccent === 'en-GB' ? 'en-US' : 'en-GB';
}

/**
 * Triggers automatic alternating playback if autoplay is enabled by user
 */
export function triggerAutoPlayIfEnabled(text: string, elementId: string, delayMs: number = 350): AccentType | null {
  if (!autoPlayOnDisplay) return null;
  const nextAccent = getNextAlternatingAccent();
  setTimeout(() => {
    speakText(text, nextAccent, elementId);
  }, delayMs);
  return nextAccent;
}

// Cached voices list
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

// Listen to async voice changes
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
    notifyListeners();
  };
}

type SpeechStateListener = (activeId: string | null, activeAccent: AccentType | null) => void;
const listeners = new Set<SpeechStateListener>();

let currentActiveId: string | null = null;
let currentActiveAccent: AccentType | null = null;

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(currentActiveId, currentActiveAccent);
    } catch (e) {
      console.warn('Speech listener error:', e);
    }
  });
}

export function subscribeToSpeechState(listener: SpeechStateListener): () => void {
  listeners.add(listener);
  listener(currentActiveId, currentActiveAccent);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Normalise text specifically for American English speech synthesizers
 * Converts UK orthography to US orthography to activate true American vowel / consonant dictionaries
 */
export function normalizeForAmericanAccent(text: string): string {
  let normalized = text;

  // Common British to American spelling mappings for authentic American phonetics
  const ukToUsMap: Array<[RegExp, string]> = [
    [/\bcolour\b/gi, 'color'],
    [/\bcolours\b/gi, 'colors'],
    [/\bcoloured\b/gi, 'colored'],
    [/\bflavour\b/gi, 'flavor'],
    [/\bflavours\b/gi, 'flavors'],
    [/\bfavour\b/gi, 'favor'],
    [/\bfavours\b/gi, 'favors'],
    [/\bfavourite\b/gi, 'favorite'],
    [/\bfavourites\b/gi, 'favorites'],
    [/\bhonour\b/gi, 'honor'],
    [/\bhonours\b/gi, 'honors'],
    [/\bhumour\b/gi, 'humor'],
    [/\brumour\b/gi, 'rumor'],
    [/\brumours\b/gi, 'rumors'],
    [/\bneighbour\b/gi, 'neighbor'],
    [/\bneighbours\b/gi, 'neighbors'],
    [/\blabour\b/gi, 'labor'],
    [/\bbehaviour\b/gi, 'behavior'],
    [/\bcentre\b/gi, 'center'],
    [/\bcentres\b/gi, 'centers'],
    [/\btheatre\b/gi, 'theater'],
    [/\btheatres\b/gi, 'theaters'],
    [/\bmetre\b/gi, 'meter'],
    [/\bmetres\b/gi, 'meters'],
    [/\blitre\b/gi, 'liter'],
    [/\blitres\b/gi, 'liters'],
    [/\bfibre\b/gi, 'fiber'],
    [/\bprogramme\b/gi, 'program'],
    [/\bprogrammes\b/gi, 'programs'],
    [/\bdialogue\b/gi, 'dialog'],
    [/\bdialogues\b/gi, 'dialogs'],
    [/\borganise\b/gi, 'organize'],
    [/\borganised\b/gi, 'organized'],
    [/\borganising\b/gi, 'organizing'],
    [/\brealise\b/gi, 'realize'],
    [/\brealised\b/gi, 'realized'],
    [/\brealising\b/gi, 'realizing'],
    [/\brecognise\b/gi, 'recognize'],
    [/\brecognised\b/gi, 'recognized'],
    [/\banalyse\b/gi, 'analyze'],
    [/\banalysed\b/gi, 'analyzed'],
    [/\bwhilst\b/gi, 'while'],
    [/\bamongst\b/gi, 'among'],
    [/\blearnt\b/gi, 'learned'],
    [/\bleapt\b/gi, 'leaped'],
    [/\bdreamt\b/gi, 'dreamed'],
    [/\bgrey\b/gi, 'gray'],
    [/\bjudgement\b/gi, 'judgment'],
    [/\bpaediatric\b/gi, 'pediatric'],
    [/\baesthetic\b/gi, 'aesthetic']
  ];

  for (const [regex, replacement] of ukToUsMap) {
    normalized = normalized.replace(regex, replacement);
  }

  return normalized;
}

/**
 * Returns all available US voices on this device/browser
 */
export function getAvailableUsVoices(): SpeechSynthesisVoice[] {
  const voices = loadVoices();
  return voices.filter(
    (v) =>
      v.lang.toLowerCase() === 'en-us' ||
      v.lang.toLowerCase() === 'en_us' ||
      (v.lang.toLowerCase().startsWith('en') &&
        (v.name.toLowerCase().includes('united states') ||
          v.name.toLowerCase().includes('us') ||
          v.name.toLowerCase().includes('american')))
  );
}

/**
 * Select the highest quality, most authentic American voice available
 */
export function getBestUsVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  // 1. User manual override
  if (customUsVoiceURI) {
    const userVoice = voices.find((v) => v.voiceURI === customUsVoiceURI);
    if (userVoice) return userVoice;
  }

  const usVoices = getAvailableUsVoices();
  if (usVoices.length === 0) {
    // fallback to any English voice
    return voices.find((v) => v.lang.startsWith('en')) || null;
  }

  // Tier 1: Premium Natural / Neural Voices
  // Windows / Edge Natural voices
  const naturalUsVoicesFemale = [
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Michelle Online (Natural) - English (United States)',
    'Jenny', 'Aria', 'Michelle'
  ];

  const naturalUsVoicesMale = [
    'Microsoft Guy Online (Natural) - English (United States)',
    'Microsoft Christopher Online (Natural) - English (United States)',
    'Microsoft Eric Online (Natural) - English (United States)',
    'Guy', 'Christopher', 'Eric'
  ];

  // Apple macOS / iOS Enhanced & Premium Voices
  const appleEnhancedFemale = ['Samantha (Enhanced)', 'Ava (Premium)', 'Ava (Enhanced)', 'Nicky (Enhanced)', 'Zoe (Premium)', 'Samantha'];
  const appleEnhancedMale = ['Alex', 'Tom (Enhanced)', 'Evan (Enhanced)', 'Fred'];

  // Google / Chrome / Android Voices
  const googleVoices = ['Google US English', 'English United States', 'en-us-x-sfg#female_1-local'];

  if (preferredUsGender === 'male') {
    // Look for male natural first
    for (const name of naturalUsVoicesMale) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    for (const name of appleEnhancedMale) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    const anyMale = usVoices.find((v) =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('alex')
    );
    if (anyMale) return anyMale;
  } else if (preferredUsGender === 'female') {
    // Look for female natural first
    for (const name of naturalUsVoicesFemale) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    for (const name of appleEnhancedFemale) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    const anyFemale = usVoices.find((v) =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('zira')
    );
    if (anyFemale) return anyFemale;
  } else {
    // Auto: prioritize the absolute highest clarity online/natural voices
    for (const name of naturalUsVoicesFemale.concat(naturalUsVoicesMale)) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    for (const name of googleVoices) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    for (const name of appleEnhancedFemale.concat(appleEnhancedMale)) {
      const match = usVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
  }

  // Tier 2: Any voice explicitly tagged en-US
  const strictUs = usVoices.find((v) => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en_us');
  if (strictUs) return strictUs;

  return usVoices[0];
}

/**
 * Select the highest quality British voice available
 */
export function getBestUkVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  const ukVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase() === 'en-gb' ||
      v.lang.toLowerCase() === 'en_gb' ||
      v.name.toLowerCase().includes('british') ||
      v.name.toLowerCase().includes('united kingdom') ||
      v.name.toLowerCase().includes('uk')
  );

  if (ukVoices.length === 0) {
    return voices.find((v) => v.lang.startsWith('en')) || null;
  }

  const preferredBritish = [
    'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    'Microsoft Ryan Online (Natural) - English (United Kingdom)',
    'Google UK English Female',
    'Google UK English Male',
    'Daniel', 'Serena', 'George', 'Stephanie', 'Oliver', 'Kate', 'Arthur', 'Hazel'
  ];

  for (const name of preferredBritish) {
    const match = ukVoices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  return ukVoices[0];
}

/**
 * Find the most authentic voice available for the requested accent
 */
export function getBestVoice(accent: AccentType): SpeechSynthesisVoice | null {
  return accent === 'en-US' ? getBestUsVoice() : getBestUkVoice();
}

/**
 * Cancel currently playing audio
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentActiveId = null;
  currentActiveAccent = null;
  notifyListeners();
}

/**
 * Speak text in the specified accent (UK or US)
 * With authentic phonetic tuning and prosodic calibration
 */
export function speakText(
  text: string,
  accent: AccentType,
  elementId: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    currentActiveId = elementId;
    currentActiveAccent = accent;
    notifyListeners();
    options?.onStart?.();
    setTimeout(() => {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
      options?.onEnd?.();
    }, 1500);
    return;
  }

  // Toggle stop if already playing this exact element with this accent
  if (currentActiveId === elementId && currentActiveAccent === accent) {
    stopSpeech();
    return;
  }

  window.speechSynthesis.cancel();

  let cleanText = text.replace(/<[^>]*>/g, '').trim();
  if (!cleanText) return;

  // Apply American phonetic normalization if accent is en-US
  if (accent === 'en-US') {
    cleanText = normalizeForAmericanAccent(cleanText);
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const accentInfo = ACCENTS_INFO[accent];

  utterance.lang = accent;
  utterance.rate = options?.rate ?? accentInfo.defaultRate;
  utterance.pitch = options?.pitch ?? accentInfo.defaultPitch;

  const chosenVoice = getBestVoice(accent);
  if (chosenVoice) {
    utterance.voice = chosenVoice;
  }

  utterance.onstart = () => {
    currentActiveId = elementId;
    currentActiveAccent = accent;
    notifyListeners();
    options?.onStart?.();
  };

  utterance.onend = () => {
    if (currentActiveId === elementId && currentActiveAccent === accent) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech error:', e);
    if (currentActiveId === elementId && currentActiveAccent === accent) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text in French (for bilingual translations & explanations)
 */
export function speakFrenchText(
  text: string,
  elementId: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onStart?.();
    setTimeout(() => options?.onEnd?.(), 1500);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1.0;

  const voices = loadVoices();
  const frVoice = voices.find(
    (v) =>
      v.lang.toLowerCase() === 'fr-fr' ||
      v.lang.toLowerCase() === 'fr_fr' ||
      v.lang.startsWith('fr')
  );
  if (frVoice) {
    utterance.voice = frVoice;
  }

  utterance.onstart = () => {
    currentActiveId = elementId;
    currentActiveAccent = null;
    notifyListeners();
    options?.onStart?.();
  };

  utterance.onend = () => {
    if (currentActiveId === elementId) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onEnd?.();
  };

  utterance.onerror = () => {
    if (currentActiveId === elementId) {
      currentActiveId = null;
      currentActiveAccent = null;
      notifyListeners();
    }
    options?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}
