// Trilhas compostas para o jogo no estilo das músicas de videogame dos anos 80 e 90.
// As melodias são originais: de cada referência vêm só o gênero, o andamento, os
// timbres e a forma de arranjar (baixo, bateria, arpejos, eco), nunca as notas.
// Notação descrita em lib/chipMusic.js.

import { CHIP_SONG_ENGINE } from '../lib/chipMusic';

// ---------------------------------------------------------------------------
// Nitro Highway: corrida de 16 bits (referência: Top Gear, SNES, 1992).
// Rock eletrônico rápido, baixo em oitavas colcheia a colcheia, lead com eco.

const ROCK = 'kh . h . sh . h . kh . kh . sh . o .';
const ROCK_IN = 'kc . h . sh . h . kh . kh . sh . o .';
const ROCK_DRIVE = 'kh . h kh sh . h . kh . kh . sh . o h';
const ROCK_FILL = 'kh . h . sh . h . kh . s . s s s s';
const octaves = (low, high) => `(${low} - ${high} -)*4`;

const NITRO_HIGHWAY = {
  id: 'nitro_highway',
  name: 'Nitro Highway',
  engine: CHIP_SONG_ENGINE,
  bpm: 156,
  gain: 1.25,
  echo: { steps: 3, feedback: 0.3, mix: 0.26 },
  voices: {
    lead: { unison: 7 },
    pad: { volume: 0.014 }
  },
  order: ['intro', 'a', 'b', 'a2', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*24 A4 - B4 - C#5 - E5 -',
      arp: 'B3+D4+F#4 -*15 A3+C#4+E4 -*15',
      bass: `${octaves('B2', 'B3')} (A2 - A3 -)*3 A2 - A#2 -`,
      drums: ['k . h . k . h . k . h . k . h .', 'k . h . s . h . k . s . s s s s']
    },
    a: {
      lead: [
        'F#5 -*5 G5 - F#5 - E5 - D5 -*3',
        'E5 -*5 D5 - B4 -*3 D5 - E5 -',
        'F#5 -*5 A5 - F#5 - E5 - D5 -*3',
        'E5 -*5 C#5 - A4 -*3 C#5 - E5 -'
      ],
      arp: 'B3+D4+F#4 -*15 G3+B3+D4 -*15 D4+F#4+A4 -*15 A3+C#4+E4 -*15',
      bass: [octaves('B2', 'B3'), octaves('G2', 'G3'), octaves('D2', 'D3'), octaves('A2', 'A3')],
      drums: [ROCK_IN, ROCK, ROCK, ROCK_FILL]
    },
    b: {
      lead: [
        'B4 - E5 - G5 -*5 F#5 - E5 - D5 -',
        'C#5 - F#5 - A5 -*5 B5 - A5 - F#5 -',
        'D5 - G5 - B5 -*5 A5 - G5 - A5 -',
        'E5 - A5 - C#6 -*7 .*4'
      ],
      arp: 'G3+B3+E4 -*15 F#3+A3+C#4 -*15 G3+B3+D4 -*15 A3+C#4+E4 -*15',
      bass: [octaves('E2', 'E3'), octaves('F#2', 'F#3'), octaves('G2', 'G3'), '(A2 - A3 -)*3 A2 - A#2 -'],
      drums: [ROCK, ROCK, ROCK, ROCK_FILL]
    },
    a2: {
      lead: [
        'F#5 -*5 G5 - F#5 - E5 - D5 -*3',
        'E5 -*5 D5 - B4 -*3 D5 - E5 -',
        'F#5 -*5 A5 - F#5 - E5 - D5 -*3',
        'E5 -*5 C#5 - A4 -*3 C#5 - E5 -'
      ],
      lead2: [
        'D5 -*5 E5 - D5 - C#5 - B4 -*3',
        'B4 -*5 B4 - G4 -*3 B4 - B4 -',
        'D5 -*5 F#5 - D5 - C#5 - A4 -*3',
        'C#5 -*5 A4 - E4 -*3 A4 - C#5 -'
      ],
      pad: 'B3+D4+F#4 -*15 G3+B3+D4 -*15 F#3+A3+D4 -*15 E3+A3+C#4 -*15',
      arp: 'B3+D4+F#4 -*15 G3+B3+D4 -*15 D4+F#4+A4 -*15 A3+C#4+E4 -*15',
      bass: [octaves('B2', 'B3'), octaves('G2', 'G3'), octaves('D2', 'D3'), octaves('A2', 'A3')],
      drums: [ROCK_IN, ROCK, ROCK, ROCK_FILL]
    },
    c: {
      lead: [
        'B5 -*5 A5 - B5 - D6 -*5',
        'C#6 -*5 B5 - A5 - E5 -*5',
        'F#5 -*3 A5 -*3 C#6 -*3 B5 - A5 -',
        'B5 -*11 .*4',
        'D5 - G5 - B5 - D6 -*5 B5 - D6 -',
        'C#6 -*5 B5 - A5 - E5 -*5',
        'A5 -*5 F#5 - A5 - D6 -*5',
        'C#6 -*7 B5 - A5 - G5 - E5 -'
      ],
      lead2: '@lead-12',
      pad: [
        'G3+B3+D4 -*15', 'A3+C#4+E4 -*15', 'F#3+A3+C#4 -*15', 'F#3+B3+D4 -*15',
        'G3+B3+D4 -*15', 'A3+C#4+E4 -*15', 'F#3+A3+D4 -*15', 'E3+A3+C#4 -*15'
      ],
      arp: [
        'G3+B3+D4 -*15', 'A3+C#4+E4 -*15', 'F#3+A3+C#4 -*15', 'B3+D4+F#4 -*15',
        'G3+B3+D4 -*15', 'A3+C#4+E4 -*15', 'D4+F#4+A4 -*15', 'A3+C#4+E4 -*15'
      ],
      bass: [
        octaves('G2', 'G3'), octaves('A2', 'A3'), octaves('F#2', 'F#3'), octaves('B2', 'B3'),
        octaves('G2', 'G3'), octaves('A2', 'A3'), octaves('D2', 'D3'), '(A2 - A3 -)*3 A2 - A#2 -'
      ],
      drums: [ROCK_IN, ROCK_DRIVE, ROCK_DRIVE, ROCK_FILL, ROCK_IN, ROCK_DRIVE, ROCK_DRIVE, ROCK_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Sunny Loop Valley: fase de plataforma do Mega Drive (referência: Sonic the
// Hedgehog, Green Hill Zone, 1991). Melodia sincopada, baixo "slap", palmas,
// acordes com sétima tocados em contratempo e um sino dobrando a melodia.

const SUNNY = 'kh . h h xs . h . kh . h kh xs . h h';
const SUNNY_IN = 'kc . h h xs . h . kh . h kh xs . h h';
const SUNNY_FILL = 'kh . h h xs . h . kh . s . s s t t';
const comp = (chord) => `${chord} - . . . . ${chord} - . . ${chord} - . . . .`;
const slap = (root, octave, fifthBelow, third, fifth) => (
  `${root} - ${octave} . ${fifthBelow} - ${root} - . - ${root} - ${third} - ${fifth} -`
);
const SUNNY_CHORDS = {
  cadd9: { comp: comp('E4+G4+D5'), bass: slap('C3', 'C4', 'G2', 'E3', 'G3') },
  am7: { comp: comp('C4+E4+G4'), bass: slap('A2', 'A3', 'E2', 'C3', 'E3') },
  dm7: { comp: comp('C4+F4+A4'), bass: slap('D3', 'D4', 'A2', 'F3', 'A3') },
  g7: { comp: comp('B3+D4+F4'), bass: slap('G2', 'G3', 'D2', 'B2', 'D3') },
  fmaj7: { comp: comp('A3+C4+E4'), bass: slap('F2', 'F3', 'C2', 'A2', 'C3') },
  em7: { comp: comp('B3+D4+G4'), bass: slap('E2', 'E3', 'B1', 'G2', 'B2') }
};
const sunnyBars = (names, part) => names.map((name) => SUNNY_CHORDS[name][part]);

const SUNNY_LOOP_VALLEY = {
  id: 'sunny_loop_valley',
  name: 'Sunny Loop Valley',
  engine: CHIP_SONG_ENGINE,
  bpm: 148,
  gain: 1.1,
  drumVolume: 0.85,
  echo: { steps: 2, feedback: 0.22, mix: 0.16 },
  voices: {
    lead: { wave: 'pulse25', volume: 0.08, vibrato: { rate: 6, depth: 10, delay: 0.22 }, echo: 0.2 },
    lead2: { wave: 'sine', volume: 0.045, decay: 0.18, sustain: 0.2, release: 0.12, vibrato: null, pan: 0.3 },
    pad: {
      wave: 'triangle', volume: 0.04, attack: 0.004, decay: 0.16, sustain: 0.45, release: 0.08, gate: 0.9,
      filter: null, echo: 0.12
    },
    bass: { volume: 0.11, filter: { freq: 380, q: 7, env: 2600, envDecay: 0.07 } }
  },
  order: ['intro', 'a', 'a2', 'b', 'a2'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*24 G4 - A4 - B4 - D5 -',
      pad: sunnyBars(['fmaj7', 'g7'], 'comp'),
      bass: sunnyBars(['fmaj7', 'g7'], 'bass'),
      drums: ['k . h h . . h . k . h k . . h h', SUNNY_FILL]
    },
    a: {
      lead: [
        'E5 - G5 - . - C6 -*3 B5 - G5 - . -',
        'A5 -*3 . - G5 - . - E5 -*3 . -',
        'F5 - A5 - . - D6 -*3 C6 - A5 - . -',
        'B5 -*3 . - A5 - G5 - F5 - D5 - . -'
      ],
      pad: sunnyBars(['cadd9', 'am7', 'dm7', 'g7'], 'comp'),
      bass: sunnyBars(['cadd9', 'am7', 'dm7', 'g7'], 'bass'),
      drums: [SUNNY_IN, SUNNY, SUNNY, SUNNY_FILL]
    },
    a2: {
      lead: [
        'E5 - G5 - . - C6 -*3 B5 - G5 - . -',
        'A5 -*3 . - G5 - . - E5 -*3 . -',
        'F5 - A5 - . - D6 -*3 E6 - D6 - C6 -',
        'B5 -*5 G5 - . - D5 - E5 - G5 -'
      ],
      lead2: '@lead+12',
      pad: sunnyBars(['cadd9', 'am7', 'dm7', 'g7'], 'comp'),
      bass: sunnyBars(['cadd9', 'am7', 'dm7', 'g7'], 'bass'),
      drums: [SUNNY_IN, SUNNY, SUNNY, SUNNY_FILL]
    },
    b: {
      lead: [
        'A5 -*3 C6 - . - A5 -*3 G5 - E5 -',
        'G5 -*3 B5 - . - G5 -*3 E5 - D5 -',
        'F5 -*3 A5 - . - C6 -*3 A5 - F5 -',
        'G5 -*5 A5 - B5 - D6 -*5'
      ],
      pad: sunnyBars(['fmaj7', 'em7', 'dm7', 'g7'], 'comp'),
      bass: sunnyBars(['fmaj7', 'em7', 'dm7', 'g7'], 'bass'),
      drums: [SUNNY_IN, SUNNY, SUNNY, SUNNY_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Round One Rumble: tema de luta de arcade (referência: Street Fighter II,
// tema do Guile, 1991). Fusion em mi menor, ataques de metais sincopados,
// baixo pulsante e um lead "guitarra" com vibrato largo.

const FIGHT = 'kh h h h sh h h kh h h kh h sh h o h';
const FIGHT_IN = 'kc h h h sh h h kh h h kh h sh h o h';
const FIGHT_FILL = 'kh h h h sh h h kh s s s s t t t t';
const hit = (chord) => `${chord} - . ${chord} - . ${chord} - . . ${chord} - . . . .`;
const drive = (root, octave, a, b, c) => `${root} - ${root} - ${octave} - ${root} - ${a} - ${root} - ${b} - ${c} -`;
const FIGHT_CHORDS = {
  em7: { hit: hit('G3+B3+D4'), bass: drive('E2', 'E3', 'D3', 'B2', 'D3') },
  c: { hit: hit('G3+C4+E4'), bass: drive('C3', 'C4', 'D3', 'G2', 'E3') },
  d: { hit: hit('F#3+A3+D4'), bass: drive('D2', 'D3', 'C3', 'A2', 'C3') },
  bm: { hit: hit('F#3+B3+D4'), bass: drive('B2', 'B3', 'A2', 'F#2', 'A2') },
  am: { hit: hit('E3+A3+C4'), bass: drive('A2', 'A3', 'G2', 'E2', 'G2') },
  b7: { hit: hit('F#3+A3+D#4'), bass: drive('B2', 'B3', 'A2', 'F#2', 'D#3') }
};
const fightBars = (names, part) => names.map((name) => FIGHT_CHORDS[name][part]);

const ROUND_ONE_RUMBLE = {
  id: 'round_one_rumble',
  name: 'Round One Rumble',
  engine: CHIP_SONG_ENGINE,
  bpm: 132,
  gain: 1.6,
  echo: { steps: 3, feedback: 0.26, mix: 0.2 },
  voices: {
    lead: {
      wave: 'sawtooth', volume: 0.07, unison: 9, filter: { freq: 2600, q: 1.2 },
      vibrato: { rate: 5.4, depth: 18, delay: 0.2 }
    },
    lead2: { wave: 'sawtooth', volume: 0.04, filter: { freq: 2000, q: 0.8 } },
    pad: {
      wave: 'sawtooth', volume: 0.026, attack: 0.004, decay: 0.12, sustain: 0.5, release: 0.06, gate: 0.85,
      filter: { freq: 1800, q: 1 }, echo: 0.1
    },
    bass: { wave: 'square', volume: 0.08, filter: { freq: 420, q: 5, env: 1200, envDecay: 0.1 } }
  },
  order: ['intro', 'a', 'b', 'a2', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      pad: fightBars(['em7', 'em7'], 'hit'),
      bass: fightBars(['em7', 'em7'], 'bass'),
      drums: [FIGHT, FIGHT_FILL]
    },
    a: {
      lead: [
        'B4 -*3 E5 -*3 F#5 - G5 - F#5 - E5 -',
        'D5 - B4 - E5 -*9 . -',
        'G5 -*3 E5 -*3 G5 - A5 - B5 - G5 -',
        'A5 -*5 F#5 - D5 - A5 -*5'
      ],
      pad: fightBars(['em7', 'em7', 'c', 'd'], 'hit'),
      bass: fightBars(['em7', 'em7', 'c', 'd'], 'bass'),
      drums: [FIGHT_IN, FIGHT, FIGHT, FIGHT_FILL]
    },
    b: {
      lead: [
        'C5 - E5 - A5 -*5 G5 - E5 - D5 -',
        'D5 - F#5 - B5 -*5 A5 - F#5 - E5 -',
        'E5 - G5 - C6 -*5 B5 - G5 - E5 -',
        'F#5 -*3 A5 -*3 D6 -*3 C6 - A5 -'
      ],
      pad: fightBars(['am', 'bm', 'c', 'd'], 'hit'),
      bass: fightBars(['am', 'bm', 'c', 'd'], 'bass'),
      drums: [FIGHT_IN, FIGHT, FIGHT, FIGHT_FILL]
    },
    a2: {
      lead: [
        'B4 -*3 E5 -*3 F#5 - G5 - F#5 - E5 -',
        'D5 - B4 - E5 -*9 . -',
        'G5 -*3 E5 -*3 G5 - A5 - B5 - G5 -',
        'F#5 -*5 D#5 - B4 - F#5 -*3 A5 -'
      ],
      lead2: '@lead-12',
      pad: fightBars(['em7', 'em7', 'c', 'b7'], 'hit'),
      bass: fightBars(['em7', 'em7', 'c', 'b7'], 'bass'),
      drums: [FIGHT_IN, FIGHT, FIGHT, FIGHT_FILL]
    },
    c: {
      lead: [
        'C6 -*5 B5 - G5 - E5 -*5',
        'D6 -*5 C6 - A5 - F#5 -*5',
        'B5 -*3 A5 - F#5 - D5 -*3 F#5 - A5 -',
        'G5 -*7 F#5 - E5 - B4 -*3',
        'A5 -*5 G5 - E5 - C5 -*5',
        'D#5 -*5 F#5 - A5 - B5 -*5',
        'B5 -*3 G5 - F#5 - E5 -*7',
        '.*8 A5 - F#5 - E5 - D5 -'
      ],
      lead2: [
        'G5 -*5 G5 - E5 - C5 -*5',
        'A5 -*5 A5 - F#5 - D5 -*5',
        'F#5 -*3 F#5 - D5 - B4 -*3 D5 - F#5 -',
        'E5 -*7 D5 - B4 - G4 -*3',
        'E5 -*5 E5 - C5 - A4 -*5',
        'B4 -*5 D#5 - F#5 - F#5 -*5',
        'G5 -*3 E5 - D5 - B4 -*7',
        '.*16'
      ],
      pad: fightBars(['c', 'd', 'bm', 'em7', 'am', 'b7', 'em7', 'd'], 'hit'),
      bass: fightBars(['c', 'd', 'bm', 'em7', 'am', 'b7', 'em7', 'd'], 'bass'),
      drums: [FIGHT_IN, FIGHT, FIGHT, FIGHT, FIGHT_IN, FIGHT, FIGHT, FIGHT_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Steel Fortress Climb: fortaleza final de 8 bits (referência: Mega Man 2,
// Dr. Wily Stage 1, 1988). Ré menor heroico a 176 BPM, dois canais de pulso,
// baixo de onda triangular galopando e arpejos rápidos.

const NES = 'kh . h . sh . h . kh . h kh sh . h h';
const NES_IN = 'kc . h . sh . h . kh . h kh sh . h h';
const NES_FILL = 'kh . h . sh . h . s s s s s . s s';
const gallop = (low, high) => `(${low} - ${high} - ${low} ${low} ${high} -)*2`;
const FORTRESS_CHORDS = {
  dm: { arp: 'D4+F4+A4 -*15', bass: gallop('D3', 'D4') },
  bb: { arp: 'D4+F4+Bb4 -*15', bass: gallop('Bb2', 'Bb3') },
  c: { arp: 'E4+G4+C5 -*15', bass: gallop('C3', 'C4') },
  a: { arp: 'E4+A4+C#5 -*15', bass: gallop('A2', 'A3') },
  f: { arp: 'F4+A4+C5 -*15', bass: gallop('F3', 'F4') },
  gm: { arp: 'D4+G4+Bb4 -*15', bass: gallop('G2', 'G3') }
};
const fortressBars = (names, part) => names.map((name) => FORTRESS_CHORDS[name][part]);

const STEEL_FORTRESS_CLIMB = {
  id: 'steel_fortress_climb',
  name: 'Steel Fortress Climb',
  engine: CHIP_SONG_ENGINE,
  bpm: 176,
  gain: 0.85,
  echo: { steps: 3, feedback: 0.24, mix: 0.24 },
  voices: {
    lead: { wave: 'pulse25', volume: 0.085, vibrato: { rate: 6.2, depth: 22, delay: 0.24 } },
    lead2: { wave: 'pulse12', volume: 0.05, pan: 0.3 },
    arp: { wave: 'square', volume: 0.026, pan: -0.3 },
    bass: { wave: 'triangle', volume: 0.2, filter: null, gate: 0.7, decay: 0.05, sustain: 0.9 }
  },
  order: ['intro', 'a', 'a2', 'b', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      arp: fortressBars(['dm', 'a'], 'arp'),
      bass: fortressBars(['dm', 'a'], 'bass'),
      drums: ['k . h . k . h . k . h . k . h .', NES_FILL]
    },
    a: {
      lead: [
        'D5 -*3 A4 -*3 D5 - E5 - F5 -*3',
        'F5 -*3 D5 - Bb4 - F5 -*3 G5 - F5 -',
        'E5 -*5 G5 - C6 -*7',
        'A5 -*11 G5 - F5 -'
      ],
      arp: fortressBars(['dm', 'bb', 'c', 'dm'], 'arp'),
      bass: fortressBars(['dm', 'bb', 'c', 'dm'], 'bass'),
      drums: [NES_IN, NES, NES, NES_FILL]
    },
    a2: {
      lead: [
        'D5 -*3 A4 -*3 D5 - E5 - F5 -*3',
        'F5 -*3 D5 - Bb4 - F5 -*3 G5 - F5 -',
        'E5 -*5 G5 - C6 - D6 - E6 -*3',
        'C#6 -*11 .*4'
      ],
      lead2: [
        'A4 -*3 F4 -*3 A4 - C5 - D5 -*3',
        'D5 -*3 Bb4 - F4 - D5 -*3 Bb4 - D5 -',
        'C5 -*5 E5 - G5 - A5 - C6 -*3',
        'A5 -*11 .*4'
      ],
      arp: fortressBars(['dm', 'bb', 'c', 'a'], 'arp'),
      bass: fortressBars(['dm', 'bb', 'c', 'a'], 'bass'),
      drums: [NES_IN, NES, NES, NES_FILL]
    },
    b: {
      lead: [
        'A5 - . A5 - . A5 - F5 - G5 - A5 -*3',
        'C6 - . C6 - . C6 - A5 - Bb5 - C6 -*3',
        'D6 -*3 Bb5 -*3 G5 -*3 Bb5 - D6 -',
        'C#6 -*5 B5 - A5 - E5 -*5'
      ],
      lead2: '@lead-12',
      arp: fortressBars(['dm', 'f', 'gm', 'a'], 'arp'),
      bass: fortressBars(['dm', 'f', 'gm', 'a'], 'bass'),
      drums: [NES_IN, NES, NES, NES_FILL]
    },
    c: {
      lead: [
        'D5 -*3 F5 -*3 Bb5 -*7',
        'C6 -*3 Bb5 - A5 - G5 -*7',
        'A5 -*15',
        '.*4 F5 - G5 - A5 - C6 - D6 -*3',
        'D6 -*3 C6 - Bb5 - F5 -*7',
        'E5 - G5 - C6 -*5 D6 - E6 -*3',
        'C#6 -*15',
        '.*8 A4 - C#5 - E5 - G5 -'
      ],
      lead2: [
        'Bb4 -*3 D5 -*3 F5 -*7',
        'G5 -*3 G5 - F5 - E5 -*7',
        'F5 -*15',
        '.*4 D5 - E5 - F5 - A5 - A5 -*3',
        'Bb5 -*3 A5 - F5 - D5 -*7',
        'C5 - E5 - G5 -*5 A5 - C6 -*3',
        'A5 -*15',
        '.*16'
      ],
      arp: fortressBars(['bb', 'c', 'dm', 'dm', 'bb', 'c', 'a', 'a'], 'arp'),
      bass: fortressBars(['bb', 'c', 'dm', 'dm', 'bb', 'c', 'a', 'a'], 'bass'),
      drums: [NES_IN, NES, NES, NES_FILL, NES_IN, NES, NES, NES_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Sunset Coast Cruise: estrada à beira-mar de arcade (referência: Out Run,
// Magical Sound Shower, 1986). Fusion latina em fá maior: baixo de samba,
// cowbell e chocalho, acordes em montuno e um lead percussivo com eco.

const LATIN = 'kp p bp p rp p kp bp kp p bp p rp p bp p';
const LATIN_IN = 'kcp p bp p rp p kp bp kp p bp p rp p bp p';
const LATIN_FILL = 'kp p bp p rp p kp bp kp p t . t t s s';
const montuno = (chord) => `${chord} - . ${chord} . . ${chord} - . . ${chord} . ${chord} - . .`;
const samba = (root, fifth) => `${root} - - ${fifth} ${root} - - ${fifth} ${root} - - ${fifth} ${root} - ${fifth} -`;
const COAST_CHORDS = {
  fmaj7: { comp: montuno('A3+C4+G4'), bass: samba('F2', 'C3') },
  am7: { comp: montuno('G3+C4+E4'), bass: samba('A2', 'E3') },
  bbmaj7: { comp: montuno('A3+D4+F4'), bass: samba('Bb2', 'F3') },
  c7: { comp: montuno('Bb3+E4+G4'), bass: samba('C3', 'G2') },
  dm7: { comp: montuno('C4+F4+A4'), bass: samba('D3', 'A2') },
  gm7: { comp: montuno('Bb3+D4+F4'), bass: samba('G2', 'D3') }
};
const coastBars = (names, part) => names.map((name) => COAST_CHORDS[name][part]);

const SUNSET_COAST_CRUISE = {
  id: 'sunset_coast_cruise',
  name: 'Sunset Coast Cruise',
  engine: CHIP_SONG_ENGINE,
  bpm: 140,
  gain: 1.2,
  swing: 0.1,
  drumVolume: 0.9,
  echo: { steps: 3, feedback: 0.28, mix: 0.22 },
  voices: {
    lead: {
      wave: 'pulse25', volume: 0.085, decay: 0.22, sustain: 0.4, release: 0.12,
      filter: { freq: 2400, q: 1 }, vibrato: { rate: 5, depth: 10, delay: 0.25 }
    },
    lead2: { wave: 'sawtooth', volume: 0.035, filter: { freq: 1600, q: 0.8 }, pan: 0.25 },
    pad: {
      wave: 'square', volume: 0.022, attack: 0.004, decay: 0.15, sustain: 0.35, release: 0.08, gate: 0.85,
      filter: { freq: 1300, q: 0.7 }, echo: 0.15
    },
    bass: { volume: 0.1, gate: 0.9, filter: { freq: 520, q: 1.5, env: 700, envDecay: 0.14 } }
  },
  order: ['intro', 'a', 'a2', 'b', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*26 A4 - Bb4 - B4 -',
      pad: coastBars(['bbmaj7', 'c7'], 'comp'),
      bass: coastBars(['bbmaj7', 'c7'], 'bass'),
      drums: ['p p bp p p p p bp p p bp p p p bp p', LATIN_FILL]
    },
    a: {
      lead: [
        'C5 - F5 - A5 - . G5 - A5 - . C6 -*3',
        'C6 - . A5 - . G5 - E5 - . G5 - A5 - .',
        'D6 -*3 C6 - A5 - F5 -*3 A5 - C6 -',
        'Bb5 -*5 G5 - E5 - C5 -*5'
      ],
      pad: coastBars(['fmaj7', 'am7', 'bbmaj7', 'c7'], 'comp'),
      bass: coastBars(['fmaj7', 'am7', 'bbmaj7', 'c7'], 'bass'),
      drums: [LATIN_IN, LATIN, LATIN, LATIN_FILL]
    },
    a2: {
      lead: [
        'C5 - F5 - A5 - . G5 - A5 - . C6 -*3',
        'C6 - . A5 - . G5 - E5 - . G5 - A5 - .',
        'D6 -*3 C6 - A5 - F5 -*3 A5 - C6 -',
        'Bb5 - A5 - G5 - E5 - G5 -*7'
      ],
      lead2: '@lead-12',
      pad: coastBars(['fmaj7', 'am7', 'bbmaj7', 'c7'], 'comp'),
      bass: coastBars(['fmaj7', 'am7', 'bbmaj7', 'c7'], 'bass'),
      drums: [LATIN_IN, LATIN, LATIN, LATIN_FILL]
    },
    b: {
      lead: [
        'A5 -*3 F5 - A5 - C6 -*3 D6 - C6 -',
        'Bb5 -*3 G5 - Bb5 - D6 -*7',
        'C6 - Bb5 - G5 - E5 - . - G5 - Bb5 - C6 -',
        'A5 -*11 .*4'
      ],
      pad: coastBars(['dm7', 'gm7', 'c7', 'fmaj7'], 'comp'),
      bass: coastBars(['dm7', 'gm7', 'c7', 'fmaj7'], 'bass'),
      drums: [LATIN_IN, LATIN, LATIN, LATIN_FILL]
    },
    c: {
      lead: [
        'F5 - A5 - D6 -*5 C6 - A5 - F5 -',
        'E5 - G5 - C6 -*5 A5 - G5 - E5 -',
        'D5 - F5 - Bb5 -*5 A5 - G5 - F5 -',
        'E5 -*3 G5 -*3 Bb5 -*3 C6 -*3'
      ],
      lead2: [
        'D5 - F5 - Bb5 -*5 A5 - F5 - D5 -',
        'C5 - E5 - A5 -*5 E5 - E5 - C5 -',
        'Bb4 - D5 - G5 -*5 F5 - D5 - D5 -',
        'C5 -*3 E5 -*3 G5 -*7'
      ],
      pad: coastBars(['bbmaj7', 'am7', 'gm7', 'c7'], 'comp'),
      bass: coastBars(['bbmaj7', 'am7', 'gm7', 'c7'], 'bass'),
      drums: [LATIN_IN, LATIN, LATIN, LATIN_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Neon Speedway: corrida futurista de 16 bits (referência: F-Zero, Mute City,
// SNES, 1990). Rock-fusion em sol mixolídio, metais sintéticos e baixo pulsando.

const SPEED = 'kh h h h sh h h h kh h kh h sh h o h';
const SPEED_IN = 'kc h h h sh h h h kh h kh h sh h o h';
const SPEED_FILL = 'kh h h h sh h h h s s t t s s t t';
const pump = (root, octave) => `${root} - ${root} - ${octave} - ${root} - ${root} - ${root} - ${octave} - ${root} -`;
const SPEEDWAY_CHORDS = {
  g: { chord: 'G3+B3+D4 -*15', bass: pump('G2', 'G3') },
  f: { chord: 'F3+A3+C4 -*15', bass: pump('F2', 'F3') },
  c: { chord: 'G3+C4+E4 -*15', bass: pump('C3', 'C4') },
  d: { chord: 'F#3+A3+D4 -*15', bass: pump('D2', 'D3') },
  em: { chord: 'G3+B3+E4 -*15', bass: pump('E2', 'E3') },
  am: { chord: 'A3+C4+E4 -*15', bass: pump('A2', 'A3') },
  bm: { chord: 'F#3+B3+D4 -*15', bass: pump('B2', 'B3') }
};
const speedwayBars = (names, part) => names.map((name) => SPEEDWAY_CHORDS[name][part]);

const NEON_SPEEDWAY = {
  id: 'neon_speedway',
  name: 'Neon Speedway',
  engine: CHIP_SONG_ENGINE,
  bpm: 150,
  gain: 1.7,
  drumVolume: 0.6,
  echo: { steps: 3, feedback: 0.28, mix: 0.24 },
  voices: {
    lead: {
      wave: 'sawtooth', volume: 0.07, unison: 8, filter: { freq: 3000, q: 1.4 },
      vibrato: { rate: 5.8, depth: 16, delay: 0.18 }
    },
    lead2: { wave: 'square', volume: 0.04, filter: { freq: 2400, q: 0.8 } },
    pad: { volume: 0.016 },
    bass: { volume: 0.105, filter: { freq: 420, q: 6, env: 2000, envDecay: 0.08 } }
  },
  order: ['intro', 'a', 'a2', 'b', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*24 G4 - A4 - B4 - C5 -',
      arp: speedwayBars(['g', 'f'], 'chord'),
      bass: speedwayBars(['g', 'f'], 'bass'),
      drums: ['k . h . k . h . k . h . k . h .', SPEED_FILL]
    },
    a: {
      lead: [
        'D5 - G5 - B5 -*3 A5 - G5 - D5 -*3',
        'C5 - F5 - A5 -*3 G5 - F5 - C5 -*3',
        'E5 -*3 G5 - C6 -*5 B5 - G5 -',
        'A5 -*7 F#5 - A5 - D6 -*3'
      ],
      arp: speedwayBars(['g', 'f', 'c', 'd'], 'chord'),
      bass: speedwayBars(['g', 'f', 'c', 'd'], 'bass'),
      drums: [SPEED_IN, SPEED, SPEED, SPEED_FILL]
    },
    a2: {
      lead: [
        'D5 - G5 - B5 -*3 A5 - G5 - D5 -*3',
        'C5 - F5 - A5 -*3 G5 - F5 - C5 -*3',
        'E5 -*3 G5 - C6 -*5 B5 - G5 -',
        'A5 -*3 G5 - F#5 - E5 - F#5 -*5'
      ],
      lead2: '@lead-12',
      pad: speedwayBars(['g', 'f', 'c', 'd'], 'chord'),
      arp: speedwayBars(['g', 'f', 'c', 'd'], 'chord'),
      bass: speedwayBars(['g', 'f', 'c', 'd'], 'bass'),
      drums: [SPEED_IN, SPEED, SPEED, SPEED_FILL]
    },
    b: {
      lead: [
        'B5 -*5 G5 - E5 - B4 -*5',
        'C6 -*5 G5 - E5 - C5 -*5',
        'A5 -*3 C6 -*3 B5 - A5 - G5 - E5 -',
        'F#5 -*5 A5 - D6 -*7'
      ],
      arp: speedwayBars(['em', 'c', 'am', 'd'], 'chord'),
      bass: speedwayBars(['em', 'c', 'am', 'd'], 'bass'),
      drums: [SPEED_IN, SPEED, SPEED, SPEED_FILL]
    },
    c: {
      lead: [
        'G5 -*3 E5 - G5 - C6 -*7',
        'A5 -*3 F#5 - A5 - D6 -*7',
        'D6 -*3 B5 - A5 - F#5 -*7',
        'G5 -*3 F#5 - E5 - B4 -*7',
        'E5 - G5 - C6 - E6 -*5 D6 - C6 -',
        'D6 -*5 C6 - A5 - F#5 -*5',
        'G5 -*15',
        '.*8 D5 - E5 - F#5 - A5 -'
      ],
      lead2: [
        'E5 -*3 C5 - E5 - G5 -*7',
        'F#5 -*3 D5 - F#5 - A5 -*7',
        'B5 -*3 F#5 - F#5 - D5 -*7',
        'E5 -*3 D5 - B4 - G4 -*7',
        'C5 - E5 - G5 - C6 -*5 B5 - G5 -',
        'A5 -*5 A5 - F#5 - D5 -*5',
        'B4 -*15',
        '.*16'
      ],
      pad: speedwayBars(['c', 'd', 'bm', 'em', 'c', 'd', 'g', 'g'], 'chord'),
      arp: speedwayBars(['c', 'd', 'bm', 'em', 'c', 'd', 'g', 'g'], 'chord'),
      bass: speedwayBars(['c', 'd', 'bm', 'em', 'c', 'd', 'g', 'g'], 'bass'),
      drums: [SPEED_IN, SPEED, SPEED, SPEED_FILL, SPEED_IN, SPEED, SPEED, SPEED_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Downtown Brawl: briga de rua com batida de clube (referência: Streets of
// Rage 2, Go Straight, Mega Drive, 1992). House em lá menor: bumbo em todos os
// tempos, chimbal aberto no contratempo, palmas, baixo FM e acordes de piano.

const HOUSE = 'kh . o . kx . o . kh . o . kx . o h';
const HOUSE_IN = 'kc . o . kx . o . kh . o . kx . o h';
const HOUSE_FILL = 'kh . o . kx . o . kh . o . x x x x';
const stab = (chord) => `${chord} - . . . . ${chord} - . . . ${chord} - . . .`;
const clubBass = (root, octave) => (
  `${root} . ${octave} . . ${root} ${octave} . ${root} . ${octave} . . ${root} ${octave} .`
);
const BRAWL_CHORDS = {
  am7: { stab: stab('G3+C4+E4'), arp: 'A3+C4+E4+G4 -*15', bass: clubBass('A2', 'A3') },
  fadd9: { stab: stab('A3+C4+G4'), arp: 'A3+C4+G4 -*15', bass: clubBass('F2', 'F3') },
  g: { stab: stab('G3+B3+D4'), arp: 'G3+B3+D4 -*15', bass: clubBass('G2', 'G3') },
  dm7: { stab: stab('C4+F4+A4'), arp: 'D4+F4+A4+C5 -*15', bass: clubBass('D2', 'D3') },
  em7: { stab: stab('B3+D4+G4'), arp: 'E4+G4+B4+D5 -*15', bass: clubBass('E2', 'E3') },
  f: { stab: stab('A3+C4+F4'), arp: 'F3+A3+C4 -*15', bass: clubBass('F2', 'F3') },
  em: { stab: stab('G3+B3+E4'), arp: 'E3+G3+B3 -*15', bass: clubBass('E2', 'E3') },
  am: { stab: stab('A3+C4+E4'), arp: 'A3+C4+E4 -*15', bass: clubBass('A2', 'A3') }
};
const brawlBars = (names, part) => names.map((name) => BRAWL_CHORDS[name][part]);

const DOWNTOWN_BRAWL = {
  id: 'downtown_brawl',
  name: 'Downtown Brawl',
  engine: CHIP_SONG_ENGINE,
  bpm: 128,
  gain: 2,
  drumVolume: 0.6,
  echo: { steps: 3, feedback: 0.3, mix: 0.22 },
  voices: {
    lead: {
      wave: 'sawtooth', volume: 0.065, unison: 10, release: 0.15, filter: { freq: 2400, q: 2 },
      vibrato: { rate: 5, depth: 12, delay: 0.3 }
    },
    lead2: { wave: 'square', volume: 0.035, filter: { freq: 1800, q: 0.7 } },
    arp: { wave: 'pulse25', volume: 0.026, rate: 1, echo: 0.4 },
    pad: {
      wave: 'square', volume: 0.028, attack: 0.003, decay: 0.12, sustain: 0.3, release: 0.06, gate: 0.8,
      filter: { freq: 2200, q: 0.7 }, echo: 0.2
    },
    bass: { volume: 0.11, gate: 0.6, filter: { freq: 320, q: 9, env: 1800, envDecay: 0.09 } }
  },
  order: ['intro', 'a', 'a2', 'b', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*28 C5 - D5 -',
      pad: brawlBars(['am7', 'am7'], 'stab'),
      bass: brawlBars(['am7', 'am7'], 'bass'),
      drums: ['k . . . k . . . k . . . k . o .', HOUSE_FILL]
    },
    a: {
      lead: [
        'E5 -*5 G5 - A5 -*7',
        '. - C6 - B5 - A5 - G5 -*3 E5 -*3',
        'F5 -*5 A5 - C6 -*7',
        'B5 -*3 A5 - G5 - D5 -*7'
      ],
      pad: brawlBars(['am7', 'am7', 'fadd9', 'g'], 'stab'),
      bass: brawlBars(['am7', 'am7', 'fadd9', 'g'], 'bass'),
      drums: [HOUSE_IN, HOUSE, HOUSE, HOUSE_FILL]
    },
    a2: {
      lead: [
        'E5 -*5 G5 - A5 -*7',
        '. - C6 - B5 - A5 - G5 -*3 E5 -*3',
        'F5 -*5 A5 - C6 -*7',
        'B5 -*3 C6 - D6 -*9'
      ],
      lead2: '@lead-12',
      arp: brawlBars(['am7', 'am7', 'fadd9', 'g'], 'arp'),
      pad: brawlBars(['am7', 'am7', 'fadd9', 'g'], 'stab'),
      bass: brawlBars(['am7', 'am7', 'fadd9', 'g'], 'bass'),
      drums: [HOUSE_IN, HOUSE, HOUSE, HOUSE_FILL]
    },
    b: {
      lead: [
        'A5 -*3 F5 - A5 - C6 -*7',
        'B5 -*3 G5 - B5 - D6 -*7',
        'C6 -*3 A5 - C6 - E6 -*7',
        'D6 -*5 B5 - G5 - D5 -*5'
      ],
      arp: brawlBars(['dm7', 'em7', 'fadd9', 'g'], 'arp'),
      pad: brawlBars(['dm7', 'em7', 'fadd9', 'g'], 'stab'),
      bass: brawlBars(['dm7', 'em7', 'fadd9', 'g'], 'bass'),
      drums: [HOUSE_IN, HOUSE, HOUSE, HOUSE_FILL]
    },
    c: {
      lead: [
        'A5 -*5 G5 - F5 - C5 -*5',
        'B5 -*5 A5 - G5 - D5 -*5',
        'G5 -*3 B5 -*3 E6 -*7',
        'C6 -*3 B5 - A5 - E5 -*7',
        'A5 - C6 - A5 - F5 -*5 G5 - A5 -',
        'B5 - D6 - B5 - G5 -*5 A5 - B5 -',
        'C6 -*15',
        '.*8 C6 - B5 - A5 - G5 -'
      ],
      lead2: [
        'F5 -*5 E5 - C5 - A4 -*5',
        'G5 -*5 F5 - D5 - B4 -*5',
        'E5 -*3 G5 -*3 B5 -*7',
        'A5 -*3 G5 - E5 - C5 -*7',
        'F5 - A5 - F5 - C5 -*5 E5 - F5 -',
        'G5 - B5 - G5 - D5 -*5 F5 - G5 -',
        'E5 -*15',
        '.*16'
      ],
      arp: brawlBars(['f', 'g', 'em', 'am', 'f', 'g', 'am', 'am'], 'arp'),
      pad: brawlBars(['f', 'g', 'em', 'am', 'f', 'g', 'am', 'am'], 'stab'),
      bass: brawlBars(['f', 'g', 'em', 'am', 'f', 'g', 'am', 'am'], 'bass'),
      drums: [HOUSE_IN, HOUSE, HOUSE, HOUSE, HOUSE_IN, HOUSE, HOUSE, HOUSE_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Midnight Castle Run: castelo gótico de 8 bits (referência: Castlevania,
// Vampire Killer, NES, 1986). Ré menor harmônico, cadência andaluza (i-VII-VI-V),
// baixo triangular em oitavas e dois canais de pulso.

const CASTLE = 'kh . h . sh . h kh . kh h . sh . h .';
const CASTLE_IN = 'kc . h . sh . h kh . kh h . sh . h .';
const CASTLE_FILL = 'kh . h . sh . h . s . s . s s s s';
const CASTLE_CHORDS = {
  dm: { arp: 'D4+F4+A4 -*15', bass: octaves('D3', 'D4') },
  c: { arp: 'C4+E4+G4 -*15', bass: octaves('C3', 'C4') },
  bb: { arp: 'Bb3+D4+F4 -*15', bass: octaves('Bb2', 'Bb3') },
  a: { arp: 'A3+C#4+E4 -*15', bass: octaves('A2', 'A3') },
  gm: { arp: 'G3+Bb3+D4 -*15', bass: octaves('G2', 'G3') },
  f: { arp: 'A3+C4+F4 -*15', bass: octaves('F2', 'F3') }
};
const castleBars = (names, part) => names.map((name) => CASTLE_CHORDS[name][part]);

const MIDNIGHT_CASTLE_RUN = {
  id: 'midnight_castle_run',
  name: 'Midnight Castle Run',
  engine: CHIP_SONG_ENGINE,
  bpm: 150,
  gain: 0.8,
  echo: { steps: 3, feedback: 0.22, mix: 0.2 },
  voices: {
    lead: { wave: 'square', volume: 0.075, vibrato: { rate: 6, depth: 18, delay: 0.2 } },
    lead2: { wave: 'pulse25', volume: 0.045, pan: 0.3 },
    arp: { wave: 'pulse12', volume: 0.024, pan: -0.3 },
    bass: { wave: 'triangle', volume: 0.2, filter: null, gate: 0.7, decay: 0.05, sustain: 0.9 }
  },
  order: ['intro', 'a', 'a2', 'b', 'c'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*26 A4 - Bb4 - C#5 -',
      arp: castleBars(['dm', 'a'], 'arp'),
      bass: castleBars(['dm', 'a'], 'bass'),
      drums: ['k . h . sh . h . k . h . sh . h .', CASTLE_FILL]
    },
    a: {
      lead: [
        'D5 - E5 - F5 - A5 -*3 G5 - F5 - E5 -',
        'E5 -*5 C5 - E5 - G5 -*5',
        'F5 -*3 D5 - F5 - Bb5 -*3 A5 - G5 -',
        'A5 -*5 E5 - C#5 - A4 -*5'
      ],
      arp: castleBars(['dm', 'c', 'bb', 'a'], 'arp'),
      bass: castleBars(['dm', 'c', 'bb', 'a'], 'bass'),
      drums: [CASTLE_IN, CASTLE, CASTLE, CASTLE_FILL]
    },
    a2: {
      lead: [
        'D5 - E5 - F5 - A5 -*3 G5 - F5 - E5 -',
        'E5 -*5 C5 - E5 - G5 -*5',
        'F5 -*3 D5 - F5 - Bb5 -*3 A5 - G5 -',
        'C#5 - E5 - A5 - C#6 -*9'
      ],
      lead2: [
        'A4 - C5 - D5 - F5 -*3 E5 - D5 - C5 -',
        'C5 -*5 G4 - C5 - E5 -*5',
        'D5 -*3 Bb4 - D5 - F5 -*3 F5 - D5 -',
        'A4 - C#5 - E5 - A5 -*9'
      ],
      arp: castleBars(['dm', 'c', 'bb', 'a'], 'arp'),
      bass: castleBars(['dm', 'c', 'bb', 'a'], 'bass'),
      drums: [CASTLE_IN, CASTLE, CASTLE, CASTLE_FILL]
    },
    b: {
      lead: [
        'D6 -*3 A5 -*3 F5 -*3 A5 - D6 -',
        'D6 -*3 Bb5 -*3 G5 -*3 Bb5 - D6 -',
        'C6 -*3 Bb5 - A5 - F5 -*3 G5 - A5 -',
        'A5 -*7 C#6 - A5 - G5 - E5 -'
      ],
      lead2: '@lead-12',
      arp: castleBars(['dm', 'gm', 'bb', 'a'], 'arp'),
      bass: castleBars(['dm', 'gm', 'bb', 'a'], 'bass'),
      drums: [CASTLE_IN, CASTLE, CASTLE, CASTLE_FILL]
    },
    c: {
      lead: [
        'D6 -*5 C6 - Bb5 - F5 -*5',
        'C6 -*5 A5 - F5 - C5 -*5',
        'E5 -*3 G5 -*3 C6 -*3 Bb5 - G5 -',
        'A5 -*15',
        'F5 - Bb5 - D6 -*5 C6 - Bb5 - A5 -',
        'A5 -*3 C6 - A5 - F5 -*7',
        'Bb5 -*3 A5 - G5 - D5 -*7',
        'C#5 - E5 - A5 - C#6 - E6 -*7'
      ],
      lead2: '@lead-12',
      arp: castleBars(['bb', 'f', 'c', 'dm', 'bb', 'f', 'gm', 'a'], 'arp'),
      bass: castleBars(['bb', 'f', 'c', 'dm', 'bb', 'f', 'gm', 'a'], 'bass'),
      drums: [CASTLE_IN, CASTLE, CASTLE, CASTLE_FILL, CASTLE_IN, CASTLE, CASTLE, CASTLE_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Island Map Stroll: mapa de mundo com balanço (referência: Super Mario World,
// tema do mundo, SNES, 1990). Shuffle em sol maior, baixo e acordes alternando
// (tum-pá), bongôs e um acorde emprestado (dó menor) na ponte.

const STROLL = 'kp . p . rp . pg . kp . p l rp . pg l';
const STROLL_FILL = 'kp . p . rp . pg . g g l l g . l .';
const stroll = (root, fifth) => `${root} - . . ${fifth} - . . ${root} - . . ${fifth} - . .`;
const offbeat = (chord) => `. . ${chord} - . . ${chord} - . . ${chord} - . . ${chord} -`;
const ISLAND_CHORDS = {
  g: { comp: offbeat('G3+B3+D4'), bass: stroll('G2', 'D3') },
  em: { comp: offbeat('G3+B3+E4'), bass: stroll('E2', 'B2') },
  c: { comp: offbeat('G3+C4+E4'), bass: stroll('C3', 'G2') },
  d7: { comp: offbeat('F#3+A3+C4'), bass: stroll('D3', 'A2') },
  cm: { comp: offbeat('G3+C4+Eb4'), bass: stroll('C3', 'G2') },
  e7: { comp: offbeat('G#3+B3+D4'), bass: stroll('E2', 'B2') },
  am: { comp: offbeat('A3+C4+E4'), bass: stroll('A2', 'E3') },
  // Meio compasso de acorde, para a subida cromática da melodia soar só sobre o baixo.
  d7Pickup: { comp: '. . F#3+A3+C4 - . . F#3+A3+C4 - .*8', bass: 'D3 - . . A2 - . . D3 - . . . . . .' },
  gPickup: { comp: '. . G3+B3+D4 - . . G3+B3+D4 - .*8', bass: 'G2 - . . D3 - . . G2 - . . . . . .' },
  am7d7: {
    comp: '. . A3+C4+E4 - . . A3+C4+E4 - . . F#3+A3+C4 - . . F#3+A3+C4 -',
    bass: 'A2 - . . E3 - . . D3 - . . A2 - . .'
  }
};
const islandBars = (names, part) => names.map((name) => ISLAND_CHORDS[name][part]);

const ISLAND_MAP_STROLL = {
  id: 'island_map_stroll',
  name: 'Island Map Stroll',
  engine: CHIP_SONG_ENGINE,
  bpm: 116,
  swing: 0.33,
  swingUnit: 8,
  gain: 1.2,
  drumVolume: 0.8,
  echo: { steps: 2, feedback: 0.2, mix: 0.16 },
  voices: {
    lead: {
      wave: 'square', volume: 0.075, decay: 0.2, sustain: 0.5, release: 0.1, filter: { freq: 2800, q: 0.8 },
      vibrato: { rate: 5.5, depth: 12, delay: 0.25 }, echo: 0.2
    },
    lead2: { wave: 'sine', volume: 0.04, decay: 0.2, sustain: 0.25, release: 0.12, vibrato: null, pan: 0.3 },
    pad: {
      wave: 'triangle', volume: 0.04, attack: 0.004, decay: 0.12, sustain: 0.4, release: 0.06, gate: 0.8,
      filter: null, echo: 0.1, pan: -0.15
    },
    bass: { volume: 0.11, gate: 0.75, decay: 0.12, sustain: 0.4, filter: { freq: 420, q: 3, env: 1400, envDecay: 0.1 } }
  },
  order: ['intro', 'a', 'a2', 'b'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*26 B4 - C5 - C#5 -',
      pad: islandBars(['c', 'd7Pickup'], 'comp'),
      bass: islandBars(['c', 'd7Pickup'], 'bass'),
      drums: [STROLL, STROLL_FILL]
    },
    a: {
      lead: [
        'D5 - G5 - B5 - D6 - . - B5 - G5 -*3',
        'E5 - G5 - B5 - E6 -*3 D6 - B5 - G5 -',
        'C6 -*3 B5 - A5 - G5 - E5 - C5 - E5 -',
        'D5 -*5 F#5 - A5 - C6 -*5'
      ],
      pad: islandBars(['g', 'em', 'c', 'd7'], 'comp'),
      bass: islandBars(['g', 'em', 'c', 'd7'], 'bass'),
      drums: [STROLL, STROLL, STROLL, STROLL_FILL]
    },
    a2: {
      lead: [
        'D5 - G5 - B5 - D6 - . - B5 - G5 -*3',
        'E5 - G5 - B5 - E6 -*3 D6 - B5 - G5 -',
        'C6 - A5 - E5 - A5 - C6 - A5 - F#5 - D5 -',
        'G5 -*7 . - D5 - E5 - F#5 -'
      ],
      lead2: '@lead+12',
      pad: islandBars(['g', 'em', 'am7d7', 'g'], 'comp'),
      bass: islandBars(['g', 'em', 'am7d7', 'g'], 'bass'),
      drums: [STROLL, STROLL, STROLL, STROLL_FILL]
    },
    b: {
      lead: [
        'G5 -*3 E5 - C6 -*5 B5 - A5 -',
        'G5 -*3 Eb5 - C6 -*5 Bb5 - G5 -',
        'B5 -*3 D6 - B5 - G5 -*5 D5 -',
        'G#5 -*3 B5 - D6 - E6 -*5 . -',
        'C6 -*3 A5 - E5 - A5 -*5 C6 -',
        'D6 -*3 C6 - A5 - F#5 -*5 A5 -',
        'G5 -*15',
        '.*8 B4 - C5 - C#5 - . -'
      ],
      pad: islandBars(['c', 'cm', 'g', 'e7', 'am', 'd7', 'g', 'gPickup'], 'comp'),
      bass: islandBars(['c', 'cm', 'g', 'e7', 'am', 'd7', 'g', 'gPickup'], 'bass'),
      drums: [STROLL, STROLL, STROLL, STROLL_FILL, STROLL, STROLL, STROLL, STROLL_FILL]
    }
  }
};

// ---------------------------------------------------------------------------
// Cloud Meadow Hop: campo alegre do Game Boy (referência: Kirby's Dream Land,
// Green Greens, 1992). Lá maior a 160 BPM, ritmo pontuado saltitante, baixo
// pulando entre tônica, quinta e oitava, arpejos e ruído como bateria.

const HOP = 'kh . h h sh . h . kh . h h sh . h h';
const HOP_IN = 'kc . h h sh . h . kh . h h sh . h h';
const HOP_FILL = 'kh . h h sh . h . s . s s s s s s';
const hop = (root, fifth, octave) => (
  `${root} - ${fifth} - ${octave} - ${fifth} - ${root} - ${fifth} - ${octave} - ${fifth} -`
);
const MEADOW_CHORDS = {
  a: { arp: 'A3+C#4+E4 -*15', bass: hop('A2', 'E3', 'A3') },
  d: { arp: 'A3+D4+F#4 -*15', bass: hop('D2', 'A2', 'D3') },
  e: { arp: 'G#3+B3+E4 -*15', bass: hop('E2', 'B2', 'E3') },
  e7: { arp: 'G#3+B3+D4 -*15', bass: hop('E2', 'B2', 'D3') },
  bm: { arp: 'B3+D4+F#4 -*15', bass: hop('B2', 'F#3', 'B3') },
  csm: { arp: 'G#3+C#4+E4 -*15', bass: hop('C#3', 'G#3', 'C#4') },
  fsm: { arp: 'A3+C#4+F#4 -*15', bass: hop('F#2', 'C#3', 'F#3') },
  bm7e7: { arp: 'B3+D4+F#4+A4 -*7 G#3+B3+D4+E4 -*7', bass: 'B2 - F#3 - B3 - F#3 - E2 - B2 - E3 - B2 -' }
};
const meadowBars = (names, part) => names.map((name) => MEADOW_CHORDS[name][part]);

const CLOUD_MEADOW_HOP = {
  id: 'cloud_meadow_hop',
  name: 'Cloud Meadow Hop',
  engine: CHIP_SONG_ENGINE,
  bpm: 160,
  gain: 0.75,
  drumVolume: 0.8,
  echo: { steps: 3, feedback: 0.2, mix: 0.18 },
  voices: {
    lead: { wave: 'pulse25', volume: 0.08, vibrato: { rate: 6, depth: 12, delay: 0.2 }, echo: 0.22 },
    lead2: { wave: 'pulse12', volume: 0.045, pan: 0.3 },
    arp: { wave: 'square', volume: 0.022, pan: -0.3, echo: 0.2 },
    bass: { wave: 'triangle', volume: 0.19, filter: null, gate: 0.75, decay: 0.05, sustain: 0.9 }
  },
  order: ['intro', 'a', 'a2', 'b'],
  loopFrom: 1,
  patterns: {
    intro: {
      lead: '.*24 B4 - C#5 - D5 - D#5 -',
      arp: meadowBars(['d', 'e'], 'arp'),
      bass: meadowBars(['d', 'e'], 'bass'),
      drums: ['kh . h h . . h . kh . h h . . h h', HOP_FILL]
    },
    a: {
      lead: [
        'E5 - - A5 C#6 -*3 B5 - A5 - E5 -*3',
        'F#5 - - A5 D6 -*3 C#6 - B5 - A5 -*3',
        'G#5 - - B5 E6 -*3 D6 - B5 - G#5 -*3',
        'A5 -*3 E5 - C#5 - E5 - A5 -*5'
      ],
      arp: meadowBars(['a', 'd', 'e', 'a'], 'arp'),
      bass: meadowBars(['a', 'd', 'e', 'a'], 'bass'),
      drums: [HOP_IN, HOP, HOP, HOP_FILL]
    },
    a2: {
      lead: [
        'E5 - - A5 C#6 -*3 B5 - A5 - E5 -*3',
        'F#5 - - A5 D6 -*3 C#6 - B5 - A5 -*3',
        'D6 - B5 - F#5 - B5 - D6 - B5 - G#5 - E5 -',
        'A5 -*7 . - E5 - F#5 - G#5 -'
      ],
      lead2: '@lead-12',
      arp: meadowBars(['a', 'd', 'bm7e7', 'a'], 'arp'),
      bass: meadowBars(['a', 'd', 'bm7e7', 'a'], 'bass'),
      drums: [HOP_IN, HOP, HOP, HOP_FILL]
    },
    b: {
      lead: [
        'A5 -*3 F#5 - A5 - D6 -*5 C#6 -',
        'B5 -*3 G#5 - B5 - E6 -*5 D6 -',
        'C#6 -*3 G#5 - E5 - G#5 -*5 C#6 -',
        'A5 -*3 F#5 - C#5 - F#5 -*5 A5 -',
        'B5 - D6 - B5 - F#5 - D5 - F#5 - B5 - D6 -',
        'E6 -*3 D6 - B5 - G#5 -*5 B5 -',
        'A5 -*11 .*4',
        'E5 - G#5 - B5 - D6 - . - B5 - G#5 - B5 -'
      ],
      lead2: [
        'F#5 -*3 D5 - F#5 - A5 -*5 A5 -',
        'G#5 -*3 E5 - G#5 - B5 -*5 B5 -',
        'G#5 -*3 E5 - C#5 - E5 -*5 G#5 -',
        'F#5 -*3 C#5 - A4 - C#5 -*5 F#5 -',
        '.*16',
        '.*16',
        '.*16',
        '.*16'
      ],
      arp: meadowBars(['d', 'e', 'csm', 'fsm', 'bm', 'e', 'a', 'e7'], 'arp'),
      bass: meadowBars(['d', 'e', 'csm', 'fsm', 'bm', 'e', 'a', 'e7'], 'bass'),
      drums: [HOP_IN, HOP, HOP, HOP_FILL, HOP_IN, HOP, HOP, HOP_FILL]
    }
  }
};

export const CHIP_MENU_SONGS = [SUNNY_LOOP_VALLEY, SUNSET_COAST_CRUISE, ISLAND_MAP_STROLL, CLOUD_MEADOW_HOP];
export const CHIP_BATTLE_SONGS = [
  NITRO_HIGHWAY, ROUND_ONE_RUMBLE, STEEL_FORTRESS_CLIMB, NEON_SPEEDWAY, DOWNTOWN_BRAWL, MIDNIGHT_CASTLE_RUN
];
