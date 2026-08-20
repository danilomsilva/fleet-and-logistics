import { useQuery } from '@tanstack/react-query'
import type { ServiceRecord } from '@/mock-api/schemas/service'
import { serviceKeys } from './query-keys'

async function fetchServiceRecord(id: string): Promise<ServiceRecord> {
  const res = await fetch(`/api/services/${id}`)
  if (!res.ok) throw new Error('Failed to load service record')
  return res.json()
}

export function useServiceRecord(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => fetchServiceRecord(id),
    enabled: !!id,
  })
}
