#!/bin/bash
# Build Whisp RPM package for Linux
# Uses Chromium's built-in linux_package_rpm target when possible.

set -e

WHISP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHROMIUM_OUT="${1:-$WHISP_ROOT/../chromium/src/out/whisp}"
OUTPUT_DIR="${2:-$WHISP_ROOT/dist}"

echo "========================================"
echo "  Whisp RPM Package Builder"
echo "========================================"
echo "Chromium out: $CHROMIUM_OUT"
echo "Output:       $OUTPUT_DIR"
echo ""

if [ -d "$CHROMIUM_OUT" ] && command -v autoninja &> /dev/null; then
    echo "Building RPM via Chromium's ninja target..."
    cd "$CHROMIUM_OUT/.."
    autoninja -C "$CHROMIUM_OUT" linux_package_rpm
    echo "RPM package built by Chromium build system."
    find "$CHROMIUM_OUT" -name "*.rpm" -exec cp {} "$OUTPUT_DIR/" \;
else
    echo "Chromium out directory not found or autoninja unavailable."
    echo "Skipping RPM build. Build Chromium first, then run this script with the output path."
    exit 1
fi

echo "Done."
