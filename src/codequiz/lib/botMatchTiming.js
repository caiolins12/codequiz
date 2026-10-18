// Duração realista das partidas simuladas entre bots (duelo Bot x Bot e quiz solo).
//
// A automação no servidor roda a cada 2 min, então o relógio do ciclo não serve de
// duração: toda partida ficava com 2:00. Aqui o tempo sai do placar. Cada rodada (ou
// pergunta) leva o tempo de resposta de quem joga (ler + pensar; errar demora mais e
// de vez em quando o jogador hesita) mais as transições da tela. Os tempos do duelo
// foram calibrados com partidas reais de jogadores contra bots (out/2026): ~6 s até a
// 1ª rodada, ~5,4 s de resultado entre rodadas e a partida acaba na última resposta.
// Tudo é determinístico pela semente: a mesma partida sempre tem a mesma duração.

import { TIMER_SECONDS } from './constants';
import { getRoundDurationSeconds, PVP_ROUNDS_PER_MATCH } from './pvp';

const DUEL_OPENING_MS = 6000;
const DUEL_ROUND_RESULT_MS = 5400;
// Quiz solo: sorteio do tema na abertura, clique em "Confirmar resposta" e a tela de
// explicação, lida com mais calma depois de um erro. Com 3 erros o quiz acaba.
const QUIZ_OPENING_MS = 4500;
const QUIZ_CONFIRM_MS = [600, 1600];
const QUIZ_FEEDBACK_CORRECT_MS = [2500, 5000];
const QUIZ_FEEDBACK_WRONG_MS = [5000, 10000];
const QUIZ_LIVES = 3;
// Mesmo tempo por pergunta do quiz dos jogadores (getPveRoundSeconds).
const QUIZ_QUESTION_MS = Math.max(1, Number(TIMER_SECONDS.easy || 30)) * 1000;

const ANSWER_READ_MS = [2500, 6000];
const ANSWER_END_MARGIN_MS = 1500;
const ANSWER_THINK_RATIO_BY_STRENGTH = {
  forte: [0.12, 0.45],
  medio: [0.18, 0.55],
  fraco: [0.25, 0.65]
};
const ANSWER_WRONG_FACTOR = 1.25;
const ANSWER_HESITATE_CHANCE = 0.12;
// Ritmo de cada jogador na partida: uns respondem tudo mais rápido, outros mais devagar.
const ANSWER_PACE = [0.8, 1.4];

// Gerador fixo pela chave (FNV-1a + mulberry32).
function createSeededRandom(seedKey = '') {
  const text = String(seedKey || '');
  let hash = 2166136261;
  for (let idx = 0; idx < text.length; idx += 1) {
    hash ^= text.charCodeAt(idx);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random, [min, max]) {
  return min + random() * (max - min);
}

function toCount(value, fallback = 0) {
  const numeric = Math.trunc(Number(value));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

// O placar diz quantos acertos houve; a semente diz em quais rodadas.
function spreadHits(random, total, hits) {
  const safeHits = Math.min(total, toCount(hits));
  const order = Array.from({ length: total }, (_, idx) => idx);
  for (let idx = total - 1; idx > 0; idx -= 1) {
    const swap = Math.floor(random() * (idx + 1));
    [order[idx], order[swap]] = [order[swap], order[idx]];
  }
  const hitRounds = new Set(order.slice(0, safeHits));
  return order.map((_, idx) => hitRounds.has(idx));
}

function getAnswerMs(random, windowMs, strength, isCorrect, pace = 1) {
  const latestMs = Math.max(1000, windowMs - ANSWER_END_MARGIN_MS);
  const readMs = between(random, ANSWER_READ_MS) * pace;
  const [minRatio, maxRatio] = ANSWER_THINK_RATIO_BY_STRENGTH[String(strength || '').trim().toLowerCase()]
    || ANSWER_THINK_RATIO_BY_STRENGTH.medio;
  // Média de dois sorteios: tempos do meio são mais comuns que os extremos.
  const spread = (random() + random()) / 2;
  let thinkMs = Math.max(0, latestMs - readMs) * (minRatio + spread * (maxRatio - minRatio)) * pace;
  if (!isCorrect) thinkMs *= ANSWER_WRONG_FACTOR;
  let answerMs = readMs + thinkMs;
  if (random() < ANSWER_HESITATE_CHANCE) {
    answerMs += (latestMs - answerMs) * (0.35 + random() * 0.4);
  }
  return Math.max(1000, Math.min(latestMs, answerMs));
}

// Duelo: cada rodada termina quando o mais lento dos dois responde.
export function getBotDuelDurationMs({
  roundsPlayed = PVP_ROUNDS_PER_MATCH,
  scoreA = 0,
  scoreB = 0,
  difficulty = 'easy',
  strengthA = 'medio',
  strengthB = 'medio',
  seedKey = ''
} = {}) {
  const rounds = toCount(roundsPlayed, PVP_ROUNDS_PER_MATCH);
  const random = createSeededRandom(`duel:${seedKey}`);
  const windowMs = getRoundDurationSeconds(difficulty) * 1000;
  const hitsA = spreadHits(random, rounds, scoreA);
  const hitsB = spreadHits(random, rounds, scoreB);
  const paceA = between(random, ANSWER_PACE);
  const paceB = between(random, ANSWER_PACE);
  let totalMs = DUEL_OPENING_MS;
  for (let round = 0; round < rounds; round += 1) {
    const answerA = getAnswerMs(random, windowMs, strengthA, hitsA[round], paceA);
    const answerB = getAnswerMs(random, windowMs, strengthB, hitsB[round], paceB);
    totalMs += Math.max(answerA, answerB);
    if (round < rounds - 1) totalMs += DUEL_ROUND_RESULT_MS;
  }
  return Math.round(totalMs);
}

// Quiz solo: resposta, confirmação e explicação de cada pergunta até o fim ou até
// perder as 3 vidas.
export function getBotQuizDurationMs({
  totalQuestions = 1,
  correctCount = 0,
  strength = 'medio',
  seedKey = ''
} = {}) {
  const questions = toCount(totalQuestions, 1);
  const random = createSeededRandom(`quiz:${seedKey}`);
  const hits = spreadHits(random, questions, correctCount);
  const pace = between(random, ANSWER_PACE);
  let totalMs = QUIZ_OPENING_MS;
  let misses = 0;
  for (let idx = 0; idx < questions; idx += 1) {
    const isCorrect = hits[idx];
    totalMs += getAnswerMs(random, QUIZ_QUESTION_MS, strength, isCorrect, pace);
    totalMs += between(random, QUIZ_CONFIRM_MS);
    totalMs += between(random, isCorrect ? QUIZ_FEEDBACK_CORRECT_MS : QUIZ_FEEDBACK_WRONG_MS);
    if (!isCorrect) misses += 1;
    if (misses >= QUIZ_LIVES) break;
  }
  return Math.round(totalMs);
}
