#!/bin/bash
# Build Whisp DEB package for Linux
# Uses Chromium's built-in linux_package_deb target when possible,
# or creates a standalone DEB from a pre-built binary.

set -e

WHISP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHROMIUM_OUT="${1:-$WHISP_ROOT/../chromium/src/out/whisp}"
OUTPUT_DIR="${2:-$WHISP_ROOT/dist}"

echo "========================================"
echo "  Whisp DEB Package Builder"
echo "========================================"
echo "Chromium out: $CHROMIUM_OUT"
echo "Output:       $OUTPUT_DIR"
echo ""

if [ -d "$CHROMIUM_OUT" ] && command -v autoninja &> /dev/null; then
    echo "Building DEB via Chromium's ninja target..."
    cd "$CHROMIUM_OUT/.."
    autoninja -C "$CHROMIUM_OUT" linux_package_deb
    echo "DEB package built by Chromium build system."
    find "$CHROMIUM_OUT" -name "*.deb" -exec cp {} "$OUTPUT_DIR/" \;
else
    echo "Chromium out directory not found or autoninja unavailable."
    echo "Skipping DEB build. Build Chromium first, then run this script with the output path."
    exit 1
fi

echo "Done."
