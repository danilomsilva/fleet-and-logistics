import { faker } from '@faker-js/faker'
import type { Vehicle, VehicleStatus } from '../schemas/vehicle'
import { irishTownGeoPoint, warehouseGeoPoint } from './geo'

const IRISH_VAN_MODELS: [string, string][] = [
  ['Ford', 'Transit'],
  ['Ford', 'Transit Custom'],
  ['Volkswagen', 'Transporter'],
  ['Volkswagen', 'Crafter'],
  ['Mercedes-Benz', 'Sprinter'],
  ['Mercedes-Benz', 'Vito'],
  ['Renault', 'Master'],
  ['Renault', 'Trafic'],
  ['Peugeot', 'Boxer'],
  ['Peugeot', 'Expert'],
  ['Citroën', 'Relay'],
  ['Citroën', 'Berlingo'],
  ['Iveco', 'Daily'],
  ['Opel', 'Vivaro'],
  ['Opel', 'Movano'],
  ['Fiat', 'Ducato'],
  ['Toyota', 'Proace'],
  ['Nissan', 'Primastar'],
]

const REGULAR_STATUSES: VehicleStatus[] = ['available', 'in_use']

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function generateVehicles(count: number): Vehicle[] {
  const today = startOfDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Exactly 1 broken vehicle (also overdue), 1 more overdue vehicle, and 2
  // vehicles due today — only those 2 have status 'service' ('Service').
  const [brokenIndex, pastIndex, serviceIndexA, serviceIndexB] = faker.helpers.arrayElements(
    Array.from({ length: count }, (_, i) => i),
    4,
  )

  return Array.from({ length: count }, (_, i) => {
    const [make, model] = faker.helpers.arrayElement(IRISH_VAN_MODELS)
    const isBroken = i === brokenIndex
    const isPastDue = i === pastIndex
    const isInService = i === serviceIndexA || i === serviceIndexB

    let status: VehicleStatus
    if (isBroken) status = 'broken'
    else if (isInService) status = 'service'
    else status = faker.helpers.arrayElement(REGULAR_STATUSES)

    let nextServiceDate: Date
    if (isBroken || isPastDue) {
      nextServiceDate = faker.date.recent({ days: 10, refDate: today })
    } else if (isInService) {
      nextServiceDate = today
    } else {
      nextServiceDate = faker.date.soon({ days: 60, refDate: tomorrow })
    }

    return {
      id: `VH-${String(i + 1).padStart(3, '0')}`,
      name: `${make} ${model}`,
      registration: faker.vehicle.vrm(),
      type: 'van',
      status,
      driverId: null,
      location: isBroken ? warehouseGeoPoint() : irishTownGeoPoint(),
      mileage: faker.number.int({ min: 1_000, max: 150_000 }),
      nextServiceDate: nextServiceDate.toISOString(),
      serviceStatus: 'up_to_date',
      lastUpdatedAt: faker.date.recent({ days: 7 }).toISOString(),
    }
  })
}
