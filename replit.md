# Technician Dispatch & Service Tracking System

## Overview

A full-stack field service management platform for water purifier service companies. DevOps portfolio project demonstrating CI/CD, Docker, JWT auth, role-based access, and production-ready architecture.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + docker-compose

## Artifacts

- `artifacts/api-server` — Express REST API, served at `/api`
- `artifacts/dispatch-app` — React + Vite frontend, served at `/`

## Roles

- **Admin**: admin@aquacare.com / admin123
- **Technician**: ravi@aquacare.com / tech123
- **Customer**: priya@example.com / customer123

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/dispatch-app run dev` — run frontend locally

## Database Schema

- `users` — customers, technicians, admins with bcrypt passwords
- `service_requests` — service jobs with status workflow (pending → assigned → in_progress → completed)

## Extra Files

- `Dockerfile` — Multi-stage Docker build (API + Frontend targets)
- `docker-compose.yml` — Full stack orchestration (DB + API + Frontend)
- `nginx.conf` — Nginx config for frontend static serving
- `.github/workflows/ci.yml` — GitHub Actions CI/CD pipeline
- `README.md` — Full setup guide with DevOps portfolio summary
