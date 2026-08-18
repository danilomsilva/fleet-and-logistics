import { useQuery } from '@tanstack/react-query'
import type { Driver } from '@/mock-api/schemas/driver'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'
import { driverKeys } from './query-keys'

export interface DriversQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
  assignedVehicleId?: string
  q?: string
}

async function fetchDrivers(params: DriversQueryParams): Promise<PaginatedResponse<Driver>> {
  const res = await fetch(`/api/drivers${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load drivers')
  return res.json()
}

export function useDrivers(params: DriversQueryParams = {}) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => fetchDrivers(params),
  })
}
