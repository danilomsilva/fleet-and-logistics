# FleetOS — Frontend Implementation Plan

## Context

`1-product-specification.md` defines FleetOS, a portfolio-grade fleet/logistics ops dashboard (Dashboard, Dispatch, Deliveries, Vehicles, Drivers, Services, Alerts). At the time this plan was first written, the repo was empty (just `.git` and the spec) — see "Detailed substeps" below for current progress. The goal per spec §14 is to demonstrate sophisticated frontend engineering — complex data/state management, reusable components, accessibility, performance, and testing — not to build every conceivable fleet-management feature. This plan defines the stack, architecture, and a build order that produces full vertical slices (not layout shells followed by a data-wiring pass), so each milestone is a working, tested piece of the product.

**Confirmed stack decisions** (from user):
- **Build tool / routing:** Vite + React Router
- **UI kit:** shadcn/ui (Radix primitives) + Tailwind CSS
- **Map:** MapLibre GL JS (no API key required)
- **Testing:** Vitest + React Testing Library (unit/component) + Playwright (smoke E2E)

## Tech stack (full)

| Concern | Choice | Why |
|---|---|---|
| Build/dev server | Vite + TypeScript | Fast dev loop, no SSR complexity needed since this is a mock-API client app |
| Routing | React Router v7 (declarative mode) | Nested layouts for the sidebar shell; `useSearchParams` gives URL-synced filters for free |
| Server-state / data fetching | TanStack Query | Caching, refetching, pagination, mutations, loading/error states — matches spec §13 exactly |
| Mock API | MSW (Mock Service Worker) | Intercepts real `fetch` calls at the network level so the app genuinely "talks to an API" (real request/response cycle, not just imported JS objects) — satisfies spec §1/§13 intent directly |
| Client/UI state | Zustand (small, scoped) | Only for sidebar collapse state and the Dispatch assignment wizard step — everything else stays local or in the URL |
| Tables | TanStack Table (headless) + shadcn `<Table>` | One reusable `DataTable` built once, reused for Vehicles/Drivers/Deliveries/Services |
| Forms | Zod (validation only) | Every "form" that shipped (assignment wizard, status transitions) turned out to be selection from existing data, not free-text input, so React Hook Form was never actually needed and was removed post-Milestone-12 as unused weight. Zod still validates mock API payloads and URL filter params. |
| Charts | Recharts | Delivery-by-status chart on Dashboard |
| Map | MapLibre GL JS (raw, thin React wrapper) | Vehicles/drivers/delivery markers, no billing/API-key setup |
| Toasts | shadcn `sonner` integration | Mutation feedback per spec §10 |
| Icons | lucide-react | Ships with shadcn |
| Data generation | `@faker-js/faker`, seeded | Deterministic mock dataset, generated once at MSW startup — not hardcoded in components (spec §13) |
| Unit/component tests | Vitest + React Testing Library + `vitest-axe` | Colocated with source |
| E2E smoke tests | Playwright | 4 critical-path flows (below) |
| Validation | Zod | Shared schemas for mock API payloads, forms, and URL filter params |

## Folder structure

```
src/
  app/
    routes.tsx              # route tree (React Router)
    layout/
      AppShell.tsx           # sidebar + topbar + <Outlet/>, responsive drawer
      Sidebar.tsx             # nav links + UserMenu at the bottom (spec §2)
      UserMenu.tsx
      Topbar.tsx              # mobile-only: drawer toggle (no profile menu — that's in Sidebar)
  features/
    dashboard/
    vehicles/
    drivers/
    deliveries/
    dispatch/
    services/
    alerts/
    # each feature/: components/, hooks/ (TanStack Query hooks), types.ts, routes.tsx
  shared/
    components/
      data-table/            # DataTable, column-visibility menu, pagination, bulk-action bar
      status-badge/
      kpi-card/
      empty-state/
      error-state/
      confirm-dialog/
      activity-timeline/
      skeletons/
    hooks/
      use-url-filters.ts      # zod-validated useSearchParams wrapper
    lib/
      query-client.ts
  lib/
    utils.ts                  # cn() helper — lives here (not shared/lib) because
                               # shadcn/ui hardcodes this path via components.json
  mock-api/
    schemas/                  # zod schemas + TS types per entity
    generators/                # faker-based seeded dataset builders
    db.ts                      # in-memory store, seeded once
    handlers/                  # MSW request handlers per resource
    browser.ts                 # MSW worker bootstrap (browser Service Worker)
    server.ts                  # MSW Node server (Vitest)
  test/
    setup.ts                   # jest-dom matchers + MSW Node server lifecycle.
                                # axe scans are NOT globally wired here — vitest-axe's
                                # custom matcher doesn't type-check against Vitest 4,
                                # so each test imports axe() directly and asserts on
                                # .violations (see step 1.13's commit for why).
e2e/
  smoke.spec.ts                # app shell + nav + mobile drawer (steps 1.14/2.18/2.19)
  dispatch-assignment.spec.ts   # planned, step 12
  delivery-status-flow.spec.ts  # planned, step 12
  deliveries-url-filters.spec.ts # planned, step 12
  alerts-acknowledge.spec.ts     # planned, step 12
```

## Mock API design (spec §13)

- REST-shaped endpoints per entity: `GET /api/vehicles?page=&pageSize=&sort=&status=&type=&driverId=&q=`, `GET /api/vehicles/:id`, `PATCH /api/deliveries/:id/status`, `POST /api/dispatch/assign`, `PATCH /api/alerts/:id`, etc. Handlers live in `mock-api/handlers/`, one file per resource, composed in `browser.ts`.
- All handlers apply artificial latency (150–600ms randomized) so loading states are real, not instant.
- A small in-memory `db.ts` (seeded via faker with a fixed seed for reproducibility) is mutated by PATCH/POST handlers so the app has real read-your-writes behavior across navigations.
- **Planned, not yet built:** a `?simulateError=1` escape hatch on the vehicles list handler, to exercise the ErrorState + retry path deterministically in tests — not exposed in the UI. Add this when building the Vehicles screen (milestone 4) or the shared ErrorState component (milestone 3), whichever needs it first.
- Query keys centralized per feature (`features/deliveries/hooks/query-keys.ts` pattern) so invalidation after mutations is explicit and consistent.

## Reusable components (build once, in Phase 3, before any full data screen)

- **DataTable** — wraps TanStack Table: sorting, column visibility, row selection + bulk-action bar, pagination controls, empty/loading/error slots. Column defs are the only thing each screen supplies.
- **StatusBadge** — icon + text + color per status (never color alone — spec §12).
- **KPICard** — value, label, optional trend delta/direction.
- **EmptyState / ErrorState (with retry)** — shared primitives every screen's query hook renders through.
- **Skeletons** — table-row skeleton, card skeleton, detail-page skeleton.
- **ConfirmDialog** — Radix AlertDialog wrapper for destructive/important actions.
- **ActivityTimeline** — chronological event list with entity-navigation on click; reused by Vehicle/Driver/Delivery/Service detail pages and Dashboard "Recent activity."
- **useUrlFilters** — zod-schema-driven hook syncing filter state to `useSearchParams`; used by Deliveries (required by spec §6) and reused for Vehicles/Drivers/Services/Alerts filters for consistency.

## Build order (each milestone is a full vertical slice: types → mock handlers → query hooks → UI → tests)

1. **Scaffolding** — Vite+TS+React Router init, ESLint/Prettier, Tailwind + shadcn init, path aliases, Vitest config + RTL/jest-axe setup, Playwright config, MSW init (browser worker + Node server for tests).
2. **App shell & mock data foundation** — AppShell (sidebar/topbar, collapses to drawer per spec §11), route tree with placeholder pages, TanStack Query client, zod schemas + faker generators + in-memory db for all entities (vehicles, drivers, deliveries, services, alerts, activity events), base MSW handlers.
3. **Shared component library** — DataTable, StatusBadge, KPICard, Empty/ErrorState, Skeletons, ConfirmDialog, ActivityTimeline, useUrlFilters. Component tests + axe checks here since everything downstream depends on these being accessible.
4. **Vehicles** — table (search/sort/filter/pagination/column visibility/selection/bulk actions) + detail page (Overview/Service/Delivery history/Activity tabs). First full slice validating the DataTable contract.
5. **Drivers** — mirrors Vehicles pattern (table + detail with today's deliveries, history, availability, activity).
6. **Deliveries** — largest screen: full filter set reflected in URL (spec §6 explicit requirement), state-dependent detail actions (Assign/Start/Mark delivered/Report delay) via optimistic mutations, immediate UI feedback + toasts.
7. **Dashboard** — KPI cards (wired to real aggregate queries over the mock db, not separate fake numbers), Recharts delivery-by-status chart with Today/7d/30d toggle, fleet-status grouping, recent-activity timeline, top alerts widget. Built after Vehicles/Deliveries/Alerts exist so it has real data/links to aggregate and navigate to.
8. **Services** — table + detail + schedule/start/complete actions.
9. **Alerts** — table/list + filter/search + acknowledge/resolve (optimistic per spec §10) + navigation to related entity.
10. **Dispatch** — MapLibre map (vehicles/drivers/delivery markers with distinct states) + unassigned-deliveries panel + Zustand-backed assignment wizard (select delivery → driver → vehicle → review → confirm) with conflict prevention (disable/flag unavailable drivers/vehicles at the data layer, not just visually).
11. **Cross-cutting passes**: accessibility sweep (keyboard nav, focus trapping in dialogs/comboboxes, `aria-live` for toasts/status changes, form-error announcements), responsive sweep (card layout fallback for tables on mobile per spec §11, single-column forms), performance check (row virtualization via TanStack Virtual if the Deliveries table dataset is large enough to warrant it).
12. **E2E smoke suite** (Playwright, run against the Vite dev server with MSW active): dispatch assignment end-to-end, delivery status change with optimistic UI, Deliveries URL filters (apply filters → reload page → filters persist), alert acknowledge/resolve.

Unit/component tests are written alongside each milestone (not deferred to the end) — DataTable behavior, query hooks (success/error/empty), status-transition logic, and accessibility assertions on shared components.

## Detailed substeps

Each milestone above is broken into atomic substeps — one install/config/build/test action per step, each ending in a working, verified, committed state before moving to the next. This is the actual execution order.

**1. Scaffolding**
1.1 Scaffold Vite+React+TS template, merge into repo without touching existing md/README files
1.2 Install base deps, verify `npm run build` works
1.3 Add `@/*` path alias (tsconfig + vite.config), verify build
1.4 Install & configure Tailwind CSS v4, verify build
1.5 Clean up default template cruft (sample assets, App.css, title)
1.6 Init shadcn/ui, verify build
1.7 Add core shadcn primitives (dialog, alert-dialog, dropdown-menu, table, sonner, badge, skeleton, tabs, separator, tooltip)
1.8 Install React Router (pin to Node-compatible version)
1.9 Install TanStack Query + TanStack Table
1.10 Install Zustand, React Hook Form + Zod, Recharts, MapLibre GL
1.11 Install faker + MSW (dev deps)
1.12 Set up ESLint + Prettier, verify lint passes
1.13 Set up Vitest + RTL + jest-dom + axe, write one smoke test, verify `npm test` passes
1.14 Set up Playwright, install browser binary, verify a trivial spec runs
1.15 Add `.gitignore`

**2. App shell & mock data foundation**
2.1–2.6 Define types/zod schemas: Vehicle, Driver, Delivery, Service record, Alert, Activity event (one entity per step)
2.7 Seeded faker generators producing the in-memory dataset
2.8 Wire entity relationships in the in-memory db module
2.9 MSW bootstrap (browser worker + Node test server)
2.10 Base MSW list/get handlers (pagination/sort/filter/search parsing)
2.11 Base MSW mutation handler placeholders
2.12 Wire TanStack Query client + provider
2.13 Sidebar nav (nav links only)
2.14 UserMenu component, mounted at the bottom of the Sidebar (spec §2 — not in a Topbar)
2.15 Topbar (mobile-only: drawer toggle button, no profile menu)
2.16 Responsive drawer (Zustand store for collapse state, wired to the Topbar toggle)
2.17 Route tree with placeholder pages for all 7 screens
2.18 Wire AppShell as root layout
2.19 Verify dev server: shell renders, nav works
2.20 Tests: generators, handlers, AppShell/Sidebar (incl. axe)

**3. Shared component library** *(one component + its test per step)*
3.1 EmptyState · 3.2 ErrorState+retry · 3.3 Skeletons · 3.4 StatusBadge · 3.5 KPICard · 3.6 ConfirmDialog · 3.7 ActivityTimeline · 3.8 useUrlFilters
3.9 DataTable: core + sorting · 3.10 pagination · 3.11 column visibility · 3.12 row selection + bulk actions · 3.13 empty/loading/error slots

**4. Vehicles**
4.1 List/get MSW handlers · 4.2 useVehicles/useVehicle hooks+tests · 4.3 Table columns+DataTable wiring · 4.4 Filters · 4.5 Search · 4.6 Detail page shell+tabs · 4.7–4.10 Overview / Service / Delivery history / Activity tab content (one per step) · 4.11 Tests (incl. axe)

**5. Drivers** *(mirrors Vehicles)*
5.1 Handlers · 5.2 Hooks+tests · 5.3 Table · 5.4 Detail shell · 5.5–5.9 each detail tab · 5.10 Tests

**6. Deliveries**
6.1 List/get handlers (full filter set) · 6.2 Mutation handlers (assign/start/deliver/delay) · 6.3 Query hooks+tests · 6.4 Optimistic mutation hooks+tests · 6.5 Table columns · 6.6 URL-synced filter bar · 6.7 Search+bulk actions · 6.8 Detail info panel · 6.9 Activity timeline · 6.10 State-dependent action buttons+toasts · 6.11 Tests

**7. Dashboard**
7.1 Aggregate query hooks · 7.2 KPI cards · 7.3 Delivery-status chart+period toggle · 7.4 Fleet-status grouping · 7.5 Recent activity widget · 7.6 Top alerts widget · 7.7 Layout assembly+responsive · 7.8 Tests

**8. Services**
8.1 Handlers (incl. schedule/start/complete) · 8.2 Hooks+tests · 8.3 Table · 8.4 Detail page · 8.5 Actions+ConfirmDialog · 8.6 Tests

**9. Alerts**
9.1 Handlers (incl. acknowledge/resolve) · 9.2 Optimistic hooks+tests · 9.3 List/table · 9.4 Row actions+priority indicators · 9.5 Click-through navigation · 9.6 Tests

**10. Dispatch**
10.1 Base map · 10.2–10.4 Vehicle/driver/delivery markers (one per step) · 10.5 Unassigned-deliveries panel · 10.6 Wizard state store · 10.7–10.10 Wizard steps: select delivery / driver / vehicle / review+confirm (one per step) · 10.11 Conflict prevention · 10.12 Post-assignment list transition+toast · 10.13 Tests

**11. Cross-cutting passes**
11.1 Keyboard nav audit · 11.2 Focus trapping · 11.3 aria-live regions · 11.4 Form-error announcements · 11.5–11.8 Responsive sweep (sidebar/tables/dispatch/forms, one per step) · 11.9 Virtualization if warranted

**12. E2E smoke suite**
12.1 Playwright config finalization · 12.2–12.5 Four E2E flows (one per step) · 12.6 Full verification pass (build+test+e2e green)

## Verification

- `npm run dev` — manually walk each of the 5 primary screens (Dashboard, Deliveries, Vehicles, Dispatch, Drivers) confirming loading→data, empty (via a filter combo with no matches), and error (`?simulateError=1`) states render correctly.
- `npm run test` (Vitest) — component/hook unit suite, including axe assertions on DataTable, dialogs, and comboboxes.
- `npm run test:e2e` (Playwright) — the 4 smoke flows above, run headless in CI mode.
- `npm run build` — production build succeeds with no TS errors.
- Manual keyboard-only pass on Deliveries (filter combobox, table sort headers, row actions, detail-page dialogs) and Dispatch (assignment wizard) to confirm full keyboard operability per spec §12.

## Execution approach

Implementation will proceed sequentially, one milestone after another, rather than in parallel — each step builds working, tested functionality on top of the previous one before moving on.
