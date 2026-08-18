import { useQuery } from '@tanstack/react-query'
import type { Alert } from '@/mock-api/schemas/alert'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'
import { alertKeys } from './query-keys'

export interface AlertsQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
  type?: string
  priority?: string
  q?: string
}

async function fetchAlerts(params: AlertsQueryParams): Promise<PaginatedResponse<Alert>> {
  const res = await fetch(`/api/alerts${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load alerts')
  return res.json()
}

export function useAlerts(params: AlertsQueryParams = {}) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => fetchAlerts(params),
  })
}
