# Whisp

> Empowering language to transform human words into action.

Whisp is an AI-powered browser — a customized Chromium build with an integrated AI assistant, enhanced theming, and multi-agent planning capabilities.

## Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | >= 18   |
| pnpm        | >= 8    |
| Python      | >= 3.x  |
| Git         | any     |

### Install & Build (Node packages)

```bash
git clone https://github.com/WhispAI/whisp.git
cd whisp
pnpm install
pnpm build          # builds core + extension + chromium-extension
```

### Run Tests

```bash
pnpm test
```

### Build the Chrome Extension

```bash
cd chromium-extension
pnpm build
# Output: chromium-extension/dist/
```

### Build the Full Whisp Browser

The Whisp browser is a customized Chromium build. See [chromium/contributing.md](chromium/contributing.md) for detailed setup.

**Linux / macOS:**
```bash
bash chromium/scripts/setup_whisp.sh
cd ../chromium/src
autoninja -C out/whisp chrome
```

**Windows (PowerShell):**
```powershell
.\chromium\scripts\setup_whisp.ps1
cd ..\chromium\src
autoninja -C out\whisp chrome
```

---

## Platform Support

| Feature | Linux | macOS | Windows |
|---------|-------|-------|---------|
| Node packages build | ✓ | ✓ | ✓ |
| Chrome Extension build | ✓ | ✓ | ✓ |
| Chromium browser build | ✓ | ✓ | ✓ |
| DEB package | ✓ | — | — |
| RPM package | ✓ | — | — |
| AppImage | ✓ | — | — |
| DMG installer | — | ✓ | — |
| .app bundle | — | ✓ | — |
| EXE installer (NSIS) | — | — | ✓ |
| MSI installer (WiX) | — | — | ✓ |
| CI (GitHub Actions) | ✓ | ✓ | ✓ |

### Linux

```bash
# DEB package
autoninja -C out/whisp linux_package_deb

# RPM package
autoninja -C out/whisp linux_package_rpm

# AppImage (requires appimagetool)
bash chromium/packaging/linux/build_appimage.sh out/whisp

# Run
./out/whisp/chrome
```

### macOS

```bash
# Build .app bundle
autoninja -C out/whisp chrome

# Create DMG
bash chromium/packaging/macos/build_dmg.sh out/whisp

# Run
./out/whisp/Whisp.app/Contents/MacOS/Whisp

# Code sign (for distribution)
bash chromium/packaging/macos/build_app.sh out/whisp "Developer ID Application: Your Name (TEAMID)"
```

### Windows

```powershell
# EXE installer (NSIS)
autoninja -C out\whisp mini_installer

# MSI installer (WiX)
autoninja -C out\whisp chrome_msi

# Run
out\whisp\chrome.exe
```

---

## Build Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all Node packages (core, extension, chromium-extension) |
| `pnpm test` | Run all tests |
| `pnpm build:all` | Full build + package (see below) |
| `pnpm package` | Package extension + branding assets into `dist/` |
| `pnpm build:chromium` | Build Chromium browser with Whisp patches |
| `pnpm release <version>` | Prepare a release (bump version, build, package, archive) |

### Full Build (All Platforms)

```bash
# Cross-platform Node.js build (runs everywhere)
pnpm build:all
# Output: dist/whisp-extension-*.zip

# Package artifacts only
pnpm package
# Output: dist/*.zip
```

### Chromium Browser Build

```bash
# Cross-platform Chromium build
pnpm build:chromium

# With packaging flags:
pnpm build:chromium -- --deb          # Linux DEB
pnpm build:chromium -- --rpm          # Linux RPM
pnpm build:chromium -- --appimage     # Linux AppImage
pnpm build:chromium -- --dmg          # macOS DMG
pnpm build:chromium -- --exe          # Windows EXE
pnpm build:chromium -- --msi          # Windows MSI
```

### Release

```bash
# Prepare a release (versions, build, package, archive)
pnpm release 1.1.0

# Then push tags:
git tag v1.1.0
git push --tags
```

---

## Repository Structure

```
whisp/
├── packages/
│   ├── core/                    @whisp-ai/core (Rollup, dual CJS/ESM)
│   └── extension/               @whisp-ai/extension (Rollup)
├── chromium-extension/          Chrome Extension (Webpack, MV3)
├── chromium/                    Chromium customization
│   ├── patches/                 Git patches to apply to Chromium
│   ├── scripts/                 Setup scripts (bash + PowerShell)
│   ├── packaging/               Platform-specific packaging
│   ├── config/patches.list      Patch application order
│   └── contributing.md          Chromium build guide
├── branding_assets/             Logos, icons for Chromium rebranding
├── scripts/                     Cross-platform Node.js build scripts
└── .github/workflows/           CI + release workflows
```

## License

MIT
