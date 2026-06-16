#!/bin/bash
# Build Whisp DMG for macOS
# Assumes Chromium has already been built producing Whisp.app

set -e

WHISP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHROMIUM_OUT="${1:-$WHISP_ROOT/../chromium/src/out/whisp}"
OUTPUT_DIR="${2:-$WHISP_ROOT/dist}"

echo "========================================"
echo "  Whisp DMG Builder"
echo "========================================"
echo "Chromium out: $CHROMIUM_OUT"
echo "Output:       $OUTPUT_DIR"
echo ""

if [ ! -d "$CHROMIUM_OUT" ]; then
    echo "ERROR: Chromium build output not found at $CHROMIUM_OUT"
    exit 1
fi

APP_BUNDLE="$CHROMIUM_OUT/Whisp.app"
if [ ! -d "$APP_BUNDLE" ]; then
    echo "ERROR: Whisp.app not found at $APP_BUNDLE"
    echo "Build Chromium first: autoninja -C $CHROMIUM_OUT chrome"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

DMG_NAME="Whisp.dmg"
DMG_PATH="$OUTPUT_DIR/$DMG_NAME"
VOLUME_NAME="Whisp"
STAGING_DIR="$OUTPUT_DIR/.dmg_staging"

# Cleanup any previous staging
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

# Copy the .app bundle
cp -R "$APP_BUNDLE" "$STAGING_DIR/Whisp.app"

# Create Applications link
ln -s /Applications "$STAGING_DIR/Applications"

# Create DMG
if [ -f "$DMG_PATH" ]; then
    rm "$DMG_PATH"
fi

hdiutil create -volname "$VOLUME_NAME" \
    -srcfolder "$STAGING_DIR" \
    -ov -format UDZO \
    "$DMG_PATH"

# Cleanup
rm -rf "$STAGING_DIR"

echo "DMG created: $DMG_PATH"
echo "Done."
