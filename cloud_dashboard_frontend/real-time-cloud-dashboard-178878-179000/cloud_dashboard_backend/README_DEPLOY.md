# Cloud Dashboard Backend - Deployment & Production Hardening

This backend is an Express.js application connected to MongoDB Atlas and exposing HTTP and WebSocket interfaces.

## Environment Variables

Create a `.env` (not committed) with:

- PORT=5000
- MONGODB_URI=...           (required)
- JWT_SECRET=...            (required)
- CORS_ORIGIN=https://your-frontend-domain (comma-separated not supported by default cors)
- SOCKET_PATH=/socket.io
- API_BASE_URL=https://your-backend-domain
- SOCKET_URL=https://your-backend-domain
- RATE_LIMIT_WINDOW_MS=900000
- RATE_LIMIT_MAX=1000
- DISABLE_CSP=false
- MORGAN_FORMAT=combined

Do not commit secrets. For CI/CD, set these as environment variables in your orchestrator.

## Production Features

- Helmet security headers with CSP (configurable via DISABLE_CSP).
- Rate limiting on `/api`.
- morgan request logging in combined format.
- CORS configured via `CORS_ORIGIN`.
- Health endpoints: `/healthz` (liveness), `/readyz` (readiness).
- Graceful shutdown handling SIGINT/SIGTERM.

## Run Locally (Node)

```
npm ci
npm start
```

## Run with PM2 (Production Node)

Install PM2 globally on the host:

```
npm i -g pm2
```

Create `ecosystem.config.js` (example):

```
module.exports = {
  apps: [{
    name: 'cloud-dashboard-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' }
  }]
}
```

Start:

```
pm2 start ecosystem.config.js
pm2 save
```

## Docker

Build and run:

```
docker build -t cloud-dashboard-backend:latest .
docker run -p 5000:5000 --env-file ../.env cloud-dashboard-backend:latest
```

## Compose (with frontend)

From repo root:

```
docker compose up --build
```
