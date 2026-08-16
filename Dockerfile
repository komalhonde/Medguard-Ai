# =========================================================
# MedGuard AI - Multi-Stage Production Dockerfile
# Stage 1: Build Frontend and Backend Assets
# Stage 2: Minimal Alpine Production Runtime
# =========================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json tsconfig.json vite.config.ts ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend assets and bundle backend server to dist/server.cjs
RUN npm run build

# ---------------------------------------------------------
# Stage 2: Production Minimal Container Image
# ---------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json ./
RUN npm install --only=production

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/pipeline ./pipeline
COPY --from=builder /app/metadata.json ./
COPY --from=builder /app/README.md ./
COPY --from=builder /app/DECISION_LOG.md ./
COPY --from=builder /app/DEBUGGING_REPORT.md ./
COPY --from=builder /app/AI_USAGE.md ./
COPY --from=builder /app/ARCHITECTURE.md ./

# Expose HTTP port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
