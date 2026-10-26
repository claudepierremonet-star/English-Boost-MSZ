import React, { useState, useEffect } from 'react';
import { DICTATION_ITEMS, type DictationItem } from '../data/curriculum';
import { recordAttempt } from '../firebase/client';
import type { CEFRLevel } from '../firebase/types';
import confetti from 'canvas-confetti';
import { DualSpeakerButton } from './DualSpeakerButton';

interface DictationModalProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
  onAttemptRecorded?: () => void;
}

export const DictationModal: React.FC<DictationModalProps> = ({
  currentLevel,
  onClose,
  onAttemptRecorded
}) => {
  // Find appropriate item based on level
  const filtered = DICTATION_ITEMS.filter((item) => item.level === currentLevel);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const item: DictationItem = filtered[currentIndex] || DICTATION_ITEMS[0];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioSeconds, setAudioSeconds] = useState<number>(0);
  const [listenCount, setListenCount] = useState<number>(0);

  const [userText, setUserText] = useState<string>('');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [accuracyScore, setAccuracyScore] = useState<number>(0);
  const [diffTokens, setDiffTokens] = useState<Array<{ text: string; isCorrect: boolean; original?: string }>>([]);
  const [isSavedToCloud, setIsSavedToCloud] = useState<boolean>(false);

  // Play audio speech
  const handleTogglePlay = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.canonicalText);
      utterance.lang = 'en-GB';
      utterance.rate = playbackSpeed;

      utterance.onstart = () => {
        setIsPlaying(true);
        setListenCount((prev) => Math.min(4, prev + 1));
      };
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 4000);
    }
  };

  // Replay 5 seconds
  const handleReplay5 = () => {
    handleTogglePlay();
  };

  // Insert apostrophe helper
  const handleInsertApostrophe = () => {
    setUserText((prev) => prev + "'");
  };

  // Normalize text for comparison (ignoring case, punctuation, extra spaces)
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  // Evaluate transcription
  const handleEvaluate = async () => {
    const canonicalTokens = item.canonicalText.split(/\s+/);
    const userTokens = userText.trim().split(/\s+/);

    const diffs: Array<{ text: string; isCorrect: boolean; original?: string }> = [];
    let matches = 0;

    canonicalTokens.forEach((cToken, idx) => {
      const uToken = userTokens[idx] || '';
      const normC = normalize(cToken);
      const normU = normalize(uToken);

      if (normU === normC && normU.length > 0) {
        diffs.push({ text: cToken, isCorrect: true });
        matches++;
      } else {
        diffs.push({
          text: cToken,
          isCorrect: false,
          original: uToken || '(manquant)'
        });
      }
    });

    const score = Math.max(10, Math.round((matches / canonicalTokens.length) * 100));
    setAccuracyScore(score);
    setDiffTokens(diffs);
    setHasEvaluated(true);

    if (score >= 80) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#f2ca50', '#d4af37', '#ffffff']
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }

    // Record attempt
    await recordAttempt({
      moduleId: item.id,
      moduleType: 'dictation',
      title: item.title,
      level: item.level,
      score,
      durationSeconds: 90
    });
    onAttemptRecorded?.();
  };

  const handleSaveToRevision = async () => {
    setIsSavedToCloud(true);
    setTimeout(() => setIsSavedToCloud(true), 1200);
  };

  const handleNextExcerpt = () => {
    if (currentIndex < filtered.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setUserText('');
    setHasEvaluated(false);
    setIsSavedToCloud(false);
    setListenCount(0);
  };

  const wordCount = userText.trim().length === 0 ? 0 : userText.trim().split(/\s+/).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1322] flex flex-col pt-safe pb-safe animate-fadeIn select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 bg-[#0c1322]/90 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg font-bold text-[#dce2f8] leading-tight">
              Session Dictée
            </h1>
            <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
              Extrait {currentIndex + 1} / {Math.max(1, filtered.length)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#232a3a] border border-[#f2ca50]/30 text-xs font-bold text-[#f2ca50] font-mono">
            {item.level}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#191f2f] flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-[#d0c5af]">
            <span className="text-[#f2ca50] font-semibold">{item.source}</span>
            <span className="font-mono">Cadence {item.durationLabel}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#191f2f] overflow-hidden">
            <div
              className="h-full bg-[#f2ca50] rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / Math.max(1, filtered.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Audio Player Card */}
        <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#4d4635]/40 shadow-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-xl">headphones</span>
              <span className="font-serif font-bold text-base text-[#dce2f8]">{item.title}</span>
            </div>
            {/* Dual Speaker buttons: 1er (British UK) & 2e (American US) */}
            <DualSpeakerButton
              text={item.canonicalText}
              id={`dictation-modal-${item.id}`}
              rate={playbackSpeed}
              variant="pill"
              onStart={() => setListenCount((prev) => Math.min(4, prev + 1))}
            />
          </div>

          {/* Simulated Waveform Display */}
          <div
            onClick={handleTogglePlay}
            className="h-14 w-full flex items-center justify-between gap-1 py-1 cursor-pointer bg-[#070e1d]/80 rounded-xl px-3 border border-[#4d4635]/20"
          >
            {[12, 24, 38, 18, 48, 30, 42, 50, 28, 44, 34, 20, 36, 46, 26, 42, 16, 32, 40, 22, 46, 28, 38, 14, 24, 44, 28, 40].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying
                    ? 'bg-[#f2ca50] animate-pulse'
                    : i <= 10
                    ? 'bg-[#f2ca50]/70'
                    : 'bg-[#232a3a]'
                }`}
                style={{
                  height: isPlaying ? `${Math.floor(Math.random() * 32) + 14}px` : `${h}px`
                }}
              />
            ))}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between pt-1">
            {/* Speed Selector */}
            <div className="flex rounded-lg bg-[#232a3a] p-1 gap-1">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-[#4f471b] text-[#c2b57f]'
                      : 'text-[#d0c5af] hover:text-[#dce2f8]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Play Button Trio */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReplay5}
                className="w-10 h-10 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-[#dce2f8] flex items-center justify-center transition-transform active:scale-95 shadow"
                title="Reculer de 5 secondes"
              >
                <span className="material-symbols-outlined text-lg">replay_5</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-lg shadow-[#f2ca50]/20 hover:bg-[#ffe088] transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-[#191f2f] hover:bg-[#232a3a] text-[#d4c78f] flex items-center justify-center transition-transform active:scale-95 shadow"
                title="Écouter à nouveau"
              >
                <span className="material-symbols-outlined text-lg">graphic_eq</span>
              </button>
            </div>

            {/* Listen count */}
            <div className="flex flex-col items-end text-xs font-mono">
              <span className="text-[#99907c]">Écoutes</span>
              <span className="text-sm font-bold text-[#f2ca50]">{listenCount} / 4</span>
            </div>
          </div>
        </div>

        {/* Transcription Slate */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="dictation-input" className="text-sm font-semibold text-[#dce2f8]">
              Votre retranscription
            </label>
            <button
              type="button"
              onClick={handleInsertApostrophe}
              className="text-[#f2ca50] hover:underline flex items-center gap-1 font-mono"
            >
              <span className="material-symbols-outlined text-sm">ink_pen</span> Symbole '
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#191f2f] border border-[#4d4635]/40 shadow-inner">
            <textarea
              id="dictation-input"
              rows={4}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Écoutez attentivement et saisissez l'extrait audio en anglais..."
              className="w-full bg-transparent resize-none outline-none font-sans text-base text-[#dce2f8] placeholder:text-[#99907c]/60 leading-relaxed"
            />
            <div className="flex justify-between items-center pt-2 border-t border-[#232a3a] text-xs text-[#99907c]">
              <span className="text-[#d4c78f] font-mono">
                {wordCount} mot{wordCount > 1 ? 's' : ''} saisi{wordCount > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => setUserText('')}
                className="hover:text-[#ffb4ab] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">backspace</span> Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Verification Trigger Button */}
        {!hasEvaluated && (
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={wordCount === 0}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.99] ${
              wordCount > 0
                ? 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088] cursor-pointer'
                : 'bg-[#232a3a] text-[#99907c] cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-xl">verified</span>
            <span>Vérifier la transcription</span>
          </button>
        )}

        {/* Evaluation Output Section */}
        {hasEvaluated && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Score Banner */}
            <div className="p-4 rounded-xl bg-[#232a3a] border border-[#f2ca50]/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#070e1d] border-2 border-[#f2ca50] flex items-center justify-center font-serif text-lg font-bold text-[#f2ca50]">
                  {accuracyScore}%
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-base text-[#dce2f8]">
                    {accuracyScore >= 90
                      ? 'Excellente Acuité'
                      : accuracyScore >= 70
                      ? 'Bonne Maîtrise Lexicale'
                      : 'Perfectionnement Requis'}
                  </span>
                  <p className="text-xs text-[#d0c5af]/80">
                    Précision évaluée avec tolérance souple sur l’élision et la casse.
                  </p>
                </div>
              </div>
            </div>

            {/* Differential Tokenized View */}
            <div className="p-4 rounded-xl bg-[#191f2f] border border-[#4d4635]/40 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-[#232a3a]">
                <span className="font-bold uppercase tracking-wider text-[#d4c78f]">
                  Analyse Différentielle
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[#d4c78f]">
                    <span className="w-2 h-2 rounded-full bg-[#d4c78f]" /> Exact
                  </span>
                  <span className="flex items-center gap-1 text-[#ffb4ab]">
                    <span className="w-2 h-2 rounded-full bg-[#ffb4ab]" /> Écart
                  </span>
                </div>
              </div>

              <div className="text-base leading-relaxed flex flex-wrap gap-1.5">
                {diffTokens.map((tok, idx) => (
                  <span key={idx}>
                    {tok.isCorrect ? (
                      <span className="text-[#d4c78f] font-medium">{tok.text}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="bg-[#93000a]/60 text-[#ffb4ab] px-1.5 py-0.5 rounded line-through text-xs">
                          {tok.original}
                        </span>
                        <span className="text-[#f2ca50] font-bold underline decoration-[#f2ca50]">
                          {tok.text}
                        </span>
                      </span>
                    )}
                  </span>
                ))}
              </div>

              {/* Reference Canonical Script */}
              <div className="mt-2 p-3 rounded-lg bg-[#070e1d]/80 border border-[#232a3a]">
                <span className="text-[10px] text-[#99907c] uppercase font-bold tracking-wider">
                  Texte Canonique Source
                </span>
                <p className="font-serif italic text-sm text-[#dce2f8] mt-1 leading-relaxed">
                  “{item.canonicalText}”
                </p>
              </div>
            </div>

            {/* Stylistic & Philological Notes */}
            <div className="p-4 rounded-xl bg-[#151b2b] border border-[#4d4635]/40 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#f2ca50]">
                <span className="material-symbols-outlined text-lg">auto_stories</span>
                <h3 className="font-serif font-bold text-sm text-[#dce2f8]">
                  Décryptage Idiomatique & Stylistique
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                {item.notes.map((note, nIdx) => (
                  <div key={nIdx} className="p-3 rounded-lg bg-[#191f2f] flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic font-bold text-[#f2ca50]">{note.term}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#232a3a] text-[#d4c78f] uppercase">
                        {note.register}
                      </span>
                    </div>
                    <p className="text-xs text-[#d0c5af]/90 leading-relaxed mt-1">
                      {note.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveToRevision}
                className="w-full py-3 px-4 rounded-xl bg-[#232a3a] text-[#dce2f8] hover:text-[#f2ca50] font-semibold text-xs flex items-center justify-center gap-2 border border-[#4d4635]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#f2ca50]">
                  {isSavedToCloud ? 'cloud_done' : 'cloud_sync'}
                </span>
                <span>
                  {isSavedToCloud
                    ? 'Enregistré dans le profil d’apprentissage'
                    : 'Enregistrer l’extrait dans mon carnet de révision'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleNextExcerpt}
                className="w-full py-3.5 px-6 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-[#ffe088] transition-transform active:scale-95"
              >
                <span>Passer à l'extrait suivant</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
