# Multi-stage Dockerfile for SIGCA - Centro Armonía
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund && test -x node_modules/.bin/vue-tsc

# Copy source and build frontend assets
COPY . .
RUN npm run build

# Runtime container reuses the dependency installation from the build stage.
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built application and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

CMD ["./node_modules/.bin/tsx", "server.ts"]
