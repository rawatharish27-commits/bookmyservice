#!/bin/bash
while true; do
  # Start Vite
  cd /home/z/my-project/frontend
  node ./node_modules/.bin/vite --host &
  VITE=$!
  
  # Start Backend
  cd /home/z/my-project/mini-services/api-service
  PORT=3001 node index.js &
  BACKEND=$!
  
  # Start Proxy
  cd /home/z/my-project
  node proxy.js &
  PROXY=$!
  
  # Wait for any to die, then restart all
  while kill -0 $VITE 2>/dev/null && kill -0 $BACKEND 2>/dev/null && kill -0 $PROXY 2>/dev/null; do
    sleep 10
  done
  
  # Kill any remaining
  kill $VITE $BACKEND $PROXY 2>/dev/null
  sleep 3
done
