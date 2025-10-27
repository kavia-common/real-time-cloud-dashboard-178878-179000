# Cloud Dashboard Frontend - Deployment

This is a React SPA that consumes the Express backend and connects via WebSocket for real-time updates.

## Build-time Environment Variables

React variables are baked at build time (prefix REACT_APP_). Provide them before `npm run build` or as Docker build args or `.env` file during local CI.

- REACT_APP_API_BASE_URL=https://your-backend-domain
- REACT_APP_SOCKET_URL=wss://your-backend-domain
- REACT_APP_SOCKET_PATH=/socket.io

Note: Do not include secrets in the frontend .env. They become public.

## Local build and preview

```
npm ci
npm run build
npx serve -s build -l 3000
```

## Docker

The provided Dockerfile builds the app and serves via Nginx with strong security headers.

Build:

```
docker build -t cloud-dashboard-frontend:latest .
```

Run:

```
docker run -p 3000:80 cloud-dashboard-frontend:latest
```

## Compose with Backend

From repo root:

```
docker compose up --build
```

The Nginx config is in `nginx.conf` and includes CSP and common security headers. Adjust `connect-src` if your API is on a different domain.
