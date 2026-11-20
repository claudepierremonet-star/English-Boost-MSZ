/**
 * Moteur Audio Spatial 3D léger (Web Audio API) pour le Studio d'Élocution
 *
 * - Utilise `PannerNode` (modèle binaural HRTF, coordonnées 3D x/y/z) pour spatialiser
 *   les interactions (navigation carrousel, changement d'accent, changement de mode, compte à rebours).
 * - Synthétise une réponse impulsionnelle de salle procédurale (`ConvolverNode`) sans aucun
 *   fichier audio externe pour simuler l'acoustique d'un studio choisi (Cabine BBC,
 *   Bibliothèque d'Oxford, Amphithéâtre de Westminster, ou Silencieux).
 * - Génère une ambiance acoustique 3D ultra-légère et réactive pendant l'enregistrement
 *   (atténuation automatique « ducking » lorsque l'utilisateur parle au micro).
 * - Respecte strictement le réglage global `isSoundEffectsEnabled()`.
 */

import { isSoundEffectsEnabled } from './soundEffects';

export type StudioAcousticPreset = 'library' | 'booth' | 'auditorium' | 'off';

export interface StudioAcousticPresetInfo {
  id: StudioAcousticPreset;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  decaySec: number;
  wetMix: number;
  baseBedGain: number;
  filterHz: number;
}

export const STUDIO_ACOUSTIC_PRESETS: Record<StudioAcousticPreset, StudioAcousticPresetInfo> = {
  library: {
    id: 'library',
    label: 'Bibliothèque d’Oxford',
    shortLabel: 'Oxford 3D',
    description: 'Acoustique boisée feutrée avec réverbération naturelle modérée.',
    icon: 'menu_book',
    decaySec: 0.55,
    wetMix: 0.28,
    baseBedGain: 0.0085,
    filterHz: 210
  },
  booth: {
    id: 'booth',
    label: 'Cabine Studio BBC',
    shortLabel: 'Cabine BBC',
    description: 'Réflexions courtes et proches, idéal pour la diction chirurgicale.',
    icon: 'mic_external_on',
    decaySec: 0.22,
    wetMix: 0.16,
    baseBedGain: 0.0055,
    filterHz: 165
  },
  auditorium: {
    id: 'auditorium',
    label: 'Amphithéâtre Westminster',
    shortLabel: 'Amphi 3D',
    description: 'Espace oratoire ample avec halo acoustique panoramique.',
    icon: 'theater_comedy',
    decaySec: 1.05,
    wetMix: 0.38,
    baseBedGain: 0.0105,
    filterHz: 250
  },
  off: {
    id: 'off',
    label: 'Studio Silencieux',
    shortLabel: 'Silencieux',
    description: 'Désactive le lit acoustique d’ambiance pendant l’enregistrement.',
    icon: 'volume_off',
    decaySec: 0.12,
    wetMix: 0.08,
    baseBedGain: 0,
    filterHz: 140
  }
};

const STUDIO_ROOM_PREF_KEY = 'eb_msz_studio_3d_room_v1';
export const STUDIO_3D_ROOM_EVENT = 'eb_studio_3d_room_changed';

let studioAudioCtx: AudioContext | null = null;
const impulseCache = new Map<string, AudioBuffer>();

interface ActiveAmbianceSession {
  preset: StudioAcousticPreset;
  masterGain: GainNode;
  noiseSource: AudioBufferSourceNode;
  droneOscA: OscillatorNode;
  droneOscB: OscillatorNode;
  orbitPanner: PannerNode | null;
  orbitTimer: ReturnType<typeof setInterval> | null;
  startedAt: number;
  baseGain: number;
  isStopping: boolean;
}

let activeAmbiance: ActiveAmbianceSession | null = null;

export function getStudioAcousticPreset(): StudioAcousticPreset {
  if (typeof window === 'undefined') return 'library';
  try {
    const saved = window.localStorage.getItem(STUDIO_ROOM_PREF_KEY);
    if (saved === 'library' || saved === 'booth' || saved === 'auditorium' || saved === 'off') {
      return saved;
    }
    return 'library';
  } catch {
    return 'library';
  }
}

export function setStudioAcousticPreset(preset: StudioAcousticPreset): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STUDIO_ROOM_PREF_KEY, preset);
    window.dispatchEvent(new CustomEvent<StudioAcousticPreset>(STUDIO_3D_ROOM_EVENT, { detail: preset }));
  } catch {
    // Ignore storage errors
  }
}

function getStudioAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;

    if (!studioAudioCtx || studioAudioCtx.state === 'closed') {
      studioAudioCtx = new AudioCtxClass();
      configureListenerOrigin(studioAudioCtx);
    }
    if (studioAudioCtx.state === 'suspended') {
      studioAudioCtx.resume().catch(() => {});
    }
    return studioAudioCtx;
  } catch {
    return null;
  }
}

function configureListenerOrigin(ctx: AudioContext): void {
  try {
    const listener = ctx.listener;
    if (!listener) return;
    const now = ctx.currentTime;
    if (listener.positionX && typeof listener.positionX.setValueAtTime === 'function') {
      listener.positionX.setValueAtTime(0, now);
      listener.positionY.setValueAtTime(0, now);
      listener.positionZ.setValueAtTime(0, now);
      listener.forwardX?.setValueAtTime(0, now);
      listener.forwardY?.setValueAtTime(0, now);
      listener.forwardZ?.setValueAtTime(-1, now);
      listener.upX?.setValueAtTime(0, now);
      listener.upY?.setValueAtTime(1, now);
      listener.upZ?.setValueAtTime(0, now);
    } else if (typeof (listener as unknown as { setPosition?: (...args: number[]) => void }).setPosition === 'function') {
      (listener as unknown as { setPosition: (x: number, y: number, z: number) => void }).setPosition(0, 0, 0);
      (listener as unknown as { setOrientation?: (...args: number[]) => void }).setOrientation?.(0, 0, -1, 0, 1, 0);
    }
  } catch {
    // Ignore listener orientation errors on partial implementations
  }
}

function createSpatialPanner(ctx: AudioContext, x: number, y: number, z: number): PannerNode | null {
  if (typeof ctx.createPanner !== 'function') return null;
  try {
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 20;
    panner.rolloffFactor = 0.85;
    setPannerPosition(ctx, panner, x, y, z);
    return panner;
  } catch {
    return null;
  }
}

function setPannerPosition(ctx: AudioContext, panner: PannerNode, x: number, y: number, z: number, rampSec = 0): void {
  try {
    const now = ctx.currentTime;
    if (panner.positionX && typeof panner.positionX.setValueAtTime === 'function') {
      if (rampSec > 0 && typeof panner.positionX.linearRampToValueAtTime === 'function') {
        panner.positionX.linearRampToValueAtTime(x, now + rampSec);
        panner.positionY.linearRampToValueAtTime(y, now + rampSec);
        panner.positionZ.linearRampToValueAtTime(z, now + rampSec);
      } else {
        panner.positionX.setValueAtTime(x, now);
        panner.positionY.setValueAtTime(y, now);
        panner.positionZ.setValueAtTime(z, now);
      }
    } else if (typeof (panner as unknown as { setPosition?: (...args: number[]) => void }).setPosition === 'function') {
      (panner as unknown as { setPosition: (px: number, py: number, pz: number) => void }).setPosition(x, y, z);
    }
  } catch {
    // Ignore panner positioning issues
  }
}

function getRoomImpulseBuffer(ctx: AudioContext, preset: StudioAcousticPreset): AudioBuffer | null {
  if (typeof ctx.createBuffer !== 'function') return null;
  const info = STUDIO_ACOUSTIC_PRESETS[preset];
  const cacheKey = `${preset}-${ctx.sampleRate}`;
  const cached = impulseCache.get(cacheKey);
  if (cached) return cached;

  try {
    const sampleRate = ctx.sampleRate || 44100;
    const length = Math.max(1024, Math.floor(sampleRate * info.decaySec));
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lpState = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Exponential acoustic decay with gentle early reflection emphasis
        const envelope = Math.pow(1 - t, preset === 'auditorium' ? 2.1 : 3.2);
        const white = Math.random() * 2 - 1;
        // One-pole lowpass warmth so room tail sounds wooden rather than metallic
        lpState = lpState * 0.72 + white * 0.28;
        // Slight L/R decorrelation for natural stereo 3D width
        const stereoPhase = ch === 0 ? 1 : 0.96;
        data[i] = lpState * envelope * stereoPhase * 0.55;
      }
    }

    impulseCache.set(cacheKey, buffer);
    return buffer;
  } catch {
    return null;
  }
}

interface SpatialToneOptions {
  freqStart: number;
  freqEnd?: number;
  durationSec: number;
  delaySec?: number;
  gainPeak: number;
  type?: OscillatorType;
  filterFreq?: number;
  x?: number;
  y?: number;
  z?: number;
  endX?: number;
  endZ?: number;
  presetOverride?: StudioAcousticPreset;
}

function scheduleSpatialTone3D(ctx: AudioContext, opts: SpatialToneOptions): void {
  const now = ctx.currentTime + (opts.delaySec ?? 0);
  const preset = opts.presetOverride ?? getStudioAcousticPreset();
  const presetInfo = STUDIO_ACOUSTIC_PRESETS[preset];

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freqStart, now);
  if (opts.freqEnd && opts.freqEnd !== opts.freqStart) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.freqEnd), now + opts.durationSec);
  }

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(opts.filterFreq ?? 2600, now);
  filter.Q.setValueAtTime(0.75, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(opts.gainPeak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.durationSec);

  osc.connect(filter);
  filter.connect(gain);

  const startX = opts.x ?? 0;
  const startY = opts.y ?? 0;
  const startZ = opts.z ?? -1.5;

  const panner = createSpatialPanner(ctx, startX, startY, startZ);
  const tailNode: AudioNode = panner ? panner : gain;
  if (panner) {
    gain.connect(panner);
    if (opts.endX !== undefined || opts.endZ !== undefined) {
      setPannerPosition(
        ctx,
        panner,
        opts.endX ?? startX,
        startY,
        opts.endZ ?? startZ,
        opts.durationSec
      );
    }
  }

  // Dry path
  tailNode.connect(ctx.destination);

  // Subtle 3D Room Convolver Wet Path
  if (presetInfo.wetMix > 0.02 && typeof ctx.createConvolver === 'function') {
    const impulse = getRoomImpulseBuffer(ctx, preset);
    if (impulse) {
      try {
        const convolver = ctx.createConvolver();
        convolver.buffer = impulse;
        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(presetInfo.wetMix * 0.55, now);
        tailNode.connect(convolver);
        convolver.connect(wetGain);
        wetGain.connect(ctx.destination);
      } catch {
        // Fallback to dry-only if convolver fails
      }
    }
  }

  osc.start(now);
  osc.stop(now + opts.durationSec + 0.03);
}

/**
 * Navigation spatialisée dans le carrousel du Studio d'Élocution.
 * Gauche (-2.4) pour précédent, Droite (+2.4) pour suivant.
 */
export function playStudioNavCue3D(direction: 'prev' | 'next' | 'neutral' = 'neutral'): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    const startX = direction === 'prev' ? -2.4 : direction === 'next' ? 2.4 : 0;
    const endX = direction === 'prev' ? -0.8 : direction === 'next' ? 0.8 : 0;
    scheduleSpatialTone3D(ctx, {
      freqStart: direction === 'prev' ? 587.33 : 659.25,
      freqEnd: direction === 'prev' ? 523.25 : 739.99,
      durationSec: 0.09,
      gainPeak: 0.036,
      type: 'sine',
      filterFreq: 2400,
      x: startX,
      y: 0.2,
      z: -1.4,
      endX
    });
  } catch {
    // Ignore audio context edge errors
  }
}

/**
 * Changement d'accent natif spatialisé (UK Oxford à gauche, US GenAm à droite).
 */
export function playStudioAccentCue3D(accent: 'en-GB' | 'en-US'): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    const xPos = accent === 'en-GB' ? -1.6 : 1.6;
    const baseFreq = accent === 'en-GB' ? 523.25 : 587.33;
    const fifthFreq = accent === 'en-GB' ? 783.99 : 880.0;

    scheduleSpatialTone3D(ctx, {
      freqStart: baseFreq,
      durationSec: 0.12,
      gainPeak: 0.035,
      type: 'sine',
      x: xPos,
      y: 0.3,
      z: -1.3
    });
    scheduleSpatialTone3D(ctx, {
      freqStart: fifthFreq,
      durationSec: 0.17,
      delaySec: 0.055,
      gainPeak: 0.03,
      type: 'triangle',
      filterFreq: 2200,
      x: xPos * 0.65,
      y: 0.45,
      z: -1.6
    });
  } catch {
    // Ignore
  }
}

/**
 * Changement de mode / onglet ou sélection d'environnement acoustique 3D.
 */
export function playStudioModeSwitchCue3D(
  mode: 'cursus' | 'dictation' | 'duel' | 'tab' | 'room',
  presetOverride?: StudioAcousticPreset
): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    if (mode === 'duel') {
      // Balayage stéréo 3D dynamique gauche -> droite pour le mode Duel
      scheduleSpatialTone3D(ctx, {
        freqStart: 440,
        freqEnd: 659.25,
        durationSec: 0.14,
        gainPeak: 0.036,
        type: 'triangle',
        x: -2.0,
        z: -1.2,
        endX: 2.0,
        presetOverride
      });
      scheduleSpatialTone3D(ctx, {
        freqStart: 880,
        durationSec: 0.2,
        delaySec: 0.07,
        gainPeak: 0.028,
        type: 'sine',
        x: 1.4,
        y: 0.4,
        z: -1.5,
        presetOverride
      });
      return;
    }

    const chord = mode === 'room' ? [392.0, 493.88, 587.33] : [493.88, 659.25];
    chord.forEach((freq, idx) => {
      scheduleSpatialTone3D(ctx, {
        freqStart: freq,
        durationSec: idx === chord.length - 1 ? 0.22 : 0.11,
        delaySec: idx * 0.045,
        gainPeak: 0.03,
        type: idx === chord.length - 1 ? 'triangle' : 'sine',
        x: (idx - (chord.length - 1) / 2) * 1.4,
        y: 0.2,
        z: -1.6,
        presetOverride
      });
    });
  } catch {
    // Ignore
  }
}

/**
 * Signal spatial "On-Air" lors du démarrage de l'enregistrement micro.
 * Halo doux s'ouvrant du centre vers les côtés (3D stereo bloom).
 */
export function playStudioRecordStartCue3D(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    scheduleSpatialTone3D(ctx, {
      freqStart: 440,
      durationSec: 0.13,
      gainPeak: 0.036,
      type: 'sine',
      x: 0,
      y: 0,
      z: -1.1
    });
    scheduleSpatialTone3D(ctx, {
      freqStart: 659.25,
      durationSec: 0.22,
      delaySec: 0.055,
      gainPeak: 0.032,
      type: 'sine',
      x: -1.5,
      y: 0.3,
      z: -1.5
    });
    scheduleSpatialTone3D(ctx, {
      freqStart: 880,
      durationSec: 0.24,
      delaySec: 0.065,
      gainPeak: 0.026,
      type: 'triangle',
      filterFreq: 2400,
      x: 1.5,
      y: 0.3,
      z: -1.5
    });
  } catch {
    // Ignore
  }
}

/**
 * Signal feutré lors de l'arrêt de l'enregistrement et du lancement de l'analyse.
 */
export function playStudioRecordStopCue3D(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    scheduleSpatialTone3D(ctx, {
      freqStart: 659.25,
      freqEnd: 523.25,
      durationSec: 0.13,
      gainPeak: 0.034,
      type: 'sine',
      x: 0.9,
      z: -1.3,
      endX: 0
    });
    scheduleSpatialTone3D(ctx, {
      freqStart: 392.0,
      durationSec: 0.18,
      delaySec: 0.06,
      gainPeak: 0.028,
      type: 'sine',
      filterFreq: 1800,
      x: 0,
      z: -1.8
    });
  } catch {
    // Ignore
  }
}

/**
 * Compte à rebours spatialisé 3-2-1-GO pour le Pronunciation Duel.
 * 3 = gauche, 2 = centre, 1 = droite, 0 (GO) = accord spatial panoramique.
 */
export function playStudioCountdownTick3D(step: 3 | 2 | 1 | 0): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    if (step === 0) {
      playStudioRecordStartCue3D();
      return;
    }

    const xMap: Record<3 | 2 | 1, number> = { 3: -2.0, 2: 0, 1: 2.0 };
    const freqMap: Record<3 | 2 | 1, number> = { 3: 440, 2: 493.88, 1: 587.33 };
    scheduleSpatialTone3D(ctx, {
      freqStart: freqMap[step],
      durationSec: 0.12,
      gainPeak: 0.038,
      type: 'triangle',
      filterFreq: 2100,
      x: xMap[step],
      y: 0.25,
      z: -1.3
    });
  } catch {
    // Ignore
  }
}

/**
 * Arpège spatialisé 3D pour la validation ou le verdict du Studio d'Élocution.
 */
export function playStudioValidationCue3D(score: number): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    const notes =
      score >= 75
        ? [523.25, 659.25, 783.99, 1046.5]
        : [440, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const ratio = idx / Math.max(1, notes.length - 1);
      const x = -1.8 + ratio * 3.6;
      scheduleSpatialTone3D(ctx, {
        freqStart: freq,
        durationSec: idx === notes.length - 1 ? 0.36 : 0.18,
        delaySec: idx * 0.065,
        gainPeak: 0.036,
        type: idx === notes.length - 1 ? 'triangle' : 'sine',
        x,
        y: 0.2 + ratio * 0.35,
        z: -1.5
      });
    });
  } catch {
    // Ignore
  }
}

/**
 * Démarre un environnement acoustique 3D très léger et feutré pendant l'enregistrement.
 * Aucun routage du microphone vers les haut-parleurs : uniquement une synthèse d'ambiance
 * basse fréquence + harmonique spatiale en orbite lente qui s'efface lorsque l'utilisateur parle.
 */
export function startStudioAcousticAmbiance(presetOverride?: StudioAcousticPreset): void {
  stopStudioAcousticAmbiance(true);
  if (!isSoundEffectsEnabled()) return;

  const preset = presetOverride ?? getStudioAcousticPreset();
  if (preset === 'off') return;

  const info = STUDIO_ACOUSTIC_PRESETS[preset];
  if (info.baseBedGain <= 0) return;

  const ctx = getStudioAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate || 44100;

    // 1. Génération d'un souffle de salle feutré (bruit brun 2 secondes en boucle)
    const bufferLen = sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferLen, sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferLen; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      channel[i] = lastOut * 2.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const roomFilter = ctx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.setValueAtTime(info.filterHz, now);
    roomFilter.Q.setValueAtTime(0.6, now);

    // 2. Résonance harmonique ultra-douce (fondamentale chaude + quinte spatiale)
    const droneOscA = ctx.createOscillator();
    droneOscA.type = 'sine';
    droneOscA.frequency.setValueAtTime(preset === 'auditorium' ? 110 : 130.81, now);

    const droneOscB = ctx.createOscillator();
    droneOscB.type = 'sine';
    droneOscB.frequency.setValueAtTime(preset === 'auditorium' ? 164.81 : 196.0, now);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.18, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(info.baseBedGain, now + 0.45);

    noiseSource.connect(roomFilter);
    roomFilter.connect(masterGain);

    droneOscA.connect(droneGain);
    droneOscB.connect(droneGain);
    droneGain.connect(masterGain);

    // 3. Spatialisation 3D orbitale lente autour de l'orateur
    const orbitPanner = createSpatialPanner(ctx, 0, 0.25, -2.2);
    if (orbitPanner) {
      masterGain.connect(orbitPanner);
      orbitPanner.connect(ctx.destination);
    } else {
      masterGain.connect(ctx.destination);
    }

    noiseSource.start(now);
    droneOscA.start(now);
    droneOscB.start(now);

    const startedAt = Date.now();
    const orbitTimer = orbitPanner
      ? setInterval(() => {
          if (!studioAudioCtx || studioAudioCtx.state === 'closed') return;
          const elapsed = (Date.now() - startedAt) / 1000;
          const angle = elapsed * 0.45; // Rotation douce toutes les ~14 secondes
          const radius = preset === 'booth' ? 1.2 : preset === 'auditorium' ? 2.6 : 1.9;
          const px = Math.sin(angle) * radius;
          const pz = -1.6 + Math.cos(angle) * (radius * 0.55);
          setPannerPosition(studioAudioCtx, orbitPanner, px, 0.25, pz, 0.14);
        }, 150)
      : null;

    activeAmbiance = {
      preset,
      masterGain,
      noiseSource,
      droneOscA,
      droneOscB,
      orbitPanner,
      orbitTimer,
      startedAt,
      baseGain: info.baseBedGain,
      isStopping: false
    };
  } catch {
    // Fail silently if audio graph cannot start
  }
}

/**
 * Atténue doucement le lit acoustique 3D (« voice ducking ») proportionnellement
 * au volume détecté dans le microphone, afin que l'ambiance ne masque jamais la voix.
 */
export function updateStudioAmbianceReactiveVolume(micVolume0to1: number): void {
  if (!activeAmbiance || activeAmbiance.isStopping || !studioAudioCtx) return;
  try {
    const clamped = Math.max(0, Math.min(1, micVolume0to1));
    const duckFactor = 1 - clamped * 0.68;
    const targetGain = Math.max(0.0005, activeAmbiance.baseGain * duckFactor);
    activeAmbiance.masterGain.gain.setTargetAtTime(targetGain, studioAudioCtx.currentTime, 0.12);
  } catch {
    // Ignore audio param timing errors
  }
}

/**
 * Arrête proprement l'ambiance acoustique 3D avec un fondu sortant sans clic.
 */
export function stopStudioAcousticAmbiance(immediate = false): void {
  const session = activeAmbiance;
  if (!session) return;
  activeAmbiance = null;
  session.isStopping = true;

  if (session.orbitTimer) {
    clearInterval(session.orbitTimer);
    session.orbitTimer = null;
  }

  const cleanupNodes = () => {
    try {
      session.noiseSource.stop();
      session.noiseSource.disconnect();
    } catch {
      // Ignore already stopped
    }
    try {
      session.droneOscA.stop();
      session.droneOscA.disconnect();
    } catch {
      // Ignore
    }
    try {
      session.droneOscB.stop();
      session.droneOscB.disconnect();
    } catch {
      // Ignore
    }
    try {
      session.masterGain.disconnect();
      session.orbitPanner?.disconnect();
    } catch {
      // Ignore
    }
  };

  if (immediate || !studioAudioCtx || studioAudioCtx.state === 'closed') {
    cleanupNodes();
    return;
  }

  try {
    const now = studioAudioCtx.currentTime;
    session.masterGain.gain.cancelScheduledValues(now);
    session.masterGain.gain.setValueAtTime(Math.max(0.0001, session.masterGain.gain.value), now);
    session.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    setTimeout(cleanupNodes, 220);
  } catch {
    cleanupNodes();
  }
}
