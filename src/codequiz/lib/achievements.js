export const ACHIEVEMENTS = [
  {
    id: 'first_quiz',
    name: 'Primeiro Passo',
    desc: 'Complete seu primeiro quiz',
    icon: '🎯',
    check: (progress) => Number(progress.quizzes || 0) >= 1
  },
  {
    id: 'streak_5',
    name: 'Em Chamas',
    desc: '5 respostas corretas seguidas',
    icon: '🔥',
    check: (progress) => Number(progress.bestStreak || 0) >= 5
  },
  {
    id: 'streak_10',
    name: 'Imparavel',
    desc: '10 respostas corretas seguidas',
    icon: '⚡',
    check: (progress) => Number(progress.bestStreak || 0) >= 10
  },
  {
    id: 'level_5',
    name: 'Aprendiz',
    desc: 'Alcance o nivel 5',
    icon: '📖',
    check: (progress) => Number(progress.level || 1) >= 5
  },
  {
    id: 'level_10',
    name: 'Estudante',
    desc: 'Alcance o nivel 10',
    icon: '🎓',
    check: (progress) => Number(progress.level || 1) >= 10
  },
  {
    id: 'level_20',
    name: 'Mestre',
    desc: 'Alcance o nivel 20',
    icon: '👑',
    check: (progress) => Number(progress.level || 1) >= 20
  },
  {
    id: 'quiz_10',
    name: 'Persistente',
    desc: 'Complete 10 quizzes',
    icon: '💪',
    check: (progress) => Number(progress.quizzes || 0) >= 10
  },
  {
    id: 'quiz_50',
    name: 'Dedicado',
    desc: 'Complete 50 quizzes',
    icon: '🏆',
    check: (progress) => Number(progress.quizzes || 0) >= 50
  },
  {
    id: 'correct_100',
    name: 'Centenario',
    desc: '100 respostas corretas',
    icon: '💯',
    check: (progress) => Number(progress.totalCorrect || 0) >= 100
  },
  {
    id: 'accuracy_master',
    name: 'Precisao Total',
    desc: '80%+ de acerto geral',
    icon: '🎯',
    check: (progress) => {
      const totalAnswered = Number(progress.totalAnswered || 0);
      const totalCorrect = Number(progress.totalCorrect || 0);
      if (totalAnswered < 20) return false;
      return totalCorrect / totalAnswered >= 0.8;
    }
  }
];

export function evaluateAchievements(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const current = new Set(Array.isArray(safeProgress.achievements) ? safeProgress.achievements : []);
  const unlocked = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (current.has(achievement.id)) return;
    if (!achievement.check(safeProgress)) return;
    current.add(achievement.id);
    unlocked.push(achievement);
  });

  return {
    achievementIds: [...current],
    unlocked
  };
}