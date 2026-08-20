import { test, expect } from '@playwright/test'

test('Dispatch shows the map and the new deliveries panel', async ({ page }) => {
  await page.goto('/dispatch')
  await expect(page.getByRole('heading', { name: 'Dispatch' })).toBeVisible()
  await expect(page.getByText('New deliveries available')).toBeVisible()
  await expect(page.getByRole('img', { name: /Map of deliveries/ })).toBeVisible()
})

test('the MapLibre worker loads and actually fetches basemap tiles (not just the background layer)', async ({
  page,
}) => {
  // Regression test: maplibre-gl-worker.mjs has its own relative import
  // (./maplibre-gl-shared.mjs) that a plain `?url` import silently breaks —
  // the worker gets created, then dies with no visible error, and only the
  // workerless background paint layer renders (no land/borders/labels).
  const tileRequests: string[] = []
  page.on('response', (res) => {
    if (res.url().includes('.pbf') && res.url().includes('demotiles')) {
      tileRequests.push(res.url())
    }
  })

  await page.goto('/dispatch')
  await expect(page.getByRole('img', { name: /Map of deliveries/ })).toBeVisible()
  // Real network calls to the public demo tile server, so give this more
  // headroom than a local-only assertion needs (CI runners can be slower).
  await expect.poll(() => tileRequests.length, { timeout: 20000 }).toBeGreaterThan(0)

  const workers = page.workers()
  expect(workers.some((w) => w.url().includes('maplibre-gl-worker'))).toBe(true)
})

test('assigning a delivery through the wizard walks driver -> review and confirms', async ({
  page,
}) => {
  await page.goto('/dispatch')
  await expect(page.getByText('New deliveries available')).toBeVisible()

  // Pick a new delivery for which at least one available driver's own
  // assigned vehicle matches the required type (not every type has stock in
  // the seeded dataset), the same way e2e/deliveries.spec.ts does, so the
  // driver step never lands empty.
  const target = await page.evaluate(async () => {
    const deliveriesRes = await fetch('/api/deliveries?status=new&pageSize=200')
    const deliveries = (await deliveriesRes.json()).data
    const driversRes = await fetch('/api/drivers?status=available&pageSize=200')
    const drivers = (await driversRes.json()).data
    const vehiclesRes = await fetch('/api/vehicles?status=available&pageSize=200')
    const vehicleById = new Map(
      (await vehiclesRes.json()).data.map((v: { id: string }) => [v.id, v]),
    )
    for (const delivery of deliveries) {
      const hasEligibleDriver = drivers.some((d: { assignedVehicleId: string | null }) => {
        const vehicle = d.assignedVehicleId ? vehicleById.get(d.assignedVehicleId) : null
        return vehicle && (vehicle as { type: string }).type === delivery.requiredVehicleType
      })
      if (hasEligibleDriver) return delivery.id
    }
    return null
  })
  expect(target).not.toBeNull()

  const row = page.locator('li', { hasText: target! })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: 'Assign' }).click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('Driver', { exact: true })).toBeVisible()

  const driverButtons = page.getByRole('dialog').locator('ul button')
  await expect(driverButtons.first()).toBeVisible()
  await driverButtons.first().click()

  await expect(page.getByText('Review', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm assignment' }).click()

  await expect(page.getByText(/assigned successfully/)).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('assigning via Dispatch also updates the driver and vehicle records themselves, not just the delivery', async ({
  page,
}) => {
  // Regression test: the assign handler used to only set driverId/vehicleId
  // on the delivery — the driver's and vehicle's own records still showed
  // "unassigned"/"available" afterwards, and the driver stayed selectable
  // for a second delivery at the same time.
  await page.goto('/dispatch')
  await expect(page.getByText('New deliveries available')).toBeVisible()

  const target = await page.evaluate(async () => {
    const deliveriesRes = await fetch('/api/deliveries?status=new&pageSize=200')
    const deliveries = (await deliveriesRes.json()).data
    const driversRes = await fetch('/api/drivers?status=available&pageSize=200')
    const drivers = (await driversRes.json()).data
    const vehiclesRes = await fetch('/api/vehicles?status=available&pageSize=200')
    const vehicleById = new Map(
      (await vehiclesRes.json()).data.map((v: { id: string }) => [v.id, v]),
    )
    for (const delivery of deliveries) {
      const hasEligibleDriver = drivers.some((d: { assignedVehicleId: string | null }) => {
        const vehicle = d.assignedVehicleId ? vehicleById.get(d.assignedVehicleId) : null
        return vehicle && (vehicle as { type: string }).type === delivery.requiredVehicleType
      })
      if (hasEligibleDriver) return delivery.id
    }
    return null
  })
  expect(target).not.toBeNull()

  const row = page.locator('li', { hasText: target! })
  await row.getByRole('button', { name: 'Assign' }).click()

  const dialog = page.getByRole('dialog')
  await dialog.locator('ul button').first().click()

  // Read the confirmed selection back from the Review step's own summary
  // rather than the option list beforehand — the list can legitimately
  // reorder between reading its text and clicking it (a background
  // refetch), which would otherwise make this assertion flaky.
  await expect(page.getByText('Review', { exact: true })).toBeVisible()
  const driverName = (await page.getByText('Driver:').locator('..').innerText())
    .replace('Driver:', '')
    .trim()
  const vehicleName = (await page.getByText('Vehicle:').locator('..').innerText())
    .replace('Vehicle:', '')
    .trim()

  await page.getByRole('button', { name: 'Confirm assignment' }).click()
  await expect(page.getByText(/assigned successfully/)).toBeVisible()

  // In-app navigation (not page.goto — a full reload resets the in-memory
  // mock backend to its seeded state, which is a separate, expected
  // characteristic of this demo app, not what this test is checking).
  await page.getByRole('link', { name: 'Drivers' }).click()
  await page.getByPlaceholder('Search drivers…').fill(driverName)
  const driverRow = page.locator('tbody tr', { hasText: driverName })
  await expect(driverRow.getByText('Driving')).toBeVisible()
  await expect(driverRow.getByText(vehicleName)).toBeVisible()

  await page.getByRole('link', { name: 'Vehicles' }).click()
  await page.getByPlaceholder('Search vehicles…').fill(vehicleName)
  const vehicleRow = page.locator('tbody tr', { hasText: vehicleName })
  await expect(vehicleRow.getByText('In use')).toBeVisible()
})
