# MathLand

A math level-up learning site for primary school **grades 1–6**. Each grade is split into topics, and each topic has **5 levels of rising difficulty**. Questions rotate at random on every visit, timing follows the level's difficulty, wrong answers get an instant explanation, and every score and star is saved in the player's profile.

## Features

| Feature | Description |
| --- | --- |
| Grades and topics | 6 grades × 6 topics = **36 topics** (counting and addition within 20 in grade 1, up to fractions, percentages, ratios, circles and algebra in grade 6) |
| Rising levels | 5 levels per topic, with more questions and a faster pace as levels go up. Earn at least 1 star on a level to unlock the next one |
| Question rotation | Questions are regenerated every time you enter a level, and recently answered prompts are avoided, so you never get the same set twice |
| Learn, then practice | Every topic has a "Concepts" section and a "Smart tricks" section. A wrong answer shows the matching explanation and trick right away |
| Level timer | L1 = 8 questions × 20 sec → L5 = 16 questions × 12 sec. Grades 1–2 get 2 fewer questions and 5 extra seconds per question, and grades 5–6 get 2 fewer seconds per question. The level is submitted automatically when the clock runs out. There is also an "Untimed practice" mode |
| Result history | Each round records score, accuracy, time and stars. The history page has stat cards, topic mastery, grade and topic filters, and result deletion |
| User profiles | Several kids' profiles are supported (nickname / avatar / color / grade). Switch, edit or delete them at any time. The profile page shows progress by grade and the practice streak |

## Tech stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query, with a playful Claymorphism design (Baloo 2 font, rounded cards, soft shadows)
- **Backend**: Node.js + Express + TypeScript (zod validation) + PostgreSQL (pg)
- **Question engine**: 36 parameterized random generators in `frontend/src/curriculum/`, producing `choice`, `fill` and `judge` questions

## Run locally

Prerequisites: Node.js 20+, pnpm, PostgreSQL.

```bash
# 1. Start the database and create it
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
docker exec postgres psql -U postgres -c "CREATE DATABASE mathland;"

# 2. Backend
cd backend
pnpm install
cp .env.example .env        # adjust DATABASE_URL if needed
pnpm dev                    # http://localhost:3000 (API under /api)

# 3. Frontend (in a new terminal)
cd frontend
pnpm install
pnpm dev                    # http://localhost:5173
```

On first launch you are guided to create a profile. After that, pick a grade → read the concepts and smart tricks → play the levels.

> The database tables (`users`, `game_results`) are created automatically when the backend starts, so no manual migration is needed.

## Deploy to Vercel

The whole app runs on Vercel: the Vite frontend is served as static files, and the Express API runs as a single serverless function (`api/index.ts`) that reuses `backend/src/app.ts`. Routes under `/api/*` go to the function and every other path falls back to the single-page app (see `vercel.json`).

1. Create a hosted PostgreSQL database (for example Neon, available from the Vercel Marketplace) and copy its **pooled** connection string. It should end with `?sslmode=require`.
2. In Vercel, import the repository (or run `vercel link`) and add `DATABASE_URL` under Project Settings → Environment Variables for Production and Preview. Tables are created automatically on the first request.
3. Add three repository secrets in GitHub (Settings → Secrets and variables → Actions): `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`. The IDs are in `.vercel/project.json` after `vercel link`.

GitHub Actions then does the rest:

- `.github/workflows/ci.yml` lints, builds and tests the frontend and backend on every pull request and push to `main`.
- `.github/workflows/deploy.yml` deploys a preview for each pull request and a production deployment for every push to `main`. It skips itself with a warning while the secrets are missing.

If you prefer Vercel's own Git integration instead, delete `deploy.yml` and import the repository in Vercel.

## Project structure

```
api/            Vercel serverless entry point (wraps the Express app)
backend/src
  config/       Environment variables and the database connection pool
  modules/      profiles / results / system routes
  types/        zod validation schemas
frontend/src
  curriculum/   Concepts, smart tricks and question generators for the 36 topics
  pages/        Home, grade, study guide, level map, play, result, history and profile pages
  components/   Header, stars, avatars, MotionPrimitives
  context/      Profile state
docs/
  product/features.md   Product requirements document
```

## Main endpoints

All endpoints are `POST` with a JSON body:

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/profiles/list` `/create` `/get` `/update` `/delete` | Profile CRUD |
| POST | `/api/results/create` | Save the result of one round |
| POST | `/api/results/get` `/list` `/delete` | Result details / history / delete |
| POST | `/api/results/stats` | Profile stats: total rounds, accuracy, stars, streak days and topic progress |
| POST | `/api/results/topic-progress` `/level-progress` | Best star rating per topic / best result per level |
| GET | `/api/health/ready` | Health check (includes database connectivity) |
