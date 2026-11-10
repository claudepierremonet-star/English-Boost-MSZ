/**
 * EnglishBoost Pronunciation Duel & Real-Time Spectral Engine
 * 
 * Provides real-time Fast Fourier Transform (FFT) analysis, vowel formant
 * decomposition, pitch tracking via autocorrelation, and acoustic distance
 * comparison between the user's voice and native British / American models.
 */

export interface FormantBands {
  f0: number; // Fundamental pitch (80 - 300 Hz)
  f1: number; // First formant (vowel height / jaw openness: 250 - 900 Hz)
  f2: number; // Second formant (vowel frontness / tongue place: 900 - 2500 Hz)
  f3: number; // Third formant (timbre & American rhoticity: 2500 - 4500 Hz)
  sibilants: number; // High-frequency fricative energy (4500 - 9000 Hz)
}

export interface SpectralAnalysisFrame {
  timestamp: number;
  frequencies: Float32Array; // Normalized magnitude 0..1 across bins
  rawFrequencies: Uint8Array; // Raw 0..255 byte data from AnalyserNode
  binCount: number;
  sampleRate: number;
  f0PitchHz: number;
  pitchConfidence: number; // 0..1
  formants: FormantBands;
  spectralCentroidHz: number;
  rmsVolume: number; // 0..1
  isVoiced: boolean;
  isSilent: boolean;
}

export interface RealtimeDuelScore {
  overallMatch: number; // 0 to 100
  formantMatch: number; // 0 to 100
  spectralDistance: number; // 0 to 1 (lower is closer)
  pitchMatch: number; // 0 to 100
  clarityScore: number; // 0 to 100
  activeFeedback: string;
  badgeLevel: 'master' | 'expert' | 'good' | 'adjusting' | 'silent';
  dominantFormant: string;
}

export interface NativeSpectralTemplate {
  phrase: string;
  accent: 'en-GB' | 'en-US';
  binCount: number;
  targetFrequencies: Float32Array;
  targetFormants: FormantBands;
  targetPitchHz: number;
  targetCentroidHz: number;
  phoneticBreakdown: {
    word: string;
    vowelType: string;
    targetF1: number;
    targetF2: number;
    targetPitch: number;
  }[];
}

/**
 * Phonetic formant landmarks for English vowels (Average F1 & F2 in Hz)
 */
const VOWEL_FORMANT_MAP: Record<string, { f1: number; f2: number; label: string }> = {
  // Front vowels
  'i:': { f1: 280, f2: 2250, label: '/iː/ fleece (haute & antérieure)' },
  'I': { f1: 400, f2: 1900, label: '/ɪ/ kit (mi-haute)' },
  'e': { f1: 550, f2: 1750, label: '/e/ dress (moyenne)' },
  '{': { f1: 750, f2: 1650, label: '/æ/ trap (ouverte antérieure)' },
  // Central vowels
  '@': { f1: 500, f2: 1500, label: '/ə/ schwa (neutre centrale)' },
  '3:': { f1: 560, f2: 1400, label: '/ɜː/ nurse (centrale longue)' },
  'V': { f1: 680, f2: 1250, label: '/ʌ/ strut (mi-ouverte)' },
  // Back vowels
  'u:': { f1: 320, f2: 950, label: '/uː/ goose (haute postérieure)' },
  'U': { f1: 450, f2: 1100, label: '/ʊ/ foot (mi-haute)' },
  'O:': { f1: 500, f2: 850, label: '/ɔː/ thought (ouverte postérieure)' },
  'A:': { f1: 720, f2: 1050, label: '/ɑː/ palm (ouverte UK large)' }
};

/**
 * Frequency to FFT Bin Index conversion
 */
export function freqToBin(frequencyHz: number, sampleRate: number, fftSize: number): number {
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / (fftSize / 2);
  return Math.max(0, Math.min(fftSize / 2 - 1, Math.round(frequencyHz / binWidth)));
}

/**
 * Bin Index to Frequency conversion
 */
export function binToFreq(binIndex: number, sampleRate: number, fftSize: number): number {
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / (fftSize / 2);
  return binIndex * binWidth;
}

/**
 * Generates an authentic native reference spectral template for an English phrase
 */
export function generateNativeSpectralTemplate(
  text: string,
  accent: 'en-GB' | 'en-US' = 'en-GB',
  binCount: number = 128,
  sampleRate: number = 44100
): NativeSpectralTemplate {
  const fftSize = binCount * 2;
  const targetFrequencies = new Float32Array(binCount);
  const words = text.trim().split(/\s+/).filter(Boolean);

  // Determine key formant targets based on accent and words
  const isAmerican = accent === 'en-US';
  
  // Base pitch: Oxford RP typically ~135-155Hz with dynamic melodic glide; US ~125-145Hz steady chest
  const targetPitchHz = isAmerican ? 132 : 144;
  
  // Spectral centroid: US slightly brighter due to rhotic retroflex & nasalization; UK deeper vowels
  const targetCentroidHz = isAmerican ? 1850 : 1620;

  // Key formants for standard English speech
  const targetFormants: FormantBands = {
    f0: 0.85,
    f1: isAmerican ? 0.72 : 0.82,
    f2: isAmerican ? 0.68 : 0.75,
    f3: isAmerican ? 0.88 : 0.58, // F3 strongly amplified in American rhotic /r/
    sibilants: 0.55
  };

  // Synthesize idealized spectral envelope across bins
  for (let b = 0; b < binCount; b++) {
    const freq = binToFreq(b, sampleRate, fftSize);
    
    // Low-frequency fundamental roll-off (80-250 Hz)
    const f0Peak = Math.exp(-Math.pow((freq - targetPitchHz) / 45, 2)) * 0.92;
    const f0Harmonic = Math.exp(-Math.pow((freq - targetPitchHz * 2) / 60, 2)) * 0.65;
    
    // F1 Vowel peak (500-750 Hz)
    const f1Target = isAmerican ? 620 : 540;
    const f1Peak = Math.exp(-Math.pow((freq - f1Target) / 140, 2)) * targetFormants.f1;
    
    // F2 Vowel peak (1400-1950 Hz)
    const f2Target = isAmerican ? 1750 : 1600;
    const f2Peak = Math.exp(-Math.pow((freq - f2Target) / 220, 2)) * targetFormants.f2;
    
    // F3 American rhoticity / UK vocal tract resonance (2600-3400 Hz)
    const f3Target = isAmerican ? 2600 : 3100;
    const f3Peak = Math.exp(-Math.pow((freq - f3Target) / 380, 2)) * targetFormants.f3;
    
    // High-frequency sibilants (5000-8000 Hz)
    const sibilantNoise = freq > 4500 && freq < 8500
      ? Math.sin(freq * 0.05) * 0.05 + 0.22
      : 0;

    // Background natural acoustic slope (-6dB per octave)
    const naturalSlope = Math.max(0.04, 0.45 * Math.pow(150 / Math.max(100, freq), 0.65));

    const totalMagnitude = f0Peak + f0Harmonic + f1Peak + f2Peak + f3Peak + sibilantNoise + naturalSlope;
    targetFrequencies[b] = Math.max(0.02, Math.min(0.98, totalMagnitude));
  }

  // Phonetic word breakdown estimates
  const phoneticBreakdown = words.map((w, idx) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    let vType = 'e';
    if (/[aou]/.test(clean)) vType = isAmerican ? '{' : 'A:';
    if (/[ei]/.test(clean)) vType = 'i:';
    if (/oo|u/.test(clean)) vType = 'u:';

    const landmark = VOWEL_FORMANT_MAP[vType] || VOWEL_FORMANT_MAP['e'];
    return {
      word: w,
      vowelType: vType,
      targetF1: landmark.f1,
      targetF2: landmark.f2,
      targetPitch: targetPitchHz + (idx % 2 === 0 ? 8 : -6)
    };
  });

  return {
    phrase: text,
    accent,
    binCount,
    targetFrequencies,
    targetFormants,
    targetPitchHz,
    targetCentroidHz,
    phoneticBreakdown
  };
}

/**
 * Autocorrelation algorithm to estimate fundamental frequency F0 (Pitch)
 */
export function computeAutocorrelationPitch(
  timeBuffer: Float32Array,
  sampleRate: number
): { pitchHz: number; confidence: number } {
  const bufferSize = timeBuffer.length;
  
  // Calculate RMS energy first
  let sumSq = 0;
  for (let i = 0; i < bufferSize; i++) {
    sumSq += timeBuffer[i] * timeBuffer[i];
  }
  const rms = Math.sqrt(sumSq / bufferSize);
  
  // If silence or very quiet ambient noise, return 0
  if (rms < 0.015) {
    return { pitchHz: 0, confidence: 0 };
  }

  // Speech fundamental range: 75 Hz (deep male) to 480 Hz (high female/child)
  const minPeriod = Math.floor(sampleRate / 480);
  const maxPeriod = Math.floor(sampleRate / 75);

  let bestPeriod = 0;
  let maxCorrelation = 0;

  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0;
    for (let i = 0; i < bufferSize - period; i++) {
      correlation += timeBuffer[i] * timeBuffer[i + period];
    }
    // Normalize correlation
    correlation = correlation / (bufferSize - period);
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }

  const confidence = Math.min(1, Math.max(0, maxCorrelation / Math.max(0.001, rms * rms)));
  
  if (confidence > 0.42 && bestPeriod > 0) {
    const pitchHz = sampleRate / bestPeriod;
    return { pitchHz: Math.round(pitchHz), confidence };
  }

  return { pitchHz: 0, confidence: 0 };
}

/**
 * Extracts a structured acoustic spectral frame from raw Web Audio Analyser buffers
 */
export function extractSpectralFrame(
  rawFreqArray: Uint8Array,
  timeArray: Float32Array,
  sampleRate: number
): SpectralAnalysisFrame {
  const binCount = rawFreqArray.length;
  const fftSize = binCount * 2;
  const normalizedFreqs = new Float32Array(binCount);

  let totalMagnitude = 0;
  let weightedFreqSum = 0;

  for (let i = 0; i < binCount; i++) {
    const normVal = rawFreqArray[i] / 255;
    normalizedFreqs[i] = normVal;
    totalMagnitude += normVal;
    
    const freq = binToFreq(i, sampleRate, fftSize);
    weightedFreqSum += freq * normVal;
  }

  // Calculate RMS Volume
  let sumSq = 0;
  for (let i = 0; i < timeArray.length; i++) {
    sumSq += timeArray[i] * timeArray[i];
  }
  const rms = Math.sqrt(sumSq / timeArray.length);
  const isSilent = rms < 0.018;

  // Spectral Centroid (timbral brightness)
  const spectralCentroidHz = totalMagnitude > 0.05
    ? Math.round(weightedFreqSum / totalMagnitude)
    : 0;

  // Pitch via autocorrelation
  const { pitchHz, confidence } = computeAutocorrelationPitch(timeArray, sampleRate);
  const isVoiced = !isSilent && pitchHz > 70 && confidence > 0.38;

  // Energy in 5 acoustic formant bands
  const getBandEnergy = (minHz: number, maxHz: number): number => {
    const minB = freqToBin(minHz, sampleRate, fftSize);
    const maxB = freqToBin(maxHz, sampleRate, fftSize);
    let bandSum = 0;
    let count = 0;
    for (let b = minB; b <= maxB; b++) {
      if (b < binCount) {
        bandSum += normalizedFreqs[b];
        count++;
      }
    }
    return count > 0 ? bandSum / count : 0;
  };

  const formants: FormantBands = {
    f0: Math.min(1, getBandEnergy(80, 280) * 1.5),
    f1: Math.min(1, getBandEnergy(280, 900) * 1.4),
    f2: Math.min(1, getBandEnergy(900, 2500) * 1.3),
    f3: Math.min(1, getBandEnergy(2500, 4500) * 1.6),
    sibilants: Math.min(1, getBandEnergy(4500, 9000) * 2.0)
  };

  return {
    timestamp: performance.now(),
    frequencies: normalizedFreqs,
    rawFrequencies: rawFreqArray,
    binCount,
    sampleRate,
    f0PitchHz: pitchHz,
    pitchConfidence: confidence,
    formants,
    spectralCentroidHz,
    rmsVolume: Math.min(1, rms * 3.5),
    isVoiced,
    isSilent
  };
}

/**
 * Compares in real time the user's live frequency spectrum frame against the native reference model
 */
export function compareLiveSpectrumToNative(
  userFrame: SpectralAnalysisFrame,
  nativeTemplate: NativeSpectralTemplate
): RealtimeDuelScore {
  if (userFrame.isSilent) {
    return {
      overallMatch: 0,
      formantMatch: 0,
      spectralDistance: 1,
      pitchMatch: 0,
      clarityScore: 0,
      activeFeedback: 'Prêt pour le Duel • Parlez clairement dans le micro',
      badgeLevel: 'silent',
      dominantFormant: 'Silence'
    };
  }

  const userFreqs = userFrame.frequencies;
  const nativeFreqs = nativeTemplate.targetFrequencies;
  const compareCount = Math.min(userFreqs.length, nativeFreqs.length);

  // 1. Vector Cosine Similarity on FFT Frequency distribution
  let dotProduct = 0;
  let userNorm = 0;
  let nativeNorm = 0;

  for (let i = 0; i < compareCount; i++) {
    const u = userFreqs[i];
    const n = nativeFreqs[i];
    dotProduct += u * n;
    userNorm += u * u;
    nativeNorm += n * n;
  }

  const cosineSimilarity =
    userNorm > 0 && nativeNorm > 0
      ? dotProduct / (Math.sqrt(userNorm) * Math.sqrt(nativeNorm))
      : 0;

  const spectralDistance = Math.max(0, Math.min(1, 1 - cosineSimilarity));

  // 2. Formant Profile Alignment (Vowel openness F1 & frontness F2)
  const uForm = userFrame.formants;
  const nForm = nativeTemplate.targetFormants;

  const f0Diff = Math.abs(uForm.f0 - nForm.f0);
  const f1Diff = Math.abs(uForm.f1 - nForm.f1);
  const f2Diff = Math.abs(uForm.f2 - nForm.f2);
  const f3Diff = Math.abs(uForm.f3 - nForm.f3);
  const sibDiff = Math.abs(uForm.sibilants - nForm.sibilants);

  const avgFormantError = (f0Diff * 0.2 + f1Diff * 0.3 + f2Diff * 0.25 + f3Diff * 0.15 + sibDiff * 0.1);
  const formantMatch = Math.max(0, Math.min(100, Math.round((1 - avgFormantError) * 100)));

  // 3. Pitch Intonation Alignment
  let pitchMatch = 75;
  if (userFrame.isVoiced && userFrame.f0PitchHz > 0) {
    const pitchRatio = userFrame.f0PitchHz / nativeTemplate.targetPitchHz;
    // Semitone deviation approximation
    const semitonesOff = Math.abs(12 * Math.log2(pitchRatio));
    // Within 2-3 semitones is excellent for natural gender/accent speech variation
    pitchMatch = Math.max(45, Math.min(100, Math.round(98 - semitonesOff * 7)));
  }

  // 4. Clarity & Spectral Centroid Proximity
  const centroidRatio = userFrame.spectralCentroidHz / Math.max(400, nativeTemplate.targetCentroidHz);
  const clarityScore = Math.max(
    50,
    Math.min(100, Math.round(95 - Math.abs(1 - centroidRatio) * 35))
  );

  // 5. Blended Overall Duel Match Score
  // Cosine spectrum similarity (40%) + Formant structure (35%) + Clarity (15%) + Pitch (10%)
  const spectralScoreComponent = Math.round(cosineSimilarity * 100);
  const rawScore =
    spectralScoreComponent * 0.40 +
    formantMatch * 0.35 +
    clarityScore * 0.15 +
    pitchMatch * 0.10;

  // Apply volume stability gate
  const volumeMultiplier = Math.min(1, Math.max(0.65, userFrame.rmsVolume * 2));
  const overallMatch = Math.max(15, Math.min(99, Math.round(rawScore * volumeMultiplier)));

  // Identify Dominant Acoustic Formant active right now
  let dominantFormant = 'Fondamentale F0';
  if (uForm.f1 > uForm.f0 && uForm.f1 > uForm.f2) dominantFormant = 'Voyelle Basse F1';
  else if (uForm.f2 > uForm.f1 && uForm.f2 > uForm.sibilants) dominantFormant = 'Voyelle Haute F2';
  else if (uForm.sibilants > 0.45) dominantFormant = 'Consonnes & Sibilantes';
  else if (uForm.f3 > 0.5) dominantFormant = 'Timbre & Rhotacisme';

  // Real-time Tactical Feedback and Badge Level
  let activeFeedback = 'Bonne projection • Continuez avec régularité';
  let badgeLevel: 'master' | 'expert' | 'good' | 'adjusting' | 'silent' = 'good';

  if (overallMatch >= 88) {
    badgeLevel = 'master';
    activeFeedback = '🌟 RÉSONANCE NATIVE PARFAITE • Spectre & Formants Alignés !';
  } else if (overallMatch >= 76) {
    badgeLevel = 'expert';
    activeFeedback = '🎯 EXCELLENT • Timbre & Harmoniques Vowel en concordance';
  } else if (overallMatch >= 60) {
    badgeLevel = 'good';
    activeFeedback = '⚡ BONNE PROJECTION • Accentuez l’ouverture des voyelles';
  } else {
    badgeLevel = 'adjusting';
    activeFeedback = '📈 AJUSTEZ LE TIMBRE • Stabilisez le souffle et étirez les voyelles';
  }

  return {
    overallMatch,
    formantMatch,
    spectralDistance,
    pitchMatch,
    clarityScore,
    activeFeedback,
    badgeLevel,
    dominantFormant
  };
}
