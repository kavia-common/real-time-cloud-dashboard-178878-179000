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
  - Models: User, Activity, Metric
- Security middlewares: helmet, rate-limiter, CORS
- Default admin bootstrap from environment variables

## Getting Started

1. Copy env and fill in variables
   cp .env.example .env

   - Set `MONGODB_URI` to your MongoDB Atlas connection string:
     mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
   - Set `CORS_ORIGIN` to your frontend URL (development: http://localhost:3000)
   - Set a strong, unique `JWT_SECRET`

2. Install dependencies
   npm install

3. Run in development
   npm run dev

   Server starts on PORT (default 4000) and exposes:
   - GET /health -> {"status":"ok","time":"..."}
   - Socket.IO on path SOCKET_PATH (default /socket.io)
     - Namespaces: /metrics, /users

## Environment Variables

- PORT: HTTP port (default 4000)
- MONGODB_URI: MongoDB connection URI (Atlas recommended)
- JWT_SECRET: Secret used to sign JWTs
- CORS_ORIGIN: Allowed origin for CORS (e.g., http://localhost:3000)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval (ms) for emitting metric updates (default 3000)
- DEFAULT_ADMIN_NAME / DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD: Admin user bootstrapped on startup

See .env.example for a complete, copyable template.

## CORS and Socket Path

- CORS:
  - Backend will allow requests from `CORS_ORIGIN` and set `credentials: true`.
  - For local dev with CRA: set `CORS_ORIGIN=http://localhost:3000`

- Socket.IO path and namespaces:
  - Path is configurable via `SOCKET_PATH` (default `/socket.io`)
  - Namespaces used: `/metrics`, `/users`
  - The frontend may optionally set `REACT_APP_SOCKET_PATH` to match custom paths.

## Health Check

- GET /health
  - Returns a simple JSON payload with current time.
  - Intended for readiness probes and basic liveness checks.

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

This is a working skeleton. Extend validations, error handling, and production configs (logging, CORS rules, secure cookies, rate limits, etc.) before deployment.
