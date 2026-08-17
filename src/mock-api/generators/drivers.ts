import { faker } from '@faker-js/faker'
import type { Driver } from '../schemas/driver'
import { driverStatusSchema } from '../schemas/driver'

const SHIFTS = [
  { shiftStart: '06:00', shiftEnd: '14:00' },
  { shiftStart: '08:00', shiftEnd: '17:00' },
  { shiftStart: '14:00', shiftEnd: '22:00' },
]

export function generateDrivers(count: number): Driver[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `DRV-${String(i + 1).padStart(3, '0')}`
    const status = faker.helpers.arrayElement(driverStatusSchema.options)
    const shift = faker.helpers.arrayElement(SHIFTS)

    return {
      id,
      name: faker.person.fullName(),
      status,
      assignedVehicleId: null,
      deliveriesToday: faker.number.int({ min: 0, max: 8 }),
      completedDeliveries: faker.number.int({ min: 0, max: 400 }),
      availability: {
        onShift: status !== 'offline',
        ...shift,
      },
      lastActiveAt: faker.date.recent({ days: 3 }).toISOString(),
    }
  })
}
