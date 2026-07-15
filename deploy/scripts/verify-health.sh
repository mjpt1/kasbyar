#!/usr/bin/env sh
# Verify health endpoints for web and AI service
# Usage: ./deploy/scripts/verify-health.sh [WEB_URL] [AI_URL]

set -eu

WEB_URL="${1:-http://localhost:3000}"
AI_URL="${2:-http://localhost:8000}"

echo "Checking web liveness: ${WEB_URL}/api/health"
curl -fsS "${WEB_URL}/api/health" | head -c 500
echo ""

echo "Checking web readiness: ${WEB_URL}/api/health/ready"
READY_CODE=$(curl -s -o /tmp/kesbyar-ready.json -w "%{http_code}" "${WEB_URL}/api/health/ready")
cat /tmp/kesbyar-ready.json
echo ""
if [ "$READY_CODE" != "200" ]; then
  echo "Web readiness failed (HTTP ${READY_CODE})" >&2
  exit 1
fi

echo "Checking AI liveness: ${AI_URL}/health"
curl -fsS "${AI_URL}/health"
echo ""

echo "Checking AI readiness: ${AI_URL}/ready"
curl -fsS "${AI_URL}/ready"
echo ""

echo "All health checks passed."
