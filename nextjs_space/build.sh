#!/bin/bash
set -e

echo "🔧 Starting custom build script..."

# Force npm to use legacy peer deps
echo "📦 Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps --no-audit --no-fund

echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
