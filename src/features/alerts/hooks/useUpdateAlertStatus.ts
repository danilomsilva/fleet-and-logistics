import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Alert, AlertStatus } from '@/mock-api/schemas/alert'
import type { PaginatedResponse } from '@/shared/lib/query-params'
import { alertKeys } from './query-keys'

interface UpdateStatusInput {
  id: string
  status: AlertStatus
}

async function updateAlertStatus({ id, status }: UpdateStatusInput): Promise<Alert> {
  const res = await fetch(`/api/alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update alert status')
  return res.json()
}

/**
 * Alerts have no per-id detail cache (no detail route, per entity-routes.ts),
 * so the optimistic update patches every cached alerts list directly instead
 * of a single detail query.
 */
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAlertStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: alertKeys.lists() })
      const previousQueries = queryClient.getQueriesData<PaginatedResponse<Alert>>({
        queryKey: alertKeys.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Alert>>(
        { queryKey: alertKeys.lists() },
        (old) =>
          old && {
            ...old,
            data: old.data.map((alert) => (alert.id === id ? { ...alert, status } : alert)),
          },
      )
      return { previousQueries }
    },
    onError: (_error, _vars, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() })
    },
  })
}
