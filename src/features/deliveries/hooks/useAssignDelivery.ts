import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Delivery } from '@/mock-api/schemas/delivery'
import { deliveryKeys } from './query-keys'
import { driverKeys } from '@/features/drivers/hooks/query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

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
      // Assigning also updates the driver's and vehicle's own records
      // (assignedVehicleId/driverId, status) server-side — see
      // mock-api/handlers/dispatch.ts.
      queryClient.invalidateQueries({ queryKey: driverKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
