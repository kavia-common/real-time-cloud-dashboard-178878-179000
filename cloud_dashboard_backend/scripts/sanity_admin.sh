#!/usr/bin/env bash
# Verify default admin can login and perform admin-only users CRUD.
# Requires DEFAULT_ADMIN_* present in backend .env and server running.
# Usage: ./scripts/sanity_admin.sh http://localhost:4000

set -euo pipefail
BASE_URL="${1:-http://localhost:4000}"

echo "== ADMIN LOGIN =="
ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASS="${DEFAULT_ADMIN_PASSWORD:-admin123}"
LOGIN_RESP="$(curl -sS -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}")"
echo "$LOGIN_RESP" | jq .
ADMIN_TOKEN="$(echo "$LOGIN_RESP" | jq -r '.token')"

if [ -z "${ADMIN_TOKEN}" ] || [ "${ADMIN_TOKEN}" = "null" ]; then
  echo "Admin login failed. Check DEFAULT_ADMIN_* env and server logs." >&2
  exit 1
fi

echo "== LIST USERS (admin) =="
curl -sS "${BASE_URL}/users" -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq .

echo "== CREATE USER (admin) =="
CREATE_RESP="$(curl -sS -X POST "${BASE_URL}/users" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"CLI Created","email":"cli.created@example.com","password":"changeme","role":"user","status":"active"}')"
echo "$CREATE_RESP" | jq .
NEW_ID="$(echo "$CREATE_RESP" | jq -r '.id')"

echo "== GET USER =="
curl -sS "${BASE_URL}/users/${NEW_ID}" -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq .

echo "== UPDATE USER (promote to admin) =="
curl -sS -X PUT "${BASE_URL}/users/${NEW_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' | jq .

echo "== DELETE USER =="
curl -sS -X DELETE "${BASE_URL}/users/${NEW_ID}" -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq .
