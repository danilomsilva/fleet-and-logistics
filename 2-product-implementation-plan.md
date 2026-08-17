# FleetOS — Frontend Implementation Plan

## Context

`1-product-specification.md` defines FleetOS, a portfolio-grade fleet/logistics ops dashboard (Dashboard, Dispatch, Deliveries, Vehicles, Drivers, Maintenance, Alerts). The repo is currently empty (just `.git` and the spec). The goal per spec §14 is to demonstrate sophisticated frontend engineering — complex data/state management, reusable components, accessibility, performance, and testing — not to build every conceivable fleet-management feature. This plan defines the stack, architecture, and a build order that produces full vertical slices (not layout shells followed by a data-wiring pass), so each milestone is a working, tested piece of the product.

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
| Tables | TanStack Table (headless) + shadcn `<Table>` | One reusable `DataTable` built once, reused for Vehicles/Drivers/Deliveries/Maintenance |
| Forms | React Hook Form + Zod | Assignment review, maintenance scheduling, alert notes |
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
      Sidebar.tsx
      UserMenu.tsx
  features/
    dashboard/
    vehicles/
    drivers/
    deliveries/
    dispatch/
    maintenance/
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
      utils.ts
  mock-api/
    schemas/                  # zod schemas + TS types per entity
    generators/                # faker-based seeded dataset builders
    db.ts                      # in-memory store, seeded once
    handlers/                  # MSW request handlers per resource
    browser.ts                 # MSW worker bootstrap (dev + test)
  test/
    setup.ts                   # RTL + jest-axe + MSW test server wiring
e2e/
  dispatch-assignment.spec.ts
  delivery-status-flow.spec.ts
  deliveries-url-filters.spec.ts
  alerts-acknowledge.spec.ts
```

## Mock API design (spec §13)

- REST-shaped endpoints per entity: `GET /api/vehicles?page=&pageSize=&sort=&status=&type=&driverId=&q=`, `GET /api/vehicles/:id`, `PATCH /api/deliveries/:id/status`, `POST /api/dispatch/assign`, `PATCH /api/alerts/:id`, etc. Handlers live in `mock-api/handlers/`, one file per resource, composed in `browser.ts`.
- All handlers apply artificial latency (150–600ms randomized) so loading states are real, not instant.
- A small in-memory `db.ts` (seeded via faker with a fixed seed for reproducibility) is mutated by PATCH/POST handlers so the app has real read-your-writes behavior across navigations.
- One handler (vehicles list) additionally supports a `?simulateError=1` escape hatch used by a Playwright/unit test to exercise the ErrorState + retry path deterministically — not exposed in the UI.
- Query keys centralized per feature (`features/deliveries/hooks/query-keys.ts` pattern) so invalidation after mutations is explicit and consistent.

## Reusable components (build once, in Phase 3, before any full data screen)

- **DataTable** — wraps TanStack Table: sorting, column visibility, row selection + bulk-action bar, pagination controls, empty/loading/error slots. Column defs are the only thing each screen supplies.
- **StatusBadge** — icon + text + color per status (never color alone — spec §12).
- **KPICard** — value, label, optional trend delta/direction.
- **EmptyState / ErrorState (with retry)** — shared primitives every screen's query hook renders through.
- **Skeletons** — table-row skeleton, card skeleton, detail-page skeleton.
- **ConfirmDialog** — Radix AlertDialog wrapper for destructive/important actions.
- **ActivityTimeline** — chronological event list with entity-navigation on click; reused by Vehicle/Driver/Delivery/Maintenance detail pages and Dashboard "Recent activity."
- **useUrlFilters** — zod-schema-driven hook syncing filter state to `useSearchParams`; used by Deliveries (required by spec §6) and reused for Vehicles/Drivers/Maintenance/Alerts filters for consistency.

## Build order (each milestone is a full vertical slice: types → mock handlers → query hooks → UI → tests)

1. **Scaffolding** — Vite+TS+React Router init, ESLint/Prettier, Tailwind + shadcn init, path aliases, Vitest config + RTL/jest-axe setup, Playwright config, MSW init (browser worker + Node server for tests).
2. **App shell & mock data foundation** — AppShell (sidebar/topbar, collapses to drawer per spec §11), route tree with placeholder pages, TanStack Query client, zod schemas + faker generators + in-memory db for all entities (vehicles, drivers, deliveries, maintenance, alerts, activity events), base MSW handlers.
3. **Shared component library** — DataTable, StatusBadge, KPICard, Empty/ErrorState, Skeletons, ConfirmDialog, ActivityTimeline, useUrlFilters. Component tests + axe checks here since everything downstream depends on these being accessible.
4. **Vehicles** — table (search/sort/filter/pagination/column visibility/selection/bulk actions) + detail page (Overview/Maintenance/Delivery history/Activity tabs). First full slice validating the DataTable contract.
5. **Drivers** — mirrors Vehicles pattern (table + detail with today's deliveries, history, availability, activity).
6. **Deliveries** — largest screen: full filter set reflected in URL (spec §6 explicit requirement), state-dependent detail actions (Assign/Start/Mark delivered/Report delay) via optimistic mutations, immediate UI feedback + toasts.
7. **Dashboard** — KPI cards (wired to real aggregate queries over the mock db, not separate fake numbers), Recharts delivery-by-status chart with Today/7d/30d toggle, fleet-status grouping, recent-activity timeline, top alerts widget. Built after Vehicles/Deliveries/Alerts exist so it has real data/links to aggregate and navigate to.
8. **Maintenance** — table + detail + schedule/start/complete actions.
9. **Alerts** — table/list + filter/search + acknowledge/resolve (optimistic per spec §10) + navigation to related entity.
10. **Dispatch** — MapLibre map (vehicles/drivers/delivery markers with distinct states) + unassigned-deliveries panel + Zustand-backed assignment wizard (select delivery → driver → vehicle → review → confirm) with conflict prevention (disable/flag unavailable drivers/vehicles at the data layer, not just visually).
11. **Cross-cutting passes**: accessibility sweep (keyboard nav, focus trapping in dialogs/comboboxes, `aria-live` for toasts/status changes, form-error announcements), responsive sweep (card layout fallback for tables on mobile per spec §11, single-column forms), performance check (row virtualization via TanStack Virtual if the Deliveries table dataset is large enough to warrant it).
12. **E2E smoke suite** (Playwright, run against the Vite dev server with MSW active): dispatch assignment end-to-end, delivery status change with optimistic UI, Deliveries URL filters (apply filters → reload page → filters persist), alert acknowledge/resolve.

Unit/component tests are written alongside each milestone (not deferred to the end) — DataTable behavior, query hooks (success/error/empty), status-transition logic, and accessibility assertions on shared components.

## Verification

- `npm run dev` — manually walk each of the 5 primary screens (Dashboard, Deliveries, Vehicles, Dispatch, Drivers) confirming loading→data, empty (via a filter combo with no matches), and error (`?simulateError=1`) states render correctly.
- `npm run test` (Vitest) — component/hook unit suite, including axe assertions on DataTable, dialogs, and comboboxes.
- `npm run test:e2e` (Playwright) — the 4 smoke flows above, run headless in CI mode.
- `npm run build` — production build succeeds with no TS errors.
- Manual keyboard-only pass on Deliveries (filter combobox, table sort headers, row actions, detail-page dialogs) and Dispatch (assignment wizard) to confirm full keyboard operability per spec §12.

## Execution approach

Implementation will proceed sequentially, one milestone after another, rather than in parallel — each step builds working, tested functionality on top of the previous one before moving on.
