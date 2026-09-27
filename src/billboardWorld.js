import * as THREE from 'three';
import { createVegasSign } from './vegasSign.js';

// The background photo is composited raw (no color conversion), so the 3D layer works in the
// same display space: no linear conversion of colors/textures, output straight to the target.
THREE.ColorManagement.enabled = false;

// World units are meters. Camera stands on the road at eye height looking down the Strip;
// its projection is locked to the background photo (see setView) so objects sit on the real road.
const EYE = 1.6;
const IMG_FOV = 50;            // vertical field of view the full photo represents
const BB_Z = -30;              // billboard distance
const BB_SIZE = 10.5;          // photo panel is BB_SIZE x BB_SIZE
const BB_BOTTOM = 4;           // panel bottom height
const RED = 0xff2d55;

const GOSSIP = [
  'yo… is that him?', 'who put that up??', "that's Shaan", 'the road is wrecked, bro',
  'look at the size of it', 'no way…', "psst, don't stare", 'heard something big is coming',
  'somebody cracked the whole street', 'wild night', 'is it gonna fall?', 'take a pic, quick',
];

const SHOUTS = ['RUN!!', 'GET DOWN!', "HE'S GOT A GUN!", 'OH MY GOD', 'MOVE!', 'GO GO GO!', 'AAAH!', 'CALL THE COPS!'];

// what sits behind each photo tile (row-major, center = name)
const BEHIND = [
  { label: 'Designer', color: '#ff3fa4' },
  { label: 'Full Stack', color: '#3ff4ff' },
  { label: 'System Design', color: '#ffb347' },
  { label: 'Growth', color: '#b46bff' },
  { label: 'SHAAN', color: '#ff2d55', name: true },
  { label: 'Storyteller', color: '#ff5a5a' },
  { label: 'Forward Deploy', color: '#4dff9a' },
  { label: 'AI Agents', color: '#3ff4ff' },
  { label: 'Writer', color: '#ff3fa4' },
];

function drawPanel(canvas, { label, color, name }) {
  const S = canvas.width, g = canvas.getContext('2d');
  g.clearRect(0, 0, S, S);
  g.fillStyle = '#07040c'; g.fillRect(0, 0, S, S);
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.7);
  grd.addColorStop(0, color + '33'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);

  const words = name ? [label] : label.split(' ');
  let size = name ? 150 : 96;
  const font = (s) => `600 ${s}px "Oswald", "Arial Narrow", sans-serif`;
  g.font = font(size);
  while (words.some((w) => g.measureText(w).width > S * 0.84) && size > 40) { size -= 4; g.font = font(size); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const lh = size * 1.05, y0 = S / 2 - ((words.length - 1) * lh) / 2;
  if (name) g.letterSpacing = '12px';
  words.forEach((w, i) => {
    const y = y0 + i * lh;
    g.fillStyle = color; g.shadowColor = color;
    g.shadowBlur = 40; g.fillText(w.toUpperCase(), S / 2, y);
    g.shadowBlur = 16; g.fillText(w.toUpperCase(), S / 2, y);
    g.shadowBlur = 3; g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillText(w.toUpperCase(), S / 2, y);
  });
  g.shadowBlur = 0;
}

function crackTexture() {
  const W = 1024, H = 768;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.lineCap = 'round'; g.lineJoin = 'round';

  // plane spans x -20..20, z -17..-43  ->  pole bases at x=±3, z=-30
  const toPx = (x, z) => [((x + 20) / 40) * W, ((z + 43) / 26) * H];
  const bases = [toPx(-3, BB_Z), toPx(3, BB_Z), toPx(0, BB_Z + 2)];

  // broken asphalt patches around the poles
  bases.forEach(([bx, by]) => {
    for (let i = 0; i < 5; i++) {
      const cx = bx + (Math.random() - 0.5) * 120, cy = by + (Math.random() - 0.5) * 80;
      g.beginPath();
      const n = 7 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2, r = 18 + Math.random() * 30;
        g[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r);
      }
      g.closePath();
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fill();
      g.strokeStyle = 'rgba(160,140,170,0.25)'; g.lineWidth = 2; g.stroke();
    }
  });

  function crack(x, y, ang, len, width, depth) {
    g.beginPath(); g.moveTo(x, y);
    let px = x, py = y;
    const pts = [[x, y]];
    for (let s = 0; s < len; s += 10) {
      ang += (Math.random() - 0.5) * 0.7;
      px += Math.cos(ang) * 10; py += Math.sin(ang) * 10 * 0.75;
      pts.push([px, py]);
      g.lineTo(px, py);
      if (depth < 2 && Math.random() < 0.06) crack(px, py, ang + (Math.random() - 0.5) * 1.8, len * 0.45, width * 0.6, depth + 1);
    }
    // light edge (broken asphalt catches neon), then dark gap
    g.strokeStyle = 'rgba(210,190,230,0.22)'; g.lineWidth = width + 2.5; g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.92)'; g.lineWidth = width; g.stroke();
  }
  bases.forEach(([bx, by]) => {
    for (let i = 0; i < 9; i++) crack(bx, by, Math.random() * Math.PI * 2, 160 + Math.random() * 320, 3 + Math.random() * 3, 0);
  });
  for (let i = 0; i < 10; i++) {
    crack(Math.random() * W, Math.random() * H, Math.random() * Math.PI * 2, 80 + Math.random() * 180, 1.5 + Math.random() * 2, 1);
  }

  // fade out at the edges so it melts into the photo
  g.globalCompositeOperation = 'destination-in';
  const grd = g.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, W * 0.52);
  grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);

  return new THREE.CanvasTexture(c);
}

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.3, 'rgba(255,255,255,0.4)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function coneTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,0.9)'); v.addColorStop(0.5, 'rgba(255,255,255,0.3)'); v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v;
  g.filter = 'blur(7px)';
  g.beginPath(); g.moveTo(28, 250); g.lineTo(36, 250); g.lineTo(54, 10); g.lineTo(10, 10); g.closePath(); g.fill();
  return new THREE.CanvasTexture(c);
}

function buildBillboard(photo, glowTex) {
  const bb = new THREE.Group();
  bb.position.set(0, 0, BB_Z);

  const metal = new THREE.MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.7, roughness: 0.45 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0c0c10, metalness: 0.4, roughness: 0.7 });
  const cy = BB_BOTTOM + BB_SIZE / 2;

  // back frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(BB_SIZE + 0.7, BB_SIZE + 0.7, 0.45), metal);
  frame.position.set(0, cy, -0.3);
  bb.add(frame);

  // 9 photo tiles, slightly cracked out of line
  const tiles = [], panels = [];
  const t = BB_SIZE / 3, gap = 0.09, inset = 0.004;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const geo = new THREE.PlaneGeometry(t - gap, t - gap);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        uv.setXY(i, (c + inset * 3 + u * (1 - inset * 6)) / 3, (2 - r + inset * 3 + v * (1 - inset * 6)) / 3);
      }
      const mat = new THREE.MeshBasicMaterial({ map: photo, color: 0x111111 });
      const tile = new THREE.Mesh(geo, mat);
      const backing = new THREE.Mesh(new THREE.BoxGeometry(t - gap, t - gap, 0.1), dark);
      backing.position.z = -0.06;
      const holder = new THREE.Group();
      holder.add(backing, tile);
      holder.position.set((c - 1) * t, cy + (1 - r) * t, 0.02 + (Math.random() - 0.5) * 0.08);
      holder.rotation.set((Math.random() - 0.5) * 0.035, (Math.random() - 0.5) * 0.035, (Math.random() - 0.5) * 0.02);
      holder.userData = { index: r * 3 + c };
      bb.add(holder);
      tiles.push(holder);

      // skill panel hidden behind the tile, revealed when the tile is shot
      const pc = document.createElement('canvas'); pc.width = pc.height = 512;
      drawPanel(pc, BEHIND[r * 3 + c]);
      const ptex = new THREE.CanvasTexture(pc);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(t - gap, t - gap), new THREE.MeshBasicMaterial({ map: ptex }));
      panel.position.set((c - 1) * t, cy + (1 - r) * t, -0.06);
      panel.visible = false;
      panel.userData = { canvas: pc, tex: ptex, info: BEHIND[r * 3 + c], revealedAt: -1 };
      bb.add(panel);
      panels.push(panel);
    }
  }

  // red neon tube around the panel
  const neonMat = new THREE.MeshBasicMaterial({ color: RED });
  const half = BB_SIZE / 2 + 0.22, tube = 0.08;
  [[0, half, BB_SIZE + 0.52, tube], [0, -half, BB_SIZE + 0.52, tube], [half, 0, tube, BB_SIZE + 0.52], [-half, 0, tube, BB_SIZE + 0.52]]
    .forEach(([x, y, w, h]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, tube), neonMat);
      m.position.set(x, cy + y, 0.1);
      bb.add(m);
    });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: RED, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(BB_SIZE * 2.1, BB_SIZE * 2.1, 1);
  halo.position.set(0, cy, -0.6);
  bb.add(halo);

  // catwalk + railing
  const walkY = BB_BOTTOM - 0.45;
  const walk = new THREE.Mesh(new THREE.BoxGeometry(BB_SIZE + 1.2, 0.12, 1.3), metal);
  walk.position.set(0, walkY, 0.55);
  bb.add(walk);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(BB_SIZE + 1.2, 0.05, 0.05), metal);
  rail.position.set(0, walkY + 0.9, 1.15);
  bb.add(rail);
  for (let i = 0; i <= 8; i++) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.05), metal);
    post.position.set(-(BB_SIZE + 1.2) / 2 + (i / 8) * (BB_SIZE + 1.2), walkY + 0.45, 1.15);
    bb.add(post);
  }

  // poles + cross brace
  [-3, 3].forEach((x) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, walkY, 16), metal);
    pole.position.set(x, walkY / 2, -0.2);
    bb.add(pole);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.35, 16), dark);
    foot.position.set(x, 0.17, -0.2);
    bb.add(foot);
  });
  const brace = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 0.25), metal);
  brace.position.set(0, walkY * 0.55, -0.2);
  bb.add(brace);

  // spotlights on the catwalk, washing up the panel
  const lamps = [];
  const coneTex = coneTexture();
  [-3.9, -1.3, 1.3, 3.9].forEach((x) => {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.3), dark);
    head.position.set(x, walkY + 0.25, 1.05);
    head.rotation.x = -0.5;
    bb.add(head);
    const bulb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1d6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    bulb.scale.set(1.1, 1.1, 1);
    bulb.position.set(x, walkY + 0.35, 1.2);
    bb.add(bulb);
    const cone = new THREE.Mesh(new THREE.PlaneGeometry(3.2, BB_SIZE * 0.8), new THREE.MeshBasicMaterial({
      map: coneTex, color: 0xffe6c4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }));
    cone.position.set(x, walkY + 0.3 + BB_SIZE * 0.4, 0.6);
    cone.rotation.x = -0.08;
    bb.add(cone);
    lamps.push({ bulb, cone });
  });

  return { group: bb, tiles, panels, neonMat, halo, lamps };
}

function makePerson(rng) {
  const p = new THREE.Group();
  const clothes = [0x1b1b24, 0x2a1420, 0x14202a, 0x2b2b2b, 0x3a1010, 0x1e2a1a][Math.floor(rng() * 6)];
  const pants = [0x101014, 0x1a1a2a, 0x222222][Math.floor(rng() * 3)];
  const skin = [0x8a5a44, 0x6b4432, 0xb07c62, 0x4a2e22][Math.floor(rng() * 4)];
  const cloth = new THREE.MeshStandardMaterial({ color: clothes, roughness: 0.8 });
  const leg = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.9 });
  const skinM = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 });

  const legs = [-0.1, 0.1].map((x) => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.87, 0);
    const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.72, 3, 8), leg);
    l.position.y = -0.43;
    hip.add(l);
    p.add(hip);
    return hip;
  });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), cloth);
  torso.position.y = 1.16; torso.scale.z = 0.7;
  p.add(torso);
  const head = new THREE.Group();
  head.position.y = 1.6;
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), skinM));
  p.add(head);
  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.26, 1.38, 0);
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 3, 8), cloth);
    a.position.y = -0.3;
    pivot.add(a);
    pivot.rotation.z = side * 0.08;
    p.add(pivot);
    return pivot;
  });
  const s = 0.72 + rng() * 0.12;
  p.scale.setScalar(s);
  return { root: p, torso, head, arms, legs, phase: rng() * 10 };
}

export function createBillboardWorld() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(IMG_FOV, 1, 0.1, 300);
  const camBase = new THREE.Vector3(0, EYE, 0);
  camera.position.copy(camBase);

  scene.add(new THREE.HemisphereLight(0x9a6cff, 0x3a1020, 1.1));
  const pink = new THREE.DirectionalLight(0xff4fb0, 2.2); pink.position.set(-10, 6, 4); scene.add(pink);
  const cyan = new THREE.DirectionalLight(0x40b8ff, 1.6); cyan.position.set(10, 5, 2); scene.add(cyan);
  const warm = new THREE.DirectionalLight(0xffb070, 0.8); warm.position.set(0, 3, 10); scene.add(warm);
  const bbLight = new THREE.PointLight(0xffd0d8, 0, 0, 2); bbLight.position.set(0, 7, BB_Z + 6); scene.add(bbLight);

  const glowTex = glowTexture();
  const photo = new THREE.TextureLoader().load('/assets/billboard.webp');
  photo.anisotropy = 8;

  // cracked road decal (drawn first, flat on the asphalt)
  const cracks = new THREE.Mesh(new THREE.PlaneGeometry(40, 26), new THREE.MeshBasicMaterial({ map: crackTexture(), transparent: true, depthWrite: false }));
  cracks.rotation.x = -Math.PI / 2;
  cracks.position.set(0, 0.01, -30);
  cracks.renderOrder = -2;
  scene.add(cracks);

  // rubble chunks around the poles
  const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x1c1a20, roughness: 1 });
  for (let i = 0; i < 26; i++) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.22, 0), rubbleMat);
    const side = Math.random() < 0.5 ? -3 : 3;
    r.position.set(side + (Math.random() - 0.5) * 4, 0.05, BB_Z + (Math.random() - 0.3) * 4);
    r.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    r.scale.y = 0.5;
    scene.add(r);
  }

  const board = buildBillboard(photo, glowTex);
  scene.add(board.group);

  // "Welcome to Fabulous Las Vegas" on the right-hand sidewalk, turned toward the road
  const sign = createVegasSign(scene, glowTex);
  sign.group.position.set(7.6, 0, -15.5);
  sign.group.rotation.y = -0.42;
  scene.add(sign.group);
  // panel text uses the page font; redraw once it has loaded
  if (document.fonts) document.fonts.load('600 64px "Oswald"').then(() => {
    board.panels.forEach((pn) => { drawPanel(pn.userData.canvas, pn.userData.info); pn.userData.tex.needsUpdate = true; });
  });

  // small crowds on the road, looking up and gossiping
  let seed = 7;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const shadowMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false });
  const groupsDef = [
    [-5.2, -21, 3], [4.2, -20, 2], [-1.2, -18.5, 2], [7.6, -25.5, 3], [-8.2, -26.5, 2], [2.2, -26, 2],
  ];
  const people = [];
  const groups = groupsDef.map(([gx, gz, n], gi) => {
    const members = [];
    for (let i = 0; i < n; i++) {
      const person = makePerson(rng);
      const a = (i / n) * Math.PI * 2 + gi;
      const rad = n === 2 ? 0.45 : 0.6;
      person.root.position.set(gx + Math.cos(a) * rad, 0, gz + Math.sin(a) * rad);
      // half the crowd faces each other, the rest turns toward the billboard
      const lookAtBoard = rng() < 0.5;
      const target = lookAtBoard ? new THREE.Vector3(0, 0, BB_Z) : new THREE.Vector3(gx, 0, gz);
      person.root.lookAt(target.x, 0, target.z);
      person.lookUp = lookAtBoard;
      person.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), shadowMat);
      person.shadow.rotation.x = -Math.PI / 2;
      person.shadow.position.set(person.root.position.x, 0.015, person.root.position.z);
      scene.add(person.shadow, person.root);
      members.push(person);
      people.push(person);
    }
    return { center: new THREE.Vector3(gx, 1.75, gz), members, talker: 0, nextSwitch: 0 };
  });

  // ---- gossip bubbles (HTML, projected over the scene)
  const layer = document.createElement('div');
  layer.className = 'gossip-layer';
  (document.getElementById('stage') || document.body).appendChild(layer);
  const bubbles = groups.map((g) => {
    const el = document.createElement('div');
    el.className = 'gossip';
    layer.appendChild(el);
    return { el, group: g, until: 0, next: 1500 + Math.random() * 4000 };
  });
  let gossipOn = false;
  let panicking = false;

  // ---- glass shards (single instanced mesh, capped; they land and stay on the road)
  const SHARD_MAX = 720;
  const shardGeo = new THREE.BufferGeometry();
  shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.4, 0, 0.55, -0.3, 0, 0.1, 0.6, 0], 3));
  const shardMesh = new THREE.InstancedMesh(shardGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), SHARD_MAX);
  shardMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  shardMesh.frustumCulled = false;
  scene.add(shardMesh);
  const dummy = new THREE.Object3D(), tmpColor = new THREE.Color();
  const shards = [];
  for (let i = 0; i < SHARD_MAX; i++) {
    shards.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), rv: new THREE.Vector3(), size: 0, landed: true });
    dummy.scale.setScalar(0); dummy.updateMatrix();
    shardMesh.setMatrixAt(i, dummy.matrix);
    shardMesh.setColorAt(i, tmpColor.setRGB(0, 0, 0));
  }
  let shardCursor = 0;
  const flashes = [];

  function shatter(holder) {
    const world = new THREE.Vector3();
    holder.getWorldPosition(world);
    const t = BB_SIZE / 3;
    for (let k = 0; k < 90; k++) {
      const i = shardCursor; shardCursor = (shardCursor + 1) % SHARD_MAX;
      const sh = shards[i];
      const lx = (Math.random() - 0.5) * t, ly = (Math.random() - 0.5) * t;
      sh.p.set(world.x + lx, world.y + ly, world.z + 0.2);
      sh.v.set(lx * 1.6 + (Math.random() - 0.5) * 3, ly * 1.2 + Math.random() * 3, 2 + Math.random() * 6);
      sh.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      sh.rv.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14);
      sh.size = 0.12 + Math.random() * 0.35;
      sh.landed = false;
      // pieces of the photo: dark reds, blacks, and bright glass glints
      const roll = Math.random();
      if (roll > 0.82) tmpColor.setRGB(1, 0.95, 0.95);
      else if (roll > 0.5) tmpColor.setRGB(0.45 + Math.random() * 0.3, 0.05, 0.07);
      else tmpColor.setRGB(0.08, 0.05, 0.06).multiplyScalar(1 + Math.random());
      shardMesh.setColorAt(i, tmpColor);
    }
    if (shardMesh.instanceColor) shardMesh.instanceColor.needsUpdate = true;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe8e0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.copy(world); sp.position.z += 0.4;
    scene.add(sp);
    flashes.push({ sprite: sp, t: 0 });
  }

  function updateShards(dt) {
    for (let i = 0; i < SHARD_MAX; i++) {
      const sh = shards[i];
      if (sh.landed) continue;
      sh.v.y -= 9.8 * dt;
      sh.p.addScaledVector(sh.v, dt);
      sh.r.x += sh.rv.x * dt; sh.r.y += sh.rv.y * dt; sh.r.z += sh.rv.z * dt;
      if (sh.p.y <= 0.02) {
        // settle flat on the asphalt
        sh.p.y = 0.02; sh.landed = true;
        sh.r.set(-Math.PI / 2, 0, Math.random() * 6);
      }
      dummy.position.copy(sh.p); dummy.rotation.copy(sh.r); dummy.scale.setScalar(sh.size);
      dummy.updateMatrix();
      shardMesh.setMatrixAt(i, dummy.matrix);
    }
    shardMesh.instanceMatrix.needsUpdate = true;
    for (let j = flashes.length - 1; j >= 0; j--) {
      const f = flashes[j]; f.t += dt;
      const p = f.t / 0.35;
      f.sprite.scale.setScalar(3 + p * 9);
      f.sprite.material.opacity = Math.max(0, 1 - p);
      if (p >= 1) { scene.remove(f.sprite); f.sprite.material.dispose(); flashes.splice(j, 1); }
    }
  }

  // ---- panic: everybody runs off
  let panicAt = 0;
  function panic(nowMs) {
    if (panicking) return;
    panicking = true;
    panicAt = nowMs;
    gossipOn = false;
    // bubbles switch from gossip to shouting, each one riding on a runner
    bubbles.forEach((b, i) => {
      b.until = 0;
      b.el.classList.remove('on');
      b.el.classList.add('shout');
      b.person = people[(i * 3 + 1) % people.length];
      b.next = nowMs + 150 + Math.random() * 700;
    });
    people.forEach((p) => {
      const side = p.root.position.x + (Math.random() - 0.5) * 3 >= 0 ? 1 : -1;
      p.dir = new THREE.Vector3(side * (0.7 + Math.random() * 0.5), 0, (Math.random() - 0.35) * 0.9).normalize();
      p.speed = 4.5 + Math.random() * 2.5;
      p.delay = Math.random() * 0.35;
      p.running = true;
      p.root.rotation.set(0, Math.atan2(p.dir.x, p.dir.z), 0);
    });
  }

  function updateRunners(t, dt) {
    people.forEach((p) => {
      if (!p.running) return;
      if (p.delay > 0) { p.delay -= dt; return; }
      p.root.position.addScaledVector(p.dir, p.speed * dt);
      p.shadow.position.set(p.root.position.x, 0.015, p.root.position.z);
      const ph = t * 13 + p.phase;
      p.legs[0].rotation.x = Math.sin(ph) * 0.9;
      p.legs[1].rotation.x = -Math.sin(ph) * 0.9;
      p.arms[0].rotation.x = -Math.sin(ph) * 0.8;
      p.arms[1].rotation.x = Math.sin(ph) * 0.8;
      p.torso.rotation.set(0.25, 0, 0);
      p.head.rotation.set(0.1, 0, 0);
      p.root.position.y = Math.abs(Math.sin(ph)) * 0.08;
      if (Math.abs(p.root.position.x) > 40) { p.root.visible = false; p.shadow.visible = false; p.running = false; }
    });
  }

  // ---- shooting. Level 1: billboard tiles. Level 2: the Welcome sign.
  const raycaster = new THREE.Raycaster(), ndcV = new THREE.Vector2();
  const alive = new Set(board.tiles);
  let level = 1;
  function shoot(ndcX, ndcY, nowMs) {
    panic(nowMs);
    camera.updateMatrixWorld();
    ndcV.set(ndcX, ndcY);
    raycaster.setFromCamera(ndcV, camera);

    if (level === 2) {
      const hit = raycaster.intersectObjects(sign.targets(), false)[0];
      if (!hit) return { hit: false, kind: null };
      return { hit: true, kind: 'sign', ...sign.hit(hit.object, hit.point, hit.uv) };
    }

    const faces = [...alive].map((h) => h.children[1]);
    const hit = raycaster.intersectObjects(faces, false)[0];
    if (!hit) {
      const stray = raycaster.intersectObjects(sign.targets(), false)[0];
      if (stray) sign.ping(stray.point);
      return { hit: false, kind: stray ? 'ping' : null, tilesLeft: alive.size };
    }
    const holder = hit.object.parent;
    alive.delete(holder);
    shatter(holder);
    board.group.remove(holder);
    const panel = board.panels[holder.userData.index];
    panel.visible = true;
    panel.userData.revealedAt = nowMs;
    return { hit: true, kind: 'tile', tilesLeft: alive.size };
  }

  function setLevel(n) { level = n; }

  // ---- power-on state
  let power = 0, powerStart = -1;

  function setView(width, height, fovScreen, hx, hy) {
    camera.aspect = width / height;
    camera.fov = fovScreen;
    camera.updateProjectionMatrix();
    // lens shift so the camera's horizon/vanishing point lands on the photo's
    camera.projectionMatrix.elements[8] = -hx;
    camera.projectionMatrix.elements[9] = -hy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }

  const tmp = new THREE.Vector3();
  let lastT = 0;
  function update(t, mouse, nowMs) {
    const dt = Math.min(t - lastT, 0.05); lastT = t;
    // parallax: nearer things slide more, matching the photo's fake depth
    camera.position.set(camBase.x - mouse.x * 0.22, camBase.y - mouse.y * 0.1, camBase.z);

    // lights flicker on once the show starts
    if (powerStart >= 0) {
      const e = (nowMs - powerStart) / 1000;
      const flick = e < 1.3 ? (Math.random() < 0.35 + e * 0.45 ? 1 : 0.15) : 1;
      power = Math.min(1, e / 1.3) * flick;
    }
    const hum = 0.94 + 0.06 * Math.sin(t * 7.3) * Math.sin(t * 1.7);
    const lit = 0.07 + 0.93 * power;
    board.tiles.forEach((h) => h.children[1].material.color.setScalar(lit * (0.96 + 0.04 * hum)));
    board.neonMat.color.setHex(RED).multiplyScalar(0.25 + 0.75 * power * hum);
    board.halo.material.opacity = 0.07 * power * hum;
    board.lamps.forEach(({ bulb, cone }) => { bulb.material.opacity = 0.8 * power; cone.material.opacity = 0.05 * power; });
    bbLight.intensity = 260 * power;

    // revealed panels ignite like neon, then hum
    board.panels.forEach((pn) => {
      if (!pn.visible) return;
      const e = (nowMs - pn.userData.revealedAt) / 1000;
      const on = e < 0.7 ? (Math.random() < 0.3 + e ? 1 : 0.2) : 0.93 + 0.07 * hum;
      pn.material.color.setScalar(on * lit);
    });

    // idle crowd animation (until they panic)
    if (!panicking) {
      groups.forEach((g) => {
        if (nowMs > g.nextSwitch) { g.talker = Math.floor(Math.random() * g.members.length); g.nextSwitch = nowMs + 1800 + Math.random() * 2600; }
        g.members.forEach((p, i) => {
          const ph = t + p.phase;
          p.torso.rotation.z = Math.sin(ph * 0.9) * 0.03;
          p.head.rotation.y = Math.sin(ph * 0.5) * 0.35;
          p.head.rotation.x = p.lookUp ? -0.45 + Math.sin(ph * 0.3) * 0.08 : Math.sin(ph * 0.7) * 0.06;
          const talking = i === g.talker;
          const ph5 = t * 5 + p.phase;
          const pointing = p.lookUp && talking && Math.sin(t * 0.4 + p.phase) > 0.6;
          const [left, right] = p.arms;
          right.rotation.x = pointing ? -2.5 : talking ? -0.5 - 0.35 * Math.max(0, Math.sin(ph5)) : 0.05 * Math.sin(ph5 * 0.2);
          left.rotation.x = talking && !pointing ? -0.25 - 0.25 * Math.max(0, Math.sin(ph5 + 1.7)) : 0;
          p.head.position.y = 1.6 + (talking ? Math.abs(Math.sin(ph5 * 1.3)) * 0.015 : 0);
        });
      });
    }
    updateRunners(t, dt);
    updateShards(dt);
    sign.update(t, dt, power);

    // gossip bubbles
    if (gossipOn) {
      const w = window.innerWidth, h = window.innerHeight;
      let showing = bubbles.filter((b) => b.until).length;
      bubbles.forEach((b) => {
        if (b.until && nowMs > b.until) { b.until = 0; showing--; b.el.classList.remove('on'); b.next = nowMs + 2500 + Math.random() * 5000; }
        if (!b.until && nowMs > b.next && showing < 2) {
          showing++;
          b.el.textContent = GOSSIP[Math.floor(Math.random() * GOSSIP.length)];
          b.el.classList.add('on');
          b.until = nowMs + 2400 + Math.random() * 1200;
        }
        tmp.copy(b.group.center).project(camera);
        b.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%, -100%)`;
      });
    }

    // shouting while they run (first few seconds of the panic)
    if (panicking) {
      const w = window.innerWidth, h = window.innerHeight;
      const shouting = nowMs - panicAt < 5500;
      bubbles.forEach((b) => {
        const p = b.person;
        if (b.until && (nowMs > b.until || !p.root.visible)) { b.until = 0; b.el.classList.remove('on'); b.next = nowMs + 500 + Math.random() * 1200; }
        if (shouting && !b.until && nowMs > b.next && p.root.visible) {
          b.el.textContent = SHOUTS[Math.floor(Math.random() * SHOUTS.length)];
          b.el.classList.add('on');
          b.until = nowMs + 900 + Math.random() * 500;
        }
        tmp.set(p.root.position.x, 1.5, p.root.position.z).project(camera);
        b.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%, -100%)`;
      });
    }
  }

  function powerOn(nowMs) {
    powerStart = nowMs;
    gossipOn = true;
    bubbles.forEach((b) => { b.next = nowMs + 900 + Math.random() * 3000; });
  }

  return { scene, camera, setView, update, powerOn, shoot, setLevel };
}

