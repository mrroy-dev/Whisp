#!/bin/bash
# Build Whisp AppImage for Linux
# Requires: appimagetool (from https://github.com/AppImage/AppImageKit)
# Prerequisites: Chromium must be built first (autoninja -C out/whisp chrome)

set -e

WHISP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHROMIUM_OUT="${1:-$WHISP_ROOT/../chromium/src/out/whisp}"
OUTPUT_DIR="${2:-$WHISP_ROOT/dist}"

echo "========================================"
echo "  Whisp AppImage Builder"
echo "========================================"
echo "Chromium out: $CHROMIUM_OUT"
echo "Output:       $OUTPUT_DIR"
echo ""

if [ ! -d "$CHROMIUM_OUT" ]; then
    echo "ERROR: Chromium build output not found at $CHROMIUM_OUT"
    echo "Build Chromium first: autoninja -C $CHROMIUM_OUT chrome"
    exit 1
fi

if [ ! -f "$CHROMIUM_OUT/chrome" ]; then
    echo "ERROR: chrome binary not found in $CHROMIUM_OUT"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Create AppDir structure
APPDIR="$OUTPUT_DIR/Whisp.AppDir"
mkdir -p "$APPDIR/usr/bin"
mkdir -p "$APPDIR/usr/share/applications"
mkdir -p "$APPDIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$APPDIR/usr/share/icons/hicolor/48x48/apps"
mkdir -p "$APPDIR/usr/share/icons/hicolor/16x16/apps"

# Copy binary and resources
cp "$CHROMIUM_OUT/chrome" "$APPDIR/usr/bin/whisp"
cp "$WHISP_ROOT/branding_assets/product_logo_256.png" "$APPDIR/usr/share/icons/hicolor/256x256/apps/whisp.png"
cp "$WHISP_ROOT/branding_assets/product_logo_48.png" "$APPDIR/usr/share/icons/hicolor/48x48/apps/whisp.png"
cp "$WHISP_ROOT/branding_assets/product_logo_16.png" "$APPDIR/usr/share/icons/hicolor/16x16/apps/whisp.png"

# Copy Chrome sandbox (setuid binary)
if [ -f "$CHROMIUM_OUT/chrome_sandbox" ]; then
    cp "$CHROMIUM_OUT/chrome_sandbox" "$APPDIR/usr/bin/"
fi

# Copy locales and resources
if [ -d "$CHROMIUM_OUT/locales" ]; then
    cp -r "$CHROMIUM_OUT/locales" "$APPDIR/usr/bin/"
fi
if [ -d "$CHROMIUM_OUT/resources" ]; then
    cp -r "$CHROMIUM_OUT/resources" "$APPDIR/usr/bin/"
fi

# Link required libraries
mkdir -p "$APPDIR/usr/lib"
for lib in libnss3.so libnssutil3.so libsmime3.so libssl3.so libplds4.so libplc4.so libnspr4.so; do
    find /usr/lib -name "$lib" -exec cp {} "$APPDIR/usr/lib/" \; 2>/dev/null || true
done

# Create desktop entry
cat > "$APPDIR/usr/share/applications/whisp.desktop" << EOF
[Desktop Entry]
Name=Whisp
Comment=AI-powered browser
Exec=whisp %U
Icon=whisp
Type=Application
Categories=Network;WebBrowser;
Terminal=false
StartupNotify=true
MimeType=text/html;text/xml;application/xhtml+xml;
EOF

# Create AppRun
cat > "$APPDIR/AppRun" << 'APPRUN'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin/:${PATH}"
export LD_LIBRARY_PATH="${HERE}/usr/lib/:${LD_LIBRARY_PATH}"
exec "${HERE}/usr/bin/whisp" "$@"
APPRUN
chmod +x "$APPDIR/AppRun"

# Copy desktop file and icon to AppDir root
cp "$APPDIR/usr/share/applications/whisp.desktop" "$APPDIR/"
cp "$APPDIR/usr/share/icons/hicolor/256x256/apps/whisp.png" "$APPDIR/"

# Build AppImage
if command -v appimagetool &> /dev/null; then
    appimagetool "$APPDIR" "$OUTPUT_DIR/Whisp-x86_64.AppImage"
    echo "AppImage created: $OUTPUT_DIR/Whisp-x86_64.AppImage"
elif command -v appimagetool-x86_64.AppImage &> /dev/null; then
    appimagetool-x86_64.AppImage "$APPDIR" "$OUTPUT_DIR/Whisp-x86_64.AppImage"
    echo "AppImage created: $OUTPUT_DIR/Whisp-x86_64.AppImage"
else
    echo "WARNING: appimagetool not found."
    echo "Install from: https://github.com/AppImage/AppImageKit/releases"
    echo "AppDir prepared at: $APPDIR"
    echo "Run manually: appimagetool $APPDIR $OUTPUT_DIR/Whisp-x86_64.AppImage"
fi

echo "Done."
