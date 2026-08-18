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
import type { MaintenanceRecord } from '../schemas/maintenance'
import { maintenanceStatusSchema } from '../schemas/maintenance'

function applyDateFilter(items: MaintenanceRecord[], url: URL): MaintenanceRecord[] {
  const date = url.searchParams.get('date')
  if (!date) return items
  return items.filter((item) => item.scheduledDate.startsWith(date))
}

export const maintenanceHandlers = [
  http.get('/api/maintenance', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: MaintenanceRecord[] = [...db.maintenanceRecords]
    items = applyTextSearch(items, url, ['description'])
    items = applyExactFilters(items, url, ['status', 'vehicleId', 'maintenanceType', 'priority'])
    items = applyDateFilter(items, url)
    items = applySort(items, url, ['scheduledDate', 'priority', 'mileage'])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),

  http.get('/api/maintenance/:id', async ({ params }) => {
    await randomDelay()
    const record = db.maintenanceRecords.find((m) => m.id === params.id)
    if (!record) {
      return HttpResponse.json(
        { message: `Maintenance record ${params.id} not found` },
        { status: 404 },
      )
    }
    return HttpResponse.json(record)
  }),

  http.patch('/api/maintenance/:id/status', async ({ params, request }) => {
    await randomDelay()
    const record = db.maintenanceRecords.find((m) => m.id === params.id)
    if (!record) {
      return HttpResponse.json(
        { message: `Maintenance record ${params.id} not found` },
        { status: 404 },
      )
    }

    const body = await request.json()
    const result = maintenanceStatusSchema.safeParse((body as { status?: unknown })?.status)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid maintenance status' }, { status: 400 })
    }

    record.status = result.data
    record.completionDate = result.data === 'completed' ? new Date().toISOString() : null
    return HttpResponse.json(record)
  }),
]
