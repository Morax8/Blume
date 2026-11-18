#!/usr/bin/env bash
# Jalankan backend API dalam mode development.
# Pemakaian (dari root repo):  bash scripts/run-api.sh

set -e
cd "$(dirname "$0")/../services/api"

if [ ! -d .venv ]; then
  echo "→ Membuat virtualenv..."
  python -m venv .venv
fi

# Aktifkan venv (Windows git-bash atau Linux/macOS)
if [ -f .venv/Scripts/activate ]; then
  source .venv/Scripts/activate
else
  source .venv/bin/activate
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ .env dibuat dari .env.example (ganti JWT_SECRET sebelum produksi)"
fi

echo "→ Install dependency (sekali saja, aman diulang)..."
pip install -q -r requirements.txt

echo "→ Server: http://localhost:${PORT:-3000}/health"
exec uvicorn app.main:app --reload --host 0.0.0.0 --port "${PORT:-3000}"
