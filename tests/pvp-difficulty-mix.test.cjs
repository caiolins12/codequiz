const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');
const quizEngine = load('src/codequiz/lib/quizEngine.js');
const { QUESTIONS, TOPICS } = load('src/codequiz/data/questions-data.js');

const keyOf = (question) => quizEngine.getQuestionHistoryKey(question);
const countOf = (plan) => plan.reduce((acc, difficulty) => ({ ...acc, [difficulty]: (acc[difficulty] || 0) + 1 }), {});

test('liga: a faixa da partida é a dificuldade que predomina na mistura da liga', () => {
  assert.equal(helpers.getPvpDifficultyFromPoints(0), 'easy');
  assert.equal(helpers.getPvpDifficultyFromPoints(179), 'easy');
  assert.equal(helpers.getPvpDifficultyFromPoints(180), 'easy');
  assert.equal(helpers.getPvpDifficultyFromPoints(360), 'medium');
  assert.equal(helpers.getPvpDifficultyFromPoints(540), 'medium');
  assert.equal(helpers.getPvpDifficultyFromPoints(710), 'hard');
  // A fila não aceita mais escolha do jogador: vale só a liga.
  assert.equal(helpers.getPvpQueueDifficultyFromConfig({ difficulty: 'hard' }, { pvpPoints: 0 }), 'easy');
  assert.equal(helpers.getPvpQueueDifficultyFromConfig({ difficulty: 'easy' }, { pvpPoints: 800 }), 'hard');
});

test('liga: o plano de dificuldades segue a proporção da liga, da mais fácil para a mais difícil', () => {
  assert.deepEqual(helpers.buildPvpDifficultyPlan(0, 5), ['easy', 'easy', 'easy', 'easy', 'medium']);
  assert.deepEqual(helpers.buildPvpDifficultyPlan(200, 5), ['easy', 'easy', 'easy', 'medium', 'medium']);
  assert.deepEqual(helpers.buildPvpDifficultyPlan(400, 5), ['easy', 'easy', 'medium', 'medium', 'hard']);
  assert.deepEqual(helpers.buildPvpDifficultyPlan(600, 5), ['easy', 'medium', 'medium', 'hard', 'hard']);
  assert.deepEqual(helpers.buildPvpDifficultyPlan(800, 5), ['medium', 'medium', 'hard', 'hard', 'hard']);
  [0, 200, 400, 600, 800].forEach((points) => {
    [1, 5, 8, 12].forEach((count) => {
      const plan = helpers.buildPvpDifficultyPlan(points, count);
      assert.equal(plan.length, count);
      const order = plan.map((difficulty) => helpers.PVP_DIFFICULTY_STEPS.indexOf(difficulty));
      assert.deepEqual(order, [...order].sort((a, b) => a - b), 'plano fora de ordem');
    });
  });
  // Bronze nunca recebe Avançado; Diamante nunca recebe Iniciante.
  assert.equal(countOf(helpers.buildPvpDifficultyPlan(0, 12)).hard, undefined);
  assert.equal(countOf(helpers.buildPvpDifficultyPlan(900, 12)).easy, undefined);
  assert.equal(helpers.getPvpAveragePoints([100, 300]), 200);
  assert.equal(helpers.getPvpAveragePoints([]), 0);
});

test('partida: perguntas misturadas na ordem do plano, da área escolhida e sem repetir', () => {
  const plan = helpers.buildPvpDifficultyPlan(400, 12);
  const areaLanguages = new Set(helpers.getLanguageIdsByKnowledgeArea('general_knowledge'));
  const sequence = helpers.pickPvpMixedQuestionSet(QUESTIONS, {
    difficultyPlan: plan,
    areaId: 'general_knowledge',
    sequenceSeed: 'mix-test',
    ensureMatchWindow: true
  });
  assert.equal(sequence.questions.length, plan.length);
  assert.deepEqual(sequence.questions.map((question) => question.difficulty), plan);
  sequence.questions.forEach((question) => {
    assert.ok(areaLanguages.has(question.language), `trilha fora da área: ${question.language}`);
    const pool = QUESTIONS[question.language]?.[question.topic]?.[question.difficulty] || [];
    assert.ok(pool.some((raw) => keyOf(raw) === keyOf(question)), 'pergunta fora da dificuldade marcada');
  });
  assert.equal(new Set(sequence.questions.map(keyOf)).size, plan.length);
  assert.deepEqual(sequence.sequences.map((entry) => entry.difficulty), ['easy', 'medium', 'hard']);

  // O duelo usa a dificuldade da própria pergunta (bots incluídos).
  const match = { difficulty: 'medium', question_set: sequence.questions };
  assert.equal(helpers.getPvpDuelRoundDifficulty(match, 1), 'easy');
  assert.equal(helpers.getPvpDuelRoundDifficulty(match, plan.length), 'hard');
});

function themedQuestion(languageId, topicId, index = 0) {
  return {
    ...QUESTIONS[languageId][topicId].easy[index],
    language: languageId,
    topic: topicId,
    difficulty: 'easy'
  };
}

test('roleta: modos em grupo reservam o tempo da roleta antes de abrir as respostas', () => {
  const questionSet = [
    themedQuestion('brasil', 'geografia_brasil', 0),
    themedQuestion('brasil', 'geografia_brasil', 1),
    themedQuestion('esportes', 'futebol', 0)
  ];
  const base = { id: 'roleta', difficulty: 'easy', question_set: questionSet, total_rounds: 3, battle_started_at_ms: 10_000 };
  const answerMs = engine.getPvpGroupBattleTiming({ ...base, battle_no: 2 }, engine.PVP_GROUP_MODE_TEAM).answerMs;

  // Primeiro confronto: sempre tem roleta.
  const first = engine.getPvpGroupBattleTiming({ ...base, battle_no: 1 }, engine.PVP_GROUP_MODE_TEAM);
  assert.equal(first.themeIntroMs, engine.PVP_GROUP_THEME_INTRO_MS);
  assert.equal(first.themeIntroAtMs, 10_000);
  assert.equal(first.opensAtMs, 10_000 + engine.PVP_GROUP_THEME_INTRO_MS);
  assert.equal(first.closesAtMs, first.opensAtMs + answerMs);

  // Mesmo tema do confronto anterior: sem roleta.
  const same = engine.getPvpGroupBattleTiming({ ...base, battle_no: 2 }, engine.PVP_GROUP_MODE_TEAM);
  assert.equal(same.themeIntroMs, 0);
  assert.equal(same.opensAtMs, 10_000);

  // Tema novo: roleta de novo. No Um contra todos ela vem depois da apresentação da dupla.
  const changed = engine.getPvpGroupBattleTiming({ ...base, battle_no: 3 }, engine.PVP_GROUP_MODE_ELIMINATION);
  assert.equal(changed.themeIntroMs, engine.PVP_GROUP_THEME_INTRO_MS);
  assert.equal(changed.themeIntroAtMs, 10_000 + helpers.PVP_ELIMINATION_BATTLE_INTRO_MS);
  assert.equal(changed.opensAtMs, 10_000 + helpers.PVP_ELIMINATION_BATTLE_INTRO_MS + engine.PVP_GROUP_THEME_INTRO_MS);
  assert.ok(engine.isPvpGroupBattleThemeIntro({ ...base, battle_no: 3 }, 3));
  assert.equal(engine.isPvpGroupBattleThemeIntro({ ...base, battle_no: 2 }, 2), false);
});

test('trilhas novas: Brasil e Esportes entram em Assuntos Gerais com 20 perguntas por dificuldade', () => {
  const areaLanguages = helpers.getLanguageIdsByKnowledgeArea('general_knowledge');
  ['brasil', 'esportes'].forEach((languageId) => {
    assert.ok(areaLanguages.includes(languageId), `${languageId} fora de Assuntos Gerais`);
    assert.equal(helpers.resolveKnowledgeAreaByLanguageId(languageId), 'general_knowledge');
    const topics = TOPICS[languageId] || [];
    assert.equal(topics.length, 2);
    ['easy', 'medium', 'hard'].forEach((difficulty) => {
      const total = topics.reduce((acc, topic) => acc + (QUESTIONS[languageId]?.[topic.id]?.[difficulty] || []).length, 0);
      assert.equal(total, 20, `${languageId}/${difficulty}`);
    });
  });
  // O PvP de Assuntos Gerais usa os temas novos.
  const catalogKeys = helpers.buildPvpSequenceTopicCatalog(QUESTIONS, 'hard', { areaId: 'general_knowledge', sequenceSeed: 'novas' })
    .map((entry) => entry.topicKey);
  ['brasil::geografia_brasil', 'brasil::cultura_brasileira', 'esportes::futebol', 'esportes::esportes_olimpicos']
    .forEach((topicKey) => assert.ok(catalogKeys.includes(topicKey), `${topicKey} fora do PvP`));
});
