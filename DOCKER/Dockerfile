# syntax=docker/dockerfile:1.4

# Build Stage
FROM node:20-alpine AS builder

# Build arguments
ARG NODE_ENV=production
ARG DEPLOYMENT_ENV=node

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

# Runtime arguments
ARG NODE_ENV=production
ARG DEPLOYMENT_ENV=node

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 astro

# Set working directory
WORKDIR /app

# Copy built assets
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production \
    && npm cache clean --force

# Set environment variables
ENV NODE_ENV=${NODE_ENV} \
    DEPLOYMENT_ENV=${DEPLOYMENT_ENV} \
    PORT=3000

# Switch to non-root user
USER astro

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start application
CMD ["node", "dist/server/entry.mjs"] 