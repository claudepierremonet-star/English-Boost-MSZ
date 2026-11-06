import React, { useState, useEffect } from 'react';
import { MSZ_CHARACTERS, SHOP_CATEGORIES, type MszCharacter } from '../data/mszShopData';
import {
  getMszCoinsBalance,
  getDailyMszCoinsState,
  getOwnedCharacterIds,
  getOwnedCardInstances,
  getEquippedCharacterId,
  buyCharacterFromShop,
  equipCharacter,
  type OwnedCardInstance
} from '../utils/mszCoinsManager';
import { MszCard3D } from './MszCard3D';
import confetti from 'canvas-confetti';

interface MszShopShowcaseProps {
  userLevel?: number;
  onOpenShop: () => void;
  onProfileUpdated?: () => void;
}

export const MszShopShowcase: React.FC<MszShopShowcaseProps> = ({
  userLevel = 14,
  onOpenShop,
  onProfileUpdated
}) => {
  const [balance, setBalance] = useState<number>(getMszCoinsBalance());
  const [ownedIds, setOwnedIds] = useState<string[]>(getOwnedCharacterIds());
  const [ownedInstances, setOwnedInstances] = useState<OwnedCardInstance[]>(getOwnedCardInstances());
  const [equippedId, setEquippedId] = useState<string>(getEquippedCharacterId());
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { dailyLimit, state: dailyState } = getDailyMszCoinsState(userLevel);

  const refreshState = () => {
    setBalance(getMszCoinsBalance());
    setOwnedIds(getOwnedCharacterIds());
    setOwnedInstances(getOwnedCardInstances());
    setEquippedId(getEquippedCharacterId());
  };

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
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Filter showcase cards for the selected category
  const showcaseCharacters = selectedCatId === 'all'
    ? MSZ_CHARACTERS
    : MSZ_CHARACTERS.filter((c) => c.categoryId === selectedCatId);

  return (
    <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1426] via-[#101b33] to-[#070e1d] border border-[#f2ca50]/40 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      {/* Background glow orb */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Title, MSZ Coins HUD & Daily Limit Gauge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 border-b border-[#232a3a] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#19243d] border-2 border-[#f2ca50]/50 flex items-center justify-center text-[#ffd700] shadow-lg shadow-[#f2ca50]/15 shrink-0">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monetization_on
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50] bg-[#f2ca50]/15 px-2.5 py-0.5 rounded-full border border-[#f2ca50]/30">
                Écosystème MSZ Coins & Shop
              </span>
              <span className="text-[10px] text-[#38bdf8] font-mono">100 Ex. Limités / Carte</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-black text-white mt-0.5">
              Boutique des Icônes & Personnages Collectibles
            </h3>
            <p className="text-xs text-[#cbd5e1] mt-0.5">
              Chaque carte possède un numéro d'identité unique (1/100). Gagnez des MSZ Coins, collectionnez-les en 3D et négociez sur la bourse P2P.
            </p>
          </div>
        </div>

        {/* Balance & Daily Cap HUD */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-end bg-[#070e1d] border border-[#f2ca50]/50 px-4 py-2 rounded-2xl shadow-inner min-w-[150px]">
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

          <button
            type="button"
            onClick={onOpenShop}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] hover:to-[#ffe566] text-[#2c2000] font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#f2ca50]/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            <span className="hidden sm:inline">Ouvrir la Boutique</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Progressive Category Quick Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 relative z-10 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedCatId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedCatId === 'all'
              ? 'bg-[#1f2c48] text-[#ffe082] border border-[#f2ca50] shadow-md shadow-[#f2ca50]/15'
              : 'bg-[#0a101f] text-[#8391ac] border border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xs text-[#f2ca50]">stars</span>
          <span>Toutes</span>
          <span className="text-[10px] opacity-70">(8)</span>
        </button>

        {SHOP_CATEGORIES.map((cat) => {
          const isSelected = selectedCatId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1f2c48] text-[#ffe082] border border-[#f2ca50] shadow-md shadow-[#f2ca50]/15'
                  : 'bg-[#0a101f] text-[#8391ac] border border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xs" style={{ color: cat.accentColor }}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-70">({cat.startingPrice} MSZ)</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Highlight Info */}
      {selectedCatId === 1 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2847]/80 to-[#1e1b4b]/80 border border-cyan-400/40 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-cyan-400 text-lg">electric_bolt</span>
            <span className="text-cyan-200">
              <strong>Série 1 : Cyber Néon</strong> — Première catégorie commençant à <strong>50 MSZ Coins</strong> avec <strong>ÉCLAT</strong> & <strong>VOLT</strong> !
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#f2ca50] uppercase tracking-wider hidden sm:inline">
            Tirage Limité 100 ex. certifiés
          </span>
        </div>
      )}

      {/* 3D Cards Showcase Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center relative z-10">
        {showcaseCharacters.map((character) => {
          const instance = ownedInstances.find((inst) => inst.characterId === character.id);
          return (
            <MszCard3D
              key={character.id}
              character={character}
              isOwned={ownedIds.includes(character.id)}
              ownedInstance={instance}
              isEquipped={equippedId === character.id}
              userCoins={balance}
              onBuy={handleBuy}
              onEquip={handleEquip}
              onInspect={onOpenShop}
            />
          );
        })}
      </div>

      {/* Bottom Footer Info: P2P Market & How to earn coins */}
      <div className="pt-2 border-t border-[#232a3a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8391ac] font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#f2ca50]">Comment gagner des MSZ Coins ?</span>
          <span>&bull;</span>
          <span>Speed Match (+2 MSZ)</span>
          <span>&bull;</span>
          <span>Cursus (+1 MSZ)</span>
          <span>&bull;</span>
          <span>Dictée (+2 MSZ)</span>
          <span>&bull;</span>
          <span className="text-cyan-300">Plafond : {dailyLimit} MSZ/jour (Niveau {userLevel})</span>
        </div>

        <button
          type="button"
          onClick={onOpenShop}
          className="text-[#f2ca50] hover:text-[#ffe088] underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Accéder à la Bourse P2P & Vente de cartes</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* Toast */}
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
