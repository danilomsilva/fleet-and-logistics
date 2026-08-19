import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MaintenanceRecord, MaintenanceStatus } from '@/mock-api/schemas/maintenance'
import { maintenanceKeys } from './query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

interface UpdateStatusInput {
  id: string
  status: MaintenanceStatus
}

async function updateMaintenanceStatus({
  id,
  status,
}: UpdateStatusInput): Promise<MaintenanceRecord> {
  const res = await fetch(`/api/maintenance/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update maintenance status')
  return res.json()
}

/** Optimistically updates the cached maintenance detail, per spec section 10. */
export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMaintenanceStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: maintenanceKeys.detail(id) })
      const previous = queryClient.getQueryData<MaintenanceRecord>(maintenanceKeys.detail(id))
      if (previous) {
        queryClient.setQueryData<MaintenanceRecord>(maintenanceKeys.detail(id), {
          ...previous,
          status,
        })
      }
      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(maintenanceKeys.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
