# CodeByte Platform Scaffold

A production-ready foundation for the CodeByte AI-powered coding mentor. The repo separates frontend and backend concerns, adds strict typing, environment safety, Prisma data models, and minimal pages/routes to expand into a full SaaS.

## Monorepo layout
```
.
├─ frontend/          # Next.js (App Router) + Tailwind
└─ backend/           # Express + Prisma + PostgreSQL
```

## Environment variables
- Copy examples and fill in real values before running.
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Backend `.env` keys: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`, `JSON_BODY_LIMIT`, `HTTP_LOG_FORMAT`, `AUTH_COOKIE_MAX_AGE_MS`, `OAUTH_GOOGLE_CLIENT_ID`, `OAUTH_GOOGLE_CLIENT_SECRET`, `EMAIL_PROVIDER_API_KEY`.
Frontend `.env.local` keys: `NEXT_PUBLIC_API_URL`.

## Backend (Express + Prisma)
```bash
cd backend
npm install
npm run prisma:generate          # install Prisma client
npm run prisma:migrate -- --name init  # create initial migration against DATABASE_URL
npm run dev                      # start API with hot reload on :4000 (default)
```

Key files:
- `src/server.ts` – bootstraps Express, DB connection, graceful shutdown.
- `src/app.ts` – middleware (Helmet, CORS, JSON, logging) and route mounting under `/api`.
- `src/routes/health.routes.ts` – `GET /api/health?checkDb=true`.
- `src/routes/auth.routes.ts` – placeholder login endpoint with Zod validation.
- `src/config/db.ts` – Prisma client singleton with connection helpers.
- `prisma/schema.prisma` – PostgreSQL models & enums (users, organizations, tracks, modules, lessons, problems, submissions, feedback, enrollments, progress, mastery, reflections, events, prompt templates, concepts + relations).

## Frontend (Next.js App Router)
```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```
Pages & structure:
- `app/page.tsx` – landing placeholder
- `app/login/page.tsx` – login form calling `/auth/login`
- `app/dashboard/page.tsx` – dashboard placeholder
- `components/layout/PageShell.tsx` – shared layout container
- `lib/api.ts` – axios wrapper using `NEXT_PUBLIC_API_URL`
- Tailwind configured via `tailwind.config.ts` + `styles/globals.css`

## Production build
- Backend: `npm run build && npm start` (after generating Prisma client and running migrations)
- Frontend: `npm run build && npm start`

## Notes
- TypeScript and ESLint/Prettier configured in both apps.
- Prisma enums include submission statuses (DRAFT, SUBMITTED, ANALYZING, COMPLETED, ERROR) and feedback tiers (L1–L4).
- Relations use UUID primary keys, timestamps, unique indexes, and cascading deletes where appropriate.
