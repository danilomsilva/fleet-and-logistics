import { http, HttpResponse } from 'msw'
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
import { vehicleStatusSchema } from '../schemas/vehicle'

export const vehicleHandlers = [
  http.get('/api/vehicles', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: Vehicle[] = [...db.vehicles]
    items = applyTextSearch(items, url, ['name', 'registration'])
    items = applyExactFilters(items, url, ['status', 'type', 'driverId', 'maintenanceStatus'])
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

    vehicle.status = result.data
    return HttpResponse.json(vehicle)
  }),
]
