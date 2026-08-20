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
import type { Vehicle } from '../schemas/vehicle'
import { vehicleInputSchema, vehicleStatusSchema } from '../schemas/vehicle'
import { irishTownGeoPoint, warehouseGeoPoint } from '../generators/geo'
import { computeVehicleServiceStatus } from '../service-status'

function nextVehicleId(): string {
  const max = db.vehicles.reduce((acc, v) => {
    const n = Number(v.id.replace('VH-', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `VH-${String(max + 1).padStart(3, '0')}`
}

/** Keeps driver.assignedVehicleId in sync when a vehicle's driver changes. */
function relinkDriver(
  vehicleId: string,
  previousDriverId: string | null,
  nextDriverId: string | null,
) {
  if (previousDriverId === nextDriverId) return
  if (previousDriverId) {
    const previous = db.drivers.find((d) => d.id === previousDriverId)
    if (previous && previous.assignedVehicleId === vehicleId) previous.assignedVehicleId = null
  }
  if (nextDriverId) {
    const next = db.drivers.find((d) => d.id === nextDriverId)
    if (next) next.assignedVehicleId = vehicleId
  }
}

/** 'in_use' and its driver's 'driving' are two sides of the same fact — keeps
 * the assigned driver's status in sync whenever a vehicle's status is set
 * directly (edit form, bulk actions), not just through the dedicated
 * assign/deliver flows that already handle both sides together. */
function syncDriverStatus(vehicle: Vehicle, previousStatus: Vehicle['status']) {
  if (!vehicle.driverId) return
  const driver = db.drivers.find((d) => d.id === vehicle.driverId)
  if (!driver) return

  if (vehicle.status === 'in_use' && previousStatus !== 'in_use') {
    driver.status = 'driving'
  } else if (
    vehicle.status !== 'in_use' &&
    previousStatus === 'in_use' &&
    driver.status === 'driving'
  ) {
    driver.status = 'available'
  }
}

export const vehicleHandlers = [
  http.get('/api/vehicles', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: Vehicle[] = [...db.vehicles]
    items = applyTextSearch(items, url, ['name', 'registration'])
    items = applyExactFilters(items, url, ['status', 'type', 'driverId', 'serviceStatus'])
    items = applySort(items, url, ['name', 'mileage', 'nextServiceDate', 'lastUpdatedAt'])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),

  http.get('/api/vehicles/:id', async ({ params }) => {
    await randomDelay()
    const vehicle = db.vehicles.find((v) => v.id === params.id)
    if (!vehicle) {
      return HttpResponse.json({ message: `Vehicle ${params.id} not found` }, { status: 404 })
    }
    return HttpResponse.json(vehicle)
  }),

  http.post('/api/vehicles', async ({ request }) => {
    await randomDelay()
    const body = await request.json()
    const result = vehicleInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid vehicle', issues: result.error.issues },
        {
          status: 400,
        },
      )
    }

    const input = result.data
    const id = nextVehicleId()
    const nextServiceDate = faker.date.soon({ days: 60 }).toISOString()
    const vehicle: Vehicle = {
      id,
      name: input.name,
      registration: input.registration,
      type: input.type,
      status: input.status,
      driverId: input.driverId,
      location: input.status === 'broken' ? warehouseGeoPoint() : irishTownGeoPoint(),
      mileage: input.mileage,
      nextServiceDate,
      serviceStatus: computeVehicleServiceStatus({ nextServiceDate }),
      lastUpdatedAt: new Date().toISOString(),
    }
    db.vehicles.push(vehicle)
    relinkDriver(vehicle.id, null, vehicle.driverId)
    syncDriverStatus(vehicle, 'available')

    return HttpResponse.json(vehicle, { status: 201 })
  }),

  http.patch('/api/vehicles/:id', async ({ params, request }) => {
    await randomDelay()
    const vehicle = db.vehicles.find((v) => v.id === params.id)
    if (!vehicle) {
      return HttpResponse.json({ message: `Vehicle ${params.id} not found` }, { status: 404 })
    }

    const body = await request.json()
    const result = vehicleInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid vehicle', issues: result.error.issues },
        {
          status: 400,
        },
      )
    }

    const input = result.data
    const previousStatus = vehicle.status
    relinkDriver(vehicle.id, vehicle.driverId, input.driverId)
    Object.assign(vehicle, input, { lastUpdatedAt: new Date().toISOString() })
    vehicle.serviceStatus = computeVehicleServiceStatus(vehicle)
    if (vehicle.status === 'broken') vehicle.location = warehouseGeoPoint()
    syncDriverStatus(vehicle, previousStatus)

    return HttpResponse.json(vehicle)
  }),

  http.delete('/api/vehicles/:id', async ({ params }) => {
    await randomDelay()
    const index = db.vehicles.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: `Vehicle ${params.id} not found` }, { status: 404 })
    }

    const [vehicle] = db.vehicles.splice(index, 1)
    relinkDriver(vehicle.id, vehicle.driverId, null)
    db.serviceRecords = db.serviceRecords.filter((m) => m.vehicleId !== vehicle.id)

    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/vehicles/:id/status', async ({ params, request }) => {
    await randomDelay()
    const vehicle = db.vehicles.find((v) => v.id === params.id)
    if (!vehicle) {
      return HttpResponse.json({ message: `Vehicle ${params.id} not found` }, { status: 404 })
    }

    const body = await request.json()
    const result = vehicleStatusSchema.safeParse((body as { status?: unknown })?.status)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid vehicle status' }, { status: 400 })
    }

    const previousStatus = vehicle.status
    vehicle.status = result.data
    if (vehicle.status === 'broken') vehicle.location = warehouseGeoPoint()
    vehicle.serviceStatus = computeVehicleServiceStatus(vehicle)
    syncDriverStatus(vehicle, previousStatus)
    return HttpResponse.json(vehicle)
  }),
]
