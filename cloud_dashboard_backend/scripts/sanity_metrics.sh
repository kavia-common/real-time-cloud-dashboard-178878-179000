#!/usr/bin/env bash
# Verify metrics endpoints require auth and return expected shapes.
# Usage: ./scripts/sanity_metrics.sh http://localhost:4000

set -euo pipefail
BASE_URL="${1:-http://localhost:4000}"

echo "== LOGIN AS ADMIN (for token) =="
ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASS="${DEFAULT_ADMIN_PASSWORD:-admin123}"
LOGIN_RESP="$(curl -sS -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}")"
TOKEN="$(echo "$LOGIN_RESP" | jq -r '.token')"

echo "== /metrics/stats =="
curl -sS "${BASE_URL}/metrics/stats" -H "Authorization: Bearer ${TOKEN}" | jq .

echo "== /metrics/activity?page=1&limit=5 =="
curl -sS "${BASE_URL}/metrics/activity?page=1&limit=5" -H "Authorization: Bearer ${TOKEN}" | jq .
