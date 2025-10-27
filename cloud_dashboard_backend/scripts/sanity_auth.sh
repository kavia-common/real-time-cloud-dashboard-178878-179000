#!/usr/bin/env bash
# Simple local verification script for auth endpoints.
# Requirements: jq, curl
# Usage: ./scripts/sanity_auth.sh http://localhost:4000

set -euo pipefail

BASE_URL="${1:-http://localhost:4000}"

echo "== HEALTH =="
curl -sS "${BASE_URL}/health" | jq .

echo "== REGISTER (user@example.com) =="
REGISTER_RESP="$(curl -sS -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@example.com","password":"test1234"}')"
echo "$REGISTER_RESP" | jq .
USER_TOKEN="$(echo "$REGISTER_RESP" | jq -r '.token')"

echo "== LOGIN (user@example.com) =="
LOGIN_RESP="$(curl -sS -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"test1234"}')"
echo "$LOGIN_RESP" | jq .
LOGIN_TOKEN="$(echo "$LOGIN_RESP" | jq -r '.token')"

echo "== ME with user token =="
curl -sS "${BASE_URL}/auth/me" -H "Authorization: Bearer ${LOGIN_TOKEN}" | jq .

echo "== TRY /users (should be 403 for non-admin) =="
curl -i -sS "${BASE_URL}/users" -H "Authorization: Bearer ${LOGIN_TOKEN}" | sed -n '1,10p'
