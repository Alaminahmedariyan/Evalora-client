<div align="center">

# Evalora

**A full-featured developer assessment platform** — build coding assessments, invite candidates, and review results, ranks and proctoring signals in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=fff)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

🚀 **Live demo (frontend):** [https://evalora-client.vercel.app](https://evalora-client.vercel.app)

⚙️ **API (backend):** [https://evalora-server.vercel.app](https://evalora-server.vercel.app)

</div>

---

## Demo accounts

Password for all demo accounts: `Demo@12345`

| Role | Email | What you'll see |
|---|---|---|
| Recruiter | `recruiter@demo.com` | Assessment builder, leaderboard, proctoring timeline, grading queue |
| Candidate (finished attempt) | `candidate1@demo.com` | Completed result with score, rank and status |
| Candidate (pending invitation) | `candidate2@demo.com` | Accept an invitation and take the assessment |

**Try it:** log in as the recruiter to explore assessments, the leaderboard, proctoring timeline and grading queue. Then log in as `candidate2@demo.com`, accept the invitation and take the assessment.

## Features

### Assessments
- Problem bank with **MCQ, coding and written** questions
- Assessments with marks, time limits, attempts, versions and optional start/end windows
- Timed attempts with autosave, optional question shuffling and forward-only review
- Email invitations; candidates accept and start from their dashboard

### Grading & results
- MCQs graded **automatically**; coding and written answers graded by reviewers through a grading queue
- Results, ranks and a live leaderboard with one-click rank computation
- Proctoring signals: tab switches, window focus, full-screen exits, copy and paste — recorded for a human reviewer

### Platform
- Plans (Free, Pro, Enterprise) with usage limits; Stripe checkout (one-time payment, 30 days)
- Two-factor authentication, email OTP verification, Google and GitHub sign-in
- Candidate controls: profile visibility to recruiters, data export, account deletion
- Admin tools: users, companies, payments, audit logs, blog, contact messages
- Public site: home, pricing, blog (Markdown, RSS, sitemap), contact, legal pages

## Tech stack

**Frontend:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · TanStack Query & Form · Better Auth · Zod · shadcn/ui · deployed on Vercel

**Backend (separate repo):** Express 5 · Prisma 7 · PostgreSQL · Redis (rate limiting) · Stripe · Cloudinary

## Architecture notes

- **Two projects:** this frontend and an Express API ([evalora-server.vercel.app](https://evalora-server.vercel.app)). The frontend proxies `/api/auth/*` and `/api/v1/*` to the API (Next.js rewrites), so the session cookie is first-party.
- **Multi-tenant:** every recruiter query is scoped to the company; other companies' data returns 404.
- **Idempotency keys** protect invitations, attempt start/submit and checkout from duplicate requests.
- **Coding answers are never executed** — reviewers read the code next to the sample test cases.

## Project structure

```
src/
├── app/                  # App Router routes
│   ├── (public)/         # Marketing site + auth flows
│   ├── (dashboard)/      # Role-scoped workspaces (recruiter / candidate / admin)
│   ├── exam/             # Timed attempt runner
│   └── billing/          # Stripe return URLs
├── components/
│   ├── module/           # Feature modules (assessment, attempt, result, …)
│   ├── dashboard/        # Sidebar, navbar, shell
│   └── ui/               # shadcn/ui primitives
├── hooks/                # TanStack Query hooks per domain
├── lib/                  # API client, toast, utils
└── types/                # Zod schemas + inferred types
```

## Run locally

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start the dev server
pnpm dev
```

### Environment variables

**Frontend**

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` |
| `NEXT_PUBLIC_AUTH_BASE_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `BACKEND_URL` | `http://localhost:5000` |
| `INTERNAL_API_SECRET` | `<random string>` |

**Backend (separate repo)** — set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, `CLIENT_URL=http://localhost:3000`, plus Stripe, Cloudinary, SMTP and Redis variables, then:

```bash
pnpm migrate
pnpm seed
pnpm dev
```

## Known limitations

- Paid plans are **one-time payments for 30 days**; there is no automatic renewal.
- Emails are sent through SMTP, so volume is limited.
- Uploads are limited to **4 MB** (serverless request limit).

---

<div align="center">Built with Next.js & React · <a href="https://evalora-client.vercel.app">evalora-client.vercel.app</a></div>
