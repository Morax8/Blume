#!/usr/bin/env bash
# Salin font icon ke assets Android. Jalankan setelah npm install.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/node_modules/react-native-vector-icons/Fonts/Ionicons.ttf"
DST="$ROOT/android/app/src/main/assets/fonts"
mkdir -p "$DST"
cp -f "$SRC" "$DST/Ionicons.ttf"
echo "OK: $DST/Ionicons.ttf ($(du -h "$SRC" | cut -f1))"
