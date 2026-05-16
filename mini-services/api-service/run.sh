#!/bin/bash
cd /home/z/my-project/mini-services/api-service
export DATABASE_URL=""
while true; do
  echo "Starting API service..."
  npx tsx index.ts
  EXIT_CODE=$?
  echo "API service exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
