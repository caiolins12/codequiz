const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const chip = createAppLoader()('src/codequiz/lib/chipMusic.js');
const SONG = {
  id: 'playback-clock',
  bpm: 120,
  order: ['intro', 'body'],
  loopFrom: 1,
  patterns: {
    intro: { lead: 'C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5 B5 C6 D6' },
    body: { lead: 'C5 D5 E5 F5 G5 A5 B5 C6 D6 E6 F6 G6 A6 B6 C7 D7' }
  }
};

beforeEach((t) => {
  t.mock.method(performance, 'now', () => 1000);
});

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message || 'tempo'}: ${actual} != ${expected}`);
}

function fakeAudioContext(currentTime = 0) {
  const oscillators = [];
  const parameter = () => ({
    value: 0,
    events: [],
    setValueAtTime(value, time) { this.events.push({ value, time }); },
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
    cancelScheduledValues() {}
  });
  const node = () => ({
    gain: parameter(),
    frequency: parameter(),
    Q: parameter(),
    pan: parameter(),
    detune: parameter(),
    delayTime: parameter(),
    starts: [],
    stops: [],
    connect() {},
    disconnect() {},
    setPeriodicWave() {},
    start(time) { this.starts.push(time); },
    stop(time) { this.stops.push(time); }
  });
  return {
    currentTime,
    oscillators,
    createGain: node,
    createDelay: node,
    createBiquadFilter: node,
    createStereoPanner: node,
    createPeriodicWave() { return {}; },
    createOscillator() {
      const oscillator = node();
      oscillators.push(oscillator);
      return oscillator;
    }
  };
}

test('posição percorre a introdução uma vez e repete só o corpo', () => {
  assert.deepEqual(chip.getChipSongPlaybackPosition(SONG), {
    stepNumber: 0, stepIndex: 0, nextStepSec: 0
  });
  assert.deepEqual(chip.getChipSongPlaybackPosition(SONG, 1.875), {
    stepNumber: 15, stepIndex: 15, nextStepSec: 1.875
  });
  assert.deepEqual(chip.getChipSongPlaybackPosition(SONG, 4), {
    stepNumber: 32, stepIndex: 16, nextStepSec: 4
  });
  assert.deepEqual(chip.getChipSongPlaybackPosition(SONG, 6.33), {
    stepNumber: 51, stepIndex: 19, nextStepSec: 6.375
  });
  assert.deepEqual(chip.getChipSongPlaybackPosition(SONG, 120), {
    stepNumber: 960, stepIndex: 16, nextStepSec: 120
  });
});

test('posição fracionária respeita ataques com swing de semicolcheias e colcheias', () => {
  const sixteenth = { ...SONG, swing: 0.4 };
  const delayed = chip.getChipSongPlaybackPosition(sixteenth, 0.14);
  assert.equal(delayed.stepIndex, 1);
  close(delayed.nextStepSec, 0.175);
  assert.equal(chip.getChipSongPlaybackPosition(sixteenth, 0.176).stepIndex, 2);

  const eighth = { ...SONG, swing: 0.4, swingUnit: 8 };
  const beforeShuffle = chip.getChipSongPlaybackPosition(eighth, 0.3);
  assert.equal(beforeShuffle.stepIndex, 2);
  close(beforeShuffle.nextStepSec, 0.35);
  const afterShuffle = chip.getChipSongPlaybackPosition(eighth, 0.36);
  assert.equal(afterShuffle.stepIndex, 3);
  close(afterShuffle.nextStepSec, 0.425);
  const loopShuffle = chip.getChipSongPlaybackPosition(eighth, 4.3);
  assert.equal(loopShuffle.stepIndex, 18);
  close(loopShuffle.nextStepSec, 4.35);
});

test('posição trata offsets inválidos e preserva limites sujeitos a arredondamento', () => {
  [-1, NaN, Infinity, undefined].forEach((offset) => {
    assert.equal(chip.getChipSongPlaybackPosition(SONG, offset).stepIndex, 0);
  });
  const thirds = { ...SONG, bpm: 100 };
  const position = chip.getChipSongPlaybackPosition(thirds, 0.45);
  assert.equal(position.stepIndex, 3);
  close(position.nextStepSec, 0.45);
});

test('player sem offset mantém a primeira nota e o preroll de 60 ms', () => {
  const ctx = fakeAudioContext(100);
  const player = chip.createChipSongPlayer({ ctx, output: {}, song: SONG });
  player.tick();
  assert.equal(ctx.oscillators.length, 1);
  close(ctx.oscillators[0].starts[0], 100.06);
  close(ctx.oscillators[0].frequency.events[0].value, chip.noteToFrequency('C4'));
});

test('player que entra no meio retoma o próximo ataque na fase exata do corpo', () => {
  const ctx = fakeAudioContext(100);
  const player = chip.createChipSongPlayer({ ctx, output: {}, song: SONG, offsetSec: 6.33 });
  player.tick();
  assert.equal(ctx.oscillators.length, 1);
  close(ctx.oscillators[0].starts[0], 100.105);
  close(ctx.oscillators[0].frequency.events[0].value, chip.noteToFrequency('F5'));
});

test('jogadores que entram em instantes diferentes agendam a mesma nota no mesmo instante real', () => {
  const first = fakeAudioContext(10);
  const later = fakeAudioContext(42);
  chip.createChipSongPlayer({ ctx: first, output: {}, song: SONG, offsetSec: 6.33 }).tick();
  chip.createChipSongPlayer({ ctx: later, output: {}, song: SONG, offsetSec: 6.36 }).tick();
  close(first.oscillators[0].frequency.events[0].value, later.oscillators[0].frequency.events[0].value);
  const firstDelay = first.oscillators[0].starts[0] - first.currentTime;
  const laterDelay = later.oscillators[0].starts[0] - later.currentTime;
  close(firstDelay, laterDelay + 0.03, 'desconta os 30 ms decorridos até a entrada do segundo jogador');
});

test('tick atrasado pula ataques perdidos e mantém a fase após várias voltas', () => {
  const ctx = fakeAudioContext(10);
  const player = chip.createChipSongPlayer({ ctx, output: {}, song: SONG });
  player.tick();
  ctx.currentTime = 15.34;
  player.tick();
  assert.equal(ctx.oscillators.length, 2, 'não despeja todas as notas perdidas');
  close(ctx.oscillators[1].starts[0], 15.435);
  close(ctx.oscillators[1].frequency.events[0].value, chip.noteToFrequency('G6'));

  ctx.currentTime = 15.5;
  player.tick();
  close(ctx.oscillators[2].starts[0], 15.56);
  close(ctx.oscillators[2].frequency.events[0].value, chip.noteToFrequency('A6'));
});

test('tick atrasado recupera um ataque com swing que ainda está no futuro', () => {
  const ctx = fakeAudioContext();
  const player = chip.createChipSongPlayer({ ctx, output: {}, song: { ...SONG, swing: 0.4 } });
  player.tick();
  ctx.currentTime = 0.2;
  player.tick();
  assert.equal(ctx.oscillators.length, 3);
  close(ctx.oscillators[1].starts[0], 0.235);
  close(ctx.oscillators[1].frequency.events[0].value, chip.noteToFrequency('D4'));
  close(ctx.oscillators[2].starts[0], 0.31);
});

test('stop cancela fontes e impede novos agendamentos', () => {
  const ctx = fakeAudioContext();
  const player = chip.createChipSongPlayer({ ctx, output: {}, song: SONG });
  player.tick();
  player.stop();
  assert.equal(ctx.oscillators[0].stops.length, 2);
  close(ctx.oscillators[0].stops[1], 0.05);
  ctx.currentTime = 20;
  player.tick();
  player.stop();
  assert.equal(ctx.oscillators.length, 1);
});
