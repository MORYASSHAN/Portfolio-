import { gunshot, glassBreak, crowdPanic, metalHit, explosion, dryFire } from './sound.js';

export function createShooter(vegas, { onShot, onAmmo } = {}) {
  const stage = document.getElementById('stage');
  const fx = document.getElementById('fx');
  const reticle = document.getElementById('reticle');

  let armed = false, lastShot = 0, panicked = false;
  let ammo = null;               // null = unlimited

  function spawn(cls, styles = {}) {
    const el = document.createElement('div');
    el.className = cls;
    Object.assign(el.style, styles);
    el.addEventListener('animationend', () => el.remove());
    fx.appendChild(el);
  }

  function shake(level) {
    stage.classList.remove('shake', 'shake-hard', 'shake-huge');
    void stage.offsetWidth;
    stage.classList.add(level === 2 ? 'shake-huge' : level ? 'shake-hard' : 'shake');
  }

  function fire(x, y) {
    const now = performance.now();
    if (now - lastShot < 170) return;
    lastShot = now;

    if (ammo === 0) { dryFire(); onShot?.({ hit: false, kind: null, dry: true }, ammo); return; }
    if (ammo !== null) { ammo--; onAmmo?.(ammo); }

    gunshot();
    const res = { ...vegas.shoot(x, y), x, y };
    const [mx, my] = res.muzzle;
    const len = Math.hypot(x - mx, y - my), ang = Math.atan2(y - my, x - mx);
    spawn('tracer', { left: mx + 'px', top: my + 'px', width: len + 'px', transform: `rotate(${ang}rad)` });
    spawn('muzzle-light', { left: mx + 'px', top: my + 'px' });
    spawn('impact', { left: x + 'px', top: y + 'px' });
    if (res.kind === 'tile') glassBreak();
    else if (res.kind === 'sign') metalHit();
    else if (res.kind === 'ping') metalHit(true);
    if (res.justDestroyed) {
      explosion();
      glassBreak();
      spawn('blast-flash');
      shake(2);
    } else shake(res.hit);
    if (!panicked) { panicked = true; crowdPanic(); }
    onShot?.(res, ammo);
  }

  function track(e) {
    reticle.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    vegas.aim(e.clientX, e.clientY);
  }

  // Mouse: click to shoot. Touch: a tap shoots, a sideways drag looks around the street instead
  // (on a phone the photo is much wider than the screen), so a swipe never wastes a bullet.
  const DRAG = 12;   // px a finger can wobble and still count as a tap
  let touch = null;
  window.addEventListener('pointermove', (e) => {
    track(e);
    if (!touch || e.pointerId !== touch.id) return;
    if (!touch.dragged && Math.hypot(e.clientX - touch.x0, e.clientY - touch.y0) > DRAG) touch.dragged = true;
    if (touch.dragged) vegas.panBy(e.clientX - touch.x);
    touch.x = e.clientX;
  });
  window.addEventListener('pointerdown', (e) => {
    if (!armed || (e.button !== undefined && e.button !== 0)) return;
    if (e.target.closest && e.target.closest('button, .hud-pan')) return;   // HUD controls aren't targets
    track(e);
    if (e.pointerType !== 'touch') { fire(e.clientX, e.clientY); return; }
    if (!touch) touch = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, dragged: false };
  });
  const endTouch = (e, cancelled) => {
    if (!touch || e.pointerId !== touch.id) return;
    const t = touch;
    touch = null;
    if (!cancelled && !t.dragged && armed) fire(t.x0, t.y0);
  };
  window.addEventListener('pointerup', (e) => endTouch(e, false));
  window.addEventListener('pointercancel', (e) => endTouch(e, true));

  function arm() {
    armed = true;
    document.body.classList.add('armed');
  }

  function disarm() {
    armed = false;
    document.body.classList.remove('armed');
  }

  function setAmmo(n) { ammo = n; onAmmo?.(n); }

  return { arm, disarm, setAmmo, shake };
}
