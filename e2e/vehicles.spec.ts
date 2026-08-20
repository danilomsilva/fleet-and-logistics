import { test, expect } from '@playwright/test'

test('Vehicles table renders data and search filters it', async ({ page }) => {
  await page.goto('/vehicles')

  await expect(page.getByRole('columnheader', { name: 'Vehicle' })).toBeVisible()
  const rows = page.locator('tbody tr')
  const firstNameLink = rows.first().getByRole('link')
  await expect(firstNameLink).not.toHaveText('')
  const initialCount = await rows.count()
  expect(initialCount).toBeGreaterThan(0)

  const firstRegistration = await rows.first().locator('td').nth(2).innerText()
  await page.getByPlaceholder('Search vehicles…').fill(firstRegistration)
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody').getByText(firstRegistration)).toBeVisible()
})

test('Vehicles status filter narrows results and updates the URL', async ({ page }) => {
  await page.goto('/vehicles')
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Available', exact: true }).click()

  await expect(page).toHaveURL(/status=available/)
})

test('clicking a vehicle name link navigates to its detail route', async ({ page }) => {
  await page.goto('/vehicles')
  const firstLink = page.locator('tbody tr').first().getByRole('link')
  const href = await firstLink.getAttribute('href')
  await firstLink.click()
  await expect(page).toHaveURL(new RegExp(href!))
})

test('selecting rows shows a bulk-action bar and marking vehicles broken updates their status', async ({
  page,
}) => {
  await page.goto('/vehicles?status=available')
  await expect(page.getByRole('columnheader', { name: 'Vehicle' })).toBeVisible()

  const rows = page.locator('tbody tr')
  await expect(rows.first().getByRole('link')).not.toHaveText('')

  await rows.first().getByRole('checkbox', { name: 'Select row' }).click()
  await expect(page.getByText('1 selected')).toBeVisible()

  await page.getByRole('button', { name: 'Mark broken' }).click()
  await expect(page.getByText(/marked broken/)).toBeVisible()
})

test('adding, editing, and deleting a vehicle works end to end', async ({ page }) => {
  await page.goto('/vehicles')
  await expect(page.getByRole('columnheader', { name: 'Vehicle' })).toBeVisible()

  // Add
  await page.getByRole('button', { name: 'Add vehicle' }).click()
  const addDialog = page.getByRole('dialog')
  await expect(addDialog.getByRole('heading', { name: 'Add vehicle' })).toBeVisible()
  await addDialog.getByLabel('Name').fill('E2E Test Van')
  await addDialog.getByLabel('Registration').fill('26-E2E-1')
  await addDialog.getByRole('button', { name: 'Add vehicle' }).click()
  await expect(page.getByText('added to the fleet')).toBeVisible()

  await page.getByPlaceholder('Search vehicles…').fill('E2E Test Van')
  const row = page.locator('tbody tr', { hasText: 'E2E Test Van' })
  await expect(row).toBeVisible()

  // Edit
  await row.getByRole('link').click()
  await expect(page.getByRole('heading', { name: 'E2E Test Van' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit' }).click()
  const editDialog = page.getByRole('dialog')
  await expect(editDialog.getByRole('heading', { name: 'Edit E2E Test Van' })).toBeVisible()
  await editDialog.getByLabel('Name').fill('E2E Test Van (Edited)')
  await editDialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('updated')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'E2E Test Van (Edited)' })).toBeVisible()

  // Delete
  await page.getByRole('button', { name: 'Delete' }).click()
  const confirmDialog = page.getByRole('alertdialog')
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('removed from the fleet')).toBeVisible()
  await expect(page).toHaveURL('/vehicles')
})

test('vehicle detail page shows tabs and switches between them', async ({ page }) => {
  await page.goto('/vehicles')
  await page.locator('tbody tr').first().getByRole('link').click()

  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('Registration')).toBeVisible()

  await page.getByRole('tab', { name: 'Service' }).click()
  await expect(page.getByText('Service status')).toBeVisible()

  await page.getByRole('tab', { name: 'Activity' }).click()
  await expect(page.getByRole('tab', { name: 'Activity', selected: true })).toBeVisible()
})
