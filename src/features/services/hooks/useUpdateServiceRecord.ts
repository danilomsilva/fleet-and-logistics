import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ServiceInput, ServiceRecord } from '@/mock-api/schemas/service'
import { serviceKeys } from './query-keys'

interface UpdateServiceRecordInput {
  id: string
  input: ServiceInput
}

async function updateServiceRecord({
  id,
  input,
}: UpdateServiceRecordInput): Promise<ServiceRecord> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update service record')
  return res.json()
}

/** Full-record edit (vehicle/type/priority/scheduledDate/mileage/description/notes) —
 * distinct from useUpdateServiceStatus, which only handles Start/Complete. */
export function useUpdateServiceRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateServiceRecord,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}
