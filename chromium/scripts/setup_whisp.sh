#!/bin/bash

# Whisp Complete Setup Script
# Runs all necessary scripts to set up Whisp in Chromium

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}"
echo "========================================="
echo "  Whisp Complete Setup"
echo "========================================="
echo -e "${NC}"
echo ""
echo "This script will:"
echo "  1. Apply all patches"
echo "  2. Copy branding assets"
echo "  3. Copy icon assets"
echo "  4. Copy extension to resources"
echo ""

# Step 1: Apply patches
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1/4: Applying Patches${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if bash "$SCRIPT_DIR/apply_patches.sh"; then
    echo -e "${GREEN}✅ Patches applied successfully${NC}"
else
    echo -e "${RED}❌ Patch application failed${NC}"
    exit 1
fi

echo ""
echo ""

# Step 2: Apply branding assets
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2/4: Applying Branding Assets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if bash "$SCRIPT_DIR/apply_branding_assets.sh"; then
    echo -e "${GREEN}✅ Branding assets applied successfully${NC}"
else
    echo -e "${RED}❌ Branding assets application failed${NC}"
    exit 1
fi

echo ""
echo ""

# Step 3: Apply icon assets
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3/4: Applying Icon Assets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if bash "$SCRIPT_DIR/apply_icon_assets.sh"; then
    echo -e "${GREEN}✅ Icon assets applied successfully${NC}"
else
    echo -e "${RED}❌ Icon assets application failed${NC}"
    exit 1
fi

echo ""
echo ""

# Step 4: Copy extension to resources
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4/4: Copying Extension to Resources${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if bash "$SCRIPT_DIR/copy_extension_to_resources.sh"; then
    echo -e "${GREEN}✅ Extension copied successfully${NC}"
else
    echo -e "${RED}❌ Extension copy failed${NC}"
    exit 1
fi

echo ""
echo ""

# Final summary
echo -e "${CYAN}"
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo -e "${NC}"
echo ""
echo -e "${GREEN}✅ All steps completed successfully!${NC}"
echo ""
# Detect OS for platform-specific instructions
case "$(uname -s)" in
    Darwin)
        BUILD_TARGET="chrome"
        RUN_CMD="./out/fast/Whisp.app/Contents/MacOS/Whisp"
        ;;
    Linux)
        BUILD_TARGET="chrome"
        RUN_CMD="./out/fast/chrome"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        BUILD_TARGET="chrome.exe"
        RUN_CMD="out\\fast\\chrome.exe"
        ;;
    *)
        BUILD_TARGET="chrome"
        RUN_CMD="./out/fast/chrome"
        ;;
esac

echo "Next steps:"
echo "  1. Build Chromium: autoninja -C out/fast $BUILD_TARGET"
echo "  2. Run Whisp: $RUN_CMD"
echo ""
