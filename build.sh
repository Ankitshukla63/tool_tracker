#!/bin/bash
# Production build script for Render.com deployment
set -e

echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

echo "Building frontend..."
PORT=3000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/rfid-frontend run build

echo "Building API server..."
pnpm --filter @workspace/api-server run build

echo "Build complete!"
