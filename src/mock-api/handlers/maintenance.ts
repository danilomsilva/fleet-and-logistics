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
import { maintenanceInputSchema, maintenanceStatusSchema } from '../schemas/maintenance'
import { computeVehicleMaintenanceStatus } from '../maintenance-status'

function applyDateFilter(items: MaintenanceRecord[], url: URL): MaintenanceRecord[] {
  const date = url.searchParams.get('date')
  if (!date) return items
  return items.filter((item) => item.scheduledDate.startsWith(date))
}

function nextMaintenanceId(): string {
  const max = db.maintenanceRecords.reduce((acc, m) => {
    const n = Number(m.id.replace('MNT-', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `MNT-${String(max + 1).padStart(3, '0')}`
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

  http.post('/api/maintenance', async ({ request }) => {
    await randomDelay()
    const body = await request.json()
    const result = maintenanceInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid maintenance record', issues: result.error.issues },
        { status: 400 },
      )
    }

    const input = result.data
    const record: MaintenanceRecord = {
      id: nextMaintenanceId(),
      vehicleId: input.vehicleId,
      maintenanceType: input.maintenanceType,
      status: 'scheduled',
      priority: input.priority,
      description: input.description,
      scheduledDate: input.scheduledDate,
      completionDate: null,
      mileage: input.mileage,
      notes: input.notes,
    }
    db.maintenanceRecords.push(record)

    return HttpResponse.json(record, { status: 201 })
  }),

  http.patch('/api/maintenance/:id', async ({ params, request }) => {
    await randomDelay()
    const record = db.maintenanceRecords.find((m) => m.id === params.id)
    if (!record) {
      return HttpResponse.json(
        { message: `Maintenance record ${params.id} not found` },
        { status: 404 },
      )
    }

    const body = await request.json()
    const result = maintenanceInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid maintenance record', issues: result.error.issues },
        { status: 400 },
      )
    }

    Object.assign(record, result.data)

    return HttpResponse.json(record)
  }),

  http.delete('/api/maintenance/:id', async ({ params }) => {
    await randomDelay()
    const index = db.maintenanceRecords.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { message: `Maintenance record ${params.id} not found` },
        { status: 404 },
      )
    }

    db.maintenanceRecords.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
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

    const vehicle = db.vehicles.find((v) => v.id === record.vehicleId)
    if (result.data === 'in_progress' && vehicle && !vehicle.driverId) {
      return HttpResponse.json(
        { message: 'Assign a driver to this vehicle before starting maintenance' },
        { status: 400 },
      )
    }

    record.status = result.data
    record.completionDate = result.data === 'completed' ? new Date().toISOString() : null

    if (vehicle) {
      if (result.data === 'in_progress') {
        vehicle.status = 'maintenance'
      } else if (result.data === 'completed' && vehicle.status === 'maintenance') {
        vehicle.status = 'available'
      }
      vehicle.maintenanceStatus = computeVehicleMaintenanceStatus(vehicle)
    }

    return HttpResponse.json(record)
  }),
]
