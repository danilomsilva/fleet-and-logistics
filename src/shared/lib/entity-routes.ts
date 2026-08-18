import type { EntityRef } from '@/mock-api/schemas/common'

/**
 * Maps an entity reference to its route path. Reused wherever the UI needs
 * to navigate to "the related entity" (ActivityTimeline, Alerts click-
 * through per spec section 9). Alerts have no detail route of their own —
 * they navigate to the alerts list.
 */
export function getEntityPath(ref: EntityRef): string {
  switch (ref.kind) {
    case 'vehicle':
      return `/vehicles/${ref.id}`
    case 'driver':
      return `/drivers/${ref.id}`
    case 'delivery':
      return `/deliveries/${ref.id}`
    case 'maintenance':
      return `/maintenance/${ref.id}`
    case 'alert':
      return '/alerts'
  }
}
