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

function buildPassPath(id, label, icon, goals = []) {
  return {
    id: String(id || '').trim() || 'default',
    label: String(label || '').trim() || 'Trilha',
    icon: String(icon || '').trim() || '🎯',
    goals: Array.isArray(goals) ? goals : []
  };
}

function buildDualPassPaths(pveGoals = [], pvpGoals = []) {
  return [
    buildPassPath('pve', 'Trilha PVE', '📚', pveGoals),
    buildPassPath('pvp', 'Trilha PVP', '⚔️', pvpGoals)
  ];
}

function normalizeRewardShopItems(reward) {
  const source = reward && typeof reward === 'object' ? reward : {};
  return [...new Set(
    (Array.isArray(source.shopItems) ? source.shopItems : [])
      .map((itemId) => String(itemId || '').trim())
      .filter(Boolean)
  )];
}

function normalizeStagePaths(stage) {
  const safeStage = stage && typeof stage === 'object' ? stage : {};
  const rawPaths = Array.isArray(safeStage.paths) ? safeStage.paths : [];
  const normalizedPaths = rawPaths
    .map((path, index) => {
      const safePath = path && typeof path === 'object' ? path : {};
      const goals = Array.isArray(safePath.goals) ? safePath.goals : [];
      if (!goals.length) return null;
      return buildPassPath(
        safePath.id || `path_${index + 1}`,
        safePath.label || `Trilha ${index + 1}`,
        safePath.icon || '🎯',
        goals
      );
    })
    .filter(Boolean);

  if (normalizedPaths.length) return normalizedPaths;

  const legacyGoals = Array.isArray(safeStage.goals) ? safeStage.goals : [];
  if (!legacyGoals.length) return [];
  return [buildPassPath('default', 'Missão da etapa', safeStage.icon || '🎯', legacyGoals)];
}

export const EVOLUTION_PASS_STAGES = [
  {
    id: 'pass_lvl_01',
    level: 1,
    name: 'Início Guiado',
    desc: 'Escolha seu estilo e abra o passe.',
    icon: '🧭',
    hint: 'Conclua a trilha PVE ou a trilha PVP para liberar o próximo nível.',
    reward: { xp: 20, coins: 8 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 1, 'Complete 1 quiz'),
        buildPassGoal('total_correct', 5, 'Acerte 5 perguntas')
      ],
      [
        buildPassGoal('pvp_battles', 1, 'Jogue 1 partida PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_02',
    level: 2,
    name: 'Fundamentos',
    desc: 'Ganhe corpo no passe com repetição e ritmo.',
    icon: '📘',
    hint: 'Você pode avançar estudando no PVE ou disputando no PVP.',
    reward: { xp: 28, coins: 10 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 3, 'Complete 3 quizzes'),
        buildPassGoal('ranking_points', 20, 'Alcance 20 pontos PVE')
      ],
      [
        buildPassGoal('pvp_battles', 2, 'Jogue 2 partidas PVP'),
        buildPassGoal('pvp_points', 20, 'Alcance 20 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_03',
    level: 3,
    name: 'Foco em Acertos',
    desc: 'Suba a consistência na rota que preferir.',
    icon: '🎯',
    hint: 'Capriche na precisão para acelerar a etapa.',
    reward: { xp: 34, coins: 12 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('total_correct', 20, 'Acerte 20 perguntas'),
        buildPassGoal('best_streak', 4, 'Faça streak de 4')
      ],
      [
        buildPassGoal('pvp_battles', 3, 'Jogue 3 partidas PVP'),
        buildPassGoal('pvp_points', 40, 'Alcance 40 pontos PVP'),
        buildPassGoal('pvp_wins', 1, 'Conquiste 1 vitória PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_04',
    level: 4,
    name: 'Primeiros Duelos',
    desc: 'Entre de vez no ritmo das partidas.',
    icon: '⚔️',
    hint: 'Cada trilha leva ao mesmo nível seguinte.',
    reward: { xp: 40, coins: 14 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 5, 'Complete 5 quizzes'),
        buildPassGoal('ranking_points', 45, 'Alcance 45 pontos PVE')
      ],
      [
        buildPassGoal('pvp_battles', 4, 'Jogue 4 partidas PVP'),
        buildPassGoal('pvp_points', 60, 'Alcance 60 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_05',
    level: 5,
    name: 'Rotina de Treino',
    desc: 'Consolide o progresso com uma trilha completa.',
    icon: '🏋️',
    hint: 'Escolha a trilha que combina mais com sua rotina.',
    reward: { xp: 48, coins: 16, shopItems: ['frame_aurora'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('ranking_points', 60, 'Alcance 60 pontos PVE'),
        buildPassGoal('mastered_quizzes', 2, 'Conquiste 2 quizzes com 3 estrelas')
      ],
      [
        buildPassGoal('pvp_battles', 5, 'Jogue 5 partidas PVP'),
        buildPassGoal('pvp_wins', 1, 'Conquiste 1 vitória PVP'),
        buildPassGoal('pvp_points', 80, 'Alcance 80 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_06',
    level: 6,
    name: 'Arena Ativa',
    desc: 'Mantenha volume e avance por uma rota completa.',
    icon: '🛡️',
    hint: 'Mais consistência significa mais níveis liberados.',
    reward: { xp: 56, coins: 18, shopItems: ['bg_aurora_prismatica'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 8, 'Complete 8 quizzes'),
        buildPassGoal('total_correct', 45, 'Acerte 45 perguntas'),
        buildPassGoal('ranking_points', 90, 'Alcance 90 pontos PVE')
      ],
      [
        buildPassGoal('pvp_battles', 6, 'Jogue 6 partidas PVP'),
        buildPassGoal('pvp_wins', 2, 'Conquiste 2 vitórias PVP'),
        buildPassGoal('pvp_points', 100, 'Alcance 100 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_07',
    level: 7,
    name: 'Volume de Estudo',
    desc: 'A tração vem da constância em uma só trilha.',
    icon: '📚',
    hint: 'Entre, jogue e mantenha o ritmo.',
    reward: { xp: 66, coins: 20 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 12, 'Complete 12 quizzes'),
        buildPassGoal('total_correct', 70, 'Acerte 70 perguntas')
      ],
      [
        buildPassGoal('pvp_battles', 8, 'Jogue 8 partidas PVP'),
        buildPassGoal('pvp_wins', 3, 'Conquiste 3 vitórias PVP'),
        buildPassGoal('pvp_points', 120, 'Alcance 120 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_08',
    level: 8,
    name: 'Sequência Forte',
    desc: 'Mostre controle e repetição na trilha escolhida.',
    icon: '🔥',
    hint: 'Não precisa alternar modos para subir.',
    reward: { xp: 74, coins: 22, shopItems: ['frame_abissal'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('best_streak', 8, 'Faça streak de 8'),
        buildPassGoal('total_correct', 120, 'Acerte 120 perguntas')
      ],
      [
        buildPassGoal('pvp_battles', 10, 'Jogue 10 partidas PVP'),
        buildPassGoal('pvp_wins', 4, 'Conquiste 4 vitórias PVP'),
        buildPassGoal('pvp_points', 150, 'Alcance 150 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_09',
    level: 9,
    name: 'Leitura Tática',
    desc: 'Chegue mais alto com uma rota bem executada.',
    icon: '🧠',
    hint: 'A etapa fecha assim que uma trilha for concluída.',
    reward: { xp: 84, coins: 24, shopItems: ['bg_abissal_vortex'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('ranking_points', 140, 'Alcance 140 pontos PVE'),
        buildPassGoal('mastered_quizzes', 4, 'Conquiste 4 quizzes com 3 estrelas')
      ],
      [
        buildPassGoal('pvp_battles', 12, 'Jogue 12 partidas PVP'),
        buildPassGoal('pvp_wins', 5, 'Conquiste 5 vitórias PVP'),
        buildPassGoal('pvp_points', 180, 'Alcance 180 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_10',
    level: 10,
    name: 'Patamar Intermediário',
    desc: 'Chegue ao bloco intermediário do passe.',
    icon: '🏅',
    hint: 'A rota escolhida já sustenta toda a progressão.',
    reward: { xp: 96, coins: 28 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('level', 10, 'Alcance nível 10'),
        buildPassGoal('ranking_points', 180, 'Alcance 180 pontos PVE')
      ],
      [
        buildPassGoal('pvp_battles', 14, 'Jogue 14 partidas PVP'),
        buildPassGoal('pvp_wins', 6, 'Conquiste 6 vitórias PVP'),
        buildPassGoal('pvp_points', 220, 'Alcance 220 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_11',
    level: 11,
    name: 'Especialista PVE I',
    desc: 'A etapa já aceita uma especialização completa em qualquer lado.',
    icon: '🧪',
    hint: 'Escolha sua trilha principal e mantenha o foco.',
    reward: { xp: 108, coins: 30 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 24, 'Complete 24 quizzes'),
        buildPassGoal('mastered_quizzes', 6, 'Conquiste 6 quizzes com 3 estrelas'),
        buildPassGoal('hard_quiz_completions', 2, 'Finalize 2 quizzes no hard')
      ],
      [
        buildPassGoal('pvp_battles', 16, 'Jogue 16 partidas PVP'),
        buildPassGoal('pvp_wins', 7, 'Conquiste 7 vitórias PVP'),
        buildPassGoal('pvp_points', 260, 'Alcance 260 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_12',
    level: 12,
    name: 'Especialista PVP I',
    desc: 'Chegue mais forte ao bloco avançado.',
    icon: '🥊',
    hint: 'Concluir uma trilha basta para seguir no passe.',
    reward: { xp: 122, coins: 34, shopItems: ['frame_eclipse'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('hard_quiz_completions', 4, 'Finalize 4 quizzes no hard'),
        buildPassGoal('total_correct', 170, 'Acerte 170 perguntas'),
        buildPassGoal('ranking_points', 230, 'Alcance 230 pontos PVE')
      ],
      [
        buildPassGoal('pvp_battles', 18, 'Jogue 18 partidas PVP'),
        buildPassGoal('pvp_wins', 8, 'Conquiste 8 vitórias PVP'),
        buildPassGoal('pvp_points', 300, 'Alcance 300 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_13',
    level: 13,
    name: 'Consistência Avançada',
    desc: 'A etapa mede constância e volume no modo que você preferir.',
    icon: '📈',
    hint: 'Uma trilha concluída já conta como nível fechado.',
    reward: { xp: 136, coins: 36, shopItems: ['bg_eclipse_total'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('accuracy_pct', 70, 'Mantenha 70% de precisão geral'),
        buildPassGoal('total_answered', 220, 'Responda 220 perguntas')
      ],
      [
        buildPassGoal('pvp_battles', 20, 'Jogue 20 partidas PVP'),
        buildPassGoal('pvp_wins', 9, 'Conquiste 9 vitórias PVP'),
        buildPassGoal('pvp_points', 340, 'Alcance 340 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_14',
    level: 14,
    name: 'Desafio Profundo',
    desc: 'Suba mais um bloco pesado por qualquer rota.',
    icon: '🧱',
    hint: 'Você não precisa alternar entre PVE e PVP para continuar.',
    reward: { xp: 150, coins: 40 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('hard_quiz_completions', 6, 'Finalize 6 quizzes no hard'),
        buildPassGoal('ranking_points', 280, 'Alcance 280 pontos PVE')
      ],
      [
        buildPassGoal('pvp_battles', 22, 'Jogue 22 partidas PVP'),
        buildPassGoal('pvp_wins', 10, 'Conquiste 10 vitórias PVP'),
        buildPassGoal('pvp_points', 380, 'Alcance 380 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_15',
    level: 15,
    name: 'Fluxo Consistente',
    desc: 'Mantenha uma única rota forte até o fim.',
    icon: '🔁',
    hint: 'O passe agora respeita uma progressão inteira só em PVE ou só em PVP.',
    reward: { xp: 168, coins: 44, shopItems: ['frame_sangue'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('quizzes', 35, 'Complete 35 quizzes'),
        buildPassGoal('mastered_quizzes', 8, 'Conquiste 8 quizzes com 3 estrelas'),
        buildPassGoal('total_correct', 260, 'Acerte 260 perguntas')
      ],
      [
        buildPassGoal('pvp_battles', 24, 'Jogue 24 partidas PVP'),
        buildPassGoal('pvp_wins', 12, 'Conquiste 12 vitórias PVP'),
        buildPassGoal('pvp_points', 420, 'Alcance 420 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_16',
    level: 16,
    name: 'Antes do Avançado',
    desc: 'Prepare a reta final em uma trilha só.',
    icon: '🚀',
    hint: 'Foque em consolidar o seu modo principal.',
    reward: { xp: 186, coins: 48, shopItems: ['bg_sangue_arcano'] },
    paths: buildDualPassPaths(
      [
        buildPassGoal('level', 15, 'Alcance nível 15'),
        buildPassGoal('ranking_points', 340, 'Alcance 340 pontos PVE'),
        buildPassGoal('hard_quiz_completions', 7, 'Finalize 7 quizzes no hard')
      ],
      [
        buildPassGoal('pvp_battles', 26, 'Jogue 26 partidas PVP'),
        buildPassGoal('pvp_wins', 13, 'Conquiste 13 vitórias PVP'),
        buildPassGoal('pvp_points', 460, 'Alcance 460 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_17',
    level: 17,
    name: 'Entrada no Avançado',
    desc: 'Chegue ao topo do passe pelo lado que quiser dominar.',
    icon: '👑',
    hint: 'A última subida forte já pode ser feita em uma única trilha.',
    reward: { xp: 208, coins: 52 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('mastered_quizzes', 10, 'Conquiste 10 quizzes com 3 estrelas'),
        buildPassGoal('ranking_points', 400, 'Alcance 400 pontos PVE'),
        buildPassGoal('hard_quiz_completions', 8, 'Finalize 8 quizzes no hard')
      ],
      [
        buildPassGoal('pvp_battles', 28, 'Jogue 28 partidas PVP'),
        buildPassGoal('pvp_wins', 14, 'Conquiste 14 vitórias PVP'),
        buildPassGoal('pvp_points', 500, 'Alcance 500 pontos PVP')
      ]
    )
  },
  {
    id: 'pass_lvl_18',
    level: 18,
    name: 'Mestre do Passe',
    desc: 'Feche o passe inteiro pela rota que mais combina com você.',
    icon: '🏆',
    hint: 'Conclua a trilha PVE ou a trilha PVP para completar o passe.',
    reward: { xp: 236, coins: 58 },
    paths: buildDualPassPaths(
      [
        buildPassGoal('level', 20, 'Alcance nível 20'),
        buildPassGoal('ranking_points', 450, 'Alcance 450 pontos PVE'),
        buildPassGoal('hard_quiz_completions', 10, 'Finalize 10 quizzes no hard'),
        buildPassGoal('mastered_quizzes', 12, 'Conquiste 12 quizzes com 3 estrelas')
      ],
      [
        buildPassGoal('pvp_battles', 30, 'Jogue 30 partidas PVP'),
        buildPassGoal('pvp_wins', 16, 'Conquiste 16 vitórias PVP'),
        buildPassGoal('pvp_points', 560, 'Alcance 560 pontos PVP')
      ]
    )
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

function buildPathProgress(path, progress) {
  const safePath = path && typeof path === 'object' ? path : {};
  const goals = (Array.isArray(safePath.goals) ? safePath.goals : []).map((goal) => getGoalProgress(goal, progress));
  const goalsDone = goals.reduce((acc, goal) => acc + (goal.complete ? 1 : 0), 0);
  const progressPct = goals.length
    ? clampPercent(goals.reduce((acc, goal) => acc + goal.progressPct, 0) / goals.length)
    : 0;

  return {
    ...safePath,
    goals,
    goalsDone,
    goalsTotal: goals.length,
    progressPct,
    complete: goals.length > 0 && goalsDone >= goals.length
  };
}

function pickLeadingPath(paths = []) {
  const safePaths = Array.isArray(paths) ? paths.filter(Boolean) : [];
  if (!safePaths.length) return null;
  const completedPath = safePaths.find((path) => path.complete);
  if (completedPath) return completedPath;
  return safePaths.reduce((best, current) => {
    if (!best) return current;
    if (Number(current.progressPct || 0) > Number(best.progressPct || 0)) return current;
    if (Number(current.progressPct || 0) < Number(best.progressPct || 0)) return best;
    if (Number(current.goalsDone || 0) > Number(best.goalsDone || 0)) return current;
    if (Number(current.goalsDone || 0) < Number(best.goalsDone || 0)) return best;
    return Number(current.goalsTotal || 0) <= Number(best.goalsTotal || 0) ? current : best;
  }, null);
}

export function buildEvolutionPassSnapshot(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const stageMap = new Map(EVOLUTION_PASS_STAGES.map((stage) => [stage.id, stage]));
  const claimedSet = new Set(
    (Array.isArray(safeProgress.achievements) ? safeProgress.achievements : [])
      .map((id) => String(id || '').trim())
      .filter((id) => stageMap.has(id))
  );

  const baseRows = EVOLUTION_PASS_STAGES.map((stage, index) => {
    const normalizedReward = {
      ...(stage?.reward && typeof stage.reward === 'object' ? stage.reward : {}),
      shopItems: normalizeRewardShopItems(stage?.reward)
    };
    const missionPaths = normalizeStagePaths(stage).map((path) => buildPathProgress(path, safeProgress));
    const leadingPath = pickLeadingPath(missionPaths);
    const completedPath = missionPaths.find((path) => path.complete) || null;
    const progressPct = missionPaths.length
      ? Math.max(...missionPaths.map((path) => Math.max(0, Number(path.progressPct || 0))))
      : 0;

    return {
      ...stage,
      reward: normalizedReward,
      index,
      missionPaths,
      goals: Array.isArray(leadingPath?.goals) ? leadingPath.goals : [],
      goalsDone: Math.max(0, Number(leadingPath?.goalsDone || 0)),
      goalsTotal: Math.max(0, Number(leadingPath?.goalsTotal || 0)),
      progressPct,
      leadingPathId: String(leadingPath?.id || '').trim(),
      leadingPathLabel: String(leadingPath?.label || '').trim(),
      completedPathId: String(completedPath?.id || '').trim(),
      completedPathLabel: String(completedPath?.label || '').trim(),
      rawCompleted: missionPaths.some((path) => path.complete),
      claimed: claimedSet.has(stage.id)
    };
  });

  let previousConcluded = true;
  const stageRows = baseRows.map((stage) => {
    const unlockedByOrder = previousConcluded || stage.claimed;
    const completed = stage.claimed || (unlockedByOrder && stage.rawCompleted);
    const locked = !unlockedByOrder;
    if (!completed) {
      previousConcluded = false;
    }
    return {
      ...stage,
      completed,
      locked,
      unlockedByOrder
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
    active: index === activeIndex
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

export const ACHIEVEMENTS = EVOLUTION_PASS_STAGES;

export function evaluateAchievements(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const current = new Set(
    (Array.isArray(safeProgress.achievements) ? safeProgress.achievements : [])
      .map((id) => String(id || '').trim())
      .filter(Boolean)
  );
  const unlocked = [];

  let previousConcluded = true;
  EVOLUTION_PASS_STAGES.forEach((stage) => {
    const alreadyClaimed = current.has(stage.id);
    const completedByPaths = normalizeStagePaths(stage).some((path) => {
      const goals = Array.isArray(path.goals) ? path.goals : [];
      if (!goals.length) return false;
      return goals.every((goal) => {
        const target = Math.max(1, toInt(goal?.target || 1, 1));
        const value = Math.max(0, Number(getMetricValue(safeProgress, goal?.metric)));
        return value >= target;
      });
    });
    const canUnlock = previousConcluded && completedByPaths && !alreadyClaimed;
    if (canUnlock) {
      unlocked.push({
        id: stage.id,
        name: stage.name,
        desc: stage.desc,
        icon: stage.icon,
        rewardXp: toInt(stage?.reward?.xp || 0),
        rewardCoins: toInt(stage?.reward?.coins || 0),
        rewardShopItems: normalizeRewardShopItems(stage?.reward),
        level: toInt(stage.level || 1),
        type: 'evolution_pass_stage'
      });
    }

    if (!(alreadyClaimed || completedByPaths)) {
      previousConcluded = false;
    }
  });

  return {
    achievementIds: [...current],
    unlocked
  };
}
