# Deployment Guide — AWS EC2

Step-by-step guide to deploying this application on AWS EC2.

## Prerequisites

- An AWS account
- A key pair (`.pem` file) created in the EC2 console
- The AWS CLI installed locally (optional but useful)

---

## Step 1 — Launch EC2 Instance

1. Open the [EC2 Console](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Configure:
   - **Name**: `two-tier-blog-app` (or your choice)
   - **AMI**: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type
   - **Instance type**: `t2.micro` (free tier eligible)
   - **Key pair**: Select an existing key pair or create a new one (save the `.pem`)
   - **Network settings**: Create or select a security group with these inbound rules:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | My IP (or 0.0.0.0/0 for testing) |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 (FastAPI) |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 (React, if serving directly) |
| Custom TCP | TCP | 5050 | My IP (PgAdmin — restrict this) |

4. **Storage**: 8 GB gp2 (default is fine)
5. Click **Launch Instance**

---

## Step 2 — SSH Into the Instance

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Replace `<EC2_PUBLIC_IP>` with the IPv4 address shown in the EC2 console.

---

## Step 3 — Install Docker

```bash
# Update package index
sudo apt-get update

# Install required packages
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Allow current user to run Docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
docker compose version
```

---

## Step 4 — Install Git and Clone the Repository

```bash
sudo apt-get install -y git

git clone https://github.com/<your-username>/aws-two-tier-project.git
cd aws-two-tier-project
```

---

## Step 5 — Configure the Backend Environment

```bash
cd backend/backend
cp .env.example .env
nano .env
```

Set the following values in `.env`:

```env
POSTGRES_DB=blogdb
POSTGRES_USER=<your_db_user>
POSTGRES_PASSWORD=<strong_password>
POSTGRES_SERVER=db          # IMPORTANT: use service name, not localhost
POSTGRES_PORT=5432
SECRET_KEY=<long_random_string>
PGADMIN_DEFAULT_EMAIL=<your_email>
PGADMIN_DEFAULT_PASSWORD=<pgadmin_password>
```

> **Critical**: `POSTGRES_SERVER` must be `db` (the Docker Compose service name),
> not `localhost`. Using `localhost` inside the container causes a connection
> refused error (see [BUGS.md](BUGS.md#bug-2)).

---

## Step 6 — Start the Backend Stack

```bash
# From backend/backend/
docker compose up --build -d
```

This starts three containers:
- `web` — FastAPI on port 8000
- `db` — PostgreSQL 16
- `pgadmin` — PgAdmin 4 on port 5050

Verify they are running:
```bash
docker compose ps
docker compose logs web
```

The API should be accessible at:
```
http://<EC2_PUBLIC_IP>:8000/docs
```

---

## Step 7 — Run Database Migrations (if needed)

Tables are created automatically on startup via SQLAlchemy's
`Base.metadata.create_all()`. If you need to run Alembic migrations explicitly:

```bash
docker compose exec web alembic upgrade head
```

---

## Step 8 — Deploy the Frontend

### Option A — Run locally, point to EC2 backend

Update `frontend/src/endpoints.js`:
```js
const BASEURL = "http://<EC2_PUBLIC_IP>:8000/";
```

Then run locally:
```bash
cd frontend
nvm use 18
npm install
npm start
```

### Option B — Serve static build from EC2

```bash
# On your local machine, build the React app
cd frontend
nvm use 18
npm install
npm run build

# Copy the build folder to EC2
scp -i /path/to/your-key.pem -r build/ ubuntu@<EC2_PUBLIC_IP>:~/frontend-build/
```

On the EC2 instance, serve with nginx or a simple HTTP server:
```bash
# Install nginx
sudo apt-get install -y nginx

# Copy build to nginx root
sudo cp -r ~/frontend-build/* /var/www/html/

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 9 — Verify the Full Stack

| Check | URL |
|-------|-----|
| API docs | `http://<EC2_PUBLIC_IP>:8000/docs` |
| Blogs endpoint | `http://<EC2_PUBLIC_IP>:8000/blogs` |
| PgAdmin | `http://<EC2_PUBLIC_IP>:5050` |
| React frontend (if served) | `http://<EC2_PUBLIC_IP>:3000` or `:80` |

---

## Stopping / Restarting

```bash
# Stop all containers
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v

# Restart
docker compose up -d
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Cannot connect to port 8000 | Check EC2 security group inbound rules |
| `connection refused` on db | Ensure `POSTGRES_SERVER=db` in `.env`, not `localhost` |
| Frontend CORS error | Add EC2 public IP to `allow_origins` in `main.py` |
| PgAdmin login fails | Check `PGADMIN_DEFAULT_EMAIL/PASSWORD` in `.env` |
| Container exits immediately | Run `docker compose logs web` to see the error |

---

## Security Hardening (Before Exposing Publicly)

- [ ] Restrict SSH access to your IP only
- [ ] Restrict PgAdmin (port 5050) to your IP only
- [ ] Use a strong, randomly generated `SECRET_KEY` and `POSTGRES_PASSWORD`
- [ ] Set up HTTPS via ACM + Application Load Balancer
- [ ] Move secrets to AWS Secrets Manager
- [ ] Enable CloudWatch logging for the EC2 instance
