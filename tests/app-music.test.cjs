const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');
const { loadComponentFragments } = require('./support/load-component-fragments.cjs');

const load = createAppLoader();
const helpers = load('src/codequiz/app/helpers.js');
const playback = load('src/codequiz/lib/musicPlayback.js');
const fragmentsPromise = loadComponentFragments(path.resolve(__dirname, '../src/codequiz/CodeQuizApp.jsx'));

async function createMusicHarness(nowMs = 1000000) {
  const fragments = await fragmentsPromise;
  const timers = new Map();
  const starts = [];
  let timerId = 0;
  const scope = {
    ...helpers,
    ...playback,
    CHIP_SONG_ENGINE: 'chip_song',
    Date: { now: () => nowMs },
    getServerNowMs: () => nowMs,
    audioSettings: { musicEnabled: true, musicVolume: 0.5 },
    audioSettingsRef: { current: { musicEnabled: true, musicVolume: 0.5 } },
    pvpMusicSessionRef: { current: null },
    musicPlaybackKeyRef: { current: '' },
    musicLoopTimerRef: { current: null },
    musicSongPlayerRef: { current: null },
    musicAutoSkipTimerRef: { current: null },
    musicTransitionTimerRef: { current: null },
    musicSkipSwitchTimerRef: { current: null },
    musicSkipBusyRef: { current: false },
    musicStepRef: { current: 0 },
    musicModeRef: { current: 'menu' },
    musicBattleFlowRef: { current: false },
    menuTrackIndexRef: { current: 0 },
    battleTrackIndexRef: { current: 0 },
    audioContextRef: { current: { currentTime: 1 } },
    sfxGainRef: { current: null },
    pvpMusicMatchId: '',
    pvpMusicStartedAtMs: 0,
    isBattleMusicFlow: false,
    ensureAudioContext: () => scope.audioContextRef.current,
    setMusicMode: () => {},
    setBattleTrackIndex: () => {},
    setMenuTrackIndex: () => {},
    setMusicGain: () => {},
    playSfx: () => {},
    startChipSongLoop: (_ctx, track, offsetSec = 0) => {
      starts.push({ id: track.id, offsetSec });
      scope.musicLoopTimerRef.current = ++timerId;
    },
    setInterval: () => ++timerId,
    clearInterval: () => {},
    setTimeout: (callback, delay) => {
      const id = ++timerId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id)
  };
  scope.window = { setTimeout: scope.setTimeout };
  for (const name of ['clearMusicLoop', 'getMusicVolumeLevel', 'getPvpMusicPlayback', 'syncPvpMusic',
    'scheduleMusicAutoSkip', 'advanceMusicTrackIndex', 'triggerMusicTrackSkip', 'startMusicLoop', 'applyMusicMode']) {
    scope[name] = fragments.functionNamed(name, scope);
  }
  const audioEffect = fragments.effectCalling('getPvpMusicPlayback', scope);
  return {
    scope, starts, timers,
    setNow: (value) => { nowMs = value; },
    runAudioEffect: audioEffect,
    runTimer(id) {
      const timer = timers.get(id);
      assert.ok(timer, 'expected a scheduled timer');
      timers.delete(id);
      timer.callback();
    }
  };
}

test('partida solo toca a primeira faixa por 120s e avança na ordem da playlist', async () => {
  const app = await createMusicHarness();
  app.scope.startMusicLoop('battle');
  assert.equal(app.starts[0].id, helpers.BATTLE_MUSIC_TRACKS[0].id);
  const autoTimer = app.scope.musicAutoSkipTimerRef.current;
  assert.equal(app.timers.get(autoTimer).delay, 120000);
  app.runTimer(autoTimer);
  app.runTimer(app.scope.musicSkipSwitchTimerRef.current);
  assert.equal(app.starts[1].id, helpers.BATTLE_MUSIC_TRACKS[1].id);
  assert.equal(app.timers.get(app.scope.musicAutoSkipTimerRef.current).delay, 120000);
});

test('PVP: clientes com playlists locais diferentes retomam a mesma faixa e posição', async () => {
  const a = await createMusicHarness();
  const b = await createMusicHarness();
  for (const app of [a, b]) {
    app.scope.pvpMusicSessionRef.current = { matchId: 'duel-1', startedAtMs: 790000 };
  }
  a.scope.battleTrackIndexRef.current = 5;
  b.scope.battleTrackIndexRef.current = 0;
  a.scope.syncPvpMusic();
  b.scope.syncPvpMusic();
  assert.deepEqual(a.starts, b.starts);
  assert.deepEqual(a.starts[0], { id: helpers.BATTLE_MUSIC_TRACKS[1].id, offsetSec: 90 });
  assert.equal(a.timers.get(a.scope.musicAutoSkipTimerRef.current).delay, 30000);

  a.scope.triggerMusicTrackSkip();
  assert.equal(a.scope.musicSkipSwitchTimerRef.current, null, 'personal skips cannot desynchronize PVP');
  a.scope.syncPvpMusic();
  assert.equal(a.starts.length, 1, 'snapshots from the same slot must not restart the music');
  a.setNow(1030000);
  a.runTimer(a.scope.musicAutoSkipTimerRef.current);
  assert.deepEqual(a.starts[1], { id: helpers.BATTLE_MUSIC_TRACKS[2].id, offsetSec: 0 });
});

test('PVP: após timers suspensos a faixa acompanha o relógio compartilhado', async () => {
  const app = await createMusicHarness();
  app.scope.pvpMusicSessionRef.current = { matchId: 'team-1', startedAtMs: 1000000 };
  app.scope.syncPvpMusic();
  app.setNow(1385000);
  app.scope.syncPvpMusic();
  assert.deepEqual(app.starts[1], { id: helpers.BATTLE_MUSIC_TRACKS[3].id, offsetSec: 25 });
  app.scope.syncPvpMusic(true);
  assert.deepEqual(app.starts[2], app.starts[1], 'waking the audio context restores the common phase');
});

test('fluxo de áudio mantém a trilha entre rodadas, recupera mute e libera playlist ao sair do PVP', async () => {
  const app = await createMusicHarness();
  app.runAudioEffect();
  assert.equal(app.starts[0].id, helpers.MENU_MUSIC_TRACKS[0].id);
  assert.equal(app.timers.get(app.scope.musicAutoSkipTimerRef.current).delay, 40000);
  Object.assign(app.scope, { isBattleMusicFlow: true, pvpMusicMatchId: 'elimination-1', pvpMusicStartedAtMs: 940000 });
  app.runAudioEffect();
  assert.deepEqual(app.starts[1], { id: helpers.BATTLE_MUSIC_TRACKS[0].id, offsetSec: 60 });
  app.runAudioEffect();
  assert.equal(app.starts.length, 2);

  app.scope.audioSettings.musicEnabled = false;
  app.scope.audioSettingsRef.current.musicEnabled = false;
  app.runAudioEffect();
  assert.equal(app.scope.musicLoopTimerRef.current, null);
  app.setNow(1090000);
  app.scope.audioSettings.musicEnabled = true;
  app.scope.audioSettingsRef.current.musicEnabled = true;
  app.runAudioEffect();
  assert.deepEqual(app.starts[2], { id: helpers.BATTLE_MUSIC_TRACKS[1].id, offsetSec: 30 });

  Object.assign(app.scope, { isBattleMusicFlow: false, pvpMusicMatchId: '', pvpMusicStartedAtMs: 0 });
  app.runAudioEffect();
  app.runTimer(app.scope.musicTransitionTimerRef.current);
  assert.equal(app.starts[3].id, helpers.MENU_MUSIC_TRACKS[0].id);
  assert.equal(app.scope.musicPlaybackKeyRef.current, '');
  app.scope.triggerMusicTrackSkip();
  assert.ok(app.scope.musicSkipSwitchTimerRef.current);
});
