import { useQuery } from '@tanstack/react-query'
import type { Vehicle } from '@/mock-api/schemas/vehicle'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'
import { vehicleKeys } from './query-keys'

export interface VehiclesQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
  type?: string
  driverId?: string
  serviceStatus?: string
  q?: string
}

async function fetchVehicles(params: VehiclesQueryParams): Promise<PaginatedResponse<Vehicle>> {
  const res = await fetch(`/api/vehicles${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load vehicles')
  return res.json()
}

export function useVehicles(params: VehiclesQueryParams = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => fetchVehicles(params),
  })
}
