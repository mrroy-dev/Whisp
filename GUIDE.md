# Whisp User Guide

> Empowering language to transform human words into action.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Method 1: Chrome Extension (Quickest)](#method-1-chrome-extension-quickest)
- [Method 2: Full Whisp Browser (Linux)](#method-2-full-whisp-browser-linux)
- [Method 3: Full Whisp Browser (Windows)](#method-3-full-whisp-browser-windows)
- [Method 4: Full Whisp Browser (macOS)](#method-4-full-whisp-browser-macos)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Whisp has two components:

| Component | What it does | How to install |
|-----------|-------------|----------------|
| **Whisp Extension** | AI assistant sidebar, browser automation, multi-agent planning | Load as unpacked extension in Chrome/Edge/Brave (2 minutes) |
| **Whisp Browser** | Full rebranded Chromium with built-in AI assistant | Build from source (1-3 hours, requires 20GB+ free space) |

---

## Quick Start

**If you just want the AI assistant:** jump to [Method 1](#method-1-chrome-extension-quickest).

**If you want the full browser:** jump to your platform:
- [Linux](#method-2-full-whisp-browser-linux)
- [Windows](#method-3-full-whisp-browser-windows)
- [macOS](#method-4-full-whisp-browser-macos)

---

## Method 1: Chrome Extension (Quickest)

Works on **Linux, Windows, and macOS** in any Chrome-based browser (Chrome, Edge, Brave, Opera, Vivaldi).

### Step 1: Build the extension

```bash
git clone https://github.com/mrroy-dev/Whisp.git
cd Whisp
pnpm install
cd chromium-extension
pnpm build
```

The extension output is at `chromium-extension/dist/`.

Alternatively, run the platform build script:
```bash
pnpm build:linux   # or: pnpm build:win / pnpm build:mac
```

The packaged extension is at `dist/Whisp-Extension-linux.zip` (or `-windows.zip` / `-macos.zip`).

### Step 2: Load in Chrome

1. Open **chrome://extensions**
2. Enable **Developer mode** (toggle in top-right corner)
3. Drag and drop the `dist/Whisp-Extension-*.zip` file onto the page
4. Click the puzzle icon in the toolbar → pin **Whisp**
5. Click the Whisp icon to open the side panel

### Step 3: Configure your AI provider

1. Right-click the Whisp icon → **Options**
2. Enter your AI provider details:
   - **Provider:** OpenAI / Anthropic / Google / Azure / OpenRouter / custom
   - **Model:** e.g. `gpt-4o`, `claude-sonnet-4-20250514`, `gemini-2.5-pro`
   - **API Key:** your API key from the provider
   - **Base URL:** (optional) for proxy or self-hosted endpoints
3. Click **Save**

---

## Method 2: Full Whisp Browser (Linux)

Produces a **real `.deb` package** that installs Whisp as a system application.

### Prerequisites

```bash
sudo apt update
sudo apt install git python3 pnpm nodejs npm
```

### Install depot_tools

```bash
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PWD/depot_tools:$PATH"
# Add to ~/.bashrc for persistence:
echo 'export PATH="$PATH:'"$PWD/depot_tools"'"' >> ~/.bashrc
```

### Build Whisp

```bash
# 1. Clone Whisp
git clone https://github.com/mrroy-dev/Whisp.git
cd Whisp
pnpm install

# 2. Build the extension
cd chromium-extension && pnpm build && cd ..

# 3. Check out Chromium source (parent directory)
cd ..
mkdir chromium && cd chromium
fetch --nohooks chromium
cd src && git checkout 146.0.7647.0
cd .. && gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d

# 4. Apply Whisp patches
cd ../Whisp
bash chromium/scripts/setup_whisp.sh

# 5. Configure GN for release
cd ../chromium/src
gn gen out/release --args="import(\"//../../Whisp/chromium/gn/linux.gni\")"

# 6. Build the browser (1-3 hours)
autoninja -C out/release chrome

# 7. Build DEB package
autoninja -C out/release linux_package_deb
```

### Install

```bash
# The DEB is at out/release/*.deb
sudo dpkg -i out/release/whisp_*.deb

# Run
whisp
```

### Alternative: AppImage

After building the Chrome binary (`autoninja -C out/release chrome`):

```bash
# Requires appimagetool from https://github.com/AppImage/AppImageKit
bash ../Whisp/chromium/packaging/linux/build_appimage.sh out/release
# Output: dist/Whisp-x86_64.AppImage
chmod +x dist/Whisp-x86_64.AppImage
./dist/Whisp-x86_64.AppImage
```

### Build RPM

```bash
autoninja -C out/release linux_package_rpm
# Output: out/release/*.rpm
sudo rpm -ivh out/release/whisp-*.rpm
```

---

## Method 3: Full Whisp Browser (Windows)

### Prerequisites

- Windows 10 or later
- Visual Studio 2022 with C++ tools
- depot_tools
- Node.js + pnpm

### Build

```powershell
# 1. Clone Whisp
git clone https://github.com/mrroy-dev/Whisp.git
cd Whisp
pnpm install
cd chromium-extension
pnpm build
cd ..

# 2. Check out Chromium source (parent directory)
cd ..
mkdir chromium; cd chromium
fetch --nohooks chromium
cd src
git checkout 146.0.7647.0
cd ..
# Edit .gclient — add: "revision": "f2722c85cc7f44f035bfc91b40406883e8f3b07d"
gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d

# 3. Apply Whisp patches
cd ..\Whisp
.\chromium\scripts\setup_whisp.ps1

# 4. Configure and build
cd ..\chromium\src
gn gen out\release --args="import(\"//../../Whisp/chromium/gn/windows.gni\")"
autoninja -C out\release chrome

# 5. Build installers
autoninja -C out\release mini_installer      # NSIS EXE
autoninja -C out\release chrome_msi          # WiX MSI
```

### Run

```powershell
out\release\chrome.exe
```

---

## Method 4: Full Whisp Browser (macOS)

### Prerequisites

- Xcode 15+ and Command Line Tools
- depot_tools
- Node.js + pnpm

### Build

```bash
# 1. Clone Whisp
git clone https://github.com/mrroy-dev/Whisp.git
cd Whisp
pnpm install
cd chromium-extension && pnpm build && cd ..

# 2. Check out Chromium source
cd ..
mkdir chromium && cd chromium
fetch --nohooks chromium
cd src && git checkout 146.0.7647.0
cd .. && gclient sync --with_branch_heads --with_tags -r src@f2722c85cc7f44f035bfc91b40406883e8f3b07d

# 3. Apply Whisp patches
cd ../Whisp
bash chromium/scripts/setup_whisp.sh

# 4. Configure and build
cd ../chromium/src
gn gen out/release --args="import(\"//../../Whisp/chromium/gn/macos.gni\")"
autoninja -C out/release chrome

# 5. Create DMG
bash ../Whisp/chromium/packaging/macos/build_dmg.sh out/release
```

### Run

```bash
open out/release/Whisp.app
# Or:
./out/release/Whisp.app/Contents/MacOS/Whisp
```

### Code Sign (for distribution)

```bash
bash ../Whisp/chromium/packaging/macos/build_app.sh out/release "Developer ID Application: Your Name (TEAMID)"
```

---

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Default OpenAI API key |
| `ANTHROPIC_API_KEY` | Default Anthropic API key |
| `OPENAI_BASE_URL` | Custom API base URL |
| `CHROMIUM_SRC` | Override Chromium source path (for build scripts) |

### LLM Config (Extension)

Configured via the extension Options page. Supported providers:

| Provider | `provider` value | SDK package |
|----------|-----------------|-------------|
| OpenAI | `openai` | `@ai-sdk/openai` |
| Anthropic | `anthropic` | `@ai-sdk/anthropic` |
| Google Gemini | `google` | `@ai-sdk/google` |
| Azure OpenAI | `azure` | `@ai-sdk/azure` |
| Amazon Bedrock | `bedrock` | `@ai-sdk/amazon-bedrock` |
| OpenRouter | `openrouter` | `@openrouter/ai-sdk-provider` |
| Any OpenAI-compatible | `openai-compatible` | `@ai-sdk/openai-compatible` |

---

## Troubleshooting

### Extension won't load

- Make sure Developer mode is enabled in `chrome://extensions`
- The extension requires Manifest V3 (Chrome 88+)

### Patch fails to apply

```bash
cd ../chromium/src
git checkout .
cd ../../Whisp
bash chromium/scripts/apply_patches.sh
```

### Build takes too long

- First build is 1-3 hours; incremental builds are much faster
- Use `autoninja -j 4 -C out/release chrome` to limit parallel jobs
- Add `is_component_build = true` to GN args for faster linking (debug only)

### "depot_tools not found"

```bash
export PATH="$PATH:/path/to/depot_tools"
```

### More help

- [GitHub Issues](https://github.com/mrroy-dev/Whisp/issues)
- [Contributing Guide](chromium/contributing.md)
