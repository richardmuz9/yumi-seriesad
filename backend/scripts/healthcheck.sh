#!/bin/sh

# Simple health check for container platforms
# This script will be used by Docker/Railway health checks
 
curl -f http://localhost:${PORT:-3000}/api/health || exit 1 