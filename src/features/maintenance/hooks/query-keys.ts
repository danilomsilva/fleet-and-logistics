import type { MaintenanceQueryParams } from './useMaintenanceRecords'

export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  list: (params: MaintenanceQueryParams) => [...maintenanceKeys.lists(), params] as const,
  details: () => [...maintenanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
}
