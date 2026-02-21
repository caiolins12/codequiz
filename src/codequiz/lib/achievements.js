function toInt(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.max(0, Math.trunc(Number(fallback || 0)));
  return Math.max(0, Math.trunc(parsed));
}

function clampPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed <= 0) return 0;
  if (parsed >= 100) return 100;
  return parsed;
}

function buildPassGoal(metric, target, label) {
  return {
    metric: String(metric || '').trim(),
    target: Math.max(1, toInt(target, 1)),
    label: String(label || '').trim() || 'Complete o objetivo'
  };
}

export const EVOLUTION_PASS_STAGES = [
  {
    id: 'pass_lvl_01',
    level: 1,
    name: 'Inicio Guiado',
    desc: 'Domine o basico do quiz e ganhe ritmo.',
    icon: '🧭',
    hint: 'Comece por temas faceis e finalize suas primeiras rodadas.',
    reward: { xp: 20, coins: 8 },
    goals: [
      buildPassGoal('quizzes', 1, 'Complete 1 quiz'),
      buildPassGoal('total_correct', 5, 'Acerte 5 perguntas')
    ]
  },
  {
    id: 'pass_lvl_02',
    level: 2,
    name: 'Fundamentos',
    desc: 'Construa sua base de pontos no PVE.',
    icon: '📘',
    hint: 'Repita os quizzes iniciais para subir seu score.',
    reward: { xp: 28, coins: 10 },
    goals: [
      buildPassGoal('quizzes', 3, 'Complete 3 quizzes'),
      buildPassGoal('ranking_points', 20, 'Alcance 20 pontos PVE')
    ]
  },
  {
    id: 'pass_lvl_03',
    level: 3,
    name: 'Foco em Acertos',
    desc: 'Aumente consistencia antes de entrar forte no PVP.',
    icon: '🎯',
    hint: 'Jogue com calma para errar menos.',
    reward: { xp: 34, coins: 12 },
    goals: [
      buildPassGoal('total_correct', 20, 'Acerte 20 perguntas'),
      buildPassGoal('best_streak', 4, 'Faca streak de 4')
    ]
  },
  {
    id: 'pass_lvl_04',
    level: 4,
    name: 'Primeiros Duelo',
    desc: 'Entre no fluxo competitivo.',
    icon: '⚔️',
    hint: 'Teste partidas curtas para aprender o tempo das rodadas.',
    reward: { xp: 40, coins: 14 },
    goals: [
      buildPassGoal('pvp_battles', 1, 'Jogue 1 partida PVP'),
      buildPassGoal('pvp_points', 20, 'Alcance 20 pontos PVP')
    ]
  },
  {
    id: 'pass_lvl_05',
    level: 5,
    name: 'Rotina de Treino',
    desc: 'Consolide progresso em diferentes quizzes.',
    icon: '🏋️',
    hint: 'Varie temas para abrir mais progresso geral.',
    reward: { xp: 48, coins: 16 },
    goals: [
      buildPassGoal('ranking_points', 60, 'Alcance 60 pontos PVE'),
      buildPassGoal('mastered_quizzes', 2, 'Conquiste 2 quizzes com 3 estrelas')
    ]
  },
  {
    id: 'pass_lvl_06',
    level: 6,
    name: 'Arena Ativa',
    desc: 'Ganhe experiencia real contra oponentes.',
    icon: '🛡️',
    hint: 'Mais partidas = melhor leitura de tempo e rodada final.',
    reward: { xp: 56, coins: 18 },
    goals: [
      buildPassGoal('pvp_battles', 4, 'Jogue 4 partidas PVP'),
      buildPassGoal('pvp_wins', 1, 'Conquiste 1 vitoria PVP'),
      buildPassGoal('pvp_points', 80, 'Alcance 80 pontos PVP')
    ]
  },
  {
    id: 'pass_lvl_07',
    level: 7,
    name: 'Volume de Estudo',
    desc: 'Ganhe tracao com constancia.',
    icon: '📚',
    hint: 'Complete quizzes em sequencia para subir rapido.',
    reward: { xp: 66, coins: 20 },
    goals: [
      buildPassGoal('quizzes', 12, 'Complete 12 quizzes'),
      buildPassGoal('total_correct', 70, 'Acerte 70 perguntas')
    ]
  },
  {
    id: 'pass_lvl_08',
    level: 8,
    name: 'Sequencia Forte',
    desc: 'Mostre controle em rodada continua.',
    icon: '🔥',
    hint: 'Foque em manter sequencia de acertos.',
    reward: { xp: 74, coins: 22 },
    goals: [
      buildPassGoal('best_streak', 8, 'Faca streak de 8'),
      buildPassGoal('total_correct', 120, 'Acerte 120 perguntas')
    ]
  },
  {
    id: 'pass_lvl_09',
    level: 9,
    name: 'Leitura Tatica',
    desc: 'Suba no PVP com consistencia.',
    icon: '🧠',
    hint: 'Priorize precisao e nao apenas velocidade.',
    reward: { xp: 84, coins: 24 },
    goals: [
      buildPassGoal('pvp_battles', 8, 'Jogue 8 partidas PVP'),
      buildPassGoal('pvp_wins', 3, 'Conquiste 3 vitorias PVP'),
      buildPassGoal('pvp_points', 140, 'Alcance 140 pontos PVP')
    ]
  },
  {
    id: 'pass_lvl_10',
    level: 10,
    name: 'Patamar Intermediario',
    desc: 'Entre no nivel intermediario com base solida.',
    icon: '🏅',
    hint: 'Chegue no nivel 10 e estabilize seu PVE.',
    reward: { xp: 96, coins: 28 },
    goals: [
      buildPassGoal('level', 10, 'Alcance nivel 10'),
      buildPassGoal('ranking_points', 180, 'Alcance 180 pontos PVE')
    ]
  },
  {
    id: 'pass_lvl_11',
    level: 11,
    name: 'Especialista PVE I',
    desc: 'Aumente dominio tecnico em quizzes.',
    icon: '🧪',
    hint: 'Busque 3 estrelas em mais categorias.',
    reward: { xp: 108, coins: 30 },
    goals: [
      buildPassGoal('quizzes', 24, 'Complete 24 quizzes'),
      buildPassGoal('mastered_quizzes', 6, 'Conquiste 6 quizzes com 3 estrelas'),
      buildPassGoal('hard_quiz_completions', 2, 'Finalize 2 quizzes no hard')
    ]
  },
  {
    id: 'pass_lvl_12',
    level: 12,
    name: 'Especialista PVP I',
    desc: 'Aprimore desempenho competitivo.',
    icon: '🥊',
    hint: 'Mantenha frequencia no PVP para crescer no ranking.',
    reward: { xp: 122, coins: 34 },
    goals: [
      buildPassGoal('pvp_battles', 14, 'Jogue 14 partidas PVP'),
      buildPassGoal('pvp_wins', 6, 'Conquiste 6 vitorias PVP'),
      buildPassGoal('pvp_points', 220, 'Alcance 220 pontos PVP')
    ]
  },
  {
    id: 'pass_lvl_13',
    level: 13,
    name: 'Consistencia Avancada',
    desc: 'Eleve taxa de acerto geral.',
    icon: '📈',
    hint: 'Revise temas com mais erro antes de continuar.',
    reward: { xp: 136, coins: 36 },
    goals: [
      buildPassGoal('accuracy_pct', 70, 'Mantenha 70% de precisao geral'),
      buildPassGoal('total_answered', 220, 'Responda 220 perguntas')
    ]
  },
  {
    id: 'pass_lvl_14',
    level: 14,
    name: 'Desafio Profundo',
    desc: 'Avance no conteudo mais dificil.',
    icon: '🧱',
    hint: 'Aposte em quizzes hard para consolidar conhecimento.',
    reward: { xp: 150, coins: 40 },
    goals: [
      buildPassGoal('hard_quiz_completions', 6, 'Finalize 6 quizzes no hard'),
      buildPassGoal('ranking_points', 280, 'Alcance 280 pontos PVE')
    ]
  },
  {
    id: 'pass_lvl_15',
    level: 15,
    name: 'Fluxo Hibrido',
    desc: 'Equilibre evolucao entre PVE e PVP.',
    icon: '🔄',
    hint: 'Intercale quiz e arena para acelerar o passe.',
    reward: { xp: 168, coins: 44 },
    goals: [
      buildPassGoal('quizzes', 35, 'Complete 35 quizzes'),
      buildPassGoal('pvp_battles', 20, 'Jogue 20 partidas PVP')
    ]
  },
  {
    id: 'pass_lvl_16',
    level: 16,
    name: 'Antes do Avancado',
    desc: 'Prepare sua entrada no tier avancado.',
    icon: '🚀',
    hint: 'Suba nivel e estabilize PVP/PVE no mesmo ritmo.',
    reward: { xp: 186, coins: 48 },
    goals: [
      buildPassGoal('level', 15, 'Alcance nivel 15'),
      buildPassGoal('pvp_points', 320, 'Alcance 320 pontos PVP'),
      buildPassGoal('ranking_points', 340, 'Alcance 340 pontos PVE')
    ]
  },
  {
    id: 'pass_lvl_17',
    level: 17,
    name: 'Entrada no Avancado',
    desc: 'Chegue no marco avancado do ranking PVP.',
    icon: '👑',
    hint: 'Partidas bem executadas vao acelerar este salto.',
    reward: { xp: 208, coins: 52 },
    goals: [
      buildPassGoal('pvp_points', 400, 'Alcance 400 pontos PVP (avancado)'),
      buildPassGoal('pvp_wins', 12, 'Conquiste 12 vitorias PVP')
    ]
  },
  {
    id: 'pass_lvl_18',
    level: 18,
    name: 'Mestre do Passe',
    desc: 'Conclusao de jornada com dominio amplo.',
    icon: '🏆',
    hint: 'Finalize os ultimos marcos para fechar o passe.',
    reward: { xp: 236, coins: 58 },
    goals: [
      buildPassGoal('level', 20, 'Alcance nivel 20'),
      buildPassGoal('ranking_points', 450, 'Alcance 450 pontos PVE'),
      buildPassGoal('hard_quiz_completions', 10, 'Finalize 10 quizzes no hard'),
      buildPassGoal('mastered_quizzes', 12, 'Conquiste 12 quizzes com 3 estrelas')
    ]
  }
];

function getMetricValue(progress, metric) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const safeMetric = String(metric || '').trim();

  const totalAnswered = toInt(safeProgress.totalAnswered || 0);
  const totalCorrect = toInt(safeProgress.totalCorrect || 0);
  const quizBestStars = safeProgress.quizBestStars && typeof safeProgress.quizBestStars === 'object'
    ? safeProgress.quizBestStars
    : {};
  const quizBestScores = safeProgress.quizBestScores && typeof safeProgress.quizBestScores === 'object'
    ? safeProgress.quizBestScores
    : {};

  if (safeMetric === 'quizzes') return toInt(safeProgress.quizzes || 0);
  if (safeMetric === 'total_correct') return totalCorrect;
  if (safeMetric === 'total_answered') return totalAnswered;
  if (safeMetric === 'best_streak') return toInt(safeProgress.bestStreak || 0);
  if (safeMetric === 'ranking_points') return toInt(safeProgress.rankingPoints || 0);
  if (safeMetric === 'pvp_points') return toInt(safeProgress.pvpPoints || 0);
  if (safeMetric === 'pvp_battles') return toInt(safeProgress.pvpBattles || 0);
  if (safeMetric === 'pvp_wins') return toInt(safeProgress.pvpWins || 0);
  if (safeMetric === 'level') return toInt(safeProgress.level || 1);
  if (safeMetric === 'accuracy_pct') {
    if (totalAnswered <= 0) return 0;
    return Math.round((totalCorrect / Math.max(1, totalAnswered)) * 100);
  }
  if (safeMetric === 'mastered_quizzes') {
    return Object.values(quizBestStars).reduce((acc, value) => (
      acc + (toInt(value || 0) >= 3 ? 1 : 0)
    ), 0);
  }
  if (safeMetric === 'hard_quiz_completions') {
    return Object.entries(quizBestScores).reduce((acc, [quizKey, value]) => {
      const safeKey = String(quizKey || '').trim().toLowerCase();
      if (!safeKey.endsWith('_hard')) return acc;
      return acc + (toInt(value || 0) > 0 ? 1 : 0);
    }, 0);
  }

  return 0;
}

function getGoalProgress(goal, progress) {
  const safeGoal = goal && typeof goal === 'object' ? goal : {};
  const target = Math.max(1, toInt(safeGoal.target || 1, 1));
  const value = Math.max(0, Number(getMetricValue(progress, safeGoal.metric)));
  const progressPct = clampPercent((value / target) * 100);
  return {
    ...safeGoal,
    target,
    value,
    progressPct,
    complete: value >= target
  };
}

export function buildEvolutionPassSnapshot(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const stageMap = new Map(EVOLUTION_PASS_STAGES.map((stage) => [stage.id, stage]));
  const claimedSet = new Set(
    (Array.isArray(safeProgress.achievements) ? safeProgress.achievements : [])
      .map((id) => String(id || '').trim())
      .filter((id) => stageMap.has(id))
  );

  const stageRows = EVOLUTION_PASS_STAGES.map((stage, index) => {
    const goals = (Array.isArray(stage.goals) ? stage.goals : []).map((goal) => getGoalProgress(goal, safeProgress));
    const goalsDone = goals.reduce((acc, goal) => acc + (goal.complete ? 1 : 0), 0);
    const progressPct = goals.length
      ? clampPercent(goals.reduce((acc, goal) => acc + goal.progressPct, 0) / goals.length)
      : 0;
    return {
      ...stage,
      index,
      goals,
      goalsDone,
      goalsTotal: goals.length,
      progressPct,
      completed: goals.length > 0 && goalsDone >= goals.length,
      claimed: claimedSet.has(stage.id)
    };
  });

  const firstIncompleteIndex = stageRows.findIndex((stage) => !stage.completed);
  const activeIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : Math.max(0, stageRows.length - 1);
  const completedCount = stageRows.reduce((acc, stage) => acc + (stage.completed ? 1 : 0), 0);
  const claimedCount = stageRows.reduce((acc, stage) => acc + (stage.claimed ? 1 : 0), 0);
  const claimableCount = stageRows.reduce((acc, stage) => (
    acc + (stage.completed && !stage.claimed ? 1 : 0)
  ), 0);
  const totalLevels = Math.max(1, stageRows.length);
  const currentLevel = Math.min(totalLevels, activeIndex + 1);
  const activeStage = stageRows[activeIndex] || stageRows[0] || null;
  const currentStageProgressPct = activeStage ? activeStage.progressPct : 0;
  const overallProgressPct = stageRows.length
    ? clampPercent(stageRows.reduce((acc, stage) => acc + stage.progressPct, 0) / stageRows.length)
    : 0;

  const stages = stageRows.map((stage, index) => ({
    ...stage,
    active: index === activeIndex,
    locked: index > activeIndex && !stage.completed
  }));

  return {
    stages,
    totalLevels,
    currentLevel,
    completedCount,
    claimedCount,
    claimableCount,
    overallProgressPct,
    currentStageProgressPct,
    activeStage
  };
}

// Backward compatible alias used by existing UI imports.
export const ACHIEVEMENTS = EVOLUTION_PASS_STAGES;

export function evaluateAchievements(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const current = new Set(
    (Array.isArray(safeProgress.achievements) ? safeProgress.achievements : [])
      .map((id) => String(id || '').trim())
      .filter(Boolean)
  );
  const unlocked = [];

  EVOLUTION_PASS_STAGES.forEach((stage) => {
    const goals = Array.isArray(stage.goals) ? stage.goals : [];
    const completed = goals.length > 0 && goals.every((goal) => {
      const target = Math.max(1, toInt(goal?.target || 1, 1));
      const value = Math.max(0, Number(getMetricValue(safeProgress, goal?.metric)));
      return value >= target;
    });
    if (!completed) return;
    if (current.has(stage.id)) return;

    current.add(stage.id);
    unlocked.push({
      id: stage.id,
      name: stage.name,
      desc: stage.desc,
      icon: stage.icon,
      rewardXp: toInt(stage?.reward?.xp || 0),
      rewardCoins: toInt(stage?.reward?.coins || 0),
      level: toInt(stage.level || 1),
      type: 'evolution_pass_stage'
    });
  });

  return {
    achievementIds: [...current],
    unlocked
  };
}
