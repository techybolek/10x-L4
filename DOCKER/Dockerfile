# syntax=docker/dockerfile:1.4

# Build Stage
FROM node:20-alpine AS builder

# Build arguments with defaults
ARG NODE_ENV=production
ARG DEPLOYMENT_ENV=node
ARG SITE_URL=http://localhost:3000
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG OPENROUTER_API_KEY
ARG MODEL

# Validate required build args
RUN if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ] || [ -z "$OPENROUTER_API_KEY" ] || [ -z "$MODEL" ]; then \
    echo "Error: Required build arguments are missing" && \
    echo "SUPABASE_URL: ${SUPABASE_URL:+set}" && \
    echo "SUPABASE_KEY: ${SUPABASE_KEY:+set}" && \
    echo "OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:+set}" && \
    echo "MODEL: ${MODEL:+set}" && \
    exit 1; \
    fi

# Set as environment variables for build
ENV NODE_ENV=$NODE_ENV \
    DEPLOYMENT_ENV=$DEPLOYMENT_ENV \
    SITE_URL=$SITE_URL \
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_KEY=$SUPABASE_KEY \
    OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
    MODEL=$MODEL

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