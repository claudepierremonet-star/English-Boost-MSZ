import React, { useState, useEffect, useMemo } from 'react';
import {
  MSZ_CHARACTERS,
  type MszCharacter,
  type MszTransaction
} from '../data/mszShopData';
import {
  getOwnedCardInstances,
  getEquippedCharacterId,
  getMszCoinsBalance,
  getTransactionHistory,
  equipCharacter,
  sellCharacterOnMarketplace,
  formatEditionNumber,
  type OwnedCardInstance
} from '../utils/mszCoinsManager';
import { MszCard3D } from './MszCard3D';

interface UserInventorySectionProps {
  onOpenShop?: () => void;
  onProfileUpdated?: () => void;
}

export const UserInventorySection: React.FC<UserInventorySectionProps> = ({
  onOpenShop,
  onProfileUpdated
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'transactions'>('cards');
  const [instances, setInstances] = useState<OwnedCardInstance[]>(getOwnedCardInstances());
  const [equippedId, setEquippedId] = useState<string>(getEquippedCharacterId());
  const [balance, setBalance] = useState<number>(getMszCoinsBalance());
  const [transactions, setTransactions] = useState<MszTransaction[]>(getTransactionHistory());

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'serial_asc' | 'serial_desc' | 'level_desc' | 'date_desc'>('serial_asc');

  // Interactive Modals
  const [inspectedChar, setInspectedChar] = useState<MszCharacter | null>(null);
  const [inspectedInstance, setInspectedInstance] = useState<OwnedCardInstance | null>(null);
  const [sellModalChar, setSellModalChar] = useState<MszCharacter | null>(null);
  const [sellModalInstance, setSellModalInstance] = useState<OwnedCardInstance | null>(null);
  const [sellPriceInput, setSellPriceInput] = useState<number>(75);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshState = () => {
    setInstances(getOwnedCardInstances());
    setEquippedId(getEquippedCharacterId());
    setBalance(getMszCoinsBalance());
    setTransactions(getTransactionHistory());
  };

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    window.addEventListener('msz-inventory-updated', handleUpdate);
    window.addEventListener('msz-coins-updated', handleUpdate);
    window.addEventListener('msz-equipped-updated', handleUpdate);
    window.addEventListener('msz-market-updated', handleUpdate);

    return () => {
      window.removeEventListener('msz-inventory-updated', handleUpdate);
      window.removeEventListener('msz-coins-updated', handleUpdate);
      window.removeEventListener('msz-equipped-updated', handleUpdate);
      window.removeEventListener('msz-market-updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mapped owned cards with their metadata
  const cardItems = useMemo(() => {
    return instances
      .map((inst) => {
        const char = MSZ_CHARACTERS.find((c) => c.id === inst.characterId);
        return {
          instance: inst,
          character: char
        };
      })
      .filter((item): item is { instance: OwnedCardInstance; character: MszCharacter } => Boolean(item.character));
  }, [instances]);

  // Filtered and Sorted Cards
  const displayedCards = useMemo(() => {
    return cardItems
      .filter(({ character, instance }) => {
        if (rarityFilter !== 'all' && character.rarity !== rarityFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = character.name.toLowerCase().includes(q);
          const matchCat = character.categoryName.toLowerCase().includes(q);
          const matchSerial = instance.serialCode.toLowerCase().includes(q);
          return matchName || matchCat || matchSerial;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'serial_asc') {
          return a.instance.editionNumber - b.instance.editionNumber;
        }
        if (sortBy === 'serial_desc') {
          return b.instance.editionNumber - a.instance.editionNumber;
        }
        if (sortBy === 'level_desc') {
          return b.character.level - a.character.level;
        }
        if (sortBy === 'date_desc') {
          return new Date(b.instance.obtainedAt).getTime() - new Date(a.instance.obtainedAt).getTime();
        }
        return 0;
      });
  }, [cardItems, rarityFilter, searchQuery, sortBy]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (txTypeFilter === 'all') return true;
      if (txTypeFilter === 'rewards') return tx.type === 'reward_game' || tx.type === 'reward_cursus';
      if (txTypeFilter === 'shop') return tx.type === 'buy_shop';
      if (txTypeFilter === 'market') return tx.type === 'buy_market' || tx.type === 'sell_market';
      return true;
    });
  }, [transactions, txTypeFilter]);

  // Total Portfolio Estimated Value
  const portfolioEstimatedValue = useMemo(() => {
    return cardItems.reduce((acc, curr) => acc + curr.character.price, 0);
  }, [cardItems]);

  // Equip handler
  const handleEquip = (char: MszCharacter) => {
    const ok = equipCharacter(char.id);
    if (ok) {
      refreshState();
      onProfileUpdated?.();
      showToast(`« ${char.name} » est maintenant votre icône active !`);
    }
  };

  // Open sell modal
  const handleOpenSell = (char: MszCharacter, inst: OwnedCardInstance) => {
    setSellModalChar(char);
    setSellModalInstance(inst);
    setSellPriceInput(Math.max(20, Math.floor(char.price * 0.9)));
  };

  // Confirm sell on P2P marketplace
  const handleConfirmSell = () => {
    if (!sellModalChar || !sellModalInstance) return;
    const res = sellCharacterOnMarketplace(sellModalChar.id, sellPriceInput);
    if (res.success) {
      refreshState();
      onProfileUpdated?.();
      showToast(res.message);
      setSellModalChar(null);
      setSellModalInstance(null);
    } else {
      showToast(res.message);
    }
  };

  // Inspect 3D card
  const handleInspect = (char: MszCharacter, inst: OwnedCardInstance) => {
    setInspectedChar(char);
    setInspectedInstance(inst);
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* Portfolio Header HUD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121c32] via-[#1a1236] to-[#0d1629] border border-[#f2ca50]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f2ca50] to-[#b4830c] text-[#2c1d00] flex items-center justify-center font-bold shadow-lg shadow-[#f2ca50]/20 shrink-0">
            <span className="material-symbols-outlined text-2xl">style</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#f2ca50] font-bold uppercase tracking-widest bg-[#f2ca50]/15 px-2 py-0.5 rounded-full border border-[#f2ca50]/30">
                REGISTRE OFFICIEL MSZ
              </span>
              <span className="text-[10px] font-mono text-[#38bdf8]">
                Tirages 1/100 Certifiés
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
              Mon Inventaire de Cartes & Transactions
            </h3>
            <p className="text-xs text-[#cbd5e1]">
              Consultez vos cartes acquises, leur numéro d'identité officiel et l'historique complet de votre portefeuille.
            </p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-center sm:items-end px-3 py-1.5 rounded-xl bg-[#070e1d] border border-white/10">
            <span className="text-[9px] font-mono uppercase text-[#8391ac]">Cartes Détenues</span>
            <span className="font-mono text-base font-black text-[#ffd700]">
              {instances.length} <span className="text-xs text-[#8391ac] font-normal">/ 8</span>
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end px-3 py-1.5 rounded-xl bg-[#070e1d] border border-[#f2ca50]/40">
            <span className="text-[9px] font-mono uppercase text-[#f2ca50]">Valeur Estimée</span>
            <span className="font-mono text-base font-black text-[#f2ca50]">
              {portfolioEstimatedValue} <span className="text-xs font-normal">MSZ</span>
            </span>
          </div>

          {onOpenShop && (
            <button
              type="button"
              onClick={onOpenShop}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#ffd700] hover:from-[#ffe088] text-[#2c2000] text-xs font-mono font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
              title="Acheter de nouvelles cartes dans la boutique"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span className="hidden sm:inline">Boutique</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: Cartes Acquises vs Historique des Transactions */}
      <div className="flex items-center justify-between gap-2 border-b border-[#232a3a] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('cards')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'cards'
                ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                : 'bg-[#151f33] text-[#8391ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">style</span>
            <span>Mes Cartes Acquises ({instances.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'transactions'
                ? 'bg-[#f2ca50] text-[#0c1322] shadow-md shadow-[#f2ca50]/20'
                : 'bg-[#151f33] text-[#8391ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            <span>Historique des Transactions ({transactions.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#d4c78f]">
          <span className="material-symbols-outlined text-xs text-[#f2ca50]">monetization_on</span>
          <span>Solde : {balance} MSZ</span>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SUB-TAB 1: CARTES ACQUISES (WITH UNIQUE SERIAL NUMBER 1/100) */}
      {/* ================================================================ */}
      {activeSubTab === 'cards' && (
        <div className="flex flex-col gap-3">
          {/* Controls: Search, Rarity Filter & Sort */}
          <div className="p-3 rounded-xl bg-[#121929] border border-[#232a3a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-sm text-[#8391ac]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher carte, matricule..."
                className="w-full bg-[#0a101f] border border-[#2e3b55] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-[#f2ca50] focus:outline-none"
              />
            </div>

            {/* Rarity & Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-mono text-[#8391ac]">Rareté :</span>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="bg-[#0a101f] border border-[#2e3b55] rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-[#f2ca50] focus:outline-none"
                >
                  <option value="all">Toutes</option>
                  <option value="Commune">Commune</option>
                  <option value="Rare">Rare</option>
                  <option value="Épique">Épique</option>
                  <option value="Légendaire">Légendaire</option>
                  <option value="Mythique">Mythique</option>
                  <option value="Souveraine">Souveraine</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-mono text-[#8391ac]">Tri :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#0a101f] border border-[#2e3b55] rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-[#f2ca50] focus:outline-none"
                >
                  <option value="serial_asc">N° Série (1 → 100)</option>
                  <option value="serial_desc">N° Série (100 → 1)</option>
                  <option value="level_desc">Niveau (Décroissant)</option>
                  <option value="date_desc">Obtention Récente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards List / Grid */}
          {displayedCards.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121929] border border-dashed border-[#232a3a] text-center flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-[#8391ac]">inventory_2</span>
              <p className="text-sm font-serif text-[#dce2f8]">Aucune carte ne correspond à ces critères</p>
              <p className="text-xs text-[#8391ac]">Ajustez vos filtres ou explorez la boutique pour débloquer de nouveaux personnages.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {displayedCards.map(({ character, instance }) => {
                const isEquipped = equippedId === character.id;
                const isTopTen = instance.editionNumber <= 10;
                const isFounder = instance.editionNumber === 1;

                return (
                  <div
                    key={`${character.id}-${instance.editionNumber}`}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isEquipped
                        ? 'bg-gradient-to-br from-[#1c273c] to-[#121c2e] border-[#ffd700] ring-1 ring-[#ffd700]/50 shadow-lg shadow-[#ffd700]/10'
                        : 'bg-[#121929] border-[#232a3a] hover:border-[#f2ca50]/50'
                    }`}
                  >
                    {/* Top Row: Artwork, Name, Serial Number Badge */}
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => handleInspect(character, instance)}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white/20 shrink-0 bg-[#070e1d] shadow-md cursor-pointer group relative"
                        title="Cliquer pour inspecter la carte en 3D (Recto / Verso)"
                      >
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/aistudio/VOLT.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-sm">3d_rotation</span>
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        {/* Serial Number & Edition Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400/25 to-yellow-300/25 text-[#ffd700] border border-[#f2ca50]/50 font-mono text-[10px] font-black tracking-wide shadow-sm">
                            N° {instance.editionNumber}/{instance.maxSupply || 100}
                          </span>

                          {isFounder ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 border border-amber-300/60 font-mono text-[9px] font-black uppercase">
                              ★ 1ère ÉDITION
                            </span>
                          ) : isTopTen ? (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-mono text-[9px] font-bold">
                              TOP 10 MINT
                            </span>
                          ) : null}

                          <span className="text-[9px] font-mono text-[#8391ac] px-1.5 py-0.2 rounded bg-[#070e1d]">
                            Niv. {character.level}
                          </span>
                        </div>

                        {/* Character Name & Element */}
                        <h4 className="font-serif text-base font-bold text-white truncate mt-1">
                          {character.name}
                        </h4>
                        <span className="text-[10px] text-[#38bdf8] font-mono truncate">
                          {character.element} &bull; Série {character.categoryId}
                        </span>

                        {/* Full Serial Code */}
                        <span className="text-[9px] font-mono text-[#8391ac] truncate mt-0.5">
                          Matricule : <strong className="text-[#d4c78f]">{instance.serialCode}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Stats & Passive Preview */}
                    <div className="p-2 rounded-xl bg-[#070e1d]/80 border border-white/5 flex flex-col gap-1.5 text-[10px]">
                      <div className="grid grid-cols-4 gap-1 font-mono text-center">
                        <div className="p-1 rounded bg-[#101726]">
                          <span className="text-[8px] text-[#8391ac] block">ÉLOC</span>
                          <span className="text-cyan-400 font-bold">{character.stats.elocution}</span>
                        </div>
                        <div className="p-1 rounded bg-[#101726]">
                          <span className="text-[8px] text-[#8391ac] block">MÉM</span>
                          <span className="text-purple-400 font-bold">{character.stats.memoire}</span>
                        </div>
                        <div className="p-1 rounded bg-[#101726]">
                          <span className="text-[8px] text-[#8391ac] block">VIT</span>
                          <span className="text-amber-400 font-bold">{character.stats.vitesse}</span>
                        </div>
                        <div className="p-1 rounded bg-[#101726]">
                          <span className="text-[8px] text-[#8391ac] block">MAÎT</span>
                          <span className="text-emerald-400 font-bold">{character.stats.maitrise}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[9px] text-[#ffe082] truncate">
                        <span className="material-symbols-outlined text-xs text-[#f2ca50] shrink-0">stars</span>
                        <span className="truncate">{character.passiveBonus}</span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                      <span className="text-[9px] font-mono text-[#8391ac]">
                        Obtenu le {new Date(instance.obtainedAt).toLocaleDateString('fr-FR')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInspect(character, instance)}
                          className="px-2 py-1 rounded-lg bg-[#19243d] hover:bg-[#25355a] text-[#dce2f8] text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Voir la carte en 3D avec son verso"
                        >
                          <span className="material-symbols-outlined text-xs">3d_rotation</span>
                          <span>3D</span>
                        </button>

                        {isEquipped ? (
                          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[10px] font-mono font-black flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Équipé
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEquip(character)}
                            className="px-2.5 py-1 rounded-lg bg-[#1e293b] hover:bg-[#f2ca50] text-[#ffe082] hover:text-[#0c1322] border border-[#f2ca50]/40 text-[10px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            Équiper
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenSell(character, instance)}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Vendre sur la bourse P2P"
                        >
                          Vendre
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* SUB-TAB 2: HISTORIQUE DES TRANSACTIONS (AUDIT LEDGER) */}
      {/* ================================================================ */}
      {activeSubTab === 'transactions' && (
        <div className="flex flex-col gap-3">
          {/* Filter Pills for Transactions */}
          <div className="p-3 rounded-xl bg-[#121929] border border-[#232a3a] flex items-center justify-between gap-2 text-xs overflow-x-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#8391ac] px-1">Filtrer :</span>
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'rewards', label: 'Gains Jeux & Cursus' },
                { id: 'shop', label: 'Achats Boutique' },
                { id: 'market', label: 'Bourse P2P' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTxTypeFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    txTypeFilter === tab.id
                      ? 'bg-[#f2ca50] text-[#0c1322] shadow-sm'
                      : 'bg-[#0a101f] text-[#8391ac] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono text-[#8391ac] shrink-0">
              {filteredTransactions.length} enregistrements
            </span>
          </div>

          {/* Transactions List */}
          <div className="p-4 rounded-2xl bg-[#121929] border border-[#232a3a] shadow-lg flex flex-col divide-y divide-[#232a3a] max-h-[460px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8391ac] font-mono">
                Aucune transaction enregistrée dans cette catégorie.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isGain = tx.amount > 0;
                let iconName = 'monetization_on';
                let iconColor = 'text-emerald-400';

                if (tx.type === 'buy_shop') {
                  iconName = 'storefront';
                  iconColor = 'text-rose-400';
                } else if (tx.type === 'buy_market') {
                  iconName = 'shopping_bag';
                  iconColor = 'text-purple-400';
                } else if (tx.type === 'sell_market') {
                  iconName = 'sell';
                  iconColor = 'text-emerald-400';
                } else if (tx.type === 'reward_game') {
                  iconName = 'sports_esports';
                  iconColor = 'text-amber-400';
                } else if (tx.type === 'reward_cursus') {
                  iconName = 'school';
                  iconColor = 'text-cyan-400';
                }

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl bg-[#0a101f] border border-white/5 flex items-center justify-center shrink-0 ${iconColor}`}>
                        <span className="material-symbols-outlined text-lg">{iconName}</span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-white font-medium truncate">
                            {tx.description}
                          </span>
                          {tx.serialCode && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffd700] border border-amber-400/40 font-mono text-[9px] font-bold">
                              {tx.serialCode}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-[#8391ac] font-mono">
                          {new Date(tx.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} &bull; {tx.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className={`font-mono font-black text-sm ${
                          isGain ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isGain ? `+${tx.amount}` : tx.amount} MSZ
                      </span>
                      <span className="text-[8px] font-mono text-[#8391ac] uppercase">
                        {isGain ? 'Crédit' : 'Débit'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 3D INSPECT MODAL */}
      {/* ================================================================ */}
      {inspectedChar && inspectedInstance && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setInspectedChar(null);
            setInspectedInstance(null);
          }}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl bg-[#0c1426] border-2 border-[#f2ca50]/70 shadow-2xl flex flex-col items-center gap-5 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setInspectedChar(null);
                setInspectedInstance(null);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#19243d] flex items-center justify-center text-[#8391ac] hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <MszCard3D
              character={inspectedChar}
              isOwned={true}
              ownedInstance={inspectedInstance}
              isEquipped={equippedId === inspectedChar.id}
              userCoins={balance}
              onEquip={handleEquip}
              onSell={() => {
                handleOpenSell(inspectedChar, inspectedInstance);
                setInspectedChar(null);
                setInspectedInstance(null);
              }}
            />
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SELL MODAL (P2P TRANSFER WITH SERIAL NUMBER) */}
      {/* ================================================================ */}
      {sellModalChar && sellModalInstance && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setSellModalChar(null);
            setSellModalInstance(null);
          }}
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
                onClick={() => {
                  setSellModalChar(null);
                  setSellModalInstance(null);
                }}
                className="text-[#8391ac] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#070e1d] border border-[#ffd700]/30 flex items-center justify-between">
              <span className="text-xs font-mono text-[#d4c78f]">Numéro d'Identité Transféré :</span>
              <span className="text-xs font-mono font-black text-[#ffd700]">
                {sellModalInstance.serialCode}
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
                onClick={() => {
                  setSellModalChar(null);
                  setSellModalInstance(null);
                }}
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
