#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ ! -x "./mvnw" ]]; then
  echo "[start] Making Maven wrapper executable..."
  chmod +x ./mvnw
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[start] Error: npm is not installed or not in PATH."
  exit 1
fi

echo "[start] Starting backend on http://localhost:8080 ..."
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "[start] Starting frontend on http://localhost:5173 ..."
npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "[start] Shutting down services..."

  if kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  if kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi

  wait "$BACKEND_PID" >/dev/null 2>&1 || true
  wait "$FRONTEND_PID" >/dev/null 2>&1 || true
}

trap cleanup INT TERM EXIT

echo "[start] Services running. Press Ctrl+C to stop both."

wait -n "$BACKEND_PID" "$FRONTEND_PID"
EXIT_CODE=$?

echo "[start] One service exited (code $EXIT_CODE)."
exit "$EXIT_CODE"
