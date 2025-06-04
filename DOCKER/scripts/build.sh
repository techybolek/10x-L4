#!/bin/bash

# Exit on error
set -e

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Default values
IMAGE_NAME="techybolek/project-name"
TAG="latest"
NODE_ENV="production"
DEPLOYMENT_ENV="node"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      TAG="$2"
      shift 2
      ;;
    --node-env)
      NODE_ENV="$2"
      shift 2
      ;;
    --deployment-env)
      DEPLOYMENT_ENV="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build the Docker image
echo "Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build \
  --file "${PROJECT_ROOT}/DOCKER/Dockerfile" \
  --tag "${IMAGE_NAME}:${TAG}" \
  --build-arg NODE_ENV="${NODE_ENV}" \
  --build-arg DEPLOYMENT_ENV="${DEPLOYMENT_ENV}" \
  "${PROJECT_ROOT}"

echo "Build complete: ${IMAGE_NAME}:${TAG}" 