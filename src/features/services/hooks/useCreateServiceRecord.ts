import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ServiceInput, ServiceRecord } from '@/mock-api/schemas/service'
import { serviceKeys } from './query-keys'

async function createServiceRecord(input: ServiceInput): Promise<ServiceRecord> {
  const res = await fetch('/api/services', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create service record')
  return res.json()
}

export function useCreateServiceRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createServiceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}
