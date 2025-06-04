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

## Environment Variables

The application requires the following environment variables:

- `SITE_URL`: The URL where the site will be hosted
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase project key
- `OPENROUTER_API_KEY`: OpenRouter API key

These can be provided via an environment file or set directly in the docker-compose.yml.

## Build Options

The build script supports the following options:

- `--tag`: Image tag (default: latest)
- `--node-env`: Node environment (default: production)
- `--deployment-env`: Deployment environment (default: node)

Example:
```bash
./DOCKER/scripts/build.sh --tag v1.0.0 --node-env production --deployment-env node
```

## Run Options

The run script supports the following options:

- `--tag`: Image tag to run (default: latest)
- `--name`: Container name (default: astro-app)
- `--env-file`: Path to environment file

Example:
```bash
./DOCKER/scripts/run.sh --tag v1.0.0 --name my-app --env-file .env.production
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