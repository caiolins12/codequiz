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
  const gains = [];
  const stops = [];
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
    setMusicGain: (target, durationMs) => gains.push({ target, durationMs }),
    playSfx: () => {},
    startChipSongLoop: (_ctx, track, offsetSec = 0) => {
      starts.push({ id: track.id, offsetSec });
      scope.musicSongPlayerRef.current = { stop: () => stops.push(track.id) };
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
  scope.setAudioSettings = (updater) => { scope.audioSettings = updater(scope.audioSettings); };
  scope.window = { setTimeout: scope.setTimeout };
  for (const name of ['clearMusicLoop', 'getMusicVolumeLevel', 'getPvpMusicPlayback', 'syncPvpMusic',
    'scheduleMusicAutoSkip', 'advanceMusicTrackIndex', 'triggerMusicTrackSkip', 'startMusicLoop', 'applyMusicMode',
    'updateAudioSetting', 'getSfxVolumeLevel']) {
    scope[name] = fragments.functionNamed(name, scope);
  }
  const audioEffect = fragments.effectCalling('getPvpMusicPlayback', scope);
  return {
    scope, starts, gains, stops, timers,
    setNow: (value) => { nowMs = value; },
    runAudioEffect: audioEffect,
    runTimer(id, advanceClock = false) {
      const timer = timers.get(id);
      assert.ok(timer, 'expected a scheduled timer');
      timers.delete(id);
      if (advanceClock) nowMs += timer.delay;
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
  assert.equal(app.starts.length, 1, 'the old track plays until fade-out finishes');
  assert.deepEqual(app.gains.at(-1), { target: 0, durationMs: helpers.MUSIC_SKIP_FADE_OUT_MS });
  app.runTimer(app.scope.musicSkipSwitchTimerRef.current);
  assert.equal(app.starts[1].id, helpers.BATTLE_MUSIC_TRACKS[1].id);
  assert.deepEqual(app.gains.at(-1), { target: 0.275, durationMs: helpers.MUSIC_SKIP_FADE_IN_MS });
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
  assert.equal(a.starts.length, 1);
  a.runTimer(a.scope.musicSkipSwitchTimerRef.current, true);
  assert.deepEqual(a.starts[1], {
    id: helpers.BATTLE_MUSIC_TRACKS[2].id, offsetSec: helpers.MUSIC_SKIP_SWITCH_DELAY_MS / 1000
  });
});

test('PVP: após timers suspensos a faixa acompanha o relógio compartilhado', async () => {
  const app = await createMusicHarness();
  app.scope.pvpMusicSessionRef.current = { matchId: 'team-1', startedAtMs: 1000000 };
  app.scope.syncPvpMusic();
  app.setNow(1385000);
  app.scope.syncPvpMusic();
  app.runTimer(app.scope.musicSkipSwitchTimerRef.current, true);
  assert.deepEqual(app.starts[1], {
    id: helpers.BATTLE_MUSIC_TRACKS[3].id, offsetSec: 25 + helpers.MUSIC_SKIP_SWITCH_DELAY_MS / 1000
  });
  app.scope.syncPvpMusic(true);
  app.runTimer(app.scope.musicSkipSwitchTimerRef.current);
  assert.deepEqual(app.starts[2], app.starts[1], 'waking the audio context restores the common phase');
});

test('fluxo de áudio mantém a trilha entre rodadas, recupera mute e libera playlist ao sair do PVP', async () => {
  const app = await createMusicHarness();
  app.runAudioEffect();
  assert.equal(app.starts[0].id, helpers.MENU_MUSIC_TRACKS[0].id);
  assert.equal(app.timers.get(app.scope.musicAutoSkipTimerRef.current).delay, 40000);
  Object.assign(app.scope, { isBattleMusicFlow: true, pvpMusicMatchId: 'elimination-1', pvpMusicStartedAtMs: 940000 });
  app.runAudioEffect();
  app.runTimer(app.scope.musicSkipSwitchTimerRef.current);
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

test('PVP: fade mantém a faixa antiga, não é interrompido pela sincronização e usa posição e volume atuais', async () => {
  const app = await createMusicHarness();
  app.scope.pvpMusicSessionRef.current = { matchId: 'duel-fade', startedAtMs: 1000000 };
  app.scope.syncPvpMusic();
  app.setNow(1120000);
  app.scope.syncPvpMusic();
  const switchTimer = app.scope.musicSkipSwitchTimerRef.current;
  const gainsBeforeSync = app.gains.length;
  assert.equal(app.starts.length, 1);
  assert.equal(app.stops.length, 0);
  assert.deepEqual(app.gains.at(-1), { target: 0, durationMs: 800 });
  for (const force of [false, true, false]) app.scope.syncPvpMusic(force, true);
  assert.equal(app.scope.musicSkipSwitchTimerRef.current, switchTimer);
  assert.equal(app.gains.length, gainsBeforeSync);

  app.scope.updateAudioSetting('musicVolume', 0.8);
  assert.equal(app.gains.length, gainsBeforeSync, 'the volume slider must not interrupt fade-out');
  app.runTimer(switchTimer, true);
  assert.equal(app.stops.length, 1);
  assert.deepEqual(app.starts[1], { id: helpers.BATTLE_MUSIC_TRACKS[1].id, offsetSec: 0.844 });
  assert.deepEqual(app.gains.at(-1), { target: 0.8 * 0.55, durationMs: 800 });
  const gainsAfterSwitch = app.gains.length;
  app.scope.syncPvpMusic();
  assert.equal(app.gains.length, gainsAfterSwitch, 'the periodic check must not shorten fade-in');
});

test('PVP: desligar a música cancela uma troca pendente sem iniciar outra faixa', async () => {
  const app = await createMusicHarness();
  Object.assign(app.scope, { isBattleMusicFlow: true, pvpMusicMatchId: 'mute-fade', pvpMusicStartedAtMs: 1000000 });
  app.runAudioEffect();
  app.setNow(1120000);
  app.scope.syncPvpMusic();
  const switchTimer = app.scope.musicSkipSwitchTimerRef.current;
  app.scope.audioSettings.musicEnabled = false;
  app.scope.audioSettingsRef.current.musicEnabled = false;
  app.runAudioEffect();
  assert.equal(app.timers.has(switchTimer), false);
  assert.equal(app.scope.musicSkipBusyRef.current, false);
  assert.equal(app.scope.musicLoopTimerRef.current, null);
  assert.equal(app.starts.length, 1);
});

test('sair do PVP durante o fade de entrada cancela a troca e retorna ao menu suavemente', async () => {
  const app = await createMusicHarness();
  app.runAudioEffect();
  Object.assign(app.scope, { isBattleMusicFlow: true, pvpMusicMatchId: 'exit-fade', pvpMusicStartedAtMs: 1000000 });
  app.runAudioEffect();
  const switchTimer = app.scope.musicSkipSwitchTimerRef.current;
  assert.equal(app.starts.length, 1, 'PVP is still fading out the menu');
  Object.assign(app.scope, { isBattleMusicFlow: false, pvpMusicMatchId: '', pvpMusicStartedAtMs: 0 });
  app.runAudioEffect();
  assert.equal(app.timers.has(switchTimer), false);
  app.runTimer(app.scope.musicTransitionTimerRef.current);
  assert.equal(app.starts[1].id, helpers.MENU_MUSIC_TRACKS[0].id);
  assert.deepEqual(app.gains.at(-1), { target: 0.275, durationMs: 800 });
});

test('menu: troca manual e ajustes de SFX preservam o fade e o volume atual na entrada', async () => {
  const app = await createMusicHarness();
  app.runAudioEffect();
  app.scope.triggerMusicTrackSkip();
  const switchTimer = app.scope.musicSkipSwitchTimerRef.current;
  const gainsBeforeSettings = app.gains.length;
  app.scope.updateAudioSetting('sfxVolume', 0.4);
  app.runAudioEffect();
  assert.equal(app.gains.length, gainsBeforeSettings);
  app.scope.updateAudioSetting('musicVolume', 0.3);
  assert.equal(app.gains.length, gainsBeforeSettings);
  app.runTimer(switchTimer);
  assert.equal(app.starts[1].id, helpers.MENU_MUSIC_TRACKS[1].id);
  assert.deepEqual(app.gains.at(-1), { target: 0.3 * 0.55, durationMs: 800 });
});

test('o ganho preserva uma rampa em curso quando o volume desejado não muda', async () => {
  const fragments = await fragmentsPromise;
  const automation = [];
  const scope = {
    audioContextRef: { current: { currentTime: 10 } },
    musicGainTargetRef: { current: null },
    musicGainRef: { current: { gain: {
      value: 0,
      cancelScheduledValues: (time) => automation.push(['cancel', time]),
      setValueAtTime: (value, time) => automation.push(['set', value, time]),
      linearRampToValueAtTime: (value, time) => automation.push(['ramp', value, time])
    } } }
  };
  const setGain = fragments.functionNamed('setMusicGain', scope);
  setGain(0.275, 800);
  assert.deepEqual(automation.at(-1), ['ramp', 0.275, 10.8]);
  scope.audioContextRef.current.currentTime = 10.2;
  scope.musicGainRef.current.gain.value = 0.06875;
  setGain(0.275, 240);
  assert.equal(automation.length, 3, 'a periodic update leaves the original 800ms ramp intact');
  setGain(0, 800);
  assert.deepEqual(automation.slice(-2), [['set', 0.06875, 10.2], ['ramp', 0, 11]]);
});
