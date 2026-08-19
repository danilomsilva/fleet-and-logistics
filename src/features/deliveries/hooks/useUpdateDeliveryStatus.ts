import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Delivery, DeliveryStatus } from '@/mock-api/schemas/delivery'
import { deliveryKeys } from './query-keys'
import { driverKeys } from '@/features/drivers/hooks/query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

interface UpdateStatusInput {
  id: string
  status: DeliveryStatus
}

async function updateDeliveryStatus({ id, status }: UpdateStatusInput): Promise<Delivery> {
  const res = await fetch(`/api/deliveries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update delivery status')
  return res.json()
}

/** Optimistically updates the cached delivery detail, per spec section 10. */
export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDeliveryStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: deliveryKeys.detail(id) })
      const previous = queryClient.getQueryData<Delivery>(deliveryKeys.detail(id))
      if (previous) {
        queryClient.setQueryData<Delivery>(deliveryKeys.detail(id), { ...previous, status })
      }
      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(deliveryKeys.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() })
      // 'delivered'/'cancelled' also frees the driver/vehicle back to
      // 'available' server-side — see mock-api/handlers/deliveries.ts.
      queryClient.invalidateQueries({ queryKey: driverKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
