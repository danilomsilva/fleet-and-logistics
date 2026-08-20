import { test, expect } from '@playwright/test'

test('Deliveries table renders and filters are reflected in the URL and persist on reload', async ({
  page,
}) => {
  await page.goto('/deliveries')
  await expect(page.getByRole('columnheader', { name: 'Delivery ID' })).toBeVisible()

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('menuitemradio', { name: 'New', exact: true }).click()
  await expect(page).toHaveURL(/status=new/)
  await expect(page.getByRole('button', { name: 'Filters 1' })).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(/status=new/)
  await expect(page.getByRole('button', { name: 'Filters 1' })).toBeVisible()
  await page.getByRole('button', { name: 'Filters 1' }).click()
  await expect(page.getByRole('menuitemradio', { name: 'New', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  )
})

test('assign dialog shows a clear message when no matching vehicles are available', async ({
  page,
}) => {
  await page.goto('/deliveries?status=new')
  await expect(page.getByRole('columnheader', { name: 'Delivery ID' })).toBeVisible()

  await page.evaluate(async () => {
    const vehiclesRes = await fetch('/api/vehicles?pageSize=200')
    const vehicles = (await vehiclesRes.json()).data
    await Promise.all(
      vehicles.map((v: { id: string }) =>
        fetch(`/api/vehicles/${v.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'broken' }),
        }),
      ),
    )
  })

  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow.getByRole('link')).not.toHaveText('')
  await firstRow.getByRole('link').click()

  await page.getByRole('button', { name: 'Assign' }).click()
  await expect(page.getByText('No drivers with an available van vehicle right now.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirm assignment' })).toBeDisabled()
})

test('assigning a pending delivery (with available matching vehicles) updates its status and shows a toast', async ({
  page,
}) => {
  await page.goto('/deliveries')
  await expect(page.getByRole('columnheader', { name: 'Delivery ID' })).toBeVisible()

  // Find a delivery for which at least one available driver's own assigned
  // vehicle matches the required type (the seeded dataset guarantees cars/vans
  // do, but not every type), by asking the mock API directly rather than
  // guessing from the UI.
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

  await page.goto(`/deliveries/${target}`)
  await page.getByRole('button', { name: 'Assign' }).click()
  await page.getByRole('combobox', { name: 'Driver' }).click()
  await page.getByRole('option').first().click()
  await page.getByRole('button', { name: 'Confirm assignment' }).click()

  await expect(page.getByText(/assigned successfully/)).toBeVisible()
  // Assignment moves the delivery straight to 'in transit' — there is no
  // separate 'assigned but not yet moving' state to start from.
  await expect(page.getByRole('button', { name: 'Mark delivered' })).toBeVisible()
})
