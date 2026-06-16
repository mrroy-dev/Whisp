#!/usr/bin/env node
import { execSync } from "child_process";
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "fs";
import { join, resolve, relative } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const os = process.platform;
const arch = process.arch;

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

function header(msg) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}\n`);
}

header("Whisp Packaging");
console.log(`Platform: ${os}`);
console.log(`Arch:     ${arch}`);
console.log(`Output:   ${DIST}\n`);

if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true });
}

// 1. Package the Chrome extension
header("[1/3] Packaging Chrome Extension");
const extDist = join(ROOT, "chromium-extension", "dist");
if (existsSync(extDist)) {
  const extDir = join(DIST, "whisp-extension");
  copyDir(extDist, extDir);
  console.log("  Extension files copied to dist/whisp-extension/");

  const zipName = `whisp-extension-${os}-${arch}.zip`;
  const zipPath = join(DIST, zipName);
  if (os === "win32") {
    run(`powershell -Command "Compress-Archive -Path '${extDir}\\*' -DestinationPath '${zipPath}' -Force"`);
    run(`powershell -Command "Remove-Item -Recurse -Force '${extDir}'"`);
  } else {
    run(`cd '${DIST}' && zip -r '${zipName}' whisp-extension/ && rm -rf whisp-extension/`);
  }
  console.log(`  Created: ${zipPath}`);
}

// 2. Package branding assets
header("[2/3] Packaging Branding Assets");
const brandingDir = join(DIST, "whisp-branding");
copyDir(join(ROOT, "branding_assets"), brandingDir);
const brandZip = `whisp-branding-${os}-${arch}.zip`;
const brandZipPath = join(DIST, brandZip);
if (os === "win32") {
  run(`powershell -Command "Compress-Archive -Path '${brandingDir}\\*' -DestinationPath '${brandZipPath}' -Force"`);
  run(`powershell -Command "Remove-Item -Recurse -Force '${brandingDir}'"`);
} else {
  run(`cd '${DIST}' && zip -r '${brandZip}' whisp-branding/ && rm -rf whisp-branding/`);
}
console.log(`  Created: ${brandZipPath}`);

// 3. Package source maps + docs
header("[3/3] Packaging Documentation & Patches");
const docsDir = join(DIST, "whisp-chromium");
const chromiumDir = join(ROOT, "chromium");
if (existsSync(chromiumDir)) {
  mkdirSync(join(docsDir, "patches"), { recursive: true });
  mkdirSync(join(docsDir, "scripts"), { recursive: true });
  mkdirSync(join(docsDir, "docs"), { recursive: true });

  copyDir(join(chromiumDir, "patches"), join(docsDir, "patches"));
  copyDir(join(chromiumDir, "scripts"), join(docsDir, "scripts"));
  copyDir(join(chromiumDir, "docs"), join(docsDir, "docs"));
  copyDir(join(chromiumDir, "config"), join(docsDir, "config"));

  if (existsSync(join(chromiumDir, "contributing.md"))) {
    copyFileSync(join(chromiumDir, "contributing.md"), join(docsDir, "contributing.md"));
  }

  const docsZip = `whisp-chromium-patches-${os}-${arch}.zip`;
  const docsZipPath = join(DIST, docsZip);
  if (os === "win32") {
    run(`powershell -Command "Compress-Archive -Path '${docsDir}\\*' -DestinationPath '${docsZipPath}' -Force"`);
    run(`powershell -Command "Remove-Item -Recurse -Force '${docsDir}'"`);
  } else {
    run(`cd '${DIST}' && zip -r '${docsZip}' whisp-chromium/ && rm -rf whisp-chromium/`);
  }
  console.log(`  Created: ${docsZipPath}`);
}

header("Packaging complete");
console.log(`All artifacts in: ${DIST}`);
for (const f of readdirSync(DIST)) {
  const p = join(DIST, f);
  const size = statSync(p).size;
  console.log(`  ${f}  (${(size / 1024 / 1024).toFixed(1)} MB)`);
}
console.log();
