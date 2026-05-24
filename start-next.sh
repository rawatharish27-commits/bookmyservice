#!/bin/bash
cd /home/z/my-project
while true; do
  rm -rf .next
  NODE_OPTIONS="--max-old-space-size=1024" ./node_modules/.bin/next dev --port 3000 -H 0.0.0.0
  echo "Next.js died, restarting in 3s..."
  sleep 3
done
