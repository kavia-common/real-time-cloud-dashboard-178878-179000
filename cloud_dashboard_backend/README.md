# Cloud Dashboard Backend

Express + Socket.IO + Mongoose backend for the Real-time Cloud Dashboard.

## Features

- Express HTTP API
  - GET /health (readiness probe)
  - /auth: register, login, me
  - /users: CRUD (admin-restricted)
  - /metrics: stats, recent activity
- Socket.IO namespaces
  - /metrics: emits `metric:update` periodically
  - /users: placeholder for user-related realtime events
- MongoDB (Mongoose)
  - Models: User, Activity, Metric with validations and indexes
- Security middlewares: helmet, rate-limiter, CORS
- Default admin bootstrap from environment variables

## Getting Started

1. Copy env and fill in variables
   cp .env.example .env

   - Set `MONGODB_URI` to your MongoDB Atlas connection string (see "MongoDB Atlas Setup" below).
   - Set `CORS_ORIGIN` to your frontend URL (development: http://localhost:3000)
   - Set a strong, unique `JWT_SECRET`
   - Optionally adjust `SOCKET_PATH` and `METRIC_TICK_MS`

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
- CORS_ORIGIN: Allowed origin for CORS (e.g., http://localhost:3000)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval (ms) for emitting metric updates (default 3000)
- DEFAULT_ADMIN_NAME / DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD: Admin user bootstrapped on startup

## CORS and Socket Path

- CORS:
  - Backend allows requests from `CORS_ORIGIN` with `credentials: true`.
- Socket.IO:
  - Configurable path via `SOCKET_PATH` (default `/socket.io`).
  - Namespaces: `/metrics`, `/users`.
  - Ensure frontend `REACT_APP_SOCKET_PATH` matches if you change it.

## Health Check

- GET /health
  - Returns `{ status: "ok", time: ISOString }`.

## Frontend Integration

Frontend should use:
- REACT_APP_API_BASE_URL = http://localhost:4000
- REACT_APP_SOCKET_URL = http://localhost:4000
- Optionally, REACT_APP_SOCKET_PATH to match backend SOCKET_PATH if changed

Auth:
- POST /auth/register -> { token, user }
- POST /auth/login -> { token, user }
- GET /auth/me (Bearer token)

Users (admin):
- GET /users
- POST /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

Metrics:
- GET /metrics/stats
- GET /metrics/activity
- Socket namespace /metrics -> event `metric:update`

## Notes

This is a working skeleton. Extend validations, error handling, and production configs (structured logging, strict CORS rules, secure cookies, rate limits, etc.) before deployment.
