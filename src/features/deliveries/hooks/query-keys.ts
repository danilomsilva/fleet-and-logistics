import type { DeliveriesQueryParams } from './useDeliveries'

export const deliveryKeys = {
  all: ['deliveries'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (params: DeliveriesQueryParams) => [...deliveryKeys.lists(), params] as const,
  details: () => [...deliveryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliveryKeys.details(), id] as const,
}
