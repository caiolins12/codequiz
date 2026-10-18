const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');
const NOW = 100_000;
const QUESTION = { q: 'Qual alternativa está correta?', opts: ['Correta', 'Errada'], answer: 0 };
const BOT_ID = 'bot_sys_codequiz_rival';

function duelRefusal(overrides = {}) {
  return {
    id: 'duel-refusal',
    status: 'finished',
    ended_reason: 'match_refused',
    player1_user_id: 'ana',
    player2_user_id: 'bia',
    player1_accept_state: 'pending',
    player2_accept_state: 'pending',
    ...overrides
  };
}

function eliminationDuo() {
  const activeIds = ['player-1', 'player-2'];
  const rounds = helpers.buildPvpEliminationCycleRounds(activeIds, 'leave-regression');
  const pair = rounds[0].pairs[0];
  return {
    id: 'elimination-leave',
    status: 'active',
    difficulty: 'easy',
    members: [
      { user_id: 'player-1', nickname: 'Ana' },
      { user_id: 'player-2', nickname: 'Bia' },
      { user_id: 'player-3', nickname: 'Caio' },
      { user_id: 'player-4', nickname: 'Duda' }
    ],
    active_member_ids: activeIds,
    spectator_member_ids: ['player-3', 'player-4'],
    elimination_order: ['player-4', 'player-3'],
    question_set: Array.from({ length: 12 }, () => ({ ...QUESTION })),
    battle_no: 5,
    battle_started_at_ms: 1000,
    cycle_no: 2,
    cycle_rounds: rounds,
    round_in_cycle: 1,
    pair_no: pair.pair_no,
    active_pair_user_ids: [pair.player1_user_id, pair.player2_user_id],
    member_scores: { 'player-1': 3, 'player-2': 2, 'player-3': 1, 'player-4': 0 },
    cycle_member_scores: { 'player-1': 0, 'player-2': 0 }
  };
}

function teamMatch(overrides = {}) {
  const members = {
    red_members: [{ user_id: 'red-1', nickname: 'Ana' }, { user_id: BOT_ID, nickname: 'Rafa' }],
    blue_members: [{ user_id: 'blue-1', nickname: 'Bia' }, { user_id: 'blue-2', nickname: 'Caio' }]
  };
  return {
    id: 'team-leave',
    status: 'active',
    difficulty: 'easy',
    ...members,
    battle_schedule: helpers.buildPvpTeamBattleSchedule(members),
    question_set: Array.from({ length: 12 }, (_, index) => ({ ...QUESTION, q: `Questão ${index + 1}` })),
    total_rounds: 12,
    battle_no: 3,
    battle_started_at_ms: 1000,
    red_score: 2,
    blue_score: 1,
    ...overrides
  };
}

test('duel refusal: whoever refuses has the queue cancelled, the other side goes back to the queue', () => {
  const refused = duelRefusal({ player1_accept_state: 'rejected', player2_accept_state: 'accepted', ended_by_user_id: 'ana' });
  assert.equal(helpers.shouldResumeQueueAfterMatchRefused(refused, 'ana'), false);
  assert.equal(helpers.getMatchRefusalQueueFlow(refused, 'ana').queueCanceled, true);
  assert.equal(helpers.getMatchRefusalQueueStatusText(refused, 'ana'), 'Confronto recusado. Sua fila foi cancelada.');
  assert.equal(helpers.shouldResumeQueueAfterMatchRefused(refused, 'bia'), true);
  assert.equal(
    helpers.getMatchRefusalQueueStatusText(refused, 'bia', { resumed: true }),
    'Confronto recusado. Você voltou para a fila.'
  );
});

test('duel refusal: a refusal by the opponent bot sends the player straight back to the queue', () => {
  const refused = duelRefusal({
    player2_user_id: BOT_ID,
    player2_accept_state: 'rejected',
    ended_by_user_id: BOT_ID
  });
  assert.equal(helpers.shouldResumeQueueAfterMatchRefused(refused, 'ana'), true);
  // Ainda sem decidir quando o bot recusou: também volta para a fila.
  assert.equal(helpers.getMatchRefusalQueueFlow(refused, 'ana').acceptState, 'pending');
});

test('duel refusal: leaving the accept screen counts as refusing', () => {
  const left = duelRefusal({ ended_by_user_id: 'ana' });
  assert.equal(helpers.shouldResumeQueueAfterMatchRefused(left, 'ana'), false);
  assert.equal(helpers.shouldResumeQueueAfterMatchRefused(left, 'bia'), true);
});

test('elimination: the last opponent leaving ends the match and the result screen says so', () => {
  const match = eliminationDuo();
  const exit = engine.buildPvpEliminationExitPatch(match, 'player-1', NOW);
  const finished = { ...match, ...exit };
  assert.equal(finished.status, 'finished');
  assert.equal(finished.ended_reason, 'player_exit');
  assert.equal(finished.ended_by_user_id, 'player-1');
  assert.equal(finished.winner_user_id, 'player-2');

  assert.equal(
    engine.getPvpGroupMatchLeaverNotice(finished, 'elimination', 'player-2'),
    'Ana deixou a partida e a vitória ficou com você.'
  );
  assert.equal(
    engine.getPvpGroupMatchLeaverNotice(finished, 'elimination', 'player-3'),
    'Ana deixou a partida e ela foi encerrada.'
  );
  assert.equal(engine.getPvpGroupMatchLeaverNotice(finished, 'elimination', 'player-1'), '');
  // Classificação e recompensa continuam valendo para quem ficou.
  assert.equal(helpers.getPvpEliminationPlacementForUser(finished, 'player-2'), 1);
  assert.equal(engine.getPvpGroupMatchOutcomeForUser(finished, 'elimination', 'player-2').resultKey, 'win');
});

test('elimination: no leaver notice while the match goes on or when it ends normally', () => {
  const match = eliminationDuo();
  assert.equal(engine.getPvpGroupMatchLeaverNotice(match, 'elimination', 'player-2'), '');
  const completed = { ...match, status: 'finished', ended_reason: 'completed', winner_user_id: 'player-2' };
  assert.equal(engine.getPvpGroupMatchLeaverNotice(completed, 'elimination', 'player-2'), '');
});

test('2x2: the result screen tells the other team who left in the middle of the match', () => {
  let current = teamMatch();
  const leave = engine.buildPvpTeamLeavePatch(current, 'blue-1', NOW);
  assert.deepEqual(leave, { left_member_ids: ['blue-1'] });
  current = { ...current, ...leave };
  assert.equal(engine.getPvpGroupMatchLeaverNotice(current, 'team', 'red-1'), '', 'only after the match ends');

  const finished = { ...current, status: 'finished', ended_reason: 'completed', winner_side: 'red' };
  assert.equal(engine.getPvpGroupMatchLeaverNotice(finished, 'team', 'red-1'), 'Bia, do time adversário, deixou a partida.');
  assert.equal(engine.getPvpGroupMatchLeaverNotice(finished, 'team', 'blue-2'), '', 'a teammate leaving is not an opponent');

  const bothLeft = { ...finished, left_member_ids: ['blue-1', 'blue-2'] };
  assert.equal(
    engine.getPvpGroupMatchLeaverNotice(bothLeft, 'team', 'red-1'),
    'Bia e Caio, do time adversário, deixaram a partida.'
  );
  assert.equal(engine.getPvpGroupMatchLeaverNotice({ ...finished, result_void: true }, 'team', 'red-1'), '');
});
