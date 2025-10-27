# syntax=docker/dockerfile:1

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
# No build step for pure Node backend, but keep layer for parity

# Runtime stage
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Create non-root user
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app /app
EXPOSE 5000
USER app
# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:5000/healthz || exit 1
CMD ["node", "src/server.js"]
