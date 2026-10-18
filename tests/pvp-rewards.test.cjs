const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const pvp = load('src/codequiz/lib/pvp.js');
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');

test('bônus de duração: nada nas 5 rodadas do duelo, +5% por rodada a mais, até +100%', () => {
  assert.equal(pvp.getPvpDurationBonusPct(0), 0);
  assert.equal(pvp.getPvpDurationBonusPct(5), 0);
  assert.equal(pvp.getPvpDurationBonusPct(6), 5);
  assert.equal(pvp.getPvpDurationBonusPct(12), 35);
  assert.equal(pvp.getPvpDurationBonusPct(25), 100);
  assert.equal(pvp.getPvpDurationBonusPct(60), 100);
  assert.equal(pvp.applyPvpDurationBonus(20, 12), 27);
  assert.equal(pvp.applyPvpDurationBonus(8, 5), 8);
});

test('recompensa do PvP: soma o bônus de duração e guarda a base', () => {
  const short = helpers.getPvpRewardsByDifficulty('easy', 'win');
  assert.equal(short.xp, 20);
  assert.equal(short.coins, 8);
  assert.equal(short.durationBonusPct, 0);
  const long = helpers.getPvpRewardsByDifficulty('easy', 'win', 12);
  assert.equal(long.baseXp, 20);
  assert.equal(long.xp, 27);
  assert.equal(long.coins, 11);
  assert.equal(long.durationBonusPct, 35);
  assert.equal(helpers.formatPvpDurationBonusLabel(long, 'confrontos'), 'Bônus de duração +35% (12 confrontos)');
  assert.equal(helpers.formatPvpDurationBonusLabel(short), '');
});

test('modos em grupo: bônus pelos confrontos jogados, depois da escala da colocação', () => {
  const team = {
    id: 'team-reward',
    status: 'finished',
    difficulty: 'easy',
    red_members: [{ user_id: 'red-1' }, { user_id: 'red-2' }],
    blue_members: [{ user_id: 'blue-1' }, { user_id: 'blue-2' }],
    winner_side: 'red',
    ended_battle_no: 14
  };
  const winner = engine.getPvpGroupMatchOutcomeForUser(team, 'team', 'red-1');
  assert.equal(winner.durationBonusPct, 45);
  assert.equal(winner.roundsPlayed, 14);
  assert.equal(winner.xp, Math.round(20 * 1.45));
  assert.equal(winner.coins, Math.round(8 * 1.45));

  const elimination = {
    id: 'elim-reward',
    mode: 'elimination',
    status: 'finished',
    difficulty: 'easy',
    members: ['p1', 'p2', 'p3', 'p4'].map((userId) => ({ user_id: userId })),
    ended_battle_no: 34
  };
  const second = engine.getPvpGroupMatchOutcomeForUser(elimination, 'elimination', 'p2', { forcePlacement: 2 });
  assert.equal(second.durationBonusPct, 100);
  assert.equal(second.xp, Math.round(6 * 0.85) * 2);
});

test('empate: quem acertou ganha pontos PvP, quem não acertou nenhuma fica no zero', () => {
  const duel = {
    status: 'finished',
    player1_user_id: 'a',
    player2_user_id: 'b',
    player1_score: 3,
    player2_score: 3,
    ended_round_no: 5
  };
  assert.equal(pvp.getPvpResultForUser(duel, 'a'), 'draw');
  assert.equal(pvp.getPvpResultForUser(duel, 'b'), 'draw');
  assert.equal(pvp.getPvpPointsDeltaAdvanced('draw', { matchRow: duel, userId: 'a' }), 2);
  assert.equal(pvp.getPvpPointsDeltaAdvanced('draw', { matchRow: duel, userId: 'b', roundNo: 6 }), 3);
  assert.equal(pvp.getPvpPointsDeltaAdvanced('draw', { matchRow: duel, userId: 'b', roundNo: 9 }), 4);
  const scoreless = { ...duel, player1_score: 0, player2_score: 0 };
  assert.equal(pvp.getPvpPointsDeltaAdvanced('draw', { matchRow: scoreless, userId: 'a' }), 0);

  const teamDraw = {
    status: 'finished',
    difficulty: 'easy',
    red_members: [{ user_id: 'red-1' }, { user_id: 'red-2' }],
    blue_members: [{ user_id: 'blue-1' }, { user_id: 'blue-2' }],
    winner_side: 'draw',
    red_score: 11,
    blue_score: 11,
    member_scores: { 'red-1': 6, 'red-2': 5, 'blue-1': 0, 'blue-2': 11 },
    ended_battle_no: 12
  };
  // 12 confrontos contam como partida longa (igual à vitória, que vale 8).
  assert.equal(engine.getPvpGroupMatchOutcomeForUser(teamDraw, 'team', 'red-1').points, 4);
  assert.equal(engine.getPvpGroupMatchOutcomeForUser(teamDraw, 'team', 'blue-2').points, 4);
  assert.equal(engine.getPvpGroupMatchOutcomeForUser(teamDraw, 'team', 'blue-1').points, 0);
  // Vitória e derrota não mudam.
  assert.equal(pvp.getPvpPointsDeltaAdvanced('win', { matchRow: duel, userId: 'a', roundNo: 5 }), 4);
  assert.equal(pvp.getPvpPointsDeltaAdvanced('loss', { matchRow: duel, userId: 'a', roundNo: 5 }), -2);
});

test('ligas: cada degrau pede 150 pontos a mais (prata 180, ouro 360, platina 540, diamante 710)', () => {
  const tier = (points) => pvp.getCategoryByPoints(points).key;
  assert.equal(tier(0), 'bronze');
  assert.equal(tier(179), 'bronze');
  assert.equal(tier(180), 'silver');
  assert.equal(tier(359), 'silver');
  assert.equal(tier(360), 'gold');
  assert.equal(tier(539), 'gold');
  assert.equal(tier(540), 'platinum');
  assert.equal(tier(709), 'platinum');
  assert.equal(tier(710), 'diamond');
  // A tabela de transição de liga aponta para o piso de cada liga.
  for (const key of ['bronze', 'silver', 'gold', 'platinum', 'diamond']) {
    assert.equal(helpers.getLeagueMetaByKey(key).key, key);
  }
  assert.equal(helpers.getLeagueMetaByKey('diamond').minPoints, 710);
});
