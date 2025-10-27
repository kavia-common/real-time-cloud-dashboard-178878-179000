# Cloud Dashboard Frontend

React-based frontend for the Real-Time Cloud Dashboard. Implements authentication, users CRUD (admin-only), metrics stats/activity, and live updates via Socket.IO. Ocean Professional theme applied.

## Requirements

- Node.js LTS (18+)
- Running backend API (Express) at `http://localhost:4000`
  - Socket.IO mounted at `/socket.io`
  - Namespaces:
    - `/metrics` emits `metric:update`

## Environment Variables

Create a `.env` file at project root (copy from `.env.example`):

```
REACT_APP_API_BASE_URL=http://localhost:4000
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_SOCKET_PATH=/socket.io
```

## Scripts

- `npm install`
- `npm start`

The app will run at http://localhost:3000.

## Key Integrations

- Axios `src/api/http.js`
  - Adds Authorization header from localStorage
  - Handles 401 by clearing session and redirecting to `/login`
- Auth Context `src/context/AuthContext.jsx`
  - Persists token and user
  - Validates session with `/auth/me`
- Routes Guards
  - `ProtectedRoute` for authenticated access
  - `RoleRoute` for role-based access (e.g., admin)
- Socket.IO Hook `src/hooks/useSocket.js`
  - Connects to `${REACT_APP_SOCKET_URL}/metrics` with `REACT_APP_SOCKET_PATH`
  - Listens for `metric:update` events

## Pages

- Dashboard
  - Fetches `/metrics/stats`
  - Live updates via `metric:update`
- Users (admin-only)
  - `/users` list, create, update, delete
- Activity
  - `/metrics/activity` list

## Ocean Professional Theme

- CSS variables in `src/styles/theme.css`
- Tokens in `src/theme/oceanTheme.ts`
- Subtle gradients, rounded corners, and shadows applied across UI

## Notes

- Ensure the backend uses the same Socket.IO path as the frontend's `REACT_APP_SOCKET_PATH` (default `/socket.io`) and that the backend `CORS_ORIGIN` matches the frontend origin (default `http://localhost:3000`).
- JWT is stored in `localStorage` under `rtcd_access_token`. If changed on the backend, update `src/api/http.js`.
