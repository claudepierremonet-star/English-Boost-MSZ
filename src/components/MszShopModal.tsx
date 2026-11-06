import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  SHOP_CATEGORIES,
  MSZ_CHARACTERS,
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

interface MszShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel?: number; // e.g. 1 to 100
  onProfileUpdated?: () => void;
}

export const MszShopModal: React.FC<MszShopModalProps> = ({
  isOpen,
  onClose,
  userLevel = 14,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory' | 'marketplace' | 'crypto'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Dynamic economy states
  const [balance, setBalance] = useState<number>(getMszCoinsBalance());
  const [ownedIds, setOwnedIds] = useState<string[]>(getOwnedCharacterIds());
  const [ownedInstances, setOwnedInstances] = useState<OwnedCardInstance[]>(getOwnedCardInstances());
  const [equippedId, setEquippedId] = useState<string>(getEquippedCharacterId());
  const [listings, setListings] = useState<MarketListing[]>(getMarketplaceListings());
  const [transactions, setTransactions] = useState<MszTransaction[]>(getTransactionHistory());

  // Modal / Toast states
  const [inspectedCharacter, setInspectedCharacter] = useState<MszCharacter | null>(null);
  const [sellModalChar, setSellModalChar] = useState<MszCharacter | null>(null);
  const [sellPriceInput, setSellPriceInput] = useState<number>(75);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    if (isOpen) {
      refreshState();
    }
  }, [isOpen, refreshState]);

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
      {/* Header with iPhone 18 safe area clearance */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 bg-[#070d1a]/95 backdrop-blur-xl border-b border-[#232a3a] flex items-center justify-between"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 18px)',
          minHeight: 'calc(max(env(safe-area-inset-top, 0px), 18px) + 64px)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#dce2f8] hover:text-[#f2ca50] hover:bg-[#151f33] transition-all cursor-pointer"
            aria-label="Fermer la boutique"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>

          <div className="flex flex-col">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Boutique des Icônes & Cartes MSZ
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] font-mono border border-[#f2ca50]/30 hidden sm:inline">
                Tirage Limité 100 ex. • 10 Séries
              </span>
            </h1>
            <span className="text-[10px] text-[#d4c78f] uppercase font-mono">
              Écosystème MSZ Coins • Numérotation Unique (1/100) & Bourse P2P
            </span>
          </div>
        </div>

        {/* User Coins HUD & Daily Limit Gauge */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end bg-[#0f172a] border border-[#f2ca50]/40 px-3.5 py-1.5 rounded-xl shadow-inner">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-base text-[#f2ca50]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                monetization_on
              </span>
              <span className="font-mono text-base font-black text-[#ffd700]">
                {balance.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#f2ca50] font-bold">MSZ</span>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-mono text-[#8391ac]">
              <span>Gains du jour :</span>
              <span className="text-[#38bdf8] font-bold">
                {dailyState.coinsEarnedToday}/{dailyLimit}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#151f33] flex items-center justify-center text-[#8391ac] hover:text-white cursor-pointer"
            title="Quitter"
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

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#d4c78f]">
            <span className="material-symbols-outlined text-xs text-[#f2ca50]">workspace_premium</span>
            <span>Limité à 100 exemplaires / carte</span>
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
            {/* Featured Official Characters Hero Banner (8 Personnages Officiels) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121b30] via-[#1a1236] to-[#0d1629] border border-[#f2ca50]/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-2 relative z-10 max-w-xl text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/40">
                    Série 1 : Cyber Néon (50 MSZ)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[#ffd700] text-[10px] font-mono font-bold border border-amber-400/30">
                    100 Exemplaires Max / Carte
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight">
                  La Galerie des Cartes d'Élite MSZ
                </h2>
                <p className="text-xs text-[#d0c5af] leading-relaxed">
                  Incarnez les 8 personnages officiels (<strong>ÉCLAT, VOLT, NYX, SOLARIA, INFERNO, UMBRA, FROST, ETERNIS</strong>). Chaque carte possède son <strong>numéro d'identité unique (1/100 à 100/100)</strong>, augmentant sa valeur lors de la revente sur la bourse P2P.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-xs font-mono text-[#8391ac] flex-wrap">
                  <span className="flex items-center gap-1 text-[#38bdf8]">
                    <span className="material-symbols-outlined text-sm">3d_rotation</span>
                    Parallaxe 3D & Holo
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-[#f2ca50]">
                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                    Numéro Unique (ex: #001/100)
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                    Achat-Revente P2P
                  </span>
                </div>
              </div>

              {/* Quick showcase of ECLAT & VOLT & ETERNIS */}
              <div className="flex items-center justify-center gap-3 relative z-10">
                <div className="w-20 sm:w-24 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-xl bg-[#070e1d] transform -rotate-3 hover:rotate-0 transition-transform">
                  <img
                    src="/assets/aistudio/ECLAT.png"
                    alt="ÉCLAT"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-1 text-center bg-[#070e1d]">
                    <span className="text-[9px] font-mono font-bold text-cyan-300 block">ÉCLAT</span>
                    <span className="text-[8px] text-[#f2ca50] font-mono font-black">50 MSZ</span>
                  </div>
                </div>

                <div className="w-20 sm:w-24 rounded-2xl overflow-hidden border-2 border-fuchsia-400/60 shadow-xl bg-[#070e1d] transform hover:rotate-0 transition-transform">
                  <img
                    src="/assets/aistudio/VOLT.png"
                    alt="VOLT"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-1 text-center bg-[#070e1d]">
                    <span className="text-[9px] font-mono font-bold text-fuchsia-300 block">VOLT</span>
                    <span className="text-[8px] text-[#f2ca50] font-mono font-black">75 MSZ</span>
                  </div>
                </div>

                <div className="w-20 sm:w-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl shadow-amber-500/20 bg-[#070e1d] transform rotate-3 hover:rotate-0 transition-transform">
                  <img
                    src="/assets/aistudio/ETERNIS.png"
                    alt="ETERNIS"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-1 text-center bg-[#070e1d]">
                    <span className="text-[9px] font-mono font-bold text-amber-300 block">ETERNIS</span>
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

            {/* Search & Rarity Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#121929] border border-[#232a3a]">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#8391ac]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, élément..."
                  className="w-full bg-[#0a101f] border border-[#2e3b55] rounded-xl pl-9 pr-3 py-2 text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none"
                />
              </div>

              {/* Rarity filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-[#8391ac] font-mono px-2">
                  Rareté :
                </span>
                {['all', 'Commune', 'Rare', 'Épique', 'Légendaire', 'Mythique', 'Souveraine'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRarity(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer ${
                      selectedRarity === r
                        ? 'bg-[#f2ca50] text-[#0c1322] font-bold shadow-sm'
                        : 'bg-[#19243d] text-[#8391ac] hover:text-white'
                    }`}
                  >
                    {r === 'all' ? 'Toutes' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Characters 3D Cards Grid */}
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
                  onInspect={(char) => setInspectedCharacter(char)}
                />
              ))}
            </div>
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
                  <span className="text-lg font-black text-[#f2ca50]">{ownedCharacters.length}/8</span>
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
                  onInspect={(char) => setInspectedCharacter(char)}
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
      {inspectedCharacter && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setInspectedCharacter(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl bg-[#0c1426] border-2 border-[#f2ca50]/70 shadow-2xl flex flex-col items-center gap-5 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectedCharacter(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#19243d] flex items-center justify-center text-[#8391ac] hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <MszCard3D
              character={inspectedCharacter}
              isOwned={ownedIds.includes(inspectedCharacter.id)}
              ownedInstance={getInstanceForChar(inspectedCharacter.id)}
              isEquipped={equippedId === inspectedCharacter.id}
              userCoins={balance}
              onBuy={handleBuyCharacter}
              onEquip={handleEquipCharacter}
              onSell={handleOpenSellModal}
            />

            {/* Audio Quote button */}
            <button
              type="button"
              onClick={() => handlePlayQuoteAudio(inspectedCharacter.loreQuote)}
              className="px-4 py-2 rounded-xl bg-[#19243d] hover:bg-[#25355a] border border-[#f2ca50]/40 text-[#ffe082] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">volume_up</span>
              <span>Écouter la Devise Oratoire de {inspectedCharacter.name}</span>
            </button>
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
