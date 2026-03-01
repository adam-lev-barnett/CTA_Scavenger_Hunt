#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}CTA Scavenger Hunt - Local Startup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check and free ports
echo -e "${YELLOW}[1/4] Checking ports...${NC}"
for port in 8080 5173; do
  if lsof -i :$port >/dev/null 2>&1; then
    echo -e "${YELLOW}      Port $port is in use, clearing...${NC}"
    lsof -i :$port 2>/dev/null | awk 'NR!=1 {print $2}' | xargs -r kill -9 || true
    sleep 1
  fi
done
echo -e "${GREEN}      ✅ Ports ready${NC}"
echo ""

# Make Maven wrapper executable
if [[ ! -x "./mvnw" ]]; then
  echo -e "${YELLOW}[2/4] Making Maven wrapper executable...${NC}"
  chmod +x ./mvnw
  echo -e "${GREEN}      ✅ Maven wrapper ready${NC}"
else
  echo -e "${YELLOW}[2/4] Maven wrapper already executable${NC}"
fi
echo ""

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}ERROR: npm is not installed or not in PATH.${NC}"
  exit 1
fi
echo -e "${GREEN}      ✅ npm found${NC}"
echo ""

# Start backend
echo -e "${YELLOW}[3/4] Starting backend on http://localhost:8080...${NC}"
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run -DskipTests > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}      Backend PID: $BACKEND_PID${NC}"

# Start frontend
echo -e "${YELLOW}      Starting frontend on http://localhost:5173...${NC}"
npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}      Frontend PID: $FRONTEND_PID${NC}"
echo ""

# Wait for backend to be ready
echo -e "${YELLOW}[4/4] Waiting for backend to be ready...${NC}"
max_attempts=90
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:8080/api/test/api-keys/status >/dev/null 2>&1; then
    echo -e "${GREEN}      ✅ Backend is ready!${NC}"
    break
  fi
  attempt=$((attempt + 1))
  if [ $((attempt % 10)) -eq 0 ]; then
    echo -e "${YELLOW}      Waiting... ($attempt/$max_attempts)${NC}"
  fi
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo -e "${RED}      ⚠️  Backend did not respond within 90 seconds${NC}"
  echo -e "${RED}      Check /tmp/backend.log for errors${NC}"
  echo ""
  tail -20 /tmp/backend.log
  exit 1
fi
echo ""

cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down services...${NC}"

  if kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  if kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi

  wait "$BACKEND_PID" >/dev/null 2>&1 || true
  wait "$FRONTEND_PID" >/dev/null 2>&1 || true

  echo -e "${GREEN}✅ Services stopped${NC}"
}

trap cleanup INT TERM EXIT

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Services are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Backend:  http://localhost:8080${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  tail -f /tmp/backend.log"
echo -e "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services.${NC}"
echo ""

# Wait for both services to keep running
wait "$BACKEND_PID" "$FRONTEND_PID"
