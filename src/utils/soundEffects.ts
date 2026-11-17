/**
 * Indices sonores légers et élégants (Web Audio API)
 * Synthèse acoustique douce (harpe / célesta / bois feutré) adaptée à l'esthétique Oxford d'English Boost MSZ.
 * Aucune dépendance externe, aucune latence réseau, désactivable à tout moment.
 */

const SOUND_PREF_KEY = 'eb_msz_sound_effects_enabled_v1';
export const SOUND_EFFECTS_EVENT = 'eb_sound_effects_changed';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtxClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function isSoundEffectsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = window.localStorage.getItem(SOUND_PREF_KEY);
    if (saved === null) return true;
    return saved === 'true';
  } catch {
    return true;
  }
}

export function setSoundEffectsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent<boolean>(SOUND_EFFECTS_EVENT, { detail: enabled }));
  } catch {
    // Ignore storage quota errors
  }
}

export function toggleSoundEffects(): boolean {
  const next = !isSoundEffectsEnabled();
  setSoundEffectsEnabled(next);
  if (next) {
    // Subtle confirmation chime when re-enabling
    playSelectCue();
  }
  return next;
}

interface ToneOptions {
  freqStart: number;
  freqEnd?: number;
  durationSec: number;
  delaySec?: number;
  gainPeak: number;
  type?: OscillatorType;
  filterFreq?: number;
}

function scheduleWarmTone(ctx: AudioContext, opts: ToneOptions): void {
  const now = ctx.currentTime + (opts.delaySec ?? 0);
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freqStart, now);
  if (opts.freqEnd && opts.freqEnd !== opts.freqStart) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.freqEnd), now + opts.durationSec);
  }

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(opts.filterFreq ?? 2400, now);
  filter.Q.setValueAtTime(0.7, now);

  // Smooth ADSR envelope to prevent any click/pop
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(opts.gainPeak, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.durationSec);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + opts.durationSec + 0.02);
}

/**
 * Indice subtil lors de la sélection d'une réponse ou du placement d'une tuile/mot.
 * Son feutré type porcelaine / harpe douce.
 */
export function playSelectCue(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Fondamentale douce (Ré5 -> Mi5 léger glissando) + harmonique cristalline très discrète
    scheduleWarmTone(ctx, {
      freqStart: 587.33,
      freqEnd: 659.25,
      durationSec: 0.065,
      gainPeak: 0.042,
      type: 'sine',
      filterFreq: 2200
    });
    scheduleWarmTone(ctx, {
      freqStart: 1174.66,
      durationSec: 0.045,
      gainPeak: 0.014,
      type: 'sine',
      filterFreq: 2600
    });
  } catch {
    // Ignore audio context edge errors
  }
}

/**
 * Indice feutré lors du retrait d'une tuile ou d'un mot sélectionné.
 */
export function playDeselectCue(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    scheduleWarmTone(ctx, {
      freqStart: 493.88,
      freqEnd: 392.0,
      durationSec: 0.055,
      gainPeak: 0.03,
      type: 'sine',
      filterFreq: 1600
    });
  } catch {
    // Ignore audio context edge errors
  }
}

/**
 * Carillon cristallin doux (tierce et quinte majeures) pour une bonne réponse.
 */
export function playCorrectCue(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Do5 -> Mi5 -> Sol5 (accord chaleureux façon célesta)
    scheduleWarmTone(ctx, {
      freqStart: 523.25,
      durationSec: 0.14,
      delaySec: 0,
      gainPeak: 0.045,
      type: 'sine',
      filterFreq: 2500
    });
    scheduleWarmTone(ctx, {
      freqStart: 659.25,
      durationSec: 0.16,
      delaySec: 0.055,
      gainPeak: 0.048,
      type: 'sine',
      filterFreq: 2600
    });
    scheduleWarmTone(ctx, {
      freqStart: 783.99,
      durationSec: 0.24,
      delaySec: 0.11,
      gainPeak: 0.042,
      type: 'triangle',
      filterFreq: 2100
    });
  } catch {
    // Ignore
  }
}

/**
 * Double note boisée feutrée (jamais stridente) pour une réponse inexacte.
 */
export function playIncorrectCue(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Mi4 -> Ré4 feutré
    scheduleWarmTone(ctx, {
      freqStart: 329.63,
      durationSec: 0.11,
      delaySec: 0,
      gainPeak: 0.042,
      type: 'sine',
      filterFreq: 950
    });
    scheduleWarmTone(ctx, {
      freqStart: 293.66,
      freqEnd: 261.63,
      durationSec: 0.16,
      delaySec: 0.075,
      gainPeak: 0.038,
      type: 'sine',
      filterFreq: 850
    });
  } catch {
    // Ignore
  }
}

/**
 * Arpège célesta ascendant lors de la réussite d'un chapitre, d'un quiz ou de la conquête d'un niveau.
 */
export function playVictoryCue(): void {
  if (!isSoundEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      scheduleWarmTone(ctx, {
        freqStart: freq,
        durationSec: idx === notes.length - 1 ? 0.42 : 0.2,
        delaySec: idx * 0.07,
        gainPeak: 0.045,
        type: idx === notes.length - 1 ? 'triangle' : 'sine',
        filterFreq: 2600
      });
    });
  } catch {
    // Ignore
  }
}
