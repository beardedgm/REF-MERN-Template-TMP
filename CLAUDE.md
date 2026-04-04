# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. For other AI tools, see `AGENT.md`. Keep both files in sync when making architectural changes.

## Project Overview

MERN SaaS template with separate frontend and backend. Clone this repo, receive a PRD, and start building. Auth, validation, rate limiting, and project structure are already wired.

## Starting Dev Servers

Both servers are configured in `.claude/launch.json` for preview:
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
  storage.js           — Storage provider dispatcher (MongoDB, GCS, or R2 via STORAGE_PROVIDER env)
  storage-mongodb.js   — MongoDB GridFS provider (default, no extra config)
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
  files.js             — serves files from MongoDB GridFS
  index.js             — mounts auth + stripe + upload + files under /api
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
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express 5
- **Database:** MongoDB Atlas via Mongoose
- **Auth:** Session-based with express-session + connect-mongo (HTTP-only cookies, NOT JWT)
- **Password hashing:** Node built-in `crypto.scrypt` (NOT bcrypt)
- **Validation:** Zod (shared schemas in `shared/schemas/`)
- **Security:** Helmet.js (headers), Cloudflare Turnstile (bot protection, activate when needed)
- **Rate limiting:** MongoDB sliding window with TTL indexes
- **Payments:** Stripe Checkout + webhooks + Customer Portal (stubs in routes/stripe.js, uncomment when needed)
- **Email:** Resend API with HTML template literals (activate when needed)
- **File storage:** MongoDB GridFS (default), Google Cloud Storage, or Cloudflare R2 (switchable via `STORAGE_PROVIDER` env var) + multer for multipart parsing
- **Monitoring:** Sentry (installed, wire when needed), PostHog (add client-side when needed)

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router
- **Styling:** Tailwind CSS (via Vite plugin) + custom CSS as needed
- **Icons:** Lucide React (`lucide-react`) — tree-shakeable, import individual icons
- **Server state:** TanStack Query (queries for GET, mutations for POST/PUT/DELETE)
- **Client state:** Zustand (synced from TanStack Query, used for synchronous reads in UI)
- **Validation:** Zod (same schemas as backend via `shared/` alias)
- **Path aliases:** `@` → `src/`, `shared` → `../shared/` (configured in vite.config.js)

## Key Architecture Decisions

### Auth Flow
1. User submits credentials → POST `/api/auth/login`
2. Server verifies password with `crypto.scrypt`, regenerates session (prevents fixation)
3. Session ID stored in HTTP-only cookie (`connect.sid`)
4. Frontend calls GET `/api/auth/me` on load → syncs user to Zustand store
5. `ProtectedRoute` checks `useAuth()` → redirects to `/login` if not authenticated
6. Logout destroys server session + clears cookie + clears Zustand + invalidates query

### Express 5 Gotchas
- **Wildcard routes:** Express 5 uses `path-to-regexp` v8 which requires named parameters. Use `app.get('/{*path}')` NOT `app.get('*')`. The old `*` syntax throws `Missing parameter name` errors.
- **connect-mongo v6 import:** In CommonJS, use `require('connect-mongo').default` — the store class is on `.default`, not the top-level export. Without `.default`, `MongoStore.create` is undefined.

### Middleware Pipeline Order (server.js)
The order in server.js is critical — do not rearrange:
1. `helmet()` — security headers first
2. `cors()` — with credentials + explicit origin
3. `express.raw()` for `/api/stripe/webhook` — Stripe needs raw bytes for signature verification
4. `express.json()` — AFTER the raw body route, otherwise Stripe webhooks break
5. `session()` — after body parsing
6. Routes — after all middleware
7. Static file serving + SPA catch-all (production only)
8. Global error handler — catches `AppError` (operational) vs unexpected errors

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
2. Add a lazy import in `App.jsx`: `const YourPage = lazy(() => import('./pages/YourPage'))`
3. Add a `<Route>` in `App.jsx` — inside `<ProtectedRoute>` if auth required
4. Add nav link in `Layout.jsx` if needed

All pages use `React.lazy()` + `Suspense` for code-splitting. This keeps each page in its own chunk so the initial bundle stays small and avoids Vite's 500KB chunk size warning.

### New File Upload Feature
1. Use the `upload()` middleware from `middleware/` — pass `{ maxSize, allowedTypes, fieldName }` to customize
2. In your route handler, use the storage interface: `const { url } = await storage.upload(filename, buffer, contentType)`
3. Use `storage.remove(filename)` to delete files, `storage.getPublicUrl(filename)` for URLs
4. On the frontend, use `api.upload(path, file, { method })` — it handles FormData automatically
5. See `routes/upload.js` for the general pattern, `routes/auth.js` profile-picture for a model-specific example
6. Set `STORAGE_PROVIDER` to `mongodb`, `gcs`, or `r2` in `.env` — routes don't need to change. Default is `mongodb` (works out of the box).

### New Zod Schema
1. Add to `shared/schemas/` — both sides can import it
2. Use in backend middleware: `validate(yourSchema)`
3. Use in frontend forms: `yourSchema.safeParse(data)`

## Deployment

- **Hosting:** Render.com (single web service serves both API and React frontend)
- **Blueprint:** `render.yaml` defines the service — Render reads this on connect
- **Build command:** `npm install && cd client && npm install && npm run build`
- **Start command:** `node server.js`
- **How it works:** In production (`NODE_ENV=production`), Express serves `client/dist` as static files with a catch-all route for React Router. API routes under `/api` take priority.
- **Environment variables:** Set in Render dashboard (see `.env.example` for full list). Env vars are available at both build time and runtime on Render, so `VITE_API_URL` gets baked into the Vite build.
- `trust proxy` is already configured for Render's load balancer
- **Local dev is still two servers:** `npm run dev` (API on 5000) + `cd client && npm run dev` (Vite on 5173 with proxy). The static serving block is skipped when `NODE_ENV` is not `production`.
- **Important:** Render caches the build command from initial service creation. If you update `render.yaml`, you must also update the build command in the Render dashboard manually.

## Conventions

- Frontend and backend are decoupled in dev (two servers), unified in production (Express serves both)
- API routes return JSON, always under `/api/`
- Session-based auth only — never use JWT for browser sessions
- Use `crypto.scrypt` for password hashing — no external hashing libraries
- Zod schemas are the single source of truth for validation
- User model has `select: false` on password — must use `.select('+password')` explicitly
- Stripe webhooks must be idempotent
- Resend for transactional email — no SendGrid/Mailgun
- Cloudflare Turnstile for bot protection — no reCAPTCHA
- `AppError` for operational errors (known, expected) — global error handler distinguishes from bugs
- File uploads default to MongoDB GridFS (no extra config). Use GCS or R2 for production scale (set `STORAGE_PROVIDER` env var).
- Use `upload()` middleware factory for multer config — follows same pattern as `validate()` and `rateLimit()`

## Configuration

A `.claude/settings.json` is present in this repo. It governs permissions, 
model, and hooks. Do not suggest changes to it mid-session. If a required 
tool or command is blocked, flag it and wait for instruction.
