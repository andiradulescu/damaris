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
