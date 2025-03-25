#!/bin/bash

echo "🛑 Attempting to stop MongoDB..."

# Check if mongod is running
PID=$(pgrep -f "mongod")

if [ -n "$PID" ]; then
  echo "🔍 Found mongod process with PID: $PID"
  kill "$PID"
  sleep 2

  # Verify it stopped
  if pgrep -f "mongod" > /dev/null; then
    echo "❌ MongoDB is still running. Try using: sudo kill -9 $PID"
  else
    echo "✅ MongoDB has been stopped."
  fi
else
  echo "ℹ️ No mongod process found. MongoDB is not running."
fi
