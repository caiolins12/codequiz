const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const timing = load('src/codequiz/lib/botMatchTiming.js');
const helpers = load('src/codequiz/app/helpers.js');

const SEEDS = Array.from({ length: 60 }, (_, idx) => `pvp_bot_a_bot_b_${1792332000000 + idx * 120000}_${idx}`);
const duel = (overrides = {}) => timing.getBotDuelDurationMs({
  roundsPlayed: 5,
  scoreA: 4,
  scoreB: 3,
  difficulty: 'easy',
  strengthA: 'forte',
  strengthB: 'forte',
  seedKey: 'pvp_seed',
  ...overrides
});
const quiz = (overrides = {}) => timing.getBotQuizDurationMs({
  totalQuestions: 5,
  correctCount: 5,
  strength: 'forte',
  seedKey: 'bot_quiz_batch_seed',
  ...overrides
});
const average = (values) => values.reduce((total, value) => total + value, 0) / values.length;

test('duração: mesma partida sempre tem a mesma duração', () => {
  assert.equal(duel(), duel());
  assert.equal(quiz(), quiz());
});

test('duração: duelo de 5 rodadas leva de 1 a 2 min e varia de partida para partida', () => {
  const durations = SEEDS.map((seedKey) => duel({ seedKey }));
  durations.forEach((ms) => {
    assert.ok(ms >= 50000 && ms <= 150000, `5 rodadas em ${ms} ms`);
  });
  assert.ok(new Set(durations.map((ms) => Math.round(ms / 1000))).size > 20, 'durações quase todas iguais');
});

test('duração: mais rodadas (desempate) deixam o duelo mais longo, até ~6,5 min', () => {
  const short = average(SEEDS.map((seedKey) => duel({ seedKey })));
  const long = SEEDS.map((seedKey) => duel({ seedKey, roundsPlayed: 15, scoreA: 14, scoreB: 13 }));
  assert.ok(average(long) > short * 2.5, `15 rodadas (${average(long)}) x 5 rodadas (${short})`);
  // Precisa caber no prazo de duelo travado do servidor (10 min) com um ciclo de folga.
  long.forEach((ms) => assert.ok(ms <= 400000, `15 rodadas em ${ms} ms`));
});

test('duração: errar demora mais que acertar', () => {
  const allHits = average(SEEDS.map((seedKey) => duel({ seedKey, scoreA: 5, scoreB: 5 })));
  const allMisses = average(SEEDS.map((seedKey) => duel({ seedKey, scoreA: 0, scoreB: 0 })));
  assert.ok(allMisses > allHits, `erros ${allMisses} x acertos ${allHits}`);
});

test('duração: dificuldade difícil (menos tempo por rodada) é mais curta', () => {
  const easy = average(SEEDS.map((seedKey) => duel({ seedKey })));
  const hard = average(SEEDS.map((seedKey) => duel({ seedKey, difficulty: 'hard' })));
  assert.ok(hard < easy, `difícil ${hard} x fácil ${easy}`);
});

test('duração: quiz solo de 5 perguntas leva de 1 a 2 min e acaba ao perder as 3 vidas', () => {
  const durations = SEEDS.map((seedKey) => quiz({ seedKey }));
  durations.forEach((ms) => assert.ok(ms >= 50000 && ms <= 150000, `quiz de 5 em ${ms} ms`));
  const perfect8 = average(SEEDS.map((seedKey) => quiz({ seedKey, totalQuestions: 8, correctCount: 8 })));
  const gameOver = average(SEEDS.map((seedKey) => quiz({ seedKey, totalQuestions: 8, correctCount: 0 })));
  assert.ok(gameOver < perfect8 * 0.6, `3 erros seguidos ${gameOver} x 8 acertos ${perfect8}`);
});

test('admin: partida entre bots para o cronômetro e sai do ao vivo no fim previsto', () => {
  const startMs = Date.parse('2026-10-18T15:00:00.000Z');
  const row = {
    id: 'pvp_bot_sys_codequiz_lua9_bot_sys_codequiz_prime_1',
    status: 'active',
    is_bot_match: true,
    is_bot_duel: true,
    player1_user_id: 'bot_sys_codequiz_lua9',
    player2_user_id: 'bot_sys_codequiz_prime',
    created_at: new Date(startMs).toISOString(),
    updated_at: new Date(startMs).toISOString(),
    bot_planned_end_ms: startMs + 95000
  };
  assert.equal(helpers.isAdminLiveMatchRow(row, startMs + 60000), true);
  assert.equal(helpers.getAdminMatchDurationLabel(row, startMs + 60000), '01:00');
  assert.equal(helpers.getAdminMatchDurationLabel(row, startMs + 118000), '01:35');
  assert.equal(helpers.isAdminLiveMatchRow(row, startMs + 118000), false);
  // Duelo longo continua ao vivo depois dos 5 min de "sem escrita" das partidas comuns.
  const longRow = { ...row, bot_planned_end_ms: startMs + 380000 };
  assert.equal(helpers.isAdminLiveMatchRow(longRow, startMs + 330000), true);
});
