import React, { useState } from 'react';
import type { PhoneticCorrectionReport, OrthographicDiffToken } from '../utils/speechRecognitionHelper';
import { speakText, stopSpeech } from '../services/speechService';
import { recordDictationError } from '../utils/errorJournal';

interface SpeechRecognitionDiagnosticCardProps {
  report: PhoneticCorrectionReport;
  targetText: string;
  spokenTranscript: string;
  targetAccent: 'en-GB' | 'en-US';
  onReRecord: () => void;
  onValidate: () => void;
  onSwitchToWaveform?: () => void;
}

export const SpeechRecognitionDiagnosticCard: React.FC<SpeechRecognitionDiagnosticCardProps> = ({
  report,
  targetText,
  spokenTranscript,
  targetAccent,
  onReRecord,
  onValidate,
  onSwitchToWaveform
}) => {
  const [selectedToken, setSelectedToken] = useState<OrthographicDiffToken | null>(null);
  const [addedToJournalIds, setAddedToJournalIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSpeechSpeed, setActiveSpeechSpeed] = useState<number>(1.0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePlayWordAudio = (word: string, accent: 'en-GB' | 'en-US', speed: number = 1.0) => {
    stopSpeech();
    speakText(word, accent, `diag-word-${word}-${accent}`, { rate: speed });
  };

  const handleAddToErrorJournal = (tok: OrthographicDiffToken) => {
    const term = tok.expected || tok.word;
    recordDictationError({
      term,
      translationFr: tok.frenchDef || 'Terme d’élocution à consolider',
      definition: `Pratique d'élocution & dictée vocale (${targetAccent === 'en-GB' ? 'British RP' : 'American GenAm'}).`,
      canonicalSentence: targetText,
      userText: tok.word,
      score: report.orthographicScore,
      diffExplanation: tok.phoneticTip || 'Faiblesse repérée lors de la dictée vocale en studio d\'élocution.'
    });

    setAddedToJournalIds((prev) => new Set([...prev, tok.id]));
    showToast(`« ${term} » ajouté à votre Journal d'Erreurs`);
  };

  const accentFlag = targetAccent === 'en-GB' ? '🇬🇧' : '🇺🇸';
  const accentLabel = targetAccent === 'en-GB' ? 'Oxford British (RP)' : 'General American (GenAm)';

  return (
    <div className="flex flex-col gap-5 text-[#dce2f8] animate-fadeIn">
      {/* Top Banner: Immediate Dual Score (Orthographic & Phonetic) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#151c2d] to-[#0d1424] border border-[#f2ca50]/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#f2ca50] bg-[#f2ca50]/15 px-2.5 py-0.5 rounded-full border border-[#f2ca50]/30 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              Correction Immédiate
            </span>
            <span className="text-xs font-mono text-[#d4c78f] flex items-center gap-1">
              <span>{accentFlag}</span>
              <span>{accentLabel}</span>
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-1">
            Diagnostic Orthographique & Phonétique
          </h3>
          <p className="text-xs text-[#d0c5af]/80 max-w-md">
            {report.summaryMessage}
          </p>
        </div>

        {/* Dual Score Badges */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Orthographic Score */}
          <div className="flex flex-col items-center bg-[#0a101f] border border-[#2e3b55] px-4 py-3 rounded-xl min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider mb-0.5">
              Orthographe
            </span>
            <span className="font-mono text-2xl font-black text-white">
              {report.orthographicScore}%
            </span>
            <span className="text-[10px] text-[#8391ac] font-mono mt-0.5">
              {report.exactMatchesCount}/{report.totalExpectedWords} exacts
            </span>
          </div>

          {/* Phonetic Score */}
          <div className="flex flex-col items-center bg-[#0a101f] border border-[#f2ca50]/50 px-4 py-3 rounded-xl min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider mb-0.5">
              Phonétique
            </span>
            <span className="font-mono text-2xl font-black text-[#f2ca50]">
              {report.phoneticScore}%
            </span>
            <span className="text-[10px] text-[#d4c78f] font-mono mt-0.5">
              Modèle {accentFlag}
            </span>
          </div>
        </div>
      </div>

      {/* Target Text vs Spoken Recognition Display */}
      <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a] shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#232a3a] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f2ca50] text-base">record_voice_over</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4c78f]">
              Transcription Reconnue & Alignement Orthographique
            </h4>
          </div>
          <span className="text-[10px] text-[#8391ac] font-mono">
            Touchez un mot pour écouter sa phonétique
          </span>
        </div>

        {/* Word Token Stream with status highlights */}
        <div className="flex flex-wrap items-center gap-2 leading-relaxed bg-[#0a101f] p-4 sm:p-5 rounded-xl border border-white/5 min-h-[90px]">
          {report.tokens.map((tok) => {
            const isSelected = selectedToken?.id === tok.id;
            let badgeClass = '';
            let icon = '';

            switch (tok.status) {
              case 'correct':
                badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25';
                icon = 'check';
                break;
              case 'near_match':
                badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30';
                icon = 'cached';
                break;
              case 'misspelled':
                badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/50 hover:bg-orange-500/30';
                icon = 'error_outline';
                break;
              case 'omitted':
                badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 line-through opacity-75';
                icon = 'remove';
                break;
              case 'extra':
                badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30';
                icon = 'add';
                break;
            }

            return (
              <button
                key={tok.id}
                type="button"
                onClick={() => setSelectedToken(isSelected ? null : tok)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${badgeClass} ${
                  isSelected ? 'ring-2 ring-[#f2ca50] shadow-lg scale-105' : ''
                }`}
                title={`Cliquez pour analyser « ${tok.expected || tok.word} »`}
              >
                <span>{tok.expected || tok.word}</span>
                <span className="material-symbols-outlined text-[10px] opacity-70">{icon}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#8391ac] pt-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Mot exact
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Proche / homophone
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400" /> Erreur d'orthographe
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Omission
          </span>
          <span className="flex items-center gap-1 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" /> Mot parasite
          </span>
        </div>
      </div>

      {/* Selected Token Phonetic Detail Inspector */}
      {selectedToken && (
        <div className="p-5 rounded-2xl bg-[#131b2e] border-2 border-[#f2ca50]/60 shadow-xl flex flex-col gap-3.5 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f2ca50] text-lg">hearing</span>
              <div>
                <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  « {selectedToken.expected || selectedToken.word} »
                  {selectedToken.frenchDef && (
                    <span className="text-xs font-normal text-[#ffe082] italic">
                      — {selectedToken.frenchDef}
                    </span>
                  )}
                </h4>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4c78f]">
                  Statut : {selectedToken.status === 'correct' ? 'Prononciation exacte' : selectedToken.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedToken(null)}
              className="text-[#8391ac] hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Phonetic Pronunciation Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0a101f] p-3.5 rounded-xl border border-white/5">
            {/* British Oxford RP */}
            <div className="flex items-center justify-between bg-[#151c2d] p-2.5 rounded-lg border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#f2ca50] font-bold">🇬🇧 British (RP) :</span>
                <span className="font-mono text-sm text-[#dce2f8]">{selectedToken.phoneticUk || '/---/'}</span>
              </div>
              <button
                type="button"
                onClick={() => handlePlayWordAudio(selectedToken.expected || selectedToken.word, 'en-GB', activeSpeechSpeed)}
                className="w-8 h-8 rounded-full bg-[#f2ca50]/15 hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#0c1322] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Écouter la prononciation britannique"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span>
              </button>
            </div>

            {/* American GenAm */}
            <div className="flex items-center justify-between bg-[#151c2d] p-2.5 rounded-lg border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#38bdf8] font-bold">🇺🇸 American (GenAm) :</span>
                <span className="font-mono text-sm text-[#dce2f8]">{selectedToken.phoneticUs || '/---/'}</span>
              </div>
              <button
                type="button"
                onClick={() => handlePlayWordAudio(selectedToken.expected || selectedToken.word, 'en-US', activeSpeechSpeed)}
                className="w-8 h-8 rounded-full bg-[#38bdf8]/15 hover:bg-[#38bdf8] text-[#38bdf8] hover:text-[#0c1322] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Écouter la prononciation américaine"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span>
              </button>
            </div>
          </div>

          {/* Speed control & Action buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#232a3a]">
            {/* Speed toggle */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8391ac]">
              <span>Vitesse d'écoute :</span>
              <button
                type="button"
                onClick={() => setActiveSpeechSpeed(0.8)}
                className={`px-2 py-0.5 rounded ${activeSpeechSpeed === 0.8 ? 'bg-[#f2ca50] text-black font-bold' : 'bg-[#191f2f] text-white'}`}
              >
                0.8x (Ralenti)
              </button>
              <button
                type="button"
                onClick={() => setActiveSpeechSpeed(1.0)}
                className={`px-2 py-0.5 rounded ${activeSpeechSpeed === 1.0 ? 'bg-[#f2ca50] text-black font-bold' : 'bg-[#191f2f] text-white'}`}
              >
                1.0x (Normal)
              </button>
            </div>

            {/* Error Journal Button */}
            <button
              type="button"
              onClick={() => handleAddToErrorJournal(selectedToken)}
              disabled={addedToJournalIds.has(selectedToken.id)}
              className="px-3 py-1 rounded-lg bg-[#25334d] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">
                {addedToJournalIds.has(selectedToken.id) ? 'check' : 'bookmark_add'}
              </span>
              <span>
                {addedToJournalIds.has(selectedToken.id) ? 'Ajouté au Journal' : 'Sauvegarder dans mon Journal'}
              </span>
            </button>
          </div>

          {/* Phonetic Tip */}
          {selectedToken.phoneticTip && (
            <p className="text-xs text-[#ffe082] bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              💡 <strong>Astuce Phonétique :</strong> {selectedToken.phoneticTip}
            </p>
          )}
        </div>
      )}

      {/* Phonetic Pitfalls Identified in the Sentence */}
      {report.pitfalls.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#151b2b] border border-[#232a3a] shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-[#232a3a] pb-2.5">
            <span className="material-symbols-outlined text-amber-400 text-lg">psychology</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f2ca50]">
              Points de Vigilance Phonétique ({report.pitfalls.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.pitfalls.map((pitfall, pIdx) => (
              <div
                key={pIdx}
                className="p-3.5 rounded-xl bg-[#0a101f] border border-[#2e3b55] flex flex-col gap-1.5 hover:border-[#f2ca50]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#f2ca50] tracking-wider">
                    {pitfall.categoryLabel}
                  </span>
                  <span className="font-mono text-xs text-[#38bdf8] font-bold">
                    « {pitfall.word} »
                  </span>
                </div>
                <p className="text-xs text-[#dce2f8] leading-relaxed">
                  {pitfall.explanation}
                </p>
                <div className="text-[11px] text-[#ffe082] bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-1">
                  🎯 <strong>Remède :</strong> {pitfall.remedy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Re-record button */}
          <button
            type="button"
            onClick={onReRecord}
            className="px-4 py-2.5 rounded-xl bg-[#191f2f] hover:bg-[#25334d] border border-[#2e3b55] hover:border-[#f2ca50]/40 text-[#d0c5af] hover:text-[#f2ca50] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-base">mic</span>
            <span>Re-dicter / Nouvel essai</span>
          </button>

          {/* Switch to Waveform Comparator */}
          {onSwitchToWaveform && (
            <button
              type="button"
              onClick={onSwitchToWaveform}
              className="px-4 py-2.5 rounded-xl bg-[#191f2f] hover:bg-[#25334d] border border-[#2e3b55] text-[#38bdf8] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-base">graphic_eq</span>
              <span>Voir l'Onde Acoustique</span>
            </button>
          )}
        </div>

        {/* Validate and Record Attempt to Firebase */}
        <button
          type="button"
          onClick={onValidate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000] font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#f2ca50]/20 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">military_tech</span>
          <span>Valider la Session & Sauvegarder</span>
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#152342]/95 border border-[#f2ca50]/60 text-[#ffe082] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            <span className="material-symbols-outlined text-base text-[#f2ca50]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
