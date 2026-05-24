#!/bin/bash
# Start API service
cd /home/z/my-project/mini-services/api-service
node index.js &
API_PID=$!
echo "API PID: $API_PID"

# Start Next.js
cd /home/z/my-project
npx next dev --port 3000 &
NEXT_PID=$!
echo "Next PID: $NEXT_PID"

# Keep alive
while kill -0 $API_PID 2>/dev/null && kill -0 $NEXT_PID 2>/dev/null; do
  sleep 30
done

echo "One of the processes died"
kill $API_PID $NEXT_PID 2>/dev/null
