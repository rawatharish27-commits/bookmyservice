#!/bin/bash
# Start vite in background
cd /home/z/my-project/frontend
node ./node_modules/.bin/vite --host &
VITE_PID=$!

# Start backend API service in background
cd /home/z/my-project/mini-services/api-service
PORT=3001 node index.js &
BACKEND_PID=$!

# Start proxy in background
cd /home/z/my-project
node proxy.js &
PROXY_PID=$!

echo "Started: Vite=$VITE_PID, Backend=$BACKEND_PID, Proxy=$PROXY_PID"

# Keep alive - wait for any child to die
wait
