#!/bin/bash
cd /home/z/my-project

# Kill any existing processes
pkill -f "tsx.*index.ts" 2>/dev/null
pkill -f "vite.*--host" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

# Start API service
cd /home/z/my-project/mini-services/api-service
export DATABASE_URL='postgresql://postgres.oblhyxdjwrqtdycvnoky:x6fpra3VPHUwsoqn@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
export JWT_SECRET='bys-jwt-secret-2024-production'
export NODE_ENV=development
node node_modules/.bin/tsx index.ts >> /tmp/api-svc.log 2>&1 &
API_PID=$!
echo "API PID: $API_PID" > /tmp/services.pid

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
echo "Services started. PIDs: API=$API_PID, Vite=$VITE_PID, Next=$NEXT_PID"
echo "All PIDs saved to /tmp/services.pid"
