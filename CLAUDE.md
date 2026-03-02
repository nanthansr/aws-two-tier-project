# CLAUDE.md
# Instructions for Claude Code — Two-Tier AWS Architecture Project

> Read this file fully before doing anything. This is the single source of truth
> for how to work in this repository.

---

## What This Project Is

A two-tier web application deployed on AWS, built as a DevOps portfolio piece.
The strategy was brownfield integration — taking two existing open-source repos
and building the infrastructure to make them work together.

This is NOT a tutorial app. It is a real deployment with real configuration decisions.
Treat it accordingly.

---

## Repository Structure

```
/
├── backend/          # FastAPI application (Python)
│   ├── requirements.txt
│   ├── .env          # Never commit this
│   ├── .env.example  # Safe to commit
│   └── docker-compose.yml
│
├── frontend/         # React application (JavaScript)
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│
├── docs/             # Create this if it doesn't exist
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── BUGS.md
│   └── DEPLOYMENT.md
│
├── CLAUDE.md         # This file
└── README.md         # Root README — create if missing
```

If any of the above folders or files are missing, create them.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Redux |
| Backend | FastAPI + PostgreSQL |
| Containerisation | Docker + Docker Compose |
| Cloud | AWS EC2 (Ubuntu 24.04, t2.micro, us-east-1) |
| Dev Environment | WSL2 on Windows 11 |

---

## Task: What to Do When First Run in This Repo

When Claude Code is run in this directory for the first time, do the following
in order. Ask for confirmation before each major step.

### Step 1 — Audit the Repository
Walk every folder and file. Build a mental map of:
- What exists
- What is missing
- What is inconsistent (e.g. hardcoded IPs, missing env examples, undocumented configs)

Report the audit findings before doing anything else.

### Step 2 — Create Missing Supplementary Files

Create any of the following that are missing:

**Root `README.md`** — Project overview, stack, how to run locally, how to deploy.
Follow the structure below.

**`docs/ARCHITECTURE.md`** — Architecture decisions, why polyrepo, why brownfield,
the two-tier design. Pull from existing code structure to document what's actually there.

**`docs/BUGS.md`** — Known bugs fixed during development. Document each with:
- Error message
- Root cause
- Fix applied
- Lesson learned

**`docs/DEPLOYMENT.md`** — Step by step AWS deployment guide. EC2 launch,
SSH setup, Docker install, docker-compose up. Based on the actual files in the repo.

**`.gitignore`** — If missing, create one appropriate for Python + Node + Docker.
Must include: `.env`, `node_modules/`, `__pycache__/`, `*.pem`, `.venv/`, `venv/`.

**`backend/.env.example`** — If `.env.example` is missing but `.env` exists,
create a sanitised example with placeholder values. Never expose real credentials.

### Step 3 — Report What Was Created

After creating files, give a summary of:
- What was created and where
- What still needs manual input from the owner (e.g. real IP addresses, credentials)
- What should be reviewed before pushing to GitHub

---

## README.md Structure to Follow

When creating the root README, use this structure:

```markdown
# Two-Tier AWS Architecture

> A DevOps portfolio project — brownfield integration of a FastAPI backend
> and React frontend, containerised with Docker and deployed on AWS EC2.

## Architecture

[Brief description + link to docs/ARCHITECTURE.md]

## Stack

[Table: Frontend / Backend / Database / Cloud / Dev Environment]

## Running Locally

### Prerequisites
[List: Docker, Node v18, Python 3.x, NVM, WSL2 if on Windows]

### Backend
[Commands to copy .env.example, docker-compose up --build]

### Frontend
[Commands: nvm use 18, npm install, npm start]

### Known Local Issues
[Link to docs/BUGS.md — brief mention of the 8 bugs documented]

## Deployment

[Link to docs/DEPLOYMENT.md]

## Project Status

- [x] Local development environment
- [x] Backend containerised
- [x] Frontend containerised
- [x] AWS EC2 deployment
- [ ] Load balancer
- [ ] CI/CD pipeline
- [ ] Auto-scaling
- [ ] HTTPS / SSL
```

---

## Standing Rules — Always Follow These

**Never commit secrets.**
If you see a `.env` file with real values being tracked by git, flag it immediately.
Add it to `.gitignore` and create a `.env.example` with placeholder values.

**Never overwrite existing working configuration.**
If `docker-compose.yml` or `.env` files exist and the app is running,
do not modify them without being explicitly asked. Suggest changes, don't apply them.

**Prefer additive changes.**
When in doubt, create a new file rather than editing an existing one.
Ask before modifying any file that affects runtime behaviour.

**Flag hardcoded values.**
If you find hardcoded IP addresses, ports, or credentials anywhere in the codebase,
flag them and suggest how to move them to environment variables.

**Match the existing code style.**
Don't introduce new patterns, libraries, or tooling without being asked.
This is a portfolio project — consistency and clarity matter more than cleverness.

---

## Known Issues and Decisions

These are already resolved — do not re-open them or suggest alternatives
unless explicitly asked.

| Issue | Resolution |
|-------|-----------|
| `pg_config executable not found` | `sudo apt-get install libpq-dev gcc` |
| `POSTGRES_SERVER=localhost` in container | Changed to service name `db` |
| `bcrypt` v5+ crash with `passlib` | Pinned `bcrypt==4.0.1` in requirements.txt |
| Node v24 incompatible with react-scripts | Use Node v18 via NVM |
| `ERR_OSSL_EVP_UNSUPPORTED` | `NODE_OPTIONS=--openssl-legacy-provider` |
| CORS blocked between ports 3000 and 8000 | Added `CORSMiddleware` to FastAPI main.py |
| `process is not defined` in browser | Added `window.process` polyfill to index.html |

---

## Owner Context

This project was built by Nanthan Srikumar Radha — a Master's student in
Applied Computer Science at Concordia University, Montreal, graduating Spring 2026.
Targeting Cloud Engineering and MLOps roles.

The project is documented in a six-part Hashnode blog series:
https://nandytriesthings.hashnode.dev

When suggesting improvements, prioritise things that demonstrate:
- Cloud infrastructure knowledge (AWS, networking, security groups)
- DevOps practices (CI/CD, containerisation, IaC)
- Production-readiness (scaling, monitoring, HTTPS)
