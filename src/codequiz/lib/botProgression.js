// Economia e estilo individual dos bots do sistema.
//
// Cada bot começa exatamente como um jogador novo (nível 1, 20 moedas e itens padrão)
// e gasta esse crédito inicial no seu emoji de assinatura, o que já o diferencia dos
// outros. Daí em diante só evolui com o que ganha jogando: resgata as etapas do passe
// quando cumpre as metas e compra itens da loja no seu próprio estilo. Nunca tem item
// acima do nível dele (raridade liberada por nível; itens do passe só pelo passe).
//
// Tudo aqui é puro e determinístico: recebe a linha user_stats do bot e devolve a
// próxima versão (moedas, XP, etapas resgatadas e inventário).
import { SHOP_ITEMS, getShopItem } from './shop';
import { applyEvolutionPassRewards, defaultProgress, mergeProgressWithRemoteStats } from './progress';
import { getProgressTotalXp } from './utils';

export const BOT_STARTING_COINS = defaultProgress().coins;
export const BOT_ECONOMY_VERSION = 2;
// Bots antigos nasciam com 600 moedas (e 600 em itens); jogador nasce com 20.
const LEGACY_BOT_SEED_COINS = 600;

// Nível mínimo do bot para ter cada raridade comprada na loja. Segue o ritmo de um
// jogador comum (moedas ganhas por nível), para o visual acompanhar a progressão.
export const BOT_ITEM_MIN_LEVEL_BY_RARITY = Object.freeze({
  common: 1,
  uncommon: 3,
  rare: 5,
  epic: 8,
  legendary: 12
});

const DEFAULT_EQUIPPED = Object.freeze({
  frame: 'frame_default',
  background: 'bg_default',
  emoji: 'emoji_profile'
});
const DEFAULT_ITEM_IDS = Object.freeze(Object.values(DEFAULT_EQUIPPED));
const ITEM_TYPES = Object.freeze(['frame', 'background', 'emoji']);
const MAX_PURCHASES_PER_SESSION = 2;
const MAX_PASS_CLAIM_ROUNDS = 24;

// Estilo de cada bot:
// - signatureEmoji: primeira compra (com o crédito inicial) e marca registrada.
// - spending: impulsivo (compra assim que dá, inclusive barato fora da lista),
//   poupador (só compra a próxima peça da lista e junta moedas até conseguir),
//   equilibrado (compra a peça da lista que couber no bolso), colecionador (enche a
//   coleção de emojis).
// - favorites: peças desejadas em ordem de vontade (geralmente da mais barata para a
//   mais cara); o bot equipa a mais avançada que tiver de cada tipo.
// - keepSignatureEmoji: nunca troca o emoji de assinatura.
export const SYSTEM_BOT_STYLES = Object.freeze({
  bot_sys_codequiz_prime: {
    label: 'Provocador azul',
    signatureEmoji: 'emoji_common_smart',
    spending: 'impulsivo',
    reserveCoins: 0,
    favorites: [
      'frame_slate', 'frame_ice', 'bg_ocean', 'emoji_animal_fox', 'bg_turquoise',
      'frame_storm', 'emoji_figurative_imp', 'bg_kanji_storm', 'frame_void', 'emoji_ninja'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_orbita: {
    label: 'Analítico espacial',
    signatureEmoji: 'emoji_common_focus',
    spending: 'poupador',
    reserveCoins: 10,
    favorites: [
      'bg_violet', 'emoji_alien', 'frame_neonwave', 'bg_aurora', 'emoji_object_crystal',
      'frame_arcane', 'frame_void', 'frame_aurora', 'bg_aurora_prismatica'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_zefira: {
    label: 'Analítica elegante',
    signatureEmoji: 'emoji_common_think',
    spending: 'equilibrado',
    reserveCoins: 0,
    favorites: [
      'frame_mint', 'bg_turquoise', 'emoji_animal_cat', 'bg_ocean', 'frame_ice',
      'emoji_object_key', 'bg_aurora', 'frame_sakura', 'emoji_prof_teacher'
    ],
    keepSignatureEmoji: true
  },
  bot_sys_codequiz_sopro: {
    label: 'Calma e suave',
    signatureEmoji: 'emoji_common_happy',
    spending: 'poupador',
    reserveCoins: 15,
    favorites: [
      'bg_rose', 'frame_sunrise', 'emoji_animal_panda', 'bg_dawn', 'emoji_figurative_unicorn',
      'bg_sunset', 'frame_sakura'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_lua9: {
    label: 'Festeira colecionadora',
    signatureEmoji: 'emoji_common_party',
    spending: 'colecionador',
    reserveCoins: 0,
    favorites: [
      'emoji_animal_penguin', 'emoji_animal_koala', 'bg_violet', 'frame_neonwave',
      'emoji_figurative_unicorn', 'emoji_crown', 'bg_sunset'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_thiagoara: {
    label: 'Provocador fogo',
    signatureEmoji: 'emoji_common_cool',
    spending: 'impulsivo',
    reserveCoins: 0,
    favorites: [
      'frame_amber', 'emoji_animal_lion', 'frame_ruby', 'bg_voltage', 'frame_fire',
      'emoji_object_sword', 'bg_tribal_ember', 'frame_phoenix', 'emoji_object_trophy'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_bdevonly: {
    label: 'Dev minimalista',
    signatureEmoji: 'emoji_common_nerd',
    spending: 'poupador',
    reserveCoins: 20,
    favorites: [
      'bg_graphite', 'frame_slate', 'bg_terminal', 'emoji_figurative_robot', 'frame_lime',
      'emoji_object_key', 'emoji_prof_dev', 'bg_graphite_prime'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_flakael: {
    label: 'Provocador sombrio',
    signatureEmoji: 'emoji_common_wink',
    spending: 'impulsivo',
    reserveCoins: 0,
    favorites: [
      'frame_slate', 'emoji_figurative_imp', 'bg_graphite', 'emoji_figurative_skull',
      'frame_storm', 'bg_graphite_havoc', 'emoji_object_bomb', 'frame_void', 'bg_tribal_cipher'
    ],
    keepSignatureEmoji: false
  },
  bot_sys_codequiz_z3n: {
    label: 'Zen natural',
    signatureEmoji: 'emoji_common_smile',
    spending: 'equilibrado',
    reserveCoins: 5,
    favorites: [
      'frame_mint', 'bg_dawn', 'emoji_animal_frog', 'frame_lime', 'bg_ocean',
      'emoji_object_anchor', 'bg_aurora', 'frame_sakura'
    ],
    keepSignatureEmoji: true
  }
});

const FALLBACK_STYLE = Object.freeze({
  label: 'Equilibrado',
  signatureEmoji: 'emoji_common_smile',
  spending: 'equilibrado',
  reserveCoins: 0,
  favorites: [],
  keepSignatureEmoji: false
});

export function getSystemBotStyle(botId = '') {
  const safeBotId = String(botId || '').trim();
  return SYSTEM_BOT_STYLES[safeBotId] || FALLBACK_STYLE;
}

function hashString(value = '') {
  const input = String(value || '');
  let hash = 7;
  for (let idx = 0; idx < input.length; idx += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(idx)) | 0;
  }
  return Math.abs(hash);
}

function uniqueIds(list = []) {
  return Array.from(new Set(
    (Array.isArray(list) ? list : [])
      .map((entry) => String(entry || '').trim())
      .filter(Boolean)
  ));
}

function isPassItem(item) {
  return String(item?.unlockSource || '').trim().toLowerCase() === 'evolution_pass';
}

function getRarityRank(rarity = '') {
  const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const index = order.indexOf(String(rarity || '').trim().toLowerCase());
  return index >= 0 ? index : 0;
}

export function getBotPassLevelFromAchievements(achievementIds = []) {
  let level = 0;
  uniqueIds(achievementIds).forEach((achievementId) => {
    const match = /^pass_lvl_(\d{1,2})$/i.exec(achievementId);
    if (!match) return;
    level = Math.max(level, Math.max(0, Number(match[1] || 0)));
  });
  return level;
}

// O bot pode ter este item com o nível/passe atual?
// - item padrão: sempre;
// - item do passe: só com a etapa do passe correspondente;
// - item de loja: raridade liberada para o nível do bot.
export function isItemAllowedForBot(itemId = '', level = 1, passLevel = 0) {
  const safeItemId = String(itemId || '').trim();
  if (!safeItemId) return false;
  if (DEFAULT_ITEM_IDS.includes(safeItemId)) return true;
  const item = getShopItem(safeItemId);
  if (!item) return false;
  if (isPassItem(item)) {
    return Math.max(0, Number(passLevel || 0)) >= Math.max(1, Number(item.unlockLevel || 1));
  }
  const minLevel = BOT_ITEM_MIN_LEVEL_BY_RARITY[String(item.rarity || 'common').trim().toLowerCase()] || 1;
  return Math.max(1, Number(level || 1)) >= minLevel;
}

function isPurchasableForBot(itemId, level, passLevel) {
  const item = getShopItem(itemId);
  if (!item || isPassItem(item) || item.isDefault) return false;
  if (Math.max(0, Number(item.price || 0)) <= 0) return false;
  return isItemAllowedForBot(itemId, level, passLevel);
}

export function buildInitialSystemBotInventory() {
  return {
    owned: [...DEFAULT_ITEM_IDS],
    equipped: { ...DEFAULT_EQUIPPED },
    rev: 0
  };
}

export function normalizeSystemBotInventory(value = null, level = 1, passLevel = 0) {
  const safe = value && typeof value === 'object' ? value : {};
  const owned = uniqueIds([...DEFAULT_ITEM_IDS, ...(Array.isArray(safe.owned) ? safe.owned : [])])
    .filter((itemId) => DEFAULT_ITEM_IDS.includes(itemId) || (getShopItem(itemId) && isItemAllowedForBot(itemId, level, passLevel)));
  const ownedSet = new Set(owned);
  const equippedSource = safe.equipped && typeof safe.equipped === 'object' ? safe.equipped : {};
  const equipped = {};
  ITEM_TYPES.forEach((type) => {
    const candidate = String(equippedSource[type] || DEFAULT_EQUIPPED[type]).trim();
    const item = getShopItem(candidate);
    equipped[type] = ownedSet.has(candidate) && item && item.type === type ? candidate : DEFAULT_EQUIPPED[type];
  });
  return {
    owned,
    equipped,
    rev: Math.max(0, Math.floor(Number(safe.rev || 0)))
  };
}

// Escolhe o que o bot usa: a peça mais avançada da lista de desejos de cada tipo; sem
// nenhuma, a de maior raridade que tiver; o emoji de assinatura quando ele é fiel a ele.
export function pickSystemBotEquipped(botId = '', owned = []) {
  const style = getSystemBotStyle(botId);
  const ownedSet = new Set(uniqueIds([...DEFAULT_ITEM_IDS, ...owned]));
  const equipped = { ...DEFAULT_EQUIPPED };
  ITEM_TYPES.forEach((type) => {
    if (type === 'emoji' && style.keepSignatureEmoji && ownedSet.has(style.signatureEmoji)) {
      equipped.emoji = style.signatureEmoji;
      return;
    }
    const favoriteOwned = style.favorites
      .filter((itemId) => ownedSet.has(itemId) && getShopItem(itemId)?.type === type);
    if (favoriteOwned.length) {
      equipped[type] = favoriteOwned[favoriteOwned.length - 1];
      return;
    }
    if (type === 'emoji' && ownedSet.has(style.signatureEmoji)) {
      equipped.emoji = style.signatureEmoji;
      return;
    }
    const others = [...ownedSet]
      .map((itemId) => getShopItem(itemId))
      .filter((item) => item && item.type === type && !item.isDefault)
      .sort((a, b) => (
        (getRarityRank(b.rarity) - getRarityRank(a.rarity))
        || (Number(b.price || 0) - Number(a.price || 0))
        || String(a.id).localeCompare(String(b.id))
      ));
    if (others.length) equipped[type] = others[0].id;
  });
  return equipped;
}

// Compras de uma "sessão" do bot com as moedas que ele tem agora.
export function planSystemBotPurchases(botId = '', { coins = 0, level = 1, passLevel = 0, owned = [] } = {}) {
  const style = getSystemBotStyle(botId);
  let remaining = Math.max(0, Math.floor(Number(coins || 0)));
  const ownedSet = new Set(uniqueIds([...DEFAULT_ITEM_IDS, ...owned]));
  const purchases = [];
  const canStillBuy = () => purchases.length < MAX_PURCHASES_PER_SESSION;
  const buy = (itemId) => {
    const price = Math.max(0, Math.floor(Number(getShopItem(itemId)?.price || 0)));
    remaining -= price;
    ownedSet.add(itemId);
    purchases.push(itemId);
  };
  const affordable = (itemId, reserve = 0) => {
    const price = Math.max(0, Math.floor(Number(getShopItem(itemId)?.price || 0)));
    return price > 0 && (remaining - price) >= reserve;
  };

  // A primeira compra de todo bot é o emoji de assinatura (com o crédito inicial).
  if (!ownedSet.has(style.signatureEmoji)
    && isPurchasableForBot(style.signatureEmoji, level, passLevel)
    && affordable(style.signatureEmoji, 0)) {
    buy(style.signatureEmoji);
  }

  const wishlist = style.favorites.filter((itemId) => (
    !ownedSet.has(itemId) && isPurchasableForBot(itemId, level, passLevel)
  ));
  const reserve = Math.max(0, Math.floor(Number(style.reserveCoins || 0)));

  if (style.spending === 'poupador') {
    // Só a próxima peça da lista; se não der, junta moedas.
    const next = wishlist[0];
    if (next && canStillBuy() && affordable(next, reserve)) buy(next);
  } else {
    for (const itemId of wishlist) {
      if (!canStillBuy()) break;
      if (affordable(itemId, reserve)) buy(itemId);
    }
  }

  if (canStillBuy() && (style.spending === 'impulsivo' || style.spending === 'colecionador')) {
    // Compra por impulso/coleção: algo barato liberado para o nível, fora da lista.
    const preferredType = style.spending === 'colecionador' ? 'emoji' : null;
    const extras = SHOP_ITEMS
      .map((item) => item.id)
      .filter((itemId) => !ownedSet.has(itemId) && isPurchasableForBot(itemId, level, passLevel))
      .map((itemId) => getShopItem(itemId))
      .filter((item) => item && (!preferredType || item.type === preferredType))
      .filter((item) => style.spending === 'colecionador' || Number(item.price || 0) <= 45)
      .sort((a, b) => (
        (Number(a.price || 0) - Number(b.price || 0))
        || (hashString(`${botId}:${a.id}`) - hashString(`${botId}:${b.id}`))
      ));
    // O impulsivo só gasta fora da lista se ainda sobrar para a próxima peça desejada.
    const nextWishPrice = Math.max(0, Number(getShopItem(wishlist.find((id) => !ownedSet.has(id)))?.price || 0));
    for (const item of extras) {
      if (!canStillBuy()) break;
      const extraReserve = style.spending === 'impulsivo' ? Math.min(nextWishPrice, 60) : reserve;
      if (affordable(item.id, extraReserve)) buy(item.id);
    }
  }

  return {
    purchases,
    spentCoins: Math.max(0, Math.floor(Number(coins || 0)) - remaining),
    remainingCoins: remaining
  };
}

// Resgata as etapas do passe já cumpridas (como o jogador faz ao tocar em "resgatar").
function claimSystemBotPassStages(statsRow) {
  let progress = mergeProgressWithRemoteStats(defaultProgress(), statsRow);
  const claimed = [];
  const grantedItems = [];
  for (let round = 0; round < MAX_PASS_CLAIM_ROUNDS; round += 1) {
    const preview = applyEvolutionPassRewards(progress, []);
    const claimableIds = (Array.isArray(preview?.unlockedAchievements) ? preview.unlockedAchievements : [])
      .map((entry) => String(entry?.id || '').trim())
      .filter((id) => id && !claimed.includes(id));
    if (!claimableIds.length) break;
    const result = applyEvolutionPassRewards(progress, claimableIds);
    const newlyClaimed = (Array.isArray(result?.claimedAchievements) ? result.claimedAchievements : [])
      .map((entry) => String(entry?.id || '').trim())
      .filter(Boolean);
    if (!newlyClaimed.length) break;
    progress = result.progress;
    claimed.push(...newlyClaimed);
    grantedItems.push(...(Array.isArray(result.rewardShopItems) ? result.rewardShopItems : []));
  }
  return {
    claimed,
    grantedItems: uniqueIds(grantedItems),
    totalXp: getProgressTotalXp(progress),
    level: Math.max(1, Number(progress.level || 1)),
    coins: Math.max(0, Math.floor(Number(progress.coins || 0))),
    achievementIds: uniqueIds(progress.achievements)
  };
}

function sameInventory(a, b) {
  const ownedA = uniqueIds(a?.owned).sort().join('|');
  const ownedB = uniqueIds(b?.owned).sort().join('|');
  if (ownedA !== ownedB) return false;
  return ITEM_TYPES.every((type) => String(a?.equipped?.[type] || '') === String(b?.equipped?.[type] || ''));
}

// Próximo estado do bot a partir da linha user_stats atual.
// changed=false quando não há nada a fazer (nada para resgatar, comprar ou trocar).
export function planSystemBotProgression(botId = '', statsRow = null, nowMs = Date.now()) {
  const prev = statsRow && typeof statsRow === 'object' ? statsRow : {};
  const migrating = Number(prev.bot_economy_version || 0) < BOT_ECONOMY_VERSION;
  const stats = { ...prev };

  if (migrating) {
    // Economia antiga: tira as moedas "de presente" do seed (só existem em linha que
    // nasceu com 600) e zera o inventário de itens que o bot nunca comprou. Nível, XP e
    // PvP continuam os mesmos. Linha sem moedas recebe o crédito inicial de jogador.
    const rawCoins = Number(prev.coins);
    const hasCoins = prev.coins !== undefined && prev.coins !== null && Number.isFinite(rawCoins);
    const legacyCoins = hasCoins ? Math.max(0, Math.floor(rawCoins)) : BOT_STARTING_COINS;
    const legacyBonus = legacyCoins >= LEGACY_BOT_SEED_COINS ? (LEGACY_BOT_SEED_COINS - BOT_STARTING_COINS) : 0;
    stats.coins = Math.max(0, legacyCoins - legacyBonus);
    stats.bot_inventory = {
      ...buildInitialSystemBotInventory(),
      rev: Math.max(0, Math.floor(Number(prev.bot_inventory?.rev || 0)))
    };
    stats.bot_economy_version = BOT_ECONOMY_VERSION;
  }

  const pass = claimSystemBotPassStages(stats);
  if (pass.claimed.length) {
    stats.total_xp = pass.totalXp;
    stats.level = pass.level;
    stats.coins = pass.coins;
    stats.achievement_ids = pass.achievementIds;
  }

  const level = Math.max(1, Number(stats.level || 1));
  const passLevel = getBotPassLevelFromAchievements(stats.achievement_ids || stats.achievements);
  const previousInventory = normalizeSystemBotInventory(stats.bot_inventory, level, passLevel);
  const ownedBefore = uniqueIds([...previousInventory.owned, ...pass.grantedItems])
    .filter((itemId) => isItemAllowedForBot(itemId, level, passLevel));

  const plan = planSystemBotPurchases(botId, {
    coins: stats.coins,
    level,
    passLevel,
    owned: ownedBefore
  });
  const owned = uniqueIds([...ownedBefore, ...plan.purchases]);
  const equipped = pickSystemBotEquipped(botId, owned);
  const nextInventory = { owned, equipped, rev: previousInventory.rev };
  const inventoryChanged = !sameInventory(previousInventory, nextInventory)
    || !sameInventory(prev.bot_inventory, nextInventory);
  if (inventoryChanged || migrating) {
    // Versão sempre crescente (inclusive depois de migração), para a loja e o perfil
    // gravados aceitarem o inventário novo.
    nextInventory.rev = Math.max(previousInventory.rev + 1, Math.floor(Number(nowMs || 0)));
  }
  stats.coins = Math.max(0, Math.floor(Number(stats.coins || 0)) - plan.spentCoins);
  stats.bot_inventory = nextInventory;

  const changed = migrating
    || pass.claimed.length > 0
    || plan.purchases.length > 0
    || inventoryChanged;
  return {
    changed,
    migrating,
    stats,
    inventory: nextInventory,
    purchases: plan.purchases,
    claimedStages: pass.claimed,
    grantedItems: pass.grantedItems
  };
}

// Identidade inicial de um bot recém-criado (o que todos veem antes da 1ª sincronização).
export function buildInitialSystemBotLoadout(botId = '') {
  // Versão 1 fixa: é o mesmo visual inicial em qualquer aparelho.
  const plan = planSystemBotProgression(botId, {
    coins: BOT_STARTING_COINS,
    level: 1,
    total_xp: 0,
    bot_economy_version: BOT_ECONOMY_VERSION,
    bot_inventory: buildInitialSystemBotInventory()
  }, 1);
  return {
    coins: plan.stats.coins,
    inventory: plan.inventory
  };
}
