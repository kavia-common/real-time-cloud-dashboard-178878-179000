# Cloud Dashboard Frontend (React)

React-based frontend for the Real-time Cloud Dashboard. Integrates with the Express + Socket.IO backend for authentication, user management, metrics, and live updates.

## Features

- Auth: Login, Register, Session validation via JWT
- Users: Admin-only CRUD
- Metrics: Stats and recent activity via REST
- Realtime: Live event feed via Socket.IO (/metrics namespace)
- Theming: Ocean Professional theme, responsive layout

## Prerequisites

- Node.js >= 18
- Backend running (see ../cloud_dashboard_backend/README.md)

## Environment

Copy env example and adjust if needed:

```
cp .env.example .env
```

Available variables:

- REACT_APP_API_BASE_URL: Base URL for REST API (example http://localhost:4000 or http://localhost:4000/api). If not set, the app will warn and fall back to http://localhost:4000.
- REACT_APP_SOCKET_URL: Base URL for Socket.IO (default for local dev http://localhost:4000)
- REACT_APP_SOCKET_PATH: Optional custom Socket.IO path (defaults to /socket.io; must match backend SOCKET_PATH)

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

Ensure the backend is running at REACT_APP_API_BASE_URL and allows CORS for the frontend origin.

## Auth Flow

- POST /auth/login and /auth/register return { token, user }
- JWT stored in localStorage as auth_token; user in auth_user
- On app load, if token exists, GET /auth/me is called to validate
- If any API returns 401, the app automatically logs out and redirects to /login

## Users (Admin)

- List/create/update/delete via /users endpoints
- Non-admins won't see Users table and controls

## Metrics

- GET /metrics/stats populates stat cards and chart baseline
- GET /metrics/activity renders Recent Activity table
- Socket.IO connects to namespace /metrics and listens for event `metric:update`

## Scripts

- npm start: start dev server
- npm run build: production build
- npm test: run tests

## Notes

- Configure backend CORS_ORIGIN to match http://localhost:3000 in development.
- For MongoDB Atlas configuration and backend env vars, see backend README.
