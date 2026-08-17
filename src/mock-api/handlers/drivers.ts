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
import type { Driver } from '../schemas/driver'

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
]
