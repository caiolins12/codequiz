const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');
const quizEngine = load('src/codequiz/lib/quizEngine.js');
const { QUESTIONS, TOPICS } = load('src/codequiz/data/questions-data.js');
const NOW = 100_000;

const keyOf = (question) => quizEngine.getQuestionHistoryKey(question);

function questionKeysOfArea(areaId, difficulty) {
  const keys = new Set();
  helpers.getLanguageIdsByKnowledgeArea(areaId).forEach((languageId) => {
    Object.values(QUESTIONS[languageId] || {}).forEach((topicPack) => {
      (topicPack?.[difficulty] || []).forEach((question) => keys.add(keyOf(question)));
    });
  });
  return keys;
}

function baseSet(difficulty, count, seed) {
  return helpers.pickPvpQuestionSetBySequence(QUESTIONS, {
    difficulty,
    count,
    areaId: 'general_knowledge',
    sequenceSeed: seed,
    ensureMatchWindow: false
  }).questions;
}

function teamMatch(overrides = {}) {
  const members = {
    red_members: [{ user_id: 'red-1' }, { user_id: 'red-2' }],
    blue_members: [{ user_id: 'blue-1' }, { user_id: 'blue-2' }]
  };
  const questionSet = baseSet('easy', 12, 'team-tiebreak');
  return {
    id: 'team-tiebreak',
    mode: 'team_battle',
    status: 'active',
    difficulty: 'easy',
    knowledge_area: 'general_knowledge',
    ...members,
    battle_schedule: helpers.buildPvpTeamBattleSchedule(members),
    question_set: questionSet,
    tiebreak_question_sets: helpers.buildPvpTiebreakQuestionSets(QUESTIONS, {
      areaId: 'general_knowledge',
      difficulty: 'easy',
      sequenceSeed: 'team-tiebreak',
      excludeQuestions: questionSet
    }),
    total_rounds: 12,
    battle_no: 12,
    battle_started_at_ms: 1000,
    red_score: 6,
    blue_score: 6,
    member_scores: { 'red-1': 3, 'red-2': 3, 'blue-1': 3, 'blue-2': 3 },
    ...overrides
  };
}

test('desempate: cada nível sobe uma dificuldade e para no Avançado', () => {
  assert.equal(helpers.getPvpTiebreakDifficulty('easy', 0), 'easy');
  assert.equal(helpers.getPvpTiebreakDifficulty('easy', 1), 'medium');
  assert.equal(helpers.getPvpTiebreakDifficulty('easy', 2), 'hard');
  assert.equal(helpers.getPvpTiebreakDifficulty('easy', 5), 'hard');
  assert.equal(helpers.getPvpTiebreakDifficulty('medium', 1), 'hard');
  assert.equal(helpers.getPvpTiebreakDifficulty('hard', 3), 'hard');
  assert.deepEqual(helpers.getPvpTiebreakDifficulties('easy'), ['medium', 'hard']);
  assert.deepEqual(helpers.getPvpTiebreakDifficulties('hard'), ['hard']);
});

test('desempate: perguntas reservadas ficam na área, na dificuldade certa e sem repetir a partida', () => {
  const questionSet = baseSet('hard', 12, 'hard-room');
  const sets = helpers.buildPvpTiebreakQuestionSets(QUESTIONS, {
    areaId: 'general_knowledge',
    difficulty: 'hard',
    sequenceSeed: 'hard-room',
    excludeQuestions: questionSet
  });
  assert.deepEqual(Object.keys(sets), ['hard']);
  assert.equal(sets.hard.length, helpers.PVP_TIEBREAK_QUESTIONS_PER_DIFFICULTY);
  const areaHardKeys = questionKeysOfArea('general_knowledge', 'hard');
  const baseKeys = new Set(questionSet.map(keyOf));
  const tiebreakKeys = sets.hard.map(keyOf);
  assert.equal(new Set(tiebreakKeys).size, tiebreakKeys.length);
  tiebreakKeys.forEach((key) => {
    assert.ok(areaHardKeys.has(key), 'pergunta fora de Assuntos Gerais / Avançado');
    assert.ok(!baseKeys.has(key), 'pergunta do desempate repete a partida normal');
  });
});

test('2x2: cada confronto extra do desempate sobe uma dificuldade com perguntas novas', () => {
  const match = teamMatch();
  assert.equal(engine.getPvpGroupBattleDifficulty(match, 12), 'easy');
  assert.equal(engine.getPvpGroupBattleDifficulty(match, 13), 'medium');
  assert.equal(engine.getPvpGroupBattleDifficulty(match, 14), 'hard');
  assert.equal(engine.getPvpGroupBattleDifficulty(match, 20), 'hard');

  const baseKeys = new Set(match.question_set.map(keyOf));
  const mediumKeys = questionKeysOfArea('general_knowledge', 'medium');
  const hardKeys = questionKeysOfArea('general_knowledge', 'hard');
  assert.ok(mediumKeys.has(keyOf(engine.getPvpGroupBattleQuestion(match, 13))));
  const hardBattleKeys = [];
  for (let battleNo = 14; battleNo <= 25; battleNo += 1) {
    const question = engine.getPvpGroupBattleQuestion(match, battleNo);
    assert.ok(hardKeys.has(keyOf(question)));
    assert.ok(!baseKeys.has(keyOf(question)));
    hardBattleKeys.push(keyOf(question));
  }
  assert.equal(new Set(hardBattleKeys).size, hardBattleKeys.length, 'desempate repetiu pergunta');

  // Empate no fim do 12º confronto: o confronto 13 já usa a pergunta Intermediária.
  const answers = engine.getPvpGroupBattlePairIds(match, 'team').map((userId) => ({
    user_id: userId,
    battle_no: 12,
    answer_idx: match.question_set[11].answer,
    is_correct: true,
    answered_at_ms: 10_000
  }));
  const patch = engine.buildPvpTeamFinalizePatch(match, answers, 12, NOW);
  assert.equal(patch?.status, 'round_result');
  const next = { ...match, ...patch, ...engine.buildPvpTeamAdvancePatch({ ...match, ...patch }, NOW + 60_000) };
  assert.equal(next.battle_no, 13);
  const plan = engine.getPvpGroupBotAnswerPlan(
    { ...next, red_members: [{ user_id: 'bot_qa' }, ...next.red_members.slice(1)] },
    'team',
    'bot_qa'
  );
  assert.ok(!plan || mediumKeys.has(keyOf(engine.getPvpGroupBattleQuestion(next, 13))));
});

test('2x2: partida antiga sem perguntas reservadas continua usando a sequência', () => {
  const match = teamMatch({ tiebreak_question_sets: undefined });
  assert.equal(engine.getPvpGroupBattleQuestion(match, 13), match.question_set[0]);
});

test('um contra todos: ciclo empatado sobe a dificuldade a partir do próximo confronto', () => {
  const activeIds = ['p1', 'p2', 'p3', 'p4'];
  const cycleRounds = helpers.buildPvpEliminationCycleRounds(activeIds, 'elim-tiebreak:1');
  const lastRound = cycleRounds[cycleRounds.length - 1];
  const lastPair = lastRound.pairs[lastRound.pairs.length - 1];
  const questionSet = baseSet('easy', 12, 'elim-tiebreak');
  const match = {
    id: 'elim-tiebreak',
    mode: 'elimination',
    status: 'active',
    difficulty: 'easy',
    knowledge_area: 'general_knowledge',
    members: activeIds.map((userId) => ({ user_id: userId })),
    active_member_ids: activeIds,
    spectator_member_ids: [],
    elimination_order: [],
    cycle_no: 1,
    cycle_rounds: cycleRounds,
    round_in_cycle: Number(lastRound.round_in_cycle),
    pair_no: Number(lastPair.pair_no),
    active_pair_user_ids: [lastPair.player1_user_id, lastPair.player2_user_id],
    battle_no: 6,
    battle_started_at_ms: 1000,
    question_set: questionSet,
    tiebreak_question_sets: helpers.buildPvpTiebreakQuestionSets(QUESTIONS, {
      areaId: 'general_knowledge',
      difficulty: 'easy',
      sequenceSeed: 'elim-tiebreak',
      excludeQuestions: questionSet
    }),
    tiebreak_start_battle_nos: [],
    member_scores: { p1: 2, p2: 2, p3: 2, p4: 2 },
    cycle_member_scores: { p1: 2, p2: 2, p3: 2, p4: 2 }
  };
  const question6 = engine.getPvpGroupBattleQuestion(match, 6);
  // Os dois erram: todos seguem empatados e ninguém é eliminado.
  const answers = [lastPair.player1_user_id, lastPair.player2_user_id].map((userId) => ({
    user_id: userId,
    battle_no: 6,
    answer_idx: (Number(question6.answer) + 1) % question6.opts.length,
    is_correct: false,
    answered_at_ms: 10_000
  }));
  const patch = engine.buildPvpEliminationFinalizePatch(match, answers, 6, NOW);
  assert.equal(patch?.status, 'elimination_result');
  assert.equal(patch.cycle_tiebreak, true);
  assert.deepEqual(patch.tiebreak_start_battle_nos, [7]);
  const afterResult = { ...match, ...patch };
  // O resultado ainda mostra a pergunta do confronto 6.
  assert.equal(engine.getPvpGroupBattleQuestion(afterResult, 6), question6);
  assert.equal(engine.getPvpGroupBattleDifficulty(afterResult, 6), 'easy');
  assert.equal(engine.getPvpGroupBattleDifficulty(afterResult, 7), 'medium');

  const next = { ...afterResult, ...engine.buildPvpEliminationAdvancePatch(afterResult, NOW + 60_000) };
  assert.equal(next.status, 'active');
  assert.equal(next.battle_no, 7);
  const mediumKeys = questionKeysOfArea('general_knowledge', 'medium');
  assert.ok(mediumKeys.has(keyOf(engine.getPvpGroupBattleQuestion(next))));

  // Um segundo empate leva ao Avançado.
  const twice = { ...next, tiebreak_start_battle_nos: [7, 13] };
  assert.equal(engine.getPvpGroupBattleDifficulty(twice, 12), 'medium');
  assert.equal(engine.getPvpGroupBattleDifficulty(twice, 13), 'hard');
});

test('duelo: rodadas extras do desempate sobem a dificuldade sem trocar as já jogadas', () => {
  const questionSet = baseSet('easy', 5, 'duel-tiebreak');
  const match = {
    id: 'duel-tiebreak',
    difficulty: 'easy',
    language: questionSet[0].language,
    topic: questionSet[0].topic,
    knowledge_area: 'general_knowledge',
    pvp_sequence_area: 'general_knowledge',
    pvp_sequence_seed: 'duel-tiebreak',
    pvp_sequence_start_topic_index: 0,
    question_set: questionSet
  };
  const round6 = helpers.extendPvpQuestionSetIfNeeded(match, 6);
  assert.equal(round6.length, 6);
  assert.deepEqual(round6.slice(0, 5), questionSet);
  assert.equal(round6[5].difficulty, 'medium');
  assert.equal(round6[5].tiebreak_level, 1);
  assert.ok(questionKeysOfArea('general_knowledge', 'medium').has(keyOf(round6[5])));

  const round7 = helpers.extendPvpQuestionSetIfNeeded({ ...match, question_set: round6 }, 7);
  assert.deepEqual(round7.slice(0, 6), round6);
  assert.equal(round7[6].difficulty, 'hard');
  assert.equal(round7[6].tiebreak_level, 2);
  assert.ok(questionKeysOfArea('general_knowledge', 'hard').has(keyOf(round7[6])));
  assert.equal(helpers.getPvpDuelRoundDifficulty(match, 5), 'easy');
  assert.equal(helpers.getPvpDuelRoundDifficulty(match, 8), 'hard');
});

test('Assuntos Gerais: rodadas do PvE nunca recebem perguntas de programação', () => {
  ['easy', 'medium', 'hard'].forEach((difficulty) => {
    const programmingKeys = questionKeysOfArea('programming', difficulty);
    const generalKeys = questionKeysOfArea('general_knowledge', difficulty);
    helpers.getLanguageIdsByKnowledgeArea('general_knowledge').forEach((languageId) => {
      (TOPICS[languageId] || []).forEach((topic) => {
        const questions = helpers.pickPveRoundQuestionsByTopicSequence(QUESTIONS, languageId, topic.id, difficulty, 10);
        assert.equal(questions.length, 10, `${languageId}/${topic.id}/${difficulty} sem perguntas suficientes`);
        questions.forEach((question) => {
          assert.ok(!programmingKeys.has(keyOf(question)), `programação em ${languageId}/${topic.id}/${difficulty}`);
          assert.ok(generalKeys.has(keyOf(question)));
        });
      });
    });
  });
});

test('histórico: variação com prefixo conta como a mesma pergunta', () => {
  const base = { q: 'Qual é o maior oceano da Terra?', opts: ['Atlântico', 'Pacífico'], answer: 1 };
  const variant = { q: 'Contexto prático: Qual é o maior oceano da Terra?', opts: ['Pacífico', 'Atlântico'], answer: 0 };
  assert.equal(keyOf(variant), keyOf(base));
  assert.notEqual(keyOf({ ...base, q: 'Qual é o menor oceano da Terra?' }), keyOf(base));
});

test('histórico: a rodada mantém metade do tópico e completa com perguntas inéditas do tema', () => {
  const languageId = 'mundo_cultura';
  const topicId = 'curiosidades_mundo';
  const topicKeys = new Set((QUESTIONS[languageId][topicId].easy || []).map(keyOf));
  const first = helpers.pickPveRoundQuestionsByTopicSequence(QUESTIONS, languageId, topicId, 'easy', 10);
  const seen = first.map(keyOf);
  const second = helpers.pickPveRoundQuestionsByTopicSequence(QUESTIONS, languageId, topicId, 'easy', 10, {
    recentQuestionKeys: seen
  });
  assert.equal(second.length, 10);
  const fromTopic = second.filter((question) => topicKeys.has(keyOf(question)));
  const repeated = second.filter((question) => seen.includes(keyOf(question)));
  assert.ok(fromTopic.length >= 5, 'menos da metade da rodada é do tópico escolhido');
  assert.ok(repeated.length <= 5, 'repetiu mais que a metade da rodada');
  repeated.forEach((question) => assert.ok(topicKeys.has(keyOf(question)), 'repetiu pergunta de outro tópico'));
  assert.ok(topicKeys.has(keyOf(second[0])), 'a rodada deve abrir com o tópico escolhido');
  assert.equal(new Set(second.map(keyOf)).size, second.length);

  const pvpFirst = helpers.pickPvpQuestionSetBySequence(QUESTIONS, {
    difficulty: 'easy', count: 5, areaId: 'general_knowledge', sequenceSeed: 'a'
  }).questions;
  const pvpSecond = helpers.pickPvpQuestionSetBySequence(QUESTIONS, {
    difficulty: 'easy', count: 5, areaId: 'general_knowledge', sequenceSeed: 'a',
    recentQuestionKeys: pvpFirst.map(keyOf)
  }).questions;
  assert.equal(pvpSecond.filter((question) => pvpFirst.map(keyOf).includes(keyOf(question))).length, 0);
});
