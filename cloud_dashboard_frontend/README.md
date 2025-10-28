# Cloud Dashboard Frontend

React-based frontend for the Real-time Cloud Dashboard with authentication, users CRUD, charts, and real-time updates via Socket.IO.

## Quick Start

1) Install dependencies
- npm install

2) Configure environment
- Copy .env.example to .env and adjust values as needed:
  - REACT_APP_API_BASE_URL=http://localhost:4000
  - REACT_APP_SOCKET_URL=http://localhost:4000
  - REACT_APP_SOCKET_PATH=/socket.io

3) Run the app
- npm start
- The app will be available at http://localhost:3000

## Environment Variables

- REACT_APP_API_BASE_URL: Base URL for backend HTTP API (no trailing slash)
- REACT_APP_SOCKET_URL: Socket.IO server URL
- REACT_APP_SOCKET_PATH: Socket.IO path (must match backend)

Note: Additional variables may exist for backend provisioning but are not used by the frontend directly:
REACT_APP_MONGO_URI, REACT_APP_MONGO_DB_NAME, REACT_APP_MONGODB_URI, REACT_APP_JWT_SECRET, REACT_APP_DEFAULT_ADMIN_NAME, REACT_APP_DEFAULT_ADMIN_EMAIL, REACT_APP_DEFAULT_ADMIN_PASSWORD

## API Integration

- Axios client attaches Bearer token from localStorage ('token') and handles 401 by clearing session and redirecting to /login.
- Endpoints:
  - POST /auth/login
  - POST /auth/register
  - GET /auth/me
  - /users (GET list, POST create)
  - /users/:id (GET, PUT, DELETE)
  - GET /metrics/stats
  - GET /metrics/activity

## Realtime

- The Dashboard connects to the Socket.IO metrics namespace and listens for `metric:update` events to update StatCards and the live chart. LiveIndicator shows connection status.

## Routes and Guards

- ProtectedRoute gates authenticated routes.
- RoleRoute restricts routes to a specific role (e.g., admin for Users page).

See README_DEPLOY.md for deployment notes.
