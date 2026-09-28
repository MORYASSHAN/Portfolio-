import * as THREE from 'three';

// Blinking neon frame that tells the player what to shoot. `pts` is a closed outline (local x, y)
// around the origin; the frame's inner edge is that outline scaled by (sx, sy), and it is `width`
// meters thick, with a soft wider glow behind it.
export function createTargetOutline(pts, { sx = 1, sy = 1, width = 0.12, color = 0xffd84a } = {}) {
  const mx = Math.max(...pts.map(([x]) => Math.abs(x))), my = Math.max(...pts.map(([, y]) => Math.abs(y)));
  const loop = (kx, ky) => pts.map(([x, y]) => new THREE.Vector2(x * kx, y * ky));
  const ring = (w0, w1) => {
    const shape = new THREE.Shape(loop(sx + w1 / mx, sy + w1 / my));
    shape.holes.push(new THREE.Path(loop(sx + w0 / mx, sy + w0 / my)));
    return new THREE.ShapeGeometry(shape);
  };
  const mat = () => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  const glow = new THREE.Mesh(ring(-width, width * 3), mat());
  const core = new THREE.Mesh(ring(0, width), mat());
  core.position.z = 0.005;
  group.add(glow, core);
  group.visible = false;

  // amount 0..1 fades the whole thing in/out; the blink itself runs off the clock
  function update(t, amount) {
    group.visible = amount > 0.01;
    if (!group.visible) return;
    const p = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.3);
    const blink = 0.15 + 0.85 * p * p;
    core.material.opacity = amount * blink;
    glow.material.opacity = amount * blink * 0.4;
  }

  return { group, update };
}
