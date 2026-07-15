#!/usr/bin/env sh
# Production startup helper (run on host or entrypoint wrapper)
# Expects DATABASE_URL, SESSION_SECRET, and other vars from environment / secrets manager

set -eu

echo "[kesbyar] APP_ENV=${APP_ENV:-unknown} NODE_ENV=${NODE_ENV:-unknown}"

if [ "${APP_ENV:-}" = "production" ] || [ "${NODE_ENV:-}" = "production" ]; then
  if [ -z "${SESSION_SECRET:-}" ]; then
    echo "SESSION_SECRET is required in production" >&2
    exit 1
  fi
  if [ "${ALLOW_SEED:-false}" = "true" ]; then
    echo "WARNING: ALLOW_SEED=true in production" >&2
  fi
fi

echo "[kesbyar] Applying database schema (prisma db push)..."
npx prisma db push --schema=./prisma/schema.prisma --skip-generate

echo "[kesbyar] Starting Next.js server..."
exec node apps/web/server.js
