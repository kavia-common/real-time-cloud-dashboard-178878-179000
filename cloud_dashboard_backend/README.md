# Cloud Dashboard Backend

Express + Socket.IO + Mongoose backend for the Real-time Cloud Dashboard.

## Features

- Express HTTP API
  - /health
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

   Set `MONGODB_URI` to your MongoDB Atlas connection string.

2. Install dependencies
   npm install

3. Run in development
   npm run dev

   Server starts on PORT (default 4000) and exposes:
   - GET /health
   - Socket.IO on path SOCKET_PATH (default /socket.io)

## Environment Variables

- PORT: HTTP port (default 4000)
- MONGODB_URI: MongoDB connection URI
- JWT_SECRET: Secret used to sign JWTs
- CORS_ORIGIN: Allowed origin for CORS (e.g., http://localhost:3000)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval for emitting metric updates
- DEFAULT_ADMIN_NAME/EMAIL/PASSWORD: Admin user bootstrapped on startup

## Frontend Integration

Frontend should use:
- REACT_APP_API_BASE_URL = http://localhost:4000
- REACT_APP_SOCKET_URL = http://localhost:4000

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

This is a working skeleton. Extend validations, error handling, and production configs (logging, CORS rules, secure cookies, etc.) before deployment.
