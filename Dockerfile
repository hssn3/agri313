# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Build server (compile TS)
RUN npx tsc -p tsconfig.server.json || true

# ── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 3000

CMD ["node", "dist-server/server/index.js"]
