import { faker } from '@faker-js/faker'
import type { ServiceRecord } from '../schemas/service'
import { servicePrioritySchema, serviceTypeSchema } from '../schemas/service'
import type { Vehicle } from '../schemas/vehicle'
import { computeServiceRecordStatus } from '../service-status'

type Lifecycle = 'not_started' | 'in_progress' | 'completed'

const NOT_IN_SERVICE_LIFECYCLE_WEIGHTS: {
  value: Exclude<Lifecycle, 'in_progress'>
  weight: number
}[] = [
  { value: 'not_started', weight: 2 },
  { value: 'completed', weight: 1 },
]

export function generateServiceRecords(
  count: number,
  { vehicles }: { vehicles: Vehicle[] },
): ServiceRecord[] {
  const now = new Date()
  // Round-robin across a shuffled vehicle order rather than picking randomly
  // with replacement, so records spread evenly across the fleet instead of
  // clustering multiple pending records onto the same vehicle.
  const shuffledVehicles = faker.helpers.shuffle(vehicles)

  return Array.from({ length: count }, (_, i) => {
    const id = `SVC-${String(i + 1).padStart(3, '0')}`
    const vehicle = shuffledVehicles[i % shuffledVehicles.length]
    // A vehicle already shown as 'Service' in the Vehicles table must have
    // its service record read as 'In progress' — the two are the same fact.
    const lifecycle: Lifecycle =
      vehicle.status === 'service'
        ? 'in_progress'
        : faker.helpers.weightedArrayElement(NOT_IN_SERVICE_LIFECYCLE_WEIGHTS)

    let scheduledDate: Date
    if (lifecycle === 'completed') {
      scheduledDate = faker.date.recent({ days: 30, refDate: now })
    } else if (lifecycle === 'in_progress') {
      scheduledDate = faker.date.recent({ days: 5, refDate: now })
    } else {
      // Spans overdue, due-soon, and far-future scheduled dates, so status
      // (derived below) naturally lands as a mix of 'due' and 'scheduled'.
      scheduledDate = faker.date.between({
        from: faker.date.recent({ days: 20, refDate: now }),
        to: faker.date.soon({ days: 60, refDate: now }),
      })
    }

    const status =
      lifecycle === 'completed'
        ? 'completed'
        : lifecycle === 'in_progress'
          ? 'in_progress'
          : computeServiceRecordStatus(
              { status: 'scheduled', scheduledDate: scheduledDate.toISOString() },
              now,
            )

    return {
      id,
      vehicleId: vehicle.id,
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
