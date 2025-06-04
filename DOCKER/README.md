# Docker Configuration

This directory contains Docker-related configuration files and scripts for building and running the application.

## Directory Structure

```
DOCKER/
├── Dockerfile          # Multi-stage Dockerfile for building the application
├── .dockerignore       # Specifies which files should be ignored during build
├── docker-compose.yml  # Docker Compose configuration for local development
├── scripts/           
│   ├── build.sh       # Script for building the Docker image
│   └── run.sh         # Script for running the container
└── README.md          # This file
```

## Prerequisites

- Docker 24.0.0 or later
- Docker Compose v2.20.0 or later
- Bash shell (for running scripts)

## Environment Variables

### Required Variables

The following environment variables are required for building and running the application:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase project key
- `OPENROUTER_API_KEY`: OpenRouter API key

### Optional Variables with Defaults

These variables have default values but can be overridden:

- `SITE_URL`: The URL where the site will be hosted (default: http://localhost:3000)
- `NODE_ENV`: Node environment (default: production)
- `DEPLOYMENT_ENV`: Deployment environment (default: node)

### Ways to Provide Environment Variables

1. **Environment File**
   ```bash
   # Create .env file with your values
   SUPABASE_URL=your-url
   SUPABASE_KEY=your-key
   OPENROUTER_API_KEY=your-key
   ```

2. **Command Line**
   ```bash
   SUPABASE_URL=xxx SUPABASE_KEY=xxx OPENROUTER_API_KEY=xxx ./DOCKER/scripts/build.sh
   ```

3. **Environment File Flag**
   ```bash
   ./DOCKER/scripts/build.sh --env-file /path/to/.env
   ```

## Build Instructions

1. Basic build:
```bash
./DOCKER/scripts/build.sh --tag latest
```

2. Build with environment file:
```bash
./DOCKER/scripts/build.sh --tag latest --env-file .env
```

3. Build with custom configuration:
```bash
./DOCKER/scripts/build.sh \
  --tag v1.0.0 \
  --node-env production \
  --deployment-env node \
  --env-file .env.production
```

## Run Instructions

1. Using docker-compose:
```bash
# Create .env file first
docker-compose -f DOCKER/docker-compose.yml up -d
```

2. Using run script:
```bash
./DOCKER/scripts/run.sh --tag latest --env-file .env
```

## Environment File Priority

The build script looks for environment files in the following order:

1. File specified with --env-file flag
2. .env in project root
3. .env.build in project root

## Security Notes

- Environment variables are validated at build time
- Sensitive variables are not persisted in the final image
- Build arguments are only available during build phase
- Runtime environment variables must be provided when running the container

## Troubleshooting

1. If build fails with missing variables:
   ```bash
   # Check if all required variables are set
   ./DOCKER/scripts/build.sh --env-file .env
   ```

2. To verify environment variables in a running container:
   ```bash
   docker exec astro-app env
   ```

3. To check build arguments used:
   ```bash
   docker history techybolek/project-name:latest
   ```

## Quick Start

1. Build the image:
```bash
# Using build script
chmod +x DOCKER/scripts/build.sh
./DOCKER/scripts/build.sh --tag latest

# Or using docker-compose
docker-compose -f DOCKER/docker-compose.yml build
```

2. Run the container:
```bash
# Using run script
chmod +x DOCKER/scripts/run.sh
./DOCKER/scripts/run.sh --tag latest --env-file .env

# Or using docker-compose
docker-compose -f DOCKER/docker-compose.yml up -d
```

## Health Checks

The container includes a health check that verifies the application is responding on port 3000. The health check:

- Runs every 30 seconds
- Has a 30-second timeout
- Retries 3 times before marking as unhealthy
- Has a 5-second start period

## Security

The application runs as a non-root user (astro) inside the container for enhanced security. The container uses a minimal Alpine Linux base image to reduce the attack surface.

## Troubleshooting

1. If the container fails to start, check the logs:
```bash
docker logs astro-app
```

2. To inspect the container's health status:
```bash
docker inspect astro-app | grep -A 10 "Health"
```

3. To shell into a running container:
```bash
docker exec -it astro-app /bin/sh
``` 