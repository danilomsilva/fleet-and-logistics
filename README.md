# FleetOS

FleetOS is a fleet and logistics operations dashboard: a portfolio project demonstrating a sophisticated, production-style frontend for managing vehicles, drivers, deliveries, maintenance, dispatch, and operational alerts.

## Status

Feature-complete: all 12 milestones done. All 7 screens (Dashboard, Dispatch, Deliveries, Vehicles, Drivers, Maintenance, Alerts) are fully built against a seeded, relationally-consistent mock API (MSW) with pagination/filtering/search/sort, sharing a common component library (EmptyState, ErrorState, Skeletons, StatusBadge, KPICard, ConfirmDialog, ActivityTimeline, useUrlFilters, and DataTable with sorting/pagination/column visibility/row selection/bulk actions/loading-error-empty states). Vehicles, Drivers, Deliveries, and Maintenance each have a full vertical slice (URL-synced filters, detail pages, state-dependent actions with optimistic mutations and toast feedback); Vehicles and Deliveries additionally support row selection with bulk status actions. The Dashboard aggregates KPI cards, a delivery-status chart with a Today/7d/30d toggle, fleet-status breakdown, top alerts, and recent activity. Alerts supports inline acknowledge/resolve with click-through to the related entity. Dispatch renders a MapLibre map of fleet vehicles and unassigned delivery pickups alongside an unassigned-deliveries panel and a Zustand-backed assignment wizard with data-layer conflict prevention. Routes are lazy-loaded (initial bundle ~326 KB gzip; MapLibre and Recharts load only on their own routes).

165 Vitest unit/component tests (including axe accessibility checks on every major page/dialog) and 30 Playwright e2e tests covering every screen's critical flows all pass, alongside a clean `tsc`, `eslint`, and production `build`.

- [`docs/1-product-specification.md`](./docs/1-product-specification.md) — the product spec.
- [`docs/2-product-implementation-plan.md`](./docs/2-product-implementation-plan.md) — the frontend architecture and build plan (see "Detailed substeps" for progress).

## Stack

Vite + TypeScript, React Router, TanStack Query, TanStack Table, MSW (mock API), Zustand, shadcn/ui + Tailwind CSS, MapLibre GL JS, Recharts, React Hook Form + Zod, Vitest + React Testing Library, Playwright.

See the implementation plan for the full rationale and build order.

## Development

```
npm install
npm run dev        # start the dev server
npm run build      # production build
npm run lint       # ESLint
npm run format:check  # Prettier check
npm run test        # Vitest unit/component suite
npm run test:e2e     # Playwright end-to-end suite
```
