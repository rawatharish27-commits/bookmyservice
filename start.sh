#!/bin/bash
while true; do
  cd /home/z/my-project/frontend
  node ./node_modules/.bin/vite --host &
  VITE_PID=$!
  
  cd /home/z/my-project/mini-services/api-service
  PORT=3001 node minimal.js &
  BACKEND_PID=$!
  
  cd /home/z/my-project
  node proxy.js &
  PROXY_PID=$!
  
  echo "[$(date)] Started: Vite=$VITE_PID Backend=$BACKEND_PID Proxy=$PROXY_PID"
  
  # Wait for any to die
  while kill -0 $VITE_PID 2>/dev/null && kill -0 $BACKEND_PID 2>/dev/null && kill -0 $PROXY_PID 2>/dev/null; do
    sleep 5
  done
  
  echo "[$(date)] Process died, restarting..."
  kill $VITE_PID $BACKEND_PID $PROXY_PID 2>/dev/null
  sleep 2
done
