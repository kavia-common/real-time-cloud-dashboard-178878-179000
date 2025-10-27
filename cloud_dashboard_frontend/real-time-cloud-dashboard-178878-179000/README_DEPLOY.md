# Real-time Cloud Dashboard - Deployment Guide

This repository contains:
- cloud_dashboard_backend (Express + Socket.io)
- cloud_dashboard_frontend (React SPA served by Nginx)

## Environment Variables (Backend)

Required:
- MONGODB_URI
- JWT_SECRET

Recommended:
- PORT=5000
- CORS_ORIGIN=https://your-frontend-domain (or http://localhost:3000 for local)
- SOCKET_PATH=/socket.io
- API_BASE_URL=https://your-backend-domain
- SOCKET_URL=https://your-backend-domain
- RATE_LIMIT_WINDOW_MS=900000
- RATE_LIMIT_MAX=1000
- DISABLE_CSP=false
- MORGAN_FORMAT=combined

## Environment Variables (Frontend; build-time)

- REACT_APP_API_BASE_URL
- REACT_APP_SOCKET_URL
- REACT_APP_SOCKET_PATH

Do not put secrets in REACT_APP_* variables.

## Local Development with Docker Compose

Create `.env` at repo root with your values (just key=value). Then:

```
docker compose up --build
```

- Frontend available at http://localhost:3000
- Backend available at http://localhost:5000

## Production

Options:
1. Docker Compose on a VM (use this repo's compose file)
2. Container Orchestrator (Kubernetes, Nomad, etc.)
3. Node on VM with PM2 for backend + Nginx for frontend

Ensure:
- HTTPS termination at load balancer/reverse-proxy
- Proper CORS and CSP
- Health checks hitting `/healthz` (liveness) and `/readyz` (readiness)
- Graceful shutdown via SIGTERM (supported)

See component READMEs for details:
- cloud_dashboard_backend/README_DEPLOY.md
- cloud_dashboard_frontend/README_DEPLOY.md
