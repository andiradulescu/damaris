# DaMariS (Distributed Messaging System)

A scalable, fault-tolerant distributed messaging system.

## Features

- **RESTful API**: For submitting messages/jobs
- **Distributed Processing**: Horizontally scalable with multiple workers
- **Fault Tolerant**: Automatic job recovery and retries on worker failures
- **Job Status Tracking**: Tracking of all jobs status

## Architecture

The system consists of three main components:

1. **API Server**: RESTful API for job submission and monitoring
2. **Job Queue (Redis)**: Distributes jobs to available workers using Bull
3. **Workers**: Process jobs in parallel with automatic recovery

## Quick Start

1. Clone the repository

2. Start the services using Docker Compose:
```bash
docker-compose up -d
```

The API will be available at http://localhost:3000

## Quick Demo Script
```bash
./run-demo.sh
```

Both "Quick Start" and "Quick Demo Script" require Docker.

## Prerequisites

- Node.js
- Redis

## Development Setup

1. Install dependencies:
```bash
yarn
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Start the api:
```bash
yarn api
```

4. Start a worker:
```bash
yarn worker
```

## API Documentation

### Submit a Job

```http
POST /jobs
Content-Type: application/json

{
  "type": "process_data",
  "data": {
    "input": "example input",
    "options": {}
  }
}
```

### Get Job Status

```http
GET /jobs/:jobId
```

### List Jobs

```http
GET /jobs?status=completed&type=process_data&page=1&limit=10
```

### Delete a Job

```http
DELETE /jobs/:jobId
```
