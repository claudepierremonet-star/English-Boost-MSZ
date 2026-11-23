import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';

interface CapsuleRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface GlassSlidingCapsuleProps {
  /** Ref to the positioned (`relative`) menu track container holding items with `data-capsule-key` */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Currently active item key matching `data-capsule-key` */
  activeKey: string;
  /** Optional tone override for containers that remain dark even in light themes */
  tone?: 'adaptive' | 'dark';
  /** Optional extra padding expansion (in px) around the measured item rect */
  insetPx?: number;
  /** Optional extra className for the capsule wrapper */
  className?: string;
}

const POSITION_SPRING = {
  stiffness: 360,
  damping: 18,
  mass: 0.85,
};

const SIZE_SPRING = {
  stiffness: 380,
  damping: 24,
  mass: 0.8,
};

const STRETCH_SPRING = {
  stiffness: 340,
  damping: 13,
  mass: 0.65,
};

function cssEscapeValue(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}

/**
 * Frosted translucent liquid-glass capsule indicator (`.glass-capsule-pill`).
 * Driven by Framer Motion springs (`useSpring` + `useVelocity` + `useTransform`)
 * for real-time directional stretching along the movement vector and elastic rebound on arrival.
 */
export const GlassSlidingCapsule: React.FC<GlassSlidingCapsuleProps> = ({
  containerRef,
  activeKey,
  tone = 'adaptive',
  insetPx = 0,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const targetW = useMotionValue(0);
  const targetH = useMotionValue(0);

  const springX = useSpring(targetX, POSITION_SPRING);
  const springY = useSpring(targetY, POSITION_SPRING);
  const springW = useSpring(targetW, SIZE_SPRING);
  const springH = useSpring(targetH, SIZE_SPRING);

  const velX = useVelocity(springX);
  const velY = useVelocity(springY);

  // Compute target directional stretch from real-time spring velocity along travel axis
  const rawScaleX = useTransform([velX, velY], (values: number[]) => {
    if (shouldReduceMotion) return 1;
    const vx = values[0] ?? 0;
    const vy = values[1] ?? 0;
    const effectiveVx = Math.max(0, Math.abs(vx) - 90);
    const effectiveVy = Math.max(0, Math.abs(vy) - 90);
    if (effectiveVx === 0 && effectiveVy === 0) return 1;

    if (effectiveVx >= effectiveVy) {
      const stretch = Math.min(0.55, Math.pow(effectiveVx / 800, 0.68) * 0.36);
      return 1 + stretch;
    }

    const verticalStretch = Math.min(0.45, Math.pow(effectiveVy / 600, 0.68) * 0.32);
    return 1 - verticalStretch * 0.36;
  });

  const rawScaleY = useTransform([velX, velY], (values: number[]) => {
    if (shouldReduceMotion) return 1;
    const vx = values[0] ?? 0;
    const vy = values[1] ?? 0;
    const effectiveVx = Math.max(0, Math.abs(vx) - 90);
    const effectiveVy = Math.max(0, Math.abs(vy) - 90);
    if (effectiveVx === 0 && effectiveVy === 0) return 1;

    if (effectiveVy > effectiveVx) {
      const stretch = Math.min(0.45, Math.pow(effectiveVy / 600, 0.68) * 0.32);
      return 1 + stretch;
    }

    const horizontalStretch = Math.min(0.55, Math.pow(effectiveVx / 800, 0.68) * 0.36);
    return 1 - horizontalStretch * 0.34;
  });

  // Underdamped spring smooths the stretch during flight and naturally rebounds elastically on arrival
  const springScaleX = useSpring(rawScaleX, STRETCH_SPRING);
  const springScaleY = useSpring(rawScaleY, STRETCH_SPRING);

  const hasMountedRef = useRef(false);
  const prevKeyRef = useRef<string | null>(null);

  const measureActiveRect = useCallback((): CapsuleRect | null => {
    const container = containerRef.current;
    if (!container) return null;

    const selector = `[data-capsule-key="${cssEscapeValue(activeKey)}"]`;
    const activeEl = container.querySelector<HTMLElement>(selector);
    if (!activeEl) return null;

    const cRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();

    return {
      left: elRect.left - cRect.left - container.clientLeft + container.scrollLeft - insetPx,
      top: elRect.top - cRect.top - container.clientTop + container.scrollTop - insetPx,
      width: elRect.width + insetPx * 2,
      height: elRect.height + insetPx * 2,
    };
  }, [activeKey, containerRef, insetPx]);

  const syncPosition = useCallback(
    (animateTransition: boolean) => {
      const rect = measureActiveRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;

      if (!hasMountedRef.current || !animateTransition || shouldReduceMotion) {
        targetX.jump(rect.left);
        targetY.jump(rect.top);
        targetW.jump(rect.width);
        targetH.jump(rect.height);
        springX.jump(rect.left);
        springY.jump(rect.top);
        springW.jump(rect.width);
        springH.jump(rect.height);
        springScaleX.jump(1);
        springScaleY.jump(1);

        hasMountedRef.current = true;
        prevKeyRef.current = activeKey;
        setIsReady(true);
        return;
      }

      targetX.set(rect.left);
      targetY.set(rect.top);
      targetW.set(rect.width);
      targetH.set(rect.height);

      prevKeyRef.current = activeKey;
      setIsReady(true);
    },
    [
      activeKey,
      measureActiveRect,
      shouldReduceMotion,
      springH,
      springScaleX,
      springScaleY,
      springW,
      springX,
      springY,
      targetH,
      targetW,
      targetX,
      targetY,
    ]
  );

  // Trigger spring slide + velocity-driven directional stretch when activeKey changes
  useLayoutEffect(() => {
    const keyChanged = prevKeyRef.current !== null && prevKeyRef.current !== activeKey;
    syncPosition(keyChanged);
  }, [activeKey, syncPosition]);

  // Keep aligned without stretch on viewport/font/container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      syncPosition(false);
    };

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    observer?.observe(container);

    const activeEl = container.querySelector<HTMLElement>(
      `[data-capsule-key="${cssEscapeValue(activeKey)}"]`
    );
    if (activeEl) {
      observer?.observe(activeEl);
    }

    window.addEventListener('resize', handleResize);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(handleResize).catch(() => {});
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [activeKey, containerRef, syncPosition]);

  return (
    <motion.div
      aria-hidden="true"
      data-glass-tone={tone}
      className={`glass-capsule-pill absolute left-0 top-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{
        x: springX,
        y: springY,
        width: springW,
        height: springH,
        scaleX: springScaleX,
        scaleY: springScaleY,
        transformOrigin: 'center center',
        opacity: isReady ? 1 : 0,
        zIndex: 0,
        willChange: 'transform, width, height',
      }}
    >
      {/* Crisp 1px perimeter highlight ring */}
      <span className="glass-capsule-rim" />
      {/* Subtle upper specular glass sheen */}
      <span className="glass-capsule-sheen" />
    </motion.div>
  );
};
