
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import { LANGUAGES, QUESTIONS, TOPICS } from './data/questions-data';
import { ACHIEVEMENTS } from './lib/achievements';
import {
  DIFFICULTY_LABELS,
  PVP_COINS_REWARD,
  PVP_XP_REWARD,
  QUESTIONS_PER_ROUND,
  TIMER_SECONDS
} from './lib/constants';
import { firebaseAuth, firebaseDb, googleProvider } from './lib/firebaseClient';
import {
  cleanupStalePairLocks,
  cleanupDrawFinishedMatches,
  cleanupZeroScoreFinishedMatches,
  cleanupStalePendingBotUserMatches,
  cleanupStaleQueueEntries,
  clearQueueMatch,
  createPvpMatch,
  ensureSystemBot,
  ensureQueueHeartbeat,
  ensureSystemBots,
  ensureUserProfile,
  findOpenMatchForUser,
  findQueueOpponent,
  getArenaMetrics,
  getBotArenaDaemonControl,
  getBotArenaDaemonStatus,
  getBotArenaQuizState,
  getPvpMatch,
  getPvpBotConfig,
  getNextBotForUserMatch,
  getPvpRoundAnswers,
  pushPvpEmojiEvent,
  getQueueEntryByUser,
  getQuizRankings,
  getSystemBotDefaultStrength,
  getSystemBotSnapshot,
  clearBotBusy,
  isSystemBotUserId,
  rotateUserBotQueue,
  runBotArenaAutomationTick,
  setBotBusy,
  SYSTEM_BOT_ID,
  SYSTEM_BOT_IDS,
  SYSTEM_BOT_NICKNAME,
  getUserProfile,
  getUserShop,
  getUserStats,
  getLegacyCloudSnapshot,
  leaveQueue,
  markPresenceClosed,
  markQueueMatched,
  upsertPresence,
  releasePairLock,
  releaseRoundFinalizeLock,
  saveQuizResult,
  saveUserShop,
  setBotArenaDaemonControl,
  subscribeBotArenaDaemonControl,
  subscribeBotArenaDaemonStatus,
  subscribeBotArenaQuizState,
  subscribePvpMatches,
  subscribeGlobalRankings,
  subscribeMatch,
  subscribePvpEmojiEvents,
  subscribeQueueEntry,
  subscribeRoundAnswers,
  tryAcquirePairLock,
  applyPvpOutcomeToUserStats,
  tryAcquireRoundFinalizeLock,
  updatePvpMatch,
  validateNicknameInput,
  updateUserProfile,
  upsertPvpAnswer,
  upsertQueueEntry,
  upsertStatsFromProgress
} from './lib/repository';
import {
  applyQuizOutcome,
  defaultProgress,
  loadProgress,
  mergeProgressWithRemoteStats,
  normalizeProgress,
  saveProgress
} from './lib/progress';
import { getTopicsByLanguage, pickRoundQuestions } from './lib/quizEngine';
import {
  canPurchaseItem,
  defaultShopData,
  equipItem,
  getAvatarFrameClass,
  getAvatarFrameStyle,
  getDisplayAvatar,
  getHeroBackgroundStyle,
  getItemsByType,
  getShopItem,
  loadShopData,
  SHOP_RARITY_LABELS,
  SHOP_RARITY_ORDER,
  mergeShopData,
  normalizeShopData,
  purchaseItem,
  saveShopData
} from './lib/shop';
import {
  buildMatchId,
  getCategoryByPoints,
  getPvpPointsDeltaAdvanced,
  getPvpResultForUser,
  getRoundDurationSeconds,
  PVP_ROUNDS_PER_MATCH,
  resolveMatchWinner,
  resolveRoundOutcome
} from './lib/pvp';
import { getProgressTotalXp, getQuizKey, getXPForLevel, normalizeDifficulty } from './lib/utils';

function parseTopicProgressKey(key, languageIds = []) {
  const safeKey = String(key || '').trim();
  if (!safeKey) return { language: '', topic: '', difficulty: '' };

  const languageMatch = languageIds.find((languageId) => safeKey.startsWith(`${languageId}_`));
  if (!languageMatch) return { language: '', topic: '', difficulty: '' };

  const rawRest = safeKey.slice(languageMatch.length + 1);
  const difficulty = ['easy', 'medium', 'hard'].find((diff) => rawRest.endsWith(`_${diff}`)) || '';
  const topic = difficulty ? rawRest.slice(0, -(difficulty.length + 1)) : rawRest;
  return {
    language: languageMatch,
    topic: String(topic || ''),
    difficulty
  };
}

function isImageAvatarValue(value) {
  const safe = String(value || '').trim().toLowerCase();
  return safe.startsWith('http://') || safe.startsWith('https://') || safe.startsWith('data:image/');
}

function getBackgroundVisualMeta(shopData) {
  const shop = normalizeShopData(shopData);
  const background = getShopItem(shop?.equipped?.background);
  const id = String(background?.id || 'bg_default').trim() || 'bg_default';
  const rarity = String(background?.rarity || 'common').trim().toLowerCase() || 'common';
  const isLegendary = rarity === 'legendary';
  return {
    id,
    rarity,
    isLegendary,
    className: [
      `cos-bg-${id}`
    ].filter(Boolean).join(' ')
  };
}

function getDifficultyMultiplier(difficulty) {
  const safe = normalizeDifficulty(difficulty);
  if (safe === 'hard') return 3;
  if (safe === 'medium') return 2;
  return 1;
}

function formatSignedPoints(value) {
  const safe = Math.trunc(Number(value || 0));
  if (safe > 0) return `+${safe}`;
  return String(safe);
}

function getPvpDifficultyFromPoints(pointsValue) {
  const category = getCategoryByPoints(pointsValue);
  return normalizeDifficulty(category?.key || 'easy');
}

function getPvpQueueDifficultyFromStats(statsRow = null) {
  const row = statsRow && typeof statsRow === 'object' ? statsRow : {};
  return getPvpDifficultyFromPoints(row.pvp_points || 0);
}

function getPvpQueueDifficultyFromProgress(progressRow = null) {
  const row = progressRow && typeof progressRow === 'object' ? progressRow : {};
  return getPvpDifficultyFromPoints(row.pvpPoints || 0);
}

function buildShopFallbackFromProfile(profileRow = null) {
  const safe = profileRow && typeof profileRow === 'object' ? profileRow : {};
  const equipped = {
    frame: String(safe.equipped_frame || 'frame_default'),
    background: String(safe.equipped_background || 'bg_default'),
    emoji: String(safe.equipped_emoji || 'emoji_profile')
  };
  return normalizeShopData({
    owned: [
      'frame_default',
      'bg_default',
      'emoji_profile',
      equipped.frame,
      equipped.background,
      equipped.emoji
    ],
    equipped,
    updatedAt: Date.now()
  });
}

function getRandomBotMatchDelayMs(minSeconds = 1, maxSeconds = 12) {
  const minMs = Math.max(0, Math.trunc(Number(minSeconds || 0) * 1000));
  const maxMs = Math.max(minMs, Math.trunc(Number(maxSeconds || 12) * 1000));
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

function formatBuildBadgeValue(buildSha = '', builtAt = '') {
  const safeSha = String(buildSha || '').trim();
  const shortSha = safeSha ? safeSha.slice(0, 12) : 'desconhecido';
  const safeBuiltAt = String(builtAt || '').trim();
  if (!safeBuiltAt) return shortSha;

  const builtAtMs = Date.parse(safeBuiltAt);
  if (!Number.isFinite(builtAtMs) || builtAtMs <= 0) return shortSha;

  try {
    const stamp = new Date(builtAtMs).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${shortSha} | ${stamp}`;
  } catch {
    return shortSha;
  }
}

function buildQueueSessionId(userId = '', nowMs = Date.now()) {
  const safeUserId = String(userId || '').trim() || 'anonymous';
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const suffix = Math.floor(Math.random() * 100000);
  return `${safeUserId}_${safeNowMs}_${suffix}`;
}

const PVP_QUEUE_BOT_FIRST_THRESHOLD_MS = 15000;
const PVP_QUEUE_BOT_FIRST_WINDOW_MAX_MS = 27000;
const PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS = 0;
const PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS = 12;
const PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS = 2;
const PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS = 6;
const PVP_QUEUE_BOT_POST_THRESHOLD_RETRY_MAX_SECONDS = 2;
const PVP_QUEUE_BOT_HARD_DEADLINE_MS = PVP_QUEUE_BOT_FIRST_WINDOW_MAX_MS;
const PVP_QUEUE_RESUME_MODE_REFUSAL = 'requeue_after_refusal';
const PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS = 8000;
const PVP_MATCH_ACCEPT_TIMEOUT_MS = 15000;
const PVP_BOT_DECISION_DELAY_MIN_MS = 2000;
const PVP_BOT_DECISION_DELAY_MAX_MS = 5000;
const PVP_ROUND_RESULT_DURATION_MS = 10000;
const PVP_ROUND_EXTRA_ANSWER_MS = 3000;
const PVP_EMOJI_SPAM_WINDOW_MS = 1000;
const PVP_EMOJI_SPAM_BURST_LIMIT = 3;
const PVP_EMOJI_SPAM_COOLDOWN_MS = 2000;
const DATA_SUBSCRIBE_RETRY_TIMEOUT_MS = 3000;
const DATA_SUBSCRIBE_MAX_RETRIES = 3;
const DATA_SUBSCRIBE_RETRY_DELAY_MS = 260;

function clampQueueDelaySeconds(value, fallback = 1, ceiling = 12) {
  const safeFallback = Math.max(1, Math.min(ceiling, Number(fallback || 1)));
  const safe = Number(value);
  if (!Number.isFinite(safe) || safe <= 0) return safeFallback;
  return Math.max(1, Math.min(ceiling, Math.trunc(safe)));
}

function computeQueueBotMatchAtMs({
  nowMs = Date.now(),
  queueJoinedAtMs = 0,
  queueResumeMode = '',
  currentBotMatchAtMs = 0,
  minSeconds = 1,
  maxSeconds = 12
} = {}) {
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const safeJoinedAtMs = Math.max(0, Number(queueJoinedAtMs || 0)) || safeNowMs;
  const queueElapsedMs = Math.max(0, safeNowMs - safeJoinedAtMs);
  const safeResumeMode = String(queueResumeMode || '').trim().toLowerCase();
  const hardDeadlineMs = safeJoinedAtMs + PVP_QUEUE_BOT_HARD_DEADLINE_MS;

  if (safeResumeMode === PVP_QUEUE_RESUME_MODE_REFUSAL) {
    return safeNowMs + getRandomBotMatchDelayMs(
      PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS,
      PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS
    );
  }

  // Past the hard deadline: retry immediately (no more waiting)
  if (safeNowMs >= hardDeadlineMs) {
    return safeNowMs;
  }

  if (queueElapsedMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS) {
    const remainingToThresholdMs = Math.max(0, PVP_QUEUE_BOT_FIRST_THRESHOLD_MS - queueElapsedMs);
    const firstWindowDelayMs = getRandomBotMatchDelayMs(
      PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS,
      PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS
    );
    return Math.min(hardDeadlineMs, safeNowMs + remainingToThresholdMs + firstWindowDelayMs);
  }

  let safeMinSeconds = clampQueueDelaySeconds(minSeconds, 1, 12);
  let safeMaxSeconds = Math.max(
    safeMinSeconds,
    clampQueueDelaySeconds(maxSeconds, safeMinSeconds, 12)
  );

  // After crossing 15s in queue, keep retries fast to avoid long stalls when a
  // bot is temporarily busy/locked.
  safeMaxSeconds = Math.min(safeMaxSeconds, PVP_QUEUE_BOT_POST_THRESHOLD_RETRY_MAX_SECONDS);
  safeMinSeconds = Math.max(1, Math.min(safeMinSeconds, safeMaxSeconds));

  // Cap retry delay to stay within hard deadline
  const msUntilDeadline = Math.max(0, hardDeadlineMs - safeNowMs);
  const maxSecondsUntilDeadline = Math.max(1, Math.floor(msUntilDeadline / 1000));
  safeMaxSeconds = Math.min(safeMaxSeconds, maxSecondsUntilDeadline);
  safeMinSeconds = Math.min(safeMinSeconds, safeMaxSeconds);

  const nextAtMs = safeNowMs + getRandomBotMatchDelayMs(safeMinSeconds, safeMaxSeconds);
  const currentScheduledAtMs = Math.max(0, Number(currentBotMatchAtMs || 0));
  if (currentScheduledAtMs > safeNowMs) {
    return Math.min(currentScheduledAtMs, nextAtMs);
  }
  return Math.min(hardDeadlineMs, nextAtMs);
}

const POPULAR_WHATSAPP_EMOJIS = [
  '😂', '🤣', '😏', '🙄', '😈', '🤡', '👎', '🥱', '😬', '🤭',
  '😎', '🔥', '💥', '👀', '😜', '😝', '😹', '🫠', '🧠', '😤',
  '❤️', '😍', '😊', '😘', '🙏', '😭', '👍', '👏', '😁', '😅',
  '🤔', '😢', '🤩', '😴', '😡', '🥳', '🙌', '👌', '🎉', '🤝',
  '💪', '🤯', '🤖', '🤗', '😇', '😋', '😱', '🚀', '💡', '✨',
  '🫶', '😮', '😴', '🤨', '😶', '😑', '😒', '🤫', '🫡', '🥶',
  '🥵', '😵', '🙈', '🙉', '🙊', '😺', '😼', '😸', '😻', '😿',
  '💖', '🤍', '😌', '🌙', '🧐', '🙂', '🤪', '🙃', '🏆', '🤓'
];

const PVP_EMOJI_PICKER_OPTIONS = Array.from(new Set(
  POPULAR_WHATSAPP_EMOJIS
    .map((emoji) => String(emoji || '').trim())
    .filter((emoji) => !!emoji)
));

const DEFAULT_BATTLE_EMOJIS = ['🔥', '😎', '😵', '👏', '💡', '🤖'];
const ENABLE_CLIENT_BOT_AUTOMATION = process.env.NODE_ENV === 'development'
  && String(process.env.NEXT_PUBLIC_ENABLE_CLIENT_BOT_AUTOMATION || '').trim() === '1';
const MOBILE_UA_PATTERN = /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i;
const MOBILE_SW_CLEANUP_STORAGE_KEY = 'cq_mobile_sw_cleanup_sha_v1';
const MOBILE_AUTO_UPDATE_APPLIED_KEY = 'cq_mobile_auto_update_last_v1';
const MOBILE_AUTO_UPDATE_MIN_RETRY_MS = 5 * 60 * 1000;

function isLikelyMobileWeb() {
  if (typeof navigator === 'undefined') return false;
  const ua = String(navigator.userAgent || navigator.vendor || '').toLowerCase();
  const platform = String(navigator.platform || '');
  const hasTouchPoints = Math.max(0, Number(navigator.maxTouchPoints || 0)) > 1;
  const isIpadDesktopMode = platform === 'MacIntel' && hasTouchPoints;
  return MOBILE_UA_PATTERN.test(ua) || isIpadDesktopMode;
}

const BOT_PERSONALITY_PRESETS = {
  provocador: {
    label: 'Provocador',
    emojis: ['🔥', '😎', '😂', '😜', '💥', '👀']
  },
  analitico: {
    label: 'Analitico',
    emojis: ['🤔', '💡', '👌', '🤝', '😬', '✨']
  },
  calmo: {
    label: 'Calmo',
    emojis: ['😊', '🙏', '👌', '🤝', '😇', '✨']
  },
  estrategista: {
    label: 'Estrategista',
    emojis: ['🧠', '🤔', '🧐', '💡', '🫡', '✨']
  },
  caotico: {
    label: 'Caotico',
    emojis: ['🤪', '🥳', '😂', '💥', '🔥', '🙃']
  },
  sarcastico: {
    label: 'Sarcastico',
    emojis: ['😉', '😏', '🙄', '🤭', '👎', '😈']
  },
  competitivo: {
    label: 'Competitivo',
    emojis: ['😤', '💪', '🔥', '😎', '🏆', '🚀']
  },
  enigmatico: {
    label: 'Enigmatico',
    emojis: ['🌙', '😶', '🙈', '👀', '✨', '😈']
  },
  visionario: {
    label: 'Visionario',
    emojis: ['🧠', '💡', '🫡', '🤖', '🚀', '✨']
  },
  impulsivo: {
    label: 'Impulsivo',
    emojis: ['⚡', '💥', '🔥', '😤', '🤯', '🚀']
  }
};

const BOT_STRENGTH_PRESETS = {
  fraco: {
    label: 'Fraco',
    baseAccuracy: 0.5,
    minAccuracy: 0.5,
    maxAccuracy: 0.5,
    clutchBoost: 0,
    responseDelayMinMs: 2800,
    responseDelayMaxMs: 5200
  },
  medio: {
    label: 'Médio',
    baseAccuracy: 0.7,
    minAccuracy: 0.7,
    maxAccuracy: 0.7,
    clutchBoost: 0,
    responseDelayMinMs: 1800,
    responseDelayMaxMs: 3600
  },
  forte: {
    label: 'Forte',
    baseAccuracy: 0.9,
    minAccuracy: 0.9,
    maxAccuracy: 0.9,
    clutchBoost: 0,
    responseDelayMinMs: 900,
    responseDelayMaxMs: 2400
  }
};

const BOT_EMOJI_POOL_BY_BOT_ID = {
  bot_sys_codequiz_prime: ['😏', '🔥', '🤡', '👀', '😜', '💥'],
  bot_sys_codequiz_orbita: ['🧠', '🤔', '🧐', '💡', '🫡', '✨'],
  bot_sys_codequiz_zefira: ['🤔', '🧠', '💡', '🫡', '✨', '🤓'],
  bot_sys_codequiz_sopro: ['🙂', '🙏', '🫶', '👌', '😌', '✨'],
  bot_sys_codequiz_lua9: ['🤪', '🥳', '😂', '💥', '🔥', '🙃'],
  bot_sys_codequiz_thiagoara: ['😤', '💪', '🔥', '😎', '🏆', '🚀'],
  bot_sys_codequiz_bdevonly: ['🧠', '🤔', '💡', '🫡', '🤓', '✨'],
  bot_sys_codequiz_flakael: ['😉', '😏', '🙄', '🤭', '👎', '😈'],
  bot_sys_codequiz_z3n: ['😏', '😉', '🙄', '🤭', '😈', '👀'],
  bot_sys_codequiz_sandman: ['🌙', '😶', '🙈', '👀', '✨', '😈'],
  bot_sys_codequiz_eliztwa: ['🧠', '💡', '🫡', '🤖', '🚀', '✨'],
  bot_sys_codequiz_oharaxx: ['⚡', '💥', '🔥', '😤', '🤯', '🚀']
};

function normalizeBotPersonality(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_PERSONALITY_PRESETS[key]) return key;
  return 'provocador';
}

function normalizeBotStrength(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_STRENGTH_PRESETS[key]) return key;
  return 'medio';
}

function getBotEmojiPool(personalityKey, botUserId = '') {
  const safeBotId = String(botUserId || '').trim();
  if (safeBotId && Array.isArray(BOT_EMOJI_POOL_BY_BOT_ID[safeBotId])) {
    return normalizeBattleEmojis(BOT_EMOJI_POOL_BY_BOT_ID[safeBotId]).slice(0, 6);
  }
  const safe = BOT_PERSONALITY_PRESETS[normalizeBotPersonality(personalityKey)];
  return Array.isArray(safe?.emojis) && safe.emojis.length ? safe.emojis.slice(0, 6) : DEFAULT_BATTLE_EMOJIS;
}

function normalizeBattleEmojis(list) {
  const source = Array.isArray(list) ? list : [];
  const allowed = new Set(POPULAR_WHATSAPP_EMOJIS);
  const picked = [];
  source.forEach((emoji) => {
    const safe = String(emoji || '').trim();
    if (!safe || !allowed.has(safe) || picked.includes(safe)) return;
    if (picked.length >= 6) return;
    picked.push(safe);
  });
  if (picked.length >= 6) return picked;
  DEFAULT_BATTLE_EMOJIS.forEach((emoji) => {
    if (picked.length >= 6 || picked.includes(emoji)) return;
    picked.push(emoji);
  });
  POPULAR_WHATSAPP_EMOJIS.forEach((emoji) => {
    if (picked.length >= 6 || picked.includes(emoji)) return;
    picked.push(emoji);
  });
  return picked.slice(0, 6);
}

function normalizeEmojiDraftSlots(list) {
  const source = Array.isArray(list) ? list : [];
  const allowed = new Set(POPULAR_WHATSAPP_EMOJIS);
  const slots = Array.from({ length: 6 }, () => '');
  const used = new Set();

  for (let index = 0; index < Math.min(6, source.length); index += 1) {
    const safe = String(source[index] || '').trim();
    if (!safe || !allowed.has(safe) || used.has(safe)) continue;
    slots[index] = safe;
    used.add(safe);
  }

  if (source.length > 6) {
    for (let index = 6; index < source.length; index += 1) {
      const safe = String(source[index] || '').trim();
      if (!safe || !allowed.has(safe) || used.has(safe)) continue;
      const emptyIndex = slots.findIndex((item) => !item);
      if (emptyIndex < 0) break;
      slots[emptyIndex] = safe;
      used.add(safe);
    }
  }

  return slots;
}

function getMissingEmojiSlotIndexes(list) {
  const slots = normalizeEmojiDraftSlots(list);
  return slots
    .map((emoji, index) => (emoji ? 0 : index + 1))
    .filter((slotIndex) => slotIndex > 0);
}

function getNextEmptyEmojiSlot(list) {
  const current = normalizeEmojiDraftSlots(list);
  const emptyIndex = current.findIndex((emoji) => !emoji);
  if (emptyIndex < 0) return 5;
  return Math.max(0, Math.min(5, emptyIndex));
}

function applyEmojiToDraft(list, emoji, slotIndex = null) {
  const safeEmoji = String(emoji || '').trim();
  if (!safeEmoji) return normalizeEmojiDraftSlots(list);
  if (!POPULAR_WHATSAPP_EMOJIS.includes(safeEmoji)) return normalizeEmojiDraftSlots(list);
  const current = normalizeEmojiDraftSlots(list);
  const duplicateIndex = current.findIndex((item) => item === safeEmoji);

  let target = Number.isFinite(Number(slotIndex))
    ? Math.max(0, Math.min(5, Number(slotIndex)))
    : getNextEmptyEmojiSlot(current);

  if (duplicateIndex === target) return current;
  const next = [...current];
  if (duplicateIndex >= 0) {
    next[duplicateIndex] = '';
  }
  next[target] = safeEmoji;
  return normalizeEmojiDraftSlots(next);
}

function removeEmojiFromDraftByIndex(list, index) {
  const current = normalizeEmojiDraftSlots(list);
  const safeIndex = Math.max(0, Math.min(5, Number(index || 0)));
  if (!Number.isFinite(safeIndex)) return current;
  const next = [...current];
  next[safeIndex] = '';
  return next;
}

function getBotStrengthPreset(botStrength = 'medio') {
  const safeStrength = normalizeBotStrength(botStrength);
  return BOT_STRENGTH_PRESETS[safeStrength] || BOT_STRENGTH_PRESETS.medio;
}

function getBotStrengthLabel(botStrength = 'medio') {
  const preset = getBotStrengthPreset(botStrength);
  return String(preset?.label || BOT_STRENGTH_PRESETS.medio.label);
}

function hashBotSeed(value = '') {
  const input = String(value || '');
  let hash = 7;
  for (let idx = 0; idx < input.length; idx += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(idx)) | 0;
  }
  const normalized = Math.abs(hash) % 2147483646;
  return normalized + 1;
}

function createBotSeededRandom(seedValue) {
  let seed = Math.floor(Number(seedValue || 1)) % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
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
      const rand = createBotSeededRandom(hashBotSeed(`${seedKey}:${step}`));
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
    correctCount: hits,
    bestStreak,
    hitAtStep
  };
}

function getBotAccuracyByStrength(botStrength = 'medio', _context = {}) {
  const safeStrength = normalizeBotStrength(botStrength);
  const preset = getBotStrengthPreset(safeStrength);
  return Math.max(0.01, Math.min(0.99, Number(preset?.baseAccuracy || BOT_STRENGTH_PRESETS.medio.baseAccuracy)));
}

function getBotAnswerDelayMs() {
  // Keep bot answer timing independent from player actions/strength.
  return getRandomBotMatchDelayMs(1, 5);
}

function pickBotAnswerIndex(question, botStrength = 'medio', context = {}) {
  const safeQuestion = question && typeof question === 'object' ? question : {};
  const options = Array.isArray(safeQuestion.opts) ? safeQuestion.opts : [];
  const optionsCount = options.length;
  if (!optionsCount) return -1;

  const correctIndex = Math.max(0, Math.min(optionsCount - 1, Number(safeQuestion.answer || 0)));
  const safeStrength = normalizeBotStrength(botStrength);
  const accuracy = getBotAccuracyByStrength(safeStrength, context);
  const roundNo = Math.max(1, Math.trunc(Number(context?.roundNo || 1)));
  const totalRounds = Math.max(roundNo, Math.trunc(Number(context?.totalRounds || 5)));
  const matchId = String(context?.matchId || '').trim();
  const botUserId = String(context?.botUserId || '').trim();
  const seedBase = matchId && botUserId
    ? `pvp:${matchId}:${botUserId}:${safeStrength}`
    : `pvp:${safeStrength}:${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const shouldHit = resolveDeterministicBotRun(seedBase, accuracy, totalRounds, roundNo).hitAtStep;
  if (shouldHit) return correctIndex;

  const wrongIndexes = Array.from({ length: optionsCount }, (_, idx) => idx).filter((idx) => idx !== correctIndex);
  if (!wrongIndexes.length) return correctIndex;
  const wrongRoll = createBotSeededRandom(hashBotSeed(`${seedBase}:wrong:${roundNo}`))();
  return wrongIndexes[Math.floor(wrongRoll * wrongIndexes.length)];
}

function buildRewardParticleBurst({ xp = 0, coins = 0, origin = null }) {
  const rewardXp = Math.max(0, Number(xp || 0));
  const rewardCoins = Math.max(0, Number(coins || 0));
  const hasWindow = typeof window !== 'undefined';
  const baseX = Number(origin?.x || (hasWindow ? window.innerWidth * 0.5 : 240));
  const baseY = Number(origin?.y || (hasWindow ? window.innerHeight * 0.78 : 580));

  const coinCount = rewardCoins > 0 ? Math.max(18, Math.min(180, Math.round(rewardCoins * 2.8 + rewardXp * 0.2))) : 0;
  const xpCount = rewardXp > 0 ? Math.max(16, Math.min(160, Math.round(rewardXp * 1.85 + rewardCoins * 0.25))) : 0;
  const particles = [];

  const pushParticle = (kind, index, delay, phase = 'main') => {
    const isCoin = kind === 'coin';
    const id = `${kind}_${Date.now()}_${index}_${Math.floor(Math.random() * 9999)}`;
    const isTail = phase === 'tail';
    const spread = isTail
      ? (isCoin ? 16 : 20)
      : (isCoin ? 22 : 26);
    const dx = (Math.random() - 0.5) * (isTail
      ? (isCoin ? 170 : 210)
      : (isCoin ? 220 : 260));
    const dy = -(isTail
      ? (260 + Math.random() * (isCoin ? 200 : 240))
      : (220 + Math.random() * (isCoin ? 240 : 280)));
    const drift = (Math.random() - 0.5) * (isTail
      ? (isCoin ? 30 : 42)
      : (isCoin ? 40 : 52));
    const duration = Math.round((isTail
      ? (isCoin ? 1200 : 1400)
      : (isCoin ? 1450 : 1700)) + Math.random() * (isTail ? 620 : 820));
    const size = (isTail
      ? (isCoin ? 16 : 12)
      : (isCoin ? 18 : 14)) + Math.random() * (isTail ? 6 : (isCoin ? 9 : 7));
    particles.push({
      id,
      kind,
      icon: isCoin ? '🪙' : '✦',
      x: baseX + (Math.random() - 0.5) * spread,
      y: baseY + (Math.random() - 0.5) * 16,
      dx,
      dy,
      drift,
      delay,
      duration,
      size,
      rotate: Math.round((Math.random() - 0.5) * 36)
    });
  };

  let remainingCoins = coinCount;
  let remainingXp = xpCount;
  let delayCursor = 0;
  let sequenceIndex = 0;

  while (remainingCoins > 0 || remainingXp > 0) {
    const totalRemaining = remainingCoins + remainingXp;
    const pickCoin = remainingCoins > 0 && (
      remainingXp <= 0 || Math.random() < (remainingCoins / Math.max(1, totalRemaining))
    );

    const kind = pickCoin ? 'coin' : 'xp';
    if (kind === 'coin') remainingCoins -= 1;
    else remainingXp -= 1;

    // Particulas nascem em sequencia curta, mantendo sobreposicao para efeito de volume.
    const stepMin = kind === 'coin' ? 12 : 14;
    const stepMax = kind === 'coin' ? 24 : 28;
    const step = stepMin + Math.floor(Math.random() * (stepMax - stepMin + 1));
    delayCursor += step;

    pushParticle(kind, sequenceIndex, delayCursor);
    sequenceIndex += 1;
  }

  const tailCoinCount = Math.max(2, Math.min(14, Math.round(coinCount * 0.12)));
  const tailXpCount = Math.max(2, Math.min(12, Math.round(xpCount * 0.12)));
  let tailCoinsRemaining = coinCount > 0 ? tailCoinCount : 0;
  let tailXpRemaining = xpCount > 0 ? tailXpCount : 0;
  let tailCursor = delayCursor + Math.round(110 + Math.random() * 80);

  while (tailCoinsRemaining > 0 || tailXpRemaining > 0) {
    const totalTailRemaining = tailCoinsRemaining + tailXpRemaining;
    const pickTailCoin = tailCoinsRemaining > 0 && (
      tailXpRemaining <= 0 || Math.random() < (tailCoinsRemaining / Math.max(1, totalTailRemaining))
    );
    const tailKind = pickTailCoin ? 'coin' : 'xp';
    if (tailKind === 'coin') tailCoinsRemaining -= 1;
    else tailXpRemaining -= 1;

    const tailStep = tailKind === 'coin'
      ? 16 + Math.floor(Math.random() * 14)
      : 18 + Math.floor(Math.random() * 16);
    tailCursor += tailStep;
    pushParticle(tailKind, sequenceIndex, tailCursor, 'tail');
    sequenceIndex += 1;
  }

  return particles;
}

function getPvpRewardsByDifficulty(difficulty, resultKey) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeResult = String(resultKey || '').trim().toLowerCase();
  const xpRow = PVP_XP_REWARD[safeDifficulty] || PVP_XP_REWARD.easy;
  const coinsRow = PVP_COINS_REWARD[safeDifficulty] || PVP_COINS_REWARD.easy;
  return {
    xp: Math.max(0, Number(xpRow[safeResult] || 0)),
    coins: Math.max(0, Number(coinsRow[safeResult] || 0))
  };
}

function getMatchPlayerAcceptState(matchRow, userId) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const uid = String(userId || '').trim();
  if (!uid) return 'pending';
  if (uid === String(row.player1_user_id || '').trim()) {
    return String(row.player1_accept_state || 'pending').trim().toLowerCase() || 'pending';
  }
  if (uid === String(row.player2_user_id || '').trim()) {
    return String(row.player2_accept_state || 'pending').trim().toLowerCase() || 'pending';
  }
  return 'pending';
}

function shouldResumeQueueAfterMatchRefused(matchRow, userId) {
  const uid = String(userId || '').trim();
  if (!uid) return false;

  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const endedReason = String(row.ended_reason || '').trim().toLowerCase();
  if (endedReason !== 'match_refused' && endedReason !== 'accept_timeout') return false;

  const endedBy = String(row.ended_by_user_id || '').trim();
  if (endedReason === 'match_refused' && endedBy && endedBy === uid) return false;
  const myAcceptState = getMatchPlayerAcceptState(row, uid);
  // Don't re-queue if user explicitly left via exit button.
  if (endedBy && endedBy === uid && myAcceptState !== 'rejected') return false;
  return true;
}

function isQueueEntryFreshWaiting(queueRow, staleMs = 12000) {
  const row = queueRow && typeof queueRow === 'object' ? queueRow : {};
  if (String(row.status || '').trim().toLowerCase() !== 'waiting') return false;
  const updatedMs = Math.max(0, toMillis(row.updated_at || row.created_at));
  if (!updatedMs) return false;
  const maxAgeMs = Math.max(4000, Number(staleMs || 12000));
  return (Date.now() - updatedMs) <= maxAgeMs;
}

function getPendingAcceptAutoCloseReason(matchRow, nowMs = Date.now()) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (String(row.status || '').trim().toLowerCase() !== 'pending_accept') return '';

  const p1State = String(row.player1_accept_state || 'pending').trim().toLowerCase();
  const p2State = String(row.player2_accept_state || 'pending').trim().toLowerCase();
  if (p1State === 'rejected' || p2State === 'rejected') return 'match_refused';

  const acceptDeadlineMs = Math.max(0, Number(row.accept_deadline_ms || 0));
  if (acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs + 5000) return 'accept_timeout';

  const updatedMs = Math.max(
    0,
    toMillis(row.updated_at || row.created_at || row.round_started_at || row.round_started_at_ms)
  );
  if (updatedMs > 0 && (nowMs - updatedMs) >= 40000) return 'accept_timeout';

  return '';
}

function getInvalidFinishedMatchReason(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const status = String(row.status || '').trim().toLowerCase();
  if (status !== 'finished') return '';
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

function isInvalidFinishedMatch(matchRow) {
  return !!getInvalidFinishedMatchReason(matchRow);
}

function getMatchAcceptStateLabel(stateKey) {
  const key = String(stateKey || 'pending').trim().toLowerCase();
  if (key === 'accepted') return 'Aceitou';
  if (key === 'rejected') return 'Recusado';
  return 'Pendente';
}

function getPvpRoundAnswerFeedback(answerRow, correctIndex = -1) {
  const pickedIndex = Number(answerRow?.answer_idx ?? -1);
  const hasAnswer = Number.isFinite(pickedIndex) && pickedIndex >= 0;
  const safeCorrectIndex = Number(correctIndex);
  const isCorrect = hasAnswer && Number.isFinite(safeCorrectIndex) && pickedIndex === safeCorrectIndex;
  return {
    hasAnswer,
    isCorrect,
    label: isCorrect ? 'Acertou' : 'Errou',
    emoji: isCorrect ? '✅' : '❌',
    cssClass: isCorrect ? 'success' : 'error'
  };
}

function nowIso() {
  return new Date().toISOString();
}

function toMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDurationMmSs(totalMs) {
  const safeMs = Math.max(0, Number(totalMs || 0));
  const totalSec = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getAdminMatchStartMs(matchRow) {
  return Math.max(
    0,
    toMillis(matchRow?.created_at)
    || toMillis(matchRow?.round_started_at_ms)
    || toMillis(matchRow?.round_started_at)
    || toMillis(matchRow?.updated_at)
  );
}

function getAdminMatchEndMs(matchRow, nowMs = Date.now()) {
  const status = String(matchRow?.status || '').trim().toLowerCase();
  if (status === 'finished') {
    return Math.max(
      0,
      toMillis(matchRow?.ended_at)
      || toMillis(matchRow?.updated_at)
      || getAdminMatchStartMs(matchRow)
    );
  }
  return Math.max(0, Number(nowMs || Date.now()));
}

function getAdminMatchDurationLabel(matchRow, nowMs = Date.now()) {
  const startedMs = getAdminMatchStartMs(matchRow);
  if (!startedMs) return '00:00';
  const endedMs = getAdminMatchEndMs(matchRow, nowMs);
  return formatDurationMmSs(Math.max(0, endedMs - startedMs));
}

function getAdminMatchRoundsLabel(matchRow) {
  const totalRounds = Math.max(1, Number(matchRow?.total_rounds || PVP_ROUNDS_PER_MATCH));
  const status = String(matchRow?.status || '').trim().toLowerCase();
  if (status === 'finished') {
    const endedRoundNo = Math.max(1, Number(matchRow?.ended_round_no || matchRow?.round_no || totalRounds));
    return `${endedRoundNo}/${totalRounds}`;
  }
  const currentRoundNo = Math.max(1, Number(matchRow?.round_no || 1));
  return `${currentRoundNo}/${totalRounds}`;
}

function getLanguageNameById(languageId) {
  const safeLanguageId = String(languageId || '').trim();
  if (!safeLanguageId) return '--';
  const language = LANGUAGES.find((entry) => String(entry?.id || '') === safeLanguageId);
  return String(language?.name || safeLanguageId);
}

function getTopicNameById(languageId, topicId) {
  const safeTopicId = String(topicId || '').trim();
  if (!safeTopicId) return '--';
  const safeLanguageId = String(languageId || '').trim();
  if (!safeLanguageId) return safeTopicId;
  const topics = getTopicsByLanguage(TOPICS, safeLanguageId);
  const topic = topics.find((entry) => String(entry?.id || '') === safeTopicId);
  return String(topic?.name || safeTopicId);
}

function getAdminQuizCardData(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const assignments = Array.isArray(row.bot_quiz_assignments) ? row.bot_quiz_assignments : [];
  const firstAssignment = assignments.find((entry) => entry && typeof entry === 'object') || {};
  const languageId = String(firstAssignment.language || row.language || '').trim();
  const topicId = String(firstAssignment.topic || row.topic || '').trim();
  const difficulty = normalizeDifficulty(
    firstAssignment.difficulty
    || row.bot_quiz_difficulty
    || row.difficulty
    || 'easy'
  );
  const totalQuestions = Math.max(
    1,
    Math.trunc(Number(firstAssignment.total_questions || row.total_rounds || QUESTIONS_PER_ROUND))
  );
  const scoreSource = firstAssignment.correct_count !== undefined
    ? firstAssignment.correct_count
    : row.player1_score;
  const correctCount = Math.max(0, Math.min(totalQuestions, Math.trunc(Number(scoreSource || 0))));
  const accuracyPct = Math.max(0, Math.min(100, Math.round((correctCount / Math.max(1, totalQuestions)) * 100)));

  return {
    languageId,
    topicId,
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy,
    languageLabel: getLanguageNameById(languageId),
    topicLabel: getTopicNameById(languageId, topicId),
    totalQuestions,
    correctCount,
    accuracyPct
  };
}

function toAdminDayKey(msValue) {
  const base = Math.max(0, Number(msValue || 0)) || Date.now();
  const date = new Date(base);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}${month}${year}`;
}

function getMatchBotUserId(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const byField = String(row.bot_user_id || '').trim();
  if (isSystemBotUserId(byField)) return byField;
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  if (isSystemBotUserId(player1Id)) return player1Id;
  if (isSystemBotUserId(player2Id)) return player2Id;
  return '';
}

function getMatchHumanUserId(matchRow, botUserId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeBotUserId = String(botUserId || getMatchBotUserId(row)).trim();
  if (!safeBotUserId) return '';
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  if (player1Id === safeBotUserId) return player2Id;
  if (player2Id === safeBotUserId) return player1Id;
  return '';
}

function getBotDefaultStrengthById(botUserId = '') {
  const safeBotId = String(botUserId || '').trim();
  if (!safeBotId) return normalizeBotStrength('medio');
  return normalizeBotStrength(getSystemBotDefaultStrength(safeBotId));
}

function getBotStrengthFromMatchRow(matchRow, botUserId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeBotId = String(botUserId || '').trim();
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();

  if (safeBotId && safeBotId === player1Id) {
    return normalizeBotStrength(
      row.player1_bot_strength
      || row.bot_strength
      || getBotDefaultStrengthById(safeBotId)
    );
  }
  if (safeBotId && safeBotId === player2Id) {
    return normalizeBotStrength(
      row.player2_bot_strength
      || row.bot_strength
      || getBotDefaultStrengthById(safeBotId)
    );
  }
  if (safeBotId) {
    return normalizeBotStrength(row.bot_strength || getBotDefaultStrengthById(safeBotId));
  }
  return normalizeBotStrength(row.bot_strength || 'medio');
}

function getAdminBotClassSummary(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return '';

  if (row.is_bot_quiz === true) {
    const assignments = Array.isArray(row.bot_quiz_assignments) ? row.bot_quiz_assignments : [];
    const labels = assignments
      .slice(0, 2)
      .map((entry) => {
        const botId = String(entry?.bot_id || '').trim();
        const strength = normalizeBotStrength(entry?.bot_strength || getBotDefaultStrengthById(botId));
        return getBotStrengthLabel(strength);
      })
      .filter((label) => !!label);
    if (!labels.length) return '';
    if (labels.length === 1) return `Classe bot: ${labels[0]}`;
    return `Classes bot: ${labels[0]} x ${labels[1]}`;
  }

  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const isPlayer1Bot = isSystemBotUserId(player1Id);
  const isPlayer2Bot = isSystemBotUserId(player2Id);

  if (isPlayer1Bot && isPlayer2Bot) {
    const strength1 = getBotStrengthLabel(getBotStrengthFromMatchRow(row, player1Id));
    const strength2 = getBotStrengthLabel(getBotStrengthFromMatchRow(row, player2Id));
    return `Classes bot: ${strength1} x ${strength2}`;
  }

  const botId = getMatchBotUserId(row);
  if (!botId) return '';
  const strength = getBotStrengthLabel(getBotStrengthFromMatchRow(row, botId));
  return `Classe bot: ${strength}`;
}

function getAdminMatchTypeKey(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return 'unknown';
  if (row.is_bot_quiz === true) return 'bot_quiz';

  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const hasPlayer1 = !!player1Id;
  const hasPlayer2 = !!player2Id;
  const player1Bot = hasPlayer1 && isSystemBotUserId(player1Id);
  const player2Bot = hasPlayer2 && isSystemBotUserId(player2Id);

  if (player1Bot && player2Bot) return 'bot_vs_bot';
  if (hasPlayer1 && hasPlayer2 && !player1Bot && !player2Bot) return 'user_vs_user';
  if ((player1Bot && hasPlayer2 && !player2Bot) || (player2Bot && hasPlayer1 && !player1Bot)) {
    return 'user_vs_bot';
  }
  return 'unknown';
}

function getAdminMatchTypeLabel(matchRow) {
  const type = getAdminMatchTypeKey(matchRow);
  if (type === 'bot_quiz') return 'Quiz solo';
  if (type === 'user_vs_user') return 'Usuario x Usuario';
  if (type === 'user_vs_bot') return 'Usuario x Bot';
  if (type === 'bot_vs_bot') return 'Bot x Bot';
  return 'Partida';
}

function isAdminLiveMatchRow(matchRow, nowMs = Date.now()) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return false;
  if (row.result_void === true || row.history_hidden === true) return false;

  const status = String(row.status || '').trim().toLowerCase();
  if (status === 'pending_accept' || status === 'active' || status === 'round_result') return true;

  // Include transitional states that may appear briefly during user-vs-user pairing.
  if (status === 'matched' || status === 'starting') return true;
  if (status === 'finished') return false;
  if (row.is_bot_quiz === true) return false;

  const type = getAdminMatchTypeKey(row);
  if (type !== 'user_vs_user' && type !== 'user_vs_bot') return false;

  const player1State = String(row.player1_accept_state || '').trim().toLowerCase();
  const player2State = String(row.player2_accept_state || '').trim().toLowerCase();
  const hasAcceptSignal = (
    player1State === 'pending'
    || player2State === 'pending'
    || player1State === 'accepted'
    || player2State === 'accepted'
  );
  if (!hasAcceptSignal) return false;

  const updatedMs = toMillis(row.updated_at || row.round_started_at || row.created_at);
  if (!updatedMs) return false;
  return (Math.max(0, Number(nowMs || Date.now())) - updatedMs) <= 120000;
}

function buildFallbackPvpConfig() {
  const language = LANGUAGES[0]?.id || 'javascript';
  const topics = getTopicsByLanguage(TOPICS, language);
  const topic = topics[0]?.id || 'variables';
  return {
    language,
    topic,
    difficulty: 'easy'
  };
}

function hasQuestionsForDifficulty(languageId, topicId, difficulty) {
  const safeLanguage = String(languageId || '').trim();
  const safeTopic = String(topicId || '').trim();
  if (!safeLanguage || !safeTopic) return false;
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const pool = QUESTIONS?.[safeLanguage]?.[safeTopic]?.[safeDifficulty];
  return Array.isArray(pool) && pool.length > 0;
}

function ensureValidPvpConfig(config) {
  const fallback = buildFallbackPvpConfig();
  const requestedLanguage = String(config?.language || fallback.language);
  const safeLanguage = getTopicsByLanguage(TOPICS, requestedLanguage).length
    ? requestedLanguage
    : fallback.language;
  const safeDifficulty = normalizeDifficulty(config?.difficulty || fallback.difficulty);
  const topics = getTopicsByLanguage(TOPICS, safeLanguage);
  const candidateTopic = topics.some((topic) => topic.id === config?.topic)
    ? config.topic
    : (topics[0]?.id || fallback.topic);
  let safeTopic = candidateTopic;
  if (!hasQuestionsForDifficulty(safeLanguage, safeTopic, safeDifficulty)) {
    const compatibleTopic = topics.find((topic) => hasQuestionsForDifficulty(safeLanguage, topic.id, safeDifficulty));
    if (compatibleTopic?.id) safeTopic = compatibleTopic.id;
  }
  return {
    language: safeLanguage,
    topic: safeTopic,
    difficulty: safeDifficulty
  };
}

const PVP_MIXED_LANGUAGE_ID = '__pvp__';
const PVP_MIXED_TOPIC_ID = '__all__';

function collectPvpQuestionPoolByDifficulty(questionsMap, difficulty) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeQuestions = questionsMap && typeof questionsMap === 'object' ? questionsMap : {};
  const merged = [];

  Object.values(safeQuestions).forEach((languagePack) => {
    if (!languagePack || typeof languagePack !== 'object') return;
    Object.values(languagePack).forEach((topicPack) => {
      if (!topicPack || typeof topicPack !== 'object') return;
      const pool = Array.isArray(topicPack[safeDifficulty]) ? topicPack[safeDifficulty] : [];
      pool.forEach((question) => merged.push(question));
    });
  });

  return merged;
}

function pickPvpRoundQuestionsByDifficulty(questionsMap, difficulty, count, excludeQuestions = []) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const mergedPool = collectPvpQuestionPoolByDifficulty(questionsMap, safeDifficulty);
  if (!mergedPool.length) return [];

  const virtualQuestionsMap = {
    [PVP_MIXED_LANGUAGE_ID]: {
      [PVP_MIXED_TOPIC_ID]: {
        [safeDifficulty]: mergedPool
      }
    }
  };

  return pickRoundQuestions(
    virtualQuestionsMap,
    PVP_MIXED_LANGUAGE_ID,
    PVP_MIXED_TOPIC_ID,
    safeDifficulty,
    count,
    excludeQuestions
  );
}

function extendPvpQuestionSetIfNeeded(matchRow, nextRoundNo) {
  const targetRoundNo = Math.max(1, Number(nextRoundNo || 1));
  const currentSet = Array.isArray(matchRow?.question_set)
    ? matchRow.question_set.filter((row) => row && typeof row === 'object')
    : [];
  if (targetRoundNo <= currentSet.length) return currentSet;

  const difficulty = normalizeDifficulty(matchRow?.difficulty || 'easy');
  const nextSet = [...currentSet];
  const missingCount = targetRoundNo - nextSet.length;

  for (let index = 0; index < missingCount; index += 1) {
    const picked = pickPvpRoundQuestionsByDifficulty(QUESTIONS, difficulty, 1, nextSet);
    if (!picked.length) break;
    nextSet.push(picked[0]);
  }

  return nextSet;
}

const AUDIO_STORAGE_KEY = 'codequiz_audio_settings_v1';
const AUDIO_DEFAULTS = {
  musicEnabled: true,
  musicVolume: 0.58,
  sfxEnabled: true,
  sfxVolume: 0.72
};
const VERSION_CHECK_MS = 9000;
const QUICK_BOOT_CHECKS_MS = [900, 1900, 3400, 5600];
const COOKIE_CONSENT_STORAGE_KEY = 'codequiz_cookie_consent_v1';
const COOKIE_CONSENT_COOKIE_KEY = 'codequiz_cookie_consent';
const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const AUTH_REDIRECT_PENDING_KEY = 'codequiz_auth_redirect_pending_v1';
const AUTH_OPERATION_TIMEOUT_MS = 7000;
const AUTH_POPUP_TIMEOUT_MS = 12000;
const AUTH_REDIRECT_RESULT_TIMEOUT_MS = 14000;
const AUTH_BOOTSTRAP_GUARD_MS = 18000;
const UI_ACTION_WATCHDOG_MS = 9000;
const PRELOAD_RUNTIME_MIN_INTERVAL_MS = 12000;
const PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS = 18000;
const PROGRESS_RECOVERY_RETRY_MS = 6000;
const NICKNAME_RULE_COPY = 'Use 3 a 12 caracteres: apenas letras e numeros.';
const ADMIN_PANEL_PASSWORD = 'admin';
const PVP_EMOJI_STORAGE_PREFIX = 'codequiz_pvp_battle_emojis_v1';
const SHOP_UI_STATE_STORAGE_PREFIX = 'codequiz_shop_ui_state_v1';
const BOT_CONFIG_DEFAULT = {
  personality: 'provocador',
  strength: 'medio'
};
const SHOP_UI_TABS = ['frame', 'background', 'emoji'];
const SHOP_CATEGORY_OPEN_DEFAULT = SHOP_RARITY_ORDER.reduce((acc, rarity) => {
  acc[rarity] = true;
  return acc;
}, {});

function buildDefaultShopCategoryState() {
  return {
    frame: { ...SHOP_CATEGORY_OPEN_DEFAULT },
    background: { ...SHOP_CATEGORY_OPEN_DEFAULT },
    emoji: { ...SHOP_CATEGORY_OPEN_DEFAULT }
  };
}

function normalizeShopTab(tabInput = 'frame') {
  const safeTab = String(tabInput || '').trim();
  return SHOP_UI_TABS.includes(safeTab) ? safeTab : 'frame';
}

function normalizeShopCategoryOpenState(input) {
  const source = input && typeof input === 'object' ? input : {};
  const normalized = buildDefaultShopCategoryState();
  SHOP_UI_TABS.forEach((tab) => {
    const sourceTab = source[tab] && typeof source[tab] === 'object' ? source[tab] : {};
    const nextTabState = {};
    SHOP_RARITY_ORDER.forEach((rarity) => {
      nextTabState[rarity] = Object.prototype.hasOwnProperty.call(sourceTab, rarity)
        ? Boolean(sourceTab[rarity])
        : true;
    });
    normalized[tab] = nextTabState;
  });
  return normalized;
}

function isShopCategoryOpenStateEqual(currentState, nextState) {
  const safeCurrent = currentState && typeof currentState === 'object' ? currentState : {};
  const safeNext = nextState && typeof nextState === 'object' ? nextState : {};
  for (const tab of SHOP_UI_TABS) {
    for (const rarity of SHOP_RARITY_ORDER) {
      if (Boolean(safeCurrent?.[tab]?.[rarity]) !== Boolean(safeNext?.[tab]?.[rarity])) {
        return false;
      }
    }
  }
  return true;
}

const LANGUAGE_THEME_GROUPS = [
  {
    id: 'start',
    label: 'Comeco recomendado',
    desc: 'Base para iniciantes, logica e fundamentos.',
    languages: [
      'zero_to_code',
      'logic_prog',
      'fundamentos_programacao',
      'fundamentos_computacao',
      'historia_computacao',
      'math'
    ]
  },
  {
    id: 'web',
    label: 'Desenvolvimento Web',
    desc: 'Trilhas para criar interfaces e apps na web.',
    languages: ['javascript', 'html_css', 'sql']
  },
  {
    id: 'backend',
    label: 'Linguagens de Programacao',
    desc: 'Aprofunde em linguagens usadas no mercado.',
    languages: ['python', 'java', 'c']
  }
];

const QUEUE_DEBUG_LOG_MAX_ENTRIES = 1000;
const queueDebugLogBuffer = [];

function appendQueueDebugLogLine(line = '') {
  const safeLine = String(line || '').trim();
  if (!safeLine) return;
  queueDebugLogBuffer.push(safeLine);
  if (queueDebugLogBuffer.length > QUEUE_DEBUG_LOG_MAX_ENTRIES) {
    queueDebugLogBuffer.splice(0, queueDebugLogBuffer.length - QUEUE_DEBUG_LOG_MAX_ENTRIES);
  }
  try {
    if (typeof window !== 'undefined') {
      window.__CODEQUIZ_QUEUE_DEBUG_LOGS = [...queueDebugLogBuffer];
    }
  } catch {
    // ignore debug mirror failures
  }
}

function withTimeout(promise, timeoutMs, label = 'operation') {
  const baseTimeoutMs = Math.max(1000, Number(timeoutMs || 0));
  const isMobile = isLikelyMobileWeb();
  let timeoutMultiplier = 1;
  if (isMobile) {
    if (baseTimeoutMs <= 1200) timeoutMultiplier = 3;
    else if (baseTimeoutMs <= 2200) timeoutMultiplier = 2.4;
    else if (baseTimeoutMs <= 5000) timeoutMultiplier = 2;
    else timeoutMultiplier = 1.5;
  }
  const safeTimeoutMs = Math.max(1000, Math.min(45000, Math.round(baseTimeoutMs * timeoutMultiplier)));
  const safeLabel = String(label || 'operation').trim() || 'operation';
  let timerId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const timeoutError = new Error(`timeout:${safeLabel}`);
      timeoutError.code = 'app/timeout';
      timeoutError.label = safeLabel;
      timeoutError.timeout_ms = safeTimeoutMs;
      if (isMobile) {
        appendQueueDebugLogLine(
          `[MOBILE_TIMEOUT ${new Date().toISOString()}] ${safeLabel} | timeoutMs=${safeTimeoutMs}`
        );
        console.warn('[MOBILE_TIMEOUT]', {
          label: safeLabel,
          timeoutMs: safeTimeoutMs
        });
      }
      reject(timeoutError);
    }, safeTimeoutMs);
  });

  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
    if (timerId) clearTimeout(timerId);
  });
}

function queueFlowLog(step, meta = {}) {
  try {
    const safeStep = String(step || '').trim() || 'unknown_step';
    const safeMeta = meta && typeof meta === 'object' ? meta : {};
    const stamp = new Date().toISOString();
    const STEP_ALIAS = {
      'join_queue:start': 'join:start',
      'join_queue:upsert_success': 'join:ok',
      'join_queue:cancelled_after_upsert': 'join:cancelled',
      'join_queue:error': 'join:err',
      'cancel_queue:start': 'cancel:start',
      'cancel_queue:override_busy': 'cancel:override',
      'cancel_queue:done': 'cancel:ok',
      'resume_queue_after_refused:start': 'resume:start',
      'resume_queue_after_refused:success': 'resume:ok',
      'resume_queue_after_refused:error': 'resume:err',
      'attach_match:start': 'attach:start',
      'attach_match:done': 'attach:ok',
      'matchmaking_tick:start': 'mm:start',
      'matchmaking_tick:open_match_found': 'mm:open_match',
      'matchmaking_tick:open_match_ignored_old_session': 'mm:open_old_session',
      'matchmaking_tick:open_match_before_min_window': 'mm:open_before_15s',
      'matchmaking_tick:closed_stale_pending_accept': 'mm:close_stale_pending',
      'matchmaking_tick:queue_missing_or_not_waiting': 'mm:queue_missing',
      'matchmaking_tick:no_bot_match_at': 'mm:wait_bot_time',
      'matchmaking_tick:human_match_created': 'mm:human_created',
      'matchmaking_tick:no_bot_candidates': 'mm:no_bot',
      'matchmaking_tick:bot_lock_failed': 'mm:lock_fail',
      'matchmaking_tick:bot_lock_acquired': 'mm:lock_ok',
      'matchmaking_tick:context_fetch_start': 'mm:ctx_start',
      'matchmaking_tick:context_fetch_done': 'mm:ctx_done',
      'matchmaking_tick:my_open_match_reused': 'mm:reuse_my_match',
      'matchmaking_tick:bot_open_match_busy': 'mm:bot_busy',
      'matchmaking_tick:queue_recovered_from_local_snapshot': 'mm:queue_local_ok',
      'matchmaking_tick:queue_recreated_after_lock': 'mm:queue_recreated',
      'matchmaking_tick:queue_fetch_missing_after_lock': 'mm:queue_missing_after_lock',
      'matchmaking_tick:my_queue_not_waiting_after_lock': 'mm:queue_not_waiting',
      'matchmaking_tick:no_questions_for_bot_match': 'mm:no_questions',
	      'matchmaking_tick:bot_match_create_failed': 'mm:bot_create_fail',
	      'matchmaking_tick:bot_create_blocked_before_min_window': 'mm:bot_blocked_15s',
	      'matchmaking_tick:bot_busy_mark_failed': 'mm:bot_busy_mark_fail',
      'matchmaking_tick:bot_busy_mark_failed_non_blocking': 'mm:bot_busy_mark_fail',
      'matchmaking_tick:bot_prepared': 'mm:prepared',
      'matchmaking_tick:bot_match_created': 'mm:bot_created',
      'matchmaking_tick:error': 'mm:error',
      'runtime_preload:start': 'pre:start',
      'runtime_preload:done': 'pre:ok',
      'queue_action_busy:watchdog_reset': 'ui:queue_busy_reset',
      'match_accept_busy:watchdog_reset': 'ui:accept_busy_reset',
      'progress_validator:local_cache_missing_remote_available': 'sync:local_missing',
      'progress_sync:blocked_rollback_guard': 'sync:block',
      'progress_recovery:restored_remote': 'sync:recover'
    };
    const KEY_ALIAS = {
      userId: 'u',
      botId: 'b',
      matchId: 'm',
      status: 'st',
      currentStatus: 'cst',
      queueStatus: 'qst',
      difficulty: 'dif',
      elapsedMs: 'ms',
      queue_elapsed_seconds: 'qsec',
      sla_in_window_15_27s: 'sla',
      screen: 'scr',
      message: 'msg'
    };
    const pickKeys = [
      'userId', 'botId', 'matchId', 'status', 'currentStatus', 'queueStatus',
      'difficulty', 'elapsedMs', 'queue_elapsed_seconds', 'sla_in_window_15_27s',
      'screen', 'message'
    ];
    const shortStep = STEP_ALIAS[safeStep] || safeStep;
    const parts = [];
    pickKeys.forEach((key) => {
      if (!(key in safeMeta)) return;
      const label = KEY_ALIAS[key] || key;
      const value = safeMeta[key];
      if (value === null || typeof value === 'undefined') return;
      let rendered = '';
      if (typeof value === 'boolean') rendered = value ? '1' : '0';
      else if (typeof value === 'number') rendered = Number.isFinite(value) ? String(value) : 'nan';
      else if (typeof value === 'string') rendered = value.length > 28 ? `${value.slice(0, 28)}...` : value;
      else rendered = '[obj]';
      if (!rendered) return;
      parts.push(`${label}=${rendered}`);
    });
    const suffix = parts.length ? ` | ${parts.join(' ')}` : '';
    const line = `[QF ${stamp}] ${shortStep}${suffix}`;
    appendQueueDebugLogLine(line);
    console.log(line);
  } catch {
    // ignore logging failures
  }
}

const MENU_MUSIC_TRACKS = [
  {
    id: 'sunset_port',
    name: 'Sunset Port',
    tempoMs: 1240,
    notes: [
      [261.63, 329.63, 392.0, 523.25],
      [246.94, 311.13, 392.0, 493.88],
      [220.0, 293.66, 369.99, 440.0],
      [246.94, 329.63, 392.0, 493.88],
      [293.66, 369.99, 440.0, 587.33],
      [261.63, 349.23, 415.3, 523.25],
      [233.08, 311.13, 392.0, 466.16],
      [246.94, 329.63, 392.0, 493.88]
    ]
  },
  {
    id: 'pixel_garden',
    name: 'Pixel Garden',
    tempoMs: 1120,
    notes: [
      [293.66, 369.99, 440.0, 587.33],
      [329.63, 415.3, 493.88, 659.25],
      [349.23, 440.0, 523.25, 698.46],
      [392.0, 493.88, 587.33, 783.99],
      [349.23, 440.0, 523.25, 698.46],
      [329.63, 415.3, 493.88, 659.25],
      [293.66, 369.99, 440.0, 587.33],
      [261.63, 329.63, 392.0, 523.25]
    ]
  }
];

const BATTLE_MUSIC_TRACKS = [
  {
    id: 'mode7_rush',
    name: 'Mode7 Rush',
    tempoMs: 360,
    notes: [
      174.61, 207.65, 233.08, 261.63,
      233.08, 207.65, 196.0, 233.08,
      261.63, 293.66, 261.63, 233.08,
      220.0, 196.0, 174.61, 164.81
    ]
  },
  {
    id: 'iron_dungeon',
    name: 'Iron Dungeon',
    tempoMs: 392,
    notes: [
      146.83, 146.83, 174.61, 146.83,
      196.0, 174.61, 164.81, 130.81,
      146.83, 164.81, 196.0, 220.0,
      196.0, 174.61, 164.81, 146.83
    ]
  }
];

function normalizeAudioSettings(raw) {
  const next = raw && typeof raw === 'object' ? raw : {};
  return {
    musicEnabled: next.musicEnabled !== false,
    musicVolume: Math.max(0, Math.min(1, Number(next.musicVolume ?? AUDIO_DEFAULTS.musicVolume))),
    sfxEnabled: next.sfxEnabled !== false,
    sfxVolume: Math.max(0, Math.min(1, Number(next.sfxVolume ?? AUDIO_DEFAULTS.sfxVolume)))
  };
}

function hasMeaningfulProgress(rawProgress) {
  const progress = normalizeProgress(rawProgress);
  const defaultCoins = Math.max(0, Number(defaultProgress().coins || 0));
  if (Math.max(0, Number(getProgressTotalXp(progress) || 0)) > 0) return true;
  if (Math.max(0, Number(progress.bestStreak || 0)) > 0) return true;
  if (Math.max(0, Number(progress.totalCorrect || 0)) > 0) return true;
  if (Math.max(0, Number(progress.totalAnswered || 0)) > 0) return true;
  if (Math.max(0, Number(progress.quizzes || 0)) > 0) return true;
  if (Math.max(0, Number(progress.rankingPoints || 0)) > 0) return true;
  if (Math.max(0, Number(progress.pvpPoints || 0)) > 0) return true;
  if (Math.max(0, Number(progress.pvpBattles || 0)) > 0) return true;
  if (Object.keys(progress.topicProgress || {}).length > 0) return true;
  if (Object.keys(progress.quizBestScores || {}).length > 0) return true;
  if (Object.keys(progress.quizBestStars || {}).length > 0) return true;
  if (Object.keys(progress.quizRewarded || {}).length > 0) return true;
  if (Array.isArray(progress.achievements) && progress.achievements.length > 0) return true;
  if (Math.max(0, Number(progress.coins || 0)) !== defaultCoins) return true;
  return false;
}

function buildProgressSnapshot(rawProgress) {
  const progress = normalizeProgress(rawProgress);
  const meaningful = hasMeaningfulProgress(progress);
  const totalXp = Math.max(0, Number(getProgressTotalXp(progress) || 0));
  const updatedAtMs = Math.max(0, Number(progress.updatedAt || 0));
  const defaultCoins = Math.max(0, Number(defaultProgress().coins || 0));
  const coinsSignal = Math.abs(
    Math.max(0, Number(progress.coins || 0)) - defaultCoins
  );
  const signalScore = (
    totalXp
    + Math.max(0, Number(progress.pvpPoints || 0)) * 20
    + Math.max(0, Number(progress.pvpBattles || 0)) * 10
    + Math.max(0, Number(progress.rankingPoints || 0))
    + Math.max(0, Number(progress.totalCorrect || 0))
    + coinsSignal
  );
  return {
    meaningful,
    totalXp,
    updatedAtMs,
    signalScore
  };
}

function buildStatsFromLegacyProgress(rawProgress, fallbackCoins = 0) {
  const progress = normalizeProgress(rawProgress);
  const pvpBattles = Math.max(0, Math.trunc(Number(progress.pvpBattles || 0)));
  const pvpWins = Math.min(pvpBattles, Math.max(0, Math.trunc(Number(progress.pvpWins || 0))));

  return {
    total_xp: Math.max(0, Math.trunc(Number(getProgressTotalXp(progress) || 0))),
    level: Math.max(1, Math.trunc(Number(progress.level || 1))),
    ranking_points: Math.max(0, Math.trunc(Number(progress.rankingPoints || 0))),
    pvp_points: Math.max(0, Math.trunc(Number(progress.pvpPoints || 0))),
    coins: Math.max(0, Math.trunc(Number(fallbackCoins || 0))),
    pvp_battles: pvpBattles,
    pvp_wins: pvpWins,
    pvp_losses: Math.max(0, pvpBattles - pvpWins),
    best_streak: Math.max(0, Math.trunc(Number(progress.bestStreak || 0))),
    total_correct: Math.max(0, Math.trunc(Number(progress.totalCorrect || 0))),
    total_answered: Math.max(0, Math.trunc(Number(progress.totalAnswered || 0))),
    quizzes_completed: Math.max(0, Math.trunc(Number(progress.quizzes || 0))),
    topic_progress: progress.topicProgress && typeof progress.topicProgress === 'object'
      ? progress.topicProgress
      : {},
    quiz_best_scores: progress.quizBestScores && typeof progress.quizBestScores === 'object'
      ? progress.quizBestScores
      : {},
    quiz_best_stars: progress.quizBestStars && typeof progress.quizBestStars === 'object'
      ? progress.quizBestStars
      : {},
    achievement_ids: Array.isArray(progress.achievements) ? progress.achievements : [],
    quiz_rewarded: progress.quizRewarded && typeof progress.quizRewarded === 'object'
      ? progress.quizRewarded
      : {},
    pvp_processed_matches: progress.pvpProcessedMatches && typeof progress.pvpProcessedMatches === 'object'
      ? progress.pvpProcessedMatches
      : {},
    progress_updated_at_ms: Math.max(0, Number(progress.updatedAt || 0))
  };
}

export default function CodeQuizApp() {
  const [screen, setScreen] = useState('login');
  const [booting, setBooting] = useState(true);
  const [toast, setToast] = useState('');

  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [googleSignInBusy, setGoogleSignInBusy] = useState(false);
  const [authTransition, setAuthTransition] = useState({
    visible: false,
    title: '',
    subtitle: ''
  });
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState({ nickname: '', full_name: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [audioSettings, setAudioSettings] = useState(AUDIO_DEFAULTS);
  const [musicMode, setMusicMode] = useState('menu');
  const [menuTrackIndex, setMenuTrackIndex] = useState(0);
  const [battleTrackIndex, setBattleTrackIndex] = useState(0);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [adminMatches, setAdminMatches] = useState([]);
  const [adminMatchesLoading, setAdminMatchesLoading] = useState(false);
  const [adminMatchesUpdatedAtMs, setAdminMatchesUpdatedAtMs] = useState(0);
  const [adminBotDaemonBusy, setAdminBotDaemonBusy] = useState(false);
  const [botArenaDaemonControl, setBotArenaDaemonControlState] = useState({
    arena_enabled: true,
    pvp_enabled: true,
    quiz_enabled: true,
    updated_at: '',
    updated_by: ''
  });
  const [botArenaDaemonStatus, setBotArenaDaemonStatusState] = useState({
    owner_id: '',
    status: 'unknown',
    last_state: '',
    ticks: 0,
    created_matches: 0,
    finalized_matches: 0,
    lock_ok: false,
    run_started_at: '',
    run_started_at_ms: 0,
    run_finished_at: '',
    run_finished_at_ms: 0,
    updated_at: '',
    updated_at_ms: 0
  });
  const [botArenaQuizState, setBotArenaQuizState] = useState({
    status: 'idle',
    batch_id: '',
    assignments: [],
    started_at_ms: 0,
    ends_at_ms: 0,
    cursor_difficulty: 'easy',
    cursor_index: 0,
    cursor_cycle_no: 0,
    updated_at: '',
    last_result: null
  });
  const [updateState, setUpdateState] = useState({
    available: false,
    latestSha: '',
    applying: false,
    reason: ''
  });
  const [buildBadgeValue, setBuildBadgeValue] = useState('desconhecido');
  const [cookieConsent, setCookieConsent] = useState('pending');

  const [progress, setProgress] = useState(defaultProgress());
  const [progressReady, setProgressReady] = useState(false);
  const [progressSyncEnabled, setProgressSyncEnabled] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [quizState, setQuizState] = useState(null);
  const [quizMenuOpen, setQuizMenuOpen] = useState(false);
  const [quizClockMs, setQuizClockMs] = useState(Date.now());
  const [feedbackState, setFeedbackState] = useState(null);
  const [resultState, setResultState] = useState(null);
  const [rewardFxParticles, setRewardFxParticles] = useState([]);
  const [rewardCollecting, setRewardCollecting] = useState(false);

  const [rankingsMode, setRankingsMode] = useState('pve');
  const [rankingsRows, setRankingsRows] = useState([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);

  const [quizRankingRows, setQuizRankingRows] = useState([]);
  const [quizRankingLoading, setQuizRankingLoading] = useState(false);

  const [shopData, setShopData] = useState(defaultShopData());
  const [shopReady, setShopReady] = useState(false);
  const [shopTab, setShopTab] = useState('frame');
  const [shopCategoryOpen, setShopCategoryOpen] = useState(() => buildDefaultShopCategoryState());
  const [shopItemPreview, setShopItemPreview] = useState(null);

  const [pvpConfig, setPvpConfig] = useState(buildFallbackPvpConfig());
  const [pvpState, setPvpState] = useState({
    status: 'idle',
    queueJoinedAtMs: 0,
    queueBotMatchAtMs: 0,
    queueResumeMode: '',
    matchId: '',
    match: null,
    answers: [],
    roundStartMs: 0,
    submitted: false,
    selectedIndex: null,
    error: '',
    result: null
  });
  const [pvpCompensation, setPvpCompensation] = useState(null);
  const [pvpResultTransitionMode, setPvpResultTransitionMode] = useState('');
  const [pvpResultReward, setPvpResultReward] = useState(null);
  const [pvpRewardCollecting, setPvpRewardCollecting] = useState(false);
  const [queueActionBusy, setQueueActionBusy] = useState(false);
  const [queueActionPhase, setQueueActionPhase] = useState('');
  const [queueActionHint, setQueueActionHint] = useState('');
  const [browserOnline, setBrowserOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  });
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [realtimeConnectionSeen, setRealtimeConnectionSeen] = useState(false);
  const [arenaOnlineDisplay, setArenaOnlineDisplay] = useState(0);
  const [pvpEmojiFx, setPvpEmojiFx] = useState([]);
  const [pvpBattleEmojis, setPvpBattleEmojis] = useState(() => normalizeBattleEmojis(DEFAULT_BATTLE_EMOJIS));
  const [pvpEmojiPickerOpen, setPvpEmojiPickerOpen] = useState(false);
  const [pvpEmojiDraft, setPvpEmojiDraft] = useState(() => normalizeEmojiDraftSlots(DEFAULT_BATTLE_EMOJIS));
  const [pvpEmojiDraftWarning, setPvpEmojiDraftWarning] = useState('');
  const [pvpEmojiSlotFocus, setPvpEmojiSlotFocus] = useState(0);
  const [latestPvpEmojiEvent, setLatestPvpEmojiEvent] = useState(null);
  const [pvpEmojiCooldownUntilMs, setPvpEmojiCooldownUntilMs] = useState(0);
  const [quizQuestionHasOverflow, setQuizQuestionHasOverflow] = useState(false);
  const [pvpQuestionHasOverflow, setPvpQuestionHasOverflow] = useState(false);
  const [pvpClockMs, setPvpClockMs] = useState(Date.now());
  const [matchAcceptBusy, setMatchAcceptBusy] = useState(false);
  const [arenaMetrics, setArenaMetrics] = useState({
    online: 0,
    queue: 0
  });

  const matchmakingIntervalRef = useRef(null);
  const attachingMatchRef = useRef('');
  const finalizeRoundBusyRef = useRef(false);
  const handledMatchIdsRef = useRef(new Set());
  const pvpStateRef = useRef(pvpState);
  const pvpRoundActivatedAtRef = useRef({ key: '', ms: 0 });
  const pvpRoundRemainingGuardRef = useRef({ key: '', remainingMs: 0 });
  const pvpForcedFinalizeRef = useRef({ key: '', lastAtMs: 0 });
  const quizQuestionScrollRef = useRef(null);
  const pvpQuestionScrollRef = useRef(null);
  const pvpRealtimeMatchUpdateAtRef = useRef(0);
  const pvpRealtimeAnswersUpdateAtRef = useRef(0);
  const pvpSeenEmojiEventIdsRef = useRef(new Set());
  const pvpSeenEmojiEventOrderRef = useRef([]);
  const pvpEmojiSendQueueRef = useRef([]);
  const pvpEmojiSendBusyRef = useRef(false);
  const pvpEmojiSendCountRef = useRef(0);
  const pvpEmojiSpamWindowRef = useRef([]);
  const pvpEmojiCooldownUntilRef = useRef(0);
  const authBootstrapDoneRef = useRef(false);
  const audioSettingsRef = useRef(audioSettings);
  const menuTrackIndexRef = useRef(menuTrackIndex);
  const battleTrackIndexRef = useRef(battleTrackIndex);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const musicGainRef = useRef(null);
  const sfxGainRef = useRef(null);
  const musicLoopTimerRef = useRef(null);
  const musicTransitionTimerRef = useRef(null);
  const musicStepRef = useRef(0);
  const musicModeRef = useRef('menu');
  const audioUnlockedRef = useRef(false);
  const rewardFxTimeoutRef = useRef(null);
  const rewardSfxTimersRef = useRef([]);
  const botAnswerTimerRef = useRef(null);
  const botAnswerRoundKeyRef = useRef('');
  const pvpRoundResultFeedbackKeyRef = useRef('');
  const pvpRoundResultFeedbackTimerRef = useRef(null);
  const pvpResultAudioTimersRef = useRef([]);
  const pvpResultAudioKeyRef = useRef('');
  const pvpTimerSfxRef = useRef({
    roundKey: '',
    warningPlayed: false,
    criticalPlayed: false,
    timeoutPlayed: false,
    tickSecond: -1
  });
  const pvpRoundPhaseSfxKeyRef = useRef('');
  const pvpRoundResultSfxKeyRef = useRef('');
  const botReactionTimersRef = useRef([]);
  const botReactionUserEmojiEventRef = useRef('');
  const botReactionRoundResultRef = useRef('');
  const botReactionFirstAnswerRef = useRef('');
  const swRegRef = useRef(null);
  const waitingWorkerRef = useRef(null);
  const updateCheckBusyRef = useRef(false);
  const runningBuildShaRef = useRef('');
  const latestBuildShaRef = useRef('');
  const mobileAutoUpdateKeyRef = useRef('');
  const mobileSwCleanupDoneRef = useRef(false);
  const googleSignInRef = useRef(false);
  const pvpQueueResumeRef = useRef({
    available: false,
    joinedAtMs: 0,
    botRemainingMs: 0,
    elapsedAtPauseMs: 0
  });
  const queueBotExclusionRef = useRef({
    botId: '',
    untilMs: 0
  });
  const queueSessionStartMsRef = useRef(0);
  const queueSessionIdRef = useRef('');
  const queueCancelRequestedRef = useRef(false);
  const preparedBotRef = useRef({
    userId: '',
    category: '',
    botId: '',
    snapshot: null,
    config: null,
    preparedAtMs: 0
  });
  const preparedBotInFlightRef = useRef(null);
  const preparedBotKickAtRef = useRef(0);
  const queueFlowLogThrottleRef = useRef({});
  const queueActionBusyStartedAtRef = useRef(0);
  const matchAcceptBusyStartedAtRef = useRef(0);
  const preloadRuntimeRef = useRef({
    userId: '',
    lastAtMs: 0,
    challengeLastAtMs: 0
  });
  const progressRecoveryBusyRef = useRef(false);
  const progressSyncGuardRef = useRef({
    remoteHasMeaningful: false,
    remoteUpdatedAtMs: 0,
    remoteSignalScore: 0
  });
  const activeAuthUser = authUser || firebaseAuth.currentUser || null;

  const queueFlowLogThrottled = (key, intervalMs, step, meta = {}) => {
    const safeKey = String(key || '').trim();
    const nowMs = Date.now();
    const safeInterval = Math.max(500, Number(intervalMs || 2000));
    const lastMs = Math.max(0, Number(queueFlowLogThrottleRef.current?.[safeKey] || 0));
    if (safeKey && nowMs - lastMs < safeInterval) return;
    if (safeKey) {
      queueFlowLogThrottleRef.current = {
        ...(queueFlowLogThrottleRef.current || {}),
        [safeKey]: nowMs
      };
    }
    queueFlowLog(step, meta);
  };

  const clearPvpQueueResumeSnapshot = () => {
    pvpQueueResumeRef.current = {
      available: false,
      joinedAtMs: 0,
      botRemainingMs: 0,
      elapsedAtPauseMs: 0
    };
  };
  const setQueueBotExclusion = (botId = '', ttlMs = 45000) => {
    const safeBotId = String(botId || '').trim();
    if (!safeBotId) {
      queueBotExclusionRef.current = { botId: '', untilMs: 0 };
      return;
    }
    const safeTtlMs = Math.max(1000, Number(ttlMs || 45000));
    queueBotExclusionRef.current = {
      botId: safeBotId,
      untilMs: Date.now() + safeTtlMs
    };
  };
  const getQueueBotExclusionId = () => {
    const entry = queueBotExclusionRef.current && typeof queueBotExclusionRef.current === 'object'
      ? queueBotExclusionRef.current
      : { botId: '', untilMs: 0 };
    const safeBotId = String(entry.botId || '').trim();
    const safeUntilMs = Math.max(0, Number(entry.untilMs || 0));
    if (!safeBotId || safeUntilMs <= Date.now()) {
      if (safeBotId) {
        queueBotExclusionRef.current = { botId: '', untilMs: 0 };
      }
      return '';
    }
    return safeBotId;
  };
  const clearPreparedBot = () => {
    preparedBotRef.current = {
      userId: '',
      category: '',
      botId: '',
      snapshot: null,
      config: null,
      preparedAtMs: 0
    };
    preparedBotInFlightRef.current = null;
    preparedBotKickAtRef.current = 0;
  };
	  const prepareBotForQueue = async (targetDifficulty, reason = 'queue_join', force = false) => {
	    const currentUserId = String(authUser?.uid || '').trim();
	    if (!currentUserId) return null;
	    const safeDifficulty = normalizeDifficulty(targetDifficulty || 'easy');
      const excludedBotId = getQueueBotExclusionId();
	    const nowMs = Date.now();
	    const current = preparedBotRef.current && typeof preparedBotRef.current === 'object'
	      ? preparedBotRef.current
	      : {};
    if (
      !force
      &&
      current.userId === currentUserId
      && current.category === safeDifficulty
      && isSystemBotUserId(current.botId)
      && (nowMs - Math.max(0, Number(current.preparedAtMs || 0))) < 12000
    ) {
      return current;
    }
    const inFlight = preparedBotInFlightRef.current;
    if (
      !force
      && inFlight
      && typeof inFlight === 'object'
      && inFlight.userId === currentUserId
      && inFlight.category === safeDifficulty
      && (nowMs - Math.max(0, Number(inFlight.startedAtMs || 0))) < 4000
      && inFlight.promise
    ) {
      return inFlight.promise;
    }

		    const promise = (async () => {
		      const startedAtMs = Date.now();
		      const pickedBot = await withTimeout(
		        getNextBotForUserMatch(safeDifficulty, {
	              excludeBotIds: excludedBotId ? [excludedBotId] : [],
	              waitForEnsure: false,
	              preferLocal: true
	            }).catch(() => null),
		        2200,
		        'prepare_pick_bot'
		      ).catch(() => null);
		      const preferredBotId = String(
		        pickedBot?.bot_id
		        || pickedBot?.profile?.id
		        || ''
		      ).trim();
		      let safeBotId = '';
		      if (isSystemBotUserId(preferredBotId) && preferredBotId !== excludedBotId) {
		        safeBotId = preferredBotId;
		      } else if (
		        String(current.userId || '').trim() === currentUserId
		        && normalizeDifficulty(current.category || 'easy') === safeDifficulty
		        && isSystemBotUserId(current.botId)
            && String(current.botId || '').trim() !== excludedBotId
		      ) {
		        safeBotId = String(current.botId || '').trim();
		      }
		      if (!safeBotId) return null;

      const [snapshot, config] = await Promise.all([
	        withTimeout(
	          getSystemBotSnapshot(safeBotId, {
	            preferLocal: true
	          }).catch(() => null),
	          900,
	          'prepare_bot_snapshot'
	        ).catch(() => (
	          String(current.botId || '').trim() === safeBotId ? (current.snapshot || null) : null
	        )),
	        withTimeout(
	          getPvpBotConfig(safeBotId, {
	            preferLocal: true
	          }).catch(() => BOT_CONFIG_DEFAULT),
	          900,
	          'prepare_bot_config'
	        ).catch(() => (
	          String(current.botId || '').trim() === safeBotId ? (current.config || BOT_CONFIG_DEFAULT) : BOT_CONFIG_DEFAULT
        ))
      ]);

      const prepared = {
        userId: currentUserId,
        category: safeDifficulty,
        botId: safeBotId,
        snapshot: snapshot || null,
        config: config || BOT_CONFIG_DEFAULT,
        preparedAtMs: Date.now()
      };
      preparedBotRef.current = prepared;
      queueFlowLog('matchmaking_tick:bot_prepared', {
        userId: currentUserId,
        botId: safeBotId,
        difficulty: safeDifficulty,
        reason,
        elapsedMs: Math.max(0, Date.now() - startedAtMs)
      });
      return prepared;
    })();

    preparedBotInFlightRef.current = {
      userId: currentUserId,
      category: safeDifficulty,
      startedAtMs: nowMs,
      promise
    };
    try {
      return await promise;
    } finally {
      if (preparedBotInFlightRef.current?.promise === promise) {
        preparedBotInFlightRef.current = null;
      }
    }
  };
  const getQueueSessionStartMs = () => {
    return Math.max(
      0,
      Number(
        queueSessionStartMsRef.current
        || pvpStateRef.current?.queueJoinedAtMs
        || 0
      )
    );
  };

  useEffect(() => {
    pvpStateRef.current = pvpState;
  }, [pvpState]);

  useEffect(() => {
    pvpEmojiCooldownUntilRef.current = Math.max(0, Number(pvpEmojiCooldownUntilMs || 0));
  }, [pvpEmojiCooldownUntilMs]);

  useEffect(() => {
    return () => {
      clearPvpRoundResultFeedbackTimer(true);
    };
  }, []);

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;
    let cancelled = false;

    const runWarmup = (force = false, reason = 'queue_keepalive') => {
      if (cancelled) return;
      const safeDifficulty = getPvpQueueDifficultyFromProgress(progress);
      prepareBotForQueue(safeDifficulty, reason, force).catch(() => null);
    };

    runWarmup(true, 'queue_effect_start');
    const timer = setInterval(() => {
      runWarmup(false, 'queue_effect_keepalive');
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, authUser?.uid, progress?.pvpPoints]);

  useEffect(() => {
    const matchId = String(pvpState.matchId || pvpState.match?.id || '').trim();
    if (!matchId) {
      setLatestPvpEmojiEvent(null);
      setPvpEmojiCooldownUntilMs(0);
      pvpSeenEmojiEventIdsRef.current = new Set();
      pvpSeenEmojiEventOrderRef.current = [];
      pvpEmojiSendQueueRef.current = [];
      pvpEmojiSendBusyRef.current = false;
      pvpEmojiSendCountRef.current = 0;
      pvpEmojiSpamWindowRef.current = [];
      pvpEmojiCooldownUntilRef.current = 0;
      pvpRealtimeMatchUpdateAtRef.current = 0;
      pvpRealtimeAnswersUpdateAtRef.current = 0;
      return;
    }
    setLatestPvpEmojiEvent(null);
    setPvpEmojiCooldownUntilMs(0);
    pvpSeenEmojiEventIdsRef.current = new Set();
    pvpSeenEmojiEventOrderRef.current = [];
    pvpEmojiSendQueueRef.current = [];
    pvpEmojiSendBusyRef.current = false;
    pvpEmojiSendCountRef.current = 0;
    pvpEmojiSpamWindowRef.current = [];
    pvpEmojiCooldownUntilRef.current = 0;
    pvpRealtimeMatchUpdateAtRef.current = Date.now();
    pvpRealtimeAnswersUpdateAtRef.current = Date.now();
  }, [pvpState.matchId, pvpState.match?.id]);

  useEffect(() => {
    audioSettingsRef.current = audioSettings;
  }, [audioSettings]);

  useEffect(() => {
    menuTrackIndexRef.current = menuTrackIndex;
  }, [menuTrackIndex]);

  useEffect(() => {
    battleTrackIndexRef.current = battleTrackIndex;
  }, [battleTrackIndex]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!queueActionBusy) {
      queueActionBusyStartedAtRef.current = 0;
      if (queueActionPhase) {
        setQueueActionPhase('');
      }
      return;
    }
    if (!queueActionBusyStartedAtRef.current) {
      queueActionBusyStartedAtRef.current = Date.now();
    }
    const slowTimer = setTimeout(() => {
      if (!queueActionBusy) return;
      setQueueActionHint((prev) => (
        prev
        || 'Conexao lenta. Sincronizando fila...'
      ));
    }, 3200);
    const severeTimer = setTimeout(() => {
      if (!queueActionBusy) return;
      setQueueActionHint('Conexao instavel. Toque novamente para tentar cancelar.');
    }, 7000);
    const watchdogTimer = setTimeout(() => {
      if (!queueActionBusy) return;
      const elapsedMs = Math.max(0, Date.now() - Math.max(0, Number(queueActionBusyStartedAtRef.current || 0)));
      queueFlowLog('queue_action_busy:watchdog_reset', {
        userId: authUser?.uid || '',
        status: pvpStateRef.current?.status || '',
        elapsedMs
      });
      setQueueActionBusy(false);
      setQueueActionHint('Conexao instavel. Estado da fila foi desbloqueado.');
    }, UI_ACTION_WATCHDOG_MS);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(severeTimer);
      clearTimeout(watchdogTimer);
    };
  }, [queueActionBusy, authUser?.uid, queueActionPhase]);

  useEffect(() => {
    if (queueActionBusy) return;
    if (!queueActionHint) return;
    const timer = setTimeout(() => {
      setQueueActionHint('');
    }, 4200);
    return () => clearTimeout(timer);
  }, [queueActionBusy, queueActionHint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncBrowserConnection = () => {
      setBrowserOnline(window.navigator?.onLine !== false);
    };
    syncBrowserConnection();
    window.addEventListener('online', syncBrowserConnection);
    window.addEventListener('offline', syncBrowserConnection);
    return () => {
      window.removeEventListener('online', syncBrowserConnection);
      window.removeEventListener('offline', syncBrowserConnection);
    };
  }, []);

  useEffect(() => {
    const connectionRef = ref(firebaseDb, '.info/connected');
    const unsubscribe = onValue(
      connectionRef,
      (snap) => {
        setRealtimeConnectionSeen(true);
        setRealtimeConnected(snap.val() === true);
      },
      () => {
        setRealtimeConnectionSeen(true);
        setRealtimeConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const tick = () => {
      if (cancelled) return;
      const baseOnline = Math.max(1, Number(arenaMetrics.online || 1));
      const variance = Math.max(2, Math.round(baseOnline * 0.14));
      const delta = Math.floor(Math.random() * ((variance * 2) + 1)) - variance;
      setArenaOnlineDisplay(Math.max(1, baseOnline + delta));
      const delayMs = 1400 + Math.floor(Math.random() * 2600);
      timer = setTimeout(tick, delayMs);
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [arenaMetrics.online]);

  useEffect(() => {
    if (!matchAcceptBusy) {
      matchAcceptBusyStartedAtRef.current = 0;
      return;
    }
    if (!matchAcceptBusyStartedAtRef.current) {
      matchAcceptBusyStartedAtRef.current = Date.now();
    }
    const timer = setTimeout(() => {
      if (!matchAcceptBusy) return;
      const elapsedMs = Math.max(0, Date.now() - Math.max(0, Number(matchAcceptBusyStartedAtRef.current || 0)));
      queueFlowLog('match_accept_busy:watchdog_reset', {
        userId: authUser?.uid || '',
        matchId: pvpStateRef.current?.matchId || '',
        elapsedMs
      });
      setMatchAcceptBusy(false);
    }, UI_ACTION_WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [matchAcceptBusy, authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onWindowError = (event) => {
      const message = String(event?.message || event?.error?.message || 'window_error').trim();
      const filename = String(event?.filename || '').trim();
      const line = Math.max(0, Number(event?.lineno || 0));
      const sourceTail = filename ? filename.slice(-80) : 'unknown_source';
      appendQueueDebugLogLine(
        `[ERR ${new Date().toISOString()}] ${message || 'window_error'} | src=${sourceTail}:${line}`
      );
    };

    const onUnhandledRejection = (event) => {
      const reasonRaw = event?.reason;
      const reasonText = typeof reasonRaw === 'string'
        ? reasonRaw
        : (reasonRaw?.message || JSON.stringify(reasonRaw || 'unhandled_rejection'));
      const safeReason = String(reasonText || 'unhandled_rejection').slice(0, 220);
      appendQueueDebugLogLine(
        `[REJ ${new Date().toISOString()}] ${safeReason}`
      );
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setAudioSettings(normalizeAudioSettings(parsed));
    } catch {
      // ignore invalid local storage payload
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioSettings));
    } catch {
      // ignore local storage write failure
    }
  }, [audioSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${SHOP_UI_STATE_STORAGE_PREFIX}_${uid}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        setShopTab('frame');
        setShopCategoryOpen(buildDefaultShopCategoryState());
        return;
      }
      const parsed = JSON.parse(raw);
      setShopTab(normalizeShopTab(parsed?.tab));
      setShopCategoryOpen(normalizeShopCategoryOpenState(parsed?.categoryOpen));
    } catch {
      setShopTab('frame');
      setShopCategoryOpen(buildDefaultShopCategoryState());
    }
  }, [authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${SHOP_UI_STATE_STORAGE_PREFIX}_${uid}`;
    const payload = {
      tab: normalizeShopTab(shopTab),
      categoryOpen: normalizeShopCategoryOpenState(shopCategoryOpen),
      updatedAt: nowIso()
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // ignore storage write failure
    }
  }, [shopTab, shopCategoryOpen, authUser?.uid]);

  useEffect(() => {
    const normalizedTab = normalizeShopTab(shopTab);
    const normalizedState = normalizeShopCategoryOpenState(shopCategoryOpen);
    if (normalizedTab !== shopTab) {
      setShopTab(normalizedTab);
      return;
    }
    if (!isShopCategoryOpenStateEqual(shopCategoryOpen, normalizedState)) {
      setShopCategoryOpen(normalizedState);
    }
  }, [shopTab, shopCategoryOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    let changed = false;
    ['swv', 'v', 'app_update'].forEach((param) => {
      if (!url.searchParams.has(param)) return;
      url.searchParams.delete(param);
      changed = true;
    });
    if (!changed) return;
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next || '/');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let pendingRedirect = false;
    try {
      pendingRedirect = String(window.localStorage.getItem(AUTH_REDIRECT_PENDING_KEY) || '').trim() === '1';
    } catch {
      pendingRedirect = false;
    }
    if (!pendingRedirect) return;

    let cancelled = false;
    googleSignInRef.current = true;
    setGoogleSignInBusy(true);
    setAuthTransition({
      visible: true,
      title: 'Concluindo login com Google',
      subtitle: 'Validando retorno do redirecionamento...'
    });

    (async () => {
      try {
        await withTimeout(
          getRedirectResult(firebaseAuth),
          AUTH_REDIRECT_RESULT_TIMEOUT_MS,
          'getRedirectResult'
        );
      } catch (error) {
        const code = String(error?.code || '').trim().toLowerCase();
        if (code && code !== 'auth/no-auth-event' && code !== 'app/timeout') {
          console.error('redirect sign in result failed:', error);
        }
      } finally {
        try {
          window.localStorage.removeItem(AUTH_REDIRECT_PENDING_KEY);
        } catch {
          // ignore storage failures
        }
        if (cancelled) return;
        const hasSession = !!firebaseAuth.currentUser;
        if (!hasSession) {
          googleSignInRef.current = false;
          setGoogleSignInBusy(false);
          setAuthTransition({ visible: false, title: '', subtitle: '' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authUser) return;
    const immediateUser = firebaseAuth.currentUser;
    if (immediateUser) setAuthUser(immediateUser);
  }, [authUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let persisted = '';
    try {
      persisted = String(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || '').trim();
    } catch {
      persisted = '';
    }

    if (persisted === 'accepted' || persisted === 'essential') {
      setCookieConsent(persisted);
      return;
    }

    const fromCookie = readCookieConsentFromDocument();
    if (fromCookie) {
      setCookieConsent(fromCookie);
      try {
        window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, fromCookie);
      } catch {
        // ignore local storage write failure
      }
      return;
    }

    setCookieConsent('pending');
  }, []);

  useEffect(() => {
    const onPress = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest('button')) return;
      playSfx('click');
    };
    document.addEventListener('pointerdown', onPress, true);
    return () => document.removeEventListener('pointerdown', onPress, true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let googleFlowTimer = null;
    let bootstrapGuardTimer = null;

    if (typeof window !== 'undefined') {
      bootstrapGuardTimer = window.setTimeout(() => {
        if (cancelled || authBootstrapDoneRef.current) return;
        authBootstrapDoneRef.current = true;
        setProgressReady(true);
        setShopReady(true);
        setAuthLoading(false);
        setBooting(false);
        if (!firebaseAuth.currentUser) {
          setScreen('login');
          if (googleSignInRef.current) {
            googleSignInRef.current = false;
            setGoogleSignInBusy(false);
            setAuthTransition({ visible: false, title: '', subtitle: '' });
          }
        }
      }, AUTH_BOOTSTRAP_GUARD_MS);
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (cancelled) return;
      const isInitialPass = !authBootstrapDoneRef.current;
      const isGoogleFlow = googleSignInRef.current;

      setAuthUser(user);
      setProgressSyncEnabled(false);
      if (isInitialPass) {
        setProgressReady(false);
        setShopReady(false);
      }

      if (!user) {
        setProfile(null);
        setProgress(defaultProgress());
        setShopData(defaultShopData());
        if (isGoogleFlow) {
          googleSignInRef.current = false;
          setGoogleSignInBusy(false);
          setAuthTransition({ visible: false, title: '', subtitle: '' });
        }
        setScreen('login');
        setProgressReady(true);
        setShopReady(true);
        if (isInitialPass) {
          authBootstrapDoneRef.current = true;
          if (bootstrapGuardTimer && typeof window !== 'undefined') {
            window.clearTimeout(bootstrapGuardTimer);
            bootstrapGuardTimer = null;
          }
          setAuthLoading(false);
          setBooting(false);
        }
        return;
      }

      if (isGoogleFlow) {
        setAuthTransition({
          visible: true,
          title: 'Validando sua conta',
          subtitle: 'Sincronizando perfil e progresso...'
        });
      }

      try {
        const ensured = await withTimeout(ensureUserProfile(user), AUTH_OPERATION_TIMEOUT_MS, 'ensureUserProfile');
        if (cancelled) return;

        setProfile(ensured);
        setProfileDraft({
          nickname: ensured.nickname || 'Jogador',
          full_name: ensured.full_name || ''
        });

        const [stats, remoteShop, legacySnapshot] = await Promise.all([
          withTimeout(getUserStats(user.uid), AUTH_OPERATION_TIMEOUT_MS, 'getUserStats').catch(() => null),
          withTimeout(getUserShop(user.uid), AUTH_OPERATION_TIMEOUT_MS, 'getUserShop').catch(() => null),
          withTimeout(
            getLegacyCloudSnapshot(user.uid),
            AUTH_OPERATION_TIMEOUT_MS,
            'getLegacyCloudSnapshot'
          ).catch(() => null)
        ]);

        if (cancelled) return;

        const remoteProgressBaseline = mergeProgressWithRemoteStats(defaultProgress(), stats || null);
        const remoteSnapshot = buildProgressSnapshot(remoteProgressBaseline);
        progressSyncGuardRef.current = {
          remoteHasMeaningful: remoteSnapshot.meaningful,
          remoteUpdatedAtMs: Math.max(
            remoteSnapshot.updatedAtMs,
            Math.max(0, Number(stats?.progress_updated_at_ms || 0)),
            Math.max(0, Number(stats?.pvp_recalculated_at_ms || 0))
          ),
          remoteSignalScore: remoteSnapshot.signalScore
        };

        const localProgress = loadProgress(user.uid);
        if (!hasMeaningfulProgress(localProgress) && remoteSnapshot.meaningful) {
          queueFlowLog('progress_validator:local_cache_missing_remote_available', {
            userId: user.uid
          });
        }
        const localUpdatedMs = Math.max(0, Number(localProgress?.updatedAt || 0));
        const remoteUpdatedMs = Math.max(0, Number(stats?.progress_updated_at_ms || 0));
        const remotePvpRecalcMs = Math.max(0, Number(stats?.pvp_recalculated_at_ms || 0));
        const shouldOverwriteCloudWithLocal = localUpdatedMs > remoteUpdatedMs && localUpdatedMs > remotePvpRecalcMs;
        let mergedProgress = shouldOverwriteCloudWithLocal
          ? normalizeProgress(localProgress)
          : mergeProgressWithRemoteStats(localProgress, stats);
        const legacyProgress = legacySnapshot?.progress && typeof legacySnapshot.progress === 'object'
          ? normalizeProgress(legacySnapshot.progress)
          : null;
        const shouldMigrateLegacyProgress = (
          legacyProgress
          && hasMeaningfulProgress(legacyProgress)
          && !hasMeaningfulProgress(mergedProgress)
        );
        if (shouldMigrateLegacyProgress) {
          const legacyStats = buildStatsFromLegacyProgress(legacyProgress, mergedProgress.coins);
          mergedProgress = mergeProgressWithRemoteStats(mergedProgress, legacyStats);
        }
        setProgress(mergedProgress);
        try {
          saveProgress(user.uid, mergedProgress);
        } catch {
          // ignore local storage write failures
        }

        const localShop = loadShopData(user.uid);
        const profileShopFallback = buildShopFallbackFromProfile(ensured);
        let mergedShop = mergeShopData(localShop || {}, remoteShop || {});
        mergedShop = mergeShopData(mergedShop, profileShopFallback);
        if (legacySnapshot?.shop && typeof legacySnapshot.shop === 'object') {
          mergedShop = mergeShopData(mergedShop, legacySnapshot.shop);
        }
        mergedShop = saveShopData(user.uid, mergedShop);
        setShopData(mergedShop);

        setProgressSyncEnabled(true);
        setProgressReady(true);
        setShopReady(true);

        withTimeout(saveUserShop(user.uid, mergedShop), AUTH_OPERATION_TIMEOUT_MS, 'saveUserShop')
          .catch((error) => {
            console.error('bootstrap shop sync failed:', error);
          });
        withTimeout(
          upsertStatsFromProgress(user.uid, mergedProgress),
          AUTH_OPERATION_TIMEOUT_MS,
          'upsertStatsFromProgress'
        ).catch((error) => {
          console.error('bootstrap stats sync failed:', error);
        });
      } catch (error) {
        console.error('auth bootstrap failed:', error);

        const recoveredProfile = user?.uid
          ? await withTimeout(
            getUserProfile(user.uid),
            2500,
            'getUserProfileRecovery'
          ).catch(() => null)
          : null;
        const recoveryStats = user?.uid
          ? await withTimeout(
            getUserStats(user.uid).catch(() => null),
            2400,
            'getUserStatsRecovery'
          ).catch(() => null)
          : null;

        if (recoveryStats && typeof recoveryStats === 'object') {
          const remoteProgressBaseline = mergeProgressWithRemoteStats(defaultProgress(), recoveryStats);
          const remoteSnapshot = buildProgressSnapshot(remoteProgressBaseline);
          progressSyncGuardRef.current = {
            remoteHasMeaningful: remoteSnapshot.meaningful,
            remoteUpdatedAtMs: Math.max(
              remoteSnapshot.updatedAtMs,
              Math.max(0, Number(recoveryStats?.progress_updated_at_ms || 0)),
              Math.max(0, Number(recoveryStats?.pvp_recalculated_at_ms || 0))
            ),
            remoteSignalScore: remoteSnapshot.signalScore
          };
        }

        if (recoveredProfile) {
          setProfile(recoveredProfile);
          setProfileDraft({
            nickname: recoveredProfile.nickname || 'Jogador',
            full_name: recoveredProfile.full_name || ''
          });
        } else {
          const code = String(error?.code || '').trim().toLowerCase();
          const label = String(error?.label || '').trim().toLowerCase();
          const message = String(error?.message || '').trim().toLowerCase();
          const isTransient =
            code === 'app/timeout'
            || code.includes('network')
            || label.includes('timeout')
            || message.includes('timeout')
            || message.includes('network');
          if (!isTransient) {
            setToast('Falha ao carregar perfil.');
          }
        }

        const fallbackLocalProgress = user?.uid
          ? normalizeProgress(loadProgress(user.uid))
          : defaultProgress();
        const fallbackLocalShop = user?.uid
          ? loadShopData(user.uid)
          : defaultShopData();
        setProgress(fallbackLocalProgress);
        setShopData(fallbackLocalShop);
        setProgressSyncEnabled(hasMeaningfulProgress(fallbackLocalProgress));
        setProgressReady(true);
        setShopReady(true);
      } finally {
        if (!cancelled) {
          setScreen('home');
          if (googleSignInRef.current) {
            setAuthTransition({
              visible: true,
              title: 'Login concluido',
              subtitle: 'Entrando na sua area...'
            });

            const finishGoogleFlow = () => {
              if (cancelled) return;
              googleSignInRef.current = false;
              setGoogleSignInBusy(false);
              setAuthTransition({ visible: false, title: '', subtitle: '' });
              showToast('Login realizado com sucesso.');
              playSfx('success');
            };

            if (typeof window !== 'undefined') {
              if (googleFlowTimer) window.clearTimeout(googleFlowTimer);
              googleFlowTimer = window.setTimeout(finishGoogleFlow, 280);
            } else {
              finishGoogleFlow();
            }
          }
        }

        if (isInitialPass) {
          authBootstrapDoneRef.current = true;
          if (bootstrapGuardTimer && typeof window !== 'undefined') {
            window.clearTimeout(bootstrapGuardTimer);
            bootstrapGuardTimer = null;
          }
          setAuthLoading(false);
          setBooting(false);
        }
      }
    });

    return () => {
      cancelled = true;
      if (googleFlowTimer && typeof window !== 'undefined') {
        window.clearTimeout(googleFlowTimer);
      }
      if (bootstrapGuardTimer && typeof window !== 'undefined') {
        window.clearTimeout(bootstrapGuardTimer);
      }
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!shopReady || !authUser?.uid) return;
    const timer = setTimeout(() => {
      saveShopData(authUser.uid, shopData);
      saveUserShop(authUser.uid, shopData).catch(() => null);
    }, 400);
    return () => clearTimeout(timer);
  }, [shopData, shopReady, authUser?.uid]);

  useEffect(() => {
    if (!progressReady || !authUser?.uid || !progressSyncEnabled) return;
    const timer = setTimeout(() => {
      const localSnapshot = buildProgressSnapshot(progress);
      const guard = progressSyncGuardRef.current && typeof progressSyncGuardRef.current === 'object'
        ? progressSyncGuardRef.current
        : { remoteHasMeaningful: false, remoteUpdatedAtMs: 0, remoteSignalScore: 0 };
      const remoteClearlyAhead = (
        guard.remoteHasMeaningful
        && Math.max(0, Number(guard.remoteUpdatedAtMs || 0)) > (Math.max(0, Number(localSnapshot.updatedAtMs || 0)) + 1500)
        && Math.max(0, Number(guard.remoteSignalScore || 0)) > (Math.max(0, Number(localSnapshot.signalScore || 0)) + 20)
      );
      if (remoteClearlyAhead) {
        queueFlowLogThrottled(
          'progress_sync_guard',
          6000,
          'progress_sync:blocked_rollback_guard',
          {
            userId: authUser.uid,
            localUpdatedAtMs: localSnapshot.updatedAtMs,
            remoteUpdatedAtMs: guard.remoteUpdatedAtMs
          }
        );
        return;
      }
      try {
        saveProgress(authUser.uid, progress);
      } catch {
        // ignore local storage write failures
      }
      upsertStatsFromProgress(authUser.uid, progress).catch(() => null);
    }, 320);
    return () => clearTimeout(timer);
  }, [progress, progressReady, authUser?.uid, progressSyncEnabled]);

  useEffect(() => {
    if (!progressReady || !authUser?.uid) return;
    const currentSnapshot = buildProgressSnapshot(progress);
    if (currentSnapshot.meaningful) return;

    let cancelled = false;
    const recoverFromRemoteStats = async (reason = 'poll') => {
      if (cancelled || progressRecoveryBusyRef.current) return;
      progressRecoveryBusyRef.current = true;
      try {
        const stats = await withTimeout(
          getUserStats(authUser.uid).catch(() => null),
          2800,
          'progress_recovery_stats'
        ).catch(() => null);
        if (cancelled || !stats || typeof stats !== 'object') return;
        const recoveredProgress = mergeProgressWithRemoteStats(defaultProgress(), stats);
        const remoteSnapshot = buildProgressSnapshot(recoveredProgress);
        progressSyncGuardRef.current = {
          remoteHasMeaningful: remoteSnapshot.meaningful,
          remoteUpdatedAtMs: Math.max(
            remoteSnapshot.updatedAtMs,
            Math.max(0, Number(stats?.progress_updated_at_ms || 0)),
            Math.max(0, Number(stats?.pvp_recalculated_at_ms || 0))
          ),
          remoteSignalScore: remoteSnapshot.signalScore
        };
        if (!remoteSnapshot.meaningful) return;

        setProgress((prev) => {
          const prevSafe = normalizeProgress(prev);
          const prevSnapshot = buildProgressSnapshot(prevSafe);
          if (
            prevSnapshot.meaningful
            && prevSnapshot.updatedAtMs >= remoteSnapshot.updatedAtMs
            && prevSnapshot.signalScore >= remoteSnapshot.signalScore
          ) {
            return prevSafe;
          }
          return recoveredProgress;
        });
        try {
          saveProgress(authUser.uid, recoveredProgress);
        } catch {
          // ignore local storage write failures
        }
        setProgressSyncEnabled(true);
        queueFlowLogThrottled(
          'progress_recovery_restored',
          6000,
          'progress_recovery:restored_remote',
          {
            userId: authUser.uid,
            reason
          }
        );
      } finally {
        progressRecoveryBusyRef.current = false;
      }
    };

    recoverFromRemoteStats('boot').catch(() => null);
    const timer = setInterval(() => {
      recoverFromRemoteStats('poll').catch(() => null);
    }, PROGRESS_RECOVERY_RETRY_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, progressReady, progress?.updatedAt, progress?.totalCorrect, progress?.pvpPoints]);

  useEffect(() => {
    if (!authUser?.uid || !profile?.id) return;
    let cancelled = false;

    async function heartbeat() {
      try {
        await upsertPresence({
          id: authUser.uid,
          auth_id: authUser.uid,
          nickname: profile.nickname || 'Jogador',
          avatar: profile.avatar || '🤓'
        });
      } catch (error) {
        if (!cancelled) console.error('presence heartbeat failed:', error);
      }
    }

    heartbeat();
    const timer = setInterval(heartbeat, 12000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, profile?.id, profile?.nickname, profile?.avatar]);

  useEffect(() => {
    const isAdminScreen = screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history';
    const shouldPoll = screen === 'challenge' || pvpState.status === 'queueing' || (adminAuthorized && isAdminScreen);
    if (!shouldPoll) return;
    let cancelled = false;

    async function loadArenaMetrics() {
      try {
        const data = await getArenaMetrics(35);
        if (!cancelled) {
          setArenaMetrics({
            online: Math.max(0, Number(data?.online || 0)),
            queue: Math.max(0, Number(data?.queue || 0))
          });
        }
      } catch (error) {
        if (!cancelled) console.error('arena metrics load failed:', error);
      }
    }

    loadArenaMetrics();
    const timer = setInterval(loadArenaMetrics, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [screen, pvpState.status]);

  useEffect(() => {
    if (screen !== 'rankings') return;
    let cancelled = false;
    let retryCount = 0;
    let watchdogTimer = null;
    let retryTimer = null;
    let unsubscribe = () => {};

    const clearTimers = () => {
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleRetry = (reason = 'timeout') => {
      clearTimers();
      if (retryCount >= DATA_SUBSCRIBE_MAX_RETRIES) {
        console.error(`rankings subscribe ${reason} after ${DATA_SUBSCRIBE_MAX_RETRIES} retries`);
        setRankingsRows([]);
        setRankingsLoading(false);
        return;
      }
      retryCount += 1;
      retryTimer = setTimeout(() => {
        if (cancelled) return;
        unsubscribe();
        startSubscribe(`retry_${reason}_${retryCount}`);
      }, DATA_SUBSCRIBE_RETRY_DELAY_MS);
    };

    const startSubscribe = (reason = 'initial') => {
      if (cancelled) return;
      setRankingsLoading(true);
      unsubscribe = subscribeGlobalRankings(
        rankingsMode,
        50,
        (rows) => {
          if (cancelled) return;
          clearTimers();
          setRankingsRows(Array.isArray(rows) ? rows : []);
          setRankingsLoading(false);
        },
        (error) => {
          if (cancelled) return;
          console.error(`rankings subscribe error (${reason}):`, error);
          scheduleRetry('error');
        }
      );
      watchdogTimer = setTimeout(() => {
        if (cancelled) return;
        console.warn(`rankings subscribe timeout > ${DATA_SUBSCRIBE_RETRY_TIMEOUT_MS}ms (${reason})`);
        scheduleRetry('timeout');
      }, DATA_SUBSCRIBE_RETRY_TIMEOUT_MS);
    };

    startSubscribe('initial');

    return () => {
      cancelled = true;
      clearTimers();
      unsubscribe();
    };
  }, [screen, rankingsMode]);

  useEffect(() => {
    if (!authUser?.uid) return;
    ensureSystemBot().catch(() => null);
  }, [authUser?.uid]);

  useEffect(() => {
    if (!authUser?.uid || !profile?.id) return;
    const shouldWarm =
      screen === 'home'
      || screen === 'challenge'
      || screen === 'play-mode'
      || screen === 'rankings';
    if (!shouldWarm) return;

    let cancelled = false;
    const safeDifficulty = getPvpQueueDifficultyFromProgress(progress);
    const runRuntimePreload = async (reason = 'interval') => {
      if (cancelled) return;
      const nowMs = Date.now();
      const cache = preloadRuntimeRef.current && typeof preloadRuntimeRef.current === 'object'
        ? preloadRuntimeRef.current
        : { userId: '', lastAtMs: 0, challengeLastAtMs: 0 };
      const sameUser = String(cache.userId || '') === String(authUser.uid || '');
      const minGapMs = screen === 'challenge'
        ? PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS
        : PRELOAD_RUNTIME_MIN_INTERVAL_MS;
      const lastAtMs = screen === 'challenge'
        ? Math.max(0, Number(cache.challengeLastAtMs || 0))
        : Math.max(0, Number(cache.lastAtMs || 0));
      if (sameUser && (nowMs - lastAtMs) < minGapMs) return;

      preloadRuntimeRef.current = {
        userId: authUser.uid,
        lastAtMs: nowMs,
        challengeLastAtMs: screen === 'challenge'
          ? nowMs
          : Math.max(0, Number(cache.challengeLastAtMs || 0))
      };
      queueFlowLogThrottled(
        'runtime_preload_start',
        10000,
        'runtime_preload:start',
        {
          userId: authUser.uid,
          screen,
          reason
        }
      );
      const startedAtMs = Date.now();
      await Promise.all([
        withTimeout(ensureSystemBots().catch(() => null), 2400, 'preload_system_bots').catch(() => null),
        withTimeout(getArenaMetrics(35).catch(() => null), 1800, 'preload_arena_metrics').catch(() => null),
        withTimeout(getQueueEntryByUser(authUser.uid).catch(() => null), 1600, 'preload_self_queue').catch(() => null),
        withTimeout(findOpenMatchForUser(authUser.uid).catch(() => null), 1600, 'preload_self_open_match').catch(() => null),
        withTimeout(getUserStats(authUser.uid).catch(() => null), 1600, 'preload_self_stats').catch(() => null),
        prepareBotForQueue(safeDifficulty, `runtime_preload_${reason}`, false).catch(() => null)
      ]);
      if (cancelled) return;
      queueFlowLogThrottled(
        'runtime_preload_done',
        10000,
        'runtime_preload:done',
        {
          userId: authUser.uid,
          screen,
          reason,
          elapsedMs: Math.max(0, Date.now() - startedAtMs)
        }
      );
    };

    runRuntimePreload('boot').catch(() => null);
    const timer = setInterval(() => {
      runRuntimePreload('poll').catch(() => null);
    }, screen === 'challenge' ? PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS : PRELOAD_RUNTIME_MIN_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, profile?.id, screen, progress?.pvpPoints, progress?.updatedAt]);

  useEffect(() => {
    const isAdminScreen = screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history';
    if (!isAdminScreen) return;
    if (adminAuthorized) return;
    setScreen('home');
  }, [screen, adminAuthorized]);

  useEffect(() => {
    const shouldLoad = adminAuthorized && (screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history');
    if (!shouldLoad) return;
    cleanupDrawFinishedMatches(300).catch(() => null);
    cleanupZeroScoreFinishedMatches(300).catch(() => null);
    cleanupStalePendingBotUserMatches({
      maxBatch: 60,
      staleMs: 14000,
      actorUserId: authUser?.uid || ''
    }).catch(() => null);

    let cancelled = false;
    let retryCount = 0;
    let watchdogTimer = null;
    let retryTimer = null;
    let unsubscribe = () => {};

    const clearTimers = () => {
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleRetry = (reason = 'timeout') => {
      clearTimers();
      if (retryCount >= DATA_SUBSCRIBE_MAX_RETRIES) {
        console.error(`admin matches subscribe ${reason} after ${DATA_SUBSCRIBE_MAX_RETRIES} retries`);
        setAdminMatchesLoading(false);
        return;
      }
      retryCount += 1;
      retryTimer = setTimeout(() => {
        if (cancelled) return;
        unsubscribe();
        startSubscribe(`retry_${reason}_${retryCount}`);
      }, DATA_SUBSCRIBE_RETRY_DELAY_MS);
    };

    const startSubscribe = (reason = 'initial') => {
      if (cancelled) return;
      setAdminMatchesLoading(true);
      unsubscribe = subscribePvpMatches(
        (rows) => {
          if (cancelled) return;
          clearTimers();
          const list = Array.isArray(rows) ? rows : [];
          setAdminMatches(list);
          setAdminMatchesUpdatedAtMs(Date.now());
          setAdminMatchesLoading(false);
        },
        (error) => {
          if (cancelled) return;
          console.error(`admin matches subscribe error (${reason}):`, error);
          scheduleRetry('error');
        }
      );
      watchdogTimer = setTimeout(() => {
        if (cancelled) return;
        console.warn(`admin matches subscribe timeout > ${DATA_SUBSCRIBE_RETRY_TIMEOUT_MS}ms (${reason})`);
        scheduleRetry('timeout');
      }, DATA_SUBSCRIBE_RETRY_TIMEOUT_MS);
    };

    startSubscribe('initial');

    return () => {
      cancelled = true;
      clearTimers();
      unsubscribe();
    };
  }, [adminAuthorized, screen, authUser?.uid]);

  useEffect(() => {
    if (!adminAuthorized) return;
    let cancelled = false;

    const unsubscribeControl = subscribeBotArenaDaemonControl(
      (row) => {
        if (cancelled) return;
        setBotArenaDaemonControlState(row && typeof row === 'object' ? row : {
          arena_enabled: true,
          pvp_enabled: true,
          quiz_enabled: true,
          updated_at: '',
          updated_by: ''
        });
      },
      (error) => {
        if (!cancelled) console.error('bot daemon control subscribe error:', error);
      }
    );

    const unsubscribeStatus = subscribeBotArenaDaemonStatus(
      (row) => {
        if (cancelled) return;
        setBotArenaDaemonStatusState(row && typeof row === 'object' ? row : {
          owner_id: '',
          status: 'unknown',
          last_state: '',
          ticks: 0,
          created_matches: 0,
          finalized_matches: 0,
          lock_ok: false,
          run_started_at: '',
          run_started_at_ms: 0,
          run_finished_at: '',
          run_finished_at_ms: 0,
          updated_at: '',
          updated_at_ms: 0
        });
      },
      (error) => {
        if (!cancelled) console.error('bot daemon status subscribe error:', error);
      }
    );

    const unsubscribeQuiz = subscribeBotArenaQuizState(
      (row) => {
        if (cancelled) return;
        setAdminMatchesUpdatedAtMs(Date.now());
        setAdminMatchesLoading(false);
        setBotArenaQuizState(row && typeof row === 'object' ? row : {
          status: 'idle',
          batch_id: '',
          assignments: [],
          started_at_ms: 0,
          ends_at_ms: 0,
          cursor_difficulty: 'easy',
          cursor_index: 0,
          cursor_cycle_no: 0,
          updated_at: '',
          last_result: null
        });
      },
      (error) => {
        if (!cancelled) console.error('bot quiz state subscribe error:', error);
      }
    );

    return () => {
      cancelled = true;
      unsubscribeControl();
      unsubscribeStatus();
      unsubscribeQuiz();
    };
  }, [adminAuthorized]);

  useEffect(() => {
    if (!ENABLE_CLIENT_BOT_AUTOMATION) return;
    if (!authUser?.uid) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await runBotArenaAutomationTick(authUser.uid).catch(() => null);
    };

    tick();
    const timer = setInterval(tick, 2600);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${PVP_EMOJI_STORAGE_PREFIX}_${uid}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        const defaults = normalizeBattleEmojis(DEFAULT_BATTLE_EMOJIS);
        setPvpBattleEmojis(defaults);
        setPvpEmojiDraft(defaults);
        return;
      }
      const parsed = JSON.parse(raw);
      const normalized = normalizeBattleEmojis(parsed);
      setPvpBattleEmojis(normalized);
      setPvpEmojiDraft(normalized);
    } catch {
      const defaults = normalizeBattleEmojis(DEFAULT_BATTLE_EMOJIS);
      setPvpBattleEmojis(defaults);
      setPvpEmojiDraft(defaults);
    }
  }, [authUser?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = String(authUser?.uid || 'guest').trim() || 'guest';
    const key = `${PVP_EMOJI_STORAGE_PREFIX}_${uid}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(normalizeBattleEmojis(pvpBattleEmojis)));
    } catch {
      // ignore storage failures
    }
  }, [pvpBattleEmojis, authUser?.uid]);

  useEffect(() => {
    if (screen !== 'quiz' || !quizState || quizState.answered || typeof window === 'undefined') return;
    let rafId = 0;

    const tick = () => {
      setQuizClockMs(Date.now());
      rafId = window.requestAnimationFrame(tick);
    };

    setQuizClockMs(Date.now());
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [screen, quizState?.index, quizState?.answered]);

  useEffect(() => {
    if (screen !== 'quiz' || !quizState || quizState.answered) return;
    const roundSeconds = TIMER_SECONDS[quizState.difficulty] || TIMER_SECONDS.easy;
    const startedAtMs = Math.max(0, Number(quizState.questionStartedAtMs || 0)) || Date.now();
    const elapsedMs = Math.max(0, Date.now() - startedAtMs);
    const remainingMs = Math.max(0, roundSeconds * 1000 - elapsedMs);

    if (remainingMs <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => handleTimeout(), remainingMs + 16);
    return () => clearTimeout(timer);
  }, [screen, quizState?.index, quizState?.answered, quizState?.questionStartedAtMs, quizState?.difficulty]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (
      safeStatus !== 'queueing'
      && safeStatus !== 'active'
      && safeStatus !== 'pending_accept'
      && safeStatus !== 'round_result'
    ) {
      return;
    }
    setPvpClockMs(Date.now());
    const timer = setInterval(
      () => setPvpClockMs(Date.now()),
      safeStatus === 'active' ? 80 : 150
    );
    return () => clearInterval(timer);
  }, [pvpState.status, pvpState.matchId]);

  const selectedTopics = useMemo(
    () => getTopicsByLanguage(TOPICS, selectedLanguage),
    [selectedLanguage]
  );

  const quizRoundSeconds = TIMER_SECONDS[quizState?.difficulty] || TIMER_SECONDS.easy;
  const quizQuestionStartMs = Math.max(0, Number(quizState?.questionStartedAtMs || 0));
  const quizElapsedMs = quizQuestionStartMs > 0
    ? Math.max(0, quizClockMs - quizQuestionStartMs)
    : 0;
  const quizRemainingMs = quizState
    ? Math.max(0, quizRoundSeconds * 1000 - quizElapsedMs)
    : 0;
  const quizRemainingSec = Math.ceil(quizRemainingMs / 1000);
  const quizTimerPct = quizState
    ? Math.max(0, Math.min(100, (quizRemainingMs / Math.max(1, quizRoundSeconds * 1000)) * 100))
    : 0;
  const quizTimerClass = quizRemainingSec <= 5 ? 'danger' : quizRemainingSec <= 10 ? 'warning' : '';

  const currentQuestion = quizState ? quizState.questions[quizState.index] : null;

  const safeLevel = Math.max(1, Number(progress?.level || 1));
  const safeXp = Math.max(0, Number(progress?.xp || 0));
  const safeBestStreak = Math.max(0, Number(progress?.bestStreak || 0));
  const safeCoins = Math.max(0, Number(progress?.coins || 0));
  const xpForNextLevel = Math.max(1, getXPForLevel(safeLevel));
  const xpPercent = Math.max(0, Math.min(100, Math.round((safeXp / xpForNextLevel) * 100)));
  const heroNickname = String(
    profile?.nickname
    || profileDraft?.nickname
    || activeAuthUser?.displayName
    || activeAuthUser?.email
    || 'Jogador'
  ).trim() || 'Jogador';

  const displayAvatar = getDisplayAvatar(profile?.avatar || '🤓', shopData);
  const avatarFrameStyle = getAvatarFrameStyle(shopData);
  const avatarFrameClass = getAvatarFrameClass(shopData);
  const heroBackground = getHeroBackgroundStyle(shopData);
  const heroBackgroundMeta = getBackgroundVisualMeta(shopData);

  const pvpMatch = pvpState.match;
  const pvpRoundNo = Math.max(1, Number(pvpMatch?.round_no || 1));
  const pvpTotalRounds = Math.max(1, Number(pvpMatch?.total_rounds || PVP_ROUNDS_PER_MATCH));
  const pvpBaseFinalRoundNo = Math.min(PVP_ROUNDS_PER_MATCH, pvpTotalRounds);
  const pvpQuestion = pvpMatch?.question_set?.[pvpRoundNo - 1] || null;
  const pvpRoundDuration = Math.max(
    1000,
    Number(getRoundDurationSeconds(pvpMatch?.difficulty || pvpConfig.difficulty) || 20) * 1000
    + PVP_ROUND_EXTRA_ANSWER_MS
  );
  const pvpRoundActivatedKey = `${pvpState.matchId || pvpMatch?.id || ''}_${pvpMatch?.round_no || 1}`;
  const pvpRoundServerStartMs = Math.max(
    0,
    Number(pvpMatch?.round_started_at_ms || toMillis(pvpMatch?.round_started_at) || 0)
  );
  if (pvpState.status === 'active') {
    if (pvpRoundActivatedAtRef.current.key !== pvpRoundActivatedKey) {
      pvpRoundActivatedAtRef.current = {
        key: pvpRoundActivatedKey,
        ms: pvpRoundServerStartMs > 0 ? pvpRoundServerStartMs : Date.now()
      };
    }
  }
  const pvpRoundStartMs = Math.max(
    0,
    Number(pvpState.status === 'active' ? pvpRoundActivatedAtRef.current.ms : pvpRoundServerStartMs)
  );
  const pvpRoundElapsedMsRaw = pvpRoundStartMs > 0
    ? Math.max(0, pvpClockMs - pvpRoundStartMs)
    : 0;
  const pvpRoundElapsedMs = Number.isFinite(pvpRoundElapsedMsRaw) ? pvpRoundElapsedMsRaw : 0;
  const pvpRoundRemainingMsRaw = Math.max(0, pvpRoundDuration - pvpRoundElapsedMs);
  const safePvpRoundRemainingMsRaw = Number.isFinite(pvpRoundRemainingMsRaw) ? pvpRoundRemainingMsRaw : pvpRoundDuration;
  if (pvpState.status === 'active') {
    if (pvpRoundRemainingGuardRef.current.key !== pvpRoundActivatedKey) {
      pvpRoundRemainingGuardRef.current = {
        key: pvpRoundActivatedKey,
        remainingMs: safePvpRoundRemainingMsRaw
      };
    } else {
      pvpRoundRemainingGuardRef.current = {
        key: pvpRoundActivatedKey,
        remainingMs: Math.max(
          0,
          Math.min(
            Number(pvpRoundRemainingGuardRef.current.remainingMs || safePvpRoundRemainingMsRaw),
            safePvpRoundRemainingMsRaw
          )
        )
      };
    }
  }
  const pvpRoundRemainingMs = pvpState.status === 'active'
    ? Math.max(
      0,
      Number(
        pvpRoundRemainingGuardRef.current.key === pvpRoundActivatedKey
          ? pvpRoundRemainingGuardRef.current.remainingMs
          : safePvpRoundRemainingMsRaw
      )
    )
    : safePvpRoundRemainingMsRaw;
  const pvpRoundRemainingSec = Math.max(0, Math.ceil(pvpRoundRemainingMs / 1000));

  useEffect(() => {
    const element = quizQuestionScrollRef.current;
    if (screen !== 'quiz' || !element) {
      setQuizQuestionHasOverflow(false);
      return;
    }

    let rafId = 0;
    const measureOverflow = () => {
      const hasOverflow = (element.scrollHeight - element.clientHeight) > 6;
      setQuizQuestionHasOverflow((prev) => (prev === hasOverflow ? prev : hasOverflow));
    };
    const scheduleMeasure = () => {
      if (rafId && typeof window !== 'undefined') window.cancelAnimationFrame(rafId);
      if (typeof window !== 'undefined') {
        rafId = window.requestAnimationFrame(measureOverflow);
      } else {
        measureOverflow();
      }
    };

    scheduleMeasure();
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => scheduleMeasure());
      observer.observe(element);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', scheduleMeasure);
        if (rafId) window.cancelAnimationFrame(rafId);
      }
    };
  }, [screen, quizState?.index, currentQuestion?.q, currentQuestion?.code]);

  useEffect(() => {
    const element = pvpQuestionScrollRef.current;
    if (screen !== 'pvp' || pvpState.status !== 'active' || !element) {
      setPvpQuestionHasOverflow(false);
      return;
    }

    let rafId = 0;
    const measureOverflow = () => {
      const hasOverflow = (element.scrollHeight - element.clientHeight) > 6;
      setPvpQuestionHasOverflow((prev) => (prev === hasOverflow ? prev : hasOverflow));
    };
    const scheduleMeasure = () => {
      if (rafId && typeof window !== 'undefined') window.cancelAnimationFrame(rafId);
      if (typeof window !== 'undefined') {
        rafId = window.requestAnimationFrame(measureOverflow);
      } else {
        measureOverflow();
      }
    };

    scheduleMeasure();
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => scheduleMeasure());
      observer.observe(element);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', scheduleMeasure);
        if (rafId) window.cancelAnimationFrame(rafId);
      }
    };
  }, [screen, pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpQuestion?.q, pvpQuestion?.code]);

  const isBattleMusicScreen = screen === 'quiz' || screen === 'feedback' || screen === 'pvp' || screen === 'pvp-result';

  const activeMusicTrack = musicMode === 'battle'
    ? BATTLE_MUSIC_TRACKS[battleTrackIndex % BATTLE_MUSIC_TRACKS.length]
    : MENU_MUSIC_TRACKS[menuTrackIndex % MENU_MUSIC_TRACKS.length];

  function ensureAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const hasUserActivation = Boolean(window.navigator?.userActivation?.hasBeenActive);
    if (!audioUnlockedRef.current && !hasUserActivation) return null;

    let ctx = audioContextRef.current;
    if (!ctx) {
      ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const master = ctx.createGain();
      const music = ctx.createGain();
      const sfx = ctx.createGain();

      master.gain.value = 0.9;
      music.gain.value = 0;
      sfx.gain.value = Math.max(
        0,
        Math.min(1, Number(audioSettingsRef.current.sfxVolume ?? AUDIO_DEFAULTS.sfxVolume))
      );

      music.connect(master);
      sfx.connect(master);
      master.connect(ctx.destination);

      masterGainRef.current = master;
      musicGainRef.current = music;
      sfxGainRef.current = sfx;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => null);
    }

    return ctx;
  }

  function clearMusicLoop() {
    if (musicLoopTimerRef.current) {
      clearInterval(musicLoopTimerRef.current);
      musicLoopTimerRef.current = null;
    }
    if (musicTransitionTimerRef.current) {
      clearTimeout(musicTransitionTimerRef.current);
      musicTransitionTimerRef.current = null;
    }
  }

  function getMusicVolumeLevel(raw = audioSettingsRef.current?.musicVolume) {
    const safe = Math.max(0, Math.min(1, Number(raw ?? AUDIO_DEFAULTS.musicVolume)));
    return safe * 0.55;
  }

  function getSfxVolumeLevel(raw = audioSettingsRef.current?.sfxVolume) {
    return Math.max(0, Math.min(1, Number(raw ?? AUDIO_DEFAULTS.sfxVolume)));
  }

  function setMusicGain(target, durationMs = 450) {
    const ctx = audioContextRef.current;
    const musicGain = musicGainRef.current;
    if (!ctx || !musicGain) return;
    const now = ctx.currentTime;
    const safeTarget = Math.max(0, Math.min(1, Number(target ?? 0)));
    const durationSec = Math.max(0.06, Number(durationMs || 0) / 1000);
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(safeTarget, now + durationSec);
  }

  function emitMusicTone({
    frequency,
    durationSec,
    wave = 'sine',
    volume = 0.1,
    attackSec = 0.02,
    releaseSec = 0.26,
    whenOffsetSec = 0
  }) {
    const ctx = audioContextRef.current;
    const musicGain = musicGainRef.current;
    if (!ctx || !musicGain) return;

    const startAt = ctx.currentTime + Math.max(0, Number(whenOffsetSec || 0));
    const dur = Math.max(0.05, Number(durationSec || 0.2));
    const attack = Math.max(0.005, Number(attackSec || 0.02));
    const release = Math.max(0.03, Number(releaseSec || 0.2));

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(Math.max(30, Number(frequency || 220)), startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, Number(volume || 0.1)), startAt + attack);
    gain.gain.setValueAtTime(Math.max(0.001, Number(volume || 0.1)), startAt + Math.max(attack, dur - release));
    gain.gain.linearRampToValueAtTime(0.0001, startAt + dur);

    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.01);
  }

  function playMenuMusicStep(track) {
    const notes = track?.notes || [];
    if (!notes.length) return;
    const step = musicStepRef.current % notes.length;
    const chord = notes[step] || [];
    const root = Array.isArray(chord) ? chord[0] : chord;
    const tones = Array.isArray(chord) ? chord : [chord];

    tones.forEach((freq, index) => {
      emitMusicTone({
        frequency: freq,
        durationSec: 1.12,
        wave: index === 0 ? 'triangle' : 'sine',
        volume: Math.max(0.045, 0.13 - index * 0.017),
        attackSec: 0.024,
        releaseSec: 0.52
      });
    });

    emitMusicTone({
      frequency: Math.max(70, Number(root || 220) / 2),
      durationSec: 0.88,
      wave: 'triangle',
      volume: 0.072,
      attackSec: 0.018,
      releaseSec: 0.36
    });

    if (tones.length) {
      emitMusicTone({
        frequency: Number(tones[Math.min(tones.length - 1, 2)] || root || 220) * 2,
        durationSec: 0.22,
        wave: 'square',
        volume: 0.035,
        attackSec: 0.005,
        releaseSec: 0.11,
        whenOffsetSec: 0.18
      });
    }

    musicStepRef.current += 1;
  }

  function playBattleMusicStep(track) {
    const notes = track?.notes || [];
    if (!notes.length) return;
    const step = musicStepRef.current % notes.length;
    const base = Math.max(60, Number(notes[step] || 130.81));

    emitMusicTone({
      frequency: base / 2,
      durationSec: 0.22,
      wave: 'sawtooth',
      volume: 0.17,
      attackSec: 0.006,
      releaseSec: 0.12
    });

    emitMusicTone({
      frequency: base,
      durationSec: 0.16,
      wave: 'square',
      volume: 0.11,
      attackSec: 0.004,
      releaseSec: 0.08,
      whenOffsetSec: 0.03
    });

    emitMusicTone({
      frequency: base * 1.5,
      durationSec: 0.12,
      wave: 'triangle',
      volume: 0.06,
      attackSec: 0.005,
      releaseSec: 0.07,
      whenOffsetSec: 0.07
    });

    emitMusicTone({
      frequency: base * 2,
      durationSec: 0.08,
      wave: 'sine',
      volume: 0.032,
      attackSec: 0.003,
      releaseSec: 0.045,
      whenOffsetSec: 0.11
    });

    musicStepRef.current += 1;
  }

  function startMusicLoop(mode) {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    clearMusicLoop();
    musicStepRef.current = 0;

    if (mode === 'battle') {
      const track = BATTLE_MUSIC_TRACKS[battleTrackIndexRef.current % BATTLE_MUSIC_TRACKS.length];
      setMusicMode('battle');
      musicModeRef.current = 'battle';
      playBattleMusicStep(track);
      musicLoopTimerRef.current = setInterval(() => playBattleMusicStep(track), Math.max(300, Number(track.tempoMs || 430)));
      return;
    }

    const track = MENU_MUSIC_TRACKS[menuTrackIndexRef.current % MENU_MUSIC_TRACKS.length];
    setMusicMode('menu');
    musicModeRef.current = 'menu';
    playMenuMusicStep(track);
    musicLoopTimerRef.current = setInterval(() => playMenuMusicStep(track), Math.max(620, Number(track.tempoMs || 1260)));
  }

  function bootstrapMusicIfNeeded(preferredMode) {
    if (!audioSettingsRef.current.musicEnabled) return;
    if (musicLoopTimerRef.current) return;
    const mode = preferredMode === 'battle' ? 'battle' : 'menu';
    startMusicLoop(mode);
    const nextVolume = getMusicVolumeLevel(audioSettingsRef.current?.musicVolume);
    setMusicGain(nextVolume, 320);
  }

  function applyMusicMode(mode) {
    const safeMode = mode === 'battle' ? 'battle' : 'menu';
    ensureAudioContext();

    if (!audioSettingsRef.current.musicEnabled) {
      clearMusicLoop();
      setMusicGain(0, 220);
      return;
    }

    const nextVolume = getMusicVolumeLevel(audioSettingsRef.current?.musicVolume);
    if (musicModeRef.current === safeMode && musicLoopTimerRef.current) {
      setMusicGain(nextVolume, 240);
      return;
    }

    setMusicGain(0, 420);
    musicTransitionTimerRef.current = setTimeout(() => {
      startMusicLoop(safeMode);
      setMusicGain(nextVolume, 650);
    }, 430);
  }

  function playSfx(type = 'click', retryCount = 0) {
    if (!audioSettingsRef.current.sfxEnabled) return;
    const ctx = ensureAudioContext();
    const sfxBus = sfxGainRef.current;
    if (!ctx || !sfxBus) return;
    if (ctx.state !== 'running') {
      if (retryCount >= 2) return;
      ctx.resume()
        .then(() => {
          if (typeof window !== 'undefined') {
            window.setTimeout(() => playSfx(type, retryCount + 1), 24);
          } else {
            playSfx(type, retryCount + 1);
          }
        })
        .catch(() => null);
      return;
    }
    bootstrapMusicIfNeeded(isBattleMusicScreen ? 'battle' : 'menu');

    const sfxVolume = getSfxVolumeLevel(audioSettingsRef.current?.sfxVolume);
    sfxBus.gain.setValueAtTime(sfxVolume, ctx.currentTime);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(sfxBus);
    let secondaryOsc = null;
    let secondaryGain = null;
    let secondaryDuration = 0;
    let secondaryStartOffset = 0;

    const now = ctx.currentTime;
    let duration = 0.12;

    if (type === 'pvp_transition') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.linearRampToValueAtTime(430, now + 0.16);
      duration = 0.26;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.17, now + 0.026);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_reveal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);
      duration = 0.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_confirm') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.linearRampToValueAtTime(860, now + 0.06);
      duration = 0.09;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.17);
      duration = 0.22;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      secondaryOsc = ctx.createOscillator();
      secondaryGain = ctx.createGain();
      secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(sfxBus);
      secondaryStartOffset = 0.06;
      const secondaryNow = now + secondaryStartOffset;
      secondaryDuration = 0.12;
      secondaryOsc.type = 'triangle';
      secondaryOsc.frequency.setValueAtTime(940, secondaryNow);
      secondaryOsc.frequency.exponentialRampToValueAtTime(1680, secondaryNow + 0.1);
      secondaryGain.gain.setValueAtTime(0.0001, secondaryNow);
      secondaryGain.gain.linearRampToValueAtTime(0.16, secondaryNow + 0.012);
      secondaryGain.gain.exponentialRampToValueAtTime(0.0001, secondaryNow + secondaryDuration);
    } else if (type === 'pvp_wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.24);
      duration = 0.28;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      secondaryOsc = ctx.createOscillator();
      secondaryGain = ctx.createGain();
      secondaryOsc.connect(secondaryGain);
      secondaryGain.connect(sfxBus);
      secondaryStartOffset = 0.025;
      const secondaryNow = now + secondaryStartOffset;
      secondaryDuration = 0.2;
      secondaryOsc.type = 'square';
      secondaryOsc.frequency.setValueAtTime(190, secondaryNow);
      secondaryOsc.frequency.exponentialRampToValueAtTime(92, secondaryNow + 0.19);
      secondaryGain.gain.setValueAtTime(0.0001, secondaryNow);
      secondaryGain.gain.linearRampToValueAtTime(0.12, secondaryNow + 0.018);
      secondaryGain.gain.exponentialRampToValueAtTime(0.0001, secondaryNow + secondaryDuration);
    } else if (type === 'pvp_tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(990, now);
      osc.frequency.linearRampToValueAtTime(930, now + 0.05);
      duration = 0.07;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_time_warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.08);
      duration = 0.12;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.016);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_time_critical') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(430, now + 0.07);
      duration = 0.11;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_timeout') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      duration = 0.24;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_round_final') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(470, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.17);
      duration = 0.22;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.024);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_round_elimination') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.17);
      duration = 0.23;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_round_result') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.linearRampToValueAtTime(730, now + 0.09);
      duration = 0.14;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.2);
      duration = 0.24;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.028);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_draw') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(560, now + 0.11);
      duration = 0.19;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'pvp_result_loss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(270, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.21);
      duration = 0.24;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.14);
      duration = 0.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      duration = 0.2;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'notify') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(580, now + 0.06);
      duration = 0.14;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'coin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.linearRampToValueAtTime(1120, now + 0.07);
      duration = 0.1;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (type === 'xp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.linearRampToValueAtTime(720, now + 0.08);
      duration = 0.12;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.08);
      duration = 0.11;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    osc.start(now);
    osc.stop(now + duration + 0.02);
    if (secondaryOsc && secondaryGain && secondaryDuration > 0) {
      const secondaryStartAt = now + Math.max(0, secondaryStartOffset);
      secondaryOsc.start(secondaryStartAt);
      secondaryOsc.stop(secondaryStartAt + secondaryDuration + 0.02);
    }
  }

  function updateAudioSetting(key, value) {
    setAudioSettings((prev) => {
      const next = normalizeAudioSettings({
        ...prev,
        [key]: value
      });
      audioSettingsRef.current = next;

      const ctx = audioContextRef.current;
      if (ctx) {
        if (key === 'sfxVolume' || key === 'sfxEnabled') {
          const sfxBus = sfxGainRef.current;
          if (sfxBus) {
            const nextSfx = next.sfxEnabled ? getSfxVolumeLevel(next.sfxVolume) : 0;
            sfxBus.gain.setTargetAtTime(nextSfx, ctx.currentTime, 0.02);
          }
        }

        if (key === 'musicVolume') {
          const nextMusic = next.musicEnabled ? getMusicVolumeLevel(next.musicVolume) : 0;
          setMusicGain(nextMusic, 140);
        }

        if (key === 'musicEnabled' && !next.musicEnabled) {
          setMusicGain(0, 180);
        }
      }

      return next;
    });
  }

  function handleMusicSkip() {
    const mode = musicModeRef.current === 'battle' ? 'battle' : 'menu';

    if (mode === 'battle') {
      const nextIndex = (battleTrackIndexRef.current + 1) % BATTLE_MUSIC_TRACKS.length;
      battleTrackIndexRef.current = nextIndex;
      setBattleTrackIndex(nextIndex);
    } else {
      const nextIndex = (menuTrackIndexRef.current + 1) % MENU_MUSIC_TRACKS.length;
      menuTrackIndexRef.current = nextIndex;
      setMenuTrackIndex(nextIndex);
    }

    if (audioSettingsRef.current.musicEnabled) {
      startMusicLoop(mode);
      setMusicGain(getMusicVolumeLevel(audioSettingsRef.current?.musicVolume), 220);
    }

    playSfx('notify');
  }

  function clearRewardSfxTimers() {
    rewardSfxTimersRef.current.forEach((timerId) => {
      if (typeof window !== 'undefined') window.clearTimeout(timerId);
    });
    rewardSfxTimersRef.current = [];
  }

  function getRewardEffectOrigin(eventOrElement = null) {
    if (typeof window === 'undefined') {
      return { x: 240, y: 520 };
    }

    const target = eventOrElement?.currentTarget || eventOrElement?.target || eventOrElement;
    if (target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.5
        };
      }
    }

    return {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.78
    };
  }

  function playRewardCascadeSound({ xp = 0, coins = 0, durationMs = 2600 }) {
    if (typeof window === 'undefined') return;
    clearRewardSfxTimers();
    ensureAudioContext();

    const rewardXp = Math.max(0, Number(xp || 0));
    const rewardCoins = Math.max(0, Number(coins || 0));
    const coinHits = rewardCoins > 0 ? Math.max(22, Math.min(180, Math.round(rewardCoins * 2.4 + rewardXp * 0.25))) : 0;
    const xpHits = rewardXp > 0 ? Math.max(18, Math.min(150, Math.round(rewardXp * 1.55 + rewardCoins * 0.3))) : 0;
    const totalWindow = Math.max(1900, Number(durationMs || 0));

    for (let index = 0; index < coinHits; index += 1) {
      const step = coinHits <= 1 ? 0 : index / (coinHits - 1);
      const eased = Math.pow(step, 0.84);
      const timeMs = Math.round(eased * totalWindow * 0.9 + Math.random() * 28);
      const timerId = window.setTimeout(() => playSfx('coin'), timeMs);
      rewardSfxTimersRef.current.push(timerId);
    }

    for (let index = 0; index < xpHits; index += 1) {
      const step = xpHits <= 1 ? 0 : index / (xpHits - 1);
      const eased = Math.pow(step, 0.9);
      const timeMs = Math.round(eased * totalWindow * 0.94 + 120 + Math.random() * 34);
      const timerId = window.setTimeout(() => playSfx('xp'), timeMs);
      rewardSfxTimersRef.current.push(timerId);
    }

    const notifyHits = Math.max(2, Math.min(8, Math.round((coinHits + xpHits) / 65)));
    for (let index = 0; index < notifyHits; index += 1) {
      const step = notifyHits <= 1 ? 0 : index / (notifyHits - 1);
      const timeMs = Math.round(totalWindow * (0.35 + step * 0.5));
      const timerId = window.setTimeout(() => playSfx('notify'), timeMs);
      rewardSfxTimersRef.current.push(timerId);
    }

    const tailTimer = window.setTimeout(() => playSfx('success'), Math.round(totalWindow + 140));
    rewardSfxTimersRef.current.push(tailTimer);
  }

  function runRewardParticleSequence({ xp = 0, coins = 0, origin = null, onDone = null }) {
    const rewardXp = Math.max(0, Number(xp || 0));
    const rewardCoins = Math.max(0, Number(coins || 0));
    const burstStrength = Math.max(1, (rewardXp / 110) + (rewardCoins / 82));
    const durationMs = Math.max(2800, Math.min(6400, Math.round(2200 + burstStrength * 1100)));
    const hasRewards = rewardXp > 0 || rewardCoins > 0;
    if (!hasRewards) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    const particles = buildRewardParticleBurst({
      xp: rewardXp,
      coins: rewardCoins,
      origin
    });
    setRewardFxParticles(particles);
    playRewardCascadeSound({ xp: rewardXp, coins: rewardCoins, durationMs });

    if (rewardFxTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(rewardFxTimeoutRef.current);
      rewardFxTimeoutRef.current = null;
    }

    if (typeof window !== 'undefined') {
      rewardFxTimeoutRef.current = window.setTimeout(() => {
        setRewardFxParticles([]);
      }, durationMs + 240);

      window.setTimeout(() => {
        if (typeof onDone === 'function') onDone();
      }, durationMs + 180);
    } else if (typeof onDone === 'function') {
      onDone();
    }
  }

  function handleCollectResultRewards(event) {
    const rewardXp = Math.max(0, Number(resultState?.awardedXp || 0));
    const rewardCoins = Math.max(0, Number(resultState?.awardedCoins || 0));
    const hasRewards = rewardXp > 0 || rewardCoins > 0;
    if (!resultState || resultState.rewardsCollected || rewardCollecting || !hasRewards) return;

    setRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setResultState((prev) => (prev ? { ...prev, rewardsCollected: true } : prev));
        setRewardCollecting(false);
        playSfx('success');
      }
    });
  }

  function collectPvpResultRewards(event) {
    if (!pvpResultReward || pvpRewardCollecting) return;
    const rewardXp = Math.max(0, Number(pvpResultReward.xp || 0));
    const rewardCoins = Math.max(0, Number(pvpResultReward.coins || 0));
    setPvpRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setPvpResultReward(null);
        setPvpResultTransitionMode('');
        setPvpCompensation(null);
        resetPvpState();
        setScreen('home');
        showToast('Recompensas PVP coletadas.');
        playSfx('success');
      }
    });
  }

  function collectPvpCompensation(event) {
    if (!pvpCompensation || pvpRewardCollecting) return;
    const rewardXp = Math.max(0, Number(pvpCompensation.xp || 0));
    const rewardCoins = Math.max(0, Number(pvpCompensation.coins || 0));
    setPvpRewardCollecting(true);
    runRewardParticleSequence({
      xp: rewardXp,
      coins: rewardCoins,
      origin: getRewardEffectOrigin(event),
      onDone: () => {
        setPvpCompensation(null);
        setPvpRewardCollecting(false);
        resetPvpState();
        setScreen('home');
        showToast('Compensacao coletada.');
        playSfx('success');
      }
    });
  }

  async function acceptPvpMatchInvite() {
    const current = pvpStateRef.current;
    const match = current?.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').toLowerCase() !== 'pending_accept') return;
    if (matchAcceptBusy) return;

    setMatchAcceptBusy(true);
    try {
      const latest = await getPvpMatch(match.id).catch(() => null);
      if (!latest || String(latest.status || '').toLowerCase() !== 'pending_accept') return;

      const player1Id = String(latest.player1_user_id || '').trim();
      const player2Id = String(latest.player2_user_id || '').trim();
      if (userId !== player1Id && userId !== player2Id) return;

      const patch = userId === player1Id
        ? { player1_accept_state: 'accepted' }
        : { player2_accept_state: 'accepted' };

      setPvpState((prev) => {
        if (!prev?.match || String(prev.match.id || '') !== String(match.id)) return prev;
        return {
          ...prev,
          match: {
            ...prev.match,
            ...(userId === player1Id ? { player1_accept_state: 'accepted' } : { player2_accept_state: 'accepted' })
          }
        };
      });

      const nextPlayer1State = userId === player1Id
        ? 'accepted'
        : String(latest.player1_accept_state || 'pending');
      const nextPlayer2State = userId === player2Id
        ? 'accepted'
        : String(latest.player2_accept_state || 'pending');
      const bothAccepted = nextPlayer1State === 'accepted' && nextPlayer2State === 'accepted';

      if (bothAccepted && !Number(latest.start_countdown_ms || 0)) {
        patch.start_countdown_ms = Date.now() + 3000;
        patch.both_accepted_at_ms = Date.now();
      }

      await updatePvpMatch(match.id, patch);
      playSfx('success');
    } catch (error) {
      console.error('accept invite failed:', error);
      showToast('Nao foi possivel aceitar o confronto.');
      playSfx('error');
    } finally {
      setMatchAcceptBusy(false);
    }
  }

  async function rejectPvpMatchInvite() {
    const current = pvpStateRef.current;
    const match = current?.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').toLowerCase() !== 'pending_accept') return;
    if (matchAcceptBusy) return;

    setMatchAcceptBusy(true);
    try {
      const latest = await getPvpMatch(match.id).catch(() => null);
      if (!latest || String(latest.status || '').toLowerCase() !== 'pending_accept') return;

      const player1Id = String(latest.player1_user_id || '').trim();
      const player2Id = String(latest.player2_user_id || '').trim();
      if (userId !== player1Id && userId !== player2Id) return;

      const patch = userId === player1Id
        ? { player1_accept_state: 'rejected' }
        : { player2_accept_state: 'rejected' };
      patch.reject_at_ms = Date.now();

      setPvpState((prev) => {
        if (!prev?.match || String(prev.match.id || '') !== String(match.id)) return prev;
        return {
          ...prev,
          match: {
            ...prev.match,
            ...(userId === player1Id ? { player1_accept_state: 'rejected' } : { player2_accept_state: 'rejected' }),
            reject_at_ms: patch.reject_at_ms
          }
        };
      });

      await updatePvpMatch(match.id, patch);
      playSfx('error');
    } catch (error) {
      console.error('reject invite failed:', error);
      showToast('Nao foi possivel recusar o confronto.');
      playSfx('error');
    } finally {
      setMatchAcceptBusy(false);
    }
  }

  async function refreshAdminMetrics() {
    const [metrics, daemonControl, daemonStatus, quizState] = await Promise.all([
      getArenaMetrics(35),
      getBotArenaDaemonControl().catch(() => null),
      getBotArenaDaemonStatus().catch(() => null),
      getBotArenaQuizState().catch(() => null)
    ]);
    setArenaMetrics({
      online: Math.max(0, Number(metrics?.online || 0)),
      queue: Math.max(0, Number(metrics?.queue || 0))
    });
    if (daemonControl && typeof daemonControl === 'object') {
      setBotArenaDaemonControlState(daemonControl);
    }
    if (daemonStatus && typeof daemonStatus === 'object') {
      setBotArenaDaemonStatusState(daemonStatus);
    }
    if (quizState && typeof quizState === 'object') {
      setBotArenaQuizState(quizState);
    }
  }

  async function setAdminBotArenaAutomationEnabled(mode, nextEnabled) {
    if (adminBotDaemonBusy) return;
    const safeMode = String(mode || '').trim().toLowerCase() === 'quiz' ? 'quiz' : 'pvp';
    const safeEnabled = nextEnabled === true;
    setAdminBotDaemonBusy(true);
    try {
      const actorId = String(authUser?.uid || '').trim() || 'admin';
      const patch = safeMode === 'quiz'
        ? { quiz_enabled: safeEnabled }
        : { pvp_enabled: safeEnabled };
      const updated = await setBotArenaDaemonControl(patch, actorId);
      if (updated && typeof updated === 'object') {
        setBotArenaDaemonControlState(updated);
      }
      if (safeMode === 'quiz') {
        showToast(safeEnabled ? 'Automacao de quiz dos bots ativada.' : 'Automacao de quiz dos bots desativada.');
      } else {
        showToast(safeEnabled ? 'Automacao de batalhas PVP dos bots ativada.' : 'Automacao de batalhas PVP dos bots desativada.');
      }
      playSfx('success');
    } catch (error) {
      console.error('set bot arena control failed:', error);
      showToast('Falha ao atualizar a automacao dos bots.');
      playSfx('error');
    } finally {
      setAdminBotDaemonBusy(false);
    }
  }

  async function runAdminCleanupQueue() {
    setAdminBusy(true);
    try {
      await cleanupStaleQueueEntries(8, authUser?.uid || '');
      await cleanupDrawFinishedMatches(300).catch(() => null);
      await cleanupZeroScoreFinishedMatches(300).catch(() => null);
      await cleanupStalePendingBotUserMatches({
        maxBatch: 80,
        staleMs: 14000,
        actorUserId: String(authUser?.uid || '').trim()
      }).catch(() => null);
      await refreshAdminMetrics();
      showToast('Operacao admin concluida.');
      playSfx('success');
    } catch (error) {
      console.error('admin cleanup failed:', error);
      showToast('Falha na operacao admin.');
      playSfx('error');
    } finally {
      setAdminBusy(false);
    }
  }

  function openAdminScreen() {
    setAdminPassword('');
    setAdminAuthError('');
    setAdminAuthOpen(true);
  }

  function closeAdminAuthModal() {
    setAdminAuthOpen(false);
    setAdminPassword('');
    setAdminAuthError('');
  }

  function submitAdminAuth() {
    const safePassword = String(adminPassword || '').trim();
    if (!safePassword) {
      setAdminAuthError('Informe a senha do admin.');
      return;
    }
    if (safePassword !== ADMIN_PANEL_PASSWORD) {
      setAdminAuthError('Senha incorreta.');
      playSfx('error');
      return;
    }
    setAdminAuthOpen(false);
    setAdminPassword('');
    setAdminAuthError('');
    setAdminAuthorized(true);
    setScreen('admin-monitor');
    refreshAdminMetrics().catch(() => null);
    playSfx('success');
  }

  function readCookieConsentFromDocument() {
    if (typeof document === 'undefined') return '';
    const cookieParts = String(document.cookie || '').split(';');
    for (const part of cookieParts) {
      const trimmed = part.trim();
      if (!trimmed.startsWith(`${COOKIE_CONSENT_COOKIE_KEY}=`)) continue;
      const rawValue = trimmed.slice(COOKIE_CONSENT_COOKIE_KEY.length + 1);
      const decoded = decodeURIComponent(rawValue);
      if (decoded === 'accepted' || decoded === 'essential') return decoded;
    }
    return '';
  }

  function saveCookieConsent(choice) {
    const safeChoice = choice === 'accepted' ? 'accepted' : 'essential';
    setCookieConsent(safeChoice);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, safeChoice);
      } catch {
        // ignore local storage write failure
      }
    }

    if (typeof document !== 'undefined') {
      const encoded = encodeURIComponent(safeChoice);
      document.cookie = `${COOKIE_CONSENT_COOKIE_KEY}=${encoded}; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
    }

    if (safeChoice === 'accepted') {
      showToast('Cookies habilitados para melhorar a experiencia.');
      playSfx('success');
      return;
    }

    showToast('Somente cookies essenciais foram mantidos.');
    playSfx('notify');
  }

  function publishUpdateAvailability(latestSha, reason = 'version') {
    const safeLatest = String(latestSha || latestBuildShaRef.current || '').trim();
    setUpdateState((prev) => {
      if (prev.applying) return prev;
      return {
        available: true,
        latestSha: safeLatest || prev.latestSha || '',
        applying: false,
        reason
      };
    });
  }

  async function ensureSwRegistration() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    if (swRegRef.current) return swRegRef.current;
    const existing = await navigator.serviceWorker.getRegistration('/sw.js').catch(() => null);
    if (existing) swRegRef.current = existing;
    return existing;
  }

  async function cleanupLegacyServiceWorkersForMobile() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (!isLikelyMobileWeb()) return;
    if (mobileSwCleanupDoneRef.current) return;

    const runningSha = String(runningBuildShaRef.current || '').trim();
    let cleanupMarker = '';
    try {
      cleanupMarker = String(window.localStorage.getItem(MOBILE_SW_CLEANUP_STORAGE_KEY) || '').trim();
    } catch {
      cleanupMarker = '';
    }

    if (runningSha && cleanupMarker === runningSha) {
      mobileSwCleanupDoneRef.current = true;
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    await Promise.all(registrations.map((registration) => registration.unregister().catch(() => null)));
    swRegRef.current = null;
    waitingWorkerRef.current = null;

    if ('caches' in window) {
      const keys = await caches.keys().catch(() => []);
      await Promise.all(keys.map((key) => caches.delete(key).catch(() => null)));
    }

    mobileSwCleanupDoneRef.current = true;
    try {
      window.localStorage.setItem(MOBILE_SW_CLEANUP_STORAGE_KEY, runningSha || String(Date.now()));
    } catch {
      // ignore local storage write failure
    }
  }

  async function fetchLatestBuildVersion() {
    try {
      const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return null;
      const data = await response.json();
      const sha = String(data?.sha || '').trim();
      return sha || null;
    } catch {
      return null;
    }
  }

  async function checkForDeployUpdate() {
    if (updateCheckBusyRef.current) return;
    updateCheckBusyRef.current = true;
    try {
      const registration = await ensureSwRegistration();
      let hasWaitingWorker = false;

      if (registration) {
        swRegRef.current = registration;
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          hasWaitingWorker = true;
        } else {
          waitingWorkerRef.current = null;
        }

        await registration.update().catch(() => null);

        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          hasWaitingWorker = true;
        }
      }

      const latestSha = await fetchLatestBuildVersion();
      const runningSha = String(runningBuildShaRef.current || '').trim();
      if (latestSha) latestBuildShaRef.current = latestSha;

      if (hasWaitingWorker) {
        publishUpdateAvailability(latestSha || latestBuildShaRef.current, 'worker');
        return;
      }

      if (!latestSha) return;

      if (!runningSha) {
        publishUpdateAvailability(latestSha, 'version_recovery');
        return;
      }

      if (latestSha === runningSha) {
        setUpdateState((prev) => (prev.available && !prev.applying
          ? {
            available: false,
            latestSha: '',
            applying: false,
            reason: ''
          }
          : prev));
        return;
      }

      publishUpdateAvailability(latestSha, 'version');
    } finally {
      updateCheckBusyRef.current = false;
    }
  }

  async function waitForServiceWorkerControl(timeoutMs = 4200) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
    return new Promise((resolve) => {
      let done = false;
      const finish = (result) => {
        if (done) return;
        done = true;
        resolve(Boolean(result));
      };
      const onChange = () => finish(true);
      navigator.serviceWorker.addEventListener('controllerchange', onChange, { once: true });
      setTimeout(() => finish(false), timeoutMs);
    });
  }

  async function applyPendingUpdate() {
    if (updateState.applying) return;
    setUpdateState((prev) => ({ ...prev, applying: true }));

    try {
      const registration = await ensureSwRegistration();
      if (registration) {
        swRegRef.current = registration;
        await registration.update().catch(() => null);

        const waiting = registration.waiting || waitingWorkerRef.current;
        if (waiting) {
          waitingWorkerRef.current = waiting;
          waiting.postMessage({ type: 'SKIP_WAITING' });
          await waitForServiceWorkerControl(4200).catch(() => null);
        }
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
        await Promise.all(registrations.map((reg) => reg.update().catch(() => null)));
        registrations.forEach((reg) => {
          if (reg.waiting) {
            try {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            } catch {
              // ignore stale waiting worker message failures
            }
          }
        });
        await waitForServiceWorkerControl(2600).catch(() => null);
        await Promise.all(registrations.map((reg) => reg.unregister().catch(() => null)));
        swRegRef.current = null;
        waitingWorkerRef.current = null;
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key).catch(() => null)));
      }

      const stampSource = String(updateState.latestSha || latestBuildShaRef.current || Date.now());
      const stamp = stampSource.slice(0, 12);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('swv', `${stamp}-${Date.now()}`);
      nextUrl.searchParams.set('v', stamp);
      nextUrl.searchParams.set('app_update', `${stamp}-${Date.now()}`);
      window.location.replace(nextUrl.toString());
    } catch (error) {
      console.error('update apply failed:', error);
      showToast('Nao foi possivel aplicar a atualizacao agora.');
      setUpdateState((prev) => ({ ...prev, applying: false }));
    }
  }

  useEffect(() => {
    const runningFromMeta = typeof window !== 'undefined'
      ? String(window.__CODEQUIZ_BUILD_SHA || '').trim()
      : '';
    if (runningFromMeta) runningBuildShaRef.current = runningFromMeta;
    const runningBuiltAt = typeof window !== 'undefined'
      ? String(window.__CODEQUIZ_BUILT_AT || '').trim()
      : '';
    setBuildBadgeValue(formatBuildBadgeValue(runningFromMeta, runningBuiltAt));

    let cancelled = false;
    const bootTimers = [];
    let periodicTimer = null;

    function inspectWaitingWorker(registration) {
      if (!registration?.waiting) return false;
      waitingWorkerRef.current = registration.waiting;
      publishUpdateAvailability(latestBuildShaRef.current, 'worker');
      return true;
    }

    function bindRegistrationEvents(registration) {
      if (!registration) return;
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            inspectWaitingWorker(registration);
            checkForDeployUpdate().catch(() => null);
          }
        });
      });
    }

    async function startUpdater() {
      const isMobileWeb = isLikelyMobileWeb();
      if (isMobileWeb) {
        await cleanupLegacyServiceWorkersForMobile().catch(() => null);
      } else if ('serviceWorker' in navigator && typeof window !== 'undefined') {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
          if (!cancelled) {
            swRegRef.current = registration;
            bindRegistrationEvents(registration);
            inspectWaitingWorker(registration);
          }
        } catch {
          // ignore sw registration failures
        }
      }

      checkForDeployUpdate().catch(() => null);
      QUICK_BOOT_CHECKS_MS.forEach((delay) => {
        const timer = setTimeout(() => checkForDeployUpdate().catch(() => null), delay);
        bootTimers.push(timer);
      });
      periodicTimer = setInterval(() => checkForDeployUpdate().catch(() => null), VERSION_CHECK_MS);
    }

    const onFocus = () => checkForDeployUpdate().catch(() => null);
    const onOnline = () => checkForDeployUpdate().catch(() => null);
    const onPageShow = () => checkForDeployUpdate().catch(() => null);
    const onControllerChange = () => checkForDeployUpdate().catch(() => null);
    const onWorkerMessage = (event) => {
      if (event?.data?.type === 'SW_ACTIVATED') {
        checkForDeployUpdate().catch(() => null);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForDeployUpdate().catch(() => null);
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.addEventListener('message', onWorkerMessage);
    }

    startUpdater().catch(() => null);

    return () => {
      cancelled = true;
      bootTimers.forEach((timer) => clearTimeout(timer));
      if (periodicTimer) clearInterval(periodicTimer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        navigator.serviceWorker.removeEventListener('message', onWorkerMessage);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLikelyMobileWeb()) return;
    if (!updateState.available || updateState.applying) return;

    const currentPvpStatus = String(pvpState.status || '').trim().toLowerCase();
    const busyInMatchFlow = (
      currentPvpStatus === 'queueing'
      || currentPvpStatus === 'pending_accept'
      || currentPvpStatus === 'active'
      || queueActionBusy
      || matchAcceptBusy
    );

    if (busyInMatchFlow) return;

    const latestStamp = String(updateState.latestSha || latestBuildShaRef.current || '').trim() || 'latest';
    try {
      const appliedRaw = String(window.localStorage.getItem(MOBILE_AUTO_UPDATE_APPLIED_KEY) || '').trim();
      if (appliedRaw) {
        const [appliedSha = '', appliedMsRaw = '0'] = appliedRaw.split('|');
        const appliedMs = Math.max(0, Number(appliedMsRaw || 0));
        if (appliedSha === latestStamp && Date.now() - appliedMs < MOBILE_AUTO_UPDATE_MIN_RETRY_MS) {
          return;
        }
      }
    } catch {
      // ignore local storage read failure
    }

    const reloadKey = `${latestStamp}|${screen}|${currentPvpStatus}`;
    if (mobileAutoUpdateKeyRef.current === reloadKey) return;
    mobileAutoUpdateKeyRef.current = reloadKey;

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(MOBILE_AUTO_UPDATE_APPLIED_KEY, `${latestStamp}|${Date.now()}`);
      } catch {
        // ignore local storage write failure
      }
      applyPendingUpdate().catch(() => null);
    }, 720);

    return () => window.clearTimeout(timer);
  }, [
    updateState.available,
    updateState.applying,
    updateState.latestSha,
    screen,
    pvpState.status,
    queueActionBusy,
    matchAcceptBusy
  ]);

  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      const ctx = ensureAudioContext();
      if (!ctx) return;
      bootstrapMusicIfNeeded(isBattleMusicScreen ? 'battle' : 'menu');
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [isBattleMusicScreen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const state = {
      tracking: false,
      blocked: false,
      startX: 0,
      startY: 0,
      startAtMs: 0,
      movedX: 0,
      movedY: 0
    };

    const EDGE_PX = 22;
    const MIN_SWIPE_X = 74;
    const MAX_SWIPE_Y = 72;
    const MAX_DURATION_MS = 720;

    const isIgnoredTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
      if (target.closest('.vol-slider, .pvp-emoji-editor-list, .shop-grid, .topic-list, .difficulty-list')) return true;
      return false;
    };

    const onTouchStart = (event) => {
      if (!event.touches || event.touches.length !== 1) return;
      const touch = event.touches[0];
      state.tracking = touch.clientX <= EDGE_PX && !isIgnoredTarget(event.target);
      state.blocked = false;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.startAtMs = Date.now();
      state.movedX = 0;
      state.movedY = 0;
    };

    const onTouchMove = (event) => {
      if (!state.tracking || !event.touches || !event.touches.length) return;
      const touch = event.touches[0];
      state.movedX = touch.clientX - state.startX;
      state.movedY = touch.clientY - state.startY;

      const absY = Math.abs(state.movedY);
      if (absY > MAX_SWIPE_Y) {
        state.tracking = false;
        return;
      }
      if (state.movedX > 8 && absY < MAX_SWIPE_Y) {
        state.blocked = true;
        event.preventDefault();
      }
    };

    const finishGesture = (isCancel = false) => {
      const durationMs = Date.now() - state.startAtMs;
      const absY = Math.abs(state.movedY);
      const shouldTrigger = !isCancel
        && state.tracking
        && state.movedX >= MIN_SWIPE_X
        && absY <= MAX_SWIPE_Y
        && durationMs <= MAX_DURATION_MS;
      state.tracking = false;
      if (!shouldTrigger) return;
      triggerAppBackNavigation('gesture');
      playSfx('click');
    };

    const onTouchEnd = (event) => {
      if (state.blocked) event.preventDefault();
      finishGesture(false);
    };
    const onTouchCancel = () => finishGesture(true);

    const historyMarker = '__codequiz_internal_nav__';
    if (!window.history.state || !window.history.state[historyMarker]) {
      window.history.replaceState({ ...(window.history.state || {}), [historyMarker]: Date.now() }, '');
    }

    const onPopState = () => {
      const handled = triggerAppBackNavigation('browser');
      if (handled) {
        window.history.pushState({ ...(window.history.state || {}), [historyMarker]: Date.now() }, '');
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
      window.removeEventListener('popstate', onPopState);
    };
  }, [screen, pvpEmojiPickerOpen, quizMenuOpen, adminAuthOpen]);

  useEffect(() => {
    const sfxBus = sfxGainRef.current;
    if (sfxBus && audioContextRef.current) {
      sfxBus.gain.setValueAtTime(
        audioSettings.sfxEnabled ? getSfxVolumeLevel(audioSettings.sfxVolume) : 0,
        audioContextRef.current.currentTime
      );
    }

    if (!audioSettings.musicEnabled) {
      clearMusicLoop();
      setMusicGain(0, 220);
      return;
    }

    applyMusicMode(isBattleMusicScreen ? 'battle' : 'menu');
  }, [audioSettings, isBattleMusicScreen]);

  useEffect(() => {
    if (!audioSettings.musicEnabled) return;
    startMusicLoop(musicModeRef.current);
    const nextVolume = getMusicVolumeLevel(audioSettings.musicVolume);
    setMusicGain(nextVolume, 320);
  }, [menuTrackIndex, battleTrackIndex, audioSettings.musicEnabled]);

  useEffect(() => {
    return () => {
      clearBotAnswerTimer();
      clearBotReactionTimers();
      clearMusicLoop();
      clearRewardSfxTimers();
      if (rewardFxTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(rewardFxTimeoutRef.current);
        rewardFxTimeoutRef.current = null;
      }
      const ctx = audioContextRef.current;
      if (ctx) {
        ctx.close().catch(() => null);
      }
    };
  }, []);

  function showToast(message) {
    if (!message) return;
    setToast(String(message));
  }

  function openPvpEmojiPicker() {
    const nextDraft = normalizeEmojiDraftSlots(pvpBattleEmojis);
    setPvpEmojiDraft(nextDraft);
    setPvpEmojiDraftWarning('');
    setPvpEmojiSlotFocus(getNextEmptyEmojiSlot(nextDraft));
    setPvpEmojiPickerOpen(true);
  }

  function closePvpEmojiPicker() {
    setPvpEmojiDraftWarning('');
    setPvpEmojiPickerOpen(false);
  }

  function togglePvpEmojiDraft(emoji) {
    const safe = String(emoji || '').trim();
    if (!safe) return;
    setPvpEmojiDraftWarning('');
    const current = normalizeEmojiDraftSlots(pvpEmojiDraft);
    const next = applyEmojiToDraft(current, safe, pvpEmojiSlotFocus);
    setPvpEmojiDraft(next);
    setPvpEmojiSlotFocus(Math.min(5, getNextEmptyEmojiSlot(next)));
  }

  function selectPvpEmojiSlot(index) {
    const safeIndex = Math.max(0, Math.min(5, Number(index || 0)));
    setPvpEmojiSlotFocus(safeIndex);
  }

  function removePvpEmojiAt(index) {
    setPvpEmojiDraftWarning('');
    const next = removeEmojiFromDraftByIndex(pvpEmojiDraft, index);
    setPvpEmojiDraft(next);
    setPvpEmojiSlotFocus(Math.max(0, Math.min(5, Number(index || 0))));
  }

  function savePvpEmojiDraft() {
    const draftSlots = normalizeEmojiDraftSlots(pvpEmojiDraft);
    const missingSlots = getMissingEmojiSlotIndexes(draftSlots);
    if (missingSlots.length) {
      const slotsLabel = missingSlots.join(', ');
      const warning = missingSlots.length === 1
        ? `Selecione o emoji do slot ${slotsLabel} para salvar.`
        : `Selecione os emojis dos slots ${slotsLabel} para salvar.`;
      setPvpEmojiDraftWarning(warning);
      showToast(`Preencha os 6 emojis antes de salvar. Faltando: ${slotsLabel}.`);
      playSfx('error');
      return;
    }
    const next = draftSlots.map((emoji) => String(emoji || '').trim()).filter((emoji) => !!emoji);
    setPvpBattleEmojis(next);
    setPvpEmojiPickerOpen(false);
    setPvpEmojiDraftWarning('');
    showToast('Emojis da partida atualizados.');
    playSfx('success');
  }

  function clearBotAnswerTimer() {
    if (botAnswerTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(botAnswerTimerRef.current);
    }
    botAnswerTimerRef.current = null;
    botAnswerRoundKeyRef.current = '';
  }

  function clearPvpRoundResultFeedbackTimer(resetKey = false) {
    if (pvpRoundResultFeedbackTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(pvpRoundResultFeedbackTimerRef.current);
    }
    pvpRoundResultFeedbackTimerRef.current = null;
    if (resetKey) {
      pvpRoundResultFeedbackKeyRef.current = '';
    }
  }

  function clearPvpResultAudioTimers(resetKey = false) {
    if (typeof window !== 'undefined') {
      pvpResultAudioTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
    pvpResultAudioTimersRef.current = [];
    if (resetKey) {
      pvpResultAudioKeyRef.current = '';
    }
  }

  function clearBotReactionTimers() {
    if (typeof window !== 'undefined') {
      botReactionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
    botReactionTimersRef.current = [];
  }

  function rememberPvpEmojiEventId(eventId) {
    const safeEventId = String(eventId || '').trim();
    if (!safeEventId) return false;
    if (pvpSeenEmojiEventIdsRef.current.has(safeEventId)) return false;
    pvpSeenEmojiEventIdsRef.current.add(safeEventId);
    pvpSeenEmojiEventOrderRef.current.push(safeEventId);
    if (pvpSeenEmojiEventOrderRef.current.length > 320) {
      const overflow = pvpSeenEmojiEventOrderRef.current.splice(0, pvpSeenEmojiEventOrderRef.current.length - 240);
      overflow.forEach((id) => pvpSeenEmojiEventIdsRef.current.delete(id));
    }
    return true;
  }

  function addPvpEmojiFxFromEvent(event) {
    const safeEvent = event && typeof event === 'object' ? event : {};
    const eventId = String(safeEvent.id || '').trim();
    if (!rememberPvpEmojiEventId(eventId)) return;
    const senderId = String(safeEvent.sender_user_id || '').trim();
    const emoji = String(safeEvent.emoji || '').trim() || '💬';
    const side = senderId && senderId === String(pvpStateRef.current?.match?.player1_user_id || '').trim()
      ? 'left'
      : 'right';
    const fxId = `pvp_emoji_${eventId}`;
    setPvpEmojiFx((prev) => [...prev, { id: fxId, emoji, side }]);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setPvpEmojiFx((prev) => prev.filter((item) => item.id !== fxId));
      }, 1350);
    }
    setLatestPvpEmojiEvent({
      id: eventId,
      sender_user_id: senderId,
      emoji,
      sent_at_ms: Math.max(0, Number(safeEvent.sent_at_ms || Date.now()))
    });
  }

  async function processPvpEmojiSendQueue() {
    if (pvpEmojiSendBusyRef.current) return;
    pvpEmojiSendBusyRef.current = true;
    try {
      while (pvpEmojiSendQueueRef.current.length) {
        const nextEvent = pvpEmojiSendQueueRef.current.shift();
        if (!nextEvent || typeof nextEvent !== 'object') continue;
        const safeMatchId = String(nextEvent.matchId || '').trim();
        const safeSenderId = String(nextEvent.senderUserId || '').trim();
        const safeEmoji = String(nextEvent.emoji || '').trim();
        if (!safeMatchId || !safeSenderId || !safeEmoji) continue;

        const current = pvpStateRef.current;
        const currentMatchId = String(current?.match?.id || current?.matchId || '').trim();
        const currentStatus = String(current?.status || '').trim().toLowerCase();
        if (
          currentMatchId !== safeMatchId
          || (currentStatus !== 'active' && currentStatus !== 'round_result' && currentStatus !== 'pending_accept')
        ) {
          continue;
        }

        const nowMs = Math.max(1, Number(nextEvent.sentAtMs || Date.now()));
        await pushPvpEmojiEvent(safeMatchId, {
          id: String(nextEvent.eventId || '').trim(),
          sender_user_id: safeSenderId,
          emoji: safeEmoji,
          sent_at_ms: nowMs,
          sent_at: new Date(nowMs).toISOString(),
          created_at: new Date(nowMs).toISOString()
        }).catch((error) => {
          console.error('push emoji event failed:', error);
        });

        pvpEmojiSendCountRef.current += 1;
        if (pvpEmojiSendCountRef.current % 2 === 0 && typeof window !== 'undefined') {
          await new Promise((resolve) => window.setTimeout(resolve, 180));
        }
      }
    } finally {
      pvpEmojiSendBusyRef.current = false;
    }
  }

  function queuePvpEmojiSend(matchId, senderUserId, emoji, eventId = '') {
    const safeMatchId = String(matchId || '').trim();
    const safeSenderId = String(senderUserId || '').trim();
    const safeEmoji = String(emoji || '').trim();
    if (!safeMatchId || !safeSenderId || !safeEmoji) return;
    pvpEmojiSendQueueRef.current.push({
      matchId: safeMatchId,
      senderUserId: safeSenderId,
      emoji: safeEmoji,
      eventId: String(eventId || '').trim() || `${safeSenderId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      sentAtMs: Date.now()
    });
    processPvpEmojiSendQueue().catch(() => null);
  }

  function queueBotEmojiBurst({
    matchId = '',
    botUserId = '',
    personality = 'provocador',
    countMin = 1,
    countMax = 2,
    intervalMinMs = 1000,
    intervalMaxMs = 2000,
    initialDelayMs = 0
  }) {
    const safeMatchId = String(matchId || '').trim();
    const safeBotUserId = String(botUserId || '').trim();
    if (!safeMatchId || typeof window === 'undefined') return;
    const pool = getBotEmojiPool(personality, safeBotUserId);
    if (!pool.length) return;

    const total = Math.max(1, Math.floor(countMin + Math.random() * (Math.max(countMin, countMax) - countMin + 1)));
    let delay = Math.max(0, Number(initialDelayMs || 0));

    for (let index = 0; index < total; index += 1) {
      const timerId = window.setTimeout(async () => {
        const current = pvpStateRef.current;
        const currentMatch = current?.match;
        if (!currentMatch || String(currentMatch.id || '') !== safeMatchId) return;
        const status = String(currentMatch.status || '').toLowerCase();
        if (status !== 'active' && status !== 'round_result') return;
        const botIdFromMatch = getMatchBotUserId(currentMatch);
        const eventBotUserId = safeBotUserId || botIdFromMatch || SYSTEM_BOT_ID;
        if (!isSystemBotUserId(eventBotUserId)) return;

        const emoji = pool[Math.floor(Math.random() * pool.length)];
        const eventId = `${eventBotUserId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        queuePvpEmojiSend(safeMatchId, eventBotUserId, emoji, eventId);
      }, delay);
      botReactionTimersRef.current.push(timerId);
      const stepMin = Math.max(200, Number(intervalMinMs || 1000));
      const stepMax = Math.max(stepMin, Number(intervalMaxMs || 2000));
      delay += Math.round(stepMin + Math.random() * (stepMax - stepMin));
    }
  }

  function resetQuizFlow() {
    setQuizState(null);
    setQuizMenuOpen(false);
    setFeedbackState(null);
    setResultState(null);
    setRewardCollecting(false);
    setRewardFxParticles([]);
    setQuizRankingRows([]);
    setQuizRankingLoading(false);
  }

  function resetPvpState() {
    clearBotAnswerTimer();
    clearBotReactionTimers();
    clearPvpResultAudioTimers(true);
    botReactionUserEmojiEventRef.current = '';
    botReactionRoundResultRef.current = '';
    botReactionFirstAnswerRef.current = '';
    pvpRoundPhaseSfxKeyRef.current = '';
    pvpRoundResultSfxKeyRef.current = '';
    pvpTimerSfxRef.current = {
      roundKey: '',
      warningPlayed: false,
      criticalPlayed: false,
      timeoutPlayed: false,
      tickSecond: -1
    };
    setQueueActionBusy(false);
    setMatchAcceptBusy(false);
    setPvpCompensation(null);
    setPvpResultTransitionMode('');
    setPvpResultReward(null);
    setPvpRewardCollecting(false);
    setRewardFxParticles([]);
    setPvpEmojiFx([]);
    setLatestPvpEmojiEvent(null);
    setPvpEmojiCooldownUntilMs(0);
    pvpSeenEmojiEventIdsRef.current = new Set();
    pvpSeenEmojiEventOrderRef.current = [];
    pvpEmojiSendQueueRef.current = [];
    pvpEmojiSendBusyRef.current = false;
    pvpEmojiSendCountRef.current = 0;
    pvpEmojiSpamWindowRef.current = [];
    pvpEmojiCooldownUntilRef.current = 0;
    pvpRealtimeMatchUpdateAtRef.current = 0;
    pvpRealtimeAnswersUpdateAtRef.current = 0;
    setQueueBotExclusion('', 0);
    queueSessionStartMsRef.current = 0;
    queueSessionIdRef.current = '';
    clearPreparedBot();
    clearPvpQueueResumeSnapshot();
    setPvpState({
      status: 'idle',
      queueJoinedAtMs: 0,
      queueBotMatchAtMs: 0,
      queueResumeMode: '',
      matchId: '',
      match: null,
      answers: [],
      roundStartMs: 0,
      submitted: false,
      selectedIndex: null,
      error: '',
      result: null
    });
  }

  function triggerAppBackNavigation(source = 'button') {
    const safeSource = String(source || 'button').toLowerCase();

    if (pvpEmojiPickerOpen) {
      closePvpEmojiPicker();
      return true;
    }
    if (quizMenuOpen) {
      closeQuizMenu();
      return true;
    }
    if (adminAuthOpen) {
      closeAdminAuthModal();
      return true;
    }

    if (screen === 'pvp' || screen === 'challenge') {
      leavePvpFlow();
      return true;
    }
    if (screen === 'pvp-result') {
      if (pvpResultReward || pvpCompensation || pvpRewardCollecting || pvpResultTransitionMode === 'opponent_left') {
        showToast('Colete as recompensas para encerrar a partida.');
        return true;
      }
      setScreen('home');
      return true;
    }

    if (screen === 'quiz') {
      openQuizMenu();
      return true;
    }

    if (screen === 'settings' || screen === 'rankings' || screen === 'achievements' || screen === 'shop') {
      setScreen('home');
      return true;
    }
    if (screen === 'play-mode') {
      setScreen('home');
      return true;
    }
    if (screen === 'select') {
      setScreen('play-mode');
      return true;
    }
    if (screen === 'topic') {
      setScreen('select');
      return true;
    }
    if (screen === 'difficulty') {
      setScreen('topic');
      return true;
    }
    if (screen === 'result' || screen === 'feedback') {
      setScreen('home');
      return true;
    }
    if (screen === 'admin-live' || screen === 'admin-history') {
      setScreen('admin-monitor');
      return true;
    }
    if (screen === 'admin-monitor') {
      setScreen('home');
      return true;
    }

    if (safeSource === 'gesture' || safeSource === 'browser') {
      return false;
    }
    return false;
  }

  function beginPveRound(difficulty) {
    if (!selectedLanguage || !selectedTopic) {
      showToast('Escolha tema e topico primeiro.');
      return;
    }

    const safeDifficulty = normalizeDifficulty(difficulty);
    const questions = pickRoundQuestions(
      QUESTIONS,
      selectedLanguage,
      selectedTopic,
      safeDifficulty,
      QUESTIONS_PER_ROUND
    );

    if (!questions.length) {
      showToast('Nao ha perguntas para essa combinacao.');
      return;
    }

    setQuizState({
      language: selectedLanguage,
      topic: selectedTopic,
      difficulty: safeDifficulty,
      questions,
      index: 0,
      score: 0,
      correctCount: 0,
      streak: 0,
      bestRunStreak: 0,
      lives: 3,
      answered: false,
      selectedIndex: null,
      questionStartedAtMs: Date.now(),
      timeLeft: TIMER_SECONDS[safeDifficulty] || TIMER_SECONDS.easy
    });
    setFeedbackState(null);
    setResultState(null);
    setRewardCollecting(false);
    setRewardFxParticles([]);
    setQuizRankingRows([]);
    setQuizMenuOpen(false);
    setScreen('quiz');
  }

  function openQuizMenu() {
    if (!quizState || screen !== 'quiz') return;
    setQuizMenuOpen(true);
  }

  function closeQuizMenu() {
    setQuizMenuOpen(false);
  }

  function restartCurrentQuiz() {
    if (!quizState) return;
    setQuizMenuOpen(false);
    beginPveRound(quizState.difficulty || 'easy');
  }

  function chooseAnotherQuiz() {
    setQuizMenuOpen(false);
    resetQuizFlow();
    setScreen('select');
  }

  function returnQuizToHome() {
    setQuizMenuOpen(false);
    resetQuizFlow();
    setScreen('home');
  }

  function handleAnswer(index) {
    setQuizState((prev) => {
      if (!prev || prev.answered) return prev;
      return {
        ...prev,
        selectedIndex: Number(index)
      };
    });
    playSfx('notify');
  }

  function confirmQuizAnswer() {
    if (!quizState || quizState.answered) return;
    const selected = Number(quizState.selectedIndex ?? -1);
    if (!Number.isFinite(selected) || selected < 0) {
      showToast('Selecione uma opcao para confirmar.');
      playSfx('error');
      return;
    }

    setQuizState((prev) => {
      if (!prev || prev.answered) return prev;
      const question = prev.questions[prev.index];
      if (!question) return prev;
      const pickedIndex = Number(prev.selectedIndex ?? -1);
      if (!Number.isFinite(pickedIndex) || pickedIndex < 0) return prev;

      const correct = Number(pickedIndex) === Number(question.answer);
      const streak = correct ? prev.streak + 1 : 0;
      const lives = correct ? prev.lives : Math.max(0, prev.lives - 1);

      const next = {
        ...prev,
        answered: true,
        selectedIndex: pickedIndex,
        streak,
        bestRunStreak: Math.max(prev.bestRunStreak, streak),
        correctCount: correct ? prev.correctCount + 1 : prev.correctCount,
        score: correct ? prev.score + 1 : prev.score,
        lives
      };

      setFeedbackState({
        isCorrect: correct,
        isTimeout: false,
        selectedIndex: pickedIndex,
        question
      });
      playSfx(correct ? 'success' : 'error');
      setScreen('feedback');
      return next;
    });
  }

  function handleTimeout() {
    setQuizState((prev) => {
      if (!prev || prev.answered) return prev;
      const question = prev.questions[prev.index];
      if (!question) return prev;

      const next = {
        ...prev,
        answered: true,
        selectedIndex: -1,
        streak: 0,
        lives: Math.max(0, prev.lives - 1)
      };

      setFeedbackState({
        isCorrect: false,
        isTimeout: true,
        selectedIndex: -1,
        question
      });
      playSfx('error');
      setScreen('feedback');
      return next;
    });
  }

  async function finishRound(stateToFinish) {
    const totalQuestions = stateToFinish.questions.length;

    const outcome = applyQuizOutcome(progress, {
      language: stateToFinish.language,
      topic: stateToFinish.topic,
      difficulty: stateToFinish.difficulty,
      correctCount: stateToFinish.correctCount,
      totalQuestions,
      bestRunStreak: stateToFinish.bestRunStreak
    });

    const nextProgress = outcome.progress;
    setProgress(nextProgress);

    const result = {
      language: stateToFinish.language,
      topic: stateToFinish.topic,
      difficulty: stateToFinish.difficulty,
      correctCount: stateToFinish.correctCount,
      totalQuestions,
      score: stateToFinish.score,
      scorePct: outcome.summary.scorePct,
      awardedXp: outcome.summary.awardedXp,
      awardedCoins: outcome.summary.awardedCoins,
      rankingGain: outcome.summary.rankingGain,
      leveledUp: outcome.summary.leveledUp,
      newLevel: outcome.summary.newLevel,
      unlockedAchievements: outcome.unlockedAchievements,
      rewardsCollected: false
    };

    setRewardCollecting(false);
    setRewardFxParticles([]);
    setResultState(result);
    setScreen('result');

    if (authUser?.uid) {
      try {
        await Promise.all([
          upsertStatsFromProgress(authUser.uid, nextProgress),
          saveQuizResult(authUser.uid, {
            language: result.language,
            topic: result.topic,
            difficulty: result.difficulty,
            score_pct: result.scorePct,
            xp_earned: result.awardedXp,
            correct_count: result.correctCount,
            total_questions: result.totalQuestions,
            best_streak: stateToFinish.bestRunStreak
          })
        ]);

      } catch (error) {
        console.error('quiz sync failed:', error);
        showToast('Falha ao sincronizar resultado no servidor.');
      }
    }

    setQuizRankingLoading(true);
    try {
      const rows = await getQuizRankings(result.language, result.topic, result.difficulty, 20);
      setQuizRankingRows(rows);
    } catch {
      setQuizRankingRows([]);
    } finally {
      setQuizRankingLoading(false);
    }
  }

  async function nextQuestion() {
    if (!quizState) return;
    const nextIndex = quizState.index + 1;
    if (quizState.lives <= 0 || nextIndex >= quizState.questions.length) {
      await finishRound(quizState);
      return;
    }

    setQuizState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        index: prev.index + 1,
        answered: false,
        selectedIndex: null,
        questionStartedAtMs: Date.now(),
        timeLeft: TIMER_SECONDS[prev.difficulty] || TIMER_SECONDS.easy
      };
    });

    setFeedbackState(null);
    setScreen('quiz');
  }

  async function handleSignIn() {
    if (googleSignInBusy) return;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(AUTH_REDIRECT_PENDING_KEY);
      } catch {
        // ignore storage failures
      }
    }

    googleSignInRef.current = true;
    setGoogleSignInBusy(true);
    setAuthTransition({
      visible: true,
      title: 'Conectando ao Google',
      subtitle: 'Conclua o login na janela aberta para continuar.'
    });

    try {
      await withTimeout(signInWithPopup(firebaseAuth, googleProvider), AUTH_POPUP_TIMEOUT_MS, 'signInWithPopup');
      setAuthTransition({
        visible: true,
        title: 'Redirecionando para sua conta',
        subtitle: 'Estamos preparando o seu perfil...'
      });
    } catch (error) {
      const code = String(error?.code || '').trim().toLowerCase();
      const label = String(error?.label || '').trim().toLowerCase();
      const userClosedPopup = code.includes('popup-closed-by-user');
      const popupIssue = (
        (code === 'app/timeout' && label === 'signinwithpopup')
        || code.includes('popup-blocked')
        || code.includes('cancelled-popup-request')
        || code.includes('web-storage-unsupported')
        || code.includes('operation-not-supported')
        || code.includes('network-request-failed')
      );
      const shouldFallbackToRedirect = !userClosedPopup && popupIssue;

      if (shouldFallbackToRedirect && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(AUTH_REDIRECT_PENDING_KEY, '1');
        } catch {
          // ignore storage failures
        }
        setAuthTransition({
          visible: true,
          title: 'Abrindo login seguro',
          subtitle: 'Voce sera redirecionado e retornara automaticamente.'
        });

        try {
          await signInWithRedirect(firebaseAuth, googleProvider);
          return;
        } catch (redirectError) {
          console.error('redirect sign in error:', redirectError);
          try {
            window.localStorage.removeItem(AUTH_REDIRECT_PENDING_KEY);
          } catch {
            // ignore storage failures
          }
        }
      } else {
        console.error('sign in error:', error);
      }

      googleSignInRef.current = false;
      setGoogleSignInBusy(false);
      setAuthTransition({ visible: false, title: '', subtitle: '' });
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(AUTH_REDIRECT_PENDING_KEY);
        } catch {
          // ignore storage failures
        }
      }
      if (userClosedPopup) {
        showToast('Login cancelado.');
      } else if (code.includes('popup-blocked')) {
        showToast('Popup bloqueado. Permita popups para continuar.');
      } else {
        showToast('Nao foi possivel entrar com Google.');
      }
      playSfx('error');
    }
  }

  async function handleSignOut() {
    try {
      if (activeAuthUser?.uid) {
        await markPresenceClosed(activeAuthUser.uid).catch(() => null);
        await leaveQueue(activeAuthUser.uid).catch(() => null);
      }
      await signOut(firebaseAuth);
      resetQuizFlow();
      resetPvpState();
      setAdminAuthorized(false);
      setAdminAuthOpen(false);
      setAdminPassword('');
      setAdminAuthError('');
      googleSignInRef.current = false;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(AUTH_REDIRECT_PENDING_KEY);
        } catch {
          // ignore storage failures
        }
      }
      setGoogleSignInBusy(false);
      setAuthTransition({ visible: false, title: '', subtitle: '' });
      showToast('Sessao encerrada.');
      setScreen('login');
      playSfx('notify');
    } catch (error) {
      console.error('sign out error:', error);
      showToast('Nao foi possivel sair.');
      playSfx('error');
    }
  }

  async function saveProfile() {
    if (!activeAuthUser?.uid) return;

    const nickname = String(profileDraft.nickname || '').trim();
    const validation = validateNicknameInput(nickname);
    if (!validation.ok) {
      showToast(validation.errorMessage);
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await updateUserProfile(activeAuthUser.uid, {
        nickname: validation.nickname,
        full_name: profileDraft.full_name,
        equipped_frame: shopData?.equipped?.frame,
        equipped_background: shopData?.equipped?.background,
        equipped_emoji: shopData?.equipped?.emoji
      });
      setProfile(updated);
      setProfileDraft({
        nickname: updated.nickname || validation.nickname,
        full_name: updated.full_name || ''
      });
      showToast('Perfil atualizado.');
      playSfx('success');
    } catch (error) {
      console.error('save profile error:', error);
      if (error?.code === 'nickname/taken') {
        showToast('Este apelido ja esta em uso.');
      } else if (String(error?.code || '').startsWith('nickname/')) {
        showToast(error?.message || NICKNAME_RULE_COPY);
      } else {
        showToast('Falha ao atualizar perfil.');
      }
      playSfx('error');
    } finally {
      setProfileSaving(false);
    }
  }

  function handleBuyShopItem(itemId) {
    const check = canPurchaseItem(shopData, itemId, progress.coins);
    if (!check.ok) {
      if (check.reason === 'already_owned') showToast('Voce ja possui esse item.');
      else if (check.reason === 'insufficient_coins') showToast('Moedas insuficientes.');
      else showToast('Nao foi possivel comprar o item.');
      playSfx('error');
      return;
    }

    const nextShop = purchaseItem(shopData, itemId);
    setShopData(nextShop);

    const price = Number(check.item?.price || 0);
    const nextProgress = normalizeProgress({
      ...progress,
      coins: Math.max(0, Number(progress.coins || 0) - price),
      updatedAt: Date.now()
    });
    setProgress(nextProgress);
    showToast(`Item comprado: ${check.item.name}`);
    playSfx('success');
  }

  async function handleEquipShopItem(itemId, options = {}) {
    const item = getShopItem(itemId);
    if (!item) return;
    const mode = String(options?.mode || 'equip').trim().toLowerCase() === 'unequip' ? 'unequip' : 'equip';
    const sourceItemName = String(options?.sourceItemName || '').trim();

    const nextShop = equipItem(shopData, itemId);
    setShopData(nextShop);

    if (!activeAuthUser?.uid) {
      const offlineMessage = mode === 'unequip'
        ? `Item desequipado${sourceItemName ? `: ${sourceItemName}` : '.'}`
        : `Item equipado: ${item.name}`;
      showToast(offlineMessage);
      playSfx('notify');
      return;
    }

    try {
      const updatedProfile = await updateUserProfile(activeAuthUser.uid, {
        equipped_frame: nextShop.equipped.frame,
        equipped_background: nextShop.equipped.background,
        equipped_emoji: nextShop.equipped.emoji
      });
      setProfile(updatedProfile);
      saveShopData(activeAuthUser.uid, nextShop);
      const syncMessage = mode === 'unequip'
        ? `Item desequipado${sourceItemName ? `: ${sourceItemName}` : '.'}`
        : `Item equipado: ${item.name}`;
      showToast(syncMessage);
      playSfx('success');
    } catch (error) {
      console.error('equip sync failed:', error);
      showToast('Falha ao sincronizar equipamento.');
      playSfx('notify');
    }
  }

  function handleToggleOwnedShopItem(item) {
    const safeItem = item && typeof item === 'object' ? item : null;
    if (!safeItem?.id || !safeItem?.type) return;
    const defaultByType = {
      frame: 'frame_default',
      background: 'bg_default',
      emoji: 'emoji_profile'
    };
    const currentEquippedId = String(shopData?.equipped?.[safeItem.type] || defaultByType[safeItem.type] || '');
    const isEquipped = currentEquippedId === safeItem.id;
    if (isEquipped && safeItem.isDefault) return;
    if (isEquipped) {
      const fallbackId = defaultByType[safeItem.type] || safeItem.id;
      handleEquipShopItem(fallbackId, { mode: 'unequip', sourceItemName: safeItem.name });
      return;
    }
    handleEquipShopItem(safeItem.id, { mode: 'equip' });
  }

  function openShopItemPreview(item) {
    const safeItem = item && typeof item === 'object' ? item : null;
    if (!safeItem?.id) return;
    setShopItemPreview(safeItem);
  }

  function closeShopItemPreview() {
    setShopItemPreview(null);
  }

  function toggleShopCategory(tab, rarity) {
    const safeTab = normalizeShopTab(tab);
    const safeRarity = String(rarity || '').trim();
    if (!safeRarity || !SHOP_RARITY_ORDER.includes(safeRarity)) return;
    setShopCategoryOpen((prev) => {
      const next = normalizeShopCategoryOpenState(prev);
      const tabState = next[safeTab] && typeof next[safeTab] === 'object'
        ? { ...next[safeTab] }
        : { ...SHOP_CATEGORY_OPEN_DEFAULT };
      tabState[safeRarity] = !Boolean(tabState[safeRarity]);
      next[safeTab] = tabState;
      return next;
    });
  }

  async function resumeQueueAfterMatchRefused(endedReason = 'match_refused', matchRow = null) {
    if (!authUser?.uid || !profile?.id) return false;
    if (queueActionBusy) return false;
    setQueueActionBusy(true);
    setQueueActionPhase('resume');
    setQueueActionHint('Voltando para a fila...');
    queueFlowLog('resume_queue_after_refused:start', {
      userId: authUser?.uid || '',
      endedReason,
      matchId: matchRow?.id || ''
    });

    const forcedDifficulty = getPvpQueueDifficultyFromProgress(progress);
    const safeConfig = ensureValidPvpConfig({
      ...pvpConfig,
      difficulty: forcedDifficulty
    });
    setPvpConfig(safeConfig);

    const nowMs = Date.now();
    queueCancelRequestedRef.current = false;
    const lastBotUserId = getMatchBotUserId(matchRow);
    if (lastBotUserId) {
      setQueueBotExclusion(lastBotUserId, 45000);
    }
    const resumeSnapshot = pvpQueueResumeRef.current && typeof pvpQueueResumeRef.current === 'object'
      ? pvpQueueResumeRef.current
      : { available: false, joinedAtMs: 0, botRemainingMs: 0, elapsedAtPauseMs: 0 };
    const elapsedAtPauseMs = Math.max(
      0,
      Number(
        (resumeSnapshot.available ? resumeSnapshot.elapsedAtPauseMs : 0)
        || 0
      )
    );
    const fallbackJoinedAtMs = Math.max(0, Number(pvpStateRef.current?.queueJoinedAtMs || 0));
    const joinedAtMs = elapsedAtPauseMs > 0
      ? Math.max(0, nowMs - elapsedAtPauseMs)
      : (fallbackJoinedAtMs > 0 ? Math.min(fallbackJoinedAtMs, nowMs) : nowMs);
    const botMatchAtMs = nowMs + getRandomBotMatchDelayMs(
      PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS,
      PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS
    );
    queueSessionStartMsRef.current = joinedAtMs;
    queueSessionIdRef.current = buildQueueSessionId(authUser?.uid || '', nowMs);
    clearPreparedBot();
    prepareBotForQueue(forcedDifficulty, 'resume_start', true).catch(() => null);

    try {
      await withTimeout(
        upsertQueueEntry({
          user_id: authUser.uid,
          nickname: profile.nickname || 'Jogador',
          avatar: profile.avatar || '🤓',
          level: Math.max(1, Number(progress.level || 1)),
          pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
          equipped_frame: shopData?.equipped?.frame || 'frame_default',
          equipped_background: shopData?.equipped?.background || 'bg_default',
          equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
          language: safeConfig.language,
          topic: safeConfig.topic,
          difficulty: forcedDifficulty,
          category: forcedDifficulty
        }),
        3600,
        'resume_upsert_queue'
      );

      setPvpState({
        status: 'queueing',
        queueJoinedAtMs: joinedAtMs,
        queueBotMatchAtMs: botMatchAtMs,
        queueResumeMode: PVP_QUEUE_RESUME_MODE_REFUSAL,
        matchId: '',
        match: null,
        answers: [],
        roundStartMs: 0,
        submitted: false,
        selectedIndex: null,
        error: '',
        result: null
      });
      setScreen('challenge');
      clearPvpQueueResumeSnapshot();

      const statusText = String(endedReason || '').trim().toLowerCase() === 'accept_timeout'
        ? 'Tempo de aceite esgotado. Voce voltou para a fila.'
        : 'Confronto recusado. Voce voltou para a fila.';
      showToast(statusText);
      playSfx('notify');
      queueFlowLog('resume_queue_after_refused:success', {
        userId: authUser?.uid || '',
        joinedAtMs,
        botMatchAtMs,
        forcedDifficulty,
        queueElapsedMs: Math.max(0, nowMs - joinedAtMs)
      });
      setQueueActionHint('');
      prepareBotForQueue(forcedDifficulty, 'resume_after_refused').catch(() => null);
      return true;
    } catch (error) {
      console.error('resume queue after refusal failed:', error);
      queueFlowLog('resume_queue_after_refused:error', {
        userId: authUser?.uid || '',
        message: String(error?.message || error || 'unknown_error')
      });
      setQueueActionHint('Falha ao voltar para a fila. Verifique a conexao.');
      clearPvpQueueResumeSnapshot();
      return false;
    } finally {
      setQueueActionBusy(false);
      setQueueActionPhase('');
    }
  }

  async function joinPvpQueue() {
    if (queueActionBusy) {
      setQueueActionHint('Sincronizando fila... aguarde um instante.');
      return;
    }
    setQueueActionBusy(true);
    setQueueActionPhase('join');
    setQueueActionHint('Entrando na fila...');
    queueFlowLog('join_queue:start', {
      userId: authUser?.uid || '',
      screen,
      currentStatus: pvpStateRef.current?.status || ''
    });
    if (!authUser?.uid || !profile?.id) {
      showToast('Entre com sua conta para jogar PVP.');
      setScreen('login');
      setQueueActionBusy(false);
      setQueueActionPhase('');
      setQueueActionHint('');
      return;
    }

    const forcedDifficulty = getPvpQueueDifficultyFromProgress(progress);
    const safeConfig = ensureValidPvpConfig({
      ...pvpConfig,
      difficulty: forcedDifficulty
    });
    setPvpConfig(safeConfig);
    queueCancelRequestedRef.current = false;

    const nowMs = Date.now();
    setQueueBotExclusion('', 0);
    queueSessionStartMsRef.current = nowMs;
    queueSessionIdRef.current = buildQueueSessionId(authUser?.uid || '', nowMs);
    clearPreparedBot();
    prepareBotForQueue(forcedDifficulty, 'join_start', true).catch(() => null);
    const botMatchAtMs = computeQueueBotMatchAtMs({
      nowMs,
      queueJoinedAtMs: nowMs,
      queueResumeMode: '',
      currentBotMatchAtMs: 0,
      minSeconds: PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS,
      maxSeconds: PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS
    });
    setPvpState({
      status: 'queueing',
      queueJoinedAtMs: nowMs,
      queueBotMatchAtMs: botMatchAtMs,
      queueResumeMode: '',
      matchId: '',
      match: null,
      answers: [],
      roundStartMs: 0,
      submitted: false,
      selectedIndex: null,
      error: '',
      result: null
    });
    clearPvpQueueResumeSnapshot();

    try {
      await withTimeout(
        upsertQueueEntry({
          user_id: authUser.uid,
          nickname: profile.nickname || 'Jogador',
          avatar: profile.avatar || '🤓',
          level: Math.max(1, Number(progress.level || 1)),
          pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
          equipped_frame: shopData?.equipped?.frame || 'frame_default',
          equipped_background: shopData?.equipped?.background || 'bg_default',
          equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
          language: safeConfig.language,
          topic: safeConfig.topic,
          difficulty: forcedDifficulty,
          category: forcedDifficulty
        }),
        3600,
        'join_upsert_queue'
      );
      if (queueCancelRequestedRef.current) {
        queueFlowLog('join_queue:cancelled_after_upsert', {
          userId: authUser.uid
        });
        await withTimeout(
          leaveQueue(authUser.uid).catch(() => null),
          3200,
          'join_rollback_leave_queue'
        ).catch(() => null);
        setPvpState((prev) => {
          if (String(prev?.status || '').trim().toLowerCase() !== 'queueing') return prev;
          return {
            ...prev,
            status: 'idle',
            queueJoinedAtMs: 0,
            queueBotMatchAtMs: 0,
            queueResumeMode: '',
            matchId: '',
            match: null,
            answers: [],
            roundStartMs: 0,
            submitted: false,
            selectedIndex: null,
            error: '',
            result: null
          };
        });
        setQueueActionHint('Entrada cancelada.');
        return;
      }
      queueFlowLog('join_queue:upsert_success', {
        userId: authUser.uid,
        forcedDifficulty,
        language: safeConfig.language,
        topic: safeConfig.topic,
        botMatchAtMs
      });
      prepareBotForQueue(forcedDifficulty, 'join_queue').catch(() => null);
      showToast('Entrou na fila PVP.');
      playSfx('success');
      setQueueActionHint('');
    } catch (error) {
      console.error('join queue failed:', error);
      queueFlowLog('join_queue:error', {
        userId: authUser?.uid || '',
        message: String(error?.message || error || 'unknown_error')
      });
      await leaveQueue(authUser.uid).catch(() => null);
      setPvpState((prev) => {
        if (String(prev?.status || '').trim().toLowerCase() !== 'queueing') return prev;
        return {
          ...prev,
          status: 'idle',
          queueJoinedAtMs: 0,
          queueBotMatchAtMs: 0,
          queueResumeMode: ''
        };
      });
      showToast('Nao foi possivel entrar na fila.');
      playSfx('error');
      setQueueActionHint('Falha ao entrar na fila. Verifique a conexao.');
    } finally {
      setQueueActionBusy(false);
      setQueueActionPhase('');
    }
  }

  async function cancelPvpQueue() {
    const wasBusy = queueActionBusy;
    setQueueActionBusy(true);
    setQueueActionPhase('cancel');
    setQueueActionHint('Saindo da fila...');
    queueCancelRequestedRef.current = true;
    if (wasBusy) {
      queueFlowLog('cancel_queue:override_busy', {
        userId: authUser?.uid || '',
        status: pvpStateRef.current?.status || ''
      });
    }
    queueSessionStartMsRef.current = 0;
    queueSessionIdRef.current = '';
    clearPreparedBot();
    clearPvpQueueResumeSnapshot();
    setPvpState((prev) => {
      const safeStatus = String(prev?.status || '').trim().toLowerCase();
      if (safeStatus !== 'queueing') return prev;
      return {
        ...prev,
        status: 'idle',
        queueJoinedAtMs: 0,
        queueBotMatchAtMs: 0,
        queueResumeMode: '',
        matchId: '',
        match: null,
        answers: [],
        roundStartMs: 0,
        submitted: false,
        selectedIndex: null,
        error: '',
        result: null
      };
    });
    queueFlowLog('cancel_queue:local_stop', {
      userId: authUser?.uid || ''
    });
    queueFlowLog('cancel_queue:start', {
      userId: authUser?.uid || '',
      status: pvpStateRef.current?.status || ''
    });
    try {
      if (authUser?.uid) {
        await withTimeout(
          leaveQueue(authUser.uid).catch(() => null),
          3200,
          'cancel_leave_queue'
        ).catch(() => null);
      }
      showToast('Fila cancelada.');
      playSfx('notify');
      queueFlowLog('cancel_queue:done', {
        userId: authUser?.uid || ''
      });
      setQueueActionHint('');
    } finally {
      setQueueActionBusy(false);
      setQueueActionPhase('');
    }
  }

  async function attachToMatch(matchId) {
    const safeMatchId = String(matchId || '').trim();
    if (!safeMatchId) return;
    if (attachingMatchRef.current === safeMatchId) return;

    const current = pvpStateRef.current;
    const currentMatchId = String(current?.matchId || '').trim();
    const currentStatus = String(current?.status || '').trim().toLowerCase();
	    if (currentStatus === 'queueing') {
	      const nowMs = Date.now();
	      const joinedAtMs = Math.max(0, Number(current?.queueJoinedAtMs || 0));
	      const botMatchAtMs = Math.max(0, Number(current?.queueBotMatchAtMs || 0));
        const elapsedAtPauseMs = joinedAtMs > 0 ? Math.max(0, nowMs - joinedAtMs) : 0;
	      pvpQueueResumeRef.current = {
	        available: joinedAtMs > 0,
	        joinedAtMs,
	        botRemainingMs: botMatchAtMs > 0 ? Math.max(0, botMatchAtMs - nowMs) : 0,
          elapsedAtPauseMs
	      };
	    }
    const alreadyAttached = currentMatchId === safeMatchId
      && (currentStatus === 'pending_accept' || currentStatus === 'active' || currentStatus === 'round_result');
    if (alreadyAttached) return;

    attachingMatchRef.current = safeMatchId;
    queueFlowLog('attach_match:start', {
      userId: authUser?.uid || '',
      matchId: safeMatchId,
      prevStatus: currentStatus
    });

    try {
      let latest = await withTimeout(
        getPvpMatch(safeMatchId).catch(() => null),
        2200,
        'attach_get_match'
      ).catch(() => null);
      if (!latest && authUser?.uid) {
        latest = await withTimeout(
          findOpenMatchForUser(authUser.uid).catch(() => null),
          2200,
          'attach_find_open_match'
        ).catch(() => null);
      }

      const matchStatus = String(latest?.status || '').trim().toLowerCase();
      if (
        !latest
        || (matchStatus !== 'pending_accept' && matchStatus !== 'active' && matchStatus !== 'round_result')
      ) {
        queueFlowLog('attach_match:deferred_missing_match', {
          userId: authUser?.uid || '',
          matchId: safeMatchId,
          status: matchStatus || ''
        });
        return;
      }

      const resolvedMatchId = String(latest?.id || safeMatchId).trim() || safeMatchId;
      const nextStatus = matchStatus === 'pending_accept'
        ? 'pending_accept'
        : (matchStatus === 'round_result' ? 'round_result' : 'active');

      if (authUser?.uid) {
        await leaveQueue(authUser.uid).catch(() => null);
      }

      setPvpState((prev) => ({
        ...prev,
        status: nextStatus,
        matchId: resolvedMatchId,
        match: latest || prev.match,
        queueJoinedAtMs: currentStatus === 'queueing'
          ? Math.max(0, Number(current?.queueJoinedAtMs || prev?.queueJoinedAtMs || 0))
          : 0,
        queueBotMatchAtMs: currentStatus === 'queueing'
          ? Math.max(0, Number(current?.queueBotMatchAtMs || prev?.queueBotMatchAtMs || 0))
          : 0,
        queueResumeMode: currentStatus === 'queueing'
          ? String(current?.queueResumeMode || prev?.queueResumeMode || '')
          : '',
        error: ''
      }));
      if (currentStatus === 'queueing') {
        queueSessionStartMsRef.current = 0;
        queueSessionIdRef.current = '';
        clearPreparedBot();
      }

      if (nextStatus === 'pending_accept') {
        setScreen('challenge');
      } else {
        setScreen('pvp');
      }
      queueFlowLog('attach_match:done', {
        userId: authUser?.uid || '',
        matchId: resolvedMatchId,
        nextStatus
      });
    } finally {
      if (attachingMatchRef.current === safeMatchId) {
        attachingMatchRef.current = '';
      }
    }
  }

  async function submitPvpAnswer(answerIndex) {
    const current = pvpStateRef.current;
    if (current.status !== 'active') return;
    if (!authUser?.uid) return;
    if (!current.match || String(current.match.status || '') !== 'active') return;
    if (current.submitted) return;

    const roundNo = Math.max(1, Number(current.match.round_no || 1));
    const question = current.match.question_set?.[roundNo - 1];
    if (!question) return;

    const safeIndex = Number.isFinite(Number(answerIndex)) ? Number(answerIndex) : -1;
    const isCorrect = safeIndex >= 0 && safeIndex === Number(question.answer);
    const nowMs = Date.now();

    try {
      await upsertPvpAnswer({
        match_id: current.matchId,
        round_no: roundNo,
        user_id: authUser.uid,
        answer_idx: safeIndex,
        is_correct: isCorrect,
        answered_at_ms: nowMs,
        answered_at: new Date(nowMs).toISOString(),
        created_at: new Date(nowMs).toISOString()
      });

      setPvpState((prev) => ({
        ...prev,
        submitted: true,
        selectedIndex: safeIndex
      }));
      playSfx(isCorrect ? 'pvp_correct' : 'pvp_wrong');
    } catch (error) {
      console.error('submit answer failed:', error);
      showToast('Falha ao enviar resposta.');
      playSfx('error');
    }
  }

  function pickPvpAnswer(index) {
    setPvpState((prev) => {
      if (!prev || prev.status !== 'active') return prev;
      if (prev.submitted) return prev;
      return {
        ...prev,
        selectedIndex: Number(index)
      };
    });
    playSfx('notify');
  }

  async function confirmPvpAnswer() {
    const current = pvpStateRef.current;
    if (!current || current.status !== 'active' || current.submitted) return;
    const selected = Number(current.selectedIndex ?? -1);
    if (!Number.isFinite(selected) || selected < 0) {
      showToast('Selecione uma opcao para confirmar.');
      playSfx('error');
      return;
    }
    playSfx('pvp_confirm');
    await submitPvpAnswer(selected);
  }

  async function sendPvpEmoji(emoji) {
    const safeEmoji = String(emoji || '').trim();
    if (!safeEmoji) return;
    const nowMs = Date.now();
    const cooldownUntilMs = Math.max(0, Number(pvpEmojiCooldownUntilRef.current || 0));
    if (cooldownUntilMs > nowMs) {
      playSfx('error');
      return;
    }
    const current = pvpStateRef.current;
    const match = current?.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (current.status !== 'active' && current.status !== 'round_result') return;

    const spamWindowStartMs = nowMs - PVP_EMOJI_SPAM_WINDOW_MS;
    const recentSends = Array.isArray(pvpEmojiSpamWindowRef.current)
      ? pvpEmojiSpamWindowRef.current.filter((stampMs) => Number(stampMs) >= spamWindowStartMs)
      : [];
    recentSends.push(nowMs);
    const triggerCooldown = recentSends.length >= PVP_EMOJI_SPAM_BURST_LIMIT;
    pvpEmojiSpamWindowRef.current = triggerCooldown ? [] : recentSends;

    const eventId = `${userId}_${nowMs}_${Math.floor(Math.random() * 10000)}`;
    const localFxId = `pvp_emoji_local_${eventId}`;
    const side = userId === String(match.player1_user_id || '').trim() ? 'left' : 'right';
    setPvpEmojiFx((prev) => [...prev, { id: localFxId, emoji: safeEmoji, side }]);
    rememberPvpEmojiEventId(eventId);
    setLatestPvpEmojiEvent({
      id: eventId,
      sender_user_id: userId,
      emoji: safeEmoji,
      sent_at_ms: Date.now()
    });
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setPvpEmojiFx((prev) => prev.filter((item) => item.id !== localFxId));
      }, 1200);
    }
    queuePvpEmojiSend(String(match.id), userId, safeEmoji, eventId);
    if (triggerCooldown) {
      const nextCooldownUntilMs = nowMs + PVP_EMOJI_SPAM_COOLDOWN_MS;
      pvpEmojiCooldownUntilRef.current = nextCooldownUntilMs;
      setPvpEmojiCooldownUntilMs(nextCooldownUntilMs);
    }
    playSfx('notify');
  }

  async function finalizePvpRound(roundNoInput) {
    if (finalizeRoundBusyRef.current) return;
    if (!authUser?.uid) return;

    const current = pvpStateRef.current;
    const match = current.match;
    if (!match || String(match.status || '') !== 'active') return;

    const roundNo = Math.max(1, Number(roundNoInput || match.round_no || 1));
    if (Number(match.round_no || 0) !== roundNo) return;

    finalizeRoundBusyRef.current = true;
    const lockAcquired = await tryAcquireRoundFinalizeLock(match.id, roundNo, authUser.uid, 7000).catch(() => false);
    if (!lockAcquired) {
      finalizeRoundBusyRef.current = false;
      return;
    }

    try {
      const latestMatch = await getPvpMatch(match.id);
      if (!latestMatch || String(latestMatch.status || '') !== 'active') return;
      if (Number(latestMatch.round_no || 0) !== roundNo) return;

      const player1Id = String(latestMatch.player1_user_id || '');
      const player2Id = String(latestMatch.player2_user_id || '');
      const playerIds = [player1Id, player2Id].filter(Boolean);
      if (playerIds.length < 2) return;

      const answers = await getPvpRoundAnswers(match.id, roundNo);
      const answersByUser = new Map(answers.map((answer) => [String(answer.user_id || ''), answer]));

      const question = latestMatch.question_set?.[roundNo - 1];
      if (!question) return;
      const fallbackAnsweredAt = Date.now();
      const answerPlayer1 = answersByUser.get(player1Id) || {
        user_id: player1Id,
        answer_idx: -1,
        is_correct: false,
        answered_at_ms: fallbackAnsweredAt
      };
      const answerPlayer2 = answersByUser.get(player2Id) || {
        user_id: player2Id,
        answer_idx: -1,
        is_correct: false,
        answered_at_ms: fallbackAnsweredAt
      };

      const suddenDeathRound = roundNo > PVP_ROUNDS_PER_MATCH;
      const outcome = resolveRoundOutcome({
        question,
        answerPlayer1,
        answerPlayer2,
        player1Id,
        player2Id,
        suddenDeath: suddenDeathRound
      });

      const nextPlayer1Score = Math.max(0, Number(latestMatch.player1_score || 0) + Number(outcome.player1_delta || 0));
      const nextPlayer2Score = Math.max(0, Number(latestMatch.player2_score || 0) + Number(outcome.player2_delta || 0));
      const winnerByScore = nextPlayer1Score > nextPlayer2Score
        ? player1Id
        : (nextPlayer2Score > nextPlayer1Score ? player2Id : '');
      const reachedBaseRounds = roundNo >= PVP_ROUNDS_PER_MATCH;
      const finished = reachedBaseRounds && !!winnerByScore;

      const basePatch = {
        player1_score: nextPlayer1Score,
        player2_score: nextPlayer2Score,
        last_round_winner_user_id: outcome.winner_user_id || null
      };

      if (finished) {
        await updatePvpMatch(match.id, {
          ...basePatch,
          status: 'finished',
          winner_user_id: winnerByScore || null,
          ended_round_no: roundNo,
          ended_at: nowIso()
        });
      } else {
        const nextRoundNo = roundNo + 1;
        const nextQuestionSet = extendPvpQuestionSetIfNeeded(latestMatch, nextRoundNo);
        if (nextRoundNo > nextQuestionSet.length) {
          const fallbackWinner = resolveMatchWinner({
            ...latestMatch,
            player1_score: nextPlayer1Score,
            player2_score: nextPlayer2Score
          });
          await updatePvpMatch(match.id, {
            ...basePatch,
            status: 'finished',
            winner_user_id: fallbackWinner || null,
            ended_reason: fallbackWinner ? null : 'question_pool_exhausted',
            ended_round_no: roundNo,
            ended_at: nowIso()
          });
          return;
        }
        const nowMs = Date.now();
        await updatePvpMatch(match.id, {
          ...basePatch,
          question_set: nextQuestionSet,
          total_rounds: nextQuestionSet.length,
          status: 'round_result',
          result_round_no: roundNo,
          result_round_winner_user_id: outcome.winner_user_id || null,
          next_round_no: nextRoundNo,
          round_result_until_ms: nowMs + PVP_ROUND_RESULT_DURATION_MS
        });
      }
    } catch (error) {
      console.error('finalize round failed:', error);
    } finally {
      await releaseRoundFinalizeLock(match.id, roundNo, authUser.uid).catch(() => null);
      finalizeRoundBusyRef.current = false;
    }
  }

  async function handlePvpMatchFinished(matchRow) {
    const matchId = String(matchRow?.id || '');
    if (!matchId) return;
    setPvpResultReward(null);

    setPvpState((prev) => ({
      ...prev,
      status: 'finished',
      match: matchRow,
      result: getPvpResultForUser(matchRow, authUser?.uid || '')
    }));

    if (!authUser?.uid) return;
    if (handledMatchIdsRef.current.has(matchId)) return;

    const alreadyProcessed = !!progress?.pvpProcessedMatches?.[matchId];
    if (alreadyProcessed) {
      handledMatchIdsRef.current.add(matchId);
      const botUserId = getMatchBotUserId(matchRow);
      if (botUserId) {
        clearBotBusy(botUserId, matchId).catch(() => null);
      }
      return;
    }

    const endedReason = String(matchRow?.ended_reason || '').trim().toLowerCase();
    const botUserId = getMatchBotUserId(matchRow);
    const botQueueAlreadyRotated = String(matchRow?.bot_user_queue_rotated || '').trim().toLowerCase() === 'true';
    const invalidMatchReason = getInvalidFinishedMatchReason(matchRow);
    if (invalidMatchReason) {
      setPvpResultTransitionMode('');
      handledMatchIdsRef.current.add(matchId);
      setPvpCompensation(null);
      if (botUserId) {
        clearBotBusy(botUserId, matchId).catch(() => null);
        setQueueBotExclusion(botUserId, 45000);
        if (!botQueueAlreadyRotated) {
          await rotateUserBotQueue(botUserId, 'handle_finished_invalid').catch(() => null);
        }
        updatePvpMatch(matchId, {
          bot_user_queue_rotated: true,
          bot_user_stats_applied: true,
          bot_user_stats_applied_at: nowIso()
        }).catch(() => null);
      }
      cleanupZeroScoreFinishedMatches(60).catch(() => null);
      const shouldResumeInvalidRefusal = endedReason === 'match_refused' || endedReason === 'accept_timeout';
      if (shouldResumeInvalidRefusal && shouldResumeQueueAfterMatchRefused(matchRow, authUser.uid)) {
        const resumed = await resumeQueueAfterMatchRefused(endedReason, matchRow);
        if (!resumed) {
          const fallbackText = endedReason === 'accept_timeout'
            ? 'Tempo de aceite esgotado. Voltando para a arena.'
            : 'Confronto recusado. Voltando para a arena.';
          showToast(fallbackText);
          playSfx('notify');
        }
      }
      return;
    }
    const skipBattleRewards = endedReason === 'match_refused' || endedReason === 'accept_timeout';
    if (skipBattleRewards) {
      setPvpResultTransitionMode('');
      handledMatchIdsRef.current.add(matchId);
      setPvpCompensation(null);
      if (botUserId) {
        clearBotBusy(botUserId, matchId).catch(() => null);
        setQueueBotExclusion(botUserId, 45000);
        if (!botQueueAlreadyRotated) {
          await rotateUserBotQueue(botUserId, 'handle_finished_refused').catch(() => null);
        }
        updatePvpMatch(matchId, {
          bot_user_queue_rotated: true,
          bot_user_stats_applied: true,
          bot_user_stats_applied_at: nowIso()
        }).catch(() => null);
      }

      const shouldRequeue = shouldResumeQueueAfterMatchRefused(matchRow, authUser.uid);
      if (shouldRequeue) {
        const resumed = await resumeQueueAfterMatchRefused(endedReason, matchRow);
        if (!resumed) {
          const fallbackText = endedReason === 'accept_timeout'
            ? 'Tempo de aceite esgotado. Voltando para a arena.'
            : 'Confronto recusado. Voltando para a arena.';
          showToast(fallbackText);
          playSfx('notify');
        }
      } else {
        const timeoutText = endedReason === 'accept_timeout'
          ? 'Tempo de aceite esgotado. Voltando para a arena.'
          : 'Confronto recusado. Voltando para a arena.';
        showToast(timeoutText);
        playSfx('notify');
      }
      return;
    }

    clearPvpQueueResumeSnapshot();
    handledMatchIdsRef.current.add(matchId);

    const result = getPvpResultForUser(matchRow, authUser.uid);
    const decisiveRoundNo = Math.max(
      1,
      Number(matchRow?.ended_round_no || matchRow?.round_no || PVP_ROUNDS_PER_MATCH)
    );
    const nextBattleNo = Math.max(1, Number(progress.pvpBattles || 0) + 1);
    const pvpPointsGain = getPvpPointsDeltaAdvanced(result, {
      battleNo: nextBattleNo,
      roundNo: decisiveRoundNo,
      matchRow,
      userId: authUser.uid
    });
    const rewards = getPvpRewardsByDifficulty(matchRow?.difficulty || pvpConfig?.difficulty || 'easy', result);

    let nextLevel = Math.max(1, Number(progress.level || 1));
    let nextXp = Math.max(0, Number(progress.xp || 0)) + rewards.xp;
    let leveledUp = false;
    while (nextXp >= getXPForLevel(nextLevel)) {
      nextXp -= getXPForLevel(nextLevel);
      nextLevel += 1;
      leveledUp = true;
    }

    const nextProgress = normalizeProgress({
      ...progress,
      level: nextLevel,
      xp: nextXp,
      coins: Math.max(0, Number(progress.coins || 0) + rewards.coins),
      pvpBattles: Math.max(0, Number(progress.pvpBattles || 0) + 1),
      pvpWins: Math.max(0, Number(progress.pvpWins || 0) + (result === 'win' ? 1 : 0)),
      pvpPoints: Math.max(0, Number(progress.pvpPoints || 0) + pvpPointsGain),
      pvpProcessedMatches: {
        ...(progress.pvpProcessedMatches || {}),
        [matchId]: true
      },
      updatedAt: Date.now()
    });

    setProgress(nextProgress);

    try {
      await upsertStatsFromProgress(authUser.uid, nextProgress);
    } catch {
      // ignore sync errors for now
    }

    if (botUserId) {
      const player1Id = String(matchRow?.player1_user_id || '').trim();
      const botResult = getPvpResultForUser(matchRow, botUserId);
      const botBattleNo = player1Id === botUserId
        ? Math.max(1, Number(matchRow?.player1_pvp_battles || 0) + 1)
        : Math.max(1, Number(matchRow?.player2_pvp_battles || 0) + 1);
      const botPointsDelta = getPvpPointsDeltaAdvanced(botResult, {
        battleNo: botBattleNo,
        roundNo: decisiveRoundNo,
        matchRow,
        userId: botUserId
      });
      const botRewards = getPvpRewardsByDifficulty(
        matchRow?.difficulty || pvpConfig?.difficulty || 'easy',
        botResult
      );
      await applyPvpOutcomeToUserStats(botUserId, {
        result: botResult,
        pointsDelta: botPointsDelta,
        xp: botRewards.xp,
        battlesDelta: 1
      }).catch(() => null);
      clearBotBusy(botUserId, matchId).catch(() => null);
      if (!botQueueAlreadyRotated) {
        await rotateUserBotQueue(botUserId, 'handle_finished_rewards_applied').catch(() => null);
      }
      updatePvpMatch(matchId, {
        bot_user_queue_rotated: true,
        bot_user_stats_applied: true,
        bot_user_stats_applied_at: nowIso()
      }).catch(() => null);
    }

    const endedBy = String(matchRow?.ended_by_user_id || matchRow?.forfeit_by_user_id || '');
    const isOwnForfeit = endedReason === 'forfeit' && endedBy === authUser.uid;
    const isOpponentForfeit = endedReason === 'forfeit' && endedBy && endedBy !== authUser.uid && result === 'win';

    if (isOwnForfeit) {
      setPvpResultTransitionMode('');
      setPvpCompensation(null);
      showToast(`Voce saiu da partida: ${formatSignedPoints(pvpPointsGain)} PVP · +${rewards.xp} XP · +${rewards.coins} moedas`);
      return;
    }

    if (isOpponentForfeit) {
      setPvpResultTransitionMode('');
      setPvpResultReward(null);
      setPvpCompensation({
        matchId,
        title: 'Oponente saiu da partida',
        subtitle: 'Voce recebeu compensacao por abandono do adversario. Toque em coletar para sair da partida.',
        points: pvpPointsGain,
        xp: rewards.xp,
        coins: rewards.coins
      });
      return;
    }

    setPvpResultTransitionMode('');
    setPvpCompensation(null);
    setPvpResultReward({
      matchId,
      points: pvpPointsGain,
      xp: rewards.xp,
      coins: rewards.coins
    });

    if (result === 'win') {
      showToast(`Vitoria PVP! ${formatSignedPoints(pvpPointsGain)} PVP · +${rewards.xp} XP · +${rewards.coins} moedas${leveledUp ? ' · Subiu de nivel!' : ''}`);
    } else if (result === 'draw') {
      showToast(`Empate PVP. ${formatSignedPoints(pvpPointsGain)} PVP · +${rewards.xp} XP · +${rewards.coins} moedas`);
    } else {
      showToast(`Derrota PVP. ${formatSignedPoints(pvpPointsGain)} PVP · +${rewards.xp} XP · +${rewards.coins} moedas`);
    }
  }

  async function leavePvpFlow() {
    const current = pvpStateRef.current;
    const activeMatch = current?.match;
    const myUserId = String(authUser?.uid || '').trim();

    if (
      myUserId &&
      activeMatch?.id &&
      (String(activeMatch.status || '').trim().toLowerCase() === 'active'
        || String(activeMatch.status || '').trim().toLowerCase() === 'pending_accept')
    ) {
      const player1Id = String(activeMatch.player1_user_id || '').trim();
      const player2Id = String(activeMatch.player2_user_id || '').trim();
      const opponentId = player1Id === myUserId ? player2Id : player1Id;
      const matchStatus = String(activeMatch.status || '').trim().toLowerCase();

      if (opponentId) {
        const latest = await getPvpMatch(activeMatch.id).catch(() => null);
        if (latest && String(latest.status || '').trim().toLowerCase() === matchStatus) {
          if (matchStatus === 'pending_accept') {
            await updatePvpMatch(activeMatch.id, {
              status: 'finished',
              ended_reason: 'match_refused',
              ended_by_user_id: myUserId,
              ended_at: nowIso(),
              winner_user_id: null
            }).catch(() => null);
          } else {
            await updatePvpMatch(activeMatch.id, {
              status: 'finished',
              winner_user_id: opponentId,
              ended_reason: 'forfeit',
              ended_by_user_id: myUserId,
              forfeit_by_user_id: myUserId,
              ended_round_no: Math.max(1, Number(activeMatch.round_no || 1)),
              ended_at: nowIso()
            }).catch(() => null);
          }
        }
      }
    }

    if (authUser?.uid) {
      await leaveQueue(authUser.uid).catch(() => null);
    }
    resetPvpState();
    setScreen('play-mode');
  }

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;
    let cancelled = false;

    const unsubscribe = subscribeQueueEntry(
      authUser.uid,
      (queueEntry) => {
        if (cancelled || !queueEntry) return;
        const status = String(queueEntry.status || '').trim().toLowerCase();
        const matchId = String(queueEntry.match_id || '').trim();
        if (status !== 'matched' || !matchId) return;

        const queueJoinedAtMs = getQueueSessionStartMs();
        const queueSessionId = String(queueSessionIdRef.current || '').trim();
        const eventAtMs = Date.now();

        (async () => {
          const latest = await getPvpMatch(matchId).catch(() => null);
          if (cancelled) return;
          if (!latest || typeof latest !== 'object') {
            queueFlowLog('queue_subscribe:matched_but_missing_match', {
              userId: authUser?.uid || '',
              matchId
            });
            await clearQueueMatch(authUser.uid).catch(() => null);
            return;
          }

          const latestStatus = String(latest.status || '').trim().toLowerCase();
          if (latestStatus === 'finished') {
            queueFlowLog('queue_subscribe:matched_but_finished', {
              userId: authUser?.uid || '',
              matchId
            });
            await clearQueueMatch(authUser.uid).catch(() => null);
            return;
          }

          const isBotMatch = latest.is_bot_match === true && latest.is_bot_duel !== true;
          const matchQueueSessionId = String(latest.queue_session_id || '').trim();
          const matchQueueJoinedAtMs = Math.max(
            0,
            Number(
              latest.queue_joined_at_ms
              || latest.queue_started_at_ms
              || latest.queue_joined_ms
              || 0
            )
          );
          const matchCreatedAtMs = Math.max(
            0,
            toMillis(latest.created_at || latest.updated_at)
          );
          const queueElapsedMs = queueJoinedAtMs > 0
            ? Math.max(0, eventAtMs - queueJoinedAtMs)
            : 0;
          const queueSessionMismatch = isBotMatch
            && queueSessionId
            && matchQueueSessionId
            && queueSessionId !== matchQueueSessionId;
          const olderQueueMatch = isBotMatch
            && queueJoinedAtMs > 0
            && (
              (matchQueueJoinedAtMs > 0 && matchQueueJoinedAtMs < (queueJoinedAtMs - 1200))
              || (matchCreatedAtMs > 0 && matchCreatedAtMs < (queueJoinedAtMs - 1200))
            );
          const beforeMinWindow = isBotMatch
            && queueElapsedMs > 0
            && queueElapsedMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS;

          if (queueSessionMismatch || olderQueueMatch || beforeMinWindow) {
            const reason = queueSessionMismatch
              ? 'session_mismatch'
              : (olderQueueMatch ? 'older_queue' : 'before_min_window');
            queueFlowLog('queue_subscribe:matched_ignored', {
              userId: authUser?.uid || '',
              matchId,
              reason,
              queueElapsedMs
            });
            await clearQueueMatch(authUser.uid).catch(() => null);
            return;
          }

          await attachToMatch(matchId).catch(() => null);
        })().catch(() => null);
      },
      (error) => {
        if (!cancelled) {
          console.error('queue subscription error:', error);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pvpState.status, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;

    let cancelled = false;
    let busy = false;

    const tryAttachOpenMatch = async (reason = 'interval') => {
      if (cancelled || busy) return;
      busy = true;
      try {
        const openMatch = await withTimeout(
          findOpenMatchForUser(authUser.uid).catch(() => null),
          1800,
          'queue_watchdog_open_match'
        ).catch(() => null);
        if (cancelled || !openMatch?.id) return;
        const safeStatus = String(openMatch.status || '').trim().toLowerCase();
        if (safeStatus !== 'pending_accept' && safeStatus !== 'active' && safeStatus !== 'round_result') return;
        queueFlowLogThrottled(
          `queue_watchdog_open_${safeStatus}`,
          1200,
          'queue_watchdog:open_match_found',
          {
            userId: authUser.uid,
            matchId: openMatch.id,
            status: safeStatus,
            reason
          }
        );
        await attachToMatch(openMatch.id);
      } finally {
        busy = false;
      }
    };

    tryAttachOpenMatch('boot').catch(() => null);
    const timer = setInterval(() => {
      tryAttachOpenMatch('poll').catch(() => null);
    }, 1600);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'queueing') return;
    if (!authUser?.uid) return;

    let cancelled = false;
    let tickRunning = false;
    let tickStartedAtMs = 0;
    const effectQueueSessionId = String(queueSessionIdRef.current || '').trim()
      || buildQueueSessionId(authUser.uid, Date.now());
    if (!String(queueSessionIdRef.current || '').trim()) {
      queueSessionIdRef.current = effectQueueSessionId;
    }
    const isQueueTickStale = () => {
      if (cancelled) return true;
      if (queueCancelRequestedRef.current) return true;
      if (String(pvpStateRef.current?.status || '').trim().toLowerCase() !== 'queueing') return true;
      return String(queueSessionIdRef.current || '').trim() !== effectQueueSessionId;
    };
    const scheduleNextBotAttempt = (minSeconds = 1, maxSeconds = 12) => {
      if (isQueueTickStale()) return;
      const nowMs = Date.now();
      const queueJoinedAtMs = getQueueSessionStartMs();
      const queueResumeMode = String(pvpStateRef.current?.queueResumeMode || '').trim().toLowerCase();
      const currentBotMatchAtMs = Math.max(0, Number(pvpStateRef.current?.queueBotMatchAtMs || 0));
      const nextAt = computeQueueBotMatchAtMs({
        nowMs,
        queueJoinedAtMs,
        queueResumeMode,
        currentBotMatchAtMs,
        minSeconds,
        maxSeconds
      });
      setPvpState((prev) => {
        if (prev.status !== 'queueing') return prev;
        return {
          ...prev,
          queueBotMatchAtMs: nextAt
        };
      });
    };
    const pickFallbackBotId = async (targetDifficulty, preferredId = '', excludedIds = []) => {
      const safeDifficulty = normalizeDifficulty(targetDifficulty || 'easy');
      const preferred = String(preferredId || '').trim();
      const excludedSet = new Set(
        (Array.isArray(excludedIds) ? excludedIds : [])
          .map((id) => String(id || '').trim())
          .filter((id) => !!id)
      );
      const repoPickedBot = await withTimeout(
        getNextBotForUserMatch(safeDifficulty, {
          excludeBotIds: Array.from(excludedSet),
          waitForEnsure: false,
          preferLocal: true
        }).catch(() => null),
        2200,
        'fallback_repo_pick'
      ).catch(() => null);
      const repoPickedBotId = String(
        repoPickedBot?.bot_id
        || repoPickedBot?.profile?.id
        || ''
      ).trim();
      if (
        isSystemBotUserId(repoPickedBotId)
        && !excludedSet.has(repoPickedBotId)
      ) {
        return repoPickedBotId;
      }
      const ordered = [
        ...(preferred && isSystemBotUserId(preferred) ? [preferred] : []),
        ...SYSTEM_BOT_IDS.filter((id) => String(id || '').trim() !== preferred)
      ];
      const uniqueOrdered = ordered
        .map((id) => String(id || '').trim())
        .filter((id, index, arr) => !!id && arr.indexOf(id) === index)
        .filter((id) => !excludedSet.has(id));
      const startIndex = uniqueOrdered.length > 1
        ? Math.floor(Math.random() * uniqueOrdered.length)
        : 0;
      const orderedFiltered = uniqueOrdered.length
        ? [...uniqueOrdered.slice(startIndex), ...uniqueOrdered.slice(0, startIndex)]
        : [];

      // Local-first pass: use cached bot snapshots to avoid network stalls on mobile.
      for (const botId of orderedFiltered) {
        if (!isSystemBotUserId(botId)) continue;
        const snapshot = await getSystemBotSnapshot(botId, {
          preferLocal: true
        }).catch(() => null);
        const botDifficulty = getPvpQueueDifficultyFromStats(snapshot?.stats || null);
        if (normalizeDifficulty(botDifficulty || 'easy') === safeDifficulty) return botId;
      }
      return '';
    };

    async function tickMatchmaking() {
      if (isQueueTickStale()) return;
      const nowMs = Date.now();
      const maxTickRunMs = isLikelyMobileWeb() ? 22000 : 14000;
      if (tickRunning) {
        if (tickStartedAtMs > 0 && (nowMs - tickStartedAtMs) >= maxTickRunMs) {
          queueFlowLog('matchmaking_tick:watchdog_unlock', {
            userId: authUser?.uid || '',
            stuckMs: Math.max(0, nowMs - tickStartedAtMs)
          });
          tickRunning = false;
          tickStartedAtMs = 0;
        } else {
          return;
        }
      }
      tickRunning = true;
      tickStartedAtMs = nowMs;
      try {
        queueFlowLogThrottled(
          'mm_tick',
          4000,
          'matchmaking_tick:start',
          {
            userId: authUser?.uid || '',
            status: pvpStateRef.current?.status || '',
            matchId: pvpStateRef.current?.matchId || ''
          }
        );
        await withTimeout(
          ensureQueueHeartbeat(authUser.uid).catch(() => null),
          1000,
          'queue_heartbeat'
        ).catch(() => null);
        if (isQueueTickStale()) return;
        // Run cleanup in background — don't block human matching
        cleanupStalePairLocks(25, 40).catch(() => null);
        cleanupStalePendingBotUserMatches({
          maxBatch: 8,
          staleMs: 14000,
          actorUserId: authUser.uid
        }).catch(() => null);

        const openMatch = await withTimeout(
          findOpenMatchForUser(authUser.uid).catch(() => null),
          1400,
          'find_open_match_self'
        ).catch(() => null);
        if (isQueueTickStale()) return;
        if (openMatch?.id) {
          queueFlowLog('matchmaking_tick:open_match_found', {
            userId: authUser?.uid || '',
            matchId: openMatch.id,
            status: openMatch.status || ''
          });
          const safeStatus = String(openMatch.status || '').trim().toLowerCase();
          const currentQueueStartMs = getQueueSessionStartMs();
          const openMatchQueueStartMs = Math.max(
            0,
            Number(
              openMatch.queue_joined_at_ms
              || openMatch.queue_started_at_ms
              || openMatch.queue_joined_ms
              || 0
            )
          );
          const openMatchCreatedAtMs = Math.max(
            0,
            toMillis(openMatch.created_at || openMatch.updated_at)
          );
          const openMatchIsBot = openMatch.is_bot_match === true && openMatch.is_bot_duel !== true;
          const openMatchQueueSessionId = String(openMatch.queue_session_id || '').trim();
          const queueSessionMismatch = openMatchQueueSessionId
            && effectQueueSessionId
            && openMatchQueueSessionId !== effectQueueSessionId;
          const isOlderQueueMatch = currentQueueStartMs > 0
            && (
              (openMatchQueueStartMs > 0 && openMatchQueueStartMs < (currentQueueStartMs - 1200))
              || (openMatchCreatedAtMs > 0 && openMatchCreatedAtMs < (currentQueueStartMs - 1200))
            );
          if (openMatchIsBot && (queueSessionMismatch || isOlderQueueMatch)) {
            queueFlowLog('matchmaking_tick:open_match_ignored_old_session', {
              userId: authUser?.uid || '',
              matchId: openMatch.id,
              message: queueSessionMismatch ? 'session_mismatch' : 'older_queue'
            });
            if (safeStatus === 'pending_accept') {
              await updatePvpMatch(openMatch.id, {
                status: 'finished',
                ended_reason: 'stale_queue_session',
                ended_by_user_id: null,
                ended_at: nowIso(),
                winner_user_id: null,
                result_void: true,
                result_void_reason: 'stale_queue_session',
                history_hidden: true,
                history_hidden_reason: 'stale_queue_session'
              }).catch(() => null);
            }
            return;
          }
          const queueElapsedMs = currentQueueStartMs > 0
            ? Math.max(0, Date.now() - currentQueueStartMs)
            : 0;
          if (openMatchIsBot && queueElapsedMs > 0 && queueElapsedMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS) {
            queueFlowLog('matchmaking_tick:open_match_before_min_window', {
              userId: authUser?.uid || '',
              matchId: openMatch.id,
              elapsedMs: queueElapsedMs
            });
            return;
          }
          if (safeStatus === 'pending_accept') {
            const closeReason = getPendingAcceptAutoCloseReason(openMatch, Date.now());
            if (closeReason) {
              await updatePvpMatch(openMatch.id, {
                status: 'finished',
                ended_reason: closeReason,
                ended_by_user_id: null,
                ended_at: nowIso(),
                winner_user_id: null,
                result_void: true,
                result_void_reason: closeReason,
                history_hidden: true,
                history_hidden_reason: closeReason
              }).catch(() => null);
              queueFlowLog('matchmaking_tick:closed_stale_pending_accept', {
                userId: authUser?.uid || '',
                matchId: openMatch.id,
                reason: closeReason
              });
            } else {
              await attachToMatch(openMatch.id);
              return;
            }
          } else {
            await attachToMatch(openMatch.id);
            return;
          }
        }

        const queueCategory = getPvpQueueDifficultyFromProgress(progress);
        let selfQueue = await withTimeout(
          getQueueEntryByUser(authUser.uid).catch(() => null),
          1400,
          'get_self_queue'
        ).catch(() => null);
        if (isQueueTickStale()) return;
        if (!selfQueue || String(selfQueue.status || '').trim().toLowerCase() !== 'waiting') {
          queueFlowLog('matchmaking_tick:queue_missing_or_not_waiting', {
            userId: authUser?.uid || '',
            currentStatus: selfQueue?.status || ''
          });
          selfQueue = await withTimeout(upsertQueueEntry({
            user_id: authUser.uid,
            nickname: profile?.nickname || 'Jogador',
            avatar: profile?.avatar || '🤓',
            level: Math.max(1, Number(progress.level || 1)),
            pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
            equipped_frame: shopData?.equipped?.frame || 'frame_default',
            equipped_background: shopData?.equipped?.background || 'bg_default',
            equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
            language: pvpConfig?.language || '',
            topic: pvpConfig?.topic || '',
            difficulty: queueCategory,
            category: queueCategory
          }).catch(() => null), 1500, 'upsert_self_queue').catch(() => null);
        }
        if (isQueueTickStale()) return;
        if (!selfQueue || String(selfQueue.status || '').trim().toLowerCase() !== 'waiting') return;
        const userQueueCategory = normalizeDifficulty(
          selfQueue.category || selfQueue.difficulty || queueCategory
        );
        const preparedAgeMs = Math.max(
          0,
          Date.now() - Math.max(0, Number(preparedBotRef.current?.preparedAtMs || 0))
        );
        const hasPreparedBot = String(preparedBotRef.current?.userId || '').trim() === String(authUser?.uid || '').trim()
          && normalizeDifficulty(preparedBotRef.current?.category || 'easy') === normalizeDifficulty(userQueueCategory || 'easy')
          && isSystemBotUserId(preparedBotRef.current?.botId);
        if (!hasPreparedBot || preparedAgeMs > 9000) {
          const nowKick = Date.now();
          if ((nowKick - Math.max(0, Number(preparedBotKickAtRef.current || 0))) >= 2500) {
            preparedBotKickAtRef.current = nowKick;
            prepareBotForQueue(userQueueCategory, 'tick_warmup', false).catch(() => null);
          }
        }
        const queueSessionJoinedAtMs = Math.max(
          0,
          Number(getQueueSessionStartMs() || 0)
        );
        const currentQueue = pvpStateRef.current;
        const botMatchAtMs = Math.max(0, Number(currentQueue.queueBotMatchAtMs || 0));
        if (!botMatchAtMs) {
          queueFlowLog('matchmaking_tick:no_bot_match_at', {
            userId: authUser?.uid || '',
            queueStatus: selfQueue?.status || ''
          });
          scheduleNextBotAttempt(1, 3);
          return;
        }
        const nowBeforeHumanMatching = Date.now();
        const queueJoinedForPrioritize = getQueueSessionStartMs();
        const pastDeadlineForPrioritize = queueJoinedForPrioritize > 0
          && (nowBeforeHumanMatching - queueJoinedForPrioritize) >= PVP_QUEUE_BOT_HARD_DEADLINE_MS;
        const pastMinimumBotWindow = queueJoinedForPrioritize > 0
          && (nowBeforeHumanMatching - queueJoinedForPrioritize) >= PVP_QUEUE_BOT_FIRST_THRESHOLD_MS;
        const shouldPrioritizeBotAttempt = (
          pastDeadlineForPrioritize
          || (pastMinimumBotWindow && nowBeforeHumanMatching >= botMatchAtMs)
        );
        const msUntilBotDue = Math.max(0, botMatchAtMs - nowBeforeHumanMatching);
        if (msUntilBotDue <= PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS) {
          const nowKick = Date.now();
          if ((nowKick - Math.max(0, Number(preparedBotKickAtRef.current || 0))) >= 1200) {
            preparedBotKickAtRef.current = nowKick;
            prepareBotForQueue(userQueueCategory, 'near_due', true).catch(() => null);
          }
        }
        const shouldSkipHumanMatchScan = msUntilBotDue <= PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS;

        if (!shouldPrioritizeBotAttempt && !shouldSkipHumanMatchScan) {
          const opponents = await withTimeout(
            findQueueOpponent(authUser.uid, userQueueCategory, userQueueCategory, 12).catch(() => []),
            1200,
            'find_queue_opponents'
          ).catch(() => []);
          if (isQueueTickStale()) return;
          let matchedWithHuman = false;
          for (const opponent of (Array.isArray(opponents) ? opponents.slice(0, 3) : [])) {
            const opponentId = String(opponent?.id || '').trim();
            if (!opponentId) continue;

            const lockAcquired = await tryAcquirePairLock(authUser.uid, opponentId, authUser.uid, 7000);
            if (!lockAcquired) continue;

            try {
              const [myQueue, oppQueue, myOpenMatch, opponentOpenMatch] = await Promise.all([
                withTimeout(
                  getQueueEntryByUser(authUser.uid).catch(() => null),
                  1000,
                  'my_queue_for_human'
                ).catch(() => null),
                withTimeout(
                  getQueueEntryByUser(opponentId).catch(() => null),
                  1000,
                  'opp_queue_for_human'
                ).catch(() => null),
                withTimeout(
                  findOpenMatchForUser(authUser.uid).catch(() => null),
                  1000,
                  'my_open_match_for_human'
                ).catch(() => null),
                withTimeout(
                  findOpenMatchForUser(opponentId).catch(() => null),
                  1000,
                  'opp_open_match_for_human'
                ).catch(() => null)
              ]);

              if (myOpenMatch?.id) {
                await attachToMatch(myOpenMatch.id);
                matchedWithHuman = true;
                break;
              }
              if (opponentOpenMatch?.id) continue;
              if (!myQueue || !oppQueue) continue;
              if (!isQueueEntryFreshWaiting(myQueue, 12000)) continue;
              if (!isQueueEntryFreshWaiting(oppQueue, 12000)) continue;
              const myQueueCategory = normalizeDifficulty(myQueue.category || myQueue.difficulty || userQueueCategory);
              const oppQueueCategory = normalizeDifficulty(oppQueue.category || oppQueue.difficulty || 'easy');
              if (myQueueCategory !== oppQueueCategory) continue;
              if (myQueueCategory !== userQueueCategory) continue;
              if (normalizeDifficulty(myQueue.difficulty || 'easy') !== myQueueCategory) continue;
              if (normalizeDifficulty(oppQueue.difficulty || 'easy') !== oppQueueCategory) continue;

              const safeConfig = ensureValidPvpConfig({
                language: myQueue.language || pvpConfig.language,
                topic: myQueue.topic || pvpConfig.topic,
                difficulty: myQueueCategory
              });

              const questionSet = pickPvpRoundQuestionsByDifficulty(
                QUESTIONS,
                myQueueCategory,
                PVP_ROUNDS_PER_MATCH
              );

              if (!questionSet.length) continue;

              const matchId = buildMatchId(authUser.uid, opponentId);
              const created = await createPvpMatch({
                id: matchId,
                status: 'pending_accept',
                difficulty: myQueueCategory,
                category: myQueueCategory,
                language: safeConfig.language,
                topic: safeConfig.topic,
                total_rounds: questionSet.length,
                round_no: 1,
                question_set: questionSet,
                player1_user_id: authUser.uid,
                player1_nickname: profile?.nickname || myQueue.nickname || 'Jogador',
                player1_avatar: profile?.avatar || myQueue.avatar || '🤓',
                player1_frame: myQueue.equipped_frame || shopData?.equipped?.frame || 'frame_default',
                player1_background: myQueue.equipped_background || shopData?.equipped?.background || 'bg_default',
                player1_emoji: myQueue.equipped_emoji || shopData?.equipped?.emoji || 'emoji_profile',
                player1_level: Math.max(1, Number(progress.level || myQueue.level || 1)),
                player1_pvp_points: Math.max(0, Number(progress.pvpPoints || myQueue.pvp_points || 0)),
                player1_pvp_battles: Math.max(0, Number(progress.pvpBattles || 0)),
                player1_accept_state: 'pending',
                player2_user_id: opponentId,
                player2_nickname: opponent.nickname || 'Jogador',
                player2_avatar: opponent.avatar || '🤓',
                player2_frame: opponent.equipped_frame || 'frame_default',
                player2_background: opponent.equipped_background || 'bg_default',
                player2_emoji: opponent.equipped_emoji || 'emoji_profile',
                player2_level: Math.max(1, Number(opponent.level || 1)),
                player2_pvp_points: Math.max(0, Number(opponent.pvp_points || 0)),
                player2_pvp_battles: Math.max(0, Number(opponent.pvp_battles || 0)),
                player2_accept_state: 'pending',
                queue_joined_at_ms: queueSessionJoinedAtMs || Date.now(),
                accept_deadline_ms: Date.now() + PVP_MATCH_ACCEPT_TIMEOUT_MS,
                start_countdown_ms: 0,
                reject_at_ms: 0,
                player1_score: 0,
                player2_score: 0,
                host_user_id: authUser.uid,
                round_started_at_ms: Date.now(),
                round_started_at: nowIso(),
                created_at: nowIso(),
                updated_at: nowIso()
              }).catch((error) => {
                console.error('matchmaking human create failed:', error);
                return null;
              });

              if (!created?.id) continue;

              await Promise.all([
                markQueueMatched(authUser.uid, created.id).catch(() => null),
                markQueueMatched(opponentId, created.id).catch(() => null)
              ]);

              await attachToMatch(created.id);
              queueFlowLog('matchmaking_tick:human_match_created', {
                userId: authUser?.uid || '',
                matchId: created.id,
                opponentId
              });
              matchedWithHuman = true;
              break;
            } finally {
              await releasePairLock(authUser.uid, opponentId, authUser.uid).catch(() => null);
            }
          }
          if (matchedWithHuman) return;
        }

        const nowBeforeBotAttempt = Date.now();
        const queueJoinedForDeadline = getQueueSessionStartMs();
        const minBotStartAt = queueJoinedForDeadline > 0
          ? queueJoinedForDeadline + PVP_QUEUE_BOT_FIRST_THRESHOLD_MS
          : 0;
        if (minBotStartAt > 0 && nowBeforeBotAttempt < minBotStartAt) {
          const waitMinMs = Math.min(minBotStartAt - nowBeforeBotAttempt, 2500);
          if (waitMinMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, waitMinMs));
          }
          if (cancelled) return;
          const latestStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
          if (latestStatus !== 'queueing') return;
        }
        if (isQueueTickStale()) return;
        const pastHardDeadline = queueJoinedForDeadline > 0
          && (nowBeforeBotAttempt - queueJoinedForDeadline) >= PVP_QUEUE_BOT_HARD_DEADLINE_MS;
        if (!pastHardDeadline && nowBeforeBotAttempt < botMatchAtMs) {
          const waitMs = Math.min(botMatchAtMs - nowBeforeBotAttempt, 4000);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          if (cancelled) return;
          const latestStatus = String(pvpStateRef.current?.status || '').trim().toLowerCase();
          if (latestStatus !== 'queueing') return;
        }

	        const prepared = preparedBotRef.current && typeof preparedBotRef.current === 'object'
	          ? preparedBotRef.current
	          : {};
	        const excludedBotId = getQueueBotExclusionId();
	        let selectedBotId = '';
	        if (
	          String(prepared.userId || '').trim() === String(authUser?.uid || '').trim()
	          && normalizeDifficulty(prepared.category || 'easy') === normalizeDifficulty(userQueueCategory || 'easy')
	          && isSystemBotUserId(prepared.botId)
            && String(prepared.botId || '').trim() !== excludedBotId
	        ) {
	          selectedBotId = String(prepared.botId || '').trim();
	        }
	        if (!selectedBotId) {
		          const pickedBot = await withTimeout(
		            getNextBotForUserMatch(userQueueCategory, {
	                excludeBotIds: excludedBotId ? [excludedBotId] : [],
	                waitForEnsure: false,
	                preferLocal: true
	              }).catch(() => null),
		            2200,
		            'pick_bot_for_match'
		          ).catch(() => null);
	          if (isQueueTickStale()) return;
          selectedBotId = String(
            pickedBot?.bot_id
            || pickedBot?.profile?.id
          ).trim();
	        }
	        if (!isSystemBotUserId(selectedBotId)) {
	          selectedBotId = await pickFallbackBotId(
              userQueueCategory,
              '',
              excludedBotId ? [excludedBotId] : []
            );
	        }
        const queueWaitMs = Math.max(
          0,
          Date.now() - getQueueSessionStartMs()
        );
        const forceLockFallback = queueWaitMs >= Math.max(14000, PVP_QUEUE_BOT_HARD_DEADLINE_MS - 1500);
        const preparedBotId = String(preparedBotRef.current?.botId || '').trim();
	        const initialCandidates = [
	          String(selectedBotId || '').trim(),
	          preparedBotId
	        ]
	          .filter((id, index, arr) => id && arr.indexOf(id) === index)
	          .filter((id) => isSystemBotUserId(id))
            .filter((id) => id !== excludedBotId);
	        const secondaryCandidate = initialCandidates.length >= 2
	          ? ''
	          : await pickFallbackBotId(
              userQueueCategory,
              '',
              [
                ...initialCandidates,
                ...(excludedBotId ? [excludedBotId] : [])
              ]
            );
        const lockCandidates = [
          ...initialCandidates,
          ...(secondaryCandidate && !initialCandidates.includes(secondaryCandidate) ? [secondaryCandidate] : [])
        ];

        if (!lockCandidates.length) {
          queueFlowLog('matchmaking_tick:no_bot_candidates', {
            userId: authUser?.uid || '',
            targetDifficulty: userQueueCategory
          });
          scheduleNextBotAttempt(1, 2);
          return;
        }
        if (forceLockFallback) {
          await cleanupStalePairLocks(25, 30).catch(() => null);
        }

        let lockedBotId = '';
        const lockTtlMs = forceLockFallback ? 1600 : 2800;
        for (const candidateBotId of lockCandidates) {
          const lockOk = await tryAcquirePairLock(authUser.uid, candidateBotId, authUser.uid, lockTtlMs);
          if (isQueueTickStale()) return;
          if (lockOk) {
            lockedBotId = candidateBotId;
            break;
          }
          if (forceLockFallback) {
            await cleanupStalePairLocks(25, 20).catch(() => null);
          }
        }
        if (!lockedBotId) {
          queueFlowLog('matchmaking_tick:bot_lock_failed', {
            userId: authUser?.uid || '',
            preferredBotId: selectedBotId || '',
            candidates: lockCandidates
          });
          await cleanupStalePairLocks(25, 40).catch(() => null);
          if (isSystemBotUserId(selectedBotId)) {
            await rotateUserBotQueue(selectedBotId, 'mm_lock_failed').catch(() => null);
            setQueueBotExclusion(selectedBotId, 15000);
          }
          scheduleNextBotAttempt(1, forceLockFallback ? 2 : 3);
          return;
        }
        selectedBotId = lockedBotId;
        queueFlowLog('matchmaking_tick:bot_lock_acquired', {
          userId: authUser?.uid || '',
          botId: selectedBotId
        });

        try {
          const contextFetchStartedAt = Date.now();
          queueFlowLog('matchmaking_tick:context_fetch_start', {
            userId: authUser?.uid || '',
            botId: selectedBotId
          });
          const queueSnapshotBeforeLock = selfQueue && typeof selfQueue === 'object'
            ? { ...selfQueue }
            : null;
          const [fetchedMyQueue, botSnapshot, remoteBotConfig, myOpenMatch, botOpenMatch] = await Promise.all([
            withTimeout(
              getQueueEntryByUser(authUser.uid).catch(() => null),
              1200,
              'queue_entry_after_lock'
            ).catch(() => null),
	            withTimeout(
	              getSystemBotSnapshot(selectedBotId, {
	                preferLocal: true
	              }).catch(() => null),
	              1600,
	              'bot_snapshot_after_lock'
	            ).catch(() => (
	              String(preparedBotRef.current?.botId || '').trim() === String(selectedBotId || '').trim()
	                ? (preparedBotRef.current?.snapshot || null)
	                : null
	            )),
	            withTimeout(
	              getPvpBotConfig(selectedBotId, {
	                preferLocal: true
	              }).catch(() => BOT_CONFIG_DEFAULT),
	              2200,
	              'bot_config_after_lock'
	            ).catch(() => (
              String(preparedBotRef.current?.botId || '').trim() === String(selectedBotId || '').trim()
                ? (preparedBotRef.current?.config || BOT_CONFIG_DEFAULT)
                : BOT_CONFIG_DEFAULT
            )),
            withTimeout(
              findOpenMatchForUser(authUser.uid).catch(() => null),
              1200,
              'my_open_match_after_lock'
            ).catch(() => null),
            withTimeout(
              findOpenMatchForUser(selectedBotId).catch(() => null),
              1200,
              'bot_open_match_after_lock'
            ).catch(() => null)
          ]);
          if (isQueueTickStale()) return;
          let myQueue = fetchedMyQueue;
          queueFlowLog('matchmaking_tick:context_fetch_done', {
            userId: authUser?.uid || '',
            botId: selectedBotId,
            elapsedMs: Math.max(0, Date.now() - contextFetchStartedAt),
            hasQueue: !!myQueue,
            hasMyOpenMatch: !!myOpenMatch?.id,
            hasBotOpenMatch: !!botOpenMatch?.id
          });

          if (myOpenMatch?.id) {
            queueFlowLog('matchmaking_tick:my_open_match_reused', {
              userId: authUser?.uid || '',
              matchId: myOpenMatch.id
            });
            await attachToMatch(myOpenMatch.id);
            return;
          }
          if (botOpenMatch?.id) {
            queueFlowLog('matchmaking_tick:bot_open_match_busy', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              botMatchId: botOpenMatch.id
            });
            await rotateUserBotQueue(selectedBotId, 'mm_bot_open_match_busy').catch(() => null);
            setQueueBotExclusion(selectedBotId, 15000);
            scheduleNextBotAttempt(1, 4);
            return;
          }

          if (!myQueue) {
            const localStatus = String(queueSnapshotBeforeLock?.status || '').trim().toLowerCase();
            if (localStatus === 'waiting') {
              myQueue = { ...queueSnapshotBeforeLock };
              queueFlowLog('matchmaking_tick:queue_recovered_from_local_snapshot', {
                userId: authUser?.uid || '',
                botId: selectedBotId
              });
            }
          }
          if (!myQueue) {
            const recreatedQueue = await upsertQueueEntry({
              user_id: authUser.uid,
              nickname: profile?.nickname || 'Jogador',
              avatar: profile?.avatar || '🤓',
              level: Math.max(1, Number(progress.level || 1)),
              pvp_points: Math.max(0, Number(progress.pvpPoints || 0)),
              equipped_frame: shopData?.equipped?.frame || 'frame_default',
              equipped_background: shopData?.equipped?.background || 'bg_default',
              equipped_emoji: shopData?.equipped?.emoji || 'emoji_profile',
              language: pvpConfig?.language || '',
              topic: pvpConfig?.topic || '',
              difficulty: userQueueCategory,
              category: userQueueCategory
            }).catch(() => null);
            if (recreatedQueue && String(recreatedQueue.status || '').trim().toLowerCase() === 'waiting') {
              myQueue = recreatedQueue;
              queueFlowLog('matchmaking_tick:queue_recreated_after_lock', {
                userId: authUser?.uid || '',
                botId: selectedBotId
              });
            }
          }
          if (!myQueue) {
            queueFlowLog('matchmaking_tick:queue_fetch_missing_after_lock', {
              userId: authUser?.uid || '',
              botId: selectedBotId
            });
            scheduleNextBotAttempt(1, 2);
            return;
          }
          if (String(myQueue.status || '') !== 'waiting') {
            queueFlowLog('matchmaking_tick:my_queue_not_waiting_after_lock', {
              userId: authUser?.uid || '',
              queueStatus: myQueue?.status || ''
            });
            scheduleNextBotAttempt(1, 12);
            return;
          }
          const myQueueCategory = normalizeDifficulty(myQueue.category || myQueue.difficulty || userQueueCategory);
          if (myQueueCategory !== userQueueCategory) {
            scheduleNextBotAttempt(1, 12);
            return;
          }

          const safeConfig = ensureValidPvpConfig({
            language: myQueue.language || pvpConfig.language,
            topic: myQueue.topic || pvpConfig.topic,
            difficulty: myQueueCategory
          });
          const questionSet = pickPvpRoundQuestionsByDifficulty(
            QUESTIONS,
            myQueueCategory,
            PVP_ROUNDS_PER_MATCH
          );
          if (!questionSet.length) {
            queueFlowLog('matchmaking_tick:no_questions_for_bot_match', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              difficulty: myQueueCategory
            });
            await rotateUserBotQueue(selectedBotId, 'mm_no_questions').catch(() => null);
            scheduleNextBotAttempt(1, 12);
            return;
          }

	          let resolvedBotSnapshot = botSnapshot && typeof botSnapshot === 'object'
	            ? botSnapshot
	            : null;
	          let botProfile = resolvedBotSnapshot?.profile && typeof resolvedBotSnapshot.profile === 'object'
	            ? resolvedBotSnapshot.profile
	            : null;
          let botStats = resolvedBotSnapshot?.stats && typeof resolvedBotSnapshot.stats === 'object'
            ? resolvedBotSnapshot.stats
            : null;
          let botStatsFallback = resolvedBotSnapshot?.stats_is_fallback === true;

          if (!botProfile || !botStats || botStatsFallback) {
            const preparedSnapshot = String(preparedBotRef.current?.botId || '').trim() === String(selectedBotId || '').trim()
              ? (preparedBotRef.current?.snapshot || null)
              : null;
            if (preparedSnapshot && typeof preparedSnapshot === 'object') {
              resolvedBotSnapshot = preparedSnapshot;
              botProfile = resolvedBotSnapshot?.profile && typeof resolvedBotSnapshot.profile === 'object'
                ? resolvedBotSnapshot.profile
                : null;
              botStats = resolvedBotSnapshot?.stats && typeof resolvedBotSnapshot.stats === 'object'
                ? resolvedBotSnapshot.stats
                : null;
              botStatsFallback = resolvedBotSnapshot?.stats_is_fallback === true;
            }
          }

          if (!botProfile || !botStats || botStatsFallback) {
            queueFlowLog('matchmaking_tick:bot_snapshot_missing', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
                message: botStatsFallback ? 'fallback_stats' : 'missing_snapshot'
            });
            await rotateUserBotQueue(selectedBotId, 'mm_snapshot_missing').catch(() => null);
            setQueueBotExclusion(selectedBotId, 10000);
            scheduleNextBotAttempt(1, 2);
            return;
          }
          const botQueueCategory = getPvpQueueDifficultyFromStats(botStats);
          if (normalizeDifficulty(botQueueCategory || 'easy') !== myQueueCategory) {
            const botPvpCategory = getPvpDifficultyFromPoints(botStats?.pvp_points || 0);
            queueFlowLog('matchmaking_tick:bot_category_mismatch', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              botCategory: botQueueCategory,
              expectedCategory: myQueueCategory,
              botPvpCategory,
              botPvpPoints: Math.max(0, Number(botStats?.pvp_points || 0))
            });
            await rotateUserBotQueue(selectedBotId, 'mm_category_mismatch').catch(() => null);
            setQueueBotExclusion(selectedBotId, 25000);
            prepareBotForQueue(userQueueCategory, 'after_category_mismatch', true).catch(() => null);
            scheduleNextBotAttempt(1, 2);
            return;
          }
          const botPersonality = normalizeBotPersonality(
            remoteBotConfig?.personality
            || resolvedBotSnapshot?.config?.personality
            || BOT_CONFIG_DEFAULT.personality
          );
          const botStrength = normalizeBotStrength(
            remoteBotConfig?.strength
            || resolvedBotSnapshot?.config?.strength
            || BOT_CONFIG_DEFAULT.strength
          );
          const matchId = buildMatchId(authUser.uid, selectedBotId);
          const nowMs = Date.now();
          const queueElapsedBeforeCreateMs = queueSessionJoinedAtMs > 0
            ? Math.max(0, nowMs - queueSessionJoinedAtMs)
            : 0;
          if (
            queueElapsedBeforeCreateMs > 0
            && queueElapsedBeforeCreateMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS
          ) {
            queueFlowLog('matchmaking_tick:bot_create_blocked_before_min_window', {
              userId: authUser?.uid || '',
              botId: selectedBotId,
              elapsedMs: queueElapsedBeforeCreateMs
            });
            scheduleNextBotAttempt(1, 2);
            return;
          }
	          if (isQueueTickStale()) {
	            queueFlowLog('matchmaking_tick:bot_create_cancelled_before_create', {
	              userId: authUser?.uid || '',
	              botId: selectedBotId
	            });
	            return;
	          }
	          const acceptDeadlineMs = nowMs + PVP_MATCH_ACCEPT_TIMEOUT_MS;
	          const botDecisionDelayMs = PVP_BOT_DECISION_DELAY_MIN_MS
	            + Math.floor(Math.random() * (PVP_BOT_DECISION_DELAY_MAX_MS - PVP_BOT_DECISION_DELAY_MIN_MS + 1));
	          const botDecisionAtMs = nowMs + botDecisionDelayMs;
	          const botWillReject = Math.random() < 0.5;
	          const created = await createPvpMatch({
	            id: matchId,
	            status: 'pending_accept',
            difficulty: myQueueCategory,
            category: myQueueCategory,
            language: safeConfig.language,
            topic: safeConfig.topic,
            total_rounds: questionSet.length,
            round_no: 1,
            question_set: questionSet,
            player1_user_id: authUser.uid,
            player1_nickname: profile?.nickname || myQueue.nickname || 'Jogador',
            player1_avatar: profile?.avatar || myQueue.avatar || '🤓',
            player1_frame: myQueue.equipped_frame || shopData?.equipped?.frame || 'frame_default',
            player1_background: myQueue.equipped_background || shopData?.equipped?.background || 'bg_default',
            player1_emoji: myQueue.equipped_emoji || shopData?.equipped?.emoji || 'emoji_profile',
            player1_level: Math.max(1, Number(progress.level || myQueue.level || 1)),
            player1_pvp_points: Math.max(0, Number(progress.pvpPoints || myQueue.pvp_points || 0)),
            player1_pvp_battles: Math.max(0, Number(progress.pvpBattles || 0)),
            player1_accept_state: 'pending',
            player2_user_id: selectedBotId,
            player2_nickname: botProfile.nickname || SYSTEM_BOT_NICKNAME,
            player2_avatar: botProfile.avatar || '🤖',
            player2_frame: botProfile.equipped_frame || 'frame_default',
            player2_background: botProfile.equipped_background || 'bg_default',
            player2_emoji: botProfile.equipped_emoji || 'emoji_profile',
            player2_level: Math.max(1, Number(botStats.level || 1)),
	            player2_pvp_points: Math.max(0, Number(botStats.pvp_points || 0)),
	            player2_pvp_battles: Math.max(0, Number(botStats.pvp_battles || 0)),
	            player2_bot_strength: botStrength,
	            player2_accept_state: 'pending',
	            bot_user_id: selectedBotId,
	            bot_personality: botPersonality,
	            bot_strength: botStrength,
	            queue_joined_at_ms: queueSessionJoinedAtMs || Date.now(),
	            queue_session_id: effectQueueSessionId,
	            bot_decision_at_ms: botDecisionAtMs,
	            bot_decision_done: 'false',
	            bot_will_reject: botWillReject ? 'true' : 'false',
	            bot_user_queue_rotated: false,
	            accept_deadline_ms: acceptDeadlineMs,
            start_countdown_ms: 0,
            both_accepted_at_ms: 0,
            reject_at_ms: 0,
            player1_score: 0,
            player2_score: 0,
            host_user_id: authUser.uid,
            is_bot_match: true,
            round_started_at_ms: 0,
            round_started_at: null,
            created_at: new Date(nowMs).toISOString(),
            updated_at: new Date(nowMs).toISOString()
          }).catch((error) => {
            console.error('matchmaking bot create failed:', error);
            return null;
          });

	          if (!created?.id) {
            queueFlowLog('matchmaking_tick:bot_match_create_failed', {
              userId: authUser?.uid || '',
              botId: selectedBotId
            });
            await rotateUserBotQueue(selectedBotId, 'mm_create_failed').catch(() => null);
	            scheduleNextBotAttempt(1, 3);
	            return;
	          }
	          if (isQueueTickStale()) {
	            queueFlowLog('matchmaking_tick:bot_match_voided_after_cancel', {
	              userId: authUser?.uid || '',
	              botId: selectedBotId,
	              matchId: created.id
	            });
	            await updatePvpMatch(created.id, {
	              status: 'finished',
	              ended_reason: 'queue_cancelled_before_attach',
	              ended_by_user_id: authUser?.uid || null,
	              ended_at: nowIso(),
	              winner_user_id: null,
	              result_void: true,
	              result_void_reason: 'queue_cancelled_before_attach',
	              history_hidden: true,
	              history_hidden_reason: 'queue_cancelled_before_attach'
	            }).catch(() => null);
	            await clearBotBusy(selectedBotId, created.id).catch(() => null);
	            return;
	          }
	          const busyMarked = await setBotBusy(selectedBotId, {
	            reason: 'user_match_pending',
	            source: 'user',
	            match_id: created.id
          }).catch((error) => {
            console.error('matchmaking bot busy mark failed:', error);
            return null;
          });
	          if (!busyMarked) {
	            console.warn('matchmaking bot busy mark unavailable, voiding created match');
	            queueFlowLog('matchmaking_tick:bot_busy_mark_failed', {
	              userId: authUser?.uid || '',
	              botId: selectedBotId,
	              matchId: created.id
		            });
	            await updatePvpMatch(created.id, {
	              status: 'finished',
	              ended_reason: 'bot_busy_conflict',
	              ended_by_user_id: null,
	              ended_at: nowIso(),
	              winner_user_id: null,
	              result_void: true,
	              result_void_reason: 'bot_busy_conflict',
	              history_hidden: true,
	              history_hidden_reason: 'bot_busy_conflict'
	            }).catch(() => null);
	            await rotateUserBotQueue(selectedBotId, 'mm_busy_conflict').catch(() => null);
	            setQueueBotExclusion(selectedBotId, 12000);
	            scheduleNextBotAttempt(1, 3);
	            return;
	          }
	          if (isQueueTickStale()) {
	            queueFlowLog('matchmaking_tick:bot_match_voided_before_attach', {
	              userId: authUser?.uid || '',
	              botId: selectedBotId,
	              matchId: created.id
	            });
	            await updatePvpMatch(created.id, {
	              status: 'finished',
	              ended_reason: 'queue_cancelled_before_attach',
	              ended_by_user_id: authUser?.uid || null,
	              ended_at: nowIso(),
	              winner_user_id: null,
	              result_void: true,
	              result_void_reason: 'queue_cancelled_before_attach',
	              history_hidden: true,
	              history_hidden_reason: 'queue_cancelled_before_attach'
	            }).catch(() => null);
	            await clearBotBusy(selectedBotId, created.id).catch(() => null);
	            return;
	          }
	          const queueElapsedMsAtMatch = queueSessionJoinedAtMs > 0
	            ? Math.max(0, Date.now() - queueSessionJoinedAtMs)
	            : 0;
	          queueFlowLog('matchmaking_tick:bot_match_created', {
	            userId: authUser?.uid || '',
	            botId: selectedBotId,
	            matchId: created.id,
	            difficulty: myQueueCategory,
	            queue_elapsed_ms: queueElapsedMsAtMatch,
	            queue_elapsed_seconds: Number((queueElapsedMsAtMatch / 1000).toFixed(2)),
	            sla_in_window_15_27s: queueElapsedMsAtMatch >= 15000 && queueElapsedMsAtMatch <= 27000
	          });
            setQueueBotExclusion('', 0);
	          await attachToMatch(created.id);
	        } finally {
          clearPreparedBot();
          await releasePairLock(authUser.uid, selectedBotId, authUser.uid).catch(() => null);
        }
      } catch (error) {
        console.error('matchmaking tick failed:', error);
        queueFlowLog('matchmaking_tick:error', {
          userId: authUser?.uid || '',
          message: String(error?.message || error || 'unknown_error')
        });
        scheduleNextBotAttempt(1, 12);
      } finally {
        tickRunning = false;
        tickStartedAtMs = 0;
      }
    }

    tickMatchmaking().catch(() => null);
    matchmakingIntervalRef.current = setInterval(() => {
      tickMatchmaking().catch(() => null);
    }, 1000);
	    const cleanupTimer = setInterval(() => {
	      cleanupStaleQueueEntries(300, authUser.uid).catch(() => null);
	      cleanupStalePairLocks(25, 80).catch(() => null);
	    }, 12000);

    return () => {
      cancelled = true;
      if (matchmakingIntervalRef.current) {
        clearInterval(matchmakingIntervalRef.current);
        matchmakingIntervalRef.current = null;
      }
      clearInterval(cleanupTimer);
    };
  }, [pvpState.status, authUser?.uid, profile?.nickname, profile?.avatar, shopData?.equipped?.frame, shopData?.equipped?.background, shopData?.equipped?.emoji, pvpConfig, progress?.level, progress?.pvpPoints]);

  useEffect(() => {
    if (pvpState.status !== 'active' && pvpState.status !== 'pending_accept' && pvpState.status !== 'round_result') return;
    const matchId = String(pvpState.matchId || '').trim();
    if (!matchId) return;

    const unsubscribe = subscribeMatch(
      matchId,
      (matchRow) => {
        pvpRealtimeMatchUpdateAtRef.current = Date.now();
        if (!matchRow) {
          setPvpState((prev) => ({
            ...prev,
            status: 'idle',
            match: null,
            matchId: '',
            answers: [],
            error: 'Partida nao encontrada.'
          }));
          setScreen('challenge');
          return;
        }

        const status = String(matchRow.status || '');
        const roundNo = Math.max(1, Number(matchRow.round_no || 1));
        const roundStartMs = Math.max(
          0,
          Number(matchRow.round_started_at_ms || toMillis(matchRow.round_started_at) || 0)
        );

        setPvpState((prev) => {
          const prevRound = Math.max(1, Number(prev.match?.round_no || 1));
          const roundChanged = prevRound !== roundNo;
          const nextStatus = status === 'finished'
            ? 'finished'
            : (status === 'pending_accept' ? 'pending_accept' : 'active');
          const resolvedStatus = status === 'round_result' ? 'round_result' : nextStatus;
          return {
            ...prev,
            match: matchRow,
            answers: roundChanged ? [] : prev.answers,
            roundStartMs,
            submitted: roundChanged ? false : prev.submitted,
            selectedIndex: roundChanged ? null : prev.selectedIndex,
            status: resolvedStatus,
            error: ''
          };
        });

        if (status === 'finished') {
          handlePvpMatchFinished(matchRow).catch(() => null);
          const endedReason = String(matchRow?.ended_reason || '').trim().toLowerCase();
          const endedBy = String(matchRow?.ended_by_user_id || matchRow?.forfeit_by_user_id || '').trim();
          const currentUserId = String(authUser?.uid || '').trim();
          const isCompensationFlow = endedReason === 'forfeit' && endedBy && endedBy !== currentUserId;
          const skipResultScreen = isInvalidFinishedMatch(matchRow)
            || endedReason === 'match_refused'
            || endedReason === 'accept_timeout';
          if (skipResultScreen) {
            setPvpResultTransitionMode('');
            const shouldResume = shouldResumeQueueAfterMatchRefused(matchRow, currentUserId);
            if (!shouldResume) {
              if (currentUserId) leaveQueue(currentUserId).catch(() => null);
              resetPvpState();
            }
            setScreen('challenge');
          } else if (isCompensationFlow) {
            setPvpResultTransitionMode('opponent_left');
            setScreen('pvp-result');
          } else {
            setPvpResultTransitionMode('');
            setScreen('pvp-result');
          }
        } else if (status === 'pending_accept') {
          setScreen('challenge');
        } else if (status === 'round_result') {
          setScreen('pvp');
        } else {
          setScreen('pvp');
        }
      },
      (error) => {
        console.error('match subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pvpState.status, pvpState.matchId, authUser?.uid]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'active' && safeStatus !== 'pending_accept' && safeStatus !== 'round_result') return;
    const matchId = String(pvpState.matchId || pvpState.match?.id || '').trim();
    if (!matchId) return;

    let cancelled = false;
    const intervalMs = 1300;

    const syncMatchFallback = async () => {
      if (cancelled) return;
      const sinceRealtimeMs = Date.now() - Math.max(0, Number(pvpRealtimeMatchUpdateAtRef.current || 0));
      if (sinceRealtimeMs < 2200) return;

      const latest = await getPvpMatch(matchId).catch(() => null);
      if (cancelled || !latest) return;
      pvpRealtimeMatchUpdateAtRef.current = Date.now();
      const latestStatus = String(latest.status || '').trim().toLowerCase();

      if (latestStatus === 'finished') {
        setPvpState((prev) => ({
          ...prev,
          status: 'finished',
          match: latest
        }));

        handlePvpMatchFinished(latest).catch(() => null);
        const endedReason = String(latest?.ended_reason || '').trim().toLowerCase();
        const endedBy = String(latest?.ended_by_user_id || latest?.forfeit_by_user_id || '').trim();
        const currentUserId = String(authUser?.uid || '').trim();
        const isCompensationFlow = endedReason === 'forfeit' && endedBy && endedBy !== currentUserId;
        const skipResultScreen = isInvalidFinishedMatch(latest)
          || endedReason === 'match_refused'
          || endedReason === 'accept_timeout';

        if (skipResultScreen) {
          setPvpResultTransitionMode('');
          const shouldResume = shouldResumeQueueAfterMatchRefused(latest, currentUserId);
          if (!shouldResume) {
            if (currentUserId) leaveQueue(currentUserId).catch(() => null);
            resetPvpState();
          }
          setScreen('challenge');
        } else if (isCompensationFlow) {
          setPvpResultTransitionMode('opponent_left');
          setScreen('pvp-result');
        } else {
          setPvpResultTransitionMode('');
          setScreen('pvp-result');
        }
        return;
      }

      if (latestStatus !== 'active' && latestStatus !== 'pending_accept' && latestStatus !== 'round_result') return;
      const nextRoundNo = Math.max(1, Number(latest.round_no || 1));
      const nextRoundStartMs = Math.max(
        0,
        Number(latest.round_started_at_ms || toMillis(latest.round_started_at) || 0)
      );

      setPvpState((prev) => {
        const prevMatchId = String(prev.matchId || prev.match?.id || '').trim();
        if (prevMatchId && prevMatchId !== matchId) return prev;

        const prevRow = prev.match && typeof prev.match === 'object' ? prev.match : {};
        const prevUpdatedMs = toMillis(prevRow.updated_at || prevRow.round_started_at || prevRow.created_at);
        const nextUpdatedMs = toMillis(latest.updated_at || latest.round_started_at || latest.created_at);
        const prevRoundNo = Math.max(1, Number(prevRow.round_no || 1));
        const roundChanged = prevRoundNo !== nextRoundNo;
        const nextStatus = latestStatus === 'pending_accept'
          ? 'pending_accept'
          : latestStatus === 'round_result'
            ? 'round_result'
            : 'active';

        const shouldUpdate = roundChanged
          || nextStatus !== String(prev.status || '').trim().toLowerCase()
          || nextUpdatedMs > prevUpdatedMs;
        if (!shouldUpdate) return prev;

        if (roundChanged) {
          pvpRealtimeAnswersUpdateAtRef.current = 0;
        }

        return {
          ...prev,
          status: nextStatus,
          matchId,
          match: latest,
          roundStartMs: nextRoundStartMs,
          answers: roundChanged ? [] : prev.answers,
          submitted: roundChanged ? false : prev.submitted,
          selectedIndex: roundChanged ? null : prev.selectedIndex,
          error: ''
        };
      });
    };

    syncMatchFallback().catch(() => null);
    const timer = setInterval(() => syncMatchFallback().catch(() => null), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, pvpState.matchId, pvpState.match?.id, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    const roundNo = Math.max(1, Number(pvpState.match?.round_no || 1));
    if (!matchId) return;

    let cancelled = false;
    const intervalMs = 1200;

    const syncAnswersFallback = async () => {
      if (cancelled) return;
      const sinceRealtimeMs = Date.now() - Math.max(0, Number(pvpRealtimeAnswersUpdateAtRef.current || 0));
      if (sinceRealtimeMs < 1800) return;

      const rows = await getPvpRoundAnswers(matchId, roundNo).catch(() => []);
      if (cancelled) return;
      pvpRealtimeAnswersUpdateAtRef.current = Date.now();
      const safeRows = Array.isArray(rows) ? rows : [];

      setPvpState((prev) => {
        if (String(prev.status || '') !== 'active') return prev;
        const prevMatchId = String(prev.match?.id || prev.matchId || '').trim();
        if (prevMatchId && prevMatchId !== matchId) return prev;
        const currentRoundNo = Math.max(1, Number(prev.match?.round_no || 1));
        if (currentRoundNo !== roundNo) return prev;

        const myAnswer = safeRows.find((row) => String(row.user_id || '') === String(authUser?.uid || ''));
        const answerIdx = Number(myAnswer?.answer_idx ?? -1);
        const hasCommittedAnswer = !!myAnswer;
        const toSig = (list) => (Array.isArray(list) ? list : [])
          .map((row) => {
            const uid = String(row?.user_id || '').trim();
            const idx = Number(row?.answer_idx ?? -1);
            const at = Math.max(0, Number(row?.answered_at_ms || 0));
            return `${uid}:${idx}:${at}`;
          })
          .sort()
          .join('|');
        const prevSig = toSig(prev.answers);
        const nextSig = toSig(safeRows);
        if (prevSig === nextSig && (prev.submitted || !hasCommittedAnswer)) return prev;

        return {
          ...prev,
          answers: safeRows,
          submitted: prev.submitted || hasCommittedAnswer,
          selectedIndex: hasCommittedAnswer ? answerIdx : prev.selectedIndex
        };
      });
    };

    syncAnswersFallback().catch(() => null);
    const timer = setInterval(() => syncAnswersFallback().catch(() => null), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpState.matchId, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'pending_accept') return;
    const match = pvpState.match;
    const currentUserId = String(authUser?.uid || '').trim();
    if (!currentUserId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'pending_accept') return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || humanUserId !== currentUserId) return;

    const botIsPlayer1 = String(match.player1_user_id || '').trim() === botUserId;
    const botState = String(botIsPlayer1 ? match.player1_accept_state : match.player2_accept_state || 'pending')
      .trim()
      .toLowerCase();
    if (botState !== 'pending') return;

	    const decisionAtMs = Math.max(0, Number(match.bot_decision_at_ms || 0));
	    if (!decisionAtMs || pvpClockMs < decisionAtMs) return;
	    if (String(match.bot_decision_done || '').trim().toLowerCase() === 'true') return;

	    const forcedRejectRaw = String(match.bot_will_reject || '').trim().toLowerCase();
	    const willReject = forcedRejectRaw === 'true'
	      ? true
	      : (forcedRejectRaw === 'false' ? false : (Math.random() < 0.5));
	    const nowMs = Date.now();
	    const patch = {
	      bot_decision_done: 'true'
	    };

	    if (willReject) {
	      if (botIsPlayer1) patch.player1_accept_state = 'rejected';
	      else patch.player2_accept_state = 'rejected';
	      patch.reject_at_ms = nowMs;
	      patch.bot_user_queue_rotated = false;
	      updatePvpMatch(match.id, patch).catch(() => null);
	      clearBotBusy(botUserId, match.id).catch(() => null);
	      return;
	    }

	    if (botIsPlayer1) patch.player1_accept_state = 'accepted';
	    else patch.player2_accept_state = 'accepted';

	    const p1State = String(
	      botIsPlayer1 ? 'accepted' : (match.player1_accept_state || 'pending')
	    ).trim().toLowerCase();
    const p2State = String(
      botIsPlayer1 ? (match.player2_accept_state || 'pending') : 'accepted'
    ).trim().toLowerCase();
    if (p1State === 'accepted' && p2State === 'accepted' && !Number(match.start_countdown_ms || 0)) {
      patch.start_countdown_ms = nowMs + 3000;
      patch.both_accepted_at_ms = nowMs;
    }

	    updatePvpMatch(match.id, patch).catch(() => null);
	  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, pvpClockMs, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'pending_accept') return;
    const match = pvpState.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'pending_accept') return;

    const player1Id = String(match.player1_user_id || '').trim();
    const player2Id = String(match.player2_user_id || '').trim();
    const p1State = String(match.player1_accept_state || 'pending').trim().toLowerCase();
    const p2State = String(match.player2_accept_state || 'pending').trim().toLowerCase();
    const nowMs = Date.now();

    if (p1State === 'rejected' || p2State === 'rejected') {
      const rejectAt = Math.max(0, Number(match.reject_at_ms || nowMs));
      if (nowMs >= rejectAt + 2000) {
        updatePvpMatch(match.id, {
          status: 'finished',
          ended_reason: 'match_refused',
          ended_by_user_id: p1State === 'rejected' ? player1Id : player2Id,
          ended_at: nowIso(),
          winner_user_id: null
        }).catch(() => null);
      }
      return;
    }

    const bothAccepted = p1State === 'accepted' && p2State === 'accepted';
    if (bothAccepted) {
      const startCountdownMs = Math.max(0, Number(match.start_countdown_ms || 0));
      if (!startCountdownMs) {
        updatePvpMatch(match.id, {
          start_countdown_ms: nowMs + 3000,
          both_accepted_at_ms: nowMs,
          accept_deadline_ms: 0
        }).catch(() => null);
        return;
      }
      if (nowMs >= startCountdownMs) {
        updatePvpMatch(match.id, {
          status: 'active',
          round_no: Math.max(1, Number(match.round_no || 1)),
          round_started_at_ms: nowMs,
          round_started_at: nowIso(),
          ended_reason: null,
          reject_at_ms: 0,
          start_countdown_ms: 0
        }).catch(() => null);
      }
      return;
    }

    const acceptDeadlineMs = Math.max(0, Number(match.accept_deadline_ms || 0));
    const isHost = String(match.host_user_id || match.player1_user_id || '').trim() === userId;
    if (isHost && acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs) {
      updatePvpMatch(match.id, {
        status: 'finished',
        ended_reason: 'accept_timeout',
        ended_at: nowIso(),
        winner_user_id: null
      }).catch(() => null);
    }
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, pvpClockMs, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'round_result') return;
    const match = pvpState.match;
    const userId = String(authUser?.uid || '').trim();
    if (!userId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'round_result') return;

    const nextRoundNo = Math.max(1, Number(match.next_round_no || (Number(match.round_no || 1) + 1)));
    const roundUntilMs = Math.max(0, Number(match.round_result_until_ms || 0));
    if (!roundUntilMs) {
      updatePvpMatch(match.id, {
        round_result_until_ms: Date.now() + PVP_ROUND_RESULT_DURATION_MS
      }).catch(() => null);
      return;
    }
    if (pvpClockMs < roundUntilMs) return;

    updatePvpMatch(match.id, {
      status: 'active',
      round_no: nextRoundNo,
      round_started_at_ms: Date.now(),
      round_started_at: nowIso(),
      result_round_no: null,
      result_round_winner_user_id: null,
      next_round_no: null,
      round_result_until_ms: null
    }).catch(() => null);
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, pvpClockMs, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;

    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    const roundNo = Math.max(1, Number(pvpState.match?.round_no || 1));
    if (!matchId) return;

    const unsubscribe = subscribeRoundAnswers(
      matchId,
      roundNo,
      (rows) => {
        pvpRealtimeAnswersUpdateAtRef.current = Date.now();
        const safeRows = Array.isArray(rows) ? rows : [];
        setPvpState((prev) => {
          const myAnswer = safeRows.find((row) => String(row.user_id || '') === String(authUser?.uid || ''));
          const answerIdx = Number(myAnswer?.answer_idx ?? -1);
          const hasCommittedAnswer = !!myAnswer;
          return {
            ...prev,
            answers: safeRows,
            submitted: prev.submitted || hasCommittedAnswer,
            selectedIndex: hasCommittedAnswer ? answerIdx : prev.selectedIndex
          };
        });
      },
      (error) => {
        console.error('answers subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpState.matchId, authUser?.uid]);

  useEffect(() => {
    const match = pvpState.match;
    const status = String(match?.status || '').trim().toLowerCase();
    if (pvpState.status !== 'active' || status !== 'active') {
      clearBotAnswerTimer();
      return;
    }
    if (!match?.id || !authUser?.uid) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) {
      clearBotAnswerTimer();
      return;
    }

    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser.uid) !== humanUserId) return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const question = match.question_set?.[roundNo - 1];
    if (!question) return;

    const liveAnswersBeforeSchedule = Array.isArray(pvpStateRef.current?.answers)
      ? pvpStateRef.current.answers
      : [];
    const botAlreadyAnswered = liveAnswersBeforeSchedule.some((row) => String(row.user_id || '') === botUserId);
    if (botAlreadyAnswered) {
      clearBotAnswerTimer();
      return;
    }

    const roundKey = `${match.id}_${roundNo}`;
    if (botAnswerRoundKeyRef.current === roundKey && botAnswerTimerRef.current) return;

    clearBotAnswerTimer();
    botAnswerRoundKeyRef.current = roundKey;

    const botStrength = getBotStrengthFromMatchRow(match, botUserId);
    const matchDifficulty = normalizeDifficulty(match.difficulty || match.category || 'easy');
    const totalRounds = Math.max(1, Number(match.total_rounds || PVP_ROUNDS_PER_MATCH));
    const player1Id = String(match.player1_user_id || '').trim();
    const botIsPlayer1 = player1Id === botUserId;
    const botScore = Math.max(0, Number(botIsPlayer1 ? match.player1_score : match.player2_score));
    const opponentScore = Math.max(0, Number(botIsPlayer1 ? match.player2_score : match.player1_score));
    const roundStartedAtMs = Math.max(
      0,
      Number(match.round_started_at_ms || toMillis(match.round_started_at) || 0)
    );
    const elapsedSinceRoundStartMs = roundStartedAtMs > 0
      ? Math.max(0, Date.now() - roundStartedAtMs)
      : 0;
    const plannedDelayMs = getBotAnswerDelayMs();
    const answerDelay = Math.max(90, plannedDelayMs - elapsedSinceRoundStartMs);

    botAnswerTimerRef.current = window.setTimeout(async () => {
      try {
        const live = pvpStateRef.current;
        const liveMatch = live?.match;
        const liveStatus = String(live?.status || '').trim().toLowerCase();
        const liveRoundNo = Math.max(1, Number(liveMatch?.round_no || 1));
        const liveMatchId = String(liveMatch?.id || live?.matchId || '').trim();
        if (liveStatus !== 'active' || liveRoundNo !== roundNo || liveMatchId !== String(match.id)) return;
        const liveAnswers = Array.isArray(live?.answers) ? live.answers : [];
        const hasBotAnswer = liveAnswers.some((row) => String(row.user_id || '') === botUserId);
        if (hasBotAnswer) return;

        const pickedIndex = pickBotAnswerIndex(question, botStrength, {
          matchId: String(match.id),
          botUserId,
          difficulty: matchDifficulty,
          roundNo,
          totalRounds,
          botScore,
          opponentScore
        });
        const nowMs = Date.now();
        const correctIndex = Number(question.answer ?? -1);

        await upsertPvpAnswer({
          match_id: String(match.id),
          round_no: roundNo,
          user_id: botUserId,
          answer_idx: pickedIndex,
          is_correct: pickedIndex >= 0 && pickedIndex === correctIndex,
          answered_at_ms: nowMs,
          answered_at: new Date(nowMs).toISOString(),
          created_at: new Date(nowMs).toISOString()
        }).catch(() => null);
      } finally {
        if (botAnswerRoundKeyRef.current === roundKey) {
          botAnswerTimerRef.current = null;
        }
      }
    }, answerDelay);

    return () => {
      if (botAnswerRoundKeyRef.current !== roundKey) return;
      clearBotAnswerTimer();
    };
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.round_no,
    pvpState.match?.status,
    authUser?.uid
  ]);

  useEffect(() => {
    const status = String(pvpState.status || '').toLowerCase();
    if (status !== 'active' && status !== 'round_result') return;
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (!matchId) return;

    const unsubscribe = subscribePvpEmojiEvents(
      matchId,
      (events) => {
        const safeEvents = Array.isArray(events) ? events : [];
        safeEvents.forEach((event) => {
          addPvpEmojiFxFromEvent(event);
        });
      },
      (error) => {
        console.error('emoji events subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pvpState.status, pvpState.match?.id, pvpState.matchId]);

  useEffect(() => {
    const match = pvpState.match;
    const status = String(pvpState.status || '').toLowerCase();
    if (status !== 'active' && status !== 'round_result') return;
    if (!match?.id) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser?.uid || '').trim() !== humanUserId) return;

    const event = latestPvpEmojiEvent;
    const eventId = String(event?.id || '').trim();
    if (!eventId || botReactionUserEmojiEventRef.current === eventId) return;
    const senderId = String(event?.sender_user_id || '').trim();
    if (!senderId || senderId === botUserId) return;
    botReactionUserEmojiEventRef.current = eventId;

    queueBotEmojiBurst({
      matchId: String(match.id),
      botUserId,
      personality: normalizeBotPersonality(match.bot_personality || BOT_CONFIG_DEFAULT.personality),
      countMin: 1,
      countMax: 2,
      intervalMinMs: 1000,
      intervalMaxMs: 2000,
      initialDelayMs: 1000 + Math.floor(Math.random() * 900)
    });
  }, [pvpState.status, pvpState.match?.id, latestPvpEmojiEvent?.id, authUser?.uid]);

  useEffect(() => {
    const match = pvpState.match;
    if (String(pvpState.status || '').toLowerCase() !== 'active') return;
    if (!match?.id) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser?.uid || '').trim() !== humanUserId) return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const roundKey = `${match.id}_first_${roundNo}`;
    if (botReactionFirstAnswerRef.current === roundKey) return;

    const answersByUser = new Map((pvpState.answers || []).map((row) => [String(row.user_id || ''), row]));
    const botAnswer = answersByUser.get(botUserId);
    const userAnswer = answersByUser.get(humanUserId);
    if (!botAnswer || !userAnswer) return;

    const botAnsweredAt = Math.max(0, Number(botAnswer.answered_at_ms || 0));
    const userAnsweredAt = Math.max(0, Number(userAnswer.answered_at_ms || 0));
    if (!botAnsweredAt || !userAnsweredAt || botAnsweredAt >= userAnsweredAt) return;

    botReactionFirstAnswerRef.current = roundKey;
    queueBotEmojiBurst({
      matchId: String(match.id),
      botUserId,
      personality: normalizeBotPersonality(match.bot_personality || BOT_CONFIG_DEFAULT.personality),
      countMin: 1,
      countMax: 2,
      intervalMinMs: 1000,
      intervalMaxMs: 2000,
      initialDelayMs: 1000 + Math.floor(Math.random() * 1000)
    });
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.round_no, pvpState.answers, authUser?.uid]);

  useEffect(() => {
    const match = pvpState.match;
    if (String(pvpState.status || '').toLowerCase() !== 'round_result') return;
    if (!match?.id) return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || String(authUser?.uid || '').trim() !== humanUserId) return;

    const resultRoundNo = Math.max(1, Number(match.result_round_no || match.round_no || 1));
    const roundKey = `${match.id}_result_${resultRoundNo}`;
    if (botReactionRoundResultRef.current === roundKey) return;
    botReactionRoundResultRef.current = roundKey;

    const question = match.question_set?.[resultRoundNo - 1];
    const correctIndex = Number(question?.answer ?? -1);
    const answersByUser = new Map((pvpState.answers || []).map((row) => [String(row.user_id || ''), row]));
    const userAnswer = answersByUser.get(humanUserId);
    const userWrong = !userAnswer || Number(userAnswer.answer_idx ?? -1) !== correctIndex;

    queueBotEmojiBurst({
      matchId: String(match.id),
      botUserId,
      personality: normalizeBotPersonality(match.bot_personality || BOT_CONFIG_DEFAULT.personality),
      countMin: userWrong ? 2 : 1,
      countMax: userWrong ? 3 : 2,
      intervalMinMs: 1000,
      intervalMaxMs: 3000,
      initialDelayMs: 1000 + Math.floor(Math.random() * 1800)
    });
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.result_round_no, pvpState.answers, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    if (!pvpMatch) return;
    if (String(pvpMatch.status || '') !== 'active') return;
    if (pvpState.submitted) return;
    if (pvpRoundRemainingMs > 0) return;
    submitPvpAnswer(-1);
  }, [pvpState.status, pvpState.submitted, pvpRoundRemainingMs, pvpMatch?.status, pvpRoundNo]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    if (!authUser?.uid) return;
    const match = pvpState.match;
    if (!match || String(match.status || '') !== 'active') return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const timedOut = pvpRoundRemainingMs <= 0;

    // Check if both players have already answered this round.
    const player1Id = String(match.player1_user_id || '');
    const player2Id = String(match.player2_user_id || '');
    const answersByUser = new Map(
      (pvpState.answers || []).map((row) => [String(row.user_id || ''), row])
    );
    const bothAnswered = player1Id && player2Id
      && answersByUser.has(player1Id)
      && answersByUser.has(player2Id);

    // Finalize when the timer expires OR when both players have answered.
    if (!timedOut && !bothAnswered) return;
    finalizePvpRound(roundNo);
  }, [pvpState.status, pvpState.match, pvpState.answers, pvpRoundRemainingMs, authUser?.uid]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    const match = pvpState.match;
    if (!match?.id || String(match.status || '').trim().toLowerCase() !== 'active') return;

    const roundNo = Math.max(1, Number(match.round_no || 1));
    const recoveryKey = `${match.id}_${roundNo}`;
    const nowMs = Date.now();
    const staleThresholdMs = pvpRoundDuration + 2400;
    if (pvpRoundElapsedMs <= staleThresholdMs) return;

    const previous = pvpForcedFinalizeRef.current && typeof pvpForcedFinalizeRef.current === 'object'
      ? pvpForcedFinalizeRef.current
      : { key: '', lastAtMs: 0 };
    if (previous.key === recoveryKey && (nowMs - Math.max(0, Number(previous.lastAtMs || 0))) < 2400) return;
    pvpForcedFinalizeRef.current = { key: recoveryKey, lastAtMs: nowMs };

    if (!pvpState.submitted) {
      submitPvpAnswer(-1).catch(() => null);
    }
    finalizePvpRound(roundNo).catch(() => null);
  }, [
    pvpState.status,
    pvpState.match,
    pvpState.submitted,
    pvpRoundElapsedMs,
    pvpRoundDuration
  ]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (safeStatus !== 'active' || !matchId) {
      pvpTimerSfxRef.current = {
        roundKey: '',
        warningPlayed: false,
        criticalPlayed: false,
        timeoutPlayed: false,
        tickSecond: -1
      };
      return;
    }

    const roundNo = Math.max(1, Number(pvpState.match?.round_no || 1));
    const roundKey = `${matchId}_${roundNo}`;
    if (pvpTimerSfxRef.current.roundKey !== roundKey) {
      pvpTimerSfxRef.current = {
        roundKey,
        warningPlayed: false,
        criticalPlayed: false,
        timeoutPlayed: false,
        tickSecond: -1
      };
    }

    if (pvpState.submitted) return;

    const remainingSec = Math.max(0, Number(pvpRoundRemainingSec || 0));
    if (remainingSec <= 10 && remainingSec > 5 && !pvpTimerSfxRef.current.warningPlayed) {
      pvpTimerSfxRef.current.warningPlayed = true;
      playSfx('pvp_time_warning');
    }
    if (remainingSec <= 5 && remainingSec > 0) {
      if (!pvpTimerSfxRef.current.criticalPlayed) {
        pvpTimerSfxRef.current.criticalPlayed = true;
        playSfx('pvp_time_critical');
      }
      if (pvpTimerSfxRef.current.tickSecond !== remainingSec) {
        pvpTimerSfxRef.current.tickSecond = remainingSec;
        playSfx('pvp_tick');
      }
    }
    if (remainingSec <= 0 && !pvpTimerSfxRef.current.timeoutPlayed) {
      pvpTimerSfxRef.current.timeoutPlayed = true;
      playSfx('pvp_timeout');
    }
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.round_no,
    pvpState.submitted,
    pvpState.matchId,
    pvpRoundRemainingSec
  ]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (safeStatus !== 'active' || !matchId) {
      if (safeStatus !== 'round_result') pvpRoundPhaseSfxKeyRef.current = '';
      return;
    }

    const roundNo = Math.max(1, Number(pvpState.match?.round_no || 1));
    const phase = roundNo > pvpBaseFinalRoundNo
      ? 'elimination'
      : (roundNo === pvpBaseFinalRoundNo ? 'final' : '');
    if (!phase) return;

    const phaseKey = `${matchId}_${roundNo}_${phase}`;
    if (pvpRoundPhaseSfxKeyRef.current === phaseKey) return;
    pvpRoundPhaseSfxKeyRef.current = phaseKey;
    playSfx(phase === 'elimination' ? 'pvp_round_elimination' : 'pvp_round_final');
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.round_no,
    pvpState.matchId,
    pvpBaseFinalRoundNo
  ]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (safeStatus !== 'round_result' || !matchId) {
      if (safeStatus !== 'active') pvpRoundResultSfxKeyRef.current = '';
      return;
    }
    const roundNo = Math.max(1, Number(pvpState.match?.result_round_no || pvpState.match?.round_no || 1));
    const cueKey = `${matchId}_${roundNo}`;
    if (pvpRoundResultSfxKeyRef.current === cueKey) return;
    pvpRoundResultSfxKeyRef.current = cueKey;
    playSfx('pvp_round_result');
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.result_round_no,
    pvpState.match?.round_no,
    pvpState.matchId
  ]);

  useEffect(() => {
    if (pvpState.status !== 'active') return;
    const match = pvpState.match;
    const currentUserId = String(authUser?.uid || '').trim();
    if (!currentUserId || !match?.id) return;
    if (String(match.status || '').trim().toLowerCase() !== 'active') return;

    const botUserId = getMatchBotUserId(match);
    if (!botUserId) return;
    const humanUserId = getMatchHumanUserId(match, botUserId);
    if (!humanUserId || humanUserId !== currentUserId) return;
    if (String(match.bot_forfeit_roll_done || '').trim().toLowerCase() === 'true') return;

    const botIsPlayer1 = String(match.player1_user_id || '').trim() === botUserId;
    const botScore = Math.max(0, Number(botIsPlayer1 ? match.player1_score : match.player2_score));
    const userScore = Math.max(0, Number(botIsPlayer1 ? match.player2_score : match.player1_score));
    const shouldCheckForfeit = userScore >= 4 && botScore >= 1 && botScore <= 2 && userScore > botScore;
    if (!shouldCheckForfeit) return;

    const nowMs = Date.now();
    const shouldForfeit = Math.random() < 0.8;
    if (!shouldForfeit) {
      updatePvpMatch(match.id, {
        bot_forfeit_roll_done: 'true',
        bot_forfeit_checked_at_ms: nowMs
      }).catch(() => null);
      return;
    }

    updatePvpMatch(match.id, {
      status: 'finished',
      winner_user_id: humanUserId,
      ended_reason: 'forfeit',
      ended_by_user_id: botUserId,
      forfeit_by_user_id: botUserId,
      ended_round_no: Math.max(1, Number(match.round_no || 1)),
      ended_at: nowIso(),
      bot_forfeit_roll_done: 'true',
      bot_forfeit_checked_at_ms: nowMs
    }).catch(() => null);
  }, [pvpState.status, pvpState.match?.id, pvpState.match?.updated_at, authUser?.uid]);

  useEffect(() => {
    const safeStatus = String(pvpState.status || '').trim().toLowerCase();
    if (safeStatus !== 'round_result') {
      clearPvpRoundResultFeedbackTimer(false);
      return;
    }
    const match = pvpState.match;
    const matchId = String(match?.id || '').trim();
    if (!matchId) return;
    const resultRoundNo = Math.max(1, Number(match?.result_round_no || match?.round_no || 1));
    const player1Id = String(match?.player1_user_id || '').trim();
    const player2Id = String(match?.player2_user_id || '').trim();
    const correctIndex = Number(match?.question_set?.[resultRoundNo - 1]?.answer ?? -1);
    const answersByUser = new Map((pvpState.answers || []).map((row) => [String(row.user_id || ''), row]));
    if (!player1Id || !player2Id) return;
    if (!answersByUser.has(player1Id) || !answersByUser.has(player2Id)) return;
    const feedbackKey = `${matchId}_${resultRoundNo}`;
    if (pvpRoundResultFeedbackKeyRef.current === feedbackKey) return;
    pvpRoundResultFeedbackKeyRef.current = feedbackKey;
    clearPvpRoundResultFeedbackTimer(false);
    const player1Feedback = getPvpRoundAnswerFeedback(answersByUser.get(player1Id), correctIndex);
    const player2Feedback = getPvpRoundAnswerFeedback(answersByUser.get(player2Id), correctIndex);
    const currentUserId = String(authUser?.uid || '').trim();
    const amPlayer1 = currentUserId && currentUserId === player1Id;
    const myFeedback = amPlayer1 ? player1Feedback : player2Feedback;
    const opponentFeedback = amPlayer1 ? player2Feedback : player1Feedback;

    playSfx(myFeedback.isCorrect ? 'pvp_correct' : 'pvp_wrong');
    if (typeof window !== 'undefined') {
      pvpRoundResultFeedbackTimerRef.current = window.setTimeout(() => {
        playSfx(opponentFeedback.isCorrect ? 'pvp_correct' : 'pvp_wrong');
        pvpRoundResultFeedbackTimerRef.current = null;
      }, 240);
    }
  }, [
    pvpState.status,
    pvpState.match?.id,
    pvpState.match?.result_round_no,
    pvpState.match?.updated_at,
    pvpState.answers,
    authUser?.uid
  ]);

  useEffect(() => {
    if (screen !== 'pvp-result') {
      clearPvpResultAudioTimers(true);
      return;
    }

    const matchId = String(pvpState.match?.id || pvpState.matchId || '').trim();
    if (!matchId) return;
    const transitionActive = pvpResultTransitionMode === 'opponent_left' && !pvpCompensation;

    if (transitionActive) {
      const cueKey = `transition_${matchId}`;
      if (pvpResultAudioKeyRef.current === cueKey) return;
      clearPvpResultAudioTimers(false);
      pvpResultAudioKeyRef.current = cueKey;
      playSfx('pvp_transition');
      if (typeof window !== 'undefined') {
        const tensionTimer = window.setTimeout(() => {
          playSfx('pvp_time_critical');
        }, 460);
        pvpResultAudioTimersRef.current = [tensionTimer];
      }
      return;
    }

    if (pvpCompensation) {
      const compensationKey = String(pvpCompensation?.matchId || matchId).trim();
      const cueKey = `comp_${compensationKey}`;
      if (pvpResultAudioKeyRef.current === cueKey) return;
      clearPvpResultAudioTimers(false);
      pvpResultAudioKeyRef.current = cueKey;
      playSfx('pvp_result_reveal');
      if (typeof window !== 'undefined') {
        const winTimer = window.setTimeout(() => {
          playSfx('pvp_result_win');
        }, 320);
        const rewardTimer = window.setTimeout(() => {
          playSfx('coin');
        }, 820);
        pvpResultAudioTimersRef.current = [winTimer, rewardTimer];
      }
      return;
    }

    const currentResult = getPvpResultForUser(pvpState.match, authUser?.uid || '');
    const cueKey = `result_${matchId}_${currentResult}`;
    if (pvpResultAudioKeyRef.current === cueKey) return;
    clearPvpResultAudioTimers(false);
    pvpResultAudioKeyRef.current = cueKey;
    playSfx('pvp_result_reveal');
    if (typeof window !== 'undefined') {
      const outcomeTimer = window.setTimeout(() => {
        if (currentResult === 'win') playSfx('pvp_result_win');
        else if (currentResult === 'draw') playSfx('pvp_result_draw');
        else playSfx('pvp_result_loss');
      }, 300);
      const accentTimer = window.setTimeout(() => {
        if (currentResult === 'win') playSfx('coin');
        else if (currentResult === 'draw') playSfx('notify');
        else playSfx('error');
      }, 760);
      pvpResultAudioTimersRef.current = [outcomeTimer, accentTimer];
    }
  }, [
    screen,
    pvpState.match?.id,
    pvpState.matchId,
    pvpState.match?.winner_user_id,
    pvpState.match?.ended_reason,
    authUser?.uid,
    pvpCompensation,
    pvpResultTransitionMode
  ]);

  useEffect(() => {
    if (pvpState.status === 'queueing') setScreen('challenge');
  }, [pvpState.status]);

  useEffect(() => {
    if (selectedLanguage) return;
    if (!LANGUAGES.length) return;
    setSelectedLanguage(LANGUAGES[0].id);
  }, [selectedLanguage]);

  useEffect(() => {
    if (screen === 'quiz') return;
    if (quizMenuOpen) setQuizMenuOpen(false);
  }, [screen, quizMenuOpen]);

  useEffect(() => {
    if (!selectedLanguage) return;
    const topics = getTopicsByLanguage(TOPICS, selectedLanguage);
    if (!topics.length) {
      if (selectedTopic) setSelectedTopic('');
      return;
    }
    if (!topics.some((topic) => topic.id === selectedTopic)) {
      setSelectedTopic(topics[0].id);
    }
  }, [selectedLanguage, selectedTopic]);

  const languageById = useMemo(
    () => new Map(LANGUAGES.map((language) => [language.id, language])),
    []
  );

  const languageIdsByLength = useMemo(
    () => LANGUAGES.map((language) => language.id).sort((a, b) => b.length - a.length),
    []
  );

  const topicProgressEntries = useMemo(() => (
    Object.entries(progress.topicProgress || {})
      .map(([key, value]) => {
        const parsed = parseTopicProgressKey(key, languageIdsByLength);
        return {
          key,
          value: Math.max(0, Number(value || 0)),
          parsed
        };
      })
      .filter((entry) => entry.parsed.language && entry.parsed.topic && entry.parsed.difficulty)
  ), [progress.topicProgress, languageIdsByLength]);

  const languageProgress = useMemo(() => {
    const result = new Map();
    LANGUAGES.forEach((language) => {
      const entries = topicProgressEntries.filter((entry) => entry.parsed.language === language.id);
      if (!entries.length) {
        result.set(language.id, 0);
        return;
      }
      const total = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry.value || 0)), 0);
      result.set(language.id, Math.round(total / entries.length));
    });
    return result;
  }, [topicProgressEntries]);

  const languageThemeSections = useMemo(() => {
    const used = new Set();
    const sections = LANGUAGE_THEME_GROUPS.map((group) => {
      const items = group.languages
        .map((id) => languageById.get(id))
        .filter(Boolean);
      items.forEach((item) => used.add(item.id));
      return { ...group, items };
    }).filter((section) => section.items.length > 0);

    const remaining = LANGUAGES.filter((language) => !used.has(language.id));
    if (remaining.length) {
      sections.push({
        id: 'more',
        label: 'Outros temas',
        desc: 'Demais trilhas disponiveis no app.',
        items: remaining
      });
    }

    return sections;
  }, [languageById]);

  const topicProgress = useMemo(() => {
    const result = new Map();
    topicProgressEntries.forEach((entry) => {
      const { parsed } = entry;
      if (parsed.language !== selectedLanguage) return;
      const current = Math.max(0, Number(result.get(parsed.topic) || 0));
      const next = Math.max(0, Number(entry.value || 0));
      result.set(parsed.topic, Math.max(current, next));
    });
    return result;
  }, [topicProgressEntries, selectedLanguage]);

  const topicQuestionCount = useMemo(() => {
    const result = new Map();
    const languageQuestions = QUESTIONS[selectedLanguage] && typeof QUESTIONS[selectedLanguage] === 'object'
      ? QUESTIONS[selectedLanguage]
      : {};

    selectedTopics.forEach((topic) => {
      const topicPack = languageQuestions[topic.id] && typeof languageQuestions[topic.id] === 'object'
        ? languageQuestions[topic.id]
        : {};
      const perDifficulty = ['easy', 'medium', 'hard'].map((diff) => (
        Math.min(QUESTIONS_PER_ROUND, Array.isArray(topicPack[diff]) ? topicPack[diff].length : 0)
      ));
      result.set(topic.id, Math.max(0, ...perDifficulty));
    });

    return result;
  }, [selectedLanguage, selectedTopics]);

  const selectedTopicQuestionCountByDifficulty = useMemo(() => {
    const languageQuestions = QUESTIONS[selectedLanguage] && typeof QUESTIONS[selectedLanguage] === 'object'
      ? QUESTIONS[selectedLanguage]
      : {};
    const topicPack = languageQuestions[selectedTopic] && typeof languageQuestions[selectedTopic] === 'object'
      ? languageQuestions[selectedTopic]
      : {};

    return {
      easy: Math.min(QUESTIONS_PER_ROUND, Array.isArray(topicPack.easy) ? topicPack.easy.length : 0),
      medium: Math.min(QUESTIONS_PER_ROUND, Array.isArray(topicPack.medium) ? topicPack.medium.length : 0),
      hard: Math.min(QUESTIONS_PER_ROUND, Array.isArray(topicPack.hard) ? topicPack.hard.length : 0)
    };
  }, [selectedLanguage, selectedTopic]);

  const selectedTopicDifficultyProgress = useMemo(() => {
    const byDifficulty = {};
    ['easy', 'medium', 'hard'].forEach((difficulty) => {
      const quizKey = getQuizKey(selectedLanguage, selectedTopic, difficulty);
      const bestPct = Math.max(0, Number(progress.topicProgress?.[quizKey] || 0));
      const bestCorrect = Math.max(0, Number(progress.quizBestScores?.[quizKey] || 0));
      byDifficulty[difficulty] = {
        pct: bestPct,
        bestCorrect,
        total: Math.max(0, Number(selectedTopicQuestionCountByDifficulty[difficulty] || 0))
      };
    });
    return byDifficulty;
  }, [
    selectedLanguage,
    selectedTopic,
    progress.topicProgress,
    progress.quizBestScores,
    selectedTopicQuestionCountByDifficulty
  ]);

  const selectedLanguageMeta = languageById.get(selectedLanguage) || null;
  const selectedTopicMeta = selectedTopics.find((topic) => topic.id === selectedTopic) || null;
  const nicknameValidation = useMemo(
    () => validateNicknameInput(String(profileDraft.nickname || '').trim()),
    [profileDraft.nickname]
  );
  const nicknameChanged = String(profileDraft.nickname || '').trim() !== String(profile?.nickname || '').trim();
  const nicknameHintClass = nicknameChanged && !nicknameValidation.ok ? 'error' : '';
  const nicknameHintText = nicknameChanged && !nicknameValidation.ok
    ? nicknameValidation.errorMessage
    : NICKNAME_RULE_COPY;
  const unlockedSet = useMemo(() => new Set(progress.achievements || []), [progress.achievements]);

  const pvpQueueElapsedMs = pvpState.queueJoinedAtMs > 0
    ? Math.max(0, pvpClockMs - Number(pvpState.queueJoinedAtMs || 0))
    : 0;
  const pvpQueueSec = Math.floor(pvpQueueElapsedMs / 1000);
  const pvpQueueTimeLabel = `${String(Math.floor(pvpQueueSec / 60)).padStart(2, '0')}:${String(
    pvpQueueSec % 60
  ).padStart(2, '0')}`;
  const arenaOnlineLiveCount = Math.max(1, Number(arenaOnlineDisplay || arenaMetrics.online || 1));
  const hasRealtimeIssue = realtimeConnectionSeen && !realtimeConnected;
  const showNetworkWarning = !browserOnline || hasRealtimeIssue;
  const networkWarningText = !browserOnline
    ? 'Sem internet no dispositivo. Alguns botoes podem ficar sem resposta.'
    : 'Conexao instavel com o servidor. Tentando reconectar...';
  const networkWarningModeClass = !browserOnline ? 'offline' : 'degraded';

  const pvpPlayer1Id = String(pvpMatch?.player1_user_id || '');
  const pvpPlayer2Id = String(pvpMatch?.player2_user_id || '');
  const pvpAnswersByUser = new Map(
    (pvpState.answers || []).map((answer) => [String(answer.user_id || ''), answer])
  );
  const pvpHasPlayer1Answer = pvpAnswersByUser.has(pvpPlayer1Id);
  const pvpHasPlayer2Answer = pvpAnswersByUser.has(pvpPlayer2Id);
  const pvpWaitingOpponent = pvpState.submitted && !(pvpHasPlayer1Answer && pvpHasPlayer2Answer);
  const pvpTimerPctRaw = (pvpRoundRemainingMs / Math.max(1, pvpRoundDuration)) * 100;
  const pvpTimerPct = Number.isFinite(pvpTimerPctRaw)
    ? Math.max(0, Math.min(100, pvpTimerPctRaw))
    : 100;
  const pvpTimerClass = pvpTimerPct <= 18 ? 'danger' : pvpTimerPct <= 40 ? 'warning' : '';
  const pvpTimerVisualClass = pvpTimerClass === 'danger'
    ? 'time-critical'
    : (pvpTimerClass === 'warning' ? 'time-warning' : '');
  const pvpIsEliminationRound = pvpRoundNo > pvpBaseFinalRoundNo;
  const pvpIsFinalRound = pvpRoundNo === pvpBaseFinalRoundNo;
  const pvpRoundPhaseClass = pvpIsEliminationRound
    ? 'phase-elimination'
    : (pvpIsFinalRound ? 'phase-final' : '');
  const pvpRoundPhaseLabel = pvpIsEliminationRound
    ? 'Eliminatoria'
    : (pvpIsFinalRound ? 'Rodada final' : '');
  const pvpIsRoundResult = String(pvpState.status || '') === 'round_result';
  const pvpRoundResultUntilMs = Math.max(0, Number(pvpMatch?.round_result_until_ms || 0));
  const pvpRoundResultRemainingSec = Math.max(0, Math.ceil((pvpRoundResultUntilMs - pvpClockMs) / 1000));
  const pvpRoundResultNo = Math.max(1, Number(pvpMatch?.result_round_no || pvpMatch?.round_no || 1));
  const pvpRoundResultIsElimination = pvpRoundResultNo > pvpBaseFinalRoundNo;
  const pvpRoundResultIsFinal = pvpRoundResultNo === pvpBaseFinalRoundNo;
  const pvpRoundResultPhaseClass = pvpRoundResultIsElimination
    ? 'phase-elimination'
    : (pvpRoundResultIsFinal ? 'phase-final' : '');
  const pvpRoundResultKicker = pvpRoundResultIsElimination
    ? 'Resultado da rodada eliminatoria'
    : (pvpRoundResultIsFinal ? 'Resultado da rodada final' : 'Resultado da rodada');
  const pvpRoundResultCountdownClass = pvpRoundResultRemainingSec <= 2 ? 'is-urgent' : '';
  const pvpRoundResultQuestion = pvpMatch?.question_set?.[pvpRoundResultNo - 1] || null;
  const pvpRoundResultCorrectIndex = Number(pvpRoundResultQuestion?.answer ?? -1);
  const pvpRoundPlayer1Feedback = getPvpRoundAnswerFeedback(
    pvpAnswersByUser.get(pvpPlayer1Id),
    pvpRoundResultCorrectIndex
  );
  const pvpRoundPlayer2Feedback = getPvpRoundAnswerFeedback(
    pvpAnswersByUser.get(pvpPlayer2Id),
    pvpRoundResultCorrectIndex
  );
  const pvpRoundResultWinnerId = String(pvpMatch?.result_round_winner_user_id || '').trim();
  const pvpRoundResultLabel = pvpRoundResultWinnerId
    ? (pvpRoundResultWinnerId === pvpPlayer1Id
      ? `${pvpMatch?.player1_nickname || 'Jogador 1'} venceu a rodada`
      : `${pvpMatch?.player2_nickname || 'Jogador 2'} venceu a rodada`)
    : 'Rodada empatada';
  const matchMyAcceptState = getMatchPlayerAcceptState(pvpMatch, authUser?.uid || '');
  const matchPlayer1AcceptState = getMatchPlayerAcceptState(pvpMatch, pvpPlayer1Id);
  const matchPlayer2AcceptState = getMatchPlayerAcceptState(pvpMatch, pvpPlayer2Id);
  const matchAcceptDeadlineMs = Math.max(0, Number(pvpMatch?.accept_deadline_ms || 0));
  const matchAcceptRemainingSec = Math.max(0, Math.ceil((matchAcceptDeadlineMs - pvpClockMs) / 1000));
  const matchStartCountdownMs = Math.max(0, Number(pvpMatch?.start_countdown_ms || 0));
  const matchStartRemainingSec = Math.max(0, Math.ceil((matchStartCountdownMs - pvpClockMs) / 1000));
  const matchBothAccepted = matchPlayer1AcceptState === 'accepted' && matchPlayer2AcceptState === 'accepted';
  const matchHasRejection = matchPlayer1AcceptState === 'rejected' || matchPlayer2AcceptState === 'rejected';
  const shouldShowAcceptActions = pvpState.status === 'pending_accept'
    && matchMyAcceptState === 'pending'
    && !matchBothAccepted
    && !matchHasRejection;

  const matchAcceptCountdownLabel = matchBothAccepted
    ? `Começando a partida em ${Math.max(0, matchStartRemainingSec)}s.`
    : matchHasRejection
      ? 'Confronto recusado.'
      : matchMyAcceptState === 'accepted'
        ? 'Aguardando oponente aceitar.'
        : `Tempo para aceitar: ${Math.max(0, matchAcceptRemainingSec)}s`;
  const matchOpponentName = String(
    (String(authUser?.uid || '').trim() === pvpPlayer1Id
      ? pvpMatch?.player2_nickname
      : pvpMatch?.player1_nickname) || 'Oponente'
  );

  const adminBotQuizLiveRows = useMemo(() => {
    const state = botArenaQuizState && typeof botArenaQuizState === 'object'
      ? botArenaQuizState
      : null;
    if (!state) return [];
    if (String(state.status || '').trim().toLowerCase() !== 'active') return [];
    const assignments = Array.isArray(state.assignments)
      ? state.assignments.filter((entry) => entry && typeof entry === 'object' && entry.bot_id)
      : [];
    if (!assignments.length) return [];

    const normalizeBotLabel = (botId) => {
      const safe = String(botId || '').trim();
      if (!safe) return 'Bot';
      return safe.replace(/^bot_sys_codequiz_/, '');
    };

    const first = assignments[0] || {};
    const hasSecondAssignment = assignments.length > 1;
    const second = assignments[1] || null;
    const startedAtMs = Math.max(0, Number(state.started_at_ms || 0));
    const updatedAtMs = Math.max(startedAtMs, Number(toMillis(state.updated_at) || 0));
    const rowId = String(state.batch_id || '').trim() || `quiz_${startedAtMs || Date.now()}`;
    const difficulty = normalizeDifficulty(first.difficulty || state.cursor_difficulty || 'easy');

    return [{
      id: `bot_quiz_${rowId}`,
      status: 'active',
      is_bot_quiz: true,
      bot_quiz_batch_id: rowId,
      bot_quiz_difficulty: difficulty,
      bot_quiz_assignments: assignments,
      player1_user_id: String(first.bot_id || ''),
      player2_user_id: hasSecondAssignment ? String(second?.bot_id || '') : '',
      player1_nickname: normalizeBotLabel(first.bot_id),
      player2_nickname: hasSecondAssignment ? normalizeBotLabel(second?.bot_id) : 'Quiz solo',
      player1_bot_strength: normalizeBotStrength(first.bot_strength || getBotDefaultStrengthById(first.bot_id)),
      player2_bot_strength: hasSecondAssignment
        ? normalizeBotStrength(second?.bot_strength || getBotDefaultStrengthById(second?.bot_id))
        : '',
      player1_score: Math.max(0, Number(first.correct_count || 0)),
      player2_score: hasSecondAssignment ? Math.max(0, Number(second?.correct_count || 0)) : 0,
      total_rounds: Math.max(1, Number(first.total_questions || QUESTIONS_PER_ROUND)),
      round_no: 1,
      created_at: startedAtMs > 0 ? new Date(startedAtMs).toISOString() : '',
      updated_at: updatedAtMs > 0 ? new Date(updatedAtMs).toISOString() : ''
    }];
  }, [botArenaQuizState]);

  const adminLiveMatches = useMemo(() => {
    const nowMs = Date.now();
    const rows = [
      ...(Array.isArray(adminMatches) ? adminMatches : []),
      ...adminBotQuizLiveRows
    ];
    const sorted = rows
      .filter((row) => isAdminLiveMatchRow(row, nowMs))
      .sort((a, b) => (
        toMillis(b?.updated_at || b?.round_started_at || b?.created_at)
        - toMillis(a?.updated_at || a?.round_started_at || a?.created_at)
      ));
    const seenPendingPair = new Set();
    const deduped = [];
    sorted.forEach((row) => {
      const status = String(row?.status || '').trim().toLowerCase();
      if (status !== 'pending_accept') {
        deduped.push(row);
        return;
      }
      const p1 = String(row?.player1_user_id || '').trim();
      const p2 = String(row?.player2_user_id || '').trim();
      const pairKey = [p1, p2].filter(Boolean).sort().join('__');
      if (!pairKey) {
        deduped.push(row);
        return;
      }
      if (seenPendingPair.has(pairKey)) return;
      seenPendingPair.add(pairKey);
      deduped.push(row);
    });
    return deduped;
  }, [adminMatches, adminBotQuizLiveRows]);

  const adminHistoryTodayMatches = useMemo(() => {
    const rows = Array.isArray(adminMatches) ? adminMatches : [];
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    return rows
      .filter((row) => {
        const status = String(row?.status || '').trim().toLowerCase();
        if (status !== 'finished') return false;
        if (row?.result_void === true || row?.history_hidden === true) return false;
        const hasWinner = !!String(row?.winner_user_id || '').trim();
        if (!hasWinner && row?.is_bot_quiz !== true) return false;
        if (isInvalidFinishedMatch(row)) return false;
        const endedMs = toMillis(row?.ended_at || row?.updated_at || row?.created_at);
        return endedMs >= dayStart && endedMs < dayEnd;
      })
      .sort((a, b) => (
        toMillis(b?.ended_at || b?.updated_at || b?.created_at)
        - toMillis(a?.ended_at || a?.updated_at || a?.created_at)
      ));
  }, [adminMatches]);

  const adminHistoryDateLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR');
  }, [pvpClockMs]);

  const botArenaDaemonMasterEnabled = botArenaDaemonControl?.arena_enabled !== false;
  const botArenaPvpEnabled = botArenaDaemonMasterEnabled && botArenaDaemonControl?.pvp_enabled !== false;
  const botArenaQuizEnabled = botArenaDaemonMasterEnabled && botArenaDaemonControl?.quiz_enabled !== false;
  const botArenaBattlesEnabled = botArenaPvpEnabled || botArenaQuizEnabled;
  const botArenaDaemonModeLabel = useMemo(() => {
    const status = String(botArenaDaemonStatus?.status || '').trim().toLowerCase();
    if (status === 'running') return 'Ativo';
    if (status === 'starting') return 'Inicializando';
    if (status === 'idle') return 'Em espera';
    return 'Indisponivel';
  }, [botArenaDaemonStatus?.status]);
  const botArenaDaemonUpdatedAtLabel = useMemo(() => {
    const stamp = Math.max(
      0,
      Number(botArenaDaemonStatus?.updated_at_ms || toMillis(botArenaDaemonStatus?.updated_at))
    );
    if (!stamp) return '--:--:--';
    return new Date(stamp).toLocaleTimeString('pt-BR');
  }, [botArenaDaemonStatus?.updated_at_ms, botArenaDaemonStatus?.updated_at]);

  const adminMatchCodeById = useMemo(() => {
    const map = new Map();
    const rows = Array.isArray(adminMatches)
      ? adminMatches.filter((row) => {
        if (!row || typeof row !== 'object' || !row.id) return false;
        if (row.result_void === true || row.history_hidden === true) return false;
        if (isInvalidFinishedMatch(row)) return false;
        return true;
      })
      : [];
    const sorted = [...rows].sort((a, b) => (
      toMillis(a?.created_at || a?.round_started_at || a?.updated_at)
      - toMillis(b?.created_at || b?.round_started_at || b?.updated_at)
    ));
    const dayCounters = new Map();
    sorted.forEach((row) => {
      const startedMs = getAdminMatchStartMs(row) || Date.now();
      const dayKey = toAdminDayKey(startedMs);
      const seq = Math.max(1, Number(dayCounters.get(dayKey) || 0) + 1);
      dayCounters.set(dayKey, seq);
      map.set(String(row.id), `PVP${dayKey}-${seq}`);
    });
    return map;
  }, [adminMatches]);

  const shouldKeepQueueButtonPressed = pvpState.status === 'queueing'
    || (
      pvpState.status === 'finished'
      && shouldResumeQueueAfterMatchRefused(pvpState.match, authUser?.uid || '')
    );
  const queueButtonAutoResuming = pvpState.status !== 'queueing' && shouldKeepQueueButtonPressed;
  const queueBusyLabel = queueActionPhase === 'cancel'
    ? 'Saindo...'
    : (queueActionPhase === 'resume'
      ? 'Atualizando fila...'
      : (queueActionPhase === 'join' ? 'Entrando...' : 'Sincronizando...'));
  const queueActionStatusText = queueActionBusy
    ? (
      queueActionHint
      || (queueActionPhase === 'cancel'
        ? 'Removendo voce da fila...'
        : (queueActionPhase === 'resume'
          ? 'Retornando para a fila...'
          : 'Registrando sua entrada na fila...'))
    )
    : (queueActionHint || '');
  const arenaPrimaryAction = shouldKeepQueueButtonPressed
    ? {
      className: 'btn btn-secondary challenge-leave-btn',
      label: queueActionBusy
        ? (
          queueActionPhase === 'join'
            ? 'Cancelar entrada...'
            : (queueButtonAutoResuming ? 'Atualizando fila...' : queueBusyLabel)
        )
        : 'Sair da fila',
      disabled: false,
      onClick: () => cancelPvpQueue()
    }
    : pvpState.status === 'pending_accept'
      ? {
        className: 'btn btn-secondary challenge-leave-btn',
        label: 'Cancelar confronto',
        disabled: queueActionBusy,
        onClick: () => leavePvpFlow()
      }
    : pvpState.status === 'active'
      ? {
        className: 'btn btn-primary challenge-queue-btn',
        label: 'Voltar para partida',
        disabled: false,
        onClick: () => setScreen('pvp')
      }
      : {
        className: 'btn btn-primary challenge-queue-btn',
        label: queueActionBusy ? queueBusyLabel : 'Entrar na fila',
        disabled: false,
        onClick: () => joinPvpQueue()
      };

  function buildCosmeticSnapshot(frameId, backgroundId, emojiId) {
    return normalizeShopData({
      owned: ['frame_default', 'bg_default', 'emoji_profile', frameId, backgroundId, emojiId].filter(Boolean),
      equipped: {
        frame: String(frameId || 'frame_default'),
        background: String(backgroundId || 'bg_default'),
        emoji: String(emojiId || 'emoji_profile')
      }
    });
  }

  function getShopPreviewState(item) {
    const type = String(item?.type || '');
    if (!type || !item?.id) return shopData;
    const prevEquipped = shopData?.equipped || {};
    return buildCosmeticSnapshot(
      type === 'frame' ? item.id : prevEquipped.frame,
      type === 'background' ? item.id : prevEquipped.background,
      type === 'emoji' ? item.id : prevEquipped.emoji
    );
  }

  const activeShopItemPreview = shopItemPreview && typeof shopItemPreview === 'object'
    ? shopItemPreview
    : null;
  const shopModalPreviewState = activeShopItemPreview
    ? getShopPreviewState(activeShopItemPreview)
    : shopData;
  const shopModalPreviewAvatar = getDisplayAvatar(profile?.avatar || '🤓', shopModalPreviewState);
  const shopModalPreviewFrameStyle = getAvatarFrameStyle(shopModalPreviewState);
  const shopModalPreviewFrameClass = getAvatarFrameClass(shopModalPreviewState);
  const shopModalPreviewBgStyle = getHeroBackgroundStyle(shopModalPreviewState);
  const shopModalPreviewBgMeta = getBackgroundVisualMeta(shopModalPreviewState);

  const pvpPlayer1Shop = buildCosmeticSnapshot(
    pvpMatch?.player1_frame,
    pvpMatch?.player1_background,
    pvpMatch?.player1_emoji
  );
  const pvpPlayer2Shop = buildCosmeticSnapshot(
    pvpMatch?.player2_frame,
    pvpMatch?.player2_background,
    pvpMatch?.player2_emoji
  );

  const pvpPlayer1Avatar = getDisplayAvatar(pvpMatch?.player1_avatar || '🤓', pvpPlayer1Shop);
  const pvpPlayer2Avatar = getDisplayAvatar(pvpMatch?.player2_avatar || '🤓', pvpPlayer2Shop);
  const pvpPlayer1FrameStyle = getAvatarFrameStyle(pvpPlayer1Shop);
  const pvpPlayer2FrameStyle = getAvatarFrameStyle(pvpPlayer2Shop);
  const pvpPlayer1FrameClass = getAvatarFrameClass(pvpPlayer1Shop);
  const pvpPlayer2FrameClass = getAvatarFrameClass(pvpPlayer2Shop);
  const pvpPlayer1BackgroundMeta = getBackgroundVisualMeta(pvpPlayer1Shop);
  const pvpPlayer2BackgroundMeta = getBackgroundVisualMeta(pvpPlayer2Shop);
  const pveCategory = getCategoryByPoints(progress?.rankingPoints || 0);
  const pvpCategory = getCategoryByPoints(progress?.pvpPoints || 0);
  const homeAuthUser = activeAuthUser;
  const showHomeProfileHero = Boolean(homeAuthUser || profile?.id || profile?.nickname || profile?.avatar);

  const safeShopTab = normalizeShopTab(shopTab);
  const safeShopCategoryOpenState = normalizeShopCategoryOpenState(shopCategoryOpen);
  const activeShopItems = getItemsByType(safeShopTab);
  const activeShopCategoryOpen = safeShopCategoryOpenState?.[safeShopTab] || SHOP_CATEGORY_OPEN_DEFAULT;
  const groupedShopItems = useMemo(() => {
    const groups = SHOP_RARITY_ORDER.map((rarity) => ({ rarity, items: [] }));
    const lookup = groups.reduce((acc, group) => {
      acc[group.rarity] = group;
      return acc;
    }, {});
    activeShopItems.forEach((item) => {
      const rarity = SHOP_RARITY_ORDER.includes(item?.rarity) ? item.rarity : 'common';
      lookup[rarity].items.push(item);
    });
    return groups;
  }, [activeShopItems]);
  const ownedShopSet = new Set(shopData.owned || []);
  const equippedShopId = shopData?.equipped?.[safeShopTab] || '';

  const pvpResult = pvpState.result || getPvpResultForUser(pvpMatch, authUser?.uid || '');
  const isPvpMatchProcessed = Boolean(pvpMatch?.id && progress?.pvpProcessedMatches?.[pvpMatch.id]);
  const pvpBattleNoForDisplay = Math.max(1, Number(progress?.pvpBattles || 0) + (isPvpMatchProcessed ? 0 : 1));
  const pvpPointsDelta = getPvpPointsDeltaAdvanced(pvpResult, {
    battleNo: pvpBattleNoForDisplay,
    roundNo: Math.max(1, Number(pvpMatch?.ended_round_no || pvpMatch?.round_no || PVP_ROUNDS_PER_MATCH)),
    matchRow: pvpMatch,
    userId: authUser?.uid || ''
  });
  const pvpRewardsPreview = getPvpRewardsByDifficulty(pvpMatch?.difficulty || pvpConfig?.difficulty || 'easy', pvpResult);
  const pvpOpponentLeftTransitionActive = pvpResultTransitionMode === 'opponent_left' && !pvpCompensation;
  const pvpHideDefaultResultPanel = pvpOpponentLeftTransitionActive || Boolean(pvpCompensation);
  const activePvpEmojiOptions = PVP_EMOJI_PICKER_OPTIONS;
  const pvpEmojiCooldownRemainingMs = Math.max(
    0,
    Math.max(0, Number(pvpEmojiCooldownUntilMs || 0)) - pvpClockMs
  );
  const pvpEmojiCooldownActive = pvpEmojiCooldownRemainingMs > 0;
  const pvpEmojiCooldownFillPct = pvpEmojiCooldownActive
    ? Math.max(0, Math.min(100, (pvpEmojiCooldownRemainingMs / PVP_EMOJI_SPAM_COOLDOWN_MS) * 100))
    : 0;
  const pvpEmojiCooldownLabel = pvpEmojiCooldownActive
    ? `${(pvpEmojiCooldownRemainingMs / 1000).toFixed(1)}s`
    : '';
  const isWideAdminLayout = screen === 'admin-monitor' || screen === 'admin-live' || screen === 'admin-history';

  const showPreload = booting || authLoading || !progressReady || !shopReady;
  if (showPreload) {
    return (
      <div id="app" className={isWideAdminLayout ? 'app-wide' : ''}>
        <div className="screen active preload-screen">
          <div className="preload-card">
            <div className="preload-logo">{'</>'}</div>
            <div className="preload-title">CodeQuiz</div>
            <div className="preload-subtitle">Inicializando sua sessao...</div>
            <div className="preload-bar">
              <div className="preload-bar-fill" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="app" className={isWideAdminLayout ? 'app-wide' : ''}>
        <div className={`screen ${screen === 'home' ? 'active' : ''}`}>
          {showHomeProfileHero ? (
            <div
              className={[
                'user-profile-hero',
                heroBackgroundMeta.className
              ].filter(Boolean).join(' ')}
              data-bg-id={heroBackgroundMeta.id}
              data-bg-rarity={heroBackgroundMeta.rarity}
              style={{ background: heroBackground }}
            >
              <div className="hero-bg-glow" />
              <div className="hero-content">
                <div className="hero-avatar-wrap">
                  <span className={`hero-avatar ${avatarFrameClass}`} style={avatarFrameStyle}>
                    {isImageAvatarValue(displayAvatar) ? (
                      <img className="hero-avatar-image" src={displayAvatar} alt="Avatar do jogador" referrerPolicy="no-referrer" />
                    ) : displayAvatar}
                  </span>
                  <div className="hero-avatar-glow" />
                </div>
                <div className="hero-info">
                  <div className="hero-name-row">
                    <div className="hero-name">{heroNickname}</div>
                    <button className="hero-logout" onClick={handleSignOut}>Sair</button>
                  </div>
                  <div className="hero-badges-line">
                    <div className="hero-badges-group">
                      <span className={`tier-badge tier-badge-compact tier-${pveCategory.key}`}>PVE {pveCategory.label}</span>
                      <span className={`tier-badge tier-badge-compact tier-${pvpCategory.key}`}>PVP {pvpCategory.label}</span>
                    </div>
                    <span className="hero-coins" aria-label={`Moedas ${safeCoins}`}>
                      <span className="hero-coins-icon" aria-hidden="true">🪙</span>
                      <span className="hero-coins-value">{safeCoins}</span>
                    </span>
                  </div>
                  <div className="hero-xp-bar">
                    <div className="hero-xp-fill" style={{ width: `${xpPercent}%` }} />
                  </div>
                  <div className="hero-xp-label">
                    <span className="hero-xp-level">Nv. {safeLevel}</span>
                    <span className="hero-xp-progress">{safeXp} / {xpForNextLevel} XP</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!showHomeProfileHero ? (
            <>
              <div className="home-header">
                <div className="logo-icon">{'</>'}</div>
                <h1>Code Quiz</h1>
                <p className="subtitle">Next.js + React + Firebase</p>
              </div>

              <div className="player-stats-modern">
                <div className="stat-card-modern stat-level">
                  <span className="stat-icon stat-icon-float">🏅</span>
                  <div className="stat-value">{progress.level}</div>
                  <div className="stat-label">Nivel</div>
                </div>
                <div className="stat-card-modern stat-xp">
                  <span className="stat-icon stat-icon-float">⭐</span>
                  <div className="stat-value">{progress.rankingPoints}</div>
                  <div className="stat-label">Pontos PVE</div>
                </div>
                <div className="stat-card-modern stat-streak">
                  <span className="stat-icon stat-icon-float">⚔️</span>
                  <div className="stat-value">{progress.pvpPoints}</div>
                  <div className="stat-label">Pontos PVP</div>
                </div>
              </div>
            </>
          ) : null}

          <div className="home-actions">
            <button
              className="btn btn-primary btn-lg btn-modern home-play-btn"
              onClick={() => setScreen('play-mode')}
            >
              <span className="btn-icon">▶</span>
              <span className="btn-text">Jogar Agora</span>
              <span className="btn-arrow">›</span>
            </button>

            <div className="home-actions-grid">
              <button className="btn btn-secondary btn-modern" onClick={() => setScreen('rankings')}>
                <span className="btn-icon">🏆</span>
                <span className="btn-text">Rankings</span>
              </button>
              <button className="btn btn-secondary btn-modern" onClick={() => setScreen('shop')}>
                <span className="btn-icon">🛒</span>
                <span className="btn-text">Loja</span>
              </button>
              <button className="btn btn-secondary btn-modern" onClick={() => setScreen('achievements')}>
                <span className="btn-icon">🏅</span>
                <span className="btn-text">Conquistas</span>
              </button>
              <button
                className="btn btn-secondary btn-modern"
                onClick={() => setScreen(homeAuthUser ? 'settings' : 'login')}
              >
                <span className="btn-icon">⚙️</span>
                <span className="btn-text">Configuracoes</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`screen ${screen === 'play-mode' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Escolha o modo</h2>
          </div>
          <div className="challenge-panel play-mode-panel">
            <h3>Selecione seu modo</h3>
            <div className="play-mode-actions">
              <button className="btn btn-primary btn-lg btn-modern play-mode-btn" onClick={() => setScreen('select')}>
                <span className="play-mode-icon">🎯</span>
                <span className="play-mode-title">PVE</span>
                <span className="play-mode-subtitle">Quiz Solo</span>
              </button>
              <button className="btn btn-secondary btn-lg btn-modern play-mode-btn" onClick={() => setScreen('challenge')}>
                <span className="play-mode-icon">⚔️</span>
                <span className="play-mode-title">PVP</span>
                <span className="play-mode-subtitle">Online</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`screen ${screen === 'select' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Escolha o Tema</h2>
          </div>
          <p className="select-subtitle">Organizado por trilhas para facilitar sua progressao no PVE.</p>
          <div className="lang-grid">
            {languageThemeSections.map((section) => (
              <section key={section.id} className="category-section">
                <div className="category-header">
                  <p className="category-label">{section.label}</p>
                  <p className="category-desc">{section.desc}</p>
                </div>
                <div className="category-cards">
                  {section.items.map((language) => (
                    <button
                      key={language.id}
                      className={`lang-card ${selectedLanguage === language.id ? 'active' : ''}`}
                      style={{ '--card-accent': language.color }}
                      onClick={() => {
                        setSelectedLanguage(language.id);
                        const topics = getTopicsByLanguage(TOPICS, language.id);
                        setSelectedTopic(topics[0]?.id || '');
                        setScreen('topic');
                      }}
                    >
                      <div className="lang-icon">{language.icon}</div>
                      <div className="lang-info">
                        <div className="lang-name">{language.name}</div>
                        <div className="lang-desc">{language.desc}</div>
                        <div className="lang-meta">
                          <div className="lang-progress">
                            <div
                              className="lang-progress-fill"
                              style={{ width: `${languageProgress.get(language.id) || 0}%` }}
                            />
                          </div>
                          <span className="lang-pct">{languageProgress.get(language.id) || 0}%</span>
                        </div>
                      </div>
                      <span className="lang-arrow">›</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className={`screen ${screen === 'topic' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>{selectedLanguageMeta?.name || 'Topicos'}</h2>
          </div>
          <div className="topic-header-card">
            <div className="topic-header-kicker">Trilhas do tema</div>
            <div className="topic-header-title">{selectedLanguageMeta?.name || 'Topicos'}</div>
            <div className="topic-header-desc">
              {selectedLanguageMeta?.desc || 'Escolha um topico para iniciar o quiz.'}
            </div>
            <div className="topic-header-meta">
              <span>{selectedTopics.length} topicos</span>
              <span>{languageProgress.get(selectedLanguage) || 0}% de progresso total</span>
            </div>
          </div>
          <div className="topic-list">
            {selectedTopics.map((topic) => {
              const pct = topicProgress.get(topic.id) || 0;
              const badgeClass = pct >= 80 ? 'completed' : pct > 0 ? 'started' : 'new';
              const badgeLabel = pct >= 80 ? 'Dominado' : pct > 0 ? `${pct}%` : 'Novo';
              const totalQuestions = topicQuestionCount.get(topic.id) || 0;
              const topicCountLabel = totalQuestions > 0 ? `${totalQuestions} por partida` : 'Sem perguntas';
              return (
                <button
                  key={topic.id}
                  className={`topic-card ${selectedTopic === topic.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setScreen('difficulty');
                  }}
                >
                  <span className="topic-emoji">{topic.emoji}</span>
                  <div className="topic-info">
                    <div className="topic-name-row">
                      <div className="topic-name">{topic.name}</div>
                      <div className="topic-count">{topicCountLabel}</div>
                    </div>
                    <div className="topic-desc">{topic.desc}</div>
                    <div className="topic-progress-row">
                      <div className="topic-progress-bar">
                        <div className="topic-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="topic-progress-pct">{pct}%</span>
                    </div>
                  </div>
                  <span className={`topic-badge ${badgeClass}`}>{badgeLabel}</span>
                  <span className="topic-arrow">›</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`screen ${screen === 'difficulty' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Dificuldade</h2>
          </div>
          <div className="difficulty-list">
            <button className="diff-card diff-easy" onClick={() => beginPveRound('easy')}>
              <span className="diff-emoji">🌱</span>
              <span className="diff-name">{DIFFICULTY_LABELS.easy}</span>
              <span className="diff-desc">Conceitos basicos</span>
              <span className="diff-meta">
                {selectedTopicQuestionCountByDifficulty.easy || 0} perguntas · melhor {selectedTopicDifficultyProgress.easy?.pct || 0}%
              </span>
              <div className="diff-progress">
                <div className="diff-progress-fill" style={{ width: `${selectedTopicDifficultyProgress.easy?.pct || 0}%` }} />
              </div>
              <span className="diff-mult">x1 recompensas</span>
            </button>
            <button className="diff-card diff-medium" onClick={() => beginPveRound('medium')}>
              <span className="diff-emoji">🔥</span>
              <span className="diff-name">{DIFFICULTY_LABELS.medium}</span>
              <span className="diff-desc">Mais velocidade e precisao</span>
              <span className="diff-meta">
                {selectedTopicQuestionCountByDifficulty.medium || 0} perguntas · melhor {selectedTopicDifficultyProgress.medium?.pct || 0}%
              </span>
              <div className="diff-progress">
                <div className="diff-progress-fill" style={{ width: `${selectedTopicDifficultyProgress.medium?.pct || 0}%` }} />
              </div>
              <span className="diff-mult">x2 recompensas</span>
            </button>
            <button className="diff-card diff-hard" onClick={() => beginPveRound('hard')}>
              <span className="diff-emoji">⚡</span>
              <span className="diff-name">{DIFFICULTY_LABELS.hard}</span>
              <span className="diff-desc">Nivel avancado</span>
              <span className="diff-meta">
                {selectedTopicQuestionCountByDifficulty.hard || 0} perguntas · melhor {selectedTopicDifficultyProgress.hard?.pct || 0}%
              </span>
              <div className="diff-progress">
                <div className="diff-progress-fill" style={{ width: `${selectedTopicDifficultyProgress.hard?.pct || 0}%` }} />
              </div>
              <span className="diff-mult">x3 recompensas</span>
            </button>
          </div>
        </div>

        <div className={`screen ${screen === 'quiz' ? 'active' : ''}`}>
          <div className="pve-quiz-shell">
            <div className="pve-quiz-topline">
              <span className="pve-quiz-mode">Modo PVE</span>
              <span className={`pve-quiz-difficulty pve-quiz-difficulty-${quizState?.difficulty || 'easy'}`}>
                {DIFFICULTY_LABELS[quizState?.difficulty] || DIFFICULTY_LABELS.easy}
              </span>
            </div>
            <div className="pve-quiz-meta">
              <span>{selectedLanguageMeta?.name || quizState?.language || 'Linguagem'}</span>
              <span className="pve-quiz-dot">·</span>
              <span>{selectedTopicMeta?.name || quizState?.topic || 'Tema'}</span>
            </div>
          </div>

          <div className="quiz-header">
            <div className="quiz-info pve-quiz-info">
              <div className="quiz-info-main">
                <span>{quizState ? `${quizState.index + 1}/${quizState.questions.length}` : '0/0'}</span>
                <span>{quizState ? `${quizState.score} pts` : '0 pts'}</span>
                <div className="quiz-lives">
                  {[0, 1, 2].map((idx) => (
                    <span key={idx} className={`heart ${quizState && idx >= quizState.lives ? 'lost' : ''}`}>❤️</span>
                  ))}
                </div>
              </div>
              <button className="btn-quiz-menu" onClick={openQuizMenu} aria-label="Abrir menu do quiz">☰</button>
            </div>
            {quizState?.streak ? (
              <div className="quiz-streak">{quizState.streak} em sequencia</div>
            ) : null}
          </div>

          <div className="quiz-timer">
            <div
              className={`timer-bar ${quizTimerClass}`}
              style={{
                width: `${quizTimerPct}%`
              }}
            />
          </div>

          <div className="quiz-body pve-quiz-body">
            <div className="question-card">
              <div
                ref={quizQuestionScrollRef}
                className={`question-scroll-wrap ${quizQuestionHasOverflow ? 'has-overflow' : ''}`}
              >
                <p className="question-text">{currentQuestion?.q || 'Carregando pergunta...'}</p>
                {currentQuestion?.code ? (
                  <pre className="question-code">{currentQuestion.code}</pre>
                ) : null}
              </div>
              {quizQuestionHasOverflow ? (
                <span className="question-scroll-indicator" aria-hidden="true" />
              ) : null}
            </div>
            <div className="options-list">
              {(currentQuestion?.opts || []).map((option, index) => (
                <button
                  key={`${quizState?.index || 0}_${index}`}
                  className={`option-btn ${quizState?.selectedIndex === index ? 'selected' : ''} ${quizState?.answered ? 'disabled' : ''}`}
                  disabled={!!quizState?.answered}
                  onClick={() => handleAnswer(index)}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary quiz-confirm-btn"
              disabled={!quizState || quizState.answered || !Number.isFinite(Number(quizState.selectedIndex)) || Number(quizState.selectedIndex) < 0}
              onClick={confirmQuizAnswer}
            >
              Confirmar resposta
            </button>
          </div>
        </div>

        <div className={`screen ${screen === 'feedback' ? 'active' : ''}`}>
          <div className="feedback-content">
            <div className="feedback-emoji">
              {feedbackState?.isTimeout ? '⏰' : feedbackState?.isCorrect ? '✅' : '❌'}
            </div>
            <div className="feedback-title">
              {feedbackState?.isTimeout ? 'Tempo esgotado!' : feedbackState?.isCorrect ? 'Boa resposta!' : 'Resposta incorreta'}
            </div>
            <div className="feedback-explain">
              {feedbackState?.question?.explain || 'Sem explicacao para esta pergunta.'}
            </div>
            <button className="btn btn-primary" onClick={() => nextQuestion()}>
              Continuar
            </button>
          </div>
        </div>

        <div className={`screen ${screen === 'result' ? 'active' : ''}`}>
          <div className="result-content pve-result-content">
            <div className="result-emoji">
              {(resultState?.scorePct || 0) >= 80 ? '🏆' : (resultState?.scorePct || 0) >= 50 ? '👏' : '📚'}
            </div>
            <div className="result-title">Resultado do Quiz</div>
            <div className="result-subtitle">
              {(selectedLanguageMeta?.name || resultState?.language || '')} · {(selectedTopicMeta?.name || resultState?.topic || '')}
            </div>
            <div className="result-stats">
              <div className="result-stat">
                <div className="result-stat-value">{resultState?.correctCount || 0}/{resultState?.totalQuestions || 0}</div>
                <div className="result-stat-label">Acertos</div>
              </div>
              <div className="result-stat">
                <div className="result-stat-value">{resultState?.scorePct || 0}%</div>
                <div className="result-stat-label">Precisao</div>
              </div>
              <div className="result-stat">
                <div className="result-stat-value">+{resultState?.awardedXp || 0}</div>
                <div className="result-stat-label">XP</div>
              </div>
              <div className="result-stat">
                <div className="result-stat-value">+{resultState?.awardedCoins || 0}</div>
                <div className="result-stat-label">Moedas</div>
              </div>
            </div>
            <div className="result-xp-bar">
              <div className="result-xp-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="result-level-info">
              Nivel {progress.level} · {progress.xp}/{xpForNextLevel} XP
            </div>

            {resultState?.unlockedAchievements?.length ? (
              <div className="result-leaderboard">
                <div className="result-leaderboard-title">Novas conquistas</div>
                <div className="result-leaderboard-list">
                  {resultState.unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="result-leaderboard-item">
                      <span className="result-leaderboard-pos">{achievement.icon}</span>
                      <span>{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="result-leaderboard">
              <div className="result-leaderboard-title">Ranking deste quiz</div>
              {quizRankingLoading ? (
                <div className="ranking-loading">Carregando ranking...</div>
              ) : quizRankingRows.length ? (
                <div className="result-leaderboard-list">
                  {quizRankingRows.slice(0, 5).map((row, index) => {
                    const rowShop = buildCosmeticSnapshot(
                      row.equipped_frame,
                      row.equipped_background,
                      row.equipped_emoji
                    );
                    const rowAvatar = getDisplayAvatar(row.avatar || '🤓', rowShop);
                    return (
                      <div key={`${row.user_id}_${index}`} className="result-leaderboard-item">
                        <span className="result-leaderboard-pos">#{index + 1}</span>
                        <span>{rowAvatar} {row.nickname || 'Jogador'}</span>
                        <span style={{ marginLeft: 'auto' }}>{row.correct_count}/{row.total_questions}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ranking-empty">Sem dados ainda para este quiz.</div>
              )}
            </div>

            <button className="btn btn-primary result-action-btn result-action-btn-primary" onClick={() => setScreen('difficulty')}>
              Novo desafio
            </button>
            <button
              className="btn btn-secondary result-action-btn result-action-btn-secondary"
              onClick={() => {
                resetQuizFlow();
                setScreen('home');
              }}
            >
              Voltar ao inicio
            </button>
          </div>
        </div>

        <div className={`screen ${screen === 'achievements' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Conquistas</h2>
          </div>
          <div className="achievements-list">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = unlockedSet.has(achievement.id);
              return (
                <div key={achievement.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-desc">{achievement.desc}</div>
                  </div>
                  <div className="achievement-check">{unlocked ? '✓' : '•'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`screen ${screen === 'rankings' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Rankings</h2>
          </div>
          <div className="ranking-tabs">
            <button
              className={`ranking-tab ${rankingsMode === 'pve' ? 'active' : ''}`}
              onClick={() => setRankingsMode('pve')}
            >
              PVE
            </button>
            <button
              className={`ranking-tab ${rankingsMode === 'pvp' ? 'active' : ''}`}
              onClick={() => setRankingsMode('pvp')}
            >
              PVP
            </button>
          </div>
          <div className="ranking-content">
            {rankingsLoading ? (
              <div className="ranking-loading">Carregando...</div>
            ) : rankingsRows.length ? (
              <div className="ranking-list">
                {rankingsRows.map((row, index) => {
                  const isSelf = String(row.user_id || '') === String(authUser?.uid || '');
                  const rowShop = buildCosmeticSnapshot(
                    row.equipped_frame,
                    row.equipped_background,
                    row.equipped_emoji
                  );
                  const rowAvatar = getDisplayAvatar(row.avatar || '🤓', rowShop);
                  const rowFrameStyle = getAvatarFrameStyle(rowShop);
                  const rowFrameClass = getAvatarFrameClass(rowShop);
                  const rowBackgroundMeta = getBackgroundVisualMeta(rowShop);
                  const itemClasses = [
                    'ranking-item',
                    isSelf ? 'ranking-self' : '',
                    index === 0 ? 'ranking-top1' : '',
                    index === 1 ? 'ranking-top2' : '',
                    index === 2 ? 'ranking-top3' : '',
                    rowBackgroundMeta.className
                  ].filter(Boolean).join(' ');
                  const points = rankingsMode === 'pvp'
                    ? Math.max(0, Number(row.pvp_points || 0))
                    : Math.max(0, Number(row.ranking_points || 0));
                  const category = getCategoryByPoints(points);
                  const meta = rankingsMode === 'pvp'
                    ? `${Math.max(0, Number(row.pvp_wins || 0))}V · ${Math.max(0, Number(row.pvp_battles || 0))}P`
                    : `${Math.max(0, Number(row.total_correct || 0))} corretas · Lv ${Math.max(1, Number(row.level || 1))}`;

                  return (
                    <div
                      key={`${row.user_id}_${index}`}
                      className={itemClasses}
                      data-bg-id={rowBackgroundMeta.id}
                      data-bg-rarity={rowBackgroundMeta.rarity}
                      style={{ background: getHeroBackgroundStyle(rowShop) }}
                    >
                      <span className="rank-pos">#{index + 1}</span>
                      <span className={`rank-avatar ${rowFrameClass}`} style={rowFrameStyle}>{rowAvatar}</span>
                      <div className="rank-info">
                        <div className="rank-name-row">
                          <span className="rank-name">{row.nickname || 'Jogador'}</span>
                          <span className={`tier-badge tier-badge-compact tier-badge-rank tier-${category.key}`}>
                            {rankingsMode === 'pvp' ? 'PVP' : 'PVE'} {category.label}
                          </span>
                        </div>
                        <div className="rank-meta">{meta}</div>
                      </div>
                      <span className="rank-xp">{points} PTS</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ranking-empty">Sem ranking disponivel ainda.</div>
            )}
          </div>
        </div>

        <div className={`screen ${screen === 'admin-monitor' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Monitoramento Admin</h2>
          </div>
          <div className="admin-screen-shell">
            <div className="admin-screen-hero">
              <div className="admin-screen-hero-title">Painel de monitoramento</div>
              <div className="admin-screen-hero-subtitle">Acompanhe partidas em tempo real e historico diario.</div>
            </div>

            <div className="admin-screen-stats">
              <div className="admin-screen-stat-card">
                <span>Online</span>
                <strong>{arenaMetrics.online}</strong>
              </div>
              <div className="admin-screen-stat-card">
                <span>Fila</span>
                <strong>{arenaMetrics.queue}</strong>
              </div>
              <div className="admin-screen-stat-card">
                <span>Ao vivo</span>
                <strong>{adminLiveMatches.length}</strong>
              </div>
              <div className="admin-screen-stat-card">
                <span>Historico hoje</span>
                <strong>{adminHistoryTodayMatches.length}</strong>
              </div>
            </div>

            <div className="admin-screen-updated-at">
              Atualizado em {adminMatchesUpdatedAtMs ? new Date(adminMatchesUpdatedAtMs).toLocaleTimeString('pt-BR') : '--:--:--'}
            </div>

            <div className="admin-daemon-control">
              <div className="admin-daemon-head">
                <span className={`admin-daemon-dot ${botArenaBattlesEnabled ? 'enabled' : 'disabled'}`} aria-hidden="true" />
                <div className="admin-daemon-copy">
                  <strong>{botArenaBattlesEnabled ? 'Automacao bots ativa' : 'Automacao bots desativada'}</strong>
                  <span>
                    PVP: {botArenaPvpEnabled ? 'ativado' : 'desativado'}
                    {' · '}
                    Quiz: {botArenaQuizEnabled ? 'ativado' : 'desativado'}
                    {' · '}
                    Daemon: {botArenaDaemonModeLabel}
                    {' · '}
                    Atualizado: {botArenaDaemonUpdatedAtLabel}
                  </span>
                </div>
              </div>
              <div className="admin-daemon-toggles">
                <div className="admin-daemon-toggle-row">
                  <div className="admin-daemon-toggle-copy">
                    <strong>Batalhas PVP dos bots</strong>
                    <span>{botArenaPvpEnabled ? 'Ativado' : 'Desativado'}</span>
                  </div>
                  <label className="settings-switch" aria-label="Ativar batalhas PVP dos bots">
                    <input
                      type="checkbox"
                      checked={botArenaPvpEnabled}
                      disabled={adminBotDaemonBusy}
                      onChange={(event) => setAdminBotArenaAutomationEnabled('pvp', event.target.checked)}
                    />
                    <span className="settings-switch-track">
                      <span className="settings-switch-thumb" />
                    </span>
                  </label>
                </div>

                <div className="admin-daemon-toggle-row">
                  <div className="admin-daemon-toggle-copy">
                    <strong>Partidas de quiz dos bots</strong>
                    <span>{botArenaQuizEnabled ? 'Ativado' : 'Desativado'}</span>
                  </div>
                  <label className="settings-switch" aria-label="Ativar partidas de quiz dos bots">
                    <input
                      type="checkbox"
                      checked={botArenaQuizEnabled}
                      disabled={adminBotDaemonBusy}
                      onChange={(event) => setAdminBotArenaAutomationEnabled('quiz', event.target.checked)}
                    />
                    <span className="settings-switch-track">
                      <span className="settings-switch-thumb" />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-screen-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setScreen('admin-live')}>
                Partidas ao vivo
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => setScreen('admin-history')}>
                Historico de partidas do dia
              </button>
              <button className="btn btn-secondary" disabled={adminBusy} onClick={() => refreshAdminMetrics().catch(() => null)}>
                Atualizar painel
              </button>
            </div>
          </div>
        </div>

        <div className={`screen ${screen === 'admin-live' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Partidas Ao Vivo</h2>
          </div>
          <div className="admin-monitor-list">
            {adminMatchesLoading ? (
              <div className="ranking-loading">Carregando partidas...</div>
            ) : adminLiveMatches.length ? adminLiveMatches.map((row) => {
              const isBotQuizLive = row?.is_bot_quiz === true;
              const status = String(row?.status || '').trim().toLowerCase();
              const statusLabel = isBotQuizLive
                ? 'Quiz em andamento'
                : status === 'pending_accept'
                  ? 'Aguardando aceite'
                  : status === 'matched'
                    ? 'Pareando'
                    : status === 'starting'
                      ? 'Inicializando'
                  : status === 'round_result'
                    ? 'Resultado da rodada'
                    : 'Em andamento';
              const quizBatchId = String(row?.bot_quiz_batch_id || row?.id || '').trim();
              const displayCode = isBotQuizLive
                ? `QUIZ-${quizBatchId ? quizBatchId.slice(-6) : 'LIVE'}`
                : (adminMatchCodeById.get(String(row?.id || '')) || String(row?.id || '--'));
              const quizData = isBotQuizLive ? getAdminQuizCardData(row) : null;
              const quizBotLabel = String(row?.player1_nickname || 'Bot').trim() || 'Bot';
              const botClassSummary = getAdminBotClassSummary(row);
              const startedAtLabel = toMillis(row.created_at)
                ? new Date(toMillis(row.created_at)).toLocaleTimeString('pt-BR')
                : '--:--';
              const updatedAtLabel = toMillis(row.updated_at)
                ? new Date(toMillis(row.updated_at)).toLocaleTimeString('pt-BR')
                : '--:--';
              const durationLabel = getAdminMatchDurationLabel(row, Date.now());
              const matchTypeLabel = getAdminMatchTypeLabel(row);
              if (isBotQuizLive) {
                return (
                  <div key={`live_${row.id}`} className="admin-monitor-item admin-monitor-item-quiz">
                    <div className="admin-monitor-item-head">
                      <span className="admin-monitor-item-id">{displayCode}</span>
                      <span className={`admin-monitor-status status-${status}`}>{statusLabel}</span>
                    </div>
                    <div className="admin-monitor-quiz-header">
                      <strong className="admin-monitor-quiz-title">Quiz Solo</strong>
                      <span className="admin-monitor-quiz-bot">{quizBotLabel}</span>
                    </div>
                    <div className="admin-monitor-quiz-chips">
                      <span className="admin-monitor-quiz-chip">{quizData?.difficultyLabel || DIFFICULTY_LABELS.easy}</span>
                      <span className="admin-monitor-quiz-chip">{quizData?.languageLabel || '--'}</span>
                      <span className="admin-monitor-quiz-chip">{quizData?.topicLabel || '--'}</span>
                      <span className="admin-monitor-quiz-chip">{Math.max(1, Number(quizData?.totalQuestions || QUESTIONS_PER_ROUND))} questoes</span>
                      {botClassSummary ? <span className="admin-monitor-quiz-chip">{botClassSummary}</span> : null}
                    </div>
                    <div className="admin-monitor-quiz-meta-grid">
                      <div className="admin-monitor-quiz-meta-item">
                        <span>Iniciada</span>
                        <strong>{startedAtLabel}</strong>
                      </div>
                      <div className="admin-monitor-quiz-meta-item">
                        <span>Atualizada</span>
                        <strong>{updatedAtLabel}</strong>
                      </div>
                      <div className="admin-monitor-quiz-meta-item">
                        <span>Duracao</span>
                        <strong>{durationLabel}</strong>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={`live_${row.id}`} className="admin-monitor-item">
                  <div className="admin-monitor-item-head">
                    <span className="admin-monitor-item-id">{displayCode}</span>
                    <span className={`admin-monitor-status status-${status}`}>{statusLabel}</span>
                  </div>
                  <div className="admin-monitor-versus">
                    <span>{row.player1_nickname || 'Jogador 1'}</span>
                    <strong>{Math.max(0, Number(row.player1_score || 0))} x {Math.max(0, Number(row.player2_score || 0))}</strong>
                    <span>{row.player2_nickname || 'Jogador 2'}</span>
                  </div>
                  <div className="admin-monitor-meta">
                    Iniciada: {startedAtLabel}
                    {' · '}Atualizada: {updatedAtLabel}
                    {' · '}Rodadas: {getAdminMatchRoundsLabel(row)}
                    {' · '}Duracao: {durationLabel}
                    {' · '}Tipo: {matchTypeLabel}
                    {botClassSummary ? ` · ${botClassSummary}` : ''}
                  </div>
                </div>
              );
            }) : (
              <div className="ranking-empty">Nenhuma partida em tempo real no momento.</div>
            )}
          </div>
        </div>

        <div className={`screen ${screen === 'admin-history' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Historico Do Dia</h2>
          </div>
          <div className="admin-monitor-date-label">Data: {adminHistoryDateLabel}</div>
          <div className="admin-monitor-list">
            {adminMatchesLoading ? (
              <div className="ranking-loading">Carregando historico...</div>
            ) : adminHistoryTodayMatches.length ? adminHistoryTodayMatches.map((row) => {
              const isBotQuizHistory = row?.is_bot_quiz === true;
              const winnerId = String(row?.winner_user_id || '').trim();
              const player1Id = String(row?.player1_user_id || '').trim();
              const winnerName = winnerId
                ? (winnerId === player1Id ? (row.player1_nickname || 'Jogador 1') : (row.player2_nickname || 'Jogador 2'))
                : 'Empate';
              const quizBatchId = String(row?.bot_quiz_batch_id || row?.id || '').trim();
              const displayCode = isBotQuizHistory
                ? `QUIZ-${quizBatchId ? quizBatchId.slice(-6) : 'HIST'}`
                : (adminMatchCodeById.get(String(row?.id || '')) || String(row?.id || '--'));
              const botClassSummary = getAdminBotClassSummary(row);
              const endedAtLabel = toMillis(row.ended_at || row.updated_at)
                ? new Date(toMillis(row.ended_at || row.updated_at)).toLocaleTimeString('pt-BR')
                : '--:--';
              const durationLabel = getAdminMatchDurationLabel(row, Date.now());
              if (isBotQuizHistory) {
                const quizData = getAdminQuizCardData(row);
                const quizBotLabel = String(row?.player1_nickname || 'Bot').trim() || 'Bot';
                return (
                  <div key={`history_${row.id}`} className="admin-monitor-item admin-monitor-item-quiz">
                    <div className="admin-monitor-item-head">
                      <span className="admin-monitor-item-id">{displayCode}</span>
                      <span className="admin-monitor-status status-finished">Quiz finalizado</span>
                    </div>
                    <div className="admin-monitor-quiz-header">
                      <strong className="admin-monitor-quiz-title">Quiz Solo</strong>
                      <span className="admin-monitor-quiz-bot">{quizBotLabel}</span>
                    </div>
                    <div className="admin-monitor-quiz-result">
                      <strong className="admin-monitor-quiz-score">
                        {quizData.correctCount}/{quizData.totalQuestions} acertos
                      </strong>
                      <span className="admin-monitor-quiz-accuracy">{quizData.accuracyPct}% precisao</span>
                    </div>
                    <div className="admin-monitor-quiz-chips">
                      <span className="admin-monitor-quiz-chip">{quizData.difficultyLabel}</span>
                      <span className="admin-monitor-quiz-chip">{quizData.languageLabel}</span>
                      <span className="admin-monitor-quiz-chip">{quizData.topicLabel}</span>
                      {botClassSummary ? <span className="admin-monitor-quiz-chip">{botClassSummary}</span> : null}
                    </div>
                    <div className="admin-monitor-quiz-meta-grid">
                      <div className="admin-monitor-quiz-meta-item">
                        <span>Fim</span>
                        <strong>{endedAtLabel}</strong>
                      </div>
                      <div className="admin-monitor-quiz-meta-item">
                        <span>Duracao</span>
                        <strong>{durationLabel}</strong>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={`history_${row.id}`} className="admin-monitor-item">
                  <div className="admin-monitor-item-head">
                    <span className="admin-monitor-item-id">{displayCode}</span>
                    <span className="admin-monitor-status status-finished">
                      Finalizada
                    </span>
                  </div>
                  <div className="admin-monitor-versus">
                    <span>{row.player1_nickname || 'Jogador 1'}</span>
                    <strong>{Math.max(0, Number(row.player1_score || 0))} x {Math.max(0, Number(row.player2_score || 0))}</strong>
                    <span>{row.player2_nickname || 'Jogador 2'}</span>
                  </div>
                  <div className="admin-monitor-meta">
                    Vencedor: {winnerName}
                    {' · '}Fim: {endedAtLabel}
                    {' · '}Rodadas: {getAdminMatchRoundsLabel(row)}
                    {' · '}Duracao: {durationLabel}
                    {botClassSummary ? ` · ${botClassSummary}` : ''}
                  </div>
                </div>
              );
            }) : (
              <div className="ranking-empty">Sem partidas finalizadas hoje.</div>
            )}
          </div>
        </div>

        <div id="screen-login" className={`screen ${screen === 'login' ? 'active' : ''}`}>
          <div className="login-shell">
            <div className="login-bg-orb login-bg-orb-a" aria-hidden="true" />
            <div className="login-bg-orb login-bg-orb-b" aria-hidden="true" />
            <div className="login-bg-grid" aria-hidden="true" />

            <div className="login-card">
              <div className="login-brand-stack">
                <div className="login-logo-wrap">
                  <span className="login-logo-symbol">{'</>'}</span>
                </div>
                <h1 className="login-title">Code Quiz</h1>
                <p className="login-subtitle">
                  Plataforma de treino com quizzes por tema, ranqueamento em tempo real e arena competitiva.
                </p>
              </div>

              <div className="login-pill-row" aria-hidden="true">
                <span className="login-pill">PVE por temas</span>
                <span className="login-pill">Arena PVP</span>
                <span className="login-pill">Ranking global</span>
              </div>

              <div className="login-auth-panel">
                <div className="login-auth-label">Entrar com Google</div>
                <button
                  className="btn btn-google btn-lg login-google-btn"
                  onClick={() => handleSignIn()}
                  disabled={googleSignInBusy}
                >
                  <span className="google-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path fill="#EA4335" d="M12.24 10.285v3.84h5.445c-.24 1.285-.975 2.375-2.055 3.105l3.33 2.58c1.935-1.785 3.06-4.41 3.06-7.53 0-.735-.066-1.44-.19-2.115z" />
                      <path fill="#34A853" d="M12 22c2.7 0 4.965-.894 6.62-2.42l-3.33-2.58c-.924.62-2.106.99-3.29.99-2.53 0-4.674-1.71-5.44-4.01l-3.44 2.65C4.76 19.87 8.13 22 12 22z" />
                      <path fill="#4A90E2" d="M6.56 13.98c-.19-.57-.3-1.18-.3-1.8s.11-1.23.3-1.8l-3.44-2.65A10 10 0 0 0 2 12.18c0 1.62.39 3.15 1.12 4.45z" />
                      <path fill="#FBBC05" d="M12 6.37c1.47 0 2.79.51 3.82 1.51l2.87-2.87C16.96 3.37 14.7 2.37 12 2.37c-3.87 0-7.24 2.13-8.88 5.26l3.44 2.65c.77-2.3 2.91-4.01 5.44-4.01z" />
                    </svg>
                  </span>
                  <span>{googleSignInBusy ? 'Conectando com Google...' : 'Continuar com Google'}</span>
                </button>
                <p className="login-auth-note">
                  Autenticacao segura via Google com sincronizacao automatica de progresso no Firebase.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`screen settings-screen ${screen === 'settings' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Configuracoes</h2>
          </div>
          {!homeAuthUser ? (
            <div className="profile-content">
              <div className="challenge-status">Faca login para abrir as configuracoes.</div>
              <button className="btn btn-primary" onClick={() => setScreen('login')}>Ir para login</button>
            </div>
          ) : (
            <div className="audio-settings">
              <div className="settings-personal-data">
                <div className="settings-personal-title">Conta</div>
                <div className="settings-personal-subtitle">Edite seu apelido e gerencie o app.</div>
                <div className="settings-personal-form">
                  <label className="settings-input-label" htmlFor="settings-nickname">Apelido</label>
                  <input
                    id="settings-nickname"
                    type="text"
                    className="profile-input settings-input"
                    placeholder="Seu apelido"
                    maxLength={12}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={profileDraft.nickname}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, nickname: event.target.value }))
                    }
                  />
                  <label className="settings-input-label" htmlFor="settings-name">Nome</label>
                  <input
                    id="settings-name"
                    type="text"
                    className="profile-input settings-input settings-readonly"
                    value={profileDraft.full_name || homeAuthUser.displayName || homeAuthUser.email || 'Jogador'}
                    readOnly
                    disabled
                  />
                  <div className={`settings-personal-hint ${nicknameHintClass}`}>{nicknameHintText}</div>
                </div>
              </div>

              <div className="audio-option">
                <div className="audio-option-header">
                  <div className="audio-option-icon">🎵</div>
                  <div className="audio-option-text">
                    <div className="audio-option-title">Musica</div>
                    <div className="audio-option-desc">Menu com trilha calma e partidas com trilha intensa.</div>
                  </div>
                  <label className="settings-switch" aria-label="Ativar musica">
                    <input
                      type="checkbox"
                      checked={audioSettings.musicEnabled}
                      onChange={(event) => updateAudioSetting('musicEnabled', event.target.checked)}
                    />
                    <span className="settings-switch-track">
                      <span className="settings-switch-thumb" />
                    </span>
                  </label>
                </div>
                <div className="audio-slider-row">
                  <input
                    className="vol-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioSettings.musicVolume}
                    onChange={(event) => updateAudioSetting('musicVolume', Number(event.target.value))}
                  />
                  <span className="vol-label">{Math.round(audioSettings.musicVolume * 100)}%</span>
                </div>
              </div>

              <div className="audio-option">
                <div className="audio-option-header">
                  <div className="audio-option-icon">🔊</div>
                  <div className="audio-option-text">
                    <div className="audio-option-title">Efeitos sonoros</div>
                    <div className="audio-option-desc">Som para botoes, respostas e acoes do jogo.</div>
                  </div>
                  <label className="settings-switch" aria-label="Ativar efeitos sonoros">
                    <input
                      type="checkbox"
                      checked={audioSettings.sfxEnabled}
                      onChange={(event) => updateAudioSetting('sfxEnabled', event.target.checked)}
                    />
                    <span className="settings-switch-track">
                      <span className="settings-switch-thumb" />
                    </span>
                  </label>
                </div>
                <div className="audio-slider-row">
                  <input
                    className="vol-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioSettings.sfxVolume}
                    onChange={(event) => updateAudioSetting('sfxVolume', Number(event.target.value))}
                  />
                  <span className="vol-label">{Math.round(audioSettings.sfxVolume * 100)}%</span>
                </div>
                <button className="btn btn-secondary settings-sfx-test" onClick={() => playSfx('notify')}>
                  Testar som
                </button>
              </div>
              <button
                className="btn btn-primary btn-lg settings-save-btn"
                disabled={profileSaving || !nicknameValidation.ok}
                onClick={saveProfile}
              >
                {profileSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

        <div className={`screen ${screen === 'shop' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Loja</h2>
            <div className="shop-coins-badge">🪙 {progress.coins}</div>
          </div>
          <div className="shop-tabs">
            <button className={`shop-tab ${shopTab === 'frame' ? 'active' : ''}`} onClick={() => setShopTab('frame')}>
              🖼️ Molduras
            </button>
            <button className={`shop-tab ${shopTab === 'background' ? 'active' : ''}`} onClick={() => setShopTab('background')}>
              🎨 Fundos
            </button>
            <button className={`shop-tab ${shopTab === 'emoji' ? 'active' : ''}`} onClick={() => setShopTab('emoji')}>
              😎 Emojis
            </button>
          </div>
          <div className="shop-grid">
            {groupedShopItems.map((group) => {
              const groupRarity = group.rarity || 'common';
              const groupLabel = SHOP_RARITY_LABELS[groupRarity] || 'Comum';
              const isOpen = Boolean(activeShopCategoryOpen[groupRarity] ?? true);
              const groupItems = Array.isArray(group.items) ? group.items : [];
              return (
                <section key={`${shopTab}_${groupRarity}`} className={`shop-rarity-section rarity-${groupRarity}`}>
                  <button
                    type="button"
                    className={`shop-rarity-toggle rarity-${groupRarity} ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleShopCategory(shopTab, groupRarity)}
                  >
                    <span className="shop-rarity-title">{groupLabel}</span>
                    <span className="shop-rarity-count">{groupItems.length}</span>
                    <span className={`shop-rarity-arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">▾</span>
                  </button>
                  {isOpen ? (
                    groupItems.length ? (
                      <div className="shop-rarity-grid">
                        {groupItems.map((item) => {
                          const itemRarity = item?.rarity || 'common';
                          const itemRarityLabel = SHOP_RARITY_LABELS[itemRarity] || 'Categoria';
                          const owned = ownedShopSet.has(item.id);
                          const equipped = equippedShopId === item.id;
                          const canBuy = canPurchaseItem(shopData, item.id, progress.coins).ok;
                          const previewState = getShopPreviewState(item);
                          const previewAvatar = getDisplayAvatar(profile?.avatar || '🤓', previewState);
                          const previewFrameStyle = getAvatarFrameStyle(previewState);
                          const previewFrameClass = getAvatarFrameClass(previewState);
                          const previewBgStyle = getHeroBackgroundStyle(previewState);
                          const previewBgMeta = getBackgroundVisualMeta(previewState);
                          const itemClasses = [
                            'shop-item',
                            owned ? 'owned' : '',
                            equipped ? 'equipped' : ''
                          ].filter(Boolean).join(' ');
                          return (
                            <div key={item.id} className={itemClasses} data-rarity={itemRarity}>
                              <button
                                type="button"
                                className="shop-item-preview-btn"
                                onClick={() => openShopItemPreview(item)}
                                aria-label={`Visualizar ${item.name}`}
                              >
                                <div className="shop-item-preview">
                                  {item.type === 'frame' ? (
                                    <div className="shop-preview-cosmetic shop-preview-frame-wrap" data-rarity={itemRarity}>
                                      <div className={`shop-preview-frame ${previewFrameClass}`} style={previewFrameStyle}>
                                        <span className="shop-preview-avatar-core">{previewAvatar}</span>
                                      </div>
                                    </div>
                                  ) : null}
                                  {item.type === 'background' ? (
                                    <div
                                      className={[
                                        'shop-preview-cosmetic',
                                        'shop-preview-bg'
                                      ].filter(Boolean).join(' ')}
                                      data-rarity={itemRarity}
                                      data-bg-id={previewBgMeta.id}
                                    >
                                      <div
                                        className={[
                                          'shop-preview-bg-canvas',
                                          previewBgMeta.className
                                        ].filter(Boolean).join(' ')}
                                        style={{ background: previewBgStyle }}
                                      />
                                      <span className="shop-preview-particles" aria-hidden="true" />
                                    </div>
                                  ) : null}
                                  {item.type === 'emoji' ? (
                                    <div className="shop-preview-emoji-wrap" data-rarity={itemRarity}>
                                      <div className="shop-preview-emoji">{item.icon || '✨'}</div>
                                    </div>
                                  ) : null}
                                </div>
                              </button>
                              <div className="shop-item-name">{item.name}</div>
                              <span className={`shop-item-rarity rarity-${itemRarity}`}>{itemRarityLabel}</span>
                              {owned ? (
                                <button
                                  className={`shop-btn shop-btn-equip ${equipped ? 'is-equipped' : ''}`}
                                  disabled={Boolean(equipped && item.isDefault)}
                                  onClick={() => handleToggleOwnedShopItem(item)}
                                >
                                  {equipped
                                    ? (item.isDefault ? 'Equipado' : 'Desequipar')
                                    : 'Equipar'}
                                </button>
                              ) : (
                                <button
                                  className={`shop-btn shop-btn-buy ${canBuy ? '' : 'disabled'}`}
                                  disabled={!canBuy}
                                  onClick={() => handleBuyShopItem(item.id)}
                                >
                                  🪙 {item.price}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="shop-rarity-empty">Sem itens nesta categoria.</div>
                    )
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>

        <div className={`screen ${screen === 'challenge' ? 'active' : ''}`}>
          <div className="screen-top">
            <button className="btn-back" onClick={() => triggerAppBackNavigation('button')}>←</button>
            <h2>Desafio PVP</h2>
          </div>
          <div className="challenge-panel challenge-arena">
            {pvpState.status === 'pending_accept' && pvpMatch ? (
              <div className="match-accept-card">
                <h3>Partida encontrada!</h3>
                <div className="challenge-status">
                  {matchOpponentName} encontrou voce. Aceitar confronto agora?
                </div>
                <div className="match-accept-players">
                  <div className={`match-accept-player ${matchPlayer1AcceptState}`}>
                    <div
                      className={[
                        'match-accept-player-card',
                        pvpPlayer1BackgroundMeta.className
                      ].filter(Boolean).join(' ')}
                      data-bg-id={pvpPlayer1BackgroundMeta.id}
                      data-bg-rarity={pvpPlayer1BackgroundMeta.rarity}
                      style={{ background: getHeroBackgroundStyle(pvpPlayer1Shop) }}
                    >
                      <span className="match-accept-dot" />
                      <div className="pvp-player-identity match-accept-identity">
                        <span className={`pvp-player-avatar match-accept-avatar ${pvpPlayer1FrameClass}`} style={pvpPlayer1FrameStyle}>{pvpPlayer1Avatar}</span>
                        <div className="match-accept-name-block">
                          <span className="pvp-player-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                          <span className="match-accept-meta">
                            Nv. {Math.max(1, Number(pvpMatch?.player1_level || 1))} · {Math.max(0, Number(pvpMatch?.player1_pvp_points || 0))} pts
                          </span>
                        </div>
                      </div>
                      <div className="match-accept-state">{getMatchAcceptStateLabel(matchPlayer1AcceptState)}</div>
                    </div>
                  </div>
                  <div className={`match-accept-vs ${matchBothAccepted ? 'ready' : ''}`}>⚔️</div>
                  <div className={`match-accept-player ${matchPlayer2AcceptState}`}>
                    <div
                      className={[
                        'match-accept-player-card',
                        pvpPlayer2BackgroundMeta.className
                      ].filter(Boolean).join(' ')}
                      data-bg-id={pvpPlayer2BackgroundMeta.id}
                      data-bg-rarity={pvpPlayer2BackgroundMeta.rarity}
                      style={{ background: getHeroBackgroundStyle(pvpPlayer2Shop) }}
                    >
                      <span className="match-accept-dot" />
                      <div className="pvp-player-identity match-accept-identity">
                        <span className={`pvp-player-avatar match-accept-avatar ${pvpPlayer2FrameClass}`} style={pvpPlayer2FrameStyle}>{pvpPlayer2Avatar}</span>
                        <div className="match-accept-name-block">
                          <span className="pvp-player-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                          <span className="match-accept-meta">
                            Nv. {Math.max(1, Number(pvpMatch?.player2_level || 1))} · {Math.max(0, Number(pvpMatch?.player2_pvp_points || 0))} pts
                          </span>
                        </div>
                      </div>
                      <div className="match-accept-state">{getMatchAcceptStateLabel(matchPlayer2AcceptState)}</div>
                    </div>
                  </div>
                </div>
                <div className="match-accept-countdown">{matchAcceptCountdownLabel}</div>
                {shouldShowAcceptActions ? (
                  <div className="match-accept-actions">
                    <button className="btn btn-primary btn-lg" disabled={matchAcceptBusy} onClick={acceptPvpMatchInvite}>
                      Aceitar
                    </button>
                    <button className="btn btn-secondary btn-lg" disabled={matchAcceptBusy} onClick={rejectPvpMatchInvite}>
                      Recusar
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <h3>Arena</h3>
                <div className="pvp-metrics">
                  <div className="pvp-metric pvp-metric-live">
                    <span>Online</span>
                    <strong className="pvp-metric-live-value" aria-live="polite">{arenaOnlineLiveCount}</strong>
                  </div>
                  <div className="pvp-metric"><span>Sua classe</span><strong>{pvpCategory.label}</strong></div>
                  <div className="pvp-metric"><span>Tempo de fila</span><strong>{pvpQueueTimeLabel}</strong></div>
                </div>

                <button className={arenaPrimaryAction.className} onClick={arenaPrimaryAction.onClick} disabled={arenaPrimaryAction.disabled}>
                  {arenaPrimaryAction.label}
                </button>
                {queueActionStatusText ? (
                  <div className="challenge-status queue-action-status">
                    <span className="queue-action-indicator" aria-hidden="true" />
                    <span className="queue-action-text">{queueActionStatusText}</span>
                  </div>
                ) : null}
                <button className="btn btn-secondary challenge-edit-emojis-btn" onClick={openPvpEmojiPicker}>
                  Emojis da partida
                </button>
                <div className="challenge-emoji-preview">
                  {pvpBattleEmojis.map((emoji) => (
                    <span key={`arena_preview_${emoji}`} className="challenge-emoji-chip">{emoji}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`screen ${screen === 'pvp' ? 'active' : ''}`}>
          <div className="quiz-header pvp-header">
            <div className="quiz-info">
              <button className="btn pvp-exit-btn" onClick={() => leavePvpFlow()}>Sair da Partida</button>
            </div>
          </div>
          <div className={`quiz-timer pvp-quiz-timer ${pvpTimerVisualClass}`}>
            <div className={`timer-bar ${pvpTimerClass}`} style={{ width: `${pvpTimerPct}%` }} />
          </div>
          <div className={`pvp-round-indicator ${pvpRoundPhaseClass} ${pvpTimerVisualClass}`}>
            <span className="pvp-round-main">Rodada {pvpRoundNo}/{pvpTotalRounds}</span>
            {pvpRoundPhaseLabel ? (
              <span className="pvp-round-phase">{pvpRoundPhaseLabel}</span>
            ) : null}
          </div>
          <div className="pvp-score-cards">
            <div
              className={[
                'pvp-score-card',
                'pvp-score-card-left',
                pvpPlayer1BackgroundMeta.className
              ].filter(Boolean).join(' ')}
              data-bg-id={pvpPlayer1BackgroundMeta.id}
              data-bg-rarity={pvpPlayer1BackgroundMeta.rarity}
              style={{ background: getHeroBackgroundStyle(pvpPlayer1Shop) }}
            >
              <div className="pvp-player-identity">
                <span className={`pvp-player-avatar ${pvpPlayer1FrameClass}`} style={pvpPlayer1FrameStyle}>{pvpPlayer1Avatar}</span>
                <span className="pvp-player-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
              </div>
              <strong>{Math.max(0, Number(pvpMatch?.player1_score || 0))}</strong>
            </div>
            <div
              className={[
                'pvp-score-card',
                'pvp-score-card-right',
                pvpPlayer2BackgroundMeta.className
              ].filter(Boolean).join(' ')}
              data-bg-id={pvpPlayer2BackgroundMeta.id}
              data-bg-rarity={pvpPlayer2BackgroundMeta.rarity}
              style={{ background: getHeroBackgroundStyle(pvpPlayer2Shop) }}
            >
              <div className="pvp-player-identity">
                <span className={`pvp-player-avatar ${pvpPlayer2FrameClass}`} style={pvpPlayer2FrameStyle}>{pvpPlayer2Avatar}</span>
                <span className="pvp-player-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
              </div>
              <strong>{Math.max(0, Number(pvpMatch?.player2_score || 0))}</strong>
            </div>
          </div>
          <div className="quiz-body pvp-quiz-body">
            <div className="question-card pvp-question-card">
              <div
                ref={pvpQuestionScrollRef}
                className={`question-scroll-wrap ${pvpQuestionHasOverflow ? 'has-overflow' : ''}`}
              >
                <p className="question-text">{pvpQuestion?.q || 'Aguardando pergunta...'}</p>
                {pvpQuestion?.code ? <pre className="question-code">{pvpQuestion.code}</pre> : null}
              </div>
              {pvpQuestionHasOverflow ? (
                <span className="question-scroll-indicator" aria-hidden="true" />
              ) : null}
            </div>
            <div className="options-list">
              {(pvpQuestion?.opts || []).map((option, index) => (
                <button
                  key={`pvp_opt_${pvpRoundNo}_${index}`}
                  className={`option-btn ${pvpState.selectedIndex === index ? 'selected' : ''} ${pvpState.submitted ? 'disabled' : ''}`}
                  disabled={pvpState.submitted || pvpIsRoundResult}
                  onClick={() => pickPvpAnswer(index)}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary quiz-confirm-btn pvp-confirm-answer-btn"
              disabled={pvpState.submitted || pvpIsRoundResult || !Number.isFinite(Number(pvpState.selectedIndex)) || Number(pvpState.selectedIndex) < 0}
              onClick={confirmPvpAnswer}
            >
              Confirmar resposta
            </button>
            {pvpWaitingOpponent ? (
              <div className="challenge-status" style={{ marginTop: 10 }}>
                Aguardando oponente responder...
              </div>
            ) : null}
            {!pvpIsRoundResult ? (
              <div className="pvp-round-emoji-actions">
                {pvpBattleEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    className={`pvp-emoji-btn ${pvpEmojiCooldownActive ? 'is-cooldown' : ''}`}
                    onClick={() => sendPvpEmoji(emoji)}
                    disabled={pvpEmojiCooldownActive}
                    aria-label={`Enviar emoji ${emoji}`}
                  >
                    <span className="pvp-emoji-glyph" aria-hidden="true">{emoji}</span>
                    {pvpEmojiCooldownActive ? (
                      <>
                        <span
                          className="pvp-emoji-cooldown-fill"
                          style={{ height: `${pvpEmojiCooldownFillPct}%` }}
                          aria-hidden="true"
                        />
                        <span className="pvp-emoji-cooldown-label" aria-hidden="true">{pvpEmojiCooldownLabel}</span>
                      </>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {pvpEmojiFx.length ? (
            <div className="pvp-emoji-overlay" aria-hidden="true">
              {pvpEmojiFx.map((fx) => (
                <span key={fx.id} className={`pvp-emoji-fx ${fx.side}`}>{fx.emoji}</span>
              ))}
            </div>
          ) : null}
          {pvpIsRoundResult ? (
            <div className="pvp-wait-modal">
              <div className="pvp-wait-backdrop" />
              <div className={`reset-modal-card pvp-round-card ${pvpRoundResultPhaseClass}`}>
                <div className="pvp-round-kicker">{pvpRoundResultKicker}</div>
                <div className="pvp-round-title">{pvpRoundResultLabel}</div>
                <div className="pvp-round-scoreline">
                  <div className="pvp-round-score-item">
                    <span>{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                    <strong>{Math.max(0, Number(pvpMatch?.player1_score || 0))}</strong>
                  </div>
                  <div className="pvp-round-score-divider">×</div>
                  <div className="pvp-round-score-item">
                    <span>{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                    <strong>{Math.max(0, Number(pvpMatch?.player2_score || 0))}</strong>
                  </div>
                </div>
                <div className="pvp-round-answer-feedback">
                  <div className={`pvp-round-answer-chip ${pvpRoundPlayer1Feedback.cssClass}`}>
                    <span className="pvp-round-answer-name">{pvpMatch?.player1_nickname || 'Jogador 1'}</span>
                    <span className="pvp-round-answer-state">{pvpRoundPlayer1Feedback.emoji} {pvpRoundPlayer1Feedback.label}</span>
                  </div>
                  <div className={`pvp-round-answer-chip ${pvpRoundPlayer2Feedback.cssClass}`}>
                    <span className="pvp-round-answer-name">{pvpMatch?.player2_nickname || 'Jogador 2'}</span>
                    <span className="pvp-round-answer-state">{pvpRoundPlayer2Feedback.emoji} {pvpRoundPlayer2Feedback.label}</span>
                  </div>
                </div>
                <div className={`pvp-round-countdown ${pvpRoundResultCountdownClass}`}>Proxima pergunta em {pvpRoundResultRemainingSec}s</div>
                <div className="pvp-round-emoji-actions pvp-round-emoji-actions-modal">
                  {pvpBattleEmojis.map((emoji) => (
                    <button
                      key={`modal_${emoji}`}
                      className={`pvp-emoji-btn ${pvpEmojiCooldownActive ? 'is-cooldown' : ''}`}
                      onClick={() => sendPvpEmoji(emoji)}
                      disabled={pvpEmojiCooldownActive}
                      aria-label={`Enviar emoji ${emoji}`}
                    >
                      <span className="pvp-emoji-glyph" aria-hidden="true">{emoji}</span>
                      {pvpEmojiCooldownActive ? (
                        <>
                          <span
                            className="pvp-emoji-cooldown-fill"
                            style={{ height: `${pvpEmojiCooldownFillPct}%` }}
                            aria-hidden="true"
                          />
                          <span className="pvp-emoji-cooldown-label" aria-hidden="true">{pvpEmojiCooldownLabel}</span>
                        </>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className={`screen ${screen === 'pvp-result' ? 'active' : ''}`}>
          <div className="result-content">
            {!pvpHideDefaultResultPanel ? (
              <div className={`pvp-result-panel pvp-result-panel-dynamic outcome-${pvpResult === 'win' ? 'win' : pvpResult === 'draw' ? 'draw' : 'lose'}`}>
                <div className="result-emoji pvp-result-seq result-seq-1">{pvpResult === 'win' ? '🏆' : pvpResult === 'draw' ? '🤝' : '😵'}</div>
                <div className="result-title pvp-result-seq result-seq-2">
                  {pvpResult === 'win' ? 'Vitoria!' : pvpResult === 'draw' ? 'Empate!' : 'Derrota'}
                </div>
                <div className="result-subtitle pvp-result-seq result-seq-3">Resultado da partida PVP</div>
                <div className="result-level-info pvp-result-seq result-seq-4">{formatSignedPoints(pvpPointsDelta)} ponto(s) PVP</div>
                <div className="result-level-info pvp-result-seq result-seq-5">+{pvpRewardsPreview.xp} XP · +{pvpRewardsPreview.coins} moedas</div>
                <div className="result-level-info pvp-result-seq result-seq-6">Total PVP: {progress.pvpPoints}</div>
                {pvpResultReward ? (
                  <>
                    <div className="reward-collect-list pvp-result-reward-list pvp-result-seq result-seq-7">
                      <div className="reward-collect-item">
                        <span className="reward-collect-item-label">Pontos PVP</span>
                        <span className={`reward-collect-item-value ${Number(pvpResultReward.points || 0) >= 0 ? 'points' : 'points-loss'}`}>
                          {formatSignedPoints(pvpResultReward.points || 0)}
                        </span>
                      </div>
                      <div className="reward-collect-item">
                        <span className="reward-collect-item-label">XP</span>
                        <span className="reward-collect-item-value xp">+{Math.max(0, Number(pvpResultReward.xp || 0))}</span>
                      </div>
                      <div className="reward-collect-item">
                        <span className="reward-collect-item-label">Moedas</span>
                        <span className="reward-collect-item-value coins">+{Math.max(0, Number(pvpResultReward.coins || 0))}</span>
                      </div>
                    </div>
                    <button
                      className="reward-collect-btn pvp-result-reward-btn pvp-result-seq result-seq-8"
                      disabled={pvpRewardCollecting}
                      onClick={(event) => collectPvpResultRewards(event)}
                    >
                      {pvpRewardCollecting ? 'Coletando...' : 'Coletar recompensas e ir ao inicio'}
                    </button>
                    <div className="result-subtitle pvp-result-seq result-seq-9 pvp-result-collect-note">
                      O retorno ao inicio sera liberado apos a coleta.
                    </div>
                  </>
                ) : (
                  <div className="result-subtitle pvp-result-seq result-seq-7 pvp-result-collect-note">
                    Preparando recompensas...
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {screen === 'home' ? (
          <>
            <div className="home-build-badge" aria-live="polite">
              Build...: {buildBadgeValue}
            </div>
            <button
              className="admin-lock-btn"
              onClick={openAdminScreen}
              aria-label="Abrir monitoramento admin"
              title="Monitoramento admin"
            >
              🔒
            </button>
          </>
        ) : null}
      </div>

      {showNetworkWarning ? (
        <div className={`network-warning-float ${networkWarningModeClass}`} role="status" aria-live="polite">
          <span className="network-warning-dot" aria-hidden="true" />
          <span className="network-warning-text">{networkWarningText}</span>
        </div>
      ) : null}

      {activeShopItemPreview ? (
        <div className="reset-modal shop-item-preview-modal" onClick={closeShopItemPreview}>
          <div className="reset-modal-card shop-item-preview-card" onClick={(event) => event.stopPropagation()}>
            <h3>Pre-visualizacao</h3>
            <p>{activeShopItemPreview.name}</p>
            <div
              className={[
                'shop-modal-profile',
                shopModalPreviewBgMeta.className
              ].filter(Boolean).join(' ')}
              data-bg-id={shopModalPreviewBgMeta.id}
              data-bg-rarity={shopModalPreviewBgMeta.rarity}
              style={{ background: shopModalPreviewBgStyle }}
            >
              <div className="shop-modal-profile-content">
                <span className={`hero-avatar shop-modal-avatar ${shopModalPreviewFrameClass}`} style={shopModalPreviewFrameStyle}>
                  {isImageAvatarValue(shopModalPreviewAvatar) ? (
                    <img className="hero-avatar-image" src={shopModalPreviewAvatar} alt="Avatar da pre-visualizacao" referrerPolicy="no-referrer" />
                  ) : shopModalPreviewAvatar}
                </span>
                <div className="shop-modal-profile-info">
                  <div className="shop-modal-profile-name">{heroNickname}</div>
                  <div className="shop-modal-profile-meta">Nv. {safeLevel} · 🔥 {safeBestStreak} · 🪙 {safeCoins}</div>
                  <div className="shop-modal-profile-badges">
                    <span className={`tier-badge tier-badge-compact tier-${pveCategory.key}`}>PVE {pveCategory.label}</span>
                    <span className={`tier-badge tier-badge-compact tier-${pvpCategory.key}`}>PVP {pvpCategory.label}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="match-accept-actions">
              <button className="btn btn-secondary btn-lg" onClick={closeShopItemPreview}>Fechar</button>
            </div>
          </div>
        </div>
      ) : null}

      {adminAuthOpen ? (
        <div className="reset-modal admin-auth-modal" onClick={closeAdminAuthModal}>
          <div className="reset-modal-card admin-auth-card" onClick={(event) => event.stopPropagation()}>
            <h3>Acesso administrativo</h3>
            <p>Digite a senha para abrir o monitoramento.</p>
            <input
              type="password"
              className="profile-input settings-input admin-auth-input"
              placeholder="Senha"
              value={adminPassword}
              onChange={(event) => {
                setAdminPassword(event.target.value);
                if (adminAuthError) setAdminAuthError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitAdminAuth();
              }}
              autoFocus
            />
            {adminAuthError ? <div className="admin-auth-error">{adminAuthError}</div> : null}
            <div className="match-accept-actions">
              <button className="btn btn-primary btn-lg" onClick={submitAdminAuth}>Entrar</button>
              <button className="btn btn-secondary btn-lg" onClick={closeAdminAuthModal}>Cancelar</button>
            </div>
          </div>
        </div>
      ) : null}

      {updateState.available ? (
        <div className={`update-notice-bar ${updateState.applying ? 'is-applying' : ''}`} role="status" aria-live="polite">
          <div className="update-notice-inner">
            <div className="update-notice-main">
              <span className="update-notice-dot" aria-hidden="true" />
              <div className="update-notice-copy">
                <span className="update-notice-title">Nova versao disponivel</span>
                <span className="update-notice-text">
                  Atualize para aplicar melhorias e correcoes.
                </span>
              </div>
            </div>
            <button
              className="update-notice-btn"
              disabled={updateState.applying}
              onClick={applyPendingUpdate}
              title="Existe uma versao nova publicada"
            >
              {updateState.applying ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      ) : null}

      {cookieConsent === 'pending' ? (
        <div className="cookie-consent-banner" role="dialog" aria-live="polite" aria-label="Preferencias de cookies">
          <div className="cookie-consent-card">
            <div className="cookie-consent-copy">
              <div className="cookie-consent-title">Uso de cookies</div>
              <div className="cookie-consent-text">
                Aceite cookies para melhorar dados de sessao, desempenho e experiencia geral do app.
              </div>
            </div>
            <div className="cookie-consent-actions">
              <button
                className="cookie-consent-btn cookie-consent-btn-muted"
                onClick={() => saveCookieConsent('essential')}
              >
                Somente essenciais
              </button>
              <button
                className="cookie-consent-btn cookie-consent-btn-primary"
                onClick={() => saveCookieConsent('accepted')}
              >
                Aceitar cookies
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {authTransition.visible ? (
        <div className="auth-transition-overlay">
          <div className="auth-transition-card">
            <div className="auth-transition-spinner" />
            <div className="auth-transition-title">{authTransition.title || 'Preparando sua conta'}</div>
            <div className="auth-transition-subtitle">{authTransition.subtitle || 'Aguarde alguns segundos...'}</div>
          </div>
        </div>
      ) : null}

      {screen === 'quiz' && quizMenuOpen ? (
        <div className="quiz-action-overlay" onClick={closeQuizMenu}>
          <div className="quiz-action-modal" onClick={(event) => event.stopPropagation()}>
            <div className="quiz-action-title">Menu do Quiz</div>
            <div className="quiz-action-subtitle">Escolha a proxima acao para a partida atual.</div>
            <div className="quiz-action-buttons">
              <button className="btn btn-primary" onClick={restartCurrentQuiz}>Reiniciar Quiz</button>
              <button className="btn btn-secondary" onClick={chooseAnotherQuiz}>Escolher Outro Quiz</button>
              <button className="btn btn-secondary" onClick={returnQuizToHome}>Voltar ao Inicio</button>
              <button className="btn btn-secondary quiz-action-close" onClick={closeQuizMenu}>Continuar Quiz</button>
            </div>
          </div>
        </div>
      ) : null}

      {pvpEmojiPickerOpen ? (
        <div className="reset-modal" onClick={closePvpEmojiPicker}>
          <div className="reset-modal-card pvp-emoji-editor-card" onClick={(event) => event.stopPropagation()}>
            <h3>Emojis da Partida</h3>
            <p className="pvp-emoji-editor-hint">Selecione os 6 emojis pelos slots abaixo para salvar.</p>
            {pvpEmojiDraftWarning ? (
              <p className="pvp-emoji-editor-warning">{pvpEmojiDraftWarning}</p>
            ) : null}

            <div className="pvp-emoji-slots-wrap">
              <div className="pvp-emoji-section-title">Selecionados</div>
              <div className="pvp-emoji-slots">
                {Array.from({ length: 6 }).map((_, index) => {
                  const selected = normalizeEmojiDraftSlots(pvpEmojiDraft)[index] || '';
                  const activeSlot = index === pvpEmojiSlotFocus;
                  return (
                    <button
                      key={`emoji_slot_${index}`}
                      type="button"
                      className={`pvp-emoji-slot ${activeSlot ? 'active' : ''}`}
                      onClick={() => selectPvpEmojiSlot(index)}
                    >
                      <span className="pvp-emoji-slot-index">{index + 1}</span>
                      <span className="pvp-emoji-slot-value">{selected || '+'}</span>
                      {selected ? (
                        <span
                          className="pvp-emoji-slot-remove"
                          onClick={(event) => {
                            event.stopPropagation();
                            removePvpEmojiAt(index);
                          }}
                        >
                          ×
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pvp-emoji-divider" aria-hidden="true" />
            <div className="pvp-emoji-section-title pvp-emoji-section-title-options">Galeria de emojis</div>
            <div className="pvp-emoji-editor-list">
              {activePvpEmojiOptions.map((emoji, index) => {
                const active = normalizeEmojiDraftSlots(pvpEmojiDraft).includes(emoji);
                return (
                  <button
                    type="button"
                    key={`emoji_pick_all_${emoji}_${index}`}
                    className={`pvp-emoji-option ${active ? 'active' : ''}`}
                    onClick={() => togglePvpEmojiDraft(emoji)}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
            <div className="match-accept-actions pvp-emoji-picker-actions">
              <button className="btn btn-primary btn-lg" onClick={savePvpEmojiDraft}>Salvar</button>
              <button className="btn btn-secondary btn-lg" onClick={closePvpEmojiPicker}>Cancelar</button>
            </div>
          </div>
        </div>
      ) : null}

      {screen === 'result' && resultState && !resultState.rewardsCollected ? (
        <div className="reset-modal reward-collect-modal" role="dialog" aria-live="polite" aria-label="Coletar recompensas">
          <div className="reset-modal-card reward-collect-card">
            <div className="reward-collect-shine" aria-hidden="true" />
            <h3>Recompensas da partida</h3>
            <p>Toque em coletar para receber seus ganhos.</p>
            <div className="reward-collect-list">
              <div className="reward-collect-item">
                <span className="reward-collect-item-label">XP</span>
                <span className="reward-collect-item-value xp">+{Math.max(0, Number(resultState.awardedXp || 0))}</span>
              </div>
              <div className="reward-collect-item">
                <span className="reward-collect-item-label">Moedas</span>
                <span className="reward-collect-item-value coins">+{Math.max(0, Number(resultState.awardedCoins || 0))}</span>
              </div>
              <div className="reward-collect-item">
                <span className="reward-collect-item-label">Pontos de ranking</span>
                <span className="reward-collect-item-value points">+{Math.max(0, Number(resultState.rankingGain || 0))}</span>
              </div>
            </div>
            <button className="reward-collect-btn" disabled={rewardCollecting} onClick={(event) => handleCollectResultRewards(event)}>
              {rewardCollecting ? 'Coletando...' : 'Coletar'}
            </button>
          </div>
        </div>
      ) : null}

      {screen === 'pvp-result' && pvpOpponentLeftTransitionActive ? (
        <div className="pvp-result-transition-overlay" role="status" aria-live="polite" aria-label="Transicao de resultado">
          <div className="pvp-result-transition-backdrop" />
          <div className="pvp-result-transition-card">
            <div className="pvp-result-transition-spinner" />
            <div className="pvp-result-transition-title">Oponente saiu da partida</div>
            <div className="pvp-result-transition-subtitle">Preparando sua compensacao...</div>
          </div>
        </div>
      ) : null}

      {pvpCompensation ? (
        <div className="reset-modal reward-collect-modal" role="dialog" aria-live="polite" aria-label="Compensacao PVP">
          <div className="reset-modal-card reward-collect-card">
            <h3>{pvpCompensation.title || 'Compensacao da partida'}</h3>
            <p>{pvpCompensation.subtitle || 'Voce recebeu uma compensacao.'}</p>
            <div className="reward-collect-list">
              <div className="reward-collect-item">
                <span className="reward-collect-item-label">Pontos PVP</span>
                <span className={`reward-collect-item-value ${Number(pvpCompensation.points || 0) >= 0 ? 'points' : 'points-loss'}`}>
                  {formatSignedPoints(pvpCompensation.points || 0)}
                </span>
              </div>
              <div className="reward-collect-item">
                <span className="reward-collect-item-label">XP</span>
                <span className="reward-collect-item-value xp">+{Math.max(0, Number(pvpCompensation.xp || 0))}</span>
              </div>
              <div className="reward-collect-item">
                <span className="reward-collect-item-label">Moedas</span>
                <span className="reward-collect-item-value coins">+{Math.max(0, Number(pvpCompensation.coins || 0))}</span>
              </div>
            </div>
            <button className="reward-collect-btn" disabled={pvpRewardCollecting} onClick={(event) => collectPvpCompensation(event)}>
              {pvpRewardCollecting ? 'Coletando...' : 'Coletar'}
            </button>
          </div>
        </div>
      ) : null}

      {rewardFxParticles.length ? (
        <div className="reward-collect-particles" aria-hidden="true">
          {rewardFxParticles.map((particle) => (
            <span
              key={particle.id}
              className={`reward-fx-particle ${particle.kind}`}
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                '--dx': `${particle.dx}px`,
                '--dy': `${particle.dy}px`,
                '--drift': `${particle.drift}px`,
                '--delay': `${particle.delay}ms`,
                '--duration': `${particle.duration}ms`,
                '--size': `${particle.size}px`,
                '--rotation': `${particle.rotate}deg`
              }}
            >
              {particle.icon}
            </span>
          ))}
        </div>
      ) : null}

      {screen !== 'login' ? (
        <div className={`music-player ${audioSettings.musicEnabled ? 'visible' : ''}`}>
          <span className="music-player-icon">{musicMode === 'battle' ? '🔥' : '🎵'}</span>
          <span className="music-player-name">
            {musicMode === 'battle' ? 'Partida: ' : 'Menu: '}
            {activeMusicTrack?.name || 'Sem trilha'}
          </span>
          <button className="music-player-skip" onClick={handleMusicSkip} aria-label="Trocar trilha">
            ⏭
          </button>
        </div>
      ) : null}

    </>
  );
}
