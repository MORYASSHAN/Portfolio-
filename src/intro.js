import { keyClick } from './sound.js';

// The host: a guy who walks in, types out a few lines in a chat box, then offers choices.
// Used for the opening and again between levels (over the dimmed scene).

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const intro = document.getElementById('intro');
const chat = document.getElementById('chat');
const actions = document.getElementById('actions');
let aborted = false;

function typingDots() {
  const el = document.createElement('div');
  el.className = 'bubble typing';
  el.innerHTML = '<i></i><i></i><i></i>';
  chat.appendChild(el);
  return el;
}

async function typeMessage(text) {
  const dots = typingDots();
  await wait(350 + Math.random() * 200);
  dots.remove();

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const txt = document.createElement('span');
  const caret = document.createElement('span');
  caret.className = 'caret';
  bubble.append(txt, caret);
  chat.appendChild(bubble);

  let n = 0;
  for (const ch of text) {
    if (aborted) return;
    txt.textContent += ch;
    if (ch !== ' ' && n++ % 2 === 0) keyClick();   // every other key, so the faster typing doesn't turn into a buzz
    let delay = 16 + Math.random() * 18;
    if (',.?!'.includes(ch)) delay += 110;
    await wait(delay);
  }
  caret.remove();
}

export function bloodButton(label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'blood-btn';
  b.innerHTML = '<span class="label"></span><span class="drips" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  b.querySelector('.label').textContent = label;
  return b;
}

function songButton(song) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'song-btn';
  b.innerHTML = '<span class="disc" aria-hidden="true"></span><span class="meta"><span class="t"></span><span class="a"></span></span>';
  b.querySelector('.t').textContent = song.title;
  b.querySelector('.a').textContent = song.artist;
  return b;
}

export async function openHost({ overScene = false } = {}) {
  chat.innerHTML = '';
  actions.innerHTML = '';
  intro.className = overScene ? 'over-scene' : '';
  intro.hidden = false;
  await wait(overScene ? 250 : 600);
  intro.classList.add('host-in');
  await wait(1100);
  intro.classList.add('chat-in');
  await wait(500);
}

export async function say(lines) {
  intro.classList.remove('btn-in');
  for (const line of lines) {
    if (aborted) return new Promise(() => {});
    await typeMessage(line);
    await wait(280);
  }
}

// options: [{ label, value }] for blood buttons, or [{ song, value }] for song cards.
// Resolves with { value, el } for the one picked.
export function choose(options) {
  actions.innerHTML = '';
  actions.classList.toggle('songs', options.some((o) => o.song));
  return new Promise((resolve) => {
    options.forEach((opt) => {
      const b = opt.song ? songButton(opt.song) : bloodButton(opt.label);
      b.addEventListener('click', () => {
        actions.querySelectorAll('button').forEach((x) => { x.disabled = true; });
        b.classList.add('picked');
        resolve({ value: opt.value, el: b });
      }, { once: true });
      actions.appendChild(b);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('btn-in')));
  });
}

// fade everything out; the overlay stops catching clicks right away
export function leaveHost() { intro.classList.add('leaving'); }

export function hideHost() {
  intro.hidden = true;
  intro.className = '';
}

// skip: stop typing for good, the pending say()/choose() just never finish
export function abortHost() {
  aborted = true;
  leaveHost();
}

export async function closeHost() {
  leaveHost();
  await wait(600);
  hideHost();
}
