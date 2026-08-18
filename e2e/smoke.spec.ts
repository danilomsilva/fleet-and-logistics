import { test, expect } from '@playwright/test'

test('app boots and renders the Dashboard by default', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
})

test('sidebar navigation switches pages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Vehicles' }).click()
  await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible()
  await expect(page).toHaveURL('/vehicles')
})
