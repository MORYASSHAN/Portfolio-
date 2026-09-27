import * as THREE from 'three';

// First-person pistol: its own scene + camera, drawn on top of the world layer.
// The model is built with the barrel along +z so Object3D.lookAt() points it at the target.

function glow() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,230,160,0.9)');
  grd.addColorStop(0.5, 'rgba(255,140,50,0.35)'); grd.addColorStop(1, 'rgba(255,100,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function buildPistol() {
  const gun = new THREE.Group();
  // low metalness: there's no environment map, so fully metallic surfaces would render black
  const steel = new THREE.MeshStandardMaterial({ color: 0x55555f, metalness: 0.35, roughness: 0.38 });
  const polymer = new THREE.MeshStandardMaterial({ color: 0x24242a, metalness: 0.1, roughness: 0.7 });
  const add = (geo, mat, x, y, z, rx = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.x = rx;
    gun.add(m);
    return m;
  };

  add(new THREE.BoxGeometry(0.07, 0.07, 0.42), steel, 0, 0.045, 0.1);             // slide
  add(new THREE.BoxGeometry(0.074, 0.012, 0.3), steel, 0, 0.015, 0.1);            // slide rail
  add(new THREE.BoxGeometry(0.064, 0.05, 0.3), polymer, 0, -0.012, 0.1);          // frame
  add(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12), steel, 0, 0.045, 0.32, Math.PI / 2); // barrel tip
  add(new THREE.BoxGeometry(0.062, 0.21, 0.095), polymer, 0, -0.115, -0.05, -0.28); // grip
  add(new THREE.BoxGeometry(0.066, 0.02, 0.1), polymer, 0, -0.215, -0.08, -0.28);  // magazine base
  add(new THREE.BoxGeometry(0.012, 0.018, 0.012), steel, 0, 0.088, 0.29);          // front sight
  add(new THREE.BoxGeometry(0.05, 0.018, 0.014), steel, 0, 0.088, -0.09);          // rear sight
  const guard = add(new THREE.TorusGeometry(0.038, 0.007, 6, 14, Math.PI), polymer, 0, -0.04, 0.05);
  guard.rotation.set(0, Math.PI / 2, Math.PI);
  add(new THREE.BoxGeometry(0.008, 0.04, 0.012), steel, 0, -0.05, 0.04, 0.3);       // trigger
  for (let i = 0; i < 7; i++) add(new THREE.BoxGeometry(0.072, 0.05, 0.004), polymer, 0, 0.05, -0.06 - i * 0.012); // serrations

  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, 0.045, 0.35);
  gun.add(muzzle);
  return { gun, muzzle };
}

export function createGunView() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);

  scene.add(new THREE.HemisphereLight(0x9a80ff, 0x401420, 1.6));
  const pink = new THREE.DirectionalLight(0xff4fb0, 3.2); pink.position.set(-3, 1, 0.5); scene.add(pink);
  const cyan = new THREE.DirectionalLight(0x40c0ff, 2.6); cyan.position.set(3, 2, -2); scene.add(cyan);
  const key = new THREE.DirectionalLight(0xffe2c0, 2.2); key.position.set(1, 3, 2); scene.add(key);
  const flashLight = new THREE.PointLight(0xffb060, 0, 2, 2);
  scene.add(flashLight);

  const { gun, muzzle } = buildPistol();
  const rig = new THREE.Group();          // rig carries position + aim, gun gets recoil
  rig.add(gun);
  scene.add(rig);
  const REST = new THREE.Vector3(0.27, -0.24, -0.95);
  rig.position.copy(REST);

  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.scale.setScalar(0.3);
  flash.visible = false;
  muzzle.add(flash);

  const aimNdc = new THREE.Vector2(0, 0.25);
  const target = new THREE.Vector3(), look = new THREE.Object3D();
  let kick = 0, flashUntil = 0;

  function setAspect(a) { camera.aspect = a; camera.updateProjectionMatrix(); }
  function setAim(nx, ny) { aimNdc.set(nx, ny); }

  function update(t, nowMs) {
    // point the barrel at whatever sits under the cursor, far down the street
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    target.set(aimNdc.x * tan * camera.aspect, aimNdc.y * tan, -1).multiplyScalar(40);
    look.position.copy(rig.position);
    look.lookAt(target);
    rig.quaternion.slerp(look.quaternion, 0.22);

    kick *= 0.84;
    const sway = 0.004;
    rig.position.set(REST.x + Math.sin(t * 1.3) * sway, REST.y + Math.sin(t * 2.1) * sway * 0.7, REST.z);
    gun.position.set(0, 0, -kick * 0.09);
    // canted inward and rolled a touch so you see the side of the pistol, not just its back
    gun.rotation.set(-kick * 0.5, 0.42, -0.14);

    const firing = nowMs < flashUntil;
    flash.visible = firing;
    flash.material.rotation = Math.random() * Math.PI;
    muzzle.getWorldPosition(flashLight.position);
    flashLight.intensity = firing ? 6 : 0;
  }

  function fire(nowMs) {
    kick = 1;
    flashUntil = nowMs + 55;
  }

  const v = new THREE.Vector3();
  function muzzleScreen(w, h) {
    muzzle.getWorldPosition(v).project(camera);
    return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h];
  }

  return { scene, camera, setAspect, setAim, update, fire, muzzleScreen };
}
