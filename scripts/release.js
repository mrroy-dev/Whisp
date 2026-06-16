#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const pkgPath = join(ROOT, "package.json");

function run(cmd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function header(msg) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}\n`);
}

const version = process.argv[2];
if (!version) {
  console.error("Usage: scripts/release.js <version>");
  console.error("Example: scripts/release.js 1.1.0");
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Invalid version: ${version}. Use semver (e.g. 1.1.0)`);
  process.exit(1);
}

header(`Preparing release v${version}`);
console.log(`Platform: ${process.platform}\n`);

// 1. Update package.json version
header("[1/5] Updating package versions");
const rootPkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
rootPkg.version = version;
writeFileSync(pkgPath, JSON.stringify(rootPkg, null, 2) + "\n");
console.log(`  Root version set to ${version}`);

// Update workspace packages
for (const pkg of [
  "packages/core/package.json",
  "packages/extension/package.json",
  "chromium-extension/package.json",
]) {
  const p = join(ROOT, pkg);
  if (existsSync(p)) {
    const data = JSON.parse(readFileSync(p, "utf-8"));
    data.version = version;
    writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
    console.log(`  ${pkg} version set to ${version}`);
  }
}

// 2. Build everything
header("[2/5] Building all packages");
run("node scripts/build.js");

// 3. Package artifacts
header("[3/5] Packaging artifacts");
run("node scripts/package.js");

// 4. Create release archive
header("[4/5] Creating release archive");
const distDir = join(ROOT, "dist");
const osMap = { linux: "linux", darwin: "macos", win32: "windows" };
const osName = osMap[process.platform] || process.platform;

run(`cd "${ROOT}" && tar -czf "whisp-${version}-${osName}.tar.gz" dist/ chromium/scripts/ chromium/config/ chromium/packaging/ chromium/contributing.md`);

// 5. Git tag
header("[5/5] Git tag");
console.log("To publish this release:");
console.log(`  git add -A`);
console.log(`  git commit -m "chore: release v${version}"`);
console.log(`  git tag v${version}`);
console.log(`  git push --tags`);

header("Release ready");
console.log(`Version: v${version}`);
console.log(`Artifacts: ${join(ROOT, `whisp-${version}-${osName}.tar.gz`)}`);
console.log();
