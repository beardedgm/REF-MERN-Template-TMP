# MERN SaaS Template

A production-ready starting point for MERN stack SaaS projects. Clone it, configure your environment, and start building your product — auth, validation, file uploads, rate limiting, and project structure are already wired.

Works great on its own for any developer, and even better with AI-assisted coding tools (see [AI-Assisted Development](#ai-assisted-development)).

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

# 3. Run both servers
npm run dev                    # API on port 5000 (nodemon auto-reload)
cd client && npm run dev       # Frontend on port 5173 (Vite HMR)
```

The Vite dev server proxies `/api` requests to `localhost:5000`, so the frontend can call `/api/auth/login` without specifying the full backend URL.

## What's Included

### Backend
| Feature | Technology | Notes |
|---------|-----------|-------|
| Framework | Express 5 | CommonJS modules |
| Database | MongoDB via Mongoose | Atlas-ready |
| Auth | express-session + connect-mongo | HTTP-only cookies, session-based (not JWT) |
| Password hashing | Node built-in `crypto.scrypt` | No external hashing libraries needed |
| Validation | Zod | Shared schemas between frontend and backend |
| Security | Helmet.js | Secure headers out of the box |
| Rate limiting | MongoDB sliding window | TTL indexes for auto-cleanup |
| File storage | MongoDB GridFS, Google Cloud Storage, or Cloudflare R2 | MongoDB default (no extra config), switchable via env var |
| Payments | Stripe | Checkout, webhooks, portal stubs (uncomment when needed) |
| Email | Resend | Activate when needed |
| Bot protection | Cloudflare Turnstile | Activate when needed |
| Monitoring | Sentry + PostHog | Installed, wire when needed |

### Frontend
| Feature | Technology | Notes |
|---------|-----------|-------|
| Framework | React 19 | Vite build tool |
| Routing | React Router | Nested routes with protected wrappers |
| Styling | Tailwind CSS | Via Vite plugin |
| Icons | Lucide React | Tree-shakeable, import individual icons |
| Toasts | react-hot-toast | `toast.success()` / `toast.error()`, never `alert()` |
| Server state | TanStack Query | Queries for GET, mutations for POST/PUT/DELETE |
| Client state | Zustand | Thin synchronous cache, synced from TanStack Query |
| Validation | Zod | Same schemas as backend via import alias |
| Path aliases | `@` and `shared` | `@` = `src/`, `shared` = `../shared/` |

## Architecture Decisions

### Why session auth instead of JWT?

For browser-based SaaS apps, session cookies are more secure and simpler to manage. The server controls session lifetime, can revoke sessions instantly, and HTTP-only cookies can't be read by JavaScript (preventing XSS token theft). JWT is better for mobile apps or microservice-to-microservice auth — this template is built for browser-first SaaS.

### Why TanStack Query + Zustand?

They solve different problems. **TanStack Query** owns all server state — it handles fetching, caching, background refetching, and loading/error states. **Zustand** is a thin synchronous cache for UI reads (like showing the user's email in the nav bar without a loading spinner). TanStack Query is the source of truth; Zustand mirrors it for instant access.

### Why shared Zod schemas?

Validation schemas live in `shared/schemas/` and are imported by both the backend (via `require`) and frontend (via Vite alias). Change a validation rule once, and it applies everywhere. No more mismatched validation between client and server.

### Why crypto.scrypt instead of bcrypt?

`crypto.scrypt` is built into Node.js — no native compilation, no platform-specific binaries, no install issues. It's a memory-hard KDF recommended by OWASP, same security tier as bcrypt.

## Project Structure

```
server.js                  Express entry point (middleware ordering matters)
render.yaml                Render.com deploy blueprint (both services)
config/
  db.js                    Mongoose connection with event listeners
  session.js               express-session + connect-mongo config
  storage.js               Storage provider dispatcher (GCS or R2)
  storage-mongodb.js       MongoDB GridFS provider (default, no extra config)
  storage-gcs.js           Google Cloud Storage provider
  storage-r2.js            Cloudflare R2 provider (S3-compatible)
models/
  User.js                  email, password (select:false), stripeCustomerId, plan, profilePicture
  RateLimit.js             MongoDB rate limiting with TTL index
middleware/
  auth.js                  requireAuth (session check, attaches req.user)
  validate.js              validate(zodSchema) factory
  rateLimit.js             MongoDB sliding window rate limiter
  upload.js                upload(opts) multer factory for file uploads
routes/
  auth.js                  register, login, logout, me, profile-picture
  stripe.js                webhook + commented checkout/portal stubs
  upload.js                general-purpose file upload endpoint
  files.js                 serves files from MongoDB GridFS
  index.js                 mounts all routes under /api
utils/
  password.js              hashPassword / verifyPassword using crypto.scrypt
  AppError.js              operational error class with statusCode
shared/
  schemas/
    auth.js                registerSchema, loginSchema (Zod)
    user.js                userResponseSchema (Zod)
client/
  src/
    components/
      Layout.jsx           nav bar + Outlet
      ProtectedRoute.jsx   redirects to /login if not authed
    pages/
      Home.jsx             landing page
      Login.jsx            login form with Zod validation
      Register.jsx         register form with Zod validation
      Dashboard.jsx        protected page with profile picture upload
      NotFound.jsx         404
    hooks/
      useAuth.js           GET /api/auth/me query
      useLogin.js          login mutation
      useRegister.js       register mutation
      useLogout.js         logout mutation
    lib/
      api.js               fetch wrapper (credentials: 'include', file uploads)
      queryClient.js       TanStack Query client config
    store/
      authStore.js         Zustand user store
    App.jsx                BrowserRouter + route tree
    main.jsx               QueryClientProvider wrapping App
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account (rate limited: 5/15min). Body: `{ email, password }` (password min 8 chars) |
| POST | `/api/auth/login` | No | Login (rate limited: 10/15min). Body: `{ email, password }` |
| POST | `/api/auth/logout` | No | Destroy session |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile-picture` | Yes | Upload profile picture. Multipart form, field: `file` (max 2MB, JPEG/PNG/WebP) |
| POST | `/api/upload` | Yes | General file upload. Multipart form, field: `file` (max 5MB, JPEG/PNG/WebP/PDF) |
| GET | `/api/files/:filename` | No | Serve file from MongoDB GridFS (when using MongoDB storage) |
| POST | `/api/stripe/webhook` | No | Stripe webhook receiver (raw body) |

### Error responses

All API errors return JSON with this structure:

```json
{
  "error": "Human-readable error message",
  "details": { "fieldName": "Validation error for this field" }
}
```

- **400** — Validation failed (Zod schema errors in `details`)
- **401** — Not authenticated or invalid credentials
- **409** — Conflict (e.g. email already in use)
- **429** — Rate limited (check `Retry-After` header for seconds until retry)
- **500** — Server error (generic message, details logged server-side)

## Auth Flow

1. User submits credentials via the login form
2. Server verifies password with `crypto.scrypt`, then regenerates the session (prevents session fixation)
3. Session ID is stored in an HTTP-only cookie (`connect.sid`)
4. Frontend calls `GET /api/auth/me` on page load and syncs the user to Zustand
5. `ProtectedRoute` checks auth status — redirects to `/login` if not authenticated
6. Logout destroys the server session, clears the cookie, clears the Zustand store, and invalidates the TanStack Query cache

## How to Build on This

### Add a new API route

1. Create `routes/yourFeature.js` with an Express Router
2. Mount it in `routes/index.js`: `router.use('/your-feature', yourFeatureRouter)`
3. Use `requireAuth` middleware for protected routes
4. Use `validate(schema)` middleware with a Zod schema for input validation
5. Use `rateLimit()` on sensitive endpoints

```js
// routes/yourFeature.js
const express = require('express');
const { requireAuth, validate, rateLimit } = require('../middleware');
const { yourSchema } = require('../shared/schemas/yourFeature');

const router = express.Router();

router.post('/', requireAuth, validate(yourSchema), async (req, res, next) => {
  try {
    // req.body is already validated by Zod
    res.json({ message: 'Success' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### Add a new Mongoose model

1. Create `models/YourModel.js` with the schema
2. Export it from `models/index.js`

### Add a new frontend page

1. Create `client/src/pages/YourPage.jsx`
2. Add a lazy import in `App.jsx`: `const YourPage = lazy(() => import('./pages/YourPage'))`
3. Add a `<Route>` in `App.jsx` — wrap with `<ProtectedRoute>` if auth is required
4. Add a nav link in `Layout.jsx` if needed

All pages use `React.lazy()` + `Suspense` for code-splitting. This keeps each page in its own chunk so the initial bundle stays small and avoids Vite's 500KB chunk size warning on production builds.

### Add a new Zod schema (shared validation)

1. Add your schema to `shared/schemas/`
2. Backend: `const { yourSchema } = require('../shared/schemas/yourFeature')`
3. Frontend: `import { yourSchema } from 'shared/schemas/yourFeature'`

Both sides use the same rules — change once, applied everywhere.

### Add a file upload to a new feature

1. Use `upload()` middleware — customize with `{ maxSize, allowedTypes, fieldName }`
2. In your handler, call `storage.upload(filename, buffer, contentType)` — returns `{ url, filename }`
3. Use `storage.remove(filename)` to delete, `storage.getPublicUrl(filename)` for URLs
4. On the frontend, call `api.upload(path, file, { method })` — handles FormData automatically
5. Set `STORAGE_PROVIDER` to `mongodb`, `gcs`, or `r2` in `.env` — your route code doesn't change. Default is `mongodb` (works out of the box).

```js
// Backend route handler
const { storage } = require('../config');
const { url } = await storage.upload('docs/report.pdf', req.file.buffer, req.file.mimetype);

// Frontend
const { url } = await api.upload('/api/upload', file);
```

## Activating Pre-Built Integrations

These are installed and stubbed — uncomment and configure when you need them.

### Stripe (Payments)

1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env`
2. Uncomment the code in `routes/stripe.js` — checkout session creation, webhook handling, and customer portal are all stubbed
3. The webhook route already receives raw request bodies (configured in `server.js` middleware order)

### Resend (Email)

1. Set `RESEND_API_KEY` in `.env`
2. Create email templates using HTML template literals
3. The `resend` package is already installed

### Cloudflare Turnstile (Bot Protection)

1. Set `TURNSTILE_SECRET_KEY` in `.env`
2. Add the Turnstile widget to your frontend forms
3. Verify the token server-side before processing the form

### Sentry (Error Monitoring)

1. Set `SENTRY_DSN` in `.env`
2. The `@sentry/node` package is installed — initialize it in `server.js`

### PostHog (Product Analytics)

1. Set `POSTHOG_KEY` in `.env`
2. Add the PostHog client-side snippet to your frontend

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `SESSION_SECRET` | Random string for signing session cookies |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:5173`) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API server port |
| `NODE_ENV` | `development` | Set to `production` for secure cookies |

### File Storage

Set `STORAGE_PROVIDER` to choose your backend — only configure the vars for the one you use.

**Option A: MongoDB GridFS** (default)

Set `STORAGE_PROVIDER=mongodb` in your `.env` (or leave it unset — this is the default).

No extra configuration needed. Files are stored in your existing MongoDB database using GridFS and served via `/api/files/:filename`. This works out of the box — just set `MONGODB_URI` and uploads work.

Best for: getting started, development, and small-scale production.

**Option B: Google Cloud Storage**

Set `STORAGE_PROVIDER=gcs` in your `.env`.

| Variable | Description |
|----------|-------------|
| `GCS_BUCKET_NAME` | GCS bucket name |
| `GCS_PROJECT_ID` | Google Cloud project ID |
| `GCS_KEY_FILE` | Path to service account JSON key file |

Setup: Create a bucket in [Google Cloud Console](https://console.cloud.google.com/storage), create a service account with **Storage Object Admin** role, download the JSON key file, and add it to `.gitignore`.

Best for: production with high traffic or large files.

**Option C: Cloudflare R2**

Set `STORAGE_PROVIDER=r2` in your `.env`.

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public URL for the bucket (custom domain or `r2.dev` URL) |

Setup: Create an R2 bucket in the [Cloudflare dashboard](https://dash.cloudflare.com), enable public access, create an API token with Object Read & Write permissions.

Best for: production with S3-compatible tooling and no egress fees.

### Integrations (activate when needed)

| Variable | Service |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `RESEND_API_KEY` | Resend transactional email |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile bot protection |
| `SENTRY_DSN` | Sentry error monitoring |
| `POSTHOG_KEY` | PostHog product analytics |

See `.env.example` for the complete list.

## Middleware Pipeline

The order in `server.js` is critical — changing it will break things:

1. `helmet()` — security headers first
2. `cors()` — with credentials + explicit origin
3. `express.raw()` for `/api/stripe/webhook` — Stripe needs raw bytes for signature verification
4. `express.json()` — AFTER the raw body route, otherwise Stripe webhooks break
5. `session()` — after body parsing
6. Routes — after all middleware
7. Static file serving + SPA catch-all (production only)
8. Global error handler — catches `AppError` (operational) vs unexpected errors

### Express 5 Gotchas

This template uses Express 5, which has breaking changes from Express 4:

- **Wildcard routes:** Express 5 uses `path-to-regexp` v8 which requires named parameters. Use `app.get('/{*path}')` NOT `app.get('*')`. The old `*` syntax throws `Missing parameter name` errors.
- **connect-mongo v6 import:** In CommonJS, use `require('connect-mongo').default` — the store class is on `.default`, not the top-level export. Without `.default`, `MongoStore.create` is undefined.

## Deployment

This template is configured for [Render.com](https://render.com) as a single web service:

- **`render.yaml`** defines the service — Render reads this blueprint when you connect the repo
- **Build command:** `npm install && cd client && npm install && npm run build`
- **Start command:** `node server.js`
- **How it works:** In production (`NODE_ENV=production`), Express serves the React build from `client/dist` as static files, with a catch-all route that serves `index.html` for React Router. API routes under `/api` take priority over the catch-all.

### Required env vars on Render

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `SESSION_SECRET` | Random 32+ character string |
| `CLIENT_URL` | Your Render service URL (e.g. `https://your-app.onrender.com`) |

`NODE_ENV=production` and `SESSION_SECRET` are set automatically by `render.yaml`. Everything else is optional until you need it.

### Render-specific notes

- **Env vars are available at both build time and runtime**, so `VITE_API_URL` gets baked into the Vite build during the build step.
- **Render caches the build command** from initial service creation. If you update `render.yaml`, you must also update the build command manually in the Render dashboard under Settings → Build & Deploy.
- `trust proxy` is already configured for Render's load balancer.
- The free plan spins down after inactivity — first request after sleep takes ~30 seconds.

### Local development vs production

| | Local (dev) | Render (production) |
|---|---|---|
| **Frontend** | Vite dev server on port 5173 | Built to `client/dist`, served by Express |
| **API** | Express on port 5000 | Express on Render's `PORT` |
| **Proxy** | Vite proxies `/api` to Express | Same origin, no proxy needed |
| **Servers** | Two separate processes | One process |

You can deploy to any platform — the Render blueprint is just a convenience.

## Commands Reference

### Backend (run from project root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with nodemon (auto-reload on changes) |
| `npm start` | Start production API |

### Frontend (run from `client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `client/dist/` |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build locally |

## Conventions

These are the patterns this template follows. Stick with them for consistency:

- Frontend and backend are decoupled in dev (two servers), unified in production (Express serves both)
- API routes return JSON, always under `/api/`
- Session-based auth only — no JWT for browser sessions
- `crypto.scrypt` for password hashing — no external hashing libraries
- Zod schemas are the single source of truth for validation
- The User model has `select: false` on the password field — you must use `.select('+password')` to access it
- `AppError` for operational errors (expected, like "email already in use") — the global error handler distinguishes these from bugs
- File uploads default to MongoDB GridFS (no extra config). Use GCS or R2 for production scale (set `STORAGE_PROVIDER` env var).
- Stripe webhooks must be idempotent
- Use `upload()`, `validate()`, and `rateLimit()` middleware factories — they all follow the same pattern

## AI-Assisted Development

This template is designed to work well with AI coding tools, not just as a traditional boilerplate.

### AGENT.md (any AI tool)

The repo includes an `AGENT.md` file — a tool-agnostic context file that gives any AI coding assistant full knowledge of the architecture, conventions, API endpoints, and how to add features. It's written for machines, not a specific vendor.

AI tools that support project-level context files can use it directly or adapt it:

| Tool | Context file | How to use |
|------|-------------|------------|
| **Cursor** | `.cursorrules` | Copy `AGENT.md` content into `.cursorrules` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Copy `AGENT.md` content there |
| **Windsurf** | `.windsurfrules` | Copy `AGENT.md` content there |
| **Cline** | `.clinerules` | Copy `AGENT.md` content there |
| **OpenAI Codex** | `AGENTS.md` | Rename or copy `AGENT.md` to `AGENTS.md` |
| **Any other tool** | Varies | Point it at `AGENT.md` or paste the content into its context |

### CLAUDE.md (Claude Code)

For [Claude Code](https://claude.ai/code) specifically, there's also a `CLAUDE.md` file with the same architectural context plus Claude-specific configuration. A `.claude/launch.json` is included so Claude Code can start both dev servers and preview your app in the browser.

### Without AI

This works perfectly fine as a traditional boilerplate. The README you're reading covers everything you need. The `AGENT.md` and `CLAUDE.md` files won't get in your way — they're just markdown files that AI tools can optionally read.
