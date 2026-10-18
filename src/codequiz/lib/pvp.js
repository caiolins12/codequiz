import { normalizeDifficulty } from './utils';

export const PVP_ROUNDS_PER_MATCH = 5;
export const PVP_ROUND_SECONDS = {
  easy: 22,
  medium: 20,
  hard: 17
};

export function buildMatchId(userA, userB) {
  const a = String(userA || '').trim();
  const b = String(userB || '').trim();
  const prefix = a && b
    ? [a, b].sort().join('_')
    : 'match';
  return `pvp_${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function getRoundDurationSeconds(difficulty) {
  const safe = normalizeDifficulty(difficulty || 'easy');
  return Number(PVP_ROUND_SECONDS[safe] || PVP_ROUND_SECONDS.easy);
}

// Assinatura e polling podem entregar a mesma partida fora de ordem.
export function isPvpDuelMatchSnapshotObsolete(current = null, incoming = null) {
  const currentId = String(current?.id || current?.match_id || '').trim();
  const incomingId = String(incoming?.id || incoming?.match_id || '').trim();
  if (!currentId || !incomingId || currentId !== incomingId) return false;

  const currentStatus = String(current?.status || '').trim().toLowerCase();
  const incomingStatus = String(incoming?.status || '').trim().toLowerCase();
  if (currentStatus === 'finished' && incomingStatus !== 'finished') return true;

  const currentRound = Math.max(1, Number(current?.round_no || 1));
  const incomingRound = Math.max(1, Number(incoming?.round_no || 1));
  if (incomingRound !== currentRound) return incomingRound < currentRound;

  const phaseOrder = { pending_accept: 0, active: 1, round_result: 2, finished: 3 };
  return (phaseOrder[incomingStatus] ?? -1) < (phaseOrder[currentStatus] ?? -1);
}

function normalizeAnswer(answer) {
  const safe = answer && typeof answer === 'object' ? answer : {};
  const idx = Number(safe.answer_idx ?? -1);
  const correctIdx = Number(safe.correct_answer_idx ?? -1);
  return {
    ...safe,
    answer_idx: Number.isFinite(idx) ? idx : -1,
    correct_answer_idx: Number.isFinite(correctIdx) ? correctIdx : -1,
    answered_at_ms: Math.max(0, Number(safe.answered_at_ms || 0))
  };
}

function normalizeCorrectIndex(value) {
  const numeric = Number(value ?? -1);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : -1;
}

function readStoredCorrectFlag(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return null;
  if (['true', '1', 'sim', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'nao', 'não', 'no'].includes(normalized)) return false;
  return null;
}

export function isPvpAnswerCorrect(answerRow, correctIndex = -1) {
  const safeAnswer = normalizeAnswer(answerRow);
  const hasAnswer = safeAnswer.answer_idx >= 0;
  if (!hasAnswer) return false;

  const externalCorrectIndex = normalizeCorrectIndex(correctIndex);
  const storedCorrectIndex = normalizeCorrectIndex(safeAnswer.correct_answer_idx);
  const storedCorrect = readStoredCorrectFlag(safeAnswer.is_correct);

  const signals = [];
  if (externalCorrectIndex >= 0) {
    signals.push({
      source: 'external',
      value: safeAnswer.answer_idx === externalCorrectIndex
    });
  }
  if (storedCorrectIndex >= 0) {
    signals.push({
      source: 'stored_index',
      value: safeAnswer.answer_idx === storedCorrectIndex
    });
  }

  if (signals.length >= 2) {
    const trueCount = signals.filter((signal) => signal.value).length;
    const falseCount = signals.length - trueCount;
    if (trueCount !== falseCount) return trueCount > falseCount;
    if (storedCorrect !== null) return storedCorrect;
    return signals.find((signal) => signal.source === 'stored_index')?.value ?? signals[0].value;
  }

  if (signals.length === 1) {
    if (storedCorrect !== null && storedCorrect === signals[0].value) return storedCorrect;
    return signals[0].value;
  }

  if (storedCorrect !== null) return storedCorrect;

  return false;
}

export function resolvePvpCorrectIndex(answerRows = [], fallbackCorrectIndex = -1) {
  const safeFallback = normalizeCorrectIndex(fallbackCorrectIndex);
  const rows = Array.isArray(answerRows)
    ? answerRows
    : (answerRows && typeof answerRows === 'object' ? [answerRows] : []);
  const candidates = rows
    .map((row) => normalizeCorrectIndex(row?.correct_answer_idx))
    .filter((value) => value >= 0);
  if (!candidates.length) return safeFallback;

  const frequency = new Map();
  candidates.forEach((value) => {
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });

  let bestIndex = safeFallback;
  let bestCount = bestIndex >= 0 ? (frequency.get(bestIndex) || 0) : 0;
  candidates.forEach((value) => {
    const count = frequency.get(value) || 0;
    if (count > bestCount) {
      bestIndex = value;
      bestCount = count;
    }
  });

  return bestIndex >= 0 ? bestIndex : candidates[0];
}

export function resolveRoundOutcome({
  question,
  answerPlayer1,
  answerPlayer2,
  player1Id,
  player2Id,
  suddenDeath = false
}) {
  const safeQuestion = question && typeof question === 'object' ? question : {};
  const correctIndex = Number(safeQuestion.answer ?? -1);

  const a1 = normalizeAnswer(answerPlayer1);
  const a2 = normalizeAnswer(answerPlayer2);

  const p1Correct = isPvpAnswerCorrect(a1, correctIndex);
  const p2Correct = isPvpAnswerCorrect(a2, correctIndex);

  // Score reflects individual correctness each round.
  const player1Delta = p1Correct ? 1 : 0;
  const player2Delta = p2Correct ? 1 : 0;

  if (p1Correct && !p2Correct) {
    return {
      winner_user_id: String(player1Id || ''),
      player1_delta: player1Delta,
      player2_delta: player2Delta,
      reason: 'correct_only_p1'
    };
  }

  if (p2Correct && !p1Correct) {
    return {
      winner_user_id: String(player2Id || ''),
      player1_delta: player1Delta,
      player2_delta: player2Delta,
      reason: 'correct_only_p2'
    };
  }

  if (p1Correct && p2Correct) {
    return {
      winner_user_id: null,
      player1_delta: player1Delta,
      player2_delta: player2Delta,
      reason: suddenDeath ? 'sudden_death_both_correct_scored' : 'both_correct_scored'
    };
  }

  return {
    winner_user_id: null,
    player1_delta: player1Delta,
    player2_delta: player2Delta,
    reason: 'draw_or_both_wrong'
  };
}

export function resolveMatchWinner(matchRow) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const p1Score = Number(row.player1_score || 0);
  const p2Score = Number(row.player2_score || 0);
  if (p1Score > p2Score) return String(row.player1_user_id || '');
  if (p2Score > p1Score) return String(row.player2_user_id || '');
  return null;
}

export function getPvpPointsDelta(resultKey) {
  const key = String(resultKey || '').trim().toLowerCase();
  if (key === 'win') return 4;
  if (key === 'draw') return 0;
  return -2;
}

// Placar do jogador na partida: no duelo, o do seu lado; nos modos em grupo, o
// individual.
export function getPvpMatchScoreForUser(matchRow = null, userId = '') {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const uid = String(userId || '').trim();
  if (!uid) return 0;
  if (uid === String(row.player1_user_id || '').trim()) return Math.max(0, Number(row.player1_score || 0));
  if (uid === String(row.player2_user_id || '').trim()) return Math.max(0, Number(row.player2_score || 0));
  const memberScores = row.member_scores && typeof row.member_scores === 'object' ? row.member_scores : {};
  return Math.max(0, Number(memberScores[uid] || 0));
}

// Bônus de ganhos (XP e moedas) pela duração da partida, medida em rodadas ou
// confrontos jogados (cada um leva um tempo parecido e todos os aparelhos chegam ao
// mesmo número). As 5 rodadas de um duelo normal não dão bônus; cada rodada a mais
// soma 5%, até +100%.
export const PVP_DURATION_BONUS_FREE_ROUNDS = PVP_ROUNDS_PER_MATCH;
export const PVP_DURATION_BONUS_PCT_PER_ROUND = 5;
export const PVP_DURATION_BONUS_MAX_PCT = 100;

export function getPvpDurationBonusPct(roundsPlayed = 0) {
  const rounds = Math.max(0, Math.floor(Number(roundsPlayed || 0)));
  const extraRounds = Math.max(0, rounds - PVP_DURATION_BONUS_FREE_ROUNDS);
  return Math.min(PVP_DURATION_BONUS_MAX_PCT, extraRounds * PVP_DURATION_BONUS_PCT_PER_ROUND);
}

export function applyPvpDurationBonus(value = 0, roundsPlayed = 0) {
  const base = Math.max(0, Number(value || 0));
  return Math.round(base * (1 + getPvpDurationBonusPct(roundsPlayed) / 100));
}

export function getPvpPointsDeltaAdvanced(resultKey, context = {}) {
  const key = String(resultKey || '').trim().toLowerCase();
  const decisiveRoundNo = Math.max(
    1,
    Number(
      context?.roundNo
      || context?.matchRow?.ended_round_no
      || context?.battleNo
      || 1
    )
  );
  const uid = String(context?.userId || '').trim();
  const row = context?.matchRow && typeof context.matchRow === 'object' ? context.matchRow : {};
  const endedReason = String(row?.ended_reason || '').trim().toLowerCase();
  const endedBy = String(row?.ended_by_user_id || row?.forfeit_by_user_id || '').trim();
  const winnerId = String(row?.winner_user_id || '').trim();

  if (endedReason === 'forfeit') {
    if (uid && endedBy && uid === endedBy) return -2;
    if (uid && winnerId && uid === winnerId) return 4;
    if (key === 'win') return 4;
    if (key === 'loss') return -2;
  }

  if (key === 'win') {
    if (decisiveRoundNo >= 8) return 8;
    if (decisiveRoundNo >= 6) return 6;
    return 4;
  }

  if (key === 'loss') {
    return -2;
  }

  // Empate: quem acertou pelo menos uma pergunta também ganha pontos (metade da
  // vitória, que cresce do mesmo jeito em partidas mais longas).
  if (key === 'draw' && uid && getPvpMatchScoreForUser(row, uid) > 0) {
    if (decisiveRoundNo >= 8) return 4;
    if (decisiveRoundNo >= 6) return 3;
    return 2;
  }

  return 0;
}

export function getCategoryByPoints(pointsValue) {
  const points = Math.max(0, Number(pointsValue || 0));
  if (points >= 110) {
    return {
      key: 'diamond',
      label: 'Diamante',
      emblem: '💎',
      minPoints: 110,
      maxPoints: null,
      rank: 4
    };
  }
  if (points >= 90) {
    return {
      key: 'platinum',
      label: 'Platina',
      emblem: '✨',
      minPoints: 90,
      maxPoints: 109,
      rank: 3
    };
  }
  if (points >= 60) {
    return {
      key: 'gold',
      label: 'Ouro',
      emblem: '🏆',
      minPoints: 60,
      maxPoints: 89,
      rank: 2
    };
  }
  if (points >= 30) {
    return {
      key: 'silver',
      label: 'Prata',
      emblem: '🥈',
      minPoints: 30,
      maxPoints: 59,
      rank: 1
    };
  }
  return {
    key: 'bronze',
    label: 'Bronze',
    emblem: '🥉',
    minPoints: 0,
    maxPoints: 29,
    rank: 0
  };
}

export function getPvpResultForUser(matchRow, userId) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const uid = String(userId || '').trim();
  const explicitWinnerId = String(row.winner_user_id || '').trim();
  const byScoreWinnerId = resolveMatchWinner(row);
  const endedReason = String(row.ended_reason || '').trim().toLowerCase();
  const endedByUserId = String(row.ended_by_user_id || row.forfeit_by_user_id || '').trim();
  const player1Id = String(row.player1_user_id || '').trim();
  const player2Id = String(row.player2_user_id || '').trim();
  const forfeitWinnerId = endedReason === 'forfeit' && endedByUserId
    ? (endedByUserId === player1Id ? player2Id : player1Id)
    : '';
  const lastRoundWinnerId = String(row.last_round_winner_user_id || '').trim();
  const winnerId = explicitWinnerId || byScoreWinnerId || forfeitWinnerId || lastRoundWinnerId;
  if (!uid) return 'loss';
  // Sem vencedor, o placar terminou igual: empate para os dois.
  if (!winnerId) return 'draw';
  if (winnerId === uid) return 'win';
  return 'loss';
}
