#!/usr/bin/env bash
# Jalankan app React Native di Android (Metro + install ke emulator/HP).
# Pemakaian (dari root repo):  bash scripts/run-mobile.sh

set -e
cd "$(dirname "$0")/../apps/mobile"

if [ ! -d node_modules ]; then
  echo "→ node_modules belum ada, menjalankan npm install..."
  npm install
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ .env dibuat dari .env.example"
fi

echo "→ Menjalankan npm run android..."
exec npm run android
