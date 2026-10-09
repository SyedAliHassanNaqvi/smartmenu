# Vision Dine — Planning & Context

> Working plan for turning the `smartmenu` codebase into **Vision Dine**, the FYP described in
> *"VisionDine – An AI-Driven Interactive AR Restaurant Menu with Computer Vision Nutrition
> Estimation, Multilingual Voice Ordering & Predictive Demand Forecasting"*
> (COMSATS Lahore, Dept. of Computer Engineering — Supervisor: Dr Babar Ali;
> Syed Ali Hassan FA23-BCE-091, Hiba Imran FA23-BCE-038).

---

## 1. Proposal summary

Vision Dine is a **BYOD, QR-based restaurant platform**. A diner scans the QR code on their table
and opens the menu in their own phone's browser, with no app to install. They can look at dishes
in 3D and AR, order, and pay. Restaurants subscribe to the platform and manage menus, tables, QR
codes, orders, staff and payments from an admin dashboard.

Deliverables from the proposal and how this round of work covers them:

| Proposal deliverable | This round |
| --- | --- |
| Immersive digital menu (WebAR, 3D dish models, QR access) | **In scope.** Uses `@google/model-viewer` with AR on supported phones. |
| 3D asset creation (video/image → `.glb`) | **Slot only.** The upload, job queue and worker API are built here. The Python conversion script is written separately by the team (see §5). |
| Restaurant management platform (menu/table/order mgmt, QR, payments) | **In scope.** All of it gets finished. |
| Real-time order sync between diner, kitchen and admin | **In scope.** Uses Pusher instead of Socket.IO, because it works on serverless hosting. |
| Digital payments | **In scope.** Diners can pay at the counter or online through Nexi XPay. The XPay subscription signup flow already exists and will be hardened. |
| CV calorie/macro estimator | Deferred. |
| Animated mascot and multilingual voice ordering | Deferred. |
| Demand forecasting and analytics | Deferred. The dashboard only gets basic "today" stats. |
| Subscription tier enforcement and recurring billing | Deferred. The current plan is shown read-only. |

## 2. Decisions

| Topic | Decision |
| --- | --- |
| Brand | **Vision Dine**, written `VisionDine` or `visiondine` in identifiers |
| Diner payment | Pay at the counter (staff mark the order paid), or pay online via XPay with a server-side check |
| Real-time | Pusher channels (`private-restaurant-{id}`, `order-{id}`) |
| Media storage | Cloudinary, using signed direct uploads from the browser |
| 3D viewer | `@google/model-viewer` (`ar-modes="webxr scene-viewer quick-look"`) |
| DB name | The `.env` value is unchanged so existing data stays reachable. Only the code default becomes `visiondine`. |

## 3. Architecture (current stack)

```
Diner phone ──QR──▶ /customer/{tableCode}   (Next.js client pages)
                       │  menu · 3D/AR sheet · cart · order tracking · pay
                       ▼
               Next.js route handlers (src/app/api/*)
                 withErrorHandling · zod · JWT (cookie + bearer) · dbConnect
                       │
      ┌────────────────┼──────────────────┬─────────────────┐
      ▼                ▼                  ▼                 ▼
 MongoDB Atlas     Cloudinary          Pusher            Nexi XPay
 (Mongoose)     (images/videos/glb)  (live events)   (subscription + diner pay)
                       ▲
                       │  x-pipeline-key
              Python worker (team-owned): video → .glb
```

The admin dashboard (`/admin/*`, protected by `src/proxy.ts`) has these pages: dashboard, menu,
kitchen, orders, tables, QR codes, settings and staff.

## 4. Task list

Each task ends with `npm run lint`, `npm run typecheck` and `npm run build` passing, then waits for
approval before the next one starts.

- [x] **Task 0:** write this planning doc and move the stale AI-generated docs to `docs/archive/`
- [x] **Task 1:** rename SmartMenu to Vision Dine (constants, metadata, PWA, cookie, UI, README), and remove the leaked credential from `.env.example`
- [x] **Task 2:** correctness and security fixes
  - Order prices recomputed on the server
  - Tenancy checks
  - XPay payments verified with Nexi, and the chosen plan passed through
  - Tables `location` bug fixed
  - Status transitions fixed
  - Cart stored per table
  - Role helper added
- [x] **Task 3:** Cloudinary signed uploads, plus media fields on Product (gallery, video, model3d) and an upload UI in MenuManager (see [MEDIA.md](./MEDIA.md))
  - Also fixed: partial product updates (e.g. toggling availability) no longer reset `vegetarian`, `vegan`, `rating` and `reviewCount` to their defaults
- [ ] **Task 4:** 3D pipeline slot: `ModelJob` queue, worker API, status badges, manual GLB fallback, `pipeline/` stub and README
- [ ] **Task 5:** customer dish sheet with an image/video/3D viewer and AR button, plus restaurant branding on the customer pages
- [ ] **Task 6:** Pusher real-time: server publish helper, auth endpoint, client hook, polling kept only as a fallback
- [ ] **Task 7:** order lifecycle: a tracking page that survives reloads, a kitchen display, order history, and table occupancy
  - Done early (with Task 2 follow-up): Redux Toolkit cart persisted per table, a tracking page that survives reloads (`/customer/<code>/order/<id>`), the live-orders board with one-tap ETA, and a light theme across the app. Still to do: a dedicated kitchen display, order history, and table occupancy.
- [ ] **Task 8:** diner payments (counter, or XPay online with server confirmation)
- [ ] **Task 9:** admin completeness: settings (profile, logo, currency, tax, theme), staff and roles, plan card, today's stats
- [ ] **Task 10:** cleanup of mocks and unused code (with approval), `docs/ENVIRONMENT.md`, and a final end-to-end check

## 5. 3D pipeline contract (slot for the Python script)

The web app handles uploads, the job queue and display. The Python worker only has to turn a video
into a `.glb` file. The full contract will live in `pipeline/README.md` once Task 4 is done. Summary:

1. A chef uploads a dish video in **Admin → Menu**. The video goes to Cloudinary, a `ModelJob` is
   created with status `queued`, and the product's `model3d.status` is set to `queued`.
2. The worker calls `POST /api/pipeline/jobs/claim` with the header `x-pipeline-key: $PIPELINE_API_KEY`.
   It gets back `{ job: { id, productId, videoUrl }, upload: { cloudinary signature for the result } }`,
   or `{ job: null }` when there is nothing to do.
3. The worker calls `PATCH /api/pipeline/jobs/{id}` with `{ status: "processing" }`. It then
   converts the video, uploads the `.glb` (and optionally a poster image) to Cloudinary using the
   signature it was given, and calls `PATCH` again with `{ status: "done", glbUrl, posterUrl }`, or
   with `{ status: "failed", error }` if something went wrong.
4. The product becomes `model3d.status = "ready"`. Admins get a live update, and diners see the 3D
   and AR tab.

Admins can also upload a `.glb` by hand as a fallback (`model3d.source = "manual"`), which lets the
demo work before the Python script exists.

## 6. Known issues found during the audit (fixed in Tasks 1–2)

- `.env.example` contained a real MongoDB Atlas URI and password. **Rotate that password.**
- Order prices and totals were taken from the client without checking.
- `PUT /api/xpay` and the Nexi webhook created invitations without verifying the payment.
- The admin `GET /api/orders/[id]` did not check that the order belongs to the caller's restaurant.
- `GET /api/tables` left out `location`, so saving an edit erased it.
- The dashboard "Advance" button could move an order from `completed` to `cancelled`.
- Tax was hardcoded at 10% on the client, while the restaurant setting was 22%.
- The cart was not stored per table.
- The User model had two email indexes that conflicted.
- The plan chosen at signup was dropped.

## 7. Out of scope / future work

- Computer-vision calorie and macro estimator (YOLO/MobileNet + USDA FoodData Central)
- Chef mascot with TTS greeting, and multilingual voice ordering (Whisper + LLM order parser)
- Demand forecasting (XGBoost), richer analytics, and stock planning
- Subscription tier limits, recurring billing, and plan upgrades
