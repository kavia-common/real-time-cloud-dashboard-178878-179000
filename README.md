# Real-time Cloud Dashboard

Full-stack app with Express + MongoDB + Socket.IO backend and React frontend. Supports authentication, Users CRUD (admin), real-time metric updates, and a polished "Ocean Professional" theme.

This README is the single source of truth for local setup, environment variables alignment, and end-to-end verification.

## 1) Environment Variables

Align these variables across backend and frontend. The Socket.IO path and CORS origin must match.

Frontend (.env in cloud_dashboard_frontend)
- REACT_APP_API_BASE_URL: Base URL for REST API, e.g. http://localhost:4000
- REACT_APP_SOCKET_URL: Base URL for Socket.IO, e.g. http://localhost:4000
- REACT_APP_SOCKET_PATH: Socket.IO path; must match backend SOCKET_PATH (default /socket.io)

Backend (.env in cloud_dashboard_backend)
- PORT: HTTP port (default 4000)
- MONGODB_URI: MongoDB connection string (Atlas recommended)
- JWT_SECRET: Secret for signing JWTs
- CORS_ORIGIN: Allowed origin for CORS (e.g. http://localhost:3000)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval in ms for metric:update emissions (default 3000)
- DEFAULT_ADMIN_EMAIL: Bootstrapped admin email (e.g. admin@example.com)
- DEFAULT_ADMIN_NAME: Bootstrapped admin display name (e.g. Administrator)
- DEFAULT_ADMIN_PASSWORD: Bootstrapped admin password (change in production)

### Sample .env files

Backend (cloud_dashboard_backend/.env)
PORT=4000
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority&appName=CloudDashboard"
JWT_SECRET="replace-with-a-strong-secret"
CORS_ORIGIN="http://localhost:3000"
SOCKET_PATH="/socket.io"
METRIC_TICK_MS=3000
DEFAULT_ADMIN_NAME="Administrator"
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_PASSWORD="admin123"

Frontend (cloud_dashboard_frontend/.env)
REACT_APP_API_BASE_URL=http://localhost:4000
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_SOCKET_PATH=/socket.io

Important:
- CORS_ORIGIN (backend) must equal the frontend origin (default http://localhost:3000).
- SOCKET_PATH (backend) must equal REACT_APP_SOCKET_PATH (frontend). Default is /socket.io.

## 2) Running locally

Prereqs:
- Node.js 18+ installed
- A MongoDB instance (Atlas recommended). See "MongoDB Atlas Setup" below.

Backend (port 4000)
- cd cloud_dashboard_backend
- Copy env: cp .env.example .env (or create .env from the sample above)
- npm install
- npm run dev
- Health: GET http://localhost:4000/health -> {"status":"ok","time":"..."}
- Echo:   GET http://localhost:4000/auth/echo -> {"ok":true,"time":"...","origin":"http://localhost:3000", "path":"/auth/echo"}

Frontend (port 3000)
- cd cloud_dashboard_frontend
- Create .env with:
  REACT_APP_API_BASE_URL=http://localhost:4000
  REACT_APP_SOCKET_URL=http://localhost:4000
  REACT_APP_SOCKET_PATH=/socket.io
- npm install
- npm start
- Open http://localhost:3000

## 3) MongoDB Atlas Setup (summary)

- Create a Cluster in MongoDB Atlas.
- Create a database user and note credentials.
- Network Access: add your IP (or 0.0.0.0/0 for local dev only).
- Get SRV connection string (mongodb+srv://...).
- Put it in backend .env as MONGODB_URI.

See cloud_dashboard_backend/README.md for full details and troubleshooting.

## 4) Verification Checklist

Backend readiness
- GET /health returns { "status":"ok", "time":"..." }.
- OPTIONS preflight succeeds for CORS_ORIGIN.

Auth
- Login using DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD from backend .env.
- GET /auth/me with Bearer token returns current user.
- Errors are JSON: { "error": "message" } with appropriate HTTP codes.

Users CRUD (admin)
- Create user: POST /users (or via frontend Users page).
- Update user: PUT /users/:id.
- Delete user: DELETE /users/:id.
- Verify entries appear/vanish in the frontend Users page.

Activity feed
- GET /metrics/activity shows recent actions (login, create/update/delete user).
- Frontend Activity page displays recent actions.

Dashboard metrics (realtime)
- GET /metrics/stats returns aggregate numbers.
- Socket.IO namespace /metrics emits metric:update periodically (every METRIC_TICK_MS).
- Frontend Dashboard shows a live indicator and feed updates in real-time.

Atlas connectivity
- Backend logs "[db] connected" on startup.
- Metric inserts succeed periodically (see src/sockets/index.js).
- No MongoAuth/network errors in backend logs.

Quick cURL sanity
- Register: curl -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"user@example.com","password":"test1234"}'
- Login: curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"test1234"}'
- Me: curl http://localhost:4000/auth/me -H "Authorization: Bearer TOKEN"
- Metrics: curl http://localhost:4000/metrics/stats -H "Authorization: Bearer TOKEN"

## 5) Troubleshooting

CORS errors (blocked by CORS policy)
- Ensure backend CORS_ORIGIN matches frontend origin (http://localhost:3000).
- Restart backend after changing CORS_ORIGIN.

Socket path mismatches (no live events / 404 on socket.io)
- Backend SOCKET_PATH must match frontend REACT_APP_SOCKET_PATH (default /socket.io).
- If you change one, change the other and reload both apps.

Invalid JWT / 401 Unauthorized
- Verify Authorization: Bearer <token> is sent by frontend (stored under rtcd_access_token).
- If token expired/invalid, login again; frontend auto-redirects to /login on 401.

MongoDB Atlas connection issues
- Verify MONGODB_URI and credentials are correct.
- Allow your IP in Atlas Network Access (or use 0.0.0.0/0 for local dev).
- URL-encode special characters in the password.
- Ensure DNS and port 27017 are allowed in your environment.

## 6) Repo Structure

real-time-cloud-dashboard-*/  
- cloud_dashboard_backend/ (Express + Socket.IO + Mongoose)
- cloud_dashboard_frontend/ (React + Socket.IO client + Ocean theme)

For more feature details see the READMEs inside each folder.
