import React, { useRef, useState } from 'react';
import { useLessonDictionary } from './LessonDictionaryContext';

interface InteractiveHighlightTextProps {
  text: string;
  className?: string;
}

const WORD_OR_SEP_REGEX = /([A-Za-z][A-Za-z'’-]*|[^A-Za-z]+)/g;

/**
 * Affiche un texte anglais de leçon où chaque mot supporte :
 * - Une pression longue (~420ms, tactile ou souris) pour surligner et consulter la définition Google Dictionary en contexte
 * - Un double-clic rapide sur ordinateur pour la même consultation instantanée
 */
export const InteractiveHighlightText: React.FC<InteractiveHighlightTextProps> = ({
  text,
  className = ''
}) => {
  const dict = useLessonDictionary();
  const [holdingTokenIdx, setHoldingTokenIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const firedLongPressRef = useRef<boolean>(false);

  if (!text) return null;

  // If rendered outside LessonDictionaryProvider, gracefully render plain text
  if (!dict) {
    return <span className={className}>{text}</span>;
  }

  const tokens = text.match(WORD_OR_SEP_REGEX) || [text];

  const clearHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
    setHoldingTokenIdx(null);
  };

  return (
    <span className={`select-text ${className}`}>
      {tokens.map((token, idx) => {
        const isWord = /^[A-Za-z][A-Za-z'’-]*$/.test(token) && token.length >= 2;
        if (!isWord) {
          return <React.Fragment key={idx}>{token}</React.Fragment>;
        }

        const isHighlighted = dict.isWordHighlighted(token);
        const isHolding = holdingTokenIdx === idx;

        return (
          <span
            key={idx}
            onPointerDown={(e) => {
              // Only primary pointer button / touch
              if (e.pointerType === 'mouse' && e.button !== 0) return;
              clearHold();
              firedLongPressRef.current = false;
              startPosRef.current = { x: e.clientX, y: e.clientY };
              setHoldingTokenIdx(idx);
              const targetEl = e.currentTarget;

              timerRef.current = setTimeout(() => {
                firedLongPressRef.current = true;
                setHoldingTokenIdx(null);
                const rect = targetEl.getBoundingClientRect();
                dict.triggerWordLookup(token, rect);
              }, 420);
            }}
            onPointerMove={(e) => {
              if (!startPosRef.current) return;
              const dx = Math.abs(e.clientX - startPosRef.current.x);
              const dy = Math.abs(e.clientY - startPosRef.current.y);
              if (dx > 8 || dy > 8) {
                clearHold();
              }
            }}
            onPointerUp={clearHold}
            onPointerCancel={clearHold}
            onPointerLeave={clearHold}
            onContextMenu={(e) => {
              if (firedLongPressRef.current || isHolding) {
                e.preventDefault();
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              clearHold();
              dict.triggerWordLookup(token, e.currentTarget.getBoundingClientRect());
            }}
            title="Pression longue (ou double-clic) pour la définition Google Dictionary"
            className={`cursor-help rounded px-0.5 transition-colors duration-150 ${
              isHighlighted
                ? 'bg-[#f2ca50]/30 text-[#ffe088] underline decoration-[#f2ca50] decoration-2 underline-offset-4'
                : isHolding
                ? 'bg-[#f2ca50]/25 text-[#f2ca50]'
                : 'hover:bg-[#f2ca50]/12 hover:underline hover:decoration-[#f2ca50]/45 hover:underline-offset-4'
            }`}
          >
            {token}
          </span>
        );
      })}
    </span>
  );
};
