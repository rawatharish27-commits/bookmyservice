#!/bin/bash
# Auto-restart wrapper for Next.js dev server
while true; do
  cd /home/z/my-project
  rm -rf .next 2>/dev/null
  npx next dev --port 3000
  echo "[$(date)] Server died, restarting in 3s..."
  sleep 3
done
