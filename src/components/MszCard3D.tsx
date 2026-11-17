import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  type MszCharacter,
  RARITY_CONFIGS,
  type CharacterRarity
} from '../data/mszShopData';
import {
  type OwnedCardInstance,
  getCharacterMintCount,
  formatEditionNumber
} from '../utils/mszCoinsManager';

/**
 * Generates dynamic golden light refraction beam simulating refined metallic gold luster.
 * Sweeps pure 24K gold, champagne, and warm amber reflections without any rainbow dispersion.
 */
const getGoldenRefractionGradient = (angle: number, sweep: number) => {
  return `linear-gradient(
    ${angle}deg,
    transparent 0%,
    rgba(212, 175, 55, 0) ${Math.max(0, sweep - 32)}%,
    rgba(245, 158, 11, 0.12) ${Math.max(0, sweep - 18)}%,
    rgba(255, 215, 0, 0.28) ${Math.max(0, sweep - 7)}%,
    rgba(255, 250, 225, 0.45) ${sweep}%,
    rgba(255, 215, 0, 0.28) ${Math.min(100, sweep + 7)}%,
    rgba(245, 158, 11, 0.12) ${Math.min(100, sweep + 18)}%,
    rgba(212, 175, 55, 0) ${Math.min(100, sweep + 32)}%,
    transparent 100%
  )`;
};

/**
 * Returns physically convincing golden foil diffraction interference patterns
 * tailored to each character's rarity tier using strictly luxury gold, champagne, and warm amber tones.
 */
const getGoldenHolographicPattern = (
  rarity: string,
  angle: number,
  x: number,
  y: number,
  fresnel: number
) => {
  switch (rarity) {
    case 'Souveraine':
      // 24K Imperial Gold Leaf Guilloché, Celestial Starburst & Royal Micro-Grooves
      return `
        radial-gradient(ellipse at ${x}% ${y}%, rgba(255, 215, 0, 0.35) 0%, rgba(245, 158, 11, 0.18) 30%, transparent 70%),
        repeating-linear-gradient(${angle}deg, rgba(255, 215, 0, 0.18) 0px, rgba(255, 235, 160, 0.22) 4px, rgba(245, 158, 11, 0.15) 8px, transparent 12px, transparent 16px),
        repeating-radial-gradient(circle at ${x}% ${y}%, rgba(255, 215, 0, 0.16) 0px, transparent 6px, rgba(255, 250, 220, 0.14) 12px, transparent 18px),
        radial-gradient(circle at 50% 50%, rgba(255, 250, 220, 0.12) 0%, transparent 60%)
      `;
    case 'Mythique':
      // Platinum-Gold Crystalline Moiré & Champagne Diamond Facet Reflections
      return `
        radial-gradient(ellipse at ${x}% ${y}%, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.18) 35%, transparent 68%),
        repeating-linear-gradient(${angle + 45}deg, rgba(255, 215, 0, 0.16) 0px, transparent 6px, rgba(255, 245, 200, 0.18) 12px, transparent 18px),
        repeating-linear-gradient(${angle - 45}deg, rgba(245, 158, 11, 0.14) 0px, transparent 8px, rgba(255, 215, 0, 0.14) 16px, transparent 24px)
      `;
    case 'Légendaire':
      // 24K Solar Gold Flare & Dual Laser Refractor Micro-Grooves
      return `
        radial-gradient(circle at ${x}% ${y}%, rgba(245, 158, 11, 0.32) 0%, rgba(251, 191, 36, 0.18) 30%, transparent 65%),
        repeating-linear-gradient(${angle}deg, rgba(255, 215, 0, 0.18) 0px, rgba(245, 158, 11, 0.16) 6px, rgba(255, 240, 180, 0.14) 12px, transparent 18px, transparent 24px),
        repeating-linear-gradient(${angle + 90}deg, rgba(245, 158, 11, 0.12) 0px, transparent 10px, rgba(255, 215, 0, 0.12) 20px)
      `;
    case 'Épique':
      // Warm Amber-Gold Cosmic Rings & Gold Starlight Moiré
      return `
        radial-gradient(circle at ${x}% ${y}%, rgba(251, 191, 36, 0.28) 0%, rgba(217, 119, 6, 0.16) 35%, transparent 65%),
        repeating-linear-gradient(${angle + 30}deg, rgba(255, 215, 0, 0.15) 0px, rgba(245, 158, 11, 0.14) 8px, transparent 16px, transparent 24px),
        repeating-radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0px, transparent 10px, rgba(245, 158, 11, 0.1) 20px)
      `;
    case 'Rare':
      // Cybernetic Golden Micro-Dot Linear Grating
      return `
        radial-gradient(circle at ${x}% ${y}%, rgba(255, 215, 0, 0.25) 0%, rgba(245, 158, 11, 0.15) 35%, transparent 65%),
        repeating-linear-gradient(${angle}deg, rgba(255, 215, 0, 0.14) 0px, rgba(255, 240, 180, 0.14) 8px, transparent 16px, transparent 24px)
      `;
    default:
      // Brushed Champagne Gold Hairline Shimmer
      return `
        radial-gradient(circle at ${x}% ${y}%, rgba(212, 175, 55, 0.22) 0%, transparent 60%),
        repeating-linear-gradient(${angle}deg, rgba(255, 215, 0, 0.1) 0px, transparent 4px, rgba(255, 245, 200, 0.1) 8px, transparent 14px)
      `;
  }
};

/**
 * High-intensity warm gold and champagne specular hotspot
 */
const getGoldenSpecularGlareGradient = (x: number, y: number, angle: number) => {
  return `
    radial-gradient(ellipse at ${x}% ${y}%, rgba(255, 255, 245, 0.5) 0%, rgba(255, 235, 160, 0.28) 16%, rgba(245, 158, 11, 0.14) 34%, transparent 65%),
    linear-gradient(${angle}deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 245, 180, 0.1) 35%, rgba(245, 158, 11, 0.1) 70%, transparent 100%)
  `;
};

interface MszCard3DProps {
  character: MszCharacter;
  isOwned?: boolean;
  isEquipped?: boolean;
  userCoins?: number;
  ownedInstance?: OwnedCardInstance;
  onBuy?: (character: MszCharacter) => void;
  onEquip?: (character: MszCharacter) => void;
  onSell?: (character: MszCharacter) => void;
  onInspect?: (character: MszCharacter, startZoomed?: boolean) => void;
  onZoom?: (character: MszCharacter) => void;
  compact?: boolean;
}

export const MszCard3D: React.FC<MszCard3DProps> = ({
  character,
  isOwned = false,
  isEquipped = false,
  userCoins = 0,
  ownedInstance,
  onBuy,
  onEquip,
  onSell,
  onInspect,
  onZoom,
  compact = false
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [glarePosition, setGlarePosition] = useState<{
    x: number;
    y: number;
    opacity: number;
    angle: number;
    hueShift: number;
    fresnel: number;
    sweepOffset: number;
  }>({
    x: 50,
    y: 50,
    opacity: 0,
    angle: 135,
    hueShift: 180,
    fresnel: 0,
    sweepOffset: 50
  });
  // Active sub-layer parallax offsets (for character artwork, badges, title)
  const [layerParallax, setLayerParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Long-press (Clic prolongé) state for deep zoom examination
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldTriggeredRef = useRef<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Physical Inertia & Mass Simulation Refs
  const rotXRef = useRef<number>(0);
  const rotYRef = useRef<number>(0);
  const velXRef = useRef<number>(0);
  const velYRef = useRef<number>(0);
  const targetRotXRef = useRef<number>(0);
  const targetRotYRef = useRef<number>(0);
  const prevTargetXRef = useRef<number>(0);
  const prevTargetYRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isInteractingRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const isFlippingRef = useRef<boolean>(false);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mint & Supply Stats
  const currentMint = getCharacterMintCount(character.id);
  const maxSupply = character.maxSupply || 100;
  const isSoldOut = currentMint >= maxSupply;
  const remainingInStock = Math.max(0, maxSupply - currentMint);

  // Serial Display String (e.g. "12/100")
  const simpleSerial = ownedInstance
    ? `${ownedInstance.editionNumber}/${maxSupply}`
    : `${Math.min(maxSupply, currentMint + 1)}/${maxSupply}`;

  const serialDisplay = ownedInstance
    ? formatEditionNumber(ownedInstance.editionNumber, maxSupply)
    : `${currentMint}/${maxSupply}`;

  const serialCode = ownedInstance
    ? ownedInstance.serialCode
    : `${character.serialPrefix}-#${String(currentMint).padStart(3, '0')}/${maxSupply}`;

  /**
   * Physics Simulation Loop:
   * 1. While interacting: Card responds to cursor with simulated mass and viscosity (spring-damping).
   * 2. When cursor stops: Momentum carries tilt slightly past the cursor point before softly settling.
   * 3. When released (leave/touch-end): Angular momentum carries over, overshooting smoothly,
   *    then returning to equilibrium (0, 0) via damped harmonic restitution.
   * 4. Calculates dynamic light refraction, chromatic dispersion hue shift, and Fresnel reflectance.
   */
  const updatePhysics = useCallback(() => {
    const isInteracting = isInteractingRef.current;
    const isFlippingCurrent = isFlippingRef.current;

    if (isFlippingCurrent) {
      velXRef.current *= 0.8;
      velYRef.current *= 0.8;
    } else if (isInteracting) {
      // Spring pull towards pointer target with physical mass & viscous resistance
      const springK = 0.18;
      const damping = 0.76;

      const forceX = (targetRotXRef.current - rotXRef.current) * springK;
      const forceY = (targetRotYRef.current - rotYRef.current) * springK;

      velXRef.current = (velXRef.current + forceX) * damping;
      velYRef.current = (velYRef.current + forceY) * damping;

      rotXRef.current += velXRef.current;
      rotYRef.current += velYRef.current;
    } else {
      // INERTIA TAKES OVER: Angular momentum carries the tilt forward along release trajectory,
      // while a restoring spring pulls the card back to resting horizontal equilibrium (0, 0).
      const restoringK = 0.052;
      const inertiaAirResistance = 0.912; // High momentum retention gives authentic physical weight

      const forceX = -rotXRef.current * restoringK;
      const forceY = -rotYRef.current * restoringK;

      velXRef.current = (velXRef.current + forceX) * inertiaAirResistance;
      velYRef.current = (velYRef.current + forceY) * inertiaAirResistance;

      rotXRef.current += velXRef.current;
      rotYRef.current += velYRef.current;
    }

    const currentX = rotXRef.current;
    const currentY = rotYRef.current;
    const currentVelX = velXRef.current;
    const currentVelY = velYRef.current;

    // Settling condition: stop RAF loop when movement decays to rest
    if (
      !isInteracting &&
      Math.abs(currentX) < 0.02 &&
      Math.abs(currentY) < 0.02 &&
      Math.abs(currentVelX) < 0.008 &&
      Math.abs(currentVelY) < 0.008
    ) {
      rotXRef.current = 0;
      rotYRef.current = 0;
      velXRef.current = 0;
      velYRef.current = 0;
      setRotateX(0);
      setRotateY(0);
      setLayerParallax({ x: 0, y: 0 });
      setGlarePosition({
        x: 50,
        y: 50,
        opacity: 0,
        angle: 135,
        hueShift: 180,
        fresnel: 0,
        sweepOffset: 50
      });
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    setRotateX(currentX);
    setRotateY(currentY);

    // Synchronize sub-layer stereoscopic parallax in lockstep with physical inertia
    const normX = Math.max(-1, Math.min(1, currentY / 14));
    const normY = Math.max(-1, Math.min(1, -currentX / 14));
    setLayerParallax({
      x: normX * 7,
      y: normY * 7
    });

    // Dynamic specular & holographic refraction calculation
    const glareX = 50 + normX * 38;
    const glareY = 50 + normY * 38;
    const angleDeg = ((Math.atan2(normY, normX) * 180) / Math.PI + 90 + 360) % 360;
    const tiltIntensity = Math.min(1, Math.sqrt(normX * normX + normY * normY));

    // Optical wavelength spectral dispersion: rotation shifts the chromatic hue
    const hueShift = Math.round(((currentY * 11 + currentX * 9) + 3600) % 360);
    // Optical sweep position across the collectible card (-15% to 115%)
    const sweepOffset = Math.round(50 + normX * 42 + normY * 26);
    // Fresnel reflection coefficient (intensifies with tilt angle)
    const fresnel = Math.min(1, Math.pow(tiltIntensity, 0.85));

    // Dynamic refractive opacity: subtle refined golden luster, never overpowering artwork or text
    const targetOpacity = isInteracting
      ? Math.min(0.48, 0.18 + tiltIntensity * 0.26)
      : Math.min(0.36, 0.06 + tiltIntensity * 0.28);

    setGlarePosition({
      x: glareX,
      y: glareY,
      opacity: targetOpacity,
      angle: angleDeg,
      hueShift,
      fresnel,
      sweepOffset
    });

    animFrameRef.current = requestAnimationFrame(updatePhysics);
  }, []);

  const startPhysicsLoop = useCallback(() => {
    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // Pointer position & velocity impulse tracking
  const handlePointerInteraction = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
    const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

    // Target tilt angles (smooth physical range, max ±14 degrees)
    const newTargetX = -normY * 14;
    const newTargetY = normX * 14;

    const now = performance.now();
    const dt = Math.max(8, Math.min(100, now - (lastMoveTimeRef.current || now)));
    lastMoveTimeRef.current = now;

    // Angular impulse calculation: measures how quickly cursor is moving across the card
    const deltaTargetX = newTargetX - prevTargetXRef.current;
    const deltaTargetY = newTargetY - prevTargetYRef.current;

    // Time-normalized velocity impulse
    const frameFactor = 16.67 / dt;
    const impulseX = deltaTargetX * frameFactor * 0.45;
    const impulseY = deltaTargetY * frameFactor * 0.45;

    // Inject momentum with physical clamping
    velXRef.current = Math.max(-9, Math.min(9, velXRef.current * 0.5 + impulseX));
    velYRef.current = Math.max(-9, Math.min(9, velYRef.current * 0.5 + impulseY));

    targetRotXRef.current = newTargetX;
    targetRotYRef.current = newTargetY;
    prevTargetXRef.current = newTargetX;
    prevTargetYRef.current = newTargetY;

    isInteractingRef.current = true;
    setIsHovering(true);
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerInteraction(e.clientX, e.clientY);
  }, [handlePointerInteraction]);

  const handleMouseLeave = useCallback(() => {
    isInteractingRef.current = false;
    setIsHovering(false);
    targetRotXRef.current = 0;
    targetRotYRef.current = 0;
    // Accumulated velXRef and velYRef remain intact!
    // The physics loop will carry the rotation forward in the direction of release,
    // then the restoring spring and damping will smoothly return the card to rest.
    startPhysicsLoop();

    // Cancel hold if mouse leaves card
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  }, [startPhysicsLoop]);

  // Long-press handling (Clic prolongé pour examiner les détails artistiques et textuels)
  const startHold = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return;
    setIsHolding(true);
    isHoldTriggeredRef.current = false;

    holdTimerRef.current = setTimeout(() => {
      isHoldTriggeredRef.current = true;
      setIsHolding(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      if (onZoom) {
        onZoom(character);
      } else {
        onInspect?.(character, true);
      }
    }, 420);
  }, [character, onZoom, onInspect]);

  const endHold = useCallback(() => {
    setIsHolding(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // Mobile Touch Move (supports realistic touch-based drag tilt with inertia)
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    handlePointerInteraction(touch.clientX, touch.clientY);
  }, [handlePointerInteraction]);

  const handleTouchEnd = useCallback(() => {
    endHold();
    isInteractingRef.current = false;
    setIsHovering(false);
    targetRotXRef.current = 0;
    targetRotYRef.current = 0;
    // Preserves velocity for inertia carry-over on finger lift
    startPhysicsLoop();
  }, [endHold, startPhysicsLoop]);

  // Mobile Device Orientation Gyroscope Support (Smooth tilt with simulated mass)
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (isInteractingRef.current || !cardRef.current) return;
      if (event.gamma === null || event.beta === null) return;

      const gamma = Math.max(-20, Math.min(20, event.gamma));
      const beta = Math.max(-20, Math.min(20, event.beta - 40));

      const rotY = (gamma / 20) * 11;
      const rotX = -(beta / 20) * 11;

      targetRotXRef.current = rotX;
      targetRotYRef.current = rotY;
      startPhysicsLoop();
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }
    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [startPhysicsLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isHoldTriggeredRef.current) {
      e.stopPropagation();
      return;
    }
    onInspect?.(character, false);
  };

  const handleFlipCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipping(true);
    isFlippingRef.current = true;
    setIsFlipped((prev) => !prev);
    velXRef.current *= 0.2;
    velYRef.current *= 0.2;
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      setIsFlipping(false);
      isFlippingRef.current = false;
    }, 650);
  };

  const handleDirectZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onZoom) {
      onZoom(character);
    } else {
      onInspect?.(character, true);
    }
  };

  const canAfford = userCoins >= character.price;

  // Retrieve Rarity Configuration (glow, golden border, badge styling)
  const rarityConfig =
    RARITY_CONFIGS[character.rarity as CharacterRarity] || RARITY_CONFIGS['Commune'];

  // Dynamic card frame border & glow class based on golden border & rarity
  const getCardFrameStyle = () => {
    if (isEquipped) {
      return 'border-[2px] border-[#ffd700] ring-2 ring-[#ffd700]/70 shadow-[0_0_35px_rgba(255,215,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.45)]';
    }
    if (character.rarity === 'Souveraine') {
      return 'border-[2px] border-[#d4af37] ring-2 ring-[#ffd700]/80 shadow-[0_0_40px_rgba(255,215,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.5)] hover:shadow-[0_0_55px_rgba(255,215,0,0.95)]';
    }
    if (character.rarity === 'Mythique') {
      return 'border-[2px] border-emerald-400/90 ring-1 ring-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.5),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:shadow-[0_0_45px_rgba(52,211,153,0.85)]';
    }
    if (character.rarity === 'Légendaire') {
      return 'border-[2px] border-amber-400/90 ring-1 ring-amber-400/40 shadow-[0_0_28px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)]';
    }
    if (character.rarity === 'Épique') {
      return 'border-[1.5px] border-purple-400/80 ring-1 ring-purple-400/35 shadow-[0_0_24px_rgba(168,85,247,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.25)] hover:shadow-[0_0_34px_rgba(168,85,247,0.65)]';
    }
    if (character.rarity === 'Rare') {
      return 'border-[1.5px] border-cyan-400/70 ring-1 ring-cyan-400/30 shadow-[0_0_20px_rgba(56,189,248,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.25)] hover:shadow-[0_0_28px_rgba(56,189,248,0.55)]';
    }
    return 'border-[1.5px] border-slate-400/50 ring-1 ring-slate-400/20 shadow-[0_0_16px_rgba(148,163,184,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_24px_rgba(148,163,184,0.45)]';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onTouchStart={startHold}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`group relative select-none cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1.5 ${
        compact
          ? 'w-full max-w-[280px] h-[480px]'
          : 'w-full max-w-[340px] sm:max-w-[365px] h-[540px] sm:h-[575px]'
      }`}
      style={{
        perspective: '1400px',
        touchAction: 'pan-y'
      }}
      onClick={handleCardClick}
      title="Clic ou Clic prolongé : Examiner en Zoom Artistique HD"
    >
      {/* Visual Feedback during Long Press (Clic Prolongé) */}
      {isHolding && (
        <div className="absolute inset-0 rounded-3xl z-30 pointer-events-none flex flex-col items-center justify-center bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="w-14 h-14 rounded-full border-3 border-t-[#ffd700] border-r-[#ffd700] border-b-transparent border-l-transparent animate-spin mb-3 shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
          <span className="text-[11px] font-mono font-bold text-[#ffd700] tracking-wider px-3 py-1 rounded-full bg-[#0a101f] border border-[#ffd700]/50 shadow-xl">
            Zoom Haute Définition...
          </span>
        </div>
      )}

      {/* 3D Rotating Wrapper with Real-time Reactive Physics & Directional Shadow */}
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`,
          transition: isFlipping
            ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)'
            : 'none',
          filter: (isHovering || Math.abs(rotateX) > 0.4 || Math.abs(rotateY) > 0.4)
            ? `drop-shadow(${-rotateY * 1.5}px ${rotateX * 1.5 + 16}px 26px rgba(0,0,0,0.8))`
            : 'drop-shadow(0px 14px 24px rgba(0,0,0,0.65))'
        }}
      >
        {/* 3D Physical Acrylic Slab Thickness Facets (Visible when tilted in 3D) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Right 3D Thickness Edge */}
          <div
            className="absolute top-4 bottom-4 right-0 w-[10px] rounded-r-md pointer-events-none"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(90deg) translateZ(5px)',
              background: 'linear-gradient(to right, rgba(15,23,42,0.95), rgba(71,85,105,0.8) 35%, rgba(255,255,255,0.3) 60%, rgba(15,23,42,0.95))',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.85)'
            }}
          />
          {/* Left 3D Thickness Edge */}
          <div
            className="absolute top-4 bottom-4 left-0 w-[10px] rounded-l-md pointer-events-none"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(-90deg) translateZ(5px)',
              background: 'linear-gradient(to left, rgba(15,23,42,0.95), rgba(71,85,105,0.8) 35%, rgba(255,255,255,0.3) 60%, rgba(15,23,42,0.95))',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.85)'
            }}
          />
          {/* Top 3D Thickness Edge */}
          <div
            className="absolute left-4 right-4 top-0 h-[10px] rounded-t-md pointer-events-none"
            style={{
              transformOrigin: 'center top',
              transform: 'rotateX(90deg) translateZ(5px)',
              background: 'linear-gradient(to top, rgba(15,23,42,0.95), rgba(100,116,139,0.85) 35%, rgba(255,255,255,0.35) 60%, rgba(15,23,42,0.95))',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.85)'
            }}
          />
          {/* Bottom 3D Thickness Edge */}
          <div
            className="absolute left-4 right-4 bottom-0 h-[10px] rounded-b-md pointer-events-none"
            style={{
              transformOrigin: 'center bottom',
              transform: 'rotateX(-90deg) translateZ(5px)',
              background: 'linear-gradient(to bottom, rgba(15,23,42,0.95), rgba(30,41,59,0.85) 35%, rgba(255,255,255,0.2) 60%, rgba(5,8,15,0.98))',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.85)'
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* RECTO (FRONT FACE - LUXURY SLAB WITH EXPANDED UPPER STAGE) */}
        {/* ============================================================== */}
        <div
          className={`absolute inset-0 rounded-3xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden backdrop-blur-2xl transition-all duration-300 bg-gradient-to-b from-[#0a1120] via-[#070c17] to-[#04060c] ${getCardFrameStyle()}`}
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            boxShadow: `
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 2px rgba(0, 0, 0, 0.7),
              0 2px 4px rgba(0,0,0,0.5)
            `
          }}
        >
          {/* ============================================================== */}
          {/* CALQUE 1 : RÉFRACTION LUMINEUSE DORÉE SUBTILE (Color-Dodge) */}
          {/* Faisceau d'éclat or 24K, champagne et ambre chaud sans arc-en-ciel */}
          {/* ============================================================== */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl z-24 mix-blend-color-dodge transition-opacity duration-150 overflow-hidden"
            style={{
              transform: 'translateZ(48px)',
              backgroundImage: getGoldenRefractionGradient(
                glarePosition.angle,
                glarePosition.sweepOffset
              ),
              opacity: glarePosition.opacity * 0.72
            }}
          />

          {/* ============================================================== */}
          {/* CALQUE 2 : MICRO-GUILLOCHÉ ET FACETTES HOLOGRAPHIQUES DORÉES */}
          {/* Motifs géométriques en or pur et champagne selon la rareté */}
          {/* ============================================================== */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl z-26 mix-blend-color-dodge transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(52px)',
              backgroundImage: getGoldenHolographicPattern(
                character.rarity,
                glarePosition.angle,
                glarePosition.x,
                glarePosition.y,
                glarePosition.fresnel
              ),
              opacity: glarePosition.opacity * 0.62
            }}
          />

          {/* ============================================================== */}
          {/* CALQUE 3 : POINT CHAUD SPÉCULAIRE OR CHAUD ET CHAMPAGNE */}
          {/* Reflet spéculaire doux sans aberration chromatique ni dispersion */}
          {/* ============================================================== */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl z-28 mix-blend-screen transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(56px)',
              backgroundImage: getGoldenSpecularGlareGradient(
                glarePosition.x,
                glarePosition.y,
                glarePosition.angle
              ),
              opacity: glarePosition.opacity * 0.55
            }}
          />

          {/* ============================================================== */}
          {/* CALQUE 4 : LISERÉ PÉRIMÉTRIQUE DE FRESNEL OR VIBRANT */}
          {/* Reflet d'angle rasant en or chaud doux au pourtour */}
          {/* ============================================================== */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl z-29 transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(58px)',
              boxShadow: `inset 0 0 20px rgba(255, 215, 0, ${glarePosition.fresnel * 0.22})`,
              opacity: glarePosition.opacity * 0.65
            }}
          />

          {/* Optical Protective Crystal Face Plate with Laser Corner Markers */}
          <div
            className="pointer-events-none absolute inset-1.5 rounded-2xl z-35 border border-white/10"
            style={{
              transform: 'translateZ(60px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1px 1px rgba(0,0,0,0.4)'
            }}
          >
            {/* Corner Alignment Crosshairs (Authentic Graded Slab Detail) */}
            <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-white/30 rounded-tl-sm pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-white/30 rounded-tr-sm pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-white/30 rounded-bl-sm pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-white/30 rounded-br-sm pointer-events-none" />
          </div>

          {/* Chamfered inner bezel with subtle metallic sheen */}
          <div
            className={`absolute inset-0.5 rounded-3xl pointer-events-none z-10 ${
              rarityConfig.goldenBorder
                ? 'border border-[#d4af37]/40 shadow-inner'
                : 'border border-white/10'
            }`}
            style={{
              transform: 'translateZ(12px)'
            }}
          />

          {/* ============================================================== */}
          {/* UPPER PRESENTATION STAGE (AGRANDI & MONUMENTAL) */}
          {/* ============================================================== */}
          <div
            onClick={handleDirectZoom}
            className="relative w-full h-[310px] sm:h-[345px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060914] via-[#080d1c] to-[#03060d] border border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] group/art cursor-zoom-in flex flex-col justify-between p-3 select-none"
            title="Cliquer ou clic prolongé : Zoom Artistique HD"
            style={{
              transform: 'translateZ(20px)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Ambient soft backlight behind character helmet */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-500 group-hover/art:opacity-65"
              style={{
                background: `radial-gradient(circle at 50% 42%, ${character.colorTheme.primary}40 0%, transparent 70%)`,
                transform: 'translateZ(5px)'
              }}
            />

            {/* Top Floating Bar: Level, Rarity Badge & Action Icons */}
            <div
              className="flex items-center justify-between relative z-10 gap-1.5 transition-transform ease-out"
              style={{
                transform: `translate3d(${-layerParallax.x * 0.6}px, ${-layerParallax.y * 0.6}px, 35px)`,
                transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#070d1a]/90 border border-white/15 text-[#cbd5e1] font-bold shadow-sm backdrop-blur-md">
                  Niv. {character.level}
                </span>

                {/* Minimalist Visual Rarity Pill */}
                <div
                  className={`text-[9px] font-mono uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md transition-all ${
                    rarityConfig.badgeClass
                  } ${
                    rarityConfig.goldenBorder
                      ? 'ring-1 ring-[#ffd700]/70'
                      : ''
                  }`}
                  style={{
                    boxShadow: rarityConfig.glowShadow
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[11px]"
                    style={{
                      color: rarityConfig.accentColor,
                      fontVariationSettings: "'FILL' 1"
                    }}
                  >
                    {rarityConfig.icon}
                  </span>
                  <span className="tracking-wider">{rarityConfig.label}</span>
                </div>
              </div>

              {/* Top Right Actions: Direct Zoom & 3D Flip */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleDirectZoom}
                  className="w-7 h-7 rounded-lg bg-[#070d1a]/85 hover:bg-[#1a253d] border border-white/20 text-[#38bdf8] hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer z-20 backdrop-blur-md"
                  title="Examiner en Zoom Artistique HD"
                >
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlipCard}
                  className="px-2.5 h-7 rounded-lg bg-[#070d1a]/85 hover:bg-[#1a253d] border border-white/20 text-[#ffe082] hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer z-20 backdrop-blur-md"
                  title="Retourner la carte en 3D (Certificat & Fiche Technique)"
                >
                  <span className="material-symbols-outlined text-xs">rotate_right</span>
                  <span className="hidden sm:inline">Verso 3D</span>
                </button>
              </div>
            </div>

            {/* Monumental Character Artwork Rendering with Sub-Layer 3D Depth */}
            <div
              className="relative my-auto w-full h-[225px] sm:h-[250px] flex items-center justify-center z-0 transition-transform ease-out"
              style={{
                transform: `translate3d(${-layerParallax.x * 1.6}px, ${-layerParallax.y * 1.6}px, 50px)`,
                transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-contain object-center drop-shadow-[0_18px_35px_rgba(0,0,0,0.92)] group-hover/art:scale-106 transition-transform duration-700 ease-out"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.dataset.fallbackApplied) return;
                  target.dataset.fallbackApplied = 'true';
                  target.src = '/assets/aistudio/VOLT.png';
                }}
              />

              {/* Dynamic Subtle Golden Luster Sheen on Character Artwork */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-color-dodge transition-opacity duration-150 overflow-hidden"
                style={{
                  backgroundImage: getGoldenRefractionGradient(
                    glarePosition.angle + 35,
                    glarePosition.sweepOffset
                  ),
                  opacity: glarePosition.opacity * 0.32
                }}
              />
            </div>

            {/* Floating Provenance Strip & Element at Bottom of Upper Stage */}
            <div
              className="relative z-10 flex items-center justify-between pt-1 transition-transform ease-out"
              style={{
                transform: `translate3d(${-layerParallax.x * 0.8}px, ${-layerParallax.y * 0.8}px, 40px)`,
                transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              {/* Limited Edition Serial Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#050914]/90 border border-[#f2ca50]/30 shadow-inner backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-pulse" />
                <span className="text-[9px] font-mono font-black text-[#ffd700]">
                  № {simpleSerial}
                </span>
                <span className="text-[8px] font-mono text-[#94a3b8] uppercase tracking-wider hidden sm:inline">
                  &bull; 100 Ex.
                </span>
              </div>

              {/* Element Tag */}
              <span className="px-2.5 py-0.5 rounded-full bg-[#050914]/90 border border-white/10 text-[9px] font-mono text-[#cbd5e1] tracking-wider uppercase backdrop-blur-md">
                {character.element}
              </span>
            </div>

            {/* Subtle Hover Zoom Pill */}
            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/art:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none z-20 backdrop-blur-[0.5px]">
              <span className="px-3 py-1 rounded-full bg-[#070e1d]/95 border border-[#38bdf8]/60 text-[#38bdf8] text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-2xl">
                <span className="material-symbols-outlined text-xs">search</span>
                <span>Zoom Loupe HD</span>
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LOWER METADATA & ACTIONS (MINIMALIST LUXURY UI) */}
          {/* ============================================================== */}
          <div
            className="relative z-10 pt-3 pb-1 px-1 flex flex-col justify-between flex-1 transition-transform ease-out"
            style={{
              transform: `translate3d(${-layerParallax.x * 0.5}px, ${-layerParallax.y * 0.5}px, 28px)`,
              transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <h4 className="font-serif text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-sm leading-tight">
                  {character.name}
                </h4>
                <span className="text-[10px] text-[#94a3b8] font-mono tracking-wider uppercase mt-0.5">
                  {character.categoryName}
                </span>
              </div>

              {/* Discrete Mint / Stock Tag */}
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  isOwned
                    ? 'bg-amber-500/15 text-[#ffd700] border border-[#f2ca50]/40'
                    : isSoldOut
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-[#131b2e] text-[#38bdf8] border border-[#38bdf8]/25'
                }`}
              >
                {isOwned ? 'Certifié' : isSoldOut ? 'Épuisé' : `${remainingInStock} dispo`}
              </span>
            </div>

            {/* Action Row: Price / Equip status */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-sm text-[#f2ca50]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  monetization_on
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-white">
                  {character.price}
                </span>
                <span className="text-[10px] font-mono text-[#f2ca50] font-bold">MSZ</span>
              </div>

              <div>
                {isEquipped ? (
                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-mono font-black flex items-center gap-1 shadow-md shadow-amber-500/20">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Équipé
                  </span>
                ) : isOwned ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEquip?.(character);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#172238] hover:bg-[#d4af37] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Équiper
                  </button>
                ) : isSoldOut ? (
                  <span className="px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                    Bourse P2P
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy?.(character);
                    }}
                    disabled={!canAfford}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffd700] hover:brightness-110 text-[#1a1300]'
                        : 'bg-[#151e30] border border-white/10 text-[#64748b] cursor-not-allowed'
                    }`}
                    title={canAfford ? 'Acquérir cette carte certifiée' : 'MSZ Coins insuffisants'}
                  >
                    <span className="material-symbols-outlined text-xs">shopping_bag</span>
                    <span>Acquérir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VERSO (BACK FACE - LUXURY PROVENANCE SPECIFICATION SHEET) */}
        {/* ============================================================== */}
        <div
          className={`absolute inset-0 rounded-3xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden backdrop-blur-2xl shadow-2xl bg-gradient-to-b from-[#0c1222] via-[#080d19] to-[#04060c] ${getCardFrameStyle()}`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Dynamic Golden Refraction Glare on Verso */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl z-30 mix-blend-screen transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(50px)',
              background: `
                radial-gradient(circle at ${100 - glarePosition.x}% ${glarePosition.y}%, rgba(255, 250, 220, 0.32) 0%, rgba(255, 215, 0, 0.12) 25%, transparent 65%),
                linear-gradient(${glarePosition.angle + 180}deg, transparent 20%, rgba(245, 158, 11, 0.1) 50%, transparent 80%)
              `,
              opacity: glarePosition.opacity * 0.48
            }}
          />

          {/* Optical Acrylic Plate Overlay with Laser Corner Markers on Verso */}
          <div
            className="pointer-events-none absolute inset-1.5 rounded-2xl z-35 border border-white/10"
            style={{
              transform: 'translateZ(55px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1px 1px rgba(0,0,0,0.4)'
            }}
          >
            <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-white/25 rounded-tl-sm pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-white/25 rounded-tr-sm pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-white/25 rounded-bl-sm pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-white/25 rounded-br-sm pointer-events-none" />
          </div>

          {/* Chamfered inner bezel on Verso */}
          <div
            className={`absolute inset-0.5 rounded-3xl pointer-events-none z-10 ${
              rarityConfig.goldenBorder
                ? 'border border-[#d4af37]/35 shadow-inner'
                : 'border border-white/10'
            }`}
            style={{
              transform: 'translateZ(12px)'
            }}
          />

          {/* Top Bar: Title, Character Level & Flip Back Button */}
          <div
            className="flex items-start justify-between border-b border-white/10 pb-3 transition-transform ease-out"
            style={{
              transform: `translate3d(${-layerParallax.x * 0.5}px, ${-layerParallax.y * 0.5}px, 30px)`,
              transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
            }}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] uppercase font-bold text-[#d4af37] font-mono tracking-widest">
                  CERTIFICAT DE PROVENANCE
                </span>
                <span className="text-white/20">&bull;</span>
                <span className="text-[9px] font-mono text-[#38bdf8] font-bold">
                  NIV. {character.level}
                </span>
                {/* Visual Rarity Badge on Verso */}
                <span
                  className={`text-[8px] font-mono uppercase px-2 py-0.2 rounded-full inline-flex items-center gap-1 ${
                    rarityConfig.badgeClass
                  } ${
                    rarityConfig.goldenBorder ? 'ring-1 ring-[#ffd700]/50' : ''
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[9px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {rarityConfig.icon}
                  </span>
                  <span>{rarityConfig.label}</span>
                </span>
              </div>
              <h3 className="font-serif text-xl font-black text-white mt-0.5 tracking-wide">
                {character.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleFlipCard}
              className="px-2.5 py-1 rounded-xl bg-[#0e1627] hover:bg-[#1a253d] border border-white/20 text-[#ffe082] text-xs font-mono flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Revenir au Recto"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
              <span className="text-[10px]">Recto</span>
            </button>
          </div>

          {/* Certificate of Authenticity & Unique Serial Code Box */}
          <div
            className="relative p-3 rounded-2xl bg-[#060a14] border border-[#d4af37]/35 flex flex-col gap-1.5 shadow-inner transition-transform ease-out overflow-hidden"
            style={{
              transform: `translate3d(${-layerParallax.x * 0.8}px, ${-layerParallax.y * 0.8}px, 40px)`,
              transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
            }}
          >
            {/* Dynamic Holographic Security Seal with Pure Golden Refraction */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-color-dodge transition-opacity duration-200"
              style={{
                backgroundImage: getGoldenRefractionGradient(
                  glarePosition.angle,
                  100 - glarePosition.sweepOffset
                ),
                opacity: glarePosition.opacity * 0.3
              }}
            />
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#d4c78f] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#d4af37]">verified_user</span>
                Matricule Officiel :
              </span>
              <span className="text-[#ffd700] font-black tracking-wider">{serialCode}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#94a3b8]">
              <span>Tirage Garanti :</span>
              <span className="text-white font-bold">
                {isOwned
                  ? `Exemplaire № ${simpleSerial} (Série ${serialDisplay})`
                  : `${currentMint} / ${maxSupply} frappés (${remainingInStock} restants)`}
              </span>
            </div>
          </div>

          {/* Lore Quote & Presentation Description */}
          <div
            className="my-auto flex flex-col gap-2 py-1 transition-transform ease-out"
            style={{
              transform: `translate3d(${-layerParallax.x * 0.6}px, ${-layerParallax.y * 0.6}px, 32px)`,
              transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
            }}
          >
            <blockquote className="font-serif italic text-xs text-[#ffe082] bg-[#070e1c]/80 p-3 rounded-2xl border border-white/5 leading-relaxed">
              « {character.loreQuote.replace(/^[«\s]+|[»\s]+$/g, '')} »
            </blockquote>

            <p className="text-[11px] text-[#cbd5e1] leading-relaxed line-clamp-3 px-1">
              {character.description}
            </p>

            {/* Radar / Stat Gauges with Refined Hairline Bars */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Élocution */}
              <div className="p-1.5 rounded-xl bg-[#060a14] border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#94a3b8]">Élocution</span>
                  <span className="text-cyan-400 font-black">{character.stats.elocution}</span>
                </div>
                <div className="h-1 bg-[#131b2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${character.stats.elocution}%` }}
                  />
                </div>
              </div>

              {/* Mémoire */}
              <div className="p-1.5 rounded-xl bg-[#060a14] border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#94a3b8]">Mémoire</span>
                  <span className="text-purple-400 font-black">{character.stats.memoire}</span>
                </div>
                <div className="h-1 bg-[#131b2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${character.stats.memoire}%` }}
                  />
                </div>
              </div>

              {/* Vitesse */}
              <div className="p-1.5 rounded-xl bg-[#060a14] border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#94a3b8]">Vitesse</span>
                  <span className="text-amber-400 font-black">{character.stats.vitesse}</span>
                </div>
                <div className="h-1 bg-[#131b2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${character.stats.vitesse}%` }}
                  />
                </div>
              </div>

              {/* Maîtrise */}
              <div className="p-1.5 rounded-xl bg-[#060a14] border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#94a3b8]">Maîtrise</span>
                  <span className="text-emerald-400 font-black">{character.stats.maitrise}</span>
                </div>
                <div className="h-1 bg-[#131b2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${character.stats.maitrise}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Passive Bonus Pill */}
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#d4af37]/10 to-yellow-500/10 border border-[#d4af37]/30 flex items-center gap-2 text-[10px] text-[#ffe082]">
              <span className="material-symbols-outlined text-sm text-[#d4af37] shrink-0">
                military_tech
              </span>
              <span className="leading-snug truncate">
                <strong className="text-[#ffd700]">Bonus :</strong> {character.passiveBonus}
              </span>
            </div>
          </div>

          {/* Verso Actions Footer */}
          <div
            className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 transition-transform ease-out"
            style={{
              transform: `translate3d(${-layerParallax.x * 0.5}px, ${-layerParallax.y * 0.5}px, 30px)`,
              transition: isFlipping ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
            }}
          >
            <span className="text-[10px] font-mono text-[#94a3b8]">
              Série {character.categoryId}/7 &bull; {character.categoryName}
            </span>

            <div className="flex items-center gap-2">
              {isOwned ? (
                <>
                  {!isEquipped && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEquip?.(character);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#172238] hover:bg-[#d4af37] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Équiper
                    </button>
                  )}
                  {onSell && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSell?.(character);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/35 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      title="Vendre sur la Bourse P2P avec son numéro de série"
                    >
                      Vendre P2P
                    </button>
                  )}
                </>
              ) : isSoldOut ? (
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  Voir sur la Bourse P2P
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy?.(character);
                  }}
                  disabled={!canAfford}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffd700] text-[#1a1300]'
                      : 'bg-[#151e30] text-[#64748b] border border-white/10'
                  }`}
                >
                  <span>Acquérir ({character.price} MSZ)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
