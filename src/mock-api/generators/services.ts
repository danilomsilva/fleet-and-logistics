import { faker } from '@faker-js/faker'
import type { ServiceRecord } from '../schemas/service'
import {
  servicePrioritySchema,
  serviceStatusSchema,
  serviceTypeSchema,
} from '../schemas/service'
import type { Vehicle } from '../schemas/vehicle'

export function generateServiceRecords(
  count: number,
  { vehicles }: { vehicles: Vehicle[] },
): ServiceRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `SVC-${String(i + 1).padStart(3, '0')}`
    const status = faker.helpers.arrayElement(serviceStatusSchema.options)
    const scheduledDate =
      status === 'completed' ? faker.date.recent({ days: 30 }) : faker.date.soon({ days: 30 })

    return {
      id,
      vehicleId: faker.helpers.arrayElement(vehicles).id,
      serviceType: faker.helpers.arrayElement(serviceTypeSchema.options),
      status,
      priority: faker.helpers.arrayElement(servicePrioritySchema.options),
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
