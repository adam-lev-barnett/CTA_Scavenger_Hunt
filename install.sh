#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[install] Project root: $ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "[install] Error: npm is not installed or not in PATH."
  exit 1
fi

if [[ ! -x "./mvnw" ]]; then
  echo "[install] Making Maven wrapper executable..."
  chmod +x ./mvnw
fi

echo "[install] Downloading backend dependencies (Maven)..."
./mvnw -q -DskipTests compile

echo "[install] Installing frontend dependencies (npm)..."
npm --prefix frontend install

if [[ -f "frontend/.env.example" && ! -f "frontend/.env" ]]; then
  cp frontend/.env.example frontend/.env
  echo "[install] Created frontend/.env from frontend/.env.example"
fi

echo "[install] Done."
