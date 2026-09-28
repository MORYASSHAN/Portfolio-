import './style.css';
import { createVegasScene } from './vegasScene.js';
import { createShooter } from './shooter.js';
import { createHud } from './hud.js';
import { openHost, say, choose, leaveHost, hideHost, closeHost, abortHost } from './intro.js';
import { openHome } from './home.js';
import { hasPage, showPage } from './pages.js';
import { unlockAudio, boom, screenCrack } from './sound.js';
import { preloadFinale, startFinale } from './finale.js';
import { startMusic, stopMusic } from './music.js';
import { SONGS, playSong } from './songs.js';
import { showMusicButton } from './musicButton.js';

const BULLETS = 10;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const vegas = createVegasScene(document.getElementById('scene'));
const hud = createHud();
const shooter = createShooter(vegas, { onShot, onAmmo: (n) => hud.ammo(n, BULLETS) });
vegas.onPan(hud.pan);                       // phones: the look-around bar tracks the view...
hud.panDrag((f) => vegas.setPan(f - 0.5));  // ...and dragging it slides the view

const skip = document.getElementById('skip');
let level = 1, levelCleared = false, signDown = false, reloadOffered = false;

unlockAudio();
// dev shortcut: localhost:5173/#finale jumps straight to the ending, once (the hash is cleared so a reload plays normally)
if (import.meta.env.DEV && location.hash === '#finale') {
  history.replaceState(null, '', location.pathname);
  skipToFinale();
} else if (import.meta.env.DEV && location.hash === '#level2') {
  history.replaceState(null, '', location.pathname);
  skipToLevelTwo();
} else if (hasPage(location.hash.slice(1))) deepLink(location.hash.slice(1));
else opening();

// a shared link like /#projects skips the show and lands on that page, with the portrait behind it
async function deepLink(name) {
  showMusicButton(false);
  hideHost();
  await openHome();
  showPage(name, { push: false });
}

async function skipToFinale() {
  hideHost();
  showMusicButton(false);
  preloadFinale();
  await vegas.revealFrom(window.innerWidth / 2, window.innerHeight / 2, 10);
  await wait(300);
  finale({ x: window.innerWidth * 0.7, y: window.innerHeight * 0.45 });
}

// dev shortcut: localhost:5173/#level2 starts on the Vegas-sign level with a full clip
async function skipToLevelTwo() {
  hideHost();
  showMusicButton(false);
  await vegas.revealFrom(window.innerWidth / 2, window.innerHeight / 2, 10);
  level = 2;
  vegas.setLevel(2);
  preloadFinale();
  shooter.setAmmo(BULLETS);
  shooter.arm();
  hud.objective('Destroy the Vegas board to evacuate');
}

// returning visitors can jump straight to the landing page from the opening
skip.addEventListener('click', async () => {
  const r = skip.getBoundingClientRect();
  skip.classList.add('gone');
  abortHost();
  showMusicButton(false);
  await openHome(r.left + r.width / 2, r.top + r.height / 2);
  hideHost();
  skip.hidden = true;
}, { once: true });

// one click (or Enter/Space) before the host starts typing, so his key clicks are audible
function enterGate() {
  const gate = document.getElementById('enter');
  gate.hidden = false;
  gate.focus();
  return new Promise((resolve) => {
    gate.addEventListener('click', () => {
      unlockAudio();
      gate.classList.add('gone');
      setTimeout(() => { gate.hidden = true; resolve(); }, 450);
    }, { once: true });
  });
}

async function opening() {
  await enterGate();
  skip.hidden = false;
  await openHost();
  await say([
    'Hey pal.',
    "From here on, some crazy shit is gonna happen. Be ready, and do what you're told.",
    "There's a big billboard on the road with a cracked banner photo on it. Just shoot the blocks. Okay?",
  ]);
  const { el } = await choose([{ label: 'Start the show' }]);
  skip.classList.add('gone');
  boom();
  startMusic();
  showMusicButton(true);
  const r = el.getBoundingClientRect();
  leaveHost();
  // the Vegas scene (with the gun) bursts out of the button
  await vegas.revealFrom(r.left + r.width / 2, r.top + r.height / 2);
  hideHost();
  shooter.arm();
  hud.objective('Break every block on the billboard');
}

function onShot(res, ammo) {
  // level 1 ends only once the last glass block on the billboard is gone
  if (level === 1 && res.kind === 'tile' && res.tilesLeft === 0 && !levelCleared) {
    levelCleared = true;
    hud.objective('');
    setTimeout(() => {
      hud.toast('Billboard wrecked', 2600);
      hud.action('Move to next level', levelTwo);
    }, 1400);
  }

  if (level === 2) {
    if (res.justDestroyed) finale(res);
    if (ammo === 0 && !signDown && !reloadOffered) {
      reloadOffered = true;
      setTimeout(() => {
        if (signDown) return;
        hud.toast('Out of ammo', 2200);
        hud.action('Reload', () => {
          reloadOffered = false;
          hud.clearAction();
          shooter.setAmmo(BULLETS);
        });
      }, 700);
    }
  }
}

async function levelTwo() {
  hud.clearAction();
  shooter.disarm();
  await openHost({ overScene: true });
  await say(['Nice work, pal.', 'Now choose a song.']);
  const { value: song } = await choose(SONGS.map((s) => ({ song: s, value: s })));
  stopMusic();
  playSong(song);
  showMusicButton(true);
  hud.song(song);
  await wait(600);
  await say([
    `You have ${BULLETS} bullets left.`,
    'Now destroy the Vegas board to evacuate. Finish it and destroy this place.',
  ]);
  await choose([{ label: "Let's go" }]);
  await closeHost();

  level = 2;
  vegas.setLevel(2);
  preloadFinale();
  shooter.setAmmo(BULLETS);
  shooter.arm();
  hud.objective('Destroy the Vegas board to evacuate');
}

async function finale(res) {
  signDown = true;
  hud.clearAction();
  hud.objective('');
  // let the sign burst into glass, then the whole screen cracks where the last bullet landed
  await wait(1600);
  shooter.disarm();
  const snap = vegas.snapshot();
  screenCrack();
  // "Know more" at the end of the story opens the same landing page
  const end = startFinale(snap, res.x, res.y, async (btn) => {
    const r = btn.getBoundingClientRect();
    await openHome(r.left + r.width / 2, r.top + r.height / 2);
    end.stop();
  });
  vegas.stop();
  document.getElementById('stage').hidden = true;
  document.getElementById('hud').hidden = true;
}
