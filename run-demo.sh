#!/bin/bash

echo "Starting DaMariS Demo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Stop any existing containers
echo "Cleaning up existing containers..."
docker-compose down -v > /dev/null 2>&1

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 1

# Run the demo
echo "Running demo..."
docker build -t damaris-demo ./demo
docker run --rm --network damaris_default --env API_URL="http://api:3000" damaris-demo

# Cleanup on exit
cleanup() {
  echo "Cleaning up..."
  docker-compose down -v
}

trap cleanup EXIT
