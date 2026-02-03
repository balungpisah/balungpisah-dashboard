# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the "heart" of your dependencies first
COPY package.json package-lock.json ./

# --legacy-peer-deps allows React 19 to work with react-simple-maps
RUN npm ci --legacy-peer-deps

# Stage 2: Build the app
FROM node:18-alpine AS builder
WORKDIR /app

# Copy everything from Stage 1
COPY --from=deps /app/node_modules ./node_modules

# COPY . . grabs EVERYTHING: /app, /components, /lib, /public, etc.
COPY . .

# Next.js build requires components/ and lib/ to be present
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Only copy what's needed to run the app to keep it small
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]