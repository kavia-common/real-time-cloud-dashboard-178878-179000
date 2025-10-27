# Real-time Cloud Dashboard Frontend

React-based frontend for the Real-time Cloud Dashboard. Integrates with the Express + Socket.IO backend for authentication, user management, metrics, and live updates.

## Features

- Auth: Login, Register, Session validation via JWT
- Users: Admin-only CRUD with Activity logging
- Metrics: Stats and recent activity via REST
- Realtime: Live event feed via Socket.IO (/metrics namespace)
- Theming: Ocean Professional theme, responsive layout

## Prerequisites

- Node.js >= 18
- Backend running (see ../cloud_dashboard_backend/README.md)

## Environment

Quick start:

1) Copy example:
```
cp .env.example .env
```

2) Set required variables in .env:
```
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_SOCKET_PATH=/socket.io
```

- http.js reads REACT_APP_API_BASE_URL for Axios baseURL.
- useSocket.js reads REACT_APP_SOCKET_URL and REACT_APP_SOCKET_PATH for Socket.IO client.
- Ensure backend CORS_ORIGIN includes your frontend origin (e.g., http://localhost:3000).

Important:
- After changing any REACT_APP_* variables, you must rebuild/restart the frontend for changes to take effect.
  - Dev: stop and re-run `npm start`
  - Prod: re-run `npm run build` and redeploy

## Auth expectations

- POST /auth/login returns { token, user }
- POST /auth/register returns { token, user }
- GET /auth/me returns the user profile directly (not wrapped as { user: ... })

The app stores:
- auth_token (JWT) and
- auth_user (JSON user) in localStorage.

401 responses trigger automatic logout and redirect to /login.

## Live metrics

- REST: GET /metrics/stats and GET /metrics/activity
- WebSocket: connects to `${REACT_APP_SOCKET_URL}/metrics` using `REACT_APP_SOCKET_PATH`
- Listens for "metric:update" events and updates the dashboard in real-time

## Getting Started

Install dependencies:

```
npm install
```

Run development server:

```
npm start
```

App runs at http://localhost:3000

## Scripts

- npm start: start dev server
- npm run build: build for production
- npm test: run tests

## Notes

- Configure backend CORS_ORIGIN to match your frontend origin (e.g., http://localhost:3000).
- Ensure SOCKET_PATH (backend) equals REACT_APP_SOCKET_PATH (frontend).
- For MongoDB/Atlas and backend configuration, see the backend README.
