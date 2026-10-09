<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

## Verify before finishing

- `npm run lint` — ESLint (next/core-web-vitals + typescript)
- `npm run typecheck` — TypeScript, no emit
- `npm run build` — production build
- `npm run create:admin` — seed a demo admin account

## Structure

- `src/app` — Next.js App Router pages and `api/` route handlers.
- `src/components/ui` — presentation-only primitives (barrel-exported from `index.ts`).
- `src/components/{admin,customer,shared}` — feature components.
- `src/lib` — server-only logic: `db.ts` (Mongo), `auth.ts` (JWT), `env.ts` (validated env),
  `api.ts` (response helpers), `session.ts` (cookies), `models/`, `validations/`.
- `src/services` — third-party integrations (QR, vector search, vision).
- `src/store` — zustand stores; `src/hooks` — React hooks; `src/types` — shared types.
- `docs/` — all documentation except the root `README.md`.

## API route rules

- Every handler is wrapped in `withErrorHandling(async () => { ... })` from `@/lib/api`.
- Success responses use `ok(data, status)`; errors use `fail(...)` or `throw new ApiError(status, message)`.
- Requests are validated with zod schemas from `@/lib/validations` before use.
- Protected routes resolve the restaurant via `getAuthRestaurantId(request)` from `@/lib/auth`.
- Database access always goes through `dbConnect` from `@/lib/db`.

## Auth

- Server verifies JWTs signed with `serverEnv.JWT_SECRET` (never a hardcoded fallback).
- Sessions also live in an httpOnly cookie (`visiondine_token`) set by the auth routes
  and checked by `src/proxy.ts` for `/admin/*`. Client state lives in `useAuthStore`.
