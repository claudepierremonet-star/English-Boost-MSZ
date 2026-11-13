import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  SHOP_CATEGORIES,
  MSZ_CHARACTERS,
  RARITY_CONFIGS,
  RARITY_ORDER,
  type CharacterRarity,
  type MszCharacter,
  type MarketListing,
  type MszTransaction
} from '../data/mszShopData';
import {
  getMszCoinsBalance,
  getDailyMszCoinsState,
  getOwnedCharacterIds,
  getOwnedCardInstances,
  getEquippedCharacterId,
  buyCharacterFromShop,
  equipCharacter,
  getMarketplaceListings,
  buyMarketListing,
  sellCharacterOnMarketplace,
  getTransactionHistory,
  getCharacterMintCount,
  type OwnedCardInstance
} from '../utils/mszCoinsManager';
import { MszCard3D } from './MszCard3D';
import { speakText, stopSpeech } from '../services/speechService';
import { getLocalUserProfile } from '../firebase/client';

interface MszShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel?: number; // e.g. 1 to 100
  completedLessons?: number;
  onProfileUpdated?: () => void;
}

export const MszShopModal: React.FC<MszShopModalProps> = ({
  isOpen,
  onClose,
  userLevel = 14,
  completedLessons,
  onProfileUpdated
}) => {
  const [completedLessonsCount, setCompletedLessonsCount] = useState<number>(() => {
    if (completedLessons !== undefined) return completedLessons;
    try {
      const p = getLocalUserProfile();
      return p?.stats?.completedModules ?? 14;
    } catch {
      return 14;
    }
  });

  const [isSparkling, setIsSparkling] = useState<boolean>(false);
  const [lastMilestoneCelebrated, setLastMilestoneCelebrated] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('eb_msz_last_sparkle_milestone') || '0', 10);
    } catch {
      return 0;
    }
  });

  const triggerSparkle = useCallback(() => {
    setIsSparkling(true);
    try {
      confetti({
        particleCount: 18,
        spread: 60,
        origin: { y: 0.12, x: 0.32 },
        colors: ['#ffd700', '#f2ca50', '#38bdf8', '#ffffff'],
        ticks: 100,
        gravity: 0.8,
        scalar: 0.75
      });
    } catch {}
    const timer = setTimeout(() => {
      setIsSparkling(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && completedLessonsCount > 0) {
      const milestone = Math.floor(completedLessonsCount / 25) * 25;
      if (milestone >= 25 && milestone !== lastMilestoneCelebrated) {
        setLastMilestoneCelebrated(milestone);
        try {
          localStorage.setItem('eb_msz_last_sparkle_milestone', milestone.toString());
        } catch {}
        triggerSparkle();
      }
    }
  }, [isOpen, completedLessonsCount, lastMilestoneCelebrated, triggerSparkle]);

  const [activeTab, setActiveTab] = useState<'shop' | 'inventory' | 'marketplace' | 'crypto'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<'all' | CharacterRarity>('all');

  // Dynamic economy states
  const [balance, setBalance] = useState<number>(getMszCoinsBalance());
  const [ownedIds, setOwnedIds] = useState<string[]>(getOwnedCharacterIds());
  const [ownedInstances, setOwnedInstances] = useState<OwnedCardInstance[]>(getOwnedCardInstances());
  const [equippedId, setEquippedId] = useState<string>(getEquippedCharacterId());
  const [listings, setListings] = useState<MarketListing[]>(getMarketplaceListings());
  const [transactions, setTransactions] = useState<MszTransaction[]>(getTransactionHistory());

  const [isTreasuryOpen, setIsTreasuryOpen] = useState<boolean>(false);

  const equippedCharacter = useMemo(() => {
    return MSZ_CHARACTERS.find((c) => c.id === equippedId) || null;
  }, [equippedId]);

  // Modal / Toast states & Zoom Inspector
  const [inspectedCharacter, setInspectedCharacter] = useState<MszCharacter | null>(null);
  const [inspectMode, setInspectMode] = useState<'zoomLoupe' | 'card3d'>('zoomLoupe');
  const [zoomScale, setZoomScale] = useState<number>(1.85);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 50, y: 40 });
  const [sellModalChar, setSellModalChar] = useState<MszCharacter | null>(null);
  const [sellPriceInput, setSellPriceInput] = useState<number>(75);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenInspect = useCallback((char: MszCharacter, startZoomed = true) => {
    setInspectedCharacter(char);
    setInspectMode(startZoomed ? 'zoomLoupe' : 'card3d');
    setZoomScale(1.85);
    setPanOffset({ x: 50, y: 40 });
  }, []);

  // Daily budget info
  const { dailyLimit, state: dailyState } = useMemo(() => {
    return getDailyMszCoinsState(userLevel);
  }, [userLevel, balance]);

  const refreshState = useCallback(() => {
    setBalance(getMszCoinsBalance());
    setOwnedIds(getOwnedCharacterIds());
    setOwnedInstances(getOwnedCardInstances());
    setEquippedId(getEquippedCharacterId());
    setListings(getMarketplaceListings());
    setTransactions(getTransactionHistory());
  }, []);

  useEffect(() => {
    if (completedLessons !== undefined) {
      setCompletedLessonsCount(completedLessons);
    } else if (isOpen) {
      try {
        const p = getLocalUserProfile();
        if (p?.stats?.completedModules !== undefined) {
          setCompletedLessonsCount(p.stats.completedModules);
        }
      } catch {}
    }
    if (isOpen) {
      refreshState();
    }
  }, [isOpen, completedLessons, refreshState]);

  // Listen to custom economy events
  useEffect(() => {
    const handleCoinsUpdate = () => refreshState();
    window.addEventListener('msz-coins-updated', handleCoinsUpdate);
    window.addEventListener('msz-inventory-updated', handleCoinsUpdate);
    window.addEventListener('msz-equipped-updated', handleCoinsUpdate);
    window.addEventListener('msz-market-updated', handleCoinsUpdate);

    return () => {
      window.removeEventListener('msz-coins-updated', handleCoinsUpdate);
      window.removeEventListener('msz-inventory-updated', handleCoinsUpdate);
      window.removeEventListener('msz-equipped-updated', handleCoinsUpdate);
      window.removeEventListener('msz-market-updated', handleCoinsUpdate);
    };
  }, [refreshState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Filter characters in shop
  const filteredShopCharacters = useMemo(() => {
    return MSZ_CHARACTERS.filter((char) => {
      if (selectedCategory !== 'all' && char.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedRarity !== 'all' && char.rarity !== selectedRarity) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = char.name.toLowerCase().includes(q);
        const matchCat = char.categoryName.toLowerCase().includes(q);
        const matchElem = char.element.toLowerCase().includes(q);
        return matchName || matchCat || matchElem;
      }
      return true;
    });
  }, [selectedCategory, selectedRarity, searchQuery]);

  // Card count for each rarity tier
  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MSZ_CHARACTERS.length };
    RARITY_ORDER.forEach((r) => {
      counts[r] = MSZ_CHARACTERS.filter((c) => c.rarity === r).length;
    });
    return counts;
  }, []);

  // Group filtered characters by rarity tier for structured display
  const charactersByRarity = useMemo(() => {
    const map = new Map<CharacterRarity, MszCharacter[]>();
    RARITY_ORDER.forEach((rarity) => {
      const chars = filteredShopCharacters.filter((c) => c.rarity === rarity);
      if (chars.length > 0) {
        map.set(rarity, chars);
      }
    });
    return map;
  }, [filteredShopCharacters]);

  // Owned characters in inventory
  const ownedCharacters = useMemo(() => {
    return MSZ_CHARACTERS.filter((char) => ownedIds.includes(char.id));
  }, [ownedIds]);

  // Helper to get owned instance for a character
  const getInstanceForChar = (charId: string) => {
    return ownedInstances.find((inst) => inst.characterId === charId);
  };

  // Buy handler
  const handleBuyCharacter = (char: MszCharacter) => {
    const res = buyCharacterFromShop(char.id);
    if (res.success) {
      refreshState();
      onProfileUpdated?.();
      showToast(res.message);

      // Trigger festive victory confetti
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#f2ca50', '#38bdf8', '#ffd700', '#ec4899']
      });
    } else {
      showToast(res.message);
    }
  };

  // Equip handler
  const handleEquipCharacter = (char: MszCharacter) => {
    const ok = equipCharacter(char.id);
    if (ok) {
      refreshState();
      onProfileUpdated?.();
      showToast(`« ${char.name} » est maintenant votre icône de profil active !`);
    }
  };

  // Marketplace Buy
  const handleBuyListing = (listing: MarketListing) => {
    const res = buyMarketListing(listing.id);
    if (res.success) {
      refreshState();
      onProfileUpdated?.();
      showToast(res.message);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#34d399', '#f2ca50', '#38bdf8']
      });
    } else {
      showToast(res.message);
    }
  };

  // Open Sell Modal
  const handleOpenSellModal = (char: MszCharacter) => {
    setSellModalChar(char);
    setSellPriceInput(Math.max(20, Math.floor(char.price * 0.9)));
  };

  // Confirm Sell
  const handleConfirmSell = () => {
    if (!sellModalChar) return;
    const res = sellCharacterOnMarketplace(sellModalChar.id, sellPriceInput);
    if (res.success) {
      refreshState();
      onProfileUpdated?.();
      showToast(res.message);
      setSellModalChar(null);
    } else {
      showToast(res.message);
    }
  };

  // Play audio quote
  const handlePlayQuoteAudio = (text: string) => {
    stopSpeech();
    speakText(text, 'en-GB', 'msz-char-quote');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070d1a] flex flex-col animate-fadeIn select-none">
      {/* Header with iPhone safe area clearance & 24K gold illumination filament */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 bg-[#060b16]/95 backdrop-blur-2xl border-b border-[#232a3a] flex items-center justify-between relative shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          minHeight: 'calc(max(env(safe-area-inset-top, 0px), 16px) + 68px)'
        }}
      >
        {/* Top 24K Gold Illumination Filament */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffd700] via-50% to-transparent opacity-85 shadow-[0_0_14px_rgba(255,215,0,0.6)] pointer-events-none" />

        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

        {/* Left Section: Back Control + MSZ Monogram Seal + Gallery Title */}
        <div className="flex items-center gap-3.5 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="group relative px-3 py-2 rounded-xl bg-gradient-to-b from-[#182235] to-[#0c1322] border border-[#2b3952] hover:border-[#ffd700]/60 text-[#b5c2d9] hover:text-[#ffd700] transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.4)] cursor-pointer active:scale-95"
            aria-label="Fermer la galerie"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform text-[#d4af37]">arrow_back_ios_new</span>
            <span className="hidden sm:inline text-xs font-mono uppercase tracking-wider font-semibold">Retour</span>
          </button>

          {/* Sophisticated Yellow Square Button (MSZ Coins Gold) */}
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-[#ffd700] via-[#f2ca50] to-[#e6b800] border-2 border-[#fff2a8] shadow-[0_0_16px_rgba(242,202,80,0.5),inset_0_1px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_0_24px_rgba(242,202,80,0.75)] hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center p-0.5 cursor-pointer shrink-0"
            title={`Ma Collection MSZ (${ownedIds.length}/${MSZ_CHARACTERS.length} cartes)`}
            aria-label="Accéder à ma collection MSZ"
          >
            <span className="font-serif font-black text-[11px] sm:text-xs tracking-wider text-[#0c1322] leading-none uppercase drop-shadow-sm">
              MSZ
            </span>
            <span className="font-mono font-black text-[8px] sm:text-[9px] text-[#2c1b00] leading-none mt-0.5 bg-[#0c1322]/15 px-1 py-0.5 rounded">
              {ownedIds.length}/{MSZ_CHARACTERS.length}
            </span>
          </button>

          {/* Gallery Button with Circular SVG Progress Ring */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab('shop')}
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#141d2d] to-[#0a1120] border border-[#2b3952] hover:border-[#ffd700]/60 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(255,215,0,0.2)] transition-all cursor-pointer active:scale-95"
            title={`Boutique & Galerie • Objectif : ${completedLessonsCount}/200 leçons terminées (${Math.round((completedLessonsCount / 200) * 100)}%)`}
            aria-label="Boutique et Galerie"
          >
            {/* SVG Circular Progress Ring around Storefront Icon with Milestone Sparkle Effect */}
            <div
              className="relative w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                triggerSparkle();
              }}
              title={`Cercle de progression : ${completedLessonsCount}/200 leçons terminées (Palier de 25 leçons)`}
            >
              {/* Sparkle Particles Aura when milestone reached */}
              {isSparkling && (
                <div className="absolute -inset-3 pointer-events-none z-20">
                  <div className="absolute inset-1.5 rounded-full border border-[#ffd700]/70 animate-ping opacity-60" />
                  {/* Floating Twinkling Sparkles */}
                  <span className="absolute -top-1 -right-1 text-[#ffd700] text-xs font-bold animate-sparkle" style={{ animationDelay: '0ms' }}>
                    ✦
                  </span>
                  <span className="absolute -top-1.5 left-0.5 text-[#38bdf8] text-[10px] font-bold animate-sparkle" style={{ animationDelay: '200ms' }}>
                    ✧
                  </span>
                  <span className="absolute top-2.5 -right-2 text-[#ffffff] text-xs font-bold animate-sparkle" style={{ animationDelay: '400ms' }}>
                    ✦
                  </span>
                  <span className="absolute -bottom-1 -right-0.5 text-[#f2ca50] text-[11px] font-bold animate-sparkle" style={{ animationDelay: '150ms' }}>
                    ✧
                  </span>
                  <span className="absolute -bottom-2 left-2 text-[#ffd700] text-xs font-bold animate-sparkle" style={{ animationDelay: '500ms' }}>
                    ✦
                  </span>
                  <span className="absolute -bottom-0.5 -left-1.5 text-[#38bdf8] text-[10px] font-bold animate-sparkle" style={{ animationDelay: '300ms' }}>
                    ✧
                  </span>
                  <span className="absolute top-2 -left-2 text-[#ffd700] text-xs font-bold animate-sparkle" style={{ animationDelay: '100ms' }}>
                    ✦
                  </span>
                  <span className="absolute -top-2 left-2.5 text-[#ffffff] text-[9px] font-bold animate-sparkle" style={{ animationDelay: '450ms' }}>
                    ✧
                  </span>
                </div>
              )}

              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 32 32">
                <defs>
                  <linearGradient id="lessonCircleGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                {/* Background track circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="#1e293b"
                  strokeWidth="2.4"
                  fill="none"
                />
                {/* Dynamic progress circle filled towards 200 lessons */}
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="url(#lessonCircleGold)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={81.68}
                  strokeDashoffset={81.68 * (1 - Math.min(1, Math.max(0, completedLessonsCount / 200)))}
                  className="transition-all duration-700 ease-out"
                  style={{
                    filter: isSparkling
                      ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.9))'
                      : 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))'
                  }}
                />
              </svg>

              {/* Centered Storefront Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className={`material-symbols-outlined text-sm text-[#ffd700] transition-transform ${
                    isSparkling ? 'scale-125' : 'group-hover:scale-110'
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  storefront
                </span>
              </div>
            </div>

            <div className="flex flex-col text-left">
              <span className="font-serif text-xs sm:text-sm font-bold text-white group-hover:text-[#ffd700] transition-colors tracking-wide leading-tight">
                Boutique & Galerie
              </span>
              <span className="text-[9px] font-mono text-[#8ca1be] group-hover:text-[#cbd5e1] transition-colors leading-tight mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
                <span>
                  <strong className="text-[#ffd700] font-semibold">{completedLessonsCount}</strong>/200 leçons ({Math.round((completedLessonsCount / 200) * 100)}%)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Equipped Companion Mini-HUD */}
        <div className="relative z-10">
          {equippedCharacter ? (
            <button
              type="button"
              onClick={() => handleOpenInspect(equippedCharacter, false)}
              className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#121c2e] to-[#0c1322] border border-[#2b3a53] hover:border-[#ffd700]/60 transition-all cursor-pointer shadow-md group active:scale-95"
              title="Inspecter votre compagnon actif"
            >
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[#d4af37]/50 shrink-0 shadow-inner">
                <img src={equippedCharacter.image} alt={equippedCharacter.name} className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold leading-none flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#ffd700]"></span>
                  Compagnon Actif
                </span>
                <span className="text-xs font-serif font-bold text-white group-hover:text-[#ffd700] transition-colors leading-tight">
                  {equippedCharacter.name}
                  <span className="text-[10px] font-mono font-normal text-[#8391ac] ml-1.5">Niv. {userLevel}</span>
                </span>
              </div>
              <span className="material-symbols-outlined text-[#8391ac] group-hover:text-[#ffd700] text-sm ml-1 transition-colors">
                visibility
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1626]/80 border border-dashed border-[#2b3a53] hover:border-[#d4af37]/60 text-[#8391ac] hover:text-[#ffd700] text-xs font-mono transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#d4af37]">add_moderator</span>
              <span>Équiper une carte</span>
            </button>
          )}
        </div>

        {/* Right Section: Interactive Treasury HUD & Exit Control */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Treasury Toggle Button with Live Quota Gauge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTreasuryOpen(!isTreasuryOpen)}
              className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-lg active:scale-95 ${
                isTreasuryOpen
                  ? 'bg-gradient-to-r from-[#1d273a] to-[#121c2d] border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                  : 'bg-gradient-to-b from-[#141d2d] to-[#0a1120] border-[#d4af37]/45 hover:border-[#ffd700]/75'
              }`}
              aria-expanded={isTreasuryOpen}
              aria-label="Ouvrir la trésorerie et le registre économique"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ffd700]/20 to-[#d4af37]/5 border border-[#ffd700]/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base text-[#ffd700]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    monetization_on
                  </span>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-base font-black tracking-tight text-white">{balance.toLocaleString()}</span>
                    <span className="text-[10px] font-mono font-bold text-[#ffd700]">MSZ</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono">
                    <div className="w-10 sm:w-12 h-1 rounded-full bg-[#1e293b] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#38bdf8] to-[#ffd700] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((dailyState.coinsEarnedToday / dailyLimit) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[#8ca1be]">{dailyState.coinsEarnedToday}/{dailyLimit}</span>
                  </div>
                </div>
              </div>
              <span className={`material-symbols-outlined text-xs text-[#d4af37] transition-transform duration-300 ${isTreasuryOpen ? 'rotate-180 text-[#ffd700]' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Interactive Treasury Popover Drawer */}
            {isTreasuryOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-[#0a1120]/98 backdrop-blur-2xl border border-[#d4af37]/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.2)] p-5 z-50 animate-fadeIn text-left">
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#222d42]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ffd700] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-white">Le Trésor MSZ</h4>
                      <p className="text-[10px] font-mono text-[#8ca1be]">Registre économique & Coffre</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTreasuryOpen(false)}
                    className="w-7 h-7 rounded-lg bg-[#141f33] hover:bg-[#202d48] text-[#8ca1be] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>

                {/* Vault Balance Display */}
                <div className="my-3.5 p-3 rounded-xl bg-gradient-to-br from-[#121c2e] to-[#080d17] border border-[#d4af37]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold">Solde Disponible</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-mono text-2xl font-black text-white">{balance.toLocaleString()}</span>
                      <span className="text-xs font-mono font-bold text-[#ffd700]">MSZ Coins</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded-full border border-[#38bdf8]/20">
                      Niveau {userLevel}
                    </span>
                  </div>
                </div>

                {/* Daily Cap & Anti-Spam Progress */}
                <div className="space-y-2 mb-4 p-3 rounded-xl bg-[#0f172a]/70 border border-[#222d42]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#b5c2d9]">Plafond d'apprentissage :</span>
                    <span className="text-[#ffd700] font-bold">
                      {dailyState.coinsEarnedToday} / {dailyLimit} MSZ
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1b2537] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#38bdf8] via-[#eab308] to-[#ffd700] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((dailyState.coinsEarnedToday / dailyLimit) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8ca1be]">
                    <span>Disponible aujourd'hui :</span>
                    <span className="text-[#38bdf8] font-semibold">
                      +{Math.max(0, dailyLimit - dailyState.coinsEarnedToday)} MSZ
                    </span>
                  </div>
                </div>

                {/* Certified Rarity Rules */}
                <div className="mb-4 text-[11px] text-[#9bb0ce] leading-relaxed p-2.5 rounded-xl bg-[#141e30]/50 border border-[#27354b]">
                  <div className="flex items-center gap-1.5 text-[#ffd700] font-mono font-semibold text-[10px] mb-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Tirage Strict 1/100
                  </div>
                  Chaque carte est frappée en 100 exemplaires uniques. Numéro de série infalsifiable (#001 à #100) certifié dans votre inventaire.
                </div>

                {/* Recent Transactions Preview */}
                {transactions.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8ca1be] block mb-1.5">Activité Récente</span>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {transactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-[#0d1524] border border-[#1d273a]">
                          <span className="text-[#dce2f8] truncate max-w-[190px]">{tx.description}</span>
                          <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-[#4ade80]' : 'text-[#f43f5e]'}`}>
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount} MSZ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Navigation Shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222d42]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('marketplace');
                      setIsTreasuryOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141f33] hover:bg-[#1e2d4a] text-white text-[11px] font-mono font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs text-[#ffd700]">swap_horiz</span>
                    Bourse P2P
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('inventory');
                      setIsTreasuryOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141f33] hover:bg-[#1e2d4a] text-white text-[11px] font-mono font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs text-[#38bdf8]">collections_bookmark</span>
                    Mes Cartes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#182235] to-[#0c1322] border border-[#2b3952] hover:border-[#ffd700]/60 flex items-center justify-center text-[#8ca1be] hover:text-[#ffd700] transition-all cursor-pointer shadow-md active:scale-95"
            title="Quitter la galerie"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-[82px] z-20 bg-[#070d1a]/90 backdrop-blur-md border-b border-[#232a3a] px-4 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('shop')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#8391ac] hover:text-white hover:bg-[#151f33]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Boutique des 10 Séries</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#0c1322]/20 text-[10px]">
                {MSZ_CHARACTERS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#8391ac] hover:text-white hover:bg-[#151f33]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              <span>Ma Collection ({ownedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#8391ac] hover:text-white hover:bg-[#151f33]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              <span>Bourse P2P & Revente</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#1e293b] text-[#38bdf8] text-[10px]">
                {listings.length} offres
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('crypto')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                  : 'text-[#8391ac] hover:text-white hover:bg-[#151f33]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">currency_bitcoin</span>
              <span>Vision Crypto MSZ</span>
            </button>
          </div>

          {/* Harmonized Series & Limited Run Certificate Tag */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0c1424] border border-[#d4af37]/35 text-xs font-mono shadow-sm">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#f6de8c] uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs text-[#ffd700]">hotel_class</span>
              Séries I – X
            </span>
            <span className="text-[#3b4860]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#ffd700] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse"></span>
              Tirage Certifié 1/100
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* ================================================================ */}
        {/* TAB 1: BOUTIQUE DES PERSONNAGES (SHOP) */}
        {/* ================================================================ */}
        {activeTab === 'shop' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Featured Official Characters Hero Banner (9 Personnages Officiels) */}
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0d1527] via-[#151a33] to-[#0a1122] border border-[#d4af37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-2.5 relative z-10 max-w-xl text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">
                    9 Comptes Officiels Rares
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-[#d4af37]/15 text-[#ffd700] text-[10px] font-mono font-bold border border-[#d4af37]/30">
                    Max 100 Exemplaires / Carte
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                    Bourse P2P Active
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                  Grand Pavillon des Maîtres MSZ
                </h2>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  Découvrez les 9 personnages officiels certifiés : <strong>ÉCLAT, EKLAH, VOLT, NYX, SOLARIA, INFERNO, UMBRA, FROST</strong> et le souverain <strong>ETERNIS</strong>. Chaque pièce possède son <strong>matricule d'identité unique gravé (№ 001/100 à 100/100)</strong>, garantissant sa rareté absolue et sa valeur lors des échanges sur la bourse P2P.
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-3 pt-2 text-xs font-mono text-[#94a3b8] flex-wrap">
                  <span className="flex items-center gap-1.5 text-[#38bdf8]">
                    <span className="material-symbols-outlined text-sm">view_in_ar</span>
                    Scène 3D & Parallaxe Holo
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 text-[#ffd700]">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Série Numérotée (1/100)
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="material-symbols-outlined text-sm">currency_exchange</span>
                    Liquidité & Revente P2P
                  </span>
                </div>
              </div>

              {/* Showcase Pedestal with Master Cards: ÉCLAT, EKLAH, VOLT & ETERNIS */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10 overflow-x-auto py-2">
                {/* ÉCLAT */}
                <div className="w-18 sm:w-22 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-xl bg-[#060a16] transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 group">
                  <div className="h-20 sm:h-24 overflow-hidden relative bg-gradient-to-b from-[#091024] to-[#040711]">
                    <img
                      src="/assets/aistudio/ECLAT.png"
                      alt="ÉCLAT"
                      className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 text-center bg-[#070d1e] border-t border-white/5">
                    <span className="text-[9px] font-mono font-bold text-cyan-300 block truncate">ÉCLAT</span>
                    <span className="text-[8px] text-[#ffd700] font-mono font-black">50 MSZ</span>
                  </div>
                </div>

                {/* EKLAH */}
                <div className="w-18 sm:w-22 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-xl bg-[#060a16] transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300 group">
                  <div className="h-20 sm:h-24 overflow-hidden relative bg-gradient-to-b from-[#051a14] to-[#040711]">
                    <img
                      src="/assets/aistudio/ECLAT_4c46a7cc.png"
                      alt="EKLAH"
                      className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 text-center bg-[#070d1e] border-t border-white/5">
                    <span className="text-[9px] font-mono font-bold text-emerald-300 block truncate">EKLAH</span>
                    <span className="text-[8px] text-[#ffd700] font-mono font-black">65 MSZ</span>
                  </div>
                </div>

                {/* VOLT */}
                <div className="w-18 sm:w-22 rounded-2xl overflow-hidden border border-fuchsia-400/40 shadow-xl bg-[#060a16] transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300 group">
                  <div className="h-20 sm:h-24 overflow-hidden relative bg-gradient-to-b from-[#180a24] to-[#040711]">
                    <img
                      src="/assets/aistudio/VOLT.png"
                      alt="VOLT"
                      className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 text-center bg-[#070d1e] border-t border-white/5">
                    <span className="text-[9px] font-mono font-bold text-fuchsia-300 block truncate">VOLT</span>
                    <span className="text-[8px] text-[#ffd700] font-mono font-black">75 MSZ</span>
                  </div>
                </div>

                {/* ETERNIS */}
                <div className="w-20 sm:w-24 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-xl shadow-[#d4af37]/20 bg-[#060a16] transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 group">
                  <div className="h-22 sm:h-26 overflow-hidden relative bg-gradient-to-b from-[#241705] to-[#040711]">
                    <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-[#d4af37] text-black text-[7px] font-mono font-black uppercase">
                      Lvl 100
                    </div>
                    <img
                      src="/assets/aistudio/ETERNIS.png"
                      alt="ETERNIS"
                      className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 text-center bg-[#0e0a05] border-t border-[#d4af37]/30">
                    <span className="text-[9px] font-mono font-bold text-amber-300 block truncate">ETERNIS</span>
                    <span className="text-[8px] text-[#ffd700] font-mono font-black">2500 MSZ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progressive Categories Filter Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[#d4c78f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50]">category</span>
                  Filtrer par Série ({SHOP_CATEGORIES.length} Séries Progressives)
                </span>
                <span className="text-[10px] text-[#8391ac] font-mono">
                  {filteredShopCharacters.length} personnages trouvés
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                      : 'bg-[#151f33] text-[#8391ac] hover:text-white'
                  }`}
                >
                  Toutes les Séries
                </button>

                {SHOP_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1f2c48] text-[#ffe082] border border-[#f2ca50] shadow-md'
                          : 'bg-[#121929] text-[#8391ac] border border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs" style={{ color: cat.accentColor }}>
                        {cat.icon}
                      </span>
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-70">({cat.startingPrice}+ MSZ)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Stats Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#121929] border border-[#232a3a]">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#8391ac]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, élément, série..."
                  className="w-full bg-[#0a101f] border border-[#2e3b55] rounded-xl pl-9 pr-8 py-2 text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none placeholder:text-[#526079]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[#8391ac] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#8391ac]">
                <span>Affichage :</span>
                <span className="font-bold text-[#ffd700]">
                  {filteredShopCharacters.length} / {MSZ_CHARACTERS.length} cartes
                </span>
                <span className="text-white/20">&bull;</span>
                <span className="text-[#38bdf8]">6 Rangs de Rareté</span>
              </div>
            </div>

            {/* ============================================================== */}
            {/* ONGLETS FILTRABLES PAR RARETÉ (VISUAL RARITY TABS) */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[#d4c78f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#ffd700]">diamond</span>
                  Onglets Filtrables par Rareté & Rang de Puissance
                </span>
                <span className="text-[10px] text-[#8391ac] font-mono hidden sm:inline">
                  Cliquez sur un rang pour isoler sa catégorie de cartes
                </span>
              </div>

              {/* Rarity Tabs Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {/* All Rarities Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedRarity('all')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative overflow-hidden ${
                    selectedRarity === 'all'
                      ? 'bg-gradient-to-b from-[#f2ca50] to-[#ffd700] text-[#0c1322] font-black shadow-lg shadow-[#f2ca50]/25 ring-2 ring-[#ffd700]'
                      : 'bg-[#101726] border border-[#232a3a] text-[#8391ac] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">apps</span>
                    <span className="text-xs font-mono font-bold tracking-wide">Toutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                        selectedRarity === 'all'
                          ? 'bg-[#0c1322]/25 text-[#0c1322] font-black'
                          : 'bg-[#19243d] text-[#38bdf8]'
                      }`}
                    >
                      {rarityCounts.all} cartes
                    </span>
                  </div>
                </button>

                {/* Individual Rarity Tabs with Glow & Golden Borders */}
                {RARITY_ORDER.map((rarityKey) => {
                  const config = RARITY_CONFIGS[rarityKey];
                  const isSelected = selectedRarity === rarityKey;
                  const count = rarityCounts[rarityKey] || 0;

                  return (
                    <button
                      key={rarityKey}
                      type="button"
                      onClick={() => setSelectedRarity(rarityKey)}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative overflow-hidden text-center ${
                        isSelected
                          ? `${config.badgeClass} ${
                              config.goldenBorder
                                ? 'ring-2 ring-[#ffd700] shadow-[0_0_22px_rgba(255,215,0,0.6)]'
                                : 'ring-2 ring-white/40'
                            }`
                          : 'bg-[#101726] border border-[#232a3a] text-[#8391ac] hover:border-white/25 hover:text-white'
                      }`}
                      style={
                        isSelected
                          ? { boxShadow: config.glowShadow }
                          : undefined
                      }
                    >
                      {/* Golden Shimmer Bar for Legendary, Mythic & Sovereign */}
                      {config.goldenBorder && (
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 via-[#ffd700] to-yellow-300" />
                      )}

                      <div className="flex items-center gap-1.5">
                        <span
                          className="material-symbols-outlined text-base"
                          style={{
                            color: isSelected ? undefined : config.accentColor,
                            fontVariationSettings: "'FILL' 1"
                          }}
                        >
                          {config.icon}
                        </span>
                        <span className="text-xs font-mono font-black tracking-wide">
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected
                              ? 'bg-black/30 text-white'
                              : 'bg-[#19243d] text-[#cbd5e1]'
                          }`}
                        >
                          {config.levelRange.replace('Niveau ', 'Niv. ').replace('Niveaux ', 'Niv. ')}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#070e1d] text-[#f2ca50]'
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================================== */}
            {/* CARDS DISPLAY: ORGANIZED BY RARITY SECTIONS OR SINGLE RARITY SPOTLIGHT */}
            {/* ============================================================== */}
            {filteredShopCharacters.length === 0 ? (
              /* Empty state if search or category returns 0 characters */
              <div className="p-10 rounded-3xl bg-[#0c1426] border border-[#232a3a] text-center flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-4xl text-[#8391ac]">search_off</span>
                <h3 className="font-serif text-lg font-bold text-white">
                  Aucun personnage ne correspond à vos critères
                </h3>
                <p className="text-xs text-[#8391ac] max-w-sm">
                  Essayez de réinitialiser la rareté sélectionnée ou le terme de recherche pour afficher les cartes d’élite.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRarity('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#19243d] hover:bg-[#25355a] text-[#ffe082] text-xs font-mono font-bold border border-[#f2ca50]/30 transition-all cursor-pointer"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : selectedRarity === 'all' ? (
              /* MODE 1: ALL RARITIES ORGANIZED INTO DISTINCT LABELED RARITY TIERS */
              <div className="flex flex-col gap-8">
                {Array.from(charactersByRarity.entries()).map(([rarity, chars]) => {
                  const config = RARITY_CONFIGS[rarity];

                  return (
                    <section
                      key={rarity}
                      className="p-5 sm:p-6 rounded-3xl bg-[#0c1426]/75 border border-[#232a3a] shadow-xl flex flex-col gap-5 relative overflow-hidden"
                    >
                      {/* Subtle Ambient Halo */}
                      <div
                        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10"
                        style={{ backgroundColor: config.accentColor }}
                      />

                      {/* Tier Section Header Banner with Glowing Badge & Golden Border */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
                        <div className="flex items-center gap-3.5 flex-wrap">
                          {/* Visual Rarity Badge with Glow & Golden Border */}
                          <div
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase flex items-center gap-2 ${
                              config.badgeClass
                            } ${
                              config.goldenBorder
                                ? 'ring-2 ring-[#ffd700]/70'
                                : ''
                            }`}
                            style={{ boxShadow: config.glowShadow }}
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              style={{
                                color: config.accentColor,
                                fontVariationSettings: "'FILL' 1"
                              }}
                            >
                              {config.icon}
                            </span>
                            <span className="font-black tracking-wider text-sm">
                              {config.label}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-black text-[#f2ca50] uppercase tracking-wider">
                                {config.tierTag}
                              </span>
                              <span className="text-white/30">•</span>
                              <span className="text-[10px] font-mono text-[#38bdf8] font-bold">
                                {config.levelRange}
                              </span>
                            </div>
                            <p className="text-xs text-[#cbd5e1] mt-0.5 line-clamp-1 max-w-xl">
                              {config.description}
                            </p>
                          </div>
                        </div>

                        {/* Right tags: Golden Border indicator & Card counts */}
                        <div className="flex items-center gap-2 shrink-0">
                          {config.goldenBorder && (
                            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-[#ffd700]/15 to-yellow-500/20 border border-amber-400/60 text-[#ffd700] text-[10px] font-mono font-black flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-xs">workspace_premium</span>
                              Bordure Dorée
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-xl bg-[#070e1d] border border-white/10 text-[10px] font-mono text-[#d4c78f] font-bold">
                            {chars.length} {chars.length > 1 ? 'cartes' : 'carte'} &bull; 100 Ex.
                          </span>
                        </div>
                      </div>

                      {/* 3D Cards Grid for this Rarity Tier */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center relative z-10">
                        {chars.map((character) => (
                          <MszCard3D
                            key={character.id}
                            character={character}
                            isOwned={ownedIds.includes(character.id)}
                            ownedInstance={getInstanceForChar(character.id)}
                            isEquipped={equippedId === character.id}
                            userCoins={balance}
                            onBuy={handleBuyCharacter}
                            onEquip={handleEquipCharacter}
                            onInspect={(char, startZoomed) => handleOpenInspect(char, startZoomed ?? true)}
                            onZoom={(char) => handleOpenInspect(char, true)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              /* MODE 2: SINGLE RARITY TAB SELECTED WITH SPOTLIGHT HERO BANNER */
              <div className="flex flex-col gap-6">
                {(() => {
                  const config = RARITY_CONFIGS[selectedRarity];
                  return (
                    <div
                      className={`p-5 sm:p-6 rounded-3xl bg-[#0c1426] border shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 ${
                        config.goldenBorder
                          ? 'border-2 border-[#ffd700]/70 ring-1 ring-[#ffd700]/40'
                          : 'border-white/10'
                      }`}
                      style={{ boxShadow: config.glowShadow }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${config.badgeClass}`}
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{
                              color: config.accentColor,
                              fontVariationSettings: "'FILL' 1"
                            }}
                          >
                            {config.icon}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-black uppercase text-[#f2ca50]">
                              {config.tierTag}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-xs font-mono text-[#38bdf8] font-bold">
                              {config.levelRange}
                            </span>
                            {config.goldenBorder && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[#ffd700] text-[9px] font-mono font-bold border border-amber-400/40">
                                Finition Dorée Prestige
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-xl sm:text-2xl font-black text-white">
                            Rang : Cartes {config.label}s
                          </h3>
                          <p className="text-xs text-[#cbd5e1] max-w-xl leading-relaxed">
                            {config.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedRarity('all')}
                          className="px-3 py-1.5 rounded-xl bg-[#19243d] hover:bg-[#25355a] text-[#8391ac] hover:text-white text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Voir Toutes les Raretés</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Cards Grid for Selected Rarity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                  {filteredShopCharacters.map((character) => (
                    <MszCard3D
                      key={character.id}
                      character={character}
                      isOwned={ownedIds.includes(character.id)}
                      ownedInstance={getInstanceForChar(character.id)}
                      isEquipped={equippedId === character.id}
                      userCoins={balance}
                      onBuy={handleBuyCharacter}
                      onEquip={handleEquipCharacter}
                      onInspect={(char, startZoomed) => handleOpenInspect(char, startZoomed ?? true)}
                      onZoom={(char) => handleOpenInspect(char, true)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: MA COLLECTION & NUMÉROS DE SÉRIE (INVENTORY) */}
        {/* ================================================================ */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Inventory Stats Banner */}
            <div className="p-5 rounded-2xl bg-[#121929] border border-[#232a3a] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1f2c48] border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Votre Galerie de Personnages Certifiés
                  </h3>
                  <p className="text-xs text-[#8391ac]">
                    Chaque carte affiche son numéro d'identité officiel (1/100). Vous pouvez l'équiper sur votre profil ou la revendre sur la bourse P2P.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="text-center px-4 py-2 rounded-xl bg-[#0a101f] border border-white/5">
                  <span className="text-[10px] text-[#8391ac] uppercase block">Cartes Possédées</span>
                  <span className="text-lg font-black text-[#f2ca50]">{ownedCharacters.length}/{MSZ_CHARACTERS.length}</span>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-[#0a101f] border border-white/5">
                  <span className="text-[10px] text-[#8391ac] uppercase block">Niveau Moyen</span>
                  <span className="text-lg font-black text-[#38bdf8]">
                    {Math.round(
                      ownedCharacters.reduce((acc, c) => acc + c.level, 0) / Math.max(1, ownedCharacters.length)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Owned Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {ownedCharacters.map((character) => (
                <MszCard3D
                  key={character.id}
                  character={character}
                  isOwned={true}
                  ownedInstance={getInstanceForChar(character.id)}
                  isEquipped={equippedId === character.id}
                  userCoins={balance}
                  onEquip={handleEquipCharacter}
                  onSell={handleOpenSellModal}
                  onInspect={(char, startZoomed) => handleOpenInspect(char, startZoomed ?? true)}
                  onZoom={(char) => handleOpenInspect(char, true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: BOURSE P2P & ACHAT-REVENTE (MARKETPLACE) */}
        {/* ================================================================ */}
        {activeTab === 'marketplace' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Marketplace Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#101b33] to-[#070e1d] border border-[#38bdf8]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold border border-sky-400/40">
                    Bourse d'Échanges P2P
                  </span>
                  <span className="text-xs font-mono text-[#d4c78f]">
                    Transactions directes avec numéros de série uniques
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Marché Secondaire des Icônes & Cartes MSZ
                </h3>
                <p className="text-xs text-[#d0c5af] max-w-lg leading-relaxed">
                  Achetez des numéros de série rares proposés par d’autres membres de l’Académie, ou vendez vos propres cartes pour engranger des MSZ Coins ! Les numéros inférieurs à 10 possèdent une valeur de collection supérieure.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#2c2000] font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#f2ca50]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">sell</span>
                  <span>Vendre une de mes cartes</span>
                </button>
              </div>
            </div>

            {/* Active Listings Grid */}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase font-bold tracking-wider text-[#d4c78f] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#38bdf8]">store</span>
                Offres Actuellement Disponibles sur la Bourse ({listings.length})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((item) => {
                  const character = MSZ_CHARACTERS.find((c) => c.id === item.characterId);
                  if (!character) return null;
                  const canBuy = balance >= item.price && !ownedIds.includes(item.characterId);
                  const isTopTen = item.editionNumber <= 10;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#121929] border border-[#232a3a] hover:border-[#38bdf8]/50 shadow-lg flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#070e1d]">
                          <img
                            src={character.image}
                            alt={character.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/aistudio/VOLT.png';
                            }}
                          />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif text-base font-bold text-white">
                              {character.name}
                            </h4>
                            {/* Visual Rarity Badge in Marketplace */}
                            {(() => {
                              const rConfig =
                                RARITY_CONFIGS[character.rarity as CharacterRarity] ||
                                RARITY_CONFIGS['Commune'];
                              return (
                                <span
                                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                    rConfig.badgeClass
                                  } ${rConfig.goldenBorder ? 'ring-1 ring-[#ffd700]/60' : ''}`}
                                >
                                  <span
                                    className="material-symbols-outlined text-[10px]"
                                    style={{
                                      color: rConfig.accentColor,
                                      fontVariationSettings: "'FILL' 1"
                                    }}
                                  >
                                    {rConfig.icon}
                                  </span>
                                  <span>{rConfig.label}</span>
                                </span>
                              );
                            })()}
                            <span className="text-[10px] font-mono font-black text-[#ffd700] px-2 py-0.5 rounded bg-[#0a101f] border border-[#f2ca50]/40">
                              N° {item.editionNumber}/{item.maxSupply || 100} &bull; {item.serialNumber}
                            </span>
                            {isTopTen && (
                              <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffd700] border border-amber-400/50">
                                ★ TOP 10 MINT
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8391ac] font-mono">
                            Vendeur : {item.sellerName} &bull; {item.listedAt}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            État : {item.condition}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-mono text-base font-black text-[#ffd700] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">monetization_on</span>
                          {item.price} MSZ
                        </span>

                        <button
                          type="button"
                          onClick={() => handleBuyListing(item)}
                          disabled={!canBuy}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer ${
                            canBuy
                              ? 'bg-[#38bdf8] text-[#070e1d] hover:bg-[#7dd3fc]'
                              : 'bg-[#1e293b] text-[#8391ac] border border-white/5 opacity-60'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">shopping_bag</span>
                          <span>Acheter</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transactions Ledger */}
            <div className="p-5 rounded-2xl bg-[#121929] border border-[#232a3a] shadow-lg flex flex-col gap-3">
              <span className="text-xs uppercase font-bold tracking-wider text-[#d4c78f] flex items-center gap-1.5 border-b border-[#232a3a] pb-2">
                <span className="material-symbols-outlined text-sm text-[#f2ca50]">receipt_long</span>
                Registre des Dernières Transactions MSZ Coins & Numéros Frappés
              </span>

              <div className="flex flex-col divide-y divide-[#232a3a] max-h-60 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-[#dce2f8] font-medium">{tx.description}</span>
                      <span className="text-[10px] text-[#8391ac] font-mono">
                        {new Date(tx.date).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} MSZ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: VISION CRYPTO MSZ */}
        {/* ================================================================ */}
        {activeTab === 'crypto' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121b30] via-[#1b143b] to-[#070e1d] border border-[#ffd700]/50 shadow-2xl relative overflow-hidden flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/40">
                  Feuille de Route • Projet Cryptomonnaie MSZ
                </span>
                <span className="text-xs font-mono text-[#d4c78f]">Inspiré par l’Écosystème TCG</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight">
                L’Économie Décentralisée & les 100 Cartes Rares MSZ
              </h2>

              <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed max-w-3xl">
                À l’image des écosystèmes de cartes à collectionner les plus prestigieux (comme Pokémon TCG Secret Rare), le jeton <strong>MSZ Coin</strong> récompense l’effort linguistique régulier. Chaque personnage est limité à <strong>100 exemplaires uniques au monde</strong>, garantissant une rareté mathématique absolue et une valorisation sur la bourse d’échanges P2P.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-2xl bg-[#070e1d]/90 border border-[#f2ca50]/30 flex flex-col gap-1">
                  <span className="text-[10px] text-[#f2ca50] font-mono uppercase font-bold">
                    Plafond Quotidien Échelonné
                  </span>
                  <span className="text-lg font-black font-mono text-white">10 à 100 MSZ / Jour</span>
                  <p className="text-[11px] text-[#8391ac]">
                    Ajusté dynamiquement par tranche de 10 niveaux (Niv. 1-10 : 10 MSZ/j, jusqu'à 100 MSZ/j au niveau 100).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#070e1d]/90 border border-[#38bdf8]/30 flex flex-col gap-1">
                  <span className="text-[10px] text-[#38bdf8] font-mono uppercase font-bold">
                    Numérotation Unique 1/100
                  </span>
                  <span className="text-lg font-black font-mono text-white">100 Exemplaires Max</span>
                  <p className="text-[11px] text-[#8391ac]">
                    Chaque carte est estampillée de son matricule propre (ex: MSZ-ECLAT-#001/100).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#070e1d]/90 border border-emerald-400/30 flex flex-col gap-1">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold">
                    Bourse P2P & Liquidité
                  </span>
                  <span className="text-lg font-black font-mono text-white">Achat-Revente Libre</span>
                  <p className="text-[11px] text-[#8391ac]">
                    Échangez vos numéros rares entre joueurs pour compléter vos séries et monétiser vos prouesses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================ */}
      {/* DETAILED CARD INSPECT MODAL (RECTO / VERSO FULLSCREEN PREVIEW) */}
      {/* ================================================================ */}
      {/* ================================================================ */}
      {/* STUDIO D'EXAMEN ARTISTIQUE & ZOOM HD (MODAL HAUTE DÉFINITION) */}
      {/* ================================================================ */}
      {inspectedCharacter && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          onClick={() => setInspectedCharacter(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#0f1b33] to-[#070e1c] border-2 border-[#f2ca50]/70 shadow-[0_0_50px_rgba(242,202,80,0.25)] flex flex-col relative animate-scaleUp scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title, Rarity Badge & Mode Switcher */}
            <div className="sticky top-0 z-20 px-5 sm:px-7 py-4 bg-[#0a1222]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#f2ca50] uppercase font-bold tracking-wider">
                      {inspectedCharacter.categoryName} • Niv. {inspectedCharacter.level}
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-[10px] font-mono text-[#38bdf8] font-bold">
                      {inspectedCharacter.element}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    {inspectedCharacter.name}
                    {/* Visual Rarity Badge in Header */}
                    {(() => {
                      const rConfig =
                        RARITY_CONFIGS[inspectedCharacter.rarity as CharacterRarity] ||
                        RARITY_CONFIGS['Commune'];
                      return (
                        <span
                          className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                            rConfig.badgeClass
                          } ${rConfig.goldenBorder ? 'ring-1 ring-[#ffd700]' : ''}`}
                          style={{ boxShadow: rConfig.glowShadow }}
                        >
                          <span
                            className="material-symbols-outlined text-xs"
                            style={{
                              color: rConfig.accentColor,
                              fontVariationSettings: "'FILL' 1"
                            }}
                          >
                            {rConfig.icon}
                          </span>
                          <span>{rConfig.label}</span>
                        </span>
                      );
                    })()}
                  </h3>
                </div>
              </div>

              {/* Mode Switcher & Close button */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center bg-[#070e1d] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setInspectMode('zoomLoupe')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inspectMode === 'zoomLoupe'
                        ? 'bg-[#38bdf8] text-[#0c1322] shadow-sm'
                        : 'text-[#8391ac] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                    <span>Zoom Loupe HD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectMode('card3d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inspectMode === 'card3d'
                        ? 'bg-[#f2ca50] text-[#0c1322] shadow-sm'
                        : 'text-[#8391ac] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">3d_rotation</span>
                    <span>Carte 3D</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectedCharacter(null)}
                  className="w-9 h-9 rounded-full bg-[#19243d] hover:bg-[#25355a] text-[#8391ac] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Fermer l'examen"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* Mobile Mode Switcher Bar */}
            <div className="sm:hidden px-5 py-2 bg-[#070e1d] border-b border-white/5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setInspectMode('zoomLoupe')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                  inspectMode === 'zoomLoupe'
                    ? 'bg-[#38bdf8] text-[#0c1322]'
                    : 'text-[#8391ac] bg-[#121929]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">zoom_in</span>
                <span>Zoom Loupe HD</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectMode('card3d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                  inspectMode === 'card3d'
                    ? 'bg-[#f2ca50] text-[#0c1322]'
                    : 'text-[#8391ac] bg-[#121929]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">3d_rotation</span>
                <span>Carte 3D</span>
              </button>
            </div>

            {/* Content Body */}
            {inspectMode === 'zoomLoupe' ? (
              /* ============================================================== */
              /* MODE ZOOM LOUPE HD: INTERACTIVE MAGNIFIER + COMFORTABLE TEXT */
              /* ============================================================== */
              <div className="p-5 sm:p-7 flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Column: Interactive Loupe Viewport */}
                <div className="w-full lg:w-[48%] flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8391ac]">
                    <span className="flex items-center gap-1 text-[#38bdf8]">
                      <span className="material-symbols-outlined text-sm">center_focus_strong</span>
                      Viseur Loupe Artistique HD
                    </span>
                    <span className="text-[#ffd700] font-bold">
                      {zoomScale.toFixed(2)}x &bull; X:{panOffset.x}% Y:{panOffset.y}%
                    </span>
                  </div>

                  {/* Artwork Viewport with Cursor Tracking & Magnification */}
                  <div
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                      const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
                      setPanOffset({ x, y });
                    }}
                    onTouchMove={(e) => {
                      if (e.touches.length === 0) return;
                      const touch = e.touches[0];
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(100, Math.round(((touch.clientX - rect.left) / rect.width) * 100)));
                      const y = Math.max(0, Math.min(100, Math.round(((touch.clientY - rect.top) / rect.height) * 100)));
                      setPanOffset({ x, y });
                    }}
                    className="relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden border-2 border-white/20 bg-[#070e1d] shadow-2xl cursor-crosshair group/zoom select-none flex items-center justify-center"
                    style={{
                      boxShadow: RARITY_CONFIGS[inspectedCharacter.rarity as CharacterRarity]?.glowShadow
                    }}
                  >
                    {/* High-Resolution Artwork Image with Dynamic Transform Origin */}
                    <img
                      src={inspectedCharacter.image}
                      alt={inspectedCharacter.name}
                      className="w-full h-full object-cover transition-transform duration-75 ease-out pointer-events-none"
                      style={{
                        transform: `scale(${zoomScale})`,
                        transformOrigin: `${panOffset.x}% ${panOffset.y}%`
                      }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/public/')) {
                          target.src = `/public${inspectedCharacter.image}`;
                        } else {
                          target.src = '/assets/aistudio/VOLT.png';
                        }
                      }}
                    />

                    {/* Cybernetic Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-cyan-400/20 mix-blend-screen">
                      {/* Central Crosshairs Target */}
                      <div
                        className="absolute w-8 h-8 -ml-4 -mt-4 border border-[#38bdf8]/70 rounded-full transition-all duration-75 pointer-events-none flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                        style={{
                          left: `${panOffset.x}%`,
                          top: `${panOffset.y}%`
                        }}
                      >
                        <div className="w-1.5 h-1.5 bg-[#ffd700] rounded-full" />
                      </div>
                    </div>

                    {/* Corner Tech Badges */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#070e1d]/80 border border-white/10 text-[9px] font-mono text-[#38bdf8] pointer-events-none">
                      MACRO RES 4K
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#070e1d]/80 border border-[#f2ca50]/30 text-[9px] font-mono text-[#ffd700] pointer-events-none">
                      TIRAGE 100 EX.
                    </div>
                  </div>

                  {/* Zoom Scale Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#8391ac]">Facteur d'Agrandissement :</span>
                      <div className="flex items-center gap-1">
                        {[1.0, 1.5, 2.0, 2.75].map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            onClick={() => setZoomScale(scale)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              zoomScale === scale
                                ? 'bg-[#38bdf8] text-[#0c1322] shadow-sm'
                                : 'bg-[#151f33] text-[#8391ac] hover:text-white'
                            }`}
                          >
                            {scale.toFixed( scale === 1 ? 0 : scale === 2 ? 0 : 2 )}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preset Focus Points */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono pt-1">
                      <span className="text-[#8391ac]">Cible :</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPanOffset({ x: 50, y: 35 });
                          setZoomScale(2.2);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#121929] hover:bg-[#1f2c48] text-[#dce2f8] border border-white/5"
                      >
                        🎯 Visière Cyber
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPanOffset({ x: 50, y: 65 });
                          setZoomScale(2.2);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#121929] hover:bg-[#1f2c48] text-[#dce2f8] border border-white/5"
                      >
                        ⚡ Emblème
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPanOffset({ x: 25, y: 55 });
                          setZoomScale(2.0);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#121929] hover:bg-[#1f2c48] text-[#dce2f8] border border-white/5"
                      >
                        🛡️ Épaulettes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPanOffset({ x: 50, y: 50 });
                          setZoomScale(1.0);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#121929] hover:bg-[#1f2c48] text-[#8391ac] border border-white/5"
                      >
                        🔄 Vue Globale
                      </button>
                    </div>

                    <p className="text-[10px] text-[#64748b] leading-tight pt-1">
                      Astuce : Déplacez votre souris ou votre doigt sur l'image pour explorer les moindres nuances artistiques en temps réel.
                    </p>
                  </div>
                </div>

                {/* Right Column: Comfortable Textual Lore & Stats */}
                <div className="w-full lg:w-[52%] flex flex-col gap-4">
                  {/* Oral Lore Quote with Audio Playback */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070e1d] border border-[#f2ca50]/40 flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#f2ca50] uppercase font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">record_voice_over</span>
                        Devise Oratoire Officielle
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlayQuoteAudio(inspectedCharacter.loreQuote)}
                        className="px-2.5 py-1 rounded-lg bg-[#19243d] hover:bg-[#25355a] border border-[#f2ca50]/30 text-[#ffe082] text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Écouter la prononciation"
                      >
                        <span className="material-symbols-outlined text-xs text-[#f2ca50]">volume_up</span>
                        <span>Écouter</span>
                      </button>
                    </div>

                    <blockquote className="font-serif italic text-xs sm:text-sm text-[#ffe082] leading-relaxed">
                      « {inspectedCharacter.loreQuote} »
                    </blockquote>
                  </div>

                  {/* Character Narrative Biography */}
                  <div className="flex flex-col gap-1.5 bg-[#091122] p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-[#8391ac] font-bold tracking-wider">
                      Présentation & Récit du Personnage :
                    </span>
                    <p className="text-xs sm:text-[13px] text-[#cbd5e1] leading-relaxed">
                      {inspectedCharacter.description}
                    </p>
                  </div>

                  {/* Radar / 4 Oratorical Stats Gauges */}
                  <div className="flex flex-col gap-1.5 bg-[#091122] p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-[#8391ac] font-bold tracking-wider mb-1">
                      Matrice des Compétences Oratoires (Niv. {inspectedCharacter.level}) :
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Élocution */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#8391ac]">Élocution</span>
                          <span className="text-cyan-400 font-bold">{inspectedCharacter.stats.elocution}/100</span>
                        </div>
                        <div className="h-1.5 bg-[#141e33] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${inspectedCharacter.stats.elocution}%` }}
                          />
                        </div>
                      </div>

                      {/* Mémoire */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#8391ac]">Mémoire</span>
                          <span className="text-purple-400 font-bold">{inspectedCharacter.stats.memoire}/100</span>
                        </div>
                        <div className="h-1.5 bg-[#141e33] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${inspectedCharacter.stats.memoire}%` }}
                          />
                        </div>
                      </div>

                      {/* Vitesse */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#8391ac]">Vitesse</span>
                          <span className="text-amber-400 font-bold">{inspectedCharacter.stats.vitesse}/100</span>
                        </div>
                        <div className="h-1.5 bg-[#141e33] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${inspectedCharacter.stats.vitesse}%` }}
                          />
                        </div>
                      </div>

                      {/* Maîtrise */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#8391ac]">Maîtrise</span>
                          <span className="text-emerald-400 font-bold">{inspectedCharacter.stats.maitrise}/100</span>
                        </div>
                        <div className="h-1.5 bg-[#141e33] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${inspectedCharacter.stats.maitrise}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passive Bonus Pill */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-[#f2ca50]/30 flex items-center gap-2.5 text-xs text-[#ffe082]">
                    <span className="material-symbols-outlined text-lg text-[#f2ca50] shrink-0">
                      military_tech
                    </span>
                    <span className="leading-snug">
                      <strong className="text-[#ffd700]">Bonus Actif :</strong> {inspectedCharacter.passiveBonus}
                    </span>
                  </div>

                  {/* Blockchain & Serial Identity Certificate */}
                  <div className="p-3.5 rounded-2xl bg-[#070e1d] border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8391ac] uppercase">Matricule Unique Certifié</span>
                      <span className="text-[#ffd700] font-black">
                        {getInstanceForChar(inspectedCharacter.id)
                          ? getInstanceForChar(inspectedCharacter.id)?.serialCode
                          : `${inspectedCharacter.serialPrefix}-#001/100`}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-[#8391ac] uppercase">Tirage Limité Mondial</span>
                      <span className="text-white font-bold">100 Exemplaires Absolus</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer inside Zoom View */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#8391ac]">Prix Officiel</span>
                      <span className="font-mono text-base font-black text-[#ffd700]">
                        {inspectedCharacter.price} MSZ Coins
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {equippedId === inspectedCharacter.id ? (
                        <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          Actuellement Équipé
                        </span>
                      ) : ownedIds.includes(inspectedCharacter.id) ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEquipCharacter(inspectedCharacter)}
                            className="px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Équiper sur mon Profil
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedCharacter(null);
                              handleOpenSellModal(inspectedCharacter);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
                          >
                            Vendre P2P
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyCharacter(inspectedCharacter)}
                          disabled={balance < inspectedCharacter.price}
                          className={`px-5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                            balance >= inspectedCharacter.price
                              ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000]'
                              : 'bg-[#1e293b] text-[#8391ac] border border-white/10 opacity-70'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">shopping_bag</span>
                          <span>Acheter ({inspectedCharacter.price} MSZ)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* MODE CARTE 3D MANIPULABLE (RECTO / VERSO) */
              /* ============================================================== */
              <div className="p-6 sm:p-8 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-center">
                  <MszCard3D
                    character={inspectedCharacter}
                    isOwned={ownedIds.includes(inspectedCharacter.id)}
                    ownedInstance={getInstanceForChar(inspectedCharacter.id)}
                    isEquipped={equippedId === inspectedCharacter.id}
                    userCoins={balance}
                    onBuy={handleBuyCharacter}
                    onEquip={handleEquipCharacter}
                    onSell={(c) => {
                      setInspectedCharacter(null);
                      handleOpenSellModal(c);
                    }}
                    onInspect={(c) => handleOpenInspect(c, true)}
                    onZoom={(c) => handleOpenInspect(c, true)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInspectMode('zoomLoupe')}
                    className="px-4 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0c1322] text-xs font-mono font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                    <span>Ouvrir le Mode Zoom Loupe HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayQuoteAudio(inspectedCharacter.loreQuote)}
                    className="px-4 py-2 rounded-xl bg-[#19243d] hover:bg-[#25355a] border border-[#f2ca50]/40 text-[#ffe082] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">volume_up</span>
                    <span>Écouter la Devise</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SELL MODAL (PUT CARD ON P2P MARKETPLACE WITH ITS SPECIFIC SERIAL) */}
      {/* ================================================================ */}
      {sellModalChar && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSellModalChar(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl bg-[#0c1426] border border-[#f2ca50]/50 shadow-2xl flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400">sell</span>
                Vendre « {sellModalChar.name} » sur la Bourse P2P
              </h3>
              <button
                type="button"
                onClick={() => setSellModalChar(null)}
                className="text-[#8391ac] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Show Specific Serial Number Being Sold */}
            <div className="p-3 rounded-xl bg-[#070e1d] border border-[#ffd700]/30 flex items-center justify-between">
              <span className="text-xs font-mono text-[#d4c78f]">Numéro d'Identité Transféré :</span>
              <span className="text-xs font-mono font-black text-[#ffd700]">
                {getInstanceForChar(sellModalChar.id)
                  ? `N° ${getInstanceForChar(sellModalChar.id)?.editionNumber}/100 (${getInstanceForChar(sellModalChar.id)?.serialCode})`
                  : `${sellModalChar.serialPrefix}-#001/100`}
              </span>
            </div>

            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Définissez votre prix de vente en MSZ Coins. La carte sera mise en ligne avec son numéro de série certifié, et vous recevrez immédiatement 90% du montant à titre d'avance.
            </p>

            <div className="flex flex-col gap-1.5 bg-[#070e1d] p-4 rounded-xl border border-white/5">
              <label className="text-xs font-mono text-[#8391ac]">Prix demandé (MSZ Coins) :</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={sellPriceInput}
                  onChange={(e) => setSellPriceInput(parseInt(e.target.value, 10) || 10)}
                  className="bg-[#121929] border border-[#2e3b55] rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:border-[#f2ca50] focus:outline-none w-36"
                />
                <span className="text-sm font-mono text-[#f2ca50] font-black">MSZ Coins</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-1">
                Avance immédiate créditée : {Math.floor(sellPriceInput * 0.9)} MSZ Coins
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSellModalChar(null)}
                className="px-4 py-2 rounded-xl bg-[#19243d] text-[#8391ac] text-xs font-mono"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSell}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-mono font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Confirmer la Mise en Vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#152342]/95 border border-[#f2ca50]/70 text-[#ffe082] px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            <span className="material-symbols-outlined text-base text-[#f2ca50]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
