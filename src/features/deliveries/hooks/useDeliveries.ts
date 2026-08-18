import { useQuery } from '@tanstack/react-query'
import type { Delivery } from '@/mock-api/schemas/delivery'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'
import { deliveryKeys } from './query-keys'

export interface DeliveriesQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
  priority?: string
  driverId?: string
  vehicleId?: string
  date?: string
  destination?: string
  q?: string
}

async function fetchDeliveries(
  params: DeliveriesQueryParams,
): Promise<PaginatedResponse<Delivery>> {
  const res = await fetch(`/api/deliveries${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load deliveries')
  return res.json()
}

export function useDeliveries(params: DeliveriesQueryParams = {}) {
  return useQuery({
    queryKey: deliveryKeys.list(params),
    queryFn: () => fetchDeliveries(params),
  })
}
