import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'

/**
 * TanStack Table v9 requires a stable, explicit feature set. Screens build
 * their column defs against this same object via
 * `createColumnHelper<typeof dataTableFeatures, TData>()` so the types line
 * up with what DataTable actually registers.
 *
 * Sorting/pagination are manual (server-driven) — our mock API already
 * paginates/sorts/filters server-side, so DataTable never needs the
 * client-side sortedRowModel/paginatedRowModel row models.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
})
