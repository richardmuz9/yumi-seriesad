# Use Node.js LTS with Debian
FROM node:18-slim

# Install OpenSSL, SQLite, curl, and build dependencies
RUN apt-get update && \
    apt-get install -y openssl sqlite3 python3 make g++ curl && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy all files first
COPY . .

# Create data directory for SQLite and set permissions
RUN mkdir -p /app/data && \
    chmod +x /app/scripts/start.sh

# Install dependencies and rebuild sqlite3
RUN npm ci && \
    npm rebuild sqlite3 --build-from-source && \
    npx prisma generate && \
    npm run build && \
    npm prune --production

# Expose port (Railway will override this)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/database.sqlite"
ENV NODE_OPTIONS="--max-old-space-size=512"

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/ready || exit 1

# Start the application using the startup script
CMD ["/app/scripts/start.sh"] 