#!/bin/bash
# Deploy soulofsoul to Vercel
#
# Usage:
#   ./deploy/scripts/deploy-vercel.sh <production|preview>
#
# Prerequisites:
#   - Vercel CLI: npm i -g vercel
#   - Linked project: vercel link

set -euo pipefail

ENV="${1:-preview}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Deploying soulofsoul to Vercel ($ENV)"

# Check prerequisites
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not installed. Run: npm i -g vercel"
  exit 1
fi

cd "$PROJECT_DIR"

# Verify project is linked
if [ ! -d ".vercel" ]; then
  echo "📋 Linking project to Vercel..."
  vercel link
fi

# Set required environment variables (if not already set)
# This is idempotent — Vercel only updates if the value changed
echo "🔧 Setting environment variables..."

set_env_var() {
  local key="$1"
  local value="$2"
  local env_target="$3" # production | preview | development
  vercel env rm "$key" "$env_target" 2>/dev/null || true
  echo "$value" | vercel env add "$key" "$env_target" 2>/dev/null || true
}

# Prompt for secrets if not in env
read -rp "DATABASE_URL (Postgres): " DB_URL
read -rp "NEXTAUTH_SECRET (openssl rand -base64 32): " NA_SECRET
read -rp "NEXTAUTH_URL (https://your-domain.com): " NA_URL
read -rp "ZAI_API_KEY: " ZAI_KEY

set_env_var "DATABASE_URL" "$DB_URL" "$ENV"
set_env_var "NEXTAUTH_SECRET" "$NA_SECRET" "$ENV"
set_env_var "NEXTAUTH_URL" "$NA_URL" "$ENV"
set_env_var "ZAI_API_KEY" "$ZAI_KEY" "$ENV"

# Deploy
if [ "$ENV" = "production" ]; then
  echo ""
  echo "📦 Building and deploying to production..."
  vercel --prod
else
  echo ""
  echo "📦 Building and deploying preview..."
  vercel
fi

echo ""
echo "✅ Deployment complete!"
