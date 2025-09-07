#!/bin/bash

# Efficient Casino Startup Script
echo "🚀 Starting Nexus Casino with Efficient Real-time System..."

# Start the efficient WebSocket server
echo "📡 Starting shared WebSocket server (port 3001)..."
node websocket-server-efficient.js &

# Wait a moment for WebSocket server to start
sleep 2

# Start the Next.js development server
echo "🌐 Starting Next.js development server (port 3000)..."
npm run dev

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill %1 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for background processes
wait
