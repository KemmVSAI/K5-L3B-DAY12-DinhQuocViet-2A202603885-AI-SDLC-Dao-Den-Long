# AGENTS.md — AI Harness for "Dao Den Long"

## Project
3D third-person web game. Player collects fireflies to light Large Lanterns while avoiding Ink Shadows on a dark island.

## Architecture
- `src/core.js` — Pure game logic (no DOM, no Three.js). Runs in Node.js for headless tests. **Do not add imports here.**
- `src/render.js` — Three.js visual layer. Only reads from world state.
- `src/main.js` — Browser entry: game loop, input, HUD.
- `headless/run.js` — CLI scenario runner (Test Contract).
- `headless/run-all.js` — Runs all scenarios in `tests/scenarios/`.

## Commands
- Run all tests: `node headless/run-all.js`
- Run single scenario: `node headless/run.js tests/scenarios/<file>.json`
- Start dev server: `npx serve .`

## Rules for AI
1. **Never modify `src/core.js` to make a test pass.** Fix the test or fix the game logic, then verify.
2. **Keep `src/core.js` dependency-free.** No `import` of Three.js, DOM, or Node built-ins.
3. **Commit small.** One feature or one fix per commit.
4. **Run `node headless/run-all.js` before every commit.** All scenarios must pass.
5. **Deterministic RNG only** (mulberry32). No `Math.random()` in game logic.
6. **Test Contract output** is produced by `serializeWorld()` in `src/core.js`. Do not change its shape without updating all scenarios.

## Known pitfalls
- Floating-point accumulation: expected positions may differ by <0.01 from hand calculation. Use `round2()` in `serializeWorld()`.
- The determinism test uses 60 ticks (1 second). Player moves 5 units/s, so after 60 ticks with direction (0,1), `player.z = 5`.
