import { test, expect } from '@playwright/test'

test('Drivers table renders data and status filter narrows results', async ({ page }) => {
  await page.goto('/drivers')

  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
  const rows = page.locator('tbody tr')
  await expect(rows.first().locator('td').first()).not.toHaveText('')

  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'available', exact: true }).click()
  await expect(page).toHaveURL(/status=available/)
})

test('driver detail page shows tabs and switches between them', async ({ page }) => {
  await page.goto('/drivers')
  await page.locator('tbody tr').first().getByRole('link').click()

  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('Availability')).toBeVisible()

  await page.getByRole('tab', { name: "Today's deliveries" }).click()
  await expect(page.getByRole('tab', { name: "Today's deliveries", selected: true })).toBeVisible()

  await page.getByRole('tab', { name: 'Activity' }).click()
  await expect(page.getByRole('tab', { name: 'Activity', selected: true })).toBeVisible()
})
