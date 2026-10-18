// Constantes e helpers do CodeQuizApp (extraídos do componente principal).
import { LANGUAGES, QUESTIONS, TOPICS } from '../data/questions-data';
import { DIFFICULTY_LABELS, PVE_QUESTIONS_PER_ROUND, PVP_COINS_REWARD, PVP_XP_REWARD, QUESTIONS_PER_ROUND, TIMER_SECONDS } from '../lib/constants';
import { defaultProgress, normalizeProgress } from '../lib/progress';
import { PVP_ROUNDS_PER_MATCH, getCategoryByPoints, isPvpAnswerCorrect } from '../lib/pvp';
import {
  areQuestionsSemanticallyEquivalent,
  buildQuestionRecencyRank,
  getQuestionHistoryKey,
  getQuestionPool,
  getQuestionRecencyRank,
  getRoundQuestionCapacity,
  getTopicsByLanguage,
  pickRoundQuestions
} from '../lib/quizEngine';
import { getSystemBotDefaultStrength, isSystemBotUserId } from '../lib/repository';
import { SHOP_RARITY_ORDER, getShopItem, normalizeShopData } from '../lib/shop';
import { getProgressTotalXp, getQuizKey, normalizeDifficulty } from '../lib/utils';
import { useEffect, useState } from 'react';

export function isImageAvatarValue(value) {
  const safe = String(value || '').trim().toLowerCase();
  return safe.startsWith('http://') || safe.startsWith('https://') || safe.startsWith('data:image/');
}

export const AVATAR_IMAGE_RETRY_DELAY_MS = 1800;

// Foto de perfil remota (Google). O googleusercontent as vezes recusa a primeira
// carga (ex.: logo apos o login); tenta mais uma vez e, se falhar de novo, mostra
// o fallback em vez do icone de imagem quebrada.
export function AvatarImage({ src, fallback = null, className, alt = '' }) {
  const [failure, setFailure] = useState({ src: '', count: 0 });
  const failures = failure.src === src ? failure.count : 0;

  useEffect(() => {
    if (failures !== 1) return undefined;
    const timer = setTimeout(() => setFailure({ src, count: 2 }), AVATAR_IMAGE_RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [failures, src]);

  if (!src || failures === 1 || failures >= 3) return fallback;
  return (
    <img
      key={failures === 2 ? 'retry' : 'first'}
      className={className}
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailure({ src, count: failures + 1 })}
    />
  );
}

export function getBackgroundVisualMeta(shopData) {
  const shop = normalizeShopData(shopData);
  const background = getShopItem(shop?.equipped?.background);
  const id = String(background?.id || 'bg_default').trim() || 'bg_default';
  const rarity = String(background?.rarity || 'common').trim().toLowerCase() || 'common';
  const isLegendary = rarity === 'legendary';
  return {
    id,
    rarity,
    isLegendary,
    className: [
      `cos-bg-${id}`
    ].filter(Boolean).join(' ')
  };
}

export function getDifficultyMultiplier(difficulty) {
  const safe = normalizeDifficulty(difficulty);
  if (safe === 'hard') return 3;
  if (safe === 'medium') return 2;
  return 1;
}

export function formatSignedPoints(value) {
  const safe = Math.trunc(Number(value || 0));
  if (safe > 0) return `+${safe}`;
  return String(safe);
}

export function getPvpDifficultyFromPoints(pointsValue) {
  const points = Math.max(0, Number(pointsValue || 0));
  if (points >= 400) return 'hard';
  if (points >= 200) return 'medium';
  return 'easy';
}

export function getPvpQueueDifficultyFromStats(statsRow = null) {
  const row = statsRow && typeof statsRow === 'object' ? statsRow : {};
  return getPvpDifficultyFromPoints(row.pvp_points || 0);
}

export function getPvpQueueDifficultyFromProgress(progressRow = null) {
  const row = progressRow && typeof progressRow === 'object' ? progressRow : {};
  return getPvpDifficultyFromPoints(row.pvpPoints || 0);
}

export function getPvpQueueDifficultyFromConfig(configRow = null, progressRow = null) {
  const row = configRow && typeof configRow === 'object' ? configRow : {};
  if (String(row.difficulty || '').trim()) {
    return normalizeDifficulty(row.difficulty || 'easy');
  }
  return getPvpQueueDifficultyFromProgress(progressRow);
}

export function getEvolutionPassPreferredStage(stages = []) {
  const safeStages = Array.isArray(stages) ? stages : [];
  return safeStages.find((stage) => stage.completed && !stage.claimed)
    || safeStages.find((stage) => stage.active)
    || safeStages.find((stage) => !stage.claimed)
    || safeStages[0]
    || null;
}

export function getEvolutionPassStageStatus(stage) {
  const safeStage = stage && typeof stage === 'object' ? stage : {};
  const isLockedStage = safeStage.locked && !safeStage.claimed;
  if (safeStage.claimed) return 'Coletada';
  if (isLockedStage) return 'Bloqueada';
  if (safeStage.completed) return 'Pronta';
  if (safeStage.active) return 'Em progresso';
  return 'Bloqueada';
}

export function normalizeQuestionTextForSequence(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeQuestionForSequence(rawQuestion) {
  const safe = rawQuestion && typeof rawQuestion === 'object' ? rawQuestion : {};
  const opts = Array.isArray(safe.opts)
    ? safe.opts.map((value) => String(value ?? '').trim()).filter((value) => value.length > 0)
    : [];
  const rawAnswer = Number(safe.answer ?? -1);
  const answer = Number.isFinite(rawAnswer) ? Math.trunc(rawAnswer) : -1;
  return {
    q: String(safe.q || '').trim(),
    code: String(safe.code || ''),
    opts,
    answer,
    explain: String(safe.explain || '').trim()
  };
}

export function buildQuestionStableKeyForSequence(question) {
  const normalized = normalizeQuestionForSequence(question);
  const qKey = normalizeQuestionTextForSequence(normalized.q);
  const codeKey = normalizeQuestionTextForSequence(normalized.code);
  const optsKey = normalized.opts.map((opt) => normalizeQuestionTextForSequence(opt)).join('|');
  if (!qKey && !codeKey && !optsKey) return '';
  return `${qKey}__${codeKey}__${optsKey}__${String(normalized.answer)}`;
}

export function hashStringToPositiveInt(value) {
  const safe = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < safe.length; index += 1) {
    hash ^= safe.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createDeterministicRandom(seedKey = '') {
  let state = hashStringToPositiveInt(seedKey || 'seed') || 0x9e3779b9;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function shuffleDeterministic(values, seedKey = '') {
  const next = Array.isArray(values) ? [...values] : [];
  if (next.length <= 1) return next;
  const rand = createDeterministicRandom(seedKey);
  for (let index = next.length - 1; index > 0; index -= 1) {
    const pickIndex = Math.floor(rand() * (index + 1));
    [next[index], next[pickIndex]] = [next[pickIndex], next[index]];
  }
  return next;
}

export function remapPvpQuestionOptionsDeterministic(question, questionOrderIndex = 0, forcedCorrectIndex = null) {
  const safeQuestion = question && typeof question === 'object' ? question : {};
  const normalized = normalizeQuestionForSequence(safeQuestion);
  const optsCount = normalized.opts.length;
  const currentAnswer = normalized.answer;
  if (optsCount <= 1) return { ...safeQuestion, ...normalized };
  if (currentAnswer < 0 || currentAnswer >= optsCount) return { ...safeQuestion, ...normalized };

  const safeOrderIndex = Math.max(0, Math.trunc(Number(questionOrderIndex || 0)));
  const stableKey = buildQuestionStableKeyForSequence(normalized) || `pvp_q_${safeOrderIndex}`;
  const seededTargetIndex = Math.floor(
    createDeterministicRandom(`${stableKey}::slot::${safeOrderIndex}::${optsCount}`)() * optsCount
  );
  const targetIndex = Number.isFinite(Number(forcedCorrectIndex))
    ? Math.max(0, Math.min(optsCount - 1, Math.trunc(Number(forcedCorrectIndex))))
    : seededTargetIndex;
  const correctOption = normalized.opts[currentAnswer];
  const wrongOptions = normalized.opts.filter((_, index) => index !== currentAnswer);
  const shuffledWrong = shuffleDeterministic(wrongOptions, `${stableKey}::wrong::${safeOrderIndex}`);
  const remappedOpts = [];

  for (let index = 0; index < optsCount; index += 1) {
    if (index === targetIndex) remappedOpts.push(correctOption);
    else remappedOpts.push(String(shuffledWrong.shift() ?? ''));
  }

  return {
    ...safeQuestion,
    ...normalized,
    opts: remappedOpts,
    answer: targetIndex
  };
}

export function buildPvpAnswerSlotPlan(questions = []) {
  const list = Array.isArray(questions) ? questions : [];
  if (!list.length) return [];

  const optionCounts = list.map((question) => {
    const normalized = normalizeQuestionForSequence(question);
    return Math.max(2, Number(normalized.opts.length || 2));
  });
  const maxSlotCount = Math.max(2, ...optionCounts);
  const allSlots = Array.from({ length: maxSlotCount }, (_, index) => index);
  const signature = list
    .map((question, index) => `${index}:${buildQuestionStableKeyForSequence(question)}`)
    .join('||');
  const seedBase = signature || `pvp_slot_plan_${list.length}_${maxSlotCount}`;
  const usageBySlot = new Map();
  const pickedSlots = [];

  const readUsage = (slot) => Math.max(0, Number(usageBySlot.get(slot) || 0));

  for (let index = 0; index < list.length; index += 1) {
    const optsCount = optionCounts[index];
    const allowedSlots = allSlots.filter((slot) => slot < optsCount);
    const shuffledCandidates = shuffleDeterministic(allowedSlots, `${seedBase}::pick_cycle::${index}`);
    const candidates = [
      ...shuffledCandidates,
      ...allowedSlots.filter((slot) => !shuffledCandidates.includes(slot))
    ];
    let bestSlot = candidates[0] ?? 0;
    let bestScore = Number.POSITIVE_INFINITY;

    candidates.forEach((slot, slotOrder) => {
      const prev = pickedSlots[index - 1];
      const prevPrev = pickedSlots[index - 2];
      const prevPrevPrev = pickedSlots[index - 3];
      let score = 0;
      score += readUsage(slot) * 6;

      if (index > 0 && slot === prev) score += 4;
      if (index > 1 && slot === prev && slot === prevPrev) score += 160;
      // Penalize ABAB-like pattern to avoid predictable alternation.
      if (index > 2 && slot === prevPrev && prev === prevPrevPrev && slot !== prev) score += 10;

      // Encourage diversity early in the round.
      if (readUsage(slot) === 0) score -= 2.4;

      // Penalize very short distance to previous same slot.
      for (let back = index - 1; back >= 0; back -= 1) {
        if (pickedSlots[back] !== slot) continue;
        const distance = index - back;
        if (distance <= 3) {
          score += (4 - distance) * 1.4;
        }
        break;
      }

      const tieBreakRand = createDeterministicRandom(`${seedBase}::tie::${index}::${slot}`)();
      score += (tieBreakRand * 0.6) + (slotOrder * 0.01);

      if (score < bestScore) {
        bestScore = score;
        bestSlot = slot;
      }
    });

    pickedSlots.push(bestSlot);
    usageBySlot.set(bestSlot, readUsage(bestSlot) + 1);
  }

  return pickedSlots;
}

export function spreadPvpQuestionAnswers(questions = []) {
  const list = Array.isArray(questions) ? questions : [];
  if (!list.length) return [];
  const slotPlan = buildPvpAnswerSlotPlan(list);
  return list.map((question, index) => {
    const plannedSlot = Number(slotPlan[index] ?? -1);
    return remapPvpQuestionOptionsDeterministic(question, index, plannedSlot);
  });
}

export function getDidacticExplainText(question) {
  const normalized = normalizeQuestionForSequence(question);
  if (normalized.explain) return normalized.explain;
  const answerIndex = Number(normalized.answer);
  const answerText = (
    Number.isInteger(answerIndex)
    && answerIndex >= 0
    && answerIndex < normalized.opts.length
  ) ? normalized.opts[answerIndex] : '';
  if (answerText) {
    return `Resposta correta: ${answerText}. Revise o conceito principal para fixar o raciocinio.`;
  }
  return 'Revise o enunciado e os conceitos principais deste tema para reforcar o aprendizado.';
}

export function buildOrderedUniqueQuestionsForTopic(questionsMap, languageId, topicId, difficulty) {
  const safeLanguageId = String(languageId || '').trim();
  const safeTopicId = String(topicId || '').trim();
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const pool = getQuestionPool(questionsMap, languageId, topicId, difficulty);
  if (!Array.isArray(pool) || !pool.length) return [];
  const ordered = [];
  const seenKeys = new Set();

  pool.forEach((question) => {
    const normalized = normalizeQuestionForSequence(question);
    if (!normalized.q || normalized.opts.length < 2) return;
    if (normalized.answer < 0 || normalized.answer >= normalized.opts.length) return;
    const key = buildQuestionStableKeyForSequence(normalized);
    if (!key || seenKeys.has(key)) return;
    const candidate = {
      ...normalized,
      language: safeLanguageId,
      topic: safeTopicId,
      difficulty: safeDifficulty,
      explain: getDidacticExplainText(normalized)
    };
    const hasSemanticDuplicate = ordered.some((current) => (
      areQuestionsSemanticallyEquivalent(current, candidate)
    ));
    if (hasSemanticDuplicate) return;
    seenKeys.add(key);
    ordered.push(candidate);
  });

  return ordered;
}

export function getPveRoundSeconds() {
  return Math.max(1, Number(TIMER_SECONDS.easy || 30));
}

export function buildPveQuestionReviewEntry(question, options = {}) {
  const safe = normalizeQuestionForSequence(question);
  const questionIndex = Math.max(0, Math.trunc(Number(options?.questionIndex || 0)));
  const selectedIndexRaw = Number(options?.selectedIndex ?? -1);
  const selectedIndex = Number.isFinite(selectedIndexRaw) ? Math.trunc(selectedIndexRaw) : -1;
  const selectedInRange = selectedIndex >= 0 && selectedIndex < safe.opts.length;
  const correctIndex = safe.answer >= 0 && safe.answer < safe.opts.length ? safe.answer : -1;
  return {
    questionIndex,
    index: questionIndex + 1,
    q: safe.q,
    code: safe.code,
    opts: safe.opts,
    correctIndex,
    selectedIndex: selectedInRange ? selectedIndex : -1,
    isCorrect: options?.isCorrect === true,
    isTimeout: options?.isTimeout === true,
    wasAnswered: options?.wasAnswered !== false,
    explain: getDidacticExplainText(safe)
  };
}

export function buildPveRoundReviewList(questions = [], answerLog = []) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const answersMap = new Map(
    (Array.isArray(answerLog) ? answerLog : [])
      .map((row) => [Math.max(0, Math.trunc(Number(row?.questionIndex || 0))), row])
  );

  return safeQuestions.map((question, index) => {
    const logged = answersMap.get(index);
    if (logged && typeof logged === 'object') return logged;
    return buildPveQuestionReviewEntry(question, {
      questionIndex: index,
      selectedIndex: -1,
      isCorrect: false,
      isTimeout: false,
      wasAnswered: false
    });
  });
}

// Rodada do PvE: tópico escolhido primeiro, depois os outros tópicos do tema e, se
// ainda faltar, outros temas da mesma área (Assuntos Gerais nunca recebe programação).
// Com o histórico do jogador, pelo menos metade da rodada continua sendo do tópico
// escolhido (inéditas primeiro, depois as vistas há mais tempo) e o resto prefere as
// perguntas inéditas dos outros tópicos do tema antes de repetir alguma.
export function pickPveRoundQuestionsByTopicSequence(questionsMap, languageId, topicId, difficulty, count, options = {}) {
  const safeLanguage = String(languageId || '').trim();
  const safeTopic = String(topicId || '').trim();
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeCount = Math.max(1, Math.trunc(Number(count || PVE_QUESTIONS_PER_ROUND)));
  const recencyRank = buildQuestionRecencyRank(options?.recentQuestionKeys);
  const pickOptions = { recentQuestionKeys: options?.recentQuestionKeys };
  if (!safeLanguage || !safeTopic) return [];

  const siblingTopicIds = [];
  getTopicsByLanguage(TOPICS, safeLanguage).forEach((topic) => {
    const safeValue = String(topic?.id || '').trim();
    if (!safeValue || safeValue === safeTopic || siblingTopicIds.includes(safeValue)) return;
    siblingTopicIds.push(safeValue);
  });

  const picked = [];
  // filter: 'any' | 'unseen' (nunca vistas) | 'seen' (já vistas).
  const pullFromTopic = (languageToRead, topicToRead, limit = safeCount, filter = 'any') => {
    const safeLanguageToRead = String(languageToRead || '').trim();
    const safeTopicToRead = String(topicToRead || '').trim();
    if (!safeLanguageToRead || !safeTopicToRead) return;
    const missing = Math.min(safeCount, limit) - picked.length;
    if (missing <= 0) return;
    const pool = getQuestionPool(questionsMap, safeLanguageToRead, safeTopicToRead, safeDifficulty);
    const filteredPool = filter === 'any'
      ? pool
      : pool.filter((question) => (getQuestionRecencyRank(recencyRank, question) < 0) === (filter === 'unseen'));
    if (!filteredPool.length) return;
    const selected = pickRoundQuestions(
      { [safeLanguageToRead]: { [safeTopicToRead]: { [safeDifficulty]: filteredPool } } },
      safeLanguageToRead,
      safeTopicToRead,
      safeDifficulty,
      missing,
      picked,
      pickOptions
    );
    selected.forEach((question) => {
      const normalized = normalizeQuestionForSequence(question);
      picked.push({
        ...normalized,
        explain: getDidacticExplainText(normalized)
      });
    });
  };

  if (recencyRank.size) {
    pullFromTopic(safeLanguage, safeTopic, safeCount, 'unseen');
    pullFromTopic(safeLanguage, safeTopic, Math.ceil(safeCount / 2));
    siblingTopicIds.forEach((siblingTopicId) => pullFromTopic(safeLanguage, siblingTopicId, safeCount, 'unseen'));
  }
  pullFromTopic(safeLanguage, safeTopic);
  siblingTopicIds.forEach((siblingTopicId) => pullFromTopic(safeLanguage, siblingTopicId));

  if (picked.length < safeCount) {
    const areaLanguageIds = getLanguageIdsByKnowledgeArea(resolveKnowledgeAreaByLanguageId(safeLanguage))
      .filter((areaLanguageId) => areaLanguageId !== safeLanguage);
    areaLanguageIds.forEach((areaLanguageId) => {
      getTopicsByLanguage(TOPICS, areaLanguageId).forEach((topicMeta) => {
        pullFromTopic(areaLanguageId, topicMeta?.id || '');
      });
    });
  }

  return picked.slice(0, safeCount);
}

export function normalizePvpSequenceCursorEntry(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  return {
    topic_index: Math.max(0, Math.trunc(Number(safe.topic_index ?? safe.topicIndex ?? 0))),
    question_index: Math.max(0, Math.trunc(Number(safe.question_index ?? safe.questionIndex ?? 0))),
    topic_key: String(safe.topic_key || safe.topicKey || '').trim()
  };
}

export function normalizePvpSequenceCursorState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const next = {};
  Object.entries(safe).forEach(([key, value]) => {
    const safeKey = String(key || '').trim();
    if (!safeKey) return;
    next[safeKey] = normalizePvpSequenceCursorEntry(value);
  });
  return next;
}

export function normalizePvpSequenceRecentStartsState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const next = {};
  Object.entries(safe).forEach(([key, value]) => {
    const safeKey = String(key || '').trim();
    if (!safeKey) return;
    const safeList = Array.isArray(value) ? value : [];
    const normalized = [];
    safeList.forEach((entry) => {
      const safeEntry = String(entry || '').trim();
      if (!safeEntry || normalized.includes(safeEntry)) return;
      normalized.push(safeEntry);
    });
    if (normalized.length) {
      next[safeKey] = normalized.slice(0, PVP_SEQUENCE_RECENT_STARTS_MAX);
    }
  });
  return next;
}

export function getPvpSequenceCursorMapKey(areaId = '', difficulty = 'easy') {
  const safeArea = String(areaId || 'programming').trim() || 'programming';
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  return `${safeArea}__${safeDifficulty}`;
}

export function resolvePvpSequenceSeed(seedInput = '', options = {}) {
  const safeSeed = String(seedInput || '').trim();
  if (safeSeed) return safeSeed;
  const safeDifficulty = normalizeDifficulty(options?.difficulty || 'easy');
  const safeArea = String(options?.areaId || 'mixed').trim() || 'mixed';
  const safeTopic = String(options?.topicId || 'mixed').trim() || 'mixed';
  const safeLanguage = normalizeLegacyLanguageId(options?.languageId || '', safeTopic) || 'mixed';
  return `${safeArea}::${safeDifficulty}::${safeLanguage}::${safeTopic}`;
}

export function buildPvpSequenceTopicCatalog(questionsMap, difficulty, options = {}) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeArea = String(options?.areaId || '').trim();
  const safeTopic = String(options?.topicId || '').trim();
  const safeLanguage = normalizeLegacyLanguageId(options?.languageId || '', safeTopic);
  const safeSequenceSeed = resolvePvpSequenceSeed(options?.sequenceSeed, {
    areaId: safeArea,
    difficulty: safeDifficulty,
    languageId: safeLanguage,
    topicId: safeTopic
  });
  const areaLanguageIds = getLanguageIdsByKnowledgeArea(safeArea);
  const restrictToArea = areaLanguageIds.length > 0;
  const candidateLanguages = [];
  const pushLanguage = (languageId) => {
    const safeLanguageId = normalizeLegacyLanguageId(languageId, safeTopic);
    if (!safeLanguageId) return;
    if (candidateLanguages.includes(safeLanguageId)) return;
    if (restrictToArea && !areaLanguageIds.includes(safeLanguageId)) return;
    if (!getTopicsByLanguage(TOPICS, safeLanguageId).length) return;
    candidateLanguages.push(safeLanguageId);
  };

  pushLanguage(safeLanguage);
  areaLanguageIds.forEach((languageId) => pushLanguage(languageId));
  if (!restrictToArea) {
    LANGUAGES.forEach((language) => pushLanguage(language?.id));
  }

  // Com o histórico de quem cria a partida, as perguntas que ele ainda não viu vêm
  // primeiro em cada tópico (depois as vistas há mais tempo).
  const recencyRank = buildQuestionRecencyRank(options?.recentQuestionKeys);
  const catalog = [];
  candidateLanguages.forEach((languageId) => {
    const topics = getTopicsByLanguage(TOPICS, languageId);
    topics.forEach((topic) => {
      const topicId = String(topic?.id || '').trim();
      if (!topicId) return;
      const shuffled = shuffleDeterministic(
        buildOrderedUniqueQuestionsForTopic(questionsMap, languageId, topicId, safeDifficulty),
        `${safeSequenceSeed}::${languageId}::${topicId}::${safeDifficulty}`
      );
      const questions = recencyRank.size
        ? shuffled
          .map((question, index) => ({ question, index, rank: getQuestionRecencyRank(recencyRank, question) }))
          .sort((a, b) => (a.rank - b.rank) || (a.index - b.index))
          .map((entry) => entry.question)
        : shuffled;
      if (!questions.length) return;
      catalog.push({
        language: languageId,
        topic: topicId,
        topicKey: `${languageId}::${topicId}`,
        questions
      });
    });
  });

  return shuffleDeterministic(catalog, `${safeSequenceSeed}::catalog`);
}

export function resolvePvpSequenceTopicIndex(catalog, cursor) {
  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  if (!safeCatalog.length) return 0;
  const safeCursor = normalizePvpSequenceCursorEntry(cursor);
  if (safeCursor.topic_key) {
    const byTopicKey = safeCatalog.findIndex((entry) => entry.topicKey === safeCursor.topic_key);
    if (byTopicKey >= 0) return byTopicKey;
  }

  return Math.min(safeCatalog.length - 1, Math.max(0, Number(safeCursor.topic_index || 0)));
}

export function resolvePvpSequenceStartCursor(catalog, topicIndexInput, questionIndexInput, minimumRemaining = 1) {
  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  if (!safeCatalog.length) {
    return { topicIndex: 0, questionIndex: 0 };
  }
  const requiredRemaining = Math.max(1, Math.trunc(Number(minimumRemaining || 1)));
  let topicIndex = Math.min(safeCatalog.length - 1, Math.max(0, Math.trunc(Number(topicIndexInput || 0))));
  let questionIndex = Math.max(0, Math.trunc(Number(questionIndexInput || 0)));

  for (let guard = 0; guard < safeCatalog.length; guard += 1) {
    const entry = safeCatalog[topicIndex];
    const maxQuestionIndex = Math.max(0, entry.questions.length - 1);
    const safeQuestionIndex = Math.min(questionIndex, maxQuestionIndex);
    const remaining = Math.max(0, entry.questions.length - safeQuestionIndex);
    if (remaining >= requiredRemaining) {
      return {
        topicIndex,
        questionIndex: safeQuestionIndex
      };
    }
    topicIndex = (topicIndex + 1) % safeCatalog.length;
    questionIndex = 0;
  }

  for (let index = 0; index < safeCatalog.length; index += 1) {
    if (safeCatalog[index].questions.length > 0) {
      return { topicIndex: index, questionIndex: 0 };
    }
  }

  return { topicIndex: 0, questionIndex: 0 };
}

export function resolvePvpSequenceRecentStartCursor(catalog, startCursor, recentStartTopicKeys = [], minimumRemaining = 1) {
  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  if (!safeCatalog.length) return normalizePvpSequenceCursorEntry({});
  const safeStartCursor = normalizePvpSequenceCursorEntry(startCursor);
  const currentTopicIndex = Math.min(
    safeCatalog.length - 1,
    Math.max(0, Math.trunc(Number(safeStartCursor.topic_index || 0)))
  );
  const currentTopicKey = String(
    safeStartCursor.topic_key
    || safeCatalog[currentTopicIndex]?.topicKey
    || ''
  ).trim();
  const recentKeys = Array.isArray(recentStartTopicKeys)
    ? recentStartTopicKeys
      .map((value) => String(value || '').trim())
      .filter(Boolean)
    : [];

  if (!recentKeys.length || safeCatalog.length < 2 || !currentTopicKey) {
    return {
      ...safeStartCursor,
      topic_index: currentTopicIndex,
      topic_key: currentTopicKey
    };
  }

  const recentSet = new Set(recentKeys);
  if (!recentSet.has(currentTopicKey)) {
    return {
      ...safeStartCursor,
      topic_index: currentTopicIndex,
      topic_key: currentTopicKey
    };
  }

  for (let offset = 1; offset < safeCatalog.length; offset += 1) {
    const candidateIndex = (currentTopicIndex + offset) % safeCatalog.length;
    const candidateStart = resolvePvpSequenceStartCursor(catalog, candidateIndex, 0, minimumRemaining);
    const candidateEntry = safeCatalog[candidateStart.topicIndex];
    const candidateTopicKey = String(candidateEntry?.topicKey || '').trim();
    if (!candidateTopicKey || recentSet.has(candidateTopicKey) || candidateTopicKey === currentTopicKey) continue;
    return {
      topic_index: candidateStart.topicIndex,
      question_index: candidateStart.questionIndex,
      topic_key: candidateTopicKey
    };
  }

  return {
    ...safeStartCursor,
    topic_index: currentTopicIndex,
    topic_key: currentTopicKey
  };
}

export function takePvpSequenceQuestions(catalog, startCursor, count) {
  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  const safeCount = Math.max(1, Math.trunc(Number(count || 1)));
  const themeSwitchEvery = Math.max(1, Math.trunc(Number(PVP_THEME_SWITCH_EVERY_QUESTIONS || 3)));
  if (!safeCatalog.length) {
    return {
      questions: [],
      nextCursor: normalizePvpSequenceCursorEntry({})
    };
  }

  let topicIndex = Math.min(safeCatalog.length - 1, Math.max(0, Math.trunc(Number(startCursor?.topic_index || 0))));
  let questionIndex = Math.max(0, Math.trunc(Number(startCursor?.question_index || 0)));
  let pickedFromCurrentTopic = 0;
  const picked = [];
  const seenInRun = new Set();
  const totalQuestionsAvailable = safeCatalog.reduce((acc, entry) => acc + entry.questions.length, 0);
  const guardMax = Math.max(
    safeCount * (safeCatalog.length + 3),
    totalQuestionsAvailable + safeCount + safeCatalog.length + 12
  );

  for (let guard = 0; picked.length < safeCount && guard < guardMax; guard += 1) {
    const topicEntry = safeCatalog[topicIndex];
    if (!topicEntry || !topicEntry.questions.length) {
      topicIndex = (topicIndex + 1) % safeCatalog.length;
      questionIndex = 0;
      pickedFromCurrentTopic = 0;
      continue;
    }
    if (questionIndex >= topicEntry.questions.length) {
      topicIndex = (topicIndex + 1) % safeCatalog.length;
      questionIndex = 0;
      pickedFromCurrentTopic = 0;
      continue;
    }

    const question = topicEntry.questions[questionIndex];
    questionIndex += 1;
    const key = buildQuestionStableKeyForSequence(question);
    if (key && seenInRun.has(key)) continue;
    const hasSemanticDuplicate = picked.some((pickedQuestion) => (
      areQuestionsSemanticallyEquivalent(pickedQuestion, question)
    ));
    if (hasSemanticDuplicate) continue;
    if (key) seenInRun.add(key);
    picked.push(question);
    pickedFromCurrentTopic += 1;

    const exhaustedTopic = questionIndex >= topicEntry.questions.length;
    const reachedSwitchLimit = pickedFromCurrentTopic >= themeSwitchEvery;
    if (exhaustedTopic || reachedSwitchLimit) {
      topicIndex = (topicIndex + 1) % safeCatalog.length;
      questionIndex = 0;
      pickedFromCurrentTopic = 0;
    }
  }

  if (safeCatalog.length && questionIndex >= safeCatalog[topicIndex].questions.length) {
    topicIndex = (topicIndex + 1) % safeCatalog.length;
    questionIndex = 0;
  }

  return {
    questions: picked,
    nextCursor: {
      topic_index: topicIndex,
      question_index: questionIndex,
      topic_key: String(safeCatalog[topicIndex]?.topicKey || '').trim()
    }
  };
}

export function pickPvpQuestionSetBySequence(questionsMap, options = {}) {
  const safeDifficulty = normalizeDifficulty(options?.difficulty || 'easy');
  const safeCount = Math.max(1, Math.trunc(Number(options?.count || PVP_ROUNDS_PER_MATCH)));
  const safeArea = String(options?.areaId || '').trim();
  const safeTopic = String(options?.preferredTopic || options?.topic || '').trim();
  const safeLanguage = normalizeLegacyLanguageId(options?.preferredLanguage || options?.language || '', safeTopic);
  const safeCursor = normalizePvpSequenceCursorEntry(options?.cursor);
  const ensureMatchWindow = options?.ensureMatchWindow !== false;
  const safeRecentStartTopicKeys = Array.isArray(options?.recentStartTopicKeys)
    ? options.recentStartTopicKeys
    : [];
  const safeSequenceSeed = resolvePvpSequenceSeed(options?.sequenceSeed, {
    areaId: safeArea,
    difficulty: safeDifficulty,
    languageId: safeLanguage,
    topicId: safeTopic
  });
  const recentQuestionKeys = Array.isArray(options?.recentQuestionKeys) ? options.recentQuestionKeys : [];
  const catalog = buildPvpSequenceTopicCatalog(questionsMap, safeDifficulty, {
    areaId: safeArea,
    languageId: safeLanguage,
    topicId: safeTopic,
    sequenceSeed: safeSequenceSeed,
    recentQuestionKeys
  });

  if (!catalog.length) {
    return {
      questions: [],
      startCursor: normalizePvpSequenceCursorEntry({}),
      nextCursor: normalizePvpSequenceCursorEntry({}),
      areaId: safeArea,
      difficulty: safeDifficulty,
      preferredLanguage: safeLanguage,
      preferredTopic: safeTopic,
      sequenceSeed: safeSequenceSeed,
      resolvedLanguage: safeLanguage,
      resolvedTopic: safeTopic
    };
  }

  const baseTopicIndex = resolvePvpSequenceTopicIndex(catalog, safeCursor);
  // Com histórico, o começo de cada tópico já são as perguntas inéditas: não pula nenhuma.
  const baseQuestionIndex = recentQuestionKeys.length
    ? 0
    : Math.max(0, Math.trunc(Number(safeCursor.question_index || 0)));
  const minimumStartRemaining = ensureMatchWindow
    ? Math.min(safeCount, Math.max(1, Math.trunc(Number(PVP_THEME_SWITCH_EVERY_QUESTIONS || 3))))
    : 1;
  const resolvedStart = resolvePvpSequenceStartCursor(
    catalog,
    baseTopicIndex,
    baseQuestionIndex,
    minimumStartRemaining
  );
  const startEntry = catalog[resolvedStart.topicIndex] || catalog[0];
  const startCursor = resolvePvpSequenceRecentStartCursor(catalog, {
    topic_index: resolvedStart.topicIndex,
    question_index: resolvedStart.questionIndex,
    topic_key: String(startEntry?.topicKey || '').trim()
  }, safeRecentStartTopicKeys, minimumStartRemaining);
  const finalStartEntry = catalog[startCursor.topic_index] || catalog[0];
  const taken = takePvpSequenceQuestions(catalog, startCursor, safeCount);
  const spreadQuestions = spreadPvpQuestionAnswers(taken.questions);

  return {
    questions: spreadQuestions,
    startCursor,
    nextCursor: taken.nextCursor,
    areaId: safeArea,
    difficulty: safeDifficulty,
    preferredLanguage: safeLanguage,
    preferredTopic: safeTopic,
    sequenceSeed: safeSequenceSeed,
    resolvedLanguage: String(finalStartEntry?.language || safeLanguage || ''),
    resolvedTopic: String(finalStartEntry?.topic || safeTopic || '')
  };
}

export function hasPvpMatchSequenceMetadata(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (String(row.pvp_sequence_start_topic_key || '').trim()) return true;
  return Number.isFinite(Number(row.pvp_sequence_start_topic_index));
}

export function buildPvpQuestionSetFromMatchSequence(matchRow, roundCount) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeRoundCount = Math.max(1, Math.trunc(Number(roundCount || 1)));
  const sequenceDifficulty = normalizeDifficulty(
    row.pvp_sequence_difficulty || row.difficulty || 'easy'
  );
  const sequenceArea = String(
    row.pvp_sequence_area
    || row.knowledge_area
    || resolveKnowledgeAreaByLanguageId(row.language || '')
    || ''
  ).trim();
  const preferredLanguage = String(
    row.pvp_sequence_pref_language
    || row.language
    || ''
  ).trim();
  const preferredTopic = String(
    row.pvp_sequence_pref_topic
    || row.topic
    || ''
  ).trim();
  const sequence = pickPvpQuestionSetBySequence(QUESTIONS, {
    difficulty: sequenceDifficulty,
    count: safeRoundCount,
    areaId: sequenceArea,
    preferredLanguage,
    preferredTopic,
    sequenceSeed: String(row.pvp_sequence_seed || '').trim(),
    ensureMatchWindow: false,
    cursor: {
      topic_index: Number(row.pvp_sequence_start_topic_index || 0),
      question_index: Number(row.pvp_sequence_start_question_index || 0),
      topic_key: String(row.pvp_sequence_start_topic_key || '').trim()
    }
  });
  return Array.isArray(sequence.questions) ? sequence.questions : [];
}

export const PVP_DIFFICULTY_STEPS = Object.freeze(['easy', 'medium', 'hard']);
export const PVP_TIEBREAK_QUESTIONS_PER_DIFFICULTY = 12;

// Desempate do PvP: cada nível sobe uma dificuldade a partir da escolhida para a
// partida (Iniciante -> Intermediário -> Avançado) e para no Avançado.
export function getPvpTiebreakDifficulty(baseDifficulty = 'easy', tiebreakLevel = 0) {
  const baseIndex = Math.max(0, PVP_DIFFICULTY_STEPS.indexOf(normalizeDifficulty(baseDifficulty)));
  const level = Math.max(0, Math.trunc(Number(tiebreakLevel || 0)));
  return PVP_DIFFICULTY_STEPS[Math.min(PVP_DIFFICULTY_STEPS.length - 1, baseIndex + level)];
}

export function getPvpTiebreakDifficulties(baseDifficulty = 'easy') {
  const difficulties = [];
  for (let level = 1; level < PVP_DIFFICULTY_STEPS.length; level += 1) {
    const difficulty = getPvpTiebreakDifficulty(baseDifficulty, level);
    if (!difficulties.includes(difficulty)) difficulties.push(difficulty);
  }
  return difficulties;
}

// Perguntas reservadas para o desempate dos modos em grupo, por dificuldade. Ficam
// gravadas na partida, então todos os aparelhos usam as mesmas, e nenhuma repete
// as perguntas da partida normal.
export function buildPvpTiebreakQuestionSets(questionsMap, options = {}) {
  const baseDifficulty = normalizeDifficulty(options?.difficulty || 'easy');
  const perDifficulty = Math.max(1, Math.trunc(Number(options?.count || PVP_TIEBREAK_QUESTIONS_PER_DIFFICULTY)));
  const used = Array.isArray(options?.excludeQuestions) ? [...options.excludeQuestions] : [];
  const seed = String(options?.sequenceSeed || '').trim() || 'pvp';
  const sets = {};
  getPvpTiebreakDifficulties(baseDifficulty).forEach((difficulty) => {
    const sequence = pickPvpQuestionSetBySequence(questionsMap, {
      difficulty,
      count: perDifficulty + used.length,
      areaId: options?.areaId,
      preferredLanguage: options?.language,
      preferredTopic: options?.topic,
      sequenceSeed: `${seed}::tiebreak::${difficulty}`,
      ensureMatchWindow: false,
      recentQuestionKeys: options?.recentQuestionKeys
    });
    const picked = (Array.isArray(sequence.questions) ? sequence.questions : [])
      .filter((question) => !used.some((current) => areQuestionsSemanticallyEquivalent(current, question)))
      .slice(0, perDifficulty)
      .map((question) => ({ ...question, difficulty }));
    if (!picked.length) return;
    sets[difficulty] = picked;
    used.push(...picked);
  });
  return sets;
}

// Pergunta de desempate do confronto: anda pela lista da dificuldade pelo número do
// confronto, então todos os aparelhos chegam à mesma pergunta.
export function pickPvpTiebreakQuestion(tiebreakSets = null, difficulty = 'easy', battleNo = 1) {
  const list = Array.isArray(tiebreakSets?.[normalizeDifficulty(difficulty)])
    ? tiebreakSets[normalizeDifficulty(difficulty)]
    : [];
  if (!list.length) return null;
  const index = Math.max(1, Math.floor(Number(battleNo || 1))) - 1;
  return list[index % list.length] || null;
}

export function getPvpTiebreakDifficultyLabel(difficulty = 'easy') {
  return DIFFICULTY_LABELS[normalizeDifficulty(difficulty)] || DIFFICULTY_LABELS.easy;
}

export function buildShopFallbackFromProfile(profileRow = null) {
  const safe = profileRow && typeof profileRow === 'object' ? profileRow : {};
  const equipped = {
    frame: String(safe.equipped_frame || 'frame_default'),
    background: String(safe.equipped_background || 'bg_default'),
    emoji: String(safe.equipped_emoji || 'emoji_profile')
  };
  return normalizeShopData({
    owned: [
      'frame_default',
      'bg_default',
      'emoji_profile',
      equipped.frame,
      equipped.background,
      equipped.emoji
    ],
    equipped,
    // Data desconhecida: só decide quando faltar informação dos outros lados.
    updatedAt: 0
  });
}

export function getRandomBotMatchDelayMs(minSeconds = 1, maxSeconds = 12) {
  const minMs = Math.max(0, Math.trunc(Number(minSeconds || 0) * 1000));
  const maxMs = Math.max(minMs, Math.trunc(Number(maxSeconds || 12) * 1000));
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

export function formatBuildBadgeValue(buildSha = '', builtAt = '') {
  const safeBuiltAt = String(builtAt || '').trim();
  const builtAtMs = Date.parse(safeBuiltAt);
  const fallbackDate = new Date();
  const dateToFormat = Number.isFinite(builtAtMs) && builtAtMs > 0
    ? new Date(builtAtMs)
    : fallbackDate;

  try {
    const day = dateToFormat.toLocaleDateString('pt-BR', {
      day: '2-digit'
    });
    const month = dateToFormat.toLocaleDateString('pt-BR', {
      month: 'long'
    });
    const year = dateToFormat.toLocaleDateString('pt-BR', {
      year: 'numeric'
    });
    const hour = dateToFormat.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `Atualizado em ${day} de ${month} de ${year} às ${hour}`;
  } catch {
    return 'Atualizado em -- de -- de ---- às --:--';
  }
}

export function buildQueueSessionId(userId = '', nowMs = Date.now()) {
  const safeUserId = String(userId || '').trim() || 'anonymous';
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const suffix = Math.floor(Math.random() * 100000);
  return `${safeUserId}_${safeNowMs}_${suffix}`;
}

export const PVP_QUEUE_BOT_FIRST_THRESHOLD_MS = 15000;
export const PVP_QUEUE_BOT_FIRST_WINDOW_MAX_MS = 24000;
export const PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS = 2.5;
export const PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS = 9;
export const PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS = 2;
export const PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS = 6;
export const PVP_QUEUE_BOT_POST_THRESHOLD_RETRY_MAX_SECONDS = 2;
export const PVP_QUEUE_BOT_HARD_DEADLINE_MS = PVP_QUEUE_BOT_FIRST_WINDOW_MAX_MS;
export const PVP_QUEUE_RESUME_MODE_REFUSAL = 'requeue_after_refusal';
export const PVP_QUEUE_BOT_NEAR_DUE_PRIORITIZE_MS = 8000;
export const PVP_MATCH_ACCEPT_TIMEOUT_MS = 15000;
export const PVP_MATCH_FOUND_TRANSITION_MS = 1400;
export const PVP_MATCH_START_DELAY_MS = 2000;
export const PVP_MATCH_REJECT_RESOLVE_DELAY_MS = 800;
export const PVP_BOT_DECISION_DELAY_MIN_MS = 800;
export const PVP_BOT_DECISION_DELAY_MAX_MS = 1800;
export const PVP_BOT_DECISION_POST_TRANSITION_BUFFER_MS = 650;
export const PVP_ROUND_RESULT_DURATION_MS = 5000;
export const PVP_ROUND_EXTRA_ANSWER_MS = 3000;
export const PVP_THEME_SWITCH_EVERY_QUESTIONS = 3;
export const PVP_EMOJI_SPAM_WINDOW_MS = 1000;
export const PVP_EMOJI_SPAM_BURST_LIMIT = 3;
export const PVP_EMOJI_SPAM_COOLDOWN_MS = 2000;
// Quanto tempo cada emoji enviado fica na tela (a animação usa o mesmo valor).
export const PVP_EMOJI_FX_DURATION_MS = 2600;
// Os emojis chegam pelo polling do banco em lotes. Cada remetente é reproduzido no
// ritmo em que mandou, com um respiro mínimo entre dois emojis seus, e um atraso
// grande demais (aba em segundo plano, histórico) é descartado em vez de acumular.
export const PVP_EMOJI_REPLAY_MIN_GAP_MS = 340;
export const PVP_EMOJI_REPLAY_MAX_GAP_MS = 1400;
export const PVP_EMOJI_REPLAY_MAX_BACKLOG_MS = 3200;
export const PVP_MODE_DUEL = 'duel';
export const PVP_MODE_TEAM_BATTLE = 'team_battle';
export const PVP_MODE_ELIMINATION = 'elimination';
export const PVP_TEAM_ROOM_SIDE_CAPACITY = 2;
export const PVP_TEAM_BATTLE_ROUNDS_PER_BLOCK = 3;
export const PVP_TEAM_BATTLE_BLOCK_COUNT = 4;
export const PVP_TEAM_BATTLE_TOTAL_ROUNDS = PVP_TEAM_BATTLE_ROUNDS_PER_BLOCK * PVP_TEAM_BATTLE_BLOCK_COUNT;
export const PVP_ELIMINATION_ROOM_CAPACITY = 4;
export const PVP_ELIMINATION_ROUNDS_PER_CYCLE = 3;
export const PVP_ELIMINATION_MAX_TOTAL_BATTLES = 12;
export const PVP_ELIMINATION_BATTLE_INTRO_MS = 2500;
export const PVP_ELIMINATION_QUEUE_RETRY_MS = 900;
export const PVP_ELIMINATION_QUEUE_BOT_FILL_MIN_ELAPSED_MS = PVP_QUEUE_BOT_FIRST_THRESHOLD_MS;
export const PVP_ELIMINATION_QUEUE_BOT_FILL_RETRY_MS = 1100;
export const PVP_ELIMINATION_QUEUE_BOT_REFUSAL_CHANCE = 0.2;
export const PVP_ELIMINATION_ACCEPT_TIMEOUT_MS = PVP_MATCH_ACCEPT_TIMEOUT_MS;
export const PVP_ELIMINATION_ACCEPT_START_DELAY_MS = PVP_MATCH_START_DELAY_MS;
export const PVP_ELIMINATION_REJECT_RESOLVE_DELAY_MS = PVP_MATCH_REJECT_RESOLVE_DELAY_MS;
export const DATA_SUBSCRIBE_RETRY_TIMEOUT_MS = 3000;
export const DATA_SUBSCRIBE_MAX_RETRIES = 3;
export const DATA_SUBSCRIBE_RETRY_DELAY_MS = 260;

export function buildPvpTeamRoomId(userId = '') {
  const safeUserId = String(userId || '').trim() || 'room';
  return `pvp_team_room_${safeUserId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function buildPvpTeamMatchId(roomId = '') {
  const safeRoomId = String(roomId || '').trim() || 'team';
  return `pvp_team_match_${safeRoomId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function hashPvpTeamRoomPassword(password = '') {
  const normalized = String(password || '').trim();
  if (!normalized) return '';
  const hash = hashStringToPositiveInt(`codequiz_team_room_v1::${normalized.toLowerCase()}`);
  return `pvp_team_pw_${hash.toString(36)}_${normalized.length.toString(36)}`;
}

export function normalizePvpTeamRoomName(value = '') {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);
}

export function normalizePvpTeamRoomNameForCompare(value = '') {
  return normalizePvpTeamRoomName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getPvpTeamMembersBySide(source = null, side = 'red') {
  const key = side === 'blue' ? 'blue_members' : 'red_members';
  const list = Array.isArray(source?.[key]) ? source[key] : [];
  return list
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      ...entry,
      user_id: String(entry.user_id || '').trim()
    }))
    .filter((entry) => !!entry.user_id)
    .slice(0, PVP_TEAM_ROOM_SIDE_CAPACITY);
}

export function getPvpTeamUserSide(source = null, userId = '') {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return '';
  if (getPvpTeamMembersBySide(source, 'red').some((member) => member.user_id === safeUserId)) return 'red';
  if (getPvpTeamMembersBySide(source, 'blue').some((member) => member.user_id === safeUserId)) return 'blue';
  return '';
}

export function getPvpTeamRoomReadyMemberIds(roomRow = null) {
  const memberIds = new Set([
    ...getPvpTeamMembersBySide(roomRow, 'red').map((member) => String(member?.user_id || '').trim()),
    ...getPvpTeamMembersBySide(roomRow, 'blue').map((member) => String(member?.user_id || '').trim())
  ].filter(Boolean));
  const source = Array.isArray(roomRow?.ready_member_ids) ? roomRow.ready_member_ids : [];
  const readyIds = [];
  const seen = new Set();
  source.forEach((entry) => {
    const userId = String(entry || '').trim();
    if (!userId || seen.has(userId) || !memberIds.has(userId)) return;
    seen.add(userId);
    readyIds.push(userId);
  });
  return readyIds;
}

export function isPvpTeamRoomMemberReady(roomRow = null, userId = '') {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return false;
  if (isSystemBotUserId(safeUserId)) return getPvpTeamUserSide(roomRow, safeUserId) !== '';
  return getPvpTeamRoomReadyMemberIds(roomRow).includes(safeUserId);
}

// Quando o membro aparece como pronto na sala 2x2: 0 = já está pronto, null = não marcou.
// Jogador do sistema fica pronto alguns segundos depois de entrar, como uma pessoa faria.
// O atraso sai do id e da hora de entrada, então todos na sala veem o mesmo momento.
export function getPvpTeamMemberReadyAtMs(roomRow = null, member = null) {
  const userId = String(member?.user_id || '').trim();
  if (!userId) return null;
  if (getPvpTeamRoomReadyMemberIds(roomRow).includes(userId)) return 0;
  if (!isSystemBotUserId(userId)) return null;
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = ((hash * 31) + userId.charCodeAt(index)) >>> 0;
  }
  return Math.max(0, Number(member?.joined_at_ms || 0)) + 2500 + (hash % 4500);
}

export function getPvpTeamRoomLaunchCheck(roomRow = null) {
  const room = roomRow && typeof roomRow === 'object' ? roomRow : null;
  const hostUserId = getPvpTeamRoomHostUserId(room);
  const redMembers = getPvpTeamMembersBySide(room, 'red');
  const blueMembers = getPvpTeamMembersBySide(room, 'blue');
  const readyIds = new Set(getPvpTeamRoomReadyMemberIds(room));
  const isFull = redMembers.length === PVP_TEAM_ROOM_SIDE_CAPACITY
    && blueMembers.length === PVP_TEAM_ROOM_SIDE_CAPACITY;
  const waitingReadyMembers = [...redMembers, ...blueMembers].filter((member) => {
    const userId = String(member?.user_id || '').trim();
    if (!userId || userId === hostUserId || isSystemBotUserId(userId)) return false;
    return !readyIds.has(userId);
  });
  return {
    isFull,
    waitingReadyMembers,
    canStart: isFull && waitingReadyMembers.length === 0
  };
}

export function buildPvpTeamRoomStartBlockedNotice(roomRow = null) {
  const room = roomRow && typeof roomRow === 'object' ? roomRow : null;
  const check = getPvpTeamRoomLaunchCheck(room);
  const issues = [];
  if (!check.isFull) {
    issues.push('A sala precisa estar completa com 2 jogadores no Vermelho e 2 jogadores no Azul.');
  }
  if (check.waitingReadyMembers.length) {
    const names = check.waitingReadyMembers
      .map((member) => String(member?.nickname || '').trim() || 'Jogador')
      .slice(0, 4);
    issues.push(`Aguardando ${names.join(', ')} marcar pronto.`);
  }
  return {
    id: `team_room_notice_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    title: 'Ainda não é possível iniciar',
    message: issues.join(' '),
    created_at: new Date().toISOString(),
    created_by_user_id: String(getPvpTeamRoomHostUserId(room) || '').trim()
  };
}

export function getPvpTeamOpponentSide(side = '') {
  return String(side || '').trim().toLowerCase() === 'blue' ? 'red' : 'blue';
}

export function normalizePvpTeamSide(value = '') {
  return String(value || '').trim().toLowerCase() === 'blue' ? 'blue' : 'red';
}

export function buildPvpTeamBattleSchedule(roomRow = null) {
  const redMembers = getPvpTeamMembersBySide(roomRow, 'red');
  const blueMembers = getPvpTeamMembersBySide(roomRow, 'blue');
  if (redMembers.length < PVP_TEAM_ROOM_SIDE_CAPACITY || blueMembers.length < PVP_TEAM_ROOM_SIDE_CAPACITY) {
    return [];
  }

  const blocks = [
    [redMembers[0], blueMembers[0]],
    [redMembers[1], blueMembers[1]],
    [redMembers[0], blueMembers[1]],
    [redMembers[1], blueMembers[0]]
  ];
  const schedule = [];

  blocks.forEach((pair, blockIndex) => {
    for (let roundInBlock = 1; roundInBlock <= PVP_TEAM_BATTLE_ROUNDS_PER_BLOCK; roundInBlock += 1) {
      schedule.push({
        battle_no: schedule.length + 1,
        block_no: blockIndex + 1,
        round_in_block: roundInBlock,
        red_user_id: String(pair?.[0]?.user_id || '').trim(),
        blue_user_id: String(pair?.[1]?.user_id || '').trim()
      });
    }
  });

  return schedule.filter((entry) => entry.red_user_id && entry.blue_user_id);
}

export function getPvpTeamBattleEntry(matchRow = null, battleNo = 1) {
  const schedule = Array.isArray(matchRow?.battle_schedule) && matchRow.battle_schedule.length
    ? matchRow.battle_schedule
    : buildPvpTeamBattleSchedule(matchRow);
  const safeBattleNo = Math.max(1, Math.trunc(Number(battleNo || 1)));
  const entry = schedule.find((row) => Number(row?.battle_no || 0) === safeBattleNo)
    || schedule[(safeBattleNo - 1) % schedule.length]
    || null;
  if (!entry) return null;
  const totalRounds = Math.max(1, Number(matchRow?.total_rounds || PVP_TEAM_BATTLE_TOTAL_ROUNDS));
  return {
    ...entry,
    battle_no: safeBattleNo,
    overtime_round_no: Math.max(0, safeBattleNo - totalRounds)
  };
}

export function getPvpTeamResultForUser(matchRow = null, userId = '') {
  const side = getPvpTeamUserSide(matchRow, userId);
  const winnerSide = String(matchRow?.winner_side || '').trim().toLowerCase();
  if (!side) return 'loss';
  if (!winnerSide || winnerSide === 'draw') return 'draw';
  return winnerSide === side ? 'win' : 'loss';
}

export function getPvpTeamRoomStatusLabel(roomRow = null) {
  const status = String(roomRow?.status || '').trim().toLowerCase();
  if (status === 'active') return 'Em partida';
  if (status === 'finished') return 'Encerrada';
  return 'Lobby';
}

export function getPvpEliminationRewardScaleByPlacement(placement = 0) {
  const safePlacement = Math.max(1, Number(placement || 1));
  if (safePlacement <= 1) return 1;
  if (safePlacement === 2) return 0.85;
  if (safePlacement === 3) return 0.65;
  return 0.5;
}

export function clampQueueDelaySeconds(value, fallback = 1, ceiling = 12) {
  const safeFallback = Math.max(1, Math.min(ceiling, Number(fallback || 1)));
  const safe = Number(value);
  if (!Number.isFinite(safe) || safe <= 0) return safeFallback;
  return Math.max(1, Math.min(ceiling, Math.trunc(safe)));
}

export function computeQueueBotMatchAtMs({
  nowMs = Date.now(),
  queueJoinedAtMs = 0,
  queueResumeMode = '',
  currentBotMatchAtMs = 0,
  minSeconds = 1,
  maxSeconds = 12
} = {}) {
  const safeNowMs = Math.max(0, Number(nowMs || Date.now()));
  const safeJoinedAtMs = Math.max(0, Number(queueJoinedAtMs || 0)) || safeNowMs;
  const queueElapsedMs = Math.max(0, safeNowMs - safeJoinedAtMs);
  const safeResumeMode = String(queueResumeMode || '').trim().toLowerCase();
  const hardDeadlineMs = safeJoinedAtMs + PVP_QUEUE_BOT_HARD_DEADLINE_MS;

  if (safeResumeMode === PVP_QUEUE_RESUME_MODE_REFUSAL) {
    return safeNowMs + getRandomBotMatchDelayMs(
      PVP_QUEUE_BOT_REFUSAL_DELAY_MIN_SECONDS,
      PVP_QUEUE_BOT_REFUSAL_DELAY_MAX_SECONDS
    );
  }

  // Past the hard deadline: retry immediately (no more waiting)
  if (safeNowMs >= hardDeadlineMs) {
    return safeNowMs;
  }

  if (queueElapsedMs < PVP_QUEUE_BOT_FIRST_THRESHOLD_MS) {
    const remainingToThresholdMs = Math.max(0, PVP_QUEUE_BOT_FIRST_THRESHOLD_MS - queueElapsedMs);
    const firstWindowDelayMs = getRandomBotMatchDelayMs(
      PVP_QUEUE_BOT_FIRST_DELAY_MIN_SECONDS,
      PVP_QUEUE_BOT_FIRST_DELAY_MAX_SECONDS
    );
    return Math.min(hardDeadlineMs, safeNowMs + remainingToThresholdMs + firstWindowDelayMs);
  }

  let safeMinSeconds = clampQueueDelaySeconds(minSeconds, 1, 12);
  let safeMaxSeconds = Math.max(
    safeMinSeconds,
    clampQueueDelaySeconds(maxSeconds, safeMinSeconds, 12)
  );

  // After crossing 15s in queue, keep retries fast to avoid long stalls when a
  // bot is temporarily busy/locked.
  safeMaxSeconds = Math.min(safeMaxSeconds, PVP_QUEUE_BOT_POST_THRESHOLD_RETRY_MAX_SECONDS);
  safeMinSeconds = Math.max(1, Math.min(safeMinSeconds, safeMaxSeconds));

  // Cap retry delay to stay within hard deadline
  const msUntilDeadline = Math.max(0, hardDeadlineMs - safeNowMs);
  const maxSecondsUntilDeadline = Math.max(1, Math.floor(msUntilDeadline / 1000));
  safeMaxSeconds = Math.min(safeMaxSeconds, maxSecondsUntilDeadline);
  safeMinSeconds = Math.min(safeMinSeconds, safeMaxSeconds);

  const nextAtMs = safeNowMs + getRandomBotMatchDelayMs(safeMinSeconds, safeMaxSeconds);
  const currentScheduledAtMs = Math.max(0, Number(currentBotMatchAtMs || 0));
  if (currentScheduledAtMs > safeNowMs) {
    return Math.min(currentScheduledAtMs, nextAtMs);
  }
  return Math.min(hardDeadlineMs, nextAtMs);
}

export const POPULAR_WHATSAPP_EMOJIS = [
  '😂', '🤣', '😏', '🙄', '😈', '🤡', '👎', '🥱', '😬', '🤭',
  '😎', '🔥', '💥', '👀', '😜', '😝', '😹', '🫠', '🧠', '😤',
  '❤️', '😍', '😊', '😘', '🙏', '😭', '👍', '👏', '😁', '😅',
  '🤔', '😢', '🤩', '😴', '😡', '🥳', '🙌', '👌', '🎉', '🤝',
  '💪', '🤯', '🤖', '🤗', '😇', '😋', '😱', '🚀', '💡', '✨',
  '🫶', '😮', '😴', '🤨', '😶', '😑', '😒', '🤫', '🫡', '🥶',
  '🥵', '😵', '🙈', '🙉', '🙊', '😺', '😼', '😸', '😻', '😿',
  '💖', '🤍', '😌', '🌙', '🧐', '🙂', '🤪', '🙃', '🏆', '🤓'
];

export const PVP_EMOJI_PICKER_OPTIONS = Array.from(new Set(
  POPULAR_WHATSAPP_EMOJIS
    .map((emoji) => String(emoji || '').trim())
    .filter((emoji) => !!emoji)
));

export const DEFAULT_BATTLE_EMOJIS = ['🔥', '😎', '😵', '👏', '💡', '🤖'];
export const ENABLE_CLIENT_BOT_AUTOMATION = process.env.NODE_ENV === 'development'
  && String(process.env.NEXT_PUBLIC_ENABLE_CLIENT_BOT_AUTOMATION || '').trim() === '1';
export const MOBILE_UA_PATTERN = /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i;
export const MOBILE_SW_CLEANUP_STORAGE_KEY = 'cq_mobile_sw_cleanup_sha_v2';
export const LAST_CONFIRMED_BUILD_SHA_STORAGE_KEY = 'cq_last_confirmed_build_sha_v1';
// Partida PvP em andamento neste aparelho (por usuário): se a página fechar ou cair,
// ao reabrir o jogador volta para ela ou para a recompensa que ficou sem coletar.
export const ACTIVE_MATCH_STORAGE_KEY_PREFIX = 'cq_active_match_v1:';
export const ACTIVE_MATCH_RESUME_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export function isLikelyMobileWeb() {
  if (typeof navigator === 'undefined') return false;
  const ua = String(navigator.userAgent || navigator.vendor || '').toLowerCase();
  const platform = String(navigator.platform || '');
  const hasTouchPoints = Math.max(0, Number(navigator.maxTouchPoints || 0)) > 1;
  const isIpadDesktopMode = platform === 'MacIntel' && hasTouchPoints;
  return MOBILE_UA_PATTERN.test(ua) || isIpadDesktopMode;
}

export const BOT_PERSONALITY_PRESETS = {
  provocador: {
    label: 'Provocador',
    emojis: ['🔥', '😎', '😂', '😜', '💥', '👀']
  },
  analitico: {
    label: 'Analitico',
    emojis: ['🤔', '💡', '👌', '🤝', '😬', '✨']
  },
  calmo: {
    label: 'Calmo',
    emojis: ['😊', '🙏', '👌', '🤝', '😇', '✨']
  },
  estrategista: {
    label: 'Estrategista',
    emojis: ['🧠', '🤔', '🧐', '💡', '🫡', '✨']
  },
  caotico: {
    label: 'Caotico',
    emojis: ['🤪', '🥳', '😂', '💥', '🔥', '🙃']
  },
  sarcastico: {
    label: 'Sarcastico',
    emojis: ['😉', '😏', '🙄', '🤭', '👎', '😈']
  },
  competitivo: {
    label: 'Competitivo',
    emojis: ['😤', '💪', '🔥', '😎', '🏆', '🚀']
  },
  enigmatico: {
    label: 'Enigmatico',
    emojis: ['🌙', '😶', '🙈', '👀', '✨', '😈']
  },
  visionario: {
    label: 'Visionario',
    emojis: ['🧠', '💡', '🫡', '🤖', '🚀', '✨']
  },
  impulsivo: {
    label: 'Impulsivo',
    emojis: ['⚡', '💥', '🔥', '😤', '🤯', '🚀']
  }
};

export const BOT_STRENGTH_PRESETS = {
  fraco: {
    label: 'Fraco',
    baseAccuracy: 0.5,
    minAccuracy: 0.5,
    maxAccuracy: 0.5,
    clutchBoost: 0,
    responseDelayMinMs: 2800,
    responseDelayMaxMs: 5200
  },
  medio: {
    label: 'Médio',
    baseAccuracy: 0.7,
    minAccuracy: 0.7,
    maxAccuracy: 0.7,
    clutchBoost: 0,
    responseDelayMinMs: 1800,
    responseDelayMaxMs: 3600
  },
  forte: {
    label: 'Forte',
    baseAccuracy: 0.9,
    minAccuracy: 0.9,
    maxAccuracy: 0.9,
    clutchBoost: 0,
    responseDelayMinMs: 900,
    responseDelayMaxMs: 2400
  }
};

export const BOT_EMOJI_POOL_BY_BOT_ID = {
  bot_sys_codequiz_prime: ['😏', '🔥', '🤡', '👀', '😜', '💥'],
  bot_sys_codequiz_orbita: ['🧠', '🤔', '🧐', '💡', '🫡', '✨'],
  bot_sys_codequiz_zefira: ['🤔', '🧠', '💡', '🫡', '✨', '🤓'],
  bot_sys_codequiz_sopro: ['🙂', '🙏', '🫶', '👌', '😌', '✨'],
  bot_sys_codequiz_lua9: ['🤪', '🥳', '😂', '💥', '🔥', '🙃'],
  bot_sys_codequiz_thiagoara: ['😤', '💪', '🔥', '😎', '🏆', '🚀'],
  bot_sys_codequiz_bdevonly: ['🧠', '🤔', '💡', '🫡', '🤓', '✨'],
  bot_sys_codequiz_flakael: ['😉', '😏', '🙄', '🤭', '👎', '😈'],
  bot_sys_codequiz_z3n: ['😏', '😉', '🙄', '🤭', '😈', '👀']
};

export function normalizeBotPersonality(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_PERSONALITY_PRESETS[key]) return key;
  return 'provocador';
}

export function normalizeBotStrength(value) {
  const key = String(value || '').trim().toLowerCase();
  if (BOT_STRENGTH_PRESETS[key]) return key;
  return 'medio';
}

export function getBotEmojiPool(personalityKey, botUserId = '') {
  const safeBotId = String(botUserId || '').trim();
  if (safeBotId && Array.isArray(BOT_EMOJI_POOL_BY_BOT_ID[safeBotId])) {
    return normalizeBattleEmojis(BOT_EMOJI_POOL_BY_BOT_ID[safeBotId]).slice(0, 6);
  }
  const safe = BOT_PERSONALITY_PRESETS[normalizeBotPersonality(personalityKey)];
  return Array.isArray(safe?.emojis) && safe.emojis.length ? safe.emojis.slice(0, 6) : DEFAULT_BATTLE_EMOJIS;
}

export function normalizeBattleEmojis(list) {
  const source = Array.isArray(list) ? list : [];
  const allowed = new Set(POPULAR_WHATSAPP_EMOJIS);
  const picked = [];
  source.forEach((emoji) => {
    const safe = String(emoji || '').trim();
    if (!safe || !allowed.has(safe) || picked.includes(safe)) return;
    if (picked.length >= 6) return;
    picked.push(safe);
  });
  if (picked.length >= 6) return picked;
  DEFAULT_BATTLE_EMOJIS.forEach((emoji) => {
    if (picked.length >= 6 || picked.includes(emoji)) return;
    picked.push(emoji);
  });
  POPULAR_WHATSAPP_EMOJIS.forEach((emoji) => {
    if (picked.length >= 6 || picked.includes(emoji)) return;
    picked.push(emoji);
  });
  return picked.slice(0, 6);
}

export function normalizeEmojiDraftSlots(list) {
  const source = Array.isArray(list) ? list : [];
  const allowed = new Set(POPULAR_WHATSAPP_EMOJIS);
  const slots = Array.from({ length: 6 }, () => '');
  const used = new Set();

  for (let index = 0; index < Math.min(6, source.length); index += 1) {
    const safe = String(source[index] || '').trim();
    if (!safe || !allowed.has(safe) || used.has(safe)) continue;
    slots[index] = safe;
    used.add(safe);
  }

  if (source.length > 6) {
    for (let index = 6; index < source.length; index += 1) {
      const safe = String(source[index] || '').trim();
      if (!safe || !allowed.has(safe) || used.has(safe)) continue;
      const emptyIndex = slots.findIndex((item) => !item);
      if (emptyIndex < 0) break;
      slots[emptyIndex] = safe;
      used.add(safe);
    }
  }

  return slots;
}

export function getMissingEmojiSlotIndexes(list) {
  const slots = normalizeEmojiDraftSlots(list);
  return slots
    .map((emoji, index) => (emoji ? 0 : index + 1))
    .filter((slotIndex) => slotIndex > 0);
}

export function getNextEmptyEmojiSlot(list) {
  const current = normalizeEmojiDraftSlots(list);
  const emptyIndex = current.findIndex((emoji) => !emoji);
  if (emptyIndex < 0) return 5;
  return Math.max(0, Math.min(5, emptyIndex));
}

export function applyEmojiToDraft(list, emoji, slotIndex = null) {
  const safeEmoji = String(emoji || '').trim();
  if (!safeEmoji) return normalizeEmojiDraftSlots(list);
  if (!POPULAR_WHATSAPP_EMOJIS.includes(safeEmoji)) return normalizeEmojiDraftSlots(list);
  const current = normalizeEmojiDraftSlots(list);
  const duplicateIndex = current.findIndex((item) => item === safeEmoji);

  let target = Number.isFinite(Number(slotIndex))
    ? Math.max(0, Math.min(5, Number(slotIndex)))
    : getNextEmptyEmojiSlot(current);

  if (duplicateIndex === target) return current;
  const next = [...current];
  if (duplicateIndex >= 0) {
    next[duplicateIndex] = '';
  }
  next[target] = safeEmoji;
  return normalizeEmojiDraftSlots(next);
}

export function removeEmojiFromDraftByIndex(list, index) {
  const current = normalizeEmojiDraftSlots(list);
  const safeIndex = Math.max(0, Math.min(5, Number(index || 0)));
  if (!Number.isFinite(safeIndex)) return current;
  const next = [...current];
  next[safeIndex] = '';
  return next;
}

// Quando mostrar o próximo emoji de um remetente. `lane` guarda o último emoji dele
// já agendado ({ sentAtMs, showAtMs }) e volta atualizado para a próxima chamada.
export function schedulePvpEmojiReplay(lane = null, sentAtMs = 0, nowMs = Date.now()) {
  const safeNowMs = Math.max(0, Number(nowMs) || 0);
  const safeSentAtMs = Math.max(0, Number(sentAtMs) || 0);
  const lastShowAtMs = Math.max(0, Number(lane?.showAtMs) || 0);
  const lastSentAtMs = Math.max(0, Number(lane?.sentAtMs) || 0);
  if (!lastShowAtMs) {
    return { showAtMs: safeNowMs, drop: false, lane: { sentAtMs: safeSentAtMs, showAtMs: safeNowMs } };
  }
  const sentGapMs = safeSentAtMs && lastSentAtMs ? safeSentAtMs - lastSentAtMs : PVP_EMOJI_REPLAY_MIN_GAP_MS;
  const gapMs = Math.min(PVP_EMOJI_REPLAY_MAX_GAP_MS, Math.max(PVP_EMOJI_REPLAY_MIN_GAP_MS, sentGapMs));
  const showAtMs = Math.max(safeNowMs, lastShowAtMs + gapMs);
  if (showAtMs - safeNowMs > PVP_EMOJI_REPLAY_MAX_BACKLOG_MS) {
    return { showAtMs, drop: true, lane };
  }
  return {
    showAtMs,
    drop: false,
    lane: { sentAtMs: Math.max(safeSentAtMs, lastSentAtMs), showAtMs }
  };
}

// Faixas fixas de cada lado da tela, bem separadas na altura e no recuo para o nome
// de quem mandou caber. O emoji novo vai para a faixa livre mais baixa; com todas
// ocupadas, reaproveita a faixa cujo último emoji já está mais adiantado na animação.
export const PVP_EMOJI_FX_LANES = [
  { topPct: 60, offsetPx: 0 },
  { topPct: 47, offsetPx: 48 },
  { topPct: 34, offsetPx: 14 },
  { topPct: 21, offsetPx: 62 }
];

export function pickPvpEmojiFxLane(currentFx = [], side = 'right') {
  const safeSide = side === 'left' ? 'left' : 'right';
  const sameSide = (Array.isArray(currentFx) ? currentFx : []).filter((item) => item?.side === safeSide);
  const newestShownAtByLane = PVP_EMOJI_FX_LANES.map((_, laneIndex) => sameSide
    .filter((item) => Number(item?.lane) === laneIndex)
    .reduce((latest, item) => Math.max(latest, Number(item?.shownAtMs) || 1), 0));
  let laneIndex = newestShownAtByLane.findIndex((shownAtMs) => shownAtMs === 0);
  if (laneIndex < 0) {
    laneIndex = newestShownAtByLane.reduce((best, shownAtMs, index) => (
      shownAtMs < newestShownAtByLane[best] ? index : best
    ), 0);
  }
  return { lane: laneIndex, ...PVP_EMOJI_FX_LANES[laneIndex] };
}

// Emojis de cada clima do momento. O bot prefere os do próprio repertório que
// combinam com o clima e, às vezes, usa um emoji comum dele (como uma pessoa faria).
export const BOT_EMOJI_MOODS = {
  celebrate: ['🔥', '😎', '🏆', '🥳', '💪', '🚀', '🎉', '😏', '🤩'],
  lament: ['😵', '😤', '🤯', '😅', '🙃', '😭', '😬', '🫠'],
  tease: ['😏', '👀', '🤭', '😈', '😜', '🙄', '🤡'],
  cheer: ['👏', '💪', '🔥', '🫶', '🙌', '👍', '🤝'],
  think: ['🤔', '🧠', '🧐', '💡', '😬', '🫡'],
  gg: ['🤝', '👏', '👍', '🫡', '😊', '🙌']
};

export function pickBotMoodEmoji(botUserId = '', mood = '', random = Math.random, personality = 'provocador') {
  const pool = getBotEmojiPool(personality, botUserId);
  const pick = (list) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
  const moodEmojis = BOT_EMOJI_MOODS[mood];
  if (!Array.isArray(moodEmojis)) return pick(pool);
  const own = pool.filter((emoji) => moodEmojis.includes(emoji));
  if (own.length) return random() < 0.75 ? pick(own) : pick(moodEmojis);
  return random() < 0.8 ? pick(moodEmojis) : pick(pool);
}

// Estilo de jogo dos bots nas partidas contra pessoas (duelo, 2x2 e Um contra todos).
// - elite: os melhores do jogo, 90% de acerto do começo ao fim.
// - competitivo: acompanha o placar. Com vantagem relaxa, atrás aperta e, na reta final
//   com placar apertado, fica mais concentrado. A partida tende a se decidir no fim.
// - oscilante: mais humano, tem dias bons e ruins e dá espaço para viradas.
// Tudo é sorteio fixo por partida/bot/rodada: todos os aparelhos chegam à mesma resposta.
export const BOT_PLAY_STYLES = {
  elite: {
    label: 'Elite',
    adaptive: false,
    timingStrength: 'forte'
  },
  competitivo: {
    label: 'Competitivo',
    adaptive: true,
    timingStrength: 'medio',
    base: 0.75,
    form: 0.04,
    easePerPoint: 0.08,
    maxEase: 0.22,
    pushPerPoint: 0.05,
    maxPush: 0.12,
    clutch: 0.05,
    min: 0.52,
    max: 0.9
  },
  oscilante: {
    label: 'Oscilante',
    adaptive: true,
    timingStrength: 'medio',
    base: 0.67,
    form: 0.08,
    easePerPoint: 0.09,
    maxEase: 0.26,
    pushPerPoint: 0.06,
    maxPush: 0.14,
    clutch: 0.03,
    min: 0.42,
    max: 0.86
  }
};

export const BOT_PLAY_STYLE_BY_BOT_ID = {
  bot_sys_codequiz_thiagoara: 'elite',
  bot_sys_codequiz_bdevonly: 'elite',
  bot_sys_codequiz_orbita: 'elite',
  bot_sys_codequiz_prime: 'competitivo',
  bot_sys_codequiz_zefira: 'competitivo',
  bot_sys_codequiz_flakael: 'competitivo',
  bot_sys_codequiz_sopro: 'oscilante',
  bot_sys_codequiz_lua9: 'oscilante',
  bot_sys_codequiz_z3n: 'oscilante'
};

export function getBotPlayStyleKey(botUserId = '') {
  return BOT_PLAY_STYLE_BY_BOT_ID[String(botUserId || '').trim()] || '';
}

// Acerto do bot nesta rodada, ou null quando o bot joga com acerto fixo (elite ou
// bot sem estilo). Placar: o do bot (ou do time dele) contra o do adversário.
export function getBotAdaptiveAccuracy(botUserId = '', context = {}) {
  const safeBotId = String(botUserId || '').trim();
  const style = BOT_PLAY_STYLES[getBotPlayStyleKey(safeBotId)];
  if (!style?.adaptive) return null;
  const matchId = String(context?.matchId || '').trim();
  const roundNo = Math.max(1, Math.trunc(Number(context?.roundNo || 1)));
  const totalRounds = Math.max(roundNo, Math.trunc(Number(context?.totalRounds || roundNo)));
  const botScore = Number(context?.botScore);
  const opponentScore = Number(context?.opponentScore);
  // Bot contra bot (eliminatória) não se ajusta: o placar só fica parelho contra pessoas.
  const lead = context?.opponentIsBot === true || !Number.isFinite(botScore) || !Number.isFinite(opponentScore)
    ? 0
    : botScore - opponentScore;

  const formRoll = matchId ? getBotSeededUnit(`bot_form:${matchId}:${safeBotId}`) : 0.5;
  let accuracy = style.base + (formRoll * 2 - 1) * style.form;
  if (lead > 0) accuracy -= Math.min(style.maxEase, lead * style.easePerPoint);
  if (lead < 0) accuracy += Math.min(style.maxPush, -lead * style.pushPerPoint);
  // Reta final empatada ou com o bot um ponto atrás: ele se concentra e briga até o fim.
  if (totalRounds - roundNo <= 1 && lead <= 0 && lead >= -1) accuracy += style.clutch;
  return Math.max(style.min, Math.min(style.max, accuracy));
}

// Força usada para o tempo de resposta (o estilo pode responder num ritmo diferente).
export function getBotTimingStrength(botUserId = '', fallbackStrength = 'medio') {
  const style = BOT_PLAY_STYLES[getBotPlayStyleKey(botUserId)];
  return normalizeBotStrength(style?.timingStrength || fallbackStrength);
}

export function getBotStrengthPreset(botStrength = 'medio') {
  const safeStrength = normalizeBotStrength(botStrength);
  return BOT_STRENGTH_PRESETS[safeStrength] || BOT_STRENGTH_PRESETS.medio;
}

export function getBotStrengthLabel(botStrength = 'medio') {
  const preset = getBotStrengthPreset(botStrength);
  return String(preset?.label || BOT_STRENGTH_PRESETS.medio.label);
}

export function hashBotSeed(value = '') {
  const input = String(value || '');
  let hash = 7;
  for (let idx = 0; idx < input.length; idx += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(idx)) | 0;
  }
  const normalized = Math.abs(hash) % 2147483646;
  return normalized + 1;
}

export function createBotSeededRandom(seedValue) {
  let seed = Math.floor(Number(seedValue || 1)) % 2147483647;
  if (seed <= 0) seed += 2147483646;
  return () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
}

// Número fixo entre 0 e 1 para a chave. Chaves parecidas (rodada 1, 2, 3...) davam
// números quase iguais no gerador simples e o bot errava sempre na mesma rodada; a
// mistura final (murmur3) faz cada chave virar um número independente.
export function getBotSeededUnit(key = '') {
  let hash = hashBotSeed(key) | 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

// Sequência de acertos de um bot com acerto fixo na partida: o total fica colado na
// taxa (9 de 10 com 90%) e os erros caem em rodadas sorteadas, sem padrão para decorar.
export function resolveDeterministicBotRun(seedKey, targetAccuracy, totalSteps, targetStep = totalSteps) {
  const safeSteps = Math.max(1, Math.trunc(Number(totalSteps || 1)));
  const safeTargetStep = Math.max(1, Math.min(safeSteps, Math.trunc(Number(targetStep || safeSteps))));
  const safeTargetAccuracy = Math.max(0.01, Math.min(0.99, Number(targetAccuracy || 0)));
  const expectedHits = safeTargetAccuracy * safeSteps;
  const totalHits = Math.floor(expectedHits)
    + (getBotSeededUnit(`${seedKey}:extra`) < expectedHits - Math.floor(expectedHits) ? 1 : 0);
  const missSteps = new Set(
    Array.from({ length: safeSteps }, (_, index) => index + 1)
      .map((step) => ({ step, order: getBotSeededUnit(`${seedKey}:order:${step}`) }))
      .sort((a, b) => a.order - b.order || a.step - b.step)
      .slice(0, safeSteps - totalHits)
      .map((entry) => entry.step)
  );
  let streak = 0;
  let bestStreak = 0;
  for (let step = 1; step <= safeSteps; step += 1) {
    streak = missSteps.has(step) ? 0 : streak + 1;
    bestStreak = Math.max(bestStreak, streak);
  }

  return {
    correctCount: totalHits,
    bestStreak,
    hitAtStep: !missSteps.has(safeTargetStep)
  };
}

export function getBotAccuracyByStrength(botStrength = 'medio', _context = {}) {
  const safeStrength = normalizeBotStrength(botStrength);
  const preset = getBotStrengthPreset(safeStrength);
  return Math.max(0.01, Math.min(0.99, Number(preset?.baseAccuracy || BOT_STRENGTH_PRESETS.medio.baseAccuracy)));
}

export function getBotAnswerDelayMs() {
  // Keep bot answer timing independent from player actions/strength.
  return getRandomBotMatchDelayMs(0.7, 2.2);
}

export function pickBotAnswerIndex(question, botStrength = 'medio', context = {}) {
  const safeQuestion = question && typeof question === 'object' ? question : {};
  const options = Array.isArray(safeQuestion.opts) ? safeQuestion.opts : [];
  const optionsCount = options.length;
  if (!optionsCount) return -1;

  const correctIndex = Math.max(0, Math.min(optionsCount - 1, Number(safeQuestion.answer || 0)));
  const safeStrength = normalizeBotStrength(botStrength);
  const accuracy = getBotAccuracyByStrength(safeStrength, context);
  const roundNo = Math.max(1, Math.trunc(Number(context?.roundNo || 1)));
  const totalRounds = Math.max(roundNo, Math.trunc(Number(context?.totalRounds || 5)));
  const matchId = String(context?.matchId || '').trim();
  const botUserId = String(context?.botUserId || '').trim();
  const seedBase = matchId && botUserId
    ? `pvp:${matchId}:${botUserId}:${safeStrength}`
    : `pvp:${safeStrength}:${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  // Bots de estilo competitivo/oscilante ajustam o acerto ao placar de cada rodada;
  // os de elite seguem a sequência fixa de 90% da partida.
  const adaptiveAccuracy = matchId && botUserId
    ? getBotAdaptiveAccuracy(botUserId, { ...context, matchId, roundNo, totalRounds })
    : null;
  const shouldHit = adaptiveAccuracy !== null
    ? getBotSeededUnit(`${seedBase}:adaptive:${roundNo}`) < adaptiveAccuracy
    : resolveDeterministicBotRun(seedBase, accuracy, totalRounds, roundNo).hitAtStep;
  if (shouldHit) return correctIndex;

  const wrongIndexes = Array.from({ length: optionsCount }, (_, idx) => idx).filter((idx) => idx !== correctIndex);
  if (!wrongIndexes.length) return correctIndex;
  const wrongRoll = getBotSeededUnit(`${seedBase}:wrong:${roundNo}`);
  return wrongIndexes[Math.floor(wrongRoll * wrongIndexes.length)];
}

export function buildRewardParticleBurst({ xp = 0, coins = 0, origin = null }) {
  const rewardXp = Math.max(0, Number(xp || 0));
  const rewardCoins = Math.max(0, Number(coins || 0));
  const hasWindow = typeof window !== 'undefined';
  const baseX = Number(origin?.x || (hasWindow ? window.innerWidth * 0.5 : 240));
  const baseY = Number(origin?.y || (hasWindow ? window.innerHeight * 0.78 : 580));

  const coinCount = rewardCoins > 0 ? Math.max(18, Math.min(180, Math.round(rewardCoins * 2.8 + rewardXp * 0.2))) : 0;
  const xpCount = rewardXp > 0 ? Math.max(16, Math.min(160, Math.round(rewardXp * 1.85 + rewardCoins * 0.25))) : 0;
  const particles = [];

  const pushParticle = (kind, index, delay, phase = 'main') => {
    const isCoin = kind === 'coin';
    const id = `${kind}_${Date.now()}_${index}_${Math.floor(Math.random() * 9999)}`;
    const isTail = phase === 'tail';
    const spread = isTail
      ? (isCoin ? 16 : 20)
      : (isCoin ? 22 : 26);
    const dx = (Math.random() - 0.5) * (isTail
      ? (isCoin ? 170 : 210)
      : (isCoin ? 220 : 260));
    const dy = -(isTail
      ? (260 + Math.random() * (isCoin ? 200 : 240))
      : (220 + Math.random() * (isCoin ? 240 : 280)));
    const drift = (Math.random() - 0.5) * (isTail
      ? (isCoin ? 30 : 42)
      : (isCoin ? 40 : 52));
    const duration = Math.round((isTail
      ? (isCoin ? 1200 : 1400)
      : (isCoin ? 1450 : 1700)) + Math.random() * (isTail ? 620 : 820));
    const size = (isTail
      ? (isCoin ? 16 : 12)
      : (isCoin ? 18 : 14)) + Math.random() * (isTail ? 6 : (isCoin ? 9 : 7));
    particles.push({
      id,
      kind,
      icon: isCoin ? '🪙' : '✦',
      x: baseX + (Math.random() - 0.5) * spread,
      y: baseY + (Math.random() - 0.5) * 16,
      dx,
      dy,
      drift,
      delay,
      duration,
      size,
      rotate: Math.round((Math.random() - 0.5) * 36)
    });
  };

  let remainingCoins = coinCount;
  let remainingXp = xpCount;
  let delayCursor = 0;
  let sequenceIndex = 0;

  while (remainingCoins > 0 || remainingXp > 0) {
    const totalRemaining = remainingCoins + remainingXp;
    const pickCoin = remainingCoins > 0 && (
      remainingXp <= 0 || Math.random() < (remainingCoins / Math.max(1, totalRemaining))
    );

    const kind = pickCoin ? 'coin' : 'xp';
    if (kind === 'coin') remainingCoins -= 1;
    else remainingXp -= 1;

    // Particulas nascem em sequencia curta, mantendo sobreposicao para efeito de volume.
    const stepMin = kind === 'coin' ? 12 : 14;
    const stepMax = kind === 'coin' ? 24 : 28;
    const step = stepMin + Math.floor(Math.random() * (stepMax - stepMin + 1));
    delayCursor += step;

    pushParticle(kind, sequenceIndex, delayCursor);
    sequenceIndex += 1;
  }

  const tailCoinCount = Math.max(2, Math.min(14, Math.round(coinCount * 0.12)));
  const tailXpCount = Math.max(2, Math.min(12, Math.round(xpCount * 0.12)));
  let tailCoinsRemaining = coinCount > 0 ? tailCoinCount : 0;
  let tailXpRemaining = xpCount > 0 ? tailXpCount : 0;
  let tailCursor = delayCursor + Math.round(110 + Math.random() * 80);

  while (tailCoinsRemaining > 0 || tailXpRemaining > 0) {
    const totalTailRemaining = tailCoinsRemaining + tailXpRemaining;
    const pickTailCoin = tailCoinsRemaining > 0 && (
      tailXpRemaining <= 0 || Math.random() < (tailCoinsRemaining / Math.max(1, totalTailRemaining))
    );
    const tailKind = pickTailCoin ? 'coin' : 'xp';
    if (tailKind === 'coin') tailCoinsRemaining -= 1;
    else tailXpRemaining -= 1;

    const tailStep = tailKind === 'coin'
      ? 16 + Math.floor(Math.random() * 14)
      : 18 + Math.floor(Math.random() * 16);
    tailCursor += tailStep;
    pushParticle(tailKind, sequenceIndex, tailCursor, 'tail');
    sequenceIndex += 1;
  }

  return particles;
}

export function getPvpRewardsByDifficulty(difficulty, resultKey) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeResult = String(resultKey || '').trim().toLowerCase();
  const xpRow = PVP_XP_REWARD[safeDifficulty] || PVP_XP_REWARD.easy;
  const coinsRow = PVP_COINS_REWARD[safeDifficulty] || PVP_COINS_REWARD.easy;
  return {
    xp: Math.max(0, Number(xpRow[safeResult] || 0)),
    coins: Math.max(0, Number(coinsRow[safeResult] || 0))
  };
}

export function getMatchPlayerAcceptState(matchRow, userId) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const uid = String(userId || '').trim();
  if (!uid) return 'pending';
  if (uid === String(row.player1_user_id || '').trim()) {
    return String(row.player1_accept_state || 'pending').trim().toLowerCase() || 'pending';
  }
  if (uid === String(row.player2_user_id || '').trim()) {
    return String(row.player2_accept_state || 'pending').trim().toLowerCase() || 'pending';
  }
  return 'pending';
}

export function shouldResumeQueueAfterMatchRefused(matchRow, userId) {
  const flow = getMatchRefusalQueueFlow(matchRow, userId);
  return flow.shouldResume;
}

export function getMatchRefusalQueueFlow(matchRow, userId) {
  const uid = String(userId || '').trim();
  if (!uid) {
    return {
      endedReason: '',
      acceptState: 'pending',
      shouldResume: false,
      queueCanceled: false
    };
  }

  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const endedReason = String(row.ended_reason || '').trim().toLowerCase();
  const acceptState = getMatchPlayerAcceptState(row, uid);
  if (endedReason !== 'match_refused' && endedReason !== 'accept_timeout') {
    return {
      endedReason,
      acceptState,
      shouldResume: false,
      queueCanceled: false
    };
  }

  const endedBy = String(row.ended_by_user_id || '').trim();
  const explicitlyRejected = acceptState === 'rejected';
  const explicitlyAccepted = acceptState === 'accepted';
  const leftByExit = endedBy && endedBy === uid && !explicitlyRejected;

  if (endedReason === 'match_refused') {
    const queueCanceled = explicitlyRejected || leftByExit;
    return {
      endedReason,
      acceptState,
      shouldResume: !queueCanceled,
      queueCanceled
    };
  }

  const shouldResume = explicitlyAccepted;
  return {
    endedReason,
    acceptState,
    shouldResume,
    queueCanceled: !shouldResume
  };
}

export function getMatchRefusalQueueStatusText(matchRow, userId, { resumed = false } = {}) {
  const flow = getMatchRefusalQueueFlow(matchRow, userId);
  if (flow.endedReason === 'accept_timeout') {
    if (resumed) return 'Tempo de aceite do oponente esgotado. Você voltou para a fila.';
    if (flow.queueCanceled) return 'Tempo de aceite esgotado. Sua fila foi cancelada.';
    return 'Tempo de aceite esgotado. Voltando para a arena.';
  }
  if (flow.endedReason === 'match_refused') {
    if (resumed) return 'Confronto recusado. Você voltou para a fila.';
    if (flow.queueCanceled) return 'Confronto recusado. Sua fila foi cancelada.';
    return 'Confronto recusado. Voltando para a arena.';
  }
  return 'Confronto encerrado. Voltando para a arena.';
}

export function resolveMatchQueueJoinedAtMs(matchRow, fallbackMs = 0, userId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeUserId = String(userId || '').trim();
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const playerJoinedAtMs = safeUserId === player1Id
    ? Math.max(0, Number(row.player1_queue_joined_at_ms || 0))
    : (
      safeUserId === player2Id
        ? Math.max(0, Number(row.player2_queue_joined_at_ms || 0))
        : 0
    );
  const explicitMs = Math.max(
    0,
    Number(
      playerJoinedAtMs
      || row.player1_queue_joined_at_ms
      || row.player2_queue_joined_at_ms
      || row.queue_joined_at_ms
      || row.joined_at_ms
      || fallbackMs
      || 0
    )
  );
  if (explicitMs > 0) return explicitMs;
  return Math.max(
    0,
    toMillis(
      row.queue_joined_at
      || row.created_at
      || 0
    )
  );
}

export function isQueueEntryFreshWaiting(queueRow, staleMs = 12000) {
  const row = queueRow && typeof queueRow === 'object' ? queueRow : {};
  if (String(row.status || '').trim().toLowerCase() !== 'waiting') return false;
  const updatedMs = Math.max(0, toMillis(row.updated_at || row.created_at));
  if (!updatedMs) return false;
  const maxAgeMs = Math.max(4000, Number(staleMs || 12000));
  return (Date.now() - updatedMs) <= maxAgeMs;
}

export function getPendingAcceptAutoCloseReason(matchRow, nowMs = Date.now()) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (String(row.status || '').trim().toLowerCase() !== 'pending_accept') return '';

  const p1State = String(row.player1_accept_state || 'pending').trim().toLowerCase();
  const p2State = String(row.player2_accept_state || 'pending').trim().toLowerCase();
  if (p1State === 'rejected' || p2State === 'rejected') return 'match_refused';

  const acceptDeadlineMs = Math.max(0, Number(row.accept_deadline_ms || 0));
  if (acceptDeadlineMs > 0 && nowMs >= acceptDeadlineMs + 5000) return 'accept_timeout';

  const updatedMs = Math.max(
    0,
    toMillis(row.updated_at || row.created_at || row.round_started_at || row.round_started_at_ms)
  );
  if (updatedMs > 0 && (nowMs - updatedMs) >= 40000) return 'accept_timeout';

  return '';
}

export function getInvalidFinishedMatchReason(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const status = String(row.status || '').trim().toLowerCase();
  if (status !== 'finished') return '';
  if (row.is_bot_quiz === true) return '';
  const endedReason = String(row.ended_reason || '').trim().toLowerCase();
  // Forfeit is a valid end state and should keep reward/compensation flows.
  if (endedReason === 'forfeit') return '';
  if (row.result_void === true) {
    return String(row.result_void_reason || '').trim() || 'voided_match';
  }
  const endedRoundNo = Math.max(0, Number(row.ended_round_no || row.round_no || 0));
  const shortMatch = endedRoundNo < 5;
  const p1 = Math.max(0, Number(row.player1_score || 0));
  const p2 = Math.max(0, Number(row.player2_score || 0));
  const zeroScore = p1 === 0 && p2 === 0;
  if (shortMatch && zeroScore) return 'under_min_rounds_zero_score';
  if (shortMatch) return 'under_min_rounds';
  if (zeroScore) return 'zero_score';
  return '';
}

export function isInvalidFinishedMatch(matchRow) {
  return !!getInvalidFinishedMatchReason(matchRow);
}

export function getMatchAcceptStateLabel(stateKey) {
  const key = String(stateKey || 'pending').trim().toLowerCase();
  if (key === 'accepted') return 'Aceitou';
  if (key === 'rejected') return 'Recusado';
  return 'Pendente';
}

export function getPvpRoundAnswerFeedback(answerRow, correctIndex = -1) {
  const pickedIndex = Number(answerRow?.answer_idx ?? -1);
  const hasAnswer = Number.isFinite(pickedIndex) && pickedIndex >= 0;
  const isCorrect = hasAnswer && isPvpAnswerCorrect(answerRow, correctIndex);
  const isUnanswered = !hasAnswer;
  return {
    hasAnswer,
    isCorrect,
    label: isUnanswered ? 'Não respondeu' : (isCorrect ? 'Acertou' : 'Errou'),
    emoji: isUnanswered ? '⏳' : (isCorrect ? '✅' : '❌'),
    cssClass: isUnanswered ? 'neutral' : (isCorrect ? 'success' : 'error')
  };
}

export function getPvpAnswerTargetRoundNo(matchRow, status = '') {
  const safeStatus = String(status || matchRow?.status || '').trim().toLowerCase();
  if (safeStatus === 'round_result') {
    return Math.max(1, Number(matchRow?.result_round_no || matchRow?.round_no || 1));
  }
  return Math.max(1, Number(matchRow?.round_no || 1));
}

export function getPvpRoundAnswersForRound(answerRows = [], roundNo = 1) {
  const safeRoundNo = Math.max(1, Number(roundNo || 1));
  const rows = Array.isArray(answerRows) ? answerRows : [];
  return rows.filter((row) => Math.max(0, Number(row?.round_no || 0)) === safeRoundNo);
}

export function getPvpTeamRoomHostUserId(roomRow = null) {
  return String(roomRow?.created_by_user_id || '').trim();
}

export function getPvpTeamMatchBattleNo(matchRow = null, status = '') {
  const safeStatus = String(status || matchRow?.status || '').trim().toLowerCase();
  if (safeStatus === 'round_result') {
    return Math.max(1, Number(matchRow?.result_battle_no || matchRow?.battle_no || 1));
  }
  return Math.max(1, Number(matchRow?.battle_no || 1));
}

export function getPvpTeamCurrentBattleAnswers(answerRows = [], battleNo = 1) {
  const safeBattleNo = Math.max(1, Number(battleNo || 1));
  const rows = Array.isArray(answerRows) ? answerRows : [];
  return rows.filter((row) => Math.max(0, Number(row?.battle_no || 0)) === safeBattleNo);
}

export function getPvpTeamBattleDisplayLabel(entry = null) {
  const overtimeRoundNo = Math.max(0, Number(entry?.overtime_round_no || 0));
  if (overtimeRoundNo > 0) return `Desempate · Rodada ${overtimeRoundNo}`;
  const blockNo = Math.max(1, Number(entry?.block_no || 1));
  const roundInBlock = Math.max(1, Number(entry?.round_in_block || 1));
  return `Confronto ${blockNo}/${PVP_TEAM_BATTLE_BLOCK_COUNT} · Rodada ${roundInBlock}/${PVP_TEAM_BATTLE_ROUNDS_PER_BLOCK}`;
}

export function getPvpTeamSideColorLabel(side = '') {
  return String(side || '').trim().toLowerCase() === 'blue' ? 'Azul' : 'Vermelho';
}

export function getPvpTeamActivePairMembers(matchRow = null, battleNo = 1) {
  const entry = getPvpTeamBattleEntry(matchRow, battleNo);
  const redMembers = getPvpTeamMembersBySide(matchRow, 'red');
  const blueMembers = getPvpTeamMembersBySide(matchRow, 'blue');
  return {
    entry,
    red: redMembers.find((member) => member.user_id === String(entry?.red_user_id || '').trim()) || null,
    blue: blueMembers.find((member) => member.user_id === String(entry?.blue_user_id || '').trim()) || null
  };
}

export function buildPvpEliminationRoomId(userId = '') {
  const safeUserId = String(userId || '').trim() || 'room';
  return `pvp_elimination_room_${safeUserId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function buildPvpEliminationMatchId(roomId = '') {
  const safeRoomId = String(roomId || '').trim() || 'elimination';
  return `pvp_elimination_match_${safeRoomId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function getPvpEliminationMembers(source = null) {
  const list = Array.isArray(source?.members) ? source.members : [];
  return list
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      ...entry,
      user_id: String(entry.user_id || '').trim()
    }))
    .filter((entry) => !!entry.user_id)
    .slice(0, PVP_ELIMINATION_ROOM_CAPACITY);
}

export function getPvpEliminationMemberById(source = null, userId = '') {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return null;
  return getPvpEliminationMembers(source).find((member) => member.user_id === safeUserId) || null;
}

export function getPvpEliminationActiveMemberIds(source = null) {
  const fallbackIds = getPvpEliminationMembers(source).map((member) => String(member?.user_id || '').trim()).filter(Boolean);
  const sourceIds = Array.isArray(source?.active_member_ids) ? source.active_member_ids : fallbackIds;
  const next = [];
  const seen = new Set();
  sourceIds.forEach((entry) => {
    const userId = String(entry || '').trim();
    if (!userId || seen.has(userId)) return;
    if (fallbackIds.length && !fallbackIds.includes(userId)) return;
    seen.add(userId);
    next.push(userId);
  });
  return next;
}

export function getPvpEliminationRoomReadyMemberIds(roomRow = null) {
  const memberIds = new Set(
    getPvpEliminationMembers(roomRow).map((member) => String(member?.user_id || '').trim()).filter(Boolean)
  );
  const source = Array.isArray(roomRow?.ready_member_ids) ? roomRow.ready_member_ids : [];
  const next = [];
  const seen = new Set();
  source.forEach((entry) => {
    const userId = String(entry || '').trim();
    if (!userId || seen.has(userId) || !memberIds.has(userId)) return;
    seen.add(userId);
    next.push(userId);
  });
  return next;
}

export function isPvpEliminationRoomMemberReady(roomRow = null, userId = '') {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return false;
  return getPvpEliminationRoomReadyMemberIds(roomRow).includes(safeUserId);
}

export function getPvpEliminationRoomHostUserId(roomRow = null) {
  return String(roomRow?.created_by_user_id || '').trim();
}

export function getPvpEliminationRoomStatusLabel(roomRow = null) {
  const status = String(roomRow?.status || '').trim().toLowerCase();
  if (status === 'pending_accept') return 'Aguardando aceite';
  if (status === 'active') return 'Em partida';
  if (status === 'finished') return 'Encerrada';
  return 'Lobby';
}

export function normalizePvpEliminationAcceptState(value = 'pending') {
  const key = String(value || '').trim().toLowerCase();
  if (key === 'accepted' || key === 'rejected') return key;
  return 'pending';
}

export function getPvpEliminationRoomAcceptStateMap(roomRow = null) {
  const members = getPvpEliminationMembers(roomRow);
  const memberIds = members.map((member) => String(member?.user_id || '').trim()).filter(Boolean);
  const source = roomRow?.accept_member_states && typeof roomRow.accept_member_states === 'object'
    ? roomRow.accept_member_states
    : {};
  return memberIds.reduce((acc, userId) => {
    acc[userId] = normalizePvpEliminationAcceptState(source[userId]);
    return acc;
  }, {});
}

export function getPvpEliminationRoomAcceptState(roomRow = null, userId = '') {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return 'pending';
  const stateMap = getPvpEliminationRoomAcceptStateMap(roomRow);
  return normalizePvpEliminationAcceptState(stateMap[safeUserId]);
}

export function getPvpEliminationRoomAcceptBotDecisionAtMap(roomRow = null) {
  const members = getPvpEliminationMembers(roomRow);
  const memberIds = new Set(
    members.map((member) => String(member?.user_id || '').trim()).filter(Boolean)
  );
  const source = roomRow?.accept_bot_decision_at_ms && typeof roomRow.accept_bot_decision_at_ms === 'object'
    ? roomRow.accept_bot_decision_at_ms
    : {};
  const next = {};
  Object.entries(source).forEach(([userId, value]) => {
    const safeUserId = String(userId || '').trim();
    if (!safeUserId || !memberIds.has(safeUserId)) return;
    const decisionAtMs = Math.max(0, Number(value || 0));
    if (decisionAtMs > 0) {
      next[safeUserId] = decisionAtMs;
    }
  });
  return next;
}

export function getPvpEliminationRoomAcceptBotWillRejectMap(roomRow = null) {
  const members = getPvpEliminationMembers(roomRow);
  const memberIds = new Set(
    members.map((member) => String(member?.user_id || '').trim()).filter(Boolean)
  );
  const source = roomRow?.accept_bot_will_reject && typeof roomRow.accept_bot_will_reject === 'object'
    ? roomRow.accept_bot_will_reject
    : {};
  const next = {};
  Object.entries(source).forEach(([userId, value]) => {
    const safeUserId = String(userId || '').trim();
    if (!safeUserId || !memberIds.has(safeUserId)) return;
    if (value === true || value === false) {
      next[safeUserId] = value;
      return;
    }
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') next[safeUserId] = true;
    if (normalized === 'false' || normalized === '0') next[safeUserId] = false;
  });
  return next;
}

export function getPvpEliminationRoomLaunchCheck(roomRow = null) {
  const room = roomRow && typeof roomRow === 'object' ? roomRow : null;
  const hostUserId = getPvpEliminationRoomHostUserId(room);
  const members = getPvpEliminationMembers(room);
  const readyIds = new Set(getPvpEliminationRoomReadyMemberIds(room));
  const isFull = members.length === PVP_ELIMINATION_ROOM_CAPACITY;
  const waitingReadyMembers = members.filter((member) => {
    const userId = String(member?.user_id || '').trim();
    if (!userId || userId === hostUserId) return false;
    return !readyIds.has(userId);
  });
  return {
    isFull,
    waitingReadyMembers,
    canStart: isFull && waitingReadyMembers.length === 0
  };
}

export function buildPvpEliminationRoomStartBlockedNotice(roomRow = null) {
  const room = roomRow && typeof roomRow === 'object' ? roomRow : null;
  const check = getPvpEliminationRoomLaunchCheck(room);
  const issues = [];
  if (!check.isFull) {
    issues.push('A sala precisa ter 4 jogadores para iniciar.');
  }
  if (check.waitingReadyMembers.length) {
    const names = check.waitingReadyMembers
      .map((member) => String(member?.nickname || '').trim() || 'Jogador')
      .slice(0, 4);
    issues.push(`Aguardando ${names.join(', ')} marcar pronto.`);
  }
  return {
    id: `elimination_room_notice_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    title: 'Ainda não é possível iniciar',
    message: issues.join(' '),
    created_at: new Date().toISOString(),
    created_by_user_id: String(getPvpEliminationRoomHostUserId(room) || '').trim()
  };
}

export function shufflePvpEliminationIds(ids = [], random = Math.random) {
  const list = Array.isArray(ids)
    ? ids.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
  const nextRandom = typeof random === 'function' ? random : Math.random;
  for (let idx = list.length - 1; idx > 0; idx -= 1) {
    const swapIndex = Math.floor(nextRandom() * (idx + 1));
    const current = list[idx];
    list[idx] = list[swapIndex];
    list[swapIndex] = current;
  }
  return list;
}

// Com seedKey o sorteio é determinístico: todo cliente que calcular o mesmo ciclo
// chega nos mesmos confrontos (necessário porque a transição roda em transação).
export function buildPvpEliminationCycleRounds(activeUserIds = [], seedKey = '') {
  const activeIds = Array.from(new Set(
    (Array.isArray(activeUserIds) ? activeUserIds : [])
      .map((entry) => String(entry || '').trim())
      .filter(Boolean)
  ));
  if (activeIds.length < 2) return [];
  const safeSeedKey = String(seedKey || '').trim();
  const random = safeSeedKey ? createBotSeededRandom(hashBotSeed(`pvp_elimination_cycle:${safeSeedKey}`)) : Math.random;

  if (activeIds.length === 2) {
    return Array.from({ length: PVP_ELIMINATION_ROUNDS_PER_CYCLE }, (_, index) => ({
      round_in_cycle: index + 1,
      waiting_user_ids: [],
      pairs: [{
        pair_no: 1,
        player1_user_id: activeIds[0],
        player2_user_id: activeIds[1]
      }]
    }));
  }

  if (activeIds.length === 3) {
    const rotation = shufflePvpEliminationIds(activeIds, random);
    const rounds = [
      [rotation[0], rotation[1], rotation[2]],
      [rotation[1], rotation[2], rotation[0]],
      [rotation[2], rotation[0], rotation[1]]
    ];
    return rounds.slice(0, PVP_ELIMINATION_ROUNDS_PER_CYCLE).map((entry, index) => ({
      round_in_cycle: index + 1,
      waiting_user_ids: [entry[2]],
      pairs: [{
        pair_no: 1,
        player1_user_id: entry[0],
        player2_user_id: entry[1]
      }]
    }));
  }

  if (activeIds.length === 4) {
    // Rodízio completo: em 3 rodadas cada jogador enfrenta os outros 3 uma vez.
    const [a, b, c, d] = shufflePvpEliminationIds(activeIds, random);
    const rounds = [
      [[a, b], [c, d]],
      [[a, c], [b, d]],
      [[a, d], [b, c]]
    ];
    return rounds.slice(0, PVP_ELIMINATION_ROUNDS_PER_CYCLE).map((pairs, index) => ({
      round_in_cycle: index + 1,
      waiting_user_ids: [],
      pairs: pairs.map(([user1, user2], pairIndex) => ({
        pair_no: pairIndex + 1,
        player1_user_id: user1,
        player2_user_id: user2
      }))
    }));
  }

  return Array.from({ length: PVP_ELIMINATION_ROUNDS_PER_CYCLE }, (_, index) => {
    const shuffled = shufflePvpEliminationIds(activeIds, random);
    const waitingUserIds = shuffled.length % 2 === 0 ? [] : [shuffled[shuffled.length - 1]];
    const pairPool = waitingUserIds.length ? shuffled.slice(0, shuffled.length - 1) : shuffled;
    const pairs = [];
    for (let pairIndex = 0; pairIndex < pairPool.length; pairIndex += 2) {
      const user1 = String(pairPool[pairIndex] || '').trim();
      const user2 = String(pairPool[pairIndex + 1] || '').trim();
      if (!user1 || !user2 || user1 === user2) continue;
      pairs.push({
        pair_no: pairs.length + 1,
        player1_user_id: user1,
        player2_user_id: user2
      });
    }
    return {
      round_in_cycle: index + 1,
      waiting_user_ids: waitingUserIds,
      pairs
    };
  }).filter((entry) => Array.isArray(entry.pairs) && entry.pairs.length);
}

export function getPvpEliminationRoundEntry(matchRow = null, roundInCycle = 1) {
  const rounds = Array.isArray(matchRow?.cycle_rounds) ? matchRow.cycle_rounds : [];
  const safeRoundInCycle = Math.max(1, Number(roundInCycle || 1));
  return rounds.find((entry) => Number(entry?.round_in_cycle || 0) === safeRoundInCycle)
    || rounds[safeRoundInCycle - 1]
    || null;
}

export function getPvpEliminationPairEntry(matchRow = null, roundInCycle = 1, pairNo = 1) {
  const roundEntry = getPvpEliminationRoundEntry(matchRow, roundInCycle);
  const pairs = Array.isArray(roundEntry?.pairs) ? roundEntry.pairs : [];
  const safePairNo = Math.max(1, Number(pairNo || 1));
  return pairs.find((entry) => Number(entry?.pair_no || 0) === safePairNo)
    || pairs[safePairNo - 1]
    || null;
}

export function getPvpEliminationPairFromRounds(cycleRounds = [], roundInCycle = 1, pairNo = 1) {
  const rounds = Array.isArray(cycleRounds) ? cycleRounds : [];
  const safeRoundInCycle = Math.max(1, Number(roundInCycle || 1));
  const safePairNo = Math.max(1, Number(pairNo || 1));
  const roundEntry = rounds.find((entry) => Number(entry?.round_in_cycle || 0) === safeRoundInCycle)
    || rounds[safeRoundInCycle - 1]
    || null;
  const pairs = Array.isArray(roundEntry?.pairs) ? roundEntry.pairs : [];
  return pairs.find((entry) => Number(entry?.pair_no || 0) === safePairNo)
    || pairs[safePairNo - 1]
    || null;
}

export function getPvpEliminationActivePair(matchRow = null) {
  const explicitPair = Array.isArray(matchRow?.active_pair_user_ids) ? matchRow.active_pair_user_ids : [];
  if (explicitPair.length >= 2) {
    const user1 = String(explicitPair[0] || '').trim();
    const user2 = String(explicitPair[1] || '').trim();
    if (user1 && user2 && user1 !== user2) {
      return {
        user1,
        user2
      };
    }
  }
  const pairEntry = getPvpEliminationPairEntry(
    matchRow,
    Number(matchRow?.round_in_cycle || 1),
    Number(matchRow?.pair_no || 1)
  );
  return {
    user1: String(pairEntry?.player1_user_id || '').trim(),
    user2: String(pairEntry?.player2_user_id || '').trim()
  };
}

export function getPvpEliminationPlacementForUser(matchRow = null, userId = '') {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) return 0;
  const members = getPvpEliminationMembers(matchRow);
  const totalPlayers = Math.max(1, members.length || PVP_ELIMINATION_ROOM_CAPACITY);
  const winnerUserId = String(matchRow?.winner_user_id || '').trim();
  if (winnerUserId && safeUserId === winnerUserId) return 1;
  const eliminationOrder = Array.isArray(matchRow?.elimination_order)
    ? matchRow.elimination_order.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
  const eliminatedIndex = eliminationOrder.indexOf(safeUserId);
  if (eliminatedIndex >= 0) {
    return Math.max(1, totalPlayers - eliminatedIndex);
  }
  const activeIds = getPvpEliminationActiveMemberIds(matchRow);
  if (activeIds.includes(safeUserId)) {
    if (activeIds.length <= 1) return 1;
    if (activeIds.length === 2) return 2;
    return Math.max(2, activeIds.length);
  }
  return totalPlayers;
}

export function getPvpEliminationPlacementLabel(placement = 0) {
  const safePlacement = Math.max(1, Number(placement || 1));
  return `${safePlacement}º lugar`;
}

export function getPvpEliminationResultKeyByPlacement(placement = 0) {
  const safePlacement = Math.max(1, Number(placement || 1));
  if (safePlacement <= 1) return 'win';
  return 'loss';
}

export function getPvpEliminationRoundLabel(matchRow = null) {
  const cycleNo = Math.max(1, Number(matchRow?.cycle_no || 1));
  const roundInCycle = Math.max(1, Number(matchRow?.round_in_cycle || 1));
  const pairNo = Math.max(1, Number(matchRow?.pair_no || 1));
  const prefix = matchRow?.cycle_tiebreak === true ? 'Desempate · ' : '';
  return `${prefix}Ciclo ${cycleNo} · Rodada ${roundInCycle}/${PVP_ELIMINATION_ROUNDS_PER_CYCLE} · Duelo ${pairNo}`;
}

export function buildPvpEliminationCycleScoreMap(activeIds = []) {
  const next = {};
  (Array.isArray(activeIds) ? activeIds : []).forEach((entry) => {
    const userId = String(entry || '').trim();
    if (!userId) return;
    next[userId] = 0;
  });
  return next;
}

export function getPvpEliminationNextPlayablePair(cycleRounds = [], roundInCycle = 1, pairNo = 1) {
  const rounds = Array.isArray(cycleRounds) ? cycleRounds : [];
  const safeRoundInCycle = Math.max(1, Number(roundInCycle || 1));
  const safePairNo = Math.max(1, Number(pairNo || 1));
  for (let roundIndex = safeRoundInCycle - 1; roundIndex < rounds.length; roundIndex += 1) {
    const roundEntry = rounds[roundIndex];
    const pairs = Array.isArray(roundEntry?.pairs) ? roundEntry.pairs : [];
    const startPair = roundIndex === (safeRoundInCycle - 1) ? safePairNo : 1;
    for (let pairIndex = startPair - 1; pairIndex < pairs.length; pairIndex += 1) {
      const pairEntry = pairs[pairIndex];
      const user1 = String(pairEntry?.player1_user_id || '').trim();
      const user2 = String(pairEntry?.player2_user_id || '').trim();
      if (!user1 || !user2 || user1 === user2) continue;
      return {
        round_in_cycle: Math.max(1, Number(roundEntry?.round_in_cycle || (roundIndex + 1))),
        pair_no: Math.max(1, Number(pairEntry?.pair_no || (pairIndex + 1))),
        player1_user_id: user1,
        player2_user_id: user2
      };
    }
  }
  return null;
}

export function nowIso() {
  return new Date().toISOString();
}

export function toMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDurationMmSs(totalMs) {
  const safeMs = Math.max(0, Number(totalMs || 0));
  const totalSec = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getAdminMatchStartMs(matchRow) {
  return Math.max(
    0,
    toMillis(matchRow?.created_at)
    || toMillis(matchRow?.round_started_at_ms)
    || toMillis(matchRow?.round_started_at)
    || toMillis(matchRow?.updated_at)
  );
}

export function getAdminMatchEndMs(matchRow, nowMs = Date.now()) {
  const status = String(matchRow?.status || '').trim().toLowerCase();
  if (status === 'finished') {
    return Math.max(
      0,
      toMillis(matchRow?.ended_at)
      || toMillis(matchRow?.updated_at)
      || getAdminMatchStartMs(matchRow)
    );
  }
  return Math.max(0, Number(nowMs || Date.now()));
}

export function getAdminMatchDurationLabel(matchRow, nowMs = Date.now()) {
  const startedMs = getAdminMatchStartMs(matchRow);
  if (!startedMs) return '00:00';
  const endedMs = getAdminMatchEndMs(matchRow, nowMs);
  return formatDurationMmSs(Math.max(0, endedMs - startedMs));
}

export function getAdminMatchRoundsLabel(matchRow) {
  const totalRounds = Math.max(1, Number(matchRow?.total_rounds || PVP_ROUNDS_PER_MATCH));
  const status = String(matchRow?.status || '').trim().toLowerCase();
  if (status === 'finished') {
    const endedRoundNo = Math.max(1, Number(matchRow?.ended_round_no || matchRow?.round_no || totalRounds));
    return `${endedRoundNo}/${totalRounds}`;
  }
  const currentRoundNo = Math.max(1, Number(matchRow?.round_no || 1));
  return `${currentRoundNo}/${totalRounds}`;
}

export function getLanguageNameById(languageId) {
  const safeLanguageId = String(languageId || '').trim();
  if (!safeLanguageId) return '--';
  if (safeLanguageId === 'assuntos_gerais') return 'Assuntos Gerais';
  const language = LANGUAGES.find((entry) => String(entry?.id || '') === safeLanguageId);
  return String(language?.name || safeLanguageId);
}

export function getTopicNameById(languageId, topicId) {
  const safeTopicId = String(topicId || '').trim();
  if (!safeTopicId) return '--';
  const safeLanguageId = String(languageId || '').trim();
  if (!safeLanguageId) return safeTopicId;
  const topics = getTopicsByLanguage(TOPICS, safeLanguageId);
  const topic = topics.find((entry) => String(entry?.id || '') === safeTopicId);
  return String(topic?.name || safeTopicId);
}

export function getLanguageIconById(languageId) {
  const safeLanguageId = String(languageId || '').trim();
  if (!safeLanguageId) return '🧠';
  if (safeLanguageId === 'assuntos_gerais') return '🌍';
  const language = LANGUAGES.find((entry) => String(entry?.id || '') === safeLanguageId);
  return String(language?.icon || '🧠');
}

export function getTopicEmojiById(languageId, topicId) {
  const safeLanguageId = String(languageId || '').trim();
  const safeTopicId = String(topicId || '').trim();
  if (!safeLanguageId && !safeTopicId) return '🎯';
  const topics = getTopicsByLanguage(TOPICS, safeLanguageId);
  const topic = topics.find((entry) => String(entry?.id || '') === safeTopicId);
  const topicEmoji = String(topic?.emoji || '').trim();
  if (topicEmoji) return topicEmoji;
  if (safeLanguageId) return getLanguageIconById(safeLanguageId);
  return '🎯';
}

export function getTopicEmojiPool(languageId, selectedIcon = '') {
  const safeLanguageId = String(languageId || '').trim();
  const fallbackPool = ['🎯', '🧠', '⚡', '📚', '🚀', '🧩', '💡', '🧪'];
  const languageTopics = getTopicsByLanguage(TOPICS, safeLanguageId);
  const languagePool = languageTopics
    .map((topic) => String(topic?.emoji || '').trim())
    .filter(Boolean);
  const languageIcon = getLanguageIconById(safeLanguageId);
  const merged = [...languagePool, languageIcon, String(selectedIcon || '').trim()]
    .map((emoji) => String(emoji || '').trim())
    .filter(Boolean);
  if (!merged.length) return fallbackPool;
  return Array.from(new Set([...merged, ...fallbackPool]));
}

export function pickRandomIcon(pool = [], fallback = '🎯') {
  const safePool = Array.isArray(pool)
    ? pool.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  if (!safePool.length) return fallback;
  const randomIndex = Math.floor(Math.random() * safePool.length);
  return safePool[randomIndex] || fallback;
}

export function buildThemeIntroRoulette(selectedIcon, pool = []) {
  const safeSelectedIcon = String(selectedIcon || '').trim() || '🎯';
  const safePool = getTopicEmojiPool('', safeSelectedIcon).concat(
    Array.isArray(pool) ? pool : []
  )
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const uniquePool = Array.from(new Set(safePool));
  const items = Array.from({ length: THEME_INTRO_ROULETTE_ITEMS_TOTAL }, () => pickRandomIcon(uniquePool, safeSelectedIcon));
  const targetIndex = Math.min(
    THEME_INTRO_ROULETTE_ITEMS_TOTAL - 1,
    Math.max(1, THEME_INTRO_ROULETTE_TARGET_INDEX)
  );
  items[targetIndex] = safeSelectedIcon;
  if (targetIndex > 0 && items[targetIndex - 1] === safeSelectedIcon) {
    items[targetIndex - 1] = pickRandomIcon(uniquePool.filter((emoji) => emoji !== safeSelectedIcon), uniquePool[0] || '✨');
  }
  if (targetIndex < items.length - 1 && items[targetIndex + 1] === safeSelectedIcon) {
    items[targetIndex + 1] = pickRandomIcon(uniquePool.filter((emoji) => emoji !== safeSelectedIcon), uniquePool[0] || '✨');
  }
  const railLeftPx = (targetIndex * THEME_INTRO_ROULETTE_CHIP_STEP_PX) + THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX;
  const minRollSteps = Math.max(4, THEME_INTRO_ROULETTE_MIN_ROLL_STEPS);
  const maxRollSteps = Math.max(minRollSteps, THEME_INTRO_ROULETTE_MAX_ROLL_STEPS);
  const rollSteps = minRollSteps + Math.floor(Math.random() * ((maxRollSteps - minRollSteps) + 1));
  const rollStartOffsetPx = (rollSteps * THEME_INTRO_ROULETTE_CHIP_STEP_PX) + Math.floor(Math.random() * 34);
  return {
    items,
    targetIndex,
    railLeftPx,
    rollStartOffsetPx
  };
}

export function resolveQuestionThemeContext(questionRow, fallbackLanguage = '', fallbackTopic = '') {
  const row = questionRow && typeof questionRow === 'object' ? questionRow : {};
  const languageId = String(
    row.language
    || row.language_id
    || row.lang
    || fallbackLanguage
    || ''
  ).trim();
  const topicId = String(
    row.topic
    || row.topic_id
    || row.topicId
    || fallbackTopic
    || ''
  ).trim();
  const difficulty = normalizeDifficulty(row.difficulty || 'easy');
  return {
    languageId,
    topicId,
    difficulty
  };
}

export function buildThemeContextKey(languageId = '', topicId = '') {
  return `${String(languageId || '').trim()}::${String(topicId || '').trim()}`;
}

export function getAdminQuizCardData(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const assignments = Array.isArray(row.bot_quiz_assignments) ? row.bot_quiz_assignments : [];
  const firstAssignment = assignments.find((entry) => entry && typeof entry === 'object') || {};
  const languageId = String(firstAssignment.language || row.language || '').trim();
  const topicId = String(firstAssignment.topic || row.topic || '').trim();
  const difficulty = normalizeDifficulty(
    firstAssignment.difficulty
    || row.bot_quiz_difficulty
    || row.difficulty
    || 'easy'
  );
  const baseTotalQuestions = Math.max(
    1,
    Math.trunc(Number(firstAssignment.total_questions || row.total_rounds || QUESTIONS_PER_ROUND))
  );
  const catalogTotalQuestions = getRoundQuestionCapacity(
    QUESTIONS,
    languageId,
    topicId,
    difficulty,
    QUESTIONS_PER_ROUND
  );
  const totalQuestions = catalogTotalQuestions > 0
    ? Math.max(1, Math.min(baseTotalQuestions, catalogTotalQuestions))
    : baseTotalQuestions;
  const scoreSource = firstAssignment.correct_count !== undefined
    ? firstAssignment.correct_count
    : row.player1_score;
  const correctCount = Math.max(0, Math.min(totalQuestions, Math.trunc(Number(scoreSource || 0))));
  const accuracyPct = Math.max(0, Math.min(100, Math.round((correctCount / Math.max(1, totalQuestions)) * 100)));

  return {
    languageId,
    topicId,
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy,
    languageLabel: getLanguageNameById(languageId),
    topicLabel: getTopicNameById(languageId, topicId),
    totalQuestions,
    correctCount,
    accuracyPct
  };
}

export function toAdminDayKey(msValue) {
  const base = Math.max(0, Number(msValue || 0)) || Date.now();
  const date = new Date(base);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}${month}${year}`;
}

export function getMatchBotUserId(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const byField = String(row.bot_user_id || '').trim();
  if (isSystemBotUserId(byField)) return byField;
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  if (isSystemBotUserId(player1Id)) return player1Id;
  if (isSystemBotUserId(player2Id)) return player2Id;
  return '';
}

export function getMatchHumanUserId(matchRow, botUserId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeBotUserId = String(botUserId || getMatchBotUserId(row)).trim();
  if (!safeBotUserId) return '';
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  if (player1Id === safeBotUserId) return player2Id;
  if (player2Id === safeBotUserId) return player1Id;
  return '';
}

export function getBotDefaultStrengthById(botUserId = '') {
  const safeBotId = String(botUserId || '').trim();
  if (!safeBotId) return normalizeBotStrength('medio');
  return normalizeBotStrength(getSystemBotDefaultStrength(safeBotId));
}

export function getBotStrengthFromMatchRow(matchRow, botUserId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const safeBotId = String(botUserId || '').trim();
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();

  if (safeBotId && safeBotId === player1Id) {
    return normalizeBotStrength(
      row.player1_bot_strength
      || row.bot_strength
      || getBotDefaultStrengthById(safeBotId)
    );
  }
  if (safeBotId && safeBotId === player2Id) {
    return normalizeBotStrength(
      row.player2_bot_strength
      || row.bot_strength
      || getBotDefaultStrengthById(safeBotId)
    );
  }
  if (safeBotId) {
    return normalizeBotStrength(row.bot_strength || getBotDefaultStrengthById(safeBotId));
  }
  return normalizeBotStrength(row.bot_strength || 'medio');
}

export function getAdminBotClassSummary(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return '';

  if (row.is_bot_quiz === true) {
    const assignments = Array.isArray(row.bot_quiz_assignments) ? row.bot_quiz_assignments : [];
    const labels = assignments
      .slice(0, 2)
      .map((entry) => {
        const botId = String(entry?.bot_id || '').trim();
        const strength = normalizeBotStrength(entry?.bot_strength || getBotDefaultStrengthById(botId));
        return getBotStrengthLabel(strength);
      })
      .filter((label) => !!label);
    if (!labels.length) return '';
    if (labels.length === 1) return `Classe bot: ${labels[0]}`;
    return `Classes bot: ${labels[0]} x ${labels[1]}`;
  }

  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const isPlayer1Bot = isSystemBotUserId(player1Id);
  const isPlayer2Bot = isSystemBotUserId(player2Id);

  if (isPlayer1Bot && isPlayer2Bot) {
    const strength1 = getBotStrengthLabel(getBotStrengthFromMatchRow(row, player1Id));
    const strength2 = getBotStrengthLabel(getBotStrengthFromMatchRow(row, player2Id));
    return `Classes bot: ${strength1} x ${strength2}`;
  }

  const botId = getMatchBotUserId(row);
  if (!botId) return '';
  const strength = getBotStrengthLabel(getBotStrengthFromMatchRow(row, botId));
  return `Classe bot: ${strength}`;
}

export function getAdminMatchTypeKey(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return 'unknown';
  if (row.is_bot_quiz === true) return 'bot_quiz';

  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const hasPlayer1 = !!player1Id;
  const hasPlayer2 = !!player2Id;
  const player1Bot = hasPlayer1 && isSystemBotUserId(player1Id);
  const player2Bot = hasPlayer2 && isSystemBotUserId(player2Id);

  if (player1Bot && player2Bot) return 'bot_vs_bot';
  if (hasPlayer1 && hasPlayer2 && !player1Bot && !player2Bot) return 'user_vs_user';
  if ((player1Bot && hasPlayer2 && !player2Bot) || (player2Bot && hasPlayer1 && !player1Bot)) {
    return 'user_vs_bot';
  }
  return 'unknown';
}

export function getAdminMatchTypeLabel(matchRow) {
  const type = getAdminMatchTypeKey(matchRow);
  if (type === 'bot_quiz') return 'Quiz solo';
  if (type === 'user_vs_user') return 'Usuário x Usuário';
  if (type === 'user_vs_bot') return 'Usuário x Bot';
  if (type === 'bot_vs_bot') return 'Bot x Bot';
  return 'Partida';
}

export function isAdminQuizHistoryRow(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return false;
  if (row.is_bot_quiz === true) return true;
  const endedReason = String(row.ended_reason || '').trim().toLowerCase();
  if (endedReason.includes('quiz')) return true;
  const modeKey = String(row.mode || row.match_mode || row.game_mode || '').trim().toLowerCase();
  return modeKey === 'quiz';
}

export function isAdminUserQuizHistoryRow(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!isAdminQuizHistoryRow(row)) return false;
  if (row.is_bot_quiz === true) return false;
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const hasBot = (player1Id && isSystemBotUserId(player1Id)) || (player2Id && isSystemBotUserId(player2Id));
  return !hasBot;
}

export function doesAdminHistoryRowMatchFilter(matchRow, filterKey = 'all') {
  const key = String(filterKey || 'all').trim().toLowerCase();
  if (key === 'all') return true;
  const type = getAdminMatchTypeKey(matchRow);
  const isQuiz = isAdminQuizHistoryRow(matchRow);
  if (key === 'pvp') return !isQuiz;
  if (key === 'users') return !isQuiz && (type === 'user_vs_user' || type === 'user_vs_bot');
  if (key === 'quiz') return isQuiz;
  if (key === 'user_quiz') return isAdminUserQuizHistoryRow(matchRow);
  return true;
}

export function isAdminLiveMatchRow(matchRow, nowMs = Date.now()) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  if (!row || typeof row !== 'object') return false;
  if (row.result_void === true || row.history_hidden === true) return false;

  const status = String(row.status || '').trim().toLowerCase();
  if (status === 'pending_accept' || status === 'active' || status === 'round_result') return true;

  // Include transitional states that may appear briefly during user-vs-user pairing.
  if (status === 'matched' || status === 'starting') return true;
  if (status === 'finished') return false;
  if (row.is_bot_quiz === true) return false;

  const type = getAdminMatchTypeKey(row);
  if (type !== 'user_vs_user' && type !== 'user_vs_bot') return false;

  const player1State = String(row.player1_accept_state || '').trim().toLowerCase();
  const player2State = String(row.player2_accept_state || '').trim().toLowerCase();
  const hasAcceptSignal = (
    player1State === 'pending'
    || player2State === 'pending'
    || player1State === 'accepted'
    || player2State === 'accepted'
  );
  if (!hasAcceptSignal) return false;

  const updatedMs = toMillis(row.updated_at || row.round_started_at || row.created_at);
  if (!updatedMs) return false;
  return (Math.max(0, Number(nowMs || Date.now())) - updatedMs) <= 120000;
}

export function buildFallbackPvpConfig() {
  const language = LANGUAGES[0]?.id || 'javascript';
  const topics = getTopicsByLanguage(TOPICS, language);
  const topic = topics[0]?.id || 'variables';
  return {
    language,
    topic,
    difficulty: 'easy'
  };
}

export function hasQuestionsForDifficulty(languageId, topicId, difficulty) {
  const safeLanguage = String(languageId || '').trim();
  const safeTopic = String(topicId || '').trim();
  if (!safeLanguage || !safeTopic) return false;
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const pool = QUESTIONS?.[safeLanguage]?.[safeTopic]?.[safeDifficulty];
  return Array.isArray(pool) && pool.length > 0;
}

export function ensureValidPvpConfig(config) {
  const fallback = buildFallbackPvpConfig();
  const requestedTopic = String(config?.topic || '').trim();
  const requestedLanguage = normalizeLegacyLanguageId(
    String(config?.language || fallback.language).trim(),
    requestedTopic
  );
  const safeDifficulty = normalizeDifficulty(config?.difficulty || fallback.difficulty);
  const preferredArea = String(
    config?.area
    || config?.knowledge_area
    || resolveKnowledgeAreaByLanguageId(requestedLanguage || fallback.language)
    || ''
  ).trim();
  const areaLanguageIds = getLanguageIdsByKnowledgeArea(preferredArea);
  const restrictToArea = areaLanguageIds.length > 0;

  const candidateLanguages = [];
  const pushCandidateLanguage = (value) => {
    const safeValue = normalizeLegacyLanguageId(value, requestedTopic);
    if (!safeValue) return;
    if (candidateLanguages.includes(safeValue)) return;
    if (restrictToArea && !areaLanguageIds.includes(safeValue)) return;
    if (!getTopicsByLanguage(TOPICS, safeValue).length) return;
    candidateLanguages.push(safeValue);
  };

  pushCandidateLanguage(requestedLanguage);
  areaLanguageIds.forEach((languageId) => pushCandidateLanguage(languageId));
  if (!restrictToArea) {
    pushCandidateLanguage(fallback.language);
    LANGUAGES.forEach((language) => pushCandidateLanguage(language?.id));
  }

  let safeLanguage = candidateLanguages[0] || areaLanguageIds[0] || fallback.language;
  let safeTopic = '';

  for (const languageId of candidateLanguages) {
    const topics = getTopicsByLanguage(TOPICS, languageId);
    if (!topics.length) continue;

    const requestedTopicValid = (
      !!requestedTopic
      && topics.some((topic) => topic.id === requestedTopic)
      && hasQuestionsForDifficulty(languageId, requestedTopic, safeDifficulty)
    );
    const compatibleTopic = requestedTopicValid
      ? requestedTopic
      : (topics.find((topic) => hasQuestionsForDifficulty(languageId, topic.id, safeDifficulty))?.id || '');
    if (compatibleTopic) {
      safeLanguage = languageId;
      safeTopic = compatibleTopic;
      break;
    }
  }

  if (!safeTopic) {
    const fallbackTopics = getTopicsByLanguage(TOPICS, safeLanguage);
    safeTopic = fallbackTopics[0]?.id || fallback.topic;
  }

  return {
    language: safeLanguage,
    topic: safeTopic,
    difficulty: safeDifficulty
  };
}

export const PVP_MIXED_LANGUAGE_ID = '__pvp__';
export const PVP_MIXED_TOPIC_ID = '__all__';

export function collectPvpQuestionPoolByDifficulty(questionsMap, difficulty, scope = {}) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeQuestions = questionsMap && typeof questionsMap === 'object' ? questionsMap : {};
  const safeLanguage = String(scope?.languageId || '').trim();
  const safeTopic = String(scope?.topicId || '').trim();
  const safeArea = String(scope?.areaId || '').trim();
  const merged = [];
  const pushTopicPack = (topicPack) => {
    if (!topicPack || typeof topicPack !== 'object') return;
    const pool = Array.isArray(topicPack[safeDifficulty]) ? topicPack[safeDifficulty] : [];
    pool.forEach((question) => merged.push(question));
  };

  if (safeLanguage && safeTopic) {
    const topicPack = safeQuestions?.[safeLanguage]?.[safeTopic];
    pushTopicPack(topicPack);
    return merged;
  }

  if (safeLanguage) {
    const languagePack = safeQuestions?.[safeLanguage];
    if (!languagePack || typeof languagePack !== 'object') return merged;
    Object.values(languagePack).forEach((topicPack) => {
      pushTopicPack(topicPack);
    });
    return merged;
  }

  if (safeArea) {
    const areaLanguageIds = getLanguageIdsByKnowledgeArea(safeArea);
    areaLanguageIds.forEach((languageId) => {
      const languagePack = safeQuestions?.[languageId];
      if (!languagePack || typeof languagePack !== 'object') return;
      Object.values(languagePack).forEach((topicPack) => {
        pushTopicPack(topicPack);
      });
    });
    return merged;
  }

  Object.values(safeQuestions).forEach((languagePack) => {
    if (!languagePack || typeof languagePack !== 'object') return;
    Object.values(languagePack).forEach((topicPack) => {
      pushTopicPack(topicPack);
    });
  });

  return merged;
}

export function pickPvpRoundQuestionsFromPool(mergedPool, difficulty, count, excludeQuestions = [], options = {}) {
  const safeDifficulty = normalizeDifficulty(difficulty || 'easy');
  const safeCount = Math.max(1, Number(count || 1));
  if (!Array.isArray(mergedPool) || !mergedPool.length) return [];

  const virtualQuestionsMap = {
    [PVP_MIXED_LANGUAGE_ID]: {
      [PVP_MIXED_TOPIC_ID]: {
        [safeDifficulty]: mergedPool
      }
    }
  };

  return pickRoundQuestions(
    virtualQuestionsMap,
    PVP_MIXED_LANGUAGE_ID,
    PVP_MIXED_TOPIC_ID,
    safeDifficulty,
    safeCount,
    excludeQuestions,
    { recentQuestionKeys: options?.recentQuestionKeys }
  );
}

export function pickPvpRoundQuestionsByConfig(questionsMap, config, count, excludeQuestions = [], options = {}) {
  const safeDifficulty = normalizeDifficulty(config?.difficulty || 'easy');
  const safeCount = Math.max(1, Number(count || 1));
  const safeTopic = String(config?.topic || '').trim();
  const safeLanguage = normalizeLegacyLanguageId(config?.language || '', safeTopic);
  const safeArea = String(
    config?.area
    || config?.knowledge_area
    || resolveKnowledgeAreaByLanguageId(safeLanguage)
    || ''
  ).trim();
  const areaLanguageIds = getLanguageIdsByKnowledgeArea(safeArea);
  const allowLanguageScope = !safeArea || !areaLanguageIds.length || areaLanguageIds.includes(safeLanguage);
  const selected = [];
  const scopes = [];

  if (allowLanguageScope && safeLanguage && safeTopic) scopes.push({ languageId: safeLanguage, topicId: safeTopic });
  if (allowLanguageScope && safeLanguage) scopes.push({ languageId: safeLanguage });
  if (safeArea) scopes.push({ areaId: safeArea });
  if (!safeArea) scopes.push({});

  scopes.forEach((scope) => {
    if (selected.length >= safeCount) return;
    const pool = collectPvpQuestionPoolByDifficulty(questionsMap, safeDifficulty, scope);
    if (!pool.length) return;
    const missing = Math.max(0, safeCount - selected.length);
    if (!missing) return;
    const picked = pickPvpRoundQuestionsFromPool(
      pool,
      safeDifficulty,
      missing,
      [...excludeQuestions, ...selected],
      options
    );
    if (picked.length) selected.push(...picked);
  });

  return selected.slice(0, safeCount);
}

// Nível de desempate de uma rodada do duelo: 0 nas rodadas normais, 1 na primeira
// rodada extra, 2 na segunda...
export function getPvpDuelRoundTiebreakLevel(roundNo = 1) {
  return Math.max(0, Math.floor(Number(roundNo || 1)) - PVP_ROUNDS_PER_MATCH);
}

export function getPvpDuelRoundDifficulty(matchRow = null, roundNo = 1) {
  return getPvpTiebreakDifficulty(
    matchRow?.difficulty || matchRow?.category || 'easy',
    getPvpDuelRoundTiebreakLevel(roundNo)
  );
}

// Completa as perguntas do duelo até a rodada pedida sem trocar as já gravadas.
// Rodadas normais que faltarem seguem a sequência da partida; no desempate (empate
// depois das rodadas normais) cada rodada extra sobe uma dificuldade.
export function extendPvpQuestionSetIfNeeded(matchRow, nextRoundNo, options = {}) {
  const targetRoundNo = Math.max(1, Number(nextRoundNo || 1));
  const currentSet = Array.isArray(matchRow?.question_set)
    ? matchRow.question_set.filter((row) => row && typeof row === 'object')
    : [];
  if (targetRoundNo <= currentSet.length) return currentSet;

  const nextSet = [...currentSet];
  const baseTargetRoundNo = Math.min(targetRoundNo, PVP_ROUNDS_PER_MATCH);
  if (nextSet.length < baseTargetRoundNo && hasPvpMatchSequenceMetadata(matchRow)) {
    buildPvpQuestionSetFromMatchSequence(matchRow, baseTargetRoundNo).forEach((question) => {
      if (nextSet.length >= baseTargetRoundNo) return;
      if (nextSet.some((current) => areQuestionsSemanticallyEquivalent(current, question))) return;
      nextSet.push(question);
    });
  }

  const difficulty = normalizeDifficulty(matchRow?.difficulty || 'easy');
  const safeConfig = ensureValidPvpConfig({
    language: matchRow?.language || '',
    topic: matchRow?.topic || '',
    difficulty,
    area: matchRow?.knowledge_area || resolveKnowledgeAreaByLanguageId(matchRow?.language || '')
  });
  const safeArea = String(
    matchRow?.knowledge_area
    || resolveKnowledgeAreaByLanguageId(safeConfig.language || matchRow?.language || '')
    || ''
  ).trim();

  while (nextSet.length < targetRoundNo) {
    const roundNo = nextSet.length + 1;
    const tiebreakLevel = getPvpDuelRoundTiebreakLevel(roundNo);
    const roundDifficulty = getPvpTiebreakDifficulty(difficulty, tiebreakLevel);
    const picked = pickPvpRoundQuestionsByConfig(
      QUESTIONS,
      {
        language: safeConfig.language,
        topic: safeConfig.topic,
        difficulty: roundDifficulty,
        area: safeArea
      },
      1,
      nextSet,
      options
    );
    if (!picked.length) break;
    nextSet.push(tiebreakLevel > 0
      ? { ...picked[0], difficulty: roundDifficulty, tiebreak_level: tiebreakLevel }
      : picked[0]);
  }

  return nextSet;
}

export const AUDIO_STORAGE_KEY = 'codequiz_audio_settings_v1';
export const AUDIO_DEFAULTS = {
  musicEnabled: true,
  musicVolume: 0.58,
  sfxEnabled: true,
  sfxVolume: 0.72
};
export const MUSIC_AUTO_SKIP_INTERVAL_MS = 40 * 1000;
export const MUSIC_SKIP_FADE_OUT_MS = 360;
export const MUSIC_SKIP_FADE_IN_MS = 520;
export const MUSIC_SKIP_SWITCH_DELAY_MS = MUSIC_SKIP_FADE_OUT_MS + 44;
export const VERSION_CHECK_MS = 9000;
export const QUICK_BOOT_CHECKS_MS = [900, 1900, 3400, 5600];
export const COOKIE_CONSENT_STORAGE_KEY = 'codequiz_cookie_consent_v1';
export const COOKIE_CONSENT_COOKIE_KEY = 'codequiz_cookie_consent';
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const AUTH_OPERATION_TIMEOUT_MS = 7000;
export const AUTH_POPUP_TIMEOUT_MS = 30000;
export const AUTH_BOOTSTRAP_GUARD_MS = 18000;
export const UI_ACTION_WATCHDOG_MS = 9000;
export const PVP_QUEUE_DISCONNECT_GRACE_MS = 9000;
export const PVP_QUEUE_DISCONNECT_GRACE_MOBILE_MS = 13000;
export const PVP_QUEUE_DISCONNECT_RECOVERY_TIMEOUT_MS = 2600;
export const PRELOAD_RUNTIME_MIN_INTERVAL_MS = 12000;
export const PRELOAD_RUNTIME_CHALLENGE_INTERVAL_MS = 18000;
export const PROGRESS_RECOVERY_RETRY_MS = 6000;
export const PROGRESS_FORCED_RESET_GUARD_MS = 1200;
export const NICKNAME_RULE_COPY = 'Use 3 a 12 caracteres. Letras, números, espaços, . _ ou -.';
export const PVP_EMOJI_STORAGE_PREFIX = 'codequiz_pvp_battle_emojis_v1';
export const PVP_SEQUENCE_CURSOR_STORAGE_PREFIX = 'codequiz_pvp_sequence_cursor_v1';
export const PVP_SEQUENCE_RECENT_STARTS_STORAGE_PREFIX = 'codequiz_pvp_sequence_recent_starts_v1';
export const PVP_SEQUENCE_RECENT_STARTS_MAX = 3;
export const PVP_KNOWLEDGE_AREA_STORAGE_PREFIX = 'codequiz_pvp_knowledge_area_v1';
export const PLAYER_QUIZ_HISTORY_STORAGE_PREFIX = 'codequiz_player_quiz_history_v1';
export const PLAYER_QUIZ_HISTORY_MAX_ENTRIES = 40;
export const SEEN_QUESTIONS_STORAGE_PREFIX = 'codequiz_seen_questions_v1';
export const SEEN_QUESTIONS_MAX_ENTRIES = 1500;
export const SHOP_UI_STATE_STORAGE_PREFIX = 'codequiz_shop_ui_state_v1';
export const HOME_TOUR_STORAGE_PREFIX = 'codequiz_home_tour_seen_v1';
export const LEAGUE_SNAPSHOT_STORAGE_PREFIX = 'codequiz_league_snapshot_v1';
export const LEAGUE_TRANSITION_VISIBLE_MS = 4200;
export const LEAGUE_ORDER = Object.freeze(['bronze', 'silver', 'gold', 'platinum', 'diamond']);
export const PASS_CLAIM_STAGE_FLASH_MS = 1700;
export const THEME_INTRO_PVE_DURATION_MS = 3200;
export const THEME_INTRO_PVP_DURATION_MS = 2800;
export const THEME_INTRO_PVE_SELECTED_HOLD_MS = 1200;
export const THEME_INTRO_PVP_SELECTED_HOLD_MS = 1050;
export const THEME_INTRO_ROULETTE_CHIP_STEP_PX = 84;
export const THEME_INTRO_ROULETTE_CHIP_CENTER_OFFSET_PX = 36;
export const THEME_INTRO_ROULETTE_ITEMS_TOTAL = 27;
export const THEME_INTRO_ROULETTE_TARGET_INDEX = 19;
export const THEME_INTRO_ROULETTE_MIN_ROLL_STEPS = 10;
export const THEME_INTRO_ROULETTE_MAX_ROLL_STEPS = 14;
export const BOT_CONFIG_DEFAULT = {
  personality: 'provocador',
  strength: 'forte'
};
export const SHOP_UI_TABS = ['frame', 'background', 'emoji'];
export const SHOP_OWNERSHIP_FILTERS = ['all', 'owned', 'unowned'];
export const SHOP_CATEGORY_OPEN_DEFAULT = SHOP_RARITY_ORDER.reduce((acc, rarity) => {
  acc[rarity] = true;
  return acc;
}, {});

export function getHomeTourStorageKey(userId = '') {
  const safeUserId = String(userId || '').trim() || 'guest';
  return `${HOME_TOUR_STORAGE_PREFIX}:${safeUserId}`;
}

export function readHomeTourSeenLocal(userId = '') {
  if (typeof window === 'undefined') return false;
  try {
    return String(window.localStorage.getItem(getHomeTourStorageKey(userId)) || '').trim() === '1';
  } catch {
    return false;
  }
}

export function writeHomeTourSeenLocal(userId = '', seen = true) {
  if (typeof window === 'undefined') return;
  try {
    if (!seen) {
      window.localStorage.removeItem(getHomeTourStorageKey(userId));
      return;
    }
    window.localStorage.setItem(getHomeTourStorageKey(userId), '1');
  } catch {
    // ignore storage failures
  }
}

export function getPvpSequenceStorageKey(userId = '') {
  const safeUserId = String(userId || 'guest').trim() || 'guest';
  return `${PVP_SEQUENCE_CURSOR_STORAGE_PREFIX}_${safeUserId}`;
}

export function getPvpSequenceRecentStartsStorageKey(userId = '') {
  const safeUserId = String(userId || 'guest').trim() || 'guest';
  return `${PVP_SEQUENCE_RECENT_STARTS_STORAGE_PREFIX}_${safeUserId}`;
}

export function getPvpKnowledgeAreaStorageKey(userId = '') {
  const safeUserId = String(userId || 'guest').trim() || 'guest';
  return `${PVP_KNOWLEDGE_AREA_STORAGE_PREFIX}_${safeUserId}`;
}

export function readPvpKnowledgeAreaLocal(userId = '') {
  if (typeof window === 'undefined') return '';
  try {
    return String(window.localStorage.getItem(getPvpKnowledgeAreaStorageKey(userId)) || '').trim();
  } catch {
    return '';
  }
}

export function writePvpKnowledgeAreaLocal(userId = '', areaId = '') {
  if (typeof window === 'undefined') return;
  try {
    const key = getPvpKnowledgeAreaStorageKey(userId);
    const safeAreaId = String(areaId || '').trim();
    if (!safeAreaId) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, safeAreaId);
  } catch {
    // ignore storage failures
  }
}

export function normalizeLeagueKey(value = '') {
  const safe = String(value || '').trim().toLowerCase();
  return LEAGUE_ORDER.includes(safe) ? safe : 'bronze';
}

export function getLeagueMetaByKey(value = '') {
  const key = normalizeLeagueKey(value);
  const lookupPoints = {
    bronze: 0,
    silver: 30,
    gold: 60,
    platinum: 90,
    diamond: 110
  };
  return getCategoryByPoints(lookupPoints[key] || 0);
}

export function getLeagueRankByKey(value = '') {
  return LEAGUE_ORDER.indexOf(normalizeLeagueKey(value));
}

export function getLeagueSnapshotStorageKey(userId = '') {
  const safeUserId = String(userId || 'guest').trim() || 'guest';
  return `${LEAGUE_SNAPSHOT_STORAGE_PREFIX}_${safeUserId}`;
}

export function normalizeLeagueSnapshot(raw, userId = '') {
  const safe = raw && typeof raw === 'object' ? raw : {};
  return {
    userId: String(safe.userId || safe.user_id || userId || '').trim(),
    pveKey: normalizeLeagueKey(safe.pveKey || safe.pve_key),
    pvpKey: normalizeLeagueKey(safe.pvpKey || safe.pvp_key)
  };
}

export function buildLeagueSnapshot(progressRow = null, userId = '') {
  const safe = progressRow && typeof progressRow === 'object' ? progressRow : {};
  const pveLeague = getCategoryByPoints(safe.rankingPoints ?? safe.ranking_points ?? 0);
  const pvpLeague = getCategoryByPoints(safe.pvpPoints ?? safe.pvp_points ?? 0);
  return normalizeLeagueSnapshot(
    {
      userId,
      pveKey: pveLeague.key,
      pvpKey: pvpLeague.key
    },
    userId
  );
}

export function readLeagueSnapshotLocal(userId = '') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getLeagueSnapshotStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const snapshot = normalizeLeagueSnapshot(parsed, userId);
    if (!snapshot.userId) return null;
    return snapshot;
  } catch {
    return null;
  }
}

export function writeLeagueSnapshotLocal(userId = '', snapshot = null) {
  if (typeof window === 'undefined') return;
  try {
    const safeUserId = String(userId || '').trim();
    if (!safeUserId) return;
    const normalized = normalizeLeagueSnapshot(snapshot, safeUserId);
    window.localStorage.setItem(getLeagueSnapshotStorageKey(safeUserId), JSON.stringify(normalized));
  } catch {
    // ignore storage failures
  }
}

export function getPlayerQuizHistoryStorageKey(userId = '') {
  const safeUserId = String(userId || 'guest').trim() || 'guest';
  return `${PLAYER_QUIZ_HISTORY_STORAGE_PREFIX}_${safeUserId}`;
}

export function normalizePlayerQuizHistoryEntry(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const timestampMs = Math.max(
    0,
    Number(safe.timestampMs || safe.timestamp_ms || Date.parse(safe.createdAt || safe.created_at || '') || 0)
  );
  const createdAt = String(
    safe.createdAt
    || safe.created_at
    || (timestampMs > 0 ? new Date(timestampMs).toISOString() : new Date().toISOString())
  ).trim() || new Date().toISOString();
  return {
    id: String(safe.id || `pve_${timestampMs || Date.now()}`).trim() || `pve_${Date.now()}`,
    type: 'pve',
    language: String(safe.language || '').trim(),
    topic: String(safe.topic || '').trim(),
    difficulty: normalizeDifficulty(safe.difficulty || 'easy'),
    scorePct: Math.max(0, Math.min(100, Math.trunc(Number(safe.scorePct || safe.score_pct || 0)))),
    correctCount: Math.max(0, Math.trunc(Number(safe.correctCount || safe.correct_count || 0))),
    totalQuestions: Math.max(1, Math.trunc(Number(safe.totalQuestions || safe.total_questions || 1))),
    awardedXp: Math.max(0, Math.trunc(Number(safe.awardedXp || safe.awarded_xp || 0))),
    awardedCoins: Math.max(0, Math.trunc(Number(safe.awardedCoins || safe.awarded_coins || 0))),
    rankingGain: Math.max(0, Math.trunc(Number(safe.rankingGain || safe.ranking_gain || 0))),
    createdAt,
    timestampMs: timestampMs || Date.parse(createdAt) || Date.now()
  };
}

export function readPlayerQuizHistoryLocal(userId = '') {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getPlayerQuizHistoryStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizePlayerQuizHistoryEntry(entry))
      .sort((a, b) => Math.max(0, Number(b.timestampMs || 0)) - Math.max(0, Number(a.timestampMs || 0)))
      .slice(0, PLAYER_QUIZ_HISTORY_MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function writePlayerQuizHistoryLocal(userId = '', entries = []) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = (Array.isArray(entries) ? entries : [])
      .map((entry) => normalizePlayerQuizHistoryEntry(entry))
      .sort((a, b) => Math.max(0, Number(b.timestampMs || 0)) - Math.max(0, Number(a.timestampMs || 0)))
      .slice(0, PLAYER_QUIZ_HISTORY_MAX_ENTRIES);
    window.localStorage.setItem(getPlayerQuizHistoryStorageKey(userId), JSON.stringify(normalized));
  } catch {
    // ignore storage failures
  }
}

export function appendPlayerQuizHistoryLocal(userId = '', entry = null) {
  const normalizedEntry = normalizePlayerQuizHistoryEntry(entry);
  const current = readPlayerQuizHistoryLocal(userId);
  const next = [
    normalizedEntry,
    ...current.filter((row) => String(row?.id || '').trim() !== normalizedEntry.id)
  ].slice(0, PLAYER_QUIZ_HISTORY_MAX_ENTRIES);
  writePlayerQuizHistoryLocal(userId, next);
  return next;
}

export function getSeenQuestionsStorageKey(userId = '') {
  const safeUserId = String(userId || 'guest').trim() || 'guest';
  return `${SEEN_QUESTIONS_STORAGE_PREFIX}_${safeUserId}`;
}

// Perguntas que o jogador já viu (PvE e PvP), da mais antiga para a mais recente.
export function readSeenQuestionKeysLocal(userId = '') {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getSeenQuestionsStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((key) => String(key || '').trim())
      .filter(Boolean)
      .slice(-SEEN_QUESTIONS_MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function appendSeenQuestionsLocal(userId = '', questions = []) {
  const keys = (Array.isArray(questions) ? questions : [questions])
    .map((question) => getQuestionHistoryKey(question))
    .filter(Boolean);
  if (!keys.length || typeof window === 'undefined') return;
  try {
    const keySet = new Set(keys);
    const next = [
      ...readSeenQuestionKeysLocal(userId).filter((key) => !keySet.has(key)),
      ...keySet
    ].slice(-SEEN_QUESTIONS_MAX_ENTRIES);
    window.localStorage.setItem(getSeenQuestionsStorageKey(userId), JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

export function buildDefaultShopCategoryState() {
  return {
    frame: { ...SHOP_CATEGORY_OPEN_DEFAULT },
    background: { ...SHOP_CATEGORY_OPEN_DEFAULT },
    emoji: { ...SHOP_CATEGORY_OPEN_DEFAULT }
  };
}

export function normalizeShopTab(tabInput = 'frame') {
  const safeTab = String(tabInput || '').trim();
  return SHOP_UI_TABS.includes(safeTab) ? safeTab : 'frame';
}

export function normalizeShopOwnershipFilter(value = 'all') {
  const safeValue = String(value || '').trim().toLowerCase();
  return SHOP_OWNERSHIP_FILTERS.includes(safeValue) ? safeValue : 'all';
}

export function normalizeShopCategoryOpenState(input) {
  const source = input && typeof input === 'object' ? input : {};
  const normalized = buildDefaultShopCategoryState();
  SHOP_UI_TABS.forEach((tab) => {
    const sourceTab = source[tab] && typeof source[tab] === 'object' ? source[tab] : {};
    const nextTabState = {};
    SHOP_RARITY_ORDER.forEach((rarity) => {
      nextTabState[rarity] = Object.prototype.hasOwnProperty.call(sourceTab, rarity)
        ? Boolean(sourceTab[rarity])
        : true;
    });
    normalized[tab] = nextTabState;
  });
  return normalized;
}

export function isShopCategoryOpenStateEqual(currentState, nextState) {
  const safeCurrent = currentState && typeof currentState === 'object' ? currentState : {};
  const safeNext = nextState && typeof nextState === 'object' ? nextState : {};
  for (const tab of SHOP_UI_TABS) {
    for (const rarity of SHOP_RARITY_ORDER) {
      if (Boolean(safeCurrent?.[tab]?.[rarity]) !== Boolean(safeNext?.[tab]?.[rarity])) {
        return false;
      }
    }
  }
  return true;
}

export const KNOWLEDGE_AREAS = [
  { id: 'programming', name: 'Programação', icon: '💻', color: '#3b82f6', desc: 'Linguagens, lógica e fundamentos da computação.' },
  { id: 'general_knowledge', name: 'Assuntos Gerais', icon: '🌍', color: '#14b8a6', desc: 'Curiosidades, história, cultura, ciência e temas do cotidiano.' },
  { id: 'theology', name: 'Teologia', icon: '✝️', color: '#a855f7', desc: 'Estudos bíblicos, história cristã e doutrinas.' },
];

export const LEGACY_LANGUAGE_REDIRECT_BY_TOPIC = {
  curiosidades_mundo: 'mundo_cultura',
  geografia_culturas: 'mundo_cultura',
  historia_geral: 'historia_sociedade',
  cotidiano_sociedade: 'historia_sociedade',
  ciencia_espaco: 'ciencia_criatividade',
  artes_entretenimento: 'ciencia_criatividade'
};

export function normalizeLegacyLanguageId(languageId = '', topicId = '') {
  const safeLanguageId = String(languageId || '').trim();
  if (safeLanguageId !== 'assuntos_gerais') return safeLanguageId;
  const safeTopicId = String(topicId || '').trim();
  return LEGACY_LANGUAGE_REDIRECT_BY_TOPIC[safeTopicId] || 'mundo_cultura';
}

export function getLegacyGeneralKnowledgeQuizKey(languageId = '', topicId = '', difficulty = 'easy') {
  const safeLanguageId = String(languageId || '').trim();
  const safeTopicId = String(topicId || '').trim();
  if (!safeTopicId) return '';
  if (!['mundo_cultura', 'historia_sociedade', 'ciencia_criatividade'].includes(safeLanguageId)) return '';
  if (!LEGACY_LANGUAGE_REDIRECT_BY_TOPIC[safeTopicId]) return '';
  return getQuizKey('assuntos_gerais', safeTopicId, difficulty);
}

export const LANGUAGE_THEME_GROUPS = [
  {
    id: 'foundations',
    area: 'programming',
    label: 'Fundamentos e Lógica',
    desc: 'Base de raciocínio, lógica e matemática para programação.',
    languages: [
      'zero_to_code',
      'logic_prog',
      'fundamentos_programacao',
      'math'
    ]
  },
  {
    id: 'computing_core',
    area: 'programming',
    label: 'Computação e História',
    desc: 'Fundamentos de computação, sistemas e evolução da tecnologia.',
    languages: [
      'fundamentos_computacao',
      'historia_computacao'
    ]
  },
  {
    id: 'web',
    area: 'programming',
    label: 'Desenvolvimento Web',
    desc: 'Trilhas para criar interfaces e apps na web.',
    languages: ['javascript', 'html_css', 'sql']
  },
  {
    id: 'backend',
    area: 'programming',
    label: 'Linguagens de Programação',
    desc: 'Aprofunde em linguagens usadas no mercado.',
    languages: ['python', 'java', 'c']
  },
  {
    id: 'general_world',
    area: 'general_knowledge',
    label: 'Mundo e Sociedade',
    desc: 'Curiosidades, geografia, história e vida em sociedade em trilhas mais claras.',
    languages: ['mundo_cultura', 'historia_sociedade']
  },
  {
    id: 'general_creative',
    area: 'general_knowledge',
    label: 'Ciência e Criatividade',
    desc: 'Descobertas, universo, artes e entretenimento com organização própria.',
    languages: ['ciencia_criatividade']
  },
  {
    id: 'bible',
    area: 'theology',
    label: 'Estudos Biblicos',
    desc: 'Antigo e Novo Testamento, parabolas e historia sagrada.',
    languages: ['biblia_at', 'biblia_nt']
  },
  {
    id: 'doctrine_history',
    area: 'theology',
    label: 'Doutrinas e Historia',
    desc: 'Fundamentos da fe crista e a historia da Igreja.',
    languages: ['doutrinas', 'historia_igreja']
  }
];

export function getKnowledgeAreaIndex(areaId = '') {
  const safeAreaId = String(areaId || '').trim();
  const idx = KNOWLEDGE_AREAS.findIndex((area) => area.id === safeAreaId);
  return idx >= 0 ? idx : 0;
}

export function getLanguageIdsByKnowledgeArea(areaId = '') {
  const safeAreaId = String(areaId || '').trim();
  const unique = new Set();
  LANGUAGE_THEME_GROUPS.forEach((group) => {
    if (String(group?.area || '').trim() !== safeAreaId) return;
    const ids = Array.isArray(group?.languages) ? group.languages : [];
    ids.forEach((id) => {
      const safeId = String(id || '').trim();
      if (safeId) unique.add(safeId);
    });
  });
  return Array.from(unique);
}

export function resolveKnowledgeAreaByLanguageId(languageId = '') {
  const safeLanguageId = normalizeLegacyLanguageId(languageId);
  if (!safeLanguageId) return KNOWLEDGE_AREAS[0]?.id || 'programming';
  const group = LANGUAGE_THEME_GROUPS.find((row) => (
    Array.isArray(row?.languages) && row.languages.includes(safeLanguageId)
  ));
  const resolved = String(group?.area || '').trim();
  if (KNOWLEDGE_AREAS.some((area) => area.id === resolved)) return resolved;
  return KNOWLEDGE_AREAS[0]?.id || 'programming';
}

export function getPreferredLanguageByKnowledgeArea(areaId = '', fallbackLanguageId = '') {
  const areaLanguageIds = getLanguageIdsByKnowledgeArea(areaId);
  const fallbackId = normalizeLegacyLanguageId(fallbackLanguageId);
  if (fallbackId && areaLanguageIds.includes(fallbackId)) return fallbackId;
  return areaLanguageIds[0] || fallbackId || LANGUAGES[0]?.id || '';
}

export const ADMIN_HISTORY_FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'pvp', label: 'PvP' },
  { id: 'users', label: 'PvP de usuários' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'user_quiz', label: 'Quiz de usuários' }
];

export const QUEUE_DEBUG_LOG_MAX_ENTRIES = 1000;
export const queueDebugLogBuffer = [];

export function appendQueueDebugLogLine(line = '') {
  const safeLine = String(line || '').trim();
  if (!safeLine) return;
  queueDebugLogBuffer.push(safeLine);
  if (queueDebugLogBuffer.length > QUEUE_DEBUG_LOG_MAX_ENTRIES) {
    queueDebugLogBuffer.splice(0, queueDebugLogBuffer.length - QUEUE_DEBUG_LOG_MAX_ENTRIES);
  }
  try {
    if (typeof window !== 'undefined') {
      window.__CODEQUIZ_QUEUE_DEBUG_LOGS = [...queueDebugLogBuffer];
    }
  } catch {
    // ignore debug mirror failures
  }
}

export function withTimeout(promise, timeoutMs, label = 'operation') {
  const baseTimeoutMs = Math.max(1000, Number(timeoutMs || 0));
  const isMobile = isLikelyMobileWeb();
  let timeoutMultiplier = 1;
  if (isMobile) {
    if (baseTimeoutMs <= 1200) timeoutMultiplier = 3;
    else if (baseTimeoutMs <= 2200) timeoutMultiplier = 2.4;
    else if (baseTimeoutMs <= 5000) timeoutMultiplier = 2;
    else timeoutMultiplier = 1.5;
  }
  const safeTimeoutMs = Math.max(1000, Math.min(45000, Math.round(baseTimeoutMs * timeoutMultiplier)));
  const safeLabel = String(label || 'operation').trim() || 'operation';
  let timerId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const timeoutError = new Error(`timeout:${safeLabel}`);
      timeoutError.code = 'app/timeout';
      timeoutError.label = safeLabel;
      timeoutError.timeout_ms = safeTimeoutMs;
      if (isMobile) {
        appendQueueDebugLogLine(
          `[MOBILE_TIMEOUT ${new Date().toISOString()}] ${safeLabel} | timeoutMs=${safeTimeoutMs}`
        );
        console.warn('[MOBILE_TIMEOUT]', {
          label: safeLabel,
          timeoutMs: safeTimeoutMs
        });
      }
      reject(timeoutError);
    }, safeTimeoutMs);
  });

  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
    if (timerId) clearTimeout(timerId);
  });
}

export function getQueueDisconnectGraceMs() {
  return isLikelyMobileWeb()
    ? PVP_QUEUE_DISCONNECT_GRACE_MOBILE_MS
    : PVP_QUEUE_DISCONNECT_GRACE_MS;
}

export function queueFlowLog(step, meta = {}) {
  try {
    const safeStep = String(step || '').trim() || 'unknown_step';
    const safeMeta = meta && typeof meta === 'object' ? meta : {};
    const stamp = new Date().toISOString();
    const STEP_ALIAS = {
      'join_queue:start': 'join:start',
      'join_queue:upsert_success': 'join:ok',
      'join_queue:cancelled_after_upsert': 'join:cancelled',
      'join_queue:error': 'join:err',
      'cancel_queue:start': 'cancel:start',
      'cancel_queue:override_busy': 'cancel:override',
      'cancel_queue:done': 'cancel:ok',
      'resume_queue_after_refused:start': 'resume:start',
      'resume_queue_after_refused:success': 'resume:ok',
      'resume_queue_after_refused:error': 'resume:err',
      'attach_match:start': 'attach:start',
      'attach_match:done': 'attach:ok',
      'matchmaking_tick:start': 'mm:start',
      'matchmaking_tick:open_match_found': 'mm:open_match',
      'matchmaking_tick:open_match_ignored_old_session': 'mm:open_old_session',
      'matchmaking_tick:open_match_before_min_window': 'mm:open_before_15s',
      'matchmaking_tick:closed_stale_pending_accept': 'mm:close_stale_pending',
      'matchmaking_tick:queue_missing_or_not_waiting': 'mm:queue_missing',
      'matchmaking_tick:no_bot_match_at': 'mm:wait_bot_time',
      'matchmaking_tick:human_match_created': 'mm:human_created',
      'matchmaking_tick:no_bot_candidates': 'mm:no_bot',
      'matchmaking_tick:bot_lock_failed': 'mm:lock_fail',
      'matchmaking_tick:bot_lock_acquired': 'mm:lock_ok',
      'matchmaking_tick:context_fetch_start': 'mm:ctx_start',
      'matchmaking_tick:context_fetch_done': 'mm:ctx_done',
      'matchmaking_tick:my_open_match_reused': 'mm:reuse_my_match',
      'matchmaking_tick:bot_open_match_busy': 'mm:bot_busy',
      'matchmaking_tick:queue_recovered_from_local_snapshot': 'mm:queue_local_ok',
      'matchmaking_tick:queue_recreated_after_lock': 'mm:queue_recreated',
      'matchmaking_tick:queue_fetch_missing_after_lock': 'mm:queue_missing_after_lock',
      'matchmaking_tick:my_queue_not_waiting_after_lock': 'mm:queue_not_waiting',
      'matchmaking_tick:bot_category_override': 'mm:bot_cat_override',
      'matchmaking_tick:no_questions_for_bot_match': 'mm:no_questions',
      'matchmaking_tick:bot_match_create_failed': 'mm:bot_create_fail',
      'matchmaking_tick:bot_create_blocked_before_min_window': 'mm:bot_blocked_15s',
      'matchmaking_tick:bot_busy_mark_failed': 'mm:bot_busy_mark_fail',
      'matchmaking_tick:bot_busy_mark_failed_non_blocking': 'mm:bot_busy_mark_fail',
      'matchmaking_tick:bot_prepared': 'mm:prepared',
      'matchmaking_tick:bot_match_created': 'mm:bot_created',
      'matchmaking_tick:error': 'mm:error',
      'runtime_preload:start': 'pre:start',
      'runtime_preload:done': 'pre:ok',
      'queue_action_busy:watchdog_reset': 'ui:queue_busy_reset',
      'match_accept_busy:watchdog_reset': 'ui:accept_busy_reset',
      'queue_connection_watch:recover_match': 'conn:recover_match',
      'queue_connection_watch:queue_kept': 'conn:queue_kept',
      'progress_validator:local_cache_missing_remote_available': 'sync:local_missing',
      'progress_sync:blocked_rollback_guard': 'sync:block',
      'progress_recovery:restored_remote': 'sync:recover'
    };
    const KEY_ALIAS = {
      userId: 'u',
      botId: 'b',
      matchId: 'm',
      status: 'st',
      currentStatus: 'cst',
      queueStatus: 'qst',
      difficulty: 'dif',
      elapsedMs: 'ms',
      queue_elapsed_seconds: 'qsec',
      sla_in_window_17_5_24s: 'sla',
      screen: 'scr',
      message: 'msg'
    };
    const pickKeys = [
      'userId', 'botId', 'matchId', 'status', 'currentStatus', 'queueStatus',
      'difficulty', 'elapsedMs', 'queue_elapsed_seconds', 'sla_in_window_17_5_24s',
      'screen', 'message'
    ];
    const shortStep = STEP_ALIAS[safeStep] || safeStep;
    const parts = [];
    pickKeys.forEach((key) => {
      if (!(key in safeMeta)) return;
      const label = KEY_ALIAS[key] || key;
      const value = safeMeta[key];
      if (value === null || typeof value === 'undefined') return;
      let rendered = '';
      if (typeof value === 'boolean') rendered = value ? '1' : '0';
      else if (typeof value === 'number') rendered = Number.isFinite(value) ? String(value) : 'nan';
      else if (typeof value === 'string') rendered = value.length > 28 ? `${value.slice(0, 28)}...` : value;
      else rendered = '[obj]';
      if (!rendered) return;
      parts.push(`${label}=${rendered}`);
    });
    const suffix = parts.length ? ` | ${parts.join(' ')}` : '';
    const line = `[QF ${stamp}] ${shortStep}${suffix}`;
    appendQueueDebugLogLine(line);
    console.log(line);
  } catch {
    // ignore logging failures
  }
}

export const MENU_MUSIC_TRACKS = [
  {
    id: 'skyline_arcade',
    name: 'Skyline Arcade',
    engine: 'menu_balanced',
    tempoMs: 320,
    melody: [
      261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, null,
      293.66, 329.63, 369.99, 440.0, 392.0, 329.63, 293.66, null,
      329.63, 369.99, 415.3, 493.88, 440.0, 392.0, 369.99, null,
      293.66, 329.63, 349.23, 392.0, 349.23, 329.63, 293.66, null
    ],
    bass: [
      98.0, 98.0, 110.0, 123.47, 92.5, 92.5, 98.0, 110.0
    ],
    chords: [146.83, 164.81, 185.0, 220.0, 138.59, 146.83, 164.81, 196.0]
  },
  {
    id: 'ode_to_joy_arcade',
    name: 'Ode to Joy Arcade',
    engine: 'menu_balanced',
    tempoMs: 330,
    melody: [
      329.63, 329.63, 349.23, 392.0, 392.0, 349.23, 329.63, 293.66,
      261.63, 261.63, 293.66, 329.63, 329.63, 293.66, 293.66, null,
      329.63, 329.63, 349.23, 392.0, 392.0, 349.23, 329.63, 293.66,
      261.63, 261.63, 293.66, 329.63, 293.66, 261.63, 261.63, null
    ],
    bass: [
      130.81, 130.81, 146.83, 164.81, 174.61, 164.81, 146.83, 130.81
    ],
    chords: [196.0, 220.0, 246.94, 261.63, 220.0, 196.0, 174.61, 196.0]
  },
  {
    id: 'greensleeves_reverie',
    name: 'Greensleeves Reverie',
    engine: 'menu_balanced',
    tempoMs: 350,
    melody: [
      440.0, 523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 493.88,
      392.0, 440.0, 493.88, 523.25, 587.33, 493.88, 392.0, 440.0,
      440.0, 523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 493.88,
      392.0, 440.0, 493.88, 523.25, 493.88, 440.0, 392.0, null
    ],
    bass: [
      220.0, 196.0, 174.61, 164.81, 146.83, 164.81, 174.61, 196.0
    ],
    chords: [329.63, 349.23, 392.0, 440.0, 349.23, 329.63, 293.66, 329.63]
  },
  {
    id: 'alla_turca_arcade',
    name: 'Alla Turca Arcade',
    engine: 'menu_balanced',
    tempoMs: 310,
    melody: [
      659.25, 698.46, 783.99, 880.0, 783.99, 698.46, 659.25, 587.33,
      523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25, null,
      659.25, 698.46, 783.99, 880.0, 987.77, 880.0, 783.99, 698.46,
      659.25, 783.99, 880.0, 987.77, 880.0, 783.99, 698.46, null
    ],
    bass: [
      164.81, 164.81, 174.61, 196.0, 220.0, 196.0, 174.61, 164.81
    ],
    chords: [246.94, 261.63, 293.66, 329.63, 349.23, 329.63, 293.66, 261.63]
  },
  {
    id: 'blue_danube_lounge',
    name: 'Blue Danube Lounge',
    engine: 'menu_balanced',
    tempoMs: 338,
    melody: [
      392.0, 493.88, 587.33, 698.46, 587.33, 493.88, 392.0, null,
      440.0, 523.25, 659.25, 783.99, 659.25, 523.25, 440.0, null,
      493.88, 587.33, 698.46, 880.0, 698.46, 587.33, 493.88, null,
      440.0, 523.25, 659.25, 783.99, 698.46, 587.33, 523.25, null
    ],
    bass: [
      130.81, 146.83, 164.81, 174.61, 196.0, 174.61, 164.81, 146.83
    ],
    chords: [196.0, 220.0, 246.94, 293.66, 261.63, 246.94, 220.0, 196.0]
  },
  {
    id: 'menuet_grid_drive',
    name: 'Menuet Grid Drive',
    engine: 'menu_balanced',
    tempoMs: 326,
    melody: [
      493.88, 554.37, 587.33, 493.88, 440.0, 392.0, 369.99, 440.0,
      493.88, 554.37, 587.33, 659.25, 622.25, 587.33, 554.37, 493.88,
      440.0, 493.88, 554.37, 440.0, 369.99, 329.63, 293.66, 369.99,
      440.0, 493.88, 554.37, 587.33, 554.37, 493.88, 440.0, null
    ],
    bass: [
      123.47, 92.5, 110.0, 123.47, 92.5, 98.0, 110.0, 123.47
    ],
    chords: [246.94, 277.18, 293.66, 329.63, 311.13, 293.66, 277.18, 246.94]
  },
  {
    id: 'kalinka_sunset_run',
    name: 'Kalinka Sunset Run',
    engine: 'menu_balanced',
    tempoMs: 334,
    melody: [
      440.0, 440.0, 493.88, 523.25, 493.88, 440.0, 392.0, 329.63,
      440.0, 440.0, 493.88, 523.25, 587.33, 523.25, 493.88, 440.0,
      392.0, 392.0, 440.0, 493.88, 440.0, 392.0, 349.23, 329.63,
      392.0, 440.0, 493.88, 523.25, 493.88, 440.0, 392.0, null
    ],
    bass: [
      146.83, 146.83, 164.81, 174.61, 196.0, 174.61, 164.81, 146.83
    ],
    chords: [220.0, 246.94, 261.63, 293.66, 329.63, 293.66, 261.63, 220.0]
  },
  {
    id: 'fur_elise_neon',
    name: 'Fur Elise Neon',
    engine: 'menu_balanced',
    tempoMs: 324,
    melody: [
      659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25,
      440.0, null, 261.63, 329.63, 440.0, 493.88, null, 329.63,
      659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25,
      440.0, null, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88
    ],
    bass: [
      110.0, 82.41, 110.0, 82.41, 98.0, 82.41, 98.0, 110.0
    ],
    chords: [220.0, 261.63, 329.63, 293.66, 246.94, 220.0, 246.94, 261.63]
  },
  {
    id: 'canon_d_lights',
    name: 'Canon D Lights',
    engine: 'menu_balanced',
    tempoMs: 336,
    melody: [
      369.99, 329.63, 293.66, 277.18, 246.94, 220.0, 246.94, 277.18,
      293.66, 329.63, 369.99, 440.0, 369.99, 329.63, 293.66, 277.18,
      246.94, 220.0, 246.94, 277.18, 293.66, 329.63, 349.23, 369.99,
      392.0, 440.0, 493.88, 440.0, 392.0, 369.99, 329.63, null
    ],
    bass: [
      146.83, 110.0, 123.47, 92.5, 98.0, 73.42, 98.0, 110.0
    ],
    chords: [220.0, 246.94, 261.63, 233.08, 196.0, 220.0, 246.94, 293.66]
  }
];

export const BATTLE_MUSIC_TRACKS = [
  {
    id: 'assault_convoy',
    name: 'Assault Convoy',
    engine: 'battle_chase',
    tempoMs: 220,
    melody: [
      293.66, 329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 261.63,
      293.66, 329.63, 349.23, 440.0, 392.0, 349.23, 329.63, 293.66
    ],
    bass: [
      82.41, 82.41, 82.41, 98.0, 82.41, 82.41, 73.42, 73.42
    ],
    kick: [52, null, 52, null, 58, null, 52, null]
  },
  {
    id: 'infernal_cancan_rush',
    name: 'Infernal Can-Can Rush',
    engine: 'battle_chase',
    tempoMs: 198,
    melody: [
      392.0, 329.63, 329.63, 349.23, 293.66, 293.66, 261.63, 293.66,
      329.63, 349.23, 392.0, 440.0, 392.0, 349.23, 329.63, 293.66,
      261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 261.63, 293.66,
      329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 261.63, null
    ],
    bass: [
      98.0, 98.0, 110.0, 123.47, 130.81, 123.47, 110.0, 98.0
    ],
    kick: [60, null, 60, null, 64, null, 60, null]
  },
  {
    id: 'mountain_king_charge',
    name: 'Mountain King Charge',
    engine: 'battle_assault',
    tempoMs: 186,
    melody: [
      220.0, 246.94, 261.63, 293.66, 329.63, 261.63, 329.63, 261.63,
      220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0,
      440.0, 392.0, 349.23, 329.63, 293.66, 261.63, 246.94, 220.0,
      220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0
    ],
    bass: [
      110.0, 110.0, 123.47, 130.81, 146.83, 130.81, 123.47, 110.0
    ],
    kick: [52, null, 52, null, 57, null, 62, null]
  },
  {
    id: 'william_tell_overdrive',
    name: 'William Tell Overdrive',
    engine: 'battle_chase',
    tempoMs: 196,
    melody: [
      392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 392.0, 493.88,
      587.33, 659.25, 783.99, 659.25, 587.33, 493.88, 440.0, 392.0,
      493.88, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33,
      493.88, 440.0, 392.0, 440.0, 493.88, 587.33, 659.25, null
    ],
    bass: [
      98.0, 98.0, 110.0, 123.47, 130.81, 123.47, 110.0, 98.0
    ],
    kick: [58, null, 58, null, 64, null, 58, null]
  },
  {
    id: 'bumblebee_barrage',
    name: 'Bumblebee Barrage',
    engine: 'battle_assault',
    tempoMs: 182,
    melody: [
      659.25, 698.46, 739.99, 783.99, 830.61, 880.0, 932.33, 987.77,
      1046.5, 987.77, 932.33, 880.0, 830.61, 783.99, 739.99, 698.46,
      659.25, 622.25, 587.33, 554.37, 523.25, 554.37, 587.33, 622.25,
      659.25, 698.46, 739.99, 783.99, 830.61, 880.0, 932.33, null
    ],
    bass: [
      123.47, 123.47, 130.81, 146.83, 164.81, 146.83, 130.81, 123.47
    ],
    kick: [62, null, 62, null, 67, null, 62, null]
  },
  {
    id: 'korobeiniki_overclock',
    name: 'Korobeiniki Overclock',
    engine: 'battle_chase',
    tempoMs: 188,
    melody: [
      659.25, 493.88, 523.25, 587.33, 523.25, 493.88, 440.0, 440.0,
      523.25, 659.25, 587.33, 523.25, 493.88, 523.25, 587.33, 659.25,
      523.25, 440.0, 440.0, null, 587.33, 698.46, 880.0, 783.99,
      698.46, 659.25, 523.25, 659.25, 587.33, 523.25, 493.88, null
    ],
    bass: [
      98.0, 98.0, 110.0, 123.47, 130.81, 123.47, 110.0, 98.0
    ],
    kick: [58, null, 58, null, 64, null, 58, null]
  },
  {
    id: 'sugar_plum_blitz',
    name: 'Sugar Plum Blitz',
    engine: 'battle_assault',
    tempoMs: 184,
    melody: [
      523.25, 587.33, 523.25, 440.0, 466.16, 523.25, 466.16, 392.0,
      440.0, 523.25, 440.0, 349.23, 392.0, 440.0, 392.0, 329.63,
      523.25, 587.33, 523.25, 440.0, 466.16, 523.25, 466.16, 392.0,
      440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0, null
    ],
    bass: [
      87.31, 87.31, 98.0, 110.0, 123.47, 110.0, 98.0, 87.31
    ],
    kick: [56, null, 56, null, 61, null, 56, null]
  },
  {
    id: 'valkyrie_stormfront',
    name: 'Valkyrie Stormfront',
    engine: 'battle_assault',
    tempoMs: 190,
    melody: [
      493.88, 587.33, 739.99, 880.0, 739.99, 587.33, 493.88, 587.33,
      739.99, 880.0, 987.77, 880.0, 739.99, 587.33, 493.88, 440.0,
      493.88, 587.33, 739.99, 880.0, 739.99, 587.33, 493.88, 587.33,
      659.25, 739.99, 880.0, 987.77, 880.0, 739.99, 659.25, 587.33
    ],
    bass: [
      98.0, 98.0, 110.0, 123.47, 130.81, 123.47, 110.0, 98.0
    ],
    kick: [60, null, 60, null, 66, null, 60, null]
  },
  {
    id: 'hungarian_dance_overheat',
    name: 'Hungarian Dance Overheat',
    engine: 'battle_chase',
    tempoMs: 194,
    melody: [
      369.99, 440.0, 554.37, 493.88, 440.0, 369.99, 329.63, 369.99,
      440.0, 493.88, 554.37, 659.25, 554.37, 493.88, 440.0, 369.99,
      329.63, 369.99, 440.0, 493.88, 440.0, 369.99, 329.63, 293.66,
      369.99, 440.0, 493.88, 554.37, 493.88, 440.0, 369.99, null
    ],
    bass: [
      92.5, 92.5, 110.0, 123.47, 130.81, 123.47, 110.0, 92.5
    ],
    kick: [58, null, 58, null, 64, null, 58, null]
  }
];

export function normalizeAudioSettings(raw) {
  const next = raw && typeof raw === 'object' ? raw : {};
  return {
    musicEnabled: next.musicEnabled !== false,
    musicVolume: Math.max(0, Math.min(1, Number(next.musicVolume ?? AUDIO_DEFAULTS.musicVolume))),
    sfxEnabled: next.sfxEnabled !== false,
    sfxVolume: Math.max(0, Math.min(1, Number(next.sfxVolume ?? AUDIO_DEFAULTS.sfxVolume)))
  };
}

export function hasMeaningfulProgress(rawProgress) {
  const progress = normalizeProgress(rawProgress);
  const defaultCoins = Math.max(0, Number(defaultProgress().coins || 0));
  if (Math.max(0, Number(getProgressTotalXp(progress) || 0)) > 0) return true;
  if (Math.max(0, Number(progress.bestStreak || 0)) > 0) return true;
  if (Math.max(0, Number(progress.totalCorrect || 0)) > 0) return true;
  if (Math.max(0, Number(progress.totalAnswered || 0)) > 0) return true;
  if (Math.max(0, Number(progress.quizzes || 0)) > 0) return true;
  if (Math.max(0, Number(progress.rankingPoints || 0)) > 0) return true;
  if (Math.max(0, Number(progress.pvpPoints || 0)) > 0) return true;
  if (Math.max(0, Number(progress.pvpBattles || 0)) > 0) return true;
  if (Object.keys(progress.topicProgress || {}).length > 0) return true;
  if (Object.keys(progress.quizBestScores || {}).length > 0) return true;
  if (Object.keys(progress.quizBestStars || {}).length > 0) return true;
  if (Object.keys(progress.quizRewarded || {}).length > 0) return true;
  if (Array.isArray(progress.achievements) && progress.achievements.length > 0) return true;
  if (Math.max(0, Number(progress.coins || 0)) !== defaultCoins) return true;
  return false;
}

export function buildProgressSnapshot(rawProgress) {
  const progress = normalizeProgress(rawProgress);
  const meaningful = hasMeaningfulProgress(progress);
  const totalXp = Math.max(0, Number(getProgressTotalXp(progress) || 0));
  const updatedAtMs = Math.max(0, Number(progress.updatedAt || 0));
  const defaultCoins = Math.max(0, Number(defaultProgress().coins || 0));
  const coinsSignal = Math.abs(
    Math.max(0, Number(progress.coins || 0)) - defaultCoins
  );
  const signalScore = (
    totalXp
    + Math.max(0, Number(progress.pvpPoints || 0)) * 20
    + Math.max(0, Number(progress.pvpBattles || 0)) * 10
    + Math.max(0, Number(progress.rankingPoints || 0))
    + Math.max(0, Number(progress.totalCorrect || 0))
    + coinsSignal
  );
  return {
    meaningful,
    totalXp,
    updatedAtMs,
    signalScore
  };
}

export function buildStatsFromLegacyProgress(rawProgress, fallbackCoins = 0) {
  const progress = normalizeProgress(rawProgress);
  const pvpBattles = Math.max(0, Math.trunc(Number(progress.pvpBattles || 0)));
  const pvpWins = Math.min(pvpBattles, Math.max(0, Math.trunc(Number(progress.pvpWins || 0))));

  return {
    total_xp: Math.max(0, Math.trunc(Number(getProgressTotalXp(progress) || 0))),
    level: Math.max(1, Math.trunc(Number(progress.level || 1))),
    ranking_points: Math.max(0, Math.trunc(Number(progress.rankingPoints || 0))),
    pvp_points: Math.max(0, Math.trunc(Number(progress.pvpPoints || 0))),
    coins: Math.max(0, Math.trunc(Number(fallbackCoins || 0))),
    pvp_battles: pvpBattles,
    pvp_wins: pvpWins,
    pvp_losses: Math.max(0, pvpBattles - pvpWins),
    best_streak: Math.max(0, Math.trunc(Number(progress.bestStreak || 0))),
    total_correct: Math.max(0, Math.trunc(Number(progress.totalCorrect || 0))),
    total_answered: Math.max(0, Math.trunc(Number(progress.totalAnswered || 0))),
    quizzes_completed: Math.max(0, Math.trunc(Number(progress.quizzes || 0))),
    topic_progress: progress.topicProgress && typeof progress.topicProgress === 'object'
      ? progress.topicProgress
      : {},
    quiz_best_scores: progress.quizBestScores && typeof progress.quizBestScores === 'object'
      ? progress.quizBestScores
      : {},
    quiz_best_stars: progress.quizBestStars && typeof progress.quizBestStars === 'object'
      ? progress.quizBestStars
      : {},
    achievement_ids: Array.isArray(progress.achievements) ? progress.achievements : [],
    quiz_rewarded: progress.quizRewarded && typeof progress.quizRewarded === 'object'
      ? progress.quizRewarded
      : {},
    pvp_processed_matches: progress.pvpProcessedMatches && typeof progress.pvpProcessedMatches === 'object'
      ? progress.pvpProcessedMatches
      : {},
    progress_updated_at_ms: Math.max(0, Number(progress.updatedAt || 0))
  };
}
