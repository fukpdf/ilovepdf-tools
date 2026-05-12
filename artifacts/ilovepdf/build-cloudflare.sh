#!/bin/bash
set -e

echo ""
echo "============================================="
echo "  ILovePDF — Cloudflare Pages Build Script  "
echo "============================================="
echo ""

# ─── Verify we are in the right directory ─────────────────────────────────────
if [ ! -f "vite.config.cloudflare.js" ]; then
  echo "ERROR: Run this script from artifacts/ilovepdf/ (vite.config.cloudflare.js not found)"
  exit 1
fi

# ─── Locate vite ──────────────────────────────────────────────────────────────
# After pnpm workspace install, vite lives in node_modules/.bin/vite
# No package.json swap or separate npm install needed.
if [ -f "node_modules/.bin/vite" ]; then
  VITE="node_modules/.bin/vite"
elif [ -f "../../node_modules/.bin/vite" ]; then
  VITE="../../node_modules/.bin/vite"
else
  echo "→ vite not found in workspace node_modules, downloading vite@5 via npx..."
  VITE="npx --yes vite@5.4.19"
fi

echo "→ vite binary: $VITE"
echo "→ Building static site..."

# ─── Build ────────────────────────────────────────────────────────────────────
# vite.config.cloudflare.js uses base='/' and needs no PORT or BASE_PATH.
$VITE build --config vite.config.cloudflare.js

echo ""
echo "✅ Build complete! Output: ./dist"
echo ""
echo "   Cloudflare Pages settings:"
echo "   → Root directory:     artifacts/ilovepdf"
echo "   → Build command:      bash build-cloudflare.sh"
echo "   → Output directory:   dist"
echo "   → Framework preset:   None"
echo ""
