// Rodízio equilibrado dos bots (duelos entre bots, quiz solo e partidas contra jogadores).
//
// A automação roda sem parar (um duelo e um quiz por ciclo do servidor); aqui só se
// decide QUEM joga. A fila global (pvp_bots_state/arena_queue) guarda quem jogou por
// último no fim; a posição nela é o tempo de espera. Essa espera é ponderada pelo
// progresso de cada bot em relação à média do roster: quem tem menos partidas e pontos
// (os bots mais novos, por exemplo) descansa menos e volta antes; quem está acima da
// média descansa mais. Conforme os bots se equiparam, o fator tende a 1 e a ordem vira
// um rodízio simples. Tudo é determinístico (mesmos dados, mesma ordem), sem sorteio.

const PVP_SMOOTHING = { battles: 3, points: 12 };
const QUIZ_SMOOTHING = { xp: 60, quizzes: 2, rankingPoints: 10 };
// Expoente e limites do fator de descanso: com o progresso na metade da média o bot
// descansa ~1/4 do normal; com o dobro, ~4x.
const REST_EXPONENT = 2;
const REST_MIN = 0.25;
const REST_MAX = 4;
// Vantagem do bot atrasado no duelo entre bots (pontos de precisão por unidade de
// diferença de progresso), com teto. Some quando os dois estão no mesmo nível.
const DUEL_EDGE_PER_GAP = 0.08;
const DUEL_EDGE_MAX = 0.07;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function count(value) {
  return Math.max(0, Number(value || 0)) || 0;
}

function smoothedRatio(value, average, smoothing) {
  return (count(value) + smoothing) / (count(average) + smoothing);
}

// Médias do roster (bots sem stats entram como zero: bot novo é bot atrasado).
export function getBotBalanceAverages(statsById = {}, botIds = []) {
  const ids = (Array.isArray(botIds) ? botIds : []).filter(Boolean);
  const total = { battles: 0, points: 0, xp: 0, quizzes: 0, rankingPoints: 0 };
  ids.forEach((id) => {
    const stats = statsById && typeof statsById === 'object' ? statsById[id] : null;
    total.battles += count(stats?.pvp_battles);
    total.points += count(stats?.pvp_points);
    total.xp += count(stats?.total_xp);
    total.quizzes += count(stats?.quizzes_completed);
    total.rankingPoints += count(stats?.ranking_points);
  });
  const n = Math.max(1, ids.length);
  return {
    battles: total.battles / n,
    points: total.points / n,
    xp: total.xp / n,
    quizzes: total.quizzes / n,
    rankingPoints: total.rankingPoints / n
  };
}

// Progresso do bot em relação à média (1 = na média). mode: 'pvp' (duelos e partidas
// contra jogadores) ou 'quiz' (quiz solo).
export function getBotProgressIndex(stats, averages, mode = 'pvp') {
  const safe = stats && typeof stats === 'object' ? stats : {};
  const avg = averages && typeof averages === 'object' ? averages : {};
  if (mode === 'quiz') {
    return (
      0.5 * smoothedRatio(safe.total_xp, avg.xp, QUIZ_SMOOTHING.xp)
      + 0.3 * smoothedRatio(safe.quizzes_completed, avg.quizzes, QUIZ_SMOOTHING.quizzes)
      + 0.2 * smoothedRatio(safe.ranking_points, avg.rankingPoints, QUIZ_SMOOTHING.rankingPoints)
    );
  }
  return (
    0.45 * smoothedRatio(safe.pvp_battles, avg.battles, PVP_SMOOTHING.battles)
    + 0.55 * smoothedRatio(safe.pvp_points, avg.points, PVP_SMOOTHING.points)
  );
}

export function getBotRestFactor(progressIndex) {
  const safe = Math.max(0.01, Number(progressIndex) || 1);
  return clamp(safe ** REST_EXPONENT, REST_MIN, REST_MAX);
}

// Ordem de quem joga primeiro entre `botIds`. queueOrder: fila global (quem jogou por
// último está no fim). rosterIds: bots usados na média (padrão: os próprios botIds).
// missingAsAverage: bot sem stats conhecidas (cache local incompleto) conta como na
// média, em vez de parecer um bot novo.
export function rankBotsForPlay(botIds, { queueOrder = [], statsById = {}, mode = 'pvp', rosterIds = null, missingAsAverage = false } = {}) {
  const ids = Array.from(new Set((Array.isArray(botIds) ? botIds : []).map((id) => String(id || '').trim()).filter(Boolean)));
  if (ids.length <= 1) return ids;
  const baseIds = Array.isArray(rosterIds) && rosterIds.length ? rosterIds : ids;
  const averages = getBotBalanceAverages(
    statsById,
    missingAsAverage ? baseIds.filter((id) => statsById?.[id]) : baseIds
  );
  const order = Array.isArray(queueOrder) ? queueOrder.map((id) => String(id || '').trim()) : [];
  const position = new Map(order.map((id, index) => [id, index]));
  return ids
    .map((id) => {
      const waitRank = position.has(id) ? position.get(id) : order.length;
      const stats = statsById?.[id];
      const progress = !stats && missingAsAverage ? 1 : getBotProgressIndex(stats, averages, mode);
      const restFactor = getBotRestFactor(progress);
      return { id, waitRank, priority: (waitRank + 1) * restFactor };
    })
    .sort((a, b) => (a.priority - b.priority) || (a.waitRank - b.waitRank) || a.id.localeCompare(b.id))
    .map((entry) => entry.id);
}

// Dupla do duelo entre bots: o primeiro da ordem que tem rival na mesma categoria
// enfrenta, entre os próximos `candidatePool` dessa categoria, o de pontos mais
// próximos (partida mais disputada).
export function pickBalancedDuelPair(rankedIds, { statsById = {}, getCategory = () => 'easy', candidatePool = 4 } = {}) {
  const ids = Array.isArray(rankedIds) ? rankedIds : [];
  const points = (id) => count(statsById?.[id]?.pvp_points);
  for (let index = 0; index < ids.length; index += 1) {
    const botAId = ids[index];
    const category = getCategory(botAId);
    const peers = ids.slice(index + 1).filter((id) => getCategory(id) === category).slice(0, Math.max(1, candidatePool));
    if (!peers.length) continue;
    const pointsA = points(botAId);
    const botBId = peers.reduce((best, id) => (
      Math.abs(points(id) - pointsA) < Math.abs(points(best) - pointsA) ? id : best
    ), peers[0]);
    return { botAId, botBId, category };
  }
  return null;
}

// Bônus de precisão do bot atrasado no duelo entre bots ({ a, b }, um deles é zero).
export function getBotDuelUnderdogEdge(statsA, statsB, averages) {
  const gap = getBotProgressIndex(statsB, averages, 'pvp') - getBotProgressIndex(statsA, averages, 'pvp');
  const edge = clamp(gap * DUEL_EDGE_PER_GAP, -DUEL_EDGE_MAX, DUEL_EDGE_MAX);
  return { a: Math.max(0, edge), b: Math.max(0, -edge) };
}

// ---------------------------------------------------------------------------
// Partidas do dia (só para acompanhar no painel admin; não limita ninguém).
// ---------------------------------------------------------------------------

// Horário de Brasília (UTC-3, sem horário de verão desde 2019).
const BRAZIL_OFFSET_MS = 3 * 60 * 60 * 1000;

export function getBrazilDayKey(msValue = Date.now()) {
  return new Date(Math.max(0, Number(msValue) || 0) - BRAZIL_OFFSET_MS).toISOString().slice(0, 10);
}

// Quanto cada bot jogou hoje. dayStart: { [botId]: { battles, quizzes } } no começo do dia.
export function buildBotDailyCounts(botIds, { statsById = {}, dayStart = {} } = {}) {
  const counts = {};
  (Array.isArray(botIds) ? botIds : []).filter(Boolean).forEach((id) => {
    const stats = statsById?.[id] || {};
    const start = dayStart?.[id] || {};
    counts[id] = {
      pvpToday: Math.max(0, count(stats.pvp_battles) - count(start.battles ?? stats.pvp_battles)),
      quizToday: Math.max(0, count(stats.quizzes_completed) - count(start.quizzes ?? stats.quizzes_completed))
    };
  });
  return counts;
}
