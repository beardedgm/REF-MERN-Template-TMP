# MERN SaaS Template

Clone-and-go starting point for MERN stack SaaS projects.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/beardedgm/REF-MERN-Template-TMP.git my-project
cd my-project
npm install
cd client && npm install && cd ..

# 2. Set up environment
cp .env.example .env
# Edit .env — at minimum set MONGODB_URI and SESSION_SECRET

# 3. Run
npm run dev          # API on port 5000
cd client && npm run dev  # Client on port 5173
```

## What's Included

- **Backend:** Express 5, Mongoose, session auth, Zod validation, rate limiting, Helmet
- **Frontend:** React 19, Vite, React Router, TanStack Query, Zustand, Tailwind CSS
- **Auth:** Register/login/logout with crypto.scrypt password hashing
- **Shared:** Zod schemas used by both frontend and backend
- **Ready to activate:** Stripe, Resend, Cloudflare Turnstile, Sentry (stubs + env vars in place)

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Random string for session signing |
| `CLIENT_URL` | Yes | Frontend URL (default: `http://localhost:5173`) |
| `PORT` | No | API port (default: `5000`) |

See `.env.example` for the full list including Stripe, Resend, and monitoring variables.

## Project Structure

See `CLAUDE.md` for full architecture documentation.
