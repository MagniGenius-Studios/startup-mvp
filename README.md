# CodeByte

CodeByte is an AI-powered coding mentor SaaS that helps learners build real programming fluency through structured language paths, hands-on coding problems, and instant mentor-style feedback. The platform combines deterministic code evaluation with LLM-assisted hints and explanations to create a practical, guided, and progress-driven learning experience.

## 1. Project Overview

CodeByte provides a full learning loop:
- Learn by language and track
- Solve problems in an in-browser Monaco workspace
- Receive AI hints and code explanations
- Track progress, streaks, and mastery over time

This repository is a monorepo with:
- `frontend`: Next.js 14 + React app (App Router)
- `backend`: Express + TypeScript API with Prisma/PostgreSQL

## 2. Features

- JWT authentication with HTTP-only cookies (`register`, `login`, `session`, `logout`)
- Multi-language learning support: Python, C++, Java, JavaScript, Go
- Language-based track and problem catalog
- Browser-based coding workspace powered by Monaco Editor
- AI-powered hint generation from user code and reference solution
- AI-powered step-by-step code explanations with complexity output
- Submission history and latest-attempt persistence
- Dynamic dashboard with progress stats, streaks, weak concepts, and recommendations

## 3. Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Axios, Monaco Editor |
| Backend | Node.js, Express.js, TypeScript, Zod |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT, HTTP-only cookies, auth middleware |
| AI Integration | Groq-compatible LLM calls (via OpenAI-compatible client), deterministic fallback heuristics |
| Tooling | ESLint, Prettier, tsx, tsc, Prisma CLI |

## 4. Architecture Overview

### Frontend responsibilities
- App Router pages for landing, auth, dashboard, learn flow, and workspace
- Global auth context with session restore via `/api/auth/me`
- Workspace state management for editor content, submissions, and explanation panels
- API client abstraction with `withCredentials: true` and centralized error handling

### Backend responsibilities
- Route modules mounted under `/api` (`auth`, `languages`, `tracks`, `problems`, `submissions`, `hint`, `explain`, `dashboard`, `progress`, `concepts`)
- Auth guard for protected endpoints using cookie or Bearer token JWT
- Service layer for problem catalog, submission evaluation, progress updates, dashboard aggregation, and concept recommendations
- Prisma persistence against PostgreSQL
- AI feedback/explanation integration with structured fallback behavior

### Request flow summary

```text
Next.js Client -> Express API -> Prisma/PostgreSQL -> AI Provider (Groq or compatible)
```

## 5. Folder Structure

```text
startup-mvp/
├── backend/   # Express API, Prisma schema/migrations, services, controllers
└── frontend/  # Next.js application, UI components, workspace and dashboard views
```

## 6. Database Design (High Level)

Core entities and relationships:
- `User`: learner/admin identity, auth profile, progress ownership
- `Language`: canonical language catalog (`python`, `cpp`, `java`, `javascript`, `go`)
- `Track`: structured learning path within a language
- `Problem`: coding challenge linked to a track, with language-specific starter/solution code
- `Submission`: per-attempt record (code, language, correctness, score, status)
- `ProblemProgress`: per-user per-problem status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)
- `Concept`: skill tags associated with problems
- `ConceptMastery`: per-user proficiency score by concept
- `AiFeedback`: structured mentor output (`mistake`, `concept`, `improvement`) linked to submissions

High-level relationships:
- One `Language` has many `Track`s
- One `Track` has many `Problem`s
- One `User` has many `Submission`s and `ProblemProgress` records
- `Problem` and `Concept` are many-to-many via `ProblemConcept`
- One `Submission` can have many `AiFeedback` entries over time

## 7. API Overview

Base URL (local): `http://localhost:4000/api`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | API liveliness check (`?checkDb=true` optional) |
| POST | `/auth/register` | No | Create user account and issue session token |
| POST | `/auth/login` | No | Authenticate user and issue session token |
| GET | `/auth/me` | Yes | Get current authenticated user |
| POST | `/auth/logout` | No | Clear auth cookie |
| GET | `/languages` | No | List supported learning languages |
| GET | `/tracks/:languageSlug` | No | List tracks for a language |
| GET | `/problems/:trackId` | No | List problems by track |
| GET | `/problems/detail/:id` | No | Get detailed problem payload |
| POST | `/submissions` | Yes | Submit code, evaluate, store feedback/progress |
| GET | `/submissions/:problemId` | Yes | Get latest completed submission for a problem |
| GET | `/submissions/history/:problemId` | Yes | Get recent submission history |
| POST | `/hint` | Yes | Generate AI hint for current code |
| POST | `/explain` | Yes | Generate step-by-step code explanation |
| GET | `/dashboard` | Yes | Aggregated dashboard data |
| GET | `/progress/problems` | Yes | Get user problem progress map |
| GET | `/concepts/mastery` | Yes | Get concept mastery scores |
| GET | `/concepts/recommendations` | Yes | Get recommended next problems |

### Example API requests

Register:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "strongpassword123"
  }'
```

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ada@example.com",
    "password": "strongpassword123"
  }'
```

Submit code:

```bash
curl -X POST http://localhost:4000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "problemId": "00000000-0000-0000-0000-000000000000",
    "code": "print(\"Hello World\")",
    "language": "python"
  }'
```

Explain code:

```bash
curl -X POST http://localhost:4000/api/explain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "problemId": "00000000-0000-0000-0000-000000000000",
    "code": "n = 8\nprint(\"Even\" if n % 2 == 0 else \"Odd\")",
    "language": "python"
  }'
```

## 8. How It Works

1. User lands on the marketing page and creates an account or logs in.
2. User opens `Learn`, selects a language, then chooses a track.
3. User opens a problem in the workspace and writes code in Monaco Editor.
4. User submits code to receive correctness checks plus AI mentor feedback.
5. User optionally requests "Explain My Code" for step-by-step guidance.
6. Submission and progress data are persisted.
7. Dashboard updates with mastery stats, streaks, weak concepts, and recommended next problems.

## 9. Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

### Step 1: Clone and enter project

```bash
git clone <your-repo-url>
cd startup-mvp
```

### Step 2: Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Step 3: Setup and run backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
npm run dev
```

Backend runs on `http://localhost:4000` by default.

### Step 4: Setup and run frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` by default.

### Production build

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm start
```

## 10. Future Improvements / Roadmap

- Add robust sandboxed code execution per language
- Expand test coverage (unit + integration + e2e)
- Add role-based admin tooling for content authoring
- Introduce real-time collaboration in workspace
- Add richer analytics for learner performance trends
- Add OAuth/social sign-in flows and email verification
