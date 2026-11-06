import React, { useState, useRef, useCallback } from 'react';
import type { MszCharacter } from '../data/mszShopData';
import {
  type OwnedCardInstance,
  getCharacterMintCount,
  formatEditionNumber
} from '../utils/mszCoinsManager';

interface MszCard3DProps {
  character: MszCharacter;
  isOwned?: boolean;
  isEquipped?: boolean;
  userCoins?: number;
  ownedInstance?: OwnedCardInstance;
  onBuy?: (character: MszCharacter) => void;
  onEquip?: (character: MszCharacter) => void;
  onSell?: (character: MszCharacter) => void;
  onInspect?: (character: MszCharacter) => void;
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
  compact = false
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0
  });

  const cardRef = useRef<HTMLDivElement>(null);

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

  // 3D Parallax Tilt Handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 12; // Max 12deg tilt
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.45
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const handleFlipCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  const canAfford = userCoins >= character.price;

  // Rarity styling helpers
  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Commune':
        return 'border-cyan-400/40 text-cyan-300 bg-cyan-950/40';
      case 'Rare':
        return 'border-blue-400/50 text-blue-300 bg-blue-950/50';
      case 'Épique':
        return 'border-purple-400/60 text-purple-300 bg-purple-950/50';
      case 'Légendaire':
        return 'border-amber-400/70 text-amber-300 bg-amber-950/60 shadow-amber-500/20 shadow-md';
      case 'Mythique':
        return 'border-rose-400/80 text-rose-300 bg-rose-950/70 shadow-rose-500/30 shadow-lg';
      case 'Souveraine':
        return 'border-yellow-300 text-yellow-100 bg-gradient-to-r from-amber-600/40 to-yellow-500/40 shadow-yellow-400/40 shadow-xl font-black';
      default:
        return 'border-slate-400 text-slate-300 bg-slate-900';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative select-none cursor-pointer transition-transform duration-200 ease-out ${
        compact ? 'w-full max-w-[270px] h-[410px]' : 'w-full max-w-[310px] h-[470px]'
      }`}
      style={{
        perspective: '1200px'
      }}
      onClick={() => onInspect?.(character)}
    >
      {/* 3D Rotating Wrapper */}
      <div
        className="w-full h-full relative transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`
        }}
      >
        {/* ============================================================== */}
        {/* RECTO (FRONT FACE) */}
        {/* ============================================================== */}
        <div
          className={`absolute inset-0 rounded-2xl p-4 flex flex-col justify-between overflow-hidden border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
            character.colorTheme.gradient
          } ${
            isEquipped
              ? 'ring-2 ring-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.4)]'
              : 'hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            borderColor: character.colorTheme.border
          }}
        >
          {/* Holographic foil glare reflection */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-20 mix-blend-color-dodge transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 215, 0, 0.3) 25%, transparent 60%)`,
              opacity: glarePosition.opacity
            }}
          />

          {/* Prismatic metallic border accent */}
          <div className="absolute inset-0.5 rounded-2xl border border-white/10 pointer-events-none z-10" />

          {/* Top Bar: Level, Rarity Badge & 3D Flip Action */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0c1322]/80 border border-white/10 text-[#dce2f8] font-bold">
                Niv. {character.level}
              </span>
              <span
                className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${getRarityBadge(
                  character.rarity
                )}`}
              >
                {character.rarity}
              </span>
            </div>

            {/* Quick 3D Flip Action */}
            <button
              type="button"
              onClick={handleFlipCard}
              className="px-2 py-1 rounded-lg bg-[#0c1322]/80 hover:bg-[#1f2c48] border border-white/20 text-[#ffe082] text-[10px] font-mono flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer z-20"
              title="Retourner la carte en 3D (Verso : Présentation, Niveau & Certificat)"
            >
              <span className="material-symbols-outlined text-xs">rotate_right</span>
              <span className="hidden sm:inline">Verso 3D</span>
            </button>
          </div>

          {/* Limited Edition Serial Badge (1/100) Banner */}
          <div className="relative z-10 flex items-center justify-between mt-1 px-2.5 py-1 rounded-xl bg-[#070e1d]/90 border border-[#f2ca50]/30 shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-pulse" />
              <span className="text-[9px] font-mono text-[#d4c78f] uppercase font-bold tracking-wider">
                {isOwned ? 'Exemplaire Certifié' : 'Tirage Limité 100 Ex.'}
              </span>
            </div>

            <span
              className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                isOwned
                  ? 'bg-gradient-to-r from-amber-400/25 to-yellow-300/25 text-[#ffd700] border border-[#f2ca50]/50 shadow-sm'
                  : isSoldOut
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-[#151f33] text-[#38bdf8] border border-[#38bdf8]/30'
              }`}
            >
              {isOwned ? `N° ${simpleSerial}` : isSoldOut ? 'ÉPUISÉ (100/100)' : `Prochain : N° ${simpleSerial}`}
            </span>
          </div>

          {/* Center: Character Artwork (Using User's real uploaded images) */}
          <div className="relative my-auto flex flex-col items-center justify-center z-10">
            {/* Glowing aura ring behind the helmet */}
            <div
              className="absolute w-40 h-40 sm:w-44 sm:h-44 rounded-full blur-2xl pointer-events-none opacity-60"
              style={{ backgroundColor: character.colorTheme.primary }}
            />

            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl flex items-center justify-center bg-[#070e1d]/85 group-hover:scale-105 transition-transform duration-300">
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/public/')) {
                    target.src = `/public${character.image}`;
                  } else {
                    target.src = '/assets/aistudio/VOLT.png';
                  }
                }}
              />

              {/* Special holographic sheen line */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Element Tag */}
            <span className="mt-2 px-2.5 py-0.5 rounded-full bg-[#0a101f]/90 border border-white/10 text-[9px] font-mono text-[#d4c78f] uppercase tracking-wider">
              {character.element}
            </span>
          </div>

          {/* Bottom Card Footer: Character Name & Price/Equip status */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="font-serif text-lg font-black tracking-wide text-white drop-shadow-md">
                {character.name}
              </h4>
              <span className="text-[10px] text-[#8391ac] font-mono truncate max-w-[130px]">
                {character.categoryName}
              </span>
            </div>

            {/* Status / Purchase Price badge */}
            <div>
              {isEquipped ? (
                <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-amber-500/30">
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
                  className="px-2.5 py-1 rounded-xl bg-[#1e293b] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000]'
                      : 'bg-[#1e293b]/80 border border-white/10 text-[#8391ac] opacity-75'
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
        {/* VERSO (BACK FACE) */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden border backdrop-blur-xl shadow-2xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#070d1a]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: character.colorTheme.border
          }}
        >
          {/* Top Bar: Title, Character Level & Flip Back Button */}
          <div className="flex items-start justify-between border-b border-white/10 pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[#f2ca50] font-mono">
                  FICHE D'IDENTITÉ
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
              onClick={handleFlipCard}
              className="p-1.5 rounded-lg bg-[#19243d] hover:bg-[#25355a] border border-white/20 text-[#ffe082] text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Revenir au Recto 3D"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
            </button>
          </div>

          {/* Certificate of Authenticity & Unique Serial Code Box */}
          <div className="p-2.5 rounded-xl bg-[#070e1d]/90 border border-[#f2ca50]/40 flex flex-col gap-1 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#d4c78f] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#f2ca50]">verified_user</span>
                Matricule Unique :
              </span>
              <span className="text-[#ffd700] font-black">{serialCode}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#8391ac]">
              <span>Tirage Mondial :</span>
              <span className="text-white font-bold">
                {isOwned ? `Exemplaire N° ${simpleSerial} (Série ${serialDisplay})` : `${currentMint} / ${maxSupply} frappés (${remainingInStock} restants)`}
              </span>
            </div>
          </div>

          {/* Lore Quote & Presentation Description */}
          <div className="my-auto flex flex-col gap-2 py-0.5">
            <blockquote className="font-serif italic text-[11px] text-[#ffe082] bg-[#070e1d]/70 p-2 rounded-xl border border-white/5 leading-relaxed">
              {character.loreQuote}
            </blockquote>

            <p className="text-[10px] text-[#cbd5e1] leading-relaxed line-clamp-3">
              {character.description}
            </p>

            {/* Radar / Stat Gauges */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {/* Élocution */}
              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Élocution</span>
                  <span className="text-cyan-400 font-bold">{character.stats.elocution}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${character.stats.elocution}%` }}
                  />
                </div>
              </div>

              {/* Mémoire */}
              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Mémoire</span>
                  <span className="text-purple-400 font-bold">{character.stats.memoire}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${character.stats.memoire}%` }}
                  />
                </div>
              </div>

              {/* Vitesse */}
              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Vitesse</span>
                  <span className="text-amber-400 font-bold">{character.stats.vitesse}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${character.stats.vitesse}%` }}
                  />
                </div>
              </div>

              {/* Maîtrise */}
              <div className="p-1 rounded-lg bg-[#070e1d] border border-white/5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#8391ac]">Maîtrise</span>
                  <span className="text-emerald-400 font-bold">{character.stats.maitrise}</span>
                </div>
                <div className="h-1 bg-[#1a233a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${character.stats.maitrise}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Passive Bonus Pill */}
            <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center gap-1.5 text-[9px] text-[#ffe082]">
              <span className="material-symbols-outlined text-xs text-[#f2ca50] shrink-0">
                stars
              </span>
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
                <>
                  {!isEquipped && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEquip?.(character);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
