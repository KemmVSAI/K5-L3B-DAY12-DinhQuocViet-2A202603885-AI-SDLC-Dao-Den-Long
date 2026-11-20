import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const dir = path.resolve("tests/scenarios");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

let total = 0;
let passed = 0;

console.log("=== Dao Den Long - Headless Test Suite ===\n");

for (const file of files) {
  total++;
  try {
    execSync(`node headless/run.js "${path.join(dir, file)}"`, { stdio: "pipe" });
    passed++;
    console.log(`  PASS  ${file}`);
  } catch {
    console.log(`  FAIL  ${file}`);
  }
}

console.log(`\n${passed}/${total} scenarios passed.`);
process.exit(passed === total ? 0 : 1);
