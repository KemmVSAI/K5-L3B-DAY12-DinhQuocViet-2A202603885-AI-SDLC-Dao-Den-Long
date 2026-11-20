# Dao Den Long (Lantern Island)

> Video demo: [Coming soon] — will be linked here after recording.

3D third-person web game. You are a young lantern keeper on a dark island. Collect fireflies to light the Large Lanterns and avoid the Ink Shadows that roam the fog.

---

## Quick Start (3 commands)

```bash
git clone https://github.com/KemmVSAI/K5-L3B-DAY12-DinhQuocViet-2A202603885-AI-SDLC-Dao-Den-Long.git
cd K5-L3B-DAY12-DinhQuocViet-2A202603885-AI-SDLC-Dao-Den-Long
npx serve .
```

Then open `http://localhost:3000` in a browser.

## Controls

| Key | Action |
|---|---|
| W / Arrow Up | Move forward |
| S / Arrow Down | Move backward |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |
| Space | Light Burst (Phase 2+: pushes shadows away, 5s cooldown) |
| F5 | Restart |

## How to Play

Walk near glowing fireflies to collect them. Walk near a Large Lantern while holding enough fireflies to light it. Light all 5 lanterns to win. Ink Shadows (Phase 2+) will chase you if you get close — if they touch you, you lose HP. When your HP reaches 0, you lose.

## Run Tests (headless / Test Contract)

```bash
node headless/run-all.js
node headless/run.js tests/scenarios/phase1-collect.json
node headless/run.js tests/scenarios/phase1-determinism.json --verbose
```

## Game Phases

| Phase | Features | Tag |
|---|---|---|
| 1 | Core: player movement, firefly collection, lantern lighting | `phase-1` |
| 2 | Shadows (enemies), HP system, Light Burst ability | `phase-2` |
| 3 | Firefly respawn, shadow speed scaling per lit lantern | `phase-3` |
| 4 | HUD polish, performance metrics, packaging, Release v1.0.0 | `phase-4` |

## Architecture

```
src/core.js       Pure game logic (no DOM, no Three.js). Deterministic.
src/render.js     Three.js visual layer.
src/main.js       Browser entry: game loop, input, HUD.
index.html        HTML page with importmap for Three.js CDN.
headless/run.js   CLI scenario runner (Test Contract).
tests/scenarios/  JSON test scenarios.
```

## Test Contract

Input: JSON file with `seed`, `phase`, `ticks`, `inputs[]`, `expect[]`.
Output: JSON with `tick`, `status`, `player{x,z,hp}`, `firefliesCollected`, `firefliesActive`, `firefliesTotal`, `lanternsLit`, `lanternsTotal`, and `shadows[]` (Phase 2+).

Deterministic: same `seed` + same `inputs` = same output.

## Sang tao cua toi

- **Light Burst** (Space): an active ability that emits a wave of light, knocking back and stunning nearby Ink Shadows. This adds tactical depth: use it to escape when surrounded.
- **Atmosphere**: dynamic fog, firefly float animation, lantern glow when lit, dark blue-green palette for a mysterious night-island feel.
- **Progressive difficulty** (Phase 3): shadows get faster as more lanterns are lit, creating natural tension.
