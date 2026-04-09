# Technician Dispatch & Service Tracking System

A real-world field service management platform for a water purifier company — built as a **DevOps Trainee portfolio project**.

It demonstrates CI/CD, Docker, deployment readiness, JWT authentication, and role-based access control using a clean production-style stack.

---

## DevOps Portfolio Highlights

| Area | What This Project Shows |
|------|------------------------|
| **CI/CD** | GitHub Actions: install → build → Docker image → deploy |
| **Docker** | Multi-stage Dockerfile, docker-compose for full stack |
| **Cloud Deploy** | Render / Railway deployment steps with env var config |
| **Monitoring** | `/api/health` endpoint, structured request logging |
| **Security** | JWT auth, bcrypt passwords, role-based access control |
| **Process** | OpenAPI contract, code generation, monorepo structure |

---

## Project Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│           React + Vite + TailwindCSS             │
│         (Customer / Technician / Admin)          │
└──────────────────────┬──────────────────────────┘
                       │  HTTPS / REST API calls
┌──────────────────────▼──────────────────────────┐
│              Node.js + Express API               │
│   JWT Auth  │  Role Middleware  │  REST Routes   │
│   /api/auth │  /api/service-requests  │  /api/dashboard │
└──────────────────────┬──────────────────────────┘
                       │  SQL (Drizzle ORM)
┌──────────────────────▼──────────────────────────┐
│              PostgreSQL Database                 │
│         users  │  service_requests               │
└─────────────────────────────────────────────────┘
```

**Three user roles** with separate dashboards:
- **Customer** — raises service requests, tracks status
- **Technician** — views assigned jobs, updates status + notes
- **Admin** — assigns technicians, manages all requests and users

---

## CI/CD Flow (GitHub Actions)

```
git push to main
       │
       ▼
┌─────────────────────────────┐
│  1. Install dependencies    │  pnpm install --frozen-lockfile
│  2. Build API server        │  pnpm --filter api-server run build
│  3. Build frontend          │  pnpm --filter dispatch-app run build
│  4. Build Docker images     │  docker build (API + Frontend)
└──────────────┬──────────────┘
               │  (main branch only)
               ▼
┌──────────────────────────────┐
│  5. Deploy to Render         │  curl RENDER_DEPLOY_HOOK_URL
└──────────────────────────────┘
```

Workflow file: `.github/workflows/ci.yml`

To enable auto-deploy, add your **Render deploy hook URL** as a GitHub repository secret:  
`Settings → Secrets → RENDER_DEPLOY_HOOK_URL`

---

## How Docker Is Used

The project uses a **multi-stage Dockerfile** — build tools stay out of the production image, keeping it small and secure.

```
Dockerfile stages:
  base         → Node.js + pnpm setup
  deps         → Install all dependencies
  builder-api  → Compile TypeScript API to JS bundle
  builder-frontend → Vite build (static HTML/CSS/JS)
  production-api     → Lean runtime image (no devDeps)
  production-frontend → Nginx serving static files
```

The `docker-compose.yml` wires everything together locally:

```
db        → PostgreSQL 16 (persistent volume)
api       → Express API server (connects to db)
frontend  → Nginx serving React app + proxies /api → api
```

---

## Run Locally with Docker Compose

```bash
# Clone the repo
git clone <your-repo-url>
cd technician-dispatch

# Start everything — DB, API, and Frontend
docker-compose up --build

# Open the app
open http://localhost
```

That's it. No separate setup needed — Docker Compose handles the database, API server, and frontend automatically.

To stop:
```bash
docker-compose down
```

To reset the database:
```bash
docker-compose down -v   # removes the volume too
```

---

## Run Locally Without Docker

### Prerequisites
- Node.js 24+
- pnpm (`npm install -g pnpm`)
- PostgreSQL running locally

### Steps

```bash
# Install dependencies
pnpm install

# Set environment variables
export DATABASE_URL=postgresql://user:password@localhost:5432/dispatch_db
export SESSION_SECRET=any-long-random-string
export NODE_ENV=development

# Push DB schema
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (new terminal, port 5173)
export PORT=5173 BASE_PATH=/
pnpm --filter @workspace/dispatch-app run dev
```

Visit `http://localhost:5173`

---

## Deploy to Render (Free Tier)

### Step 1 — PostgreSQL
1. Render → New → PostgreSQL
2. Copy the **Internal Database URL**

### Step 2 — API (Web Service)
1. Render → New → Web Service → connect GitHub repo
2. Build command:
   ```
   pnpm install && pnpm --filter @workspace/api-server run build
   ```
3. Start command:
   ```
   node --enable-source-maps artifacts/api-server/dist/index.mjs
   ```
4. Environment variables:
   ```
   DATABASE_URL  = <paste Internal Database URL from Step 1>
   SESSION_SECRET = <any long random string>
   NODE_ENV      = production
   PORT          = 8080
   ```

### Step 3 — Frontend (Static Site)
1. Render → New → Static Site → connect GitHub repo
2. Build command:
   ```
   pnpm install && pnpm --filter @workspace/dispatch-app run build
   ```
3. Publish directory: `artifacts/dispatch-app/dist/public`
4. Environment variables:
   ```
   NODE_ENV = production
   BASE_PATH = /
   PORT = 3000
   ```

### Step 4 — Enable Auto-Deploy
Copy the Render deploy hook URL → add as GitHub secret `RENDER_DEPLOY_HOOK_URL` → every push to `main` auto-deploys.

---

## Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set env vars in the Railway dashboard. Railway auto-detects the Dockerfile.

---

## Health Check

The API exposes a health check endpoint:

```bash
GET /api/health

# Response:
{ "status": "ok", "timestamp": "2026-04-09T12:00:00.000Z" }
```

Use this endpoint with:
- **Docker** — `HEALTHCHECK` in Dockerfile
- **Render** — Health check path setting
- **Uptime monitors** — UptimeRobot, BetterStack, etc.

---

## Logging

The API uses **structured request logging** (pino):

```
Development (human-readable):
  POST /api/auth/login → 200 (12ms)
  GET  /api/service-requests → 200 (8ms)

Production (JSON, machine-readable):
  {"level":30,"method":"GET","url":"/api/health","statusCode":200,"responseTime":3}
```

In production, logs are JSON so they can be ingested by tools like Datadog, CloudWatch, or Grafana Loki.

---

## API Endpoints

### Auth
```
POST /api/auth/register   Register new user
POST /api/auth/login      Login → returns JWT
GET  /api/auth/me         Get current user (requires token)
```

### Service Requests
```
GET    /api/service-requests        List (filtered by role)
POST   /api/service-requests        Create request (customer only)
GET    /api/service-requests/:id    Get details
PATCH  /api/service-requests/:id    Update status/notes
POST   /api/service-requests/:id/assign  Assign technician (admin)
```

### Users & Technicians
```
GET   /api/users           All users (admin only)
GET   /api/technicians     Technicians with job counts
PATCH /api/users/:id       Update user (admin only)
```

### Dashboard
```
GET /api/dashboard/summary           Counts summary
GET /api/dashboard/recent-activity   Last 10 updates
GET /api/dashboard/status-breakdown  Count by status
```

---

## Sample Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aquacare.com | admin123 |
| Technician | ravi@aquacare.com | tech123 |
| Technician | suresh@aquacare.com | tech123 |
| Customer | priya@example.com | customer123 |
| Customer | amit@example.com | customer123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, shadcn/ui |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL 16, Drizzle ORM |
| Auth | JWT + bcrypt |
| Logging | pino (JSON in prod, pretty in dev) |
| CI/CD | GitHub Actions |
| Containers | Docker + docker-compose + Nginx |
| Package mgr | pnpm workspaces (monorepo) |
