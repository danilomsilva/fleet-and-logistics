import { faker } from '@faker-js/faker'
import type { Driver } from '../schemas/driver'
import { driverShiftSchema, driverStatusSchema } from '../schemas/driver'

export function generateDrivers(count: number): Driver[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `DRV-${String(i + 1).padStart(3, '0')}`
    const status = faker.helpers.arrayElement(driverStatusSchema.options)

    return {
      id,
      name: faker.person.fullName(),
      status,
      assignedVehicleId: null,
      deliveriesToday: faker.number.int({ min: 0, max: 8 }),
      completedDeliveries: faker.number.int({ min: 0, max: 400 }),
      availability: {
        shift: faker.helpers.arrayElement(driverShiftSchema.options),
      },
      lastActiveAt: faker.date.recent({ days: 3 }).toISOString(),
    }
  })
}
