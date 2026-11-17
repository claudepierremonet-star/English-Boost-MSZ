import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  SHOP_CATEGORIES,
  MSZ_CHARACTERS,
  type MszCharacter,
  type ShopCategory
} from '../data/mszShopData';
import {
  getMszCoinsBalance,
  getDailyMszCoinsState,
  getOwnedCharacterIds,
  getOwnedCardInstances,
  getEquippedCharacterId,
  buyCharacterFromShop,
  equipCharacter,
  getCharacterMintCount,
  formatEditionNumber,
  type OwnedCardInstance
} from '../utils/mszCoinsManager';

interface MszShopProps {
  userLevel?: number;
  onOpenFullShop?: () => void;
  onProfileUpdated?: () => void;
}

/**
 * Generates dynamic golden light refraction beam simulating refined metallic gold luster.
 * Sweeps pure 24K gold, champagne, and warm amber reflections without rainbow dispersion.
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

const getGoldenSpecularGlareGradient = (x: number, y: number, angle: number) => {
  return `
    radial-gradient(ellipse at ${x}% ${y}%, rgba(255, 255, 245, 0.48) 0%, rgba(255, 235, 160, 0.25) 16%, rgba(245, 158, 11, 0.12) 34%, transparent 65%),
    linear-gradient(${angle}deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 245, 180, 0.1) 35%, rgba(245, 158, 11, 0.1) 70%, transparent 100%)
  `;
};

/**
 * Individual 3D Recto-Verso Card with click flip rotation animation
 */
const MszShopCard3D: React.FC<{
  character: MszCharacter;
  isOwned: boolean;
  isEquipped: boolean;
  ownedInstance?: OwnedCardInstance;
  userBalance: number;
  onBuy: (char: MszCharacter) => void;
  onEquip: (char: MszCharacter) => void;
}> = ({
  character,
  isOwned,
  isEquipped,
  ownedInstance,
  userBalance,
  onBuy,
  onEquip
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
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

  /**
   * Physical Inertia simulation loop:
   * Simulates weight, momentum carry-over on release and on movement halt.
   */
  const updatePhysics = useCallback(() => {
    const isInteracting = isInteractingRef.current;
    const isFlippingCurrent = isFlippingRef.current;

    if (isFlippingCurrent) {
      velXRef.current *= 0.8;
      velYRef.current *= 0.8;
    } else if (isInteracting) {
      const springK = 0.18;
      const damping = 0.76;

      const forceX = (targetRotXRef.current - rotXRef.current) * springK;
      const forceY = (targetRotYRef.current - rotYRef.current) * springK;

      velXRef.current = (velXRef.current + forceX) * damping;
      velYRef.current = (velYRef.current + forceY) * damping;

      rotXRef.current += velXRef.current;
      rotYRef.current += velYRef.current;
    } else {
      const restoringK = 0.052;
      const inertiaAirResistance = 0.912;

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

    const normX = Math.max(-1, Math.min(1, currentY / 13));
    const normY = Math.max(-1, Math.min(1, -currentX / 13));
    const glareX = 50 + normX * 36;
    const glareY = 50 + normY * 36;
    const angleDeg = ((Math.atan2(normY, normX) * 180) / Math.PI + 90 + 360) % 360;
    const tiltIntensity = Math.min(1, Math.sqrt(normX * normX + normY * normY));

    const hueShift = Math.round(((currentY * 11 + currentX * 9) + 3600) % 360);
    const sweepOffset = Math.round(50 + normX * 42 + normY * 26);
    const fresnel = Math.min(1, Math.pow(tiltIntensity, 0.85));

    // Subtle golden luster: dialed-back opacity so artwork and card details stay sharp
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

  const handlePointerInteraction = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
    const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

    const newTargetX = -normY * 13;
    const newTargetY = normX * 13;

    const now = performance.now();
    const dt = Math.max(8, Math.min(100, now - (lastMoveTimeRef.current || now)));
    lastMoveTimeRef.current = now;

    const deltaTargetX = newTargetX - prevTargetXRef.current;
    const deltaTargetY = newTargetY - prevTargetYRef.current;

    const frameFactor = 16.67 / dt;
    const impulseX = deltaTargetX * frameFactor * 0.45;
    const impulseY = deltaTargetY * frameFactor * 0.45;

    velXRef.current = Math.max(-9, Math.min(9, velXRef.current * 0.5 + impulseX));
    velYRef.current = Math.max(-9, Math.min(9, velYRef.current * 0.5 + impulseY));

    targetRotXRef.current = newTargetX;
    targetRotYRef.current = newTargetY;
    prevTargetXRef.current = newTargetX;
    prevTargetYRef.current = newTargetY;

    isInteractingRef.current = true;
    setIsHovered(true);
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerInteraction(e.clientX, e.clientY);
  }, [handlePointerInteraction]);

  const handleMouseLeave = useCallback(() => {
    isInteractingRef.current = false;
    setIsHovered(false);
    targetRotXRef.current = 0;
    targetRotYRef.current = 0;
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    handlePointerInteraction(touch.clientX, touch.clientY);
  }, [handlePointerInteraction]);

  const handleTouchEnd = useCallback(() => {
    isInteractingRef.current = false;
    setIsHovered(false);
    targetRotXRef.current = 0;
    targetRotYRef.current = 0;
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  // Mint & Supply
  const currentMint = getCharacterMintCount(character.id);
  const maxSupply = character.maxSupply || 100;
  const isSoldOut = currentMint >= maxSupply;
  const canAfford = userBalance >= character.price;

  const serialText = ownedInstance
    ? `N° ${ownedInstance.editionNumber}/${maxSupply}`
    : isSoldOut
    ? 'ÉPUISÉ (100/100)'
    : `Prochain : N° ${Math.min(maxSupply, currentMint + 1)}/${maxSupply}`;

  // Rarity Styling
  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'Commune':
        return {
          badge: 'border-cyan-400/50 text-cyan-300 bg-cyan-950/60',
          glow: 'rgba(56, 189, 248, 0.35)',
          halo: 'from-cyan-500/20 to-transparent'
        };
      case 'Rare':
        return {
          badge: 'border-blue-400/60 text-blue-300 bg-blue-950/70',
          glow: 'rgba(59, 130, 246, 0.4)',
          halo: 'from-blue-500/20 to-transparent'
        };
      case 'Épique':
        return {
          badge: 'border-purple-400/70 text-purple-300 bg-purple-950/70 shadow-purple-500/20 shadow-md',
          glow: 'rgba(168, 85, 247, 0.45)',
          halo: 'from-purple-500/25 to-transparent'
        };
      case 'Légendaire':
        return {
          badge: 'border-amber-400/80 text-amber-300 bg-amber-950/80 shadow-amber-500/30 shadow-lg font-bold',
          glow: 'rgba(245, 158, 11, 0.55)',
          halo: 'from-amber-500/30 to-transparent'
        };
      case 'Mythique':
        return {
          badge: 'border-rose-400/90 text-rose-300 bg-rose-950/80 shadow-rose-500/40 shadow-xl font-bold',
          glow: 'rgba(244, 63, 94, 0.65)',
          halo: 'from-rose-500/35 to-transparent'
        };
      case 'Souveraine':
        return {
          badge: 'border-yellow-300 text-yellow-100 bg-gradient-to-r from-amber-500/60 to-yellow-400/60 shadow-yellow-400/50 shadow-2xl font-black',
          glow: 'rgba(255, 215, 0, 0.75)',
          halo: 'from-amber-400/40 via-yellow-400/20 to-transparent'
        };
      default:
        return {
          badge: 'border-slate-400 text-slate-300 bg-slate-900',
          glow: 'rgba(148, 163, 184, 0.2)',
          halo: 'from-slate-500/10 to-transparent'
        };
    }
  };

  const rarityConfig = getRarityConfig(character.rarity);

  const handleCardClick = () => {
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

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="group relative select-none cursor-pointer w-full max-w-[300px] h-[450px]"
      style={{ perspective: '1200px', touchAction: 'pan-y' }}
      title="Cliquer pour retourner la carte en 3D (Recto / Verso)"
    >
      {/* 3D Rotating Flippable Stage with Reactive Parallax */}
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`,
          transition: isFlipping
            ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)'
            : 'none',
          filter: (isHovered || Math.abs(rotateX) > 0.4 || Math.abs(rotateY) > 0.4)
            ? `drop-shadow(${-rotateY * 1.4}px ${rotateX * 1.4 + 14}px 22px rgba(0,0,0,0.75))`
            : 'drop-shadow(0px 10px 20px rgba(0,0,0,0.6))'
        }}
      >
        {/* 3D Physical Slab Thickness Facets */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ transformStyle: 'preserve-3d' }}>
          <div
            className="absolute top-3 bottom-3 right-0 w-[8px] rounded-r-sm pointer-events-none"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(90deg) translateZ(4px)',
              background: 'linear-gradient(to right, rgba(15,23,42,0.9), rgba(71,85,105,0.75) 40%, rgba(255,255,255,0.25) 75%, rgba(15,23,42,0.9))'
            }}
          />
          <div
            className="absolute top-3 bottom-3 left-0 w-[8px] rounded-l-sm pointer-events-none"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(-90deg) translateZ(4px)',
              background: 'linear-gradient(to left, rgba(15,23,42,0.9), rgba(71,85,105,0.75) 40%, rgba(255,255,255,0.25) 75%, rgba(15,23,42,0.9))'
            }}
          />
        </div>
        {/* ============================================================== */}
        {/* RECTO (FACE AVANT) */}
        {/* ============================================================== */}
        <div
          className={`absolute inset-0 rounded-2xl p-4 flex flex-col justify-between overflow-hidden border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
            character.colorTheme.gradient
          } ${
            isEquipped
              ? 'ring-2 ring-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.45)]'
              : 'hover:shadow-[0_0_22px_rgba(242,202,80,0.35)]'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            borderColor: character.colorTheme.border
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className={`pointer-events-none absolute inset-0 bg-radial ${rarityConfig.halo} opacity-50`}
          />

          {/* Top Bar: Rarity Badge & Level */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0c1322]/85 border border-white/10 text-white font-bold">
                Niv. {character.level}
              </span>
              <span
                className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${rarityConfig.badge}`}
              >
                {character.rarity}
              </span>
            </div>

            {/* Flip hint pill */}
            <span className="px-2 py-0.5 rounded-lg bg-[#070e1d]/85 border border-white/10 text-[9px] font-mono text-[#ffe082] flex items-center gap-1 group-hover:border-[#f2ca50]/50 transition-colors">
              <span className="material-symbols-outlined text-[11px] animate-spin" style={{ animationDuration: '4s' }}>
                sync
              </span>
              <span>Verso 3D</span>
            </span>
          </div>

          {/* Limited Edition Serial Badge (1/100) */}
          <div className="relative z-10 flex items-center justify-between px-2.5 py-1 rounded-xl bg-[#070e1d]/90 border border-[#f2ca50]/30 shadow-inner mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-pulse" />
              <span className="text-[9px] font-mono text-[#d4c78f] uppercase font-bold tracking-wider">
                {isOwned ? 'Exemplaire Certifié' : 'Tirage Limité 100 Ex.'}
              </span>
            </div>

            <span
              className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                isOwned
                  ? 'bg-amber-400/25 text-[#ffd700] border border-[#f2ca50]/50 shadow-sm'
                  : isSoldOut
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-[#151f33] text-[#38bdf8] border border-[#38bdf8]/30'
              }`}
            >
              {serialText}
            </span>
          </div>

          {/* Dynamic Golden Refraction Glare Layer */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-24 mix-blend-color-dodge transition-opacity duration-150 overflow-hidden"
            style={{
              transform: 'translateZ(28px)',
              backgroundImage: getGoldenRefractionGradient(
                glarePosition.angle,
                glarePosition.sweepOffset
              ),
              opacity: glarePosition.opacity * 0.72
            }}
          />

          {/* Dynamic Golden Specular Hotspot Glare */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-26 mix-blend-screen transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(32px)',
              backgroundImage: getGoldenSpecularGlareGradient(
                glarePosition.x,
                glarePosition.y,
                glarePosition.angle
              ),
              opacity: glarePosition.opacity * 0.55
            }}
          />

          {/* Dynamic Golden Fresnel Perimeter */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-28 transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(34px)',
              boxShadow: `inset 0 0 20px rgba(255, 215, 0, ${glarePosition.fresnel * 0.22})`,
              opacity: glarePosition.opacity * 0.65
            }}
          />

          {/* Character Artwork */}
          <div className="relative my-auto flex flex-col items-center justify-center z-10">
            <div
              className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-50"
              style={{ backgroundColor: character.colorTheme.primary }}
            />

            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl flex items-center justify-center bg-[#070e1d]/90 group-hover:scale-105 transition-transform duration-300">
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.dataset.fallbackApplied) return;
                  target.dataset.fallbackApplied = 'true';
                  target.src = '/assets/aistudio/VOLT.png';
                }}
              />
              {/* Dynamic Subtle Golden Luster Sheen on Artwork */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none mix-blend-color-dodge transition-opacity duration-150 overflow-hidden"
                style={{
                  backgroundImage: getGoldenRefractionGradient(
                    glarePosition.angle + 35,
                    glarePosition.sweepOffset
                  ),
                  opacity: glarePosition.opacity * 0.32
                }}
              />
            </div>

            <span className="mt-2 px-2.5 py-0.5 rounded-full bg-[#070e1d]/90 border border-white/10 text-[9px] font-mono text-[#d4c78f] uppercase tracking-wider">
              {character.element}
            </span>
          </div>

          {/* Bottom Footer: Name & Clear Price in MSZ Coins */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="font-serif text-base sm:text-lg font-black tracking-wide text-white drop-shadow-md">
                {character.name}
              </h4>
              <span className="text-[10px] text-[#8391ac] font-mono truncate max-w-[120px]">
                {character.categoryName}
              </span>
            </div>

            {/* Price Badge / Equip Status */}
            <div>
              {isEquipped ? (
                <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-mono font-black flex items-center gap-1 shadow-md shadow-amber-500/30">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Équipé
                </span>
              ) : isOwned ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEquip(character);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#1e293b] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Équiper
                </button>
              ) : isSoldOut ? (
                <span className="px-2 py-1 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[10px] font-mono font-bold">
                  Bourse P2P
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy(character);
                  }}
                  disabled={!canAfford}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000]'
                      : 'bg-[#1e293b]/90 border border-white/10 text-[#8391ac] opacity-75'
                  }`}
                  title={canAfford ? 'Acheter avec vos MSZ Coins' : 'MSZ Coins insuffisants'}
                >
                  <span className="material-symbols-outlined text-xs">monetization_on</span>
                  <span>{character.price} MSZ</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VERSO (FACE ARRIÈRE - ROTATION 180 DEG) */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden border backdrop-blur-xl shadow-2xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#070d1a]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: character.colorTheme.border
          }}
        >
          {/* Dynamic Golden Refraction Glare on Verso */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-30 mix-blend-screen transition-opacity duration-200 overflow-hidden"
            style={{
              transform: 'translateZ(30px)',
              background: `
                radial-gradient(circle at ${100 - glarePosition.x}% ${glarePosition.y}%, rgba(255, 250, 220, 0.32) 0%, rgba(255, 215, 0, 0.12) 25%, transparent 65%),
                linear-gradient(${glarePosition.angle + 180}deg, transparent 20%, rgba(245, 158, 11, 0.1) 50%, transparent 80%)
              `,
              opacity: glarePosition.opacity * 0.48
            }}
          />
          {/* Top Bar: Identity & Level */}
          <div className="flex items-start justify-between border-b border-white/10 pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[#f2ca50] font-mono">
                  FICHE D'IDENTITÉ 3D
                </span>
                <span className="text-white/30">•</span>
                <span className="text-[10px] font-mono text-[#38bdf8] font-bold">
                  NIVEAU {character.level}
                </span>
              </div>
              <h3 className="font-serif text-lg font-black text-white">
                {character.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="p-1.5 rounded-lg bg-[#19243d] hover:bg-[#25355a] border border-white/20 text-[#ffe082] text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Revenir au Recto"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
            </button>
          </div>

          {/* Certificate & Serial Code Box */}
          <div className="p-2.5 rounded-xl bg-[#070e1d]/90 border border-[#f2ca50]/40 flex flex-col gap-1 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#d4c78f] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#f2ca50]">verified_user</span>
                Matricule :
              </span>
              <span className="text-[#ffd700] font-black">
                {ownedInstance?.serialCode || `${character.serialPrefix}-#${String(currentMint).padStart(3, '0')}/${maxSupply}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#8391ac]">
              <span>Tirage Certifié :</span>
              <span className="text-white font-bold font-mono">
                {ownedInstance ? `N° ${ownedInstance.editionNumber}/${maxSupply}` : `${currentMint} / ${maxSupply} frappés`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#8391ac]">
              <span>Prix de la carte :</span>
              <span className="text-[#ffd700] font-black font-mono">{character.price} MSZ Coins</span>
            </div>
          </div>

          {/* Lore Quote & Presentation Description */}
          <div className="my-auto flex flex-col gap-2 py-0.5">
            <blockquote className="font-serif italic text-[11px] text-[#ffe082] bg-[#070e1d]/70 p-2 rounded-xl border border-white/5 leading-relaxed">
              {character.loreQuote}
            </blockquote>

            <p className="text-[10px] text-[#cbd5e1] leading-relaxed line-clamp-2">
              {character.description}
            </p>

            {/* Stat Gauges */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Élocution</span>
                  <span className="text-cyan-400 font-bold">{character.stats.elocution}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${character.stats.elocution}%` }} />
                </div>
              </div>

              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Mémoire</span>
                  <span className="text-purple-400 font-bold">{character.stats.memoire}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${character.stats.memoire}%` }} />
                </div>
              </div>

              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Vitesse</span>
                  <span className="text-amber-400 font-bold">{character.stats.vitesse}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${character.stats.vitesse}%` }} />
                </div>
              </div>

              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Maîtrise</span>
                  <span className="text-emerald-400 font-bold">{character.stats.maitrise}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${character.stats.maitrise}%` }} />
                </div>
              </div>
            </div>

            {/* Passive Bonus Pill */}
            <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center gap-1.5 text-[9px] text-[#ffe082]">
              <span className="material-symbols-outlined text-xs text-[#f2ca50] shrink-0">stars</span>
              <span className="leading-tight truncate">
                <strong>Bonus :</strong> {character.passiveBonus}
              </span>
            </div>
          </div>

          {/* Verso Actions Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-[#8391ac]">
              Série {character.categoryId}/10
            </span>

            <div className="flex items-center gap-1.5">
              {isOwned ? (
                !isEquipped ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEquip(character);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Équiper
                  </button>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-300">Actif</span>
                )
              ) : isSoldOut ? (
                <span className="text-[10px] font-mono text-rose-400 font-bold">Épuisé</span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy(character);
                  }}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000]'
                      : 'bg-[#1e293b] text-[#8391ac] border border-white/10'
                  }`}
                >
                  <span>Acheter ({character.price} MSZ)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MszShop: React.FC<MszShopProps> = ({
  userLevel = 1,
  onOpenFullShop,
  onProfileUpdated
}) => {
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [balance, setBalance] = useState<number>(getMszCoinsBalance());
  const [ownedIds, setOwnedIds] = useState<string[]>(getOwnedCharacterIds());
  const [ownedInstances, setOwnedInstances] = useState<OwnedCardInstance[]>(getOwnedCardInstances());
  const [equippedId, setEquippedId] = useState<string>(getEquippedCharacterId());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { dailyLimit, state: dailyState } = useMemo(() => {
    return getDailyMszCoinsState(userLevel);
  }, [userLevel, balance]);

  const refreshState = useCallback(() => {
    setBalance(getMszCoinsBalance());
    setOwnedIds(getOwnedCharacterIds());
    setOwnedInstances(getOwnedCardInstances());
    setEquippedId(getEquippedCharacterId());
  }, []);

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    window.addEventListener('msz-coins-updated', handleUpdate);
    window.addEventListener('msz-inventory-updated', handleUpdate);
    window.addEventListener('msz-equipped-updated', handleUpdate);

    return () => {
      window.removeEventListener('msz-coins-updated', handleUpdate);
      window.removeEventListener('msz-inventory-updated', handleUpdate);
      window.removeEventListener('msz-equipped-updated', handleUpdate);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [refreshState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuy = (char: MszCharacter) => {
    const res = buyCharacterFromShop(char.id);
    if (res.success) {
      refreshState();
      onProfileUpdated?.();
      showToast(res.message);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f2ca50', '#38bdf8', '#ffd700']
      });
    } else {
      showToast(res.message);
    }
  };

  const handleEquip = (char: MszCharacter) => {
    const ok = equipCharacter(char.id);
    if (ok) {
      refreshState();
      onProfileUpdated?.();
      showToast(`« ${char.name} » est maintenant équipé en icône de profil !`);
    }
  };

  // Get current category data
  const currentCategory = selectedCatId === 'all'
    ? {
        id: 0,
        name: 'Toutes les Séries',
        tag: 'ALL-SERIES',
        startingPrice: 50,
        description: 'Collection intégrale des 9 Personnages Officiels sans aucun doublon, classés de Classique (Niveau 5) jusqu’à Souveraine (Niveau 100).',
        icon: 'stars',
        accentColor: '#f2ca50',
        rankBadge: 'Collection Complète'
      }
    : SHOP_CATEGORIES.find((c) => c.id === selectedCatId) || SHOP_CATEGORIES[0];

  // Characters belonging to the selected category (sorted from lowest to highest level)
  const categoryCharacters = useMemo(() => {
    if (selectedCatId === 'all') {
      return MSZ_CHARACTERS;
    }
    return MSZ_CHARACTERS.filter((c) => c.categoryId === selectedCatId);
  }, [selectedCatId]);

  return (
    <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#070e1d] border-2 border-[#f2ca50]/50 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: currentCategory.accentColor }}
      />

      {/* Header: Title, MSZ Coins HUD & Daily Limit Gauge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 border-b border-[#232a3a] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#19243d] border-2 border-[#f2ca50]/60 flex items-center justify-center text-[#ffd700] shadow-lg shadow-[#f2ca50]/20 shrink-0">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              storefront
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50] bg-[#f2ca50]/15 px-2.5 py-0.5 rounded-full border border-[#f2ca50]/30">
                COLLECTION OFFICIELLE MSZ
              </span>
              <span className="text-[10px] text-[#38bdf8] font-mono">9 Personnages Authentiques • Zéro Doublon</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-black text-white mt-0.5">
              Boutique Officielle des Cartes & Icônes MSZ
            </h3>
            <p className="text-xs text-[#cbd5e1] mt-0.5">
              Chaque personnage possède sa propre identité visuelle certifiée et son numéro de série unique (1/100). Classés de Classique (Niveau 5) jusqu’à Souveraine (Niveau 100).
            </p>
          </div>
        </div>

        {/* Balance & Daily Cap HUD */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-end bg-[#070e1d] border border-[#f2ca50]/50 px-4 py-2 rounded-2xl shadow-inner min-w-[155px]">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-lg text-[#f2ca50]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                monetization_on
              </span>
              <span className="font-mono text-xl font-black text-[#ffd700]">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-[#f2ca50] font-bold">MSZ</span>
            </div>

            {/* Daily limit gauge */}
            <div className="w-full flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#8391ac]">
                <span>Gains du jour :</span>
                <span className="text-[#38bdf8] font-bold">
                  {dailyState.coinsEarnedToday}/{dailyLimit} MSZ
                </span>
              </div>
              <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#38bdf8] to-[#f2ca50] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (dailyState.coinsEarnedToday / Math.max(1, dailyLimit)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          {onOpenFullShop && (
            <button
              type="button"
              onClick={onOpenFullShop}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000] font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#f2ca50]/20 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Ouvrir la boutique en plein écran avec la bourse P2P"
            >
              <span className="material-symbols-outlined text-base">fullscreen</span>
              <span className="hidden sm:inline">Plein Écran</span>
            </button>
          )}
        </div>
      </div>

      {/* Progressive Categories Bar with Icon, Name, and Starting Price */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4c78f] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">category</span>
            Catégories Progressives (Classique à Souveraine) :
          </span>
          <span className="text-[10px] font-mono text-[#8391ac]">
            {categoryCharacters.length} personnages affichés &bull; Tirages 1/100
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* All Series Button */}
          <button
            type="button"
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-[#1f2c48] text-[#ffe082] border-2 border-[#f2ca50] shadow-md shadow-[#f2ca50]/20'
                : 'bg-[#0a101f] text-[#8391ac] border border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">
              stars
            </span>
            <span>Toutes les Séries</span>
            <span className="text-[10px] opacity-75 font-normal">({MSZ_CHARACTERS.length} Cartes)</span>
          </button>

          {SHOP_CATEGORIES.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1f2c48] text-[#ffe082] border-2 border-[#f2ca50] shadow-md shadow-[#f2ca50]/20'
                    : 'bg-[#0a101f] text-[#8391ac] border border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm" style={{ color: cat.accentColor }}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({cat.startingPrice}+ MSZ)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Description Banner */}
      <div className="p-3.5 rounded-2xl bg-[#0a101f]/90 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg" style={{ color: currentCategory.accentColor }}>
            {currentCategory.icon}
          </span>
          <span className="text-[#dce2f8]">
            <strong className="text-white">{currentCategory.name}</strong> — {currentCategory.description}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 self-end sm:self-auto">
          <span className="px-2 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#ffd700] border border-[#f2ca50]/30 font-bold">
            Dès {currentCategory.startingPrice} MSZ Coins
          </span>
          <span className="text-[#8391ac] hidden md:inline">Rotation 3D au Clic</span>
        </div>
      </div>

      {/* 3D Recto-Verso Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center relative z-10 py-1">
        {categoryCharacters.map((character) => {
          const instance = ownedInstances.find((inst) => inst.characterId === character.id);
          return (
            <MszShopCard3D
              key={character.id}
              character={character}
              isOwned={ownedIds.includes(character.id)}
              isEquipped={equippedId === character.id}
              ownedInstance={instance}
              userBalance={balance}
              onBuy={handleBuy}
              onEquip={handleEquip}
            />
          );
        })}
      </div>

      {/* Bottom Info Bar: How to earn coins & P2P link */}
      <div className="pt-3 border-t border-[#232a3a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8391ac] font-mono relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#f2ca50]">Gains MSZ Coins :</span>
          <span>Speed Match (+2 MSZ)</span>
          <span>&bull;</span>
          <span>Cursus (+1 MSZ)</span>
          <span>&bull;</span>
          <span className="text-cyan-300">Plafond : {dailyLimit} MSZ/jour (Niveau {userLevel})</span>
        </div>

        {onOpenFullShop && (
          <button
            type="button"
            onClick={onOpenFullShop}
            className="text-[#f2ca50] hover:text-[#ffe088] underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Accéder à la Bourse d'Échanges P2P & Vente</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#152342]/95 border border-[#f2ca50]/70 text-[#ffe082] px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            <span className="material-symbols-outlined text-base text-[#f2ca50]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
};
