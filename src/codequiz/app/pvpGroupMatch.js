// Regras dos modos PvP em grupo: Batalha 2x2 (equipes) e Um contra todos (eliminatória).
//
// Todo cliente humano da partida roda este mesmo motor. As funções build* são puras e
// determinísticas: recebem a linha atual da partida e devolvem o patch da próxima
// transição (ou null). As funções async aplicam esses patches com transação condicional
// no banco, então qualquer cliente pode fechar a rodada, responder pelos bots ou avançar a
// partida e a transição acontece uma vez só, mesmo com vários clientes disputando.
import {
  PVP_ELIMINATION_BATTLE_INTRO_MS,
  PVP_ELIMINATION_MAX_TOTAL_BATTLES,
  PVP_ROUND_EXTRA_ANSWER_MS,
  PVP_ROUND_RESULT_DURATION_MS,
  PVP_TEAM_BATTLE_TOTAL_ROUNDS,
  buildPvpEliminationCycleRounds,
  buildPvpEliminationCycleScoreMap,
  createBotSeededRandom,
  getBotDefaultStrengthById,
  getPvpEliminationActiveMemberIds,
  getPvpEliminationActivePair,
  getPvpEliminationMembers,
  getPvpEliminationNextPlayablePair,
  getPvpEliminationPlacementForUser,
  getPvpEliminationResultKeyByPlacement,
  getPvpEliminationRewardScaleByPlacement,
  getPvpEliminationRoundEntry,
  getPvpRewardsByDifficulty,
  getPvpTeamBattleEntry,
  getPvpTeamMembersBySide,
  getPvpTeamOpponentSide,
  getPvpTeamResultForUser,
  getPvpTeamUserSide,
  hashBotSeed,
  pickBotAnswerIndex,
  toMillis
} from './helpers';
import {
  getPvpPointsDeltaAdvanced,
  getRoundDurationSeconds,
  resolvePvpCorrectIndex,
  resolveRoundOutcome
} from '../lib/pvp';
import {
  applyPvpOutcomeToUserStats,
  clearBotBusy,
  deletePvpEliminationRoom,
  deletePvpTeamRoom,
  getPvpEliminationBattleAnswers,
  getPvpEliminationMatch,
  getPvpEliminationMatchesSnapshot,
  getPvpEliminationRoomsSnapshot,
  getPvpTeamBattleAnswers,
  getPvpTeamMatch,
  getPvpTeamMatchesSnapshot,
  getPvpTeamRoomsSnapshot,
  getUserStats,
  PVP_GROUP_ROOM_ABANDONED_MS,
  isPvpGroupMatchStale,
  markPvpEliminationRoomFinished,
  markPvpTeamRoomFinished,
  isPvpGroupRoomAlive,
  isSystemBotUserId,
  removePvpEliminationRoomMembers,
  removePvpTeamRoomMembers,
  rotateUserBotQueue,
  transactPvpEliminationMatch,
  transactPvpTeamMatch,
  upsertPvpEliminationAnswer,
  upsertPvpTeamAnswer
} from '../lib/repository';

export const PVP_GROUP_MODE_TEAM = 'team';
export const PVP_GROUP_MODE_ELIMINATION = 'elimination';

// Bot responde entre 2s e 6s depois que a pergunta abre (sorteio fixo por partida,
// bot e confronto: todos os clientes agendam o mesmo instante e a mesma resposta).
const PVP_GROUP_BOT_ANSWER_MIN_MS = 2000;
const PVP_GROUP_BOT_ANSWER_MAX_MS = 6000;
// Folga depois do fim do tempo antes de fechar a rodada, para respostas enviadas
// no último segundo chegarem ao banco.
export const PVP_GROUP_FINALIZE_GRACE_MS = 1200;
export const PVP_GROUP_PRESENCE_HEARTBEAT_MS = 8000;
// Sala 2x2 com vaga aberta: jogadores (bots) completam a sala depois desta espera,
// contada a partir da última entrada/saída de humano. Sala com senha espera mais,
// para dar tempo do amigo digitar a senha.
export const PVP_TEAM_ROOM_BOT_FILL_DELAY_MS = 15000;
export const PVP_TEAM_ROOM_PRIVATE_BOT_FILL_DELAY_MS = 30000;
export const PVP_TEAM_ROOM_BOT_FILL_JITTER_MIN_MS = 2500;
export const PVP_TEAM_ROOM_BOT_FILL_JITTER_MAX_MS = 9000;
export const PVP_TEAM_ROOM_BOT_FILL_STAGGER_MIN_MS = 1200;
export const PVP_TEAM_ROOM_BOT_FILL_STAGGER_MAX_MS = 3200;
// Quem abandona uma partida em andamento perde como no duelo (W.O.): -2 PvP, sem XP/moedas.
export const PVP_GROUP_FORFEIT_POINTS = -2;

const PVP_GROUP_SWEEP_INTERVAL_MS = 45000;
const PVP_GROUP_FINISHED_ROOM_TTL_MS = 10 * 60 * 1000;
const PVP_GROUP_BOT_REWARD_RETRY_AFTER_MS = 20000;

function safeId(value) {
  return String(value || '').trim();
}

function uniqueIds(list = []) {
  return Array.from(new Set(
    (Array.isArray(list) ? list : [])
      .map((entry) => safeId(entry))
      .filter(Boolean)
  ));
}

function getStatus(row) {
  return safeId(row?.status).toLowerCase();
}

function isoAt(ms) {
  return new Date(Math.max(0, Number(ms || Date.now()))).toISOString();
}

function normalizeMode(mode) {
  return mode === PVP_GROUP_MODE_ELIMINATION ? PVP_GROUP_MODE_ELIMINATION : PVP_GROUP_MODE_TEAM;
}

// ---------------------------------------------------------------------------
// Membros
// ---------------------------------------------------------------------------

export function getPvpGroupMatchMemberIds(match = null, mode = PVP_GROUP_MODE_TEAM) {
  if (normalizeMode(mode) === PVP_GROUP_MODE_ELIMINATION) {
    return uniqueIds(getPvpEliminationMembers(match).map((member) => member.user_id));
  }
  return uniqueIds([
    ...getPvpTeamMembersBySide(match, 'red').map((member) => member.user_id),
    ...getPvpTeamMembersBySide(match, 'blue').map((member) => member.user_id)
  ]);
}

export function getPvpGroupMatchBotIds(match = null, mode = PVP_GROUP_MODE_TEAM) {
  return getPvpGroupMatchMemberIds(match, mode).filter((userId) => isSystemBotUserId(userId));
}

export function getPvpGroupMatchHumanIds(match = null, mode = PVP_GROUP_MODE_TEAM) {
  return getPvpGroupMatchMemberIds(match, mode).filter((userId) => !isSystemBotUserId(userId));
}

// Humanos que saíram da partida (2x2: abandonaram; eliminatória: saíram/assinaram a saída).
export function getPvpGroupMatchGoneIds(match = null, mode = PVP_GROUP_MODE_TEAM) {
  const memberIds = getPvpGroupMatchMemberIds(match, mode);
  const source = normalizeMode(mode) === PVP_GROUP_MODE_ELIMINATION
    ? match?.opt_out_member_ids
    : match?.left_member_ids;
  return uniqueIds(source).filter((userId) => memberIds.includes(userId));
}

// Humanos que ainda acompanham a partida (jogando ou, na eliminatória, assistindo).
export function getPvpGroupMatchPresentHumanIds(match = null, mode = PVP_GROUP_MODE_TEAM) {
  const goneIds = getPvpGroupMatchGoneIds(match, mode);
  return getPvpGroupMatchHumanIds(match, mode).filter((userId) => !goneIds.includes(userId));
}

export function getPvpGroupMatchBusyId(match = null) {
  return safeId(match?.room_id) || safeId(match?.id);
}

// ---------------------------------------------------------------------------
// Tempo do confronto
// ---------------------------------------------------------------------------

export function getPvpGroupBattleTiming(match = null, mode = PVP_GROUP_MODE_TEAM) {
  const startedAtMs = Math.max(
    0,
    Number(match?.battle_started_at_ms || toMillis(match?.battle_started_at) || 0)
  );
  const introMs = normalizeMode(mode) === PVP_GROUP_MODE_ELIMINATION ? PVP_ELIMINATION_BATTLE_INTRO_MS : 0;
  const answerMs = Math.max(
    1000,
    Number(getRoundDurationSeconds(match?.difficulty || match?.category || 'easy') || 20) * 1000
    + PVP_ROUND_EXTRA_ANSWER_MS
  );
  const opensAtMs = startedAtMs + introMs;
  const closesAtMs = opensAtMs + answerMs;
  return {
    startedAtMs,
    introMs,
    answerMs,
    opensAtMs,
    closesAtMs,
    finalizeAtMs: closesAtMs + PVP_GROUP_FINALIZE_GRACE_MS
  };
}

function getPvpGroupQuestionCount(match = null, mode = PVP_GROUP_MODE_TEAM) {
  const questions = Array.isArray(match?.question_set) ? match.question_set.length : 0;
  const fallback = normalizeMode(mode) === PVP_GROUP_MODE_ELIMINATION
    ? PVP_ELIMINATION_MAX_TOTAL_BATTLES
    : Math.max(1, Number(match?.total_rounds || PVP_TEAM_BATTLE_TOTAL_ROUNDS));
  return questions > 0 ? questions : fallback;
}

// Dupla que está respondendo no confronto atual.
export function getPvpGroupBattlePairIds(match = null, mode = PVP_GROUP_MODE_TEAM) {
  if (normalizeMode(mode) === PVP_GROUP_MODE_ELIMINATION) {
    const pair = getPvpEliminationActivePair(match);
    return [safeId(pair?.user1), safeId(pair?.user2)];
  }
  const entry = getPvpTeamBattleEntry(match, Math.max(1, Number(match?.battle_no || 1)));
  return [safeId(entry?.red_user_id), safeId(entry?.blue_user_id)];
}

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------

function isCommittedAnswer(row) {
  const idx = Number(row?.answer_idx ?? -1);
  return Number.isFinite(idx) && idx >= 0;
}

export function indexPvpGroupBattleAnswers(answerRows = [], battleNo = 1) {
  const safeBattleNo = Math.max(1, Number(battleNo || 1));
  const map = new Map();
  (Array.isArray(answerRows) ? answerRows : []).forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const userId = safeId(row.user_id);
    if (!userId) return;
    const rowBattleNo = Number(row.battle_no || safeBattleNo);
    if (rowBattleNo !== safeBattleNo) return;
    const existing = map.get(userId);
    if (!existing || (!isCommittedAnswer(existing) && isCommittedAnswer(row))) {
      map.set(userId, row);
    }
  });
  return map;
}

function mergeAnswerRows(...lists) {
  const merged = new Map();
  lists.forEach((list) => {
    (Array.isArray(list) ? list : []).forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const key = `${Number(row.battle_no || 0)}:${safeId(row.user_id)}`;
      const existing = merged.get(key);
      if (!existing || (!isCommittedAnswer(existing) && isCommittedAnswer(row))) {
        merged.set(key, row);
      }
    });
  });
  return Array.from(merged.values());
}

function buildMissingAnswer(userId, nowMs) {
  return {
    user_id: userId,
    answer_idx: -1,
    is_correct: false,
    answered_at_ms: nowMs
  };
}

// ---------------------------------------------------------------------------
// Respostas dos bots
// ---------------------------------------------------------------------------

export function getPvpGroupBotAnswerPlan(match = null, mode = PVP_GROUP_MODE_TEAM, botId = '', battleNoInput = 0) {
  const safeBotId = safeId(botId);
  const matchId = safeId(match?.id);
  if (!matchId || !isSystemBotUserId(safeBotId)) return null;
  const battleNo = Math.max(1, Number(battleNoInput || match?.battle_no || 1));
  const question = match?.question_set?.[battleNo - 1];
  if (!question || typeof question !== 'object') return null;
  const timing = getPvpGroupBattleTiming(match, mode);
  const totalBattles = getPvpGroupQuestionCount(match, mode);
  const strength = getBotDefaultStrengthById(safeBotId);
  const answerIdx = pickBotAnswerIndex(question, strength, {
    matchId,
    botUserId: safeBotId,
    difficulty: match?.difficulty,
    roundNo: Math.min(battleNo, totalBattles),
    totalRounds: totalBattles
  });
  const roll = createBotSeededRandom(hashBotSeed(`pvp_group:${matchId}:${safeBotId}:${battleNo}:delay`))();
  const maxDelayMs = Math.max(
    PVP_GROUP_BOT_ANSWER_MIN_MS,
    Math.min(PVP_GROUP_BOT_ANSWER_MAX_MS, timing.answerMs - 1500)
  );
  const delayMs = Math.round(PVP_GROUP_BOT_ANSWER_MIN_MS + roll * (maxDelayMs - PVP_GROUP_BOT_ANSWER_MIN_MS));
  const correctIdx = Number(question.answer ?? -1);
  return {
    botId: safeBotId,
    battleNo,
    answerIdx,
    correctIdx,
    isCorrect: answerIdx >= 0 && answerIdx === correctIdx,
    dueAtMs: timing.opensAtMs + delayMs
  };
}

// Bots da dupla atual que ainda não responderam.
export function getPvpGroupPendingBotAnswerPlans(match = null, mode = PVP_GROUP_MODE_TEAM, answerRows = []) {
  if (getStatus(match) !== 'active') return [];
  const battleNo = Math.max(1, Number(match?.battle_no || 1));
  const answered = indexPvpGroupBattleAnswers(answerRows, battleNo);
  return getPvpGroupBattlePairIds(match, mode)
    .filter((userId) => userId && isSystemBotUserId(userId) && !answered.has(userId))
    .map((botId) => getPvpGroupBotAnswerPlan(match, mode, botId, battleNo))
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Batalha 2x2
// ---------------------------------------------------------------------------

export function isPvpTeamBattleReadyToFinalize(match = null, answerRows = [], nowMs = Date.now()) {
  if (getStatus(match) !== 'active') return false;
  const battleNo = Math.max(1, Number(match?.battle_no || 1));
  const [redId, blueId] = getPvpGroupBattlePairIds(match, PVP_GROUP_MODE_TEAM);
  if (!redId || !blueId) return false;
  const goneIds = getPvpGroupMatchGoneIds(match, PVP_GROUP_MODE_TEAM);
  const answered = indexPvpGroupBattleAnswers(answerRows, battleNo);
  const done = [redId, blueId].every((userId) => answered.has(userId) || goneIds.includes(userId));
  if (done) return true;
  return nowMs >= getPvpGroupBattleTiming(match, PVP_GROUP_MODE_TEAM).finalizeAtMs;
}

function resolvePvpTeamWinnerSide(redScore, blueScore) {
  if (redScore > blueScore) return 'red';
  if (blueScore > redScore) return 'blue';
  return 'draw';
}

function buildPvpTeamFinishedPatch(match, nowMs, extra = {}) {
  const redScore = Math.max(0, Number(extra.red_score ?? match?.red_score ?? 0));
  const blueScore = Math.max(0, Number(extra.blue_score ?? match?.blue_score ?? 0));
  return {
    status: 'finished',
    winner_side: resolvePvpTeamWinnerSide(redScore, blueScore),
    ended_reason: 'completed',
    ended_battle_no: Math.max(1, Number(match?.battle_no || 1)),
    next_battle_no: null,
    round_result_until_ms: null,
    ended_at: isoAt(nowMs),
    ended_at_ms: nowMs,
    ...extra
  };
}

export function buildPvpTeamFinalizePatch(match = null, answerRows = [], battleNo = 0, nowMs = Date.now()) {
  if (getStatus(match) !== 'active') return null;
  const safeBattleNo = Math.max(1, Number(battleNo || match?.battle_no || 1));
  if (Math.max(1, Number(match?.battle_no || 1)) !== safeBattleNo) return null;
  if (!isPvpTeamBattleReadyToFinalize(match, answerRows, nowMs)) return null;

  const [redId, blueId] = getPvpGroupBattlePairIds(match, PVP_GROUP_MODE_TEAM);
  const question = match?.question_set?.[safeBattleNo - 1];
  if (!redId || !blueId || !question) {
    return buildPvpTeamFinishedPatch(match, nowMs, { ended_battle_no: safeBattleNo });
  }

  // Quem saiu da partida e não chegou a responder conta como sem resposta.
  const answered = indexPvpGroupBattleAnswers(answerRows, safeBattleNo);
  const redAnswer = answered.get(redId) || buildMissingAnswer(redId, nowMs);
  const blueAnswer = answered.get(blueId) || buildMissingAnswer(blueId, nowMs);
  const correctIdx = resolvePvpCorrectIndex([redAnswer, blueAnswer], Number(question?.answer ?? -1));
  const outcome = resolveRoundOutcome({
    question,
    answerPlayer1: redAnswer,
    answerPlayer2: blueAnswer,
    player1Id: redId,
    player2Id: blueId
  });

  const memberScores = {
    ...(match?.member_scores && typeof match.member_scores === 'object' ? match.member_scores : {})
  };
  memberScores[redId] = Math.max(0, Number(memberScores[redId] || 0) + Number(outcome.player1_delta || 0));
  memberScores[blueId] = Math.max(0, Number(memberScores[blueId] || 0) + Number(outcome.player2_delta || 0));
  const redScore = Math.max(0, Number(match?.red_score || 0) + Number(outcome.player1_delta || 0));
  const blueScore = Math.max(0, Number(match?.blue_score || 0) + Number(outcome.player2_delta || 0));
  const resultFields = {
    red_score: redScore,
    blue_score: blueScore,
    member_scores: memberScores,
    result_battle_no: safeBattleNo,
    result_battle_correct_answer_idx: correctIdx,
    result_battle_winner_user_id: outcome.winner_user_id || null
  };

  const totalBattles = Math.min(
    Math.max(1, Number(match?.total_rounds || PVP_TEAM_BATTLE_TOTAL_ROUNDS)),
    getPvpGroupQuestionCount(match, PVP_GROUP_MODE_TEAM)
  );
  if (safeBattleNo >= totalBattles) {
    return buildPvpTeamFinishedPatch(match, nowMs, {
      ...resultFields,
      ended_battle_no: safeBattleNo
    });
  }

  return {
    ...resultFields,
    status: 'round_result',
    next_battle_no: safeBattleNo + 1,
    round_result_until_ms: nowMs + PVP_ROUND_RESULT_DURATION_MS
  };
}

export function buildPvpTeamAdvancePatch(match = null, nowMs = Date.now()) {
  if (getStatus(match) !== 'round_result') return null;
  const untilMs = Math.max(0, Number(match?.round_result_until_ms || 0));
  if (untilMs > 0 && nowMs < untilMs) return null;
  const nextBattleNo = Math.max(1, Number(match?.next_battle_no || (Number(match?.battle_no || 1) + 1)));
  const totalBattles = Math.min(
    Math.max(1, Number(match?.total_rounds || PVP_TEAM_BATTLE_TOTAL_ROUNDS)),
    getPvpGroupQuestionCount(match, PVP_GROUP_MODE_TEAM)
  );
  if (nextBattleNo > totalBattles) {
    return buildPvpTeamFinishedPatch(match, nowMs);
  }
  return {
    status: 'active',
    battle_no: nextBattleNo,
    battle_started_at_ms: nowMs,
    battle_started_at: isoAt(nowMs),
    result_battle_no: null,
    result_battle_correct_answer_idx: null,
    result_battle_winner_user_id: null,
    next_battle_no: null,
    round_result_until_ms: null
  };
}

// Humano saiu no meio da partida: os confrontos dele passam a contar como sem resposta
// (sem esperar o tempo). Se era o último humano, a partida termina como W.O. do time dele.
export function buildPvpTeamLeavePatch(match = null, userId = '', nowMs = Date.now()) {
  const status = getStatus(match);
  if (status !== 'active' && status !== 'round_result') return null;
  const safeUserId = safeId(userId);
  if (!safeUserId || !getPvpGroupMatchHumanIds(match, PVP_GROUP_MODE_TEAM).includes(safeUserId)) return null;
  const goneIds = getPvpGroupMatchGoneIds(match, PVP_GROUP_MODE_TEAM);
  if (goneIds.includes(safeUserId)) return null;
  const nextGoneIds = uniqueIds([...goneIds, safeUserId]);
  const presentHumans = getPvpGroupMatchHumanIds(match, PVP_GROUP_MODE_TEAM)
    .filter((memberId) => !nextGoneIds.includes(memberId));
  if (presentHumans.length) {
    return { left_member_ids: nextGoneIds };
  }
  const leaverSide = getPvpTeamUserSide(match, safeUserId);
  return {
    ...buildPvpTeamFinishedPatch(match, nowMs),
    left_member_ids: nextGoneIds,
    winner_side: leaverSide ? getPvpTeamOpponentSide(leaverSide) : 'draw',
    ended_reason: 'forfeit',
    ended_by_user_id: safeUserId,
    forfeit_by_user_id: safeUserId
  };
}

export function buildPvpTeamAbandonedPatch(match = null, nowMs = Date.now()) {
  const status = getStatus(match);
  if (status !== 'active' && status !== 'round_result') return null;
  return {
    ...buildPvpTeamFinishedPatch(match, nowMs),
    ended_reason: 'abandoned'
  };
}

// ---------------------------------------------------------------------------
// Um contra todos
// ---------------------------------------------------------------------------

function getEliminationSeededRank(match, userId, salt = '') {
  return hashBotSeed(`pvp_elimination_rank:${safeId(match?.id)}:${salt}:${safeId(userId)}`);
}

// Quem sai no fim do ciclo: menor pontuação no ciclo; empate vai para o placar geral
// e, persistindo, um sorteio fixo da partida (nunca a ordem de entrada na sala).
function pickPvpEliminationEliminatedUserId(match, activeIds, cycleScores, totalScores) {
  const cycleNo = Math.max(1, Number(match?.cycle_no || 1));
  const ranked = [...activeIds].sort((idA, idB) => {
    const cycleDiff = Math.max(0, Number(cycleScores[idA] || 0)) - Math.max(0, Number(cycleScores[idB] || 0));
    if (cycleDiff !== 0) return cycleDiff;
    const totalDiff = Math.max(0, Number(totalScores[idA] || 0)) - Math.max(0, Number(totalScores[idB] || 0));
    if (totalDiff !== 0) return totalDiff;
    return getEliminationSeededRank(match, idA, `cycle${cycleNo}`) - getEliminationSeededRank(match, idB, `cycle${cycleNo}`);
  });
  return safeId(ranked[0]);
}

// Classificação final de quem ainda está vivo quando a partida precisa terminar
// antes do tempo (só restaram bots, partida abandonada ou perguntas esgotadas).
function rankPvpEliminationSurvivors(match, survivorIds) {
  const totalScores = match?.member_scores && typeof match.member_scores === 'object' ? match.member_scores : {};
  const cycleScores = match?.cycle_member_scores && typeof match.cycle_member_scores === 'object' ? match.cycle_member_scores : {};
  return [...survivorIds].sort((idA, idB) => {
    const totalDiff = Math.max(0, Number(totalScores[idB] || 0)) - Math.max(0, Number(totalScores[idA] || 0));
    if (totalDiff !== 0) return totalDiff;
    const cycleDiff = Math.max(0, Number(cycleScores[idB] || 0)) - Math.max(0, Number(cycleScores[idA] || 0));
    if (cycleDiff !== 0) return cycleDiff;
    return getEliminationSeededRank(match, idA, 'final') - getEliminationSeededRank(match, idB, 'final');
  });
}

function buildPvpEliminationStandingsFinishPatch(match, survivorIds, nowMs, extra = {}) {
  const ranked = rankPvpEliminationSurvivors(match, uniqueIds(survivorIds));
  const winnerUserId = safeId(ranked[0]) || null;
  const losersWorstFirst = ranked.slice(1).reverse();
  const previousOrder = uniqueIds(match?.elimination_order).filter((userId) => !ranked.includes(userId));
  const spectators = uniqueIds([...(match?.spectator_member_ids || []), ...ranked.slice(1)]);
  return {
    status: 'finished',
    winner_user_id: winnerUserId,
    active_member_ids: winnerUserId ? [winnerUserId] : [],
    spectator_member_ids: spectators.filter((userId) => userId !== winnerUserId),
    elimination_order: uniqueIds([...previousOrder, ...losersWorstFirst]),
    next_status: null,
    elimination_until_ms: null,
    round_result_until_ms: null,
    ended_reason: 'completed',
    ended_at: isoAt(nowMs),
    ended_at_ms: nowMs,
    ...extra
  };
}

function buildPvpEliminationNextCycle(match, survivorIds) {
  const nextCycleNo = Math.max(1, Number(match?.cycle_no || 1) + 1);
  const survivors = uniqueIds(survivorIds);
  const rounds = buildPvpEliminationCycleRounds(
    survivors,
    `${safeId(match?.id)}:${nextCycleNo}:${Math.max(1, Number(match?.battle_no || 1))}:${survivors.join(',')}`
  );
  const pair = getPvpEliminationNextPlayablePair(rounds, 1, 1);
  return { nextCycleNo, rounds, pair };
}

function getPvpEliminationQuestionCount(match) {
  return getPvpGroupQuestionCount(match, PVP_GROUP_MODE_ELIMINATION);
}

export function isPvpEliminationBattleReadyToFinalize(match = null, answerRows = [], nowMs = Date.now()) {
  if (getStatus(match) !== 'active') return false;
  const [user1, user2] = getPvpGroupBattlePairIds(match, PVP_GROUP_MODE_ELIMINATION);
  if (!user1 || !user2) return false;
  const timing = getPvpGroupBattleTiming(match, PVP_GROUP_MODE_ELIMINATION);
  if (nowMs < timing.opensAtMs) return false;
  const battleNo = Math.max(1, Number(match?.battle_no || 1));
  const answered = indexPvpGroupBattleAnswers(answerRows, battleNo);
  const activeIds = getPvpEliminationActiveMemberIds(match);
  const done = [user1, user2].every((userId) => answered.has(userId) || !activeIds.includes(userId));
  if (done) return true;
  return nowMs >= timing.finalizeAtMs;
}

export function buildPvpEliminationFinalizePatch(match = null, answerRows = [], battleNo = 0, nowMs = Date.now()) {
  if (getStatus(match) !== 'active') return null;
  const safeBattleNo = Math.max(1, Number(battleNo || match?.battle_no || 1));
  if (Math.max(1, Number(match?.battle_no || 1)) !== safeBattleNo) return null;
  if (!isPvpEliminationBattleReadyToFinalize(match, answerRows, nowMs)) return null;

  const activeIds = getPvpEliminationActiveMemberIds(match);
  const [user1, user2] = getPvpGroupBattlePairIds(match, PVP_GROUP_MODE_ELIMINATION);
  const question = match?.question_set?.[safeBattleNo - 1];
  if (!user1 || !user2 || user1 === user2 || !question) {
    return buildPvpEliminationStandingsFinishPatch(match, activeIds, nowMs, { ended_reason: 'invalid_battle' });
  }

  const answered = indexPvpGroupBattleAnswers(answerRows, safeBattleNo);
  const answer1 = answered.get(user1) || buildMissingAnswer(user1, nowMs);
  const answer2 = answered.get(user2) || buildMissingAnswer(user2, nowMs);
  const correctIdx = resolvePvpCorrectIndex([answer1, answer2], Number(question?.answer ?? -1));
  const outcome = resolveRoundOutcome({
    question,
    answerPlayer1: answer1,
    answerPlayer2: answer2,
    player1Id: user1,
    player2Id: user2
  });

  const memberScores = {
    ...(match?.member_scores && typeof match.member_scores === 'object' ? match.member_scores : {})
  };
  const cycleScores = {
    ...(match?.cycle_member_scores && typeof match.cycle_member_scores === 'object'
      ? match.cycle_member_scores
      : buildPvpEliminationCycleScoreMap(activeIds))
  };
  memberScores[user1] = Math.max(0, Number(memberScores[user1] || 0) + Number(outcome.player1_delta || 0));
  memberScores[user2] = Math.max(0, Number(memberScores[user2] || 0) + Number(outcome.player2_delta || 0));
  cycleScores[user1] = Math.max(0, Number(cycleScores[user1] || 0) + Number(outcome.player1_delta || 0));
  cycleScores[user2] = Math.max(0, Number(cycleScores[user2] || 0) + Number(outcome.player2_delta || 0));
  const resultFields = {
    member_scores: memberScores,
    cycle_member_scores: cycleScores,
    result_battle_no: safeBattleNo,
    result_battle_correct_answer_idx: correctIdx,
    result_battle_winner_user_id: outcome.winner_user_id || null
  };
  const questionCount = getPvpEliminationQuestionCount(match);

  // Ainda há confronto neste ciclo?
  const roundInCycle = Math.max(1, Number(match?.round_in_cycle || 1));
  const pairNo = Math.max(1, Number(match?.pair_no || 1));
  const roundEntry = getPvpEliminationRoundEntry(match, roundInCycle);
  const roundPairs = Array.isArray(roundEntry?.pairs) ? roundEntry.pairs : [];
  const nextPair = pairNo < roundPairs.length
    ? getPvpEliminationNextPlayablePair(match?.cycle_rounds, roundInCycle, pairNo + 1)
    : getPvpEliminationNextPlayablePair(match?.cycle_rounds, roundInCycle + 1, 1);
  const nextPairValid = !!nextPair
    && activeIds.includes(safeId(nextPair.player1_user_id))
    && activeIds.includes(safeId(nextPair.player2_user_id));
  if (nextPairValid && safeBattleNo < questionCount) {
    return {
      ...resultFields,
      status: 'round_result',
      next_battle_no: safeBattleNo + 1,
      next_round_in_cycle: Math.max(1, Number(nextPair.round_in_cycle || 1)),
      next_pair_no: Math.max(1, Number(nextPair.pair_no || 1)),
      next_active_pair_user_ids: [safeId(nextPair.player1_user_id), safeId(nextPair.player2_user_id)],
      next_status: null,
      round_result_until_ms: nowMs + PVP_ROUND_RESULT_DURATION_MS,
      elimination_until_ms: null,
      eliminated_user_id: null,
      eliminated_reason: null
    };
  }

  // Fim do ciclo: sai quem pontuou menos no ciclo.
  const eliminatedUserId = pickPvpEliminationEliminatedUserId(match, activeIds, cycleScores, memberScores);
  const survivors = activeIds.filter((userId) => userId !== eliminatedUserId);
  const eliminationFields = {
    ...resultFields,
    status: 'elimination_result',
    active_member_ids: survivors,
    spectator_member_ids: uniqueIds([...(match?.spectator_member_ids || []), eliminatedUserId]),
    elimination_order: uniqueIds([...(match?.elimination_order || []), eliminatedUserId]),
    eliminated_user_id: eliminatedUserId || null,
    eliminated_reason: 'score',
    elimination_until_ms: nowMs + PVP_ROUND_RESULT_DURATION_MS,
    round_result_until_ms: null
  };

  if (survivors.length <= 1) {
    return {
      ...eliminationFields,
      winner_user_id: safeId(survivors[0]) || null,
      cycle_member_scores: buildPvpEliminationCycleScoreMap(survivors),
      next_status: 'finished'
    };
  }

  const nextCycle = buildPvpEliminationNextCycle({ ...match, battle_no: safeBattleNo }, survivors);
  if (!nextCycle.pair || safeBattleNo >= questionCount) {
    const standings = buildPvpEliminationStandingsFinishPatch(
      { ...match, ...eliminationFields },
      survivors,
      nowMs
    );
    return {
      ...eliminationFields,
      winner_user_id: standings.winner_user_id,
      next_status: 'finished',
      next_final_elimination_order: standings.elimination_order
    };
  }

  return {
    ...eliminationFields,
    next_status: 'active',
    next_battle_no: safeBattleNo + 1,
    next_cycle_no: nextCycle.nextCycleNo,
    next_round_in_cycle: Math.max(1, Number(nextCycle.pair.round_in_cycle || 1)),
    next_pair_no: Math.max(1, Number(nextCycle.pair.pair_no || 1)),
    next_cycle_rounds: nextCycle.rounds,
    next_cycle_member_scores: buildPvpEliminationCycleScoreMap(survivors),
    next_active_pair_user_ids: [
      safeId(nextCycle.pair.player1_user_id),
      safeId(nextCycle.pair.player2_user_id)
    ]
  };
}

function buildPvpEliminationActivateBattlePatch(nowMs, fields = {}) {
  return {
    status: 'active',
    battle_started_at_ms: nowMs,
    battle_started_at: isoAt(nowMs),
    result_battle_no: null,
    result_battle_correct_answer_idx: null,
    result_battle_winner_user_id: null,
    next_battle_no: null,
    next_round_in_cycle: null,
    next_pair_no: null,
    next_active_pair_user_ids: null,
    next_status: null,
    next_cycle_no: null,
    next_cycle_rounds: null,
    next_cycle_member_scores: null,
    next_final_elimination_order: null,
    round_result_until_ms: null,
    elimination_until_ms: null,
    eliminated_user_id: null,
    eliminated_reason: null,
    ...fields
  };
}

function finishFromEliminationResult(match, nowMs) {
  const activeIds = getPvpEliminationActiveMemberIds(match);
  const finalOrder = Array.isArray(match?.next_final_elimination_order) && match.next_final_elimination_order.length
    ? uniqueIds(match.next_final_elimination_order)
    : null;
  if (finalOrder || activeIds.length > 1) {
    const winnerUserId = safeId(match?.winner_user_id)
      || safeId(rankPvpEliminationSurvivors(match, activeIds)[0]);
    const standings = finalOrder
      ? {
        winner_user_id: winnerUserId || null,
        active_member_ids: winnerUserId ? [winnerUserId] : [],
        elimination_order: finalOrder,
        spectator_member_ids: uniqueIds([...(match?.spectator_member_ids || []), ...activeIds])
          .filter((userId) => userId !== winnerUserId)
      }
      : buildPvpEliminationStandingsFinishPatch(match, activeIds, nowMs);
    return {
      ...standings,
      status: 'finished',
      next_status: null,
      next_final_elimination_order: null,
      elimination_until_ms: null,
      round_result_until_ms: null,
      ended_reason: safeId(match?.ended_reason) || 'completed',
      ended_at: isoAt(nowMs),
      ended_at_ms: nowMs
    };
  }
  return {
    status: 'finished',
    winner_user_id: safeId(match?.winner_user_id) || safeId(activeIds[0]) || null,
    next_status: null,
    elimination_until_ms: null,
    round_result_until_ms: null,
    ended_reason: safeId(match?.ended_reason) || 'completed',
    ended_at: isoAt(nowMs),
    ended_at_ms: nowMs
  };
}

export function buildPvpEliminationAdvancePatch(match = null, nowMs = Date.now()) {
  const status = getStatus(match);
  const activeIds = getPvpEliminationActiveMemberIds(match);

  if (status === 'round_result') {
    const untilMs = Math.max(0, Number(match?.round_result_until_ms || 0));
    if (untilMs > 0 && nowMs < untilMs) return null;
    const nextPairIds = uniqueIds(match?.next_active_pair_user_ids);
    const nextPairValid = nextPairIds.length === 2 && nextPairIds.every((userId) => activeIds.includes(userId));
    const nextBattleNo = Math.max(1, Number(match?.next_battle_no || (Number(match?.battle_no || 1) + 1)));
    if (!nextPairValid || nextBattleNo > getPvpEliminationQuestionCount(match)) {
      return buildPvpEliminationStandingsFinishPatch(match, activeIds, nowMs, { ended_reason: 'invalid_battle' });
    }
    return buildPvpEliminationActivateBattlePatch(nowMs, {
      battle_no: nextBattleNo,
      round_in_cycle: Math.max(1, Number(match?.next_round_in_cycle || match?.round_in_cycle || 1)),
      pair_no: Math.max(1, Number(match?.next_pair_no || 1)),
      active_pair_user_ids: nextPairIds
    });
  }

  if (status === 'elimination_result') {
    const untilMs = Math.max(0, Number(match?.elimination_until_ms || 0));
    if (untilMs > 0 && nowMs < untilMs) return null;
    const nextStatus = safeId(match?.next_status).toLowerCase();
    if (nextStatus === 'finished' || activeIds.length <= 1) {
      return finishFromEliminationResult(match, nowMs);
    }
    const nextPairIds = uniqueIds(match?.next_active_pair_user_ids);
    const nextPairValid = nextPairIds.length === 2 && nextPairIds.every((userId) => activeIds.includes(userId));
    const nextRounds = Array.isArray(match?.next_cycle_rounds) && match.next_cycle_rounds.length
      ? match.next_cycle_rounds
      : null;
    const nextBattleNo = Math.max(1, Number(match?.next_battle_no || (Number(match?.battle_no || 1) + 1)));
    if (!nextPairValid || !nextRounds || nextBattleNo > getPvpEliminationQuestionCount(match)) {
      return buildPvpEliminationStandingsFinishPatch(match, activeIds, nowMs, { ended_reason: 'invalid_battle' });
    }
    return buildPvpEliminationActivateBattlePatch(nowMs, {
      battle_no: nextBattleNo,
      cycle_no: Math.max(1, Number(match?.next_cycle_no || (Number(match?.cycle_no || 1) + 1))),
      round_in_cycle: Math.max(1, Number(match?.next_round_in_cycle || 1)),
      pair_no: Math.max(1, Number(match?.next_pair_no || 1)),
      cycle_rounds: nextRounds,
      cycle_member_scores: match?.next_cycle_member_scores && typeof match.next_cycle_member_scores === 'object'
        ? match.next_cycle_member_scores
        : buildPvpEliminationCycleScoreMap(activeIds),
      active_pair_user_ids: nextPairIds
    });
  }

  return null;
}

// Saída de um jogador da eliminatória.
// - Espectador (já eliminado) ou partida já decidida: só registra a saída.
// - Jogador vivo: sai como eliminado na hora e um novo ciclo começa com quem sobrou.
// - Se não sobrar nenhum humano acompanhando, a partida termina na hora pela
//   classificação atual (ninguém fica esperando bots jogarem entre si).
export function buildPvpEliminationExitPatch(match = null, userId = '', nowMs = Date.now()) {
  const status = getStatus(match);
  if (status === 'finished') return null;
  const safeUserId = safeId(userId);
  if (!safeUserId || !getPvpGroupMatchMemberIds(match, PVP_GROUP_MODE_ELIMINATION).includes(safeUserId)) return null;
  const activeIds = getPvpEliminationActiveMemberIds(match);
  const previousOptOut = getPvpGroupMatchGoneIds(match, PVP_GROUP_MODE_ELIMINATION);
  const isActive = activeIds.includes(safeUserId);
  if (previousOptOut.includes(safeUserId) && !isActive) return null;
  const optOutIds = uniqueIds([...previousOptOut, safeUserId]);
  const presentHumans = getPvpGroupMatchHumanIds(match, PVP_GROUP_MODE_ELIMINATION)
    .filter((memberId) => !optOutIds.includes(memberId));
  const decided = status === 'elimination_result' && safeId(match?.next_status).toLowerCase() === 'finished';

  if (!isActive || decided) {
    if (presentHumans.length) return { opt_out_member_ids: optOutIds };
    const finish = decided
      ? finishFromEliminationResult(match, nowMs)
      : buildPvpEliminationStandingsFinishPatch(match, activeIds, nowMs, { ended_reason: 'humans_left' });
    return { ...finish, opt_out_member_ids: optOutIds };
  }

  const survivors = activeIds.filter((memberId) => memberId !== safeUserId);
  const exitFields = {
    opt_out_member_ids: optOutIds,
    active_member_ids: survivors,
    spectator_member_ids: uniqueIds([...(match?.spectator_member_ids || []), safeUserId]),
    elimination_order: uniqueIds([...(match?.elimination_order || []), safeUserId]),
    eliminated_user_id: safeUserId,
    eliminated_reason: 'exit'
  };
  const exitedMatch = { ...match, ...exitFields };

  if (survivors.length <= 1) {
    return {
      ...exitFields,
      ...buildPvpEliminationStandingsFinishPatch(exitedMatch, survivors, nowMs, {
        ended_reason: 'player_exit',
        ended_by_user_id: safeUserId
      }),
      opt_out_member_ids: optOutIds
    };
  }
  if (!presentHumans.length) {
    return {
      ...exitFields,
      ...buildPvpEliminationStandingsFinishPatch(exitedMatch, survivors, nowMs, {
        ended_reason: 'humans_left',
        ended_by_user_id: safeUserId
      }),
      opt_out_member_ids: optOutIds
    };
  }

  const currentBattleNo = Math.max(1, Number(match?.battle_no || 1));
  const nextBattleNo = currentBattleNo + 1;
  const nextCycle = buildPvpEliminationNextCycle(exitedMatch, survivors);
  if (!nextCycle.pair || nextBattleNo > getPvpEliminationQuestionCount(match)) {
    return {
      ...exitFields,
      ...buildPvpEliminationStandingsFinishPatch(exitedMatch, survivors, nowMs, {
        ended_reason: 'player_exit',
        ended_by_user_id: safeUserId
      }),
      opt_out_member_ids: optOutIds
    };
  }

  return {
    ...exitFields,
    status: 'elimination_result',
    cycle_member_scores: buildPvpEliminationCycleScoreMap(survivors),
    result_battle_no: currentBattleNo,
    result_battle_correct_answer_idx: null,
    result_battle_winner_user_id: null,
    winner_user_id: null,
    next_status: 'active',
    next_battle_no: nextBattleNo,
    next_cycle_no: nextCycle.nextCycleNo,
    next_round_in_cycle: Math.max(1, Number(nextCycle.pair.round_in_cycle || 1)),
    next_pair_no: Math.max(1, Number(nextCycle.pair.pair_no || 1)),
    next_cycle_rounds: nextCycle.rounds,
    next_cycle_member_scores: buildPvpEliminationCycleScoreMap(survivors),
    next_active_pair_user_ids: [
      safeId(nextCycle.pair.player1_user_id),
      safeId(nextCycle.pair.player2_user_id)
    ],
    next_final_elimination_order: null,
    elimination_until_ms: nowMs + PVP_ROUND_RESULT_DURATION_MS,
    round_result_until_ms: null
  };
}

export function buildPvpEliminationAbandonedPatch(match = null, nowMs = Date.now()) {
  const status = getStatus(match);
  if (status === 'finished') return null;
  return buildPvpEliminationStandingsFinishPatch(match, getPvpEliminationActiveMemberIds(match), nowMs, {
    ended_reason: 'abandoned'
  });
}

// ---------------------------------------------------------------------------
// Resultado e recompensas (iguais para humanos e bots)
// ---------------------------------------------------------------------------

export function getPvpGroupMatchDecisiveBattleNo(match = null) {
  return Math.max(
    1,
    Number(match?.ended_battle_no || match?.result_battle_no || match?.battle_no || 1)
  );
}

export function getPvpGroupMatchOutcomeForUser(match = null, mode = PVP_GROUP_MODE_TEAM, userId = '', options = {}) {
  const safeMode = normalizeMode(mode);
  const safeUserId = safeId(userId);
  const forcedPlacement = Math.max(0, Number(options?.forcePlacement || 0));
  let resultKey = 'loss';
  let placement = 0;
  let rewardScale = 1;
  if (safeMode === PVP_GROUP_MODE_ELIMINATION) {
    placement = forcedPlacement || getPvpEliminationPlacementForUser(match, safeUserId);
    resultKey = getPvpEliminationResultKeyByPlacement(placement);
    rewardScale = getPvpEliminationRewardScaleByPlacement(placement);
  } else {
    resultKey = getPvpTeamResultForUser(match, safeUserId);
  }
  const battleCountBefore = Math.max(0, Number(options?.battleCountBefore || 0));
  const points = getPvpPointsDeltaAdvanced(resultKey, {
    battleNo: battleCountBefore + 1,
    roundNo: getPvpGroupMatchDecisiveBattleNo(match),
    matchRow: match,
    userId: safeUserId
  });
  const baseRewards = getPvpRewardsByDifficulty(match?.difficulty || match?.category || 'easy', resultKey);
  return {
    resultKey,
    placement,
    points,
    xp: Math.max(0, Math.round(Number(baseRewards.xp || 0) * rewardScale)),
    coins: Math.max(0, Math.round(Number(baseRewards.coins || 0) * rewardScale))
  };
}

export function getPvpGroupForfeitOutcome() {
  return {
    resultKey: 'loss',
    placement: 0,
    points: PVP_GROUP_FORFEIT_POINTS,
    xp: 0,
    coins: 0
  };
}

// ---------------------------------------------------------------------------
// Operações no banco
// ---------------------------------------------------------------------------

function getMatchFns(mode) {
  if (normalizeMode(mode) === PVP_GROUP_MODE_ELIMINATION) {
    return {
      getMatch: getPvpEliminationMatch,
      getAnswers: getPvpEliminationBattleAnswers,
      upsertAnswer: upsertPvpEliminationAnswer,
      transact: transactPvpEliminationMatch,
      buildFinalize: buildPvpEliminationFinalizePatch,
      buildAdvance: buildPvpEliminationAdvancePatch,
      buildLeave: buildPvpEliminationExitPatch,
      buildAbandoned: buildPvpEliminationAbandonedPatch,
      removeRoomMembers: removePvpEliminationRoomMembers,
      deleteRoom: deletePvpEliminationRoom,
      markRoomFinished: markPvpEliminationRoomFinished
    };
  }
  return {
    getMatch: getPvpTeamMatch,
    getAnswers: getPvpTeamBattleAnswers,
    upsertAnswer: upsertPvpTeamAnswer,
    transact: transactPvpTeamMatch,
    buildFinalize: buildPvpTeamFinalizePatch,
    buildAdvance: buildPvpTeamAdvancePatch,
    buildLeave: buildPvpTeamLeavePatch,
    buildAbandoned: buildPvpTeamAbandonedPatch,
    removeRoomMembers: removePvpTeamRoomMembers,
    deleteRoom: deletePvpTeamRoom,
    markRoomFinished: markPvpTeamRoomFinished
  };
}

// Fecha o confronto atual (quando a dupla respondeu ou o tempo acabou).
export async function finalizePvpGroupBattle(mode, matchInput, liveAnswers = []) {
  const fns = getMatchFns(mode);
  const matchId = safeId(matchInput?.id);
  if (!matchId || getStatus(matchInput) !== 'active') return { committed: false, row: null };
  const battleNo = Math.max(1, Number(matchInput?.battle_no || 1));
  const remoteAnswers = await fns.getAnswers(matchId, battleNo).catch(() => []);
  const answers = mergeAnswerRows(
    (Array.isArray(liveAnswers) ? liveAnswers : []).filter((row) => Number(row?.battle_no || battleNo) === battleNo),
    (Array.isArray(remoteAnswers) ? remoteAnswers : []).map((row) => ({ ...row, battle_no: Number(row?.battle_no || battleNo) }))
  );
  const nowMs = Date.now();
  return fns.transact(matchId, (current) => fns.buildFinalize(current, answers, battleNo, nowMs));
}

// Sai da tela de resultado do confronto/ciclo para o próximo passo.
export async function advancePvpGroupMatch(mode, matchInput) {
  const fns = getMatchFns(mode);
  const matchId = safeId(matchInput?.id);
  if (!matchId) return { committed: false, row: null };
  const nowMs = Date.now();
  return fns.transact(matchId, (current) => fns.buildAdvance(current, nowMs));
}

export async function submitPvpGroupBotAnswer(mode, matchInput, plan) {
  const fns = getMatchFns(mode);
  const matchId = safeId(matchInput?.id);
  const botId = safeId(plan?.botId);
  const battleNo = Math.max(1, Number(plan?.battleNo || 0));
  if (!matchId || !botId || !battleNo) return null;
  const nowMs = Date.now();
  return fns.upsertAnswer({
    match_id: matchId,
    battle_no: battleNo,
    user_id: botId,
    answer_idx: Number(plan.answerIdx ?? -1),
    is_correct: plan.isCorrect === true,
    correct_answer_idx: Number(plan.correctIdx ?? -1),
    answered_at_ms: nowMs,
    answered_at: isoAt(nowMs),
    created_at: isoAt(nowMs)
  });
}

export async function leavePvpGroupMatch(mode, matchId, userId) {
  const fns = getMatchFns(mode);
  const safeMatchId = safeId(matchId);
  const safeUserId = safeId(userId);
  if (!safeMatchId || !safeUserId) return { committed: false, row: null };
  const nowMs = Date.now();
  return fns.transact(safeMatchId, (current) => fns.buildLeave(current, safeUserId, nowMs));
}

export async function releasePvpGroupBots(botIds = [], busyId = '', reason = 'group_room_released') {
  const ids = uniqueIds(botIds).filter((botId) => isSystemBotUserId(botId));
  const safeBusyId = safeId(busyId);
  for (const botId of ids) {
    await clearBotBusy(botId, safeBusyId).catch(() => null);
    await rotateUserBotQueue(botId, reason).catch(() => null);
  }
  return ids;
}

// Tira membros da sala e devolve à fila de bots os que ficaram sem sala.
export async function removePvpGroupRoomMembers(mode, roomId, userIds = [], options = {}) {
  const fns = getMatchFns(mode);
  const safeRoomId = safeId(roomId);
  if (!safeRoomId) return { room: null, deleted: false, botIds: [], removedIds: [] };
  const result = await fns.removeRoomMembers(safeRoomId, userIds, options).catch(() => null);
  const safeResult = result && typeof result === 'object'
    ? result
    : { room: null, deleted: false, botIds: [], removedIds: [] };
  if (safeResult.botIds?.length && options?.releaseBots !== false) {
    await releasePvpGroupBots(safeResult.botIds, safeRoomId, options?.reason || 'group_room_left');
  }
  return safeResult;
}

// Aplica nos bots o mesmo resultado que um humano receberia (pontos, XP, moedas e
// batalhas), uma única vez por partida, e libera os bots para outras partidas.
export async function applyPvpGroupMatchBotRewards(mode, matchInput) {
  const fns = getMatchFns(mode);
  const matchId = safeId(matchInput?.id);
  if (!matchId || getStatus(matchInput) !== 'finished') return false;
  if (safeId(matchInput?.room_id)) {
    await fns.markRoomFinished(safeId(matchInput.room_id), matchId).catch(() => null);
  }
  const botIds = getPvpGroupMatchBotIds(matchInput, mode);
  if (!botIds.length) return true;
  if (Math.max(0, Number(matchInput?.bot_rewards_applied_at_ms || 0)) > 0) return true;

  let appliedAny = false;
  for (const botId of botIds) {
    // Cada bot é reivindicado antes de receber o resultado: no máximo uma aplicação,
    // mesmo com vários clientes (ou a limpeza automática) tentando ao mesmo tempo.
    const claim = await fns.transact(matchId, (current) => {
      if (getStatus(current) !== 'finished') return null;
      const appliedIds = uniqueIds(current?.bot_rewards_applied_ids);
      if (appliedIds.includes(botId)) return null;
      const nextAppliedIds = uniqueIds([...appliedIds, botId]);
      const allApplied = getPvpGroupMatchBotIds(current, mode).every((id) => nextAppliedIds.includes(id));
      return {
        bot_rewards_applied_ids: nextAppliedIds,
        ...(allApplied ? { bot_rewards_applied_at_ms: Date.now() } : {})
      };
    }).catch(() => null);
    if (!claim?.committed || !claim.row) continue;
    appliedAny = true;
    const stats = await getUserStats(botId).catch(() => null);
    const outcome = getPvpGroupMatchOutcomeForUser(claim.row, mode, botId, {
      battleCountBefore: Math.max(0, Number(stats?.pvp_battles || 0))
    });
    await applyPvpOutcomeToUserStats(botId, {
      result: outcome.resultKey,
      pointsDelta: outcome.points,
      xp: outcome.xp,
      coinsDelta: outcome.coins,
      battlesDelta: 1
    }).catch(() => null);
    await releasePvpGroupBots([botId], getPvpGroupMatchBusyId(claim.row), 'group_match_finished');
  }
  return appliedAny;
}

// Limpeza de estado abandonado (todos fecharam a aba): termina partidas paradas pela
// classificação atual, aplica o resultado dos bots que ficou pendente e apaga salas
// de lobby sem nenhum humano conectado. Roda no máximo a cada 45s por aparelho.
let lastPvpGroupSweepAtMs = 0;
let pvpGroupSweepInFlight = null;

export async function sweepStalePvpGroupState(options = {}) {
  const nowMs = Date.now();
  if (pvpGroupSweepInFlight) return pvpGroupSweepInFlight;
  if (options?.force !== true && (nowMs - lastPvpGroupSweepAtMs) < PVP_GROUP_SWEEP_INTERVAL_MS) return null;
  lastPvpGroupSweepAtMs = nowMs;

  const sweepMode = async (mode, matches, rooms) => {
    const fns = getMatchFns(mode);
    const matchById = new Map();
    for (const match of matches) {
      const matchId = safeId(match?.id);
      if (!matchId) continue;
      let latest = match;
      if (isPvpGroupMatchStale(match, nowMs)) {
        const result = await fns.transact(matchId, (current) => (
          isPvpGroupMatchStale(current, Date.now()) ? fns.buildAbandoned(current, Date.now()) : null
        )).catch(() => null);
        if (result?.row) latest = result.row;
      }
      matchById.set(matchId, latest);
      if (getStatus(latest) === 'finished' && !Number(latest?.bot_rewards_applied_at_ms || 0)) {
        const endedAtMs = Math.max(Number(latest?.ended_at_ms || 0), toMillis(latest?.ended_at || latest?.updated_at));
        if (getPvpGroupMatchBotIds(latest, mode).length && (!endedAtMs || (nowMs - endedAtMs) >= PVP_GROUP_BOT_REWARD_RETRY_AFTER_MS)) {
          await applyPvpGroupMatchBotRewards(mode, latest).catch(() => null);
        }
      }
    }

    for (const room of rooms) {
      const roomId = safeId(room?.id);
      if (!roomId) continue;
      const status = getStatus(room);
      const memberIds = getPvpGroupMatchMemberIds(room, mode);
      const botIds = memberIds.filter((userId) => isSystemBotUserId(userId));
      let shouldDelete = false;
      if (status === 'lobby' || status === 'pending_accept') {
        shouldDelete = !isPvpGroupRoomAlive(room, nowMs, PVP_GROUP_ROOM_ABANDONED_MS);
      } else if (status === 'active') {
        const match = matchById.get(safeId(room?.match_id)) || null;
        shouldDelete = !match || getStatus(match) === 'finished'
          ? (nowMs - toMillis(room?.updated_at || room?.created_at)) >= PVP_GROUP_FINISHED_ROOM_TTL_MS
          : false;
      } else {
        shouldDelete = (nowMs - toMillis(room?.updated_at || room?.created_at)) >= PVP_GROUP_FINISHED_ROOM_TTL_MS;
      }
      if (!shouldDelete) continue;
      await fns.deleteRoom(roomId).catch(() => null);
      if (botIds.length && (status === 'lobby' || status === 'pending_accept')) {
        await releasePvpGroupBots(botIds, roomId, 'group_room_abandoned');
      }
    }
  };

  pvpGroupSweepInFlight = (async () => {
    try {
      const [teamMatches, teamRooms, eliminationMatches, eliminationRooms] = await Promise.all([
        getPvpTeamMatchesSnapshot().catch(() => []),
        getPvpTeamRoomsSnapshot().catch(() => []),
        getPvpEliminationMatchesSnapshot().catch(() => []),
        getPvpEliminationRoomsSnapshot().catch(() => [])
      ]);
      await sweepMode(PVP_GROUP_MODE_TEAM, teamMatches, teamRooms);
      await sweepMode(PVP_GROUP_MODE_ELIMINATION, eliminationMatches, eliminationRooms);
      return true;
    } catch (error) {
      console.error('pvp group sweep failed:', error);
      return false;
    } finally {
      pvpGroupSweepInFlight = null;
    }
  })();
  return pvpGroupSweepInFlight;
}

// Sorteia quando o próximo bot entra numa sala 2x2 com vaga aberta.
export function getPvpTeamRoomBotFillDelayMs(room = null, afterBotJoin = false) {
  const random = Math.random();
  if (afterBotJoin) {
    return Math.round(
      PVP_TEAM_ROOM_BOT_FILL_STAGGER_MIN_MS
      + random * (PVP_TEAM_ROOM_BOT_FILL_STAGGER_MAX_MS - PVP_TEAM_ROOM_BOT_FILL_STAGGER_MIN_MS)
    );
  }
  const base = room?.has_password ? PVP_TEAM_ROOM_PRIVATE_BOT_FILL_DELAY_MS : PVP_TEAM_ROOM_BOT_FILL_DELAY_MS;
  return Math.round(
    base
    + PVP_TEAM_ROOM_BOT_FILL_JITTER_MIN_MS
    + random * (PVP_TEAM_ROOM_BOT_FILL_JITTER_MAX_MS - PVP_TEAM_ROOM_BOT_FILL_JITTER_MIN_MS)
  );
}
