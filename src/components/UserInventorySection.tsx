import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  type OwnedCardInstance
} from '../utils/mszCoinsManager';
import { MszCard3D } from './MszCard3D';
import { useAppTheme } from '../theme/ThemeContext';

interface UserInventorySectionProps {
  onOpenShop?: () => void;
  onProfileUpdated?: () => void;
}

export const UserInventorySection: React.FC<UserInventorySectionProps> = ({
  onOpenShop,
  onProfileUpdated
}) => {
  const { isDark } = useAppTheme();
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'transactions'>('cards');
  const [instances, setInstances] = useState<OwnedCardInstance[]>(() => getOwnedCardInstances());
  const [equippedId, setEquippedId] = useState<string>(() => getEquippedCharacterId());
  const [balance, setBalance] = useState<number>(() => getMszCoinsBalance());
  const [transactions, setTransactions] = useState<MszTransaction[]>(() => getTransactionHistory());

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
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
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
      <div className="p-4 sm:p-5 rounded-2xl luxury-card-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl luxury-btn-gold flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-2xl">style</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
              <span className={`font-bold uppercase tracking-widest ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
                Registre Officiel MSZ
              </span>
              <span aria-hidden="true" className="text-[#99907c]">·</span>
              <span className={isDark ? 'text-[#38bdf8]' : 'text-[#0369a1]'}>
                Tirages 1/100 Certifiés
              </span>
            </div>
            <h3 className={`font-serif text-lg sm:text-xl font-bold mt-0.5 ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}>
              Mon Inventaire de Cartes &amp; Transactions
            </h3>
            <p className={`text-xs ${isDark ? 'text-[#cbd5e1]' : 'text-[#57534e]'}`}>
              Consultez vos cartes acquises, leur matricule certifié et l&apos;historique complet de votre portefeuille.
            </p>
          </div>
        </div>

        {/* Stats Metrics */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-center sm:items-end px-3 py-1.5 rounded-xl luxury-hairline-panel">
            <span className="text-[9px] font-mono uppercase text-[#99907c]">Cartes</span>
            <span className={`font-mono text-base font-black tabular-nums ${isDark ? 'text-[#ffd700]' : 'text-[#8a640b]'}`}>
              {instances.length}{' '}
              <span className="text-xs text-[#99907c] font-normal">/ {MSZ_CHARACTERS.length}</span>
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end px-3 py-1.5 rounded-xl luxury-hairline-panel">
            <span className={`text-[9px] font-mono uppercase ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>Valeur</span>
            <span className={`font-mono text-base font-black tabular-nums ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>
              {portfolioEstimatedValue.toLocaleString()} <span className="text-xs font-normal">MSZ</span>
            </span>
          </div>

          {onOpenShop && (
            <button
              type="button"
              onClick={onOpenShop}
              className="px-3.5 py-2.5 rounded-xl luxury-btn-gold text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe088]"
              title="Acheter de nouvelles cartes dans la boutique"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span className="hidden sm:inline">Boutique</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: Cartes Acquises vs Historique des Transactions */}
      <div className={`flex items-center justify-between gap-2 border-b pb-2.5 flex-wrap ${isDark ? 'border-[#232a3a]' : 'border-[#e2d9cc]'}`}>
        <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Sections inventaire">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'cards'}
            onClick={() => setActiveSubTab('cards')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              activeSubTab === 'cards' ? 'luxury-btn-gold' : 'luxury-btn-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">style</span>
            <span>Mes Cartes ({instances.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'transactions'}
            onClick={() => setActiveSubTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
              activeSubTab === 'transactions' ? 'luxury-btn-gold' : 'luxury-btn-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            <span>Transactions ({transactions.length})</span>
          </button>
        </div>

        <div className={`flex items-center gap-1 text-xs font-mono font-bold tabular-nums ${isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'}`}>
          <span className="material-symbols-outlined text-sm text-[#f2ca50]">monetization_on</span>
          <span>Solde : {balance.toLocaleString()} MSZ</span>
        </div>
      </div>

      {/* SUB-TAB 1: CARTES ACQUISES */}
      {activeSubTab === 'cards' && (
        <div className="flex flex-col gap-3">
          {/* Controls: Search, Rarity Filter & Sort */}
          <div className="p-3 rounded-xl luxury-hairline-panel flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-60">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-sm text-[#99907c] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher carte, matricule..."
                aria-label="Rechercher une carte ou un matricule"
                className={`w-full rounded-lg pl-8 pr-2.5 py-1.5 text-xs border focus:border-[#f2ca50] focus:outline-none ${
                  isDark
                    ? 'bg-[#0a101f] border-[#2e3b55] text-white placeholder-[#78859e]'
                    : 'bg-white border-[#d6cebe] text-[#1c1917] placeholder-[#78716c]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              <label className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-[#99907c]">Rareté</span>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className={`rounded-lg px-2 py-1 text-xs font-mono border focus:border-[#f2ca50] focus:outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#0a101f] border-[#2e3b55] text-white'
                      : 'bg-white border-[#d6cebe] text-[#1c1917]'
                  }`}
                >
                  <option value="all">Toutes</option>
                  <option value="Commune">Commune</option>
                  <option value="Rare">Rare</option>
                  <option value="Épique">Épique</option>
                  <option value="Légendaire">Légendaire</option>
                  <option value="Mythique">Mythique</option>
                  <option value="Souveraine">Souveraine</option>
                </select>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-[#99907c]">Tri</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className={`rounded-lg px-2 py-1 text-xs font-mono border focus:border-[#f2ca50] focus:outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#0a101f] border-[#2e3b55] text-white'
                      : 'bg-white border-[#d6cebe] text-[#1c1917]'
                  }`}
                >
                  <option value="serial_asc">N° Série (1 → 100)</option>
                  <option value="serial_desc">N° Série (100 → 1)</option>
                  <option value="level_desc">Niveau (Décroissant)</option>
                  <option value="date_desc">Obtention Récente</option>
                </select>
              </label>
            </div>
          </div>

          {displayedCards.length === 0 ? (
            <div className="p-8 rounded-2xl luxury-hairline-panel border-dashed text-center flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-[#99907c]">inventory_2</span>
              <p className={`text-sm font-serif ${isDark ? 'text-[#dce2f8]' : 'text-[#1c1917]'}`}>
                Aucune carte ne correspond à ces critères
              </p>
              <p className="text-xs text-[#99907c]">
                Ajustez vos filtres ou explorez la boutique pour débloquer de nouveaux personnages.
              </p>
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
                    className={`p-4 rounded-2xl luxury-card-surface luxury-card-interactive flex flex-col justify-between gap-3 ${
                      isEquipped ? 'ring-1 ring-[#f2ca50]/70' : ''
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleInspect(character, instance)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#f2ca50]/50 shrink-0 bg-[#070e1d] shadow-md cursor-pointer group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                        title="Cliquer pour inspecter la carte en 3D (Recto / Verso)"
                        aria-label={`Inspecter ${character.name} en 3D`}
                      >
                        <img
                          src={character.image}
                          alt={character.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.dataset.fallbackApplied) return;
                            target.dataset.fallbackApplied = 'true';
                            target.src = '/assets/aistudio/VOLT.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-sm">3d_rotation</span>
                        </div>
                      </button>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                          <span className={`font-black tabular-nums ${isDark ? 'text-[#ffd700]' : 'text-[#8a640b]'}`}>
                            N° {instance.editionNumber}/{instance.maxSupply || 100}
                          </span>
                          {isFounder ? (
                            <>
                              <span aria-hidden="true" className="text-[#99907c]">·</span>
                              <span className="font-bold text-amber-400">1ère Édition</span>
                            </>
                          ) : isTopTen ? (
                            <>
                              <span aria-hidden="true" className="text-[#99907c]">·</span>
                              <span className={isDark ? 'text-cyan-300 font-bold' : 'text-cyan-700 font-bold'}>Top 10 Mint</span>
                            </>
                          ) : null}
                          <span aria-hidden="true" className="text-[#99907c]">·</span>
                          <span className="text-[#99907c] tabular-nums">Niv. {character.level}</span>
                        </div>

                        <h4 className={`font-serif text-base font-bold truncate mt-1 ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}>
                          {character.name}
                        </h4>
                        <span className={`text-[11px] font-mono truncate ${isDark ? 'text-[#38bdf8]' : 'text-[#0369a1]'}`}>
                          {character.element} · Série {character.categoryId}
                        </span>
                        <span className="text-[10px] font-mono text-[#99907c] truncate mt-0.5">
                          Matricule : <strong className={isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'}>{instance.serialCode}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Stats & Passive Preview */}
                    <div className="p-2.5 rounded-xl luxury-hairline-panel flex flex-col gap-1.5 text-[10px]">
                      <div className="grid grid-cols-4 gap-1.5 font-mono text-center tabular-nums">
                        <div className="p-1 rounded">
                          <span className="text-[9px] text-[#99907c] block">ÉLOC</span>
                          <span className={isDark ? 'text-cyan-300 font-bold' : 'text-cyan-700 font-bold'}>{character.stats.elocution}</span>
                        </div>
                        <div className="p-1 rounded">
                          <span className="text-[9px] text-[#99907c] block">MÉM</span>
                          <span className={isDark ? 'text-purple-300 font-bold' : 'text-purple-700 font-bold'}>{character.stats.memoire}</span>
                        </div>
                        <div className="p-1 rounded">
                          <span className="text-[9px] text-[#99907c] block">VIT</span>
                          <span className={isDark ? 'text-amber-300 font-bold' : 'text-amber-700 font-bold'}>{character.stats.vitesse}</span>
                        </div>
                        <div className="p-1 rounded">
                          <span className="text-[9px] text-[#99907c] block">MAÎT</span>
                          <span className={isDark ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-bold'}>{character.stats.maitrise}</span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 text-[10px] truncate ${isDark ? 'text-[#ffe082]' : 'text-[#785b24]'}`}>
                        <span className="material-symbols-outlined text-xs text-[#f2ca50] shrink-0">stars</span>
                        <span className="truncate">{character.passiveBonus}</span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className={`flex items-center justify-between pt-2 border-t text-xs ${isDark ? 'border-white/10' : 'border-[#e2d9cc]'}`}>
                      <span className="text-[10px] font-mono text-[#99907c]">
                        Obtenu le {new Date(instance.obtainedAt).toLocaleDateString('fr-FR')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInspect(character, instance)}
                          className="px-2.5 py-1 rounded-lg luxury-btn-sapphire text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                          title="Voir la carte en 3D avec son verso"
                        >
                          <span className="material-symbols-outlined text-xs">3d_rotation</span>
                          <span>3D</span>
                        </button>

                        {isEquipped ? (
                          <span className="px-2.5 py-1 rounded-lg luxury-btn-gold text-[10px] font-mono font-black flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            <span>Équipé</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEquip(character)}
                            className="px-2.5 py-1 rounded-lg luxury-btn-amber-soft text-[10px] font-mono font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
                          >
                            Équiper
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenSell(character, instance)}
                          className="px-2.5 py-1 rounded-lg luxury-btn-ruby text-[10px] font-mono font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
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

      {/* SUB-TAB 2: TRANSACTIONS */}
      {activeSubTab === 'transactions' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl luxury-hairline-panel flex items-center justify-between gap-2 text-xs overflow-x-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#99907c] px-1">Filtrer</span>
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
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] ${
                    txTypeFilter === tab.id ? 'luxury-btn-gold' : 'luxury-btn-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono text-[#99907c] shrink-0 tabular-nums">
              {filteredTransactions.length} opérations
            </span>
          </div>

          <div className={`p-4 rounded-2xl luxury-card-surface flex flex-col divide-y max-h-[460px] overflow-y-auto ${isDark ? 'divide-[#232a3a]' : 'divide-[#e2d9cc]'}`}>
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#99907c] font-mono">
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
                      <div className={`w-9 h-9 rounded-xl luxury-hairline-panel flex items-center justify-center shrink-0 ${iconColor}`}>
                        <span className="material-symbols-outlined text-lg">{iconName}</span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-medium truncate ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}>
                            {tx.description}
                          </span>
                          {tx.serialCode && (
                            <span className={`font-mono text-[10px] font-bold ${isDark ? 'text-[#ffd700]' : 'text-[#8a640b]'}`}>
                              · {tx.serialCode}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-[#99907c] font-mono">
                          {new Date(tx.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          · {tx.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className={`font-mono font-black text-sm tabular-nums ${
                          isGain ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : isDark ? 'text-rose-400' : 'text-rose-700'
                        }`}
                      >
                        {isGain ? `+${tx.amount}` : tx.amount} MSZ
                      </span>
                      <span className="text-[9px] font-mono text-[#99907c] uppercase">
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

      {/* 3D INSPECT MODAL */}
      {inspectedChar && inspectedInstance && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inspection 3D de ${inspectedChar.name}`}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => {
            setInspectedChar(null);
            setInspectedInstance(null);
          }}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl luxury-card-surface shadow-2xl flex flex-col items-center gap-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setInspectedChar(null);
                setInspectedInstance(null);
              }}
              aria-label="Fermer l'inspection 3D"
              className="absolute top-4 right-4 w-9 h-9 rounded-full luxury-btn-surface flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
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

      {/* SELL MODAL */}
      {sellModalChar && sellModalInstance && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vendre ${sellModalChar.name} sur la bourse P2P`}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => {
            setSellModalChar(null);
            setSellModalInstance(null);
          }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl luxury-card-surface shadow-2xl flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/10' : 'border-[#e2d9cc]'}`}>
              <h3 className={`font-serif text-lg font-bold flex items-center gap-2 ${isDark ? 'text-[#f3f4f6]' : 'text-[#1c1917]'}`}>
                <span className="material-symbols-outlined text-rose-400">sell</span>
                <span>Vendre « {sellModalChar.name} »</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSellModalChar(null);
                  setSellModalInstance(null);
                }}
                aria-label="Annuler la mise en vente"
                className="w-8 h-8 rounded-full luxury-btn-surface flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl luxury-hairline-panel flex items-center justify-between">
              <span className={`text-xs font-mono ${isDark ? 'text-[#d4c78f]' : 'text-[#785b24]'}`}>
                Numéro d&apos;identité transféré :
              </span>
              <span className={`text-xs font-mono font-black ${isDark ? 'text-[#ffd700]' : 'text-[#8a640b]'}`}>
                {sellModalInstance.serialCode}
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#d0c5af]' : 'text-[#57534e]'}`}>
              Définissez votre prix de vente en MSZ Coins. La carte sera mise en ligne avec son numéro de série certifié, et vous recevrez immédiatement 90% du montant à titre d&apos;avance.
            </p>

            <div className="flex flex-col gap-1.5 luxury-hairline-panel p-4 rounded-xl">
              <label htmlFor="msz-sell-price-input" className="text-xs font-mono text-[#99907c]">
                Prix demandé (MSZ Coins) :
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="msz-sell-price-input"
                  type="number"
                  min={10}
                  max={5000}
                  value={sellPriceInput}
                  onChange={(e) => setSellPriceInput(Math.max(10, parseInt(e.target.value, 10) || 10))}
                  className="rounded-xl px-3 py-2 text-base font-mono font-bold border focus:border-[#f2ca50] focus:outline-none w-36 tabular-nums"
                />
                <span className={`text-sm font-mono font-black ${isDark ? 'text-[#f2ca50]' : 'text-[#8a640b]'}`}>MSZ Coins</span>
              </div>
              <span className={`text-[11px] font-mono mt-1 tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
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
                className="px-4 py-2 rounded-xl luxury-btn-surface text-xs font-mono cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSell}
                className="px-5 py-2 rounded-xl luxury-btn-ruby font-mono font-bold text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Confirmer la Mise en Vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 inset-x-6 z-50 flex justify-center pointer-events-none">
          <div className="luxury-card-surface text-[#ffe082] px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            <span className="material-symbols-outlined text-base text-[#f2ca50]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
