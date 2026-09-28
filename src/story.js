import { bloodButton } from './intro.js';

// Scroll-scrubbed lines over the looping video. *word* = red highlight.
// fx picks how each character comes in: rise, drop, zoom, speed.
export const LINES = [
  { text: 'Hi, I am *Shaan*', fx: 'rise' },
  { text: "I'm a *designer*, *developer* & *storyteller*", fx: 'drop' },
  { text: 'I love building cool things', fx: 'rise' },
  { text: "Exactly like the one you're *experiencing* right now", fx: 'zoom' },
  { text: 'I build and ship *fast*, just like the car', fx: 'speed' },
  { text: 'The beauty *inside* is bigger than the outside', fx: 'rise' },
  { text: 'Good *design*. Scalable *architecture*. Great *UI & UX*.', fx: 'drop' },
  { text: 'Click the button to know more about the *business*', fx: 'rise', cta: 'Know more' },
];

export const SEG = 0.25;                         // scroll units per line
export const STORY_LEN = (LINES.length - 1) * SEG + SEG * 0.55;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function charStyle(fx, e) {
  const k = 1 - e;
  switch (fx) {
    case 'drop': return { t: `translateY(${-k * 0.9}em) scale(${1 + k * 0.4})`, blur: k * 10 };
    case 'zoom': return { t: `scale(${1 + k * 2.2})`, blur: k * 16 };
    case 'speed': return { t: `translateX(${k * 9}em) skewX(${-k * 35}deg)`, blur: k * 9 };
    default: return { t: `translateY(${k * 0.7}em) rotateX(${-k * 75}deg)`, blur: k * 10 };
  }
}

export function createStory(onCta) {
  const root = document.getElementById('story');
  const counter = document.getElementById('story-count');
  const lines = LINES.map((line, i) => {
    const el = document.createElement('div');
    el.className = 'story-line';
    const chars = [];
    // split into words (so lines wrap cleanly) then characters
    line.text.split(/(\*[^*]+\*|\s+)/).filter(Boolean).forEach((chunk) => {
      if (/^\s+$/.test(chunk)) { el.append(' '); return; }
      const hot = chunk.startsWith('*');
      const word = document.createElement('span');
      word.className = hot ? 'word hot' : 'word';
      for (const ch of hot ? chunk.slice(1, -1) : chunk) {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch === ' ' ? ' ' : ch;
        word.appendChild(c);
        chars.push(c);
      }
      el.appendChild(word);
    });
    let btn = null;
    if (line.cta) {
      btn = bloodButton(line.cta);
      btn.classList.add('story-cta');
      btn.addEventListener('click', () => onCta?.(btn), { once: true });
      el.appendChild(document.createElement('br'));
      el.appendChild(btn);
    }
    root.appendChild(el);
    return { el, chars, btn, fx: line.fx, last: i === LINES.length - 1, shown: false };
  });

  // u = scroll units past the moment the video filled the screen
  function update(u) {
    let current = -1;
    lines.forEach((l, i) => {
      const lp = (u - i * SEG) / SEG;            // 0..1 across this line's slot
      const active = lp > 0 && (l.last || lp < 1);
      if (!active) {
        if (l.shown) { l.el.style.visibility = 'hidden'; l.shown = false; }
        return;
      }
      current = i;
      l.shown = true;
      l.el.style.visibility = 'visible';
      const enter = clamp01(lp / 0.42);
      const exit = l.last ? 0 : clamp01((lp - 0.72) / 0.28);
      const n = l.chars.length, stagger = 0.6 / Math.max(n, 1);
      l.chars.forEach((c, j) => {
        const e = easeOut(clamp01((enter - j * stagger) / 0.4));
        const s = charStyle(l.fx, e);
        const x = easeOut(clamp01((exit - (n - 1 - j) * stagger * 0.5) / 0.7));
        c.style.transform = `${s.t} translateY(${-x * 0.6}em)`;
        c.style.opacity = e * (1 - x);
        const blur = s.blur + x * 8;
        c.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';
      });
      if (l.btn) l.btn.classList.toggle('in', enter > 0.9);
    });
    root.classList.toggle('on', current >= 0);
    counter.classList.toggle('on', current >= 0);
    if (current >= 0) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(LINES.length).padStart(2, '0')}`;
  }

  return { update };
}
