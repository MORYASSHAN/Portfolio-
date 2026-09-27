import * as THREE from 'three';
import { createBillboardWorld } from './billboardWorld.js';
import { createGunView } from './gunView.js';

const VP = [0.527, 0.645];     // vanishing point in the photo (x, y from top)
const IMG_FOV = 50;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex, uOverlay;
  uniform vec2 uRes, uImg, uMouse, uOrigin;
  uniform float uTime, uReveal;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }

  // p = image coords, origin top-left, 0..1
  vec3 tex(vec2 p) { return texture2D(uTex, vec2(p.x, 1.0 - p.y)).rgb; }

  // fake depth: road + sides are near, the far Strip & sky are far
  float depth(vec2 p) {
    float side = smoothstep(0.08, 0.5, abs(p.x - 0.53));
    float ground = smoothstep(0.62, 1.0, p.y);
    return clamp(side * 0.8 + ground * 0.7, 0.0, 1.0);
  }

  float glow(vec2 p, vec2 c, float r, float ia) {
    vec2 d = (p - c) * vec2(ia, 1.0);
    return exp(-dot(d, d) / (r * r));
  }

  // headlights / taillights drifting along the boulevard
  vec3 traffic(vec2 p, float t, float ia) {
    vec2 vp = vec2(0.527, 0.645);
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      bool coming = i < 3;
      float lane = coming ? (-0.55 - fi * 0.32) : (0.45 + (fi - 3.0) * 0.34);
      float speed = 0.045 + hash(vec2(fi, 3.0)) * 0.03;
      float s = fract(t * speed + hash(vec2(fi, 9.0)));
      if (!coming) s = 1.0 - s;
      float z = mix(34.0, 3.2, s);
      float k = 1.0 / z;
      float y = vp.y + k * (1.0 - vp.y) * 2.9;
      float x = vp.x + lane * k * 1.05;
      float fade = smoothstep(0.0, 0.18, s) * (1.0 - smoothstep(0.55, 0.85, s));
      float r = 0.0015 + k * 0.022;
      float sep = k * 0.055;
      vec3 c = coming ? vec3(1.0, 0.86, 0.62) : vec3(1.0, 0.12, 0.18);
      float g = glow(p, vec2(x - sep, y), r, ia) + glow(p, vec2(x + sep, y), r, ia);
      vec2 rd = p - vec2(x, y + r * 3.5);
      float refl = exp(-pow(rd.x * ia / (r * 2.2), 2.0) - pow(rd.y / (r * 9.0), 2.0)) * step(y, p.y);
      acc += c * (g * 0.9 + refl * 0.28) * fade;
    }
    return acc;
  }

  void main() {
    float t = uTime;
    float sa = uRes.x / uRes.y, ia = uImg.x / uImg.y;

    // --- burst out of the button: circular reveal + zoom anchored on the button
    vec2 so = vUv - uOrigin;
    float rad = length(so * vec2(sa, 1.0));
    float maxR = length(vec2(max(uOrigin.x, 1.0 - uOrigin.x) * sa, max(uOrigin.y, 1.0 - uOrigin.y))) + 0.05;
    float R = uReveal * maxR;
    float mask = 1.0 - smoothstep(R - 0.025, R, rad);
    float zoom = mix(0.35, 1.0, 1.0 - pow(1.0 - uReveal, 3.0));
    vec2 suv = uOrigin + so / zoom;

    vec2 sc = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0);
    vec2 uv = (suv - 0.5) * sc * 0.95 + 0.5;
    vec2 p = vec2(uv.x, 1.0 - uv.y);
    vec2 base = p;

    float d = depth(p);
    p += uMouse * vec2(-1.0, 1.0) * 0.013 * (d - 0.3);

    // wet road shimmer
    float road = smoothstep(0.68, 1.0, p.y);
    p.x += (noise(vec2(p.x * 38.0, p.y * 110.0 - t * 1.3)) - 0.5) * 0.0045 * road;
    p.y += sin(p.y * 320.0 - t * 1.8) * 0.0005 * road;

    vec3 col = tex(p);

    // drifting clouds
    float l0 = dot(col, vec3(0.299, 0.587, 0.114));
    float sky = smoothstep(0.015, 0.1, col.b - max(col.r, col.g) * 0.85)
              * (1.0 - smoothstep(0.22, 0.45, l0))
              * (1.0 - smoothstep(0.42, 0.62, p.y));
    vec2 flow = vec2(fbm(p * 3.0 + vec2(t * 0.02, 0.0)), fbm(p * 3.0 + vec2(5.2, t * 0.015))) - 0.5;
    col = mix(col, tex(p + flow * 0.012), sky);

    vec2 moon = vec2(0.457, 0.131);
    float moonD = length((p - moon) * vec2(ia, 1.0));
    vec2 cp = p * vec2(2.6, 5.5);
    float c1 = fbm(cp + vec2(t * 0.035, 0.0));
    float c2 = fbm(cp * 1.7 + vec2(t * 0.06, 3.0));
    float clouds = smoothstep(0.48, 0.85, c1 * 0.65 + c2 * 0.45);
    vec3 cloudCol = mix(vec3(0.16, 0.17, 0.34), vec3(0.62, 0.64, 0.82), exp(-moonD * 4.5));
    col = mix(col, max(col, cloudCol), clouds * sky * 0.55);
    col += vec3(0.55, 0.6, 0.8) * exp(-moonD * moonD * 90.0) * (0.07 + 0.03 * sin(t * 0.6));

    // subtle neon twinkle
    float mx = max(col.r, max(col.g, col.b)), mn = min(col.r, min(col.g, col.b));
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float neon = smoothstep(0.5, 0.95, mx) * smoothstep(0.12, 0.45, mx - mn) + smoothstep(0.82, 1.0, lum) * 0.4;
    neon *= 1.0 - sky;
    vec2 cell = floor(p * vec2(95.0, 54.0));
    float h = hash(cell);
    float f = 0.5 + 0.5 * sin(t * (0.5 + h * 2.0) + h * 40.0);
    float sparkle = pow(f, 8.0);
    float dip = step(0.992, hash(cell + floor(t * 3.0))) * step(0.5, h);
    float tw = 0.1 * (f - 0.5) + 0.22 * sparkle - 0.35 * dip;
    float warm = smoothstep(0.05, 0.3, col.r - col.b) * smoothstep(0.55, 0.9, lum);
    float chase = 0.5 + 0.5 * sin((p.x * 1.3 + p.y) * 280.0 - t * 3.0);
    col *= 1.0 + neon * tw + warm * (chase - 0.5) * 0.14;

    // helicopter searchlight + nav light
    vec2 H = vec2(0.694, 0.197);
    float ang = atan(0.47 - 0.197, (0.52 - 0.694) * ia) + sin(t * 0.35) * 0.07;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 q = (p - H) * vec2(ia, 1.0);
    float along = dot(q, dir);
    float perp = abs(dot(q, vec2(-dir.y, dir.x)));
    float w = 0.004 + along * 0.11;
    float beam = smoothstep(w, 0.0, perp) * smoothstep(0.0, 0.03, along) * (1.0 - smoothstep(0.15, 0.55, along));
    float dust = 0.6 + 0.4 * fbm(vec2(along * 18.0 - t * 0.8, perp * 40.0));
    col += vec3(0.45, 0.6, 1.0) * beam * dust * 0.16;
    col += vec3(1.0, 0.2, 0.25) * glow(p, H + vec2(0.012, -0.012), 0.004, ia) * step(0.86, fract(t * 0.7)) * 0.9;

    col += traffic(p, t, ia);

    // 3D layer (billboard, crowd, cracked road), premultiplied alpha
    vec4 ov = texture2D(uOverlay, suv);
    col = col * (1.0 - ov.a) + ov.rgb;

    vec2 v = base - 0.5;
    col *= 1.0 - dot(v, v) * 0.55;
    col += (hash(vUv * uRes + fract(t) * 91.0) - 0.5) * 0.025;

    // blood-red hot rim on the expanding edge
    float rim = smoothstep(R - 0.06, R - 0.01, rad) * mask * (1.0 - smoothstep(0.85, 1.0, uReveal));
    col = mix(col, vec3(0.75, 0.02, 0.04), rim * 0.85);
    col *= mask;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createVegasScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTex: { value: null },
    uOverlay: { value: null },
    uRes: { value: new THREE.Vector2() },
    uImg: { value: new THREE.Vector2(16, 9) },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    uReveal: { value: 0 },
  };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })));

  // 3D billboard world, rendered into a transparent target and composited by the shader
  const world = createBillboardWorld();
  const gun = createGunView();
  renderer.autoClear = false;
  const overlayRT = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
  uniforms.uOverlay.value = overlayRT.texture;

  // lock the 3D camera to the photo's framing so the world sits on the real road
  function syncView() {
    const w = window.innerWidth, h = window.innerHeight;
    const sa = w / h, ia = uniforms.uImg.value.x / uniforms.uImg.value.y;
    const sx = (sa > ia ? 1 : sa / ia) * 0.95, sy = (sa > ia ? ia / sa : 1) * 0.95;
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(IMG_FOV / 2)) * sy));
    const hx = ((VP[0] - 0.5) / sx) * 2, hy = ((1 - VP[1] - 0.5) / sy) * 2;
    world.setView(w, h, fov, hx, hy);
    gun.setAspect(sa);
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    uniforms.uRes.value.set(w * pr, h * pr);
    overlayRT.setSize(Math.round(w * pr), Math.round(h * pr));
    syncView();
  }
  window.addEventListener('resize', resize);
  resize();

  const target = new THREE.Vector2(), mouse = new THREE.Vector2();
  window.addEventListener('pointermove', (e) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  });

  const ready = new Promise((resolve) => {
    new THREE.TextureLoader().load('/assets/vegas.webp', (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      uniforms.uTex.value = tex;
      uniforms.uImg.value.set(tex.image.width, tex.image.height);
      syncView();
      resolve();
    });
  });

  const clock = new THREE.Clock();
  let reveal = null;
  let running = false;

  function loop() {
    const t = clock.getElapsedTime();
    const idle = new THREE.Vector2(Math.sin(t * 0.11) * 0.25, Math.cos(t * 0.09) * 0.18);
    mouse.lerp(target.clone().add(idle), 0.04);
    uniforms.uMouse.value.copy(mouse);
    uniforms.uTime.value = t;
    if (reveal) {
      const p = Math.min((performance.now() - reveal.start) / reveal.duration, 1);
      uniforms.uReveal.value = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      if (p >= 1) { reveal.done(); reveal = null; world.powerOn(performance.now()); }
    }

    const now = performance.now();
    world.update(t, mouse, now);
    gun.update(t, now);
    renderer.setRenderTarget(overlayRT);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(world.scene, world.camera);
    renderer.clearDepth();
    renderer.render(gun.scene, gun.camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(scene, camera);
  }

  function run() {
    if (running) return;
    running = true;
    renderer.setAnimationLoop(loop);
  }

  document.addEventListener('visibilitychange', () => {
    if (!running) return;
    renderer.setAnimationLoop(document.hidden ? null : loop);
  });

  // grows the scene out of a screen point (client px), resolves when fully open
  function revealFrom(x, y, duration = 1600) {
    uniforms.uOrigin.value.set(x / window.innerWidth, 1 - y / window.innerHeight);
    uniforms.uReveal.value = 0;
    return ready.then(() => new Promise((done) => {
      reveal = { start: performance.now(), duration, done };
      run();
    }));
  }

  const toNdc = (x, y) => [(x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1];

  function aim(x, y) { gun.setAim(...toNdc(x, y)); }

  // fire at a screen point (client px); returns where the muzzle is plus what was hit
  function shoot(x, y) {
    const now = performance.now();
    gun.fire(now);
    const muzzle = gun.muzzleScreen(window.innerWidth, window.innerHeight);
    return { ...world.shoot(...toNdc(x, y), now), muzzle };
  }

  // grab the current frame as a 2D canvas (render + copy in the same task, before the buffer clears)
  function snapshot() {
    loop();
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    c.getContext('2d').drawImage(canvas, 0, 0);
    return c;
  }

  function stop() {
    running = false;
    renderer.setAnimationLoop(null);
  }

  return { ready, revealFrom, aim, shoot, setLevel: world.setLevel, snapshot, stop };
}
