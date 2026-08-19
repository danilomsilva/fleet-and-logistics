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

  it('creates a vehicle and rejects an invalid payload', async () => {
    const countBefore = db.vehicles.length
    const res = await fetch(`${BASE}/api/vehicles`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Van',
        registration: '26-TEST-1',
        type: 'van',
        status: 'available',
        driverId: null,
        mileage: 1000,
      }),
    })
    expect(res.status).toBe(201)
    const created = await res.json()
    expect(created.name).toBe('Test Van')
    expect(db.vehicles.length).toBe(countBefore + 1)

    const invalid = await fetch(`${BASE}/api/vehicles`, {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    })
    expect(invalid.status).toBe(400)
  })

  it('updates a vehicle, relinking driver assignment, and 404s for unknown id', async () => {
    const vehicle = db.vehicles.find((v) => v.driverId === null)
    if (!vehicle) return
    const driver = db.drivers.find((d) => d.assignedVehicleId === null)
    if (!driver) return

    const res = await fetch(`${BASE}/api/vehicles/${vehicle.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Renamed Vehicle',
        registration: vehicle.registration,
        type: vehicle.type,
        status: vehicle.status,
        driverId: driver.id,
        mileage: vehicle.mileage,
      }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()).name).toBe('Renamed Vehicle')
    expect(driver.assignedVehicleId).toBe(vehicle.id)

    const missing = await fetch(`${BASE}/api/vehicles/does-not-exist`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'x',
        registration: 'x',
        type: 'van',
        status: 'available',
        driverId: null,
        mileage: 0,
      }),
    })
    expect(missing.status).toBe(404)
  })

  it('deletes a vehicle and unlinks its driver', async () => {
    const vehicle = db.vehicles.find((v) => v.driverId !== null)
    if (!vehicle) return
    const driver = db.drivers.find((d) => d.id === vehicle.driverId)!

    const res = await fetch(`${BASE}/api/vehicles/${vehicle.id}`, { method: 'DELETE' })
    expect(res.status).toBe(204)
    expect(db.vehicles.find((v) => v.id === vehicle.id)).toBeUndefined()
    expect(driver.assignedVehicleId).toBeNull()

    const missing = await fetch(`${BASE}/api/vehicles/${vehicle.id}`, { method: 'DELETE' })
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

  it('creates a driver and rejects an invalid payload', async () => {
    const countBefore = db.drivers.length
    const res = await fetch(`${BASE}/api/drivers`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Driver', status: 'available', assignedVehicleId: null }),
    })
    expect(res.status).toBe(201)
    const created = await res.json()
    expect(created.name).toBe('Test Driver')
    expect(db.drivers.length).toBe(countBefore + 1)

    const invalid = await fetch(`${BASE}/api/drivers`, {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    })
    expect(invalid.status).toBe(400)
  })

  it('updates a driver, relinking the assigned vehicle away from any other driver', async () => {
    const driver = db.drivers.find((d) => d.assignedVehicleId === null)
    const vehicle = db.vehicles.find((v) => v.driverId !== null)
    if (!driver || !vehicle) return
    const previousDriver = db.drivers.find((d) => d.id === vehicle.driverId)!

    const res = await fetch(`${BASE}/api/drivers/${driver.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: driver.name,
        status: driver.status,
        assignedVehicleId: vehicle.id,
      }),
    })
    expect(res.status).toBe(200)
    expect(vehicle.driverId).toBe(driver.id)
    expect(previousDriver.assignedVehicleId).toBeNull()

    const missing = await fetch(`${BASE}/api/drivers/does-not-exist`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'x', status: 'available', assignedVehicleId: null }),
    })
    expect(missing.status).toBe(404)
  })

  it('deletes a driver and unlinks their vehicle', async () => {
    const driver = db.drivers.find((d) => d.assignedVehicleId !== null)
    if (!driver) return
    const vehicle = db.vehicles.find((v) => v.id === driver.assignedVehicleId)!

    const res = await fetch(`${BASE}/api/drivers/${driver.id}`, { method: 'DELETE' })
    expect(res.status).toBe(204)
    expect(db.drivers.find((d) => d.id === driver.id)).toBeUndefined()
    expect(vehicle.driverId).toBeNull()

    const missing = await fetch(`${BASE}/api/drivers/${driver.id}`, { method: 'DELETE' })
    expect(missing.status).toBe(404)
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

  it('frees the driver and vehicle back to available once a delivery is delivered', async () => {
    const target = db.deliveries.find((d) => d.status === 'in_transit' && d.driverId && d.vehicleId)
    if (!target) return
    const driver = db.drivers.find((d) => d.id === target.driverId)!
    const vehicle = db.vehicles.find((v) => v.id === target.vehicleId)!
    driver.status = 'driving'
    vehicle.status = 'in_use'

    const res = await fetch(`${BASE}/api/deliveries/${target.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'delivered' }),
    })
    expect(res.status).toBe(200)
    expect(driver.status).toBe('available')
    expect(vehicle.status).toBe('available')
    // The pairing itself is untouched - still that driver's regular vehicle.
    expect(driver.assignedVehicleId).toBe(vehicle.id)
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
  it('assigns a driver and vehicle to a pending delivery, and links them to each other', async () => {
    const target = db.deliveries.find((d) => d.status === 'pending')
    if (!target) return
    const driver = db.drivers.find((d) => d.assignedVehicleId === null)
    const vehicle = db.vehicles.find((v) => v.driverId === null)
    if (!driver || !vehicle) return

    const res = await fetch(`${BASE}/api/dispatch/assign`, {
      method: 'POST',
      body: JSON.stringify({ deliveryId: target.id, driverId: driver.id, vehicleId: vehicle.id }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.driverId).toBe(driver.id)
    expect(body.vehicleId).toBe(vehicle.id)
    expect(body.status).toBe('assigned')

    // The assignment must also show up on the driver's and vehicle's own
    // records, not just the delivery — this was the actual bug.
    expect(driver.assignedVehicleId).toBe(vehicle.id)
    expect(vehicle.driverId).toBe(driver.id)
    expect(driver.status).toBe('driving')
    expect(vehicle.status).toBe('in_use')
  })

  it('assigning a vehicle already linked to another driver steals it away from them', async () => {
    const target = db.deliveries.find((d) => d.status === 'pending')
    const newDriver = db.drivers.find((d) => d.assignedVehicleId === null)
    const contestedVehicle = db.vehicles.find((v) => v.driverId !== null)
    if (!target || !newDriver || !contestedVehicle) return
    const previousDriver = db.drivers.find((d) => d.id === contestedVehicle.driverId)!

    const res = await fetch(`${BASE}/api/dispatch/assign`, {
      method: 'POST',
      body: JSON.stringify({
        deliveryId: target.id,
        driverId: newDriver.id,
        vehicleId: contestedVehicle.id,
      }),
    })
    expect(res.status).toBe(200)
    expect(contestedVehicle.driverId).toBe(newDriver.id)
    expect(previousDriver.assignedVehicleId).toBeNull()
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
