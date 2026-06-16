#!/usr/bin/env node
import { execSync } from "child_process";
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const platform = process.argv[2] || process.platform;

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function header(msg) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}\n`);
}

// Platform aliases
const PLATFORM_MAP = {
  linux: "linux",
  win: "win32",
  win32: "win32",
  windows: "win32",
  mac: "darwin",
  darwin: "darwin",
  macos: "darwin",
};
const targetOs = PLATFORM_MAP[platform];
if (!targetOs) {
  console.error(`Unknown platform: ${platform}`);
  console.error(`Usage: pnpm build:linux|build:win|build:mac`);
  process.exit(1);
}

const osName = { linux: "linux", win32: "windows", darwin: "macos" }[targetOs];

header(`Whisp Build for ${osName}`);
console.log(`Target OS:  ${targetOs} (${osName})`);
console.log(`Root:       ${ROOT}`);
console.log(`Output:     ${DIST}\n`);

if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true });
}

// 1. Install dependencies
header("[1/4] Installing dependencies");
run("pnpm install --frozen-lockfile");

// 2. Build all Node packages
header("[2/4] Building all packages");
run("pnpm build");

// 3. Package the extension
header("[3/4] Packaging Chrome Extension");
const extDist = join(ROOT, "chromium-extension", "dist");
if (existsSync(extDist)) {
  const zipName = `Whisp-Extension-${osName}.zip`;
  const zipPath = join(DIST, zipName);
  if (targetOs === "win32") {
    run(`powershell -Command "Compress-Archive -Path '${extDist}\\*' -DestinationPath '${zipPath}' -Force"`);
  } else {
    run(`cd '${join(ROOT, "chromium-extension")}' && zip -r '${zipPath}' dist/`);
  }
  console.log(`  Created: ${zipPath}`);
}

// 4. Generate platform-specific installer artifacts
header("[4/4] Generating installer artifacts");

const brandingDir = join(ROOT, "branding_assets");
const version = "1.0.0";

if (targetOs === "linux") {
  // Create a DEB package structure (metadata only — real build needs Chromium)
  const debDir = join(DIST, "whisp-deb-staging");
  mkdirSync(join(debDir, "DEBIAN"), { recursive: true });
  mkdirSync(join(debDir, "usr", "bin"), { recursive: true });
  mkdirSync(join(debDir, "usr", "share", "applications"), { recursive: true });
  mkdirSync(join(debDir, "usr", "share", "icons", "hicolor", "256x256", "apps"), { recursive: true });

  writeFileSync(join(debDir, "DEBIAN", "control"), [
    "Package: whisp",
    `Version: ${version}`,
    "Section: web",
    "Priority: optional",
    "Architecture: amd64",
    "Maintainer: WhispAI <dev@whisp.ai>",
    "Description: AI-powered browser",
    " Empowering language to transform human words into action.",
    "",
  ].join("\n"));

  writeFileSync(join(debDir, "usr", "share", "applications", "whisp.desktop"), [
    "[Desktop Entry]",
    "Name=Whisp",
    "Comment=AI-powered browser",
    "Exec=whisp %U",
    "Icon=whisp",
    "Type=Application",
    "Categories=Network;WebBrowser;",
    "Terminal=false",
    "MimeType=text/html;text/xml;application/xhtml+xml;",
    "",
  ].join("\n"));

  if (existsSync(join(brandingDir, "product_logo_256.png"))) {
    copyFileSync(join(brandingDir, "product_logo_256.png"),
                 join(debDir, "usr", "share", "icons", "hicolor", "256x256", "apps", "whisp.png"));
  }

  // Build DEB
  run(`dpkg-deb --build '${debDir}' '${DIST}/Whisp.deb'`);
  run(`rm -rf '${debDir}'`);
  console.log("  Created: Whisp.deb");

  // Copy for RPM (same content, different extension — real build uses Chromium's linux_package_rpm)
  if (existsSync(join(DIST, "Whisp.deb"))) {
    copyFileSync(join(DIST, "Whisp.deb"), join(DIST, "Whisp.rpm"));
    console.log("  Created: Whisp.rpm (stub — use chromium/packaging/linux/build_rpm.sh for real RPM)");
  }

  // AppImage stub
  writeFileSync(join(DIST, "Whisp.AppImage"), [
    "#!/bin/bash",
    "# Whisp AppImage",
    "# Build from Chromium source: bash chromium/packaging/linux/build_appimage.sh",
    "# Requires appimagetool from https://github.com/AppImage/AppImageKit",
    "echo 'Whisp AppImage — build from source. See chromium/contributing.md'",
    "exit 1",
  ].join("\n"));
  console.log("  Created: Whisp.AppImage (stub — run chromium/packaging/linux/build_appimage.sh to build)");

} else if (targetOs === "win32") {
  // EXE installer stub
  writeFileSync(join(DIST, "Whisp-Setup.exe"), Buffer.alloc(0));
  console.log("  Created: Whisp-Setup.exe (stub — run chromium/packaging/windows/build_exe.ps1 to build)");

  // MSI installer stub
  writeFileSync(join(DIST, "Whisp.msi"), Buffer.alloc(0));
  console.log("  Created: Whisp.msi (stub — run chromium/packaging/windows/build_msi.ps1 to build)");

} else if (targetOs === "darwin") {
  // Build .app bundle (placeholder)
  const appDir = join(DIST, "Whisp.app", "Contents", "MacOS");
  mkdirSync(appDir, { recursive: true });
  mkdirSync(join(DIST, "Whisp.app", "Contents", "Resources"), { recursive: true });

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>Whisp</string>
  <key>CFBundleIdentifier</key>
  <string>ai.whisp.browser</string>
  <key>CFBundleName</key>
  <string>Whisp</string>
  <key>CFBundleVersion</key>
  <string>${version}</string>
  <key>CFBundleShortVersionString</key>
  <string>${version}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
</dict>
</plist>`;

  writeFileSync(join(DIST, "Whisp.app", "Contents", "Info.plist"), plist);
  writeFileSync(join(DIST, "Whisp.app", "Contents", "MacOS", "Whisp"),
    "#!/bin/bash\necho 'Whisp.app — build from Chromium source. See chromium/contributing.md'\nexit 1\n");
  console.log("  Created: Whisp.app (stub — run autoninja -C out/release chrome to build)");

  // DMG stub
  writeFileSync(join(DIST, "Whisp.dmg"), Buffer.alloc(0));
  console.log("  Created: Whisp.dmg (stub — run chromium/packaging/macos/build_dmg.sh to build)");
}

// Summary
header("Build complete — artifacts in dist/");
const files = readdirSync(DIST).filter(f => !f.endsWith(".zip") || f.includes(osName));
for (const f of files) {
  const p = join(DIST, f);
  if (statSync(p).isFile()) {
    const size = statSync(p).size;
    const label = size === 0 ? "(stub — build from source for real artifact)" : `(${(size / 1024 / 1024).toFixed(1)} MB)`;
    console.log(`  ${f}  ${label}`);
  }
}
console.log();
