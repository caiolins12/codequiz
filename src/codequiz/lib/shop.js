const SHOP_STORAGE_PREFIX = 'codequiz_shop_v2_';

export const SHOP_RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const SHOP_RARITY_LABELS = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Lendario'
};

export const SHOP_ITEMS = [
  { id: 'frame_default', type: 'frame', name: 'Moldura Padrao', price: 0, icon: '🧩', rarity: 'common', isDefault: true },
  { id: 'frame_slate', type: 'frame', name: 'Moldura Ardosia', price: 45, icon: '⬛', rarity: 'common' },
  { id: 'frame_amber', type: 'frame', name: 'Moldura Ambar', price: 45, icon: '🟧', rarity: 'common' },
  { id: 'frame_gold', type: 'frame', name: 'Moldura Dourada', price: 80, icon: '✨', rarity: 'uncommon' },
  { id: 'frame_mint', type: 'frame', name: 'Moldura Menta', price: 80, icon: '🟩', rarity: 'uncommon' },
  { id: 'frame_sunrise', type: 'frame', name: 'Moldura Aurora', price: 80, icon: '🌅', rarity: 'uncommon' },
  { id: 'frame_ice', type: 'frame', name: 'Moldura Gelo', price: 120, icon: '❄️', rarity: 'rare' },
  { id: 'frame_ruby', type: 'frame', name: 'Moldura Rubi', price: 120, icon: '🟥', rarity: 'rare' },
  { id: 'frame_lime', type: 'frame', name: 'Moldura Lima', price: 120, icon: '🟢', rarity: 'rare' },
  { id: 'frame_fire', type: 'frame', name: 'Moldura Fogo', price: 160, icon: '🔥', rarity: 'epic' },
  { id: 'frame_neonwave', type: 'frame', name: 'Moldura Neon Wave', price: 160, icon: '🌈', rarity: 'epic' },
  { id: 'frame_storm', type: 'frame', name: 'Moldura Tempestade', price: 160, icon: '⚡', rarity: 'epic' },
  { id: 'frame_diamond', type: 'frame', name: 'Moldura Diamante', price: 220, icon: '💎', rarity: 'legendary' },
  { id: 'frame_phoenix', type: 'frame', name: 'Moldura Fenix', price: 220, icon: '🪽', rarity: 'legendary' },
  { id: 'frame_void', type: 'frame', name: 'Moldura Vazio', price: 220, icon: '🪐', rarity: 'legendary' },
  { id: 'frame_arcane', type: 'frame', name: 'Moldura Arcano', price: 220, icon: '🔮', rarity: 'legendary' },
  { id: 'frame_eclipse', type: 'frame', name: 'Moldura Eclipse', price: 220, icon: '🌑', rarity: 'legendary' },
  { id: 'frame_sakura', type: 'frame', name: 'Moldura Cerejeira', price: 220, icon: '🌸', rarity: 'legendary' },

  { id: 'bg_default', type: 'background', name: 'Fundo Padrao', price: 0, icon: '🎴', rarity: 'common', isDefault: true },
  { id: 'bg_graphite', type: 'background', name: 'Fundo Grafite', price: 35, icon: '⬛', rarity: 'common' },
  { id: 'bg_rose', type: 'background', name: 'Fundo Rosa Escuro', price: 35, icon: '🌹', rarity: 'common' },

  { id: 'bg_dawn', type: 'background', name: 'Fundo Horizonte', price: 70, icon: '🌤️', rarity: 'uncommon' },
  { id: 'bg_turquoise', type: 'background', name: 'Fundo Turquesa', price: 70, icon: '🩵', rarity: 'uncommon' },
  { id: 'bg_violet', type: 'background', name: 'Fundo Violeta', price: 70, icon: '🟪', rarity: 'uncommon' },

  { id: 'bg_ocean', type: 'background', name: 'Fundo Oceano', price: 110, icon: '🌊', rarity: 'rare' },
  { id: 'bg_terminal', type: 'background', name: 'Fundo Terminal', price: 110, icon: '🟩', rarity: 'rare' },
  { id: 'bg_parchment', type: 'background', name: 'Fundo Basalto', price: 110, icon: '🪨', rarity: 'rare' },

  { id: 'bg_sunset', type: 'background', name: 'Fundo Sunset', price: 160, icon: '🌅', rarity: 'epic' },
  { id: 'bg_aurora', type: 'background', name: 'Fundo Aurora', price: 160, icon: '🌌', rarity: 'epic' },
  { id: 'bg_voltage', type: 'background', name: 'Fundo Voltagem', price: 160, icon: '⚡', rarity: 'epic' },

  { id: 'bg_graphite_prime', type: 'background', name: 'Fundo Grafite Prime', price: 220, icon: '🪨', rarity: 'legendary' },
  { id: 'bg_kanji_storm', type: 'background', name: 'Fundo Kanji Storm', price: 220, icon: '🈶', rarity: 'legendary' },
  { id: 'bg_tribal_ember', type: 'background', name: 'Fundo Tribal Ember', price: 220, icon: '🗿', rarity: 'legendary' },
  { id: 'bg_graphite_havoc', type: 'background', name: 'Fundo Grafite Havoc', price: 220, icon: '🧨', rarity: 'legendary' },
  { id: 'bg_kanji_reactor', type: 'background', name: 'Fundo Kanji Reactor', price: 220, icon: '🈴', rarity: 'legendary' },
  { id: 'bg_tribal_cipher', type: 'background', name: 'Fundo Tribal Cipher', price: 220, icon: '🛡️', rarity: 'legendary' },

  { id: 'emoji_profile', type: 'emoji', name: 'Sorriso Inicial', price: 0, icon: '🙂', rarity: 'common', isDefault: true },
  { id: 'emoji_common_smile', type: 'emoji', name: 'Sorriso Aberto', price: 20, icon: '😄', rarity: 'common' },
  { id: 'emoji_common_cool', type: 'emoji', name: 'Confiante', price: 20, icon: '😎', rarity: 'common' },
  { id: 'emoji_common_think', type: 'emoji', name: 'Pensativo', price: 20, icon: '🤔', rarity: 'common' },
  { id: 'emoji_common_nerd', type: 'emoji', name: 'Nerd', price: 20, icon: '🤓', rarity: 'common' },
  { id: 'emoji_common_wink', type: 'emoji', name: 'Piscadinha', price: 20, icon: '😉', rarity: 'common' },
  { id: 'emoji_common_happy', type: 'emoji', name: 'Alegre', price: 20, icon: '😊', rarity: 'common' },
  { id: 'emoji_common_star', type: 'emoji', name: 'Brilho', price: 20, icon: '🤩', rarity: 'common' },
  { id: 'emoji_common_focus', type: 'emoji', name: 'Foco', price: 20, icon: '🧐', rarity: 'common' },
  { id: 'emoji_common_smart', type: 'emoji', name: 'Esperto', price: 20, icon: '😏', rarity: 'common' },
  { id: 'emoji_common_party', type: 'emoji', name: 'Festeiro', price: 20, icon: '🥳', rarity: 'common' },
  { id: 'emoji_animal_dog', type: 'emoji', name: 'Cao', price: 35, icon: '🐶', rarity: 'uncommon' },
  { id: 'emoji_animal_cat', type: 'emoji', name: 'Gato', price: 35, icon: '🐱', rarity: 'uncommon' },
  { id: 'emoji_animal_fox', type: 'emoji', name: 'Raposa', price: 35, icon: '🦊', rarity: 'uncommon' },
  { id: 'emoji_animal_panda', type: 'emoji', name: 'Panda', price: 35, icon: '🐼', rarity: 'uncommon' },
  { id: 'emoji_animal_frog', type: 'emoji', name: 'Sapo', price: 35, icon: '🐸', rarity: 'uncommon' },
  { id: 'emoji_animal_lion', type: 'emoji', name: 'Leao', price: 35, icon: '🦁', rarity: 'uncommon' },
  { id: 'emoji_animal_tiger', type: 'emoji', name: 'Tigre', price: 35, icon: '🐯', rarity: 'uncommon' },
  { id: 'emoji_animal_penguin', type: 'emoji', name: 'Pinguim', price: 35, icon: '🐧', rarity: 'uncommon' },
  { id: 'emoji_animal_koala', type: 'emoji', name: 'Koala', price: 35, icon: '🐨', rarity: 'uncommon' },
  { id: 'emoji_animal_monkey', type: 'emoji', name: 'Macaco', price: 35, icon: '🐵', rarity: 'uncommon' },
  { id: 'emoji_alien', type: 'emoji', name: 'Alien', price: 50, icon: '👽', rarity: 'rare' },
  { id: 'emoji_figurative_ghost', type: 'emoji', name: 'Fantasma', price: 55, icon: '👻', rarity: 'rare' },
  { id: 'emoji_figurative_robot', type: 'emoji', name: 'Robo', price: 55, icon: '🤖', rarity: 'rare' },
  { id: 'emoji_figurative_monster', type: 'emoji', name: 'Monstro Pixel', price: 55, icon: '👾', rarity: 'rare' },
  { id: 'emoji_figurative_imp', type: 'emoji', name: 'Demonio', price: 55, icon: '😈', rarity: 'rare' },
  { id: 'emoji_figurative_ogre', type: 'emoji', name: 'Ogro', price: 55, icon: '👹', rarity: 'rare' },
  { id: 'emoji_figurative_goblin', type: 'emoji', name: 'Goblin', price: 55, icon: '👺', rarity: 'rare' },
  { id: 'emoji_figurative_unicorn', type: 'emoji', name: 'Unicornio', price: 55, icon: '🦄', rarity: 'rare' },
  { id: 'emoji_figurative_dragon', type: 'emoji', name: 'Dragao', price: 55, icon: '🐉', rarity: 'rare' },
  { id: 'emoji_figurative_troll', type: 'emoji', name: 'Troll', price: 55, icon: '🧌', rarity: 'rare' },
  { id: 'emoji_figurative_skull', type: 'emoji', name: 'Caveira', price: 55, icon: '💀', rarity: 'rare' },
  { id: 'emoji_crown', type: 'emoji', name: 'Coroa', price: 80, icon: '👑', rarity: 'epic' },
  { id: 'emoji_object_gem', type: 'emoji', name: 'Gema', price: 90, icon: '💎', rarity: 'epic' },
  { id: 'emoji_object_crystal', type: 'emoji', name: 'Cristal', price: 90, icon: '🔮', rarity: 'epic' },
  { id: 'emoji_object_sword', type: 'emoji', name: 'Espada', price: 90, icon: '🗡️', rarity: 'epic' },
  { id: 'emoji_object_shield', type: 'emoji', name: 'Escudo', price: 90, icon: '🛡️', rarity: 'epic' },
  { id: 'emoji_object_trophy', type: 'emoji', name: 'Trofeu', price: 90, icon: '🏆', rarity: 'epic' },
  { id: 'emoji_object_target', type: 'emoji', name: 'Alvo', price: 90, icon: '🎯', rarity: 'epic' },
  { id: 'emoji_object_wand', type: 'emoji', name: 'Varinha', price: 90, icon: '🪄', rarity: 'epic' },
  { id: 'emoji_object_bomb', type: 'emoji', name: 'Bomba', price: 90, icon: '💣', rarity: 'epic' },
  { id: 'emoji_object_anchor', type: 'emoji', name: 'Ancora', price: 90, icon: '⚓', rarity: 'epic' },
  { id: 'emoji_object_key', type: 'emoji', name: 'Chave', price: 90, icon: '🗝️', rarity: 'epic' },
  { id: 'emoji_ninja', type: 'emoji', name: 'Ninja', price: 50, icon: '🥷', rarity: 'legendary' },
  { id: 'emoji_prof_dev', type: 'emoji', name: 'Desenvolvedor', price: 120, icon: '🧑‍💻', rarity: 'legendary' },
  { id: 'emoji_prof_doctor', type: 'emoji', name: 'Medico', price: 120, icon: '👨‍⚕️', rarity: 'legendary' },
  { id: 'emoji_prof_teacher', type: 'emoji', name: 'Professor', price: 120, icon: '👩‍🏫', rarity: 'legendary' },
  { id: 'emoji_prof_mechanic', type: 'emoji', name: 'Mecanico', price: 120, icon: '👨‍🔧', rarity: 'legendary' },
  { id: 'emoji_prof_chef', type: 'emoji', name: 'Chef', price: 120, icon: '👩‍🍳', rarity: 'legendary' },
  { id: 'emoji_prof_firefighter', type: 'emoji', name: 'Bombeiro', price: 120, icon: '👨‍🚒', rarity: 'legendary' },
  { id: 'emoji_prof_police', type: 'emoji', name: 'Policial', price: 120, icon: '👮', rarity: 'legendary' },
  { id: 'emoji_prof_detective', type: 'emoji', name: 'Detetive', price: 120, icon: '🕵️', rarity: 'legendary' },
  { id: 'emoji_prof_judge', type: 'emoji', name: 'Juiz', price: 120, icon: '👩‍⚖️', rarity: 'legendary' },
  { id: 'emoji_prof_pilot', type: 'emoji', name: 'Piloto', price: 120, icon: '👨‍✈️', rarity: 'legendary' }
];

const ITEM_BY_ID = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

const DEFAULT_EQUIPPED = {
  frame: 'frame_default',
  background: 'bg_default',
  emoji: 'emoji_profile'
};

const GRAPHITE_PRIME_TEXT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="graffitiFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d8ff48"/>
        <stop offset="55%" stop-color="#4bffc9"/>
        <stop offset="100%" stop-color="#45a2ff"/>
      </linearGradient>
      <filter id="graffitiNeon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="10" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
      font-family="'Permanent Marker','Rock Salt','Segoe Script','Brush Script MT',cursive" font-style="italic"
      font-size="682" font-weight="900" letter-spacing="16"
      fill="url(#graffitiFill)" stroke="#f7ffad" stroke-width="20"
      paint-order="stroke fill" filter="url(#graffitiNeon)" opacity="0.92">TAG</text>
  </svg>`
)}`;

const KANJI_STORM_TEXT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="kanjiFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6fe4ff"/>
        <stop offset="48%" stop-color="#9a92ff"/>
        <stop offset="100%" stop-color="#ff6dcb"/>
      </linearGradient>
      <filter id="kanjiNeon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="9" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
      font-family="'Yuji Syuku','Klee One','Hiragino Kaku Gothic ProN','Yu Gothic UI','Meiryo',sans-serif"
      font-size="836" font-weight="700" letter-spacing="6"
      fill="url(#kanjiFill)" stroke="#d9f8ff" stroke-width="16"
      paint-order="stroke fill" filter="url(#kanjiNeon)" opacity="0.94">漢字</text>
  </svg>`
)}`;

const TRIBAL_EMBER_TEXT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="tribalFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffd07a"/>
        <stop offset="55%" stop-color="#ff7a5f"/>
        <stop offset="100%" stop-color="#fef2d0"/>
      </linearGradient>
      <filter id="tribalNeon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="8.5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
      font-family="'Papyrus','Segoe Script','Brush Script MT','URW Chancery L',cursive"
      font-size="462" font-weight="900" letter-spacing="18"
      fill="url(#tribalFill)" stroke="#fff1c8" stroke-width="14"
      paint-order="stroke fill" filter="url(#tribalNeon)" opacity="0.94">TRIBAL</text>
  </svg>`
)}`;

const GRAPHITE_HAVOC_TEXT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="havocFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#67f3ff"/>
        <stop offset="50%" stop-color="#ff5ef2"/>
        <stop offset="100%" stop-color="#ffc44f"/>
      </linearGradient>
      <filter id="havocNeon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="9.5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="50%" y="57%" text-anchor="middle" dominant-baseline="middle"
      font-family="'Permanent Marker','Rock Salt','Segoe Script','Brush Script MT',cursive"
      font-size="480" font-style="italic" font-weight="900" letter-spacing="14"
      fill="url(#havocFill)" stroke="#f8fbff" stroke-width="16"
      paint-order="stroke fill" filter="url(#havocNeon)" opacity="0.94">HAVOC</text>
  </svg>`
)}`;

const KANJI_REACTOR_TEXT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="reactorFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9effde"/>
        <stop offset="46%" stop-color="#66f0ff"/>
        <stop offset="100%" stop-color="#85a8ff"/>
      </linearGradient>
      <filter id="reactorNeon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="9.6" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="50%" y="57%" text-anchor="middle" dominant-baseline="middle"
      font-family="'Nanum Brush Script','Nanum Pen Script','Apple SD Gothic Neo','Malgun Gothic','Segoe Script',cursive"
      font-size="760" font-weight="700" letter-spacing="8"
      fill="url(#reactorFill)" stroke="#e7fff4" stroke-width="15"
      paint-order="stroke fill" filter="url(#reactorNeon)" opacity="0.95">한글</text>
  </svg>`
)}`;

const TRIBAL_CIPHER_TEXT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs>
      <linearGradient id="cipherFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a8ffed"/>
        <stop offset="52%" stop-color="#73d7ff"/>
        <stop offset="100%" stop-color="#9f87ff"/>
      </linearGradient>
      <filter id="cipherNeon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="9.2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="50%" y="57%" text-anchor="middle" dominant-baseline="middle"
      direction="rtl" unicode-bidi="bidi-override"
      font-family="'Aref Ruqaa','Amiri','Noto Naskh Arabic','Times New Roman',serif"
      font-size="748" font-weight="700" letter-spacing="4"
      fill="url(#cipherFill)" stroke="#eaffff" stroke-width="13"
      paint-order="stroke fill" filter="url(#cipherNeon)" opacity="0.95">رمز</text>
  </svg>`
)}`;

function normalizeRarity(value) {
  const safe = String(value || '').trim().toLowerCase();
  if (SHOP_RARITY_ORDER.includes(safe)) return safe;
  return 'common';
}

function resolveShopUpdatedAtMs(source) {
  const safe = source && typeof source === 'object' ? source : {};
  const numericUpdatedAt = Number(safe.updatedAt || 0);
  const numericUpdatedAtMs = Number(safe.updated_at_ms || 0);
  const parsedUpdatedAt = Date.parse(String(safe.updated_at || ''));
  return Math.max(
    0,
    Number.isFinite(numericUpdatedAt) ? numericUpdatedAt : 0,
    Number.isFinite(numericUpdatedAtMs) ? numericUpdatedAtMs : 0,
    Number.isFinite(parsedUpdatedAt) ? parsedUpdatedAt : 0
  );
}

export function getShopStorageKey(userId) {
  const uid = String(userId || '').trim() || 'guest';
  return `${SHOP_STORAGE_PREFIX}${uid}`;
}

export function getShopItem(itemId) {
  const found = ITEM_BY_ID.get(String(itemId || '').trim()) || null;
  if (!found) return null;
  return {
    ...found,
    rarity: normalizeRarity(found.rarity)
  };
}

export function getItemsByType(type) {
  const safeType = String(type || '').trim();
  return SHOP_ITEMS
    .filter((item) => item.type === safeType)
    .map((item) => ({ ...item, rarity: normalizeRarity(item.rarity) }))
    .sort((a, b) => {
      const rarityDelta = SHOP_RARITY_ORDER.indexOf(normalizeRarity(a.rarity)) - SHOP_RARITY_ORDER.indexOf(normalizeRarity(b.rarity));
      if (rarityDelta !== 0) return rarityDelta;
      return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR');
    });
}

export function normalizeShopData(rawData) {
  const safe = rawData && typeof rawData === 'object' ? rawData : {};
  const ownedRaw = Array.isArray(safe.owned) ? safe.owned : [];

  const ownedSet = new Set(
    ownedRaw
      .map((id) => String(id || '').trim())
      .filter((id) => id && ITEM_BY_ID.has(id))
  );
  SHOP_ITEMS.forEach((item) => {
    if (item.isDefault) ownedSet.add(item.id);
  });

  const equipped = {
    frame: String(safe?.equipped?.frame || DEFAULT_EQUIPPED.frame),
    background: String(safe?.equipped?.background || DEFAULT_EQUIPPED.background),
    emoji: String(safe?.equipped?.emoji || DEFAULT_EQUIPPED.emoji)
  };

  if (!ownedSet.has(equipped.frame) || !ITEM_BY_ID.has(equipped.frame)) equipped.frame = DEFAULT_EQUIPPED.frame;
  if (!ownedSet.has(equipped.background) || !ITEM_BY_ID.has(equipped.background)) equipped.background = DEFAULT_EQUIPPED.background;
  if (!ownedSet.has(equipped.emoji) || !ITEM_BY_ID.has(equipped.emoji)) equipped.emoji = DEFAULT_EQUIPPED.emoji;

  return {
    owned: [...ownedSet],
    equipped,
    updatedAt: resolveShopUpdatedAtMs(safe)
  };
}

export function defaultShopData() {
  return normalizeShopData({ owned: [], equipped: DEFAULT_EQUIPPED, updatedAt: Date.now() });
}

export function loadShopData(userId) {
  const key = getShopStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultShopData();
    return normalizeShopData(JSON.parse(raw));
  } catch {
    return defaultShopData();
  }
}

export function saveShopData(userId, shopData) {
  const key = getShopStorageKey(userId);
  const next = normalizeShopData({ ...shopData, updatedAt: Date.now() });
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // ignore local storage write failures (Safari private mode / quota)
  }
  return next;
}

export function mergeShopData(localRaw, remoteRaw) {
  const local = normalizeShopData(localRaw);
  const remote = normalizeShopData(remoteRaw);
  const localUpdatedAtMs = Math.max(0, Number(local.updatedAt || 0));
  const remoteUpdatedAtMs = Math.max(0, Number(remote.updatedAt || 0));
  const preferLocal = localUpdatedAtMs >= remoteUpdatedAtMs;

  const owned = [...new Set([...(local.owned || []), ...(remote.owned || [])])];
  const ownedSet = new Set(owned);

  const pickEquipped = (type) => {
    const fromLocal = local?.equipped?.[type];
    const fromRemote = remote?.equipped?.[type];
    const localOwned = Boolean(fromLocal && ownedSet.has(fromLocal));
    const remoteOwned = Boolean(fromRemote && ownedSet.has(fromRemote));
    const defaultId = DEFAULT_EQUIPPED[type];

    if (localOwned && remoteOwned) {
      const localIsDefault = String(fromLocal) === String(defaultId);
      const remoteIsDefault = String(fromRemote) === String(defaultId);
      if (localIsDefault && !remoteIsDefault) return fromRemote;
      if (!localIsDefault && remoteIsDefault) return fromLocal;
      return preferLocal ? fromLocal : fromRemote;
    }
    if (localOwned) return fromLocal;
    if (remoteOwned) return fromRemote;
    return DEFAULT_EQUIPPED[type];
  };

  return {
    owned,
    equipped: {
      frame: pickEquipped('frame'),
      background: pickEquipped('background'),
      emoji: pickEquipped('emoji')
    },
    updatedAt: Math.max(localUpdatedAtMs, remoteUpdatedAtMs, Date.now())
  };
}

export function canPurchaseItem(shopData, itemId, coins) {
  const item = getShopItem(itemId);
  if (!item) return { ok: false, reason: 'item_not_found' };

  const shop = normalizeShopData(shopData);
  const ownedSet = new Set(shop.owned);
  if (ownedSet.has(item.id)) return { ok: false, reason: 'already_owned' };

  const safeCoins = Math.max(0, Number(coins || 0));
  if (safeCoins < Number(item.price || 0)) return { ok: false, reason: 'insufficient_coins' };

  return { ok: true, item };
}

export function purchaseItem(shopData, itemId) {
  const item = getShopItem(itemId);
  const shop = normalizeShopData(shopData);
  if (!item) return shop;
  if (shop.owned.includes(item.id)) return shop;

  return normalizeShopData({
    ...shop,
    owned: [...shop.owned, item.id],
    updatedAt: Date.now()
  });
}

export function equipItem(shopData, itemId) {
  const item = getShopItem(itemId);
  const shop = normalizeShopData(shopData);
  if (!item) return shop;
  if (!shop.owned.includes(item.id)) return shop;

  return normalizeShopData({
    ...shop,
    equipped: {
      ...shop.equipped,
      [item.type]: item.id
    },
    updatedAt: Date.now()
  });
}

export function getDisplayAvatar(profileAvatar, shopData) {
  const shop = normalizeShopData(shopData);
  const equippedEmoji = getShopItem(shop?.equipped?.emoji);
  if (equippedEmoji?.useProfileAvatar) {
    return String(profileAvatar || '🤓');
  }
  return String(equippedEmoji?.icon || profileAvatar || '🤓');
}

export function getAvatarFrameClass(shopData) {
  const shop = normalizeShopData(shopData);
  const frame = getShopItem(shop?.equipped?.frame);
  const id = frame?.id || 'frame_default';
  const suffix = id.replace('frame_', '');
  return `cos-frame-${suffix}`;
}

export function getHeroBackgroundStyle(shopData) {
  const shop = normalizeShopData(shopData);
  const bg = getShopItem(shop?.equipped?.background);
  const map = {
    // Common: solid colors
    bg_default: 'linear-gradient(135deg, #1f2947 0%, #1f2947 100%)',
    bg_graphite: 'linear-gradient(135deg, #23272f 0%, #23272f 100%)',
    bg_rose: 'linear-gradient(135deg, #4a2535 0%, #4a2535 100%)',

    // Uncommon: gradients
    bg_dawn: 'linear-gradient(135deg, #30496f 0%, #5d7bb1 52%, #94a9d4 100%)',
    bg_turquoise: 'linear-gradient(135deg, #114a56 0%, #1f7b85 55%, #4db6b6 100%)',
    bg_violet: 'linear-gradient(135deg, #2f2458 0%, #5a3f92 50%, #8f72c4 100%)',

    // Rare: solid color + drawings
    bg_ocean: 'repeating-linear-gradient(0deg, rgba(165,223,255,0.26) 0 2px, transparent 2px 12px), repeating-linear-gradient(120deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 16px), linear-gradient(135deg, #1c4e79 0%, #1c4e79 100%)',
    bg_terminal: 'repeating-linear-gradient(0deg, rgba(130,219,154,0.18) 0 1px, transparent 1px 11px), repeating-linear-gradient(90deg, rgba(130,219,154,0.16) 0 1px, transparent 1px 11px), linear-gradient(135deg, #1a4028 0%, #1a4028 100%)',
    bg_parchment: 'repeating-linear-gradient(45deg, rgba(140,150,164,0.12) 0 1.4px, transparent 1.4px 10px), repeating-linear-gradient(-45deg, rgba(86,96,112,0.16) 0 1px, transparent 1px 12px), radial-gradient(circle at 22% 24%, rgba(189,197,210,0.18) 0 2px, transparent 3px), radial-gradient(circle at 78% 72%, rgba(136,148,164,0.16) 0 1.6px, transparent 2.6px), linear-gradient(135deg, #3b4350 0%, #3b4350 100%)',

    // Epic: gradient + drawings
    bg_sunset: 'repeating-linear-gradient(160deg, rgba(255,236,187,0.18) 0 2px, transparent 2px 18px), radial-gradient(circle at 78% 24%, rgba(255,243,201,0.2) 0 16%, transparent 36%), linear-gradient(135deg, #8b3f4d 0%, #cc5b4b 50%, #f0a15a 100%)',
    bg_aurora: 'repeating-linear-gradient(120deg, rgba(219,255,238,0.2) 0 2px, transparent 2px 20px), radial-gradient(circle at 24% 76%, rgba(198,255,227,0.24) 0 18%, transparent 42%), linear-gradient(135deg, #2b356c 0%, #2f6ca3 45%, #49a786 100%)',
    bg_voltage: 'repeating-linear-gradient(150deg, rgba(229,243,255,0.22) 0 2px, transparent 2px 16px), repeating-linear-gradient(30deg, rgba(124,182,255,0.16) 0 1px, transparent 1px 13px), linear-gradient(135deg, #283d73 0%, #3d57a3 48%, #697bc0 100%)',

    // Legendary: gradient + drawings + special effects (without inner/outer glow)
    bg_galaxy: 'conic-gradient(from 210deg at 70% 30%, rgba(196,82,255,0.34), rgba(70,201,255,0.28), rgba(122,86,255,0.34), rgba(196,82,255,0.34)), radial-gradient(circle at 16% 20%, rgba(255,255,255,0.34) 0 1.8px, transparent 2.8px), radial-gradient(circle at 84% 78%, rgba(255,255,255,0.3) 0 1.4px, transparent 2.4px), radial-gradient(circle at 52% 44%, rgba(120,78,255,0.42) 0 20%, transparent 46%), linear-gradient(135deg, #090729 0%, #2d1a77 48%, #0e5cb8 100%)',
    bg_celestial: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,218,112,0.2) 0 6deg, transparent 6deg 15deg), repeating-radial-gradient(circle at 50% 50%, rgba(255,239,176,0.18) 0 5px, transparent 5px 14px), conic-gradient(from 124deg at 34% 64%, rgba(255,205,84,0.38), rgba(72,164,255,0.28), rgba(22,90,196,0.3), rgba(255,205,84,0.38)), repeating-linear-gradient(122deg, rgba(18,52,108,0.26) 0 1px, transparent 1px 10px), linear-gradient(136deg, #070b26 0%, #0b1d4b 34%, #0e3d79 68%, #08184a 100%)',
    bg_draconic: 'repeating-linear-gradient(156deg, rgba(255,220,122,0.22) 0 2px, transparent 2px 12px), repeating-linear-gradient(26deg, rgba(255,120,78,0.18) 0 1px, transparent 1px 9px), conic-gradient(from 38deg at 62% 38%, rgba(255,190,88,0.34), rgba(255,78,58,0.3), rgba(170,78,255,0.24), rgba(255,190,88,0.34)), radial-gradient(circle at 22% 78%, rgba(255,202,118,0.32) 0 18%, transparent 42%), linear-gradient(135deg, #3f1013 0%, #8e1f24 42%, #5f2c88 100%)',
    bg_graphite_prime: `url("${GRAPHITE_PRIME_TEXT_SVG}") center / 82% 82% no-repeat, radial-gradient(circle at 20% 18%, rgba(122, 255, 196, 0.24) 0 24%, transparent 52%) center / 100% 100% no-repeat, linear-gradient(138deg, #050911 0%, #102248 44%, #183b63 100%) center / 100% 100% no-repeat`,
    bg_kanji_storm: `url("${KANJI_STORM_TEXT_SVG}") center / 82% 82% no-repeat, radial-gradient(circle at 82% 20%, rgba(102, 182, 255, 0.24) 0 24%, transparent 52%) center / 100% 100% no-repeat, linear-gradient(138deg, #13081d 0%, #1d2f67 46%, #0f3f5e 100%) center / 100% 100% no-repeat`,
    bg_tribal_ember: `url("${TRIBAL_EMBER_TEXT_SVG}") center / 82% 82% no-repeat, radial-gradient(circle at 18% 80%, rgba(255, 145, 96, 0.24) 0 24%, transparent 52%) center / 100% 100% no-repeat, linear-gradient(138deg, #170908 0%, #4b1d14 48%, #2a1110 100%) center / 100% 100% no-repeat`,

    // New legendary generation based on graffiti, kanji and tribal with unique art direction
    bg_graphite_havoc: `url("${GRAPHITE_HAVOC_TEXT_SVG}") center / 82% 82% no-repeat, radial-gradient(circle at 80% 18%, rgba(255, 124, 222, 0.22) 0 26%, transparent 56%) center / 100% 100% no-repeat, linear-gradient(138deg, #09051a 0%, #1f1448 44%, #3c1956 100%) center / 100% 100% no-repeat`,
    bg_kanji_reactor: `url("${KANJI_REACTOR_TEXT_SVG}") center / 82% 82% no-repeat, radial-gradient(circle at 80% 18%, rgba(118, 255, 219, 0.24) 0 28%, transparent 60%) center / 100% 100% no-repeat, linear-gradient(138deg, #081019 0%, #12394a 46%, #203e6f 100%) center / 100% 100% no-repeat`,
    bg_tribal_cipher: `url("${TRIBAL_CIPHER_TEXT_SVG}") center / 82% 82% no-repeat, radial-gradient(circle at 18% 80%, rgba(116, 235, 255, 0.24) 0 28%, transparent 60%) center / 100% 100% no-repeat, linear-gradient(138deg, #08161e 0%, #0f3142 44%, #233f7e 100%) center / 100% 100% no-repeat`
  };
  return map[bg?.id || 'bg_default'] || map.bg_default;
}

export function getAvatarFrameStyle(shopData) {
  const shop = normalizeShopData(shopData);
  const frame = getShopItem(shop?.equipped?.frame);
  const defaultInnerBg = '#202d49';
  const solidFrame = (borderColor, innerBg, glow = 'none') => ({
    border: `3px solid ${borderColor}`,
    background: innerBg,
    boxShadow: glow
  });
  const gradientFrame = (innerLayer, borderLayer, glow = 'none', extra = {}) => ({
    border: '3px solid transparent',
    backgroundImage: `${innerLayer}, ${borderLayer}`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: glow,
    ...extra
  });
  const legendaryFrame = (innerLayer, borderLayer, glow = 'none') => gradientFrame(
    innerLayer,
    borderLayer,
    glow
  );
  const map = {
    // Common: solid color without neon
    frame_default: solidFrame('#6c63ff', defaultInnerBg),
    frame_slate: solidFrame('#7f8aa4', defaultInnerBg),
    frame_amber: solidFrame('#c7863a', defaultInnerBg),

    // Uncommon: gradient border without neon (same inner background as default/common)
    frame_gold: gradientFrame(
      `linear-gradient(145deg, ${defaultInnerBg}, ${defaultInnerBg})`,
      'linear-gradient(132deg, #d4a23c, #f0c768, #c98a2b)'
    ),
    frame_mint: gradientFrame(
      `linear-gradient(145deg, ${defaultInnerBg}, ${defaultInnerBg})`,
      'linear-gradient(132deg, #7ad8b4, #4fc89b, #89e5c2)'
    ),
    frame_sunrise: gradientFrame(
      `linear-gradient(145deg, ${defaultInnerBg}, ${defaultInnerBg})`,
      'linear-gradient(132deg, #ff9d5c, #ff7b7b, #ffc66e)'
    ),

    // Rare: solid border with stronger monochromatic neon
    frame_ice: solidFrame(
      '#42c4ff',
      'rgba(19, 46, 74, 0.96)',
      '0 0 0 1px rgba(95, 210, 255, 0.48), 0 0 16px rgba(66, 196, 255, 0.72), 0 0 30px rgba(66, 196, 255, 0.42)'
    ),
    frame_ruby: solidFrame(
      '#ff5778',
      'rgba(66, 26, 40, 0.96)',
      '0 0 0 1px rgba(255, 112, 145, 0.48), 0 0 16px rgba(255, 87, 120, 0.72), 0 0 30px rgba(255, 87, 120, 0.42)'
    ),
    frame_lime: solidFrame(
      '#67e57e',
      'rgba(18, 52, 34, 0.96)',
      '0 0 0 1px rgba(120, 238, 145, 0.48), 0 0 16px rgba(103, 229, 126, 0.72), 0 0 30px rgba(103, 229, 126, 0.42)'
    ),

    // Epic: multicolor gradient border with intense neon + inner glow
    frame_fire: gradientFrame(
      'linear-gradient(145deg, rgba(86, 30, 14, 0.98), rgba(112, 34, 16, 0.95), rgba(64, 16, 10, 0.93))',
      'linear-gradient(132deg, #ffca64 0%, #ff8f3d 28%, #ff4b4b 58%, #ffbf7a 100%)',
      '0 0 0 1px rgba(255, 176, 112, 0.5), 0 0 24px rgba(255, 112, 70, 0.72), 0 0 42px rgba(255, 96, 64, 0.44), inset 0 0 18px rgba(255, 199, 128, 0.36)'
    ),
    frame_neonwave: gradientFrame(
      'linear-gradient(145deg, rgba(26, 20, 74, 0.98), rgba(20, 74, 110, 0.95), rgba(30, 22, 86, 0.93))',
      'linear-gradient(132deg, #7b74ff 0%, #54c8ff 34%, #8ef4ff 54%, #bf82ff 100%)',
      '0 0 0 1px rgba(149, 167, 255, 0.5), 0 0 24px rgba(92, 204, 255, 0.72), 0 0 42px rgba(122, 130, 255, 0.42), inset 0 0 18px rgba(174, 196, 255, 0.34)'
    ),
    frame_storm: gradientFrame(
      'linear-gradient(145deg, rgba(22, 28, 60, 0.98), rgba(24, 46, 96, 0.95), rgba(16, 24, 52, 0.93))',
      'linear-gradient(132deg, #d5dcff 0%, #7ea0ff 35%, #5f7bff 66%, #74edff 100%)',
      '0 0 0 1px rgba(168, 194, 255, 0.5), 0 0 24px rgba(117, 142, 255, 0.7), 0 0 42px rgba(91, 232, 255, 0.4), inset 0 0 18px rgba(176, 204, 255, 0.34)'
    ),

    // Legendary: gradient + neon (no particles/animated traces)
    frame_diamond: legendaryFrame(
      'linear-gradient(145deg, rgba(22, 45, 78, 0.98), rgba(28, 62, 102, 0.94), rgba(18, 38, 68, 0.92))',
      'linear-gradient(132deg, #9de7ff, #5eb7ff, #d9f4ff, #6fd4ff)',
      '0 0 0 1px rgba(181, 232, 255, 0.5), 0 0 24px rgba(126, 204, 255, 0.62), inset 0 0 14px rgba(182, 233, 255, 0.35)'
    ),
    frame_phoenix: legendaryFrame(
      'linear-gradient(145deg, rgba(64, 26, 12, 0.98), rgba(102, 34, 16, 0.94), rgba(52, 18, 10, 0.92))',
      'linear-gradient(132deg, #ff984e, #ff5a3c, #ffd05a, #ff8f3a)',
      '0 0 0 1px rgba(255, 184, 112, 0.52), 0 0 24px rgba(255, 114, 74, 0.64), inset 0 0 14px rgba(255, 207, 147, 0.32)'
    ),
    frame_void: legendaryFrame(
      'linear-gradient(145deg, rgba(10, 8, 28, 0.99), rgba(20, 12, 48, 0.95), rgba(8, 8, 22, 0.94))',
      'linear-gradient(132deg, #975eff, #5f7bff, #45d0ff, #c48dff)',
      '0 0 0 1px rgba(196, 149, 255, 0.5), 0 0 24px rgba(139, 110, 255, 0.62), inset 0 0 14px rgba(188, 146, 255, 0.3)'
    ),
    frame_arcane: legendaryFrame(
      'linear-gradient(145deg, rgba(18, 12, 48, 0.98), rgba(32, 18, 72, 0.94), rgba(14, 10, 40, 0.92))',
      'linear-gradient(132deg, #a855f7, #6366f1, #06b6d4, #a78bfa)',
      '0 0 0 1px rgba(168, 85, 247, 0.5), 0 0 24px rgba(99, 102, 241, 0.62), inset 0 0 14px rgba(167, 139, 250, 0.3)'
    ),
    frame_eclipse: legendaryFrame(
      'linear-gradient(145deg, rgba(8, 7, 6, 0.99), rgba(20, 14, 10, 0.95), rgba(7, 6, 5, 0.94))',
      'linear-gradient(132deg, #fbbf24, #f59e0b, #ff8c42, #fcd34d)',
      '0 0 0 1px rgba(251, 191, 36, 0.5), 0 0 24px rgba(245, 158, 11, 0.62), inset 0 0 14px rgba(252, 211, 77, 0.3)'
    ),
    frame_sakura: legendaryFrame(
      'linear-gradient(145deg, rgba(48, 20, 36, 0.98), rgba(62, 28, 48, 0.94), rgba(40, 16, 30, 0.92))',
      'linear-gradient(132deg, #f9a8d4, #f472b6, #fda4af, #fecdd3)',
      '0 0 0 1px rgba(244, 114, 182, 0.5), 0 0 24px rgba(249, 168, 212, 0.62), inset 0 0 14px rgba(253, 164, 175, 0.3)'
    )
  };
  return map[frame?.id || 'frame_default'] || map.frame_default;
}
