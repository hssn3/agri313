# SmartAgri v1.1.0 — Railway Production Build
# Cache bust: 2026-07-27-v3

FROM node:20-alpine AS build_stage

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY . .

RUN npm run build
RUN npx tsc -p tsconfig.server.json

# --- Production ---
FROM node:20-alpine AS prod_stage

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=build_stage /app/dist ./dist
COPY --from=build_stage /app/dist-server ./dist-server

EXPOSE 3000

CMD ["node", "dist-server/server/index.js"]
