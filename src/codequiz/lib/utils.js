export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getXPForLevel(level) {
  const safeLevel = Math.max(1, Number(level || 1));
  return 50 + (safeLevel - 1) * 30;
}

export function getQuizKey(language, topic, difficulty) {
  return `${String(language || '')}_${String(topic || '')}_${String(difficulty || '')}`;
}

export function calculateStars(correctCount, totalQuestions) {
  const total = Math.max(1, Number(totalQuestions || 0));
  const ratio = Number(correctCount || 0) / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.65) return 2;
  return 1;
}

export function getProgressTotalXp(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const level = Math.max(1, Math.floor(Number(safeProgress.level || 1)));
  let total = Math.max(0, Math.floor(Number(safeProgress.xp || 0)));
  for (let current = 1; current < level; current += 1) {
    total += getXPForLevel(current);
  }
  return total;
}

export function splitProgressTotalXp(totalXp) {
  let remaining = Math.max(0, Math.floor(Number(totalXp || 0)));
  let level = 1;
  let guard = 0;

  while (guard < 2000) {
    const need = getXPForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
    guard += 1;
  }

  return { level, xp: remaining };
}

export function normalizeDifficulty(value) {
  const input = String(value || '').trim().toLowerCase();
  if (input === 'hard') return 'hard';
  if (input === 'medium') return 'medium';
  return 'easy';
}

export function shuffle(items) {
  const next = Array.isArray(items) ? [...items] : [];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function sanitizeText(value, fallback = '') {
  const safe = String(value || '').trim();
  return safe || fallback;
}

export function formatPercent(correctCount, totalQuestions) {
  const total = Math.max(1, Number(totalQuestions || 1));
  return Math.round((Number(correctCount || 0) / total) * 100);
}