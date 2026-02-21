import { get, onValue, ref, runTransaction, set, update } from 'firebase/database';
import { firebaseDb } from './firebaseClient';
import {
  COINS_PER_CORRECT,
  PVE_COMPLETION_COINS_BONUS,
  PVE_COMPLETION_XP_BONUS,
  PVP_COINS_REWARD,
  PVP_XP_REWARD,
  QUESTIONS_PER_ROUND,
  XP_PER_CORRECT
} from './constants';
import { QUESTIONS } from '../data/questions-data';
import { buildMatchId, getPvpPointsDeltaAdvanced, PVP_ROUNDS_PER_MATCH } from './pvp';
import { getItemsByType } from './shop';
import {
  calculateStars,
  getProgressTotalXp,
  getQuizKey,
  normalizeDifficulty,
  splitProgressTotalXp
} from './utils';

const SYSTEM_BOT_ROSTER = [
  {
    id: 'bot_sys_codequiz_prime',
    nickname: 'tr3vo_azul',
    full_name: 'Tr3vo Azul',
    avatar: '😏',
    gender: 'male',
    default_personality: 'provocador',
    default_strength: 'forte'
  },
  {
    id: 'bot_sys_codequiz_orbita',
    nickname: '0rbita',
    full_name: '0rbita',
    avatar: '🧐',
    gender: 'neutral',
    default_personality: 'analitico',
    default_strength: 'forte'
  },
  {
    id: 'bot_sys_codequiz_zefira',
    nickname: 'Zefira',
    full_name: 'Zefira',
    avatar: '🤔',
    gender: 'female',
    default_personality: 'estrategista',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_sopro',
    nickname: 'Sopro',
    full_name: 'Sopro',
    avatar: '🙂',
    gender: 'female',
    default_personality: 'calmo',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_lua9',
    nickname: 'lua9',
    full_name: 'Lua9',
    avatar: '🥳',
    gender: 'female',
    default_personality: 'caotico',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_thiagoara',
    nickname: 'ThiagoAra',
    full_name: 'Thiago Ara',
    avatar: '😎',
    gender: 'male',
    default_personality: 'competitivo',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_bdevonly',
    nickname: 'bDevOnly',
    full_name: 'bDevOnly',
    avatar: '🤔',
    gender: 'neutral',
    default_personality: 'estrategista',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_flakael',
    nickname: 'Flakael',
    full_name: 'Flakael',
    avatar: '😉',
    gender: 'male',
    default_personality: 'sarcastico',
    default_strength: 'forte'
  },
  {
    id: 'bot_sys_codequiz_z3n',
    nickname: 'z3n',
    full_name: 'z3n',
    avatar: '😉',
    gender: 'neutral',
    default_personality: 'sarcastico',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_sandman',
    nickname: 'Sandman',
    full_name: 'Sandman',
    avatar: '😴',
    gender: 'male',
    default_personality: 'enigmatico',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_eliztwa',
    nickname: 'ElizTWA',
    full_name: 'ElizTWA',
    avatar: '🧠',
    gender: 'female',
    default_personality: 'visionario',
    default_strength: 'medio'
  },
  {
    id: 'bot_sys_codequiz_oharaxx',
    nickname: 'oharaXx',
    full_name: 'oharaXx',
    avatar: '⚡',
    gender: 'neutral',
    default_personality: 'impulsivo',
    default_strength: 'medio'
  }
];

export const SYSTEM_BOT_ID = SYSTEM_BOT_ROSTER[0].id;
export const SYSTEM_BOT_NICKNAME = SYSTEM_BOT_ROSTER[0].nickname;
export const SYSTEM_BOT_IDS = SYSTEM_BOT_ROSTER.map((bot) => bot.id);
const SYSTEM_BOT_ID_SET = new Set(SYSTEM_BOT_IDS);
const SYSTEM_BOT_DEFAULT_AVATAR = '🤖';
const SYSTEM_BOT_STRENGTH_DEFAULT = 'medio';
const BOT_PERSONALITY_OPTIONS = new Set([
  'provocador',
  'analitico',
  'calmo',
  'estrategista',
  'caotico',
  'sarcastico',
  'competitivo',
  'enigmatico',
  'visionario',
  'impulsivo'
]);
const BOT_STRENGTH_OPTIONS = new Set(['fraco', 'medio', 'forte']);
export const SYSTEM_BOT_DEFAULT_STRENGTH_BY_ID = Object.freeze(
  SYSTEM_BOT_ROSTER.reduce((acc, bot) => {
    const botId = String(bot?.id || '').trim();
    if (!botId) return acc;
    acc[botId] = normalizeSystemBotStrength(bot?.default_strength);
    return acc;
  }, {})
);
const BOT_STRENGTH_PRESETS = {
  fraco: {
    accuracy: 0.5,
    quiz_min_accuracy: 0.5,
    quiz_max_accuracy: 0.5,
    duel_min_accuracy: 0.5,
    duel_max_accuracy: 0.5
  },
  medio: {
    accuracy: 0.7,
    quiz_min_accuracy: 0.7,
    quiz_max_accuracy: 0.7,
    duel_min_accuracy: 0.7,
    duel_max_accuracy: 0.7
  },
  forte: {
    accuracy: 0.9,
    quiz_min_accuracy: 0.9,
    quiz_max_accuracy: 0.9,
    duel_min_accuracy: 0.9,
    duel_max_accuracy: 0.9
  }
};
const BOT_STRENGTH_RANK = {
  fraco: 1,
  medio: 2,
  forte: 3
};
const BOT_PROFILE_EMOJI_BY_PERSONALITY = {
  provocador: 'emoji_common_smart',
  analitico: 'emoji_common_focus',
  calmo: 'emoji_common_happy',
  estrategista: 'emoji_common_think',
  caotico: 'emoji_common_party',
  sarcastico: 'emoji_common_wink',
  competitivo: 'emoji_common_cool',
  enigmatico: 'emoji_figurative_ghost',
  visionario: 'emoji_object_crystal',
  impulsivo: 'emoji_object_bomb'
};
const BOT_DEFAULT_FRAME_ID = 'frame_default';
const BOT_DEFAULT_BACKGROUND_ID = 'bg_default';
const BOT_DEFAULT_EMOJI_ID = 'emoji_profile';
const BOT_RANDOM_FRAME_IDS = getItemsByType('frame')
  .map((item) => String(item?.id || '').trim())
  .filter((itemId) => itemId && itemId !== BOT_DEFAULT_FRAME_ID);
const BOT_RANDOM_BACKGROUND_IDS = getItemsByType('background')
  .map((item) => String(item?.id || '').trim())
  .filter((itemId) => itemId && itemId !== BOT_DEFAULT_BACKGROUND_ID);
const BOT_RANDOM_EMOJI_IDS = getItemsByType('emoji')
  .map((item) => String(item?.id || '').trim())
  .filter((itemId) => itemId && itemId !== BOT_DEFAULT_EMOJI_ID);
const BOT_RANDOM_AVATAR_ICONS = getItemsByType('emoji')
  .map((item) => String(item?.icon || '').trim())
  .filter((icon) => !!icon);
const BOT_VALID_FRAME_ID_SET = new Set([BOT_DEFAULT_FRAME_ID, ...BOT_RANDOM_FRAME_IDS]);
const BOT_VALID_BACKGROUND_ID_SET = new Set([BOT_DEFAULT_BACKGROUND_ID, ...BOT_RANDOM_BACKGROUND_IDS]);
const BOT_VALID_EMOJI_ID_SET = new Set([BOT_DEFAULT_EMOJI_ID, ...BOT_RANDOM_EMOJI_IDS]);

const NICKNAME_MIN_LENGTH = 3;
const NICKNAME_MAX_LENGTH = 12;
const BOT_USER_QUEUE_PATH = 'pvp_bots_state/user_queue';
const BOT_ARENA_QUEUE_PATH = 'pvp_bots_state/arena_queue';
const BOT_BUSY_PATH = 'pvp_bots_state/busy';
const BOT_ARENA_STATE_PATH = 'pvp_bots_state/arena_state';
const BOT_AUTOMATION_LOCK_PATH = 'pvp_bots_state/automation_lock';
const BOT_DAEMON_CONTROL_PATH = 'pvp_bots_state/daemon_control';
const BOT_DAEMON_STATUS_PATH = 'pvp_bots_state/daemon_status';
const BOT_ARENA_QUIZ_STATE_PATH = 'pvp_bots_state/arena_quiz_state';
const BOT_BATTLE_DURATION_MS_MIN = 20000;
const BOT_BATTLE_DURATION_MS_MAX = 32000;
const BOT_ARENA_BASE_ROUNDS = PVP_ROUNDS_PER_MATCH;
const BOT_ARENA_MAX_ROUNDS = 15;
const BOT_DUEL_MAX_ACTIVE_AGE_MS = 150000;
const BOT_USER_OPEN_MATCH_STALE_MS = 210000;
const BOT_DUEL_RECOVERY_MAX_BATCH = 8;
const BOT_QUEUE_PRNG_MOD = 2147483647;
const BOT_QUIZ_DIFFICULTY_SEQUENCE = Object.freeze(['easy', 'medium', 'hard']);
const BOT_QUIZ_BATCH_SIZE = 1;
const BOT_QUIZ_DURATION_MS_MIN = 24000;
const BOT_QUIZ_DURATION_MS_MAX = 36000;
const BOT_QUIZ_BUSY_SOURCE = 'arena_quiz';
const ENSURE_SYSTEM_BOTS_MIN_INTERVAL_MS = 120000;
const PVP_MATCH_ROWS_CACHE_TTL_MS = 1200;
const BOT_LOCAL_CACHE_STORAGE_KEY = 'codequiz_bot_local_cache_v1';
const BOT_LOCAL_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
const BOT_LOCAL_QUEUE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
const ENSURE_BOT_QUEUES_MIN_INTERVAL_MS = 7000;

export function getSystemBotDefaultStrength(botId = '') {
  const safeBotId = String(botId || '').trim();
  if (!safeBotId) return SYSTEM_BOT_STRENGTH_DEFAULT;
  return normalizeSystemBotStrength(
    SYSTEM_BOT_DEFAULT_STRENGTH_BY_ID[safeBotId] || SYSTEM_BOT_STRENGTH_DEFAULT
  );
}

function buildBotQuizCatalogByDifficulty(questionsMap = {}) {
  const safeQuestions = questionsMap && typeof questionsMap === 'object' ? questionsMap : {};
  const catalog = {
    easy: [],
    medium: [],
    hard: []
  };

  Object.keys(safeQuestions).sort().forEach((languageId) => {
    const languagePack = safeQuestions[languageId];
    if (!languagePack || typeof languagePack !== 'object') return;
    Object.keys(languagePack).sort().forEach((topicId) => {
      const topicPack = languagePack[topicId];
      if (!topicPack || typeof topicPack !== 'object') return;

      BOT_QUIZ_DIFFICULTY_SEQUENCE.forEach((difficulty) => {
        const pool = Array.isArray(topicPack[difficulty]) ? topicPack[difficulty] : [];
        if (!pool.length) return;
        catalog[difficulty].push({
          language: String(languageId),
          topic: String(topicId),
          difficulty,
          total_questions: Math.max(1, Math.min(QUESTIONS_PER_ROUND, pool.length))
        });
      });
    });
  });

  return catalog;
}

const BOT_QUIZ_CATALOG_BY_DIFFICULTY = buildBotQuizCatalogByDifficulty(QUESTIONS);

function toMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

let pvpMatchRowsCacheValue = null;
let pvpMatchRowsCacheExpiresAtMs = 0;
let pvpMatchRowsCachePromise = null;
let botLocalCacheLoaded = false;
let botLocalCacheState = null;
let ensureBotQueuesCached = null;
let ensureBotQueuesCachedAtMs = 0;

function updatePvpMatchRowsCacheRow(matchId, row) {
  const safeMatchId = String(matchId || '').trim();
  if (!safeMatchId) return;
  const safeRow = row && typeof row === 'object' ? row : null;
  if (!pvpMatchRowsCacheValue || typeof pvpMatchRowsCacheValue !== 'object') {
    pvpMatchRowsCacheValue = {};
  }
  if (safeRow) {
    pvpMatchRowsCacheValue[safeMatchId] = safeRow;
  } else {
    delete pvpMatchRowsCacheValue[safeMatchId];
  }
  pvpMatchRowsCacheExpiresAtMs = Date.now() + PVP_MATCH_ROWS_CACHE_TTL_MS;
}

function setPvpMatchRowsCache(rows, maxAgeMs = PVP_MATCH_ROWS_CACHE_TTL_MS) {
  const safeRows = rows && typeof rows === 'object' ? rows : {};
  pvpMatchRowsCacheValue = safeRows;
  pvpMatchRowsCacheExpiresAtMs = Date.now() + Math.max(300, Number(maxAgeMs || PVP_MATCH_ROWS_CACHE_TTL_MS));
}

async function getPvpMatchRowsCached(options = {}) {
  const nowMs = Date.now();
  const forceRefresh = options?.forceRefresh === true;
  const maxAgeMs = Math.max(300, Number(options?.maxAgeMs || PVP_MATCH_ROWS_CACHE_TTL_MS));
  if (!forceRefresh && pvpMatchRowsCacheValue && nowMs < pvpMatchRowsCacheExpiresAtMs) {
    return pvpMatchRowsCacheValue;
  }
  if (pvpMatchRowsCachePromise) {
    return pvpMatchRowsCachePromise;
  }
  pvpMatchRowsCachePromise = getNode('pvp_matches')
    .then((rows) => {
      setPvpMatchRowsCache(rows, maxAgeMs);
      return pvpMatchRowsCacheValue;
    })
    .catch(() => {
      if (pvpMatchRowsCacheValue && typeof pvpMatchRowsCacheValue === 'object') {
        pvpMatchRowsCacheExpiresAtMs = Date.now() + Math.min(500, maxAgeMs);
        return pvpMatchRowsCacheValue;
      }
      return {};
    })
    .finally(() => {
      pvpMatchRowsCachePromise = null;
    });
  return pvpMatchRowsCachePromise;
}

function stripUndefinedDeep(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined);
  }
  if (!value || typeof value !== 'object') return value;
  const next = {};
  Object.entries(value).forEach(([key, item]) => {
    const safeItem = stripUndefinedDeep(item);
    if (safeItem !== undefined) {
      next[key] = safeItem;
    }
  });
  return next;
}

function normalizePvpCategory(value, fallbackDifficulty = 'easy') {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw;
  return normalizeDifficulty(fallbackDifficulty || 'easy');
}

function normalizeBotPersonality(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_PERSONALITY_OPTIONS.has(key)) return key;
  return 'provocador';
}

function normalizeBotStrength(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_STRENGTH_OPTIONS.has(key)) return key;
  return SYSTEM_BOT_STRENGTH_DEFAULT;
}

function normalizeSystemBotStrength(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_STRENGTH_OPTIONS.has(key)) return key;
  return SYSTEM_BOT_STRENGTH_DEFAULT;
}

function getBotStrengthPreset(value) {
  const strength = normalizeBotStrength(value);
  return BOT_STRENGTH_PRESETS[strength] || BOT_STRENGTH_PRESETS[SYSTEM_BOT_STRENGTH_DEFAULT];
}

function getBotStrengthRank(value) {
  const strength = normalizeBotStrength(value);
  return Number(BOT_STRENGTH_RANK[strength] || BOT_STRENGTH_RANK[SYSTEM_BOT_STRENGTH_DEFAULT] || 2);
}

function getBotAccuracyByStrength(value) {
  const preset = getBotStrengthPreset(value);
  return Math.max(0.12, Math.min(0.99, Number(preset?.accuracy || 0.72)));
}

function hashBotSeed(value = '') {
  const input = String(value || '');
  let hash = 7;
  for (let idx = 0; idx < input.length; idx += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(idx)) | 0;
  }
  const normalized = Math.abs(hash) % (BOT_QUEUE_PRNG_MOD - 1);
  return normalized + 1;
}

function resolveDeterministicBotRun(seedKey, targetAccuracy, totalSteps, targetStep = totalSteps) {
  const safeSteps = Math.max(1, Math.trunc(Number(totalSteps || 1)));
  const safeTargetStep = Math.max(1, Math.min(safeSteps, Math.trunc(Number(targetStep || safeSteps))));
  const safeTargetAccuracy = Math.max(0.01, Math.min(0.99, Number(targetAccuracy || 0)));
  let hits = 0;
  let streak = 0;
  let bestStreak = 0;
  let hitAtStep = false;

  for (let step = 1; step <= safeSteps; step += 1) {
    const expectedHits = safeTargetAccuracy * step;
    const minHits = Math.floor(expectedHits);
    const maxHits = Math.ceil(expectedHits);
    let hit = false;

    if (hits < minHits) {
      hit = true;
    } else if (hits >= maxHits) {
      hit = false;
    } else {
      const rand = buildSeededRandom(hashBotSeed(`${seedKey}:${step}`));
      hit = rand() < safeTargetAccuracy;
    }

    if (hit) {
      hits += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }

    if (step === safeTargetStep) {
      hitAtStep = hit;
    }
  }

  return {
    correct_count: hits,
    best_streak: bestStreak,
    hit_at_step: hitAtStep
  };
}

function normalizeBotQueueOrder(rawOrder) {
  const source = Array.isArray(rawOrder) ? rawOrder : [];
  const picked = [];
  const seen = new Set();
  source.forEach((id) => {
    const safe = String(id || '').trim();
    if (!isSystemBotUserId(safe)) return;
    if (seen.has(safe)) return;
    seen.add(safe);
    picked.push(safe);
  });
  SYSTEM_BOT_IDS.forEach((id) => {
    if (seen.has(id)) return;
    seen.add(id);
    picked.push(id);
  });
  return picked;
}

function canUseBrowserLocalStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function getDefaultBotPvpPointsByStrength(strength) {
  const safeStrength = normalizeSystemBotStrength(strength);
  if (safeStrength === 'forte') return 220;
  if (safeStrength === 'medio') return 130;
  return 70;
}

function buildSeedBotSnapshot(botId = SYSTEM_BOT_ID, nowIso = new Date().toISOString()) {
  const botDef = getSystemBotDefinition(botId);
  const config = buildSystemBotConfigPayload(botDef, {}, nowIso);
  const stats = buildSystemBotStatsPayload(botDef, {
    pvp_points: getDefaultBotPvpPointsByStrength(config.strength),
    level: config.strength === 'forte' ? 20 : (config.strength === 'medio' ? 12 : 8)
  }, nowIso);
  const profile = buildSystemBotUserPayload(botDef, {}, nowIso, config.personality, config.strength);
  return {
    bot_id: botDef.id,
    profile,
    stats,
    config,
    profile_is_fallback: false,
    stats_is_fallback: false,
    config_is_fallback: false,
    snapshot_source: 'local_seed'
  };
}

function normalizeBotLocalCacheState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const rawSnapshots = safe.snapshots && typeof safe.snapshots === 'object'
    ? safe.snapshots
    : {};
  const snapshots = {};
  Object.entries(rawSnapshots).forEach(([botId, value]) => {
    const safeBotId = String(botId || '').trim();
    if (!isSystemBotUserId(safeBotId)) return;
    const row = value && typeof value === 'object' ? value : {};
    const profile = row.profile && typeof row.profile === 'object' ? row.profile : null;
    const stats = row.stats && typeof row.stats === 'object' ? row.stats : null;
    const config = row.config && typeof row.config === 'object' ? row.config : null;
    if (!profile || !stats || !config) return;
    snapshots[safeBotId] = {
      bot_id: safeBotId,
      profile,
      stats,
      config,
      cached_at_ms: Math.max(0, Number(row.cached_at_ms || 0)),
      source: String(row.source || '').trim() || 'remote'
    };
  });
  const queueOrder = normalizeBotQueueOrder(
    safe.queue_order || safe.queueOrder || safe.order || []
  );
  return {
    snapshots,
    queue_order: queueOrder,
    queue_updated_at_ms: Math.max(
      0,
      Number(safe.queue_updated_at_ms || safe.queueUpdatedAtMs || safe.updated_at_ms || 0)
    )
  };
}

function persistBotLocalCacheState() {
  if (!canUseBrowserLocalStorage()) return;
  if (!botLocalCacheState || typeof botLocalCacheState !== 'object') return;
  try {
    window.localStorage.setItem(BOT_LOCAL_CACHE_STORAGE_KEY, JSON.stringify(botLocalCacheState));
  } catch {
    // Ignore storage quota / private mode errors.
  }
}

function getBotLocalCacheState() {
  if (botLocalCacheLoaded && botLocalCacheState && typeof botLocalCacheState === 'object') {
    return botLocalCacheState;
  }
  botLocalCacheLoaded = true;
  let parsed = null;
  if (canUseBrowserLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(BOT_LOCAL_CACHE_STORAGE_KEY);
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
  }

  const normalized = normalizeBotLocalCacheState(parsed);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const snapshots = {
    ...(normalized.snapshots && typeof normalized.snapshots === 'object' ? normalized.snapshots : {})
  };
  let changed = false;
  SYSTEM_BOT_IDS.forEach((botId) => {
    if (snapshots[botId] && typeof snapshots[botId] === 'object') return;
    const seeded = buildSeedBotSnapshot(botId, nowIso);
    snapshots[botId] = {
      bot_id: botId,
      profile: seeded.profile,
      stats: seeded.stats,
      config: seeded.config,
      cached_at_ms: nowMs,
      source: 'local_seed'
    };
    changed = true;
  });

  const queueOrder = normalizeBotQueueOrder(normalized.queue_order);
  const safeQueueOrder = queueOrder.length ? queueOrder : normalizeBotQueueOrder(SYSTEM_BOT_IDS);
  if (!queueOrder.length) changed = true;

  botLocalCacheState = {
    snapshots,
    queue_order: safeQueueOrder,
    queue_updated_at_ms: Math.max(
      0,
      Number(normalized.queue_updated_at_ms || nowMs)
    )
  };
  if (changed) persistBotLocalCacheState();
  return botLocalCacheState;
}

function getCachedBotSnapshot(botId = SYSTEM_BOT_ID, maxAgeMs = BOT_LOCAL_CACHE_MAX_AGE_MS) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return null;
  const state = getBotLocalCacheState();
  const row = state?.snapshots?.[safeBotId];
  if (!row || typeof row !== 'object') return null;
  const safeMaxAgeMs = Math.max(1000, Number(maxAgeMs || BOT_LOCAL_CACHE_MAX_AGE_MS));
  const cachedAtMs = Math.max(0, Number(row.cached_at_ms || 0));
  if (cachedAtMs > 0 && (Date.now() - cachedAtMs) > safeMaxAgeMs) return null;
  return {
    bot_id: safeBotId,
    profile: row.profile,
    stats: row.stats,
    config: row.config,
    profile_is_fallback: false,
    stats_is_fallback: false,
    config_is_fallback: false,
    snapshot_source: String(row.source || 'local_cache')
  };
}

function setCachedBotSnapshot(snapshot, source = 'remote') {
  const safeSnapshot = snapshot && typeof snapshot === 'object' ? snapshot : null;
  const safeBotId = String(
    safeSnapshot?.bot_id
    || safeSnapshot?.profile?.id
    || ''
  ).trim();
  if (!isSystemBotUserId(safeBotId)) return null;
  const profile = safeSnapshot?.profile && typeof safeSnapshot.profile === 'object'
    ? safeSnapshot.profile
    : null;
  const stats = safeSnapshot?.stats && typeof safeSnapshot.stats === 'object'
    ? safeSnapshot.stats
    : null;
  const config = safeSnapshot?.config && typeof safeSnapshot.config === 'object'
    ? safeSnapshot.config
    : null;
  if (!profile || !stats || !config) return null;
  const state = getBotLocalCacheState();
  state.snapshots[safeBotId] = {
    bot_id: safeBotId,
    profile,
    stats,
    config,
    cached_at_ms: Date.now(),
    source: String(source || 'remote').trim() || 'remote'
  };
  persistBotLocalCacheState();
  return {
    bot_id: safeBotId,
    profile,
    stats,
    config
  };
}

function getCachedBotQueueOrder() {
  const state = getBotLocalCacheState();
  const queueUpdatedAtMs = Math.max(0, Number(state?.queue_updated_at_ms || 0));
  if (queueUpdatedAtMs > 0 && (Date.now() - queueUpdatedAtMs) > BOT_LOCAL_QUEUE_MAX_AGE_MS) {
    const refreshedOrder = normalizeBotQueueOrder(SYSTEM_BOT_IDS);
    state.queue_order = refreshedOrder;
    state.queue_updated_at_ms = Date.now();
    persistBotLocalCacheState();
    return refreshedOrder;
  }
  const safeOrder = normalizeBotQueueOrder(state?.queue_order || []);
  if (safeOrder.length) return safeOrder;
  return normalizeBotQueueOrder(SYSTEM_BOT_IDS);
}

function setCachedBotQueueOrder(order) {
  const safeOrder = normalizeBotQueueOrder(order);
  if (!safeOrder.length) return getCachedBotQueueOrder();
  const state = getBotLocalCacheState();
  state.queue_order = safeOrder;
  state.queue_updated_at_ms = Date.now();
  persistBotLocalCacheState();
  return safeOrder;
}

function rotateBotQueueOrder(order, botId) {
  const safeOrder = normalizeBotQueueOrder(order);
  const safeBotId = String(botId || '').trim();
  if (!safeBotId) return safeOrder;
  if (!safeOrder.includes(safeBotId)) return safeOrder;
  const next = safeOrder.filter((id) => id !== safeBotId);
  next.push(safeBotId);
  return next;
}

function normalizeArenaCyclePlayed(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const next = {};
  SYSTEM_BOT_IDS.forEach((botId) => {
    if (safe[botId] === true || String(safe[botId] || '').trim().toLowerCase() === 'true') {
      next[botId] = true;
    }
  });
  return next;
}

function normalizeArenaQueueState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  return {
    order: normalizeBotQueueOrder(safe.order),
    cycle_no: Math.max(0, Number(safe.cycle_no || 0)),
    cycle_played: normalizeArenaCyclePlayed(safe.cycle_played),
    updated_at: String(safe.updated_at || ''),
    updated_at_ms: Math.max(0, Number(safe.updated_at_ms || 0))
  };
}

function buildSeededRandom(seedValue) {
  let seed = Math.floor(Number(seedValue || 1)) % BOT_QUEUE_PRNG_MOD;
  if (seed <= 0) seed += BOT_QUEUE_PRNG_MOD - 1;
  return () => {
    seed = (seed * 48271) % BOT_QUEUE_PRNG_MOD;
    return seed / BOT_QUEUE_PRNG_MOD;
  };
}

function shuffleBotQueueOrder(order, seedValue = Date.now()) {
  const safe = normalizeBotQueueOrder(order);
  if (safe.length <= 1) return safe;
  const random = buildSeededRandom(seedValue);
  const next = [...safe];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const temp = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = temp;
  }
  return next;
}

function isArenaCycleCompleted(cyclePlayedMap) {
  const safe = cyclePlayedMap && typeof cyclePlayedMap === 'object' ? cyclePlayedMap : {};
  return SYSTEM_BOT_IDS.every((botId) => safe[botId] === true);
}

function normalizeArenaState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  return {
    status: String(safe.status || 'idle').trim().toLowerCase() === 'active' ? 'active' : 'idle',
    match_id: String(safe.match_id || '').trim(),
    bot_a_id: String(safe.bot_a_id || '').trim(),
    bot_b_id: String(safe.bot_b_id || '').trim(),
    started_at_ms: Math.max(0, Number(safe.started_at_ms || 0)),
    ends_at_ms: Math.max(0, Number(safe.ends_at_ms || 0)),
    difficulty: normalizeDifficulty(safe.difficulty || 'easy'),
    updated_at: String(safe.updated_at || '')
  };
}

function normalizeBotArenaDaemonControl(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const arenaEnabled = parseBooleanLike(safe.arena_enabled, true);
  const pvpEnabled = parseBooleanLike(safe.pvp_enabled, arenaEnabled);
  const quizEnabled = parseBooleanLike(safe.quiz_enabled, arenaEnabled);
  return {
    arena_enabled: arenaEnabled,
    pvp_enabled: pvpEnabled,
    quiz_enabled: quizEnabled,
    updated_at: String(safe.updated_at || ''),
    updated_by: String(safe.updated_by || '')
  };
}

function normalizeBotArenaDaemonStatus(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  return {
    owner_id: String(safe.owner_id || ''),
    status: String(safe.status || '').trim().toLowerCase() || 'unknown',
    last_state: String(safe.last_state || ''),
    ticks: Math.max(0, Number(safe.ticks || 0)),
    created_matches: Math.max(0, Number(safe.created_matches || 0)),
    finalized_matches: Math.max(0, Number(safe.finalized_matches || 0)),
    lock_ok: safe.lock_ok === true,
    run_started_at: String(safe.run_started_at || ''),
    run_started_at_ms: Math.max(0, Number(safe.run_started_at_ms || 0)),
    run_finished_at: String(safe.run_finished_at || ''),
    run_finished_at_ms: Math.max(0, Number(safe.run_finished_at_ms || 0)),
    updated_at: String(safe.updated_at || ''),
    updated_at_ms: Math.max(0, Number(safe.updated_at_ms || 0))
  };
}

function parseBooleanLike(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const text = String(value || '').trim().toLowerCase();
  if (text === 'true' || text === '1' || text === 'yes' || text === 'on' || text === 'enabled') return true;
  if (text === 'false' || text === '0' || text === 'no' || text === 'off' || text === 'disabled') return false;
  return fallback;
}

function hasBotQuizCatalogEntries(difficulty) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const list = BOT_QUIZ_CATALOG_BY_DIFFICULTY[safeDifficulty];
  return Array.isArray(list) && list.length > 0;
}

function resolveBotQuizDifficultyWithCatalog(preferredDifficulty = 'easy') {
  const preferred = normalizeDifficulty(preferredDifficulty || 'easy');
  const preferredIndex = BOT_QUIZ_DIFFICULTY_SEQUENCE.indexOf(preferred);
  const startIndex = preferredIndex >= 0 ? preferredIndex : 0;
  for (let offset = 0; offset < BOT_QUIZ_DIFFICULTY_SEQUENCE.length; offset += 1) {
    const candidate = BOT_QUIZ_DIFFICULTY_SEQUENCE[(startIndex + offset) % BOT_QUIZ_DIFFICULTY_SEQUENCE.length];
    if (hasBotQuizCatalogEntries(candidate)) return candidate;
  }
  return preferred;
}

function normalizeBotQuizDifficultyCursor(value) {
  const safeDifficulty = normalizeDifficulty(value || 'easy');
  if (BOT_QUIZ_DIFFICULTY_SEQUENCE.includes(safeDifficulty) && hasBotQuizCatalogEntries(safeDifficulty)) {
    return safeDifficulty;
  }
  return resolveBotQuizDifficultyWithCatalog('easy');
}

function getNextBotQuizDifficultyCursor(currentDifficulty, cycleNo = 0) {
  const safeDifficulty = normalizeDifficulty(currentDifficulty || 'easy');
  const currentIndex = BOT_QUIZ_DIFFICULTY_SEQUENCE.indexOf(safeDifficulty);
  const nextIndex = currentIndex >= 0
    ? (currentIndex + 1) % BOT_QUIZ_DIFFICULTY_SEQUENCE.length
    : 0;
  const wrapped = nextIndex === 0;
  const preferredDifficulty = BOT_QUIZ_DIFFICULTY_SEQUENCE[nextIndex] || 'easy';
  return {
    cursor_difficulty: resolveBotQuizDifficultyWithCatalog(preferredDifficulty),
    cursor_index: 0,
    cursor_cycle_no: Math.max(0, Number(cycleNo || 0)) + (wrapped ? 1 : 0)
  };
}

function normalizeBotQuizAssignment(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const botId = String(safe.bot_id || '').trim();
  const difficulty = normalizeDifficulty(safe.difficulty || 'easy');
  const botStrength = normalizeBotStrength(safe.bot_strength || SYSTEM_BOT_STRENGTH_DEFAULT);
  const language = String(safe.language || '').trim();
  const topic = String(safe.topic || '').trim();
  const totalQuestions = Math.max(1, Math.trunc(Number(safe.total_questions || QUESTIONS_PER_ROUND)));
  const correctCount = Math.max(0, Math.min(totalQuestions, Math.trunc(Number(safe.correct_count || 0))));
  return {
    bot_id: isSystemBotUserId(botId) ? botId : '',
    bot_strength: botStrength,
    language,
    topic,
    difficulty,
    quiz_key: String(safe.quiz_key || getQuizKey(language, topic, difficulty)).trim(),
    total_questions: totalQuestions,
    correct_count: correctCount,
    best_streak: Math.max(0, Math.min(correctCount, Math.trunc(Number(safe.best_streak || 0)))),
    simulated_accuracy: Math.max(0, Math.min(1, Number(safe.simulated_accuracy || 0)))
  };
}

function normalizeBotArenaQuizState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const cursorDifficulty = normalizeBotQuizDifficultyCursor(safe.cursor_difficulty || 'easy');
  const catalogSize = Math.max(0, Number(BOT_QUIZ_CATALOG_BY_DIFFICULTY[cursorDifficulty]?.length || 0));
  const rawCursorIndex = Math.max(0, Math.trunc(Number(safe.cursor_index || 0)));
  const assignments = (Array.isArray(safe.assignments) ? safe.assignments : [])
    .map((row) => normalizeBotQuizAssignment(row))
    .filter((row) => row.bot_id && row.language && row.topic)
    .slice(0, BOT_QUIZ_BATCH_SIZE);
  const status = String(safe.status || '').trim().toLowerCase() === 'active' && assignments.length >= BOT_QUIZ_BATCH_SIZE
    ? 'active'
    : 'idle';
  return {
    status,
    batch_id: String(safe.batch_id || '').trim(),
    assignments,
    started_at_ms: Math.max(0, Number(safe.started_at_ms || 0)),
    ends_at_ms: Math.max(0, Number(safe.ends_at_ms || 0)),
    cursor_difficulty: cursorDifficulty,
    cursor_index: catalogSize > 0 ? Math.min(rawCursorIndex, Math.max(0, catalogSize - 1)) : 0,
    cursor_cycle_no: Math.max(0, Math.trunc(Number(safe.cursor_cycle_no || 0))),
    updated_at: String(safe.updated_at || ''),
    last_result: safe.last_result && typeof safe.last_result === 'object' ? safe.last_result : null
  };
}

function getNextBotQuizCatalogEntry(cursorState = {}) {
  let cursorDifficulty = normalizeBotQuizDifficultyCursor(cursorState.cursor_difficulty || cursorState.difficulty || 'easy');
  let cursorIndex = Math.max(0, Math.trunc(Number(cursorState.cursor_index ?? cursorState.index ?? 0)));
  let cursorCycleNo = Math.max(0, Math.trunc(Number(cursorState.cursor_cycle_no ?? cursorState.cycle_no ?? 0)));

  for (let guard = 0; guard < BOT_QUIZ_DIFFICULTY_SEQUENCE.length * 6; guard += 1) {
    const list = BOT_QUIZ_CATALOG_BY_DIFFICULTY[cursorDifficulty] || [];
    if (list.length > 0 && cursorIndex < list.length) {
      const quiz = list[cursorIndex];
      let nextCursorDifficulty = cursorDifficulty;
      let nextCursorIndex = cursorIndex + 1;
      let nextCursorCycleNo = cursorCycleNo;
      if (nextCursorIndex >= list.length) {
        const advanced = getNextBotQuizDifficultyCursor(cursorDifficulty, cursorCycleNo);
        nextCursorDifficulty = advanced.cursor_difficulty;
        nextCursorIndex = advanced.cursor_index;
        nextCursorCycleNo = advanced.cursor_cycle_no;
      }
      return {
        quiz: { ...quiz },
        cursor: {
          cursor_difficulty: nextCursorDifficulty,
          cursor_index: nextCursorIndex,
          cursor_cycle_no: nextCursorCycleNo
        }
      };
    }

    const advanced = getNextBotQuizDifficultyCursor(cursorDifficulty, cursorCycleNo);
    cursorDifficulty = advanced.cursor_difficulty;
    cursorIndex = advanced.cursor_index;
    cursorCycleNo = advanced.cursor_cycle_no;
  }

  return null;
}

function takeNextBotQuizCatalogEntries(cursorState = {}, count = BOT_QUIZ_BATCH_SIZE) {
  let cursor = {
    cursor_difficulty: normalizeBotQuizDifficultyCursor(cursorState.cursor_difficulty || 'easy'),
    cursor_index: Math.max(0, Math.trunc(Number(cursorState.cursor_index || 0))),
    cursor_cycle_no: Math.max(0, Math.trunc(Number(cursorState.cursor_cycle_no || 0)))
  };
  const targetCount = Math.max(1, Math.trunc(Number(count || BOT_QUIZ_BATCH_SIZE)));
  const entries = [];

  for (let idx = 0; idx < targetCount; idx += 1) {
    const step = getNextBotQuizCatalogEntry(cursor);
    if (!step?.quiz) break;
    entries.push(step.quiz);
    cursor = step.cursor;
  }

  return {
    entries,
    cursor
  };
}

function getBotDifficultyModifierByStrength(_strength, _difficulty) {
  return 0;
}

function getBotQuizAccuracyTarget(config = {}, _difficulty = 'easy') {
  const strength = normalizeBotStrength(config?.strength || SYSTEM_BOT_STRENGTH_DEFAULT);
  return getBotAccuracyByStrength(strength);
}

function simulateBotQuizOutcome(botConfig = {}, quizEntry = {}, options = {}) {
  const totalQuestions = Math.max(
    1,
    Math.trunc(Number(quizEntry.total_questions || QUESTIONS_PER_ROUND))
  );
  const safeDifficulty = normalizeDifficulty(quizEntry.difficulty || 'easy');
  const strength = normalizeBotStrength(botConfig?.strength || SYSTEM_BOT_STRENGTH_DEFAULT);
  const targetAccuracy = getBotQuizAccuracyTarget({ strength }, safeDifficulty);
  const quizKey = getQuizKey(quizEntry.language || '', quizEntry.topic || '', safeDifficulty);
  const seedKey = String(options?.seed_key || '').trim() || `quiz:${strength}:${quizKey}:${totalQuestions}`;
  const run = resolveDeterministicBotRun(seedKey, targetAccuracy, totalQuestions, totalQuestions);

  return {
    correct_count: run.correct_count,
    total_questions: totalQuestions,
    best_streak: run.best_streak,
    simulated_accuracy: targetAccuracy
  };
}

function resolveDifficultyByPvpPoints(pointsValue) {
  const points = Math.max(0, Number(pointsValue || 0));
  if (points > 180) return 'hard';
  if (points > 90) return 'medium';
  return 'easy';
}

function getPvpPointsBoundsForDifficulty(difficulty) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  if (safeDifficulty === 'hard') {
    return { min: 181, max: Number.POSITIVE_INFINITY };
  }
  if (safeDifficulty === 'medium') {
    return { min: 91, max: 180 };
  }
  return { min: 0, max: 90 };
}

function getPvpXpRewardByDifficulty(difficulty, resultKey) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeResult = String(resultKey || '').trim().toLowerCase();
  const row = PVP_XP_REWARD[safeDifficulty] || PVP_XP_REWARD.easy;
  return Math.max(0, Number(row?.[safeResult] || 0));
}

function getPvpCoinsRewardByDifficulty(difficulty, resultKey) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeResult = String(resultKey || '').trim().toLowerCase();
  const row = PVP_COINS_REWARD[safeDifficulty] || PVP_COINS_REWARD.easy;
  return Math.max(0, Number(row?.[safeResult] || 0));
}

function getPvpResultFromWinner(matchRow, userId) {
  const uid = String(userId || '').trim();
  if (!uid) return 'draw';
  const winnerId = String(matchRow?.winner_user_id || '').trim();
  if (!winnerId) return 'draw';
  return winnerId === uid ? 'win' : 'loss';
}

function shouldSkipPvpRewardsByReason(endedReason) {
  const reason = String(endedReason || '').trim().toLowerCase();
  return reason === 'match_refused' || reason === 'accept_timeout';
}

function getInvalidFinishedPvpMatchReason(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (String(row.status || '').trim().toLowerCase() !== 'finished') return '';
  if (row.is_bot_quiz === true) return '';
  if (row.result_void === true) {
    return String(row.result_void_reason || '').trim() || 'voided_match';
  }
  const endedRoundNo = Math.max(0, Number(row.ended_round_no || row.round_no || 0));
  const shortMatch = endedRoundNo < 5;
  const p1 = Math.max(0, Number(row.player1_score || 0));
  const p2 = Math.max(0, Number(row.player2_score || 0));
  const zeroScore = p1 === 0 && p2 === 0;
  if (shortMatch && zeroScore) return 'under_min_rounds_zero_score';
  if (shortMatch) return 'under_min_rounds';
  if (zeroScore) return 'zero_score';
  return '';
}

function isInvalidFinishedPvpMatch(matchRow) {
  return !!getInvalidFinishedPvpMatchReason(matchRow);
}

function getMatchDecisiveRoundNo(matchRow, fallback = 5) {
  return Math.max(
    1,
    Number(matchRow?.ended_round_no || matchRow?.round_no || fallback)
  );
}

function getBotProfileEmojiByPersonality(personality) {
  const safePersonality = normalizeBotPersonality(personality);
  return String(BOT_PROFILE_EMOJI_BY_PERSONALITY[safePersonality] || 'emoji_common_happy');
}

function pickDeterministicBotCosmeticId(candidates, seedKey, fallbackId) {
  const pool = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  if (!pool.length) return String(fallbackId || '');
  const seed = Math.abs(hashBotSeed(seedKey));
  const index = seed % pool.length;
  return String(pool[index] || fallbackId || '');
}

function getDefaultSystemBotCosmetics(botId, personality = 'provocador') {
  const safeBotId = String(botId || SYSTEM_BOT_ID).trim() || SYSTEM_BOT_ID;
  const safePersonality = normalizeBotPersonality(personality);
  const personalityEmoji = getBotProfileEmojiByPersonality(safePersonality);
  return {
    frame: pickDeterministicBotCosmeticId(
      BOT_RANDOM_FRAME_IDS,
      `bot_cosmetic:frame:${safeBotId}`,
      BOT_DEFAULT_FRAME_ID
    ),
    background: pickDeterministicBotCosmeticId(
      BOT_RANDOM_BACKGROUND_IDS,
      `bot_cosmetic:bg:${safeBotId}`,
      BOT_DEFAULT_BACKGROUND_ID
    ),
    emoji: pickDeterministicBotCosmeticId(
      BOT_RANDOM_EMOJI_IDS,
      `bot_cosmetic:emoji:${safeBotId}:${safePersonality}`,
      personalityEmoji
    )
  };
}

function getDefaultSystemBotAvatar(botId, personality = 'provocador', fallbackAvatar = SYSTEM_BOT_DEFAULT_AVATAR) {
  const safeBotId = String(botId || SYSTEM_BOT_ID).trim() || SYSTEM_BOT_ID;
  const safePersonality = normalizeBotPersonality(personality);
  return pickDeterministicBotCosmeticId(
    BOT_RANDOM_AVATAR_ICONS,
    `bot_avatar:${safeBotId}:${safePersonality}`,
    fallbackAvatar
  );
}

function getSystemBotDefinition(botId = SYSTEM_BOT_ID) {
  const safeBotId = String(botId || '').trim();
  return SYSTEM_BOT_ROSTER.find((bot) => String(bot.id) === safeBotId) || SYSTEM_BOT_ROSTER[0];
}

export function isSystemBotUserId(userId) {
  const safeId = String(userId || '').trim();
  if (!safeId) return false;
  if (SYSTEM_BOT_ID_SET.has(safeId)) return true;
  return /^bot_sys_codequiz_[A-Za-z0-9_]+$/.test(safeId);
}

function normalizeSystemBotPersonality(value, fallback = 'provocador') {
  return normalizeBotPersonality(value || fallback);
}

function normalizeNicknameChars(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function sanitizeNickname(value) {
  const cleaned = normalizeNicknameChars(value).replace(/[^A-Za-z0-9]/g, '');
  return cleaned.slice(0, NICKNAME_MAX_LENGTH) || 'Jogador';
}

function isReservedBotNickname(value) {
  const normalized = normalizeNicknameChars(value)
    .replace(/[^A-Za-z0-9]/g, '')
    .toLowerCase();
  if (!normalized) return false;
  return SYSTEM_BOT_ROSTER.some((bot) => {
    const reserved = normalizeNicknameChars(bot.nickname)
      .replace(/[^A-Za-z0-9]/g, '')
      .toLowerCase();
    return reserved && normalized === reserved;
  });
}

export function validateNicknameInput(value) {
  const raw = normalizeNicknameChars(value);
  if (!raw) {
    return {
      ok: false,
      nickname: '',
      errorCode: 'nickname/required',
      errorMessage: 'Informe um apelido.'
    };
  }
  if (raw.length < NICKNAME_MIN_LENGTH) {
    return {
      ok: false,
      nickname: '',
      errorCode: 'nickname/too-short',
      errorMessage: `Apelido deve ter no minimo ${NICKNAME_MIN_LENGTH} caracteres.`
    };
  }
  if (raw.length > NICKNAME_MAX_LENGTH) {
    return {
      ok: false,
      nickname: '',
      errorCode: 'nickname/too-long',
      errorMessage: `Apelido deve ter no maximo ${NICKNAME_MAX_LENGTH} caracteres.`
    };
  }
  if (!/^[A-Za-z0-9]+$/.test(raw)) {
    return {
      ok: false,
      nickname: '',
      errorCode: 'nickname/invalid-format',
      errorMessage: 'Use apenas letras e numeros, sem espacos ou simbolos.'
    };
  }
  if (isReservedBotNickname(raw)) {
    return {
      ok: false,
      nickname: '',
      errorCode: 'nickname/reserved',
      errorMessage: 'Este apelido e reservado pelo sistema.'
    };
  }
  return {
    ok: true,
    nickname: raw,
    errorCode: '',
    errorMessage: ''
  };
}

function buildSystemBotUserPayload(botDef, current, nowIso, personality = 'provocador', strength = SYSTEM_BOT_STRENGTH_DEFAULT) {
  const base = current && typeof current === 'object' ? current : {};
  const def = botDef && typeof botDef === 'object' ? botDef : getSystemBotDefinition();
  const safePersonality = normalizeSystemBotPersonality(personality, def.default_personality || 'provocador');
  const safeStrength = normalizeSystemBotStrength(strength ?? def.default_strength ?? base.bot_strength);
  const fallbackCosmetics = getDefaultSystemBotCosmetics(def.id, safePersonality);
  const fallbackAvatar = getDefaultSystemBotAvatar(
    def.id,
    safePersonality,
    String(def.avatar || SYSTEM_BOT_DEFAULT_AVATAR)
  );
  const currentFrame = String(base.equipped_frame || '').trim();
  const currentBackground = String(base.equipped_background || '').trim();
  const currentEmoji = String(base.equipped_emoji || '').trim();
  const equippedFrame = (
    currentFrame
    && currentFrame !== BOT_DEFAULT_FRAME_ID
    && BOT_VALID_FRAME_ID_SET.has(currentFrame)
  )
    ? currentFrame
    : String(fallbackCosmetics.frame || BOT_DEFAULT_FRAME_ID);
  const equippedBackground = (
    currentBackground
    && currentBackground !== BOT_DEFAULT_BACKGROUND_ID
    && BOT_VALID_BACKGROUND_ID_SET.has(currentBackground)
  )
    ? currentBackground
    : String(fallbackCosmetics.background || BOT_DEFAULT_BACKGROUND_ID);
  const equippedEmoji = (
    currentEmoji
    && currentEmoji !== BOT_DEFAULT_EMOJI_ID
    && BOT_VALID_EMOJI_ID_SET.has(currentEmoji)
  )
    ? currentEmoji
    : String(fallbackCosmetics.emoji || getBotProfileEmojiByPersonality(safePersonality));
  return {
    id: def.id,
    auth_id: def.id,
    full_name: String(def.full_name || def.nickname || 'CodeQuiz Bot'),
    nickname: String(def.nickname || 'CodeQuizBot'),
    avatar: String(fallbackAvatar || SYSTEM_BOT_DEFAULT_AVATAR),
    equipped_frame: equippedFrame,
    equipped_background: equippedBackground,
    equipped_emoji: String(equippedEmoji),
    bot_gender: String(def.gender || base.bot_gender || 'neutral'),
    bot_personality: safePersonality,
    bot_strength: safeStrength,
    reset_ack_version: Number(base.reset_ack_version || 0),
    is_system_bot: true,
    created_at: base.created_at || nowIso,
    updated_at: nowIso
  };
}

function normalizeAchievementIds(value) {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set();
  const normalized = [];
  source.forEach((entry) => {
    const safe = String(entry || '').trim();
    if (!safe || seen.has(safe)) return;
    seen.add(safe);
    normalized.push(safe);
  });
  return normalized;
}

function normalizeQuizRewardedMap(value) {
  if (!value || typeof value !== 'object') return {};
  const next = {};
  Object.entries(value).forEach(([quizKey, row]) => {
    const safeQuizKey = String(quizKey || '').trim();
    if (!safeQuizKey || !row || typeof row !== 'object') return;
    next[safeQuizKey] = {
      xp: Math.max(0, Math.floor(Number(row.xp || 0))),
      coins: Math.max(0, Math.floor(Number(row.coins || 0)))
    };
  });
  return next;
}

function buildSystemBotStatsPayload(botDef, current, nowIso) {
  const base = current && typeof current === 'object' ? current : {};
  const def = botDef && typeof botDef === 'object' ? botDef : getSystemBotDefinition();
  return {
    user_id: def.id,
    total_xp: Math.max(0, Number(base.total_xp || 0)),
    level: Math.max(1, Number(base.level || 1)),
    ranking_points: Math.max(0, Number(base.ranking_points || 0)),
    pvp_points: Math.max(0, Number(base.pvp_points || 0)),
    coins: Math.max(0, Number(base.coins || 20)),
    pvp_battles: Math.max(0, Number(base.pvp_battles || 0)),
    pvp_wins: Math.max(0, Number(base.pvp_wins || 0)),
    pvp_losses: Math.max(0, Number(base.pvp_losses || 0)),
    pvp_processed_matches: base.pvp_processed_matches && typeof base.pvp_processed_matches === 'object'
      ? base.pvp_processed_matches
      : {},
    pvp_recalculated_at_ms: Math.max(0, Number(base.pvp_recalculated_at_ms || 0)),
    best_streak: Math.max(0, Number(base.best_streak || 0)),
    total_correct: Math.max(0, Number(base.total_correct || 0)),
    total_answered: Math.max(0, Number(base.total_answered || 0)),
    quizzes_completed: Math.max(0, Number(base.quizzes_completed || 0)),
    topic_progress: base.topic_progress && typeof base.topic_progress === 'object' ? base.topic_progress : {},
    quiz_best_scores: base.quiz_best_scores && typeof base.quiz_best_scores === 'object' ? base.quiz_best_scores : {},
    quiz_best_stars: base.quiz_best_stars && typeof base.quiz_best_stars === 'object' ? base.quiz_best_stars : {},
    achievement_ids: normalizeAchievementIds(base.achievement_ids || base.achievements),
    quiz_rewarded: normalizeQuizRewardedMap(base.quiz_rewarded),
    is_system_bot: true,
    updated_at: nowIso
  };
}

function buildSystemBotConfigPayload(botDef, current, nowIso) {
  const base = current && typeof current === 'object' ? current : {};
  const def = botDef && typeof botDef === 'object' ? botDef : getSystemBotDefinition();
  const personality = normalizeSystemBotPersonality(
    base.personality,
    def.default_personality || 'provocador'
  );
  const strength = normalizeSystemBotStrength(def.default_strength ?? base.strength);
  return {
    bot_id: def.id,
    nickname: String(def.nickname || 'CodeQuizBot'),
    personality,
    strength,
    gender: String(def.gender || 'neutral'),
    updated_at: nowIso
  };
}

let ensureSystemBotsPromise = null;
let ensureSystemBotsCachedSnapshots = null;
let ensureSystemBotsLastSuccessAtMs = 0;

export async function ensureSystemBots(options = {}) {
  const forceRefresh = options?.force === true;
  const nowMs = Date.now();
  const cacheIsFresh = (
    !forceRefresh
    && Array.isArray(ensureSystemBotsCachedSnapshots)
    && ensureSystemBotsCachedSnapshots.length > 0
    && (nowMs - ensureSystemBotsLastSuccessAtMs) < ENSURE_SYSTEM_BOTS_MIN_INTERVAL_MS
  );
  if (cacheIsFresh) {
    return ensureSystemBotsCachedSnapshots;
  }
  if (ensureSystemBotsPromise) return ensureSystemBotsPromise;

  ensureSystemBotsPromise = (async () => {
    const nowIso = new Date().toISOString();
    const configsByBotId = {};

    // Process bots sequentially to avoid overwhelming the Firebase WebSocket connection
    // with too many simultaneous transactions during startup.
    for (const botDef of SYSTEM_BOT_ROSTER) {
      await runTransaction(ref(firebaseDb, `pvp_bots_state/configs/${botDef.id}`), (current) => {
        const next = buildSystemBotConfigPayload(botDef, current, nowIso);
        configsByBotId[botDef.id] = next;
        return next;
      }).catch(() => null);
    }

    const primaryConfig = configsByBotId[SYSTEM_BOT_ID] || buildSystemBotConfigPayload(getSystemBotDefinition(SYSTEM_BOT_ID), {}, nowIso);
    await set(ref(firebaseDb, 'pvp_bots_state/config'), primaryConfig).catch(() => null);

    for (const botDef of SYSTEM_BOT_ROSTER) {
      const botConfig = configsByBotId[botDef.id] || buildSystemBotConfigPayload(botDef, {}, nowIso);
      await runTransaction(ref(firebaseDb, `users/${botDef.id}`), (current) => (
        buildSystemBotUserPayload(botDef, current, nowIso, botConfig.personality, botConfig.strength)
      )).catch(() => null);
      await runTransaction(ref(firebaseDb, `user_stats/${botDef.id}`), (current) => (
        buildSystemBotStatsPayload(botDef, current, nowIso)
      )).catch(() => null);
    }

    const snapshots = [];
    for (const botDef of SYSTEM_BOT_ROSTER) {
      const [profile, stats] = await Promise.all([
        getUserProfile(botDef.id).catch(() => null),
        getUserStats(botDef.id).catch(() => null)
      ]);
      snapshots.push({
        bot_id: botDef.id,
        profile,
        stats,
        config: configsByBotId[botDef.id] || null
      });
    }

    return snapshots;
  })();

  try {
    const snapshots = await ensureSystemBotsPromise;
    if (Array.isArray(snapshots) && snapshots.length > 0) {
      ensureSystemBotsCachedSnapshots = snapshots;
      ensureSystemBotsLastSuccessAtMs = Date.now();
      snapshots.forEach((row) => {
        setCachedBotSnapshot(row, 'remote');
      });
    }
    return snapshots;
  } finally {
    ensureSystemBotsPromise = null;
  }
}

export async function ensureSystemBot() {
  const all = await ensureSystemBots().catch(() => null);
  if (Array.isArray(all) && all.length) {
    const primary = all.find((row) => String(row?.bot_id || '') === SYSTEM_BOT_ID);
    if (primary?.profile && primary?.stats) return { profile: primary.profile, stats: primary.stats };
  }
  const [profile, stats] = await Promise.all([
    getUserProfile(SYSTEM_BOT_ID),
    getUserStats(SYSTEM_BOT_ID)
  ]);
  return { profile, stats };
}

export async function getSystemBotSnapshot(botId = SYSTEM_BOT_ID, options = {}) {
  const safeBotDef = getSystemBotDefinition(botId);
  const safeBotId = safeBotDef.id;
  const waitForEnsure = options && options.waitForEnsure === true;
  const preferLocal = options && options.preferLocal === true;
  const localMaxAgeMs = Math.max(
    1000,
    Number(options?.localMaxAgeMs || BOT_LOCAL_CACHE_MAX_AGE_MS)
  );
  const cachedSnapshot = getCachedBotSnapshot(safeBotId, localMaxAgeMs);
  if (preferLocal && cachedSnapshot) return cachedSnapshot;

  if (waitForEnsure) {
    await ensureSystemBots({ force: true }).catch(() => null);
  } else {
    void ensureSystemBots().catch(() => null);
  }
  const nowIso = new Date().toISOString();
  const [profile, stats, config] = await Promise.all([
    getUserProfile(safeBotId).catch(() => null),
    getUserStats(safeBotId).catch(() => null),
    getPvpBotConfig(safeBotId, {
      waitForEnsure: false,
      preferLocal
    }).catch(() => null)
  ]);

  const safeConfig = config && typeof config === 'object'
    ? config
    : (
      cachedSnapshot?.config && typeof cachedSnapshot.config === 'object'
        ? cachedSnapshot.config
        : buildSystemBotConfigPayload(safeBotDef, {}, nowIso)
    );
  const safeProfile = profile && typeof profile === 'object'
    ? profile
    : (
      cachedSnapshot?.profile && typeof cachedSnapshot.profile === 'object'
        ? cachedSnapshot.profile
        : buildSeedBotSnapshot(safeBotId, nowIso).profile
    );
  const safeStats = stats && typeof stats === 'object'
    ? stats
    : (
      cachedSnapshot?.stats && typeof cachedSnapshot.stats === 'object'
        ? cachedSnapshot.stats
        : buildSeedBotSnapshot(safeBotId, nowIso).stats
    );

  const snapshotSource = (
    profile && typeof profile === 'object' && stats && typeof stats === 'object'
  )
    ? 'remote'
    : (
      cachedSnapshot ? 'local_cache' : 'local_seed'
    );
  const nextSnapshot = {
    bot_id: safeBotId,
    profile: safeProfile,
    stats: safeStats,
    config: safeConfig,
    profile_is_fallback: false,
    stats_is_fallback: false,
    config_is_fallback: false,
    snapshot_source: snapshotSource
  };
  setCachedBotSnapshot(nextSnapshot, snapshotSource);
  return nextSnapshot;
}

export async function getAllSystemBotSnapshots() {
  await ensureSystemBots().catch(() => null);
  const snapshots = await Promise.all(SYSTEM_BOT_ROSTER.map((botDef) => getSystemBotSnapshot(botDef.id)));
  return snapshots.filter((row) => row?.profile && row?.stats && row?.stats_is_fallback !== true);
}

export async function getRandomSystemBotSnapshot() {
  const list = await getAllSystemBotSnapshots().catch(() => []);
  if (!Array.isArray(list) || !list.length) return getSystemBotSnapshot(SYSTEM_BOT_ID);
  const index = Math.floor(Math.random() * list.length);
  return list[index] || list[0];
}

export async function getPvpBotConfig(botId = SYSTEM_BOT_ID, options = {}) {
  const botDef = getSystemBotDefinition(botId);
  const preferLocal = options && options.preferLocal === true;
  const localSnapshot = getCachedBotSnapshot(botDef.id, BOT_LOCAL_CACHE_MAX_AGE_MS);
  const localConfig = localSnapshot?.config && typeof localSnapshot.config === 'object'
    ? localSnapshot.config
    : null;
  if (preferLocal && localConfig) {
    return {
      ...localConfig
    };
  }
  const waitForEnsure = options && options.waitForEnsure === true;
  if (waitForEnsure) {
    await ensureSystemBots({ force: true }).catch(() => null);
  } else {
    void ensureSystemBots().catch(() => null);
  }
  const configPath = botDef.id === SYSTEM_BOT_ID ? 'pvp_bots_state/config' : `pvp_bots_state/configs/${botDef.id}`;
  const nowIso = new Date().toISOString();
  let row = null;
  try {
    row = await getNode(configPath);
  } catch (_readError) {
    row = null;
  }
  if (!row || typeof row !== 'object') {
    const fallback = localConfig && typeof localConfig === 'object'
      ? {
        ...localConfig,
        bot_id: botDef.id,
        nickname: String(botDef.nickname || SYSTEM_BOT_NICKNAME),
        personality: normalizeSystemBotPersonality(
          localConfig.personality,
          botDef.default_personality || 'provocador'
        ),
        strength: normalizeSystemBotStrength(botDef.default_strength ?? localConfig.strength),
        gender: String(botDef.gender || localConfig.gender || 'neutral'),
        updated_at: String(localConfig.updated_at || nowIso)
      }
      : buildSystemBotConfigPayload(botDef, {}, nowIso);
    await set(ref(firebaseDb, configPath), fallback).catch(() => null);
    const seedSnapshot = localSnapshot || buildSeedBotSnapshot(botDef.id, nowIso);
    setCachedBotSnapshot({
      bot_id: botDef.id,
      profile: seedSnapshot.profile,
      stats: seedSnapshot.stats,
      config: fallback
    }, localSnapshot ? 'local_cache' : 'local_seed');
    return fallback;
  }
  const normalized = {
    bot_id: botDef.id,
    nickname: String(botDef.nickname || SYSTEM_BOT_NICKNAME),
    personality: normalizeSystemBotPersonality(row.personality, botDef.default_personality || 'provocador'),
    strength: normalizeSystemBotStrength(botDef.default_strength ?? row.strength),
    gender: String(botDef.gender || row.gender || 'neutral'),
    updated_at: String(row.updated_at || nowIso)
  };
  if (botDef.id !== SYSTEM_BOT_ID) {
    await set(ref(firebaseDb, `pvp_bots_state/configs/${botDef.id}`), normalized).catch(() => null);
  }
  const seedSnapshot = localSnapshot || buildSeedBotSnapshot(botDef.id, nowIso);
  setCachedBotSnapshot({
    bot_id: botDef.id,
    profile: seedSnapshot.profile,
    stats: seedSnapshot.stats,
    config: normalized
  }, 'remote');
  return {
    ...normalized
  };
}

export async function updatePvpBotConfig(patch = {}, botId = SYSTEM_BOT_ID) {
  const botDef = getSystemBotDefinition(botId);
  const current = await getPvpBotConfig(botDef.id);
  const nowIso = new Date().toISOString();
  const next = {
    ...current,
    personality: normalizeSystemBotPersonality(
      patch?.personality ?? current.personality,
      botDef.default_personality || 'provocador'
    ),
    strength: normalizeSystemBotStrength(patch?.strength ?? current.strength ?? botDef.default_strength),
    gender: String(botDef.gender || current.gender || 'neutral'),
    updated_at: nowIso
  };
  const configPath = botDef.id === SYSTEM_BOT_ID ? 'pvp_bots_state/config' : `pvp_bots_state/configs/${botDef.id}`;
  await set(ref(firebaseDb, configPath), next);
  await set(ref(firebaseDb, `pvp_bots_state/configs/${botDef.id}`), next).catch(() => null);
  if (botDef.id === SYSTEM_BOT_ID) {
    await set(ref(firebaseDb, 'pvp_bots_state/config'), next).catch(() => null);
  }
  await runTransaction(ref(firebaseDb, `users/${botDef.id}`), (row) => (
    buildSystemBotUserPayload(botDef, row, nowIso, next.personality, next.strength)
  ));
  const seedSnapshot = getCachedBotSnapshot(botDef.id, BOT_LOCAL_CACHE_MAX_AGE_MS)
    || buildSeedBotSnapshot(botDef.id, nowIso);
  setCachedBotSnapshot({
    bot_id: botDef.id,
    profile: seedSnapshot.profile,
    stats: seedSnapshot.stats,
    config: next
  }, 'remote');
  return next;
}

function nicknameKey(value) {
  return sanitizeNickname(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function getNode(path) {
  const snap = await get(ref(firebaseDb, path));
  return snap.exists() ? snap.val() : null;
}

export async function getBotArenaDaemonControl() {
  const nowIso = new Date().toISOString();
  const row = await getNode(BOT_DAEMON_CONTROL_PATH).catch(() => null);
  const normalized = normalizeBotArenaDaemonControl(row);
  const shouldHydrateDefaults = !row
    || typeof row !== 'object'
    || typeof row.arena_enabled !== 'boolean'
    || typeof row.pvp_enabled !== 'boolean'
    || typeof row.quiz_enabled !== 'boolean';
  if (shouldHydrateDefaults) {
    const next = {
      ...normalized,
      updated_at: normalized.updated_at || nowIso
    };
    await set(ref(firebaseDb, BOT_DAEMON_CONTROL_PATH), next).catch(() => null);
    return next;
  }
  return normalized;
}

export async function setBotArenaDaemonControl(nextControl, actorId = '') {
  const nowIso = new Date().toISOString();
  const current = await getBotArenaDaemonControl().catch(() => normalizeBotArenaDaemonControl(null));
  const safeCurrent = normalizeBotArenaDaemonControl(current);
  const isObjectPatch = !!nextControl && typeof nextControl === 'object' && !Array.isArray(nextControl);
  let nextPvpEnabled = safeCurrent.pvp_enabled;
  let nextQuizEnabled = safeCurrent.quiz_enabled;

  if (isObjectPatch) {
    const patch = nextControl;
    const hasMasterField = Object.prototype.hasOwnProperty.call(patch, 'arena_enabled');
    const hasPvpField = Object.prototype.hasOwnProperty.call(patch, 'pvp_enabled');
    const hasQuizField = Object.prototype.hasOwnProperty.call(patch, 'quiz_enabled');
    const patchMasterEnabled = hasMasterField
      ? parseBooleanLike(patch.arena_enabled, safeCurrent.arena_enabled)
      : safeCurrent.arena_enabled;

    if (hasPvpField) {
      nextPvpEnabled = parseBooleanLike(patch.pvp_enabled, safeCurrent.pvp_enabled);
    }
    if (hasQuizField) {
      nextQuizEnabled = parseBooleanLike(patch.quiz_enabled, safeCurrent.quiz_enabled);
    }

    if (hasMasterField && !hasPvpField && !hasQuizField) {
      nextPvpEnabled = patchMasterEnabled;
      nextQuizEnabled = patchMasterEnabled;
    } else if (hasMasterField && patchMasterEnabled === false) {
      nextPvpEnabled = false;
      nextQuizEnabled = false;
    }
  } else {
    const enabled = parseBooleanLike(nextControl, safeCurrent.arena_enabled);
    nextPvpEnabled = enabled;
    nextQuizEnabled = enabled;
  }

  const next = {
    arena_enabled: nextPvpEnabled || nextQuizEnabled,
    pvp_enabled: nextPvpEnabled,
    quiz_enabled: nextQuizEnabled,
    updated_at: nowIso,
    updated_by: String(actorId || '').trim() || 'admin'
  };
  await set(ref(firebaseDb, BOT_DAEMON_CONTROL_PATH), next);
  return next;
}

export function subscribeBotArenaDaemonControl(onChange, onError = null) {
  if (typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, BOT_DAEMON_CONTROL_PATH);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const row = snap.exists() ? snap.val() : null;
      onChange(normalizeBotArenaDaemonControl(row));
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function getBotArenaDaemonStatus() {
  const row = await getNode(BOT_DAEMON_STATUS_PATH).catch(() => null);
  return normalizeBotArenaDaemonStatus(row);
}

export function subscribeBotArenaDaemonStatus(onChange, onError = null) {
  if (typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, BOT_DAEMON_STATUS_PATH);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const row = snap.exists() ? snap.val() : null;
      onChange(normalizeBotArenaDaemonStatus(row));
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function getBotArenaQuizState() {
  const row = await getNode(BOT_ARENA_QUIZ_STATE_PATH).catch(() => null);
  return normalizeBotArenaQuizState(row);
}

export function subscribeBotArenaQuizState(onChange, onError = null) {
  if (typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, BOT_ARENA_QUIZ_STATE_PATH);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const row = snap.exists() ? snap.val() : null;
      onChange(normalizeBotArenaQuizState(row));
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

async function syncUserQueueOrderFromArena(order, nowIso = new Date().toISOString()) {
  const safeOrder = normalizeBotQueueOrder(order);
  await set(ref(firebaseDb, BOT_USER_QUEUE_PATH), {
    order: safeOrder,
    updated_at: nowIso
  }).catch(() => null);
  setCachedBotQueueOrder(safeOrder);
  return safeOrder;
}

async function ensureArenaQueueNode() {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  await runTransaction(ref(firebaseDb, BOT_ARENA_QUEUE_PATH), (current) => {
    const safe = normalizeArenaQueueState(current);
    return {
      order: safe.order,
      cycle_no: safe.cycle_no,
      cycle_played: safe.cycle_played,
      updated_at: nowIso,
      updated_at_ms: nowMs
    };
  });
  const row = await getNode(BOT_ARENA_QUEUE_PATH).catch(() => null);
  return normalizeArenaQueueState(row);
}

async function rotateGlobalBotQueue(botIds = [], options = {}) {
  const uniqueBotIds = [...new Set((Array.isArray(botIds) ? botIds : [])
    .map((id) => String(id || '').trim())
    .filter((id) => isSystemBotUserId(id)))];
  if (!uniqueBotIds.length) {
    const arenaState = await ensureArenaQueueNode().catch(() => normalizeArenaQueueState(null));
    await syncUserQueueOrderFromArena(arenaState.order).catch(() => null);
    return arenaState;
  }

  const countForArenaCycle = options?.count_for_arena_cycle === true;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const tx = await runTransaction(ref(firebaseDb, BOT_ARENA_QUEUE_PATH), (current) => {
    const safe = normalizeArenaQueueState(current);
    let nextOrder = normalizeBotQueueOrder(safe.order);
    uniqueBotIds.forEach((botId) => {
      nextOrder = rotateBotQueueOrder(nextOrder, botId);
    });

    let cyclePlayed = normalizeArenaCyclePlayed(safe.cycle_played);
    if (countForArenaCycle) {
      uniqueBotIds.forEach((botId) => {
        cyclePlayed[botId] = true;
      });
    }

    let cycleNo = Math.max(0, Number(safe.cycle_no || 0));
    if (countForArenaCycle && isArenaCycleCompleted(cyclePlayed)) {
      const shuffleSeed = nowMs + ((cycleNo + 1) * 97) + (nextOrder.length * 31);
      nextOrder = shuffleBotQueueOrder(nextOrder, shuffleSeed);
      cyclePlayed = {};
      cycleNo += 1;
    }

    return {
      order: nextOrder,
      cycle_no: cycleNo,
      cycle_played: cyclePlayed,
      updated_at: nowIso,
      updated_at_ms: nowMs
    };
  });

  const arenaState = normalizeArenaQueueState(tx?.snapshot?.val());
  await syncUserQueueOrderFromArena(arenaState.order, nowIso).catch(() => null);
  ensureBotQueuesCached = {
    userOrder: normalizeBotQueueOrder(arenaState.order),
    arenaOrder: normalizeBotQueueOrder(arenaState.order),
    arenaState: {
      ...arenaState,
      order: normalizeBotQueueOrder(arenaState.order)
    }
  };
  ensureBotQueuesCachedAtMs = Date.now();
  return arenaState;
}

async function ensureBotQueues(options = {}) {
  const forceRefresh = options?.force === true;
  const nowMs = Date.now();
  if (
    !forceRefresh
    && ensureBotQueuesCached
    && typeof ensureBotQueuesCached === 'object'
    && (nowMs - ensureBotQueuesCachedAtMs) < ENSURE_BOT_QUEUES_MIN_INTERVAL_MS
  ) {
    return ensureBotQueuesCached;
  }

  try {
    const arenaState = await ensureArenaQueueNode();
    const order = normalizeBotQueueOrder(arenaState.order);
    await syncUserQueueOrderFromArena(order).catch(() => null);
    const next = {
      userOrder: order,
      arenaOrder: order,
      arenaState: {
        ...arenaState,
        order
      }
    };
    ensureBotQueuesCached = next;
    ensureBotQueuesCachedAtMs = Date.now();
    setCachedBotQueueOrder(order);
    return next;
  } catch (_error) {
    const localOrder = getCachedBotQueueOrder();
    const fallbackState = normalizeArenaQueueState({
      order: localOrder,
      updated_at: new Date().toISOString(),
      updated_at_ms: Date.now()
    });
    const fallback = {
      userOrder: localOrder,
      arenaOrder: localOrder,
      arenaState: {
        ...fallbackState,
        order: localOrder,
        local_only: true
      }
    };
    ensureBotQueuesCached = fallback;
    ensureBotQueuesCachedAtMs = Date.now();
    return fallback;
  }
}

async function getBusyBotsFromOpenMatches() {
  const rows = await getPvpMatchRowsCached({ maxAgeMs: PVP_MATCH_ROWS_CACHE_TTL_MS }).catch(() => null);
  if (!rows || typeof rows !== 'object') return new Set();
  const busy = new Set();
  Object.values(rows).forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const status = String(row.status || '').trim().toLowerCase();
    if (status !== 'pending_accept' && status !== 'active' && status !== 'round_result') return;
    const p1 = String(row.player1_user_id || '').trim();
    const p2 = String(row.player2_user_id || '').trim();
    if (isSystemBotUserId(p1)) busy.add(p1);
    if (isSystemBotUserId(p2)) busy.add(p2);
  });
  return busy;
}

async function hasAnyActiveBotDuelMatch() {
  const rows = await getPvpMatchRowsCached({ maxAgeMs: PVP_MATCH_ROWS_CACHE_TTL_MS }).catch(() => null);
  if (!rows || typeof rows !== 'object') return false;
  return Object.values(rows).some((row) => {
    if (!row || typeof row !== 'object') return false;
    const status = String(row.status || '').trim().toLowerCase();
    if (status !== 'pending_accept' && status !== 'active' && status !== 'round_result') return false;
    return row.is_bot_duel === true;
  });
}

function isOpenPvpMatchStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  return status === 'pending_accept' || status === 'active' || status === 'round_result';
}

function extractBotDuelIds(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const duelIds = Array.isArray(row.bot_duel_ids)
    ? row.bot_duel_ids.map((id) => String(id || '').trim()).filter((id) => isSystemBotUserId(id))
    : [];
  const p1 = String(row.player1_user_id || '').trim();
  const p2 = String(row.player2_user_id || '').trim();
  const botA = duelIds[0] || (isSystemBotUserId(p1) ? p1 : '');
  const botB = duelIds[1] || (isSystemBotUserId(p2) ? p2 : '');
  if (!botA || !botB || botA === botB) return [];
  return [botA, botB];
}

function resolveBotDuelWinnerId(matchRow, botAId, botBId) {
  const safeBotA = String(botAId || '').trim();
  const safeBotB = String(botBId || '').trim();
  const winnerId = String(matchRow?.winner_user_id || '').trim();
  if (winnerId === safeBotA || winnerId === safeBotB) return winnerId;

  const p1 = String(matchRow?.player1_user_id || '').trim();
  const p2 = String(matchRow?.player2_user_id || '').trim();
  const scoreA = p1 === safeBotA
    ? Math.max(0, Number(matchRow?.player1_score || 0))
    : Math.max(0, Number(matchRow?.player2_score || 0));
  const scoreB = p1 === safeBotA
    ? Math.max(0, Number(matchRow?.player2_score || 0))
    : Math.max(0, Number(matchRow?.player1_score || 0));

  if (scoreA > scoreB) return safeBotA;
  if (scoreB > scoreA) return safeBotB;
  return Math.random() < 0.5 ? safeBotA : safeBotB;
}

async function forceFinishBotDuelMatch(matchId, matchRow, endedReason = 'bot_duel_timeout_recovered') {
  const safeMatchId = String(matchId || '').trim();
  if (!safeMatchId) return false;
  const bots = extractBotDuelIds(matchRow);
  if (bots.length < 2) return false;

  const [botAId, botBId] = bots;
  const winnerId = resolveBotDuelWinnerId(matchRow, botAId, botBId);
  const nowIso = new Date().toISOString();
  const endedRoundNo = Math.max(
    BOT_ARENA_BASE_ROUNDS,
    Number(matchRow?.ended_round_no || matchRow?.round_no || BOT_ARENA_BASE_ROUNDS)
  );

  await updatePvpMatch(safeMatchId, {
    status: 'finished',
    winner_user_id: winnerId,
    ended_reason: String(endedReason || 'bot_duel_timeout_recovered'),
    ended_by_user_id: winnerId,
    ended_round_no: endedRoundNo,
    ended_at: nowIso
  }).catch(() => null);

  const latest = await getPvpMatch(safeMatchId).catch(() => null);
  if (latest && typeof latest === 'object') {
    await applyBotDuelStatsFromMatch(latest).catch(() => null);
  } else {
    await Promise.all([
      clearBotBusy(botAId, safeMatchId),
      clearBotBusy(botBId, safeMatchId)
    ]).catch(() => null);
  }
  return true;
}

async function recoverStaleOrDuplicateBotDuels(nowMs = Date.now()) {
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return { recovered: 0 };

  const openDuels = Object.entries(rows)
    .filter(([id, row]) => !!id && row && typeof row === 'object' && row.is_bot_duel === true && isOpenPvpMatchStatus(row.status))
    .map(([id, row]) => {
      const updatedAtMs = toMillis(row.updated_at || row.round_started_at || row.created_at);
      return {
        id: String(id),
        row,
        updatedAtMs
      };
    })
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);

  if (!openDuels.length) return { recovered: 0 };

  const toRecover = [];
  openDuels.forEach((entry, index) => {
    const ageMs = entry.updatedAtMs > 0 ? Math.max(0, nowMs - entry.updatedAtMs) : BOT_DUEL_MAX_ACTIVE_AGE_MS + 1;
    const stale = ageMs >= BOT_DUEL_MAX_ACTIVE_AGE_MS;
    const duplicate = index >= 1;
    if (stale || duplicate) {
      toRecover.push({
        ...entry,
        reason: stale ? 'bot_duel_timeout_recovered' : 'bot_duel_superseded'
      });
    }
  });

  if (!toRecover.length) return { recovered: 0 };
  for (const entry of toRecover.slice(0, BOT_DUEL_RECOVERY_MAX_BATCH)) {
    await forceFinishBotDuelMatch(entry.id, entry.row, entry.reason).catch(() => null);
  }
  return { recovered: toRecover.length };
}

function isBotBusyRowActive(row, nowMs = Date.now()) {
  if (!row || typeof row !== 'object') return false;
  if (row.busy === false) return false;
  const matchId = String(row.match_id || '').trim();
  if (matchId) return true;
  const untilMs = Math.max(0, Number(row.until_ms || 0));
  return untilMs > nowMs;
}

async function cleanupOrphanBotBusyEntries(nowMs = Date.now()) {
  const [busyRows, matchRows] = await Promise.all([
    getNode(BOT_BUSY_PATH).catch(() => null),
    getNode('pvp_matches').catch(() => null)
  ]);

  if (!busyRows || typeof busyRows !== 'object') return;

  const activeMatchIds = new Set();
  if (matchRows && typeof matchRows === 'object') {
    Object.entries(matchRows).forEach(([matchId, row]) => {
      if (!row || typeof row !== 'object') return;
      const status = String(row.status || '').trim().toLowerCase();
      if (status === 'pending_accept' || status === 'active' || status === 'round_result') {
        if (isStaleOpenBotUserMatch(row, nowMs)) return;
        activeMatchIds.add(String(matchId));
      }
    });
  }

  const cleanupTasks = [];
  Object.entries(busyRows).forEach(([botId, row]) => {
    if (!isSystemBotUserId(botId)) return;
    if (!row || typeof row !== 'object') return;
    const matchId = String(row.match_id || '').trim();
    const updatedMs = toMillis(row.updated_at_ms || row.updated_at);
    if (!matchId) {
      const untilMs = Math.max(0, Number(row.until_ms || 0));
      if (untilMs > 0 && nowMs <= untilMs) return;
      if (updatedMs > 0 && nowMs - updatedMs < 10000) return;
      cleanupTasks.push(set(ref(firebaseDb, `${BOT_BUSY_PATH}/${botId}`), null).catch(() => null));
      return;
    }
    if (activeMatchIds.has(matchId)) return;
    if (updatedMs > 0 && nowMs - updatedMs < 10000) return;
    cleanupTasks.push(set(ref(firebaseDb, `${BOT_BUSY_PATH}/${botId}`), null).catch(() => null));
  });

  if (cleanupTasks.length) {
    await Promise.all(cleanupTasks);
  }
}

export async function setBotBusy(botId, payload = {}) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return null;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const reason = String(payload.reason || 'busy').trim() || 'busy';
  const matchId = String(payload.match_id || '').trim();
  const source = String(payload.source || '').trim();
  const untilMs = Math.max(0, Number(payload.until_ms || 0));
  const value = {
    busy: true,
    reason,
    match_id: matchId || null,
    source: source || null,
    updated_at: nowIso,
    updated_at_ms: nowMs,
    until_ms: untilMs || null
  };
  const tx = await runTransaction(ref(firebaseDb, `${BOT_BUSY_PATH}/${safeBotId}`), (current) => {
    const cur = current && typeof current === 'object' ? current : null;
    const curMatchId = String(cur?.match_id || '').trim();
    const curBusy = cur?.busy === true;
    const curUntilMs = Math.max(0, Number(cur?.until_ms || 0));

    // Never overwrite a busy lock from another active match.
    if (curBusy && curMatchId && matchId && curMatchId !== matchId) return;
    if (curBusy && curMatchId && !matchId) return;
    if (curBusy && !curMatchId && curUntilMs > nowMs && !matchId) return;

    return value;
  });
  if (!tx?.committed) return null;
  return tx.snapshot?.val() || value;
}

export async function clearBotBusy(botId, matchId = '') {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return false;
  const safeMatchId = String(matchId || '').trim();
  await runTransaction(ref(firebaseDb, `${BOT_BUSY_PATH}/${safeBotId}`), (current) => {
    if (!current || typeof current !== 'object') return null;
    if (safeMatchId) {
      const currentMatchId = String(current.match_id || '').trim();
      if (currentMatchId && currentMatchId !== safeMatchId) return current;
    }
    return null;
  });
  return true;
}

async function clearBotBusyBySource(botId, sourceHint = BOT_QUIZ_BUSY_SOURCE) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return false;
  const safeSource = String(sourceHint || '').trim();
  await runTransaction(ref(firebaseDb, `${BOT_BUSY_PATH}/${safeBotId}`), (current) => {
    if (!current || typeof current !== 'object') return null;
    const matchId = String(current.match_id || '').trim();
    if (matchId) return current;
    const rowSource = String(current.source || '').trim();
    const rowReason = String(current.reason || '').trim().toLowerCase();
    const sourceMatches = safeSource
      ? (rowSource === safeSource || rowReason === 'bot_quiz')
      : (rowReason === 'bot_quiz');
    if (!sourceMatches) return current;
    return null;
  }).catch(() => null);
  return true;
}

export async function rotateUserBotQueue(botId, reason = '') {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return [];
  const beforeRow = await getNode(BOT_USER_QUEUE_PATH).catch(() => null);
  const beforeOrder = normalizeBotQueueOrder(beforeRow?.order);
  const arenaState = await rotateGlobalBotQueue([safeBotId], { count_for_arena_cycle: false }).catch(() => null);
  const afterOrder = normalizeBotQueueOrder(arenaState?.order);
  try {
    const stamp = new Date().toISOString();
    const beforeHead = beforeOrder.slice(0, 6);
    const afterHead = afterOrder.slice(0, 6);
    console.log(
      `[BOT_ROTATION][${stamp}] rotate_user_queue`,
      {
        bot_id: safeBotId,
        reason: String(reason || '').trim() || 'unspecified',
        before_head: beforeHead,
        after_head: afterHead,
        before_head_compact: beforeHead.join(' > '),
        after_head_compact: afterHead.join(' > '),
        moved_to_tail: afterOrder.length > 0 && afterOrder[afterOrder.length - 1] === safeBotId
      }
    );
  } catch {
    // ignore log errors
  }
  return afterOrder;
}

async function rotateArenaDuelQueue(botAId, botBId) {
  const ids = [botAId, botBId]
    .map((id) => String(id || '').trim())
    .filter((id) => isSystemBotUserId(id));
  if (ids.length < 2) return normalizeBotQueueOrder([]);
  const arenaState = await rotateGlobalBotQueue(ids, { count_for_arena_cycle: true }).catch(() => null);
  return normalizeBotQueueOrder(arenaState?.order);
}

async function getBotDifficultyById(botId, userStatsMap = null) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return 'easy';
  const statsMap = userStatsMap && typeof userStatsMap === 'object' ? userStatsMap : {};
  const row = statsMap[safeBotId] && typeof statsMap[safeBotId] === 'object'
    ? statsMap[safeBotId]
    : null;
  if (row) return resolveDifficultyByPvpPoints(row.pvp_points);
  const stats = await getUserStats(safeBotId).catch(() => null);
  return resolveDifficultyByPvpPoints(stats?.pvp_points || 0);
}

async function ensureBotDifficultyForMatch(botId, targetDifficulty, userStatsMap = null) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return false;
  const safeTargetDifficulty = normalizeDifficulty(targetDifficulty || 'easy');
  const targetBounds = getPvpPointsBoundsForDifficulty(safeTargetDifficulty);
  const isInTargetCategory = (pointsValue) => {
    const points = Math.max(0, Number(pointsValue || 0));
    return points >= targetBounds.min && points <= targetBounds.max;
  };

  const statsMap = userStatsMap && typeof userStatsMap === 'object' ? userStatsMap : null;
  const currentPoints = Math.max(
    0,
    Number(
      statsMap && statsMap[safeBotId] && typeof statsMap[safeBotId] === 'object'
        ? statsMap[safeBotId].pvp_points
        : 0
    )
  );
  if (isInTargetCategory(currentPoints)) return true;

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const tx = await runTransaction(ref(firebaseDb, `user_stats/${safeBotId}`), (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const prevPoints = Math.max(0, Number(prev.pvp_points || 0));
    if (isInTargetCategory(prevPoints)) return prev;
    let nextPoints = prevPoints;
    if (nextPoints < targetBounds.min) nextPoints = targetBounds.min;
    if (nextPoints > targetBounds.max) nextPoints = targetBounds.max;
    return {
      ...prev,
      user_id: safeBotId,
      pvp_points: nextPoints,
      updated_at: nowIso,
      progress_updated_at_ms: Math.max(nowMs, Number(prev.progress_updated_at_ms || 0))
    };
  });

  const updated = tx?.snapshot?.val();
  const updatedPoints = Math.max(
    0,
    Number(
      updated && typeof updated === 'object'
        ? updated.pvp_points
        : currentPoints
    )
  );
  if (statsMap) {
    statsMap[safeBotId] = {
      ...(statsMap[safeBotId] && typeof statsMap[safeBotId] === 'object' ? statsMap[safeBotId] : {}),
      pvp_points: updatedPoints
    };
  }
  return isInTargetCategory(updatedPoints);
}

function getBotUserIdFromMatch(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const byField = String(row.bot_user_id || '').trim();
  if (isSystemBotUserId(byField)) return byField;
  const p1 = String(row.player1_user_id || '').trim();
  const p2 = String(row.player2_user_id || '').trim();
  if (isSystemBotUserId(p1)) return p1;
  if (isSystemBotUserId(p2)) return p2;
  return '';
}

function getHumanUserIdFromBotMatch(matchRow, botId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeBotId = String(botId || getBotUserIdFromMatch(row)).trim();
  if (!safeBotId) return '';
  const p1 = String(row.player1_user_id || '').trim();
  const p2 = String(row.player2_user_id || '').trim();
  if (p1 === safeBotId) return p2;
  if (p2 === safeBotId) return p1;
  return '';
}

function isStaleOpenBotUserMatch(matchRow, nowMs = Date.now(), staleMs = BOT_USER_OPEN_MATCH_STALE_MS) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (row.is_bot_match !== true || row.is_bot_duel === true) return false;
  if (!getBotUserIdFromMatch(row)) return false;

  const status = String(row.status || '').trim().toLowerCase();
  if (status !== 'active' && status !== 'round_result') return false;

  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const safeStaleMs = Math.max(60000, Number(staleMs || BOT_USER_OPEN_MATCH_STALE_MS));
  const lastTouchedMs = Math.max(
    0,
    Number(row.round_started_at_ms || 0),
    Number(row.round_result_until_ms || 0),
    toMillis(row.updated_at || row.round_started_at || row.created_at)
  );
  if (!lastTouchedMs) return false;
  return (safeNowMs - lastTouchedMs) >= safeStaleMs;
}

export async function getNextBotForUserMatch(targetDifficulty = '', options = {}) {
  const preferLocal = options?.preferLocal === true;
  const waitForEnsure = options?.waitForEnsure === true;
  if (waitForEnsure) {
    await ensureSystemBots({ force: true }).catch(() => null);
  } else {
    void ensureSystemBots().catch(() => null);
  }

  const rawTargetDifficulty = String(targetDifficulty || '').trim().toLowerCase();
  const safeTargetDifficulty = rawTargetDifficulty ? normalizeDifficulty(rawTargetDifficulty) : '';
  const excludedSet = new Set(
    (Array.isArray(options?.excludeBotIds) ? options.excludeBotIds : [])
      .map((id) => String(id || '').trim())
      .filter((id) => isSystemBotUserId(id))
  );
  let userOrder = normalizeBotQueueOrder(getCachedBotQueueOrder());
  const busySet = new Set();

  if (preferLocal) {
    const cachedQueueOrder = normalizeBotQueueOrder(
      ensureBotQueuesCached?.userOrder
      || ensureBotQueuesCached?.arenaOrder
      || []
    );
    if (cachedQueueOrder.length) {
      userOrder = cachedQueueOrder;
    }
    // Refresh queues in background to keep local cache hot without blocking mobile matchmaking.
    void ensureBotQueues().then((queueState) => {
      const nextOrder = normalizeBotQueueOrder(queueState?.userOrder || queueState?.arenaOrder || []);
      if (nextOrder.length) {
        setCachedBotQueueOrder(nextOrder);
      }
    }).catch(() => null);
  } else {
    const queueState = await ensureBotQueues().catch(() => ({
      userOrder: getCachedBotQueueOrder()
    }));
    userOrder = normalizeBotQueueOrder(queueState?.userOrder || getCachedBotQueueOrder());
    await cleanupOrphanBotBusyEntries(Date.now()).catch(() => null);
    const [busyRows, openMatchBusy] = await Promise.all([
      getNode(BOT_BUSY_PATH).catch(() => null),
      getBusyBotsFromOpenMatches().catch(() => new Set())
    ]);
    const nowMs = Date.now();
    if (openMatchBusy instanceof Set) {
      openMatchBusy.forEach((botId) => {
        if (isSystemBotUserId(botId)) busySet.add(String(botId));
      });
    }
    if (busyRows && typeof busyRows === 'object') {
      Object.entries(busyRows).forEach(([botId, row]) => {
        if (!isSystemBotUserId(botId)) return;
        if (!isBotBusyRowActive(row, nowMs)) return;
        busySet.add(String(botId));
      });
    }
  }
  if (!userOrder.length) {
    userOrder = normalizeBotQueueOrder(SYSTEM_BOT_IDS);
  }

  const pickSnapshot = async (botId) => {
    if (preferLocal) {
      const cached = getCachedBotSnapshot(botId, BOT_LOCAL_CACHE_MAX_AGE_MS);
      if (cached?.profile && cached?.stats) {
        return {
          bot_id: botId,
          profile: cached.profile,
          stats: cached.stats || null,
          config: cached.config || null
        };
      }
      const seeded = buildSeedBotSnapshot(botId);
      setCachedBotSnapshot(seeded, 'local_seed');
      return {
        bot_id: botId,
        profile: seeded.profile,
        stats: seeded.stats || null,
        config: seeded.config || null
      };
    }
    const snapshot = await getSystemBotSnapshot(botId, {
      preferLocal,
      localMaxAgeMs: BOT_LOCAL_CACHE_MAX_AGE_MS
    }).catch(() => null);
    if (!snapshot?.profile || !snapshot?.stats) return null;
    return {
      bot_id: botId,
      profile: snapshot.profile,
      stats: snapshot.stats || null,
      config: snapshot.config || null
    };
  };

  const getBotDifficultyFast = async (botId) => {
    const cached = getCachedBotSnapshot(botId, BOT_LOCAL_CACHE_MAX_AGE_MS);
    if (cached?.stats && typeof cached.stats === 'object') {
      return resolveDifficultyByPvpPoints(cached.stats.pvp_points || 0);
    }
    if (preferLocal) return '';
    return getBotDifficultyById(botId, null).catch(() => 'easy');
  };

  for (const botId of userOrder) {
    if (excludedSet.has(botId)) continue;
    if (busySet.has(botId)) continue;
    if (safeTargetDifficulty) {
      const botDifficulty = await getBotDifficultyFast(botId);
      if (botDifficulty && normalizeDifficulty(botDifficulty || 'easy') !== safeTargetDifficulty) continue;
    }
    const picked = await pickSnapshot(botId);
    if (!picked) continue;
    if (safeTargetDifficulty) {
      const statsDifficulty = resolveDifficultyByPvpPoints(picked?.stats?.pvp_points || 0);
      if (normalizeDifficulty(statsDifficulty || 'easy') !== safeTargetDifficulty) continue;
    }
    return picked;
  }

  return null;
}

function simulateBotDuelScores(botAConfig, botBConfig, options = {}) {
  const baseRounds = Math.max(3, Number(options?.baseRounds || BOT_ARENA_BASE_ROUNDS));
  const maxRounds = Math.max(baseRounds + 1, Number(options?.maxRounds || BOT_ARENA_MAX_ROUNDS));
  const strengthA = normalizeBotStrength(botAConfig?.strength || SYSTEM_BOT_STRENGTH_DEFAULT);
  const strengthB = normalizeBotStrength(botBConfig?.strength || SYSTEM_BOT_STRENGTH_DEFAULT);
  const accA = getBotAccuracyByStrength(strengthA);
  const accB = getBotAccuracyByStrength(strengthB);
  const safeSeedKey = String(options?.seed_key || '').trim()
    || `duel:${normalizeDifficulty(options?.difficulty || 'easy')}:${strengthA}:${strengthB}:${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  let scoreA = 0;
  let scoreB = 0;
  let endedRoundNo = 0;

  for (let round = 1; round <= maxRounds; round += 1) {
    endedRoundNo = round;
    const suddenDeathRound = round > baseRounds;
    const hitA = suddenDeathRound
      ? (buildSeededRandom(hashBotSeed(`${safeSeedKey}:sd:a:${round}`))() < accA)
      : resolveDeterministicBotRun(`${safeSeedKey}:base:a`, accA, round, round).hit_at_step;
    const hitB = suddenDeathRound
      ? (buildSeededRandom(hashBotSeed(`${safeSeedKey}:sd:b:${round}`))() < accB)
      : resolveDeterministicBotRun(`${safeSeedKey}:base:b`, accB, round, round).hit_at_step;

    if (hitA) scoreA += 1;
    if (hitB) scoreB += 1;

    if (round >= baseRounds && scoreA !== scoreB) {
      break;
    }
  }

  if (scoreA === scoreB) {
    endedRoundNo = Math.max(endedRoundNo, baseRounds + 1);
    const sameStrength = Math.abs(accA - accB) < 0.0001;
    const aIsStronger = accA > accB;
    const strongerWinChance = sameStrength
      ? 0.5
      : Math.max(0.62, Math.min(0.9, 0.65 + Math.abs(accA - accB) * 0.6));
    const roll = buildSeededRandom(hashBotSeed(`${safeSeedKey}:tie_break`))();
    const strongerWins = roll < strongerWinChance;
    if (sameStrength) {
      if (roll < 0.5) scoreA += 1;
      else scoreB += 1;
    } else if ((strongerWins && aIsStronger) || (!strongerWins && !aIsStronger)) {
      scoreA += 1;
    } else {
      scoreB += 1;
    }
  }

  return {
    scoreA,
    scoreB,
    endedRoundNo: Math.max(baseRounds, Number(endedRoundNo || baseRounds))
  };
}

async function createBotArenaMatch({ botAId, botBId, nowIso, nowMs }) {
  const [snapA, snapB] = await Promise.all([
    getSystemBotSnapshot(botAId),
    getSystemBotSnapshot(botBId)
  ]);
  if (!snapA?.profile || !snapB?.profile) return null;

  const pvpPointsA = Math.max(0, Number(snapA?.stats?.pvp_points || 0));
  const pvpPointsB = Math.max(0, Number(snapB?.stats?.pvp_points || 0));
  const diffA = resolveDifficultyByPvpPoints(pvpPointsA);
  const diffB = resolveDifficultyByPvpPoints(pvpPointsB);
  if (diffA !== diffB) return null;
  const duelDifficulty = normalizeDifficulty(diffA);
  const botStrengthA = normalizeBotStrength(snapA?.config?.strength || getSystemBotDefinition(botAId).default_strength);
  const botStrengthB = normalizeBotStrength(snapB?.config?.strength || getSystemBotDefinition(botBId).default_strength);

  const matchId = buildMatchId(botAId, botBId);
  const created = await createPvpMatch({
    id: matchId,
    status: 'active',
    is_bot_match: true,
    is_bot_duel: true,
    bot_user_id: String(botAId),
    bot_duel_ids: [String(botAId), String(botBId)],
    difficulty: duelDifficulty,
    category: duelDifficulty,
    language: 'javascript',
    topic: 'variables',
    total_rounds: BOT_ARENA_BASE_ROUNDS,
    round_no: 1,
    question_set: [],
    player1_user_id: String(botAId),
    player1_nickname: String(snapA.profile.nickname || getSystemBotDefinition(botAId).nickname),
    player1_avatar: String(snapA.profile.avatar || '🤖'),
    player1_frame: String(snapA.profile.equipped_frame || 'frame_default'),
    player1_background: String(snapA.profile.equipped_background || 'bg_default'),
    player1_emoji: String(snapA.profile.equipped_emoji || 'emoji_profile'),
    player1_level: Math.max(1, Number(snapA?.stats?.level || 1)),
    player1_pvp_points: pvpPointsA,
    player1_pvp_battles: Math.max(0, Number(snapA?.stats?.pvp_battles || 0)),
    player1_bot_strength: botStrengthA,
    player1_accept_state: 'accepted',
    player2_user_id: String(botBId),
    player2_nickname: String(snapB.profile.nickname || getSystemBotDefinition(botBId).nickname),
    player2_avatar: String(snapB.profile.avatar || '🤖'),
    player2_frame: String(snapB.profile.equipped_frame || 'frame_default'),
    player2_background: String(snapB.profile.equipped_background || 'bg_default'),
    player2_emoji: String(snapB.profile.equipped_emoji || 'emoji_profile'),
    player2_level: Math.max(1, Number(snapB?.stats?.level || 1)),
    player2_pvp_points: pvpPointsB,
    player2_pvp_battles: Math.max(0, Number(snapB?.stats?.pvp_battles || 0)),
    player2_bot_strength: botStrengthB,
    player2_accept_state: 'accepted',
    bot_strength: botStrengthA,
    accept_deadline_ms: 0,
    start_countdown_ms: 0,
    reject_at_ms: 0,
    player1_score: 0,
    player2_score: 0,
    host_user_id: String(botAId),
    round_started_at_ms: nowMs,
    round_started_at: nowIso,
    created_at: nowIso,
    updated_at: nowIso
  });

  if (!created?.id) return null;

  const durationMs = Math.round(
    BOT_BATTLE_DURATION_MS_MIN + Math.random() * (BOT_BATTLE_DURATION_MS_MAX - BOT_BATTLE_DURATION_MS_MIN)
  );
  await Promise.all([
    setBotBusy(botAId, {
      reason: 'bot_duel',
      match_id: created.id,
      source: 'arena',
      until_ms: nowMs + durationMs + 1000
    }),
    setBotBusy(botBId, {
      reason: 'bot_duel',
      match_id: created.id,
      source: 'arena',
      until_ms: nowMs + durationMs + 1000
    })
  ]);

  return {
    matchId: created.id,
    botAId: String(botAId),
    botBId: String(botBId),
    difficulty: duelDifficulty,
    startedAtMs: nowMs,
    endsAtMs: nowMs + durationMs
  };
}

async function finalizeBotArenaMatch(arenaState, endedReason = 'bot_duel_complete') {
  const state = normalizeArenaState(arenaState);
  if (!state.match_id || !state.bot_a_id || !state.bot_b_id) return null;
  const matchRow = await getPvpMatch(state.match_id).catch(() => null);
  if (!matchRow || String(matchRow.status || '').trim().toLowerCase() === 'finished') {
    await Promise.all([
      clearBotBusy(state.bot_a_id, state.match_id),
      clearBotBusy(state.bot_b_id, state.match_id)
    ]);
    return null;
  }

  const nowIso = new Date().toISOString();
  const p1Score = Math.max(0, Number(matchRow?.player1_score || 0));
  const p2Score = Math.max(0, Number(matchRow?.player2_score || 0));
  const hasRealScores = p1Score > 0 || p2Score > 0;

  let finalP1Score = p1Score;
  let finalP2Score = p2Score;
  let endedRoundNo = Math.max(1, Number(matchRow?.ended_round_no || matchRow?.round_no || BOT_ARENA_BASE_ROUNDS));

  if (!hasRealScores) {
    const [configA, configB] = await Promise.all([
      getPvpBotConfig(state.bot_a_id).catch(() => null),
      getPvpBotConfig(state.bot_b_id).catch(() => null)
    ]);
    const duelDifficulty = normalizeDifficulty(matchRow?.difficulty || matchRow?.category || 'easy');
    const score = simulateBotDuelScores(configA, configB, {
      baseRounds: BOT_ARENA_BASE_ROUNDS,
      maxRounds: BOT_ARENA_MAX_ROUNDS,
      difficulty: duelDifficulty
    });
    finalP1Score = Math.max(0, Number(score.scoreA || 0));
    finalP2Score = Math.max(0, Number(score.scoreB || 0));
    endedRoundNo = Math.max(BOT_ARENA_BASE_ROUNDS, Number(score.endedRoundNo || BOT_ARENA_BASE_ROUNDS));
  }

  const winnerId = finalP1Score > finalP2Score ? state.bot_a_id
    : (finalP2Score > finalP1Score ? state.bot_b_id
      : (Math.random() < 0.5 ? state.bot_a_id : state.bot_b_id));
  const loserId = winnerId === state.bot_a_id ? state.bot_b_id : state.bot_a_id;

  await updatePvpMatch(state.match_id, {
    status: 'finished',
    winner_user_id: winnerId,
    player1_score: finalP1Score,
    player2_score: finalP2Score,
    total_rounds: endedRoundNo,
    ended_reason: String(endedReason || 'bot_duel_complete'),
    ended_by_user_id: winnerId,
    ended_round_no: endedRoundNo,
    ended_at: nowIso
  }).catch(() => null);

  const latest = await getPvpMatch(state.match_id).catch(() => null);
  if (latest && typeof latest === 'object') {
    await applyBotDuelStatsFromMatch(latest).catch(() => null);
  }

  return {
    match_id: state.match_id,
    winner_id: winnerId,
    loser_id: loserId
  };
}

async function applyBotDuelStatsFromMatch(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : null;
  const matchId = String(row?.id || '').trim();
  if (!row || !matchId) return false;
  if (String(row.status || '').trim().toLowerCase() !== 'finished') return false;
  if (row.is_bot_duel !== true) return false;
  const statsAlreadyApplied = row.bot_duel_stats_applied === true;

  const duelIds = Array.isArray(row.bot_duel_ids)
    ? row.bot_duel_ids.map((id) => String(id || '').trim()).filter((id) => isSystemBotUserId(id))
    : [];
  const p1 = String(row.player1_user_id || '').trim();
  const p2 = String(row.player2_user_id || '').trim();
  const botAId = duelIds[0] || (isSystemBotUserId(p1) ? p1 : '');
  const botBId = duelIds[1] || (isSystemBotUserId(p2) ? p2 : '');
  if (!botAId || !botBId || botAId === botBId) return false;
  const queueAlreadyRotated = row.bot_duel_queue_rotated === true;
  const invalidReason = getInvalidFinishedPvpMatchReason(row);
  const isVoidMatch = !!invalidReason;

  if (statsAlreadyApplied && queueAlreadyRotated) return true;
  if (isVoidMatch) {
    await Promise.all([
      clearBotBusy(botAId, matchId),
      clearBotBusy(botBId, matchId)
    ]).catch(() => null);
    if (!queueAlreadyRotated) {
      await rotateArenaDuelQueue(botAId, botBId).catch(() => null);
    }
    await updatePvpMatch(matchId, {
      bot_duel_stats_applied: true,
      bot_duel_stats_applied_at: new Date().toISOString(),
      bot_duel_queue_rotated: true,
      bot_duel_queue_rotated_at: new Date().toISOString(),
      result_void: true,
      result_void_reason: invalidReason || 'invalid_match',
      history_hidden: true,
      history_hidden_reason: invalidReason || 'invalid_match'
    }).catch(() => null);
    return true;
  }

  let winnerId = String(row.winner_user_id || '').trim();
  if (!winnerId || (winnerId !== botAId && winnerId !== botBId)) {
    const p1Score = Math.max(0, Number(row.player1_score || 0));
    const p2Score = Math.max(0, Number(row.player2_score || 0));
    if (p1Score !== p2Score) {
      winnerId = p1Score > p2Score ? p1 : p2;
    }
  }

  if (!statsAlreadyApplied) {
    const [statsA, statsB] = await Promise.all([
      getUserStats(botAId).catch(() => null),
      getUserStats(botBId).catch(() => null)
    ]);

    const resultA = winnerId ? (winnerId === botAId ? 'win' : 'loss') : 'draw';
    const resultB = winnerId ? (winnerId === botBId ? 'win' : 'loss') : 'draw';
    const battleNoA = Math.max(1, Number(statsA?.pvp_battles || 0) + 1);
    const battleNoB = Math.max(1, Number(statsB?.pvp_battles || 0) + 1);
    const roundNo = getMatchDecisiveRoundNo(row, BOT_ARENA_BASE_ROUNDS);
    const safeDifficulty = normalizeDifficulty(row.difficulty || row.category || 'easy');

    const pointsDeltaA = getPvpPointsDeltaAdvanced(resultA, {
      battleNo: battleNoA,
      roundNo,
      matchRow: row,
      userId: botAId
    });
    const pointsDeltaB = getPvpPointsDeltaAdvanced(resultB, {
      battleNo: battleNoB,
      roundNo,
      matchRow: row,
      userId: botBId
    });
    const xpA = getPvpXpRewardByDifficulty(safeDifficulty, resultA);
    const xpB = getPvpXpRewardByDifficulty(safeDifficulty, resultB);
    const coinsA = getPvpCoinsRewardByDifficulty(safeDifficulty, resultA);
    const coinsB = getPvpCoinsRewardByDifficulty(safeDifficulty, resultB);

    await Promise.all([
      applyPvpOutcomeToUserStats(botAId, {
        result: resultA,
        pointsDelta: pointsDeltaA,
        xp: xpA,
        coinsDelta: coinsA,
        battlesDelta: 1
      }),
      applyPvpOutcomeToUserStats(botBId, {
        result: resultB,
        pointsDelta: pointsDeltaB,
        xp: xpB,
        coinsDelta: coinsB,
        battlesDelta: 1
      }),
      clearBotBusy(botAId, matchId),
      clearBotBusy(botBId, matchId)
    ]).catch(() => null);
  } else {
    await Promise.all([
      clearBotBusy(botAId, matchId),
      clearBotBusy(botBId, matchId)
    ]).catch(() => null);
  }

  if (!queueAlreadyRotated) {
    await rotateArenaDuelQueue(botAId, botBId).catch(() => null);
  }

  await updatePvpMatch(matchId, {
    bot_duel_stats_applied: true,
    bot_duel_stats_applied_at: new Date().toISOString(),
    bot_duel_queue_rotated: true,
    bot_duel_queue_rotated_at: new Date().toISOString()
  }).catch(() => null);
  return true;
}

async function applyBotUserMatchStatsFromMatch(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : null;
  const matchId = String(row?.id || '').trim();
  if (!row || !matchId) return false;
  if (String(row.status || '').trim().toLowerCase() !== 'finished') return false;
  if (row.is_bot_match !== true || row.is_bot_duel === true) return false;
  if (row.bot_user_stats_applied === true) return true;

  const byField = String(row.bot_user_id || '').trim();
  const p1 = String(row.player1_user_id || '').trim();
  const p2 = String(row.player2_user_id || '').trim();
  const botId = isSystemBotUserId(byField)
    ? byField
    : (isSystemBotUserId(p1) ? p1 : (isSystemBotUserId(p2) ? p2 : ''));
  if (!botId) return false;

  const shouldRotate = String(row.bot_user_queue_rotated || '').trim().toLowerCase() !== 'true';
  const invalidReason = getInvalidFinishedPvpMatchReason(row);
  if (invalidReason) {
    await clearBotBusy(botId, matchId).catch(() => null);
    if (shouldRotate) await rotateUserBotQueue(botId, 'repo_invalid_finished_match').catch(() => null);
    await updatePvpMatch(matchId, {
      bot_user_queue_rotated: true,
      bot_user_stats_applied: true,
      bot_user_stats_applied_at: new Date().toISOString(),
      result_void: true,
      result_void_reason: invalidReason,
      history_hidden: true,
      history_hidden_reason: invalidReason
    }).catch(() => null);
    return true;
  }
  const endedReason = String(row.ended_reason || '').trim().toLowerCase();
  if (shouldSkipPvpRewardsByReason(endedReason)) {
    await clearBotBusy(botId, matchId).catch(() => null);
    if (shouldRotate) await rotateUserBotQueue(botId, 'repo_refused_or_timeout').catch(() => null);
    await updatePvpMatch(matchId, {
      bot_user_queue_rotated: true,
      bot_user_stats_applied: true,
      bot_user_stats_applied_at: new Date().toISOString()
    }).catch(() => null);
    return true;
  }

  const stats = await getUserStats(botId).catch(() => null);
  const rowBattles = p1 === botId
    ? Math.max(0, Number(row.player1_pvp_battles || 0))
    : Math.max(0, Number(row.player2_pvp_battles || 0));
  const battleNo = Math.max(
    1,
    Math.max(Math.max(0, Number(stats?.pvp_battles || 0)), rowBattles) + 1
  );
  const roundNo = getMatchDecisiveRoundNo(row, 5);
  const result = getPvpResultFromWinner(row, botId);
  const safeDifficulty = normalizeDifficulty(row.difficulty || row.category || 'easy');
  const pointsDelta = getPvpPointsDeltaAdvanced(result, {
    battleNo,
    roundNo,
    matchRow: row,
    userId: botId
  });
  const xp = getPvpXpRewardByDifficulty(safeDifficulty, result);
  const coins = getPvpCoinsRewardByDifficulty(safeDifficulty, result);

  await applyPvpOutcomeToUserStats(botId, {
    result,
    pointsDelta,
    xp,
    coinsDelta: coins,
    battlesDelta: 1
  }).catch(() => null);
  await clearBotBusy(botId, matchId).catch(() => null);
  if (shouldRotate) await rotateUserBotQueue(botId, 'repo_finished_match_applied').catch(() => null);

  await updatePvpMatch(matchId, {
    bot_user_queue_rotated: true,
    bot_user_stats_applied: true,
    bot_user_stats_applied_at: new Date().toISOString()
  }).catch(() => null);
  return true;
}

export async function cleanupStalePendingBotUserMatches(options = {}) {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const maxBatch = Math.max(1, Number(options?.maxBatch || 24));
  const staleMs = Math.max(9000, Number(options?.staleMs || 14000));
  const actorUserId = String(options?.actorUserId || options?.userId || '').trim();
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') {
    return { closed: 0, timeout: 0, superseded: 0 };
  }

  const pendingRows = Object.entries(rows)
    .filter(([id, row]) => {
      if (!id || !row || typeof row !== 'object') return false;
      if (String(row.status || '').trim().toLowerCase() !== 'pending_accept') return false;
      if (row.is_bot_match !== true || row.is_bot_duel === true) return false;
      const botId = getBotUserIdFromMatch(row);
      if (!botId) return false;
      if (actorUserId) {
        const humanId = getHumanUserIdFromBotMatch(row, botId);
        if (actorUserId !== humanId && actorUserId !== botId) return false;
      }
      return true;
    })
    .map(([id, row]) => ({ id: String(id), ...row }))
    .sort((a, b) => (
      toMillis(b.updated_at || b.created_at || b.round_started_at)
      - toMillis(a.updated_at || a.created_at || a.round_started_at)
    ));
  if (!pendingRows.length) {
    return { closed: 0, timeout: 0, superseded: 0 };
  }

  const keepNewestByHuman = new Set();
  const targets = [];
  for (const row of pendingRows) {
    if (targets.length >= maxBatch) break;
    const matchId = String(row.id || '').trim();
    if (!matchId) continue;
    const botId = getBotUserIdFromMatch(row);
    if (!botId) continue;
    const humanId = getHumanUserIdFromBotMatch(row, botId);
    const groupKey = humanId || botId;
    const acceptDeadlineMs = Math.max(0, Number(row.accept_deadline_ms || 0));
    const updatedMs = Math.max(0, toMillis(row.updated_at || row.created_at || row.round_started_at));
    const staleByDeadline = acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs;
    const staleByAge = updatedMs > 0 && (nowMs - updatedMs) >= staleMs;
    const superseded = groupKey ? keepNewestByHuman.has(groupKey) : false;

    let reason = '';
    if (superseded) reason = 'match_superseded';
    else if (staleByDeadline || staleByAge) reason = 'accept_timeout';

    if (!reason) {
      if (groupKey) keepNewestByHuman.add(groupKey);
      continue;
    }

    targets.push({
      matchId,
      botId,
      reason,
      shouldRotate: String(row.bot_user_queue_rotated || '').trim().toLowerCase() !== 'true'
    });
  }

  if (!targets.length) {
    return { closed: 0, timeout: 0, superseded: 0 };
  }

  let closed = 0;
  let timeout = 0;
  let superseded = 0;
  for (const target of targets) {
    await updatePvpMatch(target.matchId, {
      status: 'finished',
      ended_reason: target.reason,
      ended_by_user_id: target.botId || null,
      ended_at: nowIso,
      winner_user_id: null,
      result_void: true,
      result_void_reason: target.reason,
      history_hidden: true,
      history_hidden_reason: target.reason,
      bot_user_queue_rotated: true,
      bot_user_stats_applied: true,
      bot_user_stats_applied_at: nowIso
    }).catch(() => null);
    await clearBotBusy(target.botId, target.matchId).catch(() => null);
    if (target.shouldRotate) {
      await rotateUserBotQueue(target.botId, 'repo_cleanup_stale_pending').catch(() => null);
    }
    closed += 1;
    if (target.reason === 'match_superseded') superseded += 1;
    else timeout += 1;
  }

  return { closed, timeout, superseded };
}

async function reconcileFinishedBotMatchStats(nowMs = Date.now()) {
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return;
  const graceWindowMs = 45000;

  const all = Object.entries(rows)
    .filter(([id, row]) => !!id && row && typeof row === 'object')
    .map(([id, row]) => ({ id, ...row }));

  const staleFinished = all.filter((row) => {
    const status = String(row.status || '').trim().toLowerCase();
    if (status !== 'finished') return false;
    const endedAtMs = toMillis(row.ended_at || row.updated_at || row.created_at);
    return endedAtMs > 0 && (nowMs - endedAtMs) >= graceWindowMs;
  });

  const pendingDuels = staleFinished
    .filter((row) => row.is_bot_duel === true && row.bot_duel_stats_applied !== true)
    .sort((a, b) => toMillis(a.ended_at || a.updated_at || a.created_at) - toMillis(b.ended_at || b.updated_at || b.created_at))
    .slice(0, 8);
  for (const row of pendingDuels) {
    await applyBotDuelStatsFromMatch(row).catch(() => null);
  }

  const pendingUserBot = staleFinished
    .filter((row) => row.is_bot_match === true && row.is_bot_duel !== true && row.bot_user_stats_applied !== true)
    .sort((a, b) => toMillis(a.ended_at || a.updated_at || a.created_at) - toMillis(b.ended_at || b.updated_at || b.created_at))
    .slice(0, 12);
  for (const row of pendingUserBot) {
    await applyBotUserMatchStatsFromMatch(row).catch(() => null);
  }
}

function isFinishedDrawMatchRow(row) {
  const safe = row && typeof row === 'object' ? row : {};
  if (String(safe.status || '').trim().toLowerCase() !== 'finished') return false;
  if (safe.result_void === true || safe.history_hidden === true) return false;
  const winnerId = String(safe.winner_user_id || '').trim();
  if (winnerId) return false;
  const p1 = Math.max(0, Number(safe.player1_score || 0));
  const p2 = Math.max(0, Number(safe.player2_score || 0));
  return p1 === p2;
}

export async function cleanupDrawFinishedMatches(maxBatch = 80) {
  const limit = Math.max(1, Number(maxBatch || 80));
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return { hidden: 0 };

  const targets = Object.entries(rows)
    .filter(([id, row]) => !!id && isFinishedDrawMatchRow(row))
    .slice(0, limit);
  if (!targets.length) return { hidden: 0 };

  const nowIso = new Date().toISOString();
  let hidden = 0;
  await Promise.all(targets.map(([matchId]) => update(ref(firebaseDb, `pvp_matches/${matchId}`), {
    result_void: true,
    result_void_reason: 'draw_result',
    history_hidden: true,
    history_hidden_reason: 'draw_result',
    draw_hidden_at: nowIso,
    updated_at: nowIso
  }).then(() => {
    hidden += 1;
  }).catch(() => null)));

  return { hidden };
}

export async function cleanupZeroScoreFinishedMatches(maxBatch = 80) {
  const limit = Math.max(1, Number(maxBatch || 80));
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return { marked: 0 };

  const targets = Object.entries(rows)
    .filter(([id, row]) => {
      if (!id || !row || typeof row !== 'object') return false;
      const invalidReason = getInvalidFinishedPvpMatchReason(row);
      if (!invalidReason) return false;
      const alreadyMarked = row.result_void === true
        && String(row.result_void_reason || '').trim() === invalidReason
        && row.history_hidden === true
        && String(row.history_hidden_reason || '').trim() === invalidReason;
      return !alreadyMarked;
    })
    .slice(0, limit);
  if (!targets.length) return { marked: 0 };

  const updateOps = [];
  let marked = 0;
  for (const [matchId, row] of targets) {
    const invalidReason = getInvalidFinishedPvpMatchReason(row);
    if (!invalidReason) continue;
    const p1 = String(row.player1_user_id || '').trim();
    const p2 = String(row.player2_user_id || '').trim();
    if (isSystemBotUserId(p1)) updateOps.push(clearBotBusy(p1, matchId));
    if (isSystemBotUserId(p2)) updateOps.push(clearBotBusy(p2, matchId));
    updateOps.push(update(ref(firebaseDb, `pvp_matches/${matchId}`), {
      result_void: true,
      result_void_reason: invalidReason,
      history_hidden: true,
      history_hidden_reason: invalidReason,
      result_void_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    marked += 1;
  }

  await Promise.all(updateOps.map((task) => Promise.resolve(task).catch(() => null)));
  return { marked };
}

async function applyBotQuizOutcomeToStats(botId, assignment = {}) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return null;

  const language = String(assignment.language || '').trim();
  const topic = String(assignment.topic || '').trim();
  const difficulty = normalizeDifficulty(assignment.difficulty || 'easy');
  if (!language || !topic) return null;

  const totalQuestions = Math.max(1, Math.trunc(Number(assignment.total_questions || QUESTIONS_PER_ROUND)));
  const correctCount = Math.max(0, Math.min(totalQuestions, Math.trunc(Number(assignment.correct_count || 0))));
  const bestStreak = Math.max(0, Math.min(correctCount, Math.trunc(Number(assignment.best_streak || 0))));
  const quizKey = getQuizKey(language, topic, difficulty);
  const scorePct = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  let xpEarned = 0;
  let coinsEarned = 0;

  await runTransaction(ref(firebaseDb, `user_stats/${safeBotId}`), (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const prevTotalXp = Math.max(0, Math.trunc(Number(prev.total_xp || 0)));
    const prevCoins = Math.max(0, Math.trunc(Number(prev.coins || 20)));
    const prevTotalCorrect = Math.max(0, Math.trunc(Number(prev.total_correct || 0)));
    const prevTotalAnswered = Math.max(0, Math.trunc(Number(prev.total_answered || 0)));
    const prevQuizzes = Math.max(0, Math.trunc(Number(prev.quizzes_completed || 0)));
    const prevBestStreak = Math.max(0, Math.trunc(Number(prev.best_streak || 0)));
    const prevRankingPoints = Math.max(0, Math.trunc(Number(prev.ranking_points || 0)));

    const topicProgress = prev.topic_progress && typeof prev.topic_progress === 'object'
      ? prev.topic_progress
      : {};
    const quizBestScores = prev.quiz_best_scores && typeof prev.quiz_best_scores === 'object'
      ? prev.quiz_best_scores
      : {};
    const quizBestStars = prev.quiz_best_stars && typeof prev.quiz_best_stars === 'object'
      ? prev.quiz_best_stars
      : {};
    const quizRewarded = normalizeQuizRewardedMap(prev.quiz_rewarded);
    const prevReward = quizRewarded[quizKey] && typeof quizRewarded[quizKey] === 'object'
      ? quizRewarded[quizKey]
      : { xp: 0, coins: 0 };

    const prevBestCorrect = Math.max(0, Math.trunc(Number(quizBestScores[quizKey] || 0)));
    const newBestCorrect = Math.max(prevBestCorrect, correctCount);
    const quizAlreadyMastered = prevBestCorrect >= totalQuestions;
    const rankingGain = quizAlreadyMastered ? 0 : Math.max(0, newBestCorrect - prevBestCorrect);

    const xpCap = correctCount * Math.max(0, Math.trunc(Number(XP_PER_CORRECT[difficulty] || 0)));
    const coinsCap = correctCount * Math.max(0, Math.trunc(Number(COINS_PER_CORRECT[difficulty] || 0)));
    const earnedXpByDelta = Math.max(0, xpCap - Math.max(0, Math.trunc(Number(prevReward.xp || 0))));
    const earnedCoinsByDelta = Math.max(0, coinsCap - Math.max(0, Math.trunc(Number(prevReward.coins || 0))));
    const completionXp = Math.max(0, Math.trunc(Number(PVE_COMPLETION_XP_BONUS[difficulty] || 0)));
    const completionCoins = Math.max(0, Math.trunc(Number(PVE_COMPLETION_COINS_BONUS[difficulty] || 0)));

    xpEarned = earnedXpByDelta + completionXp;
    coinsEarned = earnedCoinsByDelta + completionCoins;

    const nextTotalXp = prevTotalXp + xpEarned;
    const xpState = splitProgressTotalXp(nextTotalXp);
    const starsThisRun = calculateStars(correctCount, totalQuestions);
    const currentBestStars = Math.max(1, Math.trunc(Number(quizBestStars[quizKey] || 1)));

    return {
      user_id: safeBotId,
      total_xp: nextTotalXp,
      level: Math.max(1, Number(xpState.level || 1)),
      ranking_points: prevRankingPoints + rankingGain,
      pvp_points: Math.max(0, Math.trunc(Number(prev.pvp_points || 0))),
      coins: prevCoins + coinsEarned,
      pvp_battles: Math.max(0, Math.trunc(Number(prev.pvp_battles || 0))),
      pvp_wins: Math.max(0, Math.trunc(Number(prev.pvp_wins || 0))),
      pvp_losses: Math.max(0, Math.trunc(Number(prev.pvp_losses || 0))),
      pvp_processed_matches: prev.pvp_processed_matches && typeof prev.pvp_processed_matches === 'object'
        ? prev.pvp_processed_matches
        : {},
      pvp_recalculated_at_ms: Math.max(0, Number(prev.pvp_recalculated_at_ms || 0)),
      best_streak: Math.max(prevBestStreak, bestStreak),
      total_correct: prevTotalCorrect + correctCount,
      total_answered: prevTotalAnswered + totalQuestions,
      quizzes_completed: prevQuizzes + 1,
      topic_progress: {
        ...topicProgress,
        [quizKey]: Math.max(Math.max(0, Number(topicProgress[quizKey] || 0)), scorePct)
      },
      quiz_best_scores: {
        ...quizBestScores,
        [quizKey]: newBestCorrect
      },
      quiz_best_stars: {
        ...quizBestStars,
        [quizKey]: Math.max(currentBestStars, starsThisRun)
      },
      achievement_ids: normalizeAchievementIds(prev.achievement_ids || prev.achievements),
      quiz_rewarded: {
        ...quizRewarded,
        [quizKey]: {
          xp: Math.max(Math.max(0, Number(prevReward.xp || 0)), xpCap),
          coins: Math.max(Math.max(0, Number(prevReward.coins || 0)), coinsCap)
        }
      },
      is_system_bot: true,
      progress_updated_at_ms: Math.max(nowMs, Number(prev.progress_updated_at_ms || 0)),
      updated_at: nowIso
    };
  }).catch(() => null);

  await saveQuizResult(safeBotId, {
    language,
    topic,
    difficulty,
    score_pct: scorePct,
    xp_earned: xpEarned,
    correct_count: correctCount,
    total_questions: totalQuestions,
    best_streak: bestStreak
  }).catch(() => null);

  return {
    bot_id: safeBotId,
    language,
    topic,
    difficulty,
    score_pct: scorePct,
    xp_earned: xpEarned,
    coins_earned: coinsEarned,
    correct_count: correctCount,
    total_questions: totalQuestions,
    best_streak: bestStreak
  };
}

async function persistBotQuizHistoryMatch({ batchId = '', assignments = [], startedAtMs = 0, endedAtMs = Date.now() } = {}) {
  const safeAssignments = (Array.isArray(assignments) ? assignments : [])
    .map((row) => normalizeBotQuizAssignment(row))
    .filter((row) => row.bot_id)
    .slice(0, 2);
  if (!safeAssignments.length) return null;

  const first = safeAssignments[0];
  const second = safeAssignments.length > 1 ? safeAssignments[1] : null;
  const [snap1, snap2] = await Promise.all([
    getSystemBotSnapshot(first.bot_id).catch(() => null),
    second?.bot_id ? getSystemBotSnapshot(second.bot_id).catch(() => null) : Promise.resolve(null)
  ]);

  const player1Id = String(first.bot_id || '').trim();
  const player2Id = String(second?.bot_id || '').trim();
  const player1Score = Math.max(0, Number(first.correct_count || 0));
  const player2Score = Math.max(0, Number(second?.correct_count || 0));
  let winnerId = player1Id;
  if (player2Id) {
    if (player1Score > player2Score) winnerId = player1Id;
    else if (player2Score > player1Score) winnerId = player2Id;
    else winnerId = '';
  }

  const startedMs = Math.max(0, Number(startedAtMs || 0)) || Math.max(0, Number(endedAtMs || Date.now()));
  const endedMs = Math.max(startedMs, Math.max(0, Number(endedAtMs || Date.now())));
  const startedIso = new Date(startedMs).toISOString();
  const endedIso = new Date(endedMs).toISOString();
  const quizDifficulty = normalizeDifficulty(first.difficulty || second?.difficulty || 'easy');
  const totalRounds = Math.max(
    1,
    Number(first.total_questions || QUESTIONS_PER_ROUND),
    Number(second?.total_questions || 0)
  );
  const normalizedBatchId = String(batchId || '').trim() || `bot_quiz_batch_${endedMs}_${Math.floor(Math.random() * 10000)}`;
  const matchId = `bot_quiz_match_${normalizedBatchId}`;

  const created = await createPvpMatch({
    id: matchId,
    status: 'finished',
    is_bot_quiz: true,
    bot_quiz_batch_id: normalizedBatchId,
    bot_quiz_difficulty: quizDifficulty,
    bot_quiz_assignments: safeAssignments,
    difficulty: quizDifficulty,
    category: quizDifficulty,
    language: String(first.language || second?.language || ''),
    topic: String(first.topic || second?.topic || ''),
    total_rounds: totalRounds,
    round_no: totalRounds,
    ended_round_no: totalRounds,
    player1_user_id: player1Id,
    player1_nickname: String(snap1?.profile?.nickname || getSystemBotDefinition(player1Id).nickname || 'Bot 1'),
    player1_avatar: String(snap1?.profile?.avatar || '🤖'),
    player1_frame: String(snap1?.profile?.equipped_frame || 'frame_default'),
    player1_background: String(snap1?.profile?.equipped_background || 'bg_default'),
    player1_emoji: String(snap1?.profile?.equipped_emoji || 'emoji_profile'),
    player1_level: Math.max(1, Number(snap1?.stats?.level || 1)),
    player1_pvp_points: Math.max(0, Number(snap1?.stats?.pvp_points || 0)),
    player1_pvp_battles: Math.max(0, Number(snap1?.stats?.pvp_battles || 0)),
    player1_bot_strength: normalizeBotStrength(first.bot_strength || getSystemBotDefinition(player1Id).default_strength),
    player1_score: player1Score,
    player1_accept_state: 'accepted',
    player2_user_id: player2Id || '',
    player2_nickname: player2Id
      ? String(snap2?.profile?.nickname || getSystemBotDefinition(player2Id).nickname || 'Bot 2')
      : 'Quiz solo',
    player2_avatar: String(snap2?.profile?.avatar || '🤖'),
    player2_frame: String(snap2?.profile?.equipped_frame || 'frame_default'),
    player2_background: String(snap2?.profile?.equipped_background || 'bg_default'),
    player2_emoji: String(snap2?.profile?.equipped_emoji || 'emoji_profile'),
    player2_level: Math.max(1, Number(snap2?.stats?.level || 1)),
    player2_pvp_points: Math.max(0, Number(snap2?.stats?.pvp_points || 0)),
    player2_pvp_battles: Math.max(0, Number(snap2?.stats?.pvp_battles || 0)),
    player2_bot_strength: player2Id
      ? normalizeBotStrength(second?.bot_strength || getSystemBotDefinition(player2Id).default_strength)
      : '',
    player2_score: player2Score,
    player2_accept_state: player2Id ? 'accepted' : 'pending',
    bot_strength: normalizeBotStrength(first.bot_strength || getSystemBotDefinition(player1Id).default_strength),
    winner_user_id: winnerId || null,
    ended_reason: winnerId ? 'bot_quiz_complete' : 'bot_quiz_draw',
    ended_by_user_id: winnerId || null,
    ended_at: endedIso,
    round_started_at_ms: startedMs,
    round_started_at: startedIso,
    created_at: startedIso,
    updated_at: endedIso
  }).catch(() => null);

  return created && typeof created === 'object'
    ? created
    : { id: matchId };
}

async function runBotQuizAutomationStep(nowMs = Date.now(), quizEnabled = true) {
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const safeNowIso = new Date(safeNowMs).toISOString();
  const quizStateRaw = await getNode(BOT_ARENA_QUIZ_STATE_PATH).catch(() => null);
  const quizState = normalizeBotArenaQuizState(quizStateRaw);

  if (!quizEnabled) {
    if (quizState.status === 'active') {
      await Promise.all(
        quizState.assignments.map((row) => clearBotBusyBySource(row.bot_id, BOT_QUIZ_BUSY_SOURCE).catch(() => null))
      ).catch(() => null);
    }
    await set(ref(firebaseDb, BOT_ARENA_QUIZ_STATE_PATH), {
      status: 'idle',
      batch_id: '',
      assignments: [],
      started_at_ms: 0,
      ends_at_ms: 0,
      cursor_difficulty: quizState.cursor_difficulty,
      cursor_index: quizState.cursor_index,
      cursor_cycle_no: quizState.cursor_cycle_no,
      updated_at: safeNowIso,
      last_result: quizState.status === 'active'
        ? {
          status: 'paused',
          at_ms: safeNowMs,
          bot_ids: quizState.assignments.map((row) => row.bot_id).filter((id) => !!id)
        }
        : (quizState.last_result || null)
    }).catch(() => null);
    return { ok: true, state: quizState.status === 'active' ? 'quiz_paused' : 'quiz_paused_idle' };
  }

  if (quizState.status === 'active') {
    if (safeNowMs < quizState.ends_at_ms) {
      return {
        ok: true,
        state: 'quiz_active',
        bot_ids: quizState.assignments.map((row) => row.bot_id).filter((id) => !!id)
      };
    }

    const appliedResults = [];
    for (const assignment of quizState.assignments) {
      const applied = await applyBotQuizOutcomeToStats(assignment.bot_id, assignment).catch(() => null);
      if (applied) appliedResults.push(applied);
    }
    const quizHistoryMatch = await persistBotQuizHistoryMatch({
      batchId: quizState.batch_id || '',
      assignments: quizState.assignments,
      startedAtMs: quizState.started_at_ms,
      endedAtMs: safeNowMs
    }).catch(() => null);

    await Promise.all(
      quizState.assignments.map((row) => clearBotBusyBySource(row.bot_id, BOT_QUIZ_BUSY_SOURCE).catch(() => null))
    ).catch(() => null);

    const rotatedIds = quizState.assignments
      .map((row) => String(row.bot_id || '').trim())
      .filter((id) => isSystemBotUserId(id));
    if (rotatedIds.length) {
      await rotateGlobalBotQueue(rotatedIds, { count_for_arena_cycle: false }).catch(() => null);
    }

    await set(ref(firebaseDb, BOT_ARENA_QUIZ_STATE_PATH), {
      status: 'idle',
      batch_id: '',
      assignments: [],
      started_at_ms: 0,
      ends_at_ms: 0,
      cursor_difficulty: quizState.cursor_difficulty,
      cursor_index: quizState.cursor_index,
      cursor_cycle_no: quizState.cursor_cycle_no,
      updated_at: safeNowIso,
      last_result: {
        status: 'completed',
        at_ms: safeNowMs,
        batch_id: quizState.batch_id || '',
        bots: appliedResults,
        history_match_id: String(quizHistoryMatch?.id || '')
      }
    }).catch(() => null);

    return {
      ok: true,
      state: 'quiz_finalized',
      bot_ids: rotatedIds
    };
  }

  const [queueRow, busyRows, openMatchBusy] = await Promise.all([
    getNode(BOT_ARENA_QUEUE_PATH).catch(() => null),
    getNode(BOT_BUSY_PATH).catch(() => null),
    getBusyBotsFromOpenMatches()
  ]);
  const queueOrder = normalizeBotQueueOrder(queueRow?.order);
  const busySet = new Set(openMatchBusy instanceof Set ? Array.from(openMatchBusy) : []);
  if (busyRows && typeof busyRows === 'object') {
    Object.entries(busyRows).forEach(([botId, row]) => {
      if (!isSystemBotUserId(botId)) return;
      if (!isBotBusyRowActive(row, safeNowMs)) return;
      busySet.add(String(botId));
    });
  }

  const freeBots = queueOrder.filter((botId) => !busySet.has(botId));
  if (freeBots.length < BOT_QUIZ_BATCH_SIZE) {
    return { ok: true, state: 'quiz_idle_no_available_bot' };
  }

  const selection = takeNextBotQuizCatalogEntries({
    cursor_difficulty: quizState.cursor_difficulty,
    cursor_index: quizState.cursor_index,
    cursor_cycle_no: quizState.cursor_cycle_no
  }, BOT_QUIZ_BATCH_SIZE);
  if (!selection.entries.length || selection.entries.length < BOT_QUIZ_BATCH_SIZE) {
    return { ok: true, state: 'quiz_idle_no_catalog' };
  }

  const pickedBots = freeBots.slice(0, BOT_QUIZ_BATCH_SIZE);
  const configs = await Promise.all(pickedBots.map((botId) => getPvpBotConfig(botId).catch(() => null)));
  const batchId = `bot_quiz_batch_${safeNowMs}_${Math.floor(Math.random() * 10000)}`;
  const assignments = pickedBots.map((botId, index) => {
    const quizEntry = selection.entries[index] || selection.entries[selection.entries.length - 1];
    const botStrength = normalizeBotStrength(configs[index]?.strength || SYSTEM_BOT_STRENGTH_DEFAULT);
    const quizKey = getQuizKey(quizEntry.language || '', quizEntry.topic || '', quizEntry.difficulty || 'easy');
    const sim = simulateBotQuizOutcome(
      { ...(configs[index] || {}), strength: botStrength },
      quizEntry,
      { seed_key: `quiz_batch:${batchId}:${botId}:${quizKey}` }
    );
    return {
      bot_id: botId,
      bot_strength: botStrength,
      language: String(quizEntry.language || ''),
      topic: String(quizEntry.topic || ''),
      difficulty: normalizeDifficulty(quizEntry.difficulty || 'easy'),
      quiz_key: quizKey,
      total_questions: sim.total_questions,
      correct_count: sim.correct_count,
      best_streak: sim.best_streak,
      simulated_accuracy: sim.simulated_accuracy
    };
  });

  const durationMs = Math.round(
    BOT_QUIZ_DURATION_MS_MIN + Math.random() * (BOT_QUIZ_DURATION_MS_MAX - BOT_QUIZ_DURATION_MS_MIN)
  );
  await Promise.all(
    assignments.map((entry) => setBotBusy(entry.bot_id, {
      reason: 'bot_quiz',
      source: BOT_QUIZ_BUSY_SOURCE,
      until_ms: safeNowMs + durationMs + 1000
    }).catch(() => null))
  ).catch(() => null);

  await set(ref(firebaseDb, BOT_ARENA_QUIZ_STATE_PATH), {
    status: 'active',
    batch_id: batchId,
    assignments,
    started_at_ms: safeNowMs,
    ends_at_ms: safeNowMs + durationMs,
    cursor_difficulty: selection.cursor.cursor_difficulty,
    cursor_index: selection.cursor.cursor_index,
    cursor_cycle_no: selection.cursor.cursor_cycle_no,
    updated_at: safeNowIso,
    last_result: quizState.last_result || null
  }).catch(() => null);

  return {
    ok: true,
    state: 'quiz_created',
    bot_ids: assignments.map((row) => row.bot_id)
  };
}

export async function tryAcquireBotAutomationLock(ownerId, ttlMs = 7000) {
  const safeOwner = String(ownerId || '').trim();
  if (!safeOwner) return false;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expiresAt = nowMs + Math.max(2500, Number(ttlMs || 7000));
  const tx = await runTransaction(ref(firebaseDb, BOT_AUTOMATION_LOCK_PATH), (current) => {
    const cur = current && typeof current === 'object' ? current : null;
    const curOwner = String(cur?.owner_id || '');
    const curExpires = Math.max(0, Number(cur?.expires_at_ms || 0));
    if (cur && curExpires > nowMs && curOwner && curOwner !== safeOwner) return;
    return {
      owner_id: safeOwner,
      updated_at: nowIso,
      expires_at_ms: expiresAt
    };
  });
  return !!tx?.committed;
}

export async function runBotArenaAutomationTick(ownerId) {
  const safeOwner = String(ownerId || '').trim();
  if (!safeOwner) return { ok: false, reason: 'missing_owner' };
  const lock = await tryAcquireBotAutomationLock(safeOwner, 9000).catch(() => false);
  if (!lock) return { ok: false, reason: 'lock_not_acquired' };

  await ensureSystemBots().catch(() => null);
  await ensureBotQueues().catch(() => null);

  const nowMs = Date.now();
  await recoverStaleOrDuplicateBotDuels(nowMs).catch(() => null);
  await cleanupOrphanBotBusyEntries(nowMs).catch(() => null);
  await cleanupStalePendingBotUserMatches({ maxBatch: 40, staleMs: 14000 }).catch(() => null);
  await cleanupDrawFinishedMatches(120).catch(() => null);
  await cleanupZeroScoreFinishedMatches(120).catch(() => null);
  await reconcileFinishedBotMatchStats(nowMs).catch(() => null);
  const nowIso = new Date(nowMs).toISOString();
  const arenaStateRaw = await getNode(BOT_ARENA_STATE_PATH).catch(() => null);
  const arenaState = normalizeArenaState(arenaStateRaw);
  const daemonControl = await getBotArenaDaemonControl().catch(() => ({
    arena_enabled: false,
    pvp_enabled: false,
    quiz_enabled: false
  }));
  const arenaAutomationEnabled = parseBooleanLike(daemonControl?.arena_enabled, false);
  const pvpAutomationEnabled = arenaAutomationEnabled
    && parseBooleanLike(daemonControl?.pvp_enabled, arenaAutomationEnabled);
  const quizAutomationEnabled = arenaAutomationEnabled
    && parseBooleanLike(daemonControl?.quiz_enabled, arenaAutomationEnabled);
  const withQuizState = async (payload = {}) => {
    const quizResult = await runBotQuizAutomationStep(nowMs, quizAutomationEnabled).catch(() => null);
    if (!quizResult || typeof quizResult !== 'object') return payload;
    return {
      ...payload,
      quiz_state: String(quizResult.state || '').trim(),
      quiz_ok: quizResult.ok === true
    };
  };

  if (!pvpAutomationEnabled) {
    if (arenaState.status === 'active') {
      const finalized = await finalizeBotArenaMatch(arenaState, 'bot_duel_paused_by_admin').catch(() => null);
      await set(ref(firebaseDb, BOT_ARENA_STATE_PATH), {
        status: 'idle',
        match_id: '',
        bot_a_id: '',
        bot_b_id: '',
        started_at_ms: 0,
        ends_at_ms: 0,
        difficulty: 'easy',
        updated_at: nowIso,
        last_result: finalized || null
      }).catch(() => null);
      return withQuizState({ ok: true, state: 'paused_finalized', match_id: arenaState.match_id });
    }
    return withQuizState({ ok: true, state: 'paused' });
  }

  if (arenaState.status === 'active') {
    const arenaMatch = arenaState.match_id
      ? await getPvpMatch(arenaState.match_id).catch(() => null)
      : null;
    const isArenaMatchOpen = !!(arenaMatch && arenaMatch.is_bot_duel === true && isOpenPvpMatchStatus(arenaMatch.status));
    const staleByAge = arenaState.started_at_ms > 0 && (nowMs - arenaState.started_at_ms) >= BOT_DUEL_MAX_ACTIVE_AGE_MS;
    if (!isArenaMatchOpen) {
      await Promise.all([
        clearBotBusy(arenaState.bot_a_id, arenaState.match_id),
        clearBotBusy(arenaState.bot_b_id, arenaState.match_id)
      ]).catch(() => null);
      await set(ref(firebaseDb, BOT_ARENA_STATE_PATH), {
        status: 'idle',
        match_id: '',
        bot_a_id: '',
        bot_b_id: '',
        started_at_ms: 0,
        ends_at_ms: 0,
        difficulty: 'easy',
        updated_at: nowIso,
        last_result: null
      }).catch(() => null);
      return withQuizState({ ok: true, state: 'stale_reset', match_id: arenaState.match_id });
    }

    if (nowMs < arenaState.ends_at_ms && !staleByAge) {
      return withQuizState({ ok: true, state: 'active', match_id: arenaState.match_id });
    }
    const finalized = await finalizeBotArenaMatch(arenaState).catch(() => null);
    await set(ref(firebaseDb, BOT_ARENA_STATE_PATH), {
      status: 'idle',
      match_id: '',
      bot_a_id: '',
      bot_b_id: '',
      started_at_ms: 0,
      ends_at_ms: 0,
      difficulty: 'easy',
      updated_at: nowIso,
      last_result: finalized || null
    }).catch(() => null);
    return withQuizState({ ok: true, state: 'finalized', match_id: arenaState.match_id });
  }

  const [queueRow, busyRows, openMatchBusy] = await Promise.all([
    getNode(BOT_ARENA_QUEUE_PATH).catch(() => null),
    getNode(BOT_BUSY_PATH).catch(() => null),
    getBusyBotsFromOpenMatches()
  ]);

  const queueOrder = normalizeBotQueueOrder(queueRow?.order);
  const busySet = new Set(openMatchBusy);
  if (busyRows && typeof busyRows === 'object') {
    Object.entries(busyRows).forEach(([botId, row]) => {
      if (!isSystemBotUserId(botId)) return;
      if (!isBotBusyRowActive(row, nowMs)) return;
      busySet.add(String(botId));
    });
  }

  const freeBots = queueOrder.filter((botId) => !busySet.has(botId));
  if (freeBots.length < 2) {
    return withQuizState({ ok: true, state: 'idle_no_pair' });
  }

  const hasExternalActiveDuel = await hasAnyActiveBotDuelMatch().catch(() => false);
  if (hasExternalActiveDuel) {
    return withQuizState({ ok: true, state: 'idle_duel_already_active' });
  }

  const [botAId, botBId] = freeBots;
  if (!botAId || !botBId) {
    return withQuizState({ ok: true, state: 'idle_no_pair' });
  }

  const userStatsMap = await getNode('user_stats').catch(() => null);
  const botACategory = await getBotDifficultyById(botAId, userStatsMap).catch(() => 'easy');
  const botBCategory = await getBotDifficultyById(botBId, userStatsMap).catch(() => 'easy');
  if (normalizeDifficulty(botACategory) !== normalizeDifficulty(botBCategory)) {
    await rotateGlobalBotQueue([botAId], { count_for_arena_cycle: false }).catch(() => null);
    return withQuizState({ ok: true, state: 'idle_category_mismatch', bot_id: botAId });
  }

  const created = await createBotArenaMatch({
    botAId,
    botBId,
    nowIso,
    nowMs
  });
  if (!created?.matchId) {
    return withQuizState({ ok: false, reason: 'create_failed' });
  }

  await set(ref(firebaseDb, BOT_ARENA_STATE_PATH), {
    status: 'active',
    match_id: created.matchId,
    bot_a_id: created.botAId,
    bot_b_id: created.botBId,
    started_at_ms: created.startedAtMs,
    ends_at_ms: created.endsAtMs,
    difficulty: created.difficulty,
    updated_at: nowIso
  }).catch(() => null);

  return withQuizState({ ok: true, state: 'created', match_id: created.matchId });
}

async function isNicknameTaken(candidateNickname, userId) {
  const usersMap = await getNode('users').catch(() => null);
  if (!usersMap || typeof usersMap !== 'object') return false;
  const targetKey = nicknameKey(candidateNickname);

  return Object.entries(usersMap).some(([uid, row]) => {
    if (!uid || uid === userId || !row || typeof row !== 'object') return false;
    return nicknameKey(row.nickname || '') === targetKey;
  });
}

async function ensureUniqueNickname(baseNickname, userId) {
  const usersMap = await getNode('users').catch(() => null);
  const taken = new Set();

  if (usersMap && typeof usersMap === 'object') {
    Object.entries(usersMap).forEach(([uid, row]) => {
      if (!uid || uid === userId || !row || typeof row !== 'object') return;
      taken.add(nicknameKey(row.nickname || ''));
    });
  }

  const base = sanitizeNickname(baseNickname);
  if (!taken.has(nicknameKey(base))) return base;

  for (let suffix = 2; suffix <= 500; suffix += 1) {
    const candidate = `${base.slice(0, 20)}${suffix}`;
    if (!taken.has(nicknameKey(candidate))) return candidate;
  }

  return `${base.slice(0, 20)}${Date.now().toString().slice(-4)}`;
}

export async function getUserProfile(userId) {
  if (!userId) return null;
  const row = await getNode(`users/${userId}`);
  if (!row || typeof row !== 'object') return null;
  return {
    id: userId,
    auth_id: userId,
    full_name: String(row.full_name || row.name || ''),
    nickname: String(row.nickname || 'Jogador'),
    avatar: String(row.avatar || '🙂'),
    equipped_frame: row.equipped_frame || 'frame_default',
    equipped_background: row.equipped_background || 'bg_default',
    equipped_emoji: row.equipped_emoji || 'emoji_profile',
    created_at: row.created_at || null,
    updated_at: row.updated_at || null
  };
}

export async function getUserStats(userId) {
  if (!userId) return null;
  const row = await getNode(`user_stats/${userId}`);
  if (!row || typeof row !== 'object') return null;
  return { user_id: userId, ...row };
}

export async function getLegacyCloudSnapshot(userId) {
  if (!userId) return null;
  const row = await getNode(`cloud_saves/${userId}`);
  if (!row || typeof row !== 'object') return null;
  const snapshot = row.snapshot && typeof row.snapshot === 'object'
    ? row.snapshot
    : row;
  if (!snapshot || typeof snapshot !== 'object') return null;
  return snapshot;
}

export async function ensureUserProfile(authUser) {
  if (!authUser?.uid) return null;
  // Do not block user auth bootstrap on bot roster hydration.
  void ensureSystemBots().catch(() => null);
  const userId = String(authUser.uid);
  const existing = await getUserProfile(userId);
  const nowIso = new Date().toISOString();

  if (existing) {
    const stats = await getUserStats(userId);
    if (!stats) {
      await set(ref(firebaseDb, `user_stats/${userId}`), {
        user_id: userId,
        total_xp: 0,
        level: 1,
        ranking_points: 0,
        pvp_points: 0,
        coins: 20,
        pvp_battles: 0,
        pvp_wins: 0,
        pvp_losses: 0,
        pvp_processed_matches: {},
        pvp_recalculated_at_ms: Math.max(0, Number(existing.pvp_recalculated_at_ms || 0)),
        best_streak: 0,
        total_correct: 0,
        total_answered: 0,
        quizzes_completed: 0,
        topic_progress: {},
        quiz_best_scores: {},
        quiz_best_stars: {},
        achievement_ids: [],
        quiz_rewarded: {},
        progress_updated_at_ms: Date.now(),
        updated_at: nowIso
      });
    } else {
      const normalizedAchievementIds = normalizeAchievementIds(stats.achievement_ids || stats.achievements);
      const normalizedQuizRewarded = normalizeQuizRewardedMap(stats.quiz_rewarded);
      const needsBackfill = (
        !Array.isArray(stats.achievement_ids)
        || !stats.quiz_rewarded
        || typeof stats.quiz_rewarded !== 'object'
      );
      if (needsBackfill) {
        await update(ref(firebaseDb, `user_stats/${userId}`), {
          achievement_ids: normalizedAchievementIds,
          quiz_rewarded: normalizedQuizRewarded,
          progress_updated_at_ms: Math.max(Date.now(), Number(stats.progress_updated_at_ms || 0)),
          updated_at: nowIso
        }).catch(() => null);
      }
    }
    return existing;
  }

  const displayName = String(authUser.displayName || 'Jogador').trim();
  const firstName = displayName ? displayName.split(' ')[0] : 'Jogador';
  const nickname = await ensureUniqueNickname(firstName, userId);
  const avatar = String((authUser.photoURL && authUser.photoURL.trim()) || '🙂');

  await set(ref(firebaseDb, `users/${userId}`), {
    id: userId,
    auth_id: userId,
    full_name: displayName || null,
    nickname,
    avatar,
    equipped_frame: 'frame_default',
    equipped_background: 'bg_default',
    equipped_emoji: 'emoji_profile',
    reset_ack_version: 0,
    created_at: nowIso,
    updated_at: nowIso
  });

  await set(ref(firebaseDb, `user_stats/${userId}`), {
    user_id: userId,
    total_xp: 0,
    level: 1,
    ranking_points: 0,
    pvp_points: 0,
    coins: 20,
    pvp_battles: 0,
    pvp_wins: 0,
    pvp_losses: 0,
    pvp_processed_matches: {},
    pvp_recalculated_at_ms: 0,
    best_streak: 0,
    total_correct: 0,
    total_answered: 0,
    quizzes_completed: 0,
    topic_progress: {},
    quiz_best_scores: {},
    quiz_best_stars: {},
    achievement_ids: [],
    quiz_rewarded: {},
    progress_updated_at_ms: Date.now(),
    updated_at: nowIso
  });

  return getUserProfile(userId);
}

export async function updateUserProfile(userId, updates) {
  if (!userId || !updates || typeof updates !== 'object') return null;

  const current = await getUserProfile(userId);
  const nowIso = new Date().toISOString();
  let nextNickname = String(current?.nickname || '').trim();
  if (!nextNickname) {
    nextNickname = await ensureUniqueNickname('Jogador', userId);
  }
  if (updates.nickname !== undefined) {
    const validation = validateNicknameInput(updates.nickname);
    if (!validation.ok) {
      const error = new Error(validation.errorMessage);
      error.code = validation.errorCode;
      throw error;
    }

    const taken = await isNicknameTaken(validation.nickname, userId);
    if (taken) {
      const error = new Error('Este apelido ja esta em uso.');
      error.code = 'nickname/taken';
      throw error;
    }
    nextNickname = validation.nickname;
  }

  const payload = {
    id: userId,
    auth_id: userId,
    full_name: updates.full_name !== undefined
      ? String(updates.full_name || '').trim() || null
      : (current?.full_name || null),
    nickname: nextNickname,
    avatar: updates.avatar !== undefined
      ? String(updates.avatar || '🙂')
      : (current?.avatar || '🙂'),
    equipped_frame: updates.equipped_frame || current?.equipped_frame || 'frame_default',
    equipped_background: updates.equipped_background || current?.equipped_background || 'bg_default',
    equipped_emoji: updates.equipped_emoji || current?.equipped_emoji || 'emoji_profile',
    reset_ack_version: Number(current?.reset_ack_version || 0),
    created_at: current?.created_at || nowIso,
    updated_at: nowIso
  };

  await set(ref(firebaseDb, `users/${userId}`), payload);
  return getUserProfile(userId);
}

export async function upsertStatsFromProgress(userId, progress) {
  if (!userId || !progress) return;

  const totalXp = getProgressTotalXp(progress);
  const nowIso = new Date().toISOString();
  const incomingUpdatedAtMs = Math.max(1, Number(progress.updatedAt || Date.now()));

  await runTransaction(ref(firebaseDb, `user_stats/${userId}`), (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const prevSyncMs = Math.max(0, Number(prev.progress_updated_at_ms || 0));
    const nextSyncMs = Math.max(incomingUpdatedAtMs, prevSyncMs + 1, Date.now());

    const pvpBattles = Math.max(0, Math.trunc(Number(progress.pvpBattles || 0)));
    const pvpWins = Math.min(pvpBattles, Math.max(0, Math.trunc(Number(progress.pvpWins || 0))));
    const pvpLosses = Math.max(0, pvpBattles - pvpWins);
    const topicProgress = progress.topicProgress && typeof progress.topicProgress === 'object'
      ? progress.topicProgress
      : {};
    const quizBestScores = progress.quizBestScores && typeof progress.quizBestScores === 'object'
      ? progress.quizBestScores
      : {};
    const quizBestStars = progress.quizBestStars && typeof progress.quizBestStars === 'object'
      ? progress.quizBestStars
      : {};
    const pvpProcessedMatches = progress.pvpProcessedMatches && typeof progress.pvpProcessedMatches === 'object'
      ? progress.pvpProcessedMatches
      : {};
    const achievementIds = normalizeAchievementIds(progress.achievements);
    const quizRewarded = normalizeQuizRewardedMap(progress.quizRewarded);

    return {
      user_id: userId,
      total_xp: Math.max(0, Math.trunc(Number(totalXp || 0))),
      level: Math.max(1, Math.trunc(Number(progress.level || 1))),
      ranking_points: Math.max(0, Math.trunc(Number(progress.rankingPoints || 0))),
      pvp_points: Math.max(0, Math.trunc(Number(progress.pvpPoints || 0))),
      coins: Math.max(0, Math.trunc(Number(progress.coins || 0))),
      pvp_battles: pvpBattles,
      pvp_wins: pvpWins,
      pvp_losses: pvpLosses,
      pvp_processed_matches: pvpProcessedMatches,
      pvp_recalculated_at_ms: Math.max(0, Number(prev.pvp_recalculated_at_ms || 0)),
      best_streak: Math.max(0, Math.trunc(Number(progress.bestStreak || 0))),
      total_correct: Math.max(0, Math.trunc(Number(progress.totalCorrect || 0))),
      total_answered: Math.max(0, Math.trunc(Number(progress.totalAnswered || 0))),
      quizzes_completed: Math.max(0, Math.trunc(Number(progress.quizzes || 0))),
      topic_progress: topicProgress,
      quiz_best_scores: quizBestScores,
      quiz_best_stars: quizBestStars,
      achievement_ids: achievementIds,
      quiz_rewarded: quizRewarded,
      is_system_bot: prev.is_system_bot === true || isSystemBotUserId(userId),
      progress_updated_at_ms: nextSyncMs,
      updated_at: nowIso
    };
  });
}

export async function saveQuizResult(userId, result) {
  if (!userId || !result?.language || !result?.topic || !result?.difficulty) return;

  const key = `${String(result.language)}_${String(result.topic)}_${String(result.difficulty)}`;
  const path = `quiz_results/${key}/${userId}`;
  const nowIso = new Date().toISOString();

  await runTransaction(ref(firebaseDb, path), (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const nextCorrect = Math.max(0, Number(result.correct_count || 0));
    const prevCorrect = Math.max(0, Number(prev.correct_count || 0));
    const nextScorePct = Math.max(0, Number(result.score_pct || 0));
    const prevScorePct = Math.max(0, Number(prev.score_pct || 0));
    const isBetter = nextCorrect > prevCorrect || (nextCorrect === prevCorrect && nextScorePct > prevScorePct);

    if (!isBetter && prev.user_id) {
      return {
        ...prev,
        updated_at: nowIso
      };
    }

    return {
      user_id: userId,
      language: String(result.language),
      topic: String(result.topic),
      difficulty: String(result.difficulty),
      score_pct: nextScorePct,
      xp_earned: Math.max(0, Number(result.xp_earned || 0)),
      correct_count: nextCorrect,
      total_questions: Math.max(1, Number(result.total_questions || 1)),
      best_streak: Math.max(0, Number(result.best_streak || 0)),
      created_at: prev.created_at || nowIso,
      updated_at: nowIso
    };
  });
}

function buildGlobalRankingsList(usersMap, statsMap, userShopMap = {}, mode = 'pve', limit = 50) {
  if (!statsMap || typeof statsMap !== 'object') return [];

  const users = usersMap && typeof usersMap === 'object' ? usersMap : {};
  const shopRows = userShopMap && typeof userShopMap === 'object' ? userShopMap : {};
  const list = Object.entries(statsMap).map(([userId, rawStats]) => {
    const stats = rawStats && typeof rawStats === 'object' ? rawStats : {};
    const user = users[userId] && typeof users[userId] === 'object' ? users[userId] : {};
    const shopRow = shopRows[userId] && typeof shopRows[userId] === 'object' ? shopRows[userId] : {};
    const shopEquipped = shopRow.equipped && typeof shopRow.equipped === 'object' ? shopRow.equipped : {};
    const frame = String(shopEquipped.frame || user.equipped_frame || 'frame_default');
    const background = String(shopEquipped.background || user.equipped_background || 'bg_default');
    const emoji = String(shopEquipped.emoji || user.equipped_emoji || 'emoji_profile');

    return {
      user_id: userId,
      nickname: String(user.nickname || 'Jogador'),
      avatar: String(user.avatar || '🤓'),
      equipped_frame: frame,
      equipped_background: background,
      equipped_emoji: emoji,
      ranking_points: Math.max(0, Number(stats.ranking_points || 0)),
      pvp_points: Math.max(0, Number(stats.pvp_points || 0)),
      pvp_wins: Math.max(0, Number(stats.pvp_wins || 0)),
      pvp_battles: Math.max(0, Number(stats.pvp_battles || 0)),
      level: Math.max(1, Number(stats.level || 1)),
      total_correct: Math.max(0, Number(stats.total_correct || 0)),
      total_xp: Math.max(0, Number(stats.total_xp || 0))
    };
  });

  const safeMode = String(mode || 'pve').toLowerCase() === 'pvp' ? 'pvp' : 'pve';
  list.sort((a, b) => {
    if (safeMode === 'pvp') {
      return (
        b.pvp_points - a.pvp_points ||
        b.pvp_wins - a.pvp_wins ||
        a.pvp_battles - b.pvp_battles ||
        b.total_correct - a.total_correct ||
        b.total_xp - a.total_xp
      );
    }
    return (
      b.ranking_points - a.ranking_points ||
      b.total_correct - a.total_correct ||
      b.total_xp - a.total_xp
    );
  });

  return list.slice(0, Math.max(1, Number(limit || 50)));
}

export async function getGlobalRankings(mode = 'pve', limit = 50) {
  await ensureSystemBot().catch(() => null);
  const [usersMap, statsMap, userShopMap] = await Promise.all([
    getNode('users'),
    getNode('user_stats'),
    getNode('user_shop')
  ]);
  return buildGlobalRankingsList(usersMap, statsMap, userShopMap, mode, limit);
}

export function subscribeGlobalRankings(mode = 'pve', limit = 50, onChange, onError = null) {
  if (typeof onChange !== 'function') return () => {};
  ensureSystemBot().catch(() => null);

  let usersMap = {};
  let statsMap = {};
  let userShopMap = {};

  const emit = () => {
    onChange(buildGlobalRankingsList(usersMap, statsMap, userShopMap, mode, limit));
  };

  const usersRef = ref(firebaseDb, 'users');
  const statsRef = ref(firebaseDb, 'user_stats');
  const userShopRef = ref(firebaseDb, 'user_shop');

  const unsubUsers = onValue(
    usersRef,
    (snap) => {
      usersMap = snap.exists() ? (snap.val() || {}) : {};
      emit();
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );

  const unsubStats = onValue(
    statsRef,
    (snap) => {
      statsMap = snap.exists() ? (snap.val() || {}) : {};
      emit();
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );

  const unsubUserShop = onValue(
    userShopRef,
    (snap) => {
      userShopMap = snap.exists() ? (snap.val() || {}) : {};
      emit();
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );

  return () => {
    unsubUsers();
    unsubStats();
    unsubUserShop();
  };
}

export async function getQuizRankings(language, topic, difficulty, limit = 50) {
  const key = `${String(language || '')}_${String(topic || '')}_${String(difficulty || '')}`;
  const [rowsMap, usersMap] = await Promise.all([
    getNode(`quiz_results/${key}`),
    getNode('users')
  ]);

  if (!rowsMap || typeof rowsMap !== 'object') return [];

  const list = Object.entries(rowsMap).map(([userId, raw]) => {
    const row = raw && typeof raw === 'object' ? raw : {};
    const user = usersMap && typeof usersMap === 'object' && usersMap[userId] && typeof usersMap[userId] === 'object'
      ? usersMap[userId]
      : {};

    return {
      user_id: userId,
      nickname: String(user.nickname || 'Jogador'),
      avatar: String(user.avatar || '🤓'),
      equipped_frame: String(user.equipped_frame || 'frame_default'),
      equipped_background: String(user.equipped_background || 'bg_default'),
      equipped_emoji: String(user.equipped_emoji || 'emoji_profile'),
      correct_count: Math.max(0, Number(row.correct_count || 0)),
      score_pct: Math.max(0, Number(row.score_pct || 0)),
      total_questions: Math.max(1, Number(row.total_questions || 1)),
      best_streak: Math.max(0, Number(row.best_streak || 0))
    };
  });

  list.sort((a, b) => b.correct_count - a.correct_count || b.score_pct - a.score_pct);
  return list.slice(0, Math.max(1, Number(limit || 50)));
}

export async function upsertPresence(user) {
  if (!user?.id) return;
  const nowIso = new Date().toISOString();
  await update(ref(firebaseDb, `presence/${user.id}`), {
    user_id: user.id,
    auth_id: user.auth_id || user.id,
    nickname: user.nickname || 'Jogador',
    avatar: user.avatar || '🤓',
    page_open: true,
    last_seen: nowIso,
    updated_at: nowIso
  });
}

export async function markPresenceClosed(userId) {
  if (!userId) return;
  const nowIso = new Date().toISOString();
  await update(ref(firebaseDb, `presence/${userId}`), {
    page_open: false,
    last_seen: nowIso,
    updated_at: nowIso
  });
}

export async function getOnlinePresenceCount(staleSeconds = 35) {
  const rows = await getNode('presence');
  if (!rows || typeof rows !== 'object') return 0;

  const cutoff = Date.now() - Math.max(1, Number(staleSeconds || 35)) * 1000;
  let total = 0;

  Object.values(rows).forEach((row) => {
    if (!row || typeof row !== 'object') return;
    if (!row.page_open) return;
    const seenAt = toMillis(row.last_seen || row.updated_at);
    if (seenAt >= cutoff) total += 1;
  });

  return total;
}

function isBotLikeEntry(userId, row) {
  const rawId = String(userId || '').toLowerCase();
  if (rawId.startsWith('bot_') || rawId.startsWith('ai_')) return true;

  const source = String(row?.source || '').toLowerCase();
  if (source.includes('bot')) return true;

  if (row?.is_bot === true) return true;
  if (String(row?.bot || '').toLowerCase() === 'true') return true;
  return false;
}

export async function getArenaMetrics(staleSeconds = 35) {
  const cutoffMs = Date.now() - Math.max(1, Number(staleSeconds || 35)) * 1000;

  const [presenceRows, queueRows, userBotQueueRow, busyRows, openMatchBusy] = await Promise.all([
    getNode('presence'),
    getNode('pvp_queue'),
    getNode(BOT_USER_QUEUE_PATH).catch(() => null),
    getNode(BOT_BUSY_PATH).catch(() => null),
    getBusyBotsFromOpenMatches().catch(() => new Set())
  ]);

  const onlineHumanIds = new Set();
  if (presenceRows && typeof presenceRows === 'object') {
    Object.entries(presenceRows).forEach(([id, row]) => {
      if (!row || typeof row !== 'object') return;
      if (!row.page_open) return;
      const seenAt = toMillis(row.last_seen || row.updated_at);
      if (seenAt < cutoffMs) return;
      const safeId = String(id || '').trim();
      if (!safeId || isSystemBotUserId(safeId)) return;
      onlineHumanIds.add(safeId);
    });
  }

  let waitingHumans = 0;
  if (queueRows && typeof queueRows === 'object') {
    Object.entries(queueRows).forEach(([id, row]) => {
      if (!row || typeof row !== 'object') return;
      if (String(row.status || '') !== 'waiting') return;
      const updatedAt = toMillis(row.updated_at || row.created_at);
      if (updatedAt < cutoffMs) return;
      const safeId = String(id || '').trim();
      if (isSystemBotUserId(safeId) || isBotLikeEntry(safeId, row)) return;
      waitingHumans += 1;
    });
  }

  const nowMs = Date.now();
  const busySet = new Set(openMatchBusy instanceof Set ? Array.from(openMatchBusy) : []);
  if (busyRows && typeof busyRows === 'object') {
    Object.entries(busyRows).forEach(([botId, row]) => {
      if (!isSystemBotUserId(botId)) return;
      if (!isBotBusyRowActive(row, nowMs)) return;
      busySet.add(String(botId));
    });
  }

  const userBotOrder = normalizeBotQueueOrder(userBotQueueRow?.order);
  // Only count bots that are effectively "in queue now": the next bot in sequence.
  // This keeps the queue indicator aligned with actual matchmaking behavior.
  const nextQueuedBotId = userBotOrder.find((botId) => !busySet.has(botId)) || '';
  const waitingBots = nextQueuedBotId ? 1 : 0;

  return {
    online: Math.max(0, onlineHumanIds.size + SYSTEM_BOT_IDS.length),
    queue: Math.max(0, waitingHumans + waitingBots)
  };
}

export async function getUserShop(userId) {
  if (!userId) return null;
  const row = await getNode(`user_shop/${userId}`);
  if (!row || typeof row !== 'object') return null;
  return row;
}

export async function saveUserShop(userId, shopData) {
  if (!userId || !shopData || typeof shopData !== 'object') return null;
  const nowIso = new Date().toISOString();
  const owned = Array.isArray(shopData.owned)
    ? [...new Set(shopData.owned.map((id) => String(id || '').trim()).filter(Boolean))]
    : [];
  const payload = {
    owned,
    equipped: {
      frame: String(shopData?.equipped?.frame || 'frame_default'),
      background: String(shopData?.equipped?.background || 'bg_default'),
      emoji: String(shopData?.equipped?.emoji || 'emoji_profile')
    },
    updated_at: nowIso
  };

  await set(ref(firebaseDb, `user_shop/${userId}`), payload);
  return payload;
}

function getPairLockKey(userA, userB) {
  const a = String(userA || '').trim();
  const b = String(userB || '').trim();
  if (!a || !b) return '';
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

function getRoundLockKey(matchId, roundNo) {
  return `${String(matchId || '').trim()}_${Number(roundNo || 0)}`;
}

export async function getQueueEntryByUser(userId) {
  if (!userId) return null;
  const row = await getNode(`pvp_queue/${userId}`);
  if (!row || typeof row !== 'object') return null;
  return { id: userId, user_id: userId, ...row };
}

export function subscribeQueueEntry(userId, onChange, onError = null) {
  if (!userId || typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, `pvp_queue/${userId}`);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const row = snap.exists() ? snap.val() : null;
      onChange(row && typeof row === 'object' ? { id: userId, user_id: userId, ...row } : null);
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function upsertQueueEntry(payload) {
  const userId = String(payload?.user_id || '').trim();
  if (!userId) return null;

  const nowIso = new Date().toISOString();
  const difficulty = normalizeDifficulty(payload?.difficulty || 'easy');
  const category = normalizePvpCategory(payload?.category || payload?.difficulty || 'easy', difficulty);
  const queueRef = ref(firebaseDb, `pvp_queue/${userId}`);
  const tx = await runTransaction(queueRef, (current) => {
    const base = current && typeof current === 'object' ? current : {};
    return {
      ...base,
      user_id: userId,
      nickname: String(payload?.nickname || base.nickname || 'Jogador'),
      avatar: String(payload?.avatar || base.avatar || '🤓'),
      level: Math.max(1, Number(payload?.level || base.level || 1)),
      pvp_points: Math.max(0, Number(payload?.pvp_points || base.pvp_points || 0)),
      equipped_frame: String(payload?.equipped_frame || base.equipped_frame || 'frame_default'),
      equipped_background: String(payload?.equipped_background || base.equipped_background || 'bg_default'),
      equipped_emoji: String(payload?.equipped_emoji || base.equipped_emoji || 'emoji_profile'),
      language: String(payload?.language || base.language || ''),
      topic: String(payload?.topic || base.topic || ''),
      difficulty,
      category,
      status: 'waiting',
      match_id: null,
      created_at: base.created_at || nowIso,
      updated_at: nowIso
    };
  });

  if (!tx?.snapshot?.exists()) return null;
  return { id: userId, ...tx.snapshot.val() };
}

export async function leaveQueue(userId) {
  if (!userId) return false;
  await set(ref(firebaseDb, `pvp_queue/${userId}`), null);
  return true;
}

export async function ensureQueueHeartbeat(userId) {
  if (!userId) return null;
  const nowIso = new Date().toISOString();
  const tx = await runTransaction(ref(firebaseDb, `pvp_queue/${userId}`), (current) => {
    if (!current || typeof current !== 'object') return current;
    if (String(current.status || '') !== 'waiting') return current;
    return { ...current, updated_at: nowIso };
  });
  if (!tx?.snapshot?.exists()) return null;
  return { id: userId, ...tx.snapshot.val() };
}

export async function markQueueMatched(userId, matchId) {
  if (!userId || !matchId) return null;
  const nowIso = new Date().toISOString();
  const safeMatchId = String(matchId).trim();

  // Try transaction first
  try {
    const tx = await runTransaction(ref(firebaseDb, `pvp_queue/${userId}`), (current) => {
      if (!current || typeof current !== 'object') return;
      if (String(current.status || '') !== 'waiting') return;
      return {
        ...current,
        status: 'matched',
        match_id: safeMatchId,
        updated_at: nowIso
      };
    });
    if (tx?.committed && tx?.snapshot?.exists()) {
      const row = tx.snapshot.val();
      if (row && typeof row === 'object'
        && String(row.status || '').trim().toLowerCase() === 'matched'
        && String(row.match_id || '').trim() === safeMatchId) {
        return { id: userId, ...row };
      }
    }
  } catch (_txErr) {
    // Transaction failed — fall through to direct set
  }

  // Fallback: direct set if transaction failed or was aborted
  try {
    const currentSnap = await get(ref(firebaseDb, `pvp_queue/${userId}`)).catch(() => null);
    const current = currentSnap?.val();
    if (!current || typeof current !== 'object') return null;
    const currentStatus = String(current.status || '').trim().toLowerCase();
    if (currentStatus !== 'waiting' && currentStatus !== 'matched') return null;
    if (currentStatus === 'matched') {
      // Already matched — check if it's ours
      if (String(current.match_id || '').trim() === safeMatchId) {
        return { id: userId, ...current };
      }
      return null;
    }
    const payload = {
      ...current,
      status: 'matched',
      match_id: safeMatchId,
      updated_at: nowIso
    };
    await set(ref(firebaseDb, `pvp_queue/${userId}`), payload);
    return { id: userId, ...payload };
  } catch (_setErr) {
    return null;
  }
}

export async function clearQueueMatch(userId) {
  if (!userId) return null;
  const nowIso = new Date().toISOString();
  const tx = await runTransaction(ref(firebaseDb, `pvp_queue/${userId}`), (current) => {
    if (!current || typeof current !== 'object') return current;
    if (String(current.status || '') !== 'matched') return current;
    return {
      ...current,
      status: 'waiting',
      match_id: null,
      updated_at: nowIso
    };
  });
  if (!tx?.snapshot?.exists()) return null;
  return { id: userId, ...tx.snapshot.val() };
}

export async function findQueueOpponent(myUserId, difficulty, category = '', staleSeconds = 25) {
  const safeMyUserId = String(myUserId || '').trim();
  if (!safeMyUserId) return [];
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeCategory = normalizePvpCategory(category || safeDifficulty, safeDifficulty);
  const nowMs = Date.now();
  const cutoffMs = nowMs - Math.max(5, Number(staleSeconds || 25)) * 1000;

  const rows = await getNode('pvp_queue');
  if (!rows || typeof rows !== 'object') return [];

  const list = Object.entries(rows)
    .filter(([userId, row]) => {
      if (!row || typeof row !== 'object') return false;
      if (String(userId) === safeMyUserId) return false;
      if (String(row.status || '') !== 'waiting') return false;
      if (normalizeDifficulty(row.difficulty || 'easy') !== safeDifficulty) return false;
      if (normalizePvpCategory(row.category || row.difficulty || 'easy', row.difficulty || 'easy') !== safeCategory) return false;
      const updatedAt = toMillis(row.updated_at || row.created_at);
      return updatedAt >= cutoffMs;
    })
    .map(([id, row]) => ({ id, ...row }));

  list.sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at));
  return list;
}

export async function cleanupStaleQueueEntries(staleSeconds = 30, actorUserId = '') {
  const safeActorUserId = String(actorUserId || '').trim();
  if (!safeActorUserId) return;

  const row = await getNode(`pvp_queue/${safeActorUserId}`);
  if (!row || typeof row !== 'object') return;
  if (String(row.status || '') !== 'waiting') return;

  const cutoffMs = Date.now() - Math.max(5, Number(staleSeconds || 30)) * 1000;
  const updatedAt = toMillis(row.updated_at || row.created_at);
  if (updatedAt >= cutoffMs) return;

  await set(ref(firebaseDb, `pvp_queue/${safeActorUserId}`), null).catch(() => null);
}

export async function tryAcquirePairLock(userA, userB, ownerUserId, ttlMs = 9000) {
  const lockKey = getPairLockKey(userA, userB);
  if (!lockKey || !ownerUserId) return false;

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expiresAtMs = nowMs + Math.max(1500, Number(ttlMs || 9000));
  const maxFutureWindowMs = 60000;
  const lockRef = ref(firebaseDb, `pvp_pair_locks/${lockKey}`);
  const safeOwner = String(ownerUserId || '').trim();

  const tx = await runTransaction(lockRef, (current) => {
    const cur = current && typeof current === 'object' ? current : null;
    const curExpire = Number(cur?.expires_at_ms || 0);
    const curOwner = String(cur?.owner_user_id || '').trim();
    const lockInFuture = cur && curExpire > nowMs;
    const suspiciousFuture = cur && curExpire > (nowMs + maxFutureWindowMs);
    const heldByOtherOwner = curOwner && curOwner !== safeOwner;
    if (lockInFuture && heldByOtherOwner && !suspiciousFuture) return;

    return {
      key: lockKey,
      owner_user_id: safeOwner,
      user_a: String(userA || ''),
      user_b: String(userB || ''),
      updated_at: nowIso,
      expires_at_ms: expiresAtMs
    };
  });

  return !!tx?.committed;
}

export async function releasePairLock(userA, userB, ownerUserId) {
  const lockKey = getPairLockKey(userA, userB);
  if (!lockKey) return false;

  await runTransaction(ref(firebaseDb, `pvp_pair_locks/${lockKey}`), (current) => {
    if (!current || typeof current !== 'object') return null;
    const curOwner = String(current.owner_user_id || '');
    if (curOwner && ownerUserId && curOwner !== String(ownerUserId)) return current;
    return null;
  });

  return true;
}

export async function cleanupStalePairLocks(staleSeconds = 25, maxBatch = 80) {
  const rows = await getNode('pvp_pair_locks').catch(() => null);
  if (!rows || typeof rows !== 'object') return { removed: 0 };

  const nowMs = Date.now();
  const cutoffMs = nowMs - Math.max(5, Number(staleSeconds || 25)) * 1000;
  const maxFutureMs = nowMs + 60000;

  const keys = Object.entries(rows)
    .filter(([key, row]) => {
      if (!key || !row || typeof row !== 'object') return false;
      const expiresAtMs = Math.max(0, Number(row.expires_at_ms || 0));
      if (!expiresAtMs) return true;
      return expiresAtMs < cutoffMs || expiresAtMs > maxFutureMs;
    })
    .map(([key]) => key)
    .slice(0, Math.max(1, Number(maxBatch || 80)));

  if (!keys.length) return { removed: 0 };
  await Promise.all(keys.map((key) => set(ref(firebaseDb, `pvp_pair_locks/${key}`), null).catch(() => null)));
  return { removed: keys.length };
}

export async function createPvpMatch(matchPayload) {
  const id = String(matchPayload?.id || '').trim();
  if (!id) return null;

  const nowIso = new Date().toISOString();
  const payload = stripUndefinedDeep({
    ...matchPayload,
    id,
    status: String(matchPayload?.status || 'active'),
    round_no: Math.max(1, Number(matchPayload?.round_no || 1)),
    total_rounds: Math.max(1, Number(matchPayload?.total_rounds || 5)),
    player1_score: Math.max(0, Number(matchPayload?.player1_score || 0)),
    player2_score: Math.max(0, Number(matchPayload?.player2_score || 0)),
    created_at: matchPayload?.created_at || nowIso,
    updated_at: matchPayload?.updated_at || nowIso
  });

  const tx = await runTransaction(ref(firebaseDb, `pvp_matches/${id}`), (current) => {
    if (current && typeof current === 'object') return current;
    return payload;
  });

  if (!tx?.snapshot?.exists()) return null;
  const row = tx.snapshot.val();
  updatePvpMatchRowsCacheRow(id, row);
  return { id, ...row };
}

export async function updatePvpMatch(matchId, patch) {
  if (!matchId || !patch || typeof patch !== 'object') return null;
  const nowIso = new Date().toISOString();
  const safePatch = stripUndefinedDeep({
    ...patch,
    updated_at: nowIso
  });
  await update(ref(firebaseDb, `pvp_matches/${matchId}`), safePatch);
  const row = await getNode(`pvp_matches/${matchId}`);
  updatePvpMatchRowsCacheRow(matchId, row && typeof row === 'object' ? row : null);
  return row ? { id: matchId, ...row } : null;
}

export async function getPvpMatch(matchId) {
  if (!matchId) return null;
  const row = await getNode(`pvp_matches/${matchId}`);
  if (!row || typeof row !== 'object') return null;
  updatePvpMatchRowsCacheRow(matchId, row);
  return { id: matchId, ...row };
}

export async function getPvpMatchesSnapshot() {
  const rows = await getPvpMatchRowsCached({ maxAgeMs: PVP_MATCH_ROWS_CACHE_TTL_MS });
  if (!rows || typeof rows !== 'object') return [];
  return Object.entries(rows)
    .filter(([id, row]) => !!id && row && typeof row === 'object')
    .map(([id, row]) => ({ id, ...row }));
}

export function subscribePvpMatches(onChange, onError = null) {
  if (typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, 'pvp_matches');
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const rows = snap.exists() ? snap.val() : null;
      setPvpMatchRowsCache(rows, PVP_MATCH_ROWS_CACHE_TTL_MS);
      const list = rows && typeof rows === 'object'
        ? Object.entries(rows)
          .filter(([id, row]) => !!id && row && typeof row === 'object')
          .map(([id, row]) => ({ id, ...row }))
        : [];
      onChange(list);
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function findOpenMatchForUser(userId) {
  const uid = String(userId || '').trim();
  if (!uid) return null;
  const rows = await getPvpMatchRowsCached({ maxAgeMs: PVP_MATCH_ROWS_CACHE_TTL_MS });
  if (!rows || typeof rows !== 'object') return null;

  const nowMs = Date.now();
  let best = null;
  let bestUpdatedMs = 0;
  Object.entries(rows).forEach(([id, row]) => {
    if (!row || typeof row !== 'object') return;
    const status = String(row.status || '');
    if (status !== 'active' && status !== 'pending_accept' && status !== 'round_result') return;
    if (String(row.player1_user_id || '') !== uid && String(row.player2_user_id || '') !== uid) return;

    // Skip stale pending_accept matches whose deadline has expired
    if (status === 'pending_accept') {
      const acceptDeadlineMs = Math.max(0, Number(row.accept_deadline_ms || 0));
      const updatedAt = Math.max(0, toMillis(row.updated_at || row.created_at || row.round_started_at));
      const deadlineExpired = acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs;
      const stalePending = acceptDeadlineMs === 0 && updatedAt > 0 && (nowMs - updatedAt) >= 35000;
      if (deadlineExpired || stalePending) return;
    }
    if (isStaleOpenBotUserMatch(row, nowMs)) return;

    const updatedMs = toMillis(row.updated_at || row.started_at || row.created_at);
    if (!best || updatedMs >= bestUpdatedMs) {
      best = { id, ...row };
      bestUpdatedMs = updatedMs;
    }
  });

  return best;
}

export function subscribeMatch(matchId, onChange, onError = null) {
  if (!matchId || typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, `pvp_matches/${matchId}`);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const row = snap.exists() ? snap.val() : null;
      updatePvpMatchRowsCacheRow(matchId, row && typeof row === 'object' ? row : null);
      onChange(row ? { id: matchId, ...row } : null);
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function upsertPvpAnswer(answerPayload) {
  const matchId = String(answerPayload?.match_id || '').trim();
  const userId = String(answerPayload?.user_id || '').trim();
  const roundNo = Math.max(1, Number(answerPayload?.round_no || 0));
  if (!matchId || !userId || !roundNo) return null;

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const answerRef = ref(firebaseDb, `pvp_answers/${matchId}/${roundNo}/${userId}`);

  const incoming = {
    match_id: matchId,
    round_no: roundNo,
    user_id: userId,
    answer_idx: Number(answerPayload?.answer_idx ?? -1),
    is_correct: !!answerPayload?.is_correct,
    answered_at_ms: Number(answerPayload?.answered_at_ms || nowMs),
    answered_at: String(answerPayload?.answered_at || nowIso),
    created_at: String(answerPayload?.created_at || nowIso)
  };

  const tx = await runTransaction(answerRef, (current) => {
    const existing = current && typeof current === 'object' ? current : null;
    if (!existing) return incoming;

    const existingIdx = Number(existing.answer_idx ?? -1);
    const incomingIdx = Number(incoming.answer_idx ?? -1);
    const existingCommitted = Number.isFinite(existingIdx) && existingIdx >= 0;
    const incomingCommitted = Number.isFinite(incomingIdx) && incomingIdx >= 0;

    if (existingCommitted && !incomingCommitted) return existing;
    if (existingCommitted && incomingCommitted) return existing;
    if (!existingCommitted && incomingCommitted) {
      return {
        ...existing,
        ...incoming,
        created_at: existing.created_at || incoming.created_at
      };
    }
    return existing;
  });

  if (!tx?.snapshot?.exists()) return null;
  return tx.snapshot.val();
}

export async function getPvpRoundAnswers(matchId, roundNo) {
  if (!matchId || !roundNo) return [];
  const rows = await getNode(`pvp_answers/${matchId}/${roundNo}`);
  if (!rows || typeof rows !== 'object') return [];
  return Object.values(rows).filter((row) => row && typeof row === 'object');
}

export function subscribeRoundAnswers(matchId, roundNo, onChange, onError = null) {
  if (!matchId || !roundNo || typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, `pvp_answers/${matchId}/${roundNo}`);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const rows = snap.exists() ? snap.val() : null;
      const list = rows && typeof rows === 'object'
        ? Object.values(rows).filter((row) => row && typeof row === 'object')
        : [];
      onChange(list);
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function pushPvpEmojiEvent(matchId, payload = {}) {
  const safeMatchId = String(matchId || '').trim();
  if (!safeMatchId) return null;
  const eventId = String(payload?.id || '').trim()
    || `${String(payload?.sender_user_id || 'user').trim()}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const senderUserId = String(payload?.sender_user_id || '').trim();
  const emoji = String(payload?.emoji || '').trim();
  if (!senderUserId || !emoji) return null;

  const nowMs = Math.max(1, Number(payload?.sent_at_ms || Date.now()));
  const nowIso = new Date(nowMs).toISOString();
  const value = {
    id: eventId,
    match_id: safeMatchId,
    sender_user_id: senderUserId,
    emoji,
    sent_at_ms: nowMs,
    sent_at: String(payload?.sent_at || nowIso),
    created_at: String(payload?.created_at || nowIso)
  };
  await set(ref(firebaseDb, `pvp_emoji_events/${safeMatchId}/${eventId}`), value);
  return value;
}

export function subscribePvpEmojiEvents(matchId, onChange, onError = null) {
  const safeMatchId = String(matchId || '').trim();
  if (!safeMatchId || typeof onChange !== 'function') return () => {};
  const targetRef = ref(firebaseDb, `pvp_emoji_events/${safeMatchId}`);
  const unsubscribe = onValue(
    targetRef,
    (snap) => {
      const rows = snap.exists() ? snap.val() : null;
      const list = rows && typeof rows === 'object'
        ? Object.entries(rows)
          .filter(([id, row]) => !!id && row && typeof row === 'object')
          .map(([id, row]) => ({
            id: String(id),
            match_id: safeMatchId,
            sender_user_id: String(row.sender_user_id || ''),
            emoji: String(row.emoji || ''),
            sent_at_ms: Math.max(0, Number(row.sent_at_ms || 0)),
            sent_at: String(row.sent_at || ''),
            created_at: String(row.created_at || '')
          }))
          .sort((a, b) => (
            Math.max(0, Number(a.sent_at_ms || 0)) - Math.max(0, Number(b.sent_at_ms || 0))
          ))
          .slice(-120)
        : [];
      onChange(list);
    },
    (error) => {
      if (typeof onError === 'function') onError(error);
    }
  );
  return () => unsubscribe();
}

export async function tryAcquireRoundFinalizeLock(matchId, roundNo, ownerUserId, ttlMs = 9000) {
  const lockKey = getRoundLockKey(matchId, roundNo);
  if (!lockKey || !ownerUserId) return false;

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expiresAtMs = nowMs + Math.max(1500, Number(ttlMs || 9000));
  const lockRef = ref(firebaseDb, `pvp_round_locks/${lockKey}`);

  const tx = await runTransaction(lockRef, (current) => {
    const cur = current && typeof current === 'object' ? current : null;
    const curOwner = String(cur?.owner_user_id || '');
    const curExpire = Number(cur?.expires_at_ms || 0);
    if (cur && curExpire > nowMs && curOwner && curOwner !== String(ownerUserId)) return;
    return {
      key: lockKey,
      owner_user_id: String(ownerUserId),
      match_id: String(matchId || ''),
      round_no: Number(roundNo || 0),
      updated_at: nowIso,
      expires_at_ms: expiresAtMs
    };
  });

  return !!tx?.committed;
}

export async function releaseRoundFinalizeLock(matchId, roundNo, ownerUserId) {
  const lockKey = getRoundLockKey(matchId, roundNo);
  if (!lockKey) return false;

  await runTransaction(ref(firebaseDb, `pvp_round_locks/${lockKey}`), (current) => {
    if (!current || typeof current !== 'object') return null;
    const curOwner = String(current.owner_user_id || '');
    if (curOwner && ownerUserId && curOwner !== String(ownerUserId)) return current;
    return null;
  });

  return true;
}

export async function applyPvpOutcomeToUserStats(userId, payload = {}) {
  const uid = String(userId || '').trim();
  if (!uid) return null;

  const safeResult = String(payload?.result || '').trim().toLowerCase();
  const isWin = safeResult === 'win';
  const isLoss = safeResult === 'loss';
  const pointsDelta = Math.trunc(Number(payload?.pointsDelta || 0));
  const xpGain = Math.max(0, Math.trunc(Number(payload?.xp || 0)));
  const coinsDelta = Math.trunc(Number(payload?.coinsDelta || 0));
  const battlesDelta = Math.max(1, Math.trunc(Number(payload?.battlesDelta || 1)));
  const nowIso = new Date().toISOString();

  await runTransaction(ref(firebaseDb, `user_stats/${uid}`), (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const prevTotalXp = Math.max(0, Math.trunc(Number(prev.total_xp || 0)));
    const nextTotalXp = prevTotalXp + xpGain;
    const xpState = splitProgressTotalXp(nextTotalXp);

    const prevBattles = Math.max(0, Math.trunc(Number(prev.pvp_battles || 0)));
    const prevWins = Math.max(0, Math.trunc(Number(prev.pvp_wins || 0)));
    const prevLosses = Math.max(0, Math.trunc(Number(prev.pvp_losses || 0)));

    return {
      user_id: uid,
      total_xp: nextTotalXp,
      level: Math.max(1, Number(xpState.level || 1)),
      ranking_points: Math.max(0, Number(prev.ranking_points || 0)),
      pvp_points: Math.max(0, Math.trunc(Number(prev.pvp_points || 0)) + pointsDelta),
      coins: Math.max(0, Math.trunc(Number(prev.coins || 20)) + coinsDelta),
      pvp_battles: prevBattles + battlesDelta,
      pvp_wins: prevWins + (isWin ? battlesDelta : 0),
      pvp_losses: prevLosses + (isLoss ? battlesDelta : 0),
      pvp_processed_matches: prev.pvp_processed_matches && typeof prev.pvp_processed_matches === 'object'
        ? prev.pvp_processed_matches
        : {},
      pvp_recalculated_at_ms: Math.max(0, Number(prev.pvp_recalculated_at_ms || 0)),
      best_streak: Math.max(0, Math.trunc(Number(prev.best_streak || 0))),
      total_correct: Math.max(0, Math.trunc(Number(prev.total_correct || 0))),
      total_answered: Math.max(0, Math.trunc(Number(prev.total_answered || 0))),
      quizzes_completed: Math.max(0, Math.trunc(Number(prev.quizzes_completed || 0))),
      topic_progress: prev.topic_progress && typeof prev.topic_progress === 'object' ? prev.topic_progress : {},
      quiz_best_scores: prev.quiz_best_scores && typeof prev.quiz_best_scores === 'object' ? prev.quiz_best_scores : {},
      quiz_best_stars: prev.quiz_best_stars && typeof prev.quiz_best_stars === 'object' ? prev.quiz_best_stars : {},
      achievement_ids: normalizeAchievementIds(prev.achievement_ids || prev.achievements),
      quiz_rewarded: normalizeQuizRewardedMap(prev.quiz_rewarded),
      is_system_bot: prev.is_system_bot === true || isSystemBotUserId(uid),
      progress_updated_at_ms: Math.max(0, Number(prev.progress_updated_at_ms || Date.now())),
      updated_at: nowIso
    };
  });

  return getUserStats(uid);
}
