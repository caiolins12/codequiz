import { QUESTIONS_PER_ROUND } from './constants';
import { normalizeDifficulty, shuffle } from './utils';

const SEMANTIC_STOPWORDS = new Set([
  'a', 'as', 'o', 'os', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'uns', 'umas', 'para', 'por', 'com', 'sem', 'ao', 'aos', 'que', 'qual', 'quais',
  'como', 'quando', 'onde', 'porque', 'porquê', 'ser', 'estar', 'sobre', 'entre', 'ou', 'se',
  'the', 'a', 'an', 'of', 'in', 'on', 'to', 'for', 'and', 'or', 'is', 'are', 'be', 'what', 'which'
]);

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
  const code = normalizeText(normalized.code);
  if (q || code) return `${q}__${code}`;
  const opts = Array.isArray(normalized.opts)
    ? normalized.opts.map((opt) => normalizeText(opt)).join('|')
    : '';
  return `${opts}__${String(normalized.answer ?? -1)}`;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && token.length > 1 && !SEMANTIC_STOPWORDS.has(token));
}

function createTokenSet(value) {
  return new Set(tokenize(value));
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

    const normalizedA = String(signature.normalizedQuestion || '').trim();
    const normalizedB = String(current.normalizedQuestion || '').trim();
    if (normalizedA && normalizedB && normalizedA === normalizedB) return true;

    const sameOptions = signature.optionsKey && current.optionsKey && signature.optionsKey === current.optionsKey;
    const sameAnswer = signature.answerText && current.answerText && signature.answerText === current.answerText;
    if (sameOptions && sameAnswer) return true;

    const qSimilarity = jaccardSimilarity(signature.qTokens, current.qTokens);
    const qOverlap = tokenOverlapRatio(signature.qTokens, current.qTokens);
    const explainSimilarity = jaccardSimilarity(signature.explainTokens, current.explainTokens);
    if (sameAnswer && qOverlap >= 0.72) return true;
    if (sameOptions && qOverlap >= 0.58) return true;
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

export function pickRoundQuestions(
  questionsMap,
  languageId,
  topicId,
  difficulty,
  count = QUESTIONS_PER_ROUND,
  excludeQuestions = []
) {
  const pool = getQuestionPool(questionsMap, languageId, topicId, difficulty);
  if (!pool.length) return [];

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
  shuffle(pool).forEach((question) => {
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
  if (!semanticUniquePool.length) return [];

  const requestedCount = Math.max(1, Number(count || QUESTIONS_PER_ROUND));
  const limit = Math.max(1, Math.min(requestedCount, semanticUniquePool.length));
  const pickedPool = [...semanticUniquePool];

  const selected = shuffle(pickedPool).slice(0, limit);
  const maxOptions = selected.reduce((max, question) => Math.max(max, Number(question?.opts?.length || 0)), 2);
  const preferredSlots = buildPreferredAnswerSlots(selected.length, maxOptions);
  const remapped = selected.map((question, index) => {
    const optsLen = Math.max(2, Number(question?.opts?.length || 2));
    const preferred = preferredSlots[index] % optsLen;
    return remapQuestionOptions(question, preferred);
  });

  return breakLongAnswerStreaks(remapped);
}
