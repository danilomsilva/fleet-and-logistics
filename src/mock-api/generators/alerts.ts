import { faker } from '@faker-js/faker'
import type { Alert, AlertType } from '../schemas/alert'
import { alertPrioritySchema, alertStatusSchema, alertTypeSchema } from '../schemas/alert'
import type { EntityRef } from '../schemas/common'
import type { Delivery } from '../schemas/delivery'
import type { Driver } from '../schemas/driver'
import type { MaintenanceRecord } from '../schemas/maintenance'
import type { Vehicle } from '../schemas/vehicle'

interface AlertSources {
  vehicles: Vehicle[]
  drivers: Driver[]
  deliveries: Delivery[]
  maintenanceRecords: MaintenanceRecord[]
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
      return { kind: 'maintenance', id: faker.helpers.arrayElement(sources.maintenanceRecords).id }
    case 'delivery_delayed':
    case 'assignment_conflict':
      return { kind: 'delivery', id: faker.helpers.arrayElement(sources.deliveries).id }
    case 'driver_unavailable':
      return { kind: 'driver', id: faker.helpers.arrayElement(sources.drivers).id }
    case 'vehicle_offline':
      return { kind: 'vehicle', id: faker.helpers.arrayElement(sources.vehicles).id }
  }
}

export function generateAlerts(count: number, sources: AlertSources): Alert[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `ALT-${String(i + 1).padStart(3, '0')}`
    const type = faker.helpers.arrayElement(alertTypeSchema.options)

    return {
      id,
      type,
      priority: faker.helpers.arrayElement(alertPrioritySchema.options),
      status: faker.helpers.arrayElement(alertStatusSchema.options),
      relatedEntity: pickRelatedEntity(type, sources),
      message: MESSAGES[type],
      timestamp: faker.date.recent({ days: 5 }).toISOString(),
    }
  })
}
