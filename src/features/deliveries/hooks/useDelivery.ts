import { useQuery } from '@tanstack/react-query'
import type { Delivery } from '@/mock-api/schemas/delivery'
import { deliveryKeys } from './query-keys'

async function fetchDelivery(id: string): Promise<Delivery> {
  const res = await fetch(`/api/deliveries/${id}`)
  if (!res.ok) throw new Error('Failed to load delivery')
  return res.json()
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: () => fetchDelivery(id),
    enabled: !!id,
  })
}
