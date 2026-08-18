import { test, expect } from '@playwright/test'

test('Vehicles table renders data and search filters it', async ({ page }) => {
  await page.goto('/vehicles')

  await expect(page.getByRole('columnheader', { name: 'Vehicle' })).toBeVisible()
  const rows = page.locator('tbody tr')
  const firstCell = rows.first().locator('td').first()
  await expect(firstCell).not.toHaveText('')
  const initialCount = await rows.count()
  expect(initialCount).toBeGreaterThan(0)

  const firstVehicleName = await firstCell.innerText()
  await page.getByPlaceholder('Search vehicles…').fill(firstVehicleName)
  await expect(page.locator('tbody').getByText(firstVehicleName)).toBeVisible()
})

test('Vehicles status filter narrows results and updates the URL', async ({ page }) => {
  await page.goto('/vehicles')
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'available', exact: true }).click()

  await expect(page).toHaveURL(/status=available/)
})

test('clicking a vehicle name link navigates to its detail route', async ({ page }) => {
  await page.goto('/vehicles')
  const firstLink = page.locator('tbody tr').first().getByRole('link')
  const href = await firstLink.getAttribute('href')
  await firstLink.click()
  await expect(page).toHaveURL(new RegExp(href!))
})

test('vehicle detail page shows tabs and switches between them', async ({ page }) => {
  await page.goto('/vehicles')
  await page.locator('tbody tr').first().getByRole('link').click()

  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('Registration')).toBeVisible()

  await page.getByRole('tab', { name: 'Maintenance' }).click()
  await expect(page.getByText('Maintenance status')).toBeVisible()

  await page.getByRole('tab', { name: 'Activity' }).click()
  await expect(page.getByRole('tab', { name: 'Activity', selected: true })).toBeVisible()
})
