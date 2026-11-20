// Three.js rendering for "Dao Den Long" - visual layer only.
import * as THREE from "three";

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createScene(world) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e1a);
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.025);

  const ambient = new THREE.AmbientLight(0x1a2035, 0.6);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x4a6fa5, 0.5);
  moon.position.set(30, 50, 20);
  scene.add(moon);

  const hemi = new THREE.HemisphereLight(0x1a2a3a, 0x0a0e18, 0.4);
  scene.add(hemi);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(52, 64),
    new THREE.MeshLambertMaterial({ color: 0x1a3020 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const rng = mulberry32(world.seed + 999);
  for (let i = 0; i < 40; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 8 + rng() * 40;
    const tx = Math.cos(angle) * dist;
    const tz = Math.sin(angle) * dist;
    const isTree = rng() > 0.4;
    if (isTree) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 3, 6),
        new THREE.MeshLambertMaterial({ color: 0x2a1f15 })
      );
      trunk.position.set(tx, 1.5, tz);
      scene.add(trunk);
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 7),
        new THREE.MeshLambertMaterial({ color: 0x0f2818 })
      );
      canopy.position.set(tx, 4.5, tz);
      canopy.castShadow = true;
      scene.add(canopy);
    } else {
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.8 + rng() * 0.8, 0),
        new THREE.MeshLambertMaterial({ color: 0x3a4048 })
      );
      rock.position.set(tx, 0.5, tz);
      rock.castShadow = true;
      scene.add(rock);
    }
  }

  return scene;
}

export function createPlayerMesh() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.8, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0x8a7a6a })
  );
  body.position.y = 0.8;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 8),
    new THREE.MeshLambertMaterial({ color: 0xd4b896 })
  );
  head.position.y = 1.5;
  group.add(head);

  const lanternArm = new THREE.Group();
  lanternArm.position.set(0.5, 0.9, 0);
  const lanternBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.4, 0.3),
    new THREE.MeshLambertMaterial({ color: 0x5a4a3a })
  );
  lanternBody.castShadow = true;
  lanternArm.add(lanternBody);
  const lanternGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffdd88 })
  );
  lanternGlow.position.y = 0.1;
  lanternArm.add(lanternGlow);
  group.add(lanternArm);

  const lanternLight = new THREE.PointLight(0xffcc66, 2, 12);
  lanternLight.position.set(0.5, 1.0, 0);
  group.add(lanternLight);

  return { group, lanternLight, lanternGlow };
}

export function createFireflyMeshes(world) {
  const meshes = [];
  const geo = new THREE.SphereGeometry(0.12, 8, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xaaff66 });
  for (let i = 0; i < world.fireflies.length; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    const light = new THREE.PointLight(0xaaff66, 0.5, 3);
    mesh.add(light);
    meshes.push(mesh);
  }
  return meshes;
}

export function createLanternMeshes(world) {
  const meshes = [];
  for (const l of world.lanterns) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.0, 0.4, 8),
      new THREE.MeshLambertMaterial({ color: 0x4a4a50 })
    );
    base.position.y = 0.2;
    base.castShadow = true;
    group.add(base);

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.3, 2.0, 8),
      new THREE.MeshLambertMaterial({ color: 0x5a5a60 })
    );
    pillar.position.y = 1.4;
    pillar.castShadow = true;
    group.add(pillar);

    const top = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 0.5, 6),
      new THREE.MeshLambertMaterial({ color: 0x6a6a70 })
    );
    top.position.y = 2.7;
    group.add(top);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    orb.position.y = 2.3;
    group.add(orb);

    const light = new THREE.PointLight(0xffaa33, 0, 15);
    light.position.y = 2.3;
    group.add(light);

    meshes.push({ group, orb, light });
  }
  return meshes;
}

export function createShadowMeshes(world) {
  const meshes = [];
  for (let i = 0; i < world.shadows.length; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 10, 8),
      new THREE.MeshBasicMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.85,
      })
    );
    mesh.position.y = 0.6;
    meshes.push(mesh);
  }
  return meshes;
}

export function updateRender(world, refs, time) {
  const p = world.player;
  refs.player.group.position.set(p.x, 0, p.z);
  refs.player.group.rotation.y = p.facing;

  for (let i = 0; i < world.fireflies.length; i++) {
    const f = world.fireflies[i];
    const m = refs.fireflies[i];
    if (f.active) {
      m.visible = true;
      m.position.set(f.x, 1 + Math.sin(time * 2 + f.floatOffset) * 0.3, f.z);
    } else {
      m.visible = false;
    }
  }

  for (let i = 0; i < world.lanterns.length; i++) {
    const l = world.lanterns[i];
    const m = refs.lanterns[i];
    if (l.lit) {
      m.orb.material.color.setHex(0xffaa33);
      m.light.intensity = 3;
    } else if (l.fireflies > 0) {
      const progress = l.fireflies / 5;
      m.orb.material.color.setHex(0x554422);
      m.light.intensity = progress * 0.8;
    }
  }

  for (let i = 0; i < world.shadows.length; i++) {
    const s = world.shadows[i];
    const m = refs.shadows[i];
    m.position.set(s.x, 0.6, s.z);
  }

  const camTarget = new THREE.Vector3(
    p.x - Math.sin(p.facing) * 6,
    4,
    p.z - Math.cos(p.facing) * 6
  );
  refs.camera.position.lerp(camTarget, 0.08);
  refs.camera.lookAt(p.x, 1.2, p.z);
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
