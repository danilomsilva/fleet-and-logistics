import { useQuery } from '@tanstack/react-query'
import type { ServiceRecord } from '@/mock-api/schemas/service'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'
import { serviceKeys } from './query-keys'

export interface ServiceQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
  vehicleId?: string
  serviceType?: string
  priority?: string
  date?: string
  q?: string
}

async function fetchServiceRecords(
  params: ServiceQueryParams,
): Promise<PaginatedResponse<ServiceRecord>> {
  const res = await fetch(`/api/services${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load service records')
  return res.json()
}

export function useServiceRecords(params: ServiceQueryParams = {}) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => fetchServiceRecords(params),
  })
}
