import { useQuery } from '@tanstack/react-query'
import type { ActivityEvent } from '@/mock-api/schemas/activity'
import type { EntityKind } from '@/mock-api/schemas/common'
import { buildQueryString, type PaginatedResponse } from '@/shared/lib/query-params'

export interface ActivityQueryParams {
  entityKind?: EntityKind
  entityId?: string
  page?: number
  pageSize?: number
}

async function fetchActivity(
  params: ActivityQueryParams,
): Promise<PaginatedResponse<ActivityEvent>> {
  const res = await fetch(`/api/activity${buildQueryString(params)}`)
  if (!res.ok) throw new Error('Failed to load activity')
  return res.json()
}

/** Powers ActivityTimeline on Vehicle/Driver/Delivery/Service detail pages and the Dashboard. */
export function useActivity(params: ActivityQueryParams) {
  return useQuery({
    queryKey: ['activity', params],
    queryFn: () => fetchActivity(params),
  })
}
