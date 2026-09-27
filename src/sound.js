// All sounds are synthesized with Web Audio — no audio files needed.
let ctx = null;

export function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

// Browsers keep audio muted until the first click/tap/key; resume as soon as one happens.
export function unlockAudio() {
  const resume = () => audio().resume();
  resume();
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, resume, { once: true }));
}

let noiseBuf = null;
function noise() {
  const a = audio();
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 1.0, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

// filtered noise burst helper
function burst(a, t, { type = 'lowpass', freq = 2000, q = 0.7, peak = 0.5, attack = 0.002, decay = 0.2, offset = 0 }) {
  const src = a.createBufferSource();
  src.buffer = noise();
  const f = a.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t, offset);
  src.stop(t + attack + decay + 0.05);
  return f;
}

// pistol shot: sharp crack + body + low thump
export function gunshot() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  burst(a, t, { type: 'highpass', freq: 2500, peak: 0.5, decay: 0.05 });
  const body = burst(a, t, { type: 'lowpass', freq: 5000, peak: 0.9, decay: 0.28, offset: Math.random() * 0.5 });
  body.frequency.setValueAtTime(5000, t);
  body.frequency.exponentialRampToValueAtTime(400, t + 0.25);
  const o = a.createOscillator();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.8, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.25);
}

// glass shattering: crack, then a shower of tinkles
export function glassBreak() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime + 0.02;
  burst(a, t, { type: 'highpass', freq: 1800, peak: 0.6, decay: 0.12 });
  burst(a, t, { type: 'bandpass', freq: 6000, q: 0.8, peak: 0.35, decay: 0.5, offset: 0.3 });
  for (let i = 0; i < 18; i++) {
    const dt = t + 0.03 + Math.pow(Math.random(), 1.6) * 0.7;
    const amp = 0.25 * (1 - (dt - t) / 0.8);
    if (Math.random() < 0.5) {
      burst(a, dt, { type: 'bandpass', freq: 3500 + Math.random() * 6000, q: 6, peak: Math.max(amp, 0.02), decay: 0.04 + Math.random() * 0.06, offset: Math.random() * 0.8 });
    } else {
      const o = a.createOscillator();
      o.type = 'sine';
      o.frequency.value = 2500 + Math.random() * 5000;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, dt);
      g.gain.exponentialRampToValueAtTime(Math.max(amp * 0.5, 0.01), dt + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, dt + 0.08 + Math.random() * 0.12);
      o.connect(g).connect(a.destination);
      o.start(dt); o.stop(dt + 0.25);
    }
  }
}

// one keystroke: short filtered click with a little random pitch
export function keyClick() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noise();
  src.loop = false;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1800 + Math.random() * 1600;
  bp.Q.value = 1.2;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + 0.05);
}

// crowd losing it after the first shot: shouted lines + synthesized screams
const SHOUTS = ['Run!', "He's got a gun!", 'Get down!', 'Oh my god!', 'Move, move!', 'Go, go, go!'];

export function crowdPanic() {
  const a = audio();
  if (a.state === 'running') {
    const t0 = a.currentTime;
    for (let i = 0; i < 7; i++) {
      const t = t0 + 0.1 + Math.random() * 1.6;
      const dur = 0.5 + Math.random() * 0.7;
      const f0 = 280 + Math.random() * 260;
      const o = a.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, t);
      o.frequency.linearRampToValueAtTime(f0 * (1.25 + Math.random() * 0.3), t + dur * 0.3);
      o.frequency.linearRampToValueAtTime(f0 * 0.85, t + dur);
      const lfo = a.createOscillator(); lfo.frequency.value = 5 + Math.random() * 3;
      const lfoGain = a.createGain(); lfoGain.gain.value = f0 * 0.04;
      lfo.connect(lfoGain).connect(o.frequency);
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.06);
      g.gain.setValueAtTime(0.05, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      [[850 + Math.random() * 250, 5], [1500 + Math.random() * 900, 7]].forEach(([freq, q]) => {
        const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
        o.connect(f).connect(g);
      });
      g.connect(a.destination);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    }
    // panicked murmur underneath
    burst(a, t0, { type: 'bandpass', freq: 700, q: 1.5, peak: 0.12, attack: 0.3, decay: 1.8, offset: 0.1 });
  }

  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
    const lines = [...SHOUTS].sort(() => Math.random() - 0.5).slice(0, 4);
    lines.forEach((line) => {
      const u = new SpeechSynthesisUtterance(line);
      if (voices.length) u.voice = voices[Math.floor(Math.random() * voices.length)];
      u.pitch = 0.8 + Math.random() * 0.9;
      u.rate = 1.25 + Math.random() * 0.3;
      u.volume = 0.9;
      speechSynthesis.speak(u);
    });
  }
}

// deep hit when the show starts
export function boom() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  const o = a.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.9);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.7, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 1.4);
}

// bullet on sheet metal: inharmonic ring + a gritty tick
export function metalHit(soft = false) {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  const k = soft ? 0.4 : 1;
  burst(a, t, { type: 'highpass', freq: 3000, peak: 0.35 * k, decay: 0.04 });
  [540, 1310, 2270, 3480].forEach((f, i) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.value = f * (0.97 + Math.random() * 0.06);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime((0.16 / (i + 1)) * k, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 - i * 0.08);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + 0.55);
  });
  for (let i = 0; i < 6; i++) {
    burst(a, t + 0.02 + Math.random() * 0.25, { type: 'bandpass', freq: 4000 + Math.random() * 4000, q: 4, peak: 0.08 * k, decay: 0.03 });
  }
}

// the sign goes up: huge noise blast, sub drop, crackle tail
export function explosion() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  const body = burst(a, t, { type: 'lowpass', freq: 3000, peak: 1, attack: 0.01, decay: 2.4 });
  body.frequency.setValueAtTime(3000, t);
  body.frequency.exponentialRampToValueAtTime(160, t + 2);
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(90, t);
  o.frequency.exponentialRampToValueAtTime(24, t + 1.4);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(1, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 1.9);
  for (let i = 0; i < 30; i++) {
    burst(a, t + 0.2 + Math.random() * 2.5, { type: 'bandpass', freq: 1500 + Math.random() * 5000, q: 3, peak: 0.05 + Math.random() * 0.08, decay: 0.02 + Math.random() * 0.04, offset: Math.random() * 0.8 });
  }
}

// heavy crash when the board hits the road
export function crash() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  burst(a, t, { type: 'lowpass', freq: 1200, peak: 0.9, decay: 0.8 });
  metalHit();
  glassBreak();
}

// trigger pulled on an empty mag
export function dryFire() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  burst(a, t, { type: 'bandpass', freq: 3200, q: 3, peak: 0.3, decay: 0.025 });
  burst(a, t + 0.05, { type: 'bandpass', freq: 2200, q: 3, peak: 0.18, decay: 0.03 });
}

// big stage light slamming on
export function switchOn() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  burst(a, t, { type: 'lowpass', freq: 900, peak: 0.45, decay: 0.12 });
  burst(a, t, { type: 'bandpass', freq: 2600, q: 2, peak: 0.12, decay: 0.05 });
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(70, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.4);
}

// the whole screen cracking
export function screenCrack() {
  const a = audio();
  if (a.state !== 'running') return;
  const t = a.currentTime;
  burst(a, t, { type: 'highpass', freq: 1200, peak: 0.9, decay: 0.18 });
  burst(a, t, { type: 'lowpass', freq: 600, peak: 0.6, decay: 0.5 });
  for (let i = 0; i < 10; i++) {
    burst(a, t + Math.random() * 0.25, { type: 'bandpass', freq: 3000 + Math.random() * 5000, q: 5, peak: 0.15, decay: 0.03, offset: Math.random() * 0.8 });
  }
}
