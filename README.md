# Vision Dine

An AI-driven, interactive restaurant menu and management platform. Diners scan the QR code on
their table to open the menu on their own phone. From there they can look at dishes in 3D and AR,
place an order, track it and pay, with no app to install. Restaurants manage menus, tables, QR
codes, orders and payments from the admin dashboard.

Final Year Project, Department of Computer Engineering, COMSATS University Islamabad (Lahore
Campus). Supervisor: Dr Babar Ali. Team: Syed Ali Hassan (FA23-BCE-091), Hiba Imran (FA23-BCE-038).

> Planning, scope, task status and the 3D pipeline contract are in
> [docs/VISIONDINE_PLAN.md](docs/VISIONDINE_PLAN.md).

## Features

**Diner (BYOD, QR access)**
- Table-specific menu reached by scanning the table's QR code
- Categories, dish details and a cart
- 3D and AR dish previews *(in progress)*
- Live order tracking and payment at the counter or online *(in progress)*

**Restaurant admin**
- Live order dashboard
- Menu management
- Table management
- QR code generation, printing and download
- Kitchen display, order history, settings and staff *(in progress)*
- Chef video upload that is turned into a `.glb` model by an external Python worker *(in progress)*

**Platform**
- Subscription signup through Nexi XPay, with JWT auth (httpOnly cookie plus bearer token)

## Tech stack

- **App:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Data:** MongoDB Atlas + Mongoose, zod validation
- **Client state:** TanStack Query, Zustand
- **Integrations:** Nexi XPay (payments), Pusher (real-time), Cloudinary (media), Resend (email)

## Getting started

Requirements: Node.js 20+, npm, and a MongoDB database (local or Atlas).

```bash
npm install
cp .env.example .env      # then fill in the values
npm run create:admin      # seeds a demo restaurant + admin account
npm run dev               # http://localhost:3000
```

Useful URLs:

| URL | What |
| --- | --- |
| `/` | Landing page |
| `/login` | Admin login |
| `/admin/dashboard` | Restaurant dashboard |
| `/admin/qr-codes` | Generate and print table QR codes, which open `/customer/<tableCode>` |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run create:admin` | Seed the demo admin account |

## Project structure

```
src/app          Pages (App Router) and api/ route handlers
src/components   ui/ primitives, plus admin/, customer/ and shared/ feature components
src/lib          Server logic: db, auth, env, api helpers, models/, validations/
src/services     Third-party integrations (QR, media, payments)
src/store        Zustand stores
src/hooks        React hooks
docs/            Documentation
```

See [AGENTS.md](AGENTS.md) for coding conventions and API route rules.
