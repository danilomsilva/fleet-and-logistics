import { test, expect } from '@playwright/test'

test('Services table renders and the status filter narrows results', async ({ page }) => {
  await page.goto('/services')
  await expect(page.getByRole('columnheader', { name: 'Record ID' })).toBeVisible()

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('menuitemradio', { name: 'Due', exact: true }).click()
  await expect(page).toHaveURL(/status=due/)
})

test('starting a service record moves it to in progress, then completing it finishes the flow', async ({
  page,
}) => {
  await page.goto('/services')
  await expect(page.getByRole('columnheader', { name: 'Record ID' })).toBeVisible()

  const target = await page.evaluate(async () => {
    const res = await fetch('/api/services?pageSize=200')
    const records = (await res.json()).data
    const pending = records.filter((r: { status: string }) => r.status !== 'completed')
    const startable = records.filter(
      (r: { status: string }) => r.status === 'scheduled' || r.status === 'due',
    )
    const isOnlyPendingForVehicle = (r: { vehicleId: string }) =>
      pending.filter((o: { vehicleId: string }) => o.vehicleId === r.vehicleId).length === 1
    const record = startable.find(isOnlyPendingForVehicle)
    if (!record) return null

    const vehicle = await fetch(`/api/vehicles/${record.vehicleId}`).then((r) => r.json())
    if (!vehicle.driverId) {
      const drivers = await fetch('/api/drivers?pageSize=1').then((r) => r.json())
      await fetch(`/api/vehicles/${record.vehicleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...vehicle, driverId: drivers.data[0].id }),
      })
    }

    return { recordId: record.id as string, vehicleId: record.vehicleId as string }
  })
  expect(target).not.toBeNull()
  const { recordId, vehicleId } = target!

  // In-app link navigation (not page.goto) — a full reload would reset the
  // in-memory mock backend and undo the driver assignment made above.
  await page.getByRole('link', { name: recordId }).click()

  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText(/started/)).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate((id) => fetch(`/api/vehicles/${id}`).then((r) => r.json()), vehicleId),
    )
    .toMatchObject({ status: 'service' })

  await page.getByRole('button', { name: 'Mark complete' }).click()
  await expect(page.getByText(/marked complete/)).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate((id) => fetch(`/api/vehicles/${id}`).then((r) => r.json()), vehicleId),
    )
    .toMatchObject({ status: 'available', serviceStatus: 'up_to_date' })
})

test('adding, editing, and deleting a service record works end to end', async ({ page }) => {
  await page.goto('/services')
  await expect(page.getByRole('columnheader', { name: 'Record ID' })).toBeVisible()

  // Add
  await page.getByRole('button', { name: 'Add Service' }).click()
  const addDialog = page.getByRole('dialog')
  await expect(addDialog.getByRole('heading', { name: 'Add Service Record' })).toBeVisible()
  await addDialog.getByRole('combobox', { name: 'Vehicle' }).click()
  await page.getByRole('option').first().click()
  await addDialog.getByLabel('Scheduled date').fill('2026-09-01')
  await addDialog.getByLabel('Description').fill('E2E Test Service')
  await addDialog.getByRole('button', { name: 'Add Record' }).click()
  await expect(page.getByText('Service record added.')).toBeVisible()

  await page.getByPlaceholder('Search descriptions…').fill('E2E Test Service')
  await expect(page.locator('tbody tr')).toHaveCount(1)

  // Edit
  await page.locator('tbody tr').first().getByRole('link').first().click()
  await expect(page.getByText('E2E Test Service')).toBeVisible()
  await page.getByRole('button', { name: 'Edit' }).click()
  const editDialog = page.getByRole('dialog')
  await editDialog.getByLabel('Description').fill('E2E Test Service (Edited)')
  await editDialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText(/updated\./)).toBeVisible()
  await expect(page.getByText('E2E Test Service (Edited)')).toBeVisible()

  // Delete
  await page.getByRole('button', { name: 'Delete' }).click()
  const confirmDialog = page.getByRole('alertdialog')
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText(/deleted\./)).toBeVisible()
  await expect(page).toHaveURL('/services')
})
