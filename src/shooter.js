import { gunshot, glassBreak, crowdPanic } from './sound.js';

export function createShooter(vegas) {
  const stage = document.getElementById('stage');
  const fx = document.getElementById('fx');
  const reticle = document.getElementById('reticle');

  let armed = false, lastShot = 0, panicked = false;

  function spawn(cls, styles) {
    const el = document.createElement('div');
    el.className = cls;
    Object.assign(el.style, styles);
    el.addEventListener('animationend', () => el.remove());
    fx.appendChild(el);
  }

  function shake(hard) {
    stage.classList.remove('shake', 'shake-hard');
    void stage.offsetWidth;
    stage.classList.add(hard ? 'shake-hard' : 'shake');
  }

  function fire(x, y) {
    const now = performance.now();
    if (now - lastShot < 170) return;
    lastShot = now;

    gunshot();
    const { hit, muzzle: [mx, my] } = vegas.shoot(x, y);
    const len = Math.hypot(x - mx, y - my), ang = Math.atan2(y - my, x - mx);
    spawn('tracer', { left: mx + 'px', top: my + 'px', width: len + 'px', transform: `rotate(${ang}rad)` });
    spawn('muzzle-light', { left: mx + 'px', top: my + 'px' });
    spawn('impact', { left: x + 'px', top: y + 'px' });
    if (hit) glassBreak();
    shake(hit);
    if (!panicked) { panicked = true; crowdPanic(); }
  }

  function track(e) {
    reticle.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    vegas.aim(e.clientX, e.clientY);
  }

  window.addEventListener('pointermove', track);
  window.addEventListener('pointerdown', (e) => {
    if (!armed || (e.button !== undefined && e.button !== 0)) return;
    track(e);
    fire(e.clientX, e.clientY);
  });

  // gun is in view from the moment the scene opens; shooting starts once it's fully out
  function arm() {
    armed = true;
    document.body.classList.add('armed');
  }

  return { arm };
}
