# Technician Dispatch & Service Tracking System

> A production-ready field service management platform built as a **DevOps Trainee portfolio project**.  
> Demonstrates CI/CD pipelines, Docker containerization, cloud deployment readiness, role-based access control, and full-stack development.

---

## DevOps Portfolio Summary

This project was designed to show **real DevOps engineering skills** in a practical context:

| Skill | Implementation |
|-------|---------------|
| **CI/CD** | GitHub Actions pipeline with typecheck → build → Docker → deploy stages |
| **Docker** | Multi-stage Dockerfile (build vs runtime separation), docker-compose for local orchestration |
| **Cloud Ready** | Environment variable configuration, stateless API design, Render/Railway deployment support |
| **Process Orientation** | Role-based access control, structured logging (pino), health check endpoint |
| **Troubleshooting** | Structured JSON logs in production, centralized error handling, request correlation IDs |
| **Infrastructure as Code** | docker-compose.yml defines the full stack: DB + API + Frontend |
| **Secret Management** | Environment variables for all credentials, no hardcoded secrets |
| **Database Migrations** | Drizzle ORM schema-as-code with push-based migration workflow |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, shadcn/ui, React Query, Wouter |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL 16 with Drizzle ORM |
| Auth | JWT-based (jsonwebtoken + bcryptjs) |
| API Contract | OpenAPI 3.1 → code generation (Orval) |
| Containerization | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Package Manager | pnpm (workspaces monorepo) |

---

## Application Features

### Role-Based Access

Three distinct user roles with isolated dashboards:

| Role | Capabilities |
|------|-------------|
| **Customer** | Register, raise service requests, track status, view assigned technician |
| **Technician** | View assigned jobs, update status (pending → in_progress → completed), add service notes |
| **Admin** | Full dashboard, assign technicians, manage all requests, view all users |

### Service Workflow

```
Customer raises request → Admin assigns technician → Technician updates status → Completed
   [PENDING]               [ASSIGNED]                  [IN_PROGRESS]           [COMPLETED]
```

### Service Types
- Installation
- Repair
- Maintenance
- AMC (Annual Maintenance Contract)
- Inspection

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/
│   │       ├── routes/      # REST API route handlers
│   │       ├── middlewares/ # JWT auth middleware
│   │       └── lib/         # Logger and utilities
│   └── dispatch-app/        # React + Vite frontend
│       └── src/
│           ├── pages/       # Admin / Technician / Customer pages
│           ├── components/  # Reusable UI components
│           └── lib/         # Auth context, utilities
├── lib/
│   ├── db/                  # Drizzle ORM schema and client
│   ├── api-spec/            # OpenAPI 3.1 specification
│   ├── api-client-react/    # Generated React Query hooks
│   └── api-zod/             # Generated Zod validation schemas
├── .github/workflows/       # GitHub Actions CI/CD
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Full stack local orchestration
└── nginx.conf               # Nginx config for frontend serving
```

---

## Local Development Setup

### Prerequisites
- Node.js 24+
- pnpm 10+ (`npm install -g pnpm`)
- PostgreSQL 16+ (or use Docker)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd technician-dispatch
pnpm install
```

### 2. Environment variables
Create a `.env` file (or export to shell):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dispatch_db
SESSION_SECRET=your-long-random-secret-here
PORT=8080
NODE_ENV=development
```

### 3. Database setup
```bash
# Push schema to database
pnpm --filter @workspace/db run push

# Seed sample data
pnpm --filter @workspace/scripts run seed
```

### 4. Start the API server
```bash
pnpm --filter @workspace/api-server run dev
```

### 5. Start the frontend
```bash
# Set required env vars
export PORT=5173
export BASE_PATH=/

pnpm --filter @workspace/dispatch-app run dev
```

Visit `http://localhost:5173`

---

## Docker Deployment

### Build and run with Docker Compose
```bash
# Start everything (DB + API + Frontend)
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

Access at `http://localhost`

### Build individual Docker images
```bash
# API server only
docker build --target production-api -t dispatch-api .

# Frontend only
docker build --target production-frontend -t dispatch-frontend .
```

---

## CI/CD Pipeline (GitHub Actions)

The pipeline in `.github/workflows/ci.yml` runs on every push/PR:

```
push to main/develop
        │
        ▼
[Typecheck] TypeScript strict typecheck across all packages
        │
   ┌────┴────┐
   ▼         ▼
[Build API] [Build Frontend]
   │         │
   └────┬────┘
        ▼
[Docker Build] Build and validate both Docker images (main branch only)
        │
        ▼
[Deploy to Render] Trigger deploy via webhook (main branch only)
```

### Setting up CI secrets
Add these GitHub repository secrets:
- `RENDER_DEPLOY_HOOK_URL` — Your Render deploy hook URL (optional)

---

## Deploy to Render (Free Tier)

### Deploy API as a Web Service
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set build command: `pnpm install && pnpm --filter @workspace/api-server run build`
4. Set start command: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
5. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `SESSION_SECRET` — a long random string
   - `NODE_ENV` — `production`
   - `PORT` — `8080`

### Deploy PostgreSQL
1. Render → New → PostgreSQL
2. Copy the Internal Database URL to your API service's `DATABASE_URL`

### Deploy Frontend as Static Site
1. Render → New → Static Site
2. Build command: `pnpm install && pnpm --filter @workspace/dispatch-app run build`
3. Publish directory: `artifacts/dispatch-app/dist/public`
4. Add environment variables:
   - `BASE_PATH` — `/`
   - `PORT` — `3000`
   - `NODE_ENV` — `production`

### Deploy to Railway
1. `railway init` in project root
2. `railway up`
3. Set environment variables via Railway dashboard

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Service Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-requests` | List (filtered by role) |
| POST | `/api/service-requests` | Create new request (customer) |
| GET | `/api/service-requests/:id` | Get single request |
| PATCH | `/api/service-requests/:id` | Update status/notes |
| POST | `/api/service-requests/:id/assign` | Assign technician (admin) |

### Users & Technicians
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (admin) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user (admin) |
| GET | `/api/technicians` | List technicians with job counts |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Summary counts |
| GET | `/api/dashboard/recent-activity` | Recent requests |
| GET | `/api/dashboard/status-breakdown` | Counts by status |

---

## Sample Login Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aquacare.com | admin123 |
| Technician | ravi@aquacare.com | tech123 |
| Technician | suresh@aquacare.com | tech123 |
| Customer | priya@example.com | customer123 |
| Customer | amit@example.com | customer123 |

---

## Database Schema

```sql
-- Users table
users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role ENUM('customer', 'technician', 'admin') NOT NULL DEFAULT 'customer',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Service requests table
service_requests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type ENUM('installation', 'repair', 'maintenance', 'amc_service', 'inspection') NOT NULL,
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  customer_id INTEGER REFERENCES users(id) NOT NULL,
  technician_id INTEGER REFERENCES users(id),
  address TEXT NOT NULL,
  technician_notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## Health Check

The API exposes a health check endpoint at `/api/healthz`.

In production, configure your load balancer or platform to poll this endpoint:
```bash
curl https://your-api-domain.com/api/healthz
# {"status":"ok"}
```

---

## Key Engineering Decisions

1. **OpenAPI-First Development** — The API contract (`lib/api-spec/openapi.yaml`) is the single source of truth. Both React Query hooks and Zod validation schemas are code-generated from it, ensuring type safety end-to-end.

2. **Monorepo with pnpm workspaces** — Shared types and database schema live in `lib/` packages, referenced by both API server and frontend without duplication.

3. **Structured Logging** — pino logger with request correlation IDs, redacted auth headers, and JSON output in production. Makes debugging in production tractable.

4. **Role-Based Middleware** — JWT auth + role checking is pure middleware, applied per-route. Easy to audit and extend.

5. **Multi-stage Docker builds** — Build tools don't ship to production. The API image contains only the compiled JS bundle.
