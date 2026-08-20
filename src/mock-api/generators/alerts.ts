import { faker } from '@faker-js/faker'
import type { Alert, AlertType } from '../schemas/alert'
import { alertStatusSchema, alertTypeSchema } from '../schemas/alert'
import type { EntityRef } from '../schemas/common'
import type { Delivery } from '../schemas/delivery'
import type { Driver } from '../schemas/driver'
import type { ServiceRecord } from '../schemas/service'
import type { Vehicle } from '../schemas/vehicle'

interface AlertSources {
  vehicles: Vehicle[]
  drivers: Driver[]
  deliveries: Delivery[]
  serviceRecords: ServiceRecord[]
}

const MESSAGES: Record<AlertType, string> = {
  vehicle_service_due: 'Service is due soon',
  delivery_delayed: 'Delivery is running behind schedule',
  driver_unavailable: 'Driver is unavailable for assignment',
  vehicle_offline: 'Vehicle has gone offline',
  assignment_conflict: 'Assignment conflicts with driver availability',
}

function pickRelatedEntity(type: AlertType, sources: AlertSources): EntityRef {
  switch (type) {
    case 'vehicle_service_due':
      return { kind: 'service', id: faker.helpers.arrayElement(sources.serviceRecords).id }
    case 'delivery_delayed':
    case 'assignment_conflict':
      return { kind: 'delivery', id: faker.helpers.arrayElement(sources.deliveries).id }
    case 'driver_unavailable':
      return { kind: 'driver', id: faker.helpers.arrayElement(sources.drivers).id }
    case 'vehicle_offline':
      return { kind: 'vehicle', id: faker.helpers.arrayElement(sources.vehicles).id }
  }
}

/** Matches the 'delivery' vs 'fleet' split applyCategoryFilter derives from relatedEntity.kind. */
const DELIVERY_TYPES: AlertType[] = ['delivery_delayed', 'assignment_conflict']
const FLEET_TYPES: AlertType[] = alertTypeSchema.options.filter(
  (type) => !DELIVERY_TYPES.includes(type),
)

function buildAlert(index: number, type: AlertType, sources: AlertSources): Alert {
  return {
    id: `ALT-${String(index + 1).padStart(3, '0')}`,
    type,
    status: faker.helpers.arrayElement(alertStatusSchema.options),
    relatedEntity: pickRelatedEntity(type, sources),
    message: MESSAGES[type],
    timestamp: faker.date.recent({ days: 5 }).toISOString(),
  }
}

export function generateAlerts(
  counts: { delivery: number; fleet: number },
  sources: AlertSources,
): Alert[] {
  const deliveryAlerts = Array.from({ length: counts.delivery }, (_, i) =>
    buildAlert(i, faker.helpers.arrayElement(DELIVERY_TYPES), sources),
  )
  const fleetAlerts = Array.from({ length: counts.fleet }, (_, i) =>
    buildAlert(counts.delivery + i, faker.helpers.arrayElement(FLEET_TYPES), sources),
  )
  return [...deliveryAlerts, ...fleetAlerts]
}
