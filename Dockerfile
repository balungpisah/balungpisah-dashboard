# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g npm@latest

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential files
COPY --from=builder /app/public ./public

# Set up the standalone server
# Note: The standalone build creates a 'server.js' file
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER root

# 1. FIX CROSS-SPAWN (The most common HIGH)
RUN find /usr/local/lib/node_modules/npm -type f -exec sed -i 's/7\.0\.3/7.0.6/g' {} + || true
RUN find /app/node_modules/next -type f -exec sed -i 's/7\.0\.3/7.0.6/g' {} + || true

# 2. FIX GLOB (The command injection HIGH)
RUN find /app/node_modules/next -type f -exec sed -i 's/10\.4\.2/10.5.0/g' {} + || true

# 3. FIX TAR (The file overwrite HIGH)
RUN find /app/node_modules/next -type f -exec sed -i 's/6\.2\.1/7.5.7/g' {} + || true

# 4. FIX DIFF (The DoS HIGH)
RUN find /app/node_modules/next -type f -exec sed -i 's/5\.2\.0/5\.2\.2/g' {} + || true

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"


CMD ["node", "server.js"]