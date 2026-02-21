const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

initializeApp();
const db = getDatabase();

const ALL_QUESTIONS = (() => {
  try { return require('./questions-data.json'); } catch (_) { return {}; }
})();

const SYSTEM_BOT_ROSTER = [
  { id: 'bot_sys_codequiz_prime', nickname: 'tr3vo_azul', full_name: 'Tr3vo Azul', avatar: '😏', personality: 'provocador', strength: 'forte' },
  { id: 'bot_sys_codequiz_orbita', nickname: '0rbita', full_name: '0rbita', avatar: '🧐', personality: 'analitico', strength: 'forte' },
  { id: 'bot_sys_codequiz_zefira', nickname: 'Zefira', full_name: 'Zefira', avatar: '🤔', personality: 'estrategista', strength: 'medio' },
  { id: 'bot_sys_codequiz_sopro', nickname: 'Sopro', full_name: 'Sopro', avatar: '🙂', personality: 'calmo', strength: 'medio' },
  { id: 'bot_sys_codequiz_lua9', nickname: 'lua9', full_name: 'Lua9', avatar: '🥳', personality: 'caotico', strength: 'medio' },
  { id: 'bot_sys_codequiz_thiagoara', nickname: 'ThiagoAra', full_name: 'Thiago Ara', avatar: '😎', personality: 'competitivo', strength: 'medio' },
  { id: 'bot_sys_codequiz_bdevonly', nickname: 'bDevOnly', full_name: 'bDevOnly', avatar: '🤔', personality: 'estrategista', strength: 'medio' },
  { id: 'bot_sys_codequiz_flakael', nickname: 'Flakael', full_name: 'Flakael', avatar: '😉', personality: 'sarcastico', strength: 'forte' },
  { id: 'bot_sys_codequiz_z3n', nickname: 'z3n', full_name: 'z3n', avatar: '😉', personality: 'sarcastico', strength: 'medio' }
];

const SYSTEM_BOT_IDS = SYSTEM_BOT_ROSTER.map((bot) => bot.id);
const BOT_ID_SET = new Set(SYSTEM_BOT_IDS);

const BOT_ARENA_QUEUE_PATH = 'pvp_bots_state/arena_queue';
const BOT_USER_QUEUE_PATH = 'pvp_bots_state/user_queue';
const BOT_ARENA_STATE_PATH = 'pvp_bots_state/arena_state';
const BOT_ARENA_QUIZ_STATE_PATH = 'pvp_bots_state/arena_quiz_state';
const BOT_BUSY_PATH = 'pvp_bots_state/busy';
const BOT_LOCK_PATH = 'pvp_bots_state/automation_lock';
const BOT_DAEMON_CONTROL_PATH = 'pvp_bots_state/daemon_control';
const BOT_DAEMON_STATUS_PATH = 'pvp_bots_state/daemon_status';

const BOT_BASE_ROUNDS = 5;
const BOT_MAX_ROUNDS = 15;
const BOT_BATTLE_MS_MIN = 20000;
const BOT_BATTLE_MS_MAX = 32000;
const BOT_STALE_MATCH_MAX_MS = 150000;
const BOT_USER_PENDING_STALE_MS = 14000;
const BOT_USER_OPEN_MATCH_STALE_MS = 210000;
const BOT_DUEL_ANSWER_MS_MIN = 1000;
const BOT_DUEL_ANSWER_MS_MAX = 6000;
const BOT_DUEL_ROUND_RESULT_MS = 6000;
const BOT_DUEL_ROUND_SECONDS = { easy: 20, medium: 18, hard: 15 };
const BOT_LOCK_TTL_MS = 9000;
const BOT_DAEMON_LOOP_MS = 58000;
const BOT_DAEMON_TICK_MS = 2200;
const BOT_QUIZ_BATCH_SIZE = 1;
const BOT_QUIZ_DURATION_MS_MIN = 24000;
const BOT_QUIZ_DURATION_MS_MAX = 36000;
const BOT_QUIZ_BUSY_SOURCE = 'arena_quiz';
const BOT_QUIZ_DIFFICULTY_SEQUENCE = Object.freeze(['easy', 'medium', 'hard']);
const BOT_QUIZ_QUESTIONS_PER_ROUND = 8;
const BOT_ACCURACY_TARGET_BY_STRENGTH = Object.freeze({
  fraco: 0.5,
  medio: 0.7,
  forte: 0.9
});

const PVP_XP_REWARD = {
  easy: { win: 20, draw: 10, loss: 6 },
  medium: { win: 28, draw: 14, loss: 8 },
  hard: { win: 36, draw: 18, loss: 10 }
};

const PVP_COINS_REWARD = {
  easy: { win: 8, draw: 4, loss: 2 },
  medium: { win: 10, draw: 5, loss: 3 },
  hard: { win: 12, draw: 6, loss: 4 }
};

const XP_PER_CORRECT = {
  easy: 10,
  medium: 15,
  hard: 20
};

const COINS_PER_CORRECT = {
  easy: 3,
  medium: 5,
  hard: 7
};

const PVE_COMPLETION_XP_BONUS = {
  easy: 8,
  medium: 12,
  hard: 16
};

const PVE_COMPLETION_COINS_BONUS = {
  easy: 2,
  medium: 3,
  hard: 4
};

const BOT_QUIZ_TOPIC_MAP = Object.freeze({
  c: ['conditionals', 'functions', 'loops', 'pointers', 'structs', 'variables'],
  fundamentos_computacao: ['dados_memoria', 'hardware_software', 'redes_internet', 'sistemas_operacionais'],
  fundamentos_programacao: ['boas_praticas', 'eficiencia_basica', 'pensamento_computacional', 'testes_validacao'],
  historia_computacao: ['geracoes_computadores', 'historia_internet', 'historia_linguagens', 'pioneiros'],
  html_css: ['css_box', 'css_flex', 'css_responsive', 'css_selectors', 'html_basics', 'html_forms'],
  java: ['arrays', 'conditionals', 'functions', 'loops', 'oop', 'variables'],
  javascript: ['arrays', 'conditionals', 'functions', 'loops', 'objects', 'variables'],
  logic_prog: ['algorithms', 'conditions', 'data_structures', 'flowcharts', 'repetition', 'variables_types'],
  math: ['algebra', 'arithmetic', 'combinatorics', 'logic', 'numeral', 'sets'],
  python: ['conditionals', 'dicts', 'functions', 'lists', 'loops', 'variables'],
  sql: ['aggregate', 'create', 'insert_update', 'joins', 'select', 'where'],
  zero_to_code: ['boolean_reasoning', 'debugging_basics', 'first_contact', 'operators_basics', 'sequence_logic', 'trace_execution']
});

function buildBotQuizCatalogByDifficulty(topicMap = {}) {
  const safeTopicMap = topicMap && typeof topicMap === 'object' ? topicMap : {};
  const catalog = {
    easy: [],
    medium: [],
    hard: []
  };

  Object.keys(safeTopicMap).sort().forEach((languageId) => {
    const topics = Array.isArray(safeTopicMap[languageId]) ? safeTopicMap[languageId] : [];
    topics
      .map((topicId) => String(topicId || '').trim())
      .filter((topicId) => !!topicId)
      .sort()
      .forEach((topicId) => {
        BOT_QUIZ_DIFFICULTY_SEQUENCE.forEach((difficulty) => {
          catalog[difficulty].push({
            language: String(languageId || '').trim(),
            topic: topicId,
            difficulty,
            total_questions: BOT_QUIZ_QUESTIONS_PER_ROUND
          });
        });
      });
  });

  return catalog;
}

const BOT_QUIZ_CATALOG_BY_DIFFICULTY = buildBotQuizCatalogByDifficulty(BOT_QUIZ_TOPIC_MAP);

const BOT_QUEUE_PRNG_MOD = 2147483647;

function nowIso(ms = Date.now()) {
  return new Date(ms).toISOString();
}

function toMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  const p = Date.parse(String(value || ''));
  return Number.isFinite(p) ? p : 0;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms || 0))));
}

function normalizeDifficulty(value) {
  const key = String(value || '').trim().toLowerCase();
  if (key === 'hard') return 'hard';
  if (key === 'medium') return 'medium';
  return 'easy';
}

function parseBooleanLike(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const key = String(value || '').trim().toLowerCase();
  if (key === 'true' || key === '1' || key === 'yes' || key === 'on' || key === 'enabled') return true;
  if (key === 'false' || key === '0' || key === 'no' || key === 'off' || key === 'disabled') return false;
  return fallback;
}

function resolveDifficultyByPvpPoints(pointsValue) {
  const points = Math.max(0, Number(pointsValue || 0));
  if (points > 180) return 'hard';
  if (points > 90) return 'medium';
  return 'easy';
}

function isSystemBotUserId(userId) {
  const id = String(userId || '').trim();
  return BOT_ID_SET.has(id);
}

function normalizeBotQueueOrder(rawOrder) {
  const safe = Array.isArray(rawOrder) ? rawOrder : [];
  const seen = new Set();
  const next = [];
  safe.forEach((id) => {
    const safeId = String(id || '').trim();
    if (!isSystemBotUserId(safeId)) return;
    if (seen.has(safeId)) return;
    seen.add(safeId);
    next.push(safeId);
  });
  SYSTEM_BOT_IDS.forEach((id) => {
    if (seen.has(id)) return;
    next.push(id);
  });
  return next;
}

function rotateQueueOrder(order, botIds = []) {
  let next = normalizeBotQueueOrder(order);
  const ids = Array.from(new Set((Array.isArray(botIds) ? botIds : [])
    .map((id) => String(id || '').trim())
    .filter((id) => isSystemBotUserId(id))));
  ids.forEach((botId) => {
    if (!next.includes(botId)) return;
    next = next.filter((id) => id !== botId);
    next.push(botId);
  });
  return next;
}

function normalizeCyclePlayed(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  SYSTEM_BOT_IDS.forEach((id) => {
    if (safe[id] === true || String(safe[id] || '').toLowerCase() === 'true') out[id] = true;
  });
  return out;
}

function isCycleDone(cyclePlayed) {
  const safe = cyclePlayed && typeof cyclePlayed === 'object' ? cyclePlayed : {};
  return SYSTEM_BOT_IDS.every((id) => safe[id] === true);
}

function seededRandom(seedValue) {
  let seed = Math.floor(Number(seedValue || 1)) % BOT_QUEUE_PRNG_MOD;
  if (seed <= 0) seed += BOT_QUEUE_PRNG_MOD - 1;
  return () => {
    seed = (seed * 48271) % BOT_QUEUE_PRNG_MOD;
    return seed / BOT_QUEUE_PRNG_MOD;
  };
}

function shuffleQueue(order, seedValue = Date.now()) {
  const next = normalizeBotQueueOrder(order).slice();
  if (next.length <= 1) return next;
  const rand = seededRandom(seedValue);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

function getXPForLevel(level) {
  const safeLevel = Math.max(1, Number(level || 1));
  return 50 + (safeLevel - 1) * 30;
}

function splitProgressTotalXp(totalXp) {
  let remaining = Math.max(0, Math.floor(Number(totalXp || 0)));
  let level = 1;
  let guard = 0;
  while (guard < 2000) {
    const need = getXPForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
    guard += 1;
  }
  return { level, xp: remaining };
}

function getPvpPointsDelta(resultKey, roundNo, endedReason, uid, winnerId, endedById) {
  const key = String(resultKey || '').trim().toLowerCase();
  const decisiveRound = Math.max(1, Number(roundNo || 1));

  if (String(endedReason || '').trim().toLowerCase() === 'forfeit') {
    if (uid && endedById && uid === endedById) return -2;
    if (uid && winnerId && uid === winnerId) return 4;
    if (key === 'win') return 4;
    if (key === 'loss') return -2;
  }

  if (key === 'win') {
    if (decisiveRound >= 8) return 8;
    if (decisiveRound >= 6) return 6;
    return 4;
  }
  if (key === 'loss') return -2;
  return 0;
}

function getReward(table, difficulty, result) {
  const safeDifficulty = normalizeDifficulty(difficulty);
  const safeResult = String(result || '').trim().toLowerCase();
  const row = table[safeDifficulty] || table.easy;
  return Math.max(0, Number(row[safeResult] || 0));
}

function getFinishedMatchDecisiveRoundNo(row, fallback = 1) {
  return Math.max(0, Number((row && (row.ended_round_no || row.round_no)) || fallback || 1));
}

function getInvalidFinishedMatchReason(row) {
  if (!row || typeof row !== 'object') return '';
  if (String(row.status || '').trim().toLowerCase() !== 'finished') return '';
  if (row.result_void === true) {
    return String(row.result_void_reason || '').trim() || 'voided_match';
  }
  const endedRoundNo = getFinishedMatchDecisiveRoundNo(row, 0);
  const shortMatch = endedRoundNo < 5;
  const p1 = Math.max(0, Number(row.player1_score || 0));
  const p2 = Math.max(0, Number(row.player2_score || 0));
  const zeroScore = p1 === 0 && p2 === 0;
  if (shortMatch && zeroScore) return 'under_min_rounds_zero_score';
  if (shortMatch) return 'under_min_rounds';
  if (zeroScore) return 'zero_score';
  return '';
}

function isInvalidFinishedMatch(row) {
  return !!getInvalidFinishedMatchReason(row);
}

function getPvpResultForUser(row, uid) {
  const safeUid = String(uid || '').trim();
  if (!safeUid) return 'draw';
  const winnerId = String((row && row.winner_user_id) || '').trim();
  if (!winnerId) return 'draw';
  return winnerId === safeUid ? 'win' : 'loss';
}

function normalizeProcessedMatchesMap(value) {
  const safe = value && typeof value === 'object' ? value : {};
  const next = {};
  Object.entries(safe).forEach(([matchId, enabled]) => {
    if (!matchId) return;
    if (enabled === true || String(enabled || '').trim().toLowerCase() === 'true') {
      next[matchId] = true;
    }
  });
  return next;
}

function trueMapEquals(a, b) {
  const mapA = normalizeProcessedMatchesMap(a);
  const mapB = normalizeProcessedMatchesMap(b);
  const keysA = Object.keys(mapA);
  const keysB = Object.keys(mapB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => mapB[key] === true);
}

function buildMatchId(botA, botB) {
  const ids = [String(botA || '').trim(), String(botB || '').trim()].sort();
  return `pvp_${ids.join('_')}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function normalizeBotStrength(value) {
  const key = String(value || '').trim().toLowerCase();
  if (key === 'fraco' || key === 'medio' || key === 'forte') return key;
  return 'medio';
}

function hashStringToSeed(value) {
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
      const rand = seededRandom(hashStringToSeed(`${seedKey}:${step}`));
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

function getBotAccuracyByStrength(strength) {
  const safeStrength = normalizeBotStrength(strength || 'medio');
  return Number(BOT_ACCURACY_TARGET_BY_STRENGTH[safeStrength] || BOT_ACCURACY_TARGET_BY_STRENGTH.medio || 0.7);
}

function getQuizKey(language, topic, difficulty) {
  return `${String(language || '')}_${String(topic || '')}_${normalizeDifficulty(difficulty || 'easy')}`;
}

function calculateStars(correctCount, totalQuestions) {
  const total = Math.max(1, Number(totalQuestions || 0));
  const ratio = Number(correctCount || 0) / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.65) return 2;
  return 1;
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
  const botStrength = normalizeBotStrength(
    safe.bot_strength
    || SYSTEM_BOT_ROSTER.find((entry) => entry.id === botId)?.strength
    || 'medio'
  );
  const language = String(safe.language || '').trim();
  const topic = String(safe.topic || '').trim();
  const difficulty = normalizeDifficulty(safe.difficulty || 'easy');
  const totalQuestions = Math.max(1, Math.trunc(Number(safe.total_questions || BOT_QUIZ_QUESTIONS_PER_ROUND)));
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
    if (!step || !step.quiz) break;
    entries.push(step.quiz);
    cursor = step.cursor;
  }

  return {
    entries,
    cursor
  };
}

function getBotQuizAccuracyTarget(botStrength = 'medio', _difficulty = 'easy') {
  return getBotAccuracyByStrength(botStrength || 'medio');
}

function simulateBotQuizOutcome(botStrength = 'medio', quizEntry = {}, options = {}) {
  const totalQuestions = Math.max(
    1,
    Math.trunc(Number(quizEntry.total_questions || BOT_QUIZ_QUESTIONS_PER_ROUND))
  );
  const safeDifficulty = normalizeDifficulty(quizEntry.difficulty || 'easy');
  const safeStrength = normalizeBotStrength(botStrength || 'medio');
  const targetAccuracy = getBotQuizAccuracyTarget(safeStrength, safeDifficulty);
  const quizKey = getQuizKey(quizEntry.language || '', quizEntry.topic || '', safeDifficulty);
  const seedKey = String(options && options.seed_key || '')
    || `quiz:${safeStrength}:${quizKey}:${totalQuestions}`;
  const run = resolveDeterministicBotRun(seedKey, targetAccuracy, totalQuestions, totalQuestions);

  return {
    correct_count: run.correct_count,
    total_questions: totalQuestions,
    best_streak: run.best_streak,
    simulated_accuracy: targetAccuracy
  };
}

async function getNode(path) {
  const snap = await db.ref(path).get();
  return snap.exists() ? snap.val() : null;
}

async function setNode(path, value) {
  await db.ref(path).set(value);
}

async function tx(path, updater) {
  return db.ref(path).transaction((current) => updater(current));
}

async function ensureSystemBots() {
  const now = nowIso();
  for (const bot of SYSTEM_BOT_ROSTER) {
    const [userCurrent, statsCurrent, cfgCurrent] = await Promise.all([
      getNode(`users/${bot.id}`).catch(() => null),
      getNode(`user_stats/${bot.id}`).catch(() => null),
      getNode(`pvp_bots_state/configs/${bot.id}`).catch(() => null)
    ]);

    const cfg = {
      bot_id: bot.id,
      nickname: bot.nickname,
      personality: String((cfgCurrent && cfgCurrent.personality) || bot.personality || 'provocador'),
      strength: bot.strength || 'medio',
      updated_at: now
    };

    await setNode(`pvp_bots_state/configs/${bot.id}`, cfg).catch(() => null);

    const userNext = {
      id: bot.id,
      auth_id: bot.id,
      full_name: bot.full_name,
      nickname: bot.nickname,
      avatar: String((userCurrent && userCurrent.avatar) || bot.avatar || '🤖'),
      equipped_frame: String((userCurrent && userCurrent.equipped_frame) || 'frame_default'),
      equipped_background: String((userCurrent && userCurrent.equipped_background) || 'bg_default'),
      equipped_emoji: String((userCurrent && userCurrent.equipped_emoji) || 'emoji_profile'),
      bot_personality: cfg.personality,
      bot_strength: bot.strength || 'medio',
      is_system_bot: true,
      created_at: (userCurrent && userCurrent.created_at) || now,
      updated_at: now
    };

    const statsPrev = statsCurrent && typeof statsCurrent === 'object' ? statsCurrent : {};
    const statsNext = {
      user_id: bot.id,
      total_xp: Math.max(0, Number(statsPrev.total_xp || 0)),
      level: Math.max(1, Number(statsPrev.level || 1)),
      ranking_points: Math.max(0, Number(statsPrev.ranking_points || 0)),
      pvp_points: Math.max(0, Number(statsPrev.pvp_points || 0)),
      coins: Math.max(0, Number(statsPrev.coins || 20)),
      pvp_battles: Math.max(0, Number(statsPrev.pvp_battles || 0)),
      pvp_wins: Math.max(0, Number(statsPrev.pvp_wins || 0)),
      pvp_losses: Math.max(0, Number(statsPrev.pvp_losses || 0)),
      pvp_processed_matches: statsPrev.pvp_processed_matches && typeof statsPrev.pvp_processed_matches === 'object'
        ? statsPrev.pvp_processed_matches
        : {},
      pvp_recalculated_at_ms: Math.max(0, Number(statsPrev.pvp_recalculated_at_ms || 0)),
      best_streak: Math.max(0, Number(statsPrev.best_streak || 0)),
      total_correct: Math.max(0, Number(statsPrev.total_correct || 0)),
      total_answered: Math.max(0, Number(statsPrev.total_answered || 0)),
      quizzes_completed: Math.max(0, Number(statsPrev.quizzes_completed || 0)),
      topic_progress: statsPrev.topic_progress && typeof statsPrev.topic_progress === 'object' ? statsPrev.topic_progress : {},
      quiz_best_scores: statsPrev.quiz_best_scores && typeof statsPrev.quiz_best_scores === 'object' ? statsPrev.quiz_best_scores : {},
      quiz_best_stars: statsPrev.quiz_best_stars && typeof statsPrev.quiz_best_stars === 'object' ? statsPrev.quiz_best_stars : {},
      is_system_bot: true,
      updated_at: now
    };

    await Promise.all([
      setNode(`users/${bot.id}`, userNext).catch(() => null),
      setNode(`user_stats/${bot.id}`, statsNext).catch(() => null)
    ]);
  }

  await setNode('pvp_bots_state/config', {
    bot_id: SYSTEM_BOT_ROSTER[0].id,
    nickname: SYSTEM_BOT_ROSTER[0].nickname,
    personality: SYSTEM_BOT_ROSTER[0].personality,
    strength: SYSTEM_BOT_ROSTER[0].strength || 'medio',
    updated_at: now
  }).catch(() => null);
}

async function ensureQueueState() {
  const nowMs = Date.now();
  const now = nowIso(nowMs);
  await tx(BOT_ARENA_QUEUE_PATH, (current) => {
    const safe = current && typeof current === 'object' ? current : {};
    return {
      order: normalizeBotQueueOrder(safe.order),
      cycle_no: Math.max(0, Number(safe.cycle_no || 0)),
      cycle_played: normalizeCyclePlayed(safe.cycle_played),
      updated_at: now,
      updated_at_ms: nowMs
    };
  }).catch(() => null);

  const arenaQueue = await getNode(BOT_ARENA_QUEUE_PATH).catch(() => null);
  const order = normalizeBotQueueOrder(arenaQueue && arenaQueue.order);
  await setNode(BOT_USER_QUEUE_PATH, { order, updated_at: now }).catch(() => null);
  return order;
}

async function getDaemonControl() {
  const row = await getNode(BOT_DAEMON_CONTROL_PATH).catch(() => null);
  const now = nowIso();
  const arenaEnabled = parseBooleanLike(row && row.arena_enabled, true);
  const pvpEnabled = parseBooleanLike(row && row.pvp_enabled, arenaEnabled);
  const quizEnabled = parseBooleanLike(row && row.quiz_enabled, arenaEnabled);
  const normalized = {
    arena_enabled: arenaEnabled,
    pvp_enabled: pvpEnabled,
    quiz_enabled: quizEnabled,
    updated_at: String((row && row.updated_at) || now),
    updated_by: String((row && row.updated_by) || 'system')
  };
  const shouldHydrateDefaults = !row
    || typeof row !== 'object'
    || typeof row.arena_enabled !== 'boolean'
    || typeof row.pvp_enabled !== 'boolean'
    || typeof row.quiz_enabled !== 'boolean';
  if (shouldHydrateDefaults) {
    await setNode(BOT_DAEMON_CONTROL_PATH, normalized).catch(() => null);
  }
  return normalized;
}

async function rotateQueue(botIds, countForCycle) {
  const nowMs = Date.now();
  const now = nowIso(nowMs);
  const ids = Array.from(new Set((Array.isArray(botIds) ? botIds : [])
    .map((id) => String(id || '').trim())
    .filter((id) => isSystemBotUserId(id))));

  await tx(BOT_ARENA_QUEUE_PATH, (current) => {
    const safe = current && typeof current === 'object' ? current : {};
    let nextOrder = rotateQueueOrder(safe.order, ids);
    let cyclePlayed = normalizeCyclePlayed(safe.cycle_played);
    if (countForCycle) {
      ids.forEach((id) => {
        cyclePlayed[id] = true;
      });
    }
    let cycleNo = Math.max(0, Number(safe.cycle_no || 0));
    if (countForCycle && isCycleDone(cyclePlayed)) {
      nextOrder = shuffleQueue(nextOrder, nowMs + (cycleNo + 1) * 97 + nextOrder.length * 31);
      cyclePlayed = {};
      cycleNo += 1;
    }
    return {
      order: nextOrder,
      cycle_no: cycleNo,
      cycle_played: cyclePlayed,
      updated_at: now,
      updated_at_ms: nowMs
    };
  }).catch(() => null);

  const arenaQueue = await getNode(BOT_ARENA_QUEUE_PATH).catch(() => null);
  const order = normalizeBotQueueOrder(arenaQueue && arenaQueue.order);
  await setNode(BOT_USER_QUEUE_PATH, { order, updated_at: now }).catch(() => null);
  return order;
}

async function acquireLock(ownerId) {
  const safeOwner = String(ownerId || '').trim();
  if (!safeOwner) return false;
  const nowMs = Date.now();
  const lockUntil = nowMs + BOT_LOCK_TTL_MS;
  const now = nowIso(nowMs);

  const result = await tx(BOT_LOCK_PATH, (current) => {
    const safe = current && typeof current === 'object' ? current : null;
    const currentOwner = String((safe && safe.owner_id) || '').trim();
    const expiresAt = Math.max(0, Number((safe && safe.expires_at_ms) || 0));
    if (safe && expiresAt > nowMs && currentOwner && currentOwner !== safeOwner) return;
    return {
      owner_id: safeOwner,
      updated_at: now,
      expires_at_ms: lockUntil
    };
  }).catch(() => null);

  return !!(result && result.committed);
}

function getBotUserIdFromMatch(row) {
  const safe = row && typeof row === 'object' ? row : {};
  const byField = String(safe.bot_user_id || '').trim();
  if (isSystemBotUserId(byField)) return byField;
  const p1 = String(safe.player1_user_id || '').trim();
  const p2 = String(safe.player2_user_id || '').trim();
  if (isSystemBotUserId(p1)) return p1;
  if (isSystemBotUserId(p2)) return p2;
  return '';
}

function getHumanUserIdFromBotMatch(row, botId = '') {
  const safe = row && typeof row === 'object' ? row : {};
  const safeBotId = String(botId || getBotUserIdFromMatch(safe)).trim();
  if (!safeBotId) return '';
  const p1 = String(safe.player1_user_id || '').trim();
  const p2 = String(safe.player2_user_id || '').trim();
  if (p1 === safeBotId) return p2;
  if (p2 === safeBotId) return p1;
  return '';
}

function isOpenBotUserMatchRow(row) {
  const safe = row && typeof row === 'object' ? row : {};
  if (safe.is_bot_match !== true || safe.is_bot_duel === true) return false;
  const status = String(safe.status || '').trim().toLowerCase();
  if (status !== 'pending_accept' && status !== 'active' && status !== 'round_result') return false;
  return !!getBotUserIdFromMatch(safe);
}

function isStaleOpenBotUserMatchRow(row, nowMs, staleMs = BOT_USER_OPEN_MATCH_STALE_MS) {
  if (!isOpenBotUserMatchRow(row)) return false;
  const safe = row && typeof row === 'object' ? row : {};
  const status = String(safe.status || '').trim().toLowerCase();
  if (status !== 'active' && status !== 'round_result') return false;
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const safeStaleMs = Math.max(60000, Number(staleMs || BOT_USER_OPEN_MATCH_STALE_MS));
  const touchedAtMs = Math.max(
    0,
    Number(safe.round_started_at_ms || 0),
    Number(safe.round_result_until_ms || 0),
    toMillis(safe.updated_at || safe.round_started_at || safe.created_at)
  );
  if (!touchedAtMs) return false;
  return (safeNowMs - touchedAtMs) >= safeStaleMs;
}

async function getBusyBotSet(nowMs) {
  const [busyRows, matchRows] = await Promise.all([
    getNode(BOT_BUSY_PATH).catch(() => null),
    getNode('pvp_matches').catch(() => null)
  ]);
  const busySet = new Set();

  if (matchRows && typeof matchRows === 'object') {
    Object.values(matchRows).forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const status = String(row.status || '').trim().toLowerCase();
      if (status !== 'pending_accept' && status !== 'active' && status !== 'round_result') return;
      const p1 = String(row.player1_user_id || '').trim();
      const p2 = String(row.player2_user_id || '').trim();
      if (isSystemBotUserId(p1)) busySet.add(p1);
      if (isSystemBotUserId(p2)) busySet.add(p2);
    });
  }

  if (busyRows && typeof busyRows === 'object') {
    Object.entries(busyRows).forEach(([botId, row]) => {
      if (!isSystemBotUserId(botId) || !row || typeof row !== 'object') return;
      const untilMs = Math.max(0, Number(row.until_ms || 0));
      if (untilMs > 0 && nowMs > untilMs) return;
      if (row.busy !== false) busySet.add(botId);
    });
  }

  return busySet;
}

async function setBotBusy(botId, matchId, reason, untilMs, source = 'arena') {
  if (!isSystemBotUserId(botId)) return;
  const nowMs = Date.now();
  await setNode(`${BOT_BUSY_PATH}/${botId}`, {
    busy: true,
    reason: String(reason || 'busy'),
    match_id: String(matchId || ''),
    source: String(source || 'arena'),
    updated_at: nowIso(nowMs),
    updated_at_ms: nowMs,
    until_ms: Math.max(0, Number(untilMs || 0)) || null
  }).catch(() => null);
}

async function clearBotBusy(botId, expectedMatchId = '') {
  if (!isSystemBotUserId(botId)) return;
  const safeMatchId = String(expectedMatchId || '').trim();
  await tx(`${BOT_BUSY_PATH}/${botId}`, (current) => {
    if (!current || typeof current !== 'object') return null;
    if (!safeMatchId) return null;
    const currentMatchId = String(current.match_id || '').trim();
    if (currentMatchId && currentMatchId !== safeMatchId) return current;
    return null;
  }).catch(() => null);
}

async function clearBotBusyBySource(botId, sourceHint = BOT_QUIZ_BUSY_SOURCE) {
  if (!isSystemBotUserId(botId)) return;
  const safeSource = String(sourceHint || '').trim();
  await tx(`${BOT_BUSY_PATH}/${botId}`, (current) => {
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

async function cleanupDrawFinishedMatches(maxBatch = 120) {
  const limit = Math.max(1, Number(maxBatch || 120));
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return 0;

  const targets = Object.entries(rows)
    .filter(([id, row]) => !!id && isFinishedDrawMatchRow(row))
    .slice(0, limit);
  if (!targets.length) return 0;

  const now = nowIso();
  let hidden = 0;
  await Promise.all(targets.map(([matchId]) => db.ref(`pvp_matches/${matchId}`).update({
    result_void: true,
    result_void_reason: 'draw_result',
    history_hidden: true,
    history_hidden_reason: 'draw_result',
    draw_hidden_at: now,
    updated_at: now
  }).then(() => {
    hidden += 1;
  }).catch(() => null)));

  return hidden;
}

async function cleanupZeroScoreFinishedMatches(maxBatch = 120) {
  const limit = Math.max(1, Number(maxBatch || 120));
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return 0;

  const targets = Object.entries(rows)
    .filter(([id, row]) => {
      if (!id || !row || typeof row !== 'object') return false;
      const reason = getInvalidFinishedMatchReason(row);
      if (!reason) return false;
      const alreadyMarked = row.result_void === true
        && String(row.result_void_reason || '').trim() === reason
        && row.history_hidden === true
        && String(row.history_hidden_reason || '').trim() === reason;
      return !alreadyMarked;
    })
    .slice(0, limit);
  if (!targets.length) return 0;

  const tasks = [];
  targets.forEach(([matchId, row]) => {
    const reason = getInvalidFinishedMatchReason(row);
    if (!reason) return;
    const p1 = String(row.player1_user_id || '').trim();
    const p2 = String(row.player2_user_id || '').trim();
    if (isSystemBotUserId(p1)) tasks.push(clearBotBusy(p1, matchId));
    if (isSystemBotUserId(p2)) tasks.push(clearBotBusy(p2, matchId));
    tasks.push(db.ref(`pvp_matches/${matchId}`).update({
      result_void: true,
      result_void_reason: reason,
      history_hidden: true,
      history_hidden_reason: reason,
      result_void_updated_at: nowIso(),
      updated_at: nowIso()
    }));
  });
  await Promise.all(tasks.map((task) => Promise.resolve(task).catch(() => null)));
  return targets.length;
}

async function cleanupStaleOpenBotUserMatches(options = {}) {
  const nowMs = Date.now();
  const now = nowIso(nowMs);
  const maxBatch = Math.max(1, Number(options.maxBatch || 80));
  const pendingStaleMs = Math.max(9000, Number(options.pendingStaleMs || BOT_USER_PENDING_STALE_MS));
  const activeStaleMs = Math.max(60000, Number(options.activeStaleMs || BOT_USER_OPEN_MATCH_STALE_MS));
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') {
    return {
      closed: 0,
      timeout: 0,
      abandoned: 0,
      superseded: 0
    };
  }

  const candidates = Object.entries(rows)
    .filter(([id, row]) => !!id && row && typeof row === 'object' && isOpenBotUserMatchRow(row))
    .map(([id, row]) => ({ id: String(id), ...row }))
    .sort((a, b) => (
      toMillis(b.updated_at || b.round_started_at || b.created_at)
      - toMillis(a.updated_at || a.round_started_at || a.created_at)
    ));

  if (!candidates.length) {
    return {
      closed: 0,
      timeout: 0,
      abandoned: 0,
      superseded: 0
    };
  }

  const keepNewestByHuman = new Set();
  const targets = [];

  for (const row of candidates) {
    if (targets.length >= maxBatch) break;
    const matchId = String(row.id || '').trim();
    if (!matchId) continue;

    const botId = getBotUserIdFromMatch(row);
    if (!botId) continue;
    const humanId = getHumanUserIdFromBotMatch(row, botId);
    const groupKey = humanId || botId;
    const status = String(row.status || '').trim().toLowerCase();
    const touchedAtMs = Math.max(
      0,
      Number(row.round_started_at_ms || 0),
      Number(row.round_result_until_ms || 0),
      toMillis(row.updated_at || row.round_started_at || row.created_at)
    );
    const acceptDeadlineMs = Math.max(0, Number(row.accept_deadline_ms || 0));
    const stalePendingByDeadline = status === 'pending_accept' && acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs;
    const stalePendingByAge = status === 'pending_accept' && touchedAtMs > 0 && (nowMs - touchedAtMs) >= pendingStaleMs;
    const staleOpenByAge = (status === 'active' || status === 'round_result')
      && isStaleOpenBotUserMatchRow(row, nowMs, activeStaleMs);
    const staleRoundResultOverdue = status === 'round_result'
      && Number(row.round_result_until_ms || 0) > 0
      && nowMs >= (Number(row.round_result_until_ms || 0) + 30000);
    const superseded = groupKey ? keepNewestByHuman.has(groupKey) : false;

    let reason = '';
    if (superseded) reason = 'match_superseded';
    else if (stalePendingByDeadline || stalePendingByAge) reason = 'accept_timeout';
    else if (staleOpenByAge || staleRoundResultOverdue) reason = 'bot_match_stale_timeout';

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
    return {
      closed: 0,
      timeout: 0,
      abandoned: 0,
      superseded: 0
    };
  }

  let closed = 0;
  let timeout = 0;
  let abandoned = 0;
  let superseded = 0;

  for (const target of targets) {
    const patch = {
      status: 'finished',
      ended_reason: target.reason,
      ended_by_user_id: target.botId || null,
      ended_at: now,
      winner_user_id: null,
      result_void: true,
      result_void_reason: target.reason,
      history_hidden: true,
      history_hidden_reason: target.reason,
      bot_user_queue_rotated: true,
      bot_user_stats_applied: true,
      bot_user_stats_applied_at: now,
      updated_at: now
    };
    await db.ref(`pvp_matches/${target.matchId}`).update(patch).catch(() => null);
    await clearBotBusy(target.botId, target.matchId).catch(() => null);
    if (target.shouldRotate) {
      await rotateQueue([target.botId], false).catch(() => null);
    }
    closed += 1;
    if (target.reason === 'match_superseded') superseded += 1;
    else if (target.reason === 'accept_timeout') timeout += 1;
    else abandoned += 1;
  }

  return {
    closed,
    timeout,
    abandoned,
    superseded
  };
}

function buildStatsRowWithRecalculatedPvp(userId, baseRow, pvpState, nowMs) {
  const base = baseRow && typeof baseRow === 'object' ? baseRow : {};
  const safePvp = pvpState && typeof pvpState === 'object' ? pvpState : {};
  const battles = Math.max(0, Number(safePvp.battles || 0));
  const wins = Math.min(battles, Math.max(0, Number(safePvp.wins || 0)));
  const losses = Math.min(battles, Math.max(0, Number(safePvp.losses || 0)));
  const points = Math.max(0, Number(safePvp.points || 0));
  const processed = normalizeProcessedMatchesMap(safePvp.processed || {});

  return {
    ...base,
    user_id: String(userId || ''),
    total_xp: Math.max(0, Number(base.total_xp || 0)),
    level: Math.max(1, Number(base.level || 1)),
    ranking_points: Math.max(0, Number(base.ranking_points || 0)),
    pvp_points: points,
    coins: Math.max(0, Number(base.coins || 20)),
    pvp_battles: battles,
    pvp_wins: wins,
    pvp_losses: losses,
    pvp_processed_matches: processed,
    pvp_recalculated_at_ms: Math.max(0, Number(nowMs || Date.now())),
    best_streak: Math.max(0, Number(base.best_streak || 0)),
    total_correct: Math.max(0, Number(base.total_correct || 0)),
    total_answered: Math.max(0, Number(base.total_answered || 0)),
    quizzes_completed: Math.max(0, Number(base.quizzes_completed || 0)),
    topic_progress: base.topic_progress && typeof base.topic_progress === 'object' ? base.topic_progress : {},
    quiz_best_scores: base.quiz_best_scores && typeof base.quiz_best_scores === 'object' ? base.quiz_best_scores : {},
    quiz_best_stars: base.quiz_best_stars && typeof base.quiz_best_stars === 'object' ? base.quiz_best_stars : {},
    is_system_bot: base.is_system_bot === true || isSystemBotUserId(userId),
    progress_updated_at_ms: Math.max(
      Math.max(0, Number(base.progress_updated_at_ms || 0)),
      Math.max(0, Number(nowMs || Date.now()))
    ),
    updated_at: nowIso(nowMs)
  };
}

async function recomputeAllPvpStatsFromHistory(maxMatches = 6000) {
  const [statsRows, matchRows] = await Promise.all([
    getNode('user_stats').catch(() => null),
    getNode('pvp_matches').catch(() => null)
  ]);
  const safeStatsRows = statsRows && typeof statsRows === 'object' ? statsRows : {};
  const safeMatchRows = matchRows && typeof matchRows === 'object' ? matchRows : {};
  const nowMs = Date.now();

  const finishedMatches = Object.entries(safeMatchRows)
    .filter(([id, row]) => !!id && row && typeof row === 'object' && String(row.status || '').trim().toLowerCase() === 'finished')
    .map(([id, row]) => ({ id, ...row }))
    .sort((a, b) => (
      toMillis(a.ended_at || a.updated_at || a.created_at)
      - toMillis(b.ended_at || b.updated_at || b.created_at)
    ))
    .slice(0, Math.max(1, Number(maxMatches || 6000)));

  const accByUserId = new Map();
  const ensureAcc = (uid) => {
    const safeUid = String(uid || '').trim();
    if (!safeUid) return null;
    if (!accByUserId.has(safeUid)) {
      accByUserId.set(safeUid, {
        points: 0,
        battles: 0,
        wins: 0,
        losses: 0,
        processed: {}
      });
    }
    return accByUserId.get(safeUid);
  };

  const matchPatchOps = [];
  let invalidCount = 0;
  let validCount = 0;

  finishedMatches.forEach((row) => {
    const matchId = String(row.id || '').trim();
    if (!matchId) return;

    const invalidReason = getInvalidFinishedMatchReason(row);
    if (invalidReason) {
      invalidCount += 1;
      if (row.result_void !== true || String(row.result_void_reason || '') !== invalidReason) {
        matchPatchOps.push(db.ref(`pvp_matches/${matchId}`).update({
          result_void: true,
          result_void_reason: invalidReason,
          result_void_updated_at: nowIso(nowMs),
          updated_at: nowIso(nowMs)
        }));
      }
      return;
    }

    validCount += 1;
    if (row.result_void === true) {
      matchPatchOps.push(db.ref(`pvp_matches/${matchId}`).update({
        result_void: false,
        result_void_reason: null,
        result_void_updated_at: nowIso(nowMs),
        updated_at: nowIso(nowMs)
      }));
    }

    const player1Id = String(row.player1_user_id || '').trim();
    const player2Id = String(row.player2_user_id || '').trim();
    if (!player1Id || !player2Id || player1Id === player2Id) return;

    const endedReason = String(row.ended_reason || '').trim().toLowerCase();
    const winnerId = String(row.winner_user_id || '').trim();
    const endedById = String(row.ended_by_user_id || row.forfeit_by_user_id || '').trim();
    const roundNo = Math.max(1, getFinishedMatchDecisiveRoundNo(row, 5));

    [player1Id, player2Id].forEach((uid) => {
      const state = ensureAcc(uid);
      if (!state) return;
      const result = getPvpResultForUser(row, uid);
      const delta = getPvpPointsDelta(result, roundNo, endedReason, uid, winnerId, endedById);
      state.battles += 1;
      if (result === 'win') state.wins += 1;
      else if (result === 'loss') state.losses += 1;
      state.points = Math.max(0, Number(state.points || 0) + Number(delta || 0));
      state.processed[matchId] = true;
    });
  });

  await Promise.all(matchPatchOps.map((task) => Promise.resolve(task).catch(() => null)));

  const userIds = new Set([
    ...Object.keys(safeStatsRows),
    ...Array.from(accByUserId.keys())
  ]);

  const writeOps = [];
  let updatedUsers = 0;
  userIds.forEach((uid) => {
    const userId = String(uid || '').trim();
    if (!userId) return;
    const base = safeStatsRows[userId] && typeof safeStatsRows[userId] === 'object'
      ? safeStatsRows[userId]
      : {};
    const nextPvp = accByUserId.get(userId) || { points: 0, battles: 0, wins: 0, losses: 0, processed: {} };
    const nextRow = buildStatsRowWithRecalculatedPvp(userId, base, nextPvp, nowMs);

    const prevPoints = Math.max(0, Number(base.pvp_points || 0));
    const prevBattles = Math.max(0, Number(base.pvp_battles || 0));
    const prevWins = Math.max(0, Number(base.pvp_wins || 0));
    const prevLosses = Math.max(0, Number(base.pvp_losses || 0));
    const prevProcessed = normalizeProcessedMatchesMap(base.pvp_processed_matches);
    const nextProcessed = normalizeProcessedMatchesMap(nextRow.pvp_processed_matches);

    const changed = prevPoints !== nextRow.pvp_points
      || prevBattles !== nextRow.pvp_battles
      || prevWins !== nextRow.pvp_wins
      || prevLosses !== nextRow.pvp_losses
      || !trueMapEquals(prevProcessed, nextProcessed)
      || Math.max(0, Number(base.pvp_recalculated_at_ms || 0)) <= 0;
    if (!changed) return;

    updatedUsers += 1;
    writeOps.push(setNode(`user_stats/${userId}`, nextRow));
  });

  await Promise.all(writeOps.map((task) => Promise.resolve(task).catch(() => null)));
  return {
    updated_users: updatedUsers,
    invalid_matches: invalidCount,
    valid_matches: validCount
  };
}

async function updateBotStatsFromResult(botId, result, difficulty, roundNo, endedReason, winnerId, endedById) {
  const uid = String(botId || '').trim();
  if (!isSystemBotUserId(uid)) return;
  const pointsDelta = getPvpPointsDelta(result, roundNo, endedReason, uid, winnerId, endedById);
  const xpGain = getReward(PVP_XP_REWARD, difficulty, result);
  const coinGain = getReward(PVP_COINS_REWARD, difficulty, result);

  await tx(`user_stats/${uid}`, (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const prevTotalXp = Math.max(0, Number(prev.total_xp || 0));
    const nextTotalXp = prevTotalXp + xpGain;
    const xpState = splitProgressTotalXp(nextTotalXp);

    const prevBattles = Math.max(0, Number(prev.pvp_battles || 0));
    const prevWins = Math.max(0, Number(prev.pvp_wins || 0));
    const prevLosses = Math.max(0, Number(prev.pvp_losses || 0));
    const isWin = result === 'win';
    const isLoss = result === 'loss';

    return {
      ...prev,
      user_id: uid,
      total_xp: nextTotalXp,
      level: Math.max(1, Number(xpState.level || 1)),
      pvp_points: Math.max(0, Number(prev.pvp_points || 0) + pointsDelta),
      coins: Math.max(0, Number(prev.coins || 20) + coinGain),
      pvp_battles: prevBattles + 1,
      pvp_wins: prevWins + (isWin ? 1 : 0),
      pvp_losses: prevLosses + (isLoss ? 1 : 0),
      is_system_bot: true,
      updated_at: nowIso()
    };
  }).catch(() => null);
}

function simulateScore(strengthA, strengthB, rounds, seedKey = '') {
  const baseRounds = Math.max(3, Number(rounds || BOT_BASE_ROUNDS));
  const maxRounds = Math.max(baseRounds + 1, BOT_MAX_ROUNDS);
  const safeStrengthA = normalizeBotStrength(strengthA || 'medio');
  const safeStrengthB = normalizeBotStrength(strengthB || 'medio');
  const accA = getBotAccuracyByStrength(safeStrengthA);
  const accB = getBotAccuracyByStrength(safeStrengthB);
  const safeSeedKey = String(seedKey || '').trim() || `${safeStrengthA}_${safeStrengthB}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  let scoreA = 0;
  let scoreB = 0;
  let endedRoundNo = 0;

  for (let i = 1; i <= maxRounds; i += 1) {
    endedRoundNo = i;
    const suddenDeath = i > baseRounds;
    const hitA = suddenDeath
      ? (seededRandom(hashStringToSeed(`${safeSeedKey}:sd:a:${i}`))() < accA)
      : resolveDeterministicBotRun(`${safeSeedKey}:base:a`, accA, baseRounds, i).hit_at_step;
    const hitB = suddenDeath
      ? (seededRandom(hashStringToSeed(`${safeSeedKey}:sd:b:${i}`))() < accB)
      : resolveDeterministicBotRun(`${safeSeedKey}:base:b`, accB, baseRounds, i).hit_at_step;

    if (hitA && !hitB) scoreA += 1;
    else if (hitB && !hitA) scoreB += 1;
    else if (hitA && hitB && suddenDeath) {
      scoreA += 1;
      scoreB += 1;
    }
    if (i >= baseRounds && scoreA !== scoreB) {
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
    const roll = seededRandom(hashStringToSeed(`${safeSeedKey}:tie_break`))();
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

  return { scoreA, scoreB, endedRoundNo: Math.max(baseRounds, endedRoundNo || baseRounds) };
}

// ── Bot Duel Round-by-Round Helpers ───────────────────────────────────────

function collectDuelQuestionPool(difficulty) {
  const safeDiff = normalizeDifficulty(difficulty);
  const pool = [];
  const langs = ALL_QUESTIONS && typeof ALL_QUESTIONS === 'object' ? ALL_QUESTIONS : {};
  Object.values(langs).forEach((topics) => {
    if (!topics || typeof topics !== 'object') return;
    Object.values(topics).forEach((diffs) => {
      if (!diffs || typeof diffs !== 'object') return;
      const list = diffs[safeDiff];
      if (Array.isArray(list)) pool.push(...list);
    });
  });
  return pool;
}

function pickDuelQuestions(difficulty, count) {
  const pool = collectDuelQuestionPool(difficulty);
  const needed = Math.max(1, Number(count || BOT_BASE_ROUNDS));
  if (pool.length === 0) {
    const fallback = [];
    for (let i = 0; i < needed; i += 1) {
      const correctIdx = Math.floor(Math.random() * 4);
      fallback.push({
        q: `Arena Round ${i + 1}`,
        opts: ['A', 'B', 'C', 'D'],
        answer: correctIdx,
        code: '',
        explain: ''
      });
    }
    return fallback;
  }
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(needed, shuffled.length));
  while (picked.length < needed) {
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return picked.map((q) => ({
    q: String(q.q || ''),
    opts: Array.isArray(q.opts) ? q.opts.map((o) => String(o || '')) : ['A', 'B', 'C', 'D'],
    answer: Math.max(0, Number(q.answer || 0)),
    code: String(q.code || ''),
    explain: String(q.explain || '')
  }));
}

function pickBotDuelAnswerIndex(question, botStrength, context = {}) {
  const safeQuestion = question && typeof question === 'object' ? question : {};
  const options = Array.isArray(safeQuestion.opts) ? safeQuestion.opts : [];
  const optionsCount = options.length;
  if (!optionsCount) return -1;
  const correctIndex = Math.max(0, Math.min(optionsCount - 1, Number(safeQuestion.answer || 0)));
  const safeStrength = normalizeBotStrength(botStrength || 'medio');
  const accuracy = getBotAccuracyByStrength(safeStrength);
  const roundNo = Math.max(1, Math.trunc(Number(context.round_no || 1)));
  const totalRounds = Math.max(roundNo, Math.trunc(Number(context.total_rounds || 5)));
  const matchId = String(context.match_id || '').trim();
  const botId = String(context.bot_id || '').trim();
  const seedBase = matchId && botId
    ? `duel:${matchId}:${botId}:${safeStrength}`
    : `duel:${safeStrength}:${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const hit = resolveDeterministicBotRun(seedBase, accuracy, totalRounds, roundNo).hit_at_step;
  if (hit) return correctIndex;
  const wrongIndexes = Array.from({ length: optionsCount }, (_, idx) => idx)
    .filter((idx) => idx !== correctIndex);
  if (!wrongIndexes.length) return correctIndex;
  const wrongIndexRoll = seededRandom(hashStringToSeed(`${seedBase}:wrong:${roundNo}`))();
  return wrongIndexes[Math.floor(wrongIndexRoll * wrongIndexes.length)];
}

function randomBotDuelAnswerDelay() {
  return Math.round(BOT_DUEL_ANSWER_MS_MIN + Math.random() * (BOT_DUEL_ANSWER_MS_MAX - BOT_DUEL_ANSWER_MS_MIN));
}

async function submitBotDuelAnswer(matchId, botId, roundNo, question, botStrength, context = {}) {
  const answerIdx = pickBotDuelAnswerIndex(question, botStrength, {
    match_id: matchId,
    bot_id: botId,
    round_no: roundNo,
    total_rounds: context.total_rounds
  });
  const correctIdx = Math.max(0, Number((question && question.answer) || 0));
  const isCorrect = answerIdx >= 0 && answerIdx === correctIdx;
  const nowMs = Date.now();
  const nowStr = nowIso(nowMs);
  const answerRow = {
    match_id: String(matchId),
    round_no: Math.max(1, Number(roundNo)),
    user_id: String(botId),
    answer_idx: answerIdx,
    is_correct: isCorrect,
    answered_at_ms: nowMs,
    answered_at: nowStr,
    created_at: nowStr
  };
  await setNode(`pvp_answers/${matchId}/${roundNo}/${botId}`, answerRow).catch(() => null);
  return answerRow;
}

function resolveDuelRoundOutcome(question, answerA, answerB, botAId, botBId, suddenDeath) {
  const correctIdx = Math.max(0, Number((question && question.answer) || 0));
  const idxA = Number((answerA && answerA.answer_idx) ?? -1);
  const idxB = Number((answerB && answerB.answer_idx) ?? -1);
  const aCorrect = idxA >= 0 && idxA === correctIdx;
  const bCorrect = idxB >= 0 && idxB === correctIdx;

  if (aCorrect && !bCorrect) return { winner: botAId, deltaA: 1, deltaB: 0 };
  if (bCorrect && !aCorrect) return { winner: botBId, deltaA: 0, deltaB: 1 };
  if (aCorrect && bCorrect && suddenDeath) return { winner: null, deltaA: 1, deltaB: 1 };
  return { winner: null, deltaA: 0, deltaB: 0 };
}

async function tickBotDuelPhase(arenaState, nowMs) {
  const state = arenaState && typeof arenaState === 'object' ? arenaState : {};
  const matchId = String(state.match_id || '').trim();
  const botAId = String(state.bot_a_id || '').trim();
  const botBId = String(state.bot_b_id || '').trim();
  if (!matchId || !isSystemBotUserId(botAId) || !isSystemBotUserId(botBId)) return 'invalid';

  const phase = String(state.phase || 'round_active').trim();
  const currentRound = Math.max(1, Number(state.current_round || 1));

  if (phase === 'round_active') {
    const matchRow = await getNode(`pvp_matches/${matchId}`).catch(() => null);
    if (!matchRow || typeof matchRow !== 'object') return 'match_missing';
    const matchStatus = String(matchRow.status || '').trim().toLowerCase();
    if (matchStatus === 'finished') return 'already_finished';

    const questionSet = Array.isArray(matchRow.question_set) ? matchRow.question_set : [];
    const question = questionSet[currentRound - 1] || null;
    if (!question) return 'no_question';

    const [strengthA, strengthB] = await Promise.all([
      getBotStrength(botAId),
      getBotStrength(botBId)
    ]);

    const botAAnswerAtMs = Math.max(0, Number(state.bot_a_answer_at_ms || 0));
    const botBAnswerAtMs = Math.max(0, Number(state.bot_b_answer_at_ms || 0));
    let botAAnswered = botAAnswerAtMs === 0;
    let botBAnswered = botBAnswerAtMs === 0;
    let answerA = null;
    let answerB = null;

    const questionSetSize = Math.max(
      currentRound,
      Number((Array.isArray(questionSet) ? questionSet.length : 0) || matchRow.total_rounds || BOT_BASE_ROUNDS)
    );

    if (!botAAnswered && nowMs >= botAAnswerAtMs) {
      answerA = await submitBotDuelAnswer(matchId, botAId, currentRound, question, strengthA, {
        total_rounds: questionSetSize
      });
      botAAnswered = true;
    }
    if (!botBAnswered && nowMs >= botBAnswerAtMs) {
      answerB = await submitBotDuelAnswer(matchId, botBId, currentRound, question, strengthB, {
        total_rounds: questionSetSize
      });
      botBAnswered = true;
    }

    // Check round timeout
    const roundDurationMs = (BOT_DUEL_ROUND_SECONDS[normalizeDifficulty(matchRow.difficulty)] || 20) * 1000;
    const roundStartMs = Math.max(0, Number(matchRow.round_started_at_ms || state.started_at_ms || 0));
    const roundTimedOut = roundStartMs > 0 && (nowMs - roundStartMs) >= roundDurationMs;

    if (!botAAnswered && roundTimedOut) {
      answerA = await submitBotDuelAnswer(matchId, botAId, currentRound, question, strengthA, {
        total_rounds: questionSetSize
      });
      botAAnswered = true;
    }
    if (!botBAnswered && roundTimedOut) {
      answerB = await submitBotDuelAnswer(matchId, botBId, currentRound, question, strengthB, {
        total_rounds: questionSetSize
      });
      botBAnswered = true;
    }

    if (!botAAnswered || !botBAnswered) {
      // Update arena state with current answer status
      await setNode(BOT_ARENA_STATE_PATH, {
        ...state,
        bot_a_answer_at_ms: botAAnswered ? 0 : botAAnswerAtMs,
        bot_b_answer_at_ms: botBAnswered ? 0 : botBAnswerAtMs,
        updated_at: nowIso(nowMs)
      }).catch(() => null);
      return 'round_waiting';
    }

    // Both answered: resolve round
    if (!answerA) answerA = await getNode(`pvp_answers/${matchId}/${currentRound}/${botAId}`).catch(() => null);
    if (!answerB) answerB = await getNode(`pvp_answers/${matchId}/${currentRound}/${botBId}`).catch(() => null);

    const suddenDeath = currentRound > BOT_BASE_ROUNDS;
    const outcome = resolveDuelRoundOutcome(question, answerA, answerB, botAId, botBId, suddenDeath);
    const nextScoreA = Math.max(0, Number(state.player1_score || matchRow.player1_score || 0)) + outcome.deltaA;
    const nextScoreB = Math.max(0, Number(state.player2_score || matchRow.player2_score || 0)) + outcome.deltaB;

    const reachedBaseRounds = currentRound >= BOT_BASE_ROUNDS;
    const hasWinner = nextScoreA !== nextScoreB;
    const matchFinished = reachedBaseRounds && hasWinner;
    const exhaustedRounds = currentRound >= BOT_MAX_ROUNDS;

    if (matchFinished || exhaustedRounds) {
      // Finalize the match
      const winnerId = nextScoreA > nextScoreB ? botAId : (nextScoreB > nextScoreA ? botBId : '');
      const finalWinner = winnerId || (Math.random() < 0.5 ? botAId : botBId);
      const difficulty = normalizeDifficulty(state.difficulty || matchRow.difficulty || 'easy');

      await setNode(`pvp_matches/${matchId}`, {
        ...matchRow,
        id: matchId,
        status: 'finished',
        player1_score: nextScoreA,
        player2_score: nextScoreB,
        winner_user_id: finalWinner,
        ended_reason: exhaustedRounds && !hasWinner ? 'max_rounds_reached' : 'bot_duel_complete',
        ended_by_user_id: finalWinner,
        ended_round_no: currentRound,
        total_rounds: currentRound,
        last_round_winner_user_id: outcome.winner || null,
        ended_at: nowIso(nowMs),
        bot_duel_stats_applied: true,
        bot_duel_queue_rotated: true,
        updated_at: nowIso(nowMs)
      }).catch(() => null);

      await Promise.all([
        updateBotStatsFromResult(botAId, finalWinner === botAId ? 'win' : 'loss', difficulty, currentRound, 'bot_duel_complete', finalWinner, finalWinner),
        updateBotStatsFromResult(botBId, finalWinner === botBId ? 'win' : 'loss', difficulty, currentRound, 'bot_duel_complete', finalWinner, finalWinner),
        clearBotBusy(botAId, matchId),
        clearBotBusy(botBId, matchId)
      ]).catch(() => null);

      await rotateQueue([botAId, botBId], true).catch(() => null);

      const loserId = finalWinner === botAId ? botBId : botAId;
      await setNode(BOT_ARENA_STATE_PATH, {
        status: 'idle',
        match_id: '',
        bot_a_id: '',
        bot_b_id: '',
        started_at_ms: 0,
        ends_at_ms: 0,
        difficulty: 'easy',
        phase: '',
        current_round: 0,
        bot_a_answer_at_ms: 0,
        bot_b_answer_at_ms: 0,
        player1_score: 0,
        player2_score: 0,
        updated_at: nowIso(nowMs),
        last_result: { match_id: matchId, winner_id: finalWinner, loser_id: loserId }
      }).catch(() => null);

      return 'finished';
    }

    // Continue: enter round_result phase
    const nextRound = currentRound + 1;
    const questionSet2 = Array.isArray(matchRow.question_set) ? matchRow.question_set : [];
    let extendedSet = questionSet2;
    if (nextRound > questionSet2.length) {
      const extra = pickDuelQuestions(normalizeDifficulty(matchRow.difficulty), 3);
      extendedSet = [...questionSet2, ...extra];
    }

    await setNode(`pvp_matches/${matchId}`, {
      ...matchRow,
      status: 'round_result',
      player1_score: nextScoreA,
      player2_score: nextScoreB,
      question_set: extendedSet,
      total_rounds: extendedSet.length,
      result_round_no: currentRound,
      result_round_winner_user_id: outcome.winner || null,
      last_round_winner_user_id: outcome.winner || null,
      next_round_no: nextRound,
      round_result_until_ms: nowMs + BOT_DUEL_ROUND_RESULT_MS,
      updated_at: nowIso(nowMs)
    }).catch(() => null);

    await setNode(BOT_ARENA_STATE_PATH, {
      ...state,
      phase: 'round_result',
      phase_ends_at_ms: nowMs + BOT_DUEL_ROUND_RESULT_MS,
      current_round: currentRound,
      player1_score: nextScoreA,
      player2_score: nextScoreB,
      bot_a_answer_at_ms: 0,
      bot_b_answer_at_ms: 0,
      updated_at: nowIso(nowMs)
    }).catch(() => null);

    return 'round_result';
  }

  if (phase === 'round_result') {
    const phaseEndsAtMs = Math.max(0, Number(state.phase_ends_at_ms || 0));
    if (phaseEndsAtMs > 0 && nowMs < phaseEndsAtMs) return 'round_result_waiting';

    // Advance to next round
    const nextRound = currentRound + 1;
    const matchRow = await getNode(`pvp_matches/${matchId}`).catch(() => null);
    if (!matchRow || typeof matchRow !== 'object') return 'match_missing';

    await setNode(`pvp_matches/${matchId}`, {
      ...matchRow,
      status: 'active',
      round_no: nextRound,
      round_started_at_ms: nowMs,
      round_started_at: nowIso(nowMs),
      result_round_no: null,
      result_round_winner_user_id: null,
      next_round_no: null,
      round_result_until_ms: null,
      updated_at: nowIso(nowMs)
    }).catch(() => null);

    await setNode(BOT_ARENA_STATE_PATH, {
      ...state,
      phase: 'round_active',
      current_round: nextRound,
      bot_a_answer_at_ms: nowMs + randomBotDuelAnswerDelay(),
      bot_b_answer_at_ms: nowMs + randomBotDuelAnswerDelay(),
      phase_ends_at_ms: 0,
      updated_at: nowIso(nowMs)
    }).catch(() => null);

    return 'round_advanced';
  }

  return 'unknown_phase';
}

// ── End Bot Duel Round-by-Round Helpers ───────────────────────────────────

async function getBotStrength(botId) {
  const cfg = await getNode(`pvp_bots_state/configs/${botId}`).catch(() => null);
  const fallbackStrength = SYSTEM_BOT_ROSTER.find((entry) => entry.id === String(botId || '').trim())?.strength || 'medio';
  return normalizeBotStrength(fallbackStrength || (cfg && cfg.strength) || 'medio');
}

async function hasOpenBotDuel() {
  const rows = await getNode('pvp_matches').catch(() => null);
  if (!rows || typeof rows !== 'object') return false;
  return Object.values(rows).some((row) => {
    if (!row || typeof row !== 'object') return false;
    if (row.is_bot_duel !== true) return false;
    return ['pending_accept', 'active', 'round_result'].includes(String(row.status || '').trim().toLowerCase());
  });
}

async function finalizeArenaMatch(arenaState, reason = 'bot_duel_complete') {
  const state = arenaState && typeof arenaState === 'object' ? arenaState : {};
  const matchId = String(state.match_id || '').trim();
  const botAId = String(state.bot_a_id || '').trim();
  const botBId = String(state.bot_b_id || '').trim();
  if (!matchId || !isSystemBotUserId(botAId) || !isSystemBotUserId(botBId) || botAId === botBId) return null;

  const [matchRow, strengthA, strengthB] = await Promise.all([
    getNode(`pvp_matches/${matchId}`).catch(() => null),
    getBotStrength(botAId),
    getBotStrength(botBId)
  ]);

  const idleArenaState = {
    status: 'idle', match_id: '', bot_a_id: '', bot_b_id: '',
    started_at_ms: 0, ends_at_ms: 0, difficulty: 'easy',
    phase: '', current_round: 0, bot_a_answer_at_ms: 0, bot_b_answer_at_ms: 0,
    phase_ends_at_ms: 0, player1_score: 0, player2_score: 0,
    updated_at: nowIso(), last_result: null
  };

  if (!matchRow || typeof matchRow !== 'object') {
    await Promise.all([
      clearBotBusy(botAId, matchId),
      clearBotBusy(botBId, matchId)
    ]).catch(() => null);
    await setNode(BOT_ARENA_STATE_PATH, idleArenaState).catch(() => null);
    return null;
  }

  if (String(matchRow.status || '').trim().toLowerCase() === 'finished') {
    await Promise.all([
      clearBotBusy(botAId, matchId),
      clearBotBusy(botBId, matchId)
    ]).catch(() => null);
    await setNode(BOT_ARENA_STATE_PATH, idleArenaState).catch(() => null);
    return null;
  }

  // Use actual accumulated scores from match row (round-by-round play)
  const scoreA = Math.max(0, Number(state.player1_score || matchRow.player1_score || 0));
  const scoreB = Math.max(0, Number(state.player2_score || matchRow.player2_score || 0));
  const hasRealScores = scoreA > 0 || scoreB > 0;

  let finalScoreA = scoreA;
  let finalScoreB = scoreB;
  let endedRoundNo = Math.max(1, Number(state.current_round || matchRow.round_no || 1));

  // Only simulate if no real scores were accumulated (e.g., match was just created and immediately stale)
  if (!hasRealScores) {
    const score = simulateScore(strengthA, strengthB, BOT_BASE_ROUNDS, matchId);
    finalScoreA = score.scoreA;
    finalScoreB = score.scoreB;
    endedRoundNo = Math.max(BOT_BASE_ROUNDS, Number(score.endedRoundNo || BOT_BASE_ROUNDS));
  }

  const winnerId = finalScoreA > finalScoreB ? botAId : (finalScoreB > finalScoreA ? botBId : (Math.random() < 0.5 ? botAId : botBId));
  const loserId = winnerId === botAId ? botBId : botAId;
  const difficulty = normalizeDifficulty(state.difficulty || matchRow.difficulty || 'easy');
  const endedReason = String(reason || 'bot_duel_complete');

  await setNode(`pvp_matches/${matchId}`, {
    ...matchRow,
    id: matchId,
    status: 'finished',
    winner_user_id: winnerId,
    ended_reason: endedReason,
    ended_by_user_id: winnerId,
    ended_round_no: endedRoundNo,
    total_rounds: endedRoundNo,
    ended_at: nowIso(),
    player1_score: finalScoreA,
    player2_score: finalScoreB,
    bot_duel_stats_applied: true,
    bot_duel_queue_rotated: true,
    updated_at: nowIso()
  }).catch(() => null);

  await Promise.all([
    updateBotStatsFromResult(botAId, winnerId === botAId ? 'win' : 'loss', difficulty, endedRoundNo, endedReason, winnerId, winnerId),
    updateBotStatsFromResult(botBId, winnerId === botBId ? 'win' : 'loss', difficulty, endedRoundNo, endedReason, winnerId, winnerId),
    clearBotBusy(botAId, matchId),
    clearBotBusy(botBId, matchId)
  ]).catch(() => null);

  await rotateQueue([botAId, botBId], true).catch(() => null);

  await setNode(BOT_ARENA_STATE_PATH, {
    status: 'idle',
    match_id: '',
    bot_a_id: '',
    bot_b_id: '',
    started_at_ms: 0,
    ends_at_ms: 0,
    difficulty: 'easy',
    phase: '',
    current_round: 0,
    bot_a_answer_at_ms: 0,
    bot_b_answer_at_ms: 0,
    phase_ends_at_ms: 0,
    player1_score: 0,
    player2_score: 0,
    updated_at: nowIso(),
    last_result: {
      match_id: matchId,
      winner_id: winnerId,
      loser_id: loserId
    }
  }).catch(() => null);

  return { match_id: matchId, winner_id: winnerId, loser_id: loserId };
}

async function createArenaMatch(botAId, botBId, difficulty, nowMs) {
  const now = nowIso(nowMs);
  const safeDifficulty = normalizeDifficulty(difficulty);
  const [userA, userB, statsA, statsB] = await Promise.all([
    getNode(`users/${botAId}`).catch(() => null),
    getNode(`users/${botBId}`).catch(() => null),
    getNode(`user_stats/${botAId}`).catch(() => null),
    getNode(`user_stats/${botBId}`).catch(() => null)
  ]);
  if (!userA || !userB) return null;

  const matchId = buildMatchId(botAId, botBId);
  const questionSet = pickDuelQuestions(safeDifficulty, BOT_BASE_ROUNDS + 5);
  const busyUntilMs = nowMs + BOT_STALE_MATCH_MAX_MS + 5000;

  const row = {
    id: matchId,
    status: 'active',
    is_bot_match: true,
    is_bot_duel: true,
    bot_user_id: botAId,
    bot_duel_ids: [botAId, botBId],
    difficulty: safeDifficulty,
    category: safeDifficulty,
    language: 'mixed',
    topic: 'mixed',
    total_rounds: questionSet.length,
    round_no: 1,
    question_set: questionSet,
    player1_user_id: botAId,
    player1_nickname: String(userA.nickname || botAId),
    player1_avatar: String(userA.avatar || '🤖'),
    player1_frame: String(userA.equipped_frame || 'frame_default'),
    player1_background: String(userA.equipped_background || 'bg_default'),
    player1_emoji: String(userA.equipped_emoji || 'emoji_profile'),
    player1_level: Math.max(1, Number((statsA && statsA.level) || 1)),
    player1_pvp_points: Math.max(0, Number((statsA && statsA.pvp_points) || 0)),
    player1_pvp_battles: Math.max(0, Number((statsA && statsA.pvp_battles) || 0)),
    player1_accept_state: 'accepted',
    player2_user_id: botBId,
    player2_nickname: String(userB.nickname || botBId),
    player2_avatar: String(userB.avatar || '🤖'),
    player2_frame: String(userB.equipped_frame || 'frame_default'),
    player2_background: String(userB.equipped_background || 'bg_default'),
    player2_emoji: String(userB.equipped_emoji || 'emoji_profile'),
    player2_level: Math.max(1, Number((statsB && statsB.level) || 1)),
    player2_pvp_points: Math.max(0, Number((statsB && statsB.pvp_points) || 0)),
    player2_pvp_battles: Math.max(0, Number((statsB && statsB.pvp_battles) || 0)),
    player2_accept_state: 'accepted',
    accept_deadline_ms: 0,
    start_countdown_ms: 0,
    reject_at_ms: 0,
    player1_score: 0,
    player2_score: 0,
    host_user_id: botAId,
    round_started_at_ms: nowMs,
    round_started_at: now,
    created_at: now,
    updated_at: now
  };

  await setNode(`pvp_matches/${matchId}`, row).catch(() => null);
  await Promise.all([
    setBotBusy(botAId, matchId, 'bot_duel', busyUntilMs),
    setBotBusy(botBId, matchId, 'bot_duel', busyUntilMs)
  ]).catch(() => null);

  await setNode(BOT_ARENA_STATE_PATH, {
    status: 'active',
    match_id: matchId,
    bot_a_id: botAId,
    bot_b_id: botBId,
    started_at_ms: nowMs,
    ends_at_ms: nowMs + BOT_STALE_MATCH_MAX_MS - 10000,
    difficulty: safeDifficulty,
    phase: 'round_active',
    current_round: 1,
    bot_a_answer_at_ms: nowMs + randomBotDuelAnswerDelay(),
    bot_b_answer_at_ms: nowMs + randomBotDuelAnswerDelay(),
    phase_ends_at_ms: 0,
    player1_score: 0,
    player2_score: 0,
    updated_at: now
  }).catch(() => null);

  return { match_id: matchId };
}

async function saveQuizResult(userId, result = {}) {
  const safeUserId = String(userId || '').trim();
  const language = String(result.language || '').trim();
  const topic = String(result.topic || '').trim();
  const difficulty = normalizeDifficulty(result.difficulty || 'easy');
  if (!safeUserId || !language || !topic) return;

  const key = getQuizKey(language, topic, difficulty);
  const path = `quiz_results/${key}/${safeUserId}`;
  const now = nowIso();

  await tx(path, (current) => {
    const prev = current && typeof current === 'object' ? current : {};
    const nextCorrect = Math.max(0, Number(result.correct_count || 0));
    const prevCorrect = Math.max(0, Number(prev.correct_count || 0));
    const nextScorePct = Math.max(0, Number(result.score_pct || 0));
    const prevScorePct = Math.max(0, Number(prev.score_pct || 0));
    const isBetter = nextCorrect > prevCorrect || (nextCorrect === prevCorrect && nextScorePct > prevScorePct);

    if (!isBetter && prev.user_id) {
      return {
        ...prev,
        updated_at: now
      };
    }

    return {
      user_id: safeUserId,
      language,
      topic,
      difficulty,
      score_pct: nextScorePct,
      xp_earned: Math.max(0, Number(result.xp_earned || 0)),
      correct_count: nextCorrect,
      total_questions: Math.max(1, Number(result.total_questions || 1)),
      best_streak: Math.max(0, Number(result.best_streak || 0)),
      created_at: prev.created_at || now,
      updated_at: now
    };
  }).catch(() => null);
}

async function applyBotQuizOutcomeToStats(botId, assignment = {}) {
  const safeBotId = String(botId || '').trim();
  if (!isSystemBotUserId(safeBotId)) return null;

  const language = String(assignment.language || '').trim();
  const topic = String(assignment.topic || '').trim();
  const difficulty = normalizeDifficulty(assignment.difficulty || 'easy');
  if (!language || !topic) return null;

  const totalQuestions = Math.max(1, Math.trunc(Number(assignment.total_questions || BOT_QUIZ_QUESTIONS_PER_ROUND)));
  const correctCount = Math.max(0, Math.min(totalQuestions, Math.trunc(Number(assignment.correct_count || 0))));
  const bestStreak = Math.max(0, Math.min(correctCount, Math.trunc(Number(assignment.best_streak || 0))));
  const quizKey = getQuizKey(language, topic, difficulty);
  const scorePct = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  const nowMs = Date.now();
  const now = nowIso(nowMs);
  let xpEarned = 0;
  let coinsEarned = 0;

  await tx(`user_stats/${safeBotId}`, (current) => {
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
      ...prev,
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
      updated_at: now
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
  const player1Id = String(first.bot_id || '').trim();
  const player2Id = String(second && second.bot_id || '').trim();

  const [user1, user2, stats1, stats2] = await Promise.all([
    getNode(`users/${player1Id}`).catch(() => null),
    player2Id ? getNode(`users/${player2Id}`).catch(() => null) : Promise.resolve(null),
    getNode(`user_stats/${player1Id}`).catch(() => null),
    player2Id ? getNode(`user_stats/${player2Id}`).catch(() => null) : Promise.resolve(null)
  ]);

  const roster1 = SYSTEM_BOT_ROSTER.find((row) => row.id === player1Id) || {};
  const roster2 = SYSTEM_BOT_ROSTER.find((row) => row.id === player2Id) || {};
  const player1Score = Math.max(0, Number(first.correct_count || 0));
  const player2Score = Math.max(0, Number(second && second.correct_count || 0));
  let winnerId = player1Id;
  if (player2Id) {
    if (player1Score > player2Score) winnerId = player1Id;
    else if (player2Score > player1Score) winnerId = player2Id;
    else winnerId = '';
  }

  const startedMs = Math.max(0, Number(startedAtMs || 0)) || Math.max(0, Number(endedAtMs || Date.now()));
  const endedMs = Math.max(startedMs, Math.max(0, Number(endedAtMs || Date.now())));
  const startedIso = nowIso(startedMs);
  const endedIso = nowIso(endedMs);
  const quizDifficulty = normalizeDifficulty(first.difficulty || (second && second.difficulty) || 'easy');
  const totalRounds = Math.max(
    1,
    Number(first.total_questions || BOT_QUIZ_QUESTIONS_PER_ROUND),
    Number((second && second.total_questions) || 0)
  );
  const normalizedBatchId = String(batchId || '').trim() || `bot_quiz_batch_${endedMs}_${Math.floor(Math.random() * 10000)}`;
  const matchId = `bot_quiz_match_${normalizedBatchId}`;

  await setNode(`pvp_matches/${matchId}`, {
    id: matchId,
    status: 'finished',
    is_bot_match: true,
    is_bot_quiz: true,
    bot_quiz_batch_id: normalizedBatchId,
    bot_quiz_difficulty: quizDifficulty,
    bot_quiz_assignments: safeAssignments,
    difficulty: quizDifficulty,
    category: quizDifficulty,
    language: String(first.language || (second && second.language) || '').trim(),
    topic: String(first.topic || (second && second.topic) || '').trim(),
    total_rounds: totalRounds,
    round_no: totalRounds,
    ended_round_no: totalRounds,
    player1_user_id: player1Id,
    player1_nickname: String((user1 && user1.nickname) || roster1.nickname || player1Id || 'Bot 1'),
    player1_avatar: String((user1 && user1.avatar) || roster1.avatar || '🤖'),
    player1_frame: String((user1 && user1.equipped_frame) || 'frame_default'),
    player1_background: String((user1 && user1.equipped_background) || 'bg_default'),
    player1_emoji: String((user1 && user1.equipped_emoji) || 'emoji_profile'),
    player1_level: Math.max(1, Number((stats1 && stats1.level) || 1)),
    player1_pvp_points: Math.max(0, Number((stats1 && stats1.pvp_points) || 0)),
    player1_pvp_battles: Math.max(0, Number((stats1 && stats1.pvp_battles) || 0)),
    player1_bot_strength: normalizeBotStrength(roster1.strength || first.bot_strength || 'medio'),
    player1_score: player1Score,
    player1_accept_state: 'accepted',
    player2_user_id: player2Id || '',
    player2_nickname: player2Id
      ? String((user2 && user2.nickname) || roster2.nickname || player2Id || 'Bot 2')
      : 'Quiz solo',
    player2_avatar: String((user2 && user2.avatar) || roster2.avatar || '🤖'),
    player2_frame: String((user2 && user2.equipped_frame) || 'frame_default'),
    player2_background: String((user2 && user2.equipped_background) || 'bg_default'),
    player2_emoji: String((user2 && user2.equipped_emoji) || 'emoji_profile'),
    player2_level: Math.max(1, Number((stats2 && stats2.level) || 1)),
    player2_pvp_points: Math.max(0, Number((stats2 && stats2.pvp_points) || 0)),
    player2_pvp_battles: Math.max(0, Number((stats2 && stats2.pvp_battles) || 0)),
    player2_bot_strength: player2Id
      ? normalizeBotStrength(roster2.strength || (second && second.bot_strength) || 'medio')
      : '',
    player2_score: player2Score,
    player2_accept_state: player2Id ? 'accepted' : 'pending',
    bot_strength: normalizeBotStrength(roster1.strength || first.bot_strength || 'medio'),
    winner_user_id: winnerId || null,
    ended_reason: winnerId ? 'bot_quiz_complete' : 'bot_quiz_draw',
    ended_by_user_id: winnerId || null,
    ended_at: endedIso,
    round_started_at_ms: startedMs,
    round_started_at: startedIso,
    created_at: startedIso,
    updated_at: endedIso
  }).catch(() => null);

  return { id: matchId };
}

async function runBotQuizAutomation(nowMs = Date.now(), quizEnabled = true) {
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const safeNow = nowIso(safeNowMs);
  const quizStateRaw = await getNode(BOT_ARENA_QUIZ_STATE_PATH).catch(() => null);
  const quizState = normalizeBotArenaQuizState(quizStateRaw);

  if (!quizEnabled) {
    if (quizState.status === 'active') {
      await Promise.all(
        quizState.assignments.map((row) => clearBotBusyBySource(row.bot_id, BOT_QUIZ_BUSY_SOURCE).catch(() => null))
      ).catch(() => null);
    }
    await setNode(BOT_ARENA_QUIZ_STATE_PATH, {
      status: 'idle',
      batch_id: '',
      assignments: [],
      started_at_ms: 0,
      ends_at_ms: 0,
      cursor_difficulty: quizState.cursor_difficulty,
      cursor_index: quizState.cursor_index,
      cursor_cycle_no: quizState.cursor_cycle_no,
      updated_at: safeNow,
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
      await rotateQueue(rotatedIds, false).catch(() => null);
    }

    await setNode(BOT_ARENA_QUIZ_STATE_PATH, {
      status: 'idle',
      batch_id: '',
      assignments: [],
      started_at_ms: 0,
      ends_at_ms: 0,
      cursor_difficulty: quizState.cursor_difficulty,
      cursor_index: quizState.cursor_index,
      cursor_cycle_no: quizState.cursor_cycle_no,
      updated_at: safeNow,
      last_result: {
        status: 'completed',
        at_ms: safeNowMs,
        batch_id: quizState.batch_id || '',
        bots: appliedResults,
        history_match_id: String((quizHistoryMatch && quizHistoryMatch.id) || '')
      }
    }).catch(() => null);

    return {
      ok: true,
      state: 'quiz_finalized',
      bot_ids: rotatedIds
    };
  }

  const queueRow = await getNode(BOT_ARENA_QUEUE_PATH).catch(() => null);
  const queueOrder = normalizeBotQueueOrder(queueRow && queueRow.order);
  const busySet = await getBusyBotSet(safeNowMs).catch(() => new Set());
  const freeBots = queueOrder.filter((botId) => !busySet.has(botId));
  if (freeBots.length < BOT_QUIZ_BATCH_SIZE) {
    return { ok: true, state: 'quiz_idle_no_pair' };
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
  const strengths = await Promise.all(pickedBots.map((botId) => getBotStrength(botId)));
  const batchId = `bot_quiz_batch_${safeNowMs}_${Math.floor(Math.random() * 10000)}`;
  const assignments = pickedBots.map((botId, index) => {
    const quizEntry = selection.entries[index] || selection.entries[selection.entries.length - 1];
    const botStrength = normalizeBotStrength(strengths[index] || 'medio');
    const quizKey = getQuizKey(quizEntry.language, quizEntry.topic, quizEntry.difficulty);
    const sim = simulateBotQuizOutcome(botStrength, quizEntry, {
      seed_key: `quiz_batch:${batchId}:${botId}:${quizKey}`
    });
    return {
      bot_id: botId,
      bot_strength: botStrength,
      language: String(quizEntry.language || '').trim(),
      topic: String(quizEntry.topic || '').trim(),
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
    assignments.map((entry) => setBotBusy(
      entry.bot_id,
      '',
      'bot_quiz',
      safeNowMs + durationMs + 1000,
      BOT_QUIZ_BUSY_SOURCE
    ).catch(() => null))
  ).catch(() => null);

  await setNode(BOT_ARENA_QUIZ_STATE_PATH, {
    status: 'active',
    batch_id: batchId,
    assignments,
    started_at_ms: safeNowMs,
    ends_at_ms: safeNowMs + durationMs,
    cursor_difficulty: selection.cursor.cursor_difficulty,
    cursor_index: selection.cursor.cursor_index,
    cursor_cycle_no: selection.cursor.cursor_cycle_no,
    updated_at: safeNow,
    last_result: quizState.last_result || null
  }).catch(() => null);

  return {
    ok: true,
    state: 'quiz_created',
    bot_ids: assignments.map((row) => row.bot_id)
  };
}

async function tickAutomation(ownerId, options = {}) {
  const lockOk = await acquireLock(ownerId).catch(() => false);
  if (!lockOk) return { ok: false, state: 'lock_not_acquired' };

  await ensureSystemBots().catch(() => null);
  const order = await ensureQueueState().catch(() => normalizeBotQueueOrder([]));
  await cleanupDrawFinishedMatches(160).catch(() => null);
  await cleanupZeroScoreFinishedMatches(160).catch(() => null);
  const shouldRunRecalc = options && options.runFullRecalc === true;
  const recalcResult = shouldRunRecalc
    ? await recomputeAllPvpStatsFromHistory(6000).catch(() => null)
    : null;
  const daemonControl = await getDaemonControl().catch(() => ({
    arena_enabled: false,
    pvp_enabled: false,
    quiz_enabled: false
  }));
  const arenaEnabled = parseBooleanLike(daemonControl?.arena_enabled, false);
  const pvpEnabled = arenaEnabled && parseBooleanLike(daemonControl?.pvp_enabled, arenaEnabled);
  const quizEnabled = arenaEnabled && parseBooleanLike(daemonControl?.quiz_enabled, arenaEnabled);

  const nowMs = Date.now();
  await cleanupStaleOpenBotUserMatches({
    maxBatch: 120,
    pendingStaleMs: BOT_USER_PENDING_STALE_MS,
    activeStaleMs: BOT_USER_OPEN_MATCH_STALE_MS
  }).catch(() => null);

  const withQuizState = async (payload = {}) => {
    const quizResult = await runBotQuizAutomation(nowMs, quizEnabled).catch(() => null);
    if (!quizResult || typeof quizResult !== 'object') return payload;
    return {
      ...payload,
      quiz_state: String(quizResult.state || '').trim(),
      quiz_ok: quizResult.ok === true
    };
  };

  const arenaStateRaw = await getNode(BOT_ARENA_STATE_PATH).catch(() => null);
  const arenaState = arenaStateRaw && typeof arenaStateRaw === 'object' ? arenaStateRaw : { status: 'idle' };
  const arenaStatus = String(arenaState.status || 'idle').trim().toLowerCase();

  if (!pvpEnabled) {
    if (arenaStatus === 'active') {
      await finalizeArenaMatch(arenaState, 'bot_duel_paused_by_admin').catch(() => null);
      return withQuizState({ ok: true, state: 'paused_finalized', recalc: recalcResult || undefined });
    }
    return withQuizState({ ok: true, state: 'paused', recalc: recalcResult || undefined });
  }

  if (arenaStatus === 'active') {
    const startedAt = Math.max(0, Number(arenaState.started_at_ms || 0));
    const stale = startedAt > 0 && (nowMs - startedAt) >= BOT_STALE_MATCH_MAX_MS;

    if (stale) {
      await finalizeArenaMatch(arenaState, 'bot_duel_timeout_recovered').catch(() => null);
      return withQuizState({ ok: true, state: 'finalized_stale', recalc: recalcResult || undefined });
    }

    const phaseResult = await tickBotDuelPhase(arenaState, nowMs).catch(() => 'tick_error');
    if (phaseResult === 'match_missing' || phaseResult === 'invalid') {
      await finalizeArenaMatch(arenaState, 'bot_duel_error_recovery').catch(() => null);
      return withQuizState({ ok: true, state: 'finalized_error', recalc: recalcResult || undefined });
    }

    return withQuizState({ ok: true, state: `active_${phaseResult}`, recalc: recalcResult || undefined });
  }

  const hasOpenDuel = await hasOpenBotDuel().catch(() => false);
  if (hasOpenDuel) {
    return withQuizState({ ok: true, state: 'idle_duel_already_active', recalc: recalcResult || undefined });
  }

  const busySet = await getBusyBotSet(nowMs).catch(() => new Set());
  const freeBots = order.filter((id) => !busySet.has(id));
  if (freeBots.length < 2) {
    return withQuizState({ ok: true, state: 'idle_no_pair', recalc: recalcResult || undefined });
  }

  const botAId = freeBots[0];
  const botBId = freeBots[1];
  const statsMap = await getNode('user_stats').catch(() => null);
  const diffA = resolveDifficultyByPvpPoints(statsMap && statsMap[botAId] ? statsMap[botAId].pvp_points : 0);
  const diffB = resolveDifficultyByPvpPoints(statsMap && statsMap[botBId] ? statsMap[botBId].pvp_points : 0);

  if (normalizeDifficulty(diffA) !== normalizeDifficulty(diffB)) {
    await rotateQueue([botAId], false).catch(() => null);
    return withQuizState({
      ok: true,
      state: 'idle_category_mismatch',
      bot_id: botAId,
      recalc: recalcResult || undefined
    });
  }

  const created = await createArenaMatch(botAId, botBId, normalizeDifficulty(diffA), nowMs).catch(() => null);
  if (!created || !created.match_id) return withQuizState({ ok: false, state: 'create_failed', recalc: recalcResult || undefined });
  return withQuizState({ ok: true, state: 'created', match_id: created.match_id, recalc: recalcResult || undefined });
}

async function updateDaemonStatus(ownerId, payload = {}) {
  const nowMs = Date.now();
  await setNode(BOT_DAEMON_STATUS_PATH, {
    owner_id: String(ownerId || '').trim(),
    updated_at: nowIso(nowMs),
    updated_at_ms: nowMs,
    ...payload
  }).catch(() => null);
}

exports.botArenaDaemon = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '256MiB',
    maxInstances: 1
  },
  async () => {
    const startedAtMs = Date.now();
    const ownerId = `bot_daemon_${startedAtMs}_${Math.floor(Math.random() * 100000)}`;

    await updateDaemonStatus(ownerId, {
      status: 'starting',
      run_started_at: nowIso(startedAtMs),
      run_started_at_ms: startedAtMs
    });

    let ticks = 0;
    let createdMatches = 0;
    let finalizedMatches = 0;
    let lastState = 'starting';

    while ((Date.now() - startedAtMs) < BOT_DAEMON_LOOP_MS) {
      const runFullRecalc = ticks === 0;
      const result = await tickAutomation(ownerId, { runFullRecalc }).catch((error) => {
        logger.error('botArenaDaemon tick error', error);
        return { ok: false, state: 'tick_error' };
      });

      ticks += 1;
      const state = String((result && result.state) || 'unknown');
      lastState = state;
      if (state === 'created') createdMatches += 1;
      if (state.startsWith('finalized')) finalizedMatches += 1;
      const recalc = result && typeof result.recalc === 'object' ? result.recalc : null;

      await updateDaemonStatus(ownerId, {
        status: 'running',
        ticks,
        created_matches: createdMatches,
        finalized_matches: finalizedMatches,
        last_state: lastState,
        lock_ok: !!(result && result.ok),
        recalc_updated_users: Math.max(0, Number(recalc?.updated_users || 0)),
        recalc_invalid_matches: Math.max(0, Number(recalc?.invalid_matches || 0)),
        recalc_valid_matches: Math.max(0, Number(recalc?.valid_matches || 0))
      });

      const remaining = BOT_DAEMON_LOOP_MS - (Date.now() - startedAtMs);
      if (remaining <= BOT_DAEMON_TICK_MS) break;
      await wait(BOT_DAEMON_TICK_MS);
    }

    const finishedAtMs = Date.now();
    await updateDaemonStatus(ownerId, {
      status: 'idle',
      ticks,
      created_matches: createdMatches,
      finalized_matches: finalizedMatches,
      last_state: lastState,
      run_started_at: nowIso(startedAtMs),
      run_started_at_ms: startedAtMs,
      run_finished_at: nowIso(finishedAtMs),
      run_finished_at_ms: finishedAtMs
    });

    logger.info('botArenaDaemon completed', {
      owner_id: ownerId,
      ticks,
      created_matches: createdMatches,
      finalized_matches: finalizedMatches,
      last_state: lastState,
      duration_ms: finishedAtMs - startedAtMs
    });
  }
);
