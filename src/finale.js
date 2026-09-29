import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { glassBreak, switchOn } from './sound.js';
import { createStory, STORY_LEN } from './story.js';
import { fetchWithProgress } from './preload.js';

// After the sign goes: the whole screen breaks like glass and falls away, revealing a dark stage
// with FROM SHAAN standing on a mirror floor. Scrolling drives the camera until the whole video is on screen,
// then the video drops to the background and the story lines play over it.

const video = document.getElementById('finale-video');
const SW = 12, SH = SW * 9 / 16;               // video screen size
const SCREEN_Y = 3.4, SCREEN_Z = -2;           // where it ends up
const FOV = 42;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// The whole video is downloaded into memory while the show runs, so the finale plays and loops it
// without ever stopping to buffer (streaming a 17 MB 1080p file stutters on slower connections).
const VIDEO_SRC = '/video/rb22.mp4';
let fetching = null;
// onBytes(received, total) feeds the loading ring; returns a promise that settles when it's in memory
export function preloadFinale(onBytes) {
  if (fetching) return fetching;
  fetching = fetchWithProgress(VIDEO_SRC, onBytes)
    .then((blob) => {
      const t = video.currentTime, wasPlaying = video.src && !video.paused;
      video.src = URL.createObjectURL(blob);
      if (wasPlaying) {   // the finale already started on the streamed copy: carry on from the same frame
        video.addEventListener('loadedmetadata', () => { video.currentTime = t; video.play().catch(() => {}); }, { once: true });
      }
    })
    .catch(() => {});      // network trouble: the finale just streams it instead (useVideo)
  return fetching;
}

// called when the finale needs the video: if the download hasn't finished yet, stream it meanwhile
function useVideo() {
  if (video.src) return;
  video.preload = 'auto';
  video.src = VIDEO_SRC;
}

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,0.35)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// ---- the broken screen: polar cells around the last bullet, textured with the final frame
function buildShards(snap, ix, iy, aspect) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  const D = 10;
  const H = 2 * D * Math.tan(THREE.MathUtils.degToRad(22.5)), W = H * aspect;
  const cx = (ix / window.innerWidth - 0.5) * W, cy = (0.5 - iy / window.innerHeight) * H;

  const RAYS = 18;
  const RINGS = [0, 0.22, 0.55, 1, 1.65, 2.5, 3.7, 5.4, 8, 12, 22];
  const angles = Array.from({ length: RAYS }, (_, k) => (k / RAYS) * Math.PI * 2 + (Math.random() - 0.5) * 0.25);
  const pt = RINGS.map((r, j) => angles.map((a) => {
    if (!j) return new THREE.Vector2(cx, cy);
    const rr = r * (1 + (Math.random() - 0.5) * 0.18), aa = a + (Math.random() - 0.5) * 0.1;
    return new THREE.Vector2(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr);
  }));

  // crack lines drawn straight into the frame
  const g = snap.getContext('2d');
  const px = (p) => [((p.x / W) + 0.5) * snap.width, (0.5 - p.y / H) * snap.height];
  const lw = snap.width / window.innerWidth;
  const line = (a, b) => {
    g.beginPath(); g.moveTo(...px(a)); g.lineTo(...px(b));
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2.4 * lw; g.stroke();
    g.strokeStyle = 'rgba(10,10,14,0.85)'; g.lineWidth = 1 * lw; g.stroke();
  };
  for (let j = 0; j < RINGS.length - 1; j++) {
    for (let k = 0; k < RAYS; k++) {
      line(pt[j][k], pt[j + 1][k]);
      if (j) line(pt[j][k], pt[j][(k + 1) % RAYS]);
    }
  }
  const [hx, hy] = px(new THREE.Vector2(cx, cy));
  const hole = g.createRadialGradient(hx, hy, 0, hx, hy, 40 * lw);
  hole.addColorStop(0, 'rgba(255,255,255,0.95)'); hole.addColorStop(0.25, 'rgba(255,255,255,0.4)'); hole.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hole; g.fillRect(hx - 40 * lw, hy - 40 * lw, 80 * lw, 80 * lw);

  const tex = new THREE.CanvasTexture(snap);
  tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });

  const shards = [];
  for (let j = 0; j < RINGS.length - 1; j++) {
    for (let k = 0; k < RAYS; k++) {
      const poly = j ? [pt[j][k], pt[j][(k + 1) % RAYS], pt[j + 1][(k + 1) % RAYS], pt[j + 1][k]]
                     : [pt[0][0], pt[1][(k + 1) % RAYS], pt[1][k]];
      const c = poly.reduce((s, p) => s.add(p), new THREE.Vector2()).multiplyScalar(1 / poly.length);
      const geo = new THREE.ShapeGeometry(new THREE.Shape(poly.map((p) => p.clone().sub(c))));
      const pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + c.x) / W + 0.5, (pos.getY(i) + c.y) / H + 0.5);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(c.x, c.y, -D);
      scene.add(m);
      const out = c.clone().sub(new THREE.Vector2(cx, cy));
      const dist = out.length();
      out.normalize();
      shards.push({
        m, dist,
        delay: dist * 0.035 + Math.random() * 0.08,
        v: new THREE.Vector3(out.x * (1.5 + 5 / (dist + 0.6)), out.y * (1.5 + 5 / (dist + 0.6)) + 1, 1.5 + Math.random() * 5),
        av: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3),
        jit: new THREE.Vector2(out.x, out.y).multiplyScalar(0.015 + Math.random() * 0.03),
        base: m.position.clone(),
      });
    }
  }

  function update(e, dt) {
    // e = seconds since the crack; pieces hang for a beat, then fall away from the hole outward
    shards.forEach((s) => {
      if (!s.m.visible) return;
      if (e < 0.75) {
        const k = Math.min(1, e / 0.12);
        s.m.position.set(s.base.x + s.jit.x * k, s.base.y + s.jit.y * k, s.base.z);
        return;
      }
      if (e - 0.75 < s.delay) return;
      s.v.y -= 16 * dt;
      s.m.position.addScaledVector(s.v, dt);
      s.m.rotation.x += s.av.x * dt; s.m.rotation.y += s.av.y * dt; s.m.rotation.z += s.av.z * dt;
      if (s.m.position.y < -25 || s.m.position.z > -0.3) s.m.visible = false;
    });
  }

  function resize(a) { camera.aspect = a; camera.updateProjectionMatrix(); }

  return { scene, camera, update, resize };
}

function buildLetters(scene) {
  const font = new FontLoader().parse(fontData);
  const res = font.data.resolution;
  const words = [
    { text: 'FROM', size: 0.95 },
    { text: 'SHAAN', size: 2.5 },
  ];
  const letters = [];
  let x = 0;
  words.forEach((w, wi) => {
    const depth = w.size * 0.3;
    for (const ch of w.text) {
      const geo = new TextGeometry(ch, {
        font, size: w.size, depth, curveSegments: 6,
        bevelEnabled: true, bevelThickness: w.size * 0.025, bevelSize: w.size * 0.018, bevelSegments: 2,
      });
      // glowing white faces (tight bloom keeps them readable), mirror-chrome sides give the shape
      const face = new THREE.MeshStandardMaterial({ color: 0x8e939c, emissive: 0xffffff, emissiveIntensity: 0, metalness: 0.2, roughness: 0.5, envMapIntensity: 0 });
      const side = new THREE.MeshStandardMaterial({ color: 0x8a8f99, metalness: 1, roughness: 0.12, envMapIntensity: 0 });
      const m = new THREE.Mesh(geo, [face, side]);
      const holder = new THREE.Group();
      m.position.z = -depth / 2;
      holder.add(m);
      holder.position.x = x;
      scene.add(holder);
      letters.push({ holder, face, side, word: wi, baseX: 0 });
      x += (font.data.glyphs[ch].ha / res) * w.size + w.size * 0.06;
    }
    x += w.size * 0.55;
  });
  // center the line
  const total = x - words[words.length - 1].size * 0.55;
  letters.forEach((l) => { l.holder.position.x -= total / 2; l.baseX = l.holder.position.x; });
  return letters;
}

export function startFinale(snap, ix, iy, onCta) {
  const canvas = document.getElementById('finale');
  const hint = document.getElementById('finale-hint');
  canvas.hidden = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;  // same raw display space as the Vegas layer
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030204);
  scene.fog = new THREE.FogExp2(0x030204, 0.04);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 200);

  // mirror floor with a dark glaze over it
  const mirror = new Reflector(new THREE.PlaneGeometry(200, 200), {
    textureWidth: window.innerWidth * 0.6, textureHeight: window.innerHeight * 0.6, color: 0x707078,
  });
  mirror.rotation.x = -Math.PI / 2;
  scene.add(mirror);
  const glaze = new THREE.Mesh(new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x050407, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.8 }));
  glaze.rotation.x = -Math.PI / 2; glaze.position.y = 0.004;
  scene.add(glaze);

  scene.add(new THREE.HemisphereLight(0x3a3048, 0x050305, 0.25));
  const key = new THREE.SpotLight(0xffffff, 0, 45, 0.55, 0.7, 1.4);
  key.position.set(0, 13, 11); key.target.position.set(0, 1.2, 0);
  scene.add(key, key.target);
  const rim = new THREE.PointLight(0xdfe6ff, 0, 26, 1.6);
  rim.position.set(0, 3.2, -3);
  scene.add(rim);

  const glowTex = glowTexture();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xe8eeff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.scale.set(22, 7, 1); halo.position.set(0, 1.8, -1.5);
  scene.add(halo);

  const letters = buildLetters(scene);

  // the video screen, parked under the floor until it rises
  const vtex = new THREE.VideoTexture(video);
  const screen = new THREE.Group();
  const vidMat = new THREE.MeshBasicMaterial({ map: vtex, color: 0x000000, fog: false });
  const bezelMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(SW + 0.3, SH + 0.3), bezelMat);
  bezel.position.z = -0.03;
  screen.add(bezel, new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), vidMat));
  scene.add(screen);
  const screenLight = new THREE.PointLight(0x7aa8ff, 0, 30, 1.5);
  scene.add(screenLight);

  // floating dust in the spotlight
  const DUST = 500;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dustPos.set([(Math.random() - 0.5) * 30, Math.random() * 9, (Math.random() - 0.5) * 24], i * 3);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.05, map: glowTex, color: 0xffe8f0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  // multisampled target so the chrome edges stay crisp through post-processing
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.32, 0.18, 0.96);   // soft halo only, edges stay sharp
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const shards = buildShards(snap, ix, iy, window.innerWidth / window.innerHeight);

  // ---- camera path (keys at scroll progress), end key frames the screen edge to edge
  const keys = [
    { at: 0, pos: new THREE.Vector3(-10, 0.9, 15), look: new THREE.Vector3(0, 1.5, 0) },
    { at: 0.3, pos: new THREE.Vector3(6.5, 0.55, 7.5), look: new THREE.Vector3(0, 1.7, 0) },
    { at: 0.58, pos: new THREE.Vector3(0, 2.1, 11.5), look: new THREE.Vector3(0, 2.8, -4) },
    { at: 1, pos: new THREE.Vector3(), look: new THREE.Vector3(0, SCREEN_Y, SCREEN_Z) },
  ];
  const basePos = keys.map((k) => k.pos.clone());
  function frameScreen() {
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const d = Math.max((SH / 2) / t, (SW / 2) / (t * camera.aspect));   // contain: the whole frame in view
    keys[3].pos.set(0, SCREEN_Y, SCREEN_Z + d);
    // narrow screens: back the opening shots off so FROM SHAAN still fits
    const back = Math.max(1, 1.7 / camera.aspect);
    for (let i = 0; i < 3; i++) keys[i].pos.copy(basePos[i]).sub(keys[i].look).multiplyScalar(back).add(keys[i].look);
  }
  frameScreen();
  const posCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.pos), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => k.look), false, 'centripetal');
  function keyParam(p) {
    for (let i = 0; i < keys.length - 1; i++) {
      if (p <= keys[i + 1].at) return (i + (p - keys[i].at) / (keys[i + 1].at - keys[i].at)) / (keys.length - 1);
    }
    return 1;
  }

  // ---- scroll input (virtual: the page itself never scrolls)
  const STORY_AT = 0.2;              // hold on the full video for a beat before the text
  const MAX = 1 + STORY_AT + STORY_LEN;
  let target = 0, prog = 0, scrollOn = false;
  const nudge = (d) => { if (scrollOn) target = Math.min(MAX, Math.max(0, target + d)); };
  window.addEventListener('wheel', (e) => nudge(e.deltaY / 2800), { passive: true });
  let touchY = null;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (touchY === null) return;
    const y = e.touches[0].clientY;
    nudge((touchY - y) / 1100); touchY = y;
  }, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) nudge(0.07);
    if (['ArrowUp', 'PageUp'].includes(e.key)) nudge(-0.07);
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    mirror.getRenderTarget().setSize(w * 0.6 * renderer.getPixelRatio(), h * 0.6 * renderer.getPixelRatio());
    shards.resize(w / h);
    frameScreen();
    posCurve.points[3].copy(keys[3].pos);
  }
  window.addEventListener('resize', resize);

  const t0 = performance.now() / 1000;
  const LIGHTS_AT = 1.7;
  letters.forEach((l, i) => { l.onAt = LIGHTS_AT + (l.word ? 0.55 + (i - 4) * 0.17 : i * 0.07); l.clicked = false; });
  let fell = false, videoStarted = false, arrived = false, last = t0;
  const story = createStory(onCta);
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

  function frame() {
    const now = performance.now() / 1000;
    const e = now - t0, dt = Math.min(now - last, 0.05); last = now;

    if (!fell && e > 0.75) { fell = true; glassBreak(); glassBreak(); }
    if (!scrollOn && e > LIGHTS_AT + 2.2) { scrollOn = true; hint.classList.add('on'); }
    if (!videoStarted && e > 1) { videoStarted = true; useVideo(); video.muted = true; video.play().catch(() => {}); }

    prog += (target - prog) * (1 - Math.exp(-dt * 4.5));
    const p = Math.min(prog, 1), u = prog - 1;

    // the moment the whole video is on screen it starts over from the top, then loops forever
    if (!arrived && p > 0.985) { arrived = true; video.currentTime = 0; video.play().catch(() => {}); }

    // past that, the video sinks into the background and the story plays over it
    const bg = smooth(0.02, 0.18, u);
    const cover = Math.max((innerWidth / innerHeight) / (16 / 9), (16 / 9) / (innerWidth / innerHeight));
    video.style.transform = `scale(${1 + (cover * 1.04 - 1) * bg})`;
    video.style.filter = bg > 0 ? `brightness(${1 - 0.22 * bg}) saturate(${1 + 0.2 * bg}) contrast(${1 + 0.08 * bg})` : 'none';
    // the scroll hint stays up the whole way, until the "Know more" button is showing
    const ctaIn = story.update(u - STORY_AT);
    hint.classList.toggle('on', scrollOn && !ctaIn);
    video.style.opacity = smooth(0.965, 1, p);
    if (u > 0.02) return;      // 3D stage is fully behind the video now

    // letters flicker on one by one
    let lit = 0;
    letters.forEach((l) => {
      const le = e - l.onAt;
      if (le >= 0 && !l.clicked) { l.clicked = true; switchOn(); }
      const on = le < 0 ? 0 : le < 0.35 ? (Math.random() < 0.55 ? 1 : 0.1) : 1;
      lit += on;
      l.face.envMapIntensity = on * 0.3;
      l.face.emissiveIntensity = on * 0.62;
      l.side.envMapIntensity = on * 0.9;

      // they swing open like doors as the screen comes through
      const s = smooth(0.6, 0.93, p), dir = l.baseX >= 0 ? 1 : -1;
      l.holder.position.x = l.baseX + dir * s * (11 + Math.abs(l.baseX) * 0.6);
      l.holder.rotation.y = -dir * s * 1.15;
    });
    const litK = lit / letters.length;
    key.intensity = 240 * litK;
    rim.intensity = 18 * litK;
    halo.material.opacity = 0.05 * litK * (1 - smooth(0.6, 0.9, p));
    dust.material.opacity = 0.7 * litK;
    dust.rotation.y = e * 0.01;

    // video screen rises out of the floor, then pushes forward to fill the view
    const r = smooth(0.28, 0.6, p), f = smooth(0.58, 0.98, p);
    screen.position.set(0, THREE.MathUtils.lerp(-SH / 2 - 0.6, SCREEN_Y, r), THREE.MathUtils.lerp(-8, SCREEN_Z, f));
    screen.rotation.x = (1 - r) * 0.45;
    vidMat.color.setScalar(0.12 + 0.88 * smooth(0.35, 0.7, p));
    bezelMat.color.setScalar(0.3 + 0.7 * r);
    screenLight.position.set(0, screen.position.y, screen.position.z + 3);
    screenLight.intensity = 90 * r;

    // camera: idle drift that settles to exact framing at the end
    const cu = keyParam(p);
    posCurve.getPoint(cu, camPos); lookCurve.getPoint(cu, camLook);
    const drift = 1 - smooth(0.8, 1, p);
    camPos.x += Math.sin(e * 0.31) * 0.5 * drift;
    camPos.y += Math.sin(e * 0.23) * 0.15 * drift;
    camPos.z -= Math.min(e, 6) * 0.25 * (1 - smooth(0, 0.3, p));   // slow push-in before any scrolling
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    renderer.setRenderTarget(null);
    renderer.clear();
    composer.render(dt);
    if (e < 6) {
      shards.update(e, dt);
      renderer.clearDepth();
      renderer.render(shards.scene, shards.camera);
    }
  }
  renderer.setAnimationLoop(frame);
  frame();   // first frame goes up synchronously, so the Vegas canvas can be hidden right after

  // once something covers the finale for good, stop rendering it and scrolling through it
  function stop() {
    renderer.setAnimationLoop(null);
    scrollOn = false;
    video.pause();
    [canvas, video, hint, document.getElementById('story'), document.getElementById('story-count')].forEach((el) => { el.hidden = true; });
  }
  return { stop };
}
