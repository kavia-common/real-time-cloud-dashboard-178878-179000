# Cloud Dashboard Backend

Express + Socket.IO + Mongoose backend for the Real-time Cloud Dashboard.

## Features

- Express HTTP API
  - GET /health (readiness probe)
  - /auth: register, login, me, logout
  - /users: CRUD (admin-restricted)
  - /metrics: stats, recent activity (with pagination)
- Socket.IO namespaces
  - /metrics: emits `metric:update` every METRIC_TICK_MS with timestamp and value
  - /users: placeholder for user-related realtime events
- MongoDB (Mongoose)
  - Models: User, Activity, Metric with validations and indexes
- Security middlewares: helmet, rate-limiter, CORS
- Default admin bootstrap from environment variables
- Centralized error handler and 404 JSON response

## Getting Started

1. Copy env and fill in variables
   cp .env.example .env

   - Set `MONGODB_URI` to your MongoDB Atlas connection string (see "MongoDB Atlas Setup" below).
   - Set `CORS_ORIGIN` to your frontend URL (development: http://localhost:3000)
   - Set a strong, unique `JWT_SECRET`
   - Optionally adjust `SOCKET_PATH` and `METRIC_TICK_MS`
   - IMPORTANT: `CORS_ORIGIN` must equal your frontend origin (e.g., http://localhost:3000) and `SOCKET_PATH` must equal the frontend `REACT_APP_SOCKET_PATH` (default `/socket.io`)
   - DEFAULT_ADMIN_* variables are used to idempotently seed an admin on startup.

2. Install dependencies
   npm install

3. Run in development
   npm run dev

   Server starts on PORT (default 4000) ONLY after a successful MongoDB connection and admin bootstrap.
   - GET /health and /api/health -> {"status":"ok","time":"..."}
   - Socket.IO on path SOCKET_PATH (default /socket.io)
     - Namespaces: /metrics, /users
   - HTTP timeouts: requestTimeout=60s, headersTimeout=65s, keepAliveTimeout=20s

4. Verify locally (sanity scripts)
   - Ensure `jq` is installed.
   - Auth flow:
     ./scripts/sanity_auth.sh http://localhost:4000
   - Admin + Users CRUD:
     ./scripts/sanity_admin.sh http://localhost:4000
   - Metrics endpoints:
     ./scripts/sanity_metrics.sh http://localhost:4000

Errors are always JSON:
{ "error": "message" }
With proper status codes (400, 401, 403, 404, 409, 500). CORS is restricted to CORS_ORIGIN and Socket.IO shares the same origin rule.

2. Install dependencies
   npm install

3. Run in development
   npm run dev

   Server starts on PORT (default 4000) and exposes:
   - GET /health -> {"status":"ok","time":"..."}
   - Socket.IO on path SOCKET_PATH (default /socket.io)
     - Namespaces: /metrics, /users

## MongoDB Atlas Setup

The connection is established in `src/config/db.js` via `connectDB()` which reads `MONGODB_URI`.

Steps:

1) Create a Cluster (Atlas)
- Sign in to https://www.mongodb.com/atlas and create a free/shared cluster.

2) Create a Database User
- Database Access -> Add new database user (Password auth).
- Save username/password for URI.

3) Configure Network Access
- Network Access -> Add IP address.
- For local dev you may use "Allow Access From Anywhere" (0.0.0.0/0).
  - Restrict IPs in production.

4) Obtain the SRV Connection String
- Database -> Connect -> Drivers -> Copy SRV URI.
- Example:
  mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority&appName=CloudDashboard

Notes:
- Use SRV (mongodb+srv://) where possible.
- URL-encode special characters in password.
- Keep `retryWrites=true&w=majority`.
- `appName` helps identify this app in logs.

5) Put the URI in `.env`
- MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority&appName=CloudDashboard"

6) Start the backend
- npm run dev
- You should see `[db] connected` on success.

Troubleshooting:
- Auth failed: check user and password; ensure user has needed roles.
- IP not allowed: whitelist your IP in Network Access.
- DNS/SRV errors: ensure your environment allows DNS lookups and outbound 27017.
- Local alternative: mongodb://localhost:27017/cloud_dashboard is supported for local dev.

### Connection Robustness

- The `connectDB()` function includes:
  - Timeouts (server selection/socket)
  - Pooled connections
  - Exponential backoff retries on startup
  - Graceful shutdown on SIGINT/SIGTERM

## Environment Variables

A ready-to-use template is available at `.env.example`. Copy it to `.env` and fill values.

- PORT: HTTP port (default 4000)
- MONGODB_URI: MongoDB connection URI (Atlas recommended). Example:
  mongodb+srv://dbuser:dbpass@cluster0.abc123.mongodb.net/cloud_dashboard?retryWrites=true&w=majority&appName=CloudDashboard
- JWT_SECRET: Secret used to sign JWTs
- CORS_ORIGIN: Allowed origin for CORS (default http://localhost:3000 in dev)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval (ms) for emitting metric updates (default 3000)
- DEFAULT_ADMIN_NAME / DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD: Admin user bootstrapped on startup

## CORS and Socket Path

- CORS:
  - Backend allows requests only from the exact `CORS_ORIGIN`.
  - `credentials` are disabled by default to simplify CORS and reduce cookie-related preflight issues.
  - Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS. Allowed headers: Content-Type, Authorization, X-Requested-With.
  - Preflight is handled globally and returns 204 with proper `Access-Control-Allow-*` headers.
- Socket.IO:
  - Configurable path via `SOCKET_PATH` (default `/socket.io`).
  - Namespaces: `/metrics`, `/users`.
  - Ensure frontend `REACT_APP_SOCKET_PATH` matches if you change it.

## Health Check

- GET /health and GET /api/health
  - Returns `{ status: "ok", time: ISOString }`.
- GET /auth/echo and GET /api/echo
  - Returns `{ ok: true, time, origin, path }` without auth. Useful to diagnose CORS/adblock/network issues quickly.

## Frontend Integration

Duplicate API base paths:
- Legacy paths remain: `/auth`, `/users`, `/metrics`
- New safe prefix duplicates: `/api/auth`, `/api/users`, `/api/metrics`
- Prefer using `/api/*` on the frontend to avoid ad/tracker blockers that may target `/auth` or `/metrics` paths.

Frontend should use:
- REACT_APP_API_BASE_URL = http://localhost:4000
- REACT_APP_SOCKET_URL = http://localhost:4000
- Optionally, REACT_APP_SOCKET_PATH to match backend SOCKET_PATH if changed

Auth:
- POST /auth/register -> { token, user }
- POST /auth/login -> { token, user }
- GET /auth/me (Bearer token)
- POST /auth/logout -> { success: true }

Users (admin):
- GET /users
- POST /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

Metrics:
- GET /metrics/stats -> { activeUsers, rpm, errors, ... }
- GET /metrics/activity?page=1&limit=30 -> { page, limit, total, items: [...] }
- Socket namespace /metrics -> event `metric:update` with { type, message, value, timestamp }

## CORS and Preflight

- CORS is restricted to `CORS_ORIGIN`. Ensure it matches your frontend (e.g., `http://localhost:3000`).
- Socket.IO CORS uses the same origin with allowed methods GET/POST.
- Preflight: Express `cors` middleware automatically handles OPTIONS requests. You can test with:
  curl -i -X OPTIONS http://localhost:4000/auth/login \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST"

## Exact cURL sanity checks

Register a user:
curl -sS -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@example.com","password":"test1234"}'

Login:
curl -sS -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"test1234"}'

Me (replace TOKEN):
curl -sS http://localhost:4000/auth/me \
  -H "Authorization: Bearer TOKEN"

Admin login (uses DEFAULT_ADMIN_*):
curl -sS -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${DEFAULT_ADMIN_EMAIL}\",\"password\":\"${DEFAULT_ADMIN_PASSWORD}\"}"

Create user (admin):
curl -sS -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"CLI Created","email":"cli.created@example.com","password":"changeme","role":"user","status":"active"}'

Metrics stats:
curl -sS http://localhost:4000/metrics/stats \
  -H "Authorization: Bearer TOKEN"

Activity (page/limit):
curl -sS "http://localhost:4000/metrics/activity?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"

## Troubleshooting

- CORS blocked:
  - Ensure `CORS_ORIGIN` matches the frontend origin exactly, including scheme and port.
  - Restart the backend after changing `.env`.

- Admin login fails:
  - Confirm `DEFAULT_ADMIN_EMAIL`/`DEFAULT_ADMIN_PASSWORD` in `.env`.
  - Check logs for `[auth] Default admin ensured:` on startup.
  - If a conflicting user already exists with same email but different schema, update/delete it manually.

- Invalid JWT / 401:
  - Verify the `Authorization: Bearer <token>` header is sent.
  - Tokens expire after 7 days; login again.

- MongoDB connection:
  - Verify `MONGODB_URI` with valid credentials and IP whitelist.
  - Use SRV (`mongodb+srv://`) and URL-encode special characters.

- Socket.IO no events:
  - Ensure `REACT_APP_SOCKET_PATH` equals backend `SOCKET_PATH`.
  - Namespace `/metrics` emits `metric:update` every `METRIC_TICK_MS`.

- Preflight/OPTIONS errors:
  - Ensure the request includes `Origin` header and correct `Access-Control-Request-Method`.
  - The `cors` middleware should respond with 204 and proper `Access-Control-Allow-*` headers.

## Notes

This app is production-ready in structure; before deploying:
- Harden validations
- Add structured logging
- Restrict CORS and rate limits appropriately
- Rotate strong JWT secrets
- Review indexes and performance settings
