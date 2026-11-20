// Core game logic for "Dao Den Long" - pure JS, no DOM or Three.js.
// Deterministic: same seed + same inputs = same output.

// --- Seeded RNG (mulberry32) ---
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Constants ---
export const ISLAND_RADIUS = 50;
export const PLAYER_SPEED = 5;
export const COLLECT_RADIUS = 2;
export const LANTERN_RADIUS = 3;
export const FIREFLIES_PER_LANTERN = 5;
export const NUM_FIREFLIES = 20;
export const NUM_LANTERNS = 5;
export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;
export const MAX_TICKS = 60 * 300;

export const NUM_SHADOWS = 8;
export const SHADOW_SPEED = 3.5;
export const SHADOW_DETECT_RADIUS = 10;
export const SHADOW_ATTACK_RADIUS = 1.5;
export const PLAYER_MAX_HP = 3;
export const LIGHT_BURST_RADIUS = 8;
export const LIGHT_BURST_KNOCKBACK = 5;
export const LIGHT_BURST_COOLDOWN_TICKS = 300;
export const LIGHT_BURST_ACTIVE_TICKS = 30;

export const FIREFLY_RESPAWN_TICKS = 60 * 30;
export const SHADOW_SPEED_SCALE_PER_LANTERN = 0.1;

// --- World Creation ---
export function createWorld(seed, phase) {
  const rng = mulberry32(seed);
  const world = {
    seed,
    phase,
    tick: 0,
    status: "playing",
    player: {
      x: 0,
      z: 0,
      hp: PLAYER_MAX_HP,
      burstCooldown: 0,
      facing: 0,
    },
    fireflies: [],
    lanterns: [],
    shadows: [],
    firefliesCollected: 0,
    burstActive: 0,
  };

  for (let i = 0; i < NUM_FIREFLIES; i++) {
    world.fireflies.push({
      id: i,
      x: (rng() * 2 - 1) * (ISLAND_RADIUS - 5),
      z: (rng() * 2 - 1) * (ISLAND_RADIUS - 5),
      spawnX: 0,
      spawnZ: 0,
      collected: false,
      active: true,
      respawnTimer: 0,
      floatOffset: rng() * Math.PI * 2,
    });
  }
  for (const f of world.fireflies) {
    f.spawnX = f.x;
    f.spawnZ = f.z;
  }

  for (let i = 0; i < NUM_LANTERNS; i++) {
    const angle = (i / NUM_LANTERNS) * Math.PI * 2 + 0.3;
    const dist = 30 + rng() * 10;
    world.lanterns.push({
      id: i,
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist,
      lit: false,
      fireflies: 0,
    });
  }

  if (phase >= 2) {
    for (let i = 0; i < NUM_SHADOWS; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 15 + rng() * 25;
      world.shadows.push({
        id: i,
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        spawnX: Math.cos(angle) * dist,
        spawnZ: Math.sin(angle) * dist,
        state: "roam",
        stunTimer: 0,
      });
    }
  }

  return world;
}

// --- Game Tick ---
export function tick(world, input) {
  if (world.status !== "playing") return;
  world.tick++;

  const p = world.player;
  const move = input.move || { x: 0, z: 0 };

  const len = Math.sqrt(move.x * move.x + move.z * move.z);
  if (len > 0) {
    const nx = move.x / len;
    const nz = move.z / len;
    p.x += nx * PLAYER_SPEED * DT;
    p.z += nz * PLAYER_SPEED * DT;
    p.facing = Math.atan2(nx, nz);

    const dist = Math.sqrt(p.x * p.x + p.z * p.z);
    if (dist > ISLAND_RADIUS) {
      p.x = (p.x / dist) * ISLAND_RADIUS;
      p.z = (p.z / dist) * ISLAND_RADIUS;
    }
  }

  if (input.burst && p.burstCooldown <= 0 && world.phase >= 2) {
    p.burstCooldown = LIGHT_BURST_COOLDOWN_TICKS;
    world.burstActive = LIGHT_BURST_ACTIVE_TICKS;
  }
  if (p.burstCooldown > 0) p.burstCooldown--;
  if (world.burstActive > 0) world.burstActive--;

  for (const f of world.fireflies) {
    if (!f.active) {
      if (world.phase >= 3) {
        f.respawnTimer--;
        if (f.respawnTimer <= 0) {
          const r = mulberry32(world.seed + world.tick * 31 + f.id * 997);
          f.active = true;
          f.collected = false;
          f.x = (r() * 2 - 1) * (ISLAND_RADIUS - 5);
          f.z = (r() * 2 - 1) * (ISLAND_RADIUS - 5);
          f.spawnX = f.x;
          f.spawnZ = f.z;
        }
      }
      continue;
    }

    const dx = f.x - p.x;
    const dz = f.z - p.z;
    if (dx * dx + dz * dz < COLLECT_RADIUS * COLLECT_RADIUS) {
      f.active = false;
      f.collected = true;
      f.respawnTimer = FIREFLY_RESPAWN_TICKS;
      world.firefliesCollected++;
    }
  }

  for (const l of world.lanterns) {
    if (l.lit) continue;
    const dx = l.x - p.x;
    const dz = l.z - p.z;
    if (dx * dx + dz * dz < LANTERN_RADIUS * LANTERN_RADIUS) {
      const needed = FIREFLIES_PER_LANTERN - l.fireflies;
      const give = Math.min(needed, world.firefliesCollected);
      if (give > 0) {
        l.fireflies += give;
        world.firefliesCollected -= give;
      }
      if (l.fireflies >= FIREFLIES_PER_LANTERN) {
        l.lit = true;
      }
    }
  }

  if (world.phase >= 2) {
    const litCount = world.lanterns.filter((l) => l.lit).length;
    const speedScale =
      world.phase >= 3
        ? 1 + SHADOW_SPEED_SCALE_PER_LANTERN * litCount
        : 1;

    for (const s of world.shadows) {
      if (s.stunTimer > 0) {
        s.stunTimer--;
        continue;
      }

      const dx = p.x - s.x;
      const dz = p.z - s.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < SHADOW_DETECT_RADIUS && dist > 0.1) {
        s.state = "chase";
        const speed = SHADOW_SPEED * speedScale;
        s.x += (dx / dist) * speed * DT;
        s.z += (dz / dist) * speed * DT;
      } else {
        s.state = "roam";
        const angle = (world.tick / 300) * Math.PI + s.id * (Math.PI / 4);
        const roamDist = 8;
        const tx = s.spawnX + Math.cos(angle) * roamDist;
        const tz = s.spawnZ + Math.sin(angle) * roamDist;
        const mdx = tx - s.x;
        const mdz = tz - s.z;
        const mdist = Math.sqrt(mdx * mdx + mdz * mdz);
        if (mdist > 0.1) {
          s.x += (mdx / mdist) * SHADOW_SPEED * 0.3 * DT;
          s.z += (mdz / mdist) * SHADOW_SPEED * 0.3 * DT;
        }
      }

      if (dist < SHADOW_ATTACK_RADIUS && world.burstActive <= 0) {
        p.hp--;
        s.stunTimer = 120;
        if (p.hp <= 0) {
          world.status = "lost";
          return;
        }
      }

      if (world.burstActive > 0) {
        const bx = s.x - p.x;
        const bz = s.z - p.z;
        const bDist = Math.sqrt(bx * bx + bz * bz);
        if (bDist < LIGHT_BURST_RADIUS && bDist > 0.1) {
          s.x += (bx / bDist) * LIGHT_BURST_KNOCKBACK * DT;
          s.z += (bz / bDist) * LIGHT_BURST_KNOCKBACK * DT;
          s.stunTimer = Math.max(s.stunTimer, 60);
        }
      }
    }
  }

  if (world.lanterns.every((l) => l.lit)) {
    world.status = "won";
  }

  if (world.tick >= MAX_TICKS && world.status === "playing") {
    world.status = "lost";
  }
}

// --- Test Contract Output ---
export function serializeWorld(world) {
  const output = {
    tick: world.tick,
    status: world.status,
    player: {
      x: round2(world.player.x),
      z: round2(world.player.z),
      hp: world.player.hp,
    },
    firefliesCollected: world.firefliesCollected,
    firefliesActive: world.fireflies.filter((f) => f.active).length,
    firefliesTotal: world.fireflies.length,
    lanternsLit: world.lanterns.filter((l) => l.lit).length,
    lanternsTotal: world.lanterns.length,
  };

  if (world.phase >= 2) {
    output.shadows = world.shadows.map((s) => ({
      id: s.id,
      x: round2(s.x),
      z: round2(s.z),
      state: s.state,
    }));
  }

  return output;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
