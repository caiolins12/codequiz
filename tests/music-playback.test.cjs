const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const { BATTLE_MUSIC_TRACK_DURATION_MS, getMatchMusicPlayback } = load('src/codequiz/lib/musicPlayback.js');
const helpers = load('src/codequiz/app/helpers.js');
const startedAtMs = 1_800_000_000_000;
const playback = (elapsedMs, overrides = {}) => getMatchMusicPlayback({
  matchId: 'shared-match', startedAtMs, nowMs: startedAtMs + elapsedMs, trackCount: 3, ...overrides
});

test('partidas mantêm cada música por dois minutos e o menu mantém quarenta segundos', () => {
  assert.equal(BATTLE_MUSIC_TRACK_DURATION_MS, 120000);
  assert.equal(helpers.MUSIC_AUTO_SKIP_INTERVAL_MS, BATTLE_MUSIC_TRACK_DURATION_MS);
  assert.equal(helpers.MUSIC_MENU_AUTO_SKIP_INTERVAL_MS, 40000);
  assert.deepEqual(playback(0), {
    key: 'shared-match:0', trackIndex: 0, trackElapsedMs: 0, remainingMs: 120000, slot: 0
  });
  assert.deepEqual(playback(119999), {
    key: 'shared-match:0', trackIndex: 0, trackElapsedMs: 119999, remainingMs: 1, slot: 0
  });
  assert.deepEqual(playback(120000), {
    key: 'shared-match:1', trackIndex: 1, trackElapsedMs: 0, remainingMs: 120000, slot: 1
  });
  assert.deepEqual(playback(240000), {
    key: 'shared-match:2', trackIndex: 2, trackElapsedMs: 0, remainingMs: 120000, slot: 2
  });
});

test('jogadores que entram depois e reconectam seguem o relógio compartilhado da partida', () => {
  const firstPlayer = playback(157250);
  const latePlayer = playback(157250);
  assert.deepEqual(latePlayer, firstPlayer);
  assert.deepEqual(latePlayer, {
    key: 'shared-match:1', trackIndex: 1, trackElapsedMs: 37250, remainingMs: 82750, slot: 1
  });
  assert.deepEqual(playback(287500), {
    key: 'shared-match:2', trackIndex: 2, trackElapsedMs: 47500, remainingMs: 72500, slot: 2
  });
});

test('origem futura começa na primeira faixa e playlists repetidas ganham uma nova chave', () => {
  assert.deepEqual(playback(-10000), playback(0));
  const wrapped = playback(360000);
  assert.equal(wrapped.trackIndex, 0);
  assert.equal(wrapped.slot, 3);
  assert.notEqual(wrapped.key, playback(0).key);
  assert.equal(playback(120000, { trackCount: 1 }).trackIndex, 0);
  assert.notEqual(playback(120000, { trackCount: 1 }).key, playback(0, { trackCount: 1 }).key);
  assert.notEqual(playback(0, { matchId: 'another-match' }).key, playback(0).key);
});

test('identidade, origem, relógio e tamanho de playlist inválidos não geram reprodução', () => {
  assert.equal(getMatchMusicPlayback(), null);
  for (const matchId of ['', '  ', null, undefined, 123, {}]) {
    assert.equal(playback(0, { matchId }), null);
  }
  for (const origin of [0, -1, NaN, Infinity, -Infinity, null, undefined, '123']) {
    assert.equal(playback(0, { startedAtMs: origin }), null);
  }
  for (const nowMs of [-1, NaN, Infinity, null, undefined, '123']) {
    assert.equal(playback(0, { nowMs }), null);
  }
  for (const trackCount of [0, -1, 1.5, NaN, Infinity, null, undefined, '3']) {
    assert.equal(playback(0, { trackCount }), null);
  }
});
