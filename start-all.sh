#!/bin/bash
# Start API service
cd /home/z/my-project/mini-services/api-service
node index.js &
API=$!

# Start Vite frontend
cd /home/z/my-project/frontend
node ./node_modules/.bin/vite --port 5173 --host &
VITE=$!

# Keep alive loop
while kill -0 $API 2>/dev/null && kill -0 $VITE 2>/dev/null; do
  sleep 30
done

# If one died, restart
kill $API $VITE 2>/dev/null
sleep 2
exec "$0"
