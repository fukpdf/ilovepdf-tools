#!/bin/bash
set -e

echo ""
echo "============================================="
echo "  ILovePDF — Cloudflare Pages Build Script  "
echo "============================================="
echo ""

# Step 1: Swap to standalone package.json (bypasses pnpm workspace + catalog: refs)
echo "→ Using standalone npm package.json..."
if [ -f package.json ]; then
  cp package.json package.json.workspace.bak
fi
cp package.cloudflare.json package.json

# Step 2: Clean any stale lock files from workspace that would confuse npm
rm -f pnpm-lock.yaml yarn.lock

# Step 3: Install only vite (everything else loads from CDN at runtime)
echo "→ Installing build dependencies via npm..."
npm install

# Step 4: Build static site (base=/, no PORT/BASE_PATH needed)
echo "→ Building static site..."
npm run build

# Step 5: Restore original workspace package.json
echo "→ Restoring workspace package.json..."
if [ -f package.json.workspace.bak ]; then
  mv package.json.workspace.bak package.json
fi

echo ""
echo "✅ Build complete! Output: ./dist"
echo "   Configure Cloudflare Pages:"
echo "   → Root directory:     artifacts/ilovepdf"
echo "   → Build command:      bash build-cloudflare.sh"
echo "   → Output directory:   dist"
echo ""
