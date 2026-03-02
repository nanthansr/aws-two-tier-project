# Architecture

## Overview

This is a two-tier web application deployed on AWS EC2. The tiers are:

1. **Frontend** — React SPA served from the host or a container, communicating
   with the backend over HTTP.
2. **Backend** — FastAPI application backed by PostgreSQL, both running in
   Docker containers via Docker Compose.

```
Browser
  │
  │  HTTP (port 3000 locally / port 80 on EC2)
  ▼
React Frontend (react-scripts / static build)
  │
  │  HTTP REST API (port 8000)
  ▼
FastAPI Backend  ──────────────►  PostgreSQL 16
(uvicorn, port 8000)              (Docker volume: postgres_data)
  │
  │  HTTP (port 5050)
  ▼
PgAdmin 4
(admin UI for the database)
```

All three backend services (`web`, `db`, `pgadmin`) are defined in
`backend/backend/docker-compose.yaml` and run on a shared Docker network,
allowing service-name DNS resolution (e.g., the app connects to `db:5432`,
not `localhost:5432`).

---

## Why Brownfield Integration

Both the frontend and backend were sourced from existing open-source
repositories rather than being written from scratch. The engineering work was
the infrastructure layer: wiring the two codebases together, containerising
them, fixing compatibility issues, and deploying to AWS.

This mirrors the real-world scenario of a DevOps/Cloud engineer inheriting
existing applications and making them production-ready.

---

## Key Design Decisions

### Single EC2 Instance

Both tiers run on one `t2.micro` instance for cost — this is a portfolio
project, not a production workload. The natural next step is splitting them:
frontend behind CloudFront + S3, backend on an Auto Scaling Group behind an
Application Load Balancer.

### Docker Compose (not ECS/EKS)

Docker Compose was chosen for simplicity and portability. The same
`docker-compose.yaml` runs locally and on EC2 with no changes. A future
iteration would migrate to ECS Fargate or Kubernetes.

### JWT Authentication

The backend uses python-jose for JWT token generation and passlib+bcrypt for
password hashing. Tokens expire after 30 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`
in `core/config.py`). The secret key is read from the environment — never
hardcoded.

### Alembic Migrations

Database schema is managed with Alembic. The single migration at
`alembic/versions/b35cc22d1726_create_user_and_blog_table_migrations.py`
creates the `users` and `blogs` tables. Running `docker-compose up` auto-creates
tables via SQLAlchemy (`Base.metadata.create_all`) on startup.

### CORS

`CORSMiddleware` is added in `main.py` to allow requests from the React dev
server (`localhost:3000`). When deploying, the `allow_origins` list must be
updated to include the frontend's public URL.

### Dual Routing (API + HTML)

The backend exposes two router groups:
- `apis/` — JSON REST endpoints under `/blogs`, `/blog/{id}`, `/users`, `/token`
- `apps/` — Jinja2 HTML-rendered routes (legacy, for the original backend UI)

The React frontend exclusively uses the `apis/` routes.

---

## Directory Structure Notes

The backend source lives at `backend/backend/` (one level of nesting deeper
than expected). This reflects the original open-source repo structure, which
had its own `backend/` root. The outer `backend/` directory contains supporting
files (`setup.cfg`, `.pre-commit-config.yaml`).

```
backend/                  ← repo integration wrapper
└── backend/              ← original open-source app root
    ├── main.py
    ├── docker-compose.yaml
    ├── Dockerfile
    ├── requirements.txt
    ├── alembic/
    ├── apis/             ← REST API routes (consumed by React)
    ├── apps/             ← HTML template routes (legacy)
    ├── core/             ← config, hashing, security
    ├── db/               ← models, repositories, session
    ├── schemas/          ← Pydantic schemas
    ├── templates/        ← Jinja2 HTML templates
    └── tests/
```

---

## AWS Infrastructure

| Resource | Value |
|----------|-------|
| Instance type | t2.micro |
| Region | us-east-1 |
| AMI | Ubuntu 24.04 LTS |
| Security group | Inbound: 22 (SSH), 8000 (API), 3000 (React), 5050 (PgAdmin) |
| Storage | 8 GB gp2 EBS (default) |

---

## Future Architecture (Target State)

```
Route 53
  │
  ▼
CloudFront + S3 (React static build)
  │
  ▼
Application Load Balancer
  │
  ▼
Auto Scaling Group (EC2 / ECS Fargate)
  │   ├── FastAPI container
  │   └── ...
  ▼
RDS PostgreSQL (Multi-AZ)
```

With supporting services: ACM (SSL), GitHub Actions (CI/CD), CloudWatch
(monitoring), Secrets Manager (credentials).
