#!/usr/bin/env node
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const os = process.platform;

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function header(msg) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}\n`);
}

function detectChromiumOut() {
  // Try common locations
  const candidates = [
    join(ROOT, "..", "chromium", "src", "out", "whisp"),
    join(ROOT, "..", "chromium", "src", "out", "Release"),
    join(ROOT, "..", "chromium", "src", "out", "fast"),
    process.env.CHROMIUM_OUT,
  ];
  for (const dir of candidates) {
    if (dir && existsSync(dir)) return dir;
  }
  return candidates[0];
}

const CHROMIUM_OUT = resolve(process.argv[2] || detectChromiumOut());

header("Whisp Chromium Build");
console.log(`Platform:    ${os}`);
console.log(`Chromium:    ${join(ROOT, "..", "chromium", "src")}`);
console.log(`Output dir:  ${CHROMIUM_OUT}`);
console.log(`Package:     ${process.argv.includes("--package") ? "yes" : "no"}\n`);

const chromiumSrc = join(ROOT, "..", "chromium", "src");

if (!existsSync(chromiumSrc)) {
  console.error("Chromium source not found. Set up Chromium first:");
  console.error("  See chromium/contributing.md");
  process.exit(1);
}

// Step 1: Apply patches
header("[1/4] Applying Whisp patches & assets");
run(`bash "${join(ROOT, "chromium", "scripts", "setup_whisp.sh")}"`);

// Step 2: Configure GN
header("[2/4] Configuring GN build");
const gnArgs = {
  is_debug: false,
  is_component_build: false,
  symbol_level: 0,
  blink_symbol_level: 0,
  enable_nacl: false,
  treat_warnings_as_errors: false,
  is_chrome_branded: false,
};

if (os === "darwin") {
  gnArgs.mac_sdk_min = "13.0";
  gnArgs.enable_universal_binary = true;
} else if (os === "win32") {
  gnArgs.enable_hidpi = true;
} else if (os === "linux") {
  gnArgs.enable_linux_installer = true;
}

run(`gn gen "${CHROMIUM_OUT}" --args="${Object.entries(gnArgs).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" ")}"`);

// Step 3: Build Chrome
header("[3/4] Building Chrome (this will take a while...)");
run(`autoninja -C "${CHROMIUM_OUT}" chrome`);

// Step 4: Package
header("[4/4] Packaging");
if (os === "darwin") {
  const appPath = join(CHROMIUM_OUT, "Whisp.app");
  if (existsSync(appPath)) {
    console.log(`  App bundle: ${appPath}`);
  }
  // Optionally build DMG
  if (process.argv.includes("--dmg")) {
    run(`bash "${join(ROOT, "chromium", "packaging", "macos", "build_dmg.sh")}" "${CHROMIUM_OUT}"`);
  }
} else if (os === "linux") {
  if (process.argv.includes("--deb")) {
    run(`autoninja -C "${CHROMIUM_OUT}" linux_package_deb`);
  }
  if (process.argv.includes("--rpm")) {
    run(`autoninja -C "${CHROMIUM_OUT}" linux_package_rpm`);
  }
  if (process.argv.includes("--appimage")) {
    run(`bash "${join(ROOT, "chromium", "packaging", "linux", "build_appimage.sh")}" "${CHROMIUM_OUT}"`);
  }
} else if (os === "win32") {
  if (process.argv.includes("--exe")) {
    run(`autoninja -C "${CHROMIUM_OUT}" mini_installer`);
  }
  if (process.argv.includes("--msi")) {
    run(`autoninja -C "${CHROMIUM_OUT}" chrome_msi`);
  }
}

header("Build complete");
const binName = os === "win32" ? "chrome.exe" : os === "darwin" ? "Whisp.app" : "chrome";
console.log(`Binary: ${join(CHROMIUM_OUT, binName)}`);
console.log();
