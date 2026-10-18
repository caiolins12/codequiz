const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');
const NOW = 100_000;
const QUESTION = { q: 'Qual alternativa está correta?', opts: ['Correta', 'Errada'], answer: 0 };

function teamMatch(overrides = {}) {
  const members = {
    red_members: [{ user_id: 'red-1' }, { user_id: 'red-2' }],
    blue_members: [{ user_id: 'blue-1' }, { user_id: 'blue-2' }]
  };
  return {
    id: 'team-regression',
    status: 'active',
    difficulty: 'easy',
    ...members,
    battle_schedule: helpers.buildPvpTeamBattleSchedule(members),
    question_set: Array.from({ length: 12 }, (_, index) => ({ ...QUESTION, q: `Questão ${index + 1}` })),
    total_rounds: 12,
    battle_no: 12,
    battle_started_at_ms: 1000,
    red_score: 6,
    blue_score: 6,
    member_scores: { 'red-1': 3, 'red-2': 3, 'blue-1': 3, 'blue-2': 3 },
    ...overrides
  };
}

function answersFor(match, mode, firstAnswer = 0, secondAnswer = 0) {
  return engine.getPvpGroupBattlePairIds(match, mode).map((userId, index) => ({
    user_id: userId,
    battle_no: match.battle_no,
    answer_idx: index === 0 ? firstAnswer : secondAnswer,
    correct_answer_idx: 0,
    is_correct: (index === 0 ? firstAnswer : secondAnswer) === 0,
    answered_at_ms: 10_000 + index * 100
  }));
}

function advanceTeam(match) {
  const result = engine.buildPvpTeamAdvancePatch(match, Number(match.round_result_until_ms) + 1);
  assert.equal(result?.status, 'active');
  return { ...match, ...result };
}

test('2x2: a tie after all 12 scheduled battles opens overtime', () => {
  const match = teamMatch();
  const original = structuredClone(match);
  const patch = engine.buildPvpTeamFinalizePatch(match, answersFor(match, 'team'), 12, NOW);
  assert.equal(patch?.status, 'round_result');
  assert.equal(patch.next_battle_no, 13);
  assert.equal(patch.red_score, 7);
  assert.equal(patch.blue_score, 7);
  assert.ok(!patch.winner_side || patch.winner_side !== 'draw');
  const next = advanceTeam({ ...match, ...patch });
  assert.equal(next.battle_no, 13);
  assert.deepEqual(match, original, 'pure transition must not mutate the current row');
});

test('2x2: overtime continues for both-correct and both-wrong answers, then ends with a winner', () => {
  let match = teamMatch({ battle_no: 13 });
  for (let index = 0; index < 15; index += 1) {
    const answer = index % 2;
    const patch = engine.buildPvpTeamFinalizePatch(match, answersFor(match, 'team', answer, answer), match.battle_no, NOW);
    assert.equal(patch?.status, 'round_result', `battle ${match.battle_no} must continue while tied`);
    assert.equal(patch.red_score, patch.blue_score);
    match = advanceTeam({ ...match, ...patch });
  }
  const decisiveBattle = match.battle_no;
  const patch = engine.buildPvpTeamFinalizePatch(match, answersFor(match, 'team', 1, 0), decisiveBattle, NOW);
  assert.equal(patch?.status, 'finished');
  assert.equal(patch.winner_side, 'blue');
  assert.equal(patch.ended_battle_no, decisiveBattle);
  assert.equal(patch.blue_score, patch.red_score + 1);
  assert.equal(engine.buildPvpTeamAdvancePatch({ ...match, ...patch }, NOW), null);
});

test('2x2: a lead at the end of regulation finishes immediately', () => {
  const match = teamMatch();
  const patch = engine.buildPvpTeamFinalizePatch(match, answersFor(match, 'team', 0, 1), 12, NOW);
  assert.equal(patch?.status, 'finished');
  assert.equal(patch.winner_side, 'red');
});

test('2x2: rounds and questions cycle after regulation without losing any pairing', () => {
  const match = teamMatch();
  for (let battleNo = 13; battleNo <= 48; battleNo += 1) {
    const expected = helpers.getPvpTeamBattleEntry(match, ((battleNo - 1) % 12) + 1);
    const actual = helpers.getPvpTeamBattleEntry(match, battleNo);
    assert.ok(actual, `missing scheduled pair at battle ${battleNo}`);
    assert.equal(actual.red_user_id, expected.red_user_id);
    assert.equal(actual.blue_user_id, expected.blue_user_id);
    assert.deepEqual(engine.getPvpGroupBattleQuestion(match, battleNo), match.question_set[(battleNo - 1) % 12]);
  }
});

test('group answers: ignore previous battles and prefer committed answers over placeholders', () => {
  const committed = { user_id: 'red-1', battle_no: 13, answer_idx: 0 };
  const indexed = engine.indexPvpGroupBattleAnswers([
    { user_id: 'red-1', battle_no: 12, answer_idx: 1 },
    { user_id: 'red-1', battle_no: 13, answer_idx: -1 },
    committed,
    { user_id: 'red-1', battle_no: 13, answer_idx: -1 },
    { user_id: '', battle_no: 13, answer_idx: 0 }
  ], 13);
  assert.equal(indexed.size, 1);
  assert.equal(indexed.get('red-1'), committed);
});

test('2x2: stale and duplicate finalizers cannot score the same battle twice', () => {
  const match = teamMatch({ battle_no: 13 });
  const answers = answersFor(match, 'team');
  assert.equal(engine.buildPvpTeamFinalizePatch(match, answers, 12, NOW), null);
  const patch = engine.buildPvpTeamFinalizePatch(match, answers, 13, NOW);
  assert.equal(patch?.status, 'round_result');
  assert.equal(engine.buildPvpTeamFinalizePatch({ ...match, ...patch }, answers, 13, NOW), null);
  assert.equal(engine.buildPvpTeamAdvancePatch({ ...match, ...patch }, patch.round_result_until_ms - 1), null);
  const next = advanceTeam({ ...match, ...patch });
  assert.equal(engine.buildPvpTeamFinalizePatch(next, answers, 13, NOW), null);
  assert.equal(engine.buildPvpTeamAdvancePatch(next, NOW), null);
});

function eliminationMatch(activeIds = ['player-1', 'player-2', 'player-3', 'player-4'], overrides = {}) {
  const rounds = helpers.buildPvpEliminationCycleRounds(activeIds, 'elimination-regression');
  const lastRound = rounds.at(-1);
  const lastPair = lastRound.pairs.at(-1);
  return {
    id: 'elimination-regression',
    status: 'active',
    difficulty: 'easy',
    members: ['player-1', 'player-2', 'player-3', 'player-4'].map((userId) => ({ user_id: userId })),
    active_member_ids: activeIds,
    spectator_member_ids: [],
    elimination_order: [],
    question_set: Array.from({ length: 12 }, () => ({ ...QUESTION })),
    battle_no: rounds.reduce((total, round) => total + round.pairs.length, 0),
    battle_started_at_ms: 1000,
    cycle_no: 1,
    cycle_rounds: rounds,
    round_in_cycle: lastRound.round_in_cycle,
    pair_no: lastPair.pair_no,
    active_pair_user_ids: [lastPair.player1_user_id, lastPair.player2_user_id],
    member_scores: Object.fromEntries(activeIds.map((id) => [id, 0])),
    cycle_member_scores: Object.fromEntries(activeIds.map((id) => [id, 0])),
    ...overrides
  };
}

function finalizeElimination(match, answer1 = 1, answer2 = 1) {
  const nowMs = engine.getPvpGroupBattleTiming(match, 'elimination').finalizeAtMs + 1;
  const patch = engine.buildPvpEliminationFinalizePatch(match, answersFor(match, 'elimination', answer1, answer2), match.battle_no, nowMs);
  assert.ok(patch, `battle ${match.battle_no} must produce a transition`);
  return { ...match, ...patch };
}

function advanceElimination(match) {
  const holdUntil = Number(match.elimination_until_ms || match.round_result_until_ms || NOW);
  const patch = engine.buildPvpEliminationAdvancePatch(match, holdUntil + 1);
  assert.ok(patch, `result from battle ${match.battle_no} must advance after its hold`);
  return { ...match, ...patch };
}

function startEliminationCycle(overrides = {}) {
  const match = eliminationMatch(undefined, overrides);
  const firstRound = match.cycle_rounds[0];
  const firstPair = firstRound.pairs[0];
  return {
    ...match,
    battle_no: 1,
    round_in_cycle: firstRound.round_in_cycle,
    pair_no: firstPair.pair_no,
    active_pair_user_ids: [firstPair.player1_user_id, firstPair.player2_user_id]
  };
}

test('elimination: a complete all-correct cycle leaves all four perfect players in the match', () => {
  let match = startEliminationCycle();
  for (let battle = 1; battle <= 6; battle += 1) {
    const result = finalizeElimination(match, 0, 0);
    assert.equal(result.eliminated_user_id || null, null);
    assert.equal(result.winner_user_id || null, null);
    assert.equal(result.active_member_ids.length, 4);
    if (battle < 6) {
      assert.equal(result.status, 'round_result');
      match = advanceElimination(result);
    } else {
      assert.equal(result.status, 'elimination_result');
      assert.equal(result.next_status, 'active');
      assert.deepEqual(Object.values(result.member_scores), [3, 3, 3, 3]);
      match = advanceElimination(result);
      assert.equal(match.status, 'active');
      assert.equal(match.cycle_no, 2);
    }
  }
});

test('elimination: a perfect overall leader survives every elimination and wins the full match', () => {
  let match = startEliminationCycle();
  const appearances = new Map();
  let leaderAnswers = 0;
  let battlesPlayed = 0;
  while (match.status === 'active' && battlesPlayed < 30) {
    const answers = engine.getPvpGroupBattlePairIds(match, 'elimination').map((id) => {
      const key = `${match.cycle_no}:${id}`;
      const count = (appearances.get(key) || 0) + 1;
      appearances.set(key, count);
      if (id === 'player-1') {
        leaderAnswers += 1;
        return 0;
      }
      if (id === 'player-2') return count <= (match.cycle_no === 1 ? 2 : match.cycle_no === 2 ? 1 : 0) ? 0 : 1;
      if (id === 'player-3') return match.cycle_no === 1 && count === 1 ? 0 : 1;
      return 1;
    });
    const result = finalizeElimination(match, ...answers);
    assert.notEqual(result.eliminated_user_id, 'player-1');
    assert.ok(result.active_member_ids.includes('player-1'));
    assert.equal(result.member_scores['player-1'], leaderAnswers);
    battlesPlayed += 1;
    match = advanceElimination(result);
  }
  assert.equal(match.status, 'finished');
  assert.equal(match.winner_user_id, 'player-1');
  assert.deepEqual(match.elimination_order, ['player-4', 'player-3', 'player-2']);
  assert.equal(battlesPlayed, 10, 'a clinched final must not schedule another battle');
  assert.equal(engine.buildPvpEliminationAdvancePatch(match, NOW), null);
});

test('elimination: tied players continue through more cycles and exhausted question sets', () => {
  let match = eliminationMatch(undefined, { question_set: [{ ...QUESTION }] });
  const initial = match;
  const originalActive = [...match.active_member_ids].sort();
  const original = structuredClone(match);
  for (let index = 0; index < 24; index += 1) {
    const result = finalizeElimination(match);
    assert.notEqual(result.status, 'finished');
    assert.deepEqual([...result.active_member_ids].sort(), originalActive);
    assert.equal(result.winner_user_id || null, null, 'a score tie cannot declare a seeded winner');
    assert.equal(result.eliminated_user_id || null, null, 'a score tie cannot eliminate a player');
    if (result.status === 'elimination_result') {
      assert.equal(result.next_status, 'active');
      assert.equal(result.cycle_tiebreak, true);
    }
    match = advanceElimination(result);
    assert.equal(match.status, 'active');
    assert.deepEqual(engine.getPvpGroupBattleQuestion(match, match.battle_no), QUESTION);
  }
  assert.ok(match.battle_no > 12);
  assert.deepEqual(initial, original, 'pure transitions must leave the initial match untouched');
});

test('elimination: the overall leader survives a weak current cycle', () => {
  const match = eliminationMatch(undefined, {
    member_scores: { 'player-1': 10, 'player-2': 2, 'player-3': 4, 'player-4': 5 },
    cycle_member_scores: { 'player-1': 0, 'player-2': 2, 'player-3': 2, 'player-4': 2 }
  });
  const result = finalizeElimination(match);
  assert.equal(result.eliminated_user_id, 'player-2');
  assert.ok(result.active_member_ids.includes('player-1'));
  assert.equal(result.winner_user_id || null, null);
  assert.equal(result.next_status, 'active');
});

test('elimination: a tie for lowest overall score never eliminates a player by lottery', () => {
  const match = eliminationMatch(undefined, {
    member_scores: { 'player-1': 10, 'player-2': 2, 'player-3': 2, 'player-4': 5 },
    cycle_member_scores: { 'player-1': 2, 'player-2': 0, 'player-3': 1, 'player-4': 2 }
  });
  const result = finalizeElimination(match);
  assert.deepEqual(result.active_member_ids, match.active_member_ids);
  assert.equal(result.eliminated_user_id || null, null);
  assert.equal(result.next_status, 'active');
  assert.equal(result.cycle_tiebreak, true);
});

test('elimination: tied finalists keep playing and a unique score declares one champion', () => {
  const finalists = ['player-1', 'player-2'];
  const match = eliminationMatch(finalists, {
    battle_no: 15,
    member_scores: { 'player-1': 6, 'player-2': 6 },
    cycle_member_scores: { 'player-1': 3, 'player-2': 3 }
  });
  const tied = finalizeElimination(match, 0, 0);
  assert.equal(tied.next_status, 'active');
  assert.equal(tied.winner_user_id || null, null);
  assert.deepEqual(tied.active_member_ids, finalists);
  let next = advanceElimination(tied);
  while (Number(next.round_in_cycle) < 3) {
    next = advanceElimination(finalizeElimination(next, 0, 0));
  }
  const result = finalizeElimination(next, 0, 1);
  assert.equal(result.next_status, 'finished');
  assert.equal(result.winner_user_id, 'player-1');
  const finished = advanceElimination(result);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.winner_user_id, 'player-1');
  assert.equal(engine.buildPvpEliminationAdvancePatch(finished, NOW), null);
});

test('elimination: a finalist with an insurmountable lead wins before unused battles', () => {
  const match = eliminationMatch(['player-1', 'player-2'], {
    battle_no: 13,
    round_in_cycle: 1,
    pair_no: 1,
    member_scores: { 'player-1': 3, 'player-2': 0 },
    cycle_member_scores: { 'player-1': 0, 'player-2': 0 }
  });
  const result = finalizeElimination(match);
  assert.equal(result.next_status, 'finished');
  assert.equal(result.winner_user_id, 'player-1');
  assert.deepEqual(result.active_member_ids, ['player-1']);
  const finished = advanceElimination(result);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.battle_no, 13);
  assert.equal(finished.next_battle_no || null, null);
});

test('elimination: a declared champion cannot be replaced or sent to another battle', () => {
  const base = eliminationMatch(undefined, {
    winner_user_id: 'player-1',
    member_scores: { 'player-1': 4, 'player-2': 20, 'player-3': 2, 'player-4': 0 },
    next_status: 'active',
    next_battle_no: 7,
    next_active_pair_user_ids: ['player-2', 'player-3'],
    next_cycle_rounds: helpers.buildPvpEliminationCycleRounds(['player-2', 'player-3'], 'stale'),
    round_result_until_ms: NOW - 1,
    elimination_until_ms: NOW - 1
  });
  for (const status of ['round_result', 'elimination_result']) {
    const match = { ...base, status };
    const patch = engine.buildPvpEliminationAdvancePatch(match, NOW);
    assert.equal(patch?.status, 'finished', `${status} with a declared champion must finish`);
    assert.equal(patch.winner_user_id, 'player-1');
    assert.deepEqual(patch.active_member_ids, ['player-1']);
    assert.ok(!patch.elimination_order.includes('player-1'));
    const exit = engine.buildPvpEliminationExitPatch(match, 'player-1', NOW);
    assert.equal(exit?.winner_user_id || match.winner_user_id, 'player-1');
    assert.notEqual(exit?.status, 'active');
    assert.notEqual(exit?.next_status, 'active');
  }
  const activePatch = engine.buildPvpEliminationFinalizePatch(base, answersFor(base, 'elimination'), base.battle_no, NOW);
  assert.equal(activePatch?.status, 'finished');
  assert.equal(activePatch.winner_user_id, 'player-1');
});

test('elimination: a declared champion retains the result hold before finishing', () => {
  for (const status of ['round_result', 'elimination_result']) {
    const match = eliminationMatch(undefined, {
      status,
      winner_user_id: 'player-1',
      next_status: 'active',
      round_result_until_ms: NOW + 1000,
      elimination_until_ms: NOW + 1000
    });
    assert.equal(engine.buildPvpEliminationAdvancePatch(match, NOW), null);
    const patch = engine.buildPvpEliminationAdvancePatch(match, NOW + 1001);
    assert.equal(patch?.status, 'finished');
    assert.equal(patch.winner_user_id, 'player-1');
  }
});

test('elimination: stale and duplicate transitions cannot repeat scoring or reopen a finished match', () => {
  const match = eliminationMatch();
  const answers = answersFor(match, 'elimination');
  assert.equal(engine.buildPvpEliminationFinalizePatch(match, answers, match.battle_no - 1, NOW), null);
  const result = finalizeElimination(match);
  assert.equal(engine.buildPvpEliminationFinalizePatch(result, answers, match.battle_no, NOW), null);
  const until = Number(result.elimination_until_ms || result.round_result_until_ms);
  assert.equal(engine.buildPvpEliminationAdvancePatch(result, until - 1), null);
  const next = advanceElimination(result);
  assert.equal(engine.buildPvpEliminationAdvancePatch(next, NOW), null);
  assert.equal(engine.buildPvpEliminationFinalizePatch(next, answers, match.battle_no, NOW), null);
  const finished = { ...next, status: 'finished', winner_user_id: 'player-1' };
  assert.equal(engine.buildPvpEliminationAdvancePatch(finished, NOW), null);
  assert.equal(engine.buildPvpEliminationFinalizePatch(finished, answers, finished.battle_no, NOW), null);
  assert.equal(engine.buildPvpEliminationExitPatch(finished, 'player-1', NOW), null);
});

test('elimination: the last human leaving after victory keeps the champion and final order', () => {
  const botIds = ['bot_sys_codequiz_finalist', 'bot_sys_codequiz_third', 'bot_sys_codequiz_fourth'];
  const order = [...botIds].reverse();
  const match = eliminationMatch(undefined, {
    status: 'elimination_result',
    active_member_ids: ['player-1'],
    members: ['player-1', ...botIds].map((userId) => ({ user_id: userId })),
    winner_user_id: 'player-1',
    member_scores: { 'player-1': 4, [botIds[0]]: 10 },
    next_status: 'finished',
    elimination_order: order,
    spectator_member_ids: botIds
  });
  const patch = engine.buildPvpEliminationExitPatch(match, 'player-1', NOW);
  const finished = { ...match, ...patch };
  assert.equal(finished.status, 'finished');
  assert.equal(finished.winner_user_id, 'player-1');
  assert.deepEqual(finished.active_member_ids, ['player-1']);
  assert.deepEqual(finished.elimination_order, order);
  assert.deepEqual(finished.opt_out_member_ids, ['player-1']);
  assert.equal(engine.buildPvpEliminationAdvancePatch(finished, NOW), null);
});

test('elimination: the runner-up receives a loss and only the champion receives a win', () => {
  const match = eliminationMatch(undefined, {
    status: 'finished',
    active_member_ids: ['player-1'],
    winner_user_id: 'player-1',
    elimination_order: ['player-4', 'player-3', 'player-2']
  });
  for (let placement = 1; placement <= 4; placement += 1) {
    const userId = `player-${placement}`;
    assert.equal(helpers.getPvpEliminationPlacementForUser(match, userId), placement);
    assert.equal(helpers.getPvpEliminationResultKeyByPlacement(placement), placement === 1 ? 'win' : 'loss');
    const outcome = engine.getPvpGroupMatchOutcomeForUser(match, 'elimination', userId);
    assert.equal(outcome.placement, placement);
    assert.equal(outcome.resultKey, placement === 1 ? 'win' : 'loss');
    assert.equal(outcome.points > 0, placement === 1);
  }
});

test('2x2: an abandoned tie is void and an actual forfeit awards the opposing team', () => {
  const match = teamMatch();
  const abandoned = engine.buildPvpTeamAbandonedPatch(match, NOW);
  assert.equal(abandoned?.status, 'finished');
  assert.equal(abandoned.result_void, true);
  assert.equal(abandoned.winner_side, null);

  let current = match;
  for (const id of ['red-2', 'blue-1', 'blue-2']) {
    const patch = engine.buildPvpTeamLeavePatch(current, id, NOW);
    assert.notEqual(patch?.status, 'finished');
    current = { ...current, ...patch };
  }
  const forfeit = engine.buildPvpTeamLeavePatch(current, 'red-1', NOW);
  assert.equal(forfeit.status, 'finished');
  assert.equal(forfeit.winner_side, 'blue');
  assert.equal(forfeit.ended_reason, 'forfeit');
  assert.notEqual(forfeit.result_void, true);
  assert.equal(engine.getPvpGroupMatchOutcomeForUser({ ...current, ...forfeit }, 'team', 'red-1').points, -2);
});

test('2x2: missing questions cancel the match instead of producing a draw', () => {
  const match = teamMatch({ question_set: [] });
  const patch = engine.buildPvpTeamFinalizePatch(match, answersFor(match, 'team'), 12, NOW);
  assert.equal(patch?.status, 'finished');
  assert.equal(patch.result_void, true);
  assert.equal(patch.ended_reason, 'invalid_battle');
  assert.equal(patch.winner_side, null);
});

test('group bots: overtime uses the cycled question and still schedules an answer', () => {
  const match = teamMatch({ battle_no: 26 });
  for (const mode of ['team', 'elimination']) {
    const plan = engine.getPvpGroupBotAnswerPlan(match, mode, 'bot_sys_codequiz_regression');
    assert.ok(plan);
    assert.equal(plan.battleNo, 26);
    assert.equal(plan.correctIdx, match.question_set[1].answer);
    assert.ok(plan.answerIdx >= 0 && plan.answerIdx < QUESTION.opts.length);
    const timing = engine.getPvpGroupBattleTiming(match, mode);
    assert.ok(plan.dueAtMs > timing.opensAtMs);
    assert.ok(plan.dueAtMs < timing.closesAtMs);
  }
});

test('group rewards: cancellation releases every bot once without changing stats', async () => {
  const botIds = ['bot_sys_codequiz_red', 'bot_sys_codequiz_blue_1', 'bot_sys_codequiz_blue_2'];
  const released = [];
  const rotated = [];
  const statsWrites = [];
  let statsReads = 0;
  let current = {
    ...teamMatch({
      red_members: [{ user_id: 'player-1' }, { user_id: botIds[0] }],
      blue_members: botIds.slice(1).map((userId) => ({ user_id: userId }))
    }),
    status: 'finished',
    winner_side: null,
    result_void: true,
    ended_reason: 'abandoned'
  };
  const mockedLoad = createAppLoader({
    transactPvpTeamMatch: async (_id, updater) => {
      const patch = updater(current);
      if (!patch) return { committed: false, row: current };
      current = { ...current, ...patch };
      return { committed: true, row: current };
    },
    getUserStats: async () => { statsReads += 1; return {}; },
    applyPvpOutcomeToUserStats: async (...args) => { statsWrites.push(args); },
    clearBotBusy: async (...args) => { released.push(args); },
    rotateUserBotQueue: async (...args) => { rotated.push(args); }
  });
  const mockedEngine = mockedLoad('src/codequiz/app/pvpGroupMatch.js');
  await mockedEngine.applyPvpGroupMatchBotRewards('team', current);
  await mockedEngine.applyPvpGroupMatchBotRewards('team', current);
  assert.equal(statsReads, 0);
  assert.deepEqual(statsWrites, []);
  assert.deepEqual(released.map(([botId]) => botId).sort(), [...botIds].sort());
  assert.deepEqual(rotated.map(([, reason]) => reason), botIds.map(() => 'group_match_cancelled'));
  assert.deepEqual([...current.bot_rewards_applied_ids].sort(), [...botIds].sort());
  assert.ok(current.bot_rewards_applied_at_ms > 0);
});

test('elimination: a finalist can still equal the leader when the lead equals remaining battles', () => {
  const match = eliminationMatch(['player-1', 'player-2'], {
    battle_no: 13,
    round_in_cycle: 1,
    pair_no: 1,
    member_scores: { 'player-1': 2, 'player-2': 0 },
    cycle_member_scores: { 'player-1': 0, 'player-2': 0 }
  });
  const result = finalizeElimination(match);
  assert.equal(result.status, 'round_result');
  assert.equal(result.winner_user_id || null, null);
  assert.deepEqual(result.active_member_ids, ['player-1', 'player-2']);
  const next = advanceElimination(result);
  assert.equal(next.status, 'active');
  assert.equal(next.battle_no, 14);
});

test('group finalization: a failed answer read preserves scores until a successful retry', async () => {
  for (const mode of ['team', 'elimination']) {
    let current = mode === 'team' ? teamMatch() : eliminationMatch(undefined, {
      active_pair_user_ids: ['player-1', 'player-2'],
      member_scores: { 'player-1': 10, 'player-2': 4, 'player-3': 1, 'player-4': 3 }
    });
    const original = structuredClone(current);
    const answers = answersFor(current, mode, 0, 0);
    let readAttempts = 0;
    let transactions = 0;
    const readAnswers = async () => {
      readAttempts += 1;
      if (readAttempts === 1) throw new Error('Simulated network failure');
      return answers;
    };
    const transact = async (_id, updater) => {
      transactions += 1;
      const patch = updater(current);
      if (!patch) return { committed: false, row: current };
      current = { ...current, ...patch };
      return { committed: true, row: current };
    };
    const mockedLoad = createAppLoader({
      getPvpTeamBattleAnswers: readAnswers,
      getPvpEliminationBattleAnswers: readAnswers,
      transactPvpTeamMatch: transact,
      transactPvpEliminationMatch: transact
    });
    const mockedEngine = mockedLoad('src/codequiz/app/pvpGroupMatch.js');
    await assert.rejects(mockedEngine.finalizePvpGroupBattle(mode, original), /Simulated network failure/);
    assert.equal(transactions, 0, `${mode}: a failed read must not reach the score transaction`);
    assert.deepEqual(current, original);
    const retried = await mockedEngine.finalizePvpGroupBattle(mode, original);
    assert.equal(retried.committed, true);
    assert.equal(transactions, 1);
    for (const answer of answers) {
      assert.equal(current.member_scores[answer.user_id], Number(original.member_scores[answer.user_id] || 0) + 1);
    }
    if (mode === 'elimination') {
      assert.ok(current.active_member_ids.includes('player-1'));
      assert.notEqual(current.eliminated_user_id, 'player-1');
    }
  }
});
