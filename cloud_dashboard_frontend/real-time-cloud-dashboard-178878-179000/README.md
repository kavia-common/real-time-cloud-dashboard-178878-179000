# Real-time Cloud Dashboard

Concise integration guide for the full-stack app (Express + MongoDB + Socket.IO backend and React frontend).

See README_DEPLOY.md for production deployment instructions, Docker usage, and environment variables.

1) Environment variables

Frontend (.env at cloud_dashboard_frontend)
- REACT_APP_API_BASE_URL: Base URL for REST API, e.g. http://localhost:5000
- REACT_APP_SOCKET_URL: Base URL for Socket.IO, e.g. http://localhost:5000
- REACT_APP_SOCKET_PATH: Optional custom Socket.IO path; must match backend SOCKET_PATH (default /socket.io)

Backend (.env at cloud_dashboard_backend)
- PORT: HTTP port (default 5000)
- MONGODB_URI: MongoDB connection string (Atlas recommended)
- JWT_SECRET: Secret for signing JWTs
- CORS_ORIGIN: Allowed origin for CORS (e.g. http://localhost:3000)
- SOCKET_PATH: Socket.IO server path (default /socket.io)
- METRIC_TICK_MS: Interval in ms for metric:update emissions (default 3000)
- DEFAULT_ADMIN_EMAIL: Bootstrapped admin email (e.g. admin@example.com)
- DEFAULT_ADMIN_NAME: Bootstrapped admin display name (e.g. Administrator)
- DEFAULT_ADMIN_PASSWORD: Bootstrapped admin password (change in production)

2) Running locally

Backend (port 5000)
- cd cloud_dashboard_backend
- Create .env with variables above
- npm install
- npm run dev
- Health: GET http://localhost:5000/healthz

Frontend (port 3000)
- cd cloud_dashboard_frontend
- Create .env with:
  REACT_APP_API_BASE_URL=http://localhost:5000
  REACT_APP_SOCKET_URL=http://localhost:5000
  # REACT_APP_SOCKET_PATH=/socket.io    (only if changed on backend)
- npm install
- npm start
- Open http://localhost:3000

3) Troubleshooting

CORS errors (blocked by CORS policy)
- Ensure backend CORS_ORIGIN matches frontend origin (http://localhost:3000)
- Restart backend after changing CORS_ORIGIN

Socket path mismatches (no live events / 404 on socket.io)
- Backend SOCKET_PATH must match frontend REACT_APP_SOCKET_PATH (default /socket.io)
- If you change one, change the other and reload both apps

Invalid JWT / 401 Unauthorized
- Verify Authorization: Bearer <token> is sent by frontend (token stored in localStorage)
- If token expired/invalid, login again; frontend will auto-logout on 401

MongoDB Atlas connection issues
- Verify MONGODB_URI is correct and user credentials are valid
- Allow your IP in Atlas Network Access (or use 0.0.0.0/0 for local dev)
- If password has special characters, URL-encode it in the URI
- Ensure outbound DNS and MongoDB ports are allowed by your environment
