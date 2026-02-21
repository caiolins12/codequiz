/* eslint-disable no-console */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

function toMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function nowIso(ms = Date.now()) {
  return new Date(ms).toISOString();
}

function getPvpPointsDelta(resultKey, roundNo, endedReason, uid, winnerId, endedById) {
  const key = String(resultKey || '').trim().toLowerCase();
  const decisiveRound = Math.max(1, Number(roundNo || 1));

  if (String(endedReason || '').trim().toLowerCase() === 'forfeit') {
    if (uid && endedById && uid === endedById) return -2;
    if (uid && winnerId && uid === winnerId) return 4;
    if (key === 'win') return 4;
    if (key === 'loss') return -2;
  }

  if (key === 'win') {
    if (decisiveRound >= 8) return 8;
    if (decisiveRound >= 6) return 6;
    return 4;
  }
  if (key === 'loss') return -2;
  return 0;
}

function normalizeProcessedMatchesMap(value) {
  const safe = value && typeof value === 'object' ? value : {};
  const next = {};
  Object.entries(safe).forEach(([matchId, enabled]) => {
    if (!matchId) return;
    if (enabled === true || String(enabled || '').trim().toLowerCase() === 'true') {
      next[matchId] = true;
    }
  });
  return next;
}

function trueMapEquals(a, b) {
  const mapA = normalizeProcessedMatchesMap(a);
  const mapB = normalizeProcessedMatchesMap(b);
  const keysA = Object.keys(mapA);
  const keysB = Object.keys(mapB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => mapB[key] === true);
}

function getInvalidFinishedMatchReason(row) {
  if (!row || typeof row !== 'object') return '';
  if (String(row.status || '').trim().toLowerCase() !== 'finished') return '';
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

function getPvpResultForUser(row, uid) {
  const safeUid = String(uid || '').trim();
  if (!safeUid) return 'draw';
  const winnerId = String((row && row.winner_user_id) || '').trim();
  if (!winnerId) return 'draw';
  return winnerId === safeUid ? 'win' : 'loss';
}

function loadProjectIdFromFirebaseRc(cwd) {
  try {
    const raw = fs.readFileSync(path.join(cwd, '.firebaserc'), 'utf8');
    const parsed = JSON.parse(raw);
    return String(parsed?.projects?.default || '').trim();
  } catch {
    return '';
  }
}

function runFirebase(projectId, args) {
  const firebaseBin = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';
  const fullArgs = [...args];
  if (projectId) {
    fullArgs.push('--project', projectId);
  }
  const quoted = [firebaseBin, ...fullArgs.map((arg) => {
    const raw = String(arg || '');
    if (!raw.includes(' ') && !raw.includes('"')) return raw;
    return `"${raw.replace(/"/g, '\\"')}"`;
  })].join(' ');
  return execSync(quoted, {
    encoding: 'utf8',
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
}

function fetchNode(projectId, nodePath) {
  const output = runFirebase(projectId, ['database:get', nodePath, '--pretty']);
  const safe = String(output || '').trim();
  if (!safe || safe === 'null') return null;
  return JSON.parse(safe);
}

function writeTmpJson(prefix, data) {
  const file = path.join(os.tmpdir(), `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`);
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  return file;
}

function applyPatch(projectId, nodePath, patchObj) {
  const file = writeTmpJson('pvp_recalc_patch', patchObj);
  try {
    runFirebase(projectId, ['database:update', nodePath, file, '--force']);
  } finally {
    try {
      fs.unlinkSync(file);
    } catch {
      // ignore
    }
  }
}

function buildNextStatsRow(uid, base, pvpState, nowMs) {
  const current = base && typeof base === 'object' ? base : {};
  const pvp = pvpState && typeof pvpState === 'object' ? pvpState : {};
  const battles = Math.max(0, Number(pvp.battles || 0));
  const wins = Math.min(battles, Math.max(0, Number(pvp.wins || 0)));
  const losses = Math.min(battles, Math.max(0, Number(pvp.losses || 0)));

  return {
    ...current,
    user_id: uid,
    total_xp: Math.max(0, Number(current.total_xp || 0)),
    level: Math.max(1, Number(current.level || 1)),
    ranking_points: Math.max(0, Number(current.ranking_points || 0)),
    pvp_points: Math.max(0, Number(pvp.points || 0)),
    coins: Math.max(0, Number(current.coins || 20)),
    pvp_battles: battles,
    pvp_wins: wins,
    pvp_losses: losses,
    pvp_processed_matches: normalizeProcessedMatchesMap(pvp.processed || {}),
    pvp_recalculated_at_ms: nowMs,
    best_streak: Math.max(0, Number(current.best_streak || 0)),
    total_correct: Math.max(0, Number(current.total_correct || 0)),
    total_answered: Math.max(0, Number(current.total_answered || 0)),
    quizzes_completed: Math.max(0, Number(current.quizzes_completed || 0)),
    topic_progress: current.topic_progress && typeof current.topic_progress === 'object' ? current.topic_progress : {},
    quiz_best_scores: current.quiz_best_scores && typeof current.quiz_best_scores === 'object' ? current.quiz_best_scores : {},
    quiz_best_stars: current.quiz_best_stars && typeof current.quiz_best_stars === 'object' ? current.quiz_best_stars : {},
    is_system_bot: current.is_system_bot === true || /^bot_sys_codequiz_[A-Za-z0-9_]+$/.test(uid),
    progress_updated_at_ms: Math.max(nowMs, Math.max(0, Number(current.progress_updated_at_ms || 0))),
    updated_at: nowIso(nowMs)
  };
}

function main() {
  const cwd = process.cwd();
  const projectIdArg = process.argv.find((arg) => arg.startsWith('--project=')) || '';
  const applyArg = process.argv.includes('--apply');
  const projectId = String(projectIdArg.split('=')[1] || loadProjectIdFromFirebaseRc(cwd) || '').trim();
  if (!projectId) {
    throw new Error('Projeto Firebase nao encontrado. Use --project=<id>.');
  }

  console.log(`[recalc] Projeto: ${projectId}`);
  const userStatsRaw = fetchNode(projectId, '/user_stats') || {};
  const pvpMatchesRaw = fetchNode(projectId, '/pvp_matches') || {};
  const userStatsMap = userStatsRaw && typeof userStatsRaw === 'object' ? userStatsRaw : {};
  const pvpMatchesMap = pvpMatchesRaw && typeof pvpMatchesRaw === 'object' ? pvpMatchesRaw : {};

  const finishedMatches = Object.entries(pvpMatchesMap)
    .filter(([id, row]) => !!id && row && typeof row === 'object' && String(row.status || '').trim().toLowerCase() === 'finished')
    .map(([id, row]) => ({ id, ...row }))
    .sort((a, b) => (
      toMillis(a.ended_at || a.updated_at || a.created_at)
      - toMillis(b.ended_at || b.updated_at || b.created_at)
    ));

  const accByUser = new Map();
  const ensureAcc = (uid) => {
    const safeUid = String(uid || '').trim();
    if (!safeUid) return null;
    if (!accByUser.has(safeUid)) {
      accByUser.set(safeUid, {
        points: 0,
        battles: 0,
        wins: 0,
        losses: 0,
        processed: {}
      });
    }
    return accByUser.get(safeUid);
  };

  const nextMatchRows = {};
  let invalidCount = 0;
  let validCount = 0;

  for (const row of finishedMatches) {
    const matchId = String(row.id || '').trim();
    if (!matchId) continue;
    const invalidReason = getInvalidFinishedMatchReason(row);

    if (invalidReason) {
      invalidCount += 1;
      if (row.result_void !== true || String(row.result_void_reason || '') !== invalidReason) {
        nextMatchRows[matchId] = {
          ...row,
          result_void: true,
          result_void_reason: invalidReason,
          result_void_updated_at: nowIso(),
          updated_at: nowIso()
        };
      }
      continue;
    }

    validCount += 1;
    if (row.result_void === true || row.result_void_reason) {
      nextMatchRows[matchId] = {
        ...row,
        result_void: false,
        result_void_reason: null,
        result_void_updated_at: nowIso(),
        updated_at: nowIso()
      };
    }

    const p1 = String(row.player1_user_id || '').trim();
    const p2 = String(row.player2_user_id || '').trim();
    if (!p1 || !p2 || p1 === p2) continue;

    const roundNo = Math.max(1, Number(row.ended_round_no || row.round_no || 5));
    const endedReason = String(row.ended_reason || '').trim().toLowerCase();
    const winnerId = String(row.winner_user_id || '').trim();
    const endedById = String(row.ended_by_user_id || row.forfeit_by_user_id || '').trim();

    [p1, p2].forEach((uid) => {
      const state = ensureAcc(uid);
      if (!state) return;
      const result = getPvpResultForUser(row, uid);
      const delta = getPvpPointsDelta(result, roundNo, endedReason, uid, winnerId, endedById);
      state.battles += 1;
      if (result === 'win') state.wins += 1;
      else if (result === 'loss') state.losses += 1;
      state.points = Math.max(0, Number(state.points || 0) + Number(delta || 0));
      state.processed[matchId] = true;
    });
  }

  const userIds = new Set([...Object.keys(userStatsMap), ...Array.from(accByUser.keys())]);
  const nowMs = Date.now();
  const nextUserRows = {};
  let updatedUsers = 0;

  userIds.forEach((uid) => {
    const userId = String(uid || '').trim();
    if (!userId) return;
    const base = userStatsMap[userId] && typeof userStatsMap[userId] === 'object' ? userStatsMap[userId] : {};
    const pvp = accByUser.get(userId) || { points: 0, battles: 0, wins: 0, losses: 0, processed: {} };
    const next = buildNextStatsRow(userId, base, pvp, nowMs);

    const changed = Math.max(0, Number(base.pvp_points || 0)) !== next.pvp_points
      || Math.max(0, Number(base.pvp_battles || 0)) !== next.pvp_battles
      || Math.max(0, Number(base.pvp_wins || 0)) !== next.pvp_wins
      || Math.max(0, Number(base.pvp_losses || 0)) !== next.pvp_losses
      || !trueMapEquals(base.pvp_processed_matches, next.pvp_processed_matches)
      || Math.max(0, Number(base.pvp_recalculated_at_ms || 0)) <= 0;

    if (!changed) return;
    nextUserRows[userId] = next;
    updatedUsers += 1;
  });

  const matchesToPatchCount = Object.keys(nextMatchRows).length;
  console.log(`[recalc] Partidas finalizadas: ${finishedMatches.length}`);
  console.log(`[recalc] Partidas validas: ${validCount}`);
  console.log(`[recalc] Partidas invalidadas (<5 rodadas ou 0x0): ${invalidCount}`);
  console.log(`[recalc] Usuarios/Bots com ajuste de stats PVP: ${updatedUsers}`);
  console.log(`[recalc] Partidas com patch de anulacao/limpeza: ${matchesToPatchCount}`);

  if (!applyArg) {
    console.log('[recalc] Modo dry-run. Use --apply para gravar no Firebase.');
    return;
  }

  if (updatedUsers > 0) {
    console.log('[recalc] Aplicando patch em /user_stats ...');
    applyPatch(projectId, '/user_stats', nextUserRows);
  }
  if (matchesToPatchCount > 0) {
    console.log('[recalc] Aplicando patch em /pvp_matches ...');
    applyPatch(projectId, '/pvp_matches', nextMatchRows);
  }

  console.log('[recalc] Concluido.');
}

try {
  main();
} catch (error) {
  console.error('[recalc] Falha:', error?.message || error);
  process.exitCode = 1;
}
