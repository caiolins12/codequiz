// Motor das trilhas no estilo dos consoles de 8 e 16 bits (NES, SNES, Mega Drive).
//
// Cada música é escrita como texto, em semicolcheias (16 passos por compasso de 4/4):
//   'E5' toca a nota, '-' segura a anterior, '.' é pausa e 'C4+E4+G4' é acorde
//   (arpejo ou pad). 'X*3' repete um token e '(A B)*2' repete um grupo.
//   Uma linha '@lead-12' copia a linha lead do mesmo padrão, transposta em semitons.
// Bateria: cada letra é uma peça, e várias juntas tocam no mesmo passo ('kh'):
//   k bumbo, s caixa, h chimbal, o chimbal aberto, c prato, t tom, x palmas,
//   r aro, b cowbell, p chocalho, g bongô agudo, l bongô grave.
// Balanço: `swing` atrasa o contratempo (0,33 dá a sensação de tercina); com
// `swingUnit: 8` o atraso vai nas colcheias (shuffle), senão nas semicolcheias.
// A música é compilada uma vez em eventos e tocada com agendamento à frente no
// AudioContext, então o ritmo não depende da precisão do setInterval.

export const CHIP_SONG_ENGINE = 'chip_song';
export const CHIP_SONG_TICK_MS = 25;

const CHANNELS = ['bass', 'pad', 'arp', 'lead2', 'lead'];
const DRUM_PIECES = 'kshoctxrbpgl';
const STEPS_PER_BAR = 16;
const MIN_LOOKAHEAD_SEC = 0.12;
const MAX_LOOKAHEAD_SEC = 1.5;

const NOTE_OFFSETS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PULSE_DUTIES = { pulse12: 0.125, pulse25: 0.25 };
const NATIVE_WAVES = ['sine', 'square', 'sawtooth', 'triangle'];

// Timbres padrão de cada canal; cada música sobrescreve o que quiser em `voices`.
const DEFAULT_VOICES = {
  lead: {
    wave: 'square', volume: 0.085, attack: 0.006, decay: 0.14, sustain: 0.7, release: 0.07, gate: 0.94,
    vibrato: { rate: 5.6, depth: 16, delay: 0.16 }, echo: 0.32, pan: 0
  },
  lead2: {
    wave: 'pulse25', volume: 0.05, attack: 0.006, decay: 0.12, sustain: 0.65, release: 0.07, gate: 0.92,
    vibrato: { rate: 5.2, depth: 12, delay: 0.2 }, echo: 0.25, pan: 0.28
  },
  arp: {
    wave: 'pulse12', volume: 0.03, attack: 0.003, decay: 0.05, sustain: 0.85, release: 0.04, gate: 1,
    rate: 2, echo: 0.3, pan: -0.32
  },
  pad: {
    wave: 'sawtooth', volume: 0.018, attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.18, gate: 0.96,
    filter: { freq: 1500, q: 0.6 }, echo: 0.2, pan: 0.16
  },
  bass: {
    wave: 'sawtooth', volume: 0.1, attack: 0.003, decay: 0.09, sustain: 0.55, release: 0.04, gate: 0.82,
    filter: { freq: 480, q: 4, env: 1400, envDecay: 0.08 }, echo: 0, pan: 0
  }
};

function clamp(value, min, max) {
  const safe = Number(value);
  if (!Number.isFinite(safe)) return min;
  return Math.max(min, Math.min(max, safe));
}

function noteToMidi(name) {
  const match = /^([A-G])(#|b)?(\d)$/.exec(String(name || '').trim());
  if (!match) return null;
  const accidental = match[2] === '#' ? 1 : (match[2] === 'b' ? -1 : 0);
  return (Number(match[3]) + 1) * 12 + NOTE_OFFSETS[match[1]] + accidental;
}

export function noteToFrequency(name) {
  const midi = noteToMidi(name);
  return midi === null ? null : 440 * (2 ** ((midi - 69) / 12));
}

function transposeToken(token, semitones, label) {
  if (!semitones || token === '.' || token === '-') return token;
  return token.split('+').map((note) => {
    const midi = noteToMidi(note);
    if (midi === null) throw new Error(`${label}: nota inválida "${note}"`);
    const next = midi + semitones;
    return `${SHARP_NAMES[next % 12]}${Math.floor(next / 12) - 1}`;
  }).join('+');
}

export function expandChipLine(line) {
  let text = Array.isArray(line) ? line.join(' ') : String(line ?? '');
  const group = /\(([^()]*)\)\*(\d+)/;
  while (group.test(text)) {
    text = text.replace(group, (_, body, count) => Array(Number(count)).fill(body).join(' '));
  }
  return text.split(/\s+/).filter(Boolean).flatMap((token) => {
    const repeat = /^(.+)\*(\d+)$/.exec(token);
    return repeat ? Array(Number(repeat[2])).fill(repeat[1]) : [token];
  });
}

function rawLineText(pattern, channel) {
  const raw = pattern?.[channel];
  return Array.isArray(raw) ? raw.join(' ') : String(raw ?? '').trim();
}

function resolvePatternLine(pattern, channel, label) {
  const text = rawLineText(pattern, channel);
  const ref = /^@(\w+)([+-]\d+)?$/.exec(text);
  if (!ref) return expandChipLine(text);
  const source = ref[1];
  if (source === channel || !CHANNELS.includes(source) || rawLineText(pattern, source).startsWith('@')) {
    throw new Error(`${label}: a linha ${channel} copia uma linha inválida (${text})`);
  }
  const semitones = Number(ref[2] || 0);
  return expandChipLine(rawLineText(pattern, source)).map((token) => transposeToken(token, semitones, label));
}

const compiledSongs = new WeakMap();

// Junta os padrões na ordem da música e transforma as linhas em eventos por passo.
// `loopStep` é o passo onde a música recomeça depois do fim (a introdução toca uma vez).
export function compileChipSong(song) {
  if (song && compiledSongs.has(song)) return compiledSongs.get(song);
  const songLabel = `Música ${song?.id || '?'}`;
  const order = Array.isArray(song?.order) ? song.order : [];
  if (!order.length) throw new Error(`${songLabel}: sem padrões na ordem`);
  const loopFrom = Math.trunc(clamp(song.loopFrom ?? 0, 0, order.length - 1));
  const lineNames = [...CHANNELS, 'drums'];
  const flat = Object.fromEntries(lineNames.map((name) => [name, []]));
  let length = 0;
  let loopStep = 0;

  order.forEach((patternName, orderIndex) => {
    const label = `${songLabel}, padrão "${patternName}"`;
    const pattern = song.patterns?.[patternName];
    if (!pattern) throw new Error(`${label}: não existe`);
    if (orderIndex === loopFrom) loopStep = length;
    const resolved = {};
    let size = 0;
    lineNames.forEach((name) => {
      resolved[name] = resolvePatternLine(pattern, name, label);
      size = Math.max(size, resolved[name].length);
    });
    if (!size || size % STEPS_PER_BAR) throw new Error(`${label}: ${size} passos não fecham compassos de ${STEPS_PER_BAR}`);
    lineNames.forEach((name) => {
      const tokens = resolved[name];
      if (tokens.length && size % tokens.length) {
        throw new Error(`${label}: a linha ${name} tem ${tokens.length} passos, que não dividem ${size}`);
      }
      for (let index = 0; index < size; index += 1) {
        flat[name].push(tokens.length ? tokens[index % tokens.length] : '.');
      }
    });
    length += size;
  });

  const steps = Array.from({ length }, () => ({ notes: [], drums: '' }));
  CHANNELS.forEach((channel) => {
    let current = null;
    flat[channel].forEach((token, index) => {
      if (token === '-') {
        if (current) current.steps += 1;
        return;
      }
      current = null;
      if (token === '.') return;
      const freqs = token.split('+').map(noteToFrequency);
      if (freqs.some((freq) => !freq)) throw new Error(`${songLabel}: nota inválida "${token}" no canal ${channel}`);
      current = { channel, freqs, steps: 1 };
      steps[index].notes.push(current);
    });
  });
  flat.drums.forEach((token, index) => {
    if (token === '.' || token === '-') return;
    if ([...token].some((piece) => !DRUM_PIECES.includes(piece))) {
      throw new Error(`${songLabel}: peça de bateria inválida "${token}"`);
    }
    steps[index].drums = token;
  });

  const compiled = { steps, length, loopStep };
  if (song) compiledSongs.set(song, compiled);
  return compiled;
}

// Duração em segundos de uma passada completa (introdução + corpo) e só do trecho que repete.
export function getChipSongDurations(song) {
  const compiled = compileChipSong(song);
  const stepSec = 60 / clamp(song.bpm, 40, 300) / 4;
  return {
    totalSec: compiled.length * stepSec,
    loopSec: (compiled.length - compiled.loopStep) * stepSec
  };
}

function getPlaybackTiming(song) {
  const stepSec = 60 / clamp(song.bpm, 40, 300) / 4;
  const swingUnit = song.swingUnit === 8 ? 8 : 16;
  return {
    compiled: compileChipSong(song),
    stepSec,
    swingUnit,
    swingSec: clamp(song.swing ?? 0, 0, 0.4) * stepSec * (swingUnit === 8 ? 2 : 1)
  };
}

function safePlaybackOffset(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
}

function playbackStep(timing, stepNumber) {
  const { compiled, stepSec, swingSec, swingUnit } = timing;
  const stepIndex = stepNumber < compiled.length
    ? stepNumber
    : compiled.loopStep + ((stepNumber - compiled.length) % (compiled.length - compiled.loopStep));
  let swingOffset = 0;
  if (swingUnit === 16) swingOffset = stepIndex % 2 ? swingSec : 0;
  else if (stepIndex % 4 === 2) swingOffset = swingSec;
  else if (stepIndex % 4 === 3) swingOffset = swingSec / 2;
  return { stepNumber, stepIndex, nextStepSec: stepNumber * stepSec + swingOffset };
}

function findPlaybackPosition(timing, offsetSec) {
  const seconds = safePlaybackOffset(offsetSec);
  // Evita pular uma nota exatamente no limite por arredondamento de ponto flutuante.
  const epsilon = timing.stepSec * 1e-7;
  const stepNumber = Math.floor((seconds + epsilon) / timing.stepSec);
  let position = playbackStep(timing, stepNumber);
  if (position.nextStepSec < seconds - epsilon) position = playbackStep(timing, stepNumber + 1);
  return position;
}

// Próximo ataque na linha do tempo da música, já considerando o swing. O número
// absoluto de passos continua crescendo; o índice só repete o corpo após a intro.
export function getChipSongPlaybackPosition(song, offsetSec = 0) {
  return findPlaybackPosition(getPlaybackTiming(song), offsetSec);
}

const audioCaches = new WeakMap();

function getAudioCache(ctx) {
  let cache = audioCaches.get(ctx);
  if (!cache) {
    cache = { waves: {}, noise: null };
    audioCaches.set(ctx, cache);
  }
  return cache;
}

// Onda de pulso estreita (12,5% e 25%), o timbre típico dos canais do NES.
function getPulseWave(ctx, wave) {
  const cache = getAudioCache(ctx);
  if (!cache.waves[wave]) {
    const harmonics = 40;
    const real = new Float32Array(harmonics + 1);
    const imag = new Float32Array(harmonics + 1);
    for (let n = 1; n <= harmonics; n += 1) {
      real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * PULSE_DUTIES[wave]);
    }
    cache.waves[wave] = ctx.createPeriodicWave(real, imag);
  }
  return cache.waves[wave];
}

function getNoiseBuffer(ctx) {
  const cache = getAudioCache(ctx);
  if (!cache.noise) {
    const length = Math.floor(ctx.sampleRate);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
    cache.noise = buffer;
  }
  return cache.noise;
}

function createOscillator(ctx, wave) {
  const osc = ctx.createOscillator();
  if (PULSE_DUTIES[wave]) osc.setPeriodicWave(getPulseWave(ctx, wave));
  else osc.type = NATIVE_WAVES.includes(wave) ? wave : 'square';
  return osc;
}

// Ataque linear, decaimento exponencial até o sustain e soltura; devolve o fim do som.
function shapeEnvelope(param, voice, peak, start, holdUntil) {
  const attackEnd = start + Math.max(0.002, Number(voice.attack) || 0);
  const decay = Math.max(0.01, Number(voice.decay) || 0);
  const sustain = Math.max(0.0001, peak * clamp(voice.sustain, 0, 1));
  param.setValueAtTime(0.0001, start);
  if (holdUntil <= attackEnd) {
    param.linearRampToValueAtTime(peak, holdUntil);
  } else {
    param.linearRampToValueAtTime(peak, attackEnd);
    const decayEnd = attackEnd + decay;
    if (decayEnd <= holdUntil) {
      param.exponentialRampToValueAtTime(sustain, decayEnd);
      param.setValueAtTime(sustain, holdUntil);
    } else {
      const level = peak * ((sustain / peak) ** ((holdUntil - attackEnd) / decay));
      param.exponentialRampToValueAtTime(Math.max(0.0001, level), holdUntil);
    }
  }
  const end = holdUntil + Math.max(0.02, Number(voice.release) || 0);
  param.exponentialRampToValueAtTime(0.0001, end);
  return end;
}

export function createChipSongPlayer({ ctx, output, song, offsetSec = 0 }) {
  const timing = getPlaybackTiming(song);
  const { compiled, stepSec } = timing;
  const sources = new Set();
  let stopped = false;

  const bus = ctx.createGain();
  bus.gain.value = clamp(song.gain ?? 1, 0, 2);
  bus.connect(output);

  // Eco com realimentação abafada, como o eco do chip de som do SNES.
  const echo = song.echo || {};
  const echoInput = ctx.createGain();
  const delay = ctx.createDelay(2);
  delay.delayTime.value = Math.min(1.9, stepSec * clamp(echo.steps ?? 3, 1, 16));
  const feedback = ctx.createGain();
  feedback.gain.value = clamp(echo.feedback ?? 0.28, 0, 0.7);
  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = 2400;
  const wet = ctx.createGain();
  wet.gain.value = clamp(echo.mix ?? 0.24, 0, 1);
  echoInput.connect(delay);
  delay.connect(damp);
  damp.connect(feedback);
  feedback.connect(delay);
  damp.connect(wet);
  wet.connect(bus);

  const strips = {};
  CHANNELS.forEach((channel) => {
    const voice = { ...DEFAULT_VOICES[channel], ...(song.voices?.[channel] || {}) };
    const input = ctx.createGain();
    let tail = input;
    if (voice.filter && !voice.filter.env) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = voice.filter.freq;
      filter.Q.value = voice.filter.q ?? 0.7;
      input.connect(filter);
      tail = filter;
    }
    if (voice.pan && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.value = clamp(voice.pan, -1, 1);
      tail.connect(panner);
      panner.connect(bus);
    } else {
      tail.connect(bus);
    }
    if (voice.echo > 0) {
      const send = ctx.createGain();
      send.gain.value = clamp(voice.echo, 0, 1);
      tail.connect(send);
      send.connect(echoInput);
    }
    strips[channel] = { voice, input };
  });

  const drumBus = ctx.createGain();
  drumBus.gain.value = clamp(song.drumVolume ?? 1, 0, 2);
  drumBus.connect(bus);

  function track(node, startAt, stopAt, offset) {
    if (offset) node.start(startAt, offset);
    else node.start(startAt);
    node.stop(stopAt);
    sources.add(node);
    node.onended = () => sources.delete(node);
  }

  function playNote(event, time) {
    const { voice, input } = strips[event.channel];
    const holdUntil = time + Math.max(0.03, event.steps * stepSec * clamp(voice.gate, 0.1, 1));
    const env = ctx.createGain();
    if (voice.filter?.env) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = voice.filter.q ?? 1;
      filter.frequency.setValueAtTime(voice.filter.freq + voice.filter.env, time);
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, voice.filter.freq), time + (voice.filter.envDecay ?? 0.1));
      env.connect(filter);
      filter.connect(input);
    } else {
      env.connect(input);
    }
    const peak = voice.volume * (voice.unison ? 0.62 : 1);
    const stopAt = shapeEnvelope(env.gain, voice, peak, time, holdUntil) + 0.02;

    if (event.channel === 'arp') {
      // Arpejo rápido num oscilador só, trocando a nota a cada fração de passo.
      const osc = createOscillator(ctx, voice.wave);
      const rate = Math.max(1, Math.round(voice.rate || 2));
      const ticks = event.steps * rate;
      for (let index = 0; index < ticks; index += 1) {
        osc.frequency.setValueAtTime(event.freqs[index % event.freqs.length], time + (index * stepSec) / rate);
      }
      osc.connect(env);
      track(osc, time, stopAt);
      return;
    }

    const oscillators = [];
    event.freqs.forEach((freq) => {
      const osc = createOscillator(ctx, voice.wave);
      osc.frequency.setValueAtTime(freq, time);
      oscillators.push(osc);
      if (voice.unison) {
        const twin = createOscillator(ctx, voice.wave);
        twin.frequency.setValueAtTime(freq, time);
        twin.detune.setValueAtTime(voice.unison, time);
        oscillators.push(twin);
      }
    });
    oscillators.forEach((osc) => {
      osc.connect(env);
      track(osc, time, stopAt);
    });

    // Vibrato que entra devagar nas notas longas.
    const vibrato = voice.vibrato;
    if (vibrato && holdUntil - time > vibrato.delay + 0.05) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = vibrato.rate;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, time);
      depth.gain.setValueAtTime(0, time + vibrato.delay);
      depth.gain.linearRampToValueAtTime(vibrato.depth, time + vibrato.delay + 0.12);
      lfo.connect(depth);
      oscillators.forEach((osc) => depth.connect(osc.detune));
      track(lfo, time, stopAt);
    }
  }

  function noiseHit({ time, volume, decay, type = 'highpass', freq = 6000, q = 0.7 }) {
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(drumBus);
    track(source, time, time + decay + 0.02, Math.random() * 0.5);
  }

  function toneHit({ time, volume, decay, from, to = from, wave = 'sine' }) {
    const osc = createOscillator(ctx, wave);
    osc.frequency.setValueAtTime(from, time);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, time + decay * 0.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(gain);
    gain.connect(drumBus);
    track(osc, time, time + decay + 0.02);
  }

  const drums = {
    k: (time) => {
      toneHit({ time, volume: 0.34, decay: 0.2, from: 150, to: 46 });
      noiseHit({ time, volume: 0.03, decay: 0.012, type: 'lowpass', freq: 3000 });
    },
    s: (time) => {
      noiseHit({ time, volume: 0.15, decay: 0.15, freq: 1400 });
      toneHit({ time, volume: 0.09, decay: 0.08, from: 220, to: 170, wave: 'triangle' });
    },
    h: (time, offbeat) => noiseHit({ time, volume: offbeat ? 0.026 : 0.042, decay: 0.035, freq: 7800 }),
    o: (time) => noiseHit({ time, volume: 0.04, decay: 0.2, freq: 7200 }),
    c: (time) => noiseHit({ time, volume: 0.06, decay: 1, freq: 4800 }),
    t: (time) => toneHit({ time, volume: 0.2, decay: 0.2, from: 200, to: 110 }),
    x: (time) => {
      [0, 0.011, 0.022].forEach((offset, index) => noiseHit({
        time: time + offset,
        volume: index === 2 ? 0.11 : 0.07,
        decay: index === 2 ? 0.13 : 0.012,
        type: 'bandpass',
        freq: 1500,
        q: 1.1
      }));
    },
    r: (time) => {
      toneHit({ time, volume: 0.05, decay: 0.035, from: 1750, to: 1600, wave: 'triangle' });
      noiseHit({ time, volume: 0.05, decay: 0.03, type: 'bandpass', freq: 2600, q: 2 });
    },
    b: (time) => {
      [562, 845].forEach((freq) => toneHit({ time, volume: 0.022, decay: 0.16, from: freq, wave: 'square' }));
    },
    p: (time, offbeat) => noiseHit({ time, volume: offbeat ? 0.014 : 0.022, decay: 0.04, freq: 6200 }),
    g: (time) => toneHit({ time, volume: 0.12, decay: 0.09, from: 480, to: 400 }),
    l: (time) => toneHit({ time, volume: 0.13, decay: 0.12, from: 330, to: 280 })
  };

  function scheduleStep(index, time) {
    const slot = compiled.steps[index];
    if (!slot) return;
    slot.notes.forEach((event) => playNote(event, time));
    for (const piece of slot.drums) drums[piece](time, index % 2 === 1);
  }

  const initialOffsetSec = safePlaybackOffset(offsetSec);
  const timelineStart = ctx.currentTime + 0.06 - initialOffsetSec;
  let position = findPlaybackPosition(timing, initialOffsetSec);
  let lastTickAt = 0;

  // Chamado a cada CHIP_SONG_TICK_MS. Com a aba em segundo plano o navegador espaça
  // os timers, então a janela de agendamento cresce junto com o intervalo real.
  function tick() {
    if (stopped) return;
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const gapSec = lastTickAt ? (nowMs - lastTickAt) / 1000 : 0;
    lastTickAt = nowMs;
    const lookahead = clamp(gapSec * 1.5, MIN_LOOKAHEAD_SEC, MAX_LOOKAHEAD_SEC);
    const now = ctx.currentTime;
    // Um timer atrasado perde ataques, mas não desloca a fase da música dos outros
    // jogadores. A origem fixa também evita acumular erro ao somar durações.
    if (timelineStart + position.nextStepSec < now) {
      position = findPlaybackPosition(timing, now - timelineStart);
    }
    while (timelineStart + position.nextStepSec < now + lookahead) {
      scheduleStep(position.stepIndex, Math.max(now, timelineStart + position.nextStepSec));
      position = playbackStep(timing, position.stepNumber + 1);
    }
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    const now = ctx.currentTime;
    try {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.linearRampToValueAtTime(0, now + 0.04);
    } catch {
      // contexto já fechado
    }
    sources.forEach((node) => {
      try {
        node.stop(now + 0.05);
      } catch {
        // já parou
      }
    });
    sources.clear();
    setTimeout(() => {
      try {
        delay.disconnect();
        bus.disconnect();
      } catch {
        // já desconectado
      }
    }, 250);
  }

  return { tick, stop };
}
