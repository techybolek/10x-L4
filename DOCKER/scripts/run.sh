#!/bin/bash

# Exit on error
set -e

# Default values
IMAGE_NAME="techybolek/project-name"
TAG="latest"
CONTAINER_NAME="astro-app"
ENV_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      TAG="$2"
      shift 2
      ;;
    --name)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} already exists. Removing it..."
  docker rm -f "${CONTAINER_NAME}"
fi

# Build the docker run command
CMD="docker run -d \
  --name ${CONTAINER_NAME} \
  -p 3000:3000"

# Add env-file if specified
if [[ -n "${ENV_FILE}" ]]; then
  CMD="${CMD} --env-file ${ENV_FILE}"
fi

# Add image name and tag
CMD="${CMD} ${IMAGE_NAME}:${TAG}"

# Run the container
echo "Starting container: ${CONTAINER_NAME}"
eval "${CMD}"

# Wait for health check
echo "Waiting for container to be healthy..."
while [[ "$(docker inspect -f {{.State.Health.Status}} ${CONTAINER_NAME})" != "healthy" ]]; do
  sleep 2
done

echo "Container ${CONTAINER_NAME} is running and healthy"
echo "Application is available at http://localhost:3000" 