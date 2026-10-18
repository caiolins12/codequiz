import { QUESTIONS_PER_ROUND } from './constants';
import { normalizeDifficulty, shuffle } from './utils';

const SEMANTIC_STOPWORDS = new Set([
  'a', 'as', 'o', 'os', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'uns', 'umas', 'para', 'por', 'com', 'sem', 'ao', 'aos', 'que', 'qual', 'quais',
  'como', 'quando', 'onde', 'porque', 'porquê', 'ser', 'estar', 'sobre', 'entre', 'ou', 'se',
  'the', 'a', 'an', 'of', 'in', 'on', 'to', 'for', 'and', 'or', 'is', 'are', 'be', 'what', 'which'
]);

const EASY_HINT_PATTERNS = [
  /^o que e\b/,
  /^o que eh\b/,
  /^qual e\b/,
  /^qual eh\b/,
  /^qual opcao\b/,
  /^verdadeiro ou falso\b/,
  /^marque a alternativa\b/
];

const MEDIUM_HINT_KEYWORDS = [
  'comparacao',
  'diferenca',
  'cenario',
  'aplicacao',
  'validacao',
  'teste',
  'fluxo',
  'estrutura',
  'relacao',
  'analise'
];

const HARD_HINT_KEYWORDS = [
  'complexidade',
  'big o',
  'assintot',
  'otimiz',
  'concorr',
  'thread',
  'deadlock',
  'recurs',
  'ponteiro',
  'memoria',
  'endianness',
  'normalizacao',
  'subconsulta',
  'transacao',
  'polimorf',
  'heranca',
  'virtualizacao',
  'assincr',
  'closure',
  'lambda',
  'cache'
];

export function getTopicsByLanguage(topicsMap, languageId) {
  const safeMap = topicsMap && typeof topicsMap === 'object' ? topicsMap : {};
  return Array.isArray(safeMap[languageId]) ? safeMap[languageId] : [];
}

export function getQuestionPool(questionsMap, languageId, topicId, difficulty) {
  const safeQuestions = questionsMap && typeof questionsMap === 'object' ? questionsMap : {};
  const safeDifficulty = normalizeDifficulty(difficulty);
  const byLanguage = safeQuestions[languageId] && typeof safeQuestions[languageId] === 'object'
    ? safeQuestions[languageId]
    : null;
  const byTopic = byLanguage?.[topicId] && typeof byLanguage[topicId] === 'object'
    ? byLanguage[topicId]
    : null;
  const pool = Array.isArray(byTopic?.[safeDifficulty]) ? byTopic[safeDifficulty] : [];
  return pool;
}

function normalizeQuestionShape(rawQuestion) {
  const source = rawQuestion && typeof rawQuestion === 'object' ? rawQuestion : {};
  const opts = Array.isArray(source.opts) ? source.opts.map((item) => String(item)) : [];
  const answerIndex = Number.isFinite(Number(source.answer)) ? Number(source.answer) : -1;
  return {
    q: String(source.q || '').trim(),
    code: source.code || '',
    opts,
    answer: answerIndex,
    explain: String(source.explain || '').trim()
  };
}

function getQuestionUniqKey(question) {
  const normalized = normalizeQuestionShape(question);
  const q = normalizeText(normalized.q);
  const code = normalizeCode(normalized.code);
  if (q || code) return `${q}__${code}`;
  const opts = Array.isArray(normalized.opts)
    ? normalized.opts.map((opt) => normalizeText(opt)).join('|')
    : '';
  return `${opts}__${String(normalized.answer ?? -1)}`;
}

// Chave curta da pergunta (não depende da ordem das alternativas), usada para lembrar
// quais perguntas o jogador já viu.
export function getQuestionHistoryKey(question) {
  const strictKey = getQuestionUniqKey(question);
  if (!strictKey) return '';
  let hash = 2166136261;
  for (let index = 0; index < strictKey.length; index += 1) {
    hash ^= strictKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

// Lista do mais antigo para o mais recente -> posição de cada chave (maior = visto há menos tempo).
export function buildQuestionRecencyRank(recentQuestionKeys = []) {
  const rank = new Map();
  (Array.isArray(recentQuestionKeys) ? recentQuestionKeys : []).forEach((key, index) => {
    const safeKey = String(key || '').trim();
    if (safeKey) rank.set(safeKey, index);
  });
  return rank;
}

export function getQuestionRecencyRank(recencyRank, question) {
  if (!(recencyRank instanceof Map) || !recencyRank.size) return -1;
  const rank = recencyRank.get(getQuestionHistoryKey(question));
  return Number.isInteger(rank) ? rank : -1;
}

// No código os símbolos fazem diferença: "1 + 1" e "'1' + 1", "int x" e "int *x".
function normalizeCode(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// "and"/"or" não contam como palavras do enunciado, mas ao comparar perguntas distinguem
// operadores lógicos ("verdadeiro AND falso" x "verdadeiro OR falso").
const LOGICAL_OPERATOR_TOKENS = new Set(['and', 'or']);

function tokenize(value, keepTokens = null) {
  return normalizeText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && token.length > 1 && (!SEMANTIC_STOPWORDS.has(token) || Boolean(keepTokens?.has(token))));
}

function createTokenSet(value) {
  return new Set(tokenize(value, LOGICAL_OPERATOR_TOKENS));
}

function jaccardSimilarity(setA, setB) {
  if (!setA?.size || !setB?.size) return 0;
  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection += 1;
  });
  const union = setA.size + setB.size - intersection;
  if (!union) return 0;
  return intersection / union;
}

function tokenOverlapRatio(setA, setB) {
  if (!setA?.size || !setB?.size) return 0;
  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection += 1;
  });
  const base = Math.min(setA.size, setB.size);
  if (!base) return 0;
  return intersection / base;
}

function buildSemanticSignature(question) {
  const normalized = normalizeQuestionShape(question);
  const normalizedQuestion = normalizeText(normalized.q);
  const optionsNormalized = (normalized.opts || []).map((opt) => normalizeText(opt)).filter(Boolean);
  const sortedOptionsKey = [...optionsNormalized].sort().join('|');
  const answerText = optionsNormalized[Number(normalized.answer || 0)] || '';
  return {
    raw: normalized,
    strictKey: getQuestionUniqKey(normalized),
    codeKey: normalizeCode(normalized.code),
    normalizedQuestion,
    qTokens: createTokenSet(normalized.q),
    explainTokens: createTokenSet(normalized.explain),
    optionsKey: sortedOptionsKey,
    answerText
  };
}

function isNearDuplicateQuestion(signature, existingSignatures) {
  return existingSignatures.some((current) => {
    if (signature.strictKey && current.strictKey && signature.strictKey === current.strictKey) return true;
    // Perguntas com código costumam repetir o enunciado ("Qual é o resultado?"); o que as
    // distingue é o próprio código.
    if (signature.codeKey || current.codeKey) return signature.codeKey === current.codeKey;

    const normalizedA = String(signature.normalizedQuestion || '').trim();
    const normalizedB = String(current.normalizedQuestion || '').trim();
    if (normalizedA && normalizedB && normalizedA === normalizedB) return true;

    const sameOptions = signature.optionsKey && current.optionsKey && signature.optionsKey === current.optionsKey;
    const sameAnswer = signature.answerText && current.answerText && signature.answerText === current.answerText;
    if (sameOptions && sameAnswer) return true;
    // Mesmas alternativas com respostas certas diferentes são perguntas diferentes
    // (ex.: "espaço INTERNO" x "espaço EXTERNO").
    if (sameOptions) return false;

    const qSimilarity = jaccardSimilarity(signature.qTokens, current.qTokens);
    const qOverlap = tokenOverlapRatio(signature.qTokens, current.qTokens);
    const explainSimilarity = jaccardSimilarity(signature.explainTokens, current.explainTokens);
    if (sameAnswer && qOverlap >= 0.72) return true;
    if (qSimilarity >= 0.74) return true;
    if (qSimilarity >= 0.62 && qOverlap >= 0.82) return true;
    if (qSimilarity >= 0.62 && explainSimilarity >= 0.45) return true;

    if (sameAnswer && normalizedA && normalizedB) {
      const aLongEnough = normalizedA.length >= 24;
      const bLongEnough = normalizedB.length >= 24;
      if (aLongEnough && bLongEnough && (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA))) {
        return true;
      }
    }

    return false;
  });
}

export function areQuestionsSemanticallyEquivalent(questionA, questionB) {
  const signatureA = buildSemanticSignature(questionA);
  const signatureB = buildSemanticSignature(questionB);
  return (
    isNearDuplicateQuestion(signatureA, [signatureB])
    || isNearDuplicateQuestion(signatureB, [signatureA])
  );
}

function buildPreferredAnswerSlots(total, maxOptions) {
  const totalQuestions = Math.max(0, Number(total || 0));
  const optionCount = Math.max(2, Number(maxOptions || 2));
  const baseSlots = Array.from({ length: optionCount }, (_, index) => index);
  const slots = [];
  while (slots.length < totalQuestions) {
    slots.push(...shuffle(baseSlots));
  }
  return slots.slice(0, totalQuestions);
}

function remapQuestionOptions(question, preferredCorrectIndex = null) {
  const normalized = normalizeQuestionShape(question);
  const optsCount = normalized.opts.length;
  if (optsCount <= 1) return normalized;
  const currentAnswer = normalized.answer;
  if (currentAnswer < 0 || currentAnswer >= optsCount) return normalized;

  const targetIndex = Number.isFinite(Number(preferredCorrectIndex))
    ? Math.max(0, Math.min(optsCount - 1, Number(preferredCorrectIndex)))
    : Math.floor(Math.random() * optsCount);

  const correctOption = normalized.opts[currentAnswer];
  const wrongOptions = normalized.opts.filter((_, idx) => idx !== currentAnswer);
  const shuffledWrong = shuffle(wrongOptions);
  const remappedOpts = [];

  for (let idx = 0; idx < optsCount; idx += 1) {
    if (idx === targetIndex) remappedOpts.push(correctOption);
    else remappedOpts.push(shuffledWrong.shift());
  }

  return {
    ...normalized,
    opts: remappedOpts,
    answer: targetIndex
  };
}

function breakLongAnswerStreaks(questions) {
  const next = Array.isArray(questions) ? [...questions] : [];
  for (let i = 2; i < next.length; i += 1) {
    const current = next[i];
    const prev = next[i - 1];
    const prevPrev = next[i - 2];
    if (!current || !prev || !prevPrev) continue;
    if (current.answer !== prev.answer || current.answer !== prevPrev.answer) continue;
    if (!Array.isArray(current.opts) || current.opts.length <= 1) continue;

    const swapIndex = current.answer === 0 ? 1 : 0;
    const remappedOpts = [...current.opts];
    [remappedOpts[current.answer], remappedOpts[swapIndex]] = [remappedOpts[swapIndex], remappedOpts[current.answer]];
    next[i] = {
      ...current,
      opts: remappedOpts,
      answer: swapIndex
    };
  }
  return next;
}

function scoreQuestionDifficulty(question) {
  const normalized = normalizeQuestionShape(question);
  const questionText = normalizeText(normalized.q);
  const explainText = normalizeText(normalized.explain);
  const codeText = normalizeText(normalized.code || '');
  const combined = `${questionText} ${explainText} ${codeText}`.trim();

  const qTokenCount = tokenize(normalized.q).length;
  const explainTokenCount = tokenize(normalized.explain).length;
  const optionAvgLength = Array.isArray(normalized.opts) && normalized.opts.length
    ? normalized.opts.reduce((sum, opt) => sum + normalizeText(opt).length, 0) / normalized.opts.length
    : 0;

  let score = 0;
  score += qTokenCount * 0.42;
  score += explainTokenCount * 0.18;
  score += Math.min(4, optionAvgLength / 24);
  if (String(normalized.code || '').trim()) score += 2.4;

  MEDIUM_HINT_KEYWORDS.forEach((keyword) => {
    if (combined.includes(keyword)) score += 0.8;
  });
  HARD_HINT_KEYWORDS.forEach((keyword) => {
    if (combined.includes(keyword)) score += 1.7;
  });
  EASY_HINT_PATTERNS.forEach((pattern) => {
    if (pattern.test(questionText)) score -= 1.25;
  });

  return score;
}

function pickQuestionsByDifficultyBand(pool, difficulty, limit) {
  const safePool = Array.isArray(pool) ? pool : [];
  const safeLimit = Math.max(1, Math.min(Number(limit || 1), safePool.length));
  if (!safePool.length) return [];

  const scored = safePool.map((question, index) => ({
    question,
    score: scoreQuestionDifficulty(question) + (Math.random() * 0.0001) + index * 0.000001
  }));
  scored.sort((a, b) => a.score - b.score);
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const total = scored.length;

  let bandStart = 0;
  let bandEnd = total;
  if (safeDifficulty === 'easy') {
    bandStart = 0;
    bandEnd = Math.max(safeLimit, Math.ceil(total * 0.72));
  } else if (safeDifficulty === 'medium') {
    const padding = Math.max(2, Math.floor(total * 0.12));
    bandStart = Math.max(0, Math.floor(total * 0.5) - padding);
    bandEnd = Math.min(total, Math.floor(total * 0.5) + padding);
    if ((bandEnd - bandStart) < safeLimit) {
      bandStart = Math.max(0, Math.floor(total * 0.22));
      bandEnd = Math.min(total, Math.ceil(total * 0.82));
    }
  } else {
    bandStart = Math.max(0, Math.floor(total * 0.28));
    bandEnd = total;
  }

  const band = scored.slice(bandStart, bandEnd);
  const source = band.length >= safeLimit ? band : scored;
  return shuffle(source).slice(0, safeLimit).map((entry) => entry.question);
}

// Perguntas nunca vistas primeiro (em ordem sorteada); depois as vistas há mais tempo.
function pickQuestionsByRecency(pool, limit, recencyRank) {
  const ordered = shuffle(Array.isArray(pool) ? pool : [])
    .map((question) => ({ question, rank: getQuestionRecencyRank(recencyRank, question) }))
    .sort((a, b) => a.rank - b.rank);
  return shuffle(ordered.slice(0, limit).map((entry) => entry.question));
}

function buildSemanticUniqueQuestionPool(pool, excludeQuestions = []) {
  const sourcePool = Array.isArray(pool) ? pool : [];
  const excludedList = Array.isArray(excludeQuestions) ? excludeQuestions : [];

  const excludedStrictKeys = new Set();
  const excludedSemanticSignatures = [];
  excludedList.forEach((question) => {
    const normalized = normalizeQuestionShape(question);
    const strictKey = getQuestionUniqKey(normalized);
    if (strictKey) excludedStrictKeys.add(strictKey);
    excludedSemanticSignatures.push(buildSemanticSignature(normalized));
  });

  const strictUniquePool = [];
  const seenStrictKeys = new Set();
  sourcePool.forEach((question) => {
    const normalized = normalizeQuestionShape(question);
    const strictKey = getQuestionUniqKey(normalized);
    if (!strictKey || seenStrictKeys.has(strictKey)) return;
    if (excludedStrictKeys.has(strictKey)) return;
    seenStrictKeys.add(strictKey);
    strictUniquePool.push(normalized);
  });
  if (!strictUniquePool.length) return [];

  const semanticSignatures = [...excludedSemanticSignatures];
  const semanticUniquePool = [];
  strictUniquePool.forEach((question) => {
    const signature = buildSemanticSignature(question);
    if (isNearDuplicateQuestion(signature, semanticSignatures)) return;
    semanticSignatures.push(signature);
    semanticUniquePool.push(signature.raw);
  });

  return semanticUniquePool;
}

export function getRoundQuestionCapacity(
  questionsMap,
  languageId,
  topicId,
  difficulty,
  count = QUESTIONS_PER_ROUND,
  excludeQuestions = []
) {
  const pool = getQuestionPool(questionsMap, languageId, topicId, difficulty);
  if (!pool.length) return 0;
  const semanticUniquePool = buildSemanticUniqueQuestionPool(pool, excludeQuestions);
  if (!semanticUniquePool.length) return 0;
  const requestedCount = Math.max(1, Number(count || QUESTIONS_PER_ROUND));
  return Math.max(0, Math.min(requestedCount, semanticUniquePool.length));
}

export function pickRoundQuestions(
  questionsMap,
  languageId,
  topicId,
  difficulty,
  count = QUESTIONS_PER_ROUND,
  excludeQuestions = [],
  options = {}
) {
  const pool = getQuestionPool(questionsMap, languageId, topicId, difficulty);
  if (!pool.length) return [];
  const semanticUniquePool = buildSemanticUniqueQuestionPool(pool, excludeQuestions);
  if (!semanticUniquePool.length) return [];

  const requestedCount = Math.max(1, Number(count || QUESTIONS_PER_ROUND));
  const limit = Math.max(1, Math.min(requestedCount, semanticUniquePool.length));
  const recencyRank = buildQuestionRecencyRank(options?.recentQuestionKeys);
  const selected = recencyRank.size
    ? pickQuestionsByRecency(semanticUniquePool, limit, recencyRank)
    : pickQuestionsByDifficultyBand(semanticUniquePool, difficulty, limit);
  const maxOptions = selected.reduce((max, question) => Math.max(max, Number(question?.opts?.length || 0)), 2);
  const preferredSlots = buildPreferredAnswerSlots(selected.length, maxOptions);
  const remapped = selected.map((question, index) => {
    const optsLen = Math.max(2, Number(question?.opts?.length || 2));
    const preferred = preferredSlots[index] % optsLen;
    return remapQuestionOptions(question, preferred);
  });

  return breakLongAnswerStreaks(remapped);
}
