import { keyClick } from './sound.js';

const MESSAGES = [
  'Hey pal.',
  "From here on, some crazy shit is gonna happen. Be ready, and do what you're told.",
  "There's a big billboard on the road with a cracked banner photo on it. Just shoot the blocks. Okay?",
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function typingDots(chat) {
  const el = document.createElement('div');
  el.className = 'bubble typing';
  el.innerHTML = '<i></i><i></i><i></i>';
  chat.appendChild(el);
  return el;
}

async function typeMessage(chat, text) {
  const dots = typingDots(chat);
  await wait(700 + Math.random() * 400);
  dots.remove();

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const txt = document.createElement('span');
  const caret = document.createElement('span');
  caret.className = 'caret';
  bubble.append(txt, caret);
  chat.appendChild(bubble);

  for (const ch of text) {
    txt.textContent += ch;
    if (ch !== ' ') keyClick();
    let delay = 32 + Math.random() * 38;
    if (',.?!'.includes(ch)) delay += 220;
    await wait(delay);
  }
  caret.remove();
}

export async function playIntro() {
  const intro = document.getElementById('intro');
  const chat = document.getElementById('chat');

  await wait(600);
  intro.classList.add('host-in');
  await wait(1100);
  intro.classList.add('chat-in');
  await wait(500);

  for (const msg of MESSAGES) {
    await typeMessage(chat, msg);
    await wait(450);
  }

  intro.classList.add('btn-in');
}
