const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const balance = load('src/codequiz/lib/botBalance.js');

const stats = (battles, points, extra = {}) => ({ pvp_battles: battles, pvp_points: points, ...extra });

test('rodízio: com o mesmo progresso, joga quem esperou mais (ordem da fila)', () => {
  const statsById = { a: stats(10, 40), b: stats(10, 40), c: stats(10, 40) };
  assert.deepEqual(balance.rankBotsForPlay(['c', 'a', 'b'], { queueOrder: ['b', 'c', 'a'], statsById }), ['b', 'c', 'a']);
});

test('rodízio: bot atrasado volta antes mesmo tendo jogado há pouco; o líder descansa', () => {
  const statsById = { lider: stats(30, 160), medio1: stats(12, 50), medio2: stats(12, 50), novato: stats(1, 0) };
  // novato acabou de jogar (fim da fila) e o líder é o que espera há mais tempo
  const ranked = balance.rankBotsForPlay(['lider', 'medio1', 'medio2', 'novato'], {
    queueOrder: ['lider', 'medio1', 'medio2', 'novato'],
    statsById
  });
  assert.equal(ranked[0], 'novato');
  assert.equal(ranked[ranked.length - 1], 'lider');
});

test('rodízio: bot sem stats no cache local conta como na média, não como novato', () => {
  const statsById = { a: stats(10, 40), b: stats(10, 40) };
  const ranked = balance.rankBotsForPlay(['a', 'b', 'semcache'], {
    queueOrder: ['a', 'b', 'semcache'],
    statsById,
    missingAsAverage: true
  });
  assert.deepEqual(ranked, ['a', 'b', 'semcache']);
});

test('duelo: rival da mesma categoria com pontos mais próximos entre os próximos da ordem', () => {
  const statsById = { a: stats(5, 50), b: stats(5, 250), c: stats(5, 120), d: stats(5, 60) };
  const getCategory = (id) => (statsById[id].pvp_points >= 200 ? 'medium' : 'easy');
  const pair = balance.pickBalancedDuelPair(['a', 'b', 'c', 'd'], { statsById, getCategory });
  assert.deepEqual([pair.botAId, pair.botBId, pair.category], ['a', 'd', 'easy']);
  // sem rival na categoria do primeiro, o próximo da ordem assume
  const lonely = balance.pickBalancedDuelPair(['b', 'a', 'c'], { statsById, getCategory });
  assert.deepEqual([lonely.botAId, lonely.botBId], ['a', 'c']);
  assert.equal(balance.pickBalancedDuelPair(['b'], { statsById, getCategory }), null);
});

test('duelo: vantagem pequena para quem está atrás, que some quando se equiparam', () => {
  const averages = balance.getBotBalanceAverages({ a: stats(2, 0), b: stats(30, 200) }, ['a', 'b']);
  const edge = balance.getBotDuelUnderdogEdge(stats(2, 0), stats(30, 200), averages);
  assert.ok(edge.a > 0 && edge.a <= 0.07, `vantagem ${edge.a}`);
  assert.equal(edge.b, 0);
  const even = balance.getBotDuelUnderdogEdge(stats(10, 50), stats(10, 50), averages);
  assert.deepEqual(even, { a: 0, b: 0 });
});

test('dia: segue o horário de Brasília', () => {
  assert.equal(balance.getBrazilDayKey(Date.parse('2026-10-19T02:59:00Z')), '2026-10-18');
  assert.equal(balance.getBrazilDayKey(Date.parse('2026-10-19T03:00:00Z')), '2026-10-19');
});

test('dia: conta o que cada bot jogou desde o começo do dia (sem meta nem limite)', () => {
  const statsById = { a: stats(12, 40, { quizzes_completed: 4 }), b: stats(5, 10, { quizzes_completed: 1 }) };
  const counts = balance.buildBotDailyCounts(['a', 'b'], {
    statsById,
    dayStart: { a: { battles: 9, quizzes: 3 } }
  });
  assert.deepEqual(counts.a, { pvpToday: 3, quizToday: 1 });
  assert.deepEqual(counts.b, { pvpToday: 0, quizToday: 0 }, 'bot sem começo do dia registrado ainda não jogou hoje');
});

test('módulo não tem mais trava de ritmo diário', () => {
  ['isBotActivityDue', 'getBotActivityDueCount', 'getBotDailyTargets', 'buildBotDailyPlan'].forEach((name) => {
    assert.equal(typeof balance[name], 'undefined', `${name} voltou a existir`);
  });
});
