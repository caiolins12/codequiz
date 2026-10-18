const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const quizEngine = load('src/codequiz/lib/quizEngine.js');
const { QUESTIONS, TOPICS } = load('src/codequiz/data/questions-data.js');

const AREAS = ['programming', 'general_knowledge', 'theology'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MIN_QUESTIONS_PER_ROUND = 5;

function forEachTopicPool(callback) {
  AREAS.forEach((areaId) => {
    helpers.getLanguageIdsByKnowledgeArea(areaId).forEach((languageId) => {
      (TOPICS[languageId] || []).forEach((topic) => {
        DIFFICULTIES.forEach((difficulty) => {
          const pool = QUESTIONS[languageId]?.[topic.id]?.[difficulty] || [];
          callback({ areaId, languageId, topicId: topic.id, difficulty, pool });
        });
      });
    });
  });
}

test('banco: toda pergunta tem 4 alternativas, resposta válida e explicação', () => {
  forEachTopicPool(({ languageId, topicId, difficulty, pool }) => {
    pool.forEach((question) => {
      const where = `${languageId}/${topicId}/${difficulty}: ${question.q}`;
      assert.equal(question.opts?.length, 4, where);
      assert.equal(new Set(question.opts).size, 4, `alternativas repetidas em ${where}`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, where);
      assert.ok(String(question.explain || '').trim(), `sem explicação em ${where}`);
    });
  });
});

test('banco: nenhuma pergunta é descartada como repetida e todo tópico rende 5 por rodada', () => {
  forEachTopicPool(({ languageId, topicId, difficulty, pool }) => {
    const usable = quizEngine.getRoundQuestionCapacity(QUESTIONS, languageId, topicId, difficulty, pool.length || 1);
    const where = `${languageId}/${topicId}/${difficulty}`;
    assert.equal(usable, pool.length, `${where}: ${pool.length - usable} pergunta(s) tratada(s) como repetida(s)`);
    assert.ok(usable >= MIN_QUESTIONS_PER_ROUND, `${where}: só ${usable} pergunta(s)`);
  });
});

test('banco: perguntas de uma mesma área não repetem a chave do histórico', () => {
  AREAS.forEach((areaId) => {
    const seen = new Map();
    forEachTopicPool(({ areaId: poolArea, languageId, topicId, difficulty, pool }) => {
      if (poolArea !== areaId) return;
      pool.forEach((question) => {
        const key = quizEngine.getQuestionHistoryKey(question);
        const where = `${languageId}/${topicId}/${difficulty}`;
        assert.ok(!seen.has(key), `"${question.q}" em ${where} repete ${seen.get(key)}`);
        seen.set(key, where);
      });
    });
  });
});

test('motor: perguntas com código só são iguais quando o código é o mesmo', () => {
  const base = { q: 'Qual é o resultado?', code: 'console.log(1 + 1);', opts: ['2', '11', 'NaN', 'Error'], answer: 0 };
  const otherCode = { q: 'Qual é o resultado?', code: 'console.log("1" + 1);', opts: ['2', '11', 'NaN', 'Error'], answer: 1 };
  assert.equal(quizEngine.areQuestionsSemanticallyEquivalent(base, otherCode), false);
  assert.notEqual(quizEngine.getQuestionHistoryKey(base), quizEngine.getQuestionHistoryKey(otherCode));
  assert.equal(quizEngine.areQuestionsSemanticallyEquivalent(base, { ...base, q: 'O que é impresso?' }), true);
  const byValue = { q: 'A função altera n?', code: 'void dobra(int x) { x = x * 2; }', opts: ['Sim', 'Não', 'Erro', 'Depende'], answer: 1 };
  const byPointer = { ...byValue, code: 'void dobra(int *x) { *x = *x * 2; }', answer: 0 };
  assert.equal(quizEngine.areQuestionsSemanticallyEquivalent(byValue, byPointer), false);
});

test('motor: E/OU e alternativas iguais com respostas diferentes não viram a mesma pergunta', () => {
  const and = { q: 'No operador E (AND), o resultado é verdadeiro quando...', opts: ['Pelo menos uma é verdadeira', 'As duas são verdadeiras', 'As duas são falsas', 'Sempre'], answer: 1 };
  const or = { q: 'No operador OU (OR), o resultado é verdadeiro quando...', opts: ['As duas são falsas', 'Pelo menos uma é verdadeira', 'A primeira é falsa', 'Sempre'], answer: 1 };
  assert.equal(quizEngine.areQuestionsSemanticallyEquivalent(and, or), false);
  const inner = { q: 'Qual propriedade define espaço INTERNO?', opts: ['margin', 'padding', 'border', 'gap'], answer: 1 };
  const outer = { q: 'Qual propriedade define espaço EXTERNO?', opts: ['margin', 'padding', 'border', 'gap'], answer: 0 };
  assert.equal(quizEngine.areQuestionsSemanticallyEquivalent(inner, outer), false);
  const reworded = { q: 'Que propriedade CSS define o espaço interno do elemento?', opts: ['gap', 'border', 'padding', 'margin'], answer: 2 };
  assert.equal(quizEngine.areQuestionsSemanticallyEquivalent(inner, reworded), true);
});
