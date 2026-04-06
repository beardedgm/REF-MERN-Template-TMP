---
name: new-page
description: Scaffold a new React page with lazy loading, route entry, and optional nav link
---

# New Page Scaffolder

Create a new React page following this project's conventions.

## Arguments

The user provides:
- **name** (required): Page name in PascalCase (e.g., `Settings`, `Profile`, `Teams`)
- **path** (required): URL path (e.g., `/settings`, `/profile`, `/teams`)
- **protected** (optional, default: true): Whether to wrap in `<ProtectedRoute>`
- **nav** (optional, default: false): Whether to add a nav link in Layout.jsx

## Steps

### 1. Create the page component

Create `client/src/pages/<Name>.jsx`:

```jsx
export default function <Name>() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4"><Name></h1>
      {/* TODO: page content */}
    </div>
  );
}
```

Keep it minimal. The user will fill in the content.

### 2. Add lazy import in App.jsx

Add a lazy import line alongside the existing ones:

```javascript
const <Name> = lazy(() => import('./pages/<Name>'));
```

### 3. Add Route in App.jsx

If **protected** (default), add inside the existing `<ProtectedRoute>` block:

```jsx
<Route path="<path>" element={<<Name> />} />
```

If **not protected**, add as a sibling of the login/register routes.

### 4. Add nav link in Layout.jsx (if nav: true)

Add a `<Link>` in the authenticated section of the nav bar in `Layout.jsx`, following the existing Dashboard link pattern:

```jsx
<Link to="/<path>" className="text-sm hover:underline"><Name></Link>
```

## Conventions

- All pages use `React.lazy()` + `Suspense` for code-splitting
- Protected pages go inside the `<ProtectedRoute>` wrapper in the route tree
- Styling uses Tailwind CSS classes
- Server state uses TanStack Query hooks (create in `hooks/` if needed)
- Client state uses Zustand (only for synchronous reads synced from TanStack Query)
