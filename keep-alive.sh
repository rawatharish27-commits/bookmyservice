#!/bin/bash
# Start vite in background
cd /home/z/my-project/frontend
node ./node_modules/.bin/vite --host &
VITE_PID=$!

# Start backend in background
cd /home/z/my-project/backend
PORT=3001 npx tsx src/index.ts &
BACKEND_PID=$!

# Start proxy in background
cd /home/z/my-project
node proxy.js &
PROXY_PID=$!

echo "Started: Vite=$VITE_PID, Backend=$BACKEND_PID, Proxy=$PROXY_PID"

# Keep alive - wait for any child to die
wait
