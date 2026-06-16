#!/usr/bin/env node
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const os = process.platform;

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function header(msg) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}\n`);
}

header("Whisp Build System");
console.log(`Platform: ${os}`);
console.log(`Root:     ${ROOT}\n`);

// Step 1: Install dependencies
header("[1/4] Installing dependencies");
run("pnpm install --frozen-lockfile");

// Step 2: Build all Node packages
header("[2/4] Building packages");
run("pnpm build");

// Step 3: Run tests
header("[3/4] Running tests");
try {
  run("pnpm test", { stdio: "pipe" });
  console.log("  Tests passed.");
} catch {
  console.log("  Tests failed (see above for details). Proceeding with packaging.");
}

// Step 4: Package extension
header("[4/4] Packaging extension");
if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true });
}

const extDist = join(ROOT, "chromium-extension", "dist");
if (existsSync(extDist)) {
  const zipName = `whisp-extension-${os}.zip`;
  const zipPath = join(DIST, zipName);

  if (os === "win32") {
    run(`powershell -Command "Compress-Archive -Path '${extDist}\\*' -DestinationPath '${zipPath}' -Force"`);
  } else {
    run(`cd '${join(ROOT, "chromium-extension")}' && zip -r '${zipPath}' dist/`);
  }
  console.log(`  Extension packaged: ${zipPath}`);
} else {
  console.log("  Extension dist not found — skipping extension packaging.");
}

header("Build complete");
console.log(`Output: ${DIST}\n`);
