import { faker } from '@faker-js/faker'
import type { MaintenanceRecord } from '../schemas/maintenance'
import {
  maintenancePrioritySchema,
  maintenanceStatusSchema,
  maintenanceTypeSchema,
} from '../schemas/maintenance'
import type { Vehicle } from '../schemas/vehicle'

export function generateMaintenanceRecords(
  count: number,
  { vehicles }: { vehicles: Vehicle[] },
): MaintenanceRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `MNT-${String(i + 1).padStart(3, '0')}`
    const status = faker.helpers.arrayElement(maintenanceStatusSchema.options)
    const scheduledDate =
      status === 'completed' ? faker.date.recent({ days: 30 }) : faker.date.soon({ days: 30 })

    return {
      id,
      vehicleId: faker.helpers.arrayElement(vehicles).id,
      maintenanceType: faker.helpers.arrayElement(maintenanceTypeSchema.options),
      status,
      priority: faker.helpers.arrayElement(maintenancePrioritySchema.options),
      description: faker.lorem.sentence(),
      scheduledDate: scheduledDate.toISOString(),
      completionDate:
        status === 'completed'
          ? faker.date.soon({ days: 3, refDate: scheduledDate }).toISOString()
          : null,
      mileage: faker.number.int({ min: 1_000, max: 150_000 }),
      notes: faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.sentence() : '',
    }
  })
}
