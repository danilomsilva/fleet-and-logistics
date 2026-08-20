import { faker } from '@faker-js/faker'
import type { ActivityEvent, ActivityEventType } from '../schemas/activity'
import type { Alert } from '../schemas/alert'
import type { EntityKind, EntityRef } from '../schemas/common'
import type { Delivery } from '../schemas/delivery'
import type { Driver } from '../schemas/driver'
import type { ServiceRecord } from '../schemas/service'
import type { Vehicle } from '../schemas/vehicle'

interface ActivitySources {
  vehicles: Vehicle[]
  drivers: Driver[]
  deliveries: Delivery[]
  serviceRecords: ServiceRecord[]
  alerts: Alert[]
}

/** Event types generated independently at random, unrelated to any single
 * entity's real lifecycle — delivery events are handled separately below,
 * deterministically, so a delivery's own history stays internally consistent. */
type RandomEventType = Exclude<
  ActivityEventType,
  'delivery_created' | 'delivery_assigned' | 'delivery_delivered' | 'delivery_delayed'
>

const RANDOM_EVENT_TYPES: RandomEventType[] = [
  'vehicle_status_changed',
  'vehicle_entered_service',
  'vehicle_exited_service',
  'driver_status_changed',
  'driver_completed_delivery',
  'service_scheduled',
  'service_started',
  'service_completed',
  'alert_acknowledged',
  'alert_resolved',
]

const RANDOM_EVENT_ENTITY_KIND: Record<RandomEventType, EntityKind> = {
  vehicle_status_changed: 'vehicle',
  vehicle_entered_service: 'vehicle',
  vehicle_exited_service: 'vehicle',
  driver_status_changed: 'driver',
  driver_completed_delivery: 'driver',
  service_scheduled: 'service',
  service_started: 'service',
  service_completed: 'service',
  alert_acknowledged: 'alert',
  alert_resolved: 'alert',
}

const DESCRIPTIONS: Record<ActivityEventType, string> = {
  delivery_created: 'Delivery created',
  delivery_assigned: 'Delivery assigned to driver and vehicle',
  delivery_delivered: 'Delivery completed',
  delivery_delayed: 'Delivery became delayed',
  vehicle_status_changed: 'Vehicle status changed',
  vehicle_entered_service: 'Vehicle entered service',
  vehicle_exited_service: 'Vehicle exited service',
  driver_status_changed: 'Driver status changed',
  driver_completed_delivery: 'Driver completed a delivery',
  service_scheduled: 'Service scheduled',
  service_started: 'Service started',
  service_completed: 'Service completed',
  alert_acknowledged: 'Alert acknowledged',
  alert_resolved: 'Alert resolved',
}

function pickEntityForKind(kind: EntityKind, sources: ActivitySources): EntityRef {
  switch (kind) {
    case 'vehicle':
      return { kind, id: faker.helpers.arrayElement(sources.vehicles).id }
    case 'driver':
      return { kind, id: faker.helpers.arrayElement(sources.drivers).id }
    case 'delivery':
      return { kind, id: faker.helpers.arrayElement(sources.deliveries).id }
    case 'service':
      return { kind, id: faker.helpers.arrayElement(sources.serviceRecords).id }
    case 'alert':
      return { kind, id: faker.helpers.arrayElement(sources.alerts).id }
  }
}

/**
 * Every delivery gets a real, chronologically consistent history from the
 * moment it was created through to wherever it currently stands — a
 * 'delivered' delivery always has a full created -> assigned -> delivered
 * trail, not just a lone "completed" event with nothing before it.
 */
function generateDeliveryEvents(deliveries: Delivery[]): ActivityEvent[] {
  const events: ActivityEvent[] = []

  deliveries.forEach((delivery, index) => {
    let cursor = faker.date.recent({ days: 7, refDate: new Date(delivery.scheduledTime) })
    const push = (type: ActivityEventType) => {
      events.push({
        id: `ACT-DEL-${String(index + 1).padStart(4, '0')}-${events.length + 1}`,
        type,
        relatedEntity: { kind: 'delivery', id: delivery.id },
        description: DESCRIPTIONS[type],
        timestamp: cursor.toISOString(),
      })
    }

    push('delivery_created')
    if (delivery.status === 'new') return

    cursor = faker.date.soon({ days: 1, refDate: cursor })
    push('delivery_assigned')

    if (delivery.status === 'delayed') {
      cursor = faker.date.soon({ days: 1, refDate: cursor })
      push('delivery_delayed')
    } else if (delivery.status === 'delivered') {
      cursor = faker.date.soon({ days: 1, refDate: cursor })
      push('delivery_delivered')
    }
  })

  return events
}

export function generateActivityEvents(count: number, sources: ActivitySources): ActivityEvent[] {
  const randomEvents = Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(RANDOM_EVENT_TYPES)
    return {
      id: `ACT-${String(i + 1).padStart(4, '0')}`,
      type,
      relatedEntity: pickEntityForKind(RANDOM_EVENT_ENTITY_KIND[type], sources),
      description: DESCRIPTIONS[type],
      timestamp: faker.date.recent({ days: 10 }).toISOString(),
    }
  })

  return [...generateDeliveryEvents(sources.deliveries), ...randomEvents]
}
