# Real-time Cloud Dashboard

Concise integration guide for the full-stack app (Express + MongoDB + Socket.IO backend and React frontend).

Ports and paths
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Socket path: /socket.io (must match on both frontend and backend)

1) Environment variables

Frontend (.env at cloud_dashboard_frontend)
- REACT_APP_API_BASE_URL: Base URL for REST API, e.g. http://localhost:4000
- REACT_APP_SOCKET_URL: Base URL for Socket.IO, e.g. http://localhost:4000
- REACT_APP_SOCKET_PATH: Socket.IO path; must match backend SOCKET_PATH (default /socket.io)

Backend (.env at cloud_dashboard_backend)
- PORT: HTTP port (default 4000)
- MONGODB_URI: MongoDB connection string (Atlas recommended)
- JWT_SECRET: Secret for signing JWTs
- CORS_ORIGIN: Allowed origin for CORS (e.g. http://localhost:3000)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval in ms for metric:update emissions (default 3000)
- DEFAULT_ADMIN_NAME: Bootstrapped admin display name (e.g. Administrator)
- DEFAULT_ADMIN_EMAIL: Bootstrapped admin email (e.g. admin@example.com)
- DEFAULT_ADMIN_PASSWORD: Bootstrapped admin password (change in production)

2) Running locally

Backend (port 4000)
- cd cloud_dashboard_backend
- Copy env: cp .env.example .env (or create .env with variables above)
- Fill MONGODB_URI with your Atlas SRV and set JWT_SECRET
- npm install
- npm run dev
- Health: GET http://localhost:4000/health

Frontend (port 3000)
- cd cloud_dashboard_frontend
- Copy env: cp .env.example .env (or create .env with variables above)
  REACT_APP_API_BASE_URL=http://localhost:4000
  REACT_APP_SOCKET_URL=http://localhost:4000
  REACT_APP_SOCKET_PATH=/socket.io
- npm install
- npm start
- Open http://localhost:3000

3) Verification checklist

Backend readiness
- GET /health returns { status: "ok", time: "..." }

Auth
- Login with default admin from env (DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD)
- GET /auth/me with Bearer token returns current user

Users CRUD (admin)
- Create user: POST /users
- Update user: PUT /users/:id
- Delete user: DELETE /users/:id
- Verify entries appear/vanish in the frontend Users page
- Activity feed reflects CRUD actions

Dashboard metrics
- GET /metrics/stats returns aggregate numbers
- GET /metrics/activity lists recent actions
- Socket.IO namespace /metrics emits metric:update periodically
- Frontend Dashboard shows “Live” when socket connected and updates in real-time

Realtime socket verification
- Ensure frontend connects to REACT_APP_SOCKET_URL with REACT_APP_SOCKET_PATH
- Ensure backend SOCKET_PATH matches frontend REACT_APP_SOCKET_PATH
- Confirm receipt of "metric:update" events on /metrics namespace

4) Troubleshooting

CORS errors (blocked by CORS policy)
- Ensure backend CORS_ORIGIN matches frontend origin (http://localhost:3000)
- Restart backend after changing CORS_ORIGIN

Socket path mismatches (no live events / 404 on socket.io)
- Backend SOCKET_PATH must match frontend REACT_APP_SOCKET_PATH (default /socket.io)
- If you change one, change the other and reload both apps

Invalid JWT / 401 Unauthorized
- Verify Authorization: Bearer <token> is sent by frontend (token stored in localStorage)
- If token expired/invalid, login again; frontend auto-logs out on 401

MongoDB Atlas connection issues
- Verify MONGODB_URI is correct and user credentials are valid
- Allow your IP in Atlas Network Access (or use 0.0.0.0/0 for local dev)
- If password has special characters, URL-encode it in the URI
- Ensure outbound DNS and MongoDB ports are allowed by your environment

Notes
- Detailed backend and frontend READMEs are available in their respective folders for expanded instructions and context.
- Ports and Socket path alignment: Frontend REACT_APP_SOCKET_PATH must equal backend SOCKET_PATH; default /socket.io.
