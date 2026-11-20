import { createWorld, tick, serializeWorld, TICK_RATE } from "./core.js";
import * as THREE from "three";
import {
  createRenderer,
  createScene,
  createPlayerMesh,
  createFireflyMeshes,
  createLanternMeshes,
  createShadowMeshes,
  updateRender,
} from "./render.js";

const urlParams = new URLSearchParams(window.location.search);
const seed = parseInt(urlParams.get("seed") || "42", 10);
const phase = parseInt(urlParams.get("phase") || "4", 10);

const world = createWorld(seed, phase);

const renderer = createRenderer();
const scene = createScene(world);
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 4, 6);

const player = createPlayerMesh();
scene.add(player.group);
const fireflies = createFireflyMeshes(world);
for (const m of fireflies) scene.add(m);
const lanterns = createLanternMeshes(world);
for (const m of lanterns) scene.add(m.group);
const shadows = phase >= 2 ? createShadowMeshes(world) : [];
for (const m of shadows) scene.add(m);

const refs = {
  camera,
  player,
  fireflies,
  lanterns: lanterns.map((l) => ({ group: l.group, orb: l.orb, light: l.light })),
  shadows,
};

// Input
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") {
    e.preventDefault();
    pendingBurst = true;
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

let pendingBurst = false;

function getInput() {
  let mx = 0;
  let mz = 0;
  if (keys.KeyW || keys.ArrowUp) mz += 1;
  if (keys.KeyS || keys.ArrowDown) mz -= 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  const input = { move: { x: mx, z: mz } };
  if (pendingBurst) {
    input.burst = true;
    pendingBurst = false;
  }
  return input;
}

// HUD
const hud = document.createElement("div");
hud.id = "hud";
document.body.appendChild(hud);

let frameCount = 0;
let fpsTimer = 0;

const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

function updateHUD() {
  const o = serializeWorld(world);
  const fps = hud.dataset.fps || "—";
  hud.innerHTML =
    `<span>FPS: ${fps}</span>` +
    `<span>Fireflies: ${o.firefliesCollected}</span>` +
    `<span>Lanterns: ${o.lanternsLit}/${o.lanternsTotal}</span>` +
    (world.phase >= 2 ? `<span>HP: ${"♥".repeat(o.player.hp) || "—"}</span>` : "") +
    (world.phase >= 3
      ? `<span>Active flies: ${o.firefliesActive}</span>`
      : "");
}

function updateFPS(delta) {
  frameCount++;
  fpsTimer += delta;
  if (fpsTimer >= 1) {
    hud.dataset.fps = Math.round(frameCount / fpsTimer);
    frameCount = 0;
    fpsTimer = 0;
  }
}

function showEnd() {
  if (world.status === "won") {
    overlay.innerHTML = `<h2>Thap den hoan thanh!</h2><p>Tat ca den long da duoc thap sang.</p>`;
  } else if (world.status === "lost") {
    overlay.innerHTML = `<h2>Bi bong muc bat.</h2><p>Nhan F5 de choi lai.</p>`;
  }
  overlay.style.display = "flex";
}

// Game loop
let lastTime = performance.now();
let accumulator = 0;
let elapsed = 0;

function gameLoop(now) {
  requestAnimationFrame(gameLoop);
  const delta = (now - lastTime) / 1000;
  lastTime = now;
  elapsed += delta;

  if (world.status === "playing") {
    accumulator += delta;
    while (accumulator >= 1 / TICK_RATE) {
      tick(world, getInput());
      accumulator -= 1 / TICK_RATE;
      if (world.status !== "playing") break;
    }
  }

  updateRender(world, refs, elapsed);
  updateHUD();
  updateFPS(delta);

  if (world.status !== "playing") {
    showEnd();
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(gameLoop);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
