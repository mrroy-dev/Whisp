#!/bin/bash
# Verify and prepare Whisp.app bundle for macOS
# This script validates the .app bundle structure and optionally signs it.

set -e

WHISP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHROMIUM_OUT="${1:-$WHISP_ROOT/../chromium/src/out/whisp}"
SIGN_IDENTITY="${2:-}"  # e.g. "Developer ID Application: Your Name (TEAMID)"

echo "========================================"
echo "  Whisp macOS App Bundle"
echo "========================================"

APP_BUNDLE="$CHROMIUM_OUT/Whisp.app"
if [ ! -d "$APP_BUNDLE" ]; then
    echo "ERROR: Whisp.app not found at $APP_BUNDLE"
    exit 1
fi

echo "App bundle: $APP_BUNDLE"
echo ""

# Verify bundle structure
echo "Verifying bundle structure..."
if [ ! -d "$APP_BUNDLE/Contents/MacOS" ]; then
    echo "ERROR: Missing Contents/MacOS"
    exit 1
fi
if [ ! -f "$APP_BUNDLE/Contents/Info.plist" ]; then
    echo "ERROR: Missing Info.plist"
    exit 1
fi
if [ ! -f "$APP_BUNDLE/Contents/MacOS/Whisp" ]; then
    echo "ERROR: Missing Whisp executable"
    exit 1
fi
echo "  Bundle structure OK"

# Display architecture
echo "Architecture(s):"
lipo -info "$APP_BUNDLE/Contents/MacOS/Whisp" 2>/dev/null || file "$APP_BUNDLE/Contents/MacOS/Whisp"

# Optional: code sign
if [ -n "$SIGN_IDENTITY" ]; then
    echo ""
    echo "Signing with identity: $SIGN_IDENTITY"
    codesign --force --deep --sign "$SIGN_IDENTITY" "$APP_BUNDLE"
    echo "Signing complete."
    
    echo ""
    echo "Verifying signature..."
    codesign -dvvv "$APP_BUNDLE" 2>&1 | head -10
fi

echo ""
echo "App bundle ready: $APP_BUNDLE"
echo "Done."
