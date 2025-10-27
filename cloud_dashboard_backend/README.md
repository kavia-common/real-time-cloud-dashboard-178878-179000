# Cloud Dashboard Backend

## Health Check
- GET /health -> {"status":"ok","time":"..."}
Use this to verify service is running and reachable.

## Auth
- POST /auth/login -> { token, user }
- POST /auth/register -> { token, user }
- GET /auth/me -> Returns user profile directly (not wrapped)

## Users (admin)
- CRUD under /users with activity logging.

## Metrics
- GET /metrics/stats -> { count, total, average, latest: [...] }
- GET /metrics/activity -> Activity feed array

## WebSocket
- Socket.IO path is configurable via env SOCKET_PATH (default "/socket.io")
- Namespaces:
  - /metrics: emits "metric:update" events every METRIC_TICK_MS
- CORS origin controlled by CORS_ORIGIN
Ensure frontend sets:
- REACT_APP_SOCKET_URL to backend origin, e.g., http://localhost:4000
- REACT_APP_SOCKET_PATH to match SOCKET_PATH, e.g., /socket.io

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
- Security middlewares: helmet, rate-limiter, CORS, centralized error handler
- Default admin bootstrap from environment variables

## Getting Started

1. Copy env and fill in variables
   cp .env.example .env

   - Set `MONGODB_URI` to your MongoDB Atlas connection string (see "MongoDB Atlas Setup" below for details).
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

## MongoDB Atlas Setup

This app uses Mongoose to connect to MongoDB. The connection is established in `src/config/db.js` via the exported `connectDB()` function, which uses the `MONGODB_URI` environment variable.

Follow these steps to connect to Atlas:

1) Create a Cluster (Atlas)
- Sign in to https://www.mongodb.com/atlas and create a free/shared cluster.

2) Create a Database User
- Go to Database Access -> Add new database user.
- Authentication method: Password.
- Set a username and a strong password.
- Grant role "Atlas admin" or "Read and write to any database" (sufficient for this app).
- Save the credentials; they are used in your URI.

3) Configure Network Access
- Go to Network Access -> Add IP address.
- For local development, use "Allow Access From Anywhere" (0.0.0.0/0).
  - In production, restrict to known IPs only.
- If using VPC peering or Private Endpoint, configure accordingly.

4) Obtain the SRV Connection String
- From Database -> Connect -> Drivers -> Copy the SRV URI.
- Example format (replace placeholders):
  mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority&appName=CloudDashboard

Notes:
- The SRV scheme (mongodb+srv://) uses DNS to resolve your cluster. It's recommended for Atlas.
- Keep `retryWrites=true&w=majority` for safe defaults; Atlas will include them by default.
- `appName` is optional but recommended for identifying this application in logs/metrics.
- If your password contains special characters, URL-encode it in the URI.

5) Put the URI in .env
- Open `.env` and set:
  MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority&appName=CloudDashboard"
- Do not commit real credentials to source control.

6) Start the backend
- npm run dev
- On successful connection you will see logs from `connectDB()` like:
  [db] connected

Troubleshooting:
- Authentication failed: Verify username/password and that the database user exists.
- IP not whitelisted: Ensure your current IP is allowed under Network Access.
- DNS/SRV errors: Ensure your environment can resolve SRV records (mongodb+srv) and outbound network access is allowed.
- Local MongoDB alternative: You can also use a local URI such as mongodb://localhost:27017/cloud_dashboard (default in code if env is missing), but Atlas is recommended.

## Environment Variables

- PORT: HTTP port (default 4000)
- MONGODB_URI: MongoDB connection URI (Atlas recommended). Example:
  mongodb+srv://dbuser:dbpass@cluster0.abc123.mongodb.net/cloud_dashboard?retryWrites=true&w=majority&appName=CloudDashboard
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
