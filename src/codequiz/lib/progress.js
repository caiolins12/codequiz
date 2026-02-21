import {
  COINS_PER_CORRECT,
  PVE_COMPLETION_COINS_BONUS,
  PVE_COMPLETION_XP_BONUS,
  XP_PER_CORRECT
} from './constants';
import { evaluateAchievements } from './achievements';
import {
  calculateStars,
  formatPercent,
  getProgressTotalXp,
  getQuizKey,
  getXPForLevel,
  normalizeDifficulty,
  splitProgressTotalXp
} from './utils';

const GUEST_PROGRESS_KEY = 'codequiz_progress_guest_v2';

export function defaultProgress() {
  return {
    xp: 0,
    level: 1,
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    quizzes: 0,
    coins: 20,
    topicProgress: {},
    achievements: [],
    rankingPoints: 0,
    pvpPoints: 0,
    pvpWins: 0,
    pvpBattles: 0,
    pvpProcessedMatches: {},
    quizBestScores: {},
    quizBestStars: {},
    quizRewarded: {},
    updatedAt: 0
  };
}

export function getProgressStorageKey(userId) {
  const uid = String(userId || '').trim();
  if (!uid) return GUEST_PROGRESS_KEY;
  return `codequiz_progress_${uid}`;
}

export function normalizeProgress(progress) {
  const base = defaultProgress();
  const safe = progress && typeof progress === 'object' ? progress : {};

  return {
    ...base,
    ...safe,
    xp: Math.max(0, Math.floor(Number(safe.xp || 0))),
    level: Math.max(1, Math.floor(Number(safe.level || 1))),
    bestStreak: Math.max(0, Math.floor(Number(safe.bestStreak || 0))),
    totalCorrect: Math.max(0, Math.floor(Number(safe.totalCorrect || 0))),
    totalAnswered: Math.max(0, Math.floor(Number(safe.totalAnswered || 0))),
    quizzes: Math.max(0, Math.floor(Number(safe.quizzes || 0))),
    coins: Math.max(0, Math.floor(Number(safe.coins || 0))),
    rankingPoints: Math.max(0, Math.floor(Number(safe.rankingPoints || 0))),
    pvpPoints: Math.max(0, Math.floor(Number(safe.pvpPoints || 0))),
    pvpWins: Math.max(0, Math.floor(Number(safe.pvpWins || 0))),
    pvpBattles: Math.max(0, Math.floor(Number(safe.pvpBattles || 0))),
    pvpProcessedMatches: safe.pvpProcessedMatches && typeof safe.pvpProcessedMatches === 'object' ? safe.pvpProcessedMatches : {},
    topicProgress: safe.topicProgress && typeof safe.topicProgress === 'object' ? safe.topicProgress : {},
    achievements: Array.isArray(safe.achievements) ? safe.achievements : [],
    quizBestScores: safe.quizBestScores && typeof safe.quizBestScores === 'object' ? safe.quizBestScores : {},
    quizBestStars: safe.quizBestStars && typeof safe.quizBestStars === 'object' ? safe.quizBestStars : {},
    quizRewarded: safe.quizRewarded && typeof safe.quizRewarded === 'object' ? safe.quizRewarded : {},
    updatedAt: Math.max(0, Number(safe.updatedAt || 0))
  };
}

export function loadProgress(userId) {
  const key = getProgressStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultProgress();
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(userId, progress) {
  const key = getProgressStorageKey(userId);
  const next = normalizeProgress(progress);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // ignore local storage write failures (Safari private mode / quota)
  }
  return next;
}

export function mergeProgressWithRemoteStats(localProgress, remoteStats) {
  const local = normalizeProgress(localProgress);
  const remote = remoteStats && typeof remoteStats === 'object' ? remoteStats : {};

  const mergeNumericMap = (localMap, remoteMap) => {
    const next = { ...(localMap && typeof localMap === 'object' ? localMap : {}) };
    if (!remoteMap || typeof remoteMap !== 'object') return next;
    Object.entries(remoteMap).forEach(([key, value]) => {
      if (!key) return;
      const localValue = Math.max(0, Number(next[key] || 0));
      const remoteValue = Math.max(0, Number(value || 0));
      next[key] = Math.max(localValue, remoteValue);
    });
    return next;
  };
  const mergeQuizRewardedMap = (localMap, remoteMap) => {
    const next = { ...(localMap && typeof localMap === 'object' ? localMap : {}) };
    if (!remoteMap || typeof remoteMap !== 'object') return next;
    Object.entries(remoteMap).forEach(([quizKey, row]) => {
      if (!quizKey || !row || typeof row !== 'object') return;
      const prev = next[quizKey] && typeof next[quizKey] === 'object'
        ? next[quizKey]
        : {};
      next[quizKey] = {
        xp: Math.max(Math.max(0, Number(prev.xp || 0)), Math.max(0, Number(row.xp || 0))),
        coins: Math.max(Math.max(0, Number(prev.coins || 0)), Math.max(0, Number(row.coins || 0)))
      };
    });
    return next;
  };

  const totalXp = Math.max(
    getProgressTotalXp(local),
    Math.max(0, Math.floor(Number(remote.total_xp || 0)))
  );
  const remoteCoins = Number(remote.coins);
  const coins = Number.isFinite(remoteCoins) && remoteCoins >= 0
    ? Math.floor(remoteCoins)
    : Math.max(0, Number(local.coins || 0));

  const xpState = splitProgressTotalXp(totalXp);
  const remoteProcessedMatches = remote.pvp_processed_matches && typeof remote.pvp_processed_matches === 'object'
    ? remote.pvp_processed_matches
    : {};
  const hasRemotePvpSnapshot = Boolean(
    remote && typeof remote === 'object'
    && (
      remote.user_id
      || remote.pvp_points !== undefined
      || remote.pvp_battles !== undefined
      || remote.pvp_wins !== undefined
      || remote.pvp_processed_matches !== undefined
    )
  );
  const remotePvpBattles = Math.max(0, Math.floor(Number(remote.pvp_battles || 0)));
  const remotePvpWins = Math.min(remotePvpBattles, Math.max(0, Math.floor(Number(remote.pvp_wins || 0))));
  const remotePvpPoints = Math.max(0, Math.floor(Number(remote.pvp_points || 0)));
  const remoteAchievementIds = Array.isArray(remote.achievement_ids)
    ? remote.achievement_ids
    : (Array.isArray(remote.achievements) ? remote.achievements : []);
  const mergedAchievements = [...new Set([
    ...(Array.isArray(local.achievements) ? local.achievements : []),
    ...remoteAchievementIds
  ].map((id) => String(id || '').trim()).filter(Boolean))];
  const pvpProcessedMatches = hasRemotePvpSnapshot
    ? remoteProcessedMatches
    : (local.pvpProcessedMatches && typeof local.pvpProcessedMatches === 'object' ? local.pvpProcessedMatches : {});

  const merged = normalizeProgress({
    ...local,
    level: Math.max(xpState.level, Math.floor(Number(remote.level || 1))),
    xp: xpState.xp,
    rankingPoints: Math.max(local.rankingPoints, Math.floor(Number(remote.ranking_points || 0))),
    pvpPoints: hasRemotePvpSnapshot ? remotePvpPoints : local.pvpPoints,
    pvpWins: hasRemotePvpSnapshot ? remotePvpWins : local.pvpWins,
    pvpBattles: hasRemotePvpSnapshot ? remotePvpBattles : local.pvpBattles,
    bestStreak: Math.max(local.bestStreak, Math.floor(Number(remote.best_streak || 0))),
    totalCorrect: Math.max(local.totalCorrect, Math.floor(Number(remote.total_correct || 0))),
    totalAnswered: Math.max(local.totalAnswered, Math.floor(Number(remote.total_answered || 0))),
    quizzes: Math.max(local.quizzes, Math.floor(Number(remote.quizzes_completed || 0))),
    coins,
    pvpProcessedMatches,
    topicProgress: mergeNumericMap(local.topicProgress, remote.topic_progress),
    quizBestScores: mergeNumericMap(local.quizBestScores, remote.quiz_best_scores),
    quizBestStars: mergeNumericMap(local.quizBestStars, remote.quiz_best_stars),
    quizRewarded: mergeQuizRewardedMap(local.quizRewarded, remote.quiz_rewarded),
    achievements: mergedAchievements,
    updatedAt: Date.now()
  });
  const achievementResult = evaluateAchievements(merged);
  return normalizeProgress({
    ...merged,
    achievements: achievementResult.achievementIds,
    updatedAt: Date.now()
  });
}

export function applyQuizOutcome(currentProgress, payload) {
  const next = normalizeProgress(currentProgress);
  const language = String(payload?.language || '').trim();
  const topic = String(payload?.topic || '').trim();
  const difficulty = normalizeDifficulty(payload?.difficulty || 'easy');
  const correctCount = Math.max(0, Math.floor(Number(payload?.correctCount || 0)));
  const totalQuestions = Math.max(1, Math.floor(Number(payload?.totalQuestions || 1)));
  const bestRunStreak = Math.max(0, Math.floor(Number(payload?.bestRunStreak || 0)));

  const quizKey = getQuizKey(language, topic, difficulty);
  const scorePct = formatPercent(correctCount, totalQuestions);

  next.totalCorrect += correctCount;
  next.totalAnswered += totalQuestions;
  next.quizzes += 1;
  next.bestStreak = Math.max(next.bestStreak, bestRunStreak);

  next.topicProgress[quizKey] = Math.max(
    Number(next.topicProgress[quizKey] || 0),
    scorePct
  );

  const prevBestCorrect = Number(next.quizBestScores[quizKey] || 0);
  const newBestCorrect = Math.max(prevBestCorrect, correctCount);
  next.quizBestScores[quizKey] = newBestCorrect;

  const quizAlreadyMastered = prevBestCorrect >= totalQuestions;
  const rankingGain = quizAlreadyMastered ? 0 : Math.max(0, newBestCorrect - prevBestCorrect);
  next.rankingPoints += rankingGain;

  const starsThisRun = calculateStars(correctCount, totalQuestions);
  const bestStars = Math.max(Number(next.quizBestStars[quizKey] || 1), starsThisRun);
  next.quizBestStars[quizKey] = bestStars;

  const prevReward = next.quizRewarded[quizKey] && typeof next.quizRewarded[quizKey] === 'object'
    ? next.quizRewarded[quizKey]
    : { xp: 0, coins: 0 };

  const xpCap = correctCount * Number(XP_PER_CORRECT[difficulty] || 0);
  const coinsCap = correctCount * Number(COINS_PER_CORRECT[difficulty] || 0);
  const awardedXp = Math.max(0, xpCap - Number(prevReward.xp || 0));
  const awardedCoins = Math.max(0, coinsCap - Number(prevReward.coins || 0));

  next.quizRewarded[quizKey] = {
    xp: Math.max(Number(prevReward.xp || 0), xpCap),
    coins: Math.max(Number(prevReward.coins || 0), coinsCap)
  };

  const completionBonusXp = Math.max(0, Number(PVE_COMPLETION_XP_BONUS[difficulty] || 0));
  const completionBonusCoins = Math.max(0, Number(PVE_COMPLETION_COINS_BONUS[difficulty] || 0));

  next.xp += awardedXp + completionBonusXp;
  next.coins += awardedCoins + completionBonusCoins;

  let leveledUp = false;
  while (next.xp >= getXPForLevel(next.level)) {
    next.xp -= getXPForLevel(next.level);
    next.level += 1;
    leveledUp = true;
  }

  const achievementResult = evaluateAchievements(next);
  next.achievements = achievementResult.achievementIds;
  next.updatedAt = Date.now();

  return {
    progress: normalizeProgress(next),
    summary: {
      scorePct,
      starsThisRun,
      bestStars,
      awardedXp: awardedXp + completionBonusXp,
      awardedCoins: awardedCoins + completionBonusCoins,
      completionBonusXp,
      completionBonusCoins,
      rankingGain,
      leveledUp,
      newLevel: next.level,
      quizKey
    },
    unlockedAchievements: achievementResult.unlocked
  };
}
