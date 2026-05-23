#!/bin/bash
cd /home/z/my-project

# ─── Validate required environment variables ────────────────────────────
MISSING=0
if [ -z "${DATABASE_URL}" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  MISSING=1
fi
if [ -z "${JWT_SECRET}" ]; then
  echo "❌ ERROR: JWT_SECRET environment variable is not set"
  MISSING=1
fi
if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "Required environment variables are missing. Please set them before running this script:"
  echo "  export DATABASE_URL='postgresql://...'"
  echo "  export JWT_SECRET='your-secret-key'"
  exit 1
fi

# Kill any existing processes
pkill -f "tsx.*index.ts" 2>/dev/null
pkill -f "vite.*--host" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "tracking-service" 2>/dev/null
sleep 1

# Start API service
cd /home/z/my-project/mini-services/api-service
export DATABASE_URL="${DATABASE_URL}"
export JWT_SECRET="${JWT_SECRET}"
export NODE_ENV="${NODE_ENV:-development}"
node node_modules/.bin/tsx index.ts >> /tmp/api-svc.log 2>&1 &
API_PID=$!
echo "API PID: $API_PID" > /tmp/services.pid

cd /home/z/my-project

# Start Tracking service (Socket.IO on port 3003)
cd /home/z/my-project/mini-services/tracking-service
export DATABASE_URL="${DATABASE_URL}"
export JWT_SECRET="${JWT_SECRET}"
export NODE_ENV="${NODE_ENV:-development}"
bun run dev >> /tmp/tracking-svc.log 2>&1 &
TRACKING_PID=$!
echo "TRACKING PID: $TRACKING_PID" >> /tmp/services.pid

cd /home/z/my-project

# Start Vite frontend  
cd /home/z/my-project/frontend
node node_modules/.bin/vite --host >> /tmp/vite-svc.log 2>&1 &
VITE_PID=$!
echo "VITE PID: $VITE_PID" >> /tmp/services.pid

cd /home/z/my-project

# Start Next.js sandbox
node node_modules/.bin/next dev --port 3000 >> /tmp/next-svc.log 2>&1 &
NEXT_PID=$!
echo "NEXT PID: $NEXT_PID" >> /tmp/services.pid

# Wait for services to be ready
sleep 5
echo "Services started. PIDs: API=$API_PID, Tracking=$TRACKING_PID, Vite=$VITE_PID, Next=$NEXT_PID"
echo "All PIDs saved to /tmp/services.pid"
