import './style.css';
import { createVegasScene } from './vegasScene.js';
import { createShooter } from './shooter.js';
import { playIntro } from './intro.js';
import { unlockAudio, boom } from './sound.js';
import { startMusic } from './music.js';

const vegas = createVegasScene(document.getElementById('scene'));
const shooter = createShooter(vegas);
const intro = document.getElementById('intro');
const startBtn = document.getElementById('start');

unlockAudio();
playIntro();

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  boom();
  startMusic();
  const r = startBtn.getBoundingClientRect();
  intro.classList.add('leaving');
  // the Vegas scene (with the gun) bursts out of the button
  vegas.revealFrom(r.left + r.width / 2, r.top + r.height / 2).then(() => {
    intro.remove();
    shooter.arm();
  });
});
