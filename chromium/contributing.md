# Whisp

> Empowering language to transform human words into action.

A customized Chromium browser with integrated AI assistant and enhanced theming capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Python** 3.x
- **Git**
- **Xcode Command Line Tools** (macOS)
- **depot_tools** (for Chromium build)

### Installing depot_tools

```bash
# Clone depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

# Add to PATH (add this to your ~/.zshrc or ~/.bash_profile)
export PATH="$PATH:/path/to/depot_tools"
```

## Quick Start

> **Platform notes:**
> - **Linux/macOS:** Use the bash scripts (`chromium/scripts/*.sh`)
> - **Windows:** Use the PowerShell scripts (`chromium/scripts/*.ps1`) — run them from PowerShell or VS Code terminal

### Linux / macOS

```bash
# 1. Clone the repository
git clone https://github.com/WhispAI/whisp.git
cd whisp

# 2. Install dependencies
pnpm install

# 3. Build the extension
cd chromium-extension
pnpm build
cd ..

# 4. Clone Chromium (in parent directory)
cd ..
mkdir chromium && cd chromium
fetch --nohooks chromium

# 5. Checkout the correct version
cd src
git checkout 146.0.7647.0

# 6. Pin version in .gclient (recommended for persistence)
cd ..
# Edit .gclient and add: "revision": "f2722c85cc7f44f035bfc91b40406883e8f3b07d"

# 7. Sync dependencies (this also runs hooks automatically)
gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d

# 8. Apply Whisp patches and assets
cd ../whisp
bash chromium/scripts/setup_whisp.sh

# 9. Build Chromium
cd ../chromium/src
autoninja -C out/fast chrome

# 10. Run Whisp
# macOS:
./out/fast/Whisp.app/Contents/MacOS/Whisp
# Linux:
./out/fast/chrome
```

### Windows

```powershell
# 1. Clone the repository
git clone https://github.com/WhispAI/whisp.git
cd whisp

# 2. Install dependencies
pnpm install

# 3. Build the extension
cd chromium-extension
pnpm build
cd ..

# 4. Clone Chromium (in parent directory)
cd ..
mkdir chromium; cd chromium
fetch --nohooks chromium

# 5. Checkout the correct version
cd src
git checkout 146.0.7647.0

# 6. Pin version in .gclient
cd ..
# Edit .gclient and add: "revision": "f2722c85cc7f44f035bfc91b40406883e8f3b07d"

# 7. Sync dependencies
gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d

# 8. Apply Whisp patches and assets
cd ..\whisp
.\chromium\scripts\setup_whisp.ps1

# 9. Build Chromium
cd ..\chromium\src
autoninja -C out\fast chrome

# 10. Run Whisp
out\fast\chrome.exe
```

## Detailed Setup

### 1. Clone Whisp Repository

```bash
git clone https://github.com/WhispAI/whisp.git
cd whisp
```

### 2. Install Node Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo workspace, including:

- Core packages
- Extension packages
- Development tools

### 3. Build the Extension

The Whisp Assistant extension needs to be built before applying patches:

```bash
cd chromium-extension
pnpm build
cd ..
```

This creates the `dist` folder with the compiled extension.

### 4. Set Up Chromium

#### 4.1. Clone Chromium Source

**Important:** Chromium should be cloned in the **parent directory** of `whisp`:

```
/Users/user/Whisp/
├── whisp/          ← This repository
└── chromium/             ← Chromium source (to be created)
    └── src/
```

```bash
# Navigate to parent directory
cd ..

# Create chromium directory
mkdir chromium && cd chromium

# Fetch Chromium (this will take a while - ~20GB download)
fetch --nohooks chromium
```

#### 4.2. Checkout Correct Version

Whisp is based on Chromium version **146.0.7647.0**:

```bash
cd src
git checkout 146.0.7647.0
```

#### 4.3. Pin Version in .gclient

To ensure gclient syncs to the exact version, add the revision to your `.gclient` file:

```bash
cd ..
```

Edit `/Users/user/Whisp/chromium/.gclient` and add the revision field to the solutions array:

```python
solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {},
    "revision": "f2722c85cc7f44f035bfc91b40406883e8f3b07d",  # Add this line
  },
]
```

#### 4.4. Sync Dependencies

```bash
# Sync dependencies to exact revision f2722c85cc7f44f035bfc91b40406883e8f3b07d
# This automatically runs hooks (downloads Rust, Clang, etc.)
gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d
```

### 5. Apply Whisp Patches and Assets

The setup script applies all patches, branding assets, and extension resources:

```bash
# Navigate back to whisp directory
cd ../../whisp

# Run the complete setup script
bash chromium/scripts/setup_whisp.sh
```

This script will:

1. ✅ Apply all patches (theme, UI, branding, integration, development)
2. ✅ Copy branding assets (logos, icons)
3. ✅ Copy extension to resources

**Note:** The `patches.list` includes development patches that should be removed before production builds. Check the comments in `chromium/config/patches.list` for patches marked with "REMOVE IN PRODUCTION".

### 6. Configure Build

Create GN args for the build:

```bash
cd ../chromium/src

# Create output directory
gn gen out/fast

# Edit build configuration
gn args out/fast
```

**Development build (fast iteration):**

```gn
is_debug = false
is_component_build = true
symbol_level = 1
enable_nacl = false
blink_symbol_level = 0
is_chrome_branded = false
use_goma = false
use_jumbo_build = true
```

**Production release build:**

Use the platform-specific GN arg files in `chromium/gn/`:

```bash
# Linux
gn args out/release --args="import(\"//path/to/whisp/chromium/gn/linux.gni\")"

# macOS
gn args out/release --args="import(\"//path/to/whisp/chromium/gn/macos.gni\")"

# Windows
gn args out/release --args="import(\"//path/to/whisp/chromium/gn/windows.gni\")"
```

Or copy from `chromium/gn/` directly:
```bash
gn args out/release < ../../whisp/chromium/gn/release.gni
```

### 7. Build Chromium

```bash
# Build Chrome binary
autoninja -C out/fast chrome
```

**Platform-specific packaging targets:**

| Platform | Package | Ninja target | Script |
|----------|---------|--------------|--------|
| Linux | DEB | `autoninja -C out/release linux_package_deb` | `chromium/packaging/linux/build_deb.sh` |
| Linux | RPM | `autoninja -C out/release linux_package_rpm` | `chromium/packaging/linux/build_rpm.sh` |
| Linux | AppImage | (post-build) | `chromium/packaging/linux/build_appimage.sh` |
| macOS | .app bundle | `autoninja -C out/release chrome` | `chromium/packaging/macos/build_app.sh` |
| macOS | DMG | (post-build) | `chromium/packaging/macos/build_dmg.sh` |
| Windows | EXE (NSIS) | `autoninja -C out/release mini_installer` | `chromium/packaging/windows/build_exe.bat` / `.ps1` |
| Windows | MSI (WiX) | `autoninja -C out/release chrome_msi` | `chromium/packaging/windows/build_msi.bat` / `.ps1` |

**Build tips:**

- First build takes a long time (1-3 hours)
- Subsequent builds are much faster (incremental)
- Use `-j` flag to control parallel jobs: `autoninja -j 8 -C out/fast chrome`

### 8. Package & Run

After a successful build, package for your platform:

**Linux:**
```bash
# DEB
autoninja -C out/release linux_package_deb

# RPM
autoninja -C out/release linux_package_rpm

# AppImage (requires appimagetool)
bash ../../whisp/chromium/packaging/linux/build_appimage.sh out/release

# Run
./out/fast/chrome
```

**macOS:**
```bash
# .app is built by default with the chrome target
# Create DMG
bash ../../whisp/chromium/packaging/macos/build_dmg.sh out/release

# Verify and sign
bash ../../whisp/chromium/packaging/macos/build_app.sh out/release "Developer ID Application: Your Name (TEAMID)"

# Run
./out/fast/Whisp.app/Contents/MacOS/Whisp
```

**Windows:**
```powershell
# EXE installer (NSIS)
autoninja -C out\release mini_installer

# MSI installer (WiX)
autoninja -C out\release chrome_msi

# Run
out\fast\chrome.exe
```

## Project Structure

```
whisp/
├── .github/workflows/             CI + release workflows (GitHub Actions)
├── packages/
│   ├── core/                      @whisp-ai/core (Rollup, dual CJS/ESM)
│   └── extension/                 @whisp-ai/extension (Rollup)
├── chromium-extension/            Chrome Extension (Webpack, MV3)
├── chromium/
│   ├── config/patches.list        Ordered list of patches to apply
│   ├── gn/                        Platform-specific GN arg files
│   ├── docs/
│   │   ├── THEME_COLORS_API.md
│   │   └── WHISP_ASSISTANT_INTEGRATION.md
│   ├── patches/                   Git patches for Chromium customization
│   │   ├── branding/              Branding and URL patches
│   │   ├── theme/                 Theme system patches
│   │   ├── theme_api/             Theme Colors API patches
│   │   ├── ui/                    UI modification patches
│   │   ├── development/           Development-only (REMOVE IN PRODUCTION)
│   │   └── whisp_integration/     Assistant integration patches
│   ├── scripts/                   Setup scripts (bash + PowerShell)
│   │   ├── setup_whisp.sh/.ps1
│   │   ├── apply_patches.sh/.ps1
│   │   ├── apply_branding_assets.sh/.ps1
│   │   ├── apply_icon_assets.sh/.ps1
│   │   └── copy_extension_to_resources.sh/.ps1
│   ├── packaging/                 Platform-specific packaging scripts
│   │   ├── linux/                 AppImage, DEB, RPM
│   │   ├── macos/                 DMG, APP bundle
│   │   └── windows/               EXE, MSI installers
│   └── contributing.md            This file
├── branding_assets/               Logos, icons for Chromium rebranding
├── scripts/                       Cross-platform Node.js build scripts
│   ├── build.js                   Build orchestrator
│   ├── build_chromium.js          Chromium browser builder
│   ├── package.js                 Packaging script
│   └── release.js                 Release preparation
├── package.json                   Root workspace config
├── README.md                      Project README
└── pnpm-workspace.yaml            Workspace definition
```

## Development

### Making Changes to Patches

If you need to modify patches:

1. Make changes in Chromium source
2. Create a new patch:
   ```bash
   cd ../chromium/src
   git diff > /Users/user/Whisp/whisp/chromium/patches/your-patch-name.patch
   ```
3. Add to `chromium/config/patches.list`
4. Test by resetting and reapplying:
   ```bash
   git checkout .
   cd ../../whisp
   bash chromium/scripts/apply_patches.sh
   ```

### Updating the Extension

```bash
# Make changes in chromium-extension/
cd chromium-extension

# Build
pnpm build

# Copy to Chromium resources
cd ..
bash chromium/scripts/copy_extension_to_resources.sh

# Rebuild Chromium
cd ../chromium/src
autoninja -C out/fast chrome
```

### Available Scripts

**In the `whisp` directory (cross-platform Node.js):**

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all Node packages |
| `pnpm test` | Run all tests |
| `pnpm format` / `pnpm format:check` | Format code |
| `pnpm build:all` | Full build + package extension |
| `pnpm package` | Package extension + branding + patches into `dist/` |
| `pnpm build:chromium` | Cross-platform Chromium build (applies patches, configures GN, builds) |
| `pnpm release <version>` | Prepare a release (bump version, build, package, archive) |
| `pnpm clean` | Clean all build artifacts |

**In the `chromium/scripts` directory:**

**Linux / macOS (bash):**
```bash
# Apply all patches, assets, and extension (complete setup)
bash setup_whisp.sh

# Apply only patches
bash apply_patches.sh

# Apply only branding assets
bash apply_branding_assets.sh

# Copy only extension (bash)
bash copy_extension_to_resources.sh
```

**Windows (PowerShell):**
```powershell
# Apply all patches, assets, and extension (complete setup)
.\setup_whisp.ps1

# Apply only patches
.\apply_patches.ps1

# Apply only branding assets
.\apply_branding_assets.ps1

# Copy only extension
.\copy_extension_to_resources.ps1
```

**In the `chromium/packaging` directory:**

| Script | Platform | Description |
|--------|----------|-------------|
| `linux/build_appimage.sh` | Linux | Build AppImage (requires appimagetool) |
| `linux/build_deb.sh` | Linux | Build DEB package |
| `linux/build_rpm.sh` | Linux | Build RPM package |
| `windows/build_exe.bat` / `.ps1` | Windows | Build EXE installer (NSIS) |
| `windows/build_msi.bat` / `.ps1` | Windows | Build MSI installer (WiX) |
| `macos/build_dmg.sh` | macOS | Build DMG installer |
| `macos/build_app.sh` | macOS | Verify and sign .app bundle |

## Troubleshooting

### Build Errors

**Error: `whisp/common/BUILD.gn` not found**

- Make sure you applied the `branding_url_changes.patch`
- Run `bash chromium/scripts/apply_patches.sh` again

**Error: Patch failed to apply**

- Some patches may conflict with local changes
- Reset changes: `cd ../chromium/src && git checkout .`
- Reapply patches: `bash ../../whisp/chromium/scripts/apply_patches.sh`

**Error: Extension not found**

- Build the extension first: `cd chromium-extension && pnpm build`
- Copy to resources: `bash ../chromium/scripts/copy_extension_to_resources.sh`

### Depot Tools Issues

**Error: `gclient` or `gn` not found**

- Make sure depot_tools is in your PATH
- Restart your terminal after adding to PATH

### Version Mismatch

**Error: Wrong Chromium version**

```bash
cd chromium/src
git checkout 146.0.7647.0
cd ..
# Edit .gclient and add: "revision": "f2722c85cc7f44f035bfc91b40406883e8f3b07d"
gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d
```

### Permission Errors

**Error: Permission denied on scripts**

```bash
chmod +x chromium/scripts/*.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Format code (`pnpm format`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Resources

- [Chromium Build Documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/README.md)
- [Theme Colors API Documentation](chromium/docs/THEME_COLORS_API.md)
- [Whisp Assistant Integration](chromium/docs/WHISP_ASSISTANT_INTEGRATION.md)
- [depot_tools Tutorial](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html)

## Support

- GitHub Issues: [https://github.com/WhispAI/whisp/issues](https://github.com/WhispAI/whisp/issues)
- Documentation: [./docs](./docs)

---

Built with ❤️ by the Whisp team
