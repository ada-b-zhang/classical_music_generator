#!/bin/bash

# Exit on error
set -e

# Check for input
if [ -z "$1" ]; then
  echo "Usage: ./make_icns.sh path/to/icon.png"
  exit 1
fi

ICON_PNG="$1"
ICON_NAME=$(basename "$ICON_PNG" .png)
ICONSET_DIR="${ICON_NAME}.iconset"
ICNS_FILE="${ICON_NAME}.icns"

# Create iconset directory
mkdir -p "$ICONSET_DIR"

# Generate icon sizes
sips -z 16 16     "$ICON_PNG" --out "$ICONSET_DIR/icon_16x16.png"
sips -z 32 32     "$ICON_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"
sips -z 32 32     "$ICON_PNG" --out "$ICONSET_DIR/icon_32x32.png"
sips -z 64 64     "$ICON_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"
sips -z 128 128   "$ICON_PNG" --out "$ICONSET_DIR/icon_128x128.png"
sips -z 256 256   "$ICON_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png"
sips -z 256 256   "$ICON_PNG" --out "$ICONSET_DIR/icon_256x256.png"
sips -z 512 512   "$ICON_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png"
sips -z 512 512   "$ICON_PNG" --out "$ICONSET_DIR/icon_512x512.png"
cp "$ICON_PNG"            "$ICONSET_DIR/icon_512x512@2x.png"

# Create ICNS file
iconutil -c icns "$ICONSET_DIR" -o "$ICNS_FILE"

# Cleanup
rm -r "$ICONSET_DIR"

echo "✅ Created $ICNS_FILE"
