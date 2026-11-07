// The "Vegas After Dark" card in the landing page's bottom-left corner.
// It teases the show by typing one line of the story at a time, then starts it on click.

const LINES = [
  'A city that never sleeps.',
  'A billboard with a cracked photo.',
  'Ten bullets. One sign to bring down.',
  'And a story on the other side.',
];

const btn = document.getElementById('story-btn');
const line = btn.querySelector('.sb-line');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let timer = null, i = 0;

function typeLine(text, done) {
  let n = 0;
  line.textContent = '';
  (function step() {
    line.textContent = text.slice(0, ++n);
    timer = setTimeout(n < text.length ? step : done, n < text.length ? 38 : 2200);
  })();
}

function loop() {
  if (reduce) { line.textContent = LINES[0]; return; }
  typeLine(LINES[i], () => { i = (i + 1) % LINES.length; loop(); });
}

export function onStoryClick(fn) {
  btn.addEventListener('click', () => fn(btn));
}

// start typing once the landing page has faded its text in
export function startStoryTeaser() {
  clearTimeout(timer);
  timer = setTimeout(loop, 1600);
}

export function stopStoryTeaser() { clearTimeout(timer); }

export function markReplay() {
  btn.querySelector('.sb-kicker').textContent = 'Watch it again · 2 min · sound on';
}
