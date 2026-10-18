const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');
const { loadComponentFragments } = require('./support/load-component-fragments.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const engine = load('src/codequiz/app/pvpGroupMatch.js');
const duelRules = load('src/codequiz/lib/pvp.js');
const fragmentsPromise = loadComponentFragments(path.resolve(__dirname, '../src/codequiz/CodeQuizApp.jsx'));
const QUESTION = { q: 'Qual alternativa?', opts: ['A', 'B', 'C'], answer: 0 };

function answer(userId, index, battleNo = 1) {
  return { user_id: userId, answer_idx: index, battle_no: battleNo, round_no: battleNo };
}

async function createHarness(mode) {
  const fragments = await fragmentsPromise;
  const callbacks = new Map();
  const intervals = new Set();
  const pendingWrites = [];
  const members = {
    red_members: [{ user_id: 'me' }, { user_id: 'teammate' }],
    blue_members: [{ user_id: 'opponent' }, { user_id: 'other-opponent' }]
  };
  const match = {
    id: 'selection-regression',
    status: 'active',
    battle_no: 1,
    round_no: 1,
    battle_started_at_ms: Date.now() - 5000,
    question_set: Array.from({ length: 3 }, () => ({ ...QUESTION })),
    ...members,
    battle_schedule: helpers.buildPvpTeamBattleSchedule(members),
    members: ['me', 'opponent', 'teammate', 'other-opponent'].map((userId) => ({ user_id: userId })),
    active_member_ids: ['me', 'opponent', 'teammate', 'other-opponent'],
    active_pair_user_ids: ['me', 'opponent']
  };
  let state = { status: 'active', matchId: match.id, match, selectedIndex: null, submitted: false, answers: [] };
  const matchRef = { current: match };
  const stateRef = { current: state };
  const scope = {
    ...helpers,
    ...engine,
    ...duelRules,
    authUser: { uid: 'me' },
    pvpStateRef: stateRef,
    pvpTeamMatchRef: matchRef,
    pvpEliminationMatchRef: matchRef,
    pvpTeamAnswerBattleKeyRef: { current: '' },
    pvpEliminationAnswerBattleKeyRef: { current: '' },
    pvpRealtimeAnswersUpdateAtRef: { current: 0 },
    pvpRealtimeMatchUpdateAtRef: { current: 0 },
    showToast: () => {},
    playSfx: () => {},
    setScreen: () => {},
    openFinishedPvpMatch: () => {},
    console: { error: () => {} },
    setInterval: (callback) => { intervals.add(callback); return callback; },
    clearInterval: (callback) => intervals.delete(callback)
  };
  const set = (field, value) => {
    state = { ...state, [field]: typeof value === 'function' ? value(state[field]) : value };
    stateRef.current = state;
  };
  scope.setPvpState = (value) => {
    state = typeof value === 'function' ? value(state) : value;
    stateRef.current = state;
    matchRef.current = state.match;
  };
  Object.defineProperty(scope, 'pvpState', { get: () => state });
  for (const prefix of ['PvpTeam', 'PvpElimination']) {
    const variable = prefix[0].toLowerCase() + prefix.slice(1);
    for (const [suffix, field] of Object.entries({ Match: 'match', MatchId: 'matchId', Answers: 'answers', Submitted: 'submitted', SelectedIndex: 'selectedIndex' })) {
      Object.defineProperty(scope, `${variable}${suffix}`, { get: () => state[field] });
      scope[`set${prefix}${suffix}`] = (value) => set(field, value);
    }
  }
  for (const name of ['subscribePvpTeamBattleAnswers', 'subscribePvpEliminationBattleAnswers', 'subscribeRoundAnswers']) {
    scope[name] = (_id, _round, callback) => { callbacks.set(name, callback); return () => {}; };
  }
  scope.subscribeMatch = (_id, callback) => { callbacks.set('subscribeMatch', callback); return () => {}; };
  for (const name of ['upsertPvpTeamAnswer', 'upsertPvpEliminationAnswer', 'upsertPvpAnswer']) {
    scope[name] = (row) => new Promise((resolve, reject) => pendingWrites.push({ row, resolve, reject }));
  }
  const suffix = mode === 'team' ? 'PvpTeam' : mode === 'elimination' ? 'PvpElimination' : 'Pvp';
  for (const name of [`pick${suffix}Answer`, `submit${suffix}Answer`, `confirm${suffix}Answer`, 'isPvpGroupAnswerBattleCurrent']) {
    scope[name] = fragments.functionNamed(name, scope);
  }
  const subscribeName = mode === 'team' ? 'subscribePvpTeamBattleAnswers'
    : mode === 'elimination' ? 'subscribePvpEliminationBattleAnswers' : 'subscribeRoundAnswers';
  const runAnswersEffect = () => fragments.effectCalling(subscribeName, scope)();
  runAnswersEffect();

  return {
    scope,
    pendingWrites,
    get state() { return state; },
    pick: (index) => scope[`pick${suffix}Answer`](index),
    confirm: () => scope[`confirm${suffix}Answer`](),
    snapshot: (rows) => callbacks.get(subscribeName)(rows),
    runAnswersEffect,
    callback: () => callbacks.get(subscribeName),
    updateMatch(row) {
      scope.setPvpState((prev) => ({ ...prev, status: row.status, match: row }));
    },
    startMatchSubscription() {
      return fragments.effectCalling('subscribeMatch', scope)();
    },
    matchSnapshot: (row) => callbacks.get('subscribeMatch')(row),
    async poll(rows) {
      scope.getPvpRoundAnswers = async () => rows;
      scope.pvpRealtimeAnswersUpdateAtRef.current = 0;
      if (!intervals.size) fragments.effectCalling('getPvpRoundAnswers', scope)();
      else for (const callback of intervals) callback();
      await new Promise(setImmediate);
    }
  };
}

for (const mode of ['team', 'elimination', 'duel']) {
  test(`${mode}: opponent snapshots and uncommitted placeholders preserve a local choice`, async () => {
    const app = await createHarness(mode);
    app.pick(2);
    for (const rows of [[], [answer('opponent', 0)], [answer('opponent', 1), answer('me', -1)], [answer('me', 'invalid')], [answer('me', 0, 2)]]) {
      app.snapshot(rows);
      assert.equal(app.state.selectedIndex, 2);
      assert.equal(app.state.submitted, false);
    }
    app.snapshot([answer('me', 0), answer('opponent', 1)]);
    assert.equal(app.state.selectedIndex, 0, 'the server-confirmed local answer is authoritative');
    assert.equal(app.state.submitted, true);
  });

  test(`${mode}: opponent snapshots cannot unlock a pending confirmation or submit it twice`, async () => {
    const app = await createHarness(mode);
    app.pick(2);
    const confirming = app.confirm();
    assert.equal(app.pendingWrites.length, 1);
    assert.equal(app.state.submitted, true);
    for (const rows of [[], [answer('opponent', 0)], [answer('opponent', 0), answer('me', -1)]]) {
      app.snapshot(rows);
      assert.equal(app.state.selectedIndex, 2);
      assert.equal(app.state.submitted, true);
    }
    await app.confirm();
    assert.equal(app.pendingWrites.length, 1);
    app.pendingWrites[0].resolve(app.pendingWrites[0].row);
    await confirming;
    assert.equal(app.state.selectedIndex, 2);
    assert.equal(app.state.submitted, true);
    app.snapshot([answer('opponent', 0)]);
    assert.equal(app.state.selectedIndex, 2);
    assert.equal(app.state.submitted, true);
  });
}

for (const mode of ['team', 'elimination']) {
  test(`${mode}: resubscribing to the same battle preserves a choice, while a new battle resets it`, async () => {
    const app = await createHarness(mode);
    app.pick(2);
    const confirming = app.confirm();
    app.runAnswersEffect();
    assert.equal(app.state.selectedIndex, 2);
    assert.equal(app.state.submitted, true);
    const oldCallback = app.callback();
    app.updateMatch({ ...app.state.match, battle_no: 2 });
    app.runAnswersEffect();
    assert.equal(app.state.selectedIndex, null);
    assert.equal(app.state.submitted, false);
    app.pick(1);
    oldCallback([answer('me', 2, 1)]);
    assert.equal(app.state.selectedIndex, 1);
    assert.equal(app.state.submitted, false);
    app.pendingWrites[0].resolve(app.pendingWrites[0].row);
    await confirming;
    assert.equal(app.state.selectedIndex, 1, 'the previous battle ACK must not replace the new choice');
    assert.equal(app.state.submitted, false);
  });
}

test('duel: fallback polling preserves choices and pending confirmation until a valid local answer arrives', async () => {
  const app = await createHarness('duel');
  app.pick(2);
  await app.poll([answer('opponent', 0)]);
  assert.equal(app.state.selectedIndex, 2);
  assert.equal(app.state.submitted, false);
  await app.poll([answer('opponent', 0), answer('me', -1)]);
  assert.equal(app.state.selectedIndex, 2);
  assert.equal(app.state.submitted, false);
  const confirming = app.confirm();
  await app.poll([answer('opponent', 0)]);
  assert.equal(app.state.selectedIndex, 2);
  assert.equal(app.state.submitted, true);
  app.pendingWrites[0].resolve(app.pendingWrites[0].row);
  await confirming;
  await app.poll([answer('me', 0)]);
  assert.equal(app.state.selectedIndex, 0);
  assert.equal(app.state.submitted, true);
});

test('duel: a new match round resets selection and obsolete answer callbacks cannot restore it', async () => {
  const app = await createHarness('duel');
  app.startMatchSubscription();
  app.pick(2);
  const confirming = app.confirm();
  const oldCallback = app.callback();
  const previousMatch = app.state.match;
  app.matchSnapshot({ ...app.state.match, round_no: 2 });
  assert.equal(app.state.selectedIndex, null);
  assert.equal(app.state.submitted, false);
  app.runAnswersEffect();
  app.pick(1);
  for (const status of ['active', 'finished']) {
    app.matchSnapshot({ ...previousMatch, status });
    assert.equal(app.state.match.round_no, 2, 'an older match snapshot must not move the answer back to the previous round');
    assert.equal(app.state.status, 'active');
    assert.equal(app.state.selectedIndex, 1);
  }
  oldCallback([answer('me', 2, 1)]);
  assert.equal(app.state.selectedIndex, 1);
  assert.equal(app.state.submitted, false);
  app.pendingWrites[0].resolve(app.pendingWrites[0].row);
  await confirming;
  assert.equal(app.state.selectedIndex, 1);
  assert.equal(app.state.submitted, false);
});

test('duel: match ordering rejects older rounds and phase regressions while allowing the next active round', () => {
  const current = { id: 'duel-order', round_no: 2, status: 'round_result' };
  assert.equal(duelRules.isPvpDuelMatchSnapshotObsolete(current, { ...current, round_no: 1 }), true);
  assert.equal(duelRules.isPvpDuelMatchSnapshotObsolete(current, { ...current, status: 'active' }), true);
  assert.equal(duelRules.isPvpDuelMatchSnapshotObsolete(current, { ...current, round_no: 3, status: 'active' }), false);
  assert.equal(duelRules.isPvpDuelMatchSnapshotObsolete({ ...current, status: 'finished' }, { ...current, round_no: 3, status: 'active' }), true);
  assert.equal(duelRules.isPvpDuelMatchSnapshotObsolete(current, { ...current, id: 'another-duel', round_no: 1, status: 'active' }), false);
});
