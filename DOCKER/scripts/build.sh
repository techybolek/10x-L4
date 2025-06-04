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
ENV_FILE=""

# Function to load environment variables
load_env_file() {
    local env_file=$1
    if [[ -f "$env_file" ]]; then
        echo "Loading environment from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        echo "Warning: Environment file $env_file not found"
        return 1
    fi
}

# Function to validate required variables
validate_env_vars() {
    local missing_vars=()
    local required_vars=("SUPABASE_URL" "SUPABASE_KEY" "OPENROUTER_API_KEY")

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        echo "Error: Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        return 1
    fi
}

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

# Try to load environment variables
if [[ -n "$ENV_FILE" ]]; then
    load_env_file "$ENV_FILE"
elif [[ -f "${PROJECT_ROOT}/.env" ]]; then
    load_env_file "${PROJECT_ROOT}/.env"
elif [[ -f "${PROJECT_ROOT}/.env.build" ]]; then
    load_env_file "${PROJECT_ROOT}/.env.build"
fi

# Validate environment variables
validate_env_vars

# Build the Docker image
echo "Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build \
    --file "${PROJECT_ROOT}/DOCKER/Dockerfile" \
    --tag "${IMAGE_NAME}:${TAG}" \
    --build-arg NODE_ENV="${NODE_ENV}" \
    --build-arg DEPLOYMENT_ENV="${DEPLOYMENT_ENV}" \
    --build-arg SITE_URL="${SITE_URL:-http://localhost:3000}" \
    --build-arg SUPABASE_URL="${SUPABASE_URL}" \
    --build-arg SUPABASE_KEY="${SUPABASE_KEY}" \
    --build-arg OPENROUTER_API_KEY="${OPENROUTER_API_KEY}" \
    "${PROJECT_ROOT}"

echo "Build complete: ${IMAGE_NAME}:${TAG}" 