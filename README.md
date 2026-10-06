# Evalora

Developer assessment platform: teams build coding assessments, invite candidates, and review results and proctoring signals in one place.

**Live demo:** https://evalora.vercel.app

## Demo accounts

Password for all demo accounts: `Demo@12345`

| Role | Email |
|---|---|
| Recruiter | recruiter@demo.com |
| Candidate (has a finished attempt) | candidate1@demo.com |
| Candidate (has a pending invitation) | candidate2@demo.com |

Try it: log in as the recruiter to see the assessment, leaderboard, proctoring timeline and grading queue. Log in as `candidate2@demo.com`, accept the invitation and take the assessment.

## Features

- Problem bank with MCQ, coding and written questions
- Assessments with marks, time limits, attempts, versions and optional start/end window
- Email invitations; candidates accept and start from their dashboard
- Timed attempts with autosave, optional question shuffling and forward-only review
- Proctoring signals: tab switches, window focus, full-screen exits, copy and paste (recorded for a human reviewer)
- MCQs graded automatically; coding and written answers graded by reviewers through a grading queue
- Results, ranks and leaderboard
- Plans (Free, Pro, Enterprise) with usage limits; Stripe checkout (one-time payment, 30 days)
- Two-factor authentication, email OTP verification, Google and GitHub sign-in
- Candidate controls: profile visibility to recruiters, data export, account deletion
- Admin tools: users, companies, payments, audit logs, blog, contact messages
- Public site: home, pricing, blog (Markdown, RSS, sitemap), contact, legal pages

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, TanStack Query and Form, Better Auth, Express 5, Prisma 7 with PostgreSQL, Redis (rate limiting), Stripe, Cloudinary, Zod, deployed on Vercel.

## Architecture notes

- Two projects: this frontend and an Express API. The frontend proxies `/api/auth/*` and `/api/v1/*` to the API (Next.js rewrites), so the session cookie is first-party.
- Multi-tenant: every recruiter query is scoped to the company; other companies' data returns 404.
- Idempotency keys protect invitations, attempt start/submit and checkout from duplicate requests.
- Coding answers are **not executed**; reviewers read the code next to the sample test cases.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Frontend env: `NEXT_PUBLIC_API_BASE_URL=/api/v1`, `NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:3000`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, `BACKEND_URL=http://localhost:5000`, `INTERNAL_API_SECRET=<random string>`.

Backend (separate repo): set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, `CLIENT_URL=http://localhost:3000`, Stripe, Cloudinary, SMTP and Redis variables, then `pnpm migrate`, `pnpm seed`, `pnpm dev`.

## Known limitations

- Paid plans are one-time payments for 30 days; there is no automatic renewal.
- Emails are sent through SMTP, so volume is limited.
- Uploads are limited to 4 MB (serverless request limit).