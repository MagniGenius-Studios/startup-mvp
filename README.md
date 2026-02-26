# Code Feedback Platform (MVP) - AI-Guided Logic Learning

An EdTech coding platform that helps beginners build **core programming logic** by giving **human-friendly feedback** on their code without relying on traditional compiler error dumps or DSA-only practice.

## Quick Start (Under 5 Minutes)

### 1) Prerequisites
- Node.js 20+
- PostgreSQL running locally

### 2) Install pnpm and dependencies
```bash
corepack enable
corepack prepare pnpm@9 --activate
pnpm install
```

### 3) Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 4) Run database migration and seed
```bash
pnpm --filter backend prisma:migrate
pnpm --filter backend prisma:seed
```

### 5) Start both apps
```bash
pnpm dev
```

### 6) Verify
- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health
- Backend health with DB check: http://localhost:4000/health?checkDb=true

## Monorepo Layout

```text
.
├── backend/
│   ├── prisma/
│   └── src/
├── frontend/
│   └── src/app/
└── package.json
```

## Backend Notes
- API framework: Fastify
- Validation: Zod
- ORM: Prisma
- DB health check endpoint: `GET /health?checkDb=true`

## Prisma MVP Schema
Current MVP models:
- `users`
- `problems`
- `submissions`
- `ai_feedback`
- `concept_mastery`
- `reflections`
- `events`

> TODO: extend schema with `organizations`, `tracks`, `modules`, and `lessons`.

## Common Scripts

### Root
- `pnpm dev`: Run frontend + backend concurrently
- `pnpm build`: Build all packages
- `pnpm start`: Start all packages with start scripts
- `pnpm lint`: Lint all packages and root config

### Backend
- `pnpm --filter backend dev`
- `pnpm --filter backend build`
- `pnpm --filter backend prisma:generate`
- `pnpm --filter backend prisma:migrate`
- `pnpm --filter backend prisma:seed`

### Frontend
- `pnpm --filter frontend dev`
- `pnpm --filter frontend build`

## Troubleshooting
- **`pnpm: command not found`**: run `corepack enable` and `corepack prepare pnpm@9 --activate`.
- **Database connection errors**: verify `DATABASE_URL` in `backend/.env` and ensure local Postgres is running.
- **Migration permission errors**: ensure the database user in `DATABASE_URL` has schema create/alter privileges.

## Product Vision (Context)

The platform aims to improve beginner coding outcomes with a feedback loop:
1. Student writes code
2. AI gives beginner-friendly feedback
3. Improvement patterns are tracked (with consent)
4. Feedback quality improves over time

This repository currently scaffolds the monorepo foundation only.
