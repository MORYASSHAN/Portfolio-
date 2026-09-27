import { audio } from './sound.js';

// Laid-back West Coast / G-funk loop, fully synthesized: 808 kick, clap, swung hats,
// sliding sub bass, dark pad chords and a whiny portamento lead. 4 bars, loops forever.
const BPM = 90;
const STEP = 60 / BPM / 4;              // 16th note
const SWING = 0.18;                     // push every off-16th late

// A minor → F → C → G (i – VI – III – VII)
const CHORDS = [
  [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62],
];
const BASS = [
  [[0, 33], [6, 33], [10, 45], [14, 43]],
  [[0, 29], [6, 29], [10, 41], [12, 40]],
  [[0, 36], [6, 36], [10, 36], [14, 38]],
  [[0, 31], [6, 31], [10, 43], [13, 40]],
];
// [bar, step, midi, lengthInSteps] — the whistle-y lead
const LEAD = [
  [0, 0, 76, 6], [0, 8, 74, 3], [0, 11, 72, 5],
  [1, 0, 72, 4], [1, 4, 69, 8],
  [2, 0, 72, 6], [2, 8, 76, 3], [2, 11, 79, 5],
  [3, 0, 78, 4], [3, 4, 74, 10],
];
const KICK = [0, 7, 10];
const CLAP = [4, 12];

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

let started = false;
let master = null, timer = null;

export function startMusic() {
  if (started) return;
  started = true;
  const a = audio();
  a.resume();

  master = a.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.32, a.currentTime + 3);
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 4;
  master.connect(comp).connect(a.destination);

  const noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  function env(g, t, peak, attack, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  function kick(t) {
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    env(g, t, 1, 0.003, 0.35);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.4);
  }

  function noiseHit(t, type, freq, peak, decay) {
    const s = a.createBufferSource(); s.buffer = noiseBuf;
    const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = a.createGain(); env(g, t, peak, 0.002, decay);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 0.3); s.stop(t + decay + 0.05);
  }

  function clap(t) {
    [0, 0.012, 0.024].forEach((d) => noiseHit(t + d, 'bandpass', 1500, 0.35, 0.09));
    noiseHit(t + 0.03, 'bandpass', 1200, 0.25, 0.22);
  }

  function bass(t, midi, len) {
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.setValueAtTime(hz(midi + 12) , t);
    o.frequency.exponentialRampToValueAtTime(hz(midi), t + 0.05);
    f.type = 'lowpass'; f.frequency.value = 500;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + len + 0.05);
  }

  function pad(t, notes, len) {
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 2;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.4);
    g.gain.setValueAtTime(0.06, t + len - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + len);
    f.connect(g).connect(master);
    notes.forEach((m) => [-6, 6].forEach((cents) => {
      const o = a.createOscillator(); o.type = 'sawtooth';
      o.frequency.value = hz(m); o.detune.value = cents;
      o.connect(f); o.start(t); o.stop(t + len + 0.05);
    }));
  }

  function lead(t, midi, len, prevMidi) {
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = 'sine';
    // G-funk whine: slide in from the previous note, wide slow vibrato
    o.frequency.setValueAtTime(hz(prevMidi ?? midi), t);
    o.frequency.exponentialRampToValueAtTime(hz(midi), t + 0.09);
    const lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.value = 5.2; lg.gain.value = hz(midi) * 0.012;
    lfo.connect(lg).connect(o.frequency);
    f.type = 'lowpass'; f.frequency.value = 2500;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11, t + 0.04);
    g.gain.setValueAtTime(0.11, t + len * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(f).connect(g).connect(master);
    o.start(t); lfo.start(t); o.stop(t + len + 0.05); lfo.stop(t + len + 0.05);
  }

  // look-ahead scheduler
  let step = 0, nextTime = a.currentTime + 0.1;
  let prevLead = null;
  function schedule() {
    while (nextTime < a.currentTime + 0.25) {
      const bar = Math.floor(step / 16) % 4, s = step % 16;
      const t = nextTime + (s % 2 === 1 ? STEP * SWING : 0);
      if (KICK.includes(s)) kick(t);
      if (CLAP.includes(s)) clap(t);
      if (s % 2 === 0) noiseHit(t, 'highpass', 8000, s % 4 === 2 ? 0.12 : 0.07, s === 14 ? 0.18 : 0.04);
      else if (Math.random() < 0.35) noiseHit(t, 'highpass', 9000, 0.04, 0.03);
      BASS[bar].forEach(([bs, m]) => { if (bs === s) bass(t, m, STEP * 3.5); });
      if (s === 0) pad(t, CHORDS[bar], STEP * 16);
      // lead plays every other time round the loop so it doesn't wear out
      if (Math.floor(step / 64) % 2 === 1) {
        LEAD.forEach(([lb, ls, m, len]) => { if (lb === bar && ls === s) { lead(t, m, STEP * len, prevLead); prevLead = m; } });
      }
      step++;
      nextTime += STEP;
    }
  }
  timer = setInterval(schedule, 50);
  schedule();
}

// fade the beat out (when a real song takes over)
export function stopMusic(fade = 1.2) {
  if (!master) return;
  const a = audio(), now = a.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + fade);
  setTimeout(() => clearInterval(timer), fade * 1000 + 300);
}
