import { test, expect } from '@playwright/test'

test('Dispatch shows the map and the unassigned deliveries panel', async ({ page }) => {
  await page.goto('/dispatch')
  await expect(page.getByRole('heading', { name: 'Dispatch' })).toBeVisible()
  await expect(page.getByText('Unassigned deliveries')).toBeVisible()
  await expect(page.getByRole('img', { name: /Map of fleet vehicles/ })).toBeVisible()
})

test('assigning a delivery through the wizard walks driver -> vehicle -> review and confirms', async ({
  page,
}) => {
  await page.goto('/dispatch')
  await expect(page.getByText('Unassigned deliveries')).toBeVisible()

  // Pick a pending delivery whose required vehicle type actually has
  // available stock (not every type does in the seeded dataset), the same
  // way e2e/deliveries.spec.ts does, so the vehicle step never lands empty.
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

  const row = page.locator('li', { hasText: target! })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: 'Assign' }).click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('Driver', { exact: true })).toBeVisible()

  const driverButtons = page.getByRole('dialog').locator('ul button')
  await expect(driverButtons.first()).toBeVisible()
  await driverButtons.first().click()

  await expect(page.getByText('Vehicle', { exact: true })).toBeVisible()
  const vehicleButtons = page.getByRole('dialog').locator('ul button')
  await expect(vehicleButtons.first()).toBeVisible()
  await vehicleButtons.first().click()

  await expect(page.getByText('Review', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm assignment' }).click()

  await expect(page.getByText(/assigned successfully/)).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})
