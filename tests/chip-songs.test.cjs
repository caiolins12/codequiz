const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAppLoader } = require('./support/load-app.cjs');

const load = createAppLoader();
const chip = load('src/codequiz/lib/chipMusic.js');
const songs = load('src/codequiz/data/chip-songs.js');
const originalMenuIds = songs.CHIP_MENU_SONGS.map((song) => song.id);
const originalBattleIds = songs.CHIP_BATTLE_SONGS.map((song) => song.id);
const helpers = load('src/codequiz/app/helpers.js');

const ALL_SONGS = [...songs.CHIP_MENU_SONGS, ...songs.CHIP_BATTLE_SONGS];
const LINES = ['lead', 'lead2', 'arp', 'pad', 'bass', 'drums'];

test('notação: notas, repetições e grupos', () => {
  assert.equal(Math.round(chip.noteToFrequency('A4')), 440);
  assert.equal(Math.round(chip.noteToFrequency('C4') * 100), 26163);
  assert.equal(chip.noteToFrequency('Bb3'), chip.noteToFrequency('A#3'));
  assert.equal(chip.noteToFrequency('H2'), null);
  assert.deepEqual(chip.expandChipLine('C4 -*2 (D4 .)*2'), ['C4', '-', '-', 'D4', '.', 'D4', '.']);
  assert.deepEqual(chip.expandChipLine(['A4 -', '.*2']), ['A4', '-', '.', '.']);
});

test('compilação junta notas seguradas e começa o loop depois da introdução', () => {
  const song = {
    id: 'teste',
    bpm: 120,
    order: ['intro', 'corpo'],
    loopFrom: 1,
    patterns: {
      intro: { lead: 'C4 -*15', drums: 'k . . .' },
      corpo: { lead: 'E4 - - - . . G4 -*9', lead2: '@lead+12' }
    }
  };
  const compiled = chip.compileChipSong(song);
  assert.equal(compiled.length, 32);
  assert.equal(compiled.loopStep, 16);
  assert.equal(compiled.steps[0].notes[0].steps, 16);
  assert.deepEqual([0, 4, 8, 12].map((step) => compiled.steps[step].drums), ['k', 'k', 'k', 'k']);
  const g4 = compiled.steps[22].notes.filter((note) => note.channel === 'lead')[0];
  assert.equal(g4.steps, 10);
  const g5 = compiled.steps[22].notes.filter((note) => note.channel === 'lead2')[0];
  assert.equal(Math.round(g5.freqs[0] / g4.freqs[0]), 2);
  assert.throws(() => chip.compileChipSong({ ...song, patterns: { ...song.patterns, intro: { lead: 'C4 -*10' } } }));
  assert.throws(() => chip.compileChipSong({ ...song, patterns: { ...song.patterns, intro: { drums: 'kz -*15' } } }));
});

test('as trilhas compostas compilam com compassos completos em todas as linhas', () => {
  assert.equal(ALL_SONGS.length, 10);
  ALL_SONGS.forEach((song) => {
    assert.equal(song.engine, chip.CHIP_SONG_ENGINE);
    Object.entries(song.patterns).forEach(([name, pattern]) => {
      const sizes = LINES
        .filter((line) => pattern[line] && !String(pattern[line]).startsWith('@'))
        .map((line) => chip.expandChipLine(pattern[line]).length);
      const size = Math.max(...sizes);
      LINES.forEach((line) => {
        const raw = pattern[line];
        if (!raw || String(raw).startsWith('@')) return;
        if (Array.isArray(raw)) {
          raw.forEach((bar, index) => {
            assert.equal(chip.expandChipLine(bar).length, 16, `${song.id}/${name}/${line} compasso ${index + 1}`);
          });
        }
        const length = chip.expandChipLine(raw).length;
        const allowed = line === 'drums' ? [size, 16] : [size];
        assert.ok(allowed.includes(length), `${song.id}/${name}/${line}: ${length} passos, padrão tem ${size}`);
      });
    });
    const compiled = chip.compileChipSong(song);
    assert.ok(compiled.loopStep > 0, `${song.id} tem introdução`);
    const { totalSec, loopSec } = chip.getChipSongDurations(song);
    // As introduções e os loops têm duração suficiente para manter variedade.
    assert.ok(totalSec >= 26, `${song.id}: ${totalSec.toFixed(1)} s`);
    assert.ok(loopSec >= 20, `${song.id}: loop de ${loopSec.toFixed(1)} s`);
  });
});

test('lead fica numa região confortável (sem notas estridentes ou graves demais)', () => {
  ALL_SONGS.forEach((song) => {
    chip.compileChipSong(song).steps.forEach((slot) => {
      slot.notes.filter((note) => note.channel === 'lead').forEach((note) => {
        note.freqs.forEach((freq) => {
          assert.ok(freq >= 200 && freq <= 1400, `${song.id}: lead em ${freq.toFixed(0)} Hz`);
        });
      });
    });
  });
});

test('trilhas novas entram nas listas de menu e de batalha com ids únicos', () => {
  const menuIds = helpers.MENU_MUSIC_TRACKS.map((track) => track.id);
  const battleIds = helpers.BATTLE_MUSIC_TRACKS.map((track) => track.id);
  songs.CHIP_MENU_SONGS.forEach((song) => assert.ok(menuIds.includes(song.id)));
  songs.CHIP_BATTLE_SONGS.forEach((song) => assert.ok(battleIds.includes(song.id)));
  const ids = [...menuIds, ...battleIds];
  assert.equal(new Set(ids).size, ids.length);
});

test('playlists começam pelas músicas novas em ordem de adição invertida sem alterar os catálogos', () => {
  const menuIds = originalMenuIds;
  const battleIds = originalBattleIds;
  assert.deepEqual(
    helpers.MENU_MUSIC_TRACKS.slice(0, menuIds.length).map((track) => track.id),
    [...menuIds].reverse()
  );
  assert.deepEqual(
    helpers.BATTLE_MUSIC_TRACKS.slice(0, battleIds.length).map((track) => track.id),
    [...battleIds].reverse()
  );
  assert.deepEqual(songs.CHIP_MENU_SONGS.map((song) => song.id), menuIds);
  assert.deepEqual(songs.CHIP_BATTLE_SONGS.map((song) => song.id), battleIds);
  assert.deepEqual(
    helpers.MENU_MUSIC_TRACKS.slice(menuIds.length).map((track) => track.id),
    ['skyline_arcade', 'ode_to_joy_arcade', 'greensleeves_reverie', 'alla_turca_arcade', 'blue_danube_lounge', 'menuet_grid_drive', 'kalinka_sunset_run', 'fur_elise_neon', 'canon_d_lights']
  );
  assert.deepEqual(
    helpers.BATTLE_MUSIC_TRACKS.slice(battleIds.length).map((track) => track.id),
    ['assault_convoy', 'infernal_cancan_rush', 'mountain_king_charge', 'william_tell_overdrive', 'bumblebee_barrage', 'korobeiniki_overclock', 'sugar_plum_blitz', 'valkyrie_stormfront', 'hungarian_dance_overheat']
  );
});
