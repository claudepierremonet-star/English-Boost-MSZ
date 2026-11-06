/**
 * MSZ Coins Economy & Shop Manager
 * 
 * Manages:
 * - MSZ Coins balance & transaction history
 * - Level-based daily earning cap (Level 1-10: 10/day, 11-20: 20/day ... up to 100)
 * - Anti-spam rule: preventing repeated coin earning on the same game on the same day
 * - Strict Limited Edition 1/100 numbering per character
 * - Purchasing, equipping, and selling collectible cards (P2P marketplace)
 * - LocalStorage & IndexedDB offline resilience
 */

import {
  MSZ_CHARACTERS,
  INITIAL_MARKET_LISTINGS,
  type MszCharacter,
  type MarketListing,
  type MszTransaction
} from '../data/mszShopData';

const STORAGE_KEYS = {
  BALANCE: 'eb_msz_coins_balance',
  DAILY_STATE: 'eb_msz_coins_daily_state',
  OWNED_CHARS: 'eb_msz_owned_characters',
  OWNED_INSTANCES: 'eb_msz_owned_card_instances',
  MINT_COUNTS: 'eb_msz_character_mint_counts',
  EQUIPPED_CHAR: 'eb_msz_equipped_character',
  MARKET_LISTINGS: 'eb_msz_market_listings',
  TRANSACTIONS: 'eb_msz_transactions'
};

export interface OwnedCardInstance {
  characterId: string;
  editionNumber: number; // 1 to 100
  maxSupply: number; // 100
  serialCode: string; // e.g. "MSZ-ECLAT-#001/100"
  obtainedAt: string;
  obtainedPrice: number;
}

export interface DailyMszCoinsState {
  date: string; // YYYY-MM-DD
  coinsEarnedToday: number;
  completedModuleIdsToday: string[];
}

/**
 * Format an edition number into a standardized 3-digit serial (e.g. 1 -> "001/100")
 */
export function formatEditionNumber(num: number, maxSupply: number = 100): string {
  return `${String(num).padStart(3, '0')}/${maxSupply}`;
}

/**
 * Format an edition number into simple slash notation (e.g. 12 -> "12/100")
 */
export function formatSimpleEdition(num: number, maxSupply: number = 100): string {
  return `${num}/${maxSupply}`;
}

/**
 * Generate full serial identity code
 */
export function generateSerialCode(prefix: string, editionNum: number, maxSupply: number = 100): string {
  return `${prefix}-#${formatEditionNumber(editionNum, maxSupply)}`;
}

/**
 * Asynchronously persist MSZ state (balance, card instances, equipped character) to Cloud Firestore
 */
function syncMszStateToCloud(balance: number, instances?: OwnedCardInstance[], equippedId?: string): void {
  try {
    import('../firebase/client')
      .then(({ updateUserProfile }) => {
        const payload: Record<string, unknown> = {
          mszCoinsBalance: balance
        };
        if (instances) {
          payload.ownedCardInstances = instances;
        }
        if (equippedId) {
          payload.equippedCharacterId = equippedId;
        }
        updateUserProfile(payload as any).catch((err) => {
          console.warn('MSZ cloud sync notice:', err);
        });
      })
      .catch(() => {});
  } catch {}
}

/**
 * Calculate the daily earning cap based on user level:
 * - Level 1 to 10: 10 MSZ Coins / day
 * - Level 11 to 20: 20 MSZ Coins / day
 * - Level 21 to 30: 30 MSZ Coins / day
 * ... up to Level 100: 100 MSZ Coins / day
 */
export function getDailyCoinLimit(level: number = 1): number {
  const safeLevel = Math.max(1, Math.min(100, Math.floor(level)));
  const tier = Math.ceil(safeLevel / 10);
  return Math.min(100, Math.max(10, tier * 10));
}

/**
 * Helper to get today's date in local ISO format (YYYY-MM-DD)
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retrieve current mint count for a character (capped at 100)
 */
export function getCharacterMintCount(characterId: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MINT_COUNTS);
    let counts: Record<string, number> = {};
    if (raw) {
      counts = JSON.parse(raw);
    }
    if (typeof counts[characterId] === 'number') {
      return counts[characterId];
    }
    const char = MSZ_CHARACTERS.find((c) => c.id === characterId);
    return char ? char.initialMintCount : 30;
  } catch {
    return 30;
  }
}

/**
 * Save updated character mint counts
 */
function saveCharacterMintCount(characterId: string, count: number): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MINT_COUNTS);
    const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
    counts[characterId] = Math.min(100, Math.max(0, count));
    localStorage.setItem(STORAGE_KEYS.MINT_COUNTS, JSON.stringify(counts));
  } catch (e) {
    console.warn('Failed to save mint counts', e);
  }
}

/**
 * Retrieve the current MSZ Coins balance
 * Defaults to 150 MSZ Coins welcome balance for new learners
 */
export function getMszCoinsBalance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.BALANCE, '150');
      return 150;
    }
    const val = parseInt(raw, 10);
    return isNaN(val) ? 150 : val;
  } catch {
    return 150;
  }
}

/**
 * Save updated MSZ Coins balance
 */
function saveMszCoinsBalance(balance: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BALANCE, Math.max(0, balance).toString());
    window.dispatchEvent(new CustomEvent('msz-coins-updated', { detail: { balance } }));
  } catch (e) {
    console.warn('Failed to save MSZ Coins balance', e);
  }
}

/**
 * Retrieve daily coins earning state, automatically resetting if it's a new day
 */
export function getDailyMszCoinsState(userLevel: number = 1): {
  state: DailyMszCoinsState;
  dailyLimit: number;
  remainingToday: number;
} {
  const today = getTodayDateString();
  const dailyLimit = getDailyCoinLimit(userLevel);

  let state: DailyMszCoinsState = {
    date: today,
    coinsEarnedToday: 0,
    completedModuleIdsToday: []
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_STATE);
    if (raw) {
      const parsed: DailyMszCoinsState = JSON.parse(raw);
      if (parsed.date === today) {
        state = {
          date: today,
          coinsEarnedToday: parsed.coinsEarnedToday || 0,
          completedModuleIdsToday: Array.isArray(parsed.completedModuleIdsToday)
            ? parsed.completedModuleIdsToday
            : []
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse daily coins state', e);
  }

  const remainingToday = Math.max(0, dailyLimit - state.coinsEarnedToday);
  return { state, dailyLimit, remainingToday };
}

/**
 * Save daily coins earning state
 */
function saveDailyMszCoinsState(state: DailyMszCoinsState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_STATE, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save daily coins state', e);
  }
}

/**
 * Award MSZ Coins upon completing an activity (game, cursus, dictation, etc.)
 * Strictly enforces:
 * 1. Daily earning limit based on level.
 * 2. Anti-spam check: prevents earning multiple times on the exact same game on the same day.
 */
export function awardMszCoins(
  source: 'game' | 'cursus' | 'speaking' | 'quiz' | 'daily_challenge',
  sourceId: string,
  baseCoins: number,
  userLevel: number = 1,
  sourceTitle?: string
): {
  awarded: number;
  currentBalance: number;
  reachedDailyLimit: boolean;
  alreadyPlayedToday: boolean;
  dailyLimit: number;
  earnedToday: number;
} {
  const { state, dailyLimit, remainingToday } = getDailyMszCoinsState(userLevel);

  // Anti-spam rule: "ce genre de coins, on ne peut pas les gagner chaque fois qu'on joue au même jeu"
  const isAlreadyCompletedToday = state.completedModuleIdsToday.includes(sourceId);

  if (isAlreadyCompletedToday) {
    return {
      awarded: 0,
      currentBalance: getMszCoinsBalance(),
      reachedDailyLimit: remainingToday <= 0,
      alreadyPlayedToday: true,
      dailyLimit,
      earnedToday: state.coinsEarnedToday
    };
  }

  // Calculate actual award respecting remaining daily budget
  const actualAward = Math.min(baseCoins, remainingToday);

  if (actualAward > 0) {
    const currentBalance = getMszCoinsBalance();
    const newBalance = currentBalance + actualAward;
    saveMszCoinsBalance(newBalance);

    state.coinsEarnedToday += actualAward;
    state.completedModuleIdsToday.push(sourceId);
    saveDailyMszCoinsState(state);

    // Record in transaction log
    addTransaction({
      type: source === 'cursus' ? 'reward_cursus' : 'reward_game',
      amount: actualAward,
      date: new Date().toISOString(),
      description: sourceTitle
        ? `Récompense : ${sourceTitle}`
        : `Gain d'activité (${source})`
    });

    return {
      awarded: actualAward,
      currentBalance: newBalance,
      reachedDailyLimit: state.coinsEarnedToday >= dailyLimit,
      alreadyPlayedToday: false,
      dailyLimit,
      earnedToday: state.coinsEarnedToday
    };
  }

  // Daily limit reached
  state.completedModuleIdsToday.push(sourceId);
  saveDailyMszCoinsState(state);

  return {
    awarded: 0,
    currentBalance: getMszCoinsBalance(),
    reachedDailyLimit: true,
    alreadyPlayedToday: false,
    dailyLimit,
    earnedToday: state.coinsEarnedToday
  };
}

/**
 * Retrieve list of owned card instances with their unique serial identity codes
 */
export function getOwnedCardInstances(): OwnedCardInstance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OWNED_INSTANCES);
    if (!raw) {
      // Default: User begins with ÉCLAT First Edition (#001/100)
      const initial: OwnedCardInstance[] = [
        {
          characterId: 'char_eclat',
          editionNumber: 1,
          maxSupply: 100,
          serialCode: 'MSZ-ECLAT-#001/100',
          obtainedAt: new Date().toISOString(),
          obtainedPrice: 50
        }
      ];
      localStorage.setItem(STORAGE_KEYS.OWNED_INSTANCES, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
  } catch {
    return [
      {
        characterId: 'char_eclat',
        editionNumber: 1,
        maxSupply: 100,
        serialCode: 'MSZ-ECLAT-#001/100',
        obtainedAt: new Date().toISOString(),
        obtainedPrice: 50
      }
    ];
  }
}

/**
 * Save owned card instances
 */
function saveOwnedCardInstances(instances: OwnedCardInstance[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OWNED_INSTANCES, JSON.stringify(instances));
    // Keep character IDs list in sync
    const ids = Array.from(new Set(instances.map((inst) => inst.characterId)));
    localStorage.setItem(STORAGE_KEYS.OWNED_CHARS, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('msz-inventory-updated', { detail: { instances, ownedIds: ids } }));
  } catch (e) {
    console.warn('Failed to save card instances', e);
  }
}

/**
 * Retrieve list of owned character IDs (for fast lookups)
 */
export function getOwnedCharacterIds(): string[] {
  const instances = getOwnedCardInstances();
  return Array.from(new Set(instances.map((i) => i.characterId)));
}

/**
 * Retrieve currently equipped character ID for user profile showcase
 */
export function getEquippedCharacterId(): string {
  try {
    const equipped = localStorage.getItem(STORAGE_KEYS.EQUIPPED_CHAR);
    return equipped || 'char_eclat';
  } catch {
    return 'char_eclat';
  }
}

/**
 * Equip a character as the active profile icon / avatar showcase
 */
export function equipCharacter(characterId: string): boolean {
  const owned = getOwnedCharacterIds();
  if (!owned.includes(characterId)) return false;

  try {
    localStorage.setItem(STORAGE_KEYS.EQUIPPED_CHAR, characterId);
    window.dispatchEvent(new CustomEvent('msz-equipped-updated', { detail: { characterId } }));
    syncMszStateToCloud(getMszCoinsBalance(), getOwnedCardInstances(), characterId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Buy a character from the Shop with strict 100-copies limit and sequential minting
 */
export function buyCharacterFromShop(characterId: string): {
  success: boolean;
  message: string;
  newBalance: number;
  character?: MszCharacter;
  mintedSerial?: string;
} {
  const character = MSZ_CHARACTERS.find((c) => c.id === characterId);
  if (!character) {
    return { success: false, message: 'Personnage introuvable.', newBalance: getMszCoinsBalance() };
  }

  const ownedInstances = getOwnedCardInstances();
  const alreadyOwned = ownedInstances.some((inst) => inst.characterId === characterId);
  if (alreadyOwned) {
    return {
      success: false,
      message: `Vous possédez déjà un exemplaire de « ${character.name} » dans votre collection.`,
      newBalance: getMszCoinsBalance()
    };
  }

  // Strict 100-copies limit check
  const currentMint = getCharacterMintCount(characterId);
  if (currentMint >= 100) {
    return {
      success: false,
      message: `Rupture de Stock : Les 100 exemplaires mondiaux de « ${character.name} » ont tous été frappés ! Retrouvez-le sur la Bourse P2P.`,
      newBalance: getMszCoinsBalance()
    };
  }

  const balance = getMszCoinsBalance();
  if (balance < character.price) {
    const missing = character.price - balance;
    return {
      success: false,
      message: `Fonds insuffisants. Il vous manque ${missing} MSZ Coins pour débloquer « ${character.name} ».`,
      newBalance: balance
    };
  }

  // Increment mint count
  const nextSerial = currentMint + 1;
  saveCharacterMintCount(characterId, nextSerial);

  // Mint new unique card instance
  const serialCode = generateSerialCode(character.serialPrefix, nextSerial, 100);
  const newInstance: OwnedCardInstance = {
    characterId,
    editionNumber: nextSerial,
    maxSupply: 100,
    serialCode,
    obtainedAt: new Date().toISOString(),
    obtainedPrice: character.price
  };

  ownedInstances.push(newInstance);
  saveOwnedCardInstances(ownedInstances);

  // Deduct balance
  const newBalance = balance - character.price;
  saveMszCoinsBalance(newBalance);

  // Sync to Firestore user profile in background
  syncMszStateToCloud(newBalance, ownedInstances);

  // Automatically equip if first character purchased
  if (!localStorage.getItem(STORAGE_KEYS.EQUIPPED_CHAR)) {
    equipCharacter(characterId);
  }

  // Log transaction with exact serial code
  addTransaction({
    type: 'buy_shop',
    characterId,
    characterName: character.name,
    serialCode,
    amount: -character.price,
    date: new Date().toISOString(),
    description: `Achat Boutique : « ${character.name} » N° ${nextSerial}/100 (${serialCode})`
  });

  return {
    success: true,
    message: `Félicitations ! Vous venez de frapper « ${character.name} » N° ${nextSerial}/100 (${serialCode}) !`,
    newBalance,
    character,
    mintedSerial: serialCode
  };
}

/**
 * Retrieve Marketplace Listings
 */
export function getMarketplaceListings(): MarketListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MARKET_LISTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MARKET_LISTINGS, JSON.stringify(INITIAL_MARKET_LISTINGS));
      return INITIAL_MARKET_LISTINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MARKET_LISTINGS;
  } catch {
    return INITIAL_MARKET_LISTINGS;
  }
}

/**
 * Save Marketplace Listings
 */
function saveMarketplaceListings(listings: MarketListing[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MARKET_LISTINGS, JSON.stringify(listings));
    window.dispatchEvent(new CustomEvent('msz-market-updated', { detail: { listings } }));
  } catch (e) {
    console.warn('Failed to save marketplace listings', e);
  }
}

/**
 * Buy a character listed on the P2P Marketplace
 */
export function buyMarketListing(listingId: string): {
  success: boolean;
  message: string;
  newBalance: number;
} {
  const listings = getMarketplaceListings();
  const listingIdx = listings.findIndex((l) => l.id === listingId);

  if (listingIdx === -1) {
    return { success: false, message: 'Offre expirée ou introuvable sur la bourse.', newBalance: getMszCoinsBalance() };
  }

  const listing = listings[listingIdx];
  const character = MSZ_CHARACTERS.find((c) => c.id === listing.characterId);
  const charName = character ? character.name : 'Carte Inconnue';

  const ownedInstances = getOwnedCardInstances();
  if (ownedInstances.some((inst) => inst.characterId === listing.characterId)) {
    return { success: false, message: `Vous possédez déjà un exemplaire de « ${charName} ».`, newBalance: getMszCoinsBalance() };
  }

  const balance = getMszCoinsBalance();
  if (balance < listing.price) {
    const missing = listing.price - balance;
    return {
      success: false,
      message: `MSZ Coins insuffisants. Il vous manque ${missing} coins pour conclure cette transaction.`,
      newBalance: balance
    };
  }

  // Deduct coins
  const newBalance = balance - listing.price;
  saveMszCoinsBalance(newBalance);

  // Add card instance with the exact seller's serial number!
  const newInstance: OwnedCardInstance = {
    characterId: listing.characterId,
    editionNumber: listing.editionNumber,
    maxSupply: listing.maxSupply || 100,
    serialCode: listing.serialNumber,
    obtainedAt: new Date().toISOString(),
    obtainedPrice: listing.price
  };

  ownedInstances.push(newInstance);
  saveOwnedCardInstances(ownedInstances);
  syncMszStateToCloud(newBalance, ownedInstances);

  // Remove listing from marketplace
  listings.splice(listingIdx, 1);
  saveMarketplaceListings(listings);

  // Add transaction
  addTransaction({
    type: 'buy_market',
    characterId: listing.characterId,
    characterName: charName,
    serialCode: listing.serialNumber,
    amount: -listing.price,
    date: new Date().toISOString(),
    description: `Achat Bourse P2P : « ${charName} » de ${listing.sellerName} (${listing.serialNumber})`
  });

  return {
    success: true,
    message: `Transaction réussie ! « ${charName} » (${listing.serialNumber}) rejoint votre collection.`,
    newBalance
  };
}

/**
 * Sell an owned character onto the P2P Marketplace
 */
export function sellCharacterOnMarketplace(
  characterId: string,
  priceInCoins: number,
  sellerName: string = 'Lord Chesterfield'
): {
  success: boolean;
  message: string;
} {
  const ownedInstances = getOwnedCardInstances();
  const instanceIndex = ownedInstances.findIndex((inst) => inst.characterId === characterId);

  if (instanceIndex === -1) {
    return { success: false, message: 'Vous ne possédez pas ce personnage.' };
  }

  if (ownedInstances.length <= 1) {
    return { success: false, message: 'Vous devez conserver au moins un personnage dans votre collection.' };
  }

  const soldInstance = ownedInstances[instanceIndex];
  const character = MSZ_CHARACTERS.find((c) => c.id === characterId);
  const charName = character ? character.name : 'Personnage';

  // Remove that specific instance
  ownedInstances.splice(instanceIndex, 1);
  saveOwnedCardInstances(ownedInstances);

  // If currently equipped, re-equip the first remaining card
  if (getEquippedCharacterId() === characterId) {
    equipCharacter(ownedInstances[0].characterId);
  }

  // Create new listing on P2P market with this exact numbered edition!
  const listings = getMarketplaceListings();
  const newListing: MarketListing = {
    id: `mkt_user_${Date.now()}`,
    characterId,
    sellerUid: 'current_user',
    sellerName,
    price: Math.max(10, Math.floor(priceInCoins)),
    listedAt: 'À l’instant',
    serialNumber: soldInstance.serialCode,
    editionNumber: soldInstance.editionNumber,
    maxSupply: soldInstance.maxSupply,
    condition: soldInstance.editionNumber <= 10 ? 'Holo First Edition' : 'Mint / Neuf'
  };

  listings.unshift(newListing);
  saveMarketplaceListings(listings);

  // Credit 90% of price immediately as market advance
  const coinsGained = Math.max(10, Math.floor(priceInCoins * 0.9));
  const newBalance = getMszCoinsBalance() + coinsGained;
  saveMszCoinsBalance(newBalance);
  syncMszStateToCloud(newBalance, ownedInstances);

  addTransaction({
    type: 'sell_market',
    characterId,
    characterName: charName,
    serialCode: soldInstance.serialCode,
    amount: coinsGained,
    date: new Date().toISOString(),
    description: `Vente sur la Bourse P2P : « ${charName} » (${soldInstance.serialCode})`
  });

  return {
    success: true,
    message: `« ${charName} » (${soldInstance.serialCode}) mis en vente ! Avance de ${coinsGained} MSZ Coins créditée.`
  };
}

/**
 * Retrieve transaction history
 */
export function getTransactionHistory(): MszTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const initial: MszTransaction[] = [
        {
          id: 'tx_welcome',
          type: 'reward_game',
          amount: 150,
          date: new Date(Date.now() - 3600000 * 3).toISOString(),
          description: 'Bonus de bienvenue : Initialisation Portefeuille MSZ Coins'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Log a new transaction
 */
function addTransaction(tx: Omit<MszTransaction, 'id'>): void {
  try {
    const list = getTransactionHistory();
    const newTx: MszTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to record transaction', e);
  }
}
