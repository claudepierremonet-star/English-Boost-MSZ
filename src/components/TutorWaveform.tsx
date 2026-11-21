import React from 'react';

interface TutorWaveformProps {
  mode: 'listening' | 'speaking' | 'thinking' | 'idle';
  liveBars?: number[];
  accentLabel?: string;
}

export const TutorWaveform: React.FC<TutorWaveformProps> = ({
  mode,
  liveBars = [18, 26, 22, 34, 28, 38, 24, 30, 20, 25, 32, 22, 27, 19],
  accentLabel
}) => {
  const displayBars = React.useMemo(() => {
    if (mode === 'listening' && liveBars.length > 0) {
      // Mirror/expand 10-14 live mic bars cleanly to 18 visual bars
      const targetCount = 18;
      return Array.from({ length: targetCount }, (_, i) => {
        const src = liveBars[i % liveBars.length] ?? 18;
        return Math.max(12, Math.min(100, Math.round((src / 50) * 100)));
      });
    }
    if (mode === 'speaking') {
      return [28, 52, 74, 44, 86, 62, 92, 48, 76, 58, 84, 42, 68, 52, 78, 46, 56, 30];
    }
    if (mode === 'thinking') {
      return [22, 34, 48, 36, 54, 42, 60, 40, 52, 38, 46, 32, 44, 36, 50, 34, 28, 22];
    }
    return [14, 18, 22, 16, 24, 20, 26, 18, 22, 16, 24, 18, 20, 16, 22, 18, 16, 14];
  }, [mode, liveBars]);

  const statusText =
    mode === 'listening'
      ? 'Listening — speak freely'
      : mode === 'speaking'
      ? `Professor speaking${accentLabel ? ` (${accentLabel})` : ''}`
      : mode === 'thinking'
      ? 'Preparing supportive feedback...'
      : 'Voice & text studio ready';

  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#070e1d] border border-[#2e3545]"
      aria-label={statusText}
    >
      <div className="flex items-center gap-2 min-w-0">
        {mode === 'listening' ? (
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
        ) : (
          <span
            className={`material-symbols-outlined text-sm shrink-0 ${
              mode === 'speaking'
                ? 'text-[#f2ca50]'
                : mode === 'thinking'
                ? 'text-sky-300'
                : 'text-[#99907c]'
            }`}
          >
            {mode === 'speaking' ? 'graphic_eq' : mode === 'thinking' ? 'psychology' : 'mic_none'}
          </span>
        )}
        <span className="text-[11px] font-mono text-[#d0c5af] truncate">{statusText}</span>
      </div>

      <div className="flex items-center gap-[3px] h-7 shrink-0" aria-hidden="true">
        {displayBars.map((heightPct, idx) => {
          const barColor =
            mode === 'listening'
              ? 'bg-gradient-to-t from-rose-500 to-amber-300'
              : mode === 'speaking'
              ? 'bg-gradient-to-t from-[#b58c1b] to-[#f2ca50]'
              : mode === 'thinking'
              ? 'bg-gradient-to-t from-sky-600 to-sky-300'
              : 'bg-[#2e3545]';
          const animatedStyle =
            mode === 'speaking' || mode === 'thinking'
              ? {
                  height: `${heightPct}%`,
                  animation: `pulse ${0.9 + (idx % 5) * 0.16}s ease-in-out ${(idx % 4) * 0.12}s infinite alternate`
                }
              : {
                  height: `${heightPct}%`
                };
          return (
            <span
              key={idx}
              style={animatedStyle}
              className={`w-[3px] rounded-full transition-[height] duration-100 ${barColor}`}
            />
          );
        })}
      </div>
    </div>
  );
};
