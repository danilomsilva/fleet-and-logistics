# FleetOS

FleetOS is a fleet and logistics operations dashboard: a portfolio project demonstrating a sophisticated, production-style frontend for managing vehicles, drivers, deliveries, maintenance, dispatch, and operational alerts.

## Status

In active development. Milestones 1–3 are complete: scaffolding, the app shell (sidebar/mobile-drawer navigation across all 7 screens) backed by a seeded, relationally-consistent mock API (MSW) with pagination/filtering/search/sort, and the shared component library (EmptyState, ErrorState, Skeletons, StatusBadge, KPICard, ConfirmDialog, ActivityTimeline, useUrlFilters, and DataTable with sorting/pagination/column visibility/row selection/bulk actions/loading-error-empty states). Screens themselves are still placeholders pending Milestone 4 onward.

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
