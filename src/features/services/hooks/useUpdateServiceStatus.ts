import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ServiceRecord, ServiceStatus } from '@/mock-api/schemas/service'
import { serviceKeys } from './query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

interface UpdateStatusInput {
  id: string
  status: ServiceStatus
}

async function updateServiceStatus({
  id,
  status,
}: UpdateStatusInput): Promise<ServiceRecord> {
  const res = await fetch(`/api/services/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update service status')
  return res.json()
}

/** Optimistically updates the cached service detail, per spec section 10. */
export function useUpdateServiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateServiceStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: serviceKeys.detail(id) })
      const previous = queryClient.getQueryData<ServiceRecord>(serviceKeys.detail(id))
      if (previous) {
        queryClient.setQueryData<ServiceRecord>(serviceKeys.detail(id), {
          ...previous,
          status,
        })
      }
      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(serviceKeys.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
