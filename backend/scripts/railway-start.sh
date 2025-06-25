#!/bin/bash

echo "🚂 Starting Yumi-Series on Railway..."

# Create data directory if it doesn't exist
mkdir -p /app/data
echo "✅ Created data directory"

# Ensure database directory is writable
chmod 777 /app/data
echo "✅ Set data directory permissions"

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy
echo "✅ Database migrations complete"

# Start the application
echo "🚀 Starting Node.js application..."
node dist/index.js 