import { bloodButton } from './intro.js';

// In-game overlay: ammo, objective, now playing, big toasts and a center action button.
export function createHud() {
  const $ = (id) => document.getElementById(id);
  const ammoEl = $('hud-ammo'), objectiveEl = $('hud-objective'), songEl = $('hud-song');
  const toastEl = $('hud-toast'), actionEl = $('hud-action');
  let toastTimer = null;

  function ammo(n, max = 10) {
    if (n === null) { ammoEl.classList.remove('on'); return; }
    ammoEl.innerHTML = `<span class="rounds">${'<i></i>'.repeat(max)}</span><span class="count"></span>`;
    [...ammoEl.querySelectorAll('i')].forEach((b, i) => b.classList.toggle('spent', i >= n));
    ammoEl.querySelector('.count').textContent = `${n} / ${max}`;
    ammoEl.classList.toggle('empty', n === 0);
    ammoEl.classList.add('on');
  }

  function objective(text) {
    objectiveEl.textContent = text;
    objectiveEl.classList.toggle('on', !!text);
  }

  function song(s) {
    songEl.innerHTML = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="txt"></span>';
    songEl.querySelector('.txt').textContent = `${s.title} — ${s.artist}`;
    songEl.classList.add('on');
  }

  function toast(text, ms = 2600, big = false) {
    clearTimeout(toastTimer);
    toastEl.textContent = text;
    toastEl.classList.toggle('big', big);
    toastEl.classList.remove('on');
    void toastEl.offsetWidth;
    toastEl.classList.add('on');
    if (ms) toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms);
  }

  function action(label, onClick) {
    actionEl.innerHTML = '';
    const b = bloodButton(label);
    b.addEventListener('click', () => { b.disabled = true; onClick(); }, { once: true });
    actionEl.appendChild(b);
  }

  function clearAction() { actionEl.innerHTML = ''; }

  return { ammo, objective, song, toast, action, clearAction };
}
