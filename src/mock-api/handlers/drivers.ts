import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'
import { db } from '../db'
import {
  applyExactFilters,
  applySort,
  applyTextSearch,
  paginate,
  parsePageParams,
  randomDelay,
} from './query-utils'
import type { Driver } from '../schemas/driver'
import { driverInputSchema, driverShiftSchema, driverStatusSchema } from '../schemas/driver'

function nextDriverId(): string {
  const max = db.drivers.reduce((acc, d) => {
    const n = Number(d.id.replace('DRV-', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `DRV-${String(max + 1).padStart(3, '0')}`
}

/** Keeps vehicle.driverId in sync when a driver's assigned vehicle changes,
 * including stealing the vehicle away from whichever other driver (if any)
 * currently claims it. */
function relinkVehicle(
  driverId: string,
  previousVehicleId: string | null,
  nextVehicleId: string | null,
) {
  if (previousVehicleId === nextVehicleId) return
  if (previousVehicleId) {
    const previous = db.vehicles.find((v) => v.id === previousVehicleId)
    if (previous && previous.driverId === driverId) previous.driverId = null
  }
  if (nextVehicleId) {
    const next = db.vehicles.find((v) => v.id === nextVehicleId)
    if (next) {
      if (next.driverId && next.driverId !== driverId) {
        const otherDriver = db.drivers.find((d) => d.id === next.driverId)
        if (otherDriver) otherDriver.assignedVehicleId = null
      }
      next.driverId = driverId
    }
  }
}

/** 'driving' and the vehicle's 'in_use' are two sides of the same fact —
 * keeps the assigned vehicle's status in sync whenever a driver's status is
 * set directly (edit form, bulk actions), not just through the dedicated
 * assign/deliver flows that already handle both sides together. */
function syncVehicleStatus(driver: Driver, previousStatus: Driver['status']) {
  if (!driver.assignedVehicleId) return
  const vehicle = db.vehicles.find((v) => v.id === driver.assignedVehicleId)
  if (!vehicle) return

  if (driver.status === 'driving' && previousStatus !== 'driving') {
    vehicle.status = 'in_use'
  } else if (
    driver.status !== 'driving' &&
    previousStatus === 'driving' &&
    vehicle.status === 'in_use'
  ) {
    vehicle.status = 'available'
  }
}

export const driverHandlers = [
  http.get('/api/drivers', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: Driver[] = [...db.drivers]
    items = applyTextSearch(items, url, ['name'])
    items = applyExactFilters(items, url, ['status', 'assignedVehicleId'])
    items = applySort(items, url, [
      'name',
      'deliveriesToday',
      'completedDeliveries',
      'lastActiveAt',
    ])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),

  http.get('/api/drivers/:id', async ({ params }) => {
    await randomDelay()
    const driver = db.drivers.find((d) => d.id === params.id)
    if (!driver) {
      return HttpResponse.json({ message: `Driver ${params.id} not found` }, { status: 404 })
    }
    return HttpResponse.json(driver)
  }),

  http.post('/api/drivers', async ({ request }) => {
    await randomDelay()
    const body = await request.json()
    const result = driverInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid driver', issues: result.error.issues },
        { status: 400 },
      )
    }

    const input = result.data
    const driver: Driver = {
      id: nextDriverId(),
      name: input.name,
      status: input.status,
      assignedVehicleId: input.assignedVehicleId,
      deliveriesToday: 0,
      completedDeliveries: 0,
      availability: {
        shift: faker.helpers.arrayElement(driverShiftSchema.options),
      },
      lastActiveAt: new Date().toISOString(),
    }
    db.drivers.push(driver)
    relinkVehicle(driver.id, null, driver.assignedVehicleId)
    syncVehicleStatus(driver, 'available')

    return HttpResponse.json(driver, { status: 201 })
  }),

  http.patch('/api/drivers/:id', async ({ params, request }) => {
    await randomDelay()
    const driver = db.drivers.find((d) => d.id === params.id)
    if (!driver) {
      return HttpResponse.json({ message: `Driver ${params.id} not found` }, { status: 404 })
    }

    const body = await request.json()
    const result = driverInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid driver', issues: result.error.issues },
        { status: 400 },
      )
    }

    const input = result.data
    const previousStatus = driver.status
    relinkVehicle(driver.id, driver.assignedVehicleId, input.assignedVehicleId)
    Object.assign(driver, input, { lastActiveAt: new Date().toISOString() })
    syncVehicleStatus(driver, previousStatus)

    return HttpResponse.json(driver)
  }),

  http.delete('/api/drivers/:id', async ({ params }) => {
    await randomDelay()
    const index = db.drivers.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: `Driver ${params.id} not found` }, { status: 404 })
    }

    const [driver] = db.drivers.splice(index, 1)
    relinkVehicle(driver.id, driver.assignedVehicleId, null)

    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/drivers/:id/status', async ({ params, request }) => {
    await randomDelay()
    const driver = db.drivers.find((d) => d.id === params.id)
    if (!driver) {
      return HttpResponse.json({ message: `Driver ${params.id} not found` }, { status: 404 })
    }

    const body = await request.json()
    const result = driverStatusSchema.safeParse((body as { status?: unknown })?.status)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid driver status' }, { status: 400 })
    }

    const previousStatus = driver.status
    driver.status = result.data
    syncVehicleStatus(driver, previousStatus)
    return HttpResponse.json(driver)
  }),
]
