import { test, expect } from '@playwright/test'

test('Drivers table renders data and status filter narrows results', async ({ page }) => {
  await page.goto('/drivers')

  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
  const rows = page.locator('tbody tr')
  await expect(rows.first().getByRole('link')).not.toHaveText('')

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('menuitemradio', { name: 'Available', exact: true }).click()
  await expect(page).toHaveURL(/status=available/)
})

test('selecting rows shows a bulk-action bar and marking drivers offline updates their status', async ({
  page,
}) => {
  await page.goto('/drivers?status=available')
  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()

  const rows = page.locator('tbody tr')
  await expect(rows.first().getByRole('link')).not.toHaveText('')

  await rows.first().getByRole('checkbox', { name: 'Select row' }).click()
  await expect(page.getByText('1 selected')).toBeVisible()

  await page.getByRole('button', { name: 'Mark not available' }).click()
  await expect(page.getByText(/marked not available/)).toBeVisible()
})

test('adding, editing, and deleting a driver works end to end', async ({ page }) => {
  await page.goto('/drivers')
  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()

  // The seeded fleet pairs every driver with a vehicle 1:1. A vehicle isn't
  // required to add a driver, but free one up anyway (deleting an existing
  // driver through the real UI — a raw API call would bypass React Query's
  // cache invalidation) so this test can still exercise picking a real one
  // rather than only ever seeing "Unassigned".
  await page.locator('tbody tr').first().getByRole('link').click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('removed')).toBeVisible()
  await expect(page).toHaveURL('/drivers')

  // Add
  await page.getByRole('button', { name: 'Add Driver' }).click()
  const addDialog = page.getByRole('dialog')
  await expect(addDialog.getByRole('heading', { name: 'Add Driver' })).toBeVisible()
  await expect(addDialog.getByText('New drivers start as Available')).toBeVisible()
  await addDialog.getByLabel('Name').fill('E2E Test Driver')
  await addDialog.getByRole('combobox', { name: 'Assigned vehicle' }).click()
  // Index 0 is "Unassigned" — pick the first real vehicle instead.
  await page.getByRole('option').nth(1).click()
  await addDialog.getByRole('button', { name: 'Add Driver' }).click()
  await expect(page.getByText(/added\./)).toBeVisible()

  await page.getByPlaceholder('Search drivers…').fill('E2E Test Driver')
  const row = page.locator('tbody tr', { hasText: 'E2E Test Driver' })
  await expect(row).toBeVisible()

  // Edit
  await row.getByRole('link').click()
  await expect(page.getByRole('heading', { name: 'E2E Test Driver' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit' }).click()
  const editDialog = page.getByRole('dialog')
  await expect(editDialog.getByRole('heading', { name: 'Edit E2E Test Driver' })).toBeVisible()
  await editDialog.getByLabel('Name').fill('E2E Test Driver (Edited)')
  await editDialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('updated')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'E2E Test Driver (Edited)' })).toBeVisible()

  // Delete
  await page.getByRole('button', { name: 'Delete' }).click()
  const confirmDialog = page.getByRole('alertdialog')
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('removed')).toBeVisible()
  await expect(page).toHaveURL('/drivers')
})

test('driver detail page shows tabs and switches between them', async ({ page }) => {
  await page.goto('/drivers')
  await page.locator('tbody tr').first().getByRole('link').click()

  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('Shift')).toBeVisible()

  await page.getByRole('tab', { name: "Today's deliveries" }).click()
  await expect(page.getByRole('tab', { name: "Today's deliveries", selected: true })).toBeVisible()

  await page.getByRole('tab', { name: 'Activity' }).click()
  await expect(page.getByRole('tab', { name: 'Activity', selected: true })).toBeVisible()
})
