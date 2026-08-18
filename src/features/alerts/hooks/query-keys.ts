import type { AlertsQueryParams } from './useAlerts'

export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (params: AlertsQueryParams) => [...alertKeys.lists(), params] as const,
  details: () => [...alertKeys.all, 'detail'] as const,
  detail: (id: string) => [...alertKeys.details(), id] as const,
}
