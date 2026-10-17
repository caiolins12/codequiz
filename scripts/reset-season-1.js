/* eslint-disable no-console */
const { createDbApiClient } = require('./lib/db-api-client');

const DEFAULT_SEASON_ID = 'codequiz_season_1';
const SYSTEM_BOT_ID_RE = /^bot_sys_codequiz_[A-Za-z0-9_]+$/;

function nowIso(ms = Date.now()) {
  return new Date(ms).toISOString();
}

function normalizeObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function normalizeSeasonClaimsMap(value) {
  const safe = normalizeObject(value);
  const next = {};
  Object.entries(safe).forEach(([seasonId, row]) => {
    const safeSeasonId = String(seasonId || '').trim();
    if (!safeSeasonId || !row || typeof row !== 'object') return;
    const claimedAt = String(row.claimed_at || '').trim();
    next[safeSeasonId] = {
      season_id: safeSeasonId,
      claimed_at: claimedAt || null,
      reward_coins: Math.max(0, Math.trunc(Number(row.reward_coins || 0))),
      season_start_at_ms: Math.max(0, Math.trunc(Number(row.season_start_at_ms || 0))),
      season_end_at_ms: Math.max(0, Math.trunc(Number(row.season_end_at_ms || 0)))
    };
  });
  return next;
}

function buildResetStatsRow(uid, row, nowMs, nowIsoValue) {
  const current = normalizeObject(row);
  const isSystemBot = current.is_system_bot === true || SYSTEM_BOT_ID_RE.test(uid);
  const achievementIds = Array.isArray(current.achievement_ids)
    ? current.achievement_ids
    : (Array.isArray(current.achievements) ? current.achievements : []);

  return {
    ...current,
    user_id: uid,
    total_xp: Math.max(0, Math.trunc(Number(current.total_xp || 0))),
    level: Math.max(1, Math.trunc(Number(current.level || 1))),
    ranking_points: 0,
    pvp_points: 0,
    coins: Math.max(0, Math.trunc(Number(current.coins || 20))),
    pvp_battles: 0,
    pvp_wins: 0,
    pvp_losses: 0,
    pvp_processed_matches: {},
    pvp_recalculated_at_ms: nowMs,
    best_streak: 0,
    total_correct: 0,
    total_answered: 0,
    quizzes_completed: 0,
    topic_progress: {},
    quiz_best_scores: {},
    quiz_best_stars: {},
    achievement_ids: achievementIds,
    quiz_rewarded: {},
    is_system_bot: isSystemBot,
    progress_updated_at_ms: Math.max(nowMs, Math.max(0, Number(current.progress_updated_at_ms || 0))),
    updated_at: nowIsoValue
  };
}

function buildResetUserRow(uid, row, seasonId, nowIsoValue) {
  const current = normalizeObject(row);
  const seasonClaims = normalizeSeasonClaimsMap(current.season_claims);
  const hadClaim = Object.prototype.hasOwnProperty.call(seasonClaims, seasonId);
  if (hadClaim) {
    delete seasonClaims[seasonId];
  }
  return {
    changed: hadClaim,
    row: {
      ...current,
      id: current.id || uid,
      auth_id: current.auth_id || uid,
      season_claims: seasonClaims,
      updated_at: nowIsoValue
    }
  };
}

async function main() {
  const applyArg = process.argv.includes('--apply');
  const keepSeasonClaims = process.argv.includes('--keep-season-claims');
  const seasonArg = process.argv.find((arg) => arg.startsWith('--season=')) || '';
  const seasonId = String(seasonArg.split('=')[1] || DEFAULT_SEASON_ID).trim() || DEFAULT_SEASON_ID;
  const db = createDbApiClient();

  const nowMs = Date.now();
  const nowIsoValue = nowIso(nowMs);

  console.log('[season-reset] Fonte: Cloudflare Durable DB');
  console.log(`[season-reset] Temporada alvo: ${seasonId}`);

  const userStatsRaw = await db.get('/user_stats');
  const usersRaw = await db.get('/users');
  const pvpMatchesRaw = await db.get('/pvp_matches');
  const quizResultsRaw = await db.get('/quiz_results');
  const pvpAnswersRaw = await db.get('/pvp_answers');
  const pvpEmojiRaw = await db.get('/pvp_emoji_events');

  const userStatsMap = normalizeObject(userStatsRaw);
  const usersMap = normalizeObject(usersRaw);
  const pvpMatchesMap = normalizeObject(pvpMatchesRaw);
  const quizResultsMap = normalizeObject(quizResultsRaw);
  const pvpAnswersMap = normalizeObject(pvpAnswersRaw);
  const pvpEmojiMap = normalizeObject(pvpEmojiRaw);

  const nextStatsMap = {};
  const allUserIds = Object.keys(userStatsMap);
  let botCount = 0;
  allUserIds.forEach((uid) => {
    const safeUid = String(uid || '').trim();
    if (!safeUid) return;
    if (SYSTEM_BOT_ID_RE.test(safeUid)) botCount += 1;
    nextStatsMap[safeUid] = buildResetStatsRow(safeUid, userStatsMap[safeUid], nowMs, nowIsoValue);
  });

  const usersPatch = {};
  if (!keepSeasonClaims) {
    Object.entries(usersMap).forEach(([uid, row]) => {
      const safeUid = String(uid || '').trim();
      if (!safeUid || !row || typeof row !== 'object') return;
      const result = buildResetUserRow(safeUid, row, seasonId, nowIsoValue);
      if (!result.changed) return;
      usersPatch[safeUid] = result.row;
    });
  }

  const summary = {
    users_in_stats: allUserIds.length,
    bots_in_stats: botCount,
    users_with_claim_reset: Object.keys(usersPatch).length,
    deleted_pvp_matches: Object.keys(pvpMatchesMap).length,
    deleted_quiz_results_branches: Object.keys(quizResultsMap).length,
    deleted_pvp_answers_matches: Object.keys(pvpAnswersMap).length,
    deleted_pvp_emoji_matches: Object.keys(pvpEmojiMap).length
  };

  console.log('[season-reset] Resumo:');
  Object.entries(summary).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });

  if (!applyArg) {
    console.log('[season-reset] Modo dry-run. Nenhuma alteracao aplicada.');
    console.log('[season-reset] Use --apply para confirmar.');
    return;
  }

  console.log('[season-reset] Aplicando reset de user_stats...');
  await db.update('/user_stats', nextStatsMap);

  if (!keepSeasonClaims && Object.keys(usersPatch).length) {
    console.log('[season-reset] Limpando claims da temporada em users...');
    await db.update('/users', usersPatch);
  }

  console.log('[season-reset] Limpando historico global PVE/PVP...');
  await db.update('/', {
    pvp_matches: null,
    quiz_results: null,
    pvp_answers: null,
    pvp_emoji_events: null
  });

  console.log('[season-reset] Concluido com sucesso.');
}

main().catch((error) => {
  console.error('[season-reset] Falha:', error?.message || error);
  process.exitCode = 1;
});
