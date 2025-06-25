#!/bin/sh

echo "🚀 Starting Yumi-Series deployment..."
echo "📊 Environment: $NODE_ENV"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "💾 Memory info:"
free -h 2>/dev/null || echo "Memory info not available"
echo "💿 Disk space:"
df -h /app 2>/dev/null || echo "Disk info not available"

# Run database migrations (safe for production)
echo "📊 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

# Check if the built application exists
if [ ! -f "dist/index.js" ]; then
    echo "❌ Built application not found at dist/index.js"
    ls -la dist/ 2>/dev/null || echo "dist/ directory not found"
    exit 1
fi

echo "✅ Built application found"
echo "🎯 Starting the application..."

# Use exec to replace shell process with node process (proper signal handling)
exec node dist/index.js 