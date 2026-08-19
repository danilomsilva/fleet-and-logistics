import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Driver, DriverStatus } from '@/mock-api/schemas/driver'
import { driverKeys } from './query-keys'

interface UpdateStatusInput {
  id: string
  status: DriverStatus
}

async function updateDriverStatus({ id, status }: UpdateStatusInput): Promise<Driver> {
  const res = await fetch(`/api/drivers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update driver status')
  return res.json()
}

/** Used for the Drivers table's bulk status actions (spec section 5, which
 * calls for the same table features as Vehicles). */
export function useUpdateDriverStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDriverStatus,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() })
    },
  })
}
