import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Delivery, DeliveryInput } from '@/mock-api/schemas/delivery'
import { deliveryKeys } from './query-keys'

async function createDelivery(input: DeliveryInput): Promise<Delivery> {
  const res = await fetch('/api/deliveries', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create delivery')
  return res.json()
}

export function useCreateDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
    },
  })
}
