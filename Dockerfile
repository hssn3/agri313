# ── Multi-stage Build for Railway ────────────────────────────
# Stage 1: Build frontend + server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copy source code
COPY . .

# Build frontend (Vite) - skip bump-version since we're in production
RUN npm run build || (echo "Frontend build failed" && exit 1)

# Compile server (TypeScript → JavaScript)
RUN npx tsc -p tsconfig.server.json || (echo "Server compile failed" && exit 1)

# ── Stage 2: Production runtime ────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Copy necessary static files
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port (Railway will use $PORT env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start server
CMD ["node", "dist-server/server/index.js"]
