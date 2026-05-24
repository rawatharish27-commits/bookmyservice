#!/bin/bash
cd /home/z/my-project
while true; do
  rm -rf .next
  ./node_modules/.bin/next dev --port 3000 -H 0.0.0.0 2>&1 | tee -a /home/z/my-project/dev.log
  echo "[$(date)] Next.js died, restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
