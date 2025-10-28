# Real-time Cloud Dashboard – Verification Checklist

Use this quick checklist to verify end-to-end wiring (frontend ↔ backend ↔ MongoDB ↔ sockets).

Prereqs
- Node 18+ installed
- MongoDB Atlas SRV URI ready with an allowed IP (0.0.0.0/0 for local dev)
- Generate a strong JWT secret

1) Environment setup
Backend (cloud_dashboard_backend/.env)
- Copy: cp .env.example .env
- Set:
  - MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority&appName=CloudDashboard"
  - JWT_SECRET="<your-strong-secret>"
  - CORS_ORIGIN=http://localhost:3000
- Keep:
  - PORT=4000
  - SOCKET_PATH=/socket.io
  - METRIC_TICK_MS=3000
- Optionally set default admin:
  - DEFAULT_ADMIN_NAME="Administrator"
  - DEFAULT_ADMIN_EMAIL="admin@example.com"
  - DEFAULT_ADMIN_PASSWORD="ChangeMe123!"

Frontend (cloud_dashboard_frontend/.env)
- Copy: cp .env.example .env
- Ensure:
  - REACT_APP_API_BASE_URL=http://localhost:4000
  - REACT_APP_SOCKET_URL=http://localhost:4000
  - REACT_APP_SOCKET_PATH=/socket.io

Notes:
- Do NOT place backend secrets (MONGODB_URI, JWT_SECRET, DEFAULT_ADMIN*) in the frontend .env.

2) Start services
Backend
- cd cloud_dashboard_backend
- npm install
- npm run dev
- Verify health: curl http://localhost:4000/health => {"status":"ok", "time":"..."}

Frontend
- cd cloud_dashboard_frontend
- npm install
- npm start
- Open http://localhost:3000

3) Functional verification
Auth
- If default admin set, login with DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD
- After login, GET /auth/me (via app) should return your profile

Users (admin)
- Navigate to Users page
- Create a new user; confirm it appears in the list
- Edit and delete the user; verify list updates and activity feed reflects actions

Metrics
- Dashboard should show “Live” indicator when sockets connect
- Stats and charts update periodically
- Backend socket namespace /metrics emits `metric:update` every METRIC_TICK_MS

Realtime socket checks
- Frontend connects to REACT_APP_SOCKET_URL with REACT_APP_SOCKET_PATH
- Backend SOCKET_PATH matches frontend REACT_APP_SOCKET_PATH
- No 404s on /socket.io path in browser network tab

4) Troubleshooting
CORS blocked
- Ensure backend CORS_ORIGIN=http://localhost:3000
- Restart backend after changes

Socket not connecting
- Ensure SOCKET_PATH (backend) == REACT_APP_SOCKET_PATH (frontend)
- Restart both apps

401 Unauthorized
- Re-login; token stored in localStorage ('token')
- Frontend clears session on 401 automatically

MongoDB connection
- Validate MONGODB_URI and credentials
- Atlas Network Access allows your IP
- URL-encode special characters in password

5) Required secrets summary (backend .env)
- MONGODB_URI (MongoDB Atlas SRV URI)
- JWT_SECRET (random, strong string)
- DEFAULT_ADMIN_* (optional but recommended for first login)
