# soulofsoul — production Docker image
# Multi-stage build: install deps → build → minimal runtime image

# ─── Stage 1: Install dependencies ───
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy package manifests
COPY package.json bun.lock ./
COPY prisma ./prisma

# Install dependencies
RUN bun install --frozen-lockfile

# ─── Stage 2: Build ───
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Build Next.js (standalone output)
RUN bun run build

# ─── Stage 3: Runtime ───
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files for DB migrations at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy mini-service
COPY --from=builder /app/mini-services ./mini-services

# Create data directory for SQLite
RUN mkdir -p /app/db && chown nextjs:nodejs /app/db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run Prisma migrations then start the server
CMD ["sh", "-c", "bun run db:push && bun .next/standalone/server.js"]
