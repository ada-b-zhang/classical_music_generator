#!/bin/bash

DB_PATH="$HOME/my_mongo_db"
LOG_PATH="$HOME/mongodb.log"
PORT=27017

# Step 1: Create data directory if needed
if [ ! -d "$DB_PATH" ]; then
  echo "📁 Creating MongoDB data directory at $DB_PATH..."
  mkdir -p "$DB_PATH"
else
  echo "✅ MongoDB data directory already exists at $DB_PATH"
fi

# Step 2: Start mongod
echo "🚀 Starting mongod on port $PORT..."
mongod --dbpath "$DB_PATH" --fork --logpath "$LOG_PATH" --port $PORT

# Step 3: Check if it's running
sleep 2
if pgrep -f "mongod" > /dev/null; then
  HOSTNAME=$(hostname)
  echo "✅ MongoDB is running at: http://$HOSTNAME:$PORT"
  echo "📄 Logs: $LOG_PATH"
else
  echo "❌ Failed to start MongoDB. Check logs at $LOG_PATH"
fi
