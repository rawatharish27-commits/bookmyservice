#!/bin/bash
# Start all BookYourService services

echo "🚀 Starting BookYourService..."

# Start Next.js (sandbox entry on port 3000)
echo "  → Starting Next.js on port 3000..."
cd /home/z/my-project
npx next dev --port 3000 &
NEXT_PID=$!

# Start Vite frontend (port 5173)
echo "  → Starting Vite frontend on port 5173..."
cd /home/z/my-project/frontend
npx vite --host &
VITE_PID=$!

# Start Hono API (port 3001)
echo "  → Starting Hono API on port 3001..."
cd /home/z/my-project/mini-services/api-service
npx tsx index.ts &
API_PID=$!

echo ""
echo "✅ All services starting:"
echo "   Next.js (sandbox):  PID=$NEXT_PID  → http://localhost:3000"
echo "   Vite (frontend):    PID=$VITE_PID  → http://localhost:5173"
echo "   Hono API (backend): PID=$API_PID   → http://localhost:3001"
echo ""
echo "Caddy gateway on port 81 routes:"
echo "   /           → Vite (5173)"
echo "   /api/*      → Hono (3001)"
echo ""

wait
