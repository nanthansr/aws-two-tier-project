# Two-Tier AWS Architecture

> A DevOps portfolio project — brownfield integration of a FastAPI backend
> and React frontend, containerised with Docker and deployed on AWS EC2.

## Architecture

A two-tier web application where the React frontend communicates with a FastAPI
REST backend backed by PostgreSQL. Both tiers run in Docker containers on a
single AWS EC2 instance (t2.micro, us-east-1, Ubuntu 24.04).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design decisions and diagrams.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 17 + Redux + react-router v5 |
| Backend | FastAPI 0.95 + SQLAlchemy 2 + Alembic |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose) + bcrypt |
| Containerisation | Docker + Docker Compose |
| Cloud | AWS EC2 (Ubuntu 24.04, t2.micro, us-east-1) |
| Dev Environment | WSL2 on Windows 11 |

## Running Locally

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node v18 (via NVM — `nvm use 18`)
- Python 3.9+
- WSL2 (if on Windows)

### Backend

```bash
cd backend/backend
cp .env.example .env
# Edit .env — set POSTGRES_SERVER=db for Docker networking
docker-compose up --build
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`
PgAdmin: `http://localhost:5050`

### Frontend

```bash
cd frontend
nvm use 18
npm install
npm start
```

The app will be available at `http://localhost:3000`.

> **Note:** The frontend currently points to a hardcoded EC2 IP in
> `src/endpoints.js`. For local development, change `BASEURL` to
> `http://localhost:8000/`.

### Known Local Issues

See [docs/BUGS.md](docs/BUGS.md) for all documented bugs and their fixes,
including Node/OpenSSL compatibility, bcrypt pinning, CORS configuration,
and the `process is not defined` browser error.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full step-by-step AWS
deployment guide covering EC2 launch, SSH setup, Docker installation, and
running the stack in production.

## Project Status

- [x] Local development environment working
- [x] Backend containerised with Docker Compose
- [x] PostgreSQL + PgAdmin containerised
- [x] Frontend running locally with Node v18
- [x] AWS EC2 deployment (t2.micro, us-east-1)
- [x] CORS configured between tiers
- [ ] Environment-variable-driven frontend (no hardcoded IPs)
- [ ] Application Load Balancer
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Auto-scaling group
- [ ] HTTPS / SSL (ACM + ALB)
- [ ] Infrastructure as Code (Terraform)

## Blog Series

This project is documented in a six-part Hashnode series:
[nandytriesthings.hashnode.dev](https://nandytriesthings.hashnode.dev)

## Author

Nanthan Srikumar Radha — Master's student in Applied Computer Science,
Concordia University, Montreal. Graduating Spring 2026.
Targeting Cloud Engineering and MLOps roles.
