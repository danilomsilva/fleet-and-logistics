import { faker } from '@faker-js/faker'
import type { ActivityEvent, ActivityEventType } from '../schemas/activity'
import { activityEventTypeSchema } from '../schemas/activity'
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

const EVENT_ENTITY_KIND: Record<ActivityEventType, EntityKind> = {
  delivery_created: 'delivery',
  delivery_assigned: 'delivery',
  delivery_started: 'delivery',
  delivery_delivered: 'delivery',
  delivery_delayed: 'delivery',
  delivery_cancelled: 'delivery',
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
  delivery_started: 'Delivery started',
  delivery_delivered: 'Delivery completed',
  delivery_delayed: 'Delivery became delayed',
  delivery_cancelled: 'Delivery cancelled',
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

export function generateActivityEvents(count: number, sources: ActivitySources): ActivityEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `ACT-${String(i + 1).padStart(4, '0')}`
    const type = faker.helpers.arrayElement(activityEventTypeSchema.options)

    return {
      id,
      type,
      relatedEntity: pickEntityForKind(EVENT_ENTITY_KIND[type], sources),
      description: DESCRIPTIONS[type],
      timestamp: faker.date.recent({ days: 10 }).toISOString(),
    }
  })
}
