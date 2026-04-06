---
name: new-route
description: Scaffold a new Express API route with auth, validation, and rate limiting following project conventions
---

# New Route Scaffolder

Create a new Express API route following this project's conventions.

## Arguments

The user provides:
- **name** (required): Route name in kebab-case (e.g., `posts`, `comments`, `teams`)
- **protected** (optional, default: true): Whether to use `requireAuth` middleware
- **methods** (optional): HTTP methods to scaffold (e.g., "CRUD", "GET,POST", etc.)

## Steps

### 1. Create the route file

Create `routes/<name>.js` following the existing pattern from `routes/upload.js` and `routes/auth.js`:

```javascript
const express = require('express');
const { requireAuth, validate, rateLimit } = require('../middleware');
// const { <Model> } = require('../models');
// const { <schema> } = require('../shared/schemas/<name>');

const router = express.Router();

// TODO: Add route handlers

module.exports = router;
```

- Include `requireAuth` on all handlers if protected (default)
- Include `validate(schema)` if the route accepts a request body
- Include `rateLimit()` on write operations (POST, PUT, DELETE)
- Use `async (req, res, next) => { try { ... } catch (err) { next(err); } }` pattern

### 2. Mount in routes/index.js

Add the router import and mount line in `routes/index.js`:

```javascript
const <name>Router = require('./<name>');
router.use('/<name>', <name>Router);
```

### 3. Create shared Zod schema (if methods include POST/PUT/PATCH)

Create `shared/schemas/<name>.js` with Zod schemas for request validation. Follow the pattern in `shared/schemas/auth.js`.

### 4. Create Mongoose model (if needed)

Ask the user what fields the model needs. Create `models/<Name>.js` following the pattern in `models/User.js`.

## Conventions

- Routes return JSON, always under `/api/<name>`
- Use `AppError` from `utils/AppError.js` for operational errors
- User model has `select: false` on sensitive fields
- Session auth only (never JWT)
- Zod schemas are the single source of truth for validation
