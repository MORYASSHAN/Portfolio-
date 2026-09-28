// The landing page: nav on top, contacts at the bottom, and the portrait rebuilt out of
// small white cubes that breathe a little and drift away from the cursor.
// It opens as a circle growing out of whatever button sent you here.

const home = document.getElementById('home');
const canvas = document.getElementById('portrait');
const ctx = canvas.getContext('2d');

const LEVELS = 24;           // brightness buckets, so each frame is ~24 fills instead of thousands
let cells = [], cell = 6, started = false;
const mouse = { x: -1e4, y: -1e4 };

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// sample the photo into a grid, one cube per cell, sized to fit the canvas box
function build(img) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  const ox = (w - dw) / 2, oy = h - dh;           // sits on the bottom edge
  cell = Math.max(3.5, Math.round(dw / 150 * 2) / 2);
  const cols = Math.floor(dw / cell), rows = Math.floor(dh / cell);

  const tmp = document.createElement('canvas');
  tmp.width = cols; tmp.height = rows;
  const t = tmp.getContext('2d', { willReadFrequently: true });
  t.drawImage(img, 0, 0, cols, rows);
  const data = t.getImageData(0, 0, cols, rows).data;

  cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4;
      let v = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255;
      v = Math.pow(v, 0.9) * 1.6;                 // lift the mids so the cubes read bright
      if (v < 0.08) continue;                    // background and the faint grid drop out
      cells.push({
        x: ox + c * cell, y: oy + r * cell, v: Math.min(v, 1),
        ph: Math.random() * Math.PI * 2, sp: 0.6 + Math.random() * 1.4,
        dx: 0, dy: 0,
        delay: Math.random() * 0.9 + (r / rows) * 0.4,
      });
    }
  }
}

function draw(t0) {
  const buckets = Array.from({ length: LEVELS }, () => []);
  const size = cell - 1;                          // 1px gap keeps the cube grid visible
  const R = 90, R2 = R * R;
  let last = performance.now();

  function frame(now) {
    const e = (now - t0) / 1000, dt = Math.min((now - last) / 1000, 0.05); last = now;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    buckets.forEach((b) => { b.length = 0; });

    for (const p of cells) {
      const inT = Math.min(1, Math.max(0, (e - p.delay) / 0.8));
      if (inT <= 0) continue;
      // cursor pushes cubes aside, they ease back
      const mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
      let tx = 0, ty = 0;
      if (d2 < R2) { const k = (1 - d2 / R2) * 14 / (Math.sqrt(d2) + 1); tx = mx * k; ty = my * k; }
      p.dx += (tx - p.dx) * (1 - Math.exp(-dt * 8));
      p.dy += (ty - p.dy) * (1 - Math.exp(-dt * 8));

      const flicker = 0.86 + 0.14 * Math.sin(e * p.sp + p.ph);
      const lvl = Math.min(LEVELS - 1, Math.floor(p.v * flicker * inT * LEVELS));
      if (lvl > 0) buckets[lvl].push(p);
    }

    for (let l = 1; l < LEVELS; l++) {
      const b = buckets[l];
      if (!b.length) continue;
      const a = l / (LEVELS - 1);
      // cube face
      ctx.fillStyle = `rgba(255,255,255,${(a * 0.92).toFixed(3)})`;
      ctx.beginPath();
      for (const p of b) ctx.rect(p.x + p.dx, p.y + p.dy, size, size);
      ctx.fill();
      // brighter cubes get a tiny top-left highlight so they read as blocks, not flat dots
      if (a > 0.55) {
        ctx.fillStyle = `rgba(255,255,255,${((a - 0.55) * 0.9).toFixed(3)})`;
        ctx.beginPath();
        for (const p of b) ctx.rect(p.x + p.dx, p.y + p.dy, size * 0.45, size * 0.45);
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function startPortrait() {
  if (started) return;
  started = true;
  const img = await loadImage('/assets/shaan.webp');
  build(img);
  draw(performance.now());
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => build(img), 150); });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
}

// open the landing page as a circle growing from (x, y)
export function openHome(x = innerWidth / 2, y = innerHeight / 2) {
  home.hidden = false;
  home.style.setProperty('--x', `${x}px`);
  home.style.setProperty('--y', `${y}px`);
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const anim = home.animate(
    [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }],
    { duration: 1100, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' },
  );
  startPortrait();
  requestAnimationFrame(() => home.classList.add('in'));
  return anim.finished.then(() => { anim.cancel(); home.style.clipPath = 'none'; });
}
