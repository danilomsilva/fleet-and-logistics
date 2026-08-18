import { useQuery } from '@tanstack/react-query'
import type { MaintenanceRecord } from '@/mock-api/schemas/maintenance'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'

export interface MaintenanceQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
  vehicleId?: string
  maintenanceType?: string
  priority?: string
  q?: string
}

async function fetchMaintenanceRecords(
  params: MaintenanceQueryParams,
): Promise<PaginatedResponse<MaintenanceRecord>> {
  const res = await fetch(`/api/maintenance${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load maintenance records')
  return res.json()
}

export function useMaintenanceRecords(params: MaintenanceQueryParams = {}) {
  return useQuery({
    queryKey: ['maintenance', 'list', params],
    queryFn: () => fetchMaintenanceRecords(params),
  })
}
