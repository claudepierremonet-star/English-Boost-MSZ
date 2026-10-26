import React, { useState, useEffect } from 'react';
import {
  getAvailableUsVoices,
  getBestUsVoice,
  getPreferredUsVoiceGender,
  setPreferredUsVoiceGender,
  getCustomUsVoiceURI,
  setCustomUsVoiceURI,
  getAutoPlayOnDisplay,
  setAutoPlayOnDisplay,
  peekNextAlternatingAccent,
  speakText,
  stopSpeech,
  type VoiceGender,
  ACCENTS_INFO
} from '../services/speechService';

interface AmericanAccentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AmericanAccentStudioModal: React.FC<AmericanAccentStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [gender, setGender] = useState<VoiceGender>(getPreferredUsVoiceGender());
  const [selectedURI, setSelectedURI] = useState<string>(getCustomUsVoiceURI() || '');
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(getAutoPlayOnDisplay());

  useEffect(() => {
    if (!isOpen) return;

    const refresh = () => {
      const v = getAvailableUsVoices();
      setAvailableVoices(v);
      setCurrentVoice(getBestUsVoice());
    };

    refresh();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refresh;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenderChange = (g: VoiceGender) => {
    setGender(g);
    setPreferredUsVoiceGender(g);
    // Reset custom URI when changing gender mode to pick best of that gender
    setSelectedURI('');
    setCustomUsVoiceURI(null);
    setTimeout(() => {
      setCurrentVoice(getBestUsVoice());
    }, 50);
  };

  const handleVoiceSelect = (uri: string) => {
    setSelectedURI(uri);
    setCustomUsVoiceURI(uri || null);
    setTimeout(() => {
      setCurrentVoice(getBestUsVoice());
    }, 50);
  };

  const testPhrase = (text: string, key: string, accent: 'en-US' | 'en-GB' = 'en-US') => {
    setPlayingKey(`${key}-${accent}`);
    speakText(text, accent, `studio-test-${key}`, {
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null)
    });
  };

  const benchmarkSamples = [
    {
      id: 'flap-t',
      title: 'Le « Flap T » américain [ɾ]',
      sentence: 'Could I get a glass of water and a little butter in the city?',
      phonetic: '/ˈwɑːt̬ɚ/ • /ˈbʌt̬ɚ/ • /ˈsɪt̬i/',
      explanation: 'En anglais américain, le "t" entre deux voyelles est adouci en consonne battue [ɾ], semblable à un "d" rapide et fluide.'
    },
    {
      id: 'rhotic-r',
      title: 'Le rhotisme rétroflexe américain /r/',
      sentence: 'The morning stars shine over Harvard yard and hard workers.',
      phonetic: '/ˈmɔːrnɪŋ/ • /ˈhɑːrvɚd/ • /ˈhɑːrd ˈwɜːrkɚz/',
      explanation: 'Le /r/ américain est toujours prononcé avec intensité par recul de la langue, contrairement à l\'anglais britannique non-rhôtique.'
    },
    {
      id: 'flat-a',
      title: 'La voyelle plate /æ/ (TRAP-BATH Split)',
      sentence: 'I can’t dance after class in the afternoon.',
      phonetic: '/kænt/ • /dæns/ • /ˈæftɚ/ • /klæs/',
      explanation: 'Aux USA, la voyelle dans "dance" et "can\'t" est un /æ/ éclatant et ouvert, alors qu\'en Grande-Bretagne elle est un /ɑː/ sombre et arrondi.'
    },
    {
      id: 'lexical',
      title: 'Différences lexicales & accents d’emphase',
      sentence: 'Our schedule allows complete privacy during the advertisement.',
      phonetic: 'US: /ˈskɛdʒuːl/ & /ˈpraɪvəsi/ vs UK: /ˈʃɛdjuːl/ & /ˈprɪvəsi/',
      explanation: 'Les Américains prononcent "sk" dans schedule et "pry" dans privacy avec une intonation résolue.'
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="american-accent-studio-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0c1322] border-2 border-[#38bdf8]/60 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col gap-4 text-[#dce2f8] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Luxury US Emblem */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] border border-[#38bdf8]/40 flex items-center justify-center text-xl shadow-md">
              🇺🇸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
                  STUDIO D'AUTHENTICITÉ VOCALE
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] font-mono text-[9px] font-bold">
                  General American
                </span>
              </div>
              <h3 id="american-accent-studio-title" className="font-serif font-bold text-lg sm:text-xl text-white">
                Perfectionnement de l'Accent Américain
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Active Voice Status Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#101b2d] to-[#0c1626] border border-[#38bdf8]/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#38bdf8] font-mono font-bold">
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                <span>MOTEUR VOCAL AMÉRICAIN ACTIF :</span>
              </div>
              <div className="font-serif text-base font-bold text-white mt-0.5">
                {currentVoice?.name || 'Voix Américaine Standard (Système)'}
              </div>
              <div className="text-[10px] text-[#94a3b8] font-mono mt-0.5">
                Langue : {currentVoice?.lang || 'en-US'} • Rhotisme & Flap T calibrés
              </div>
            </div>

            {/* Quick Test Button */}
            <button
              type="button"
              onClick={() => testPhrase('Hello! This is authentic American English with natural cadence and rhotic clarity.', 'active-voice-demo')}
              className="px-3.5 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0c1322] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {playingKey === 'active-voice-demo-en-US' ? 'graphic_eq' : 'volume_up'}
              </span>
              <span>Tester la Voix</span>
            </button>
          </div>

          {/* Gender Preference Controls */}
          <div className="p-3.5 rounded-xl bg-[#151c2c] border border-[#212b40] flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#d4af37]">
              Profil Vocal Préféré :
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] shadow-md font-bold'
                    : 'bg-[#192338] text-[#dce2f8] border-[#2e3b55] hover:bg-[#24334f]'
                }`}
              >
                <span>👩</span>
                <span>Féminine (Jenny / Samantha)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] shadow-md font-bold'
                    : 'bg-[#192338] text-[#dce2f8] border-[#2e3b55] hover:bg-[#24334f]'
                }`}
              >
                <span>👨</span>
                <span>Masculine (Guy / Alex)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('auto')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  gender === 'auto'
                    ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] shadow-md font-bold'
                    : 'bg-[#192338] text-[#dce2f8] border-[#2e3b55] hover:bg-[#24334f]'
                }`}
              >
                <span>⚡</span>
                <span>Auto (Haute Fidélité)</span>
              </button>
            </div>

            {/* Custom Voice Dropdown if multiple voices are installed */}
            {availableVoices.length > 1 && (
              <div className="mt-2 pt-2 border-t border-[#232a3a]">
                <label htmlFor="voice-select" className="text-[10px] font-mono text-[#94a3b8] block mb-1">
                  Choisir manuellement une voix US parmi celles installées sur votre appareil :
                </label>
                <select
                  id="voice-select"
                  aria-label="Choisir manuellement une voix US parmi celles installées sur votre appareil"
                  value={selectedURI}
                  onChange={(e) => handleVoiceSelect(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0c1322] border border-[#2e3b55] text-xs text-[#dce2f8] font-mono focus:border-[#38bdf8] outline-none"
                >
                  <option value="">Sélection Automatique Optimale (Recommandée)</option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Configuration Lecture Audio Automatique Alternée */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#151c2c] to-[#0f172a] border border-[#f2ca50]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">
                  autoplay
                </span>
                <div>
                  <span className="text-xs text-[#f2ca50] font-bold uppercase tracking-wider block font-sans">
                    Lecture Audio Automatique Alternée
                  </span>
                  <span className="text-[10px] text-[#94a3b8] font-mono">
                    Alternance intelligente 50/50 &bull; UK 🇬🇧 / US 🇺🇸
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => {
                  const next = !autoPlayAudio;
                  setAutoPlayAudio(next);
                  setAutoPlayOnDisplay(next);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border ${
                  autoPlayAudio ? 'bg-[#f2ca50] border-[#f2ca50]' : 'bg-[#232a3a] border-[#4d4635]'
                }`}
                title="Activer ou désactiver la lecture automatique des citations et phrases"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0c1322] transition-transform ${
                    autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Dès qu'une nouvelle citation ou phrase est affichée, l'application la récite spontanément à voix haute en alternant entre l'anglais britannique et l'anglais américain.
            </p>

            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[#dce2f8]">
                <span className="text-[10px] text-[#94a3b8]">Prochain accent :</span>
                <span className="font-bold text-[#f2ca50]">
                  {peekNextAlternatingAccent() === 'en-GB' ? '🇬🇧 British (UK)' : '🇺🇸 American (US)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextAccent = peekNextAlternatingAccent();
                  testPhrase("Elegance is an art of disciplined expression.", "autoplay-toggle-test", nextAccent);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1e2b42] hover:bg-[#283957] text-xs font-semibold text-[#f2ca50] flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-[#f2ca50]/30"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span>
                <span>Tester</span>
              </button>
            </div>
          </div>

          {/* Benchmark Comparison: 4 Fundamental Pillars of Authentic American Accent */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#f2ca50] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">compare_arrows</span>
                Piliers de l'Authenticité Américaine (Écoute Comparative)
              </span>
              <span className="text-[10px] text-[#94a3b8] font-mono">Comparez avec le haut-parleur UK</span>
            </div>

            {benchmarkSamples.map((sample) => (
              <div
                key={sample.id}
                className="p-3.5 rounded-xl bg-[#151c2c] border border-[#222e44] hover:border-[#38bdf8]/40 transition-colors flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-serif font-bold text-sm text-white">
                    {sample.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {/* Test US */}
                    <button
                      type="button"
                      onClick={() => testPhrase(sample.sentence, sample.id, 'en-US')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                        playingKey === `${sample.id}-en-US`
                          ? 'bg-[#38bdf8] text-[#0c1322] border-[#38bdf8] animate-pulse shadow-md'
                          : 'bg-[#1e2b42] text-[#38bdf8] border-[#38bdf8]/40 hover:bg-[#283957]'
                      }`}
                      title="Écouter en accent américain authentique"
                    >
                      <span>🇺🇸 US</span>
                      <span className="material-symbols-outlined text-[13px]">
                        {playingKey === `${sample.id}-en-US` ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>

                    {/* Test UK for contrast */}
                    <button
                      type="button"
                      onClick={() => testPhrase(sample.sentence, sample.id, 'en-GB')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                        playingKey === `${sample.id}-en-GB`
                          ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] animate-pulse shadow-md'
                          : 'bg-[#1e2b42] text-[#f2ca50] border-[#f2ca50]/40 hover:bg-[#283957]'
                      }`}
                      title="Écouter en accent britannique pour comparer"
                    >
                      <span>🇬🇧 UK</span>
                      <span className="material-symbols-outlined text-[13px]">
                        {playingKey === `${sample.id}-en-GB` ? 'graphic_eq' : 'volume_up'}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="font-serif italic text-xs sm:text-sm text-[#e2e8f0] bg-[#0c1322]/60 p-2 rounded-lg border border-[#1e293b]">
                  “{sample.sentence}”
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#94a3b8] gap-1 pt-1 border-t border-[#1e293b]">
                  <span className="font-mono text-[#38bdf8]">{sample.phonetic}</span>
                  <span className="text-[10px] italic text-[#cbd5e1]">{sample.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
          <span className="text-[11px] text-[#94a3b8] font-mono">
            Optimisation vocale active sur tous les haut-parleurs 🇺🇸 de l'application
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Valider & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
