import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Delivery } from '@/mock-api/schemas/delivery'
import { deliveryKeys } from './query-keys'

interface AssignInput {
  deliveryId: string
  driverId: string
  vehicleId: string
}

async function assignDelivery(input: AssignInput): Promise<Delivery> {
  const res = await fetch('/api/dispatch/assign', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to assign delivery')
  return res.json()
}

export function useAssignDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignDelivery,
    onSuccess: (_data, { deliveryId }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(deliveryId) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
    },
  })
}
