import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export type TooltipPlacement = 'top' | 'bottom';

export interface MotionTooltipProps {
  /** Short optional title displayed in champagne gold */
  title?: string;
  /** Concise single-line or two-line explanation */
  content: string;
  /** Preferred placement relative to trigger */
  placement?: TooltipPlacement;
  /** Hover intent delay in ms (prevents noisy flashes on quick pointer passes) */
  delayMs?: number;
  /** Optional wrapper className so flex/grid layout sizing is preserved */
  wrapperClassName?: string;
  /** Disable tooltip rendering */
  disabled?: boolean;
  children: React.ReactNode;
}

interface Coords {
  centerX: number;
  y: number;
  resolvedPlacement: TooltipPlacement;
  arrowOffsetX: number;
}

const TOOLTIP_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const ESTIMATED_MAX_WIDTH = 240;

export const MotionTooltip: React.FC<MotionTooltipProps> = ({
  title,
  content,
  placement = 'top',
  delayMs = 220,
  wrapperClassName = 'inline-flex',
  disabled = false,
  children
}) => {
  const tooltipId = useId();
  const shouldReduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchTimeRef = useRef<number>(0);

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const clearTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const computeCoords = useCallback((): Coords | null => {
    const el = triggerRef.current;
    if (!el || typeof window === 'undefined') return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rawCenterX = rect.left + rect.width / 2;

    const halfWidth = Math.min(ESTIMATED_MAX_WIDTH / 2, (vw - 24) / 2);
    const clampedCenterX = Math.max(12 + halfWidth, Math.min(vw - 12 - halfWidth, rawCenterX));
    const arrowOffsetX = Math.max(-halfWidth + 16, Math.min(halfWidth - 16, rawCenterX - clampedCenterX));

    // Auto-flip if too close to viewport edges
    let resolvedPlacement: TooltipPlacement = placement;
    if (placement === 'top' && rect.top < 84) {
      resolvedPlacement = 'bottom';
    } else if (placement === 'bottom' && vh - rect.bottom < 84) {
      resolvedPlacement = 'top';
    }

    const y = resolvedPlacement === 'top' ? rect.top - 10 : rect.bottom + 10;

    return {
      centerX: clampedCenterX,
      y,
      resolvedPlacement,
      arrowOffsetX
    };
  }, [placement]);

  const showWithDelay = useCallback(
    (delay: number) => {
      if (disabled || !content) return;
      // Ignore synthetic mouse events fired right after touch taps
      if (Date.now() - lastTouchTimeRef.current < 700) return;

      clearTimer();
      openTimerRef.current = setTimeout(() => {
        const nextCoords = computeCoords();
        if (nextCoords) {
          setCoords(nextCoords);
          setIsOpen(true);
        }
      }, delay);
    },
    [clearTimer, computeCoords, content, disabled]
  );

  const hideImmediately = useCallback(() => {
    clearTimer();
    setIsOpen(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!isOpen) return;

    const handleDismiss = () => hideImmediately();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideImmediately();
    };

    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, hideImmediately]);

  useEffect(() => clearTimer, [clearTimer]);

  const canPortal = typeof document !== 'undefined';

  return (
    <span
      ref={triggerRef}
      className={wrapperClassName}
      aria-describedby={isOpen ? tooltipId : undefined}
      onTouchStart={() => {
        lastTouchTimeRef.current = Date.now();
        hideImmediately();
      }}
      onMouseEnter={() => showWithDelay(delayMs)}
      onMouseLeave={hideImmediately}
      onFocus={() => showWithDelay(120)}
      onBlur={hideImmediately}
      onPointerDown={hideImmediately}
    >
      {children}

      {canPortal &&
        createPortal(
          <AnimatePresence>
            {isOpen && coords && (
              <div
                style={{
                  position: 'fixed',
                  left: coords.centerX,
                  top: coords.y,
                  transform:
                    coords.resolvedPlacement === 'top'
                      ? 'translate(-50%, -100%)'
                      : 'translate(-50%, 0)',
                  zIndex: 120
                }}
                className="pointer-events-none select-none"
              >
                <motion.div
                  id={tooltipId}
                  role="tooltip"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: coords.resolvedPlacement === 'top' ? 6 : -6,
                          scale: 0.96
                        }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: coords.resolvedPlacement === 'top' ? 4 : -4,
                          scale: 0.97
                        }
                  }
                  transition={{ duration: shouldReduceMotion ? 0.1 : 0.18, ease: TOOLTIP_EASE }}
                  style={{ maxWidth: ESTIMATED_MAX_WIDTH }}
                  className="relative px-3 py-2 rounded-xl bg-[#0b1120]/95 backdrop-blur-md border border-[#f2ca50]/40 shadow-[0_10px_28px_rgba(0,0,0,0.65)] text-left"
                >
                  {/* Directional caret diamond */}
                  <span
                    aria-hidden="true"
                    style={{ left: `calc(50% + ${coords.arrowOffsetX}px)` }}
                    className={`absolute -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0b1120] border-[#f2ca50]/40 ${
                      coords.resolvedPlacement === 'top'
                        ? '-bottom-[5px] border-r border-b'
                        : '-top-[5px] border-l border-t'
                    }`}
                  />

                  {title && (
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f2ca50] mb-0.5 leading-tight">
                      {title}
                    </div>
                  )}
                  <p className="text-[11px] leading-snug text-[#dce2f8] font-sans">
                    {content}
                  </p>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
};
