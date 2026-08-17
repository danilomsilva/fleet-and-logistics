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
]
