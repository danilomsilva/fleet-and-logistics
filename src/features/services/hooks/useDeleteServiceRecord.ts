import { useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceKeys } from './query-keys'

async function deleteServiceRecord(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete service record')
}

export function useDeleteServiceRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteServiceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}
