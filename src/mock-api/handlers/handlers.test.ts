import { describe, expect, it } from 'vitest'
import { db } from '../db'

const BASE = 'http://localhost:3000'

describe('vehicles handlers', () => {
  it('lists vehicles with default pagination', async () => {
    const res = await fetch(`${BASE}/api/vehicles`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.total).toBe(db.vehicles.length)
    expect(body.page).toBe(1)
  })

  it('filters vehicles by status', async () => {
    const target = db.vehicles.find((v) => v.status === 'available')
    if (!target) return
    const res = await fetch(`${BASE}/api/vehicles?status=available&pageSize=200`)
    const body = await res.json()
    expect(body.data.every((v: { status: string }) => v.status === 'available')).toBe(true)
    expect(body.data.some((v: { id: string }) => v.id === target.id)).toBe(true)
  })

  it('searches vehicles by name substring', async () => {
    const target = db.vehicles[0]
    const query = target.name.split(' ')[0].toLowerCase()
    const res = await fetch(`${BASE}/api/vehicles?q=${encodeURIComponent(query)}&pageSize=200`)
    const body = await res.json()
    expect(body.data.some((v: { id: string }) => v.id === target.id)).toBe(true)
  })

  it('sorts vehicles by mileage ascending', async () => {
    const res = await fetch(`${BASE}/api/vehicles?sort=mileage:asc&pageSize=200`)
    const body = await res.json()
    const mileages = body.data.map((v: { mileage: number }) => v.mileage)
    expect(mileages).toEqual([...mileages].sort((a, b) => a - b))
  })

  it('returns a single vehicle by id, 404 for unknown id', async () => {
    const target = db.vehicles[0]
    const ok = await fetch(`${BASE}/api/vehicles/${target.id}`)
    expect(ok.status).toBe(200)
    expect((await ok.json()).id).toBe(target.id)

    const missing = await fetch(`${BASE}/api/vehicles/does-not-exist`)
    expect(missing.status).toBe(404)
  })
})

describe('drivers handlers', () => {
  it('returns 404 for an unknown driver id', async () => {
    const missing = await fetch(`${BASE}/api/drivers/does-not-exist`)
    expect(missing.status).toBe(404)
  })

  it('lists and searches drivers by name', async () => {
    const target = db.drivers[0]
    const query = target.name.split(' ')[0].toLowerCase()
    const res = await fetch(`${BASE}/api/drivers?q=${encodeURIComponent(query)}&pageSize=200`)
    const body = await res.json()
    expect(body.data.some((d: { id: string }) => d.id === target.id)).toBe(true)
  })
})

describe('deliveries handlers', () => {
  it('paginates deliveries and applies the destination filter', async () => {
    const res = await fetch(`${BASE}/api/deliveries?pageSize=5`)
    const body = await res.json()
    expect(body.data.length).toBeLessThanOrEqual(5)
    expect(body.totalPages).toBeGreaterThan(0)

    const target = db.deliveries[0]
    const word = target.destination.label.split(' ')[0]
    const filtered = await fetch(
      `${BASE}/api/deliveries?destination=${encodeURIComponent(word)}&pageSize=200`,
    )
    const filteredBody = await filtered.json()
    expect(filteredBody.data.some((d: { id: string }) => d.id === target.id)).toBe(true)
  })

  it('updates delivery status via the mutation stub', async () => {
    const target = db.deliveries.find((d) => d.status !== 'delivered')
    if (!target) return
    const res = await fetch(`${BASE}/api/deliveries/${target.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'delivered' }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('delivered')
    expect(target.status).toBe('delivered')
  })

  it('rejects an invalid delivery status', async () => {
    const target = db.deliveries[0]
    const res = await fetch(`${BASE}/api/deliveries/${target.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'not-a-real-status' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('maintenance handlers', () => {
  it('filters maintenance records by status', async () => {
    const target = db.maintenanceRecords.find((m) => m.status === 'completed')
    if (!target) return
    const res = await fetch(`${BASE}/api/maintenance?status=completed&pageSize=200`)
    const body = await res.json()
    expect(body.data.some((m: { id: string }) => m.id === target.id)).toBe(true)
  })

  it('updates maintenance status via the mutation stub', async () => {
    const target = db.maintenanceRecords.find((m) => m.status !== 'completed')
    if (!target) return
    const res = await fetch(`${BASE}/api/maintenance/${target.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    })
    expect(res.status).toBe(200)
    expect(target.status).toBe('completed')
  })
})

describe('alerts handlers', () => {
  it('filters alerts by priority', async () => {
    const target = db.alerts.find((a) => a.priority === 'critical')
    if (!target) return
    const res = await fetch(`${BASE}/api/alerts?priority=critical&pageSize=200`)
    const body = await res.json()
    expect(body.data.some((a: { id: string }) => a.id === target.id)).toBe(true)
  })

  it('updates alert status via the mutation stub', async () => {
    const target = db.alerts.find((a) => a.status !== 'resolved')
    if (!target) return
    const res = await fetch(`${BASE}/api/alerts/${target.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved' }),
    })
    expect(res.status).toBe(200)
    expect(target.status).toBe('resolved')
  })
})

describe('activity handlers', () => {
  it('filters activity events by related entity', async () => {
    const target = db.activity[0]
    const res = await fetch(
      `${BASE}/api/activity?entityKind=${target.relatedEntity.kind}&entityId=${target.relatedEntity.id}&pageSize=200`,
    )
    const body = await res.json()
    expect(body.data.length).toBeGreaterThan(0)
    expect(
      body.data.every(
        (a: { relatedEntity: { kind: string; id: string } }) =>
          a.relatedEntity.kind === target.relatedEntity.kind &&
          a.relatedEntity.id === target.relatedEntity.id,
      ),
    ).toBe(true)
  })
})

describe('dispatch handlers', () => {
  it('assigns a driver and vehicle to a pending delivery', async () => {
    const target = db.deliveries.find((d) => d.status === 'pending')
    if (!target) return
    const driver = db.drivers[0]
    const vehicle = db.vehicles[0]

    const res = await fetch(`${BASE}/api/dispatch/assign`, {
      method: 'POST',
      body: JSON.stringify({ deliveryId: target.id, driverId: driver.id, vehicleId: vehicle.id }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.driverId).toBe(driver.id)
    expect(body.vehicleId).toBe(vehicle.id)
    expect(body.status).toBe('assigned')
  })

  it('404s for an unknown delivery', async () => {
    const res = await fetch(`${BASE}/api/dispatch/assign`, {
      method: 'POST',
      body: JSON.stringify({
        deliveryId: 'nope',
        driverId: db.drivers[0].id,
        vehicleId: db.vehicles[0].id,
      }),
    })
    expect(res.status).toBe(404)
  })
})
