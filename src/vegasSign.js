import * as THREE from 'three';
import { createTargetOutline } from './targetOutline.js';

// "Welcome to Fabulous Las Vegas" roadside sign — the level 2 target.
// Local units are meters; the root sits on the ground, the board faces +z.

const OUTLINE = [[-3.2, 0.05], [-2.5, 1.1], [0, 1.25], [2.5, 1.1], [3.2, 0.05], [2.35, -0.95], [0, -1.32], [-2.35, -0.95]];
const BOARD_Y = 5.2;           // board center height
const HP = 6;                  // hits needed to bring it down
const EXT_X = 3.3, EXT_Y = 1.4;
const TEX_W = 1024, TEX_H = Math.round(TEX_W * EXT_Y / EXT_X);
const M = TEX_W / (2 * EXT_X); // canvas px per meter
const RED = '#e0142d', BLUE = '#1d3fa0';

const toPx = (x, y) => [((x + EXT_X) / (2 * EXT_X)) * TEX_W, (1 - (y + EXT_Y) / (2 * EXT_Y)) * TEX_H];

function polyPath(g, sx = 1, sy = 1) {
  g.beginPath();
  OUTLINE.forEach(([x, y], i) => { const [px, py] = toPx(x * sx, y * sy); g[i ? 'lineTo' : 'moveTo'](px, py); });
  g.closePath();
}

function drawBoard(canvas) {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, TEX_W, TEX_H);
  polyPath(g); g.fillStyle = '#b00d26'; g.fill();                       // red outer lip
  polyPath(g, 0.975, 0.955); g.fillStyle = '#f2c21b'; g.fill();         // yellow bulb band
  polyPath(g, 0.9, 0.8);
  const grd = g.createLinearGradient(0, 0, 0, TEX_H);
  grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, '#ecebe2');
  g.fillStyle = grd; g.fill();
  g.strokeStyle = '#b00d26'; g.lineWidth = 4; g.stroke();

  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = BLUE;
  g.font = `600 ${0.26 * M}px "Oswald", "Arial Narrow", sans-serif`;
  g.fillText('TO', ...toPx(-1.75, 0.42));
  g.font = `italic 700 ${0.56 * M}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive`;
  g.fillText('Fabulous', ...toPx(0.2, 0.44));

  let size = 0.8 * M;
  const big = (s) => `600 ${s}px "Oswald", "Arial Narrow", sans-serif`;
  g.font = big(size);
  while (g.measureText('LAS VEGAS').width > 4.4 * M && size > 30) { size -= 3; g.font = big(size); }
  const [lx, ly] = toPx(0, -0.25);
  g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = '#4a000c';
  g.strokeText('LAS VEGAS', lx, ly);
  g.fillStyle = RED; g.fillText('LAS VEGAS', lx, ly);

  g.fillStyle = BLUE;
  g.font = `600 ${0.25 * M}px "Oswald", "Arial Narrow", sans-serif`;
  g.letterSpacing = `${0.09 * M}px`;
  g.fillText('NEVADA', ...toPx(0.05, -0.82));
  g.letterSpacing = '0px';
}

function drawDisc(canvas, letter) {
  const S = canvas.width, g = canvas.getContext('2d');
  g.clearRect(0, 0, S, S);
  g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2);
  g.fillStyle = '#fbfbf6'; g.fill();
  g.lineWidth = 9; g.strokeStyle = '#c8102e'; g.stroke();
  g.fillStyle = RED; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${S * 0.62}px "Oswald", "Arial Narrow", sans-serif`;
  g.fillText(letter, S / 2, S / 2 + S * 0.03);
}

function drawStar(canvas) {
  const S = canvas.width, g = canvas.getContext('2d');
  g.clearRect(0, 0, S, S);
  g.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? S * 0.14 : S * 0.48;
    g[i ? 'lineTo' : 'moveTo'](S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r);
  }
  g.closePath();
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, '#ffe07a'); grd.addColorStop(0.35, '#ff7a1a'); grd.addColorStop(1, '#8a1208');
  g.fillStyle = grd; g.fill();
  g.lineWidth = 3; g.strokeStyle = '#3a0804'; g.stroke();
}

// bullet hole + radiating cracks, drawn straight onto the board texture
function crackAt(g, u, v) {
  const x = u * TEX_W, y = (1 - v) * TEX_H;
  const sc = g.createRadialGradient(x, y, 0, x, y, 46);
  sc.addColorStop(0, 'rgba(20,10,5,0.55)'); sc.addColorStop(1, 'rgba(20,10,5,0)');
  g.fillStyle = sc; g.fillRect(x - 50, y - 50, 100, 100);
  g.lineCap = 'round';
  const n = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    let a = (i / n) * Math.PI * 2 + Math.random() * 0.5, px = x, py = y;
    const len = 40 + Math.random() * 110;
    g.beginPath(); g.moveTo(px, py);
    for (let s = 0; s < len; s += 8) {
      a += (Math.random() - 0.5) * 0.6;
      px += Math.cos(a) * 8; py += Math.sin(a) * 8;
      g.lineTo(px, py);
    }
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 3.5; g.stroke();
    g.strokeStyle = 'rgba(25,15,15,0.9)'; g.lineWidth = 1.8; g.stroke();
  }
  g.beginPath();
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2, r = 7 + Math.random() * 6;
    g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.closePath(); g.fillStyle = '#050303'; g.fill();
}

export function createVegasSign(scene, glowTex) {
  const root = new THREE.Group();
  const blue = new THREE.MeshStandardMaterial({ color: 0x2456c8, metalness: 0.3, roughness: 0.5 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x15151c, metalness: 0.5, roughness: 0.6 });

  // ---- blue pole frame + star
  const frame = new THREE.Group();
  root.add(frame);
  const poles = [];
  const box = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blue);
    m.position.set(x, y, z); frame.add(m); poles.push(m); return m;
  };
  box(0.24, 8.3, 0.24, -0.75, 4.15, -0.4);
  box(0.24, 8.3, 0.24, 0.75, 4.15, -0.4);
  box(1.74, 0.22, 0.24, 0, 8.2, -0.4);
  box(1.74, 0.18, 0.24, 0, 6.55, -0.4);
  box(3.4, 0.16, 0.8, 0, 0.08, -0.4);

  const starCanvas = document.createElement('canvas'); starCanvas.width = starCanvas.height = 256;
  drawStar(starCanvas);
  const star = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.45),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(starCanvas), transparent: true, side: THREE.DoubleSide }));
  star.position.set(0, 7.38, -0.25);
  frame.add(star);

  // ---- the board
  const board = new THREE.Group();
  board.position.set(0, BOARD_Y, 0);
  root.add(board);
  const shape = new THREE.Shape(OUTLINE.map(([x, y]) => new THREE.Vector2(x, y)));
  const boardCanvas = document.createElement('canvas'); boardCanvas.width = TEX_W; boardCanvas.height = TEX_H;
  drawBoard(boardCanvas);
  const boardTex = new THREE.CanvasTexture(boardCanvas);
  boardTex.anisotropy = 8;
  const frontGeo = new THREE.ShapeGeometry(shape);
  const pos = frontGeo.attributes.position, uv = frontGeo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + EXT_X) / (2 * EXT_X), (pos.getY(i) + EXT_Y) / (2 * EXT_Y));
  const front = new THREE.Mesh(frontGeo, new THREE.MeshBasicMaterial({ map: boardTex }));
  front.position.z = 0.01;
  board.add(front);
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false }), darkMetal);
  back.position.z = -0.26;
  board.add(back);

  // WELCOME discs riding the top edge
  const discs = [...'WELCOME'].map((letter, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    drawDisc(c, letter);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.37, 32), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
    const x = -2.25 + i * 0.75;
    m.position.set(x, 1.12 + 0.1 * (1 - (x / 2.25) ** 2), 0.06);
    m.userData = { canvas: c, tex, letter };
    board.add(m);
    return m;
  });

  // chasing border bulbs
  const ring = OUTLINE.map(([x, y]) => new THREE.Vector2(x * 0.938, y * 0.878));
  const bulbPos = [];
  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length];
    const steps = Math.max(1, Math.round(a.distanceTo(b) / 0.2));
    for (let s = 0; s < steps; s++) bulbPos.push(a.clone().lerp(b, s / steps));
  });
  const bulbGeo = new THREE.BufferGeometry();
  bulbGeo.setAttribute('position', new THREE.Float32BufferAttribute(bulbPos.flatMap((p) => [p.x, p.y, 0.04]), 3));
  const bulbCol = new THREE.Float32BufferAttribute(new Float32Array(bulbPos.length * 3), 3);
  bulbGeo.setAttribute('color', bulbCol);
  const bulbs = new THREE.Points(bulbGeo, new THREE.PointsMaterial({
    size: 0.34, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  board.add(bulbs);
  const bulbAlive = bulbPos.map(() => true);

  // level 2's "shoot this" frame, loose enough to take in the WELCOME discs on top
  const mark = createTargetOutline(OUTLINE, { sx: 1.1, sy: 1.34, width: 0.22 });
  mark.group.position.z = 0.09;
  board.add(mark.group);

  // text redraws once the page font is in
  if (document.fonts) document.fonts.load('600 64px "Oswald"').then(() => {
    drawBoard(boardCanvas); boardTex.needsUpdate = true;
    discs.forEach((d) => { drawDisc(d.userData.canvas, d.userData.letter); d.userData.tex.needsUpdate = true; });
  });

  const signLight = new THREE.PointLight(0xfff0c0, 0, 14, 2);
  signLight.position.set(0, BOARD_Y, 2);
  root.add(signLight);

  // ---- sparks (world space)
  const SPARKS = 320;
  const sparkPos = new Float32Array(SPARKS * 3), sparkCol = new Float32Array(SPARKS * 3);
  const sparkVel = Array.from({ length: SPARKS }, () => new THREE.Vector3());
  const sparkLife = new Float32Array(SPARKS).fill(1);
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
  const sparkPts = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.16, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sparkPts.frustumCulled = false;
  scene.add(sparkPts);
  let sparkCursor = 0;
  function sparks(p, n, power = 1) {
    for (let k = 0; k < n; k++) {
      const i = sparkCursor; sparkCursor = (sparkCursor + 1) % SPARKS;
      sparkPos.set([p.x, p.y, p.z], i * 3);
      sparkVel[i].set((Math.random() - 0.5) * 7, Math.random() * 6, (Math.random() - 0.2) * 6).multiplyScalar(power);
      sparkLife[i] = 0;
    }
  }

  // ---- explosion flash (world space)
  const boomSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(boomSprite);
  const boomLight = new THREE.PointLight(0xff8a30, 0, 40, 1.6);
  scene.add(boomLight);
  let boomT = -1;

  // ---- glass: when the sign dies the whole board bursts like the billboard tiles did
  const GLASS = 900;
  const glassGeo = new THREE.BufferGeometry();
  glassGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.4, 0, 0.55, -0.3, 0, 0.1, 0.6, 0], 3));
  const glassMesh = new THREE.InstancedMesh(glassGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), GLASS);
  glassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  glassMesh.frustumCulled = false;
  glassMesh.visible = false;
  scene.add(glassMesh);
  const glass = [];
  const dummy = new THREE.Object3D(), gc = new THREE.Color();
  const PALETTE = [[1, 1, 0.96], [1, 1, 0.96], [0.95, 0.76, 0.1], [0.88, 0.08, 0.18], [0.12, 0.25, 0.63], [1, 1, 1]];

  function shatterBoard() {
    board.updateMatrixWorld();
    const p = new THREE.Vector3();
    for (let i = 0; i < GLASS; i++) {
      // random point inside the board outline (rejection sample on its bounding box)
      let x, y;
      do { x = (Math.random() - 0.5) * 6.4; y = -1.32 + Math.random() * 2.6; } while (!inside(x, y));
      p.set(x, y, 0.05).applyMatrix4(board.matrixWorld);
      const out = new THREE.Vector3(x * 0.9, y * 0.9 + 1.5, 0).applyQuaternion(root.quaternion);
      glass.push({
        p: p.clone(),
        v: out.add(new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 4, 0).applyQuaternion(root.quaternion))
          .add(new THREE.Vector3(0, 0, 1).applyQuaternion(root.quaternion).multiplyScalar(3 + Math.random() * 7)),
        r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        rv: new THREE.Vector3((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16),
        size: 0.1 + Math.random() * 0.3,
        landed: false,
      });
      const c = Math.random() < 0.15 ? [1, 1, 1] : PALETTE[Math.floor(Math.random() * PALETTE.length)];
      glassMesh.setColorAt(i, gc.setRGB(...c));
    }
    glassMesh.instanceColor.needsUpdate = true;
    glassMesh.visible = true;
    board.visible = false;
  }

  function inside(x, y) {
    let c = false;
    for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
      const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  // ---- state
  let damage = 0, destroyed = false;
  const loose = new Set();     // parts that have been shot off
  const debris = [];
  const tmp = new THREE.Vector3();

  function knockOff(obj) {
    loose.add(obj);
    scene.attach(obj);
    debris.push({
      obj,
      v: new THREE.Vector3((Math.random() - 0.5) * 5, 2.5 + Math.random() * 3.5, 1.5 + Math.random() * 3),
      av: new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14),
      rest: obj === star ? 0.05 : 0.03,
    });
  }

  function collapse() {
    destroyed = true;
    board.getWorldPosition(tmp);
    // loose discs/star go with the blast, the rest of the board turns to glass
    discs.forEach((d) => { if (!loose.has(d)) knockOff(d); });
    if (!loose.has(star)) knockOff(star);
    shatterBoard();
    boomSprite.position.copy(tmp); boomSprite.position.z += 0.5;
    boomLight.position.copy(tmp).add(new THREE.Vector3(0, 0, 2));
    boomT = 0;
    sparks(tmp, 160, 1.8);
  }

  function targets() {
    if (destroyed) return [];
    return [front, ...discs.filter((d) => !loose.has(d)), ...(loose.has(star) ? [] : [star]), ...poles];
  }

  // returns { justDestroyed, damage, hp }
  function hit(obj, point, hitUv) {
    if (destroyed) return { justDestroyed: false, damage, hp: HP };
    sparks(point, 42);
    if (obj === star || discs.includes(obj)) knockOff(obj);
    else if (obj === front && hitUv) {
      crackAt(boardCanvas.getContext('2d'), hitUv.x, hitUv.y);
      boardTex.needsUpdate = true;
      const local = board.worldToLocal(tmp.copy(point));
      bulbPos.forEach((b, i) => { if (Math.hypot(b.x - local.x, b.y - local.y) < 1.15) bulbAlive[i] = false; });
    }
    damage++;
    if (damage >= HP) { collapse(); return { justDestroyed: true, damage, hp: HP }; }
    return { justDestroyed: false, damage, hp: HP };
  }

  // a stray shot in level 1: sparks only
  function ping(point) { sparks(point, 18, 0.7); }

  function update(t, dt, power, marking = 0) {
    mark.update(t, destroyed ? 0 : marking);
    const lit = 0.07 + 0.93 * power;
    const shaky = damage >= 3 && !destroyed && Math.random() < 0.1 ? 0.35 : 1;
    const bright = destroyed ? lit * 0.4 : lit * shaky;
    front.material.color.setScalar(bright);
    discs.forEach((d) => d.material.color.setScalar(loose.has(d) ? lit * 0.6 : bright));
    star.material.color.setScalar(lit * (0.85 + 0.15 * Math.sin(t * 3)));
    signLight.intensity = destroyed ? 0 : 30 * power * shaky;

    const chase = Math.floor(t * 11);
    for (let i = 0; i < bulbPos.length; i++) {
      let v = 0;
      if (bulbAlive[i] && !destroyed) {
        v = ((i + chase) % 3 === 0 ? 1 : 0.4) * power * shaky;
        if (damage && Math.random() < 0.015 * damage) v = 0;
      }
      bulbCol.setXYZ(i, v, v * 0.82, v * 0.42);
    }
    bulbCol.needsUpdate = true;

    // sparks
    for (let i = 0; i < SPARKS; i++) {
      if (sparkLife[i] >= 1) { sparkCol[i * 3] = sparkCol[i * 3 + 1] = sparkCol[i * 3 + 2] = 0; continue; }
      sparkLife[i] += dt * 1.6;
      const vel = sparkVel[i];
      vel.y -= 9.8 * dt;
      sparkPos[i * 3] += vel.x * dt; sparkPos[i * 3 + 1] += vel.y * dt; sparkPos[i * 3 + 2] += vel.z * dt;
      if (sparkPos[i * 3 + 1] < 0.02) { sparkPos[i * 3 + 1] = 0.02; vel.y *= -0.3; vel.x *= 0.6; vel.z *= 0.6; }
      const f = 1 - sparkLife[i];
      sparkCol[i * 3] = f; sparkCol[i * 3 + 1] = f * f * 0.75; sparkCol[i * 3 + 2] = f * f * f * 0.3;
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;

    // parts that were shot off
    debris.forEach((d) => {
      if (d.landed) return;
      d.v.y -= 9.8 * dt;
      d.obj.position.addScaledVector(d.v, dt);
      d.obj.rotation.x += d.av.x * dt; d.obj.rotation.y += d.av.y * dt; d.obj.rotation.z += d.av.z * dt;
      if (d.obj.position.y <= d.rest) {
        d.obj.position.y = d.rest; d.landed = true;
        d.obj.rotation.set(-Math.PI / 2, 0, Math.random() * 6);
        sparks(d.obj.position, 10, 0.5);
      }
    });

    if (glassMesh.visible) {
      glass.forEach((g, i) => {
        if (!g.landed) {
          g.v.y -= 9.8 * dt;
          g.p.addScaledVector(g.v, dt);
          g.r.x += g.rv.x * dt; g.r.y += g.rv.y * dt; g.r.z += g.rv.z * dt;
          if (g.p.y <= 0.02) { g.p.y = 0.02; g.landed = true; g.r.set(-Math.PI / 2, 0, Math.random() * 6); }
        }
        dummy.position.copy(g.p); dummy.rotation.copy(g.r); dummy.scale.setScalar(g.size);
        dummy.updateMatrix();
        glassMesh.setMatrixAt(i, dummy.matrix);
      });
      glassMesh.instanceMatrix.needsUpdate = true;
    }

    if (boomT >= 0) {
      boomT += dt;
      const p = boomT / 0.9;
      boomSprite.scale.setScalar(4 + p * 22);
      boomSprite.material.opacity = Math.max(0, 1 - p) * 0.95;
      boomLight.intensity = Math.max(0, 1 - boomT / 1.6) * 700;
      if (boomT > 1.6) { boomT = -1; boomLight.intensity = 0; }
    }
  }

  return { group: root, targets, hit, ping, update, get destroyed() { return destroyed; } };
}
