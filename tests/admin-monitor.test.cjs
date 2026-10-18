const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');

const NOW = Date.parse('2026-10-18T15:00:00.000Z');
const HUMAN = '102ec294-a193-469f-b5da-84517767ca4d';
const member = (userId, nickname) => ({ user_id: userId, nickname });

const teamMatch = {
  id: 'pvp_team_match_abc123',
  mode: 'team_battle',
  status: 'finished',
  difficulty: 'easy',
  battle_no: 12,
  total_rounds: 12,
  red_score: 7,
  blue_score: 11,
  winner_side: 'blue',
  red_members: [member(HUMAN, 'Antares'), member('bot_sys_codequiz_lua9', 'lua9')],
  blue_members: [member('bot_sys_codequiz_prime', 'tr3vo_azul'), member('bot_sys_codequiz_thiagoara', 'ThiagoAra')],
  created_at: '2026-10-18T14:50:00.000Z',
  ended_at: '2026-10-18T14:58:00.000Z',
  updated_at: '2026-10-18T14:58:02.000Z'
};

const eliminationMatch = {
  id: 'pvp_elimination_match_xyz789',
  mode: 'elimination',
  status: 'active',
  difficulty: 'medium',
  battle_no: 7,
  members: [
    member(HUMAN, 'Antares'),
    member('bot_sys_codequiz_lua9', 'lua9'),
    member('bot_sys_codequiz_bdevonly', 'bDevOnly'),
    member('8b6c2f1c-b3a1-4bc7-b375-699054acfdfc', 'montunes')
  ],
  member_scores: { [HUMAN]: 4, bot_sys_codequiz_bdevonly: 6 },
  active_member_ids: [HUMAN, 'bot_sys_codequiz_bdevonly', 'bot_sys_codequiz_lua9'],
  active_pair_user_ids: [HUMAN, 'bot_sys_codequiz_bdevonly'],
  battle_started_at_ms: NOW - 20000,
  created_at: '2026-10-18T14:55:00.000Z',
  updated_at: '2026-10-18T14:59:30.000Z'
};

test('admin: partida 2x2 vira linha com times, placar e vencedor', () => {
  const row = helpers.toAdminGroupMatchRow(teamMatch, 'team');
  assert.equal(row.admin_group_kind, 'team');
  assert.equal(row.group_title, 'Antares e lua9 × tr3vo_azul e ThiagoAra');
  assert.equal(row.group_score_label, '7 × 11');
  assert.equal(row.group_result_label, 'Vitória: tr3vo_azul e ThiagoAra');
  assert.equal(helpers.getAdminMatchRoundsLabel(row), '12/12');
  assert.equal(helpers.getAdminMatchTypeLabel(row), '2x2');
  assert.equal(helpers.getAdminBotClassSummary(row), 'Bots: 3 de 4');
  assert.equal(row.question_set, undefined, 'a linha do admin não carrega as perguntas');
});

test('admin: Um contra todos em andamento mostra o confronto atual e quantos restam', () => {
  const row = helpers.toAdminGroupMatchRow(eliminationMatch, 'elimination');
  assert.equal(row.group_score_label, '3/4');
  assert.equal(row.group_result_label, 'Agora: Antares × bDevOnly');
  assert.equal(helpers.getAdminMatchTypeLabel(row), 'Um contra todos');
  assert.equal(helpers.isAdminLiveMatchRow(row, NOW), true);

  const finished = helpers.toAdminGroupMatchRow({
    ...eliminationMatch,
    status: 'finished',
    winner_user_id: 'bot_sys_codequiz_bdevonly',
    ended_at: '2026-10-18T14:59:50.000Z'
  }, 'elimination');
  assert.equal(finished.group_score_label, '6 pts');
  assert.equal(finished.group_result_label, 'Vencedor: bDevOnly');
  assert.equal(helpers.isAdminLiveMatchRow(finished, NOW), false);
});

test('admin: partida em grupo sem escrita há mais de 2 min não aparece ao vivo', () => {
  const stale = helpers.toAdminGroupMatchRow({
    ...eliminationMatch,
    battle_started_at_ms: NOW - 10 * 60 * 1000,
    updated_at: new Date(NOW - 10 * 60 * 1000).toISOString()
  }, 'elimination');
  assert.equal(helpers.isAdminLiveMatchRow(stale, NOW), false);
});

test('admin: duelo aberto abandonado ou aceite vencido não conta como ao vivo', () => {
  const activeDuel = {
    id: 'pvp_bot_a_bot_b_1',
    status: 'active',
    is_bot_duel: true,
    player1_user_id: 'bot_sys_codequiz_lua9',
    player2_user_id: 'bot_sys_codequiz_z3n',
    created_at: new Date(NOW - 40000).toISOString(),
    updated_at: new Date(NOW - 40000).toISOString()
  };
  assert.equal(helpers.isAdminLiveMatchRow(activeDuel, NOW), true);
  assert.equal(helpers.isAdminLiveMatchRow({
    ...activeDuel,
    created_at: new Date(NOW - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(NOW - 3 * 60 * 60 * 1000).toISOString()
  }, NOW), false);
  assert.equal(helpers.isAdminLiveMatchRow({
    ...activeDuel,
    status: 'pending_accept',
    accept_deadline_ms: NOW - 60000,
    updated_at: new Date(NOW - 75000).toISOString()
  }, NOW), false);
});

test('admin: histórico do dia inclui empate com acertos e partidas em grupo', () => {
  const dayStart = Date.parse('2026-10-18T03:00:00.000Z');
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const draw = {
    id: 'pvp_draw',
    status: 'finished',
    player1_user_id: HUMAN,
    player2_user_id: 'bot_sys_codequiz_lua9',
    player1_score: 3,
    player2_score: 3,
    winner_user_id: '',
    ended_round_no: 8,
    ended_at: '2026-10-18T14:00:00.000Z'
  };
  assert.equal(helpers.isAdminHistoryMatchRow(draw, dayStart, dayEnd), true);
  assert.equal(helpers.isAdminHistoryMatchRow({ ...draw, player1_score: 0, player2_score: 0 }, dayStart, dayEnd), false);
  assert.equal(helpers.isAdminHistoryMatchRow({ ...draw, ended_at: '2026-10-17T20:00:00.000Z' }, dayStart, dayEnd), false);
  assert.equal(helpers.isAdminHistoryMatchRow(helpers.toAdminGroupMatchRow(teamMatch, 'team'), dayStart, dayEnd), true);
});

test('admin: filtros do histórico separam 2x2/Um contra todos e partidas com humanos', () => {
  const team = helpers.toAdminGroupMatchRow(teamMatch, 'team');
  const botsOnly = helpers.toAdminGroupMatchRow({
    ...teamMatch,
    red_members: [member('bot_sys_codequiz_lua9', 'lua9'), member('bot_sys_codequiz_z3n', 'z3n')]
  }, 'team');
  assert.equal(helpers.doesAdminHistoryRowMatchFilter(team, 'group'), true);
  assert.equal(helpers.doesAdminHistoryRowMatchFilter(team, 'pvp'), true);
  assert.equal(helpers.doesAdminHistoryRowMatchFilter(team, 'quiz'), false);
  assert.equal(helpers.doesAdminHistoryRowMatchFilter(team, 'users'), true);
  assert.equal(helpers.doesAdminHistoryRowMatchFilter(botsOnly, 'users'), false);
  assert.equal(helpers.doesAdminHistoryRowMatchFilter({ id: 'x', player1_user_id: HUMAN, player2_user_id: 'y' }, 'group'), false);
});

test('admin: só a conta caiolins12@gmail.com abre o painel', () => {
  assert.equal(helpers.isAdminAccountEmail('caiolins12@gmail.com'), true);
  assert.equal(helpers.isAdminAccountEmail('  CaioLins12@Gmail.com '), true);
  assert.equal(helpers.isAdminAccountEmail('caiolins01@gmail.com'), false);
  assert.equal(helpers.isAdminAccountEmail(''), false);
  assert.equal(helpers.isAdminAccountEmail(null), false);
});

test('admin: estados do ciclo dos bots têm rótulo em português', () => {
  assert.equal(helpers.getBotDaemonStateLabel('finalized_created'), 'Duelo encerrado e outro iniciado');
  assert.equal(helpers.getBotDaemonStateLabel('quiz_idle_no_available_bot'), 'Sem bot livre para quiz');
  assert.equal(helpers.getBotDaemonStateLabel(''), '--');
  assert.equal(helpers.getBotDaemonStateLabel('estado_novo'), 'estado_novo');
});

test('bots: status vem da automação ou da trava de ocupado', () => {
  const arenaState = { status: 'active', bot_a_id: 'bot_sys_codequiz_z3n', bot_b_id: 'bot_sys_codequiz_zefira', match_id: 'm1' };
  const quizState = { status: 'active', batch_id: 'q1', assignments: [{ bot_id: 'bot_sys_codequiz_prime' }] };
  const busy = {
    bot_sys_codequiz_lua9: { busy: true, reason: 'user_match_pending', match_id: 'pvp_humano_bot' },
    bot_sys_codequiz_sopro: { busy: true, reason: 'team_lobby', match_id: 'pvp_team_room_abc' },
    bot_sys_codequiz_orbita: { busy: true, reason: 'bot_quiz', until_ms: NOW - 1000 }
  };
  const status = (id) => helpers.getAdminBotStatus(id, { busy, arenaState, quizState, nowMs: NOW });
  assert.deepEqual(
    [status('bot_sys_codequiz_z3n').label, status('bot_sys_codequiz_z3n').rivalId],
    ['Duelo entre bots', 'bot_sys_codequiz_zefira']
  );
  assert.equal(status('bot_sys_codequiz_prime').label, 'Fazendo quiz');
  assert.equal(status('bot_sys_codequiz_lua9').label, 'Partida com jogador');
  assert.equal(status('bot_sys_codequiz_sopro').label, 'Sala 2x2');
  assert.equal(status('bot_sys_codequiz_orbita').label, 'Livre', 'trava vencida não conta');
  assert.equal(status('bot_sys_codequiz_flakael').key, 'free');
});

test('bots: visão do bot soma partidas, empates, aproveitamento e posição na fila', () => {
  const view = helpers.buildAdminBotView({
    bot_id: 'bot_sys_codequiz_lua9',
    roster: { id: 'bot_sys_codequiz_lua9', nickname: 'lua9', avatar: '🥳', default_strength: 'forte', default_personality: 'calmo' },
    profile: { nickname: 'lua9', full_name: 'Lua9', avatar: '🥳', created_at: '2026-10-17T05:27:14.241Z' },
    stats: {
      level: 2, total_xp: 72, coins: 7, pvp_points: 364, pvp_battles: 5, pvp_wins: 2, pvp_losses: 2,
      total_answered: 10, total_correct: 7, achievement_ids: ['pass_lvl_01', 'pass_lvl_03'],
      updated_at: '2026-10-18T13:06:08.074Z'
    },
    shop: { owned: ['frame_default', 'bg_default', 'emoji_profile', 'emoji_common_party'], equipped: { frame: 'frame_default', background: 'bg_default', emoji: 'emoji_common_party' } },
    config: { strength: 'forte', personality: 'calmo' }
  }, { busy: {}, queueOrder: ['bot_sys_codequiz_z3n', 'bot_sys_codequiz_lua9'], nowMs: NOW });
  assert.equal(view.draws, 1);
  assert.equal(view.winRatePct, 40);
  assert.equal(view.accuracyPct, 70);
  assert.equal(view.tier.label, 'Ouro');
  assert.equal(view.passLevel, 3);
  assert.equal(view.ownedCount, 4);
  assert.equal(view.queuePosition, 2);
  assert.equal(view.personalityLabel, 'Calmo');
  assert.equal(view.status.label, 'Livre');
  assert.equal(view.missing, false);
});

test('bots: partidas recentes do bot com resultado do ponto de vista dele', () => {
  const bot = 'bot_sys_codequiz_lua9';
  const rows = [
    { id: 'd1', status: 'finished', player1_user_id: bot, player2_user_id: 'bot_sys_codequiz_z3n', player1_nickname: 'lua9', player2_nickname: 'z3n', player1_score: 2, player2_score: 5, winner_user_id: 'bot_sys_codequiz_z3n', ended_round_no: 5, ended_at: '2026-10-18T14:00:00.000Z' },
    { id: 'd2', status: 'finished', player1_user_id: HUMAN, player2_user_id: bot, player1_nickname: 'Antares', player2_nickname: 'lua9', player1_score: 3, player2_score: 3, winner_user_id: '', ended_round_no: 8, ended_at: '2026-10-18T14:30:00.000Z' },
    { id: 'd3', status: 'finished', player1_user_id: HUMAN, player2_user_id: bot, result_void: true, ended_at: '2026-10-18T14:40:00.000Z' },
    { id: 'a1', status: 'active', player1_user_id: bot, player2_user_id: 'x', ended_at: '' },
    helpers.toAdminGroupMatchRow(teamMatch, 'team')
  ];
  const recent = helpers.getAdminBotRecentMatches(bot, rows);
  assert.deepEqual(recent.map((row) => [row.id, row.result]), [
    ['pvp_team_match_abc123', 'loss'],
    ['d2', 'draw'],
    ['d1', 'loss']
  ]);
  assert.equal(recent[1].title, 'contra Antares');
  assert.equal(recent[2].score, '2 × 5');
  const winner = helpers.getAdminBotRecentMatches('bot_sys_codequiz_prime', rows);
  assert.equal(winner[0].result, 'win');
});
