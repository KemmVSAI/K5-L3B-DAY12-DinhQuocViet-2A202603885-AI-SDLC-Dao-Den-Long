// Headless Test Contract runner for "Dao Den Long".
// Usage: node headless/run.js <scenario.json> [--verbose]

import fs from "fs";
import path from "path";
import { createWorld, tick, serializeWorld } from "../src/core.js";

const [,, scenarioPath] = process.argv;
const verbose = process.argv.includes("--verbose");

if (!scenarioPath) {
  console.error("Usage: node headless/run.js <scenario.json>");
  process.exit(1);
}

const scenario = JSON.parse(fs.readFileSync(path.resolve(scenarioPath), "utf8"));
const { seed = 42, phase = 1, ticks = 18000, inputs = [], expect = [] } = scenario;

const world = createWorld(seed, phase);
const inputMap = new Map(inputs.map((inp) => [inp.tick, inp]));

let lastInput = { move: { x: 0, z: 0 } };
for (let t = 0; t < ticks; t++) {
  if (inputMap.has(t)) lastInput = inputMap.get(t);
  tick(world, lastInput);
  if (world.status !== "playing") break;
}

const output = serializeWorld(world);
if (verbose) console.log(JSON.stringify(output, null, 2));

let pass = true;
const results = expect.map(([key, expected]) => {
  const actual = key.split(".").reduce((o, k) => (o ? o[k] : undefined), output);
  const ok = actual === expected;
  if (!ok) pass = false;
  return { key, expected, actual, pass: ok };
});

if (results.length > 0) {
  console.log("\n--- Assertions ---");
  for (const r of results) {
    const icon = r.pass ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${r.key}: expected=${r.expected}, actual=${r.actual}`);
  }
}

console.log(`\nScenario: ${scenario.name || path.basename(scenarioPath)}`);
console.log(`Seed: ${seed}, Phase: ${phase}, Ticks: ${ticks}`);
console.log(`Status: ${output.status}`);
console.log(pass ? "Result: ALL PASS" : "Result: FAIL");
process.exit(pass ? 0 : 1);
