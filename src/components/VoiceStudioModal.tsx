import React, { useState, useEffect, useMemo } from 'react';
import {
  VOICE_PERSONAS,
  type VoicePersona,
  type LanguageTarget,
  type AutoPlayAccentMode,
  getSelectedVoicePersona,
  setSelectedVoicePersona,
  previewVoicePersona,
  stopSpeech,
  subscribeToSpeechState,
  getAutoPlayOnFlip,
  setAutoPlayOnFlip,
  getAutoPlayOnDisplay,
  setAutoPlayOnDisplay,
  getAutoPlayAccentPreference,
  setAutoPlayAccentPreference,
  getAudioSpeedMultiplier,
  setAudioSpeedMultiplier
} from '../services/speechService';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LanguageTarget;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'en-GB'
}) => {
  const [activeLang, setActiveLang] = useState<LanguageTarget>(initialTab);
  const [filterMode, setFilterMode] = useState<'all' | 'female' | 'male' | 'grave'>('all');
  const [playingPersonaId, setPlayingPersonaId] = useState<string | null>(null);

  // Selected persona IDs
  const [selectedUsId, setSelectedUsId] = useState<string>(getSelectedVoicePersona('en-US').id);
  const [selectedUkId, setSelectedUkId] = useState<string>(getSelectedVoicePersona('en-GB').id);
  const [selectedFrId, setSelectedFrId] = useState<string>(getSelectedVoicePersona('fr-FR').id);

  // Auto-play settings
  const [autoPlayFlip, setAutoPlayFlipState] = useState<boolean>(getAutoPlayOnFlip());
  const [autoPlayDisplay, setAutoPlayDisplayState] = useState<boolean>(getAutoPlayOnDisplay());
  const [autoPlayAccent, setAutoPlayAccentState] = useState<AutoPlayAccentMode>(getAutoPlayAccentPreference());
  const [speedMultiplier, setSpeedMultiplierState] = useState<number>(getAudioSpeedMultiplier());

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Listen for external speech state
  useEffect(() => {
    const unsubscribe = subscribeToSpeechState((activeId) => {
      if (!activeId || !activeId.startsWith('preview-')) {
        setPlayingPersonaId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedUsId(getSelectedVoicePersona('en-US').id);
      setSelectedUkId(getSelectedVoicePersona('en-GB').id);
      setSelectedFrId(getSelectedVoicePersona('fr-FR').id);
      setAutoPlayFlipState(getAutoPlayOnFlip());
      setAutoPlayDisplayState(getAutoPlayOnDisplay());
      setAutoPlayAccentState(getAutoPlayAccentPreference());
      setSpeedMultiplierState(getAudioSpeedMultiplier());
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const currentSelectedId = useMemo(() => {
    if (activeLang === 'en-US') return selectedUsId;
    if (activeLang === 'en-GB') return selectedUkId;
    return selectedFrId;
  }, [activeLang, selectedUsId, selectedUkId, selectedFrId]);

  const personasForLang = useMemo(() => {
    return VOICE_PERSONAS.filter((p) => p.language === activeLang);
  }, [activeLang]);

  const filteredPersonas = useMemo(() => {
    return personasForLang.filter((p) => {
      if (filterMode === 'female') return p.gender === 'female';
      if (filterMode === 'male') return p.gender === 'male';
      if (filterMode === 'grave') return p.tone === 'grave';
      return true;
    });
  }, [personasForLang, filterMode]);

  if (!isOpen) return null;

  const handleSelectVoice = (persona: VoicePersona) => {
    setSelectedVoicePersona(persona.language, persona.id);
    if (persona.language === 'en-US') setSelectedUsId(persona.id);
    if (persona.language === 'en-GB') setSelectedUkId(persona.id);
    if (persona.language === 'fr-FR') setSelectedFrId(persona.id);

    showToast(`Voix « ${persona.name} » activée pour ${persona.accentBadge}`);
    // Play a preview to immediately hear the choice
    handleTestVoice(persona.id);
  };

  const handleTestVoice = (personaId: string) => {
    if (playingPersonaId === personaId) {
      stopSpeech();
      setPlayingPersonaId(null);
      return;
    }

    setPlayingPersonaId(personaId);
    previewVoicePersona(personaId, () => {
      setPlayingPersonaId(null);
    });
  };

  const handleToggleAutoPlayFlip = () => {
    const next = !autoPlayFlip;
    setAutoPlayFlipState(next);
    setAutoPlayOnFlip(next);
    showToast(
      next
        ? 'Lecture automatique dès retournement de carte activée 🔊'
        : 'Lecture automatique au retournement désactivée'
    );
  };

  const handleToggleAutoPlayDisplay = () => {
    const next = !autoPlayDisplay;
    setAutoPlayDisplayState(next);
    setAutoPlayOnDisplay(next);
    showToast(
      next
        ? 'Lecture auto au défilement activée'
        : 'Lecture auto au défilement désactivée'
    );
  };

  const handleSelectAccentMode = (mode: AutoPlayAccentMode) => {
    setAutoPlayAccentState(mode);
    setAutoPlayAccentPreference(mode);
    showToast(`Mode Auto-play : ${mode}`);
  };

  const handleSelectSpeed = (speed: number) => {
    setSpeedMultiplierState(speed);
    setAudioSpeedMultiplier(speed);
    showToast(`Vitesse de lecture ajustée à ${speed}x`);
  };

  const currentUsPersona = VOICE_PERSONAS.find((p) => p.id === selectedUsId);
  const currentUkPersona = VOICE_PERSONAS.find((p) => p.id === selectedUkId);
  const currentFrPersona = VOICE_PERSONAS.find((p) => p.id === selectedFrId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0f1d]/95 backdrop-blur-xl flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e273a] text-[#f2ca50] border border-[#f2ca50]/50 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl animate-bounce flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">record_voice_over</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar with iPhone safe area clearance */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-[#0c1322]/95 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 18px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#191f2f] transition-all cursor-pointer"
            aria-label="Fermer le studio"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#f3f4f6]">
                Studio Vocal & Prononciations
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 text-[10px] font-mono font-bold">
                30 VOIX NATURELLES
              </span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] font-mono">
              5 voix féminines &bull; 5 voix masculines &bull; Profils Normaux & Graves &bull; Anti-robotisation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#3b455b] text-xs font-mono text-[#dce2f8] hover:text-[#f2ca50] transition-all cursor-pointer"
        >
          Valider & Terminer
        </button>
      </header>

      {/* Scrollable Content Body */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Active Personas Summary Pill Bar */}
        <div className="p-4 rounded-2xl bg-[#121929] border border-[#232e44] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">graphic_eq</span>
            <span>Voix Actives :</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* UK Active */}
            <div className="px-3 py-1.5 rounded-xl bg-[#192338] border border-[#f2ca50]/40 flex items-center gap-2">
              <span className="text-sm">🇬🇧</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-bold text-[#f2ca50] leading-none">
                  {currentUkPersona?.name}
                </span>
                <span className="text-[9px] text-[#94a3b8] font-mono leading-none mt-0.5">
                  {currentUkPersona?.tone === 'grave' ? 'Grave' : 'Normale'}
                </span>
              </div>
            </div>

            {/* US Active */}
            <div className="px-3 py-1.5 rounded-xl bg-[#192338] border border-[#38bdf8]/40 flex items-center gap-2">
              <span className="text-sm">🇺🇸</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-bold text-[#38bdf8] leading-none">
                  {currentUsPersona?.name}
                </span>
                <span className="text-[9px] text-[#94a3b8] font-mono leading-none mt-0.5">
                  {currentUsPersona?.tone === 'grave' ? 'Grave' : 'Normale'}
                </span>
              </div>
            </div>

            {/* FR Active */}
            <div className="px-3 py-1.5 rounded-xl bg-[#192338] border border-emerald-400/40 flex items-center gap-2">
              <span className="text-sm">🇫🇷</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-bold text-emerald-300 leading-none">
                  {currentFrPersona?.name}
                </span>
                <span className="text-[9px] text-[#94a3b8] font-mono leading-none mt-0.5">
                  {currentFrPersona?.tone === 'grave' ? 'Grave' : 'Normale'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Flashcards & Global Audio Preferences ('Auto-play Audio') */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1a2336] via-[#141c2c] to-[#0d1424] border border-[#f2ca50]/50 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/20 border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
                <span className="material-symbols-outlined text-lg">play_circle</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#f3f4f6]">
                  Options de Lecture Automatique ('Auto-play Audio')
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Configuration de l'immersion auditive dans les Flashcards et l'application
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30 text-[10px] font-mono font-bold">
              IMMERSION TOTALE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Auto-play on FLIP Toggle */}
            <div
              onClick={handleToggleAutoPlayFlip}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                autoPlayFlip
                  ? 'bg-[#1e283d] border-[#f2ca50] shadow-md shadow-[#f2ca50]/10'
                  : 'bg-[#121824] border-[#222c3f] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#f2ca50] text-2xl">
                  {autoPlayFlip ? 'flip_to_front' : 'flip'}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#f3f4f6]">
                    Lecture auto au retournement de carte
                  </span>
                  <span className="text-[11px] text-[#cbd5e1] leading-tight">
                    Joue la prononciation dès que la carte se tourne vers le verso
                  </span>
                </div>
              </div>

              <div
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                  autoPlayFlip ? 'bg-[#f2ca50] justify-end' : 'bg-[#2b3547] justify-start'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#0c1322] shadow transition-transform ${
                    autoPlayFlip ? 'translate-x-0' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Auto-play on DISPLAY Toggle */}
            <div
              onClick={handleToggleAutoPlayDisplay}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                autoPlayDisplay
                  ? 'bg-[#1e283d] border-[#f2ca50] shadow-md shadow-[#f2ca50]/10'
                  : 'bg-[#121824] border-[#222c3f] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#f2ca50] text-2xl">
                  {autoPlayDisplay ? 'autoplay' : 'motion_photos_off'}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#f3f4f6]">
                    Lecture auto au changement de mot
                  </span>
                  <span className="text-[11px] text-[#cbd5e1] leading-tight">
                    Joue le mot à chaque passage à la carte suivante
                  </span>
                </div>
              </div>

              <div
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                  autoPlayDisplay ? 'bg-[#f2ca50] justify-end' : 'bg-[#2b3547] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0c1322] shadow" />
              </div>
            </div>
          </div>

          {/* Accent choice for Auto-play */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2 border-t border-[#232e44]">
            <span className="text-xs font-mono text-[#cbd5e1]">
              Accent joué en lecture automatique :
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'en-GB', label: '🇬🇧 UK Seul' },
                { id: 'en-US', label: '🇺🇸 US Seul' },
                { id: 'alternating', label: '🇬🇧⇄🇺🇸 Alterné 50/50' },
                { id: 'both', label: '🇬🇧+🇺🇸 Enchaîné (UK puis US)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectAccentMode(opt.id as AutoPlayAccentMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    autoPlayAccent === opt.id
                      ? 'bg-[#f2ca50] text-[#0c1322] font-bold shadow'
                      : 'bg-[#192233] text-[#dce2f8] hover:bg-[#232f48] border border-[#2e3b52]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed multiplier control */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2 border-t border-[#232e44]">
            <span className="text-xs font-mono text-[#cbd5e1]">
              Cadence & Vitesse de restitution :
            </span>

            <div className="flex items-center gap-1.5">
              {[
                { val: 0.85, label: '0.85x (Posé & Analytique)' },
                { val: 1.0, label: '1.0x (Cadence Naturelle)' },
                { val: 1.15, label: '1.15x (Rythme Natif Rapide)' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleSelectSpeed(opt.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    speedMultiplier === opt.val
                      ? 'bg-[#38bdf8] text-[#0c1322] font-bold shadow'
                      : 'bg-[#192233] text-[#dce2f8] hover:bg-[#232f48] border border-[#2e3b52]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: 30 Voice Personas Selector */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f3f4f6]">
                Catalogue des 30 Voix Réelles Non-Robotisées
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Sélectionnez votre voix préférée parmi 5 voix féminines et 5 voix masculines pour chaque langue
              </p>
            </div>
          </div>

          {/* Main Language Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#121929] border border-[#232e44]">
            {[
              { id: 'en-GB', flag: '🇬🇧', title: 'British English', subtitle: '10 Voix Oxford & BBC' },
              { id: 'en-US', flag: '🇺🇸', title: 'American English', subtitle: '10 Voix Studio US' },
              { id: 'fr-FR', flag: '🇫🇷', title: 'Traductions Français', subtitle: '10 Voix Naturelles' }
            ].map((tab) => {
              const isCurrent = activeLang === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLang(tab.id as LanguageTarget)}
                  className={`py-2.5 px-3 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#cca639] text-[#2c1e00] font-bold shadow-lg shadow-[#f2ca50]/20 scale-[1.01]'
                      : 'text-[#dce2f8] hover:bg-[#1a2337]'
                  }`}
                >
                  <span className="text-base sm:text-lg">{tab.flag}</span>
                  <span className="text-xs sm:text-sm font-serif font-bold truncate">
                    {tab.title}
                  </span>
                  <span className="text-[10px] font-mono opacity-80 hidden sm:inline">
                    {tab.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-filter chips: All / Female / Male / Grave */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[#94a3b8]">Filtrer les 10 voix :</span>
            {[
              { id: 'all', label: 'Toutes les voix (10)' },
              { id: 'female', label: '👩 5 Voix Féminines (Normales & Graves)' },
              { id: 'male', label: '👨 5 Voix Masculines (Normales & Graves)' },
              { id: 'grave', label: '🎙️ Voix Graves Uniquement (Basses & Feutrées)' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id as typeof filterMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  filterMode === f.id
                    ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/60 font-bold'
                    : 'bg-[#141b2a] text-[#8e9bb3] border border-[#232e44] hover:text-[#dce2f8]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid of 10 Voice Personas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredPersonas.map((persona) => {
              const isSelected = currentSelectedId === persona.id;
              const isPlaying = playingPersonaId === persona.id;

              return (
                <div
                  key={persona.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#1c263c] to-[#121a2a] border-[#f2ca50] shadow-xl shadow-[#f2ca50]/10 ring-1 ring-[#f2ca50]/50'
                      : 'bg-[#131b2b] border-[#222d42] hover:border-[#384869]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner ${
                          isSelected
                            ? 'bg-[#f2ca50] text-[#2a1d00] font-bold'
                            : 'bg-[#1f293d] text-[#f2ca50] border border-[#2d3a54]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {persona.avatarIcon}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-serif font-bold text-base text-[#f3f4f6]">
                            {persona.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#232e44] text-[#cbd5e1]">
                            {persona.gender === 'female' ? 'Féminin' : 'Masculin'}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              persona.tone === 'grave'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}
                          >
                            {persona.tone === 'grave' ? '🎙️ Voix Grave' : '✨ Voix Normale'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#f2ca50] font-medium mt-0.5">
                          {persona.toneLabel}
                        </span>
                        <span className="text-[10px] text-[#8e9bb3] font-mono">
                          {persona.region}
                        </span>
                      </div>
                    </div>

                    {/* Active Selected Badge */}
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold shrink-0 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Voix Active</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#cbd5e1] leading-relaxed">
                    {persona.description}
                  </p>

                  {/* Sample Sentence Preview Banner */}
                  <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e273a] text-xs text-[#dce2f8]/90 italic font-sans flex items-start gap-2">
                    <span className="material-symbols-outlined text-xs text-[#f2ca50] mt-0.5 shrink-0">
                      format_quote
                    </span>
                    <span className="line-clamp-2">« {persona.sampleSentence} »</span>
                  </div>

                  {/* Action Buttons: Test Voice & Select Voice */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#1e273a]">
                    <button
                      type="button"
                      onClick={() => handleTestVoice(persona.id)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-[#f2ca50] text-[#0c1322] border-[#f2ca50] font-bold animate-pulse'
                          : 'bg-[#1a2336] hover:bg-[#232f48] text-[#dce2f8] border-[#2c3952]'
                      }`}
                      title="Écouter la phrase échantillon avec cette voix"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isPlaying ? 'graphic_eq' : 'play_arrow'}
                      </span>
                      <span>{isPlaying ? 'Écoute en cours...' : 'Tester cette voix'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectVoice(persona)}
                      disabled={isSelected}
                      className={`py-2 px-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#232e44] text-[#8e9bb3] cursor-default'
                          : 'bg-gradient-to-r from-[#d4af37] to-[#f2ca50] text-[#2a1d00] hover:from-[#ffe082] hover:to-[#f2ca50] shadow-md shadow-[#f2ca50]/20 active:scale-95'
                      }`}
                    >
                      <span>{isSelected ? 'Sélectionnée' : 'Choisir'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
