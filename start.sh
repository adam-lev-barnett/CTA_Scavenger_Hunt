#!/usr/bin/env bash

set -euo pipefail

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

BACKEND_PROFILE="${SPRING_PROFILE:-default}"
BACKEND_LOG="/tmp/chicago-backend.log"
FRONTEND_LOG="/tmp/chicago-frontend.log"

echo "[start] Starting backend on http://localhost:8080 (profile: $BACKEND_PROFILE)..."
if [[ "$BACKEND_PROFILE" == "default" ]]; then
  ./mvnw spring-boot:run >"$BACKEND_LOG" 2>&1 &
else
  ./mvnw spring-boot:run -Dspring-boot.run.profiles="$BACKEND_PROFILE" >"$BACKEND_LOG" 2>&1 &
fi
BACKEND_PID=$!

echo "[start] Starting frontend on http://localhost:5173 ..."
npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173 >"$FRONTEND_LOG" 2>&1 &
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

sleep 2
if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
  echo "[start] Backend exited early. Last logs:"
  tail -n 60 "$BACKEND_LOG" || true
  exit 1
fi
if ! kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
  echo "[start] Frontend exited early. Last logs:"
  tail -n 60 "$FRONTEND_LOG" || true
  exit 1
fi

echo "[start] Services running. Press Ctrl+C to stop both."
echo "[start] Backend logs:  $BACKEND_LOG"
echo "[start] Frontend logs: $FRONTEND_LOG"

wait -n "$BACKEND_PID" "$FRONTEND_PID"
EXIT_CODE=$?

echo "[start] One service exited (code $EXIT_CODE)."
echo "[start] Backend logs:"
tail -n 40 "$BACKEND_LOG" || true
echo "[start] Frontend logs:"
tail -n 40 "$FRONTEND_LOG" || true

exit "$EXIT_CODE"
