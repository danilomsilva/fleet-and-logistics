import { test, expect } from '@playwright/test'

test('Deliveries table renders and filters are reflected in the URL and persist on reload', async ({
  page,
}) => {
  await page.goto('/deliveries')
  await expect(page.getByRole('columnheader', { name: 'Delivery ID' })).toBeVisible()

  await page.getByRole('combobox', { name: 'Filter by status' }).click()
  await page.getByRole('option', { name: 'Pending', exact: true }).click()
  await expect(page).toHaveURL(/status=pending/)

  await page.reload()
  await expect(page).toHaveURL(/status=pending/)
  await expect(page.getByRole('combobox', { name: 'Filter by status' })).toContainText('Pending')
})

test('assign dialog shows a clear message when no matching vehicles are available', async ({
  page,
}) => {
  await page.goto('/deliveries?status=pending')
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
  await expect(page.getByText('No available van vehicles right now.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirm assignment' })).toBeDisabled()
})

test('assigning a pending delivery (with available matching vehicles) updates its status and shows a toast', async ({
  page,
}) => {
  await page.goto('/deliveries')
  await expect(page.getByRole('columnheader', { name: 'Delivery ID' })).toBeVisible()

  // Find a pending delivery whose required vehicle type actually has available
  // stock (the seeded dataset guarantees cars/vans do, but not every type), by
  // asking the mock API directly rather than guessing from the UI.
  const target = await page.evaluate(async () => {
    const deliveriesRes = await fetch('/api/deliveries?status=pending&pageSize=200')
    const deliveries = (await deliveriesRes.json()).data
    for (const delivery of deliveries) {
      const vehiclesRes = await fetch(
        `/api/vehicles?status=available&type=${delivery.requiredVehicleType}&pageSize=1`,
      )
      if ((await vehiclesRes.json()).total > 0) return delivery.id
    }
    return null
  })
  expect(target).not.toBeNull()

  await page.goto(`/deliveries/${target}`)
  await page.getByRole('button', { name: 'Assign' }).click()
  await page.getByRole('combobox', { name: 'Driver' }).click()
  await page.getByRole('option').first().click()
  await page.getByRole('combobox', { name: 'Vehicle' }).click()
  await page.getByRole('option').first().click()
  await page.getByRole('button', { name: 'Confirm assignment' }).click()

  await expect(page.getByText(/assigned successfully/)).toBeVisible()
})

test('selecting rows shows a bulk-action bar and cancelling deliveries updates their status', async ({
  page,
}) => {
  await page.goto('/deliveries?status=pending')
  await expect(page.getByRole('columnheader', { name: 'Delivery ID' })).toBeVisible()

  const rows = page.locator('tbody tr')
  await expect(rows.first().getByRole('link')).not.toHaveText('')

  await rows.first().getByRole('checkbox', { name: 'Select row' }).click()
  await expect(page.getByText('1 selected')).toBeVisible()

  await page.getByRole('button', { name: 'Cancel selected' }).click()
  await expect(page.getByText(/cancelled/)).toBeVisible()
})

test('starting an assigned delivery moves it to in transit', async ({ page }) => {
  await page.goto('/deliveries?status=assigned')
  const rows = page.locator('tbody tr')
  await expect(rows.first().getByRole('link')).not.toHaveText('')
  await rows.first().getByRole('link').click()

  await page.getByRole('button', { name: 'Start delivery' }).click()

  await expect(page.getByText(/started/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mark delivered' })).toBeVisible()
})
