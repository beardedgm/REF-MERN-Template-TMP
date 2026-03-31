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
- **File uploads:** Google Cloud Storage or Cloudflare R2 (switchable via env var) + multer — profile pictures included, general-purpose endpoint ready
- **Shared:** Zod schemas used by both frontend and backend
- **Ready to activate:** Stripe, Resend, Cloudflare Turnstile, Sentry (stubs + env vars in place)

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Random string for session signing |
| `CLIENT_URL` | Yes | Frontend URL (default: `http://localhost:5173`) |
| `PORT` | No | API port (default: `5000`) |

### File Storage

Set `STORAGE_PROVIDER` in your `.env` to choose a provider — only configure the vars for the one you use.

| Variable | Description |
|----------|-------------|
| `STORAGE_PROVIDER` | `gcs` (default) or `r2` |

**Option A: Google Cloud Storage** (`STORAGE_PROVIDER=gcs`)

| Variable | Description |
|----------|-------------|
| `GCS_BUCKET_NAME` | GCS bucket name |
| `GCS_PROJECT_ID` | Google Cloud project ID |
| `GCS_KEY_FILE` | Path to service account JSON key file |

Setup: Create a bucket in [Google Cloud Console](https://console.cloud.google.com/storage), create a service account with **Storage Object Admin** role, download the JSON key, add it to `.gitignore`.

**Option B: Cloudflare R2** (`STORAGE_PROVIDER=r2`)

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public URL for the bucket (custom domain or `r2.dev` URL) |

Setup: Create an R2 bucket in the [Cloudflare dashboard](https://dash.cloudflare.com), enable public access, create an API token with Object Read & Write permissions.

See `.env.example` for the full list including Stripe, Resend, and monitoring variables.

## File Uploads

The template includes a reusable file upload system with swappable storage backends (GCS or Cloudflare R2).

### How it works

1. **`middleware/upload.js`** — A multer factory that validates file types and sizes:
   ```js
   const { upload } = require('../middleware');
   router.post('/my-route', requireAuth, upload({ maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png'] }), handler);
   ```
2. **`config/storage.js`** — Exports a provider-agnostic `storage` object with `upload()`, `remove()`, and `getPublicUrl()` methods. Switches between GCS and R2 based on `STORAGE_PROVIDER` env var.
3. **`routes/upload.js`** — General-purpose `POST /api/upload` endpoint (auth required, returns public URL)
4. **`routes/auth.js`** — `PUT /api/auth/profile-picture` as a concrete example of a model-specific upload

### Storage interface

Route handlers use a clean interface — no raw SDK calls needed:
```js
const { storage } = require('../config');

// Upload a file
const { url, filename } = await storage.upload('uploads/photo.jpg', buffer, 'image/jpeg');

// Delete a file
await storage.remove('uploads/photo.jpg');

// Get public URL without uploading
const url = storage.getPublicUrl('uploads/photo.jpg');
```

### Frontend

The API client (`client/src/lib/api.js`) has an `upload` method that handles FormData:
```js
import api from '../lib/api';

// General upload
const { url } = await api.upload('/api/upload', file);

// Profile picture (PUT instead of POST)
const { user } = await api.upload('/api/auth/profile-picture', file, { method: 'PUT' });
```

## Project Structure

See `CLAUDE.md` for full architecture documentation.
