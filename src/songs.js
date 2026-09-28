// The three tracks the player can pick for level 2 (files live in public/music).
export const SONGS = [
  { id: 'stronger', title: 'Stronger', artist: 'Kanye West', src: '/music/stronger.mp3' },
  { id: 'cant-tell-me-nothing', title: "Can't Tell Me Nothing", artist: 'Kanye West', src: '/music/cant-tell-me-nothing.mp3' },
  { id: 'tokyo-drift', title: 'Tokyo Drift', artist: 'Teriyaki Boyz', src: '/music/tokyo-drift.mp3' },
];

let current = null;

export function playSong(song, volume = 0.75) {
  if (current) current.pause();
  const el = new Audio(song.src);
  el.loop = true;
  el.volume = 0;
  el.play().catch(() => {});
  const start = performance.now();
  const fade = setInterval(() => {
    const p = Math.min((performance.now() - start) / 2000, 1);
    el.volume = p * volume;
    if (p >= 1) clearInterval(fade);
  }, 50);
  current = el;
}

export const songLoaded = () => !!current;

// the music button pauses/resumes whatever song is on
export function pauseSong(paused) {
  if (!current) return;
  if (paused) current.pause();
  else current.play().catch(() => {});
}
