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
- **File uploads:** Google Cloud Storage via multer — profile pictures included, general-purpose endpoint ready
- **Shared:** Zod schemas used by both frontend and backend
- **Ready to activate:** Stripe, Resend, Cloudflare Turnstile, Sentry (stubs + env vars in place)

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Random string for session signing |
| `CLIENT_URL` | Yes | Frontend URL (default: `http://localhost:5173`) |
| `PORT` | No | API port (default: `5000`) |

### Google Cloud Storage (for file uploads)

| Variable | Required | Description |
|----------|----------|-------------|
| `GCS_BUCKET_NAME` | For uploads | GCS bucket name |
| `GCS_PROJECT_ID` | For uploads | Google Cloud project ID |
| `GCS_KEY_FILE` | For uploads | Path to service account JSON key file |

**Setup steps:**
1. Create a GCS bucket in the [Google Cloud Console](https://console.cloud.google.com/storage)
2. Create a service account with the **Storage Object Admin** role
3. Download the JSON key file and place it in your project (add it to `.gitignore`)
4. Set the three env vars above in your `.env`

See `.env.example` for the full list including Stripe, Resend, and monitoring variables.

## File Uploads

The template includes a reusable file upload system built on Google Cloud Storage and multer.

### How it works

1. **`middleware/upload.js`** — A multer factory that validates file types and sizes. Use it like the other middleware factories:
   ```js
   const { upload } = require('../middleware');
   router.post('/my-route', requireAuth, upload({ maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png'] }), handler);
   ```
2. **`config/storage.js`** — Exports `{ storage, bucket }` for direct GCS access in route handlers
3. **`routes/upload.js`** — General-purpose `POST /api/upload` endpoint (auth required, returns public URL)
4. **`routes/auth.js`** — `PUT /api/auth/profile-picture` as a concrete example of a model-specific upload

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
