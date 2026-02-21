import { normalizeDifficulty } from './utils';

export const PVP_ROUNDS_PER_MATCH = 5;
export const PVP_ROUND_SECONDS = {
  easy: 20,
  medium: 18,
  hard: 15
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

function normalizeAnswer(answer) {
  const safe = answer && typeof answer === 'object' ? answer : {};
  const idx = Number(safe.answer_idx ?? -1);
  return {
    ...safe,
    answer_idx: Number.isFinite(idx) ? idx : -1,
    answered_at_ms: Math.max(0, Number(safe.answered_at_ms || 0))
  };
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

  const p1Correct = a1.answer_idx >= 0 && a1.answer_idx === correctIndex;
  const p2Correct = a2.answer_idx >= 0 && a2.answer_idx === correctIndex;

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

  return 0;
}

export function getCategoryByPoints(pointsValue) {
  const points = Math.max(0, Number(pointsValue || 0));
  if (points > 180) {
    return {
      key: 'hard',
      label: 'Avancado'
    };
  }
  if (points > 90) {
    return {
      key: 'medium',
      label: 'Intermediario'
    };
  }
  return {
    key: 'easy',
    label: 'Iniciante'
  };
}

export function getPvpResultForUser(matchRow, userId) {
  const row = matchRow && typeof matchRow === 'object' ? matchRow : {};
  const uid = String(userId || '').trim();
  const winnerId = String(row.winner_user_id || '').trim();
  if (!uid) return 'loss';
  if (!winnerId) return 'draw';
  if (winnerId === uid) return 'win';
  return 'loss';
}
