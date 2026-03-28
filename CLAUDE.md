# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MERN SaaS application with separate frontend and backend. The API and client are independent — they run on different ports and deploy separately.

## Commands

### Backend (root)
- `npm run dev` — Start API with nodemon, port 5000
- `npm start` — Start production API

### Frontend (client/)
- `cd client && npm run dev` — Start Vite dev server, port 5173
- `cd client && npm run build` — Production build to `client/dist/`
- `cd client && npm run preview` — Preview production build locally

## Architecture

- `server.js` — Express API entry point, middleware setup, route mounting
- `client/` — Vite + React frontend (separate package.json, separate deploy)
- `.env` — Backend environment config. Not committed.

## Stack

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express 5
- **Database:** MongoDB Atlas via Mongoose
- **Auth:** Session-based with express-session + connect-mongo (HTTP-only cookies, not JWT)
- **Password hashing:** Node built-in `crypto.scrypt` (not bcrypt)
- **Validation:** Zod (shared schemas between frontend and backend)
- **Security:** Helmet.js (headers), Cloudflare Turnstile (bot protection)
- **Rate limiting:** MongoDB sliding window with TTL indexes
- **Payments:** Stripe Checkout + webhooks + Customer Portal
- **Email:** Resend API with HTML template literals

### Frontend
- **Framework:** React (Vite)
- **Routing:** React Router
- **Server state:** TanStack Query
- **Client state:** Zustand
- **Validation:** Zod (same schemas as backend)

### Infrastructure
- **Hosting:** Render.com (frontend and backend deployed separately)
- **Monitoring:** Sentry (errors), PostHog (analytics)
- **CI/CD:** Tests must pass before merge

## Deployment

- **Repository:** GitHub
- **API start command:** `npm start`
- **Client build command:** `cd client && npm run build` (serve `client/dist/`)
- Set environment variables in Render dashboard

## Conventions

- Frontend and backend are fully decoupled — no serving React from Express
- API routes return JSON
- CORS is enabled globally on the API
- Environment variables via `dotenv` — access with `process.env.VAR_NAME`
- Session-based auth only — never use JWT for browser sessions
- Use `crypto.scrypt` for password hashing — no external hashing libraries
- Zod schemas are the single source of truth for validation on both sides
- Stripe webhooks must be idempotent
- Resend for transactional email — no SendGrid/Mailgun
- Cloudflare Turnstile for bot protection — no reCAPTCHA
