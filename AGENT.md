# AGENT.md

This file provides context for AI coding assistants (Cursor, GitHub Copilot, Windsurf, Cline, OpenAI Codex, or any agentic tool) working with this repository. If you're using Claude Code, see `CLAUDE.md` for Claude-specific configuration.

## Project Overview

MERN SaaS template with separate frontend and backend. Clone this repo, receive a PRD, and start building. Auth, validation, rate limiting, file uploads, and project structure are already wired.

## Dev Servers

- **API server:** `npm run dev` (port 5000, nodemon auto-reload)
- **Client server:** `cd client && npm run dev` (port 5173, Vite HMR)

The Vite dev server proxies `/api` requests to `localhost:5000`, so the frontend can call `/api/auth/login` without specifying the full URL.

## Commands

### Backend (root)
- `npm run dev` — Start API with nodemon, port 5000
- `npm start` — Start production API

### Frontend (client/)
- `cd client && npm run dev` — Start Vite dev server, port 5173
- `cd client && npm run build` — Production build to `client/dist/`
- `cd client && npm run lint` — ESLint check
- `cd client && npm run preview` — Preview production build locally

## Project Structure

```
server.js              — Express entry point (middleware ordering matters here)
render.yaml            — Render.com blueprint (defines both services for deploy)
config/
  db.js                — Mongoose connection with event listeners
  session.js           — express-session + connect-mongo config
  storage.js           — Storage provider dispatcher (GCS or R2 via STORAGE_PROVIDER env)
  storage-gcs.js       — Google Cloud Storage provider
  storage-r2.js        — Cloudflare R2 provider (S3-compatible)
models/
  User.js              — email, password (select:false), stripeCustomerId, plan, profilePicture
  RateLimit.js         — MongoDB rate limiting with TTL index
middleware/
  auth.js              — requireAuth (session check, attaches req.user)
  validate.js          — validate(zodSchema) factory
  rateLimit.js         — MongoDB sliding window rate limiter
  upload.js            — upload(opts) multer factory for file uploads
routes/
  auth.js              — register, login, logout, me, profile-picture
  stripe.js            — webhook + commented checkout/portal stubs
  upload.js            — general-purpose file upload endpoint
  index.js             — mounts auth + stripe + upload under /api
utils/
  password.js          — hashPassword/verifyPassword using crypto.scrypt
  AppError.js          — operational error class with statusCode
shared/
  schemas/
    auth.js            — registerSchema, loginSchema (Zod)
    user.js            — userResponseSchema (Zod)
client/
  src/
    components/
      Layout.jsx       — nav bar + Outlet
      ProtectedRoute.jsx — redirects to /login if not authed
    pages/
      Home.jsx         — landing page
      Login.jsx        — login form with Zod validation
      Register.jsx     — register form with Zod validation
      Dashboard.jsx    — protected page with profile picture upload
      NotFound.jsx     — 404
    hooks/
      useAuth.js       — GET /api/auth/me query
      useLogin.js      — login mutation
      useRegister.js   — register mutation
      useLogout.js     — logout mutation
    lib/
      api.js           — fetch wrapper (credentials: 'include', file upload support)
      queryClient.js   — TanStack Query client config
    store/
      authStore.js     — Zustand user store
    App.jsx            — BrowserRouter + route tree
    main.jsx           — QueryClientProvider wrapping App
```

## Stack

### Backend
- **Runtime:** Node.js (CommonJS — use `require`/`module.exports`, not `import`/`export`)
- **Framework:** Express 5
- **Database:** MongoDB Atlas via Mongoose
- **Auth:** Session-based with express-session + connect-mongo (HTTP-only cookies, NOT JWT)
- **Password hashing:** Node built-in `crypto.scrypt` (NOT bcrypt)
- **Validation:** Zod (shared schemas in `shared/schemas/`)
- **Security:** Helmet.js (headers), Cloudflare Turnstile (bot protection, activate when needed)
- **Rate limiting:** MongoDB sliding window with TTL indexes
- **Payments:** Stripe Checkout + webhooks + Customer Portal (stubs in routes/stripe.js, uncomment when needed)
- **Email:** Resend API with HTML template literals (activate when needed)
- **File storage:** Google Cloud Storage or Cloudflare R2 (switchable via `STORAGE_PROVIDER` env var) + multer for multipart parsing
- **Monitoring:** Sentry (installed, wire when needed), PostHog (add client-side when needed)

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router
- **Styling:** Tailwind CSS (via Vite plugin) + custom CSS as needed
- **Server state:** TanStack Query (queries for GET, mutations for POST/PUT/DELETE)
- **Client state:** Zustand (synced from TanStack Query, used for synchronous reads in UI)
- **Validation:** Zod (same schemas as backend via `shared/` alias)
- **Path aliases:** `@` → `src/`, `shared` → `../shared/` (configured in vite.config.js)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account (rate limited: 5/15min) |
| POST | `/api/auth/login` | No | Login (rate limited: 10/15min) |
| POST | `/api/auth/logout` | No | Destroy session |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile-picture` | Yes | Upload profile picture (max 2MB, images only) |
| POST | `/api/upload` | Yes | General file upload (max 5MB, images + PDF) |
| POST | `/api/stripe/webhook` | No | Stripe webhook receiver (raw body) |

## Key Architecture Decisions

### Auth Flow
1. User submits credentials → POST `/api/auth/login`
2. Server verifies password with `crypto.scrypt`, regenerates session (prevents fixation)
3. Session ID stored in HTTP-only cookie (`connect.sid`)
4. Frontend calls GET `/api/auth/me` on load → syncs user to Zustand store
5. `ProtectedRoute` checks `useAuth()` → redirects to `/login` if not authenticated
6. Logout destroys server session + clears cookie + clears Zustand + invalidates query

### Middleware Pipeline Order (server.js)
The order in server.js is critical — do not rearrange:
1. `helmet()` — security headers first
2. `cors()` — with credentials + explicit origin
3. `express.raw()` for `/api/stripe/webhook` — Stripe needs raw bytes for signature verification
4. `express.json()` — AFTER the raw body route, otherwise Stripe webhooks break
5. `session()` — after body parsing
6. Routes — after all middleware
7. Global error handler — catches `AppError` (operational) vs unexpected errors

### Shared Zod Schemas
Schemas live in `shared/schemas/` and are used by both sides:
- Backend: `const { registerSchema } = require('../shared/schemas/auth')`
- Frontend: `import { registerSchema } from 'shared/schemas/auth'` (via Vite alias)
- This ensures validation rules are identical — change once, applied everywhere

### State Management Pattern
- **TanStack Query** owns all server state (auth status, API data). It handles caching, refetching, and loading states.
- **Zustand** is a thin synchronous cache. `useAuth()` fetches from the server and syncs to Zustand. Components like the nav bar read from Zustand to avoid loading flicker.
- Never duplicate server state in Zustand manually. Let TanStack Query be the source of truth.

### API Client
`client/src/lib/api.js` is a fetch wrapper that:
- Always sends `credentials: 'include'` (required for session cookies cross-origin)
- Throws structured errors with `status` and `details` properties
- Uses `VITE_API_URL` env var in production, empty string in dev (Vite proxy handles it)
- Has an `upload()` method for file uploads via FormData

### File Storage
`config/storage.js` dispatches to either GCS or R2 based on `STORAGE_PROVIDER` env var. Routes use a provider-agnostic interface:
- `storage.upload(filename, buffer, contentType, metadata?)` → `{ url, filename }`
- `storage.remove(filename)` → deletes a file
- `storage.getPublicUrl(filename)` → returns the public URL

## How to Add New Features

### New API Route
1. Create `routes/yourFeature.js` with an Express Router
2. Mount it in `routes/index.js`: `router.use('/your-feature', yourFeatureRouter)`
3. Use `requireAuth` middleware for protected routes
4. Use `validate(schema)` middleware with a Zod schema for input validation
5. Use `rateLimit()` on sensitive endpoints

### New Mongoose Model
1. Create `models/YourModel.js` with the schema
2. Export from `models/index.js`

### New Frontend Page
1. Create `client/src/pages/YourPage.jsx`
2. Add a `<Route>` in `App.jsx` — inside `<ProtectedRoute>` if auth required
3. Add nav link in `Layout.jsx` if needed

### New File Upload Feature
1. Use the `upload()` middleware from `middleware/` — pass `{ maxSize, allowedTypes, fieldName }` to customize
2. In your route handler, use the storage interface: `const { url } = await storage.upload(filename, buffer, contentType)`
3. Use `storage.remove(filename)` to delete files, `storage.getPublicUrl(filename)` for URLs
4. On the frontend, use `api.upload(path, file, { method })` — it handles FormData automatically
5. See `routes/upload.js` for the general pattern, `routes/auth.js` profile-picture for a model-specific example
6. Set `STORAGE_PROVIDER` to `gcs` or `r2` in `.env` — routes don't need to change

### New Zod Schema
1. Add to `shared/schemas/` — both sides can import it
2. Use in backend middleware: `validate(yourSchema)`
3. Use in frontend forms: `yourSchema.safeParse(data)`

## Deployment

- **Hosting:** Render.com (frontend and backend deployed as separate services)
- **Blueprint:** `render.yaml` defines both services — Render reads this on connect
- **API start command:** `npm start`
- **Client build command:** `cd client && npm run build` (serve `client/dist/`)
- **Environment variables:** Set in Render dashboard (see `.env.example` for full list)
- `trust proxy` is already configured for Render's load balancer
- Static site has SPA rewrite rule (`/* → /index.html`) for client-side routing

## Conventions

When generating or modifying code in this project, follow these rules:

- Frontend and backend are fully decoupled — never serve React from Express
- API routes return JSON, always under `/api/`
- Session-based auth only — never use JWT for browser sessions
- Use `crypto.scrypt` for password hashing — no external hashing libraries
- Zod schemas are the single source of truth for validation
- User model has `select: false` on password — must use `.select('+password')` explicitly
- Stripe webhooks must be idempotent
- Resend for transactional email — no SendGrid/Mailgun
- Cloudflare Turnstile for bot protection — no reCAPTCHA
- `AppError` for operational errors (known, expected) — global error handler distinguishes from bugs
- File uploads go to GCS or Cloudflare R2 (set `STORAGE_PROVIDER` env var) — never store binary files in MongoDB
- Use `upload()` middleware factory for multer config — follows same pattern as `validate()` and `rateLimit()`
- Backend is CommonJS (`require`/`module.exports`) — do not use ES module syntax
- Frontend is ESM (`import`/`export`) — standard React/Vite setup
